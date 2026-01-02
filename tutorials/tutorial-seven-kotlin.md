---
title: RabbitMQ tutorial - Publisher Confirms
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';

# RabbitMQ tutorial - Publisher Confirms

## Publisher Confirms
### (using the Kotlin Client)

<TutorialsHelp/>

[Publisher confirms](/docs/confirms#publisher-confirms) are a RabbitMQ extension
to implement reliable publishing. When publisher confirms are enabled on a
channel, messages the client publishes are confirmed asynchronously by the
broker, meaning they have been taken care of on the server side.

### Overview

In this tutorial we'll use publisher confirms to make sure published
messages have safely reached the broker. We will cover several
strategies for using publisher confirms and explain their pros and cons.

### Enabling Publisher Confirms on a Channel

Publisher confirms are a RabbitMQ extension to the AMQP 0.9.1 protocol.
Publisher confirms are enabled at the channel level. To enable them, use the
`confirmSelect` method:

```kotlin
channel.confirmSelect()
```

This method must be called on every channel that you expect to use publisher
confirms. Confirms should be enabled just once, not for every message published.

### Strategy #1: Publishing Messages Individually

Let's start with the simplest approach to publishing with confirms,
that is, publishing a message and waiting synchronously for its confirmation:

```kotlin
suspend fun publishMessagesIndividually(channel: AMQPChannel, messages: List<String>) {
    channel.confirmSelect()

    for (message in messages) {
        channel.basicPublish(
            message.toByteArray(),
            exchange = "",
            routingKey = "my_queue",
            properties = Properties()
        )

        // Wait for confirm
        val confirm = channel.publishConfirmResponses.first()

        when (confirm) {
            is AMQPResponse.Channel.Basic.PublishConfirm.Ack -> {
                println("✓ Message confirmed: $message")
            }
            is AMQPResponse.Channel.Basic.PublishConfirm.Nack -> {
                println("✗ Message rejected: $message")
                // Handle rejection (retry, log, etc.)
            }
        }
    }
}
```

In the previous example we publish a message as usual and wait for its
confirmation with the `first()` call. The method returns as
soon as the message has been confirmed. If the message is not confirmed
within the timeout or if it is nack-ed (meaning the broker could not take
care of it for some reason), the method will throw an exception. The handling
of the exception usually consists in logging an error message and/or retrying
to send the message.

Different client libraries have different ways to synchronously deal with publisher
confirms, so make sure to read carefully the documentation of the client you are using.

This technique is very straightforward but also has a major drawback:
it **significantly slows down publishing**, as the confirmation of a message blocks
the publishing of all subsequent messages. This approach is not going to
deliver throughput of more than a few hundreds of published messages per second.
Nevertheless, this can be good enough for some applications.

> #### Are Publisher Confirms Asynchronous?
>
> We mentioned at the beginning that the broker confirms published
> messages asynchronously but in the first example the code waits
> synchronously until the message is confirmed. The client actually
> receives confirms asynchronously and unblocks the call to `first()`
> accordingly. Think of `first()` as a synchronous helper which
> relies on asynchronous notifications under the hood.

### Strategy #2: Publishing Messages in Batches

To improve upon our previous example, we can publish a batch of messages
and wait for this whole batch to be confirmed. The following example uses
a batch of 100:

```kotlin
suspend fun publishMessagesInBatch(channel: AMQPChannel, messages: List<String>, batchSize: Int) {
    channel.confirmSelect()

    messages.chunked(batchSize).forEach { batch ->
        // Publish entire batch
        batch.forEach { message ->
            channel.basicPublish(
                message.toByteArray(),
                exchange = "",
                routingKey = "my_queue",
                properties = Properties()
            )
        }

        // Wait for all confirms for this batch
        val confirms = channel.publishConfirmResponses.take(batch.size).toList()

        val ackCount = confirms.count { it is AMQPResponse.Channel.Basic.PublishConfirm.Ack }
        val nackCount = confirms.count { it is AMQPResponse.Channel.Basic.PublishConfirm.Nack }

        println("Batch complete: $ackCount acks, $nackCount nacks")

        if (nackCount > 0) {
            // Handle failures (can't identify specific messages easily)
            println("Warning: Some messages in batch were rejected")
        }
    }
}
```

Waiting for a batch of messages to be confirmed improves throughput drastically over
waiting for a confirm for individual message (up to 20-30 times with a remote RabbitMQ node).
One drawback is that we do not know exactly what went wrong in case of failure,
so we may have to keep a whole batch in memory to log something meaningful or
to re-publish the messages. And this solution is still synchronous, so it
blocks the publishing of messages.

### Strategy #3: Handling Publisher Confirms Asynchronously

The broker confirms published messages asynchronously, one just needs to
register a callback on the client to be notified of these confirms:

```kotlin
suspend fun publishMessagesAsync(channel: AMQPChannel, messages: List<String>) {
    channel.confirmSelect()

    val outstandingConfirms = mutableMapOf<ULong, String>()
    var nextDeliveryTag = 1UL

    // Launch coroutine to handle confirms
    val confirmJob = launch {
        channel.publishConfirmResponses.collect { confirm ->
            when (confirm) {
                is AMQPResponse.Channel.Basic.PublishConfirm.Ack -> {
                    if (confirm.multiple) {
                        // Remove all up to and including this tag
                        outstandingConfirms.keys.filter { it <= confirm.deliveryTag }
                            .forEach { outstandingConfirms.remove(it) }
                    } else {
                        outstandingConfirms.remove(confirm.deliveryTag)
                    }
                }
                is AMQPResponse.Channel.Basic.PublishConfirm.Nack -> {
                    val message = outstandingConfirms[confirm.deliveryTag]
                    println("✗ Message nacked: $message")
                    // Handle specific message rejection
                    outstandingConfirms.remove(confirm.deliveryTag)
                }
            }
        }
    }

    // Publish all messages
    messages.forEach { message ->
        outstandingConfirms[nextDeliveryTag] = message

        channel.basicPublish(
            message.toByteArray(),
            exchange = "",
            routingKey = "my_queue",
            properties = Properties()
        )

        nextDeliveryTag++
    }

    // Wait until all confirms are received
    while (outstandingConfirms.isNotEmpty()) {
        delay(10)
    }

    confirmJob.cancel()
}
```

In this example we use Kotlin's Flow API to handle confirms asynchronously. We collect
confirms from the `publishConfirmResponses` flow. The callback will be invoked for each
confirmed message. We keep track of outstanding confirms with a map. When a confirm arrives,
we remove the entry from the map. If the confirm indicates that multiple messages have been
confirmed (the `multiple` field is `true`), we remove all messages up to and including the
confirmed delivery tag.

The async approach for handling confirms requires tracking of published messages. We use
a concurrent map to correlate the publish delivery tag with the message content. This is
necessary for logging meaningful information or to re-publish a message that has been
nack-ed. The handling of confirms can also be decomposed into a fire-and-forget approach:
a background task or flow can handle the confirms and update the map accordingly.

### Summary

Making sure published messages made it to the broker can be essential in some applications.
Publisher confirms are a RabbitMQ feature that helps to meet this requirement. Publisher
confirms are asynchronous in nature but it is also possible to handle them synchronously.
There is no definitive way to implement publisher confirms, this usually comes down to
the constraints in the application and in the overall system. Typical techniques are:

* publish messages individually, wait for the confirmation synchronously: simple, but very
  limited throughput.
* publish messages in batch, wait for the confirmation synchronously for a batch: simple,
  reasonable throughput, but hard to reason about when something goes wrong.
* asynchronous handling: best performance and use of resources, good control in case of
  error, but can be involved to implement correctly.

### Putting it all together

The full example code:

```kotlin
import dev.kourier.amqp.AMQPResponse
import dev.kourier.amqp.Properties
import dev.kourier.amqp.connection.amqpConfig
import dev.kourier.amqp.connection.createAMQPConnection
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList

suspend fun publishMessagesIndividually(channel: AMQPChannel, messages: List<String>) {
    channel.confirmSelect()

    for (message in messages) {
        channel.basicPublish(
            message.toByteArray(),
            exchange = "",
            routingKey = "my_queue",
            properties = Properties()
        )

        val confirm = channel.publishConfirmResponses.first()

        when (confirm) {
            is AMQPResponse.Channel.Basic.PublishConfirm.Ack -> {
                println("✓ Message confirmed: $message")
            }
            is AMQPResponse.Channel.Basic.PublishConfirm.Nack -> {
                println("✗ Message rejected: $message")
            }
        }
    }
}

suspend fun publishMessagesInBatch(channel: AMQPChannel, messages: List<String>, batchSize: Int) {
    channel.confirmSelect()

    messages.chunked(batchSize).forEach { batch ->
        batch.forEach { message ->
            channel.basicPublish(
                message.toByteArray(),
                exchange = "",
                routingKey = "my_queue",
                properties = Properties()
            )
        }

        val confirms = channel.publishConfirmResponses.take(batch.size).toList()

        val ackCount = confirms.count { it is AMQPResponse.Channel.Basic.PublishConfirm.Ack }
        val nackCount = confirms.count { it is AMQPResponse.Channel.Basic.PublishConfirm.Nack }

        println("Batch complete: $ackCount acks, $nackCount nacks")

        if (nackCount > 0) {
            println("Warning: Some messages in batch were rejected")
        }
    }
}

suspend fun publishMessagesAsync(channel: AMQPChannel, messages: List<String>) {
    channel.confirmSelect()

    val outstandingConfirms = mutableMapOf<ULong, String>()
    var nextDeliveryTag = 1UL

    val confirmJob = launch {
        channel.publishConfirmResponses.collect { confirm ->
            when (confirm) {
                is AMQPResponse.Channel.Basic.PublishConfirm.Ack -> {
                    if (confirm.multiple) {
                        outstandingConfirms.keys.filter { it <= confirm.deliveryTag }
                            .forEach { outstandingConfirms.remove(it) }
                    } else {
                        outstandingConfirms.remove(confirm.deliveryTag)
                    }
                }
                is AMQPResponse.Channel.Basic.PublishConfirm.Nack -> {
                    val message = outstandingConfirms[confirm.deliveryTag]
                    println("✗ Message nacked: $message")
                    outstandingConfirms.remove(confirm.deliveryTag)
                }
            }
        }
    }

    messages.forEach { message ->
        outstandingConfirms[nextDeliveryTag] = message

        channel.basicPublish(
            message.toByteArray(),
            exchange = "",
            routingKey = "my_queue",
            properties = Properties()
        )

        nextDeliveryTag++
    }

    while (outstandingConfirms.isNotEmpty()) {
        delay(10)
    }

    confirmJob.cancel()
}

fun main() = runBlocking {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(this, config)
    val channel = connection.openChannel()

    channel.queueDeclare("my_queue", false, false, true, emptyMap())

    val messages = List(1000) { "Message $it" }

    val startTime = System.currentTimeMillis()
    publishMessagesAsync(channel, messages)
    val duration = System.currentTimeMillis() - startTime

    println("Published ${messages.size} messages in ${duration}ms")

    channel.close()
    connection.close()
}
```

This tutorial is now complete. Note that publisher confirms is an advanced feature
and may not be necessary for all applications. For more information on publisher
confirms and other reliability features, see the [documentation on reliability](/docs/confirms).
