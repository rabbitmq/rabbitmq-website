<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Consumer Cancel Notification

## <a id="overview" class="anchor" href="#overview">Overview</a>

When a channel is consuming from a queue, there are various
reasons which could cause the consumption to stop. One of
these is obviously if the client issues a
`basic.cancel` on the same channel, which will
cause the consumer to be cancelled and the server replies
with a `basic.cancel-ok`. Other events, such as
the queue being deleted, or in a clustered scenario, the
node on which the queue is located failing, will cause the
consumption to be cancelled, but the client channel will not
be informed, which is frequently unhelpful.

To solve this, we have introduced an extension in which the
broker will send to the client a `basic.cancel`
in the case of such unexpected consumer cancellations. This
is not sent in the case of the broker receiving a
`basic.cancel` from the client. AMQP 0-9-1
clients don't by default expect to receive
`basic.cancel` methods from the broker
asynchronously, and so in order to enable this behaviour,
the client must present a `capabilities` table in
its `client-properties` in which there is a key
`consumer_cancel_notify` and a boolean value
`true`. See the [section on capabilities](#capabilities) for details.

Our supported clients present this capability by default to
the broker and thus will be sent the asynchronous
`basic.cancel` method by the broker, which they
present to the consumer callback. For example, in our Java
client, the `Consumer` interface has a
`handleCancel` callback, which can be overridden
by sub-classing the `DefaultConsumer` class:

<pre class="lang-java">
channel.queueDeclare(queue, false, true, false, null);
Consumer consumer = new DefaultConsumer(channel) {
    @Override
    public void handleCancel(String consumerTag) throws IOException {
        // consumer has been cancelled unexpectedly
    }
};
channel.basicConsume(queue, consumer);
</pre>

It is not an error for the client to issue a
`basic.cancel` for a consumer which has been
unexpectedly cancelled (e.g. due to queue deletion). By
definition, there is a race possible between a client
issuing a `basic.cancel`, and the broker sending
out the asynchronous notification. In such cases, the broker
does not error when it receives the
`basic.cancel` and replies with a
`basic.cancel-ok` as normal.

### <a id="mirroring" class="anchor" href="#mirroring">Consumer Cancellation and Mirrored Queues</a>

Clients supporting consumer cancel notification will always be
informed when a queue is deleted or becomes
unavailable. Consumers <em>may</em> request that they should be cancelled
when a mirrored queue fails over (see the page on [mirrored queues](/ha.html)
for why and how this can be done).


## <a id="capabilities" class="anchor" href="#capabilities">Client and Server Capabilities</a>

The AMQP 0-9-1 specification defines a
way for clients and servers to express their capabilities using
the `capabilities` field as part of the
`connection.open` method. This field was
deprecated in the AMQP 0-9-1 specification and is not
inspected by the RabbitMQ broker. As specified in AMQP 0-8,
it also suffered from being a `shortstr`: a
string of no more than 256 characters.

There is good reason for both the client and the server
being able to present extensions and capabilities that they
support, thus we have introduced an alternative form of
capabilities. In the `server-properties` field of
`connection.start`, and in the
`client-properties` field of
`connection.start-ok`, the field value (a
`peer-properties` table) can optionally contain a
key named `capabilities` for which the value is
another table, in which the keys name the capabilities
supported. The values for these capability keys are
typically booleans, indicating whether or not the capability
is supported, but may vary based on the nature of the
capability.

For example, the `server-properties` presented by
the RabbitMQ broker to a client may look like:

<pre class="lang-haskell">
{ "product"      = (longstr) "RabbitMQ",
  "platform"     = (longstr) "Erlang/OTP",
  "information"  = (longstr) "Licensed under the MPL.  See https://www.rabbitmq.com/",
  "copyright"    = (longstr) "Copyright (c) 2007-2019 Pivotal Software, Inc.",
  "capabilities" = (table)   { "exchange_exchange_bindings" = (bool) true,
                               "consumer_cancel_notify"     = (bool) true,
                               "basic.nack"                 = (bool) true,
                               "publisher_confirms"         = (bool) true },
  "version"      = (longstr) "3.7.12" }
</pre>

Note that it is optional for clients to present this
`capabilities` table as part of the
`client-properties` table: failure to present
such a table does not preclude the client from being able to
use extensions such as [exchange to exchange bindings](/e2e.html).
However, in some cases such as consumer cancellation notification,
the client must present the associated capability otherwise the broker will have no
way of knowing that the client is capable of receiving the additional notifications.
