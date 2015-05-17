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
### (using the Bunny Ruby Client)

In this part of the tutorial we'll write two small programs in Ruby; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the [Bunny](http://rubybunny.info) API, concentrating on this very simple thing just to get
started. It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="/img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60" />
</div>

> #### The Bunny client library
>
> RabbitMQ speaks AMQP 0.9.1, which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for RabbitMQ in [many different
> languages](/devtools.html). We'll
> use the Bunny client in this tutorial.
>
> First, install Bunny using [Rubygems](http://rubygems.org):
>
>     :::bash
>     $ gem install bunny --version ">= 1.6.0"
>

Now we have Bunny installed, we can write some
code.

### Sending

<div class="diagram">
  <img src="/img/tutorials/sending.png" alt="(P) -> [|||]" height="100" />
</div>

We'll call our message sender `send.rb` and our message receiver
`receive.rb`.  The sender will connect to RabbitMQ, send a single message,
then exit.

In
[`send.rb`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/ruby/send.rb),
we need to require the library first:

    :::ruby
    #!/usr/bin/env ruby
    # encoding: utf-8

    require "bunny"

then connect to RabbitMQ server

    :::ruby
    conn = Bunny.new
    conn.start

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a broker on the local machine with all default settings.

If we wanted to connect to a broker on a different
machine we'd simply specify its name or IP address using the `:hostname`
option:

    :::ruby
    conn = Bunny.new(:hostname => "rabbit.local")
    conn.start

Next we create a channel, which is where most of the API for getting
things done resides:

    :::ruby
    ch   = conn.create_channel

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

    :::ruby
    q    = ch.queue("hello")
    ch.default_exchange.publish("Hello World!", :routing_key => q.name)
    puts " [x] Sent 'Hello World!'"

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

Lastly, we close the connection;

    :::ruby
    conn.close

[Here's the whole send.rb script](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/ruby/send.rb).

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

The code (in [`receive.rb`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/ruby/receive.rb)) has the same require as `send`:

    :::ruby
    #!/usr/bin/env ruby
    # encoding: utf-8

    require "bunny"


Setting up is the same as the sender; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `send` publishes to.

    :::ruby
    conn = Bunny.new
    conn.start

    ch   = conn.create_channel
    q    = ch.queue("hello")


Note that we declare the queue here, as well. Because we might start
the receiver before the sender, we want to make sure the queue exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
queue. Since it will push us messages asynchronously, we provide a
callback that will be executed when RabbitMQ pushes messages to
our consumer. This is what `Bunny::Queue#subscribe` does.

    :::ruby
    puts " [*] Waiting for messages in #{q.name}. To exit press CTRL+C"
    q.subscribe(:block => true) do |delivery_info, properties, body|
      puts " [x] Received #{body}"

      # cancel the consumer to exit
      delivery_info.consumer.cancel
    end

`Bunny::Queue#subscribe` is used with the `:block` option that makes it
block the calling thread (we don't want the script to finish running immediately!).

[Here's the whole receive.rb script](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/ruby/receive.rb).

### Putting it all together

Now we can run both scripts. In a terminal, run the sender:

    :::bash
    $ ruby -rubygems send.rb

then, run the receiver:

    :::bash
    $ ruby -rubygems receive.rb

The receiver will print the message it gets from the sender via
RabbitMQ. The receiver will keep running, waiting for messages (Use Ctrl-C to stop it), so try running
the sender from another terminal.

If you want to check on the queue, try using `rabbitmqctl list_queues`.

Hello World!

Time to move on to [part 2](tutorial-two-ruby.html) and build a simple _work queue_.

