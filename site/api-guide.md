<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

This guide covers [RabbitMQ Java client](/java-client.html) and its public API.
It assumes that the [most recent major version of the client](http://search.maven.org/#search%7Cga%7C1%7Ca%3A%22amqp-client%22) is used
and the reader is familiar with [the basics](/getstarted.html).

Key sections of the guide are:

 * [Connecting to RabbitMQ](#connecting)
 * [Connection and Channel Lifespan](#connection-and-channel-lifspan)
 * [Using Exchanges and Queues](#exchanges-and-queues)
 * [Publishing Messages](#publishing)
 * [Consuming Using a Subscription](#consuming)
 * [Concurrency Considerations and Safety](#concurrency)
 * [Automatic Recovery From Network Failures](#recovery)

5.x release series of this library require JDK 8, both for compilation and at runtime. On Android,
this means only [Android 7.0 or later](https://developer.android.com/guide/platform/j8-jack.html) versions are supported.

4.x release series support JDK 6 and Android versions prior to 7.0.

The library is open source, developed [on GitHub](https://github.com/rabbitmq/rabbitmq-java-client/), and is triple-licensed under

 * [Apache Public License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)
 * [Mozilla Public License](https://www.mozilla.org/MPL/1.1/)
 * [GPL 2.0](http://www.gnu.org/licenses/gpl-2.0.html)

This means that the user can consider the library to be licensed under any of the licenses from the list above.
For example, the user may choose the Apache Public License 2.0 and include this client into
a commercial product. Codebases that are licensed under the GPLv2 may choose GPLv2, and so on.

There are also [command line tools](java-tools.html)
that used to be shipped with the Java client.

The client API is closely modelled on the [AMQP 0-9-1 protocol model](/tutorials/amqp-concepts.html),
with additional abstractions for ease of use.

An [API reference](https://rabbitmq.github.io/rabbitmq-java-client/api/current/) (JavaDoc) is available separately.


## <a id="classoverview" class="anchor" href="#classoverview">Overview</a>

RabbitMQ Java client uses <code>com.rabbitmq.client</code> as its top-level package.
The key classes and interfaces are:

 * Channel: represents an AMQP 0-9-1 channel, and provides most of the operations (protocol methods).
 * Connection: represents an AMQP 0-9-1 connection
 * ConnectionFactory: constructs <code>Connection</code> instances
 * Consumer: represents a message consumer
 * DefaultConsumer: commonly used base class for consumers
 * BasicProperties: message properties (metadata)
 * BasicProperties.Builder: builder for <code>BasicProperties</code>

Protocol operations are available through the
<code>Channel</code> interface. <code>Connection</code> is
used to open channels, register connection lifecycle event
handlers, and close connections that are no longer needed.
<code>Connection</code>s are instantiated through <code>ConnectionFactory</code>,
which is how you configure various connection settings, such as the vhost or username.


## <a id="connections-and-channels" class="anchor" href="#connections-and-channels">Connections and Channels</a>

The core API classes are <code>Connection</code>
and <code>Channel</code>, representing an AMQP 0-9-1 connection and
channel, respectively. They are typically imported before used:

<pre class="lang-java">
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
</pre>

## <a id="connecting" class="anchor" href="#connecting">Connecting to RabbitMQ</a>

The following code connects to a RabbitMQ node using the given parameters (host name, port number, etc):

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
// "guest"/"guest" by default, limited to localhost connections
factory.setUsername(userName);
factory.setPassword(password);
factory.setVirtualHost(virtualHost);
factory.setHost(hostName);
factory.setPort(portNumber);

Connection conn = factory.newConnection();
</pre>

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
      <code>5671</code> for <a href="/ssl.html">connections that use TLS</a>
    </td>
  </tr>
</table>

Alternatively, [URIs](uri-spec.html) may be used:

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
factory.setUri("amqp://userName:password@hostName:portNumber/virtualHost");
Connection conn = factory.newConnection();
</pre>

All of these parameters have sensible defaults for a stock
RabbitMQ server running locally.

Note that [user guest can only connect from localhost](/access-control.html) by default.
This is to limit well-known credential use in production systems.

The <code>Connection</code> interface can then be used to open a channel:

<pre class="lang-java">
Channel channel = conn.createChannel();
</pre>

The channel can now be used to send and receive messages, as described in subsequent sections.

Successful and unsuccessful client connection events can be [observed in server node logs](/networking.html#logging).

## <a id="disconnecting" class="anchor" href="#disconnecting">Disconnecting from RabbitMQ</a>

To disconnect, simply close the channel and the connection:

<pre class="lang-java">
channel.close();
conn.close();</pre>

Note that closing the channel may be considered good practice, but is not strictly necessary here - it will be done
automatically anyway when the underlying connection is closed.

Client disconnection events can be [observed in server node logs](/networking.html#logging).

## <a id="connection-and-channel-lifspan" class="anchor" href="#connection-and-channel-lifspan">Connection and Channel Lifespan</a>

Client [connections](/connections.html) are meant to be long-lived. The underlying protocol is designed and optimized for
long running connections. That means that opening a new connection per operation,
e.g. a message published, is unnecessary and strongly discouraged as it will introduce a lot of
network roundtrips and overhead.

[Channels](/channels.html) are also meant to be long-lived but since many recoverable protocol errors will
result in channel closure, channel lifespan could be shorter than that of its connection.
Closing and opening new channels per operation is usually unnecessary but can be
appropriate. When in doubt, consider reusing channels first.

[Channel-level exceptions](/channels.html#error-handling) such as attempts to consume from a
queue that does not exist will result in channel closure. A closed channel can no
longer be used and will not receive any more events from the server (such
as message deliveries). Channel-level exceptions will be logged by RabbitMQ
and will initiate a shutdown sequence for the channel (see below).

## <a id="exchanges-and-queues" class="anchor" href="#exchanges-and-queues">Using Exchanges and Queues</a>

Client applications work with [exchanges] and [queues](/queues.html),
the high-level [building blocks of the protocol](/tutorials/amqp-concepts.html).
These must be declared before they can be used. Declaring either type of object
simply ensures that one of that name exists, creating it if necessary.

Continuing the previous example, the following code declares an exchange and a [server-named queue](/queues.html#server-named-queues),
then binds them together.

<pre class="lang-java">channel.exchangeDeclare(exchangeName, "direct", true);
String queueName = channel.queueDeclare().getQueue();
channel.queueBind(queueName, exchangeName, routingKey);</pre>

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

<pre class="lang-java">channel.exchangeDeclare(exchangeName, "direct", true);
channel.queueDeclare(queueName, true, false, false, null);
channel.queueBind(queueName, exchangeName, routingKey);</pre>

This will actively declare:

 * a durable, non-autodelete exchange of "direct" type
 * a durable, non-exclusive, non-autodelete queue with a well-known name

Many <code>Channel</code> API methods are overloaded.
These convenient short forms of <code>exchangeDeclare</code>, <code>queueDeclare</code> and <code>queueBind</code>
use sensible defaults. There are also longer forms with more parameters, to let you override these defaults
as necessary, giving full control where needed.

This "short form, long form" pattern is used throughout the client API uses.

### <a id="passive-declaration" class="anchor" href="#passive-declaration">Passive Declaration</a>

Queues and exchanges can be declared "passively". A passive declare simply checks that the entity
with the provided name exists. If it does, the operation is a no-op. For queues successful
passive declares will return the same information as non-passive ones, namely the number of
consumers and messages in [ready state](/confirms.html) in the queue.

If the entity does not exist, the operation fails with a channel level exception. The channel
cannot be used after that. A new channel should be opened. It is common to use one-off (temporary)
channels for passive declarations.

<code>Channel#queueDeclarePassive</code> and <code>Channel#exchangeDeclarePassive</code> are the
methods used for passive declaration. The following example demonstrates <code>Channel#queueDeclarePassive</code>:

<pre class="lang-java">
Queue.DeclareOk response = channel.queueDeclarePassive("queue-name");
// returns the number of messages in Ready state in the queue
response.getMessageCount();
// returns the number of consumers the queue has
response.getConsumerCount();
</pre>

<code>Channel#exchangeDeclarePassive</code>'s return value contains no useful information. Therefore
if the method returns and no channel exceptions occurs, it means that the exchange does exist.

### <a id="nowait-methods" class="anchor" href="#nowait-methods">Operations with Optional Responses</a>

Some common operations also have a "no wait" version which won't wait for server
response. For example, to declare a queue and instruct the server to not send any
response, use

<pre class="lang-java">channel.queueDeclareNoWait(queueName, true, false, false, null);</pre>

The "no wait" versions are more efficient but offer lower safety guarantees, e.g. they
are more dependent on the [heartbeat mechanism](/heartbeats.html) for detection of failed operations.
When in doubt, start with the standard version. The "no wait" versions are only needed in scenarios
with high topology (queue, binding) churn.

### <a id="deleting-entities" class="anchor" href="#deleting-entities">Deleting Entities and Purging Messages</a>

A queue or exchange can be explicitly deleted:

<pre class="lang-java">channel.queueDelete("queue-name")</pre>

It is possible to delete a queue only if it is empty:

<pre class="lang-java">channel.queueDelete("queue-name", false, true)</pre>

or if it is not used (does not have any consumers):

<pre class="lang-java">channel.queueDelete("queue-name", true, false)</pre>

A queue can be purged (all of its messages deleted):

<pre class="lang-java">channel.queuePurge("queue-name")</pre>


## <a id="publishing" class="anchor" href="#publishing">Publishing Messages</a>

To publish a message to an exchange, use <code>Channel.basicPublish</code> as follows:

<pre class="lang-java">
byte[] messageBodyBytes = "Hello, world!".getBytes();
channel.basicPublish(exchangeName, routingKey, null, messageBodyBytes);
</pre>

For fine control, use overloaded variants to specify the <code>mandatory</code> flag,
or send messages with pre-set message properties (see the [Publishers guide](/publishers.html) for details):

<pre class="lang-java">
channel.basicPublish(exchangeName, routingKey, mandatory,
                     MessageProperties.PERSISTENT_TEXT_PLAIN,
                     messageBodyBytes);
</pre>

This sends a message with delivery mode 2 (persistent), priority 1
and content-type "text/plain". Use the <code>Builder</code> class to build a
message properties object with as many properties as needed, for example:

<pre class="lang-java">
channel.basicPublish(exchangeName, routingKey,
             new AMQP.BasicProperties.Builder()
               .contentType("text/plain")
               .deliveryMode(2)
               .priority(1)
               .userId("bob")
               .build(),
               messageBodyBytes);</pre>

This example publishes a message with custom headers:

<pre class="lang-java">
Map&lt;String, Object&gt; headers = new HashMap&lt;String, Object&gt;();
headers.put("latitude",  51.5252949);
headers.put("longitude", -0.0905493);

channel.basicPublish(exchangeName, routingKey,
             new AMQP.BasicProperties.Builder()
               .headers(headers)
               .build(),
               messageBodyBytes);</pre>

This example publishes a message with expiration:

<pre class="lang-java">
channel.basicPublish(exchangeName, routingKey,
             new AMQP.BasicProperties.Builder()
               .expiration("60000")
               .build(),
               messageBodyBytes);</pre>

We have not illustrated all the possibilities here.

Note that <code>BasicProperties</code> is an inner class of the autogenerated
holder class <code>AMQP</code>.

Invocations of <code>Channel#basicPublish</code> will eventually block if a
[resource-driven alarm](http://www.rabbitmq.com/alarms.html) is in effect.


## <a id="concurrency" class="anchor" href="#concurrency">Channels and Concurrency Considerations (Thread Safety)</a>

As a rule of thumb, sharing <code>Channel</code> instances between
threads is something to be avoided. Applications
should prefer using a <code>Channel</code> per thread
instead of sharing the same <code>Channel</code> across
multiple threads.

While some operations on channels are safe to invoke
concurrently, some are not and will result in incorrect frame interleaving
on the wire, double acknowledgements and so on.

Concurrent publishing on a shared channel can result in
incorrect frame interleaving on the wire, triggering a
connection-level protocol exception and immediate connection closure by the broker.
It therefore requires explicit synchronization in application
code (<code>Channel#basicPublish</code> must be invoked in a
critical section). Sharing channels between threads will also
interfere with [Publisher
Confirms](confirms.html). Concurrent publishing on a shared channel is best avoided entirely,
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
ordering is preserved.  The dispatch mechanism uses a <a
href="https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/ExecutorService.html">java.util.concurrent.ExecutorService</a>,
one per connection.  It is possible to provide a custom
executor that will be shared by all connections produced by a
single <code>ConnectionFactory</code> using the
<code>ConnectionFactory#setSharedExecutor</code> setter.

When [manual acknowledgements](confirms.html) are used, it is important
to consider what thread does the acknowledgement. If it's different from the
thread that received the delivery (e.g. <code>Consumer#handleDelivery</code>
delegated delivery handling to a different thread), acknowledging
with the <code>multiple</code> parameter set to <code>true</code> is unsafe
and will result in double-acknowledgements, and therefore a channel-level protocol
exception that closes the channel. Acknowledging a single message at a time
can be safe.


## <a id="consuming" class="anchor" href="#consuming">Receiving Messages by Subscription ("Push API")</a>

<pre class="lang-java">
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
</pre>

The most efficient way to receive messages is to set up a
subscription using the <code>Consumer</code>
interface. The messages will then be delivered
automatically as they arrive, rather than having to be
explicitly requested.


When calling the API methods relating to
<code>Consumer</code>s, individual subscriptions are
always referred to by their consumer tags. A consumer tag is a consumer
identifier which can be either client- or server-generated. To let
RabbitMQ generate a node-wide unique tag, use a <code>Channel#basicConsume</code> override
that doesn't take a consumer tag argument or pass an empty string
for consumer tag and use the value returned by <code>Channel#basicConsume</code>.
Consumer tags are used to cancel consumers.

Distinct <code>Consumer</code> instances must have distinct
consumer tags. Duplicate consumer tags on a connection is
strongly discouraged and can lead to issues with [automatic
connection recovery](#connection-recovery) and confusing monitoring data when
consumers are monitored.

The easiest way to implement a <code>Consumer</code> is to
subclass the convenience class <code>DefaultConsumer</code>.
An object of this subclass can be passed on a <code>basicConsume</code>
call to set up the subscription:

<pre class="lang-java">
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
</pre>

Here, since we specified <code>autoAck = </code><code>false</code>,
it is necessary to acknowledge messages delivered to the <code>Consumer</code>,
most conveniently done in the <code>handleDelivery</code>
method, as illustrated.

More sophisticated <code>Consumer</code>s will need to override further
methods.  In particular, <code>handleShutdownSignal</code>
is called when channels and connections close, and
<code>handleConsumeOk</code> is passed the consumer tag
before any other callbacks to that <code>Consumer</code> are called.

<code>Consumer</code>s can also implement the
<code>handleCancelOk</code> and <code>handleCancel</code>
methods to be notified of explicit and implicit cancellations,
respectively.

You can explicitly cancel a particular <code>Consumer</code> with
<code>Channel.basicCancel</code>:
<pre class="lang-java">channel.basicCancel(consumerTag);</pre>

passing the consumer tag.

Just like with publishers, it is important to consider concurrency
hazard safety for consumers.

Callbacks to <code>Consumer</code>s are dispatched in a thread
pool separate from the thread that instantiated its
<code>Channel</code>.  This means that <code>Consumer</code>s
can safely call blocking methods on the
<code>Connection</code> or <code>Channel</code>, such as
<code>Channel#queueDeclare</code> or <code>Channel#basicCancel</code>.

Each <code>Channel</code> has its own dispatch thread. For the
most common use case of one <code>Consumer</code> per
<code>Channel</code>, this means <code>Consumer</code>s do
not hold up other <code>Consumer</code>s. If you have multiple
<code>Consumer</code>s per <code>Channel</code> be aware that
a long-running <code>Consumer</code> may hold up dispatch of
callbacks to other <code>Consumer</code>s on that
<code>Channel</code>.

Please refer to the Concurrency Considerations (Thread Safety)
section for other topics related to concurrency and
concurrency hazard safety.


## <a id="getting" class="anchor" href="#getting">Retrieving Individual Messages ("Pull API")</a>

To explicitly retrieve messages, use
<code>Channel.basicGet</code>.  The returned value is an
instance of <code>GetResponse</code>, from which the
header information (properties) and message body can be
extracted:

<pre class="lang-java">
boolean autoAck = false;
GetResponse response = channel.basicGet(queueName, autoAck);
if (response == null) {
    // No message retrieved.
} else {
    AMQP.BasicProperties props = response.getProps();
    byte[] body = response.getBody();
    long deliveryTag = response.getEnvelope().getDeliveryTag();
    // ...
</pre>

and since this example uses [manual acknowledgements](/confirms.html) (the <code>autoAck</code> = <code>false</code> above),
you must also call <code>Channel.basicAck</code> to acknowledge that you have successfully received the message:

<pre class="lang-java">
// ...
channel.basicAck(method.deliveryTag, false); // acknowledge receipt of the message
}
</pre>


## <a id="returning" class="anchor" href="#returning">Handling unroutable messages</a>

If a message is published with the "mandatory" flags set,
but cannot be routed, the broker will return it to the
sending client (via a <code>AMQP.Basic.Return</code>
command).

To be notified of such returns, clients can implement the <code>ReturnListener</code>
interface and call <code>Channel.addReturnListener</code>.
If the client has not configured a return listener for a particular channel,
then the associated returned messages will be silently dropped.

<pre class="lang-java">
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
});</pre>

A return listener will be called, for example, if the client publishes a message with
the "mandatory" flag set to an exchange of "direct" type which is not bound to a queue.

## <a id="shutdown" class="anchor" href="#shutdown">Shutdown Protocol</a>
### <a id="shutdown-overview" class="anchor" href="#shutdown-overview">Overview of the Client Shutdown Process</a>

The AMQP 0-9-1 connection and channel share the same general
approach to managing network failure, internal failure,
and explicit local shutdown.


The AMQP 0-9-1 connection and channel have the following lifecycle states:

 * <code>open</code>: the object is ready to use
 * <code>closing</code>: the object has been explicitly
   notified to shut down locally, has issued a shutdown
   request to any supporting lower-layer objects, and is
   waiting for their shutdown procedures to complete

 * <code>closed</code>: the object has received all
   shutdown-complete notification(s) from any lower-layer
   objects, and as a consequence has shut itself down

Those objects always end up in the closed state,
regardless of the reason that caused the closure, like
an application request, an internal client library
failure, a remote network request or network failure.

The connection and channel objects possess the
following shutdown-related methods:

  * <code>addShutdownListener(ShutdownListener listener)</code> and

  * <code>removeShutdownListener(ShutdownListener listener)</code>, to manage any listeners, which will
    be fired when the object transitions to
    <code>closed</code> state. Note that, adding a
    ShutdownListener to an object that is already closed
    will fire the listener immediately

  * <code>getCloseReason()</code>, to allow the
    investigation of what was the reason of the object's
    shutdown

  * <code>isOpen()</code>, useful for testing whether the
    object is in an open state

  * <code>close(int closeCode, String closeMessage)</code>, to explicitly notify the object
    to shut down

Simple usage of listeners would look like:

<pre class="lang-java">import com.rabbitmq.client.ShutdownSignalException;
import com.rabbitmq.client.ShutdownListener;

connection.addShutdownListener(new ShutdownListener() {
    public void shutdownCompleted(ShutdownSignalException cause)
    {
        ...
    }
});
</pre>

### <a id="shutdown-cause" class="anchor" href="#shutdown-cause">Information about the circumstances of a shutdown</a>

One can retrieve the <code>ShutdownSignalException</code>, which contains all
the information available about the close reason, either
by explicitly calling the <code>getCloseReason()</code>
method or by using the <code>cause</code> parameter in
the <code>service(ShutdownSignalException cause)</code>
method of the <code>ShutdownListener</code> class.

The <code>ShutdownSignalException</code> class provides
methods to analyze the reason of the shutdown. By
calling the <code>isHardError()</code> method we get
information whether it was a connection or a channel
error, and <code>getReason()</code> returns information
about the cause, in the form an AMQP method - either
<code>AMQP.Channel.Close</code> or
<code>AMQP.Connection.Close</code> (or null if the cause
was some exception in the library, such as a network
communication failure, in which case that exception can
be retrieved with <code>getCause()</code>).

<pre class="lang-java">public void shutdownCompleted(ShutdownSignalException cause)
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
}</pre>

### <a id="shutdown-atomicity" class="anchor" href="#shutdown-atomicity">Atomicity and use of the isOpen() method</a>

 Use of the <code>isOpen()</code> method of channel and
 connection objects is not recommended for production
 code, because the value returned by the method is
 dependent on the existence of the shutdown cause.  The
 following code illustrates the possibility of race
 conditions:

<pre class="lang-java">public void brokenMethod(Channel channel)
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
</pre>

Instead, we should normally ignore such checking, and
simply attempt the action desired. If during the
execution of the code the channel of the connection is
closed, a <code>ShutdownSignalException</code> will be
thrown indicating that the object is in an invalid
state. We should also catch for <code>IOException</code>
caused either by <code>SocketException</code>, when
broker closes the connection unexpectedly, or
<code>ShutdownSignalException</code>, when broker
initiated clean close.

<pre class="lang-java">
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
</pre>


## <a id="advanced-connection" class="anchor" href="#advanced-connection">Advanced Connection options</a>

### <a id="consumer-thread-pool" class="anchor" href="#consumer-thread-pool">Consumer Operation Thread Pool</a>

<code>Consumer</code> threads (see [Receiving](#consuming) below) are
automatically allocated in a new <code>ExecutorService</code> thread pool
by default. If greater control is required supply an <code>ExecutorService</code> on the
<code>newConnection()</code> method, so that this pool of threads is
used instead. Here is an example where a larger thread pool is
supplied than is normally allocated:

<pre class="lang-java">
ExecutorService es = Executors.newFixedThreadPool(20);
Connection conn = factory.newConnection(es);
</pre>

Both <code>Executors</code> and <code>ExecutorService</code> classes
are in the <code>java.util.concurrent</code> package.


When the connection is closed a default <code>ExecutorService</code>
will be <code>shutdown()</code>, but a user-supplied
<code>ExecutorService</code> (like <code>es</code> above) will
<i>not</i> be <code>shutdown()</code>.
Clients that supply a custom <code>ExecutorService</code> must ensure
it is shutdown eventually (by calling its <code>shutdown()</code>
method), or else the pool's threads may prevent JVM termination.


The same executor service may be shared between multiple connections,
or serially re-used on re-connection but it cannot be used after it is
<code>shutdown()</code>.


Use of this feature should only be considered if there is evidence
that there is a severe bottleneck in the processing of <code>Consumer</code>
callbacks.
If there are no <code>Consumer</code> callbacks executed, or very few, the default
allocation is more than sufficient. The overhead is initially minimal and
the total thread resources allocated are bounded, even if a burst of consumer
activity may occasionally occur.

### <a id="address-array" class="anchor" href="#address-array">Using Lists of Hosts</a>

It is possible to pass an <code>Address</code> array
to <code>newConnection()</code>.
An <code>Address</code> is simply a convenience class
in the <code>com.rabbitmq.client</code> package with <i>host</i>
and <i>port</i> components.

For example:

<pre class="lang-java">
Address[] addrArr = new Address[]{ new Address(hostname1, portnumber1)
                                 , new Address(hostname2, portnumber2)};
Connection conn = factory.newConnection(addrArr);
</pre>

will attempt to connect to <code>hostname1:portnumber1</code>, and if
that fails to <code>hostname2:portnumber2</code>. The connection returned is
the first in the array that succeeds (without throwing
<code>IOException</code>). This is entirely equivalent to repeatedly
setting host and port on a factory, calling
<code>factory.newConnection()</code> each time, until one of them succeeds.

If an <code>ExecutorService</code> is provided as well (using the
form <code>factory.newConnection(es, addrArr)</code>) the thread pool is
associated with the (first) successful connection.

If you want more control over the host to connect to, see
[the support for service discovery](#service-discovery-with-address-resolver).

### <a id="service-discovery-with-address-resolver" class="anchor" href="#service-discovery-with-address-resolver">Service discovery with the AddressResolver interface</a>

It is possible to use an implementation of <code>AddressResolver</code> to change the endpoint resolution algorithm
used at connection time:

<pre class="lang-java">
Connection conn = factory.newConnection(addressResolver);
</pre>

The <code>AddressResolver</code> interface is like the following:

<pre class="lang-java">
public interface AddressResolver {

  List&lt;Address&gt; getAddresses() throws IOException;

}
</pre>

Just like with [a list of hosts](#address-array),
the first <code>Address</code> returned will be tried first, then
the second if the client fails to connect to the first, and so on.

If an <code>ExecutorService</code> is provided as well (using the
form <code>factory.newConnection(es, addressResolver)</code>) the thread pool is
associated with the (first) successful connection.

The <code>AddressResolver</code> is the perfect place to implement
custom service discovery logic, which is especially useful in a dynamic
infrastructure. Combined with [automatic recovery](#recovery),
the client can automatically connect to nodes that weren't even up
when it was first started. Affinity and load balancing are other
scenarios where a custom <code>AddressResolver</code> could be useful.

The Java client ships with the following implementations
(see the javadoc for details):

 * <code>DnsRecordIpAddressResolver</code>: given the name
   of a host, returns its IP addresses (resolution against
   the platform DNS server). This can be useful for simple
   DNS-based load balancing or failover.

 * <code>DnsSrvRecordAddressResolver</code>: given the name
   of a service, returns hostname/port pairs. The search is
   implemented as a DNS SRV request. This can be useful
   when using a service registry like [HashiCorp Consul](https://www.consul.io/).

### <a id="heartbeats-timeout" class="anchor" href="#heartbeats-timeout">Heartbeat Timeout</a>

See the [Heartbeats guide](heartbeats.html) for more information about heartbeats and how to configure them in the Java client.

### <a id="thread-factories" class="anchor" href="#thread-factories">Custom Thread Factories</a>

Environments such as Google App Engine (GAE) can <a
href="https://developers.google.com/appengine/docs/java/#Java_The_sandbox">restrict
direct thread instantiation</a>. To use RabbitMQ Java client in such environments,
it's necessary to configure a custom <code>ThreadFactory</code> that uses
an appropriate method to instantiate threads, e.g. GAE's <code>ThreadManager</code>.

Below is an example for Google App Engine.

<pre class="lang-java">
import com.google.appengine.api.ThreadManager;

ConnectionFactory cf = new ConnectionFactory();
cf.setThreadFactory(ThreadManager.backgroundThreadFactory());
</pre>

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
experiment any decrease in performance, especially if the connections are
not so busy.

NIO must be enabled explicitly:

<pre class="lang-java">
ConnectionFactory connectionFactory = new ConnectionFactory();
connectionFactory.useNio();
</pre>

The NIO mode can be configured through the <code>NioParams</code> class:

<pre class="lang-java">
  connectionFactory.setNioParams(new NioParams().setNbIoThreads(4));
</pre>

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
 * Restore channel <code>basic.qos</code> setting, publisher confirms and transaction settings

Topology recovery includes the following actions, performed for every channel

 * Re-declare exchanges (except for predefined ones)
 * Re-declare queues
 * Recover all bindings
 * Recover all consumers

As of version 4.0.0 of the Java client, automatic recovery is enabled
by default (and thus topology recovery as well).

Topology recovery relies on a per-connection cache of entities (queues, exchanges,
bindings, consumers). When, say, a queue is declared on a connection, it will be added to the cache.
When it is deleted or is scheduled for deletion (e.g. because it is [auto-deleted](/queues.html))
it will be removed. This model has some limitations covered below.

To disable or enable automatic connection recovery, use
the <code>factory.setAutomaticRecoveryEnabled(boolean)</code>
method. The following snippet shows how to explicitly
enable automatic recovery (e.g. for Java client prior 4.0.0):

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
factory.setUsername(userName);
factory.setPassword(password);
factory.setVirtualHost(virtualHost);
factory.setHost(hostName);
factory.setPort(portNumber);
factory.setAutomaticRecoveryEnabled(true);
// connection that will recover automatically
Connection conn = factory.newConnection();</pre>

If recovery fails due to an exception (e.g. RabbitMQ node is
still not reachable), it will be retried after a fixed time interval (default
is 5 seconds). The interval can be configured:

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
// attempt recovery every 10 seconds
factory.setNetworkRecoveryInterval(10000);</pre>

When a list of addresses is provided, the list is shuffled and
all addresses are tried, one after the next:

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();

Address[] addresses = {new Address("192.168.1.4"), new Address("192.168.1.5")};
factory.newConnection(addresses);</pre>

### <a id="recovery-triggers" class="anchor" href="#recovery-triggers">When Will Connection Recovery Be Triggered?</a>

Automatic connection recovery, if enabled, will be triggered by the following events:

 * An I/O exception is thrown in connection's I/O loop
 * A socket read operation times out
 * Missed server [heartbeats](/heartbeats.html) are detected
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
  Connection conn = factory.newConnection();
} catch (java.net.ConnectException e) {
  Thread.sleep(5000);
  // apply retry logic
}
</pre>

When a connection is closed by the application via the <code>Connection.Close</code> method,
connection recovery will not be initiated.

Channel-level exceptions will not trigger any kind of recovery as they usually
indicate a semantic issue in the application (e.g. an attempt to consume from a
non-existent queue).

### <a id="recovery-listeners" class="anchor" href="#recovery-listeners">Recovery Listeners</a>

It is possible to register one or more recovery listeners on recoverable connections
and channels. When connection recovery is enabled, connections returned by
<code>ConnectionFactory#newConnection</code> and <code>Connection#createChannel</code>
implement <code>com.rabbitmq.client.Recoverable</code>, providing two methods with
fairly descriptive names:

 * `addRecoveryListener`
 * `removeRecoveryListener`

Note that you currently need to cast connections and channels to <code>Recoverable</code>
in order to use those methods.

### <a id="publishers" class="anchor" href="#publishers">Effects on Publishing</a>

Messages that are published using <code>Channel.basicPublish</code> when connection is down
will be lost. The client does not enqueue them for delivery after connection has recovered.
To ensure that published messages reach RabbitMQ applications need to use [Publisher Confirms](confirms.html)
and account for connection failures.

### <a id="topology-recovery" class="anchor" href="#topology-recovery">Topology Recovery</a>

Topology recovery involves recovery of exchanges, queues, bindings
and consumers. It is enabled by default when automatic recovery is
enabled. Topology recovery is enabled by default in modern versions of the client.

Topology recovery can be disabled explicitly if needed:

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();

Connection conn = factory.newConnection();
// enable automatic recovery (e.g. Java client prior 4.0.0)
factory.setAutomaticRecoveryEnabled(true);
// disable topology recovery
factory.setTopologyRecoveryEnabled(false);
</pre>

### <a id="automatic-recovery-limitations" class="anchor" href="#automatic-recovery-limitations">Failure Detection and Recovery Limitations</a>

Automatic connection recovery has a number of limitations and intentional
design decisions that applications developers need to be aware of.

Topology recovery relies on a per-connection cache of entities (queues, exchanges,
bindings, consumers). When, say, a queue is declared on a connection, it will be added to the cache.
When it is deleted or is scheduled for deletion (e.g. because it is [auto-deleted](/queues.html))
it will be removed. This makes it possible to declare and delete entities on different
channels without having unexpected results. It also means that consumer tags (a channel-specific identifier)
must be unique across all channels on connections that use automatic connection recovery.

When a connection is down or lost, it [takes time to detect](/heartbeats.html).
Therefore there is a window of time in which both the
library and the application are unaware of effective
connection failure.  Any messages published during this
time frame are serialised and written to the TCP socket
as usual. Their delivery to the broker can only be
guaranteed via [publisher
confirms](/confirms.html): publishing in AMQP 0-9-1 is entirely
asynchronous by design.

When a socket or I/O operation error is detected by a
connection with automatic recovery enabled, recovery
begins after a configurable delay, 5 seconds by
default. This design assumes that even though a lot of
network failures are transient and generally short
lived, they do not go away in an instant. Having a delay
also avoids an inherent race conditon between server-side resource
cleanup (such as [exclusive or auto-delete queue](/queues.html) deletion)
and operations performed on a newly opened connection on the same resources.

Connection recovery attempts by default will continue at identical time intervals until
a new connection is successfully opened.
Recovery delay can be made dynamic by providing a <code>RecoveryDelayHandler</code>
implementation instance to <code>ConnectionFactory#setRecoveryDelayHandler</code>.
Implementations that use dynamically computed delay intervals should avoid
values that are too low (as a rule of thumb, lower than 2 seconds).

When a connection is in the recovering state, any
publishes attempted on its channels will be rejected
with an exception. The client currently does not perform
any internal buffering of such outgoing messages. It is
an application developer's responsibility to keep track of such
messages and republish them when recovery succeeds.
[Publisher confirms](/confirms.html) is a protocol extension
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

<code>Channel.basicAck</code>,
<code>Channel.basicNack</code>, and
<code>Channel.basicReject</code> then translate adjusted
delivery tags into those used by RabbitMQ.

Acknowledgements with stale delivery tags will not be sent. Applications
that use manual acknowledgements and automatic recovery must
be capable of handling redeliveries.

### <a id="recovery-channel-lifecycle" class="anchor" href="#recovery-channel-lifecycle">Channels Lifecycle and Topology Recovery</a>

Automatic connection recovery is meant to be as transparent as possible
for the application developer, that's why <code>Channel</code> instances
remain the same even if several connections fail and recover behind the scenes.
Technically, when automatic recovery is on, <code>Channel</code> instances
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
<code>ExceptionHandler</code> interface.  By default, an
instance of <code>DefaultExceptionHandler</code> is used. It
prints exception details to the standard output.

It is possible to override the handler using
<code>ConnectionFactory#setExceptionHandler</code>. It will be
used for all connections created by the factory:

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
cf.setExceptionHandler(customHandler);
</pre>

Exception handlers should be used for exception logging.


## <a id="metrics" class="anchor" href="#metrics">Metrics and monitoring</a>

As of version 4.0.0, the client gathers runtime metrics (e.g. number
of published messages). Metrics collection is optional and is set up
at the <code>ConnectionFactory</code> level, using the
<code>setMetricsCollector(metricsCollector)</code> method.
This method expects a <code>MetricsCollector</code> instance, which is
called in several places of the client code.

The client supports
[Micrometer](http://micrometer.io) (as of version 4.3) and
[Dropwizard Metrics](http://metrics.dropwizard.io)
out of the box.

Here are the collected metrics:

 * Number of open connections
 * Number of open channels
 * Number of published messages
 * Number of consumed messages
 * Number of acknowledged messages
 * Number of rejected messages

Both Micrometer and Dropwizard Metrics provide counts, but also
mean rate, last five minute rate, etc, for messages-related
metrics. They also support common tools for monitoring and reporting
(JMX, Graphite, Ganglia, Datadog, etc). See the dedicated
sections below for more details.

Please note the following about metrics collection:

 * Don't forget to add the appropriate dependencies (in Maven, Gradle, or even as JAR files) to JVM
   classpath when using Micrometer or Dropwizard Metrics.
   Those are optional dependencies and will not be pulled automatically with the Java client.
   You may also need to add other dependencies depending on the reporting
   backend(s) used.

 * Metrics collection is extensible. Implementing a custom
   <code>MetricsCollector</code> for specific needs is encouraged.

 * The <code>MetricsCollector</code> is set at the <code>ConnectionFactory</code>
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

<pre class="lang-java">
ConnectionFactory connectionFactory = new ConnectionFactory();
MicrometerMetricsCollector metrics = new MicrometerMetricsCollector();
connectionFactory.setMetricsCollector(metrics);
...
metrics.getPublishedMessages(); // get Micrometer's Counter object
</pre>

Micrometer supports [several reporting backends](http://micrometer.io/docs):
Netflix Atlas, Prometheus, Datadog, Influx, JMX, etc.

You would typically pass in an instance of <code>MeterRegistry</code>
to the <code>MicrometerMetricsCollector</code>. Here is an example
with JMX:

<pre class="lang-java">
JmxMeterRegistry registry = new JmxMeterRegistry();
MicrometerMetricsCollector metrics = new MicrometerMetricsCollector(registry);
ConnectionFactory connectionFactory = new ConnectionFactory();
connectionFactory.setMetricsCollector(metrics);
</pre>

### <a id="metrics-dropwizard-metrics" class="anchor" href="#metrics-dropwizard-metrics">Dropwizard Metrics support</a>

Enable metrics collection with [Dropwizard](http://metrics.dropwizard.io) like so:

<pre class="lang-java">
ConnectionFactory connectionFactory = new ConnectionFactory();
StandardMetricsCollector metrics = new StandardMetricsCollector();
connectionFactory.setMetricsCollector(metrics);
...
metrics.getPublishedMessages(); // get Metrics' Meter object
</pre>

Dropwizard Metrics supports [several reporting backends](http://metrics.dropwizard.io/3.2.3/getting-started.html):
console, JMX, HTTP, Graphite, Ganglia, etc.

You would typically pass in an instance of <code>MetricsRegistry</code>
to the <code>StandardMetricsCollector</code>. Here is an example
with JMX:

<pre class="lang-java">
MetricRegistry registry = new MetricRegistry();
StandardMetricsCollector metrics = new StandardMetricsCollector(registry);

ConnectionFactory connectionFactory = new ConnectionFactory();
connectionFactory.setMetricsCollector(metrics);

JmxReporter reporter = JmxReporter
  .forRegistry(registry)
  .inDomain("com.rabbitmq.client.jmx")
  .build();
reporter.start();
</pre>


## <a id="gae-pitfalls" class="anchor" href="#gae-pitfalls">RabbitMQ Java Client on Google App Engine</a>

Using RabbitMQ Java client on Google App Engine (GAE) requires using a custom
thread factory that instantiates thread using GAE's <code>ThreadManager</code> (see above).
In addition, it is necessary to set a low heartbeat interval (4-5 seconds) to avoid running
into the low <code>InputStream</code> read timeouts on GAE:

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
cf.setRequestedHeartbeat(5);
</pre>


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
or deleted, to purge client-side topology cache. This is facilitated by <code>Channel#queueDelete</code>,
<code>Channel#exchangeDelete</code>, <code>Channel#queueUnbind</code>, and <code>Channel#exchangeUnbind</code>
being idempotent in RabbitMQ 3.3.x (deleting what's not there does not result in an exception).


## <a id="rpc" class="anchor" href="#rpc">The RPC (Request/Reply) Pattern: an Example</a>

As a programming convenience, the Java client API offers a
class <code>RpcClient</code> which uses a temporary reply
queue to provide simple [RPC-style communication](/tutorials/tutorial-six-java.html) facilities via AMQP 0-9-1.

The class doesn't impose any particular format on the RPC arguments and return values.
It simply provides a mechanism for sending a message to a given exchange with a particular
routing key, and waiting for a response on a reply queue.

<pre class="lang-java">
import com.rabbitmq.client.RpcClient;

RpcClient rpc = new RpcClient(channel, exchangeName, routingKey);</pre>

(The implementation details of how this class uses AMQP 0-9-1 are as follows: request messages are sent with the
<code>basic.correlation_id</code> field set to a value unique for this <code>RpcClient</code> instance,
and with <code>basic.reply_to</code> set to the name of the reply queue.)

Once you have created an instance of this class, you can use it to send RPC requests by using any of the following methods:

<pre class="lang-java">
byte[] primitiveCall(byte[] message);
String stringCall(String message)
Map mapCall(Map message)
Map mapCall(Object[] keyValuePairs)
</pre>

The <code>primitiveCall</code> method transfers raw byte arrays as the request and response
bodies. The method <code>stringCall</code> is a thin
convenience wrapper around <code>primitiveCall</code>,
treating the message bodies as <code>String</code> instances
in the default character encoding.

The <code>mapCall</code> variants are a little more sophisticated: they encode
a <code>java.util.Map</code> containing ordinary Java values
into an AMQP 0-9-1 binary table representation, and decode the
response in the same way. (Note that there are some restrictions on what value
types can be used here - see the javadoc for details.)

All the marshalling/unmarshalling convenience methods use <code>primitiveCall</code> as a
transport mechanism, and just provide a wrapping layer on top of it.


## <a id="tls" class="anchor" href="#tls">TLS Support</a>

It's possible to encrypt the communication between the client and the broker
[using TLS](/ssl.html). Client and server authentication (a.k.a. peer verification) is also supported.
Here is the simplest way to use encryption with the Java client:

<pre class="sourcecode">
ConnectionFactory factory = new ConnectionFactory();
factory.setHost("localhost");
factory.setPort(5671);

factory.useSslProtocol();
</pre>

Note the client doesn't enforce any server authentication (peer certificate chain verification) in the above
sample as the default, "trust all certificates" <code>TrustManager</code> is used.
This is convenient for local development but prone to man-in-the-middle attacks
and therefore not recommended for production.

To learn more about TLS support in RabbitMQ, see
the [TLS guide](ssl.html). If you only want to configure
the Java client (especially the peer verification and trust manager parts),
read [the appropriate section](ssl.html#java-client) of the TLS guide.
