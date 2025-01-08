---
title: RabbitMQ tutorial - Routing
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

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';
import T4DiagramDirectX from '@site/src/components/Tutorials/T4DiagramDirectX.md';
import T4DiagramMultipleBindings from '@site/src/components/Tutorials/T4DiagramMultipleBindings.md';
import T4DiagramFull from '@site/src/components/Tutorials/T4DiagramFull.md';

# RabbitMQ tutorial - Routing

## Routing
### (using the .NET client)

<TutorialsHelp/>

In the [previous tutorial](./tutorial-three-dotnet) we built a
simple logging system. We were able to broadcast log messages to many
receivers.

In this tutorial we're going to add a feature to it - we're going to
make it possible to subscribe only to a subset of the messages. For
example, we will be able to direct only critical error messages to the
log file (to save disk space), while still being able to print all of
the log messages on the console.


Bindings
--------

In previous examples we were already creating bindings. You may recall
code like:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/ReceiveLogs/ReceiveLogs.cs#L15
```

A binding is a relationship between an exchange and a queue. This can
be simply read as: the queue is interested in messages from this
exchange.

Bindings can take an extra `routingKey` parameter. To avoid the
confusion with a `BasicPublishAsync` parameter we're going to call it a
`binding key`. This is how we could create a binding with a key:

```csharp
await channel.QueueBindAsync(queue: queueName, exchange: "direct_logs", routingKey: "black");
```

The meaning of a binding key depends on the exchange type. The
`fanout` exchanges, which we used previously, simply ignored its
value.

Direct exchange
---------------

Our logging system from the previous tutorial broadcasts all messages
to all consumers. We want to extend that to allow filtering messages
based on their severity. For example we may want the script which is
writing log messages to the disk to only receive critical errors, and
not waste disk space on warning or info log messages.

We were using a `fanout` exchange, which doesn't give us much
flexibility - it's only capable of mindless broadcasting.

We will use a `direct` exchange instead. The routing algorithm behind
a `direct` exchange is simple - a message goes to the queues whose
`binding key` exactly matches the `routing key` of the message.

To illustrate that, consider the following setup:

<T4DiagramDirectX/>

In this setup, we can see the `direct` exchange `X` with two queues bound
to it. The first queue is bound with binding key `orange`, and the second
has two bindings, one with binding key `black` and the other one
with `green`.

In such a setup a message published to the exchange with a routing key
`orange` will be routed to queue `Q1`. Messages with a routing key of `black`
or `green` will go to `Q2`. All other messages will be discarded.


Multiple bindings
-----------------
<T4DiagramMultipleBindings/>

It is perfectly legal to bind multiple queues with the same binding
key. In our example we could add a binding between `X` and `Q1` with
binding key `black`. In that case, the `direct` exchange will behave
like `fanout` and will broadcast the message to all the matching
queues. A message with routing key `black` will be delivered to both
`Q1` and `Q2`.


Emitting logs
-------------

We'll use this model for our logging system. Instead of `fanout` we'll
send messages to a `direct` exchange. We will supply the log severity as
a `routing key`. That way the receiving script will be able to select
the severity it wants to receive. Let's focus on emitting logs
first.

As always, we need to create an exchange first:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/EmitLogDirect/EmitLogDirect.cs#L8
```

And we're ready to send a message:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/EmitLogDirect/EmitLogDirect.cs#L12-L13
```

To simplify things we will assume that 'severity' can be one of
`info`, `warning`, or `error`.


Subscribing
-----------

Receiving messages will work just like in the previous tutorial, with
one exception - we're going to create a new binding for each severity
we're interested in.


```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/ReceiveLogsDirect/ReceiveLogsDirect.cs#L23-L29
```

Putting it all together
-----------------------



<T4DiagramFull/>


The code for `EmitLogDirect.cs` class:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/EmitLogDirect/EmitLogDirect.cs
```

The code for `ReceiveLogsDirect.cs`:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/ReceiveLogsDirect/ReceiveLogsDirect.cs
```

Create projects as usual (see [tutorial one](./tutorial-one-dotnet) for
advice).

If you want to save only 'warning' and 'error' (and not 'info') log
messages to a file, just open a console and type:

```bash
cd ReceiveLogsDirect
dotnet run warning error > logs_from_rabbit.log
```

If you'd like to see all the log messages on your screen, open a new
terminal and do:

```bash
cd ReceiveLogsDirect
dotnet run info warning error
# => [*] Waiting for logs. To exit press CTRL+C
```

And, for example, to emit an `error` log message just type:

```bash
cd EmitLogDirect
dotnet run error "Run. Run. Or it will explode."
# => [x] Sent 'error':'Run. Run. Or it will explode.'
```

Move on to [tutorial 5](./tutorial-five-dotnet) to find out how to listen
for messages based on a pattern.
