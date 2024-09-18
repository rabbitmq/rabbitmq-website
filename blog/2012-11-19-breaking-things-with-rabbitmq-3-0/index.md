---
title: "Breaking things with RabbitMQ 3.0"
tags: ["New Features", "HowTo", ]
authors: [simon]
---

RabbitMQ includes a bunch of cool new features. But in order to implement some of them we needed to change some things. So in this blog post I'm going to list some of those things in case you need to do anything about them.

<!-- truncate -->

## Mirror queue policies

**What changed?** In RabbitMQ 3.0, queue mirroring is no longer controlled by the `x-ha-policy` argument when declaring a queue. Your applications can continue to declare this argument, but it won't cause queues to be mirrored. Instead you can declare one or more [policies](/docs/parameters) which control which queues are mirrored, and how.

**Why did it change?** As anyone who's used mirrored queues will tell you, requiring applications to know which queues are mirrored is a pain. The new approach puts configuration in the broker, where it belongs, and also supports changing mirroring policy at any time.

**What should I do?** You need to make sure your queues are still mirrored. For the full documentation [see here](/docs/3.13/ha), but if you just want to make sure that all queues (except those with auto-generated names) are mirrored across all nodes, run:

```shell
rabbitmqctl set_policy HA '^(?!amq\\.).*' '{"ha-mode": "all"}'
```

## New federation

**What changed?** Federation is configured quite differently in RabbitMQ 3.0. The `x-federation` exchange type no longer exists; instead normal exchanges are made federated by policy in the same way that HA queues are. Furthermore, upstreams are defined dynamically as well.

**Why did it change?** Again, your applications should not need to know about federation. Federation configuration in `rabbitmq.config` was complicated and confused many people. And needing to restart the broker to add a new upstream was not fun.

**But I have a working federation setup! You broke it.** Migrating to the [new way of doing federation](/docs/federation) will take a bit of work. In the mean time you can use the `rabbitmq_old_federation` plugin. This is a backport of the 2.8.7 federation plugin for RabbitMQ 3.0. To use it:

```shell
rabbitmq-plugins disable rabbitmq_federation

rabbitmq-plugins enable rabbitmq_old_federation
```

and then edit your `rabbitmq.config` file so that the `rabbitmq_federation` section is renamed to `rabbitmq_old_federation`.

## New clustering

**What changed?** The clustering-setup commands in rabbitmqctl have changed.

**Why did it change?** The old ones were not very user friendly.

**What do I need to do?** If you have an existing cluster, nothing. If you write scripts to create clusters, you will need to edit them. In particular, `rabbitmqctl cluster` should be replaced with `rabbitmqctl join_cluster`, but:

* You don't need to invoke `rabbitmqctl reset` first
* You don't need to list all the nodes on the command line; if you give more than one node then they will be taken as a list of nodes to try to cluster with
* Whether the new node is a disc or RAM node is determined by the --disc and --ram flags. The default is to be a disc node.

For more details, see [the documentation](/docs/man/rabbitmqctl.8#join_cluster).

## Removal of "immediate" flag

**What changed?** We removed support for the rarely-used "immediate" flag on AMQP's basic.publish.

**Why on earth did you do that?** Support for "immediate" made many parts of the codebase more complex, particularly around mirrored queues. It also stood in the way of our being able to deliver substantial performance improvements in mirrored queues.

**What do I need to do?** 
If you just want to be able to publish messages that will be dropped if they are not consumed immediately, you can publish to a queue [with a TTL of 0](/docs/ttl).

If you also need your publisher to be able to determine that this has happened, you can also use the [DLX](/docs/dlx) feature to route such messages to another queue, from which the publisher can consume them.

## frame_max

**What changed?** The RabbitMQ server now disconnects clients which send frames larger than the negotiated `frame_max` setting for the connection.

**Why did it change?** Malicious (or badly written) clients could send arbitrarily large frames and cause the server to run out of memory.

**Why do I care?** Unfortunately some clients don't implement AMQP framing correctly. RabbitMQ 3.0 will allow clients to exceed `frame_max` by a fudge factor of a few bytes (to allow for off by one errors and incorrectly excluding the frame header) but if your client has broken framing you will be disconnected after trying to send a message larger than `frame_max` (which by default comes out to 128kb; see the [documentation](/docs/configure#config-items) on how to raise this).

## Management and JSON-RPC channel port changes

**What changed?** The management plugin now listens on port 15672, not 55672. JSON-RPC channel now listens on 15670, not 55670.

**Why did it change?** The old ports were in the ephemeral port range on many operating systems, meaning that web browsers and other client applications might use these ports arbitrarily. You're not supposed to listen on these ports.

In particular we noticed that the management plugin web UI could, when pointed at a stopped broker on localhost, end up getting the browser to connect to itself on port 55672. This prevented the broker from starting again.

**What do I have to do?** Hopefully nothing. RabbitMQ will attempt to open the old port and send HTTP redirects to the new one. But if you're using an application other than a web browser to talk to the HTTP API, it might not support HTTP redirects. If it doesn't, you'll need to point it at the new port.

Note that `rabbitmqadmin` prior to version 3.0 was such an application. Oops.

Also note that the STOMP plugin still listens on port 61313. Although this is in the ephemeral range, it's the closest thing STOMP has to a standard port, so we have to stick with it.

## expiration property

**What changed?** We now expect the expiration field in message properties to be parseable as an integer if it's set at all.

**Why did it change?** In order to support [per-message TTL](/docs/ttl#per-message-ttl-in-publishers) we need a place to get the TTL of the message from, and this is the obvious place. Unfortunately the AMQP standard defines it as a string, so we try to parse it as an integer and will throw a channel exception if it is not.

**What do I have to do?** Make sure that if you're using that property then you're using it because you expect RabbitMQ to expire the message, and make sure it's set to a string which can be parsed as an integer.
