<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Consumers

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers various topics related to consumers:

 * [The basics](#basics)
 * [Consumer lifecycle](#consumer-lifecycle)
 * [How to register a consumer](#subscribing) (subscribe, "push API")
 * [Acknowledgement modes](#acknowledgement-modes)
 * [Message properties](#message-properties) and delivery metadata
 * [How to limit number of outstanding deliveries with prefetch](#prefetch)
 * [Delivery acknowledgement timeout](#acknowledgement-timeout)
 * [Consumer capacity](#metrics-capacity) metric
 * [How to cancel a consumer](#unsubscribing)
 * [Consumer exclusivity](#exclusivity)
 * [Single active consumer](#single-active-consumer)
 * [Consumer activity](#active-consumer)
 * [Consumer priority](#priority)
 * [Connection failure recovery](#connection-recovery)
 * [Exception Handling](#exceptions)
 * [Concurrency Consideration](#concurrency)

and more.

## <a id="terminology" class="anchor" href="#terminology">Terminology</a>

The term "consumer" means different things in different contexts. In general, in the context of messaging
and streaming, a consumer is an application (or application instance) that consumes and [acknowledges](./confirms.html)
messages. The same application can also publish messages and thus be a publisher at the same time.

Messaging protocols also have the concept of a lasting subscription for message delivery.
Subscription is one term commonly used to describe such entity. Consumer is another.
Messaging protocols supported by RabbitMQ use both terms but RabbitMQ documentation tends to
prefer the latter.

In this sense a consumer is a subscription for message delivery that has to be
registered before deliveries begin and can be cancelled by the application.

## <a id="basics" class="anchor" href="#basics">The Basics</a>

RabbitMQ is a messaging broker. It accepts messages from publishers, routes them
and, if there were queues to route to, stores them for consumption or immediately
delivers to consumers, if any.

Consumers consume from queues. In order to consume messages there has to be a queue.
When a new consumer is added, assuming there are already messages ready in the queue,
deliveries will start immediately.

The target queue can be empty at the time of consumer registration. In that case
first deliveries will happen when new messages are enqueued.

An attempt to consume from a non-existent queue will result in a channel-level
exception with the code of `404 Not Found` and render the channel it was attempted
on to be closed.

### <a id="consumer-tags" class="anchor" href="#consumer-tags">Consumer Tags</a>

Every consumer has an identifier that is used by client libraries to determine
what handler to invoke for a given delivery. Their names vary from protocol to protocol.
Consumer tags and subscription IDs are two most commonly used terms. RabbitMQ documentation
tends to use the former.

Consumer tags are also used to cancel consumers.

### <a id="consumer-lifecycle" class="anchor" href="#consumer-lifecycle">Consumer Lifecycle</a>

Consumers are meant to be long lived: that is, throughout the lifetime of a consumer it receives
multiple deliveries. Registering a consumer to consume a single message is not optimal.

Consumers are typically registered during application
startup. They often would live as long as their connection or even application
runs.

Consumers can be more dynamic and register in reaction to a system event, unsubscribing
when they are no longer necessary. This is common with WebSocket clients
used via [Web STOMP](./web-stomp.html) and [Web MQTT](web-mqtt.html) plugins, mobile clients and so on.

### <a id="connection-recovery" class="anchor" href="#connection-recovery">Connection Recovery</a>

Client can lose their connection to RabbitMQ. When connection loss is [detected](./heartbeats.html),
message delivery stops.

Some client libraries offer automatic connection recovery features that involves consumer recovery.
[Java](./api-guide.html#recovery), [.NET](./dotnet-api-guide.html#recovery) and [Bunny](http://rubybunny.info/articles/error_handling.html)
are examples of such libraries.
While connection recovery cannot cover 100% of scenarios and workloads, it generally works very well for consuming
applications and is recommended.

With other client libraries application developers are responsible for performing connection
recovery. Usually the following recovery sequence works well:

 * Recover connection
 * Recover channels
 * Recover queues
 * Recover exchanges
 * Recover bindings
 * Recover consumers

In other words, consumers are usually recovered last, after their target queues and those queues'
bindings are in place.

## <a id="subscribing" class="anchor" href="#subscribing">Registering a Consumer (Subscribing, "Push API")</a>

Applications can subscribe to have RabbitMQ push enqueued messages (deliveries) to them.
This is done by registering a consumer (subscription) on a queue. After a subscription
is in place, RabbitMQ will begin delivering messages. For each delivery
a user-provided handler will be invoked. Depending on the client library used
this can be a user-provided function or object that adheres to a certain interface.

A successful subscription operation returns a subscription identifier (consumer tag).
It can later be used to cancel the consumer.

### Java Client

See [Java client guide](./api-guide.html#consuming) for examples.

### .NET Client

See [.NET client guide](./dotnet-api-guide.html#consuming) for examples.

### <a id="message-properties" class="anchor" href="#message-properties">Message Properties and Delivery Metadata</a>

Every delivery combines message metadata and delivery information. Different client
libraries use slightly different ways of providing access to those properties. Typically
delivery handlers have access to a delivery data structure.

The following properties are delivery and routing details; they are not message properties per se
and set by RabbitMQ at routing and delivery time:

<table>
  <thead>
    <tr>
      <td>Property</td>
      <td>Type</td>
      <td>Description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Delivery tag</td>
      <td>Positive integer</td>
      <td>
        Delivery identifier, see <a href="./confirms.html">Confirms</a>.
      </td>
    </tr>
    <tr>
      <td>Redelivered</td>
      <td>Boolean</td>
      <td>Set to `true` if this message was previously <a href="./confirms.html#consumer-nacks-requeue">delivered and requeued</a></td>
    </tr>
    <tr>
      <td>Exchange</td>
      <td>String</td>
      <td>Exchange which routed this message</td>
    </tr>
    <tr>
      <td>Routing key</td>
      <td>String</td>
      <td>Routing key used by the publisher</td>
    </tr>
    <tr>
      <td>Consumer tag</td>
      <td>String</td>
      <td>Consumer (subscription) identifier</td>
    </tr>
  </tbody>
</table>

The following are message properties. Most of them are optional. They are set by publishers
at the time of publishing:

<table>
  <thead>
    <tr>
      <td>Property</td>
      <td>Type</td>
      <td>Description</td>
      <td>Required?</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Delivery mode</td>
      <td>Enum (1 or 2)</td>
      <td>
        2 for "persistent", 1 for "transient". Some client libraries expose this property
        as a boolean or enum.
      </td>
      <td>Yes</td>
    </tr>
    <tr>
      <td>Type</td>
      <td>String</td>
      <td>Application-specific message type, e.g. "orders.created"</td>
      <td>No</td>
    </tr>
    <tr>
      <td>Headers</td>
      <td>Map (string => any)</td>
      <td>An arbitrary map of headers with string header names</td>
      <td>No</td>
    </tr>
    <tr>
      <td>Content type</td>
      <td>String</td>
      <td>Content type, e.g. "application/json". Used by applications, not core RabbitMQ</td>
      <td>No</td>
    </tr>
    <tr>
      <td>Content encoding</td>
      <td>String</td>
      <td>Content encoding, e.g. "gzip". Used by applications, not core RabbitMQ</td>
      <td>No</td>
    </tr>
    <tr>
      <td>Message ID</td>
      <td>String</td>
      <td>Arbitrary message ID</td>
      <td>No</td>
    </tr>
    <tr>
      <td>Correlation ID</td>
      <td>String</td>
      <td>Helps correlate requests with responses, see <a href="./getstarted.html">tutorial 6</a></td>
      <td>No</td>
    </tr>
    <tr>
      <td>Reply To</td>
      <td>String</td>
      <td>Carries response queue name, see <a href="./getstarted.html">tutorial 6</a></td>
      <td>No</td>
    </tr>
    <tr>
      <td>Expiration</td>
      <td>String</td>
      <td><a href="./ttl.html">Per-message TTL</a></td>
      <td>No</td>
    </tr>
    <tr>
      <td>Timestamp</td>
      <td>Timestamp</td>
      <td>Application-provided timestamp</td>
      <td>No</td>
    </tr>
    <tr>
      <td>User ID</td>
      <td>String</td>
      <td>User ID, <a href="./validated-user-id.html">validated</a> if set</td>
      <td>No</td>
    </tr>
    <tr>
      <td>App ID</td>
      <td>String</td>
      <td>Application name</td>
      <td>No</td>
    </tr>
  </tbody>
</table>

### Message Types

The type property on messages is an arbitrary string that helps applications communicate what kind
of message that is. It is set by the publishers at the time of publishing.
The value can be any domain-specific string that publishers and consumers agree on.

RabbitMQ does not validate or use this field, it exists for applications and plugins to use
and interpret.

Message types in practice naturally fall into groups, a dot-separated naming convention is
common (but not required by RabbitMQ or clients), e.g. `orders.created` or `logs.line` or `profiles.image.changed`.

If a consumer gets a delivery of a type it cannot handle, it is highly advised to log
such events to make troubleshooting easier.


### Content Type and Encoding

The content (MIME media) type and content encoding fields allow publishers communicate how message payload
should be deserialized and decoded by consumers.

RabbitMQ does not validate or use these fields, it exists for applications and plugins to use
and interpret.

For example, messages with JSON payload [should use `application/json`](http://www.ietf.org/rfc/rfc4627.txt).
If the payload is compressed with the LZ77 (GZip) algorithm, its content encoding should be `gzip`.

Multiple encodings can be specified by separating them with commas.


## <a id="acknowledgement-modes" class="anchor" href="#acknowledgement-modes">Acknowledgement Modes</a>

When registering a consumer applications can choose one of two delivery modes:

 * Automatic (deliveries require no acknowledgement, a.k.a. "fire and forget")
 * Manual (deliveries require client acknowledgement)

Consumer acknowledgements are a subject of a [separate documentation guide](./confirms.html), together with
publisher confirms, a closely related concept for publishers.

## <a id="prefetch" class="anchor" href="#prefetch">Limiting Simultaneous Deliveries with Prefetch</a>

With manual acknowledgement mode consumers have a way of limiting how many deliveries can be "in flight" (in transit
over the network or delivered but unacknowledged). This can avoid consumer overload.

This feature, together with consumer acknowledgements are a subject of a [separate documentation guide](./confirms.html).


## <a id="metrics-capacity" class="anchor" href="#metrics-capacity">The Consumer Capacity Metric</a>

RabbitMQ [management UI](./management.html) as well as [monitoring data](./monitoring.html) endpoints such as that for [Prometheus scraping](./prometheus.html)
display a metric called consumer capacity (previously consumer utilisation) for individual queues.

The metric is computed as a fraction of the time that the queue is able to immediately deliver messages to consumers.
It helps the operator notice conditions where it **may** be worthwhile adding more consumers (application instances)
to the queue.

If this number is less than 100%, the queue leader replica may be able to deliver messages faster if:

 * There were more consumers or
 * The consumers spent less time processing deliveries or
 * The consumer channels used a higher [prefetch value](#prefetch)

Consumer capacity will be 0% for queues that have no consumers. For queues that have online consumers but
no message flow, the value will be 100%: the idea is that any number of consumers can sustain this
kind of delivery rate.

Note that consumer capacity is merely a hint. Consumer applications can and should collect more specific
metrics about their operations to help with sizing and any possible capacity changes.

## <a id="unsubscribing" class="anchor" href="#unsubscribing">Cancelling a Consumer (Unsubscribing)</a>

To cancel a consumer, its identifier (consumer tag) must be known.

After a consumer is cancelled there will be no future deliveries dispatched
to it. Note that there can still be "in flight" deliveries dispatched previously.
Cancelling a consumer will neither discard nor requeue them.

A cancelled consumer will not observe any new deliveries besides those in-flight at
the moment of processing `basic.cancel` method by RabbitMQ. All previously unconfirmed
deliveries will not be affected in any way. To re-queue in-flight deliveries, the
application must close the channel.

### Java Client

See [Java client guide](./api-guide.html#consuming) for examples.

### .NET Client

See [.NET client guide](./dotnet-api-guide.html#consuming) for examples.

## <a id="fetching" class="anchor" href="#fetching">Fetching Individual Messages ("Pull API")</a>

With AMQP 0-9-1 it is possible to fetch messages one by one using the `basic.get` protocol
method. Messages are fetched in the FIFO order. It is possible to use automatic or manual acknowledgements,
just like with consumers (subscriptions).

Fetching messages one by one is **highly discouraged** as it is **very inefficient**
compared to [regular long-lived consumers](#consuming). As with any polling-based algorithm,
it will be **extremely wasteful** in systems where message publishing is sporadic and queues
can stay empty for prolonged periods of time.

When in doubt, prefer using a regular long-lived consumer.

### Java Client

See [Java client guide](./api-guide.html#getting) for examples.

### .NET Client

See [.NET client guide](./dotnet-api-guide.html#basic-get) for examples.


## <a id="acknowledgement-timeout" class="anchor" href="#acknowledgement-timeout">Delivery Acknowledgement Timeout</a>

RabbitMQ enforces a timeout is enforced on consumer delivery acknowledgement.
This is a **protection mechanism** that helps detect buggy (stuck) consumers that never acknowledge deliveries.
Such consumers can affect node's on disk data compaction and potentially drive
nodes out of disk space.

### How it works

If a consumer does not ack its delivery for more than the timeout value (30 minutes by default),
its channel will be closed with a `PRECONDITION_FAILED` channel exception.

The error will be [logged](logging.html) by the node that the consumer was
connected to. All outstanding deliveries on that channel, from all consumers,
will be [requeued](confirms.html#automatic-requeueing).

Whether the timeout should be enforced is evaluated periodically, at one minute intervals.
Values lower than one minute are not supported, and values lower than five minutes
are not recommended.

### Per-node Configuration

The timeout value is configurable in [rabbitmq.conf](./configure.html#config-file) (in milliseconds):

<pre class="lang-ini">
# 30 minutes in milliseconds
consumer_timeout = 1800000
</pre>

<pre class="lang-ini">
# one hour in milliseconds
consumer_timeout = 3600000
</pre>

The timeout can be deactivated using [`advanced.config`](configure.html#advanced-config-file). This is **not recommended**:

<pre class="lang-erlang">
%% advanced.config
[
  {rabbit, [
    {consumer_timeout, undefined}
  ]}
].
</pre>

Instead of disabling the timeout entirely, consider using a high value (for example, a few hours).

### Per-queue Configuration

Starting with RabbitMQ 3.12, the timeout value can also be configured per-queue.

#### Per-queue Delivery Timeouts Using a Policy

Set the `consumer-timeout` policy key.

The value must be in milliseconds.
Whether the timeout should be enforced is evaluated periodically, at one minute intervals.

<pre class="lang-bash">
# override consumer timeout for a group of queues using a policy
rabbitmqctl set_policy queue_consumer_timeout "with_delivery_timeout\.*" '{"consumer-timeout":3600000}' --apply-to classic_queues
</pre>

#### Per-queue Delivery Timeouts Using an Optional Queue Argument

Set the `x-consumer-timeout` [optional queue argument](#optional-arguments) on a queue when the queue is declared.
The timeout is specified in milliseconds.
Whether the timeout should be enforced is evaluated periodically, at one minute intervals.


## <a id="exclusivity" class="anchor" href="#exclusivity">Exclusivity</a>

When registering a consumer with an AMQP 0-9-1 client, [the `exclusive` flag](amqp-0-9-1-reference.html#basic.consume)
can be set to true to request the consumer to be the only one
on the target queue. The call succeeds only if there's no consumer
already registered to the queue at that time. This allows to make sure
only one consumer at a time consumes from the queue.

If the exclusive consumer is cancelled or dies, this is the application
responsibility to register a new one to keep on consuming from the queue.

If exclusive consumption *and* consumption continuity are required,
[single active consumer](#single-active-consumer) may be more appropriate.

## <a id="single-active-consumer" class="anchor" href="#single-active-consumer">Single Active Consumer</a>

Single active consumer allows to have only one consumer
at a time consuming from a queue and to fail over to another registered consumer
in case the active one is cancelled or dies. Consuming with only one consumer
is useful when messages must be consumed and processed in the same order
they arrive in the queue.

A typical sequence of events would be the following:

 * A queue is declared and some consumers register to it at roughly the
 same time.
 * The very first registered consumer become the *single active consumer*:
 messages are dispatched to it and the other consumers are ignored.
 * The single active consumer is cancelled for some reason or simply dies.
 One of the registered consumer becomes the new single active consumer and
 messages are now dispatched to it. In other terms, the queue fails over
 automatically to another consumer.

Note that without the single active consumer feature enabled, messages
would be dispatched to all consumers using round-robin.

Please note: this section covers the single active consumer that's available to AMQP 0-9-1 and AMQP 1.0 clients
on classic and quorum queues. It is not related to [Single Active Consumer on streams](https://rabbitmq.com/streams.html#single-active-consumer).

An attempt to enable SAC using an AMQP 0-9-1 client on a stream **will not work**.
To use SAC on a stream, a [native RabbitMQ stream protocol client](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#single-active-consumer)
must be used.

### Enabling Single Active Consumer on Quorum and Classic Queues

Single active consumer can be enabled when declaring a queue, with the
`x-single-active-consumer` argument set to `true`, e.g. with the Java client:

<pre class="lang-java">
Channel ch = ...;
Map&lt;String, Object&gt; arguments = new HashMap&lt;String, Object&gt;();
arguments.put("x-single-active-consumer", true);
ch.queueDeclare("my-queue", false, false, false, arguments);
</pre>

### Difference from Exclusive Consumers

Compared to [AMQP 0-9-1 exclusive consumer](#exclusivity), single active consumer puts
less pressure on the application side to maintain consumption continuity.
Consumers just need to be registered and failover is handled automatically,
there's no need to detect the active consumer failure and to register
a new consumer.

### Determining Which Consumer is Currently Active

The [management UI](./management.html) and the
[CLI](./rabbitmqctl.8.html) can [report](#active-consumer) which consumer is the current
active one on a queue where the feature is enabled.

### SAC Behavior

Please note the following about single active consumer:

 * There's no guarantee on the selected active consumer, it is
 picked up randomly, even if [consumer priorities](#priority)
 are in use.
 * Trying to register a consumer with the exclusive consume flag set to
 true will result in an error if single active consumer is enabled on
 the queue.
 * Messages are always delivered to the active consumer, even if it is
 too busy at some point. This can happen when using manual acknowledgment
 and `basic.qos`, the consumer may be busy dealing with the maximum number of
 unacknowledged messages it requested with `basic.qos`.
 In this case, the other consumers are ignored and
 messages are enqueued.
 * It is not possible to enable single active consumer with a [policy](https://www.rabbitmq.com/parameters.html#policies).
 Here is the reason why. Policies in RabbitMQ are dynamic by nature, they can
 come and go, enabling and disabling the features they declare. Imagine suddenly
 disabling single active consumer on a queue: the broker would start sending messages to
 inactive consumers and messages would be processed in parallel, exactly
 the opposite of what single active consumer is trying to achieve. As the semantics
 of single active consumer do not play well with the dynamic nature of policies,
 this feature can be enabled only when declaring a queue, with queue arguments.

## <a id="active-consumer" class="anchor" href="#active-consumer">Consumer Activity</a>

The [management UI](./management.html) and the `list_consumers`
[CLI](./rabbitmqctl.8.html#list_consumers) command report an `active`
flag for consumers. The value of this flag depends on several parameters.

 * for classic queues, the flag is always `true`
 when [single active consumer](#single-active-consumer) is not enabled.
 * for quorum queues and when [single active consumer](#single-active-consumer) is not enabled,
 the flag is `true` by default and is set to `false` if the node
 the consumer is connected to is suspected to be down.
 * if [single active consumer](#single-active-consumer) is enabled,
 the flag is set to `true` only for the current single active consumer,
 other consumers on the queue are waiting to be promoted if the active
 one goes away, so their active is set to `false`.

## <a id="priority" class="anchor" href="#priority">Priority</a>

Normally, active consumers connected to a queue receive messages from it in a round-robin fashion.

Consumer priorities allow you to ensure that high priority consumers receive messages while they are active,
with messages only going to lower priority consumers when the high priority consumers are blocked, e.g.
by effective [prefetch](#prefetch) setting.

When consumer priorities are in use, messages are delivered round-robin if multiple active consumers
exist with the same high priority.

Consumer priorities are covered in a [separate guide](./consumer-priority.html).


## <a id="exceptions" class="anchor" href="#exceptions">Exception Handling</a>

Consumers are expected to handle any exceptions that arise during handling of deliveries
or any other consumer operations. Such exceptions should be logged, collected and ignored.

If a consumer cannot process deliveries due to a dependency not being available or similar reasons
it should clearly log so and cancel itself until it is capable of processing deliveries again.
This will make the consumer's unavailability visible to RabbitMQ and [monitoring systems](./monitoring.html).


## <a id="concurrency" class="anchor" href="#concurrency">Concurrency Considerations</a>

Consumer concurrency is primarily a matter of client library implementation details and application
configuration. With most client libraries (e.g. Java, .NET, Go, Erlang) deliveries are dispatched to a thread pool (or similar) that handles
all asynchronous consumer operations. The pool usually has controllable degree of concurrency.

Java and .NET clients guarantee that deliveries on a single channel will be dispatched in the same order there
were received regardless of the degree of concurrency. Note that once dispatched, concurrent
processing of deliveries will result in a natural race condition between the threads doing the processing.

Certain clients (e.g. Bunny) and frameworks might choose to limit consumer dispatch pool to a single thread (or similar)
to avoid a natural race condition when deliveries are processed concurrently. Some applications depend on strictly sequential
processing of deliveries and thus must use concurrency factor of one or handle synchronisation
in their own code. Applications that can process deliveries concurrently can use the degree of concurrency up to
the number of cores available to them.

### Queue Parallelism Considerations

A single RabbitMQ queue is [bounded to a single core](./queues.html#runtime-characteristics). Use more than
one queue to improve CPU utilisation on the nodes. Plugins such as [sharding](https://github.com/rabbitmq/rabbitmq-sharding)
and [consistent hash exchange](https://github.com/rabbitmq/rabbitmq-consistent-hash-exchange) can be helpful
in increasing parallelism.
