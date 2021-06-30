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

If you are planning to install the Messaging Topology Operator on Openshift, there are some additional steps you must take. For more imformation, see
[A note about installing on Openshift](#openshift).

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
  tls.key: # generated key</pre>

Then, to install the Operator, run the following command:

<pre class="lang-bash">
kubectl apply -f messaging-topology-operator.yaml
</pre>

At this point, the RabbitMQ Messaging Topology Operator is successfully installed.

If you want to install a specific version of the Operator, you will have to obtain the manifest link from the
[Operator Releases](https://github.com/rabbitmq/messaging-topology-operator/releases). We strongly recommend installing the latest version.

## <a id='openshift' class='anchor' href='#openshift'>A note about installing on Openshift</a>
Openshift uses arbitrarily assigned User IDs when running Pods. Each Openshift project is allocated a range of possible UIDs,
and by default Pods will fail if they are started running as a user outside of that range.

By default, the RabbitMQ Cluster Operator, Messaging Topology Operator & RabbitmqCluster Pods all run with fixed IDs. To deploy
on Openshift, it is necessary to override the Security Context for these Pods.

<strong>If you have [ytt](https://carvel.dev/ytt/) installed</strong>, you can simply run:
<pre class="lang-bash">ytt -f https://github.com/rabbitmq/messaging-topology-operator/releases/latest/download/$OPERATOR_MANIFEST -f https://raw.githubusercontent.com/rabbitmq/cluster-operator/main/hack/remove-operator-securityContext.yml | oc apply -f -</pre>
Depending on which path you take above, <code>$OPERATOR_MANIFEST</code> will be either `messaging-topology-operator-with-certmanager.yaml` or `messaging-topology-operator.yaml`.

This will use a YTT overlay to strip out the securityContext from the operator deployment, then apply the resultant manifest. The operator Pod will then run as the user chosen by Openshift.

<strong>If you do not have ytt</strong>, you will have to remove this manually. Download the installation manifest from the [release page in GitHub](https://github.com/rabbitmq/messaging-topology-operator/releases).

Remove the `securityContext` from the `Deployment` object named `messaging-topology-operator`:

<pre class="lang-yaml">
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/component: rabbitmq-operator
    app.kubernetes.io/name: messaging-topology-operator
    app.kubernetes.io/part-of: rabbitmq
  name: messaging-topology-operator
  namespace: rabbitmq-system
spec:
  ...
  template:
    ...
    spec:
      ...
      securityContext:   # Remove
        fsGroup: 1000    # Remove
        runAsGroup: 1000 # Remove
        runAsUser: 1000  # Remove</pre>

You can then run the installation command.
<pre class="lang-bash">
oc apply -f $OPERATOR_MANIFEST
# namespace/rabbitmq-system unchanged
# customresourcedefinition.apiextensions.k8s.io/bindings.rabbitmq.com created
# customresourcedefinition.apiextensions.k8s.io/exchanges.rabbitmq.com created
# customresourcedefinition.apiextensions.k8s.io/federations.rabbitmq.com created
# customresourcedefinition.apiextensions.k8s.io/permissions.rabbitmq.com created
# customresourcedefinition.apiextensions.k8s.io/policies.rabbitmq.com created
# customresourcedefinition.apiextensions.k8s.io/queues.rabbitmq.com created
# customresourcedefinition.apiextensions.k8s.io/schemareplications.rabbitmq.com created
# customresourcedefinition.apiextensions.k8s.io/shovels.rabbitmq.com created
# customresourcedefinition.apiextensions.k8s.io/users.rabbitmq.com created
# customresourcedefinition.apiextensions.k8s.io/vhosts.rabbitmq.com created
# serviceaccount/messaging-topology-operator created
# role.rbac.authorization.k8s.io/messaging-topology-leader-election-role created
# clusterrole.rbac.authorization.k8s.io/messaging-topology-manager-role created
# rolebinding.rbac.authorization.k8s.io/messaging-topology-leader-election-rolebinding created
# clusterrolebinding.rbac.authorization.k8s.io/messaging-topology-manager-rolebinding created
# service/webhook-service created
# deployment.apps/messaging-topology-operator created
# certificate.cert-manager.io/serving-cert created
# issuer.cert-manager.io/selfsigned-issuer created
# validatingwebhookconfiguration.admissionregistration.k8s.io/validating-webhook-configuration created</pre>
