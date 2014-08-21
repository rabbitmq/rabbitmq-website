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

## <a id="ifb"/>Enabling the Plugin

The MQTT adapter is included in the RabbitMQ distribution. To enable
it, use [rabbitmq-plugins](/man/rabbitmq-plugins.1.man.html):

    rabbitmq-plugins enable rabbitmq_mqtt

After the plugin has been enabled, RabbitMQ needs restarting.

## <a id="overview"/> How it Works

RabbitMQ MQTT plugin targets MQTT 3.1 and supports a broad range
of MQTT clients. It also makes it possible for MQTT clients to interoperate
with [AMQP 0-9-1, AMQP 1.0, and STOMP](https://www.rabbitmq.com/protocols.html) clients.

The plugin builds on top of RabbitMQ exchanges and queues. Messages published
to MQTT topics use a topic exchange (`amq.topic` by default) internally. Subscribers consume from
RabbitMQ queues bound to the topic exchange. This both enables interoperability
with other protocols and makes it possible to use the [Management plugin](/management.html)
to inspect queue sizes, message rates, and so on.


### <a id="durability"/> Subscription Durability

MQTT 3.1 assumes two primary usage scenarios:

 * Transient clients that use transient (non-persistent) messages
 * Stateful clients that use durable subscriptions (non-clean sessions, QoS1)

This section briefly covers how these scenarios map to RabbitMQ queue durability and persistence
features.

Transient (QoS0) subscription use non-durable, auto-delete queues
that will be deleted when the client disconnects.

Durable (QoS1) subscriptions use durable queues. Whether the queues are
auto-deleted is controlled by the client's clean session flag. Clients with
clean sessions use auto-deleted queues, others use non-auto-deleted ones.

For transient (QoS0) publishes, the plugin will publish messages as transient
(non-persistent). Naturally, for durable (QoS1) publishes, persistent
messages will be used internally.

Queues created for MQTT subscribers will have names starting with `mqtt-subscription-`,
one per subscription QoS level. The queues will have [queue TTL](/ttl.html) depending
on MQTT plugin configuration.


## <a id="config"/> Plugin Configuration

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
                      %% Default MQTT with TLS port is 8883
                      %% {ssl_listeners,    [8883]}
                      {tcp_listeners,    [1883]},
                      {tcp_listen_options, [binary,
                                            {packet,    raw},
                                            {reuseaddr, true},
                                            {backlog,   128},
                                            {nodelay,   true}]}]}
    ].

### <a id="authentication"/> Authentication

The `default_user` and `default_pass` options are used to authenticate
the adapter in case MQTT clients provide no login credentials. If the
`allow_anonymous` option is set to `false` then clients MUST provide credentials.
The presence of client-supplied credentials over the network overrides
the `allow_anonymous` option. Colons may not appear in usernames.

The `vhost` option controls which RabbitMQ vhost the adapter connects to. The `vhost`
configuration is only consulted if no vhost is provided during connection establishment.
You can optionally specify a vhost while connecting, by prepending the vhost
to the username and separating with a colon.

For example, connecting with

    /:guest

is equivalent to the default vhost and username.

    mqtt-vhost:mqtt-username

means connecting to the vhost `mqtt-host` with username `mqtt-user`.

### Host and Port

The `tcp_listeners` and `tcp_listen_options` options are interpreted in the same way
as the corresponding options in the `rabbit` section, as explained in the
[broker configuration documentation](http://www.rabbitmq.com/configure.html).

### TLS/SSL

The `ssl_listeners` option in the `rabbitmq_mqtt` config section controls the
endpoint (if any) that the adapter accepts SSL connections on. The
default MQTT SSL port is 8883. If this option is non-empty then the
`rabbit` section of the configuration file must contain an
`ssl_options` entry:

    [{rabbit,        [
                      {ssl_options, [{cacertfile, "/path/to/tls/ca/cacert.pem"},
                                     {certfile,   "/path/to/tls/server/cert.pem"},
                                     {keyfile,    "/path/to/tls/server/key.pem"},
                                     {verify,     verify_peer},
                                     {fail_if_no_peer_cert, true}]}
                     ]},
     {rabbitmq_mqtt, [
                      {ssl_listeners,    [8883]}
                      {tcp_listeners,    [1883]}
                      ]}
    ].

See the [SSL configuration guide](http://www.rabbitmq.com/ssl.html) for details.

### <a id="stickiness"/> Session Stickiness (Clean and Non-clean Sessions)

The `subscription_ttl` option controls the lifetime of non-clean sessions. This
option is interpreted in the same way as the [queue TTL](http://www.rabbitmq.com/ttl.html#queue-ttl)
parameter, so the value `1800000` means 30 minutes.

The `prefetch` option controls the maximum number of unacknowledged messages that
will be delivered. This option is interpreted in the same way as the [AMQP prefetch-count](http://www.rabbitmq.com/amqp-0-9-1-reference.html#basic.qos.prefetch-count)
field, so a value of `0` means "no limit".

### Custom Exchanges

The `exchange` option determines which exchange messages from MQTT clients are published
to. If a non-default exchange is chosen then it must be created before clients
publish any messages. The exchange is expected to be an AMQP topic exchange.


## <a id="limitations"/> Limitations

### Overlapping Subscriptions

Overlapping subscriptions from the same client
(e.g. `/sports/football/epl/#` and `/sports/football/#`) can result in
duplicate messages being delivered. Applications
need to account for this.
