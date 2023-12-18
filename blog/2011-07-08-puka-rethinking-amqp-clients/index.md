---
title: "Puka - rethinking AMQP clients"
tags: []
authors: [marek]
---

I fundamentally disagree with the APIs exposed by our current AMQP client libraries.

There is a reason why they're imperfect: we intentionally avoided innovation in APIs since the beginning. The purpose of our client libraries is to expose generic AMQP, not any one view of messaging. But, in my opinion, trying to map AMQP directly to client libraries APIs is just wrong and results in over-complication and abstractions hard to use.

There is no common ground: the client libraries blindly following AMQP model will be complex; easy to use client libraries must to be opinionated.

<!-- truncate -->

## 1. Channels

The main problem with client libraries following the protocol is caused by the nature of AMQP channels. Channels are often explained as an abstraction matching an operating system thread - you may have many of those, and each one is synchronous.

That's all good, but an AMQP channel is not limited to being a thread - It's so much more than that: error scope, transaction scope, ordering guarantee and scope for acks.

The programmer may decide to use many channels within a single thread, or the opposite: many threads may need to work on a single channel.

The example of the first situation: forwarding messages between two queues (one channel for publishing, one for consuming). Second situation: splitting work from one channel between multiple worker threads (in order to share basic.qos quota between workers).

Inevitably, an author of a client library must make a decision on the relationship between a channel and a thread. It may sound boring if you're from .NET/Java background - these frameworks are opinionated about threading. But assuming anything about threading model in a third party library is a very bad practice in some languages, for example C and Python.

We can repeat almost the same discussion for the problem of handling multiple connections. For example a single thread may need to speak to two connections.

Every client library author must answer the following two questions:
* Is it possible to run multiple synchronous methods, on multiple channels, at the same time?
* Is it possible to run multiple connections, from a single thread?

Two questions - four possible choices:

|Blocking on multiple channels|Handling multiple connections from a single thread||
|--- |--- |--- |
|no|no|simple blocking client (pyamqplib)|
|no|yes|semi-asynchronous client (pika 0.5.2)|
|yes|no|threaded clients (rabbitmq-java, rabbitmq-dotnet)|
|yes|yes|fully asynchronous client (puka)|

## 2. Error handling

The next problem is error handling. Using some of the client libraries it's virtually impossible to catch a AMQP error and recover from it without having to restart the whole program. This is often caused by users not understanding the nature of channels as error scope. But the libraries don't make dealing with errors easy: you get a channel error, now what? For example, doing basic.publish may kill your channel, in theory at any time.

## 3. Synchronous publish

The last broken thing is the lack of support for synchronous publish. It wasn't practically possible to make sure a message got delivered to the broker before RabbitMQ extended AMQP to support 'confirms'. The only solution was to use transactions, which slowed publishing radically. Now, with 'confirms' it's possible but rather hard - as well as writing a callback a user needs to maintain a lock between a library thread and user thread, which requires understanding of the library threading model.

## The birth

Out of this frustration a new experimental Python client was born: [Puka](https://github.com/majek/puka#readme).

Puka tries to provide simple APIs to the underlying AMQP protocol and reasonable error handling. The major features of Puka:

* Single threaded. It doesn't make any assumptions about underlying threading model; the user may write a thin threaded layer on top of Puka if required.
* It's possible to mix synchronous and asynchronous programming styles.
* AMQP Errors are predictable and recoverable.
* Basic.publish can be synchronous or asynchronous, as you wish.

The anti-features of Puka:
* AMQP Channels are not exposed to the user.
* Removed support for some AMQP features, most notably heartbeats.

## Code snippets

As a teaser, here are a few code snippets. 

Declare 1000 queues, one by one:

```python
for i in range(1000):
    promise = client.queue_declare(queue='a%04i' % i)
    client.wait(promise)
```

Declare 1000 queues in parallel:

```python
promises = [client.queue_declare(queue='a%04i' % i) for i in range(1000)]
for promise in promises:
    client.wait(promise)
```

Asynchronous publish:

```python
client.basic_publish(exchange='', routing_key='test',
                     body="Hello world!")
```

Synchronous publish:

```python
promise = client.basic_publish(exchange='', routing_key='test',
                              body="Hello world!")
client.wait(promise)
```

AMQP errors don't affect other parts of your program (publishes, consumes, etc). For example if a 'test' queue was already declared as 'durable', and you try to redeclare it without a proper flag you'll get an error:

```python
> promise = client.queue_declare(queue='test')
> client.wait(promise)
Traceback (most recent call last):
[...]
puka.spec_exceptions.PreconditionFailed: {'class_id': 50, 'method_id': 10,
    'reply_code': 406, 'reply_text': "PRECONDITION_FAILED - parameters for queue
    'test' in vhost '/' not equivalent"}
```

In Puka you may simply catch this exception and continue:

```python
try:
   promise = client.queue_declare(queue='test')
   client.wait(promise)
except puka.PreconditionFailed:
    # Oh, sorry. Forgot it was durable.
   promise = client.queue_declare(queue='test', durable=True)
   client.wait(promise)
```

You may take a look at [Puka code for RabbitMQ tutorials](https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/python-puka) and Puka [examples](https://github.com/majek/puka/tree/master/examples) and [tests](https://github.com/majek/puka/tree/master/tests).

## Summary

In summary, Puka provides a simpler APIs, flexible programming model, proper error handling and doesn't make any decisions on threading. It makes using AMQP fun again.
