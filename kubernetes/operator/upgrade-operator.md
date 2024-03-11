---
title: Upgrading the RabbitMQ Kubernetes Operators
---
# Upgrading the RabbitMQ Kubernetes Operators

This topic describes how to upgrade the RabbitMQ Kubernetes Operators, and their components.

## Overview {#overview}

Upgrading the RabbitMQ Cluster Kubernetes Operator or Messaging Topology Operator involves
the following effects:

1. [Updating to the new operator manifest](#update-manifest)
2. (For specified releases) [Rolling restart of RabbitmqCluster Pods](#rolling-restart)

### Updating to the new operator manifest {#update-manifest}

To upgrade to the new version of the operator, simply apply the new operator manifest for the desired version. For example,
for the RabbitMQ Cluster Operator:

```bash
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
# namespace/rabbitmq-system unchanged
# customresourcedefinition.apiextensions.k8s.io/rabbitmqclusters.rabbitmq.com configured
# serviceaccount/rabbitmq-cluster-operator unchanged
# role.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-role unchanged
# clusterrole.rbac.authorization.k8s.io/rabbitmq-cluster-operator-role unchanged
# rolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-rolebinding unchanged
# clusterrolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-operator-rolebinding unchanged
# deployment.apps/rabbitmq-cluster-operator configured
```

This will cause the Custom Resource Definitions provided by the operator to be updated, and the Operator Pod to use the updated version
of the operator container image.

New versions of the Cluster Operator typically include changes to the default version of RabbitMQ used in new clusters, if one is not specified in the
`spec` of the RabbitmqCluster manifest. As a result, after upgrade, you will likely see that newly-created RabbitmqClusters will be running on a newer
version of RabbitMQ if they do not specify a version in their `spec`. Note that this does not have an effect on existing RabbitmqClusters, whose
manifests will have already been populated with the previous operator version's default.

### Rolling restart of RabbitmqCluster Pods {#rolling-restart}

In some cases, upgrading the version of the RabbitMQ Cluster Operator (not the Messaging Topology Operator) will require the Pods of RabbitmqClusters
to be restarted. This is usually due to a change in the underlying PodSpec of the RabbitmqCluster that the operator creates. In this case, upgrading the
Cluster Operator will lead to the RabbitmqClusters on a Kubernetes distribution undergoing a rolling restart.

If a Cluster Operator version will trigger a rolling restart of RabbitmqCluster Pods, it will be noted in the release notes for that version.
For example, see https://github.com/rabbitmq/cluster-operator/releases/tag/v1.7.0.
