<!--
Copyright (c) 2007-2021 VMware, Inc. or its affiliates.

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

## <a id="overview" class="anchor" href="#overview">Overview</a>

The RabbitMQ persistence layer is intended to provide reasonably good throughput
in the majority of situations without configuration. However,
some configuration is sometimes useful. This guide covers a few configurable
values that affect throughput, latency and I/O characteristics of a node.
Consider reading the entire guide and get accustomed to [benchmarking with PerfTest](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/)
before drawing any conclusions.

Some related guides include:

 * [Main configuration guide](configure.html)
 * [File and Directory Locations](/relocate.html)
 * [Runtime Tuning](/runtime.html)
 * [Queues](/queues.html#runtime-characteristics) and their runtime characteristics


## <a id="how-it-works" class="anchor" href="#how-it-works">How Persistence Works</a>

First, some background: both persistent and transient messages
can be written to disk. Persistent messages will be written to
disk as soon as they reach the queue, while transient messages
will be written to disk only so that they can be evicted from
memory while under memory pressure. Persistent messages are also
kept in memory when possible and only evicted from memory under
memory pressure. The "persistence layer" refers to the mechanism
used to store messages of both types to disk.

On this page we say "queue" to refer to an unmirrored queue or a
queue leader or a queue mirror. Queue mirroring is a "layer above"
persistence.

The persistence layer has two components: the _queue index_
and the _message store_. The queue index is responsible for
maintaining knowledge about where a given message is in a queue,
along with whether it has been delivered and acknowledged. There
is therefore one queue index per queue.

The message store is a key-value store for messages, shared
among all queues in the server. Messages (the body, and any
metadata fields: properties and/or headers) can either be stored
directly in the queue index, or written to the message store. There are
technically two message stores (one for transient and one for
persistent messages) but they are usually considered together as
"the message store".

### <a id="memory-costs" class="anchor" href="#memory-costs">Memory Costs</a>

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

### <a id="index-embedding" class="anchor" href="#index-embedding">Message Embedding in Queue Indices</a>

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


## <a id="limits" class="anchor" href="#limits">OS and Runtime Limits Affecting </a>

It is possible for persistence to underperform because the
persister is limited in the number of file handles or async
threads it has to work with. In both cases this can happen when
you have a large number of queues which need to access the disk
simultaneously.

### <a id="file-handles" class="anchor" href="#file-handles">Too Few File Handles</a>

The RabbitMQ server is limited in the [number of file handles](/networking.html#open-file-handle-limit) it can open.
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

### <a id="async-threads" class="anchor" href="#async-threads">I/O Thread Pool Size</a>

[The runtime](/runtime.html) uses a pool threads to handle
long-running file I/O operations. These are shared among all virtual hosts and queues.
Every active file I/O operation uses one async thread while it is occurring.
Having too few async threads can therefore hurt performance.

Note that the situation with async threads is not exactly
analogous to the situation with file handles. If a queue
executes a number of I/O operations in sequence it will perform
best if it holds onto a file handle for all the operations;
otherwise we may flush and seek too much and use additional CPU
orchestrating it. However, queues do not benefit from holding an
async thread across a sequence of operations (in fact they
cannot do so).

Therefore there should ideally be enough file handles for all
the queues that are executing streams of I/O operations, and
enough async threads for the number of simultaneous I/O
operations your storage layer can plausibly execute.

It's less obvious when a lack of async threads is causing
performance problems. (It's also less likely in general; check
for other things first!) Typical symptoms of too few async
threads include the number of I/O operations per second dropping
to zero (as reported by the management plugin) for brief periods
when the server should be busy with persistence, while the
reported time per I/O operation increases.

The number of async threads is configured by the `+A`
[runtime flag](/runtime.html). It is likely to be a good idea to experiment
with several different values before changing this.


## <a id="msg-store-index-implementations" class="anchor" href="#msg-store-index-implementations">Alternate Message Store Index Implementations</a>

As mentioned above, each message which is written to the message
store uses a small amount of memory for its index entry. The
message store index is pluggable in RabbitMQ, and other
implementations are available as plugins which can remove this
limitation.

The reason they are not shipped with the RabbitMQ distribution is
that they all use native code. Note that such plugins typically
make the message store run more slowly.
