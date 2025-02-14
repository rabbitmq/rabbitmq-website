---
title: Stream Core vs Stream Plugin
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Stream Core vs Stream Plugin

## Overview {#overview}

This section covers the differences between [stream core](./streams) and the [stream plugin](./stream).
Stream core designates stream features in the broker with only default plugins activated and through protocols like AMQP 0.9.1, AMQP 1.0, MQTT, and STOMP.


### Feature Matrix

|Feature | Stream Core              | Stream Plugin    |
|-| ------------------------ | -------------    |
|Activation| Built-in                 | [Must be activated](./stream#enabling-plugin)  |
|Protocol| AMQP 0.9.1 and AMQP 1.0   | [RabbitMQ Stream](https://github.com/rabbitmq/rabbitmq-server/blob/v3.12.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc)  |
|Clients| AMQP 0.9.1 clients ([documentation](./streams#usage)). AMQP 1.0 clients ([documentation](/client-libraries/amqp-client-libraries#support-for-streams)) |[RabbitMQ stream clients](./stream#overview)   |
|Port| 5672                     | 5552             |
|Format| Server-side AMQP 1.0 message format encoding and decoding  | Client-side AMQP 1.0 message format encoding and decoding |
|Sub-entry batching|  Not supported    | Supported ([Java example](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#sub-entry-batching-and-compression))      |
|Offset tracking| Use external store      |  Built-in server-side support ([Java example](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#consumer-offset-tracking)) or external store      |
|Publishing deduplication|Not supported       |  Supported ([Java example](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#outbound-message-deduplication))        |
|[Super stream](/blog/2022/07/13/rabbitmq-3-11-feature-preview-super-streams) |Not supported       |  Supported         |
|Throughput| Hundreds of thousands per second | Millions messages per second    |
|TLS|Supported (default port: 5671)                     | Supported (default port: 5551)


### Interoperabilty

Streams store messages using the AMQP 1.0 message format.

* RabbitMQ Stream client libraries are expected to support the AMQP 1.0 message format
* The broker handles the [conversion](./conversions) between AMQP 1.0 and AMQP 0.9.1 for AMQP 0.9.1 clients
* AMQP 0.9.1 and stream clients can write to and read from the same stream, but [Sub-Entry Batching](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#sub-entry-batching-and-compression) is not supported.
* RabbitMQ Stream supports the following section of the AMQP 1.0 message format:
     * properties
     * application properties
     * application data
     * message annotations
