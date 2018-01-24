# Upgrading RabbitMQ

## Intro

This guide covers topics related to RabbitMQ installation upgrades.

It is important to consider a number of things before upgrading RabbitMQ.

1. [RabbitMQ version compatibility](#rabbitmq-version-compatibility), version upgrading from &amp; version upgrading to
1. [Erlang version requirement](#rabbitmq-erlang-version-requirement)
1. [Plugin compatiblity between versions](#rabbitmq-plugins-compatibility)
1. [Changes in system resource usage and reporting](#system-resource-usage) in the new version.
1. [Cluster configuration](#rabbitmq-cluster-configuration), single node vs. multiple nodes
1. [Caveats](#caveats)
1. [Handling node restarts](#rabbitmq-restart-handling) in applications

Changes between RabbitMQ versions are documented in the [change log](/changelog.html).

Instead of a regular ("in place") upgrade, a strategy known as [blue-green deployment](blue-green-upgrade.html)
can be used. It has the benefit of making the upgrade process safier at the cost of having
to spawn an entire new RabbitMQ cluster.

## <a id="rabbitmq-version-compatibility" class="anchor" /> [RabbitMQ Version Compatibility](#rabbitmq-version-compatibility)

When an upgrade jumps multiple release series (e.g. goes from `3.4.x` to `3.6.x`), it may be necessary to perform
an intermediate upgrade first. For example, when upgrading from `3.2.x` to `3.7.x`, it would be necessary to
first upgrade to 3.6.x and then upgrade to 3.7.0.

Current release series upgrade compatibility:

| From     | To     |
|----------|--------|
| 3.6.x    | 3.7.x  |
| 3.5.x    | 3.7.x  |
| =< 3.4.x | 3.6.14 |

## <a id="rabbitmq-erlang-version-requirement" class="anchor" /> [Erlang Version Requirements](#rabbitmq-erlang-version-requirement)

We recommended that you upgrade Erlang together with RabbitMQ.
Please refer to the [Erlang Version Requirements](/which-erlang.html) guide.

## <a id="rabbitmq-plugins-compatibility" class="anchor" /> [Plugin Compatibility Between Versions](#rabbitmq-plugins-compatibility)

Unless otherwise specified in release notes, RabbitMQ plugin API
introduces no breaking changes within a release series (e.g. between
`3.6.11` and `3.6.14`). If upgrading to a new minor version
(e.g. `3.7.0`), plugin must be upgraded to their versions that support
the new RabbitMQ version series.

In rare cases patch versions of RabbitMQ (e.g. 3.6.7) can break some plugin APIs.
Such cases will be documented the breaking changes section of the release notes document.

[Community plugins page](/community-plugins.html) contains information on RabbitMQ
version support for plugins not included into the RabbitMQ distribution.

Sometimes a new feature release drops a plugin or multiple plugins from the distribution.
For example, `rabbitmq_management_visualiser` no longer ships with RabbitMQ as of
3.7.0. Such plugins **must be disabled** before the upgrade.
A node that has a missing plugin enabled will fail to start.


## <a id="system-resource-usage" class="anchor" /> [Changes in System Resource Usage and Reporting](#system-resource-usage)

Different versions of RabbitMQ can have different resource usage. That
should be taken into account before upgrading: make sure there's enough
capacity to run the workload with the new version. Always consult with
the release notes of all versions between the one currently deployed and the
target one in order to find out about changes which could impact
your workload and resource usage.

### <a id="stats-db-in-3.6.7" class="anchor" /> [Management stats DB in RabbitMQ 3.6.7](#stats-db-in-3.6.7)

In RabbitMQ versions before `3.6.7` all management stats in a cluster
were collected on a single node (the stats DB node). This put a lot
of additional load on this node. Starting with RabbitMQ `3.6.7` each
cluster node stores its own stats. It means that metrics (e.g. rates)
for each node are stored and calculated locally. Therefore all nodes
will consume a bit more memory and CPU resources to handle that. The
benefit is that there is no single overloaded stats node.

When an HTTP API request comes in, the stats are aggregated on the node
which handles the request. If HTTP API requests are not distributed
between cluster nodes, it can put some additional load on that node's
CPU and memory resources. In practice stats database-related overload is
a thing of the past.

Individual node resource usage change is workload-specific. The best way
to measure it is by reproducing a comparable workload in a temporary QA
environment before upgrading production systems.

### <a id="memory-reporting-in-3.6.11" class="anchor" /> [Memory reporting accuracy in RabbitMQ 3.6.11](#memory-reporting-in-3.6.11)

In RabbitMQ versions before `3.6.11` memory used by the node was
calculated using a runtime-provided mechanism that's not very precise.
The actual memory allocated by the
OS process usually was higher.

Starting with RabbitMQ `3.6.11` a number of strategies is available. On Linux, MacOS, and BSD
systems, operating system facilities will be used to compute the total amount of memory
allocated by the node. It is possible to go back to the previous strategy, although
that's not recommended. See the [Memory Usage guide](/memory-use.html) for details.

After upgrading from a version prior to `3.6.11` to
`3.6.11` or later, the memory usage reported by the management
UI will increase. The effective node memory footprint didn't actually change
but the calculation is now more accurate and no longer underreports.

Nodes that often hovered around their RAM high watermark will see more
frequent memory alarms and publishers will be blocked more often. On the upside
this means that RabbitMQ nodes are less likely to be killed by the out-of-memory (OOM) mechanism
of the OS.

## <a id="rabbitmq-cluster-configuration" class="anchor" /> [RabbitMQ Cluster Configuration](#rabbitmq-cluster-configuration)

### <a id="single-node-upgrade" class="anchor" /> [Upgrading a Single Node Installation](#single-node-upgrade)

When upgrading a single node installation, simply stop the node, install a new version and start it back.
The node will perform all the necessary local database migrations on start. Depending on the nature
of migrations and data set size this can take some time.

A data directory backup is performed before applying any migrations. The backup is deleted after
successful upgrade. Upgrades therefore can temporarily double the amount of disk space node's data
directory uses.

Client (application) connections will be dropped when the node stops. Applications need to be
prepared to handle this and reconnect.

With some distributions (e.g. the generic binary UNIX) you can install a newer version of
RabbitMQ without removing or replacing the old one, which can make upgrade faster.
You should make sure the new version [uses the same data directory](/relocate.html).

RabbitMQ does not support downgrades; it's strongly advised to back node's data directory up before
upgrading.

### <a id="multiple-nodes-upgrade" class="anchor" /> [Upgrading Multiple Nodes](#multiple-nodes-upgrade)

Depending on what versions are involved in an upgrade, RabbitMQ cluster
*may* provide an opportunity to perform upgrades without cluster
downtime using a procedure known as rolling upgrade. A rolling upgrade
is when nodes are stopped, upgraded and restarted one-by-one, with the
rest of the cluster still running while each node is being upgraded.

If rolling upgrades are not possible, the entire cluster should be
stopped, then restarted. This is referred to as a full stop upgrade.

Client (application) connections will be dropped when each node stops. Applications need to be
prepared to handle this and reconnect.

#### <a id="rolling-upgrades" class="anchor" /> [Rolling Upgrades](#rolling-upgrades)

##### <a id="rolling-upgrades-version-limitations" class="anchor" /> [Version limitations](#rolling-upgrades-version-limitations)

Rolling upgrades are possible only between some RabbitMQ and Erlang versions.

When upgrading from one major or minor version of RabbitMQ to another
(i.e. from 3.0.x to 3.1.x, or from 2.x.x to 3.x.x),
the whole cluster must be taken down for the upgrade.
Clusters that include nodes that run different release series are not supported.

Rolling upgrades from one patch version to
another (i.e. from 3.6.x to 3.6.y) are supported except when indicated otherwise
in the release notes.
It is strongly recommended to consult release notes before upgrading.

Some patch releases known to require a cluster-wide restart:

* 3.6.7 and later cannot be mixed with earlier versions from the 3.6.x series
* 3.6.6 and later cannot be mixed with earlier versions from the 3.6.x series
* 3.0.0 cannot be mixed with later versions from the 3.0.x series

***A RabbitMQ node will fail to [re-]join a peer running an incompatible version***.

When upgrading Erlang it's advised to run all nodes on the same major series
(e.g. 19.x or 20.x). Even though it is possible to run a cluster with mixed
Erlang versions, they can have incompatibilities that will affect cluster stability.

Running mixed Erlang versions can result in internal inter-node communication
protocol incompatibilities. When a node detects such an incompatibility it will
refuse to join its peer (cluster).

Upgrading to a new minor or patch version of Erlang usually can be done using
a rolling upgrade.

##### <a id="rolling-upgrades-restarting-nodes" class="anchor" /> [Restarting nodes](#rolling-upgrades-restarting-nodes)

It is important to let the node being upgraded to fully start and sync
all data from its peers before proceeding to upgrade the next one. You
can check for that via the management UI. Confirm that:

* the `rabbitmqctl wait &lt;pidfile&gt;` command returns;
* the node is fully started from the overview page;
* queues are [synchronised](#mirrored-queues-synchronisation) from the queues list.

During a rolling upgrade connections and queues will be rebalanced.
This will put more load on the broker. This can impact performance
and stability of the cluster. It's not recommended to perform rolling
upgrades under high load.

#### <a id="full-stop-upgrades" class="anchor" /> [Full-Stop Upgrades](#full-stop-upgrades)

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

Automatic upgrades are only possible from RabbitMQ versions 2.1.1 and later.
If you have an earlier cluster, you will need to rebuild it to upgrade.

## <a id="caveats" class="anchor" /> [Caveats](#caveats)

There are some minor things to consider during upgrade process when stopping and
restarting nodes.

### <a id="otp-bugs" class="anchor" /> [Known Erlang OTP Bugs that Can Affect Upgrades](#otp-bugs)

Known bugs in the Erlang runtime can affect upgrades. Most common issues involve nodes hanging
during shutdown, which blocks subsequent upgrade steps:

* [OTP-14441](https://bugs.erlang.org/browse/ERL-430): fixed in Erlang/OTP `19.3.6` and `20.0`
* [OTP-14509](https://bugs.erlang.org/browse/ERL-448): fixed in Erlang/OTP `19.3.6.2` and `20.0.2`

A node that suffered from the above bugs will fail to shut down and stop responding to inbound
connections, including those of CLI tools. Such node's OS process has to be terminated
(e.g. using `kill -9` on UNIX systems).

Please note that in the presence of many messages it can take a node several minutes to shut down
cleanly, so if a node responds to CLI tool commands it could be performing various shutdown activities
such as moving enqueued messages to disk.

The following commands can be used to verify whether a node is experience the above bugs.
An affected node will not respond to CLI connections in a reasonable amount of time
when performing the following basic commands:

<pre class="sourcecode sh">
rabbitmqctl status
rabbitmqctl eval "ok."
</pre>

### <a id="mirrored-queues-synchronisation" class="anchor" /> [Mirrored queues synchronisation](#mirrored-queues-synchronisation)

Before stopping a node, make ensure that
all mirrored queue masters it holds have at least one synchronised queue mirror.
RabbitMQ will not promote unsynchronised queue mirrors on controlled
queue master shutdown when
[default promotion settings](ha.html#promotion-while-down) are used.
However if a queue master encounters any errors during shutdown, an unsynchronised
queue slave might still be promoted. It is generally safier option to synchronise
a queue first.

This can be verified by listing queues in the management UI or using `rabbitmqctl`:

<pre class="sourcecode sh">
# For queues with non-empty `slave_pids`, you must have at least one
# `synchronised_slave_pids`.
rabbitmqctl -n rabbit@to-be-stopped list_queues --local name slave_pids synchronised_slave_pids
</pre>

If there are unsynchronised queues, either enable
automatic synchronisation or [trigger it using
`rabbitmqctl`](ha.html#unsynchronised-mirrors) manually.

RabbitMQ shutdown process will not wait for queues to be synchronised
if a synchronisation operation is in progress.

### <a id="mirrored-queue-masters-rebalance" class="anchor" /> [Mirrored queue masters rebalancing](#mirrored-queue-masters-rebalance)

Some upgrade scenarios can cause mirrored queue masters to be unevenly distributed
between nodes in a cluster. This will put more load on the nodes with more queue masters.
For example a full-stop upgrade will make all queue masters migrate to the "upgrader" node -
the one stopped last and started first.
A rolling upgrade of three nodes with two mirrors will also cause all queue masters to be on the same node.

You can move a queue master for a queue using a temporary [policy](/parameters.html) with
`ha-mode: nodes` and `ha-params: [&lt;node&gt;]`
The policy can be created via management UI or rabbitmqctl command:
<pre class="sourcecode sh">
rabbitmqctl set_policy --apply-to queues --priority 100 move-my-queue '^&lt;queue&gt;$;' '{"ha-mode":"nodes", "ha-params":["&lt;new-master-node&gt;"]}'
rabbitmqctl clear_policy move-my-queue
</pre>

A [queue master rebalancing script](https://github.com/rabbitmq/support-tools/blob/master/scripts/rebalance-queue-masters)
is available. It rebalances queue masters for all queues.

The script has certain assumptions (e.g. the default node name) and can fail to run on
some installations. The script should be considered
experimental. Run it in a non-production environment first.

There is also a [third-party plugin](https://github.com/Ayanda-D/rabbitmq-queue-master-balancer)
that rebalances queue masters. The plugin has some additional configuration and reporting tools,
but is not supported or verified by the RabbitMQ team. Use at your own risk.


## <a id="rabbitmq-restart-handling" class="anchor" /> [Handling Node Restarts in Applications](#rabbitmq-restart-handling)

In order to reduce or eliminate the downtime, applications (both producers
and consumers) should be able to cope with a server-initiated connection
close. Some client libraries offer automatic connection recovery
to help with this:

* [Java client](api-guide.html#recovery)
* [.NET client](dotnet-api-guide.html#connection-recovery)
* [Bunny](http://rubybunny.info/articles/error_handling.html#network_connection_failures) (Ruby)

In most client libraries there is a way to react to a connection closure, for example:

* [Pika](https://pika.readthedocs.io/en/0.10.0/modules/connection.html#pika.connection.Connection.add_on_close_callback) (Python)
* [Go](https://godoc.org/github.com/streadway/amqp#Connection.NotifyClose)

The recovery procedure for many applications follows the same steps:

1. Reconnect
2. Re-open channels
3. Restore channel settings (e.g. the [`basic.qos` setting](/confirms.html), publisher confirms)
4. Recovery topology

Topology recovery includes the following actions, performed for every channel:

1. Re-declare exchanges declared by the application
2. Re-declare queues
3. Recover bindings (both queue and [exchange-to-exchange](/e2e.html) ones)
4. Recover consumers

This algorithm covers the majority of use cases and is what the
aforementioned automatic recovery feature implements.

During a rolling upgrade when a node is stopped, clients connected to this node
will be disconnected using a server-sent `connection.close` method and should reconnect to a different node.
This can be achieved by using a load balancer or proxy in front of the cluster
or by specifying multiple server hosts if client library supports this feature.

The following libraries support host lists:

* [Java client](http://www.rabbitmq.com/releases/rabbitmq-java-client/current-javadoc/com/rabbitmq/client/ConnectionFactory.html#newConnection-com.rabbitmq.client.Address:A-)
* [.NET client](https://github.com/rabbitmq/rabbitmq-dotnet-client/blob/master/projects/client/RabbitMQ.Client/src/client/api/ConnectionFactory.cs#L376)
* [Bunny](http://api.rubybunny.info/Bunny/Session.html#constructor_details)

## <a id="recommended-upgrade-steps" class="anchor" /> [Recommended Upgrade Steps](#recommended-upgrade-steps)

1. Select a version to upgrade to.

    Patch releases contain bugfixes and features which do not break
    compatibility with plugins and clusters. Rarely there are exceptions
    to this statement: when this happens, the release notes will
    indicate when two patch releases are incompatible.

    Minor version releases contain new features and bugfixes
    which do not fit a patch release.

    As soon as a new minor version is released (e.g. 3.7.0), previous verison series (3.6)
    will have patch releases for critical bugfixes only.

    There will be no new patch releases for versions after EOL.

    Version 3.5.x reached it's end of life on 2017-09-11, 3.5.8 is the last patch for 3.5.
    It's recommended to always upgrade at least to the latest patch release in a series.

1. Read carefully the release notes up to the selected RabbitMQ version.

    The release notes may indicate specific additional upgrade steps.
    Always consult with the release notes of all versions between the
    one currently deployed and the target one.

1. Check version compatibility.

    To upgrade from 3.4.x to 3.7.x, the intermediate upgrade is required.
    See the [RabbitMQ Version Compatibility](#rabbitmq-version-compatibility) section above.

1. Check Erlang version requirements.

    Check if the current Erlang version is supported by the new RabbitMQ version.
    See the [Erlang Version Requirements](/which-erlang.html) guide.
    If not, Erlang should be upgraded together with RabbitMQ.

    It's generally recommended to upgrade to the latest Erlang version supported to
    get all the latest bugfixes.

1. Make sure all package dependencies (in particular Erlang) are available.

    If you are using Debian or RPM packages, you must ensure
    that all dependencies are available. In particular, the
    correct version of Erlang. You may have to setup additional
    third-party package repositories to achieve that.

    Please read recommendations for
    [Debian-based](/which-erlang.html#debian) and
    [RPM-based](/which-erlang.html#redhat) distributions to find the
    appropriate repositories for Erlang.

1. If running RabbitMQ in a cluster, select the cluster upgrade strategy.

    It can be possible to do a rolling upgrade,
    if Erlang version and RabbitMQ version changes support it.

    See the [Upgrading Multiple Nodes](#multiple-nodes-upgrade) section above.

1. Verify broker health.

    Make sure nodes are healthy and there are no [network
    partition](/partitions.html) or [disk or memory
    alarms](/alarms.html) in effect.

    RabbitMQ management UI, CLI tools or HTTP API can be used for
    assessing the health of the system.

    The overview page in the management UI displays effective RabbitMQ
    and Erlang versions, multiple cluster-wide metrics and rates. From
    this page ensure that all nodes are running and they are all "green"
    (w.r.t. file descriptors, memory, disk space, and so on).

    We recommend recording the number of durable queues, the number
    of messages they hold and other pieces of information about the
    topology that are relevant. This data wil help verify that the
    system operates within reasonable parameters after the upgrade.

    Use the `rabbitmqctl node_health_check` command to
    vet individual nodes.

    Queues in flow state or blocked/blocking connections might be ok,
    depending on your workload. It's up to you to determinate if this is
    a normal situation or if the cluster is under unexpected load and
    thus, decide if it's safe to continue with the upgrade.

    However, if there queues in an undefined state (a.k.a. `NaN` or
    "ghost" queues), you should first start by understanding what is
    wrong before starting an upgrade.

1. Make sure the broker has a capacity to upgrade.

    The upgrade process can require additional resources.
    Make sure there are enough resources available to proceed, in particular free
    memory and free disk space.

    It's recommended to have at least half of the system memory free
    before the upgrade. Default memory watermark is 0.4 so it should be
    ok, but you should still double-check. Starting with RabbitMQ `3.6.11`
    the way nodes [calculate their total RAM consumption](/memory-use.html) has changed.
    When upgrading from an earlier version.

    It is required that the node has enough free disk space to fit at
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

1. Take a backup.

    It's always good to have a backup before upgrading.
    See [backup](/backup.html) guide for instructions.

    To make a proper backup, you may need to stop the entire cluster.
    Depending on your use case, you may make the backup while the
    cluster is stopped for the upgrade.

1. Perform the upgrade.

    It's recommended to upgrade Erlang version together with RabbitMQ, because both
    actions require restart and recent RabbitMQ work better with recent Erlang.

    Depending on cluster configuration, you can use either [single node upgrade](#single-node-upgrade),
    [rolling upgrade](#multiple-nodes-upgrade) or [full-stop upgrade](#full-stop-upgrades) strategy.

1. Verify that the upgrade has succeeded

    Like you did before the upgrade, verify the health and data to
    make sure your RabbitMQ nodes are in good shape and the service is
    running again.
