---
title: AMQP 0-9-1 Protocol Extensions
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

# AMQP 0-9-1 Protocol Extensions

## Overview

RabbitMQ implements a number of extensions of the
[AMQP 0-9-1 specification](https://github.com/rabbitmq/amqp-0.9.1-spec/),
which are listed on this page.

Some extensions introduce new protocol methods (operations); others rely on existing
extension points such as [optional queue arguments](./queues#optional-arguments).

## Publishing

 * [Publisher Confirms](./confirms) (aka Publisher Acknowledgements) are a lightweight way to know when
   RabbitMQ has taken responsibility for messages.
 * [Blocked Connection Notifications](./connection-blocked)
   allows clients to be notified when a connection is blocked and unblocked.

## Consuming

 * [Consumer Cancellation Notifications](./consumer-cancel) let a consumer know if it has been cancelled by the server.
 * [`basic.nack`](./nack) extends `basic.reject` to support rejecting multiple messages at once.
 * [Consumer Priorities](./consumer-priority) allow you to send messages to higher priority consumers first.
 * [Direct reply-to](./direct-reply-to) allows RPC clients to receive replies to their queries without needing
   to declare a temporary queue.

## Message Routing

 * [Exchange to Exchange Bindings](./e2e) allow
   messages to pass through multiple exchanges for more flexible routing.
 * [Alternate Exchanges](./ae) route messages that were otherwise unroutable.
 * [Sender-selected Distribution](./sender-selected) allows a publisher to decide where messages
   are routed directly.

## Message Lifecycle

 * [Per-Queue Message TTL](./ttl#per-queue-message-ttl)
   determines how long an unconsumed message can live in a queue before
   it is automatically deleted.
 * [Per-Message TTL](./ttl#per-message-ttl-in-publishers) determines the TTL on a per-message basis.
 * [Queue TTL](./ttl#queue-ttl) determines how
   long an unused queue can live before it is automatically deleted.
 * [Dead Letter Exchanges](./dlx) ensure messages get re-routed when they are rejected or expire.
 * [Queue Length Limit](./maxlength) allows the maximum length of a queue to be set.
 * [Priority Queues](./priority) support the message priority field (in a slightly different way).

## Authentication and Identity

 * The [User-ID](./validated-user-id) message property is validated by the server.
 * Clients that advertise the appropriate capability may receive
   explicit [authentication failure notifications](./auth-notification) from the broker.
 * `update-secret` to be able to renew credentials for an active connection, when those credentials can expire.


## AMQP 0-9-1 Spec Differences

Some features that were in AMQP 0-8 were deprecated in AMQP
0-9-1. We have undeprecated some of them and introduced a
couple of tiny behaviour changes that improve usability of
the product. Please refer to the [spec differences](./spec-differences) page.

There's also an [AMQP 0-9-1 Errata page](/amqp-0-9-1-errata) which explains how various
