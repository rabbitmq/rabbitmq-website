---
title: Sender-selected Distribution
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

# Sender-selected Distribution

An AMQP publisher can optionally send a message with **multiple** routing keys.
During routing, RabbitMQ will take all routing keys provided in the message headers into account.

For example, if an AMQP publisher sends a message with multiple routing keys to the [default exchange](/tutorials/amqp-concepts#exchange-default), each routing key represents a queue name, and RabbitMQ routes the message to all specified queues.

In another example, if an AMQP publisher sends a message with multiple routing keys to a [topic exchange](/tutorials/amqp-concepts#exchange-topic), each routing key represents a topic.

Including multiple routing keys in a message allows it to be routed to more queues, depending on how the queues are bound to the exchange.
RabbitMQ settles the message with the [accepted](./amqp#outcomes) outcome if it is routed to at least one queue and all queues confirm receipt.
In other words, RabbitMQ accepts the message even if only a subset of the routing keys results in successful routing.

## AMQP 1.0

To use multiple routing keys in AMQP 1.0, the publisher sets a [message annotation](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-messaging-v1.0-os.html#type-message-annotations) with the key `x-cc` and the value as a [list](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-list) of [strings](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html#type-string).
Each string in the list represents an additional routing key.

These "CC" routing keys are used in addition to the routing key provided in the [AMQP address](./amqp#target-address-v2) string.

## AMQP 0.9.1

To use multiple routing keys in AMQP 0.9.1, the publisher sets the "CC" and "BCC" header keys.
This is similar to specifying multiple recipients in the "CC" or "BCC" fields of an email.
The value for "CC" and "BCC" must be an array of strings (`longstr` values).

The message will be routed using both the routing key supplied as a parameter to the `basic.publish` method and the routing keys provided in the "CC" and "BCC" headers.
The "BCC" key and value will be removed from the message prior to delivery, ensuring some level of confidentiality among consumers.
