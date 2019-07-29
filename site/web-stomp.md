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
# RabbitMQ Web STOMP Plugin NOSYNTAX

The Web STOMP plugin makes it possible to use
[STOMP](/stomp.html) over a WebSocket connection.

The goal of this plugin is to enable STOMP messaging in Web applications.

A similar plugin, [Web MQTT plugin](/web-mqtt.html), makes it possible to use [MQTT](/mqtt.html) over
WebSockets.

## How It Works

RabbitMQ Web STOMP plugin is rather simple. It takes the STOMP protocol,
as provided by [RabbitMQ STOMP plugin](/stomp.html) and exposes it using
WebSockets.

RabbitMQ Web STOMP is fully compatible with the [RabbitMQ STOMP](/stomp.html) plugin.

## Enabling the Plugin

`rabbitmq_web_stomp` plugin ships with RabbitMQ.

To enable the plugin run [rabbitmq-plugins](/man/rabbitmq-plugins.8.man.html):

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_web_stomp
</pre>

## Usage

In order to use STOMP in a Web browser context, a JavaScript STOMP
library is required. We've tested a
[stomp-websocket](https://github.com/jmesnil/stomp-websocket/) library
by [Jeff Mesnil](https://github.com/jmesnil) and
[Jeff Lindsay](https://github.com/progrium).
[This library](https://github.com/rabbitmq/rabbitmq-web-stomp-examples/blob/master/priv/stomp.js)
is included as part of [RabbitMQ Web STOMP examples](https://github.com/rabbitmq/rabbitmq-web-stomp-examples).

The WebSocket endpoint is available on the `/ws` path:

<pre class="sourcecode">
http://127.0.0.1:15674/ws
</pre>

This endpoint will only work with Websocket capable clients. Note that
some configuration is necessary in order to accept binary messages.

In order to establish connection from the browser using WebSocket
you may use code like:

<pre class="lang-html">
&lt;!-- include the client library --&gt;
&lt;script src=stomp.js"&gt;&lt;/script&gt;
</pre>

<pre class="lang-javascript">
&lt;script&gt;
var ws = new WebSocket('ws://127.0.0.1:15674/ws');
var client = Stomp.over(ws);
[...]
</pre>

Once you have the `client` object you can follow API's exposed by
stomp.js library. The next step is usually to establish a STOMP
connection with the broker:

<pre class="lang-javascript">
[...]
var on_connect = function() {
    console.log('connected');
};
var on_error =  function() {
    console.log('error');
};
client.connect('guest', 'guest', on_connect, on_error, '/');
[...]
</pre>

## Web STOMP Examples

A few simple Web STOMP examples are provided as a
[RabbitMQ Web STOMP examples](https://github.com/rabbitmq/rabbitmq-web-stomp-examples)
plugin. To get it running follow the installation instructions for that plugin
and enable the plugin:

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_web_stomp_examples
</pre>

The examples will be available under
[http://127.0.0.1:15670/](http://127.0.0.1:15670/) url. You will see two examples:

 * "echo" - shows how to use STOMP to do simple message broadcasting
 * "bunny" - example of a simple collaboration canvas painting app

We encourage you to take a look [at the source code](https://github.com/rabbitmq/rabbitmq-web-stomp-examples/tree/master/priv).

## Configuration

When no configuration is specified the Web STOMP plugin will listen on
all interfaces on port 15674 and have a default user login/passcode of
`guest`/`guest`. Note that this user is only [allowed to connect from localhost](/access-control.html) by default.
We highly recommend creating a separate user production systems.

To change this, edit your
[Advanced configuration file](/configure.html#configuration-file),
to contain a `tcp_config` section with a `port` variable for the `rabbitmq_web_stomp` application.

For example, a complete configuration file which changes the listener
port to 12345 would look like:

<pre class="lang-ini">
web_stomp.tcp.port = 12345
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="lang-erlang">
[
  {rabbitmq_web_stomp,
      [{tcp_config, [{port, 12345}]}]}
].
</pre>

You can use the `tcp_config` section to specify any TCP option you need.
See the [RabbitMQ Networking guide](/networking.html) and [Ranch documentation](https://ninenines.eu/docs/en/ranch/1.3/manual/ranch_tcp/)
for details about accepted parameters.


### TLS (SSL)

The plugin supports WebSockets with TLS (WSS) connections. See [TLS guide](/ssl.html)
to learn more about TLS support in RabbitMQ.

TLS configuration parameters are provided in the `web_stomp.ssl` section:

<pre class="lang-ini">
web_stomp.ssl.port       = 15673
web_stomp.ssl.backlog    = 1024
web_stomp.ssl.cacertfile = /path/to/ca_certificate.pem
web_stomp.ssl.certfile   = /path/to/server_certificate.pem
web_stomp.ssl.keyfile    = /path/to/server_key.pem
web_stomp.ssl.password   = changeme
</pre>

In the <a href="/configure.html#erlang-term-config-file">classic config format</a> the
section is `rabbitmq_web_stomp.ssl_config`:

<pre class="lang-erlang">
[
  {rabbitmq_web_stomp,
      [{ssl_config, [{port,       15673},
                     {backlog,    1024},
                     {cacertfile, "/path/to/ca_certificate.pem"},
                     {certfile,   "/path/to/server_certificate.pem"},
                     {keyfile,    "/path/to/server_key.pem"},
                     %% needed when private key has a passphrase
                     {password,   "changeme"}]}]}
].
</pre>

The TLS listener port, server certificate file, private key and CA certificate bundle are mandatory options.
Password is also mandatory if the private key uses one.
An extended list of TLS settings is largely identical to those [for the core server](/ssl.html).
Full list of options accepted by this plugin can be found in [Ranch documentation](https://ninenines.eu/docs/en/ranch/1.7/manual/ranch_ssl/).

A separate guide on [troubleshooting TLS](/troubleshooting-ssl.html) is also available.


## Basic HTTP Authentication

The `use_http_auth` option extends the authentication by
allowing clients to send the login and passcode in the
HTTP authorisation header (using HTTP Basic Auth). If
present, these credentials will be used. Otherwise, the
default STOMP credentials are used. The credentials found
in the CONNECT frame, if any, are ignored.

This is an advanced feature that is only exposed via the [advanced configuration file](/configure.html#configuration-file)
or the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="lang-erlang">
[
  {rabbitmq_web_stomp,
      [{use_http_auth, true}]}
].
</pre>

## <a id="proxy-protocol" class="anchor" href="#proxy-protocol">Proxy Protocol</a>

The Web STOMP plugin supports the [proxy protocol](http://www.haproxy.org/download/1.8/doc/proxy-protocol.txt).
This feature is disabled by default, to enable it for clients:

<pre class="lang-ini">
web_stomp.proxy_protocol = true
</pre>

Or, using the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
  {rabbitmq_web_stomp, [{proxy_protocol, true}]}
].
</pre>

See the [Networking Guide](/networking.html#proxy-protocol) for more information
about the proxy protocol.

## <a id="advanced-options" class="anchor" href="#advanced-options">Advanced Options</a>

The Web STOMP plugin uses the Cowboy HTTP and WebSocket server under the hood.  Cowboy
provides [a number of options](https://ninenines.eu/docs/en/cowboy/2.4/manual/cowboy_http/)
that can be used to customize the behavior of the server
w.r.t. WebSocket connection handling.

Some settings are generic HTTP ones, others are specific to WebSockets.

### Content Encoding

By default, the Web STOMP plugin will expect to handle messages
encoded as UTF-8. The WebSocket endpoint exposed by this plugin can be switched to binary mode if needed
using the `ws_frame` option:

<pre class="lang-ini">
web_stomp.ws_frame = binary
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="lang-erlang">
[
  {rabbitmq_web_stomp, [{ws_frame, binary}]}
].
</pre>

### HTTP Options

Generic HTTP server settings can be specified using `web_stomp.cowboy_opts.*` keys,
for example:

<pre class="lang-ini">
# connection inactivity timeout
web_stomp.cowboy_opts.idle_timeout = 60000
# max number of pending requests allowed on a connection
web_stomp.cowboy_opts.max_keepalive = 200
# max number of headers in a request
web_stomp.cowboy_opts.max_headers   = 100
# max number of empty lines before request body
web_stomp.cowboy_opts.max_empty_lines = 5
# max request line length allowed in requests
web_stomp.cowboy_opts.max_request_line_length
</pre>

In the classic config format:

<pre class="lang-erlang">
[
  {rabbitmq_web_stomp,
      [
        {cowboy_opts, [{max_keepalive, 200},
                       {max_headers,   100}]}
      ]
  }
].
</pre>


### WebSocket Options

<pre class="lang-ini">
# WebSocket traffic compression is enabled by default
web_stomp.ws_opts.compress = true

# WebSocket connection inactivity timeout
web_stomp.ws_opts.idle_timeout

web_stomp.ws_opts.max_frame_size = 50000
</pre>

In the classic config format:

<pre class="lang-erlang">
[
  {rabbitmq_web_stomp,
      [
        {cowboy_ws_opts, [{compress,       true},
                          {idle_timeout,   60000},
                          {max_frame_size, 50000}]}
      ]
  }
].
</pre>
