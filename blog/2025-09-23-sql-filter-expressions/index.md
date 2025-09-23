---
title: "Broker-Side SQL Filtering with RabbitMQ Streams"
tags: ["AMQP 1.0", "Streams", "RabbitMQ 4.2", "New Features"]
authors: [dansari]
image: ./stream-filtering.png
---

RabbitMQ 4.2 introduces SQL filter expressions for [streams](/docs/streams), enabling powerful broker-side message filtering.

In our benchmarks, combining SQL filters with Bloom filters achieved filtering rates of more than 4 million messages per second — in highly selective scenarios with high ingress rates.
This means only the messages your consumers actually care about leave the broker, greatly reducing network traffic and client-side processing overhead.

<!-- truncate -->

## Motivation

High-throughput event streams often deliver large volumes of data to consumers, much of which may not be relevant to them.
In real systems there may be tens of thousands of subjects (event types, tenants, regions, SKUs, etc.), making a dedicated stream per subject impractical or unscalable.

RabbitMQ Streams address this with broker-side [filtering](/docs/next/stream-filtering).

[Bloom filters](/docs/next/stream-filtering#stage-1-bloom-filter) skip entire chunks that don’t contain values of interest, while [SQL Filter Expressions](/docs/next/stream-filtering#sql-filter-expressions) evaluate precise per-message predicates so only matching messages cross the network.
This reduces network traffic, lowers client CPU and memory use, and keeps application code simpler.

Demand for broker-side filtering is longstanding - Kafka users have requested it for years (see [KAFKA-6020](https://issues.apache.org/jira/browse/KAFKA-6020)) — but Kafka still lacks this capability.
RabbitMQ’s Bloom + SQL filtering makes selective consumption practical at scale today.

Let’s walk through a hands-on example.

## Running the Sample App

To run this example in your environment:
1. Start RabbitMQ with a single scheduler thread:
```bash
docker run -it --rm --name rabbitmq -p 5672:5672 -e ERL_AFLAGS="+S 1" rabbitmq:4.2.0-beta.3
```

2. From the root directory of the [sample application](https://github.com/ansd/sql-filter-expressions/tree/blog-post), run:
```bash
mvn clean compile exec:java
```

The sample application uses the [RabbitMQ AMQP 1.0 Java Client](https://github.com/rabbitmq/rabbitmq-amqp-java-client), as SQL filter expressions are a feature of AMQP 1.0.

## Publishing Events

Consider a typical e-commerce platform generating a continuous stream of customer events:
* `product.search`
* `product.view`
* `cart.add`
* `cart.remove`
* `order.created`
* and many others

Our sample application publishes 10 million such events to a stream, with `order.created` events occurring every 100,000 messages — representing just 0.001% of the total volume.

Each message includes a Bloom filter annotation set to its event type, enabling efficient chunk-level filtering:
```java
publisher
    .message(body.getBytes(StandardCharsets.UTF_8))
    .priority(priority)
    // set the Bloom filter value
    .annotation("x-stream-filter-value", eventType)
    .subject(eventType)
    .creationTime(creationTime)
    // set application properties, e.g. region, price, or premium_customer
    .property("region", region);
```

## Defining Your Filter

Suppose you only want to process high-value orders that satisfy all of the following:
* Event type is `order.created`
* Order was created within the last hour
* Order originates from regions AMER, EMEA, or APJ
* And at least one of:
    * Priority > 4
    * Price ≥ 99.99,
    * Premium customer

In our demonstration, only 10 messages out of 10 million meet these criteria — a highly selective filter scenario common in real-world applications.

Traditional approaches would require consuming all 10 million messages and filtering client-side, resulting in significant network overhead and wasted resources.

SQL filter expressions solve this elegantly by performing all filtering broker-side:

```java
String SQL =
     "properties.subject = 'order.created' AND " +
     "properties.creation_time > UTC() - 3600000 AND " +
     "region IN ('AMER', 'EMEA', 'APJ') AND " +
     "(header.priority > 4 OR price >= 99.99 OR premium_customer = TRUE)";
```

The consumer implementation becomes straightforward:
```java
ConsumerBuilder.StreamOptions builder = connection.consumerBuilder()
    .queue(STREAM_NAME)
    .stream()
    .offset(FIRST);

if (useBloomFilter) {
    // Stage 1: Bloom filter - quickly skip chunks without order.created events
    builder = builder.filterValues("order.created");
}

Consumer consumer = builder
    // Stage 2: SQL filter - precise broker-side per-message filtering
    .filter()
        .sql(SQL)
    .stream()
    .builder()
    .messageHandler((ctx, msg) -> {
        System.out.printf("  [%s] Received: %s\n",
            consumerType, new String(msg.body(), StandardCharsets.UTF_8));
        latch.countDown();
        ctx.accept();
    })
    .build();
```

## Performance Results

### SQL Filtering Only

```
Received 10 messages in 24.71 seconds using SQL filter only
Broker-side filtering rate: 404,645 messages/second
```

The consumer receives exactly 10 messages that match the criteria.
All filtering occurs on the broker, processing over 400k messages per second while transmitting only the relevant data over the network.

### Bloom + SQL Filtering

```
Received 10 messages in 2.05 seconds using Bloom + SQL filters
Broker-side filtering rate: 4,868,549 messages/second
```

By combining both filtering stages, performance improves by an order of magnitude.
The Bloom filter (Stage 1) eliminates entire chunks that don't contain `order.created` events before they're read from disk, while the SQL filter (Stage 2) applies precise business logic to the remaining messages.

:::tip

By combining Bloom filters with SQL filter expressions, RabbitMQ delivers the best of both:
efficient chunk-level filtering at Stage 1 to skip unnecessary disk I/O, CPU, and memory usage, followed by precise message-level filtering at Stage 2 for complex business logic — all on the broker.

:::

Note that actual Bloom filtering performance depends on the number of messages per chunk, which varies with message ingress rates.

## Learn More

Check out our new [Stream Filtering](/docs/next/stream-filtering) guide for best practices, examples, and configuration tips.
