---
title: RabbitMQ tutorial - Publish/Subscribe (AMQP 1.0)
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
import T3DiagramToC from '@site/src/components/Tutorials/T3DiagramToC.md';
import T3DiagramExchange from '@site/src/components/Tutorials/T3DiagramExchange.md';
import T3DiagramBinding from '@site/src/components/Tutorials/T3DiagramBinding.md';

# RabbitMQ tutorial - Publish/Subscribe

## Publish/Subscribe
### (using the AMQP 1.0 .NET client)

<TutorialsHelp/>

<T3DiagramToC/>

In the [previous tutorial](./tutorial-two-dotnet-amqp10) we created a work
queue. In this tutorial we'll deliver a message to **multiple** consumers — the "publish/subscribe" pattern.

We'll build a simple logging system: one program emits logs, and one or more receivers print them.

Exchanges
---------

The producer sends messages to an _exchange_, not directly to a queue. The exchange routes messages to queues according to its type.

<T3DiagramExchange/>

Declare a `fanout` exchange named `logs`:

```csharp
IExchangeSpecification exchangeSpec = management.Exchange(exchangeName).Type("fanout");
await exchangeSpec.DeclareAsync();
```

Bindings
--------

Bind a temporary exclusive queue to the exchange:

<T3DiagramBinding/>

```csharp
IQueueSpecification tempQueue = management.Queue().Exclusive(true).AutoDelete(true);
IQueueInfo queueInfo = await tempQueue.DeclareAsync();
string queueName = queueInfo.Name();

IBindingSpecification binding = management.Binding()
    .SourceExchange(exchangeSpec)
    .DestinationQueue(queueName)
    .Key(string.Empty);
await binding.BindAsync();
```

The publisher uses `PublisherBuilder().Exchange(exchangeName)`; the consumer subscribes on `queueName` and calls `ctx.Accept()` in the handler.

### Running

From `dotnet-amqp`:

```bash
dotnet run --project ReceiveLogs/ReceiveLogs.csproj
dotnet run --project EmitLog/EmitLog.csproj
```

### Source

- [`EmitLog/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/EmitLog/Program.cs)
- [`ReceiveLogs/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/ReceiveLogs/Program.cs)

Now we can move on to [tutorial 4](./tutorial-four-dotnet-amqp10) and learn how to route messages based on routing keys.
