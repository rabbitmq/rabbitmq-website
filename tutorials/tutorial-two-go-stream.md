---
title: RabbitMQ tutorial - Offset Tracking
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

# RabbitMQ Stream tutorial - Offset Tracking

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## Offset Tracking

### Setup

This part of the tutorial consists in writing two programs in Go; a producer that sends a wave of messages with a marker message at the end, and a consumer that receives messages and stops when it gets the marker message.
It shows how a consumer can navigate through a stream and can even restart where it left off in a previous execution.

This tutorial uses [the stream Go client](/tutorials/tutorial-one-go-stream#using-the-go-stream-client).
Make sure to follow [the setup steps](/tutorials/tutorial-one-go-stream#setup) from the first tutorial.

An executable version of this tutorial can be found in the [RabbitMQ tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-stream/).
The sending program is called `offset_tracking_send.go` and the receiving program is called `offset_tracking_receive.go`.
The tutorial focuses on the usage of the client library, so the final code in the repository should be used to create the scaffolding of the files (e.g. imports, main function, etc).

### Sending

The sending program starts by creating the environment and declaring the stream:

```go
env, _ := stream.NewEnvironment(
    stream.NewEnvironmentOptions().
        SetHost("localhost").
        SetPort(5552).
        SetUser("guest").
        SetPassword("guest"))

streamName := "stream-offset-tracking-go"
env.DeclareStream(streamName,
    &stream.StreamOptions{
        MaxLengthBytes: stream.ByteCapacity{}.GB(2),
    },
)
```

Note the error handling code is omitted for brevity.

The program then creates a producer and publishes 100 messages.
The body value of the last message is set to `marker`; this is a marker for the consumer to stop consuming.

The program uses a `handlePublishConfirm` function and a channel to make sure all messages make it to the broker before exiting.
Let's skip this part for now and see the bulk of the sending first:

```java
producer, _ := env.NewProducer(streamName, stream.NewProducerOptions())

messageCount := 100
ch := make(chan bool)
chPublishConfirm := producer.NotifyPublishConfirmation()
handlePublishConfirm(chPublishConfirm, messageCount, ch)

fmt.Printf("Publishing %d messages\n", messageCount)
for i := 0; i < messageCount; i++ {
    var body string
    if i == messageCount-1 {
        body = "marker"
    } else {
        body = "hello"
    }
    producer.Send(amqp.NewMessage([]byte(body)))
}
_ = <-ch
fmt.Println("Messages confirmed")

producer.Close()
```

The sending program uses 2 channels and a Go routine to move on and exit when the broker confirmed the messages.
Let's focus on this part.

The producer `NotifyPublishConfirmation` function returns the first channel.
The client library sends the broker confirmations on this channel and a routine declared in `handlePublishConfirm` receives these confirmations:

```go
messageCount := 100
chPublishConfirm := producer.NotifyPublishConfirmation()
ch := make(chan bool)
handlePublishConfirm(chPublishConfirm, messageCount, ch)
```

The routine deals with the messages and sends `true` to the second channel when the expected number of confirmations is reached:

```go
func handlePublishConfirm(confirms stream.ChannelPublishConfirm, messageCount int, ch chan bool) {
    go func() {
        confirmedCount := 0
        for confirmed := range confirms {
            for _, _ = range confirmed {
                if msg.IsConfirmed() {
                    confirmedCount++
                    if confirmedCount == messageCount {
                        ch <- true
                    }
                }
            }
        }
    }()
}
```

The main program is waiting on the second channel just after the sending loop, so it moves on as soon as something arrives on the channel (the `true` value the routine sent).

There is no risk the program stops before all the messages made it to the broker thanks to this synchronization mechanism.

Let's now create the receiving program.

### Receiving

The receiving program creates the environment and declares the stream as well.
This part of the code is the same as in the sending program, so it is skipped in the next code snippets for brevity's sake.

The receiving program starts a consumer that attaches at the beginning of the stream (`stream.OffsetSpecification{}.First()`).
It uses variables to output the offsets of the first and last received messages at the end of the program.

The consumer stops when it receives the marker message: it assigns the offset to a variable, closes the consumer, and sends `true` to a channel.
Like for the sender, the channel tells the program to move on when the consumer is done with its job.

```go
var firstOffset int64 = -1
var lastOffset atomic.Int64
ch := make(chan bool)
messagesHandler := func(consumerContext stream.ConsumerContext, message *amqp.Message) {
    if atomic.CompareAndSwapInt64(&firstOffset, -1, consumerContext.Consumer.GetOffset()) {
        fmt.Println("First message received.")
    }
    if string(message.GetData()) == "marker" {
        lastOffset.Store(consumerContext.Consumer.GetOffset())
        _ = consumerContext.Consumer.Close()
        ch <- true
    }
}

offsetSpecification := stream.OffsetSpecification{}.First()
_, _ = env.NewConsumer(streamName, messagesHandler,
    stream.NewConsumerOptions().
        SetOffset(offsetSpecification))

fmt.Println("Started consuming...")
_ = <-ch

fmt.Printf("Done consuming, first offset %d, last offset %d.\n", firstOffset, lastOffset.Load())
```

### Exploring the Stream

In order to run both examples, open two terminal (shell) tabs.

In the first tab, run the sender to publish a wave of messages:

```shell
go run offset_tracking_send.go
```

The output is the following:

```shell
Publishing 100 messages
Messages confirmed.
```

Let's run now the receiver.
Open a new tab.
Remember it should start from the beginning of the stream because of the `first` offset specification.

```shell
go run offset_tracking_receive.go
```

Here is the output:

```shell
Started consuming...
First message received.
Done consuming, first offset 0, last offset 99.
```

:::note[What is an offset?]
A stream can be seen as an array where elements are messages.
The offset is the index of a given message in the array.
:::

A stream is different from a queue: consumers can read and re-read the same messages and the messages stay in the stream.

Let's try this feature by using the `offset` specification to attach at a given offset.
Set the `offsetSpecification` variable from `stream.OffsetSpecification{}.First()` to `stream.OffsetSpecification{}.Offset(42)`:

```go
offsetSpecification := stream.OffsetSpecification{}.Offset(42)
```

Offset 42 is arbitrary, it could have been any number between 0 and 99.
Run the receiver again:

```shell
go run offset_tracking_receive.go
```

The output is the following:

```shell
Started consuming...
First message received.
Done consuming, first offset 42, last offset 99.
```

There is also a way to attach at the very end of stream to see only new messages at the time of the consumer creation.
This is the `next` offset specification.
Let's try it:

```go
offsetSpecification := stream.OffsetSpecification{}.Next()
```

Run the receiver:

```shell
go run offset_tracking_receive.go
```

This time the consumer does not get any messages:

```shell
Started consuming...
```

It is waiting for new messages in the stream.
Let's publish some by running the sender again.
Back to the first tab:

```shell
go run offset_tracking_send.go
```

Wait for the program to exit and switch back to the receiver tab.
The consumer received the new messages:

```shell
Started consuming...
First message received.
Done consuming, first offset 100, last offset 199.
```

The receiver stopped because of the new marker message the sender put at the end of the stream.

This section showed how to "browse" a stream: from the beginning, from any offset, even for new messages.
The next section covers how to leverage server-side offset tracking to resume where a consumer left off in a previous execution.

### Server-Side Offset Tracking

RabbitMQ Streams provide server-side offset tracking to store the progress of a given consumer in a stream.
If the consumer were to stop for any reason (crash, upgrade, etc), it would be able to re-attach where it stopped previously to avoid processing the same messages.

RabbitMQ Streams provides an API for offset tracking, but it is possible to use other solutions to store the progress of consuming applications.
It may depend on the use case, but a relational database can be a good solution as well.

Let's modify the receiver to store the offset of processed messages.
The updated lines are outlined with comments:

```go
var firstOffset int64 = -1
var messageCount int64 = -1 // number of received messages
var lastOffset atomic.Int64
ch := make(chan bool)
messagesHandler := func(consumerContext stream.ConsumerContext, message *amqp.Message) {
    if atomic.CompareAndSwapInt64(&firstOffset, -1, consumerContext.Consumer.GetOffset()) {
        fmt.Println("First message received.")
    }
    if atomic.AddInt64(&messageCount, 1)%10 == 0 {
        consumerContext.Consumer.StoreOffset() // store offset every 10 messages
    }
    if string(message.GetData()) == "marker" {
        lastOffset.Store(consumerContext.Consumer.GetOffset())
        consumerContext.Consumer.StoreOffset() // store the offset on consumer closing
        consumerContext.Consumer.Close()
        ch <- true
    }
}

var offsetSpecification stream.OffsetSpecification
consumerName := "offset-tracking-tutorial" // name of the consumer
storedOffset, err := env.QueryOffset(consumerName, streamName) // get last stored offset
if errors.Is(err, stream.OffsetNotFoundError) {
    // start consuming at the beginning of the stream if no stored offset
    offsetSpecification = stream.OffsetSpecification{}.First()
} else {
    // start just after the last stored offset
    offsetSpecification = stream.OffsetSpecification{}.Offset(storedOffset + 1)
}

_, err = env.NewConsumer(streamName, messagesHandler,
    stream.NewConsumerOptions().
        SetManualCommit(). // activate manual offset tracking
        SetConsumerName(consumerName). // the consumer must a have name
        SetOffset(offsetSpecification))
fmt.Println("Started consuming...")
_ = <-ch

fmt.Printf("Done consuming, first offset %d, last offset %d.\n", firstOffset, lastOffset.Load())
```

The most relevant changes are:
* The program looks up the last stored offset before creating the consumer.
If there is no stored offset (it is likely the very first time this consumer starts), it uses `first`.
If there is a stored offset, it uses the `offset` specification to start just after (`stored offset + 1`), which assumes the message with the stored offset has been processed in the previous instance of the application.
* The consumer must have a name.
It is the key to store and retrieve the last stored offset value.
* The manual tracking strategy is activated, which implies explicit calls to store offsets.
* The offset is stored every 10 messages.
This is an unusually low value for offset storage frequency, but this is OK for this tutorial.
Values in the real world are rather in the hundreds or in the thousands.
* The offset is stored before closing the consumer, just after getting the marker message.

Let's run the updated receiver:

```shell
go run offset_tracking_receive.go
```

Here is the output:

```shell
Started consuming...
First message received.
Done consuming, first offset 0, last offset 99.
```

There is nothing surprising there: the consumer got the messages from the beginning of the stream and stopped when it reached the marker message. 

Let's start it another time:

```shell
go run offset_tracking_receive.go
```

Here is the output:

```shell
Started consuming...
First message received.
Done consuming, first offset 100, last offset 199.
```

The consumer restarted exactly where it left off: the last offset in the first run was 99 and the first offset in this second run is 100.
The consumer stored offset tracking information in the first run, so the client library uses it to resume consuming at the right position in the second run.

This concludes this tutorial on consuming semantics in RabbitMQ Streams.
It covered how a consumer can attach anywhere in a stream.
Consuming applications are likely to keep track of the point they reached in a stream.
They can use the built-in server-side offset tracking feature as demonstrated in this tutorial.
They are also free to use any other data store solution for this task.

See the [RabbitMQ blog](https://www.rabbitmq.com/blog/2021/09/13/rabbitmq-streams-offset-tracking) and the [stream Go client documentation](https://github.com/rabbitmq/rabbitmq-stream-go-client?tab=readme-ov-file#manual-track-offset) for more information on offset tracking.
