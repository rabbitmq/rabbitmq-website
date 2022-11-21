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


In this section we cover the difference between [stream-core](/streams.html) and [stream-plugin](/stream.html)



### Feature Matrix

|Feature | Stream-Core              | Stream-Plugin    |
|-| ------------------------ | -------------    |
|Activation| Built-in                 | [Must be enabled](http://localhost:8191/stream.html#enabling-plugin)  |
|Protocol| AMQP 0.9.1               | [RabbitMQ Stream](https://github.com/rabbitmq/rabbitmq-server/blob/v3.11.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc)  |
|Clients| AMQP 0.9.1 clients.[ Usage documentation](/streams.html#usage)  |[ RabbitMQ stream clients](/stream.html#overview)   |
|Port| 5672                     | 5552             |
|Format| consume AMQP 0.9.1/1.0 messages  | consume AMQP 0.9.1/1.0 messages |
|Sub-Entry batching|  Not supported    | Supported ([Java example](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#sub-entry-batching-and-compression))      |
|Offset tracking| Use external store      |  Built-in server side ([Java Example](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#consumer-offset-tracking))      |
|Publishing deduplication|Not supported       |  Supported ([Java example](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#outbound-message-deduplication))        |
|Throughput| Hundreds of thousands per second | Millions messages per second    |
|TLS|Supported (5671-Port)                     | Supported (5551-Port)


### Interoperabilty

Stream queues store the messages in AMQP 1.0 format. 

- RabbitMQ Stream clients implement the AMQP 1.0 format message
- The Server converts into AMQP 1.0 server side for AMQP 0.9.1 clients.
- AMQP 0.9.1 and Stream clients can read and write to the same stream queue except for [Sub-Entry Batching](https://rabbitmq.github.io/rabbitmq-stream-java-client/snapshot/htmlsingle/#sub-entry-batching-and-compression) compressed messages.
- The AMQP 1.0 format supports only the following fields:
	- ApplicationData
	- MessageAnnotations
	- MessageProperties
	- ApplicationProperties 
	- `AmqpValue`  is read only.
