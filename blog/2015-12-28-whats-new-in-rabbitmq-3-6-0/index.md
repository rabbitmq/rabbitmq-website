---
title: "What's new in RabbitMQ 3.6.0"
tags: ["New Features", ]
authors: [alvaro]
---

We are pleased to announce the immediate availability of RabbitMQ
3.6.0, a new version of the broker that comes packed with lot of
[new features](https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_6_0). Before
we go on, you can obtain it here:
[/docs/download](/docs/download).

This release brings many improvements in broker features, development
environment for our contributors, and security. Let's take a look at
some of the most significant ones.

<!-- truncate -->

## Features

There are quite a few new features and improvements inside RabbitMQ
3.6.0 but from my point of view the most important one are
*lazy-queues*. Disclaimer: the author of this blog post worked on this
feature ;-)

### Lazy Queues

This new type of queues work by sending every message that is
delivered to them straight to the file system, and only loading
messages in RAM when consumers arrive to the queues. To optimize disk
reads messages are loaded in batches.

There are a few advantages from this approach versus the old
approach. RabbitMQ default queues keep a cache of messages in memory
for fast delivery to consumers, the problem with this cache is that if
consumers aren't fast enough, or consumers go completely offline, then
more and more messages will be held in RAM, which at some point will
trigger the algorithm that makes the queue page messages to disk. Even
tho in previous releases we have
[improved the paging algorithm](https://github.com/rabbitmq/rabbitmq-server/issues/227),
paging can still block the queue process, which could result in
[credit flow](/blog/2015/10/06/new-credit-flow-settings-on-rabbitmq-3-5-5)
kicking in, which ends up blocking publishers.

With lazy queues there's no paging, since as stated above, all
messages are sent straight to disk. Our tests have shown that this has
the consequence of having a more even throughput for queues, even when
consumers are offline.

Another advantage of lazy queues is the reduced RAM usage due to the
elimination of the message cache mentioned above.

Finally, lazy queues can be enabled and disabled at runtime. You can
use [policies](/docs/parameters#policies) to
convert queues from default ones to lazy queues, and even back to the
default mode if you feel the need for it.

To learn more about lazy queues please refer to their
[documentation](/docs/lazy-queues).

### Faster Mirror Queue Synchronization

Synchronization between queues has been greatly improved. Before
RabbitMQ 3.6.0 the synchronization algorithm would try to send one
message at a time to those mirrors that were out of sync. This
algorithm has been improved by implementing batch publish operations
inside RabbitMQ's queues.

During development our tests showed that for a queue with one million
messages, the old algorithm would take approximately 60 seconds for a
full sync, while the new algorithm takes around 10 seconds for the
same amount of messages.

Read more about mirror queue synchronization
[here](/docs/3.13/ha#batch-sync).

## Moving to Git

During a big part of this year, our development moved completely from
our self-hosted Mercurial repository, to a Git based workflow hosted
on Github. This has improved a lot our own productivity as a team,
making it easier to work on new features, and get feedback between
colleagues.

What's better though, is the fact that now is much easier for RabbitMQ
users to send their contributions back to us.

This release comes with quite a few improvements to the broker
directly sent by six different external contributors. Of course we
want to improve that number.

Moving to Github also means that now we have a public bug
tracker. Feel free to submit issues here:
[https://github.com/rabbitmq/rabbitmq-server/issues](https://github.com/rabbitmq/rabbitmq-server/issues).
Here's our guide on how we use
[Git and Github](/github).

## Move to Erlang.mk

RabbitMQ as a project predates popular build tools from the Erlang
ecosystem like Rebar or [Erlang.mk](http://Erlang.mk), therefore we had our own way to
build the broker and to manage Erlang dependencies. This was
unfortunate since it made a little bit harder to integrate external
libraries with RabbitMQ, and at the same time, it complicated things
for other Erlang users to use RabbitMQ libraries. Just take a look at
this Github search where people are trying different ways to integrate
our very own `gen_server2` into their projects:
[gen_server2 search](https://github.com/search?l=erlang&amp;q=gen_server2&amp;type=Code&amp;utf8=%E2%9C%93)

To improve the situation in this area, one of our colleagues worked
hard on a complete overhaul of our build system. We stayed with
`make`, a tried and tested tool, but we migrated to
Erlang.mk, a make based build system for the
Erlang world.

This improved how we handle dependencies, allowed us to remove lot of
code that was duplicating features already provided by Erlang.mk, and
even reduced build times!

Changing things on our build system, means introducing breaking
changes on how we build RabbitMQ Plugins. If you are a plugin author,
you might want to read our new
[plugin development guide](/plugin-development).

## Security

Last but not least, let's talk about improvements in security,
specifically on how passwords are handled in RabbitMQ. Before version
3.6.0, passwords were stored in RabbitMQ as an md5 hash, which for
this day and age, is less than ideal. Now we have set `SHA-256` as the
default password hashing function, with `SHA-512` being an option that
we provide out of the box.

In this regard, it's also possible to add other hashing algorithms to
RabbitMQ via plugins. To add a new hashing algorithm you just need to
implement this Erlang behaviour
[rabbit_password_hashing.erl](https://github.com/rabbitmq/rabbitmq-common/blob/432612a588f9741609b1318294933f6427ab2ee1/src/rabbit_password_hashing.erl)
which exposes only one function: `hash/1`.

If you create a new password hashing plugin, don't forget to announce
it on our mailing list:
[rabbitmq-users](https://groups.google.com/forum/#!forum/rabbitmq-users).

## Conclusion

As you can imagine, we are really happy with this new RabbitMQ
release, which has set the foundation on which we can continue to
improve RabbitMQ, but now even closer together with the community, by
having standard tools like Erlang.mk and a collaborative platform like
Github.

Don't forget to take a look at our full release notes and learn about
all the new features and bug fixes that ship with RabbitMQ 3.6.0:
[release notes](https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_6_0).
