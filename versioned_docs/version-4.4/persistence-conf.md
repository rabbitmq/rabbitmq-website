---
title: Persistence Configuration
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

### Queue Version {#queue-version}

Classic queues use the version 2 storage implementation. Small messages are
written to a per-queue message store; larger messages use a shared store
within each virtual host. The threshold is controlled by
`queue_index_embed_msgs_below` (default: 4096 bytes, including properties and headers).

See [classic queue persistence](./classic-queues#persistence) for details.

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
