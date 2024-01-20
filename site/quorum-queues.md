<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Quorum Queues

## <a id="overview" class="anchor" href="#overview">Overview</a>

The RabbitMQ quorum queue is a modern queue type, which implements a durable,
replicated FIFO queue based on the [Raft consensus algorithm](https://raft.github.io/).

Quorum queues are designed to be safer and provide simpler, well defined failure handling semantics that users should find easier to reason about when designing and operating their systems.

Quorum queues and [streams](./streams.html) now replace the original, replicated [mirrored classic queue](ha.html). Mirrored classic queues are [now deprecated and scheduled for removal](https://blog.rabbitmq.com/posts/2021/08/4.0-deprecation-announcements/).
Use the [Migrate your RabbitMQ Mirrored Classic Queues to Quorum Queues](./migrate-mcq-to-qq.html) guide for migrating
RabbitMQ installations that currently use classic mirrored queues.

Quorum queues are optimized for [set of use cases](#use-cases) where [data safety](#data-safety) is
a top priority. This is covered in [Motivation](#motivation).
Quorum queues should be considered the default option for a replicated queue type.

Quorum queues also have important [differences in behaviour](#behaviour)
and some [limitations](#feature-comparison) compared to classic mirrored queues,
including workload-specific ones, e.g. when consumers [repeatedly requeue the same message](#repeated-requeues).

Some features, such as [poison message handling](#poison-message-handling), are specific
to quorum queues.

For cases that would benefit from replication and repeatable reads, [streams](streams.html) may
be a better option than quorum queues.

## <a id="toc" class="anchor" href="#toc">Topics Covered</a>

Topics covered in this information include:

 * [What are quorum queues](#motivation) and why they were introduced
 * [How are they different](#feature-comparison) from classic queues
 * Primary [use cases](#use-cases) of quorum queues and when not to use them
 * How to [declare a quorum queue](#usage)
 * [Replication](#replication)-related topics: [replica management](#replica-management), [replica leader rebalancing](#replica-rebalancing), optimal number of replicas, etc
 * What guarantees quorum queues offer in terms of [leader failure handling](#leader-election), [data safety](#data-safety) and [availability](#availability)
 * [Performance](#performance) characteristics of quorum queues and [performance tuning](#performance-tuning) relevant to them
 * [Poison message handling](#poison-message-handling) provided by quorum queues
 * [Configurable settings](#configuration) of quorum queues
 * Resource use of quorum queues, most importantly their [memory footprint](#resource-use)

and more.

General familiarity with [RabbitMQ clustering](./clustering.html) would be helpful here when learning more about quorum queues.


## <a id="motivation" class="anchor" href="#motivation">Motivation</a>

Quorum queues adopt a different replication
and consensus protocol and give up support for certain "transient" in nature features, which results in some limitations. These limitations are covered later in this information.

Quorum queues pass a [refactored and more demanding version](https://github.com/rabbitmq/jepsen#jepsen-tests-for-rabbitmq) of the [original Jepsen test](https://aphyr.com/posts/315-jepsen-rabbitmq#rabbit-as-a-queue).
This ensures they behave as expected under network partitions and failure scenarios.
The new test runs continuously to spot possible regressions and is enhanced regularly to test new features (e.g. [dead lettering](#dead-lettering)).

### <a id="what-is-quorum" class="anchor" href="#what-is-quorum">What is a Quorum?</a>

If intentionally simplified, [quorum](https://en.wikipedia.org/wiki/Quorum_(distributed_computing)) in a distributed system can
be defined as an agreement between the majority of nodes (`(N/2)+1` where `N` is the total number of
system participants).

When applied to queue mirroring in RabbitMQ [clusters](./clustering.html)
this means that the majority of replicas (including the currently elected queue leader)
agree on the state of the queue and its contents.

### Differences between Quorum Queues and Classic Mirrored Queues

Quorum queues share many of the fundamentals with [queues](queues.html) of other types in RabbitMQ.
However, they are more purpose-built, focus on data safety and predictable recovery,
and do not support certain features.

The differences [are covered](#feature-comparison) in this guide.

Classic mirrored queues in RabbitMQ have technical limitations that makes it difficult to provide
comprehensible guarantees and clear failure handling semantics.

Certain failure scenarios can result in mirrored queues
confirming messages too early, potentially resulting in a data loss.


## <a id="feature-comparison" class="anchor" href="#feature-comparison">Feature Comparison with Regular Queues</a>

Quorum queues share most of the fundamentals with other [queue](queues.html) types.
A client library that can use regular mirrored queues will be able to use quorum queues.

The following operations work the same way for quorum queues as they do for regular queues:

 * Consumption (subscription)
 * [Consumer acknowledgements](./confirms.html) (except for global [QoS and prefetch](#global-qos))
 * Cancelling consumers
 * Purging
 * Deletion

With some queue operations there are minor differences:

 * [Declaration](#declaring)
 * Setting prefetch for consumers

Some features are not currently supported by quorum queues.

### <a id="feature-matrix" class="anchor" href="#feature-matrix">Feature Matrix</a>

| Feature | Classic Mirrored | Quorum |
| :-------- | :------- | ------ |
| [Non-durable queues](queues.html) | yes | no |
| [Exclusivity](queues.html) | yes | no |
| Per message persistence | per message | always |
| Membership changes | automatic | manual  |
| [Message TTL (Time-To-Live)](./ttl.html) | yes | yes ([since 3.10](https://blog.rabbitmq.com/posts/2022/05/rabbitmq-3.10-release-overview/)) |
| [Queue TTL](./ttl.html#queue-ttl) | yes | partially (lease is not renewed on queue re-declaration) |
| [Queue length limits](./maxlength.html) | yes | yes (except `x-overflow`: `reject-publish-dlx`) |
| [Lazy behaviour](./lazy-queues.html) | yes | always (since 3.10) |
| [Message priority](./priority.html) | yes | no |
| [Consumer priority](./consumer-priority.html) | yes | yes |
| [Dead letter exchanges](./dlx.html) | yes | yes |
| Adheres to [policies](./parameters.html#policies) | yes | yes (see [Policy support](#policy-support)) |
| Poison message handling | no | yes |
| Global [QoS Prefetch](#global-qos) | yes | no |

Modern quorum queues also offer [higher throughput and less latency variability](https://blog.rabbitmq.com/posts/2022/05/rabbitmq-3.10-performance-improvements/)
for many workloads.

#### Non-durable Queues

Classic queues can be [non-durable](queues.html). Quorum queues are always durable per their
assumed [use cases](#use-cases).

#### Exclusivity

[Exclusive queues](queues.html#exclusive-queues) are tied to the lifecycle of their declaring connection.
Quorum queues by design are replicated and durable, therefore the exclusive property makes
no sense in their context. Therefore quorum queues cannot be exclusive.

Quorum queues are not meant to be used as [temporary queues](./queues.html#temporary-queues).

#### Queue and Per-Message TTL (since RabbitMQ 3.10)

Quorum queues support both [Queue TTL](./ttl.html#queue-ttl) and message TTL
(including [Per-Queue Message TTL in Queues](./ttl.html#per-queue-message-ttl) and
[Per-Message TTL in Publishers](./ttl.html#per-message-ttl-in-publishers)).
When using any form of message TTL, the memory overhead increases by 2 bytes per message.

#### Length Limit

Quorum queues has support for [queue length limits](./maxlength.html).

The `drop-head` and `reject-publish` overflow behaviours are supported but they
do not support `reject-publish-dlx` configurations as Quorum queues take a different
implementation approach than classic queues.

The current implementation of `reject-publish` overflow behaviour does not strictly
enforce the limit and allows a quorum queue to overshoot its limit by at least
one message, therefore it should be taken with care in scenarios where a precise
limit is required.

When a quorum queue reaches the max-length limit and `reject-publish` is configured
it notifies each publishing channel who from thereon will reject all messages back to
the client. This means that quorum queues may overshoot their limit by some small number
of messages as there may be messages in flight whilst the channels are notified.
The number of additional messages that are accepted by the queue will vary depending
on how many messages are in flight at the time.

#### <a id="dead-lettering" class="anchor" href="#dead-lettering">Dead Lettering</a>

Quorum queues support [dead letter exchanges](./dlx.html) (DLXs).

Traditionally, using DLXs in a clustered environment has not been [safe](./dlx.html#safety).

Since RabbitMQ 3.10 quorum queues support a safer form of dead-lettering that uses
`at-least-once` guarantees for the message transfer between queues
(with the limitations and caveats outlined below).

This is done by implementing a special, internal dead-letter consumer process
that works similarly to a normal queue consumer with manual acknowledgements apart
from it only consumes messages that have been dead-lettered.

This means that the source quorum queue will retain the
dead-lettered messages until they have been acknowledged. The internal consumer
will consume dead-lettered messages and publish them to the target queue(s) using
publisher confirms. It will only acknowledge once publisher confirms have been
received, hence providing `at-least-once` guarantees.

`at-most-once` remains the default dead-letter-strategy for quorum queues and is useful for scenarios
where the dead lettered messages are more of an informational nature and where it does not matter so much
if they are lost in transit between queues or when the overflow
configuration restriction outlined below is not suitable.

##### Activating at-least-once dead-lettering

To activate or turn on `at-least-once` dead-lettering for a source quorum queue, apply all of the following policies
(or the equivalent queue arguments starting with `x-`):

* Set `dead-letter-strategy` to `at-least-once` (default is `at-most-once`).
* Set `overflow` to `reject-publish` (default is `drop-head`).
* Configure a `dead-letter-exchange`.
* Turn on [feature flag](./feature-flags.html) `stream_queue` (turned on by default
for RabbitMQ clusters created in 3.9 or later).

It is recommended to additionally configure `max-length` or `max-length-bytes`
to prevent excessive message buildup in the source quorum queue (see caveats below).

Optionally, configure a `dead-letter-routing-key`.

##### Limitations

`at-least-once` dead lettering does not work with the default `drop-head` overflow
strategy even if a queue length limit is not set.
Hence if `drop-head` is configured the dead-lettering will fall back
to `at-most-once`. Use the overflow strategy `reject-publish` instead.

##### Caveats

`at-least-once` dead-lettering will require more system resources such as memory and CPU.
Therefore, turn on `at-least-once` only if dead lettered messages should not be lost.

`at-least-once` guarantees opens up some specific failure cases that needs handling.
As dead-lettered messages are now retained by the source quorum queue until they have been
safely accepted by the dead-letter target queue(s) this means they have to contribute to the
queue resource limits, such as max length limits so that the queue can refuse to accept
more messages until some have been removed. Theoretically it is then possible for a queue
to _only_ contain dead-lettered messages, in the case where, say a target dead-letter
queue isn't available to accept messages for a long time and normal queue consumers
consume most of the messages.

Dead-lettered messages are considered "live" until they have been confirmed
by the dead-letter target queue(s).

There are few cases for which dead lettered messages will not be removed
from the source queue in a timely manner:

* The configured dead-letter exchange does not exist.
* The messages cannot be routed to any queue (equivalent to the `mandatory` message property).
* One (of possibly many) routed target queues does not confirm receipt of the message.
This can happen when a target queue is not available or when a target queue rejects a message
(e.g. due to exceeded queue length limit).

The dead-letter consumer process will retry periodically if either of the scenarios above
occur which means there is a possibility of duplicates appearing at the DLX target queue(s).

For each quorum queue with `at-least-once` dead-lettering turned on, there will be one internal dead-letter
consumer process. The internal dead-letter consumer process is co-located on the quorum queue leader node.
It keeps all dead-lettered message bodies in memory.
It uses a prefetch size of 32 messages to limit the amount of message bodies kept in memory if no confirms
are received from the target queues.

That prefetch size can be increased by the `dead_letter_worker_consumer_prefetch` setting in the `rabbit` app section of the
[advanced config file](./configure.html#advanced-config-file) if high dead-lettering throughput
(thousands of messages per second) is required.

For a source quorum queue, it is possible to switch dead-letter strategy dynamically from `at-most-once`
to `at-least-once` and vice versa. If the dead-letter strategy is changed either directly
from `at-least-once` to `at-most-once` or indirectly, for example by changing overflow from `reject-publish`
to `drop-head`, any dead-lettered messages that have not yet been confirmed by all target queues will be deleted.

Messages published to the source quorum queue are persisted on disk regardless of the message delivery mode (transient or persistent).
However, messages that are dead lettered by the source quorum queue will keep the original message delivery mode.
This means if dead lettered messages in the target queue should survive a broker restart, the target queue must be durable and
the message delivery mode must be set to persistent when publishing messages to the source quorum queue.

#### Lazy Mode (since RabbitMQ 3.10)

Quorum queues store their message content on disk (per Raft requirements) and
only keep a small metadata record of each message in memory. This is a change from
prior versions of quorum queues where there was an option to keep the message bodies
in memory as well. This never proved to be beneficial especially when the queue length
was large.

The [memory limit](#memory-limit) configuration is still permitted but has no
effect. The only option now is effectively the same as configuring: `x-max-in-memory-length=0`

The [`lazy` mode configuration](./lazy-queues.html#configuration) does not apply.

#### Lazy Mode (before RabbitMQ 3.10)

Quorum queues store their content on disk (per Raft requirements) as well as in memory (up to the [in memory limit configured](#memory-limit)).

The [`lazy` mode configuration](./lazy-queues.html#configuration) does not apply.

It is possible to [limit how many messages a quorum queue keeps in memory](#memory-limit) using a policy which
can achieve a behaviour similar to lazy queues.

#### <a id="global-qos" class="anchor" href="#global-qos">Global QoS</a>

Quorum queues do not support global [QoS prefetch](./confirms.html#channel-qos-prefetch) where a channel sets a single
prefetch limit for all consumers using that channel. If an attempt
is made to consume from a quorum queue from a channel with global QoS activated
a channel error will be returned.

Use [per-consumer QoS prefetch](./consumer-prefetch.html), which is the default in several popular clients.

#### Priorities

Quorum queues support [consumer priorities](./consumer-priority.html), but not [message priorities](./priority.html).

To prioritize messages with Quorum Queues, use multiple queues; one for each priority.


#### Poison Message Handling

Quorum queues [support poison message handling](#poison-message-handling) via a redelivery limit.
This feature is currently unique to quorum queues.

#### <a id="policy-support" class="anchor" href="#policy-support">Policy Support</a>

Quorum queues can be configured via RabbitMQ policies. The below table summarises the
policy keys they adhere to.


| Definition Key | Type |
| :-------- | :------- |
| `max-length` | Number |
| `max-length-bytes` | Number |
| `overflow` | "drop-head" or "reject-publish" |
| `expires` | Number (milliseconds) |
| `dead-letter-exchange` | String |
| `dead-letter-routing-key` | String |
| `max-in-memory-length` | Number |
| `max-in-memory-bytes` | Number |
| `delivery-limit` | Number |


## <a id="use-cases" class="anchor" href="#use-cases">Use Cases</a>

Quorum queues are purpose built by design. They are _not_ designed to be used for every problem.
Their intended use is for topologies where queues exist for a long time and are critical to certain
aspects of system operation, therefore fault tolerance and data safety is more important than, say,
lowest possible latency and advanced queue features.

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
 * Lowest possible latency: the underlying consensus algorithm has an inherently higher latency due to its data safety features
 * When data safety is not a priority (e.g. applications do not use [manual acknowledgements and publisher confirms](./confirms.html) are not used)
 * Very long queue backlogs ([streams](./stream.html) are likely to be a better fit)



## <a id="usage" class="anchor" href="#usage">Usage</a>

As stated earlier, quorum queues share most of the fundamentals with other [queue](queues.html) types.
A client library that can specify [optional queue arguments](./queues.html#optional-arguments) will be able to use quorum queues.

First we will cover how to declare a quorum queue.

### <a id="declaring" class="anchor" href="#declaring">Declaring</a>

To declare a quorum queue set the `x-queue-type` queue argument to `quorum`
(the default is `classic`). This argument must be provided by a client
at queue declaration time; it cannot be set or changed using a [policy](./parameters.html#policies).
This is because policy definition or applicable policy can be changed dynamically but
queue type cannot. It must be specified at the time of declaration.

Declaring a queue with an `x-queue-type` argument set to `quorum` will declare a quorum queue with
up to five replicas (default [replication factor](#replication-factor)), one per each [cluster node](./clustering.html).

For example, a cluster of three nodes will have three replicas, one on each node.
In a cluster of seven nodes, five nodes will have one replica each but two nodes won't host any replicas.

After declaration a quorum queue can be bound to any exchange just as any other
RabbitMQ queue.

If declaring using [management UI](./management.html), queue type must be specified using
the queue type drop down menu.

### Client Operations for Quorum Queues

The following operations work the same way for quorum queues as they do for classic queues:

 * [Consumption](./consumers.html) (subscription)
 * [Consumer acknowledgements](./confirms.html) (keep [QoS Prefetch Limitations](#global-qos) in mind)
 * Cancellation of consumers
 * Purging of queue messages
 * Queue deletion

With some queue operations there are minor differences:

 * [Declaration](#declaring) (covered above)
 * Setting [QoS prefetch](#global-qos) for consumers


## <a id="replication" class="anchor" href="#replication">Quorum Queue Replication and Data Locality</a>

When a quorum queue is declared, an initial number of replicas for it must be started in the cluster.
By default the number of replicas to be started is up to three, one per RabbitMQ node in the cluster.

Three nodes is the **practical minimum** of replicas for a quorum queue. In RabbitMQ clusters with a larger
number of nodes, adding more replicas than a [quorum](#what-is-quorum) (majority) will not provide
any improvements in terms of [quorum queue availability](#quorum-requirements) but it will consume
more cluster resources.

Therefore the **recommended number of replicas** for a quorum queue is the quorum of cluster nodes
(but no fewer than three). This assumes a [fully formed](cluster-formation.html) cluster of at least three nodes.

### <a id="replication-factor" class="anchor" href="#replication-factor">Controlling the Initial Replication Factor</a>

For example, a cluster of three nodes will have three replicas, one on each node.
In a cluster of seven nodes, three nodes will have one replica each but four more nodes won't host any replicas
of the newly declared queue.

Like with classic mirrored queues, the replication factor (number of replicas a queue has) can be configured for quorum queues.

The minimum factor value that makes practical sense is three.
It is highly recommended for the factor to be an odd number.
This way a clear quorum (majority) of nodes can be computed. For example, there is no "majority" of
nodes in a two node cluster. This is covered with more examples below in the [Fault Tolerance and Minimum Number of Replicas Online](#quorum-requirements)
section.

This may not be desirable for larger clusters or for cluster with an even number of
nodes. To control the number of quorum queue members set the
`x-quorum-initial-group-size` queue argument when declaring the queue. The
group size argument provided should be an integer that is greater than zero and smaller or
equal to the current RabbitMQ cluster size. The quorum queue will be
launched to run on a random subset of RabbitMQ nodes present in the cluster at declaration time.

In case a quorum queue is declared before all cluster nodes have joined the cluster, and the initial replica
count is greater than the total number of cluster members, the effective value used will
be equal to the total number of cluster nodes. When more nodes join the cluster, the replica count
will not be automatically increased but it can be [increased by the operator](#replica-management).

### <a id="leader-placement" class="anchor" href="#leader-placement">Queue Leader Location</a>

Every quorum queue has a primary replica. That replica is called
_queue leader_. All queue operations go through the leader
first and then are replicated to followers (mirrors). This is necessary to
guarantee FIFO ordering of messages.

To avoid some nodes in a cluster hosting the majority of queue leader
replicas and thus handling most of the load, queue leaders should
be reasonably evenly distributed across cluster nodes.

When a new quorum queue is declared, the set of nodes that will host its
replicas is randomly picked, but will always include the node the client that declares the queue is connected to.

Which replica becomes the initial leader can controlled using three options:

1. Setting the `queue-leader-locator` [policy](parameters.html#policies) key (recommended)
2. By defining the `queue_leader_locator` key in [the configuration file](configure.html#configuration-files) (recommended)
3. Using the `x-queue-leader-locator` [optional queue argument](queues.html#optional-arguments)

Supported queue leader locator values are

 * `client-local`: Pick the node the client that declares the queue is connected to. This is the default value.
 * `balanced`: If there are overall less than 1000 queues (classic queues, quorum queues, and streams),
   pick the node hosting the minimum number of quorum queue leaders.
   If there are overall more than 1000 queues, pick a random node.

### <a id="replica-management" class="anchor" href="#replica-management">Managing Replicas</a> (Quorum Group Members)

Replicas of a quorum queue are explicitly managed by the operator. When a new node is added
to the cluster, it will host no quorum queue replicas unless the operator explicitly adds it
to a member (replica) list of a quorum queue or a set of quorum queues.

When a node has to be decommissioned (permanently removed from the cluster), it must be explicitly
removed from the member list of all quorum queues it currently hosts replicas for.

Several [CLI commands](./cli.html) are provided to perform the above operations:

<pre class="lang-bash">
rabbitmq-queues add_member [-p &lt;vhost&gt;] &lt;queue-name&gt; &lt;node&gt;
</pre>

<pre class="lang-bash">
rabbitmq-queues delete_member [-p &lt;vhost&gt;] &lt;queue-name&gt; &lt;node&gt;
</pre>

<pre class="lang-bash">
rabbitmq-queues grow &lt;node&gt; &lt;all | even&gt; [--vhost-pattern &lt;pattern&gt;] [--queue-pattern &lt;pattern&gt;]
</pre>

<pre class="lang-bash">
rabbitmq-queues shrink &lt;node&gt; [--errors-only]
</pre>

To successfully add and remove members a quorum of replicas in the cluster must be available
because cluster membership changes are treated as queue state changes.

Care needs to be taken not to accidentally make a queue unavailable by losing
the quorum whilst performing maintenance operations that involve membership changes.

When replacing a cluster node, it is safer to first add a new node and then decomission the node
it replaces.

### <a id="replica-rebalancing" class="anchor" href="#replica-rebalancing">Rebalancing Replicas for Quorum Queues</a>

Once declared, the RabbitMQ quorum queue leaders may be unevenly distributed across the RabbitMQ cluster.
To re-balance use the `rabbitmq-queues rebalance`
command. It is important to know that this does not change the nodes which the quorum queues span. To modify the membership instead see [managing replicas](#replica-management).

<pre class="lang-bash">
# rebalances all quorum queues
rabbitmq-queues rebalance quorum
</pre>

it is possible to rebalance a subset of queues selected by name:

<pre class="lang-bash">
# rebalances a subset of quorum queues
rabbitmq-queues rebalance quorum --queue-pattern "orders.*"
</pre>

or quorum queues in a particular set of virtual hosts:

<pre class="lang-bash">
# rebalances a subset of quorum queues
rabbitmq-queues rebalance quorum --vhost-pattern "production.*"
</pre>


## <a id="behaviour" class="anchor" href="#behaviour">Quorum Queue Behaviour</a>

A quorum queue relies on a consensus protocol called Raft to ensure data consistency and safety.

Every quorum queue has a primary replica (a *leader* in Raft parlance) and zero or more
secondary replicas (called *followers*).

A leader is elected when the cluster is first formed and later if the leader
becomes unavailable.

### <a id="leader-election" class="anchor" href="#leader-election">Leader Election and Failure Handling of Quorum Queues</a>

A quorum queue requires a quorum of the declared nodes to be available
to function. When a RabbitMQ node hosting a quorum queue's
*leader* fails or is stopped another node hosting one of that
quorum queue's *follower* will be elected leader and resume
operations.

Failed and rejoining followers will re-synchronise ("catch up") with the leader.
In contrast to classic mirrored queues, a temporary replica failure
does not require a full re-synchronization from the currently elected leader. Only the delta
will be transferred if a re-joining replica is behind the leader. This "catching up" process
does not affect leader availability.

Except for the initial replica set selection, replicas must be explicitly added to a quorum queue.
When a new replica is [added](#replica-management), it will synchronise the entire queue state
from the leader, similarly to classic mirrored queues.

### <a id="quorum-requirements" class="anchor" href="#quorum-requirements">Fault Tolerance and Minimum Number of Replicas Online</a>

Consensus systems can provide certain guarantees with regard to data safety.
These guarantees do mean that certain conditions need to be met before they
become relevant such as requiring a minimum of three cluster nodes to provide
fault tolerance and requiring more than half of members to be available to
work at all.

Failure tolerance characteristics of clusters of various size can be described
in a table:

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

As the table above shows RabbitMQ clusters with fewer than three nodes do not
benefit fully from the quorum queue guarantees. RabbitMQ clusters with an even
number of RabbitMQ nodes do not benefit from having quorum queue members spread
over all nodes. For these systems the quorum queue size should be constrained to a
smaller uneven number of nodes.

Performance tails off quite a bit for quorum queue node sizes larger than 5.
We do not recommend running quorum queues on more than 7 RabbitMQ nodes. The
default quorum queue size is 3 and is controllable using the
`x-quorum-initial-group-size` [queue argument](./queues.html#optional-arguments).

### <a id="data-safety" class="anchor" href="#data-safety">Data Safety provided with Quorum Queues</a>

Quorum queues are designed to provide data safety under network partition and
failure scenarios. A message that was successfully confirmed back to the publisher
using the [publisher confirms](confirms.html) feature should not be lost as long as at
least a majority of RabbitMQ nodes hosting the quorum queue are not
permanently made unavailable.

Generally quorum queues favours data consistency over availability.

*_No guarantees are provided for messages that have not been confirmed using
the publisher confirm mechanism_*. Such messages could be lost "mid-way", in an operating
system buffer or otherwise fail to reach the queue leader.


### <a id="availability" class="anchor" href="#availability">Quorum Queue Availability</a>

A quorum queue should be able to tolerate a minority of queue members becoming unavailable
with no or little effect on availability.

Note that depending on the [partition handling strategy](./partitions.html)
used RabbitMQ may restart itself during recovery and reset the node but as long as that
does not happen, this availability guarantee should hold true.

For example, a queue with three replicas can tolerate one node failure without losing availability.
A queue with five replicas can tolerate two, and so on.

If a quorum of nodes cannot be recovered (say if 2 out of 3 RabbitMQ nodes are
permanently lost) the queue is permanently unavailable and
will need to be force deleted and recreated.

Quorum queue follower replicas that are disconnected from the leader or participating in a leader
election will ignore queue operations sent to it until they become aware of a newly elected leader.
There will be warnings in the log (`received unhandled msg` and similar) about such events.
As soon as the replica discovers a newly elected leader, it will sync the queue operation
log entries it does not have from the leader, including the dropped ones. Quorum queue state
will therefore remain consistent.


## <a id="performance" class="anchor" href="#performance">Quorum Queue Performance Characteristics</a>

Quorum queues are designed to trade latency for throughput and have been tested
and compared against durable [classic mirrored queues](./ha.html) in 3, 5 and 7 node configurations at several
message sizes.

In scenarios using both consumer acks and publisher confirms
quorum queues have been observed to have superior throughput to
classic mirrored queues. For example, take a look at [these benchmarks with 3.10](https://blog.rabbitmq.com/posts/2022/05/rabbitmq-3.10-performance-improvements/)
and [another with 3.12](https://blog.rabbitmq.com/posts/2023/05/rabbitmq-3.12-performance-improvements/#significant-improvements-to-quorum-queues).

As quorum queues persist all data to disks before doing anything it is recommended
to use the fastest disks possible and certain [Performance Tuning](#performance-tuning) settings.

Quorum queues also benefit from consumers
using higher prefetch values to ensure consumers aren't starved whilst
acknowledgements are flowing through the system and allowing messages
to be delivered in a timely fashion.

Due to the disk I/O-heavy nature of quorum queues, their throughput decreases
as message sizes increase.

Quorum queue throughput is also affected by the number of replicas.
The more replicas a quorum queue has, the lower its throughput generally will
be since more work has to be done to replicate data and achieve consensus.


## <a id="configuration" class="anchor" href="#configuration">Configurable Settings</a>

There are a few new configuration parameters that can be tweaked using
the [advanced](configure.html#advanced-config-file) config file.

Note that all settings related to [resource footprint](#resource-use) are documented
in a separate section.

The `ra` application (which is the Raft library that quorum
queues use) has [its own set of tunable parameters](https://github.com/rabbitmq/ra#configuration).

The `rabbit` application has several quorum queue related configuration items available.

<table>
  <thead>
    <tr>
      <td><code>advanced.config</code> Configuration Key</td>
      <td>Description</td>
      <td>Default value</td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>rabbit.quorum_cluster_size</td>
      <td>
        Sets the default quorum queue cluster size (can be over-ridden by the <code>x-quorum-initial-group-size</code>
        queue argument at declaration time.
      </td>
      <td>3</td>
    </tr>
    <tr>
      <td>rabbit.quorum_commands_soft_limit</td>
      <td>
        This is a flow control related parameter defining
        the maximum number of unconfirmed messages a channel accepts before entering flow.
        The current default is configured to provide good performance and stability
        when there are multiple publishers sending to the same quorum queue. If the applications
        typically only have a single publisher per queue this limit could be increased to provide
        somewhat better ingress rates.
      </td>
      <td>32</td>
    </tr>
  </tbody>
</table>

### Example of a Quorum Queue Configuration

The following `advanced.config` example modifies all values listed above:

<pre class="lang-erlang">
[
 %% five replicas by default, only makes sense for nine node clusters
 {rabbit, [{quorum_cluster_size, 5},
           {quorum_commands_soft_limit, 512}]}
].
</pre>


## <a id="poison-message-handling" class="anchor" href="#poison-message-handling">Poison Message Handling for Quorum Queues</a>

Quorum queue support handling of [poison messages](https://en.wikipedia.org/wiki/Poison_message),
that is, messages that cause a consumer to repeatedly requeue a delivery (possibly due to a consumer failure)
such that the message is never consumed completely and [positively acknowledged](./confirms.html) so that it can be marked for
deletion by RabbitMQ.

Quorum queues keep track of the number of unsuccessful delivery attempts and expose it in the
"x-delivery-count" header that is included with any redelivered message.

It is possible to set a delivery limit for a queue using a [policy](./parameters.html#policies) argument, `delivery-limit`.

When a message has been returned more times than the limit the message will be dropped or
[dead-lettered](./dlx.html) (if a DLX is configured).



## <a id="resource-use" class="anchor" href="#resource-use">Resources that Quorum Queues Use</a>

Quorum queues are optimised for data safety and performance and typically require more resources (disk and RAM)
than classic mirrored queues under a steady workload. Each quorum queue process maintains an in-memory index of
the messages in the queue, which requires at least 32 bytes of metadata for each message (more, if the message was returned or has a TTL set).
A quorum queue process will therefore use at least 1MB for every 30000 messages in the queue (message size is irrelevant).
You can perform back-of-the-envelope calculations based on the number of queues and expected or maximum number of messages in them).
Keeping the queues short is the best way to maintain low memory usage. [Setting the maximum queue length](./maxlength.html)
for all queues is a good way to limit the total memory usage if the queues become long for any reason.

Additionally, quorum queues on a given node share a write-ahead-log (WAL) for all operations.
WAL operations are stored both in memory and written to disk.
When the current WAL file reaches a predefined limit, it is flushed to a WAL segment file on disk
and the system will begin to release the memory used by that batch of log entries.
The segment files are then compacted over time as consumers [acknowledge deliveries](./confirms.html).
Compaction is the process that reclaims disk space.

The WAL file size limit at which it is flushed to disk can be controlled:

<pre class="lang-ini">
# Flush current WAL file to a segment file on disk once it reaches 64 MiB in size
raft.wal_max_size_bytes = 64000000
</pre>

The value defaults to 512 MiB. This means that during steady load, the WAL table memory
footprint can reach 512 MiB. You can expect your memory usage to look like this:
<img class="screenshot" src="img/memory/quorum-queue-memory-usage-pattern.png" alt="Quorum Queues WAL memory usage pattern" title="Quorum Queues WAL memory usage pattern" />

Because memory deallocation may take some time,
we recommend that the RabbitMQ node is allocated at least 3 times the memory of the default WAL file size limit.
More will be required in high-throughput systems. 4 times is a good starting point for those.

### <a id="repeated-requeues" class="anchor" href="#repeated-requeues">Repeated Requeues</a>

Internally quorum queues are implemented using a log where all operations including
messages are persisted. To avoid this log growing too large it needs to be
truncated regularly. To be able to truncate a section of the log all messages
in that section needs to be acknowledged. Usage patterns that continuously
[reject or nack](./nack.html) the same message with the `requeue` flag set to true
could cause the log to grow in an unbounded fashion and eventually fill
up the disks.

Messages that are rejected or nacked back to a quorum queue will be
returned to the _back_ of the queue _if_ no [delivery-limit](#poison-message-handling) is set. This avoids
the above scenario where repeated re-queues causes the Raft log to grow in an
unbounded manner. If a `delivery-limit` is set it will use the original behaviour
of returning the message near the head of the queue.

### <a id="atom-use" class="anchor" href="#atom-use">Increased Atom Use</a>

The internal implementation of quorum queues converts the queue name
into an Erlang atom. If queues with arbitrary names are continuously
created and deleted it _may_ threaten the long term stability of the
RabbitMQ system (if the size of the atom table reaches the maximum limit,
about 1M by default). It is not recommended to use quorum queues in this manner
at this point.


## <a id="performance-tuning" class="anchor" href="#performance-tuning">Quorum Queue Performance Tuning</a>

This section aims to cover a couple of tunable parameters that may increase throughput of quorum queues for
**some workloads**. Other workloads may not see any increases, or observe decreases in throughput, with these settings.

Use the values and recommendations here as a **starting point** and conduct your own benchmark (for example,
[using PerfTest](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/)) to conclude what combination of values works best for a particular workloads.

### <a id="segment-entry-count" class="anchor" href="#segment-entry-count">Tuning: Raft Segment File Entry Count</a>

Workloads with small messages and higher message rates can benefit from the following
configuration change that increases the number of Raft log entries (such as enqueued messages)
that are allowed in a single write-ahead log file:

<pre class="lang-bash">
# Positive values up to 65535 are allowed, the default is 4096.
raft.segment_max_entries = 32768
</pre>

Values greater than `65535` are **not supported**.

### <a id="linux-readahead" class="anchor" href="#linux-readahead">Tuning: Linux Readahead</a>

In addition, the aforementioned workloads with a higher rate of small messages can benefit from
a higher `readahead`, a configurable block device parameter of storage devices on Linux.

To inspect the effective `readahead` value, use [`blockdev --getra`](https://man7.org/linux/man-pages/man8/blockdev.8.html)
and specify the block device that hosts RabbitMQ node data directory:


<pre class="lang-bash">
# This is JUST AN EXAMPLE.
# The name of the block device in your environment will be different.
#
# Displays effective readahead value device /dev/sda.
sudo blockdev --getra /dev/sda
</pre>

To configure `readahead`, use [`blockdev --setra`](https://man7.org/linux/man-pages/man8/blockdev.8.html) for
the block device that hosts RabbitMQ node data directory:

<pre class="lang-bash">
# This is JUST AN EXAMPLE.
# The name of the block device in your environment will be different.
# Values between 256 and 4096 in steps of 256 are most commonly used.
#
# Sets readahead for device /dev/sda to 4096.
sudo blockdev --setra 4096 /dev/sda
</pre>
