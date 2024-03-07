---
title: "Breaking things with RabbitMQ 3.3"
tags: ["HowTo", "New Features", ]
authors: [simon]
---

What? Another ["breaking things"](/blog/2012/11/19/breaking-things-with-rabbitmq-3-0) post? Well, yes, but hopefully this should be less to deal with than the previous one. But there are enough *slightly* incompatible changes in RabbitMQ 3.3.0 that it's worth listing them here.

<!-- truncate -->

## "guest" user can only connect via localhost

**What changed?** In previous versions, the default guest user could connect from any network location. In RabbitMQ 3.3.0 it can only connect via localhost.

**Why did it change?** A default user with well known credentials that is network accessible is not the absolute safest thing in the world.

**What should I do?** Create distinct users for your applications, rather than using "guest". If you can't easily do that, [see here](/docs/access-control) for how to re-enable "guest" access over the network.

## basic.qos semantics have changed

**What changed?** In the AMQP standard the `prefetch-count` field establishes a limit to be shared across all the consumers in the channel. We have decided to instead grant that limit to each consumer in the channel individually.

**Why did it change?** It makes it practical for prefetch limiting to be implemented in a much more efficient way. Prefetch limiting used to have a noticable performance cost on a single node, and a quite nasty one consuming across a cluster. Now it's essentially free in both cases.

**What should I do?** Probably you don't care. Most consuming applications will only have one consumer per channel, so this will make no difference. Those that have more than one consumer per channel will probably be using prefetch limiting in a fairly approximate way (i.e. "just don't swamp me"). Those which require exact, shared prefetch limiting can turn on the `basic.qos` `global` flag to get the old behaviour, [see here](/docs/consumer-prefetch) for details.

## AMQP object names must be UTF-8

**What changed?** The AMQP 'shortstr' data type (which is used for things like exchange and queue names, routing keys and so on) is defined by the spec as being in UTF-8 format. Previous versions of RabbitMQ would accept invalid UTF-8 byte sequences.

**Why did it change?** This caused nasty problems for interoperability with text-based protocols like HTTP and STOMP which can't just have invalid UTF-8 byte sequences dropped into them.

**What should I do?** Use valid UTF-8 sequences when naming things. We expect almost everyone is doing this anyway. One symptom of using invalid UTF-8 byte sequences is that it broke the management plugin - so if that's not broken for you, you certainly don't have to do anything.

## Impersonator tag removed

~~**What changed?** RabbitMQ 3.0.0 introduced an "impersonator" tag which allowed you to give users the ability to forge the [validated user-id](/docs/validated-user-id) field.~~

~~**Why did it change?** This was really an internal implementation detail of the federation plugin that escaped into the wild, so now that the federation plugin does not need it, it's going.~~

~~**What should I do?** If you had a sensible use case for this feature, please tell us about it.~~

**Update: the impersonator tag is back in RabbitMQ 3.3.1.**

## JSON-RPC plugin removed

**What changed?** The JSON-RPC plugin is no longer bundled with the server.

**Why did it change?** The plugin hadn't been maintained for a long time. Its architecture isn't great.

**What should I do?** If you still need the plugin it can be built from mercurial, for the time being. <del>In the future we hope to offer an easier installation experience for non-core plugins.</del> **Update: see the [community plugins](/community-plugins) page to download the JSON-RPC plugin.**

## Client-sent channel.flow support removed

**What changed?** In previous versions of RabbitMQ, consuming clients have been able to send `channel.flow{active=false}` to tell the server to temporarily stop sending messages. This feature has been removed.

**Why did it change?** A long time ago we determined that `channel.flow` did not perform well for flow control and so stopped sending it from server to client in 2.0.0.

It doesn't perform well because when you want to stop receiving messages, you want to stop *now*, not send a request to the peer and hope that it processes it quickly. So we doubt anyone is really using this, and it makes the code notably more complex.

**What should I do?** There are better ways to stop the server from flooding your consumer with messages. Use `basic.qos` (or just stop reading off the socket). If you do want the ability to actively say "stop sending me messages" you can still get the same effect by cancelling your consumer(s) and then re-consuming when you are ready to continue.
