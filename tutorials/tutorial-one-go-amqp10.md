---
title: RabbitMQ tutorial - "Hello World!" (AMQP 1.0)
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
### (using the AMQP 1.0 Go client)

In this part of the tutorial we'll write two small programs in Go; a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the detail in
the Go AMQP 1.0 client API, concentrating on this very simple thing just to get
started. It's the "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<T1DiagramHello/>

> #### The AMQP 1.0 Go client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses **AMQP 1.0** over the same port as AMQP 0-9-1 (5672 by default). It requires **RabbitMQ 4.0 or later**.
>
> Use the RabbitMQ **AMQP 1.0** Go client (`rabbitmq-amqp-go-client`), not the classic AMQP 0-9-1 client (`amqp091-go`). See [AMQP 1.0 client libraries](/client-libraries/amqp-client-libraries) and the [Go client package](https://pkg.go.dev/github.com/rabbitmq/rabbitmq-amqp-go-client).
>
> Install with:
>
> ```go
> go get github.com/rabbitmq/rabbitmq-amqp-go-client
> ```

Now we have the client installed, we can write some code.

### Sending

<T1DiagramSending/>

We'll call our message publisher (sender) `send.go` and our message consumer
`receive.go`. The publisher will connect to RabbitMQ, send a single message,
then exit.

In `send.go`, we need to import the library first:

```go
package main

import (
	"context"
	"log"

	rmq "github.com/rabbitmq/rabbitmq-amqp-go-client/pkg/rabbitmqamqp"
)
```

Set up the connection to the broker using an environment and connection:

```go
const brokerURI = "amqp://guest:guest@localhost:5672/"

func main() {
	ctx := context.Background()
	env := rmq.NewEnvironment(brokerURI, nil)
	conn, err := env.NewConnection(ctx)
	if err != nil {
		log.Panicf("Failed to connect to RabbitMQ: %v", err)
	}
	defer func() {
		_ = env.CloseConnections(context.Background())
	}()
```

The environment holds shared settings, and the connection represents a socket to the broker. Deferring `CloseConnections` ensures resources are released when the program exits.

Declare a **quorum queue** named `"hello"`:

```go
	_, err = conn.Management().DeclareQueue(ctx, &rmq.QuorumQueueSpecification{Name: "hello"})
	if err != nil {
		log.Panicf("Failed to declare a queue: %v", err)
	}
```

Declaring a queue is idempotent: it will only be created if it does not already exist. Quorum queues are durable and replicated across RabbitMQ nodes.

Create a publisher and send a message:

```go
	publisher, err := conn.NewPublisher(ctx, &rmq.QueueAddress{Queue: "hello"}, nil)
	if err != nil {
		log.Panicf("Failed to create publisher: %v", err)
	}
	defer func() { _ = publisher.Close(context.Background()) }()

	body := "Hello World!"
	res, err := publisher.Publish(ctx, rmq.NewMessage([]byte(body)))
	if err != nil {
		log.Panicf("Failed to publish a message: %v", err)
	}
	switch res.Outcome.(type) {
	case *rmq.StateAccepted:
	default:
		log.Panicf("Unexpected publish outcome: %v", res.Outcome)
	}
	log.Printf(" [x] Sent %s\n", body)
}
```

With AMQP 1.0, `Publish` returns an outcome. Check for `StateAccepted` to confirm the broker accepted the message.

[Here's the whole `send.go` file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/send.go).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the " [x] Sent" message then you may be left scratching your head wondering what could be wrong. Maybe the broker was started without enough free disk space (by default it needs at least 50 MB free) and is therefore refusing to accept messages. Check the broker [log file](/docs/logging/) to see if there is a [resource alarm](/docs/alarms) logged.

### Receiving

That's it for our publisher. Our consumer listens for messages from RabbitMQ, so unlike the publisher which publishes a single message, we'll keep the consumer running to listen for messages and print them out.

<T1DiagramReceiving/>

The code in `receive.go` is similar. Set up the environment and connection, declare the same queue, then create a consumer:

```go
package main

import (
	"context"
	"errors"
	"log"

	rmq "github.com/rabbitmq/rabbitmq-amqp-go-client/pkg/rabbitmqamqp"
)

const brokerURI = "amqp://guest:guest@localhost:5672/"

func main() {
	ctx := context.Background()
	env := rmq.NewEnvironment(brokerURI, nil)
	conn, err := env.NewConnection(ctx)
	if err != nil {
		log.Panicf("Failed to connect to RabbitMQ: %v", err)
	}
	defer func() {
		_ = env.CloseConnections(context.Background())
	}()

	_, err = conn.Management().DeclareQueue(ctx, &rmq.QuorumQueueSpecification{Name: "hello"})
	if err != nil {
		log.Panicf("Failed to declare a queue: %v", err)
	}

	consumer, err := conn.NewConsumer(ctx, "hello", nil)
	if err != nil {
		log.Panicf("Failed to create consumer: %v", err)
	}
	defer func() { _ = consumer.Close(context.Background()) }()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	for {
		delivery, err := consumer.Receive(ctx)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				return
			}
			log.Panicf("Failed to receive a message: %v", err)
		}
		msg := delivery.Message()
		var body string
		if len(msg.Data) > 0 {
			body = string(msg.Data[0])
		}
		log.Printf("Received a message: %s", body)
		err = delivery.Accept(ctx)
		if err != nil {
			log.Panicf("Failed to accept message: %v", err)
		}
	}
}
```

Note that we declare the queue here as well. Because we might start the consumer before the publisher, we want to make sure the queue exists before we try to consume messages from it.

With AMQP 1.0, the consumer **must settle** each message by calling `Accept` (or `Discard` / `Requeue`). Here we call `delivery.Accept(ctx)` after printing the message.

[Here's the whole `receive.go` file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/receive.go).

### Putting it all together

Create a `go.mod` file for your project:

```
module rabbitmq-tutorials

go 1.21

require github.com/rabbitmq/rabbitmq-amqp-go-client v0.7.0
```

Then compile and run the examples. In one terminal, run the consumer:

```bash
go run receive.go
```

Then run the publisher:

```bash
go run send.go
```

The consumer will print the message it gets from the publisher via RabbitMQ. The consumer will keep running, waiting for messages (use Ctrl+C to stop it), so try running the publisher from another terminal.

> #### Listing queues
>
> You may wish to see what queues RabbitMQ has and how many messages are in them. You can do it (as a privileged user) using the `rabbitmqctl` tool:
>
> ```bash
> sudo rabbitmqctl list_queues
> ```
>
> On Windows, omit the sudo:
> ```PowerShell
> rabbitmqctl.bat list_queues
> ```

Time to move on to [part 2](./tutorial-two-go-amqp10) and build a simple _work queue_.
