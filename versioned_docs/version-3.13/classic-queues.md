---
title: Classic Queues
displayed_sidebar: docsSidebar
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

# Classic Queues

## What is a Classic Queue {#overview}

A RabbitMQ classic queue (the original queue type) is a versatile queue type suitable for use cases where data safety is not a priority because the data stored in classic queues is not replicated.
Classic queues uses the **non-replicated** FIFO queue implementation.

If data safety is a priority, the recommendation is to use [quorum queues](./quorum-queues) and [streams](./streams) instead of classic queues.

Classic queues are the default queue type
as long as the default queue type is not overridden for the virtual host.

There are [two versions](#versions) (implementations) of classic queue message storage
and indexing.
The version only impacts how the data is stored on and read from disk: all features are
available in both versions.

## Classic Queue Features {#features}

Classic queues fully support [queue exclusivity](./queues),
[queue and message TTL (Time-To-Live)](./ttl),
[queue length limits](./maxlength),
[message priority](./priority),
[consumer priority](./consumer-priority)
and adhere to settings [controlled using policies](./parameters#policies).

Classic queues support [dead letter exchanges](./dlx) with
the exception of [at-least-once dead-lettering](./quorum-queues#dead-lettering).

Classic queues do not support [poison message handling](https://en.wikipedia.org/wiki/Poison_message),
unlike [quorum queues](./quorum-queues). Classic queues also do not
support at-least-once dead-lettering, supported by quorum queues.

[Per-consumer QoS prefetch](./consumer-prefetch) should be
preferred over global QoS prefetch, even though classic queues support
both options. Global QoS prefetch is a deprecated feature that will be
removed in **RabbitMQ 4.0**.

While classic queues can be declared as transient, this makes queue
removal difficult to reason about in case of node restarts during upgrades and such,
so the use of transient queues is discouraged. Support for transient queues
is deprecated and will be removed in **RabbitMQ 4.0**.

Classic queues can be mirrored across multiple nodes in the
cluster. This functionality is deprecated and will be removed
in **RabbitMQ 4.0**. [Quorum queues](./quorum-queues)
and [streams](./streams) provide a better alternative when high availability and
data safety is required.

Until **RabbitMQ 3.12**, classic queues could operate in **lazy mode**.
As of RabbitMQ 3.12 the queue mode is ignored and classic queues
behave in a similar manner to lazy queues. They only keep a small
number of messages in memory based on the consumption rate;
all other messages are written to disk directly.


## Persistence (Durable Storage) in Classic Queues {#persistence}

Classic queues use an on-disk index for storing message locations on disk
as well as a message store for persisting messages.

Both [persistent and transient messages](./publishers#message-properties)
are always persisted to disk except when:

 * the queue is declared as transient or messages are transient
 * messages are smaller than the embedding threshold (defaults to 4096 bytes)
 * for **RabbitMQ 3.12** and later versions: the queue is short (queues may
   keep up to 2048 messages in memory at most, depending on the consumer delivery rate)

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

Embedded messages are written in its queue index when
using classic queues version 1; and in its
**per-queue message store** when using classic
queues version 2.

Larger messages are written to a shared message store.
Each vhost has two such stores: one for persistent
messages and one for transient messages, but they
are usually considered together as the shared message
store. All queues in the vhost use the same message
store.

## Classic Queue Storage Implementation Versions {#versions}

There are currently two classic queue versions (implementation).
Depending on the version, classic queues will
use a different index for messages, as well
as operate differently regarding the embedding of small messages in
the index.

#### Classic Queue Implementation Version 1

Version 1 is the default and the original implementation of classic
queues. The index in version 1 uses a combination of a journal and
segment files. When reading messages from segment files it loads
an entire segment file in memory, which can lead to memory issues
but does reduce the amount of I/O performed. Version 1 embeds
small messages in the index, further worsening memory issues.

### Classic Queue Implementation Version 2

Version 2 takes advantage of the improved performance of modern
storage devices and is the recommended version. The index in
version 2 only uses segment files and only loads messages from
disk when necessary. It will load more messages based on the
current consumption rate. Version 2 does not embed messages
in its index, instead a per-queue message store is used.

Version 2 was added in **RabbitMQ 3.10.0** and was significantly
improved in **RabbitMQ 3.12.0**. It is currently possible to
switch back and forth between version 1 and version 2. In the future,
version 1 will be removed and the migration to version 2 will be performed
automatically on node startup after the upgrade.

The version can be changed using the `queue-version` policy key.
When setting a new version via policy the queue will immediately
convert its data on disk. It is possible to upgrade to version 2
or downgrade to version 1. Note that for large queues the conversion
may take some time and results in the queue being unavailable while
the conversion is running. As a point of reference, on our test machine,
the migration takes:

* 2 seconds to migrate 1000 queues with 1000 100-byte messages each
* 9 seconds to migrate a queue with 1 million 100-byte messages
* 3 seconds to migrate a queue with 1 million 5000-byte messages
  (with the default embedding size of 4096 bytes, 5000-byte
  messages are in the message store so there is less data to migrate)

Given the numbers above, unless there is a lot of queues with a lot of messages,
the migration should complete in a matter of seconds.

The default version can be set through configuration by setting
`classic_queue.default_version` in rabbitmq.conf. Changing the default version
only affects newly declared queues. Pre-existing queues will remain on version 1,
until explicitly migrated or deleted and redeclared.

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
 * [Lazy Queues](./lazy-queues) for **RabbitMQ before 3.12**


### File Handle Usage with Classic Queues {#file-handles}

The RabbitMQ server is limited in the [number of file handles](./networking#open-file-handle-limit)
it can open. Every running network connection requires one file handle,
and the rest are available for queues to use.

Classic queues behave differently with regard to file handle
usage depending on the version used.

Version 1 tries to avoid running out of file descriptors.
If there are more disk-accessing queues than
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

Version 2 does not try to accomodate for low numbers of file
descriptors anymore. It expects servers to have a large file
descriptor limit configured and to always be able to open a
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

The index in version 1 has to read entire segment files in order
to access the messages inside. This can lead to memory usage spikes,
especially when many messages are embedded. This also leads to
spikes in CPU usage due to increased garbage collection. In addition,
the index will buffer writes and keep data up to 1MB in memory
before flushing to disk.

The index and per-queue store in version 2 will buffer entries.
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
