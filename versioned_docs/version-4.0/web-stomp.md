---
title: RabbitMQ Web STOMP Plugin
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
# RabbitMQ Web STOMP Plugin

## Overview {#overview}

The Web STOMP plugin makes it possible to use
[STOMP](./stomp) over a WebSocket connection.

The goal of this plugin is to enable STOMP messaging in Web applications.

A similar plugin, [Web MQTT plugin](./web-mqtt), makes it possible to use [MQTT](./mqtt) over
WebSockets.

## How It Works {#how-it-works}

RabbitMQ Web STOMP plugin is a minimalistic "bridge" between the STOMP protocol implementation
provided by [RabbitMQ STOMP plugin](./stomp), and WebSocket clients.

RabbitMQ Web STOMP is fully compatible with the [RabbitMQ STOMP](./stomp) plugin.

## Enabling the Plugin {#enabling}

`rabbitmq_web_stomp` plugin ships with RabbitMQ.

To enable the plugin run [rabbitmq-plugins](./man/rabbitmq-plugins.8):

```bash
rabbitmq-plugins enable rabbitmq_web_stomp
```

## Usage {#usage}

In order to use STOMP in a Web browser context, a JavaScript STOMP
library is required. We've tested a
[stomp-websocket](https://github.com/jmesnil/stomp-websocket/) library
by [Jeff Mesnil](https://github.com/jmesnil) and
[Jeff Lindsay](https://github.com/progrium).
[This library](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_web_stomp_examples/priv/stomp.js)
is included as part of [RabbitMQ Web STOMP examples](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_web_stomp_examples).

The WebSocket endpoint is available on the `/ws` path:

```
ws://127.0.0.1:15674/ws
```

This endpoint will only work with Websocket capable clients. Note that
some configuration is necessary in order to accept binary messages.

In order to establish connection from the browser using WebSocket
you may use code like:

```html
<!-- include the client library -->
<script src="stomp.js"></script>
```

```javascript
<script>
var ws = new WebSocket('ws://127.0.0.1:15674/ws');
var client = Stomp.over(ws);
// ...
```

Once you have the `client` object you can follow API's exposed by
stomp.js library. The next step is usually to establish a STOMP
connection with the broker:

```javascript
// ...
var on_connect = function() {
    console.log('connected');
};
var on_error =  function() {
    console.log('error');
};
client.connect('guest', 'guest', on_connect, on_error, '/');
// ...
```


## Web STOMP Examples {#examples}

A few simple Web STOMP examples are provided as a
[RabbitMQ Web STOMP examples](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_web_stomp_examples)
plugin. To get it running follow the installation instructions for that plugin
and enable the plugin:

```bash
rabbitmq-plugins enable rabbitmq_web_stomp_examples
```

The examples will be available under
[http://127.0.0.1:15670/](http://127.0.0.1:15670/) url. You will see two examples:

 * "echo" - shows how to use STOMP to do simple message broadcasting
 * "bunny" - example of a simple collaboration canvas painting app

We encourage you to take a look [at the source code](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_web_stomp_examples/priv).

## Configuration {#configuration}

When no configuration is specified the Web STOMP plugin will listen on
all interfaces on port 15674 and have a default user login/passcode of
`guest`/`guest`. Note that this user is only [allowed to connect from localhost](./access-control#loopback-users) by default.
We highly recommend creating a separate user for production systems.

To change the listener port, edit your
[Advanced configuration file](./configure#configuration-files),
to contain a `tcp_config` section with a `port` variable for the `rabbitmq_web_stomp` application.

For example, a complete configuration file which changes the listener
port to 12345 would look like:

```ini
web_stomp.tcp.port = 12345
```

You can use the `tcp_config` section to specify any TCP option you need.
See the [RabbitMQ Networking guide](./networking) and [Ranch documentation](https://ninenines.eu/docs/en/ranch/2.1/guide/)
for details about accepted parameters.


### TLS (WSS) {#tls}

The plugin supports WebSockets with TLS (WSS) connections. See [TLS guide](./ssl)
to learn more about TLS support in RabbitMQ.

TLS configuration parameters are provided in the `web_stomp.ssl` section:

```ini
web_stomp.ssl.port       = 15673
web_stomp.ssl.backlog    = 1024
web_stomp.ssl.cacertfile = /path/to/ca_certificate.pem
web_stomp.ssl.certfile   = /path/to/server_certificate.pem
web_stomp.ssl.keyfile    = /path/to/server_key.pem
web_stomp.ssl.password   = changeme
```

The TLS listener port, server certificate file, private key and CA certificate bundle are mandatory options.
Password is also mandatory if the private key uses one.
An extended list of TLS settings is largely identical to those [for the core server](./ssl).
Full list of options accepted by this plugin can be found in [Ranch documentation](https://ninenines.eu/docs/en/ranch/1.7/manual/ranch_ssl/).

#### Enabled TLS Versions and Cipher Suites {#tls-versions}

It is possible to configure what TLS versions and cipher suites will be used by RabbitMQ. Note that not all
suites will be available on all systems.

RabbitMQ TLS guide has [a section on TLS versions](./ssl#tls-versions) and another one
[on cipher suites](./ssl#cipher-suites). Below is an example
in the [advanced config format](./configure#advanced-config-file) that configures cipher suites
and a number of other [TLS options](./ssl) for the plugin:

```ini
web_stomp.ssl.port       = 15673
web_stomp.ssl.backlog    = 1024
web_stomp.ssl.certfile   = /path/to/server_certificate.pem
web_stomp.ssl.keyfile    = /path/to/server_key.pem
web_stomp.ssl.cacertfile = /path/to/ca_certificate_bundle.pem
web_stomp.ssl.password   = changeme

web_stomp.ssl.honor_cipher_order   = true
web_stomp.ssl.honor_ecc_order      = true
web_stomp.ssl.client_renegotiation = false
web_stomp.ssl.secure_renegotiate   = true

web_stomp.ssl.versions.1 = tlsv1.2
web_stomp.ssl.versions.2 = tlsv1.1
web_stomp.ssl.ciphers.1 = ECDHE-ECDSA-AES256-GCM-SHA384
web_stomp.ssl.ciphers.2 = ECDHE-RSA-AES256-GCM-SHA384
web_stomp.ssl.ciphers.3 = ECDHE-ECDSA-AES256-SHA384
web_stomp.ssl.ciphers.4 = ECDHE-RSA-AES256-SHA384
web_stomp.ssl.ciphers.5 = ECDH-ECDSA-AES256-GCM-SHA384
web_stomp.ssl.ciphers.6 = ECDH-RSA-AES256-GCM-SHA384
web_stomp.ssl.ciphers.7 = ECDH-ECDSA-AES256-SHA384
web_stomp.ssl.ciphers.8 = ECDH-RSA-AES256-SHA384
web_stomp.ssl.ciphers.9 = DHE-RSA-AES256-GCM-SHA384
```


#### Troubleshooting TLS (WSS)

See [RabbitMQ TLS](./ssl) and [TLS Troubleshooting](./troubleshooting-ssl) for additional
information.


### Basic HTTP Authentication {#http-auth}

The `use_http_auth` option extends the authentication by
allowing clients to send the login and passcode in the
HTTP authorisation header (using HTTP Basic Auth). If
present, these credentials will be used. Otherwise, the
default STOMP credentials are used. The credentials found
in the CONNECT frame, if any, are ignored.

This is an advanced feature that is only exposed via the [advanced configuration file](./configure#configuration-files)
or the <a href="./configure#erlang-term-config-file">classic config format</a>:

```erlang
[
  {rabbitmq_web_stomp,
      [{use_http_auth, true}]}
].
```

### Proxy Protocol {#proxy-protocol}

The Web STOMP plugin supports the [proxy protocol](http://www.haproxy.org/download/3.1/doc/proxy-protocol.txt).
This feature is deactivated by default, to activate it for clients:

```ini
web_stomp.proxy_protocol = true
```

See the [Networking Guide](./networking#proxy-protocol) for more information
about the proxy protocol.


## Advanced Options {#advanced-options}

The Web STOMP plugin uses the Cowboy HTTP and WebSocket server under the hood. Cowboy
provides [a number of options](https://ninenines.eu/docs/en/cowboy/2.10/manual/cowboy_http/)
that can be used to customize the behavior of the server
w.r.t. WebSocket connection handling.

Some settings are generic HTTP ones, others are specific to WebSockets.

### Content Encoding {#content-encoding}

By default, the Web STOMP plugin will expect to handle messages
encoded as UTF-8. The WebSocket endpoint exposed by this plugin can be switched to binary mode if needed
using the `ws_frame` option:

```ini
web_stomp.ws_frame = binary
```

### HTTP Options {#http-options}

Generic HTTP server settings can be specified using `web_stomp.cowboy_opts.*` keys,
for example:

```ini
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
```

### WebSocket Options {#websocket-options}

```ini
# WebSocket traffic compression is enabled by default
web_stomp.ws_opts.compress = true

# WebSocket connection inactivity timeout
web_stomp.ws_opts.idle_timeout = 60000

web_stomp.ws_opts.max_frame_size = 50000
```
