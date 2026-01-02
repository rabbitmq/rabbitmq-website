---
title: RabbitMQ tutorial - "Hello World!"
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
import TutorialsIntro from '@site/src/components/Tutorials/TutorialsIntro.md';
import T1DiagramHello from '@site/src/components/Tutorials/T1DiagramHello.md';
import T1DiagramSending from '@site/src/components/Tutorials/T1DiagramSending.md';
import T1DiagramReceiving from '@site/src/components/Tutorials/T1DiagramReceiving.md';

# RabbitMQ tutorial - "Hello World!"

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## "Hello World"
### (using the Kotlin Client)

In this part of the tutorial we'll write two programs in Kotlin; a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the detail in
the Kotlin API, concentrating on this very simple thing just to get
started. It's the "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<T1DiagramHello/>

> #### The Kotlin client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for RabbitMQ in [many different languages](/client-libraries/devtools). We'll
> use the [Kourier](https://github.com/kourier-amqp/kourier) client library for Kotlin.
>
> Kourier is a modern, coroutine-based AMQP 0-9-1 client for Kotlin. To use it in your project,
> add the following dependency:
>
> **Gradle (Kotlin DSL):**
> ```kotlin
> dependencies {
>     implementation("dev.kourier:amqp-client:x.x.x")
> }
> ```
>
> **Gradle (Groovy DSL):**
> ```groovy
> dependencies {
>     implementation 'dev.kourier:amqp-client:x.x.x'
> }
> ```
>
> **Maven:**
> ```xml
> <dependency>
>     <groupId>dev.kourier</groupId>
>     <artifactId>amqp-client-jvm</artifactId>
>     <version>x.x.x</version>
> </dependency>
> ```
>
> We recommend checking the [Kourier release page](https://github.com/kourier-amqp/kourier/releases)
> for the latest version number, replacing `x.x.x` above with the latest stable release.

Now we have the Kotlin client library set up, we can write some code.

### Sending

<T1DiagramSending/>

We'll call our message publisher (sender) `send` and our message consumer (receiver)
`receive`. The publisher will connect to RabbitMQ, send a single message,
then exit.

We need some imports:

```kotlin
import dev.kourier.amqp.Properties
import dev.kourier.amqp.connection.amqpConfig
import dev.kourier.amqp.connection.createAMQPConnection
import kotlinx.coroutines.CoroutineScope
```

Set up the send function and the queue name:

```kotlin
val queueName = "hello"

suspend fun send(coroutineScope: CoroutineScope) {
    // ...
}
```

Then we can create a connection to the server:

```kotlin
suspend fun send(coroutineScope: CoroutineScope) {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    // Publishing code will go here...

    channel.close()
    connection.close()
}
```

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine we'd simply specify its hostname or IP address here.

Next we create a channel, which is where most of the API for getting
things done resides.

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

```kotlin
channel.queueDeclare(
    queueName,
    durable = false,
    exclusive = false,
    autoDelete = false,
    arguments = emptyMap()
)
val message = "Hello World!"
channel.basicPublish(
    message.toByteArray(),
    exchange = "",
    routingKey = queueName,
    properties = Properties()
)
println(" [x] Sent '$message'")
```

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker [log file](/docs/logging/) to see if there
> is a [resource alarm](/docs/alarms) logged and reduce the
> free disk space threshold if necessary.
> The [Configuration guide](/docs/configure#config-items)
> will show you how to set <code>disk_free_limit</code>.


### Receiving

That's it for our publisher. Our consumer listens for messages from
RabbitMQ, so unlike the publisher which publishes a single message, we'll
keep the consumer running to listen for messages and print them out.

<T1DiagramReceiving/>

Setting up is the same as the publisher; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `send` publishes to.

```kotlin
suspend fun receive(coroutineScope: CoroutineScope) {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    channel.queueDeclare(
        queueName,
        durable = false,
        exclusive = false,
        autoDelete = false,
        arguments = emptyMap()
    )
    println(" [*] Waiting for messages. To exit press CTRL+C")

    // Consuming code will go here...

    channel.close()
    connection.close()
}
```

Note that we declare the queue here, as well. Because we might start
the consumer before the publisher, we want to make sure the queue exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
queue. Since Kourier is built on Kotlin coroutines, consuming messages
is as simple as iterating over a channel:

```kotlin
val consumer = channel.basicConsume(queueName, noAck = true)

for (delivery in consumer) {
    val message = delivery.message.body.decodeToString()
    println(" [x] Received '$message'")
}
```

### Putting it all together

You can wrap both functions in a `main` function with a `runBlocking` block:

```kotlin
import dev.kourier.amqp.Properties
import dev.kourier.amqp.connection.amqpConfig
import dev.kourier.amqp.connection.createAMQPConnection
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

val queueName = "hello"

suspend fun send(coroutineScope: CoroutineScope) {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    channel.queueDeclare(
        queueName,
        durable = false,
        exclusive = false,
        autoDelete = false,
        arguments = emptyMap()
    )
    val message = "Hello World!"
    channel.basicPublish(
        message.toByteArray(),
        exchange = "",
        routingKey = queueName,
        properties = Properties()
    )
    println(" [x] Sent '$message'")

    channel.close()
    connection.close()
}

suspend fun receive(coroutineScope: CoroutineScope) {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    channel.queueDeclare(
        queueName,
        durable = false,
        exclusive = false,
        autoDelete = false,
        arguments = emptyMap()
    )
    println(" [*] Waiting for messages. To exit press CTRL+C")

    val consumer = channel.basicConsume(queueName, noAck = true)

    for (delivery in consumer) {
        val message = delivery.message.body.decodeToString()
        println(" [x] Received '$message'")
    }

    channel.close()
    connection.close()
}

fun main() = runBlocking {
    launch { send(this) }
    launch { receive(this) }

    delay(Long.MAX_VALUE) // Keep the main thread alive
}
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages (Use Ctrl-C to stop it).

> #### Listing queues
>
> You may wish to see what queues RabbitMQ has and how many
> messages are in them. You can do it (as a privileged user) using the `rabbitmqctl` tool:
>
> ```bash
> sudo rabbitmqctl list_queues
> ```
>
> On Windows, omit the sudo:
> ```PowerShell
> rabbitmqctl.bat list_queues
> ```


Time to move on to [part 2](./tutorial-two-kotlin) and build a simple _work queue_.
