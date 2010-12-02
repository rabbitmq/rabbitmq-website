# RabbitMQ tutorial - Topics

<div id="sidebar" class="tutorial-five">
   <xi:include href="tutorials-menu.xml.inc"/>
</div>

<div id="tutorial">


## Topics

<xi:include href="tutorials-help.xml.inc"/>

In the [previous tutorial](tutorial-four-python.html) we improved our
logging system. Instead of using a `fanout` exchange only capable of
dummy broadcasting, we used a `direct` one, and gained a possibility
of selectively receiving the logs.

Although using the `direct` exchange improved our system, it still has
limitations - it can't do routing based on multiple criteria.

In our logging system we might want to subscribe to not only logs
based on severity, but also based on the facility which emitted the
log.  You might know this concept from
[`syslog`](http://en.wikipedia.org/wiki/Syslog). It's not only routing
logs based on severity (info/warn/crit...) but also on a facility
(auth/cron/kern...).

That would give us a lot of flexibility - we may want to listen to
only critical errors coming from 'cron' and all logs from 'kern'.

To implement that in our logging system we need a more complex exchange.


Topic exchange
--------------

Messages send to a `topic` exchange can't have an arbitrary
`routing_key` - it must be a list of properties, delimited by
dots. Few examples: `stock.usd.nyse`, `nyse.vmw`,
`orange.fat.rabbit`. There can be as many properties as you like, up
to the routing key limit of 255 bytes.

Binding key also must be in the same form. The logic behind the
`topic` exchange is similar to `direct` one - a message send with a
particular routing key will be appended to all the queues that are
bound with a matching binding key. However there are two important
special cases for binding keys:

  * `*` (star) can substitute for exactly one property.
  * `#` (hash) can substitute for zero or more properties.

It's easiest to explain that on the example:

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
      subgraph cluster_Q3 {
        label="Q3";
	color=transparent;
        Q3 [label="{||||}", fillcolor="red", shape="record"];
      };
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P -&gt; X;
      X -&gt; Q1 [label="orange.*.*"];
      X -&gt; Q2 [label="*.*.rabbit"];
      X -&gt; Q2 [label="*.fat.*"];
      Q1 -&gt; C1;
      Q2 -&gt; C2;
    }
  </div>
</div>

In this example, our messages are going to describe animals. The
messages are going to be send with routing key that consists of three
properties (ie: two dots). The first property in routing key will
describe a colour, second a size and third a species:
`<colour>.<size>.<species>`.

We created three bindings: Q1 is bound to a `topic` exchange with
binding key `orange.*.*`, Q2 with `*.*.rabbit` and `*.fat.*`.

This bindings can be summarised as:

  * Q1 is interested in all the orange animals.
  * Q2 will hear everything about rabbits, and everything about fat
    animals.

Imagine we're sending a message with `orange.fat.rabbit` as a routing
key.  This message will be delivered to both queues. Message
`orange.fat.elephant` also will go to both of them. On the other hand
`orange.unknown.whatever` will only go to the first queue, and
`purple.fat.whatever` only to the second. `yellow.slim.mouse` will be
discarded.

What happens if we break our contract and send a message with one or
four properties, like `orange` or `orange.fat.rabbit.male`? Well,
these messages won't match any bindings and will be lost.


It's worth noting that if we created a third queue and bound it with a
hash `#` binding key, it will just receive all the messages.


> #### Topic exchange
>
> Topic exchange is powerful and can mimic other exchanges.
>
> When queues are bound with `#` (hash) binding key - they will receive
> all the messages, no matter of the routing key - like in `fanout` exchange.
>
> When special characters `*` (star) and `#` (hash) aren't used in bindings, 
> the topic exchange will behave just like a `direct` one.

Putting it all together
-----------------------

We're going to use the `topic` exchange in our logging system. We'll
start off with a working assumption that the routing keys of logs will
have two properties: `<facility>.<severity>`.

The code is almost the same as in the
[previous tutorial](tutorial-four-python.html).

The code for `emit_log_topic.py`

    #!/usr/bin/env python
    import pika
    import sys

    connection = pika.AsyncoreConnection(pika.ConnectionParameters(
            host='127.0.0.1',
            credentials=pika.PlainCredentials('guest', 'guest')))
    channel = connection.channel()

    channel.exchange_declare(exchange='topic_logs',
                             type='topic')

    routing_key = sys.argv[1] if len(sys.argv) > 1 else 'anonymous.info'
    message = ' '.join(sys.argv[2:]) or 'Hello World!'
    channel.basic_publish(exchange='topic_logs',
                          routing_key=routing_key,
                          body=message)
    print " [x] Sent %r:%r" % (routing_key, message)
    connection.close()

The code for `receive_logs_topic.py`:

    #!/usr/bin/env python
    import pika
    import sys

    connection = pika.AsyncoreConnection(pika.ConnectionParameters(
            host='127.0.0.1',
            credentials=pika.PlainCredentials('guest', 'guest')))
    channel = connection.channel()

    channel.exchange_declare(exchange='topic_logs',
                             type='topic')

    result = channel.queue_declare(auto_delete=True)
    queue_name = result.queue

    binding_keys = sys.argv[1:]
    if not binding_keys:
        print >> sys.stderr, "Usage: %s [binding_key]..." % (sys.argv[0],)
        sys.exit(1)

    for binding_key in binding_keys:
        channel.queue_bind(exchange='topic_logs',
                           queue=queue_name,
                           routing_key=binding_key)

    print ' [*] Waiting for logs. To exit press CTRL+C'
    def callback(ch, method, header, body):
        print " [x] %r:%r" % (method.routing_key, body,)

    channel.basic_consume(callback,
                          queue=queue_name,
                          no_ack=True)

    pika.asyncore_loop()

To receive all the logs run:

    python receive_logs_topic.py '#'

To receive all logs from the facility 'kern':

    python receive_logs_topic.py 'kern.*'

Or if you want to hear only about 'critical' logs:

    python receive_logs_topic.py '*.critical'

You can also create multiple bindings:

    python receive_logs_topic.py 'kern.*' '*.critical'


To emit a log with a routing key `kern.critical` type:

    python emit_log_topic.py 'kern.critical' 'A critical kernel error'


Have fun playing with these programs. Note that the code doesn't make
any assumption about the routing or binding keys, you may want play
with more than two routing key parameters.

Some teasers:

 * Will `*` binding catch a message send with an empty routing key?
 * Will `#.*` catch a message with a `..` key? Will it catch a message
   with a single property?
 * How different is `a.*.#` from `a.#`?


> #### Exchange types
>
> In the tutorials we've introduced the exchanges types supported by RabbitMQ:
>
>  * `fanout` is just broadcasting messages.
>  * `direct` can do simple routing.
>  * `topic` can handle more complex routing based on multiple parameters.
>
> There is one last exchange we haven't mentioned - a `headers` exchange.
> It's the most complex exchange, slowest and relatively rarely useful.

</div>
