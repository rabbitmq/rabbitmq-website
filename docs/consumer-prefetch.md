---
title: Consumer Prefetch
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

# Consumer Prefetch

## Overview {#overview}

Consumer prefetch is an extension to the [channel prefetch mechanism](./confirms).

AMQP 0-9-1 specifies the `basic.qos` method to make it possible to
[limit the number of unacknowledged messages](./confirms) on a channel (or
connection) when consuming (aka "prefetch count"). Unfortunately
the channel is not the ideal scope for this - since a single
channel may consume from multiple queues, the channel and the
queue(s) need to coordinate with each other for every message
sent to ensure they don't go over the limit. This is slow on a
single machine, and very slow when consuming across a cluster.

Furthermore for many uses it is simply more natural to specify
a prefetch count that applies to each consumer.

Therefore RabbitMQ slightly deviates from the AMQP 0-9-1 spec
when it comes to how the prefetch is applied to multiple consumers
on a channel:

<table class="styled-table">
  <tr>
    <th>Meaning of <code>prefetch_count</code> in AMQP 0-9-1</th>
    <th>Meaning of <code>prefetch_count</code> in RabbitMQ</th>
  </tr>
  <tr>
    <td>shared across all consumers on the channel</td>
    <td>applied separately to each new consumer on the channel</td>
  </tr>
</table>

## Single Consumer {#single-consumer}

The following basic example in Java will receive a maximum of 10
unacknowledged messages at once:


```java
Channel channel = ...;
Consumer consumer = ...;
channel.basicQos(10); // Per consumer limit
channel.basicConsume("my-queue", false, consumer);
```

A value of `0` is treated as infinite, allowing any number of unacknowledged
messages.

```java
Channel channel = ...;
Consumer consumer = ...;
channel.basicQos(0); // No limit for this consumer
channel.basicConsume("my-queue", false, consumer);
```

## Independent Consumers {#independent-consumers}

This example starts two consumers on the same channel, each of
which will independently receive a maximum of 10 unacknowledged
messages at once:

```java
Channel channel = ...;
Consumer consumer1 = ...;
Consumer consumer2 = ...;
channel.basicQos(10); // Per consumer limit
channel.basicConsume("my-queue1", false, consumer1);
channel.basicConsume("my-queue2", false, consumer2);
```

## Multiple Consumers Sharing the Limit {#sharing-the-limit}

The AMQP 0-9-1 specification does not explain what happens if you
invoke `basic.qos` multiple times with different
`global` values. RabbitMQ interprets this as meaning
that the two prefetch limits should be enforced independently of
each other; consumers will only receive new messages when neither
limit on unacknowledged messages has been reached.

For example:

```java
Channel channel = ...;
Consumer consumer1 = ...;
Consumer consumer2 = ...;
channel.basicQos(10, false); // Per consumer limit
channel.basicQos(15, true);  // Per channel limit
channel.basicConsume("my-queue1", false, consumer1);
channel.basicConsume("my-queue2", false, consumer2);
```

These two consumers will only ever have 15 unacknowledged
messages between them, with a maximum of 10 messages for each
consumer. This will be slower than the above examples, due to
the additional overhead of coordinating between the channel and
the queues to enforce the global limit.

## Configurable Default Prefetch {#default-limit}

RabbitMQ can use a default prefetch that will be applied if the consumer doesn't specify one.
The value can be configured as `rabbit.default_consumer_prefetch` in the [advanced configuration file](./configure#advanced-config-file):

```erlang
%% advanced.config file
[
 {rabbit, [
       {default_consumer_prefetch, {false,250}}
     ]
 }
].
```
