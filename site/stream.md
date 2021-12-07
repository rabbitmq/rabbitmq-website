<!--
Copyright (c) 2007-2021 VMware, Inc. or its affiliates.

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

# Stream Plugin NOSYNTAX

## <a id="overview" class="anchor" href="#overview">Overview</a>

Streams are a new persistent and replicated data structure _in RabbitMQ 3.9_ which models
an append-only log with non-destructive consumer semantics.
They can be used as a regular AMQP 0.9.1 queue or through a
[dedicated binary protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v3.9.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc)
plugin and associated client(s).

This page covers the Stream plugin, which allows to interact with streams using this
[new binary protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v3.9.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc).
For an overview of the concepts and the ways to operate streams, please see the
[guide on RabbitMQ streams](streams.html).

The current known client libraries for the stream protocol are the
[RabbitMQ Stream Java Client](https://github.com/rabbitmq/rabbitmq-stream-java-client)
and the [RabbitMQ Stream Go Client](https://github.com/rabbitmq/rabbitmq-stream-go-client).

## <a id="enabling-plugin" class="anchor" href="#enabling-plugin">Enabling the Plugin</a>

The Stream plugin is included in the RabbitMQ distribution. Before clients can successfully
connect, it must be enabled using [rabbitmq-plugins](/cli.html):

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_stream
</pre>

## <a id="configuration" class="anchor" href="#configuration">Plugin Configuration</a>

### <a id="tcp-listeners" class="anchor" href="#tcp-listeners">TCP Listeners</a>

When no configuration is specified the Stream Adapter will listen on
all interfaces on port 5552 and have a default user login/passcode
of `guest`/`guest`.

To change this, edit your
[Configuration file](/configure.html#configuration-files),
to contain a `tcp_listeners` variable for the `rabbitmq_stream` application.

For example, a minimalistic configuration file which changes the listener
port to 12345 would look like:

<pre class="lang-ini">
stream.listeners.tcp.1 = 12345
</pre>

while one which changes the listener to listen only on localhost (for
both IPv4 and IPv6) would look like:

<pre class="lang-ini">
stream.listeners.tcp.1 = 127.0.0.1:5552
stream.listeners.tcp.2 = ::1:5552
</pre>

### <a id="tcp-listeners-options" class="anchor" href="#tcp-listeners-options">TCP Listener Options</a>

The plugin supports TCP listener option configuration.

The settings use a common prefix, `stream.tcp_listen_options`, and control
things such as TCP buffer sizes, inbound TCP connection queue length, whether [TCP keepalives](/heartbeats.html#tcp-keepalives)
are enabled and so on. See the [Networking guide](/networking.html) for details.

<pre class="lang-ini">
stream.listeners.tcp.1 = 127.0.0.1:5552
stream.listeners.tcp.2 = ::1:5552

stream.tcp_listen_options.backlog = 4096
stream.tcp_listen_options.recbuf  = 131072
stream.tcp_listen_options.sndbuf  = 131072

stream.tcp_listen_options.keepalive = true
stream.tcp_listen_options.nodelay   = true

stream.tcp_listen_options.exit_on_close = true
stream.tcp_listen_options.send_timeout  = 120
</pre>

### <a id="protocol" class="anchor" href="#protocol">Protocol</a>

It is possible to set the maximum size of frames (default is 1 MiB) and the heartbeat (default is
60 seconds), if needed:

<pre class="lang-ini">
stream.frame_max = 2097152 # in bytes
stream.heartbeat = 120 # in seconds
</pre>

### <a id="flow-control" class="anchor" href="#flow-control">Flow Control</a>

Fast publishers can overwhelm the broker if it cannot keep up writing and replicating inbound messages.
So each connection has a maximum number of outstanding unconfirmed messages allowed before being blocked
(`initial_credits`, defaults to 50,000). The connection is unblocked when a given number of messages
is confirmed (`credits_required_for_unblocking`, defaults to 12,500). You can change those values
according to your workload:

<pre class="lang-ini">
stream.initial_credits = 100000
stream.credits_required_for_unblocking = 25000
</pre>

High values for these settings can improve publishing throughput at the cost of higher memory consumption
(which can finally make the broker crash). Low values can help to cope with a lot of moderately fast-publishing
connections.

### <a id="advertised-host-port" class="anchor" href="#advertised-host-port">Advertised Host and Port</a>

The stream protocol allows to discover the topology of streams, that is where the leader and replicas for a given
set of streams are located in the cluster. This way the client can choose to connect to the appropriate node
to interact with the streams: the leader node to publish, a replica to consume. By default, nodes return their
hostname and listener port, which may be fine for most situations, but not always (proxy sitting between the cluster
nodes and the clients, cluster nodes and/or clients running in containers, etc).

The `advertised_host` and `advertised_port` keys allow to specify which information a broker node returns when asked
the topology of streams. One can set those settings according to their infrastructure, so that clients can connect
to cluster nodes:

<pre class="lang-ini">
stream.advertised_host = rabbitmq-1
stream.advertised_port = 12345
</pre>

The [Connecting to Streams](https://blog.rabbitmq.com/posts/2021/07/connecting-to-streams/) blog post covers why the `advertised_host` and `advertised_port` settings are necessary in some deployments.

## <a id="tls" class="anchor" href="#tls">TLS Support</a>

To use TLS for stream connections, [TLS must be configured](/ssl.html) in the broker. To enable
TLS-enabled stream connections, add a TLS listener for streams using the `stream.listeners.ssl.*` configuration keys.

The plugin will use core RabbitMQ server
certificates and key (just like AMQP 0-9-1 and AMQP 1.0 listeners do):

<pre class="lang-ini">
ssl_options.cacertfile = /path/to/tls/ca_certificate.pem
ssl_options.certfile   = /path/to/tls/server_certificate.pem
ssl_options.keyfile    = /path/to/tls/server_key.pem
ssl_options.verify     =  verify_peer
ssl_options.fail_if_no_peer_cert = true

stream.listeners.tcp.1 = 5552
# default TLS-enabled port for stream connections
stream.listeners.ssl.1 = 5551
</pre>

This configuration creates a standard TCP listener on port 5552 and
a TLS listener on port 5551.

When a TLS listener is set up it may be desired to disable all non-TLS ones.
This can be configured like so:

<pre class="lang-ini">
stream.listeners.tcp   = none
stream.listeners.ssl.1 = 5551
</pre>

Just like for [plain connections](#advertised-host-port), it is possible to configure advertised TLS host and port.
When TLS is used, the plugin returns the following metadata:

* hostname: if set, the `advertised_host`, or the hostname if `advertised_host` is not set
* port: the current TLS port

It is possible to override this behavior by setting together or individually the `advertised_tls_host` and `advertised_tls_port` configuration entries:

<pre class="lang-ini">
stream.advertised_host = private-rabbitmq-1
stream.advertised_port = 12345
stream.advertised_tls_host = public-rabbitmq-1
stream.advertised_tls_port = 12344
</pre>
