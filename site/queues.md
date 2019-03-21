<!--
Copyright (c) 2007-2016 Pivotal Software, Inc.

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

# Queues NOSYNTAX

## Introduction

This guide provides an overview of queues in RabbitMQ. Since
many features in a messaging system are related to queues, it
is not meant to be an exhaustive guide but rather an overview
that provides links to other guides.

This guide covers queues primarily in the context of [AMQP 0-9-1](/tutorials/amqp-concepts.html),
however, much of the content is applicable to other supported protocols.

Some protocols (e.g. STOMP and MQTT) are based around the idea of topics.
For them, queues are an implementation detail.

## Names

Queues have names so that applications can reference them.

Applications may pick queue names or ask the broker to generate a name
for them. Queue names may be up to 255 bytes of UTF-8 characters.

Queue names starting with "amq." are reserved for internal
use by the broker. Attempts to declare a queue with a name that
violates this rule will result in a channel-level exception
with reply code 403 (<code>ACCESS_REFUSED</code>).

### Server-named Queues

In AMQP 0-9-1, the broker can generate a unique queue name on behalf of
an app. To use this feature, pass an empty string as the queue name
argument: The same generated name may be obtained by subsequent
methods in the same channel by using the empty string where a queue
name is expected. This works because the channel remembers the last
server-generated queue name.


## Properties

Queues have properties that define how they behave. There is a set
of mandatory properties and a map of optional ones:

 * Name
 * Durable (the queue will survive a broker restart)
 * Exclusive (used by only one connection and the queue will be deleted when that connection closes)
 * Auto-delete (queue that has had at least one consumer is deleted when last consumer unsubscribes)
 * Arguments (optional; used by plugins and broker-specific features such as message TTL, queue length limit, etc)


### Declaration and Property Equivalence

Before a queue can be used it has to be declared. Declaring
a queue will cause it to be created if it does not already
exist. The declaration will have no effect if the queue does
already exist and its attributes are the same as those in the
declaration. When the existing queue attributes are not the
same as those in the declaration a channel-level exception
with code 406 (<code>PRECONDITION_FAILED</code>) will be raised.


### Optional Arguments

Optional queue arguments, also know as "x-arguments" because of their
field name in the AMQP 0-9-1 protocol, is a map (dictionary) that can
be provided by clients when a queue is declared.  They are used by
plugins and broker-specific features such as

 * Message and queue TTL
 * Queue length limit
 * Mirroring settings
 * Max number of priorities
 * Consumer priorities

and so on.

Optional arguments can be provided in two ways:

 * To groups of queues using [policies](/parameters.html#policies) (recommended)
 * On a per-queue basis when a queue is declared by a client

The former option is more flexible, non-intrusive, does not require application
modifications and redeployments. Therefore it is highly recommended for most users.

The way optional arguments are provided by clients varies from client library
to client library but is usually an argument next to the <code>durable</code>,
<code>auto_delete</code> and other arguments of the function (method) that
declares queues.


## Message Ordering

Queues in RabbitMQ are ordered collections of messages. Messages
are enqueued and dequeued (consumed) in the [FIFO manner](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)),
although [priority queues](/priority.html), [sharded queues](https://github.com/rabbitmq/rabbitmq-sharding/) and other features
may affect this.


## Durability

Durable queues are persisted to disk and thus survive broker
restarts. Queues that are not durable are called transient.
Not all scenarios and use cases mandate queues to be durable.

Durability of a queue does not make <em>messages</em> that
are routed to that queue durable. If broker is taken down
and then brought back up, durable queue will be re-declared
during broker startup, however, only <em>persistent</em>
messages will be recovered.


## Temporary Queues

With some workloads queues are supposed to be short lived. While clients can
delete the queues they declare before disconnection, this is not always convenient.
On top of that, client connections can fail, potentially leaving unused
resources (queues) behind.

There are three ways to make queue deleted automatically:

 * Exclusive queues (covered below)
 * TTLs (also covered below)
 * Auto-delete queues

An auto-delete queue will be deleted when its last consumer
is cancelled (e.g. using the <code>basic.cancel</code> in AMQP 0-9-1)
or gone (closed channel or connection, or lost TCP connection with the server).

If a queue never had any consumers, for instance, when all consumption happens
using the <code>basic.get</code> method (the "pull" API), it wont' be automatically
deleted. For such cases, use exclusive queues or queue TTL.


## Exclusive Queues

An exclusive queue can only be used (consumed from, purged, deleted, etc)
by its declaring connection. An attempt to use an exclusive queue from
a different connection will result in a channel-level exception
<code>RESOURCE_LOCKED</code> with an error message that says
<code>cannot obtain exclusive access to locked queue</code>.

Exclusive queues are deleted when their declaring connection is closed
or gone (e.g. due to underlying TCP connection loss). They therefore
are only suitable for client-specific transient state.

It is common to make exclusive queues server-named.


## Mirrored and Distributed Queues

Queues can be [replicated across cluster nodes](/ha.html) and [federated](http://www.rabbitmq.com/federated-queues.html)
across loosely coupled nodes or clusters. Note that mirroring and federation
are orthogonal features and should not be considered direct alternatives.


## Time-to-Live and Length Limit

Queues can have their length [limited](/maxlength.html).
Queues and messages can have a [TTL](/ttl.html).

Both features can be used for data expiration and as a way of limiting
how many resources (RAM, disk space) a queue can use at most, e.g.
when consumers go offline or their throughput falls behind publishers.


## In Memory and Durable Storage

Queues keep messages in RAM and/or on disk. In some protocols (e.g. AMQP 0-9-1)
this is in part controlled by the client. In AMQP 0-9-1, this is done
via a message property (<code>delivery_mode</code> or, in some clients, <code>persistent</code>).

Publishing messages as transient suggests that RabbitMQ should keep as many messages
as possible in RAM. Queues will, however, page even transient messages to disk when
they find themselves under [memory pressure](/memory.html).

Persistent messages routed to durable queues are persisted in batches
or when a certain amount of time passes (fraction of a second).

[Lazy queues](/lazy-queues.html) page messages out to disk more aggressively
regardless of their persistence property.

See [Memory Usage](/memory-use.html), [Alarms](/alarms.html)
[Memory Alarms](http://localhost:8191/memory.html), [Free Disk Space Alarms](/disk-alarms.html),
[Production Checklist](/production-checklist.html), and [Message Store Configuration](/persistence-conf.html)
guide for details.


## Priorities

Queues can have 0 or more [priorities](/priority.html). This feature is opt-in:
only queues that have maximum number of priorities configured via an optional argument
(see above) will do prioritisation.

Publishers specify message priority using the <code>priority</code> field
in message properties.

If priority queues are desired, we recommend using between 1 and 10.
Currently using more priorities will consume more resources (Erlang processes).


## CPU Utilisation and Parallelism Considerations

Currently a single queue (master or mirror) is limited to a single CPU core
on its hot code path. This design therefore assumes that most systems
use multiple queues in practice. A single queue is generally
considered to be an anti-pattern (and not just for resource utilisation
reasons).

In case when it is desirable to trade off message ordering for parallelism
(better CPU core utilisation), [rabbitmq-sharding](https://github.com/rabbitmq/rabbitmq-sharding/)
provides an opinionated way of doing so transparently to the clients.


## Metrics and Monitoring

RabbitMQ collects multiple metrics about queues. Most of them are available
via [RabbitMQ HTTP API and management UI](/management.html), which is designed for monitoring.
This includes queue length, ingress and egress rates, number of consumers, number of
messages in various states (e.g. ready for delivery or [unacknowledged](/confirms.html)),
number of messages in RAM vs. on disk, and so on.

[rabbitmqctl](/man/rabbitmqctl.8.html) can list queues and some basic metrics.

Runtime metrics such as VM scheduler usage, queue (Erlang) process GC activity, amount of
RAM used by the queue process, queue process mailbox length can be accessed
using the [rabbitmq-top](https://github.com/rabbitmq/rabbitmq-top) plugin and
individual queue pages in the management UI.



## Consumers and Acknowledgements

Messages can be consumed by registering a consumer (subscription),
which means RabbitMQ will push messages to the client, or fetched
individually for protocols that support this (e.g. the <code>basic.get</code> AMQP 0-9-1 method),
similarly to HTTP GET.

Delivered messages can be [acknowledged by consumer](/confirms.html) explicitly
or automatically as soon as a delivery is written to connection socket.

Automatic acknowledgement mode generally will provide higher throughput
rate and uses less network bandwidth. However, it offers the least number
of guarantees when it comes to [failures](/reliability.html). As a rule of
thumb, consider using manual acknowledgement mode first.

### Prefetch and Consumer Overload

Automatic acknowledgement mode can also overwhelm
consumers which cannot process messages as quickly as they are delivered.
This can result in permanetly growing memory usage and/or
OS swapping for the consumer process.

Manual acknowledgement mode provides a way to [set a limit on the number
of outstanding (unconfirmed) deliveries](/confirms.html): channel QoS (prefetch).

Consumers using higher (several thousands or more) prefetch levels can experience
the same overload problem as consumers using automatic acknowledgements.

High number of unacknowledged messages will lead to higher memory usage by
the broker.


### Message States

Enqueued messages therefore can be in one of two states:

 * Ready for delivery
 * Delivered by not yet [acknowledged by consumer](/confirms.html)

Message breakdown by state can be found in the management UI.



## Determining Queue Length

It is possible to determine queue length in a number of ways:

 * With AMQP 0-9-1, using a property on the <code>queue.declare</code> method response
   (<code>queue.declare-ok</code>). The field name is <code>message_count</code>. How it is accessed
   varies from client library to client library.
 * Using [RabbitMQ HTTP API](/management.html).
 * Using the [rabbitmqctl](/man/rabbitmqctl.8.html) <code>list_queues</code> command.

Queue length is defined as the number of messages ready for delivery.
