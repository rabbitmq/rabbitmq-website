---
title: RabbitMQ tutorial - "Hello World!"
---

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

### (using the Golang Stream Client)

In this part of the tutorial we'll write two programs in GO; a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the detail in
the GO client API, concentrating on this very simple thing just to get
started. It's a "Hello World" of messaging.


> #### The GO stream client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses RabbitMQ stream protocol which is a dedicate
> protocol for [RabbitMQ streams](/docs/streams). There are a number of clients
> for RabbitMQ in [many different
> languages](/client-libraries/devtools) see the stream clients. We'll
> use the [GO stream client](https://github.com/rabbitmq/rabbitmq-stream-go-client) provided by RabbitMQ.
>
> RabbitMQ GO client 1.4 and later versions are distributed
> via [go get](https://github.com/rabbitmq/rabbitmq-stream-go-client?tab=readme-ov-file#installing).
>
> This tutorial assumes you are using powershell on Windows. On MacOS and Linux nearly
> any shell will work.

### Setup

First let's verify that you have GO toolchain in `PATH`:

```powershell
go version
```

should produce a help message.

Now let's generate two projects, one for the publisher and one for the consumer:

```powershell
go mod init github.com/rabbitmq/rabbitmq-tutorials
go get -u github.com/rabbitmq/rabbitmq-stream-go-client
go get -u 
```

This will create two new files named `send.go` and `receive.go`.

Now we have the GO project set up we can write some code.

### Sending

We'll call our message producer (sender) `send.go` and our message consumer (receiver)
`receive.go`. The producer will connect to RabbitMQ, send a single message,
then exit.

In
[`send.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-stream/send.go),
we need to use some namespaces:

```go
import (
    "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
    "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
)
```

then we can create a connection to the server:

```go
env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions())
...
```

The entry point of the stream GO client is the `Environment`.
It deals with stream management and the creation of publisher and consumer instances.

It abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine we'd simply specify its hostname or IP address on the `EnvironmentOptions`.

Next we create a Producer.

To send, we must declare a stream-queue for us to send to; then we can publish a message
to the stream-queue:

```go
    env, err := stream.NewEnvironment(stream.NewEnvironmentOptions())
    if err != nil {
        log.Fatalf("Failed to create environment: %v", err)
    }
    streamName := "hello-go-stream"
    err = env.DeclareStream(streamName, &stream.StreamOptions{
			    MaxLengthBytes: stream.ByteCapacity{}.GB(5),
			},)

    if err != nil {
        log.Fatalf("Failed to declare stream: %v", err)
    }
	
    producer, err := env.NewProducer(streamName, stream.NewProducerOptions())
    if err != nil {
        log.Fatalf("Failed to create producer: %v", err)
    }

    err = producer.Send(amqp.NewMessage([]byte("Hello world")))
    if err != nil {
        log.Fatalf("Failed to send message: %v", err)
    }
    fmt.Printf(" [x] 'Hello world' Message sent\n")

    reader := bufio.NewReader(os.Stdin)
    fmt.Println(" [x] Press enter to close the producer")
    _, _ = reader.ReadString('\n')
    err = producer.Close()
    if err != nil {
        log.Fatalf("Failed to close producer: %v", err)
    }
```

Declaring a stream-queue is idempotent - it will only be created if it doesn't exist already.

Streams model an append-only log of messages that can be repeatedly read until they expire.
It is a good practice to always define the retention policy. 5Gb in this case.

The message content is a byte array, so you can encode whatever you like there.

When the code above finishes running, the producer connection and stream-system
connection will be closed. That's it for our producer.

Each time you run the producer, it will send a single message to the server and the message will be
appended to the stream-queue.

[Here's the whole send.go
struct](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-stream/send.go).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The <a
> href="../configure#config-items">configuration
> file documentation</a> will show you how to set <code>disk_free_limit</code>.

### Receiving

As for the consumer, it is listening for messages from
RabbitMQ. So unlike the producer which publishes a single message, we'll
keep the consumer running continuously to listen for messages and print them out.

The code (in [`receive.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-stream/receive.go))
has the same `import` statements as `send`:

```go
import (
    "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/amqp"
    "github.com/rabbitmq/rabbitmq-stream-go-client/pkg/stream"
)
```

Setting up is the same as the producer; we create a, consumer,
and declare the stream-queue from which we're going to consume.
Note this matches up with the queue that `send` publishes to.

```go

env, err := stream.NewEnvironment(stream.NewEnvironmentOptions())
if err != nil {
    log.Fatalf("Failed to create environment: %v", err)
}

streamName := "hello-go-stream"
err = env.DeclareStream(streamName,
		&stream.StreamOptions{
			MaxLengthBytes: stream.ByteCapacity{}.GB(2),
		},
	)
if err != nil {
    log.Fatalf("Failed to declare stream: %v", err)
}
...
```

Note that we declare the stream-queue here as well. Because we might start
the consumer before the producer, we want to make sure the queue exists
before we try to consume messages from it.

We need to use `Consumer` struct to create the consumer and `ConsumerOptions` to configure it.

We're about to tell the server to deliver us the messages from the
queue. We provide a callback `MessageHandler`.

`SetOffset` defines the starting point of the consumer.
In this case, we start from the first message.

```go
    env, err := stream.NewEnvironment(
		stream.NewEnvironmentOptions())
	if err != nil {
        log.Fatalf("Failed to create environment: %v", err)
    }
    streamName := "hello-go-stream"
    err = env.DeclareStream(streamName,
		&stream.StreamOptions{
			MaxLengthBytes: stream.ByteCapacity{}.GB(5),
		},
	)
	if err != nil {
	    log.Fatalf("Failed to declare stream: %v", err)
	}
    
    messagesHandler := func(consumerContext stream.ConsumerContext, message *amqp.Message) {
		fmt.Printf("Stream: %s - Received message: %s\n", consumerContext.Consumer.GetStreamName(),
			message.Data)}

    consumer, err := env.NewConsumer(streamName, messagesHandler, 
        stream.NewConsumerOptions().SetOffset(stream.OffsetSpecification{}.First()))
    if err != nil {
        log.Fatalf("Failed to create consumer: %v", err)
    }
    
    reader := bufio.NewReader(os.Stdin)
    fmt.Println(" [x] Waiting for messages. enter to close the consumer")
    _, _ = reader.ReadString('\n')
    err = consumer.Close()
    if err != nil {
        log.Fatalf("Failed to close consumer: %v", err)
    }
```

[Here's the whole receive.go
struct](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-stream/receive.go).

### Putting It All Together

Open two terminals.

You can run the clients in any order, as both declares the stream-queue.
We will run the consumer first so you can see it waiting for and then receiving the message:

```powershell
 go run receive.go
```

Then run the producer:

```powershell
go run send.go
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages, so try restarting
the publisher several times.

The stream-queues are different from traditional queues in that they are append-only logs of messages.
So you can run the different consumers and they will always start from the first message.

