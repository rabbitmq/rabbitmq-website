<!--
Copyright (c) 2007-2022 VMware, Inc. or its affiliates.

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

# Stream Core vs Stream Plugin NOSYNTAX

## <a id="overview" class="anchor" href="#overview">Overview</a>

This section covers the differences between [stream core](/streams.html) and the [stream plugin](/stream.html).
Stream core designates stream features in the broker with only default plugins activated and through protocols like AMQP 0.9.1, MQTT, and STOMP.


### Feature Matrix

|Feature | Stream Core              | Stream Plugin    |
|-| ------------------------ | -------------    |
|Activation| Built-in                 | [Must be activated](http://localhost:8191/stream.html#enabling-plugin)  |
|Protocol| AMQP 0.9.1               | [RabbitMQ Stream](https://github.com/rabbitmq/rabbitmq-server/blob/v3.11.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc)  |
|Clients| AMQP 0.9.1 clients ([documentation](/streams.html#usage)) |[RabbitMQ stream clients](/stream.html#overview)   |
|Port| 5672                     | 5552             |
|Format| Server-side AMQP 1.0 message format encoding and decoding  | Client-side AMQP 1.0 message format encoding and decoding |
|Sub-entry batching|  Not supported    | Supported ([Java example](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#sub-entry-batching-and-compression))      |
|Offset tracking| Use external store      |  Built-in server-side support ([Java example](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#consumer-offset-tracking)) or external store      |
|Publishing deduplication|Not supported       |  Supported ([Java example](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#outbound-message-deduplication))        |
|Throughput| Hundreds of thousands per second | Millions messages per second    |
|TLS|Supported (default port: 5671)                     | Supported (default port: 5551)


### Interoperabilty

Streams store messages using the AMQP 1.0 message format. 

* RabbitMQ Stream client libraries are expected to support the AMQP 1.0 message format
* The broker handles the conversion between AMQP 1.0 and AMQP 0.9.1 for AMQP 0.9.1 clients
* AMQP 0.9.1 and stream clients can write to and read from the same stream, but [Sub-Entry Batching](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#sub-entry-batching-and-compression) is not supported.
* RabbitMQ Stream supports the following section of the AMQP 1.0 message format:
     * properties
     * application properties
     * application data
     * message annotations
