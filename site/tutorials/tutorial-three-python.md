<!--
Copyright (c) 2007-2016 Pivotal Software, Inc.

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
# RabbitMQ tutorial - Publish/Subscribe SUPPRESS-RHS

## Publish/Subscribe
### (using the pika 0.10.0 Python client)

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

In the [previous tutorial](tutorial-two-python.html) we created a work
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
  <img src="/img/tutorials/exchanges.png" height="110" />
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
an exchange of that type, and call it `logs`:

    :::python
    channel.exchange_declare(exchange='logs',
                             type='fanout')

The fanout exchange is very simple. As you can probably guess from the
name, it just broadcasts all the messages it receives to all the
queues it knows. And that's exactly what we need for our logger.


> #### Listing exchanges
>
> To list the exchanges on the server you can run the ever useful `rabbitmqctl`:
>
>     :::bash
>     $ sudo rabbitmqctl list_exchanges
>     Listing exchanges ...
>     logs      fanout
>     amq.direct      direct
>     amq.topic       topic
>     amq.fanout      fanout
>     amq.headers     headers
>     ...done.
>
> In this list there are some `amq.*` exchanges and the default (unnamed)
> exchange. These are created by default, but it is unlikely you'll need to
> use them at the moment.


> #### Nameless exchange
>
> In previous parts of the tutorial we knew nothing about exchanges,
> but still were able to send messages to queues. That was possible
> because we were using a default exchange, which we identify by the empty string (`""`).
>
> Recall how we published a message before:
>
>     :::python
>     channel.basic_publish(exchange='',
>                           routing_key='hello',
>                           body=message)
>
> The `exchange` parameter is the name of the exchange.
> The empty string denotes the default or _nameless_ exchange: messages are
> routed to the queue with the name specified by `routing_key`, if it exists.

Now, we can publish to our named exchange instead:

    :::python
    channel.basic_publish(exchange='logs',
                          routing_key='',
                          body=message)

Temporary queues
----------------

As you may remember previously we were using queues which had a
specified name (remember `hello` and `task_queue`?). Being able to name
a queue was crucial for us -- we needed to point the workers to the
same queue.  Giving a queue a name is important when you
want to share the queue between producers and consumers.

But that's not the case for our logger. We want to hear about all
log messages, not just a subset of them. We're
also interested only in currently flowing messages not in the old
ones. To solve that we need two things.

Firstly, whenever we connect to Rabbit we need a fresh, empty queue. To
do it we could create a queue with a random name, or, even better -
let the server choose a random queue name for us. We can do this by not
supplying the `queue` parameter to `queue_declare`:

    :::python
    result = channel.queue_declare()

At this point `result.method.queue` contains a random queue name. For example
it may look like `amq.gen-JzTY20BRgKO-HjmUJj0wLg`.

Secondly, once we disconnect the consumer the queue should be
deleted. There's an `exclusive` flag for that:

    :::python
    result = channel.queue_declare(exclusive=True)


Bindings
--------

<div class="diagram">
  <img src="/img/tutorials/bindings.png" height="90" />
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

    :::python
    channel.queue_bind(exchange='logs',
                       queue=result.method.queue)

From now on the `logs` exchange will append messages to our queue.

> #### Listing bindings
>
> You can list existing bindings using, you guessed it,
> `rabbitmqctl list_bindings`.


Putting it all together
-----------------------

<div class="diagram">
  <img src="/img/tutorials/python-three-overall.png" height="160" />
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
nameless one. We need to supply a `routing_key` when sending, but its
value is ignored for `fanout` exchanges. Here goes the code for
`emit_log.py` script:

    #!/usr/bin/env python
    import pika
    import sys

    connection = pika.BlockingConnection(pika.ConnectionParameters(
            host='localhost'))
    channel = connection.channel()

    channel.exchange_declare(exchange='logs',
                             type='fanout')

    message = ' '.join(sys.argv[1:]) or "info: Hello World!"
    channel.basic_publish(exchange='logs',
                          routing_key='',
                          body=message)
    print(" [x] Sent %r" % message)
    connection.close()

[(emit_log.py source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/python/emit_log.py)

As you see, after establishing the connection we declared the
exchange. This step is necessary as publishing to a non-existing
exchange is forbidden.

The messages will be lost if no queue is bound to the exchange yet,
but that's okay for us; if no consumer is listening yet we can safely discard the message.

The code for `receive_logs.py`:

    #!/usr/bin/env python
    import pika

    connection = pika.BlockingConnection(pika.ConnectionParameters(
            host='localhost'))
    channel = connection.channel()

    channel.exchange_declare(exchange='logs',
                             type='fanout')

    result = channel.queue_declare(exclusive=True)
    queue_name = result.method.queue

    channel.queue_bind(exchange='logs',
                       queue=queue_name)

    print(' [*] Waiting for logs. To exit press CTRL+C')

    def callback(ch, method, properties, body):
        print(" [x] %r" % body)

    channel.basic_consume(callback,
                          queue=queue_name,
                          no_ack=True)

    channel.start_consuming()

[(receive_logs.py source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/python/receive_logs.py)


We're done. If you want to save logs to a file, just open a console and type:

    :::bash
    $ python receive_logs.py > logs_from_rabbit.log

If you wish to see the logs on your screen, spawn a new terminal and run:

    :::bash
    $ python receive_logs.py

And of course, to emit logs type:

    :::bash
    $ python emit_log.py


Using `rabbitmqctl list_bindings` you can verify that the code actually
creates bindings and queues as we want. With two `receive_logs.py`
programs running you should see something like:

    :::bash
    $ sudo rabbitmqctl list_bindings
    Listing bindings ...
    logs    exchange        amq.gen-JzTY20BRgKO-HjmUJj0wLg  queue           []
    logs    exchange        amq.gen-vso0PVvyiRIL2WoV3i48Yg  queue           []
    ...done.

The interpretation of the result is straightforward: data from
exchange `logs` goes to two queues with server-assigned names. And
that's exactly what we intended.

To find out how to listen for a subset of messages, let's move on to
[tutorial 4](tutorial-four-python.html)
