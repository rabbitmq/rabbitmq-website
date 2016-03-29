<!--
Copyright (c) 2007-2016 Pivotal Software, Inc.

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
# RabbitMQ Web-Stomp Plugin NOSYNTAX

The Web-Stomp plugin is a simple bridge exposing the
[STOMP](http://stomp.github.com) protocol over direct or emulated
[HTML5 WebSockets](https://en.wikipedia.org/wiki/WebSockets).

The main intention of Web-Stomp is to make it possible to use RabbitMQ
from web browsers.

More context is available in
[the introductory blog post](http://www.rabbitmq.com/blog/2012/05/14/introducing-rabbitmq-web-stomp/).

## <a id="rationale"/>What it actually does

RabbitMQ Web-Stomp plugin is rather simple. It takes the STOMP protocol,
as provided by [RabbitMQ-STOMP plugin](/stomp.html) and exposes it using
either plain WebSockets or [a SockJS server](http://sockjs.org).

SockJS is a WebSockets poly-fill that provides a WebSocket-like
JavaScript object in any browser. It will therefore work in older
browsers that don't have native WebSocket support, as well as in new
browsers that are behind WebSocket-unfriendly proxies.


## <a id="iws"/>Installing Web-Stomp
To enable the plugin run [rabbitmq-plugins](/man/rabbitmq-plugins.1.man.html):

    rabbitmq-plugins enable rabbitmq_web_stomp

## <a id="usage"/>Usage

In order to use STOMP in a web-browser context, a JavaScript STOMP
library is required. We've tested a
[stomp-websocket](https://github.com/jmesnil/stomp-websocket/) library
by [Jeff Mesnil](https://github.com/jmesnil) and
[Jeff Lindsay](https://github.com/progrium).
[This library](https://github.com/rabbitmq/rabbitmq-web-stomp-examples/blob/master/priv/stomp.js)
is included as part of RabbitMQ Web STOMP examples.

By default the Web STOMP plugin exposes both a WebSocket and a
SockJS endpoint on port 15674. The WebSocket endpoint is available
on the `/ws` path:

    http://127.0.0.1:15674/ws

The SockJS endpoint on the `/stomp` prefix:

    http://127.0.0.1:15674/stomp

The SockJS endpoint is provided for compatibility purposes with
older browsers that do not implement Websocket. It has two
limitations because of SockJS:

 *  Stomp heart-beats are disabled
 *  Messages must be encoded using UTF-8

The raw Websocket endpoint was created to provide an alternative
that does not have these limitations. On the other hand, this
endpoint will only work with Websocket capable clients. Note that
some configuration is necessary in order to accept binary messages.

In order to establish connection from the browser using WebSocket
you may use code like:

    <script src="stomp.js"></script>
    <script>

        var ws = new WebSocket('ws://127.0.0.1:15674/ws');
        var client = Stomp.over(ws);
        [...]

Using SockJS:

    <script src="http://cdn.sockjs.org/sockjs-0.3.min.js"></script>
    <script src="stomp.js"></script>
    <script>

        var ws = new SockJS('http://127.0.0.1:15674/stomp');
        var client = Stomp.over(ws);
        [...]

Once you have the `client` object you can follow API's exposed by
stomp.js library. The next step is usually to establish a STOMP
connection with the broker:

        [...]
        var on_connect = function() {
            console.log('connected');
        };
        var on_error =  function() {
            console.log('error');
        };
        client.connect('guest', 'guest', on_connect, on_error, '/');
        [...]


## <a id="examples"/>Web STOMP Examples

A few simple Web-Stomp examples are provided as a
[RabbitMQ Web STOMP examples](https://github.com/rabbitmq/rabbitmq-web-stomp-examples)
plugin. To get it running follow the installation instructions above
and enable the plugin:

    rabbitmq-plugins enable rabbitmq_web_stomp_examples

To apply the changes you need to restart the RabbitMQ broker.

The examples will be available under
[http://127.0.0.1:15670/](http://127.0.0.1:15670/) url. You will see two examples:

 * "echo" - shows how to use STOMP to do simple message broadcasting
 * "bunny" - example of a simple collaboration canvas painting app

We encourage you to take a look [at the source code](https://github.com/rabbitmq/rabbitmq-web-stomp-examples/tree/master/priv).

## <a id="config"/>Configuration

When no configuration is specified the Web-Stomp plugin will listen on
all interfaces on port 15674 and have a default user login/passcode of
`guest`/`guest`.

To change this, edit your
[Advanced configuration file](/configure.html#configuration-file),
to contain a `port` variable for the `rabbitmq_web_stomp` application.

For example, a complete configuration file which changes the listener
port to 12345 would look like:

    web_stomp.port = 12345

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

    [
      {rabbitmq_web_stomp, [{port, 12345}]}
    ].

This is a shorthand for the following:

    [
      {rabbitmq_web_stomp,
          [{tcp_config, [{port, 12345}]}]}
    ].

You can use the `tcp_config` section to specify any TCP option you need.
When both a `port` and a `tcp_config` sections exist, the plugin will
use the former as a port number, ignoring the one in `tcp_config`.

In addition, encrypted connections are supported if SSL configuration parameters are
provided in the `ssl_config` section:

    web_stomp.ssl.port = 12345
    web_stomp.ssl.backlog    = 1024
    web_stomp.ssl.certfile   = path/to/certs/client/cert.pem
    web_stomp.ssl.keyfile    = path/to/certs/client/key.pem
    web_stomp.ssl.cacertfile = path/to/certs/testca/cacert.pem
    web_stomp.ssl.password   = changeme

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

    [
      {rabbitmq_web_stomp,
          [{ssl_config, [{port,       15671},
                         {backlog,    1024},
                         {certfile,   "path/to/certs/client/cert.pem"},
                         {keyfile,    "path/to/certs/client/key.pem"},
                         {cacertfile, "path/to/certs/testca/cacert.pem"},
                         {password,   "changeme"}]}]}
    ].

Note that port, certfile, keyfile and password are all mandatory. See the [webserver documentation](https://github.com/rabbitmq/cowboy/blob/4b93c2d19a10e5d9cee207038103bb83f1ab9436/src/cowboy_ssl_transport.erl#L40)
for details about accepted parameters.

By default, the Web STOMP plugin will expect to handle messages
encoded as UTF-8. This cannot be changed for the SockJS endpoint,
however you can switch the Websocket endpoint to binary if needed.
The `ws_frame` option serves this purpose:

    web_stomp.ws_frame = binary

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

    [
      {rabbitmq_web_stomp, [{ws_frame, binary}]}
    ].

The Web STOMP plugin uses the Cowboy web server under the hood.
Cowboy provides [a number of options](http://ninenines.eu/docs/en/cowboy/1.0/manual/cowboy_protocol/)
that can be used to customize the behavior of the server. You
can specify those in the Web-Stomp plugin configuration, in
the `cowboy_opts` section:

    web_stomp.cowboy_opts.max_keepalive = 10

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

    [
      {rabbitmq_web_stomp,
          [{cowboy_opts, [{max_keepalive, 10}]}]}
    ].

The SockJS endpoint can also be configured further in the
`sockjs_opts` section of the configuration. Look into the
SockJS-erlang repository for a detailed [list of options](https://github.com/rabbitmq/sockjs-erlang#sockjs-erlang-api)
you can use. For example, to use a different SockJS client
version, you can use the following configuration:

    web_stomp.sockjs_opts.url = https://cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

    [
      {rabbitmq_web_stomp,
          [{sockjs_opts, [{sockjs_url, "https://cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js"}]}]}
    ].

The `use_http_auth` option extends the authentication by
allowing clients to send the login and passcode in the
HTTP Authorization header (using HTTP Basic Auth). If
present, these credentials will be used. Otherwise, the
default STOMP credentials are used. The credentials found
in the CONNECT frame, if any, are ignored.

    [
      {rabbitmq_web_stomp,
          [{use_http_auth, true}]}
    ].

## <a id="missing"/>Missing features

RabbitMQ Web STOMP is fully compatible with the
[RabbitMQ STOMP](/stomp.html) plugin, with the exception of STOMP
heartbeats. STOMP heartbeats won't work with SockJS.
