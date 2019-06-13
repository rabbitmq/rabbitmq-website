<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

# Queue Length Limit

## <a id="overview" class="anchor" href="#overview">Overview</a>

The maximum length of a [queue](/queues.html) can be limited to a set number of
messages, or a set number of bytes (the total of all message
body lengths, ignoring message properties and any overheads), or
both.

For any given queue, the maximum length (of either type) can be
defined by clients using the queue's arguments, or in the server
using [policies](/parameters.html#policies). In the
case where both policy and arguments specify a maximum length,
the minimum of the two values is applied.

Queue length settings also can be enforced by [operator policies](/parameters.html#operator-policies).

In all cases the number of <i>ready</i> messages is used; unacknowledged messages
do not count towards the limit.

The fields `messages_ready` and `message_bytes_ready` from
`rabbitmqctl list_queues` and the management API show the values
that would be limited.


## <a id="default-behaviour" class="anchor" href="#default-behaviour">Default Max Queue Length Limit Behaviour</a>

The default behaviour for RabbitMQ when a maximum queue length or
size is set and the maximum is reached is to drop or
[dead-letter](dlx.html) messages from the front
of the queue (i.e. the oldest messages in the queue). To modify
this behaviour, use the `overflow` setting described below.


## <a id="overflow-behaviour" class="anchor" href="#overflow-behaviour">Queue Overflow Behaviour</a>

Use the `overflow` setting to configure queue overflow
behaviour. If `overflow` is set to `reject-publish`,
the most recently published messages will be discarded. In addition, if
[publisher confirms](confirms.html#publisher-confirms)
are enabled, the publisher will be informed of the reject via a
`basic.nack` message. If a message is routed to multiple
queues and rejected by at least one of them, the channel will inform
the publisher via `basic.nack`. The message will still be
published to all other queues which can enqueue it.


## <a id="definition" class="anchor" href="#definition">Define Max Queue Length Using a Policy</a>

To specify a maximum length using policy, add the key
`max-length` and / or `max-length-bytes`
to a policy definition. For example:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
<pre class="lang-bash">
rabbitmqctl set_policy my-pol "^one-meg$" \
  '{"max-length-bytes":1048576}' \
  --apply-to queues
</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl on Windows</th>
    <td>
<pre class="lang-powershell">
rabbitmqctl.bat set_policy my-pol "^one-meg$" ^
  "{""max-length-bytes"":1048576}" ^
  --apply-to queues
</pre>
    </td>
  </tr>
</table>

The `my-pol` policy ensures that the `one-meg`
queue contains no more than 1MiB of message data. When the 1MiB limit
is reached, the oldest messages are discarded from the head of the
queue.

To define an overflow behaviour - whether to drop messages from head
or to reject new publishes, add the key `overflow` to a
policy definition. For example:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
<pre class="lang-bash">
rabbitmqctl set_policy my-pol "^two-messages$" \
  '{"max-length":2,"overflow":"reject-publish"}' \
  --apply-to queues
</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl on Windows</th>
    <td>
<pre class="lang-powershell">
rabbitmqctl.bat set_policy my-pol "^two-messages$" ^
  "{""max-length"":2,""overflow"":""reject-publish""}" ^
  --apply-to queues
</pre>
    </td>
  </tr>
</table>

The `my-pol` policy ensures that the `two-messages`
queue contains no more than 2 messages and all additional publishes
are sent `basic.nack` responses as long as the queue
contains 2 messages and publisher confirms are enabled.

Policies can also be defined using the management plugin, see
the [policy documentation](parameters.html#policies) for more details.


## <a id="definition-using-x-args" class="anchor" href="#definition-using-x-args">Define Max Queue Length Using x-arguments During Declaration</a>

Maximum number of messages can be set by supplying the
`x-max-length` queue declaration argument with a
non-negative integer value.

Maximum length in bytes can be set by supplying the
`x-max-length-bytes` queue declaration argument with a
non-negative integer value.

If both arguments are set then both will apply; whichever limit
is hit first will be enforced.

Overflow behaviour can be set by supplying the
`x-overflow` queue declaration argument with a
string value. Possible values are `drop-head` (default) or
`reject-publish`

This example in Java declares a queue with a maximum length
of 10 messages:

<pre class="lang-java">
Map&lt;String, Object> args = new HashMap&lt;String, Object>();
args.put("x-max-length", 10);
channel.queueDeclare("myqueue", false, false, false, args);
</pre>
