---
title: Exchanges
displayed_sidebar: docsSidebar
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

# Exchanges

## What is an Exchange?

In AMQP 0-9-1, exchanges are the entities where [publishers](./publishers) publish
messages that are then routed to a set of queues or [streams](./streams).

Exchanges, like other topology elements in AMQP 0-9-1, are declared by applications
using client libraries.

The purpose of exchanges is to route all messages that flow through them to one or more [queues](./queues),
[streams](./streams), or other exchanges.

The type of the exchange and the binding properties are used to implement the routing logic.

### Exchanges Belong to Virtual Hosts

Like all other topology elements, every exchange belongs to one [virtual host](./vhosts).
This is true even for the system exchanges, which exist only in the default virtual host.

When a virtual host is created, a number of pre-declared exchanges will be automatically created in it.


## Exchange Names

Every exchange must have a name.

One special exchange called the default exchange (see below) uses
an empty string for its name when its specified as the [publishing](./publishers) target.

In other contexts, say, [permission management](./access-control), the same exchange
can be referred to as `"amq.default"` but this name cannot be used when publishing messages.


## Exchange Types {#types}

Exchanges can be of different types. An exchange type controls how it routes
the messages published to it. For example, one exchange type may use
a topic (pattern)-based routing, while another can route all messages to every bound
queue unconditionally.

RabbitMQ ships with multiple exchange types:

 * Fanout: covered in [tutorial 3](https://www.rabbitmq.com/tutorials)
 * Topic: covered in [tutorial 5](https://www.rabbitmq.com/tutorials)
 * Direct: covered in [tutorial 4](https://www.rabbitmq.com/tutorials)
 * Default direct exchange: a built-in direct exchange with special characteristics
 * [Local Random](./local-random-exchange)
 * [JMS Topic](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_jms_topic_exchange/README.md)
 * [Consistent Hashing exchange](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_consistent_hash_exchange)
 * [Random exchange](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_random_exchange)
 * [Recent history exchange](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_recent_history_exchange)
 * Headers

Exchange types can be provided by [plugins](./plugins/).

### Fanout

Fanout exchanges route a copy of every message published to them to every queue, stream or exchange
bound to ti.

See [tutorial 3](https://www.rabbitmq.com/tutorials) to see how this exchange type is used.

### Topic

Topic exchanges use pattern matching of the [message's routing key](./publishers#message-properties)
to the routing (binding) key pattern used at binding time.

For the purpose of routing, the keys are separated into segments by `.`. Some segments are populated by specific values,
while others are populated by wildcards: `*` for exactly one segment and `#` for zero or more (including multiple) srgments

For example,

 * A binding (routing key) pattern of `"regions.na.cities.*"` will match message routing keys `"regions.na.cities.toronto"` and `"regions.na.cities.newyork"` but **will not** match `"regions.na.cities"`
   because `*` is a wildcard that matches exactly one segment
 * A binding (routing key) pattern `"audit.events.#"` will match `"audit.events.users.signup"` and `"audit.events.orders.placed"` but not `"audit.users"` because the second segment does not match
 * A binding (routing key) pattern of `"#"` will match any routing key and makes the topic exchange act like a fanout for the bindings that use such a pattern

See [tutorial 5](https://www.rabbitmq.com/tutorials) to see how this exchange type is used.

### Direct

Direct exchanges route to one or more bound queues, streams or exchanges using an exact equivalence of a binding's routing key.

For example, a binding (routing) key of `"abc"` will match `"abc"` and `"abc"` only.

See [tutorial 4](https://www.rabbitmq.com/tutorials) to see how this exchange type is used.

### Default Exchange

The default exchange is a direct exchange that has several special properties:

 * It always exists (is pre-declared)
 * Its name for AMQP 0-9-1 clients is an empty string (`""`)
 * When a queue is declared, RabbitMQ will automatically bind that queue to the default exchange using its (queue) name
   as the routing key

This provides AMQP 0-9-1 applications with a mechanism that makes it convenient to publish "directly" to a queue
using only its name, even though there's still a direct exchange involved under the hood.

:::tip

The default exchange is used for its special properties. It is not supposed to be used as "regular" exchange
that applications explicitly create bindings for.

For such cases where a direct exchange and a custom topology are necessary,
consider declaring and using a separate direct exchange.

:::

### Local Random Exchange

[Local Random](./local-random-exchange) is a specialized exchange type
covered in a separate documentation guide.

### JMS Topic Exchange

[JMS Topic](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_jms_topic_exchange/README.md) exchange
was introduced to implement certain JMS features for the [RabbitMQ JMS client](/client-libraries/jms-client).


## What are Bindings?

Exchanges, when declared, are not aware of any queues or streams. An initially declared exchange is an empty
named routing table.

In order to fill the table with some routing rules, a queue, stream or another exchange (see below) must be
**bound** to the exchange. In other words, an application must create a binding between
the exchange and a queue or a stream.

A binding has the following properties:

 * Source name: a name of the exchange this binding is added to
 * Destination name: a name of the target queue, stream, or another exchange
 * Destination type (`queue` for queues and streams, `exchange` for exchange-to-exchange bindings)
 * An optional map of arguments, which certain exchange types can use (e.g. the headers exchange)

### Binding Durability

Bindings inherit durability from their source and destination. As such, bindings can be

 * Fully durable: both their exchange and destination/queue/stream are durable
 * Semi-durable: in practice this means that their their exchange is durable and their destination/queue/stream are transient
 * Fully transient: both their exchange and destination/queue/stream are transient

Support for semi-durable and fully transient bindings will be dropped in the future.

Binding durability can matter when bindings are used with transient classic queues.

:::warning

When a node, hosting non-replicated (classic) queues, is stopped, all of the transient queues and semi-durable
bindings on it will be removed.

In the case of large topologies, this can take time and when the node
comes back online and applications reconnect, semi-durable and transient bindings can be removed
and re-added concurrently, which can result in an inconsistent

:::

To avoid the aforementioned problem, using only durable ([replicated](./quorum-queues/) or not) queues, optionally with a reasonably short [TTL](./ttl), and streams,
and limit the use of transient queues, for example, to publishing using the default exchange.



## Pre-Declared Exchanges

### Per AMQP 0-9-1 Spec

Per AMQP 0-9-1 spec, every virtual host contains a number of pre-declared

### System Exchanges

 * `amq.rabbitmq.log` is a system topic exchange used by an [opt-in logging feature](./logging#log-exchange)
 * `amq.rabbitmq.event` is a system topic exchanged used by the [internal events mechanism](./logging#internal-events)


## Exchange Properties {#properties}

Exchanges have several key properties that can be specified at declaration times

### Durability {#durability}

Just like queues, exchanges can be durable or transient. However, transient exchanges are very rarely used
in practice.

As a rule of thumb, consider using durable exchanges for the following reasons:

 * Applications with transient or client-specific state rarely need (or use) custom exchanges and instead rely on the pre-declared ones (such as `amq.topic`)
 * Further in the 4.x series, support for transient (non-durable) entities will be removed when [Khepri](./metadata-store/) becomes the only supported metadata store

### Autol-Deletion

Auto-deleted queues are deleted when their last binding is removed.

This requires that there such a binding; exchanges that are never bound won't be deleted by this mechanism.


### Optional Arguments {#optional-arguments}

Optional exchange arguments, also known as "x-arguments" because of their
field name in the AMQP 0-9-1 protocol, is a map (dictionary) of arbitrary key/value
pairs that can be provided by clients when a queue is declared.

The map is used by certainly features and exchange types, such as [alternate exchanges](#ae)
and the headers exchanges.

These optional arguments usually can be dynamically changed after queue declaration via [policies](./parameters#policies).

:::tip

For keys that can be set via [policies](./parameters#policies), always first
consider using a policy instead of setting these values in application code

:::

Optional exchange arguments can be set differently:

 * To groups of queues using [policies](./parameters#policies) (recommended)
 * On a per-exchange basis when a queue is declared by a client

The former option is more flexible, non-intrusive, does not require application
modifications and redeployments. Therefore it is highly recommended for most users.
Note that some optional arguments such as queue type or max number of priorities can
only be provided by clients because they cannot be dynamically changed and must be known
at declaration time.

The way optional arguments are provided by clients varies from client library
to client library but is usually an argument next to the <code>durable</code>,
<code>auto_delete</code> and other arguments of the function (method) that
declares queues.

### Optional Arguments and Policy-Defined Key Precedence {#optional-arguments-precedence}

When the same key is provided by both client-provided `x-arguments` and by a [policy](./parameters#policies),
the former take precedence.

However, if an [operator policy](./parameters#operator-policies) is also used, that will take precedence over the client-provided
arguments, too. Operator policies are a protection mechanism and override client-provided values
and user policy values.

For numerical values, the lower value of the two will be used. If an application needs or chooses to use a lower value,
that will be allowed by an operator policy. A value higher than that defined in the operator policy,
however, cannot be used.

Use operator policies to introduce guardrails for application-controlled parameters related
to resource use (e.g. peak disk space usage).


## Exchange-to-Exchange Bindings {#e2e}

Besides queues and streams, an exchange can be bound to another exchange
using an AMQP 0-9-1 protocol extension in RabbitMQ called [exchange-to-exchange bindings](./e2e/), or E2E for short.

Applications then publish to the source exchange, which routes
messages to the destination exchange.

:::note

For efficiency reasons, a message published to a source exchange that has E2E bindings will be routed
only once using the total set of available bindings on both on the source and all the
destination exchanges bound to it.

In other words, E2E bindings do not republish messages, they are a routing extension that respect
the types of both the source and the destination exchange.

This means that the destination exchange's ingress (inbound) message rate metric won't be updated.
Metrics for the target queues and streams will be, whether they are bound to the source
exchange or the destination one.

:::


## Alternate Exchanges {#ae}

[Alternate Exchanges](./ae/) is a feature that allows an exchange that was unable to route
a message because there were no suitable bindings to delegate routing to a different exchange.

Alternate exchanges are useful when performing topology migrations
or collecting [unroutable messages](./publishers#unroutable).


## System Exchanges {#system}

RabbitMQ uses provides built-in exchanges for logging and audit purposes:

 * `amq.rabbitmq.log` is a system topic exchange used by an [opt-in logging feature](./logging#log-exchange)
 * `amq.rabbitmq.event` is a system topic exchanged provided by a built-in plugin and used by the [internal events mechanism](./logging#internal-events)
 * `amq.rabbitmq.trace` is used by the [message tracing mechanism](./firehose)

Both exchanges make it possible to develop custom log collection and auditing applications
that only need to have a feasonably feature complete AMQP 0-9-1 client library.
