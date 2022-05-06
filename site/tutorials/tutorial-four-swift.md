# RabbitMQ tutorial - Routing SUPPRESS-RHS

## Routing
### (using the [Objective-C client][client])

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

In the [previous tutorial][previous] we built a
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

<pre class="lang-swift">
q.bind(exchange)
</pre>

A binding is a relationship between an exchange and a queue. This can
be simply read as: the queue is interested in messages from this
exchange.

Bindings can take an extra `routingKey` parameter. To avoid the
confusion with an `RMQExchange publish:` parameter we're going to call it a
`binding key`. This is how we could create a binding with a key:

<pre class="lang-swift">
q.bind(exchange, routingKey: "black")
</pre>

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

<div class="diagram">
  <img src="/img/tutorials/direct-exchange.png" height="170" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P [label="P", fillcolor="#00ffff"];
      subgraph cluster_X1 {
        label="type=direct";
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
      X -&gt; Q1 [label="orange"];
      X -&gt; Q2 [label="black"];
      X -&gt; Q2 [label="green"];
      Q1 -&gt; C1;
      Q2 -&gt; C2;
    }
  </div>
</div>

In this setup, we can see the `direct` exchange `X` with two queues bound
to it. The first queue is bound with binding key `orange`, and the second
has two bindings, one with binding key `black` and the other one
with `green`.

In such a setup a message published to the exchange with a routing key
`orange` will be routed to queue `Q1`. Messages with a routing key of `black`
or `green` will go to `Q2`. All other messages will be discarded.


Multiple bindings
-----------------
<div class="diagram">
  <img src="/img/tutorials/direct-exchange-multiple.png" height="170" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P [label="P", fillcolor="#00ffff"];
      subgraph cluster_X1 {
        label="type=direct";
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
      X -&gt; Q1 [label="black"];
      X -&gt; Q2 [label="black"];
      Q1 -&gt; C1;
      Q2 -&gt; C2;
    }
  </div>
</div>

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
a `routing key`. That way the receiving method will be able to select
the severity it wants to receive. Let's focus on emitting logs
first.

As always, we need to create an exchange first:

<pre class="lang-swift">
ch.direct("logs")
</pre>

And we're ready to send a message:

<pre class="lang-swift">
let x = ch.direct("logs")
x.publish(msg.data(using: .utf8), routingKey: severity)
</pre>

To simplify things we will assume that 'severity' can be one of
'info', 'warning', 'error'.


Subscribing
-----------

Receiving messages will work just like in the previous tutorial, with
one exception - we're going to create a new binding for each severity
we're interested in.

<pre class="lang-swift">
let q = ch.queue("", options: .exclusive)
let severities = ["error", "warning", "info"]
for severity: String in severities {
    q.bind(x, routingKey: severity)
}
</pre>

Putting it all together
-----------------------

<div class="diagram">
  <img src="/img/tutorials/python-four.png" height="170" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P [label="P", fillcolor="#00ffff"];
      subgraph cluster_X1 {
        label="type=direct";
    color=transparent;
        X [label="X", fillcolor="#3333CC"];
      };
      subgraph cluster_Q2 {
        label="amqp.gen-S9b...";
    color=transparent;
        Q2 [label="{||||}", fillcolor="red", shape="record"];
      };
      subgraph cluster_Q1 {
        label="amqp.gen-Ag1...";
    color=transparent;
        Q1 [label="{||||}", fillcolor="red", shape="record"];
      };
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P -&gt; X;
      X -&gt; Q1 [label="info"];
      X -&gt; Q1 [label="error"];
      X -&gt; Q1 [label="warning"];
      X -&gt; Q2 [label="error"];
      Q1 -&gt; C2;
      Q2 -&gt; C1;
    }
  </div>
</div>


The code for the `emitLogDirect` method:

<pre class="lang-swift">
func emitLogDirect(_ msg: String, severity: String) {
    let conn = RMQConnection(delegate: RMQConnectionDelegateLogger())
    conn.start()
    let ch = conn.createChannel()
    let x = ch.direct("direct_logs")
    x.publish(msg.data(using: .utf8), routingKey: severity)
    print("Sent '\(msg)'")
    conn.close()
}
</pre>

The code for `receiveLogsDirect`:

<pre class="lang-swift">
func receiveLogsDirect() {
    let conn = RMQConnection(delegate: RMQConnectionDelegateLogger())
    conn.start()
    let ch = conn.createChannel()
    let x = ch.direct("direct_logs")
    let q = ch.queue("", options: .exclusive)
    let severities = ["error", "warning", "info"]
    for severity: String in severities {
        q.bind(x, routingKey: severity)
    }
    print("Waiting for logs.")
    q.subscribe({(_ message: RMQMessage) -> Void in
        print("\(message.routingKey):\(String(data: message.body,
                                       encoding: .utf8))")
    })
}
</pre>

To emit an `error` log message just call:

<pre class="lang-swift">
self.emitLogDirect("Hi there!", severity: "error")
</pre>

([source code][source])

Move on to [tutorial 5][next] to find out how to listen
for messages based on a pattern.

[client]:https://github.com/rabbitmq/rabbitmq-objc-client
[previous]:tutorial-three-swift.html
[next]:tutorial-five-swift.html
[source]:https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/swift/tutorial4/tutorial4/ViewController.swift
