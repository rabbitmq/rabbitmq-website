<!--
Copyright (C) 2007-2015 Pivotal Software, Inc. 

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License, 
Version 2.0 (the "License”); you may not use this file except in compliance 
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
# RabbitMQ tutorial - Remote procedure call (RPC) SUPPRESS-RHS

## Remote procedure call (RPC)
### (using the amqp.node client)

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>


In the [second tutorial](tutorial-two-javascript.html) we learned how to
use _Work Queues_ to distribute time-consuming tasks among multiple
workers.

But what if we need to run a function on a remote computer and wait for
the result?  Well, that's a different story. This pattern is commonly
known as _Remote Procedure Call_ or _RPC_.

In this tutorial we're going to use RabbitMQ to build an RPC system: a
client and a scalable RPC server. As we don't have any time-consuming
tasks that are worth distributing, we're going to create a dummy RPC
service that returns Fibonacci numbers.

### Callback queue

In general doing RPC over RabbitMQ is easy. A client sends a request
message and a server replies with a response message. In order to
receive a response we need to send a 'callback' queue address with the
request. We can use the default queue.
Let's try it:

    :::javascript
    ch.assertQueue('', {exclusive: true});

    ch.sendToQueue('rpc_queue',new Buffer('10'), { replyTo: queue_name });

    # ... then code to read a response message from the callback queue ...


> #### Message properties
>
> The AMQP protocol predefines a set of 14 properties that go with
> a message. Most of the properties are rarely used, with the exception of
> the following:
>
> * `persistent`: Marks a message as persistent (with a value of `true`)
>    or transient (`false`). You may remember this property
>    from [the second tutorial](tutorial-two-javascript.html).
> * `content_type`: Used to describe the mime-type of the encoding.
>    For example for the often used JSON encoding it is a good practice
>    to set this property to: `application/json`.
> * `reply_to`: Commonly used to name a callback queue.
> * `correlation_id`: Useful to correlate RPC responses with requests.

### Correlation Id

In the method presented above we suggest creating a callback queue for
every RPC request. That's pretty inefficient, but fortunately there is
a better way - let's create a single callback queue per client.

That raises a new issue, having received a response in that queue it's
not clear to which request the response belongs. That's when the
`correlation_id` property is used. We're going to set it to a unique
value for every request. Later, when we receive a message in the
callback queue we'll look at this property, and based on that we'll be
able to match a response with a request. If we see an unknown
`correlation_id` value, we may safely discard the message - it
doesn't belong to our requests.

You may ask, why should we ignore unknown messages in the callback
queue, rather than failing with an error? It's due to a possibility of
a race condition on the server side. Although unlikely, it is possible
that the RPC server will die just after sending us the answer, but
before sending an acknowledgment message for the request. If that
happens, the restarted RPC server will process the request again.
That's why on the client we must handle the duplicate responses
gracefully, and the RPC should ideally be idempotent.

### Summary

<div class="diagram">
  <img src="/img/tutorials/python-six.png" height="200" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      subgraph cluster_C {
        label="Client";
	color=transparent;
        C [label="C", fillcolor="#00ffff"];
      };
      subgraph cluster_XXXa {
	color=transparent;
      subgraph cluster_Note {
	color=transparent;
        N [label="Request\nreplyTo=amqp.gen-Xa2...\ncorrelationId=abc",
	   fontsize=12,
	   shape=note];
      };
      subgraph cluster_Reply {
	color=transparent;
        R [label="Reply\ncorrelationId=abc",
	   fontsize=12,
	   shape=note];
      };
      };
      subgraph cluster_XXXb {
	color=transparent;
      subgraph cluster_RPC {
        label="rpc_queue";
	color=transparent;
        RPC [label="{&lt;s&gt;||||&lt;e&gt;}", fillcolor="red", shape="record"];
      };
      subgraph cluster_REPLY {
        label="replyTo=amq.gen-Xa2...";
	color=transparent;
        REPLY [label="{&lt;s&gt;||||&lt;e&gt;}", fillcolor="red", shape="record"];
      };
      };
      subgraph cluster_W {
        label="Server";
	color=transparent;
        W [label="S", fillcolor="#00ffff"];
      };
      //
      C -&gt; N;
      N -&gt; RPC:s;
      RPC:e -&gt; W;
      W -&gt; REPLY:e;
      REPLY:s -&gt; R;
      R -&gt; C;
    }
  </div>
</div>

Our RPC will work like this:

  * When the Client starts up, it creates an anonymous exclusive
    callback queue.
  * For an RPC request, the Client sends a message with two properties:
    `reply_to`, which is set to the callback queue and `correlation_id`,
    which is set to a unique value for every request.
  * The request is sent to an `rpc_queue` queue.
  * The RPC worker (aka: server) is waiting for requests on that queue.
    When a request appears, it does the job and sends a message with the
    result back to the Client, using the queue from the `reply_to` field.
  * The client waits for data on the callback queue. When a message
    appears, it checks the `correlation_id` property. If it matches
    the value from the request it returns the response to the
    application.

Putting it all together
-----------------------

The Fibonacci function:

    :::javascript
    function fibonacci(n) {
      if (n == 0 || n == 1)
        return n;
      else
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

We declare our fibonacci function. It assumes only valid positive integer input.
(Don't expect this one to work for big numbers,
and it's probably the slowest recursive implementation possible).


The code for our RPC server [rpc_server.js](https://github.com/rabbitmq/rabbitmq-tutorials/blob/rabbitmq-tutorials-62/javascript-nodejs/src/rpc_server.js) looks like this:

    :::javascript
    #!/usr/bin/env node

    var amqp = require('amqplib/callback_api');

    amqp.connect('amqp://localhost', function(err, conn) {
      conn.createChannel(function(err, ch) {
        var q = 'rpc_queue';

        ch.assertQueue(q, {durable: false});
        ch.prefetch(1);
        console.log(' [x] Awaiting RPC requests');
        ch.consume(q, function reply(msg) {
          var n = parseInt(msg.content.toString());

          console.log(" [.] fib(%d)", n);

          var r = fibonacci(n);

          ch.sendToQueue(msg.properties.replyTo,
            new Buffer(r.toString()),
            {correlationId: msg.properties.correlationId});

          ch.ack(msg);
        });
      });
    });

    function fibonacci(n) {
      if (n == 0 || n == 1)
        return n;
      else
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

The server code is rather straightforward:

  * As usual we start by establishing the connection, channel and declaring
    the queue.
  * We might want to run more than one server process. In order
    to spread the load equally over multiple servers we need to set the
    `prefetch` setting on channel.
  * We use `Channel.consume` to consume messages from the queue. Then we enter the
    callback function where do the work and send the response back.


The code for our RPC client [rpc_client.js](https://github.com/rabbitmq/rabbitmq-tutorials/blob/rabbitmq-tutorials-62/javascript-nodejs/src/rpc_client.js):

    :::javascript
    #!/usr/bin/env node

    var amqp = require('amqplib/callback_api');

    var args = process.argv.slice(2);

    if (args.length == 0) {
      console.log("Usage: rpc_client.js num");
      process.exit(1);
    }
    
    amqp.connect('amqp://localhost', function(err, conn) {
      conn.createChannel(function(err, ch) {
        ch.assertQueue('', {exclusive: true}, function(err, q) {
          var corr = generateUuid();
          var num = parseInt(args[0]);
          
          console.log(' [x] Requesting fib(%d)', num);
          
          ch.consume(q.queue, function(msg) {
            if (msg.properties.correlationId == corr) {
              console.log(' [.] Got %s', msg.content.toString());
              setTimeout(function() { conn.close(); process.exit(0) }, 500);
            }
          }, {noAck: true});
          
          ch.sendToQueue('rpc_queue',
          new Buffer(num.toString()),
          { correlationId: corr, replyTo: q.queue });
        });
      });
    });
    
    function generateUuid() {
      return Math.random().toString() +
             Math.random().toString() +
             Math.random().toString();
    }

Now is a good time to take a look at our full example source code for
[rpc_client.js](https://github.com/rabbitmq/rabbitmq-tutorials/blob/rabbitmq-tutorials-62/javascript-nodejs/src/rpc_client.js) and [rpc_server.js](https://github.com/rabbitmq/rabbitmq-tutorials/blob/rabbitmq-tutorials-62/javascript-nodejs/src/rpc_server.js).


Our RPC service is now ready. We can start the server:

    :::bash
    $ ./rpc_server.js
     [x] Awaiting RPC requests

To request a fibonacci number run the client:

    :::bash
    $ ./rpc_client.js 30
     [x] Requesting fib(30)

The design presented here is not the only possible implementation of a RPC
service, but it has some important advantages:

 * If the RPC server is too slow, you can scale up by just running
   another one. Try running a second `rpc_server.js` in a new console.
 * On the client side, the RPC requires sending and receiving only one message. 
   As a result the RPC client needs only one network round trip for a single RPC request.

Our code is still pretty simplistic and doesn't try to solve more
complex (but important) problems, like:

 * How should the client react if there are no servers running?
 * Should a client have some kind of timeout for the RPC?
 * If the server malfunctions and raises an exception, should it be
   forwarded to the client?
 * Protecting against invalid incoming messages
   (eg checking bounds, type) before processing.

>
>If you want to experiment, you may find the [rabbitmq-management plugin](/plugins.html) useful for viewing the queues.
>

