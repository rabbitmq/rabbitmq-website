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

# Classic Queues Support Priorities

## <a id="overview" class="anchor" href="#overview">What is a Priority Queue</a>

RabbitMQ supports adding "priorities" to classic queues. Classic queues with the "priority" feature turned on are commonly referred to as "priority queues".
Priorities between 1 and 255 are supported, however, **values between 1 and 5 are highly recommended**. It is important to know that higher priority
values require more CPU and memory resources, since RabbitMQ needs to internally maintain a sub-queue for each priority from 1, up to the maximum value
configured for a given queue.

A classic queue can become a priority queue by using client-provided [optional arguments](./queues.html#optional-arguments).

Declaring a classic queue as a priority queue [using policies](#using-policies) is [not supported by design](#using-policies).
For the reasons why, refer to [Why Policy Definition is not Supported for Priority Queues](#using-policies).

## <a id="definition" class="anchor" href="#definition">Using Client-provided Optional Arguments</a>

To declare a priority queue, use the `x-max-priority` optional queue argument.
This argument should be a positive integer between 1 and 255,
indicating the maximum priority the queue should support. For example,
using the Java client:

<pre class="lang-java">
Channel ch = ...;
Map&lt;String, Object&gt; args = new HashMap&lt;String, Object&gt;();
args.put("x-max-priority", 10);
ch.queueDeclare("my-priority-queue", true, false, false, args);
</pre>

Publishers can then publish prioritised messages using the
`priority` field of
`basic.properties`. Larger numbers indicate higher
priority.

## <a id="behaviour" class="anchor" href="#behaviour">Priority Queue Behaviour</a>

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
unsigned byte, so in practice priorities should be between 0
and 255.

 - Messages without a `priority` property are treated as
if their priority were 0. Messages with a priority which is
higher than the queue's maximum are treated as if they were
published with the maximum priority.


## <a id="resource-usage" class="anchor" href="#resource-usage">Maximum Number of Priorities and Resource Usage</a>

If priority queues are what you want, this information previously stated **values between 1 and 5 are highly recommended**. If you must go higher than 5, values between 1 and 10 are sufficient (keep it to a single digit number) because currently using more priorities consumes more CPU resources by using more Erlang processes.
[Runtime scheduling](./runtime.html) would also be affected.

## <a id="interaction-with-consumers" class="anchor" href="#interaction-with-consumers">How Priority Queues Work with Consumers</a>

If a consumer connects to an empty priority queue to which
messages are subsequently published, the messages may not spend
any time waiting in the priority queue before the consumer accepts these messages (all the messages are accepted immediately).
In this scenario, the priority queue does not get any opportunity to prioritise the messages, priority is not needed.

However, in most cases, the previous situation is not the norm, therefore you should use the `basic.qos` ([prefetch](./confirms.md#channel-qos-prefetchconsumer-prefetch))
method in manual acknowledgement mode on your consumers to limit the number of messages that can be out for delivery at any time and allow messages to be prioritised.
`basic.qos` is a value a consumer sets when connecting to a queue. It indicates how many messages the consumer can handle at one time.

The following example attempts to explain how consumers work with priority queues in more detail and also to highlight that sometimes when priority queues work with consumers,
higher prioritised messages may in practice need to wait for lower priority messages to be processed first.

### Example
- A new consumer connects to an empty classic (non-prioritised) queue with a consumer prefetch (`basic.qos`) of 10.

- A message is published and immediately sent to the consumer for processing.

- 5 more messages are then published quickly and sent to the consumer immediately, because, the consumer has only 1 in-flight (unacknowledged) message out of 10 declared as qos (prefetch).

- Next, 10 more messages are published quickly and sent to the consumer, only 4 out of the 10 messages are sent to the consumer (because the original `basic.qos` (consumer prefetch) value of 10 is now full), the remaining 5 messages must wait in the queue (ready messages).

- The consumer now acknowledges 5 messages so now 5 out of the 6 messages waiting above are then sent to the consumer.

#### Now Add Priorities

- As in the example above, a consumer connects with a `basic.qos` (consumer prefetch) value of 10.

- 10 low priority messages are published and immediately sent to the consumer (`basic.qos` (consumer prefetch) has now reached its limit)

- A top-priority message is published, but the prefetch is exceeded now so the top-priority message needs to wait for the messages with lower priority to be processed first.

## <a id="interaction-with-other-features" class="anchor" href="#interaction-with-other-features">Interaction with Other Features</a>

In general, priority queues have all the features of standard
RabbitMQ queues: they support persistence, paging, mirroring,
and so on. There are a couple of interactions that developers should be
aware of.

[Messages which should expire](./ttl.html) still
only expire from the head of the queue. This means that unlike
with normal queues, even per-queue TTL can lead to expired
lower-priority messages getting stuck behind non-expired
higher priority ones. These messages will never be delivered,
but they will appear in queue statistics.

[Queues which have a max-length set](./maxlength.html) drop messages as usual from the head of the
queue to enforce the limit. This means that higher priority
messages might be dropped to make way for lower priority ones,
which might not be what you would expect.

## <a id="using-policies" class="anchor" href="#using-policies">Why Policy Definition is not Supported for Priority Queues</a>

The most convenient way to define optional arguments for a queue is using [policies](./parameters.html). Policies are the recommended way to configure [TTL](./ttl.html), [queue length limits](maxlength.html), and
other [optional queue arguments](queues.html).

However, policies cannot be used to configure priorities because policies are dynamic
and can be changed after a queue has been declared. Priority queues can never change the number of priorities they support after queue declaration, so policies would not be a safe option to use.
