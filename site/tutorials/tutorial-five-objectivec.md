# RabbitMQ tutorial - Topics SUPPRESS-RHS

## Topics
### (using the [Objective-C client][client])

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

In the [previous tutorial][previous] we improved our
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
`routingKey` - it must be a list of words, delimited by dots. The
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
[previous tutorial][previous].

The code for `emitLogTopic`:

    - (void)emitLogTopic:(NSString *)msg routingKey:(NSString *)routingKey {
        RMQConnection *conn = [[RMQConnection alloc] initWithDelegate:[RMQConnectionDelegateLogger new]];
        [conn start];

        id<RMQChannel> ch = [conn createChannel];
        RMQExchange *x    = [ch topic:@"topic_logs"];

        [x publish:msg routingKey:routingKey];
        NSLog(@"Sent '%@'", msg);

        [conn close];
    }

The code for `receiveLogsTopic`:

    - (void)receiveLogsTopic:(NSArray *)routingKeys {
        RMQConnection *conn = [[RMQConnection alloc] initWithDelegate:[RMQConnectionDelegateLogger new]];
        [conn start];

        id<RMQChannel> ch = [conn createChannel];
        RMQExchange *x    = [ch topic:@"topic_logs"];
        RMQQueue *q       = [ch queue:@"" options:RMQQueueDeclareExclusive];

        for (NSString *routingKey in routingKeys) {
            [q bind:x routingKey:routingKey];
        }

        NSLog(@"Waiting for logs.");

        [q subscribe:^(RMQDeliveryInfo * _Nonnull deliveryInfo, RMQMessage * _Nonnull message) {
            NSLog(@"%@:%@", deliveryInfo.routingKey, message.content);
        }];
    }

To receive all the logs:

    [self receiveLogsTopic:@[@"#"]];

To receive all logs from the facility "`kern`":

    [self receiveLogsTopic:@[@"kern.*"]];

Or if you want to hear only about "`critical`" logs:

    [self receiveLogsTopic:@[@"*.critical"]];

You can create multiple bindings:

    [self receiveLogsTopic:@[@"kern.*", @"*.critical"]];

And to emit a log with a routing key "`kern.critical`" type:

    [self emitLogTopic:@"A critical kernel error" routingKey:@"kern.critical"];

Have fun playing with these methods. Note that the code doesn't make
any assumption about the routing or binding keys, you may want to play
with more than two routing key parameters.

<p id="teasers">Some teasers:</p>

 * [Will "`*`" binding catch a message sent with an empty routing key?](#teaser_answer_1)
   <div id="teaser_answer_1" class="teaser_answer">
       <p>No.</p>
       <pre><code>
       [self receiveLogsTopic:@[@"*"]];
       [self emitLogTopic:@"Hi!" routingKey:@""];
       </code></pre>
       <p><a href="#teasers">(hide)</a></p>
   </div>
 * [Will "`#.*`" catch a message with a string "`..`" as a key? Will
   it catch a message with a single word key?](#teaser_answer_2)
   <div id="teaser_answer_2" class="teaser_answer">
       <p>No. (but I don't know why!)</p>
       <pre><code>
       [self receiveLogsTopic:@[@"#.&#42;"]];
       [self emitLogTopic:@"Hello" routingKey:@".."];
       </code></pre>
       <p>Yes</p>
       <pre><code>
       [self receiveLogsTopic:@[@"#.&#42;"]];
       [self emitLogTopic:@"Hello" routingKey:@"a"];
       </code></pre>
       <p><a href="#teasers">(hide)</a></p>
   </div>
 * [How different is "`a.*.#`" from "`a.#`"?](#teaser_answer_3)
   <div id="teaser_answer_3" class="teaser_answer">
       <p>
       'a.&#42;.#' matches anything that has two words or more, and the first
       word is 'a'. But 'a.#' matches anything that has one word or more
       with the first word set to 'a'.
       </p>
       <pre><code>
       [self receiveLogsTopic:@[@"a.&#42;.#"]];
       [self emitLogTopic:@"Hello" routingKey:@"a.b"];
       [self receiveLogsTopic:@[@"a.#"]];
       [self emitLogTopic:@"Hello" routingKey:@"a.b"];
       </code></pre>
       <p><a href="#teasers">(hide)</a></p>
   </div>

([source][source])

[client]:https://github.com/rabbitmq/rabbitmq-objc-client
[previous]:tutorial-four-objectivec.html
[source]:https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/objective-c/tutorial5/tutorial5/ViewController.m
