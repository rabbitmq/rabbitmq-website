---
title: How Khepri Approaches Failure Recovery
---

# How Khepri Approaches Failure Recovery

This section describes Khepri’s Raft-based approach to failure handling and
recovery.

## Behavior in Cluster Minority

When Mnesia is used as the metadata store backend, RabbitMQ provides [network
partition recovery strategies](../partitions).

Their role is to take care of conflicts resolution when a cluster is split,
because nodes on both side will continue to write to the metadata store, based
on an incomplete view of the cluster. Some strategies prevent the conflicts in
the first place by stopping the service on the side of the split that has less
cluster members, i.e., the minority.

Raft, the consensus algorithm implemented by the Ra library and used by quorum
queues, stream queues and Khepri, only provides one recovery strategy, which
most closely resembles the `pause_minority` strategy from the set
of [partition handling strategies](../partitions) developed for Mnesia.

When a Khepri member wants to update the metadata store, or needs to perform a
query that spans all online cluster members, or even wants to change the
cluster membership, the request goes through the elected leader replica in that
Khepri cluster.

If the leader does not get an acknowledgement from the absolute majority of the
members, **the request blocks and may time out**. Note that this is a very
simplified description of how Raft approaches failure handling and recovery but
also the most important aspect to understand.

Therefore, if a RabbitMQ node that is on the minority side of a network split
wants to declare an exchange, a queue or a binding for instance, the request
will time out if the split is not resolved in time.

### Stopped RabbitMQ Nodes

This minority is also true if more than half of the RabbitMQ nodes are
currently stopped or lost: the remaining running nodes cannot reach the other
nodes and Raft cannot reach consensus.

### Is the Behavior Configurable?

Unlike the network partition recovery strategies used with Mnesia, the strategy
used with Khepri is not configurable: it is the design of the Raft algorithm.

Thanks to this, it is easier to reason about the behavior of RabbitMQ and
understand what could happen.

## Nodes Failing and Recovering

When a node that used to host a Khepri leader replica fails, a new leader will
be selected using the Raft leader election semantics. When then the node
hosting the previous leader rejoins, it will recognize that a new leader is
present and that it uses a new election term, and will step down to become a
follower.

The schema changes that were committed in the cluster while this node was down
will be applied on it starting on the first common point in the log (change
history) between it and the new leader. This happens completely transparently
to applications and is not really different from how a newly added node catches
up with the existing Khepri leader replica.
