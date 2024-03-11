---
title: Troubleshooting Messaging Topology Kubernetes Operator
---
# Troubleshooting Messaging Topology Kubernetes Operator

This guide covers the basics of troubleshooting of RabbitMQ Messaging Topology Operator.

### Logs

If some RabbitMQ topology objects could not be created, a good source of information is the Messaging Topology Operator logs.

To inspect the logs, run

```bash
kubectl -n rabbitmq-system logs -l app.kubernetes.io/name=messaging-topology-operator
```


### Status

All custom Messaging Topology Operator resources have a [status subresource](https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/#object-spec-and-status)
that describes the current state of the resource.

For example, to get the status of a queue with name 'my-queue', run:

```bash
kubectl get queues.rabbitmq.com my-queue -oyaml
```

or

```bash
kubectl describe queues.rabbitmq.com my-queue
```

An example status for a queue may look like:

```yaml
apiVersion: rabbitmq.com/v1beta1
kind: Queue
metadata:
  name: my-queue
  namespace: rabbitmq-system
spec:
  ...
status:
  conditions:
  - lastTransitionTime: ""
    status: "True" #  could be true, false, or unknown; false means the last reconciliation has failed
    type: Ready
    Reason: "SuccessfulCreateOrUpdate" # status false result in reason FailedCreateOrUpdate
    Message: "" # set with error message when status is false
```

### kubectl apply succeeds, but no object is created inside RabbitMQ

The Topology Operator relies of the default user `Secret` created by the Cluster Operator. If default user `Secret` does not
have working credentials, the Topology Operator will fail to communicate with RabbitMQ HTTP API. This can happen if `RabbitmqCluster`
object defines a default user and password, for example:

```yaml
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: custom-configuration
spec:
  replicas: 1
  rabbitmq:
    additionalConfig: |
      default_user = some-user
      default_pass = some-pass
```

The above will result in incorrect credentials generated in the default user `Secret`. Attempting to target a `RabbitmqCluster` with a Topology
object will result in an error. For example, the following manifest:

```yaml
apiVersion: rabbitmq.com/v1beta1
kind: Queue
metadata:
  name: my-queue
spec:
  name: qq # name of the queue
  type: quorum
  durable: true
  rabbitmqClusterReference:
    name: custom-configuration
```

The error observed in Topology Operator logs will have the message:

```
Error: API responded with a 401 Unauthorized
```

#### Workaround

Update the default credentials `Secret` with the username and password used in `default_user` and `default_pass`.
