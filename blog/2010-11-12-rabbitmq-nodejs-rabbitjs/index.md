---
title: "rabbitmq + node.js = rabbit.js"
tags: ["HowTo", "Hasenwerkstatt", ]
authors: [mikeb]
---

For those who have been away from the internets, [node.js](http://nodejs.org/) is an evented JavaScript engine based on Google's V8. Because it is essentially one big, efficient event loop, it's a natural fit for programs that shuffle data backwards and forwards with little state in-between. And it's fun to program, an opinion apparently lots of people share, because there have been loads of libraries crop up around it.

Among the more impressive of these libraries is [Socket.IO](http://github.com/LearnBoost/Socket.IO).  One can combine Socket.IO with node.js's built-in web server to make a websocket server, with a socket abstraction for browsers that degrades to XHR tricks for when there's no websockets. (I would be happy to believe that node.js and Socket.IO were made for us by a benevolent and foresightful precursor race; but of course, they were made by hard-working clever people.  Thank you, people!)

Once one has a socket abstraction in the browser, a whole world opens up. Specifically, for our purposes, a whole world of messaging. Since node.js has an [AMQP client](http://github.com/ry/node-amqp), we can easily hook it up with RabbitMQ; not only to bridge to other protocols and back-end systems, but also to provide messaging *between* browsers, and between application servers, and so on.

Following on from the [work we've been doing with Martin Sustrik](http://github.com/rabbitmq/rmq-0mq) of [ZeroMQ](http://www.zeromq.com/), I decided to make a very simple protocol for using on the browser sockets, reflecting the messaging patterns used in ZeroMQ (and thereby in [RMQ-0MQ](http://github.com/rabbitmq/rmq-0mq/wiki)) -- **pub/sub**, **request/reply**, and **push/pull** (or pipeline). I wrote a node.js library that uses RabbitMQ to implement message patterns using its routing and buffering; the bridging then comes for free, since RabbitMQ has a bunch of protocol adapters and clients for various languages.

A brief explanation of the messaging patterns:

**Publish/Subscribe** is for the situation in which a published message should be delivered to multiple subscribers. In the general case, various kinds of routing can be used to filter the messages for each subscriber. This might be used to broadcast notifications from a backend system to users' browsers, for example.

**Request/Reply** is for RPC over messaging; requests are distributed round-robin among worker processes, and replies are routed back to the requesting socket. This might be used by browsers to query back-end services; or even for browsers to query each other.

**Pipeline** is for chaining together processes.  Messages are pushed to worker processes in a round-robin, which themselves may push to another stage of processing. This might be used to co-ordinate a workflow among sets of users (or indeed individuals).

Having duly dispensed with ado, here is **[rabbit.js](http://github.com/squaremo/rabbit.js)**.

All it needs is a bare-bones [RabbitMQ](/docs/install-generic-unix) and node.js installed; and, the node-amqp and Socket.IO libraries.  Instructions and the locations of these things are in the [README](http://github.com/squaremo/rabbit.js/blob/master/README.md). (Do note that you need [my fork of node-amqp](http://github.com/squaremo/node-amqp).)

It also includes a tiny message socket server; that is, a node.js server that accepts socket connections and speaks in length-prefixed messages. Since it's all going through RabbitMQ, you can talk to the browsers hooked up with Socket.IO via a socket.  You can also use the in-process pipe server from code running in node.js itself.

All in all, I am surprised how much I could get done with only a handful of lines of code and some technologies that each hit a sweet spot -- node.js for fun network server programming, Socket.IO for magical browser sockets, and RabbitMQ for the no-tears messaging.
