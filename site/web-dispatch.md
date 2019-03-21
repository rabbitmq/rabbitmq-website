<!--
Copyright (c) 2007-2018 Pivotal Software, Inc.

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

# HTTP Server Configuration for Plugins with HTTP API NOSYNTAX

## <a id="overview" class="anchor" href="#overview">Overview</a>

There are several plugins that expose an HTTP or HTTP-based (WebSockets) API
to clients.

This guide covers various HTTP-specific settings that are applicable
to multiple plugins, e.g. [rabbitmq-management](/management.html), [rabbitmq-web-stomp](/web-stomp.html),
[rabbitmq-web-mqtt](/web-mqtt.html), [rabbitmq-top](https://github.com/rabbitmq/rabbitmq-top), and others.
In this guide these plugins will be referenced as "HTTP API plugins" or "plugins based on the Web dispatch mechanism".

The `rabbitmq-web-dispatch` plugin provides a foundation for such plugins.
It is not a plugin that has to be enabled directly. When a plugin that
provides an HTTP API is enabled, it will enable `rabbitmq-web-dispatch`
as a dependency.

## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

Plugins that are based on the Web dispatch mechanism take a `listener`
configuration item to configure their listening HTTP port. In this
page we will give examples for the `rabbitmq_management` application,
but the same configuration can be applied to `rabbitmq_web_stomp`,
`rabbitmq_web_mqtt`, and other HTTP API plugins.

The `listener` configuration item can contain the following keys:

* `port` (mandatory)
* `ip` (to listen on only one interface)
* `ssl` (to enable TLS/HTTPS)
* `ssl_opts` (to configure TLS options for HTTPS)
* `cowboy_opts` (to configure the embedded HTTP server, [Cowboy](https://ninenines.eu/docs/en/cowboy/2.0/guide/).

### <a id="listener-interface" class="anchor" href="#listener-interfaces">Listening on a Single Interface</a>

Use the `listener.ip` key to specify an interface for Cowboy to bind to. For example:

<pre class="sourcecode ini">
management.listener.port = 15672
management.listener.ip   = 127.0.0.1
</pre>

Or, using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[{rabbitmq_management,
  [{listener, [{port, 15672},
               {ip, "127.0.0.1"}
              ]}
  ]}
].
</pre>

### <a id="https" class="anchor" href="#https">Enabling TLS (HTTPS)</a>

Set `listener.ssl` to `true` to turn on TLS for a listener. Use `listener.ssl_opts` to
specify TLS options. These are named the same as TLS options for other protocols, [see
the RabbitMQ TLS guide](/ssl.html) for more information.

For convenience, if `listener.ssl_opts` are not specified then
 will use the same options as the main RabbitMQ
server does for AMQP 0-9-1 and AMQP 1.0 over TLS except that **client certificate
verification will turned off by default**. To use client certificate
verification, specify `listener.ssl_opts` explicitly.

For example:

<pre class="sourcecode ini">
management.listener.port = 15672
management.listener.ssl  = true

management.listener.ssl_opts.cacertfile = /path/to/cacert.pem
management.listener.ssl_opts.certfile   = /path/to/cert.pem
management.listener.ssl_opts.keyfile    = /path/to/key.pem
</pre>

The same example using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[{rabbitmq_management,
  [{listener, [{port,     15672},
               {ssl,      true},
               {ssl_opts, [{cacertfile, "/path/to/cacert.pem"},
                           {certfile,   "/path/to/cert.pem"},
                           {keyfile,    "/path/to/key.pem"}]}
              ]}
  ]}
].
</pre>

### <a id="advanced-options" class="anchor" href="#advanced-options">Advanced HTTP Server Options</a>

Cowboy provides [a number of options](https://ninenines.eu/docs/en/cowboy/2.0/manual/cowboy_http/)
that can be used to customize the behavior of the server.
They are configured using the `cowboy_opts` listener options.

#### <a id="advanced-options-compression" class="anchor" href="#advanced-options-compression">Response Compression</a>

Response compression is enabled by default when no `listener.cowboy_opts` are configured.

To enable response compression explicitly, set the `listener.cowboy_opts.compress` option to `true`:

<pre class="sourcecode erlang">
[{rabbitmq_management,
  [{listener, [{port,        15672},
               {cowboy_opts, [{compress, true}]}
              ]}
  ]}
].
</pre>

#### <a id="advanced-options-timeouts" class="anchor" href="#advanced-options-timeouts">Client Inactivity Timeouts</a>

Some HTTP API endpoints respond quickly, others may need to return or stream
a sizeable data set to the client (e.g. many thousands of connections) or perform
an operation that takes time proportionally to the input (e.g. [import a large definitions file](http://www.rabbitmq.com/management.html#load-definitions)).
In those cases the amount of time it takes to process the request can exceed certain
timeouts in the Web server as well as HTTP client.

It is possible to bump Cowboy timeouts using the `listener.cowboy_opts.idle_timeout`,
`listener.cowboy_opts.inactivity_timeout`, and `listener.cowboy_opts.request_timeout` options:

<pre class="sourcecode erlang">
[{rabbitmq_management,
  [{listener, [{port,        15672},
               {cowboy_opts, [{compress, true},
                              %% 120 seconds
                              {idle_timeout,      120000},
                              {inactivity_timeout,120000},
                              {request_timeout,   120000}]}
              ]}
  ]}
].
</pre>

All values are in milliseconds and default to `60000` (1 minute). It is recommended that
all timeouts are increased at the same time.
