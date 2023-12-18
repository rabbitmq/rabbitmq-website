---
title: "Broker vs Brokerless"
tags: []
authors: [alexis]
---

The RabbitMQ team has been working with Martin Sustrik to provide [code and documentation for using RabbitMQ and ZeroMQ together](http://github.com/rabbitmq/rmq-0mq/wiki).  Why is this a good idea?  Because the broker and brokerless approaches are complementary.  We'll be posting more about this as the codebase evolves.  This post is introductory and can be seen as commentary on [Ilya Grigorik's excellent introduction to ZeroMQ](http://www.igvita.com/2010/09/03/zeromq-modern-fast-networking-stack/) and the [InfoQ summary of Ilya's article](http://www.infoq.com/news/2010/09/introduction-zero-mq).

<!-- truncate -->

I like ZeroMQ and think it is useful - of which more below.  But I have seen some brash claims made on its behalf. This [can lead to confusion](http://www.reddit.com/r/programming/comments/d9jrm/zeromq_networking_stack_sending_millions_of_small/).

So what is the 'brokerless' model?  In the comments to Ilya's and the InfoQ post, ZeroMQ is compared to SCTP and to JGroups.  These are important technologies and form a helpful starting point for thinking about brokerless messaging patterns.  Let's look at what you might need if you combine messaging (like SCTP) with pubsub groups (like JGroups) to make arbitrary networks using 'brokerless' peers.

**Some things you might need in a brokerless network**

If you set up a brokerless messaging network, three things that you might need are: discovery, availability and management.

Discovery is the problem of maintaining a roster of peers that a system can send messages to, and who can join this roster.

Availability is the problem of dealing with peers disappearing from time to time.  For example if you have 50 subscribers to a feed, and only 40 of them are available to receive updates, should you keep a copy of their messages until they reappear?  That could mean "for a very long time".   And if you do keep messages and lists of "who has seen what", then where is it best to do this?

This is also a problem when message receivers do not respond quickly. To [quote from Martin Sustrik of ZeroMQ](http://news.ycombinator.com/item?id=1662868), "You can never differentiate between 'network error and 'no response received'. TCP in no better. You'll have accept that or keep with a single box."

Management is an interesting area for analysis too.  ZeroMQ's model aligns messaging closely with sockets.  This means that, like in TCP, 'any' communication network can be implemented in such a way that it provides some messaging capability.  But, networks can be arbitrarily complex.  For example unless you don't care about it (and you may not) management of "who is connected to who, and who can be connected to who" can get complicated.   This kind of management problem gets more difficult the more you scale.  Models like JGroups usually make this problem go away by making a simplifying assumption, i.e.: everyone in the group talks to everyone else in the group.  Easy :-)

I am not suggesting that you always need these things.  The ZeroMQ philosophy is to home right in on networking, and this creates focus.  But if you do need them then you might end up implementing them yourself.  Enter the broker...

**How can a broker help to solve these problems **

Brokers can provide solutions for discovery, availability and management.  They can also form reliable networks, e.g. for email delivery and instant messaging services.

First: what is a 'broker'?  It is both a leader, and an intermediary.

A broker is a leader.  In distributed computing, the problems of management, discovery and availability are typically solved by electing a leader among the set of distributed components.  In the world of "messaging", such a leader is usually known as a "broker".  Stating that in order to be a leader, you need to be a broker, makes it much easier to work out who is the leader, than in a completely brokerless system in which "anyone can lead, but nobody knows how".

A broker is also an intermediary.  For example, instead of having to connect everyone in the group directly, communicators simply connect to the broker (or brokers).  A broker may also be used to solve availability problems such as "offline consumer", by providing persistence and managing recovery on behalf of systems that cannot do it themselves.

Thus, brokers **simplify** network design by making reasonable assumptions.  Of course, when those assumptions don't hold, you may not want a broker.

**Brokers are not 'centralized'**

A commonly held misconception about brokers is that they are 'centralized'.  Brokers are NOT necessarily a 'centralized' solution.  Intermediaries can be decentralized.  You can have multiple brokers in a single network in order to increase throughput and availability.  Sometimes these networks of servers are called federations.  Note that individual brokers do not need to be 'highly available' in order to have a redundant network of servers.

This is, for example, how email (SMTP) and XMPP networks work.  Both email and instant messaging are brokered models, and both use multiple brokers in a simple and redundant way.  For example, mail transfer agents provide a delivery and routing network for email.  It would be difficult to come up with a design for this that was completely peer to peer, without reinventing 'special peers' - also known as brokers.

**So what model is simplest?**

Peer to peer models are not **inherently** more or less simple than brokered models.  If you do not need discovery, availability, management, or intermediation then it may be simpler to not use them.  But if you need them, it may be simpler to not implement them yourself.

Networks of servers (brokers) are not more or less redundant or decentralized than networks of clients (peers).  Both the broker and brokerless model have their pros and cons in terms of reliability, and other considerations eg latency.

The two models solve different problems.

For example, RabbitMQ and ZeroMQ are complementary.  From a RabbitMQ point of view ZeroMQ is a 'smart client' that can use its buffers like a queue.  That's useful in some cases.  From a ZeroMQ point of view, RabbitMQ is a network device that provides services that you would not necessarily want to have to implement yourself.

We want our customers and users to always have the best toolset available which is why we have provided the [Github repo for you to play with](http://github.com/rabbitmq/rmq-0mq/wiki).  Thanks again to Martin Sustrik for his work on this.

Watch this space for more on this interesting area of work and discussion.
