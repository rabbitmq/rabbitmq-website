---
title: Clustering and Network Partitions
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

## Introduction

This guide covers one specific aspect of clustering: network
failures between nodes, their effects and recovery options.
For a general overview of clustering, see [Clustering](./clustering)
and [Peer Discovery and Cluster Formation](./cluster-formation) guides.

Clustering can be used to achieve different goals: increased
data safety through replication, increased availability for
client operations, higher overall throughput and so on.
Different configurations are optimal for different purposes.

Network connection failures between cluster members have an effect on
data consistency and availability (as in the CAP theorem) to client operations.
Since different applications have different requirements around consistency
and can tolerate unavailability to a different extent, different
[partition handling strategies](#automatic-handling) are available.

## Detecting Network Partitions {#detecting}

Nodes determine if its peer is down if another
node is unable to contact it for a [period of time](./nettick), 60 seconds by default.
If two nodes come back into contact, both having thought the other is down, the nodes will
determine that a partition has occurred. This will be written to
the RabbitMQ log in a form like:

```
2020-05-18 06:55:37.324 [error] <0.341.0> Mnesia(rabbit@warp10): ** ERROR ** mnesia_event got {inconsistent_database, running_partitioned_network, rabbit@hostname2}
```

Partition presence can be identified via server [logs](./logging),
[HTTP API](./management) (for [monitoring](./monitoring))
and a [CLI command](./cli):

```bash
rabbitmq-diagnostics cluster_status
```

<code>rabbitmq-diagnostics cluster_status</code> will normally show an
empty list for partitions:

```bash
rabbitmq-diagnostics cluster_status
# => Cluster status of node rabbit@warp10 ...
# => Basics
# =>
# => Cluster name: local.1
# =>
# => ...edited out for brevity...
# =>
# => Network Partitions
# =>
# => (none)
# =>
# => ...edited out for brevity...
```

However, if a network partition has occurred then information
about partitions will appear there:

```bash
rabbitmqctl cluster_status
# => Cluster status of node rabbit@warp10 ...
# => Basics
# =>
# => Cluster name: local.1
# =>
# => ...edited out for brevity...
# =>
# => Network Partitions
# =>
# => Node flopsy@warp10 cannot communicate with hare@warp10
# => Node rabbit@warp10 cannot communicate with hare@warp10
```

The HTTP API will return partition
information for each node under <code>partitions</code>
in <code>GET /api/nodes</code> endpoints.

The management UI will show a
warning on the overview page if a partition has occurred.


## Behavior During a Network Partition {#during}

While a network partition is in place, the two (or more!) sides
of the cluster can evolve independently, with both sides
thinking the other has crashed. This scenario is known as split-brain.
Queues, bindings, exchanges can
be created or deleted separately.

[Quorum queues](./quorum-queues) will elect a new leader on the
majority side. Quorum queue replicas on the minority side will no longer
make progress (i.e. accept new messages, deliver to consumers, etc), all this work will be
done by the new leader.

[Classic mirrored queues](./ha) which are split across the partition will end up with
one leader on each side of the partition, again with both sides
acting independently.

Unless a [partition handling strategy](#automatic-handling),
such as <code>pause_minority</code>, is configured to be used,
the split will continue even after network connectivity is restored.



## Partitions Caused by Suspend and Resume {#suspend}

While we refer to "network" partitions, really a partition is
any case in which the different nodes of a cluster can have
communication interrupted without any node failing. In addition
to network failures, suspending and resuming an entire OS can
also cause partitions when used against running cluster nodes -
as the suspended node will not consider itself to have failed, or
even stopped, but the other nodes in the cluster will consider
it to have done so.


While you could suspend a cluster node by running it on a laptop
and closing the lid, the most common reason for this to happen
is for a virtual machine to have been suspended by the
hypervisor.

While it's fine to run RabbitMQ clusters in virtualised environments or containers,
**make sure that VMs are not suspended while running**.

Note that some virtualisation features such as migration of a VM from
one host to another will tend to involve the VM being suspended.

Partitions caused by suspend and resume will tend to be
asymmetrical - the suspended node will not necessarily see the
other nodes as having gone down, but will be seen as down by the
rest of the cluster. This has particular implications for <a
href="#pause-minority">pause_minority</a> mode.



## Recovering From a Split-Brain {#recovering}

To recover from a split-brain, first choose one partition
which you trust the most. This partition will become the
authority for the state of the system (schema, messages)
to use; any changes which have occurred on other partitions will be lost.

Stop all nodes in the other partitions, then start them all up
again. When they [rejoin the cluster](./clustering#restarting) they
will restore state from the trusted partition.

Finally, you should also restart all the nodes in the trusted
partition to clear the warning.

It may be simpler to stop the whole cluster and start it again;
if so make sure that the <b>first</b> node you start is from the
trusted partition.


## Partition Handling Strategies {#automatic-handling}

RabbitMQ also offers three ways to deal with network partitions
automatically: <code>pause-minority</code> mode, <code>pause-if-all-down</code>
mode and <code>autoheal</code> mode. The default behaviour is referred
to as <code>ignore</code> mode.

In pause-minority mode RabbitMQ will automatically pause cluster
nodes which determine themselves to be in a minority (i.e. fewer
or equal than half the total number of nodes) after seeing other
nodes go down. It therefore chooses partition tolerance over
availability from the CAP theorem. This ensures that in the
event of a network partition, at most the nodes in a single
partition will continue to run. The minority nodes will pause as
soon as a partition starts, and will start again when the
partition ends. This configuration prevents split-brain and
is therefore able to automatically recover from
network partitions without inconsistencies.

In pause-if-all-down mode, RabbitMQ will automatically pause
cluster nodes which cannot reach any of the listed nodes. In
other words, all the listed nodes must be down for RabbitMQ to
pause a cluster node. This is close to the pause-minority mode,
however, it allows an administrator to decide which nodes to
prefer, instead of relying on the context. For instance, if the
cluster is made of two nodes in rack A and two nodes in rack B,
and the link between racks is lost, pause-minority mode will pause
all nodes. In pause-if-all-down mode, if the administrator listed
the two nodes in rack A, only nodes in rack B will pause. Note
that it is possible the listed nodes get split across both sides
of a partition: in this situation, no node will pause. That is why
there is an additional <i>ignore</i>/<i>autoheal</i> argument to
indicate how to recover from the partition.

In autoheal mode RabbitMQ will automatically decide on a winning
partition if a partition is deemed to have occurred, and will
restart all nodes that are not in the winning partition. Unlike
pause_minority mode it therefore takes effect when a partition
ends, rather than when one starts.

The winning partition is the one which has the most clients
connected (or if this produces a draw, the one with the most
nodes; and if that still produces a draw then one of the
partitions is chosen in an unspecified way).

You can enable either mode by setting the configuration
parameter <code>cluster_partition_handling</code>
for the <code>rabbit</code> application in the [configuration file](./configure#configuration-files) to:

<ul>
  <li><code>autoheal</code></li>
  <li><code>pause_minority</code></li>
  <li><code>pause_if_all_down</code></li>
</ul>

If using the <code>pause_if_all_down</code> mode, additional parameters are required:

<ul>
  <li><code>nodes</code>: nodes which should be unavailable to pause</li>
  <li><code>recover</code>: recover action, can be <code>ignore</code> or <code>autoheal</code></li>
</ul>

Example [config snippet](./configure#config-file) that uses <code>pause_if_all_down</code>:

```
cluster_partition_handling = pause_if_all_down

## Recovery strategy. Can be either 'autoheal' or 'ignore'
cluster_partition_handling.pause_if_all_down.recover = ignore

## Node names to check
cluster_partition_handling.pause_if_all_down.nodes.1 = rabbit@myhost1
cluster_partition_handling.pause_if_all_down.nodes.2 = rabbit@myhost2
```

### Which Mode to Pick? {#options}

It's important to understand that allowing RabbitMQ to deal with
network partitions automatically comes with trade offs.

As stated in the introduction, to connect RabbitMQ clusters over generally unreliable
links, prefer [Federation](./federation) or the [Shovel](./shovel).

With that said, here are some guidelines to help the operator determine
which mode may or may not be appropriate:

<ul>
  <li>
    <code>ignore</code>: use when network reliability is the highest practically possible
    and node availability is of topmost importance. For example, all cluster nodes can
    be in the same rack or equivalent, connected with a switch, and that switch is also the route
    to the outside world.
  </li>
  <li>
    <code>pause_minority</code>: appropriate when clustering across racks or availability zones
    in a single region, and the probability of losing a majority of nodes (zones) at
    once is considered to be very low. This mode trades off some availability for
    the ability to automatically recover if/when the lost node(s) come back.
  </li>
  <li>
    <code>autoheal</code>: appropriate when are more concerned with continuity of service
    than with data consistency across nodes.
  </li>
</ul>

### More About Pause-minority Mode {#pause-minority}

The Erlang VM on the paused nodes will continue running but the
nodes will not listen on any ports or be otherwise available.
They will check once per second to see if the rest of the cluster has
reappeared, and start up again if it has.

Note that nodes will not enter the paused state at startup, even
if they are in a minority then. It is expected that any such
minority at startup is due to the rest of the cluster not having
been started yet.

Also note that RabbitMQ will pause nodes which are not in a
<i>strict</i> majority of the cluster - i.e. containing more
than half of all nodes. It is therefore not a good idea to
enable pause-minority mode on a cluster of two nodes since in
the event of any network partition <b>or node failure</b>, both
nodes will pause. However, <code>pause_minority</code> mode is
safer than <code>ignore</code> mode, with regards to integrity.
For clusters of more than two nodes, especially if the most likely
form of network partition is that a single minority of nodes
drops off the network, the availability remains as good as
with <code>ignore</code> mode.

Note that <code>pause_minority</code> mode will do
nothing to defend against partitions caused by cluster nodes
being [suspended](#suspend). This is because
the suspended node will never see the rest of the cluster
vanish, so will have no trigger to disconnect itself from the
cluster.
