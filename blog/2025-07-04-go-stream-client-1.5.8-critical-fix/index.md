---
title: "Go Stream client 1.5.8 is released with a critical fix"
tags: ["Streams","Stream-clients"]
authors: [gsantomaggio]
---

[RabbitMQ Go Stream client 1.5.8](https://github.com/rabbitmq/rabbitmq-stream-go-client/releases/tag/v1.5.8)  is a newbug fix release that includes
a [critical fix](https://github.com/rabbitmq/rabbitmq-stream-go-client/pull/411).

The fix reverts the [pull request 393](https://github.com/rabbitmq/rabbitmq-stream-go-client/pull/393) that introduced a dangerous bug where the library skipped chunk delivery when the channel's maximum
capacity was reached. In practical terms, message dispatch to the application would stop.

The bug was triggered when the consumer was experiencing a near peak delivery pressure for some time,
or when the consumer was consistently slow to process the deliveries.


## Affected versions

The bug affects the following versions: `1.5.5`, `1.5.6` and `1.5.7`.

We strongly recommend updating the client to `1.5.8` as soon as possible.
