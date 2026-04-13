---
title: RabbitMQ tutorial - Remote procedure call (RPC) (AMQP 1.0)
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
import T6DiagramToC from '@site/src/components/Tutorials/T6DiagramToC.md';

# RabbitMQ tutorial - Remote procedure call (RPC)

## Remote procedure call (RPC)
### (using the AMQP 1.0 .NET client)

<TutorialsHelp/>

<T6DiagramToC/>

In the [previous tutorial](./tutorial-five-dotnet-amqp10) we used topic exchanges. In this tutorial we implement **request/reply** (RPC): a client sends a request and waits for a response.

The sample RPC service computes Fibonacci numbers on the server. The server uses **`IResponder`** on a quorum queue `rpc_queue`; the client uses **`IRequester`** to publish requests and await replies.

### Server (`RPCServer`)

```csharp
IResponder responder = await connection.ResponderBuilder()
    .RequestQueue(rpcQueueName)
    .Handler((ctx, request) =>
    {
        string response = "";
        try
        {
            string message = Encoding.UTF8.GetString(request.Body()!);
            int n = int.Parse(message);
            Console.WriteLine($" [.] fib({message})");
            response += Fib(n);
        }
        catch (Exception e)
        {
            Console.WriteLine($" [.] {e.Message}");
        }

        return Task.FromResult(ctx.Message(Encoding.UTF8.GetBytes(response)));
    })
    .BuildAsync();
```

### Client (`RPCClient`)

```csharp
IRequester requester = await connection.RequesterBuilder()
    .RequestAddress()
    .Queue("rpc_queue")
    .Requester()
    .BuildAsync();

IMessage request = new AmqpMessage(Encoding.UTF8.GetBytes(iStr));
IMessage reply = await requester.PublishAsync(request);
```

The tutorial client requests `fib(0)` through `fib(31)` in a loop, matching the other AMQP 1.0 tutorial ports.

### Running

```bash
dotnet run --project RPCServer/RPCServer.csproj
dotnet run --project RPCClient/RPCClient.csproj
```

### Source

- [`RPCServer/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/RPCServer/Program.cs)
- [`RPCClient/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/RPCClient/Program.cs)

> #### A note on RPC
>
> RPC is common but easy to misuse: keep clear which calls are local vs remote, document dependencies, and handle broker or server outages. When in doubt, prefer asynchronous pipelines over blocking RPC.

For more on AMQP 1.0 and RabbitMQ, see [AMQP in RabbitMQ](/docs/amqp) and [AMQP 1.0 client libraries](/client-libraries/amqp-client-libraries).
