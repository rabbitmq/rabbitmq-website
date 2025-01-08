---
title: RabbitMQ tutorial - "Hello World!"
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';
import TutorialsIntro from '@site/src/components/Tutorials/TutorialsIntro.md';
import T1DiagramHello from '@site/src/components/Tutorials/T1DiagramHello.md';
import T1DiagramSending from '@site/src/components/Tutorials/T1DiagramSending.md';
import T1DiagramReceiving from '@site/src/components/Tutorials/T1DiagramReceiving.md';

# RabbitMQ tutorial - "Hello World!"

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## "Hello World"
### (using the php-amqplib Client)

In this part of the tutorial we'll write two programs in PHP
that communicate using RabbitMQ. This tutorial uses a client library
that requires PHP 7.x or 8.x.

First program will be a producer that sends a single message, and the second one will be a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the [php-amqplib](https://github.com/php-amqplib/php-amqplib) API, concentrating on this very simple thing just to get
started. It's the "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<T1DiagramHello/>

> #### The php-amqplib client library
>
> RabbitMQ speaks multiple protocols. This tutorial covers AMQP 0-9-1, which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for RabbitMQ in [many different
> languages](/client-libraries/devtools). We'll
> use the php-amqplib in this tutorial, and [Composer](https://getcomposer.org/doc/00-intro.md)
> for dependency management.
>
> Add a composer.json file to your project:
>
> ```javascript
> {
>     "require": {
>         "php-amqplib/php-amqplib": "^3.2"
>     }
> }
> ```
>
>Provided you have [Composer](https://getcomposer.org/doc/00-intro.md) installed and functional,
>you can run the following:
>
> ```bash
> php composer.phar install
> ```
>
>There's also a [Composer installer for Windows](https://github.com/composer/windows-setup).

Now we have the php-amqplib library installed, we can write some
code.

### Sending

<T1DiagramSending/>

We'll call our message publisher (sender) `send.php` and our message receiver
`receive.php`.  The publisher will connect to RabbitMQ, send a single message,
then exit.

In
[`send.php`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/php/send.php),
we need to include the library and `use` the necessary classes:

```php
require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
```

then we can create a connection to the server:

```php
$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();
```

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine or to a host hosting a [proxy recommended for PHP clients](https://github.com/cloudamqp/amqproxy),
we'd simply specify its hostname or IP address here.

Next we create a channel, which is where most of the API for getting
things done resides.

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

```php
$channel->queue_declare('hello', false, false, false, false);

$msg = new AMQPMessage('Hello World!');
$channel->basic_publish($msg, '', 'hello');

echo " [x] Sent 'Hello World!'\n";
```

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

Lastly, we close the channel and the connection:

```php
$channel->close();
$connection->close();
```

[Here's the whole send.php
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/php/send.php).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker [log file](/docs/logging/) to see if there
> is a [resource alarm](/docs/alarms) logged and reduce the
> free disk space threshold if necessary.
> The [Configuration guide](/docs/configure#config-items)
> will show you how to set <code>disk_free_limit</code>.


### Receiving

That's it for our publisher.  Our receiver listens for messages from
RabbitMQ, so unlike the publisher which publishes a single message, we'll
keep the receiver running to listen for messages and print them out.

<T1DiagramReceiving/>

The code (in [`receive.php`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/php/receive.php)) has almost the same
`include` and `use`s as `send`:

```php
require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
```

Setting up is the same as the publisher; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `send` publishes to.

```php
$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->queue_declare('hello', false, false, false, false);

echo " [*] Waiting for messages. To exit press CTRL+C\n";
```

Note that we declare the queue here, as well. Because we might start
the consumer before the publisher, we want to make sure the queue exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
queue. We will define a [PHP callable](http://www.php.net/manual/en/language.types.callable.php)
that will receive the messages sent by the server. Keep in mind
that messages are sent asynchronously from the server to the clients.

```php
$callback = function ($msg) {
  echo ' [x] Received ', $msg->body, "\n";
};

$channel->basic_consume('hello', '', false, true, false, false, $callback);

try {
    $channel->consume();
} catch (\Throwable $exception) {
    echo $exception->getMessage();
}
```

Our code will block while our `$channel` has callbacks. Whenever we receive a
message our `$callback` function will be passed the received message.

[Here's the whole receive.php class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/php/receive.php)

### Putting it all together

Now we can run both scripts. In a terminal, run the consumer (receiver):

```bash
php receive.php
```

then, run the publisher (sender):

```bash
php send.php
```

The consumer will print the message it gets from the sender via
RabbitMQ. The receiver will keep running, waiting for messages (Use
Ctrl-C to stop it), so try running the sender from another terminal.

> #### Listing queues
>
> You may wish to see what queues RabbitMQ has and how many
> messages are in them. You can do it (as a privileged user) using the `rabbitmqctl` tool:
>
> ```bash
> sudo rabbitmqctl list_queues
> ```
>
> On Windows, omit the sudo:
> ```PowerShell
> rabbitmqctl.bat list_queues
> ```

#### PHP Connection Proxy

While this tutorial strives to keep things simple and focus on explaining RabbitMQ
concepts, it is important to call out something that is specific to PHP applications.
In many cases PHP application will not be able to use [long-lived connections](/docs/connections#basics)
that RabbitMQ assumes, creating a condition known as [high connection churn](/docs/connections#high-connection-churn).

To avoid this, PHP users are recommended to use [a special proxy](https://github.com/cloudamqp/amqproxy)
in production when possible. The proxy avoids connection churn or at least significantly reduces it.

Now it is time to move on to [part 2](./tutorial-two-php) and build a simple _work queue_.
