---
title: "RabbitMQ Java Client 4.0 is released"
tags: ["Programming Languages", "New Features", ]
authors: [acogoluegnes]
---

The RabbitMQ team is happy to announce the release of version 4.0 of the [RabbitMQ Java Client](/client-libraries/java-api-guide). This new release does not introduce any breaking changes and comes with a bunch of interesting new features.

<!-- truncate -->

## New independent release process

From now on, the Java Client will be released separately from the broker. It'll make it easier and faster to ship bug fixes as well as new features.

## Logging support with SLF4J

[SLF4J](http://www.slf4j.org/) is now used in several places of the Java Client to report logging messages. It's also used in the default exception handler implementation that ships with the client. This gives the application developer a large choice of logging implementations (e.g. [Logback](http://logback.qos.ch/), [Log4j](http://logging.apache.org/log4j/2.x/)) and a large choice of destinations to direct logs to (file, but also logging-specific protocols).

## Metrics support

The Java Client can now gather runtime metrics such as number of sent and received messages. The metrics are collected by default through [Dropwizard Metrics](http://metrics.dropwizard.io/) library, but collection is pluggable if you have some fancy requirements. Using Dropwizard Metrics gives the opportunity to use many monitoring backends out-of-the-box: JMX, Spring Boot metrics endpoint, Ganglia, Graphite, etc.

A separate blog post will cover metrics support in depth.

## Support for Java NIO

The Java Client has been historically using the traditional Java blocking IO library (i.e. `Socket` and its `Input/OutputStream`s). This has been working for years, but isn't adapted to all kinds of workloads. Java NIO allows for a more flexible, yet more complex to implement model to handle network communication. Long story short, Java NIO allows to handle more connections with fewer threads (the blocking IO mode always needs one thread per connection).

Don't think of Java NIO as some kind of turbo button: your client application won't be faster by using NIO, it'll likely be able to use fewer threads if you use a lot of connections, that's all.

Note blocking IO is still the default in the Java Client, you need to explicitly enable NIO. The NIO mode uses reasonable defaults, but you may also have to tweak it for your workload through the `NioParams` class.

## Automatic recovery enabled by default

[Automatic recovery](/client-libraries/java-api-guide#recovery) has been there for a few years now, and we know that many users always enable it, so we've decided to enable it by default. You can still choose not to use it, but you'll need to disable it explicitly.

## Miscellaneous goodies and fixes

This new release comes also with its load of goodies and fixes. Take a look at the `AddressResolver` interface for instance: it's an abstraction to resolve the RabbitMQ hosts you want to connect to. Combined with automatic recovery, you end up with a robust client that can reconnect to nodes that weren't even up when it started in the first place.

The RabbitMQ Java Client version 4.0 is available on [Maven Central](http://search.maven.org/#search%7Cga%7C1%7Cg%3A%22com.rabbitmq%22%20AND%20a%3A%22amqp-client%22) (as well as on our [Bintray repository](https://bintray.com/rabbitmq/maven/com.rabbitmq%3Aamqp-client)). To use it, add the following dependency if you're using Maven:

```xml
<dependency>
    <groupId>com.rabbitmq</groupId>
    <artifactId>amqp-client</artifactId>
    <version>4.0.0</version>
</dependency>
```

If you're using Gradle:

```groovy
compile 'com.rabbitmq:amqp-client:4.0.0'
```

Enjoy!

[Release change](https://github.com/rabbitmq/rabbitmq-java-client/releases/tag/v4.0.0)
