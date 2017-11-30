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
# RabbitMQ Web MQTT Plugin NOSYNTAX

The Web MQTT plugin is a simple bridge exposing the
[MQTT](http://mqtt.org/) protocol over [HTML5 WebSockets](https://en.wikipedia.org/wiki/WebSockets).

The main intention of Web MQTT is to make it possible to use RabbitMQ
from web browsers. It was heavily inspired by the [Web STOMP plugin](/web-stomp.html).

## How It Works

RabbitMQ Web MQTT plugin is rather simple. It takes the MQTT protocol,
as provided by [RabbitMQ MQTT plugin](/mqtt.html) and exposes it using
WebSockets.


## Installation and Enabling the Plugin

`rabbitmq_web_mqtt` plugin ships with RabbitMQ as of 3.6.7.

To enable the plugin run [rabbitmq-plugins](/man/rabbitmq-plugins.8.html):

<pre class="sourcecode bash">
rabbitmq-plugins enable rabbitmq_web_mqtt
</pre>

## Usage

In order to use MQTT in a Web browser context, a JavaScript MQTT
library is required. We've tested it against
[Paho JavaScript client](https://eclipse.org/paho/clients/js/).
It is included as part of [RabbitMQ Web MQTT example plugin](https://github.com/rabbitmq/rabbitmq-web-mqtt-examples).

By default the Web MQTT plugin exposes a WebSocket endpoint on port
15675. The WebSocket endpoint is available on the `/ws` path:

<pre class="sourcecode">
http://127.0.0.1:15675/ws
</pre>

In order to establish connection from the browser using WebSocket
you may use code like:

<pre class="sourcecode html">
&lt;!-- include the client library --&gt;
&lt;script src="mqttws31.js"&gt;&lt;/script&gt;
</pre>

<pre class="sourcecode javascript">
&lt;script&gt;

    var wsbroker = location.hostname;  // mqtt websocket enabled broker
    var wsport = 15675; // port for above
    var client = new Paho.MQTT.Client(wsbroker, wsport, "/ws",
        "myclientid_" + parseInt(Math.random() * 100, 10));
    client.onConnectionLost = function (responseObject) {
        debug("CONNECTION LOST - " + responseObject.errorMessage);
    };
    client.onMessageArrived = function (message) {
        debug("RECEIVE ON " + message.destinationName + " PAYLOAD " + message.payloadString);
        print_first(message.payloadString);
    };
...
</pre>

Once you have the `client` object you can follow API's exposed by
[Paho JavaScript library](https://eclipse.org/paho/clients/js/). The next step is usually to establish a MQTT
connection with the broker:

<pre class="sourcecode javascript">
[...]

var options = {
    timeout: 3,
    onSuccess: function () {
        debug("CONNECTION SUCCESS");
        client.subscribe('/topic/test', {qos: 1});
    },
    onFailure: function (message) {
        debug("CONNECTION FAILURE - " + message.errorMessage);
    }
};
if (location.protocol == "https:") {
    options.useSSL = true;
}
debug("CONNECT TO " + wsbroker + ":" + wsport);
client.connect(options);
[...]
</pre>

## Web MQTT Examples

A few simple Web MQTT examples are provided as a
[RabbitMQ Web MQTT examples](https://github.com/rabbitmq/rabbitmq-web-mqtt-examples)
plugin. To get it running follow the installation instructions for that plugin
and enable the plugin:

<pre class="sourcecode bash">
rabbitmq-plugins enable rabbitmq_web_mqtt_examples
</pre>

The examples will be available under
[http://127.0.0.1:15670/](http://127.0.0.1:15670/) url. You will see two examples:

 * "echo" - shows how to use MQTT to do simple message broadcasting
 * "bunny" - example of a simple collaboration canvas painting app

We encourage you to take a look [at the source code](https://github.com/rabbitmq/rabbitmq-web-mqtt-examples/tree/master/priv).

## Configuration

When no configuration is specified the Web MQTT plugin will listen on
all interfaces on port 15674 and have a default user login and password of
`guest`/`guest`. Note that this user is only [allowed to connect from localhost](/access-control.html) by default.
We highly recommend creating a separate user production systems.

To change this, edit your
[Configuration file](/configure.html#configuration-file),
to contain a `port` variable for the `rabbitmq_web_mqtt` application.

For example, a complete configuration file which changes the listener
port to 12345 would look like:

<pre class="sourcecode ini">
web_mqtt.port = 12345
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_mqtt, [{port, 12345}]}
].
</pre>

This is a shorthand for the following:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_mqtt,
      [{tcp_config, [{port, 12345}]}]}
].
</pre>

You can use the `tcp_config` section to specify any TCP option you need.
When both a `port` and a `tcp_config` sections exist, the plugin will
use the former as a port number, ignoring the one in `tcp_config`.

See [RabbitMQ Networking guide](/networking.html) for more information.


### TLS (SSL)

The plugin supports WebSockets with TLS (WSS) connections. That requires
Erlang/OTP 17.5 or a later version.

TLS (SSL) configuration parameters are provided in the `ssl_config` section:

<pre class="sourcecode ini">
web_mqtt.ssl.port = 12345
web_mqtt.ssl.backlog    = 1024
web_mqtt.ssl.certfile   = path/to/certs/client/cert.pem
web_mqtt.ssl.keyfile    = path/to/certs/client/key.pem
web_mqtt.ssl.cacertfile = path/to/certs/testca/cacert.pem
web_mqtt.ssl.password   = changeme
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_mqtt,
      [{ssl_config, [{port,       15671},
                     {backlog,    1024},
                     {certfile,   "path/to/certs/client/cert.pem"},
                     {keyfile,    "path/to/certs/client/key.pem"},
                     {cacertfile, "path/to/certs/testca/cacert.pem"},
                     %% needed when private key has a passphrase
                     {password,   "changeme"}]}]}
].
</pre>

Note that port, certfile, keyfile and password are all mandatory. See the [Cowboy documentation](https://github.com/rabbitmq/cowboy/blob/4b93c2d19a10e5d9cee207038103bb83f1ab9436/src/cowboy_ssl_transport.erl#L40)
for details about accepted parameters.

See [RabbitMQ TLS](/ssl.html) and [TLS Troubleshooting](/troubleshooting-ssl.html) for details.

## WebSocket Options

The Web MQTT plugin uses the Cowboy web server under the hood.  Cowboy
provides [a number of
options](http://ninenines.eu/docs/en/cowboy/1.0/manual/cowboy_protocol/)
that can be used to customize the behavior of the server
w.r.t. WebSocket connection handling. You can specify those in the Web
MQTT plugin configuration, in the `cowboy_opts` section:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_mqtt,
      [{cowboy_opts, [{max_keepalive, 10}]}]}
].
</pre>
