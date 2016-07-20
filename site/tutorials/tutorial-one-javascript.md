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
# RabbitMQ tutorial - "Hello World!" SUPPRESS-RHS

## Introduction

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>
<xi:include href="site/tutorials/tutorials-intro.xml.inc"/>

## "Hello World"
### (using the amqp.node client)

In this part of the tutorial we'll write two small programs in Javascript; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the [amqp.node](http://www.squaremobius.net/amqp.node/) API, concentrating on this very simple thing just to get
started. It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="/img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60" />
</div>

> #### The amqp.node client library
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for RabbitMQ in [many different
> languages](http://rabbitmq.com/devtools.html). We'll
> use the [amqp.node client](http://www.squaremobius.net/amqp.node/) in this tutorial.
>
> First, install amqp.node using [npm](https://www.npmjs.com):
>
>     :::bash
>     $ npm install amqplib
>

Now we have amqp.node installed, we can write some
code.

### Sending

<div class="diagram">
  <img src="/img/tutorials/sending.png" alt="(P) -> [|||]" height="100" />
</div>

We'll call our message sender `send.js` and our message receiver
`receive.js`.  The sender will connect to RabbitMQ, send a single message,
then exit.

In
[`send.js`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/send.js),
we need to require the library first:

    :::javascript
    #!/usr/bin/env node

    var amqp = require('amqplib/callback_api');

then connect to RabbitMQ server

    :::javascript
    amqp.connect('amqp://localhost', function(err, conn) {});

Next we create a channel, which is where most of the API for getting
things done resides:

    :::javascript
    amqp.connect('amqp://localhost', function(err, conn) {
      conn.createChannel(function(err, ch) {});
    });

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

    :::javascript
    amqp.connect('amqp://localhost', function(err, conn) {
      conn.createChannel(function(err, ch) {
        var q = 'hello';

        ch.assertQueue(q, {durable: false});
        ch.sendToQueue(q, Buffer.from('Hello World!'));
        console.log(" [x] Sent 'Hello World!'");
      });
    });

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

Lastly, we close the connection and exit;

    :::javascript
    setTimeout(function() { conn.close(); process.exit(0) }, 500);

[Here's the whole send.js script](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/send.js).

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

The code (in [`receive.js`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/receive.js)) has the same require as `send`:

    :::javascript
    #!/usr/bin/env node

    var amqp = require('amqplib/callback_api');


Setting up is the same as the sender; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `sendToQueue` publishes to.

    :::javascript
    amqp.connect('amqp://localhost', function(err, conn) {
      conn.createChannel(function(err, ch) {
        var q = 'hello';
    
        ch.assertQueue(q, {durable: false});
      });
    });


Note that we declare the queue here, as well. Because we might start
the receiver before the sender, we want to make sure the queue exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
queue. Since it will push us messages asynchronously, we provide a
callback that will be executed when RabbitMQ pushes messages to
our consumer. This is what `Channel.consume` does.

    :::javascript
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
    }, {noAck: true});

[Here's the whole receive.js script](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/receive.js).

### Putting it all together

Now we can run both scripts. In a terminal, from the rabbitmq-tutorials/javascript-nodejs/src/ folder, run the sender:

    :::bash
    $ ./send.js

then, run the receiver:

    :::bash
    $ ./receive.js

The receiver will print the message it gets from the sender via
RabbitMQ. The receiver will keep running, waiting for messages (Use Ctrl-C to stop it), so try running
the sender from another terminal.

If you want to check on the queue, try using `rabbitmqctl list_queues`.

Hello World!

Time to move on to [part 2](tutorial-two-javascript.html) and build a simple _work queue_.

