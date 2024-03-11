---
title: RabbitMQ Cluster Operator Plugin for kubectl
---
# RabbitMQ Cluster Operator Plugin for kubectl

Installing the RabbitMQ Cluster Operator plugin for kubectl makes installing the [RabbitMQ Cluster Kubernetes Operator](./operator-overview) into any Kubernetes instance easier because each plugin command automates many interactions with the kubernetes API and the RabbitMQ Cluster Operator. The plugin also includes several commands for common workflows with RabbitMQ clusters.

To find out more about using the RabbitMQ Cluster operator and how to deploy Custom Resource objects it manages, refer to the
[Using RabbitMQ Cluster Operator](./using-operator) information.

## Before Installing the RabbitMQ Cluster Operator Plugin for kubectl

Ensure you have the following tools installed: 

* [Krew](https://krew.sigs.k8s.io/docs/user-guide/setup/install/) is the plugin manager for kubectl command-line tool. 
* [kubectl](https://kubernetes.io/docs/tasks/tools/)

After installing `krew`, verify the installation:

```bash
kubectl krew
```

### Install the Cluster Operator Plugin for kubectl {#install}

When krew is setup, you can now install the RabbitMQ Cluster Operator plugin.

```bash
kubectl krew install rabbitmq
```

To verify the plugin is installed, get the list of available commands:

```bash
kubectl rabbitmq help
# USAGE:
#   Install RabbitMQ Cluster Operator (optionally provide image to use a relocated image or a specific version)
#     kubectl rabbitmq install-cluster-operator [IMAGE]
# [...]
```

---
## Using the Cluster Operator Plugin for kubectl {#using}

### Create a RabbitMQ Cluster {#create-rmq}

```bash
kubectl rabbitmq create INSTANCE
```

The previous command creates a RabbitMQ cluster with some basic configuration where only the cluster name is configured.

### Get a RabbitMQ Cluster {#get-rmq}

```bash
kubectl rabbitmq get INSTANCE
```

Display all of the kubernetes resources associated with the named RabbitMQ cluster including pods, configmaps, statefulsets, services, and secrets.

```bash
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
```

### List all RabbitMQ Clusters {#list-rmq}

```bash
kubectl rabbitmq list
```

The previous commands lists all RabbitMQ clusters deployed by the RabbitMQ cluster operator on the target kubernetes instance.

### Delete a RabbitMQ Cluster {#delete-rmq}

```bash
kubectl rabbitmq delete INSTANCE
```

The previous command deletes a RabbitMQ cluster, or multiple RabbitMQ clusters. When deleting multiple RabbitMQ clusters, provide a space
separated list.

```bash
kubectl rabbitmq delete rmq1 rmq2 rmq3
```

### Print Default User Secrets for the RabbitMQ Cluster {#secrets}

```bash
kubectl rabbitmq secrets INSTANCE
```

The previous command lists the default user secrets for the named RabbitMQ cluster.

### Open the RabbitMQ Management UI {#manage}

```bash
kubectl rabbitmq manage INSTANCE
```

The previous command opens the RabbitMQ [Management UI](/docs/management) in a browser.

### Set the Log Level on all RabbitMQ Nodes for Debugging {#debug}

```bash
kubectl rabbitmq debug INSTANCE
```

The previous command sets the log level on all nodes to debug. For a detailed breakdown on RabbitMQ logging, refer to the [Logging](/docs/logging) information.

### Tail Logs {#tail}

```bash
kubectl rabbitmq tail INSTANCE
```

After running the previous command, you will see all log output for the remote RabbitMQ nodes on your console. Note, to run the previous command, you must have the `tail` plugin installed.

Install the `tail` plugin by running the following command:

```bash
kubectl krew install tail
```

### Observe Nodes on the RabbitMQ Cluster {#observe}

```bash
kubectl rabbitmq observe INSTANCE INDEX
```

The previous command opens the [`rabbitmq-diagnostics`](/docs/man/rabbitmq-diagnostics.8) observer interface for a given node.

### Turn on All Feature Flags {#feature-flags}

```bash
kubectl rabbitmq enable-all-feature-flags INSTANCE 
```

The previous command uses [`rabbitmqctl`](/docs/cli) to activate or turn on all possible [feature flags](/docs/feature-flags).

### Pause Reconciliation on the RabbitMQ Cluster {#pause-reconciliation}

```bash
kubectl rabbitmq pause-reconciliation INSTANCE 
```

The previous command adds the label "rabbitmq.com/pauseReconciliation=true" to the target RabbitMQ cluster. The label prevents the Operator from watching and updating the instance.

### Resume Reconciliation on the RabbitMQ Cluster {#resume-reconciliation}

```bash
kubectl rabbitmq resume-reconciliation INSTANCE 
```

The previous command instructs the Operator to resume reconciliation for a RabbitMQ cluster.

### List Instances with Paused Reconciliation {#list-pause-reconciliation-instances}

```bash
kubectl rabbitmq [list pause reconciliation instances](list-pause-reconciliation-instances) INSTANCE
```

The previous command lists all instances that are not being reconciled by the Operator.

### Perf Test {#perf-test}

```bash
kubectl rabbitmq perf-test INSTANCE --rate 100
```

The previous command runs [perf-test](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/) against an instance. You can pass as many perf test parameters as you like here.

To monitor PerfTest, add the following ServiceMonitor:
```yaml
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
```

Please submit feedback and feature requests for the RabbitMQ Cluster Operator [on GitHub](https://github.com/rabbitmq/cluster-operator).
