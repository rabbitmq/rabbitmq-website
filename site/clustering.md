<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers fundamental topics related to RabbitMQ clustering:

 * How RabbitMQ nodes are identified: [node names](#node-names)
 * [Requirements](#cluster-formation-requirements) for clustering
 * What data is and isn't [replicated between cluster nodes](#cluster-membership)
 * What clustering [means for clients](#clustering-and-clients)
 * [How clusters are formed](#cluster-formation)
 * How nodes [authenticate to each other](#erlang-cookie) (and with CLI tools)
 * Why it's important to [use an odd number of nodes](#node-count) and **two-cluster nodes are strongly discouraged**
 * [Node restarts](#restarting) and how nodes rejoin their cluster
 * [Node readiness probes](#restarting-readiness-probes) and how they can affect rolling cluster restarts
 * How to [remove a cluster node](#removing-nodes)
 * How to [reset a cluster node](#resetting-nodes) to a pristine (blank) state

and more. [Cluster Formation and Peer Discovery](./cluster-formation.html) is a closely related guide
that focuses on peer discovery and cluster formation automation-related topics. For queue contents
(message) replication, see the [Quorum Queues](./quorum-queues.html) guide.

[VMware RabbitMQ](https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/index.html) provides an [Intra-cluster Compression](clustering-compression.html) feature.

A RabbitMQ cluster is a logical grouping of one or
several nodes, each  sharing users, virtual hosts,
queues, exchanges, bindings, runtime parameters and other distributed state.


## <a id="cluster-formation" class="anchor" href="#cluster-formation">Cluster Formation</a>
### <a id="cluster-formation-options" class="anchor" href="#cluster-formation-options">Ways of Forming a Cluster</a>

A RabbitMQ cluster can be formed in a number of ways:

 * Declaratively by listing cluster nodes in [config file](configure.html)
 * Declaratively using DNS-based discovery
 * Declaratively using [AWS (EC2) instance discovery](https://github.com/rabbitmq/rabbitmq-peer-discovery-aws) (via a plugin)
 * Declaratively using [Kubernetes discovery](https://github.com/rabbitmq/rabbitmq-peer-discovery-k8s) (via a plugin)
 * Declaratively using [Consul-based discovery](https://github.com/rabbitmq/rabbitmq-peer-discovery-consul) (via a plugin)
 * Declaratively using [etcd-based discovery](https://github.com/rabbitmq/rabbitmq-peer-discovery-etcd) (via a plugin)
 * Manually with `rabbitmqctl`

Please refer to the [Cluster Formation guide](./cluster-formation.html) for details.

The composition of a cluster can be altered dynamically.
All RabbitMQ brokers start out as running on a single
node. These nodes can be joined into clusters, and
subsequently turned back into individual brokers again.

### <a id="node-names" class="anchor" href="#node-names">Node Names (Identifiers)</a>

RabbitMQ nodes are identified by node names. A node name consists of two parts,
a prefix (usually `rabbit`) and hostname. For example, `rabbit@node1.messaging.svc.local`
is a node name with the prefix of `rabbit` and hostname of `node1.messaging.svc.local`.

Node names in a cluster must be unique. If more than one node is running on a given host
(this is usually the case in development and QA environments), they must use
different prefixes, e.g. `rabbit1@hostname` and `rabbit2@hostname`.

In a cluster, nodes identify and contact each other using node names. This means
that the hostname part of every node name [must resolve](#hostname-resolution-requirement).
[CLI tools](./cli.html) also identify and address nodes using node names.

When a node starts up, it checks whether it has been assigned a node name. This is done
via the `RABBITMQ_NODENAME` [environment variable](./configure.html#supported-environment-variables).
If no value was explicitly configured,
the node resolves its hostname and prepends `rabbit` to it to compute its node name.

If a system uses fully qualified domain names (FQDNs) for hostnames, RabbitMQ nodes
and CLI tools must be configured to use so called long node names.
For server nodes this is done by setting the `RABBITMQ_USE_LONGNAME` [environment variable](./configure.html#supported-environment-variables)
to `true`.

For CLI tools, either `RABBITMQ_USE_LONGNAME` must be set or the `--longnames` option
must be specified.


## <a id="cluster-formation-requirements" class="anchor" href="#cluster-formation-requirements">Cluster Formation Requirements</a>
### <a id="hostname-resolution-requirement" class="anchor" href="#hostname-resolution-requirement">Hostname Resolution</a>

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

To use FQDNs, see `RABBITMQ_USE_LONGNAME` in the [Configuration guide](./configure.html#supported-environment-variables).
See [Node Names](#node-names) above.


## <a id="ports" class="anchor" href="#ports">Port Access</a>

RabbitMQ nodes [bind to ports](networking.html#ports) (open server TCP sockets) in order to accept client and CLI tool connections.
Other processes and tools such as SELinux may prevent RabbitMQ from binding to a port. When that happens,
the node will fail to start.

CLI tools, client libraries and RabbitMQ nodes also open connections (client TCP sockets).
Firewalls can prevent nodes and CLI tools from communicating with each other.
The following ports are most relevant to inter-node communication in a cluster:

 * 4369: [epmd](networking.html#epmd), a helper discovery daemon used by RabbitMQ nodes and CLI tools
 * 6000 through 6500: used by [RabbitMQ Stream](stream.html) replication
 * 25672: used for inter-node and CLI tools communication (Erlang distribution server port)
   and is allocated from a dynamic range (limited to a single port by default,
   computed as AMQP port + 20000). Unless external connections on these ports are really necessary (e.g.
   the cluster uses [federation](federation.html) or CLI tools are used on machines outside the subnet),
   these ports should not be publicly exposed. See [networking guide](networking.html) for details.
 * 35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
   and is allocated from a dynamic range (computed as server distribution port + 10000 through
   server distribution port + 10010).

It is possible to [configure RabbitMQ](configure.html)
to use different ports and specific network interfaces.
See [RabbitMQ Networking guide](networking.html) to learn more.


## <a id="cluster-membership" class="anchor" href="#cluster-membership">Nodes in a Cluster</a>

### <a id="overview-what-is-replicated" class="anchor" href="#overview-what-is-replicated">What is Replicated?</a>

All data/state required for the operation of a RabbitMQ
broker is replicated across all nodes. An exception to this
are message queues, which by default reside on one node,
though they are visible and reachable from all nodes. To
replicate queues across nodes in a cluster, use a queue type
that supports replication. This topic is covered in
the [Quorum Queues](./quorum-queues.html) guide.

### <a id="peer-equality" class="anchor" href="#peer-equality">Nodes are Equal Peers</a>

Some distributed systems
have leader and follower nodes. This is generally not true for RabbitMQ.
All nodes in a RabbitMQ cluster are equal peers: there are no special nodes in RabbitMQ core.
This topic becomes more nuanced when [quorum queues](quorum-queues.html) and plugins
are taken into consideration but for most intents and purposes,
all cluster nodes should be considered equal.

Many [CLI tool](./cli.html) operations can be executed against any node.
An [HTTP API](./management.html) client can target any cluster node.

Individual plugins can designate (elect)
certain nodes to be "special" for a period of time. For example, [federation links](federation.html)
are colocated on a particular cluster node. Should that node fail, the links will
be restarted on a different node.

In older (long maintained) versions, [RabbitMQ management plugin](./management.html) used
a dedicated node for stats collection and aggregation.

### <a id="erlang-cookie" class="anchor" href="#erlang-cookie">How CLI Tools Authenticate to Nodes (and Nodes to Each Other): the Erlang Cookie</a>

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
this strategy is not really viable in a [clustered environment](./clustering.html).

Erlang cookie generation should be done at cluster deployment stage, ideally using automation
and orchestration tools.

In distributed deployment

### <a id="cookie-file-locations" class="anchor" href="#cookie-file-locations">Cookie File Locations</a>

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
 * Erlang version: prior to 20.2 (these are no longer supported by any [maintained release series of RabbitMQ](versions.html)) or 20.2 and later

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
to `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` <a href="./configure.html">environment variable value</a>
to override the cookie value used by a RabbitMQ node:

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-setcookie cookie-value"
</pre>

CLI tools can take a cookie value using a command line flag:

<pre class="lang-bash">
rabbitmq-diagnostics status --erlang-cookie "cookie-value"
</pre>

Both are **the least secure options** and generally **not recommended**.

### <a id="cookie-file-troubleshooting" class="anchor" href="#cookie-file-troubleshooting">Troubleshooting</a> Cookie-based Authentication

When a node starts, it will [log](./logging.html) the home directory location of its effective user:

<pre class="lang-plaintext">
node           : rabbit@cdbf4de5f22d
home dir       : /var/lib/rabbitmq
</pre>

Unless any [server directories](./relocate.html) were overridden, that's the directory where
the cookie file will be looked for, and created by the node on first boot if it does not already exist.

In the example above, the cookie file location will be `/var/lib/rabbitmq/.erlang.cookie`.

### <a id="peer-authentication-failures" class="anchor" href="#peer-authentication-failures">Authentication Failures</a>

When the cookie is misconfigured (for example, not identical), RabbitMQ nodes will log errors
such as "Connection attempt from disallowed node", "", "Could not auto-cluster".

For example, when a CLI tool connects and tries to authenticate using a mismatching secret value:

<pre class="lang-plaintext">
2020-06-15 13:03:33 [error] &lt;0.1187.0&gt; ** Connection attempt from node 'rabbitmqcli-99391-rabbit@warp10' rejected. Invalid challenge reply. **
</pre>

When a CLI tool such as `rabbitmqctl` fails to authenticate with RabbitMQ,
the message usually says

<pre class="lang-plaintext">
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed
* suggestion: hostname mismatch?
* suggestion: is the cookie set correctly?
* suggestion: is the Erlang distribution using TLS?
</pre>

An incorrectly placed cookie file or cookie value mismatch are most common scenarios for such failures.

When a recent Erlang/OTP version is used, authentication failures contain
more information and cookie mismatches can be identified better:

<pre class="lang-ini">
* connected to epmd (port 4369) on warp10
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed

* Authentication failed (rejected by the remote node), please check the Erlang cookie
</pre>

See the [CLI Tools guide](./cli.html) for more information.

#### Hostname Resolution

Since hostname resolution is a [prerequisite for successful inter-node communication](#hostname-resolution-requirement),
starting with [RabbitMQ `3.8.6`](./changelog.html), CLI tools provide two commands that help verify
that hostname resolution on a node works as expected. The commands are not meant to replace
[`dig`](https://en.wikipedia.org/wiki/Dig_(command)) and other specialised DNS tools but rather
provide a way to perform most basic checks while taking [Erlang runtime hostname resolver features](https://erlang.org/doc/apps/erts/inet_cfg.html)
into account.

The commands are covered in the [Networking guide](./networking.html#dns-verify-resolution).

#### CLI Tools

Starting with [version `3.8.6`](./changelog.html), `rabbitmq-diagnostics` includes a command
that provides relevant information on the Erlang cookie file used by CLI tools:

<pre class="lang-bash">
rabbitmq-diagnostics erlang_cookie_sources
</pre>

The command will report on the effective user, user home directory and the expected location
of the cookie file:

<pre class="lang-plaintext">
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
</pre>

## <a id="node-count" class="anchor" href="#node-count">Node Counts and Quorum</a>

Because several features (e.g. [quorum queues](./quorum-queues.html), [client tracking in MQTT](./mqtt.html))
require a consensus between cluster members, odd numbers of cluster nodes are highly recommended:
1, 3, 5, 7 and so on.

Two node clusters are **highly recommended against** since it's impossible for cluster nodes to identify
a majority and form a consensus in case of connectivity loss. For example, when the two nodes lose connectivity
MQTT client connections won't be accepted, quorum queues would lose their availability, and so on.

From the consensus point of view, four or six node clusters would have the same availability
characteristics as three and five node clusters.

The [Quorum Queues guide](./quorum-queues.html) covers this topic in more detail.


## <a id="clustering-and-clients" class="anchor" href="#clustering-and-clients">Clustering and Clients</a>

### Messaging Protocols

Assuming all cluster members
are available, a messaging (AMQP 0-9-1, AMQP 1.0, MQTT, STOMP) client can connect to any node and
perform any operation. Nodes will route operations to the
[quorum queue leader](./quorum-queues.html) or [queue leader replica](ha.html#leader-migration-data-locality)
transparently to clients.

With all supported messaging protocols a client is only connected to one node
at a time.

In case of a node failure, clients should be able to reconnect
to a different node, recover their topology and continue operation. For
this reason, most client libraries accept a list of endpoints (hostnames or IP addresses)
as a connection option. The list of hosts will be used during initial connection
as well as connection recovery, if the client supports it. See documentation guides
for individual clients to learn more.

With [quorum queues](./quorum-queues.html) and [streams](./streams.html), clients will only be able to perform
operations on queues that have a quorum of replicas online.

With classic mirrored queues, there are scenarios where it may not be possible for a client to transparently continue
operations after connecting to a different node. They usually involve
[non-mirrored queues hosted on a failed node](./ha.html#non-mirrored-queue-behavior-on-node-failure).

### Stream Clients

RabbitMQ Stream protocol clients **behave differently from messaging protocols clients**: they are
more cluster topology-aware. For publishing, they can connect to any node, and that node
will forward all relevant operations to the node that hosts the leader replica of the stream.

However, stream consumers should connect to one of the nodes hosting the replicas of
the target stream. The protocol includes a topology discovery operation, so well-behaved client
libraries will select one of the suitable nodes. This won't be the case when a load balancer is used,
however.

See [Connecting to Streams](https://blog.rabbitmq.com/posts/2021/07/connecting-to-streams/#well-behaved-clients)
to learn more.


## <a id="clustering-and-observability" class="anchor" href="#clustering-and-observability">Clustering and Observability</a>

Client connections, channels and queues will be distributed across cluster nodes.
Operators need to be able to inspect and [monitor](./monitoring.html) such resources
across all cluster nodes.

RabbitMQ [CLI tools](./cli.html) such as `rabbitmq-diagnostics` and `rabbitmqctl`
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

[Management UI](./management.html) works similarly: a node that has to respond to an HTTP API request
will fan out to other cluster members and aggregate their responses. In a cluster with multiple nodes that have management plugin
enabled, the operator can use any node to access management UI. The same goes for monitoring tools that use
the HTTP API to collect data about the state of the cluster. There is no need to issue a request to every cluster node in turn.

### <a id="clustering-dealing-with-failure" class="anchor" href="#clustering-dealing-with-failure">Node Failure Handling</a>

RabbitMQ brokers tolerate the failure of individual
nodes. Nodes can be started and stopped at will,
as long as they can contact a cluster member node
known at the time of shutdown.

[Quorum queue](quorum-queues.html) allows queue contents to be replicated
across multiple cluster nodes with parallel replication and a predictable [leader election](#quorum-queues.html#leader-election)
and [data safety](quorum-queues.html#data-safety) behavior as long as a majority of replicas are online.

Non-replicated classic queues can also be used in clusters. Non-mirrored queue [behaviour in case of node failure](./ha.html#non-mirrored-queue-behavior-on-node-failure)
depends on [queue durability](queues.html#durability).

RabbitMQ clustering has several modes of dealing with [network partitions](partitions.html),
primarily consistency oriented. Clustering is meant to be used across LAN. It is
not recommended to run clusters that span WAN.
The [Shovel](shovel.html) or
[Federation](federation.html)
plugins are better solutions for connecting brokers across a
WAN. Note that [Shovel and Federation are not equivalent to clustering](distributed.html).

### <a id="clustering-and-stats" class="anchor" href="#clustering-and-stats">Metrics and Statistics</a>

Every node stores and aggregates its own metrics and stats, and provides an API for
other nodes to access it. Some stats are cluster-wide, others are specific to individual nodes.
Node that responds to an [HTTP API](./management.html) request contacts its peers
to retrieve their data and then produces an aggregated result.

In older (long unmaintained) versions [RabbitMQ management plugin](./management.html) used
a dedicated node for stats collection and aggregation.


## <a id="manual-transcript" class="anchor" href="#manual-transcript">Clustering Transcript with `rabbitmqctl`</a>

The following several sections provide a transcript of manually setting up and manipulating
a RabbitMQ cluster across three machines: `rabbit1`, `rabbit2`,
`rabbit3`. It is recommended that the example is studied before
[more automation-friendly](./cluster-formation.html) cluster formation
options are used.

We assume that the user is logged into all three machines,
that RabbitMQ has been installed on the machines, and that
the rabbitmq-server and rabbitmqctl scripts are in the
user's PATH.

This transcript can be modified to run on a single host, as
explained more details below.


## <a id="starting" class="anchor" href="#starting">Starting Independent Nodes</a>

Clusters are set up by re-configuring existing RabbitMQ
nodes into a cluster configuration. Hence the first step
is to start RabbitMQ on all nodes in the normal way:

<pre class="lang-bash">
# on rabbit1
rabbitmq-server -detached
# on rabbit2
rabbitmq-server -detached
# on rabbit3
rabbitmq-server -detached
</pre>

This creates three <i>independent</i> RabbitMQ brokers,
one on each node, as confirmed by the <i>cluster_status</i>
command:

<pre class="lang-bash">
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
</pre>

The node name of a RabbitMQ broker started from the
`rabbitmq-server` shell script is
<code>rabbit@<i>shorthostname</i></code>, where the short
node name is lower-case (as in `rabbit@rabbit1`,
above). On Windows, if `rabbitmq-server.bat`
batch file is used, the short node name is upper-case (as
in `rabbit@RABBIT1`). When you type node names,
case matters, and these strings must match exactly.

## <a id="creating" class="anchor" href="#creating">Creating a Cluster</a>

In order to link up our three nodes in a cluster, we tell
two of the nodes, say `rabbit@rabbit2` and
`rabbit@rabbit3`, to join the cluster of the
third, say `rabbit@rabbit1`. Prior to that both
newly joining members must be [reset](./rabbitmqctl.8.html#reset).

We first join `rabbit@rabbit2` in a cluster
with `rabbit@rabbit1`. To do that, on
`rabbit@rabbit2` we stop the RabbitMQ
application and join the `rabbit@rabbit1`
cluster, then restart the RabbitMQ application. Note that
a node must be [reset](./rabbitmqctl.8.html#reset) before it can join an existing cluster.
Resetting the node <strong>removes all resources and data that were previously
present on that node</strong>. This means that a node cannot be made a member
of a cluster and keep its existing data at the same time. When that's desired,
using the [Blue/Green deployment strategy](./blue-green-upgrade.html) or [backup and restore](./backup.html)
are the available options.

<pre class="lang-bash">
# on rabbit2
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit2 ...done.

rabbitmqctl reset
# => Resetting node rabbit@rabbit2 ...

rabbitmqctl join_cluster rabbit@rabbit1
# => Clustering node rabbit@rabbit2 with [rabbit@rabbit1] ...done.

rabbitmqctl start_app
# => Starting node rabbit@rabbit2 ...done.
</pre>

We can see that the two nodes are joined in a cluster by
running the <i>cluster_status</i> command on either of the nodes:

<pre class="lang-bash">
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
</pre>

Now we join `rabbit@rabbit3` to the same
cluster. The steps are identical to the ones above, except
this time we'll cluster to `rabbit2` to
demonstrate that the node chosen to cluster to does not
matter - it is enough to provide one online node and the
node will be clustered to the cluster that the specified
node belongs to.

<pre class="lang-bash">
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
</pre>

We can see that the three nodes are joined in a cluster by
running the `cluster_status` command on any of the nodes:

<pre class="lang-bash">
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
</pre>

By following the above steps we can add new nodes to the
cluster at any time, while the cluster is running.

## <a id="restarting" class="anchor" href="#restarting">Restarting Cluster Nodes</a>

Nodes that have been joined to a cluster can be stopped at
any time. They can also fail or be terminated by the OS.

In general, if the majority of nodes is still online after a node
is stopped, this does not affect the rest of the cluster, although
client connection distribution, queue replica placement, and load distribution
of the cluster will change.

### <a id="restarting-schema-sync" class="anchor" href="#restarting-schema-sync">Schema Syncing from Online Peers</a>

A restarted node will sync the schema
and other information from its peers on boot. Before this process
completes, the node **won't be fully started and functional**.

It is therefore important to understand the process node go through when
they are stopped and restarted.

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

<pre class="lang-plaintext">
2020-07-27 21:10:51.361 [warning] &lt;0.269.0&gt; Error while waiting for Mnesia tables: {timeout_waiting_for_tables,[rabbit@node2,rabbit@node1],[rabbit_durable_queue]}
2020-07-27 21:10:51.361 [info] &lt;0.269.0&gt; Waiting for Mnesia tables for 30000 ms, 1 retries left
2020-07-27 21:11:21.362 [warning] &lt;0.269.0&gt; Error while waiting for Mnesia tables: {timeout_waiting_for_tables,[rabbit@node2,rabbit@node1],[rabbit_durable_queue]}
2020-07-27 21:11:21.362 [info] &lt;0.269.0&gt; Waiting for Mnesia tables for 30000 ms, 0 retries left
</pre>

<pre class="lang-plaintext">
2020-07-27 21:15:51.380 [info] &lt;0.269.0&gt; Waiting for Mnesia tables for 30000 ms, 1 retries left
2020-07-27 21:16:21.381 [warning] &lt;0.269.0&gt; Error while waiting for Mnesia tables: {timeout_waiting_for_tables,[rabbit@node2,rabbit@node1],[rabbit_user,rabbit_user_permission, …]}
2020-07-27 21:16:21.381 [info] &lt;0.269.0&gt; Waiting for Mnesia tables for 30000 ms, 0 retries left
2020-07-27 21:16:51.393 [info] &lt;0.44.0&gt; Application mnesia exited with reason: stopped
</pre>

<pre class="lang-plaintext">
2020-07-27 21:16:51.397 [error] &lt;0.269.0&gt; BOOT FAILED
2020-07-27 21:16:51.397 [error] &lt;0.269.0&gt; ===========
2020-07-27 21:16:51.397 [error] &lt;0.269.0&gt; Timeout contacting cluster nodes: [rabbit@node1].
</pre>

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

<pre class="lang-ini">
# wait for 60 seconds instead of 30
mnesia_table_loading_retry_timeout = 60000

# retry 15 times instead of 10
mnesia_table_loading_retry_limit = 15
</pre>

By adjusting these settings and tweaking the time window in which
known peer has to come back it is possible to account for cluster-wide
redeployment scenarios that can be longer than 5 minutes to complete.

During [upgrades](./upgrade.html), sometimes the last node to stop
must be the first node to be started after the upgrade. That node will be designated to perform
a cluster-wide schema migration that other nodes can sync from and apply when they
rejoin.

### <a id="restarting-readiness-probes" class="anchor" href="#restarting-readiness-probes">Restarts and Health Checks (Readiness Probes)</a>

In some environments, node restarts are controlled with a designated [health check](./monitoring.html#health-checks).
The checks verify that one node has started and the deployment process can proceed to the next one.
If the check does not pass, the deployment of the node is considered to be incomplete and the deployment process
will typically wait and retry for a period of time. One popular example of such environment is Kubernetes
where an operator-defined [readiness probe](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-readiness-gate)
can prevent a deployment from proceeding when the [`OrderedReady` pod management policy](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#deployment-and-scaling-guarantees) is used. Deployments that use the `Parallel` pod management policy
will not be affected but must worry about the [natural race condition during initial cluster formation](./cluster-formation.html#initial-formation-race-condition).

Given the [peer syncing behavior described above](#restarting-schema-sync), such a health check can prevent a cluster-wide restart
from completing in time. Checks that explicitly or implicitly assume a fully booted node that's rejoined
its cluster peers will fail and block further node deployments.

[Most health check](./monitoring.html#health-checks), even relatively basic ones, implicitly assume that the node has
finished booting. They are not suitable for nodes that are [awaiting schema table sync](#restarting-schema-sync) from a peer.

One very common example of such check is

<pre class="lang-bash">
# will exit with an error for the nodes that are currently waiting for
# a peer to sync schema tables from
rabbitmq-diagnostics check_running
</pre>

One health check that does not expect a node to be fully booted and have schema tables synced is

<pre class="lang-bash">
# a very basic check that will succeed for the nodes that are currently waiting for
# a peer to sync schema from
rabbitmq-diagnostics ping
</pre>

This basic check would allow the deployment to proceed and the nodes to eventually rejoin each other,
assuming they are [compatible](./upgrade.html).


### <a id="restarting-with-hostname-changes" class="anchor" href="#restarting-with-hostname-changes">Hostname Changes Between Restarts</a>

A node rejoining after a node name or host name change can start as [a blank node](./cluster-formation.html#peer-discovery-how-does-it-work)
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

<pre class="lang-plaintext">
Node 'rabbit@node1.local' thinks it's clustered with node 'rabbit@node2.local', but 'rabbit@node2.local' disagrees
</pre>

In this case B can be reset again and then will be able to join A, or A
can be reset and will successfully join B.

### <a id="restarting-transcript" class="anchor" href="#restarting-transcript">Cluster Node Restart Example</a>

The below example uses CLI tools to shut down the nodes `rabbit@rabbit1` and
`rabbit@rabbit3` and check on the cluster
status at each step:

<pre class="lang-bash">
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
</pre>

In the below example, the nodes are started back, checking on the cluster
status as we go along:

<pre class="lang-bash">
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
</pre>

## <a id="forced-boot" class="anchor" href="#forced-boot">Forcing Node Boot in Case of Unavailable Peers</a>

In some cases the last node to go
offline cannot be brought back up. It can be removed from the
cluster using the `forget_cluster_node` [rabbitmqctl](./cli.html) command.

Alternatively `force_boot` [rabbitmqctl](./cli.html) command can be used
on a node to make it boot without trying to sync with any
peers (as if they were last to shut down). This is
usually only necessary if the last node to shut down or a
set of nodes will never be brought back online.

## <a id="removing-nodes" class="anchor" href="#removing-nodes">Breaking Up a Cluster</a>

Sometimes it is necessary to remove a node from a
cluster. The operator has to do this explicitly using a
`rabbitmqctl` command.

Some [peer discovery mechanisms](./cluster-formation.html)
support node health checks and forced
removal of nodes not known to the discovery backend. That feature is
opt-in (deactivated by default).

We first remove `rabbit@rabbit3` from the cluster, returning it to
independent operation. To do that, on `rabbit@rabbit3` we
stop the RabbitMQ application, reset the node, and restart the
RabbitMQ application.

<pre class="lang-bash">
# on rabbit3
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit3 ...done.

rabbitmqctl reset
# => Resetting node rabbit@rabbit3 ...done.
rabbitmqctl start_app
# => Starting node rabbit@rabbit3 ...done.
</pre>

Note that it would have been equally valid to list
`rabbit@rabbit3` as a node.


Running the <i>cluster_status</i> command on the nodes confirms
that `rabbit@rabbit3` now is no longer part of
the cluster and operates independently:

<pre class="lang-bash">
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

# on rabbit3
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit3 ...
# => [{nodes,[{disc,[rabbit@rabbit3]}]},{running_nodes,[rabbit@rabbit3]}]
# => ...done.
</pre>

We can also remove nodes remotely. This is useful, for example, when
having to deal with an unresponsive node. We can for example remove
`rabbit@rabbit1` from `rabbit@rabbit2`.

<pre class="lang-bash">
# on rabbit1
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit1 ...done.

# on rabbit2
rabbitmqctl forget_cluster_node rabbit@rabbit1
# => Removing node rabbit@rabbit1 from cluster ...
# => ...done.
</pre>

Note that `rabbit1` still thinks it's clustered with
`rabbit2`, and trying to start it will result in an
error. We will need to reset it to be able to start it again.

<pre class="lang-bash">
# on rabbit1
rabbitmqctl start_app
# => Starting node rabbit@rabbit1 ...
# => Error: inconsistent_cluster: Node rabbit@rabbit1 thinks it's clustered with node rabbit@rabbit2, but rabbit@rabbit2 disagrees

rabbitmqctl reset
# => Resetting node rabbit@rabbit1 ...done.

rabbitmqctl start_app
# => Starting node rabbit@rabbit1 ...
# => ...done.
</pre>

The `cluster_status` command now shows all three nodes
operating as independent RabbitMQ brokers:

<pre class="lang-bash">
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
</pre>

Note that `rabbit@rabbit2` retains the residual
state of the cluster, whereas `rabbit@rabbit1`
and `rabbit@rabbit3` are freshly initialised
RabbitMQ brokers. If we want to re-initialise
`rabbit@rabbit2` we follow the same steps as
for the other nodes:

<pre class="lang-bash">
# on rabbit2
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit2 ...done.
rabbitmqctl reset
# => Resetting node rabbit@rabbit2 ...done.
rabbitmqctl start_app
# => Starting node rabbit@rabbit2 ...done.
</pre>

Besides `rabbitmqctl forget_cluster_node` and the automatic cleanup of unknown nodes
by some [peer discovery](./cluster-formation.html) plugins, there are no scenarios
in which a RabbitMQ node will permanently remove its peer node from a cluster.

### <a id="resetting-nodes" class="anchor" href="#resetting-nodes">How to Reset a Node</a>

Sometimes it may be necessary to reset a node (wipe all of its data) and later make it rejoin the cluster.
Generally speaking, there are two possible scenarios: when the node is running, and when the node cannot start
or won't respond to CLI tool commands e.g. due to an issue such as [ERL-430](https://bugs.erlang.org/browse/ERL-430).

Resetting a node will delete all of its data, cluster membership information, configured [runtime parameters](./parameters.html),
users, virtual hosts and any other node data. It will also permanently remove the node from its cluster.

To reset a running and responsive node, first stop RabbitMQ on it using `rabbitmqctl stop_app`
and then reset it using `rabbitmqctl reset`:

<pre class="lang-bash">
# on rabbit1
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit1 ...done.
rabbitmqctl reset
# => Resetting node rabbit@rabbit1 ...done.
</pre>

In case of a non-responsive node, it must be stopped first using any means necessary.
For nodes that fail to start this is already the case. Then [override](./relocate.html)
the node's data directory location or [re]move the existing data store. This will make the node
start as a blank one. It will have to be instructed to [rejoin its original cluster](#cluster-formation), if any.

A node that's been reset and rejoined its original cluster will sync all virtual hosts, users, permissions
and topology (queues, exchanges, bindings), runtime parameters and policies. [Quorum queue](quorum-queues.html)
contents will be replicated if the node will be selected to host a replica.
Non-replicated queue contents on a reset node will be lost.

## <a id="upgrading" class="anchor" href="#upgrading">Upgrading clusters</a>
You can find instructions for upgrading a cluster in
[the upgrade guide](./upgrade.html#rabbitmq-cluster-configuration).


## <a id="single-machine" class="anchor" href="#single-machine">A Cluster on a Single Machine</a>

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
guide](./configure.html#supported-environment-variables), as well as `RABBITMQ_MNESIA_DIR`,
`RABBITMQ_CONFIG_FILE`, and
`RABBITMQ_LOG_BASE` in the [File and Directory Locations guide](./relocate.html).

You can start multiple nodes on the same host manually by
repeated invocation of `rabbitmq-server` (
`rabbitmq-server.bat` on Windows). For example:

<pre class="lang-bash">
RABBITMQ_NODE_PORT=5672 RABBITMQ_NODENAME=rabbit rabbitmq-server -detached
RABBITMQ_NODE_PORT=5673 RABBITMQ_NODENAME=hare rabbitmq-server -detached
rabbitmqctl -n hare stop_app
rabbitmqctl -n hare join_cluster rabbit@`hostname -s`
rabbitmqctl -n hare start_app
</pre>

will set up a two node cluster, both nodes as disc nodes.
Note that if the node [listens on any ports](networking.html) other
than AMQP 0-9-1 and AMQP 1.0 ones, those must be configured to avoid a collision as
well. This can be done via command line:

<pre class="lang-bash">
RABBITMQ_NODE_PORT=5672 RABBITMQ_SERVER_START_ARGS="-rabbitmq_management listener [{port,15672}]" RABBITMQ_NODENAME=rabbit rabbitmq-server -detached
RABBITMQ_NODE_PORT=5673 RABBITMQ_SERVER_START_ARGS="-rabbitmq_management listener [{port,15673}]" RABBITMQ_NODENAME=hare rabbitmq-server -detached
</pre>

will start two nodes (which can then be clustered) when
the management plugin is installed.


## <a id="issues-hostname" class="anchor" href="#issues-hostname">Hostname Changes</a>

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

See the section on [hostname resolution](./clustering.html#hostname-resolution-requirement) for more information.


## <a id="firewall" class="anchor" href="#firewall">Firewalled Nodes</a>

Nodes can have a firewall enabled on them. In such case, traffic on certain ports must be
allowed by the firewall in both directions, or nodes won't be able to join each other and
perform all the operations they expect to be available on cluster peers.

Learn more in the [section on ports](#ports) above and dedicated [RabbitMQ Networking guide](networking.html).



## <a id="erlang" class="anchor" href="#erlang">Erlang Versions Across the Cluster</a>

All nodes in a cluster are *highly recommended* to run the same major [version of Erlang](./which-erlang.html): `22.2.0`
and `22.2.8` can be mixed but `21.3.6` and `22.2.6` can potentially introduce breaking changes in
inter-node communication protocols. While such breaking changes are relatively rare, they are possible.

Incompatibilities between patch releases of Erlang/OTP versions
are very rare.


## <a id="clients" class="anchor" href="#clients">Connecting to Clusters from Clients</a>

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


## <a id="cluster-node-types" class="anchor" href="#cluster-node-types">Disk and RAM Nodes</a>

A node can be a <em>disk node</em> or a <em>RAM node</em>.
(<b>Note:</b> <i>disk</i> and <i>disc</i> are used
interchangeably). RAM nodes store internal database tables
in RAM only. This does not include messages, message store
indices, queue indices and other node state.

In the vast majority of cases you want all your nodes to be
disk nodes; RAM nodes are a special case that can be used
to improve the performance clusters with high queue,
exchange, or binding churn. RAM nodes do not provide
higher message rates. When in doubt, use
disk nodes only.

Since RAM nodes store internal database tables in RAM only, they must sync
them from a peer node on startup. This means that a cluster must contain
at least one disk node. It is therefore not possible to manually remove
the last remaining disk node in a cluster.


## <a id="ram-nodes" class="anchor" href="#ram-nodes">Clusters with RAM nodes</a>

RAM nodes keep their metadata only in memory. As RAM nodes
don't have to write to disc as much as disc nodes, they can
perform better. However, note that since persistent queue
data is always stored on disc, the performance improvements
will affect only resource management (e.g. adding/removing
queues, exchanges, or vhosts), but not publishing or
consuming speed.

RAM nodes are an advanced use case; when setting up your
first cluster you should simply not use them. You should
have enough disc nodes to handle your redundancy
requirements, then if necessary add additional RAM nodes for
scale.

A cluster containing only RAM nodes would be too volatile; if the
cluster stops you will not be able to start it again and
**will lose all data**. RabbitMQ will prevent the creation of a
RAM-node-only cluster in many situations, but it can't
absolutely prevent it.

The examples here show a cluster with one disc and one RAM
node for simplicity only; such a cluster is a poor design
choice.

### <a id="creating-ram" class="anchor" href="#creating-ram">Creating RAM nodes</a>

We can declare a node as a RAM node when it first joins
the cluster. We do this with
`rabbitmqctl join_cluster` as before, but passing the
`--ram` flag:

<pre class="lang-bash">
# on rabbit2
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit2 ...done.

rabbitmqctl join_cluster --ram rabbit@rabbit1
# => Clustering node rabbit@rabbit2 with [rabbit@rabbit1] ...done.

rabbitmqctl start_app
# => Starting node rabbit@rabbit2 ...done.
</pre>

RAM nodes are shown as such in the cluster status:

<pre class="lang-bash">
# on rabbit1
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit1 ...
# => [{nodes,[{disc,[rabbit@rabbit1]},{ram,[rabbit@rabbit2]}]},
# =>  {running_nodes,[rabbit@rabbit2,rabbit@rabbit1]}]
# => ...done.

# on rabbit2
rabbitmqctl cluster_status
# => Cluster status of node rabbit@rabbit2 ...
# => [{nodes,[{disc,[rabbit@rabbit1]},{ram,[rabbit@rabbit2]}]},
# =>  {running_nodes,[rabbit@rabbit1,rabbit@rabbit2]}]
# => ...done.
</pre>

### <a id="change-type" class="anchor" href="#change-type">Changing node types</a>

We can change the type of a node from ram to disc and vice
versa. Say we wanted to reverse the types of
`rabbit@rabbit2` and `rabbit@rabbit1`, turning
the former from a ram node into a disc node and the latter from a
disc node into a ram node. To do that we can use the
`change_cluster_node_type` command. The node must be
stopped first.

<pre class="lang-bash">
# on rabbit2
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit2 ...done.

rabbitmqctl change_cluster_node_type disc
# => Turning rabbit@rabbit2 into a disc node ...done.

rabbitmqctl start_app
# => Starting node rabbit@rabbit2 ...done.

# on rabbit1
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit1 ...done.

rabbitmqctl change_cluster_node_type ram
# => Turning rabbit@rabbit1 into a ram node ...done.

rabbitmqctl start_app
# => Starting node rabbit@rabbit1 ...done.
</pre>
