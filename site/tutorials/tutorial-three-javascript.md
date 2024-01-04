<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
# RabbitMQ tutorial - Publish/Subscribe SUPPRESS-RHS

## Publish/Subscribe
### (using the amqp.node client)

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

In the [previous tutorial](tutorial-two-javascript.html) we created a work
queue. The assumption behind a work queue is that each task is
delivered to exactly one worker. In this part we'll do something
completely different -- we'll deliver a message to multiple
consumers. This pattern is known as "publish/subscribe".

To illustrate the pattern, we're going to build a simple logging
system. It will consist of two programs -- the first will emit log
messages and the second will receive and print them.

In our logging system every running copy of the receiver program will
get the messages. That way we'll be able to run one receiver and
direct the logs to disk; and at the same time we'll be able to run
another receiver and see the logs on the screen.

Essentially, published log messages are going to be broadcast to all
the receivers.

Exchanges
---------

In previous parts of the tutorial we sent and received messages to and
from a queue. Now it's time to introduce the full messaging model in
Rabbit.

Let's quickly go over what we covered in the previous tutorials:

 * A _producer_ is a user application that sends messages.
 * A _queue_ is a buffer that stores messages.
 * A _consumer_ is a user application that receives messages.

The core idea in the messaging model in RabbitMQ is that the producer
never sends any messages directly to a queue. Actually, quite often
the producer doesn't even know if a message will be delivered to any
queue at all.

Instead, the producer can only send messages to an _exchange_. An
exchange is a very simple thing. On one side it receives messages from
producers and the other side it pushes them to queues. The exchange
must know exactly what to do with a message it receives. Should it be
appended to a particular queue? Should it be appended to many queues?
Or should it get discarded. The rules for that are defined by the
_exchange type_.

<div class="diagram">
  <img src="../img/tutorials/exchanges.png" height="110" alt="An exchange: The producer can only send messages to an exchange. One side of the exchange receives messages from producers and the other side pushes them to queues."/>
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      X [label="X", fillcolor="#3333CC"];
      Q1 [label="{||||}", fillcolor="red", shape="record"];
      Q2 [label="{||||}", fillcolor="red", shape="record"];
      //
      P1 -&gt; X;
      X -&gt; Q1;
      X -&gt; Q2;
    }
  </div>
</div>

There are a few exchange types available: `direct`, `topic`, `headers`
and `fanout`. We'll focus on the last one -- the fanout. Let's create
an exchange of this type, and call it `logs`:

<pre class="lang-javascript">
ch.assertExchange('logs', 'fanout', {durable: false})
</pre>

The fanout exchange is very simple. As you can probably guess from the
name, it just broadcasts all the messages it receives to all the
queues it knows. And that's exactly what we need for our logger.


> #### Listing exchanges
>
> To list the exchanges on the server you can run the ever useful `rabbitmqctl`:
>
> <pre class="lang-bash">
> sudo rabbitmqctl list_exchanges
> </pre>
>
> In this list there will be some `amq.*` exchanges and the default (unnamed)
> exchange. These are created by default, but it is unlikely you'll need to
> use them at the moment.


> #### The default exchange
>
> In previous parts of the tutorial we knew nothing about exchanges,
> but still were able to send messages to queues. That was possible
> because we were using a default exchange, which is identified by the empty string (`""`).
>
> Recall how we published a message before:
>
> <pre class="lang-javascript">
> channel.sendToQueue('hello', Buffer.from('Hello World!'));
> </pre>
>
> Here we use the default or _nameless_ exchange: messages are
> routed to the queue with the name specified as first parameter, if it exists.

Now, we can publish to our named exchange instead:

<pre class="lang-javascript">
channel.publish('logs', '', Buffer.from('Hello World!'));
</pre>

The empty string as second parameter means that we don't want to send
the message to any specific queue. We want only to publish it to our
'logs' exchange.

Temporary queues
----------------

As you may remember previously we were using queues that had
specific names (remember `hello` and `task_queue`?). Being able to name
a queue was crucial for us -- we needed to point the workers to the
same queue.  Giving a queue a name is important when you
want to share the queue between producers and consumers.

But that's not the case for our logger. We want to hear about all
log messages, not just a subset of them. We're
also interested only in currently flowing messages not in the old
ones. To solve that we need two things.

Firstly, whenever we connect to Rabbit we need a fresh, empty queue.
To do this we could create a queue with a random name, or,
even better - let the server choose a random queue name for us.

Secondly, once we disconnect the consumer the queue should be
automatically deleted.

In the [amqp.node](http://www.squaremobius.net/amqp.node/) client, when we supply queue name
as an empty string, we create a non-durable queue with a generated name:

<pre class="lang-javascript">
channel.assertQueue('', {
  exclusive: true
});
</pre>

When the method returns, the queue instance contains a random queue name
generated by RabbitMQ. For example it may look like `amq.gen-JzTY20BRgKO-HjmUJj0wLg`.

When the connection that declared it closes, the queue will be deleted
because it is declared as exclusive. You can learn more about the `exclusive` flag and other queue
properties in the [guide on queues](../queues.html).


Bindings
--------

<div class="diagram">
  <img src="../img/tutorials/bindings.png" height="90" alt="The exchange sends messages to a queue. The relationship between the exchange and a queue is called a binding."/>
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      X [label="X", fillcolor="#3333CC"];
      Q1 [label="{||||}", fillcolor="red", shape="record"];
      Q2 [label="{||||}", fillcolor="red", shape="record"];
      //
      P1 -&gt; X;
      X -&gt; Q1 [label="binding"];
      X -&gt; Q2 [label="binding"];
    }
  </div>
</div>


We've already created a fanout exchange and a queue. Now we need to
tell the exchange to send messages to our queue. That relationship
between exchange and a queue is called a _binding_.

<pre class="lang-javascript">
channel.bindQueue(queue_name, 'logs', '');
</pre>

From now on the `logs` exchange will append messages to our queue.

> #### Listing bindings
>
> You can list existing bindings using, you guessed it,
> <pre class="lang-bash">
> rabbitmqctl list_bindings
> </pre>


Putting it all together
-----------------------

<div class="diagram">
  <img src="../img/tutorials/python-three-overall.png" height="160" alt="Producer -> Queue -> Consuming: deliver a message to multiple consumers."/>
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P [label="P", fillcolor="#00ffff"];
      X [label="X", fillcolor="#3333CC"];
      subgraph cluster_Q1 {
        label="amq.gen-RQ6...";
	color=transparent;
        Q1 [label="{||||}", fillcolor="red", shape="record"];
      };
      subgraph cluster_Q2 {
        label="amq.gen-As8...";
	color=transparent;
        Q2 [label="{||||}", fillcolor="red", shape="record"];
      };
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P -&gt; X;
      X -&gt; Q1;
      X -&gt; Q2;
      Q1 -&gt; C1;
      Q2 -&gt; C2;
    }
  </div>
</div>

The producer program, which emits log messages, doesn't look much
different from the previous tutorial. The most important change is that
we now want to publish messages to our `logs` exchange instead of the
nameless one. We need to supply a routing key when sending, but its
value is ignored for `fanout` exchanges. Here goes the code for
`emit_log.js` script:

<pre class="lang-javascript">
#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'logs';
    var msg = process.argv.slice(2).join(' ') || 'Hello World!';

    channel.assertExchange(exchange, 'fanout', {
      durable: false
    });
    channel.publish(exchange, '', Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });

  setTimeout(function() {
    connection.close();
    process.exit(0);
  }, 500);
});
</pre>

[(emit_log.js source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs/src/emit_log.js)

As you see, after establishing the connection we declared the
exchange. This step is necessary as publishing to a non-existing
exchange is forbidden.

The messages will be lost if no queue is bound to the exchange yet,
but that's okay for us; if no consumer is listening yet we can safely discard the message.

The code for `receive_logs.js`:

<pre class="lang-javascript">
#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'logs';

    channel.assertExchange(exchange, 'fanout', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      channel.bindQueue(q.queue, exchange, '');

      channel.consume(q.queue, function(msg) {
      	if(msg.content) {
	        console.log(" [x] %s", msg.content.toString());
	      }
      }, {
        noAck: true
      });
    });
  });
});
</pre>

[(receive_logs.js source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs/src/receive_logs.js)


If you want to save logs to a file, just open a console and type:

<pre class="lang-bash">
./receive_logs.js > logs_from_rabbit.log
</pre>

If you wish to see the logs on your screen, spawn a new terminal and run:

<pre class="lang-bash">
./receive_logs.js
</pre>

And of course, to emit logs type:

<pre class="lang-bash">
./emit_log.js
</pre>

Using `rabbitmqctl list_bindings` you can verify that the code actually
creates bindings and queues as we want. With two `receive_logs.js`
programs running you should see something like:

<pre class="lang-bash">
sudo rabbitmqctl list_bindings
# => Listing bindings ...
# => logs    exchange        amq.gen-JzTY20BRgKO-HjmUJj0wLg  queue           []
# => logs    exchange        amq.gen-vso0PVvyiRIL2WoV3i48Yg  queue           []
# => ...done.
</pre>

The interpretation of the result is straightforward: data from
exchange `logs` goes to two queues with server-assigned names. And
that's exactly what we intended.

To find out how to listen for a subset of messages, let's move on to
[tutorial 4](tutorial-four-javascript.html)

