---
title: RabbitMQ tutorial - Publish/Subscribe
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
import T3DiagramExchange from '@site/src/components/Tutorials/T3DiagramExchange.md';
import T3DiagramBinding from '@site/src/components/Tutorials/T3DiagramBinding.md';
import T3DiagramFull from '@site/src/components/Tutorials/T3DiagramFull.md';

# RabbitMQ tutorial - Publish/Subscribe

## Publish/Subscribe
### (using the amqp Elixir library)

<TutorialsHelp/>

In the [previous tutorial](./tutorial-two-elixir) we created a work
queue. The assumption behind a work queue is that each task is
delivered to exactly one worker. In this part we'll do something
completely different -- we'll deliver a message to multiple
consumers. This pattern is known as "publish/subscribe".

To illustrate the pattern, we're going to build a simple logging
system. It will consist of two programs -- the first will emit log
messages and the second will receive and print them.

In our logging system every running copy of the receiver program will
get the messages. That way we'll be able to run one receiver and
direct the logs to disk; and at the same time we'll be able to run
another receiver and see the logs on the screen.

Essentially, published log messages are going to be broadcast to all
the receivers.

Exchanges
---------

In previous parts of the tutorial we sent and received messages to and
from a queue. Now it's time to introduce the full messaging model in
Rabbit.

Let's quickly go over what we covered in the previous tutorials:

 * A _producer_ is a user application that sends messages.
 * A _queue_ is a buffer that stores messages.
 * A _consumer_ is a user application that receives messages.

The core idea in the messaging model in RabbitMQ is that the producer
never sends any messages directly to a queue. Actually, quite often
the producer doesn't even know if a message will be delivered to any
queue at all.

Instead, the producer can only send messages to an _exchange_. An
exchange is a very simple thing. On one side it receives messages from
producers and the other side it pushes them to queues. The exchange
must know exactly what to do with a message it receives. Should it be
appended to a particular queue? Should it be appended to many queues?
Or should it get discarded. The rules for that are defined by the
_exchange type_.

<T3DiagramExchange/>

There are a few exchange types available: `direct`, `topic`, `headers`
and `fanout`. We'll focus on the last one -- the fanout. Let's create
an exchange of that type, and call it `logs`:

```elixir
AMQP.Exchange.declare(channel, "logs", :fanout)
```

The fanout exchange is very simple. As you can probably guess from the
name, it just broadcasts all the messages it receives to all the
queues it knows. And that's exactly what we need for our logger.


> #### Listing exchanges
>
> To list the exchanges on the server you can run the ever useful `rabbitmqctl`:
>
> ```bash
> sudo rabbitmqctl list_exchanges
> ```
>
> In this list there will be some `amq.*` exchanges and the default (unnamed)
> exchange. These are created by default, but it is unlikely you'll need to
> use them at the moment.


> #### The default exchange
>
> In previous parts of the tutorial we knew nothing about exchanges,
> but still were able to send messages to queues. That was possible
> because we were using a default exchange, which we identify by the empty string (`""`).
>
> Recall how we published a message before:
>
> ```elixir
>     AMQP.Basic.publish(channel, "", "hello", message)
> ```
>
> The [second parameter](http://hexdocs.pm/amqp/AMQP.Basic.html#publish/5) is the name of the exchange.
> The empty string denotes the default or _nameless_ exchange: messages are
> routed to the queue with the name specified by `routing_key`, if it exists.

Now, we can publish to our named exchange instead:

```elixir
AMQP.Basic.publish(channel, "logs", "", message)
```

Temporary queues
----------------

As you may remember previously we were using queues that had
specific names (remember `hello` and `task_queue`?). Being able to name
a queue was crucial for us -- we needed to point the workers to the
same queue.  Giving a queue a name is important when you
want to share the queue between producers and consumers.

But that's not the case for our logger. We want to hear about all
log messages, not just a subset of them. We're
also interested only in currently flowing messages not in the old
ones. To solve that we need two things.

Firstly, whenever we connect to Rabbit we need a fresh, empty queue. To
do it we could create a queue with a random name, or, even better -
let the server choose a random queue name for us. We can do this by not
supplying the `queue` parameter to [`AMQP.Queue.declare`](http://hexdocs.pm/amqp/AMQP.Queue.html#declare/3):

```elixir
{:ok, %{queue: queue_name}} = AMQP.Queue.declare(channel)
```

At this point `queue_name` contains a random queue name. For example
it may look like `amq.gen-JzTY20BRgKO-HjmUJj0wLg`.

Secondly, once the consumer connection is closed, the queue should be
deleted. There's an `exclusive` flag for that:

```elixir
{:ok, %{queue: queue_name}} = AMQP.Queue.declare(channel, "", exclusive: true)
```

You can learn more about the `exclusive` flag and other queue
properties in the [guide on queues](/docs/queues).

Bindings
--------

<T3DiagramBinding/>


We've already created a fanout exchange and a queue. Now we need to
tell the exchange to send messages to our queue. That relationship
between exchange and a queue is called a _binding_.

```elixir
AMQP.Queue.bind(channel, queue_name, "logs")
```

From now on the `logs` exchange will append messages to our queue.

> #### Listing bindings
>
> You can list existing bindings using, you guessed it,
> ```bash
> rabbitmqctl list_bindings
> ```


Putting it all together
-----------------------

<T3DiagramFull/>

The producer program, which emits log messages, doesn't look much
different from the previous tutorial. The most important change is that
we now want to publish messages to our `logs` exchange instead of the
nameless one. We need to supply a `routing_key` when sending, but its
value is ignored for `fanout` exchanges. Here goes the code for
`emit_log.exs` script:

```elixir
{:ok, connection} = AMQP.Connection.open
{:ok, channel} = AMQP.Channel.open(connection)

message =
  case System.argv do
    []    -> "Hello World!"
    words -> Enum.join(words, " ")
  end

AMQP.Exchange.declare(channel, "logs", :fanout)
AMQP.Basic.publish(channel, "logs", "", message)
IO.puts " [x] Sent '#{message}'"

AMQP.Connection.close(connection)
```

[(emit_log.exs source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/main/elixir/emit_log.exs)

As you see, after establishing the connection we declared the
exchange. This step is necessary as publishing to a non-existing
exchange is forbidden.

The messages will be lost if no queue is bound to the exchange yet,
but that's okay for us; if no consumer is listening yet we can safely discard the message.

The code for `receive_logs.exs`:

```elixir
defmodule ReceiveLogs do
  def wait_for_messages(channel) do
    receive do
      {:basic_deliver, payload, _meta} ->
        IO.puts " [x] Received #{payload}"

        wait_for_messages(channel)
    end
  end
end

{:ok, connection} = AMQP.Connection.open
{:ok, channel} = AMQP.Channel.open(connection)

AMQP.Exchange.declare(channel, "logs", :fanout)
{:ok, %{queue: queue_name}} = AMQP.Queue.declare(channel, "", exclusive: true)
AMQP.Queue.bind(channel, queue_name, "logs")
AMQP.Basic.consume(channel, queue_name, nil, no_ack: true)
IO.puts " [*] Waiting for messages. To exit press CTRL+C, CTRL+C"

ReceiveLogs.wait_for_messages(channel)
```

[(receive_logs.exs source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/main/elixir/receive_logs.exs)


We're done. If you want to save logs to a file, just open a console and type:

```bash
mix run receive_logs.exs > logs_from_rabbit.log
```

If you wish to see the logs on your screen, spawn a new terminal and run:

```bash
mix run receive_logs.exs
```

And of course, to emit logs type:

```bash
mix run emit_log.exs
```

Using `rabbitmqctl list_bindings` you can verify that the code actually
creates bindings and queues as we want. With two `receive_logs.exs`
programs running you should see something like:

```bash
sudo rabbitmqctl list_bindings
# => Listing bindings ...
# => logs    exchange        amq.gen-JzTY20BRgKO-HjmUJj0wLg  queue           []
# => logs    exchange        amq.gen-vso0PVvyiRIL2WoV3i48Yg  queue           []
# => ...done.
```

The interpretation of the result is straightforward: data from
exchange `logs` goes to two queues with server-assigned names. And
that's exactly what we intended.

To find out how to listen for a subset of messages, let's move on to
[tutorial 4](./tutorial-four-elixir)

