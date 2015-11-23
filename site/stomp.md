<!--
Copyright (C) 2007-2015 Pivotal Software, Inc.

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

# RabbitMQ STOMP Adapter NOSYNTAX

The [STOMP](http://stomp.github.com) plugin adds support for the STOMP
protocol to [RabbitMQ](http://www.rabbitmq.com). The adapter supports
[STOMP 1.0](http://stomp.github.com/stomp-specification-1.0.html),
[STOMP 1.1](http://stomp.github.com/stomp-specification-1.1.html) and
[STOMP 1.2](http://stomp.github.com/stomp-specification-1.2.html).
with some extensions and restrictions (described [here](#pear)).


## <a id="ifb"/>Installing from binary

The STOMP adapter is included in the RabbitMQ distribution.  To enable
it, use [rabbitmq-plugins](/man/rabbitmq-plugins.1.man.html):

    rabbitmq-plugins enable rabbitmq_stomp

## <a id="caifs"/>Compiling and installing from source

To build the STOMP adapter from source, follow the instructions for
building the umbrella repository contained in the
[Plugin Development Guide](/plugin-development.html).

You need to install the `rabbitmq_stomp.ez` and `amqp_client.ez` packages.

## <a id="cta"/>Configuring the adapter

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

## TLS/SSL Support

To use SSL for STOMP connections, [SSL must be configured](/ssl.html) in the broker. To enable
STOMP SSL connections, add a listener configuration to the
`ssl_listeners` variable for the `rabbitmq_stomp` application. For example:

    [{rabbit,          [
                        {ssl_options, [{cacertfile, "/path/to/tls/ca/cacert.pem"},
                                       {certfile,   "/path/to/tls/server/cert.pem"},
                                       {keyfile,    "/path/to/tls/server/key.pem"},
                                       {verify,     verify_peer},
                                       {fail_if_no_peer_cert, true}]}
                       ]},
      {rabbitmq_stomp, [{tcp_listeners, [61613]},
                        {ssl_listeners, [61614]}]}
    ].

This configuration creates a standard TCP listener on port 61613 and
an SSL listener on port 61614.

### <a id="cta.du"/>Default User

The RabbitMQ STOMP adapter allows `CONNECT` frames to omit the `login`
and `passcode` headers if a default is configured.

To configure a default login and passcode, add a `default_user`
section to the `rabbitmq_stomp` application configuration. For example:

    [
      {rabbitmq_stomp, [{default_user, [{login, "guest"},
                                        {passcode, "guest"}]}]}
    ].

The configuration example above makes `guest`/`guest` the default
login/passcode pair.

### <a id="cta.ssl"/>Authentication with SSL client certificates

The STOMP adapter can authenticate SSL-based connections by extracting
a name from the client's SSL certificate, without using a password.

For safety the server must be configured with the SSL options
`fail_if_no_peer_cert` set to `true` and `verify` set to `verify_peer`, to
force all SSL clients to have a verifiable client certificate.

To switch this feature on, set `ssl_cert_login` to `true` for the
`rabbitmq_stomp` application. For example:

    [
      {rabbitmq_stomp, [{ssl_cert_login, true}]}
    ].

By default this will set the username to an RFC4514-ish string form of
the certificate's subject's Distinguished Name, similar to that
produced by OpenSSL's "-nameopt RFC2253" option.

To use the Common Name instead, add:

    {rabbit, [{ssl_cert_login_from, common_name}]}

to your configuration.

Note that:

* The authenticated user must exist in the configured authentication / authorisation backend(s).
* Clients must **not** supply `login` and `passcode` headers.

### <a id="cta.ic"/>Implicit Connect

If you configure a default user or use SSL client certificate
authentication, you can also choose to allow clients to omit the
`CONNECT` frame entirely. In this mode, if the first frame sent on a
session is not a `CONNECT`, the client is automatically connected as
the default user or the user supplied in the SSL certificate.

To enable implicit connect, set `implicit_connect` to `true` for the
`rabbit_stomp` application. For example:

    [
      {rabbitmq_stomp, [{default_user,     [{login, "guest"},
                                            {passcode, "guest"}]},
                        {implicit_connect, true}]}
    ].

Implicit connect is *not* enabled by default.

**Note:** A client causing an implicit connect will *not* receive a
`CONNECTED` frame from the server.

### <a id="cta.tta"/>Testing the Adapter

If the default STOMP adapter is running, you should be able to connect to port 61613
using a STOMP client of your choice. In a pinch, `telnet` or netcat
(`nc`) will do nicely. For example:

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

The script `test.py` runs a suite of tests and this can be run
using `make test` against a STOMP adapter built from source.
See [Compiling and installing from source](#caifs) above.

## <a id="d"/>Destinations

The STOMP specification does not prescribe what kinds of destinations
a broker must support, instead the value of the `destination` header
in `SEND` and `MESSAGE` frames is broker-specific. The RabbitMQ STOMP
adapter supports a number of different destination types:

* `/exchange` -- `SEND` to arbitrary routing keys and `SUBSCRIBE` to
arbitrary binding patterns;
* `/queue` -- `SEND` and `SUBSCRIBE` to queues managed by the STOMP
gateway;
* `/amq/queue` -- `SEND` and `SUBSCRIBE` to queues created outside the
STOMP gateway;
* `/topic` -- `SEND` and `SUBSCRIBE` to transient and durable topics;
* `/temp-queue/` -- create temporary queues (in `reply-to` headers only).

#### AMQP 0-9-1 Semantics
The `destination` header on a `MESSAGE` frame is set as though the
message originated from a `SEND` frame:

* messages published to the default exchange are given the destination
`/queue/`*queuename*;
* messages published to `amq.topic` are given the destination
`/topic/`*routing_key*;
* all other messages are given the destination
`/exchange/`*exchange_name*[`/`*routing_key*].

If `/`, `%` or non-ascii bytes are in the *queuename*, *exchange_name*
or *routing_key*, they are each replaced with the sequence `%`*dd*,
where *dd* is the hexadecimal code for the byte.

Because of these rules the destination on a `MESSAGE` frame may not
exactly match that on a `SEND` that published it.

### <a id="d.ed"/>Exchange Destinations

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
[`/amq/queue`](#d.aqd) destinations.

### <a id="d.qd"/>Queue Destinations

For simple queues, destinations of the form `/queue/<name>` can be
used.

Queue destinations deliver each message to at most one
subscriber. Messages sent when no subscriber exists will be queued
until a subscriber connects to the queue.

#### AMQP 0-9-1 Semantics
For `SUBSCRIBE` frames, these destinations create a shared queue `<name>`. A
subscription against the queue `<name>` is created for the current STOMP
session.

For `SEND` frames, a shared queue `<name>` is created on the _first_ `SEND` to
this destination in this session, but not subsequently. The message is sent to
the default exchange with the routing key `<name>`.


### <a id="d.aqd"/>AMQ Queue Destinations

To address existing queues created outside the STOMP adapter,
destinations of the form `/amq/queue/<name>` can be used.

#### AMQP 0-9-1 Semantics
For both `SEND` and `SUBSCRIBE` frames no queue is created.
For `SUBSCRIBE` frames, it is an error if the queue does not exist.

For `SEND` frames, the message is sent directly to the existing queue named
`<name>` via the default exchange.

For `SUBSCRIBE` frames, a subscription against the existing queue `<name>` is
created for the current STOMP session.

### <a id="d.td"/>Topic Destinations

For simple topic destinations which deliver a copy of each message to
all active subscribers, destinations of the form `/topic/<name>` can
be used. Topic destinations support all the routing patterns of AMQP
topic exchanges.

Messages sent to a topic destination that has no active subscribers
are simply discarded.

#### AMQP 0-9-1 Semantics

For `SEND` frames, the message is sent to the `amq.topic` exchange
with the routing key `<name>`.

For `SUBSCRIBE` frames, an exclusive queue is created and bound to the
`amq.topic` exchange with routing key `<name>`. A subscription is
created against the exclusive queue.

### <a id="d.dts"/>Durable Topic Subscriptions

The STOMP adapter supports durable topic subscriptions. Durable
subscriptions allow clients to disconnect from and reconnect to the
STOMP broker as needed, without missing messages that are sent to the
topic.

Topics are neither durable nor transient, instead ***subscriptions***
are durable or transient. Durable and transient can be mixed against a
given topic.

#### Creating a Durable Subscription

To create a durable subscription, set the `durable` header to
`true` in the `SUBSCRIBE` frame. `persistent` is also supported as an alias for
`durable` for backwards compatibility with earlier plugin versions.

When creating a durable subscription to a topic destination,
set `auto-delete` to `false` to make sure the queue that backs your
subscription is not deleted when last subscriber disconnects.

When creating a durable subscription,
the `id` header must be specified. For example:

    SUBSCRIBE
    destination:/topic/my-durable
    id:1234
    durable:true
    auto-delete:false

#### AMQP 0-9-1 Semantics

For `SEND` frames, the message is sent to the `amq.topic` exchange
with the routing key `<name>`.

For `SUBSCRIBE` frames, a *shared* queue is created for each distinct
subscription ID x destination pair, and bound to the `amq.topic`
exchange with routing key `<name>`. A subscription is created against
the queue.

#### Deleting a Durable Subscription

To permanently delete a durable subscription, send an `UNSUBSCRIBE` frame for
the subscription ID with the same `durable` and `auto-delete` header values as when
subscribing.

For example:

    UNSUBSCRIBE
    id:1234
    durable:true
    auto-delete:false

### <a id="d.tqd"/>Temp Queue Destinations

Temp queue destinations allow you to define temporary destinations
in the `reply-to` header of a `SEND` frame.

Temp queues are managed by the broker and their identities are private to
each session -- there is no need to choose distinct names for
temporary queues in distinct sessions.

To use a temp queue, put the `reply-to` header on a `SEND` frame and
use a header value starting with `/temp-queue/`. For example:

    SEND
    destination:/queue/reply-test
    reply-to:/temp-queue/foo

    Hello World!

This frame creates a temporary queue (with a generated name) that is private
to the session and automatically subscribes to that queue.
A different session that uses `reply-to:/temp-queue/foo` will have a new,
distinct queue created.

The internal subscription id is a concatenation of the string
`/temp-queue/` and the temporary queue (so `/temp-queue/foo`
in this example). The subscription id can be used to identify reply
messages. Reply messages cannot be identified from the `destination`
header, which will be different from the value in the `reply-to`
header. The internal subscription uses auto-ack mode and it cannot be
cancelled.

The `/temp-queue/` destination is ***not*** the name of the destination
that the receiving client uses when sending the reply. Instead, the
receiving client can obtain the (real) reply destination queue name
from the `reply-to` header of the `MESSAGE` frame.  This reply
destination name can then be used as the value of the `destination`
header in the `SEND` frame sent in reply to the received
`MESSAGE`.

Reply destination queue names are opaque and cannot be inferred from
the `/temp-queue/` name.

`SEND` and `SUBSCRIBE` frames ***must not*** contain `/temp-queue`
destinations in the `destination` header. Messages cannot be sent to
`/temp-queue` destinations, and subscriptions to reply queues are
created automatically.

#### AMQP 0-9-1 Semantics

Each `/temp-queue/` corresponds to a distinct anonymous, exclusive,
auto delete queue. As such, there is no need for explicit clean up of
reply queues.

### <a id="d.ugqn"/>User generated queue names for Topic and Exchange destinations

When subscribing to an `exchange` or `topic` destination, RabbitMQ would generate
a queue name by default. Starting with version 3.5.7, is it possible to provide
a custom name using the `x-queue-name` header:

    SUBSCRIBE
    destination:/topic/alarms
    x-queue-name:my-alarms-queue

## Controlling RabbitMQ Queue Parameters with STOMP

As of RabbitMQ 3.6.0, it is possible to control queue parameters via STOMP
headers:

 * `durable` (aliased as `persistent`)
 * `auto-delete`
 * `exclusive`

plus optional arguments ("x-arguments") for controlling dead lettering,
queue and message TTL, queue limits, etc:

 * `x-dead-letter-exchange`
 * `x-dead-letter-routing-key`
 * `x-expires`
 * `x-message-ttl` 
 * `x-max-length`
 * `x-max-length-bytes`
 * `x-max-length-bytes`
 * `x-max-priority`

The meaning of every header is the same as when a queue is declared over AMQP 0-9-1.
Please consult the rest of the documentation for details.

## Using Policies with STOMP

RabbitMQ [policies](https://www.rabbitmq.com/parameters.html#policies) allow for flexible,
centralised attribute configuration of queues and exchanges. Policies can
be used with queues used by the STOMP plugin.

Policies make it possible to use more RabbitMQ features with STOMP:

 * [Mirrored queues](/ha.html)
 * [Dead lettering](/dlx.html)
 * [Queue leases and per-queue message TTL](/ttl.html)
 * [Queue length limits](/maxlength.html)

All server-named queues created by the STOMP plugin are prefixed with `stomp-`
which makes it easy to match the queues in a policy. For example, to limit
STOMP queue length to 1000 messages, create the following policy:

<pre>rabbitmqctl set_policy stomp-queues "^stomp-" '{"max-length":1000}' --apply-to queues</pre>

Note that only one policy is applied to a queue at a time, so to specify
multiple arguments (e.g. queue length limit and dead lettering) one
needs to put them into a single policy.


## <a id="pear"/>Protocol Extensions and Restrictions

The RabbitMQ STOMP adapter relaxes the protocol on `CONNECT`
and supports a number of non-standard headers on certain
frames. These extra headers provide access to features that are not
described in the STOMP specs. In addition, we prohibit some headers which
are reserved for server use. The details are given below.

### <a id="pear.c"/>Connection and Virtual Hosts

The `CONNECT` (or `STOMP`) frame in
[STOMP 1.1](http://stomp.github.com/stomp-specification-1.1.html) has a
mandatory `host` header (to select the virtual host to use for the
connection). The RabbitMQ adapter allows this to be optional.

When omitted, the default virtual host (`/`) is presumed.
To configure a different default virtual host, add a `default_vhost`
section to the `rabbitmq_stomp` application configuration, e.g.

    [
      {rabbitmq_stomp, [{default_vhost, <<"/">>}]}
    ].

If a `host` header is specified it must be one of the
virtual hosts known to the RabbitMQ server, otherwise the connection is
rejected. The `host` header is respected even if the STOMP 1.0 version is
negotiated at the time of the connect.

### <a id="pear.mp"/>Message Persistence

On the `SEND` frame, the STOMP adapter supports the inclusion of a `persistent` header.

Setting the `persistent` header to `true` has the effect of making the message persistent.

Receipts for `SEND` frames with `persistent:true` are not sent until a
confirm is received from the broker. The exact semantics for confirms
on persistent messages can be found [here](confirms.html).

`MESSAGE` frames for persistent messages will contain a `persistent:true`
header.

### <a id="ack-nack">ACK and NACK</a>

RabbitMQ STOMP plugin supports `auto`, `client`, and `client-individual`
subscription headers that affect how `ACK` on `NACK` operations work.

The `auto` mode uses automatic acknowledgements. The `client` mode is manual
(client-driven) acknowledgements of multiple messages at once. The `client-individual`
is for message-by-message manual acknowledgement.

`NACK` frames can optionally carry the `requeue` header which controls whether
the message will be requeued or discarded/dead lettered. Default value is `true`.

### <a id="pear.p"/>Prefetch

The prefetch count for all subscriptions is set to unlimited by
default. This can be controlled by setting the `prefetch-count` header
on `SUBSCRIBE` frames to the desired integer count.

### <a id="pear.hpos"/>Header prohibited on `SEND`

It is not permitted to set a `message-id` header on a `SEND` frame.
The header and its value is set by the server on a `MESSAGE` frame sent
to a client.

### <a id="pear.ap"/>Queue Properties

`SEND` frames also allow headers corresponding to the *AMQP properties*
available when publishing messages. These headers are also set on
`MESSAGE` frames sent to clients.

All non-deprecated AMQP 0-9-1 properties (`content-type`,
`content-encoding`, `headers`, `delivery-mode`, `priority`,
`correlation-id`, `reply-to`, `expiration`, `message-id`, `timestamp`,
`type`, `user-id` and `app-id`) are supported. The following special
rules apply:

* `amqp-message-id` in STOMP is converted to `message-id` in AMQP, and
  vice-versa.
* The `reply-to` header causes temporary queues to be created (see
  [Temp Queue Destinations](#d.tqd) above).
* Some x-prefixed STOMP headers are translated into optional queue arguments
  (see below).


### Optional Queue Properties

As of RabbitMQ 3.5.5, SEND and SUBSCRIBE frames accepts a set of headers to configure the queue behaviour,
for example, use [TTL](/ttl.html) or similar extensions.

The list of supported headers is

 * [x-message-ttl](/ttl.html#per-message-ttl)
 * [x-expires](/ttl.html#queue-ttl)
 * [x-max-length](/maxlength.html)
 * [x-max-length-bytes](/maxlength.html)
 * [x-dead-letter-exchange](/dlx.html)
 * [x-dead-letter-routing-key](/dlx.html)
 * [x-max-priority](/priority.html)

For example, if you want to use priority queues with STOMP, you
can SUBSCRIBE (or SEND) with the following header:

    SUBSCRIBE
    destination:/queue/my-priority-queue
    x-max-priority:5

### Queue Immutability

Once a queue is declared, its properties cannot be changed. Optional arguments
can be modified with [policies](/parameters.html). Otherwise the queue has to be deleted
and re-declared. This is true for STOMP clients as well as AMQP 0-9-1.
