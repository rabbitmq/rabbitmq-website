<!--
Copyright (c) 2007-2016 Pivotal Software, Inc.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Introduction

RabbitMQ JMS Client is a client library for Pivotal RabbitMQ.
Pivotal RabbitMQ is not a JMS provider but has features needed to support 
the JMS Queue and Topic messaging models. JMS Client for RabbitMQ 
implements the JMS 1.1 specification on top of the RabbitMQ Java client 
API, thus allowing new and existing JMS applications to connect with 
RabbitMQ brokers through Advanced Message Queueing Protocol (AMQP).

## Components

To fully leverage JMS with RabbitMQ, you need the following components:

 * the JMS Client library itself and its dependent libraries. Please visit
 the [JMS client Git repository](https://github.com/rabbitmq/rabbitmq-jms-client)
 to see how to include the library into your project with tools like Maven.
 * RabbitMQ JMS topic selector plugin. To support message selectors for JMS 
 topics, the RabbitMQ Topic Selector plugin must be installed on the 
 RabbitMQ server. Message selectors allow a JMS application to filter 
 messages using an expression based on SQL syntax. Message selectors 
 for Queues are not currently supported.

## JMS and AMQP

JMS is the standard messaging service for the Java Extended Edition (JEE) 
platform. It is available in commercial and open source implementations. 
Each implementation includes a JMS provider, a JMS client library, and additional, 
implementation-specific components for administering the messaging 
system. The JMS provider can be a standalone implementation of the 
messaging service, or a bridge to a non-JMS messaging system.

The JMS client API is standardized, so JMS applications are portable 
between vendors’ implementations. However, the underlying messaging implementation is unspecified, so there is no interoperability between JMS implementations. Java applications that want to share messaging must all use the same JMS implementation unless bridging technology exists. Furthermore, non-Java applications cannot access JMS without a vendor-specific JMS client library to enable interoperability.

AMQP is a messaging protocol, rather than an API like JMS. Any client 
that implements the protocol can access any AMQP broker. Protocol-level interoperability allows AMQP clients written in any programming language and running on any operating system to participate in the messaging system with no need to bridge incompatible vendor implementations.

Because JMS Client for RabbitMQ is implemented using the RabbitMQ Java 
client, it is compliant with both the JMS API and the AMQP protocol.

You can download the JMS 1.1 specification and API documentation from 
the [Oracle Technology Network Web site](http://www.oracle.com/technetwork/java/docs-136352.html).

## Limitations

Some JMS features are unsupported in the JMS Client:

 * The JMS Client does not support server sessions.
 * XA transaction support interfaces are not implemented.
 * Topic selectors are supported with the RabbitMQ JMS topic selector 
 plugin. Queue selectors are not yet implemented.
 * SSL and socket options for RabbitMQ connections are supported, but 
 only using the (default) SSL connection protocols that the RabbitMQ client provides.
 * The JMS `NoLocal` subscription feature, which prevents delivery of 
 messages published from a subscriber’s own connection, is not supported 
 with RabbitMQ. You can call a method that includes the `NoLocal` 
 argument, but it is ignored.

See [the JMS API compliance documentation](jms-client-api-compliance.html) for a 
detailed list of supported JMS APIs.

## Installing and Configuring

### Enabling the Topic Selector Plug-in

The topic selector plug-in is included with RabbitMQ. Like any RabbitMQ 
plugin, you need to enable the plug-in in order to use it.

 1.Enable the plug-in using the rabbitmq-plugins command:

    :::bash
    $ rabbitmq-plugins enable rabbitmq_jms_topic_exchange

 2.Restart the RabbitMQ server to activate the plug-in.

### Enabling the JMS client in a Java container

To enable the JMS Client in a Java container (e.g. Java EE application 
server, web container), you must install the JMS client JAR files and 
its dependencies in the container and then define JMS resources in 
the container’s naming system so that JMS clients can look them up. 
The methods for accomplishing these tasks are container-specific, please 
refer to the vendors’ documentation.

For standalone applications, you need to add the JMS client JAR files 
and its dependencies to the application classpath. The JMS resources 
can be defined programmatically or through a dependency injection 
framework like Spring.

### Defining the JMS Connection Factory

To define the JMS `ConnectionFactory` in JNDI, e.g. in Tomcat:

    :::xml
    <Resource   name="jms/ConnectionFactory"
                type="javax.jms.ConnectionFactory"
             factory="com.rabbitmq.jms.admin.RMQObjectFactory"
            username="guest"
            password="guest"
         virtualHost="/"
                host="localhost"/>

Here is the equivalent Spring bean example (Java configuration):

    :::java
    @Bean
    public ConnectionFactory jmsConnectionFactory() {
      RMQConnectionFactory connectionFactory = new RMQConnectionFactory();
      connectionFactory.setUsername("guest");
      connectionFactory.setPassword("guest");
      connectionFactory.setVirtualHost("/");
      connectionFactory.setHost("localhost");
      return connectionFactory;
    }

And here is the Spring XML configuration:

    :::xml
    <bean id="jmsConnectionFactory" class="com.rabbitmq.jms.admin.RMQConnectionFactory" >
      <property name="username" value="guest" />
      <property name="password" value="guest" />
      <property name="virtualHost" value="/" />
      <property name="host" value="localhost" />
    </bean>

The following table lists all of the attributes/properties that are available.

| Attribute/Property   | JNDI only? | Description                                                                                                                                                                                                                                                                                                                                             |
|----------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`               | JNDI only  | Name in JNDI.                                                                                                                                                                                                                                                                                                                                           |
| `type`               | JNDI only  | Name of the JMS interface the object implements, usually `javax.jms.ConnectionFactory`. Other choices are `javax.jms.QueueConnectionFactory` and `javax.jms.TopicConnectionFactory`. You can also use the name of the (common) implementation class, `com.rabbitmq.jms.admin.RMQConnectionFactory`.                                                              |
| `factory`            | JNDI only  | JMS Client for RabbitMQ `ObjectFactory` class, always `com.rabbitmq.jms.admin.RMQObjectFactory`.                                                                                                                                                                                                                                                             |
| `username`           |            | Name to use to authenticate a connection with the RabbitMQ broker. The default is "guest".                                                                                                                                                                                                                                                              |
| `password`           |            | Password to use to authenticate a connection with the RabbitMQ broker. The default is "guest".                                                                                                                                                                                                                                                          |
| `virtualHost`        |            | RabbitMQ virtual host within which the application will operate. The default is "/".                                                                                                                                                                                                                                                                    |
| `host`               |            | Host on which RabbitMQ is running. The default is "localhost".                                                                                                                                                                                                                                                                                          |
| `port`               |            | RabbitMQ port used for connections. The default is "5672" unless this is an SSL connection, in which case the default is "5671".                                                                                                                                                                                                                        |
| `ssl`                |            | Whether to use an SSL connection to RabbitMQ. The default is "false". See the `useSslProtocol` methods for more information.                                                                                                                                                                                                                                                                                 |
| `uri`                |            | The AMQP URI string used to establish a RabbitMQ connection. The value can encode the `host`, `port`, `userid`, `password` and `virtualHost` in a single string. Both 'amqp' and 'amqps' schemes are accepted. See the [AMQP URI specification](/uri-spec.html) on the public RabbitMQ site for details. Note: this property sets other properties and the set order is unspecified. |                                                                                                                                                                                                                                                                                                                                                      |

## JMS and AMQP Destination Interoperability

An interoperability feature allows you to define JMS 'amqp' destinations
that read and/or write to non-JMS RabbitMQ resources

A JMS destination can be defined so that a JMS application can send
`Message`s to a predefined RabbitMQ 'destination' (exchange/routing key)
using the JMS API in the normal way. The messages are written
"in the clear," which means that any AMQP client can read them without
having to understand the internal format of Java JMS messages. 
Only `BytesMessage`s and `TextMessage`s can be written in this way.

Similarly, a JMS destination can be defined that reads messages from a
predefined RabbitMQ queue. A JMS application can then read these
messages using the JMS API. JMS Client for RabbitMQ packs them up into 
JMS Messages automatically. Messages read in this way are, by default, 
`BytesMessage`s, but individual messages can be marked `TextMessage`
(by adding an AMQP message property called "JMSType" whose value is 
"TextMessage"), which will interpret the byte-array payload as a UTF8 
encoded String and return them as `TextMessage`s.

A single 'amqp' destination can be defined for both reading and writing.

When messages are sent to an 'amqp' Destination, JMS message properties
are mapped onto AMQP headers and properties as appropriate.
For example, the `JMSPriority` property converts to the `priority` property
for the AMQP message. (It is also set as a header with the name 
"JMSPriority".) User-defined properties are set as named message header
values, provided they are `boolean`, numeric or `String` types.

When reading from an 'amqp' Destination, values are mapped back to 
JMS message properties, except that any explicit JMS property set as
a message header overrides the natural AMQP header value, unless
this would misrepresent the message. For example, 
`JMSDeliveryMode` cannot be overridden in this way.

### JMS 'amqp' `RMQDestination` Constructor

The `com.rabbitmq.jms.admin` package contains the `RMQDestination` class,
which implements `Destination` in the JMS interface. This is extended
with a new constructor:

    :::java
    public RMQDestination(String destinationName, String amqpExchangeName, 
                          String amqpRoutingKey, String amqpQueueName);
                          
This constructor creates a destination for JMS for RabbitMQ mapped
onto an AMQP resource. The parameters are the following:

 * `destinationName` - the name of the queue destination
 * `amqpExchangeName` - the exchange name for the map resource
 * `amqpRoutingKey` - the routing key for the mapped resource
 * `amqpQueueName` - the queue name of the mapped resource (to listen
 messages from)
 
Applications that declare destinations in this way can use them directly,
or store them in a JNDI provider for JMS applications to retrieve. 
Such destinations are non-temporary, queue destinations.

### JMS AMQP Destination Definitions

The `RMQDestination` object has the following new instance fields:

 * `amqp` – *boolean*, indicates if this is an AMQP destination 
 (if **true**); the default is **false**.
 * `amqpExchangeName` – *String*, the AMQP exchange name to use when 
 sending messages to this destination, if `amqp` is **true**; the default 
 is **null**.
 * `amqpRoutingKey` – *String*, the AMQP routing key to use when sending
 messages to this destination, if `amqp` is **true**; the default is **null**.
 * `amqpQueueName` – *String*, the AMQP queue name to use when reading 
 messages from this destination, if `amqp` is **true**; the default is **null**.
 
There are getters and setters for these fields, which means that a JNDI
 `<Resource/>` definition or an XML Spring bean definition can use them, for example:
 
    :::xml
    <Resource   name="jms/Queue"
               type="javax.jms.Queue"
            factory="com.rabbitmq.jms.admin.RMQObjectFactory"
    destinationName="myQueue"
               amqp="true"
      amqpQueueName="rabbitQueueName"
    />
    
This is the equivalent Spring bean example (Java configuration):

    :::java
    @Bean
    public Destination jmsDestination() {
        RMQDestination jmsDestination = new RMQDestination();
        jmsDestination.setDestinationName("myQueue");
        jmsDestination.setAmqp(true);
        jmsDestination.setAmqpQueueName("rabbitQueueName");
        return jmsDestination;
    }
 
And here is the Spring XML configuration:

    :::xml
    <bean id="jmsDestination" class="com.rabbitmq.jms.admin.RMQDestination" >
     <property name="destinationName" value="myQueue" />
     <property name="amqp"            value="true" />
     <property name="amqpQueueName"   value="rabbitQueueName" />
    </bean>
    
Following is a *complete* list of the attributes/properties that are
available:

| Attribute/Property Name   | JNDI Only? | Description                                                                                                                                                                                                                                   |
|---------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`                    | JNDI only  | Name in JNDI.                                                                                                                                                                                                                                 |
| `type`                    | JNDI only  | Name of the JMS interface the object implements, usually `javax.jms.Queue`. Other choices are `javax.jms.Topic` and `javax.jms.Destination`. You can also use the name of the (common) implementation class, `com.rabbitmq.jms.admin.RMQDestination`. |
| `factory`                 | JNDI only  | JMS Client for RabbitMQ `ObjectFactory` class, always `com.rabbitmq.jms.admin.RMQObjectFactory`.                                                                                                                                                   |
| `amqp`                    |            | "**true**" means this is an 'amqp' destination. Default "**false**".                                                                                                                                                                                  |
| `ampqExchangeName`        |            | Name of the AMQP exchange to publish messages to when an 'amqp' destination. This exchange must exist when messages are published.                                                                                                            |
| `amqpRoutingKey`          |            | The routing key to use when publishing messages when an 'amqp' destination.                                                                                                                                                                   |
| `amqpQueueName`           |            | Name of the AMQP queue to receive messages from when an 'amqp' destination. This queue must exist when messages are received.                                                                                                                 |
| `destinationName`         |            | Name of the JMS destination.                                                                                                                                                                                                                  |

## Configuring Logging for the JMS Client

The JMS Client logs messages using SLF4J (Simple Logging Façade for Java).
SLF4J delegates to a logging framework, such as Apache log4j or 
Logback. If no other logging framework is
enabled, SLF4J defaults to a built-in, no-op, logger.
See the [SLF4J](http://www.slf4j.org/docs.html) documentation for a
list of the logging frameworks SLF4J supports.

The target logging framework is configured at deployment time by adding
an SLF4J binding for the framework to the classpath.
For example, the log4j SLF4J binding is in the 
`slf4j-log4j12-{version}.jar` file, which is a part of the SLF4J
distribution. To direct JMS client messages to log4j, for example,
add the following JARs to the classpath:

 * slf4j-api-1.7.21.jar
 * slf4j-log4j12-1.7.21.jar
 * log4j-1.2.17.jar
 
The SLF4J API is backwards compatible, so you can use use any version of
SLF4J. Version 1.7.5 or higher is recommended. The SLF4J API and
bindings, however, must be from the same SLF4J version.

No additional SLF4J configuration is required, once the API and
binding JAR files are in the classpath. However, the target framework
may have configuration files or command-line options.
Refer to the documentation for the target logging framework
for configuration details.

## API Implementation Details

This section provides additional implementation details for specific
JMS API classes in the JMS Client.

Deviations from the specification are implemented to support common
acknowledgement behaviours.

## <a id="queue_browser_support"></a>QueueBrowser support

### Overview of queue browsers

The JMS API includes objects and methods to browse an existing queue
destination, reading its messages *without* removing them from the
queue. Topic destinations cannot be browsed in this manner.

A `QueueBrowser` can be created from a (queue) `Destination`, 
with or without a selector expression. The browser has a `getEnumeration()` 
method, which returns a Java `Enumeration` of `Message`s copied from
the queue.

If no selector is supplied, then all messages in the queue appear
in the `Enumeration`. If a selector is supplied, then only those
messages that satisfy the selector appear.

### Implementation

The destination queue is read when the `getEnumeration()` method is
called. A *snapshot* is taken of the messages in the queue; and the
selector expression, if one is supplied, is used at this time to discard
messages that do not match.

The message copies may now be read using the `Enumeration` interface
(`nextElement()` and `hasMoreElements()`).

The selector expression and the destination queue of the `QueueBrowser`
may not be adjusted after the `QueueBrowser` is created.

An `Enumeration` cannot be "reset", but the `getEnumeration()` method 
may be re-issued, taking a *new* snapshot from the queue each time.

The contents of an `Enumeration` survive session and/or connection
close, but a `QueueBrowser` may not be used after the session that
created it has closed. `QueueBrowser.close()` has no effect.

### Implementation Details

#### Which messages are included

Messages that arrive, expire, are re-queued, or are removed after
the `getEnumeration()` call have no effect on the contents of the 
`Enumeration` it produced. If the messages in the queue change 
*while the* `Enumeration` *is being built*, they may or may not be 
included. In particular, if messages from the queue are simultaneously
read by another client (or session), they may or may not appear in 
the `Enumeration`.

Message copies do not "expire" from an `Enumeration`.

#### Order of messages

If other client sessions read from a queue that is being browsed,
then it is possible that some messages may subsequently be received out
of order.

Message order will not be disturbed if no other client sessions read
the queue at the same time.

#### Memory usage

When a message is read from the `Enumeration` (with `nextElement()`),
then no reference to it is retained in the Java Client. This means the
storage it occupies in the client is eligible for release
(by garbage collection) if no other references are retained.
Retaining an `Enumeration` will retain the storage for all message
copies that remain in it.

If the queue has many messages -- or the messages it contains are very
large -- then a `getEnumeration()` method call may consume a large
amount of memory in a very short time. This remains true even if only
a few messages are selected. There is currently limited protection
against `OutOfMemoryError` conditions that may arise because of this.
See the next section.

#### Setting a maximum number of messages to browse

Each connection is created with a limit on the number of messages that
are examined by a `QueueBrowser`. The limit is set on the
`RMQConnectionFactory` by `RMQConnectionFactory.setQueueBrowserReadMax(int)`
and is passed to each `Connection` subsequently created
by `ConnectionFactory.createConnection()`.

The limit is an integer that, if positive, stops the queue browser from
reading more than this number of messages when building an enumeration.
If it is zero or negative, it is interpreted as imposing no limit on
the browser, and all of the messages on the queue are scanned.

The default limit for a factory is determined by the
`rabbit.jms.queueBrowserReadMax` system property, if set, and the value
is specified as `0` if this property is not set or is not an integer.

If a `RMQConnectionFactory` value is obtained from a JNDI provider,
then the limit set when the factory object was created is preserved.

#### Release support

Support for `QueueBrowser`s is introduced in the JMS Client 1.2.0.
Prior to that release, calling `Session.createBrowser(Queue queue[, String selector])`
resulted in an `UnsupportedOperationException`.

### Group and individual acknowledgement

Prior to version 1.2.0 of the JMS client, in client acknowledgement mode
(`Session.CLIENT_ACKNOWLEDGE`), acknowledging any message from an open
session would acknowledge *every* unacknowledged message of that session,
whether they were received before or after the message being acknowledged.

Currently, the behaviour of `Session.CLIENT_ACKNOWLEDGE` mode is
modified so that, when calling `msg.acknowledge()`, only the message
`msg` *and all* previously received *unacknowledged messages on that
session* are acknowledged. Messages received *after* `msg` was received
are not affected. This is a form of *group acknowledgement*,
which differs slightly from the JMS 1.1 specification but is likely to
be more useful, and is compatible with the vast majority of uses of
the existing acknowledge function.

For even finer control, a new acknowledgement mode may be set when
creating a session, called `RMQSession.CLIENT_INDIVIDUAL_ACKNOWLEDGE`.

A session created with this acknowledgement mode will mean that messages
received on that session will be acknowledged individually. That is,
the call `msg.acknowledge()` will acknowledge only the message `msg`
and not affect any other messages of that session.

The acknowledgement mode `RMQSession.CLIENT_INDIVIDUAL_ACKNOWLEDGE`
is equivalent to `Session.CLIENT_ACKNOWLEDGE` in all other respects.
In particular the `getAcknowledgeMode()` method returns
`Session.CLIENT_ACKNOWLEDGE` even if
`RMQSession.CLIENT_INDIVIDUAL_ACKNOWLEDGE` has been set.

### Arbitrary Message support

Any instance of a class that implements the `javax.jms.Message`
interface can be *sent* by a JMS message producer.

All properties of the message required by `send()` are correctly
interpreted except that the `JMSReplyTo` header and objects
(as property values or the body of an `ObjectMessage`) that
cannot be deserialized are ignored.

The implementation extracts the properties and body from the `Message` 
instance using interface methods and recreates it as a message of
the right (`RMQMessage`) type (`BytesMessage`, `MapMessage`, `ObjectMessage`,
`TextMessage`, or `StreamMessage`) before sending it. This means
that there is some performance loss due to the copying; but in the
normal case, when the message is an instance of 
`com.rabbitmq.jms.client.RMQMessage`, no copying is done.


