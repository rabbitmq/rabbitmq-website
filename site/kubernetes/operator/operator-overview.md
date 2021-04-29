
# RabbitMQ Cluster Operator for Kubernetes

RabbitMQ Cluster Kubernetes Operator is a [Kubernetes operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) that automates
provisioning, management, and operations of RabbitMQ clusters running on Kubernetes.

Kubernetes Operators are software extensions to Kubernetes that provide custom resources for management of applications,
services  and their components.

In this and other Operator related guides, we use "Operator" (with a capital O) to refer to a Kubernetes Operator
pattern implementation and "operator" (with a lowercase o) to refer to a technical operation
engineer (administrator).

The Operator provides a consistent and easy way to deploy RabbitMQ clusters to Kubernetes and
run them, including "day two" (continuous) operations. RabbitMQ clusters deployed using the operator can be
used by applications running on Kubernetes or outside of Kubernetes.

Documentation of the Operator spans several guides:

 * [Quickstart RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/quickstart-operator.html)
 * [Installing RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/install-operator.html)
 * [RabbitMQ Plugin for kubectl](/kubernetes/operator/kubectl-plugin.html)
 * [Using RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/using-operator.html)
 * [Monitoring RabbitMQ Clusters on Kubernetes](/kubernetes/operator/operator-monitoring.html)
 * [Troubleshooting RabbitMQ Clusters on Kubernetes](/kubernetes/operator/troubleshooting-operator.html)


## <a id='source' class='anchor' href='#source'>Source Code</a>

The Operator is open source. You can [contribute to its development on GitHub](https://github.com/rabbitmq/cluster-operator).


## <a id='license' class='anchor' href='#license'>License</a>

The Operator is released under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/).


## <a id='features' class='anchor' href='#features'>Key Features</a>

The operator provides the following key features:

* Provisioning of single-node and multi-node RabbitMQ clusters
* Automatic reconciliation of deployed clusters whenever their actual state does not match the expected state
* Monitoring of RabbitMQ clusters using [Prometheus and Grafana](/prometheus.html)
* Scaling up and automated [rolling upgrades](/upgrade.html) of RabbitMQ clusters

## <a id='kubernetes-versions' class='anchor' href='#kubernetes-versions'>Supported Kubernetes Versions</a>

The operator is intended to be used with any Kubernetes-compliant platform. If you encounter an issue with
a particular distribution of Kubernetes, please [check for known issues in the GitHub repo](https://github.com/rabbitmq/cluster-operator/issues).

For more information on which Kubernetes & RabbitMQ server versions are supported by the operator,
please consult the [README](https://github.com/rabbitmq/cluster-operator#supported-versions).


## <a id='limitations' class='anchor' href='#limitations'>Limitations</a>

### RabbitMQ Cluster Reconciliation

Deleted `Secret` objects will be recreated by the Kubernetes Operator, but the newly generated secret value will
not be deployed to the RabbitMQ cluster. For example, if the `Secret` with administrator credentials is deleted,
a new `Secret` will be created with new username and password, but those will not be reflected in the RabbitMQ cluster.
It works the same way for any `Secret` value, e.g. the value of the [shared inter-node authentication secret](/clustering.html#erlang-cookie)
known as the Erlang cookie.

