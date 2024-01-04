<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Queues

## What is a Queue?

A queue in RabbitMQ is an ordered collection of messages. Messages are enqueued and dequeued (delivered to consumers) in a ([FIFO ("first in, first out")](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)) manner.

To define a [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) in generic terms, it is a sequential data structure with two primary operations: an item can be **enqueued** (added) at the tail and **dequeued** (consumed) from the head.

Queues play a major role in the messaging technology space. Many messaging protocols and tools assume that [publishers](./publishers.html) and [consumers](./consumers.html) communicate using a queue-like storage mechanism.

Many features in a messaging system are related to queues. Some RabbitMQ queue features such as priorities and [requeueing](./confirms.html) by consumers can affect the ordering as observed by consumers.

The information in this topic includes an overview of queues in RabbitMQ and also links out to other topics so you can learn more about using queues in RabbitMQ.

This information primarily covers queues in the context of the [AMQP 0-9-1](tutorials/amqp-concepts.html) protocol, however, much of the content is applicable to other supported protocols.

Some protocols (for example: STOMP and MQTT) are based around the idea of topics.
For these protocols, queues act as a data accumulation buffer for consumers.
However, it is still important to understand the role queues play
because many features still operate at the queue level, even for those protocols.

[Streams](./streams.html) is an alternative messaging data structure available in RabbitMQ. Streams provide different features from queues.

The information about RabbitMQ queues covered in this topic includes:

 * [Queue Names](#names)
 * [Queue Properties](#properties)
 * [Message Ordering](#message-ordering) in a queue
 * [Queue Durability](#durability) and how it relates to message persistence
 * [Replicated Queue Types](#distributed)
 * [Temporary](#temporary-queues) and [exclusive](#exclusive-queues) queues
 * [Runtime Resource](#runtime-characteristics) usage by queue replicas
 * [Optional Queue Arguments](#optional-arguments) ("x-arguments")
 * [Queue Metrics](#metrics)
 * [TTL](#ttl-and-limits) and length limits
 * [Priority Queues](#priorities)

For topics related to consumers, see the [Consumers guide](./consumers.html).
[Classic queues](./classic-queues.html), [quorum queues](./quorum-queues.html)
and [streams](./streams.html) also have dedicated guides.

## <a id="names" class="anchor" href="#names">Queue Names</a>

Queues have names so that applications can reference them.

Applications may pick queue names or ask the broker to [generate a name](#server-named-queues)
for them. Queue names may be up to 255 bytes of UTF-8 characters.

Queue names starting with "amq." are reserved for internal
use by the broker. Attempts to declare a queue with a name that
violates this rule will result in a [channel-level exception](./channels.html)
with reply code 403 (<code>ACCESS_REFUSED</code>).

### <a id="server-named-queues" class="anchor" href="#server-named-queues">Server-named Queues</a>

In AMQP 0-9-1, the broker can generate a unique queue name on behalf of
an app. To use this feature, pass an empty string as the queue name
argument: The same generated name may be obtained by subsequent
methods in the same channel by using the empty string where a queue
name is expected. This works because the channel remembers the last
server-generated queue name.

Server-named queues are meant to be used for state that is transient
in nature and specific to a particular consumer (application instance).
Applications can share such names in message metadata to let other applications respond
to them (as demonstrated in [tutorial six](getstarted.html)).
Otherwise, the names of server-named queues should be known and used only by the
declaring application instance. The instance should also set up appropriate
bindings (routing) for the queue, so that publishers can use well-known
exchanges instead of the server-generated queue name directly.


## <a id="properties" class="anchor" href="#properties">Queue Properties</a>

Queues have properties that define how they behave. There is a set
of mandatory properties and a map of optional ones:

 * Name
 * Durable (the queue will survive a broker restart)
 * Exclusive (used by only one connection and the queue will be deleted when that connection closes)
 * Auto-delete (queue that has had at least one consumer is deleted when last consumer unsubscribes)
 * Arguments (optional; used by plugins and broker-specific features such as message TTL, queue length limit, etc)

Note that **not all property combination make sense** in practice. For example, auto-delete
and exclusive queues should be [server-named](#server-named-queues). Such queues are supposed to
be used for client-specific or connection (session)-specific data.

When auto-delete or exclusive queues use well-known (static) names, in case of client disconnection
and immediate reconnection there will be a natural race condition between RabbitMQ nodes
that will delete such queues and recovering clients that will try to re-declare them.
This can result in client-side connection recovery failure or exceptions, and create unnecessary confusion
or affect application availability.

### <a id="property-equivalence" class="anchor" href="#property-equivalence">Declaration and Property Equivalence</a>

Before a queue can be used it has to be declared. Declaring
a queue will cause it to be created if it does not already
exist. The declaration will have no effect if the queue does
already exist and its attributes are the same as those in the
declaration. When the existing queue attributes are not the
same as those in the declaration a channel-level exception
with code 406 (<code>PRECONDITION_FAILED</code>) will be raised.


### <a id="optional-arguments" class="anchor" href="#optional-arguments">Optional Arguments</a>

Optional queue arguments, also known as "x-arguments" because of their
field name in the AMQP 0-9-1 protocol, is a map (dictionary) of arbitrary key/value
pairs that can be provided by clients when a queue is declared.

The map is used by various features and plugins such as

 * Queue type (e.g. [quorum](./quorum-queues.html) or [classic](./classic-queues.html))
 * [Message and queue TTL](./ttl.html)
 * [Queue length limit](./maxlength.html)
 * Max number of [priorities](./priority.html)
 * [Consumer priorities](./consumer-priority.html)

and so on.

Most optional arguments can be dynamically changed after queue declaration but there are
exceptions. For example, [queue type](./quorum-queues.html) (`x-queue-type`) and max number
of [queue priorities](./priority.html) (`x-max-priority`) must be set at queue declaration time
and cannot be changed after that.

Optional queue arguments can be set in a couple of ways:

 * To groups of queues using [policies](./parameters.html#policies) (recommended)
 * On a per-queue basis when a queue is declared by a client

The former option is more flexible, non-intrusive, does not require application
modifications and redeployments. Therefore it is highly recommended for most users.
Note that some optional arguments such as queue type or max number of priorities can
only be provided by clients because they cannot be dynamically changed and must be known
at declaration time.

The way optional arguments are provided by clients varies from client library
to client library but is usually an argument next to the <code>durable</code>,
<code>auto_delete</code> and other arguments of the function (method) that
declares queues.

### <a id="optional-arguments-precedence" class="anchor" href="#optional-arguments-precedence">Optional Arguments and Policy-Defined Key Precedence</a>

When the same key is provided by both client-provided `x-arguments` and by a [policy](./parameters.html#policies),
the former take precedence.

However, if an [operator policy](./parameters.html#operator-policies) is also used, that will take precedence over the client-provided
arguments, too. Operator policies are a protection mechanism and override client-provided values
and user policy values.

For numerical values such as [maximum queue length](./maxlength.html) or [TTL](./ttl.html),
the lower value of the two will be used. If an application needs or chooses to use a lower value,
that will be allowed by an operator policy. A value higher than that defined in the operator policy,
however, cannot be used.

Use operator policies to introduce guardrails for application-controlled parameters related
to resource use (e.g. peak disk space usage).


## <a id="message-ordering" class="anchor" href="#message-ordering">Message Ordering in RabbitMQ</a>

Queues in RabbitMQ are ordered collections of messages.
Messages are enqueued and dequeued (delivered to consumers) in the [FIFO manner](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)).

FIFO ordering is not guaranteed for [priority](./priority.html) and [sharded queues](https://github.com/rabbitmq/rabbitmq-sharding/).

Ordering also can be affected by the presence of multiple competing [consumers](./consumers.html),
[consumer priorities](./consumers.html#priority), message redeliveries.
This applies to redeliveries of any kind: automatic after channel closure and
[negative consumer acknowledgements](./confirms.html).

Applications can assume messages published on a single channel will be enqueued
in publishing order in all the queues they get routed to.
When publishing happens on multiple connections or channels, their sequences of messages
will be routed concurrently and interleaved.

Consuming applications can assume that **initial deliveries** (those where the `redelivered` property
is set to `false`) to a single consumer are performed in the same FIFO order as they were enqueued.
For **repeated deliveries** (the `redelivered` property is set to `true`), original ordering
can be affected by the timing of consumer acknowledgements and redeliveries, and thus
not guaranteed.

In case of multiple consumers, messages will be dequeued for delivery in the FIFO order
but actual delivery will happen to multiple consumers. If all of the consumers have
equal priorities, they will be picked on a [round-robin basis](https://en.wikipedia.org/wiki/Round-robin_scheduling).
Only consumers on channels that have not exceeded their [prefetch value](./consumers.html#prefetch)
(the number of outstanding unacknowledged deliveries) will be considered.


## <a id="durability" class="anchor" href="#durability">Durability</a>

Queues can be durable or transient. Metadata of a durable queue is stored on disk,
while metadata of a transient queue is stored in memory when possible.
The same distinction is made for [messages at publishing time](./publishers.html#message-properties)
in some protocols, e.g. AMQP 0-9-1 and MQTT.

In environments and use cases where durability is important, applications
must use durable queues *and* make sure that publishers mark published messages as persisted.

Transient queues will be deleted on node boot. They therefore will not survive a node restart,
by design. Messages in transient queues will also be discarded.

Durable queues will be recovered on node boot, including messages in them published as persistent.
Messages published as transient will be **discarded** during recovery, even if they were stored
in durable queues.

### How to Choose

In most other cases, durable queues are the recommended option. For [replicated queues](#distributed),
the only reasonable option is to use durable queues.

Throughput and latency of a queue is **not affected** by whether a queue is durable or not
in most cases. Only environments with very high queue or binding churn — that is, where queues are deleted
and re-declared hundreds or more times a second — will see latency improvements for
some operations, namely on bindings. The choice between durable and transient queues
therefore comes down to the semantics of the use case.

Temporary queues can be a reasonable choice for workloads with transient clients, for example,
temporary WebSocket connections in user interfaces, mobile applications and devices
that are expected to go offline or use switch identities. Such clients usually have
inherently transient state that should be replaced when the client reconnects.

Some queue types do not support transient queues. [Quorum queues](./quorum-queues.html) must
be durable due to the assumptions and requirements of the underlying replication protocol,
for example.


## <a id="temporary-queues" class="anchor" href="#temporary-queues">Temporary Queues</a>

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
using the <code>basic.get</code> method (the "pull" API), it won't be automatically
deleted. For such cases, use exclusive queues or queue TTL.


## <a id="exclusive-queues" class="anchor" href="#exclusive-queues">Exclusive Queues</a>

An exclusive queue can only be used (consumed from, purged, deleted, etc)
by its declaring connection. An attempt to use an exclusive queue from
a different connection will result in a channel-level exception
<code>RESOURCE_LOCKED</code> with an error message that says
<code>cannot obtain exclusive access to locked queue</code>.

Exclusive queues are deleted when their declaring connection is closed
or gone (e.g. due to underlying TCP connection loss). They therefore
are only suitable for client-specific transient state.

It is common to make exclusive queues server-named.

Exclusive queues are declared on the "client-local" node (the node that the client declaring
the queue is connected to), regardless of the `queue_leader_locator` value.

## <a id="distributed" class="anchor" href="#distributed">Replicated and Distributed Queues</a>

[Quorum queues](./quorum-queues.html) is replicated, data safety and consistency-oriented queue type.
Classic queues historically supported replication but it is **deprecated** and should be avoided.


Queues can also be [federated](./federated-queues.html)
across loosely coupled nodes or clusters.

Note that intra-cluster replication and federation
are orthogonal features and should not be considered direct alternatives.

[Streams](./streams.html) is another replicated data structure supported by RabbitMQ, with a different
set of supported operations and features.

## <a id="ttl-and-limits" class="anchor" href="#ttl-and-limits">Time-to-Live and Length Limit</a>

Queues can have their length [limited](./maxlength.html).
Queues and messages can have a [TTL](./ttl.html).

Both features can be used for data expiration and as a way of limiting
how many resources (RAM, disk space) a queue can use at most, e.g.
when consumers go offline or their throughput falls behind publishers.


## <a id="storage" class="anchor" href="#storage">In Memory and Durable Storage</a>

Queues keep messages in RAM and/or on disk. In some protocols (e.g. AMQP 0-9-1)
this is in part controlled by the client. In AMQP 0-9-1, this is done
via a message property (<code>delivery_mode</code> or, in some clients, <code>persistent</code>).

Publishing messages as transient suggests that RabbitMQ should keep as many messages
as possible in RAM. Queues will, however, page even transient messages to disk when
they find themselves under [memory pressure](./memory.html).

Persistent messages routed to durable queues are persisted in batches
or when a certain amount of time passes (fraction of a second).

[Lazy queues](./lazy-queues.html) page messages out to disk more aggressively
regardless of their persistence property.

See [Memory Usage](./memory-use.html), [Alarms](./alarms.html),
[Memory Alarms](./memory.html), [Free Disk Space Alarms](./disk-alarms.html),
[Production Checklist](./production-checklist.html), and [Message Store Configuration](./persistence-conf.html)
guide for details.


## <a id="priorities" class="anchor" href="#priorities">Priorities</a>

Queues can have 0 or more [priorities](./priority.html). This feature is opt-in:
only queues that have maximum number of priorities configured via an optional argument
(see above) will do prioritisation.

Publishers specify message priority using the <code>priority</code> field
in message properties.

If priority queues are desired, we recommend using between 1 and 10.
Currently using more priorities will consume more resources (Erlang processes).


## <a id="runtime-characteristics" class="anchor" href="#runtime-characteristics">CPU Utilisation and Parallelism Considerations</a>

Currently a single queue replica (whether leader or follower) is limited to a single CPU core
on its hot code path. This design therefore assumes that most systems
use multiple queues in practice. A single queue is generally
considered to be an anti-pattern (and not just for resource utilisation
reasons).

In case when it is desirable to trade off message ordering for parallelism
(better CPU core utilisation), [rabbitmq-sharding](https://github.com/rabbitmq/rabbitmq-sharding/)
provides an opinionated way of doing so transparently to the clients.


## <a id="metrics" class="anchor" href="#metrics">Metrics and Monitoring</a>

RabbitMQ collects multiple metrics about queues. Most of them are available
via [RabbitMQ HTTP API and management UI](./management.html), which is designed for monitoring.
This includes queue length, ingress and egress rates, number of consumers, number of
messages in various states (e.g. ready for delivery or [unacknowledged](./confirms.html)),
number of messages in RAM vs. on disk, and so on.

[rabbitmqctl](man/rabbitmqctl.8.html) can list queues and some basic metrics.

Runtime metrics such as VM scheduler usage, queue (Erlang) process GC activity, amount of
RAM used by the queue process, queue process mailbox length can be accessed
using the [rabbitmq-top](https://github.com/rabbitmq/rabbitmq-top) plugin and
individual queue pages in the management UI.



## <a id="consumer-acknowledgement" class="anchor" href="#consumer-acknowledgement">Consumers and Acknowledgements</a>

Messages can be consumed by registering a consumer (subscription),
which means RabbitMQ will push messages to the client, or fetched
individually for protocols that support this (e.g. the <code>basic.get</code> AMQP 0-9-1 method),
similarly to HTTP GET.

Delivered messages can be [acknowledged by consumer](./confirms.html) explicitly
or automatically as soon as a delivery is written to connection socket.

Automatic acknowledgement mode generally will provide higher throughput
rate and uses less network bandwidth. However, it offers the least number
of guarantees when it comes to [failures](./reliability.html). As a rule of
thumb, consider using manual acknowledgement mode first.

### <a id="prefetch-consumer-overload" class="anchor" href="#prefetch-consumer-overload">Prefetch and Consumer Overload</a>

Automatic acknowledgement mode can also overwhelm
consumers which cannot process messages as quickly as they are delivered.
This can result in permanently growing memory usage and/or
OS swapping for the consumer process.

Manual acknowledgement mode provides a way to [set a limit on the number
of outstanding (unconfirmed) deliveries](confirms.html): channel QoS (prefetch).

Consumers using higher (several thousands or more) prefetch levels can experience
the same overload problem as consumers using automatic acknowledgements.

High number of unacknowledged messages will lead to higher memory usage by
the broker.


### <a id="message-states" class="anchor" href="#message-states">Message States</a>

Enqueued messages therefore can be in one of two states:

 * Ready for delivery
 * Delivered but not yet [acknowledged by consumer](./confirms.html)

Message breakdown by state can be found in the management UI.



## <a id="queue-length" class="anchor" href="#queue-length">Determining Queue Length</a>

It is possible to determine queue length in a number of ways:

 * With AMQP 0-9-1, using a property on the <code>queue.declare</code> method response
   (<code>queue.declare-ok</code>). The field name is <code>message_count</code>. How it is accessed
   varies from client library to client library.
 * Using [RabbitMQ HTTP API](./management.html).
 * Using the [rabbitmqctl](man/rabbitmqctl.8.html) <code>list_queues</code> command.

Queue length is defined as the number of messages ready for delivery.
