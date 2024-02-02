---
title: "RabbitMQ Java Client 5.0 is Released"
tags: ["Programming Languages", "New Features", ]
authors: [acogoluegnes]
---

The RabbitMQ team is happy to announce the release of version 5.0 of the [RabbitMQ Java Client](/client-libraries/java-api-guide). This new release is now based on Java 8 and comes with a bunch of interesting new features.

<!-- truncate -->

## Java 8 is Now a Pre-requisite

RabbitMQ Java Client has been supporting Java 6 (released in 2006!) for many years. It was time to bump the pre-requisites to benefit from modern Java features. No need to worry for those stuck on Java 6 or Java 7: we will support Java Client 4.x.x series for the next upcoming months (bug fixes and even relevant new features if possible). Note the Java Client 5.0 (as well as 4.x.x) also supports Java 9.

## Spring Cleaning

Some classes and interfaces showed to be less relevant these days and were marked as deprecated in the previous major versions: this is the case of `FlowListener` and `QueueingConsumer` (among others). They have been removed in 5.0.

## New Lambda-oriented Methods

Lambda-oriented methods have been introduced for common use cases, e.g. to <a href="https://github.com/rabbitmq/rabbitmq-java-client/blob/6ce40192bb426a2f24791bb58777424cc5086727/src/test/java/com/rabbitmq/client/test/LambdaCallbackTest.java#L97">consume a message</a>:

```java
consumingChannel.basicConsume(queue,
    (consumerTag, delivery) -> businessService.handle(delivery),
    consumerTag -> LOGGER.info("Consumer {} has been cancelled")
);
```

Other lambda-oriented methods are also available for <a href="https://github.com/rabbitmq/rabbitmq-java-client/blob/6ce40192bb426a2f24791bb58777424cc5086727/src/test/java/com/rabbitmq/client/test/LambdaCallbackTest.java#L59">most of the</a> <a href="https://github.com/rabbitmq/rabbitmq-java-client/blob/6ce40192bb426a2f24791bb58777424cc5086727/src/test/java/com/rabbitmq/client/test/LambdaCallbackTest.java#L70">client</a> <a href="https://github.com/rabbitmq/rabbitmq-java-client/blob/6ce40192bb426a2f24791bb58777424cc5086727/src/test/java/com/rabbitmq/client/test/LambdaCallbackTest.java#L49">listeners</a>. This should make relevant application code more concise and readable.

## More Flexibility to Specify Client Certificate

In Java, a client certificate is presented through a `SSLContext`'s `KeyManager`. If different client connections needed different client certificates in the RabbitMQ Java Client, they needed different instances of `ConnectionFactory`. In 5.0, we introduced the [`SslContextFactory`](https://github.com/rabbitmq/rabbitmq-java-client/blob/ce3a04c6351d89cfe7059f88378cb37d47647386/src/main/java/com/rabbitmq/client/SslContextFactory.java):

```java
public interface SslContextFactory {

    SSLContext create(String name);

}
```

You can now set your own `SslContextFactory` in the `ConnectionFactory` to provide the logic based on the connection name to create the appropriate `SslContext` for this connection. The `SslContextFactory` implementation can look up certificates from a file system directory or from any other certificate repository (database, LDAP registry, etc). Combined with NIO (added in 4.0), this is a great way to have many client connections in a single JVM process that uses only a few threads.

## Breaking Changes

A major release is a good time to do some cleaning as seen above and to introduce new features. Unfortunately, those new features sometimes break existing API. Cheer up, as we strived to maintain backward compatibility and most applications shouldn't be impacted by those changes. If in doubt, check the [dedicated section](https://github.com/rabbitmq/rabbitmq-java-client/releases/tag/v5.0.0#breaking-changes) in the release change log.

## Wrapping Up

The RabbitMQ team hopes you'll enjoy this new version of the Java Client. Don't hesitate to consult the [release change log](https://github.com/rabbitmq/rabbitmq-java-client/releases/tag/v5.0.0) for all the details. The binaries are available as usual from [Maven Central](http://search.maven.org/#search%7Cga%7C1%7Cg%3A%22com.rabbitmq%22%20AND%20a%3A%22amqp-client%22) and from our [Bintray repository](https://bintray.com/rabbitmq/maven/com.rabbitmq%3Aamqp-client). To use RabbitMQ Java Client 5.0, add the following dependency if you're using Maven:

```xml
<dependency>
    <groupId>com.rabbitmq</groupId>
    <artifactId>amqp-client</artifactId>
    <version>5.0.0</version>
</dependency>
```

If you're using Gradle:

```groovy
compile 'com.rabbitmq:amqp-client:5.0.0'
```

Enjoy!
