---
title: RabbitMQ tutorial - Routing
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
import T4DiagramDirectX from '@site/src/components/Tutorials/T4DiagramDirectX.md';
import T4DiagramMultipleBindings from '@site/src/components/Tutorials/T4DiagramMultipleBindings.md';
import T4DiagramFull from '@site/src/components/Tutorials/T4DiagramFull.md';

# RabbitMQ tutorial - Routing

## Routing
### (using [php-amqplib](https://github.com/php-amqplib/php-amqplib))

<TutorialsHelp/>

In the [previous tutorial](./tutorial-three-php) we built a
simple logging system. We were able to broadcast log messages to many
receivers.

In this tutorial we're going to add a feature to it - we're going to
make it possible to subscribe only to a subset of the messages. For
example, we will be able to direct only critical error messages to the
log file (to save disk space), while still being able to print all of
the log messages on the console.


Bindings
--------

In previous examples we were already creating bindings. You may recall
code like:

```php
$channel->queue_bind($queue_name, 'logs');
```

A binding is a relationship between an exchange and a queue. This can
be simply read as: the queue is interested in messages from this
exchange.

Bindings can take an extra `routing_key` parameter. To avoid the
confusion with a `$channel::basic_publish` parameter we're going to call it a
`binding key`. This is how we could create a binding with a key:

```php
$binding_key = 'black';
$channel->queue_bind($queue_name, $exchange_name, $binding_key);
```

The meaning of a binding key depends on the exchange type. The
`fanout` exchanges, which we used previously, simply ignored its
value.

Direct exchange
---------------

Our logging system from the previous tutorial broadcasts all messages
to all consumers. We want to extend that to allow filtering messages
based on their severity. For example we may want the script which is
writing log messages to the disk to only receive critical errors, and
not waste disk space on warning or info log messages.

We were using a `fanout` exchange, which doesn't give us much
flexibility - it's only capable of mindless broadcasting.

We will use a `direct` exchange instead. The routing algorithm behind
a `direct` exchange is simple - a message goes to the queues whose
`binding key` exactly matches the `routing key` of the message.

To illustrate that, consider the following setup:

<T4DiagramDirectX/>

In this setup, we can see the `direct` exchange `X` with two queues bound
to it. The first queue is bound with binding key `orange`, and the second
has two bindings, one with binding key `black` and the other one
with `green`.

In such a setup a message published to the exchange with a routing key
`orange` will be routed to queue `Q1`. Messages with a routing key of `black`
or `green` will go to `Q2`. All other messages will be discarded.


Multiple bindings
-----------------
<T4DiagramMultipleBindings/>

It is perfectly legal to bind multiple queues with the same binding
key. In our example we could add a binding between `X` and `Q1` with
binding key `black`. In that case, the `direct` exchange will behave
like `fanout` and will broadcast the message to all the matching
queues. A message with routing key `black` will be delivered to both
`Q1` and `Q2`.


Emitting logs
-------------

We'll use this model for our logging system. Instead of `fanout` we'll
send messages to a `direct` exchange. We will supply the log severity as
a `routing key`. That way the receiving script will be able to select
the severity it wants to receive. Let's focus on emitting logs
first.

As always, we need to create an exchange first:

```php
$channel->exchange_declare('direct_logs', 'direct', false, false, false);
```

And we're ready to send a message:

```php
$channel->exchange_declare('direct_logs', 'direct', false, false, false);
$channel->basic_publish($msg, 'direct_logs', $severity);
```

To simplify things we will assume that 'severity' can be one of
`info`, `warning`, or `error`.

Subscribing
-----------

Receiving messages will work just like in the previous tutorial, with
one exception - we're going to create a new binding for each severity
we're interested in.

```php
foreach ($severities as $severity) {
    $channel->queue_bind($queue_name, 'direct_logs', $severity);
}
```

Putting it all together
-----------------------

<T4DiagramFull/>


The code for `emit_log_direct.php` class:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->exchange_declare('direct_logs', 'direct', false, false, false);

$severity = $argv[1] ?? 'info';

$data = implode(' ', array_slice($argv, 2));
if (empty($data)) {
    $data = "Hello World!";
}

$msg = new AMQPMessage($data);

$channel->basic_publish($msg, 'direct_logs', $severity);

echo ' [x] Sent ', $severity, ':', $data, "\n";

$channel->close();
$connection->close();
```


The code for `receive_logs_direct.php`:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->exchange_declare('direct_logs', 'direct', false, false, false);

list($queue_name, ,) = $channel->queue_declare("", false, false, true, false);

$severities = array_slice($argv, 1);
if (empty($severities)) {
    file_put_contents('php://stderr', "Usage: $argv[0] [info] [warning] [error]\n");
    exit(1);
}

foreach ($severities as $severity) {
    $channel->queue_bind($queue_name, 'direct_logs', $severity);
}

echo " [*] Waiting for logs. To exit press CTRL+C\n";

$callback = function (AMQPMessage $msg) {
    echo ' [x] ', $msg->getRoutingKey(), ':', $msg->getBody(), "\n";
};

$channel->basic_consume($queue_name, '', false, true, false, false, $callback);

try {
    $channel->consume();
} catch (\Throwable $exception) {
    echo $exception->getMessage();
}

$channel->close();
$connection->close();
```

If you want to save only 'warning' and 'error' (and not 'info') log
messages to a file, just open a console and type:

```bash
php receive_logs_direct.php warning error > logs_from_rabbit.log
```

If you'd like to see all the log messages on your screen, open a new
terminal and do:

```bash
php receive_logs_direct.php info warning error
# => [*] Waiting for logs. To exit press CTRL+C
```

And, for example, to emit an `error` log message just type:

```bash
php emit_log_direct.php error "Run. Run. Or it will explode."
# => [x] Sent 'error':'Run. Run. Or it will explode.'
```

(Full source code for [(emit_log_direct.php source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/php/emit_log_direct.php)
and [(receive_logs_direct.php source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/php/receive_logs_direct.php))


Move on to [tutorial 5](./tutorial-five-php) to find out how to listen
for messages based on a pattern.
