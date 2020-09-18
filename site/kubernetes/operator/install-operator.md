# Installing RabbitMQ Cluster Operator in a Kubernetes cluster

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers the installation of the [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/operator-overview.html) in a Kubernetes cluster.

## <a id='compatibility' class='anchor' href='#compatibility'>Compatibility</a>

The Operator requires

* Kubernetes 1.16 or above
* [RabbitMQ DockerHub image](https://hub.docker.com/_/rabbitmq) 3.8.8+

-----

## <a id='installation' class='anchor' href='#installation'>Installation</a>

To install the Operator you need to clone the [cluster-operator](https://github.com/rabbitmq/cluster-operator/) repository and then create the necessary resources in the Kubernetes cluster.

The following steps should be sufficient for most environments:

<pre class="lang-bash">
git clone git@github.com:rabbitmq/cluster-operator.git
cd cluster-operator
kubectl create -f config/namespace/base/namespace.yaml
kubectl create -f config/crd/bases/rabbitmq.com_rabbitmqclusters.yaml
kubectl -n rabbitmq-system create --kustomize config/rbac/
kubectl -n rabbitmq-system create --kustomize config/manager/
</pre>

At this point, the RabbitMQ Cluster Kubernetes Operator is successfully installed.
Once the RabbitMQ Cluster Kubernetes Operator pod is running, head over to [Using Kubernetes RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/using-operator.html) for instructions on how to deploy RabbitMQ using a Kubernetes Custom Resource.

-----

### <a id='relocate-image' class='anchor' href='#relocate-image'>(Optional) Relocate the Image</a>

If you can't pull images from Docker Hub directly to your Kubernetes cluster, you need to relocate the images to your private registry first. The exact steps depend on your environment but will likely look like this:

<pre class="lang-bash">
docker pull rabbitmqoperator/rabbitmq-cluster-kubernetes-operator-dev:latest
docker tag rabbitmqoperator/rabbitmq-cluster-kubernetes-operator-dev:latest {someregistry}/rabbitmq-cluster-kubernetes-operator-dev:latest
docker push {someregistry}/cluster-operator:latest
</pre>

The value of `{someregistry}` should be the address of an OCI compatible registry.

You also need to update the deployment to use your private registry. Run the following command from the `cluster-operator/config/manager` folder **before** the last installation step:

<pre class="lang-bash">
kustomize edit set image 'controller={someregistry}/rabbitmq-cluster-kubernetes-operator-dev:latest'
</pre>

If you require authentication to pull images from your private image registry, you must [Configure Kubernetes Cluster Access to Private Images](#private-images).

### <a id='private-images' class='anchor' href='#private-images'>(Optional) Configure Kubernetes Cluster Access to Private Images</a>

If you relocated the image to a private registry and your registry requires authentication, you need to follow these steps to allow Kubernetes to pull the image.

<pre class="lang-bash">
kubectl -n rabbitmq-system create secret \
docker-registry rabbitmq-cluster-registry-access \
--docker-server=DOCKER-SERVER \
--docker-username=DOCKER-USERNAME \
--docker-password=DOCKER-PASSWORD
</pre>

Where:

+ `DOCKER-SERVER` is the server URL for your private image registry.
+ `DOCKER-USERNAME` is your username for your private image registry authentication.
+ `DOCKER-PASSWORD` is your password for your private image registry authentication.

For example:

<pre class="lang-bash">
kubectl -n rabbitmq-system create secret \
docker-registry rabbitmq-cluster-registry-access \
--docker-server=docker.io/my-registry \
--docker-username=my-username \
--docker-password=example-password1
</pre>

Now update your service account by running:

<pre class="lang-bash">
kubectl -n rabbitmq-system patch serviceaccount \
rabbitmq-cluster-operator -p '{"imagePullSecrets": [{"name": "rabbitmq-cluster-registry-access"}]}'
</pre>

### <a id='openshift' class='anchor' href='#openshift'>Installation on OpenShift</a>

The RabbitMQ cluster operator runs as user ID `1000` and RabbitMQ runs as user ID `999`.
By default OpenShift has security context constraints which disallow to create pods running with these user IDs.
To install the RabbitMQ cluster operator on OpenShift, you need to perform the following steps:

1. In above [installation steps](#installation), after creating the namespace via `kubectl create -f config/namespace/base/namespace.yaml` but before
creating the manager via `kubectl -n rabbitmq-system create --kustomize config/manager/`, change the following fields:

<pre class="lang-bash">
oc edit namespace rabbitmq-system
</pre>

<pre class="lang-yaml">
apiVersion: v1
kind: Namespace
metadata:
  annotations:
...
    openshift.io/sa.scc.supplemental-groups: 1000/1
    openshift.io/sa.scc.uid-range: 1000/1
</pre>

2. For every namespace where the RabbitMQ cluster custom resources will be created (here we assume `default` namespace), change the following fields:

<pre class="lang-bash">
oc edit namespace default
</pre>

<pre class="lang-yaml">
apiVersion: v1
kind: Namespace
metadata:
  annotations:
...
    openshift.io/sa.scc.supplemental-groups: 999/1
    openshift.io/sa.scc.uid-range: 999/1
</pre>
