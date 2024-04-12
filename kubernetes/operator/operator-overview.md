---
title: "RabbitMQ Kubernetes Operators: Cluster Operator and Messaging Topology Operator"
---
# RabbitMQ Kubernetes Operators: Cluster Operator and Messaging Topology Operator

The RabbitMQ team develop and maintain two [Kubernetes operators](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/): the RabbitMQ Cluster Kubernetes Operator and the RabbitMQ Messaging Topology Operator.

* The RabbitMQ Cluster Kubernetes Operator automates provisioning, management, and operations of RabbitMQ clusters running on Kubernetes.

* The RabbitMQ Messaging Topology Operator manages RabbitMQ messaging topologies within a RabbitMQ cluster deployed via the RabbitMQ Cluster Kubernetes Operator.

Kubernetes Operators are software extensions to Kubernetes that provide custom resources for management of applications, services and their components.

In this information and other Operator related information, "Operator" (with a capital O) is used to refer to a Kubernetes Operator pattern implementation and "operator" (with a lowercase o) is used to refer to a technical operations engineer (administrator).

## RabbitMQ Cluster Kubernetes Operator {#cluster-operator}

The RabbitMQ Cluster Kubernetes Operator provides a consistent and easy way to deploy RabbitMQ clusters to Kubernetes and
run them, including "day two" (continuous) operations. RabbitMQ clusters deployed using the Operator can be
used by applications running on Kubernetes or outside of Kubernetes.

Documentation of Cluster Operator spans several guides:

 * [Limitations](#limitations)
 * [Quickstart guide](./quickstart-operator) for RabbitMQ Cluster Kubernetes Operator
 * [Installing](./install-operator) RabbitMQ Cluster Kubernetes Operator
 * [Configuring Defaults](./configure-operator-defaults) for RabbitMQ Cluster Operator
 * [RabbitMQ Plugin for kubectl](./kubectl-plugin)
 * [Using](./using-operator) RabbitMQ Cluster Kubernetes Operator
 * [Monitoring RabbitMQ Clusters on Kubernetes](./operator-monitoring)
 * [Troubleshooting RabbitMQ Clusters on Kubernetes](./troubleshooting-operator)
 * [Upgrading the RabbitMQ Kubernetes Operators](./upgrade-operator)
 * [Using the RabbitMQ Kubernetes Operators on Openshift](./using-on-openshift)

In addition, a separate Operator for managing cluster objects collectively
known as the messaging topology: virtual hosts, user, queues, etc.
It is covered in the following guides:

 * [Installing](./install-topology-operator) RabbitMQ Messaging Topology Operator
 * [Using](./using-topology-operator) RabbitMQ Messaging Topology Operator
 * [Using TLS](./tls-topology-operator) with Messaging Topology Kubernetes Operator
 * [Troubleshooting](./troubleshooting-topology-operator) Messaging Topology Kubernetes Operator

The Operator provides the following key features:

* Provisioning of single-node and multi-node RabbitMQ clusters
* Automatic reconciliation of deployed clusters whenever their actual state does not match the expected state
* Monitoring of RabbitMQ clusters using [Prometheus and Grafana](/docs/prometheus)
* Scaling up and automated [rolling upgrades](/docs/upgrade) of RabbitMQ clusters

### RabbitMQ Cluster Kubernetes Operator Design Principles {#op-design-principles}

RabbitMQ Cluster Kubernetes Operator was designed with the following ideas and concepts in mind:

* It should provide [RabbitMQ node configuration](/docs/configure) flexibility
* It should provide reasonably safe defaults where possible
* It should simplify RabbitMQ operations

Following these ideas, the Operator will not modify an existing `RabbitmqCluster` spec.
This implies that, when the Operator is upgraded, it will not automatically update
existing instances of `RabbitmqCluster` with new defaults, if any, or to the latest version of RabbitMQ.

The only exception to this, is when a field is removed from the spec, by user action, the Operator will set the default value.

### Limitations {#limitations}

#### RabbitMQ Cluster Operator Reconciliation

Deleted `Secret` objects will be recreated by the Kubernetes Operator but the newly generated secret value will
not be deployed to the RabbitMQ cluster. For example, if the `Secret` with administrator credentials is deleted,
a new `Secret` will be created with new username and password, but those will not be reflected in the RabbitMQ cluster.
It works the same way for any `Secret` value, e.g. the value of the [shared inter-node authentication secret](/docs/clustering#erlang-cookie)
known as the Erlang cookie.

#### RabbitMQ Cluster Operator Feature Flags

Cluster Operator does not support disabling any [RabbitMQ feature flags](/docs/feature-flags#how-to-disable-feature-flags).
The Operator lists all available feature flags and enables all of them at cluster start.
 
## RabbitMQ Messaging Topology Operator {#topology-operator}

The RabbitMQ Messaging Topology Operator supports managing RabbitMQ messaging topologies objects through the kubernetes declarative API.

Documentation for the Messaging Topology Operator is structured as follows:

 * [Limitations](#top-op-limitations)
 * [Installing RabbitMQ Messaging Topology Operator](./install-topology-operator)
 * [Using RabbitMQ Messaging Topology Operator](./using-topology-operator)
 * [TLS for Messaging Topology Operator](./tls-topology-operator)
 * [Troubleshooting Messaging Topology Operator](./troubleshooting-topology-operator)

### Limitations {#top-op-limitations}

#### Custom default credentials result in 401 unauthorised

The Topology Operator relies on the default credentials `Secret` created by the Cluster Operator. If the `RabbitmqCluster`
`spec` defines the default user in `additionalConfig` using the keys `default_user` and `default_pass`, it will
result in incorrect credentials generated for the default credentials `Secret`. Due to the incorrect credentials, all
operations from the Topology Operator will error and print the following message in the log:

```
Error: API responded with a 401 Unauthorized
```

See the [troubleshooting Messaging Topology Operator](./troubleshooting-topology-operator) section for more details and a workaround.

## The Source Code for these Kubernetes Operators {#source}

Both Operators are open source. You can contribute to its development on GitHub:

* [RabbitMQ Cluster Kubernetes Operator](https://github.com/rabbitmq/cluster-operator)
* [RabbitMQ Messaging Topology Operator](https://github.com/rabbitmq/messaging-topology-operator)

## The Licenses for these Kubernetes Operators {#license}

Both Operators are released under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/).

## Supported Kubernetes Versions {#kubernetes-versions}

RabbitMQ Operators are intended to be used with any Kubernetes-compliant platform. If you encounter an issue with
a particular distribution of Kubernetes, please [check for known issues in the GitHub repo](https://github.com/rabbitmq/cluster-operator/issues).

For more information on which Kubernetes & RabbitMQ server versions are supported by the Operator,
please consult the [README](https://github.com/rabbitmq/cluster-operator#supported-versions).
