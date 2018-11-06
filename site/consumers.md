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

# Consumers

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers various topics related to consumers:

 * [The basics](#basics)
 * [Consumer lifecycle](#consumer-lifecycle)
 * [How to register a consumer](#subscribing) (subscribe, "push API")
 * [Acknowledgement modes](#acknowledgement-modes)
 * [How to limit number of outstanding deliveries with prefetch](#prefetch)
 * [How to cancel a consumer](#unsubscribing)
 * [Fetching individual messages](#fetching) ("pull API")
 * [Consumer exclusivity](#exclusivity)
 * [Consumer priority](#priority)
 * [Concurrency Consideration](#concurrency)

and more.

## <a id="terminology" class="anchor" href="#terminology">Terminology</a>

The term "consumer" means different things in different context. In general in messaging
a consumer is an application (or application instance) that consumes messages. The same
application can also publish messages and thus be a publisher at the same time.

Messaging protocols also have the concept of a lasting subscription for message delivery.
Subscription is one term commonly used to describe such entity. Consumer is another.
Messaging protocols supported by RabbitMQ use both terms but RabbitMQ documentation tends to
prefer the latter.

In this sense a consumer is a subscription for message delivery that has to be
registered before deliveries begin and can be cancelled by the application.

### <a id="consumer-tags" class="anchor" href="#consumer-tags">Consumer Tags</a>

Every consumer has an identifier that is used by client libraries to determine
what handler to invoke for a given delivery. Their names vary from protocol to protocol.
Consumer tags and subscription IDs are two most commonly used terms. RabbitMQ documentation
tends to use the former.

Consumer tags are also used to cancel consumers.

## <a id="basics" class="anchor" href="#basics">The Basics</a>

RabbitMQ is a messaging broker. It accepts published messages, routes them
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

### <a id="consumer-lifecycle" class="anchor" href="#consumer-lifecycle">Consumer Lifecycle</a>

Consumers are meant to be long lived: that is, throughout the lifetime of a consumer it receives
multiple deliveries. Registering a consumer to consume a single message is not optimal.

Consumers are typically registered during application
startup. They often would live as long as their connections or even applications
run.

Consumers can be more dynamic and register in reaction to a system event, unsubscribing
when they are no longer necessary. This is common with WebSocket clients
used via [Web STOMP]() and [Web MQTT]() plugins, mobile clients and so on.

### <a id="connection-recovery" class="anchor" href="#connection-recovery">Connection Recovery</a>

Client can lose their connection to RabbitMQ. When connection loss is [detected](/heartbeats.html),
message delivery stops.

Some client libraries offer automatic connection recovery features that involves consumer recovery.
[Java](/api-guide.html#recovery), [.NET](/dotnet-api-guide.html#recovery) and [Bunny](http://rubybunny.info/articles/error_handling.html) are examples of such libraries.
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

See [Java client guide](/api-guide.html#consuming) for examples.

### .NET Client

See [.NET client guide](/dotnet-api-guide.html#consuming) for examples.

## <a id="acknowledgement-modes" class="anchor" href="#acknowledgement-modes">Acknowledgement Modes</a>

When registering a consumer applications can choose one of two delivery modes:

 * Automatic (deliveries require no acknowledgement, a.k.a. "fire and forget")
 * Manual (deliveries require client acknowledgement)

 Consumer acknowledgements are a subject of a [separate documentation guide](/confirms.html), together with
 publisher confirms, a closely related concept for publishers.

## <a id="prefetch" class="anchor" href="#prefetch">Limiting Simultaneous Deliveries with Prefetch</a>

With manual acknowledgement mode consumer have a way of limiting how many deliveries can be "in flight" (in transit
over the network or delivered but unacknowledged). This can avoid consumer overload.

This feature, together with consumer acknowledgements are a subject of a [separate documentation guide](/confirms.html).

## <a id="unsubscribing" class="anchor" href="#unsubscribing">Cancelling a Consumer (Unsubscribing)</a>

To cancel a consumer its identifier (consumer tag) must be known.

After a consumer is cancelled there will be no future deliveries dispatched
to it. Note that there can still be "in flight" deliveries dispatched previously.
Cancelling a consumer will not discard them.

### Java Client

See [Java client guide](/api-guide.html#consuming) for examples.

### .NET Client

See [.NET client guide](/dotnet-api-guide.html#consuming) for examples.

## <a id="fetching" class="anchor" href="#fetching">Fetching Individual Messages ("Pull API")</a>

With AMQP 0-9-1 it is possible to fetch messages one by one using the `basic.get` protocol
method. Messages are fetched in the FIFO order. It is possible to use automatic or manual acknowledgements,
just like with consumers (subscriptions).

Fetching messages one by one is not necessary in most cases as it is inefficient
and has all the downsides of polling. When in doubt, prefer registering a consumer.

### Java Client

See [Java client guide](/api-guide.html#getting) for examples.

### .NET Client

See [.NET client guide](/dotnet-api-guide.html#getting) for examples.


## <a id="exclusivity" class="anchor" href="#exclusivity">Exclusivity</a>

When registering a consumer with an AMQP 0-9-1 client, [the `exclusive` flag](amqp-0-9-1-reference.html#basic.consume)
can be set to true to request the consumer to be the only one
on the target queue. The call succeeds only if there's no consumer
already registered to the queue at that time. This allows to make sure
only one consumer at a time consumes from the queue.

If the exclusive consumer is cancelled or dies, this is the application
responsibility to register a new one to keep on consuming from the queue.


## <a id="priority" class="anchor" href="#priority">Priority</a>

Normally, active consumers connected to a queue receive messages from it in a round-robin fashion.

Consumer priorities allow you to ensure that high priority consumers receive messages while they are active,
with messages only going to lower priority consumers when the high priority consumers are blocked, e.g.
by effective [prefetch](#prefetch) setting.

When consumer priorities are in use, messages are delivered round-robin if multiple active consumers
exist with the same high priority.

Consumer priorities are covered in a [separate guide](/consumer-priority.html).


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

A single RabbitMQ queue is [bounded to a single core](/queues.html#runtime-characteristics). Use more than
one queue to improve CPU utilisation on the nodes. Plugins such as [sharding](https://github.com/rabbitmq/rabbitmq-sharding)
and [consistent hash exchange](https://github.com/rabbitmq/rabbitmq-consistent-hash-exchange) can be helpful
in increasing parallelism.
