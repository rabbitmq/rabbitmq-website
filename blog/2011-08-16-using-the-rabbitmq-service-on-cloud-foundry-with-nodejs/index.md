---
title: "Using the RabbitMQ service on Cloud Foundry with Node.JS"
tags: ["HowTo", ]
authors: [mikeb]
---

Recently we launched a [RabbitMQ service for Cloud Foundry](http://blog.cloudfoundry.com/post/8713844574/rabbitmq-cloud-foundry-cloud-messaging-that-just-works), making it simple to spin up a message broker to use with your apps on Cloud Foundry. There are tutorials online for using it with Ruby on Rails and with Java apps using Spring. Here we are going to look at using the RabbitMQ service with Node.JS apps.

<!-- truncate -->

I'm not assuming too much prior knowledge of Node.JS, npm or RabbitMQ; but, you'll get more out of this if you're acquainted with them all. The [man page for npm](https://github.com/isaacs/npm/blob/master/doc/npm.md), and its accompanying [information for developers](https://github.com/isaacs/npm/blob/master/doc/developers.md#readme) are the best guide, barring actual use, to understanding npm. For RabbitMQ, I recommend Michael Klishin's [primer on the AMQP messaging model](http://rubydoc.info/github/ruby-amqp/amqp/master/file/docs/AMQP091ModelExplained.textile).

[This repository on github](https://github.com/rabbitmq/rabbitmq-cloudfoundry-samples/tree/master/nodejs) has the source code for our Node.JS example. Let's walk through it first the `package.json`:

```json
{
  "name":"node-srs-demo",
  "author": "Michael Bridgen",
  "version":"0.0.2",
  "dependencies":{
    "amqp":">= 0.1.0",
    "sanitizer": "*"
  }
}
```

The item of interest in there is the dependency on "amqp"; version 0.1.0 supports the URL syntax that Cloud Foundry will supply, and there's no reason not to use the latest and greatest.

Here's the first bit of application code. Note that we call the file `app.js` so Cloud Foundry will recognise it as the main module and run it.

```javascript
require.paths.unshift('./node_modules');

var http = require('http');
var amqp = require('amqp');
var URL = require('url');
var htmlEscape = require('sanitizer/sanitizer').escape;

function rabbitUrl() {
  if (process.env.VCAP_SERVICES) {
    conf = JSON.parse(process.env.VCAP_SERVICES);
    return conf['rabbitmq-2.4'][0].credentials.url;
  }
  else {
    return "amqp://localhost";
  }
}

var port = process.env.VCAP_APP_PORT || 3000;
```

First of all we're making sure Node.JS knows where our libraries are.  Using `npm install` in the working directory will install them in a subdirectory called `node_modules`, and when we push to Cloud Foundry they'll be copied across with `app.js`.

Our service connection details come as a JSON object in the environment; the procedure `rabbitUrl` parses that and extracts the URL for the RabbitMQ service. In principle we could have more than one RabbitMQ service instance bound to the application -- we're assuming here we just want the first (and probably only) such instance. That's the `[0]` bit.

```javascript
var messages = [];

function setup() {

  var exchange = conn.exchange('cf-demo', {'type': 'fanout', durable: false}, function() {

    var queue = conn.queue('', {durable: false, exclusive: true},
    function() {
      queue.subscribe(function(msg) {
        messages.push(htmlEscape(msg.body));
        if (messages.length > 10) {
          messages.shift();
        }
      });
      queue.bind(exchange.name, '');
    });
    queue.on('queueBindOk', function() { httpServer(exchange); });
  });
}
```

This is a procedure we're going to invoke later to creates all the things we need in our RabbitMQ instance.

Since everything in the client is an asynchronous operation there's a lot of callbacks. The nesting is determined by when we need the results; specifically, we need the queue in order to subscribe, and we need the queue *and* the exchange in order to bind the queue. Note the empty name given for the queue -- this indicates that the queue is to be anonymous, in other words given a randomly generated name by RabbitMQ.

We can skip right back out the scopes for the last callback (the one that starts the HTTP server) since we know everything has been done by then.

The next part of the code is where we're responding to HTTP requests:

```javascript
function httpServer(exchange) {
  var serv = http.createServer(function(req, res) {
    var url = URL.parse(req.url);
    if (req.method == 'GET' &amp;&amp; url.pathname == '/env') {
      printEnv(res);
    }
    else if (req.method == 'GET' &amp;&amp; url.pathname == '/') {
      res.statusCode = 200;
      openHtml(res);
      writeForm(res);
      writeMessages(res);
      closeHtml(res);
    }
    else if (req.method == 'POST' &amp;&amp; url.pathname == '/') {
      chunks = '';
      req.on('data', function(chunk) { chunks += chunk; });
      req.on('end', function() {
        msg = unescapeFormData(chunks.split('=')[1]);
        exchange.publish('', {body: msg});
        res.statusCode = 303;
        res.setHeader('Location', '/');
        res.end();
      });
    }
    else {
      res.statusCode = 404;
      res.end("This is not the page you were looking for.");
    }
  });
  serv.listen(port);
}
```

The RabbitMQ bit is right in the middle, where we publish a message to our exchange from earlier. The Node.JS AMQP library will happily publish an object, serialising it as a JSON value; the subscribe method we used earlier assumes a JSON payload and parses it to an object.

The rest of app.js is just helpers, except for the line that kicks the whole thing off (so far we've only written callbacks!):

```javascript
var conn = amqp.createConnection({url: rabbitUrl()});
conn.on('ready', setup);
```

You can see the overall control flow is simply

1. Open a connection to RabbitMQ; when that's done,
1. Construct an exchange and a queue, bind the queue to the exchange and subscribe to the queue; then
1. Start the HTTP listener.

With this code, I have erred on the side of spelling things out. There is of course plenty of room for abstraction, for example in the exchange-queue-bind-subscribe pattern which I'd expect to recur often in apps.

For help with RabbitMQ on Cloud Foundry, join in the forum at [support.cloudfoundry.com](http://support.cloudfoundry.com/forums/373011-community-q-a).
