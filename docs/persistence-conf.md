---
title: Persistence Configuration
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

# Persistence Configuration

## Overview {#overview}



This guide covers a few configurable
values that affect throughput, latency and I/O characteristics of a node.
Consider reading the entire guide and get accustomed to [benchmarking with PerfTest](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/)
before drawing any conclusions.

Some related guides include:

 * [Main configuration guide](./configure)
 * [File and Directory Locations](./relocate)
 * [Runtime Tuning](./runtime)
 * [Queues](./queues#runtime-characteristics) and their runtime characteristics
 * [Quorum Queues](./quorum-queues)
 * [Streams](./streams)


## Overview of Persistence in RabbitMQ {#overview}

Modern RabbitMQ versions provide several queue types plus streams:

 * [Quorum queues](./quorum-queues): replicated, durable, data-safety oriented
 * [Streams](./streams): a replicated, durable data structure that supports different operations (than a queue)
 * Classic queues: the original queue type, single replica only starting with RabbitMQ 4.0

These queue types have different storage implementations and applicable configuration
settings that can be tuned are also different.

## Streams {#streams}

Streams use a log-based storage mechanism and keep very little data in memory
(primarily the operational data that has not yet been written to disk).
Nonetheless they offer excellent throughput when clients use the [RabbitMQ Stream Protocol](./stream).

Since streams are very disk I/O heavy, their throughput degrades with larger messages.
They benefit greatly from modern SSD and NVMe storage.

Streams offer no tunable storage parameters related to storage.

## Quorum Queues {#quorum-queues}

Quorum queues use a log-based storage mechanism implemented by RabbitMQ's Raft
implementation. They keep very little data in memory
(primarily the operational data that has not yet been written to disk).

As quorum queues persist all data to disks before doing anything it is recommended
to use the fastest disks possible.

Due to the disk I/O-heavy nature of quorum queues, their throughput decreases
as message sizes increase.

The primary storage-related setting that can affect quorum queue resource use
is the write-ahead log segment size limit, the limit at which WAL in-memory
table will be moved to disk. In other words, every quorum queue would be able to
keep up to this much message data in memory under steady load.

The limit can be controlled

```ini
# Flush current WAL file to a segment file on disk once it reaches 32 MiB in size
raft.wal_max_size_bytes = 32000000
```

:::important

Because memory is not guaranteed to be deallocated instantly by the [runtime](./runtime/),
we recommend that the RabbitMQ node is allocated at least 3 times the memory of the effective WAL file size limit.
More will be required in high-throughput systems.
4 times is a good starting point for those.

:::


## Classic Queues {#classic-queues}

Classic queues have two storage implementations available to them: v1 (the original
one) and v2 (available in RabbitMQ 3.10 and later versions).

### Queue Version {#queue-version}

Since **RabbitMQ 3.10.0**, the broker has a new implementation of
classic queues, named **version 2**. Version 2 queues have a new
index file format and implementation as well as a new per-queue
storage file format to replace the embedding of messages directly
in the index.

The main improvement from version 2 is improved stability while
under high memory pressure.

In **RabbitMQ 3.10.0** version 1 remains the default. It is possible
to switch back and forth between version 1 and version 2.

The version can be changed using the `queue-version` [policy](./parameters#policies) key.
When setting a new version via policy the queue will immediately
convert its data on disk. It is possible to upgrade to version 2
or downgrade to version 1. Note that for large queues the conversion
may take some time and results in the queue being unavailable while
the conversion is running.

The default version can be set through configuration by setting
`classic_queue.default_version` in `rabbitmq.conf`:

```ini
# makes classic queues use a more efficient message storage
# and queue index implementations
classic_queue.default_version = 2
```

## How Classic Queue v1 Persistence Overview {#cq-v1}

First, some background: both persistent and transient messages
can be written to disk. Persistent messages will be written to
disk as soon as they reach the queue, while transient messages
will be written to disk only so that they can be evicted from
memory while under memory pressure. Persistent messages are also
kept in memory when possible and only evicted from memory under
memory pressure. The "persistence layer" refers to the mechanism
used to store messages of both types to disk.

On this page we say "queue" to refer to a non-replicated queue or a
queue leader or a queue mirror. Queue mirroring is a "layer above"
persistence.

The persistence layer has two components: the _queue index_
and the _message store_. The queue index is responsible for
maintaining knowledge about where a given message is in a queue,
along with whether it has been delivered and acknowledged. There
is therefore one queue index per queue.

The message store is a key-value store for messages, shared
among all queues in each vhost. Messages (the body, and any
metadata fields: properties and/or headers) can either be stored
directly in the queue index, or written to the message store. There are
technically two message stores (one for transient and one for
persistent messages) but they are usually considered together as
"the message store".

### Memory Costs {#memory-costs}

Under memory pressure, the persistence layer tries to write as
much out to disk as possible, and remove as much as possible
from memory. There are some things however which must remain in
memory:

 * Each queue maintains some metadata for each
   _unacknowledged_ message. The message itself can be
   removed from memory if its destination is the message store.
 * The message store needs an index. The default message store
   index uses a small amount of memory for every message in the
   store.

### Message Embedding in Queue Indices {#index-embedding}

There are advantages and disadvantages to writing messages to
the queue index.

This feature has advantages and disadvantages. Main advantages are:

 * Messages can be written to disk in one operation rather than
   two; for tiny messages this can be a substantial gain.
 * Messages that are written to the queue index do not require an
   entry in the message store index and thus do not have a memory
   cost when paged out.

Disadvantages are:

 * The queue index keeps blocks of a fixed number of records in
   memory; if non-tiny messages are written to the queue index then
   memory use can be substantial.
 * If a message is routed to multiple queues by an exchange, the
   message will need to be written to multiple queue indices. If
   such a message is written to the message store, only one copy
   needs to be written.
 * Unacknowledged messages whose destination is the queue index
   are always kept in memory.
 * Two writes are still required when **version 2** is used.

The intent is for very small messages to be stored in the queue
index as an optimisation, and for all other messages to be
written to the message store. This is controlled by the
configuration item <code>queue_index_embed_msgs_below</code>. By
default, messages with a serialised size of less than 4096 bytes
(including properties and headers) are stored in the queue
index.

Each queue index needs to keep at least one segment file in
memory when reading messages from disk. The segment file
contains records for 16,384 messages. Therefore be cautious if
increasing <code>queue_index_embed_msgs_below</code>; a small
increase can lead to a large amount of memory used.


## OS and Runtime Limits Affecting {#limits}

It is possible for persistence to underperform because the
persister is limited in the number of file handles or async
threads it has to work with. In both cases this can happen when
you have a large number of queues which need to access the disk
simultaneously.

### Too Few File Handles {#file-handles}

The RabbitMQ server is limited in the [number of file handles](./networking#open-file-handle-limit) it can open.
Every running network connection requires one file handle, and the rest are available
for queues to use. If there are more disk-accessing queues than
file handles after network connections have been taken into
account, then the disk-accessing queues will share the file
handles among themselves; each gets to use a file handle for a
while before it is taken back and given to another queue.

This prevents the server from crashing due to there being too
many disk-accessing queues, but it can become expensive. The
management plugin can show I/O statistics for each node in the
cluster; as well as showing rates of reads, writes, seeks and so
on it will also show a rate of file handle churn — the rate at
which file handles are recycled in this way. A busy server with
too few file handles might be doing hundreds of reopens per
second - in which case its performance is likely to increase
notably if given more file handles.


## Classic Queues v1: Alternate Message Store Index Implementations {#msg-store-index-implementations}

As mentioned above, each message which is written to the message
store uses a small amount of memory for its index entry. The
message store index used by classic queues v1 is pluggable in RabbitMQ, and other
implementations are available as plugins which can remove this
limitation.

The reason they are not shipped with the RabbitMQ distribution is
that they all use native code. Note that such plugins typically
make the message store run more slowly.
