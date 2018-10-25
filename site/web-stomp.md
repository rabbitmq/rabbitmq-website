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

Since version `3.7` support for SockJS websocket emulation was removed.

## Enabling the Plugin

`rabbitmq_web_stomp` plugin ships with RabbitMQ.

To enable the plugin run [rabbitmq-plugins](/man/rabbitmq-plugins.8.man.html):

<pre class="sourcecode bash">
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

<pre class="sourcecode html">
&lt;!-- include the client library --&gt;
&lt;script src=stomp.js"&gt;&lt;/script&gt;
</pre>

<pre class="sourcecode javascript">
&lt;script&gt;
var ws = new WebSocket('ws://127.0.0.1:15674/ws');
var client = Stomp.over(ws);
[...]
</pre>

Once you have the `client` object you can follow API's exposed by
stomp.js library. The next step is usually to establish a STOMP
connection with the broker:

<pre class="sourcecode javascript">
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

<pre class="sourcecode bash">
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

<pre class="sourcecode ini">
web_stomp.port = 12345
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_stomp,
      [{tcp_config, [{port, 12345}]}]}
].
</pre>

You can use the `tcp_config` section to specify any TCP option you need.
See the [RabbitMQ Networking guide](/networking.html) and [Ranch documentation](https://ninenines.eu/docs/en/ranch/1.3/manual/ranch_tcp/)
for details about accepted parameters.


### TLS (SSL)

The plugin supports WebSockets with TLS (WSS) connections. That requires
Erlang/OTP 17.5 or a later version.

TLS (SSL) configuration parameters are provided in the `ssl_config` section:

<pre class="sourcecode ini">
web_stomp.ssl.port       = 12345
web_stomp.ssl.backlog    = 1024
web_stomp.ssl.certfile   = path/to/certs/client/cert.pem
web_stomp.ssl.keyfile    = path/to/certs/client/key.pem
web_stomp.ssl.cacertfile = path/to/certs/testca/cacert.pem
web_stomp.ssl.password   = changeme
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_stomp,
      [{ssl_config, [{port,       15671},
                     {backlog,    1024},
                     {certfile,   "path/to/certs/client/cert.pem"},
                     {keyfile,    "path/to/certs/client/key.pem"},
                     {cacertfile, "path/to/certs/testca/cacert.pem"},
                     %% needed when private key has a passphrase
                     {password,   "changeme"}]}]}
].
</pre>

Note that port, certfile, keyfile and password are all mandatory.
See the [TLS guide](/ssl.html) and [Ranch documentation](https://ninenines.eu/docs/en/ranch/1.3/manual/ranch_ssl/)
for details about accepted parameters.

A separate guide on [TLS Troubleshooting](/troubleshooting-ssl.html) is also available.

## WebSocket Options and Content Encoding

By default, the Web STOMP plugin will expect to handle messages
encoded as UTF-8. You can switch the WebSocket endpoint to binary if needed.
The `ws_frame` option serves this purpose:

<pre class="sourcecode ini">
web_stomp.ws_frame = binary
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_stomp, [{ws_frame, binary}]}
].
</pre>

The Web STOMP plugin uses the Cowboy web server under the hood.
Cowboy provides [a number of
options](https://ninenines.eu/docs/en/cowboy/1.0/manual/cowboy_protocol/)
that can be used to customize the behavior of the server
w.r.t. WebSocket connection handling. You can specify those in the Web
STOMP plugin configuration, in the `cowboy_opts` section:

<pre class="sourcecode ini">
web_stomp.cowboy_opts.max_keepalive = 10
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_stomp,
      [{cowboy_opts, [{max_keepalive, 10}]}]}
].
</pre>

## Basic HTTP Authentication

The `use_http_auth` option extends the authentication by
allowing clients to send the login and passcode in the
HTTP Authorization header (using HTTP Basic Auth). If
present, these credentials will be used. Otherwise, the
default STOMP credentials are used. The credentials found
in the CONNECT frame, if any, are ignored.

This is an advanced feature that is only exposed via the [advanced configuration file](/configure.html#configuration-file)
or the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_stomp,
      [{use_http_auth, true}]}
].
</pre>

## Missing features

RabbitMQ Web STOMP is fully compatible with the
[RabbitMQ STOMP](/stomp.html) plugin.
