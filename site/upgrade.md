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

# Upgrading RabbitMQ

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers topics related to RabbitMQ installation upgrades.

It is important to consider a number of things before upgrading RabbitMQ.

1. [An overview](#basics) of how RabbitMQ can be upgraded
1. [RabbitMQ version upgradability](#rabbitmq-version-upgradability), version upgrading from &amp; version upgrading to
1. [Erlang version requirement](#rabbitmq-erlang-version-requirement)
1. [Plugin compatibility between versions](#rabbitmq-plugins-compatibility)
1. Features [that do not support in-place upgrade](#unsupported-inplace-upgrade)
1. [Changes in system resource usage and reporting](#system-resource-usage) in the new version
1. How upgrades of [multi-node clusters](#clusters) is different from those with only a single node
1. Marking [nodes for maintenance](#maintenance-mode)
1. [Caveats](#caveats)
1. [Handling node restarts](#rabbitmq-restart-handling) in applications

Changes between RabbitMQ versions are documented in the [change log](changelog.html).

## Important Note on Upgrading to 3.12

<p class="box-warning">
RabbitMQ 3.12 requires all previously existing feature flags to be enabled before the upgrade.

The upgrade will fail if you miss this step.
</p>

## <a id="basics" class="anchor" href="#basics">Basics</a>

There are two major upgrade scenarios that are covered in this guide: a [single node](#single-node-upgrade) and a [cluster](#multiple-nodes-upgrade),
and two most commonly used strategies:

 * In-place upgrade where each node is upgraded with its existing on disk data
 * [Blue-green deployment](blue-green-upgrade.html) where a new cluster is created and existing data is migrated to it

### In-place Upgrades

An in-place upgrade usually involves the following steps performed by a deployment tool or manually
by an operator. Each step is covered in more detail later in this guide. An intentionally oversimplified
list of steps would include:

 * Investigate if the current and target versions have an in-place upgrade path: check [version upgradability](#rabbitmq-version-upgradability), [Erlang version requirements](#rabbitmq-erlang-version-requirement), release notes, [features that do not support in-place upgrades](#unsupported-inplace-upgrade), and [known caveats](#caveats)
 * Check that the node or cluster is in a good state in order to be upgraded: no [alarms](alarms.html) are in effect, no ongoing queue synchronisation operations
   and the system is otherwise under a reasonable load
 * Stop the node
 * Upgrade RabbitMQ and, if applicable, Erlang
 * Start the node
 * Watch [monitoring and health check](monitoring.html) data to assess the health and recovery of the upgraded node or cluster

[Rolling upgrades](#rolling-upgrades) between certain versions are not supported. [Full Stop Upgrades](#full-stop-upgrades) covers
the process for those cases.

### Blue-Green Deployment Upgrades

[The Blue/Green deployment](blue-green-upgrade.html) strategy offers the benefit of making the upgrade process safer at the cost of
temporary increasing infrastructure footprint. The safety aspect comes from the fact that the operator
can abort an upgrade by switching applications back to the existing cluster.

The rest of the guide covers each upgrade step in more details.


## <a id="rabbitmq-version-upgradability" class="anchor" href="#rabbitmq-version-upgradability">RabbitMQ Version Upgradability</a>

When an upgrade jumps multiple release series (e.g. goes from `3.4.x` to `3.6.x`), it may be necessary to perform
an intermediate upgrade first. For example, when upgrading from `3.2.x` to `3.7.x`, it would be necessary to
first upgrade to 3.6.x and then upgrade to 3.7.0.

A [full cluster stop](#full-stop-upgrades) may be required for feature version upgrades.

Current release series upgrade compatibility with **rolling** upgrade:

| From     | To     | Notes                                                         |
|----------|--------|---------------------------------------------------------------|
| 3.11.18  | 3.12.x | All feature flags **must** be enabled **before** the upgrade  |
| 3.10.x   | 3.11.x | Some feature flags **must** be enabled **before** the upgrade |
| 3.9.x    | 3.10.x |                                                               |
| 3.8.x    | 3.9.x  |                                                               |
| 3.7.18   | 3.8.x  |                                                               |

Current release series upgrade compatibility with **full stop** upgrade:

| From     | To     | Notes                                                        |
|----------|--------|--------------------------------------------------------------|
| 3.11.18  | 3.12.x | All feature flags should be enabled **before** this upgrade  |
| 3.10.x   | 3.11.x | Some feature flags should be enabled **before** this upgrade |
| 3.9.x    | 3.10.x |                                                              |
| 3.8.x    | 3.9.x  |                                                              |
| 3.7.27   | 3.9.x  |                                                              |
| 3.6.x    | 3.8.x  |                                                              |
| 3.6.x    | 3.7.x  |                                                              |
| 3.5.x    | 3.7.x  |                                                              |
| =< 3.4.x | 3.6.16 |                                                              |

`3.7.18` and later `3.7.x` versions support [rolling upgrades](#rolling-upgrades) to `3.8.x` using [feature flags](./feature-flags.html).


## <a id="rabbitmq-erlang-version-requirement" class="anchor" href="#rabbitmq-erlang-version-requirement">Erlang Version Requirements</a>

We recommend that you upgrade Erlang together with RabbitMQ.
Please refer to the [Erlang Version Requirements](./which-erlang.html) guide.


## <a id="unsupported-inplace-upgrade" class="anchor" href="#unsupported-inplace-upgrade">Features that Do Not Support In-place Upgrades</a>

[Priority queue](priority.html) on disk data currently cannot be migrated in place between 3.6 and 3.7 (a later series).
If an upgrade is performed in place, such queues would start empty (without any messages) after node restart.

To migrate an environment with priority queues and preserve their content (messages),
a [blue-green upgrade](blue-green-upgrade.html) strategy should be used.


## <a id="rabbitmq-plugins-compatibility" class="anchor" href="#rabbitmq-plugins-compatibility">Plugin Compatibility Between Versions</a>

Unless otherwise specified in release notes, RabbitMQ plugin API
introduces no breaking changes within a release series (e.g. between
`3.6.11` and `3.6.16`). If upgrading to a new minor version
(e.g. `3.7.0`), plugin must be upgraded to their versions that support
the new RabbitMQ version series.

In rare cases patch versions of RabbitMQ can break some plugin APIs.
Such cases will be documented in the breaking changes section of the release notes document.

[Community plugins page](community-plugins.html) contains information on RabbitMQ
version support for plugins not included into the RabbitMQ distribution.

### Management Plugin Upgrades

RabbitMQ management plugin comes with a Web application that runs in the browser. Clear browser cache,
local storage, session storage and cookies after upgrade is recommended.

### Discontinued Plugins

Sometimes a new feature release drops a plugin or multiple plugins from the distribution.
For example, `rabbitmq_management_visualiser` no longer ships with RabbitMQ as of
3.7.0. Such plugins **must be disabled** before the upgrade.
A node that has a missing plugin enabled will fail to start.


## <a id="system-resource-usage" class="anchor" href="#system-resource-usage">Changes in System Resource Usage and Reporting</a>

Different versions of RabbitMQ can have different resource usage. That
should be taken into account before upgrading: make sure there's enough
capacity to run the workload with the new version. Always consult with
the release notes of all versions between the one currently deployed and the
target one in order to find out about changes which could impact
your workload and resource usage.

## <a id="clusters" class="anchor" href="#clusters">Single Node and Cluster Upgrades</a>

### <a id="single-node-upgrade" class="anchor" href="#single-node-upgrade">Upgrading a Single Node Installation</a>

Upgrading single node installation is similar to upgrading clusters. [Feature flags](feature-flags.html) should be enabled after each
upgrade (it's always a good idea to double-check by enabling them before the next upgrade as well - if they are already
enabled, it will just do nothing). You should also follow the [upgrade compatibility matrix](#rabbitmq-version-upgradability).

Client (application) connections will be dropped when the node stops. Applications need to be
prepared to handle this and reconnect.

With some distributions (e.g. the generic binary UNIX) you can install a newer version of
RabbitMQ without removing or replacing the old one, which can make upgrade faster.
You should make sure the new version [uses the same data directory](relocate.html).

RabbitMQ does not support downgrades; it's strongly advised to back node's data directory up before
upgrading.

Single node deployments are often local development or test environments. In such cases, if you need to upgrade multiple versions
(eg. from `3.8.15` to `3.12.5`), it's easier to simply delete everything in the data directory and go directly
to the desired version. Effectively, it's no longer an upgrade but a fresh installation of the new version.
Please note that this process will **delete all data** in your RabbitMQ (definitions and messages), but this is usually
not a problem in a developement/test environment. The definitions can be preserved using [export/import](definitions.html).

### <a id="multiple-nodes-upgrade" class="anchor" href="#multiple-nodes-upgrade">Upgrading Multiple Nodes</a>

Depending on what versions are involved in an upgrade, RabbitMQ cluster
*may* provide an opportunity to perform upgrades without cluster
downtime using a procedure known as rolling upgrade. A rolling upgrade
is when nodes are stopped, upgraded and restarted one-by-one, with the
rest of the cluster still running while each node is being upgraded.

If rolling upgrades are not possible, the entire cluster should be
stopped, then restarted. This is referred to as a full stop upgrade.

Client (application) connections will be dropped when each node stops. Applications need to be
prepared to handle this and reconnect.

### <a id="rolling-upgrades" class="anchor" href="#rolling-upgrades">Rolling Upgrades</a>

Rolling upgrades are possible only between compatible RabbitMQ and Erlang versions.

#### <a id="rolling-upgrade-starting-with-3.8" class="anchor" href="#rolling-upgrade-starting-with-3.8">With RabbitMQ 3.8 or Later Versions</a>

RabbitMQ provides a [feature flag](feature-flags.html) subsystem which is
responsible for determining if two RabbitMQ nodes of different versions are compatible with respect
to a certain feature, important internal implementation detail or behavior.

If they are, then two nodes with different versions can run side-by-side in the
same cluster: this allows a rolling upgrade of cluster members without
shutting down the cluster entirely.

To learn more, please read the [feature flags documentation](feature-flags.html).

#### <a id="rolling-upgrade-before-3.8" class="anchor" href="#rolling-upgrade-before-3.8">Before RabbitMQ 3.8</a>

With RabbitMQ up-to and including 3.7.x, when upgrading from one major
or minor version of RabbitMQ to another (i.e. from 3.0.x to 3.1.x, or
from 2.x.x to 3.x.x), the whole cluster must be taken down for the
upgrade. Clusters that include nodes that run different release series
are not supported.

Rolling upgrades from one patch version to
another (i.e. from 3.12.x to 3.12.y) are supported except when indicated otherwise
in the release notes.
It is **strongly recommended to consult release notes before upgrading**.

Some patch releases known to require a cluster-wide restart:

* 3.6.7 and later cannot be mixed with earlier versions from the 3.6.x series
* 3.6.6 and later cannot be mixed with later versions from the 3.6.x series
* 3.0.0 cannot be mixed with later versions from the 3.0.x series

**A RabbitMQ node will fail to [re-]join a peer running an incompatible version**.

When upgrading Erlang it's advised to run all nodes on the same major series
(e.g. 26.x or 25.3.x). Even though it is possible to run a cluster with mixed
major Erlang versions, they can have subtle and important incompatibilities.

Running mixed Erlang versions can result in internal inter-node communication
protocol incompatibilities. When a node detects such an incompatibility it will
refuse to join its peer (cluster).

Upgrading to a new minor or patch version of Erlang usually can be done using
a rolling upgrade.


### <a id="rolling-upgrades-restarting-nodes" class="anchor" href="#rolling-upgrades-restarting-nodes">When to Restart Nodes</a>

It is important to let the node being upgraded to fully start and sync
all data from its peers before proceeding to upgrade the next one. You
can check for that via the management UI. Confirm that:

* the `rabbitmqctl await_startup` (or `rabbitmqctl wait &lt;pidfile&gt;`) command returns
* the node starts and rejoins its cluster according to the management overview page or `rabbitmq-diagnostics cluster_status`
* the node is not quorum-critical for any [quorum queues](#quorum-queues) and streams it hosts
* all classic mirrored queues have [synchronised mirrors](#mirrored-queues-synchronisation)

During a rolling upgrade, client connection recovery will make sure that connections
are rebalanced. Primary queue replicas will migrate to other nodes.
In practice this will put more load on the remaining cluster nodes.
This can impact performance and stability of the cluster.
It's not recommended to perform rolling upgrades under high load.

Nodes can be put into maintenance mode to prepare them for
shutdown during rolling upgrades. This is covered below.

### <a id="" class="anchor" href="#rolling-upgrades-after-upgrade">After Restarting All Nodes</a>

After performing a rolling upgrade and putting the last node out of [maintenence mode](#maintenance-mode),
perform the following steps:

 * Enable all [feature flags](./feature-flags.html) in the cluster using `rabbitmqctl enable_feature_flag all`
 * Rebalance all queue and stream leader replicas with `rabbitmq-queues rebalance all`

Enabling all feature flags is **very important** for future upgrade, which may require all
feature flags from certain earlier versions to be enabled.

Rebalancing of queue and stream leader replicas helps spread the load across
all cluster nodes.


## <a id="maintenance-mode" class="anchor" href="#maintenance-mode">Maintenance Mode</a>

### What is Maintenance Mode?

Maintenance mode is a special node operation mode introduced in latest RabbitMQ releases.
The mode is explicitly turned on and off by the operator using a bunch of new CLI commands covered below.
For mixed-version cluster compatibility, this feature must be [enabled using a feature flag](feature-flags.html)
once all cluster members have been upgraded to a version that supports it:

<pre class="lang-bash">
rabbitmqctl enable_feature_flag maintenance_mode_status
</pre>

### Put a Node into Maintenance Mode

To put a node under maintenance, use `rabbitmq-upgrade drain`:

<pre class="lang-bash">
rabbitmq-upgrade drain
</pre>

As all other CLI commands, this command can be invoked against an arbitrary node (including remote ones)
using the `-n` switch:

<pre class="lang-bash">
# puts node rabbit@node2.cluster.rabbitmq.svc into maintenance mode
rabbitmq-upgrade drain -n rabbit@node2.cluster.rabbitmq.svc
</pre>

When a node is in maintenance mode, it **will not be available for serving client traffic**
and will try to transfer as many of its responsibilities as practically possible and safe.

Currently this involves the following steps:

* Suspend all client connection listeners (no new client connections will be accepted)
* Close all existing client connections: applications are expected to reconnect to other nodes and recover
* Transfer primary replicas of all quorum queues hosted on the target node, and prevent them from participating
    in the subsequently triggered Raft elections
* Mark the node as down for maintenance
* At this point, a node shutdown will be least disruptive as the node has already transferred most of its
    responsibilities

A node in maintenance mode will not be considered for new primary queue replica placement, regardless
of queue type and the [queue leader locator policy](ha.html#leader-migration-data-locality) used.

This feature is expected to evolve based on the feedback from RabbitMQ operators, users,
and RabbitMQ core team's own experience with it.

A node in maintenance mode is expected to be shut down, upgraded or reconfigured, and restarted in a short
period of time (say, 5-30 minutes). Nodes are not expected to be running in this mode for long periods of time.

### Revive a Node from Maintenance Mode

A node in maintenance mode can be *revived*, that is, **brought back into its regular operational state**,
using `rabbitmq-upgrade revive`:

<pre class="lang-bash">
rabbitmq-upgrade revive
</pre>

As all other CLI commands, this command can be invoked against an arbitrary node (including remote ones)
using the `-n` switch:

<pre class="lang-bash">
# revives node rabbit@node2.cluster.rabbitmq.svc from maintenance
rabbitmq-upgrade revive -n rabbit@node2.cluster.rabbitmq.svc
</pre>

When a node is revived or restarted (e.g. after an upgrade), it will again accept client connections
and be considered for primary queue replica placements.

It will not recover previous client connections as RabbitMQ never initiates connections
to clients, but clients will be able to reconnect to it.

### Verify Maintenance Status of a Node

If the maintenance mode status feature flag is enabled, node maintenance status will be reported
in `rabbitmq-diagnostics status` and `rabbitmq-diagnostics cluster_status`.

If the feature flag is not enabled, the status will be reported as unknown.

Here's an example `rabbitmq-diagnostics status` output of a node under maintenance:

<pre class="lang-plaintext">
Status of node rabbit@hostname ...
Runtime

OS PID: 25531
OS: macOS
Uptime (seconds): 48540
Is under maintenance?: true

# ...
</pre>

Compare this to this example output from a node in regular operating mode:

<pre class="lang-plaintext">
Status of node rabbit@hostname ...
Runtime

OS PID: 25531
OS: macOS
Uptime (seconds): 48540
Is under maintenance?: false

# ...
</pre>


## <a id="full-stop-upgrades" class="anchor" href="#full-stop-upgrades">Full-Stop Upgrades</a>

When an entire cluster is stopped for upgrade, the order in which nodes are
stopped and started is important.

RabbitMQ will automatically update its data directory
if necessary when upgrading between major or minor versions.
In a cluster, this task is performed by the first disc node to be started
(the "upgrader" node).

Therefore when upgrading a RabbitMQ cluster using the "full stop" method,
a disc node must start first. Starting a RAM node first is not going to work:
the node will log an error and stop.

During an upgrade, the last disc node to go down must be the first node to
be brought online. Otherwise the started node will emit an error message and
fail to start up. Unlike an ordinary cluster restart, upgrading nodes will not wait
for the last disc node to come back online.

While not strictly necessary, it is a good idea to decide ahead of time
which disc node will be the upgrader, stop that node last, and start it first.
Otherwise changes to the cluster configuration that were made between the
upgrader node stopping and the last node stopping will be lost.

## <a id="caveats" class="anchor" href="#caveats">Caveats</a>

There are some minor things to consider during upgrade process when stopping and
restarting nodes.

### <a id="otp-bugs" class="anchor" href="#otp-bugs">Known Erlang OTP Bugs that Can Affect Upgrades</a>

Known bugs in the Erlang runtime can affect upgrades. Most common issues involve nodes hanging
during shutdown, which blocks subsequent upgrade steps:

* [OTP-14441](https://bugs.erlang.org/browse/ERL-430): fixed in Erlang/OTP `19.3.6` and `20.0`
* [OTP-14509](https://bugs.erlang.org/browse/ERL-448): fixed in Erlang/OTP `19.3.6.2` and `20.0.2`

Please note that both issues affect old and [no longer supported version of Erlang](./which-erlang.html).

A node that suffered from the above bugs will fail to shut down and stop responding to inbound
connections, including those of CLI tools. Such node's OS process has to be terminated
(e.g. using `kill -9` on UNIX systems).

Please note that in the presence of many messages it can take a node several minutes to shut down
cleanly, so if a node responds to CLI tool commands it could be performing various shutdown activities
such as moving enqueued messages to disk.

The following commands can be used to verify whether a node is experience the above bugs.
An affected node will not respond to CLI connections in a reasonable amount of time
when performing the following basic commands:

<pre class="lang-bash">
rabbitmq-diagnostics ping
rabbitmq-diagnostics status
</pre>

### <a id="quorum-queues" class="anchor" href="#quorum-queues">Quorum Queues</a>

[Quorum queues](quorum-queues.html) depend on a [quorum](quorum-queues.html#what-is-quorum) of nodes to
be online for any queue operations to succeed. This includes successful new leader election should
a cluster node that hosts some leaders shut down.

In the context of rolling upgrades this means that a quorum of nodes must be present at all times
during an upgrade. If this is not the case, quorum queues will become unavailable and will be not
able to satisfy their data safety guarantees.

Latest RabbitMQ releases provide a [health check](monitoring.html#health-checks) command that would fail
should any quorum queues on the target node lose their quorum in case the node was to be shut down:

<pre class="lang-bash">
# Exits with a non-zero code if one or more quorum queues will lose online quorum
# should target node be shut down
rabbitmq-diagnostics check_if_node_is_quorum_critical
</pre>

For example, consider a three node cluster with nodes A, B, and C. If node B is currently down
and there are quorum queues with leader replica on node A, this check will fail if executed
against node A. When node B comes back online, the same check would succeed because
the quorum queues with leader on node A would have a quorum of replicas online.

Quorum queue quorum state can be verified by listing queues in the management UI or using `rabbitmq-queues`:

<pre class="lang-bash">
rabbitmq-queues -n rabbit@to-be-stopped quorum_status &lt;queue name&gt;
</pre>

### <a id="mirrored-queues-synchronisation" class="anchor" href="#mirrored-queues-synchronisation">Mirrored Queues Replica Synchronisation</a>

In environments that use [classic mirrored queues](ha.html), it is important to make sure that all mirrored queues on a node
have a synchronised follower replica (mirror) **before stopping that node**.

RabbitMQ will not promote unsynchronised queue mirrors on controlled queue leader shutdown when
[default promotion settings](ha.html#promotion-while-down) are used.
However if a queue leader encounters any errors during shutdown, an [unsynchronised queue mirror](ha.html#unsynchronised-mirrors)
might still be promoted. It is generally safer option to synchronise all classic mirrored queues
with replicas on a node before shutting the node down.

Latest RabbitMQ releases provide a [health check](monitoring.html#health-checks) command that would fail
should any classic mirrored queues on the target node have no synchronised mirrors:

<pre class="lang-bash">
# Exits with a non-zero code if target node hosts leader replica of at least one queue
# that has out-of-sync mirror.
rabbitmq-diagnostics check_if_node_is_mirror_sync_critical
</pre>

For example, consider a three node cluster with nodes A, B, and C. If there are classic mirrored queues
with the only synchronised replica on node A (the leader), this check will fail if executed
against node A. When one of other replicas is re-synchronised, the same check would succeed because
there would be at least one replica suitable for promotion.

Classic mirrored queue replica state can be verified by listing queues in the management UI or using `rabbitmqctl`:

<pre class="lang-bash">
# For queues with non-empty `mirror_pids`, you must have at least one
# `synchronised_mirror_pids`.
#
# Note that mirror_pids is a new field alias introduced in RabbitMQ 3.11.4
rabbitmqctl -n rabbit@to-be-stopped list_queues --local name mirror_pids synchronised_mirror_pids
</pre>

If there are unsynchronised queues, either enable
automatic synchronisation or [trigger it using `rabbitmqctl`](ha.html#unsynchronised-mirrors) manually.

RabbitMQ shutdown process will not wait for queues to be synchronised
if a synchronisation operation is in progress.

### <a id="mirrored-queue-masters-rebalance" class="anchor" href="#mirrored-queue-masters-rebalance">Mirrored queue leaders rebalancing</a>

Some upgrade scenarios can cause mirrored queue leaders to be unevenly distributed
between nodes in a cluster. This will put more load on the nodes with more queue leaders.
For example a full-stop upgrade will make all queue leaders migrate to the "upgrader" node -
the one stopped last and started first.
A rolling upgrade of three nodes with two mirrors will also cause all queue leaders to be on the same node.

You can move a queue leader for a queue using a temporary [policy](parameters.html) with
`ha-mode: nodes` and `ha-params: [&lt;node&gt;]`
The policy can be created via management UI or rabbitmqctl command:

<pre class="lang-bash">
rabbitmqctl set_policy --apply-to queues --priority 100 move-my-queue '^&lt;queue&gt;$;' '{"ha-mode":"nodes", "ha-params":["&lt;new-master-node&gt;"]}'
rabbitmqctl clear_policy move-my-queue
</pre>

A [queue leader rebalancing script](https://github.com/rabbitmq/support-tools/blob/main/scripts/rebalance-queue-masters)
is available. It rebalances queue leaders for all queues.

The script has certain assumptions (e.g. the default node name) and can fail to run on
some installations. The script should be considered
experimental. Run it in a non-production environment first.

A [queue leader rebalance command](rabbitmq-queues.8.html) is available. It rebalances queue leaders for all queues, or those that match the given name pattern. queue leaders for mirrored queues and leaders for quorum queues are also rebalanced in the [post-upgrade command](rabbitmq-upgrade.8.html).

There is also a [third-party plugin](https://github.com/Ayanda-D/rabbitmq-queue-master-balancer)
that rebalances queue leaders. The plugin has some additional configuration and reporting tools,
but is not supported or verified by the RabbitMQ team. Use at your own risk.


## <a id="rabbitmq-restart-handling" class="anchor" href="#rabbitmq-restart-handling">Handling Node Restarts in Applications</a>

In order to reduce or eliminate the downtime, applications (both producers
and consumers) should be able to cope with a server-initiated connection
close. Some client libraries offer automatic connection recovery
to help with this:

* [Java client](api-guide.html#recovery)
* [.NET client](dotnet-api-guide.html#connection-recovery)
* [Bunny](http://rubybunny.info/articles/error_handling.html#network_connection_failures) (Ruby)

In most client libraries there is a way to react to a connection closure, for example:

* [Pika](https://pika.readthedocs.io/en/stable/modules/connection.html#pika.connection.Connection.add_on_close_callback) (Python)
* [Go](https://pkg.go.dev/github.com/rabbitmq/amqp091-go#Connection.NotifyClose)

The recovery procedure for many applications follows the same steps:

1. Reconnect
2. Re-open channels
3. Restore channel settings (e.g. the [`basic.qos` setting](confirms.html), publisher confirms)
4. Recover topology

Topology recovery includes the following actions, performed for every channel:

1. Re-declare exchanges declared by the application
2. Re-declare queues
3. Recover bindings (both queue and [exchange-to-exchange](e2e.html) ones)
4. Recover consumers

This algorithm covers the majority of use cases and is what the
aforementioned automatic recovery feature implements.

During a rolling upgrade when a node is stopped, clients connected to this node
will be disconnected using a server-sent `connection.close` method and should reconnect to a different node.
This can be achieved by using a load balancer or proxy in front of the cluster
or by specifying multiple server hosts if client library supports this feature.

Many client libraries libraries support host lists, for example:

* [Java client](https://rabbitmq.github.io/rabbitmq-java-client/api/current/com/rabbitmq/client/ConnectionFactory.html#newConnection%28com.rabbitmq.client.Address%5B%5D%29)
* [.NET client](https://github.com/rabbitmq/rabbitmq-dotnet-client/blob/main/projects/RabbitMQ.Client/client/api/ConnectionFactory.cs#L392)
* [Bunny](http://api.rubybunny.info/Bunny/Session.html#constructor_details)


## <a id="windows-upgrade-caveats" class="anchor" href="#windows-upgrade-caveats">Windows</a>

If the value of the environment variable `COMPUTERNAME` does not equal
`HOSTNAME` (upper vs lower case, or other differences) please see the [Windows Quirks guide](windows-quirks.html#computername-vs-hostname)
for instructions on how to upgrade RabbitMQ.

## <a id="recommended-upgrade-steps" class="anchor" href="#recommended-upgrade-steps">Recommended Upgrade Steps</a>

### Select a Version to Upgrade to

Patch releases contain bugfixes and features which do not break
compatibility with plugins and clusters. Rarely there are exceptions
to this statement: when this happens, the release notes will
indicate when two patch releases are incompatible.

Minor version releases contain new features and bugfixes
which do not fit a patch release.

As soon as a new minor version is released (e.g. 3.7.0), previous version series (3.6)
will have patch releases for critical bug fixes only.

There will be no new patch releases for [versions after EOL](versions.html).

Version 3.5.x reached its end of life on 2017-09-11, 3.5.8 is the last patch for 3.5.
It's recommended to always upgrade at least to the latest patch release in a series.



### Carefully Read the Release Notes Up to the Selected RabbitMQ Version

The release notes may indicate specific additional upgrade steps.
Always consult with the release notes of all versions between the
one currently deployed and the target one.


### Enable Required Feature Flags Before Attempting the Upgrade

Some versions, such as 3.11 and 3.12, [require some or all previously existing feature flags](https://www.rabbitmq.com/feature-flags.html#core-feature-flags)
to be enabled **before** the upgrade. If you enabled all feature flags after the
previous upgrade, you should be ready to go. However, it's better to verify
than run into issues. You can check the current state of your feature flags with:

```
rabbitmqctl list_feature_flags
```

and enable all feature flags with:

```
rabbitmqctl enable_feature_flag all
```

You should repeat these steps [at the end of the upgrade process](#enable-ff-after-upgrade)
to fully take advantage of the new features and be prepared for the next upgrade in the future.

### Check Currently Used RabbitMQ Version

Some upgrade paths, e.g. from 3.4.x to 3.7.x, will require an intermediate upgrade.
See the [RabbitMQ Version Upgradability](#rabbitmq-version-upgradability) section above.


### Check Erlang Version Requirements

Check if the current Erlang version is supported by the new RabbitMQ version.
See the [Erlang Version Requirements](which-erlang.html) guide.
If not, Erlang should be upgraded together with RabbitMQ.

It's generally recommended to upgrade to the latest Erlang version supported to
get all the latest bugfixes.

### Make Sure All Package Dependencies (including Erlang) are Available.

If you are using Debian or RPM packages, you must ensure
that all dependencies are available. In particular, the
correct version of Erlang. You may have to setup additional
third-party package repositories to achieve that.

Please read recommendations for
[Debian-based](which-erlang.html#debian) and
[RPM-based](which-erlang.html#redhat) distributions to find the
appropriate repositories for Erlang.

### If running RabbitMQ in a cluster, select the cluster upgrade strategy.

It can be possible to do a rolling upgrade,
if Erlang version and RabbitMQ version changes support it.

See the [Upgrading Multiple Nodes](#multiple-nodes-upgrade) section above.

### Assess Cluster Health

Make sure nodes are healthy and there are no [network partition](./partitions.html) or [disk or memory alarms](./alarms.html) in effect.

RabbitMQ management UI, CLI tools or HTTP API can be used for
assessing the health of the system.

The overview page in the management UI displays effective RabbitMQ
and Erlang versions, multiple cluster-wide metrics and rates. From
this page ensure that all nodes are running and they are all "green"
(w.r.t. file descriptors, memory, disk space, and so on).

We recommend recording the number of durable queues, the number
of messages they hold and other pieces of information about the
topology that are relevant. This data will help verify that the
system operates within reasonable parameters after the upgrade.

Use [node health checks](monitoring.html#health-checks) to
vet individual nodes.

Queues in flow state or blocked/blocking connections might be ok,
depending on your workload. It's up to you to determine if this is
a normal situation or if the cluster is under unexpected load and
thus, decide if it's safe to continue with the upgrade.

However, if there are queues in an undefined state (a.k.a. `NaN` or
"ghost" queues), you should first start by understanding what is
wrong before starting an upgrade.

### Ensure Cluster Has the Capacity for Upgrading

The upgrade process can require additional resources.
Make sure there are enough resources available to proceed, in particular free
memory and free disk space.

It's recommended to have at least half of the system memory free
before the upgrade. Default memory watermark is 0.4 so it should be
ok, but you should still double-check. Starting with RabbitMQ `3.6.11`
the way nodes [calculate their total RAM consumption](memory-use.html) has changed.

When upgrading from an earlier version,
it is required that the node has enough free disk space to fit at
least a full copy of the node data directory. Nodes create backups
before proceeding to upgrade their database. If disk space is
depleted, the node will abort upgrading and may fail to start
until the data directory is restored from the backup.

For example, if you have 10 GiB of free system memory and the Erlang
process (i.e. `beam.smp`) memory footprint is around 6 GiB, then it
can be unsafe to proceed. Likewise w.r.t. disk if you have 10 GiB of
free space and the data directory (e.g. `/var/lib/rabbitmq`) takes
10 GiB.

When upgrading a cluster using the rolling upgrade strategy,
be aware that queues and connections can migrate to other nodes
during the upgrade.

If queues are mirrored to a subset of the cluster only (as opposed
to all nodes), new mirrors will be created on running nodes when
the to-be-upgraded node shuts down. If clients support connections
recovery and can connect to different nodes, they will reconnect
to the nodes that are still running. If clients are configured to create
exclusive queues, these queues might be recreated on different nodes
after client reconnection.

To handle such migrations, make sure you have enough
spare resources on the remaining nodes so they can handle the extra load.
Depending on the load balancing strategy all the connections from
the stopped node can go to a single node, so it should be able to
handle up to twice as many.
It's generally a good practice to run a cluster with N+1 redundancy
(resource-wise), so you always have a capacity to handle a single
node being down.

### Take a Backup

It's always good to have a backup before upgrading.
See [backup](backup.html) guide for instructions.

To make a proper backup, you may need to stop the entire cluster.
Depending on your use case, you may make the backup while the
cluster is stopped for the upgrade.


### Perform the Upgrade

It's recommended to upgrade Erlang version together with RabbitMQ, because both
actions require restart and recent RabbitMQ work better with recent Erlang.

Depending on cluster configuration, you can use either [single node upgrade](#single-node-upgrade),
[rolling upgrade](#multiple-nodes-upgrade) or [full-stop upgrade](#full-stop-upgrades) strategy.

### Verify that the Upgrade Has Succeeded

Like you did before the upgrade, verify the health and data to
make sure your RabbitMQ nodes are in good shape and the service is
running again.

### <a id="enable-ff-after-upgrade" class="anchor" href="#enable-ff-after-upgrade">Enable New Feature Flags</a>

If the new version provides new feature flags, you should
now enable them if you upgraded all nodes and you are
sure you do not want to rollback. See the [feature flags guide](feature-flags.html).
