---
title: "RabbitMQ/0MQ bridge"
tags: ["New Features", "Hasenwerkstatt", ]
authors: [sustrik]
---

Recently, Michael Bridgen and I implemented a bridge to connect the RabbitMQ broker with applications using [0MQ](http://www.zeromq.com/) for messaging.

Here it is: [http://github.com/rabbitmq/rmq-0mq](http://github.com/rabbitmq/rmq-0mq)

So: What kind of benefit the users can get by using both products in parallel?

<!-- truncate -->

In short, there are two different points of view involved here. RabbitMQ users will experience different benefits than users of 0MQ. Those already using both will simply get an easy way to interconnect the two technologies.

This is RabbitMQ blog so let's start with Rabbit-focused point of view.

First and most obviously, using 0MQ as a client for RabbitMQ broker makes sense on the platforms where there's no AMQP client available. Ever fancied speaking to RabbitMQ broker from Lisp? Or -- say -- from Cobol? The bridge may come handy here.

The same applies to OS/HW platforms. Do you need to speak to the broker from a device heavily constrained on memory, with very slow CPU or limited battery life? 0MQ client is pretty concise and very fast, which means that you'll get reasonable performance even on slow chips. Effectiveness also translates to lower power consumption, which in turn makes the battery last longer. The r0mq bridge itself is collocated with the RabbitMQ broker requiring no additional resources on the client.

Another usage of the bridge is much more sophisticated. If you are using RabbitMQ in very simple scenarios you may not even appreciate it. If you are managing a big geographically distributed system, it may become a lifesaver. The bridge can be used to interconnect RabbitMQ brokers into loose federation. Just edit the configuration files for the two brokers and everything will just work. You won't have to care about order of starting up the brokers, managing the reconnections after network disruptions etc. A nice feature is that these federations are truly distributed. There's no need for central governance of the federation. Simply connect your broker to a broker in a different company. That one in turn connects to brokers in yet different companies etc. Ultimately you end up with loose world-wide federation maintained in collaborative fashion by all the participants.

Yet one more advantage you may take advantage of is efficient usage of network resources. Unlike AMQP, 0MQ allows you to split your messaging traffic into logically separate flows. You pass your entertainment video in a separate flow from commands used to keep the aircraft flying. This not only means that you'll never experience head-of-line blocking problems, but also that network-level QoS can be set separately for the entertainment channel and for the steering system. Also, network engineers will appreciate that you can monitor the network traffic flow-by-flow rather than having a big opaque chunk of bandwidth used by "messaging".

Finally, 0MQ is bundled with OpenPGM library which implements a reliable mutlicast protocol called PGM. The r0mq bridge thus allows to multicast messages from RabbitMQ broker to the clients (0MQ clients to
be precise -- AMQP has no multicast support). This kind of functionality is extremely useful in scenarios where a lot of identical data is passed to many boxes on the LAN. If a separate copy of each datum is sent to each subscriber, you can easily exceed capacity of your network. With multicast, data is sent once only to all the subscribers thus keeping the bandwidth usage constant even when the number of subscribers grows.

When you looking at r0mq bridge from the other side, you are probably developing at a low level using 0MQ as your network transport.

Using RabbitMQ broker has some obvious uses. The most trivial of them is to use the broker as a bridge to connect 0MQ applications to AMQP, STOMP or XMPP applications.

However, the real use case is to use RabbitMQ as a "device" in 0MQ network. 0MQ comes with few simple precompiled devices. Some hardware can be used as 0MQ device (say IP switch in case of multicast
transport). There've been some attempts to create more sophisticated devices but these are in very early stages of development. So, what 0MQ developers are missing is a full-blown, sophisticated and
production-ready device.

RabbitMQ broker can serve as such a device. First of all, it has been deployed widely and thus it is stable enough to be used in production environment safely. As for the feature set, it offers much more than anything found in 0MQ world. The two most useful features are persistence and monitoring.

Persistence means that the messages passing through the broker are saved on the disk. When you shut down the broker, if the box crashes because of power outage or a different technical problem, the messages are still available on the disk. When the broker is restarted they will be sent further as if the crash hasn't happened. It is similar to how email works.

Monitoring is asked for maybe even more often than persistence. Once you have a non-trivial system you want to know what each node is doing: How many messages there are stored for a particular feed What's the current throughput? And so on. RabbitMQ can tell you these things through its [command-line tools](/docs/man/rabbitmqctl.8) or through the [management plugin](/docs/management).

As a conclusion I would like to stress that bridging 0MQ and RabbitMQ is not just that dumb kind of bridge you get when you bridge two incompatible but more or less equivalent products. RabbitMQ and 0MQ are focusing on different aspects of messaging. 0MQ puts much more focus on how the messages are transferred over the wire. RabbitMQ, on the other hand, focuses on how messages are stored, filtered and monitored. By combining the two technologies you can get the best from both worlds.

Enjoy!
