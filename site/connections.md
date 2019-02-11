<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

# Connections

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers various topics related to connections except for
network tuning or most networking-related topics. Those
are covered by the [Networking](/networking.html) and [Troubleshooting Networking](/troubleshooting-networking.html) guides.
[Channels](/channels.html) is a closely related concept in AMQP 0-9-1 which is also covered
in a separate guide.

RabbitMQ supports several protocols:

 * [AMQP 0-9-1](/specification.html) with [extensions](/extensions.html)
 * AMQP 1.0
 * [MQTT](/mqtt.html) 3.1.1
 * [STOMP](/stomp.html) 1.0 through 1.2

Many topics in this guide are equally applicable to all protocols. When that's not the case, the guide tries
to highlight protocol-specific features and practices.

Note that despite the similarities in naming, AMQP 0-9-1 and AMQP 1.0 are different protocols, not
different versions of the same protocol.

This guide covers:

 * [The basics](#basics) of how clients use RabbitMQ
 * [Connection lifecycle](#lifecycle)
 * [Monitoring](#monitoring) of connections
 * Sustaining a [large number of concurrent connections](#large-number-of-connections)
 * [TLS](#tls)
 * [Flow control](#flow-control)

and other topics related to connections.

## <a id="basics" class="anchor" href="#basics">The Basics</a>

Applications interact with RabbitMQ using client libraries. There are [client libraries](/devtools.html)
available for many programming languages and platforms.
Each protocol has its own set of client libraries. Most client libraries are open source.

Both client libraries and applications that use them are referred to as "clients" in this guide.
Where the difference matters, a more specific term is used (e.g. "application").

All protocols supported by RabbitMQ are TCP-based and assume long-lived connections (a new connection
is not opened per protocol operation) for efficiency. One client library connection uses a single
TCP connection. In for a client to successfully connect, target RabbitMQ node must allow for
connections on a [certain protocol-specific port](/networking.html).

After a client [connects](#lifecycle) and successfully authenticates with a RabbitMQ node, it can
publish and consume messages, define topology and perform other operations that are provided in the protocol
and supported both by the client library and the target RabbitMQ node.

Since connections are meant to be long-lived, clients usually [consume messages](/consumers.html) by registering
a subscription and having messages delivered (pushed) to them instead of polling.

When a connection is no longer necessary, applications must close them to conserve resources.
Apps that fail to do it run the risk of eventually exhausting its target node of resources.

Operating systems have a [limit around how many TCP connections (sockets) a single process can have open](/networking.html#open-file-handle-limit)
simultaneously. The limit is often sufficient for development and some QA environments.
[Production environments](/production-checklist.html) must be configured to use a higher limit in order to support
a larger number of concurrent client connections.

### Protocol Differences

Different messaging protocols use different ports. Ports also vary for plain TCP and TLS-enabled connections.
The [Networking guide](/networking.html#ports) covers all ports used by RabbitMQ depending on what protocols are enabled, whether TLS
is used and so on.

#### AMQP 0-9-1

AMQP 0-9-1 provides a way for connections to multiplex over a single TCP connection. That means an application
can open multiple "lightweight connections" called channels on a single connection. AMQP 0-9-1 clients open one or more
channels after [connecting](#lifecycle) and perform protocol operations (manage topology, publish, consume)
on the channels.

#### AMQP 1.0

AMQP 1.0 provides a way for connections to multiplex over a single TCP connection. That means an application
can open multiple "lightweight connections" called sessions on a single connection.
Applications then set up one or more links to publish and consume messages.


## <a id="lifecycle" class="anchor" href="#lifecycle">Connection Lifecycle</a>

In order for a client to interact with RabbitMQ it must first open a connection. This process
involves a number of steps:

 * Application configures the client library it uses to use a certain connection endpoint (e.g. hostname and port)
 * The library resolves the hostname to one or more IP addresses
 * The library opens a TCP connection to the target IP address and port
 * After the server has accepted the TCP connection, protocol-specific negotiation procedure is performed
 * The server then [authenticates](/access-control.html) the client
 * The client now can perform operations, each of which involves an [authorization check](/access-control.html) by the server.

This flow doesn't change significantly from protocol to protocol but there are minor differences.

### Protocol Differences

#### AMQP 0-9-1

AMQP 0-9-1 has a [model](/tutorials/amqp-concepts.html) that includes connections and channels. Channels allow for
connection multiplexing (having multiple logical connections on a "physical" or TCP one).

The maximum number of [channels](/channels.html) that can be open on a connection simultaneously
is negotiated by client and server at connection time. The client cannot be configured to allow for
more channels than the server configured maximum.

After successfully opening a connection and authenticating, applications open one or more channels and uses them
to perform protocol operations, e.g. define topology, consume and publish messages.

AMQP 0-9-1 supports different authentication mechanisms. While it's most common for applications
to provide a pair of credentials, x509 certificates and PKI [can be used](https://github.com/rabbitmq/rabbitmq-auth-mechanism-ssl)
instead.

#### AMQP 1.0

AMQP 1.0 has a model that includes connections, sessions and links.

After successfully opening a connection and authenticating, an application opens one or more sessions. It then
attaches links to the session in order to publish and consume messages.

#### MQTT 3.1

MQTT 3.1 connections follow the flow described above. MQTT supports optional authentication.
When it is used, RabbitMQ uses a pre-configured set of credentials.

#### STOMP

STOMP connections follow the flow described above.

## <a id="monitoring" class="anchor" href="#monitoring">Monitoring</a>

Number of currently open client connections and connection opening/closure rates are important metrics
of the system that should be [monitored](/monitoring.html). Monitoring them will help detect a number of
problems that are common in messaging-based system:

 * Connection leaks
 * High connection churn

Both problems eventually lead to node exhaustion of [resources](#resource-usage).

### Connection Leaks

A connection leak is a condition under which an application repeatedly opens connections without closing them,
or at least closing only some of them.

Connection leaks eventually exhaust the node (or multiple target nodes) of [file handles](/networking.html#open-file-handle-limit),
which means any new inbound client, peer or CLI tool connection will be rejected. A build-up in the number of concurrent
connections also increases node's memory consumption.

#### Relevant Metrics

[Management UI](/management.html) provides a chart of the total number of connections opened cluster-wide:

<img class="screenshot" src="img/monitoring/connections/mgmt-ui-global-connection-count.png" alt="Global connection count in management UI" title="Global connection count in management UI" />

A connection leak on monitoring charts can be identified as an monotonically growing number of client connections.

It is also possible to see how many file handles and sockets does a specific node have, which can be useful
in determining connection leaks as well. The following chart demonstrates a very stable number of sockets
open on a node:

<img class="screenshot" src="img/monitoring/connections/mgmt-ui-node-socket-count.png" alt="Node file handle and socket count in management UI" title="Node file handle and socket count in management UI" />

This chart demonstrates a monotonically growing number of connections after a drop:

<img class="screenshot" src="img/monitoring/connections/mgmt-ui-node-socket-count-growth.png" alt="Node file handle and socket count growth in management UI" title="Node file handle and socket count growth in management UI" />

If the number of sockets used by a node keeps growing and growing this may be an indication
of a connection leak in one of the applications.

Some client libraries, [such has the Java client](/api-guide.html#metrics), expose metrics including the number of currently
opened connections. Charting and monitoring application metrics around connections is the best way
to identify what app leaks connections or uses them in a suboptimal way.

In many applications that use long-lived connections and do not leak them the number of connections
grows on application start and then moderates (stays mostly stable with little fluctuation).

[Management UI](/management.html) provides a chart on the rate of newly opened connections as of [RabbitMQ 3.7.9](/changelog.html).
Below is a chart that demonstrates a fairly low new connection rate:

<img class="screenshot" src="img/monitoring/connections/mgmt-ui-node-connection-churn.png" alt="Node connection churn in management UI" title="Node connection churn in management UI" />


### <a id="high-connection-churn" class="anchor" href="#high-connection-churn">High Connection Churn</a>

A system is said to have high connection churn when its rate of newly opened connections is consistently high and
its rate of closed connection is consistently high. This usually means that an application
uses short lived connections. While with some workloads this is a natural state of the system,
long lived connections should be used instead when possible.

[Management UI](/management.html) provides a chart of connection churn rate as of [RabbitMQ 3.7.9](/changelog.html).
Below is a chart that demonstrates a fairly low connection churn with a comparable number of connections open and closed
in the given period of time:

<img class="screenshot" src="img/monitoring/connections/mgmt-ui-node-connection-churn.png" alt="Node connection churn in management UI" title="Node connection churn in management UI" />

While connection and disconnection rates are system-specific, rates consistently above 100/second likely indicate a suboptimal
connection management by one or more applications and usually are worth investigating.

<img class="screenshot" src="img/monitoring/connections/mgmt-ui-high-connection-churn.png" alt="High connection churn in management UI" title="High connection churn in management UI" />

Note that some clients and runtimes (notably PHP) do not use long-lived connections and high connection
churn rates are expected from them unless a [specialized proxy is used](https://github.com/cloudamqp/amqproxy).

Environments that experience high connection churn require TCP stack tuning to avoid resource exhaustion.
This is covered [in the Networking guide](/networking.html#dealing-with-high-connection-churn).


## <a id="resource-usage" class="anchor" href="#resource-usage">Resource Usage</a>

Every connection consumes memory and one file handle on the target RabbitMQ node.

Most of the memory is used by connection's TCP buffers. Their size can be [reduced](/networking.html#tuning-for-large-number-of-connections-tcp-buffer-size)
significantly, which leads to significant per-connection memory consumption savings
at the cost of a comparable reduction in connection throughput.

The maximum number of file handles a RabbitMQ node can have open is [limited by the kernel](/networking.html#open-file-handle-limit) and must
be raised in order to support a large number of connections.


## <a id="large-number-of-connections" class="anchor" href="#large-number-of-connections">Supporting a Large Number of Connections</a>

In some environments it's natural to have a large number of concurrently connected clients. For example,
systems that involve a large number of hardware clients (the Internet of Things a.k.a. IoT workloads)
can have many thousands of clients from day one.

Since connections [consume resources](#resource-usage), sustaining a large number of concurrent connections
requires reducing resource consumption or provisioning more resources or nodes. In practice those
two options are used in combination.

The [Networking guide](/networking.html) has a section dedicated to [tuning for a large number of concurrent connections](/networking.html#tuning-for-large-number-of-connections).


## <a id="tls" class="anchor" href="#tls">TLS</a>

Client connections can be encrypted with TLS. TLS also can be used as an additional
or the primary way of authenticating clients. Learn more in the [TLS guide](/ssl.html).


## <a id="flow-control" class="anchor" href="#flow-control">Flow Control</a>

Connections that publish messages can outpace other parts of the system, most likely busy queues and queues
that perform replication. When that happens, [flow control](/flow-control.html) is applied to
publishing connections. Connections that only consume messages are not affected by the flow control
applied to publishers.

With slower consumers that use [automatic acknowledgement mode](/confirms.html#acknowledgement-modes)
it is very likely that connections and channels will experience flow control when writing to
the TCP socket.

[Monitoring](/monitoring.html) systems can collect metrics on the number of connections in flow state.
Applications that experience flow control regularly may consider to use separate connections
to publish and consume to avoid flow control effects on non-publishing operations (e.g. queue management).
