---
title: Queues
displayed_sidebar: docsSidebar
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

# Queues

## What is a Queue?

A queue in RabbitMQ is an ordered collection of messages. Messages are enqueued and dequeued (delivered to consumers) in a ([FIFO ("first in, first out")](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)) manner.

To define a [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) in generic terms, it is a sequential data structure with two primary operations: an item can be **enqueued** (added) at the tail and **dequeued** (consumed) from the head.

Queues play a major role in the messaging technology space. Many messaging protocols and tools assume that [publishers](./publishers) and [consumers](./consumers) communicate using a queue-like storage mechanism.

Many features in a messaging system are related to queues. Some RabbitMQ queue features such as priorities and [requeueing](./confirms) by consumers can affect the ordering as observed by consumers.

The information in this topic includes an overview of queues in RabbitMQ and also links out to other topics so you can learn more about using queues in RabbitMQ.

:::info

In addition to queues, modern RabbitMQ versions support two alternative data structures
called [streams and super streams](./streams).

:::

This guide primarily covers queues in the context of the [AMQP 0-9-1](/tutorials/amqp-concepts) protocol, however, much of the content is applicable to other supported protocols.

Some protocols (for example: STOMP and MQTT) are based around the idea of topics.
For these protocols, queues act as a data accumulation buffer for consumers.
However, it is still important to understand the role queues play
because many features still operate at the queue level, even for those protocols.

[Streams](./streams) is an alternative messaging data structure available in RabbitMQ. Streams provide different features from queues.

The information about RabbitMQ queues covered in this topic includes:

 * [Queue Names](#names)
 * [Queue Properties](#properties)
 * [Message Ordering](#message-ordering) in a queue
 * [Queue Durability](#durability) and how it relates to message persistence
 * [Replicated Queue Types](#distributed)
 * [Transparent Operation Routing](#transparent-operation-routing) for clients
 * [Temporary](#temporary-queues) and [exclusive](#exclusive-queues) queues
 * [Runtime Resource](#runtime-characteristics) usage by queue replicas
 * [Optional Queue Arguments](#optional-arguments) ("x-arguments")
 * Declaration and [Property Equivalence](#property-equivalence)
 * [Queue Metrics](#metrics)
 * [TTL](#ttl-and-limits) and length limits
 * [Priority Queues](#priorities)

For topics related to consumers, see the [Consumers guide](./consumers).
[Classic queues](./classic-queues), [quorum queues](./quorum-queues)
and [streams](./streams) also have dedicated guides.

## Queue Names {#names}

Queues have names so that applications can reference them.

Applications may pick queue names or ask the broker to [generate a name](#server-named-queues)
for them. Queue names may be up to 255 bytes of UTF-8 characters.

Queue names starting with "amq." are reserved for internal
use by the broker. Attempts to declare a queue with a name that
violates this rule will result in a [channel-level exception](./channels)
with reply code 403 (<code>ACCESS_REFUSED</code>).

### Server-named Queues {#server-named-queues}

In AMQP 0-9-1, the broker can generate a unique queue name on behalf of
an app. To use this feature, pass an empty string as the queue name
argument: the same generated name may be obtained by subsequent
methods in the same channel by using the empty string where a queue
name is expected. This works because the channel remembers the last
server-generated queue name.

Server-named queues are meant to be used for state that is transient
in nature and specific to a particular consumer (application instance).
Applications can share such names in message metadata to let other applications respond
to them (as demonstrated in [tutorial six](/tutorials)).
Otherwise, the names of server-named queues should be known and used only by the
declaring application instance. The instance should also set up appropriate
bindings (routing) for the queue, so that publishers can use well-known
exchanges instead of the server-generated queue name directly.


## Queue Properties {#properties}

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

### Declaration and Property Equivalence {#property-equivalence}

:::tip
Specifically for the queue type property, the property equivalence
check can be relaxed. Alternatively, a default queue type (DQT) can be configured.
:::

Before a queue can be used it has to be declared. Declaring
a queue will cause it to be created if it does not already
exist. The declaration will have no effect if the queue does
already exist and its attributes are the same as those in the
declaration. When the existing queue attributes are not the
same as those in the declaration a channel-level exception
with code 406 (<code>PRECONDITION_FAILED</code>) will be raised.

Specifically for the queue type property, the property equivalence
checks can be relaxed or configured to use a default.

See the [Virtual Hosts guide](./vhosts#default-queue-type) to learn more.

### Optional Arguments {#optional-arguments}

Optional queue arguments, also known as "x-arguments" because of their
field name in the AMQP 0-9-1 protocol, is a map (dictionary) of arbitrary key/value
pairs that can be provided by clients when a queue is declared.

The map is used by various features and plugins such as

 * Queue type (e.g. [quorum](./quorum-queues) or [classic](./classic-queues))
 * [Message and queue TTL](./ttl)
 * [Queue length limit](./maxlength)
 * Quorum queue [redelivery limit](./quorum-queues#poison-message-handling)
 * Max number of [priorities](./priority) of a classic queue

and so on.

The same idea is also used with other protocol operations, for example, when
registering a consumer:

 * [Consumer priorities](./consumer-priority)

Some optional arguments are set at queue declaration time and remain immutable over the entire
lifetime of the queue. Others can be dynamically changed after queue declaration via [policies](./parameters#policies).

:::tip

For keys that can be set via [policies](./parameters#policies), always first
consider using a policy instead of setting these values in application code

:::

Optional queue arguments can be set differently:

 * To groups of queues using [policies](./parameters#policies) (recommended)
 * On a per-queue basis when a queue is declared by a client
 * For the `x-queue-type` argument, [using a default queue type](./vhosts#default-queue-type)

The former option is more flexible, non-intrusive, does not require application
modifications and redeployments. Therefore it is highly recommended for most users.
Note that some optional arguments such as queue type or max number of priorities can
only be provided by clients because they cannot be dynamically changed and must be known
at declaration time.

The way optional arguments are provided by clients varies from client library
to client library but is usually an argument next to the <code>durable</code>,
<code>auto_delete</code> and other arguments of the function (method) that
declares queues.

### Optional Arguments and Policy-Defined Key Precedence {#optional-arguments-precedence}

When the same key is provided by both client-provided `x-arguments` and by a [policy](./parameters#policies),
the former take precedence.

However, if an [operator policy](./parameters#operator-policies) is also used, that will take precedence over the client-provided
arguments, too. Operator policies are a protection mechanism and override client-provided values
and user policy values.

For numerical values such as [maximum queue length](./maxlength) or [TTL](./ttl),
the lower value of the two will be used. If an application needs or chooses to use a lower value,
that will be allowed by an operator policy. A value higher than that defined in the operator policy,
however, cannot be used.

Use operator policies to introduce guardrails for application-controlled parameters related
to resource use (e.g. peak disk space usage).


## Message Ordering in RabbitMQ {#message-ordering}

Queues in RabbitMQ are ordered collections of messages.
Messages are enqueued and dequeued (delivered to consumers) in the [FIFO manner](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)).

FIFO ordering is not guaranteed for [priority](./priority) and [sharded queues](https://github.com/rabbitmq/rabbitmq-sharding/).

Ordering also can be affected by the presence of multiple competing [consumers](./consumers),
[consumer priorities](./consumers#priority), message redeliveries.
This applies to redeliveries of any kind: automatic after channel closure and
[negative consumer acknowledgements](./confirms).

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
Only consumers on channels that have not exceeded their [prefetch value](./consumers#prefetch)
(the number of outstanding unacknowledged deliveries) will be considered.


## Durability {#durability}

Queues can be durable or transient (non-durable). Metadata of a durable queue is stored on disk,
while metadata of a transient queue is stored in memory when possible.
The same distinction is made for [messages at publishing time](./publishers#message-properties)
in some protocols, e.g. AMQP 0-9-1 and MQTT.

In environments and use cases where durability is important, applications
must use durable queues *and* make sure that [publishers](/docs/publishers) mark published messages as persisted.

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

Some queue types do not support transient queues. [Quorum queues](./quorum-queues) must
be durable due to the assumptions and requirements of the underlying replication protocol,
for example.


## Temporary Queues {#temporary-queues}

With some workloads queues are supposed to be short lived. While clients can
delete the queues they declare before disconnection, this is not always convenient.
On top of that, client connections can fail, potentially leaving unused
resources (queues) behind.

RabbitMQ supports a number of queue properties that make sense for the data that is
transient or client-specific in nature. Some of these settings can be applied to
durable qeueus but not every combination makes sense.

:::tip
Consider using [server-generated names](#names) for temporary queues. Since such queues
are not meant to be shared between N consumers, using unique names makes sense.

Shared temporary queues can lead to a [natural race condition](#shared-temporary-queues) between RabbitMQ node actions
and recovering clients.
:::

There are three ways to make queue deleted automatically:

 * Exclusive queues (covered below)
 * TTLs (also covered below)
 * Auto-delete queues

An auto-delete queue will be deleted when its last consumer
is cancelled (e.g. using the <code>basic.cancel</code> in AMQP 0-9-1)
or gone (closed channel or connection, or lost TCP connection with the server).

If a queue never had any consumers, for instance, when all consumption happens
[using polling](/docs/consumers#polling), it won't be automatically
deleted. For such cases, use exclusive queues or queue TTL.

:::warning

Transient (non-durable) non-exclusive classic queues are [deprecated](/release-information/deprecated-features-list/).
Use [durable queues](#durability) or [non-durable exclusive queues](#exclusive-queues) instead.

[Queue TTL](/docs/ttl#queue-ttl) can be used for cleanup of unused durable queues.

When RabbitMQ detects a non-durable and non-exclusive queue, it will display a deprecation
warning in the management UI.

:::


## Exclusive (Client Connection-Specific) Queues {#exclusive-queues}

An exclusive queue can only be used (consumed from, purged, deleted, etc)
by its declaring connection. Such queues are by definition [temporary](#temporary-queues) in nature,
setting the `exclusive` property on a durable queue does not make logical sense
since such queue cannot outlive its declaring connection, and thus cannot satisfy its durability
property in case of a node restart.

Queues declared as exclusive will always be declared as classic queues: exclusive [quorum queues](./quorum-queues)
and [streams](./streams) do not make logical sense as their lifetimes would be bound to the lifetime
of a specific client connection and thus a single node (or application instance).

:::tip
Consider using [server-generated names](#names) for exclusive queues. Since such queues
cannot be shared between N consumers, using server-generated names makes most sense.
:::

An attempt to use an exclusive queue from
a different connection will result in a channel-level exception
<code>RESOURCE_LOCKED</code> with an error message that says
<code>cannot obtain exclusive access to locked queue</code>.

Exclusive queues are deleted when their declaring connection is closed
or gone (e.g. due to underlying TCP connection loss). They therefore
are only suitable for client-specific transient state.

It is common to make exclusive queues server-named.

Exclusive queues are declared on the "client-local" node (the node that the client declaring
the queue is connected to), regardless of the `queue_leader_locator` value.


## Replicated and Distributed Queues {#distributed}

[Quorum queues](./quorum-queues) is replicated, data safety and consistency-oriented queue type.
Classic queues historically supported replication but this feature was **removed** for RabbitMQ 4.x.

Any client [connection](./connections) can use any queue, whether it is replicated or not,
regardless of the node the queue replica is hosted on or the node the client is connected to.
RabbitMQ will route the operations to the appropriate node transparently for clients.

For example, in a cluster with nodes A, B and C, a client connected to node A can consume
from a queue Q hosted on B, while a client connected to node C can publish in a way that routes
messages to queue Q.

Client libraries or applications **may** choose to connect to the node that hosts the current leader replica of a specific queue
for improved data locality.

This general rule applies to all messaging data types supported by RabbitMQ except for one.
[Streams](./streams) are an exception to this rule, and require clients, regardless of the protocol they use, to connect to a node
that hosts a replica (a leader of rollower) of the target stream.
Consequently, RabbitMQ Stream protocol clients will [connect to multiple nodes in parallel](https://www.rabbitmq.com/blog/2021/07/23/connecting-to-streams).

Queues can also be [federated](./federated-queues)
across loosely coupled nodes or clusters.

Note that intra-cluster replication and federation
are orthogonal features and should not be considered direct alternatives.

[Streams](./streams) is another replicated data structure supported by RabbitMQ, with a different
set of supported operations and features.


## Non-Replicated Queues and Client Operations {#transparent-operation-routing}

Any client [connection](./connections) can use any queue, including non-replicated (single replica) queues,
regardless of the node the queue replica is hosted on or the node the client is connected to.
RabbitMQ will route the operations to the appropriate node transparently for clients.

For example, in a cluster with nodes A, B and C, a client connected to node A can consume
from a queue Q hosted on B, while a client connected to node C can publish in a way that routes
messages to queue Q.

Client libraries or applications **may** choose to connect to the node that hosts the current leader replica of a specific queue
for improved data locality.

This general rule applies to all messaging data types supported by RabbitMQ except for one.
[Streams](./streams) are an exception to this rule, and require clients, regardless of the protocol they use, to connect to a node
that hosts a replica (a leader of rollower) of the target stream.
Consequently, RabbitMQ Stream protocol clients will [connect to multiple nodes in parallel](https://www.rabbitmq.com/blog/2021/07/23/connecting-to-streams).


## Time-to-Live and Length Limit {#ttl-and-limits}

Queues can have their length [limited](./maxlength).
Queues and messages can have a [TTL](./ttl).

Both features can be used for data expiration and as a way of limiting
how many resources (RAM, disk space) a queue can use at most, e.g.
when consumers go offline or their throughput falls behind publishers.


## In Durable and In-Memory Storage {#storage}

In modern RabbitMQ versions, quorum queues and classic queues v2 alike actively move data to disk and only keep a relatively
small working set in memory.

In some protocols (e.g. AMQP 0-9-1) clients can publish messages as persistent or transient. Transient
messages will still be stored on disk but will be discarded during the next node restart.

In AMQP 0-9-1, this is done
via a message property (<code>delivery_mode</code> or, in some clients, <code>persistent</code>).

Other relevant guides on the topic are [Quorum Queues](./quorum-queues#resource-use), [Streams](./streams#feature-comparison),
[Reasoning About Memory Usage](./memory-use), [Alarms](./alarms), [Memory Alarms](./memory), [Free Disk Space Alarms](./disk-alarms),
[Deployment Guidelines](./production-checklist), and [Message Store Configuration](./persistence-conf).


## Priorities {#priorities}

Queues can have 0 or more [priorities](./priority). This feature is opt-in:
only queues that have maximum number of priorities configured via an optional argument
(see above) will do prioritisation.

Publishers specify message priority using the <code>priority</code> field
in message properties.

If priority queues are desired, we recommend using between 1 and 10.
Currently using more priorities will consume more resources (Erlang processes).


## CPU Utilisation and Parallelism Considerations {#runtime-characteristics}

Currently a single queue replica (whether leader or follower) is limited to a single CPU core
on its hot code path. This design therefore assumes that most systems
use multiple queues in practice. A single queue is generally
considered to be an anti-pattern (and not just for resource utilisation
reasons).

In case when it is desirable to trade off message ordering for parallelism
(better CPU core utilisation), [rabbitmq-sharding](https://github.com/rabbitmq/rabbitmq-sharding/)
provides an opinionated way of doing so transparently to the clients.


## Metrics and Monitoring {#metrics}

RabbitMQ collects multiple metrics about queues. Most of them are available
via [RabbitMQ HTTP API and management UI](./management), which is designed for monitoring.
This includes queue length, ingress and egress rates, number of consumers, number of
messages in various states (e.g. ready for delivery or [unacknowledged](./confirms)),
number of messages in RAM vs. on disk, and so on.

[rabbitmqctl](./man/rabbitmqctl.8) can list queues and some basic metrics.

Runtime metrics such as VM scheduler usage, queue (Erlang) process GC activity, amount of
RAM used by the queue process, queue process mailbox length can be accessed
using the [rabbitmq-top](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_top) plugin and
individual queue pages in the management UI.



## Consumers and Acknowledgements {#consumer-acknowledgement}

Messages can be consumed by registering a consumer (subscription),
which means RabbitMQ will push messages to the client, or fetched
individually for protocols that support this (e.g. the <code>basic.get</code> AMQP 0-9-1 method),
similarly to HTTP GET.

Delivered messages can be [acknowledged by consumer](./confirms) explicitly
or automatically as soon as a delivery is written to connection socket.

Automatic acknowledgement mode generally will provide higher throughput
rate and uses less network bandwidth. However, it offers the least number
of guarantees when it comes to [failures](./reliability). As a rule of
thumb, consider using manual acknowledgement mode first.

### Prefetch and Consumer Overload {#prefetch-consumer-overload}

Automatic acknowledgement mode can also overwhelm
consumers which cannot process messages as quickly as they are delivered.
This can result in permanently growing memory usage and/or
OS swapping for the consumer process.

Manual acknowledgement mode provides a way to [set a limit on the number
of outstanding (unconfirmed) deliveries](./confirms): channel QoS (prefetch).

Consumers using higher (several thousands or more) prefetch levels can experience
the same overload problem as consumers using automatic acknowledgements.

High number of unacknowledged messages will lead to higher memory usage by
the broker.


### Message States {#message-states}

Enqueued messages therefore can be in one of two states:

 * Ready for delivery
 * Delivered but not yet [acknowledged by consumer](./confirms)

Message breakdown by state can be found in the management UI.



## Determining Queue Length {#queue-length}

It is possible to determine queue length in a number of ways:

 * With AMQP 0-9-1, using a property on the <code>queue.declare</code> method response
   (<code>queue.declare-ok</code>). The field name is <code>message_count</code>. How it is accessed
   varies from client library to client library.
 * Using [RabbitMQ HTTP API](./management).
 * Using the [rabbitmqctl](./man/rabbitmqctl.8) <code>list_queues</code> command.

Queue length is defined as the number of messages ready for delivery.


## Avoid Temporary Queues with Well-Known Names {#shared-temporary-queues}

A [temporary queue](#temporary-queues) that is not exclusive can be client named and shared
between multiple consumers. This, however, is not recommended and can lead to a race condition
between RabbitMQ node operations and client recovery.

Consider the following scenario:

 * A consumer uses an auto-delete queue with a well-known names
 * Client's connection fails
 * Client detects it and initiates connection recovery

As the failed connection which had the only consumer on an auto-delete queue,
the queue must be deleted by RabbitMQ. This operation will take some time,
during which the consumer may recover.

Then depending on the timing of operations, the queue can be

1. Declared by the recovering client and then deleted
2. Deleted and then re-declared

In the first case, the client will try to re-register its consumer on a queue that's
been concurrently deleted, which will lead to a channel exception.

There are two solutions to this fundamental race condition:

1. Introduce a connection recovery delay. For example, several RabbitMQ client libraries
   use a connection recovery delay of 5 seconds by default
2. Use server-named queues, which side steps the problem entirely since the new client connection
   will use a different queue name from its predecessor
