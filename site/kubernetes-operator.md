
# Cluster Operator

Cluster Operator is a Kubernetes Operator that automates provisioning, managing,
and operating RabbitMQ clusters running on Kubernetes.

Kubernetes Operators are software extensions to Kubernetes that make use of custom resources to manage apps
and their components.For general information about Operators, see the
[Kubernetes documentation](https://kubernetes.io/docs/concepts/extend-kubernetes/operator).

Cluster Operator provides a consistent and easy way to deploy RabbitMQ clusters to Kubernetes and
manage their lifecycle. RabbitMQ clusters can be accessed by apps running on Kubernetes, or elsewhere.

## Key Features
Cluster Operator includes the following key features:

* Provisioning of single-node and three-node RabbitMQ clusters
* Automatic reconciliation of deployed clusters whenever their actual state does not match the expected state
* Monitoring of RabbitMQ clusters through Prometheus and Grafana
For more information, see the [Prometheus](https://prometheus.io/docs/introduction/overview/)
and [Grafana](https://grafana.com/docs/) documentation.

Automated upgrades of RabbitMQ clusters, another key feature, is planned for a later update.

## Installation

See the [Cluster Operator Installation Guide](/install-operator.html) page
for information on how to install it.

## Limitations

### General Limitations

* This product is intended to be used with any Kubernetes distribution.
  However, given the number of Kubernetes vendors, versions, and configurations, not all of them have been
  tested.
* This product has been tested with Google Kubernetes Engine (GKE).
* Cluster Operator upgrades are not supported. If you want to test a newer version, delete the previous version first.

### RabbitMQ Cluster Reconciliation

If you delete `Secret` objects, they will be recreated by the Operator, but the new value generated in the `Secret` will
not take effect in RabbitMQ. For example, if the `Secret` with admin credentials is deleted, a new `Secret` will be created
with new username and password, but those will not be effective in RabbitMQ. The same happens if you update the value of
any `Secret`, it won't be effective in RabbitMQ.

