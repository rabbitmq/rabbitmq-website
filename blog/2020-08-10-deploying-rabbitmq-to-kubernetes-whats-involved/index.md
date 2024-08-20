---
title: "Deploying RabbitMQ to Kubernetes: What's Involved?"
tags: ["Introductory", "Kubernetes", "Cloud", "DIY", ]
authors: [mklishin]
---

Over time, we have seen the number of Kubernetes-related queries on our community
[mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users)
and [Slack](https://rabbitmq-slack.herokuapp.com/) channels soar.

In 2024, the answer to most Kubernetes-related question is: [use the Kubernetes Operator](/kubernetes/operator/operator-overview) built by the RabbitMQ Core Team.
 It incorporates all the best practices and is the strongly recommended option.

This post explains the basics
of a DIY deployment of RabbitMQ on Kubernetes: what Kubernetes resources will be necessary, how to make sure
RabbitMQ nodes use durable storage, how to approach configuration of sensitive values, and so on.

<!-- truncate -->

## An Update from 2024

:::tip
Instead of rolling your own deployment of RabbitMQ to Kubernetes, consider [using the Kubernetes Operator](/kubernetes/operator/operator-overview)
built by the RabbitMQ Core Team. It incorporates all the best practices and is the strongly recommended option.
:::


## Introduction

Deploying a stateful data service such as RabbitMQ to Kubernetes without [using the Kubernetes Operator](/kubernetes/operator/operator-overview)
is a bit like assembling a jigsaw puzzle.

There are multiple pieces involved:

 * A [Kubernetes namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
 * A [stateful set](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) for RabbitMQ cluter nodes
 * Ensuring durable storage is used by [node data directories](/docs/relocate)
 * A Kubernetes Secret for [initial RabbitMQ user credentials](/docs/access-control#default-state)
 * A Kubernetes Secret for [inter-node and CLI tool authentication](/docs/clustering#erlang-cookie)
 * A [headless service](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services) for inter-node communication
 * Permissions for RabbitMQ node data directory and configuration file(s)
 * Node [configuration files](/docs/configure#configuration-files)
 * [Pre-enabled plugin file](/docs/plugins#enabled-plugins-file)
 * [Peer discovery](/docs/cluster-formation) settings
 * Kubernetes [access control (RBAC)](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) rules
 * [Liveness and readiness](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes) probes
 * A [load balancer service](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer) for external client connections
 * Resource limits (CPU, memory, disk, network bandwidth)

In this post, we will try to cover the key parts as well as mention a couple
more steps that are not technically required to run RabbitMQ on Kubernetes, but every
production system operator will have to worry about sooner rather than later:

 * How to set up cluster monitoring with Prometheus and Grafana
 * How to deploy a PerfTest instance to do basic functional and load testing of the cluster

This post by no means covers every aspect that may be relevant when deploying
RabbitMQ to Kubernetes; our goal is to highlight the most important parts.
Deployment- and workload-specific decisions such as what [resource limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) to apply
to RabbitMQ node pod (containers), [what kind of durable storage](/blog/2020/06/21/cluster-sizing-case-study-quorum-queues-part-1) to use,
how to approach TLS certificate/key pair rotation, log aggregation, and upgrades are great topics
for separate blog posts. Let us know what you'd like to see in a follow-up!


## Executable Examples

The files that accompany this post can be found in the [DIY RabbitMQ on Kubernetes example repository](https://github.com/rabbitmq/diy-kubernetes-examples).
This post uses a Google Kubernetes Engine (GKE) cluster but Kubernetes concepts are universal.

To follow along the examples,

 * Access to a Kubernetes Cluster
 * The [`kubectl` CLI tool](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

This post assumes that the reader is familiar with [`kubectl` usage basics](https://kubernetes.io/docs/reference/kubectl/overview/)
and the tool is [set up to work with a GKE cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl).


## RabbitMQ Docker Image

We recommend using the [community RabbitMQ Docker image](https://hub.docker.com/_/rabbitmq).
The image is maintained by the [Docker Community](https://github.com/docker-library/rabbitmq) and is built with the latest versions of RabbitMQ,
Erlang and OpenSSL. The image has a variant built with RabbitMQ release candidates for early testing and adoption.

Now let's begin with the first building block of a RabbitMQ cluster running on Kubernetes:
picking a namespace to deploy to.


## Kubernetes Namespace and Permissions (RBAC)

Every set of Kubernetes objects belongs to a [Kubernetes Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/).
RabbitMQ cluster resources are no exception.

We recommend using a dedicated Namespace to keep the RabbitMQ cluster separate from other services that may be deployed
in the Kubernetes cluster.
Having a dedicated namespace makes logical sense and makes it easy to [grant just enough permissions](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) to the cluster nodes. This is a good
security practice.

RabbitMQ's Kubernetes peer discovery plugin relies on the Kubernetes API as a data source.
On first boot, every node
will try to discover their peers using the Kubernetes API and attempt to join them.
Nodes that finish booting emit a [Kubernetes event](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application-introspection/) to make it easier to discover such events in cluster activity (event) logs.

The plugin requires the following access to Kubernetes resources:

 * `get` access to the `endpoints` resource
 * `create` access to the `events` resource

Specify a [Role, Role Binding and a Service Account](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
to configure this access.

An example namespace, along with RBAC rules can be seen in the [rbac.yaml example file](https://github.com/rabbitmq/diy-kubernetes-examples/blob/master/gke/rbac.yaml).

If following from the example, use the following command to create a namespace and the required RBAC rules.
Note that this creates a namespace called `test-rabbitmq`.

```bash
kubectl apply -f namespace.yaml
kubectl apply -f rbac.yaml
```

The `kubectl`  examples below will use the `test-rabbitmq` namespace. This namespace can be set to be the default
one for convenience:

```bash
# set the namespace to be the current (default) one
kubectl config set-context --current --namespace=test-rabbitmq
# verify
kubectl config view --minify | grep namespace:
```

Alternatively, `--namespace="test-rabbitmq"` can be appended to all `kubectl` commands
demonstrated below.


## Use a Stateful Set

RabbitMQ **requires** using a [Stateful Set](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) to deploy a RabbitMQ cluster to Kubernetes.
The Stateful Set ensures that the RabbitMQ nodes are deployed in order, one at a time. This avoids running
into a potential [peer discovery race condition](/docs/cluster-formation#initial-formation-race-condition) when deploying a multi-node RabbitMQ cluster.

There are other, equally important reasons for using a Stateful Set instead of a Deployment:
sticky identity, simple network identifiers, stable persistent storage and the ability to perform
ordered rolling upgrades.

The Stateful Set definition file is packed with detail such as mounting configuration, mounting credentials, opening ports, etc,
which is explained topic-wise in the following sections.

The final Stateful Set file can be found in the [under `gke` directory](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/statefulset.yaml).


## Create a Service For Clustering and CLI Tools

The Stateful Set definition can reference a Service which gives the Pods of the Stateful Set their network identity.
Here, we are referring to the [`v1.StatefulSet.Spec.serviceName` property](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#statefulsetspec-v1-apps).

This is required by RabbitMQ for clustering, and as mentioned in the Kubernetes documentation, has to be created before the Stateful Set.

RabbitMQ uses port 4369 for port 4369 for node discovery and port 25672 for inter-node communication.
Since this Service is used internally and does not need to be exposed,
we create a [Headless Service](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services).
It can be found in the [example headless-service.yaml file](https://github.com/rabbitmq/diy-kubernetes-examples/blob/master/gke/headless-service.yaml).

If following from the example, run the following to create a Headless Service for inter-node
and CLI tool traffic:

```bash
kubectl apply -f rabbitmq-headless.yaml
```

The service now can be observed in the `test-rabbitmq` namespace:

```bash
kubectl get all
# => NAME                        TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)    AGE
# => service/rabbitmq-headless   ClusterIP   None         <none>        4369/TCP   7s
```

## Use a Persistent Volume for Node Data

In order for RabbitMQ nodes to retain data between Pod restarts, node's data directory must use durable storage.
A [Persistent Volume](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) must be attached to each RabbitMQ Pod.

If a transient volume is used to back a RabbitMQ node, the node will lose its identity and all of its
local data in case of a restart.
This includes both [schema](/docs/clustering#cluster-membership) and [durable queue data](/docs/queues#durability).
Syncing all of this data on every node restart would be highly inefficient. In case
of a loss of [quorum](/docs/quorum-queues#what-is-quorum) during
a rolling restart, this will also lead to data loss.

In our [statefulset.yaml example](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/statefulset.yaml#L12-L22),
we create a Persistent Volume Claim to provision a Persistent Volume.

The Persistent Volume is mounted at `/var/lib/rabbitmq/mnesia`. This path is used for a [`RABBITMQ_MNESIA_BASE` location](/docs/relocate): the base directory
for all persistent data of a node.

A description of [default file paths for RabbitMQ](/docs/relocate) can be found in the RabbitMQ documentation.

Node's data directory base can be changed using the `RABBITMQ_MNESIA_BASE` variable if needed. Make sure
to mount a Persistent Volume at the updated path.


## Node Authentication Secret: the Erlang Cookie

RabbitMQ nodes and CLI tools use a shared secret known as [the Erlang Cookie](/docs/clustering#erlang-cookie), to authenticate to each other.
The cookie value is a string of alphanumeric characters up to 255 characters in size. The value must be generated before creating
a RabbitMQ cluster since it is needed by the nodes to [form a cluster](https://github.com/rabbitmq/diy-kubernetes-examples/blob/gke-examples/examples/gke/statefulset.yaml#L72-L75).

With the community Docker image, RabbitMQ nodes will expect the cookie to be at `/var/lib/rabbitmq/.erlang.cookie`.
We recommend creating a Secret and mounting it as a Volume on the Pods at this path.

This is demonstrated in the [statefulset.yaml example](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/statefulset.yaml#L101-L105) file.

The secret is expected to have the following key/value pair:

```yaml
cookie: {value}
```

To create a cookie Secret, run

```bash
echo -n "this secret value is JUST AN EXAMPLE. Replace it!" > cookie
kubectl create secret generic erlang-cookie --from-file=./cookie
```

This will create a Secret with a single key, `cookie`, taken from the file name,
and the file contents as its value.


## Administrator Credentials

RabbitMQ will seed a [default user](/docs/access-control#default-state) with well-known credentials on first boot.
The username and password of this user are both `guest`.

This default user can [only connect from localhost](/docs/access-control#loopback-users) by default.
It is possible to lift this restriction by opting in. This may be useful for testing but **very insecure**.
Instead, an administrative user must be created using generated credentials.

The administrative user credentials should be stored in a [Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/),
and mounting them onto the RabbitMQ Pods.
The `RABBITMQ_DEFAULT_USER` and `RABBITMQ_DEFAULT_PASS` environment variables then can be set to the Secret values.
The community Docker image will use them to [override default user credentials](/docs/access-control#seeding).

[Example for reference](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/statefulset.yaml#L91-L100).

The secret is expected to have the following key/value pair:

```yaml
user: {username}
pass: {password}
```

To create an administrative user Secret, use

```bash
# this is merely an example, you are welcome to use a different username
echo -n "administrator" > user
# this is merely an example, you MUST use a different, generated password value!
echo -n "g3N3rAtED-Pa$$w0rd" > pass
kubectl create secret generic rabbitmq-admin --from-file=./user --from-file=./pass
```

This will create a Secret with two keys, `user` and `pass`, taken from the file names,
and file contents as their respective values.

Users can be create explicitly using CLI tools as well.
See [RabbitMQ doc section on user management](/docs/access-control#seeding) to learn more.

## Node Configuration

There are [several ways](/docs/configure) to configure a RabbitMQ node. The recommended way is to use configuration files.

Configuration files can be expressed as [Config Maps](https://kubernetes.io/docs/concepts/configuration/configmap/),
and mounted as a Volume onto the RabbitMQ pods.

To create a Config Map with RabbitMQ configuration, apply our [minimal configmap.yaml example](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/configmap.yaml):

```bash
kubectl apply -f configmap.yaml
```

### Use an Init Container

Since Kubernetes 1.9.4, Config Maps are mounted as read-only volumes onto Pods. This is problematic for the RabbitMQ community Docker image:
the image can try to update the config file at the time of container startup.

Thus, the path at which the RabbitMQ config is mounted must be read-write. If a read-only file is detected by the Docker image,
you'll see the following warning:

```
touch: cannot touch '/etc/rabbitmq/rabbitmq.conf': Permission denied

WARNING: '/etc/rabbitmq/rabbitmq.conf' is not writable, but environment variables have been provided which request that we write to it
  We have copied it to '/tmp/rabbitmq.conf' so it can be amended to work around the problem, but it is recommended that the read-only
  source file should be modified and the environment variables removed instead.
```

While the Docker image does work around the issue, it is not ideal to store the configuration file in `/tmp` and we recommend instead
making the mount path read-write.

As a few other projects in the Kubernetes community, we use an [init container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) to overcome this.

Examples:

* [The Config Map](https://github.com/rabbitmq/diy-kubernetes-examples/blob/master/examples/minikube/configmap.yaml)
* [Using an Init Container to mount the Config Map](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/statefulset.yml#L30-L64)

### Run The Pod As the `rabbitmq` User

The Docker image [runs as the `rabbitmq` user with uid 999](https://github.com/docker-library/rabbitmq/blob/38bc089c287d05d22b03a4d619f7ad9d9a4501bc/3.8/ubuntu/Dockerfile#L186-L187](https://github.com/docker-library/rabbitmq/blob/38bc089c287d05d22b03a4d619f7ad9d9a4501bc/3.8/ubuntu/Dockerfile#L186-L187)) and writes to the `rabbitmq.conf` file.
Thus, the file permissions on `rabbitmq.conf` must allow this. A [Pod Security Context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/) can be
added to the Stateful Set definition to achieve this.
Set the [`runAsUser`, `runAsGroup` and the `fsGroup`](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/statefulset.yaml#L66-L75) to 999 in the Security Context.

See [Security Context](https://github.com/rabbitmq/diy-kubernetes-examples/blob/gke-examples/examples/gke/statefulset.yaml#L72-L75)
in the Stateful Set definition file.

### Importing Definitions

RabbitMQ nodes can [importi definitions](/docs/definitions) exported from another RabbitMQ cluster.
This may also be done at [node boot time](/docs/definitions#import-on-boot).

Following from the RabbitMQ documentation, this can be done using the following steps:

1. Export definitions from the RabbitMQ cluster you wish to replicate and save the file
1. Create a Config Map with the key being the file name, and the value being the contents of the file (See the `rabbitmq.conf` Config Map example)
1. Mount the Config Map as a Volume on the RabbitMQ Pod in the Stateful Set definition
1. Update the `rabbitmq.conf` Config Map with `load_definitions = /path/to/definitions/file`


## Readiness Probe

Kubernetes uses a check known as the [readiness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) to determine if a pod is ready to serve client traffic.
This is effectively a specialized [health check](/docs/monitoring#health-checks) defined
by the system operator.

When an [ordered pod deployment policy](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#pod-management-policies) is used — and this is the commended option for RabbitMQ clusters —
the probe controls when the Kubernetes controller will consider the currently deployed pod to be ready
and proceed to deploy the next one. This check, if not chosen appropriately, can deadlock a rolling
cluster node restart.

RabbitMQ nodes that belong to a clsuter will [attempt to sync schema from their peers on startup](/docs/clustering#restarting-schema-sync). If no peer comes online within a configurable time window (five minutes by default),
the node will give up and voluntarily stop. Before the sync is complete, the node won't mark itself as fully booted.

Therefore, if a readiness probe assumes that a node is fully booted and running,
**a rolling restart of RabbitMQ node pods using such probe will deadlock**: the probe will never succeed,
and will never proceed to deploy the next pod, which must come online for the original pod to be considered
ready by the deployment.

It is therefore recommended to use a very basic RabbitMQ health check for readiness probe:

```bash
rabbitmq-diagnostics ping
```

While this check is not thorough, it allows all pods to be started and re-join the cluster within a certain time period,
even when pods are restarted one by one, in order.

This is covered in a dedicated section of the RabbitMQ clustering guide: [Restarts and Health Checks (Readiness Probes)](/docs/clustering#restarting-readiness-probes).

The [readiness probe section](https://github.com/rabbitmq/diy-kubernetes-examples/blob/master/examples/gke/statefulset.yaml#L132-L143)
in the Stateful Set definition file demonstrates how to configure a readiness probe.


## Liveness Probe

Similarly to the readiness probe described above, Kubernetes allows for pod health checks using a different health check
called the [liveness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).
The check determines if a pod must be restarted.

As with all [health checks](/docs/monitoring#health-checks), there is no single solution that can be
recommended for all deployments. Health checks can produce false positives, which means reasonably healthy, operational nodes
will be restarted or even destroyed and re-created for no reason, reducing system availability.

Moreover, a RabbitMQ node restart won't necessarily address the issue. For example, restarting a node
that is in an [alarmed state](/docs/alarms) because it is low on available disk space won't help.

All this is to say that **liveness probes must be chosen wisely** and with false positives and "recoverability by a restart"
taken into account. Liveness probes also must [use node-local health checks instead of cluster-wide ones](/docs/monitoring#health-checks).

RabbitMQ CLI tools provide a number of [pre-defined health checks](/docs/monitoring#health-checks) that
vary in how thorough they are, how intrusive they are and how likely they are to produce false positives in different
scenarios, e.g. when the system is under load. The checks are composable and can be combined.
The right liveness probe choice is a system-specific decision. When in doubt, start with a simpler, less intrusive
and less thorough option such as

```bash
rabbitmq-diagnostics -q ping
```

The following checks can be reasonable liveness probe candidates:

```bash
rabbitmq-diagnostics -q check_port_connectivity
```

```bash
rabbitmq-diagnostics -q check_local_alarms
```

Note, however, that they will fail for the nodes [paused by the "pause minority" partition handliner strategy](/docs/partitions).

The [liveness probe section](https://github.com/rabbitmq/diy-kubernetes-examples/blob/master/examples/gke/statefulset.yaml#L119-L131)
in the Stateful Set definition file demonstrates how to configure a liveness probe.


## Plugins

RabbitMQ [supports plugins](/docs/plugins). Some plugins are essential when running RabbitMQ on Kubernetes,
e.g. the Kubernetes-specific peer discovery implementation.

The [`rabbitmq_peer_discovery_k8s` plugin](https://github.com/rabbitmq/diy-kubernetes-examples) is required
to deploy RabbitMQ on Kubernetes.
It is quite common to also enable [`rabbitmq_management` plugin](/docs/management) in order to get a browser-based management UI
and an HTTP API, and [`rabbitmq_prometheus`](/docs/prometheus) for monitoring.

Plugins can be enabled in [different ways](/docs/plugins#ways-to-enable-plugins).
We recommend mounting the plugins file, `enabled_plugins`, to the node configuration directory, `/etc/rabbitmq`.
A Config Map can be used to express the value of the `enabled_plugins` file. It can then be mounted
as a Volume onto each RabbitMQ container in the Stateful Set definition.

In our [configmap.yaml example](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/configmap.yaml) file,
we demonstrate how to popular the the `enabled_plugins` file and mount it under the `/etc/rabbitmq` directory.


## Ports

The final consideration for the Stateful Set is the ports to open on the RabbitMQ Pods.
Protocols supported by RabbitMQ are all TCP-based and require the [protocol ports](/docs/networking#ports) to be opened on the RabbitMQ nodes.
Depending on the plugins that are enabled on a node, the list of required ports can vary.

The example `enabled_plugins` file mentioned above enables a few plugins: `rabbitmq_peer_discovery_k8s` (mandatory), `rabbitmq_management`
and `rabbitmq_prometheus`.
Therefore, the service must [open several ports](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/statefulset.yaml#L106-L118) relevant for the core server and the enabled plugins:

 * `5672`: used by AMQP 0-9-1 and AMQP 1.0 clients
 * `15672`: management UI and  HTTP API)
 * `15692`: Prometheus scraping endpoint)


## Deploy the Stateful Set

These are the key components in the Stateful Set file. Please have a look [at the file](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/statefulset.yaml),
and if following from the example, deploy the Stateful Set:

```bash
kubectl apply -f statefulset.yaml
```

This will start spinning up a RabbitMQ cluster. To watch the progress:

```bash
watch kubectl get all
# => NAME             READY   STATUS    RESTARTS   AGE
# => pod/rabbitmq-0   0/1     Pending   0          8s
# =>
# => NAME                        TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)    AGE
# => service/rabbitmq-headless   ClusterIP   None         <none>        4369/TCP   61m
# =>
# => NAME                        READY   AGE
# => statefulset.apps/rabbitmq   0/1     8s
```

## Create a Service for Client Connections

If all the steps above succeeded, you should have functioning RabbitMQ cluster deployed on Kubernetes! ?
However, having a RabbitMQ cluster on Kubernetes is only useful clients can [connect](/docs/connections) to it.

Time to create a Service to make the cluster accessible to [client connections](/docs/connections).

The type of the Service depends on your use case. The [Kubernetes API reference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#servicespec-v1-core)
gives a good overview of the types of Services available.

In the [client-service.yaml example file](https://github.com/rabbitmq/diy-kubernetes-examples/tree/master/gke/client-service.yaml),
we have gone with a `LoadBalancer` Service.
This gives us an external IP that can be used to access the RabbitMQ cluter.

For example, this should make it possible to visit the RabbitMQ management UI by visiting `{external-ip}:15672`, and signing in.
Client applications can connect to endpoints such as `{external-ip}:5672` (AMQP 0-9-1, AMQP 1.0) or `{external-ip}:1883` (MQTT).
Please refer to the [get started guide](/tutorials) to learn how to use RabbitMQ.

If following from the example, run

```bash
kubectl apply -f client-service.yaml
```

to create a Service of type LoadBalancer with an external IP address. To find out what the external IP address is,
use `kubectl get svc`:

```bash
kubectl get svc
# => NAME                        TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)                                          AGE
# => service/rabbitmq-client     LoadBalancer   10.59.244.70   34.105.135.216   15672:30902/TCP,15692:30605/TCP,5672:31210/TCP   2m19s
```


## Resource Usage and Limits

[Container resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) is a topic that deserves
its own post. [Capacity planning](/blog/tags/capacity-planning) recommendations are entirely workload-,
environment- and system-specific. Optimal values are usually found via extensive [monitoring](/docs/monitoring) of the system, trial, and error.
However, when picking the limits and resource allocation settings, consider a few RabbitMQ-specific things.

### Use the Latest Major Erlang Release

RabbitMQ runs on the Erlang runtime. Recent Erlang/OTP releases have introduced a number of improvements highly relevant to
the users who run RabbitMQ on Kubernetes:

 * In Erlang 22, inter-node communication [latency and head-of-line blocking(http://blog.erlang.org/OTP-22-Highlights/) have been
   significantly reduced. In earlier versions, link congestion was known to make [cluster node heartbeat](/docs/nettick) false
   positives likely.
 * In Erlang 23, the runtime will [respect the container CPU quotas](http://blog.erlang.org/OTP-23-Highlights/) when computing the default number of schedulers to start. This means that nodes will respect the Kubernetes-managed CPU resource limits.

Docker community image for RabbitMQ ships with Erlang 23 at the time of writing. Users of custom Docker images are highly recommended
to provision Erlang 23 as well.

### CPU Resource Usage

RabbitMQ was designed for workloads that involve [multiple queues](/docs/queues#runtime-characteristics) and where
a node serves multiple clients at the same time. Nodes will generally use all the [CPU cores allowed](/docs/runtime)
without any explicit configuration. As the number of cores grows, some tuning may be necessary to reduce [CPU context switching](/docs/runtime#scheduling).

How CPU time is spent can be monitored via the [runtime thread activity metrics](/docs/runtime#thread-stats) which
are also exposed via the [RabbitMQ Prometheus plugin](/docs/prometheus).

If RabbitMQ pods hover around their CPU resource allowance and experience throttling in environments with a large number of
relatively idle clients, the load likely can be [reduced with a modest amount of configuration](/docs/runtime#cpu-reduce-idle-usage).

### Memory Limits

RabbitMQ uses the concept of a [runtime memory high watermark](/docs/memory). By default a node will use 40% of detected
(available) memory as the watermark. When the watermark is crossed, publishers across the entire cluster will be blocked
and more aggressive paging out to disk initiated. The watermark value may seem like a memory quota on Kubernetes at first
but there is an important difference: RabbitMQ resource alarms assume a node can typically recover from this state. For example,
a large backlog of messages will eventually be consumed.

Kubernetes memory limits are [enforced by the OOM killer](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits):
no recovery is expected. This means that a RabbitMQ node's high memory watermark **must be lower** than the memory limit
imposed on the node container. Kubernetes deployments should use the relative watermark values in the [recommended range](/docs/production-checklist#resource-limits-ram).

[Memory usage breakdown data](/docs/memory-use) should be used to determine what consumes most memory on the node.

### Disk Usage

We highly recommend overprovisioning the [disk space available to RabbitMQ containers](/docs/production-checklist#resource-limits-disk-space).
A node that has run out of disk space won't always be able to recover from such an event. Such nodes must be
decomissioned and replaced.

### Consider Available Network Link Bandwidth

Finally, consider what kind of links and Kubernetes networking options are used for inter-node communication. Network link congestion
can be a significant limiting factor to system throughput and affect its availability.

Below is a very simplistic formula to calculate the amount of bandwidth needed by a workload, in bits:

```
# peak message rate * bits per message * 110% to account for metadata and protocol framing
PeakMessageRate * AverageMessagePayloadSizeInBytes * 8 * 1.1
```

Therefore a workload with average message size of 3 kiB and expected peak message rate
of 20K messages a second can consume up to

```
3 kiB * 20000/second * 8 * 1.1 = 528 megabits/second
```

of bandwidth.

Team RabbitMQ maintains a [Grafana dashboard](/docs/prometheus#other-dashboards) for inter-node communication
link metrics.


## Using `rabbitmq-perf-test` to Run a Functional and Load Test of the Cluster

RabbitMQ comes with a load simulation tool, [PerfTest](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/),
which can be executed from outside of a cluster or deployed to Kubernetes using the `perf-test` public [docker image](https://hub.docker.com/r/pivotalrabbitmq/perf-test/).
Here's an example of how the image can be deployed to a Kubernetes cluster

```bash
kubectl run perf-test --image=pivotalrabbitmq/perf-test -- --uri amqp://{username}:{password}@{service}
```

Here the `{username}` and `{password}` are the user credentials, e.g. those set up in the `rabbitmq-admin` Secret.
The `{serivce}` is the hostname to connect to. We use the name of the client service that will resolve as a hostname when deployed.

The above `kubectl run` command will start a PerfTest pod which can be observed in

```bash
kubectl get pods
```

For a functioning RabbitMQ cluster, running `kubectl logs -f {perf-test-pod-name}` where `{perf-test-pod-name}`
is the name of the pod as reported by `kubectl get pods`,  will produce output similar to this:

```
id: test-110102-976, time: 263.100s, sent: 21098 msg/s, received: 21425 msg/s, min/median/75th/95th/99th consumer latency: 1481452/1600817/1636996/1674410/1682972 ?s
id: test-110102-976, time: 264.100s, sent: 17314 msg/s, received: 17856 msg/s, min/median/75th/95th/99th consumer latency: 1509657/1600942/1636253/1695525/1718537 ?s
id: test-110102-976, time: 265.100s, sent: 18597 msg/s, received: 17707 msg/s, min/median/75th/95th/99th consumer latency: 1573151/1716519/1756060/1813985/1846490 ?s
```

To learn more about PerfTest, its settings, capabilities and output, see the [PerfTest doc guide](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/).

PerfTest is not meant to be running permanently. To tear down the `perf-test` pod, use

```bash
kubectl delete pod perf-test
```


## Monitoring the Cluster

[Monitoring](/docs/monitoring) is a critically important part of any production deployment.

RabbitMQ comes with [in-built support for Prometheus](/docs/prometheus). To enable it, enable the `rabbitmq_prometheus` plugin.
This in turn can be done by adding `rabbitmq_promethus` to the `enabled_plugins` Config Map as explained above.

The Prometheus scraping port, 15972, must be open on both the Pod and the client Service.

Node and cluster metrics can be [visualised with Grafana](/docs/prometheus).


## Alternative Option: the Kubernetes Cluster Operator for RabbitMQ

As this post demonstrates, there are quite a few parts involved in hosting a stateful data services
such as RabbitMQ on Kubernetes. It may seem like a daunting task.
There are several alternatives to this kind of DIY deployment demonstrated in this post.

Team RabbitMQ at VMware has open sourced a [Kubernetes Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
implementation for RabbitMQ. As of August 2020, this is a young project under active development.
While it currently has limitations, it is our recommended option over the manual DIY setup
demonstrated in this post.

See [RabbitMQ Cluster Operator for Kubernetes ](/kubernetes/operator/operator-overview) to learn more.
The project is developed in the open at [rabbitmq/cluster-operator on GitHub](https://github.com/rabbitmq/cluster-operator). Give it a try and let us know how it goes.
Besides GitHub, two great venues for providing feedback to the team behind the Operator are the [RabbitMQ mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users)
and the [`#kubernetes channel in RabbitMQ community Slack`](https://rabbitmq-slack.herokuapp.com/).


