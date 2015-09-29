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
# RabbitMQ tutorial - Topics SUPPRESS-RHS

## Topics
### (using [php-amqplib](https://github.com/videlalvaro/php-amqplib))

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

In the [previous tutorial](tutorial-four-php.html) we improved our
logging system. Instead of using a `fanout` exchange only capable of
dummy broadcasting, we used a `direct` one, and gained a possibility
of selectively receiving the logs.

Although using the `direct` exchange improved our system, it still has
limitations - it can't do routing based on multiple criteria.

In our logging system we might want to subscribe to not only logs
based on severity, but also based on the source which emitted the log.
You might know this concept from the
[`syslog`](http://en.wikipedia.org/wiki/Syslog) unix tool, which
routes logs based on both severity (info/warn/crit...) and facility
(auth/cron/kern...).

That would give us a lot of flexibility - we may want to listen to
just critical errors coming from 'cron' but also all logs from 'kern'.

To implement that in our logging system we need to learn about a more
complex `topic` exchange.

Topic exchange
--------------

Messages sent to a `topic` exchange can't have an arbitrary
`routing_key` - it must be a list of words, delimited by dots. The
words can be anything, but usually they specify some features
connected to the message. A few valid routing key examples:
"`stock.usd.nyse`", "`nyse.vmw`", "`quick.orange.rabbit`". There can be as
many words in the routing key as you like, up to the limit of 255
bytes.

The binding key must also be in the same form. The logic behind the
`topic` exchange is similar to a `direct` one - a message sent with a
particular routing key will be delivered to all the queues that are
bound with a matching binding key. However there are two important
special cases for binding keys:

  * `*` (star) can substitute for exactly one word.
  * `#` (hash) can substitute for zero or more words.

It's easiest to explain this in an example:

<div class="diagram">
  <img src="/img/tutorials/python-five.png" height="170" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P [label="P", fillcolor="#00ffff"];
      subgraph cluster_X1 {
        label="type=topic";
	color=transparent;
        X [label="X", fillcolor="#3333CC"];
      };
      subgraph cluster_Q1 {
        label="Q1";
	color=transparent;
        Q1 [label="{||||}", fillcolor="red", shape="record"];
      };
      subgraph cluster_Q2 {
        label="Q2";
	color=transparent;
        Q2 [label="{||||}", fillcolor="red", shape="record"];
      };
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P -&gt; X;
      X -&gt; Q1 [label="*.orange.*"];
      X -&gt; Q2 [label="*.*.rabbit"];
      X -&gt; Q2 [label="lazy.#"];
      Q1 -&gt; C1;
      Q2 -&gt; C2;
    }
  </div>
</div>

In this example, we're going to send messages which all describe
animals. The messages will be sent with a routing key that consists of
three words (two dots). The first word in the routing key
will describe speed, second a colour and third a species:
"`<speed>.<colour>.<species>`".

We created three bindings: Q1 is bound with binding key "`*.orange.*`"
and Q2 with "`*.*.rabbit`" and "`lazy.#`".

These bindings can be summarised as:

  * Q1 is interested in all the orange animals.
  * Q2 wants to hear everything about rabbits, and everything about lazy
    animals.

A message with a routing key set to "`quick.orange.rabbit`"
will be delivered to both queues. Message
"`lazy.orange.elephant`" also will go to both of them. On the other hand
"`quick.orange.fox`" will only go to the first queue, and
"`lazy.brown.fox`" only to the second. "`lazy.pink.rabbit`" will
be delivered to the second queue only once, even though it matches two bindings.
"`quick.brown.fox`" doesn't match any binding so it will be discarded.

What happens if we break our contract and send a message with one or
four words, like "`orange`" or "`quick.orange.male.rabbit`"? Well,
these messages won't match any bindings and will be lost.

On the other hand "`lazy.orange.male.rabbit`", even though it has four
words, will match the last binding and will be delivered to the second
queue.

> #### Topic exchange
>
> Topic exchange is powerful and can behave like other exchanges.
>
> When a queue is bound with "`#`" (hash) binding key - it will receive
> all the messages, regardless of the routing key - like in `fanout` exchange.
>
> When special characters "`*`" (star) and "`#`" (hash) aren't used in bindings,
> the topic exchange will behave just like a `direct` one.

Putting it all together
-----------------------

We're going to use a `topic` exchange in our logging system. We'll
start off with a working assumption that the routing keys of logs will
have two words: "`<facility>.<severity>`".

The code is almost the same as in the
[previous tutorial](tutorial-four-php.html).

The code for `emit_log_topic.php`:

    :::php
    <?php

    require_once __DIR__ . '/vendor/autoload.php';
    use PhpAmqpLib\Connection\AMQPConnection;
    use PhpAmqpLib\Message\AMQPMessage;

    $connection = new AMQPConnection('localhost', 5672, 'guest', 'guest');
    $channel = $connection->channel();


    $channel->exchange_declare('topic_logs', 'topic', false, false, false);

    $routing_key = $argv[1];
    if(empty($routing_key)) $routing_key = "anonymous.info";
    $data = implode(' ', array_slice($argv, 2));
    if(empty($data)) $data = "Hello World!";

    $msg = new AMQPMessage($data);

    $channel->basic_publish($msg, 'topic_logs', $routing_key);

    echo " [x] Sent ",$routing_key,':',$data," \n";

    $channel->close();
    $connection->close();

    ?>

The code for `receive_logs_topic.php`:

    :::php
    <?php

    require_once __DIR__ . '/vendor/autoload.php';
    use PhpAmqpLib\Connection\AMQPConnection;

    $connection = new AMQPConnection('localhost', 5672, 'guest', 'guest');
    $channel = $connection->channel();

    $channel->exchange_declare('topic_logs', 'topic', false, false, false);

    list($queue_name, ,) = $channel->queue_declare("", false, false, true, false);

    $binding_keys = array_slice($argv, 1);
    if( empty($binding_keys )) {
    	file_put_contents('php://stderr', "Usage: $argv[0] [binding_key]\n");
    	exit(1);
    }

    foreach($binding_keys as $binding_key) {
    	$channel->queue_bind($queue_name, 'topic_logs', $binding_key);
    }

    echo ' [*] Waiting for logs. To exit press CTRL+C', "\n";

    $callback = function($msg){
      echo ' [x] ',$msg->delivery_info['routing_key'], ':', $msg->body, "\n";
    };

    $channel->basic_consume($queue_name, '', false, true, false, false, $callback);

    while(count($channel->callbacks)) {
        $channel->wait();
    }

    $channel->close();
    $connection->close();

    ?>

To receive all the logs:

    :::bash
    $ php receive_logs_topic.php "#"

To receive all logs from the facility "`kern`":

    :::bash
    $ phpreceive_logs_topic.php "kern.*"

Or if you want to hear only about "`critical`" logs:

    :::bash
    $ php receive_logs_topic.php "*.critical"

You can create multiple bindings:

    :::bash
    $ php receive_logs_topic.php "kern.*" "*.critical"

And to emit a log with a routing key "`kern.critical`" type:

    :::bash
    $ php emit_log_topic.php "kern.critical" "A critical kernel error"

Have fun playing with these programs. Note that the code doesn't make
any assumption about the routing or binding keys, you may want to play
with more than two routing key parameters.

Some teasers:

 * Will "`*`" binding catch a message sent with an empty routing key?
   <div class="teaser_answer">
       No.
       php receive_logs_topic.php "&#42;"
       php emit_log_topic.php ""
   </div>
 * Will "`#.*`" catch a message with a string "`..`" as a key? Will
   it catch a message with a single word key?
   <div class="teaser_answer">
       No. (but I don't know why!)
       php receive_logs_topic.php "#.&#42;"
       php emit_log_topic.php ".."
       Yes
       php receive_logs_topic.php "#.&#42;"
       php emit_log_topic.php "a"
   </div>
 * How different is "`a.*.#`" from "`a.#`"?
   <div class="teaser_answer">
       'a.&#42;.#' matches anything that has two words or more, and the first
       word is 'a'. But 'a.#' matches anything that has one word or more
       with the first word set to 'a'.
       php receive_logs_topic.php "a.*.#"
       php emit_log_topic.php "a.b"
       php receive_logs_topic.php "a.#"
       php emit_log_topic.php "a.b"
   </div>

(Full source code for [emit_log_topic.php](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/emit_log_topic.php)
and [receive_logs_topic.php](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/php/receive_logs_topic.php))

Next, find out how to do a round trip message as a remote procedure call in [tutorial 6](tutorial-six-php.html)
