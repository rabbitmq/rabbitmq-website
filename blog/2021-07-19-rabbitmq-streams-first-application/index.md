---
title: "First Application With RabbitMQ Streams"
tags: ["Streams", "Programming Languages", "New Features", ]
authors: [acogoluegnes]
---

[RabbitMQ Streams Overview](/blog/2021/07/13/rabbitmq-streams-overview) introduced streams, a new feature in RabbitMQ 3.9.
This post continues by showing how to use streams with the Java client.
We will write our first application that publishes messages to a stream, and then consumes them.

<!-- truncate -->

## Starting RabbitMQ with Streams Enabled

Let's start a RabbitMQ Docker container:

```shell
docker run -it --rm --name rabbitmq -p 5552:5552 \
    -e RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS='-rabbitmq_stream advertised_host localhost' \
    rabbitmq:3.9
```

Streams ship as a core plugin in RabbitMQ 3.9, so we have to make sure this plugin is enabled.
Open a new terminal tab and execute the following command:

```shell
docker exec rabbitmq rabbitmq-plugins enable rabbitmq_stream
```

The next step is to *connect* a client application to the stream plugin.

## Connecting to RabbitMQ Streams

We will use the [stream Java client](https://github.com/rabbitmq/rabbitmq-stream-java-client) to interact with streams.
The client documentation covers how to declare the appropriate dependencies in a [Maven project](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/#maven) and in a [Gradle project](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/#gradle), so we can focus on the code in this post.


The entry point of the stream Java client is the `Environment`. It deals with stream management and the creation of publisher and consumer instances.
Here is how to create an `Environment` instance:

```java
try (Environment environment = Environment.builder()
        .uri("rabbitmq-stream://localhost:5552").build()) {

 // ...

}
```

We have the environment, let's create a stream.

## Creating a Stream

The environment provides an API to create streams, we'll use it to create a `first-application-stream` stream with all the defaults:

```java
environment.streamCreator().stream("first-application-stream").create();
```

The stream is there, time to publish to it.

## Publishing to a Stream

We need to create a `Producer` instance to publish to the stream. We use again the `Environment` to create this object:


```java
Producer producer = environment
    .producerBuilder()
    .stream("first-application-stream") // stream to publish to
    .build();
```

We are going to publish some messages in a loop, let's proceed step by step and build the skeleton of the publishing loop:


```java
int messageCount = 1_000_000;
CountDownLatch confirmLatch = new CountDownLatch(messageCount);
IntStream.range(0, messageCount).forEach(i -> {
    // send one message
});
boolean done = confirmLatch.await(1, TimeUnit.MINUTES);
```

Note the use of a `CountDownLatch` to make sure we move on only when we get all the publish confirmations, more on this later.

We will focus now on the creation of a message.
RabbitMQ Streams uses the [AMQP 1.0 message format](https://www.amqp.org/resources/specifications), as it is a flexible and powerful format, with an advanced type system.
Using AMQP 1.0 message format allows for interoperability, making streams compatible with the other protocols RabbitMQ supports (AMQP 0.9.1 and 1.0, MQTT, STOMP.)

The stream Java client provides a message builder interface to create messages, we use it to create a message with a couple of properties and a binary payload:

```java
Message message = producer.messageBuilder()
        .properties()
            .creationTime(System.currentTimeMillis())
            .messageId(i)
        .messageBuilder()
        .addData("hello world".getBytes(StandardCharsets.UTF_8))
        .build();
```

OK, we have our message instance, the next step is to publish it.
But let's get back quickly to this AMQP 1.0 message format thing.
We want to insist on the fact that RabbitMQ Streams uses only the AMQP 1.0 *message format*, not the AMQP 1.0 *protocol*.
RabbitMQ Streams has its own binary protocol, that happens to convey messages encoded in AMQP 1.0 format in some of its frames.
The message encoding is actually a client responsibility: RabbitMQ Streams is message format agnostic.
Messages are just byte arrays, e.g. `[100, 76, 240, ...]`.
The AMQP 1.0 message format however makes streams highly operable with other protocols, such as AMQP 0.9.1, MQTT, etc. which streams support by default.

Time now to send our message, we just have to pass it in to the producer:

```java
producer.send(message, confirmationStatus -> confirmLatch.countDown());
```

Note the second argument of the `send` method: this is the callback when the publish confirmation for this message arrives asynchronously.
This is how you can make sure messages are not lost.
Here we just decrement the count of the `CoundDownLatch`.

This is what all of the above looks like in code:

```java
int messageCount = 1_000_000;
CountDownLatch confirmLatch = new CountDownLatch(messageCount);
IntStream.range(0, messageCount).forEach(i -> {
    Message message = producer.messageBuilder()
        .properties()
            .creationTime(System.currentTimeMillis())
            .messageId(i)
        .messageBuilder()
        .addData("hello world".getBytes(StandardCharsets.UTF_8))
        .build();
    producer.send(message, confirmationStatus -> confirmLatch.countDown());
});
boolean done = confirmLatch.await(1, TimeUnit.MINUTES);
```

## Running the Publisher

You can run the publisher sample locally, the [code is hosted on GitHub](https://github.com/acogoluegnes/rabbitmq-streams-blog-posts).
You just need JDK 8 or higher installed, and a running instance of RabbitMQ 3.9 with the rabbit_stream plugin enabled, as described above.

```shell
git clone https://github.com/acogoluegnes/rabbitmq-streams-blog-posts.git
cd rabbitmq-streams-blog-posts
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.FirstApplication$Publish'
```

You should get an output like the following, confirming the messages has been taken into account by the broker:

```
Connecting...
Connected
Creating stream...
Stream created
Creating producer...
Producer created
Sending 1,000,000 messages
Messages sent, waiting for confirmation...
All messages confirmed? yes (1440 ms)
Closing environment...
Environment closed
```

The `rabbitmq-streams stream_status` CLI command confirms the messages landed on the broker:

```shell
docker exec rabbitmq rabbitmq-streams stream_status first-application-stream
```

You should see the following output:

```
Status of stream first-application-stream on node rabbit@ba9dbabe12b8 ...
┌────────┬─────────────────────┬────────┬──────────────────┬──────────────┬─────────┬──────────┐
│ role   │ node                │ offset │ committed_offset │ first_offset │ readers │ segments │
├────────┼─────────────────────┼────────┼──────────────────┼──────────────┼─────────┼──────────┤
│ writer │ rabbit@ba9dbabe12b8 │ 999999 │ 999938           │ 0            │ 0       │ 1        │
└────────┴─────────────────────┴────────┴──────────────────┴──────────────┴─────────┴──────────┘
```

I want to highlight the `offset` column, which tells us the index of the last message in the stream, `999,999` in the example above.
This confirms the stream contains 1 million messages (offsets start from `0`).

## Consuming the Messages

The consuming code is straightforward.
We need to create a `Consumer` instance from the `Environment`.
This requires to set a few parameters: the stream to consume from, the offset to start consuming from — `first` here —, and the behavior when receiving a message.
Here is the code:


```java
AtomicInteger messageConsumed = new AtomicInteger(0); // just a counter
Consumer consumer = environment.consumerBuilder()
    .stream("first-application-stream") // stream to consume from
    .offset(OffsetSpecification.first()) // where to start consuming
    .messageHandler((context, message) -> messageConsumed.incrementAndGet()) // behavior
    .build();
```

The code just increments a counter when a new message is received.

## Running the Consumer

You can run the consumer code with the following command:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.FirstApplication$Consume'
```

You should see something like the following in the console:

```
Connecting...
Connected
Start consumer...
Consumed 1,000,000 messages in 732 ms
Closing environment...
Environment closed
```

Congratulations! The messages made it to the consumer.

You can make sure a consumer can read and re-read messages _without removing them from the stream_ by running the consumer program several times.
You will get the same number of consumed messages each time.

## Wrapping Up

This concludes the writing of our first RabbitMQ Streams application. Here are the main elements to remember:

* The [stream Java client](https://github.com/rabbitmq/rabbitmq-stream-java-client) provides comprehensive support for RabbitMQ Streams.
* The main API are `Environment`, `Producer`, and `Consumer`.
* Messages use the rich and interoperable AMQP 1.0 format.
* The stream Java client provide a high-level API, it deals with boilerplate and lets developers focus on application code.

As a bonus, here is a video that covers RabbitMQ Streams and the [stream Go client](https://github.com/rabbitmq/rabbitmq-stream-go-client):

<iframe width="560" height="315" src="https://www.youtube.com/embed/m47E3XUzdAM?si=02yJM-rBGpMThrNa" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

The RabbitMQ team is looking forward to hearing your feedback on streams and on the stream client libraries ([Java](https://github.com/rabbitmq/rabbitmq-stream-java-client), [Go](https://github.com/rabbitmq/rabbitmq-stream-go-client)).
We are planning to write a [.NET client](https://github.com/rabbitmq/rabbitmq-stream-dotnet-client) for the [stream protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v3.9.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc), so if you have .NET skills, you can come up with design suggestions or even a prototype.

Stay tuned for other blog posts on streams, where we'll cover features like publishing de-duplication, offset tracking, and interoperability between protocols supported in RabbitMQ.
