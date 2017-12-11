# Upgrading RabbitMQ

## Intro

This guide covers topics related to RabbitMQ installation upgrades.

It is important to consider a number of things before upgrading RabbitMQ.

1. RabbitMQ version compatibility, version upgrading from &amp; version upgrading to
1. Erlang version requirement
1. plugin compatiblity between versions
1. Cluster configuration, single node vs. multiple nodes

Changes between RabbitMQ versions are documented in the [change log](/changelog.html).

## <a id="rabbitmq-version-compatibility" class="anchor" /> [RabbitMQ Version Compatibility](#rabbitmq-version-compatibility)

When an upgrade jumps multiple release series (e.g. goes from `3.4.x` to `3.6.x`), it may be necessary to perform
an intermediate upgrade first. For example, when upgrading from `3.2.x` to `3.7.x`, it would be necessary to
first upgrade to 3.6.x and then upgrade to 3.7.0.

Current release series upgrade compatibility:

| From     | To     |
|----------|--------|
| 3.6.x    | 3.7.0  |
| 3.5.x    | 3.7.0  |
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

## <a id="rabbitmq-cluster-configuration" class="anchor" /> [RabbitMQ cluster configuration](#rabbitmq-cluster-configuration)

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

Minor version releases contain new features and bugfixes,
which do not fit a patch release.
Patch releases contain bugfixes and minor features,
which do not break compatibility with plugins and clusters.

As soon as new minor version released (e.g. 3.7.0), previous verison series (3.6)
will have patch releases for critical bugfixes only.
There will be no new patch releases for versions after EOL.
Version 3.5.x reached it's end of life on 2017-09-11, 3.5.8 is the last patch for 3.5.
It's recommended to always upgrade at least to the latest patch release in a series.

1. Check version compatibility.

To upgrade from 3.4.x to 3.7.x the intermediate upgrade is required.
See the [RabbitMQ Version Compatibility](#rabbitmq-version-compatibility) section above.

1. Check Erlang version requirements.

Check if the current Erlang version is supported by the new RabbitMQ version.
See the [Erlang Version Requirements](/which-erlang.html) guide.
If not - Erlang should be upgrades together with RabbitMQ.
It's generally recommended to upgrade to the latest Erlang version supported to
get all the latest bugfixes.

1. If running RabbitMQ in a cluster - select the cluster upgrade strategy.

It can be possible to do a rolling upgrade,
if Erlang version and RabbitMQ version changes support it.
See the [Upgrading Multiple Nodes](#multiple-nodes-upgrade) section above.

1. Take a backup.

It's always good to have a schema backup before upgrading.
See [backup](/backup.html) guide for instructions.

1. Perform the upgrade.

It's recommended to upgrade Erlang version together with RabbitMQ, because both
actions require restart and recent versions work better with recent Erlang versions.

Depending on cluster configuration, you can use either [single node upgrade](#single-node-upgrade),
[rolling upgrade](#multiple-nodes-upgrade) or [full-stop upgrade](#full-stop-upgrade) strategy.

1. Verify broker health and version.

You can use `rabbitmqctl node_health_check` command, RabbitMQ management UI or
HTTP API to run basic health-checks.

The overview page in the management UI displays effective RabbitMQ and Erlang
version, basic health stats and message rates.






















