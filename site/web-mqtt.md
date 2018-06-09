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
# RabbitMQ Web MQTT Plugin NOSYNTAX

The Web MQTT plugin is a simple bridge exposing the
[MQTT](http://mqtt.org/) protocol over [HTML5 WebSockets](https://en.wikipedia.org/wiki/WebSockets).

The main intention of Web MQTT is to make it possible to use RabbitMQ
from web browsers. It was heavily inspired by the [Web STOMP plugin](/web-stomp.html).

## How It Works

RabbitMQ Web MQTT plugin is rather simple. It takes the MQTT protocol,
as provided by [RabbitMQ MQTT plugin](/mqtt.html) and exposes it using
WebSockets.


## <a id="enabling-plugin" class="anchor" href="#enabling-plugin">Installation and Enabling the Plugin</a>

`rabbitmq_web_mqtt` plugin ships with RabbitMQ as of 3.6.7.

To enable the plugin run [rabbitmq-plugins](/man/rabbitmq-plugins.8.html):

<pre class="sourcecode bash">
rabbitmq-plugins enable rabbitmq_web_mqtt
</pre>

## <a id="usage" class="anchor" href="#usage">Usage</a>

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
    keepAliveInterval: 30,
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

## <a id="examples" class="anchor" href="#examples">Web MQTT Examples</a>

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

## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

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


## <a id="tls" class="anchor" href="#tls">TLS (WSS)</a>

The plugin supports WebSocket connections with TLS encryption (WSS connections).

TLS configuration parameters for the plugin use the <code>web_mqtt.ssl</code> prefix:

<pre class="sourcecode ini">
web_mqtt.ssl.port       = 12345
web_mqtt.ssl.backlog    = 1024
web_mqtt.ssl.certfile   = path/to/certs/client/cert.pem
web_mqtt.ssl.keyfile    = path/to/certs/client/key.pem
web_mqtt.ssl.cacertfile = path/to/certs/testca/cacert.pem
# needed when private key has a passphrase
# web_mqtt.ssl.password   = changeme
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_mqtt,
      [{ssl_config, [{port,       15671},
                     {backlog,    1024},
                     {certfile,   "path/to/certs/client/cert.pem"},
                     {keyfile,    "path/to/certs/client/key.pem"},
                     {cacertfile, "path/to/certs/testca/cacert.pem"}
                     %% needed when private key has a passphrase
                     %% , {password,   "changeme"}
                    ]}]}
].
</pre>

TLS listener port, server certificate file and private key file are mandatory options.
An extended list of TLS settings is largely identical to those [for the core server](/ssl.html)
but there are some minor differences. Full list of options accepted by this plugin
can be found in [Ranch documentation](https://ninenines.eu/docs/en/ranch/1.4/manual/ranch_ssl/).


### <a id="tls-versions" class="anchor" href="#tls-versions">Enabled TLS Versions and Cipher Suites</a>

It is possible to configure what TLS versions and cipher suites will be used by RabbitMQ. Note that not all
suites will be available on all systems.

RabbitMQ TLS guide has [a section on TLS versions](/ssl.html#disabling-tls-versions) and another one
[on cipher suites](/ssl.html#configuring-ciphers). Below is an example
in the [advanced config format](/configure.html#advanced-config-file) that configures cipher suites
and a number of other [TLS options](/ssl.html) for the Web MQTT plugin:

<pre class="sourcecode erlang">

{rabbitmq_web_mqtt,
  [{ssl_config,
    [{cacertfile,           "/path/to/ca_certificate.pem"},
     {certfile,             "/path/to/server_certificate.pem"},
     {keyfile,              "/path/to/private_key.pem"},
     {verify,               verify_peer},
     {fail_if_no_peer_cert, true},
     {versions,             ['tlsv1.2']},
     {honor_cipher_order,   true},
     {honor_ecc_order,      true},
     {secure_renegotiate,   true},
     {ciphers,              [{rsa,aes_256_cbc,sha256},
                             {rsa,aes_128_cbc,sha256},
                             {rsa,aes_256_cbc,sha},
                             {rsa,'3des_ede_cbc',sha},
                             {rsa,aes_128_cbc,sha},
                             {rsa,des_cbc,sha}]}]
    ]
  }]
}
</pre>


### Troubleshooting TLS (WSS)

See [RabbitMQ TLS](/ssl.html) and [TLS Troubleshooting](/troubleshooting-ssl.html) for additional
information.


## <a id="websocket-options" class="anchor" href="#websocket-options">WebSocket Options</a>

The Web MQTT plugin uses the Cowboy HTTP and WebSocket server under the hood.  Cowboy
provides [a number of
options](https://ninenines.eu/docs/en/cowboy/2.3/manual/cowboy_http/)
that can be used to customize the behavior of the server
w.r.t. WebSocket connection handling. Those can be specified using the advanced
config file in the`cowboy_opts` section, for example:

<pre class="sourcecode erlang">
[
  {rabbitmq_web_mqtt,
      [
        {cowboy_opts, [{max_keepalive, 10}]}
      ]
  }
].
</pre>
