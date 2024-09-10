---
title: AMQP 1.0 Client Libraries
---
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AMQP 1.0 Client Libraries

## Overview

TODO

## Client API

### Connecting

Libraries provide an entry point to a node or a cluster of nodes.
Its name is the "environment".
The environment allows creating connections.
It can contain infrastucture-related configuration settings shared between connections (e.g. pools of threads for the Java library).
Here is how to create the environment:

<Tabs groupId="languages">
<TabItem value="java" label="Java">

```java title="Creating the environment"
import com.rabbitmq.client.amqp.*;
import com.rabbitmq.client.amqp.impl.AmqpEnvironmentBuilder;

...

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
IEnvironment environment = await AmqpEnvironment.CreateAsync(
    ConnectionSettingBuilder.Create().ContainerId(containerId).Build());
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
IConnection connection = await environment.CreateConnectionAsync();
```

</TabItem>
</Tabs>

Libraries use the `ANONYMOUS` [SASL authentication mechanism](/docs/next/access-control#mechanisms) by default.
Connections are long-lived objects.
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
</Tabs>

In the previous example, every message published with the publisher will go to the `foo` exchange with the `bar` routing key.

:::info

RabbitMQ uses the [AMQP 0.9.1 model](/tutorials/amqp-concepts) comprising exchanges, queues, and bindings.

:::

Messages are created from the publisher instance.
They follow the [AMQP 1.0 message format](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#section-message-format).
It is possible to define the body (as an array of bytes), standard properties, and application properties.

When a message is published, the broker indicates how it dealt with it in an asynchronous callback.
The client application take appropriate measures depending on the status (["outcome" in AMQP terms](/docs/next/amqp#outcomes)) the broker returned for the message (e.g. store the message in another place if the message has not been `accepted`).

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
</Tabs>

:::info

Libraries translate the API calls into the [address format v2](/docs/next/amqp#address-v2).

:::

It is also possible to define the target on a per-message basis.
The publisher must be defined without any target and each message define its target in the `to` field of the properties section.
Libraries provide helpers in the message creation API to define the message target, without having to deal with the  [address format](/docs/next/amqp#address-v2).

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
</Tabs>

Once the application is done processing a message, it must _settle_ it.
This indicates to the broker the result of the processing and what it should do with the message (e.g. deleting the message).
Applications must settle messages or they will run out of [credits](/blog/2024/09/02/amqp-flow-control) and the broker will stop dispatching messages to them.

The next section covers the semantics of message settlement.

#### Message Processing Result (Outcome)

Libraries allows applications to settle messages in different ways.
They use terms as explicit as possible in the context of messaging applications.
Each term maps to a [given _outcome_](/docs/next/amqp#outcomes) in the AMQP specification.

* `accept`: the application successfully processed the message and it can be deleted from the queue (`accepted` outcome)
* `discard`: the application cannot process the message because it is invalid, the broker can drop it or [dead-letter](/docs/next/dlx) it if it is configured (`rejected` outcome)
* `requeue`: the application did not process the message, the broker can requeue it and deliver it to the same or a different consumer (`released` outcome)

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
The consumer API allows nevertheless to pause the delivery of messages, get the number of unsettled messages to make sure it reaches 0 at some point, and then close the consumer.
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
</Tabs>

An application can still close a consumer without pausing it, at the risk of processing the same messages several times.

#### Support for Streams

Libraries have out-of-the-box support for [streams](/docs/next/streams) in consumer configuration.

It is possible to set where to attach to when [consuming](/docs/next/streams#consuming) from a stream:

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
</Tabs>

There is also support for [stream filtering](/docs/next/streams#filtering) configuration:

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
</Tabs>


## Topology Management

TODO
