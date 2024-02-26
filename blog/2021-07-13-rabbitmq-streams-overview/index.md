---
title: "RabbitMQ Streams Overview"
tags: ["Streams", "New Features", ]
authors: [acogoluegnes]
---

RabbitMQ 3.9 introduces a new type of data structure: *streams*. Streams unlock a set of use cases that could have been tedious to implement with "traditional" queues. Let's discover in this post how streams expand the capabilities of RabbitMQ.

<!-- truncate -->

## What are RabbitMQ Streams

A RabbitMQ stream models an *append-only log* with *non-destructive consuming semantics*. This means that – contrary to traditional queues in RabbitMQ – consuming from a stream does not remove messages.

Streams in RabbitMQ are *persisted and replicated*. This translates to data safety and availability (in case of the loss of a node),
as well as scaling (reading the same stream from different nodes.)

Streams can look a bit opinionated compared to the very versatile queues, but they come in handy for a set of use cases. They expand the capabilities of RabbitMQ in a very nice way.

## What are streams good for

RabbitMQ Streams shine for the following use cases:

* **large fan-outs**: where many applications need to read the same messages _(with traditional queues, that would require declaring a queue per application and delivering a copy of the same message to each of them)_
* **large backlogs**: streams store messages on disk, not in-memory, so the only limit is the disk capacity
* **replay & time-traveling**: consumers can attach anywhere in a stream, using an absolute offset or a timestamp, and they can read and re-read the same data
* **high throughput**: streams are super fast compared to traditional queues, several orders of magnitude faster

And as streams ship as a [core plugin](/docs/stream) in RabbitMQ 3.9, you can use them along all the already existing RabbitMQ features.

## RabbitMQ Streams in a nutshell

Let's get more specific about streams:

* streams provide at-least-once guarantees thanks to publisher confirms and message de-duplication on the publisher side.
* streams support server-side offset tracking, to let consumers restart where they left off.
* as streams have non-destructive semantics, they can grow a lot. RabbitMQ Streams can truncate streams automatically according to 
retention policies, based on size or age.
* streams are accessible through a dedicated, blazing fast [binary protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v3.9.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc) and through AMQP 0.9.1 & 1.0 (less fast).
* the stream protocol is accessible thanks to the [stream plugin](/docs/stream), which ships in the core distribution of RabbitMQ 3.9.
* RabbitMQ Streams support client-server TLS.
* a modern, highly-optimized [Java client](https://github.com/rabbitmq/rabbitmq-stream-java-client) is available. It uses the stream protocol for better performance. It is fully [documented](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/).
* a [Go client](https://github.com/rabbitmq/rabbitmq-stream-go-client) is available as well.
* there is also a [performance tool](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/#the-performance-tool) based on the Java client. And yes, it comes as a [Docker image](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/#with-docker-2).

You can have a look at the streams overview presentation from RabbitMQ Summit 2021 below if you want to learn more.
If you are in a hurry, you can skip it and go directly to the quick start with Docker in the next section.

<iframe class="speakerdeck-iframe" style={{border: '0px', background: 'rgba(0, 0, 0, 0.1) padding-box', margin: '0px', padding: '0px', borderRadius: '6px', boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 40px', width: '100%', height: 'auto', aspectRatio: '560 / 315',}} frameborder="0" src="https://speakerdeck.com/player/24ed5ae0d4544c19ac714f6f7dede00a" title="RabbitMQ Streams Overview at RabbitMQ Summit 2021" allowfullscreen="true" data-ratio="1.7777777777777777"></iframe>

Without further ado, let's make this thing run.

## Quick start with Docker

Exercising a stream is very easy with Docker. Let's make sure you don't already have the Docker images we are about to use locally:

```shell
docker rmi rabbitmq:3.9 pivotalrabbitmq/stream-perf-test
```

You'll get an error message if the images are not on the computer, but this is fine.

Let's create now a network for our server and performance tool containers to communicate:

```shell
docker network create rabbitmq-streams
```

It is time to start the broker:

```shell
docker run -it --rm --network rabbitmq-streams --name rabbitmq rabbitmq:3.9
```

The broker should start in a few seconds. When it's ready, enable the stream plugin:

```shell
docker exec rabbitmq rabbitmq-plugins enable rabbitmq_stream
```


Now launch the performance tool. It will create a stream, and publish and consume as fast as possible:

```shell
docker run -it --rm --network rabbitmq-streams pivotalrabbitmq/stream-perf-test \
    --uris rabbitmq-stream://rabbitmq:5552
```

You can let the performance tool run for a while and then stop it with `Ctrl+C`:

```
19, published 1180489 msg/s, confirmed 1180145 msg/s, consumed 1180648 msg/s, \
    latency min/median/75th/95th/99th 1537/7819/9631/12136/14425 µs, chunk size 2639
20, published 1181929 msg/s, confirmed 1181597 msg/s, consumed 1182074 msg/s, \
    latency min/median/75th/95th/99th 1537/7838/9562/11967/14355 µs, chunk size 2657
^C
Summary: published 1205835 msg/s, confirmed 1205435 msg/s, consumed 1205477 msg/s, latency 95th 12158 µs, chunk size 2654
```

These are numbers on a regular Linux workstation, what you'll get depends on your own setup. Note numbers can be significantly lower on macOS and Windows, as Docker runs in a virtualized environment on those operating systems.

You can then stop the broker container with `Ctrl+C` and delete the network:

```shell
docker network rm rabbitmq-streams
```

If you want to go further and start building applications, the [stream Java client documentation](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/) is a good starting point.

This concludes our overview of RabbitMQ Streams, a new append-only log data structure with awesome capabilities and tooling. Stay tuned to discover more about streams in subsequent posts!
