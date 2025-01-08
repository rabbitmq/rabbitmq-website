---
title: RabbitMQ tutorial - "Hello World!"
---

<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsStreamHelp.md';
import TutorialsIntro from '@site/src/components/Tutorials/TutorialsStreamIntro.md';
import T1DiagramHello from '@site/src/components/Tutorials/T1DiagramHello.md';
import T1DiagramSending from '@site/src/components/Tutorials/T1DiagramSending.md';
import T1DiagramReceiving from '@site/src/components/Tutorials/T1DiagramReceiving.md';

# RabbitMQ Stream tutorial - "Hello World!"

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## "Hello World"

### (using the Go Stream Client)

In this part of the tutorial we'll write two programs in Go; a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the detail in
the Go client API, concentrating on this very simple thing just to get
started. It's the "Hello World" of RabbitMQ Streams.


> #### The Go stream client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses RabbitMQ stream protocol which is a dedicated
> protocol for [RabbitMQ streams](/docs/streams). There are a number of clients
> for RabbitMQ in [many different
> languages](/client-libraries/devtools), see the stream client libraries for each language.
> We'll use the [Go stream client](https://github.com/rabbitmq/rabbitmq-stream-go-client) provided by RabbitMQ.
>
> RabbitMQ Go client 1.4 and later versions are distributed
> via [go get](https://github.com/rabbitmq/rabbitmq-stream-go-client?tab=readme-ov-file#installing).
>
> This tutorial assumes you are using powershell on Windows. On MacOS and Linux nearly
> any shell will work.

### Setup

First let's verify that you have the Go toolchain in `PATH`:

```shell
go help
```

Running that command should produce a help message.

An executable version of this tutorial can be found in the [RabbitMQ tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-stream/).

Now let's create the project:

```shell
mkdir go-stream
cd go-stream
go mod init github.com/rabbitmq/rabbitmq-tutorials
go get -u github.com/rabbitmq/rabbitmq-stream-go-client
```

Now we have the Go project set up we can write some code.

### Sending

We'll call our message producer (sender) `send.go` and our message consumer (receiver)
`receive.go`. The producer will connect to RabbitMQ, send a single message,
then exit.

In
[`send.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-stream/send.go),
we need to import some packages:

```go
import (
    "bufio"
    "fmt"
    "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
    "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
    "log"
    "os"
)
```

then we can create a connection to the server:

```go
env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions())
```

The entry point of the stream Go client is the `Environment`.
It is used for configuration of RabbitMQ stream publishers, stream consumers, and streams themselves.

It abstracts the socket connection, and takes care of protocol version negotiation and authentication and so on for us.

This tutorial assumes that stream publisher and consumer connect to a RabbitMQ node running locally, that is, on _localhost_.
To connect to a node on a different machine, simply specify target hostname or IP address on the `EnvironmentOptions`.

Next let's create a producer.

The producer will also declare a stream it will publish messages to and then publish a message:

```go
streamName := "hello-go-stream"
env.DeclareStream(streamName,
    &stream.StreamOptions{
        MaxLengthBytes: stream.ByteCapacity{}.GB(2),
    },
)

producer, err := env.NewProducer(streamName, stream.NewProducerOptions())
if err != nil {
    log.Fatalf("Failed to create producer: %v", err)
}

err = producer.Send(amqp.NewMessage([]byte("Hello world")))
if err != nil {
    log.Fatalf("Failed to send message: %v", err)
}
```

The stream declaration operation is idempotent: the stream will only be created if it doesn't exist already.

A stream is an append-only log abstraction that allows for repeated consumption of messages until they expire.
It is a good practice to always define the retention policy.
In the example above, the stream is limited to be 5 GiB in size.

The message content is a byte array.
Applications can encode the data they need to transfer using any appropriate format such as JSON, MessagePack, and so on.

When the code above finishes running, the producer connection and stream-system
connection will be closed. That's it for our producer.

Each time the producer is run, it will send a single message to the server and the message will be appended to the stream.

The complete [send.go file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-stream/send.go) can be found on GitHub.

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
>
> Another reason may be that the program exits _before_ the message makes it to the broker.
> Sending is asynchronous in some client libraries: the function returns immediately but the message is enqueued in the IO layer before going over the wire.
> The sending program asks the user to press a key to finish the process: the message has plenty of time to reach the broker.
> The stream protocol provides a confirm mechanism to make sure the broker receives outbound messages, but this tutorial does not use this mechanism for simplicity's sake.

### Receiving

The other part of this tutorial, the consumer, will connect to a RabbitMQ node and wait for messages to be pushed to it.
Unlike the producer, which in this tutorial publishes a single message and stops, the consumer will be running continuously, consume the messages RabbitMQ will push to it, and print the received payloads out.

Similarly to `send.go`, [`receive.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-stream/receive.go) will need to import some packages:

```go
import (
    "bufio"
    "fmt"
    "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
    "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
    "log"
    "os"
)
```

When it comes to the initial setup, the consumer part is very similar the producer one; we use the default connection settings and declare the stream from which the consumer will consume.

```go
env, err := stream.NewEnvironment(stream.NewEnvironmentOptions())
if err != nil {
    log.Fatalf("Failed to create environment: %v", err)
}

streamName := "hello-go-stream"
env.DeclareStream(streamName,
    &stream.StreamOptions{
        MaxLengthBytes: stream.ByteCapacity{}.GB(2),
    },
)
```

Note that the consumer part also declares the stream.
This is to allow either part to be started first, be it the producer or the consumer.

We use the `Consumer` struct to instantiate the consumer and `ConsumerOptions` struct to configure it.
We provide a `messageHandler` callback to process delivered messages.

`SetOffset` defines the starting point of the consumer.
In this case, the consumer starts from the very first message available in the stream.

```go   
messagesHandler := func(consumerContext stream.ConsumerContext, message *amqp.Message) {
	fmt.Printf("Stream: %s - Received message: %s\n", consumerContext.Consumer.GetStreamName(),
			message.Data)}

consumer, err := env.NewConsumer(streamName, messagesHandler, 
        stream.NewConsumerOptions().SetOffset(stream.OffsetSpecification{}.First()))
if err != nil {
    log.Fatalf("Failed to create consumer: %v", err)
}
```

The complete [receive.go file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-stream/receive.go) can be found on GitHub.

### Putting It All Together

In order to run both examples, open two terminal (shell) tabs.

We need to pull dependencies first:

```shell
go get -u
```

Both parts of this tutorial can be run in any order, as they both declare the stream.
Let's run the consumer first so that when the first publisher is started, the consumer will print it:

```shell
 go run receive.go
```

Then run the producer:

```shell
go run send.go
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for new deliveries. Try re-running
the publisher several times to observe that.

Streams are different from queues in that they are append-only logs of messages
that can be consumed repeatedly.
When multiple consumers consume from a stream, they will start from the first available message.


