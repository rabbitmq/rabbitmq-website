---
title: Troubleshooting the Cluster Operator
---
# Troubleshooting the Cluster Operator

Use this information to troubleshoot common problems with the RabbitMQ Cluster Kubernetes Operator.

Note, the following information may be helpful for "do it yourself" (DIY) RabbitMQ on Kubernetes deployments but such environments are not its primary focus.

## Common Scenarios and Errors {#errors}

Certain errors have dedicated sections:

+ [RabbitMQ cluster fails to deploy](#cluster-fails-to-deploy)
+ [Pods are not being created](#pods-are-not-created)
+ [Pods restart on startup](#pods-restart-on-startup)
+ [Pods are stuck in the terminating state](#pods-stuck-in-terminating-state)
+ [Cluster Operator fails on startup](#operator-failure-on-startup)
+ [RabbitMQ cluster status conditions](#status-conditions)

### RabbitMQ Cluster Fails to Deploy {#cluster-fails-to-deploy}

After creating a RabbitMQ instance, it is not available within a few minutes and RabbitMQ pods are not running.

Common reasons for such failure are:

 * Insufficient CPU or memory in the cluster
 * Incorrect `imagePullSecrets` configuration. This prevents the image from being pulled from a Docker registry.
 * Incorrect `storageClassName` configuration.

Potential solution to resolve this issue:

 * Run `kubectl describe pod POD-NAME` to see if there are any warnings (eg. `0/1 nodes are available: 1 Insufficient memory.`)
 * Correct the <code>imagePullSecrets</code> and <code>storageClassName</code>
   configurations. See [imagePullSecrets](./using-operator#image-pull-secrets),
   [Persistence](./using-operator#persistence), and
   [Update a RabbitMQ Instance](./using-operator#update).
 * If the issue persists after updating the above configurations, view the status
   of your RabbitMQ cluster resources by following in the procedure in
   [Check the Status of an Instance](#pods-stuck-in-terminating-state)

If deploying to a resource-constrained cluster (eg. local environments like `kind` or `minikube`), you may need to adjust CPU and/or memory limits of the cluster.
Check the [resource-limits example](https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples/resource-limits) to see how to do this.

### Pods Are Not Being Created {#pods-are-not-created}

An error such as

```
pods POD-NAME is forbidden: unable to validate against any pod security policy: []
```

as an event of the underlying `ReplicaSet` of the Kubernetes Operator deployment, or as an
event of the underlying `StatefulSet` of the `RabbitmqCluster`.

This occurs if pod security policy admission control is enabled for the
Kubernetes cluster, but you have not created the necessary `PodSecurityPolicy` and
corresponding role-based access control (RBAC) resources.

Potential solution is to create the PodSecurityPolicy and RBAC resources by following the procedure in
[Pod Security Policies](./using-operator#psp).

### Pods Restart on Startup {#pods-restart-on-startup}
The RabbitMQ container might fail at Pod startup and log a message such as

```
epmd error for host rabbitmq-server-1.rabbitmq-nodes.mynamespace: nxdomain (non-existing domain)
```
or
```
Error during startup: {error,no_epmd_port}
```

The Pod restarts and becomes `Ready` eventually.

Since RabbitMQ nodes [resolve their own and peer hostnames during boot](/docs/clustering#hostname-resolution-requirement),
CoreDNS [caching timeout may need to be decreased](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id) from default 30 seconds
to a value in the 5-10 seconds range.

### Pods in CrashLoopBackOff State {#pods-crash-loop}

Since Kubernetes restarts failing pods, if a RabbitMQ node can't start, it will likely enter
the CrashLoopBackOff state - it attempts to start, fails and is restarted again. In such situations
it might be hard to debug or fix the problem, if that requires accessing the pod or its data.

One of the ways to debug such a situation is to create a new pod that is not part of the StatefulSet
but has the same persistent volume mounted. Here's an example of a Pod definition that mounts the
persistent volume of a RabbitMQ node:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: debug-rabbitmq
spec:
  volumes:
    - name: persistence
      persistentVolumeClaim:
        claimName: persistence-RMQ_NAME-server-2
  containers:
    - name: debug-rabbitmq
      image: ... # you can use any image here, but for some tasks you should use the same image you use in the statefulset
      command: ["/bin/sleep", "36000"]
      volumeMounts:
        - mountPath: /var/lib/rabbitmq/mnesia/
          name: persistence
```

Once you are done, exit the pod and delete it.

### Recreate a Node {#recreate-node}

In some cases, a node must be decomissioned (permanently removed from the cluster) and replaced with a new node.
The new node will then synchronize the data from its peers.

The process of node replacement with the Operator looks like so:

:::danger

The procedure below completely deletes a pod (RabbitMQ node) and its disk.
This means that all non-replicated data from that node will be lost. Make sure you understand the consequences.

:::

In this example, we assume that we want to recreate server-2. Adjust the commands if you want to delete a different node.

1. `kubectl rabbitmq pause-reconciliation RMQ_NAME` (or add a label if you don't have the kubectl-rabbitmq plugin/CLI) - this means the Operator won't "fix" (overwrite) manual changes to the underlying objects
1. `kubectl delete statefulset --cascade=orphan RMQ_NAME-server` - delete the statefulset so that it doesn't "fix" the pods (recreate the missing pod after we delete it)
1. `kubectl delete pod RMQ_NAME-server-2` (you can delete any pod you want here)
1. `kubectl delete pvc persistence-RMQ_NAME-server-2` (if `persistentVolumeReclaimPolicy` is set to `Delete`, this will delete the PV and all the data on this node)
1. `kubectl delete pv PV_NAME` (only needed if `persistentVolumeReclaimPolicy` is set to `Retain`; this will delete the PV and all the data on this node)
1. `rabbitmqctl forget_cluster_node rabbit@RMQ_NAME-server-2.RMQ_NAME-nodes.NAMESPACE` (from any of the running nodes) - remove the deleted node from the cluster
1. `kubectl rabbitmq resume-reconciliation RMQ_NAME` (or delete the label) - the Operator will recreate the StatefulSet, the StatefulSet will recreate the missing pod; the node should join the cluster
1. Expand the quorum queues and streams to the new node:
   * `rabbitmq-queues grow rabbit@RMQ_NAME-server-2.RMQ_NAME-nodes.NAMESPACE all`
   * `rabbitmq-streams add_replica STREAM_NAME rabbit@RMQ_NAME-server-2.RMQ_NAME-nodes.NAMESPACE`

### Pods Are Stuck in the Terminating State {#pods-stuck-in-terminating-state}

symptom: "After deleting a RabbitmqCluster instance, some Pods
are stuck in the terminating state. RabbitMQ is still running in the affected Pods."

cause: "The likely cause is a leftover quorum queue in RabbitMQ."

Potential solution to resolve this issue:

 * Ensure there are no messages in the queue, or that it is acceptable to delete those messages.
 * Delete the queue by force by running:

```bash
kubectl delete pod --force --grace-period=0 POD-NAME
```

This example uses a Pod name:

```bash
kubectl delete pod --force rabbit-rollout-restart-server-1
# warning: Immediate deletion does not wait for confirmation that the running resource has been terminated. The resource may continue to run on the cluster indefinitely.
# pod 'rabbit-rollout-restart-server-1' force deleted
```

To view the status of an instance by running, use

```bash
kubectl -n NAMESPACE get all
```

Where `NAMESPACE` is the Kubernetes namespace of the instance.

For example:

```bash
kubectl -n rmq-instance-1 get all
# NAME                   READY   STATUS    RESTARTS   AGE
# pod/example-server-0   1/1      Running   0          2m27s
<br/>
# NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                        AGE
# service/example-nodes      ClusterIP   None             None        4369/TCP                       2m27s
# service/example            ClusterIP   10.111.202.183   None        5672/TCP,15672/TCP,15692/TCP   2m28s
<br/>
# NAME                             READY   AGE
# statefulset.apps/example-server  1/1     2m28s
```

### Cluster Operator Fails on Startup {#operator-failure-on-startup}

After deploying RabbitMQ Cluster Operator, it fails during startup and its pod is restarted.

Common reasons for such failure are:

 * The Operator can't connect to the Kubernetes API.

Potential solution to resolve this issue:

 * Check whether the Operator is still crashing. Pod restarts solve many interim issues and therefore a restart is a symptom, not a problem.
 * Check the Operator logs (`kubectl -n rabbitmq-system logs -l app.kubernetes.io/name=rabbitmq-cluster-operator`)
 * You may see an error such as:
   * `Failed to get API Group-Resources`
   * `Get https://ADDRESS:443/api: connect: connection refused`
 * Check whether your Kubernetes cluster is healthy, specifically the `kube-apiserver` component
 * Check whether any security network policies could prevent the Operator from reaching the Kubernetes API server

### RabbitMQ cluster status conditions {#status-conditions}

A RabbitMQ instance has status.conditions that describe the current state of the RabbitMQ cluster.
To get the status, run:
```bash
kubectl describe rmq RMQ_NAME
```

Example status conditions may look like:
```yaml
Name:         test-rabbit
Namespace:    rabbitmq-system
API Version:  rabbitmq.com/v1beta1
Kind:         RabbitmqCluster
...
Status:
  Binding:
    Name:  sample-default-user
  Conditions:
    Last Transition Time:  2023-07-07T11:57:10Z
    Reason:                AllPodsAreReady
    Status:                True
    Type:                  AllReplicasReady # true when all RabbitMQ pods are 'ready'
    Last Transition Time:  2023-07-07T11:57:10Z
    Reason:                AtLeastOneEndpointAvailable
    Status:                True
    Type:                  ClusterAvailable # true when at least one RabbitMQ pod is 'ready'
    Last Transition Time:  2023-07-07T11:55:58Z
    Reason:                NoWarnings
    Status:                True
    Type:                  NoWarnings
    Last Transition Time:  2023-07-07T11:57:11Z
    Message:               Finish reconciling
    Reason:                Success
    Status:                True
    Type:                  ReconcileSuccess
...
```
If the status condition `ReconcileSuccess` is false, that means the last reconcile has errored and RabbitMQ cluster configuration could be out of date. Checking out Cluster Operator logs is useful to understand why reconcile failed.

To get Operator logs:

```bash
kubectl -n rabbitmq-system logs -l app.kubernetes.io/name=rabbitmq-cluster-operator
```
