---
title: Installing RabbitMQ Cluster Operator in a Kubernetes Cluster
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

## Overview {#overview}

This guide covers the installation of the [RabbitMQ Cluster Kubernetes Operator](./operator-overview) in a Kubernetes cluster.

## Compatibility {#compatibility}

The Operator requires

* Kubernetes 1.19 or later (1.25 or later versions are [recommended](/docs/memory-use#page-cache), in particular for environments that use [RabbitMQ Streams](/docs/streams))
* [RabbitMQ DockerHub image](https://hub.docker.com/_/rabbitmq) that provides a [supported release series of RabbitMQ](/release-information)

-----

## Installation {#installation}

To install the Operator, run the following command:

```bash
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
# namespace/rabbitmq-system created
# customresourcedefinition.apiextensions.k8s.io/rabbitmqclusters.rabbitmq.com created
# serviceaccount/rabbitmq-cluster-operator created
# role.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-role created
# clusterrole.rbac.authorization.k8s.io/rabbitmq-cluster-operator-role created
# rolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-rolebinding created
# clusterrolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-operator-rolebinding created
# deployment.apps/rabbitmq-cluster-operator created
```

At this point, the RabbitMQ Cluster Kubernetes Operator is successfully installed.
Once the RabbitMQ Cluster Kubernetes Operator pod is running, head over to [Using Kubernetes RabbitMQ Cluster Kubernetes Operator](./using-operator) for instructions on how to deploy RabbitMQ using a Kubernetes Custom Resource.

If you want to install a specific version of the Operator, you will have to obtain the manifest link from the
[Operator Releases](https://github.com/rabbitmq/cluster-operator/releases). Please note that releases prior to 0.46.0
do not have this manifest. We strongly recommend to install versions 0.46.0+

If you want to relocate the Operator image to a custom location, the section [Relocate the Image](#relocate-image)
has instructions to relocate the Operator image to a private registry.

### Installation using kubectl-rabbitmq plugin {#kubectl-plugin}

The `kubectl rabbitmq` plugin provides commands for managing RabbitMQ clusters.
The plugin can be installed using [krew](https://github.com/kubernetes-sigs/krew):

```bash
kubectl krew install rabbitmq
```

To get the list of available commands, use:

```bash
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
```

### Installation using Helm chart {#helm-chart}

To install the Operator using [Bitnami Helm chart](https://github.com/bitnami/charts/tree/main/bitnami/rabbitmq-cluster-operator), run the following command:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release bitnami/rabbitmq-cluster-operator
```

The last command deploys the RabbitMQ Cluster Kubernetes Operator on the Kubernetes cluster in the default configuration. The [Parameters](https://github.com/bitnami/charts/tree/main/bitnami/rabbitmq-cluster-operator#parameters) section lists the parameters that can be configured during installation.

The Operator's Helm chart requires

* Helm chart 3.1.0
* PV provisioner support in the underlying infrastructure

### Installation with Terraform and OpenTofu

Terraform and OpenTofu users need to [override the repository](https://registry.terraform.io/providers/hashicorp/helm/latest/docs/resources/release) and set it
to

```
oci://registry-1.docker.io/bitnamicharts
```

on the `helm_release` resource.

-----

### (Optional) Relocate the Image {#relocate-image}

If you can't pull images from Docker Hub directly to your Kubernetes cluster, you need to relocate the images to your private registry first. The exact steps depend on your environment but will likely look like this:

```bash
docker pull rabbitmqoperator/cluster-operator:{some-version}
docker tag rabbitmqoperator/cluster-operator:{some-version} {someregistry}/cluster-operator:{some-version}
docker push {someregistry}/cluster-operator:{some-version}
```

The value of `{someregistry}` should be the address of an OCI compatible registry. The value of `{some-version}` is
a version number of the Cluster Operator.

If you require authentication to pull images from your private image registry, you must [Configure Kubernetes Cluster Access to Private Images](#private-images).

[Download the manifest](https://github.com/rabbitmq/cluster-operator/releases) from the release you are relocating and edit
the section in Deployment image. You can locate this section by `grep`'ing the string `image:`

```bash
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
```

#### Configure Kubernetes Cluster Access to Private Images {#private-images}

If you relocated the image to a private registry and your registry requires authentication, you need to follow these steps to allow Kubernetes to pull the image.

First, create the Service Account that the Operator will use to run and to pull images:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: rabbitmq-cluster-operator
  namespace: rabbitmq-system
```

Second, create a Secret with the credentials to pull from the private registry:

```bash
kubectl -n rabbitmq-system create secret \
docker-registry rabbitmq-cluster-registry-access \
--docker-server=DOCKER-SERVER \
--docker-username=DOCKER-USERNAME \
--docker-password=DOCKER-PASSWORD
```

Where:

+ `DOCKER-SERVER` is the server URL for your private image registry.
+ `DOCKER-USERNAME` is your username for your private image registry authentication.
+ `DOCKER-PASSWORD` is your password for your private image registry authentication.

For example:

```bash
kubectl -n rabbitmq-system create secret \
docker-registry rabbitmq-cluster-registry-access \
--docker-server=docker.io/my-registry \
--docker-username=my-username \
--docker-password=example-password1
```

Now update the Operator Service Account by running:

```bash
kubectl -n rabbitmq-system patch serviceaccount \
rabbitmq-cluster-operator -p '{"imagePullSecrets": [{"name": "rabbitmq-cluster-registry-access"}]}'
```

Please note that the name of the Operator Service Account is not configurable and it must be `rabbitmq-cluster-operator`.

#### Configure operator to use private registry {#custom-configuration}

You will need to modify the configuration of the operator to use the relocated images by default for new RabbitmqCluster instances.
T set the values of `DEFAULT_RABBITMQ_IMAGE`, `DEFAULT_USER_UPDATER_IMAGE` and `DEFAULT_IMAGE_PULL_SECRETS`
at Operator deployment time, see [Configuring Defaults for RabbitMQ Cluster Operator](./configure-operator-defaults).
