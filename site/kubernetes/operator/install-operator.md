<!--
Copyright (c) 2020-2021 VMware, Inc. or its affiliates.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Installing RabbitMQ Cluster Operator in a Kubernetes Cluster

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers the installation of the [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/operator-overview.html) in a Kubernetes cluster.
If you are installing in OpenShift, follow the instructions in [Installation on OpenShift](#openshift) section.

## <a id='compatibility' class='anchor' href='#compatibility'>Compatibility</a>

The Operator requires

* Kubernetes 1.18 or above
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

Openshift uses arbitrarily assigned User IDs when running Pods. Each Openshift project is allocated a range of possible UIDs,
and by default Pods will fail if they are started running as a user outside of that range.

By default, the RabbitMQ Cluster Operator, Messaging Topology Operator & RabbitmqCluster Pods all run with fixed IDs. To deploy
on Openshift, it is necessary to override the Security Context for these Pods, as described below.

#### Creating the Operator
<strong>If you have [ytt](https://carvel.dev/ytt/) installed</strong>, you can simply run:
<pre class="lang-bash">ytt -f https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml -f https://raw.githubusercontent.com/rabbitmq/cluster-operator/main/hack/remove-operator-securityContext.yml | oc apply -f -</pre>

This will use a YTT overlay to strip out the securityContext from the operator deployment, then apply the resultant manifest. The operator Pod will then run as the user chosen by Openshift.

<strong>If you do not have ytt</strong>, you will have to remove this manually. Download the installation manifest from the [release page in GitHub](https://github.com/rabbitmq/cluster-operator/releases).

Remove the `securityContext` from the `Deployment` object named `rabbitmq-cluster-operator`:

<pre class="lang-yaml">
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/component: rabbitmq-operator
    app.kubernetes.io/name: rabbitmq-cluster-operator
    app.kubernetes.io/part-of: rabbitmq
  name: rabbitmq-cluster-operator
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
oc apply -f cluster-operator.yml
# namespace/rabbitmq-system created
# customresourcedefinition.apiextensions.k8s.io/rabbitmqclusters.rabbitmq.com created
# serviceaccount/rabbitmq-cluster-operator created
# role.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-role created
# clusterrole.rbac.authorization.k8s.io/rabbitmq-cluster-operator-role created
# rolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-rolebinding created
# clusterrolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-operator-rolebinding created
# deployment.apps/rabbitmq-cluster-operator created</pre>

#### Creating the RabbitmqClusters
For every RabbitmqCluster you plan on creating, you must add everything under the `override` field to the object manifest:
 <pre class="lang-yaml">
 apiVersion: rabbitmq.com/v1beta1
 kind: RabbitmqCluster
 metadata:
   ...
 spec:
   ...
   override:
     statefulSet:
       spec:
         template:
           spec:
             containers: []
             securityContext: {}
             initContainers:
             - name: setup-container
               securityContext: {}</pre>
   This ensures that RabbitMQ Pods are also assigned arbitrary user IDs in Openshift.
