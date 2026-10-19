---
title: Modulus Hash Exchange
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

# Modulus Hash Exchange

## Overview {#overview}

The `x-modulus-hash` exchange is a built-in exchange type in RabbitMQ that distributes messages across bound queues based on a hash of the routing key. It is designed to partition messages across a number of regular queues (shards) while guaranteeing stable routing.

When a message is published to this exchange, it hashes the message's routing key and applies a `Hash mod N` operation to pick the destination queue, where `N` is the total number of bound destinations. 

**Note:** This exchange ignores the values of the binding keys.

## Stable Routing {#stable-routing}

A key feature of the `x-modulus-hash` exchange is that it guarantees **stable routing**. As long as the bindings to the exchange remain the same, messages with the same routing key will always be routed to exactly the same destination queue, even across node restarts.

This makes it an excellent choice for use cases where message ordering matters for a specific domain entity (e.g. an order ID), but you still want to process messages concurrently across multiple consumers.

### Concurrent Processing with Message Ordering

A common pattern is to bind `N` queues to an `x-modulus-hash` exchange and enable the [Single Active Consumer (SAC)](./consumers#single-active-consumer) feature on each queue. This provides:
* **Message ordering:** Thanks to stable routing, all messages for a specific routing key end up in the same queue. SAC ensures they are processed in order.
* **Concurrent consumption:** `N` application instances can process messages in parallel, each consuming from a different queue.
* **Fault tolerance:** If an active consumer crashes, the broker will automatically deliver messages to another consumer attached to that queue.

## Weighted Routing {#weighted-routing}

The `x-modulus-hash` exchange also supports **weighted routing** implicitly. If a user binds the exact same queue `M` times to the same exchange instance (using different dummy binding keys, since the binding key is ignored for routing), the queue will have an `M / N` probability of receiving any given message. This allows you to easily distribute more load to specific queues if needed.

## Comparison with Consistent Hash Exchange

RabbitMQ also provides a [Consistent Hash Exchange](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_consistent_hash_exchange/README.md) plugin. While both can partition messages based on routing keys, they have different trade-offs:

* **Modulus Hash Exchange:** Simpler, built-in, and guarantees stable routing. However, if you add or remove queues (changing `N`), the routing for almost all keys will be reshuffled.
* **Consistent Hash Exchange:** Requires enabling a plugin and manages a more complex hash ring. It minimizes reshuffling when queues are added or removed, making it better for dynamic topologies.

If your topology is static and you need strict message ordering guarantees, the `x-modulus-hash` exchange is recommended.
