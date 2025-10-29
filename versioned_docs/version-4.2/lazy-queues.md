---
title: Classic Queues Operating in "Lazy" Queue Mode (A Lazy Queue)
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

# Classic Queues Operating in "Lazy" Queue Mode (A Lazy Queue)

:::tip
RabbitMQ no longer supports the "lazy" mode. This page is provided for historical reference only.
:::

Until RabbitMQ 3.12, classic queues could be configured to operate in the `lazy` mode,
which means they would write all message to disk and wouldn't keep messages in memory at all.
This setting is now ignored, although the current behaviour of classic queues is similar to
what the lazy mode used to provide. The current behaviour is:

- in general, messages are written to disk, although with a delay; messages are
  buffered in memory briefly, until the buffer is flushed to disk
- a small subset of messages is kept in memory for fast delivery to consumers
  (the number of messages kept in memory depends on how quickly the consumers
  consume messages)
- if a message published by a producer can be immediately delivered to a consumer
  and the consumer acknowledges the message before the message is written to disk,
  it will not be written to disk (at this point the message is already delivered
  and acknowledged, so there is no need to write it to disk)

With older versions, you'd need to choose between low latency (non-lazy) and low-memory
usage (lazy) on a per-queue basis. Current implementation provides low latency with
low and stable memory usage.

The [classic queues page](./classic-queues.md) provides further details about classic queue implementation.
