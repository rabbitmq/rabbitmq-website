---
title: Direct Reply-to
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

# Direct Reply-to

## Overview {#overview}

Direct reply-to is a feature that allows RPC (request/reply) clients with a design
similar to that demonstrated in [tutorial 6](/tutorials) without requiring the creation
of a reply queue.

:::important

Request-reply implementations where clients use explicitly declared queues, both
long-lived client named and connection-specific exclusive queues, are
just as valid as Direct Reply-to, and have their benefits, in particular
for workloads with long-running tasks

:::

## Motivation {#motivation}

RPC (request/reply) is a popular pattern to implement with a messaging broker
like RabbitMQ. [Tutorial 6](/tutorials) demonstrates its implementation
with a variety of clients. The typical way to do this is for RPC clients to
send requests that are routed to a long lived (known) server queue. The RPC server(s)
consume requests from this queue and then send replies to each client
using the queue named by the client in the <code>reply-to</code>
header.

Where does the client's queue come from? The client can
declare a single-use queue for each request-response pair. But
this is inefficient; even an unreplicated queue can be
expensive to create and then delete (compared with the cost of
sending a message). This is especially true in a cluster as all
cluster nodes need to agree that the queue has been created,
agree on its type, replication parameters, and other metadata.

Therefore, the client should create a single reply queue for multiple RPC requests.

The [properties](queues#properties) of this reply queue depend on the use case:

* **[Exclusive](queues#exclusive-queues) queues** are commonly used when replies are consumed by a single client and deleted upon disconnection
* **Non-exclusive long-lived queues** are better suited for long-running tasks, ensuring replies persist even if the client disconnects temporarily

Direct reply-to eliminates the need for a reply queue. This benefits the request-reply
implementations with short-lived queues and transient responses at the cost
of giving up all control over how the responses are stored.

With Direct Reply-to, RPC clients will receive replies directly from their RPC server,
without going through a reply queue. "Directly" here still means going through the same channel
and a RabbitMQ node; there is no direct network connection between RPC client and RPC server processes.

## How to Use Direct Reply-to {#usage}

To use direct reply-to, an RPC client should:

<ul>
  <li>
    Consume from the pseudo-queue
    <code>amq.rabbitmq.reply-to</code> in no-ack mode. There is no
    need to declare this "queue" first, although the client can do
    so if it wants.
  </li>
  <li>
    Set the <code>reply-to</code> property in their request message to
    <code>amq.rabbitmq.reply-to</code>.
  </li>
</ul>

The RPC server will then see a <code>reply-to</code> property
with a generated name. It should publish to the default exchange
(``""``) with the routing key set to this value (i.e. just as if
it were sending to a reply queue as usual). The message will
then be sent straight to the client consumer.

If the RPC server is going to perform some expensive computation
it might wish to check if the client has gone away. To do this
the server can declare the generated reply name first on a
disposable channel in order to determine whether it still
exists. Note that even if you declare the "queue" with
<code>passive=false</code> there is no way to create it; the
declare will just succeed (with 0 messages ready and 1 consumer)
or fail.

## Caveats and Limitations {#limitations}

<ul>
  <li>
    The RPC client must consume in the <a href="./confirms">automatic acknowledgement mode</a>.
    This is because there is no queue for the reply message to be returned to if the
    client disconnects or rejects the reply message.
  </li>
  <li>
    The RPC client must use the same connection and channel for
    both consuming from <code>amq.rabbitmq.reply-to</code> and
    for publishing the request message.
  </li>
  <li>
    Reply messages sent using this mechanism are in general not
    fault-tolerant; they will be discarded if the client that
    published the original request subsequently disconnects. The
    assumption is that an RPC client will reconnect and submit
    another request in this case.
  </li>
  <li>
    The name <code>amq.rabbitmq.reply-to</code> is used in
    <code>basic.consume</code> and the <code>reply-to</code>
    property as if it were a queue; however it is not. It cannot
    be deleted, and does not appear in the management plugin or
    <code>rabbitmqctl list_queues</code>.
  </li>
  <li>
    If the RPC server publishes with the mandatory flag set then
    <code>amq.rabbitmq.reply-to.*</code> is treated as <b>not</b>
    a queue; i.e. if the server only publishes to this name then
    the message will be considered "not routed"; a
    <code>basic.return</code> will be sent if the mandatory flag
    was set.
  </li>
</ul>

## When to Use Direct Reply-to

While clients should use long lived connections, direct reply-to is ideal for workloads with
[high connection churn](connections#high-connection-churn), where clients establish a connection
for a single RPC and disconnect immediately after.
By avoiding the creation of queue metadata in the [metadata store](metadata-store), direct
reply-to can reduce overhead and latency.

For workloads with long-lived connections where clients perform multiple RPCs, the performance
benefits of direct reply-to are not significant compared to [classic queues](classic-queues).
Modern RabbitMQ versions have optimized classic queues for low latency and minimal resource usage,
making them similarly efficient in such scenarios.
