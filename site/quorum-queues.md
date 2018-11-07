<!--
Copyright (c) 2007-2018 Pivotal Software, Inc.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Quorum Queue NOSYNTAX

## <a id="overview" class="anchor" href="#overview">Overview</a>

The quorum queue is a queue type for RabbitMQ implementing a durable,
replicated FIFO queue based on the [Raft consensus algorithm](https://raft.github.io/).
It is available as of RabbitMQ 3.8.0.

The quorum queue type is an alternative to durable [mirrored queues](/ha.html)
(a.k.a. HA queues) purpose built for a [set of use cases](#use-cases) where [data safety](#data-safety) is
a top priority. This is covered in [Motivation](#motivation).

Quorum queues also have important [differences in behaviour](#behaviour)
and [limitations](#limitations) compared to classic mirrored queues.

### What is a Quorum?

If intentionally simplified, [quorum](https://en.wikipedia.org/wiki/Quorum) in a distributed system can
defined as an agreement between the majority of nodes (`(N/2)+1` where `N` is the total number of
system participants).

When applied to queue mirroring in RabbitMQ [clusters](/clustering.html)
this means that the majority of replicas (including the currently elected queue master/leader)
agree on the state of the queue and its contents.

### Differences from Classic Queues

Quorum queues share most of the fundamentals with [queues](/queues.html) in RabbitMQ.
They are more purpose-built and currently have limitations (do not support certain features).
The differences will be covered in this guide.

### <a id="motivation" class="anchor" href="#motivation">Motivation</a>

Existing mirrored queues have technical limitations that makes it difficult to provide
comprehensible guarantees and clear failure handling semantics within RabbitMQ.

Certain failure scenarios can result in mirrored queues
confirming messages too early, potentially resulting in a data loss.
Quorum queues are designed to provide simpler, well defined failure handling semantics
that users should find easier to reason about when designing
and operating their systems.


## <a id="feature-comparison" class="anchor" href="#feature-comparison">Feature Comparison with Regular Queues</a>

Quorum queues share most of the fundamentals with other [queue](/queues.html) types.
A client library that can use regular mirrored queues will be able to use quorum queues.

The following operations works the same way for quorum queues as they do for regular queues:

 * Consumption (subscription)
 * [Consumer acknowledgements](/confirms.html) (except for global [QoS and prefetch](#global-qos))
 * Cancelling consumers
 * Purging
 * Deletion

With some queue operations there are minor differences:

 * [Declaration](#declaring)
 * Setting prefetch for consumers

Some features are not currently supported by quorum queues.

### Feature Matrix

| Feature | Classic / HA | Quorum |
| :-------- | :------- | ------ |
| [Non-durable queues](/queues.html) | yes | no |
| [Exclusivity](/queues.html) | yes | no |
| Per message persistence | per message | always |
| Membership changes | automatic | manual  |
| [TTL](/ttl.html) | yes | no |
| [Queue length limits](/maxlength.html) | yes | no |
| [Lazy behaviour](/lazy-queues.html) | yes | no |
| [Priority](/queues.html) | yes | no |
| [Dead letter exchanges](/dlx.html) | yes | yes |
| Adheres to [policies](/policies.html) | yes | no |
| Reacts to [memory alarms](/alarms.html) | yes | no |

#### Non-durable Queues

Regular queues can be [non-durable](/queues.html). Quorum queues are always durable per their
assumed [use cases](/use-cases).

#### Exclusivity

Regular queues can be [exlusive](/queues.html#exclusive-queues). Quorum queues are always durable per their
assumed [use cases](/use-cases). They are not meant to be used as [temporary queues](/queues#temporary-queues.html).

#### TTL

Quorum queues do not currently support TTL, neither for queues nor messages.

#### Length Limit

Quorum queues do not currently support length limits.

#### Dead Lettering

Quorum queues do support [dead letter exchanges](/dlx.html) (DLXs).

#### Lazy Mode

Quorum queues store their content on disk (per Raft requirements) as well as in memory.
The [lazy mode](/lazy-queues.html) does not apply to them.

#### Priorities

Quorum queues do not currently support priorities.


## <a id="use-cases" class="anchor" href="#use-cases">Use Cases</a>

Quorum queues are purpose built by design. They are _not_ designed to be used for every problem.
Their intended use is for topologies where queues exist for a long time and are critical to certain
aspects of system operation, therefore fault tolerance and data safety is more important than, say,
low latency and advanced queue features.

Examples would be incoming orders in a sales system or votes cast in an
election system where potentially losing messages would have a significant
impact on system correctness and function.

Stock tickers and instant messaging systems benefit less or not at all from
quorum queues.

Publishers should use publisher confirms as this is how clients can interact with
the quorum queue consensus system. Publisher confirms will only be issued once
a published message has been successfully replicated to a quorum of nodes and is considered "safe"
within the context of the system.

Consumers should use manual acknowledgements to ensure messages that aren't
successfully processed are returned to the queue so that
another consumer can re-attempt processing.

### When Not to Use Quorum Queues

In some cases quorum queues should not be used. They typically involve:

 * Temporary nature of queues: transient or exclusive queues, high queue churn (declaration and deletion rates)
 * Low latency: the underlying consensus algorithm
 * When data safety is not a priority (e.g. applications do not use [manual acknowledgements and publisher confirms](/confirms.html) are not used)
 * Very long queue backlogs (quorum queues currently keep all messages in memory at all times)



## <a id="performance" class="anchor" href="#performance">Performance Characteristics</a>

Quorum queues are designed to trade latency for throughput and have been tested
and compared against [mirrored queues](/ha.html) in 3, 5 and 7 node configurations at several
message sizes. In scenarios using both consumer acks and publisher confirms
 quorum queues have been observed to be have equal or greater throughput to
classic mirrored queues.

As quorum queues persist all data to disks before doing anything it is recommended
to use the fastest disks possible. Quorum queues also benefit from consumers
using higher prefetch values to ensure consumers aren't starved whilst
acknowledgements are flowing through the system and allowing messages
to be delivered in a timely fashion.

Due to the disk I/O-heavy nature of quorum queues, their throughput decreases
as message sizes increase.

Just like mirrored queues, quorum queues are also affected by cluster sizes.
The more replicas a quorum queue has, the lower its throughput generally will
be since more work has to be done to replicate data and achieve consensus.


## <a id="usage" class="anchor" href="#usage">Usage</a>

As stated earlier, quorum queues share most of the fundamentals with other [queue](/queues.html) types.
A client library that can use regular mirrored queues will be able to use quorum queues.

The following operations works the same way for quorum queues as they do for regular queues:

 * Consumption (subscription)
 * [Consumer acknowledgements](/confirms.html) (except for global [QoS and prefetch](#global-qos))
 * Cancelling consumers
 * Purging
 * Deletion

With some queue operations there are minor differences:

 * [Declaration](#declaring)
 * Setting prefetch for consumers


#### <a id="declaring" class="anchor" href="#declaring">Declaring</a>

To declare a quorum queue set the `x-queue-type` queue argument to `quorum`
(the default is `classic`). This will declare a quorum queue with a member on
every currently configured [cluster node](/clustering.html).
After that the queue can be bound to any exchange just as any other
RabbitMQ queues.

It can also be created through the management UI using the queue type drop down
menu.

#### <a id="replication-factor" class="anchor" href="#replication-factor">Controlling the Initial Replication Factor</a>

Like mirrored queues, quorum queues have a configurable replication factor
(number of replicas).

By default a quorum queue will start a replica (Raft group member) on
every RabbitMQ node in the cluster. This may not be desirable for
larger clusters or for cluster with an even number of
nodes. To control the number of quorum queue members set the
`x-quorum-initial-group-size` queue argument when declaring the queue. The
group size argument provided should be an integer that is greater than zero and smaller or
equal to the current RabbitMQ cluster size. The quorum queue will be
launched to run on a random subset of the RabbitMQ cluster.

#### <a id="rebalancing-replicas" class="anchor" href="#rebalancing-replicas">Managing Replicas</a> (Quorum Group Members)

Once declared the RabbitMQ nodes a quorum queue resides on won't change even if the
members of the RabbitMQ cluster change (e.g. a node is decomissioned or added).
To re-balance after a RabbitMQ cluster change quorum queues will have to be manually adjusted using the `rabbitmq-queues`
[command line tool](/cli.html).

Two commands are provided:

`rabbitmq-queues add_member [-p <vhost>] <queue-name> <node>`

`rabbitmq-queues delete_member [-p <vhost>] <queue-name> <node>`

To successfully add and remove members a quorum of replicas in the cluster must be available.

Care needs to be taken not to accidentally make a queue unavailable by losing
the quorum whilst performing membership changes.


## <a id="behaviour" class="anchor" href="#behaviour">Behaviour</a>

A quorum queue is quorum-based system that relies on a consensus protocol
to ensure data consistency.

### <a id="leader-election" class="anchor" href="#leader-election">Leader Election and Failure Handling</a>

A quorum queue requires a quorum of the declared nodes to be available
to function. When a RabbitMQ node hosting a current quorum queue
"leader" (in Raft parlance) fails or is stopped another node hosting a
quorum queue (a "follower") will be elected leader and resume
operations.

In contrast with classic mirrored queues there is no eager
synchronization of "followers" (mirrors) following a leader change. A
new leader should be elected and queue availability should be resumed
very shortly after the failure event even when the queue has a
significant backlog.

### <a id="quorum-requirements" class="anchor" href="#quorum-requirements">Fault Tolerance and Minimum Number of Replicas Online</a>

Consensus systems can provide certain guarantees with regard to data safety.
These guarantees do mean that certain conditions need to be met before they
become relevant such as requiring a minimum of 3 RabbitMQ nodes to provide
fault tolerance and requiring more than half of members to be available to
work at all.

*Failure tolerance table*:

| Node count | Tolerated no. of failures |
| :--------: | :------: |
| 1          | 0        |
| 2          | 0        |
| 3          | 1        |
| 4          | 1        |
| 5          | 2        |
| 6          | 2        |
| 7          | 3        |

As the table above shows RabbitMQ clusters with fewer than 3 nodes do not
benefit fully from the quorum queue guarantees. RabbitMQ clusters with an even
number of RabbitMQ nodes do not benefit from having quorum queue members spread
over all nodes. For these systems the quorum queue size should be constrained to a
smaller uneven number of nodes.

Performance tails off quite a bit for quorum queue node sizes larger than 5.
We do not recommend running quorum queues on more than 7 RabbitMQ nodes. The
default quorum queue size is 5 and is controllable using the
`x-quorum-queue-size` queue argument.

### <a id="data-safety" class="anchor" href="#data-safety">Data Safety</a>

Quorum queues are designed to provide data safety under network partition and
failure scenarios. A message that was successfully confirmed back to the publisher
using the [publisher confirms](confirms.html) feature should not be lost as long as at
least a majority of RabbitMQ nodes hosting the quorum queue are not
permanently made unavailable.

Generally quorum queues favours data consistency over availability.

*_No guarantees are provided for messages that have not been confirmed using
the publisher confirm mechanism_*. They may never reach the queue.


### <a id="availability" class="anchor" href="#availability">Availability</a>

Quorum queues should be able to tolerate a minority of queue members becoming unavailable
with no or little affect on availability. (NB: RabbitMQ may restart itself during
recovery and perform various actions that make this harder to ensure but in
principle this should be true).

If a quorum of nodes cannot be recovered (say if 2 out of 3 RabbitMQ nodes are
permanently lost) the queue is permanently unavailable and
will need to be force deleted and recreated.


## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

There are a few new configuration parameters that can be tweaked using
the [advanced](configure.html#advanced-config-file) config file.

The `ra` application (which is the Raft library that quorum
queues use) has it's own configuration.
See [https://github.com/rabbitmq/ra#configuration](https://github.com/rabbitmq/ra#configuration)
for details.

The `rabbit` application has a couple of quorum queue related configuration items:

 * `quorum_cluster_size`

Sets the default quorum queue cluster size (can be over-ridden by the `x-quorum-cluster-size` queue argument at declaration time.
Default value is 5.

 * `quorum_commands_soft_limit`

This is a flow control related parameter defining
the maximum number of unconfirmed messages a channel accepts before entering flow.
Default: 256

Example:

<pre class="sourcecode erlang">
[
 {rabbit, [{quorum_cluster_size, 7},
           {quorum_commands_soft_limit, 512}]}
]
</pre>

## <a id="resource-use" class="anchor" href="#resource-use">Resource Use</a>

Quorum queues are typically require more resources (disk and RAM)
than classic mirrored queues. To enable fast election of a new leader and recovery, data safety as well as
good throughput characteristics all members in a quorum queue
"cluster" keep all messages in the queue in memory _and_ on disk.
Quorum queues should not be used in memory constrained systems.


## <a id="limitations" class="anchor" href="#limitations">Limitations</a>

### <a id="global-qos" class="anchor" href="#global-qos">Global QoS</a>

Quorum queues do not support global [QoS prefetch](/confirms.html#channel-qos-prefetch) where a channel sets a single
prefetch limit for all consumers using that channel. If an attempt
is made to consume from a quorum queue from a channel with global QoS enabled
a channel error will be returned.

Use per-consumer QoS prefetch, which is the default in several popular clients.

#### Increased Atom Use

The internal implementation of quorum queues converts the queue name
into an Erlang atom. If queues with arbitrary names are continuously
created and deleted it _may_ threaten the long term stability of the
RabbitMQ system (if the size of the atom table reaches the maximum limit,
about 1M by default). It is not recommended to use quorum queues in this manner
at this point.


#### <a id="requeue" class="anchor" href="#requeue">Sustained Requeues</a>

Internally quorum queues are implemented using a log where all operations including
messages are persisted. To avoid this log growing too large it needs to be
truncated regularly. To be able to truncate a section of the log all messages
in that section needs to be acknowledged. Usage patterns that continuously
[reject or nack](/nack.html) the same message with the `requeue` flag set to true
could cause the log to grow in an unbounded fashion and eventually fill
up the disks.
