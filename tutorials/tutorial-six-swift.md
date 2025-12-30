---
title: RabbitMQ tutorial - Remote procedure call (RPC)
---

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';
import T6DiagramFull from '@site/src/components/Tutorials/T6DiagramFull.md';

# RabbitMQ tutorial - Remote procedure call (RPC)

## Remote procedure call (RPC)
### (using [BunnySwift][client])

<TutorialsHelp/>

### What This Tutorial Focuses On

In the [second tutorial](./tutorial-two-swift) we learned how to
use _Work Queues_ to distribute time-consuming tasks among multiple
workers.

But what if we need to run a function on a remote computer and wait for
the result?  Well, that's a different story. This pattern is commonly
known as _Remote Procedure Call_ or _RPC_.

In this tutorial we're going to use RabbitMQ to build an RPC system: a
client and a scalable RPC server. As we don't have any time-consuming
tasks that are worth distributing, we're going to create a dummy RPC
service that returns Fibonacci numbers.

> #### A note on RPC
>
> Although RPC is a pretty common pattern in computing, it's often criticised.
> The problems arise when a programmer is not aware
> whether a function call is local or if it's a slow RPC. Confusions
> like that result in an unpredictable system and adds unnecessary
> complexity to debugging. Instead of simplifying software, misused RPC
> can result in unmaintainable spaghetti code.
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


### Callback queue

The request-reply pattern in RabbitMQ involves a straightforward interaction between the server and the client.

A client sends a request message and a server replies with a response message.

In order to receive a response we need to send a 'callback' queue name with the
request. Such a queue is often [server-named](/docs/queues#server-named-queues) but can also have
a well-known name (be client-named).

The server will then use that name to respond using [the default exchange](/docs/exchanges#default-exchange).

```swift
let replyQueue = try await channel.queue("", exclusive: true)

try await channel.basicPublish(
    body: Data(request.utf8),
    routingKey: "rpc_queue",
    properties: BasicProperties(replyTo: replyQueue.name)
)
```

> #### Message properties
>
> The AMQP 0-9-1 protocol predefines a set of 14 properties that go with
> a message. Most of the properties are rarely used, with the exception of
> the following:
>
> * `deliveryMode`: Marks a message as persistent (with a value of `.persistent`)
>    or transient. You may remember this property
>    from [the second tutorial](./tutorial-two-swift).
> * `contentType`: Used to describe the mime-type of the encoding.
>    For example for the often used JSON encoding it is a good practice
>    to set this property to: `application/json`.
> * `replyTo`: Commonly used to name a callback queue.
> * `correlationId`: Useful to correlate RPC responses with requests.


### Correlation id

Creating a callback queue for every RPC request is inefficient.
A better way is creating a single callback queue per client.

That raises a new issue, having received a response in that queue it's
not clear to which request the response belongs. That's when the
`correlationId` property is used. We're going to set it to a unique
value for every request. Later, when we receive a message in the
callback queue we'll look at this property, and based on that we'll be
able to match a response with a request. If we see an unknown
`correlationId` value, we may safely discard the message - it
doesn't belong to our requests.

You may ask, why should we ignore unknown messages in the callback
queue, rather than failing with an error? It's due to a possibility of
a race condition on the server side. Although unlikely, it is possible
that the RPC server will die just after sending us the answer, but
before sending an acknowledgment message for the request. If that
happens, the restarted RPC server will process the request again.
That's why on the client we must handle the duplicate responses
gracefully, and the RPC should ideally be idempotent.

### Summary

<T6DiagramFull/>

Our RPC will work like this:

  * When the Client starts up, it creates an exclusive
    callback queue.
  * For an RPC request, the Client sends a message with two properties:
    `replyTo`, which is set to the callback queue and `correlationId`,
    which is set to a unique value for every request.
  * The request is sent to an `rpc_queue` queue.
  * The RPC worker (aka: server) is waiting for requests on that queue.
    When a request appears, it does the job and sends a message with the
    result back to the Client, using the queue from the `replyTo` field.
  * The client waits for data on the callback queue. When a message
    appears, it checks the `correlationId` property. If it matches
    the value from the request it returns the response to the
    application.

Putting it all together
-----------------------

The code for `RPCServer`:

```swift
import BunnySwift
import Foundation

func fibonacci(_ n: Int) -> Int {
    if n <= 1 { return n }
    return fibonacci(n - 1) + fibonacci(n - 2)
}

@main
struct RPCServer {
    static func main() async throws {
        let connection = try await Connection.open()
        let channel = try await connection.openChannel()

        let queue = try await channel.queue("rpc_queue")
        try await channel.basicQos(prefetchCount: 1)

        print(" [x] Awaiting RPC requests")

        let consumer = try await channel.basicConsume(queue: queue.name)
        for try await message in consumer {
            let n = Int(message.bodyString ?? "0") ?? 0
            print(" [.] fib(\(n))")

            let result = fibonacci(n)

            if let replyTo = message.properties.replyTo {
                try await channel.basicPublish(
                    body: Data("\(result)".utf8),
                    routingKey: replyTo,
                    properties: BasicProperties(correlationId: message.properties.correlationId)
                )
            }
            try await message.ack()
        }
    }
}
```

[(RPCServer source)][rpcserver]

The server code is rather straightforward:

  * As usual we start by establishing the connection and declaring
    the queue `rpc_queue`.
  * We declare our fibonacci function. It assumes only valid positive integer input.
    (Don't expect this one to work for big numbers,
    it's probably the slowest recursive implementation possible).
  * We consume messages from the queue, and for each request
    we do the work and send the response back.
  * We might want to run more than one server process. In order
    to spread the load equally over multiple servers we need to set the
    `prefetchCount` setting via `basicQos`.


The code for `RPCClient`:

```swift
import BunnySwift
import Foundation

@main
struct RPCClient {
    static func main() async throws {
        let n = Int(CommandLine.arguments.dropFirst().first ?? "30") ?? 30

        let connection = try await Connection.open()
        let channel = try await connection.openChannel()

        let replyQueue = try await channel.queue("", exclusive: true)
        let correlationId = UUID().uuidString

        print(" [x] Requesting fib(\(n))")

        try await channel.basicPublish(
            body: Data("\(n)".utf8),
            routingKey: "rpc_queue",
            properties: BasicProperties(
                correlationId: correlationId,
                replyTo: replyQueue.name
            )
        )

        let consumer = try await channel.basicConsume(
            queue: replyQueue.name,
            acknowledgementMode: .automatic
        )
        for try await message in consumer {
            if message.properties.correlationId == correlationId {
                let result = message.bodyString ?? "?"
                print(" [.] Got \(result)")
                break
            }
        }

        try await connection.close()
    }
}
```

[(RPCClient source)][rpcclient]

The client code is slightly more involved:

  * We establish a connection, channel and declare an
    exclusive `replyQueue` for replies.
  * We generate a unique `correlationId` using `UUID`.
  * We publish the request message with two properties:
    `replyTo` and `correlationId`.
  * We consume from the reply queue and wait for a message
    with a matching `correlationId`.

Our RPC service is now ready. We can start the server:

```bash
swift run RPCServer
# => [x] Awaiting RPC requests
```

To request a fibonacci number run the client:

```bash
swift run RPCClient 30
# => [x] Requesting fib(30)
# => [.] Got 832040
```

The presented design is not the only possible implementation of an RPC
service, but it has some important advantages:

 * If the RPC server is too slow, you can scale up by just running
   another one. Try running a second `RPCServer` in a new console.
 * On the client side, the RPC requires sending and
   receiving only one message. As a result the RPC client needs only one network
   round trip for a single RPC request.

Our code is still pretty simplistic and doesn't try to solve more
complex (but important) problems, like:

 * How should the client react if there are no servers running?
 * Should a client have some kind of timeout for the RPC?
 * If the server malfunctions and raises an exception, should it be
   forwarded to the client?
 * Protecting against invalid incoming messages
   (e.g. checking bounds) before processing.

>
>If you want to experiment, you may find the [management UI](/docs/management) useful for viewing the queues.
>

[client]: https://github.com/rabbitmq/bunny-swift
[rpcserver]: https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/swift/Sources/RPCServer/main.swift
[rpcclient]: https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/swift/Sources/RPCClient/main.swift
