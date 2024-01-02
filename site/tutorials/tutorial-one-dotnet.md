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
# RabbitMQ tutorial - "Hello World!" SUPPRESS-RHS

## Introduction

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>
<xi:include href="site/tutorials/tutorials-intro.xml.inc"/>

## "Hello World"
### (using the .NET/C# Client)

In this part of the tutorial we'll write two programs in C#; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the .NET client API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="../img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60"/>
</div>

> #### The .NET client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for RabbitMQ in [many different
> languages](http://rabbitmq.com/devtools.html). We'll
> use the .NET client provided by RabbitMQ.
>
> The client supports [.NET Core](https://www.microsoft.com/net/core) as
> well as .NET Framework 4.5.1+. This tutorial will use RabbitMQ .NET client 5.0 and
> .NET Core so you will ensure
> you have it [installed](https://www.microsoft.com/net/core) and in your PATH.
>
> You can also use the .NET Framework to complete this tutorial however the
> setup steps will be different.
>
> RabbitMQ .NET client 5.0 and later versions are distributed via [nuget](https://www.nuget.org/packages/RabbitMQ.Client).
>
> This tutorial assumes you are using powershell on Windows. On MacOS and Linux nearly
> any shell will work.

### Setup

First let's verify that you have .NET Core toolchain in `PATH`:

<pre class="lang-powershell">
dotnet --help
</pre>

should produce a help message.

Now let's generate two projects, one for the publisher and one for the consumer:

<pre class="lang-powershell">
dotnet new console --name Send
mv Send/Program.cs Send/Send.cs
dotnet new console --name Receive
mv Receive/Program.cs Receive/Receive.cs
</pre>

This will create two new directories named `Send` and `Receive`.

Then we add the client dependency.

<pre class="lang-powershell">
cd Send
dotnet add package RabbitMQ.Client
cd ../Receive
dotnet add package RabbitMQ.Client
</pre>

Now we have the .NET project set up we can write some code.

### Sending

<div class="diagram">
  <img src="../img/tutorials/sending.png" alt="(P) -> [|||]" height="100"/>
</div>

We'll call our message publisher (sender) `Send.cs` and our message consumer (receiver)
`Receive.cs`.  The publisher will connect to RabbitMQ, send a single message,
then exit.

In
[`Send.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/Send/Send.cs),
we need to use some namespaces:

<pre class="lang-csharp">
using System.Text;
using RabbitMQ.Client;
</pre>

then we can create a connection to the server:

<pre class="lang-csharp">
var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();
...
</pre>

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine we'd simply specify its hostname or IP address here.

Next we create a channel, which is where most of the API for getting
things done resides.

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

<pre class="lang-csharp">
using System.Text;
using RabbitMQ.Client;

var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

channel.QueueDeclare(queue: "hello",
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);

const string message = "Hello World!";
var body = Encoding.UTF8.GetBytes(message);

channel.BasicPublish(exchange: string.Empty,
                     routingKey: "hello",
                     basicProperties: null,
                     body: body);
Console.WriteLine($" [x] Sent {message}");

Console.WriteLine(" Press [enter] to exit.");
Console.ReadLine();
</pre>

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

When the code above finishes running, the channel and the connection
will be disposed. That's it for our publisher.

[Here's the whole Send.cs
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/Send/Send.cs).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The <a
> href="https://www.rabbitmq.com/configure.html#config-items">configuration
> file documentation</a> will show you how to set <code>disk_free_limit</code>.


### Receiving

As for the consumer, it is listening for messages from
RabbitMQ. So unlike the publisher which publishes a single message, we'll
keep the consumer running continuously to listen for messages and print them out.

<div class="diagram">
  <img src="../img/tutorials/receiving.png" alt="[|||] -> (C)" height="100"/>
</div>

The code (in [`Receive.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/Receive/Receive.cs)) has almost the same `using` statements as `Send`:

<pre class="lang-csharp">
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
</pre>

Setting up is the same as the publisher; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `Send` publishes to.

<pre class="lang-csharp">
var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

channel.QueueDeclare(queue: "hello",
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);
...
</pre>

Note that we declare the queue here as well. Because we might start
the consumer before the publisher, we want to make sure the queue exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
queue. Since it will push us messages asynchronously, we provide a
callback. That is what `EventingBasicConsumer.Received` event handler
does.

<pre class="lang-csharp">
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

var factory = new ConnectionFactory { HostName = "localhost" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

channel.QueueDeclare(queue: "hello",
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);

Console.WriteLine(" [*] Waiting for messages.");

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (model, ea) =>
{
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    Console.WriteLine($" [x] Received {message}");
};
channel.BasicConsume(queue: "hello",
                     autoAck: true,
                     consumer: consumer);

Console.WriteLine(" Press [enter] to exit.");
Console.ReadLine();
</pre>

[Here's the whole Receive.cs
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/Receive/Receive.cs).

### Putting It All Together

Open two terminals.

You can run the clients in any order, as both declares the queue. We will run the consumer first so you can see it waiting for and then receiving the message:

<pre class="lang-powershell">
cd Receive
dotnet run
</pre>

Then run the producer:

<pre class="lang-powershell">
cd Send
dotnet run
</pre>

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages, so try restarting
the publisher several times.

Time to move on to [part 2](tutorial-two-dotnet.html) and build a simple _work queue_.
