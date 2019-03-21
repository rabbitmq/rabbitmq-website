<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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
### (using the php-amqplib Client)

In this part of the tutorial we'll write two programs in PHP; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the [php-amqplib](https://github.com/php-amqplib/php-amqplib) API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="/img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60" />
</div>

> #### The php-amqplib client library
>
> RabbitMQ speaks multiple protocols. This tutorial covers AMQP 0-9-1, which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for RabbitMQ in [many different
> languages](http://rabbitmq.com/devtools.html). We'll
> use the php-amqplib in this tutorial, and [Composer](https://getcomposer.org/doc/00-intro.md)
> for dependency management.
>
> Add a composer.json file to your project:
>
> <pre class="lang-javascript">
> {
>     "require": {
>         "php-amqplib/php-amqplib": ">=2.6.1"
>     }
> }
> </pre>
>
>Provided you have [Composer](https://getcomposer.org/doc/00-intro.md) installed and functional,
>you can run the following:
>
> <pre class="lang-bash">
> composer.phar install
> </pre>
>
>There's also a [Composer installer for Windows](https://github.com/composer/windows-setup).

Now we have the php-amqplib library installed, we can write some
code.

### Sending

<div class="diagram">
  <img src="/img/tutorials/sending.png" alt="(P) -> [|||]" height="100" />
</div>

We'll call our message publisher (sender) `send.php` and our message receiver
`receive.php`.  The publisher will connect to RabbitMQ, send a single message,
then exit.

In
[`send.php`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/send.php),
we need to include the library and `use` the necessary classes:

<pre class="lang-php">
require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
</pre>

then we can create a connection to the server:

<pre class="lang-php">
$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();
</pre>

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a broker on the local machine - hence the
_localhost_. If we wanted to connect to a broker on a different
machine we'd simply specify its name or IP address here.

Next we create a channel, which is where most of the API for getting
things done resides.

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

<pre class="lang-php">
$channel->queue_declare('hello', false, false, false, false);

$msg = new AMQPMessage('Hello World!');
$channel->basic_publish($msg, '', 'hello');

echo " [x] Sent 'Hello World!'\n";
</pre>

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

Lastly, we close the channel and the connection;

<pre class="lang-php">
$channel->close();
$connection->close();
</pre>

[Here's the whole send.php
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/send.php).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 200 MB free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The <a
> href="http://www.rabbitmq.com/configure.html#config-items">configuration
> file documentation</a> will show you how to set <code>disk_free_limit</code>.


### Receiving

That's it for our publisher.  Our receiver listening for messages from
RabbitMQ, so unlike the publisher which publishes a single message, we'll
keep it running to listen for messages and print them out.

<div class="diagram">
  <img src="/img/tutorials/receiving.png" alt="[|||] -> (C)" height="100" />
</div>

The code (in [`receive.php`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/receive.php)) has almost the same
`include` and `use`s as `send`:

<pre class="lang-php">
require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
</pre>

Setting up is the same as the publisher; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `send` publishes to.

<pre class="lang-php">
$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->queue_declare('hello', false, false, false, false);

echo " [*] Waiting for messages. To exit press CTRL+C\n";
</pre>

Note that we declare the queue here, as well. Because we might start
the consumer before the publisher, we want to make sure the queue exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
queue. We will define a [PHP callable](http://www.php.net/manual/en/language.types.callable.php)
that will receive the messages sent by the server. Keep in mind
that messages are sent asynchronously from the server to the clients.

<pre class="lang-php">
$callback = function ($msg) {
  echo ' [x] Received ', $msg->body, "\n";
};

$channel->basic_consume('hello', '', false, true, false, false, $callback);

while (count($channel->callbacks)) {
    $channel->wait();
}
</pre>

Our code will block while our `$channel` has callbacks. Whenever we receive a
message our `$callback` function will be passed the received message.

[Here's the whole receive.php class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/receive.php)

### Putting it all together

Now we can run both scripts. In a terminal, run the consumer (receiver):

<pre class="lang-bash">
php receive.php
</pre>

then, run the publisher (sender):

<pre class="lang-bash">
php send.php
</pre>


The consumer will print the message it gets from the sender via
RabbitMQ. The receiver will keep running, waiting for messages (Use
Ctrl-C to stop it), so try running the sender from another terminal.

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

Time to move on to [part 2](tutorial-two-php.html) and build a simple _work queue_.
