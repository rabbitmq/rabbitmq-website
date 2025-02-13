---
title: AMQP 1.0
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

# AMQP 1.0

[AMQP 1.0](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html) is supported [natively](/blog/2024/08/05/native-amqp) since RabbitMQ 4.0.

## Version Negotiation

RabbitMQ natively supports both AMQP 1.0 and AMQP 0.9.1 out of the box, without requiring any additional plugins.

By default, RabbitMQ [listens on port](./networking#ports) 5672, accepting [connections](./connections) for both AMQP 1.0 and AMQP 0.9.1.

After establishing a TCP or TLS connection and before sending any AMQP frames, the client sends a protocol header indicating whether it wants to use AMQP 1.0 or AMQP 0.9.1, as outlined in [Section 2.2 Version Negotiation](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#section-version-negotiation).

For AMQP 1.0 connections, RabbitMQ requires the use of Simple Authentication and Security Layer ([SASL](https://datatracker.ietf.org/doc/html/rfc4422)), as described in [Section 5.3 SASL](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-security-v1.0-os.html#section-sasl).
If the client does not use SASL, RabbitMQ will reject the connection, as illustrated in [Figure 2.13: Protocol ID Rejection Example](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#section-version-negotiation).

## Protocol Interoperability

RabbitMQ supports publishing and consuming messages across different protocols, which requires [protocol conversions](./conversions).

When a message is published using AMQP 1.0, all target queue types ([classic queues](./classic-queues), [quorum queues](./quorum-queues), and [streams](./streams)) store the message in its original AMQP 1.0 format.
If the message is later consumed using AMQP 1.0, no protocol conversion is necessary.
Additionally, as mandated by the AMQP 1.0 specification, RabbitMQ ensures the immutability of the [bare message](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#section-message-format).
This allows clients to set message hashes, checksums, and digital signatures not only over the message body but also over the [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties) and [application-properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-application-properties) sections.

## Virtual Hosts

RabbitMQ supports logical multi-tenancy with [virtual hosts](./vhosts).

If no virtual host was explicitly specified by the connecting application, the connection use the `default_vhost` configured in [rabbitmq.conf](./configure#config-file):

``` ini
default_vhost = /
```

AMQP 1.0 clients can connect to a different [virtual host](./vhosts) by prefixing the value of the `hostname` field in the [open](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#type-open)
frame with `vhost:`.

For example, to connect to a virtual host called `tenant-1`, the client sets the `hostname` field to `vhost:tenant-1`.

## Addresses

An AMQP 1.0 [address](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-address-string) determines where a message is sent to or consumed from.
What internal object an AMQP address refers to and how an AMQP address is resolved is not defined by the AMQP 1.0 specification.
Different AMQP 1.0 brokers can choose to interpret the provided address differently.

RabbitMQ implements the powerful and flexible [AMQ 0.9.1 model](/tutorials/amqp-concepts) comprising [exchanges](/tutorials/amqp-concepts#exchanges), [queues](/tutorials/amqp-concepts#queues), and [bindings](/tutorials/amqp-concepts#bindings).
Therefore, AMQP clients talking to RabbitMQ send messages to exchanges and consume messages from queues.
Hence, the AMQP addresses that RabbitMQ understands and resolves contain exchange names, queue names, and routing keys.

RabbitMQ 4.0 introduces a new RabbitMQ specific AMQP address format, v2.
The old RabbitMQ 3.x address format is referred to as v1.

:::important

AMQP clients should use address format v2.

:::

Address format v1 is deprecated in RabbitMQ 4.0 and will be unsupported in a future RabbitMQ version.
Whether format v1 is still supported is determined by the [deprecated feature flag](https://github.com/rabbitmq/rabbitmq-server/pull/7390) `amqp_address_v1` whose deprecation phase is `permitted_by_default` in RabbitMQ 4.0.

### Address v2

This section defines the new v2 address formats.

#### Target Address v2

The possible v2 [target address](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-target) formats are:


1. `/exchanges/:exchange/:routing-key`
2. `/exchanges/:exchange`
3. `/queues/:queue`
4. `<null>`

The first three formats are [strings](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-string).

The 1st format `/exchanges/:exchange/:routing-key` causes all messages on the given [link](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#section-links) to be sent to exchange `:exchange` with routing key `:routing-key`.

The 2nd format `/exchanges/:exchange` causes all messages on the given link to be sent to exchange `:exchange` with the empty routing key `""`.
This is useful for exchange types that ignore the routing key, such as the [fanout](/tutorials/amqp-concepts#exchange-fanout) exchange or the [headers](/tutorials/amqp-concepts#exchange-headers) exchange.

Setting the default exchange `""` in either of the first two formats is disallowed. Instead, use the 3rd format.

The 3rd format `/queues/:queue` causes all messages on the given link to be sent to queue `:queue`.\
The queue must exist.
Internally, this queue target still uses the default exchange. Hence, the user needs write permissions to exchange `amq.default`.

The first 3 formats require the target address to be the same for all messages on the given link.
If different exchanges, routing keys, or queues need to be set for different messages on the same link, use the 4th format.

The 4th format is the AMQP [null](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-null) value.
As explained in the AMQP extension [Using the AMQP Anonymous Terminus for Message Routing](https://docs.oasis-open.org/amqp/anonterm/v1.0/cs01/anonterm-v1.0-cs01.html),
each message's `to` field of the [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties) section must be set.
The allowed `to` address strings must have the same format, i.e. one of

1. `/exchanges/:exchange/:routing-key`
2. `/exchanges/:exchange`
3. `/queues/:queue`

where the exchange must exist.

If a message [cannot be routed](./publishers#unroutable), for example, because no queue is bound to the target exchange,
RabbitMQ settles the message with the [`released` outcome](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-released).

If a publishing application needs to publish (send) messages to

* a single destination: prefer one of the first three string formats over the 4th (null) format as the first three formats provide slightly better performance
* a small number of different destinations: prefer opening one link per destination with one of the first three formats
* a large number of different destinations: prefer the 4th (null) format defining each destination in the `to` field

#### Source Address v2

The only valid v2 [source address](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-source) string format is

1. `/queues/:queue`

where clients consume messages from queue `:queue`.
The queue must exist.

#### Percent-encoding

Address format v2 requires exchange names, routing keys, and queue names to be percent-encoded according to [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986#section-2.1).

For example, a client that wants to send to exchange `amq.direct` with routing key `my-routing_key/123` must use target address `/exchanges/amq.direct/my-routing_key%2F123`.

Note that percent-encoding in address format v2 must be applied to all AMQP fields that require an `address`:
* `address` field in [target](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-target)
* `address` field in [source](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-source)
* `to` field in message [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties)
* `reply-to` field in message [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties)

### Address v1

:::warning

This section lists the **deprecated** v1 address string formats.

:::

#### Target Address v1

1. `/exchange/:exchange/:routing-key`
2. `/exchange/:exchange`
3. `/topic/:routing-key`
4. `/amq/queue/:queue`
5. `/queue/:queue`
6. `:queue`
7. `/queue`

The 1st format `/exchange/:exchange/:routing-key` causes all messages on the given link to be sent to exchange `:exchange` with routing key `:routing-key`.
The equivalent v2 format is `/exchanges/:exchange/:routing-key`.

The 2nd format `/exchange/:exchange` causes all messages on the given link to be sent to exchange `:exchange` while the routing key can optionally be provided in the
message `subject` field of the [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties) section.
In v2, defining different routing keys per message requires setting the target address to the AMQP null value and the message `to` field to `/exchanges/:exchange/:routing-key`.

The 3rd format `/topic/:routing-key` causes all messages on the given link to be sent to RabbitMQ's default topic exchange called `amq.topic` with topic `routing-key`.
In v2, use `/exchanges/amq.topic/:routing-key`.

The 4th format `/amq/queue/:queue` causes all messages on the given link to be sent to queue `:queue` (to be more precise, internally, to the default exchange with routing key `:queue`).
Queue `:queue` must exist.
In v2, use `/queues/:queue`.

The 5th format `/queue/:queue` has similar semantics to the 4th format.
However, RabbitMQ will auto declare queue `:queue`, i.e. create such a queue if it doesn't exist.
The queue is never auto deleted by RabbitMQ.
In v2, use `/queues/:queue`.
RabbitMQ 4.0 allows AMQP clients to create RabbitMQ topologies including queues with client defined queue types, properties, and arguments.
Hence, there is no need for RabbitMQ itself to auto declare a specific queue for a given queue target address format.

The 6th format `:queue` is redundant to the 5th format.

The 7th format causes the message to be sent to the queue provided in the message `subject` field.
In v2, to send messages to different queues, set the target address to the AMQP null value and the message `to` field to `/queues/:queue`.

#### Source Address v1

1. `/exchange/:exchange/:binding-key`
2. `/topic/:binding-key`
3. `/amq/queue/:queue`
4. `/queue/:queue`
5. `:queue`

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
In v2, clients should first declare their own queues and bindings, and then attach with source address `/queues/:queue` which causes the client to consume from that queue.

## Message Annotations

When a message is delivered to a consumer, RabbitMQ sets at least the following two [message annotations](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-message-annotations):
* `x-exchange` set to the [exchange](/tutorials/amqp-concepts#exchanges) this message was originally published to.
* `x-routing-key` set to the routing key this message was originally published with.

These message annotations are derived in different ways depending on how the message was originally sent to RabbitMQ. For example, they could be derived from:
* The `address` field of the [target](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-target) an AMQP 1.0 publisher attached to.
* The `to` field of the AMQP 1.0 message [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties) section.
* The `exchange` and `routing_key` fields of the AMQP 0.9.1 `basic.publish` frame, if the message was originally published with AMQP 0.9.1.
* The [topic name](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901107) of an MQTT PUBLISH packet, if the message was originally published with MQTT.
* The name of the [stream](./streams), if the message was originally published with the [RabbitMQ stream protocol](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_stream/docs/PROTOCOL.adoc).

However, AMQP 1.0 clients should not publish messages with message annotations `x-exchange` or `x-routing-key` to RabbitMQ.
RabbitMQ will not interpret them.
Instead, if an AMQP 1.0 client wants to re-publish a message to the original exchange with the original routing key, the [address](#addresses) should be set accordingly.

## Outcomes

An [outcome](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#section-delivery-state) indicates the result of delivery (message)
processing at the receiver.

The following table describes the outcomes when the client is the sender/publisher/producer with RabbitMQ acting as the receiver:

| AMQP 1.0 Outcome | Equivalent AMQP 0.9.1 Frame | Description |
| --- | --- | --- |
| [Accepted](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-accepted) | `basic.ack` | **All** queues the message was routed to have accepted the message. For example for [quorum queues](./quorum-queues), this means a majority of quorum queue replicas have written the message to disk. The publisher can therefore forget/delete the message. |
| [Rejected](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-rejected) | `basic.nack` | At least one queue the message was routed to rejected the message. This happens when the [queue length](./maxlength) is exceeded and the queue's [overflow](./maxlength#overflow-behaviour) behaviour is set to `reject-publish` or when a target [classic queue](./classic-queues) is unavailable.<br/>RabbitMQ also rejects messages as specified in [Using the AMQP Anonymous Terminus for Message Routing](https://docs.oasis-open.org/amqp/anonterm/v1.0/cs01/anonterm-v1.0-cs01.html#doc-routingerrors), for example if a message's `to` field of the [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties) section contains an invalid address or defines a non-existing exchange. |
| [Released](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-released) | `basic.return` (followed by `basic.ack` or `basic.nack`) | RabbitMQ could not route the message to any queue. This indicates a topology misconfiguration, for example when no matching queue is bound to the target exchange. |
| [Modified](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-modified) | | Currently, RabbitMQ does not settle a message with the modified outcome. |

The following table describes the outcomes when the client is the receiver/consumer with RabbitMQ acting as the sender:

| AMQP 1.0 Outcome | Equivalent AMQP 0.9.1 Frame | Description |
| --- | --- | --- |
| [Accepted](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-accepted) | `basic.ack` | The consumer successfully processed the message. RabbitMQ can therefore delete the message. |
| [Rejected](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-rejected) | `basic.nack` or `basic.reject` with `requeue=false` | The consumer indicates that the message is invalid and unprocessable. RabbitMQ [dead letters](./dlx) the message (or drops the message if dead lettering is not configured). |
| [Released](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-released) | `basic.nack` or `basic.reject` with `requeue=true` | The consumer did not process the message. RabbitMQ requeues the message. The message will be delivered to the same or a different consumer. |
| [Modified](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-modified) | | The consumer did not process the message, but modified [message annotations](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-message-annotations).<br/>If `undeliverable-here=true`, RabbitMQ dead letters the message (or drops the message if dead lettering is not configured).<br/>If `undeliverable-here=false`, RabbitMQ requeues the message.<br/>See [below](#modified-outcome) for more information. |

## AMQP 1.0 vs. AMQP 0.9.1

As the name suggests, AMQP 1.0 is the more modern protocol.
It is an [ISO/IEC 19464](https://www.iso.org/standard/64955.html) and [OASIS](https://www.amqp.org/node/102) standard, whereas AMQP 0.9.1 is not an official standard.
For a more detailed comparison of the protocols, refer to our [AMQP 1.0 blog posts](/blog/tags/amqp-1-0).

Choosing the right protocol depends on several factors, including:
* **Feature Requirements**: Whether you need specific features of AMQP 1.0 or AMQP 0.9.1.
* **Interoperability**: If interoperability with other message brokers is important, note that more brokers support AMQP 1.0 than AMQP 0.9.1.
* **Client Library Availability**: Whether supported [client libraries](#clients) are available for your programming language.

### AMQP 1.0 Features

This section lists features that RabbitMQ supports exclusively in AMQP 1.0, which are not available in AMQP 0.9.1:
* **Fine Granular Flow Control** as explained in the blog post [Ten Benefits of AMQP 1.0 Flow Control](/blog/2024/09/02/amqp-flow-control):
  * A consuming client application can dynamically adjust and prioritize how many messages it wants to receive from specific source queues.
  * Safe and efficient use of a single AMQP connection for both publishing and consuming.
  * When one target queue is overloaded, publishers can continue sending at high speed to other target queues, and consumers can continue receiving at high speed from other source queues on the same AMQP connection.
  * Consumers can be stopped or paused and later resumed.
  * Graceful handoff from one [single active consumer](./consumers#single-active-consumer) to the next, while maintaining message order.
  * The source queue can efficiently inform the consumer about an approximate number of available messages.
* **Queue Locality**: RabbitMQ can provide up-to-date queue topology and leader information to clients.
  * For example, the [RabbitMQ AMQP 1.0 Java client](https://github.com/rabbitmq/rabbitmq-amqp-java-client) can leverage this information by trying to consume "locally" from a RabbitMQ node that hosts a queue replica and trying to publish "locally" to a node that hosts the queue leader.
  * This can result in lower intra-cluster traffic, reducing latency and increasing throughput.
* **[Sender Settle Mode](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#type-sender-settle-mode) `mixed`**: Allows a publisher to decide on a per-message basis whether to receive [confirmations](./confirms#publisher-confirms) from the broker.
* **[Modified Outcome](#modified-outcome)**: Allows a quorum queue consumer to add and modify [message annotations](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-message-annotations) when requeueing or dead lettering a message.
* **Well defined [types](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html)**
* **Better defined [message headers](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#section-message-format)**
* **Enhanced Message Integrity**: Clients can set message hashes, checksums, and digital signatures not only over the message body but also over the [properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-properties) and [application-properties](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-application-properties) sections, as the bare message is immutable.
* **Stream Message Fidelity**: No loss of headers fidelity when storing or retrieving a message from a [stream](./streams), since streams store messages in AMQP 1.0 encoded format.

### AMQP 0.9.1 Features
This section lists features that RabbitMQ supports exclusively in AMQP 0.9.1, which are currently not available in AMQP 1.0:
* **[Transactions](./semantics)**: AMQP 0.9.1 provides limited support, whereas AMQP 1.0 currently does not support transactions (as listed in the [limitations](#limitations)).
* **[Direct Reply-to](./direct-reply-to)**: While AMQP 1.0 clients can still perform Remote Procedure Calls (RPCs) by declaring a reply queue, the Direct Reply-to feature is exclusive to AMQP 0.9.1.
* **[OAuth 2.0 Token Refresh](./oauth2#token-expiration)**: AMQP 0.9.1 clients can renew tokens via method [update-secret](./extensions/). Token renewal is currently unsupported in AMQP 1.0. When a token expires, the AMQP 1.0 connection will be closed.
* **[AMQP 0.9.1 Channel Interceptor](https://github.com/rabbitmq/internals/blob/master/interceptors.md)**: Plugins, such as the [Sharding Plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_sharding#rabbitmq-sharding-plugin), that intercept and modify frames are [currently](https://github.com/rabbitmq/rabbitmq-server/issues/10051) only supported for AMQP 0.9.1.
* **Metrics delivery including message rates via the Management UI**: As documented in the [Deprecation Announcements](/blog/2021/08/21/4.0-deprecation-announcements#disable-metrics-delivery-via-the-management-api--ui), [Prometheus](./prometheus) should be used.
* **Inspecting AMQP 0.9.1 Channel Details**: This can be done [in the Management UI](./channels#inspect-in-management-ui) or [using CLI tools](./channels#inspect-using-cli-tools). AMQP 1.0 session and link details currently cannot be inspected.

### Clients

Any AMQP 1.0 client should be able to communicate with RabbitMQ.
The RabbitMQ team at Broadcom has developed two [AMQP 1.0 client libraries specifically for RabbitMQ](/blog/2024/08/05/native-amqp#rabbitmq-amqp-10-clients):
* [RabbitMQ AMQP 1.0 **Java** client](https://github.com/rabbitmq/rabbitmq-amqp-java-client)
* [RabbitMQ AMQP 1.0 **.NET** client](https://github.com/rabbitmq/rabbitmq-amqp-dotnet-client)

Currently, the AMQP 0.9.1 client ecosystem is more extensive, with a greater number of [AMQP 0.9.1 client libraries](/client-libraries/devtools) supported by the RabbitMQ team at Broadcom.

## Limitations

RabbitMQ does not support the following AMQP 1.0 features:
* "Suspending" or "resuming" a [link](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#section-links) including
    * Figure 2.8: Link Recovery
    * "exactly once" delivery
    * [resuming deliveries](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#doc-resuming-deliveries)
    * [Terminus Expiry Policy](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-terminus-expiry-policy)
* `aborted` field in [transfer](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#type-transfer) frame
* `dynamic` field in [source](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-source) and [target](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-target): clients can instead dynamically create server topologies (exchanges, queues, bindings) via HTTP over AMQP **prior** to attaching a link.
* [Transactions](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transactions-v1.0-os.html)
* Protocol Header for TLS Security Layer ([Figure 5.1](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-security-v1.0-os.html#section-tls)) including a protocol id of two. Instead, RabbitMQ runs a pure TLS server and therefore implements [section 5.2.1](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-security-v1.0-os.html#doc-tls-alternative-establishment).

### Modified Outcome
Modifying message annotations with the [modified](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-modified) outcome is supported in [quorum queues](./quorum-queues), but not in [classic queues](./classic-queues).
Modifying a message in a [stream](./streams) doesn't make sense given that a stream is an immutable log.

If field `undeliverable-here` is

* `true`, classic queues and quorum queues will [dead letter](./dlx) the message. If dead lettering is not configured, the message will be discarded.
* `false`, classic queues and quorum queues will requeue the message.

:::warning

The behaviour of `undeliverable-here` may change in a future RabbitMQ version.

For example, if `undeliverable-here = true`, instead of dead lettering the message, in the future,
queues might requeue the message while ensuring that the message is not redelivered to the modifying link endpoint.

:::
