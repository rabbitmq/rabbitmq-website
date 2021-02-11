# RabbitMQ Cluster Operator Plugin for kubectl

This guide covers the RabbitMQ Cluster Operator plugin for kubectl.
This plugin makes it easy to install the [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/operator-overview.html).
into any Kubernetes instance and offers several commands for common workflows with RabbitMQ clusters.

The only prerequisites to using the plugin are a working installation of kubectl and krew.

1. [Install the plugin](#install)
2. [Using the plugin](#using)

Each plugin command automates many interactions with the kubernetes API and the RabbitMQ cluster operator.
For a more detailed guide on using the operator and how to deploy Custom Resource objects it manages, see the
[Using RabbitMQ Cluster Operator](/kubernetes/operator/using-operator.html) page.
---
## <a id='install' class='anchor' href='#install'>Install the plugin</a>

### <a id='krew' class='anchor' href='#krew'>Setup Krew</a>

[Krew](https://krew.sigs.k8s.io/docs/user-guide/setup/install/) is the plugin manager for kubectl command-line tool. 

After installing `krew`, verify the installation:

<pre class="lang-bash">
kubectl krew
</pre>

### <a id='install-plugin' class='anchor' href='#install-plugin'>Install kubectl RabbitMQ plugin</a>

With krew setup we can go ahead and install the RabbitMQ Cluster Operator plugin.

<pre class="lang-bash">
kubectl krew install rabbitmq
</pre>

To verify the installation, get the list of available commands:

<pre class="lang-bash">
kubectl rabbitmq help
# USAGE:
#   Install RabbitMQ Cluster Operator (optionally provide image to use a relocated image or a specific version)
#     kubectl rabbitmq install-cluster-operator [IMAGE]
# [...]
</pre>

---
## <a id='using' class='anchor' href='#using'>Using the Plugin</a>

### <a id='create-rmq' class='anchor' href='#create-rmq'>Create a RabbitMQ cluster</a>

<pre class="lang-bash">
kubectl rabbitmq create INSTANCE
</pre>

This will create RabbitMQ cluster with some basic configuration where only the cluster name is configured.

### <a id='get-rmq' class='anchor' href='#get-rmq'>Get a RabbitMQ cluster</a>

<pre class="lang-bash">
kubectl rabbitmq get INSTANCE
</pre>

Display all of the kubernetes resources associated with the named RabbitMQ cluster including
pods, configmaps, statefulsets, services and secrets.

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

### <a id='list-rmq' class='anchor' href='#list-rmq'>List all RabbitMQ clusters</a>

<pre class="lang-bash">
kubectl rabbitmq list
</pre>

Displays all RabbitMQ clusters deployed by the RabbitMQ cluster operator on the target kubernetes instance.

### <a id='delete-rmq' class='anchor' href='#delete-plugin'>Delete RabbitMQ cluster</a>

<pre class="lang-bash">
kubectl rabbitmq delete INSTANCE
</pre>

Deletes a RabbitMQ cluster, or multiple RabbitMQ clusters. When deleting multiple RabbitMQ clusters, provide a space
separated list.

<pre class="lang-bash">
kubectl rabbitmq delete rmq1 rmq2 rmq3
</pre>

### <a id='secrets' class='anchor' href='#secrets'>Print default user secrets</a>

<pre class="lang-bash">
kubectl rabbitmq secrets INSTANCE
</pre>

Displays the default user secrets for the named RabbitMQ cluster

### <a id='manage' class='anchor' href='#manage'>Open the Management UI</a>

<pre class="lang-bash">
kubectl rabbitmq manage INSTANCE
</pre>

Opens the RabbitMQ [Management UI](/management.html) in a browser.

### <a id='debug' class='anchor' href='#debug'>Set Log Level to debug</a>

<pre class="lang-bash">
kubectl rabbitmq debug INSTANCE
</pre>

Sets the log level on all nodes to debug. For a detailed breakdown on RabbitMQ logging
see the [Logging guide](/logging.html).

### <a id='tail' class='anchor' href='#tail'>Tail Logs</a>

<pre class="lang-bash">
kubectl rabbitmq tail INSTANCE
</pre>

Attach to live log output from all RabbitMQ nodes. This requires the `tail` plugin for `kubectl`.
Install it with

<pre class="lang-bash">
kubectl krew install tail
</pre>

### <a id='observe' class='anchor' href='#observe'>Observe</a>

<pre class="lang-bash">
kubectl rabbitmq observe INSTANCE INDEX
</pre>

Opens the [`rabbitmq-diagnostics`](/rabbitmq-diagnostics.8.html) observer interface for a given node.

### <a id='feature-flags' class='anchor' href='#feature-flags'>Enable All Feature Flags</a>

<pre class="lang-bash">
kubectl rabbitmq enable-all-feature-flags INSTANCE 
</pre>

This command uses [`rabbitmqctl`](/cli.html) to enable all possible [feature flags](/feature-flags.html).

### <a id='pause-reconciliation' class='anchor' href='#pause-reconciliation'>Pause Reconciliation</a>

<pre class="lang-bash">
kubectl rabbitmq pause-reconciliation INSTANCE 
</pre>

This adds the label "rabbitmq.com/pauseReconciliation=true" to the target RabbitMQ cluster.
The label prevents the Operator from watching and updating the instance.

### <a id='resume-reconciliation' class='anchor' href='#resume-reconciliation'>Resume Reconciliation</a>

<pre class="lang-bash">
kubectl rabbitmq resume-reconciliation INSTANCE 
</pre>

Instructs the operator to resume reconciliation for a RabbitMQ cluster.

### <a id='list-pause-reconciliation-instances' class='anchor' href='#list-pause-reconciliation-instances'>List Instances with Paused Reconciliation</a>

<pre class="lang-bash">
kubectl rabbitmq [list pause reconciliation instances](list-pause-reconciliation-instances) INSTANCE
</pre>

Lists all instances that are not being reconciled by the operator.


### <a id='perf-test' class='anchor' href='#perf-test'>Perf Test</a>

<pre class="lang-bash">
kubectl rabbitmq perf-test INSTANCE --rate 100
</pre>

Runs [perf-test](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/) against an instance. You can pass as many perf test parameters as you like here.

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

---
Please submit feedback and feature requests for the RabbitMQ Cluster Operator [on GitHub](https://github.com/rabbitmq/cluster-operator).
