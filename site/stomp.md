# RabbitMQ STOMP Adapter NOSYNTAX

## Introduction

The [STOMP](http://stomp.github.com) plugin adds support for the STOMP
protocol to [RabbitMQ](http://www.rabbitmq.com). The adapter supports
both [STOMP 1.0](http://stomp.github.com/stomp-specification-1.0.html)
and [STOMP 1.1](http://stomp.github.com/stomp-specification-1.1.html).

Announcements regarding the adapter are periodically made on the
[RabbitMQ blog](http://lists.rabbitmq.com/cgi-bin/mailman/listinfo/rabbitmq-discuss)
and [mailing list](http://www.rabbitmq.com/blog).

## Installing from binary

Binary packages for the STOMP adapter can be found on the
[plugins page](http://www.rabbitmq.com/plugins.html).

Instructions for installing binary plugins can be found in the
[Admin Guide](http://www.rabbitmq.com/admin-guide.html#plugins).

## Compiling and installing from source

To build the STOMP adapter from source, follow the instructions for
building the umbrella repository contained in the
[Plugin Development Guide](http://www.rabbitmq.com/plugin-development.html).

You need to install the rabbitmq\_stomp.ez and amqp\_client.ez packages.

## Configuring the adapter

When no configuration is specified the STOMP Adapter will listen on
all interfaces on port 61613.

To change this, edit your [Configuration file](http://www.rabbitmq.com/install.html#configfile),
to contain a tcp_listeners variable for the rabbitmq_stomp application.

For example, a complete configuration file which changes the listener
port to 12345 would look like:

    [
      {rabbitmq_stomp, [{tcp_listeners, [12345]} ]}
    ].

while one which changes the listener to listen only on localhost (for
both IPv4 and IPv6) would look like:

    [
      {rabbitmq_stomp, [{tcp_listeners, [{"127.0.0.1", 61613},
                                         {"::1",       61613} ]} ]}
    ].

## Configuring SSL

To use SSL for STOMP connections, SSL must be configured in the broker
as described [here](http://www.rabbitmq.com/ssl.html).

To enable a STOMP SSL connections, add a listener configuration to the
ssl_listeners variable for the rabbit_stomp appliction:

    [
      {rabbit_stomp, [{tcp_listeners, [61613]},
                      {ssl_listeners, [61614]}]}
    ]

This configuration creates a standard TCP listener on port 61613 and
an SSL listener on port 61614.

### Testing the adapter

If the adapter is running, you should be able to connect to port 61613
using a STOMP client of your choice. In a pinch, `telnet` or netcat
(`nc`) will do nicely:

    $ nc localhost 61613
    dummy
    dummy
    ERROR
    message:Invalid frame
    content-type:text/plain
    content-length:22

    Could not parse frame
    $

That `ERROR` message indicates that the adapter is listening and
attempting to parse STOMP frames.

Alternatively, you can run the `test/test.py` script from adapter
source tree. This script runs a full suite of tests against the
adapter in its default configuration.

## Destinations

The STOMP specification does not prescribe what kinds of destinations
a broker must support, instead the value of the `destination` header
in `SEND` and `MESSAGE` frames is broker-specific. The RabbitMQ STOMP
adapter supports three kinds of destination: `/exchange`, `/queue` and
`/topic`.

### Exchange Destinations

Any exchange/queue or exchange/routing key combination can be accessed
using destinations prefixed with `/exchange`.

For `SUBSCRIBE` frames, a destination of the form
`/exchange/<name>[/<pattern>]` can be used. This destination:

1. creates an exclusive, auto-delete queue on `<name>` exchange;
2. if `<pattern>` is supplied, binds the queue to `<name>` exchange
   using `<pattern>`; and
3. registers a subscription against the queue, for the current STOMP session.

For `SEND` frames, a destination of the form
`/exchange/<name>[/<routing-key>]` can be used. This destination:

1. sends to exchange `<name>` with the routing key `<routing-key>`.

It should be noted that exchange destinations are {{not}} suitable for
consuming messages from an existing queue. A new queue is created for
each subscriber and is bound to the specified exchange using the
supplied routing key.

### Queue Destinations

For simple queues, destinations of the form `/queue/<name>` can be
used.

Queue destinations deliver each message to at most one
subscriber. Messages sent when no subscriber exist will be queued
until a subscriber connects to the queue.

#### AMQP semantics
For both `SEND` and `SUBSCRIBE` frames, these destinations create
the queue `<name>`.

For `SEND` frames, the message is sent to the default exchange
with the routing key `<name>`. For `SUBSCRIBE` frames, a subscription
against the queue `<name>` is created for the current STOMP
session.

### Topic Destinations

For simple topic destinations which deliver a copy of each message to
all active subscribers, destinations of the form `/topic/<name>` can
be used. Topic destinations support all the routing patterns of AMQP
topic exchanges.

Messages sent to a topic destination that has no active subscribers
are simply discarded.

#### AMQP Semantics

For `SEND` frames, the message is sent to the `amq.topic` exchange
with the routing key `<name>`.

For `SUBSCRIBE` frames, an exclusive queue is created and bound to the
`amq.topic` exchange with routing key `<name>`. A subscription is
created against the exclusive queue.

## Protocol extensions

The STOMP adapter supports a number of non-standard headers on certain
frames. These extra headers provide access to features that are not
described in the STOMP specs.

### Message persistence

On the `SEND` frame, the STOMP adapter supports the inclusion of a `persistent` header.

Setting the `persistent` header to `true` has the obvious effect of making the message persistent.

Receipts for `SEND` frames with `persistent:true` are not sent until a
confirm is received from the broker. The exact semantics for confirms
on persistent messages can be found here.

`MESSAGE` frames for persistent messages also a `persistent:true`
header.

### AMQP properties

`SEND` frames also allow headers corresponding to the AMQP properties
available when publishing messages. These headers are also set on
`MESSAGE` frames sent to clients.

The supported headers are:

* `amqp-message-id` - sets the `message-id` property
* `correlation-id` - sets the `correlation-id` property
* `content-encoding`- sets the `content-encoding` property
* `priority` - sets the `priority` property
* `reply-to`- sets the `reply-to` property

