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

# Detecting Dead TCP Connections with Heartbeats and TCP Keepalives

## <a id="overview" class="anchor" href="#overview">Overview</a>

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

## <a id="heartbeats-timeout" class="anchor" href="#heartbeats-timeout">Heartbeat Timeout Value</a>

The `heartbeat timeout` value defines after what period of time
the peer TCP connection should be considered unreachable (down) by RabbitMQ
and client libraries. This value is negotiated between the
client and RabbitMQ server at the time of connection. The
client must be configured to request heartbeats.

The broker and client will attempt to negotiate
heartbeats by default. When both values are non-0, the lower of the requested
values will be used. If one side uses a zero value (attempts to disable heartbeats)
but the other does not, the non-zero value will be used.

The timeout is in seconds, and default value is `60`.
Older releases used `580` seconds by default.

## <a id="heartbeats-interval" class="anchor" href="#heartbeats-interval">Heartbeat Frames</a>

Heartbeat frames are sent about every `heartbeat timeout / 2`
seconds. This value is sometimes referred to as the `heartbeat interval`.
After two missed heartbeats, the peer is considered
to be unreachable. Different clients manifest this differently
but the TCP connection will be closed. When a client detects
that RabbitMQ node is unreachable due to a heartbeat, it needs
to re-connect.

It is important to not confuse the timeout value with the interval one.
RabbitMQ [configuration](/configure.html) exposes the timeout value,
so do the officially supported client libraries. However some clients might expose
the interval, potentially causing confusion.

Any traffic (e.g. protocol operations, published messages, [acknowledgements](/confirms.html)) counts for a valid
heartbeat. Clients may choose to send heartbeat frames
regardless of whether there was any other traffic on the
connection but some only do it when necessary.

## <a id="disabling" class="anchor" href="#disabling">How to Disable Heartbeats</a>

Heartbeats can be disabled by setting the timeout interval to `0` on both client and server ends.

Alternatively a very high (say, 1800 seconds) value can be used on both ends to effectively disable heartbeats
as frame delivery will be too infrequent to make a practical difference.

Neither practice is recommended unless [TCP keepalives](#tcp-keepalives) are used
instead with an adequately low inactivity detection period.

## <a id="using-heartbeats-in-java" class="anchor" href="#using-heartbeats-in-java">Enabling Heartbeats with Java Client</a>

To configure the heartbeat timeout in the Java client, set it with
`ConnectionFactory#setRequestedHeartbeat` before
creating a connection:

<pre class="lang-java">
ConnectionFactory cf = new ConnectionFactory();

// set the heartbeat timeout to 60 seconds
cf.setRequestedHeartbeat(60);
</pre>

Note that in case RabbitMQ server has a non-zero heartbeat timeout
configured (which is the default in versions starting with 3.6.x),
the client can only lower the value but not increase it.

## <a id="using-heartbeats-in-dotnet" class="anchor" href="#using-heartbeats-in-dotnet">Enabling Heartbeats with .NET Client</a>

To configure the heartbeat timeout in the .NET client, set it with
`ConnectionFactory.RequestedHeartbeat` before
creating a connection:

<pre class="lang-csharp">
var cf = new ConnectionFactory();

// set the heartbeat timeout to 60 seconds
cf.RequestedHeartbeat = 60;
</pre>

## <a id="false-positives" class="anchor" href="#false-positives">Low Timeout Values and False Positives</a>

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

## <a id="stomp" class="anchor" href="#stomp">Heartbeats in STOMP</a>

[STOMP 1.2 includes heartbeats](https://stomp.github.io/stomp-specification-1.2.html#Heart-beating).  In STOMP, heartbeat timeouts can
be assymetrical: that is to say, client and server can use
different values. RabbitMQ STOMP plugin fully supports this
feature.

Heartbeats in STOMP are opt-in. To enable them, use the `heart-beat`
header when connecting. See [STOMP specification](https://stomp.github.io/stomp-specification-1.2.html#Heart-beating) for an example.

## <a id="mqtt" class="anchor" href="#mqtt">Heartbeats in MQTT</a>

[MQTT 3.1.1 includes heartbeats](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/csprd02/mqtt-v3.1.1-csprd02.html#_Toc385349238) under a different name
("keepalives").  RabbitMQ MQTT plugin fully supports this
feature.

Keepalives in MQTT are opt-in. To enable them, set the
`keepalive` interval when connecting. Please
consult your MQTT client's documentation for examples.

## <a id="shovel-and-federation" class="anchor" href="#shovel-and-federation">Heartbeats in Shovel and Federation Plugins</a>

[Shovel](/shovel.html) and [Federation](/federation.html) plugins open Erlang client
connections to RabbitMQ nodes under the hood. As such, they can be configured
to use a desired heartbeat value.

Please refer to the [AMQP 0-9-1 URI query parameters reference](/uri-query-parameters.html)
for details.

## <a id="tcp-keepalives" class="anchor" href="#tcp-keepalives">TCP Keepalives</a>

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
connection churn, e.g. [Shovel](/shovel.html) or [Federation](/federation.html) plugin
links that are often disabled and reenabled or interrupted.

TCP keepalives an also be used instead of heartbeats by configuring them to lower system-specific
values. In that case [heartbeats can be disabled](#disabling). The main benefit
of this approach is that all TCP connections on a machine will use identical values
regardless of the protocol and client library used.

See the [Networking guide](/networking.html) for details.

## <a id="tcp-proxies" class="anchor" href="#tcp-proxies">Heartbeats and TCP Proxies</a>

Certain networking tools (HAproxy, AWS ELB) and equipment
(hardware load balancers) may terminate "idle" TCP
connections when there is no activity on them for a certain
period of time. Most of the time it is not desirable.

When heartbeats are enabled on a connection, it results in
periodic light network traffic. Therefore heartbeats have a side effect
of guarding client connections that can go idle for periods of
time against premature closure by proxies and load balancers.

With a heartbeat timeout of 30 seconds the connection will produce periodic
network traffic roughly every 15 seconds. Activity in the 5 to 15 second range
is enough to satisfy the defaults of most popular proxies and load balancers.
Also see the section on low timeouts and false positives above.

## <a id="troubleshooting" class="anchor" href="#troubleshooting">Troubleshooting Active and Defunct Connections</a>

RabbitMQ nodes will [log connections](/logging.html#connection-lifecycle-events) closed due to missed heartbeats. So will all
officially supported client libraries. Inspecting server and client logs will provide
valuable information and should be the first troubleshooting step.

It may be necessary to inspect the connections open to or from a node,
their state, origin, username and effective heartbeat timeout value.
[Network Troubleshooting](/troubleshooting-networking.html) guide
provides an overview of the tools available to help with that.
