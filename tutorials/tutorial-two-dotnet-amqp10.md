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
### (using the AMQP 1.0 .NET client)

<TutorialsHelp/>

<T2DiagramToC/>

In the [first tutorial](./tutorial-one-dotnet-amqp10) we
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

This tutorial uses the [RabbitMQ AMQP 1.0 .NET client](/client-libraries/amqp-client-libraries) (`RabbitMQ.AMQP.Client`). It requires RabbitMQ **4.0 or later**.

Preparation
-----------

In the previous part of this tutorial we sent a message containing
"Hello World!". Now we'll be sending strings that stand for complex
tasks. We fake work by sleeping: each `.` in the string adds one second.

The producer is `NewTask/Program.cs`; the consumer is `Worker/Program.cs`.

`NewTask` publishes to a quorum queue `task_queue` and checks `OutcomeState.Accepted`:

```csharp
IQueueSpecification queueSpec = management.Queue(taskQueueName).Type(QueueType.QUORUM);
await queueSpec.DeclareAsync();

IPublisher publisher = await connection.PublisherBuilder().Queue(taskQueueName).BuildAsync();
// ...
PublishResult pr = await publisher.PublishAsync(amqpMessage);
if (pr.Outcome.State != OutcomeState.Accepted)
{
    Console.Error.WriteLine($"Unexpected publish outcome: {pr.Outcome.State}");
    Environment.Exit(1);
}
```

`Worker` uses `InitialCredits(1)` for fair dispatch and calls `ctx.Accept()` after `DoWork` in a `finally` block:

```csharp
IConsumer consumer = await connection.ConsumerBuilder()
    .Queue(taskQueueName)
    .InitialCredits(1)
    .MessageHandler((ctx, message) =>
    {
        string body = Encoding.UTF8.GetString(message.Body()!);
        Console.WriteLine($" [x] Received '{body}'");
        try
        {
            DoWork(body);
        }
        finally
        {
            Console.WriteLine(" [x] Done");
            ctx.Accept();
        }

        return Task.CompletedTask;
    })
    .BuildAndStartAsync();
```

Round-robin dispatching
-----------------------

Run two workers and publish tasks from a third terminal (from `dotnet-amqp`):

```bash
dotnet run --project Worker/Worker.csproj
dotnet run --project Worker/Worker.csproj
dotnet run --project NewTask/NewTask.csproj "First message."
dotnet run --project NewTask/NewTask.csproj "Second message.."
```

By default, RabbitMQ sends each message to the next consumer in sequence (round-robin).

Message acknowledgment
----------------------

With AMQP 1.0, the consumer must **settle** each message (`Accept`, etc.). Settle **after** work completes so a crash mid-task allows redelivery.

Fair dispatch
-------------

<T2DiagramPrefetch/>

Use **`InitialCredits(1)`** on the consumer builder so only one un-settled message is in flight per consumer (similar to prefetch 1 / `basicQos` in AMQP 0-9-1).

Putting it all together
-----------------------

See [`NewTask/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/NewTask/Program.cs) and [`Worker/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/Worker/Program.cs) for the full sources (once merged upstream).

Now we can move on to [tutorial 3](./tutorial-three-dotnet-amqp10) and learn how to deliver the same message to many consumers.
