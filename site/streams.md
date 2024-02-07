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

# Streams

## <a id="overview" class="anchor" href="#overview">What is a Stream</a>

RabbitMQ Streams is a persistent replicated data structure that can complete the same tasks as queues: they buffer messages from producers that are read by consumers.
However, streams differ from queues in two important ways: how messages are stored and consumed.

Streams model an append-only log of messages that can be repeatedly read until they expire.
Streams are always persistent and replicated. A more technical description of this stream behavior is “non-destructive consumer semantics”.

To read messages from a stream in RabbitMQ, one or more consumers subscribe to it and read the same messages as many times as they want.

Data in a stream can be used via a RabbitMQ client library or through a
[dedicated binary protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v3.12.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc) plugin and associated client(s).
The latter option is **highly recommended** as it provides access to all stream-specific features and offers best possible throughput (performance).

Now, you might be asking the following questions:

 * Do streams replace queues then?
 * Should I move away from using queues?

To answer these questions, streams were not introduced to replace queues but to complement them. Streams open up many opportunities for new RabbitMQ use cases which are described in [Use Cases for Using Streams](#use-cases).

The following information details streams usage, and the administration and maintenance operations for streams.

You should also review the [stream plugin](./stream.html) information to learn more about the usage of streams with the binary RabbitMQ Stream protocol and the [stream core and stream plugin comparison page](./stream-core-plugin-comparison.html) for the feature matrix.

### <a id="use-cases" class="anchor" href="#use-cases">Use Cases for Using Streams</a>

Streams were developed to initially cover 4 messaging use-cases that
existing queue types either can not provide or provide with downsides:

1. Large fan-outs

    When wanting to deliver the same message to multiple subscribers users currently
    have to bind a dedicated queue for each consumer. If the number of consumers is
    large this becomes potentially inefficient, especially when wanting persistence
    and/or replication. Streams will allow any number of consumers to consume
    the same messages from the same queue in a non-destructive manner, negating the need
    to bind multiple queues. Stream consumers will also be able to read from replicas
    allowing read load to be spread across the cluster.

2. Replay (Time-travelling)

    As all current RabbitMQ queue types have destructive consume behaviour, i.e. messages
    are deleted from the queue when a consumer is finished with them, it is not
    possible to re-read messages that have been consumed. Streams will allow
    consumers to attach at any point in the log and read from there.

3. Throughput Performance

    No persistent queue types are able to deliver throughput that can compete with
    any of the existing log based messaging systems. Streams have been designed
    with performance as a major goal.

4. Large backlogs

    Most RabbitMQ queues are designed to converge towards the empty state and are
    optimised as such and can perform worse when there are millions of messages on a
    given queue. Streams are designed to store larger amounts of data in an
    efficient manner with minimal in-memory overhead.

## <a id="usage" class="anchor" href="#usage">How to Use RabbitMQ Streams</a>

An AMQP 0.9.1 client library that can specify [optional queue and consumer arguments](./queues.html#optional-arguments)
will be able to use streams as regular AMQP 0.9.1 queues.

Just like queues, streams have to be declared first.

### <a id="declaring" class="anchor" href="#declaring">Declaring a RabbitMQ Stream</a>

To declare a stream, set the `x-queue-type` queue argument to `stream`
(the default is `classic`). This argument must be provided by a client
at declaration time; it cannot be set or changed using a [policy](./parameters.html#policies).
This is because policy definition or applicable policy can be changed dynamically but
queue type cannot. It must be specified at the time of declaration.

The following snippet shows how to create a stream with the [AMQP 0.9.1 Java client](./api-guide.html):

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
Connection connection = factory.newConnection();
Channel channel = connection.createChannel();
channel.queueDeclare(
  "my-stream",
  true,         // durable
  false, false, // not exclusive, not auto-delete
  Collections.singletonMap("x-queue-type", "stream")
);
</pre>

Declaring a queue with an `x-queue-type` argument set to `stream` will create a stream
with a replica on each configured RabbitMQ node. Streams are quorum systems
so uneven cluster sizes is strongly recommended.

A stream remains an AMQP 0.9.1 queue, so it can be bound to any exchange after its creation,
just as any other RabbitMQ queue.

If declaring using [management UI](./management), the `stream` type must be specified using
the queue type drop down menu.

Streams support additional [queue arguments](./queues#optional-arguments)
that also can be configured using a [policy](./parameters#policies)

* `x-max-length-bytes`

Sets the maximum size of the stream in bytes. See [retention](#retention). Default: not set.

* `x-max-age`

Sets the maximum age of the stream. See [retention](#retention). Default: not set.

* `x-stream-max-segment-size-bytes`

Unit: bytes.

A stream is divided up into fixed size segment files on disk.
This setting controls the size of these.
Default: (500000000 bytes).

While this argument can be configured via a policy, it will _only_ be applied
to the stream if the policy is set at stream declaration time. If this argument
is changed for a matching but pre-existing stream it **will not be changed** even
if the effective policy of the queue record may indicate it is.

Hence it is best to only configure this via an option queue argument:

* `x-stream-filter-size-bytes`

The value is set in bytes.

The size of the Bloom filter used for [filtering](#filtering).
The value must be between 16 and 255.
Default: 16.

<pre class="lang-java">
Map&lt;String, Object&gt; arguments = new HashMap&lt;&gt;();
arguments.put("x-queue-type", "stream");
arguments.put("x-max-length-bytes", 20_000_000_000); // maximum stream size: 20 GB
arguments.put("x-stream-max-segment-size-bytes", 100_000_000); // size of segment files: 100 MB
channel.queueDeclare(
  "my-stream",
  true,         // durable
  false, false, // not exclusive, not auto-delete
  arguments
);
</pre>


### Client Operations

#### <a id="consuming" class="anchor" href="#consuming">Consuming</a>

As streams never delete any messages, any consumer can start reading/consuming
from any point in the log. This is controlled by the `x-stream-offset` consumer argument.
If it is unspecified the consumer will start reading from the next offset written
to the log after the consumer starts. The following values are supported:

 * `first` - start from the first available message in the log
 * `last` - this starts reading from the last written "chunk" of messages _(a chunk
 is the storage and transportation unit used in streams, put simply it is a batch
 of messages made of several to a few thousands of messages, depending on the ingress)_
 * `next` - same as not specifying any offset
 * Offset - a numerical value specifying an exact offset to attach to the log at.
 If this offset does not exist it will clamp to either the start or end of the log respectively.
 * Timestamp - a timestamp value specifying the point in time to attach to the log at.
 It will clamp to the closest offset, if the timestamp is out of range for the stream it will clamp either the start or end of the log respectively.
 With AMQP 0.9.1, the timestamp used is POSIX time with an accuracy of one second, that is the number of seconds since 00:00:00 UTC, 1970-01-01.
 Be aware consumers can receive messages published a bit before the specified timestamp.
 * Interval - a string value specifying the time interval relative to current time to attach the log at. Uses the same specification as `x-max-age` (see [Retention](#retention))

The following snippet shows how to use the `first` offset specification:

<pre class="lang-java">
channel.basicQos(100); // QoS must be specified
channel.basicConsume(
  "my-stream",
  false,
  Collections.singletonMap("x-stream-offset", "first"), // "first" offset specification
  (consumerTag, message) -> {
    // message processing
    // ...
   channel.basicAck(message.getEnvelope().getDeliveryTag(), false); // ack is required
  },
  consumerTag -> { });
</pre>

The following snippet shows how to specify a specific offset to consume from:

<pre class="lang-java">
channel.basicQos(100); // QoS must be specified
channel.basicConsume(
  "my-stream",
  false,
  Collections.singletonMap("x-stream-offset", 5000), // offset value
  (consumerTag, message) -> {
    // message processing
    // ...
   channel.basicAck(message.getEnvelope().getDeliveryTag(), false); // ack is required
  },
  consumerTag -> { });
</pre>

The following snippet shows how to specify a specific timestamp to consume from:

<pre class="lang-java">
// an hour ago
Date timestamp = new Date(System.currentTimeMillis() - 60 * 60 * 1_000)
channel.basicQos(100); // QoS must be specified
channel.basicConsume(
  "my-stream",
  false,
  Collections.singletonMap("x-stream-offset", timestamp), // timestamp offset
  (consumerTag, message) -> {
    // message processing
    // ...
   channel.basicAck(message.getEnvelope().getDeliveryTag(), false); // ack is required
  },
  consumerTag -> { });
</pre>


#### Other Stream Operations

The following operations can be used in a similar way to classic and quorum queues
but some have some queue specific behaviour.

 * [Declaration](#declaring)
 * Queue deletion
 * [Publisher confirms](./confirms.html#publisher-confirms)
 * [Consumption](./consumers.html) (subscription): consumption requires QoS
 prefetch to be set. The acks works as a credit mechanism to advance the current
 offset of the consumer.
 * Setting [QoS prefetch](#global-qos) for consumers
 * [Consumer acknowledgements](./confirms.html) (keep [QoS Prefetch Limitations](#global-qos) in mind)
 * Cancellation of consumers

### <a id="single-active-consumer" class="anchor" href="#single-active-consumer">Single Active Consumer Feature for Streams</a>

Single active consumer for streams is a feature available in RabbitMQ 3.11 and more.
It provides _exclusive consumption_ and _consumption continuity_ on a stream.
When several consumer instances sharing the same stream and name enable single active consumer, only one of these instances will be active at a time and so will receive messages.
The other instances will be idle.

The single active consumer feature provides 2 benefits:

* Messages are processed in order: there is only one consumer at a time.
* Consumption continuity is maintained: a consumer from the group will take over if the active one stops or crashes.

A [blog post](https://blog.rabbitmq.com/posts/2022/07/rabbitmq-3-11-feature-preview-single-active-consumer-for-streams/) provides more details on single active consumer for streams.

### <a id="super-streams" class="anchor" href="#super-streams">Super Streams</a>

Super streams are a way to scale out by partitioning a large stream into smaller streams.
They integrate with [single active consumer](#single-active-consumer) to preserve message order within a partition.
Super streams are available starting with RabbitMQ 3.11.

A super stream is a logical stream made of individual, regular streams.
It is a way to scale out publishing and consuming with RabbitMQ Streams: a large logical stream is divided into partition streams, splitting up the storage and the traffic on several cluster nodes.

A super stream remains a logical entity: applications see it as one “large” stream, thanks to the smartness of client libraries.
The topology of a super stream is based on the [AMQP 0.9.1 model](./tutorials/amqp-concepts.html), that is exchange, queues, and bindings between them.

It is possible to create the topology of a super stream with any AMQP 0.9.1 library or with the [management plugin](./management.html), it requires to create a direct exchange, the "partition" streams, and bind them together.
It may be easier to use the `rabbitmq-streams add_super_stream` command though.
Here is how to use it to create an `invoices` super stream with 3 partitions:

<pre class="lang-bash">
rabbitmq-streams add_super_stream invoices --partitions 3
</pre>

Use `rabbitmq-streams add_super_stream --help` to learn more about the command.

Super streams add complexity compared to individual streams, so they should not be considered the default solution for all use cases involving streams.
Consider using super streams only if you are sure you reached the limits of individual streams.

A [blog post](https://blog.rabbitmq.com/posts/2022/07/rabbitmq-3-11-feature-preview-super-streams) provides an overview of super streams.

## <a id="feature-comparison" class="anchor" href="#feature-comparison">Feature Comparison: Regular Queues versus Streams</a>

Streams are not really queues in the traditional sense and thus do not
align very closely with AMQP 0.9.1 queue semantics. Many features that other queue types
support are not supported and will never be due to the nature of the queue type.

An AMQP 0.9.1 client library that can use [regular queues](./queues.html) will be able to use streams
as long as it uses consumer acknowledgements.

Many features will never be supported by streams due to their non-destructive
read semantics.

### <a id="feature-matrix" class="anchor" href="#feature-matrix">Feature Matrix</a>

| Feature | Classic | Stream |
| :-------- | :------- | ------ |
| [Non-durable queues](./queues.html) | yes | no |
| [Exclusivity](./queues.html) | yes | no |
| Per message persistence | per message | always |
| Membership changes | automatic | manual  |
| [TTL](./ttl.html) | yes | no (but see [Retention](#retention)) |
| [Queue length limits](./maxlength.html) | yes | no (but see [Retention](#retention))|
| [Lazy behaviour](./lazy-queues.html) | yes | inherent |
| [Message priority](./priority.html) | yes | no |
| [Consumer priority](./consumer-priority.html) | yes | no |
| [Dead letter exchanges](./dlx.html) | yes | no |
| Adheres to [policies](./parameters.html#policies) | yes | (see [Retention](#retention)) |
| Reacts to [memory alarms](./alarms.html) | yes | no (uses minimal RAM) |
| Poison message handling | no | no |
| Global [QoS Prefetch](#global-qos) | yes | no |

#### Non-durable Queues

Streams are always durable per their assumed [use cases](#use-cases),
they cannot be [non-durable](./queues.html#properties) like regular queues.

#### Exclusivity

Streams are always durable per their assumed [use cases](#use-cases), they cannot be
[exclusive](./queues.html#exclusive-queues) like regular queues.
They are not meant to be used as [temporary queues](./queues.html#temporary-queues).


#### Lazy Mode

Streams store all data directly on disk, after a message has been written
it does not use any memory until it is read. Streams are inherently [lazy](./lazy-queues.html), so to speak.


#### <a id="global-qos" class="anchor" href="#global-qos">Global QoS</a>

Streams do not support global [QoS prefetch](./confirms.html#channel-qos-prefetch) where a channel sets a single
prefetch limit for all consumers using that channel. If an attempt
is made to consume from a stream from a channel with global QoS enabled
a channel error will be returned.

Use [per-consumer QoS prefetch](./consumer-prefetch.html), which is the default in several popular clients.

## <a id="retention" class="anchor" href="#retention">Data Retention</a>

Streams are implemented as an immutable append-only disk log. This means that
the log will grow indefinitely until the disk runs out. To avoid this undesirable
scenario it is possible to set a retention configuration per stream which will
discard the oldest data in the log based on total log data size and/or age.

There are two parameters that control the retention of a stream. These can be combined.
These are either set at declaration time using a queue argument or as a policy which
can be dynamically updated.

 * `max-age`:

    valid units: Y, M, D, h, m, s

    e.g. `7D` for a week

 * `max-length-bytes`:

    the max total size in bytes

NB: retention is evaluated on per segment basis so there is one more parameter
that comes into effect and that is the segment size of the stream. The stream will
always leave at least one segment in place as long as the segment contains at least
one message.
When using broker-provided [offset-tracking](#offset-tracking), offsets for each consumer
are persisted in the stream itself as non-message data.


## <a id="performance" class="anchor" href="#performance">Performance Characteristics</a>

As streams persist all data to disks before doing anything it is recommended
to use the fastest disks possible.

Due to the disk I/O-heavy nature of streams, their throughput decreases
as message sizes increase.

Just like quorum queues, streams are also affected by cluster sizes.
The more replicas a stream has, the lower its throughput generally will
be since more work has to be done to replicate data and achieve consensus.

### <a id="replication-factor" class="anchor" href="#replication-factor">Controlling the Initial Replication Factor</a>

The `x-initial-cluster-size` queue argument controls how many rabbit nodes the initial
stream cluster should span.

### <a id="replica-management" class="anchor" href="#replica-management">Managing Stream Replicas</a>

Replicas of a stream are explicitly managed by the operator. When a new node is added
to the cluster, it will host no stream replicas unless the operator explicitly adds it
to a replica set of a stream.

When a node has to be decommissioned (permanently removed from the cluster), it must be explicitly
removed from the replica list of all streams it currently hosts replicas for.

Two [CLI commands](./cli.html) are provided to perform the above operations,
`rabbitmq-streams add_replica` and `rabbitmq-streams delete_replica`:

<pre class="lang-bash">
rabbitmq-streams add_replica [-p &lt;vhost&gt;] &lt;stream-name&gt; &lt;node&gt;
</pre>

<pre class="lang-bash">
rabbitmq-streams delete_replica [-p &lt;vhost&gt;] &lt;stream-name&gt; &lt;node&gt;
</pre>

To successfully add and remove replicas the stream coordinator must be
available in the cluster.

Care needs to be taken not to accidentally make a stream unavailable by losing
the quorum whilst performing maintenance operations that involve membership changes.

Because the stream membership isn't embedded in the stream itself adding a replica
cannot be made entirely safe at the current time. Hence if there at any time is an
out of sync replica another replica cannot be added and an error will be returned.

When replacing a cluster node, it is safer to first add a new node, wait for it
to become in-sync and then de-comission the node it replaces.

The replication status of a stream can be queried using the following command:

<pre class="lang-bash">
rabbitmq-streams stream_status [-p &lt;vhost&gt;] &lt;stream-name&gt;
</pre>

## <a id="behaviour" class="anchor" href="#behaviour">Stream Behaviour</a>

Every stream has a primary writer (the leader) and zero or more replicas.

### <a id="leader-election" class="anchor" href="#leader-election">Leader Election and Failure Handling</a>

When a new stream is declared, the set of nodes that will host its
replicas is randomly picked, but will always include the node the client that declares the stream is connected to.

Which replica becomes the initial leader is controlled in three ways,
namely, using the `x-queue-leader-locator` [optional queue argument](queues.html#optional-arguments), setting the `queue-leader-locator`
policy key or by defining the `queue_leader_locator`
key in [the configuration file](configure.html#configuration-files). Here are the possible values:

 * `client-local`: Pick the node the client that declares the stream is connected to. This is the default value.
 * `balanced`: If there are overall less than 1000 queues (classic queues, quorum queues, and streams),
 pick the node hosting the minimum number of stream leaders.
 If there are overall more than 1000 queues, pick a random node.

A stream requires a quorum of the declared nodes to be available
to function. When a RabbitMQ node hosting a stream's
*leader* fails or is stopped another node hosting one of that
stream's *replica* will be elected leader and resume
operations.

Failed and rejoining replicas will re-synchronise ("catch up") with the leader.
Similarly to quorum queues queues, a temporary replica failure
does not require a full re-synchronization from the currently elected leader. Only the delta
will be transferred if a re-joining replica is behind the leader. This "catching up" process
does not affect leader availability.

Replicas must be explicitly added.
When a new replica is [added](#replica-management), it will synchronise the entire stream state
from the leader, similarly to newly added quorum queue replicas.

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


### <a id="data-safety" class="anchor" href="#data-safety">Data Safety when using Streams</a>

Streams replicate data across multiple nodes and publisher confirms are only
issued once the data has been replicated to a quorum of stream replicas.

Streams always store data on disk, however, they do not explicitly flush (fsync)
the data from the operating system page cache to the underlying storage
medium, instead they rely on the operating system to do as and when required.
This means that an uncontrolled shutdown of a server could result in data loss
for replicas hosted on that node. Although theoretically this opens up the possibility
of confirmed data loss, the chances of this happening during normal operation is
very small and the loss of data on a single node would typically just be re-replicated
from the other nodes in the system.

If more data safety is required then consider using quorum queues instead as no
publisher confirms are issued until at least a quorum of nodes have both written _and_
flushed the data to disk.

*_No guarantees are provided for messages that have not been confirmed using
the publisher confirm mechanism_*. Such messages could be lost "mid-way", in an operating
system buffer or otherwise fail to reach the stream leader.


### <a id="availability" class="anchor" href="#availability">Stream Availability</a>

A stream should be able to tolerate a minority of stream replicas becoming unavailable
with no or little effect on availability.

Note that depending on the [partition handling strategy](./partitions.html)
used RabbitMQ may restart itself during recovery and reset the node but as long as that
does not happen, this availability guarantee should hold true.

For example, a stream with three replicas can tolerate one node failure without losing availability.
A stream with five replicas can tolerate two, and so on.

If a quorum of nodes cannot be recovered (say if 2 out of 3 RabbitMQ nodes are
permanently lost) the queue is permanently unavailable and
will most likely need operator involvement to be recovered.


## <a id="configuration" class="anchor" href="#configuration">Configuring Streams</a>

For stream protocol port, TLS and other configuration, see the [Stream plugin guide](stream.html).
For required stream replication ports see the [Networking guide](networking.html#ports).


## <a id="resource-use" class="anchor" href="#resource-use">How Streams Use Resources</a>

Streams usually will have lower CPU and memory footprint than quorum queues.

All data is stored on disk with only unwritten data stored in memory.

## <a id="offset-tracking" class="anchor" href="#offset-tracking">Offset Tracking when using Streams</a>

When using the broker provided offset tracking features (currently only available
when using the [Stream plugin](./stream.html)) offsets are persisted in the stream
itself as non-message data. This means that as offset persistence is requested the
stream will grow on disk by some small amount per offset persistence request.

## <a id="limitations" class="anchor" href="#limitations">Limitations</a>

### <a id="limitations-message-encoding" class="anchor" href="#limitations-message-encoding">Message Encoding</a>

Streams internally store their messages as AMQP 1.0 encoded data. This means when
publishing using AMQP 0.9.1 a conversion takes place. Although the AMQP 1.0 data
model is mostly capable of containing all of AMQP 0.9.1's data model there are some
limitations. If an AMQP 0.9.1 message contains header entries with complex values
such as arrays or tables these headers will not be converted.
That is because headers are stored as application properties inside the AMQP 1.0 message and these can only
contain values of simple types, such as strings and numbers.

### <a id="limitations-ui-metrics" class="anchor" href="#limitations-ui-metrics">UI Metric Accuracy</a>

Management UI can show a message count that slightly exceeds the actual count in the stream.
Due to the way stream storage is implemented, offset tracking information is also counted as messages, making the message count artificially larger than it is.
This should make no practical difference in most systems.
