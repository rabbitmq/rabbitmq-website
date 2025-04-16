---
title: Memory Threshold and Limit
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

# Memory Alarm Threshold

<!--
   To avoid terminology soup:
   - "memory threshold" always refers to the configured fraction
   - "memory limit" always refers to the computed absolute limit
-->

## Overview {#overview}

This guide covers RabbitMQ memory threshold (watermark) settings.
It is accompanied by a few closely related guides:

 * [Reasoning About Memory Usage](./memory-use)
 * [Monitoring](./monitoring)
 * [Resource Alarms](./alarms)

## Memory Threshold: What it is and How it Works {#threshold}

RabbitMQ nodes can be provided with a memory footprint limit hint. If the node's memory footprint
goes above the value, a [resource alarm](./alarms) will be triggered on this
and eventually all other cluster nodes to block publishers.

The limit can be configured as an absolute or relative value. In the latter case, RabbitMQ will try
to detect the total amount of RAM available to it on startup and when
<code>rabbitmqctl set_vm_memory_high_watermark <em>value</em></code> is
executed.

By default, including if the limit hint is not configured, a RabbitMQ node will use about 60%
of the available RAM, it raises a memory [alarm](./alarms) and will block all
connections that are publishing messages. Once the [memory alarm](./alarms) has cleared (e.g. due
to delivering some messages to clients that consume and [acknowledge the deliveries](./confirms)) normal
service resumes.

:::warning
The limit does not prevent RabbitMQ nodes
from using more than the computed limit, it is merely the point at which
publishers are throttled
:::

## Configuring the Memory Limit (or Threshold) {#configuring-threshold}

### Absolute Memory Limit {#absolute-limit}

:::tip
Using an absolute memory threshold is highly recommended in containerized environments
such as Kubernetes. RabbitMQ nodes won't always be able to detect the effective cgroups limit
:::

The memory threshold can be adjusted by setting
an absolute limit of RAM used by the node. The example below sets
the threshold to 1073741824 bytes (1024 MiB):

```ini
vm_memory_high_watermark.absolute = 1073741824
```

Same example, but using memory units:

```ini
vm_memory_high_watermark.absolute = 1024MiB
```

```ini
vm_memory_high_watermark.absolute = 4Gi
```

```ini
vm_memory_high_watermark.absolute = 1Ti
```
The supported decimal (power-of-ten) memory information units are:

 * `GB` for [gigabytes](https://en.wikipedia.org/wiki/Gigabyte) (1000^3 or 10^9 bytes)
 * `MB` for megabytes (1000^2)
 * `TB` for terabytes (1000^4)
 * `PB` for petabytes

The supported binary (power-of-two) memory information units are:

 * `Gi` for [gibibytes](https://en.wikipedia.org/wiki/Byte#Multiple-byte_units) (1024^3 or 2^30 bytes)
 * `Mi` for mebibytes (1024^2)
 * `Ti` for tebibytes (1024^4)
 * `Pi` for pebibytes

[Kubernetes-style information units](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory)
are also supported:

 * `Gi` for [gibibytes](https://en.wikipedia.org/wiki/Byte#Multiple-byte_units) (1024^3 or 2^30 bytes)
 * `Mi` for mebibytes
 * `Ti` for tebibytes
 * `Pi` for pebibytes

If the absolute limit is larger than the installed RAM or available virtual
address space, the threshold is set to whichever limit is smaller.

The memory limit is appended to the [log file](./logging) when the RabbitMQ node
starts:

```ini
2023-06-10 23:17:05.976 [info] <0.308.0> Memory high watermark set to 1024 MiB (1073741824 bytes) of 8192 MiB (8589934592 bytes) total
```

The memory limit may also be queried using the
`rabbitmq-diagnostics memory_breakdown` and `rabbitmq-diagnostics status` commands.

### Relative Memory Threshold {#relative-threshold}

:::warning
Using a relative memory threshold is not recommended in containerized environments
such as Kubernetes. Prefer the [absolute threshold](#absolute-limit) instead.
:::

The memory threshold at which the flow control is triggered
can be adjusted by editing the [configuration file](./configure#configuration-files).

The example below sets the threshold to the default value of 0.6:
```ini
# new style config format, recommended
vm_memory_high_watermark.relative = 0.6
```

The default value of 0.6 stands for 60% of available (detected) RAM.

### Updating Memory Threshold on a Running Node

The threshold can be changed while the broker is running
using the

```bash
rabbitmqctl set_vm_memory_high_watermark <fraction>
```

command or

```bash
rabbitmqctl set_vm_memory_high_watermark absolute <em><memory_limit></em>
```

For example:

```bash
rabbitmqctl set_vm_memory_high_watermark 0.7
```

and

```bash
rabbitmqctl set_vm_memory_high_watermark absolute "4G"
```

For the memory information units supported, see [Absolute Threshold](#absolute-limit)

Both commands will have an effect until the node stops. To make the setting survive node restart,
use the configuration setting instead.

The memory limit may change on systems with hot-swappable RAM when this command is executed without altering
the threshold, due to the fact that the total amount of system
RAM is queried.


## Running RabbitMQ in Containers and on Kubernetes {#containers}

:::tip
[RabbiMQ Cluster Operator for Kubernetes](https://www.rabbitmq.com/kubernetes/operator/operator-overview) automatically
configures the memory limit. Using the Operator is the recommended way to run RabbitMQ on Kubernetes.
:::

When a RabbitMQ node is running in a container, its ability to [detect the amount of available memory](./memory)
will depend on external factors: the version of the [runtime used](./runtime),
the OS version and settings used by the image, the version of cgroups used, and ultimately the version of Kubernetes.

This means that in containerized environments, the optimal option is to configure
an [absolute memory limit](./memory#absolute-limit).

Another Kubernetes-specific memory footprint aspect is how the OS-managed [kernel page cache](./memory-use#page-cache),
in particular in clusters where streams and super streams are used.


## How to Temporarily Stop All Publishing {#stop-publishing}

When the threshold or absolute limit is set to `0`, it makes the memory alarm go off
immediately and thus eventually blocks all publishing connections. This may be
useful if you wish to deactivate publishing globally:

```bash
rabbitmqctl set_vm_memory_high_watermark 0
```

## Limited Address Space {#address-space}

::: danger
RabbitMQ only targets 64 bit operating systems and a 64-bit [Erlang runtime](./which-erlang)
:::

RabbitMQ only targets 64 bit operating systems and a 64-bit [Erlang runtime](./which-erlang).

When running RabbitMQ inside a 32 bit Erlang VM in a 64 bit
OS (or a 32 bit OS with PAE), the addressable memory is
limited. The server will detect this and log a message like:

```
2018-11-22 10:44:33.654 [warning] Only 2048MB of 12037MB memory usable due to limited address space.
```

## Unrecognised Platforms {#unrecognised-platforms}

If the RabbitMQ server is unable to detect the operating system it is running on,
it will append a warning to the [log file](./logging). It then assumes than
1GB of RAM is installed:

```ini
2018-11-22 10:44:33.654 [warning] Unknown total memory size for your OS {unix,magic_homegrown_os}. Assuming memory size is 1024MB.
```

In this case, set `total_memory_available_override_value` to the amount of memory
actually available on your system. The `vm_memory_high_watermark.relative`
will then be calculated relative to the value set in `total_memory_available_override_value`.

For guidelines on recommended RAM watermark settings,
see [Deployment Guidelines](./production-checklist#resource-limits-ram).
