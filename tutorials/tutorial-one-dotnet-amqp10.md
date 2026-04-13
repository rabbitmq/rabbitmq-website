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
### (using the AMQP 1.0 .NET client)

In this part of the tutorial we'll write two small programs in C#; a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the detail in
the .NET AMQP 1.0 client API, concentrating on this very simple thing just to get
started. It's the "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<T1DiagramHello/>

> #### The AMQP 1.0 .NET client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses **AMQP 1.0** over the same port as AMQP 0-9-1 (5672 by default). It requires **RabbitMQ 4.0 or later**.
>
> Use the RabbitMQ **AMQP 1.0** .NET client (`RabbitMQ.AMQP.Client` on NuGet), not the classic AMQP 0-9-1 client (`RabbitMQ.Client`). See [AMQP 1.0 client libraries](/client-libraries/amqp-client-libraries) and the [.NET client API](https://rabbitmq.github.io/rabbitmq-amqp-dotnet-client/api/RabbitMQ.AMQP.Client.html).
>
> Add the package to your project:
>
> ```bash
> dotnet add package RabbitMQ.AMQP.Client
> ```
>
> Runnable sources for this tutorial series are available in the [RabbitMQ tutorials](https://github.com/rabbitmq/rabbitmq-tutorials) repository (`dotnet-amqp` directory) once merged upstream.

Now we have the client referenced, we can write some code.

### Sending

<T1DiagramSending/>

We'll call our message publisher (sender) `Send` and our message consumer
`Receive`. The publisher will connect to RabbitMQ, send a single message,
then exit.

In `Send/Program.cs`, use these namespaces:

```csharp
using System.Text;
using RabbitMQ.AMQP.Client;
using RabbitMQ.AMQP.Client.Impl;
```

Create connection settings, an environment, and a connection. The URI uses the default virtual host (`%2f` is `/`):

```csharp
const string brokerUri = "amqp://guest:guest@localhost:5672/%2f";

ConnectionSettings settings = ConnectionSettingsBuilder.Create()
    .Uri(new Uri(brokerUri))
    .ContainerId("tutorial-send")
    .Build();

IEnvironment environment = AmqpEnvironment.Create(settings);
IConnection connection = await environment.CreateConnectionAsync();
```

Declare a **quorum queue** named `hello`, then create a publisher and publish a message. Check `PublishResult.Outcome.State` for `OutcomeState.Accepted`:

```csharp
try
{
    IManagement management = connection.Management();
    IQueueSpecification queueSpec = management.Queue("hello").Type(QueueType.QUORUM);
    await queueSpec.DeclareAsync();

    IPublisher publisher = await connection.PublisherBuilder().Queue("hello").BuildAsync();
    try
    {
        const string body = "Hello World!";
        var message = new AmqpMessage(Encoding.UTF8.GetBytes(body));
        PublishResult pr = await publisher.PublishAsync(message);
        if (pr.Outcome.State != OutcomeState.Accepted)
        {
            Console.Error.WriteLine($"Unexpected publish outcome: {pr.Outcome.State}");
            Environment.Exit(1);
        }

        Console.WriteLine($" [x] Sent {body}");
    }
    finally
    {
        await publisher.CloseAsync();
    }
}
finally
{
    await connection.CloseAsync();
    await environment.CloseAsync();
}
```

[Full `Send/Program.cs` source](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/Send/Program.cs) (once merged upstream).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the " [x] Sent" message then you may be left scratching your head wondering what could be wrong. Maybe the broker was started without enough free disk space (by default it needs at least 50 MB free) and is therefore refusing to accept messages. Check the broker [log file](/docs/logging/) to see if there is a [resource alarm](/docs/alarms) logged.

### Receiving

That's it for our publisher. Our consumer listens for messages from RabbitMQ, so unlike the publisher which publishes a single message, we'll keep the consumer running to listen for messages and print them out.

<T1DiagramReceiving/>

The code in `Receive/Program.cs` declares the same quorum queue, then builds a consumer with a message handler. Call `ctx.Accept()` to settle the message (AMQP 1.0):

```csharp
IManagement management = connection.Management();
IQueueSpecification queueSpec = management.Queue("hello").Type(QueueType.QUORUM);
await queueSpec.DeclareAsync();

IConsumer consumer = await connection.ConsumerBuilder()
    .Queue("hello")
    .MessageHandler((ctx, message) =>
    {
        Console.WriteLine($"Received a message: {Encoding.UTF8.GetString(message.Body()!)}");
        ctx.Accept();
        return Task.CompletedTask;
    })
    .BuildAndStartAsync();
```

Use Ctrl+C handling and `Task.Delay(Timeout.Infinite, cts.Token)` to keep the process alive until interrupted.

[Full `Receive/Program.cs` source](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/Receive/Program.cs) (once merged upstream).

### Putting it all together

From the `dotnet-amqp` directory, run the consumer then the publisher:

```bash
dotnet run --project Receive/Receive.csproj
dotnet run --project Send/Send.csproj
```

The consumer will print the message it gets from the publisher via RabbitMQ.

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

Time to move on to [part 2](./tutorial-two-dotnet-amqp10) and build a simple _work queue_.
