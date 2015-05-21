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
# RabbitMQ tutorial - Routing SUPPRESS-RHS

## Routing
### (using the Bunny client)

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

In the [previous tutorial](tutorial-three-ruby.html) we built a
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

    :::ruby
    q.bind(exchange_name)

A binding is a relationship between an exchange and a queue. This can
be simply read as: the queue is interested in messages from this
exchange.

Bindings can take an extra `:routing_key` parameter. To avoid the
confusion with a `Bunny::Exchange#publish` parameter we're going to call it a
`binding key`. This is how we could create a binding with a key:

    :::ruby
    q.bind(exchange_name, :routing_key => "black");

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
a `routing key`. That way the receiving script will be able to select
the severity it wants to receive. Let's focus on emitting logs
first.

As always, we need to create an exchange first:

    :::ruby
    ch.direct("logs");

And we're ready to send a message:

    :::ruby
    x = ch.direct("logs")
    x.publish(msg, :routing_key => severity)

To simplify things we will assume that 'severity' can be one of
'info', 'warning', 'error'.


Subscribing
-----------

Receiving messages will work just like in the previous tutorial, with
one exception - we're going to create a new binding for each severity
we're interested in.


    :::ruby
    q = ch.queue("")
    ARGV.each do |severity|
      q.bind("logs", :routing_key => severity)
    end

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


The code for `emit_log_direct.rb` script:

    :::ruby
    #!/usr/bin/env ruby
    # encoding: utf-8

    require "bunny"

    conn = Bunny.new
    conn.start

    ch       = conn.create_channel
    x        = ch.direct("direct_logs")
    severity = ARGV.shift || "info"
    msg      = ARGV.empty? ? "Hello World!" : ARGV.join(" ")

    x.publish(msg, :routing_key => severity)
    puts " [x] Sent '#{msg}'"

    conn.close


The code for `receive_logs_direct.rb`:

    :::ruby
    #!/usr/bin/env ruby
    # encoding: utf-8

    require "bunny"

    if ARGV.empty?
      abort "Usage: #{$0} [info] [warning] [error]"
    end

    conn = Bunny.new
    conn.start

    ch  = conn.create_channel
    x   = ch.direct("direct_logs")
    q   = ch.queue("", :exclusive => true)

    ARGV.each do |severity|
      q.bind(x, :routing_key => severity)
    end

    puts " [*] Waiting for logs. To exit press CTRL+C"

    begin
      q.subscribe(:block => true) do |delivery_info, properties, body|
        puts " [x] #{delivery_info.routing_key}:#{body}"
      end
    rescue Interrupt => _
      ch.close
      conn.close
    end


If you want to save only 'warning' and 'error' (and not 'info') log
messages to a file, just open a console and type:

    :::bash
    $ ruby -rubygems receive_logs_direct.rb warning error > logs_from_rabbit.log

If you'd like to see all the log messages on your screen, open a new
terminal and do:

    :::bash
    $ ruby -rubygems receive_logs_direct.rb info warning error
     [*] Waiting for logs. To exit press CTRL+C

And, for example, to emit an `error` log message just type:

    :::bash
    $ ruby -rubygems emit_log_direct.rb error "Run. Run. Or it will explode."
     [x] Sent 'error':'Run. Run. Or it will explode.'


(Full source code for [(emit_log_direct.rb source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/ruby/emit_log_direct.rb)
and [(receive_logs_direct.rb source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/ruby/receive_logs_direct.rb))

Move on to [tutorial 5](tutorial-five-ruby.html) to find out how to listen
for messages based on a pattern.

