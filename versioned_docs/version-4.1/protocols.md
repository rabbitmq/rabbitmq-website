---
title: Which protocols does RabbitMQ support?
displayed_sidebar: docsSidebar
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

# Which protocols does RabbitMQ support?

RabbitMQ supports several messaging protocols, directly and through the
use of plugins. This page describes the supported protocols and
helps differentiate between them.

## AMQP 0-9-1 {#amqp-091}

RabbitMQ was originally developed to [support AMQP 0-9-1](/amqp-0-9-1-protocol).
As such this protocol has been the first "core" protocol supported by
the broker. We have [extended](./extensions) AMQP 0-9-1 in various ways.

AMQP 0-9-1 is a binary protocol, and defines quite strong
messaging semantics. For clients it's a reasonably easy
protocol to implement, and as such there
are [a large number of client libraries](/client-libraries/devtools) available for
many different programming languages and environments.

[RabbitMQ tutorials](/tutorials) are available for AMQP 0-9-1.


## AMQP 1.0 {#amqp-10}

[AMQP 1.0](./amqp) is a more modern protocol.
It is an [ISO/IEC 19464](https://www.iso.org/standard/64955.html) and [OASIS](https://www.amqp.org/node/102) standard.

Despite the name, AMQP 1.0 is a very different protocol from AMQP 0-9-1 / 0-9 / 0-8, sharing nothing at the wire level.
AMQP 1.0 imposes fewer semantic requirements and is therefore supported by more message brokers.
The protocol is more complex than AMQP 0-9-1, and there are fewer client implementations.

[AMQP 1.0 has become a "core" protocol in RabbitMQ 4.0](/blog/2024/08/05/native-amqp).


## RabbitMQ Streams {#rabbitmq-streams}

The [RabbitMQ Streams protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v3.13.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc) allows communicating with [streams](./streams) at very high throughput.
RabbitMQ supports the streams protocol natively via a [plugin](./stream).

[RabbitMQ tutorials](/tutorials) are available for the RabbitMQ Streams protocol.


## MQTT {#mqtt}

[MQTT](http://mqtt.org/) is a binary protocol
emphasising lightweight publish / subscribe messaging,
targeted towards clients in constrained devices. It has
well defined messaging semantics for publish / subscribe,
but not for other messaging idioms.

RabbitMQ supports MQTT versions 3.1, 3.1.1, and 5.0 [natively](/blog/2023/03/21/native-mqtt) via a [plugin](./mqtt).


## STOMP {#stomp}

[STOMP](http://stomp.github.io/) is a text-based
messaging protocol emphasising (protocol) simplicity. It
defines little in the way of messaging semantics, but is
easy to implement and very easy to implement partially (it's
the only protocol that can be used by hand over telnet).

RabbitMQ supports STOMP (all current versions) via
a [plugin](./stomp) by proxying internally over AMQP 0-9-1.


## HTTP and WebSockets {#http-and-websockets}

While HTTP is not really a messaging protocol,
RabbitMQ can transmit messages over HTTP in three ways:

 * The [Web STOMP plugin](./web-stomp) supports STOMP
   messaging to the browser using WebSockets.
 * The [Web MQTT plugin](./web-mqtt) supports MQTT
   messaging to the browser using WebSockets.
 * The [management plugin](./management) supports a
   simple HTTP API to send and receive messages. This is primarily
   intended for diagnostic purposes but can be used for low volume
   messaging without [reliable delivery](./reliability).
