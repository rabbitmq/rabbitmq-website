# Installing RabbitMQ Cluster Operator in a Kubernetes cluster

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers the installation of the [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/operator-overview.html) in a Kubernetes cluster.

## <a id='compatibility' class='anchor' href='#compatibility'>Compatibility</a>

The Operator requires

* Kubernetes 1.16 or 1.17
* [RabbitMQ DockerHub image](https://hub.docker.com/_/rabbitmq) 3.8.5+

There is a [known issue when deploying to Kubernetes 1.18](https://github.com/rabbitmq/cluster-operator/issues/230).

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
docker push {someregistry}/cluster-operator:{latest
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
