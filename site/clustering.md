<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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
 * [Node restarts](#restarting) and how nodes rejoin their cluster
 * How to [remove a cluster node](#removing-nodes)
 * How to [reset a cluster node](#resetting-nodes)

and more. [Cluster Formation and Peer Discovery](/cluster-formation.html) is a closely related guide
that focuses on peer discovery and cluster formation automation-related topics. For queue contents
(message) replication, see the [Mirrored Queues](/ha.html) guide.

A RabbitMQ cluster is a logical grouping of one or
several nodes, each  sharing users, virtual hosts,
queues, exchanges, bindings, runtime parameters and other distributed state.


## <a id="cluster-formation" class="anchor" href="#cluster-formation">Cluster Formation</a>
### <a id="cluster-formation-options" class="anchor" href="#cluster-formation-options">Ways of Forming a Cluster</a>

A RabbitMQ cluster can formed in a number of ways:

 * Declaratively by listing cluster nodes in [config file](/configure.html)
 * Declaratively using DNS-based discovery
 * Declaratively using [AWS (EC2) instance discovery](https://github.com/rabbitmq/rabbitmq-peer-discovery-aws) (via a plugin)
 * Declaratively using [Kubernetes discovery](https://github.com/rabbitmq/rabbitmq-peer-discovery-k8s) (via a plugin)
 * Declaratively using [Consul-based discovery](https://github.com/rabbitmq/rabbitmq-peer-discovery-consul) (via a plugin)
 * Declaratively using [etcd-based discovery](https://github.com/rabbitmq/rabbitmq-peer-discovery-etcd) (via a plugin)
 * Manually with `rabbitmqctl`

Please refer to the [Cluster Formation guide](/cluster-formation.html) for details.

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
[CLI tools](/cli.html) also identify and address nodes using node names.

When a node starts up, it checks whether it has been assigned a node name. This is done
via the `RABBITMQ_NODENAME` [environment variable](/configure.html#supported-environment-variables).
If no value was explicitly configured,
the node resolves its hostname and prepends `rabbit` to it to compute its node name.

If a system uses fully qualified domain names (FQDNs) for hostnames, RabbitMQ nodes
and CLI tools must be configured to use so called long node names.
For server nodes this is done by setting the `RABBITMQ_USE_LONGNAME` [environment variable](/configure.html#supported-environment-variables)
to `true`.

For CLI tools, either `RABBITMQ_USE_LONGNAME` must be set or the `--longnames` option
must be specified.


## <a id="cluster-formation-requirements" class="anchor" href="#cluster-formation-requirements">Cluster Formation Requirements</a>
### <a id="hostname-resolution-requirement" class="anchor" href="#hostname-resolution-requirement">Hostname Resolution</a>

RabbitMQ nodes address each other using domain names,
either short or fully-qualified (FQDNs). Therefore
hostnames of all cluster members
must be resolvable from all cluster nodes, as well
as machines on which command line tools such as `rabbitmqctl`
might be used.

Hostname resolution can use any of the standard OS-provided
methods: * DNS records * Local host files (e.g. `/etc/hosts`)

In more restrictive environments, where DNS record or
hosts file modification is restricted, impossible or
undesired, <a
href="http://erlang.org/doc/apps/erts/inet_cfg.html">Erlang
VM can be configured to use alternative hostname
resolution methods</a>, such as an alternative DNS server,
a local file, a non-standard hosts file location, or a mix
of methods.  Those methods can work in concert with the
standard OS hostname resolution methods.

To use FQDNs, see `RABBITMQ_USE_LONGNAME` in the [Configuration guide](/configure.html#supported-environment-variables).
See [Node Names](#node-names) above.


## <a id="ports" class="anchor" href="#ports">Port Access</a>

RabbitMQ nodes bind to ports (open server TCP sockets) in order to accept client and CLI tool connections.
Other processes and tools such as SELinux may prevent RabbitMQ from binding to a port. When that happens,
the node will fail to start.

CLI tools, client libraries and RabbitMQ nodes also open connections (client TCP sockets).
Firewalls can prevent nodes and CLI tools from communicating with each other.
Make sure the following ports are accessible:

 * 4369: [epmd](http://erlang.org/doc/man/epmd.html), a peer discovery service used by RabbitMQ nodes and CLI tools * 5672, 5671: used by AMQP 0-9-1 and 1.0 clients without and with TLS
 * 25672: used for inter-node and CLI tools communication (Erlang distribution server port)
   and is allocated from a dynamic range (limited to a single port by default,
   computed as AMQP port + 20000). Unless external connections on these ports are really necessary (e.g.
   the cluster uses [federation](/federation.html) or CLI tools are used on machines outside the subnet),
   these ports should not be publicly exposed. See [networking guide](/networking.html) for details.
 * 35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
   and is allocated from a dynamic range (computed as server distribution port + 10000 through
   server distribution port + 10010). See [networking guide](/networking.html) for details.
 * 15672: [HTTP API](/management.html) clients, [management UI](/management.html) and [rabbitmqadmin](/management-cli.html)
   (only if the [management plugin](/management.html) is enabled)
 * 61613, 61614: [STOMP clients](https://stomp.github.io/stomp-specification-1.2.html) without and with TLS (only if the [STOMP plugin](/stomp.html) is enabled)
 * 1883, 8883: ([MQTT clients](http://mqtt.org/) without and with TLS, if the [MQTT plugin](/mqtt.html) is enabled
 * 15674: STOMP-over-WebSockets clients (only if the [Web STOMP plugin](/web-stomp.html) is enabled)
 * 15675: MQTT-over-WebSockets clients (only if the [Web MQTT plugin](/web-mqtt.html) is enabled)

It is possible to [configure RabbitMQ](/configure.html)
to use [different ports and specific network interfaces](/networking.html).


## <a id="cluster-membership" class="anchor" href="#cluster-membership">Nodes in a Cluster</a>

### <a id="overview-what-is-replicated" class="anchor" href="#overview-what-is-replicated">What is Replicated?</a>

All data/state required for the operation of a RabbitMQ
broker is replicated across all nodes. An exception to this
are message queues, which by default reside on one node,
though they are visible and reachable from all nodes. To
replicate queues across nodes in a cluster, see the
documentation on [high availability](ha.html)
(note: this guide is a prerequisite for mirroring).

### <a id="peer-equality" class="anchor" href="#peer-equality">Nodes are Equal Peers</a>

Some distributed systems
have leader and follower nodes. This is generally not true for RabbitMQ.
All nodes in a RabbitMQ cluster are equal peers: there are no special nodes in RabbitMQ core.
This topic becomes more nuanced when [queue mirroring](ha.html) and plugins
are taken into consideration but for most intents and purposes,
all cluster nodes should be considered equal

Many [CLI tool](/cli.html) operations can be executed against any node.
An [HTTP API](/management.html) client can target any cluster node.

Individual plugins can designate (elect)
certain nodes to be "special" for a period of time. For example, [federation links](/federation.html)
are colocated on a particular cluster node. Should that node fail, the links will
be restarted on a different node.

In versions older than 3.6.7, [RabbitMQ management plugin](/management.html) used
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
this strategy is not really viable in a [clustered environment](/clustering.html).

Erlang cookie generation should be done at cluster deployment stage, ideally using automation
and orchestration tools such as Chef, Puppet, BOSH, Docker or similar.

### <a id="cookie-file-locations" class="anchor" href="#cookie-file-locations">Cookie File Locations</a>

#### Linux, MacOS, *BSD

On UNIX systems, the cookie will be typically
located in `/var/lib/rabbitmq/.erlang.cookie` (used by the server)
and `$HOME/.erlang.cookie` (used by CLI tools). Note that since the value
of `$HOME` varies from user to user, it's necessary to place a copy of
the cookie file for each user that will be using the CLI tools. This applies to both
non-privileged users and `root`.

#### Windows

On Windows, the cookie location depends on a few factors:

 * Erlang version: prior to 20.2 or 20.2 and later
 * Whether the `HOMEDRIVE` and `HOMEPATH` environment variables are both set

##### Erlang 20.2 or later

With Erlang versions starting with 20.2, the cookie file locations are:

 * `%HOMEDRIVE%%HOMEPATH%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie` for user `%USERNAME%`) if both the `HOMEDRIVE` and `HOMEPATH` environment variables are set
 * `%USERPROFILE%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie`) if `HOMEDRIVE` and `HOMEPATH` are not both set
 * For the RabbitMQ Windows service - `%USERPROFILE%\.erlang.cookie` (usually `C:\WINDOWS\system32\config\systemprofile`)

If the Windows service is used, the cookie should be copied from
`C:\Windows\system32\config\systemprofile\.erlang.cookie` to the expected
location for users running commands like `rabbitmqctl.bat`.

##### Erlang 19.3 through 20.2

With Erlang versions prior to 20.2, the cookie file locations are:

 * `%HOMEDRIVE%%HOMEPATH%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie` for user `%USERNAME%`) if both the `HOMEDRIVE` and `HOMEPATH` environment variables are set
 * `%USERPROFILE%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie`) if `HOMEDRIVE` and `HOMEPATH` are not both set
 * For the RabbitMQ Windows service - `%WINDIR%\.erlang.cookie` (usually `C:\Windows\.erlang.cookie`)

If the Windows service is used, the cookie should be copied from
`C:\Windows\.erlang.cookie` to the expected location for users
running commands like `rabbitmqctl.bat`.

#### Troubleshooting

When a node starts, it will [log](/logging.html) its home (base) directory location. Unless
any [server directories](/relocate.html) were overridden, that's the directory the cookie file
will be created in by the RabbitMQ service.

#### Runtime Arguments

As an alternative, you can add the option "`-setcookie <i>value</i>`"
in the `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` [environment variable value](/configure.html):

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-setcookie cookie-value"
</pre>

This is the least secure option and generally not recommended.

### <a id="cli-authentication-failures" class="anchor" href="#cli-authentication-failures">Authentication Failures</a>

When the cookie is misconfigured (for example, not identical), RabbitMQ will log errors
such as "Connection attempt from disallowed node" and "Could not auto-cluster". When
a [CLI tool](/cli.html) such as `rabbitmqctl` fails to authenticate with RabbitMQ,
the message usually says

<pre class="lang-ini">
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

See the [CLI Tools guide](/cli.html) for more information.

### <a id="clustering-and-clients" class="anchor" href="#clustering-and-clients">Clustering and Clients</a>

Assuming all cluster members
are available, a client can connect to any node and
perform any operation. Nodes will route operations to the
[queue master node](ha.html#master-migration-data-locality) transparently to
clients.

With all supported messaging protocols a client is only connected to one node
at a time.

In case of a node failure, clients should be able to reconnect
to a different node, recover their topology and continue operation. For
this reason, most client libraries accept a list of endpoints (hostnames or IP addresses)
as a connection option. The list of hosts will be used during initial connection
as well as connection recovery, if the client supports it. See documentation guides
for individual clients to learn more.

There are scenarios where it may not be possible for a client to transparently continue
operations after connecting to a different node. They usually involve
[non-mirrored queues hosted on a failed node](/ha.html#non-mirrored-queue-behavior-on-node-failure).

### <a id="clustering-and-observability" class="anchor" href="#clustering-and-observability">Clustering and Observability</a>

Client connections, channels and queues will be distributed across cluster nodes.
Operators need to be able to inspect and [monitor](/monitoring.html) such resources
across all cluster nodes.

RabbitMQ [CLI tools](/cli.html) such as `rabbitmq-diagnostics` and `rabbitmqctl`
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

[Management UI](/management.html) works similarly: a node that has to respond to an HTTP API request
will fan out to other cluster members and aggregate their responses. In a cluster with multiple nodes that have management plugin
enabled, the operator can use any node to access management UI. The same goes for monitoring tools that use
the HTTP API to collect data about the state of the cluster. There is no need to issue a request to every cluster node in turn.

### <a id="clustering-dealing-with-failure" class="anchor" href="#clustering-dealing-with-failure">Node Failure Handling</a>

RabbitMQ brokers tolerate the failure of individual
nodes. Nodes can be started and stopped at will,
as long as they can contact a cluster member node
known at the time of shutdown.

[Queue mirroring](/ha.html) allows queue contents to be replicated
across multiple cluster nodes.

Non-mirrored queues can also be used in clusters. Non-mirrored queue [behaviour in case of node failure](/ha.html#non-mirrored-queue-behavior-on-node-failure)
depends on queue durability.

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
Node that responds to an [HTTP API](/management.html) request contacts its peers
to retrieve their data and then produces an aggregated result.

In versions older than 3.6.7, [RabbitMQ management plugin](/management.html) used
a dedicated node for stats collection and aggregation.

### <a id="cluster-node-types" class="anchor" href="#cluster-node-types">Disk and RAM Nodes</a>

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


## <a id="transcript" class="anchor" href="#transcript">Clustering Transcript with `rabbitmqctl`</a>

The following is a transcript of manually setting up and manipulating
a RabbitMQ cluster across three machines -
`rabbit1`, `rabbit2`,
`rabbit3`. It is recommended that the example is studied before
[more automation-friendly](/cluster-formation.html) cluster formation
options are used.

We assume that the user is logged into all three machines,
that RabbitMQ has been installed on the machines, and that
the rabbitmq-server and rabbitmqctl scripts are in the
user's PATH.

This transcript can be modified to run on a single host, as
explained more details below.

### <a id="starting" class="anchor" href="#starting">Starting Independent Nodes</a>

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

### <a id="creating" class="anchor" href="#creating">Creating a Cluster</a>

In order to link up our three nodes in a cluster, we tell
two of the nodes, say `rabbit@rabbit2` and
`rabbit@rabbit3`, to join the cluster of the
third, say `rabbit@rabbit1`. Prior to that both
newly joining members must be [reset](/rabbitmqctl.8.html#reset).

We first join `rabbit@rabbit2` in a cluster
with `rabbit@rabbit1`. To do that, on
`rabbit@rabbit2` we stop the RabbitMQ
application and join the `rabbit@rabbit1`
cluster, then restart the RabbitMQ application. Note that
a node must be [reset](/rabbitmqctl.8.html#reset) before it can join an existing cluster.
Resetting the node <strong>removes all resources and data that were previously
present on that node</strong>. This means that a node cannot be made a member
of a cluster and keep its existing data at the same time. When that's desired,
using the [Blue/Green deployment strategy](/blue-green-upgrade.html) or [backup and restore](/backup.html)
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

### <a id="restarting" class="anchor" href="#restarting">Restarting Cluster Nodes</a>

Nodes that have been joined to a cluster can be stopped at
any time. They can also fail or be terminated by the OS. In all cases
the rest of the cluster can continue operating,
and the nodes automatically "catch up" with (sync from) the other
cluster nodes when they start up again. Note that some [partition handling strategies](/partitions.html)
may work differently and affect other nodes.

We shut down the nodes `rabbit@rabbit1` and
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

Now we start the nodes again, checking on the cluster
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

It is important to understand the process node go through when
they are stopped and restarted.

A stopping node picks an online cluster member (only disc
nodes will be considered) to sync with after restart. Upon
restart the node will try to contact that peer 10 times by
default, with 30 second response timeouts.  In case the
peer becomes available in that time interval, the node
successfully starts, syncs what it needs from the peer and
keeps going. If the peer does not become available, the restarted
node will <strong>give up and voluntarily stop</strong>.

When a node has no online peers during shutdown, it will start without
attempts to sync with any known peers. It does not start as a standalone
node, however, and peers will be able to rejoin it.

A node rejoining after a node name or host name change can start as [a blank node](#peer-discovery-how-does-it-work)
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

<pre class="sourcecode">
Node 'rabbit@node1.local' thinks it's clustered with node 'rabbit@node2.local', but 'rabbit@node2.local' disagrees
</pre>

In this case B can be reset again and then will be able to join A, or A
can be reset and will successfully join B.

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

During [upgrades](/upgrade.html), sometimes the last node to stop
must be the first node to be started after the upgrade. That node will be designated to perform
a cluster-wide schema migration that other nodes can sync from and apply when they
rejoin.

In some cases the last node to go
offline cannot be brought back up. It can be removed from the
cluster using the `forget_cluster_node` [rabbitmqctl](/cli.html) command.

Alternatively `force_boot` [rabbitmqctl](/cli.html) command can be used
on a node to make it boot without trying to sync with any
peers (as if they were last to shut down). This is
usually only necessary if the last node to shut down or a
set of nodes will never be brought back online.

### <a id="removing-nodes" class="anchor" href="#removing-nodes">Breaking Up a Cluster</a>

Sometimes it is necessary to remove a node from a
cluster. The operator has to do this explicitly using a
`rabbitmqctl` command.

Some [peer discovery mechanisms](/cluster-formation.html)
support node health checks and forced
removal of nodes not known to the discovery backend. That feature is
opt-in (disabled by default).

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
`rabbit@rabbi1` from `rabbit@rabbit2`.

<pre class="lang-bash">
# on rabbit1
rabbitmqctl stop_app
# => Stopping node rabbit@rabbit1 ...done.

# on rabbit2
rabbitmqctl forget_cluster_node rabbit@rabbit1
# => Removing node rabbit@rabbit1 from cluster ...
# => ...done.
</pre>

Note that `rabbit1` still thinks its clustered with
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
by some [peer discovery](/cluster-formation.html) plugins, there are no scenarios
in which a RabbitMQ node will permanently remove its peer node from a cluster.

### <a id="resetting-nodes" class="anchor" href="#resetting-nodes">How to Reset a Node</a>

Sometimes it may be necessary to reset a node (wipe all of its data) and later make it rejoin the cluster.
Generally speaking, there are two possible scenarios: when the node is running, and when the node cannot start
or won't respond to CLI tool commands e.g. due to an issue such as [ERL-430](https://bugs.erlang.org/browse/ERL-430).

Resetting a node will delete all of its data, cluster membership information, configured [runtime parameters](/parameters.html),
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
For nodes that fail to start this is already the case. Then [override](/relocate.html)
the node's data directory location or [re]move the existing data store. This will make the node
start as a blank one. It will have to be instructed to [rejoin its original cluster](#cluster-formation), if any.

A node that's been reset and rejoined its original cluster will sync all virtual hosts, users, permissions
and topology (queues, exchanges, bindings), runtime parameters and policies. It may sync [mirrored
queue](/ha.html) contents if elected to host a replica. Non-mirrored queue contents on a reset node will be lost.

Restoring queue data directories on a reset node that has synchronised its schema from a peer
is not guaranteed to make that data available to clients because [queue master location](#master-migration-data-locality)
might have changed for the affected queues.

## <a id="upgrading" class="anchor" href="#upgrading">Upgrading clusters</a>
You can find instructions for upgrading a cluster in
[the upgrade guide](/upgrade.html#rabbitmq-cluster-configuration).


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
guide](/configure.html#supported-environment-variables), as well as `RABBITMQ_MNESIA_DIR`,
`RABBITMQ_CONFIG_FILE`, and
`RABBITMQ_LOG_BASE` in the [File and Directory Locations guide](/relocate.html).

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
Note that if the node [listens on any ports](/networking.html) other
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
The impact of this solution is that clustering will not work, because
the chosen hostname will not resolve to a routable address from remote
hosts. The `rabbitmqctl` command will similarly fail when
invoked from a remote host. A more sophisticated solution that does not
suffer from this weakness is to use DNS, e.g.
[Amazon Route 53](http://aws.amazon.com/route53/) if running
on EC2. If you want to use the full hostname for your nodename (RabbitMQ
defaults to the short name), and that full hostname is resolveable using DNS,
you may want to investigate setting the environment variable
`RABBITMQ_USE_LONGNAME=true`.

See the section on [hostname resolution](/clustering.html#overview-hostname-requirements) for more information.


## <a id="firewall" class="anchor" href="#firewall">Firewalled nodes</a>

The case for firewalled clustered nodes exists when nodes
are in a data center or on a reliable network, but separated
by firewalls. Again, clustering is not recommended over a WAN or
when network links between nodes are unreliable.

Learn more in the [section on ports](#ports) above and dedicated [RabbitMQ Networking guide](/networking.html).


## <a id="erlang" class="anchor" href="#erlang">Erlang Versions Across the Cluster</a>

All nodes in a cluster must run the same minor [version of Erlang](/which-erlang.html): `21.3.4`
and `21.3.6` can be mixed but `21.0.1` and `21.3.6` (or `20.3` and `22.0.6`) cannot.
Compatibility between individual Erlang/OTP patch versions
can vary between releases but that's generally rare.


## <a id="clients" class="anchor" href="#clients">Connecting to Clusters from Clients</a>

A client can connect as normal to any node within a
cluster. If that node should fail, and the rest of the
cluster survives, then the client should notice the closed
connection, and should be able to reconnect to some
surviving member of the cluster. Generally, it's not
advisable to bake in node hostnames or IP addresses into
client applications: this introduces inflexibility and will
require client applications to be edited, recompiled and
redeployed should the configuration of the cluster change or
the number of nodes in the cluster change. Instead, we
recommend a more abstracted approach: this could be a
dynamic DNS service which has a very short TTL
configuration, or a plain TCP load balancer, or some sort of
mobile IP achieved with pacemaker or similar
technologies. In general, this aspect of managing the
connection to nodes within a cluster is beyond the scope of
RabbitMQ itself, and we recommend the use of other
technologies designed specifically to solve these problems.


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
