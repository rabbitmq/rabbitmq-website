# Installing RabbitMQ Cluster Kubernetes Operator in a Kubernetes cluster

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers the installation of RabbitMQ Cluster Kubernetes Operator in a Kubernetes cluster. This guide
was written using a GKE cluster, although any Kubernetes flavour should work.

There are two ways to install the RabbitMQ Cluster Kubernetes Operator:

 * Using a Helm chart
 * Using `kubectl` and YAML manifests

Regardless of the installation method chosen, download or clone the
[RabbitMQ Cluster Kubernetes Operator repository](https://github.com/rabbitmq/cluster-operator) and set it as
your current working directory.

## <a id='compatibility' class='anchor' href='#compatibility'>Compatibility</a>

- Kubernetes 1.16 or 1.17
- Kubernetes 1.18 is not fully tested and there might be incompatibilities
- [Community RabbitMQ Docker image](https://hub.docker.com/_/rabbitmq) 3.8.5+
    - Our Operator relies on some behaviour of the entry point script used in this image.

## <a id="using-helm-chart" class="anchor" href="#using-helm-chart">Using a Helm chart</a>

This topic describes how to install and configure RabbitMQ Cluster Kubernetes Operator using a Helm chart.

In most cases, using a Helm chart is the fastest way to install.
For more information about Helm charts, see the [Helm documentation](https://helm.sh/docs/topics/charts/).

### <a id='helm-prerequisites' class='anchor' href='#helm-prerequisites'>Prerequisites</a>

Before installing and configuring RabbitMQ Cluster Kubernetes Operator, the following must be installed and configured:

* **The Docker CLI:** For installation instructions,
see the [Docker documentation](https://docs.docker.com/install/).
* **The Helm CLI:** For installation instructions, see the [Helm documentation](https://helm.sh/docs/intro/install/).
* Your user should have permissions to create Namespace, Deployment and RBAC objects.

### High level steps

To install and configure RabbitMQ Cluster Kubernetes Operator using a Helm chart:

1. [Build and push the RabbitMQ Cluster Kubernetes Operator image](#build-image)
1. [Create a Values File](#helm-create-values)
1. [Helm Install](#helm-install-op)

### <a id='build-image' class='anchor' href='#build-image'>Build the RabbitMQ Cluster Kubernetes Operator image</a>

From the RabbitMQ Cluster Kubernetes Operator repository, run `docker build -t someregistry/cluster-operator:some-tag`. The value of `someregistry`
should be the address of an OCI compatible registry e.g. Docker Hub and `some-tag` should be a value to version the image.

Once the image is built, push it to the registry using `docker push someregistry/cluster-operator:some-tag`.

### <a id='helm-create-values' class='anchor' href='#helm-create-values'>Create a Values File</a>

To create a values file:

1. Display the chart values by running:

    <pre class='hljs lang-bash'>
    helm show values charts/operator/ > cluster-operator-values.yaml
    </pre>

1. Open the values file and adapt the values to match your environment.

    <pre class='lang-yaml'>
    global:
      imageRegistry: IMAGE-REGISTRY-URL
      imageUsername: USERNAME
      imagePassword: PASSWORD
    images:
      operator:
        name: IMAGE-REGISTRY-URL/PROJECT-NAME/cluster-operator
        tag: "VERSION-NUMBER"
    </pre>

    Where:

    * `IMAGE-REGISTRY-URL` is your image registry URL. This **should not** contain the image name.
    * `USERNAME` is the username for the image registry.
    * `PASSWORD` is the password for the image registry.
    * `PROJECT-NAME` is your project name.
    * `VERSION-NUMBER` is the tag used during build e.g. "some-tag".

    This is an example of a customized values file:

    <pre class='lang-yaml'>
    global:
      imageRegistry: someregistry.example.com
      imageUsername: myuser@example.com
      imagePassword: example-password
    images:
      operator:
        name: someregistry.example.com/some-project/cluster-operator
        tag: "0.1.0-build.1"
    </pre>


### <a id='helm-install-op' class='anchor' href='#helm-install-op'>Install RabbitMQ Cluster Kubernetes Operator</a>

To install the Operator using Helm:

1. Install the chart by running:

    <pre class='hljs lang-bash'>
    helm -n default install -f cluster-operator-values.yaml cluster-operator charts/operator/
    </pre>

    <p class="note">
      <strong>Note:</strong> Helm uses the option <code>-n default</code> to store a Kubernetes secret in the
      default namespace.
      Helm does this to avoid potential failures caused by kubectl referencing non-existing namespaces.
      <p>It is possible to use a different namespace if default is not available.</p>
    </p>

1. Verify that the output of the `helm install` command is similar to the example below.

    <pre class="lang-bash">helm -n default install -f cluster-operator-values.yaml cluster-operator charts/operator/
     # NAME: cluster-operator
     # LAST DEPLOYED: Tue Mar 31 16:13:05 2020
     # NAMESPACE: default
     # STATUS: deployed
     # REVISION: 1
     # TEST SUITE: None
    </pre>

1. Verify that RabbitMQ Cluster Kubernetes Operator Deployment and Pod are created in `rabbitmq-system` Namespace.

    <pre class="lang-bash">kubectl -n rabbitmq-system get deployment,pod
     # NAME                                        READY   UP-TO-DATE   AVAILABLE   AGE
     # deployment.apps/rabbitmq-cluster-operator   1/1     1            1           52s
     #
     # NAME                                             READY   STATUS    RESTARTS   AGE
     # pod/rabbitmq-cluster-operator-5dcbcc558c-br2t7   1/1     Running   0          52s
    </pre>

At this point, the RabbitMQ Cluster Kubernetes Operator is successfully installed. Check the [next steps](#next-steps) for
a guide on how to configure and deploy RabbitMQ instances.

-----

## <a id='using-kubectl-yaml' class='anchor' href='#using-kubectl-yaml'>Using kubectl and YAML</a>

This topic describes how to install and configure RabbitMQ Cluster Kubernetes Operator using Kubectl CLI and YAML manifests.

### High level steps

1. [Create the Namespace and Role-Based Access Control Objects](#namespace-rbac)
1. [(Optional) Configure Kubernetes Cluster Access to Private Images](#private-images)
1. [Build and push the image](#build-image-kctl)
1. [Install using kubectl](#deploy-op)

### <a id='namespace-rbac' class='anchor' href='#namespace-rbac'>Create the Namespace and Role-Based Access Control Objects</a>

To create the namespace and role-based access control (RBAC) objects:

1. Create a `rabbitmq-system` namespace by running:

    <pre class='hljs lang-bash'>
    kubectl create -f config/namespace/base/namespace.yaml
    </pre>

1. Create RBAC objects in the `rabbitmq-system` namespace by running:

    <pre class='hljs lang-bash'>
    kubectl -n rabbitmq-system create --kustomize config/rbac/
    </pre>

### <a id='private-images' class='anchor' href='#private-images'>(Optional) Configure Kubernetes Cluster Access to Private Images</a>

If you require authentication to pull images from your private image registry, you must authorize access to the
registry from the `rabbitmq-system` namespace.

To configure access to your private registry:

1. Create a secret for your private image registry by running:

    <pre class='hljs lang-bash'>
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
    <pre class="terminal">
    kubectl -n rabbitmq-system create secret \
    docker-registry rabbitmq-cluster-registry-access \
    --docker-server=docker.io/my-registry \
    --docker-username=my-username \
    --docker-password=example-password1
    </pre>

1. Update your service account by running:

    <pre class='hljs lang-bash'>
    kubectl -n rabbitmq-system patch serviceaccount \
    rabbitmq-cluster-operator -p '{"imagePullSecrets": [{"name": "rabbitmq-cluster-registry-access"}]}'
    </pre>

### <a id='build-image-kctl' class='anchor' href='#build-image-kctl'>Build and push the image</a>

From the RabbitMQ Cluster Kubernetes Operator repository, run `docker build -t someregistry/cluster-operator:some-tag`. The value of `someregistry`
should be the address of an OCI compatible registry e.g. Docker Hub and `some-tag` should be a value to version the image.

Once the image is built, push it to the registry using `docker push someregistry/cluster-operator:some-tag`.

### <a id='deploy-op' class='anchor' href='#deploy-op'>Install using kubectl</a>

Install the Custom Resource Definition (CRD) by running:

<pre class='lang-bash'>
kubectl create -f config/crd/bases/rabbitmq.com_rabbitmqclusters.yaml
</pre>

To deploy the Operator, adapt and run the following commands to your image registry:

<pre class='hljs lang-bash'>
cd config/manager/
kustomize edit set image 'controller=someregistry.example.com/my-project/cluster-operator:some-tag'
kustomize edit set nameprefix rabbitmq-cluster-
kustomize edit set namespace rabbitmq-system
kustomize build . | kubectl create -f -
cd -
</pre>

At this point, the RabbitMQ Cluster Kubernetes Operator is successfully installed. Check the [next steps](#next-steps) for
a guide on how to configure and deploy RabbitMQ instances.

-----

## <a id='next-steps'></a> Next steps

Once the RabbitMQ Cluster Kubernetes Operator Pod is running, head over to
[Using Kubernetes RabbitMQ Cluster Kubernetes Operator](/kubernetes/using-rabbitmq-cluster-operator.html)
for instructions on how to deploy RabbitMQ using a Kubernetes Custom Resource.


