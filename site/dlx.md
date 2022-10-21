<!--
Copyright (c) 2007-2022 VMware, Inc. or its affiliates.

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

## <a id="overview" class="anchor" href="#overview">Overview</a>

Messages from a queue can be "dead-lettered"; that is, republished to
an exchange when any of the following events occur:

 * The message is [negatively acknowledged](./confirms.html) by a consumer using `basic.reject` or
   `basic.nack` with `requeue` parameter set to `false`.
 * The message expires due to [per-message TTL](./ttl.html); or
 * The message is dropped because its queue exceeded a [length limit](./maxlength.html)

Note that expiration of a queue will not dead letter the messages in it.

Dead letter exchanges (DLXs) are normal exchanges. They can be
any of the usual types and are declared as usual.

For any given queue, a DLX can be defined by clients using the
[queue's arguments](./queues.html#optional-arguments), or in the server
using [policies](./parameters.html#policies). In the
case where both policy and arguments specify a DLX, the one
specified in arguments overrules the one specified in policy.

Configuration using policies is recommended as it allows for DLX
reconfiguration that does not involve application redeployment.

## <a id="using-policies" class="anchor" href="#using-policies">Configuration Using a Policy</a>

To specify a DLX using policy, add the key "dead-letter-exchange"
to a policy definition. For example:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
<pre class="lang-bash">
rabbitmqctl set_policy DLX ".*" '{"dead-letter-exchange":"my-dlx"}' --apply-to queues
</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
<pre class="lang-powershell">
rabbitmqctl set_policy DLX ".*" "{""dead-letter-exchange"":""my-dlx""}" --apply-to queues
</pre>
    </td>
  </tr>
</table>

The policy above applies the DLX "my-dlx" to all queues. This is merely an example, in practice
different sets of queues will likely use different dead lettering settings (or none at all)

Similarly, an explicit routing key can be specified by adding
the key "dead-letter-routing-key" to the policy.

Policies can also be defined using the management plugin, see
the [policy documentation](parameters.html#policies) for more details.

## <a id="using-optional-queue-arguments" class="anchor" href="#using-optional-queue-arguments">Configuration Using Optional Queue Arguments</a>

To set the dead letter exchange for a queue, specify
the optional `x-dead-letter-exchange` argument when
declaring the queue. The value must be an exchange name in
the same virtual host:

<pre class="lang-java">
channel.exchangeDeclare("some.exchange.name", "direct");

Map&lt;String, Object&gt; args = new HashMap&lt;String, Object&gt;();
args.put("x-dead-letter-exchange", "some.exchange.name");
channel.queueDeclare("myqueue", false, false, false, args);
</pre>

The code above declares a new exchange called
`some.exchange.name` and sets this new exchange
as the dead letter exchange for a newly created queue.
Note that the exchange does not have to be declared when
the queue is declared, but it should exist by the time
messages need to be dead-lettered; if it is missing then,
the messages will be silently dropped.

You may also specify a routing key to be used when
dead-lettering messages.  If this is not set, the
message's own routing keys will be used.

<pre class="lang-java">
args.put("x-dead-letter-routing-key", "some-routing-key");
</pre>

When a dead letter exchange has been specified, in addition to
the usual configure permissions on the declared queue, the user
needs to have read permissions on that queue and write
permissions on the dead letter exchange. Permissions are
verified at the time of queue declaration.

## <a id="routing" class="anchor" href="#routing">Routing Dead-Lettered Messages</a>

Dead-lettered messages are routed to their dead letter
exchange either:

 * with the routing key specified for the queue they
   were on; or, _if this was not set_,
 * with the same routing keys they were originally
   published with

For example, if you publish a message to an exchange with
routing key `foo`, and that message is
dead-lettered, it will be published to its dead letter
exchange with routing key `foo`.  If the queue
the message originally landed on had been declared with
`x-dead-letter-routing-key` set to
`bar`, then the message will be published to
its dead letter exchange with routing key
`bar`.

Note that, if a specific routing key was not set for the
queue, messages on it are dead-lettered with <em>all</em>
their original routing keys.  This includes routing keys
added by the `CC` and `BCC` headers
(see [Sender-selected distribution](sender-selected.html) for details on these two headers).


It is possible to form a cycle of message dead-lettering.  For
instance, this can happen when a queue dead-letters
messages to the default exchange without specifying a
dead-letter routing key.  Messages in such cycles (i.e.
messages that reach the same queue twice) will be
dropped <em>if there was no rejections in the entire cycle</em>.

## <a id="safety" class="anchor" href="#safety">Safety</a>

By default, dead-lettered messages are re-published <em>without</em> publisher
[confirms](confirms.html) turned on internally. Therefore using DLX in a clustered
RabbitMQ environment is not guaranteed to be safe. Messages are removed from the
original queue immediately after publishing to the DLX target queue. This ensures
that there is no chance of excessive message buildup that could exhaust broker
resources, but messages can be lost if the target queue isn't available to accept messages.

Since RabbitMQ 3.10 quorum queues support [at-least-once dead-lettering](./quorum-queues.html#dead-lettering)
where messages are re-published with publisher confirms turned on internally.

## <a id="effects" class="anchor" href="#effects">Dead-Lettered Effects on Messages</a>

Dead-lettering a message modifies its headers:

 * the exchange name is replaced with that of the latest dead-letter exchange,
 * the routing key may be replaced with that specified in a queue performing dead lettering,
 * if the above happens, the `CC` header will also be removed, and
 * the `BCC` header will be removed as per [Sender-selected distribution](sender-selected.html)

The dead-lettering process adds an array to the header of
each dead-lettered message named `x-death`.
This array contains an entry for each dead lettering event,
identified by a pair of `{queue, reason}`.
Each such entry is a table that consists
of several fields:

 * `queue`: the name of the queue the message was in before it was dead-lettered
 * `reason`: reason for dead lettering, see below
 * `time`: the date and time the message was dead lettered as a 64-bit AMQP 0-9-1 timestamp
 * `exchange` - the exchange the message was published to (note that this will be a dead letter
    exchange if the message is dead lettered multiple times)
 * `routing-keys`: the routing keys (including `CC` keys but excluding
   `BCC` ones) the message was published with
 * `count`: how many times this message was dead-lettered in this queue for this reason
 * `original-expiration` (if the message was dead-lettered due to [per-message TTL](ttl.html#per-message-ttl)): the
   original `expiration` property of the message. The `expiration` property is removed from the
   message on dead-lettering in order to prevent it from expiring again in any queues it is routed to.

New entries are prepended to the beginning of the `x-death`
array. In case `x-death` already contains an entry with
the same queue and dead lettering reason, its count field will be
incremented and it will be moved to the beginning of the array.

The `reason` is a name describing why the
message was dead-lettered and is one of the following:

 * `rejected`: the message was rejected with `requeue` parameter set to `false`
 * `expired`: the [message TTL](./ttl.html) has expired
 * `maxlen`: the [maximum allowed queue length](./maxlength.html) was exceeded
 * `delivery_limit`: the message has been returned more times than the limit (set by policy argument [delivery-limit](./quorum-queues.html#poison-message-handling) of quorum queues).

Three top-level headers are added for the very first dead-lettering
event. They are

 * `x-first-death-reason`
 * `x-first-death-queue`
 * `x-first-death-exchange`

They have the same values as the `reason`, `queue`,
and `exchange` fields of the original dead lettering event.
Once added, these headers are never modified.

Note that the array is sorted most-recent-first, so the
most recent dead-lettering will be recorded in the first
entry.

## <a id="use-cases" class="anchor" href="#use-cases">Use cases</a>

By publishing a message to a queue with no consumers and, when the [message TTL](./ttl.html) expires, republishing the message to another queue with consumers, is it possible to simulate delayed messages. This is the approach used by [NServiceBus](https://docs.particular.net/transports/rabbitmq/delayed-delivery).
