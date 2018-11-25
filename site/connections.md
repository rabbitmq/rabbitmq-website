<!--
Copyright (c) 2007-2018 Pivotal Software, Inc.

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

This guide covers various topics related to connections. This guide
does not cover network tuning or most networking-related topics. Those
are covered by the [Networking](/networking.html) and [Troubleshooting Networking](/troubleshooting-networking.html) guides.

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
 *

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
Applications that set up one or more links to publish and consume messages.


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

TBD

## Monitoring

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
which means any new inbound client, peer or CLI tool connection will be rejected.

A build-up in the number of concurrent connections also increases node's memory consumption.

A connection leak on monitoring charts can be identified as an ever-growing number of client connections.

### High Connection Churn

A system is said to have high connection churn when its rate of newly opened connections is consistently high and
its rate of closed connection is consistently high. This usually means that an application
uses short lived connections.



## <a id="resource-usage" class="anchor" href="#resource-usage">Resource Usage</a>

Memory and [file handles](/networking.html#open-file-handle-limit)


## Supporting a Large Number of Connections

TBD

## TLS

Client connections can be encrypted with TLS. TLS also can be used as an additional
or the primary way of authenticating clients. Learn more in the [TLS guide](/ssl.html).

## Publisher Flow Control

TBD
