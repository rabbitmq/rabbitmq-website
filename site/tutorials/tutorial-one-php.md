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
# RabbitMQ tutorial - "Hello World!" SUPPRESS-RHS

## Introduction

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

RabbitMQ is a message broker. In essence, it accepts messages from
_producers_, and delivers them to _consumers_. In-between, it can
route, buffer, and persist the messages according to rules you give
it.

RabbitMQ, and messaging in general, uses some jargon.

 * _Producing_ means nothing more than sending. A program that sends messages
   is a _producer_. We'll draw it like that, with "P":
   <div class="diagram">
     <img src="/img/tutorials/producer.png" height="50" />
     <div class="diagram_source">
     digraph {
       bgcolor=transparent;
       truecolor=true;
       rankdir=LR;
       node [style="filled"];
       //
       P1 [label="P", fillcolor="#00ffff"];
     }
     </div>
   </div>

 * _A queue_ is the name for a mailbox. It lives inside
   RabbitMQ. Although messages flow through RabbitMQ and your
   applications, they can be stored only inside a _queue_. A _queue_
   is not bound by any limits, it can store as many messages as you
   like - it's essentially an infinite buffer. Many _producers_ can send
   messages that go to one queue - many _consumers_ can try to
   receive data from one _queue_. A queue will be drawn like this, with
   its name above it:
   <div class="diagram">
     <img src="/img/tutorials/queue.png" height="90" />
     <div class="diagram_source">
     digraph {
       bgcolor=transparent;
       truecolor=true;
       rankdir=LR;
       node [style="filled"];
       //
       subgraph cluster_Q1 {
         label="queue_name";
         color=transparent;
         Q1 [label="{||||}", fillcolor="red", shape="record"];
       };
     }
     </div>
   </div>

 * _Consuming_ has a similar meaning to receiving. A _consumer_ is a program
   that mostly waits to receive messages. On our drawings it's shown with "C":
   <div class="diagram">
     <img src="/img/tutorials/consumer.png" height="50" />
     <div class="diagram_source">
     digraph {
       bgcolor=transparent;
       truecolor=true;
       rankdir=LR;
       node [style="filled"];
       //
       C1 [label="C", fillcolor="#33ccff"];
     }
     </div>
   </div>

Note that the producer, consumer, and  broker do not have to reside on
the same machine; indeed in most applications they don't.

## "Hello World"
### (using the php-amqplib Client)

In this part of the tutorial we'll write two programs in PHP; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the [php-amqplib](https://github.com/videlalvaro/php-amqplib) API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="/img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60" />
</div>

> #### The php-amqplib client library
>
> RabbitMQ speaks [AMQP](http://amqp.org/), which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for AMQP in [many different
> languages](http://rabbitmq.com/devtools.html). We'll
> use the php-amqplib in this tutorial.
>
> Add a composer.json file to your project:
>
>     :::javascript
>     {
>         "require": {
>             "videlalvaro/php-amqplib": "2.5.*"
>         }
>     }
>
>Provided you have [composer](http://getcomposer.org) installed, you can run the following:
>
>     :::bash
>     $ composer.phar install
>

Now we have the php-amqplib library installed, we can write some
code.

### Sending

<div class="diagram">
  <img src="/img/tutorials/sending.png" alt="(P) -> [|||]" height="100" />
</div>

We'll call our message sender `send.php` and our message receiver
`receive.php`.  The sender will connect to RabbitMQ, send a single message,
then exit.

In
[`send.php`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/send.php),
we need to include the library and `use` the necessary classes:

    :::php
    require_once __DIR__ . '/vendor/autoload.php';
    use PhpAmqpLib\Connection\AMQPStreamConnection;
    use PhpAmqpLib\Message\AMQPMessage;

then we can create a connection to the server:

    :::php
    $connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
    $channel = $connection->channel();

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a broker on the local machine - hence the
_localhost_. If we wanted to connect to a broker on a different
machine we'd simply specify its name or IP address here.

Next we create a channel, which is where most of the API for getting
things done resides.

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

    :::php
    $channel->queue_declare('hello', false, false, false, false);

    $msg = new AMQPMessage('Hello World!');
    $channel->basic_publish($msg, '', 'hello');

    echo " [x] Sent 'Hello World!'\n";

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

Lastly, we close the channel and the connection;

    :::php
    $channel->close();
    $connection->close();

[Here's the whole send.php
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/send.php).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 1Gb free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The <a
> href="http://www.rabbitmq.com/configure.html#config-items">configuration
> file documentation</a> will show you how to set <code>disk_free_limit</code>.


### Receiving

That's it for our sender.  Our receiver is pushed messages from
RabbitMQ, so unlike the sender which publishes a single message, we'll
keep it running to listen for messages and print them out.

<div class="diagram">
  <img src="/img/tutorials/receiving.png" alt="[|||] -> (C)" height="100" />
</div>

The code (in [`receive.php`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/receive.php)) has almost the same
`include` and `use`s as `send`:

    :::php
    require_once __DIR__ . '/vendor/autoload.php';
    use PhpAmqpLib\Connection\AMQPStreamConnection;

Setting up is the same as the sender; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `send` publishes to.

    :::php
    $connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
    $channel = $connection->channel();

    $channel->queue_declare('hello', false, false, false, false);

    echo ' [*] Waiting for messages. To exit press CTRL+C', "\n";

Note that we declare the queue here, as well. Because we might start
the receiver before the sender, we want to make sure the queue exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
queue. We will define a [PHP callable](http://www.php.net/manual/en/language.types.callable.php)
that will receive the messages sent by the server. Keep in mind
that messages are sent asynchronously from the server to the clients.

    :::php

    $callback = function($msg) {
      echo " [x] Received ", $msg->body, "\n";
    };

    $channel->basic_consume('hello', '', false, true, false, false, $callback);

    while(count($channel->callbacks)) {
        $channel->wait();
    }

Our code will block while our `$channel` has callbacks. Whenever we receive a
message our `$callback` function will be passed the received message.

[Here's the whole receive.php class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/receive.php)

### Putting it all together

Now we can run both scripts. In a terminal, run the sender:

    :::bash
    $ php send.php

then, run the receiver:

    :::bash
    $ php receive.php

The receiver will print the message it gets from the sender via
RabbitMQ. The receiver will keep running, waiting for messages (Use Ctrl-C to stop it), so try running
the sender from another terminal.

If you want to check on the queue, try using `rabbitmqctl list_queues`.

Hello World!

Time to move on to [part 2](tutorial-two-php.html) and build a simple _work queue_.
