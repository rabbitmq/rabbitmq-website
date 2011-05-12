# Mochiweb and Webmachine

The `rabbitmq-mochiweb` plugin provides hosting for other plugins that
have HTTP interfaces. It allows these interfaces to co-exist on one or
more HTTP listener.

## Installation

Typically `rabbitmq-mochiweb` comes bundled with other plugins that depend
on it.

If you wish to build `rabbitmq-mochiweb` from source, it can be built
like any other plugin. See [plugin
development](plugin-development.html) for details.

## Configuration

The configuration of `rabbitmq-mochiweb` determines what HTTP
listeners are run, how HTTP interfaces (hereafter "contexts") are
assigned to them, and the URL paths to each context.

It is usually supplied in the main [RabbitMQ configuration
file](configure.html#configuration-file).

For example, the default configuration specifies two listeners, one on
port 55672 and one on port 55670, and assigns contexts used in the
management plugin to the former, and everything else to the latter.

The default configuration looks like this:

      [{listeners, [{'*',  [{port, 55670}]},
                    {mgmt, [{port, 55672}]}]},
       {contexts,  [{rabbit_mgmt, mgmt},
                    {rabbit_mgmt_api, mgmt},
                    {rabbit_mgmt_cli, mgmt}]}]

The listeners are given as pairs of a name and options; the options
are given to mochiweb, and only `port` is mandatory.  The listener
called `'*'` is the catch-all default; a configuration must always
have a listener named `'*'`.

The context entries assign contexts (`rabbit_mgmt` etc.) to the
listeners. The context names are used by applications when registering
their context (or contexts); any context not mentioned here will be
assigned to the default listener, named `'*'`.

A context may also be given as a triple:

    {my_context, '*', "alternate"}

In this case, the context registered as my_context will be available
on the default listener under the URL path `/alternate/`. Otherwise
the path prefix is decided by the application registering the context.
