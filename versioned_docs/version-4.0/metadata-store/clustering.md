---
title: Clustering and Khepri
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import diagramStyles from './diagram.module.css';
import MetadataStoreCluster from './metadata-store-cluster.svg';
import MetadataStoreMinority from './metadata-store-minority.svg';

# Clustering and Khepri

When RabbitMQ nodes are [clustered](../clustering), they call the metadata
store backend to create or expand its cluster. This is the case both Mnesia
and Khepri.

Therefore, [formation](../cluster-formation) or expansion of a Khepri-based
RabbitMQ cluster is done the same way as with Mnesia.

<figure className={diagramStyles.diagram}>
<MetadataStoreCluster/>
<figcaption>Clustering RabbitMQ happens at the metadata store
level</figcaption>
</figure>

## Creating a Cluster

You can create a cluster using the regular methods:
* using [CLI tools](../cli)
* using [peer discovery](../cluster-formation)

See the [clustering guide](../clustering) for a complete description.

Here is an example using the CLI:

```bash
rabbitmqctl join_cluster rabbit@remote-host
```

## Removing a Node from a Cluster

Just like with cluster formation, the regular methods can be used to remove a
node from a cluster.

Here is an example that use CLI tools:

```bash
# Stop RabbitMQ without stopping the runtime (its OS process).
rabbitmqctl stop_app

# Reset it.
rabbitmqctl reset

# Restart the node as a blank one.
rabbitmqctl start_app
```

## When to Enable Khepri?

It is possible to enable Khepri before or after the cluster is created.

When Khepri is enabled, the first step is to [synchronize the cluster view
from Mnesia to Khepri](./how-to-enable-khepri#migration) if Khepri was enabled
after the cluster was created.

## Caveats

Because of the use of the Raft consensus algorithm, all operations that
involve an update to the metadata store — and sometimes even queries — require
that a quorum number of nodes are available.

<figure className={diagramStyles.diagram}>
<MetadataStoreMinority/>
<figcaption>A quorum is required for store updates and cluster
changes</figcaption>
</figure>

This is true for Khepri as much as other Raft-based features, namely [quorum
queues](../quorum-queues) and [streams](../streams).

### Restarting a Cluster Member

When a cluster member is restarted or stopped, the remaining nodes may lose
their quorum. This may affect the ability to start a node.

For example, in a cluster of 5 nodes where all nodes are stopped, the first
two starting nodes will wait for the third node to start before completing
their boot and start to serve messages. That’s because the metadata store
needs at least 3 nodes in this example to elect a leader and complete the
initialization process. In the meantime the first two nodes wait and may time
out if the third one does not appear.

### Adding or Removing a Cluster Member

Likewise, there must be a Raft leader and thus a quorum number of nodes to
validate and commit any change to the cluster membership, whether a member is
added or removed. Again, the operation will time out if that condition is not
met.

Here is an example of a node joining a 4-node cluster with 3 stopped nodes:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl -n rabbit@host-5 join_cluster rabbit@host-4

# => Error:
# => Khepri has timed out on node rabbit@host-5.
# => Khepri cluster could be in minority.
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat -n rabbit@host-5 join_cluster rabbit@host-4

# => Error:
# => Khepri has timed out on node rabbit@host-5.
# => Khepri cluster could be in minority.
```
</TabItem>
</Tabs>
