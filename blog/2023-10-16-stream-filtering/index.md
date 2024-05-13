---
title: "Stream Filtering"
tags: ["Streams", "Programming Languages", "New Features", "RabbitMQ 3.13.x"]
authors: [acogoluegnes]
---

Stream filtering is a new feature in RabbitMQ 3.13.
It allows to save bandwidth between the broker and consuming applications when those applications need only a subset of the messages of a stream.

Keep reading to find out how stream filtering works and see it in action.

<!-- truncate -->

## Concepts of Stream Filtering

Imagine you have a stream containing data from all around the world and an application that needs to process only a subset of this data, let's say messages for a given region.
The application can read the whole stream and filter out the data to only process the messages it is interested in.
This works but it means the whole stream content will go through the network.

Stream filtering provides a first level of efficient filtering on the broker side, _without_ the broker needing to interpret messages.
It can dramatically reduce the amount of data exchanged on the network for some use cases.
Let's discover the semantics of this new exciting feature.

## On The Publishing Side

Stream filtering is based on a _filter value_: a publishing application can associate each message with a string value.
Filter values can be anything, but they should meet some criteria for filtering to work properly.
A defined set of values shared across the messages is a good candidate: geographical locations (e.g. countries, states), document types in a stream that stores document information (e.g. payslip, invoice, order), categories of products (e.g. book, luggage, toy).

How a message is associated to a filter value depends on the client library.
Here is an example with the [stream Java client](https://github.com/rabbitmq/rabbitmq-stream-java-client/):

```java
Producer producer = environment.producerBuilder()
  .stream("invoices")
  .filterValue(msg -> msg.getApplicationProperties().get("region").toString())  
  .build();
```

In this example the application developer provides some logic to extract the filter value from the message application properties.
Using filtering is as simple as this: no need to change the actual message publishing code, you just need to provide the filter value logic when creating a `Producer`.

Let's see now how it works for consumers.

## On The Consumer Side

Here is a Java code snippet to declare a consumer that is only interested in messages from the `emea` region:

```java
Consumer consumer = environment.consumerBuilder()
  .stream("invoices")
  .filter()
    .values("emea")  
    .postFilter(msg -> "emea".equals(msg.getApplicationProperties().get("region")))  
  .builder()
  .messageHandler((ctx, msg) -> {
    // message processing code
  })
  .build();
```

Filtering is configured in two places:

* `filter().values(String... filterValues)` tells the broker we are interested in messages associated with these values (we can specify several values, not only one)
* `filter().postFilter(Predicate<Message> filter)` provides some client-side logic to filter out messages that would _not_ be associated with the expected filter value(s)

Why the need for this client-side filtering logic?
The broker-side filtering logic uses a [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter):

> A Bloom filter is a space-efficient probabilistic data structure, used to test whether an element is a member of a set.

A Bloom filter is very efficient in terms of storage and speed, but it is probabilistic: it can return _false positives_.
Because of this, the broker can send messages it believes match the expected filter values whereas they do not.
That's why some client-side filtering logic is necessary.

This is something to be aware of, but that is a minor caveat compared to the benefits stream filtering brings.

A [subsequent blog post](/blog/2023/10/24/stream-filtering-internals) covers the internals of stream filtering for those interested in technical details.
You can also have a look at the [stream Java client documentation on filtering](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/#filtering) for more information.
It covers among others that a message does not always have to be associated to a filter value and a consumer can choose to receive messages with given filter value(s) _and_ messages _without_ a filter value (with `filter().matchUnfiltered()`).

## Trying It Out 

Let's see stream filtering in action.
Start a RabbitMQ 3.13+ node:

```shell
docker run -it --rm --name rabbitmq -p 5552:5552 \
    -e RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS='-rabbitmq_stream advertised_host localhost' \
    rabbitmq:3.13
```

Enable the stream plugin:

```shell
docker exec rabbitmq rabbitmq-plugins enable rabbitmq_stream
```

Download [Stream PerfTest](https://github.com/rabbitmq/rabbitmq-stream-perf-test/) (it requires Java 11 or more to run):

```shell
cd /tmp
wget -O stream-perf-test.jar \
  https://github.com/rabbitmq/rabbitmq-java-tools-binaries-dev/releases/download/v-stream-perf-test-latest/stream-perf-test-latest.jar
```

Let's publish messages for 10 seconds:

```shell
java -jar stream-perf-test.jar --producers 1 --consumers 0 --rate 100 --filter-value-set 1..50 --size 10000 --time 10
```

The messages are 10 KB long and `--filter-value-set 1..50` means a random filter value between `"1"` and `"50"` is associated with each message.

Let's consume all the messages (without any filtering):

```shell
java -jar stream-perf-test.jar --producers 0 --consumers 1 --offset first --prometheus
```

The output should stop after a few seconds, when the consumer reaches the end of the stream.
Do not stop the application, open another terminal tab instead, and query Stream PerfTest metrics to see how much data it read:

```shell
curl --silent localhost:8080/metrics | grep rabbitmq_stream_read_bytes_total
```

You should get something like the following:

```properties
# HELP rabbitmq_stream_read_bytes_total
# TYPE rabbitmq_stream_read_bytes_total counter
rabbitmq_stream_read_bytes_total 1.0046894E7
```

This is about 10 MB.
The client had to transfer the entire stream.

Now stop Stream PerfTest (`Ctrl-C`) and start it again, this time with filtering enabled:

```shell
java -jar stream-perf-test.jar --producers 0 --consumers 1 --offset first --prometheus --filter-values 5
```

Here we ask to get only messages with the `"5"` filter value (`--filter-values 5`).
Again, wait for the output to stop and check the number of bytes read:

```shell
curl --silent localhost:8080/metrics | grep rabbitmq_stream_read_bytes_total
```

You should get something like:

```properties
# HELP rabbitmq_stream_read_bytes_total
# TYPE rabbitmq_stream_read_bytes_total counter
rabbitmq_stream_read_bytes_total 1957641.0
```

This is less than 2 MB.
It is 8 MB of bandwidth saved, about 80%, not bad!

Of course this is somewhat artificial: Stream PerfTest is not a real application and it is unlikely it distributes messages and filter values the way real applications do.
But still, it gives an idea of what the bandwidth savings can be with stream filtering.

## Wrapping Up

We had a quick overview of stream filtering in RabbitMQ 3.13.
It allows to save bandwidth when messages are dispatched from the broker to consuming applications.
Not all use cases can benefit from stream filtering, but the benefits in terms of bandwidth for those that can are quite compelling.

Stay tuned for a [subsequent blog post](/blog/2023/10/24/stream-filtering-internals) that will cover the internal details of stream filtering to help you use it and configure it in the most optimal way.
