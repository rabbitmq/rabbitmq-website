---
title: "New Reactive Client for RabbitMQ HTTP API"
tags: ["Performance", "Programming Languages", "New Features", ]
authors: [acogoluegnes]
---

The RabbitMQ team is happy to announce the release of version 2.0 of [HOP](https://github.com/rabbitmq/hop), RabbitMQ HTTP API client for Java and other JVM languages. This new release introduce a new reactive client based on [Spring Framework 5.0 WebFlux](https://docs.spring.io/spring/docs/5.0.0.RELEASE/spring-framework-reference/web-reactive.html#webflux-client).

<!-- truncate -->

## Reactive what?

As stated in Spring Framework `WebClient` documentation:

 > The WebClient offers a functional and fluent API that takes full advantage of Java 8 lambdas. It supports both sync and async scenarios, including streaming, and brings the efficiency of non-blocking I/O.

This means you can easily chain HTTP requests and transform the result, e.g. to calculate the total rate for all virtual hosts in a RabbitMQ broker:

```java
ReactiveClient client = new ReactiveClient("http://localhost:15672/api", "guest", "guest");
Mono<Double> vhostsRate = client.getVhosts()
        .map(vhostInfo -> vhostInfo.getMessagesDetails().getRate())
        .reduce(0.0, (acc, current) -> acc + current);
```

Note HOP `ReactiveClient` uses [Reactor](http://projectreactor.io/) `Mono` and `Flux` API.

This also means you can build a fully reactive dashboard application to monitor a farm of RabbitMQ clusters. Thanks to the underlying Reactor Netty library, the dashboard application will use as less resources as possible (HTTP connection pooling, non-blocking I/O).

HOP 2.0 is already available on Maven Central. For Maven:

```xml
<dependency>
    <groupId>com.rabbitmq</groupId>
    <artifactId>http-client</artifactId>
    <version>2.0.0.RELEASE</version>
</dependency>
```

For Gradle:

```groovy
compile 'com.rabbitmq:http-client:2.0.0.RELEASE'
```

Enjoy!
