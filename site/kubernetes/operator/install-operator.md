# Installing RabbitMQ Cluster Operator in a Kubernetes cluster

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers the installation of the [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/operator-overview.html) in a Kubernetes cluster.
If you are installing in OpenShift, follow the instructions in [Installation on OpenShift](#openshift) section.

## <a id='compatibility' class='anchor' href='#compatibility'>Compatibility</a>

The Operator requires

* Kubernetes 1.17 or above
* [RabbitMQ DockerHub image](https://hub.docker.com/_/rabbitmq) 3.8.8+

-----

## <a id='installation' class='anchor' href='#installation'>Installation</a>

To install the Operator, run the following command:

<pre class="lang-bash">
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
# namespace/rabbitmq-system created
# customresourcedefinition.apiextensions.k8s.io/rabbitmqclusters.rabbitmq.com created
# serviceaccount/rabbitmq-cluster-operator created
# role.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-role created
# clusterrole.rbac.authorization.k8s.io/rabbitmq-cluster-operator-role created
# rolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-rolebinding created
# clusterrolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-operator-rolebinding created
# deployment.apps/rabbitmq-cluster-operator created
</pre>

At this point, the RabbitMQ Cluster Kubernetes Operator is successfully installed.
Once the RabbitMQ Cluster Kubernetes Operator pod is running, head over to [Using Kubernetes RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/using-operator.html) for instructions on how to deploy RabbitMQ using a Kubernetes Custom Resource.

If you want to install a specific version of the Operator, you will have to obtain the manifest link from the
[Operator Releases](https://github.com/rabbitmq/cluster-operator/releases). Please note that releases prior to 0.46.0
do not have this manifest. We strongly recommend to install versions 0.46.0+

If you want to relocate the Operator image to a custom location, the section [Relocate the Image](#relocate-image)
has instructions to relocate the Operator image to a private registry.

### <a id='kubectl-plugin' class='anchor' href='#kubectl-plugin'>Installation using kubectl-rabbitmq plugin</a>

The `kubectl rabbitmq` plugin provides commands for managing RabbitMQ clusters.
The plugin can be installed using [krew](https://github.com/kubernetes-sigs/krew):

<pre class="lang-bash">
kubectl krew install rabbitmq
</pre>

To get the list of available commands, use:

<pre class="lang-bash">
kubectl rabbitmq help
# USAGE:
#   Install RabbitMQ Cluster Operator (optionally provide image to use a relocated image or a specific version)
#     kubectl rabbitmq install-cluster-operator [IMAGE]
# [...]
kubectl rabbitmq install-cluster-operator
# namespace/rabbitmq-system created
# customresourcedefinition.apiextensions.k8s.io/rabbitmqclusters.rabbitmq.com created
# serviceaccount/rabbitmq-cluster-operator created
# role.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-role created
# clusterrole.rbac.authorization.k8s.io/rabbitmq-cluster-operator-role created
# rolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-rolebinding created
# clusterrolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-operator-rolebinding created
# deployment.apps/rabbitmq-cluster-operator created
</pre>

-----

### <a id='relocate-image' class='anchor' href='#relocate-image'>(Optional) Relocate the Image</a>

If you can't pull images from Docker Hub directly to your Kubernetes cluster, you need to relocate the images to your private registry first. The exact steps depend on your environment but will likely look like this:

<pre class="lang-bash">
docker pull rabbitmqoperator/cluster-operator:{some-version}
docker tag rabbitmqoperator/cluster-operator:{some-version} {someregistry}/cluster-operator:{some-version}
docker push {someregistry}/cluster-operator:{some-version}
</pre>

The value of `{someregistry}` should be the address of an OCI compatible registry. The value of `{some-version}` is
a version number of the Cluster Operator.

If you require authentication to pull images from your private image registry, you must [Configure Kubernetes Cluster Access to Private Images](#private-images).

[Download the manifest](https://github.com/rabbitmq/cluster-operator/releases) from the release you are relocating and edit
the section in Deployment image. You can locate this section by `grep`'ing the string `image:`

<pre class="lang-bash">
grep -C3 image: releases/cluster-operator.yml
# [...]
# --
#           valueFrom:
#             fieldRef:
#               fieldPath: metadata.namespace
#         image: rabbitmqoperator/cluster-operator:0.49.0
#         name: operator
#         resources:
#           limits:
</pre>

### <a id='private-images' class='anchor' href='#private-images'>(Optional) Configure Kubernetes Cluster Access to Private Images</a>

If you relocated the image to a private registry and your registry requires authentication, you need to follow these steps to allow Kubernetes to pull the image.

First, create the Service Account that the Operator will use to run and to pull images:

<pre class="lang-yaml">
apiVersion: v1
kind: ServiceAccount
metadata:
  name: rabbitmq-cluster-operator
  namespace: rabbitmq-system
</pre>

Second, create a Secret with the credentials to pull from the private registry:

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

Now update the Operator Service Account by running:

<pre class="lang-bash">
kubectl -n rabbitmq-system patch serviceaccount \
rabbitmq-cluster-operator -p '{"imagePullSecrets": [{"name": "rabbitmq-cluster-registry-access"}]}'
</pre>

Please note that the name of the Operator Service Account is not configurable and it must be `rabbitmq-cluster-operator`.

### <a id='openshift' class='anchor' href='#openshift'>Installation on OpenShift</a>

The RabbitMQ cluster operator runs as user ID `1000`.
The RabbitMQ pod runs the RabbitMQ container as user ID `999` and an init container as user ID `0`.
By default OpenShift has security context constraints which disallow to create pods running with these user IDs.
To install the RabbitMQ cluster operator on OpenShift, you need to perform the following steps:

1. Download the installation manifest from the [release page in GitHub](https://github.com/rabbitmq/cluster-operator/releases).

    Edit the `Namespace` object named `rabbitmq-system` to include the following annotations:

    <pre class="lang-yaml">
    apiVersion: v1
    kind: Namespace
    metadata:
      annotations:
    ...
	openshift.io/sa.scc.supplemental-groups: 1000/1
	openshift.io/sa.scc.uid-range: 1000/1
    </pre>

2. Run the installation command.
  <pre class="lang-yaml">
  kubectl create -f cluster-operator.yml
  # namespace/rabbitmq-system created
  # customresourcedefinition.apiextensions.k8s.io/rabbitmqclusters.rabbitmq.com created
  # serviceaccount/rabbitmq-cluster-operator created
  # role.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-role created
  # clusterrole.rbac.authorization.k8s.io/rabbitmq-cluster-operator-role created
  # rolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-rolebinding created
  # clusterrolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-operator-rolebinding created
  # deployment.apps/rabbitmq-cluster-operator created</pre>

3. Create a Security Context Constraint that allows the RabbitMQ pod to have the capabilities `FOWNER` and `CHOWN`:
    <pre class="lang-bash">oc apply -f rabbitmq-scc.yml</pre>

    where `rabbitmq-scc.yml` contains:

    <pre class="lang-yaml">
    kind: SecurityContextConstraints
    apiVersion: security.openshift.io/v1
    metadata:
      name: rabbitmq-cluster
    allowPrivilegedContainer: false
    runAsUser:
      type: MustRunAsRange
    seLinuxContext:
      type: MustRunAs
    fsGroup:
      type: MustRunAs
    supplementalGroups:
      type: RunAsAny
    requiredDropCapabilities:
      - "ALL"
    allowedCapabilities:
      - "FOWNER"
      - "CHOWN"
    volumes:
      - "configMap"
      - "secret"
      - "persistentVolumeClaim"
      - "downwardAPI"
      - "emptyDir"
      - "projected"
    </pre>

4. For every namespace where RabbitMQ cluster custom resources will be created (here we assume `default` namespace), change the following fields:

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
        openshift.io/sa.scc.uid-range: 0-999
    </pre>

5. For every RabbitMQ cluster (here we assume the name `my-rabbitmq`) assign the previously created security context constraint to the cluster's service account.

    <pre class="lang-bash">
    oc adm policy add-scc-to-user rabbitmq-cluster -z my-rabbitmq-server
    </pre>
