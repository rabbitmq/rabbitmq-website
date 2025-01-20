---
title: Dead Letter Exchanges
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

# Dead Letter Exchanges

## What is a Dead Letter Exchange {#overview}

Messages from a queue can be "dead-lettered", which means these messages are republished to an exchange when any of the following four events occur.

1. The message is [negatively acknowledged](./confirms) by an AMQP 1.0 receiver using the [`rejected`](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-rejected)
outcome or by an AMQP 0.9.1 consumer using `basic.reject` or `basic.nack` with `requeue` parameter set to `false`, or
2. The message expires due to [per-message TTL](./ttl), or
3. The message is dropped because its queue exceeded a [length limit](./maxlength), or
4. The message is returned more times to a quorum queue than the [delivery-limit](./quorum-queues#poison-message-handling).

If an entire [queue expires](./ttl#queue-ttl), the messages in the queue are **not** dead-lettered.

Dead letter exchanges (DLXs) are normal exchanges. They can be
any of the usual types and are declared as normal.

For any given queue, a DLX can be defined by clients using the
[queue's arguments](./queues#optional-arguments), or in the server
using [policies](./parameters#policies). In the
case where both policy and arguments specify a DLX, the one
specified in arguments overrules the one specified in policy.

Configuration using policies is recommended as it allows for DLX
reconfiguration that does not involve application redeployment.

## Configuring a Dead Letter Exchange using a Policy {#using-policies}

To specify a DLX using policy, add the key "dead-letter-exchange"
to a policy definition. For example:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
```bash
rabbitmqctl set_policy DLX ".*" '{"dead-letter-exchange":"my-dlx"}' --apply-to queues
```
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
```PowerShell
rabbitmqctl set_policy DLX ".*" "{""dead-letter-exchange"":""my-dlx""}" --apply-to queues
```
    </td>
  </tr>
</table>

The previous policy applies the DLX "my-dlx" to all queues. This is an example only, in practice, different sets of queues usually use different dead lettering settings (or none at all).

Similarly, an explicit routing key can be specified by adding
the key "dead-letter-routing-key" to the policy.

Policies can also be defined using the management plugin, see
the [policy documentation](./parameters#policies) for more details.

## Configuring a Dead Letter Exchange using Optional Queue Arguments {#using-optional-queue-arguments}

To set the DLX for a queue, specify
the optional `x-dead-letter-exchange` argument when
declaring the queue. The value must be an exchange name in
the same virtual host:

```java
channel.exchangeDeclare("some.exchange.name", "direct");

Map<String, Object> args = new HashMap<String, Object>();
args.put("x-dead-letter-exchange", "some.exchange.name");
channel.queueDeclare("myqueue", false, false, false, args);
```

The previous code declares a new exchange called
`some.exchange.name` and sets this new exchange
as the dead letter exchange for a newly created queue.
Note, the exchange does not have to be declared when
the queue is declared but it should exist by the time
messages need to be dead-lettered. If it is missing then,
the messages are silently dropped.

You may also specify a routing key to use when the messages are being
dead-lettered.  If the routing key is not set, the
message's own routing keys are used.

```java
args.put("x-dead-letter-routing-key", "some-routing-key");
```

When a dead letter exchange is specified, in addition to
the usual configure permissions on the declared queue, the user
must have read permissions on that queue and write
permissions on the dead letter exchange. Permissions are
verified at the time the queue is declared.

## Routing Dead-Lettered Messages {#routing}

Dead-lettered messages are routed to their dead letter
exchange either:

 * with the routing key specified for the queue they
   were on; or, _if this was not set_,
 * with the same routing keys they were originally
   published with

For example, if you publish a message to an exchange with a `foo`
routing key, and that message is
dead-lettered, it is published to its dead letter
exchange with the `foo` routing key. If the queue
the message originally landed on is declared with
`x-dead-letter-routing-key` set to
`bar`, then the message is published to
its dead letter exchange with the `bar` routing key.

Note, if a specific routing key was not set for the
queue, messages on it are dead-lettered with *all*
their original routing keys.  This includes routing keys
added by the `CC` and `BCC` headers
(refer to [Sender-selected distribution](./sender-selected) for details about these two headers).

### Dead-letter cycle

It is possible to form a cycle of message dead-lettering where the same message reaches the same queue twice.
For example, this can happen when a queue "dead-letters" messages to the default exchange without specifying a dead-letter routing key.
To prevent automatic infinite message looping within RabbitMQ, RabbitMQ will detect a cycle and drop the message *if there was no rejection in the entire cycle*.

## Safety {#safety}

Dead-lettering is a form of message publishing, and as any form of publishing,
it can fail in certain scenarios. For example, if dead lettering is
configured to use a quorum queue that does not have an online quorum,
the publishing will fail, and the node perfoming dead lettering will log
a message similar to the following:

```
Cannot forward any dead-letter messages from source quorum queue 'qq.input' in vhost 'my-vhost'
with configured dead-letter-exchange exchange 'amq.topic' in vhost 'my-vhost'
and configured dead-letter-routing-key 'my-app.events.type.abc'
```

### Re-Publishing with Publisher Confirms

By default, dead-lettered messages are re-published *without* publisher
[confirms](./confirms) turned on internally. Therefore using DLX in a clustered
RabbitMQ environment is not guaranteed to be safe. Messages are removed from the
original queue immediately after publishing to the DLX target queue. This ensures
that there is no chance of excessive message build up that could exhaust broker
resources. However, messages can be lost if the target queue is not available to accept messages.

Quorum queues support [at-least-once dead-lettering](./quorum-queues#dead-lettering)
where messages are re-published with publisher confirms turned on internally.

## Dead-Lettered Effects on Messages {#effects}

Dead-lettering a message modifies its headers:

 * the exchange name is replaced with that of the latest dead-letter exchange
 * the routing key may be replaced with that specified in a queue performing dead lettering (i.e. configured `dead-letter-routing-key`),
 * if the above happens, the `CC` header will also be removed, and
 * the `BCC` header will be removed as per [Sender-selected distribution](./sender-selected)

A single message can be dead lettered multiple times.
Each time a message is dead lettered, this event will be recorded within the message header.
To prevent the header from growing unboundedly, the dead letter event history is compressed by the `{Queue, Reason}` pair.

An AMQP 1.0 message will contain a [message annotation](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-message-annotations)
with a symbolic key `x-opt-deaths` and the value being an [array](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-array)
of [map](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-map)s.
An AMQP 0.9.1 message will contain an `x-death` header with the value being an array.
The array in both AMQP 1.0 and AMQP 0.9.1 is ordered by recency, that is the most recent dead-lettering event is recorded in the first array element.

The following table describes the AMQP 1.0 map key value pairs and the AMQP 0.9.1 table of the array elements.
All AMQP 1.0 keys are of type `symbol`. AMQP 1.0 clients must not depend on the order of the map's key-value pairs.

| AMQP 1.0 key | AMQP 1.0 value type | AMQP 0.9.1 key | AMQP 0.9.1 value type | Description |
| ------------ | ------------------- | -------------- | --------------------- | ----------- |
| queue  | string | queue | longstr | The name of the queue this message was dead lettered from. |
| reason  | symbol | reason | longstr | Why this message was dead lettered (described below). |
| count  | ulong | count | long | How many times this message was dead lettered from this queue for this reason. |
| first-time | [timestamp](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-timestamp) | | | When this message was dead lettered the first time from this queue for this reason. |
| last-time | [timestamp](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-timestamp) | | | When this message was dead lettered the last time from this queue for this reason. |
| | | time | timestamp | When this message was dead lettered the first time from this queue for this reason. |
| exchange  | string | exchange | longstr | The exchange this message was published to before this message got dead lettered for the first time from this queue for this reason. |
| routing-keys | array of string | routing-keys | array of longstr | The routing keys (including `CC` but excluding `BCC`) of this message before it got dead lettered for the first time from this queue for this reason. |
| ttl | uint | | | AMQP 1.0 [header](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-header)'s `ttl` (time to live in milliseconds) before this message got dead lettered for the first time from this queue for this reason. |
| | | original-expiration | longstr | The original `expiration` property of this message before it got dead lettered for the first time from this queue for this reason. |

AMQP 1.0 `ttl` and AMQP 0.9.1 `original-expiration` are optional and recorded because the original message's TTL is removed from the message on dead-lettering to prevent it from expiring again in any queues it is routed to.

The `reason` is a name describing why the
message was dead-lettered and is one of the following:

 * `rejected`: the message was rejected
 * `expired`: the [message TTL](./ttl) has expired
 * `maxlen`: the [maximum allowed queue length](./maxlength) was exceeded
 * `delivery_limit`: the message is returned more times than the limit (set by policy argument [delivery-limit](./quorum-queues#poison-message-handling) of quorum queues).

In addition, the following six AMQP 1.0 message annotations or AMQP 0.9.1 headers are added for the very first dead-lettering event:

1. `x-first-death-queue`: The first queue this message was dead lettered from.
2. `x-first-death-reason`: Why this message was dead lettered for the first time.
3. `x-first-death-exchange`: The exchange this message was published to before this message got dead lettered for the first time.
4. `x-last-death-queue`: The last queue this message was dead lettered from.
5. `x-last-death-reason`: Why this message was dead lettered for the last time.
6. `x-last-death-exchange`: The exchange this message was published to before this message got dead lettered the last time.

The `x-first-*` annotations are never modified.
Whenever a message is dead lettered subsequently, the `x-last-*` annotations are updated.
