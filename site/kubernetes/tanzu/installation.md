<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Installing VMware RabbitMQ for Kubernetes

## Overview

This guide covers installation of [VMware RabbitMQ](https://tanzu.vmware.com/rabbitmq) to Kubernetes
using the [Carvel toolchain](https://carvel.dev/#install), e.g. from TanzuNet:

* [imgpkg](https://network.pivotal.io/products/imgpkg/)
* [kapp](https://network.pivotal.io/products/kapp/)
* [kbld](https://network.pivotal.io/products/kbld/)
* [ytt](https://network.pivotal.io/products/ytt/)

## Prerequisite

This guide assumes you have the following:

* A running Kubernetes cluster
* Kubernetes CLI tools such as `kubectl` installed
* The [Carvel toolchain](https://carvel.dev/#install) installed
* A local (private) container image registry

## <a id='installation' class='anchor' href='#installation'>Installation</a>

### Installing to a Local Registry

First download the VMware RabbitMQ release tarball (`.tar` file) from [VMware Tanzu Network](https://network.pivotal.io/products/p-rabbitmq-for-kubernetes/).

The file then must be placed on the filesystem of a machine within the network hosting the target registry.
On that machine, load the tarball into the registry by running:

<pre class="lang-bash">
# upload the file to the target registry reachable on the local network
imgpkg copy --to-repo your.company.domain/registry/tanzu-rabbitmq-bundle --tar tanzu-rabbitmq-1.1.0.tar
</pre>

On a machine that targets (has access to) the target Kubernetes cluster,
pull bundle by running:

<pre class="lang-bash">
imgpkg pull -b your.company.domain/registry/tanzu-rabbitmq-bundle:1.1.0 -o /your/output/directory
cd /your/output/directory
</pre>

### Creating a Namespace

Create a new namespace, `rabbitmq-system`, by running:

<pre class="lang-bash">
kubectl create namespace rabbitmq-system
</pre>

### Providing imagePullSecrets

Since the target Kubernetes cluster will be pulling images from the local registry,
`imagePullSecrets` must be provided in order for the cluster to access those images.

First, create a registry credential Secret named `tanzu-registry-creds` [using `kubectl`](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#create-a-secret-by-providing-credentials-on-the-command-line).

This secret must be created **with this exact name**, in each namespace you plan on deploying RabbitmqClusters,
as well as the `rabbitmq-system` namespace.

For example, if RabbitmqClusters will be created in just the `default` namespace, create
the secret on the `default` and `rabbitmq-system` namespaces.

Assuming we have already authenticated with the registry, a more convenient options would be to simply mount
the Docker authentication credentials as a Secret:

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

## Installing the Bundle

VMware RabbitMQ uses TLS certificates for admission Webhooks in the cluster.

There are two ways of installing the components of :

1. Install using `cert-manager`. This option is **recommended**
2. Install using manually created certificates

### Option 1 (Recommended): Install Using cert-manager

First, install Cert-manager version 1.2.0+ on your cluster. For example, for version 1.3.1, run:

<pre class="lang-bash">
kbld -f https://github.com/jetstack/cert-manager/releases/download/v1.3.1/cert-manager.yaml | kapp deploy -y -a cert-manager -f-
</pre>

Next install the RabbitMQ operators by running:

<pre class="lang-bash">
ytt -f manifests/cluster-operator.yml -f manifests/messaging-topology-operator-with-certmanager.yaml -f overlays/operator-deployments.yml | kbld -f .imgpkg/images.yml -f config/ -f- | kapp -y deploy -a rabbitmq-operator -f -
</pre>

### Option 2. Install Using Manually Created Certificates

If using `cert-manager` to generate TLS certificates to be used by RabbitMQ nodes and  is not an option,
certificates can be generated manually instead.

Certificates can be generated using any tool you prefer. They must include
a Subject Alternative Name for `webhook-service.rabbitmq-system.svc`.

The secret object must contain following keys: `ca.crt`, `tls.key`, and `tls.key`.

This example will create a manifest for a Kubernetes Secret with name `webhook-server-cert` in namespace `rabbitmq-system`:

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

There are some steps to perform **before** deploying the above manifest.

Edit the Messaging Topology Operator manifest within the bundle
using any text editor:

<pre class="lang-bash">
vim manifests/messaging-topology-operator.yaml
</pre>

In it, replace the values of all `caBundle` keys in this file with the value of `ca.crt` in the Secret manifest created earlier.

Now install the RabbitMQ operators by running:

<pre class="lang-bash">
ytt -f manifests/cluster-operator.yml -f manifests/messaging-topology-operator.yaml -f overlays/operator-deployments.yml | kbld -f .imgpkg/images.yml -f config/ -f $SECRET_PATH -f- | kapp -y deploy -a rabbitmq-operator -f -
</pre>

## Observability

Setting up observability for RabbitMQ clusters is [very important](../../monitoring.html#approaches-to-monitoring).
To do so, follow the instructions [in the Cluster Operator repository](https://github.com/rabbitmq/cluster-operator/tree/v1.7.0/observability)
or the [Operator monitoring guide](../operator/operator-monitoring.html).

## Deploying your RabbitmqClusters and Topology Objects

Once this installation is complete, the Carvel tooling can also be used to create RabbitMQ objects (virtual hosts, users, queues, exchanges, bindings:
everything that can be managed via [definitions](../../definitions.html))
using the [RabbitMQ Topology Operator](../operator/using-topology-operator.html).

To do so, render `overlays/rabbitmqcluster.yml` with a manifest of the `RabbitmqCluster` object,
the resultant cluster will use the bundled VMware RabbitMQ container image.

This example creates a very minimalistic RabbitmqCluster:

<pre class="lang-bash">
cat &lt;&lt;EOF &gt; rabbitmq.yaml
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: my-tanzu-rabbit
EOF
ytt -f rabbitmq.yaml -f overlays/rabbitmqcluster.yml | kbld -f- | kapp deploy -f- -a my-tanzu-rabbit -y
</pre>
