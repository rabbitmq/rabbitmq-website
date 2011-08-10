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

<a name="caifs"/>
## Compiling and installing from source

To build the STOMP adapter from source, follow the instructions for
building the umbrella repository contained in the
[Plugin Development Guide](http://www.rabbitmq.com/plugin-development.html).

You need to install the `rabbitmq_stomp.ez` and `amqp_client.ez` packages.

## Configuring the adapter

When no configuration is specified the STOMP Adapter will listen on
all interfaces on port 61613 and have a default user login/passcode
of `guest`/`guest`.

To change this, edit your
[Configuration file](/configure.html#configuration-file),
to contain a `tcp_listeners` variable for the `rabbitmq_stomp` application.

For example, a complete configuration file which changes the listener
port to 12345 would look like:

    [
      {rabbitmq_stomp, [{tcp_listeners, [12345]}]}
    ].

while one which changes the listener to listen only on localhost (for
both IPv4 and IPv6) would look like:

    [
      {rabbitmq_stomp, [{tcp_listeners, [{"127.0.0.1", 61613},
                                         {"::1",       61613}]}]}
    ].

To use SSL for STOMP connections, SSL must be configured in the broker
as described [here](http://www.rabbitmq.com/ssl.html). To enable
STOMP SSL connections, add a listener configuration to the
`ssl_listeners` variable for the `rabbitmq_stomp` application:

    [
      {rabbitmq_stomp, [{tcp_listeners, [61613]},
                        {ssl_listeners, [61614]}]}
    ].

This configuration creates a standard TCP listener on port 61613 and
an SSL listener on port 61614.

### Default User

The RabbitMQ STOMP adapter allows `CONNECT` frames to omit the `login`
and `passcode` headers if a default is configured.

To configure a default login and passcode, add a `default_user`
section to the `rabbitmq_stomp` application configuration:

    [
      {rabbitmq_stomp, [{default_user, [{login, "guest"},
                                        {passcode, "guest"}]}]}
    ].

The configuration example above makes `guest`/`guest` the default
login/passcode pair.

### Implicit Connect

If you configure a default user, you can also choose to allow clients
to omit the `CONNECT` frame entirely. In this mode, if the first frame
sent on a session is not a `CONNECT`, the client is automatically
connected *as the default user*.

To enable implicit connect, add `implicit_connect` to the
`default_user` configuration section:

    [
      {rabbitmq_stomp, [{default_user, [{login, "guest"},
                                        {passcode, "guest"},
                                        implicit_connect]}]}
    ].

Implicit connect is *not* enabled by default.

**Note:** A client causing an implicit connect will *not* receive a
`CONNECTED` frame from the server.

### Testing the Adapter

If the default STOMP adapter is running, you should be able to connect to port 61613
using a STOMP client of your choice. In a pinch, `telnet` or netcat
(`nc`) will do nicely, for example:

      $ nc localhost 61613
      CONNECT

      ^@
    : CONNECTED
    : session:session-QaDdyL5lg5dUx0vSWrnVNg==
    : heart-beat:0,0
    : version:1.0
    :
      DISCONNECT

      ^@
    :
      $

Here `$` is the command prompt; responses are prefixed with `:`
(your session-id may vary);
and Ctrl-@ (`^@`) inserts a zero byte into the stream.
We connect as the default user (note the blank line
after the `CONNECT` line) getting a `CONNECTED` response indicating
that the STOMP adapter is listening and running.
The `DISCONNECT` frame
causes the connection to be dropped.

The script `test.py` runs a full suite of tests and this can be run
using `make test` against a STOMP adapter built from source.
See [Compiling and installing from source](#caifs) above.

## Destinations

The STOMP specification does not prescribe what kinds of destinations
a broker must support, instead the value of the `destination` header
in `SEND` and `MESSAGE` frames is broker-specific. The RabbitMQ STOMP
adapter supports a number of different destination types:

* `/exchange` -- `SEND` to arbitrary routing keys and `SUBSCRIBE` to
arbitrary binding patterns
* `/queue` -- `SEND` and `SUBSCRIBE` to queues managed by the STOMP
gateway
* `/amq/queue` -- `SEND` and `SUBSCRIBE` to queues created outside the
STOMP gateway
* `/topic` -- `SEND` and `SUBSCRIBE` to transient and durable topics
* `/temp-queue/` -- create temporary queues for use in `reply-to` headers

### Exchange Destinations

Any exchange/queue or exchange/routing-key combination can be accessed
using destinations prefixed with `/exchange`.

For `SUBSCRIBE` frames, a destination of the form
`/exchange/<name>[/<pattern>]` can be used. This destination:

* creates an exclusive, auto-delete queue on `<name>` exchange;
* if `<pattern>` is supplied, binds the queue to `<name>` exchange
   using `<pattern>`; and
* registers a subscription against the queue, for the current STOMP session.

For `SEND` frames, a destination of the form
`/exchange/<name>[/<routing-key>]` can be used. This destination:

* sends to exchange `<name>` with the routing key `<routing-key>`.

**Note:** Exchange destinations are *not* suitable for
consuming messages from an existing queue. A new queue is created for
each subscriber and is bound to the specified exchange using the
supplied routing key. To work with existing queues, use 
[`/amq/queue` destinations](#amqdest).

### Queue Destinations

For simple queues, destinations of the form `/queue/<name>` can be
used.

Queue destinations deliver each message to at most one
subscriber. Messages sent when no subscriber exists will be queued
until a subscriber connects to the queue.

#### AMQP Semantics
For both `SEND` and `SUBSCRIBE` frames, these destinations create
the queue `<name>`.

For `SEND` frames, the message is sent to the default exchange
with the routing key `<name>`. For `SUBSCRIBE` frames, a subscription
against the queue `<name>` is created for the current STOMP
session.

<a name="amqdest"/>
### AMQ Queue Destinations

To address existing queues created outside the STOMP adapter,
destinations of the form `/amq/queue/<name>` can be used.

#### AMQP Semantics

For `SEND` frames, the message is sent directly to the existing queue named
`<name>` via the default exchange. No queue is created.

For `SUBSCRIBE` frames, a subscription against the queue `<name>` is
created for the current STOMP session.

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

### Durable Topic Subscriptions

The STOMP adapter supports durable topic subscriptions. Durable
subscriptions allow clients to disconnect from and reconnect to the
STOMP broker as needed, without missing messages that are sent to the
topic.

Topics are neither durable nor transient, instead ***subscriptions***
are durable or transient. Durable and transient can be mixed against a
given topic.

#### Creating a Durable Subscription

To create a durable subscription, set the `persistent` header to
`true` in the `SUBSCRIBE` frame. When creating a durable subscription,
the `id` header must be specified:

    SUBSCRIBE
    destination:/topic/my-durable
    id:1234
    persistent:true

#### AMQP Semantics

For `SEND` frames, the message is sent to the `amq.topic` exchange
with the routing key `<name>`.

For `SUBSCRIBE` frames, a *shared* queue is created for each distinct
subscription ID x destination pair, and bound to the `amq.topic`
exchange with routing key `<name>`. A subscription is created against
the queue.

#### Deleting a Durable Subscription

To permanently delete a durable subscription, send an `UNSUBSCRIBE` frame for
the subscription ID with the `persistent` header set to `true`:

    UNSUBSCRIBE
    id:1234
    persistent:true

### Temp Queue Destinations

Temp queue destinations allow you to define temporary destinations
in the `reply-to` header of a `SEND` frame.

Temp queues are managed by the broker and their identities are private to
each session -- there is no need to choose distinct names for
temporary queues in distinct sessions.

To use a temp queue, put the `reply-to` header on a `SEND` frame:

    SEND
    destination:/queue/reply-test
    reply-to:/temp-queue/foo

    Hello World!

This frame creates a temporary queue (with a generated name) that is private to the
session. A different session that uses `reply-to:/temp-queue/foo` will have a new,
distinct queue created.

The receiving client can obtain the
(real) reply destination queue name from the `reply-to` header of the `MESSAGE` frame.
(Then the client can send a reply message to it.) Reply destination queue names
cannot be inferred from the `/temp-queue/` name.

## Protocol Extensions

The STOMP adapter supports a number of non-standard headers on certain
frames. These extra headers provide access to features that are not
described in the STOMP specs.

### Message Persistence

On the `SEND` frame, the STOMP adapter supports the inclusion of a `persistent` header.

Setting the `persistent` header to `true` has the effect of making the message persistent.

Receipts for `SEND` frames with `persistent:true` are not sent until a
confirm is received from the broker. The exact semantics for confirms
on persistent messages can be found here.

`MESSAGE` frames for persistent messages will contain a `persistent:true`
header.

### AMQP Properties

`SEND` frames also allow headers corresponding to the AMQP properties
available when publishing messages. These headers are also set on
`MESSAGE` frames sent to clients.

The supported headers are:

* `amqp-message-id` -- sets the `message-id` property
* `correlation-id` -- sets the `correlation-id` property
* `content-encoding` -- sets the `content-encoding` property
* `priority` -- sets the `priority` property
* `reply-to` -- sets the `reply-to` property

