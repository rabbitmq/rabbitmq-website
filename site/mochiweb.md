# HTTP server plugin NOSYNTAX

The `rabbitmq-mochiweb` plugin provides hosting for other plugins that
have HTTP interfaces. It allows these interfaces to co-exist on one or
more HTTP listeners.

## Installation

Typically `rabbitmq-mochiweb` comes bundled with other plugins that depend
on it.

If you wish to build `rabbitmq-mochiweb` from source, it can be built
like any other plugin. See [plugin
development](plugin-development.html) for details.

## Configuration

The configuration of `rabbitmq-mochiweb` determines what HTTP
listeners are run, and how HTTP interfaces (hereafter "contexts") are
assigned to them. Each context is given a URL path prefix to
distinguish it from other contexts assigned to the same listener. The
configuration is usually supplied in the main [RabbitMQ configuration
file](configure.html#configuration-file).

The default configuration specifies two listeners, one on port 55670
and one on port 55672; then assigns the context used in the management
plugin to the latter, and lets everything else default to the
former. It looks like this:

      [{listeners,        [{mgmt, [{port, 55672}]}]},
       {default_listener, [{port, 55670}]},
       {contexts,         [{rabbit_mgmt, mgmt}]}]

The listeners are given as pairs of a name and options; the options
are given to mochiweb, and only `port` is mandatory (see below for
other options).

The context entries assign contexts (`rabbit_mgmt` etc.) to the
listeners. The context names are used by applications when registering
their context (or contexts); any context not mentioned here will be
assigned to the default listener, named `'*'`.

A context may also be given as nested pair:

    {my_context, {'*', "alternate"}}

In this case, the context registered as my_context will be available
on the default listener under the URL path `/alternate/`. Otherwise
the path prefix is decided by the application registering the context.

### Listening on a single interface

Use `ip` to specify an interface for mochiweb to bind to (giving an IP
address as a string or tuple). Example: `[{port, 55672}, {ip,
"127.0.0.1"}]`.

### SSL

Set `ssl` to `true` to switch on SSL for a listener. Use `ssl_opts` to
specify SSL options. These are the standard Erlang SSL options - [see
the main page on SSL for more information](ssl.html).

For convenience, if you do not specify `ssl_opts` then
rabbitmq-mochiweb will use the same options as the main RabbitMQ
server does for AMQP over SSL, <b>but with client certificate
verification switched off</b>. If you wish to use client certificate
verification, specify it explicitly.

## Example: enable SSL for management

In the following `rabbitmq.config`, SSL is enabled for the management
plugin on port 55672.

    [{rabbitmq_mochiweb,
      [{listeners, [{'*',  [{port,     55670}]},
                    {mgmt, [{port,     55672},
                            {ssl,      true},
                            {ssl_opts, [{cacertfile, "/path/to/cacert.pem"},
                                        {certfile,   "/path/to/cert.pem"},
                                        {keyfile,    "/path/to/key.pem"}]}
                           ]}
                   ]}
      ]}
    ].
