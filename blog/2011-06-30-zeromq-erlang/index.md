---
title: "ZeroMQ =/= Erlang"
tags: ["Programming Languages", ]
authors: [mikeb]
---

Recently I saw a tweet saying "ZeroMQ Erlangizes everything!" or some such. While I realise that not everything posted on the web is meant seriously, it does seem there is a stream of similar claims lately that ought to be dammed.

In the article Multi-threading Magic[^1], Pieter Hintjens and Martin Sustrik persuasively explain why concurrency is better served by message-passing than by locks and shared memory. And they are fair, I think, in their analysis -- except for the insinuation that using ZeroMQ transforms your chosen programming language into a domestic Erlang.

<!-- truncate -->

Mid-way through there is a sleight-of-hand. After mentioning the ingredients of Erlang, the article chooses just one of them -- message passing -- to be the key ingredient, and ignores the rest. But the others are at least as important! Let's look at all of them:

* Fast process creation/destruction
* Ability to support » 10 000 concurrent processes with largely unchanged characteristics.

A programming model where processes are lightweight values -- and a good scheduler -- make concurrent programming much easier, in a similar way to garbage collection. It frees you from resource micro-management so you can spend more time reasoning about other things.

* Fast asynchronous message passing.

This is what ZeroMQ gives you. But it gives you it in a form different to that of Erlang: in Erlang, processes are values and message-passing channels are anonymous; in ZeroMQ, channels are values and processes are anonymous. ZeroMQ is more like Go than Erlang. If you want the actor model (that Erlang is based on), you have to encode it in your language of choice, yourself.

* Copying message-passing semantics (share-nothing concurrency).

Notably, Erlang enforces this. In other languages, shared memory and the trap of using it (usually unwittingly) doesn't go away.

* Process monitoring.

Erlang comes with a substantial library, battle-tested over decades, for building highly concurrent, distributed, and fault-tolerant systems. Crucial to this is process monitoring -- notification of process termination. This allows sophisticated process management strategies; in particular, using supervisor hierarchies to firewall core parts of the system from more failure-prone parts of the system.

* Selective message reception.

You can use poll with ZeroMQ to efficiently use many channels in a single process at once; however, you don't get to block on particular kinds of message, meaning you have to buffer messages you don't want to deal with yet, or keep complex state around.

ZeroMQ is a lovely bit of kit, I would not argue otherwise. My point is that it does not magically give you fool-proof concurrent programming; neither does Erlang, but it's an awful lot further ahead than you may have been led to believe. With ZeroMQ there are still a number of things you have to invent, mimicking Erlang or otherwise.

[^1]: [Multi-threading Magic](http://www.zeromq.org/whitepapers:multithreading-magic). It's well worth a read.
