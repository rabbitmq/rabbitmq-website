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

# Protocol Extensions

## Overview

The RabbitMQ implements a number of extensions of the
[AMQP 0-9-1 specification](./specification.html), which we
document here.

Some extensions introduce new protocol methods (operations); others rely on existing
extension points such as [optional queue arguments](./queues.html#optional-arguments).

## Publishing

 * [Publisher Confirms](./confirms.html) (aka Publisher Acknowledgements) are a lightweight way to know when
   RabbitMQ has taken responsibility for messages.
 * [Blocked Connection Notifications](./connection-blocked.html)
   allows clients to be notified when a connection is blocked and unblocked.

## Consuming

 * [Consumer Cancellation Notifications](./consumer-cancel.html) let a consumer know if it has been cancelled by the server.
 * [`basic.nack`](./nack.html) extends `basic.reject` to support rejecting multiple messages at once.
 * [Consumer Priorities](./consumer-priority.html) allow you to send messages to higher priority consumers first.
 * [Direct reply-to](./direct-reply-to.html) allows RPC clients to receive replies to their queries without needing
   to declare a temporary queue.

## Message Routing

 * [Exchange to Exchange Bindings](./e2e.html) allow
   messages to pass through multiple exchanges for more flexible routing.
 * [Alternate Exchanges](./ae.html) route messages that were otherwise unroutable.
 * [Sender-selected Distribution](./sender-selected.html) allows a publisher to decide where messages
   are routed directly.

## Message Lifecycle

 * [Per-Queue Message TTL](./ttl.html#per-queue-message-ttl)
   determines how long an unconsumed message can live in a queue before
   it is automatically deleted.
 * [Per-Message TTL](./ttl.html#per-message-ttl) determines the TTL on a per-message basis.
 * [Queue TTL](./ttl.html#queue-ttl) determines how
   long an unused queue can live before it is automatically deleted.
 * [Dead Letter Exchanges](./dlx.html) ensure messages get re-routed when they are rejected or expire.
 * [Queue Length Limit](maxlength.html) allows the maximum length of a queue to be set.
 * [Priority Queues](./priority.html) support the message priority field (in a slightly different way).

## Authentication and Identity

 * The [User-ID](./validated-user-id.html) message property is validated by the server.
 * Clients that advertise the appropriate capability may receive
   explicit [authentication failure notifications](./auth-notification.html) from the broker.
 * [`update-secret`](./amqp-0-9-1-reference.html#connection.update-secret)
   to be able to renew credentials for an active connection, when those credentials can expire.


## AMQP 0-9-1 Spec Differences

Some features that were in AMQP 0-8 were deprecated in AMQP
0-9-1. We have undeprecated some of them and introduced a
couple of tiny behaviour changes that improve usability of
the product. Please refer to the [spec differences](./spec-differences.html) page.

There's also an [AMQP 0-9-1 Errata page](./amqp-0-9-1-errata.html) which explains how various
