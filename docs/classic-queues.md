---
title: Classic Queues
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

# Classic Queues

## What is a Classic Queue {#overview}

A RabbitMQ classic queue (the original queue type) is a versatile queue type suitable for use cases where data safety is not a priority because the data stored in classic queues is not replicated.
Classic queues uses the **non-replicated** FIFO queue implementation.

If data safety is a priority, the recommendation is to use [quorum queues](./quorum-queues) and [streams](./streams) instead of classic queues.

Classic queues are the default queue type
as long as the default queue type is not overridden for the virtual host.

## Classic Queue Features {#features}

Classic queues fully support [queue exclusivity](./queues),
[queue and message TTL (Time-To-Live)](./ttl),
[queue length limits](./maxlength),
[message priority](./priority),
[consumer priority](./consumer-priority)
and adhere to settings [controlled using policies](./policies).

Classic queues support [dead letter exchanges](./dlx) with
the exception of [at-least-once dead-lettering](./quorum-queues#dead-lettering).

Classic queues do not support [poison message handling](https://en.wikipedia.org/wiki/Poison_message),
unlike [quorum queues](./quorum-queues). Classic queues also do not
support at-least-once dead-lettering, supported by quorum queues.

Use [per-consumer QoS prefetch](./consumer-prefetch). Global QoS prefetch is
[deprecated](./deprecated-features) and disabled by default starting with RabbitMQ 4.3.

Non-durable, non-exclusive classic queues are also deprecated and disabled by
default starting with RabbitMQ 4.3. Use durable queues or
[exclusive queues](./queues#exclusive-queues) instead.

Classic queues is a non-replicated queue type starting with RabbitMQ 4.0.
[Quorum queues](./quorum-queues) and [streams](./streams) provide a better alternative when high availability and
data safety is required.

## Persistence (Durable Storage) in Classic Queues {#persistence}

Classic queues use an on-disk index for storing message locations on disk
as well as a message store for persisting messages.

Both [persistent and transient messages](./publishers#message-properties)
are always persisted to disk except when:

 * the queue is declared as transient or messages are transient
 * messages are smaller than the embedding threshold (defaults to 4096 bytes)
 * the queue is short (queues may keep up to 2048 messages in memory at most,
   depending on the consumer delivery rate)

In general messages are not kept in memory unless the rate of
consumption of messages is high enough that the messages that
are in memory are expected to be consumed within the next
second. Classic queues keep up to 2048 messages in memory,
depending on the consumer delivery rate. Larger messages are not read
into memory until the moment when they have to be sent to consumers.

Persisted messages may be **embedded** in the queue or sent
to a **shared message store**. The decision to store messages
in the queue or in the shared message store is based on the
size of the message, including headers. The shared message
store is more efficient at handling larger messages,
particularly when those messages are sent to multiple
queues.

The message location is written in the queue's index.
Each queue has one index. The queue is responsible for
tracking messages location as well as their position
in the queue, and it persists this information in the
index.

Small messages are written to the **per-queue message store**.

Larger messages are written to a shared message store.
Each vhost has two such stores: one for persistent
messages and one for transient messages, but they
are usually considered together as the shared message
store. All queues in the vhost use the same message
store.

Starting with RabbitMQ 4.4, new shared-store files use the `.sqs` format.
Existing `.rdq` files remain readable and are not rewritten automatically.
A node with `.sqs` files cannot be downgraded to RabbitMQ 4.3 or earlier.

## Classic Queue Storage Implementation Versions {#versions}

Classic queues use the version 2 storage implementation. Version 1 is no longer supported.

### Classic Queue Implementation Version 2

The index in version 2 only uses segment files and only loads messages from
disk when necessary. It will load more messages based on the
current consumption rate. Version 2 does not embed messages
in its index, instead a per-queue message store is used.

Version 2 was added in **RabbitMQ 3.10.0** and was significantly
improved in **RabbitMQ 3.12.0**. Version 1 queues are no longer
supported starting with **RabbitMQ 4.0**.

## Resource Use with Classic Queues {#resource-use}

Classic queues aim to provide reasonably good throughput in the majority
of situations without configuration. However, some configuration is
sometimes useful. This section covers a few configurable values that
affect stability, throughput, latency and I/O characteristics of a node.
Consider getting accustomed to [benchmarking with PerfTest](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/)
in addition to get the most out of your queues.

Some related information includes:

 * [Main configuration guide](./configure)
 * [File and Directory Locations](./relocate)
 * [Runtime Tuning](./runtime)
 * [Queues](./queues#runtime-characteristics) and their runtime characteristics


### File Handle Usage with Classic Queues {#file-handles}

The RabbitMQ server is limited in the [number of file handles](./networking#open-file-handle-limit)
it can open. Every running network connection requires one file handle,
and the rest are available for queues to use.

Classic queues version 2 do not try to accommodate for low numbers
of file descriptors anymore like v1 used to do. They expect servers to
have a large file descriptor limit configured and to always be able to open a
new file handle when necessary. The index keeps up to 4 file
handles open at any time, and the per-queue store keeps 1
file handle open but may open another one when flushing data
to disk. This means that each queue needs up to 6 file
descriptors available to properly function, in theory. In
practice only busy queues will need that many; other queues
will function just fine with 3 or 4 file handles.

As a result of not using the file handle management subsystem,
version 2 does not track as many I/O statistics; only the numbers
of reads and writes. Other metrics can be obtained at the OS level.

### Memory Footprint with Classic Queues {#memory}

Classic queues may keep up to 2048 messages in memory, depending
on the consume rate. Classic queues will, however, avoid reading
larger messages from disk too early. In **RabbitMQ 3.12** this
means messages larger than the embedded threshold (by default, 4096 bytes).

The index and per-queue store in version 2 buffer entries.
This is typically not a concern as far as the index is concerned
since it only tracks metadata. The per-queue store will however
use up to 1MB of memory by default (512KB in the write buffer
and 512KB in a cache). When flushing to disk the store will
first clear the cache then move the messages in the write buffer
to the cache, effectively replacing the data in the cache with
the data in the write buffer. The size of the write buffer and
the cache are therefore linked. It can be configured using the
advanced config via rabbit's `classic_queue_store_v2_max_cache_size`
parameter.

Idle queues will reduce their memory usage. This can sometimes
result in surprising spikes when performing operations that
affect many queues, such as defining new policies. In that case
the queues will need to allocate more memory again. The more
queues, the bigger the spike should be expected.

The shared message store needs an index. The default message store
index uses a small amount of memory for every message in the store.


## Alternate Message Store Index Implementations {#msg-store-index-implementations}

As mentioned above, each message which is written to the message
store uses a small amount of memory for its index entry. The
message store index is pluggable in RabbitMQ, and other
implementations are available as plugins which can remove this
limitation.

The reason they are not shipped with the RabbitMQ distribution is
that they all use native code. Note that such plugins typically
make the message store run more slowly.
