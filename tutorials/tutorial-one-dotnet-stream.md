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
### (using the .NET/C# Stream Client)

In this part of the tutorial we'll write two programs in C#; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the .NET client API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.


> #### The .NET stream client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses RabbitMQ stream protocol which is a dedicated
> protocol for [RabbitMQ streams](/docs/streams). There are a number of clients
> for RabbitMQ in [many different
> languages](/client-libraries/devtools), see the stream client libraries for each language.
> We'll use the [.NET stream client](https://github.com/rabbitmq/rabbitmq-stream-dotnet-client) provided by RabbitMQ.
>
> The client supports [.NET Core](https://www.microsoft.com/net/core) as
> well as .NET Framework 6+. This tutorial will use RabbitMQ .NET stream client 1.8.0 and
> .NET Core, so you make sure
> you have it [installed](https://www.microsoft.com/net/core) and in your PATH.
>
> You can also use the .NET Framework to complete this tutorial however the
> setup steps will be different.
>
> RabbitMQ .NET client 1.8 and later versions are distributed via [nuget](https://www.nuget.org/packages/RabbitMQ.Stream.Client/).
>
> This tutorial assumes you are using powershell on Windows. On MacOS and Linux nearly
> any shell will work.

### Setup

First let's verify that you have .NET Core toolchain in `PATH`:

```powershell
dotnet --help
```

should produce a help message.

Now let's generate two projects, one for the publisher and one for the consumer:

```powershell
dotnet new console --name Send
mv Send/Program.cs Send/Send.cs
dotnet new console --name Receive
mv Receive/Program.cs Receive/Receive.cs
```

This will create two new directories named `Send` and `Receive`.

Then we add the client dependency.

```powershell
cd Send
dotnet add package RabbitMQ.Stream.Client 
cd ../Receive
dotnet add package RabbitMQ.Stream.Client 
```

Now we have the .NET project set up we can write some code.

### Sending


We'll call our message producer (sender) `Send.cs` and our message consumer (receiver)
`Receive.cs`.  The producer will connect to RabbitMQ, send a single message,
then exit.

In
[`Send.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-stream/Send/Send.cs),
we need to use some namespaces:

```csharp
using System.Text;
using RabbitMQ.Stream.Client;
using RabbitMQ.Stream.Client.Reliable;
```

then we can create a connection to the server:

```csharp
var streamSystem = await StreamSystem.Create(new StreamSystemConfig());
...
```
The entry point of the stream .NET client is the `StreamSystem`.
It deals with stream management and the creation of publisher and consumer instances. 

It abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine we'd simply specify its hostname or IP address on the `StreamSystemConfig`.

Next we create a Producer.

To send, we must declare a stream for us to send to; then we can publish a message
to the stream:

```csharp
...
await streamSystem.CreateStream(new StreamSpec("hello-stream")
{
    MaxLengthBytes = 5_000_000_000
});

var producer = await Producer.Create(new ProducerConfig(streamSystem, "hello-stream"));


await producer.Send(new Message(Encoding.UTF8.GetBytes($"Hello, World")));
```

Declaring a stream is idempotent - it will only be created if it doesn't exist already.

Streams model an append-only log of messages that can be repeatedly read until they expire.
It is a good practice to always define the retention policy, 5Gb in this case.

The message content is a byte array, so you can encode whatever you like there.

When the code above finishes running, the producer connection and stream-system
connection will be closed. That's it for our producer.

Each time you run the producer, it will send a single message to the server and the message will be 
appended to the stream.

[Here's the whole Send.cs
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-stream/Send/Send.cs).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The [configuration file documentation](/docs/configure#config-items)
> will show you how to set <code>disk_free_limit</code>.


### Receiving

As for the consumer, it is listening for messages from
RabbitMQ. So unlike the producer which publishes a single message, we'll
keep the consumer running continuously to listen for messages and print them out.


The code (in [`Receive.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-stream/Receive/Receive.cs)) has almost the same `using` statements as `Send`:

```csharp
using System.Text;
using RabbitMQ.Stream.Client;
using RabbitMQ.Stream.Client.Reliable;
```

Setting up is the same as the producer; we create a stream-system,
consumer, and declare the stream from which we're going to consume.
Note this matches up with the stream that `Send` publishes to.

```csharp
var streamSystem = await StreamSystem.Create(new StreamSystemConfig());

await streamSystem.CreateStream(new StreamSpec("hello-stream")
{
    MaxLengthBytes = 5_000_000_000
});
...
```

Note that we declare the stream here as well. Because we might start
the consumer before the producer, we want to make sure the stream exists
before we try to consume messages from it.

We need to use `Consumer` class to create the consumer and `ConsumerConfig` to configure it. 

We're about to tell the server to deliver us the messages from the
stream. We provide a callback `MessageHandler` on the `ConsumerConfig`.

`OffsetSpec` defines the starting point of the consumer. 
In this case, we start from the first message. 


```csharp
...
var consumer = await Consumer.Create(new ConsumerConfig(streamSystem, "hello-stream")
{
    OffsetSpec = new OffsetTypeFirst(),
    MessageHandler = async (stream, _, _, message) =>
    {
        Console.WriteLine($"Stream: {stream} - " +
                          $"Received message: {Encoding.UTF8.GetString(message.Data.Contents)}");
        await Task.CompletedTask;
    }
});

```


[Here's the whole Receive.cs
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-stream/Receive/Receive.cs).

### Putting It All Together

Open two terminals.

You can run the clients in any order, as both declare the stream.
We will run the consumer first so you can see it waiting for and then receiving the message:

```powershell
cd Receive
dotnet run
```

Then run the producer:

```powershell
cd Send
dotnet run
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages, so try restarting
the publisher several times.

Streams are different from queues in that they are append-only logs of messages.
So you can run the different consumers and they will always start from the first message.

[//]: # (Time to move on to [part 2]&#40;./tutorial-two-dotnet-stream&#41; and deal with a confirmation.)
