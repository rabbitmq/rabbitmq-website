---
title: RabbitMQ tutorial - Work Queues (AMQP 1.0)
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
### (using the AMQP 1.0 Go client)

<TutorialsHelp/>

<T2DiagramToC/>

In the [first tutorial](./tutorial-one-go-amqp10) we
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

This tutorial uses the [RabbitMQ AMQP 1.0 Go client](/client-libraries/amqp-client-libraries) (`rabbitmq-amqp-go-client`). It requires RabbitMQ **4.0 or later**.

Preparation
-----------

In the previous part of this tutorial we sent a message containing
"Hello World!". Now we'll be sending strings that stand for complex
tasks. We don't have a real-world task, like images to be resized or
pdf files to be rendered, so let's fake it by just pretending we're
busy - by using the `time.Sleep` function. We'll take the number of dots
in the string as its complexity; every dot will account for one second
of "work". For example, a fake task described by `Hello...`
will take three seconds.

We will slightly modify the _send.go_ code from our previous example,
to allow arbitrary messages to be sent from the command line. This
program will schedule tasks to our work queue, so let's name it
`new_task.go`:

```go
body := bodyFrom(os.Args)
res, err := publisher.Publish(ctx, rmq.NewMessage([]byte(body)))
if err != nil {
	log.Panicf("Failed to publish a message: %v", err)
}
switch res.Outcome.(type) {
case *rmq.StateAccepted:
default:
	log.Panicf("Unexpected publish outcome: %v", res.Outcome)
}
log.Printf(" [x] Sent %s", body)

func bodyFrom(args []string) string {
	var s string
	if (len(args) < 2) || args[1] == "" {
		s = "hello"
	} else {
		s = strings.Join(args[1:], " ")
	}
	return s
}
```

Our old consumer program also requires some changes: it needs to
fake a second of work for every dot in the message body. It will handle
delivered messages and perform the task, so let's call it `worker.go`:

```go
consumer, err := conn.NewConsumer(ctx, "task_queue", &rmq.ConsumerOptions{InitialCredits: 1})
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
	var payload []byte
	if len(msg.Data) > 0 {
		payload = msg.Data[0]
	}
	log.Printf("Received a message: %s", payload)
	dotCount := bytes.Count(payload, []byte("."))
	t := time.Duration(dotCount)
	time.Sleep(t * time.Second)
	log.Printf("Done")
	err = delivery.Accept(ctx)
	if err != nil {
		log.Panicf("Failed to accept message: %v", err)
	}
}
```

Note the use of `ConsumerOptions{InitialCredits: 1}` to limit messages in flight (the AMQP 1.0 analog to prefetch).

Run each program using `go run`:

```bash
go run new_task.go hello world
go run worker.go
```

Round-robin dispatching
-----------------------

One of the advantages of using a Task Queue is the ability to easily
parallelise work. If we are building up a backlog of work, we can just
add more workers and that way, scale easily.

First, let's try to run two worker instances at the same time. They
will both get messages from the queue, but how exactly? Let's see.

You need three terminals open. Two will run the worker
program. These terminals will be our two consumers - C1 and C2.

```bash
# shell 1
go run worker.go
# => [*] Waiting for messages. To exit press CTRL+C
```

```bash
# shell 2
go run worker.go
# => [*] Waiting for messages. To exit press CTRL+C
```

In the third one we'll publish new tasks. Once you've started
the consumers you can publish a few messages:

```bash
# shell 3
go run new_task.go First message.
# => [x] Sent 'First message.'
go run new_task.go Second message..
# => [x] Sent 'Second message..'
go run new_task.go Third message...
# => [x] Sent 'Third message...'
```

Let's see what is delivered to our workers:

```bash
go run worker.go
# => [*] Waiting for messages. To exit press CTRL+C
# => Received a message: First message.
# => Done
# => Received a message: Third message...
# => Done
```

```bash
go run worker.go
# => [*] Waiting for messages. To exit press CTRL+C
# => Received a message: Second message..
# => Done
```

By default, RabbitMQ will send each message to the next consumer,
in sequence. On average every consumer will get the same number of
messages. This way of distributing messages is called round-robin. Try
this out with three or more workers.


Message acknowledgment
----------------------

Doing a task can take a few seconds, you may wonder what happens if
a consumer starts a long task and it terminates before it completes.
With AMQP 1.0, the consumer must **settle** each message (`Accept`, `Discard`, or `Requeue`). Until you settle, the broker can redeliver the message if the worker stops.

In order to make sure a message is not lost when a worker dies after receiving it but before finishing processing, settle only **after** the task is done. Here we call `delivery.Accept(ctx)` after `time.Sleep` completes.

If a consumer dies without settling, RabbitMQ will redeliver the message to another consumer. That way you can be sure that no message is lost, even if the workers occasionally die.

[The complete `worker.go` file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/worker.go) uses `delivery.Accept` after work completes.

> #### Forgotten settlement
>
> It's a common mistake to omit `delivery.Accept()` (or to call it before work finishes). Messages will be redelivered when your client quits (which may look like random redelivery), and unacknowledged messages accumulate on the broker.
>
> You can use `rabbitmqctl` to inspect queues:
>
> ```bash
> sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
> ```
>
> On Windows, drop the sudo:
> ```bash
> rabbitmqctl.bat list_queues name messages_ready messages_unacknowledged
> ```

Fair dispatch
----------------

You might have noticed that the dispatching still doesn't work exactly
as we want. For example in a situation with two workers, when all
odd messages are heavy and even messages are light, one worker will be
constantly busy and the other one will do hardly any work. Well,
RabbitMQ doesn't know anything about that and will still dispatch
messages evenly.

This happens because the broker may deliver multiple messages before earlier ones are settled.

<T2DiagramPrefetch/>

With the AMQP 1.0 Go client, limit how many messages are **in flight** per consumer by setting **`InitialCredits`** to `1` on the consumer builder. This is the analogue of prefetch 1 in AMQP 0-9-1:

```go
consumer, err := conn.NewConsumer(ctx, "task_queue", &rmq.ConsumerOptions{InitialCredits: 1})
```

This ensures that RabbitMQ won't prefetch messages; instead, it will only deliver a new message after the current one is settled.

> #### Note about queue size
>
> If all the workers are busy, your queue can fill up. You will want to keep an
> eye on that, and maybe add more workers, or have some other strategy.

Putting it all together
-----------------------

Final outline of `new_task.go`:

```go
package main

import (
	"context"
	"log"
	"os"
	"strings"

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

	_, err = conn.Management().DeclareQueue(ctx, &rmq.QuorumQueueSpecification{Name: "task_queue"})
	if err != nil {
		log.Panicf("Failed to declare a queue: %v", err)
	}

	publisher, err := conn.NewPublisher(ctx, &rmq.QueueAddress{Queue: "task_queue"}, nil)
	if err != nil {
		log.Panicf("Failed to create publisher: %v", err)
	}
	defer func() { _ = publisher.Close(context.Background()) }()

	body := bodyFrom(os.Args)
	res, err := publisher.Publish(ctx, rmq.NewMessage([]byte(body)))
	if err != nil {
		log.Panicf("Failed to publish a message: %v", err)
	}
	switch res.Outcome.(type) {
	case *rmq.StateAccepted:
	default:
		log.Panicf("Unexpected publish outcome: %v", res.Outcome)
	}
	log.Printf(" [x] Sent %s", body)
}

func bodyFrom(args []string) string {
	var s string
	if (len(args) < 2) || args[1] == "" {
		s = "hello"
	} else {
		s = strings.Join(args[1:], " ")
	}
	return s
}
```

[(new_task.go source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/new_task.go)

And `worker.go`:

```go
package main

import (
	"bytes"
	"context"
	"errors"
	"log"
	"time"

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

	_, err = conn.Management().DeclareQueue(ctx, &rmq.QuorumQueueSpecification{Name: "task_queue"})
	if err != nil {
		log.Panicf("Failed to declare a queue: %v", err)
	}

	consumer, err := conn.NewConsumer(ctx, "task_queue", &rmq.ConsumerOptions{InitialCredits: 1})
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
		var payload []byte
		if len(msg.Data) > 0 {
			payload = msg.Data[0]
		}
		log.Printf("Received a message: %s", payload)
		dotCount := bytes.Count(payload, []byte("."))
		t := time.Duration(dotCount)
		time.Sleep(t * time.Second)
		log.Printf("Done")
		err = delivery.Accept(ctx)
		if err != nil {
			log.Panicf("Failed to accept message: %v", err)
		}
	}
}
```

[(worker.go source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/worker.go)

Using explicit settlement and `InitialCredits: 1` you can set up a work queue. Quorum queues ensure tasks survive broker restarts.

Now we can move on to [tutorial 3](./tutorial-three-go-amqp10) and learn how to deliver the same message to many consumers.
