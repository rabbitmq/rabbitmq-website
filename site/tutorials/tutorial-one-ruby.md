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
# RabbitMQ tutorial - "Hello World!" SUPPRESS-RHS

## Introduction

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>
<xi:include href="site/tutorials/tutorials-intro.xml.inc"/>

## "Hello World"
### (using the Bunny Ruby Client)

In this part of the tutorial we'll write two small programs in Ruby; a
producer (sender) that sends a single message, and a consumer (receiver) that receives
messages and prints them out.  We'll gloss over some of the detail in
the [Bunny](http://rubybunny.info) API, concentrating on this very simple thing just to get
started. It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="../img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60" />
</div>

> #### The Bunny client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for RabbitMQ in [many different
> languages](http://rabbitmq.com/devtools.html). We'll
> use the [Bunny](http://rubybunny.info), the most popular Ruby client, in this tutorial.
>
> First, install Bunny using [Rubygems](http://rubygems.org):
>
> <pre class="lang-bash">
> gem install bunny --version ">= 2.13.0"
> </pre>

Now we have Bunny installed, we can write some
code.

### Sending

<div class="diagram">
  <img src="../img/tutorials/sending.png" alt="(P) -> [|||]" height="100" />
</div>

We'll call our message producer `send.rb` and our message consumer
`receive.rb`.  The producer will connect to RabbitMQ, send a single message,
then exit.

In
[`send.rb`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/send.rb),
we need to require the library first:

<pre class="lang-ruby">
#!/usr/bin/env ruby
require 'bunny'
</pre>

then connect to RabbitMQ server

<pre class="lang-ruby">
connection = Bunny.new
connection.start
</pre>

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a broker on the local machine with all default settings.

If we wanted to connect to a broker on a different
machine we'd simply specify its name or IP address using the `:hostname`
option:

<pre class="lang-ruby">
connection = Bunny.new(hostname: 'rabbit.local')
connection.start
</pre>

Next we create a channel, which is where most of the API for getting
things done resides:

<pre class="lang-ruby">
channel = connection.create_channel
</pre>

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

<pre class="lang-ruby">
queue = channel.queue('hello')

channel.default_exchange.publish('Hello World!', routing_key: queue.name)
puts " [x] Sent 'Hello World!'"
</pre>

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

Lastly, we close the connection:

<pre class="lang-ruby">
connection.close
</pre>

[Here's the whole send.rb script](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/send.rb).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 200 MB free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The <a
> href="https://www.rabbitmq.com/configure.html#config-items">configuration
> file documentation</a> will show you how to set <code>disk_free_limit</code>.


### Receiving

That's it for our producer. Our consumer is listening for messages from
RabbitMQ, so unlike the producer which publishes a single message, we'll
keep the consumer running to listen for messages and print them out.

<div class="diagram">
  <img src="../img/tutorials/receiving.png" alt="[|||] -> (C)" height="100" />
</div>

The code (in [`receive.rb`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/receive.rb)) has the same require as `send`:

<pre class="lang-ruby">
#!/usr/bin/env ruby
require 'bunny'
</pre>

Setting up is the same as the producer; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `send` publishes to.

<pre class="lang-ruby">
connection = Bunny.new
connection.start

channel = connection.create_channel
queue = channel.queue('hello')
</pre>

Note that we declare the queue here, as well. Because we might start
the consumer before the producer, we want to make sure the queue exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
queue. Since it will push us messages asynchronously, we provide a
callback that will be executed when RabbitMQ pushes messages to
our consumer. This is what `Bunny::Queue#subscribe` does.

<pre class="lang-ruby">
begin
  puts ' [*] Waiting for messages. To exit press CTRL+C'
  queue.subscribe(block: true) do |_delivery_info, _properties, body|
    puts " [x] Received #{body}"
  end
rescue Interrupt => _
  connection.close

  exit(0)
end
</pre>

`Bunny::Queue#subscribe` is used with the `:block` option that makes it
block the calling thread (we don't want the script to finish running immediately!).

[Here's the whole receive.rb script](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/receive.rb).

### Putting it all together

Now we can run both scripts. In a terminal, run the consumer (receiver):

<pre class="lang-bash">
ruby receive.rb
</pre>

then, run the publisher (sender):

<pre class="lang-bash">
ruby send.rb
</pre>

The consumer will print the message it gets from the producer via
RabbitMQ. The consumer will keep running, waiting for messages (Use Ctrl-C to stop it), so try running
the producer from another terminal.

> #### Listing queues
>
> You may wish to see what queues RabbitMQ has and how many
> messages are in them. You can do it (as a privileged user) using the `rabbitmqctl` tool:
>
> <pre class="lang-bash">
> sudo rabbitmqctl list_queues
> </pre>
>
> On Windows, omit the sudo:
> <pre class="lang-powershell">
> rabbitmqctl.bat list_queues
> </pre>

Time to move on to [part 2](tutorial-two-ruby.html) and build a simple _work queue_.
