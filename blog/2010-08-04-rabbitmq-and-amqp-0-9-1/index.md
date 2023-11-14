---
title: "RabbitMQ and AMQP 0-9-1"
tags: ["New Features", ]
authors: [simon]
---

Since the beginning, RabbitMQ has implemented the 0-8 version of the AMQP specification. This was the first publicly-available version, but there's been plenty of development since then. In particular, we've wanted to support the 0-9-1 version of AMQP for a while now.

<!-- truncate -->

For around the last year we've maintained a 0-9-1-supporting branch of the broker and clients in Mercurial, and interested users have been running that version as it matures. Well, it's finally mature and we're now merging the 0-9-1 support into the default branch. This means it'll be in the next release.

At this point, you're probably wondering what the differences are between 0-8 and 0-9-1. Well, the good news is that the differences are not huge, and are entirely sensible. 0-9-1 mostly cleans up the 0-8 spec, explaining more clearly how the broker and clients are expected to behave in certain edge cases, and removing a whole load of ambiguity and half (or less) thought out features from 0-8.

In fact, if you're running 1.8.0 or later, you're already running a broker with [most of the semantic changes](http://lists.rabbitmq.com/pipermail/rabbitmq-announce/2010-June/000025.html) from 0-9-1. But the wire protocol has changed a bit too, so it matters whether you're speaking 0-9-1 or 0-8.

For the Java and Erlang clients, we're intending to simply switch to supporting AMQP 0-9-1 exclusively in the next release. The .NET library already supports multiple protocols, so we're adding 0-9-1 as another option (and making it the default). For the broker we're going to support both AMQP 0-9-1 and AMQP 0-8. For any other client libraries we encourage you to speak to the library developer :wink:

This means that this time **it's safe to upgrade just your broker, or your broker and all your clients, but it's not safe to upgrade your clients without upgrading your broker!**

Thank you for your attention.
