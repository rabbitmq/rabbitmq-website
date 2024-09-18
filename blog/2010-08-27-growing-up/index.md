---
title: "Growing Up"
tags: ["New Features", ]
authors: [alexis]
---

Some three and a half years after we launched RabbitMQ, we have this week released [RabbitMQ 2.0](http://lists.rabbitmq.com/pipermail/rabbitmq-announce/2010-August/000028.html).

This means some big changes.  The most important of these is our new Scalable Storage Engine.  RabbitMQ has always provided persistence for failure recovery.  But now, you can happily push data into Rabbit regardless of how much data is already stored, and you don't need to worry about slow consumers disrupting processing.  As the demands on your application grow, Rabbit can scale with you, in a stable, reliable way.

Before introducing RabbitMQ 2.0, let me reiterate that as Rabbit evolves you can count on the same high level of commitment to you as a customer or end user, regardless of whether you are a large enterprise, or a next-gen start-up, or an open source community.  As always, [get in touch](mailto:info@rabbitmq.com) if you need help or commercial support.

<!-- truncate -->

**New capabilities**

So what can you expect? In short, a more capable bunny.  In particular:
1. RabbitMQ 2.0 has an all new Scalable Storage Engine.  There is also a persistence API.
2. [Native support for multi-protocol messaging](/blog/2010/08/04/rabbitmq-and-amqp-0-9-1) delivering better interoperability and more choice
3. The release coincides with first class [Spring integration](http://www.springsource.org/spring-amqp) for both Java and .NET from SpringSource - with more to come e.g. a [Grails plugin](http://blog.springsource.com/2010/08/23/rabbitmq-plugin-for-grails-early-access/)
4. Foundations for future additional [management and monitoring features](/blog/2010/08/06/management-monitoring-and-statistics) as part of rabbit-management and other tools
5. Plugins are now distributed as drop-in binary packages, making them much easier to use.

As always, read the [full release notes](http://lists.rabbitmq.com/pipermail/rabbitmq-announce/attachments/20100825/2c672695/attachment.txt) before upgrading.


**Scalable Storage means greater stability**

The vision of Rabbit is that messaging should just works. Part of this is the need for stable behaviour at scale. You ideally need a broker that you can just start up and forget about. Our new Scalable Storage Engine takes us closer to this.
RabbitMQ has always had its own storage engine whose job is to persist messages. We use this to provide guaranteed eventual delivery, support for transactions, and [high availability](/docs/3.13/ha).

But, in RabbitMQ 1.x, the broker used a naive albeit effective storage model: every message stored on disk would also be cached in RAM. While this helps performance it makes it much harder to manage scale unless you are able to predict growth and overprovision memory accordingly.

With RabbitMQ 2.0, the broker is capable of completely flushing messages to disk. It has a much smarter caching and paging model. This improves memory usage by paging messages out to disk, and in from disk, as needed.  In other words, you don't have to worry about one slow consumer disrupting your entire set up, and can happily push data into Rabbit regardless of how much data is already stored.  This improves stability at scale.

We'll blog about this soon.  In the meantime, please try it out.  Storage enthusiasts might like to check out the [notes in the codebase](http://hg.rabbitmq.com/rabbitmq-server/file/5061e6041732/src/rabbit_msg_store.erl).

**Storage API**

RabbitMQ now provides a storage API. This allows pluggable persistence. 

RabbitMQ includes its own persistent message database, which is optimised for messaging use cases. But what if you just have to use Oracle or MySQL? Or, what if you want to experiment with combinations of RabbitMQ with the latest and greatest NoSQL key-value store? Now you can do that.  Please contact us if you want to write a driver for your favourite store.

**Natively Multiprotocol**

Our aim is lower the cost of integration by making messaging simpler, providing a stable manageable server, and supporting the main technologies that you need.

Rabbit has supported AMQP since its very inception. RabbitMQ began with support for AMQP 0-8, and as AMQP evolved, added support for 0-9-1 on a branch.  [AMQP 0-9-1](http://www.amqp.org/confluence/download/attachments/720900/amqp0-9-1.pdf) is fewer than 50 pages long, making it highly readable, as well as tree-friendly. A shorter, simpler protocol is easier to implement and validate which is important for customers who want AMQP from more than one vendor.

With the 2.0 release, RabbitMQ can now directly support multiple protocols at its core - with AMQP 0-8 and 0-9-1 pre-integrated. 
In addition, RabbitMQ extensions provide support for a wide range of protocols including [XMPP](http://hg.rabbitmq.com/rabbitmq-xmpp/), [STOMP](http://hg.rabbitmq.com/rabbitmq-stomp/), [HTTP JSON/RPC](http://hg.rabbitmq.com/rabbitmq-jsonrpc/), pubsub for HTTP (e.g. Google's [PubSubHubBub](http://github.com/tonyg/rabbithub)), and [SMTP](http://hg.rabbitmq.com/rabbitmq-smtp/).

Contact us if you want support for more protocols, or have questions about our future plans; e.g.: providing a safe evolutionary path to future versions of AMQP.

**Better Plugin Support**

We aim to provide support for a wide range of messaging applications without making the broker bloated and complex.  [Plugins](/plugin-development) are key to this.  They let us and you extend and customise the capability of RabbitMQ.  Previously you could only load our plugins by building from source.  With the 2.0 release we are distributing pre-compiled plugins.  Drop them into a directory from where RabbitMQ can load them.

To get a feel for what you can do, I recommend taking a look at Tony Garnock-Jones excellent [introduction to plugins](http://www.erlang-factory.com/upload/presentations/229/ErlangFactorySFBay2010-TonyGarnock-Jones.pdf) from the last Erlang Factory.  Congratulations are due to [Jon Brisbin](http://jbrisbin.com/web2/archives/13/) for being the first person to create a plugin for RabbitMQ 2.0, in less than a day or two, adding [webhooks for RabbitMQ](http://github.com/jbrisbin/rabbitmq-webhooks).  Matthew Sackman and Tony Garnock-Jones have also created [some](http://lists.rabbitmq.com/pipermail/rabbitmq-discuss/2010-April/006808.html) [custom](http://github.com/tonyg/script-exchange) [exchanges](http://github.com/tonyg/presence-exchange).  Please note that many of these are demos and examples so the usual caveats apply.

**First class Spring support in Java and .NET from SpringSource**

We think that messaging should be intuitive regardless of the application platform you develop for. In Java, the clear leader is Spring and we are part of the SpringSource division of Vmware, thus adding fully fledged Spring support was a must. We are extremely grateful to Mark Fisher and Mark Pollack from the SpringSource team for bringing this to fruition. With the release of RabbitMQ 2.0 we are highlighting to the whole community that [Spring support is officially available](http://www.springsource.org/spring-amqp).

If you are a .NET user, you have been able to run RabbitMQ as a Windows service, and use it from [.NET languages and WCF](/client-libraries/dotnet) for some years now. This is great if you want to do messaging from Windows based applications, such as Excel, to back end services written in Java or any other of the hundreds of AMQP integration points. Now, with Spring.NET support we offer you a common application development model as well, that works equally well in both Java and .NET.

**Putting it all together: more freedom to choose**

We believe that protocol interoperability and easier integration give you choice. What if you are deploying for the enterprise, and need to connect RabbitMQ to legacy enterprise messaging systems that do not support AMQP? Spring gives you a way forward. With Spring Integration, you have first class access to most messaging systems. Our commitment is to support customers' choice of technology.  Freedom from lock-in means that you can expect to evolve your systems in line with business needs, instead of being constrained by vendors' product plans and pricing schemes.

**Management and monitoring**

We have made important improvements to Rabbit's management, and overall serviceability. 

Rock solid management, across 'any' use case, is the heart of what makes messaging non-trivial. It's easy to find messaging tools that focus on just one or two use cases, and do a reasonable job. But providing that all important it just works experience in the majority of cases at once, and then running stably over time, and not crashing once a month at 2am, well that's hard. It takes care and it really needs good management tooling.

Rabbit has always provided some [tools for management](/docs/man/rabbitmqctl.8) and the community has done an [outstanding job](http://blog.scoutapp.com/articles/2010/03/08/rabbitmq-monitoring-plugins) in [extending them](http://alicetheapp.com/) and [making them more useful](http://blog.dossot.net/2010/01/monitoring-rabbitmq-with-zabbix.html) and [relevant](http://github.com/b/cookbooks/tree/master/rabbitmq). But we want more features, and this means making changes to the broker, and especially at the API level.  These APIs are critical for showing end users what we think is important about messaging, and what is not. How people interact with a tool, and how they use it, defines their relationship with that tool. 

In 2.0 you will find support for instrumentation for gathering metrics and statistics about the health of your Rabbit, without significantly impacting performance. Typically people expect to see: current message rates, emerging bottlenecks, support for remedial action such as telling specific clients to throttle back when the broker is busy. [Features like these will become visible](/blog/2010/08/06/management-monitoring-and-statistics) as part of [the rabbit-management plugin](http://hg.rabbitmq.com/rabbitmq-management/) and other tools.  The foundations are now in place for their addition incrementally. 

**Tell us what else you want from management**

Please contact us with requests and ideas for more management and monitoring features. We'll be adding more to RabbitMQ's core, making it even easier to operate a large Rabbit installation 24/7, indefinitely. We'll be looking for feedback from the community to make sure it's really easy for people to integrate management and monitoring feeds into their favourite tools. 

Plus, for SpringSource customers: expect each new feature to also show up in the Hyperic plugin, enabling you to monitor and manage RabbitMQ brokers, queues and exchanges inside your complete Spring stack and thus derive immediate in context intelligence about the overall behaviour of your application.

**What else is next and how can I help?**

As much as possible, future features will appear in stages. Our release philosophy will be evolutionary, while keeping the same focus on quality as with the previous releases. We'll be working very hard on all of the following items, and more besides, so please get in touch if you want to use them or help:

1. Making Rabbit even easier to use.
2. Even better support for community plugins!
3. Elastic messaging for cloud services on [EC2 and elsewhere](http://addons.heroku.com/)
4. New styles of federation, complementing our existing [rabbitmq-shovel relay](http://hg.rabbitmq.com/rabbitmq-shovel/file/e96b29ca5cbb/README)
5. Even better HA, to cover a wider class of failover cases
We want your feedback! The best way you can help is to talk about what you want to do on [the rabbitmq-discuss mailing list](http://lists.rabbitmq.com/cgi-bin/mailman/listinfo/rabbitmq-discuss). That's also the best place for you to get help if you need it. Or, if you want to go public to the max: talk to us on Twitter where we are @rabbitmq

**Thank you**

We want to thank two groups of people for getting us to here.
First, the community. We especially wish to thank those people who tested the new persistence technology throughout this year.
Second, we want to thank our customers and everyone else who has commercially sponsored RabbitMQ over the years. Whether you bought a new feature, or took a real risk with us, your contribution is just as important to us.
