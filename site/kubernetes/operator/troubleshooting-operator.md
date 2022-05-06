# Troubleshooting Cluster Operator

This guide describes how to troubleshoot common problems with RabbitMQ Cluster Kubernetes Operator.

This guide may be helpful for DIY RabbitMQ on Kubernetes deployments but such environments
are not its primary focus.


## <a id="errors" class="anchor" href="#errors">Common Scenarios and Errors</a>

Certain errors have dedicated sections:

+ [RabbitMQ cluster fails to deploy](#cluster-fails-to-deploy)
+ [Pods are not being created](#pods-are-not-created)
+ [Pods are stuck in the terminating state](#pods-stuck-in-terminating-state)
+ [Cluster Operator fails on startup](#operator-failure-on-startup)

### <a id="cluster-fails-to-deploy" class="anchor" href="#cluster-fails-to-deploy">RabbitMQ Cluster Fails to Deploy</a>

After creating a RabbitMQ instance, it is not available within a few minutes and RabbitMQ pods are not running.

Common reasons for such failure are:

 * Insufficient CPU or memory in the cluster
 * Incorrect `imagePullSecrets` configuration. This prevents the image from being pulled from a Docker registry.
 * Incorrect `storageClassName` configuration.

Potential solution to resolve this issue:

 * Run `kubectl describe pod POD-NAME` to see if there are any warnings (eg. `0/1 nodes are available: 1 Insufficient memory.`)
 * Correct the <code>imagePullSecrets</code> and <code>storageClassName</code>
   configurations. See [imagePullSecrets](/kubernetes/operator/using-operator.html#image-pull-secrets),
   [Persistence](/kubernetes/operator/using-operator.html#persistence), and
   [Update a RabbitMQ Instance](/kubernetes/operator/using-operator.html#update).
 * If the issue persists after updating the above configurations, view the status
   of your RabbitMQ cluster resources by following in the procedure in
   [Check the Status of an Instance](#check-instance-status)

If deploying to a resource-constrained cluster (eg. local environments like `kind` or `minikube`), you may need to adjust CPU and/or memory limits of the cluster.
Check the [resource-limits example](https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples/resource-limits) to see how to do this.

### <a id="pods-are-not-created" class="anchor" href="#pods-are-not-created">Pods Are Not Being Created</a>

An error such as

<pre class="lang-plaintext">
pods POD-NAME is forbidden: unable to validate against any pod security policy: []
</pre>

as an event of the underlying `ReplicaSet` of the Kubernetes Operator deployment, or as an
event of the underlying `StatefulSet` of the `RabbitmqCluster`.

This occurs if pod security policy admission control is enabled for the
Kubernetes cluster, but you have not created the necessary `PodSecurityPolicy` and
corresponding role-based access control (RBAC) resources.

Potential solution is to create the PodSecurityPolicy and RBAC resources by following the procedure in
[Pod Security Policies](/kubernetes/operator/using-operator.html#psp).

### <a id="pods-stuck-in-terminating-state" class="anchor" href="#pods-stuck-in-terminating-state">Pods Are Stuck in the Terminating State</a>

symptom: "After deleting a RabbitmqCluster instance, some Pods
are stuck in the terminating state. RabbitMQ is still running in the affected Pods."

cause: "The likely cause is a leftover quorum queue in RabbitMQ."

Potential solution to resolve this issue:

 * Ensure there are no messages in the queue, or that it is acceptable to delete those messages.
 * Delete the queue by force by running:

<pre class="lang-bash">
kubectl delete pod --force --grace-period=0 POD-NAME
</pre>

This example uses a Pod name:

<pre class="lang-bash">
kubectl delete pod --force rabbit-rollout-restart-server-1
# warning: Immediate deletion does not wait for confirmation that the running resource has been terminated. The resource may continue to run on the cluster indefinitely.
# pod 'rabbit-rollout-restart-server-1' force deleted
</pre>

### <a id='check-instance-status'></a> Check the Status of an Instance

To view the status of an instance by running, use

<pre class="lang-bash">
kubectl -n NAMESPACE get all
</pre>

Where `NAMESPACE` is the Kubernetes namespace of the instance.

For example:

<pre class="lang-bash">
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
</pre>

### <a id="operator-failure-on-startup" class="anchor" href="#operator-failure-on-startup">Cluster Operator Fails on Startup</a>

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
