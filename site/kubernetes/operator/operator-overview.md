# RabbitMQ Cluster Operator for Kubernetes

The RabbitMQ team develop and maintain two [kubernetes operators]((https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)):

* RabbitMQ Cluster Kubernetes Operator automates provisioning, management, and operations of RabbitMQ clusters running on Kubernetes.
* RabbitMQ Messaging Topology Operator manages RabbitMQ messaging topologies within a RabbitMQ cluster deployed via the RabbitMQ Cluster Kubernetes Operator.

Kubernetes Operators are software extensions to Kubernetes that provide custom resources for management of applications,
services  and their components.

In this and other Operator related guides, we use "Operator" (with a capital O) to refer to a Kubernetes Operator
pattern implementation and "operator" (with a lowercase o) to refer to a technical operations
engineer (administrator).

## RabbitMQ Cluster Kubernetes Operator

RabbitMQ Cluster Kubernetes Operator provides a consistent and easy way to deploy RabbitMQ clusters to Kubernetes and
run them, including "day two" (continuous) operations. RabbitMQ clusters deployed using the operator can be
used by applications running on Kubernetes or outside of Kubernetes.

Documentation of Cluster Operator spans several guides:

 * [Quickstart guide](quickstart-operator.html) for RabbitMQ Cluster Kubernetes Operator
 * [Installing](install-operator.html) RabbitMQ Cluster Kubernetes Operator
 * [RabbitMQ Plugin for kubectl](kubectl-plugin.html)
 * [Using](using-operator.html) RabbitMQ Cluster Kubernetes Operator
 * [Monitoring RabbitMQ Clusters on Kubernetes](operator-monitoring.html)
 * [Troubleshooting RabbitMQ Clusters on Kubernetes](troubleshooting-operator.html)

In addition, a separate Operator for managing cluster objects collectively
known as the messaging topology: virtual hosts, user, queues, etc.
It is covered in the following guides:

 * [Installing](install-topology-operator.html) RabbitMQ Messaging Topology Operator
 * [Using](using-topology-operator.html) RabbitMQ Messaging Topology Operator
 * [Using TLS](tls-topology-operator.html) with Messaging Topology Kubernetes Operator
 * [Troubleshooting](troubleshooting-topology-operator.html) Messaging Topology Kubernetes Operator

The operator provides the following key features:

* Provisioning of single-node and multi-node RabbitMQ clusters
* Automatic reconciliation of deployed clusters whenever their actual state does not match the expected state
* Monitoring of RabbitMQ clusters using [Prometheus and Grafana](/prometheus.html)
* Scaling up and automated [rolling upgrades](/upgrade.html) of RabbitMQ clusters

### <a id='limitations' class='anchor' href='#limitations'>Limitations</a>

#### RabbitMQ Cluster Reconciliation

Deleted `Secret` objects will be recreated by the Kubernetes Operator but the newly generated secret value will
not be deployed to the RabbitMQ cluster. For example, if the `Secret` with administrator credentials is deleted,
a new `Secret` will be created with new username and password, but those will not be reflected in the RabbitMQ cluster.
It works the same way for any `Secret` value, e.g. the value of the [shared inter-node authentication secret](/clustering.html#erlang-cookie)
known as the Erlang cookie.
 
## RabbitMQ Messaging Topology Operator

RabbitMQ Messaging Topology Operator supports managing RabbitMQ messaging topologies objects through kubernetes declarative API.

Documentation of Messaging Topology Operator structured as following:

 * [Installing RabbitMQ Messaging Topology Operator](/kubernetes/operator/install-topology-operator.html)
 * [Using RabbitMQ Messaging Topology Operator](/kubernetes/operator/using-topology-operator.html)
 * [TLS for Messaging Topology Operator](/kubernetes/operator/tls-topology-operator.html)
 * [Troubleshooting Messaging Topology Operator](/kubernetes/operator/troubleshooting-topology-operator.html)

## <a id='source' class='anchor' href='#source'>Source Code</a>

Both Operators are open source. You can contribute to its development on GitHub:

* [RabbitMQ Cluster Kubernetes Operator](https://github.com/rabbitmq/cluster-operator)
* [RabbitMQ Messaging Topology Operator](https://github.com/rabbitmq/messaging-topology-operator)

## <a id='license' class='anchor' href='#license'>License</a>

Both Operators are released under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/).

## <a id='kubernetes-versions' class='anchor' href='#kubernetes-versions'>Supported Kubernetes Versions</a>

RabbitMQ Operators are intended to be used with any Kubernetes-compliant platform. If you encounter an issue with
a particular distribution of Kubernetes, please [check for known issues in the GitHub repo](https://github.com/rabbitmq/cluster-operator/issues).

For more information on which Kubernetes & RabbitMQ server versions are supported by the operator,
please consult the [README](https://github.com/rabbitmq/cluster-operator#supported-versions).
