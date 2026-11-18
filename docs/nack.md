---
title: Negative Acknowledgements
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

# Negative Acknowledgements

## Overview {#overview}

Consumers in AMQP 0-9-1 can choose to use [manual acknowledgements](./confirms)
of deliveries.

The [AMQP 0-9-1 specification](./specification) defines the `basic.reject`
method that allows clients to reject individual, delivered
messages, instructing the broker to either discard them or
requeue them. Unfortunately, `basic.reject`
provides no support for negatively acknowledging messages in
bulk.

To solve this, RabbitMQ supports the `basic.nack`
method that allows for bulk processing of messages.

The two methods are not interchangeable: for [quorum queues](./quorum-queues),
only `basic.reject` counts towards the delivery limit.
See [`basic.reject` vs. `basic.nack`](#reject-vs-nack) below.

## `basic.reject` vs. `basic.nack` {#reject-vs-nack}

While both methods can dead-letter/discard or requeue messages, they have a semantic difference
related to [poison message handling](./quorum-queues#poison-message-handling):

 * `basic.reject` signals that message processing **failed**. Using this method increments the message's
    [delivery-count header](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-header).
 * `basic.nack` signals that the consumer did not process the message, but does **not** count this as failure.
    Using this method does **not** increment the delivery-count header.

This distinction is important for [quorum queues](./quorum-queues), which support poison message handling:
when a message's delivery-count exceeds the queue's configured [delivery-limit](./quorum-queues#poison-message-handling-configuring-limit)
(default: 20), the message is dead-lettered or discarded.

When a message is requeued using `basic.reject`, both its `delivery-count` and `acquired-count`
are incremented. When a message is requeued using `basic.nack`, only its `acquired-count` is incremented,
so repeatedly requeueing a message with `basic.nack` never causes it to reach the delivery limit.
See [When is delivery count incremented?](./quorum-queues#when-is-delivery-count-incremented)
for the full list of triggers.

Applications that rely on the delivery limit to dead-letter messages that repeatedly fail processing
should use `basic.reject` with the `requeue` flag set to `true`.

## Usage {#usage}

To reject messages in bulk, clients set the `multiple` flag of the `basic.nack`
method to `true`. The broker will then reject all
unacknowledged, delivered messages up to and including the
message specified in the `delivery_tag` field of the `basic.nack` method. In this respect,
`basic.nack` complements the bulk acknowledgement semantics of `basic.ack`.
Messages requeued this way do not count towards the quorum queue delivery limit.

Negative acknowledgements work for both [long running consumers](./consumers)
and polling-based ones (that use `basic.get`).

When a message is requeued, it will be placed to its original
position in its queue, if possible. If not (due to concurrent
deliveries and acknowledgements from other consumers when
multiple consumers share a queue), the message will be requeued
to a position closer to queue head.

## Examples {#examples}

### Java {#java-examples}

This Java client example rejects a single message consumed via polling (`basic.get`),
asking the broker to requeue it. For quorum queues, this counts towards the delivery limit:

```java
GetResponse gr = channel.basicGet("some.queue", false);
channel.basicReject(gr.getEnvelope().getDeliveryTag(), true);
```

This example negatively acknowledges two messages with a single call to
the broker (the second argument on
`basicNack` is the `multiple` flag). For quorum queues, these returns
do not count towards the delivery limit:

```java
GetResponse gr1 = channel.basicGet("some.queue", false);
GetResponse gr2 = channel.basicGet("some.queue", false);
channel.basicNack(gr2.getEnvelope().getDeliveryTag(), true, true);
```
