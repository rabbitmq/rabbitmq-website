---
title: AMQP 1.0 Client Libraries
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AMQP 1.0 Client Libraries

This page documents the usage of [AMQP 1.0](/docs/amqp) client libraries for **RabbitMQ 4.0 or more**.

The RabbitMQ team supports the following libraries:

* [RabbitMQ AMQP 1.0 **Java** client](https://github.com/rabbitmq/rabbitmq-amqp-java-client)
* [RabbitMQ AMQP 1.0 **.NET** client](https://github.com/rabbitmq/rabbitmq-amqp-dotnet-client)
* [RabbitMQ AMQP 1.0 **Go** client](https://github.com/rabbitmq/rabbitmq-amqp-go-client)
* [RabbitMQ AMQP 1.0 **Python** client](https://github.com/rabbitmq/rabbitmq-amqp-python-client)

Application developers will find here how to use the libraries for the most common use cases.
For other information like licensing, downloading, dependency management, advanced and specific usage and configuration, please see the README page in the repository of the respective libraries.

## Overview

The RabbitMQ team maintains a set of AMQP 1.0 client libraries [designed and optimized](/blog/2024/08/05/native-amqp#rabbitmq-amqp-10-clients) for RabbitMQ.
They offer a simple and safe, yet powerful API on top of AMQP 1.0.
Applications can publish and consume messages with these libraries, as well as manage the server topology in a consistent way across programming languages.
The libraries also offer advanced features like automatic connection and topology recovery, and connection affinity with queues.

:::note

RabbitMQ is compatible with any AMQP-1.0-compliant client library.
It is not mandatory to use the RabbitMQ AMQP 1.0 client libraries with RabbitMQ, but applications are strongly encouraged to do so for the best experience.

:::

## Safety

RabbitMQ AMQP 1.0 client libraries are safe by default, they always create [durable entities](/docs/queues#durability) and always publish persistent messages.

## Guarantees

RabbitMQ AMQP 1.0 client libraries provide at-least-once guarantees.

The broker always [confirms](#publishing) the proper handling of published messages.
Publishers achieve this by using the `unsettled` [sender settle mode](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#type-sender-settle-mode) and the `first` [receiver settle mode](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#type-receiver-settle-mode) when they get created.

Consumers must always [signal](#message-processing-result-outcome) the result of message processing to the broker.
Consumers use the same settings as publishers when they get created (`first` [receiver settle mode](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#type-receiver-settle-mode) and `unsettled` [sender settle mode](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html#type-sender-settle-mode)).


## Client API

This section covers how to use the RabbitMQ AMQP 1.0 client libraries to connect to a cluster, and publish and consume messages.

### Connecting

Libraries provide an entry point to a node or a cluster of nodes.
Its name is the "environment".
The environment allows creating connections.
It can contain infrastucture-related configuration settings shared between connections (e.g. pools of threads for Java).
Here is how to create the environment:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating the environment"
import com.rabbitmq.client.amqp.*;
import com.rabbitmq.client.amqp.impl.AmqpEnvironmentBuilder;

// ...

// create the environment instance
Environment environment = new AmqpEnvironmentBuilder()
    .build();
// ...
// close the environment when the application stops
environment.close();
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp title="Creating the environment"
using RabbitMQ.AMQP.Client;
using RabbitMQ.AMQP.Client.Impl;

// ...

// create the environment instance
IEnvironment environment = await AmqpEnvironment.CreateAsync(
    ConnectionSettingBuilder.Create().Build());
// ...
// close the environment when the application stops
await environment.CloseAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Creating the environment"
from rabbitmq_amqp_python_client import Environment

# ...

# create the environment instance
environment = Environment()
# ...
# close the environment when the application stops
environment.close()
```
</TabItem>
</Tabs>

There is usually one environment instance for an application process.
The application must close the environment to release its resources when it exits.

Applications open connections from the environment.
They must specify appropriate settings to connect to the cluster nodes (URI, credentials).

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Opening a connection"
// open a connection from the environment
Connection connection = environment.connectionBuilder()
    .uri("amqp://admin:admin@localhost:5672/%2f")
    .build();
// ...
// close the connection when it is no longer necessary
connection.close();
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp title="Opening a connection"
// open a connection from the environment setting   
IConnection connection = await environment.CreateConnectionAsync();

//open a connection from the environment with different settings
ConnectionSettingBuilder otherSettingBuilder = ConnectionSettingBuilder.Create()
    .ContainerId("my_containerId")
    .Host("localhost");
IConnection connection = await environment.CreateConnectionAsync(otherSettingBuilder.Build());
// ...
// close the connection when it is no longer necessary
await connection.CloseAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Opening a connection"
# open a connection from the environment setting   
connection = environment.connection("amqp://guest:guest@localhost:5672/")

# close the connection when it is no longer necessary
connection.close()
```

</TabItem>
</Tabs>

Libraries use the `ANONYMOUS` [SASL authentication mechanism](/docs/access-control#mechanisms) by default.
Connections are expected to be long-lived objects, applications should avoid connection churn.
They must be closed when they are no longer needed.

### Publishing

A publisher must be created to publish messages.
The target a publisher will publish messages to is usually set on creation, but it also possible to set on a per-message basis.

Here is how to declare a publisher with the target set at creation time:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating a publisher"
Publisher publisher = connection.publisherBuilder()
    .exchange("foo").key("bar")
    .build();
// ...
// close the publisher when it is no longer necessary 
publisher.close();
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Creating a publisher"
// The publisher can use exchange (optionally with a key) or queue to publish messages. 
IPublisher publisher = await connection.PublisherBuilder().Exchange("foo").Key("bar")
    .BuildAsync();

// ...
// close the publisher when it is no longer necessary 
await publisher.CloseAsync();
publisher.Dispose();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Creating a publisher"
# The publisher can use exchange (optionally with a key) or queue to publish messages. 
# You can use the AddressHelper utility class to get the addr from the exchange name and the key
exchange_address = AddressHelper.exchange_address("foo", "bar")
publisher = connection.publisher(addr)
# close the publisher when it is no longer necessary 
publisher.close()
```

</TabItem>
</Tabs>

In the previous example, every message published with the publisher will go to the `foo` exchange with the `bar` routing key.

:::info

RabbitMQ uses the [AMQ 0.9.1 model](/tutorials/amqp-concepts) comprising exchanges, queues, and bindings.

:::

Messages are created from the publisher instance.
They follow the [AMQP 1.0 message format](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#section-message-format).
It is possible to define the body (as an array of bytes), standard properties, and application properties.

When a message is published, the broker indicates how it dealt with it in an asynchronous callback.
The client application take appropriate measures depending on the status (["outcome" in AMQP terms](/docs/amqp#outcomes)) the broker returned for the message (e.g. store the message in another place if the message has not been `accepted`).

The following snippet shows how to create a message, publish it, and deal with the response from the broker:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Publishing a message"
// create the message
Message message = publisher
    .message("hello".getBytes(StandardCharsets.UTF_8))
    .messageId(1L);

// publish the message and deal with broker feedback
publisher.publish(message, context -> {
    // asynchronous feedback from the broker
    if (context.status() == Publisher.Status.ACCEPTED) {
        // the broker accepted (confirmed) the message
    } else {
        // deal with possible failure
    }
});
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Publishing a message"
// create the message
var message = new AmqpMessage("Hello");
// publish the message and deal with broker feedback
// The result is synchronous, use a `List<Task<PublishResult>>` to increase the performances 
PublishResult pr = await publisher.PublishAsync(message);
  switch (pr.Outcome.State)
    {
        case OutcomeState.Accepted:
            // the broker accepted (confirmed) the message
            break;
        case OutcomeState.Released:
            // the broker could not route the message anywhere 
            break;
        case OutcomeState.Rejected:
            // at least one queue rejected the message
            break;
    }
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Publishing a message"
# create the message
message = Message(body="Hello")
# publish the message and deal with broker feedback
# The result is synchronous
status = publisher.publish(Message(message)
match status.remote_state:
    case OutcomeState.ACCEPTED:
        # the broker accepted (confirmed) the message
    case OutcomeState.RELEASED:
        # the broker could not route the message anywhere 
    case OutcomeState.REJECTED:
        # at least one queue rejected the message
```

</TabItem>

</Tabs>

The publisher example above send messages to a given exchange with a given routing key, but this is not the only supported target for a publisher.
Here are the supported non-null targets for a publisher:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating publishers with different targets"
// publish to an exchange with a routing key
Publisher publisher1 = connection.publisherBuilder()
    .exchange("foo").key("bar") // /exchanges/foo/bar
    .build();

// publish to an exchange without a routing key
Publisher publisher2 = connection.publisherBuilder()
    .exchange("foo") // /exchanges/foo
    .build();

// publish to a queue
Publisher publisher3 = connection.publisherBuilder()
    .queue("some-queue") // /queues/some-queue
    .build();
```

</TabItem>


<TabItem value="csharp" label="C#">

```csharp title="Creating publishers with different targets"
// publish to an exchange with a routing key
Publisher publisher = await connection.PublisherBuilder()
    .Exchange("foo")
    .Key("bar")
    .BuildAsync();


// publish to an exchange without a routing key
Publisher publisher = await connection.PublisherBuilder()
    .Exchange("foo") // /exchanges/foo
    .BuildAsync();

// publish to a queue
  IPublisher publisher = await _connection.PublisherBuilder()
  .Queue("some-queue")// /queues/some-queue
  .BuildAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Creating publishers with different targets"
# publish to an exchange with a routing key
# You can use the AddressHelper utility class to get the addr from the exchange name and the key
exchange_address = AddressHelper.exchange_address("foo", "bar")
publisher = connection.publisher(addr)


# publish to an exchange without a routing key
exchange_address = AddressHelper.exchange_address("foo")
publisher = connection.publisher(addr)

# publish to a queue
queue_address = AddressHelper.queue_address("some_queue")
publisher = connection.publisher(queue_address)
```

</TabItem>

</Tabs>

:::info

Libraries translate the API calls into the [address format v2](/docs/amqp#address-v2).

:::

It is also possible to define the target on a per-message basis.
The publisher must be defined without any target and each message define its target in the `to` field of the properties section.
Libraries provide helpers in the message creation API to define the message target, which avoids dealing with the  [address format](/docs/amqp#address-v2).

The following snippet shows how to create a publisher without a target and define messages with different target types:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Setting the target in messages"
// no target defined on publisher creation
Publisher publisher = connection.publisherBuilder()
    .build();

// publish to an exchange with a routing key
Message message1 = publisher.message()
    .toAddress().exchange("foo").key("bar")
    .message();

// publish to an exchange without a routing key
Message message2 = publisher.message()
    .toAddress().exchange("foo")
    .message();

// publish to a queue
Message message3 = publisher.message()
    .toAddress().queue("my-queue")
    .message();
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp title="Setting the target in messages"
// no target defined on publisher creation
IPublisher publisher = await connection.PublisherBuilder()
                       .BuildAsync();

// publish to an exchange with a routing key
IMessage message = new AmqpMessage("Hello!").ToAddress()
    .Exchange("foo")
    .Key("bar")
    .Build()

await aPublisher.PublishAsync(message);

// publish to a queue
IMessage message = new AmqpMessage("Hello!").ToAddress()
    .Queue("foo")
    .Build()

await aPublisher.PublishAsync(message);
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Setting the target in messages"

# no target defined on publisher creation
publisher = connection.publisher()

# publish to an exchange with a routing key
# You can use the AddressHelper.message_to_address_helper 
# utility class to set the destination in the message
message = Message(body="Hello!")
exchange_address = AddressHelper.exchange_address("foo", "bar")
message = AddressHelper.message_to_address_helper(message, exchange_address)
publisher.publish(message)

# publish to a queue
message = Message(body="Hello!")
queue_address = AddressHelper.queue_address("some_queue")
message = AddressHelper.message_to_address_helper(message, queue_address)
publisher = publisher.publish(message)
```

</TabItem>

</Tabs>

### Consuming

#### Consumer Creation

Creating a consumer consists in specifying the queue to consume from and the callback to process messages:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating a consumer"
Consumer consumer = connection.consumerBuilder()
    .queue("some-queue")
    .messageHandler((context, message) -> {
        byte[] body = message.body();
        // ...
        context.accept(); // settle the message
    })
    .build(); // do not forget to build the instance!
```

</TabItem>


<TabItem value="csharp" label="C#">

```csharp title="Creating a consumer"
IConsumer consumer = await connection.ConsumerBuilder()
    .Queue("some-queue")
    .MessageHandler(async (context, message) =>
    {
        // deal with the message
        await context.AcceptAsync();// settle the message
    }
).BuildAndStartAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Creating a consumer"

class MyMessageHandler(AMQPMessagingHandler):

    def __init__(self):
        super().__init__()

    def on_message(self, event: Event):
        # accepting
        self.delivery_context.accept(event)
        # deal with the message

queue_address = AddressHelper.queue_address("some_queue")
consumer = connection.consumer(queue_address, message_handler=MyMessageHandler())
consumer.run()
```

</TabItem>

</Tabs>

Once the application is done processing a message, it must _settle_ it.
This indicates to the broker the result of the processing and what it should do with the message (e.g. deleting the message).
Applications must settle messages or they will run out of [credits](/blog/2024/09/02/amqp-flow-control) and the broker will stop dispatching messages to them.

The next section covers the semantics of message settlement.

#### Message Processing Result (Outcome)

Libraries allows applications to settle messages in different ways.
They use terms as explicit as possible in the context of messaging applications.
Each term maps to a [given _outcome_](/docs/amqp#outcomes) in the AMQP specification.

* `accept`: the application successfully processed the message and it can be deleted from the queue (`accepted` outcome)
* `discard`: the application cannot process the message because it is invalid, the broker can drop it or [dead-letter](/docs/dlx) it if it is configured (`rejected` outcome)
* `requeue`: the application did not process the message, the broker can requeue it and deliver it to the same or a different consumer (`released` outcome)

`discard` and `requeue` have an optional message annotation argument to combine with the existing ones held in the message header section.
Such message annotations can be used to provide details on the `discard` or `requeue` reason.
Application-specific annotation keys must start with the `x-opt-` prefix whereas annotation keys the broker understands start only with `x-`.
Both `discard` and `requeue` use the `modified` outcome with the message annotation parameter.

__Only quorum queues__ support the [modification of message annotations](/docs/amqp#modified-outcome) with the `modified` outcome.

#### Consumer Graceful Shutdown

A consumer _settles_ a message by accepting it, discarding it, or requeuing it.

Unsettled messages are requeued when a consumer get closed.
This can lead to duplicate processing of messages.

Here is an example:

* A consumer executes a database operation for a given message.
* The consumer gets closed before it accepts (settles) the message.
* The message is requeued.
* Another consumer gets the message and executes the database operation again.

It is difficult to completely avoid duplicate messages, this is why processing should be idempotent.
The consumer API provides a way to avoid duplicate messages when a consumer gets closed.
It consists in pausing the delivery of messages, getting the number of unsettled messages to make sure it reaches 0 at some point, and then closing the consumer.
This ensures the consumer has finally quiesced and all the received messages have been processed.

Here is an example of a consumer graceful shutdown:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Closing a consumer gracefully"
// pause the delivery of messages
consumer.pause();
// ensure the number of unsettled messages reaches 0
long unsettledMessageCount = consumer.unsettledMessageCount();
// close the consumer
consumer.close();
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp title="Closing a consumer gracefully"
// pause the delivery of messages
consumer.pause();
// ensure the number of unsettled messages reaches 0
long unsettledMessageCount = consumer.UnsettledMessageCount();
// close the consumer
consumer.close();
```

</TabItem>

<TabItem value="python" label="Python">
```python title="Closing a consumer gracefully"
# CURRENTLY NOT IMPLEMENTED
```
</TabItem>

</Tabs>

An application can still close a consumer without pausing it, at the risk of processing the same messages several times.

#### Support for Streams

Libraries have out-of-the-box support for [streams](/docs/streams) in consumer configuration.

It is possible to set where to attach to when [consuming](/docs/streams#consuming) from a stream:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Attaching to the beginning of a stream"
Consumer consumer = connection.consumerBuilder()
    .queue("some-stream")
    .stream()
        .offset(ConsumerBuilder.StreamOffsetSpecification.FIRST)
    .builder()
    .messageHandler((context, message) -> {
        // message processing
    })
    .build(); 
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp title="Attaching to the beginning of a stream"
IConsumer consumer = await connection.ConsumerBuilder()
    .Queue("some-stream")
    .Stream()
    .Offset(StreamOffsetSpecification.First)
    .Builder()
    .MessageHandler( async (context, message) => {
            // message processing
    })
    .BuildAndStartAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Attaching to the beginning of a stream"
class MyMessageHandler(AMQPMessagingHandler):

    def __init__(self):
        super().__init__()

    def on_message(self, event: Event):
        # accepting
        self.delivery_context.accept(event)
        # deal with the message

stream_filter_options = StreamOptions()
# can be first, last, next or an offset long
# you can also specify stream filters with methods: apply_filters and filter_match_unfiltered
stream_filter_options.offset(OffsetSpecification.first)

stream_address = AddressHelper.queue_address("some_stream")
consumer = consumer_connection.consumer(
    stream_address,
    message_handler=MyMessageHandler(),
    stream_filter_options=stream_filter_options,
)
```

</TabItem>

</Tabs>

There is also support for [stream filtering](/docs/streams#filtering) configuration:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Configuring stream filtering"
Consumer consumer = connection.consumerBuilder()
    .queue("some-stream")
    .stream() 
        .filterValues("invoices", "orders") 
        .filterMatchUnfiltered(true) 
    .builder() 
    .messageHandler((context, message) -> {
        // message processing
    })
    .build();
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Configuring stream filtering"
IConsumer consumer = await connection.ConsumerBuilder()
    .Queue("some-stream")
    .Stream()
    .FilterValues(["invoices", "order"]) 
    .FilterMatchUnfiltered(true) 
    .Builder()
    .MessageHandler(async (context, message) => {
            // message processing
        }
).BuildAndStartAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Configuring stream filtering
class MyMessageHandler(AMQPMessagingHandler):

    def __init__(self):
        super().__init__()

    def on_message(self, event: Event):
        # accepting
        self.delivery_context.accept(event)
        # deal with the message


stream_filter_options = StreamOptions()
stream_filter_options.filter_values(["invoices", "order"])
stream_filter_options.filter_match_unfiltered(True)
stream_address = AddressHelper.queue_address("some_stream")
consumer = consumer_connection.consumer(
    stream_address,
    message_handler=MyMessageHandler(),
    stream_filter_options=stream_filter_options,
)
```

</TabItem>

</Tabs>

Consider also using the [native stream protocol](/docs/stream) with the stream client library for your preferred programming language when working with streams.

## Topology Management

Applications can manage the RabbitMQ's [AMQ 0.9.1 model](/tutorials/amqp-concepts): declaring and deleting exchanges, queues, and bindings.

To do so, they need to get the management API from a connection:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Getting the management object from the environment"
Management management = connection.management();
// ...
// close the management instance when it is no longer needed
management.close();
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Getting the management object from the environment"
IManagement management = connection.Management();
// ...
// close the management instance when it is no longer needed
await management.CloseAsync()
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Getting the management object from the environment"
management = connection.management()
// ...
// close the management instance when it is no longer needed
management.close()
```

</TabItem>

</Tabs>

The management API should be closed as soon as it is no longer needed.
An application usually creates the topology it needs when it starts, so the management object can be closed after this step.

### Exchanges

Here is how to create an [exchange](/tutorials/amqp-concepts#exchanges) of a built-in type:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating an exchange of a built-in type"
management.exchange()
    .name("my-exchange")
    .type(Management.ExchangeType.FANOUT) // enum for built-in type
    .declare();
```

</TabItem>


<TabItem value="csharp" label="C#">

```csharp title="Creating an exchange of a built-in type"
IExchangeSpecification exchangeSpec = management
        .Exchange(exchangeName)
        .Type(ExchangeType.TOPIC);
await exchangeSpec.DeclareAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Creating an exchange of a built-in type"
exchange_name = "my-exchange"
management.declare_exchange(ExchangeSpecification(name=exchange_name, exchange_type=ExchangeType.topic))
```

</TabItem>
</Tabs>

It is also possible to specify the exchange type as a string (for non-built-in type exchanges):

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating an exchange of a non-built-in type"
management.exchange()
    .name("my-exchange")
    .type("x-delayed-message") // non-built-in type
    .autoDelete(false)
    .argument("x-delayed-type", "direct")
    .declare();
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Creating an exchange of a non-built-in type"
await _management.Exchange("myExchange")
    .Type("x-delayed-message")
    .Argument("x-delayed-type", "direct")
    .DeclareAsync();

```

</TabItem>

<TabItem value="python" label="Python">

```python title="Creating an exchange of a non-built-in type"
# CURRENTLY NOT IMPLEMENTED
```

</TabItem>

</Tabs>

Here is how to delete an exchange:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Deleting an exchange"
management.exchangeDelete("my-exchange");
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Deleting an exchange"
await management.Exchange("my-exchange").DeleteAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```csharp title="Deleting an exchange"
exchange_name = "my-exchange"
management.delete_exchange(exchange_name)
```

</TabItem>

</Tabs>

### Queues

Here is how to create a [queue](/tutorials/amqp-concepts#queues) with [the default queue type](/docs/vhosts#default-queue-type):

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating a classic queue"
management.queue()
    .name("my-queue")
    .exclusive(true)
    .autoDelete(false)
    .declare();
```

</TabItem>


<TabItem value="csharp" label="C#">

```csharp title="Creating a classic queue"
IQueueSpecification queueSpec = management
    .Queue("myqueue")
    .Exclusive(true)
    .AutoDelete(false)
await queueSpec.DeclareAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```csharp title="Creating a classic queue"
queue_name = "myqueue"
management.declare_queue(QueueSpecification(ClassicQueueSpecification(name=queue_name)))
```

</TabItem>

</Tabs>

The management API supports [queue arguments](/docs/queues#optional-arguments) explicitly:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating a queue with arguments"
management.queue()
    .name("my-queue")
    .type(Management.QueueType.CLASSIC)
    .messageTtl(Duration.ofMinutes(10))
    .maxLengthBytes(ByteCapacity.MB(100))
    .declare();
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp title="Creating a queue with arguments"
IQueueSpecification queueSpec = management
    .Queue("my-queue")
    .Type(QueueType.CLASSIC)
    .MessageTtl(TimeSpan.FromMinutes(10))
    .MaxLengthBytes(ByteCapacity.Mb(100));
await queueSpec.DeclareAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Creating a queue with arguments"
management.declare_queue(QueueSpecification(ClassicQueueSpecification(name=queue_name, message_ttl=timedelta(minutes=10), max_len_bytes=100000000)))
```

</TabItem>

</Tabs>

The management API makes also the distinction between arguments shared by all queue types and arguments valid only for a given type.
Here is an example with the creation of a [quorum queue](/docs/quorum-queues):

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating a quorum queue"
management
    .queue()
    .name("my-quorum-queue")
    .quorum() // set queue type to 'quorum'
        .quorumInitialGroupSize(3) // specific to quorum queues
        .deliveryLimit(3) // specific to quorum queues
    .queue()
    .declare();
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Creating a quorum queue"
IQueueSpecification queueSpec = management
    .Queue("my-quorum-queue")
    .Quorum() // set queue type to 'quorum'
        .QuorumInitialGroupSize(3) // specific to quorum queues
        .DeliveryLimit(3) // specific to quorum queues
    .Queue();
await queueSpec.DeclareAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Creating a quorum queue"
queue_name = "my-quorum-queue"
management.declare_queue(QueueSpecification(QuorumQueueSpecification(name=queue_name, quorum_initial_group_size=3, deliver_limit=3)))

```

</TabItem>

</Tabs>

It is possible to query information about a queue:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Getting queue information"
Management.QueueInfo info = management.queueInfo("my-queue");
long messageCount = info.messageCount();
int consumerCount = info.consumerCount();
String leaderNode = info.leader();
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp title="Getting queue information"
IQueueInfo queueInfo = await management.GetQueueInfoAsync("my-queue");
ulong messageCount = queueInfo.MessageCount();
uint consumerCount = queueInfo.ConsumerCount();
string leader = queueInfo.Leader();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Getting queue information"
queue_name = "my-queue"
queue_info = management.queue_info(name=queue_name)
message_count = queue_info.message_count
consumer_count = queue_info.consumer_count
leader = queue_info.leader
```

</TabItem>

</Tabs>

This API can also be used to check whether a queue exists or not.

And here is how to delete a queue:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Deleting a queue"
management.queueDelete("my-queue");
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp title="Deleting a queue"
await management.Queue("myqueue").DeleteAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```csharp title="Deleting a queue"
management.delete_queue(name="myqueue")
```

</TabItem>

</Tabs>

### Bindings

The management API supports [binding](/tutorials/amqp-concepts#bindings) a queue to an exchange:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Binding a queue to an exchange"
management.binding()
    .sourceExchange("my-exchange")
    .destinationQueue("my-queue")
    .key("foo")
    .bind();
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Binding a queue to an exchange"
IBindingSpecification bindingSpec = management.Binding()
    .SourceExchange("my-exchange")
    .DestinationQueue("my-queue")
    .Key("foo");
await bindingSpec.BindAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Binding a queue to an exchange"
bind_name = management.bind(
    BindingSpecification(
        source_exchange="my-exchange",
        destination_queue="my-queue",
        binding_key="foo",
    )
)
```

</TabItem>

</Tabs>

There is also support for [exchange-to-exchange binding](/docs/e2e):

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Binding an exchange to another exchange"
management.binding()
    .sourceExchange("my-exchange")
    .destinationExchange("my-other-exchange")
    .key("foo")
    .bind();
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Binding an exchange to another exchange"
IBindingSpecification bindingSpec = management.Binding()
    .SourceExchange("my-exchange")
    .DestinationExchange("my-other-exchange")
    .Key("foo");
await bindingSpec.BindAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Binding an exchange to another exchange"
    
binding_exchange_queue_path = management.bind(
    ExchangeToExchangeBindingSpecification(
        source_exchange="my-exchange",
        destination_exchange="my-other-exchange",
     )
)
```

</TabItem>

</Tabs>

It is also possible to unbind entities:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Deleting the binding between an exchange and a queue"
management.unbind()
    .sourceExchange("my-exchange")
    .destinationQueue("my-queue")
    .key("foo")
    .unbind();
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp title="Deleting the binding between an exchange and a queue"
IBindingSpecification bindingSpec = management.Binding()
    .SourceExchange("my-exchange")
    .DestinationQueue("my-queue")
    .Key("foo");
await bindingSpec.UnbindAsync();
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Deleting the binding between an exchange and a queue"
management.unbind(BindingSpecification(
    source_exchange="my-exchange",
    destination_queue="my-queue",
))
```

</TabItem>
</Tabs>

## Advanced Usage

### Lifecycle Listeners

Applications can react to state changes of some API components by adding listeners.
An application can add a listener to a connection to stop publishing messages when the connection is recovering after a connection.
The application can then resume publishing when the connection has recovered and is open again.

Here is how to set a listener on a connection:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Setting a listener on a connection"
Connection connection = environment.connectionBuilder()
    .listeners(context -> { // set one or several listeners
        context.previousState(); // the previous state
        context.currentState(); // the current (new) state
        context.failureCause(); // the cause of the failure (in case of failure)
        context.resource(); // the connection
    }).build();
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Attach an event to the ChangeState"
connection.ChangeState += ( 
     sender, // the sender instance ( in this case the connection)
     fromState, // the previous state
     toState, // the current (new) state
     e // the cause of the failure (in case of failure)
     ) =>
{
  
};
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Attach an event to the ChangeState"
# CURRENTLY NOT IMPLEMENTED FOR PYTHON
```

</TabItem>

</Tabs>

It is also possible to set listeners on publisher instances:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Setting a listener on a publisher"
Publisher publisher = connection.publisherBuilder()
    .listeners(context -> {
        // ...
    })
    .exchange("foo").key("bar")
    .build();
```

</TabItem>


<TabItem value="csharp" label="C#">

```csharp title="Attach an event to the ChangeState"
publisher.ChangeState += (sender, fromState, toState, e) =>
{
}
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Attach an event to the ChangeState"

# CURRENTLY NOT IMPLEMENTED FOR PYTHON
```

</TabItem>

</Tabs>

And on consumer instances as well:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Setting a listener on a consumer"
Consumer consumer = connection.consumerBuilder()
    .listeners(context -> {
        // ...
    })
    .queue("my-queue")
    .build();
```

</TabItem>

<TabItem value="csharp" label="C#">

```csharp title="Attach an event to the ChangeState"
consumer.ChangeState += (sender, fromState, toState, e) =>
{
}
```

</TabItem>

<TabItem value="python" label="Python">

```python title="Attach an event to the ChangeState"
# CURRENTLY NOT IMPLEMENTED FOR PYTHON
```

</TabItem>

</Tabs>

### Automatic Connection Recovery

Automatic connection recovery is activated by default: client libraries will automatically restore a connection after an unexpected closing (e.g. network glitch, node restart, etc).
Automatic topology recovery is also activated as soon as connection recovery is: client libraries will recreate AMQP entities, as well as publishers and consumers for the recovering connection.
Developers have less to worry about network stability and node restart, as client libraries will take care of it.

The client tries to reconnect every 5 seconds until it succeeds. It is possible to change this behavior by customizing the back-off delay policy:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Setting a back-off policy for connection recovery"
Connection connection = environment.connectionBuilder()
    .recovery()
    .backOffDelayPolicy(BackOffDelayPolicy.fixed(Duration.ofSeconds(2)))
    .connectionBuilder().build();
```

</TabItem>


<TabItem value="csharp" label="C#">

```csharp title="Setting a back-off policy for connection recovery"
class MyBackOffDelay : IBackOffDelayPolicy {
    ...
}

await AmqpConnection.CreateAsync(
    ConnectionSettingBuilder.Create().RecoveryConfiguration(
    RecoveryConfiguration.Create()
    .BackOffDelayPolicy(new MyBackOffDelay())).Build());
```

</TabItem>

</Tabs>

It is also possible to deactivate topology recovery if it is not appropriate for a given application.
The application would usually register a connection [lifecycle listener](#lifecycle-listeners) to know when the connection is recovered and recover its own state accordingly.

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Deactivating topology recovery"
Connection connection = environment.connectionBuilder()
    .recovery()
    .topology(false) // deactivate topology recovery
    .connectionBuilder()
    .listeners(context -> {
        // set listener that restores application state when connection is recovered
    })
    .build();
```

</TabItem>


<TabItem value="csharp" label="C#">

```csharp title="Deactivating topology recovery"
await AmqpConnection.CreateAsync(
    ConnectionSettingBuilder.Create().RecoveryConfiguration(
    RecoveryConfiguration.Create()
    .Topology(false)) // deactivate topology recovery
    .Build());

```

</TabItem>

</Tabs>

It is also possible to deactivate recovery altogether:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Deactivating recovery"
Connection connection = environment.connectionBuilder()
    .recovery()
    .activated(false) // deactivate recovery
    .connectionBuilder().build();
```

</TabItem>


<TabItem value="csharp" label="C#">

```csharp title="Deactivating recovery"
await AmqpConnection.CreateAsync(
        ConnectionSettingBuilder.Create().RecoveryConfiguration(
        RecoveryConfiguration.Create().
        Activated(false)).// deactivate recovery
        Build());
```

</TabItem>

</Tabs>

In Python automatic reconnection is not supported at the moment, but the client notify when a disconnection happens so that the user can reconnect.
Follow this example: [Python-disconnection](https://github.com/rabbitmq/rabbitmq-amqp-python-client/blob/main/examples/reconnection/reconnection_example.py)
