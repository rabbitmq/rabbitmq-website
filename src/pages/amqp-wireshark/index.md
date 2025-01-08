<!--
Copyright (c) 2007-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Inspecting AMQP 0-9-1 and AMQP 1.0 Traffic using Wireshark

## Overview {#overview}

[Wireshark](https://www.wireshark.org/) is a graphical tool that can capture traffic and inspect it,
or inspect a traffic capture taken on a different host.

Modern Wireshark versions contain support for AMQP 1.0 and AMQP 0-9-1 traffic inspection and
analysis. It can dissect (parse, visualise, filter) AMQP 0-9-1 and AMQP 1.0 traffic,
including AMQP 0-9-1 [Errata](amqp-0-9-1-errata#section_3) and RabbitMQ [Extensions](/docs/extensions).

Wireshark is based on the same foundation as [`tcpdump`](https://www.tcpdump.org/), a library called `libpcap`,
and can be used to inspect `pcap` traffic capture files taken in a server environment.

Together, `tcpdump` and Wireshark provide a lot of information explaining what clients (applications) and RabbitMQ nodes
send and receive. This information can and should be used to derive insights into system behavior that is difficult
to observe otherwise. These tools complement [metrics](/docs/monitoring), [logs](/docs/logging),
[internal events](/docs/logging#internal-events), all to allow operators and developers troubleshoot a distributed system more efficiently.

Traffic captures are particularly useful for analyzing message flow, [unroutable messages](/docs/publishers#unroutable), [publisher confirms](/docs/confirms) and
[consumer acknowledgement](/docs/confirms) use by applications.


## Tracing AMQP 1.0 and AMQP 0-9-1 {#tracing}

On startup, Wireshark will display a list of interface to start a traffic capture on. Modern versions
will explicitly highlight the primary network interace on the host (as inferred from the Wi-Fi network interface)
and the loopback (local) interface.

To begin tracing AMQP 1.0 or AMQP 0-9-1 traffic, start a capture on a relevant network interface,
then filter for "amqp" in the "Apply a display filter" search box.

The Packet List view provides a summary of protocol frames and methods exchanged by a client and a RabbitMQ node.

The Info column indicates the Class and Method (e.g. `Basic.Publish`)
and then the most significant arguments. For example:

 * `Connection.Open vhost={name}`
 * `Connection.Close reply={reply-text}`
 * `Channel.Close reply={reply-text}`
 * `Exchange.Declare x={exchange-name}`
 * `Exchange.Bind dx={dest-exchange} sx={source-exchange} bk={routing-key}`
 * `Queue.Declare q={queue-name}`
 * `Queue.Bind q={queue-name} x={exchange-name} bk={routing-key}`
 * `Queue.Delete q={queue-name}`
 * `Basic.Publish x={exchange-name} rk={routing-key}`

Packet Details then indicate all the properties of the frame. It
also includes dynamically calculated values enclosed in square
brackets.

Below is an example of a Wireshark window with an active capture and the "amqp" display filter enabled.

<img src="/img/wireshark-main-window.png" alt="Main window" title="Main window" />


## Links Between Related Frames {#linking}

Wireshark analyzes the AMQP 0-9-1 packet flow and displays
additional information enclosed in square brackets:

 * Arguments of basic.publish include a publish sequence number, which is the sequence number used by
   [Publisher Confirms](/docs/confirms)
 * Each acknowledged basic.publish or `basic.deliver` includes a reference to the frame that contains the
   corresponding `basic.ack` or `basic.nack` frame that acknowledged it (if any).
 * Similarly, each basic.ack contains a reference (possibly multiple) to frame(s) that is being confirmed by this Ack


## More Metrics {#more-metrics}

Wireshark automatically highlights AMQP 0-9-1 packets with:

 * [Connection errors](/docs/connections#error-handling) (server-sent `connection.close` frames) and [channel errors](/docs/channels#error-handling)
   (server-sent `channel.close` frames)
 * [Unroutable returned messages](/docs/publishers#unroutable) messages (`basic.return` frames)

You may display summary of significant frames in a dedicated
dialog. Go to Analyze > Expert Information and possibly apply
the display filter:

<img src="/img/wireshark-expert-info.png" alt="More Metrics" title="Metrics" />

## Inspecting Traffic on TLS-enabled Connections {#inspecting-tls-connections}

Wireshark enables you to inspect the AMQPS traffic, however you
can decrypt only the traffic that have been encrypted using the
RSA keys, excluding the RSA ephemeral and Diffie-Hellman
Ephemeral (DHE/EDH) cipher suites. You should
[set cipher suites](/docs/ssl#cipher-suites) used
by RabbitMQ and restrict the list to RSA only.

In addition, Wireshark must be provided with the private key used to
encrypt the data. If a mutual [peer verification](/docs/ssl#peer-verification) is used,
both client and server private keys must be added to Wireshark.

To do so, go to the `Edit > Preferences` dialog in the menu, select `Protocols > SSL` and
then use `Edit the RSA keys` to add private key file paths to the list.

The interface will contain a few values to fill:

 * IP Address and Port identify the host that holds the
   private key, usually the server. A wildcard IP address
   of 0.0.0.0 and wildcard port of 0 or data can be used
 * Protocol should be set to `amqp`
 * The private key file should be in the PEM or PKCS12
   format, optionally protected by a password
