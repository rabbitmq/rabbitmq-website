---
title: RabbitMQ tutorial - Work Queues (AMQP 1.0)
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
import T2DiagramToC from '@site/src/components/Tutorials/T2DiagramToC.md';
import T2DiagramPrefetch from '@site/src/components/Tutorials/T2DiagramPrefetch.md';

# RabbitMQ tutorial - Work Queues

## Work Queues
### (using the AMQP 1.0 Java client)

<TutorialsHelp/>

<T2DiagramToC/>

In the [first tutorial](./tutorial-one-java-amqp10) we
wrote programs to send and receive messages from a named queue. In this
one we'll create a _Work Queue_ that will be used to distribute
time-consuming tasks among multiple workers.

The main idea behind Work Queues (aka: _Task Queues_) is to avoid
doing a resource-intensive task immediately and having to wait for
it to complete. Instead we schedule the task to be done later. We encapsulate a
_task_ as a message and send it to a queue. A worker process running
in the background will pop the tasks and eventually execute the
job. When you run many workers the tasks will be shared between them.

This concept is especially useful in web applications where it's
impossible to handle a complex task during a short HTTP request
window.

This tutorial uses the [RabbitMQ AMQP 1.0 Java client](/client-libraries/amqp-client-libraries) (`com.rabbitmq.client:amqp-client`). It requires RabbitMQ **4.0 or later**. Runnable sources live in the [RabbitMQ tutorials](https://github.com/rabbitmq/rabbitmq-tutorials) repository (`java-amqp` directory).

Preparation
-----------

In the previous part of this tutorial we sent a message containing
"Hello World!". Now we'll be sending strings that stand for complex
tasks. We don't have a real-world task, like images to be resized or
pdf files to be rendered, so let's fake it by just pretending we're
busy - by using the `Thread.sleep()` function. We'll take the number of dots
in the string as its complexity; every dot will account for one second
of "work".  For example, a fake task described by `Hello...`
will take three seconds.

We will slightly modify the _Send.java_ pattern from our previous example,
to allow arbitrary messages to be sent from the command line. This
program will schedule tasks to our work queue, so let's name it
`NewTask.java`:

```java
String message = String.join(" ", argv);
// ... obtain a Publisher for the task queue, then:
publisher.publish(
    publisher.message(message.getBytes(StandardCharsets.UTF_8)).durable(true),
    context -> { /* wait for broker outcome; print on ACCEPTED */ });
```

Our old consumer program also requires some changes: it needs to
fake a second of work for every dot in the message body. It will handle
delivered messages and perform the task, so let's call it `Worker.java`:

```java
connection.consumerBuilder()
    .queue(TASK_QUEUE_NAME)
    .messageHandler((context, message) -> {
      String text = new String(message.body(), StandardCharsets.UTF_8);
      System.out.println(" [x] Received '" + text + "'");
      try {
        doWork(text);
      } finally {
        System.out.println(" [x] Done");
        context.accept();
      }
    })
    .build();
```

Settlement (`accept`) is covered in more detail below; the worker must **not** use `preSettled()` delivery if tasks must survive worker failures.

Our fake task to simulate execution time:

```java
private static void doWork(String task) throws InterruptedException {
    for (char ch: task.toCharArray()) {
        if (ch == '.') Thread.sleep(1000);
    }
}
```

Build and run with Maven as in [tutorial one](./tutorial-one-java-amqp10) (same `com.rabbitmq.client:amqp-client` dependency and Exec plugin).

Round-robin dispatching
-----------------------

One of the advantages of using a Task Queue is the ability to easily
parallelise work. If we are building up a backlog of work, we can just
add more workers and that way, scale easily.

First, let's try to run two worker instances at the same time. They
will both get messages from the queue, but how exactly? Let's see.

You need three consoles open. Two will run the worker
program. These consoles will be our two consumers - C1 and C2.

```bash
# shell 1
mvn -q compile exec:java -Dexec.mainClass=Worker
# => [*] Waiting for messages. To exit press CTRL+C
```

```bash
# shell 2
mvn -q compile exec:java -Dexec.mainClass=Worker
# => [*] Waiting for messages. To exit press CTRL+C
```

In the third one we'll publish new tasks. Once you've started
the consumers you can publish a few messages:

```bash
# shell 3
mvn -q compile exec:java -Dexec.mainClass=NewTask -Dexec.args='First message.'
# => [x] Sent 'First message.'
mvn -q compile exec:java -Dexec.mainClass=NewTask -Dexec.args='Second message..'
# => [x] Sent 'Second message..'
```

Use your shell's quoting rules so the task string is passed as program arguments to `NewTask` (the examples above work with `-Dexec.args` under Unix; on Windows you may prefer running from your IDE or a small script).

Let's see what is delivered to our workers:

```bash
mvn -q compile exec:java -Dexec.mainClass=Worker
# => [*] Waiting for messages. To exit press CTRL+C
# => [x] Received 'First message.'
# => [x] Received 'Third message...'
# => [x] Received 'Fifth message.....'
```

```bash
mvn -q compile exec:java -Dexec.mainClass=Worker
# => [*] Waiting for messages. To exit press CTRL+C
# => [x] Received 'Second message..'
# => [x] Received 'Fourth message....'
```

By default, RabbitMQ will send each message to the next consumer,
in sequence. On average every consumer will get the same number of
messages. This way of distributing messages is called round-robin. Try
this out with three or more workers.


Message acknowledgment
----------------------

Doing a task can take a few seconds, you may wonder what happens if
a consumer starts a long task and it terminates before it completes.
With the default **at-least-once** consumption mode, the consumer must **settle** each message (`accept`, `discard`, or `requeue`). Until you settle, the broker can redeliver the message if the worker stops.

In order to make sure a message is not lost when a worker dies after receiving it but before finishing processing, settle only **after** the task is done. Here we call `context.accept()` in a `finally` block after `doWork` returns.

If a consumer dies without settling, RabbitMQ will redeliver the message. If there are other consumers online at the same time, it will quickly redeliver it
to another consumer. That way you can be sure that no message is lost,
even if the workers occasionally die.

A timeout is enforced on consumer delivery acknowledgement (see [Delivery Acknowledgement Timeout](/docs/consumers#acknowledgement-timeout)).

Do **not** enable `ConsumerBuilder.preSettled()` for this tutorial: that mode delivers messages already settled and they cannot be redelivered if the worker crashes.

```java
connection.consumerBuilder()
    .queue(TASK_QUEUE_NAME)
    .messageHandler((context, message) -> {
      String text = new String(message.body(), StandardCharsets.UTF_8);
      System.out.println(" [x] Received '" + text + "'");
      try {
        doWork(text);
      } finally {
        System.out.println(" [x] Done");
        context.accept();
      }
    })
    .build();
```

Using this pattern, if you terminate a worker using
CTRL+C while it was processing a message, the message can be redelivered to another consumer once the acknowledgement timeout elapses.

> #### Forgotten settlement
>
> It's a common mistake to omit `context.accept()` (or to call it before work finishes). Messages will be redelivered
> when your client quits (which may look like random redelivery), and unacked deliveries accumulate on the broker.
>
> You can use `rabbitmqctl` to inspect queues:
>
> ```bash
> sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
> ```
>
> On Windows, drop the sudo:
> ```bash
> rabbitmqctl.bat list_queues name messages_ready messages_unacknowledged
> ```

Message durability
------------------

We have learned how to make sure that even if the consumer dies, the
task isn't lost before settlement. But our tasks will still be lost if the RabbitMQ server stops.

When RabbitMQ quits or crashes it will forget queues and messages unless you configure durability.
In modern versions of RabbitMQ, that is 4.0 or later, transient non-exclusive queues are deprecated.
In virtually all uses cases, you should use durable queues. Quorum Queues are **always** durable.
Classic Queues can be made durable, which is a strong recommendation.

This library makes durable queues by default. For messages, mark outbound messages as **durable** when publishing. Set `durable(true)` on the `Message` to mark messages as durable. This is important for
Classic Queues. In Quorum Queues, messages are always durable.

First, declare a **quorum** queue named `task_queue` (not `hello`, to avoid clashing with an existing non-durable queue from experiments):

```java
connection.management().queue("task_queue").quorum().queue().declare();
```

Apply the same declaration in both producer and consumer before publishing or consuming.

When publishing, build a durable message:

```java
publisher.publish(
    publisher.message(message.getBytes(StandardCharsets.UTF_8)).durable(true),
    callback);
```

> #### Note on message persistence
>
> Marking messages as durable does not fully guarantee that a message
> will never be lost. There is still a small window around broker I/O. For stronger guarantees consider [publisher confirms](/docs/confirms) and the AMQP 1.0 client's per-publish callbacks (`Publisher.Status`).


Fair dispatch
----------------

You might have noticed that the dispatching still doesn't work exactly
as we want. For example in a situation with two workers, when all
odd messages are heavy and even messages are light, one worker will be
constantly busy and the other one will do hardly any work. Well,
RabbitMQ doesn't know anything about that and will still dispatch
messages evenly.

This happens because the broker may dispatch several messages before earlier ones are settled.

<T2DiagramPrefetch/>

With the AMQP 1.0 Java client, limit how many messages are **in flight** per consumer by setting **initial credits** to `1` on the consumer builder. This is the analogue of `basicQos(1)` / prefetch 1 in AMQP 0-9-1:

```java
connection.consumerBuilder()
    .queue(TASK_QUEUE_NAME)
    .initialCredits(1)
    .messageHandler((context, message) -> { ... })
    .build();
```

> #### Note about queue size
>
> If all the workers are busy, your queue can fill up. You will want to keep an
> eye on that, and maybe add more workers, or have some other strategy.

Putting it all together
-----------------------

Final outline of `NewTask.java`:

```java
import com.rabbitmq.client.amqp.Connection;
import com.rabbitmq.client.amqp.Environment;
import com.rabbitmq.client.amqp.Publisher;
import com.rabbitmq.client.amqp.impl.AmqpEnvironmentBuilder;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class NewTask {

  private static final String TASK_QUEUE_NAME = "task_queue";

  public static void main(String[] argv) throws Exception {
    try (Environment environment = new AmqpEnvironmentBuilder()
        .connectionSettings()
        .uri("amqp://guest:guest@localhost:5672/%2f")
        .environmentBuilder()
        .build();
        Connection connection = environment.connectionBuilder().build()) {

      connection.management().queue(TASK_QUEUE_NAME).quorum().queue().declare();

      String message = String.join(" ", argv);

      try (Publisher publisher = connection.publisherBuilder().queue(TASK_QUEUE_NAME).build()) {
        CountDownLatch latch = new CountDownLatch(1);
        publisher.publish(
            publisher.message(message.getBytes(StandardCharsets.UTF_8)).durable(true),
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
    }
  }
}
```

[(NewTask.java source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-amqp/NewTask.java)

And `Worker.java`:

```java
import com.rabbitmq.client.amqp.Connection;
import com.rabbitmq.client.amqp.Consumer;
import com.rabbitmq.client.amqp.Environment;
import com.rabbitmq.client.amqp.impl.AmqpEnvironmentBuilder;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;

public class Worker {

  private static final String TASK_QUEUE_NAME = "task_queue";

  public static void main(String[] argv) throws Exception {
    Environment environment = new AmqpEnvironmentBuilder()
        .connectionSettings()
        .uri("amqp://guest:guest@localhost:5672/%2f")
        .environmentBuilder()
        .build();
    Connection connection = environment.connectionBuilder().build();

    connection.management().queue(TASK_QUEUE_NAME).quorum().queue().declare();
    System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

    Consumer consumer = connection.consumerBuilder()
        .queue(TASK_QUEUE_NAME)
        .initialCredits(1)
        .messageHandler((context, message) -> {
          String text = new String(message.body(), StandardCharsets.UTF_8);
          System.out.println(" [x] Received '" + text + "'");
          try {
            doWork(text);
          } finally {
            System.out.println(" [x] Done");
            context.accept();
          }
        })
        .build();

    new CountDownLatch(1).await();
  }

  private static void doWork(String task) {
    for (char ch : task.toCharArray()) {
      if (ch == '.') {
        try {
          Thread.sleep(1000);
        } catch (InterruptedException ignored) {
          Thread.currentThread().interrupt();
        }
      }
    }
  }
}
```

[(Worker.java source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java-amqp/Worker.java)

Using explicit settlement and `initialCredits(1)` you can set up a
work queue. Quorum queues and durable messages let tasks survive broker restarts as in the AMQP 0-9-1 tutorial.

For API details see the [AMQP 1.0 Java client Javadoc](https://rabbitmq.github.io/rabbitmq-amqp-java-client/stable/api/).

Now we can move on to [tutorial 3](./tutorial-three-java-amqp10) and learn how
to deliver the same message to many consumers.
