---
title: Free Disk Space Alarms
---
<!--
Copyright (c) 2007-2023 VMware, Inc. or its affiliates.

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

# Free Disk Space Alarms

## <a id="overview" class="anchor" href="#overview">Overview</a>

When free disk space drops below a configured limit (50 MB by default), an
alarm will be triggered and all producers will be blocked.

The goal is to avoid filling up the entire disk which will lead all
write operations on the node to fail and can lead to RabbitMQ termination.

## <a id="how-it-works" class="anchor" href="#how-it-works">How it Works</a>

To reduce the risk of filling up the disk, all incoming messages are
blocked. Transient messages, which aren't normally persisted, are still paged out
to disk when under memory pressure, and will use up the already limited
disk space.

If the disk alarm is set too low and messages are paged out rapidly, it
is possible to run out of disk space and crash RabbitMQ in between disk
space checks (at least 10 seconds apart). A more conservative approach
would be to set the limit to the same as the amount of memory installed
on the system (see the configuration [below](#configure)).

An alarm will be triggered if the amount of free disk space
drops below a configured limit.

The free space of the drive or partition that the broker database uses
will be monitored at least every 10 seconds to determine whether the disk
alarm should be raised or cleared.

Monitoring will begin on node start. It will leave a [log entry](./logging) like this:

```ini
2019-04-01 12:02:11.564 [info] &lt;0.329.0&gt; Enabling free disk space monitoring
2019-04-01 12:02:11.564 [info] &lt;0.329.0&gt; Disk free limit set to 950MB
```

Free disk space monitoring will be deactivated on unrecognised platforms, causing an
entry such as the one below:

```ini
2019-04-01 11:04:54.002 [info] &lt;0.329.0&gt; Disabling disk free space monitoring
```

When running RabbitMQ in a cluster, the disk alarm is cluster-wide; if
one node goes under the limit then all nodes will block incoming messages.

RabbitMQ periodically checks the amount of free disk
space. The frequency with which disk space is checked is related
to the amount of space at the last check. This is in order to ensure
that the disk alarm goes off in a timely manner when space is
exhausted. Normally disk space is checked every 10 seconds, but
as the limit is approached the frequency increases. When very
near the limit RabbitMQ will check as frequently as 10 times per
second. This may have some effect on system load.

When free disk space drops below the configured limit, RabbitMQ will
block producers and prevent memory-based messages
from being paged to disk. This will reduce the likelihood of a
crash due to disk space being exhausted, but will not eliminate
it entirely. In particular, if messages are being paged out
rapidly it is possible to run out of disk space and crash in the
time between two runs of the disk space monitor. A more
conservative approach would be to set the limit to the same as
the amount of memory installed on the system (see the configuration
section below).

## <a id="configure" class="anchor" href="#configure">Configuring Disk Free Space Limit</a>

The disk free space limit is configured with
the <code>disk_free_limit</code> setting. By default 50MB is
required to be free on the database partition (see the description of
[file locations](./relocate) for the default database location).
This configuration file sets the disk free space limit to 1GB:

```ini
disk_free_limit.absolute = 1000000000
```

Or you can use memory units (KB, MB GB etc.) like this:

```ini
disk_free_limit.absolute = 1GB
```

It is also possible to set a free space limit relative to the RAM in the machine.
This configuration file sets the disk free space limit to the same
as the amount of RAM on the machine:

```ini
disk_free_limit.relative = 1.0
```

The limit can be changed while the broker is running
using the `rabbitmqctl set_disk_free_limit` command
or `rabbitmqctl set_disk_free_limit mem_relative` command.
This command will take effect until next node restart.

The corresponding configuration setting should also be changed
when the effects should survive a node restart.
