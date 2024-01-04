<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Runtime Tuning

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ runs on the [Erlang virtual machine](https://erlang.org) and runtime.
A [compatible version of Erlang](./which-erlang.html) must be installed in order to run RabbitMQ.

The Erlang runtime includes a number of components used by RabbitMQ. The most important ones
as far as this guide is concerned are

 * The Erlang virtual machine executes the code
 * `epmd` resolves node names on a host to an [inter-node communication port](networking.html)

This guide will focus on the virtual machine. For an overview of `epmd`, please refer to the
[Networking guide](./networking.html#epmd-inet-dist-port-range).

Topics covered include:

 * How to [configure Erlang VM settings for RabbitMQ](#vm-settings) nodes
 * [Runtime schedulers](#scheduling), what they are, how they relate to CPU cores, and so on
 * Runtime [thread activity metrics](#thread-stats): where is scheduler and CPU time spent
 * Runtime features that affect [CPU utilisation](#cpu)
 * How to [reduce CPU utilisation](#cpu-reduce-idle-usage) on moderately or lightly loaded nodes
 * [Memory allocator](#allocators) settings
 * [Open file handle limit](#open-file-handle-limit)
 * [Inter-node communication buffer](#distribution-buffer) size
 * [Erlang process limit](#erlang-process-limit)
 * [Erlang crash dumps](#crash-dumps)

## <a id="vm-settings" class="anchor" href="#vm-settings">VM Settings</a>

The Erlang VM has a broad range of [options that can be configured](https://erlang.org/doc/man/erl.html)
that cover process scheduler settings, memory allocation, garbage collection, I/O, and more.
Tuning of those flags can significantly change runtime behavior of a node.

### <a id="configure" class="anchor" href="#configure">Configuring Flags</a>

Most of the settings can be configured using [environment variables](./configure.html#supported-environment-variables).
A few settings have dedicated variables, others can only be changed using the following generic
variables that control what flags are passed by RabbitMQ startup scripts to the Erlang virtual machine.

The generic variables are

 * `RABBITMQ_SERVER_ERL_ARGS` allows all VM flags to be overridden, including the defaults set by RabbitMQ scripts
 * `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` allows a set of flags to be appended to the defaults set by RabbitMQ scripts
 * `RABBITMQ_CTL_ERL_ARGS` controls [CLI tool](./cli.html) VM flags

In most cases `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` is the recommended option. It can be used to override defaults
in a safe manner. For example, if an important flag is omitted from `RABBITMQ_SERVER_ERL_ARGS`, runtime performance
characteristics or system limits can be unintentionally affected.

As with other environment variables used by RabbitMQ, `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS`
and friends can be [set using a separate environment variable file](./configure.html#customise-environment).


## <a id="cpu" class="anchor" href="#cpu">CPU Utilisation</a>

CPU utilisation is a workload-specific topic. Generally speaking, when a workload involves more queues, connections
and channels than CPU cores, all cores will be used without any configuration necessary.

The runtime provides several features that control how the cores are used.

### <a id="scheduling" class="anchor" href="#scheduling">Runtime Schedulers</a>

Schedulers in the runtime assign work to kernel threads that perform it.
They execute code, perform I/O, execute timers and so on. Schedulers have a number of settings
that can affect overall system performance, CPU utilisation, latency and other runtime characteristics
of a node.

By default the runtime will start one scheduler for one CPU core it detects. Starting
with Erlang 23, this [takes CPU quotas into account](http://blog.erlang.org/OTP-23-Highlights/) in
containerized environments such as Docker and Kubernetes.

The number of schedulers can be explicitly set using the `+S` flag. The following example configures
the node to start 4 schedulers even if it detects more cores to be available to it:

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+S 4:4"
</pre>

Most of the time the default behaviour works well. In shared or CPU constrained environments (including
containerised ones), explicitly configuring scheduler count may be necessary.

### <a id="cpu-contention" class="anchor" href="#cpu-contention">CPU Resource Contention</a>

The runtime assumes that it does not share CPU resources with other tools or tenants. When that's the case,
the scheduling mechanism used can become very inefficient and result in significant (up to several orders of magnitude)
latency increase for certain operations.

This means that in most cases colocating RabbitMQ nodes with other tools or applying CPU time slicing
is highly discouraged and will result in suboptimal performance.

### <a id="busy-waiting" class="anchor" href="#busy-waiting">Scheduler Busy Waiting</a>

The runtime can put schedulers to sleep when they run out of work to execute. There's a certain cost
to bringing them back online, so with some workloads it may be beneficial to not do that.

This can be compared to a factory with multiple conveyor belts. When one belt runs out of items,
it can be stopped. However, once more work is there for it to do, restarting it will take time.
Alternatively the conveyor can be speculatively kept running for a period of time.

By default, RabbitMQ nodes configure runtime schedulers to speculatively wait for a short period
of time before going to sleep. Workloads where there can be prolonged periods of inactivity
can choose to turn off this speculative busy waiting using the [`+sbwt` and related runtime flags](https://erlang.org/doc/man/erl.html):

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+sbwt none +sbwtdcpu none +sbwtdio none"
</pre>

This can also reduce CPU usage on systems with limited or burstable CPU resources.

In order to determine how much time schedulers spend in busy wait, consult [thread activity metrics](#thread-stats).
Busy waiting will usually be accounted as system time in the output of tools such as `top` and `pidstat`.

### <a id="scheduler-bind-type" class="anchor" href="#scheduler-bind-type">Scheduler-to-CPU Core Binding</a>

The number of schedulers won't always match the number of CPU cores available and the number
of CPU cores does not necessarily correlate to the number of hardware threads (due to hyperthreading,
for example). As such the runtime has to decide how to bind scheduler binding to hardware threads,
CPU cores and NUMA nodes.

There are several binding strategies available. Desired strategy can be specified using the
`RABBITMQ_SCHEDULER_BIND_TYPE` environment variable or using the [`+stbt` runtime flag](http://erlang.org/doc/man/erl.html)
value.

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+stbt nnts"
</pre>

<pre class="lang-bash">
RABBITMQ_SCHEDULER_BIND_TYPE="nnts"
</pre>

Note that the strategy will only be effective if the runtime can detect CPU topology in the given environment.

Valid values are:

 * `db` (used by default, alias for `tnnps` in current Erlang release series)
 * `tnnps`
 * `nnts`
 * `nnps`
 * `ts`
 * `ps`
 * `s`
 * `ns`

See [VM flag documentation](http://erlang.org/doc/man/erl.html) for more detailed descriptions.

### <a id="cpu-reduce-idle-usage" class="anchor" href="#cpu-reduce-idle-usage">Reducing CPU Usage</a> for "Moderately Idle" Nodes and Clusters

CPU usage is by definition very workload-dependent metric. Some workloads naturally use more CPU resources.
Others use [disk-heavy features such as quorum queues](https://blog.rabbitmq.com/posts/2020/04/quorum-queues-and-why-disks-matter/),
and if disk I/O throughput is insufficient, CPU resources will be wasted while nodes are busy waiting for I/O operations to complete.

A couple of general recommendations can be applied to "moderately loaded" systems where a large percentage or
most connections and queues can go idle from time to time. Put differently, in this section we consider
any system that's not hovering around its peak capacity to be "moderately loaded".

Such system often can reduce their CPU footprint with a few straightforward steps.
These recommendations can significantly decrease CPU footprint with some workloads: consider
[this community case for example](https://groups.google.com/forum/#!msg/rabbitmq-users/6jGtaHINmNM/rc1rR1PqAwAJ).

#### Collect Runtime Thread Statistics

Collect [runtime thread activity stats](#thread-stats) data to understand how scheduler and CPU time
is spent. This is a critically important step for making informed decisions.

#### Turn off Speculative Scheduler Busy Waiting

Turn off speculative [scheduler busy waiting](#busy-waiting) using the [`+sbwt` and related runtime flags](https://erlang.org/doc/man/erl.html):

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+sbwt none +sbwtdcpu none +sbwtdio none"
</pre>

Speculative busy waiting usually not productive on moderately loaded systems.

#### Reduce Statistics Emission Frequency (Increase the Statistics Emission Interval)

Increase [statistics emission interval](./management.html#statistics-interval) from default 5 seconds to 15 or 30 seconds. This will reduce
periodic activity that all connections, channels and queues carry out, even if they would otherwise be
idle as far as client operations go. With most monitoring tools such [monitoring frequency](./monitoring.html#monitoring-frequency)
would be sufficient or even optimal.


## <a id="thread-stats" class="anchor" href="#thread-stats">Thread Statistics</a>: How is Scheduler and CPU Time Spent?

RabbitMQ CLI tools provide a number of [metrics](./monitoring.html) that make it easier to reason
about runtime thread activity.

<pre class="lang-bash">
rabbitmq-diagnostics runtime_thread_stats
</pre>

is the command that produces a breakdown of how various threads spend their time.

The command's output will produce a table with percentages by thread activity:

 * `emulator`: general code execution
 * `port`: external I/O activity (socket I/O, file I/O, subprocesses)
 * `gc`: performing garbage collection
 * `check_io`: checking for I/O events
 * `other`, `aux`: busy waiting, managing timers, all other tasks
 * `sleep`: sleeping (idle state)

Significant percentage of activity in the external I/O state may indicate that the node
and/or clients have maxed out network link capacity. This can be confirmed by [infrastructure metrics](./monitoring.html).

Significant percentage of activity in the sleeping state might indicate a lightly loaded node or suboptimal
runtime scheduler configuration for the available hardware and workload.


## <a id="allocators" class="anchor" href="#allocators">Memory Allocator Settings</a>

The runtime manages (allocates and releases) memory. Runtime memory management is a complex topic with
[many tunable parameters](http://erlang.org/doc/man/erts_alloc.html). This section
only covers the basics.

Memory is allocated in blocks from areas larger pre-allocated areas called carriers. Settings that control
carrier size, block size, memory allocation strategy and so on are commonly referred to as allocator settings.

Depending on the allocator settings used and the workload, RabbitMQ can experience [memory fragmentation](https://en.wikipedia.org/wiki/Fragmentation_(computing))
of various degrees. Finding the best fit for your workload is a matter of trial, measurement (metric collection)
and error. Note that some degree of fragmentation is inevitable.

Here are the allocator arguments used by default:

<pre class="lang-bash">
RABBITMQ_DEFAULT_ALLOC_ARGS="+MBas ageffcbf +MHas ageffcbf +MBlmbcs 512 +MHlmbcs 512 +MMmcs 30"
</pre>

Instead of overriding `RABBITMQ_DEFAULT_ALLOC_ARGS`, add flags that should be overridden to `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS`. They
will take precedence over the default ones. So a node started with the following `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` value

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+MHlmbcs 8192"
</pre>

will use in the following effective allocator settings:

<pre class="lang-bash">
"+MBas ageffcbf +MHas ageffcbf +MBlmbcs 512 +MHlmbcs 8192 +MMmcs 30"
</pre>

For some workloads a larger preallocated area reduce allocation rate and memory fragmentation.
To configure the node to use a preallocated area of 1 GB, add `+MMscs 1024` to VM startup arguments
using `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS`:

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+MMscs 1024"
</pre>

The value is in MB. The following example will preallocate a larger, 4 GB area:

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+MMscs 4096"
</pre>

To learn about other available settings, see [runtime documentation on allocators](http://erlang.org/doc/man/erts_alloc.html).


## <a id="open-file-handle-limit" class="anchor" href="#open-file-handle-limit">Open File Handle Limit</a>

Most operating systems limit the number of file handles that
can be opened at the same time. When an OS process (such as RabbitMQ's Erlang VM) reaches
the limit, it won't be able to open any new files or accept any more
TCP connections.

This limit is covered in detail in the [Networking guide](./networking.html#open-file-handle-limit).
Note that it cannot be configured using Erlang VM flags.

## <a id="distribution-buffer" class="anchor" href="#distribution-buffer">Inter-node Communication Buffer Size</a>

Inter-node traffic between a pair of nodes uses a TCP connection with a buffer known as the inter-node communication buffer.
Its size is 128 MB by default. This is a reasonable default for most workloads. In some environments
inter-node traffic can be very heavy and run into the buffer's capacity. Other workloads where the
default is not a good fit involve transferring very large (say, in hundreds of megabytes) messages
that do not fit into the buffer.

In this case the value can be increased using the `RABBITMQ_DISTRIBUTION_BUFFER_SIZE` environment variable
or the [`+zdbbl` VM flag](http://erlang.org/doc/man/erl.html).
The value is in kilobytes:

<pre class="lang-bash">
RABBITMQ_DISTRIBUTION_BUFFER_SIZE=192000
</pre>

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+zdbbl 192000"
</pre>

When the buffer is hovering around full capacity, nodes will [log](./logging.html) a warning
mentioning a busy distribution port (`busy_dist_port`):

<pre class="lang-ini">
2019-04-06 22:48:19.031 [warning] &lt;0.242.0&gt; rabbit_sysmon_handler busy_dist_port &lt;0.1401.0&gt;
</pre>

Increasing buffer size may help increase throughput and/or reduce latency.

## <a id="erlang-process-limit" class="anchor" href="#erlang-process-limit">Erlang Process Limit</a>

The runtime has a limit on the number of Erlang processes ("lightweight threads") that can exist on a node.
The default is about 1 million. In most environments this is sufficient with a wide safety margin.

Environments that have a particularly [high number of concurrent connections](./networking.html#tuning-for-large-number-of-connections) or a very large number
of queues (say, hundreds of thousands) this limit might need adjusting. This is done using the
`RABBITMQ_MAX_NUMBER_OF_PROCESSES` environment variable, which is a convenient way of
setting the `+P` Erlang VM flag:

<pre class="lang-bash">
RABBITMQ_MAX_NUMBER_OF_PROCESSES=2000000
</pre>

To set the flag directly, use the `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` environment
variable:

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+P 2000000"
</pre>

## <a id="crash-dumps" class="anchor" href="#crash-dumps">Erlang Crash Dumps</a>

When the runtime terminates abnormally, or is sent a `SIGUSER1` signal, it will produce a local file
known as the [crash dump](https://erlef.github.io/security-wg/secure_coding_and_deployment_hardening/crash_dumps).

The file contains certain runtime information at the time of termination. This file can be useful for debugging
of certain types of problems. It can also get really large on nodes with a large memory footprint.

To disable crash dump files, set the `ERL_CRASH_DUMP_BYTES` [environment variable](./configure.html#customise-environment) to 0.