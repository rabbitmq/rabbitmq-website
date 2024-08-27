---
title: Clustering and Khepri
---

import diagramStyles from './diagram.module.css';
import MetadataStoreCluster from './metadata-store-cluster.svg';
import MetadataStoreMinority from './metadata-store-minority.svg';

# Clustering and Khepri

When you cluster RabbitMQ, what really happens is that RabbitMQ calls the
metadata store backend to create or expand its cluster. This is the same with
both Mnesia and Khepri.

Therefore, creating or expanding a Khepri-based RabbitMQ cluster is done the
same way as with Mnesia.

<figure className={diagramStyles.diagram}>
<MetadataStoreCluster/>
<figcaption>Clustering RabbitMQ happens at the metadata store level</figcaption>
</figure>

## Creating a cluster

You can create a cluster using the regular methods:
* using the CLI
* using peer discovery

See the [clustering guide](../clustering) for a complete description.

Here is an example using the CLI:

```
rabbitmqctl join_cluster rabbit@remote-host
```

## Removing a node from a cluster

Again, the regular methods can be used to remove a node from a cluster. Here
is an example with the CLI:

```
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl start_app
```

## When to enable Khepri?

It is possible to enable Khepri before or after you create or expand the
RabbitMQ. When Khepri is enabled, the first step is to [synchronize the
cluster view from Mnesia to
Khepri](./enabling-khepri#cluster-membership-synchronization) if Khepri was
enabled before the cluster was created.

## Caveats

Because of the use of the Raft consensus algorithm, all operations that
involve an update to the metadata store — and sometimes even queries — require
that a quorum number of nodes are available.

<figure className={diagramStyles.diagram}>
<MetadataStoreMinority/>
<figcaption>A quorum is required for store updates and cluster changes</figcaption>
</figure>

### Restarting a cluster member

When a cluster member is restarted or stopped, the remaining nodes may not
form a quorum anymore. This may affect the ability to start a node.

For example, in a cluster of 5 nodes where all nodes are stopped, the first
two starting nodes will wait for the third node to start before completing
their boot and start to serve messages. That’s because the metadata store
needs at least 3 nodes in this example to elect a leader and complete the
initialization process. In the meantime the first two nodes wait and may time
out if the third one does not appear.

### Adding or removing a cluster member

Likewise, there must be a Raft leader and thus a quorum number of nodes to
validate and commit any change to the cluster membership, whether a member is
added or removed. Again, the operation will time out if that condition is not
met.

Here is an example of a node joining a 4-node cluster with 3 stopped nodes:
```
# rabbitmqctl -n rabbit@host-5 join_cluster rabbit@host-4

Error:
Khepri has timed out on node rabbit@host-5.
Khepri cluster could be in minority.
```
