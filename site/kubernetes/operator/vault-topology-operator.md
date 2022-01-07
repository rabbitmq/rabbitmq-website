# Using Vault with Messaging Topology Kubernetes Operator

If the RabbitmqClusters managed by the Messaging Topology Operator are configured to have their default user credentials
stored in Vault, it may be necessary to configure the Topology Operator with some additional Vault related settings.

### Prerequisites

This guide assumes you have the following:

1. The [RabbitMQ Cluster Operator](operator-overview.html) and [Messaging Topology Operator](install-topology-operator.html) are installed on the Kubernetes cluster
2. A Vault server is installed on the Kubernetes cluster
3. A *Vault role* must be declared in Vault. The topology operator expects this role to be called `messaging-topology-operator`. Should we declared a *Vault role* with a different name, we have to configure the operator by overriding the environment variable `OPERATOR_VAULT_ROLE`


### Additional configuration (optional)

By default, the topology operator authenticates with Vault server via the default kubernetes authentication path `auth/kubernetes`. Should this path be different in the Vault Server, we can configure the operator with the new path by overriding the environment variable `OPERATOR_VAULT_AUTH_PATH`.

`Namespaces` is a set of features within Vault Enterprise that allows Vault environments to support Secure Multi-tenancy (or SMT) within a single Vault infrastructure. At present, the topology operator assumes that all RabbitmqClusters whose default user
credentials are stored in Vault, belong to the same *Vault Namespace*, or tenant. If we are not using Vault multi-tenancy, the
default `Namespace` is the blank and there is nothing to be configured in the topology operator.
In the contrary, if all RabbbitmqClusters have their default user credentials in a given Vault `Namespace`, we have to configure the operator by overriding the environment variable `OPERATOR_VAULT_NAMESPACE`.

<TODO put a sample kubectl command overriding both Env variables>


### Limitations

* Messaging Topology Operator will not be able to manage RabbitmqClusters that have their default user credentials in different Vault `Namespaces`
