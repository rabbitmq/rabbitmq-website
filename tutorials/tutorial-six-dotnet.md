---
title: RabbitMQ tutorial - Remote procedure call (RPC)
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
import T6DiagramFull from '@site/src/components/Tutorials/T6DiagramFull.md';

# RabbitMQ tutorial - Remote procedure call (RPC)

## Remote procedure call (RPC)
### (using the .NET client)

<TutorialsHelp/>


In the [second tutorial](./tutorial-two-dotnet) we learned how to
use _Work Queues_ to distribute time-consuming tasks among multiple
workers.

But what if we need to run a function on a remote computer and wait for
the result?  Well, that's a different story. This pattern is commonly
known as _Remote Procedure Call_ or _RPC_.

In this tutorial we're going to use RabbitMQ to build an RPC system: a
client and a scalable RPC server. As we don't have any time-consuming
tasks that are worth distributing, we're going to create a dummy RPC
service that returns Fibonacci numbers.

### Client interface

To illustrate how an RPC service could be used we're going to
create a simple client class. It's going to expose a method named `CallAsync`
which sends an RPC request and awaits the answer:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/RPCClient/RPCClient.cs#L112-L120
```

> #### A note on RPC
>
> Although RPC is a pretty common pattern in computing, it's often criticised.
> The problems arise when a programmer is not aware
> whether a function call is local or if it's a slow RPC. Confusions
> like that result in an unpredictable system and adds unnecessary
> complexity to debugging. Instead of simplifying software, misused RPC
> can result in unmaintainable spaghetti code.
>
> Bearing that in mind, consider the following advice:
>
>  * Make sure it's obvious which function call is local and which is remote.
>  * Document your system. Make the dependencies between components clear.
>  * Handle error cases. How should the client react when the RPC server is
>    down for a long time?
>
> When in doubt avoid RPC. If you can, you should use an asynchronous
> pipeline - instead of RPC-like blocking, results are asynchronously
> pushed to a next computation stage.


### Callback queue

In general doing RPC over RabbitMQ is easy. A client sends a request
message and a server replies with a response message. In order to
receive a response we need to send a 'callback' queue address with the
request:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/RPCClient/RPCClient.cs#L60-L74
```

> #### Message properties
>
> The AMQP 0-9-1 protocol predefines a set of 14 properties that go with
> a message. Most of the properties are rarely used, with the exception of
> the following:
>
> * `Persistent`: Marks a message as persistent (with a value of `true`)
>    or transient (any other value). Take a look at [the second tutorial](./tutorial-two-dotnet).
> * `DeliveryMode`: those familiar with the protocol may choose to use this
>    property instead of `Persistent`. They control the same thing.
> * `ContentType`: Used to describe the mime-type of the encoding.
>    For example for the often used JSON encoding it is a good practice
>    to set this property to: `application/json`.
> * `ReplyTo`: Commonly used to name a callback queue.
> * `CorrelationId`: Useful to correlate RPC responses with requests.


### Correlation Id

Creating a callback queue for every RPC request is inefficient.
A better way is creating a single callback queue per client.

That raises a new issue, having received a response in that queue it's
not clear to which request the response belongs. That's when the
`CorrelationId` property is used. We're going to set it to a unique
value for every request. Later, when we receive a message in the
callback queue we'll look at this property, and based on that we'll be
able to match a response with a request. If we see an unknown
`CorrelationId` value, we may safely discard the message - it
doesn't belong to our requests.

You may ask, why should we ignore unknown messages in the callback
queue, rather than failing with an error? It's due to a possibility of
a race condition on the server side. Although unlikely, it is possible
that the RPC server will die just after sending us the answer, but
before sending an acknowledgment message for the request. If that
happens, the restarted RPC server will process the request again.
That's why on the client we must handle the duplicate responses
gracefully, and the RPC should ideally be idempotent.

### Summary

<T6DiagramFull/>

Our RPC will work like this:

  * When the Client starts up, it creates an exclusive
    callback queue.
  * For an RPC request, the Client sends a message with two properties:
    `ReplyTo`, which is set to the callback queue and `CorrelationId`,
    which is set to a unique value for every request.
  * The request is sent to an `rpc_queue` queue.
  * The RPC worker (aka: server) is waiting for requests on that queue.
    When a request appears, it does the job and sends a message with the
    result back to the Client, using the queue from the `ReplyTo` property.
  * The client waits for data on the callback queue. When a message
    appears, it checks the `CorrelationId` property. If it matches
    the value from the request it returns the response to the
    application.

Putting it all together
-----------------------

The Fibonacci task:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/RPCServer/RPCServer.cs#L59-L68
```

We declare our fibonacci function. It assumes only valid positive integer
input. (Don't expect this one to work for big numbers, and it's probably the
slowest recursive implementation possible).


The code for our RPC server looks like this:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/RPCServer/RPCServer.cs
```

The server code is rather straightforward:

  * As usual we start by establishing the connection, channel and declaring
    the queue.
  * We might want to run more than one server process. In order
    to spread the load equally over multiple servers we need to set the
    `prefetchCount` setting in `channel.BasicQosAsync`.
  * We use `BasicConsumeAsync` to access the queue. Then we register a delivery handler in which
    we do the work and send the response back.


The code for our RPC client:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/RPCClient/RPCClient.cs
```

The client code is slightly more involved:

  * We establish a connection and channel and declare an
    exclusive 'callback' queue for replies.
  * We subscribe to the 'callback' queue, so that
    we can receive RPC responses.
  * Our `CallAsync` method makes the actual RPC request.
  * Here, we first generate a unique `CorrelationId`
    number and save it to identify the appropriate response when it arrives.
  * Next, we publish the request message, with two properties:
    `ReplyTo` and `CorrelationId`.
  * At this point we can sit back and wait until the proper
    response arrives.
  * For every response message the client checks if the `CorrelationId`
    is the one we're looking for. If so, it saves the response.
  * Finally we return the response back to the user.

Making the Client request:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/RPCClient/RPCClient.cs#L112-L120
```

Set up as usual (see [tutorial one](./tutorial-one-dotnet)):

Our RPC service is now ready. We can start the server:

```bash
cd RPCServer
dotnet run
# => [x] Awaiting RPC requests
```

To request a fibonacci number run the client:

```bash
cd RPCClient
dotnet run
# => [x] Requesting fib(30)
```

The design presented here is not the only possible implementation of a RPC
service, but it has some important advantages:

 * If the RPC server is too slow, you can scale up by just running
   another one. Try running a second `RPCServer` in a new console.
 * On the client side, the RPC requires sending and
   receiving only one message. No synchronous calls like `QueueDeclareAsync`
   are required. As a result the RPC client needs only one network
   round trip for a single RPC request.

Our code is still pretty simplistic and doesn't try to solve more
complex (but important) problems, like:

 * How should the client react if there are no servers running?
 * Should a client have some kind of timeout for the RPC?
 * If the server malfunctions and raises an exception, should it be
   forwarded to the client?
 * Protecting against invalid incoming messages
   (eg checking bounds, type) before processing.


If you want to experiment, you may find the [management UI](/docs/management) useful for viewing the queues.
