---
title: Spec Differences
displayed_sidebar: docsSidebar
---

## Undeprecated Features

In addition to extensions beyond the specification, RabbitMQ also undeprecates some features that were removed from AMQP 0-9-1:

  * [Auto-delete exchanges](https://www.rabbitmq.com/docs/exchanges#auto-deletion)
  * Internal exchanges

The access class was deprecated from AMQP 0-9-1. RabbitMQ implements the
`access.request` method from this class as a no-op in order to maintain compatibility with older clients.

This method will be removed in the future and should not be relied upon.

## amq.* Exchange Immutability

AMQP 0-9-1 spec dictates that it must not be possible to declare an exchange with the <span class="code">amq.</span> prefix. RabbitMQ also prohibits deletion of such exchanges.

## Getting Help and Providing Feedback

If you have questions about the contents of this guide or any other topic related to RabbitMQ, don't hesitate to ask them using
[GitHub Discussions](https://github.com/rabbitmq/rabbitmq-server/discussions) or our
[Discord server](https://www.rabbitmq.com/discord).


## Help Us Improve the Docs &lt;3

If you'd like to contribute an improvement to the site, its source is [available on GitHub](https://github.com/rabbitmq/rabbitmq-website).

[Sign the CLA](https://github.com/rabbitmq/cla), then simply fork the repository and submit a pull request. Thank you!
