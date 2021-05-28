# Installing VMware Tanzu RabbitMQ for Kubernetes

Before you install, you will require the following:

* A running Kubernetes cluster
* The Carvel toolchain installed on your system
  * This can be installed by either visiting the [Carvel website](https://carvel.dev/#install) or installing the following components from TanzuNet:
    * [imgpkg](https://network.pivotal.io/products/imgpkg/)
    * [kapp](https://network.pivotal.io/products/kapp/)
    * [kbld](https://network.pivotal.io/products/kbld/)
    * [ytt](https://network.pivotal.io/products/ytt/)

## Setup

### Installing on your registry
If you haven't already, download the Tanzu RabbitMQ release tar file.

You must then place this tar file on the filesystem of a machine within the network you are hosting your registry. On that machine, you can load the tarball into your registry by running:
<pre class="lang-bash">
imgpkg copy --to-repo your.company.domain/registry/tanzu-rabbitmq-bundle --tar tanzu-rabbitmq-1.1.0.tar
</pre>

On the machine targeting the Kubernetes cluster, you can now use this bundle by running:
<pre class="lang-bash">
imgpkg pull -b your.company.domain/registry/tanzu-rabbitmq-bundle:1.1.0 -o /your/output/directory
cd /your/output/directory
</pre>

### Creating a namespace
Create `rabbitmq-system` namespace by running:
<pre class="lang-bash">
kubectl create namespace rabbitmq-system
</pre>

### Providing imagePullSecrets
Since your cluster will be pulling images from your registry, you will need to provide `imagePullSecrets` in order to access those images.

First, create a registry credential Secret named `tanzu-registry-creds` following
[these instructions](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#create-a-secret-by-providing-credentials-on-the-command-line).

You will need to create this secret, with this exact name, in each namespace you plan on deploying RabbitmqClusters, as well as the `rabbitmq-system` namespace.

For example, if you plan on creating RabbitmqClusters on just the `default` namespace, you must create the secret on the `default` and `rabbitmq-system` namespaces. Since you are already
authenticated with the registry, you can simply mount your local Docker authentication credentials as a Secret:
<pre class="lang-bash">
AUTH_TOKEN="$(cat $HOME/.docker/config.json | jq -r ".auths[\"$MY_PRIVATE_REGISTRY\"].auth")"
kubectl create secret generic tanzu-registry-creds \
    -n default \
    --type=kubernetes.io/dockerconfigjson \
    --from-literal=.dockerconfigjson="{\"auths\":{\"$MY_PRIVATE_REGISTRY\":{\"auth\":\"$AUTH_TOKEN\"}}}"
kubectl create secret generic tanzu-registry-creds \
    -n rabbitmq-system \
    --type=kubernetes.io/dockerconfigjson \
    --from-literal=.dockerconfigjson="{\"auths\":{\"$MY_PRIVATE_REGISTRY\":{\"auth\":\"$AUTH_TOKEN\"}}}"
</pre>

## Installing the bundle

You now have two options for installing the components of this product:

1. (Recommended) Install using cert-manager
2. Install using manually created Certificates

### Option 1 (Recommended): Install using cert-manager

First, install Cert-manager version 1.2.0+ on your cluster. For example, for version 1.3.1, run:
<pre class="lang-bash">
kbld -f https://github.com/jetstack/cert-manager/releases/download/v1.3.1/cert-manager.yaml | kapp deploy -y -a cert-manager -f-
</pre>

You can now install the RabbitMQ operators by running:
<pre class="lang-bash">
ytt -f manifests/cluster-operator.yml -f manifests/messaging-topology-operator-with-certmanager.yaml -f overlays/operator-deployments.yml | kbld -f .imgpkg/images.yml -f config/ -f- | kapp -y deploy -a rabbitmq-operator -f -
</pre>

### Option 2. Install using manually created Certificates

If you do not wish to use cert-manager to generate TLS certificates for the product, you can generate them manually instead.

You will need to generate TLS certificates used for admission webhooks in the cluster through whichever tool you prefer.
Certificates must be valid for `webhook-service.rabbitmq-system.svc`.

Create a manifest for a Kubernetes Secret with name `webhook-server-cert` in namespace `rabbitmq-system`. The secret object must contain following keys: `ca.crt`, `tls.key`, and `tls.key`. For example:
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
  tls.key: # generated key
</pre>
You do not yet need to deploy this Secret.

Edit the Messaging Topology Operator manifest within the bundle, with an editor of your choice:
<pre class="lang-bash">
vim manifests/messaging-topology-operator.yaml
</pre>
You will need to replace the values of all `caBundle` keys in this file with the value of `ca.crt` in the Secret manifest you just created.

Finally, install the RabbitMQ operators by running:
<pre class="lang-bash">
ytt -f manifests/cluster-operator.yml -f manifests/messaging-topology-operator.yaml -f overlays/operator-deployments.yml | kbld -f .imgpkg/images.yml -f config/ -f $SECRET_PATH -f- | kapp -y deploy -a rabbitmq-operator -f -
</pre>

## Observability
At this point you may choose to setup observability on your cluster. To do so, you can follow the instructions [in the Cluster Operator repo](https://github.com/rabbitmq/cluster-operator/tree/v1.7.0/observability)
or the [RabbitMQ website](https://www.rabbitmq.com/kubernetes/operator/operator-monitoring.html).

## Deploying your RabbitmqClusters and Topology objects
Once this installation is complete, you can now create your RabbitMQ objects with the Carvel tooling. As long as you render the `overlays/rabbitmqcluster.yml` with the manifest of the `RabbitmqCluster` object,
the resultant cluster will use the bundled Tanzu RabbitMQ container image. For example, to create a simple RabbitmqCluster:
<pre class="lang-bash">
cat &lt;&lt;EOF &gt; rabbitmq.yaml
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: my-tanzu-rabbit
EOF
ytt -f rabbitmq.yaml -f overlays/rabbitmqcluster.yml | kbld -f- | kapp deploy -f- -a my-tanzu-rabbit -y
</pre>
