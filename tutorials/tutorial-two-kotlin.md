---
title: RabbitMQ tutorial - Work Queues
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
import T2DiagramToC from '@site/src/components/Tutorials/T2DiagramToC.md';
import T2DiagramPrefetch from '@site/src/components/Tutorials/T2DiagramPrefetch.md';

# RabbitMQ tutorial - Work Queues

## Work Queues
### (using the Kotlin Client)

<TutorialsHelp/>

<T2DiagramToC/>

In the [first tutorial](./tutorial-one-kotlin) we
wrote programs to send and receive messages from a named queue. In this
one we'll create a _Work Queue_ that will be used to distribute
time-consuming tasks among multiple workers.

The main idea behind Work Queues (aka: _Task Queues_) is to avoid
doing a resource-intensive task immediately and having to wait for
it to complete. Instead we schedule the task to be done later. We encapsulate a
_task_ as a message and send it to a queue. A worker process running
in the background will pop the tasks and eventually execute the
job. When you run many workers the tasks will be shared between them.

This concept is especially useful in web applications where it's
impossible to handle a complex task during a short HTTP request
window.

Preparation
-----------

In the previous part of this tutorial we sent a message containing
"Hello World!". Now we'll be sending strings that stand for complex
tasks. We don't have a real-world task, like images to be resized or
pdf files to be rendered, so let's fake it by just pretending we're
busy - by using the `delay()` function. We'll take the number of dots
in the string as its complexity; every dot will account for one second
of "work". For example, a fake task described by `Hello...`
will take three seconds.

We will slightly modify the `send` function from our previous example,
to allow messages to be sent as tasks. This
program will schedule tasks to our work queue, so let's name it
`newTask`:

```kotlin
suspend fun newTask(coroutineScope: CoroutineScope, message: String) {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    channel.queueDeclare(
        "task_queue",
        durable = true,
        exclusive = false,
        autoDelete = false,
        arguments = emptyMap()
    )

    val properties = properties {
        deliveryMode = 2u  // Persistent message
    }

    channel.basicPublish(
        message.toByteArray(),
        exchange = "",
        routingKey = "task_queue",
        properties = properties
    )
    println(" [x] Sent '$message'")

    channel.close()
    connection.close()
}
```

Our old `receive` function also requires some changes: it needs to
fake a second of work for every dot in the message body. It will handle
delivered messages and perform the task, so let's call it `worker`:

```kotlin
suspend fun worker(coroutineScope: CoroutineScope) {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    channel.queueDeclare(
        "task_queue",
        durable = true,
        exclusive = false,
        autoDelete = false,
        arguments = emptyMap()
    )
    println(" [*] Waiting for messages. To exit press CTRL+C")

    val consumer = channel.basicConsume("task_queue", noAck = true)

    for (delivery in consumer) {
        val message = delivery.message.body.decodeToString()
        println(" [x] Received '$message'")

        try {
            doWork(message)
        } finally {
            println(" [x] Done")
        }
    }

    channel.close()
    connection.close()
}
```

Our fake task to simulate execution time:

```kotlin
private suspend fun doWork(task: String) {
    for (ch in task) {
        if (ch == '.') {
            delay(1000) // Sleep for 1 second per dot
        }
    }
}
```

Round-robin dispatching
------------------------

One of the advantages of using a Task Queue is the ability to easily
parallelise work. If we are building up a backlog of work, we can just
add more workers and that way, scale easily.

By default, RabbitMQ will send each message to the next consumer,
in sequence. On average every consumer will get the same number of
messages. This way of distributing messages is called round-robin.

Message acknowledgment
----------------------

Doing a task can take a few seconds, you may wonder what happens if
a consumer starts a long task and it terminates before it completes.
With our current code, once RabbitMQ delivers a message to the consumer, it
immediately marks it for deletion. In this case, if you terminate a worker,
the message it was just processing is lost. The messages that were dispatched
to this particular worker but were not yet handled are also lost.

But we don't want to lose any tasks. If a worker dies, we'd like the
task to be delivered to another worker.

In order to make sure a message is never lost, RabbitMQ supports
[message _acknowledgments_](/docs/confirms). An ack(nowledgement) is sent back by the
consumer to tell RabbitMQ that a particular message has been received,
processed and that RabbitMQ is free to delete it.

If a consumer dies (its channel is closed, connection is closed, or
TCP connection is lost) without sending an ack, RabbitMQ will
understand that a message wasn't processed fully and will re-queue it.
If there are other consumers online at the same time, it will then quickly
redeliver it to another consumer. That way you can be sure that no
message is lost, even if the workers occasionally die.

A timeout (30 minutes by default) is enforced on consumer delivery acknowledgement.
This helps detect buggy (stuck) consumers that never acknowledge deliveries.
You can increase this timeout as described in
[Delivery Acknowledgement Timeout](/docs/consumers#acknowledgement-timeout).

[Manual message acknowledgments](/docs/confirms) are turned off by default in the previous examples.
It's time to turn them on using the `noAck = false` flag and send a proper acknowledgment
from the worker, once we're done with a task.

```kotlin
channel.basicQos(count = 1u, global = false)

val consumer = channel.basicConsume("task_queue", noAck = false)

for (delivery in consumer) {
    val message = delivery.message.body.decodeToString()
    println(" [x] Received '$message'")

    try {
        doWork(message)
        println(" [x] Done")
    } finally {
        channel.basicAck(delivery.message, multiple = false)
    }
}
```

Using this code, you can ensure that even if you terminate a worker using
CTRL+C while it was processing a message, nothing is lost. Soon
after the worker terminates, all unacknowledged messages are redelivered.

Acknowledgement must be sent on the same channel that received the
delivery. Attempts to acknowledge using a different channel will result
in a channel-level protocol exception. See the [doc guide on confirmations](/docs/confirms)
to learn more.

> #### Forgotten acknowledgment
>
> It's a common mistake to miss the `basicAck`. It's an easy error,
> but the consequences are serious. Messages will be redelivered
> when your client quits (which may look like random redelivery), but
> RabbitMQ will eat more and more memory as it won't be able to release
> any unacked messages.
>
> In order to debug this kind of mistake you can use `rabbitmqctl`
> to print the `messages_unacknowledged` field:
>
> ```bash
> sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
> ```
>
> On Windows, drop the sudo:
> ```bash
> rabbitmqctl.bat list_queues name messages_ready messages_unacknowledged
> ```

Message durability
------------------

We have learned how to make sure that even if the consumer dies, the
task isn't lost. But our tasks will still be lost if RabbitMQ server stops.

When RabbitMQ quits or crashes it will forget the queues and messages
unless you tell it not to. Two things are required to make sure that
messages aren't lost: we need to mark both the queue and messages as
durable.

First, we need to make sure that the queue will survive a RabbitMQ node restart.
In order to do so, we need to declare it as _durable_:

```kotlin
channel.queueDeclare(
    "task_queue",
    durable = true,
    exclusive = false,
    autoDelete = false,
    arguments = emptyMap()
)
```

Although this command is correct by itself, it won't work in our present
setup. That's because we've already defined a queue called `hello`
which is not durable. RabbitMQ doesn't allow you to redefine an existing queue
with different parameters and will return an error to any program
that tries to do that. But there is a quick workaround - let's declare
a queue with different name, for example `task_queue`:

```kotlin
channel.queueDeclare(
    "task_queue",
    durable = true,
    exclusive = false,
    autoDelete = false,
    arguments = emptyMap()
)
```

This `durable` option change needs to be applied to both the producer
and consumer code.

At this point we're sure that the `task_queue` queue won't be lost
even if RabbitMQ restarts. Now we need to mark our messages as persistent
- by setting `deliveryMode` property to `2u`.

```kotlin
val properties = properties {
    deliveryMode = 2u  // Persistent message
}

channel.basicPublish(
    message.toByteArray(),
    exchange = "",
    routingKey = "task_queue",
    properties = properties
)
```

> #### Note on message persistence
>
> Marking messages as persistent doesn't fully guarantee that a message
> won't be lost. Although it tells RabbitMQ to save the message to disk,
> there is still a short time window when RabbitMQ has accepted a message and
> hasn't saved it yet. Also, RabbitMQ doesn't do `fsync(2)` for every
> message -- it may be just saved to cache and not really written to the
> disk. The persistence guarantees aren't strong, but it's more than enough
> for our simple task queue. If you need a stronger guarantee then you can use
> [publisher confirms](/docs/confirms).

Fair dispatch
-------------

<T2DiagramPrefetch/>

You might have noticed that the dispatching still doesn't work exactly
as we want. For example in a situation with two workers, when all
odd messages are heavy and even messages are light, one worker will be
constantly busy and the other one will do hardly any work. Well,
RabbitMQ doesn't know anything about that and will still dispatch
messages evenly.

This happens because RabbitMQ just dispatches a message when the message
enters the queue. It doesn't look at the number of unacknowledged
messages for a consumer. It just blindly dispatches every n-th message
to the n-th consumer.

In order to defeat that we can use the `basicQos` method with the
`count = 1u` setting. This tells RabbitMQ not to give more than
one message to a worker at a time. Or, in other words, don't dispatch
a new message to a worker until it has processed and acknowledged the
previous one. Instead, it will dispatch it to the next worker that is not still busy.

```kotlin
channel.basicQos(count = 1u, global = false)
```

> #### Note about queue size
>
> If all the workers are busy, your queue can fill up. You will want to keep an
> eye on that, and maybe add more workers, or use [message TTL](/docs/ttl).

Putting it all together
-----------------------

Final code of our `newTask` function:

```kotlin
import dev.kourier.amqp.connection.amqpConfig
import dev.kourier.amqp.connection.createAMQPConnection
import dev.kourier.amqp.properties
import kotlinx.coroutines.CoroutineScope

suspend fun newTask(coroutineScope: CoroutineScope, message: String) {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    channel.queueDeclare(
        "task_queue",
        durable = true,
        exclusive = false,
        autoDelete = false,
        arguments = emptyMap()
    )

    val properties = properties {
        deliveryMode = 2u  // Persistent message
    }

    channel.basicPublish(
        message.toByteArray(),
        exchange = "",
        routingKey = "task_queue",
        properties = properties
    )
    println(" [x] Sent '$message'")

    channel.close()
    connection.close()
}
```

And our `worker`:

```kotlin
import dev.kourier.amqp.connection.amqpConfig
import dev.kourier.amqp.connection.createAMQPConnection
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay

suspend fun worker(coroutineScope: CoroutineScope) {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    channel.queueDeclare(
        "task_queue",
        durable = true,
        exclusive = false,
        autoDelete = false,
        arguments = emptyMap()
    )
    println(" [*] Waiting for messages. To exit press CTRL+C")

    channel.basicQos(count = 1u, global = false)

    val consumer = channel.basicConsume("task_queue", noAck = false)

    for (delivery in consumer) {
        val message = delivery.message.body.decodeToString()
        println(" [x] Received '$message'")

        try {
            doWork(message)
            println(" [x] Done")
        } finally {
            channel.basicAck(delivery.message, multiple = false)
        }
    }

    channel.close()
    connection.close()
}

private suspend fun doWork(task: String) {
    for (ch in task) {
        if (ch == '.') {
            delay(1000) // Sleep for 1 second per dot
        }
    }
}
```

Using message acknowledgments and `basicQos` you can set up a
work queue. The durability options let the tasks survive even if
RabbitMQ is restarted.

Now we can move on to [tutorial 3](./tutorial-three-kotlin) and learn how
to deliver the same message to many consumers.
