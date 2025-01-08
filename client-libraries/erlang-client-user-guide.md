---
title: Erlang RabbitMQ Client library
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

# Erlang RabbitMQ Client library

## Overview {#overview}

This guide covers an Erlang client for RabbitMQ (<a href="/tutorials/amqp-concepts">AMQP 0-9-1</a>).

This user guide assumes that the reader is familiar with <a href="/tutorials/amqp-concepts">basic concepts of AMQP 0-9-1</a>.

Refer to guides on [connections](/docs/connections), [channels](/docs/channels), [queues](/docs/queues),
[publishers](/docs/publishers), and [consumers](/docs/consumers) to learn about those
key RabbitMQ concepts in more details.

Some topics covered in this guide include

 * [How to add a dependency](#dependency) on this client
 * [Usage basics](#basics)
 * How to [connect](#connecting) to and [disconnect](#disconnecting) from a RabbitMQ node
 * How to [open a channel](#channels) and [perform protocol operations](#methods) on it
 * How to [define a topology](#topology): declare queues, exchanges and bindings
 * [Publishing](#publishing) and [consumption](#consumers) of messages
 * Handling of [returned messages](#returns)

and more.

## Dependency {#dependency}

The client library is named `amqp_client` and [distributed via Hex.pm](https://hex.pm/packages/amqp_client)
together with its key dependency, [`rabbit-common`](https://hex.pm/packages/rabbit_common).

Below are dependency snippets to be used with popular build tools: Mix,
[Rebar 3](https://www.rebar3.org/docs/getting-started) and [erlang.mk](https://erlang.mk).

### Mix

```elixir
{:rabbit_common, "~> 3.8"}
```

### Rebar 3

```erlang
{rabbit_common, "&version-erlang-client;"}
```

### erlang.mk

```makefile
dep_rabbit_common = hex &version-erlang-client;
```


## Basics {#basics}

The basic usage of the client follows these broad steps:

1. Make sure the `amqp_client` Erlang application is started
2. Establish a [connection](/docs/connections) to a RabbitMQ node
3. Open a new channel on the connection
4. Execute [AMQP 0-9-1 commands](https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/pdf/amqp-xml-doc0-9-1.pdf) with a channel such as
   declaring exchanges and queues, defining bindings between them, publishing messages,
   registering consumers (subscribing), and so on
5. Register optional event handlers such as [returned message handler](#returns)
6. When no longer required, close the channel and the connection


### The amqp_client Application {#amqp-client-app}

RabbitMQ Erlang client is an Erlang application named `amqp_client`.

As with any Erlang application, to begin using the client it's necessary to first
make sure it is started:

```erlang
application:ensure_started(amqp_client).
```

### Key Modules and Concepts {#key-modules}

The main two modules in the client library are:

 * `amqp_connection`, which is used to open a connection to a
    RabbitMQ node and open channels on it
 * `amqp_channel`, which exposes most AMQP 0-9-1 operations such as queue declaration
   or consumer registration

Once a connection has been established and successfully [authenticated](/docs/access-control),
and a channel has been opened, an application will typically use the
`amqp_channel:call/{2,3}` and `amqp_channel:cast/{2,3}` functions
together with AMQP 0-9-1 protocol method records to perform most operations.

Several additional modules make it possible for applications to react to certain events.
They will be covered later in this guide.

The library is made up of two layers:

 * A high level logical layer that follows the AMQP 0-9-1 protocol and operation execution model
 * A low-level protocol implementation layer that is responsible for communicating with RabbitMQ nodes

### Network Connection Types {#driver-types}

AMQP 0-9-1 clients connect to RabbitMQ using TCP. One AMQP 0-9-1 connection uses one TCP connection
under the hood. However, the Erlang client is unique in that it provides
an alternative way of communicating with RabbitMQ nodes.

#### Network Client

Much like other clients, this library provides a TCP-based client that uses a TCP connection
to transfer serialised protocol frames to the server. This client is called
the network client and most applications should use.

To use the network client, [start a connection](#connecting) using `amqp_connection:start/1` with the
parameter set to an `#amqp_params_network` record.

#### Direct (Erlang Distribution) Client

Alternatively, Erlang distribution connections can be used instead of separate TCP
connections. This communication method assumes that the application that uses
the client runs on the same Erlang cluster as RabbitMQ nodes.

The use of direct client should be limited to applications that are deployed
side by side with RabbitMQ. [Shovel](/docs/shovel) and [Federation](/docs/federation)
plugins are two examples of such applications.

In most other cases, developers should prefer the more traditional network client covered above.
It will be easier to reason about for operators and developers not familiar with Erlang.

To use the direct driver, [start a connection](#connecting) using `amqp_connection:start/1` with the
parameter set to an `#amqp_params_direct` record.


### Including Header Files {#headers}

The Erlang client uses a number of record definitions which you
will encounter in this guide. These records fall into two broad
categories:

 * Generated AMQP 0-9-1 method definitions
 * Definitions of data structures that are commonly used throughout the client

To gain access to these records, you need to include the
amqp_client.hrl in every module that uses the Erlang client:

```erlang
-include("amqp_client.hrl").
```



## Connecting to RabbitMQ {#connecting}

The `amqp_connection` module is used to start a [connection](/docs/connections) to a RabbitMQ node.
In this example we will use a network connection, which is the recommended
option for most use cases:

```erlang
{ok, Connection} = amqp_connection:start(#amqp_params_network{})
```

This function returns an `{ok, Connection}` pair, where `Connection` is the
pid of a process that maintains a permanent connection.
This pid will be used to open channels on the connection and [close the connection](#disconnecting).

In case of an error, the above call returns an `{error, Error}` pair.

The `#amqp_params_network` record sets the following default values:

<table>
  <thead>
    <tr>
      <td>Parameter</td>
      <td>Default Value</td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>username</td>
      <td>guest</td>
    </tr>
    <tr>
      <td>password</td>
      <td>guest</td>
    </tr>
    <tr>
      <td>virtual_host</td>
      <td>/</td>
    </tr>
    <tr>
      <td>host</td>
      <td>localhost</td>
    </tr>
    <tr>
      <td>port</td>
      <td>5672</td>
    </tr>
    <tr>
      <td>channel_max</td>
      <td>2047</td>
    </tr>
    <tr>
      <td>frame_max</td>
      <td>0</td>
    </tr>
    <tr>
      <td><a href="/docs/heartbeats">heartbeat</a></td>
      <td>0</td>
    </tr>
    <tr>
      <td><a href="/docs/ssl">ssl_options</a></td>
      <td>none</td>
    </tr>
    <tr>
      <td>auth_mechanisms</td>
      <td>[fun amqp_auth_mechanisms:plain/3, fun amqp_auth_mechanisms:amqplain/3]</td>
    </tr>
    <tr>
      <td>client_properties</td>
      <td>[]</td>
    </tr>
  </tbody>
</table>

These values are only the defaults that will work with an out of
the box RabbitMQ node running on the same host. If the target node or the
environment has been configured differently, these values can be
overridden to match the actual deployment scenario.

TLS options can also be specified globally using the
`ssl_options` environment key for the `amqp_client` application.
They will be merged with the TLS parameters from the URI (the latter will take precedence).

### Direct (Erlang Distribution) Client

Applications that are deployed inside the same Erlang cluster as the
RabbitMQ, such as RabbitMQ plugins, can start a direct connection
that bypasses network serialisation and relies on Erlang distribution
for data transfers.

To start a direct connection, use `amqp_connection:start/1` with the parameter
set to an `#amqp_params_direct` record:

```erlang
{ok, Connection} = amqp_connection:start(#amqp_params_direct{})
```

Credentials are optional for direct connections, since Erlang
distribution relies on [a shared secret](/docs/clustering#erlang-cookie), the Erlang cookie, for authentication.

If a username and password are provided then they will be used for authentication and
made available to authentication backends.

If only a username is supplied, then the user is considered trusted and logged in
unconditionally.

If neither username nor password are provided, then the connection will be considered
to be from a fully trusted user which can connect to any virtual host and has
full [permissions](/docs/access-control).

The `#amqp_params_direct` record sets the following default values:

<table>
  <thead>
    <tr>
      <td>Parameter</td>
      <td>Default Value</td>
    </tr>
  </thead>

  <tr>
    <td>username</td>
    <td>none</td>
  </tr>
  <tr>
    <td>password</td>
    <td>none</td>
  </tr>
  <tr>
    <td>virtual_host</td>
    <td>/</td>
  </tr>
  <tr>
    <td>node</td>
    <td>node()</td>
  </tr>
  <tr>
    <td>client_properties</td>
    <td>[]</td>
  </tr>
</table>

### Connecting to RabbitMQ Using an AMQP URI {#amqp-uris}

Instead of working with records such `#amqp_params_network` directly,
<a href="/docs/uri-spec">AMQP URIs</a> may be used.

The `amqp_uri:parse/1` function is provided for this purpose.
It parses an URI and returns the equivalent `#amqp_params_network` or `#amqp_params_direct` record.

Diverging from the spec, if the hostname is omitted, the
connection is assumed to be direct and an `#amqp_params_direct{}`
record is returned.  In addition to the standard host, port, user,
password and vhost parameters, extra parameters may be specified
via the query string (e.g. "?heartbeat=5" to configure a [heartbeat timeout](/docs/heartbeats)).


## Creating Channels {#channels}

Once a connection has been established, use the `amqp_connection` module
to open one or more [channels](/docs/channels) that will be used
to define the topology, publish and consume messages:

```erlang
{ok, Channel} = amqp_connection:open_channel(Connection)
```

This function takes the pid of the connection process and returns
a `{ok, Channel}` pair, where `Channel` is a pid that represents
a channel and will be used to execute protocol commands.


## Using AMQP 0-9-1 Methods (Protocol Operations) {#methods}

The client library's primary way of interacting with RabbitMQ nodes is by
sending and handling [AMQP 0-9-1 methods](/docs/specification)
(also referred to as "commands" in this guide) that are represented by records.

The client tries to use sensible default values for each record.
For example, when using the `#'exchange.declare'{}` method to declare a transient exchange,
it is sufficient to only specify a name:

```erlang
#'exchange.declare'{exchange = <<"my_exchange">>}
```

The above example is equivalent to this:

```erlang
#'exchange.declare'{exchange    = <<"my_exchange">>,
                    type        = <<"direct">>,
                    passive     = false,
                    durable     = false,
                    auto_delete = false,
                    internal    = false,
                    nowait      = false,
                    arguments   = []}
```


## Defining a Topology: Exchanges, Queues, Bindings {#topology}

Once a channel has been established, the `amqp_channel` module can
be used to manage the fundamental objects within AMQP, namely
exchanges and queues. The following function creates an exchange
called my_exchange, which by default, is the direct exchange:

```erlang
Declare = #'exchange.declare'{exchange = <<"my_exchange">>},
#'exchange.declare_ok'{} = amqp_channel:call(Channel, Declare)
```

Similarly, a [transient](/docs/queues#durability) queue called `my_queue` is created by this code:

```erlang
Declare = #'queue.declare'{queue = <<"my_queue">>},
#'queue.declare_ok'{} = amqp_channel:call(Channel, Declare)
```

To declare a durable queue:

```erlang
Declare = #'queue.declare'{
  queue = <<"my_queue">>,
  durable = true
},
#'queue.declare_ok'{} = amqp_channel:call(Channel, Declare)
```

In some cases an application wants to use a transient queue and is not interested in the actual name
of the queue. In this case, it is possible to let the broker generate a random name for a
queue. To do this, use a `#'queue.declare'{}` method and leave the
queue attribute undefined. Specifying a blank string for queue name
would have the same effect.

```erlang
#'queue.declare_ok'{queue = Queue} = amqp_channel:call(Channel, #'queue.declare'{})
```

The server will generate a queue name unique in this cluster and return this name as
part of the acknowledgement.

### Bindings

To create a routing rule from an exchange to a queue, the
`#'queue.bind'{}` command is used:

```erlang
Binding = #'queue.bind'{queue       = Queue,
                        exchange    = Exchange,
                        routing_key = RoutingKey},
#'queue.bind_ok'{} = amqp_channel:call(Channel, Binding)
```

When this routing rule is no longer required, this route can be
deleted using the `#'queue.unbind'{}` command:

```erlang
Binding = #'queue.unbind'{queue       = Queue,
                          exchange    = Exchange,
                          routing_key = RoutingKey},
#'queue.unbind_ok'{} = amqp_channel:call(Channel, Binding)
```

### Deleting Entities

An exchange can be deleted by the `#'exchange.delete'{}` command:

```erlang
Delete = #'exchange.delete'{exchange = <<"my_exchange">>},
#'exchange.delete_ok'{} = amqp_channel:call(Channel, Delete)
```

Similarly, a queue is deleted using the `#'queue.delete'{}` command:

```erlang
Delete = #'queue.delete'{queue = <<"my_queue">>},
#'queue.delete_ok'{} = amqp_channel:call(Channel, Delete)
```

### Synchronous and Asynchronous Protocol Methods, Calls and Casts {#call-or-cast}

Note that the above examples use `amqp_channel:call/2`.
This is because they use synchronous AMQP 0-9-1 methods that produce a response
(unlike a group of methods called asynchronous methods).

It is generally advisable to use `amqp_channel:call/{2,3}` for synchronous methods,
rather than `amqp_channel:cast/{2,3}`, even though both functions work with both
sync and async methods.

One difference between the two functions is that `amqp_channel:call/{2,3}` blocks the calling
process until the reply comes back from the server (for sync methods) or the method
has been sent on the wire (for async methods), whereas `amqp_channel:cast/{2,3}`
returns an 'ok' immediately.

Thus, only by using `amqp_channel:call/{2,3}` can we verify that the server
has acknowledged our command.



## Publishing Messages {#publishing}

To publish a message to an exchange with a particular routing key,
the `#'basic.publish'{}` method.
Messages are represented using the `#amqp_msg{}` record:

```erlang
Payload = <<"foobar">>,
Publish = #'basic.publish'{exchange = X, routing_key = Key},
amqp_channel:cast(Channel, Publish, #amqp_msg{payload = Payload})
```

By default, the properties field of the `#amqp_msg{}` record contains
a minimal set of [message properties](/docs/publishers#message-properties) as a `#'P_basic'{}` properties record.

If an application needs to override any of the defaults, for example,
to send persistent messages, the `#amqp_msg{}` needs to
be constructed accordingly:

```erlang
Payload = <<"foobar">>,
Publish = #'basic.publish'{exchange = X, routing_key = Key},
Props = #'P_basic'{delivery_mode = 2}, %% persistent message
Msg = #amqp_msg{props = Props, payload = Payload},
amqp_channel:cast(Channel, Publish, Msg)
```

Full list of [message properties](/docs/publishers#message-properties) can be found
in the Publishers guide.

The AMQP 0-9-1 `#'basic.publish'` method is [asynchronous](#call-or-cast):
the server will not send a response to it. However, clients can opt in
to have [unroutable messages](/docs/publishers#unroutable) returned to them.
This is described in the section on [return message handlers](#returns).

The above example does not use [Publisher Confirms](/docs/confirms).
To await for all outstanding publishes to be confirmed after publishing
a batch of messages, use `amqp_channel:wait_for_confirms/2` function.
It will return a `true` if all outstanding publishes were successfully confirmed
or a `timeout` if timeout has occurred.

Note that waiting after every published message is extremely inefficient
and unnecessary. A more optimal way would be to publish a batch of messages
and await their confirmation. If some publishes were not confirmed in time,
the entire last batch can be republished.


## Consumers: Subscribing To Queues Using the "Push API" {#consumers}

Applications can subscribe to be delivered messages routed to a queue. This "push API" is the
recommended way of consuming messages (the other being [polling](#polling), which should be
avoided when possible).

To add a consumer to a queue (subscribe to a queue), the
`#'basic.consume'{}` method is used in one of two ways:

```erlang
#'basic.consume_ok'{consumer_tag = Tag} =
  amqp_channel:subscribe(Channel, #'basic.consume'{queue = Q}, Consumer)
```

or

```erlang
%% A consumer process is not provided so the calling
%% process (`self()`) will be the consumer
#'basic.consume_ok'{consumer_tag = Tag} =
  amqp_channel:call(Channel, #'basic.consume'{queue = Q})
```

The consumer argument is the pid of a process to which the client library
will deliver messages.
This can be an arbitrary Erlang process, including the process that initiated
the connection.
The `#'basic.consume_ok'{}` return contains a consumer tag. The tag is a consumer
(subscription) identifier that is used to cancel the consumer.

This is used at a later point in time to cancel the consumer.
This notification is sent both to the process that created the subscription
(as the return value to `amqp_channel:subscribe/3`) and
as a message to the consumer process.

When a consumer process is subscribed to a queue, it will receive
messages in its mailbox. An example receive loop looks like this:

```erlang
loop(Channel) ->
    receive
        %% This is the first message received
        #'basic.consume_ok'{} ->
            loop(Channel);

        %% This is received when the subscription is cancelled
        #'basic.cancel_ok'{} ->
            ok;

        %% A delivery
        {#'basic.deliver'{delivery_tag = Tag}, Content} ->
            %% Do something with the message payload
            %% (some work here)

            %% Ack the message
            amqp_channel:cast(Channel, #'basic.ack'{delivery_tag = Tag}),

            %% Loop
            loop(Channel)
    end.
```

In the above example, the process consumes the consumer registration (subscription)
notification and then proceeds to wait for delivery messages to
arrive in its process mailbox.

When messages are received, the loop does something useful with the message and
sends an [acknowledgement](/docs/confirms) back to the server.
If the consumer is cancelled, a cancellation notification will be sent to the
consumer process. In this scenario, the receive loop just
exits. If the application does not wish to explicitly acknowledge
message receipts, it can use automatic acknowledgement mode.
For that, set the `no_ack` property of `#'basic.consume'` record
to `true`. When in automatic acknowledgement mode, consumers do not
acknowledge deliveries: RabbitMQ will consider them delivered
immediately after sending them down the connection.

### Cancelling a Consumer

To cancel a consumer, use the consumer tag returned
with the `#'basic.consume_ok'{}` response:

```erlang
amqp_channel:call(Channel, #'basic.cancel'{consumer_tag = Tag})
```

A cancelled consumer may still receive "in flight" deliveries, e.g. those
currently in TCP buffers at the time of consumer cancellation.
However, eventually — and usually shortly after — consumer cancellation there
will be no further deliveries to its handling process.


## Implementation of Consumers {#consumers-imlementation}

The channel uses a module implementing the `amqp_gen_consumer`
behaviour to determine how it should handle consumer events.
Effectively, this module handles client-side
consumer registration and ensures routing of deliveries to the appropriate consumers.

For instance, the default consumer module, `amqp_selective_consumer`,
keeps track of which processes are subscribed to which queues and routes deliveries appropriately;
in addition, if the channel gives it a delivery for an unknown
consumer, it will pass it to a default consumer, should one be registered.

By contrast, `amqp_direct_consumer` simply forwards all the
messages it receives from the channel to its only registered consumer.

The consumer module for a channel is chosen when the channel is
opened by setting the second parameter to `amqp_connection:open_channel/2`.

The consumer module implements the `amqp_gen_consumer` behaviour and thus implements functions to handle
receiving `basic.consume`, `basic.consume_ok`, `basic.cancel`, `basic.cancel_ok` methods as well
delivery of published messages.


## Closing Channels And The Connection {#disconnecting}

When a channel is no longer required, a client should close it.
This is achieved using `amqp_channel:close/1`:

```erlang
amqp_channel:close(Channel)
```

To close the connection, `amqp_connection:close/1` is used:

```erlang
amqp_connection:close(Connection)
```

Closing a connection will automatically implicitly close all channels
on that connection.

Both the #'channel.close'{} and #'connection.close'{} commands
take the arguments `reply_code` (an integer) and `reply_text` (a binary),
which can be set by the client depending on the reason why
the channel or connection is being closed.

In most cases the `reply_code` should set to 200 to indicate a normal shutdown.
The `reply_text` attribute is just an arbitrary string, that the server
may or may not log. If a client wants to set to a different reply
code and/or text, it can use the overloaded functions
`amqp_channel:close/3` and `amqp_connection:close/3` respectively.


## Delivery Flow Control {#flow}

By default, there is no flow control within a channel other than
normal TCP back-pressure. A consumer can set the size of the
prefetch buffer that the broker will maintain for outstanding
unacknowledged messages on a single channel. This is achieved
using the #'basic.qos'{} command:

```erlang
amqp_channel:call(Channel, #'basic.qos'{prefetch_count = Prefetch})
```

Applications are recommended to use a prefetch. Learn more in the
[Publisher Confirms and Consumer Acknowledgements guide](/docs/confirms).


## Blocked Connections {#blocked}

When a node detects that it is below a certain available resource threshold,
it may <a href="/docs/alarms">choose to stop reading from publishers' network sockets</a>.

RabbitMQ supports [a mechanism to allow clients to be told this has taken place](/docs/connection-blocked).

Use `amqp_connection:register_blocked_handler/2` giving the
pid of a process to which `#'connection.blocked'{}` and
`#'connection.unblocked'{}` should may be sent.


## Handling Returned Messages {#returns}

The broker will return undeliverable messages back to the
originating client. These are messages published either with the
immediate or mandatory flags set. In order for the application to
get notified of a return, it must register a callback process
that can process `#'basic.return'{}` frames.

Here is an example of unrouteable message handling:

```erlang
amqp_channel:register_return_handler(Channel, self()),
amqp_channel:call(Channel, #'exchange.declare'{exchange = X}),
Publish = #'basic.publish'{exchange = X, routing_key = SomeKey,
                          mandatory = true},
amqp_channel:call(Channel, Publish, #amqp_msg{payload = Payload}),
receive
    {BasicReturn, Content} ->
        #'basic.return'{reply_text = <<"unroutable">>, exchange = X} = BasicReturn
        %% Do something with the returned message
end
```


## Receiving Messages Using the "Fetch API" {#polling}

It is also possible to retrieve individual messages on demand ("pull API" a.k.a. polling).
This approach to consumption is highly inefficient as it is effectively polling
and applications repeatedly have to ask for results even if the vast majority of the requests
yield no results. Therefore using this approach **is highly discouraged**.

This is achieved using the `#'basic.get'{}` command:

```erlang
Get = #'basic.get'{queue = Q, no_ack = true},
{#'basic.get_ok'{}, Content} = amqp_channel:call(Channel, Get),
#amqp_msg{payload = Payload} = Content
```

The payload that is returned is an Erlang binary, and it is up to
the application to decode it, as the structure of this content is
opaque to both client library and the server.

If the queue were empty when the `#'basic.get'{}` command was
invoked, then the channel will return an `#'basic.get_empty'`
result, as illustrated here:

```erlang
#'basic.get_empty'{} = amqp_channel:call(Channel, Get)
```

Note that the previous example sets the no_ack flag on the
`#'basic.get'{}` command. This tells the broker that the receiver
will not send an acknowledgement of the message. In doing so, the
broker can absolve itself of the responsibility for delivery -
once it believes it has delivered a message, then it is free to
assume that consuming application has taken responsibility for
it. In general, a lot of applications will not want these
semantics, rather, they will want to explicitly acknowledge the
receipt of a message. This is done with the #'basic.ack'{}
command, where the no_ack field is turned off by default:

```erlang
Get = #'basic.get'{queue = Q},
{#'basic.get_ok'{delivery_tag = Tag}, Content}
    = amqp_channel:call(Channel, Get),
%% Do something with the message payload.......and then ack it
amqp_channel:cast(Channel, #'basic.ack'{delivery_tag = Tag})
```

Notice that the `#'basic.ack'{}` method was sent using
`amqp_channel:cast/2` instead of `amqp_channel:call/2`. This is
because acknowledgements are entirely asynchronous and the server
will not produce a response for them.


## A Basic Example {#example}

Below is a complete example of basic usage of the library. For the sake of simplicity
it does not use [publisher confirms](/docs/confirms) and uses a [polling consumer](#polling) which performs
[manual acknowledgements](/docs/confirms).

```erlang
-module(amqp_example).

-include("amqp_client.hrl").

-compile([export_all]).

test() ->
    %% Start a network connection
    {ok, Connection} = amqp_connection:start(#amqp_params_network{}),
    %% Open a channel on the connection
    {ok, Channel} = amqp_connection:open_channel(Connection),

    %% Declare a queue
    #'queue.declare_ok'{queue = Q}
        = amqp_channel:call(Channel, #'queue.declare'{}),

    %% Publish a message
    Payload = <<"foobar">>,
    Publish = #'basic.publish'{exchange = <<>>, routing_key = Q},
    amqp_channel:cast(Channel, Publish, #amqp_msg{payload = Payload}),

    %% Poll for a message
    Get = #'basic.get'{queue = Q},
    {#'basic.get_ok'{delivery_tag = Tag}, Content}
         = amqp_channel:call(Channel, Get),

    %% Do something with the message payload
    %% (some work here)

    %% Ack the message
    amqp_channel:cast(Channel, #'basic.ack'{delivery_tag = Tag}),

    %% Close the channel
    amqp_channel:close(Channel),
    %% Close the connection
    amqp_connection:close(Connection),

    ok.
```

In this example, a queue is created with a server generated name
and a message is published directly to the queue. This makes use
of the fact that every queue is bound to the default exchange via
its own queue name. The message is then dequeued and acknowledged.


## Compiling Code with Client as a Dependency {#deployment}

The client build process produces two deployment archives:

* amqp_client.ez, which contains all of the client library modules
 * rabbit_common.ez, which contains the common modules from the server that are required at run-time

Both dependencies can be provisioned using build tools such as [Rebar 3](https://www.rebar3.org/docs/getting-started)
or [erlang.mk](https://erlang.mk).

For the sake of an example. let's assume that the dependency management tool
used compiles dependencies under the `./deps` directory.

Then to compile the example code manually, `erlc` can be used with `ERL_LIBS` pointing to the
`./deps` directory:

```bash
ERL_LIBS=deps erlc -o ebin amqp_example.erl
```

And then to run your application you could set the Erlang run-time like this:

```bash
ERL_LIBS=deps erl -pa ebin
# => Erlang/OTP 23 [erts-11.0] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:16]
# =>
# => Eshell V11.0  (abort with ^G)
# => 1> amqp_example:test().
# => ok
# => 2>
```
