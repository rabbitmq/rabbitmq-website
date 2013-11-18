# RabbitMQ MQTT Adapter NOSYNTAX

This is a protocol adapter that allows MQTT-capable clients to
connect to a RabbitMQ broker. The adapter translates MQTT 3.1
methods into their AMQP equivalents and back.

Announcements regarding the adapter are periodically made on the
[RabbitMQ mailing list](http://lists.rabbitmq.com/cgi-bin/mailman/listinfo/rabbitmq-discuss)
and [blog](http://www.rabbitmq.com/blog).

## <a id="smf"/> Supported MQTT 3.1 features

* QoS0 and QoS1 publish & consume
* Last Will and Testament (LWT)
* SSL
* Session stickiness

## <a id="ifb"/>Installing from binary

The MQTT adapter is included in the RabbitMQ distribution.  To enable
it, use [rabbitmq-plugins](/man/rabbitmq-plugins.1.man.html):

    rabbitmq-plugins enable rabbitmq_mqtt

## <a id="caifs"/>Compiling and installing from source

To build the MQTT adapter from source, follow the instructions for
building the umbrella repository contained in the
[Plugin Development Guide](/plugin-development.html).

You need to install the `rabbitmq_mqtt.ez` and `amqp_client.ez` packages.

## <a id="config"/> Configuration

Here is a sample configuration that sets every MQTT option:

    [{rabbit,        [{tcp_listeners,    [5672]}]},
     {rabbitmq_mqtt, [{default_user,     <<"guest">>},
                      {default_pass,     <<"guest">>},
                      {allow_anonymous,  true},
                      {vhost,            <<"/">>},
                      {exchange,         <<"amq.topic">>},
                      {subscription_ttl, 1800000},
                      {prefetch,         10},
                      {ssl_listeners,    []},
                      {tcp_listeners,    [1883]},
                      {tcp_listen_options, [binary,
                                            {packet,    raw},
                                            {reuseaddr, true},
                                            {backlog,   128},
                                            {nodelay,   true}]}]}
    ].

The `default_user` and `default_pass` options are used to authenticate
the adapter in case MQTT clients provide no login credentials. If the
`allow_anonymous` option is set to `false` then clients MUST provide credentials.
The presence of client-supplied credentials over the network overrides
the `allow_anonymous` option. Colons may not appear in usernames.

The `vhost` option controls which RabbitMQ vhost the adapter connects to. The `vhost`
configuration is only consulted if no vhost is provided during connection establishment.
You can optionally specify a vhost while connecting, by prepending the vhost
to the username and separating with a colon. For example, connecting with `/:guest` is
equivalent to the default vhost and username.

The `exchange` option determines which exchange messages from MQTT clients are published
to. If a non-default exchange is chosen then it must be created before clients
publish any messages. The exchange is expected to be an AMQP topic exchange.

The `subscription_ttl` option controls the lifetime of non-clean sessions. This
option is interpreted in the same way as the [queue TTL](http://www.rabbitmq.com/ttl.html#queue-ttl)
parameter, so the value `1800000` means 30 minutes.

The `prefetch` option controls the maximum number of unacknowledged messages that
will be delivered. This option is interpreted in the same way as the [AMQP prefetch-count](http://www.rabbitmq.com/amqp-0-9-1-reference.html#basic.qos.prefetch-count)
field, so a value of `0` means "no limit".

The `ssl_listeners` option controls the endpoint (if any) that the adapter accepts
SSL connections on. The default MQTT SSL port is 8883. If this option is non-empty
then the `rabbit` section of the configuration file must contain an `ssl_options`
entry. See the [SSL configuration guide](http://www.rabbitmq.com/ssl.html) for
details.

The `tcp_listeners` and `tcp_listen_options` options are interpreted in the same way
as the corresponding options in the `rabbit` section, as explained in the
[broker configuration documentation](http://www.rabbitmq.com/configure.html).
