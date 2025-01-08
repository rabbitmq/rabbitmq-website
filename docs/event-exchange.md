---
title: Event Exchange Plugin
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Event Exchange Plugin

## Overview

Client connections, queues, consumers, and other parts of the system generate [events](./logging#internal-events).
For example, when a connection is created, a `connection.created` event is emitted.
When a connection is closed or fails, a `connection.closed` event is emitted.

[Monitoring](./monitoring) and auditing services can be interested in observing these
events. RabbitMQ has a minimalistic mechanism for event notifications
that can be exposed to RabbitMQ clients with the `rabbitmq_event_exchange` plugin.

The plugin requires no configuration, just activate it:

```bash
rabbitmq-plugins enable rabbitmq_event_exchange
```

## Consuming Internal Events

[rabbitmq_event_exchange](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_event_exchange)
is a plugin that consumes RabbitMQ internal events and re-publishes them to a
[topic exchange](/tutorials/amqp-concepts#exchange-topic) called `amq.rabbitmq.event`, thus exposing these events to clients applications.
To consume the events, an application needs to declare a queue and bind it to the `amq.rabbitmq.event` exchange.

By default, the plugin declares the topic exchange `amq.rabbitmq.event` in the default virtual host (`/`).
All events are published to this exchange with routing keys (topics) such as `exchange.created`, `binding.deleted`, etc.
Applications can therefore consume only the relevant events.
For example, to subscribe to all user events (such as `user.created`, `user.authentication.failure`, etc.) create a binding with routing (binding) key `user.#`.

The exchange behaves similarly to `amq.rabbitmq.log`: everything gets published there.
If application's user cannot be trusted with the events that get published, don't [allow](./access-control) them `read` access to the `amq.rabbitmq.event` exchange.

:::important

All messages published by the internal event mechanism will always have a blank body.
Relevant event attributes are passed in message metadata.

:::

Each event has various event properties associated with it.
By default, the plugin internally publishes AMQP 0.9.1 messages with event properties translated to AMQP 0.9.1 message headers.
The plugin can optionally be configured to internally publish AMQP 1.0 messages with event properties translated to AMQP 1.0 [message-annotations](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-message-annotations)
by setting the following in [rabbitmq.conf](configure#config-file):

``` ini
event_exchange.protocol = amqp_1_0
```

All messages published by the internal event mechanism will always have a blank body.
Relevant event attributes are passed in message metadata.

Because the plugin sets event properties as AMQP 0.9.1 headers or AMQP 1.0 message-annotations, client applications can optionally subscribe to only specific event properties (for example all events emitted for a specific user). This can be achieved by binding a queue to a [headers exchange](/tutorials/amqp-concepts#exchange-headers), and the headers exchange to the `amq.rabbitmq.event` topic exchange.


## Plugin Configuration

By default, the `rabbitmq_event_exchange` plugin uses the following configuration:

``` ini
event_exchange.vhost = /
event_exchange.protocol = amqp_0_9_1
```

To switch the plugin to publish events in the AMQP 1.0 format, use

``` ini
event_exchange.vhost = /
event_exchange.protocol = amqp_1_0
```


## Usage Guidelines

:::important

In most cases, setting a [max length limit](./maxlength) of a few thousand on the queues
used to consume these events would prevent unnecessary resource use.

:::

The event exchange plugin is typically used for audit of internal events. An application
can bind a queue, a stream, or a set of queues (or streams) to this exchange
and store a history of generated events.
Therefore, this special exchange can be considered a form of a structured log.

A surge in the number of inbound connections, connection churn, channel churn, or queue churn
will produce a large number of events. In environments where consumers
on the internal event queue can be absent for long periods of time,
the queue can accumulate a substantial backlog.

In most cases, setting a [max length limit](./maxlength) of a few thousand on the queues
used to consume these events would prevent unnecessary resource use.

## Events

Events including their routing keys (topics) that this plugin publishes are documented [here](./logging#internal-events).

## Example

There's an [example internal event consumer in Java](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_event_exchange/examples/java).
