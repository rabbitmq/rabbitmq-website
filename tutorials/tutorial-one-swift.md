---
title: RabbitMQ tutorial - "Hello World!"
---

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
### (using BunnySwift)

In this part of the tutorial we'll write two small programs in Swift: a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the details in
the BunnySwift API, concentrating on this very simple thing just to get
started. It's the "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The box in
the middle is a queue - a message buffer that RabbitMQ keeps on behalf of the
consumer.

<T1DiagramHello/>

> #### The BunnySwift client library
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for RabbitMQ in [many different
> languages][devtools]. We'll
> use [BunnySwift][client] in this tutorial, a modern Swift client
> that leverages Swift concurrency with async/await.

### Setup

First, make sure you have RabbitMQ installed and running.

BunnySwift requires Swift 6.0 or later. Create a new directory for your
project and initialize it with Swift Package Manager:

```bash
mkdir rabbitmq-swift-tutorial
cd rabbitmq-swift-tutorial
swift package init --type executable --name Send
```

Edit `Package.swift` to add the BunnySwift dependency:

```swift
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "RabbitMQTutorials",
    platforms: [.macOS(.v14)],
    dependencies: [
        .package(url: "https://github.com/rabbitmq/bunny-swift", from: "0.1.0")
    ],
    targets: [
        .executableTarget(
            name: "Send",
            dependencies: [.product(name: "BunnySwift", package: "bunny-swift")]
        ),
        .executableTarget(
            name: "Receive",
            dependencies: [.product(name: "BunnySwift", package: "bunny-swift")]
        )
    ]
)
```

Create the source directories:

```bash
mkdir -p Sources/Send Sources/Receive
```

Now we have Swift Package Manager set up with the BunnySwift dependency.

### Sending

<T1DiagramSending/>

We'll call our message publisher (sender) `Send` and our message receiver
`Receive`. The publisher will connect to RabbitMQ, send a single message,
then exit.

In
[`Sources/Send/main.swift`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/swift/Sources/Send/main.swift),
we need to import the library first:

```swift
import BunnySwift
import Foundation
```

then we can create a connection to the server:

```swift
@main
struct Send {
    static func main() async throws {
        let connection = try await Connection.open()
```

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine with all default settings.

If we wanted to connect to a node on a different machine or configure
other connection parameters, we would use:

```swift
let connection = try await Connection.open(
    host: "some-host.example.com",
    port: 5672,
    username: "guest",
    password: "guest"
)
```

or specify a URI:

```swift
let connection = try await Connection.open(uri: "amqp://user:password@host:5672/vhost")
```

Next we create a channel, which is where most of the API for getting
things done resides:

```swift
        let channel = try await connection.openChannel()
```

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

```swift
        let queue = try await channel.queue("hello")

        try await channel.basicPublish(
            body: Data("Hello World!".utf8),
            routingKey: queue.name
        )
        print(" [x] Sent 'Hello World!'")
```

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

Lastly, we close the connection:

```swift
        try await connection.close()
    }
}
```

[Here's the complete Send.swift file][send].

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

The code in
[`Sources/Receive/main.swift`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/swift/Sources/Receive/main.swift)
has the same imports as `Send`:

```swift
import BunnySwift
```

Setting up is the same as the publisher; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `Send` publishes to.

```swift
@main
struct Receive {
    static func main() async throws {
        let connection = try await Connection.open()
        let channel = try await connection.openChannel()
        let queue = try await channel.queue("hello")
```

Note that we declare the queue here as well. Because we might start
the consumer before the publisher, we want to make sure the queue exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
queue. BunnySwift returns a consumer that we can iterate over using Swift concurrency.
We call `basicConsume` and iterate over the messages:

```swift
        print(" [*] Waiting for messages. To exit press CTRL+C")

        let consumer = try await channel.basicConsume(
            queue: queue.name,
            acknowledgementMode: .automatic
        )
        for try await message in consumer {
            print(" [x] Received '\(message.bodyString ?? "")'")
        }
    }
}
```

The consumer will continue running, waiting for messages. Use Ctrl-C to stop it.

[Here's the complete Receive.swift file][receive].

### Putting it all together

Build both programs:

```bash
swift build
```

In one terminal, run the consumer:

```bash
swift run Receive
# => [*] Waiting for messages. To exit press CTRL+C
```

Then, in another terminal, run the publisher:

```bash
swift run Send
# => [x] Sent 'Hello World!'
```

The consumer will print the message it gets from the publisher via RabbitMQ.

```bash
# => [x] Received 'Hello World!'
```

The consumer will keep running, waiting for messages, so try running the
publisher again in another terminal.

Congrats! You were able to send and receive a message through RabbitMQ.

If you want to check on the queue, try using `rabbitmqctl list_queues`.

Time to move on to [part 2](./tutorial-two-swift) and build a simple _work queue_.

[client]: https://github.com/rabbitmq/bunny-swift
[devtools]: /client-libraries/devtools
[send]: https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/swift/Sources/Send/main.swift
[receive]: https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/swift/Sources/Receive/main.swift
