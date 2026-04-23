---
title: Intercepting Messages
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Intercepting Messages

## Overview

RabbitMQ provides a generic mechanism to intercept messages on the broker.
Interception can occur at two stages:
1. **Incoming messages** – intercepted when a message enters RabbitMQ, just before it is routed to [queues](./queues).
2. **Outgoing messages** – intercepted when RabbitMQ delivers a message to a client, just before it is [converted](./conversions) to the target protocol.

Interceptors are executed by one of the following [Erlang processes](https://www.erlang.org/doc/system/ref_man_processes.html):
* AMQP 1.0 session
* AMQP 0.9.1 [channel](./channels)
* MQTT connection

Messages sent over the [RabbitMQ Streams protocol](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_stream/docs/PROTOCOL.adoc) are not intercepted.

A message interceptor is an [Erlang module](https://www.erlang.org/doc/system/modules.html) that implements the [rabbit_msg_interceptor](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbit/src/rabbit_msg_interceptor.erl) behaviour.
What the interceptor does is entirely up to its implementation - it can validate message metadata, add annotations, or perform arbitrary side effects.

Custom interceptors can be developed and integrated via [plugins](./plugins).

RabbitMQ ships with several built-in message interceptors.
Below are examples of how to configure them using the [rabbitmq.conf](./configure#config-file) file.

## Incoming Message Interceptors

### Timestamp

This interceptor adds a timestamp to each incoming message:

```ini
message_interceptors.incoming.set_header_timestamp.overwrite = true
```

* AMQP 1.0 and Streams clients receive a message annotation: `x-opt-rabbitmq-received-time` (timestamp in milliseconds since January 1, 1970 UTC).
* AMQP 0.9.1 clients receive:
    * `timestamp_in_ms` header (milliseconds) for compatibility with the former [Message Timestamp Plugin](https://github.com/rabbitmq/rabbitmq-message-timestamp)
    * `timestamp` property (seconds)

To preserve an existing `timestamp_in_ms` header, set `overwrite` to `false`:
```ini
message_interceptors.incoming.set_header_timestamp.overwrite = false
```

### Routing Node

This interceptor adds a message annotation `x-routed-by` indicating which RabbitMQ [node](./clustering#node-names) received and routed the message:
```ini
message_interceptors.incoming.set_header_routing_node.overwrite = true
```

Set `overwrite` to `false` to preserve an existing value:
```ini
message_interceptors.incoming.set_header_routing_node.overwrite = false
```

### MQTT client ID

If the [MQTT plugin](./mqtt) is enabled, RabbitMQ can annotate incoming messages with the [client ID](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901059) of the publishing MQTT client.
This is done by adding a message annotation with the key `x-opt-mqtt-client-id`.

```init
mqtt.message_interceptors.incoming.set_client_id_annotation.enabled = true
```

This annotation is visible to AMQP 1.0, AMQP 0.9.1, and Streams consumers.
However, MQTT clients will not receive this annotation, as the MQTT spec does not allow arbitrary broker-added annotations.

## Outgoing Message Interceptors

### Timestamp

This interceptor timestamps messages when they are sent to clients:

```ini
message_interceptors.outgoing.timestamp.enabled = true
```

The annotation key is `x-opt-rabbitmq-sent-time`, and its value is a timestamp in milliseconds since January 1, 1970 UTC.
