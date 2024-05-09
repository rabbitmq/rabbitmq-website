---
title: RabbitMQ tutorial - "Hello World!"
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

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsStreamHelp.md';
import TutorialsIntro from '@site/src/components/Tutorials/TutorialsStreamIntro.md';
import T1DiagramHello from '@site/src/components/Tutorials/T1DiagramHello.md';
import T1DiagramSending from '@site/src/components/Tutorials/T1DiagramSending.md';
import T1DiagramReceiving from '@site/src/components/Tutorials/T1DiagramReceiving.md';

# RabbitMQ Stream tutorial - "Hello World!"

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## "Hello World"

### (using the Java Stream Client)

In this part of the tutorial we'll write two programs in Java; a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the detail in
the Java client API, concentrating on this very simple thing just to get
started. It's a "Hello World" of messaging.


> #### The Java stream client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses RabbitMQ stream protocol which is a dedicated
> protocol for [RabbitMQ streams](/docs/streams). There are a number of clients
> for RabbitMQ in [many different
> languages](/client-libraries/devtools), see the stream client libraries for each language.
> We'll use the [Java stream client](https://github.com/rabbitmq/rabbitmq-stream-java-client) provided by RabbitMQ.
>
> RabbitMQ Java client 0.15.0 and later versions are distributed
> via [Maven Repository](https://mvnrepository.com/artifact/com.rabbitmq/stream-client).
>
> This tutorial assumes you are using powershell on Windows. On MacOS and Linux nearly
> any shell will work.

### Setup

First let's verify that you have Java toolchain in `PATH`:

```powershell
java --help
```
should produce a help message.

We use [Maven](https://maven.apache.org/) to manage dependencies and build the project.
You can find the whole project in the [RabbitMQ tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-stream-mvn/).

You need to verify if you have Maven installed or you can use the Maven wrapper included in the project:

```powershell
./mvnw --help
```


Let's add the dependencies to the `pom.xml` file:

```xml
<dependency>
    <groupId>com.rabbitmq</groupId>
    <artifactId>stream-client</artifactId>
    <version>0.15.0</version>
</dependency>
```

### Sending

We'll call our message producer (sender) `Send.java` and our message consumer (receiver)
`Receive.java`. The producer will connect to RabbitMQ, send a single message,
then exit.

In
[`Send.java`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-stream-mvn/src/main/java/Send.java),
we need to use some namespaces:

```java
import com.rabbitmq.stream.*;
import java.io.IOException;
```

then we can create a connection to the server:

```java
Environment environment = Environment.builder().build();       
...
```

The entry point of the stream Java client is the `Environment`.
It deals with stream management and the creation of publisher and consumer instances.

It abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine we'd simply specify its hostname or IP address on the `Environment.builder()`.

Next we create a producer.

To send, we must declare a stream for us to send to; then we can publish a message
to the stream:

```java
String stream = "hello-java-stream";
environment.streamCreator().stream(stream).maxLengthBytes(ByteCapacity.GB(5)).create();
Producer producer = environment.producerBuilder().stream(stream).build();
producer.send(producer.messageBuilder().addData("Hello, World!".getBytes()).build(), null);
System.out.println(" [x] 'Hello, World!' message sent");
...
```

Declaring a stream is idempotent - it will only be created if it doesn't exist already.

Streams model an append-only log of messages that can be repeatedly read until they expire.
It is a good practice to always define the retention policy, 5Gb in this case.

The message content is a byte array, so you can encode whatever you like there.

When the code above finishes running, the producer connection and stream-system
connection will be closed. That's it for our producer.

Each time you run the producer, it will send a single message to the server and the message will be
appended to the stream.

[Here's the whole Send.java
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-stream-mvn/src/main/java/Send.java).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The [configuration file documentation](/docs/configure#config-items)
> will show you how to set <code>disk_free_limit</code>.

### Receiving

As for the consumer, it is listening for messages from
RabbitMQ. So unlike the producer which publishes a single message, we'll
keep the consumer running continuously to listen for messages and print them out.

The code (in [`Receive.java`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-stream-mvn/src/main/java/Receive.java))
needs some `import`:

```java
import com.rabbitmq.stream.ByteCapacity;
import com.rabbitmq.stream.Consumer;
import com.rabbitmq.stream.Environment;
import com.rabbitmq.stream.OffsetSpecification;
```

Setting up is the same as the producer; we create a, consumer,
and declare the stream from which we're going to consume.
Note this matches up with the stream that `send` publishes to.

```java
Environment environment = Environment.builder().build();
String stream = "hello-java-stream";
environment.streamCreator().stream(stream).maxLengthBytes(ByteCapacity.GB(5)).create();
...
```

Note that we declare the stream here as well. Because we might start
the consumer before the producer, we want to make sure the stream exists
before we try to consume messages from it.

We need to use `Consumer` class to create the consumer and `environment.consumerBuilder()` to configure it.

We're about to tell the server to deliver us the messages from the
queue. We provide a callback `.messageHandler`.

`offset` defines the starting point of the consumer.
In this case, we start from the first message.

```java
Consumer consumer = environment.consumerBuilder()
            .stream(stream)
            .offset(OffsetSpecification.first())
            .messageHandler((unused, message) -> {
                System.out.println("Received message: " + new String(message.getBodyAsBinary()));
            }).build();

....
```

[Here's the whole Receive.java class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-stream-mvn/src/main/java/Receive.java).

### Putting It All Together

Open two terminals.

You can run the clients in any order, as both declare the stream.
We will run the consumer first so you can see it waiting for and then receiving the message:

```powershell
 ./mvnw -q compile exec:java -Dexec.mainClass="Receive"
```

Then run the producer:

```powershell
 ./mvnw -q compile exec:java -Dexec.mainClass="Send"
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages, so try restarting
the publisher several times.

Streams are different from queues in that they are append-only logs of messages.
So you can run the different consumers and they will always start from the first message.