<!--
Copyright (c) 2007-2020 VMware, Inc. or its affiliates.

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

Streams are a new persistent and replicated data structure in RabbitMQ which models
an append-only log with non-destructive consumer semantics.
They can be used as a regular AMQP 0.9.1 queue or through a new binary protocol
plugin and associated client(s).

This page covers the Stream plugin, which allows to interact with streams using this new binary protocol.
For an overview of the concepts and the ways to operate streams, please see the
[streams page](streams.html).

## <a id="enabling-plugin" class="anchor" href="#enabling-plugin">Enabling the Plugin</a>

The Stream plugin is included in the RabbitMQ distribution. Before clients can successfully
connect, it must be enabled using [rabbitmq-plugins](/cli.html):

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_stream
</pre>

## <a id="configuration" class="anchor" href="#configuration">Plugin Configuration</a>

### <a id="tcp-listeners" class="anchor" href="#tcp-listeners">TCP Listeners</a>

When no configuration is specified the Stream Adapter will listen on
all interfaces on port 5555 and have a default user login/passcode
of `guest`/`guest`.

To change this, edit your
[Configuration file](/configure.html#configuration-file),
to contain a `tcp_listeners` variable for the `rabbitmq_stream` application.

For example, a minimalistic configuration file which changes the listener
port to 12345 would look like:

<pre class="lang-ini">
stream.listeners.tcp.1 = 12345
</pre>

while one which changes the listener to listen only on localhost (for
both IPv4 and IPv6) would look like:

<pre class="lang-ini">
stream.listeners.tcp.1 = 127.0.0.1:61613
stream.listeners.tcp.2 = ::1:61613
</pre>

### TCP Listener Options

The plugin supports TCP listener option configuration.

The settings use a common prefix, `stream.tcp_listen_options`, and control
things such as TCP buffer sizes, inbound TCP connection queue length, whether [TCP keepalives](/heartbeats.html#tcp-keepalives)
are enabled and so on. See the [Networking guide](/networking.html) for details.

<pre class="lang-ini">
stream.listeners.tcp.1 = 127.0.0.1:61613
stream.listeners.tcp.2 = ::1:61613

stream.tcp_listen_options.backlog = 4096
stream.tcp_listen_options.recbuf  = 131072
stream.tcp_listen_options.sndbuf  = 131072

stream.tcp_listen_options.keepalive = true
stream.tcp_listen_options.nodelay   = true

stream.tcp_listen_options.exit_on_close = true
stream.tcp_listen_options.send_timeout  = 120
</pre>