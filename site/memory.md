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

# Memory Alarms

<!--
   To avoid terminology soup:
   - "memory threshold" always refers to the configured fraction
   - "memory limit" always refers to the computed absolute limit
-->

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers RabbitMQ memory threshold and paging settings, running nodes
on 64-bit and 32-bit systems, and other related topics.

A separate guide, [Reasoning About Memory Use](./memory-use.html), covers how to
determine what consumes memory on a running RabbitMQ node for the purpose of
[monitoring](./monitoring.html) or troubleshooting.

Portions of this guide related to queue content paging to disk **are obsolete**
or not applicable for [quorum queues](./quorum-queues.html), [streams](./streams.html)
and classic queues storage version 2 (CQv2). All of them
actively move data to disk and do not generally accumulate a significant
backlog of messages in memory.

## <a id="threshold" class="anchor" href="#threshold">Memory Threshold: What it is and How it Works</a>

The RabbitMQ server detects the total amount of
RAM installed in the computer on startup and when

<code>rabbitmqctl set_vm_memory_high_watermark <em>fraction</em></code> is
executed. By default, when the RabbitMQ server uses above 40%
of the available RAM, it raises a memory [alarm](./alarms.html) and blocks all
connections that are publishing messages. Once the memory alarm has cleared (e.g. due
to the server paging messages to disk or delivering them to
clients that consume and [acknowledge the deliveries](./confirms.html)) normal service resumes.

The default memory threshold is set to 40% of installed
RAM. Note that this does not prevent the RabbitMQ server
from using more than 40%, it is merely the point at which
publishers are throttled. Erlang's garbage collector can, in
the worst case, cause double the amount of memory to be used
(by default, 80% of RAM). It is strongly recommended that OS
swap or page files are enabled.

32-bit architectures tend to impose a per process memory limit
of 2GB. Common implementations of 64-bit architectures
(i.e. AMD64 and Intel EM64T) permit only a paltry 256TB per
process. 64-bit Windows further limits this to 8TB. However,
note that even under 64-bit OSes, a 32-bit process frequently
only has a maximum address space of 2GB.


## <a id="configuring-threshold" class="anchor" href="#configuring-threshold">Configuring the Memory Threshold</a>

The memory threshold at which the flow control is triggered
can be adjusted by editing the [configuration
file](configure.html#configuration-files).

The example below sets the threshold to the default value of 0.4:
<pre class="lang-ini">
\# new style config format, recommended
vm_memory_high_watermark.relative = 0.4
</pre>

The default value of 0.4 stands for 40% of available (detected) RAM or
40% of available virtual address space, whichever is
smaller. E.g. on a 32-bit platform with 4 GiB of RAM
installed, 40% of 4 GiB is 1.6 GiB, but 32-bit Windows normally
limits processes to 2 GiB, so the threshold is actually to 40%
of 2 GiB (which is 820 MiB).

Alternatively, the memory threshold can be adjusted by setting
an absolute limit of RAM used by the node. The example below sets
the threshold to 1073741824 bytes (1024 MiB):

<pre class="lang-ini">
vm_memory_high_watermark.absolute = 1073741824
</pre>

Same example, but using memory units:

<pre class="lang-ini">
vm_memory_high_watermark.absolute = 1024MiB
</pre>

If the absolute limit is larger than the installed RAM or available virtual
address space, the threshold is set to whichever limit is smaller.

The memory limit is appended to the [log file](./logging.html) when the RabbitMQ node
starts:

<pre class="lang-ini">
2019-06-10 23:17:05.976 [info] &lt;0.308.0&gt; Memory high watermark set to 1024 MiB (1073741824 bytes) of 8192 MiB (8589934592 bytes) total
</pre>

The memory limit may also be queried using the
`rabbitmq-diagnostics memory_breakdown` and `rabbitmq-diagnostics status` commands.

The threshold can be changed while the broker is running
using the

<pre class="lang-bash">
rabbitmqctl set_vm_memory_high_watermark <em>&lt;fraction&gt;</em>
</pre>

command or

<pre class="lang-bash">
rabbitmqctl set_vm_memory_high_watermark absolute <em>&lt;memory_limit&gt;</em>
</pre>

For example:

<pre class="lang-bash">
rabbitmqctl set_vm_memory_high_watermark 0.6
</pre>

and

<pre class="lang-bash">
rabbitmqctl set_vm_memory_high_watermark absolute "4G"
</pre>

When using the absolute mode, it is possible to use one of the following memory units:

 * `M`, `MiB` for mebibytes (`2^20` bytes)
 * `MB` for megabytes (`10^6` bytes)
 * `G`, `GiB` for gibibytes (`2^30` bytes)
 * `GB` for gigabytes (`10^9` bytes)

Both commands will have an effect until the node stops. To make the setting survive node restart,
use the configuration setting instead.

The memory limit may change on systems with hot-swappable RAM when this command is executed without altering
the threshold, due to the fact that the total amount of system
RAM is queried.

### <a id="stop-publishing" class="anchor" href="#stop-publishing">Stop All Publishing</a>

When the threshold or absolute limit is set to `0`, it makes the memory alarm go off
immediately and thus eventually blocks all publishing connections. This may be
useful if you wish to deactivate publishing globally:

<pre class="lang-bash">
rabbitmqctl set_vm_memory_high_watermark 0
</pre>

## <a id="address-space" class="anchor" href="#address-space">Limited Address Space</a>

When running RabbitMQ inside a 32 bit Erlang VM in a 64 bit
OS (or a 32 bit OS with PAE), the addressable memory is
limited. The server will detect this and log a message like:

<pre class="lang-plaintext">
2018-11-22 10:44:33.654 [warning] Only 2048MB of 12037MB memory usable due to limited address space.
</pre>

The memory alarm system is not perfect. While stopping publishing
will usually prevent any further memory from being used, it is quite
possible for other things to continue to increase memory
use. Normally when this happens and the physical memory is exhausted
the OS will start to swap. But when running with a limited address
space, running over the limit will cause the VM to terminate or killed
by an out-of-memory mechanism of the operating system.

It is therefore strongly recommended to run RabbitMQ on a 64 bit
OS and a 64-bit [Erlang runtime](./which-erlang.html).


## <a id="paging" class="anchor" href="#paging">Configuring the Paging Threshold</a>

This section **is obsolete** or not applicable for [quorum queues](./quorum-queues.html), [streams](./streams.html)
and classic queues storage version 2 (CQv2). All of them
actively move data to disk and do not generally accumulate a significant
backlog of messages in memory.

Before the broker hits the high watermark and blocks
publishers, it will attempt to free up memory by instructing
CQv1 queues to page their contents out to disc. Both persistent
and transient messages will be paged out (the persistent
messages will already be on disc but will be evicted from
memory).

By default this starts to happen when the broker is 50% of
the way to the high watermark (i.e. with a default high
watermark of 0.4, this is when 20% of memory is used). To
change this value, modify
the `vm_memory_high_watermark_paging_ratio`
configuration from its default value
of `0.5`. For example:

<pre class="lang-ini">
vm_memory_high_watermark_paging_ratio = 0.75
vm_memory_high_watermark.relative = 0.4
</pre>

The above configuration starts paging at 30% of memory used, and
blocks publishers at 40%.


## <a id="unrecognised-platforms" class="anchor" href="#unrecognised-platforms">Unrecognised Platforms</a>

If the RabbitMQ server is unable to detect the operating system it is running on,
it will append a warning to the [log file](./logging.html). It then assumes than
1GB of RAM is installed:

<pre class="lang-ini">
2018-11-22 10:44:33.654 [warning] Unknown total memory size for your OS {unix,magic_homegrown_os}. Assuming memory size is 1024MB.
</pre>

In this case, the `vm_memory_high_watermark`
configuration value is used to scale the assumed 1GB
RAM. With the default value of
`vm_memory_high_watermark` set to 0.4,
RabbitMQ's memory threshold is set to 410MB, thus it will
throttle producers whenever RabbitMQ is using more than
410MB memory. Thus when RabbitMQ can't recognize your
platform, if you actually have 8GB RAM installed and you
want RabbitMQ to throttle producers when the server is using
above 3GB, set `vm_memory_high_watermark` to 3.

For guidelines on recommended RAM watermark settings,
see [Production Checklist](./production-checklist.html#resource-limits-ram).
