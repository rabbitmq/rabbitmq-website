---
title: AMQP 1.0
---
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

# AMQP 1.0

## Address

An AMQP [address](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-address-string) determines where a message is sent to or consumed from.
What internal object an AQMP address refers to and how an AMQP address is resolved is not defined by the AMQP specification because different AMQP brokers have different models to receive, store, and send messages.

RabbitMQ implements the powerful and flexible [AMQ 0.9.1 model](/tutorials/amqp-concepts) comprising [exchanges](/tutorials/amqp-concepts#exchanges), [queues](/tutorials/amqp-concepts#queues), and [bindings](/tutorials/amqp-concepts#bindings).
Therefore, AMQP clients talking to RabbitMQ send messages to exchanges and consume messages from queues.
Hence, the AMQP addresses that RabbitMQ understands and resolves contain exchange names, queue names, and routing keys.

RabbitMQ 4.0 introduces a new RabbitMQ specific AMQP address format, v2.
The old RabbitMQ 3.x address format is referrered to as v1.

AMQP clients should use address format v2.
Address format v1 is deprecated in RabbitMQ 4.0 and will be unsupported in a future RabbitMQ version.
Whether format v1 is still supported is determined by the [deprecated feature flag](https://github.com/rabbitmq/rabbitmq-server/pull/7390) `amqp_address_v1` whose deprecation phase is `permitted_by_default` in RabbitMQ 4.0.

### Address v2

This section defines the new v2 address formats.
Pull Request [#10873](https://github.com/rabbitmq/rabbitmq-server/pull/10873) explains why v2 was introduced.

#### Target Address v2

The possible v2 [target address](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-target) formats are:
```
1) /exchange/:exchange/key/:routing-key
2) /exchange/:exchange
3) /queue/:queue
4) <null>
```

The first three formats are [strings](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-string).

The 1st format `/exchange/:exchange/key/:routing-key` causes all messages on the given [link](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#section-links) to be sent to exchange `:exchange` with routing key `:routing-key`.

The 2nd format `/exchange/:exchange` causes all messages on the given link to be sent to exchange `:exchange` with the empty routing key `""`.
This is useful for exchange types that ignore the routing key, such as the [fanout](/tutorials/amqp-concepts#exchange-fanout) exchange or the [headers](/tutorials/amqp-concepts#exchange-headers) exchange.

Setting the default exchange `""` in either of the first two formats is disallowed. Instead, use the 3rd format.

The 3rd format `/queue/:queue` causes all messages on the given link to be sent to queue `:queue`.\
If the deprecated feature `amqp_address_v1` is denied, the queue must exist.\
If the deprecated feature `amqp_address_v1` is permitted and the queue does not exist, the queue will be auto-created.\
Internally, this queue target still uses the default exchange. Hence, the user needs write permissions to exchange `amq.default`.

The first 3 formats require the target address to be the same for all messages on the given link.
If different exchanges, routing keys, or queues need to be set for different messages on the same link, use the 4th format.

The 4th format is the AMQP [null](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-null) value.
As explained in the AMQP extension [Using the AMQP Anonymous Terminus for Message Routing](https://docs.oasis-open.org/amqp/anonterm/v1.0/cs01/anonterm-v1.0-cs01.html),
each message's `to` field of the [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties) section must be set.
The allowed `to` address strings must have the same format, i.e. one of
```
1) /exchange/:exchange/key/:routing-key
2) /exchange/:exchange
3) /queue/:queue
```
where the exchange must exist.
If a message cannot be routed because no queue is bound to the exchange, RabbitMQ settles the message with the [released outcome](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-released).

If your publishing application needs to send to a
* single destination: prefer one of the first three string formats over the 4th (null) format as the first three formats provide slightly better performance
* small number of different destinations: prefer opening one link per destination with one of the first three formats
* large number of different destinations: prefer the 4th (null) format defining each destination in the `to` field.

#### Source Address v2

The only valid v2 [source address](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-source) string format is
```
1) /queue/:queue
```
where clients consume messages from queue `:queue`.

If the deprecated feature `amqp_address_v1` is denied, the queue must exist.\
If the deprecated feature `amqp_address_v1` is permitted and the queue does not exist, the queue will be auto-created.

### Address v1

This section lists the **deprecated** v1 address string formats.

#### Target Address v1

```
1) /exchange/:exchange/:routing-key
2) /exchange/:exchange
3) /topic/:routing-key
4) /amq/queue/:queue
5) /queue/:queue
6) :queue
7) /queue
```

The 1st format `/exchange/:exchange/:routing-key` causes all messages on the given link to be sent to exchange `:exchange` with routing key `:routing-key`.
The equivalent v2 format is `/exchange/:exchange/key/:routing-key`.

The 2nd format `/exchange/:exchange` causes all messages on the given link to be sent to exchange `:exchange` while the routing key can optionally be provided in the
message `subject` field of the [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties) section.
In v2, defining different routing keys per message requires setting the target address to the AMQP null value and the message `to` field to `/exchange/:exchange/key/:routing-key`.

The 3rd format `/topic/:routing-key` causes all messages on the given link to be sent to RabbitMQ's default topic exchange called `amq.topic` with topic `routing-key`.
In v2, use `/exchange/amq.topic/key/:routing-key`.

The 4th format `/amq/queue/:queue` causes all messages on the given link to be sent to queue `:queue` (to be more precise, internally, to the default exchange with routing key `:queue`).
Queue `:queue` must exist.
In v2, use `/queue/:queue`.

The 5th format `/queue/:queue` has similar semantics to the 4th format.
However, RabbitMQ will auto declare queue `:queue`, i.e. create such a queue if it doesn't exist.
The queue is never auto deleted by RabbitMQ.
In v2, use `/queue/:queue`.
RabbitMQ 4.0 allows AMQP clients to create RabbitMQ topologies including queues with client defined queue types, properties, and arguments.
Hence, there is no need for RabbitMQ itself to auto declare a specific queue for a given queue target address format.

The 6th format `:queue` is redundant to the 5th format.

The 7th format causes the message to be sent to the queue provided in the message `subject` field.
In v2, to send messages to different queues, set the target address to the AMQP null value and the message `to` field to `/queue/:queue`.

#### Source Address v1

```
1) /exchange/:exchange/:binding-key
2) /topic/:binding-key
3) /amq/queue/:queue
4) /queue/:queue
5) :queue
```

The 1st format `/exchange/:exchange/:binding-key` causes RabbitMQ to declare a queue and bind that queue to exchange `:exchange` with binding key `:binding-key`.
Messages are then consumed from that queue.

The 2nd format `/topic/:binding-key` causes RabbitMQ to declare a queue and bind that queue to the default topic exchange `amq.topic` with topic filter `:binding-key`.
Messages are then consumed from that queue.

The 3rd format `/amq/queue/:queue` causes RabbitMQ to consume from queue `:queue`.
Queue `:queue` must exist.

The 4th format `/queue/:queue` causes RabbitMQ to declare a queue `:queue` and consume from that queue.

The 5th format `:queue` is redundant to the 4th format.

As explained previously, RabbitMQ 4.0 allows AMQP clients to create RabbitMQ topologies including queues with client defined queue types, properties, and arguments.
Hence, there is no need for RabbitMQ itself to auto declare a specific queue for a given queue source address format.
In v2, clients should first declare their own queues and bindings, and then attach with source address `/queue/:queue` which causes the client to consume from that queue.
