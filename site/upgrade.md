# Upgrading RabbitMQ

## Intro

This guide covers topics related to RabbitMQ installation upgrades.

It is important to consider a number of things before upgrading RabbitMQ.

1. [RabbitMQ version compatibility](#rabbitmq-version-compatibility), version upgrading from &amp; version upgrading to
1. [Erlang version requirement](#rabbitmq-erlang-version-requirement)
1. [Plugin compatiblity between versions](#rabbitmq-plugins-compatibility)
1. [Changes in system resource usage and reporting](#system-resource-usage) in the new version.
1. [Cluster configuration](#rabbitmq-cluster-configuration), single node vs. multiple nodes

Changes between RabbitMQ versions are documented in the [change log](/changelog.html).

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

Depending on what versions are involved in an upgrade, RabbitMQ cluster *may* provide an opportunity to perform upgrades
without cluster downtime using a procedure known as rolling upgrade.

During a rolling upgrade is when nodes are stopped, upgraded and restarted
one-by-one, with the rest of the cluster still running while each node being upgraded.
It is important to let the node being upgraded to fully start and sync all data from its peers
before proceeding to upgrade the next one.

Client (application) connections will be dropped when each node stops. Applications need to be
prepared to handle this and reconnect.

During a rolling upgrade connections and queues will be rebalanced. This will
put more load on the broker. This can impact performance and stability
of the cluster. It's not recommended to perform rolling upgrades
under high load.

#### <a id="rolling-upgrades-version-limitations" class="anchor" /> [Version Limitations For Rolling Upgrades](#rolling-upgrades-version-limitations)

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

## <a id="recommended-upgrade-process" class="anchor" /> [Recommended upgrade process](#recommended-upgrade-process)

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

1. Read carefully the release notes of the selected RabbitMQ version.

    The release notes may indicate specific additional upgrade steps.

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

    Make sure nodes are healthy and there is no [network
    partition](/partitions.html) or [disk or memory
    alarms](/alarms.html).

    You can use `rabbitmqctl node_health_check` command, RabbitMQ management UI or
    HTTP API to run basic health-checks.

    The overview page in the management UI displays effective RabbitMQ and Erlang
    versions, basic health stats and message rates.

    You can take this opportunity to record the number of durable
    queues, the number of messages they hold and any informations about
    the topology you like. It can be useful to double-check everything
    is restored properly after the upgrade.

1. Make sure the broker has a capacity to upgrade.

    The upgrade process can take some additional resources, so you
    should make sure there are enough to proceed, in particular free
    memory and available disk space.

    It's recommended to have at least half of the system memory free
    before the upgrade. Default memory watermark is 0.4 so it should be
    ok, but you should still double-check. In versions before `3.6.11`
    memory usage is not calculated based on the system memory usage but
    on internal Erlang metric and thus can be underreported. Therefore
    you should use system tools to determine how much more memory you
    will need.

    As for disk space it's recommended to have enough space to fit at
    least a copy RabbitMQ data directory (for a backup made during
    upgrade). If disk space is depleted, RabbitMQ can crash and fail to
    start, making data recovery extremely hard.

    When upgrading a cluster using rolling upgrade strategy, you should
    be aware that some queues and connections can move to other nodes
    during upgrade.

    If queues are mirrored to a subset of the cluster only (as opposed
    to all nodes), new mirrors will be created on running nodes when
    the to-be-upgraded node shuts down. If clients support connections
    recovery and can connect to different nodes, new connections will
    be created on running nodes. If clients are configured to create
    exclusive queues, these queues might be recreated on different nodes
    as clients reconnect.

    To handle such migrations, you should make sure you have enough
    resources on the remaining nodes so they can handle the extra load.
    Depending on the load balancing strategy all the connections from
    the stopped node can go to a single node, so it should be able to
    handle up to twice as many.
    It's generally a good practice to run a cluster with N+1 redundancy
    (resource-wise), so you always have a capacity to handle a single
    node shutting down.

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

1. Verify broker health and version.

    Like you did before the upgrade, verify the health and data to
    make sure your RabbitMQ nodes are in good shape and the service is
    running again.
