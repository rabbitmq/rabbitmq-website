---
title: RabbitMQ tutorial - Routing (AMQP 1.0)
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
import T4DiagramToC from '@site/src/components/Tutorials/T4DiagramToC.md';
import T4DiagramDirectX from '@site/src/components/Tutorials/T4DiagramDirectX.md';
import T4DiagramMultipleBindings from '@site/src/components/Tutorials/T4DiagramMultipleBindings.md';

# RabbitMQ tutorial - Routing

## Routing
### (using the AMQP 1.0 .NET client)

<TutorialsHelp/>

<T4DiagramToC/>

In the [previous tutorial](./tutorial-three-dotnet-amqp10) we used a `fanout` exchange. Here we use a **`direct`** exchange so consumers can subscribe to a subset of messages (for example by severity).

Bindings
--------

<T4DiagramDirectX/>

<T4DiagramMultipleBindings/>

The sample uses exchange `logs_direct`. The publisher sets the routing key when building the publisher:

```csharp
IPublisher publisher = await connection.PublisherBuilder().Exchange(exchangeName).Key(severity).BuildAsync();
```

The consumer declares an exclusive temporary queue and binds it once per severity from the command line:

```csharp
foreach (string severity in args)
{
    IBindingSpecification binding = management.Binding()
        .SourceExchange(exchangeSpec)
        .DestinationQueue(queueName)
        .Key(severity);
    await binding.BindAsync();
}
```

The handler can read the effective routing key from message annotations (see `ReceiveLogsDirect/Program.cs`).

### Running

```bash
dotnet run --project ReceiveLogsDirect/ReceiveLogsDirect.csproj warning error
dotnet run --project EmitLogDirect/EmitLogDirect.csproj warning "Run. Run. Or it will explode."
```

### Source

- [`EmitLogDirect/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/EmitLogDirect/Program.cs)
- [`ReceiveLogsDirect/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/ReceiveLogsDirect/Program.cs)

Now we can move on to [tutorial 5](./tutorial-five-dotnet-amqp10) to learn about pattern-based routing with topic exchanges.
