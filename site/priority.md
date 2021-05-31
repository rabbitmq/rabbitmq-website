<!--
Copyright (c) 2007-2021 VMware, Inc. or its affiliates.

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

# Priority Queue Support

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ has priority queue implementation in the core as of version `3.5.0`.
Any queue can be turned into a priority one using client-provided [optional arguments](/queues.html#optional-arguments)
(but, unlike other features that use optional arguments, not policies).
The implementation supports a limited number of priorities: 255. Values between 1 and 10 are recommended.


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

Publishers then can publish prioritised messages using the
`priority` field of
`basic.properties`. Larger numbers indicate higher
priority.

Priority declaration [using policies](#using-policies) is [not supported by design](#using-policies).

## <a id="behaviour" class="anchor" href="#behaviour">Behaviour</a>

The AMQP 0-9-1 spec is a bit vague about how priorities are expected to work.
It says that all queues MUST support at least 2 priorities, and MAY
support up to 10. It does not define how messages without a
priority property are treated.

In contrast to the AMQP 0-9-1 spec, RabbitMQ queues by default do not
support priorities. When creating priority queues, a maximum priority
can be chosen as developer sees fit. When choosing the value, a couple
of things must be taken into account.

There is some in-memory and on-disk cost per priority level
per queue. There is also an additional CPU cost, especially
when consuming, so you may not wish to create huge numbers of
levels.

The message `priority` field is defined as an
unsigned byte, so in practice priorities should be between 0
and 255.

Messages without a `priority` property are treated as
if their priority were 0. Messages with a priority which is
higher than the queue's maximum are treated as if they were
published with the maximum priority.


## <a id="resource-usage" class="anchor" href="#resource-usage">Max Number of Priorities and Resource Usage</a>

If priority queues are desired, we recommend using between 1 and 10.
Currently using more priorities will consume more CPU resources by using more Erlang processes.
[Runtime scheduling](/runtime.html) would also be affected.

## <a id="interaction-with-consumers" class="anchor" href="#interaction-with-consumers">Interaction with Consumers</a>

It's important to understand how consumers work when working
with priority queues. By default, consumers may be sent a large
number of messages before they acknowledge any, limited only by
network backpressure.

So if such a hungry consumer connects to an empty queue to which
messages are subsequently published, the messages may not spend
any time at all waiting in the queue. In this case the priority
queue will not get any opportunity to prioritise them.

In most cases you will want to use the `basic.qos`
method in manual acknowledgement mode on your consumers, to
limit the number of messages that can be out for delivery at any
time and thus allow messages to be prioritised.

## <a id="interaction-with-other-features" class="anchor" href="#interaction-with-other-features">Interaction with Other Features</a>

In general priority queues have all the features of standard
RabbitMQ queues: they support persistence, paging, mirroring,
and so on. There are a couple of interactions that developers should be
aware of.

[Messages which should expire](/ttl.html) will still
only expire from the head of the queue. This means that unlike
with normal queues, even per-queue TTL can lead to expired
lower-priority messages getting stuck behind non-expired
higher priority ones. These messages will never be delivered,
but they will appear in queue statistics.

[Queues which have a max-length set](/maxlength.html) will, as usual, drop messages from the head of the
queue to enforce the limit. This means that higher priority
messages might be dropped to make way for lower priority ones,
which might not be what you would expect.


## <a id="using-policies" class="anchor" href="#using-policies">Why Policy Definition is not Supported</a>

The most convenient way to define optional arguments for a queue is via [policies](/parameters.html).
Policies are the recommended way to configure [TTL](/ttl.html), [queue length limits](maxlength.html) and
other [optional queue arguments](queues.html).

However, policies cannot be used to configure priorities because policies are dynamic
and can be changed after a queue has been declared. Priority queues can never change the number of priorities they
support after queue declaration, so policies would not be a safe option to use.
