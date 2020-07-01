# Troubleshooting Cluster Operator

This topic describes how to troubleshoot common problems with <%= vars.product_full %>.

## <a id="#errors"></a>Troubleshoot Errors

If you are responding to a specific error or error message, see the following sections:

+ [RabbitMQ Cluster Fails to Deploy](#failed-instance)
+ [Pods Are Not Being Created](#no-pods)
+ [Pods Are Stuck in the Terminating State](#not-terminating-pods)

### RabbitMQ Cluster Fails to Deploy
After creating a RabbitMQ instance, it is not available within a few minutes and RabbitMQ Pods do not run.

Common reasons for such failure are:

1. Incorrect `imagePullSecret` configuration. This prevents the image from being pulled from a Docker registry.
1. Incorrect `storageClassName` configuration.

Potential solution to resolve this issue:

- Correct the <code>imagePullSecret</code> and <code>storageClassName</code>
   configurations. See [imagePullSecret](/using-cluster-operator.html#image-pull-secret),
   [Persistence](/using-cluster-operator.html#persistence), and
   [Update a RabbitMQ Instance](/using.html#update).
- If the issue persists after updating the above configurations, view the status
   of your RabbitMQ cluster resources by following in the procedure in
   <a href='#check-instance-status'>Check the Status of an Instance</a>.

### Pods Are Not Being Created
You see an error such as:

`$ pods POD-NAME is forbidden: unable to validate against any pod security policy: []`
as an event of the underlying `ReplicaSet` of the Kubernetes Operator deployment, or as an
event of the underlying `StatefulSet` of the `RabbitmqCluster`.

This occurs if Pod security policy admission control is enabled for the
Kubernetes cluster, but you have not created the necessary PodSecurityPolicy and
corresponding role-based access control (RBAC) resources.

Potential solution is to create the PodSecurityPolicy and RBAC resources by following the procedure in
[Pod Security Policies](/using-cluster-operator.html#psp)

### Pods Are Stuck in the Terminating State
symptom: "After deleting a RabbitmqCluster instance, some Pods
are stuck in the terminating state. RabbitMQ is still running in the affected Pods.

cause: "The likely cause is a leftover quorum queue in RabbitMQ.",

Potential solution to resolve this issue:

- Ensure there are no messages in the queue, or that it is acceptable to delete those messages.
- Delete the queue by force by running: `kubectl delete pod --force --grace-period=0 POD-NAME`

This example uses a Pod name:

<pre class='hljs terminal'>
$ kubectl delete pod --force rabbit-rollout-restart-rabbitmq-server-1
warning: Immediate deletion does not wait for confirmation that the running resource has been terminated. The resource may continue to run on the cluster indefinitely.
pod 'rabbit-rollout-restart-rabbitmq-server-1' force deleted
</pre>

### <a id='check-instance-status'></a> Check the Status of an Instance

To check if an instance is running and see information about it:

1. View the status of an instance by running

    ```
    kubectl -n NAMESPACE get all
    ```

    Where `NAMESPACE` is the Kubernetes namespace of the instance.

    For example:

<pre class="hljs terminal">
$ kubectl -n p-rmq-instance-1 get all
NAME                            READY   STATUS    RESTARTS   AGE
pod/pivotal-rabbitmq-server-0   1/1     Running   0          2m27s
<br></br>
NAME                                TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                        AGE
service/pivotal-rabbitmq-headless   ClusterIP   None             None        4369/TCP                       2m27s
service/pivotal-rabbitmq-ingress    ClusterIP   10.111.202.183   None        5672/TCP,15672/TCP,15692/TCP   2m28s
<br></br>
NAME                                       READY   AGE
statefulset.apps/pivotal-rabbitmq-server   1/1     2m28s
</pre>

