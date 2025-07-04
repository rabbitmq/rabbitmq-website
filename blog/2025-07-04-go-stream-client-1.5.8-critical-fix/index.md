---
title: "Go Stream client 1.5.8 is released with a critical fix"
tags: ["Stream","Stream-clients"]
authors: [gsantomaggio]
---

[RabbitMQ Go Stream client 1.5.8](https://github.com/rabbitmq/rabbitmq-stream-go-client/releases/tag/v1.5.8)  is a new minor release that includes a [critical fix](https://github.com/rabbitmq/rabbitmq-stream-go-client/pull/411). The fix reverts the [pull request 393](https://github.com/rabbitmq/rabbitmq-stream-go-client/pull/393) that introduced a dangerous bug: The client skips the chunk delivery when the channel is full. The bug happens under pressure or when the consumer is slow to process the messages.


## Affected versions

The bug affects the following versions: `1.5.5`, `1.5.6` and `1.5.7`. We suggest updating the client as soon as possible

