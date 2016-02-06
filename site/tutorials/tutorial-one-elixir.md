# RabbitMQ tutorial - "Hello world!" SUPPRESS-RHS

## Introduction

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

RabbitMQ is a message broker. The principal idea is pretty simple: it accepts
and forwards messages. You can think about it as a post office: when you send
mail to the post box you're pretty sure that Mr. Postman will eventually
deliver the mail to your recipient. Using this metaphor RabbitMQ is a post box,
a post office and a postman.

The major difference between RabbitMQ and the post office is the fact that it
doesn't deal with paper, instead it accepts, stores and forwards binary
blobs of data &#8210; _messages_.

RabbitMQ, and messaging in general, uses some jargon.

 * _Producing_ means nothing more than sending. A program that sends messages
   is a _producer_. We'll draw it like that, with "P":
   <div class="diagram">
     <img src="/img/tutorials/producer.png" height="50" />
     <div class="diagram_source">
     digraph {
       bgcolor=transparent;
       truecolor=true;
       rankdir=LR;
       node [style="filled"];
       //
       P1 [label="P", fillcolor="#00ffff"];
     }
     </div>
   </div>

 * _A queue_ is the name for a mailbox. It lives inside
   RabbitMQ. Although messages flow through RabbitMQ and your
   applications, they can be stored only inside a _queue_. A _queue_
   is not bound by any limits, it can store as many messages as you
   like &#8210; it's essentially an infinite buffer. Many _producers_ can send
   messages that go to one queue, many _consumers_ can try to
   receive data from one _queue_. A queue will be drawn as like that, with
   its name above it:
   <div class="diagram">
     <img src="/img/tutorials/queue.png" height="90" />
     <div class="diagram_source">
     digraph {
       bgcolor=transparent;
       truecolor=true;
       rankdir=LR;
       node [style="filled"];
       //
       subgraph cluster_Q1 {
         label="queue_name";
         color=transparent;
         Q1 [label="{||||}", fillcolor="red", shape="record"];
       };
     }
     </div>
   </div>

 * _Consuming_ has a similar meaning to receiving. A _consumer_ is a program
   that mostly waits to receive messages. On our drawings it's shown with "C":
   <div class="diagram">
     <img src="/img/tutorials/consumer.png" height="50" />
     <div class="diagram_source">
     digraph {
       bgcolor=transparent;
       truecolor=true;
       rankdir=LR;
       node [style="filled"];
       //
       C1 [label="C", fillcolor="#33ccff"];
     }
     </div>
   </div>

Note that the producer, consumer, and broker do not have to reside on
the same machine; indeed in most applications they don't.

Hello World!
------------
### (using the amqp 0.1.4 Elixir library)

Our "Hello world" won't be too complex &#8210; let's send a message, receive
it and print it on the screen. To do so we need two programs: one that
sends a message and one that receives and prints it.


Our overall design will look like:

<div class="diagram">
  <img src="/img/tutorials/python-one-overall.png" height="100" />
  <div class="diagram_source">
digraph G {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      subgraph cluster_Q1 {
        label="hello";
	color=transparent;
        Q1 [label="{||||}", fillcolor="red", shape="record"];
      };
      C1 [label="C", fillcolor="#33ccff"];
      //
      P1 -> Q1 -> C1;
}
</div>
</div>

Producer sends messages to the "hello" queue. The consumer receives
messages from that queue.

> #### RabbitMQ libraries
>
> RabbitMQ speaks AMQP 0.9.1, which is an open, general-purpose
> protocol for messaging. There are a number of clients for RabbitMQ
> in [many different languages](/devtools.html).  In this tutorial
> series we're going to use [amqp](http://github.com/pma/amqp).
>
> To install it you can use the [`hex`](http://hex.pm/) package
> management tool. Let's make a new project.
>
>     :::bash
>     $ mix new rabbitmq_tutorials
>     $ cd rabbitmq_tutorials
>
> Now let's add the dependency on the `amqp` library. Please modify the `applications` and `deps`
> sections of your `mix.exs` file to match below:
>
>     :::elixir
>     def application do
>       [applications: [:logger, :amqp]]
>     end
>     defp deps do
>       [
>         {:amqp, "~> 0.1.4"},
>       ]
>     end
>
> The `application` section of `mix.exs` will ensure that the `amqp` dependency will
> be loaded and started when your project runs. The `deps` section declares which external
> libraries your project needs. We will now use `hex` to retrieve and compile the `amqp` library.
>
>     :::bash
>     $ mix deps.get
>     $ mix deps.compile
>     
> The `amqp` library will now be loaded and available to your project when executed via `mix run`.
>

### Sending

<div class="diagram">
  <img src="/img/tutorials/sending.png" height="100" />
  <div class="diagram_source">
  digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      subgraph cluster_Q1 {
        label="hello";
        color=transparent;
        Q1 [label="{||||}", fillcolor="red", shape="record"];
      };
      //
      P1 -> Q1;
  }
  </div>
</div>

Our first program `send.exs` will send a single message to the queue.
The first thing we need to do is to establish a connection with
RabbitMQ server.

    :::elixir
    {:ok, connection} = AMQP.Connection.open
    {:ok, channel} = AMQP.Channel.open

We're connected now, to a broker on the local machine. By default, [AMQP.Connection.open](http://hexdocs.pm/amqp/AMQP.Connection.html#open/1)
connects to _localhost_. If we wanted to connect to a broker on a different
machine we'd simply specify its name or IP address as the `host: ` option.

Next, before sending we need to make sure the recipient queue
exists. If we send a message to non-existing location, RabbitMQ will
just trash the message. Let's create a queue to which the message will
be delivered, let's name it _hello_:

    :::elixir
    AMQP.Queue.declare(channel, "hello")

At that point we're ready to send a message. Our first message will
just contain a string _Hello World!_ and we want to send it to our
_hello_ queue.

In RabbitMQ a message can never be sent directly to the queue, it always
needs to go through an _exchange_. But let's not get dragged down by the
details &#8210; you can read more about _exchanges_ in [the third part of this
tutorial](tutorial-three-elixir.html). All we need to know now is how to use a default exchange
identified by an empty string. This exchange is special &#8210; it
allows us to specify exactly to which queue the message should go.
The queue name needs to be specified in the `routing_key` parameter:

    :::elixir
    AMQP.Basic.publish(channel, "", "hello", "Hello World!")
    IO.puts " [x] Sent 'Hello World!'"


Before exiting the program we need to make sure the network buffers
were flushed and our message was actually delivered to RabbitMQ. We
can do it by gently closing the connection.

    :::elixir
    AMQP.Connection.close(connection)

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 1Gb free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The <a
> href="http://www.rabbitmq.com/configure.html#config-items">configuration
> file documentation</a> will show you how to set <code>disk_free_limit</code>.


### Receiving

<div class="diagram">
  <img src="/img/tutorials/receiving.png" height="100" />
  <div class="diagram_source">
  digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      subgraph cluster_Q1 {
        label="hello";
	color=transparent;
	Q1 [label="{||||}", fillcolor="red", shape="record"];
      };
      C1 [label="C", fillcolor="#33ccff"];
      //
      Q1 -> C1;
  }
  </div>
</div>


Our second program `receive.exs` will receive messages from the queue and print
them on the screen.

Again, first we need to connect to RabbitMQ server. The code
responsible for connecting to Rabbit is the same as previously.

The next step, just like before, is to make sure that the queue
exists. Creating a queue using `AMQP.Queue.declare` is idempotent &#8210; we
can run the command as many times as we like, and only one will be
created.

    :::elixir
    AMQP.Queue.declare(channel, "hello")

You may ask why we declare the queue again &#8210; we have already declared it
in our previous code. We could avoid that if we were sure
that the queue already exists. For example if `send.exs` program was
run before. But we're not yet sure which
program to run first. In such cases it's a good practice to repeat
declaring the queue in both programs.

> #### Listing queues
>
> You may wish to see what queues RabbitMQ has and how many
> messages are in them. You can do it (as a privileged user) using the `rabbitmqctl` tool:
>
>     :::bash
>     $ sudo rabbitmqctl list_queues
>     Listing queues ...
>     hello    0
>     ...done.
>
>(omit sudo on Windows)


Receiving messages from the queue is more complex. It works by sending Elixir messages to
an Elixir process. Whenever the AMQP library receives a RabbitMQ message, a `{:basic_delivier, payload, metadata}`
Elixir message is sent to the specified Elixir process. We can then handle the payload and metadata
any way we like.
In our case we will print on the screen the contents of the message.

    :::elixir
    defmodule Receive do
      def wait_for_messages do
        receive do
          {:basic_deliver, payload, _meta) ->
            IO.puts " [x] Received #{payload}"
            wait_for_messages
        end
      end
    end


Next, we need to tell RabbitMQ that this particular process should
receive messages from our _hello_ queue:

    :::elixir
    AMQP.Basic.consume(channel,
                       "hello",
                       nil, # consumer process, defaults to self()
                       no_ack: true)

For that command to succeed we must be sure that a queue which we want
to subscribe to exists. Fortunately we're confident about that &#8210; we've
created a queue above &#8210; using `AMQP.Queue.declare`.

The `no_ack` parameter will be described [later on](tutorial-two-elixir.html).

And finally, we enter a never-ending recursion that waits for data and displays messages 
whenever necessary.

    :::elixir
    IO.puts " [*] Waiting for messages. To exit press CTRL+C, CTRL+C"
    Receive.wait_for_messages


### Putting it all together


Full code for `send.exs`:

    :::elixir
    {:ok, connection} = AMQP.Connection.open
    {:ok, channel} = AMQP.Channel.open(connection)
    AMQP.Queue.declare(channel, "hello")
    AMQP.Basic.publish(channel, "", "hello", "Hello World!")
    IO.puts " [x] Sent 'Hello World!'"
    AMQP.Connection.close(connection)

[(send.exs source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/elixir/send.exs)


Full `receive.exs` code:

    :::elixir
    defmodule Receive do
      def wait_for_messages do
        receive do
          {:basic_deliver, payload, _meta} ->
            IO.puts " [x] Received #{payload}"
            wait_for_messages
        end
      end
    end

    {:ok, connection} = AMQP.Connection.open
    {:ok, channel} = AMQP.Channel.open(connection)
    AMQP.Queue.declare(channel, "hello")
    AMQP.Basic.consume(channel, "hello", nil, no_ack: true)
    IO.puts " [*] Waiting for messages. To exist press CTRL+C, CTRL+C"

    Receive.wait_for_messages

[(receive.exs source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/elixir/receive.exs)

Now we can try out our programs in a terminal. First, let's send a
message using our `send.exs` program:

    :::bash
    $ mix run send.exs
     [x] Sent 'Hello World!'

The producer program `send.exs` will stop after every run. Let's receive it:

    :::bash
    $ mix run receive.exs
     [*] Waiting for messages. To exist press CTRL+C, CTRL+C
     [x] Received Hello World!

Hurray! We were able to send our first message through RabbitMQ. As you might
have noticed, the `receive.exs` program doesn't exit. It will stay ready to
receive further messages, and may be interrupted with Ctrl-C, Ctrl-C.

Try to run `send.exs` again in a new terminal.

We've learned how to send and receive a message from a named
queue. It's time to move on to [part 2](tutorial-two-elixir.html)
and build a simple _work queue_.


