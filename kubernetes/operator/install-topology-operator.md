---
title: Installing RabbitMQ Messaging Topology Operator
---
# Installing RabbitMQ Messaging Topology Operator

## Overview {#overview}

This guide covers the installation of the RabbitMQ Messaging Topology Operator in a Kubernetes cluster.

## Compatibility {#compatibility}

The Operator requires

* Kubernetes 1.19 or above
* [RabbitMQ Cluster Operator](https://github.com/rabbitmq/cluster-operator) 1.7.0+ (if not, RabbitMQ Messaging Topology Operator will fail to start)

-----

## Installation {#installation}

There are two options for installing the Operator:

1. Install with cert-manager
2. Install generated certificates

### Install with cert-manager

First, install cert-manager version 1.2.0+ on your cluster. For example, for version 1.3.1, run:

```bash
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.3.1/cert-manager.yaml
```

Then, to install the Operator, run the following command:

```bash
kubectl apply -f https://github.com/rabbitmq/messaging-topology-operator/releases/latest/download/messaging-topology-operator-with-certmanager.yaml
```

### Install with Generated Certificates

Without cert-manager installed, you will need to generate certificates used by admission webhooks yourself and include them in the operator and webhooks manifests.

Download the latest release manifest https://github.com/rabbitmq/messaging-topology-operator/releases/latest/download/messaging-topology-operator.yaml.

The Messaging Topology Operator has multiple [admission webhooks](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/).
Their endpoints are TLS-enabled and require a webhook certificate that must be used in multiple places in the downloaded release manifest.

Sections below explain the steps involved into installing certificates for webhook admission.

#### Generate Key/Certificate Pair

First, generate one or more key/certificate pairs for webhook admission.
These certificates must be valid for `webhook-service.rabbitmq-system.svc`.

#### Create a K8S Secret

Next, create a Kubernetes secret object with the name of `webhook-server-cert` in the `rabbitmq-system` namespace.
The secret object must contain the following keys:

 * `ca.crt` (CA certificate)
 * `tls.crt` (leaf/webhook certificate)
 * `tls.key` (leaf/webhook private key)

The secret will be mounted to the Operator container, where all webhooks will run from.

For example:

```yaml
apiVersion: v1
kind: Secret
type: kubernetes.io/tls
metadata:
  name: webhook-server-cert
  namespace: rabbitmq-system
data:
  ca.crt: # ca cert that can be used to validate the webhook's server certificate
  tls.crt: # generated certificate
  tls.key: # generated private key
```

#### Use Generated Certificates in Release Manifest

Finally, add webhook's CA certificate to the release manifest, `messaging-topology-operator.yaml`.
There are multiple admission webhooks, one for each CRD type.

Look for keyword `clientConfig` in the manifest, and paste the webhook CA certificate under `clientConfig.caBundle`.
Because there are several webhooks, perform this action in several places.

The example below shows how to add a CA certificate to the `queues.rabbitmq.com` validating webhook:

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  annotations:
  name: validating-webhook-configuration
webhooks:
- admissionReviewVersions:
  - v1
  clientConfig:
    caBundle: # generated ca certificate goes in here
    service:
      name: webhook-service
      namespace: rabbitmq-system
      path: /validate-rabbitmq-com-v1beta1-queue
  failurePolicy: Fail
  name: vqueue.kb.io
  rules:
  - apiGroups:
    - rabbitmq.com
...```


Then, to install the Operator, run the following command:

```bash
kubectl apply -f messaging-topology-operator.yaml
```

At this point, the RabbitMQ Messaging Topology Operator is successfully installed.

### Using a non-default Kubernetes internal domain {#non-default-k8s-domain}

By default, Kubernetes internal domain name is `.cluster.local`. This can be configured
in `kubeadm` to be something else e.g. `my.cluster.domain`. In such cases, the Messaging
Topology Operator can append the domain name to the connection strings it uses to interact
with RabbitMQ.

To configure the Messaging Topology Operator to append the domain name in the connection string,
set the environment variable `MESSAGING_DOMAIN_NAME` to your domain name e.g. `".my.cluster.domain"`.

To set this environment variable:

- Download the installation manifest from the [releases](https://github.com/rabbitmq/messaging-topology-operator/releases)
- Open the manifest and search for the Deployment with name `messaging-topology-operator`
- Add a new element to the `env` list, with name `MESSAGING_DOMAIN_NAME` and value your domain name

The manifest related to the `Deployment` should look similar to this:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  [...]
  name: messaging-topology-operator
  namespace: rabbitmq-system
spec:
  template:
    [...]
    spec:
      containers:
      - command:
        - /manager
        env:
        - name: OPERATOR_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: MESSAGING_DOMAIN_NAME
          value: "my.cluster.domain"
```

Apply the edited manifest. Once the Pod has applied the changes, subsequent HTTP API requests to
RabbitMQ will append the domain name to the connection string.

### Modifying the RabbitMQ Messaging Topology Operator Default Configuration

This information describes how to modify the configuration of the RabbitMQ Messaging Topology Operator
in a Kubernetes cluster.

To change the configuration, add or update the configuration environment variables
by editing the Topology Operator deployment manifest. This is the YAML manifest artefact that is released
with every new version of the RabbitMQ Cluster Operator on GitHub.
The environment variables that can be set are listed
in the table in [Topology Operator Environment Variables](#parameters).

#### Parameters {#parameters}

The following table listes the Topology Operator environment variables that are available to set in the deployment manifest.

<table>
  <tr>
    <th>
      Variable Name
    </th>
    <th>
      Effect when Set
    </th>
    <th>
      Effect when not Set
    </th>
  </tr>
  <tr>
    <td>
      OPERATOR_SCOPE_NAMESPACE
    </td>
    <td>
      Namespace, or list of namespaces, which the operator will reconcile and watch RabbitmqClusters (independent of installation namespace).
      Use a comma separator, without spaces e.g. "project-1,project-2,rabbitmq-testing"
    </td>
    <td>
      All namespaces are watched and reconciled
    </td>
  </tr>
  <tr>
    <td>
      ENABLE_DEBUG_PPROF
    </td>
    <td>
      The default value is false because this variable should NOT be used in production. When it is set to true, it exposes a set of debug endpoints
      on the Operator Pod's metrics port for CPU and [memory profiling of the Operator with pprof](./debug-operator).
    </td>
    <td>
      The pprof debug endpoint will not be exposed on the Operator Pod.
    </td>
  </tr>
  <tr>
    <td>
      SYNC_PERIOD
    </td>
    <td>
      Configure the operator to reconcile all owned objects periodically. It accepts string values with a time suffix e.g. "15m". It accepts any value
      parseable by <a href="https://pkg.go.dev/time#ParseDuration" target="_blank">time.ParseDuration</a> function. By default, sync period uses the library
      default of 10 hours. To disable periodic reconciliation, set the value to `"0"`.
    </td>
    <td>
      Reconciliation will only happen when a resource is updated.
    </td>
  </tr>
  <tr>
    <td>
      LEASE_DURATION
    </td>
    <td>
      Time, in seconds, that non-leader candidates will wait to force acquire leadership. This is measured against time of last observed ack.
      Default is 15 seconds. The value must be a string e.g. `"30"`.
    </td>
    <td>
      Default value is set to 15 seconds.
    </td>
  </tr>
  <tr>
    <td>
      RENEW_DEADLINE
    </td>
    <td>
      Renew deadline is the duration that the acting controlplane will retry refreshing leadership before giving up. Default is 10 seconds.
      The value must be a string e.g. `"10"`.
    </td>
    <td>
      Default value is set to 10 seconds.
    </td>
  </tr>
  <tr>
    <td>
      RETRY_PERIOD
    </td>
    <td>
      Retry period is the duration the LeaderElector clients should wait between tries of actions. Default is 2 seconds.
      The value must be a string e.g. `"3"`.
    </td>
    <td>
      Default value is set to 2 seconds.
    </td>
  </tr>
</table>

### Older Operator Versions

To install a specific version of the Operator, obtain the manifest link from the
[Operator Releases](https://github.com/rabbitmq/messaging-topology-operator/releases).
Using the latest version is strongly recommended.
