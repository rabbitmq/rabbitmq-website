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

# Net Tick Time (Inter-node Communication Heartbeats)

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers a mechanism used by RabbitMQ nodes and CLI tools (well, Erlang nodes)
to determine peer [un]availability, known as `"net ticks"` or
`kernel.net_ticktime`.

Each pair of nodes in a cluster are connected by the transport layer.
Periodic tick messages are exchanged between all pairs of nodes to
maintain the connections and to detect disconnections.
Network interruptions could otherwise go undetected for a fairly long
period of time (depending on the transport and OS kernel settings e.g. for TCP).
Fundamentally this is the same problem that [heartbeats](./heartbeats.html)
seek to address in messaging protocols, just between different peers:
RabbitMQ cluster nodes and CLI tools.

Nodes and connected CLI tools periodically send each other small data frames.
If no data was received from a peer in a given period of time,
that peer is considered to be unavailable ("down").

When one RabbitMQ node determines that another node has gone
down it will log a message giving the other node's name and
the reason, like:

<pre class="lang-ini">
2018-11-22 10:44:33.654 [info] node rabbit@peer-hostname down: net_tick_timeout
</pre>

In this case the `net_tick_timeout` event tells us that
the other node was detected as down due to the net ticktime
being exceeded. Another common reason is
`connection_closed`, meaning that the connection
was explicitly closed at the TCP level.

[Erlang documentation](http://erlang.org/doc/man/kernel_app.html) contains more
details on this subsystem.

## <a id="frequency" class="anchor" href="#frequency">Tick Frequency</a>

The frequency of both tick messages and detection of failures is controlled
by the `net_ticktime` configuration setting. Normally four ticks
are exchanged between a pair of nodes every `net_ticktime` seconds.
If no communication is received from a node within `net_ticktime`
(&#177; 25% for ) seconds then the node is considered down and no longer a member
of the cluster.

Increasing the `net_ticktime` across all nodes in a cluster will
make the cluster more resilient to short network outages, but it will take
longer for remaining nodes to detect crashed nodes. Conversely, reducing the
`net_ticktime` across all nodes in a cluster will reduce detection
latency, but increases the risk of detecting spurious
[partitions](partitions.html).

The impact of changing the default `net_ticktime` should be
carefully considered. All nodes in a cluster must use the same
`net_ticktime`. The following sample [advanced.config](./configure.html#advanced-config-file)
configuration demonstrates doubling the default `net_ticktime` from
60 to 120 seconds:

<pre class="lang-erlang">
[
  {kernel, [{net_ticktime,  120}]}
].
</pre>

## <a id="http-api" class="anchor" href="#http-api">Effects on HTTP API</a>

The HTTP API often needs to perform cluster-wide queries
which has the effect that the UI can appear unresponsive until a
partition is detected and handled. Lowering `net_ticktime`
can help to improve the responsiveness during such events but any
decision to change `net_ticktime` should be done carefully
as emphasised above.

## <a id="windows-quirks" class="anchor" href="#windows-quirks">Windows Quirks</a>

Due to how RabbitMQ starts as a Windows service, you can't use a configuration
file to set `net_ticktime`. Please see [this section](./windows-quirks.html#net-ticktime) in the [Windows Quirks](./windows-quirks.html)
document to set `net_ticktime` when running RabbitMQ as a Windows service.
