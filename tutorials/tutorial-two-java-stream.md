---
title: RabbitMQ tutorial - Offset Tracking
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

# RabbitMQ Stream tutorial - Offset Tracking

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## Offset Tracking

### Setup

In this part of the tutorial we'll write two programs in Java; a producer that sends a wave of messages with a poison message at the end, and a consumer that receives messages and stops when it gets the poison message.
We'll see how a consumer can navigate through a stream and can even restart where it left off in a previous execution.

We'll use [the stream Java client](/tutorials/tutorial-one-java-stream#using-the-java-stream-client).
Make sure to follow [the setup steps](/tutorials/tutorial-one-java-stream#setup) from the first tutorial.

### Sending

The sending program starts by instanciating the `Environment` and creating the stream:

```java
try (Environment environment = Environment.builder().build()) {
    String stream = "stream-offset-tracking-java";
    environment.streamCreator()
      .stream(stream)
      .maxLengthBytes(ByteCapacity.GB(1))
      .create();

     // publishing code to come

}
```

We then create the `Producer` and publish 100 messages.
We set the body value of the last message to `poison`; this is a marker for the consumer to stop consuming.

Note we use a `CountDownLatch`: it is decremented with `countDown` in each message confirm callback.
This way we make sure the broker received all the messages before closing the program.

```java
Producer producer = environment.producerBuilder()
                               .stream(stream)
                               .build();

int messageCount = 100;
CountDownLatch confirmedLatch = new CountDownLatch(messageCount);

IntStream.range(0, messageCount).forEach(i -> {
    String body = i == messageCount - 1 ? "poison" : "hello";
    producer.send(producer.messageBuilder()
                          .addData(body.getBytes(UTF_8))
                          .build(),
                  ctx -> confirmedLatch.countDown()
    );
});

boolean completed = confirmedLatch.await(60, TimeUnit.SECONDS);
```

Let's create now the receiving program.

### Receiving

The receiving program starts a consumer that attaches at the beginning of the stream (`OffsetSpecification.first()`).
We use variables to output the offsets of the first last received messages at the end of the program.

The consumer stops when it receives the poison message: it assigns the offset to a variable, closes the consumer, and decrement the latch count.
Like for the sender, the `CountDownLatch` helps us moving on when the consumer job is done.

```java
OffsetSpecification offsetSpecification = OffsetSpecification.first();
AtomicLong firstOffset = new AtomicLong(-1);
AtomicLong lastOffset = new AtomicLong(0);
CountDownLatch consumeLatch = new CountDownLatch(1);
environment.consumerBuilder()
    .stream(stream)
    .offset(offsetSpecification)
    .messageHandler((ctx, msg) -> {
        if (firstOffset.compareAndSet(-1, ctx.offset())) {
          System.out.println("First message received.");
        }
        String body = new String(msg.getBodyAsBinary(), StandardCharsets.UTF_8);
        if ("poison".equals(body)) {
          lastOffset.set(ctx.offset());
          ctx.consumer().close();
          consumeLatch.countDown();
        }
    })
    .build();
System.out.println("Started consuming...");

consumeLatch.await(60, TimeUnit.MINUTES);

System.out.printf("Done consuming, first offset %d, last offset %d.%n",
                  firstOffset.get(), lastOffset.get());
```

### Exploring the Stream

In order to run both examples, open two terminal (shell) tabs.

In the first tab, run the sender to publish a wave of messages:

```shell
./mvnw -q compile exec:java '-Dexec.mainClass=OffsetTrackingSend'
```

The output is the following:

```shell
Publishing 100 messages
Messages confirmed: true.
```

Let's run now the receiver.
Open a new tab.
Remember it should start from the beginning of the stream because of the `first` offset specification.

```shell
./mvnw -q compile exec:java '-Dexec.mainClass=OffsetTrackingReceive'
```

You should see:

```shell
Started consuming...
First message received.
Done consuming, first offset 0, last offset 99.
```

:::note[What is an offset?]
We can think of a stream as an array where elements are messages.
The offset is the index of a given message in the array.
:::

A stream is different from a queue: consumers can read and re-read the same messages and the messages stay in the stream.

Let's try this feature.
We will use the `offset(long)` specification to attach at a given offset.
Set the `offsetSpecification` variable from `OffsetSpecification.first()` to `OffsetSpecification.offset(42)`:

```java
OffsetSpecification offsetSpecification = OffsetSpecification.offset(42);
```

We used offset 42, but it could have been any number between 0 and 99.
Run the receiver again:

```shell
./mvnw -q compile exec:java '-Dexec.mainClass=OffsetTrackingReceive'
```

You should see:

```shell
Started consuming...
First message received.
Done consuming, first offset 42, last offset 99.
```

There is also a way to attach at the very end of stream to see only new messages at the time of the consumer creation.
This is the `next` offset specification.
Let's try it:

```java
OffsetSpecification offsetSpecification = OffsetSpecification.next();
```

Run the receiver:

```shell
./mvnw -q compile exec:java '-Dexec.mainClass=OffsetTrackingReceive'
```

This time you should only see:

```shell
Started consuming...
```

The consumer is waiting for new messages in the stream.
Let's publish some by running the sender again.
Back to the first tab:

```shell
./mvnw -q compile exec:java '-Dexec.mainClass=OffsetTrackingSend'
```

Wait for the program to exit and switch back to the receiver tab.
You should see the consumer received the new messages:

```shell
Started consuming...
First message received.
Done consuming, first offset 100, last offset 199.
```

The receiver stopped because of the new poison message the sender put at the end of the stream.

We saw we can "browse" a stream: from the beginning, from any offset, even for new messages.
In the next section we will how to leverage server-side offset tracking to resume where a consumer left off in a previous execution.

### Server-Side Offset Tracking

RabbitMQ Streams provide server-side offset tracking to store the progress of a given consumer in a stream.
If the consumer were to stop for any reason (crash, upgrade, etc), it would be able to re-attach where it stopped previously to avoid processing the same messages.

Note RabbitMQ Streams provides an API for offset tracking, but you are free to use any other solution to store the progress of your consuming applications.
It may depend on the use case, but a relational database can be a good solution as well.

Let's modify the receiver to store the offset of processed messages.
The updated lines are outlined with comments:

```java
// start consuming at the beginning of the stream
OffsetSpecification offsetSpecification = OffsetSpecification.first();
AtomicLong messageCount = new AtomicLong(0);
environment.consumerBuilder()
    .stream(stream)
    .offset(offsetSpecification)
    .name("offset-tracking-tutorial") // the consumer must a have name
    .manualTrackingStrategy().builder() // activate manual offset tracking
    .messageHandler((ctx, msg) -> {
        if (firstOffset.compareAndSet(-1, ctx.offset())) {
            System.out.println("First message received.");
        }
        if (messageCount.incrementAndGet() % 10 == 0) {
            ctx.storeOffset(); // store offset every 10 messages
        }
        String body = new String(msg.getBodyAsBinary(), StandardCharsets.UTF_8);
        if (body.equals("poison")) {
            lastOffset.set(ctx.offset());
            ctx.storeOffset(); // store the offset on consumer closing
            ctx.consumer().close();
            consumeLatch.countDown();
        }
    })
    .build();
```

Let's see the most relevant changes:
* We start consuming at the beginning of the stream with `OffsetSpecification.first()`.
* We must set a name for our consumer.
This will be the key to store and retrieve the last stored offset.
* We will handle the offset tracking ourselves with the manual tracking strategy.
* We store the offset we reached every 10 messages.
This is an unusually low value for offset storage frequency, but this is OK for this tutorial.
Values in the real world are rather in the hundreds or in the thousands.
* We store the offset before closing the consumer, just after getting the poison message.

Let's run the updated receiver:


```shell
./mvnw -q compile exec:java '-Dexec.mainClass=OffsetTrackingReceive'
```

Here is the output:

```shell
Started consuming...
First message received.
Done consuming, first offset 0, last offset 99.
```

There is nothing surprising there: we consumed messages from the beginning of the stream to the first poison message.

Let's start the receiver another time:

```shell
./mvnw -q compile exec:java '-Dexec.mainClass=OffsetTrackingReceive'
```

Here is the output:

```shell
Started consuming...
First message received.
Done consuming, first offset 100, last offset 199.
```

We restarted exactly where we left off: the last offset in the first run was 99 and the first offset in this second run is 100.
Note the `first` offset specification is ignored: a stored offset takes precedence over the offset specification parameter.
We stored offset tracking information in the first run, so the client library uses it to resume consuming at the right position in the second run.

This concludes this tutorial on consuming semantics in RabbitMQ Streams.
We saw a consumer can attach anywhere in a stream.
Consuming applications are likely to keep track of the point they reached in a stream.
They can use the built-in server-side offset tracking feature we demonstrated in this tutorial.
They are also free to use any other data store solution for this task.

You can learn more about offset tracking on the [RabbitMQ blog](https://www.rabbitmq.com/blog/2021/09/13/rabbitmq-streams-offset-tracking) and in the [stream Java client documentation](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#consumer-offset-tracking).


```shell
./mvnw -q compile exec:java '-Dexec.mainClass=OffsetTrackingSend'
```

```shell
./mvnw -q compile exec:java '-Dexec.mainClass=OffsetTrackingReceive'
```

```shell
Started consuming...
First message received.
Done consuming, first offset 221, last offset 320.
```
