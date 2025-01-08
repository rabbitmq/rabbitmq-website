---
title: Detecting Dead TCP Connections with Heartbeats and TCP Keepalives
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

# Detecting Dead TCP Connections with Heartbeats and TCP Keepalives

## Overview {#overview}

Network can fail in many ways, sometimes pretty subtle
(e.g. high ratio packet loss).  Disrupted TCP connections take
a moderately long time (about 11 minutes with default
configuration on Linux, for example) to be detected by the
operating system. AMQP 0-9-1 offers a <i>heartbeat</i> feature
to ensure that the application layer promptly finds out about
disrupted connections (and also completely unresponsive
peers). Heartbeats also defend against certain network
equipment which may terminate "idle" TCP connections when
there is no activity on them for a certain period of time.

[TCP keepalives](#tcp-keepalives) is a TCP stack feature that serves a similar
purpose and can be very useful (possibly in combination with heartbeats)
but requires kernel tuning in order to be practical with most operating
systems and distributions.


## Heartbeat Timeout Value {#heartbeats-timeout}

The `heartbeat timeout` value defines after what period of time
the peer TCP connection should be considered unreachable (down) by RabbitMQ
and client libraries. This value is negotiated between the
client and RabbitMQ server at the time of connection. The
client must be configured to request heartbeats.

The negotiation process works like this: the server will suggest
its configurable value and the client will reconcile it with its configured value,
and send the result value back. The value is **in seconds**,
and default value suggested by RabbitMQ is `60`.

:::warning
Setting the heartbeat timeout to a really low value can lead to false
positives: connection peer being considered unavailable while it is not
really the case
:::

Java, .NET and Erlang clients maintained by the RabbitMQ core team use the following negotiation
algorithm:

 * If either value is `0` (see below), the greater value of the two is used
 * Otherwise the smaller value of the two is used

A zero value indicates that a peer suggests disabling heartbeats entirely.
To disable heartbeats, both peers have to opt in and use the value of `0`.
This is **highly recommended against** unless the environment is known to use
[TCP keepalives](#tcp-keepalives) on every host.

[Very low values](#false-positives) are also highly recommended against.


## Low Timeout Values and False Positives {#false-positives}

:::info
Values within the 5
to 20 seconds range are optimal for most environments
:::

Setting heartbeat timeout value too low can lead to false
positives (peer being considered unavailable while it is not
really the case) due to transient network congestion,
short-lived server flow control, and so on.

This should be taken into consideration when picking a timeout
value.

Several years worth of feedback from the users and client
library maintainers suggest that values lower than 5 seconds
are fairly likely to cause false positives, and values of 1
second or lower are very likely to do so. Values within the 5
to 20 seconds range are optimal for most environments.


## Heartbeat Frames {#heartbeats-interval}

Heartbeat frames are sent about every `heartbeat timeout / 2`
seconds. This value is sometimes referred to as the `heartbeat interval`.
After two missed heartbeats, the peer is considered
to be unreachable. Different clients manifest this differently
but the TCP connection will be closed. When a client detects
that RabbitMQ node is unreachable due to a heartbeat, it needs
to re-connect.

It is important to not confuse the timeout value with the interval one.
RabbitMQ [configuration](./configure) exposes the timeout value,
so do the officially supported client libraries. However some clients might expose
the interval, potentially causing confusion.

Any traffic (e.g. protocol operations, published messages, [acknowledgements](./confirms)) counts for a valid
heartbeat. Clients may choose to send heartbeat frames
regardless of whether there was any other traffic on the
connection but some only do it when necessary.


## How to Deactivate Heartbeats {#disabling}

Heartbeats can be deactivated by setting the timeout interval to `0` on the client side at connection time,
providing the server heartbeat has also been set to zero.

:::warning
Deactivating heartbeats is **not recommended**
unless the environment is known to use [TCP keepalives](#tcp-keepalives) on every host (both RabbitMQ nodes and applications)
:::

Alternatively a very high (say, 1800 seconds) value can be used on both ends to effectively deactivate heartbeats
as frame delivery will be too infrequent to make a practical difference.

Unless [TCP keepalives](#tcp-keepalives) are used instead with an adequately low inactivity detection period,
*deactivating heartbeats is highly discouraged*. If heartbeats are deactivated, it will make timely peer unavailability
detection much less likely, which *would pose a significant risk to data safety*, in particular for [publishers](./publishers).


## Enabling Heartbeats with Java Client {#using-heartbeats-in-java}

To configure the heartbeat timeout in the Java client, set it with
`ConnectionFactory#setRequestedHeartbeat` before
creating a connection:

```java
ConnectionFactory cf = new ConnectionFactory();

// set the heartbeat timeout to 60 seconds
cf.setRequestedHeartbeat(60);
```

Note that in case RabbitMQ server has a non-zero heartbeat timeout
configured (which is the default), the client can only lower the value but not increase it.


## Enabling Heartbeats with .NET Client {#using-heartbeats-in-dotnet}

To configure the heartbeat timeout in the .NET client, set it with
`ConnectionFactory.RequestedHeartbeat` before
creating a connection:

```csharp
var cf = new ConnectionFactory();

// set the heartbeat timeout to 60 seconds
cf.RequestedHeartbeat = TimeSpan.FromSeconds(60);
```


## Heartbeats in STOMP {#stomp}

[STOMP 1.2 includes heartbeats](https://stomp.github.io/stomp-specification-1.2.html#Heart-beating).  In STOMP, heartbeat timeouts can
be asymmetrical: that is to say, client and server can use
different values. RabbitMQ STOMP plugin fully supports this
feature.

Heartbeats in STOMP are opt-in. To enable them, use the `heart-beat`
header when connecting. See [STOMP specification](https://stomp.github.io/stomp-specification-1.2.html#Heart-beating) for an example.

## Heartbeats in MQTT {#mqtt}

[MQTT includes heartbeats](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901045) under a different name ("keepalives").
RabbitMQ MQTT plugin fully supports this feature.

Keepalives in MQTT are opt-in. To enable them, set the `keepalive` interval when connecting.
Please consult your MQTT client's documentation for examples.

## Heartbeats in Shovel and Federation Plugins {#shovel-and-federation}

[Shovel](./shovel) and [Federation](./federation) plugins open Erlang client
connections to RabbitMQ nodes under the hood. As such, they can be configured
to use a desired heartbeat value.

Please refer to the [AMQP 0-9-1 URI query parameters reference](./uri-query-parameters)
for details.

## TCP Keepalives {#tcp-keepalives}

TCP contains a mechanism similar in purpose to the heartbeat
(a.k.a. keepalive) one in messaging protocols and net tick
timeout covered above: TCP keepalives. Due to inadequate
defaults, TCP keepalives cannot be assumed to be suitable
for messaging protocols. However, with proper tuning they can be
useful as an additional defense mechanism in environments where
applications cannot be expected to enable heartbeats or use
reasonable values.

In certain rare cases when heartbeats alone are not sufficient
(e.g. when connections involved use a protocol that does
not have a heartbeat mechanism of some kind), TCP keepalives must
be configured to use a reasonably low timeout value.

TCP keepalives cover all TCP connections on a host, both inbound
and outgoing. This makes them useful in scenarios with a high outgoing
connection churn, for example, [Shovel](./shovel) or [Federation](./federation) plugin
links that are often deactivated and re-activated (re-enabled) or interrupted.

TCP keepalives can also be used instead of heartbeats by configuring them to lower system-specific
values. In that case [heartbeats can be deactivated](#disabling). The main benefit
of this approach is that all TCP connections on a machine will use identical values
regardless of the protocol and client library used.

See the [Networking guide](./networking) for details.

## Heartbeats and TCP Proxies {#tcp-proxies}

Certain networking tools (HAproxy, AWS ELB) and equipment
(hardware load balancers) may terminate "idle" TCP
connections when there is no activity on them for a certain
period of time. Most of the time it is not desirable.

When heartbeats are activated on a connection, it results in
periodic light network traffic. Therefore heartbeats have a side effect
of guarding client connections that can go idle for periods of
time against premature closure by proxies and load balancers.

With a heartbeat timeout of 30 seconds the connection will produce periodic
network traffic roughly every 15 seconds. Activity in the 5 to 15 second range
is enough to satisfy the defaults of most popular proxies and load balancers.
Also see the section on low timeouts and false positives above.

## Troubleshooting Active and Defunct Connections {#troubleshooting}

RabbitMQ nodes will [log connections](./logging#connection-lifecycle-events) closed due to missed heartbeats. So will all
officially supported client libraries. Inspecting server and client logs will provide
valuable information and should be the first troubleshooting step.

It may be necessary to inspect the connections open to or from a node,
their state, origin, username and effective heartbeat timeout value.
[Network Troubleshooting](./troubleshooting-networking) guide
provides an overview of the tools available to help with that.
