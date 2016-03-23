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

# Web Dispatch Plugin NOSYNTAX

The `rabbitmq-web-dispatch` plugin provides hosting for other plugins that
have HTTP interfaces. It allows these interfaces to co-exist on one or
more HTTP listeners.

## Configuration

Plugins using `rabbitmq-web-dispatch` typically take a `listener`
configuration item to configure their listening HTTP port. In this
page we will give examples for the `rabbitmq_management` application,
but the same configuration can be applied to `rabbitmq_jsonrpc` and
`rabbitmq_web_stomp_examples`.

The `listener` configuration item can contain the following keys:

* `port` (mandatory)
* `ip` (to listen on only one interface)
* `ssl` (to enable SSL)
* `ssl_opts` (to configure SSL)
* `cowboy_opts` (to configure the Cowboy HTTP server)

## Listening on a single interface

Use `ip` to specify an interface for Cowboy to bind to (giving an IP
address as a string or tuple). For example:

    management.listener.port = 15672
    management.listener.ip   = 127.0.0.1
    
Or, using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

    [{rabbitmq_management,
      [{listener, [{port, 15672},
                   {ip, "127.0.0.1"}
                  ]}
      ]}
    ].

## TLS/SSL

Set `ssl` to `true` to turn on TLS for a listener. Use `ssl_opts` to
specify SSL options. These are the standard Erlang TLS options: [see
the RabbitMQ TLS guide](/ssl.html) for more information.

For convenience, if you do not specify `ssl_opts` then
Web Dispatch will use the same options as the main RabbitMQ
server does for AMQP over TLS, <b>but with client certificate
verification turned off</b>. If you wish to use client certificate
verification, specify `ssl_opts` explicitly.

For example:

    management.listener.port = 15672
    management.listener.ssl  = true

    management.listener.ssl_opts.cacertfile = /path/to/cacert.pem
    management.listener.ssl_opts.certfile   = /path/to/cert.pem
    management.listener.ssl_opts.keyfile    = /path/to/key.pem

The same example using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

    [{rabbitmq_management,
      [{listener, [{port,     15672},
                   {ssl,      true},
                   {ssl_opts, [{cacertfile, "/path/to/cacert.pem"},
                               {certfile,   "/path/to/cert.pem"},
                               {keyfile,    "/path/to/key.pem"}]}
                  ]}
      ]}
    ].

## Compressed responses

Cowboy provides [a number of options](http://ninenines.eu/docs/en/cowboy/1.0/manual/cowboy_protocol/)
that can be used to customize the behavior of the server. You
can specify those in the listener options under `cowboy_opts`.

To compress responses, set the proper `cowboy_opts` option:

    [{rabbitmq_management,
      [{listener, [{port,        15672},
                   {cowboy_opts, [{compress, true}]}
                  ]}
      ]}
    ].
