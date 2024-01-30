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

# Time-to-Live and Expiration

Key topics covered in this documentation guide are

 * An overview of queue TTL and message TTL features supported by RabbitMQ
 * Per-queue [message TTL defined at the queue level](#per-queue-message-ttl)
 * Per-message [TTL defined by publishers](#per-message-ttl-in-publishers)
 * [Message TTL and dead lettering](#message-ttl-dead-lettering)
 * [Message TTL applied retroactively](#message-ttl-applied-retroactively)
 * [Queue TTL](#queue-ttl) (expiration of queues)


## <a id="overview" class="anchor" href="#overview">Time-To-Live Feature</a>

With RabbitMQ, you can set a TTL (time-to-live) argument or policy for messages and queues. As the name suggests, TTL specifies the time period that the messages and queues "live for".

Message TTL determines how long messages can be retained in a queue. If the retention period of a message in a queue exceeds the message TTL of the queue, the message expires and is discarded.

"Discarded" means that the message will not be delivered to any of subscribed consumers and won't be accessible through `basic.get` method applied directly on queue. Message TTL can be applied to a single queue, a group of queues, or applied on the message-by-message basis.

TTL can also be set on queues, not just queue contents. This feature can be used together with the auto-delete queue property. Setting TTL (expiration) on queues generally only makes sense for transient (non-durable) classic queues. Streams do not support expiration.

Queues will expire after a period of time only when they are not used (a queue is used if it has online consumers).

TTL behavior is controlled by [optional queue arguments](queues.html) and the best way to configure it is using a [policy](./parameters.html).

TTL settings also can be enforced by [operator policies](./parameters.html#operator-policies).


## <a id="per-queue-message-ttl" class="anchor" href="#per-queue-message-ttl">Per-Queue Message TTL in Queues</a>

Message TTL can be set for a given queue by setting the
`message-ttl` argument with a [policy](./parameters.html#policies)
or by specifying the same argument at the time of queue declaration.

A message that has been in the queue for longer than the configured TTL is said to
be *expired*. Note that a message routed to multiple queues
can expire at different times, or not at all, in each queue in
which it resides. The death of a message in one queue has no
impact on the life of the same message in other queues.

The server **guarantees** that expired messages will not be delivered
using `basic.deliver` (to a consumer) or sent in response to a polling consumer
(in a `basic.get-ok` response).

Further, the server will try to remove messages at or
shortly after their TTL-based expiry.

The value of the TTL argument or policy must be a
non-negative integer (0 &lt;= n),
describing the TTL period in milliseconds. Thus a value of
1000 means that a message added to the queue will live in the
queue for 1 second or until it is delivered to a consumer. The
argument can be of AMQP 0-9-1 type `short-short-int`, `short-int`,
`long-int`, or `long-long-int`.

### <a id="message-ttl-using-policy" class="anchor" href="#message-ttl-using-policy">Define Message TTL for Queues Using a Policy</a>

To specify a TTL using policy, add the key "message-ttl" to a
policy definition:

<table>
    <tr>
        <th>rabbitmqctl</th>
        <td>
            <pre class="lang-bash">rabbitmqctl set_policy TTL ".*" '{"message-ttl":60000}' --apply-to queues</pre>
        </td>
    </tr>
    <tr>
        <th>rabbitmqctl (Windows)</th>
        <td>
            <pre class="lang-powershell">rabbitmqctl set_policy TTL ".*" "{""message-ttl"":60000}" --apply-to queues</pre>
        </td>
    </tr>
</table>

This applies a TTL of 60 seconds to all queues.


### <a id="message-ttl-using-x-args" class="anchor" href="#message-ttl-using-x-args">Define Message TTL for Queues Using x-arguments During Declaration</a>

This example in Java creates a queue in which messages may
reside for at most 60 seconds:

<pre class="lang-java">
Map&lt;String, Object&gt; args = new HashMap&lt;String, Object&gt;();
args.put("x-message-ttl", 60000);
channel.queueDeclare("myqueue", false, false, false, args);
</pre>

The same example in C#:

<pre class="lang-csharp">
var args = new Dictionary&lt;string, object&gt;();
args.Add("x-message-ttl", 60000);
model.QueueDeclare("myqueue", false, false, false, args);
</pre>

It is possible to apply a message TTL policy to a queue which already
has messages in it but this involves [some caveats](#per-message-ttl-applied-retroactively).

The original expiry time of a message is preserved if it
is requeued (for example due to the use of an AMQP method
that features a requeue parameter, or due to a channel
closure).

Setting the TTL to 0 causes messages to be expired upon reaching
a queue unless they can be delivered to a consumer
immediately. Thus this provides an alternative to
the `immediate` publishing flag, which
the RabbitMQ server does not support. Unlike that flag, no
`basic.return`s are issued, and if a dead letter
exchange is set then messages will be dead-lettered.


## <a id="per-message-ttl-in-publishers" class="anchor" href="#per-message-ttl-in-publishers">Per-Message TTL in Publishers</a>

A TTL can be specified on a per-message basis, by setting the
[`expiration` property](./publishers.html#message-properties) when publishing a message.

The value of the `expiration` field describes the
TTL period in milliseconds. The same constraints as for
`x-message-ttl` apply. Since the
`expiration` field must be a string, the broker
will (only) accept the string representation of the number.

When both a per-queue and a per-message TTL are specified, the
lower value between the two will be chosen.

This example uses [RabbitMQ Java client](./api-guide.html)
to publish a message which can reside in the queue for at most 60 seconds:

<pre class="lang-java">
byte[] messageBodyBytes = "Hello, world!".getBytes();
AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder()
                                   .expiration("60000")
                                   .build();
channel.basicPublish("my-exchange", "routing-key", properties, messageBodyBytes);</pre>

The same example in C#:

<pre class="lang-csharp">
byte[] messageBodyBytes = System.Text.Encoding.UTF8.GetBytes("Hello, world!");

IBasicProperties props = model.CreateBasicProperties();
props.ContentType = "text/plain";
props.DeliveryMode = 2;
props.Expiration = "60000";

model.BasicPublish(exchangeName,
                   routingKey, props,
                   messageBodyBytes);</pre>


## <a id="message-ttl-dead-lettering" class="anchor" href="#message-ttl-dead-lettering">Per-Message TTL and Dead Lettering</a>

For queues that have [dead-lettering configured](./dlx.html), it is important to understand
when message expiration and dead lettering kick in for every queue type. Since
queue types have different design goals and implementations, they drop
expired messages (or dead letter them) under different conditions.

### Quorum Queues

[Quorum queues](./quorum-queues.html) dead letter expired messages shortly after message expiration.
"Shortly after" here means that the process of dead-lettering, that is,
republishing to the configured [DLX](./dlx.html), happens concurrently with
other queue activity and does not await the moment when the expired
message reaches the head of the queue.

Note that **overall system load** and the **volume of expired messages**
can affect how long it might take for deadl lettering prcedure to start
and to to complete.

### Classic Queues

Classic queues dead letter expired messages in a few cases:

 * When message reaches queue head
 * When the queue is notified of a policy change that affects it


## <a id="message-ttl-applied-retroactively" class="anchor" href="#message-ttl-applied-retroactively">Per-message TTL Applied Retroactively (to an Existing Queue)</a>

Queues that had a per-message TTL applied to them
retroactively (when they already had messages) will discard
the messages when specific events occur.

Only when expired messages reach the head of a queue will they actually be
discarded (marked for deletion). Consumers will not have
expired messages delivered to them. Keep in mind that
there can be a natural race condition between message expiration
and consumer delivery, e.g. a message can expire
after it was written to the socket but before it has reached
a consumer.

When setting per-message TTL expired messages can queue up
behind non-expired ones until the latter are consumed or
expired. Hence resources used by such expired messages will
not be freed, and they will be counted in queue statistics
(e.g. the number of messages in the queue).

When retroactively applying a per-message TTL policy, it is
recommended to have consumers online to make sure the
messages are discarded quicker.

Given this behaviour of per-message TTL settings on existing
queues, when the need to delete messages to free up
resources arises, queue TTL should be used instead (or queue
purging, or queue deletion).


## <a id="queue-ttl" class="anchor" href="#queue-ttl">Queue TTL</a>

TTL can also be set on queues, not just queue contents.
This feature can be used together with the [auto-delete queue property](queues.html).

Setting TTL (expiration) on queues generally only makes sense
for transient (non-durable) classic queues. Streams
do not support expiration.

Queues will expire after a period of time only when they
are not used (a queue is used if it has online consumers).

Expiry time can be set for a given queue by setting the
`x-expires` argument to `queue.declare`,
or by setting the `expires` [policy](parameters.html#policies). This controls for
how long a queue can be unused before it is automatically
deleted. Unused means the queue has no consumers, the
queue has not been recently redeclared (redeclaring renews the lease),
and `basic.get` has not been invoked for a duration of at least the expiration
period. This can be used, for example, for RPC-style reply
queues, where many queues can be created which may never be
drained.

The server guarantees that the queue will be deleted, if
unused for at least the expiration period. No guarantee is
given as to how promptly the queue will be removed after the
expiration period has elapsed.

The value of the `x-expires` argument or
`expires` policy describes the expiration period in
milliseconds. It must be a positive integer (unlike message
TTL it cannot be 0). Thus a value of 1000 means a queue which
is unused for 1 second will be deleted.


### <a id="queue-ttl-using-policy" class="anchor" href="#queue-ttl-using-policy">Define Queue TTL for Queues Using a Policy</a>

The following policy makes all queues expire after 30 minutes since last use:

<table>
    <tr>
        <th>rabbitmqctl</th>
        <td>
            <pre class="lang-bash">rabbitmqctl set_policy expiry ".*" '{"expires":1800000}' --apply-to queues</pre>
        </td>
    </tr>
    <tr>
        <th>rabbitmqctl (Windows)</th>
        <td>
            <pre class="lang-powershell">rabbitmqctl.bat set_policy expiry ".*" "{""expires"":1800000}" --apply-to queues</pre>
        </td>
    </tr>
</table>

### <a id="queue-ttl-using-x-args" class="anchor" href="#queue-ttl-using-x-args">Define Queue TTL for Queues Using x-arguments During Declaration</a>

This example in Java creates a queue which expires after
it has been unused for 30 minutes.

<pre class="lang-java">
Map&lt;String, Object&gt; args = new HashMap&lt;String, Object&gt;();
args.put("x-expires", 1800000);
channel.queueDeclare("myqueue", false, false, false, args);
</pre>
