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


# .NET/C# Client API Guide


## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers [RabbitMQ .NET/C# client](./dotnet.html) and its public API.
It assumes that the [most recent major version of the client](https://www.nuget.org/packages/RabbitMQ.Client) is used
and the reader is familiar with [the basics](./getstarted.html).

Key sections of the guide are:

* [Dependencies](#dependencies)
* [Important interfaces and classes](#major-api-elements) in the public API
* [Limitations](#limitations)
* [Connecting to RabbitMQ](#connecting)
* [Connection and Channel Lifespan](#connection-and-channel-lifespan)
* [Client-provided connection name](#client-provided-names)
* [Using Exchanges and Queues](#exchanges-and-queues)
* [Publishing Messages](#publishing)
* [Consuming Using a Subscription](#consuming) and [Consumer Memory Safety](#consuming-memory-safety)
* [Async Consumer Implementations](#consuming-async)
* [Concurrency Considerations and Safety](#concurrency)
* [Automatic Recovery From Network Failures](#recovery)
* [OAuth 2 Support](#oauth2-support)

An [API reference](https://rabbitmq.github.io/rabbitmq-dotnet-client/api/RabbitMQ.Client.html) is available separately.


## <a id="dotnet-versions" class="anchor" href="#dotnet-versions">.NET Version Requirements</a>

6.x release series of this library [require .NET 4.6.1+ or a .NET Standard 2.0+ implementation](./dotnet.html#overview).
For 5.x releases, the requirements are [.NET 4.5.1+ or a .NET Standard 1.5+ implementation](./dotnet.html#overview).


## <a id="license" class="anchor" href="#license">License</a>

The library is open source, developed [on GitHub](https://github.com/rabbitmq/rabbitmq-dotnet-client/), and is double-licensed under the

* [Apache Public License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)
* [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/)

This means that the user can consider the library to be licensed under any of the licenses from the list above.
For example, the user may choose the Apache Public License 2.0 and include this client into
a commercial product.


## <a id="dependencies" class="anchor" href="#dependencies">Dependencies</a>

The client has a couple of dependencies:

 * [`System.Memory`](https://www.nuget.org/packages/System.Memory/) 4.5.x
 * [`System.Threading.Channels`](https://www.nuget.org/packages/System.Threading.Channels/) 4.7.x

Applications that use different versions of the same dependencies
should use [assembly version redirection](https://docs.microsoft.com/en-us/dotnet/framework/configure-apps/redirect-assembly-versions),
[automatic](https://docs.microsoft.com/en-us/dotnet/framework/configure-apps/how-to-enable-and-disable-automatic-binding-redirection) or
explicit.


## <a id="major-api-elements" class="anchor" href="#major-api-elements">Major namespaces, interfaces and classes</a>

The client API is closely modelled on the [AMQP 0-9-1 protocol model](./tutorials/amqp-concepts.html),
with additional abstractions for ease of use.

An [API reference](https://rabbitmq.github.io/rabbitmq-dotnet-client/) is available separately.

The core API interfaces and classes are defined in the `RabbitMQ.Client` namespace:

<pre class="lang-csharp">
using RabbitMQ.Client;
</pre>

The core API interfaces and classes are

* `IModel`: represents an AMQP 0-9-1 channel, and provides most of the operations (protocol methods)
* `IConnection`: represents an AMQP 0-9-1 connection
* `ConnectionFactory`: constructs `IConnection` instances
* `IBasicConsumer`: represents a message consumer

Other useful interfaces and classes include:

* `DefaultBasicConsumer`: commonly used base class for consumers

Public namespaces other than `RabbitMQ.Client` include:

* `RabbitMQ.Client.Events`: various events and event handlers
  that are part of the client library, including `EventingBasicConsumer`,
  a consumer implementation built around C# event handlers.
* `RabbitMQ.Client.Exceptions`: exceptions visible to the user.

All other namespaces are reserved for private implementation detail of
the library, although members of private namespaces are usually made
available to applications using the library in order to permit
developers to implement workarounds for faults and gaps they
discover in the library implementation. Applications cannot rely on
any classes, interfaces, member variables etc. that appear within
private namespaces remaining stable across releases of the library.


## <a id="limitations" class="anchor" href="#limitations">Limitations</a>

This client does not support unsigned 64-bit integers, represented in
type `ulong`. Attempting to encode `ulong` values will throw an exception.
Note that signed 64-bit integers are supported.

This is in part due to type marker [ambiguity in the AMQP 0-9-1 spec](https://www.rabbitmq.com/amqp-0-9-1-errata.html#section_3),
and in part due to [the list of types supported by other popular clients](https://github.com/rabbitmq/rabbitmq-dotnet-client/pull/1299#issuecomment-1433342924).


## <a id="connecting" class="anchor" href="#connecting">Connecting to RabbitMQ</a>

Before an application can use RabbitMQ, it has to open a [connection](connections.html)
to a RabbitMQ node. The connection then will be used to perform all subsequent
operations. Connections are **meant to be long-lived**. Opening a connection
for every operation (e.g. publishing a message) would be very inefficient and is
**highly discouraged**.

To open a connection with the .NET client, first instantiate a `ConnectionFactory`
and configure it to use desired hostname, virtual host, credentials, [TLS settings](./ssl.html),
and any other parameters as needed.

Then call the `ConnectionFactory.CreateConnection()` method to open a connection.
Successful and unsuccessful client connection events can be [observed in server logs](./networking.html#logging).

The following two code snippets connect to a RabbitMQ node using a hostname configured
using the `hostName` property:

<pre class="lang-csharp">
ConnectionFactory factory = new ConnectionFactory();
// "guest"/"guest" by default, limited to localhost connections
factory.UserName = user;
factory.Password = pass;
factory.VirtualHost = vhost;
factory.HostName = hostName;

IConnection conn = factory.CreateConnection();
</pre>

<pre class="lang-csharp">
ConnectionFactory factory = new ConnectionFactory();
factory.Uri = new Uri("amqp://user:pass@hostName:port/vhost");

IConnection conn = factory.CreateConnection();
</pre>


### <a id="endpoints-list" class="anchor" href="#endpoints-list">Using Lists of Endpoints</a>

It is possible to specify a list of endpoints to use when connecting. The first
reachable endpoint will be used. In case of [connection failures](#recovery), using
a list of endpoints makes it possible for the application to connect to a different
node if the original one is down.

To use multiple endpoints, provide a list of `AmqpTcpEndpoint`s to `ConnectionFactory#CreateConnection`.
An `AmqpTcpEndpoint` represents a hostname and port pair.

<pre class="lang-csharp">
ConnectionFactory factory = new ConnectionFactory();
factory.UserName = "username";
factory.Password = "s3Kre7";

var endpoints = new System.Collections.Generic.List&lt;AmqpTcpEndpoint&gt; {
  new AmqpTcpEndpoint("hostname"),
  new AmqpTcpEndpoint("localhost")
};
IConnection conn = factory.CreateConnection(endpoints);
</pre>


### <a id="connecting-uri" class="anchor" href="#connecting-uri"></a>

Since the .NET client uses a stricter interpretation of the [AMQP 0-9-1 URI spec](./uri-spec.html)
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
      <code>5671</code> for <a href="./ssl.html">connections with TLS enabled</a>
    </td>
  </tr>
</table>

Note that [user guest can only connect from localhost](./access-control.html) by default.
This is to limit well-known credential use in production systems.

The `IConnection` interface can then be used to open a [channel](channels.html):

<pre class="lang-csharp">
IModel channel = conn.CreateModel();
</pre>

The channel can now be used to send and receive messages,
as described in subsequent sections.

Just like connections, channels are **meant to be long-lived**. Opening a new channel
for every operation would be highly inefficient and is **highly discouraged**. Channels,
however, can have a shorter life span than connections. For example, certain
protocol errors will automatically close channels. If applications can recover
from them, they can open a new channel and retry the operation.

This is covered in more detail in the [Channel guide](channels.html) as well as other
guides such as [Consumer Acknowledgements](./confirms.html).


## <a id="disconnecting" class="anchor" href="#disconnecting">Disconnecting from RabbitMQ</a>

To disconnect, simply close the channel and the connection:

<pre class="lang-csharp">
channel.Close();
conn.Close();
</pre>

Disposing channel and connection objects is not enough, they must be explicitly closed
with the API methods from the example above.

Note that closing the channel may be considered good practice, but isn&#8217;t strictly necessary here - it will be done
automatically anyway when the underlying connection is closed.

Client disconnection events can be [observed in server node logs](./networking.html#logging).


## <a id="connection-and-channel-lifespan" class="anchor" href="#connection-and-channel-lifespan">Connection and Channel Lifespan</a>

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


## <a id="client-provided-names" class="anchor" href="#client-provided-names">Client-Provided Connection Name</a>

RabbitMQ nodes have a limited amount of information about their clients:

 * their TCP endpoint (source IP address and port)
 * the credentials used

This information alone can make identifying applications and instances problematic, in particular when credentials can be
shared and clients connect over a load balancer but [Proxy protocol](./networking.html#proxy-protocol) cannot be enabled.

To make it easier to identify clients in [server logs](./logging.html) and [management UI](./management.html),
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

<pre class="lang-csharp">
ConnectionFactory factory = new ConnectionFactory();
// "guest"/"guest" by default, limited to localhost connections
factory.UserName = user;
factory.Password = pass;
factory.VirtualHost = vhost;
factory.HostName = hostName;

// this name will be shared by all connections instantiated by
// this factory
factory.ClientProvidedName = "app:audit component:event-consumer";

IConnection conn = factory.CreateConnection();
</pre>


## <a id="exchanges-and-queues" class="anchor" href="#exchanges-and-queues">Using Exchanges and Queues</a>

Client applications work with exchanges and [queues](queues.html),
the high-level [building blocks of the protocol](./tutorials/amqp-concepts.html).
These must be "declared" before they can be
used. Declaring either type of object simply ensures that one of that
name exists, creating it if necessary.

Continuing the previous example, the following code declares an
exchange and a queue, then binds them together.

<pre class="lang-csharp">
channel.ExchangeDeclare(exchangeName, ExchangeType.Direct);
channel.QueueDeclare(queueName, false, false, false, null);
channel.QueueBind(queueName, exchangeName, routingKey, null);
</pre>

This will actively declare the following objects:

* a non-durable, non-autodelete exchange of "direct" type
* a non-durable, non-autodelete, non-exclusive queue

The exchange can be customised by using additional parameters.
The above code then binds the queue to the exchange with the given
routing key.

Many channel API (`IModel`) methods are overloaded. The convenient
short form of `ExchangeDeclare` uses sensible defaults. There are
also longer forms with more parameters, to let you override these
defaults as necessary, giving full control where needed.

This "short version, long version" pattern is used throughout the API.


### <a id="passive-declaration" class="anchor" href="#passive-declaration">Passive Declaration</a>

Queues and exchanges can be declared "passively". A passive declare simply checks that the entity
with the provided name exists. If it does, the operation is a no-op. For queues successful
passive declares will return the same information as non-passive ones, namely the number of
consumers and messages in [ready state](./confirms.html) in the queue.

If the entity does not exist, the operation fails with a channel level exception. The channel
cannot be used after that. A new channel should be opened. It is common to use one-off (temporary)
channels for passive declarations.

`IModel#QueueDeclarePassive` and `IModel#ExchangeDeclarePassive` are the
methods used for passive declaration. The following example demonstrates `IModel#QueueDeclarePassive`:

<pre class="lang-csharp">
var response = channel.QueueDeclarePassive("queue-name");
// returns the number of messages in Ready state in the queue
response.MessageCount;
// returns the number of consumers the queue has
response.ConsumerCount;
</pre>

`IModel#ExchangeDeclarePassive`'s return value contains no useful information. Therefore
if the method returns and no channel exceptions occurs, it means that the exchange does exist.


### <a id="nowait-methods" class="anchor" href="#nowait-methods">Operations with Optional Responses</a>

Some common operations also have a "no wait" version which won't wait for server
response. For example, to declare a queue and instruct the server to not send any
response, use

<pre class="lang-csharp">channel.QueueDeclareNoWait(queueName, true, false, false, null);</pre>

The "no wait" versions are more efficient but offer lower safety guarantees, e.g. they
are more dependent on the [heartbeat mechanism](./heartbeats.html) for detection of failed operations.
When in doubt, start with the standard version. The "no wait" versions are only needed in scenarios
with high topology (queue, binding) churn.


### <a id="deleting-entities" class="anchor" href="#deleting-entities">Deleting Entities and Purging Messages</a>

A queue or exchange can be explicitly deleted:

<pre class="lang-csharp">
channel.QueueDelete("queue-name", false, false);
</pre>

It is possible to delete a queue only if it is empty:

<pre class="lang-csharp">
channel.QueueDelete("queue-name", false, true);
</pre>

or if it is not used (does not have any consumers):

<pre class="lang-csharp">
channel.QueueDelete("queue-name", true, false);
</pre>

A queue can be purged (all of its messages deleted):

<pre class="lang-csharp">
channel.QueuePurge("queue-name");
</pre>


## <a id="publishing" class="anchor" href="#publishing">Publishing Messages</a>

To publish a message to an exchange, use <code>IModel.BasicPublish</code> as
follows:

<pre class="lang-csharp">
byte[] messageBodyBytes = System.Text.Encoding.UTF8.GetBytes("Hello, world!");
channel.BasicPublish(exchangeName, routingKey, null, messageBodyBytes);
</pre>

For fine control, you can use overloaded variants to specify the
mandatory flag, or specify messages properties:

<pre class="lang-csharp">
byte[] messageBodyBytes = System.Text.Encoding.UTF8.GetBytes("Hello, world!");
IBasicProperties props = channel.CreateBasicProperties();
props.ContentType = "text/plain";
props.DeliveryMode = 2;
channel.BasicPublish(exchangeName, routingKey, props, messageBodyBytes);
</pre>

This sends a message with delivery mode 2 (persistent) and
content-type "text/plain". See the definition of the `IBasicProperties`
interface for more information about the available message properties.

In the following example, we publish a message with custom headers:

<pre class="lang-csharp">
byte[] messageBodyBytes = System.Text.Encoding.UTF8.GetBytes("Hello, world!");

IBasicProperties props = channel.CreateBasicProperties();
props.ContentType = "text/plain";
props.DeliveryMode = 2;
props.Headers = new Dictionary&lt;string, object&gt;();
props.Headers.Add("latitude",  51.5252949);
props.Headers.Add("longitude", -0.0905493);

channel.BasicPublish(exchangeName, routingKey, props, messageBodyBytes);
</pre>

Code sample below sets a message expiration:

<pre class="lang-csharp">
byte[] messageBodyBytes = System.Text.Encoding.UTF8.GetBytes("Hello, world!");

IBasicProperties props = channel.CreateBasicProperties();
props.ContentType = "text/plain";
props.DeliveryMode = 2;
props.Expiration = "36000000";

channel.BasicPublish(exchangeName, routingKey, props, messageBodyBytes);
</pre>


## <a id="consuming" class="anchor" href="#consuming">Retrieving Messages By Subscription ("push API")</a>

The recommended and most convenient way to receive messages is to set up a subscription using the
`IBasicConsumer` interface. The messages will then be delivered
automatically as they arrive, rather than having to be requested
proactively.

One way to implement a consumer is to use the
convenience class `EventingBasicConsumer`, which dispatches
deliveries and other consumer lifecycle events as C# events:

<pre class="lang-csharp">
var consumer = new EventingBasicConsumer(channel);
consumer.Received += (ch, ea) =>
                {
                    var body = ea.Body.ToArray();
                    // copy or deserialise the payload
                    // and process the message
                    // ...
                    channel.BasicAck(ea.DeliveryTag, false);
                };
// this consumer tag identifies the subscription
// when it has to be cancelled
string consumerTag = channel.BasicConsume(queueName, false, consumer);
</pre>

Another option is to subclass `DefaultBasicConsumer`,
overriding methods as necessary, or implement `IBasicConsumer`
directly. You will generally want to implement the core method <code>IBasicConsumer.HandleBasicDeliver</code>.

More sophisticated consumers will need to implement further
methods. In particular, `HandleModelShutdown` traps
channel/connection closure. Consumers can also implement
` HandleBasicCancelOk` to be notified of cancellations.

The `ConsumerTag` property of `DefaultBasicConsumer` can be
used to retrieve the server-generated consumer tag, in cases where
none was supplied to the original <code>IModel.BasicConsume</code> call.

You can cancel an active consumer with <code>IModel.BasicCancel</code>:

<pre class="lang-csharp">
channel.BasicCancel(consumerTag);
</pre>

When calling the API methods, you always refer to consumers by their
consumer tags, which can be either client- or server-generated as
explained in the [AMQP 0-9-1 specification](./specification.html) document.


## <a id="consuming-memory-safety" class="anchor" href="#consuming-memory-safety">Consumer Memory Safety Requirements</a>

As of [version 6.0](https://github.com/rabbitmq/rabbitmq-dotnet-client/blob/main/CHANGELOG.md) of
the .NET client, message payloads are represented using the [`System.ReadOnlyMemory&lt;byte&gt;`](https://docs.microsoft.com/en-us/dotnet/api/system.readonlymemory-1?view=netcore-3.1)
type from the [`System.Memory` library](https://www.nuget.org/packages/System.Memory/).

This library places certain restrictions on when a read only memory span can be
accessed by applications.

**Important**: consumer interface implementations **must deserialize or copy delivery payload before delivery handler method returns**.
Retaining a reference to the payload is not safe: the memory allocated for it can be deallocated at any moment
after the handler returns.


## <a id="consuming-async" class="anchor" href="#consuming-async">Async Consumer Implementations</a>

The client provides an async-oriented consumer dispatch implementation. This dispatcher can only
be used with async consumers, that is, `IAsyncBasicConsumer` implementations.

In order to use this dispatcher, set the `ConnectionFactory.DispatchConsumersAsync` property to `true`:

<pre class="lang-csharp">
ConnectionFactory factory = new ConnectionFactory();
// ...
// use async-oriented consumer dispatcher. Only compatible with IAsyncBasicConsumer implementations
factory.DispatchConsumersAsync = true;
</pre>

then register a consumer that implements `IAsyncBasicConsumer`, such as `AsyncEventingBasicConsumer` or `AsyncDefaultBasicConsumer`:

<pre class="lang-csharp">
var consumer = new AsyncEventingBasicConsumer(channel);
consumer.Received += async (ch, ea) =>
    {
        var body = ea.Body.ToArray();
        // copy or deserialise the payload
        // and process the message
        // ...

        channel.BasicAck(ea.DeliveryTag, false);
        await Task.Yield();

    };
// this consumer tag identifies the subscription
// when it has to be cancelled
string consumerTag = channel.BasicConsume(queueName, false, consumer);
// ensure we get a delivery
bool waitRes = latch.WaitOne(2000);
</pre>


## <a id="basic-get" class="anchor" href="#basic-get">Fetching Individual Messages (Polling or "pull API")</a>

It is also possible to retrieve individual messages on demand ("pull API" a.k.a. polling).
This approach to consumption is **very inefficient** as it is effectively polling
and applications repeatedly have to ask for results even if the vast majority of the requests
yield no results. Therefore using this approach **is highly discouraged**.

To "pull" a message, use the `IModel.BasicGet` method.
The returned value is an instance of `BasicGetResult`, from which the header
information (properties) and message body can be extracted:

<pre class="lang-csharp">
bool autoAck = false;
BasicGetResult result = channel.BasicGet(queueName, autoAck);
if (result == null) {
    // No message available at this time.
} else {
    IBasicProperties props = result.BasicProperties;
    ReadOnlyMemory&lt;byte&gt; body = result.Body;
    ...
</pre>

The above example uses [manual acknowledgements](./confirms.html) (`autoAck = false`), so the application must also call
`IModel.BasicAck` to acknowledge the delivery after processing:

<pre class="lang-csharp">
    ...
    // acknowledge receipt of the message
    channel.BasicAck(result.DeliveryTag, false);
}
</pre>

  Note that fetching messages using this API is relatively inefficient. If you'd prefer
  RabbitMQ to push messages to the client, see the next section.


## <a id="concurrency" class="anchor" href="#concurrency">Concurrency Considerations for Consumers</a>

There is a number of concurrency-related topics for a library user to consider.


### <a id="concurrency-channel-sharing" class="anchor" href="#concurrency-channel-sharing">Sharing Channels Between Threads</a>

`IModel` instance usage by more than
one thread simultaneously should be avoided. Application code
should maintain a clear notion of thread ownership for `IModel` instances.

This is a **hard requirement for publishers**: sharing a channel (an `IModel` instance)
for concurrent publishing will lead to incorrect frame interleaving at the protocol level.
Channel instances **must not be shared** by threads that publish on them.

If more than one thread needs to access a particular `IModel`
instances, the application should enforce mutual exclusion. One
way of achieving this is for all users of an `IModel` to
`lock` the instance itself:

<pre class="lang-csharp">
IModel ch = RetrieveSomeSharedIModelInstance();
lock (ch) {
  ch.BasicPublish(...);
}
</pre>

Symptoms of incorrect serialisation of `IModel` operations
include, but are not limited to,

 * [connection-level exceptions](./connections.html#error-handling) due to invalid frame
   interleaving on the wire. RabbitMQ [server logs](./logging.html) will
   contain unexpected frame errors in such scenario.
 * Pipelining and continuation exceptions thrown by the client

Consumption that involve sharing a channel between threads should be avoided
when possible but can be done safely.

Consumers that can be multi-threaded or use a thread pool internally, including TPL-based
consumers, must use mutual exclusion of [acknowledgements](./confirms.html) operations
on a shared channel.


### <a id="concurrency-thread-usage" class="anchor" href="#concurrency-thread-usage">Per-Connection Thread Use</a>

Each `IConnection` instance is, in the current implementation,
backed by a single background thread that reads from the socket and
dispatches the resulting events to the application.
If heartbeats are enabled, they will use a pair of .NET timers per connection.

Usually, therefore, there will be at least two threads active in an application
using this library:

<dl>
  <dt>the application thread</dt>
  <dd>
    contains the application logic, and makes
    calls on <code>IModel</code> methods to perform protocol operations.
  </dd>

  <dt>the I/O activity thread</dt>
  <dd>
    hidden away and completely managed by the
    <code>IConnection</code> instance.
  </dd>
</dl>

The one place where the nature of the threading model is visible to
the application is in any callback the application registers with the
library. Such callbacks include:

* any `IBasicConsumer` method
* the `BasicReturn` event on `IModel`
* any of the various shutdown events on `IConnection`, `IModel` etc.


### <a id="consumer-callbacks-and-ordering" class="anchor" href="#consumer-callbacks-and-ordering">Consumer Callbacks, Concurrency and Operation Ordering</a>

#### Is Consumer Operation Dispatch Concurrent?

`IBasicConsumer` callbacks are invoked sequantially (with a concurrency degree of one) by default.

For concurrent dispatch of inbound consumer deliveries, set [`ConnectionFactory.ConsumerDispatchConcurrency`](https://rabbitmq.github.io/rabbitmq-dotnet-client/api/RabbitMQ.Client.ConnectionFactory.html#RabbitMQ_Client_ConnectionFactory_ConsumerDispatchConcurrency) to a value
greater than one.

#### Message Ordering Guarantee

Consumer events on the same channel are guaranteed to be dispatched in the same order they were received in.

For example, if messages A and B were delivered in this order on the same channel, they will be dispatched to
a consumer (a specific `IBasicConsumer` instance) in this order.

If messages A and B were delivered on different channels, they can be dispatched to consumers in any order (or in parallel).

With the concurrency degree of one, deliveries on the same channel will be handled sequentially. With a higher
concurrency degree, their dispatch will happen in the same order but actual processing can happen in parallel (depending
on the number of available cores and application runtime), which can result in concurrency hazards.

#### Acknowledgement of Multiple Deliveries at Once

Consumers can [acknowledge](/confirms.html) multiple deliveries at a time. When consumer dispatch concurrency degree is higher than one,
this can result in a [double acknowledgement](/confirms.html#consumer-acks-double-acking), which is considered to be [an error in the protocol](/channels.html#error-handling).

Therefore, with concurrent consumer dispatch, consumers should acknowledge only one delivery at a time.


#### Consumers and Blocking Operations on the Same Channel

Consumer event handlers can invoke blocking
operations on the same channel (such as `IModel.QueueDeclare` or `IModel.BasicCancel`)
without deadlocking.


## <a id="basic-return" class="anchor" href="#basic-return">Handling Unroutable Messages</a>

If a message is published with the "mandatory" flag
set, but cannot be delivered, the broker will return it to the sending
client (via a <code>basic.return</code> AMQP 0-9-1 command).

To be notified of such returns, clients can subscribe to the
<code>IModel.BasicReturn</code> event. If there are no listeners attached to the
event, then returned messages will be silently dropped.

<pre class="lang-csharp">
channel.BasicReturn += (sender, ea) => {
    ...
};
</pre>

The `BasicReturn` event will fire, for example, if the client
publishes a message with the "mandatory" flag set to an exchange of
"direct" type which is not bound to a queue.


## <a id="recovery" class="anchor" href="#recovery">Automatic Recovery From Network Failures</a>


### <a id="connection-recovery" class="anchor" href="#connection-recovery">Connection Recovery</a>

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

Topology recovery starts after the above actions are completed. The following steps are
performed for every channel known to being open at the time of connection failure:

  * Re-declare exchanges (except for predefined ones)
  * Re-declare queues
  * Recover all bindings
  * Recover all consumers

To enable automatic connection recovery, set
<code>ConnectionFactory.AutomaticRecoveryEnabled</code> to true:

<pre class="lang-csharp">
ConnectionFactory factory = new ConnectionFactory();
factory.AutomaticRecoveryEnabled = true;
// connection that will recover automatically
IConnection conn = factory.CreateConnection();
</pre>

If recovery fails due to an exception (e.g. RabbitMQ node is
still not reachable), it will be retried after a fixed time interval (default
is 5 seconds). The interval can be configured:

<pre class="lang-csharp">
ConnectionFactory factory = new ConnectionFactory();
// attempt recovery every 10 seconds
factory.NetworkRecoveryInterval = TimeSpan.FromSeconds(10);
</pre>


### <a id="recovery-triggers" class="anchor" href="#recovery-triggers">When Will Connection Recovery Be Triggered?</a>

Automatic connection recovery, if enabled, will be triggered by the following events:

* An I/O exception is thrown in connection's I/O loop
* A socket read operation times out
* Missed server [heartbeats](./heartbeats.html) are detected
* Any other unexpected exception is thrown in connection's I/O loop

whichever happens first.

If initial client connection to a RabbitMQ node fails, automatic connection
recovery won't kick in. Applications developers are responsible for retrying
such connections, logging failed attempts, implementing a limit to the number
of retries and so on. Here's a very basic example:

<pre class="lang-csharp">
ConnectionFactory factory = new ConnectionFactory();
// configure various connection settings

try {
  IConnection conn = factory.CreateConnection();
} catch (RabbitMQ.Client.Exceptions.BrokerUnreachableException e) {
  Thread.Sleep(5000);
  // apply retry logic
}
</pre>

When a connection is closed by the application via the <code>Connection.Close</code> method,
connection recovery will not be initiated.

Channel-level exceptions will not trigger any kind of recovery as they usually
indicate a semantic issue in the application (e.g. an attempt to consume from a
non-existent queue).


### <a id="publishers" class="anchor" href="#publishers">Effects on Publishing</a>

Messages that are published using <code>IModel.BasicPublish</code> when connection is down
will be lost. The client does not enqueue them for delivery after connection has recovered.
To ensure that published messages reach RabbitMQ applications need to use [Publisher Confirms](confirms.html)
and account for connection failures.


### <a id="topology-recovery" class="anchor" href="#topology-recovery">Topology Recovery</a>

Topology recovery involves recovery of exchanges, queues, bindings
and consumers. It is enabled by default but can be disabled:

<pre class="lang-csharp">
ConnectionFactory factory = new ConnectionFactory();

IConnection conn = factory.CreateConnection();
factory.AutomaticRecoveryEnabled = true;
factory.TopologyRecoveryEnabled  = false;
</pre>


### <a id="automatic-recovery-limitations" class="anchor" href="#automatic-recovery-limitations">Failure Detection and Recovery Limitations</a>

Automatic connection recovery has a number of limitations and intentional
design decisions that applications developers need to be aware of.

When a connection is down or lost, it [takes time to detect](./heartbeats.html).
Therefore there is a window of time in which both the
library and the application are unaware of effective
connection failure.  Any messages published during this
time frame are serialised and written to the TCP socket
as usual. Their delivery to the broker can only be
guaranteed via [publisher confirms](./confirms.html): publishing in AMQP 0-9-1 is entirely
asynchronous by design.

When a socket or I/O operation error is detected by a
connection with automatic recovery enabled, recovery
begins after a configurable delay, 5 seconds by
default. This design assumes that even though a lot of
network failures are transient and generally short
lived, they do not go away in an instant. Connection recovery
attempts will continue at identical time intervals until
a new connection is successfully opened.

When a connection is in the recovering state, any
publishes attempted on its channels will be rejected
with an exception. The client currently does not perform
any internal buffering of such outgoing messages. It is
an application developer's responsibility to keep track of such
messages and republish them when recovery succeeds.
[Publisher confirms](./confirms.html) is a protocol extension
that should be used by publishers that cannot afford message loss.

Connection recovery will not kick in when a channel is closed due to a
channel-level exception. Such exceptions often indicate application-level
issues. The library cannot make an informed decision about when that's
the case.

Closed channels won't be recovered even after connection recovery kicks in.
This includes both explicitly closed channels and the channel-level exception
case above.


### <a id="basic-ack-and-recovery" class="anchor" href="#basic-ack-and-recovery">Manual Acknowledgements and Automatic Recovery</a>

When manual acknowledgements are used, it is possible that
network connection to RabbitMQ node fails between message
delivery and acknowledgement. After connection recovery,
RabbitMQ will reset delivery tags on all channels.

This means that <code>basic.ack</code>, <code>basic.nack</code>, and <code>basic.reject</code>
with old delivery tags will cause a channel exception. To avoid this,
RabbitMQ .NET client keeps track of and updates delivery tags to make them monotonically
growing between recoveries.

<code>IModel.BasicAck</code>, <code>IModel.BasicNack</code>, and
<code>IModel.BasicReject</code> then translate adjusted delivery tags into those used by RabbitMQ.

Acknowledgements with stale delivery tags will not be
sent. Applications that use manual acknowledgements and automatic
recovery must be capable of handling redeliveries.


## <a id="oauth2-support" class="anchor" href="#oauth2-support">OAuth 2 Support</a>

The client can authenticate against an OAuth 2 server like [UAA](https://github.com/cloudfoundry/uaa).
The [OAuth 2 plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_backend_oauth2)
must be turned on on the server side and configured to use the same OAuth 2
server as the client. This section assumes that the [most recent major version of the OAuth2 client library](https://www.nuget.org/packages/RabbitMQ.Client.OAuth2) is used.

### <a id="oauth2-getting-token" class="anchor" href="#oauth2-getting-token">Getting the OAuth 2 Token</a>

The .Net client provides the `OAuth2ClientCredentialsProvider` class to get a
JWT token using the [OAuth 2 Client Credentials flow](https://tools.ietf.org/html/rfc6749#section-4.4).
The client sends the access token in the password field when opening a
connection. The broker then verifies the access token signature, validity, and
permissions before authorising the connection and granting access to the
requested virtual host.

<pre class="lang-csharp">
using RabbitMQ.Client.OAuth2;

var tokenEndpointUri = new Uri("http://somedomain.com/token");
var oAuth2Client = new OAuth2ClientBuilder("client_id", "client_secret", tokenEndpointUri).Build();
ICredentialsProvider credentialProvider = new OAuth2ClientCredentialsProvider("prod-uaa-1", oAuth2Client);

var connectionFactory = new ConnectionFactory {
        CredentialsProvider = credentialsProvider
};
var connection = connectionFactory.CreateConnection();
</pre>

In production, ensure you use HTTPS for the token endpoint URI and configure
a `HttpClientHandler` appropriately for the `HttpClient` :

<pre class="lang-csharp">
HttpClientHandler httpClientHandler = buildHttpClientHandlerWithTLSEnabled();

var tokenEndpointUri = new Uri("https://somedomain.com/token");

var oAuth2ClientBuilder = new OAuth2ClientBuilder("client_id", "client_secret", tokenEndpointUri)
oAuth2ClientBuilder.SetHttpClientHandler(httpClientHandler);
var oAuth2Client = oAuth2ClientBuilder.Build();

ICredentialsProvider credentialsProvider = new OAuth2ClientCredentialsProvider("prod-uaa-1", oAuth2Client);

var connectionFactory = new ConnectionFactory {
        CredentialsProvider = credentialsProvider
};
var connection = connectionFactory.CreateConnection();
</pre>

Note: In case your Authorization server requires extra request parameters
beyond what the specification requires, you can add `<key, value>` pairs to a
`Dictionary` and passing it to the `OAuth2ClientCredentialsProvider`
constructor rather than an `EMPTY` one as shown above.


### <a id="oauth2-refreshing-token" class="anchor" href="#oauth2-refreshing-token">Refreshing the Token</a>

When tokens expire, the broker refuses further operations over the connection.
It is possible to call `ICredentialsProvider#Refresh()` before expiring and
send the new token to the server. This is not convenient for applications so,
the .Net client provides help with the `TimerBasedCredentialRefresher`. This
utility schedules a timer for every token received. When the timer expires, it
raises an event in which the connection calls `ICredentialsProvider#Refresh()`.

The following snippet shows how to create a `TimerBasedCredentialRefresher`
instance and set it up on the `ConnectionFactory`:

<pre class="lang-csharp">
using RabbitMQ.Client.OAuth2;
...

ICredentialsRefresher credentialsRefresher = new TimerBasedCredentialRefresher();

var connectionFactory = new ConnectionFactory {
        CredentialsProvider = credentialsProvider,
        CredentialsRefresher = credentialsRefresher
};
var connection = connectionFactory.CreateConnection();
</pre>

The `TimerBasedCredentialRefresher` schedules a refresh after 2/3 of the token
validity time. For example, if the token expires in 60 minutes, it is refreshed
after 40 minutes.
