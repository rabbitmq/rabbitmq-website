# Upgrading RabbitMQ.

## Before you upgrade

### <a id="erlang"/> Erlang version

Different versions of RabbtiMQ support different versions of Erlang.
It's recommended to upgrade Erlang version when upgrading a RabbitMQ version
if it possible.

Erlang version compatibility chart can be found [here](/which-erlang.html).

### <a id="aompatibility"/> Compatible versions

Some version changes require intermediate upgrade. To upgrade to the latest version
from some old versions, you should first upgrade to an intermediate version.

Current version upgrade compatibility:

| From     | To     |
|----------|--------|
| 3.5.x    | 3.7.0  |
| 3.6.x    | 3.7.0  |
| =< 3.4.x | 3.6.14 |

To upgrade RabbitMQ from version `3.4.x` or earlier to version `3.7.0`,
you should first upgrade to `3.6.14`, then to `3.7.0`.

### <a id="plugins"/> Plugin compatibility

RabbitMQ plugins API is supposed to be compatible in a single minor version track
(e.g. between `3.6.11` and `3.6.14`). If upgrading to a new minor version
(e.g. `3.7.0`), you should upgrade plugins to versions, which support the
new RabbitMQ minor version track.

Sometimes patch versions of RabbitMQ (e.g. 3.6.7) can break some plugin APIs.
Please consult with release notes.

[Community plugins page](/community-plugins.html) contains information on RabbitMQ
version support for plugins.

## <a id="single-node"/> Single node upgrade.

To upgrade a single node RabbitMQ broker, the server running the old version
should be stopped, and the new version started.
The broker will handle data upgrade on startup.
During data upgrade RabbitMQ will create a data backup,
which will be deleted after a successful upgrade.

On some distributions (e.g. generic unix) you can install a newer version of
RabbitMQ without removing or replacing the old one, which can make upgrade faster.
You should make sure the new version points to the same data directory.

RabbitMQ does not support downgrades; it's strongly advised to backup data before
performing an upgrade.

## <a id="cluster"/> Cluster upgrades

RabbitMQ cluster *may* provide an opportunity to perform upgrades
without cluster downtime using so-called rolling upgrade.

Rolling upgrade is when nodes are stopped, upgraded and restarted
one-by-one, so the cluster is still running while each node is upgrading.
It is important to let an upgrading node fully start and sync all the mirrored
queues before upgrading the next node.

During a rolling upgrade connections and queues will be rebalanced. This will
put more load on the broker. This can impact performance and stability
of the cluster. It's not recommended to perform rolling upgrades
under high load.

### <a id="cluster-versions"/> Version limitations for rolling upgrades

Rolling upgrades are possible only between some RabbitMQ and Erlang versions.

When upgrading from one major or minor version of RabbitMQ to another
(i.e. from 3.0.x to 3.1.x, or from 2.x.x to 3.x.x),
the whole cluster must be taken down for the upgrade
(since clusters cannot run mixed versions like this).
This will generally not be the case when upgrading from one patch version to
another (i.e. from 3.0.x to 3.0.y), except when indicated otherwise
in the release notes; these versions can be mixed in a cluster.
Therefore, it is strongly recommended to consult release notes before upgrading.

Some patch releases known to require a cluster-wide restart:

* 3.0.0 cannot be mixed with later versions from the 3.0.x series
* 3.6.6 and later cannot be mixed with earlier versions from the 3.6.x series
* 3.6.7 and later cannot be mixed with earlier versions from the 3.6.x series

***A RabbitMQ node will fail to join a cluster with incompatible versions***

When upgrading Erlang, it's advised to run all nodes on the same major series
(e.g. 19.x or 20.x), because even though you can start a cluster with different
versions, they can have incompatibilities hard to predict.

A RabbitMQ node will fail to join a cluster only of mnesia protocol is incompatible,
which happened in the past every 3-5 major Erlang releases.

It should be possible to upgrade to a newer minor Erlang version without stopping
entire cluster.

### <a id="cluster-full-stop"/> Full-stop upgrades

When entire cluster is stopped for upgrade, the order in which nodes are
stopped and started is important.

RabbitMQ will automatically update its persistent data structures
if necessary when upgrading between major / minor versions.
In a cluster, this task is performed by the first disc node to be started
(the "upgrader" node).
Therefore when upgrading a RabbitMQ cluster, you should not attempt to start
any RAM nodes first; any RAM nodes started will emit an error message
and fail to start up.

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
