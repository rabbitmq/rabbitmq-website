# &product-name; Cluster Operator Plugin for kubectl

Installing the RabbitMQ Cluster Operator plugin for kubectl makes installing the [RabbitMQ Cluster Kubernetes Operator](./operator-overview.html) into any Kubernetes instance easier because each plugin command automates many interactions with the kubernetes API and the RabbitMQ Cluster Operator. The plugin also includes several commands for common workflows with RabbitMQ clusters.

To find out more about using the RabbitMQ Cluster operator and how to deploy Custom Resource objects it manages, refer to the
[Using RabbitMQ Cluster Operator](./using-operator.html) information.

## Before Installing the RabbitMQ Cluster Operator Plugin for kubectl

Ensure you have the following tools installed: 

* [Krew](https://krew.sigs.k8s.io/docs/user-guide/setup/install/) is the plugin manager for kubectl command-line tool. 
* [kubectl](https://kubernetes.io/docs/tasks/tools/)

After installing `krew`, verify the installation:

<pre class="lang-bash">
kubectl krew
</pre>

### <a id='install' class='anchor' href='#install'>Install the Cluster Operator Plugin for kubectl</a>

When krew is setup, you can now install the RabbitMQ Cluster Operator plugin.

<pre class="lang-bash">
kubectl krew install rabbitmq
</pre>

To verify the plugin is installed, get the list of available commands:

<pre class="lang-bash">
kubectl rabbitmq help
# USAGE:
#   Install RabbitMQ Cluster Operator (optionally provide image to use a relocated image or a specific version)
#     kubectl rabbitmq install-cluster-operator [IMAGE]
# [...]
</pre>

---
## <a id='using' class='anchor' href='#using'>Using the Cluster Operator Plugin for kubectl</a>

### <a id='create-rmq' class='anchor' href='#create-rmq'>Create a RabbitMQ Cluster</a>

<pre class="lang-bash">
kubectl rabbitmq create INSTANCE
</pre>

The previous command creates a RabbitMQ cluster with some basic configuration where only the cluster name is configured.

### <a id='get-rmq' class='anchor' href='#get-rmq'>Get a RabbitMQ Cluster</a>

<pre class="lang-bash">
kubectl rabbitmq get INSTANCE
</pre>

Display all of the kubernetes resources associated with the named RabbitMQ cluster including pods, configmaps, statefulsets, services, and secrets.

<pre class="lang-bash">
NAME                     READY   STATUS    RESTARTS   AGE
pod/hello-rmq-server-0   0/1     Pending   0          5h31m

NAME                               DATA   AGE
configmap/hello-rmq-plugins-conf   1      5h31m
configmap/hello-rmq-server-conf    2      5h31m

NAME                                READY   AGE
statefulset.apps/hello-rmq-server   0/1     5h31m

NAME                      TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)              AGE
service/hello-rmq         ClusterIP   10.100.156.4   none        5672/TCP,15672/TCP   5h31m
service/hello-rmq-nodes   ClusterIP   None           none        4369/TCP,25672/TCP   5h31m

NAME                             TYPE     DATA   AGE
secret/hello-rmq-default-user    Opaque   3      5h31m
secret/hello-rmq-erlang-cookie   Opaque   1      5h31m
</pre>

### <a id='list-rmq' class='anchor' href='#list-rmq'>List all RabbitMQ Clusters</a>

<pre class="lang-bash">
kubectl rabbitmq list
</pre>

The previous commands lists all RabbitMQ clusters deployed by the RabbitMQ cluster operator on the target kubernetes instance.

### <a id='delete-rmq' class='anchor' href='#delete-plugin'>Delete a RabbitMQ Cluster</a>

<pre class="lang-bash">
kubectl rabbitmq delete INSTANCE
</pre>

The previous command deletes a RabbitMQ cluster, or multiple RabbitMQ clusters. When deleting multiple RabbitMQ clusters, provide a space
separated list.

<pre class="lang-bash">
kubectl rabbitmq delete rmq1 rmq2 rmq3
</pre>

### <a id='secrets' class='anchor' href='#secrets'>Print Default User Secrets for the RabbitMQ Cluster</a>

<pre class="lang-bash">
kubectl rabbitmq secrets INSTANCE
</pre>

The previous command lists the default user secrets for the named RabbitMQ cluster.

### <a id='manage' class='anchor' href='#manage'>Open the RabbitMQ Management UI</a>

<pre class="lang-bash">
kubectl rabbitmq manage INSTANCE
</pre>

The previous command opens the RabbitMQ [Management UI](../../management.html) in a browser.

### <a id='debug' class='anchor' href='#debug'>Set the Log Level on all RabbitMQ Nodes for Debugging</a>

<pre class="lang-bash">
kubectl rabbitmq debug INSTANCE
</pre>

The previous command sets the log level on all nodes to debug. For a detailed breakdown on RabbitMQ logging, refer to the [Logging](../../logging.html) information.

### <a id='tail' class='anchor' href='#tail'>Tail Logs</a>

<pre class="lang-bash">
kubectl rabbitmq tail INSTANCE
</pre>

After running the previous command, you will see all log output for the remote RabbitMQ nodes on your console. Note, to run the previous command, you must have the `tail` plugin installed.

Install the `tail` plugin by running the following command:

<pre class="lang-bash">
kubectl krew install tail
</pre>

### <a id='observe' class='anchor' href='#observe'>Observe Nodes on the RabbitMQ Cluster</a>

<pre class="lang-bash">
kubectl rabbitmq observe INSTANCE INDEX
</pre>

The previous command opens the [`rabbitmq-diagnostics`](../../rabbitmq-diagnostics.8.html) observer interface for a given node.

### <a id='feature-flags' class='anchor' href='#feature-flags'>Turn on All Feature Flags</a>

<pre class="lang-bash">
kubectl rabbitmq enable-all-feature-flags INSTANCE 
</pre>

The previous command uses [`rabbitmqctl`](../../cli.html) to activate or turn on all possible [feature flags](../../feature-flags.html).

### <a id='pause-reconciliation' class='anchor' href='#pause-reconciliation'>Pause Reconciliation on the RabbitMQ Cluster</a>

<pre class="lang-bash">
kubectl rabbitmq pause-reconciliation INSTANCE 
</pre>

The previous command adds the label "rabbitmq.com/pauseReconciliation=true" to the target RabbitMQ cluster. The label prevents the Operator from watching and updating the instance.

### <a id='resume-reconciliation' class='anchor' href='#resume-reconciliation'>Resume Reconciliation on the RabbitMQ Cluster</a>

<pre class="lang-bash">
kubectl rabbitmq resume-reconciliation INSTANCE 
</pre>

The previous command instructs the Operator to resume reconciliation for a RabbitMQ cluster.

### <a id='list-pause-reconciliation-instances' class='anchor' href='#list-pause-reconciliation-instances'>List Instances with Paused Reconciliation</a>

<pre class="lang-bash">
kubectl rabbitmq [list pause reconciliation instances](list-pause-reconciliation-instances) INSTANCE
</pre>

The previous command lists all instances that are not being reconciled by the Operator.

### <a id='perf-test' class='anchor' href='#perf-test'>Perf Test</a>

<pre class="lang-bash">
kubectl rabbitmq perf-test INSTANCE --rate 100
</pre>

The previous command runs [perf-test](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/) against an instance. You can pass as many perf test parameters as you like here.

To monitor PerfTest, add the following ServiceMonitor:
<pre class="lang-yaml">
  apiVersion: monitoring.coreos.com/v1
  kind: ServiceMonitor
  metadata:
    name: kubectl-perf-test
  spec:
    endpoints:
    - interval: 15s
      targetPort: 8080
    selector:
      matchLabels:
        app: perf-test
</pre>

Please submit feedback and feature requests for the RabbitMQ Cluster Operator [on GitHub](https://github.com/rabbitmq/cluster-operator).
