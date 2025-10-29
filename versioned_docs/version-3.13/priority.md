---
title: Classic Queues Support Priorities
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

# Classic Queues Support Priorities

## Pre-requisites

This guide assumes familiarity with the essentials of RabbitMQ:

 * [Tutorials](/tutorials/)
 * The main guide on [Queues](./queues)
 * [Consumers guide](./consumers)

Please consult the above guides.

## What is a Priority Queue {#overview}

Classic queues in RabbitMQ support priorities.
The standard mode of operation of queues is FIFO (First In, First Out). This means that, ignoring prefetch, [competing consumers](/tutorials/tutorial-two-python), [requeueing and redeliveries](./confirms#consumer-nacks-requeue) for a moment, RabbitMQ will deliver messages to consumers
in the same order the messages were enqueued in.

This standard behavior changes for the classic queues that are configured to use priorities. For brevity, such queues
are called "priority queues" in this guide and the rest of RabbitMQ documentation.

Priority queues deliver messages in the order of message priorities. A message priority is a positive integer value set by [publishers](./publishers)
at publishing time.

Consider a queue with three messages, A, B and C, published with equal priorities and enqueued in that order
into a "regular" classic queue:

| Message | Enqueueing Order | Priority |
|---------|------------------|----------|
| A       | 1                | 1        |
| B       | 2                | 1        |
| C       | 3                | 1        |

These messages will be dispatched (sent) to a consumer (or multiple consumers) in the following order: A, B, C.

Now, consider a priority queue with the same messages, but with different priorities:

| Message | Enqueueing Order | Priority |
|---------|------------------|----------|
| A       | 1                | 1        |
| B       | 2                | 3        |
| C       | 3                | 2        |

Unlike the standard FIFO delivery behavior, these messages will be dispatched to a consumer (or multiple consumers)
in a different order: B, C, A, according to their priorities.

Delivery order can slightly vary in practice when a priority queue has competing consumers, requeued deliveries, or [automatic requeueing](./confirms#automatic-requeueing) in case of consumer connection loss or consumer application failure.


## Before Adopting Priority Queues: Consider the Alternatives {#alternatives}

Priority queue behavior with respect to consumer delivery is much harder to reason about than the standard FIFO
behavior of queues, in particular in environments where consumers can often [requeue](./confirms#consumer-nacks-requeue) deliveries.
For this reason, it's important to consider whether a simpler alternative would be more appropriate.

Priority queues are usually adopted to avoid a classic problem in queueing systems, the [head-of-line blocking problem](https://en.wikipedia.org/wiki/Head-of-line_blocking). However, there are several possible alternative solutions that
should be considered first:

1. Use multiple queues instead of one. Single Giant Queue™ is one of the most common anti-patterns around queue use
2. For competing consumers on a single queue, use separate channels with separate [prefetch values](./confirms#channel-qos-prefetch) greater than 1 so that an exhausted prefetch does not block the flow of deliveries
3. Using a [stream](./streams) instead of a queue. Streams offer a different consumption pattern and support repeated consumption
4. In a limited number of scenarios, a [consumer priority](./confirms#channel-qos-prefetch) can be easier to reason about compared to a priority queue

For example, a set of three queues, `priority.low`, `priority.medium`, and `priority.high` can avoid the Head-of-Queue blocking problem
while keeping the standard delivery behavior, and offer [better runtime parallelism](./queues#runtime-characteristics) as a positive side effect.


## Declaration and Supported Priority Ranges {#declaration}

Classic queues support priorities in the [1, 255] range. However, **using from 2 to 4 priorities is highly recommended** (a single priority does not make much practical sense).

Higher priority values will use more CPU and memory resources: RabbitMQ needs to internally maintain a sub-queue for each priority from 1, up to the maximum value configured for a given queue.

A classic queue can become a priority queue by using client-provided [optional arguments](./queues#optional-arguments).

Declaring a classic queue as a priority queue [using policies](#using-policies) is [not supported by design](#using-policies).
For the reasons why, refer to [Why Policy Definition is not Supported for Priority Queues](#using-policies).

### Using Client-provided Optional Arguments

To declare a priority queue, use the `x-max-priority` optional queue argument.
This argument should be a positive integer between 1 and 255,
indicating the maximum priority the queue should support. For example,
using the Java client:

```java
Channel ch = ...;
Map<String, Object> args = new HashMap<String, Object>();
// Maximum priority values from 1 to 4 are highly recommended
args.put("x-max-priority", 4);
ch.queueDeclare("my-priority-queue", true, false, false, args);
```

Publishers can then publish prioritised messages using the
`priority` field of
`basic.properties`. Larger numbers indicate higher
priority.

## Priority Queue Behaviour {#behaviour}

The AMQP 0-9-1 spec is a little vague about how priorities are expected to work.
It states that all queues MUST support at least 2 priorities, and MAY
support up to 10. It does not define how messages without a
priority property are treated.

By default, RabbitMQ classic queues do not
support priorities. When creating priority queues, a maximum priority
can be chosen as you see fit. When choosing a priority value, the following factors need to be considered:

 - There is some in-memory and on-disk cost per priority level
per queue. There is also an additional CPU cost, especially
when consuming, so you may not wish to create huge numbers of
levels.

 - The message `priority` field is defined as an
unsigned byte, that is, its values cannot be outside of the [0, 255] range.

 - Messages without a `priority` property are treated as
if their priority were 0. Messages with a priority which is
higher than the queue's maximum are treated as if they were
published with the maximum priority.


## Maximum Number of Priorities and Resource Usage {#resource-usage}

For environments that adopt publishing with priorities and priority queues, using **from 2 to 4 priorities** is highly recommended.
If you must go higher than 4, using up to 10 priorities is usually sufficient (keep it to a single digit number).

With classic queues, using more priorities consumes more CPU resources by using more Erlang processes.
[Runtime scheduling](./runtime) would also be affected.

## How Priority Queues Work with Consumers {#interaction-with-consumers}

If a consumer connects to an empty priority queue to which
messages are subsequently published, the messages may not spend
any time waiting in the priority queue before the consumer accepts these messages (all the messages are accepted immediately).
In this scenario, the priority queue does not get any opportunity to prioritise the messages, priority is not needed.

However, in most cases, the previous situation is not the norm, therefore you should use the `basic.qos` ([prefetch](./confirms.md#channel-qos-prefetch))
method in manual acknowledgement mode on your consumers to limit the number of messages that can be out for delivery at any time and allow messages to be prioritised.
`basic.qos` is a value a consumer sets when connecting to a queue. It indicates how many messages the consumer can handle at one time.

The following example attempts to explain how consumers work with priority queues in more detail and also to highlight that sometimes when priority queues work with consumers,
higher prioritised messages may in practice need to wait for lower priority messages to be processed first.

### Example
- A new consumer connects to an empty classic (non-prioritised) queue with a consumer prefetch (`basic.qos`) of 10.

- A message is published and immediately sent to the consumer for processing.

- 5 more messages are then published quickly and sent to the consumer immediately, because, the consumer has only 1 in-flight (unacknowledged) message out of 10 declared as qos (prefetch).

- Next, 10 more messages are published quickly and sent to the consumer, only 4 out of the 10 messages are sent to the consumer (because the original `basic.qos` (consumer prefetch) value of 10 is now full), the remaining 6 messages must wait in the queue (ready messages).

- The consumer now acknowledges 5 messages so now 5 out of the 6 messages waiting above are then sent to the consumer.

#### Now Add Priorities

- As in the example above, a consumer connects with a `basic.qos` (consumer prefetch) value of 10.

- 10 low priority messages are published and immediately sent to the consumer (`basic.qos` (consumer prefetch) has now reached its limit)

- A top-priority message is published, but the prefetch is exceeded now so the top-priority message needs to wait for the messages with lower priority to be processed first.

## Interaction with Other Features {#interaction-with-other-features}

In general, priority queues have all the features of standard
RabbitMQ queues. There are a couple of interactions that developers should be
aware of.

[Messages which should expire](./ttl) still
only expire from the head of the queue. This means that unlike
with normal queues, even per-queue TTL can lead to expired
lower-priority messages getting stuck behind non-expired
higher priority ones. These messages will never be delivered,
but they will appear in queue statistics.

[Queues which have a max-length set](./maxlength) drop messages as usual from the head of the
queue to enforce the limit. This means that higher priority
messages might be dropped to make way for lower priority ones,
which might not be what you would expect.

## Why Policy Definition is not Supported for Priority Queues {#using-policies}

The most convenient way to define optional arguments for a queue is using [policies](./parameters). Policies are the recommended way to configure [TTL](./ttl), [queue length limits](./maxlength), and
other [optional queue arguments](./queues).

However, policies cannot be used to configure priorities because policies are dynamic
and can be changed after a queue has been declared. Priority queues can never change the number of priorities they support after queue declaration, so policies would not be a safe option to use.
