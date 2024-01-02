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
# RabbitMQ tutorial - Reliable Publishing with Publisher Confirms SUPPRESS-RHS

## Publisher Confirms

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

[Publisher confirms](../confirms.html#publisher-confirms)
are a RabbitMQ extension to implement reliable
publishing. When publisher confirms are enabled on a channel,
messages the client publishes are confirmed asynchronously
by the broker, meaning they have been taken care of on the server
side.


### (using [php-amqplib](https://github.com/php-amqplib/php-amqplib))

### Overview

In this tutorial we're going to use publisher confirms to make
sure published messages have safely reached the broker. We will
cover several strategies to using publisher confirms and explain
their pros and cons.


### Enabling Publisher Confirms on a Channel

Publisher confirms are a RabbitMQ extension to the AMQP 0.9.1 protocol,
so they are not enabled by default. Publisher confirms are
enabled at the channel level with the `confirm_select` method:

<pre class="lang-php">
$channel = $connection->channel();
$channel->confirm_select();
</pre>

This method must be called on every channel that you expect to use publisher
confirms. Confirms should be enabled just once, not for every message published.

### Strategy #1: Publishing Messages Individually

Let's start with the simplest approach to publishing with confirms,
that is, publishing a message and waiting synchronously for its confirmation:

<pre class="lang-php">
while (thereAreMessagesToPublish()) {
    $data = "Hello World!";
    $msg = new AMQPMessage($data);
    $channel->basic_publish($msg, 'exchange');
    // uses a 5 second timeout
    $channel->wait_for_pending_acks(5.000);
}
</pre>

In the previous example we publish a message as usual and wait for its
confirmation with the `$channel::wait_for_pending_acks(int|float)` method.
The method returns as soon as the message has been confirmed. If the
message is not confirmed within the timeout or if it is nack-ed (meaning
the broker could not take care of it for some reason), the method will
throw an exception. The handling of the exception usually consists
in logging an error message and/or retrying to send the message.

Different client libraries have different ways to synchronously deal with publisher confirms,
so make sure to read carefully the documentation of the client you are using.

This technique is very straightforward but also has a major drawback:
it **significantly slows down publishing**, as the confirmation of a message blocks the publishing
of all subsequent messages. This approach is not going to deliver throughput of
more than a few hundreds of published messages per second. Nevertheless, this can be
good enough for some applications.

> #### Are Publisher Confirms Asynchronous?
>
> We mentioned at the beginning that the broker confirms published
> messages asynchronously but in the first example the code waits
> synchronously until the message is confirmed. The client actually
> receives confirms asynchronously and unblocks the call to `wait_for_pending_acks`
> accordingly. Think of `wait_for_pending_acks` as a synchronous helper
> which relies on asynchronous notifications under the hood.


### Strategy #2: Publishing Messages in Batches

To improve upon our previous example, we can publish a batch
of messages and wait for this whole batch to be confirmed.
The following example uses a batch of 100:

<pre class="lang-php">
$batch_size = 100;
$outstanding_message_count = 0;
while (thereAreMessagesToPublish()) {
    $data = ...;
    $msg = new AMQPMessage($data);
    $channel->basic_publish($msg, 'exchange');
    $outstanding_message_count++;
    if ($outstanding_message_count === $batch_size) {
        $channel->wait_for_pending_acks(5.000);
        $outstanding_message_count = 0;
    }
}
if ($outstanding_message_count > 0) {
    $channel->wait_for_pending_acks(5.000);
}
</pre>

Waiting for a batch of messages to be confirmed improves throughput drastically over
waiting for a confirm for individual message (up to 20-30 times with a remote RabbitMQ node).
One drawback is that we do not know exactly what went wrong in case of failure,
so we may have to keep a whole batch in memory to log something meaningful or
to re-publish the messages. And this solution is still synchronous, so it
blocks the publishing of messages.


### Strategy #3: Handling Publisher Confirms Asynchronously

The broker confirms published messages asynchronously, one just needs
to register a callback on the client to be notified of these confirms:

<pre class="lang-php">
$channel = $connection->channel();
$channel->confirm_select();

$channel->set_ack_handler(
    function (AMQPMessage $message){
        // code when message is confirmed
    }
);

$channel->set_nack_handler(
    function (AMQPMessage $message){
        // code when message is nack-ed
    }
);
</pre>

There are 2 callbacks: one for confirmed messages and one for nack-ed messages
(messages that can be considered lost by the broker). Each callback has
`AMQPMessage $message` parameter with returned message, so you don't need to
handle sequence numbers (delivery tag) to understand which message this callback belongs to.

### Summary

Making sure published messages made it to the broker can be essential in some applications.
Publisher confirms are a RabbitMQ feature that helps to meet this requirement. Publisher
confirms are asynchronous in nature but it is also possible to handle them synchronously.
There is no definitive way to implement publisher confirms, this usually comes down
to the constraints in the application and in the overall system. Typical techniques are:

 * publishing messages individually, waiting for the confirmation synchronously: simple, but very
 limited throughput.
 * publishing messages in batch, waiting for the confirmation synchronously for a batch: simple, reasonable
 throughput, but hard to reason about when something goes wrong.
 * asynchronous handling: best performance and use of resources, good control in case of error, but
 can be involved to implement correctly.
