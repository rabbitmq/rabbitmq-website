# HTTP server plugin NOSYNTAX

The `rabbitmq-mochiweb` plugin provides hosting for other plugins that
have HTTP interfaces. It allows these interfaces to co-exist on one or
more HTTP listeners.

## Configuration

Plugins using `rabbitmq-mochiweb` typically take a `listener`
configuration item to configure their listening HTTP port. In this
page we will give examples for the `rabbitmq_management` application,
but the same configuration can be applied to `rabbitmq_jsonrpc` and
`rabbitmq_web_stomp_examples`.

## Listening on a single interface

Use `ip` to specify an interface for mochiweb to bind to (giving an IP
address as a string or tuple). For example:

    [{rabbitmq_management,
      [{port, 55672}, {ip, "127.0.0.1"}]}
    ]..

## SSL

Set `ssl` to `true` to switch on SSL for a listener. Use `ssl_opts` to
specify SSL options. These are the standard Erlang SSL options - [see
the main page on SSL for more information](ssl.html).

For convenience, if you do not specify `ssl_opts` then
rabbitmq-mochiweb will use the same options as the main RabbitMQ
server does for AMQP over SSL, <b>but with client certificate
verification switched off</b>. If you wish to use client certificate
verification, specify it explicitly.

For example:

    [{rabbitmq_management,
      [{listener, [{port,     55672},
                   {ssl,      true},
                   {ssl_opts, [{cacertfile, "/path/to/cacert.pem"},
                               {certfile,   "/path/to/cert.pem"},
                               {keyfile,    "/path/to/key.pem"}]}
                  ]}
      ]}
    ].
