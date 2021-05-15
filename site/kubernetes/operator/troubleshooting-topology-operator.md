# Troubleshooting Messaging Topology Kubernetes Operator

This guide covers the basics of troubleshooting of RabbitMQ Messaging Topology Operator.

### Logs

If some RabbitMQ topology objects could not be created, a good source of information is the Messaging Topology Operator logs.

To inspect the logs, run

<pre class="lang-bash">
kubectl -n rabbitmq-system logs -l app.kubernetes.io/name=messaging-topology-operator
</pre>


### Status

All custom Messaging Topology Operator resources have a [status subresource](https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/#object-spec-and-status)
that describes the current state of the resource.

For example, to get the status of a queue with name 'my-queue', run:

<pre class="lang-bash">
kubectl get queues.rabbitmq.com my-queue -oyaml
</pre>

or

<pre class="lang-bash">
kubectl describe queues.rabbitmq.com my-queue
</pre>

An example status for a queue may look like:

<pre class="lang-yaml">
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
</pre>