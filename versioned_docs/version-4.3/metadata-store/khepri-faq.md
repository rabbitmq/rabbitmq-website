---
title: Khepri FAQ
---

# Khepri FAQ

### I see the `khepri_db` feature flag is marked as experimental in the RabbitMQ code. Is it supported? {#supported-even-if-experimental}

Yes, starting from RabbitMQ 4.0, the RabbitMQ team will support nodes using
Khepri. Likewise, an upgrade path will be provided to move to future versions.

Khepri in RabbitMQ 3.13.x is unsupported however. It is not possible to
upgrade from 3.13.x to 4.x and beyond if Khepri was enabled on the 3.13.x
node(s). You will have to use a [blue-green deployment](../blue-green-upgrade)
to move everything to another node or cluster.

### I see the `khepri_db` feature flag is marked as experimental in the RabbitMQ code. Will it be possible to upgrade to future releases?

Yes; see the [previous question](#supported-even-if-experimental) and answer.

### Why do I see "Starting Khepri-based RabbitMQ metadata store" in logs even though I did not enable `khepri_db`? {#khepri-started-but-not-enabled}

The Khepri metadata store is always initialized even if RabbitMQ does not use
it and instead continue to use Mnesia as its backend.

The reason is that the `khepri_db` feature flag can be enabled from any node.
That node must be able to communicate with Khepri on all nodes in the cluster.
Therefore Khepri is started everywhere to be ready when it is enabled in the
future.

In the meantime, it will not use resources or interfere with the operations of
the node or the cluster.

### Why do I see "Khepri-based RabbitMQ metadata store ready" in logs even though I did not enable `khepri_db`?

See the [previous question](#khepri-started-but-not-enabled) and answer.

### Is it possible to disable Khepri?

No, once the migration is performed, going back to Mnesia is unsupported.

An alternative is to use a [blue-green deployment](../blue-green-upgrade) to
move everything to another node or cluster and decommission the Khepri-enabled
nodes.

### Is it possible to take definitions from a Mnesia-based node and import them in a Khepri-based one?

Yes. The definitions are metadata-store-agnostic and can be imported in a
RabbitMQ node regardless of the metadata store backend used by the node used to
export the definitions of the one where they are imported.
