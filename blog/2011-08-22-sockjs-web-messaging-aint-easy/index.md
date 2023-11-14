---
title: "SockJS - web messaging ain't easy"
tags: ["Web Messaging", ]
authors: [marek]
---

The idea of 'realtime web' or messaging using web browsers has been
around for quite some time. First it was called 'long-polling', then
'Comet', the latest incarnation is named 'WebSockets'.
Without doubt it's going in a good direction, WebSockets is a neat
technology.

But during the fight for realtime capabilities we've lost focus on
what is really important  how to actually use messaging. In the web
context everything is request-response driven and marrying a typical
web stack to asynchronous messaging isn't easy.

<!-- truncate -->

## The landscape

There were many attempts to create a generic component that could join
the web stack and just deal with 'messaging' in a similar way to a
database dealing with data.

There is a problem though, the asynchronous nature of messaging and
browser cross-domain restrictions mean that in order to get 'Comet'
working, you need to use a particular web stack. A classic case of
vendor lock-in.

## The new approach

At least that's how it was in the past. You could have a web-messaging
framework, but you were pretty much tied to it.

Until, not long ago, the [Socket.io](http://socket.io/) project emerged.
It's build on [Node.js](http://nodejs.org/), which gives it a unique
position  not only everything in Node.js is already fully
asynchronous (there's almost no way to screw it up) but also it used a
common language already used in the web environment.

Early Socket.io development focused on message delivery  in other
words how to get the messages to and from web browsers. The contract
with web developers was simple: here's an asynchronous transport
layer, you build your application logic in JavaScript on top of that.

A developer needed to write a thin JavaScript layer that joined
Socket.io connections with the application  the implementation
details were left to developer. The application could be Node or using
any other stack. It could be connected using just about any method,
for example Redis, RabbitMQ or HTTP callbacks.

But recently Socket.io changed focus, it's not a simple transport any
more  it starts to be a full messaging stack, featuring:

* message acknowledgments
* broadcasts / "rooms"
* multiplexing
* volatile messages

## No silver bullet

But here's a catch: if you build messaging semantics the messaging
library starts to be a framework and quickly becomes tied to a
platform.

Think about it, even if you try to build a simple 'broadcast'
abstraction, you inevitably need to answer many nonobvious questions:

* How the application is going to be deployed?
    (Limited to one server or scaling using an underlying message bus?
     What message bus? How does it play with an HTTP load balancer?)
* Who is authorized to 'subscribe' to that broadcast data? Is it public?
    How can you set permissions?
* Who can publish messages? How can a subscriber reliably identify
    the author of the message?

Bear in mind that 'broadcast' is a very simple abstraction, in
practice everyone uses messaging differently and it's very hard to
create a generic messaging framework.
Most of the decisions made by messaging framework are in fact
application specific:

* Authorization (who can hear what and publish where)
* Understanding of data (how do you do value + updates? What is the
   diff algorithm?)
* Presence (all applications need a slightly different meaning of that)

I'm glad Socket.io development is going well and I keep my fingers
crossed for it. But in my opinion it focuses on the wrong problem: I
don't need another opinionated messaging framework which is tied to a
particular platform.

Instead, I only need a stable transport layer.

## The next steps

Socket.io showed the way - there is a room for a simple and stable
library that would solve the message-delivery problem, that would
enable WebSockets-like API's until a native implementation is widely
deployed. All that without defining the messaging model, please.

Here is my reply: [SockJS](https://github.com/sockjs/sockjs-client#readme) - a library
with WebSockets-like API that focuses only on the transport
layer. Although project is young, in my opinion it's already better
than other libraries like that.

The project is split in two parts:

* Browser JavaScript library:
   [SockJS-client](https://github.com/sockjs/sockjs-client#readme)
* Server-side component for node:
   [SockJS-node](https://github.com/sockjs/sockjs-node#readme)

If you want to see it running, here are a few live deployments hosting
QUnit tests:

* [http://sockjs.popcnt.org/](http://sockjs.popcnt.org/) (hosted in Europe)
* [http://sockjs.cloudfoundry.com/](http://sockjs.cloudfoundry.com/) (CloudFoundry, websockets disabled)
* [https://sockjs.cloudfoundry.com/](https://sockjs.cloudfoundry.com/) (CloudFoundry SSL, websockets disabled)
* [http://sockjs.herokuapp.com/](http://sockjs.herokuapp.com/) (Heroku, websockets disabled)

There main assumptions behind SockJS are:

* The API should be modeled as close to WebSocket API as possible.
* The server side part should be simple, all the complexity should be
   handled by the browser library. (With the assumption that there is
   only a single browser library and there will be many server-side
   implementations. We have a SockJS Node server and we'd like to do
   at least an Erlang one.)
* No Flash inside, only JavaScript.
* Fallback to slow and dumb polling transports, useful when the
   clients are behind corporate firewalls and proxies.
* All transports must be cross-domain - developers must be able to
   host SockJS server as a separate part of their infrastructure.
* Supports common load-balancing strategies: using sticky sessions
   based on JSESSIONID cookie or prefix-based balancing.

## The future

Solving message delivery problem is just a first step. The ultimate
goal is to create a generic messaging framework for web apps, but it's
not going to be easy. It'll take a lot of work and many failed
attempts. That's why it's so important to have a stable, well
designed, reusable transport layer handy.

(Article also available on [github pages](https://github.com/sockjs/sockjs-client/wiki/%5BArticle%5D-SockJS:-web-messaging-ain%E2%80%99t-easy))
