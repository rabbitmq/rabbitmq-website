---
title: Java Client API Guide
---
<!--
Copyright (c) 2007-2023 VMware, Inc. or its affiliates.

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

# Java Client API Guide

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers [RabbitMQ Java client](./java-client) and its public API.
It assumes that the [most recent major version of the client](https://central.sonatype.com/artifact/com.rabbitmq/amqp-client) is used
and the reader is familiar with [the basics](./getstarted).

Key sections of the guide are:

 * [Licensing](#license)
 * [JDK and Android versions](#jdk-versions) supported
 * [Support Timeline](#support-timeline)
 * [Connecting to RabbitMQ](#connecting)
 * [Connection and Channel Lifespan](#connection-and-channel-lifespan)
 * [Client-provided connection name](#client-provided-names)
 * [Using Exchanges and Queues](#exchanges-and-queues)
 * [Publishing Messages](#publishing)
 * [Consuming Using a Subscription](#consuming)
 * [Concurrency Considerations and Safety](#concurrency)
 * [Automatic Recovery From Network Failures](#recovery)
 * [Unhandled Exceptions](#unhandled-exceptions) in consumers
 * [Metrics and Monitoring](#metrics)
 * [Endpoint Resolution with the AddressResolver Interface](#service-discovery-with-address-resolver)
 * The [Request/Response Pattern](#rpc) ("RPC")
 * [TLS support](#tls)
 * [OAuth 2 support](#oauth2-support)

An [API reference](https://rabbitmq.github.io/rabbitmq-java-client/api/current/) (JavaDoc) is available separately.


## <a id="support-timeline" class="anchor" href="#support-timeline">Support Timeline</a>

Please see the [RabbitMQ Java libraries support page](./java-versions) for the support timeline.

## <a id="jdk-versions" class="anchor" href="#jdk-versions">JDK and Android Version Support</a>

5.x release series of this library [require JDK 8](./java-versions), both for compilation and at runtime. On Android,
this means only [Android 7.0 or later](https://developer.android.com/guide/platform/j8-jack.html) versions are supported.

4.x release series [support JDK 6](./java-versions) and Android versions prior to 7.0.


## <a id="license" class="anchor" href="#license">License</a>

The library is open source, developed [on GitHub](https://github.com/rabbitmq/rabbitmq-java-client/), and is triple-licensed under

 * [Apache Public License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)
 * [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/)
 * [GPL 2.0](http://www.gnu.org/licenses/gpl-2.0.html)

This means that the user can consider the library to be licensed under **any of the licenses from the list above**.
For example, the user may choose the Apache Public License 2.0 and include this client into
a commercial product. Codebases that are licensed under the GPLv2 may choose GPLv2, and so on.


## <a id="overview" class="anchor" href="#overview">Overview</a>

The client API exposes key entities in the [AMQP 0-9-1 protocol model](./tutorials/amqp-concepts),
with additional abstractions for ease of use.

RabbitMQ Java client uses `com.rabbitmq.client` as its top-level package.
The key classes and interfaces are:

 * Channel: represents an AMQP 0-9-1 channel, and provides most of the operations (protocol methods).
 * Connection: represents an AMQP 0-9-1 connection
 * ConnectionFactory: constructs `Connection` instances
 * Consumer: represents a message consumer
 * DefaultConsumer: commonly used base class for consumers
 * BasicProperties: message properties (metadata)
 * BasicProperties.Builder: builder for `BasicProperties`

Protocol operations are available through the
`Channel` interface. `Connection` is
used to open channels, register connection lifecycle event
handlers, and close connections that are no longer needed.
`Connection`s are instantiated through `ConnectionFactory`,
which is how you configure various connection settings, such as the vhost or username.


## <a id="connections-and-channels" class="anchor" href="#connections-and-channels">Connections and Channels</a>

The core API classes are `Connection`
and `Channel`, representing an AMQP 0-9-1 connection and
channel, respectively. They are typically imported before used:

```java
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
```

## <a id="connecting" class="anchor" href="#connecting">Connecting to RabbitMQ</a>

The following code connects to a RabbitMQ node using the given parameters (host name, port number, etc):

```java
ConnectionFactory factory = new ConnectionFactory();
// "guest"/"guest" by default, limited to localhost connections
factory.setUsername(userName);
factory.setPassword(password);
factory.setVirtualHost(virtualHost);
factory.setHost(hostName);
factory.setPort(portNumber);

Connection conn = factory.newConnection();
```

All of these parameters have sensible defaults for a RabbitMQ
node running locally.

The default value for a property will be used if the property
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
    <td>port</td>

    <td>
      <code>5672</code> for regular connections,
      <code>5671</code> for <a href="./ssl">connections that use TLS</a>
    </td>
  </tr>
</table>

### <a id="uri" class="anchor" href="#uri">Connecting Using a URI</a>

Alternatively, [URIs](./uri-spec) may be used:

```java
ConnectionFactory factory = new ConnectionFactory();
factory.setUri("amqp://userName:password@hostName:portNumber/virtualHost");
Connection conn = factory.newConnection();
```

All of these parameters have sensible defaults for a stock
RabbitMQ server running locally.

Successful and unsuccessful client connection events can be [observed in server node logs](./logging).

Note that [user guest can only connect from localhost](./access-control) by default.
This is to limit well-known credential use in production systems.

Application developers can [assign a custom name to a connection](#client-provided-names). If set,
the name will be mentioned in RabbitMQ node logs as well as [management UI](./management).

The `Connection` interface can then be used to open a channel:

```java
Channel channel = conn.createChannel();
```

The channel can now be used to send and receive messages, as described in subsequent sections.

### <a id="endpoints-list" class="anchor" href="#endpoints-list">Using Lists of Endpoints</a>

It is possible to specify a list of endpoints to use when connecting. The first
reachable endpoint will be used. In case of [connection failures](#recovery), using
a list of endpoints makes it possible for the application to connect to a different
node if the original one is down.

To use multiple of endpoint, provide a list of `Address`es to `ConnectionFactory#newConnection`.
An `Address` represents a hostname and port pair.

```java
Address[] addrArr = new Address[]{ new Address(hostname1, portnumber1)
                                 , new Address(hostname2, portnumber2)};
Connection conn = factory.newConnection(addrArr);
```

will attempt to connect to `hostname1:portnumber1`, and if
that fails to `hostname2:portnumber2`. The connection returned is
the first in the array that succeeds (without throwing
`IOException`). This is entirely equivalent to repeatedly
setting host and port on a factory, calling
`factory.newConnection()` each time, until one of them succeeds.

If an `ExecutorService` is provided as well (using the
form `factory.newConnection(es, addrArr)`) the thread pool is
associated with the (first) successful connection.

If you want more control over the host to connect to, see
[the support for service discovery](#service-discovery-with-address-resolver).

## <a id="disconnecting" class="anchor" href="#disconnecting">Disconnecting from RabbitMQ</a>

To disconnect, simply close the channel and the connection:

```java
channel.close();
conn.close();
```

Note that closing the channel may be considered good practice, but is not strictly necessary here - it will be done
automatically anyway when the underlying connection is closed.

Client disconnection events can be [observed in server node logs](./networking#logging).

## <a id="connection-and-channel-lifespan" class="anchor" href="#connection-and-channel-lifespan">Connection and Channel Lifespan</a>

Client [connections](./connections) are meant to be long-lived. The underlying protocol is designed and optimized for
long running connections. That means that opening a new connection per operation,
e.g. a message published, is unnecessary and strongly discouraged as it will introduce a lot of
network roundtrips and overhead.

[Channels](./channels) are also meant to be long-lived but since many recoverable protocol errors will
result in channel closure, channel lifespan could be shorter than that of its connection.
Closing and opening new channels per operation is usually unnecessary but can be
appropriate. When in doubt, consider reusing channels first.

[Channel-level exceptions](./channels#error-handling) such as attempts to consume from a
queue that does not exist will result in channel closure. A closed channel can no
longer be used and will not receive any more events from the server (such
as message deliveries). Channel-level exceptions will be logged by RabbitMQ
and will initiate a shutdown sequence for the channel (see below).

## <a id="client-provided-names" class="anchor" href="#client-provided-names">Client-Provided Connection Name</a>

RabbitMQ nodes have a limited amount of information about their clients:

 * their TCP endpoint (source IP address and port)
 * the credentials used

This information alone can make identifying applications and instances problematic, in particular when credentials can be
shared and clients connect over a load balancer but [Proxy protocol](./networking#proxy-protocol) cannot be enabled.

To make it easier to identify clients in [server logs](./logging) and [management UI](./management),
AMQP 0-9-1 client connections, including the RabbitMQ Java client, can provide a custom identifier.
If set, the identifier will be mentioned in log entries and management UI. The identifier is known as
the **client-provided connection name**. The name can be used to identify an application or a specific component
within an application. The name is optional; however, developers are strongly encouraged to provide one
as it would significantly simplify certain operational tasks.

RabbitMQ Java client's [`ConnectionFactory#newConnection` method overrides](https://rabbitmq.github.io/rabbitmq-java-client/api/current/com/rabbitmq/client/ConnectionFactory.html#newConnection(java.util.concurrent.ExecutorService,com.rabbitmq.client.Address%5B%5D,java.lang.String))
accept a client-provided connection name. Here's a modified connection example used above
which provides such a name:

```java
ConnectionFactory factory = new ConnectionFactory();
factory.setUri("amqp://userName:password@hostName:portNumber/virtualHost");
// provides a custom connection name
Connection conn = factory.newConnection("app:audit component:event-consumer");
```


## <a id="exchanges-and-queues" class="anchor" href="#exchanges-and-queues">Using Exchanges and Queues</a>

Client applications work with [exchanges] and [queues](./queues),
the high-level [building blocks of the protocol](./tutorials/amqp-concepts).
These must be declared before they can be used. Declaring either type of object
simply ensures that one of that name exists, creating it if necessary.

Continuing the previous example, the following code declares an exchange and a [server-named queue](./queues#server-named-queues),
then binds them together.

```java
channel.exchangeDeclare(exchangeName, "direct", true);
String queueName = channel.queueDeclare().getQueue();
channel.queueBind(queueName, exchangeName, routingKey);
```

This will actively declare the following objects,
both of which can be customised by using additional parameters.
Here neither of them have any special arguments.

 * a durable, non-autodelete exchange of "direct" type
 * a non-durable, exclusive, autodelete queue with a generated name

The above function calls then bind the queue to the exchange with the
given routing key.

Note that this would be a typical way to declare a queue when only one
client wants to work with it: it doesn't need a well-known name, no
other client can use it (exclusive) and will be cleaned up
automatically (autodelete). If several clients want to share a queue
with a well-known name, this code would be appropriate:

```java
channel.exchangeDeclare(exchangeName, "direct", true);
channel.queueDeclare(queueName, true, false, false, null);
channel.queueBind(queueName, exchangeName, routingKey);
```

This will actively declare:

 * a durable, non-autodelete exchange of "direct" type
 * a durable, non-exclusive, non-autodelete queue with a well-known name

Many `Channel` API methods are overloaded.
These convenient short forms of `exchangeDeclare`, `queueDeclare` and `queueBind`
use sensible defaults. There are also longer forms with more parameters, to let you override these defaults
as necessary, giving full control where needed.

This "short form, long form" pattern is used throughout the client API uses.

### <a id="passive-declaration" class="anchor" href="#passive-declaration">Passive Declaration</a>

Queues and exchanges can be declared "passively". A passive declare simply checks that the entity
with the provided name exists. If it does, the operation is a no-op. For queues successful
passive declares will return the same information as non-passive ones, namely the number of
consumers and messages in [ready state](./confirms) in the queue.

If the entity does not exist, the operation fails with a channel level exception. The channel
cannot be used after that. A new channel should be opened. It is common to use one-off (temporary)
channels for passive declarations.

`Channel#queueDeclarePassive` and `Channel#exchangeDeclarePassive` are the
methods used for passive declaration. The following example demonstrates `Channel#queueDeclarePassive`:

```java
Queue.DeclareOk response = channel.queueDeclarePassive("queue-name");
// returns the number of messages in Ready state in the queue
response.getMessageCount();
// returns the number of consumers the queue has
response.getConsumerCount();
```

`Channel#exchangeDeclarePassive`'s return value contains no useful information. Therefore
if the method returns and no channel exceptions occurs, it means that the exchange does exist.

### <a id="nowait-methods" class="anchor" href="#nowait-methods">Operations with Optional Responses</a>

Some common operations also have a "no wait" version which won't wait for server
response. For example, to declare a queue and instruct the server to not send any
response, use

```java
channel.queueDeclareNoWait(queueName, true, false, false, null);
```

The "no wait" versions are more efficient but offer lower safety guarantees, e.g. they
are more dependent on the [heartbeat mechanism](./heartbeats) for detection of failed operations.
When in doubt, start with the standard version. The "no wait" versions are only needed in scenarios
with high topology (queue, binding) churn.

### <a id="deleting-entities" class="anchor" href="#deleting-entities">Deleting Entities and Purging Messages</a>

A queue or exchange can be explicitly deleted:

```java
channel.queueDelete("queue-name")
```

It is possible to delete a queue only if it is empty:

```java
channel.queueDelete("queue-name", false, true)
```

or if it is not used (does not have any consumers):

```java
channel.queueDelete("queue-name", true, false)
```

A queue can be purged (all of its messages deleted):

```java
channel.queuePurge("queue-name")
```


## <a id="publishing" class="anchor" href="#publishing">Publishing Messages</a>

To publish a message to an exchange, use `Channel.basicPublish` as follows:

```java
byte[] messageBodyBytes = "Hello, world!".getBytes();
channel.basicPublish(exchangeName, routingKey, null, messageBodyBytes);
```

For fine control, use overloaded variants to specify the `mandatory` flag,
or send messages with pre-set message properties (see the [Publishers guide](./publishers) for details):

```java
channel.basicPublish(exchangeName, routingKey, mandatory,
                     MessageProperties.PERSISTENT_TEXT_PLAIN,
                     messageBodyBytes);
```

This sends a message with delivery mode 2 (persistent), priority 1
and content-type "text/plain". Use the `Builder` class to build a
message properties object with as many properties as needed, for example:

```java
channel.basicPublish(exchangeName, routingKey,
             new AMQP.BasicProperties.Builder()
               .contentType("text/plain")
               .deliveryMode(2)
               .priority(1)
               .userId("bob")
               .build(),
               messageBodyBytes);
```

This example publishes a message with custom headers:

```java
Map&lt;String, Object&gt; headers = new HashMap&lt;String, Object&gt;();
headers.put("latitude",  51.5252949);
headers.put("longitude", -0.0905493);

channel.basicPublish(exchangeName, routingKey,
             new AMQP.BasicProperties.Builder()
               .headers(headers)
               .build(),
               messageBodyBytes);
```

This example publishes a message with expiration:

```java
channel.basicPublish(exchangeName, routingKey,
             new AMQP.BasicProperties.Builder()
               .expiration("60000")
               .build(),
               messageBodyBytes);
```

This is just a brief set of examples that does not demonstrate every
supported property.

Note that `BasicProperties` is an inner class of an outer class, `AMQP`.

Invocations of `Channel#basicPublish` will eventually block if a
[resource-driven alarm](https://www.rabbitmq.com/./alarms) is in effect.


## <a id="concurrency" class="anchor" href="#concurrency">Channels and Concurrency Considerations (Thread Safety)</a>

Sharing `Channel` instances between
threads should be avoided. Applications
should be using a `Channel` per thread
instead of sharing the same `Channel` across
multiple threads.

While some operations on channels are safe to invoke
concurrently, some are not and will result in incorrect frame interleaving
on the wire, double acknowledgements and so on.

Concurrent publishing on a shared channel can result in
incorrect frame interleaving on the wire, triggering a
connection-level protocol exception and immediate connection closure by the broker.
It therefore requires explicit synchronization in application
code (`Channel#basicPublish` must be invoked in a
critical section). Sharing channels between threads will also
interfere with [Publisher
Confirms](./confirms). Concurrent publishing on a shared channel is best avoided entirely,
e.g. by using a channel per thread.

It is possible to use channel pooling to avoid concurrent
publishing on a shared channel: once a thread is done working
with a channel, it returns it to the pool, making the
channel available for another thread. Channel pooling can be
thought of as a specific synchronization solution. It is
recommended that an existing pooling library is used
instead of a homegrown solution. For example, [Spring AMQP](https://projects.spring.io/spring-amqp/)
which comes with a ready-to-use channel pooling feature.

Channels consume resources and in most cases applications very rarely need more than a few hundreds
open channels in the same JVM process. If we assume that the application
has a thread for each channel (as channel shouldn't be used concurrently), thousands
of threads for a single JVM is already a fair amount of overhead that likely can be avoided.
Moreover a few fast publishers can easily saturate a network interface and a broker node:
publishing involves less work than routing, storing and delivering messages.

A classic anti-pattern to be avoided is opening a channel for each published message. Channels
are supposed to be reasonably long-lived and opening a new one is a network round-trip which
makes this pattern extremely inefficient.

Consuming in one thread and publishing in another thread on a shared channel
can be safe.

Server-pushed deliveries (see the section below) are
dispatched concurrently with a guarantee that per-channel
ordering is preserved.  The dispatch mechanism uses a [`java.util.concurrent.ExecutorService`](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/ExecutorService.html),
one per connection.  It is possible to provide a custom
executor that will be shared by all connections produced by a
single `ConnectionFactory` using the `ConnectionFactory#setSharedExecutor` setter.

When [manual acknowledgements](./confirms) are used, it is important
to consider what thread does the acknowledgement. If it's different from the
thread that received the delivery (e.g. `Consumer#handleDelivery`
delegated delivery handling to a different thread), acknowledging
with the `multiple` parameter set to `true` is unsafe
and will result in double-acknowledgements, and therefore a channel-level protocol
exception that closes the channel. Acknowledging a single message at a time
can be safe.


## <a id="consuming" class="anchor" href="#consuming">Receiving Messages by Subscription ("Push API")</a>

```java
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
```

The most efficient way to receive messages is to set up a
subscription using the `Consumer`
interface. The messages will then be delivered
automatically as they arrive, rather than having to be
explicitly requested.


When calling the API methods relating to
`Consumer`s, individual subscriptions are
always referred to by their consumer tags. A consumer tag is a consumer
identifier which can be either client- or server-generated. To let
RabbitMQ generate a node-wide unique tag, use a `Channel#basicConsume` override
that doesn't take a consumer tag argument or pass an empty string
for consumer tag and use the value returned by `Channel#basicConsume`.
Consumer tags are used to cancel consumers.

Distinct `Consumer` instances must have distinct
consumer tags. Duplicate consumer tags on a connection is
strongly discouraged and can lead to issues with [automatic
connection recovery](#connection-recovery) and confusing monitoring data when
consumers are monitored.

The easiest way to implement a `Consumer` is to
subclass the convenience class `DefaultConsumer`.
An object of this subclass can be passed on a `basicConsume`
call to set up the subscription:

```java
boolean autoAck = false;
channel.basicConsume(queueName, autoAck, "myConsumerTag",
     new DefaultConsumer(channel) {
         @Override
         public void handleDelivery(String consumerTag,
                                    Envelope envelope,
                                    AMQP.BasicProperties properties,
                                    byte[] body)
             throws IOException
         {
             String routingKey = envelope.getRoutingKey();
             String contentType = properties.getContentType();
             long deliveryTag = envelope.getDeliveryTag();
             <i>// (process the message components here ...)</i>
             channel.basicAck(deliveryTag, false);
         }
     });
```

Here, since we specified `autoAck = false`,
it is necessary to acknowledge messages delivered to the `Consumer`,
most conveniently done in the `handleDelivery`
method, as illustrated.

More sophisticated `Consumer`s will need to override further
methods.  In particular, `handleShutdownSignal`
is called when channels and connections close, and
`handleConsumeOk` is passed the consumer tag
before any other callbacks to that `Consumer` are called.

`Consumer`s can also implement the
`handleCancelOk` and `handleCancel`
methods to be notified of explicit and implicit cancellations,
respectively.

You can explicitly cancel a particular `Consumer` with
`Channel.basicCancel`:
```java
channel.basicCancel(consumerTag);
```

passing the consumer tag.

Just like with publishers, it is important to consider concurrency
hazard safety for consumers.

Callbacks to `Consumer`s are dispatched in a thread
pool separate from the thread that instantiated its
`Channel`.  This means that `Consumer`s
can safely call blocking methods on the
`Connection` or `Channel`, such as
`Channel#queueDeclare` or `Channel#basicCancel`.

Each `Channel` will dispatch all deliveries to its `Consumer` handler methods on it
in order they were sent by RabbitMQ.
Ordering of deliveries between channels is not guaranteed: those
deliveries can be dispatched in parallel.

For the most common use case of one `Consumer` per
`Channel`, this means `Consumer`s do
not hold up other `Consumer`s.
With multiple `Consumer`s per `Channel` be aware that
a long-running `Consumer` may hold up dispatch of
callbacks to other `Consumer`s on that
`Channel`.

Please refer to the [Concurrency Considerations](#concurrency) (Thread Safety)
section for other topics related to concurrency and
concurrency hazard safety.


## <a id="getting" class="anchor" href="#getting">Retrieving Individual Messages ("Pull API")</a>

It is also possible to retrieve individual messages on demand ("pull API" a.k.a. polling).
This approach to consumption is highly inefficient as it is effectively polling
and applications repeatedly have to ask for results even if the vast majority of the requests
yield no results. Therefore using this approach **is highly discouraged**.

To "pull" a message, use the `Channel.basicGet` method.  The returned value is an
instance of `GetResponse`, from which the header information (properties)
and message body can be extracted:

```java
boolean autoAck = false;
GetResponse response = channel.basicGet(queueName, autoAck);
if (response == null) {
    // No message retrieved.
} else {
    AMQP.BasicProperties props = response.getProps();
    byte[] body = response.getBody();
    long deliveryTag = response.getEnvelope().getDeliveryTag();
    // ...
```

and since this example uses [manual acknowledgements](./confirms) (the `autoAck = false` above),
you must also call `Channel.basicAck` to acknowledge that you have successfully received the message:

```java
// ...
channel.basicAck(method.deliveryTag, false); // acknowledge receipt of the message
}
```


## <a id="returning" class="anchor" href="#returning">Handling unroutable messages</a>

If a message is published with the "mandatory" flags set,
but cannot be routed, the broker will return it to the
sending client (via an `AMQP.Basic.Return`
command).

To be notified of such returns, clients can implement the `ReturnListener`
interface and call `Channel.addReturnListener`.
If the client has not configured a return listener for a particular channel,
then the associated returned messages will be silently dropped.

```java
channel.addReturnListener(new ReturnListener() {
    public void handleReturn(int replyCode,
                                  String replyText,
                                  String exchange,
                                  String routingKey,
                                  AMQP.BasicProperties properties,
                                  byte[] body)
    throws IOException {
        ...
    }
});
```

A return listener will be called, for example, if the client publishes a message with
the "mandatory" flag set to an exchange of "direct" type which is not bound to a queue.

## <a id="shutdown" class="anchor" href="#shutdown">Shutdown Protocol</a>
### <a id="shutdown-overview" class="anchor" href="#shutdown-overview">Overview of the Client Shutdown Process</a>

The AMQP 0-9-1 connection and channel share the same general
approach to managing network failure, internal failure,
and explicit local shutdown.


The AMQP 0-9-1 connection and channel have the following lifecycle states:

 * `open`: the object is ready to use
 * `closing`: the object has been explicitly
   notified to shut down locally, has issued a shutdown
   request to any supporting lower-layer objects, and is
   waiting for their shutdown procedures to complete

 * `closed`: the object has received all
   shutdown-complete notification(s) from any lower-layer
   objects, and as a consequence has shut itself down

Those objects always end up in the closed state,
regardless of the reason that caused the closure, like
an application request, an internal client library
failure, a remote network request or network failure.

The connection and channel objects possess the
following shutdown-related methods:

  * `addShutdownListener(ShutdownListener listener)` and

  * `removeShutdownListener(ShutdownListener listener)`, to manage any listeners, which will
    be fired when the object transitions to
    `closed` state. Note that, adding a
    ShutdownListener to an object that is already closed
    will fire the listener immediately

  * `getCloseReason()`, to allow the
    investigation of what was the reason of the object's
    shutdown

  * `isOpen()`, useful for testing whether the
    object is in an open state

  * `close(int closeCode, String closeMessage)`, to explicitly notify the object
    to shut down

Simple usage of listeners would look like:

```java
import com.rabbitmq.client.ShutdownSignalException;
import com.rabbitmq.client.ShutdownListener;

connection.addShutdownListener(new ShutdownListener() {
    public void shutdownCompleted(ShutdownSignalException cause)
    {
        ...
    }
});
```

### <a id="shutdown-cause" class="anchor" href="#shutdown-cause">Information about the circumstances of a shutdown</a>

One can retrieve the `ShutdownSignalException`, which contains all
the information available about the close reason, either
by explicitly calling the `getCloseReason()`
method or by using the `cause` parameter in
the `service(ShutdownSignalException cause)`
method of the `ShutdownListener` class.

The `ShutdownSignalException` class provides
methods to analyze the reason of the shutdown. By
calling the `isHardError()` method we get
information whether it was a connection or a channel
error, and `getReason()` returns information
about the cause, in the form an AMQP method - either
`AMQP.Channel.Close` or
`AMQP.Connection.Close` (or null if the cause
was some exception in the library, such as a network
communication failure, in which case that exception can
be retrieved with `getCause()`).

```java
public void shutdownCompleted(ShutdownSignalException cause)
{
  if (cause.isHardError())
  {
    Connection conn = (Connection)cause.getReference();
    if (!cause.isInitiatedByApplication())
    {
      Method reason = cause.getReason();
      ...
    }
    ...
  } else {
    Channel ch = (Channel)cause.getReference();
    ...
  }
}
```

### <a id="shutdown-atomicity" class="anchor" href="#shutdown-atomicity">Atomicity and use of the isOpen() method</a>

 Use of the `isOpen()` method of channel and
 connection objects is not recommended for production
 code, because the value returned by the method is
 dependent on the existence of the shutdown cause.  The
 following code illustrates the possibility of race
 conditions:

```java
public void brokenMethod(Channel channel)
{
    if (channel.isOpen())
    {
        // The following code depends on the channel being in open state.
        // However there is a possibility of the change in the channel state
        // between isOpen() and basicQos(1) call
        ...
        channel.basicQos(1);
    }
}
```

Instead, we should normally ignore such checking, and
simply attempt the action desired. If during the
execution of the code the channel of the connection is
closed, a `ShutdownSignalException` will be
thrown indicating that the object is in an invalid
state. We should also catch for `IOException`
caused either by `SocketException`, when
broker closes the connection unexpectedly, or
`ShutdownSignalException`, when broker
initiated clean close.

```java
public void validMethod(Channel channel)
{
    try {
        ...
        channel.basicQos(1);
    } catch (ShutdownSignalException sse) {
        // possibly check if channel was closed
        // by the time we started action and reasons for
        // closing it
        ...
    } catch (IOException ioe) {
        // check why connection was closed
        ...
    }
}
```


## <a id="advanced-connection" class="anchor" href="#advanced-connection">Advanced Connection options</a>

### <a id="consumer-thread-pool" class="anchor" href="#consumer-thread-pool">Consumer Operation Thread Pool</a>

`Consumer` threads (see [Receiving](#consuming) below) are
automatically allocated in a new `ExecutorService` thread pool
by default. If greater control is required supply an `ExecutorService` on the
`newConnection()` method, so that this pool of threads is
used instead. Here is an example where a larger thread pool is
supplied than is normally allocated:

```java
ExecutorService es = Executors.newFixedThreadPool(20);
Connection conn = factory.newConnection(es);
```

Both `Executors` and `ExecutorService` classes
are in the `java.util.concurrent` package.


When the connection is closed a default `ExecutorService`
will be `shutdown()`, but a user-supplied
`ExecutorService` (like `es` above) will
<i>not</i> be `shutdown()`.
Clients that supply a custom `ExecutorService` must ensure
it is shutdown eventually (by calling its `shutdown()`
method), or else the pool's threads may prevent JVM termination.


The same executor service may be shared between multiple connections,
or serially re-used on re-connection but it cannot be used after it is
`shutdown()`.


Use of this feature should only be considered if there is evidence
that there is a severe bottleneck in the processing of `Consumer`
callbacks.
If there are no `Consumer` callbacks executed, or very few, the default
allocation is more than sufficient. The overhead is initially minimal and
the total thread resources allocated are bounded, even if a burst of consumer
activity may occasionally occur.

### <a id="service-discovery-with-address-resolver" class="anchor" href="#service-discovery-with-address-resolver">Service discovery with the AddressResolver interface</a>

It is possible to use an implementation of `AddressResolver` to change the endpoint resolution algorithm
used at connection time:

```java
Connection conn = factory.newConnection(addressResolver);
```

The `AddressResolver` interface is like the following:

```java
public interface AddressResolver {

  List&lt;Address&gt; getAddresses() throws IOException;

}
```

Just like with [a list of endpoints](#endpoints-list),
the first `Address` returned will be tried first, then
the second if the client fails to connect to the first, and so on.

If an `ExecutorService` is provided as well (using the
form `factory.newConnection(es, addressResolver)`) the thread pool is
associated with the (first) successful connection.

The `AddressResolver` is the perfect place to implement
custom service discovery logic, which is especially useful in a dynamic
infrastructure. Combined with [automatic recovery](#recovery),
the client can automatically connect to nodes that weren't even up
when it was first started. Affinity and load balancing are other
scenarios where a custom `AddressResolver` could be useful.

The Java client ships with the following implementations
(see the javadoc for details):

 * `DnsRecordIpAddressResolver`: given the name
   of a host, returns its IP addresses (resolution against
   the platform DNS server). This can be useful for simple
   DNS-based load balancing or failover.

 * `DnsSrvRecordAddressResolver`: given the name
   of a service, returns hostname/port pairs. The search is
   implemented as a DNS SRV request. This can be useful
   when using a service registry like [HashiCorp Consul](https://www.consul.io/).

### <a id="heartbeats-timeout" class="anchor" href="#heartbeats-timeout">Heartbeat Timeout</a>

See the [Heartbeats guide](./heartbeats) for more information about heartbeats and how to configure them in the Java client.

### <a id="thread-factories" class="anchor" href="#thread-factories">Custom Thread Factories</a>

Environments such as Google App Engine (GAE) can <a
href="https://developers.google.com/appengine/docs/java/#Java_The_sandbox">restrict
direct thread instantiation</a>. To use RabbitMQ Java client in such environments,
it's necessary to configure a custom `ThreadFactory` that uses
an appropriate method to instantiate threads, e.g. GAE's `ThreadManager`.

Below is an example for Google App Engine.

```java
import com.google.appengine.api.ThreadManager;

ConnectionFactory cf = new ConnectionFactory();
cf.setThreadFactory(ThreadManager.backgroundThreadFactory());
```

### <a id="java-nio" class="anchor" href="#java-nio">Support for Java non-blocking IO</a>

Version 4.0 of the Java client brings support for Java non-blocking
IO (a.k.a Java NIO). NIO isn't supposed to be faster than blocking IO,
it simply allows to control resources (in this case, threads) more easily.

With the default blocking IO mode, each connection uses a thread to read
from the network socket. With the NIO mode, you can control the number of
threads that read and write from/to the network socket.

Use the NIO mode if your Java process uses many connections (dozens or hundreds).
You should use fewer threads than with the default blocking mode. With the
appropriate number of threads set, you shouldn't
experience any decrease in performance, especially if the connections are
not so busy.

NIO must be enabled explicitly:

```java
ConnectionFactory connectionFactory = new ConnectionFactory();
connectionFactory.useNio();
```

The NIO mode can be configured through the `NioParams` class:

```java
  connectionFactory.setNioParams(new NioParams().setNbIoThreads(4));
```

The NIO mode uses reasonable defaults, but you may need to change them according
to your own workload. Some of the settings are: the total number of IO
threads used, the size of buffers, a service executor to use for the IO loops,
parameters for the in-memory write queue (write requests are enqueued before
being sent on the network). Please read the Javadoc for details and defaults.


## <a id="recovery" class="anchor" href="#recovery">Automatic Recovery From Network Failures</a>
### <a id="connection-recovery" class="anchor" href="#connection-recovery">Connection Recovery</a>

Network connection between clients and RabbitMQ nodes can fail.
RabbitMQ Java client supports automatic recovery of connections
and topology (queues, exchanges, bindings, and consumers).

The automatic recovery process for many applications follows the following steps:

 * Reconnect
 * Restore connection listeners
 * Re-open channels
 * Restore channel listeners
 * Restore channel `basic.qos` setting, publisher confirms and transaction settings

Topology recovery includes the following actions, performed for every channel

 * Re-declare exchanges (except for predefined ones)
 * Re-declare queues
 * Recover all bindings
 * Recover all consumers

As of version 4.0.0 of the Java client, automatic recovery is enabled
by default (and thus topology recovery as well).

Topology recovery relies on a per-connection cache of entities (queues, exchanges,
bindings, consumers). When, say, a queue is declared on a connection, it will be added to the cache.
When it is deleted or is scheduled for deletion (e.g. because it is [auto-deleted](./queues))
it will be removed. This model has some limitations covered below.

To disable or enable automatic connection recovery, use
the `factory.setAutomaticRecoveryEnabled(boolean)`
method. The following snippet shows how to explicitly
enable automatic recovery (e.g. for Java client prior 4.0.0):

```java
ConnectionFactory factory = new ConnectionFactory();
factory.setUsername(userName);
factory.setPassword(password);
factory.setVirtualHost(virtualHost);
factory.setHost(hostName);
factory.setPort(portNumber);
factory.setAutomaticRecoveryEnabled(true);
// connection that will recover automatically
Connection conn = factory.newConnection();
```

If recovery fails due to an exception (e.g. RabbitMQ node is
still not reachable), it will be retried after a fixed time interval (default
is 5 seconds). The interval can be configured:

```java
ConnectionFactory factory = new ConnectionFactory();
// attempt recovery every 10 seconds
factory.setNetworkRecoveryInterval(10000);
```

When a list of addresses is provided, the list is shuffled and
all addresses are tried, one after the next:

```java
ConnectionFactory factory = new ConnectionFactory();

Address[] addresses = {new Address("192.168.1.4"), new Address("192.168.1.5")};
factory.newConnection(addresses);
```

### <a id="recovery-triggers" class="anchor" href="#recovery-triggers">When Will Connection Recovery Be Triggered?</a>

Automatic connection recovery, if enabled, will be triggered by the following events:

 * An I/O exception is thrown in connection's I/O loop
 * A socket read operation times out
 * Missed server [heartbeats](./heartbeats) are detected
 * Any other unexpected exception is thrown in connection's I/O loop

whichever happens first.

If initial client connection to a RabbitMQ node fails, automatic connection
recovery won't kick in. Applications developers are responsible for retrying
such connections, logging failed attempts, implementing a limit to the number
of retries and so on. Here's a very basic example:

```java
ConnectionFactory factory = new ConnectionFactory();
// configure various connection settings

try {
  Connection conn = factory.newConnection();
} catch (java.net.ConnectException e) {
  Thread.sleep(5000);
  // apply retry logic
}
```

When a connection is closed by the application via the `Connection.Close` method,
connection recovery will not be initiated.

Channel-level exceptions will not trigger any kind of recovery as they usually
indicate a semantic issue in the application (e.g. an attempt to consume from a
non-existent queue).

### <a id="recovery-listeners" class="anchor" href="#recovery-listeners">Recovery Listeners</a>

It is possible to register one or more recovery listeners on recoverable connections
and channels. When connection recovery is enabled, connections returned by
`ConnectionFactory#newConnection` and `Connection#createChannel`
implement `com.rabbitmq.client.Recoverable`, providing two methods with
fairly descriptive names:

 * `addRecoveryListener`
 * `removeRecoveryListener`

Note that you currently need to cast connections and channels to `Recoverable`
in order to use those methods.

### <a id="publishers" class="anchor" href="#publishers">Effects on Publishing</a>

Messages that are published using `Channel.basicPublish` when connection is down
will be lost. The client does not enqueue them for delivery after connection has recovered.
To ensure that published messages reach RabbitMQ applications need to use [Publisher Confirms](./confirms)
and account for connection failures.

### <a id="topology-recovery" class="anchor" href="#topology-recovery">Topology Recovery</a>

Topology recovery involves recovery of exchanges, queues, bindings
and consumers. It is enabled by default when automatic recovery is
enabled. Topology recovery is enabled by default in modern versions of the client.

Topology recovery can be disabled explicitly if needed:

```java
ConnectionFactory factory = new ConnectionFactory();

Connection conn = factory.newConnection();
// enable automatic recovery (e.g. Java client prior 4.0.0)
factory.setAutomaticRecoveryEnabled(true);
// disable topology recovery
factory.setTopologyRecoveryEnabled(false);
```

### <a id="automatic-recovery-limitations" class="anchor" href="#automatic-recovery-limitations">Failure Detection and Recovery Limitations</a>

Automatic connection recovery has a number of limitations and intentional
design decisions that applications developers need to be aware of.

Topology recovery relies on a per-connection cache of entities (queues, exchanges,
bindings, consumers). When, say, a queue is declared on a connection, it will be added to the cache.
When it is deleted or is scheduled for deletion (e.g. because it is [auto-deleted](./queues))
it will be removed. This makes it possible to declare and delete entities on different
channels without having unexpected results. It also means that consumer tags (a channel-specific identifier)
must be unique across all channels on connections that use automatic connection recovery.

When a connection is down or lost, it [takes time to detect](./heartbeats).
Therefore there is a window of time in which both the
library and the application are unaware of effective
connection failure.  Any messages published during this
time frame are serialised and written to the TCP socket
as usual. Their delivery to the broker can only be
guaranteed via [publisher
confirms](./confirms): publishing in AMQP 0-9-1 is entirely
asynchronous by design.

When a socket or I/O operation error is detected by a
connection with automatic recovery enabled, recovery
begins after a configurable delay, 5 seconds by
default. This design assumes that even though a lot of
network failures are transient and generally short
lived, they do not go away in an instant. Having a delay
also avoids an inherent race condition between server-side resource
cleanup (such as [exclusive or auto-delete queue](./queues) deletion)
and operations performed on a newly opened connection on the same resources.

Connection recovery attempts by default will continue at identical time intervals until
a new connection is successfully opened.
Recovery delay can be made dynamic by providing a `RecoveryDelayHandler`
implementation instance to `ConnectionFactory#setRecoveryDelayHandler`.
Implementations that use dynamically computed delay intervals should avoid
values that are too low (such as values that are lower than 2 seconds).

When a connection is in the recovering state, any
publishes attempted on its channels will be rejected
with an exception. The client currently does not perform
any internal buffering of such outgoing messages. It is
an application developer's responsibility to keep track of such
messages and republish them when recovery succeeds.
[Publisher confirms](./confirms) is a protocol extension
that should be used by publishers that cannot afford message loss.

Connection recovery will not kick in when a channel is closed due to a
channel-level exception. Such exceptions often indicate application-level
issues. The library cannot make an informed decision about when that's
the case.

Closed channels won't be recovered even after connection recovery kicks in.
This includes both explicitly closed channels and the channel-level exception
case above.

### <a id="recovery-and-acknowledgements" class="anchor" href="#recovery-and-acknowledgements">Manual Acknowledgements and Automatic Recovery</a>

When manual acknowledgements are used, it is possible that
network connection to RabbitMQ node fails between message
delivery and acknowledgement. After connection recovery,
RabbitMQ will reset delivery tags on all channels.

This means that <i>basic.ack</i>, <i>basic.nack</i>, and <i>basic.reject</i>
with old delivery tags will cause a channel exception. To avoid this,
RabbitMQ Java client keeps track of and updates delivery tags to make them monotonically
growing between recoveries.

`Channel.basicAck`,
`Channel.basicNack`, and
`Channel.basicReject` then translate adjusted
delivery tags into those used by RabbitMQ.

Acknowledgements with stale delivery tags will not be sent. Applications
that use manual acknowledgements and automatic recovery must
be capable of handling redeliveries.

### <a id="recovery-channel-lifecycle" class="anchor" href="#recovery-channel-lifecycle">Channels Lifecycle and Topology Recovery</a>

Automatic connection recovery is meant to be as transparent as possible
for the application developer, that's why `Channel` instances
remain the same even if several connections fail and recover behind the scenes.
Technically, when automatic recovery is on, `Channel` instances
act as proxies or decorators: they delegate the AMQP business to an
actual AMQP channel implementation and implement some recovery machinery around it.
That is why you shouldn't close a channel after it has created some resources
(queues, exchanges, bindings) or topology recovery for those resources
will fail later, as the channel has been closed. Instead, leave creating channels open
for the life of the application.


## <a id="unhandled-exceptions" class="anchor" href="#unhandled-exceptions">Unhandled Exceptions</a>

Unhandled exceptions related to connection, channel, recovery,
and consumer lifecycle are delegated to the exception
handler. Exception handler is any object that implements the
`ExceptionHandler` interface.  By default, an
instance of `DefaultExceptionHandler` is used. It
prints exception details to the standard output.

It is possible to override the handler using
`ConnectionFactory#setExceptionHandler`. It will be
used for all connections created by the factory:

```java
ConnectionFactory factory = new ConnectionFactory();
cf.setExceptionHandler(customHandler);
```

Exception handlers should be used for exception logging.


## <a id="metrics" class="anchor" href="#metrics">Metrics and Monitoring</a>

The client collects runtime metrics (e.g. number
of published messages) for active connections. Metric collection is optional feature that should be set up
at the `ConnectionFactory` level, using the `setMetricsCollector(metricsCollector)` method.
This method expects a `MetricsCollector` instance, which is
called in several places of the client code.

The client supports [Micrometer](http://micrometer.io), [Dropwizard Metrics](http://metrics.dropwizard.io) and [OpenTelemetry](https://opentelemetry.io/) out of the box.

Here are the collected metrics:

 * Number of open connections
 * Number of open channels
 * Number of published messages
 * Number of confirmed messages
 * Number of negatively acknowledged (nack-ed) outbound messages
 * Number of unroutable outbound messages that got returned
 * Number of failures of outbound messages
 * Number of consumed messages
 * Number of acknowledged messages
 * Number of rejected messages

Both Micrometer and Dropwizard Metrics provide counts, but also
mean rate, last five minute rate, etc, for messages-related
metrics. They also support common tools for monitoring and reporting
(JMX, Graphite, Ganglia, Datadog, etc). See the dedicated
sections below for more details.

Developers should keep a few things in mind when enabling metric collection.

 * Don't forget to add the appropriate dependencies (in Maven, Gradle, or even as JAR files) to JVM
   classpath when using Micrometer or Dropwizard Metrics.
   Those are optional dependencies and will not be pulled automatically with the Java client.
   You may also need to add other dependencies depending on the reporting
   backend(s) used.
 * Metrics collection is extensible. Implementing a custom
   `MetricsCollector` for specific needs is encouraged.
 * The `MetricsCollector` is set at the `ConnectionFactory`
   level but can be shared across different instances.
 * Metrics collection doesn't support transactions. E.g. if an acknowledgment
   is sent in a transaction and the transaction is then rolled back,
   the acknowledgment is counted in the client metrics (but not by the broker
   obviously). Note the acknowledgment is actually sent to the broker and
   then cancelled by the transaction rollback, so the client metrics
   are correct in term of acknowledgments sent. As a summary, don't use
   client metrics for critical business logic, they're not guaranteed
   to be perfectly accurate. They are meant to be used to simplify reasoning
   about a running system and make operations more efficient.

### <a id="metrics-micrometer" class="anchor" href="#metrics-micrometer">Micrometer support</a>

Metric collection has to be enabled first:

[Micrometer](http://micrometer.io) the following way:

```java
ConnectionFactory connectionFactory = new ConnectionFactory();
MicrometerMetricsCollector metrics = new MicrometerMetricsCollector();
connectionFactory.setMetricsCollector(metrics);
...
metrics.getPublishedMessages(); // get Micrometer's Counter object
```

Micrometer supports [several reporting backends](http://micrometer.io/docs):
Netflix Atlas, Prometheus, Datadog, Influx, JMX, etc.

You would typically pass in an instance of `MeterRegistry`
to the `MicrometerMetricsCollector`. Here is an example
with JMX:

```java
JmxMeterRegistry registry = new JmxMeterRegistry();
MicrometerMetricsCollector metrics = new MicrometerMetricsCollector(registry);
ConnectionFactory connectionFactory = new ConnectionFactory();
connectionFactory.setMetricsCollector(metrics);
```

### <a id="metrics-dropwizard-metrics" class="anchor" href="#metrics-dropwizard-metrics">Dropwizard Metrics support</a>

Enable metrics collection with [Dropwizard](http://metrics.dropwizard.io) like so:

```java
ConnectionFactory connectionFactory = new ConnectionFactory();
StandardMetricsCollector metrics = new StandardMetricsCollector();
connectionFactory.setMetricsCollector(metrics);
...
metrics.getPublishedMessages(); // get Metrics' Meter object
```

Dropwizard Metrics supports [several reporting backends](http://metrics.dropwizard.io/3.2.3/getting-started.html):
console, JMX, HTTP, Graphite, Ganglia, etc.

You would typically pass in an instance of `MetricsRegistry`
to the `StandardMetricsCollector`. Here is an example
with JMX:

```java
MetricRegistry registry = new MetricRegistry();
StandardMetricsCollector metrics = new StandardMetricsCollector(registry);

ConnectionFactory connectionFactory = new ConnectionFactory();
connectionFactory.setMetricsCollector(metrics);

JmxReporter reporter = JmxReporter
  .forRegistry(registry)
  .inDomain("com.rabbitmq.client.jmx")
  .build();
reporter.start();
```


## <a id="gae-pitfalls" class="anchor" href="#gae-pitfalls">RabbitMQ Java Client on Google App Engine</a>

Using RabbitMQ Java client on Google App Engine (GAE) requires using a custom
thread factory that instantiates thread using GAE's `ThreadManager` (see above).
In addition, it is necessary to set a low heartbeat interval (4-5 seconds) to avoid running
into the low `InputStream` read timeouts on GAE:

```java
ConnectionFactory factory = new ConnectionFactory();
cf.setRequestedHeartbeat(5);
```


## <a id="cache-pitfalls" class="anchor" href="#cache-pitfalls">Caveats and Limitations</a>

To make topology recovery possible, RabbitMQ Java client maintains a cache
of declared queues, exchanges, and bindings. The cache is per-connection. Certain
RabbitMQ features make it impossible for clients to observe some topology changes,
e.g. when a queue is deleted due to TTL. RabbitMQ Java client tries to invalidate
cache entries in the most common cases:

 * When a queue is deleted.
 * When an exchange is deleted.
 * When a binding is deleted.
 * When a consumer is cancelled on an auto-deleted queue.
 * When a queue or exchange is unbound from an auto-deleted exchange.

However, the client cannot track these topology changes beyond a single connection.
Applications that rely on auto-delete queues or exchanges, as well as queue TTL (note: not message TTL!),
and use [automatic connection recovery](#connection-recovery), should explicitly delete entities know to be unused
or deleted, to purge client-side topology cache. This is facilitated by `Channel#queueDelete`,
`Channel#exchangeDelete`, `Channel#queueUnbind`, and `Channel#exchangeUnbind`
being idempotent in RabbitMQ 3.3.x (deleting what's not there does not result in an exception).


## <a id="rpc" class="anchor" href="#rpc">The RPC (Request/Reply) Pattern: an Example</a>

As a programming convenience, the Java client API offers a
class `RpcClient` which uses a temporary reply
queue to provide simple [RPC-style communication](./tutorials/tutorial-six-java) facilities via AMQP 0-9-1.

The class doesn't impose any particular format on the RPC arguments and return values.
It simply provides a mechanism for sending a message to a given exchange with a particular
routing key, and waiting for a response on a reply queue.

```java
import com.rabbitmq.client.RpcClient;

RpcClient rpc = new RpcClient(channel, exchangeName, routingKey);
```

(The implementation details of how this class uses AMQP 0-9-1 are as follows: request messages are sent with the
`basic.correlation_id` field set to a value unique for this `RpcClient` instance,
and with `basic.reply_to` set to the name of the reply queue.)

Once you have created an instance of this class, you can use it to send RPC requests by using any of the following methods:

```java
byte[] primitiveCall(byte[] message);
String stringCall(String message)
Map mapCall(Map message)
Map mapCall(Object[] keyValuePairs)
```

The `primitiveCall` method transfers raw byte arrays as the request and response
bodies. The method `stringCall` is a thin
convenience wrapper around `primitiveCall`,
treating the message bodies as `String` instances
in the default character encoding.

The `mapCall` variants are a little more sophisticated: they encode
a `java.util.Map` containing ordinary Java values
into an AMQP 0-9-1 binary table representation, and decode the
response in the same way. (Note that there are some restrictions on what value
types can be used here - see the javadoc for details.)

All the marshalling/unmarshalling convenience methods use `primitiveCall` as a
transport mechanism, and just provide a wrapping layer on top of it.


## <a id="tls" class="anchor" href="#tls">TLS Support</a>

It's possible to encrypt the communication between the client and the broker
[using TLS](./ssl). Client and server authentication (a.k.a. peer verification) is also supported.
Here is the simplest, most naive way to use encryption with the Java client:

```java
ConnectionFactory factory = new ConnectionFactory();
factory.setHost("localhost");
factory.setPort(5671);

// Only suitable for development.
// This code will not perform peer certificate chain verification and prone
// to man-in-the-middle attacks.
// See the main TLS guide to learn about peer verification and how to enable it.
factory.useSslProtocol();
```

Note the client doesn't enforce any server authentication ([peer certificate chain verification](./ssl#peer-verification)) in the above
sample as the default, "trust all certificates" `TrustManager` is used.
This is convenient for local development but **prone to man-in-the-middle attacks**
and therefore [not recommended for production](./production-checklist).

To learn more about TLS support in RabbitMQ, see
the [TLS guide](./ssl). If you only want to configure
the Java client (especially the peer verification and trust manager parts),
read [the appropriate section](./ssl#java-client) of the TLS guide.

## <a id="oauth2-support" class="anchor" href="#oauth2-support">OAuth 2 Support</a>

The client can authenticate against an OAuth 2 server like [UAA](https://github.com/cloudfoundry/uaa).
The [OAuth 2 plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_backend_oauth2)
must be enabled on the server side and configured to use the same
OAuth 2 server as the client.

### <a id="oauth2-getting-token" class="anchor" href="#oauth2-getting-token">Getting the OAuth 2 Token</a>

The Java client provides the `OAuth2ClientCredentialsGrantCredentialsProvider`
class to get a JWT token using the [OAuth 2 Client Credentials flow](https://tools.ietf.org/html/rfc6749#section-4.4).
The client will send the JWT token in the password field when opening a connection.
The broker will then verify the JWT token signature, validity, and permissions
before authorising the connection and granting access to the requested
virtual host.

Prefer the use of `OAuth2ClientCredentialsGrantCredentialsProviderBuilder`
to create an `OAuth2ClientCredentialsGrantCredentialsProvider` instance and
then set it up on the `ConnectionFactory`. The
following snippet shows how to configure and create an instance of the OAuth 2 credentials provider
for the [example setup of the OAuth 2 plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_backend_oauth2#examples):


```java
import com.rabbitmq.client.impl.OAuth2ClientCredentialsGrantCredentialsProvider.
        OAuth2ClientCredentialsGrantCredentialsProviderBuilder;
...
CredentialsProvider credentialsProvider =
  new OAuth2ClientCredentialsGrantCredentialsProviderBuilder()
    .tokenEndpointUri("http://localhost:8080/uaa/oauth/token/")
    .clientId("rabbit_client").clientSecret("rabbit_secret")
    .grantType("password")
    .parameter("username", "rabbit_super")
    .parameter("password", "rabbit_super")
    .build();

connectionFactory.setCredentialsProvider(credentialsProvider);
```

In production, make sure to use HTTPS for the token endpoint URI and configure
the `SSLContext` if necessary for the HTTPS requests (to verify and trust
the identity of the OAuth 2 server). The following snippet does
so by using the `tls().sslContext()` method from
`OAuth2ClientCredentialsGrantCredentialsProviderBuilder`:

```java
SSLContext sslContext = ... // create and initialise SSLContext

CredentialsProvider credentialsProvider =
  new OAuth2ClientCredentialsGrantCredentialsProviderBuilder()
    .tokenEndpointUri("http://localhost:8080/uaa/oauth/token/")
    .clientId("rabbit_client").clientSecret("rabbit_secret")
    .grantType("password")
    .parameter("username", "rabbit_super")
    .parameter("password", "rabbit_super")
    .tls()                    // configure TLS
      .sslContext(sslContext) // set SSLContext
      .builder()              // back to main configuration
    .build();
```

Please consult the [Javadoc](https://rabbitmq.github.io/rabbitmq-java-client/api/current/com/rabbitmq/client/impl/OAuth2ClientCredentialsGrantCredentialsProvider.html)
to see all the available options.

### <a id="oauth2-refreshing-token" class="anchor" href="#oauth2-refreshing-token">Refreshing the Token</a>

Tokens expire and the broker will refuse operations on connections with
expired tokens. To avoid this, it is possible to call
`CredentialsProvider#refresh()` before expiration and send the new
token to the server. This is cumbersome
from an application point of view, so the Java client provides
help with the `DefaultCredentialsRefreshService`. This utility
tracks used tokens, refreshes them before they expire, and send
the new tokens for the connections it is responsible for.

The following snippet shows how to create a `DefaultCredentialsRefreshService`
instance and set it up on the `ConnectionFactory`:

```java
import com.rabbitmq.client.impl.DefaultCredentialsRefreshService.
        DefaultCredentialsRefreshServiceBuilder;
...
CredentialsRefreshService refreshService =
  new DefaultCredentialsRefreshServiceBuilder().build();
cf.setCredentialsRefreshService(refreshService);
```

The `DefaultCredentialsRefreshService` schedules a refresh after 80%
of the token validity time, e.g. if the token expires in 60 minutes,
it will be refreshed after 48 minutes. This is the default behaviour,
please consult the [Javadoc](https://rabbitmq.github.io/rabbitmq-java-client/api/current/com/rabbitmq/client/impl/DefaultCredentialsRefreshService.html)
for more information.
