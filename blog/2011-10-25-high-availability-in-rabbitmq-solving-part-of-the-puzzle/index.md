---
title: "High Availability in RabbitMQ: solving part of the puzzle"
tags: ["New Features", ]
authors: [matthew]
---

In
RabbitMQ 2.6.0
we introduced [Highly Available](/docs/3.13/ha)
queues. These necessitated a
[new extension](/docs/consumer-cancel)
to AMQP, and a fair amount of
[documentation](/docs/3.13/ha), but to date, little has
been written on how they work.

<!-- truncate -->

*High Availability* (HA) is a typically over-used term and means
different things to different people. In the context of RabbitMQ,
there are a number of aspects of *high availability*, some of which
this work does solve and some of which it does not. The things it does
not solve include:

1. Maintaining connections to a RabbitMQ broker or node: using some
sort of TCP load-balancer or proxy is the best route here, though other
solutions such as dynamically updating DNS entries or just pre-loading
your clients with a list of addresses to connect to may work just as
well.

1. Recovery from failure: in the event that a client is disconnected
from the broker owing to failure of the node to which the client was
connected, if the client was a publishing client, it's possible for
the broker to have accepted and passed on messages from the client
without the client having received confirmation for them; and likewise
on the consuming side it's possible for the client to have issued
acknowledgements for messages and have no idea whether or not those
acknowledgements made it to the broker and were processed before the
failure occurred. In short, you still need to make sure your consuming
clients can identify and deal with duplicate messages.

1. Auto-healing from network partitions or splits. RabbitMQ makes use
of the Erlang distributed database Mnesia. This database itself does
not cope with network partitions: it very much chooses *Consistency*
and *Availability* and not *Partitions* from the *CAP* triangle. As
RabbitMQ depends on Mnesia, RabbitMQ itself has the same
properties. Thus the HA work in RabbitMQ can prevent queues from
disappearing in the event of a node failure, but does not have
anything to say about automatically rejoining the failed node when it
is repaired: this still requires manual intervention.

These are not new problems at all; and RabbitMQ's HA work does not
attempt to address these problems. Instead, it focuses solely on
preventing queues from being bound to a single node in a cluster.


The previous situation was that a queue exists only on one node. If
that node fails, the queue becomes unavailable. The HA work solves
this by mirroring a queue on other nodes: all actions that occur on
the queue's master are intercepted and applied in the same order to
each of the slaves within the mirror.

This requires:

1. The ability to intercept all actions being performed on a
queue. Fortunately, the code abstractions we already have makes this
fairly easy.

1. The ability for those actions to be communicated reliably,
consistently and in order to all the slaves within the mirror. For
this we have written a new
[guaranteed multicast](http://hg.rabbitmq.com/rabbitmq-server/file/default/src/gm.erl)
module (also known as atomic broadcast).

1. The ability to reliably detect the loss of a node in such a way
that no messages sent from that node reach a subset of the slaves: to
ensure the members of the mirrored queue stay in sync with each other,
it's crucial that in the event of the failure of the master, any
messages that the master was in the process of sending to the slaves
either fail completely or succeed completely (this is really the
*atomic* in *atomic broadcast*).


In addition, all this communication between the members of the mirror
occurs in an asynchronous fashion. This has advantages such as it
prevents the master from being slowed down if one of the slaves starts
struggling; but it also has disadvantages such as the complexity of
interleavings of actions in the event of failure of the master and
promotion of a slave.

Once the master does fail, a slave is chosen for promotion. The slave
chosen is the eldest slave, in the belief that it's the most likely to
have contents that match the contents of the failed master queue. This
is important because currently there is no eager synchronisation of
mirrored queues. Thus if you create a mirrored queue, send messages
into it, and then add another node which then mirrors that queue, the
slave on the new node will not receive the existing messages. Only new
messages published to the queue will be sent to all current members of
the mirrored queue. Thus by consuming from the queue and thus
processing the messages at the head of the queue, the
non-fully-mirrored messages will be eliminated. Consequently, by
promoting the eldest slave, you minimise the number of messages at the
head of the queue that may have only been known to the failed master.
