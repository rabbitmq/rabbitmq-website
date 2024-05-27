---
title: Using the RabbitMQ Kubernetes Operators on Openshift
displayed_sidebar: kubernetesSidebar
---
# Using the RabbitMQ Kubernetes Operators on Openshift

## Overview {#overview}
This documentation details the Openshift-specific considerations when deploying the RabbitMQ Kubernetes Operators, which are the [Cluster operator](./using-operator) and the [Messaging Topology Operator](./using-topology-operator). It is important to note that these considerations are also applicable to the commercial [VMware Tanzu RabbitMQ Standby Replication Operator](https://docs.vmware.com/en/VMware-Tanzu-RabbitMQ-for-Kubernetes/3.13/tanzu-rabbitmq-kubernetes/standby-replication.html#requirements-warm-standby-replication) (note, this operator is exclusive to the VMware Tanzu RabbitMQ for Kubernetes commercial offering only).

For the most part, the user experience is the same when
using these operators on Openshift; the following guide details the additional work required to leverage Openshift's
security practices, as well as detail on how the operators work on Openshift.

## RBAC permissions for installing the Operators {#rbac-install-operators}

In order to install the operators, you will need to be authenticated with the Openshift cluster as a user with CRUD permissions on
the following resources:

* Namespace
* CustomResourceDefinition
* Deployment
* ServiceAccount
* Role
* ClusterRole
* RoleBinding
* ClusterRoleBinding
* Service
* ValidatingWebhookConfiguration

You may then run [the installation instructions](./install-operator) as normal with this user.

## Support for Arbitrary User IDs {#arbitrary-user-ids}

Openshift uses arbitrarily assigned User IDs when running Pods. Each Openshift project is allocated a range of possible UIDs,
and by default Pods will fail if they are started running as a user outside of that range. For more information, see
[the Openshift documentation](https://docs.openshift.com/container-platform/4.8/openshift_images/create-images.html#use-uid_create-images).

When deploying the operators on Openshift, the Pods used to run the operator binaries will run with an arbitrary UID within the range
allocated by Openshift. This occurs by default, and does not require any modification of the operator manifests to achieve.

Some additional work is required to utilise the same security features when deploying RabbitmqClusters.
By default, the RabbitMQ Cluster Operator deploys RabbitmqCluster Pods with fixed, non-root UIDs. To deploy
on Openshift, it is necessary to override the Security Context for these Pods. This must be done
for every RabbitmqCluster deployed under the `override` field:

```yaml
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
```

This resets the securityContext for the Pods to default, and ensures that RabbitMQ Pods are also assigned arbitrary user IDs in Openshift.
