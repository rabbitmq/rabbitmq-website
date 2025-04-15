---
title: Clustering Guide
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Clustering Guide

## Overview {#overview}

This guide covers fundamental topics related to RabbitMQ clustering:

 * How RabbitMQ nodes are identified: [node names](#node-names)
 * [Requirements](#cluster-formation-requirements) for clustering
 * What data is and isn't [replicated between cluster nodes](#cluster-membership)
 * What clustering [means for clients](#clustering-and-clients)
 * [How clusters are formed](#cluster-formation)
 * How nodes [authenticate to each other](#erlang-cookie) (and with CLI tools)
 * Why it's important to [use an odd number of nodes](#node-count) and **two-cluster nodes are strongly discouraged**
 * [Queue and stream leader replica placement](#replica-placement) strategies
 * [Node restarts](#restarting) and how nodes rejoin their cluster
 * [Node readiness probes](#restarting-readiness-probes) and how they can affect rolling cluster restarts
 * How to [remove a cluster node](#removing-nodes)
 * How to [reset a cluster node](#resetting-nodes) to a pristine (blank) state

and more. [Cluster Formation and Peer Discovery](./cluster-formation) is a closely related guide
that focuses on peer discovery and cluster formation automation-related topics. For queue contents
(message) replication, see the [Quorum Queues](./quorum-queues) guide.

[VMware Tanzu RabbitMQ](https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/index.html) provides an [Intra-cluster Compression](https://docs.vmware.com/en/VMware-Tanzu-RabbitMQ-for-Kubernetes/3.13/tanzu-rabbitmq-kubernetes/clustering-compression-rabbitmq.html) feature.


## What is a Cluster?

A RabbitMQ cluster is a logical grouping of one or more (three, five, seven, or more) nodes,
each sharing users, virtual hosts, queues, streams, exchanges, bindings, runtime parameters and other distributed state.

For a cluster to be formed, nodes must be configured in a certain way and satisfy
a number of [requirements](#cluster-formation-requirements) such as open port access.

After cluster formation, all nodes in a cluster are aware of other cluster members.

Client applications can be aware or not be aware of the fact that there are multiple cluster nodes,
and connect to any of them, or, depending on the protocol used, a subset of them. For example,
RabbitMQ Stream Protocol clients [can connect to multiple nodes at once](https://www.rabbitmq.com/blog/2021/07/23/connecting-to-streams).
This is covered in more details [later in this guide](#clustering-and-clients).


## Cluster Formation {#cluster-formation}
### Ways of Forming a Cluster {#cluster-formation-options}

A RabbitMQ cluster can be formed in a number of ways:

 * Declaratively by listing cluster nodes in [config file](./configure)
 * Declaratively using DNS-based discovery
 * Declaratively using [AWS (EC2) instance discovery](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_aws) (via a plugin)
 * Declaratively using [Kubernetes discovery](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_k8s) (via a plugin)
 * Declaratively using [Consul-based discovery](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_consul) (via a plugin)
 * Declaratively using [etcd-based discovery](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_etcd) (via a plugin)
 * Manually with `rabbitmqctl`

These mechanisms are covered in more details in the [Cluster Formation guide](./cluster-formation).

The composition of a cluster can be altered dynamically.
All RabbitMQ brokers start out as running on a single
node. These nodes can be joined into clusters, and
subsequently turned back into individual brokers again.

### Node Names (Identifiers) {#node-names}

RabbitMQ nodes are identified by node names. A node name consists of two parts,
a prefix (usually `rabbit`) and hostname. For example, `rabbit@node1.messaging.svc.local`
is a node name with the prefix of `rabbit` and hostname of `node1.messaging.svc.local`.

Node names in a cluster must be unique. If more than one node is running on a given host
(this is usually the case in development and QA environments), they must use
different prefixes, e.g. `rabbit1@hostname` and `rabbit2@hostname`.

In a cluster, nodes identify and contact each other using node names. This means
that the hostname part of every node name [must resolve](#hostname-resolution-requirement).
[CLI tools](./cli) also identify and address nodes using node names.

When a node starts up, it checks whether it has been assigned a node name. This is done
via the `RABBITMQ_NODENAME` [environment variable](./configure#supported-environment-variables).
If no value was explicitly configured,
the node resolves its hostname and prepends `rabbit` to it to compute its node name.

If a system uses fully qualified domain names (FQDNs) for hostnames, RabbitMQ nodes
and CLI tools must be configured to use so called long node names.
For server nodes this is done by setting the `RABBITMQ_USE_LONGNAME` [environment variable](./configure#supported-environment-variables)
to `true`.

For CLI tools, either `RABBITMQ_USE_LONGNAME` must be set or the `--longnames` option
must be specified.


## Cluster Formation Requirements {#cluster-formation-requirements}
### Hostname Resolution {#hostname-resolution-requirement}

RabbitMQ nodes address each other using a **node name**, a combination
of a prefix and domain name, either short or fully-qualified (FQDNs).

Therefore every cluster member **must be able to resolve hostnames
of every other cluster member**, its own hostname, as well
as machines on which command line tools such as `rabbitmqctl`
might be used.

Nodes will perform hostname resolution early on node boot.
In container-based environments it is important that hostname
resolution is ready before the container is started.
For Kubernetes users, this means the [DNS cache interval for CoreDNS](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id)
to a value in the 5-10 second range.

Hostname resolution can use any of the standard OS-provided
methods:

 * DNS records
 * Local host files (e.g. `/etc/hosts`)

In more restrictive environments, where DNS record or
hosts file modification is restricted, impossible or
undesired, <a
href="http://erlang.org/doc/apps/erts/inet_cfg.html">Erlang
VM can be configured to use alternative hostname
resolution methods</a>, such as an alternative DNS server,
a local file, a non-standard hosts file location, or a mix
of methods.  Those methods can work in concert with the
standard OS hostname resolution methods.

To use FQDNs, see `RABBITMQ_USE_LONGNAME` in the [Configuration guide](./configure#supported-environment-variables).
See [Node Names](#node-names) above.


## Ports That Must Be Opened for Clustering and Replication {#ports}

RabbitMQ nodes [bind to ports](./networking#ports) (open server TCP sockets) in order to accept client and CLI tool connections.
Other processes and tools such as SELinux may prevent RabbitMQ from binding to a port. When that happens,
the node will fail to start.

CLI tools, client libraries and RabbitMQ nodes also open connections (client TCP sockets).
Firewalls can prevent nodes and CLI tools from communicating with each other.
The following ports are most relevant to inter-node communication in a cluster:

 * 4369: [epmd](./networking#epmd), a helper discovery daemon used by RabbitMQ nodes and CLI tools
 * 6000 through 6500: used by [RabbitMQ Stream](./stream) replication
 * 25672: used for inter-node and CLI tools communication (Erlang distribution server port)
   and is allocated from a dynamic range (limited to a single port by default,
   computed as AMQP port + 20000). Unless external connections on these ports are really necessary (e.g.
   the cluster uses [federation](./federation) or CLI tools are used on machines outside the subnet),
   these ports should not be publicly exposed. See [networking guide](./networking) for details.
 * 35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
   and is allocated from a dynamic range (computed as server distribution port + 10000 through
   server distribution port + 10010).

It is possible to [configure RabbitMQ](./configure)
to use different ports and specific network interfaces.
See [RabbitMQ Networking guide](./networking) to learn more.


## Nodes in a Cluster {#cluster-membership}

### What is Replicated? {#overview-what-is-replicated}

All data/state required for the operation of a RabbitMQ
broker is replicated across all nodes. An exception to this
are message queues, which by default reside on one node,
though they are visible and reachable from all nodes. To
replicate queues across nodes in a cluster, use a queue type
that supports replication. This topic is covered in
the [Quorum Queues](./quorum-queues) guide.

### Nodes are Equal Peers {#peer-equality}

Some distributed systems
have leader and follower nodes. This is generally not true for RabbitMQ.
All nodes in a RabbitMQ cluster are equal peers: there are no special nodes in RabbitMQ core.
This topic becomes more nuanced when [quorum queues](./quorum-queues) and plugins
are taken into consideration but for most intents and purposes,
all cluster nodes should be considered equal.

Many [CLI tool](./cli) operations can be executed against any node.
An [HTTP API](./management) client can target any cluster node.

Individual plugins can designate (elect)
certain nodes to be "special" for a period of time. For example, [federation links](./federation)
are colocated on a particular cluster node. Should that node fail, the links will
be restarted on a different node.

In older (long maintained) versions, [RabbitMQ management plugin](./management) used
a dedicated node for stats collection and aggregation.

### How CLI Tools Authenticate to Nodes (and Nodes to Each Other): the Erlang Cookie {#erlang-cookie}

RabbitMQ nodes and CLI tools (e.g. `rabbitmqctl`) use a
cookie to determine whether they are allowed to communicate with
each other. For two nodes to be able to communicate they must have
the same shared secret called the Erlang cookie. The cookie is
just a string of alphanumeric characters up to 255 characters in size.
It is usually stored in a local file. The file must be only
accessible to the owner (e.g. have UNIX permissions of `600` or similar).
Every cluster node must have the same cookie.

If the file does not exist, Erlang VM will try to create
one with a randomly generated value when the RabbitMQ server
starts up. Using such generated cookie files are appropriate in development
environments only. Since each node will generate its own value independently,
this strategy is not really viable in a [clustered environment](./clustering).

Erlang cookie generation should be done at cluster deployment stage, ideally using automation
and orchestration tools.

In distributed deployment

### Cookie File Locations {#cookie-file-locations}

#### Linux, MacOS, *BSD

On UNIX systems, the cookie will be typically
located in `/var/lib/rabbitmq/.erlang.cookie` (used by the server)
and `$HOME/.erlang.cookie` (used by CLI tools). Note that since the value
of `$HOME` varies from user to user, it's necessary to place a copy of
the cookie file for each user that will be using the CLI tools.
This applies to both non-privileged users and `root`.

RabbitMQ nodes will log its effective user's home directory location early on boot.

#### Community Docker Image and Kubernetes

[Docker community RabbitMQ image](https://github.com/docker-library/rabbitmq/) uses `RABBITMQ_ERLANG_COOKIE` environment variable value
to populate the cookie file.

Configuration management and container orchestration tools that use this image
must make sure that every RabbitMQ node container in a cluster uses the same value.

In the context of Kubernetes, the value must be specified in the pod template specification of
the [stateful set](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/).
For instance, this can be seen in the [RabbitMQ on Kubernetes examples repository](https://github.com/rabbitmq/diy-kubernetes-examples).

#### Windows

On Windows, the cookie location depends on a few factors:

 * Whether the `HOMEDRIVE` and `HOMEPATH` environment variables are both set
 * Erlang version: prior to 20.2 (these are no longer supported by any [maintained release series of RabbitMQ](/release-information)) or 20.2 and later

##### Erlang 20.2 or later

With Erlang versions starting with 20.2, the cookie file locations are:

 * `%HOMEDRIVE%%HOMEPATH%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie` for user `%USERNAME%`) if both the `HOMEDRIVE` and `HOMEPATH` environment variables are set
 * `%USERPROFILE%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie`) if `HOMEDRIVE` and `HOMEPATH` are not both set
 * For the RabbitMQ Windows service - `%USERPROFILE%\.erlang.cookie` (usually `C:\WINDOWS\system32\config\systemprofile`)

If the Windows service is used, the cookie should be copied from
`C:\Windows\system32\config\systemprofile\.erlang.cookie` to the expected
location for users running commands like `rabbitmqctl.bat`.

### Overriding Using CLI and Runtime Command Line Arguments

As an alternative, the option "`-setcookie <value>`" can be added
to `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` <a href="./configure">environment variable value</a>
to override the cookie value used by a RabbitMQ node:

```bash
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-setcookie cookie-value"
```

CLI tools can take a cookie value using a command line flag:

```bash
rabbitmq-diagnostics status --erlang-cookie "cookie-value"
```

Both are **the least secure options** and generally **not recommended**.

### Troubleshooting {#cookie-file-troubleshooting}

When a node starts, it will [log](./logging) the home directory location of its effective user:

```
node           : rabbit@cdbf4de5f22d
home dir       : /var/lib/rabbitmq
```

Unless any [server directories](./relocate) were overridden, that's the directory where
the cookie file will be looked for, and created by the node on first boot if it does not already exist.

In the example above, the cookie file location will be `/var/lib/rabbitmq/.erlang.cookie`.

### Authentication Failures {#peer-authentication-failures}

When the cookie is misconfigured (for example, not identical), RabbitMQ nodes will log errors
such as "Connection attempt from disallowed node", "", "Could not auto-cluster".

For example, when a CLI tool connects and tries to authenticate using a mismatching secret value:

```
2020-06-15 13:03:33 [error] <0.1187.0> ** Connection attempt from node 'rabbitmqcli-99391-rabbit@warp10' rejected. Invalid challenge reply. **
```

When a CLI tool such as `rabbitmqctl` fails to authenticate with RabbitMQ,
the message usually says

```
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed
* suggestion: hostname mismatch?
* suggestion: is the cookie set correctly?
* suggestion: is the Erlang distribution using TLS?
```

An incorrectly placed cookie file or cookie value mismatch are most common scenarios for such failures.

When a recent Erlang/OTP version is used, authentication failures contain
more information and cookie mismatches can be identified better:

```ini
* connected to epmd (port 4369) on warp10
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed

* Authentication failed (rejected by the remote node), please check the Erlang cookie
```

See the [CLI Tools guide](./cli) for more information.

#### Hostname Resolution

Since hostname resolution is a [prerequisite for successful inter-node communication](#hostname-resolution-requirement),
starting with [RabbitMQ `3.8.6`](/release-information), CLI tools provide two commands that help verify
that hostname resolution on a node works as expected. The commands are not meant to replace
[`dig`](https://en.wikipedia.org/wiki/Dig_(command)) and other specialised DNS tools but rather
provide a way to perform most basic checks while taking [Erlang runtime hostname resolver features](https://erlang.org/doc/apps/erts/inet_cfg.html)
into account.

The commands are covered in the [Networking guide](./networking#dns-verify-resolution).

#### CLI Tools

Starting with [version `3.8.6`](/release-information), `rabbitmq-diagnostics` includes a command
that provides relevant information on the Erlang cookie file used by CLI tools:

```bash
rabbitmq-diagnostics erlang_cookie_sources
```

The command will report on the effective user, user home directory and the expected location
of the cookie file:

```
Cookie File

Effective user: antares
Effective home directory: /home/cli-user
Cookie file path: /home/cli-user/.erlang.cookie
Cookie file exists? true
Cookie file type: regular
Cookie file access: read
Cookie file size: 20

Cookie CLI Switch

--erlang-cookie value set? false
--erlang-cookie value length: 0

Env variable  (Deprecated)

RABBITMQ_ERLANG_COOKIE value set? false
RABBITMQ_ERLANG_COOKIE value length: 0
```

## Node Counts and Quorum {#node-count}

Because several features (e.g. [quorum queues](./quorum-queues), [client tracking in MQTT](./mqtt))
require a consensus between cluster members, odd numbers of cluster nodes are highly recommended:
1, 3, 5, 7 and so on.

Two node clusters are **highly recommended against** since it's impossible for cluster nodes to identify
a majority and form a consensus in case of connectivity loss. For example, when the two nodes lose connectivity
MQTT client connections won't be accepted, quorum queues would lose their availability, and so on.

From the consensus point of view, four or six node clusters would have the same availability
characteristics as three and five node clusters.

The [Quorum Queues guide](./quorum-queues) covers this topic in more detail.


## Clustering and Clients {#clustering-and-clients}

### Messaging Protocols

Assuming all cluster members
are available, a messaging (AMQP 0-9-1, AMQP 1.0, MQTT, STOMP) client can connect to any node and
perform any operation. Nodes will route operations to the
[quorum queue leader](./quorum-queues) transparently to clients.

With all supported messaging protocols a client is only connected to one node
at a time.

In case of a node failure, clients should be able to reconnect
to a different node, recover their topology and continue operation. For
this reason, most client libraries accept a list of endpoints (hostnames or IP addresses)
as a connection option. The list of hosts will be used during initial connection
as well as connection recovery, if the client supports it. See documentation guides
for individual clients to learn more.

With [quorum queues](./quorum-queues) and [streams](./streams), clients will only be able to perform
operations on queues that have a quorum of replicas online.

### Stream Clients

RabbitMQ Stream protocol clients **behave differently from messaging protocols clients**: they are
more cluster topology-aware. For publishing, they can connect to any node, and that node
will forward all relevant operations to the node that hosts the leader replica of the stream.

However, stream consumers should connect to one of the nodes hosting the replicas of
the target stream. The protocol includes a topology discovery operation, so well-behaved client
libraries will select one of the suitable nodes. This won't be the case when a load balancer is used,
however.

See [Connecting to Streams](/blog/2021/07/23/connecting-to-streams#well-behaved-clients)
to learn more.

### Queue and Stream Leader Replica Placement {#replica-placement}

Every queue and stream in RabbitMQ has a primary replica (in case of classic queues,
it is the only replica). That replica is called
_the leader_. All publishing operations on queues and streams go through the leader
replica first and then are replicated to the followers (secondary replicas). This is necessary to
guarantee FIFO ordering of messages.

To avoid some nodes in a cluster hosting a significant majority of queue leader
replicas and thus handling most of the load, queue leaders should
be reasonably evenly distributed across cluster nodes.

Queue leader distribution can be controlled in three ways:
1. a policy, by setting `queue-leader-locator`
1. [the configuration file](./configure#configuration-files), by setting `queue_leader_locator`
1. [optional queue argument](./queues#optional-arguments), by setting the `x-queue-leader-locator` ([not recommended](./parameters))

There are two options available:

 * `client-local`, the default, will always pick the node the client is connected to
 * `balanced`, which takes into account the number of queues/leaders already running
   on each node in the cluster; when there are relatively few
   queues in the cluster, it picks the node with the least number of them; when there
   are many (more than 1000 by default), it just picks a random node (calculating the
   exact number can be slow with many queues, and a random choice is generally just as good)

:::tip
Using `client-local` strategy is usually a good choice if the connections that declare queues
are evenly distributed between nodes. In such case, even though the queue/leaders are placed locally
(where the connection is), they are well balanced within the cluster. Otherwise, prefer the `balanced` strategy.
The disadvantage of the `balanced` strategy is that the connection that declared the queue may not have
the best possible performance when using this queues,
if a different node is picked. For example, [for short-lived queues](./queues#temporary-queues), `client-local` is probably
a better choice. [Exclusive queues](./queues#exclusive-queues) are always declared locally.
:::

The following example sets the `queue_leader_locator` setting in `rabbitmq.conf` to ensure a balanced queue distribution:

``` ini
queue_leader_locator = balanced
```

The client-provided queue argument takes precedence when both are used.

Note that all Raft-based features, namely quorum queues and streams, use this value as a suggestion.
Raft leader election algorithm involves a degree of randomness, therefore the selected recommended
node will have a replica placed on it but it will not always be the leader replica.

:::note
For backwards compatibility, `queue-master-locator` (policy argument), `x-queue-master-locator`
(queue argument) and `queue_master_locator` (configuration option) are still supported by classic queues.
However, these are deprecated in favour of the options listed above.

These options allow different values: `client-local`, `random` and `min-masters`. The latter two
are now mapped to `balanced` internally.
:::

## Clustering and Observability {#clustering-and-observability}

Client connections, channels and queues will be distributed across cluster nodes.
Operators need to be able to inspect and [monitor](./monitoring) such resources
across all cluster nodes.

RabbitMQ [CLI tools](./cli) such as `rabbitmq-diagnostics` and `rabbitmqctl`
provide commands that inspect resources and cluster-wide state. Some commands focus on the state of a single node
(e.g. `rabbitmq-diagnostics environment` and `rabbitmq-diagnostics status`), others
inspect cluster-wide state. Some examples of the latter include `rabbitmqctl list_connections`,
`rabbitmqctl list_mqtt_connections`, `rabbitmqctl list_stomp_connections`, `rabbitmqctl list_users`,
`rabbitmqctl list_vhosts` and so on.

Such "cluster-wide" commands will often contact one node
first, discover cluster members and contact them all to
retrieve and combine their respective state. For example,
`rabbitmqctl list_connections` will contact all
nodes, retrieve their AMQP 0-9-1 and AMQP 1.0 connections,
and display them all to the user.  The user doesn't have
to manually contact all nodes. Assuming a non-changing
state of the cluster (e.g. no connections are closed or
opened), two CLI commands executed against two different
nodes one after another will produce identical or
semantically identical results. "Node-local" commands, however, will not produce
identical results since two nodes rarely have identical state: at the very least their
node names will be different!

[Management UI](./management) works similarly: a node that has to respond to an HTTP API request
will fan out to other cluster members and aggregate their responses. In a cluster with multiple nodes that have management plugin
enabled, the operator can use any node to access management UI. The same goes for monitoring tools that use
the HTTP API to collect data about the state of the cluster. There is no need to issue a request to every cluster node in turn.

### Node Failure Handling {#clustering-dealing-with-failure}

RabbitMQ brokers tolerate the failure of individual
nodes. Nodes can be started and stopped at will,
as long as they can contact a cluster member node
known at the time of shutdown.

[Quorum queue](./quorum-queues) allows queue contents to be replicated
across multiple cluster nodes with parallel replication and a predictable [leader election](./quorum-queues#leader-election)
and [data safety](./quorum-queues#data-safety) behavior as long as a majority of replicas are online.

Non-replicated classic queues can also be used in clusters. Their behaviour in case of node failure
depends on [queue durability](./queues#durability).

RabbitMQ clustering has several modes of dealing with [network partitions](./partitions),
primarily consistency oriented. Clustering is meant to be used across LAN. It is
not recommended to run clusters that span WAN.
The [Shovel](./shovel) or
[Federation](./federation)
plugins are better solutions for connecting brokers across a
WAN. Note that [Shovel and Federation are not equivalent to clustering](./distributed).

### Metrics and Statistics {#clustering-and-stats}

Every node stores and aggregates its own metrics and stats, and provides an API for
other nodes to access it. Some stats are cluster-wide, others are specific to individual nodes.
Node that responds to an [HTTP API](./management) request contacts its peers
to retrieve their data and then produces an aggregated result.

In older (long unmaintained) versions [RabbitMQ management plugin](./management) used
a dedicated node for stats collection and aggregation.


## Clustering Transcript with `rabbitmqctl` {#manual-transcript}

The following several sections provide a transcript of manually setting up and manipulating
a RabbitMQ cluster across three machines: `rabbit1`, `rabbit2`,
`rabbit3`. It is recommended that the example is studied before
[more automation-friendly](./cluster-formation) cluster formation
options are used.

We assume that the user is logged into all three machines,
that RabbitMQ has been installed on the machines, and that
the rabbitmq-server and rabbitmqctl scripts are in the
user's PATH.

This transcript can be modified to run on a single host, as
explained more details below.


## Starting Independent Nodes {#starting}

Clusters are set up by re-configuring existing RabbitMQ
nodes into a cluster configuration. Hence the first step
is to start RabbitMQ on all nodes in the normal way:

```bash
# on rabbit1
rabbitmq-server -detached
# on rabbit2
rabbitmq-server -detached
# on rabbit3
rabbitmq-server -detached
```

This creates three <i>independent</i> RabbitMQ brokers,
one on each node, as confirmed by the <i>cluster_status</i>
command:

```bash
# on rabbit1
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit1 ...
# => [{nodes,[{disc,[rabbit@rabbit1]}]},{running_nodes,[rabbit@rabbit1]}]
# => ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit2]}]},{running_nodes,[rabbit@rabbit2]}]
# => ...done.

# on rabbit3
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit3 ...
# => [{nodes,[{disc,[rabbit@rabbit3]}]},{running_nodes,[rabbit@rabbit3]}]
# => ...done.
```

The node name of a RabbitMQ broker started from the
`rabbitmq-server` shell script is
<code>rabbit@<i>shorthostname</i></code>, where the short
node name is lower-case (as in `rabbit@rabbit1`,
above). On Windows, if `rabbitmq-server.bat`
batch file is used, the short node name is upper-case (as
in `rabbit@RABBIT1`). When you type node names,
case matters, and these strings must match exactly.

## Creating a Cluster {#creating}

In order to link up our three nodes in a cluster, we tell
two of the nodes, say `rabbit@rabbit2` and
`rabbit@rabbit3`, to join the cluster of the
third, say `rabbit@rabbit1`. Prior to that both
newly joining members must be [reset](./man/rabbitmqctl.8#reset).

We first join `rabbit@rabbit2` in a cluster
with `rabbit@rabbit1`. To do that, on
`rabbit@rabbit2` we stop the RabbitMQ
application and join the `rabbit@rabbit1`
cluster, then restart the RabbitMQ application. Note that
a node must be [reset](./man/rabbitmqctl.8#reset) before it can join an existing cluster.
Resetting the node <strong>removes all resources and data that were previously
present on that node</strong>. This means that a node cannot be made a member
of a cluster and keep its existing data at the same time. When that's desired,
using the [Blue/Green deployment strategy](./blue-green-upgrade) or [backup and restore](./backup)
are the available options.

```bash
# on rabbit2
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit2 ...done.

rabbitmqctl reset
# => Resetting node rabbit@rabbit2 ...

rabbitmqctl join_cluster rabbit@rabbit1
# => Clustering node rabbit@rabbit2 with [rabbit@rabbit1] ...done.

rabbitmqctl start_app
# => Starting node rabbit@rabbit2 ...done.
```

We can see that the two nodes are joined in a cluster by
running the <i>cluster_status</i> command on either of the nodes:

```bash
# on rabbit1
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit1 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2]}]},
# =>  {running_nodes,[rabbit@rabbit2,rabbit@rabbit1]}]
# => ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2]}]},
# =>  {running_nodes,[rabbit@rabbit1,rabbit@rabbit2]}]
# => ...done.
```

Now we join `rabbit@rabbit3` to the same
cluster. The steps are identical to the ones above, except
this time we'll cluster to `rabbit2` to
demonstrate that the node chosen to cluster to does not
matter - it is enough to provide one online node and the
node will be clustered to the cluster that the specified
node belongs to.

```bash
# on rabbit3
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit3 ...done.

# on rabbit3
rabbitmqctl reset
# => Resetting node rabbit@rabbit3 ...

rabbitmqctl join_cluster rabbit@rabbit2
# => Clustering node rabbit@rabbit3 with rabbit@rabbit2 ...done.

rabbitmqctl start_app
# => Starting node rabbit@rabbit3 ...done.
```

We can see that the three nodes are joined in a cluster by
running the `cluster_status` command on any of the nodes:

```bash
# on rabbit1
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit1 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit3,rabbit@rabbit2,rabbit@rabbit1]}]
# => ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit3,rabbit@rabbit1,rabbit@rabbit2]}]
# => ...done.

# on rabbit3
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit3 ...
# => [{nodes,[{disc,[rabbit@rabbit3,rabbit@rabbit2,rabbit@rabbit1]}]},
# =>  {running_nodes,[rabbit@rabbit2,rabbit@rabbit1,rabbit@rabbit3]}]
# => ...done.
```

By following the above steps we can add new nodes to the
cluster at any time, while the cluster is running.

## Restarting Cluster Nodes {#restarting}

:::important
Users running RabbitMQ on Kubernetes must also consult
[the following section](#restarting-readiness-probes) that explains how to avoid a well known
cluster restart deadlock scenario specific to Kubernetes.
:::

Nodes that have been joined to a cluster can be stopped at
any time. They can also fail or be terminated by the OS.

In general, if the majority of nodes is still online after a node
is stopped, this does not affect the rest of the cluster, although
client connection distribution, queue replica placement, and load distribution
of the cluster will change.

### Schema Syncing from Online Peers {#restarting-schema-sync}

A restarted node will sync the schema
and other information from its peers on boot. Before this process
completes, the node **won't be fully started and functional**.

It is therefore important to understand the process node go through when
they are stopped and restarted.

:::important
Upon restart the node will try to contact that peer 10 times by
default, with 30 second response timeouts. This means that by default, all cluster
members must come online within 5 minutes.

In environments where nodes are deployed and verified sequentially,
such as Kubernetes with the `OrderedReady` pod management policy,
the restart can run into deadlock unless [a number of recommendations is followed](#restarting-readiness-probes).
:::

A stopping node picks an online cluster member (only disc
nodes will be considered) to sync with after restart. Upon
restart the node will try to contact that peer 10 times by
default, with 30 second response timeouts.

In case the peer becomes available in that time interval, the node
successfully starts, syncs what it needs from the peer and
keeps going.

If the peer does not become available, the restarted
node will **give up and voluntarily stop**. Such condition can be
identified by the timeout (`timeout_waiting_for_tables`) warning messages in the logs
that eventually lead to node startup failure:

```
2020-07-27 21:10:51.361 [warning] <0.269.0> Error while waiting for Mnesia tables: {timeout_waiting_for_tables,[rabbit@node2,rabbit@node1],[rabbit_durable_queue]}
2020-07-27 21:10:51.361 [info] <0.269.0> Waiting for Mnesia tables for 30000 ms, 1 retries left
2020-07-27 21:11:21.362 [warning] <0.269.0> Error while waiting for Mnesia tables: {timeout_waiting_for_tables,[rabbit@node2,rabbit@node1],[rabbit_durable_queue]}
2020-07-27 21:11:21.362 [info] <0.269.0> Waiting for Mnesia tables for 30000 ms, 0 retries left
```

```
2020-07-27 21:15:51.380 [info] <0.269.0> Waiting for Mnesia tables for 30000 ms, 1 retries left
2020-07-27 21:16:21.381 [warning] <0.269.0> Error while waiting for Mnesia tables: {timeout_waiting_for_tables,[rabbit@node2,rabbit@node1],[rabbit_user,rabbit_user_permission, …]}
2020-07-27 21:16:21.381 [info] <0.269.0> Waiting for Mnesia tables for 30000 ms, 0 retries left
2020-07-27 21:16:51.393 [info] <0.44.0> Application mnesia exited with reason: stopped
```

```
2020-07-27 21:16:51.397 [error] <0.269.0> BOOT FAILED
2020-07-27 21:16:51.397 [error] <0.269.0> ===========
2020-07-27 21:16:51.397 [error] <0.269.0> Timeout contacting cluster nodes: [rabbit@node1].
```

When a node has no online peers during shutdown, it will start without
attempts to sync with any known peers. It does not start as a standalone
node, however, and peers will be able to rejoin it.

When the entire cluster is brought down therefore, the last node to go down
is the only one that didn't have any running peers at the time of shutdown.
That node can start without contacting any peers first.
Since nodes will try to contact a known peer for up to 5 minutes (by default), nodes
can be restarted in any order in that period of time. In this case
they will rejoin each other one by one successfully. This window of time
can be adjusted using two configuration settings:

```ini
# wait for 60 seconds instead of 30
mnesia_table_loading_retry_timeout = 60000

# retry 15 times instead of 10
mnesia_table_loading_retry_limit = 15
```

By adjusting these settings and tweaking the time window in which
known peer has to come back it is possible to account for cluster-wide
redeployment scenarios that can be longer than 5 minutes to complete.

During [upgrades](./upgrade), sometimes the last node to stop
must be the first node to be started after the upgrade. That node will be designated to perform
a cluster-wide schema migration that other nodes can sync from and apply when they
rejoin.

### Node Restarts, Kubernetes Pod Management and Health Checks (Readiness Probes) {#restarting-readiness-probes}

:::important
Use the `Parallel` pod management policy when running RabbitMQ on Kubernetes.
:::

In some environments, node restarts are controlled with a designated [health check](./monitoring#health-checks).
The checks verify that one node has started and the deployment process can proceed to the next one.
If the check does not pass, the deployment of the node is considered to be incomplete and the deployment process
will typically wait and retry for a period of time. One popular example of such environment is Kubernetes
where an operator-defined [readiness probe](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-readiness-gate)
can prevent a deployment from proceeding when the [`OrderedReady` pod management policy](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#deployment-and-scaling-guarantees) is used. Using the `Parallel` pod management policy helps avoid this problem.

Given the [peer syncing behavior described above](#restarting-schema-sync), such a health check can prevent a cluster-wide restart
from completing in time. Checks that explicitly or implicitly assume a fully booted node that's rejoined
its cluster peers will fail and block further node deployments.

[Most health check](./monitoring#health-checks), even relatively basic ones, implicitly assume that the node has
finished booting. They are not suitable for nodes that are [awaiting schema table sync](#restarting-schema-sync) from a peer.

One very common example of such check is

```bash
# will exit with an error for the nodes that are currently waiting for
# a peer to sync schema tables from
rabbitmq-diagnostics check_running
```

One health check that does not expect a node to be fully booted and have schema tables synced is

```bash
# a very basic check that will succeed for the nodes that are currently waiting for
# a peer to sync schema from
rabbitmq-diagnostics ping
```

This basic check would allow the deployment to proceed and the nodes to eventually rejoin each other,
assuming they are [compatible](./upgrade).


### Hostname Changes Between Restarts {#restarting-with-hostname-changes}

A node rejoining after a node name or host name change can start as [a blank node](./cluster-formation#peer-discovery-how-does-it-work)
if its data directory path changes as a result. Such nodes will fail to rejoin the cluster.
While the node is offline, its peers can be reset or started with a blank data directory.
In that case the recovering node will fail to rejoin its peer as well since internal data store cluster
identity would no longer match.

Consider the following scenario:

1. A cluster of 3 nodes, A, B and C is formed
2. Node A is shut down
3. Node B is reset
4. Node A is started
5. Node A tries to rejoin B but B's cluster identity has changed
6. Node B doesn't recognise A as a known cluster member because it's been reset

in this case node B will reject the clustering attempt from A with an appropriate error
message in the log:

```
Node 'rabbit@node1.local' thinks it's clustered with node 'rabbit@node2.local', but 'rabbit@node2.local' disagrees
```

In this case B can be reset again and then will be able to join A, or A
can be reset and will successfully join B.

### Cluster Node Restart Example {#restarting-transcript}

The below example uses CLI tools to shut down the nodes `rabbit@rabbit1` and
`rabbit@rabbit3` and check on the cluster
status at each step:

```bash
# on rabbit1
rabbitmqctl stop
# => Stopping and halting node rabbit@rabbit1 ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit3,rabbit@rabbit2]}]
# => ...done.

# on rabbit3
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit3 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit2,rabbit@rabbit3]}]
# => ...done.

# on rabbit3
rabbitmqctl stop
# => Stopping and halting node rabbit@rabbit3 ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit2]}]
# => ...done.
```

In the below example, the nodes are started back, checking on the cluster
status as we go along:

```bash
# on rabbit1
rabbitmq-server -detached
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit1 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit2,rabbit@rabbit1]}]
# => ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit1,rabbit@rabbit2]}]
# => ...done.

# on rabbit3
rabbitmq-server -detached

# on rabbit1
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit1 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit2,rabbit@rabbit1,rabbit@rabbit3]}]
# => ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]
# => ...done.

# on rabbit3
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit3 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2,rabbit@rabbit3]}]},
# =>  {running_nodes,[rabbit@rabbit2,rabbit@rabbit1,rabbit@rabbit3]}]
# => ...done.
```


## How to Remove a Node from the Cluster {#removing-nodes}

Sometimes it is necessary to remove a node from the cluster.

The sequence of actions will be slightly different for the following
most common scenarios:

 * The node is online and reachable
 * The node is offline and cannot be recovered

In addition, if the cluster [peer discovery mechanisms](./cluster-formation)
support node health checks and [forced removal of nodes](./cluster-formation#node-health-checks-and-cleanup) not known to the discovery backend.

That feature is opt-in (deactivated by default).

Continuing with the three node cluster example used in this guide,
let's demonstrate how to remove `rabbit@rabbit3` from the cluster, returning it to
independent operation.

### Removal of a Reachable Node

First step before removing a node from the cluster is to stop it:

```bash
# on rabbit3
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit3 ...done.
```

Then use `rabbitmqctl forget_cluster_node` on another node
and specify the node to remove as **the first positional argument**:

```bash
# on rabbit2
rabbitmqctl forget_cluster_node rabbit@rabbit3
# => Removing node rabbit@rabbit3 from cluster ...
```

Running the

```shell
rabbitmq-diagnostics cluster_status
```

command on the nodes confirms that `rabbit@rabbit3` now is no longer part of
the cluster and operates independently:

```bash
# on rabbit1
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit1 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2]}]},
# => {running_nodes,[rabbit@rabbit2,rabbit@rabbit1]}]
# => ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit1,rabbit@rabbit2]}]},
# =>  {running_nodes,[rabbit@rabbit1,rabbit@rabbit2]}]
# => ...done.
```

Now node `rabbit@rabbit3` can be decomissioned to reset and started as
a standalone node:


```shell
# on rabbit3
rabbitmqctl reset

rabbitmqctl start_app
# => Starting node rabbit@rabbit3 ...

rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit3 ...
# => [{nodes,[{disc,[rabbit@rabbit3]}]},{running_nodes,[rabbit@rabbit3]}]
# => ...done.
```

Nodes can be removed remotely, that is, from a different host, as long as CLI tools
on said host can [connect and authenticate](./cli) to the target node.

This can useful, for example, when having to deal with a host that cannot be accessed.

In the rest of this example, `rabbit@rabbit1` will be removed from its remaining
two node cluster with `rabbit@rabbit2`:

```bash
# on rabbit1
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit1 ...done.

# on rabbit2
rabbitmqctl forget_cluster_node rabbit@rabbit1
# => Removing node rabbit@rabbit1 from cluster ...
# => ...done.
```

### Removal of Stopped Nodes and Their Revival

:::important

A node that was removed from the cluster when stopped with `rabbitmqctl stop_app`
must be either reset or decomissioned. If started without a reset,
it won't be able to rejoin its original cluster.

:::

At this point `rabbit1` still thinks it is clustered with
`rabbit2`, and trying to start it will result in an
error because the rest of the cluster no longer considers it to be a known member:

```bash
# on rabbit1
rabbitmqctl start_app
# => Starting node rabbit@rabbit1 ...
# => Error: inconsistent_cluster: Node rabbit@rabbit1 thinks it's clustered with node rabbit@rabbit2, but rabbit@rabbit2 disagrees
```

In order to completely detach it from the cluster, such
stopped node must be reset:


```shell
rabbitmqctl reset
# => Resetting node rabbit@rabbit1 ...done.

rabbitmqctl start_app
# => Starting node rabbit@rabbit1 ...
# => ...done.
```

The `cluster_status` command now shows all three nodes
operating as independent RabbitMQ nodes (single node clusters):

```bash
# on rabbit1
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit1 ...
# => [{nodes,[{disc,[rabbit@rabbit1]}]},{running_nodes,[rabbit@rabbit1]}]
# => ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit2]}]},{running_nodes,[rabbit@rabbit2]}]
# => ...done.

# on rabbit3
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit3 ...
# => [{nodes,[{disc,[rabbit@rabbit3]}]},{running_nodes,[rabbit@rabbit3]}]
# => ...done.
```

Note that `rabbit@rabbit2` retains the residual
state of the cluster, whereas `rabbit@rabbit1`
and `rabbit@rabbit3` are freshly initialised
RabbitMQ brokers. If we want to re-initialise
`rabbit@rabbit2` we follow the same steps as
for the other nodes:

```bash
# on rabbit2
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit2 ...done.
rabbitmqctl reset
# => Resetting node rabbit@rabbit2 ...done.
rabbitmqctl start_app
# => Starting node rabbit@rabbit2 ...done.
```

### Removal of Unresponsive Queues

When target node is not running, it can still be removed from the cluster using
using `rabbitmqctl forget_cluster_node`:

```bash
# Tell rabbit@rabbit1 to permanently remove rabbit@rabbit2
rabbitmqctl forget_cluster_node -n rabbit@rabbit1 rabbit@rabbit2
# => Removing node rabbit@rabbit1 from cluster ...
# => ...done.
```

### What Happens to Quorum Queue and Stream Replicas?

When a node is removed from the cluster using CLI tools, all [quorum queue](./quorum-queues#replica-management)
and [stream replicas](./streams#replica-management) on the node will be removed,
even if that means that queues and streams would temporarily have an even (e.g. two) replicas.

### Node Removal is Explicit (Manual) or Opt-in

Besides `rabbitmqctl forget_cluster_node` and the automatic cleanup of unknown nodes
by some [peer discovery](./cluster-formation) plugins, there are no scenarios
in which a RabbitMQ node will permanently remove its peer node from a cluster.



## How to Reset a Node {#resetting-nodes}

:::danger

Resetting a node will delete all of its data, cluster membership information, configured [runtime parameters](./parameters),
users, virtual hosts and any other node data. It will also alter its internal identity.

:::

Sometimes it may be necessary to reset a node (what specifically this means, see below),
and later make it rejoin the cluster as a new node.

Generally speaking, there are two possible scenarios: when the node is running, and when the node cannot start
or won't respond to CLI tool commands for any reason.

### Reset a Running and Responsive Node

To reset a running and responsive node, first stop RabbitMQ on it using `rabbitmqctl stop_app`
and then reset it using `rabbitmqctl reset`:

```bash
# on rabbit1
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit1 ...done.
rabbitmqctl reset
# => Resetting node rabbit@rabbit1 ...done.
```

:::info

If the reset node is online and its cluster peers are reachable, the node
will first try to permanently remove itself from its cluster.

:::

### Reset an Unresponsive Node

In case of a non-responsive node, it must be stopped first using any means necessary.
For nodes that fail to start this is already the case. Then [override](./relocate)
the node's data directory location or remove the existing data store. This will make the node
start as a blank one. It will have to be instructed to [rejoin its original cluster](#cluster-formation), if any.

### Resetting a Node to Re-add It as a Brand New Node to Its Original Cluster

A reset node that was [removed from the cluster](#removing-nodes) can be re-added to its original
cluster as a brand new node.

In that case it will sync all virtual hosts, users, permissions and topology (queues, exchanges, bindings),
runtime parameters and policies.

For [quorum queue](./quorum-queues) and [stream](./streams) contents to be replicated to the new [re]added node,
the node must be added to the list of nodes to place replicas on using `rabbitmq-queues grow`.

Non-replicated queue contents on a reset node will be lost.


## Forcing Node Boot in Case of Unavailable Peers {#forced-boot}

In some cases the last node to go
offline cannot be brought back up. It can be removed from the
cluster using the `forget_cluster_node` [rabbitmqctl](./cli) command.

Alternatively `force_boot` [rabbitmqctl](./cli) command can be used
on a node to make it boot without trying to sync with any
peers (as if they were last to shut down). This is
usually only necessary if the last node to shut down or a
set of nodes will never be brought back online.


## Upgrading clusters {#upgrading}

You can find instructions for upgrading a cluster in [the upgrade
guide](./upgrade).

## A Cluster on a Single Machine {#single-machine}

Under some circumstances it can be useful to run a cluster
of RabbitMQ nodes on a single machine. This would
typically be useful for experimenting with clustering on a
desktop or laptop without the overhead of starting several
virtual machines for the cluster.

In order to run multiple RabbitMQ nodes on a single
machine, it is necessary to make sure the nodes have
distinct node names, data store locations, log file
locations, and bind to different ports, including those
used by plugins. See `RABBITMQ_NODENAME`,
`RABBITMQ_NODE_PORT`, and
`RABBITMQ_DIST_PORT` in the [Configuration
guide](./configure#supported-environment-variables), as well as `RABBITMQ_MNESIA_DIR`,
`RABBITMQ_CONFIG_FILE`, and
`RABBITMQ_LOG_BASE` in the [File and Directory Locations guide](./relocate).

You can start multiple nodes on the same host manually by
repeated invocation of `rabbitmq-server` (
`rabbitmq-server.bat` on Windows). For example:

```bash
RABBITMQ_NODE_PORT=5672 RABBITMQ_NODENAME=rabbit rabbitmq-server -detached
RABBITMQ_NODE_PORT=5673 RABBITMQ_NODENAME=hare rabbitmq-server -detached
rabbitmqctl -n hare stop_app
rabbitmqctl -n hare join_cluster rabbit@`hostname -s`
rabbitmqctl -n hare start_app
```

will set up a two node cluster, both nodes as disc nodes.
Note that if the node [listens on any ports](./networking) other
than AMQP 0-9-1 and AMQP 1.0 ones, those must be configured to avoid a collision as
well. This can be done via command line:

```bash
RABBITMQ_NODE_PORT=5672 RABBITMQ_SERVER_START_ARGS="-rabbitmq_management listener [{port,15672}]" RABBITMQ_NODENAME=rabbit rabbitmq-server -detached
RABBITMQ_NODE_PORT=5673 RABBITMQ_SERVER_START_ARGS="-rabbitmq_management listener [{port,15673}]" RABBITMQ_NODENAME=hare rabbitmq-server -detached
```

will start two nodes (which can then be clustered) when
the management plugin is installed.


## Hostname Changes {#issues-hostname}

RabbitMQ nodes use hostnames to communicate with each other. Therefore,
all node names must be able to resolve names of all cluster peers. This is
also true for tools such as `rabbitmqctl`.

In addition to that, by default RabbitMQ names the database directory using the
current hostname of the system. If the hostname
changes, a new empty database is created. To avoid data loss it's
crucial to set up a fixed and resolvable hostname.

Whenever the hostname changes RabbitMQ node must be restarted.

A similar effect can be achieved by using `rabbit@localhost`
as the broker nodename.
The impact of this solution is that clustering will not work because
the chosen hostname does not resolve to a routable address from the remote
hosts. The `rabbitmqctl` command fails when
invoked from a remote host. A better solution is to use DNS, for example,
[Amazon Route 53](http://aws.amazon.com/route53/) if running
on EC2. If you want to use the full hostname for your nodename (RabbitMQ
defaults to the short name), and that full hostname is resolvable using DNS,
you may want to investigate setting the environment variable
`RABBITMQ_USE_LONGNAME=true`.

See the section on [hostname resolution](./clustering#hostname-resolution-requirement) for more information.


## Firewalled Nodes {#firewall}

Nodes can have a firewall enabled on them. In such case, traffic on certain ports must be
allowed by the firewall in both directions, or nodes won't be able to join each other and
perform all the operations they expect to be available on cluster peers.

Learn more in the [section on ports](#ports) above and dedicated [RabbitMQ Networking guide](./networking).



## Erlang Versions Across the Cluster {#erlang}

All nodes in a cluster are *highly recommended* to run the same major [version of Erlang](./which-erlang): `26.2.0`
and `26.1.2` can be mixed but `25.3.2.8` and `26.2.0` can potentially introduce breaking changes in
inter-node communication protocols. While such breaking changes are rare, they are possible.

Incompatibilities between patch releases of Erlang/OTP versions
are very rare.


## Connecting to Clusters from Clients {#clients}

A client can connect as normal to any node within a
cluster. If that node should fail, and the rest of the
cluster survives, then the client should notice the closed
connection, and should be able to reconnect to some
surviving member of the cluster.

Many clients support lists of hostnames that will be tried in order
at connection time.

Generally it is not recommended to hardcode IP addresses into
client applications: this introduces inflexibility and will
require client applications to be edited, recompiled and
redeployed should the configuration of the cluster change or
the number of nodes in the cluster change.

Instead, consider a more abstracted approach: this could be a
dynamic DNS service which has a very short TTL
configuration, or a plain TCP load balancer, or a combination of them.

In general, this aspect of managing the
connection to nodes within a cluster is beyond the scope of
this guide, and we recommend the use of other
technologies designed specifically to address these problems.
