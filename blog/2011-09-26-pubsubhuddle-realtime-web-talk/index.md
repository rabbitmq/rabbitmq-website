---
title: "PubSubHuddle 'Realtime Web' talk"
tags: ["Web Messaging", "Talks and Conferences", ]
authors: [marek]
---

I was asked to do a short presentation during the
[PubSubHuddle meetup](http://www.pubsubhuddle.com/). The talk was
about current development of WebSockets, its issues and building web
applications using them.

![](huddle4.png)

<!-- truncate -->

In the presentation I present the evolution of simple shared-nothing architecture and I
try to explain why, in order to use web messaging, the website
architecture should be truly asynchronous on every stage.
All that is an attempt to express a rationale for the
[SockJS project](https://github.com/sockjs/sockjs-client).  Actually,
the full story behind SockJS is much deeper, but probably nobody cares
about every detail, I am guessing.
The presentation is available here:

* [PubSubHuddle - Realtime Web PDF](https://github.com/sockjs/sockjs-client/wiki/pubsubhuddle-realtime-web.pdf) (5MiB) [(Scribd)](http://www.scribd.com/doc/66379391) 

The slides are rather terse, in order to understand them you may
want to listen to the talk:

* [Skills Matter recording](http://skillsmatter.com/podcast/nosql/marek-majkowski-talk)

For more details about the reasons behind SockJS, read on:

* [Web messaging ain't easy](https://github.com/sockjs/sockjs-client/wiki/%5BArticle%5D-SockJS:-web-messaging-ain%E2%80%99t-easy)
* [WebSocket emulation](https://github.com/sockjs/sockjs-client/wiki/%5BArticle%5D-SockJS:-WebSocket-emulation-done-right)
