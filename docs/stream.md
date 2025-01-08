---
title: Stream Plugin
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Stream Plugin

## Overview {#overview}

Streams are a persistent and replicated data structure which models
an append-only log with non-destructive consumer semantics.

This feature is available in all [currently maintained release series](/release-information).

Streams can be used as a regular AMQP 0.9.1 queue or through a
[dedicated binary protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v3.12.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc)
plugin and associated client(s).
Please see the [stream core and stream plugin comparison page](./stream-core-plugin-comparison) for the feature matrix.

This page covers the Stream plugin, which allows to interact with streams using this
[new binary protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v3.12.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc).
For an overview of the concepts and the ways to operate streams, please see the
[guide on RabbitMQ streams](./streams).

:::info

Client libraries for the RabbitMQ stream protocol are available for several popular platforms.
Some of them are listed below. Those marked with a check mark (&#x2713;) are officially supported by the RabbitMQ Core Team

:::

* [&#x2713; RabbitMQ Java Stream Client](https://github.com/rabbitmq/rabbitmq-stream-java-client)
* [&#x2713; RabbitMQ Golang Stream Client](https://github.com/rabbitmq/rabbitmq-stream-go-client)
* [&#x2713; RabbitMQ .NET Stream Client](https://github.com/rabbitmq/rabbitmq-stream-dotnet-client)
* [&#x2713; RabbitMQ Rust Stream Client](https://github.com/rabbitmq/rabbitmq-stream-rust-client)
* [&#x2713; RabbitMQ Python Stream Client (rstream)](https://pypi.org/project/rstream/)
* [RabbitMQ Python Stream Client (rbfly)](https://gitlab.com/wrobell/rbfly)
* [RabbitMQ NodeJS Stream Client](https://github.com/coders51/rabbitmq-stream-js-client)
* [RabbitMQ C++ Stream Client](https://github.com/coveooss/hareflow)
* [RabbitMQ C Stream Client ](https://github.com/GianfrancoGGL/rabbitmq-stream-c-client)
* [RabbitMQ Elixir Stream Client ](https://github.com/VictorGaiva/rabbitmq-stream)
* [RabbitMQ Erlang Stream Client (lake)](https://gitlab.com/evnu/lake)

Use [Stream PerfTest](https://github.com/rabbitmq/rabbitmq-stream-perf-test) to simulate workloads and measure the performance of your RabbitMQ stream system.

## Enabling the Plugin {#enabling-plugin}

The Stream plugin is included in the RabbitMQ distribution. Before clients can successfully
connect, it must be enabled using [rabbitmq-plugins](./cli):

```bash
rabbitmq-plugins enable rabbitmq_stream
```

## Plugin Configuration {#configuration}

### TCP Listeners {#tcp-listeners}

When no configuration is specified the Stream Adapter will listen on
all interfaces on port 5552 and have a default user login/passcode
of `guest`/`guest`.

The port stream listener will listen on can be changed
via [`rabbitmq.conf`](./configure#configuration-files).

Below is a minimalistic configuration file which changes the listener
port to 12345:

```ini
stream.listeners.tcp.1 = 12345
```

while one which changes the listener to listen only on localhost (for
both IPv4 and IPv6) would look like:

```ini
stream.listeners.tcp.1 = 127.0.0.1:5552
stream.listeners.tcp.2 = ::1:5552
```

### TCP Listener Options {#tcp-listeners-options}

The plugin supports TCP listener option configuration.

The settings use a common prefix, `stream.tcp_listen_options`, and control
things such as TCP buffer sizes, inbound TCP connection queue length, whether [TCP keepalives](./heartbeats#tcp-keepalives)
are enabled and so on. See the [Networking guide](./networking) for details.

```ini
stream.listeners.tcp.1 = 127.0.0.1:5552
stream.listeners.tcp.2 = ::1:5552

stream.tcp_listen_options.backlog = 4096
stream.tcp_listen_options.recbuf  = 131072
stream.tcp_listen_options.sndbuf  = 131072

stream.tcp_listen_options.keepalive = true
stream.tcp_listen_options.nodelay   = true

stream.tcp_listen_options.exit_on_close = true
stream.tcp_listen_options.send_timeout  = 120
```

### Heartbeat Timeout {#heartbeats}

The `heartbeat timeout` value defines after what period of time
the peer TCP connection should be considered unreachable (down) by RabbitMQ
and client libraries.

A [similar mechanism](./heartbeats) is used by the messaging protocols that RabbitMQ supports.

The default value for stream protocol connections is 60 seconds.

```ini
# use a lower heartbeat timeout value
stream.heartbeat = 20
```

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

### Flow Control {#flow-control}

Fast publishers can overwhelm the broker if it cannot keep up writing and replicating inbound messages.
So each connection has a maximum number of outstanding unconfirmed messages allowed before being blocked (`initial_credits`, defaults to 50,000).
The connection is unblocked when a given number of messages is confirmed (`credits_required_for_unblocking`, defaults to 12,500).
You can change those values according to your workload:

```ini
stream.initial_credits = 100000
stream.credits_required_for_unblocking = 25000
```

High values for these settings can improve publishing throughput at the cost of higher memory consumption (which can lead to a broker crash).
Low values can help to cope with a lot of moderately fast-publishing connections.

This setting applies only to **publishers**, it does not apply to consumers.

### Consumer Credit Flow {#consumer-credit-flow}

This section covers the stream protocol credit flow mechanism that allows consumers to control how the broker dispatches messages.

A consumer provides an initial number of credits when it creates its [subscription](https://github.com/rabbitmq/rabbitmq-server/blob/v3.12.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc#subscribe).
A credit represents a *chunk* of messages that the broker is allowed to send to the consumer.

A *chunk* is a batch of messages.
This is the storage and transportation unit used in RabbitMQ Stream, that is messages are stored contiguously in a chunk and they are [delivered](https://github.com/rabbitmq/rabbitmq-server/blob/v3.12.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc#deliver) as part of a chunk.
A chunk can be made of one to several thousands of messages, depending on the ingress.

So if a consumer creates a subscription with 5 initial credits, the broker will send 5 chunks of messages.
The broker substracts a credit every time it delivers a chunk.
When there is no credit left for a subscription, the broker stops sending messages.
So in our example the broker will stop sending messages for this subscription after it delivers 5 chunks.
This is not what we usually want, so the consumer can provide [credits](https://github.com/rabbitmq/rabbitmq-server/blob/v3.12.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc#credit) to its subscription to get more messages.


This is up to the consumer (i.e. client library and/or application) to provide credits, depending on how fast it processes messages.
We want messages to flow continuously, so a good rule of thumb is to create the subscription with at least 2 credits and provide a credit on each new chunk of messages.
By doing so there should always be some messages flowing on the network and the consumer should be busy all the time, not idle.

Consumers get to choose how the broker delivers messages to them with this credit flow mechanism.
This helps avoiding overwhelmed or idle consumers.
How consumer credit flow is exposed to applications depends on the client library, there is no server-side setting to change its behavior.

### Advertised Host and Port {#advertised-host-port}

The stream protocol allows to discover the topology of streams, that is where the leader and replicas for a given
set of streams are located in the cluster. This way the client can choose to connect to the appropriate node
to interact with the streams: the leader node to publish, a replica to consume. By default, nodes return their
hostname and listener port, which may be fine for most situations, but not always (proxy sitting between the cluster
nodes and the clients, cluster nodes and/or clients running in containers, etc).

The `advertised_host` and `advertised_port` keys allow to specify which information a broker node returns when asked
the topology of streams. One can set those settings according to their infrastructure, so that clients can connect
to cluster nodes:

```ini
stream.advertised_host = rabbitmq-1
stream.advertised_port = 12345
```

The [Connecting to Streams](/blog/2021/07/23/connecting-to-streams) blog post covers why the `advertised_host` and `advertised_port` settings are necessary in some deployments.


### Maximum Frame Size {#frame-size}

RabbitMQ Stream protocol uses a maximum frame size limit. The default is 1 MiB and the value
can be increased if necessary:

```ini
# in bytes
stream.frame_max = 2097152
```


## TLS Support {#tls}

To use TLS for stream connections, [TLS must be configured](./ssl) in the broker. To enable
TLS-enabled stream connections, add a TLS listener for streams using the `stream.listeners.ssl.*` configuration keys.

The plugin will use core RabbitMQ server
certificates and key (just like AMQP 0-9-1 and AMQP 1.0 listeners do):

```ini
ssl_options.cacertfile = /path/to/tls/ca_certificate.pem
ssl_options.certfile   = /path/to/tls/server_certificate.pem
ssl_options.keyfile    = /path/to/tls/server_key.pem
ssl_options.verify     =  verify_peer
ssl_options.fail_if_no_peer_cert = true

stream.listeners.tcp.1 = 5552
# default TLS-enabled port for stream connections
stream.listeners.ssl.1 = 5551
```

This configuration creates a standard TCP listener on port 5552 and
a TLS listener on port 5551.

When a TLS listener is set up, you may want to deactivate all non-TLS ones.
This can be configured like so:

```ini
stream.listeners.tcp   = none
stream.listeners.ssl.1 = 5551
```

Just like for [plain connections](#advertised-host-port), it is possible to configure advertised TLS host and port.
When TLS is used, the plugin returns the following metadata:

* hostname: if set, the `advertised_host`, or the hostname if `advertised_host` is not set
* port: the current TLS port

It is possible to override this behavior by setting together or individually the `advertised_tls_host` and `advertised_tls_port` configuration entries:

```ini
stream.advertised_host = private-rabbitmq-1
stream.advertised_port = 12345
stream.advertised_tls_host = public-rabbitmq-1
stream.advertised_tls_port = 12344
```
