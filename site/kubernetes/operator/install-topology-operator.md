# Installing RabbitMQ Messaging Topology Operator

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers the installation of the RabbitMQ Messaging Topology Operator in a Kubernetes cluster.

## <a id='compatibility' class='anchor' href='#compatibility'>Compatibility</a>

The Operator requires

* Kubernetes 1.18 or above
* [RabbitMQ Cluster Operator](https://github.com/rabbitmq/cluster-operator) 1.7.0+ (if not, RabbitMQ Messaging Topology Operator will fail to start)

-----

## <a id='installation' class='anchor' href='#installation'>Installation</a>

There are two options for installing the Operator:

1. Install with cert-manager
2. Install generated certificates

### Install with cert-manager

First, install cert-manager version 1.2.0+ on your cluster. For example, for version 1.3.1, run:

<pre class="lang-bash">
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.3.1/cert-manager.yaml
</pre>

Then, to install the Operator, run the following command:

<pre class="lang-bash">
kubectl apply -f https://github.com/rabbitmq/messaging-topology-operator/releases/latest/download/messaging-topology-operator-with-certmanager.yaml
</pre>

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

<pre class="lang-yaml">
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
</pre>

#### Use Generated Certificates in Release Manifest

Finally, add webhook's CA certificate to the release manifest, `messaging-topology-operator.yaml`.
There are multiple admission webhooks, one for each CRD type.

Look for keyword `clientConfig` in the manifest, and paste the webhook CA certificate under `clientConfig.caBundle`.
Because there are several webhooks, perform this action in several places.

The example below shows how to add a CA certificate to the `queues.rabbitmq.com` validating webhook:

<pre class="lang-yaml">
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
...</pre>


Then, to install the Operator, run the following command:

<pre class="lang-bash">
kubectl apply -f messaging-topology-operator.yaml
</pre>

At this point, the RabbitMQ Messaging Topology Operator is successfully installed.

### Older Operator Versions

To install a specific version of the Operator, obtain the manifest link from the
[Operator Releases](https://github.com/rabbitmq/messaging-topology-operator/releases).
Using the latest version is strongly recommended.
