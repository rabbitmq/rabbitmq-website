---
title: "RabbitMQ, backing stores, databases and disks"
tags: ["Introductory", ]
authors: [matthew]
---

From time to time, on
our [mailing
list](https://lists.rabbitmq.com/cgi-bin/mailman/listinfo/rabbitmq-discuss) and elsewhere, the idea comes up of using a
different *backing store* within RabbitMQ. The backing store is
the bit that's responsible for writing messages to disk (a message can
be written to disk for a number of reasons) and it's a fairly frequent
suggestion to see what RabbitMQ would look like if its own backing
store was replaced with another storage system.

Such a change would permit functionality that is not currently
possible, for example out-of-band queue browsing, or distributed
storage, but there is a fundamental difference in the nature of data
storage and access patterns between a message broker such as RabbitMQ
and a generic database. Indeed RabbitMQ deliberately does not store
messages in such a database.

<!-- truncate -->

Firstly we need to discuss what properties RabbitMQ itself expects of
any backing store. RabbitMQ writes messages to disk in two cases:
either the message has been published in such a way that it must be
written to disk (e.g. published with `delivery_mode = 2`)
or memory pressure is causing RabbitMQ to start running out of RAM and
so it is pushing messages to disk in order to free up RAM. In the
first case, just because we've written the message to disk, does not
mean that we're going to forget about it from RAM: if memory is
abundant then there's no reason to incur the cost of a subsequent disk
read.

In the second case, it means that any backing store that keeps
everything in RAM all the time is immediately not a good fit: RabbitMQ
writes messages to disk in order to free up RAM, thus if the "writing
to disk" bit actually just moves the message from one area of RAM to
another without freeing up RAM then nothing has been gained. Using
such a backing store might work and it might achieve the improvements
in functionality desired, but such a change would have substantial
impact on the scalability of RabbitMQ: it would no longer be able to
absorb more messages than can be kept in RAM, which was one of the
*raisons d'être* for the *new persister* work that led to
RabbitMQ's current default backing store.

Some databases or key-value stores write disk contents
by initially writing a snapshot of their entire data set, and then
writing deltas to that data set. After a while, either time based or
based on the number of deltas, or ratio of deltas to snapshot size, a
new snapshot is written, and then the previous snapshot and all its
deltas can be thrown away. This is how RabbitMQ's *old persister*
worked. The problem with this is that it can repeatedly cause vast
amounts of data to be unnecessarily rewritten. Imagine you have two
queues, one of which is entirely static: no one is publishing messages
to it, and no one is consuming messages from it, it's just sitting
there, but it contains several million messages, all of which have
been written to disk. The other queue is almost always empty, but is
moving very quickly -- thousands of messages a second are being
published and consumed from it. Every message sent to that queue has
to be written to disk, but they're all being consumed as soon as
they've been written to disk. Consider the effect of this scenario on
the backing store: the second queue will cause a rapid stream of
deltas to occur but whenever the snapshot is rewritten, it'll cause
the entire contents of the first queue to be rewritten too *even
though there has been no change to that queue's contents*. So
again, backing stores that write messages to disk in this way are
likely to be a poor fit for RabbitMQ's needs.

So suitable backing stores (assuming the performance and scalability
properties that RabbitMQ has need to be kept: this is by no means
certain in all scenarios) would be able to store a volume of data
bounded only by disk size rather than RAM, and also have a reasonably
sophisticated means of storing data on disk such that unchanged data
won't be rewritten indefinitely.

There are a couple of further aspects of RabbitMQ's default backing
store that are worth mentioning. Queues themselves decide when and
whether to write a message to disk. But a single message can be sent
to multiple queues and it is obviously advantageous to make sure each
message only gets written to disk once. However, there are two
distinct pieces of information here: firstly, the message content
itself. This is the same in every queue that the message has been sent
to, and should only be written to disk once, regardless of the number
of queues it goes to; note that subsequent writes of this do not need
to do a value comparison: if the ID of the message is known to the
backing store then the message body will match what is already on disk
-- message content is never altered by the broker. The second piece of
information is the existence of the message in each queue: where in
the queue it lies, what its neighbours are, and what its
queue-specific status is. This second piece of information is what
allows RabbitMQ to start up, recover messages and queues from disk and
ensure that the messages in each queue are in the same order as when
RabbitMQ was shut down.

Thus RabbitMQ's default backing store consists of a
node-global *message store* which is concerned only with writing
message contents to disk; and a per queue *queue index* which
uses a very different format for writing per message per queue data to
disk. Because these two needs are very specific, there are an awful
lot of optimisations that can be applied (and we have!).

Generic database benchmarks normally show that read performance vastly
out performs write performance. If it doesn't then that normally means
the writes aren't actually going to disk (with `fsync`), or
there's a bug which is crippling read performance. And indeed,
databases have historically been optimised for read-heavy
workloads. This matches their general use case: there is a slowly
expanding data set which must be queried in various different ways.
Deletions tend to be quite rare: if you think about the typical
website shopping basket on top of a relational database, then unless a
customer deletes their account, there are very few reasons to ever
issue deletions -- even if a product is discontinued, you're probably
just going to set a flag on that product row because otherwise you
risk stopping customers from being able to see their order history
(assuming it's normalised).

So the vast volume of data in most databases is fairly static. This is
the exact opposite of data in message brokers: for us, *reading*
data is the rarest operation, and *writing* and *deleting*
data are the common cases. Ideally, if RabbitMQ is running in
plenty of memory, there will never be any reads from disk at
all. There will only be writes for messages that are published in such
a way that they have to be written to disk, and even then, provided we
can get the message out to a consumer quickly enough, there are many
ways in which we can optimise out those writes. We only ever read data
when memory pressure has forced us to write messages to disk and then
forget about the message from RAM. Read performance is certainly
important: we work hard to make sure RabbitMQ gets rid of data as fast
as possible (without utilising `/dev/null`) and being able
to read messages from disk quickly is part of that. But avoiding the
write in the first place is the goal.

In fact, as far as message brokers are concerned, it's best to think
of RAM as a large write-back cache for the disk, and then the task is
to optimise the management of this cache to maximise the elimination of
writes by delaying them for as long as possible in the hope that the
corresponding deletion occurs before the write has really gone to
disk. This is quite obviously very different from normal databases
which do not try to make gains from the lifespan of data being so
short as it frequently is in a message broker.

None of this is meant to deter efforts to make RabbitMQ work with
alternative backing stores, but merely to explain why we decided to do
our own thing when writing the *new persister* for RabbitMQ
(which first came out with RabbitMQ version 2.0.0) rather than use an
off-the-shelf data store. It explains why building a high performance
message broker directly on top of a normal database is tricky at best,
and why the nature of data in a message broker is very different from
the nature of data in a database.
