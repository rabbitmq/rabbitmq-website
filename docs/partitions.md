---
title: Clustering and Network Partitions
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Clustering and Network Partitions

:::note

This guide was significantly reworked for RabbitMQ `4.3.0` and
later versions.

:::

## Introduction

Before RabbitMQ `4.3.0`, this guide covered one specific aspect of [clustering](./clustering):
network failures between nodes, their effects on Raft cluster majority, and the recovery process.

Starting with RabbitMQ `4.3.0`, several important details have changed,
and this guide is now much shorter:

 * RabbitMQ now supports only one [metadata](./metadata-store) store: the Raft-based Khepri
 * Mnesia was removed
 * Partition handling strategies, necessary during the Mnesia era, were also removed

 This means that starting with `4.3.0`, all key replicated features (components) in RabbitMQ
 are Raft-based:

  * The metadata store (Khepri)
  * [Quorum queue](./quorum-queues)
  * [Stream](./streams) coordinators

In [Tanzu RabbitMQ](/commercial-features) the list of Raft-based features also includes:

  * Delayed Queues
  * JMS Queues

See the documentation guides for those features for a more detailed description of their
failure recovery characteristics.

## How to Spot Network Partitions

Lost connectivity and Raft leader elections are [logged](./logging) on the affected nodes.

`rabbitmq-diagnostics cluster_status` lists reachable peers in the running nodes section;
an unreachable node will be missing from that list.

To inspect quorum queue and stream member (replica) state, use these [CLI commands](./cli):

 * `rabbitmq-queues quorum_status <queue>`: a quorum queue's leader and followers
 * `rabbitmq-streams stream_status <stream>`: a stream's leader and replicas
 * `rabbitmq-diagnostics check_if_node_is_quorum_critical`: warns if taking the
   target node down would leave any quorum queue or stream without an online majority

## Partition Effects on Replicated Features {#effects}

In addition to the [node-level heartbeats](./nettick), the Raft-based features use
an [adaptive failure detector](https://github.com/rabbitmq/aten) which
can detect peer unavailability much earlier than a heartbeat-based mechanism can,
all while having lower sensitivity to latency spikes.

A network partition prevents two nodes from communicating with one another
the way they usually do. For Raft clusters such as a quorum queue, a stream or the metadata store,
there are three key scenarios:

1. A node hosting the currently elected Raft cluster leader is no longer available
2. A node hosting a follower is no longer available
3. A node hosting neither a leader nor a follower is no longer available

### Scenario 1: the Leader Disconnects

If the currently elected leader becomes unavailable, the failure will be noticed by
the rest of the members, which will proceed to trigger a new leader election
on the majority side of the partition: that is, the group of cluster members
that can still contact each other and form a [majority](./quorum-queues#quorum-requirements).

During the time window when there is no elected leader in the Raft cluster,
write operations will be rejected until a new leader is elected.
For published messages pending a [publisher confirmation](./confirms), this can mean
a negative acknowledgement.

Client operations on replicated queues and streams will be delayed
until a new leader is elected and known to the node the client is (was) connected to.
Start to finish, this usually takes a few seconds, depending on node and network load.

The new leader will continue accepting writes and serving reads, replicating
its state (Raft log) to followers, sending out publisher confirms just
like before the disconnection event.

Messages delivered to consumers but not yet [acknowledged](./confirms#acknowledgement-modes)
are re-queued and later redelivered by the new leader, so a consumer may
receive the same message more than once.

Read availability differs across the three replicated components.

Some Khepri reads are served from a local cache (the default, eventually consistent path);
those continue on all reachable nodes. A subset of Khepri operations that use linearizable reads,
which go through the Raft cluster leader, are paused until a new leader is elected.

Quorum queue deliveries always go through the leader, so their consumers
see no new deliveries during the time window when there's no elected leader.

Stream consumers can continue reading already-replicated data from any replica they can reach,
and are unaffected by the leader change.

#### Effects on Quorum Queues: Publishers

Most published messages do not fail outright; they are retained
and forwarded to the new leader once it is elected.

[Publisher confirms](./confirms) for those messages will arrive with a delay
or be rejected with a `basic.nack` in some scenarios. Publishing applications
can choose to re-publish them later.

#### Effects on Quorum Queues: Consumers

Outstanding [consumer acknowledgement operations](./confirms) (`basic.ack`, `basic.nack`, `basic.reject`)
are similarly buffered and replayed against the new leader. The same applies to AMQP 1.0
link credit updates.

Consumer registration (`basic.consume`, AMQP 1.0 link attachment operations) and `basic.get` (polling consumers)
require a reachable leader and will block until a new one is elected, or fail
with a client-side timeout if the election does not complete in time.

### Scenario 2: a Follower Disconnects

A reconnected Raft member (replica) will discover the currently elected leader
and receive missing log entries from the leader. In practical
terms it means that the reconnected member will update its local state
with that of the cluster leader, with the consistency and data safety guarantees
of Raft.

On the majority side, reads continue normally. On the disconnected side,
Khepri serves local cached reads, quorum queue deliveries pause,
and stream consumers can still read locally-available data.

Once caught up, a follower replica continues operating just like before
the partition event.

### Scenario 3: a Non-Member Disconnects

If a node that does not host any quorum queue or stream members (replicas) becomes unavailable,
its disconnection only has effects on cluster capacity,
not data safety or availability more broadly.

Reads from the affected quorum queues or streams are unaffected.
Clients attached to the disconnected node must reconnect to a reachable cluster node.

Khepri always has a replica on every connected cluster node, so this
scenario does not apply to it.


## Partition Recovery {#recovery}

Disconnected nodes will try to reconnect to their peers. This can take some time.

A reconnected Raft member (replica) will discover the currently elected leader
and receive missing log entries from the leader. In practical
terms it means that the reconnected member will update its local state
with more recent data from the cluster leader, with the consistency and data safety guarantees
of Raft.

If the connectivity disruption was short, this usually means a relatively small amount of data
to be transferred (adjust "small" by data volumes and velocity in the cluster).

In case of longer disruptions, data volumes can be substantial; while the returning
member is catching up, it should be considered temporarily unavailable. Such
catching up nodes also cannot be elected leaders of their Raft clusters
until they fully catch up.


## Raft and the Online Cluster Majority Requirement {#quorum}

The data safety and predictable recovery of Raft comes with an operational
price tag: a majority of members (replicas) must be online and reachable
at any moment.

If that's not the case, operations that require Raft consensus
(publishes, consumer acknowledgements, metadata store updates) cannot make
progress and will either be retained until a majority is restored,
or fail with a timeout.

Failure tolerance characteristics of Raft clusters of various size can be described
in a table. Note that this table refers to cluster nodes for Khepri
but for quorum queues and streams, this means the number of replicas they
have (which can be a subset of all cluster nodes).

| Cluster node count | Tolerated number of node failures | Tolerant to a network partition |
| :------------------: | :-----------------------------: | :-----------------------------: |
| 1                    | 0                               | not applicable |
| 2                    | 0                               | no |
| 3                    | 1                               | yes |
| 4                    | 1                               | yes if a majority exists on one side |
| 5                    | 2                               | yes |
| 6                    | 2                               | yes if a majority exists on one side |
| 7                    | 3                               | yes |
| 8                    | 3                               | yes if a majority exists on one side |
| 9                    | 4                               | yes |


## Partitions Caused by Suspend and Resume {#suspend}

While this guide talks of "network" partitions, a partition more generally is
any scenario in which the different nodes of a cluster can have
communication interrupted without any node failing.

In addition to network failures, suspending and resuming an entire OS can
also cause partitions when used against running cluster nodes
as the suspended node will not consider itself to have failed, or
even stopped, but the other nodes in the cluster will consider
it to have done so.

The most common reason for this to happen is for a virtual machine
to have been suspended by the hypervisor. Some virtualisation features
such as migration of a VM from one host to another will tend to involve
the VM being suspended.

Partitions caused by suspend and resume should be treated as any other
partition type that affects a single node. However, thanks to the
adaptive failure detector, short suspensions can be
handled gracefully.

All the Raft-based features will be able to deal with such suspended and resumed
members with the standard data safety guarantees and the online majority
requirement for availability.

Thanks to Raft's incremental log recovery, suspended and then resumed
nodes will have to retrieve only the subset of the log, significantly
reducing the recovery (unavailability) time window.


## Deprecated `rabbitmq.conf` Keys

For backwards compatibility, the following [`rabbitmq.conf`](./configure) keys
related to the partition handling strategy configuration from
earlier versions are accepted but have **no effect**:

* `cluster_partition_handling`
* `cluster_partition_handling.pause_if_all_down.recover`
* `cluster_partition_handling.pause_if_all_down.nodes.$name`

These keys should be removed from the configuration files at the
earliest opportunity.
