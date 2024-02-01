---
title: "How to compose apps using WebSockets"
tags: ["Web Messaging", ]
authors: [marek]
---

*Or: How to properly do multiplexing on WebSockets or on SockJS*

![](HTML5_Logo_256.png)

As you may know, WebSockets are a cool new HTML5 technology which
allows you to asynchronously send and receive messages. Our
compatibility layer - [SockJS](http://sockjs.org) - emulates it and
will work even on old browsers or behind proxies.
WebSockets conceptually are very simple. The API is basically:
connect, send and receive. But what if your web-app has many modules
and every one wants to be able to send and receive data?

<!-- truncate -->

In theory you could open multiple WebSocket connections, one for every
module. Although suboptimal (due to the need to handle multiple TCP/IP
connections), this approach will work for native WebSockets. But,
unfortunately it won't for SockJS due to a technical limitation of
HTTP: for some fallbacks transports it is not possible to open more
than one connection at a time to a single server.
This problem is real and worth solving. Let me rephrase it:

> Assuming you can have only a single connection to a given host, and multiple modules wanting to send and receive data, what do you do?

You need [multiplexing](http://en.wikipedia.org/wiki/Multiplexing):
combining data from multiple sources into a single connection. The
next question is what API do you use; how do you expose multiplexing
in the code?

## The Socket.io way

Socket.io has an API that attempts to solve this problem, it calls
this 'namespaces'. Here's some example client (browser) code:

```javascript
var chat = io.connect('http://localhost/chat');
chat.on('connect', function () {
  chat.emit('hi!');
});

var news = io.connect('http://localhost/news');
news.on('news', function () {
  news.emit('woot');
});
```

I think this API is quite confusing - under the hood Socket.io is
opening only a single connection, but reading the code gives us a
different story.

## The SockJS way

As opposed to Socket.io, SockJS doesn't have any magical API. It looks
like a WebSocket object, it behaves like one. Nothing surprising.

So how to solve the multiplexing problem?

It's usually a good idea to avoid inventing new APIs if possible, by
using already established ones. Why not present each multiplexed
channel as a WebSocket object?

What I'm suggesting is quite simple - you take a real SockJS (or
WebSocket) connection, wrap it in a multiplexing layer, and extract
any number of fake WebSocket objects out of it. They will be
multiplexed internally, but from a module point of view - it will be
completely transparent. The module speaks to a WebSocket object as far as
it is concerned.

That's it. It's a bit like a magician's hat. You put one WebSocket
connection in, you can take any number of fake WebSocket connections
out.

This approach is better than what Socket.io proposes - you can create
code that just relies on a native WebSocket API. Later on, when the
need arises, you can just pass a fake WebSocket object instead of real
one. In other words: it composes. Problem solved.

## Implementation

If previously in the browser you were using a single SockJS
connection, like this:

```javascript
var sockjs = new SockJS('/echo');
```

You can modify the client code to:

```javascript
var real_sockjs = new SockJS('/echo');

var multiplexer = new WebSocketMultiplex(real_sockjs);
var fake_sockjs_1 = multiplexer.channel('ann');
var fake_sockjs_2 = multiplexer.channel('bob');
```

At this point 'fake' objects will behave identically to a normal
SockJS object. You can expect to hear 'open', 'message' and 'close'
events.
(The underlying code is
[about 60 lines of javascript](https://github.com/sockjs/websocket-multiplex/blob/master/multiplex_client.js))
Similarly the server side - it normally uses the usual "net.Server" and
"Stream" node APIs:

```javascript
var service = sockjs.createServer();
```

After a change:

```javascript
var real_service = sockjs.createServer();

var multiplexer = new multiplex_server.MultiplexServer(real_service);
var fake_service_1 = multiplexer.registerChannel('ann');
var fake_service_2 = multiplexer.registerChannel('bob');
```

Again 'fake' objects will do the usual thing, they will emit a
'connected' event when a user subscribed to this particular channel
arrives.
(The underlying multiplexer code
[is not very complex either](https://github.com/sockjs/websocket-multiplex/blob/master/multiplex_server.js))

If you want to see the multiplexer code in action:

* [Server snippet](https://github.com/sockjs/websocket-multiplex/blob/master/examples/sockjs/server.js#L13-36)
* [Client snippet](https://github.com/sockjs/websocket-multiplex/blob/master/examples/sockjs/index.html#L85-92)
* Live code: [http://sockjs-multiplex.cloudfoundry.com/](http://sockjs-multiplex.cloudfoundry.com/)

## Final thoughts

It's worth emphasising that this approach really does compose. Any module
can take a fake WebSocket object and repeat the trick to get more
second-layer fake WebSockets objects.
Instead of inventing new API's, just create code that relies on a
WebSocket instance passed to the constructor. That'll all you really
need to create composable code using WebSockets!
