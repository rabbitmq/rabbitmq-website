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

### Install with generated certificates

Without cert-manager installed, you will need to generate certificates used by admission webhooks yourself and include them in the operator and webhooks manifests.

Download the latest release manifest https://github.com/rabbitmq/messaging-topology-operator/releases/latest/download/messaging-topology-operator.yaml.

The Messaging Topology Operator has multiple [admission webhooks](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/).
You need to generate the webhook certificate and place it in multiple places in the downloaded release manifest:

1. Generate certificates for the Webhook. Certificates must be valid for webhook-service.rabbitmq-system.svc. webhook-service is the name
of the webhook service object defined in release manifest messaging-topology-operator.yml. rabbitmq-system is the namespace of the service.
2. Create a k8s secret object with the name webhook-server-cert in namespace rabbitmq-system. The secret object must contain following keys: ca.crt, tls.key, and tls.key, and
it will be mounted to the operator container, where all webhooks will run from. For example:
    <pre class="lang-bash">
    apiVersion: v1
    kind: Secret
    type: kubernetes.io/tls
    metadata:
      name: webhook-server-cert
      namespace: rabbitmq-system
    data:
      ca.crt: # ca cert that can be used to validate the webhook's server certificate
      tls.crt: # generated certificate
      tls.key: # generated key
    </pre>

Then, to install the Operator, run the following command:

<pre class="lang-bash">
kubectl apply -f messaging-topology-operator.yaml
</pre>

At this point, the RabbitMQ Messaging Topology Operator is successfully installed.

If you want to install a specific version of the Operator, you will have to obtain the manifest link from the
[Operator Releases](https://github.com/rabbitmq/messaging-topology-operator/releases). We strongly recommend installing the latest version.