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

# Classic Queues Operating in "Lazy" Queue Mode (A Lazy Queue)

## What is a Lazy Queue

A "lazy queue" is a classic queue which is running in `lazy` mode. When the "lazy" queue mode is set,
messages in classic queues are moved to disk as early as practically possible.
These messages are loaded into RAM only when they are requested by consumers.

The other queue mode is the `default` mode.
If no mode is specified during declaration, then the `default` mode is used.

It is important to read [There is a Better Way: The Next Generation of Classic Queue Storage is to use Quorum Queues](#interstitial) next.

## <a id="interstitial" class="anchor" href="#interstitial">There is a Better Way: The Next Generation of Classic Queue Storage is to use Quorum Queues</a>

**Before going into further detail about lazy queues, review the following information and recommendation and take appropriate next steps based on it.**

 - Classic queues operated in `lazy` mode until **RabbitMQ 3.12**. It is important to know that from **RabbitMQ 3.12** and onwards, this `lazy` queue mode is ignored. By default, in **RabbitMQ 3.12**, classic queues
work in a similar manner to how classic queues worked with `lazy` mode running on them. Classic queues in **RabbitMQ 3.12** may however
keep a small number of messages in memory (up to 2048 at the time of writing) based on the consumption rate.

 - **Quorum queues should be your default choice for a replicated queue type.**
Classic queue mirroring will be removed in a future version of RabbitMQ.
Classic queues will remain a supported non-replicated queue type.

 - **The recommendation is:** If you are using **RabbitMQ 3.11** and earlier versions, either
upgrade to **RabbitMQ 3.12** now and switch to quorum queues if possible (refer to [Migrate your RabbitMQ Mirrored Classic Queues to Quorum Queues](./migrate-mcq-to-qq.md) if you want to do this)
or turn on `lazy` queue mode for classic queues to avoid running into memory issues.

[Quorum queues](quorum-queues.html) are the alternative to classic queues. Quorum Queues are a more modern queue type
that offers high availability via replication and focuses on data safety.
From RabbitMQ 3.10 onwwards, quorum queues [support message TTL](https://blog.rabbitmq.com/posts/2022/05/rabbitmq-3.10-release-overview/) and
provide [higher throughput and more stable latency](https://blog.rabbitmq.com/posts/2022/05/rabbitmq-3.10-performance-improvements/) compared to mirrored classic queues.

[Streams](streams.html) are another messaging data structure available as of [RabbitMQ 3.9](changelog.html),
and is also replicated.

## <a id="overview" class="anchor" href="#overview">A Deeper Dive into Lazy Queues</a>

One of the main reasons for using lazy queues is to support very
long queues (many millions of messages).  Queues can become very long
for various reasons:

<ul class="plain">
  <li>consumers are offline / have crashed / are down for maintenance</li>
  <li>there is a sudden message ingress spike, producers are outpacing consumers</li>
  <li>consumers are slower than normal</li>
</ul>

By default, queues keep an in-memory cache of messages that is filled up as messages are published into RabbitMQ.
The idea of this cache is to be able to deliver messages to consumers as fast as possible.
Note that persistent messages can be written to disk as they enter the broker **and** kept in RAM at the same time.

Whenever the broker [considers it needs to free up memory](memory.html), messages from this cache will be [paged out to disk](persistence-conf.html).
Paging a batch of messages to disk takes time and blocks the queue process,
making it unable to receive new messages while it's paging.
Even though recent versions of RabbitMQ improved the paging algorithm,
the situation is still not ideal for use cases where you have
many millions on messages in the queue that might need to be paged out.

Running classic queues in `lazy` queue mode attempts to move the messages above to disk as early as practically possible.
This means significantly fewer messages are kept in RAM in the majority of cases under normal operation.
This comes at a cost of increased disk I/O.

## <a id="configuration" class="anchor" href="#configuration">Making a Queue Lazy</a>

Queues can be made to run in `default` mode or `lazy` mode by:

<ul class="plain">
  <li>applying a queue <a href="parameters.html#policies">policy</a> (recommended)</li>
  <li>setting the mode via <code>queue.declare</code> arguments</li>
</ul>

When both a [policy](parameters.html) and queue arguments specify a queue mode,
the queue argument has priority over the policy value if both are specified.

If a queue mode is set via an optional argument at the time of declaration,
it can only be changed by deleting the queue, and re-declaring it later with a different argument.

### Using a policy

To specify a queue mode using a policy, add the key `queue-mode` to a policy definition, e.g.:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
      <pre>rabbitmqctl set_policy Lazy "^lazy-queue$" '{"queue-mode":"lazy"}' --apply-to queues</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
      <pre>rabbitmqctl set_policy Lazy "^lazy-queue$" "{""queue-mode"":""lazy""}" --apply-to queues</pre>
    </td>
  </tr>
</table>

This ensures the queue called `lazy-queue` will work in the `lazy` mode.

Policies can also be defined via [management UI](management.html).

### Changing Queue Mode at Runtime

If queue mode was configured via a policy,
it is possible to change it at runtime without the need of deleting and re-declaring the queue.
To make a queue named "lazy-queue" use the default (non-lazy) mode, update its matching policy
to specify a different `queue-mode`:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
      <pre>rabbitmqctl set_policy Lazy "^lazy-queue$" '{"queue-mode":"default"}' --apply-to queues</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
      <pre>rabbitmqctl set_policy Lazy "^lazy-queue$" "{""queue-mode"":""default""}" --apply-to queues</pre>
    </td>
  </tr>
</table>

### Using Arguments at the Time of Declaration

The queue mode can be set by supplying the `x-queue-mode` queue declaration argument with a string specifying the desired mode.
Valid modes are:

<ul class="plain">
  <li><code>"default"</code></li>
  <li><code>"lazy"</code></li>
</ul>

If no mode is specified during declare, then `"default"` is assumed.
The `default` mode is the behaviour already present in pre 3.6.0 versions of the broker,
so there are no breaking changes in this regard.

This example in Java declares a queue with the queue mode set to `"lazy"`:

<pre class="lang-java">
  Map&lt;String, Object> args = new HashMap&lt;String, Object>();
  args.put("x-queue-mode", "lazy");
  channel.queueDeclare("myqueue", false, false, false, args);
</pre>

## <a id="performance" class="anchor" href="#performance">Performance Considerations for Lazy Queues</a>

### Disk Utilization

A lazy queue will move its messages to disk as soon as practically possible, even if the message was published
as transient by the publisher. This generally will result in higher disk I/O utilisation.

A regular queue will [keep messages in memory for longer](memory.html).
This will result in delayed disk I/O which is less even (has more spikes)
since more data will need to be written to disk at once.

### RAM Utilization

While it's impossible to provide accurate numbers every use
case, this is a simplistic test that showcases the difference in RAM
utilization between a regular &amp; a lazy queue:

| Number of messages | Message body size | Message type | Producers | Consumers |
| -                  | -                 | -            | -         | -         |
| 1,000,000          | 1,000 bytes       | persistent   | 1         | 0         |

The RAM utilization for default &amp; lazy queues **after** ingesting the above messages:

| Queue mode | Queue process memory | Messages in memory | Memory used by messages | Node memory |
| -          | -                    | -                  | -                       | -           |
| `default`  | 257 MB               | 386,307            | 368 MB                  | 734 MB      |
| `lazy`     | 159 KB               | 0                  | 0                       | 117 MB      |

Both queues persisted 1,000,000 messages and used 1.2 GB of disk space.

#### Test Details

Below is a transcript of the test performed with a queue in the regular (default) mode:

<pre class="lang-bash">
# Start a temporary RabbitMQ node:
#
#       export RABBITMQ_NODENAME=default-queue-test
#       export RABBITMQ_MNESIA_BASE=/tmp
#       export RABBITMQ_LOG_BASE=/tmp
#       rabbitmq-server &amp;
#
# (the last command will fail if there is another RabbitMQ node already running)

# In a https://github.com/rabbitmq/rabbitmq-perf-test clone, run:
make run ARGS="-y 0 -s 1000 -f persistent -C 1000000 -u default -ad false"
# Run gmake on OS X

# Queue stats:
rabbitmqctl list_queues name arguments memory messages_ram message_bytes_ram messages_persistent message_bytes_persistent
Timeout: 60.0 seconds ...
Listing queues for vhost / ...
default	[]	417421592	386307	386307000	1000000	1000000000

# Node memory stats
rabbitmq-diagnostics status | grep rss,
      {total,[{erlang,1043205272},{rss,770306048},{allocated,1103822848}]}]},

# Stop our temporary RabbitMQ node &amp; clean all persistent files
#
#       rabbitmqctl shutdown
#       rm -fr /tmp/{log,$RABBITMQ_NODENAME*}
</pre>

With a lazy queue the transcript is very similar:

<pre class="lang-bash">
# Use a different RABBITMQ_NODENAME
# All other variables remain the same as the previous example
#
#       export RABBITMQ_NODENAME=lazy-queue-test

# In a https://github.com/rabbitmq/rabbitmq-perf-test clone, run:
make run ARGS="-y 0 -s 1000 -f persistent -C 1000000 -u lazy -qa x-queue-mode=lazy -ad false"
# Run gmake on OS X
</pre>

**Note that this was a very simplistic test.** Please make sure to do benchmarks for your specific
workload and use this test as a starting point.


### Switching Queue Mode at Runtime

When converting a `default` queue into a `lazy` one,
the performance impact on the operation is the same impact as when a queue needs to page messages to disk.

During a conversion from the regular mode to the lazy one,
the queue will first page all messages kept in RAM to disk. It won't accept any more
messages from publishing channels while that operation is in progress.
After the initial pageout is done, the queue will start accepting publishes, acks, and other commands.

When a queue goes from the lazy mode to the default one,
it will perform the same process as when a queue is recovered after a server restart:
a batch of 16384 messages will be loaded into memory.


## <a id="caveats-limitations" class="anchor" href="#caveats-limitations">Caveats and Limitations</a>

Lazy queues are appropriate when keeping node memory usage low is a priority
and higher disk I/O and disk utilisation are acceptable. Lazy queues have other aspects
that should be considered.

### Node Startup

When a node is running and under normal operation, lazy queues will keep all messages on disk,
the only exception being in-flight messages.

When a RabbitMQ node starts, all queues, including the lazy ones, will load up to **16,384** messages into RAM.
If [queue index embedding](persistence-conf.html) is turned on (the `queue_index_embed_msgs_below` configuration parameter is greater than 0),
the payloads of those messages will be loaded into RAM as well.

For example, a lazy queue with **20,000** messages of **4,000** bytes each, will load **16,384** messages into memory.
These messages will use **63MB** of system memory.
The queue process will use another **8.4MB** of system memory, bringing the total to just over **70MB**.

This is an important consideration for capacity planning if the
RabbitMQ node is memory constrained, or if there are many lazy queues
hosted on the node.

**It is important to remember that an under-provisioned RabbitMQ node in terms of memory or disk space will fail to start.**

Setting `queue_index_embed_msgs_below` to `0` will turn off payload embedding in the queue index.
As a result, lazy queues will not load message payloads into memory on node startup.
See the [Persistence Configuration guide](persistence-conf.html) for details.

When setting `queue_index_embed_msgs_below` to `0` all messages will be stored
to the message store. With many messages across many lazy queues,
that can lead to higher disk usage and also higher file descriptor usage.

Message store is append-oriented and uses a compaction mechanism to reclaim
disk space. In extreme scenarios it can
use two times more disk space compared to the sum of message payloads stored on disk.
It is important to overprovision disk space to account for such peaks.

All messages in the message store are stored in 16MB files called segment files or segments.
Each queue has its own file descriptor for each segment file it has to access.
For example, if 100 queues store 10GB worth of messages, there will
be 640 files in the message store and up to 64000 file descriptors.
Make sure the nodes have a high enough [open file limit](./production-checklist.html#resource-limits-file-handle-limit)
and overprovision it when in doubt (e.g. to 300K or 500K).
For new installations it is possible to increase file size used by the message store using
`msg_store_file_size_limit` configuration key. **Never change segment file size for existing installations**
as that can result in a subset of messages being ignored by the node
and can break segment file compaction.

#### Lazy Queues with Mixed Message Sizes

If all messages in the first **10,000** messages are below the
`queue_index_embed_msgs_below` value, and the rest are above this
value, only the first **10,000** will be loaded into memory on node
startup.

#### Lazy Queues with Interleaved Message

Given the following interleaved message sizes:

| Position in queue | Message size in bytes |
| -                 | -                     |
| 1                 | 5,000                 |
| 2                 | 100                   |
| 3                 | 5,000                 |
| 4                 | 200                   |
| ...               | ...                   |
| 79                | 4,000                 |
| 80                | 5,000                 |

Only the first **20** messages below the `queue_index_embed_msgs_below` value will be loaded into memory on node startup.
In this scenario, messages will use **21KB** of system memory, and queue process will use another **32KB** of system memory.
The total system memory required for the queue process to finish starting is **53KB**.


### Mirroring of Lazy Queues

When enabling [automatic queue mirroring](./ha.html#unsynchronised-mirrors), consider the expected on disk
data set of the queues involved. Queues with a sizeable data set
(say, tens of gigabytes or more) will have to replicate it to
the newly added mirror(s), which can put a significant load on
cluster resources such as network bandwidth and disk I/O. This is
a common scenario with lazy queues, for example.
