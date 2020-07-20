
# RabbitMQ Cluster Operator for Kubernetes

RabbitMQ Cluster Kubernetes Operator is a [Kubernetes operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) that automates
provisioning, management, and operations of RabbitMQ clusters running on Kubernetes.

Kubernetes Operators are software extensions to Kubernetes that provide custom resources for management of applications,
services  and their components.

In this and other Operator related guides, we use "Operator" (with a capital O) to refer to a Kubernetes Operator
pattern implementation and "operator" (with a lowercase o) to refer to a technical operations
engineer (administrator).

The Operator provides a consistent and easy way to deploy RabbitMQ clusters to Kubernetes and
run them, including "day two" (continuous) operations. RabbitMQ clusters deployed using the operator can be
used by applications running on Kubernetes or outside of Kubernetes.

Documentation of the Operator spans several guides:

 * [Installing RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/install-operator.html)
 * [Using RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/using-operator.html)
 * [Monitoring RabbitMQ Clusters on Kubernetes](/kubernetes/operator/operator-monitoring.html)
 * [Troubleshooting RabbitMQ Clusters on Kubernetes](/kubernetes/operator/troubleshooting-operator.html)

## Key Features

The operator provides the following key features:

* Provisioning of single-node and multi-node RabbitMQ clusters
* Automatic reconciliation of deployed clusters whenever their actual state does not match the expected state
* Monitoring of RabbitMQ clusters using [Prometheus and Grafana](/prometheus.html)

Automated [rolling upgrades](/upgrade.html) of RabbitMQ clusters is a future that will be provided in later
versions.

## Supported Kubernetes Versions

The Operator requires

 * Kubernetes 1.16 or 1.17
 * [RabbitMQ DockerHub image](https://hub.docker.com/_/rabbitmq) 3.8.5+

Kubernetes 1.18 is not fully tested and there might be incompatibilities.


## Installation

The Kubernetes Operator has a dedicated [installation guide](/kubernetes/operator/install-operator.html).


## Limitations

### General Limitations

* This product is intended to be used with any Kubernetes distribution. However, given the number of Kubernetes vendors,
  versions, and configurations, not all of them have been tested.
* This product has been tested with Google Kubernetes Engine (GKE).
* Kubernetes Operator upgrades are not currently supported. To deploy a newer version, delete the previous version first.

### RabbitMQ Cluster Reconciliation

Deleted `Secret` objects will be recreated by the Kubernetes Operator but the newly generated secret value will
not be deployed to the RabbitMQ cluster. For example, if the `Secret` with administrator credentials is deleted,
a new `Secret` will be created with new username and password, but those will not be reflected in the RabbitMQ cluster.
It works the same way for any `Secret` value, e.g. the value of the [shared inter-node authentication secret](/clustering.html#erlang-cookie)
known as the Erlang cookie.
