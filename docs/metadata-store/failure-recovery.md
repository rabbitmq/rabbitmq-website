---
title: Failure recovery with Khepri
---

# Failure recovery with Khepri

## Cluster minority

When Mnesia is used as the metadata store backend, RabbitMQ provides [network
partition recovery strategies](../partitions). Their role is to take care of
conflicts resolution when a cluster is split, because nodes on both side will
continue to write to the metadata store, based on an incomplete view of the
cluster. Some strategies prevent the conflicts in the first place by stopping
the service on the side of the split that has less cluster members, i.e., the
minority.

Raft, the consensus algorithm implemented by the Ra library and used by quorum
queues, stream queues and Khepri, is close to that `pause_minority` by design.

Indeed, when a Khepri member wants to update the metadata store, or needs to
perform a consistent query, or even wants to change the cluster membership,
the request goes through the elected leader in that Khepri cluster. If the
leader does not get an acknowledgement from the absolute majority of the
members, **the request blocks and may time out**. Note that this is a very
simplified description of Raft.

Therefore, if a RabbitMQ node that is on the minority side of a network split
wants to declare an exchange, a queue or a binding for instance, the request
will time out if the split is not resolved in time.

## Stopped RabbitMQ nodes

This minority is also true if more than half of the RabbitMQ nodes are
currently stopped or lost: the remaining running nodes cannot reach the other
nodes and Raft cannot reach consensus.

## Is the behavior configurable?

Unlike the network partition recovery strategies used with Mnesia, the
strategy used with Khepri is not configurable: it is the design of the Raft
algorithm. Thanks to this, it is easier to reason about the behavior of
RabbitMQ and understand what could happen.
