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

# Networking and RabbitMQ

## <a id="overview" class="anchor" href="#overview">Overview</a>

Clients communicate with RabbitMQ over the network. All
protocols supported by the broker are TCP-based. Both
RabbitMQ and the operating system provide a number
of knobs that can be tweaked. Some of them are directly
related to TCP and IP operations, others have to do with
application-level protocols such as TLS. This guide covers
multiple topics related to networking in the context of
RabbitMQ. This guide is not meant to be an extensive
reference but rather an overview. Some tuneable parameters
discussed are OS-specific. This guide focuses on Linux when
covering OS-specific subjects, as it is the most common
platform RabbitMQ is deployed on.

There are several areas which can be configured or tuned. Each has a section in this guide:

 * [Interfaces](#interfaces) the node listens on for client connections
 * IP version preferences: [dual stack](#dual-stack), [IPv6-only](#single-stack-ipv6) and [IPv4-only](#single-stack-ipv4)
 * [Ports](#ports) used by clients, [inter-node traffic](#epmd-inet-dist-port-range) in clusters and [CLI tools](./cli.html)
 * [IPv6 support](#distribution-ipv6) for inter-node traffic
 * [TLS](#tls-support) for client connections
 * Tuning for a [large number of concurrent connections](#tuning-for-large-number-of-connections)
 * [High connection churn](#dealing-with-high-connection-churn) scenarios and resource exhaustion
 * TCP buffer size (affects [throughput](#tuning-for-throughput-tcp-buffers) and [how much memory is used per connection](#tuning-for-large-number-of-connections-tcp-buffer-size))
 * [Hostname resolution](#dns)-related topics such as [reverse DNS lookups](#dns-reverse-dns-lookups)
 * The interface and port used by [epmd](#epmd)
 * How to [suspend and resume listeners](#listener-suspension) to temporarily stop and resume new client connections
 * Other TCP socket settings
 * [Proxy protocol](#proxy-protocol) support for client connections
 * Kernel TCP settings and limits (e.g. [TCP keepalives](#tcp-keepalives) and [open file handle limit](#open-file-handle-limit))
 * How to allow Erlang runtime to accept inbound connections
   when [MacOS Application Firewall](#firewalls-mac-os) is enabled

This guide also covers a few topics closely related to networking:

Except for OS kernel parameters and DNS, all RabbitMQ settings
are [configured via RabbitMQ configuration file(s)](configure.html).

Networking is a broad topic. There are many configuration options
that can have positive or negative effect on certain workloads.
As such, this guide does not try to be a complete reference but rather
offer an index of key tunable parameters and serve as a starting
point.

In addition, this guide touches on a few topics closely related to networking,
such as

 * Hostnames, [hostname resolution and DNS](#dns)
 * [connection lifecycle logging](#logging)
 * [Heartbeats](#heartbeats) (a.k.a. keepalives)
 * [proxies and load balancers](#intermediaries)

[VMware RabbitMQ](https://docs.vmware.com/en/VMware-Tanzu-RabbitMQ-for-Kubernetes/index.html) provides an [Intra-cluster Compression](https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/1/rmq/standby-replication.html) feature.

A methodology for [troubleshooting of networking-related issues](./troubleshooting-networking.html)
is covered in a separate guide.


## <a id="interfaces" class="anchor" href="#interfaces">Network Interfaces for Client Connections</a>

For RabbitMQ to accept client connections, it needs to bind to one or more
interfaces and listen on (protocol-specific) ports. One such interface/port pair is called a listener
in RabbitMQ parlance. Listeners are configured using the `listeners.tcp.*` configuration option(s).

TCP listeners configure both an interface and port. The following example
demonstrates how to configure AMQP 0-9-1 and AMQP 1.0 listener to use a specific IP and the standard port:

<pre class="lang-ini">
listeners.tcp.1 = 192.168.1.99:5672
</pre>

By default, RabbitMQ will listen on port 5672 on **all available interfaces**. It is possible to
limit client connections to a subset of the interfaces or even just one, for example, IPv6-only
interfaces. The following few sections demonstrate how to do it.

### <a id="dual-stack" class="anchor" href="#dual-stack">Listening on Dual Stack (Both IPv4 and IPv6) Interfaces</a>

The following example demonstrates how to configure RabbitMQ
to listen on localhost only for both IPv4 and IPv6:

<pre class="lang-ini">
listeners.tcp.1 = 127.0.0.1:5672
listeners.tcp.2 = ::1:5672
</pre>

With modern Linux kernels and Windows releases,
when a port is specified and RabbitMQ is configured to
listen on all IPv6 addresses but IPv4 is not deactivated
explicitly, IPv4 address will be included, so

<pre class="lang-ini">
listeners.tcp.1 = :::5672
</pre>

is equivalent to

<pre class="lang-ini">
listeners.tcp.1 = 0.0.0.0:5672
listeners.tcp.2 = :::5672
</pre>

### <a id="single-stack-ipv6" class="anchor" href="#single-stack-ipv6">Listening on IPv6 Interfaces Only</a>

In this example RabbitMQ will listen on an IPv6 interface only:

<pre class="lang-ini">
listeners.tcp.1 = fe80::2acf:e9ff:fe17:f97b:5672
</pre>

In IPv6-only environments the node must also be configured
to [use IPv6 for inter-node communication and CLI tool connections](#distribution-ipv6).

### <a id="single-stack-ipv4" class="anchor" href="#single-stack-ipv4">Listening on IPv4 Interfaces Only</a>

In this example RabbitMQ will listen on an IPv4 interface with specified IP address only:

<pre class="lang-ini">
listeners.tcp.1 = 192.168.1.99:5672 # Plain AMQP
listeners.ssl.1 = 192.168.1.99:5671 # TLS (AMQPS)
</pre>

It is possible to deactivate non-TLS connections by deactivating all regular TCP listeners.
Only [TLS-enabled](./ssl.html) clients will be able to connect:

<pre class="lang-ini">
# deactivates non-TLS listeners, only TLS-enabled (activated) clients will be able to connect
listeners.tcp = none

listeners.ssl.default = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert = false
</pre>


## <a id="ports" class="anchor" href="#ports">Port Access</a>

RabbitMQ nodes bind to ports (open server TCP sockets) in order to accept client and CLI tool connections.
Other processes and tools such as SELinux may prevent RabbitMQ from binding to a port. When that happens,
the node will fail to start.

CLI tools, client libraries and RabbitMQ nodes also open connections (client TCP sockets).
Firewalls can prevent nodes and CLI tools from communicating with each other.
Make sure the following ports are accessible:

 * 4369: [epmd](http://erlang.org/doc/man/epmd.html), a peer discovery service used by RabbitMQ nodes and CLI tools
 * 5672, 5671: used by AMQP 0-9-1 and AMQP 1.0 clients without and with TLS
 * 5552, 5551: used by the [RabbitMQ Stream protocol](streams.html) clients without and with TLS
 * 6000 through 6500: used for [stream](streams.html) replication
 * 25672: used for inter-node and CLI tools communication (Erlang distribution server port)
   and is allocated from a dynamic range (limited to a single port by default,
   computed as AMQP port + 20000). Unless external connections on these ports are really necessary (e.g.
   the cluster uses [federation](federation.html) or CLI tools are used on machines outside the subnet),
   these ports should not be publicly exposed. See [networking guide](networking.html) for details.
 * 35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
   and is allocated from a dynamic range (computed as server distribution port + 10000 through
   server distribution port + 10010). See [networking guide](networking.html) for details.
 * 15672, 15671: [HTTP API](./management.html) clients, [management UI](./management.html) and [rabbitmqadmin](./management-cli.html), without and with TLS
   (only if the [management plugin](./management.html) is enabled)
 * 61613, 61614: [STOMP clients](https://stomp.github.io/stomp-specification-1.2.html) without and with TLS (only if the [STOMP plugin](./stomp.html) is enabled)
 * 1883, 8883: [MQTT clients](http://mqtt.org/) without and with TLS, if the [MQTT plugin](./mqtt.html) is enabled
 * 15674: STOMP-over-WebSockets clients (only if the [Web STOMP plugin](./web-stomp.html) is enabled)
 * 15675: MQTT-over-WebSockets clients (only if the [Web MQTT plugin](./web-mqtt.html) is enabled)
 * 15692, 15691: Prometheus metrics, without and with TLS (only if the [Prometheus plugin](./prometheus.html) is enabled)

It is possible to [configure RabbitMQ](configure.html)
to use [different ports and specific network interfaces](networking.html).


## <a id="listener-suspension" class="anchor" href="#listener-suspension">How to Temporarily Stop New Client Connections</a>

Starting with RabbitMQ `3.8.8`, client connection listeners can be *suspended* to prevent new client
connections from being accepted. Existing connections will not be affected in any way.

This can be useful during node operations and is one of the steps performed
when a node is [put into maintenance mode](./upgrade.html#maintenance-mode).

To suspend all listeners on a node and prevent new client connections to it, use `rabbitmqctl suspend_listeners`:

<pre class="lang-bash">
rabbitmqctl suspend_listeners
</pre>

As all other CLI commands, this command can be invoked against an arbitrary node (including remote ones)
using the `-n` switch:

<pre class="lang-bash">
# suspends listeners on node rabbit@node2.cluster.rabbitmq.svc: it won't accept any new client connections
rabbitmqctl suspend_listeners -n rabbit@node2.cluster.rabbitmq.svc
</pre>

To resume all listeners on a node and make it accept new client connections again, use `rabbitmqctl resume_listeners`:

<pre class="lang-bash">
rabbitmqctl resume_listeners
</pre>

<pre class="lang-bash">
# resumes listeners on node rabbit@node2.cluster.rabbitmq.svc: it will accept new client connections again
rabbitmqctl resume_listeners -n rabbit@node2.cluster.rabbitmq.svc
</pre>

Both operations will leave [log entries](./logging.html) in the node's log.


## <a id="epmd" class="anchor" href="#epmd">EPMD and Inter-node Communication</a>

### What is EPMD and How is It Used?

[epmd](http://www.erlang.org/doc/man/epmd.html) (for Erlang Port Mapping Daemon)
is a small additional daemon that runs alongside every RabbitMQ node and is used by
the [runtime](./runtime.html) to discover what port a particular node listens on for
inter-node communication. The port is then used by peer nodes and [CLI tools](./cli.html).

When a node or CLI tool needs to contact node `rabbit@hostname2` it will do the following:

 * Resolve `hostname2` to an IPv4 or IPv6 address using the standard OS resolver or a custom one specified in the [inetrc file](http://erlang.org/doc/apps/erts/inet_cfg.html)
 * Contact `epmd` running on `hostname2` using the above address
 * Ask `epmd` for the port used by node `rabbit` on it
 * Connect to the node using the resolved IP address and the discovered port
 * Proceed with communication

### <a id="epmd-interface" class="anchor" href="#epmd-interface">EPMD Interface</a>

`epmd` will listen on all interfaces by default. It can
be limited to a number of interfaces using the `ERL_EPMD_ADDRESS`
environment variable:

<pre class="lang-bash">
# makes epmd listen on loopback IPv6 and IPv4 interfaces
export ERL_EPMD_ADDRESS="::1"
</pre>

When `ERL_EPMD_ADDRESS` is changed, both RabbitMQ node and `epmd` on the host must be stopped.
For `epmd`, use

<pre class="lang-bash">
# Stops local epmd process.
# Use after shutting down RabbitMQ.
epmd -kill
</pre>

to terminate it. The service will be started by the local RabbitMQ node automatically on boot.

The loopback interface will be implicitly added
to that list (in other words, `epmd` will always bind to the loopback interface).

### <a id="epmd-port" class="anchor" href="#epmd-port">EPMD Port</a>

The default epmd port is 4369, but this can be changed using the `ERL_EPMD_PORT` environment
variable:

<pre class="lang-bash">
# makes epmd bind to port 4369
export ERL_EPMD_PORT="4369"
</pre>

All hosts in a [cluster](./clustering.html) must use the same port.

When `ERL_EPMD_PORT` is changed, both RabbitMQ node and `epmd` on the host must be stopped.
For `epmd`, use

<pre class="lang-bash">
# Stops local epmd process.
# Use after shutting down RabbitMQ.
epmd -kill
</pre>

to terminate it. The service will be started by the local RabbitMQ node automatically on boot.

### <a id="epmd-inet-dist-port-range" class="anchor" href="#epmd-inet-dist-port-range">Inter-node Communication Port Range</a>

RabbitMQ nodes will use a port from a certain range known as the inter-node communication port range.
The same port is used by CLI tools when they need to contact the node.
The range can be modified.

RabbitMQ nodes communicate with CLI tools and other nodes using a port known as
the <em>distribution port</em>. It is dynamically allocated from a range of values.
For RabbitMQ, the default range is limited to a single value computed as
`RABBITMQ_NODE_PORT` (AMQP 0-9-1 and AMQP 1.0 port) + 20000, which results
in using port 25672. This single port can be [configured](configure.html)
using the `RABBITMQ_DIST_PORT` environment variable.

RabbitMQ [command line tools](./cli.html) also use a range of ports. The default range is computed by taking the RabbitMQ
distribution port value and adding 10000 to it. The next 10 ports are also part
of this range. Thus, by default, this range is 35672 through 35682. This range
can be configured using the <span class="envvar">RABBITMQ_CTL_DIST_PORT_MIN</span>
and <span class="envvar">RABBITMQ_CTL_DIST_PORT_MAX</span> environment variables.
Note that limiting the range to a single port will prevent more than one CLI
tool from running concurrently on the same host and may affect CLI commands
that require parallel connections to multiple cluster nodes. A port range of 10
is therefore a recommended value.

When configuring firewall rules it is highly recommended to allow remote connections
on the inter-node communication port from every cluster member and every host where
CLI tools might be used. epmd port must be open for CLI tools and clustering
to function.

On Windows, the following settings have no effect when RabbitMQ runs as a service.
Please see <a href="./windows-quirks.html">Windows Quirks</a> for details.

The range used by RabbitMQ can also be controlled via two configuration keys:

 * `kernel.inet_dist_listen_min` in the <b>classic</b> config format <em>only</em>
 * `kernel.inet_dist_listen_max` in the <b>classic</b> config format <em>only</em>

They define the range's lower and upper bounds, inclusive.

The example below uses a range with a single port but a value different from default:

<pre class="lang-erlang">
[
  {kernel, [
    {inet_dist_listen_min, 33672},
    {inet_dist_listen_max, 33672}
  ]},
  {rabbit, [
    ...
  ]}
].
</pre>

To verify what port is used by a node for inter-node and CLI tool communication,
run

<pre class="lang-bash">
epmd -names
</pre>

on that node's host. It will produce output that looks like this:

<pre class="lang-ini">
epmd: up and running on port 4369 with data:
name rabbit at port 25672
</pre>

### <a id="distribution-port-buffer-limit" class="anchor" href="#distribution-port-buffer-limit">Inter-node Communication Buffer Size Limit</a>

Inter-node connections use a buffer for data pending to be sent. Temporary
throttling on inter-node traffic is applied when the buffer is at max allowed
capacity. The limit is controlled via the `RABBITMQ_DISTRIBUTION_BUFFER_SIZE`
[environment variable](./configure.html#supported-environment-variables)
in kilobytes. Default value is 128 MB (`128000` kB).

In clusters with heavy inter-node traffic increasing this value may
have a positive effect on throughput. Values lower than 64 MB are not
recommended.


## <a id="distribution-ipv6" class="anchor" href="#distribution-ipv6">Using IPv6 for Inter-node Communication (and CLI Tools)</a>

In addition to [exclusive IPv6 use for client connections](#single-stack-ipv6) for client connections,
a node can also be configured to use IPv6 exclusively for inter-node and CLI tool connectivity.

This involves configuration in a few places:

 * Inter-node communication protocol setting in the [runtime](./runtime.html)
 * Configuring IPv6 to be used by CLI tools
 * [epmd](#epmd), a service involved in inter-node communication (discovery)

It is possible to use IPv6 for inter-node and CLI tool communication but use IPv4 for client
connections or vice versa. Such configurations can be hard to troubleshoot and reason about,
so using the same IP version (e.g. IPv6) across the board or a dual stack setup is recommended.

### Inter-node Communication Protocol

To instruct the runtime to use IPv6 for inter-node communication and related tasks, use
the `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` environment variable to pass a couple of flags:

<pre class="lang-bash">
# these flags will be used by RabbitMQ nodes
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-kernel inetrc '/etc/rabbitmq/erl_inetrc' -proto_dist inet6_tcp"
# these flags will be used by CLI tools
RABBITMQ_CTL_ERL_ARGS="-proto_dist inet6_tcp"
</pre>

`RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` above uses two closely related flags:

 * `-kernel inetrc` to configure a path to an [inetrc file](http://erlang.org/doc/apps/erts/inet_cfg.html)
   that controls hostname resolution
 * `-proto_dist inet6_tcp` to tell the node to use IPv6 when connecting to peer nodes and
   listening for CLI tool connections

The `erl_inetrc` file at `/etc/rabbitmq/erl_inetrc` will control hostname resolution settings.
For IPv6-only environments, it must include the following line:

<pre class="lang-bash">
%% Tells DNS client on RabbitMQ nodes and CLI tools to resolve hostnames to IPv6 addresses.
%% The trailing dot is not optional.
{inet6,true}.
</pre>

### CLI Tools

With CLI tools, use the same runtime flag as used for RabbitMQ nodes above but provide it
using a different environment variable, `RABBITMQ_CTL_ERL_ARGS`:

<pre class="lang-bash">
RABBITMQ_CTL_ERL_ARGS="-proto_dist inet6_tcp"
</pre>

Note that once instructed to use IPv6, CLI tools won't be able to connect to nodes that
do not use IPv6 for inter-node communication. This involves the `epmd` service running on the same
host as target RabbitMQ node.

### epmd

`epmd` is a small helper daemon that runs next to a RabbitMQ node and lets its peers and CLI
tools discover what port they should use to communicate to it. It can be configured to bind
to a specific interface, much like RabbitMQ listeners. This is done using the `ERL_EPMD_ADDRESS`
environment variable:

export ERL_EPMD_ADDRESS="::1"

By default RabbitMQ nodes will use an IPv4 interface when connecting to `epmd`.
Nodes that are configured to use IPv6 for inter-node communication ([see above](#distribution-ipv6))
will also use IPv6 to connect to `epmd`.

When `epmd` is configured to use IPv6 exclusively but RabbitMQ nodes are not,
RabbitMQ will log an error message similar to this:

<pre class="lang-bash">
Protocol 'inet_tcp': register/listen error: econnrefused
</pre>

#### systemd Unit File

On distributions that use systemd, the `epmd.socket` service controls network settings of `epmd`.
It is possible to configure `epmd` to only listen on IPv6 interfaces:

<pre class="lang-ini">
ListenStream=[::1]:4369
</pre>

The service will need reloading after its unit file has been updated:

<pre class="lang-bash">
systemctl daemon-reload
systemctl restart epmd.socket epmd.service
</pre>

## <a id="intermediaries" class="anchor" href="#intermediaries">Intermediaries: Proxies and Load Balancers</a>

Proxies and load balancers are fairly commonly used to distribute client connections
between [cluster nodes](./clustering.html). Proxies can also be useful
to make it possible for clients to access RabbitMQ nodes without exposing them publicly.
Intermediaries can also have side effects on connections.

### <a id="proxy-effects" class="anchor" href="#proxy-effects">Proxy Effects</a>

Proxies and load balancers introduce an extra network hop (or even multiple ones)
between client and its target node. Intermediaries also can become a network
contention point: their throughput will then become a limiting factor for the entire system.
Network bandwidth overprovisioning and throughput monitoring for proxies and load balancers
are therefore very important.

Intermediaries also may terminate "idle" TCP connections
when there's no activity on them for a certain period of
time. Most of the time it is not desirable. Such events will result in
[abrupt connection closure log messages](./logging.html#connection-lifecycle-events)
on the server end and I/O exceptions on the client end.

When [heartbeats](./heartbeats.html) are enabled on a connection, it results in
periodic light network traffic. Therefore heartbeats have a side effect
of guarding client connections that can go idle for periods of
time against premature closure by proxies and load balancers.

Heartbeat timeouts from 10 to 30 seconds will produce periodic
network traffic often enough (roughly every 5 to 15 seconds)
to satisfy defaults of most proxy tools and load balancers.
Values that are too low will produce false positives.

### <a id="proxy-protocol" class="anchor" href="#proxy-protocol">Proxy Protocol</a>

RabbitMQ supports [Proxy protocol](http://www.haproxy.org/download/1.8/doc/proxy-protocol.txt)
versions 1 (text header format) and 2 (binary header format).

The protocol makes servers such as RabbitMQ aware of the actual client IP address
when connections go over a proxy (e.g. [HAproxy](http://cbonte.github.io/haproxy-dconv/1.8/configuration.html#send-proxy) or [AWS ELB](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-target-groups.html#proxy-protocol)).
This makes it easier for the operator to inspect connection origins in the management UI
or CLI tools.

The protocol spec dictates that either it must be applied to all connections or none of them for
security reasons, this feature is turned off by default and needs to be turned on
for individual protocols supported by RabbitMQ. To turn it on for AMQP 0-9-1 and AMQP 1.0 clients:

<pre class="lang-ini">
proxy_protocol = true
</pre>

When proxy protocol is turned on, clients won't be able to connect to RabbitMQ directly unless
they themselves support the protocol.
Therefore, when this option is turned on, all client connections must go through
a proxy that also supports the protocol and is configured to send a Proxy protocol header. [HAproxy](http://www.haproxy.org/download/1.8/doc/proxy-protocol.txt)
and [AWS ELB](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-target-groups.html#proxy-protocol) documentation
explains how to do it.

When proxy protocol is turned on and connections go through a compatible proxy, no action
or modifications are required from client libraries. The communication is entirely
transparent to them.

[STOMP](stomp.html#proxy-protocol) and [MQTT](mqtt.html#proxy-protocol),
as well as [Web STOMP](web-stomp.html#proxy-protocol) and
[Web MQTT](web-mqtt.html#proxy-protocol)
have their own settings that enable support for the proxy protocol.


## <a id="tls-support" class="anchor" href="#tls-support">TLS (SSL) Support</a>

It is possible to encrypt connections using TLS with RabbitMQ. Authentication
using peer certificates is also possible. Please refer to the [TLS/SSL guide](./ssl.html)
for more information.


## <a id="tuning-for-throughput" class="anchor" href="#tuning-for-throughput">Tuning for Throughput</a>

### <a id="tuning-for-throughput-intro" class="anchor" href="#tuning-for-throughput-intro"></a>

Tuning for throughput is a common goal. Improvements can be achieved by

* Increasing TCP buffer sizes
* Ensuring Nagle's algorithm is turned off
* Turning on optional TCP features and extensions

For the latter two, see the OS-level tuning section below.

Note that tuning for throughput will involve trade-offs. For example, increasing TCP buffer
sizes will increase the amount of RAM used by every connection, which can be a significant
total server RAM use increase.

### <a id="tuning-for-throughput-tcp-buffers" class="anchor" href="#tuning-for-throughput-tcp-buffers">TCP Buffer Size</a>

This is one of the key tunable parameters. Every TCP connection has buffers
allocated for it. Generally speaking, the larger these buffers are, the more RAM
is used per connection and better the throughput. On Linux, the OS will automatically
tune TCP buffer size by default, typically settling on a value between 80 and 120 KB.

For maximum throughput, it is possible to increase buffer size using a group of config options:

 * `tcp_listen_options` for AMQP 0-9-1 and AMQP 1.0
 * `mqtt.tcp_listen_options` for MQTT
 * `stomp.tcp_listen_options` for STOMP

Note that increasing TCP buffer size will increase how much [RAM the node uses](./memory-use.html)
for every client connection.

The following example sets TCP buffers for AMQP 0-9-1 connections to 192 KiB:

<pre class="lang-ini">
tcp_listen_options.backlog = 128
tcp_listen_options.nodelay = true
tcp_listen_options.linger.on      = true
tcp_listen_options.linger.timeout = 0
tcp_listen_options.sndbuf = 196608
tcp_listen_options.recbuf = 196608
</pre>

The same example for MQTT:

<pre class="lang-ini">
mqtt.tcp_listen_options.backlog = 128
mqtt.tcp_listen_options.nodelay = true
mqtt.tcp_listen_options.linger.on      = true
mqtt.tcp_listen_options.linger.timeout = 0
mqtt.tcp_listen_options.sndbuf = 196608
mqtt.tcp_listen_options.recbuf = 196608
</pre>

and STOMP:

<pre class="lang-ini">
stomp.tcp_listen_options.backlog = 128
stomp.tcp_listen_options.nodelay = true
stomp.tcp_listen_options.linger.on      = true
stomp.tcp_listen_options.linger.timeout = 0
stomp.tcp_listen_options.sndbuf = 196608
stomp.tcp_listen_options.recbuf = 196608
</pre>

Note that setting send and receive buffer sizes to different values
can be dangerous and **not recommended**.

## <a id="tuning-for-large-number-of-connections" class="anchor" href="#tuning-for-large-number-of-connections">Tuning for a Large Number of Connections</a>

### <a id="tuning-for-large-number-of-connections-intro" class="anchor" href="#tuning-for-large-number-of-connections-intro"></a>

Some workloads, often referred to as "the Internet of
Things", assume a large number of client connections per
node, and a relatively low volume of traffic from each node.
One such workload is sensor networks: there can be hundreds
of thousands or millions of sensors deployed, each emitting
data every several minutes. Optimising for the maximum
number of concurrent clients can be more important than for
total throughput.


### <a id="tuning-for-large-number-of-connections-limitations" class="anchor" href="#tuning-for-large-number-of-connections-limitations"></a>

Several factors can limit how many concurrent connections a single node can support:

 * Maximum number of [open file handles](#open-file-handle-limit) (including sockets) as well as other kernel-enforced resource limits
 * Amount of [RAM used by each connection](./memory-use.html)
 * Amount of CPU resources used by each connection
 * Maximum number of Erlang processes the VM is configured to allow.

### <a id="open-file-handle-limit" class="anchor" href="#open-file-handle-limit">Open File Handle Limit</a>

Most operating systems limit the number of file handles that
can be opened at the same time. When an OS process (such as RabbitMQ's Erlang VM) reaches
the limit, it won't be able to open any new files or accept any more
TCP connections. The limit will also affect how much memory the [Erlang runtime](./runtime.html)
will allocate upfront. This means that the limit on some modern distributions
[can be too high](https://blog.rabbitmq.com/posts/2022/08/high-initial-memory-consumption-of-rabbitmq-nodes-on-centos-stream-9/) and need
lowering.

How the limit is configured [varies from OS to OS](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md) and distribution to distribution, e.g. depending on whether systemd is used.
For Linux, Controlling System Limits on Linux
in our [Debian](./install-debian.html#kernel-resource-limits) and [RPM](./install-rpm.html#kernel-resource-limits)
installation guides provides. Linux kernel limit management is covered by many resources on the Web,
including the [open file handle limit](https://ro-che.info/articles/2017-03-26-increase-open-files-limit).

With Docker, [Docker daemon configuration file](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file)
in the host controls the limits.

MacOS uses a [similar system](https://superuser.com/questions/433746/is-there-a-fix-for-the-too-many-open-files-in-system-error-on-os-x-10-7-1).

On Windows, the limit for the Erlang runtime is controlled using the `ERL_MAX_PORTS` environment variable.

When optimising for the number of concurrent connections,
make sure your system has enough file descriptors to
support not only client connections but also files the node
may use. To calculate a ballpark limit, multiply the number
of connections per node by 1.5. For example, to support 100,000
connections, set the limit to 150,000.

Increasing the limit slightly increases the amount of
RAM idle machine uses but this is a reasonable trade-off.

### <a id="tuning-for-large-number-of-connections-tcp-buffer-size" class="anchor" href="#tuning-for-large-number-of-connections-tcp-buffer-size">Per Connection Memory Consumption: TCP Buffer Size</a>

See the section above for an overview.

For maximum number of concurrent client connections, it is possible to decrease TCP buffer size
using a group of config options:

 * `tcp_listen_options` for AMQP 0-9-1 and AMQP 1.0
 * `mqtt.tcp_listen_options` for MQTT
 * `stomp.tcp_listen_options` for STOMP

Decreasing TCP buffer size will decrease how much [RAM the node uses](./memory-use.html)
for every client connection.

This is often necessary in environments where the number of concurrent connections
sustained per node is more important than throughput.

The following example sets TCP buffers for AMQP 0-9-1 connections to 32 KiB:

<pre class="lang-ini">
tcp_listen_options.backlog = 128
tcp_listen_options.nodelay = true
tcp_listen_options.linger.on      = true
tcp_listen_options.linger.timeout = 0
tcp_listen_options.sndbuf  = 32768
tcp_listen_options.recbuf  = 32768
</pre>

The same example for MQTT:

<pre class="lang-ini">
mqtt.tcp_listen_options.backlog = 128
mqtt.tcp_listen_options.nodelay = true
mqtt.tcp_listen_options.linger.on      = true
mqtt.tcp_listen_options.linger.timeout = 0
mqtt.tcp_listen_options.sndbuf  = 32768
mqtt.tcp_listen_options.recbuf  = 32768
</pre>

and for STOMP:

<pre class="lang-ini">
stomp.tcp_listen_options.backlog = 128
stomp.tcp_listen_options.nodelay = true
stomp.tcp_listen_options.linger.on      = true
stomp.tcp_listen_options.linger.timeout = 0
stomp.tcp_listen_options.sndbuf  = 32768
stomp.tcp_listen_options.recbuf  = 32768
</pre>

Note that lowering TCP buffer sizes will result in a proportional throughput drop,
so an optimal value between throughput and per-connection RAM use needs to be
found for every workload.

Setting send and receive buffer sizes to different values is dangerous
and is not recommended. Values lower than 8 KiB are not recommended.

### <a id="tuning-for-large-number-of-connections-cpu-footprint" class="anchor" href="#tuning-for-large-number-of-connections-cpu-footprint">Reducing CPU Footprint of Stats Emission</a>

A large number of concurrent connections will generate a lot of metric (stats) emission events.
This increases CPU consumption even with mostly idle connections. To reduce this footprint,
increase the statistics collection interval using the `collect_statistics_interval` key:

<pre class="lang-ini">
# sets the interval to 60 seconds
collect_statistics_interval = 60000
</pre>

The default is 5 seconds (5000 milliseconds).

Increasing the interval value to 30-60s will reduce CPU footprint and peak memory consumption.
This comes with a downside: with the value in the example above, metrics of said entities
will refresh every 60 seconds.

This can be perfectly reasonable in an [externally monitored](./monitoring.html#monitoring-frequency) production system
but will make management UI less convenient to use for operators.

### <a id="tuning-for-large-number-of-connections-channel-max" class="anchor" href="#tuning-for-large-number-of-connections-channel-max">Limiting Number of Channels on a Connection</a>

Channels also consume RAM. By optimising how many channels applications use, that amount
can be decreased. It is possible to cap the max number of channels on a connection using
the `channel_max` configuration setting:

<pre class="lang-ini">
channel_max = 16
</pre>

Note that some libraries and tools that build on top of RabbitMQ clients may implicitly require
a certain number of channels. Values above 200 are rarely necessary.
Finding an optimal value is usually a matter of trial and error.

### <a id="tuning-for-large-number-of-connections-nodelay" class="anchor" href="#tuning-for-large-number-of-connections-nodelay">Nagle's Algorithm ("nodelay")</a>

Turning off <a
href="http://en.wikipedia.org/wiki/Nagle's_algorithm">Nagle's
algorithm</a> is primarily useful for reducing latency but
can also improve throughput.

`kernel.inet_default_connect_options` and `kernel.inet_default_listen_options` must
include `{nodelay, true}` to turn off Nagle's algorithm for inter-node connections.

When configuring sockets that serve client connections,
`tcp_listen_options` must include the same option. This is the default.

The following example demonstrates that. First, `rabbitmq.conf`:

<pre class="lang-ini">
tcp_listen_options.backlog = 4096
tcp_listen_options.nodelay = true
</pre>

which should be used together with the following bits in the [advanced config file](./configure.html#advanced-config-file):

<pre class="lang-erlang">
[
  {kernel, [
    {inet_default_connect_options, [{nodelay, true}]},
    {inet_default_listen_options,  [{nodelay, true}]}
  ]}].
</pre>

When using the [classic config format](./configure.html#erlang-term-config-file),
everything is configured in a single file:

<pre class="lang-erlang">
[
  {kernel, [
    {inet_default_connect_options, [{nodelay, true}]},
    {inet_default_listen_options,  [{nodelay, true}]}
  ]},
  {rabbit, [
    {tcp_listen_options, [
                          {backlog,       4096},
                          {nodelay,       true},
                          {linger,        {true,0}},
                          {exit_on_close, false}
                         ]}
  ]}
].
</pre>

### <a id="tuning-for-large-number-of-connections-async-thread-pool" class="anchor" href="#tuning-for-large-number-of-connections-async-thread-pool">Erlang VM I/O Thread Pool Tuning</a>

Adequate Erlang VM I/O thread pool size is also important when tuning for a large number of
concurrent connections. See the section above.

### <a id="tuning-for-large-number-of-connections-connection-backlog" class="anchor" href="#tuning-for-large-number-of-connections-connection-backlog">Connection Backlog</a>

With a low number of clients, new connection rate is very unevenly distributed
but is also small enough to not make much difference. When the number reaches tens of thousands
or more, it is important to make sure that the server can accept inbound connections.
Unaccepted TCP connections are put into a queue with bounded length. This length has to be
sufficient to account for peak load hours and possible spikes, for instance, when many clients
disconnect due to a network interruption or choose to reconnect.
This is configured using the `tcp_listen_options.backlog`
option:

<pre class="lang-ini">
tcp_listen_options.backlog = 4096
tcp_listen_options.nodelay = true
</pre>

In the [classic config format](./configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
  {rabbit, [
    {tcp_listen_options, [
                          {backlog,       4096},
                          {nodelay,       true},
                          {linger,        {true, 0}},
                          {exit_on_close, false}
                         ]}
  ]}
].
</pre>

Default value is 128. When pending connection queue length grows beyond this value,
connections will be rejected by the operating system. See also `net.core.somaxconn`
in the kernel tuning section.


## <a id="dealing-with-high-connection-churn" class="anchor" href="#dealing-with-high-connection-churn">Dealing with High Connection Churn</a>

### <a id="dealing-with-high-connection-churn-overview" class="anchor" href="#dealing-with-high-connection-churn-overview">Why is High Connection Churn Problematic?</a>

Workloads with high connection churn (a high rate of connections being opened and closed) will require
TCP setting tuning to avoid exhaustion of certain resources: max number of file handles,
Erlang processes on RabbitMQ nodes, kernel's ephemeral port range (for hosts that *open* a lot
of connections, including [Federation](federation.html) links and [Shovel](shovel.html) connections), and others.
Nodes that are exhausted of those resources <strong>won't be able to accept new connections</strong>,
which will negatively affect overall system availability.

Due to a combination of certain TCP features
and defaults of most modern Linux distributions, closed connections can be detected after
a prolonged period of time. This is covered in the [heartbeats guide](./heartbeats.html).
This can be one contributing factor to connection build-up. Another is the `TIME_WAIT` TCP
connection state. The state primarily exists to make sure that retransmitted segments from closed
connections won't "reappear" on a different (newer) connection with the same client host and port.
Depending on the OS and TCP stack configuration connections can spend minutes in this state,
which on a busy system is guaranteed to lead to a connection build-up.

See [Coping with the TCP TIME_WAIT connections on busy servers](http://vincent.bernat.im/en/blog/2014-tcp-time-wait-state-linux.html) for details.

TCP stack configuration can reduce peak number of connection in closing states and
avoid resource exhaustion, in turn allowing nodes to accept new connections at all times.

High connection churn can also mean developer mistakes or incorrect assumptions about how
the messaging protocols supported by RabbitMQ are meant to be used. All supported protocols
assume long lived connections. Applications that open and almost immediately close connections
unnecessarily waste resources (network bandwidth, CPU, RAM) and contribute to the problem
described in this section.

### <a id="dealing-with-high-connection-churn-troubleshooting" class="anchor" href="#dealing-with-high-connection-churn-troubleshooting">Inspecting Connections and Gathering Evidence</a>

If a node fails to accept connections it is important to first gather data (metrics, evidence) to
determine the state of the system and the limiting factor (exhausted resource).
Tools such as [netstat](https://en.wikipedia.org/wiki/Netstat),
[ss](https://linux.die.net/man/8/ss), [lsof](https://en.wikipedia.org/wiki/Lsof) can be used
to inspect TCP connections of a node. See [Troubleshooting Networking](./troubleshooting-networking.html) for examples.

### <a id="dealing-with-high-connection-churn-tcp-keepalives" class="anchor" href="#dealing-with-high-connection-churn-tcp-keepalives">The Role of TCP Keepalives</a>

While [heartbeats](./heartbeats.html) are sufficient for detecting defunct connections,
they are not going to be sufficient in high connection churn scenarios. In those cases
heartbeats should be combined with [TCP keepalives](#tcp-keepalives) to speed
up disconnected client detection.

### <a id="dealing-with-high-connection-churn-time-wait" class="anchor" href="#dealing-with-high-connection-churn-time-wait">Reducing Amount of Time Spent in TIME_WAIT</a>

TCP stack tuning can also reduce the amount of time connections spend in the `TIME_WAIT` state.
The `net.ipv4.tcp_fin_timeout` setting specifically can help here:

<pre class="lang-ini">
net.ipv4.tcp_fin_timeout = 30
</pre>

Note that like other settings prefixed with `net.ipv4.`, this one applies to both IPv4 and IPv6
connections despite the name.

If inbound connections (from clients, plugins, CLI tools and so on) do not rely on NAT,
`net.ipv4.tcp_tw_reuse` can be set to `1` (enabled) to allow the kernel
to reuse sockets in the `TIME_WAIT` state for outgoing connections. This setting can
be applied on client hosts or intermediaries such as proxies and load balancers. Note that
if NAT is used the setting is not safe and can lead to hard to track down issues.


The settings above generally should be combined with reduced [TCP keepalive](#tcp-keepalives)
values, for example:


<pre class="lang-ini">
net.ipv4.tcp_fin_timeout = 30

net.ipv4.tcp_keepalive_time=30
net.ipv4.tcp_keepalive_intvl=10
net.ipv4.tcp_keepalive_probes=4

net.ipv4.tcp_tw_reuse = 1
</pre>


## <a id="os-tuning" class="anchor" href="#os-tuning">OS Level Tuning</a>

### <a id="os-tuning-intro" class="anchor" href="#os-tuning-intro"></a>

Operating system settings can affect operation of RabbitMQ.
Some are directly related to networking (e.g. TCP settings), others
affect TCP sockets as well as other things (e.g. open file handles limit).

Understanding these limits is important, as they may change depending on
the workload.


### <a id="os-tuning-important-options" class="anchor" href="#os-tuning-important-options"></a>

A few important configurable kernel options include (note that despite option names they
are effective for both IPv4 and IPv6 connections):

<table>
  <thead>
    <tr>
      <th>Kernel setting</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td><code>fs.file-max</code></td>
      <td>
        Max number of files the kernel will allocate. Limits and current value
        can be inspected using <code>/proc/sys/fs/file-nr</code>.
      </td>
    </tr>
    <tr>
      <td><code>net.ipv4.ip_local_port_range</code></td>
      <td>
        Local IP port range, define as a pair of values. The range must provide enough
        entries for the peak number of concurrent connections.
      </td>
    </tr>
    <tr>
      <td><code>net.ipv4.tcp_tw_reuse</code></td>
      <td>
        When enabled, allows the kernel to reuse sockets in <code>TIME_WAIT</code>
        state when it's safe to do so. See <a href="#dealing-with-high-connection-churn">Dealing with High Connection Churn</a>.
        This option is dangerous when clients and peers connect using NAT.
      </td>
    </tr>
    <tr>
      <td><code>net.ipv4.tcp_fin_timeout</code></td>
      <td>
        Lowering this timeout to a value in the 15-30 second range reduces the amount of time closed connections
        will stay in the TIME_WAIT state. See <a href="#dealing-with-high-connection-churn">Dealing with High Connection Churn</a>.
      </td>
    </tr>
    <tr>
      <td><code>net.core.somaxconn</code></td>
      <td>
        Size of the listen queue (how many connections are in
        the process of being established at the same time).
        Default is 128. Increase to 4096 or higher to support
        inbound connection bursts, e.g. when clients reconnect
        en masse.
      </td>
    </tr>
    <tr>
      <td><code>net.ipv4.tcp_max_syn_backlog</code></td>
      <td>
        Maximum number of remembered connection requests which
        did not receive an acknowledgment yet from
        connecting client. Default is 128, max value is 65535. 4096 and 8192 are
        recommended starting values when optimising for throughput.
      </td>
    </tr>
    <tr>
      <td><code>net.ipv4.tcp_keepalive_*</code></td>
      <td>
        <code>net.ipv4.tcp_keepalive_time</code>, <code>net.ipv4.tcp_keepalive_intvl</code>,
        and <code>net.ipv4.tcp_keepalive_probes</code> configure TCP keepalive.

        AMQP 0-9-1 and STOMP have <a href="./heartbeats.html">Heartbeats</a> which partially
        undo its effect, namely that it can take minutes to detect an unresponsive peer,
        for example, in case of a hardware or power failure. MQTT also has its own keepalives
        mechanism which is the same idea under a different name.

        When enabling TCP keepalive with default settings, we
        recommend setting heartbeat timeout to 8-20 seconds. Also see a note on TCP keepalives
        later in this guide.
      </td>
    </tr>
    <tr>
      <td><code>net.ipv4.conf.default.rp_filter</code></td>
      <td>
        Activating or turning on reverse path filtering. If <a href="http://en.wikipedia.org/wiki/IP_address_spoofing">IP address spoofing</a>
        is not a concern for your system, deactivate it.
      </td>
    </tr>
  </tbody>
</table>

Note that default values for these vary between Linux kernel releases and distributions.
Using a recent kernel (3.9 or later) is recommended.


### <a id="os-tuning-important-how-to-configure" class="anchor" href="#os-tuning-important-how-to-configure"></a>

Kernel parameter tuning differs from OS to OS. This guide focuses on Linux.
To configure a kernel parameter interactively, use `sysctl -w` (requires superuser
privileges), for example:

<pre class="lang-bash">
sysctl -w fs.file-max 200000
</pre>

To make the changes permanent (stick between reboots), they need to be added to
`/etc/sysctl.conf`. See [sysctl(8)](http://man7.org/linux/man-pages/man8/sysctl.8.html)
and [sysctl.conf(5)](http://man7.org/linux/man-pages/man5/sysctl.conf.5.html)
for more details.

### <a id="os-tuning-outro" class="anchor" href="#os-tuning-outro"></a>

TCP stack tuning is a broad topic that is covered in much detail elsewhere:

 * [Enabling High Performance Data Transfers](https://psc.edu/index.php/services/networking/68-research/networking/641-tcp-tune)
 * [Network Tuning Guide](https://fasterdata.es.net/network-tuning/)


## <a id="socket-gen-tcp-options" class="anchor" href="#socket-gen-tcp-options">TCP Socket Options</a>

### <a id="socket-gen-tcp-options-common" class="anchor" href="#socket-gen-tcp-options-common">Common Options</a>

<table>
  <thead>
    <tr>
      <th>Kernel setting</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td><code>tcp_listen_options.nodelay</code></td>
      <td>
        When set to <code>true</code>, deactivates
        <a href="http://en.wikipedia.org/wiki/Nagle's_algorithm">Nagle's algorithm</a>.
        Default is true. Highly recommended for most users.
      </td>
    </tr>
    <tr>
      <td><code>tcp_listen_options.sndbuf</code></td>
      <td>
        See TCP buffers discussion earlier in this guide. Default value is
        automatically tuned by the OS, typically in the 88 KiB to 128 KiB range on
        modern Linux versions. Increasing buffer size improves consumer throughput
        and RAM use for every connection. Decreasing has the opposite effect.
      </td>
    </tr>
    <tr>
      <td><code>tcp_listen_options.recbuf</code></td>
      <td>
        See TCP buffers discussion earlier in this guide. Default value effects
        are similar to that of <code>tcp_listen_options.sndbuf</code> but
        for publishers and protocol operations in general.
      </td>
    </tr>
    <tr>
      <td><code>tcp_listen_options.backlog</code></td>
      <td>
        Maximum size of the unaccepted TCP connections queue. When this size
        is reached, new connections will be rejected. Set to 4096 or higher for
        environments with thousands of concurrent connections and possible bulk client
        reconnections.
      </td>
    </tr>
    <tr>
      <td><code>tcp_listen_options.keepalive</code></td>
      <td>
        When set to <code>true</code>, enables TCP keepalives (see above).
        Default is <code>false</code>. Makes sense for environments where
        connections can go idle for a long time (at least 10 minutes),
        although using <a href="./heartbeats.html">heartbeats</a> is still recommended over
        this option.
      </td>
    </tr>
  </tbody>
</table>

### <a id="socket-gen-tcp-options-defaults" class="anchor" href="#socket-gen-tcp-options-defaults">Defaults</a>

Below is the default TCP socket option configuration used by RabbitMQ:

 * TCP connection backlog is limited to 128 connections
 * Nagle's algorithm is deactivated
 * Server socket lingering is enabled with the timeout of 0


## <a id="heartbeats" class="anchor" href="#heartbeats">Heartbeats</a>

Some protocols supported by RabbitMQ, including AMQP 0-9-1, support <em>heartbeats</em>, a way to detect dead
TCP peers quicker. Please refer to the [Heartbeats guide](./heartbeats.html)
for more information.


## <a id="nettick" class="anchor" href="#nettick">Net Tick Time</a>

[Heartbeats](./heartbeats.html) are used to detect peer or connection failure
between clients and RabbitMQ nodes. [net_ticktime](./nettick.html) serves
the same purpose but for cluster node communication. Values lower than 5 (seconds)
may result in false positive and are not recommended.


## <a id="tcp-keepalives" class="anchor" href="#tcp-keepalives">TCP Keepalives</a>

TCP contains a mechanism similar in purpose to the heartbeat
(a.k.a. keepalive) one in messaging protocols and net tick
timeout covered above: TCP keepalives. Due to inadequate
defaults, TCP keepalives often don't work the way they are
supposed to: it takes a very long time (say, an hour or more)
to detect a dead peer. However, with tuning they can serve
the same purpose as heartbeats and clean up stale TCP connections
e.g. with clients that opted to not use heartbeats, intentionally or
not.

Below is an example sysctl configuration for TCP keepalives
that considers TCP connections dead or unreachable after 70
seconds (4 attempts every 10 seconds after connection idle for 30 seconds):

<pre class="lang-ini">
net.ipv4.tcp_keepalive_time=30
net.ipv4.tcp_keepalive_intvl=10
net.ipv4.tcp_keepalive_probes=4
</pre>

TCP keepalives can be a useful additional defense mechanism
in environments where RabbitMQ operator has no control
over application settings or client libraries used.


## <a id="handshake-timeout" class="anchor" href="#handshake-timeout">Connection Handshake Timeout</a>

RabbitMQ has a timeout for connection handshake, 10 seconds by
default. When clients run in heavily constrained environments,
it may be necessary to increase the timeout. This can be done via
the `rabbit.handshake_timeout` (in milliseconds):

<pre class="lang-ini">
handshake_timeout = 20000
</pre>

It should be pointed out that this is only necessary with very constrained
clients and networks. Handshake timeouts in other circumstances indicate
a problem elsewhere.

### <a id="tls-handshake" class="anchor" href="#tls-handshake">TLS (SSL) Handshake</a>

If TLS/SSL is enabled, it may be necessary to increase also the TLS/SSL
handshake timeout. This can be done via
the `rabbit.ssl_handshake_timeout` (in milliseconds):

<pre class="lang-ini">
ssl_handshake_timeout = 10000
</pre>


## <a id="dns" class="anchor" href="#dns">Hostname Resolution and DNS</a>

In many cases, RabbitMQ relies on the Erlang runtime for inter-node communication (including
tools such as `rabbitmqctl`, `rabbitmq-plugins`, etc). Client libraries
also perform hostname resolution when connecting to RabbitMQ nodes. This section briefly
covers most common issues associated with that.

### <a id="dns-resolution-by-clients" class="anchor" href="#dns-resolution-by-clients">Performed by Client Libraries</a>

If a client library is configured to connect to a hostname, it performs
hostname resolution. Depending on DNS and local resolver (`/etc/hosts`
and similar) configuration, this can take some time. Incorrect configuration
may lead to resolution timeouts, e.g. when trying to resolve a local hostname
such as `my-dev-machine`, over DNS. As a result, client connections
can take a long time (from tens of seconds to a few minutes).

### <a id="dns-resolution-by-nodes" class="anchor" href="#dns-resolution-by-nodes">Short and Fully-qualified RabbitMQ Node Names</a>

RabbitMQ relies on the Erlang runtime for inter-node
communication. Erlang nodes include a hostname, either short
(`rmq1`) or fully-qualified
(`rmq1.dev.megacorp.local`). Mixing short and
fully-qualified hostnames is not allowed by the
runtime. Every node in a cluster must be able to resolve
every other node's hostname, short or fully-qualified.

By default RabbitMQ will use short hostnames. Set the
`RABBITMQ_USE_LONGNAME` environment variable to
make RabbitMQ nodes use fully-qualified names,
e.g. `rmq1.dev.megacorp.local`.

### <a id="dns-reverse-dns-lookups" class="anchor" href="#dns-reverse-dns-lookups">Reverse DNS Lookups</a>

If the `reverse_dns_lookups` configuration option is set to `true`,
RabbitMQ will complete reverse DNS lookups for client IP addresses and list hostnames
in connection information (e.g. in the [Management UI](./management.html)).

Reverse DNS lookups can potentially take a long time if node's hostname resolution is not
optimally configured. This can increase latency when accepting client connections.

To explicitly activate or turn on reverse DNS lookups:

<pre class="lang-ini">
reverse_dns_lookups = true
</pre>

To deactivate reverse DNS lookups:

<pre class="lang-ini">
reverse_dns_lookups = false
</pre>

### <a id="dns-verify-resolution" class="anchor" href="#dns-verify-resolution">Verify Hostname Resolution</a> on a Node or Locally

Since hostname resolution is a [prerequisite for successful inter-node communication](./clustering.html#hostname-resolution-requirement),
starting with [RabbitMQ `3.8.6`](./changelog.html), CLI tools provide two commands that help verify
that hostname resolution on a node works as expected. The commands are not meant to replace
[`dig`](https://en.wikipedia.org/wiki/Dig_(command)) and other specialised DNS tools but rather
provide a way to perform most basic checks while taking [Erlang runtime hostname resolver features](https://erlang.org/doc/apps/erts/inet_cfg.html)
into account.

The first command is `rabbitmq-diagnostics resolve_hostname`:

<pre class="lang-bash">
# resolves node2.cluster.local.svc to IPv6 addresses on node rabbit@node1.cluster.local.svc
rabbitmq-diagnostics resolve_hostname node2.cluster.local.svc --address-family IPv6 -n rabbit@node1.cluster.local.svc

# makes local CLI tool resolve node2.cluster.local.svc to IPv4 addresses
rabbitmq-diagnostics resolve_hostname node2.cluster.local.svc --address-family IPv4 --offline
</pre>

The second one is `rabbitmq-diagnostics resolver_info`:

<pre class="lang-bash">
rabbitmq-diagnostics resolver_info
</pre>

It will report key resolver settings such as the lookup order (whether CLI tools should prefer the OS resolver,
inetrc file, and so on) as well as inetrc hostname entries, if any:

<pre class="lang-plaintext">
Runtime Hostname Resolver (inetrc) Settings

Lookup order: native
Hosts file: /etc/hosts
Resolver conf file: /etc/resolv.conf
Cache size:

inetrc File Host Entries

(none)
</pre>


## <a id="logging" class="anchor" href="#logging">Connection Event Logging</a>

See [Connection Lifecycle Events](./logging.html#connection-lifecycle-events) in the logging guide.


## <a id="troubleshooting-where-to-start" class="anchor" href="#troubleshooting-where-to-start">Troubleshooting Network Connectivity</a>

A methodology for [troubleshooting of networking-related issues](./troubleshooting-networking.html)
is covered in a separate guide.


## <a id="firewalls-mac-os" class="anchor" href="#firewalls-mac-os">MacOS Application Firewall</a>

On MacOS systems with [Application Firewall](https://support.apple.com/en-us/HT201642) enabled,
Erlang runtime processes must be allowed to bind to ports and accept connections.
Without this, RabbitMQ nodes won't be able to bind to their [ports](#ports) and will fail to start.

A list of blocked applications can be seen under `Security and Privacy` => `Firewall` in system settings.

To "unblock" a command line tool, use `sudo /usr/libexec/ApplicationFirewall/socketfilterfw`.
The examples below assume that Erlang is installed under `/usr/local/Cellar/erlang/{version}`,
used by the Homebrew Erlang formula:

<pre class="lang-bash">
# allow CLI tools and shell to bind to ports and accept inbound connections
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/Cellar/erlang/{version}/lib/erlang/bin/erl
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/Cellar/erlang/{version}/lib/erlang/bin/erl
</pre>

<pre class="lang-bash">
# allow server nodes (Erlang VM) to bind to ports and accept inbound connections
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/Cellar/erlang/{version}/lib/erlang/erts-{erts version}/bin/beam.smp
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/Cellar/erlang/{version}/lib/erlang/erts-{erts version}/bin/beam.smp
</pre>

Note that `socketfilterfw` command line arguments can vary between MacOS releases.
To see supports command line arguments, use

<pre class="lang-bash">
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --help
</pre>
