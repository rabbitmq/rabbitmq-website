<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

# Memory and Disk Alarms

## <a id="overview" class="anchor" href="#overview">Overview</a>

There are two circumstances under which RabbitMQ will stop
reading from client network sockets, in order to avoid being killed by the
OS (out-of-memory killer). They are:

 * When [memory use](memory-use.html) goes above the configured limit.
 * When [free disk space](/disk-alarms.html) drops below the configured limit.

In both circumstances the server will temporarily <em>block</em>
connections - the server will pause reading from the sockets of
connected clients which publish messages. Connection
heartbeat monitoring will be disabled too. All network
connections will show in <code>rabbitmqctl</code> and the
management plugin as either <code>blocking</code>, meaning they
have not attempted to publish and can thus continue or
<code>blocked</code>, meaning they have published and are now
paused. Compatible clients will be [notified](#client-notifications)
when they are blocked.

Connections that only consume are not blocked by resource alarms; deliveries
to them continue as usual.


## <a id="client-notifications" class="anchor" href="#client-notifications">Client Notifications</a>

Modern client libraries support [connection.blocked notification](/connection-blocked.html)
(a protocol extension), so applications can monitor when they are blocked.


## <a id="effects-on-clusters" class="anchor" href="#effects-on-clusters">Alarms in Clusters</a>

When running RabbitMQ in a cluster, the memory and disk alarms
are cluster-wide; if one node goes over the limit then all nodes
will block connections.

The intent here is to stop producers but let consumers continue
unaffected. However, since the protocol permits producers and consumers
to operate on the same channel, and on different channels of a
single connection, this logic is necessarily imperfect. In
practice that does not pose any problems for most applications
since the throttling is observable merely as a
delay. Nevertheless, other design considerations permitting, it
is advisable to only use individual connections for either
producing or consuming.


## <a id="file-descriptors" class="anchor" href="#file-descriptors">Running Out of File Descriptors</a>

When the server is close to using all the file descriptors
that the OS has made available to it, it will refuse client
connections. See [Networking guide](/networking.html) to learn more.


## <a id="transient-flow-control" class="anchor" href="#transient-flow-control">Transient Flow Control</a>

When clients attempt to publish faster than the server can
accept their messages, they go into transient [flow control](/flow-control.html).


## <a id="related-topics" class="anchor" href="#related-topics">Relevant Topics</a>

 * [Reasoning about memory usage](/memory-use.html)
 * [Memory alarms](/memory.html)
 * [Free disk space alarms](/disk-alarms.html)
 * [How clients can determine if they are blocked](/connection-blocked.html)
