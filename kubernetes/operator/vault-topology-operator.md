---
title: Using Vault with Messaging Topology Kubernetes Operator
displayed_sidebar: kubernetesSidebar
---
# Using Vault with Messaging Topology Kubernetes Operator

If the RabbitmqClusters managed by the Messaging Topology Operator are configured to have their default user credentials
stored in Vault, it may be necessary to configure the Topology Operator with some additional Vault related settings.

### Prerequisites

This guide assumes you have the following:

1. The [RabbitMQ Cluster Operator](./operator-overview) and [Messaging Topology Operator](./install-topology-operator) are installed on the Kubernetes cluster
2. A Vault server is installed on the Kubernetes cluster
3. A *Vault role* must be declared in Vault for the topology operator to use. By default, the topology operator will use a vault role with the name `messaging-topology-operator`. Should we declared a *Vault role* with a different name, we have to configure the operator by overriding the environment variable `OPERATOR_VAULT_ROLE`
4. RabbitMQ's secret in Vault uses [KV secrets engine version 2](https://www.vaultproject.io/docs/secrets/kv/kv-v2) only

### Additional configuration 

In order for the RabbitMQ Messaging Topology operator to authenticate with a Vault server and access RabbitMQ cluster default user credentials it is necessary for the operator container to have the `VAULT_ADDR` environment
variable set to the URL of the Vault server API.

The following environment variables may be optionally set if the defaults are not applicable.

- `OPERATOR_VAULT_ROLE` the name of the Vault role that is used when accessing credentials. Defaults to `messaging-topology-operator`
- `OPERATOR_VAULT_NAMESPACE` the [Vault namespace](https://www.vaultproject.io/docs/enterprise/namespaces) to use when the Messaging Topology operator is authenticating. If not set then the default Vault namespace is assumed. *Vault Namespaces* is a set of features within Vault Enterprise that allows Vault environments to support Secure Multi-tenancy (or SMT) within a single Vault infrastructure. The topology operator assumes that all RabbitmqClusters whose default user credentials are stored in Vault, belong to the same *Vault Namespace*, or tenant. The default *Namespace* is the blank namespace.
- `OPERATOR_VAULT_AUTH_PATH` the auth path that the operator ought to use when authenticating to Vault. Default behaviour is to use the `auth/kubernetes` path

Check out the Messaging Topology Operator's example [vault-support](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples/vault-support) where you can find two convenient scripts that walk you through the required configuration.


### Limitations

* Messaging Topology Operator will not be able to manage RabbitmqClusters that have their default user credentials in different Vault `Namespaces`
