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

This part of the tutorial consists in writing two programs in C#; a producer that sends a wave of messages with a marker message at the end, and a consumer that receives messages and stops when it gets the marker message.
It shows how a consumer can navigate through a stream and can even restart where it left off in a previous execution.

This tutorial uses [the stream .NET client](/tutorials/tutorial-one-dotnet-stream#using-the-netc-stream-client).
Make sure to follow [the setup steps](/tutorials/tutorial-one-dotnet-stream#setup) from the first tutorial.

An executable version of this tutorial can be found in the [RabbitMQ tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-stream/).
The sending program is called `OffsetTrackingSend.cs` and the receiving program is called `OffsetTrackingReceive.cs`.

Let's create a project for each program:

```shell
dotnet new console --name OffsetTrackingSend
mv OffsetTrackingSend/Program.cs OffsetTrackingSend/OffsetTrackingSend.cs
dotnet new console --name OffsetTrackingReceive
mv OffsetTrackingReceive/Program.cs OffsetTrackingReceive/OffsetTrackingReceive.cs
```

Then add the client dependency.

```shell
cd OffsetTrackingSend
dotnet add package RabbitMQ.Stream.Client 
cd ../OffsetTrackingReceive
dotnet add package RabbitMQ.Stream.Client 
cd ..
```

The tutorial focuses on the usage of the client library, so the final code in the repository should be used to create the scaffolding of the files (e.g. imports).

### Sending

The sending program starts by creating the `StreamSystem` and declaring the stream:

```csharp
var streamSystem = await StreamSystem.Create(new StreamSystemConfig());

var stream = "stream-offset-tracking-dotnet";
await streamSystem.CreateStream(new StreamSpec(stream));
```

The program then creates a `Producer` instance and publishes 100 messages.
The body value of the last message is set to `marker`; this is a marker for the consumer to stop consuming.

Note the use of a `CountdownEvent`: it is decremented with `Signal()` in each message confirm callback.
This ensures the broker received all the messages before closing the program.

```csharp
var messageCount = 100;
var confirmedCde = new CountdownEvent(messageCount);
var producer = await Producer.Create(new ProducerConfig(streamSystem, stream) {
    ConfirmationHandler = async confirmation => {
        if (confirmation.Status == ConfirmationStatus.Confirmed) {
            confirmedCde.Signal();
        }
        await Task.CompletedTask.ConfigureAwait(false);
    }
});

Console.WriteLine("Publishing {0} messages...", messageCount);
for (int i = 0; i < messageCount; i++) {
    var body = i == messageCount - 1 ? "marker" : "hello";
    await producer.Send(new Message(Encoding.UTF8.GetBytes(body)));
}

confirmedCde.Wait();
Console.WriteLine("Messages confirmed.");
await producer.Close();
await streamSystem.Close();
```

Let's now create the receiving program.

### Receiving

The receiving program creates a `StreamSystem` instance and makes sure the stream is created as well.
This part of the code is the same as in the sending program, so it is skipped in the next code snippets for brevity's sake.

The receiving program starts a consumer that attaches at the beginning of the stream (`new OffsetTypeFirst()`).
It uses variables to output the offsets of the first and last received messages at the end of the program.

The consumer stops when it receives the marker message: it assigns the offset to a variable, closes the consumer, and decrement the `CountdownEvent`.
Like for the sender, the `CountdownEvent` tells the program to move on when the consumer is done with its job.

```csharp
IOffsetType offsetSpecification = new OffsetTypeFirst();
ulong initialValue = UInt64.MaxValue;
ulong firstOffset = initialValue;
ulong lastOffset = initialValue;
var consumedCde = new CountdownEvent(1);
var consumer = await Consumer.Create(new ConsumerConfig(streamSystem, stream)
{
    OffsetSpec = offsetSpecification,
    MessageHandler = async (_, consumer, context, message) => {
        if (Interlocked.CompareExchange(ref firstOffset, context.Offset, initialValue) == initialValue) {
            Console.WriteLine("First message received.");
        }
        if ("marker".Equals(Encoding.UTF8.GetString(message.Data.Contents))) {
            Interlocked.Exchange(ref lastOffset, context.Offset);
            await consumer.Close();
            consumedCde.Signal();
        }
        await Task.CompletedTask;
    }
});
Console.WriteLine("Started consuming...");

consumedCde.Wait();
Console.WriteLine("Done consuming, first offset {0}, last offset {1}.", firstOffset, lastOffset);
await streamSystem.Close();
```

### Exploring the Stream

In order to run both examples, open two terminal (shell) tabs.

In the first tab, `cd` into the `OffsetTrackingSend` directory, and run the sender to publish a wave of messages:

```shell
dotnet run
```

The output is the following:

```shell
Publishing 100 messages...
Messages confirmed.
```

Let's run now the receiver.
Open a new tab and `cd` into the `OffsetTrackingSend` directory.
Remember it should start from the beginning of the stream because of the `first` offset specification.

```shell
dotnet run
```

Here is the output:

```shell
Started consuming...
First message received.
Done consuming, first offset 0, last offset 99
```

:::note[What is an offset?]
A stream can be seen as an array where elements are messages.
The offset is the index of a given message in the array.
:::

A stream is different from a queue: consumers can read and re-read the same messages and the messages stay in the stream.

Let's try this feature by using the `offset(long)` specification to attach at a given offset.
Set the `offsetSpecification` variable from `OffsetTypeFirst()` to `OffsetTypeOffset(42)`:

```csharp
IOffsetType offsetSpecification = new OffsetTypeOffset(42);
```

Offset 42 is arbitrary, it could have been any number between 0 and 99.
Run the receiver again:

```shell
dotnet run
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

```csharp
IOffsetType offsetSpecification = new OffsetTypeNext();
```

Run the receiver:

```shell
dotnet run
```

This time the consumer does not get any messages:

```shell
Started consuming...
```

It is waiting for new messages in the stream.
Let's publish some by running the sender again.
Back to the first tab:

```shell
dotnet run
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

```csharp
var consumerName = "offset-tracking-tutorial"; // name of the consumer
IOffsetType offsetSpecification;
try {
    // get last stored offset
    ulong storedOffset = await streamSystem.QueryOffset(consumerName, stream).ConfigureAwait(false);
    // start just after the last stored offset
    offsetSpecification = new OffsetTypeOffset(storedOffset + 1);
} catch (OffsetNotFoundException) {
    // start consuming at the beginning of the stream if no stored offset
    offsetSpecification = new OffsetTypeFirst();
}
ulong initialValue = UInt64.MaxValue;
ulong firstOffset = initialValue;
int messageCount = 0; // number of received messages
ulong lastOffset = initialValue;
var consumedCde = new CountdownEvent(1);
var consumer = await Consumer.Create(new ConsumerConfig(streamSystem, stream)
{
    OffsetSpec = offsetSpecification,
    Reference =  consumerName,  // the consumer must a have name
    MessageHandler = async (_, consumer, context, message) => {
        if (Interlocked.CompareExchange(ref firstOffset, context.Offset, initialValue) == initialValue) {
            Console.WriteLine("First message received.");
        }
        if (Interlocked.Increment(ref messageCount) % 10 == 0) {
            // store offset every 10 messages
            await consumer.StoreOffset(context.Offset).ConfigureAwait(false);
        }
        if ("marker".Equals(Encoding.UTF8.GetString(message.Data.Contents))) {
            Interlocked.Exchange(ref lastOffset, context.Offset);
            // store the offset on consumer closing
            await consumer.StoreOffset(context.Offset).ConfigureAwait(false);
            await consumer.Close();
            consumedCde.Signal();
        }
        await Task.CompletedTask;
    }
});
Console.WriteLine("Started consuming...");

consumedCde.Wait();
Console.WriteLine("Done consuming, first offset {0}, last offset {1}.", firstOffset, lastOffset);
await streamSystem.Close();
```

The most relevant changes are:
* The program looks up the last stored offset before creating the consumer.
If there is no stored offset (it is likely the very first time this consumer starts), it uses `first`.
If there is a stored offset, it uses the `offset` specification to start just after (`stored offset + 1`), which assumes the message with the stored offset has been processed in the previous instance of the application.
* The consumer must have a name.
It is the key to store and retrieve the last stored offset value.
* The offset is stored every 10 messages.
This is an unusually low value for offset storage frequency, but this is OK for this tutorial.
Values in the real world are rather in the hundreds or in the thousands.
* The offset is stored before closing the consumer, just after getting the marker message.

Let's run the updated receiver:

```shell
dotnet run
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
dotnet run
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

See the [RabbitMQ blog](https://www.rabbitmq.com/blog/2021/09/13/rabbitmq-streams-offset-tracking) and the [stream .NET client documentation](https://rabbitmq.github.io/rabbitmq-stream-dotnet-client/stable/htmlsingle/index.html#consumer-offset-tracking) for more information on offset tracking.
