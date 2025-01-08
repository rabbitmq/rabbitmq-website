---
title: MQTT Plugin
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MQTT Plugin

## Overview {#overview}

RabbitMQ supports MQTT versions
[3.1](https://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html),
[3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html), and
[5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html)
via a plugin that ships in the core distribution.

This guide covers the following topics:

 * [How to enable the plugin](#enabling-plugin)
 * [Supported MQTT features](#features) and [limitations](#limitations)
 * [MQTT plugin implementation overview](#implementation)
 * When (not) to use [quorum queues](#quorum-queues)
 * [MQTT QoS 0 queue type](#qos0-queue-type)
 * [Users and authentication](#authentication) and [remote connections](#local-vs-remote)
 * [Key configurable settings](#config) of the plugin
 * [TLS support](#tls)
 * [Virtual hosts](#virtual-hosts)
 * [Metrics](#metrics)
 * [Performance and scalability check list](#scalability)
 * [Proxy protocol](#proxy-protocol)
 * [Sparkplug support](#sparkplug-support)

## Enabling the Plugin {#enabling-plugin}

The MQTT plugin is included in the RabbitMQ distribution. Before clients can successfully
connect, it must be enabled on all cluster nodes using [rabbitmq-plugins](./man/rabbitmq-plugins.8):

```bash
rabbitmq-plugins enable rabbitmq_mqtt
```

## Supported MQTT features {#features}

RabbitMQ supports most MQTT 5.0 features including the following:

* [QoS 0 (at most once)](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901235) and [QoS 1 (at least once)](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901236) publish & subscribe
* TLS, OAuth 2.0
* [Clean](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901039) and non-clean sessions
* [Message Expiry Interval](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901112)
* [Subscription Identifier](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901166) and [Subscription Options](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)
* [Will messages](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901040) including [Will Delay Interval](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901062)
* [Request / Response](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901253) including interoperability with other protocols such as AMQP 0.9.1 and AMQP 1.0
* [Topic Alias](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901113)
* [Retained](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901104) messages with the limitations described in section [Retained Messages and Stores](#retained)
* [MQTT over a WebSocket](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901285) via the [RabbitMQ Web MQTT Plugin](./web-mqtt)

The [MQTT 5.0 blog post](/blog/2023/07/21/mqtt5) provides a complete list of supported MQTT 5.0 features including their usage and implementation details.

MQTT clients can interoperate with other protocols.
For example, MQTT publishers can send messages to AMQP 0.9.1 or AMQP 1.0 consumers if these consumers consume from a queue
that is bound to the MQTT [topic exchange](/tutorials/amqp-concepts#exchange-topic) (configured via `mqtt.exchange` and defaulting to `amq.topic`).
Likewise an AMQP 0.9.1, AMQP 1.0, or STOMP publisher can send messages to an MQTT subscriber if the publisher publishes to the MQTT topic exchange.

## Limitations {#limitations}

The following MQTT features are unsupported:

* [QoS 2 (exactly once)](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901237)
* [Shared subscriptions](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901250)
* A [Will Message](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901040) that is both [delayed](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901062) and [retained](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901042) is not retained.

The following MQTT features are supported with limitations:

* Retained messages are stored and queried only node local. See [Retained Messages and Stores](#retained).
* Overlapping subscriptions with different QoS levels can result in duplicate messages being delivered.
Applications need to account for this.
For example when the same MQTT client creates a QoS 0 subscription for topic filter `/sports/football/epl/#` and a QoS 1 subscription for topic filter `/sports/football/#`,
it will be delivered duplicate messages.

## How the MQTT plugin works {#implementation}

RabbitMQ MQTT plugin targets MQTT 3.1, 3.1.1, and 5.0 supporting a broad range
of MQTT clients. It also makes it possible for MQTT clients to interoperate
with [AMQP 0-9-1, AMQP 1.0, and STOMP](./protocols) clients.
There is also support for multi-tenancy.

### Mapping MQTT to the AMQP 0.9.1 model

RabbitMQ core implements the AMQP 0.9.1 protocol.
The plugin builds on top of the AMQP 0.9.1 entities: [exchanges](/tutorials/amqp-concepts#exchanges), [queues](./queues), and bindings.
Messages published to MQTT topics are routed by an AMQP 0.9.1 topic exchange.
MQTT subscribers consume from queues bound to the topic exchange.

The MQTT plugin creates a dedicated queue per MQTT subscriber. To be more precise, there could be 0, 1, or 2 queues per MQTT session:

* There are 0 queues for an MQTT session if the MQTT client never sends a [SUBSCRIBE](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901161) packet. The MQTT client is only publishing messages.
* There is 1 queue for an MQTT session if the MQTT client creates one or multiple subscriptions with the same QoS level.
* There are 2 queues for an MQTT session if the MQTT client creates subscriptions with both QoS levels: QoS 0 and QoS 1.

When listing queues you will observe the queue naming pattern `mqtt-subscription-<MQTT client ID>qos[0|1]` where `<MQTT client ID>` is the MQTT [client identifier](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901059) and `[0|1]` is either `0` for a QoS 0 subscription or `1` for a QoS 1 subscription.
Having a separate queue per MQTT subscriber allows every MQTT subscriber to receive its own copy of the application message.

The plugin creates queues transparently for MQTT subscribing clients.
The MQTT specification does not define the concept of queues and MQTT clients are not aware that these queues exist.
A queue is an implementation detail of how RabbitMQ implements the MQTT protocol.

### Queue Types

An MQTT client can publish a message to any queue type.
For that to work, a [classic queue](./classic-queues), [quorum queue](./quorum-queues), or [stream](./streams) must be bound to the topic exchange with a binding key matching the topic of the [PUBLISH](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901100) packet.

The MQTT plugin creates a classic queue, quorum queue, or [MQTT QoS 0 queue](#qos0-queue-type) per MQTT subscriber.
By default, the plugin creates a classic queue.

The plugin can be configured to create quorum queues (instead of classic queues) for subscribers whose MQTT session lasts longer than their MQTT network connection.
This is explained in section [Quorum Queues](#quorum-queues).

If [feature flag](./feature-flags) `rabbit_mqtt_qos0_queue` is enabled, the plugin creates an MQTT QoS 0 queue for QoS 0 subscribers whose MQTT session last as long as their MQTT network connection.
This is explained in section [MQTT QoS 0 queue type](#qos0-queue-type).

### [Queue Properties](./queues#properties) and [Arguments](./queues#optional-arguments)

Since RabbitMQ 3.12 all queues created by the MQTT plugin

* are [durable](./queues#durability), i.e. queue metadata is stored on disk.
* are [exclusive](./queues#exclusive-queues) if the MQTT session lasts as long as the MQTT network connection.
In that case, RabbitMQ will delete all state for the MQTT client - including its queue - when the network connection (and session) ends.
Only the subscribing MQTT client can consume from its queue.
* are not `auto-delete`. For example, if an MQTT client subscribes to a topic and subsequently unsubscribes, the queue will not be deleted.
However, the queue will be deleted when the MQTT session ends.
* have a [Queue TTL](./ttl#queue-ttl) set (queue argument `x-expires`) if the MQTT session expires eventually (i.e. session expiry is not disabled by the RabbitMQ operator, see below) and outlasts the MQTT network connection.
The Queue TTL (in milliseconds) is determined by the minimum of the [Session Expiry Interval](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901048) (in seconds) requested by the MQTT client in the [CONNECT](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901033) packet and the server side configured `mqtt.max_session_expiry_interval_seconds`.

The default value for `mqtt.max_session_expiry_interval_seconds` is 86400 (1 day).
A RabbitMQ operator can force all MQTT sessions to end as soon as their network connections end by setting this parameter to `0`.

A RabbitMQ operator can allow MQTT sessions to last forever by setting this parameter to `infinity`.
This carries a risk: short-lived clients that don't use clean sessions can leave queues and messages behind, which will consume resources and require manual cleanup.

RabbitMQ deletes any state for the MQTT client when the MQTT session ends.
This state includes the client's queue(s) including QoS 0 and QoS 1 messages and the queue bindings (i.e. the client's subscriptions).

### Topic level separator and wildcards

The MQTT protocol specification defines slash ("/") as [topic level separator](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901243) whereas
AMQP 0-9-1 defines a dot (".") as topic level separator. This plugin translates patterns under the hood
to bridge the two.

For example, MQTT topic `cities/london` becomes AMQP 0.9.1 topic `cities.london` and vice versa.
Therefore, when an MQTT client publishes a message with topic `cities/london`, if an AMQP 0.9.1 client wants to receive that message, it should create a binding from its queue
to the topic exchange with binding key `cities.london`.

Vice versa, when an AMQP 0.9.1 client publishes a message with topic `cities.london`, if an MQTT client wants to receive that message, it should create an MQTT subscription with topic filter `cities/london`.

This has one important limitation: MQTT topics that have dots in them won't work as expected and are to be avoided, the same goes for AMQP 0-9-1 routing and binding keys that contains slashes.

Furthermore, MQTT defines the plus sign ("+") as [single-level wildcard](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901245) whereas AMQP 0.9.1
defines the asterisk sign ("*") to match a single word:

| MQTT | AMQP 0.9.1 | Description |
|---|---|---|
| / (slash) | . (dot) | topic level separator |
| + (plus) | * (asterisk) | single-level wildcard (match a single word) |
| # (hash) | # (hash) | multi-level wildcard (match zero or more words) |

## Using Quorum Queues {#quorum-queues}

Using the `mqtt.durable_queue_type` option, it is possible to opt in to use [quorum queues](./quorum-queues) for subscribers whose MQTT session lasts longer than their MQTT network connection.

**This value must only be enabled for new clusters** before any clients declare durable subscriptions.
Since a queue type cannot be changed after declaration, if the value of this setting is changed for an existing cluster, clients with an existing durable state would run into a queue type mismatch error and **fail to subscribe**.

Below is a [rabbitmq.conf](./configure#config-file) example that opts in to use quorum queues:

```ini
# must ONLY be enabled for new clusters before any clients declare durable subscriptions
mqtt.durable_queue_type = quorum
```

Currently, this setting applies to **all** MQTT clients that:

1. subscribe with QoS 1, and
2. connected with a [Session Expiry Interval](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901048) greater than 0 (MQTT 5.0) or set CleanSession to 0 (MQTT 3.1.1)

The second condition means that the MQTT session outlasts the MQTT network connection.

While quorum queues are designed for data safety and predictable efficient recovery
from replica failures, they also have downsides. A quorum queue by definition requires
at least three replicas in the cluster. Therefore quorum queues take longer to declare
and delete, and are not a good fit for environments with [high client connection churn](./networking#dealing-with-high-connection-churn) or
environments with many (hundreds of thousands) subscribers.

Quorum queues are a great fit for a few (hundreds) longer lived clients that actually care a great deal about data safety.

## MQTT QoS 0 queue type {#qos0-queue-type}

The MQTT plugin creates an MQTT QoS 0 queue if the following three conditions are met:

1. [Feature flag](./feature-flags) `rabbit_mqtt_qos0_queue` is enabled.
2. The MQTT client subscribes with QoS 0.
3. The MQTT 5.0 client connects with a [Session Expiry Interval](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901048) of 0, or the MQTT 3.1.1 client connects with CleanSession set to 1.

The third condition means that the MQTT session lasts only as long as the network connection.

The MQTT QoS 0 queue type can be thought of as a “pseudo” or “virtual” queue:
It is very different from the other queue types (classic queues, quorum queues, and streams) in the sense that this new queue type is neither a separate Erlang process nor does it store messages on disk.
Instead, this queue type is a subset of the Erlang process mailbox.
MQTT messages are directly sent to the MQTT connection process of the subscribing client.
In other words, MQTT messages are sent to any “online” MQTT subscribers.

It is more accurate to think of the queue being "skipped".
The fact that sending messages directly to the MQTT connection process is implemented as a queue type is to simplify routing of messages and protocol interoperability,
such that messages can not only be sent from the MQTT publishing connection process, but also from an AMQP 0.9.1 [channel](./channels) process.
The latter enables sending messages from an AMQP 0.9.1, AMQP 1.0 or STOMP client directly to the MQTT subscriber connection process skipping a dedicated queue process.

The benefits of using the MQTT QoS 0 queues type are:

1. Support for larger fanouts, e.g. sending a message from the "cloud" (RabbitMQ) to all devices (MQTT clients).
1. Lower [memory usage](./memory-use)
1. Lower publisher confirm latency
1. Lower end-to-end latency

Because the MQTT QoS 0 queue type has no flow control, MQTT messages might arrive faster in the MQTT connection process mailbox than being delivered from the MQTT connection process to the MQTT subscribing client.
This can happen when the network connection between MQTT subscribing client and RabbitMQ is poor or in a large fan-in scenario where many publishers overload a single MQTT subscribing client.

### Overload protection

To protect against high [memory usage](./memory-use) due to MQTT QoS 0 messages piling up in the MQTT connection process mailbox, RabbitMQ intentionally drops QoS 0 messages from the MQTT QoS 0 queue if both conditions are true:

1. the number of messages in the MQTT connection process mailbox exceeds the configured `mqtt.mailbox_soft_limit` (defaults to 200), and
1. the socket sending to the MQTT client is busy (not sending fast enough due to TCP backpressure).

Note that there can be other messages in the process mailbox (e.g. applications messages sent from the MQTT subscribing client to RabbitMQ or confirmations from another queue type to the MQTT connection process) which are obviously not dropped.
However, these other messages also contribute to the `mqtt.mailbox_soft_limit`.

Setting `mqtt.mailbox_soft_limit` to 0 disables the overload protection mechanism meaning QoS 0 messages are never dropped intentionally by RabbitMQ.
Setting `mqtt.mailbox_soft_limit` to a very high value decreases the likelihood of intentionally dropping QoS 0 messages while increasing the risk of causing a cluster wide memory alarm
(especially if the message payloads are large or if there are many overloaded queues of type `rabbit_mqtt_qos0_queue`).

The `mqtt.mailbox_soft_limit` can be thought of a [queue length limit](./maxlength) (although not precisely because, as mentioned previously, the Erlang process mailbox can contain other messages than MQTT application messages).
This is why the configuration key `mqtt.mailbox_soft_limit` contains the word `soft`.
The described overload protection mechanism corresponds roughly to [overflow behaviour](./maxlength#overflow-behaviour) `drop-head` that exists in classic queues and quorum queues.

The following Prometheus metric reported by a given RabbitMQ node shows how many QoS 0 messages were dropped in total across all queues of type `rabbit_mqtt_qos0_queue` during the lifetime of that node:
```bash
rabbitmq_global_messages_dead_lettered_maxlen_total{queue_type="rabbit_mqtt_qos0_queue",dead_letter_strategy="disabled"} 0
```

The [Native MQTT](/blog/2023/03/21/native-mqtt#new-mqtt-qos-0-queue-type) blog post describes the MQTT QoS 0 queue type in more detail.

## Users and Authentication {#authentication}
MQTT clients will be able to connect provided that they have a set of credentials for an existing user with the appropriate permissions.

For an MQTT connection to succeed, it must successfully authenticate and the user must
have the [appropriate permissions](./access-control) to the virtual host used by the
plugin (see below).

MQTT clients can (and usually do) specify a set of credentials when they connect. The credentials
can be a username and password pair, or a x.509 certificate (see below).

The plugin supports anonymous authentication but its use is highly discouraged and it is a subject
to certain limitations (listed below) enforced for a reasonable level of security
by default.

Users and their permissions can be managed using [rabbitmqctl](./cli), [management UI](./management)
or [HTTP API](./management#http-api).

For example, the following commands create a new user for MQTT connections with full access
to the default [virtual host](./vhosts) used by this plugin:

```bash
# username and password are both "mqtt-test"
rabbitmqctl add_user mqtt-test mqtt-test
rabbitmqctl set_permissions -p "/" mqtt-test ".*" ".*" ".*"
rabbitmqctl set_user_tags mqtt-test management
```

Note that colons may not appear in usernames.

### Local vs. Remote Client Connections {#local-vs-remote}

When an MQTT client provides no login credentials, the plugin uses the
`guest` account by default which will not allow non-`localhost`
connections. When connecting from a remote host, here are the options
that make sure remote clients can successfully connect:

 * Create one or more new user(s), grant them full permissions to the virtual host used by the MQTT plugin and make clients
   that connect from remote hosts use those credentials. This is the recommended option.
 * Set `default_user` and `default_pass` via [plugin configuration](#config) to a non-`guest` user who has the
[appropriate permissions](./access-control).


### Anonymous Connections {#anonymous-connections}

MQTT supports optional authentication (clients may provide no credentials) but RabbitMQ
does not. Therefore a default set of credentials is used for anonymous connections.

The `mqtt.default_user` and `mqtt.default_pass` configuration keys are used to specify
the credentials:

```ini
mqtt.default_user = some-user
mqtt.default_pass = s3kRe7
```

It is possible to disable anonymous connections:

```ini
mqtt.allow_anonymous = false
```

If the `mqtt.allow_anonymous` key is set to `false` then clients **must** provide credentials.

The use of anonymous connections is highly discouraged and it is a subject
to certain limitations (see above) enforced for a reasonable level of security
by default.

## Plugin Configuration {#config}

Here is a sample [configuration](./configure#config-file) that demonstrates a number of MQTT plugin settings:

```ini
mqtt.listeners.tcp.default = 1883
## Default MQTT with TLS port is 8883
# mqtt.listeners.ssl.default = 8883

# anonymous connections, if allowed, will use the default
# credentials specified here
mqtt.allow_anonymous  = true
mqtt.default_user     = guest
mqtt.default_pass     = guest

mqtt.vhost            = /
mqtt.exchange         = amq.topic
mqtt.prefetch         = 10
# 24 hours by default
mqtt.max_session_expiry_interval_seconds = 86400
```

### TCP Listeners {#tcp-listeners}

When no configuration is specified the MQTT plugin will listen on
all interfaces on port 1883 and have a default user login/passcode
of `guest`/`guest`.

To change the listener port, edit your
[Configuration file](./configure#configuration-files),
to contain a `tcp_listeners` variable for the `rabbitmq_mqtt` application.

For example, a minimalistic configuration file which changes the listener
port to 12345 would look like:

```ini
mqtt.listeners.tcp.1 = 12345
```

while one which changes the listener to listen only on localhost (for
both IPv4 and IPv6) would look like:

```ini
mqtt.listeners.tcp.1 = 127.0.0.1:1883
mqtt.listeners.tcp.2 = ::1:1883
```

### TCP Listener Options {#listener-opts}

The plugin supports TCP listener option configuration.

The settings use a common prefix, `mqtt.tcp_listen_options`, and control
things such as TCP buffer sizes, inbound TCP connection queue length, whether [TCP keepalives](./heartbeats#tcp-keepalives)
are enabled and so on. See the [Networking guide](./networking) for details.

```ini
mqtt.listeners.tcp.1 = 127.0.0.1:1883
mqtt.listeners.tcp.2 = ::1:1883

mqtt.tcp_listen_options.backlog = 4096
mqtt.tcp_listen_options.buffer  = 131072
mqtt.tcp_listen_options.recbuf  = 131072
mqtt.tcp_listen_options.sndbuf  = 131072

mqtt.tcp_listen_options.keepalive = true
mqtt.tcp_listen_options.nodelay   = true

mqtt.tcp_listen_options.exit_on_close = true
mqtt.tcp_listen_options.send_timeout  = 120
```

### TLS Support {#tls}

To use TLS for MQTT connections, [TLS must be configured](./ssl) in the broker. To enable
TLS-enabled MQTT connections, add a TLS listener for MQTT using the `mqtt.listeners.ssl.*` configuration keys.

The plugin will use core RabbitMQ server
certificates and key (just like AMQP 0-9-1 and AMQP 1.0 listeners do):

```ini
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert  = true

# default TLS-enabled port for MQTT connections
mqtt.listeners.ssl.default = 8883
mqtt.listeners.tcp.default = 1883
```

Note that RabbitMQ rejects SSLv3 connections by default because that protocol
is known to be compromised.

See the [TLS configuration guide](./ssl) for details.

### Virtual Hosts {#virtual-hosts}

RabbitMQ is a multi-tenant system at the core and every connection belongs
to a virtual host. Some messaging protocols have the concept of vhosts,
others don't. MQTT falls into the latter category. Therefore the MQTT plugin
needs to provide a way to map connections to vhosts.

The `vhost` option controls which RabbitMQ vhost the adapter connects to
by default. The `vhost`
configuration is only consulted if no vhost is provided during connection establishment.
There are several (optional) ways to specify the vhost the client will
connect to.

#### Port to Virtual Host Mapping

First way is mapping MQTT plugin (TCP or TLS) listener ports to vhosts. The mapping
is specified thanks to the `mqtt_port_to_vhost_mapping` [global runtime parameter](./parameters).
Let's take the following plugin configuration:

```ini
mqtt.listeners.tcp.1 = 1883
mqtt.listeners.tcp.2 = 1884

mqtt.listeners.ssl.1 = 8883
mqtt.listeners.ssl.2 = 8884

# (other TLS settings are omitted for brevity)

mqtt.vhost            = /
```

Note the plugin listens on ports 1883, 1884, 8883, and 8884. Imagine you
want clients connecting to ports 1883 and 8883 to connect to the `vhost1` virtual
host, and clients connecting to ports 1884 and 8884 to connect to the `vhost2`
virtual host. A port-to-vhost mapping can be created by setting the
`mqtt_port_to_vhost_mapping` global parameter with `rabbitmqctl`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl set_global_parameter mqtt_port_to_vhost_mapping \
    '{"1883":"vhost1", "8883":"vhost1", "1884":"vhost2", "8884":"vhost2"}'
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat set_global_parameter mqtt_port_to_vhost_mapping ^
    "{""1883"":""vhost1"", ""8883"":""vhost1"", ""1884"":""vhost2"", ""8884"":""vhost2""}"
```
</TabItem>
<TabItem value="HTTP API" label="HTTP API">
```ini
PUT /api/global-parameters/mqtt_port_to_vhost_mapping
# => {"value": {"1883":"vhost1", "8883":"vhost1", "1884":"vhost2", "8884":"vhost2"}}
```
</TabItem>
</Tabs>

If there's no mapping for a given port (because the port cannot be found in
the `mqtt_port_to_vhost_mapping` global parameter JSON document or if the global parameter
isn't set at all), the plugin will try to extract the virtual host from the username
(see below) and will ultimately use the `vhost` plugin config option.

The broker queries the `mqtt_port_to_vhost_mapping` global parameter value at connection time.
If the value changes, connected clients are not notified or disconnected. They need
to reconnect to switch to a new virtual host.

#### Virtual Host as Part of Username

Another and more specific way to specify a vhost while connecting is to prepend the vhost
to the username and to separate with a colon.

For example, connecting with

```ini
/:guest
```

is equivalent to the default vhost and username, while

```
mqtt-vhost:mqtt-username
```

means connecting to the vhost `mqtt-host` with username `mqtt-username`.

Specifying the virtual host in the username takes precedence over the port-to-vhost
mapping specified with the `mqtt_port_to_vhost_mapping` global parameter.


### Authentication with TLS/x509 client certificates {#tls-certificate-authentication}

The plugin can authenticate TLS-enabled connections by extracting
a name from the client's TLS (x509) certificate, without using a password.

For safety the server must be [configured with the TLS options](#tls)
`fail_if_no_peer_cert` set to `true` and `verify` set to `verify_peer`, to
force all TLS clients to have a verifiable client certificate.

To switch this feature on, set `ssl_cert_login` to `true` for the
`rabbitmq_mqtt` application. For example:

```ini
mqtt.ssl_cert_login = true
```

By default this will set the username to an RFC4514-ish string form of
the certificate's subject's Distinguished Name, similar to that
produced by OpenSSL's "-nameopt RFC2253" option.

To use the Common Name instead, add:

```ini
ssl_cert_login_from = common_name
```

to your configuration.

Note that:

* The authenticated user must exist in the configured authentication / authorisation backend(s).
* Clients **must not** supply username and password.

You can optionally specify a virtual host for a client certificate by using the `mqtt_default_vhosts`
[global runtime parameter](./parameters). The value of this global parameter must contain a JSON document that
maps certificates' subject's Distinguished Name to their target virtual host. Let's see how to
map 2 certificates, `O=client,CN=guest` and `O=client,CN=rabbit`, to the `vhost1` and `vhost2`
virtual hosts, respectively.

Global parameters can be set up with using the following methods:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl set_global_parameter mqtt_default_vhosts \
    '{"O=client,CN=guest": "vhost1", "O=client,CN=rabbit": "vhost2"}'
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl set_global_parameter mqtt_default_vhosts ^
    "{""O=client,CN=guest"": ""vhost1"", ""O=client,CN=rabbit"": ""vhost2""}'
```
</TabItem>
<TabItem value="HTTP API" label="HTTP API">
```bash
PUT /api/global-parameters/mqtt_default_vhosts
# => {"value": {"O=client,CN=guest": "vhost1", "O=client,CN=rabbit": "vhost2"}}
```
</TabItem>
</Tabs>


Note that:

* If the virtual host for a certificate cannot be found (because the certificate
subject's DN cannot be found in the `mqtt_default_vhosts` global parameter JSON
document or if the global parameter isn't set at all), the virtual host specified
by the `vhost` plugin config option will be used.
* The broker queries the `mqtt_default_vhosts` global parameter value at connection time.
If the value changes, connected clients are not notified or disconnected. They need
to reconnect to switch to a new virtual host.
* The certificate-to-vhost mapping with the `mqtt_default_vhosts` global parameter
is considered more specific than the port-to-vhost mapping with the `mqtt_port_to_vhost_mapping`
global parameter and so takes precedence over it.


### [Flow Control](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901251) {#flow}

The `prefetch` option controls the maximum number of unacknowledged PUBLISH packets with QoS=1 that will be delivered.
This option is interpreted in the same way as [consumer prefetch](./consumer-prefetch).

An MQTT 5.0 client can define a lower number by setting [Receive Maximum](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901049) in the `CONNECT` packet.

### Custom Exchanges {#custom-exchanges}

The `exchange` option determines which exchange messages from MQTT clients are published to.
The exchange must be created before clients publish any messages. The exchange is expected to be a [topic exchange](/tutorials/amqp-concepts#exchange-topic).

The default topic exchange `amq.topic` is pre-declared: It therefore exists when RabbitMQ is started.


## Retained Messages and Stores {#retained}

The plugin supports retained messages with the limitations described in this section.
The message store implementation is pluggable and the plugin ships with two implementation out of the box:

 * [ETS](https://www.erlang.org/doc/man/ets.html)-based (in memory), implemented in module <code>rabbit_mqtt_retained_msg_store_ets</code>
 * [DETS](https://www.erlang.org/doc/man/dets.html)-based (on disk), implemented in module <code>rabbit_mqtt_retained_msg_store_dets</code>

Both implementations have limitations and trade-offs.
With the first one, the maximum number of messages that can be retained is limited by RAM.
With the second one, there is a limit of 2 GB per vhost. Both are **node-local**:
Retained messages are neither replicated to nor queried from remote cluster nodes.

An example that works is the following: An MQTT Client publishes a retained message to node A with topic `topic/1`.
Thereafter another client subscribes with topic filter `topic/1` on node A.
The new subscriber will receive the retained message.

However, if a client publishes a retained message on node A and another client subsequently subscribes on node B,
that subscribing client will not receive any retained message stored on node A.

Furthermore, if the topic filter contains wildcards (the [multi-level wildcard character](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901244) “#” or the [single-level wildcard character](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901245) “+”), no retained messages are sent.

To configure the store, use the <code>mqtt.retained_message_store</code> configuration key:

```ini
## use DETS (disk-based) store for retained messages
mqtt.retained_message_store = rabbit_mqtt_retained_msg_store_dets
## only used by DETS store (in milliseconds)
mqtt.retained_message_store_dets_sync_interval = 2000
```

The value must be a module that implements the store:

 * <code>rabbit_mqtt_retained_msg_store_ets</code> for RAM-based
 * <code>rabbit_mqtt_retained_msg_store_dets</code> for disk-based (This is the default value.)

These implementations are suitable for development but sometimes won't be for production needs.
The MQTT specification does not define consistency or replication requirements for retained
message stores, therefore RabbitMQ allows for custom ones to meet the consistency and
availability needs of a particular environment. For example, stores based on [Riak](http://basho.com/riak/)
and [Cassandra](http://cassandra.apache.org/) would be suitable for most production environments as
those data stores provide [tunable consistency](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/reference/strong-consistency.md).

Message stores must implement the <code>rabbit_mqtt_retained_msg_store</code> behaviour.

## Metrics {#metrics}

### Prometheus

This plugin emits the Prometheus metrics listed in [Global Counters](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_prometheus/metrics.md#global-counters).

The values for Prometheus label `protocol` are `mqtt310`, `mqtt311`, and `mqtt50` depending on whether the MQTT client uses MQTT 3.1, MQTT 3.1.1, or MQTT 5.0.

The values for Prometheus label `queue_type` are `rabbit_classic_queue`, `rabbit_quorum_queue`, and `rabbit_mqtt_qos0_queue` depending on the queue type the MQTT client consumes from.
(Note that MQTT clients never consume from [streams](./streams) directly although they can publish messages to streams.)

### RabbitMQ Management API

The Management API delivers metrics for MQTT Connections (e.g. network traffic from / to client) and for Classic Queues and Quorum Queues (e.g. how many messages they contain).
However, Management API metrics that are tied to AMQP 0.9.1 [channels](./channels), e.g message rates, are not available since 3.12.

## Performance and Scalability Check List {#scalability}

MQTT is the standard protocol for the Internet of Things (IoT).
A common IoT workload is that many MQTT devices publish sensor data periodically to the MQTT broker.
There could be hundreds of thousands, sometimes even millions of IoT devices that connect to the MQTT broker.
The blog post [Native MQTT](/blog/2023/03/21/native-mqtt) demonstrates performance benchmarks of such workloads.

This section aims at providing a non-exhaustive checklist with tips and tricks to configure RabbitMQ as an efficient MQTT broker that supports many client connections:

1. Set `management_agent.disable_metrics_collector = true` to disable metrics collection in the [Management plugin](./management).
The RabbitMQ Management plugin has not been designed for excessive metrics collection.
In fact, metrics delivery via the management API is [deprecated](/blog/2021/08/21/4.0-deprecation-announcements#disable-metrics-delivery-via-the-management-api--ui). Instead, use a tool that has been designed for collecting and querying a huge number of metrics: Prometheus.
1. MQTT packets and subscriptions with QoS 0 provide much better performance than QoS 1.
Unlike AMQP 0.9.1 and AMQP 1.0, MQTT is not designed to maximise throughput: For example, there are no [multi-acks](./confirms#consumer-acks-multiple-parameter).
Every [PUBLISH](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901100) packet with QoS 1 needs to be acknowledged individually.
1. Decrease TCP buffer sizes as described in section [TCP Listener Options](#listener-opts).

This substantially reduces [memory usage](./memory-use) in environments with many concurrently connected clients.

1. Less topic levels (in an MQTT topic and MQTT topic filter) perform better than more topic levels.
For example, prefer to structure your topic as `city/name` instead of `continent/country/city/name`, if possible.
Each topic level in a topic filter currently creates its own entry in the database used by RabbitMQ.
Therefore, creating and deleting many subscriptions will be faster when there are fewer topic levels.
Also, routing messages with fewer topic levels is faster.
1. In workloads with high subscription churn, increase Mnesia configuration parameter `dump_log_write_threshold` (e.g. `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-mnesia dump_log_write_threshold 20000"`)
1. When connecting many clients, increase the maximum number of Erlang processes (e.g. `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="+P 10000000`)
and the maximum number of open ports (e.g. `ERL_MAX_PORTS=10000000`).
1. Do **not** use [configuration](./configure) or [policy](./parameters) `queue_master_locator = min-masters`.
`min-masters` reads all queue records from RabbitMQ's database to decide on which node to place a classic queue, which becomes expensive for clusters containing many queues.
Note that `queue_master_locator = min-masters` is a default configuration as of rabbitmq/cluster-operator v2.7.0.

Consult the [Networking](./networking) and [Configuration](./configure) guides for more information.

## Proxy Protocol {#proxy-protocol}

The MQTT plugin supports the [proxy protocol](http://www.haproxy.org/download/3.1/doc/proxy-protocol.txt).
This feature is disabled by default, to enable it for MQTT clients:

```ini
mqtt.proxy_protocol = true
```

See the [Networking Guide](./networking#proxy-protocol) for more information
about the proxy protocol.

## Sparkplug Support {#sparkplug-support}

[Sparkplug](https://www.cirrus-link.com/mqtt-sparkplug-tahu/) is a specification
that provides guidance for the design of an MQTT system. In Sparkplug,
MQTT topics must start with `spAvM.N` or `spBvM.N`, where `M` and `N` are integers.
This unfortunately conflicts with the way the RabbitMQ MQTT plugin [translates MQTT
topics into AMQP 0.9.1 routing keys](#implementation).

To solve this, the `sparkplug` configuration entry can be set to `true`:

```ini
mqtt.sparkplug = true
```

When the Sparkplug support is enabled, the MQTT plugin will not translate the
`spAvM.N`/`spBvM.N` part of the names of topics.


## Limitations {#limitations}

### QoS 2 is Not Supported

QoS 2 subscriptions will be treated as if they were QoS 1 subscriptions.

### Overlapping Subscriptions

Overlapping subscriptions from the same client
(e.g. `/sports/football/epl/#` and `/sports/football/#`) can result in
duplicate messages being delivered. Applications
need to account for this.

### Retained Message Stores

See Retained Messages above. Different retained message stores have
different benefits, trade-offs, and limitations.


## Disabling the Plugin {#disabling-plugin}

Before the plugin is disabled on a node, or a node removed from the cluster, it must be decommissioned using [`rabbitmqctl`](./cli):

```bash
rabbitmqctl decommission_mqtt_node <node>;
```

## Retained Messages and Stores {#retained}

The plugin supports retained messages. Message store implementation is pluggable
and the plugin ships with two implementation out of the box:

 * ETS-based (in memory), implemented in the <code>rabbit_mqtt_retained_msg_store_ets</code> module
 * DETS-based (on disk), implemented in the <code>rabbit_mqtt_retained_msg_store_dets</code>

Both implementations have limitations and trade-offs.
With the first one, maximum number of messages that can be retained is limited by RAM.
With the second one, there is a limit of 2 GB per vhost. Both are node-local
(messages retained on one broker node are not replicated to other nodes in the cluster).

To configure the store, use <code>rabbitmq_mqtt.retained_message_store</code> configuration key:

```ini
mqtt.default_user                        = guest
mqtt.default_pass                        = guest
mqtt.allow_anonymous                     = true
mqtt.vhost                               = /
mqtt.exchange                            = amq.topic
mqtt.max_session_expiry_interval_seconds = 1800
mqtt.prefetch                            = 10

## use DETS (disk-based) store for retained messages
mqtt.retained_message_store = rabbit_mqtt_retained_msg_store_dets
## only used by DETS store
mqtt.retained_message_store_dets_sync_interval = 2000

mqtt.listeners.ssl = none
mqtt.listeners.tcp.default = 1883
```

The value must be a module that implements the store:

 * <code>rabbit_mqtt_retained_msg_store_ets</code> for RAM-based
 * <code>rabbit_mqtt_retained_msg_store_dets</code> for disk-based

These implementations are suitable for development but sometimes won't be for production needs.
MQTT 3.1 specification does not define consistency or replication requirements for retained
message stores, therefore RabbitMQ allows for custom ones to meet the consistency and
availability needs of a particular environment. For example, stores based on [Riak](http://basho.com/riak/)
and [Cassandra](http://cassandra.apache.org/) would be suitable for most production environments as
those data stores provide [tunable consistency](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/reference/strong-consistency.md).

Message stores must implement the <code>rabbit_mqtt_retained_msg_store</code> behaviour.
