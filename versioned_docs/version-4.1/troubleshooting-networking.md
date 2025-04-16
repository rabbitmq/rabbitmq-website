---
title: Troubleshooting Network Connectivity
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

# Troubleshooting Network Connectivity

## Overview {#overview}

This guide accompanies the one [on networking](./networking) and focuses on troubleshooting of
network connections.

For connections that use TLS there is an additional [guide on troubleshooting TLS](./troubleshooting-ssl).

## Troubleshooting Methodology {#methodology}

Troubleshooting of network connectivity issues is a broad topic. There are entire
books written about it. This guide explains a methodology and widely available networking tools
that help narrow most common issues down efficiently.

Networking protocols are [layered](https://en.wikipedia.org/wiki/OSI_model#Comparison_with_TCP.2FIP_model).
So are problems with them. An effective troubleshooting
strategy typically uses the process of elimination to pinpoint the issue (or multiple issues),
starting at higher levels. Specifically for messaging technologies, the following steps
are often effective and sufficient:

 * [Verify client configuration](#verify-client)
 * [Verify server configuration](#verify-server) using <code>[rabbitmq-diagnostics][2] listeners</code>,
   <code>[rabbitmq-diagnostics][2] status</code>,
   <code>[rabbitmq-diagnostics][2] environment</code>
 * Inspect [server logs](#server-logs)
 * Verify [hostname resolution](#hostname-resolution)
 * Verify what TCP [port are used and their accessibility](#ports)
 * Verify [IP routing](#ip-routing)
 * If needed, [take and analyze a traffic dump](#traffic-capture) (traffic capture)
 * Verify that clients can [successfully authenticate](./access-control#troubleshooting-authn)

These steps, when performed in sequence, usually help identify the root cause of
the vast majority of networking issues. Troubleshooting tools and techniques for
levels lower than the [Internet (networking) layer](https://en.wikipedia.org/wiki/Internet_protocol_suite#Internet_layer)
are outside of the scope of this guide.

Certain problems only happen in environments with a [high degree of connection churn](#detecting-high-connection-churn).
Client connections can be inspected using the [management UI](./management).
It is also possible to [inspect all TCP connections of a node and their state](#inspecting-connections).
That information collected over time, combined with server logs, will help detect connection churn,
file descriptor exhaustion and related issues.

## Verify Client Configuration {#verify-client}

All developers and operators have been there: typos,
outdated values, issues in provisioning tools, mixed up
public and private key paths, and so on. Step one is to
double check application and client library
configuration.

## Verify Server Configuration {#verify-server}

Verifying server configuration helps prove that RabbitMQ is running
with the expected set of settings related to networking. It also verifies
that the node is actually running. Here are the recommended steps:

 * Make sure the node is running using <code>[rabbitmq-diagnostics][2] status</code>
 * Verify [config file is correctly placed and has correct syntax/structure](./configure#configuration-files)
 * Inspect listeners using <code>[rabbitmq-diagnostics][2] listeners</code>
   or the `listeners` section in <code>[rabbitmq-diagnostics][2] status</code>
 * Inspect effective configuration using <code>[rabbitmq-diagnostics][2] environment</code>

Note that in older RabbitMQ versions, the `status` and `environment` commands
were only available as part of [rabbitmqctl][1]:
<code>[rabbitmqctl][1] status</code> and so on.
In modern versions either tool can be used to run those commands but
[rabbitmq-diagnostics][2] is what most documentation guides
will typically recommend.

The listeners section will look something like this:

```ini
Interface: [::], port: 25672, protocol: clustering, purpose: inter-node and CLI tool communication
Interface: [::], port: 5672, protocol: amqp, purpose: AMQP 0-9-1 and AMQP 1.0
Interface: [::], port: 5671, protocol: amqp/ssl, purpose: AMQP 0-9-1 and AMQP 1.0 over TLS
Interface: [::], port: 15672, protocol: http, purpose: HTTP API
Interface: [::], port: 15671, protocol: https, purpose: HTTP API over TLS (HTTPS)
Interface: [::], port: 1883, protocol: mqtt, purpose: MQTT
```

In the above example, there are 6 TCP listeners on the node:

 * [Inter-node](./clustering) and [CLI tool](./cli) communication on port `25672`
 * AMQP 0-9-1 (and 1.0, if enabled) listener for non-TLS connections on port `5672`
 * AMQP 0-9-1 (and 1.0, if enabled) listener for TLS-enabled connections on port `5671`
 * [HTTP API](./management) listeners on ports 15672 (HTTP) and 15671 (HTTPS)
 * [MQTT](./mqtt) listener for non-TLS connections 1883

In second example, there are 4 TCP listeners on the node:

 * [Inter-node](./clustering) and [CLI tool](./cli) communication on port `25672`
 * AMQP 0-9-1 (and 1.0, if enabled) listener for non-TLS connections, `5672`
 * AMQP 0-9-1 (and 1.0, if enabled) listener for TLS-enabled connections, `5671`
 * [HTTP API](./management) listener on ports 15672 (HTTP only)

All listeners are bound to all available interfaces.

Inspecting TCP listeners used by a node helps spot non-standard port configuration,
protocol plugins (e.g. [MQTT](./mqtt)) that are supposed to be configured but aren't,
cases when the node is limited to only a few network interfaces, and so on. If a port is not on the
listener list it means the node cannot accept any connections on it.

## Inspect Server Logs {#server-logs}

RabbitMQ nodes will [log](./logging) key
client [connection lifecycle events](./logging#connection-lifecycle-events).
A TCP connection must be successfully established and at least 1 byte of data must be
sent by the peer for a connection to be considered (and logged as) accepted.

From this point, connection handshake and negotiation proceeds as defined by the specification
of the messaging protocol used, e.g. AMQP 0-9-1, AMQP 1.0 or MQTT.

If no events are logged, this means that either there were no successful inbound TCP connections
or they sent no data.

## Hostname Resolution {#hostname-resolution}

It is very common for applications to use hostnames or URIs with hostnames when connecting
to RabbitMQ. [dig](https://en.wikipedia.org/wiki/Dig_(command)) and [nslookup](https://en.wikipedia.org/wiki/Nslookup) are
commonly used tools for troubleshooting hostnames resolution.

## Port Access {#ports}

Besides hostname resolution and IP routing issues,
TCP port inaccessibility for outside connections is a common reason for
failing client connections. [telnet](https://en.wikipedia.org/wiki/Telnet) is a commonly
used, very minimalistic tool for testing TCP connections to a particular hostname and port.

The following example uses `telnet` to connect to host `localhost` on port `5672`.
There is a running node with stock defaults running on `localhost` and nothing blocks access to the port, so
the connection succeeds. `12345` is then entered for input followed by an Enter.
This data will be sent to the node on the opened connection.

Since `12345` is not a correct AMQP 0-9-1 or AMQP 1.0 protocol header,
so the server closes TCP connection:

```bash
telnet localhost 5672
# => Trying ::1...
# => Connected to localhost.
# => Escape character is '^]'.
12345 # enter this and hit Enter to send
# => AMQP	Connection closed by foreign host.
```

After `telnet` connection succeeds, use `Control + ]` and then `Control + D` to
quit it.

The following example connects to `localhost` on port `5673`.
The connection fails (refused by the OS) since there is no process listening on that port.

```bash
telnet localhost 5673
# => Trying ::1...
# => telnet: connect to address ::1: Connection refused
# => Trying 127.0.0.1...
# => telnet: connect to address 127.0.0.1: Connection refused
# => telnet: Unable to connect to remote host
```

Failed or timing out `telnet` connections
strongly suggest there's a proxy, load balancer or firewall
that blocks incoming connections on the target port. It
could also be due to RabbitMQ process not running on the
target node or uses a non-standard port. Those scenarios
should be eliminated at the step that double checks server
listener configuration.

There's a great number of firewall, proxy and load balancer tools and products.
[iptables](https://en.wikipedia.org/wiki/Iptables) is a commonly used
firewall on Linux and other UNIX-like systems. There is no shortage of `iptables`
tutorials on the Web.

Open ports, TCP and UDP connections of a node can be inspected using [netstat](https://en.wikipedia.org/wiki/Netstat),
[ss](https://linux.die.net/man/8/ss), [lsof](https://en.wikipedia.org/wiki/Lsof).

The following example uses `lsof` to display OS processes that listen on port 5672 and use IPv4:

```ini
sudo lsof -n -i4TCP:5672 | grep LISTEN
```

Similarly, for programs that use IPv6:

```ini
sudo lsof -n -i6TCP:5672 | grep LISTEN
```

On port 1883:

```ini
sudo lsof -n -i4TCP:1883 | grep LISTEN
```

```ini
sudo lsof -n -i6TCP:1883 | grep LISTEN
```


If the above commands produce no output then no local OS processes listen on the given port.

The following example uses `ss` to display listening TCP sockets that use IPv4 and their OS processes:

```ini
sudo ss --tcp -f inet --listening --numeric --processes
```

Similarly, for TCP sockets that use IPv6:

```ini
sudo ss --tcp -f inet6 --listening --numeric --processes
```

For the list of ports used by RabbitMQ and its various
plugins, see above. Generally all ports used for external
connections must be allowed by the firewalls and proxies.

`rabbitmq-diagnostics listeners` and `rabbitmq-diagnostics status` can be
used to list enabled listeners and their ports on a RabbitMQ node.

## IP Routing {#ip-routing}

Messaging protocols supported by RabbitMQ use TCP and require IP routing between
clients and RabbitMQ hosts to be functional. There are several tools and techniques
that can be used to verify IP routing between two hosts. [traceroute](https://en.wikipedia.org/wiki/Traceroute) and [ping](https://en.wikipedia.org/wiki/Ping_(networking_utility))
are two common options available for many operating systems. Most routing table inspection tools are OS-specific.

Note that both `traceroute` and `ping` use [ICMP](https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol)
while RabbitMQ client libraries and inter-node connections use TCP.
Therefore a successful `ping` run alone does not guarantee successful client connectivity.

Both `traceroute` and `ping` have Web-based and GUI tools built on top.

## Capturing Traffic {#traffic-capture}

All network activity can be inspected, filtered and analyzed using a traffic capture.

[tcpdump](https://en.wikipedia.org/wiki/Tcpdump) and its GUI sibling [Wireshark](https://www.wireshark.org)
are the industry standards for capturing traffic, filtering and analysis. Both support all protocols supported by RabbitMQ.
See the [Using Wireshark with RabbitMQ](/amqp-wireshark) guide for an overview.

## TLS Connections {#tls}

For connections that use TLS there is a separate [guide on troubleshooting TLS](./troubleshooting-ssl).

When adopting TLS it is important to make sure that clients
use correct port to connect (see the list of ports above)
and that they are instructed to use TLS (perform TLS
upgrade). A client that is not configured to use TLS will
successfully connect to a TLS-enabled server port but its connection
will then time out since it never performs the TLS upgrade that the server
expects.

A TLS-enabled client connecting to a non-TLS enabled port will successfully
connect and try to perform a TLS upgrade which the server does not expect, this
triggering a protocol parser exception. Such exceptions will be logged by the server.

## Inspecting Connections {#inspecting-connections}

Open ports, TCP and UDP connections of a node can be inspected using [netstat](https://en.wikipedia.org/wiki/Netstat),
[ss](https://linux.die.net/man/8/ss), [lsof](https://en.wikipedia.org/wiki/Lsof).

The following example uses `netstat` to list all TCP connection sockets regardless of their state and interface.
IP addresses will be displayed as numbers instead of being resolved to domain names. Program names will be printed next
to numeric port values (as opposed to protocol names).

```bash
sudo netstat --all --numeric --tcp --programs
```

Both inbound (client, peer nodes, CLI tools) and outgoing (peer nodes,
Federation links and Shovels) connections can be inspected this way.

<code>[rabbitmqctl][1] list_connections</code>, [management UI](./management)
can be used to inspect more connection properties, some of which are RabbitMQ- or
messaging protocol-specific:

 * Network traffic flow, both inbound and outbound
 * Messaging (application-level) protocol used
 * Connection virtual host
 * Time of connection
 * Username
 * Number of channels
 * Client library details (name, version, capabilities)
 * Effective heartbeat timeout
 * TLS details

Combining connection information from management UI or CLI tools with those of `netstat` or `ss`
can help troubleshoot misbehaving applications, application instances and client libraries.

Most relevant connection metrics can be collected, aggregated and [monitored](./monitoring)
using [Prometheus and Grafana](./prometheus).


## Detecting High Connection Churn {#detecting-high-connection-churn}

High connection churn (lots of connections opened and closed after a brief
period of time) [can lead to resource exhaustion](./networking#dealing-with-high-connection-churn).
It is therefore important to be able to identify such scenarios. `netstat` and `ss`
are most popular options for [inspecting TCP connections](#inspecting-connections).
A lot of connections in the `TIME_WAIT` state is a likely symptom of high connection churn.
Lots of connections in states other than `ESTABLISHED` also might be a symptom worth investigating.

Evidence of short lived connections can be found in RabbitMQ log files. E.g. here's an example
of such connection that lasted only a few milliseconds:

```ini
2018-06-17 16:23:29.851 [info] <0.634.0> accepting AMQP connection <0.634.0> (127.0.0.1:58588 -> 127.0.0.1:5672)
2018-06-17 16:23:29.853 [info] <0.634.0> connection <0.634.0> (127.0.0.1:58588 -> 127.0.0.1:5672): user 'guest' authenticated and granted access to vhost '/'
2018-06-17 16:23:29.855 [info] <0.634.0> closing AMQP connection <0.634.0> (127.0.0.1:58588 -> 127.0.0.1:5672, vhost: '/', user: 'guest')
```

[1]: ./man/rabbitmqctl.8
[2]: ./man/rabbitmq-diagnostics.8
