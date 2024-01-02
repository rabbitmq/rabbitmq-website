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

# Which protocols does RabbitMQ support?

RabbitMQ supports several messaging protocols, directly and through the
use of plugins. This page describes the supported protocols and
helps differentiate between them.

## <a id="amqp-091" class="anchor" href="#amqp-091">AMQP 0-9-1 and extensions</a>

RabbitMQ was originally developed to [support AMQP 0-9-1](./protocol.html).
As such this protocol is the "core" protocol supported by
the broker. All of these variants are fairly similar to each other,
with later versions tidying up unclear or unhelpful parts of earlier
versions. We have [extended](./extensions.html) AMQP 0-9-1
in various ways.

AMQP 0-9-1 is a binary protocol, and defines quite strong
messaging semantics. For clients it's a reasonably easy
protocol to implement, and as such there
are [a large number of client libraries](./devtools.html) available for
many different programming languages and environments.

AMQP 0-9-1 is the protocol used by [RabbitMQ tutorials](./getstarted.html).


## <a id="stomp" class="anchor" href="#stomp">STOMP</a>

[STOMP](http://stomp.github.io/) is a text-based
messaging protocol emphasising (protocol) simplicity. It
defines little in the way of messaging semantics, but is
easy to implement and very easy to implement partially (it's
the only protocol that can be used by hand over telnet).

RabbitMQ supports STOMP (all current versions) via
a [plugin](stomp.html).


## <a id="mqtt" class="anchor" href="#mqtt">MQTT</a>

[MQTT](http://mqtt.org/) is a binary protocol
emphasising lightweight publish / subscribe messaging,
targeted towards clients in constrained devices. It has
well defined messaging semantics for publish / subscribe,
but not for other messaging idioms.

RabbitMQ supports MQTT 3.1 via a [plugin](mqtt.html).


## <a id="amqp-10" class="anchor" href="#amqp-10">AMQP 1.0</a>

Despite the name, AMQP 1.0 is a radically different protocol from
AMQP 0-9-1 / 0-9 / 0-8, sharing essentially nothing at the wire
level. AMQP 1.0 imposes far fewer semantic requirements; it is
therefore easier to add support for AMQP 1.0 to existing
brokers. The protocol is substantially more complex than AMQP 0-9-1,
and there are fewer client implementations.

RabbitMQ supports AMQP 1.0 via a [plugin](plugins.html).


## <a id="http-and-websockets" class="anchor" href="#http-and-websockets">HTTP and WebSockets</a>

While HTTP is not really a messaging protocol,
RabbitMQ can transmit messages over HTTP in three ways:

 * The [Web STOMP plugin](web-stomp.html) supports STOMP
   messaging to the browser using WebSockets.
 * The [Web MQTT plugin](web-mqtt.html) supports MQTT
   messaging to the browser using WebSockets.
 * The [management plugin](management.html) supports a
   simple HTTP API to send and receive messages. This is primarily
   intended for diagnostic purposes but can be used for low volume
   messaging without [reliable delivery](reliability.html).

## <a id="rabbitmq-streams" class="anchor" href="#rabbitmq-streams">RabbitMQ Streams</a>

The [RabbitMQ Streams protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v3.10.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc) allows communicating with [streams](./streams.html).
RabbitMQ supports the streams protocol via a [plugin](./stream.html).
