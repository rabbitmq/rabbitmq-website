<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Event Exchange Plugin NOSYNTAX

## Overview

Client connection, channels, queues, consumers, and other parts of the
system [naturally generate events](logging.html#internal-events). For example, when a connection is
accepted, authenticated and access to the target virtual host is
authorised, it will emit an event of type `connection_created`. When a
connection is closed or fails for any reason, a `connection_closed`
event is emitted.

[Monitoring](monitoring.html) and auditing services can be interested in observing those
events. RabbitMQ has a minimalistic mechanism for event notifications
that can be exposed to RabbitMQ clients with a plugin.


## Consuming Internal Events with rabbitmq-event-exchange Plugin

[rabbitmq-event-exchange](https://github.com/rabbitmq/rabbitmq-event-exchange)
is a plugin that consumes internal events and re-publishes them to a
topic exchange, thus exposing the events to clients (applications).

To consume the events, an application needs to declare a queue, bind
it to a special system exchange and consume messages.

It declares a topic exchange called `amq.rabbitmq.event` in the default
virtual host. All events are published to this exchange with routing
keys like 'exchange.created', 'binding.deleted' etc, so you can
subscribe to only the events you're interested in.

The exchange behaves similarly to `amq.rabbitmq.log`: everything gets
published there; if you don't trust a user with the information that
gets published, don't allow them access.

The plugin requires no configuration, just activate it:

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_event_exchange
</pre>

Each event has various properties associated with it. These are
translated into AMQP 0-9-1 data encoding and inserted in the message headers. The
**message body is always blank**.


## Events

RabbitMQ and related plugins produce events with the following routing keys:

### RabbitMQ Broker

Queue, Exchange and Binding events:

- `queue.created`
- `queue.deleted`
- `exchange.created`
- `exchange.deleted`
- `binding.created`
- `binding.deleted`

Connection and Channel events:

- `connection.created`
- `connection.closed`
- `channel.created`
- `channel.closed`

Consumer events:

- `consumer.created`
- `consumer.deleted`

Policy and Parameter events:

- `policy.set`
- `policy.cleared`
- `parameter.set`
- `parameter.cleared`

Virtual host events:

- `vhost.created`
- `vhost.deleted`

User related events:

- `user.authentication.success`
- `user.authentication.failure`
- `user.created`
- `user.deleted`
- `user.password.changed`
- `user.password.cleared`
- `user.tags.set`

Permission events:

- `permission.created`
- `permission.deleted`

### Shovel Plugin

Worker events:

- `shovel.worker.status`
- `shovel.worker.removed`

### Federation Plugin

Link events:

- `federation.link.status`
- `federation.link.removed`


## Example

There is a usage example using the Java client [in the rabbitmq-event-exchange repository](https://github.com/rabbitmq/rabbitmq-event-exchange/tree/master/examples/java).
