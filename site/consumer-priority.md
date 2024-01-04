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

# Consumer Priorities

## <a id="overview" class="anchor" href="#overview">Overview</a>

Consumer priorities allow you to ensure that high priority
consumers receive messages while they are active, with messages
only going to lower priority consumers when the high priority
consumers block.

Normally, active consumers connected to a queue receive messages
from it in a round-robin fashion. When consumer priorities are
in use, messages are delivered round-robin if multiple active
consumers exist with the same high priority.

## <a id="definitions" class="anchor" href="#definitions">Definition of Active Consumers</a>

The above paragraphs refer to consumers as being <i>active</i>
or <i>blocked</i>. At any moment, any given consumer is either
one or the other. An active consumer is one which could receive
a message without waiting. A consumer becomes blocked if it
cannot receive messages - because its channel has reached the
maximum number of unacknowledged messages after issuing
`basic.qos`, or simply because of network congestion.

Therefore for each queue, at least one of three things must be true:

1. There are no active consumers
2. The queue is empty
3. The queue is busy delivering messages to consumers

Note that consumers can switch between active and blocked many
times per second. We therefore don't expose whether a consumer
is active or blocked through the management plugin or
[rabbitmqctl](./cli.html).

When consumer priorities are in use, you can expect your highest
priority consumers to receive all the messages until they become
blocked, at which point lower priority consumers will start to
receive some. It's important to understand that RabbitMQ will
still prioritise delivering messages - it will not wait for a
high priority blocked consumer to become unblocked if there is
an active lower priority consumer ready.

## <a id="how-to-use" class="anchor" href="#how-to-use">Using Consumer Priorities</a>

Set the `x-priority` argument in the
`basic.consume` method to an integer value. Consumers
which do not specify a value have priority 0. Larger numbers
indicate higher priority, and both positive and negative numbers
can be used.

For example (in Java):

<pre class="lang-java">
Channel channel = ...;
Consumer consumer = ...;
Map&lt;String, Object> args = new HashMap&lt;String, Object>();
args.put("x-priority", 10);
channel.basicConsume("my-queue", false, args, consumer);
</pre>

This creates a new consumer with priority 10.
