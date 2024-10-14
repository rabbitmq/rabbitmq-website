---
title: Using the RabbitMQ Messaging Topology Kubernetes Operator
---
# Using the RabbitMQ Messaging Topology Kubernetes Operator

Use this information to learn how to deploy Custom Resource objects that will be managed by the Messaging Topology Operator.

## How to Use the RabbitMQ Message Topology Operator {#overview}

If RabbitMQ Messaging Topology Operator is not installed, see the [quickstart information](https://github.com/rabbitmq/messaging-topology-operator/#quickstart) to deploy it.

This information includes the following sections:

* [Cluster Operator Requirements](#requirements)
* [Scope across multiple namespaces](#namespace-scope)
* [Non Operator managed RabbitMQ](#non-operator)
* [Custom Connection URI](#uri-annotation)
* [Queues and policies](#queues-policies)
* [Users and user permissions](#users-permissions)
* [Exchanges and bindings](#exchanges-bindings)
* [Virtual hosts](#vhosts)
* [Federation](#federation)
* [Shovel](#shovel)
* [Update a resource](#update)
* [Delete a resource](#delete)
* [Limitations](#limitations)
* [TLS](#tls)
* [Use HashiCorp Vault](#vault)
* [Configure Log Level for the Operator](#operator-log)
* [Time based Reconciliation](#sync-period)

<p class="note">
  <strong>Note:</strong> Additional information about using the operator on Openshift can be found at
  [Using the RabbitMQ Kubernetes Operators on Openshift](./using-on-openshift).
</p>

## RabbitMQ Cluster Operator Requirements {#requirements}

* Messaging Topology Operator can be used with RabbitMQ clusters deployed using the Kubernetes [Cluster Operator](https://github.com/rabbitmq/cluster-operator).
The minimal version required for Cluster Operator is `2.0.0`.

## Scope Across Multiple Namespaces {#namespace-scope}

Messaging Topology Operator can reconcile its objects in *any* namespace. However, by default, it will limit its interactions to `RabbitmqCluster` objects within
same namespace as the topology object, for example `Queue`. In other words, Messaging Topology Operator will reconcile a `Queue` object, in namespace `default`,
only if `RabbitmqCluster` object is also in namespace `default`.

This is the default behaviour, and it can be customised to allow a specific list of namespaces to allow reconciliation from. To create a list of
allowed namespaces, the `RabbitmqCluster` object has to be annotated with key `rabbitmq.com/topology-allowed-namespaces`, and value a comma-separated list,
without spaces, of namespace names; for example `default,ns1,my-namespace`. The value asterisk `*` can be used to allow **all** namespaces.

Any topology object can be declared to target a `RabbitmqCluster` in a different namespace using `.spec.rabbitmqClusterReference.namespace`. Topology
objects within the same namespace as `RabbitmqCluster` are **always** allowed.

The following YAML declares a `RabbitmqCluster` object that allows topology objects from namespace `my-app`:

```yaml
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: example-rabbit
  namespace: rabbitmq-service
  annotations:
    rabbitmq.com/topology-allowed-namespaces: "my-app"
spec:
  replicas: 1
```

Note that the above YAML specifies namespace `rabbitmq-service`. Then the following YAML will target the above RabbitMQ, from namespace `my-app`.

```yaml
apiVersion: rabbitmq.com/v1beta1
kind: Queue
metadata:
  name: test # name of this custom resource; does not have to the same as the actual queue name
  namespace: my-app
spec:
  name: test-queue # name of the queue
  rabbitmqClusterReference:
    name: example-rabbit
    namespace: rabbitmq-service
```

### Important Information about Forbidden Cross-Namespace Objects {#namespace-scope-note}

If topology objects, for example `Queue`, target a `RabbitmqCluster`, and such `RabbitmqCluster` do not allow requests from the topology object's
namespace, a [status condition](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions) is created with an error message,
and the object **is not reconciled**, until it is updated.

For example, `RabbitmqCluster` in namespace `ns1` allows topologies from `my-app`, and topology object `Queue` in namespace `not-allowed` targets said
`RabbitmqCluster`, Messaging Topology Operator will log an error message, update a status condition in the `Queue` object, and give up reconciling the
`Queue` object. If the `RabbitmqCluster` object is updated to allow topology objects from namespace `not-allowed`, the `Queue` object **must be manually
updated** to trigger a reconciliation; for example, by adding a label to the `Queue` object.

## Non Operator Managed RabbitMQ {#non-operator}

* For any RabbitMQ that's not deployed by [Cluster Operator](https://github.com/rabbitmq/cluster-operator), a connection secret can be provided to create RabbitMQ topology objects.
* This feature is released since Messaging Topology Operator `1.4.0`.

:::important
Note that `spec.rabbitmqClusterReference` is an immutable field. For exampe, `connectionSecret`
name cannot be updated once created
:::

The following manifest creates a queue and uses credentials in kubernetes secret `my-rabbit-creds` to connect to the RabbitMQ server:

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: my-rabbit-creds
type: Opaque
stringData:
  # has to be an existing user
  username: a-user
  password: a-secure-password
  # uri for the management api; when no scheme is provided in the uri, 'http' will be used by default
  uri: https://my.rabbit:15672
---
apiVersion: rabbitmq.com/v1beta1
kind: Queue
metadata:
  name: qq-example
spec:
  name: my-queue
  rabbitmqClusterReference:
    connectionSecret:
      # has to be an existing secret in the same namespace as this Queue object
      name: my-rabbit-creds
```
* If `rabbitmqClusterReference.namespace` is set, a secret from that namespace will be used:

```bash
---
apiVersion: v1
kind: Secret
metadata:
  name: my-rabbit-creds
  namespace: rabbitmq-system
  annotations:
    # has to be "*" or match namespace name(s) where RabbitMQ objects are deployed
    rabbitmq.com/topology-allowed-namespaces: "qq-namespace"
type: Opaque
stringData:
  # has to be an existing user
  username: a-user
  password: a-secure-password
  # uri for the management api; when no scheme is provided in the uri, 'http' will be used by default
  uri: https://my.rabbit:15672
---
apiVersion: rabbitmq.com/v1beta1
kind: Queue
metadata:
  name: qq-example
  namespace: qq-namespace
spec:
  name: my-queue
  rabbitmqClusterReference:
    namespace: rabbitmq-system
    connectionSecret:
      # has to be an existing secret in the namespace specified in rabbitmqClusterReference.namespace
      name: my-rabbit-creds

```
Note that `spec.rabbitmqClusterReference` is an immutable field. For exampe, `connectionSecret`
name cannot be updated once created.

### Cross-Namespace connection secret

Starting with Messaging Topology Operator `1.13`, it is possible to set a `namespace` in the `connectionSecret` object. However, the `Secret`
**must** be annotated with `rabbitmq.com/topology-allowed-namespaces` and have a list of allowed namespaces. For example, a `Secret`
in namespace `central-vault`, annotated with `rabbitmq.com/topology-allowed-namespaces: rabbitmq-service`, can be used by the Topology
Operator to read RabbitMQ credentials, if and only if the Topology object (e.g. `Queue`) is in namespace `rabbitmq-service`.

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: rabbitmq-service-credentials
  namespace: central-vault
  annotations:
    rabbitmq.com/topology-allowed-namespaces: rabbitmq-service
type: Opaque
stringData:
  username: a-user # user must already exist in RabbitMQ
  password: a-secure-password
  uri: https://my.rabbit:15672 # (optional) uri for the management api; when scheme is not provided in uri, operator defaults to 'http'
---
apiVersion: rabbitmq.com/v1beta1
kind: Queue
metadata:
  name: my-queue
  namespace: rabbitmq-service
spec:
  name: my-queue
  rabbitmqClusterReference:
    connectionSecret:
      name: rabbitmq-service-credentials
      namespace: central-vault
```

## Custom Connection URI {#uri-annotation}

* For RabbitmqClusters that cannot be connected by its Kubernetes service object (for example if the TLS certificate is generated for a custom domain, not the Kubernetes service),
you can annotate Rabbitmqclusters with a custom connection URI. Messaging Topology Operator will use the provided information to connect instead of Kubernetes dns.
* This feature is released since Messaging Topology Operator `1.12.0`.

To annotate RabbitmqClusters,
```bash
kubectl annotate rmq RMQ-NAME rabbitmq.com/operator-connection-uri=https://test:1234
```

## Queues and Policies {#queues-policies}

Messaging Topology Operator can declare [queues](/docs/queues) and
[policies](/docs/parameters#how-policies-work) in a RabbitMQ cluster.

The following manifest will create a queue named 'test' in the default vhost:

```bash
apiVersion: rabbitmq.com/v1beta1
kind: Queue
metadata:
  name: test # name of this custom resource; does not have to the same as the actual queue name
  namespace: rabbitmq-system
spec:
  name: test # name of the queue
  autoDelete: false
  durable: true
  rabbitmqClusterReference:
    name: example-rabbit
```

The following manifest will create a policy named 'lazy-queue' in default virtual host:

```bash
apiVersion: rabbitmq.com/v1beta1
kind: Policy
metadata:
  name: policy-example # name of this custom resource
  namespace: rabbitmq-system
spec:
  name: lazy-queue
  pattern: "^lazy-queue-" # matches any queue begins with "lazy-queue-"
  applyTo: "queues"
  definition:
    queue-mode: lazy
  rabbitmqClusterReference:
    name: example-rabbit
```

Note that it's not recommended setting [optional queue arguments](/docs/queues#optional-arguments) on queues directly. Once set,
queue properties cannot be changed. Use [policies](/docs/parameters#policies) instead.

The Messaging Topology repo has more examples on [queues](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples/queues)
and [policies](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples/policies).

### Exchanges and Bindings {#exchanges-bindings}

Messaging Topology Operator can manage [exchanges and bindings](/docs/publishers#basics).
The following manifest will create a fanout exchange:

```bash
apiVersion: rabbitmq.com/v1beta1
kind: Exchange
metadata:
  name: fanout
  namespace: rabbitmq-system
spec:
  name: fanout-exchange # name of the exchange
  type: fanout # default to 'direct' if not provided; can be set to 'direct', 'fanout', 'headers', and 'topic'
  autoDelete: false
  durable: true
  rabbitmqClusterReference:
    name: example-rabbit
```

The following manifest will create a binding between an exchange and a queue:

```bash
apiVersion: rabbitmq.com/v1beta1
kind: Binding
metadata:
  name: binding
  namespace: rabbitmq-system
spec:
  source: test # an existing exchange
  destination: test # an existing queue
  destinationType: queue # can be 'queue' or 'exchange'
  rabbitmqClusterReference:
    name: example-rabbit
```

More examples on [exchanges](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples/exchanges)
and [bindings](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples/bindings).

### Users and User Permissions {#users-permissions}

You can use Messaging Topology Operator to create RabbitMQ users and assign user permissions.
Learn more about user management in the [Access Control guide](/docs/access-control#user-management).

#### Users with auto-generated username and password {#auto-gen-users}

Messaging Topology Operator creates users with generated credentials by default.

The following manifest will create a user with generated username and password and the generated username and password can be
accessed via a Kubernetes secret object:

```yaml
apiVersion: rabbitmq.com/v1beta1
kind: User
metadata:
  name: user-example
  namespace: rabbitmq-system
spec:
  tags:
  - policymaker
  rabbitmqClusterReference:
    name: example-rabbitmq
```

To get the name of the kubernetes secret object that contains the generated username and password, run the following command:

```bash
kubectl get users.rabbitmq.com user-example -o jsonpath='{.status.credentials.name}'
```

Note that the Operator does not monitor the generated secret object and updating the secret object won't update the credentials.
As a workaround, add a label or annotation to `users.rabbitmq.com` object to trigger the Operator to reconcile.

#### Users with provided username and password {#provided-sec-users}

The Operator also supports creating RabbitMQ users with provided credentials. When creating a user with provided username and password, create a kubernetes
secret object contains keys `username` and `password` in its Data field. The Operator does not monitor the provided secret object and updating the secret
object won't update the credentials. As a workaround, add a label or annotation to `users.rabbitmq.com` object to trigger the Operator to reconcile.

The following manifest will create a user with username and password provided from secret 'my-rabbit-user' :

```bash
apiVersion: rabbitmq.com/v1beta1
kind: User
metadata:
  name: import-user-sample
spec:
  tags:
  - policymaker
  - monitoring # other available tags are 'management' and 'administrator'
  rabbitmqClusterReference:
    name: rabbit-example
  importCredentialsSecret:
    name: my-rabbit-user # name of the secret
```

#### Users with password hash and password-less users {#provided-sec-users}

Since Topology Operator `v1.15.0`, it is possible to provide the user password using a SHA-512 hash. Other hash algorithms are not supported in the Topology Operator
resource. To create a user with a password hash, use the field `passwordHash` in the credentials `Secret`:

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: my-user-credentials # IMPORTANT: this Secret name must match .spec.importCredentialsSecret.name field in User object
type: Opaque
stringData:
  username: my-user
  passwordHash: tLXSw48rCJO5gc8zu2UJRxR+RfbmNIJMWA6udRQlb6zVWwZg # SHA-512 hash of "foobarbaz"
---
apiVersion: rabbitmq.com/v1beta1
kind: User
metadata:
  name: my-admin-user
spec:
  tags:
  - administrator
  rabbitmqClusterReference:
    name: test # rabbitmqCluster must exist in the same namespace as this resource
  importCredentialsSecret:
    name: my-user-credentials # must match the name of the Secret
```

If the `passwordHash` field is present, then `password` field is ignored and the resulting credentials `Secret` will contain only the hash.
If the hash is an empty string, a [passwordless user](https://www.rabbitmq.com/docs/passwords#passwordless-users) is created. For example:

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: my-user-credentials
type: Opaque
stringData:
  username: my-user
  passwordHash: ""
```

It is important to note that empty string for `passwordHash` is **NOT** the same as not providing the field at all. In order to generate a passwordless
user, an empty string `""` must be provided as `passwordHash`.

#### User permission object {#user-permissions-obj}

To set user permissions on an existing user, create `permissions.rabbitmq.com` resources.
The following example will assign permissions to user `rabbit-user-1`:

```bash
apiVersion: rabbitmq.com/v1beta1
kind: Permission
metadata:
  name: rabbit-user-1-permission
  namespace: rabbitmq-system
spec:
  vhost: "/"
  user: "rabbit-user-1" # name of the RabbitMQ user
  permissions:
    write: ".*"
    configure: ".*"
    read: ".*"
  rabbitmqClusterReference:
    name: sample
```

More examples on [users](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples/users)
and [permissions](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples/permissions).

## Virtual Hosts {#vhosts}

Messaging Topology Operator can create [virtual hosts](/docs/vhosts).

The following manifest will create a vhost named 'test' in a RabbitmqCluster named 'example-rabbit':

```bash
apiVersion: rabbitmq.com/v1beta1
kind: Vhost
metadata:
  name: test-vhost # name of this custom resource
  namespace: rabbitmq-system
spec:
  name: test # name of the vhost
  rabbitmqClusterReference:
    name: example-rabbit
```

## Federation {#federation}

Messaging Topology Operator can define [Federation upstreams](/docs/federation).

Because a Federation upstream URI contains credentials, it is provided through a Kubernetes Secret object.
The 'uri' key is mandatory for the Secret object. Its value can be either a single URI or a comma-separated list of URIs.

The following manifest will define an upstream named 'origin' in a RabbitmqCluster named 'example-rabbit':

```bash
apiVersion: rabbitmq.com/v1beta1
kind: Federation
metadata:
  name: federation-example
  namespace: rabbitmq-system
spec:
  name: "origin"
  uriSecret:
    # secret must be created in the same namespace as this Federation object; in this case 'rabbitmq-system'
    name: {secret-name}
  ackMode: "on-confirm"
  rabbitmqClusterReference:
    name: example-rabbit
```

More [federation examples](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples/federations).

## Shovel {#shovel}

Messaging Topology Operator can declare [dynamic Shovels](/docs/shovel-dynamic).

Shovel source and destination URIs are provided through a Kubernetes Secret object.
The Secret Object must contain two keys, 'srcUri' and 'destUri', and the value of each key can be either a single URI
or a comma-separated list of URIs.

The following manifest will create a Shovel named 'my-shovel' in a RabbitmqCluster named 'example-rabbit':

```bash
apiVersion: rabbitmq.com/v1beta1
kind: Shovel
metadata:
  name: shovel-example
  namespace: rabbitmq-system
spec:
  name: "my-shovel"
  uriSecret:
    # secret must be created in the same namespace as this Shovel object; in this case 'rabbitmq-system'
    name: {secret-name}
  srcQueue: "the-source-queue"
  destQueue: "the-destination-queue"
  rabbitmqClusterReference:
    name: example-rabbit
```

More [shovels examples](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples/shovels).

## Update Resources {#update}

Some custom resource properties are immutable. Messaging Topology Operator implements [validating webhooks](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook)
to prevent updates on immutable fields. Forbidden updates will be rejected. For example:

```bash
kubectl apply -f test-queue.yaml
Error from server (Forbidden):
...
Resource: "rabbitmq.com/v1beta1, Resource=queues", GroupVersionKind: "rabbitmq.com/v1beta1, Kind=Queue"
Name: "example", Namespace: "rabbitmq-system"
for: "test-queue.yaml": admission webhook "vqueue.kb.io" denied the request: Queue.rabbitmq.com "example" is forbidden: spec.name: Forbidden: updates on name, vhost, and rabbitmqClusterReference are all forbidden
```

Properties that cannot be updated is documented in the [Messaging Topology Operator API docs](https://github.com/rabbitmq/messaging-topology-operator/blob/main/docs/api/rabbitmq.com.ref.asciidoc).

## Delete a Resource {#delete}

Deleting custom resources will delete the corresponding resources in the RabbitMQ cluster. Messaging Topology Operator sets kubernetes
[finalizers](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#finalizers) on all custom
resources. If the object has already been deleted in the RabbitMQ cluster, or the RabbitMQ cluster has been deleted, Messaging Topology
Operator will delete the custom resource without trying to delete the RabbitMQ object.

## Limitations {#limitations}

Messaging Topology Operator does not work for RabbitmqCluster deployed with importing definitions. The Operator reads the default user secret
set in RabbitmqCluster status `status.binding`, if the RabbitmqCluster is deployed with imported definitions, definitions will overwrite the
default user credentials and may cause Messaging Topology Operator not be able to access the RabbitmqCluster. To get around this issue, either
you can create a RabbitmqCluster without importing definitions, or you can manually update the default user kubernetes secret to the actual
user credentials set in the definitions.

## TLS {#tls}

If the RabbitmqClusters managed by the Messaging Topology Operator are configured to serve the Management over HTTPS, there are some additional
steps required to configure Messaging Topology Operator. Follow this [TLS dedicated guide](./tls-topology-operator) to configure
the Operator.

## (Optional) Use HashiCorp Vault {#vault}

If the RabbitmqClusters managed by the Messaging Topology Operator are configured to store their default user credentials in Vault, there are some additional steps requires to configure Messaging Topology Operator. Follow this [Vault dedicated guide](./vault-topology-operator) to configure the operator.

## Configure Log Level for the Operator {#operator-log}

Messaging Topology Operator logs reconciliation results and errors. Operator logs can be inspected by `kubectl -n rabbitmq-system logs -l app.kubernetes.io/name=messaging-topology-operator`.
It uses zap logger which can be configured via passing command line flags in the Operator deployment manifest.

For example, to configure the log level to 'debug':

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: messaging-topology-operator
  namespace: rabbitmq-system
spec:
  template:
    spec:
      containers:
      - args:
        - --zap-log-level=debug
        command:
        - /manager
```

Other available command line flags for the zap logger can be found documented in [controller runtime](https://github.com/kubernetes-sigs/controller-runtime/blob/v0.10.2/pkg/log/zap/zap.go#L240-L246).

### Time Based Reconciliation {#sync-period}

By default, Messaging Topology Operator reconciles topology objects when there are create/update/delete events for that particular custom resource.
From version `1.6.0`, you can configure the Operator to perform reconciliation for all topology objects in a specific frequency by setting an environment variable in the Operator deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  [...]
  name: messaging-topology-operator
  namespace: rabbitmq-system
spec:
  template:
    spec:
      containers:
      - command:
        - /manager
        env:
        - name: SYNC_PERIOD
          value: 5m # needs to be in a format that's readable by golang time.ParseDuration(), e.g. “1000s”, “5.3h” or “20h35m”
...
```

Recreating a deleted queue will *not recovery any messages*.

Note that this frequency applies to all topology objects managed by the Operator.
Depending on how many objects you've created with Topology Operator, reconciling all objects in a frequency
could cause unnecessary load on both the Operator and the RabbitMQ server.
Only use this feature if time based reconciliation is required for your use case.
