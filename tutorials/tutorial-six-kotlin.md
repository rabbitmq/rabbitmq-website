---
title: RabbitMQ tutorial - Remote procedure call (RPC)
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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
import T6DiagramFull from '@site/src/components/Tutorials/T6DiagramFull.md';

# RabbitMQ tutorial - Remote procedure call (RPC)

## Remote procedure call (RPC)
### (using the Kotlin Client)

<TutorialsHelp/>


In the [second tutorial](./tutorial-two-kotlin) we learned how to
use _Work Queues_ to distribute time-consuming tasks among multiple
workers.

But what if we need to run a function on a remote computer and wait for
the result?  Well, that's a different story. This pattern is commonly
known as _Remote Procedure Call_ or _RPC_.

In this tutorial we're going to use RabbitMQ to build an RPC system: a
client and a scalable RPC server. As we don't have any time-consuming
tasks that are worth distributing, we're going to create a dummy RPC
service that returns Fibonacci numbers.

Client interface
----------------

To illustrate how an RPC service could be used we're going to
create a simple client function. It will send an RPC
request and wait until the answer is received:

```kotlin
val result = rpcClient(this, 30)
println("fib(30) = $result")
```

> #### A note on RPC
>
> Although RPC is a pretty common pattern in computing, it's often criticised.
> The problems arise when a programmer is not aware whether a function call
> is local or if it's a slow RPC. Confusions like that result in an
> unpredictable system and adds unnecessary complexity to debugging.
> Instead of simplifying software, misused RPC can result in unmaintainable
> spaghetti code.
>
> Bearing that in mind, consider the following advice:
>
>  * Make sure it's obvious which function call is local and which is remote.
>  * Document your system. Make the dependencies between components clear.
>  * Handle error cases. How should the client react when the RPC server is
>    down for a long time?
>
> When in doubt avoid RPC. If you can, you should use an asynchronous
> pipeline - instead of RPC-like blocking, results are asynchronously
> pushed to a next computation stage.


Callback queue
--------------

In general doing RPC over RabbitMQ is easy. A client sends a request
message and a server replies with a response message. In order to
receive a response we need to send a 'callback' queue address with the
request. We can use the default queue. Let's try it:

```kotlin
val callbackQueueDeclared = channel.queueDeclare(
    name = "",
    durable = false,
    exclusive = true,
    autoDelete = true,
    arguments = emptyMap()
)
val callbackQueueName = callbackQueueDeclared.queueName

val requestProps = properties {
    replyTo = callbackQueueName
}

channel.basicPublish(
    "30".toByteArray(),
    exchange = "",
    routingKey = "rpc_queue",
    properties = requestProps
)

// ... then code to read a response message from the callback queue ...
```

> #### Message properties
>
> The AMQP 0-9-1 protocol predefines a set of 14 properties that go with
> a message. Most of the properties are rarely used, with the exception of
> the following:
>
> * `deliveryMode`: Marks a message as persistent (with a value of 2)
>    or transient (any other value).
> * `contentType`: Used to describe the mime-type of the encoding.
>    For example for the often used JSON encoding it is a good practice
>    to set this property to: `application/json`.
> * `replyTo`: Commonly used to name a callback queue.
> * `correlationId`: Useful to correlate RPC responses with requests.

Correlation Id
--------------

In the method presented above we suggest creating a callback queue for
every RPC request. That's pretty inefficient, but fortunately there is
a better way - let's create a single callback queue per client.

That raises a new issue, having received a response in that queue it's
not clear to which request the response belongs. That's when the
`correlationId` property is used. We're going to set it to a unique
value for every request. Later, when we receive a message in the
callback queue we'll look at this property, and based on that we'll be
able to match a response with a request. If we see an unknown
`correlationId` value, we may safely discard the message - it doesn't
belong to our requests.

You may ask, why should we ignore unknown messages in the callback
queue, rather than failing with an error? It's due to a possibility of
a race condition on the server side. Although unlikely, it is possible
that the RPC server will die just after sending us the answer, but
before sending an acknowledgment message for the request. If that
happens, the restarted RPC server will process the request again.
That's why on the client we must handle the duplicate responses
gracefully, and the RPC should ideally be idempotent.

Summary
-------

<T6DiagramFull/>

Our RPC will work like this:

  * For an RPC request, the Client sends a message with two properties:
    `replyTo`, which is set to a callback queue created just for the request,
    and `correlationId`, which is set to a unique value for every request.
  * The request is sent to an `rpc_queue` queue.
  * The RPC worker (aka: server) is waiting for requests on that queue.
    When a request appears, it does the job and sends a message with the
    result back to the Client, using the queue from the `replyTo` field.
  * The client waits for data on the callback queue. When a message
    appears, it checks the `correlationId` property. If it matches
    the value from the request it returns the response to the application.

Putting it all together
-----------------------

The Fibonacci function:

```kotlin
private fun fib(n: Int): Int {
    return when {
        n == 0 -> 0
        n == 1 -> 1
        else -> fib(n - 1) + fib(n - 2)
    }
}
```

We declare our fibonacci function. It assumes only valid positive integer input.
(Don't expect this one to work for big numbers,
and it's probably the slowest recursive implementation possible).


The code for our RPC server:

```kotlin
import dev.kourier.amqp.connection.amqpConfig
import dev.kourier.amqp.connection.createAMQPConnection
import dev.kourier.amqp.properties
import kotlinx.coroutines.CoroutineScope

suspend fun rpcServer(coroutineScope: CoroutineScope) {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    channel.queueDeclare(
        "rpc_queue",
        durable = false,
        exclusive = false,
        autoDelete = false,
        arguments = emptyMap()
    )

    channel.basicQos(count = 1u, global = false)

    println(" [x] Awaiting RPC requests")

    val consumer = channel.basicConsume("rpc_queue", noAck = false)

    for (delivery in consumer) {
        val props = delivery.message.properties
        val correlationId = props.correlationId
        val replyTo = props.replyTo

        val requestMessage = delivery.message.body.decodeToString()
        val n = requestMessage.toIntOrNull() ?: 0

        println(" [.] fib($n)")
        val response = fib(n)

        val replyProps = properties {
            this.correlationId = correlationId
        }

        if (replyTo != null) {
            channel.basicPublish(
                response.toString().toByteArray(),
                exchange = "",
                routingKey = replyTo,
                properties = replyProps
            )
        }

        channel.basicAck(delivery.message, multiple = false)
    }

    channel.close()
    connection.close()
}

private fun fib(n: Int): Int {
    return when {
        n == 0 -> 0
        n == 1 -> 1
        else -> fib(n - 1) + fib(n - 2)
    }
}
```

The server code is rather straightforward:

  * As usual we start by establishing the connection and declaring the queue.
  * We might want to run more than one server process. In order to spread
    the load equally over multiple servers we need to set the
    `basicQos` setting.
  * We use `basicConsume` to access the queue, where we provide the callback
    that will do the work and send the response back.


The code for our RPC client:

```kotlin
import dev.kourier.amqp.connection.amqpConfig
import dev.kourier.amqp.connection.createAMQPConnection
import dev.kourier.amqp.properties
import kotlinx.coroutines.CoroutineScope
import java.util.UUID

suspend fun rpcClient(coroutineScope: CoroutineScope, n: Int): Int {
    val config = amqpConfig {
        server {
            host = "localhost"
        }
    }
    val connection = createAMQPConnection(coroutineScope, config)
    val channel = connection.openChannel()

    val callbackQueueDeclared = channel.queueDeclare(
        name = "",
        durable = false,
        exclusive = true,
        autoDelete = true,
        arguments = emptyMap()
    )
    val callbackQueueName = callbackQueueDeclared.queueName

    val correlationId = UUID.randomUUID().toString()

    val consumer = channel.basicConsume(callbackQueueName, noAck = true)
    var result = 0

    val requestProps = properties {
        this.correlationId = correlationId
        this.replyTo = callbackQueueName
    }

    channel.basicPublish(
        n.toString().toByteArray(),
        exchange = "",
        routingKey = "rpc_queue",
        properties = requestProps
    )
    println(" [x] Requesting fib($n)")

    for (delivery in consumer) {
        val responseCorrelationId = delivery.message.properties.correlationId

        if (responseCorrelationId == correlationId) {
            result = delivery.message.body.decodeToString().toInt()
            println(" [.] Got $result")
            break
        }
    }

    channel.close()
    connection.close()

    return result
}
```

We establish a connection and channel. We declare an exclusive callback queue
for replies. We subscribe to the callback queue, so that we can receive RPC
responses. We generate a unique `correlationId` number and save it. The loop
is waiting for an appropriate response and whenever we get a response we check
if the `correlationId` is the one we're looking for. If so, we save the response.

Making the RPC request:

```kotlin
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    // Start RPC server
    launch {
        rpcServer(this)
    }

    delay(1000)

    // Make RPC call
    val result = rpcClient(this, 30)
    println("fib(30) = $result")
}
```

The presented design is not the only possible implementation of an RPC
service, but it has some important advantages:

 * If the RPC server is too slow, you can scale up by just running
   another one. Try running a second RPC server.
 * On the client side, the RPC requires sending and receiving only one
   message. No synchronous calls like `queueDeclare` are required. As a
   result the RPC client needs only one network round trip for a single
   RPC request.

Our code is still pretty simplistic and doesn't try to solve more
complex (but important) problems, like:

 * How should the client react if there are no servers running?
 * Should a client have some kind of timeout for the RPC?
 * If the server malfunctions and raises an exception, should it be
   forwarded to the client?
 * Protecting against invalid incoming messages (eg checking bounds,
   type) before processing.

>If you want to experiment, you may find the [management UI](/docs/management) useful for viewing the queues.

Move on to [tutorial 7](./tutorial-seven-kotlin) to learn about publisher confirms.
