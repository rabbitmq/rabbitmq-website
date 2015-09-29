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
# RabbitMQ tutorial - Work Queues SUPPRESS-RHS

## Work Queues
### (using [php-amqplib](https://github.com/videlalvaro/php-amqplib))

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

<div class="diagram">
  <img src="/img/tutorials/python-two.png" height="110" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      Q1 [label="{||||}", fillcolor="red", shape="record"];
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P1 -&gt; Q1 -&gt; C1;
      Q1 -&gt; C2;
    }
  </div>
</div>


In the [first tutorial](tutorial-one-php.html) we
wrote programs to send and receive messages from a named queue. In this
one we'll create a _Work Queue_ that will be used to distribute
time-consuming tasks among multiple workers.

The main idea behind Work Queues (aka: _Task Queues_) is to avoid
doing a resource-intensive task immediately and having to wait for
it to complete. Instead we schedule the task to be done later. We encapsulate a
_task_ as a message and send it to a queue. A worker process running
in the background will pop the tasks and eventually execute the
job. When you run many workers the tasks will be shared between them.

This concept is especially useful in web applications where it's
impossible to handle a complex task during a short HTTP request
window.

Preparation
------------

In the previous part of this tutorial we sent a message containing
"Hello World!". Now we'll be sending strings that stand for complex
tasks. We don't have a real-world task, like images to be resized or
pdf files to be rendered, so let's fake it by just pretending we're
busy - by using the `sleep()` function. We'll take the number of dots
in the string as its complexity; every dot will account for one second
of "work".  For example, a fake task described by `Hello...`
will take three seconds.

We will slightly modify the _send.php_ code from our previous example,
to allow arbitrary messages to be sent from the command line. This
program will schedule tasks to our work queue, so let's name it
`new_task.php`:

    :::php
    $data = implode(' ', array_slice($argv, 1));
    if(empty($data)) $data = "Hello World!";
    $msg = new AMQPMessage($data,
                            array('delivery_mode' => 2) # make message persistent
                          );

    $channel->basic_publish($msg, '', 'task_queue');

    echo " [x] Sent ", $data, "\n";

Our old _receive.php_ script also requires some changes: it needs to
fake a second of work for every dot in the message body. It will pop
messages from the queue and perform the task, so let's call it `worker.php`:

    :::php
    $callback = function($msg){
      echo " [x] Received ", $msg->body, "\n";
      sleep(substr_count($msg->body, '.'));
      echo " [x] Done", "\n";
      $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
    };

    $channel->basic_qos(null, 1, null);
    $channel->basic_consume('task_queue', '', false, false, false, false, $callback);

Note that our fake task simulates execution time.

Run them as in tutorial one:

    :::bash
    shell1$ php new_task.php "A very hard task which takes two seconds.."
    shell2$ php worker.php

Round-robin dispatching
-----------------------

One of the advantages of using a Task Queue is the ability to easily
parallelise work. If we are building up a backlog of work, we can just
add more workers and that way, scale easily.

First, let's try to run two `worker.php` scripts at the same time. They
will both get messages from the queue, but how exactly? Let's see.

You need three consoles open. Two will run the `worker.php`
script. These consoles will be our two consumers - C1 and C2.

    :::bash
    shell1$ php worker.php
     [*] Waiting for messages. To exit press CTRL+C

<div></div>

    :::bash
    shell2$ php worker.php
     [*] Waiting for messages. To exit press CTRL+C

In the third one we'll publish new tasks. Once you've started
the consumers you can publish a few messages:

    :::bash
    shell3$ php new_task.php First message.
    shell3$ php new_task.php Second message..
    shell3$ php new_task.php Third message...
    shell3$ php new_task.php Fourth message....
    shell3$ php new_task.php Fifth message.....

Let's see what is delivered to our workers:

    :::bash
    shell1$ php worker.php
     [*] Waiting for messages. To exit press CTRL+C
     [x] Received 'First message.'
     [x] Received 'Third message...'
     [x] Received 'Fifth message.....'

<div></div>

    :::bash
    shell2$ php worker.php
     [*] Waiting for messages. To exit press CTRL+C
     [x] Received 'Second message..'
     [x] Received 'Fourth message....'

By default, RabbitMQ will send each message to the next consumer,
in sequence. On average every consumer will get the same number of
messages. This way of distributing messages is called round-robin. Try
this out with three or more workers.


Message acknowledgment
----------------------

Doing a task can take a few seconds. You may wonder what happens if
one of the consumers starts a long task and dies with it only partly done.
With our current code, once RabbitMQ delivers a message to the customer it
immediately removes it from memory. In this case, if you kill a worker
we will lose the message it was just processing. We'll also lose all
the messages that were dispatched to this particular worker but were not
yet handled.

But we don't want to lose any tasks. If a worker dies, we'd like the
task to be delivered to another worker.

In order to make sure a message is never lost, RabbitMQ supports
message _acknowledgments_. An ack(nowledgement) is sent back from the
consumer to tell RabbitMQ that a particular message has been received,
processed and that RabbitMQ is free to delete it.

If a consumer dies without sending an ack, RabbitMQ will understand that a
message wasn't processed fully and will redeliver it to another
consumer. That way you can be sure that no message is lost, even if
the workers occasionally die.

There aren't any message timeouts; RabbitMQ will redeliver the message
only when the worker connection dies. It's fine even if processing a
message takes a very, very long time.

Message acknowledgments are turned off by default.
It's time to turn them on by setting the fourth parameter to `basic_consume` to `false`
(true means _no ack_) and send a proper acknowledgment
from the worker, once we're done with a task.

    :::php
    $callback = function($msg){
      echo " [x] Received ", $msg->body, "\n";
      sleep(substr_count($msg->body, '.'));
      echo " [x] Done", "\n";
      $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
    };

    $channel->basic_consume('task_queue', '', false, false, false, false, $callback);

Using this code we can be sure that even if you kill a worker using
CTRL+C while it was processing a message, nothing will be lost. Soon
after the worker dies all unacknowledged messages will be redelivered.

> #### Forgotten acknowledgment
>
> It's a common mistake to miss the `basic_ack`. It's an easy error,
> but the consequences are serious. Messages will be redelivered
> when your client quits (which may look like random redelivery), but
> RabbitMQ will eat more and more memory as it won't be able to release
> any unacked messages.
>
> In order to debug this kind of mistake you can use `rabbitmqctl`
> to print the `messages_unacknowledged` field:
>
>     :::bash
>     $ sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
>     Listing queues ...
>     hello    0       0
>     ...done.


Message durability
------------------

We have learned how to make sure that even if the consumer dies, the
task isn't lost. But our tasks will still be lost if RabbitMQ server stops.

When RabbitMQ quits or crashes it will forget the queues and messages
unless you tell it not to. Two things are required to make sure that
messages aren't lost: we need to mark both the queue and messages as
durable.

First, we need to make sure that RabbitMQ will never lose our
queue. In order to do so, we need to declare it as _durable_.
To do so we pass the third parameter to `queue_declare` as `true`:

    :::php
    $channel->queue_declare('hello', false, true, false, false);

Although this command is correct by itself, it won't work in our present
setup. That's because we've already defined a queue called `hello`
which is not durable. RabbitMQ doesn't allow you to redefine an existing queue
with different parameters and will return an error to any program
that tries to do that. But there is a quick workaround - let's declare
a queue with different name, for example `task_queue`:

    :::php
    $channel->queue_declare('task_queue', false, true, false, false);

This flag set to `true` needs to be applied to both the producer
and consumer code.

At this point we're sure that the `task_queue` queue won't be lost
even if RabbitMQ restarts. Now we need to mark our messages as persistent
- by setting the `delivery_mode = 2` message property which `AMQPMessage` takes
as part of the property array.

    :::php
    $msg = new AMQPMessage($data,
           array('delivery_mode' => 2) # make message persistent
           );

> #### Note on message persistence
>
> Marking messages as persistent doesn't fully guarantee that a message
> won't be lost. Although it tells RabbitMQ to save the message to disk,
> there is still a short time window when RabbitMQ has accepted a message and
> hasn't saved it yet. Also, RabbitMQ doesn't do `fsync(2)` for every
> message -- it may be just saved to cache and not really written to the
> disk. The persistence guarantees aren't strong, but it's more than enough
> for our simple task queue. If you need a stronger guarantee then you can use
> [publisher confirms](https://www.rabbitmq.com/confirms.html).


Fair dispatch
----------------

You might have noticed that the dispatching still doesn't work exactly
as we want. For example in a situation with two workers, when all
odd messages are heavy and even messages are light, one worker will be
constantly busy and the other one will do hardly any work. Well,
RabbitMQ doesn't know anything about that and will still dispatch
messages evenly.

This happens because RabbitMQ just dispatches a message when the message
enters the queue. It doesn't look at the number of unacknowledged
messages for a consumer. It just blindly dispatches every n-th message
to the n-th consumer.

<div class="diagram">
  <img src="/img/tutorials/prefetch-count.png" height="110" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      subgraph cluster_Q1 {
        label="queue_name=hello";
	color=transparent;
        Q1 [label="{||||}", fillcolor="red", shape="record"];
      };
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P1 -&gt; Q1;
      Q1 -&gt; C1 [label="prefetch=1"] ;
      Q1 -&gt; C2 [label="prefetch=1"] ;
    }
  </div>
</div>

In order to defeat that we can use the `basic_qos` method with the
`prefetch_count` = `1` setting. This tells RabbitMQ not to give more than
one message to a worker at a time. Or, in other words, don't dispatch
a new message to a worker until it has processed and acknowledged the
previous one. Instead, it will dispatch it to the next worker that is not still busy.

    :::php
    $channel->basic_qos(null, 1, null);

> #### Note about queue size
>
> If all the workers are busy, your queue can fill up. You will want to keep an
> eye on that, and maybe add more workers, or have some other strategy.

Putting it all together
-----------------------

Final code of our `new_task.php` file:

    :::php
    <?php

    require_once __DIR__ . '/vendor/autoload.php';
    use PhpAmqpLib\Connection\AMQPConnection;
    use PhpAmqpLib\Message\AMQPMessage;

    $connection = new AMQPConnection('localhost', 5672, 'guest', 'guest');
    $channel = $connection->channel();


    $channel->queue_declare('task_queue', false, true, false, false);

    $data = implode(' ', array_slice($argv, 1));
    if(empty($data)) $data = "Hello World!";
    $msg = new AMQPMessage($data,
                            array('delivery_mode' => 2) # make message persistent
                          );

    $channel->basic_publish($msg, '', 'task_queue');

    echo " [x] Sent ", $data, "\n";

    $channel->close();
    $connection->close();

    ?>



[(new_task.php source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/new_task.php)

And our `worker.php`:

    :::php
    <?php

    require_once __DIR__ . '/vendor/autoload.php';
    use PhpAmqpLib\Connection\AMQPConnection;

    $connection = new AMQPConnection('localhost', 5672, 'guest', 'guest');
    $channel = $connection->channel();

    $channel->queue_declare('task_queue', false, true, false, false);

    echo ' [*] Waiting for messages. To exit press CTRL+C', "\n";

    $callback = function($msg){
      echo " [x] Received ", $msg->body, "\n";
      sleep(substr_count($msg->body, '.'));
      echo " [x] Done", "\n";
      $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
    };

    $channel->basic_qos(null, 1, null);
    $channel->basic_consume('task_queue', '', false, false, false, false, $callback);

    while(count($channel->callbacks)) {
        $channel->wait();
    }

    $channel->close();
    $connection->close();

    ?>

[(worker.php source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/worker.php)

Using message acknowledgments and `prefetch` you can set up a
work queue. The durability options let the tasks survive even if
RabbitMQ is restarted.

Now we can move on to [tutorial 3](tutorial-three-php.html) and learn how
to deliver the same message to many consumers.

