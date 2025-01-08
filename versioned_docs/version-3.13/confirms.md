---
title: Consumer Acknowledgements and Publisher Confirms
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

# Consumer Acknowledgements and Publisher Confirms

## Overview {#overview}

This guide covers two related features related to [data safety](./reliability), consumer Acknowledgements
and publisher confirms:

 * [Why acknowledgements exist](#basics)
 * [Manual and automatic](#acknowledgement-modes) acknowledgement modes
 * [Acknowledgement API](#consumer-acks-api-elements), including [multi-acks](#consumer-acks-multiple-parameter) and [requeueing](#consumer-nacks-requeue)
 * [Automatic requeueing](#automatic-requeueing) on connection loss or channel closure
 * [Channel prefetch](#channel-qos-prefetch) and its [effects on throughput](#channel-qos-prefetch-throughput)
 * Most common [client errors](#consumer-acks-double-acking)
 * [Publisher confirms](#publisher-confirms) and related publisher data safety topics

and more. Acknowledgements on both consumer and publisher side are important for
data safety in applications that use messaging.

More related topics are covered in the [Publisher](./publishers) and [Consumer](./consumers) guides.


## The Basics {#basics}

Systems that use a messaging broker such as RabbitMQ are by
definition distributed. Since protocol methods (messages) sent
are not guaranteed to reach the peer or be successfully processed
by it, both publishers and consumers need a mechanism for
delivery and processing confirmation. Several messaging
protocols supported by RabbitMQ provide such features.
This guide covers the features in AMQP 0-9-1 but the idea
is largely the same in other supported protocols.

Delivery processing acknowledgements from [consumers](./consumers) to RabbitMQ
are known as acknowledgements in messaging protocols; broker
acknowledgements to [publishers](./publishers) are a protocol extension called
[publisher confirms](#publisher-confirms).
Both features build on the same idea and are inspired by TCP.

They are essential for reliable delivery both from publishers
to RabbitMQ nodes and from RabbitMQ nodes to consumers. In other words,
they are <strong>essential for data safety</strong>, for which applications are
responsible as much as RabbitMQ nodes are.

### Are Publisher Confirms Related to Consumer Delivery Acknowledgements? {#relation}

[Publisher confirms](#publisher-confirms) and [consumer delivery acknowledgements](#consumer-acknowledgements)
are very similar features that solve similar problems in different contexts:

1. Consumer acknowledgements, as the name suggests, cover RabbitMQ communication with consumers
2. Publisher confirms cover publisher communication with RabbitMQ

The two features, however, are entirely orthogonal and unaware of each other.

**Publisher confirms are not aware of consumers**: they only cover publisher's interactions
with node it is connected to, and the queue (or [stream](./streams)) leader replica.

**Consumer acknowledgements are not aware of publishers**: their goal is to confirm
to a RabbitMQ node that a given delivery was successfully received and processed successfully,
so the delivered message can be marked for future deletion.

Sometimes publishing and consuming applications need to communicate via requests and responses
that need an explicit acknowledgement from the peer. [RabbitMQ tutorial #6](/tutorials)
demonstrates the basics of how that's done, and [Direct Reply-to](./direct-reply-to) provides
a way to do it without declaring a lot of short-lived temporary response queues.

This type of communication, however, is not covered in this guide, and is mentioned only to
contrast it with the much more focussed messaging protocol features described in this guide.


## (Consumer) Delivery Acknowledgements {#consumer-acknowledgements}

When RabbitMQ delivers a message to a consumer, it needs to know
when to consider the message to be successfully sent. What kind of logic is
optimal depends on the system. It is therefore primarily an application
decision. In AMQP 0-9-1 it is made when a consumer is registered using
the `basic.consume` method or a message is fetched on demand
with the `basic.get` method.

If you prefer a more example-oriented and step-by-step material, consumer acknowledgements are
also covered in [RabbitMQ tutorial #2](/tutorials).

### Delivery Identifiers: Delivery Tags {#consumer-acks-delivery-tags}

Before we proceed to discuss other topics it is important to
explain how deliveries are identified (and acknowledgements
indicate their respective deliveries).  When a consumer
(subscription) is registered, messages will be delivered
(pushed) by RabbitMQ using the `basic.deliver`
method.  The method carries a <em>delivery tag</em>, which
uniquely identifies the delivery on a channel. Delivery tags are
therefore scoped per channel.

Delivery tags are monotonically growing positive
integers and are presented as such by client libraries.
Client library methods that acknowledge deliveries take a delivery tag
as an argument.

Because delivery tags are scoped per channel, deliveries must be
acknowledged on the same channel they were received on. Acknowledging
on a different channel will result in an "unknown delivery tag" protocol
exception and close the channel.

### Consumer Acknowledgement Modes and Data Safety Considerations {#acknowledgement-modes}

When a node delivers a message to a consumer, it has to decide whether the
message should be considered handled (or at least received) by the consumer. Since
multiple things (client connections, consumer apps, and so on) can fail,
this decision is a data safety concern. Messaging protocols usually provide
a confirmation mechanism that allows consumers to acknowledge deliveries
to the node they are connected to. Whether the mechanism is used is decided
at the time consumer subscribes.

Depending on the acknowledgement mode used, RabbitMQ can consider a message to be
successfully delivered either immediately after it is sent out (written to a TCP socket)
or when an explicit ("manual") client acknowledgement is received. Manually sent
acknowledgements can be positive or negative and use one of the following protocol methods:

 * `basic.ack` is used for positive acknowledgements
 * `basic.nack` is used for negative acknowledgements (note: this is a [RabbitMQ extension to AMQP 0-9-1](./nack))
 * `basic.reject` is used for negative acknowledgements but has one limitation compared to `basic.nack`

How these methods are exposed in client library APIs will be discussed below.

Positive acknowledgements simply instruct RabbitMQ to record a message as delivered and can be discarded.
Negative acknowledgements with `basic.reject` have the same effect. The difference
is primarily in the semantics: positive acknowledgements assume
a message was successfully processed while their negative counterpart
suggests that a delivery wasn't processed but still should be deleted.

In automatic acknowledgement mode, a message is considered
to be successfully delivered immediately after it is
sent. This mode trades off higher throughput (as long as the
consumers can keep up) for reduced safety of delivery and
consumer processing. This mode is often referred to as
"fire-and-forget".  Unlike with manual acknowledgement
model, if consumers's TCP connection or channel is closed
before successful delivery, the message sent by the server will be lost.
Therefore, automatic message acknowledgement <strong>should be considered unsafe</strong>
and not suitable for all workloads.

Another thing that's important to consider when using
automatic acknowledgement mode is consumer overload.
Manual acknowledgement mode is typically used with a bounded
channel prefetch which limits the number of outstanding ("in progress")
deliveries on a channel. With automatic acknowledgements, however, there is
no such limit by definition. Consumers therefore can be overwhelmed by
the rate of deliveries, potentially accumulating a backlog in memory
and running out of heap or getting their process terminated by the OS.
Some client libraries will apply TCP back pressure (stop reading from the socket
until the backlog of unprocessed deliveries drops beyond a certain limit).
Automatic acknowledgement mode is therefore only recommended for consumers
that can process deliveries efficiently and at a steady rate.

### Positively Acknowledging Deliveries {#consumer-acks-api-elements}

API methods used for delivery acknowledgement are usually exposed as operations on a channel in client libraries.
Java client users will use `Channel#basicAck` and `Channel#basicNack`
to perform a `basic.ack` and `basic.nack`, respectively. Here's a Java
client examples that demonstrates a positive acknowledgement:

```java
// this example assumes an existing channel instance

boolean autoAck = false;
channel.basicConsume(queueName, autoAck, "a-consumer-tag",
     new DefaultConsumer(channel) {
         @Override
         public void handleDelivery(String consumerTag,
                                    Envelope envelope,
                                    AMQP.BasicProperties properties,
                                    byte[] body)
             throws IOException
         {
             long deliveryTag = envelope.getDeliveryTag();
             // positively acknowledge a single delivery, the message will
             // be discarded
             channel.basicAck(deliveryTag, false);
         }
     });
```

In .NET client the methods are `IModel#BasicAck` and `IModel#BasicNack`, respectively.
Here's an example that demonstrates a positive acknowledgement with that client:

```csharp
// this example assumes an existing channel (IModel) instance

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (ch, ea) =>
                {
                    var body = ea.Body.ToArray();
                    // positively acknowledge a single delivery, the message will
                    // be discarded
                    channel.BasicAck(ea.DeliveryTag, false);
                };
String consumerTag = channel.BasicConsume(queueName, false, consumer);
```

### Acknowledging Multiple Deliveries at Once {#consumer-acks-multiple-parameter}

Manual acknowledgements can be batched to reduce network traffic.
This is done by setting the `multiple` field of acknowledgement
methods (see above) to `true`. Note that `basic.reject` doesn't
historically have the field and that's why `basic.nack` was introduced
by RabbitMQ as a protocol extension.

When the `multiple` field is set to `true`, RabbitMQ will acknowledge
all outstanding delivery tags up to and including the tag specified in the
acknowledgement. Like everything else related to acknowledgements, this is scoped per channel.
For example, given that there are delivery tags 5, 6, 7, and 8 unacknowledged on channel `Ch`,
when an acknowledgement frame arrives on that channel with `delivery_tag` set to `8`
and `multiple` set to `true`, all tags from 5 to 8 will be acknowledged.
If `multiple` was set to `false`, deliveries 5, 6, and 7 would still
be unacknowledged.

To acknowledge multiple deliveries with RabbitMQ Java client, pass `true` for the
`multiple` parameter to `Channel#basicAck`:

```java
// this example assumes an existing channel instance

boolean autoAck = false;
channel.basicConsume(queueName, autoAck, "a-consumer-tag",
     new DefaultConsumer(channel) {
         @Override
         public void handleDelivery(String consumerTag,
                                    Envelope envelope,
                                    AMQP.BasicProperties properties,
                                    byte[] body)
             throws IOException
         {
             long deliveryTag = envelope.getDeliveryTag();
             // positively acknowledge all deliveries up to
             // this delivery tag
             channel.basicAck(deliveryTag, true);
         }
     });
```

The idea is very much the same with the .NET client:

```csharp
// this example assumes an existing channel (IModel) instance

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (ch, ea) =>
                {
                    var body = ea.Body.ToArray();
                    // positively acknowledge all deliveries up to
                    // this delivery tag
                    channel.BasicAck(ea.DeliveryTag, true);
                };
String consumerTag = channel.BasicConsume(queueName, false, consumer);
```

### Negative Acknowledgement and Requeuing of Deliveries {#consumer-nacks-requeue}

Sometimes a consumer cannot process a delivery immediately but other instances might
be able to. In this case it may be desired to requeue it and let another consumer receive
and handle it. `basic.reject` and `basic.nack` are two protocol
methods that are used for that.

The methods are generally used to negatively acknowledge a delivery. Such deliveries can
be discarded or dead-lettered or requeued by the broker. This behaviour is controlled by the `requeue` field.
When the field is set to `true`, the broker will requeue the delivery (or multiple
deliveries, as will be explained shortly) with the specified delivery tag.
Alternatively, when this field is set to `false`, the message will be routed to a [Dead Letter Exchange](./dlx) if it
is configured, otherwise it will be discarded.

Both methods are usually exposed as operations on a channel in client libraries. Java
client users will use `Channel#basicReject` and `Channel#basicNack`
to perform a `basic.reject` and `basic.nack`, respectively:

```java
// this example assumes an existing channel instance

boolean autoAck = false;
channel.basicConsume(queueName, autoAck, "a-consumer-tag",
     new DefaultConsumer(channel) {
         @Override
         public void handleDelivery(String consumerTag,
                                    Envelope envelope,
                                    AMQP.BasicProperties properties,
                                    byte[] body)
             throws IOException
         {
             long deliveryTag = envelope.getDeliveryTag();
             // negatively acknowledge, the message will
             // be discarded
             channel.basicReject(deliveryTag, false);
         }
     });
```

```java
// this example assumes an existing channel instance

boolean autoAck = false;
channel.basicConsume(queueName, autoAck, "a-consumer-tag",
     new DefaultConsumer(channel) {
         @Override
         public void handleDelivery(String consumerTag,
                                    Envelope envelope,
                                    AMQP.BasicProperties properties,
                                    byte[] body)
             throws IOException
         {
             long deliveryTag = envelope.getDeliveryTag();
             // requeue the delivery
             channel.basicReject(deliveryTag, true);
         }
     });
```

In .NET client the methods are `IModel#BasicReject` and `IModel#BasicNack`,
respectively:

```csharp
// this example assumes an existing channel (IModel) instance

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (ch, ea) =>
                {
                    var body = ea.Body.ToArray();
                    // negatively acknowledge, the message will
                    // be discarded
                    channel.BasicReject(ea.DeliveryTag, false);
                };
String consumerTag = channel.BasicConsume(queueName, false, consumer);
```

```csharp
// this example assumes an existing channel (IModel) instance

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (ch, ea) =>
                {
                    var body = ea.Body.ToArray();
                    // requeue the delivery
                    channel.BasicReject(ea.DeliveryTag, true);
                };
String consumerTag = channel.BasicConsume(queueName, false, consumer);
```

When a message is requeued, it will be placed to its original
position in its queue, if possible. If not (due to concurrent
deliveries and acknowledgements from other consumers when
multiple consumers share a queue), the message will be requeued
to a position closer to queue head.

Requeued messages may be immediately ready for redelivery depending
on their position in the queue and the prefetch value used by the channels
with active consumers. This means that if all consumers requeue because
they cannot process a delivery due to a transient condition, they will
create a requeue/redelivery loop. Such loops can be costly in terms of
network bandwidth and CPU resources. Consumer implementations can track
the number of redeliveries and reject messages for good (discard them)
or schedule requeueing after a delay.

It is possible to reject or requeue multiple messages at once using the `basic.nack`
method. This is what differentiates it from `basic.reject`. It accepts an additional
parameter, `multiple`. Here's a Java client example:

```java
// this example assumes an existing channel instance

boolean autoAck = false;
channel.basicConsume(queueName, autoAck, "a-consumer-tag",
     new DefaultConsumer(channel) {
         @Override
         public void handleDelivery(String consumerTag,
                                    Envelope envelope,
                                    AMQP.BasicProperties properties,
                                    byte[] body)
             throws IOException
         {
             long deliveryTag = envelope.getDeliveryTag();
             // requeue all unacknowledged deliveries up to
             // this delivery tag
             channel.basicNack(deliveryTag, true, true);
         }
     });
```

Things work very similarly with .NET client:

```csharp
// this example assumes an existing channel (IModel) instance

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (ch, ea) =>
                {
                    var body = ea.Body.ToArray();
                    // requeue all unacknowledged deliveries up to
                    // this delivery tag
                    channel.BasicNack(ea.DeliveryTag, true, true);
                };
String consumerTag = channel.BasicConsume(queueName, false, consumer);
```

### Channel Prefetch Setting (QoS) {#channel-qos-prefetch}

Messages are delivered (sent) to clients
asynchronously, and there can be more than one message "in
flight" on a channel at any given moment. Manual acknowledgements
from clients are also inherently asynchronous in nature but
flow in the opposite direction.

This means a sliding window of deliveries that are unacknowledged.

For most consumers, it makes sense to limit the size of this window to avoid the
unbounded buffer (heap) growth problem on the consumer end.
This is done by setting a "prefetch count" value using the
`basic.qos` method. The value defines the max
number of unacknowledged deliveries that are permitted on a
channel. When the number reaches the configured count,
RabbitMQ will stop delivering more messages on the channel
until at least one of the outstanding ones is acknowledged.

A value of `0` means "no limit", allowing any number
of unacknowledged messages.

For example, given that there are four deliveries with delivery tags 5, 6, 7, and
8 unacknowledged on channel `Ch` and channel
`Ch`'s prefetch count is set to 4, RabbitMQ will
not push any more deliveries on `Ch` unless at
least one of the outstanding deliveries is acknowledged.

When an acknowledgement frame arrives on that channel with
`delivery_tag` set to `5` (or `6`, `7`, or `8`),
RabbitMQ will notice and deliver one more message.
Acknowledging [multiple messages at once](#consumer-acks-multiple-parameter)
will make more than one message available for delivery.

It's worth reiterating that the flow of deliveries and
manual client acknowledgements is entirely
asynchronous. Therefore if the prefetch value is changed while
there already are deliveries in flight, a natural race
condition arises and there can temporarily be more than
prefetch count unacknowledged messages on a channel.

#### Per-channel, Per-consumer and Global Prefetch

The QoS setting can be configured for a specific channel or a specific consumer.
The [Consumer Prefetch](./consumer-prefetch) guide explains
the effects of this scoping.

#### Prefetch and Polling Consumers

The QoS prefetch setting has no effect on messages fetched using the `basic.get`
("pull API"), even in manual confirmation mode.

### Consumer Acknowledgement Modes, Prefetch and Throughput {#channel-qos-prefetch-throughput}

Acknowledgement mode and QoS prefetch value have significant
effect on consumer throughput. In general, increasing
prefetch will improve the rate of message delivery to
consumers. Automatic acknowledgement mode yields best
possible rate of delivery. However, in both cases the number
of delivered but not-yet-processed messages will also
increase, thus increasing consumer RAM consumption.

Automatic acknowledgement mode or manual acknowledgement mode with unlimited prefetch should be used with care.
Consumers that consume a lot of messages without acknowledging will lead
to memory consumption growth on the node they are connected to. Finding
a suitable prefetch value is a matter of trial and error and will vary from
workload to workload. Values in the 100 through 300 range usually offer
optimal throughput and do not run significant risk of overwhelming consumers.
Higher values often [run into the law of diminishing returns](/blog/2014/04/14/finding-bottlenecks-with-rabbitmq-3-3).

Prefetch value of 1 is the most conservative. It will
significantly reduce throughput, in particular in
environments where consumer connection latency is high. For
many applications, a higher value would be appropriate and
optimal.

### When Consumers Fail or Lose Connection: Automatic Requeueing {#automatic-requeueing}

When manual acknowledgements are used, any delivery
(message) that was not acked is automatically requeued when
the channel (or connection) on which the delivery happened
is closed. This includes TCP connection loss by clients,
consumer application (process) failures, and channel-level
protocol exceptions (covered below).

Note that it takes a period of time to [detect an unavailable client](./heartbeats).

Due to this behavior, consumers must be prepared to handle redeliveries and otherwise
be implemented with [idempotence](https://en.wikipedia.org/wiki/Idempotence) in mind.
Redeliveries will have a special boolean property, `redeliver`, set to `true`
by RabbitMQ. For first time deliveries it will be set to `false`. Note that
a consumer can receive a message that was previously delivered to another consumer.

### Client Errors: Double Acking and Unknown Tags {#consumer-acks-double-acking}

Should a client acknowledge the same delivery tag more than once,
RabbitMQ will result a channel error such as `PRECONDITION_FAILED - unknown delivery tag 100`.
The same channel exception will be thrown if an unknown delivery tag is used.

Another scenario in which the broker will complain about an "unknown delivery tag" is when
an acknowledgement, whether positive or negative, is attempted on a channel different from
that on which the delivery was received on. Deliveries must be acknowledged on the same
channel.


## Publisher Confirms {#publisher-confirms}

Networks can fail in less-than-obvious ways and detecting some failures [takes time](./heartbeats).
Therefore a client that's written a protocol frame or a set of frames (e.g. a published message) to
its socket cannot assume that the message has reached the server and was successfully processed.
It could have been lost along the way or its delivery can be significantly delayed.

Using standard AMQP 0-9-1, the only way to guarantee that a
message isn't lost is by using transactions -- make the
channel transactional then for each message or set of messages publish, commit.
In this case, transactions are unnecessarily heavyweight and
decrease throughput by a factor of 250.  To remedy this,
a confirmation mechanism was introduced. It mimics the consumer
acknowledgements mechanism already present in the protocol.

To enable confirms, a client sends the
`confirm.select` method.  Depending on whether
`no-wait` was set or not, the broker may respond
with a `confirm.select-ok`.  Once the
`confirm.select` method is used on a channel, it
is said to be in confirm mode.  A transactional channel
cannot be put into confirm mode and once a channel is in
confirm mode, it cannot be made transactional.

Once a channel is in confirm mode, both the broker and the
client count messages (counting starts at 1 on the first
`confirm.select`).  The broker then confirms
messages as it handles them by sending a
`basic.ack` on the same channel. The
`delivery-tag` field contains the sequence number
of the confirmed message.  The broker may also set the
`multiple` field in `basic.ack` to
indicate that all messages up to and including the one with
the sequence number have been handled.

### Negative Acknowledgments for Publishes {#server-sent-nacks}

In exceptional cases when the broker is unable to handle
messages successfully, instead of a `basic.ack`,
the broker will send a `basic.nack`.  In this
context, fields of the `basic.nack` have the same
meaning as the corresponding ones in `basic.ack`
and the `requeue` field should be ignored.  By
nack'ing one or more messages, the broker indicates that it
was unable to process the messages and refuses responsibility
for them; at that point, the client may choose to re-publish
the messages.

After a channel is put into confirm mode, all subsequently
published messages will be confirmed or nack'd once.  No
guarantees are made as to how soon a message is confirmed.
No message will be both confirmed and nack'd.

`basic.nack` will only be delivered if an internal
error occurs in the Erlang process responsible for a queue.

### When Will Published Messages Be Confirmed by the Broker? {#when-publishes-are-confirmed}

For unroutable messages, the broker will issue a confirm
once the exchange verifies a message won't route to any queue
(returns an empty list of queues). If the message is also
published as mandatory, the `basic.return` is sent
to the client before `basic.ack`. The same
is true for negative acknowledgements (`basic.nack`).

For routable messages, the `basic.ack` is sent when a
message has been accepted by all the queues. For persistent
messages routed to durable queues, this <strong>means persisting
to disk</strong>. For [quorum queues](./quorum-queues),
this means that a quorum replicas have accepted and confirmed
the message to the elected leader.

### Ack Latency for Persistent Messages {#publisher-confirms-latency}

`basic.ack` for a persistent message routed to a
durable queue will be sent after persisting the message to
disk. The RabbitMQ message store persists messages to disk in
batches after an interval (a few hundred milliseconds) to
minimise the number of fsync(2) calls, or when a queue is idle.

This means that under a constant load, latency for
`basic.ack` can reach a few hundred milliseconds. To
improve throughput, applications are strongly advised to
process acknowledgements asynchronously (as a stream) or publish
batches of messages and wait for outstanding confirms. The exact
API for this varies between client libraries.

### Ordering Considerations for Publisher Confirms {#publisher-confirms-ordering}

In most cases, RabbitMQ will acknowledge messages to
publishers in the same order they were published (this
applies for messages published on a single
channel). However, publisher acknowledgements are emitted
asynchronously and can confirm a single message or a group
of messages. The exact moment when a confirm is emitted
depends on the delivery mode of a message (persistent
vs. transient) and the properties of the queue(s) the
message was routed to (see above). Which is to say that
different messages can be considered ready for
acknowledgement at different times. This means that
acknowledgements can arrive in a different order compared to
their respective messages. Applications should not depend on
the order of acknowledgements when possible.

### Publisher Confirms and Guaranteed Delivery {#publisher-confirms-and-guaranteed-delivery}

A RabbitMQ node can lose persistent messages if it fails before
said messages are written to disk. For instance, consider this scenario:

1. a client publishes a persistent message to a durable queue
2. a client consumes the message from the queue (noting that the message is persistent and the queue durable), but confirms are not active,
3. the broker node fails and is restarted, and
4. the client reconnects and starts consuming messages

At this point, the client could reasonably assume that the
message will be delivered again.  This is not the case: the
restart has caused the broker to lose the message.  In order to
guarantee persistence, a client should use confirms.  If the
publisher's channel had been in confirm mode, the publisher
would <em>not</em> have received an ack for the lost message
(since the message hadn't been written to disk yet).


## Limitations {#limitations}

### Maximum Delivery Tag {#publisher-confirms-and-guaranteed-delivery}

Delivery tag is a 64 bit long value, and thus its maximum value
is `9223372036854775807`. Since delivery tags are scoped per channel,
it is very unlikely that a publisher or consumer will run over this
value in practice.
