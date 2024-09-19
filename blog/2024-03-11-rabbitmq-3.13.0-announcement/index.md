---
title: "RabbitMQ 3.13.0 Is Here!"
tags: ["Announcements", "RabbitMQ 3.13.x"]
authors: [kura]
---

[RabbitMQ 3.13 is now available](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.13.0)
with support for MQTTv5, stream filtering and significant improvements to
classic queue performance, especially for larger messages.

Read dedicated blog posts for more details about these changes:

* [support for version 5 of the MQTT protocol](/blog/2023/07/21/mqtt5)
* [support for stream filtering](/blog/2023/10/16/stream-filtering)
* [performance improvements](/blog/2024/01/11/3.13-release)

RabbitMQ 3.13 is the final minor release in the 3.x series. The next release
will be 4.0!

<!-- truncate -->

## Experimental Support For Khepri (Mnesia Replacement)

Apart from the new features mentioned in the first paragraph, RabbitMQ 3.13
includes experimental support for [Khepri](https://github.com/rabbitmq/khepri). Khepri is a new storage backend for
RabbitMQ metadata that is designed to replace Mnesia. It is not yet ready for
production use but we encourage users to try it out in test environments and
provide feedback.

Our plan is to completely remove Mnesia in the future. This should
significantly improve RabbitMQ's tolerance to network partitions. Once we switch
to Khepri, there will be no partition handling strategy configuration
(`pause_minority`, `autoheal`, etc) — Khepri is based on the Raft protocol,
just like quorum queues and therefore the semantics of what to do when a
partition occurs are well defined and not configurable.

A recorded talk about [Khepri](https://www.youtube.com/watch?v=whVqpgvep90) is available.

:::warning
The command below enables an experimental feature that cannot be disabled.
Do not use it in production unless you have tested it thoroughly!

To enable Khepri (**experimental in 3.13 and non-reversible!**) run:
```
rabbitmqctl enable_feature_flag khepri_db
```
:::

You shouldn't really notice any difference after enabling Khepri. The main
difference is what happens internally when you declare exchanges, queues,
bindings and so on. We encourage experimentation such as declaring your actual
topology first and then enabling Khepri (to validate that everything works as
expected), inducing failures to validate the cluster remains available (as long
as the majority of the nodes is up and connected) and so on. Please report any
issues you run into.

## Feature Flags

RabbitMQ 3.13.0 includes a few new [feature flags](/docs/feature-flags/). It doesn't however, set any
older flags as required (apart from those that were already required in 3.12 of
course). Therefore, if you have some feature flags disabled, upgrading from
3.12 to 3.13 will still work. In the 3.11 -> 3.12 upgrade, some users ran into
issues if not all feature flags were enabled. Such issues won't happen when
moving from 3.12 to 3.13.

:::tip
You should always enable all non-experimental feature flags after a successful
upgrade.
:::

## Classic Queues: Version 1 Remains The Default

We had intended to change the default version of classic queues to v2 in 3.13
but ultimately decided against it. Therefore, v1 is still the default and v2
remains an opt-in feature. However, **classic queues v2 are highly
recommended**! You can upgrade your queues by setting `x-queue-version=2` in a
policy. To make sure new queues are created as v2 by default, you can set

``` ini
classic_queue.default_version = 2
```

in [`rabbitmq.conf`](/docs/configure).

The reason v1 remains the default has nothing to do with any v2 shortcomings
but rather with the fact that changing the node default led to some back and
forth migrations between v1 and v2 in certain scenarios. In particular, a
mirrored queue would be upgraded and downgraded back and forth between v1 and
v2 during a rolling upgrade, since the default would be different on different
nodes. To avoid any risk of such scenarios, we decided against this change.

Classic queues v2 will become the only option in the future. By then, queue
mirroring will be removed and therefore there will be no risk of
mirroring-related issues.

## Message Containers

[Message Containers](https://github.com/rabbitmq/rabbitmq-server/pull/5077) are
a mostly invisible change in how messages are handled internally. RabbitMQ was
originally built as an AMQP 0-9-1 broker. However, over the years, support for
AMQP 1.0, MQTT, STOMP and Streams was added. This led to some internal message
format conversions since different protocols have mostly similar concepts, but
differ in the details such as available data types.

Message containers are based on a message format from AMQP 1.0 and
modernize internal message representation with today's multi-protocol
assumptions and makes all the conversions between protocols explicit.

These conversions are now [documented](https://www.rabbitmq.com/docs/conversions).

## That's A Wrap For 3.x!

RabbitMQ 3.0.0 was released in November 2012. For various historical reasons,
the major version has not been incremented since then. However, it's time to
say goodbye to the 3.x series and move on to 4.0 later this year. Version 4.0
will include a number of breaking changes but most importantly, it will no
longer support mirroring of classic queues. Policy keys related to mirroring
will be ignored and queues will become single-node queues. This is a final call
for users requiring highly available queues: migrate to quorum queues, or
streams if applicable, as soon as possible. You will enjoy much higher data
safety, reliability and better performance than mirrored queues ever offered.
