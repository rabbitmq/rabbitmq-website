---
title: "An end to synchrony: performance improvements in 3.3"
tags: ["Performance", "New Features", ]
authors: [simon]
---

Well, we got the [bad news](/blog/2014/04/02/breaking-things-with-rabbitmq-3-3) out of the way yesterday, so today let's talk about (some of) the good news: some types of publishing and consuming are now a great deal faster, especially in clusters.

<!-- truncate -->
The various internal parts of RabbitMQ communicate by passing messages among themselves (both within nodes and across clusters); this is how Erlang applications work. It's always been a design goal of RabbitMQ that operations which were asynchronous in AMQP (i.e. sending and receiving messages and acknowledgements) should be asynchronous inside the server. There's a good reason for that: whenever you perform a synchronous operation you are limited by latency while you wait for the reply, so asynchrony is a route to much faster messaging.

Unfortunately, while that's always been a goal, we haven't always hit it. In particular there were two holdouts where asynchronous messaging in AMQP became synchronous inside the server: mandatory publishing, and consuming messages with a prefetch limit set through `basic.qos`. These holdouts have been fixed in 3.3.0.

As a refresher, mandatory publishing means **tell the publisher if its messages did not end up routed to any queues**, while consuming with a prefetch limit means **make sure you only send the consumer a maximum number of outstanding unacknowledged messages**.

So let's look at some numbers...

### Mandatory publishing

||3.2.4|3.3.0|
|--- |--- |--- |
|**Mandatory publish**|5.0kHz balanced|12.9kHz balanced|


_This test involved a two node cluster on a single machine, with a publisher connected to one node and a consumer connected to the other, with the queue located on the same node as the consumer. Messages were small and non-persistent, and neither acks nor confirms were used. The machine was a Dell Precision workstation, but the point is to look at relative performance change here._

Hopefully you can see how badly synchrony hurts performance here. And remember that the performance penalty imposed by synchronous messaging is proportional to network latency - and these two nodes were located on the same machine, so a real cluster would have a worse drop off.

Note also that in both cases the sending and receiving rates were the same; messages were not backing up in the queue.

### Consuming with a prefetch limit

We would expect that a high prefetch limit would give nearly the same performance as no prefetch limit, and that as we reduce the limit we will get lower performance, since at some points the queue will have to wait until the consumer acks a message before it can send another.

||3.2.4|3.3.0|
|--- |--- |--- |
|**No limit**|15.0kHz send / 11.0kHz receive|15.8kHz balanced|
|**prefetch_limit=1000**|6.2kHz send / 3.6kHz receive|15.8kHz balanced|
|**prefetch_limit=100**|6.2kHz send / 3.6kHz receive|13.5kHz balanced|
|**prefetch_limit=10**|6.2kHz send / 3.6kHz receive|14.0kHz send / 7.0kHz receive|
|**prefetch_limit=1**|18.0kHz send / 0.9kHz receive|18.0kHz send / 0.9kHz receive|

_This test had the same characteristics as above except that the queue was on the same node as the publisher and acknowledgements were used when consuming._

There are several interesting effects visible in the numbers in this table:

* Even with the prefetch limit off, 3.3.0 was slightly faster, and prevented messages backing up. This is due to a new feature which I'll talk about in a future blog post.
* A sufficiently high prefetch limit (such that the queue never has to wait for the consumer) has no performance cost in 3.3.0, whereas any prefetch limit at all hurts performance in 3.2.4.
* All of the prefetch limits between 10, 100 and 1000 had exactly the same (bad) performance in 3.2.4 - that's because the limiting factor turns out to be the synchronous communication between the consuming channel and the queue.
* Finally, when we reach a prefetch limit of 1, both 3.2.4 and 3.3.0 perform equally badly - that's because the limiting factor has now become the amount of time we wait for the consumer to send an acknowledgement for a single message at a time.

So with these changes the messaging internals of RabbitMQ are now asynchronous under all circumstances, bringing substantial performance benefits. It's worth pointing out that the semantics for `basic.qos` [had to change slightly](/docs/consumer-prefetch) for this to be possible, but this seems like a small price for such a large improvement.
