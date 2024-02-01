---
title: "Message Deduplication with RabbitMQ Streams"
tags: ["Streams", "Programming Languages", "New Features", ]
authors: [acogoluegnes]
---

[RabbitMQ Streams Overview](/blog/2021/07/13/rabbitmq-streams-overview) introduced streams, a new feature in RabbitMQ 3.9 and [RabbitMQ Streams First Application](/blog/2021/07/19/rabbitmq-streams-first-application) provided an overview of the programming model with the stream Java client. This post covers how to deduplicate published messages in RabbitMQ Streams.

As deduplication is a critical and intricate concept, the post will walk you through this mechanism step by step, from a naive and somewhat broken publishing application to an optimized and reliable implementation.

<!-- truncate -->

## The Problem With Duplicate Messages

It is quite easy for an application to publish the same message several times: the application is restarted in the wrong way and re-publishes all the data from the beginning, a network glitch makes the application reconnect and re-send a couple of messages, etc.

Even though consuming applications should make their processing idempotent, duplicated published messages should be avoided as much as possible, as they can slow down processing and use extra space.

This post will start from a simple application that generates lots of duplicate messages (to help grasp the problem) and will improve it little by little to get a robust solution at the end.

## Publishing Without Deduplication

The publishing program mimics an application that reads records from a data source and publish a message for each a of these records:

```java
Producer producer = environment.producerBuilder()
  .stream("deduplication-stream")
  .build();
int messageCount = 10;
records(0, messageCount).forEach(record -> {
  Message message = producer.messageBuilder()
    .addData(record.content().getBytes(StandardCharsets.UTF_8))
    .build();
  producer.send(message, confirmationStatus -> latch.countDown());
});
```

We suppose the application reads _all_ the records available, and that number is 10 for the first run.
In case you want a reminder on the stream Java client API, you can read [RabbitMQ Streams First Application](/blog/2021/07/19/rabbitmq-streams-first-application). 

If you want to run the code as you are reading, you can move on to the next section.
Note you can follow the remaining of the post without running anything, so you can skip the next section if you don't want to try out the code.

### Setting Up The Sample Project

Running the samples requires Docker, Git, and Java 8 or higher installed.
You can start the broker with the following command:

```shell
docker run -it --rm --name rabbitmq -p 5552:5552 \
    -e RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS='-rabbitmq_stream advertised_host localhost' \
    rabbitmq:3.9
```

You need then to enable the stream plugin:

```shell
docker exec rabbitmq rabbitmq-plugins enable rabbitmq_stream
```

The [code is hosted on GitHub](https://github.com/acogoluegnes/rabbitmq-streams-blog-posts).
Here is how to clone the repository and create the stream used in the samples:

```shell
git clone https://github.com/acogoluegnes/rabbitmq-streams-blog-posts.git
cd rabbitmq-streams-blog-posts
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$CreateEmptyStream'
```

OK, you are all set, let's run the publishing application.

### Running The Publisher On The First Day

Run the publishing application with the following command:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$PublishFirstDay'
Connecting...
Connected.
Publishing 10 messages.
Messages confirmed? yes
```

With this first run, the application read all the records from the data source (that is 10 records overall for this run) and send a message for each of them.
We can check the content of the stream with the following command:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$Consume'        
Connecting...
Connected.
Starting consuming, press Enter to exit...
message 0
message 1
message 2
message 3
message 4
message 5
message 6
message 7
message 8
message 9
```

So far, so good, we published 10 messages and we can see 10 messages in the stream.
Let's now if our application is viable and keeps working correctly for a second run.

### Running the Publisher On The Second Day

We can imagine now that we run the application on the next day and the data source contains 10 additional records, so 20 records overall.
Our publishing application is dumb: it will read everything from the data source and publishing messages.
Let's try:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$PublishSecondDay'
Connecting...
Connected.
Publishing 20 messages.
Messages confirmed? yes
```

And the content of the stream now:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$Consume'
Connecting...
Connected.
Starting consuming, press Enter to exit...
message 0
message 1
message 2
...
message 9
message 0
message 1
message 2
...
message 9
message 10
message 11
...
message 19
```

We see 30 messages: the 10 from the first run and the 20 from the second run.
The first 10 appears twice, so our stream contains duplicate.
With the way we implemented the application this is expected, but we have to fix this, because we just want to the new records to be published on the second run.

This is when _deduplication_ in RabbitMQ Streams comes in.

## Publishing With Deduplication

We need 2 things to enable deduplication on publishing:

* a _name_ for the producer
* a strictly increasing sequence value for each record, the _publishing ID_

The [stream Java client documentation](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/#outbound-message-de-deduplication) provides more details about the producer name and the publishing ID.
Note message deduplication is not specific to the stream Java client, it can be implemented by any client as long as it complies to the semantics.

We just have to pick a name for our publishing application and keep this name along the different runs.
For the publishing ID, we can use the ID of a record: it happens to be unique and the records are returned sorted by ID (e.g. just like records from a database with a numeric primary key and the appropriate query).

Here is now our publishing application with the producer name and publishing ID changes:

```java
Producer producer = environment.producerBuilder()
  .stream("deduplication-stream")
  .name("app-1") // provide a name for the producer
  .confirmTimeout(Duration.ZERO) // to never stop retrying
  .build();
int messageCount = 10;
records(0, messageCount).forEach(record -> {
  Message message = producer.messageBuilder()
    .publishingId(record.id()) // set the publishing ID
    .addData(record.content().getBytes(StandardCharsets.UTF_8))
    .build();
  producer.send(message, confirmationStatus -> latch.countDown());
});
```

The broker will keep track of the last publishing ID for this producer.
We'll see how this allows to deduplicate messages.

### Running The Publisher On The First Day

Let's re-create our stream first:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$CreateEmptyStream'
Connection...
Connected. Trying to delete stream if it exists.
Stream deleted.
Creating 'deduplication-stream' stream.
Stream created.
```

Then we can run our improved publishing application a first time:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$PublishDedupFirstDay'
Connecting...
Connected.
Publishing 10 messages with deduplication enabled.
Messages confirmed? yes
```

OK, 10 messages in the data source on the first day.

### Running The Publisher On The Second Day

We run now our application on the second day, with the extra 10 records.
Our application is less dumb that the first time: it uses the producer name and the publishing ID for deduplication. But it still reads _all_ the records from the data source:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$PublishDedupSecondDay'
Connecting...
Connected.
Publishing 20 messages with deduplication enabled.
Messages confirmed? yes
```

And the content of the stream:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$Consume'
Connecting...
Connected.
Starting consuming, press Enter to exit...
message 0
message 1
message 2
...
message 9
message 10
message 11
message 12
...
message 19
```

No duplicates this time, nice!
Even though we re-published the first 10 messages, the broker managed to filter them out.
It knew that it should ignore all the messages with a publishing ID lesser than 9 (the last value in the first run).
Note even though it filtered out these duplicates, it nevertheless confirmed them to the client.

This is much better that our first application where we ended up with duplicates, but there's still a problem: the application re-sends _all_ the messages every time.
If the data keeps growing, the application will take more and more time for each run.
Fortunately it is possible to find out where the application left off in the last run.

## Know Where You Left Off: Making The Publisher Smarter

We'll see in this section how to make the publishing application even smarter by using not only deduplication but also querying the broker to for the last publishing ID it sent. 

### Running The Publisher On The First Day

We have to re-create our empty stream:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$CreateEmptyStream'
Connection...
Connected. Trying to delete stream if it exists.
Stream deleted.
Creating 'deduplication-stream' stream.
Stream created.
```

And we can re-use our publishing application to send the first 10 messages:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$PublishDedupFirstDay'
Connecting...
Connected.
Publishing 10 messages with deduplication enabled.
Messages confirmed? yes
```

This version of the application is not the smartest, but it is enough for "the first day".

### Running The (Smart) Publisher On The First Day

The publishing application needs to do better for the second day, where the data source contains now 20 messages.
It can use the `Producer#getLastPublishingId` method which queries the broker for the last publishing ID of this producer for this stream.
The application can add 1 to this value and it will get its starting point.
Then it just has to select the records from this point until the last record available.
This way it does not re-publish from the beginning.
The following code shows how to do this:

```java
Producer producer = environment.producerBuilder()
  .stream("deduplication-stream")
  .name("app-1") // provide a name for the producer
  .confirmTimeout(Duration.ZERO) // to never stop retrying
  .build();
long start = producer.getLastPublishingId() + 1; // get last publishing ID and add 1
int messageCount = 20;
records(start, messageCount).forEach(record -> {
  Message message = producer.messageBuilder()
    .publishingId(record.id()) // set the publishing ID
    .addData(record.content().getBytes(StandardCharsets.UTF_8))
    .build();
  producer.send(message, confirmationStatus -> latch.countDown());
});
```

Let's run now this smart publisher:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$PublishSmartDedupSecondDay'
Connecting...
Connected.
Starting publishing at 10
Publishing 10 message with deduplication enabled.
Messages confirmed? yes
```

So the publisher starts at 10 (9, the last publishing ID of the first run, + 1) and publishes the 10 (20, total, - 10 already published) new messages.
We can check the content of the stream:

```shell
./mvnw -q compile exec:java -Dexec.mainClass='com.rabbitmq.stream.Deduplication$Consume'
Connecting...
Connected.
Starting consuming, press Enter to exit...
message 0
message 1
message 2
...
message 9
message 10
message 11
message 12
...
message 19
```

We get the expected number of messages in the stream, but this time with an optimized publishing application.

## Wrapping Up

This blog covered the deduplication feature of RabbitMQ Streams.

* the broker can detect and filter out duplicate messages
* a name for the producing application and a publishing ID are required to enable deduplication
* the producer name must be unique and re-used between the application restarts
* the publishing ID is a strictly increasing sequence, it is usually the identifier of a given message (e.g. primary key for a database record, line in a file)
* applications should query the broker for the last publishing ID they used to restart where they left off
