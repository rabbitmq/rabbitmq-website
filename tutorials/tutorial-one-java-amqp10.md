---
title: RabbitMQ tutorial - "Hello World!" (AMQP 1.0)
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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
import TutorialsIntro from '@site/src/components/Tutorials/TutorialsIntro.md';
import T1DiagramHello from '@site/src/components/Tutorials/T1DiagramHello.md';
import T1DiagramSending from '@site/src/components/Tutorials/T1DiagramSending.md';
import T1DiagramReceiving from '@site/src/components/Tutorials/T1DiagramReceiving.md';

# RabbitMQ tutorial - "Hello World!"

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## "Hello World"
### (using the AMQP 1.0 Java client)

In this part of the tutorial we'll write two programs in Java; a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the detail in
the Java API, concentrating on this very simple thing just to get
started. It's the "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<T1DiagramHello/>

> #### The AMQP 1.0 Java client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses **AMQP 1.0** over the same port as AMQP 0-9-1 (5672 by default). It requires **RabbitMQ 4.0 or later**.
>
> Use the RabbitMQ **AMQP 1.0** Java client (`com.rabbitmq.client:amqp-client`), not the classic AMQP 0-9-1 client (`com.rabbitmq:amqp-client`). See [AMQP 1.0 client libraries](/client-libraries/amqp-client-libraries) and the [client reference](https://rabbitmq.github.io/rabbitmq-amqp-java-client/stable/htmlsingle/).
>
> Add the dependency to your build, for example with Maven:
>
> ```xml
> <dependency>
>   <groupId>com.rabbitmq.client</groupId>
>   <artifactId>amqp-client</artifactId>
>   <version>1.0.0</version>
> </dependency>
> ```
>
> Runnable sources for this tutorial series live alongside the other ports in the [RabbitMQ tutorials](https://github.com/rabbitmq/rabbitmq-tutorials) repository (`java-amqp` directory).

Now we have the client on the classpath, we can write some
code.

### Sending

<T1DiagramSending/>

We'll call our message publisher (sender) `Send` and our message consumer (receiver)
`Recv`. The publisher will connect to RabbitMQ, send a single message,
then exit.

In
[`Send.java`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-amqp/Send.java),
we need some classes imported:

```java
import com.rabbitmq.client.amqp.Connection;
import com.rabbitmq.client.amqp.Environment;
import com.rabbitmq.client.amqp.Publisher;
import com.rabbitmq.client.amqp.impl.AmqpEnvironmentBuilder;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
```

Set up the class and name the queue:

```java
public class Send {
  private static final String QUEUE_NAME = "hello";
  public static void main(String[] argv) throws Exception {
      ...
  }
}
```

Then create an [environment](https://rabbitmq.github.io/rabbitmq-amqp-java-client/stable/htmlsingle/#connection-settings-at-the-environment-level)
and a **connection**. The environment holds shared settings; each connection targets the broker.
Here the URI points at a broker on the local machine with the default virtual host (`%2f` is `/`).

```java
Environment environment = new AmqpEnvironmentBuilder()
  .connectionSettings()
  .uri("amqp://guest:guest@localhost:5672/%2f")
  .environmentBuilder()
  .build();
Connection connection = environment.connectionBuilder().build();
```

The connection abstracts the socket connection and takes care of protocol
negotiation and authentication. To connect to a different host, change the host (and credentials) in the URI.

```java
connection.management().queue(QUEUE_NAME).quorum().queue().declare();
```

RabbitMQ still exposes the **AMQ 0.9.1 model** (queues, exchanges, bindings) for topology. Declare a 
**quorum queue** before publishing. The declare API uses a fluent chain; for quorum queues it must end
with `.quorum().queue().declare()`. Declaring a queue is idempotent: it is only created if it does not
already exist.

To send a message, create a **publisher** addressed at the queue, build a message, and call `publish`.
The broker reports the outcome asynchronously; wait on a latch so the program does not exit before feedback
arrives. A successful publish has status `Publisher.Status.ACCEPTED`:

```java
try (Publisher publisher = connection.publisherBuilder().queue(QUEUE_NAME).build()) {
  String message = "Hello World!";
  CountDownLatch latch = new CountDownLatch(1);
  publisher.publish(
      publisher.message(message.getBytes(StandardCharsets.UTF_8)),
      context -> {
        if (context.status() == Publisher.Status.ACCEPTED) {
          System.out.println(" [x] Sent '" + message + "'");
        }
        latch.countDown();
      });
  if (!latch.await(5, TimeUnit.SECONDS)) {
    throw new IllegalStateException("Timed out waiting for publish outcome");
  }
}
```

[Here's the whole Send.java
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-amqp/Send.java).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker [log file](/docs/logging/) to see if there
> is a [resource alarm](/docs/alarms) logged and reduce the
> free disk space threshold if necessary.
> The [Configuration guide](/docs/configure#config-items)
> will show you how to set <code>disk_free_limit</code>.


### Receiving

That's it for our publisher. Our consumer listens for messages from
RabbitMQ, so unlike the publisher which publishes a single message, we'll
keep the consumer running to listen for messages and print them out.

<T1DiagramReceiving/>

The code in [`Recv.java`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-amqp/Recv.java) uses the same environment and connection setup. Open a connection, then declare the same queue so the consumer can start before the publisher:

```java
import com.rabbitmq.client.amqp.Connection;
import com.rabbitmq.client.amqp.Consumer;
import com.rabbitmq.client.amqp.Environment;
import com.rabbitmq.client.amqp.impl.AmqpEnvironmentBuilder;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
```

```java
public class Recv {

  private static final String QUEUE_NAME = "hello";

  public static void main(String[] argv) throws Exception {
    Environment environment = new AmqpEnvironmentBuilder()
        .connectionSettings()
        .uri("amqp://guest:guest@localhost:5672/%2f")
        .environmentBuilder()
        .build();
    Connection connection = environment.connectionBuilder().build();

    connection.management().queue(QUEUE_NAME).quorum().queue().declare();
    System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

    Consumer consumer = connection.consumerBuilder()
        .queue(QUEUE_NAME)
        .messageHandler((context, message) -> {
          String text = new String(message.body(), StandardCharsets.UTF_8);
          System.out.println(" [x] Received '" + text + "'");
          context.accept();
        })
        .build();

    new CountDownLatch(1).await();
  }
}
```

Note that we declare the queue here as well. Because we might start
the consumer before the publisher, we want to make sure the queue exists
before we try to consume messages from it.

Why not use try-with-resources on `Environment` and `Connection` in the consumer? Closing them would stop the process as soon as the try block ends. The sample keeps the consumer running; use **Ctrl+C** to stop the JVM (or extend the example to close resources on shutdown).

With AMQP 1.0, the consumer **must settle** each message (`accept`, `discard`, or `requeue`). Here we call `context.accept()` after printing the body.

[Here's the whole Recv.java
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-amqp/Recv.java).

### Putting it all together

Create a `pom.xml` that includes the client and the [Exec Maven Plugin](https://www.mojohaus.org/exec-maven-plugin/) so you can run the classes by name:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.rabbitmq.examples</groupId>
  <artifactId>amqp10-tutorials</artifactId>
  <version>1.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>11</maven.compiler.release>
  </properties>
  <dependencies>
    <dependency>
      <groupId>com.rabbitmq.client</groupId>
      <artifactId>amqp-client</artifactId>
      <version>1.0.0</version>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>exec-maven-plugin</artifactId>
        <version>3.1.0</version>
        <configuration>
          <mainClass>${exec.mainClass}</mainClass>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

Place `Send.java` and `Recv.java` under `src/main/java/`, then in one terminal run the consumer:

```bash
mvn -q compile exec:java -Dexec.mainClass=Recv
```

Then run the publisher:

```bash
mvn -q compile exec:java -Dexec.mainClass=Send
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages (use Ctrl+C to stop it), so try running
the publisher from another terminal.

> #### Listing queues
>
> You may wish to see what queues RabbitMQ has and how many
> messages are in them. You can do it (as a privileged user) using the `rabbitmqctl` tool:
>
> ```bash
> sudo rabbitmqctl list_queues
> ```
>
> On Windows, omit the sudo:
> ```PowerShell
> rabbitmqctl.bat list_queues
> ```


Time to move on to [part 2](./tutorial-two-java-amqp10) and build a simple _work queue_.
