---
title: .NET/C# Client API Guide
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


# .NET/C# Client API Guide


## Overview {#overview}

This guide covers [RabbitMQ .NET/C# client](./dotnet) version 7.0 and its public API.
It assumes that the [most recent major version of the client](https://www.nuget.org/packages/RabbitMQ.Client) is used
and the reader is familiar with [the basics](/tutorials).

Key sections of the guide are:

* [.NET version requirements](#dotnet-versions)
* [Important interfaces and classes](#major-api-elements) in the public API
* [Limitations](#limitations)
* [Connecting to RabbitMQ](#connecting)
* [Connection and Channel Lifespan](#connection-and-channel-lifespan)
* [Client-provided connection name](#client-provided-names)
* [Using Exchanges and Queues](#exchanges-and-queues)
* [Publishing Messages](#publishing)
* [Consuming Using a Subscription](#consuming) and [Consumer Memory Safety](#consuming-memory-safety)
* [Concurrency Considerations and Safety](#concurrency)
* [Automatic Recovery From Network Failures](#recovery)
* [OAuth 2 Support](#oauth2-support)

An [API reference](https://rabbitmq.github.io/rabbitmq-dotnet-client/api/RabbitMQ.Client.html) is available separately.


## .NET Version Requirements {#dotnet-versions}

7.0.x and 6.8.x release series of this library [require .NET 4.6.1+ or a .NET Standard 2.0+ implementation](./dotnet#overview).


## License {#license}

The library is open source, developed [on GitHub](https://github.com/rabbitmq/rabbitmq-dotnet-client/), and is double-licensed under the

* [Apache Public License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)
* [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/)

This means that the user can consider the library to be licensed under any of the licenses from the list above.
For example, the user may choose the Apache Public License 2.0 and include this client into
a commercial product.


## Major namespaces, interfaces and classes {#major-api-elements}

The client API is closely modelled on the [AMQP 0-9-1 protocol model](/tutorials/amqp-concepts),
with additional abstractions for ease of use.

An [API reference](https://rabbitmq.github.io/rabbitmq-dotnet-client/) is available separately.

The core API interfaces and classes are defined in the `RabbitMQ.Client` namespace:

```csharp
using RabbitMQ.Client;
```

The core API interfaces and classes are

* `IChannel`: represents an AMQP 0-9-1 channel, and provides most of the operations (protocol methods)
* `IConnection`: represents an AMQP 0-9-1 connection
* `ConnectionFactory`: constructs `IConnection` instances
* `IAsyncBasicConsumer`: represents a message consumer

Other useful interfaces and classes include:

* `AsyncDefaultBasicConsumer`: commonly used base class for consumers

Public namespaces other than `RabbitMQ.Client` include:

* `RabbitMQ.Client.Events`: various events and event handlers
  that are part of the client library, including `AsyncEventingBasicConsumer`,
  a consumer implementation built around C# event handlers.
* `RabbitMQ.Client.Exceptions`: exceptions visible to the user.

All other namespaces are reserved for private implementation detail of
the library, although members of private namespaces are usually made
available to applications using the library in order to permit
developers to implement workarounds for faults and gaps they
discover in the library implementation. Applications cannot rely on
any classes, interfaces, member variables etc. that appear within
private namespaces remaining stable across releases of the library.


## Limitations {#limitations}

This client does not support unsigned 64-bit integers, represented in
type `ulong`. Attempting to encode `ulong` values will throw an exception.
Note that signed 64-bit integers are supported.

This is in part due to type marker [ambiguity in the AMQP 0-9-1 spec](/amqp-0-9-1-errata#section_3),
and in part due to [the list of types supported by other popular clients](https://github.com/rabbitmq/rabbitmq-dotnet-client/pull/1299#issuecomment-1433342924).


## Connecting to RabbitMQ {#connecting}

Before an application can use RabbitMQ, it has to open a [connection](/docs/connections)
to a RabbitMQ node. The connection then will be used to perform all subsequent
operations. Connections are **meant to be long-lived**. Opening a connection
for every operation (e.g. publishing a message) would be very inefficient and is
**highly discouraged**.

To open a connection with the .NET client, first instantiate a `ConnectionFactory`
and configure it to use desired hostname, virtual host, credentials, [TLS settings](/docs/ssl),
and any other parameters as needed.

Then await the `ConnectionFactory.CreateConnectionAsync()` method to open a connection.
Successful and unsuccessful client connection events can be [observed in server logs](/docs/networking#logging).

The following two code snippets connect to a RabbitMQ node using a hostname configured
using the `hostName` property:

```csharp
ConnectionFactory factory = new ConnectionFactory();
// "guest"/"guest" by default, limited to localhost connections
factory.UserName = user;
factory.Password = pass;
factory.VirtualHost = vhost;
factory.HostName = hostName;

IConnection conn = await factory.CreateConnectionAsync();
```

```csharp
ConnectionFactory factory = new ConnectionFactory();
factory.Uri = new Uri("amqp://user:pass@hostName:port/vhost");

IConnection conn = await factory.CreateConnectionAsync();
```


### Using Lists of Endpoints {#endpoints-list}

It is possible to specify a list of endpoints to use when connecting. The first
reachable endpoint will be used. In case of [connection failures](#recovery), using
a list of endpoints makes it possible for the application to connect to a different
node if the original one is down.

To use multiple endpoints, provide a list of `AmqpTcpEndpoint`s to `ConnectionFactory#CreateConnection`.
An `AmqpTcpEndpoint` represents a hostname and port pair.

```csharp
ConnectionFactory factory = new ConnectionFactory();
factory.UserName = "username";
factory.Password = "s3Kre7";

var endpoints = new System.Collections.Generic.List<AmqpTcpEndpoint> {
  new AmqpTcpEndpoint("hostname"),
  new AmqpTcpEndpoint("localhost")
};
IConnection conn = await factory.CreateConnectionAsync(endpoints);
```


<a id="connecting-uri"></a>

Since the .NET client uses a stricter interpretation of the [AMQP 0-9-1 URI spec](/docs/uri-spec)
than the other clients, care must be taken when using URIs.
In particular, the host part must not be omitted and virtual hosts with
empty names are not addressable.

All factory properties have default values. The default value for a property will be used if the property
remains unassigned prior to creating a connection:

<table>
  <thead>
    <tr>
      <td>Property</td>
      <td>Default Value</td>
    </tr>
  </thead>

  <tr>
    <td>Username</td>
    <td><code>"guest"</code></td>
  </tr>

  <tr>
    <td>Password</td>
    <td><code>"guest"</code></td>
  </tr>

  <tr>
    <td>Virtual host</td>
    <td><code>"/"</code></td>
  </tr>

  <tr>
    <td>Hostname</td>
    <td><code>"localhost"</code></td>
  </tr>

  <tr>
    <td>Port</td>

    <td>
      <code>5672</code> for regular ("plain TCP") connections,
      <code>5671</code> for <a href="/docs/ssl">connections with TLS enabled</a>
    </td>
  </tr>
</table>

Note that [user guest can only connect from localhost](/docs/access-control) by default.
This is to limit well-known credential use in production systems.

The `IConnection` interface can then be used to open a [channel](/docs/channels):

```csharp
IChannel channel = await conn.CreateChannelAsync();
```

The channel can now be used to send and receive messages,
as described in subsequent sections.

Just like connections, channels are **meant to be long-lived**. Opening a new channel
for every operation would be highly inefficient and is **highly discouraged**. Channels,
however, can have a shorter life span than connections. For example, certain
protocol errors will automatically close channels. If applications can recover
from them, they can open a new channel and retry the operation.

This is covered in more detail in the [Channel guide](/docs/channels) as well as other
guides such as [Consumer Acknowledgements](/docs/confirms).


## Disconnecting from RabbitMQ {#disconnecting}

To disconnect, simply close the channel and the connection:

```csharp
await channel.CloseAsync();
await conn.CloseAsync();
await channel.DisposeAsync();
await conn.DisposeAsync();
```

While disposing channel and connection objects is sufficient, the best practice
is that they be explicitly closed first.

Client disconnection events can be [observed in server node logs](/docs/networking#logging).


## Connection and Channel Lifespan {#connection-and-channel-lifespan}

Connections are meant to be long-lived. The underlying protocol is designed and optimized for
long running connections. That means that opening a new connection per operation,
e.g. a message published, is unnecessary and strongly discouraged as it will introduce a lot of
network roundtrips and overhead.

Channels are also meant to be long-lived but since many recoverable protocol errors will
result in channel closure, channel lifespan could be shorter than that of its connection.
Closing and opening new channels per operation is usually unnecessary but can be
appropriate. When in doubt, consider reusing channels first.

Channel-level exceptions such as attempts to consume from a
queue that does not exist will result in channel closure. A closed channel can no
longer be used and will not receive any more events from the server (such
as message deliveries). Channel-level exceptions will be logged by RabbitMQ
and will initiate a shutdown sequence for the channel (see below).


## Client-Provided Connection Name {#client-provided-names}

RabbitMQ nodes have a limited amount of information about their clients:

 * their TCP endpoint (source IP address and port)
 * the credentials used

This information alone can make identifying applications and instances problematic, in particular when credentials can be
shared and clients connect over a load balancer but [Proxy protocol](/docs/networking#proxy-protocol) cannot be enabled.

To make it easier to identify clients in [server logs](/docs/logging) and [management UI](/docs/management),
AMQP 0-9-1 client connections, including the RabbitMQ .NET client, can provide a custom identifier.
If set, the identifier will be mentioned in log entries and management UI. The identifier is known as
the **client-provided connection name**. The name can be used to identify an application or a specific component
within an application. The name is optional; however, developers are strongly encouraged to provide one
as it would significantly simplify certain operational tasks.

RabbitMQ .NET client provides a connection factory property,
[`ConnectionFactory.ClientProvidedName`](https://rabbitmq.github.io/rabbitmq-dotnet-client/api/RabbitMQ.Client.ConnectionFactory.html#RabbitMQ_Client_ConnectionFactory_ClientProvidedName),
which, if set, controls the client-provided connection name for all new connections opened
by this factory.

Here's a modified connection example used above which provides such a name:

```csharp
ConnectionFactory factory = new ConnectionFactory();
// "guest"/"guest" by default, limited to localhost connections
factory.UserName = user;
factory.Password = pass;
factory.VirtualHost = vhost;
factory.HostName = hostName;

// this name will be shared by all connections instantiated by
// this factory
factory.ClientProvidedName = "app:audit component:event-consumer";

IConnection conn = await factory.CreateConnectionAsync();
```


## Using Exchanges and Queues {#exchanges-and-queues}

Client applications work with exchanges and [queues](/docs/queues),
the high-level [building blocks of the protocol](/tutorials/amqp-concepts).
These must be "declared" before they can be
used. Declaring either type of object simply ensures that one of that
name exists, creating it if necessary.

Continuing the previous example, the following code declares an
exchange and a queue, then binds them together.

```csharp
await channel.ExchangeDeclareAsync(exchangeName, ExchangeType.Direct);
await channel.QueueDeclareAsync(queueName, false, false, false, null);
await channel.QueueBindAsync(queueName, exchangeName, routingKey, null);
```

This will actively declare the following objects:

* a non-durable, non-autodelete exchange of "direct" type
* a non-durable, non-autodelete, non-exclusive queue

The exchange can be customised by using additional parameters.
The above code then binds the queue to the exchange with the given
routing key.

Many channel API (`IChannel`) methods are overloaded. The convenient
short form of `ExchangeDeclare` uses sensible defaults. There are
also longer forms with more parameters, to let you override these
defaults as necessary, giving full control where needed.

This "short version, long version" pattern is used throughout the API.


### Passive Declaration {#passive-declaration}

Queues and exchanges can be declared "passively". A passive declare simply checks that the entity
with the provided name exists. If it does, the operation is a no-op. For queues successful
passive declares will return the same information as non-passive ones, namely the number of
consumers and messages in [ready state](/docs/confirms) in the queue.

If the entity does not exist, the operation fails with a channel level exception. The channel
cannot be used after that. A new channel should be opened. It is common to use one-off (temporary)
channels for passive declarations.

`IChannel#QueueDeclarePassiveAsync` and `IChannel#ExchangeDeclarePassiveAsync` are the
methods used for passive declaration. The following example demonstrates `IChannel#QueueDeclarePassive`:

```csharp
var response = await channel.QueueDeclarePassiveAsync("queue-name");
// returns the number of messages in Ready state in the queue
response.MessageCount;
// returns the number of consumers the queue has
response.ConsumerCount;
```

`IChannel#ExchangeDeclarePassiveAsync`'s return value contains no useful information. Therefore
if the method returns and no channel exceptions occurs, it means that the exchange does exist.


### Operations with Optional Responses {#nowait-methods}

Some common operations also have a "no wait" version which won't wait for server
response. For example, to declare a queue and instruct the server to not send any
response, use

```csharp
await channel.QueueDeclareAsync(queueName, true, false, false, null, noWait: true);
```

The "no wait" versions are more efficient but offer lower safety guarantees, e.g. they
are more dependent on the [heartbeat mechanism](/docs/heartbeats) for detection of failed operations.
When in doubt, start with the standard version. The "no wait" versions are only needed in scenarios
with high topology (queue, binding) churn.


### Deleting Entities and Purging Messages {#deleting-entities}

A queue or exchange can be explicitly deleted:

```csharp
await channel.QueueDeleteAsync("queue-name", false, false);
```

It is possible to delete a queue only if it is empty:

```csharp
await channel.QueueDeleteAsync("queue-name", false, true);
```

or if it is not used (does not have any consumers):

```csharp
await channel.QueueDeleteAsync("queue-name", true, false);
```

A queue can be purged (all of its messages deleted):

```csharp
await channel.QueuePurgeAsync("queue-name");
```


## Publishing Messages {#publishing}

To publish a message to an exchange, use <code>IChannel.BasicPublishAsync</code> as
follows:

```csharp
byte[] messageBodyBytes = System.Text.Encoding.UTF8.GetBytes("Hello, world!");
await channel.BasicPublishAsync(exchangeName, routingKey, false, null, messageBodyBytes);
```

For fine control, you can use overloaded variants to specify the
mandatory flag, or specify messages properties:

```csharp
byte[] messageBodyBytes = System.Text.Encoding.UTF8.GetBytes("Hello, world!");
var props = new BasicProperties();
props.ContentType = "text/plain";
props.DeliveryMode = 2;
await channel.BasicPublishAsync(exchangeName, routingKey,
    mandatory: true, basicProperties: props, body: messageBodyBytes);
```

This sends a mandatory:true message with delivery mode 2 (persistent) and
content-type "text/plain". See the definition of the `IBasicProperties`
interface for more information about the available message properties.

In the following example, we publish a message with custom headers:

```csharp
byte[] messageBodyBytes = System.Text.Encoding.UTF8.GetBytes("Hello, world!");

var props = new BasicProperties();
props.ContentType = "text/plain";
props.DeliveryMode = 2;
props.Headers = new Dictionary<string, object>();
props.Headers.Add("latitude",  51.5252949);
props.Headers.Add("longitude", -0.0905493);

await channel.BasicPublishAsync(exchangeName, routingKey, true, props, messageBodyBytes);
```

Code sample below sets a message expiration:

```csharp
byte[] messageBodyBytes = System.Text.Encoding.UTF8.GetBytes("Hello, world!");

var props = new BasicProperties();
props.ContentType = "text/plain";
props.DeliveryMode = 2;
props.Expiration = "36000000";

await channel.BasicPublishAsync(exchangeName, routingKey, true, props, messageBodyBytes);
```


## Retrieving Messages By Subscription ("push API") {#consuming}

The recommended and most convenient way to receive messages is to set up a
subscription using the `IAsyncBasicConsumer` interface. The messages will then
be delivered automatically as they arrive, rather than having to be requested
proactively.

One way to implement a consumer is to use the convenience class
`AsyncEventingBasicConsumer`, which dispatches deliveries and other consumer
lifecycle events as C# events:

```csharp
var consumer = new EventingBasicConsumer(channel);
consumer.Received += async (ch, ea) =>
                {
                    var body = ea.Body.ToArray();
                    // copy or deserialise the payload
                    // and process the message
                    // ...
                    await channel.BasicAckAsync(ea.DeliveryTag, false);
                };
// this consumer tag identifies the subscription
// when it has to be cancelled
string consumerTag = await channel.BasicConsumeAsync(queueName, false, consumer);
```

Another option is to subclass `AsyncDefaultBasicConsumer`, overriding methods
as necessary, or implement `IAsyncBasicConsumer` directly. You will generally
want to implement the core method
<code>IAsyncBasicConsumer.HandleBasicDeliverAsync</code>.

More sophisticated consumers will need to implement further methods. In
particular, `HandleChannelShutdown` traps channel/connection closure. Consumers
can also implement ` HandleBasicCancelOk` to be notified of cancellations.

The `ConsumerTag` property of `AsyncDefaultBasicConsumer` can be used to
retrieve the server-generated consumer tag, in cases where none was supplied to
the original <code>IChannel.BasicConsumeAsync</code> call.

You can cancel an active consumer with <code>IChannel.BasicCancelAsync</code>:

```csharp
await channel.BasicCancelAsync(consumerTag);
```

When calling the API methods, you always refer to consumers by their
consumer tags, which can be either client- or server-generated as
explained in the [AMQP 0-9-1 specification](/docs/specification) document.


## Consumer Memory Safety Requirements {#consuming-memory-safety}

As of [version 7.0](https://github.com/rabbitmq/rabbitmq-dotnet-client/blob/main/CHANGELOG.md)
of the .NET client, message payloads are represented using the
[`System.ReadOnlyMemory<byte>`](https://learn.microsoft.com/en-us/dotnet/api/system.readonlymemory-1?view=netstandard-2.0)
type from the [`System.Memory` library](https://www.nuget.org/packages/System.Memory/).

The `RabbitMQ.Client` library places certain restrictions on when a read only
memory span can be accessed by applications.

**Important**: consumer interface implementations **must deserialize or copy
delivery payload before delivery handler method returns**. Retaining a
reference to the payload is not safe: the memory allocated for it can be
deallocated at any moment after the handler returns.


## Fetching Individual Messages (Polling or "pull API") {#basic-get}

It is also possible to retrieve individual messages on demand ("pull API" a.k.a. polling).
This approach to consumption is **very inefficient** as it is effectively polling
and applications repeatedly have to ask for results even if the vast majority of the requests
yield no results. Therefore using this approach **is highly discouraged**.

To "pull" a message, use the `IChannel.BasicGetAsync` method.
The returned value is an instance of `BasicGetResult`, from which the header
information (properties) and message body can be extracted:

```csharp
bool autoAck = false;
BasicGetResult result = await channel.BasicGetAsync(queueName, autoAck);
if (result == null) {
    // No message available at this time.
} else {
    var props = result.BasicProperties;
    ReadOnlyMemory<byte> body = result.Body;
    ...
```

The above example uses [manual acknowledgements](/docs/confirms) (`autoAck = false`), so the application must also call
`IChannel.BasicAckAsync` to acknowledge the delivery after processing:

```csharp
    ...
    // acknowledge receipt of the message
    await channel.BasicAckAsync(result.DeliveryTag, false);
}
```

  Note that fetching messages using this API is relatively inefficient. If you'd prefer
  RabbitMQ to push messages to the client, see the next section.


## Concurrency Considerations for Consumers {#concurrency}

There is a number of concurrency-related topics for a library user to consider.


### Sharing Channels Between Threads {#concurrency-channel-sharing}

`IChannel` instance usage by more than one thread simultaneously should be
avoided. Application code should maintain a clear notion of thread ownership
for `IChannel` instances.

This is a **hard requirement for publishers**: sharing a channel (an `IChannel`
instance) for concurrent publishing will lead to incorrect frame interleaving
at the protocol level. Channel instances **must not be shared** by threads that
publish on them.

If more than one thread needs to access a particular `IChannel` instances, the
application should enforce mutual exclusion. One way of achieving this is for
all users of an `IChannel` to `lock` the instance itself:

```csharp
IChannel ch = RetrieveSomeSharedIChannelInstance();
await _channelSemaphore.WaitAsync();
try
{
  ch.BasicPublishAsync(...);
}
finally
{
  _channelSemaphore.Release();
}
```

Symptoms of incorrect serialisation of `IChannel` operations include, but are
not limited to:

 * [connection-level exceptions](/docs/connections#error-handling) due to invalid frame
   interleaving on the wire. RabbitMQ [server logs](/docs/logging) will
   contain unexpected frame errors in such scenario.
 * Pipelining and continuation exceptions thrown by the client

Consumption that involve sharing a channel between threads should be avoided
when possible but can be done safely.

Consumers that can be multi-threaded or use a thread pool internally, including TPL-based
consumers, must use mutual exclusion of [acknowledgements](/docs/confirms) operations
on a shared channel.


### Per-Connection Task Use {#concurrency-thread-usage}

Each `IConnection` instance is, in the current implementation, backed by a
single `Task` that reads from the socket and dispatches the resulting events to
the application. If heartbeats are enabled, they will use a pair of .NET timers
per connection.

Usually, therefore, there will be at least two `Task` instances active in an
application using this library:

<dl>
  <dt>the application thread ("main" `Task`)</dt>
  <dd>
    contains the application logic, and makes
    calls on <code>IChannel</code> methods to perform protocol operations.
  </dd>

  <dt>the I/O activity `Task` instances</dt>
  <dd>
    hidden away and completely managed by the
    <code>IConnection</code> instance.
  </dd>
</dl>

The one place where the nature of the threading model is visible to
the application is in any callback the application registers with the
library. Such callbacks include:

* any `IAsyncBasicConsumer` method
* the `BasicReturn` event on `IChannel`
* any of the various shutdown events on `IConnection`, `IChannel` etc.


### Consumer Callbacks, Concurrency and Operation Ordering {#consumer-callbacks-and-ordering}

#### Is Consumer Operation Dispatch Concurrent?

`IAsyncBasicConsumer` callbacks are invoked sequantially (with a concurrency
degree of one) by default.

For concurrent dispatch of inbound consumer deliveries, set [`ConnectionFactory.ConsumerDispatchConcurrency`](https://rabbitmq.github.io/rabbitmq-dotnet-client/api/RabbitMQ.Client.ConnectionFactory.html#RabbitMQ_Client_ConnectionFactory_ConsumerDispatchConcurrency)
to a value greater than one.

#### Message Ordering Guarantee

Consumer events on the same channel are guaranteed to be dispatched in the same
order they were received in.

For example, if messages A and B were delivered in this order on the same
channel, they will be dispatched to a consumer (a specific `IAsyncBasicConsumer`
instance) in this order.

If messages A and B were delivered on different channels, they can be
dispatched to consumers in any order (or in parallel).

With the concurrency degree of one, deliveries on the same channel will be
handled sequentially. With a higher concurrency degree, their dispatch will
happen in the same order but actual processing can happen in parallel
(depending on the number of available cores and application runtime), which can
result in concurrency hazards.

#### Acknowledgement of Multiple Deliveries at Once

Consumers can [acknowledge](/docs/confirms) multiple deliveries at a time. When
consumer dispatch concurrency degree is higher than one, this can result in a
[double acknowledgement](/docs/confirms#consumer-acks-double-acking), which is
considered to be [an error in the protocol](/docs/channels#error-handling).

Therefore, with concurrent consumer dispatch, consumers should acknowledge only
one delivery at a time.


#### Consumers and Operations on the Same Channel

Consumer event handlers can invoke operations on the same channel (such as
`IChannel.QueueDeclareAsync` or `IChannel.BasicCancelAsync`) without
deadlocking.


## Handling Unroutable Messages {#basic-return}

If a message is published with the "mandatory" flag
set, but cannot be delivered, the broker will return it to the sending
client (via a <code>basic.return</code> AMQP 0-9-1 command).

To be notified of such returns, clients can subscribe to the
<code>IChannel.BasicReturn</code> event. If there are no listeners attached to the
event, then returned messages will be silently dropped.

```csharp
channel.BasicReturn += (sender, ea) => {
    ...
};
```

The `BasicReturn` event will fire, for example, if the client
publishes a message with the "mandatory" flag set to an exchange of
"direct" type which is not bound to a queue.


## Automatic Recovery From Network Failures {#recovery}


### Connection Recovery {#connection-recovery}

Network connection between clients and RabbitMQ nodes can fail.
RabbitMQ .NET/C# client supports automatic recovery of connections
and topology (queues, exchanges, bindings, and consumers). The feature
has certain limitations covered later in this guide.

The automatic recovery process performs the following steps:

* Reconnect
* Restore connection listeners
* Re-open channels
* Restore channel listeners
* Restore channel <code>basic.qos</code> setting, publisher confirms and transaction settings

Topology recovery starts after the above actions are completed. The following
steps are performed for every channel known to being open at the time of
connection failure:

  * Re-declare exchanges (except for predefined ones)
  * Re-declare queues
  * Recover all bindings
  * Recover all consumers

To enable automatic connection recovery, set
<code>ConnectionFactory.AutomaticRecoveryEnabled</code> to true:

```csharp
ConnectionFactory factory = new ConnectionFactory();
factory.AutomaticRecoveryEnabled = true;
// connection that will recover automatically
IConnection conn = await factory.CreateConnectionAsync();
```

If recovery fails due to an exception (e.g. RabbitMQ node is still not
reachable), it will be retried after a fixed time interval (default is 5
seconds). The interval can be configured:

```csharp
ConnectionFactory factory = new ConnectionFactory();
// attempt recovery every 10 seconds
factory.NetworkRecoveryInterval = TimeSpan.FromSeconds(10);
```


### When Will Connection Recovery Be Triggered? {#recovery-triggers}

Automatic connection recovery, if enabled, will be triggered by the following events:

* An I/O exception is thrown in connection's I/O loop
* A socket read operation times out
* Missed server [heartbeats](/docs/heartbeats) are detected
* Any other unexpected exception is thrown in connection's I/O loop

whichever happens first.

If initial client connection to a RabbitMQ node fails, automatic connection
recovery won't kick in. Applications developers are responsible for retrying
such connections, logging failed attempts, implementing a limit to the number
of retries and so on. Here's a very basic example:

```csharp
ConnectionFactory factory = new ConnectionFactory();
// configure various connection settings

try {
  IConnection conn = await factory.CreateConnectionAsync();
} catch (RabbitMQ.Client.Exceptions.BrokerUnreachableException e) {
  await Task.Delay(5000);
  // apply retry logic
}
```

When a connection is closed by the application via the <code>Connection.CloseAsync</code> method,
connection recovery will not be initiated.

Channel-level exceptions will not trigger any kind of recovery as they usually
indicate a semantic issue in the application (e.g. an attempt to consume from a
non-existent queue).


### Effects on Publishing {#publishers}

Messages that are published using <code>IChannel.BasicPublishAsync</code> when connection is down
will be lost. The client does not enqueue them for delivery after connection has recovered.
To ensure that published messages reach RabbitMQ applications need to use [Publisher Confirms](/docs/confirms)
and account for connection failures.


### Topology Recovery {#topology-recovery}

Topology recovery involves recovery of exchanges, queues, bindings
and consumers. It is enabled by default but can be disabled:

```csharp
ConnectionFactory factory = new ConnectionFactory();
factory.AutomaticRecoveryEnabled = true;
factory.TopologyRecoveryEnabled  = false;

IConnection conn = await factory.CreateConnectionAsync();
```


### Failure Detection and Recovery Limitations {#automatic-recovery-limitations}

Automatic connection recovery has a number of limitations and intentional
design decisions that applications developers need to be aware of.

When a connection is down or lost, it [takes time to detect](/docs/heartbeats).
Therefore there is a window of time in which both the library and the
application are unaware of effective connection failure. Any messages
published during this time frame are serialised and written to the TCP socket
as usual. Their delivery to the broker can only be guaranteed via [publisher
confirms](/docs/confirms): publishing in AMQP 0-9-1 is entirely asynchronous by
design.

When a socket or I/O operation error is detected by a connection with automatic
recovery enabled, recovery begins after a configurable delay, 5 seconds by
default. This design assumes that even though a lot of network failures are
transient and generally short lived, they do not go away in an instant.
Connection recovery attempts will continue at identical time intervals until a
new connection is successfully opened.

When a connection is in the recovering state, any publishes attempted on its
channels will be rejected with an exception. The client currently does not
perform any internal buffering of such outgoing messages. It is an application
developer's responsibility to keep track of such messages and republish them
when recovery succeeds. [Publisher confirms](/docs/confirms) is a protocol
extension that should be used by publishers that cannot afford message loss.

Connection recovery will not kick in when a channel is closed due to a
channel-level exception. Such exceptions often indicate application-level
issues. The library cannot make an informed decision about when that's the
case.

Closed channels won't be recovered even after connection recovery kicks in.
This includes both explicitly closed channels and the channel-level exception
case above.


### Manual Acknowledgements and Automatic Recovery {#basic-ack-and-recovery}

When manual acknowledgements are used, it is possible that network connection
to RabbitMQ node fails between message delivery and acknowledgement. After
connection recovery, RabbitMQ will reset delivery tags on all channels.

This means that <code>basic.ack</code>, <code>basic.nack</code>, and
<code>basic.reject</code> with old delivery tags will cause a channel
exception. To avoid this, RabbitMQ .NET client keeps track of and updates
delivery tags to make them monotonically growing between recoveries.

<code>IChannel.BasicAckAsync</code>, <code>IChannel.BasicNackAsync</code>, and
<code>IChannel.BasicRejectAsync</code> then translate adjusted delivery tags
into those used by RabbitMQ.

Acknowledgements with stale delivery tags will not be sent. Applications that
use manual acknowledgements and automatic recovery must be capable of handling
redeliveries.


## OAuth 2 Support {#oauth2-support}

The client can authenticate against an OAuth 2 server like [UAA](https://github.com/cloudfoundry/uaa).
The [OAuth 2 plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_backend_oauth2)
must be turned on on the server side and configured to use the same OAuth 2
server as the client. This section assumes that the [most recent major version of the OAuth2 client library](https://www.nuget.org/packages/RabbitMQ.Client.OAuth2) is used.

### Getting the OAuth 2 Token {#oauth2-getting-token}

The .NET client provides the `OAuth2ClientCredentialsProvider` class to get a
JWT token using the [OAuth 2 Client Credentials
flow](https://tools.ietf.org/html/rfc6749#section-4.4). The client sends the
access token in the password field when opening a connection. The broker then
verifies the access token signature, validity, and permissions before
authorising the connection and granting access to the requested virtual host.

```csharp
using RabbitMQ.Client.OAuth2;

var tokenEndpointUri = new Uri("http://somedomain.com/token");
var oAuth2Client = new OAuth2ClientBuilder("client_id", "client_secret", tokenEndpointUri).Build();
ICredentialsProvider credentialProvider = new OAuth2ClientCredentialsProvider("prod-uaa-1", oAuth2Client);

var connectionFactory = new ConnectionFactory
{
  CredentialsProvider = credentialsProvider
};
var connection = await connectionFactory.CreateConnectionAsync();
```

In production, ensure you use HTTPS for the token endpoint URI and configure
a `HttpClientHandler` appropriately for the `HttpClient` :

```csharp
HttpClientHandler httpClientHandler = buildHttpClientHandlerWithTLSEnabled();

var tokenEndpointUri = new Uri("https://somedomain.com/token");

var oAuth2ClientBuilder = new OAuth2ClientBuilder("client_id", "client_secret", tokenEndpointUri)
oAuth2ClientBuilder.SetHttpClientHandler(httpClientHandler);
var oAuth2Client = await oAuth2ClientBuilder.BuildAsync();

ICredentialsProvider credentialsProvider = new OAuth2ClientCredentialsProvider("prod-uaa-1", oAuth2Client);

var connectionFactory = new ConnectionFactory
{
  CredentialsProvider = credentialsProvider
};
var connection = await connectionFactory.CreateConnectionAsync();
```

Note: In case your Authorization server requires extra request parameters
beyond what the specification requires, you can add `<key, value>` pairs to a
`Dictionary` and passing it to the `OAuth2ClientCredentialsProvider`
constructor rather than an `EMPTY` one as shown above.


### Refreshing the Token {#oauth2-refreshing-token}

When tokens expire, the broker refuses further operations over the connection.
It is possible to call `ICredentialsProvider#GetCredentialsAsync()` before expiring and
send the new token to the server. This is not convenient for applications so,
the .NET client provides help with the `CredentialsRefresher`.

See the [`TestOAuth2` class](https://github.com/rabbitmq/rabbitmq-dotnet-client/blob/main/projects/Test/OAuth2/TestOAuth2.cs)
for how to use the `CredentialsRefresher` class.

The `CredentialsRefresher` schedules a refresh after 2/3 of the token validity
time. For example, if the token expires in 60 minutes, it is refreshed after 40
minutes.
