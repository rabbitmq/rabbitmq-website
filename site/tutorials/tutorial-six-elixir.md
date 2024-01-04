<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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
# RabbitMQ tutorial - Remote procedure call (RPC) SUPPRESS-RHS

## Remote procedure call (RPC)
### (using the amqp Elixir library)

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>


In the [second tutorial](tutorial-two-elixir.html) we learned how to
use _Work Queues_ to distribute time-consuming tasks among multiple
workers.

But what if we need to run a function on a remote computer and wait for
the result?  Well, that's a different story. This pattern is commonly
known as _Remote Procedure Call_ or _RPC_.

In this tutorial we're going to use RabbitMQ to build an RPC system: a
client and a scalable RPC server. As we don't have any time-consuming
tasks that are worth distributing, we're going to create a dummy RPC
service that returns Fibonacci numbers.

### Client interface

To illustrate how an RPC service could be used we're going to
create a simple client module. It's going to contain a function named `call`
which sends an RPC request and blocks until the answer is received:

<pre class="lang-elixir">
result = FibonacciRpcClient.call(4)
IO.puts("fib(4) is #{result}")
</pre>

> #### A note on RPC
>
> Although RPC is a pretty common pattern in computing, it's often criticised.
> The problems arise when a programmer is not aware
> whether a function call is local or if it's a slow RPC. Confusions
> like that result in an unpredictable system and adds unnecessary
> complexity to debugging. Instead of simplifying software, misused RPC
> can result in unmaintainable spaghetti code.
>
> Bearing that in mind, consider the following advice:
>
>  * Make sure it's obvious which function call is local and which is remote.
>  * Document your system. Make the dependencies between components clear.
>  * Handle error cases. How should the client react when the RPC server is
>    down for a long time?
>
> When in doubt avoid RPC. If you can, you should use an asynchronous
> pipeline - instead of RPC-like blocking, results are asynchronously
> pushed to a next computation stage.


### Callback queue

In general doing RPC over RabbitMQ is easy. A client sends a request
message and a server replies with a response message. In order to
receive a response the client needs to send a 'callback' queue address with the
request. Let's try it:

<pre class="lang-elixir">
{:ok, %{queue: callback_queue}} = AMQP.Queue.declare(channel,
                                                     "",
                                                     exclusive: true)

AMQP.Basic.publish(channel,
                   "",
                   "rpc_queue",
                   request,
                   reply_to: callback_queue)
# ... and some code to read a response message from the callback_queue ...
</pre>


> #### Message properties
>
> The AMQP 0-9-1 protocol predefines a set of 14 properties that go with
> a message. Most of the properties are rarely used, with the exception of
> the following:
>
> * `persistent`: Marks a message as persistent (with a value of `true`)
>    or transient (any other value). You may remember this property
>    from [the second tutorial](tutorial-two-elixir.html).
> * `content_type`: Used to describe the mime-type of the encoding.
>    For example for the often used JSON encoding it is a good practice
>    to set this property to: `application/json`.
> * `reply_to`: Commonly used to name a callback queue.
> * `correlation_id`: Useful to correlate RPC responses with requests.


### Correlation id

In the method presented above we suggest creating a callback queue for
every RPC request. That's pretty inefficient, but fortunately there is
a better way - let's create a single callback queue per client.

That raises a new issue, having received a response in that queue it's
not clear to which request the response belongs. That's when the
`correlation_id` property is used. We're going to set it to a unique
value for every request. Later, when we receive a message in the
callback queue we'll look at this property, and based on that we'll be
able to match a response with a request. If we see an unknown
`correlation_id` value, we may safely discard the message - it
doesn't belong to our requests.

You may ask, why should we ignore unknown messages in the callback
queue, rather than failing with an error? It's due to a possibility of
a race condition on the server side. Although unlikely, it is possible
that the RPC server will die just after sending us the answer, but
before sending an acknowledgment message for the request. If that
happens, the restarted RPC server will process the request again.
That's why on the client we must handle the duplicate responses
gracefully, and the RPC should ideally be idempotent.

### Summary

<div class="diagram">
  <img src="../img/tutorials/python-six.png" height="200"  alt="Summary illustration, which is described in the following bullet points." />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      subgraph cluster_C {
        label="Client";
	color=transparent;
        C [label="C", fillcolor="#00ffff"];
      };
      subgraph cluster_XXXa {
	color=transparent;
      subgraph cluster_Note {
	color=transparent;
        N [label="Request\nreply_to=amqp.gen-Xa2...\ncorrelation_id=abc",
	   fontsize=12,
	   shape=note];
      };
      subgraph cluster_Reply {
	color=transparent;
        R [label="Reply\ncorrelation_id=abc",
	   fontsize=12,
	   shape=note];
      };
      };
      subgraph cluster_XXXb {
	color=transparent;
      subgraph cluster_RPC {
        label="rpc_queue";
	color=transparent;
        RPC [label="{&lt;s&gt;||||&lt;e&gt;}", fillcolor="red", shape="record"];
      };
      subgraph cluster_REPLY {
        label="reply_to=amq.gen-Xa2...";
	color=transparent;
        REPLY [label="{&lt;s&gt;||||&lt;e&gt;}", fillcolor="red", shape="record"];
      };
      };
      subgraph cluster_W {
        label="Server";
	color=transparent;
        W [label="S", fillcolor="#00ffff"];
      };
      //
      C -&gt; N;
      N -&gt; RPC:s;
      RPC:e -&gt; W;
      W -&gt; REPLY:e;
      REPLY:s -&gt; R;
      R -&gt; C;
    }
  </div>
</div>

Our RPC will work like this:

  * When the Client starts up, it creates an anonymous exclusive
    callback queue.
  * For an RPC request, the Client sends a message with two properties:
    `reply_to`, which is set to the callback queue and `correlation_id`,
    which is set to a unique value for every request.
  * The request is sent to an `rpc_queue` queue.
  * The RPC worker (aka: server) is waiting for requests on that queue.
    When a request appears, it does the job and sends a message with the
    result back to the Client, using the queue from the `reply_to` field.
  * The client waits for data on the callback queue. When a message
    appears, it checks the `correlation_id` property. If it matches
    the value from the request it returns the response to the
    application.

Putting it all together
-----------------------


The code for `rpc_server.exs`:

<pre class="lang-elixir">
defmodule FibServer do
  def fib(0), do: 0
  def fib(1), do: 1
  def fib(n) when n > 1, do: fib(n-1) + fib(n-2)

  def wait_for_messages(channel) do
    receive do
      {:basic_deliver, payload, meta} ->
        {n, _} = Integer.parse(payload)
        IO.puts " [.] fib(#{n})"
        response = fib(n)

        AMQP.Basic.publish(channel,
                           "",
                           meta.reply_to,
                           "#{response}",
                           correlation_id: meta.correlation_id)
        AMQP.Basic.ack(channel, meta.delivery_tag)

        wait_for_messages(channel)
    end
  end
end

{:ok, connection} = AMQP.Connection.open
{:ok, channel} = AMQP.Channel.open(connection)

AMQP.Queue.declare(channel, "rpc_queue")
AMQP.Basic.qos(channel, prefetch_count: 1)
AMQP.Basic.consume(channel, "rpc_queue")
IO.puts " [x] Awaiting RPC requests"

FibServer.wait_for_messages(channel)
</pre>

The server code is rather straightforward:

  * (2-4) We declare our fibonacci function.
    (Don't expect this one to work for big numbers,
    it's probably the slowest recursive implementation possible).
  * (25-28) As usual we start by establishing the connection and declaring
    the queue.
  * (29) We might want to run more than one server process. In order
    to spread the load equally over multiple servers we need to set the
    `prefetch_count` setting.
  * (30) We wait for messages from `AMQP.Basic.consume`,
    the core of the RPC server. It's executed when the request
    is received. It does the work and sends the response back.


The code for `rpc_client.exs`:

<pre class="lang-elixir">
defmodule FibonacciRpcClient do
  def wait_for_messages(_channel, correlation_id) do
    receive do
      {:basic_deliver, payload, %{correlation_id: ^correlation_id}} ->
        {n, _} = Integer.parse(payload)
        n
    end
  end
  def call(n) do
    {:ok, connection} = AMQP.Connection.open
    {:ok, channel} = AMQP.Channel.open(connection)

    {:ok, %{queue: queue_name}} = AMQP.Queue.declare(channel,
                                                     "",
                                                     exclusive: true)
    AMQP.Basic.consume(channel, queue_name, nil, no_ack: true)
    correlation_id =
      :erlang.unique_integer
      |> :erlang.integer_to_binary
      |> Base.encode64

    request = to_string(n)
    AMQP.Basic.publish(channel,
                       "",
                       "rpc_queue",
                       request,
                       reply_to: queue_name,
                       correlation_id: correlation_id)

    FibonacciRpcClient.wait_for_messages(channel, correlation_id)
  end
end

num =
  case System.argv do
    []    -> 30
    param ->
      {x, _} =
        param
        |> Enum.join(" ")
        |> Integer.parse
      x
  end

IO.puts " [x] Requesting fib(#{num})"
response = FibonacciRpcClient.call(num)
IO.puts " [.] Got #{response}"
</pre>


The client code is slightly more involved:

  * (4) The 'wait_for_messages' function executed on every response is
    doing a very simple job, for every response message it checks if
    the `correlation_id` is the one we're looking for. If so, it returns
    with that value and stops listening for additional messages.
  * (9) Next, we define our main `call` method - it does the actual
    RPC request.
  * (10-13) We establish a connection, channel and declare an
    exclusive 'callback' queue for replies.
  * (16) We subscribe to the 'callback' queue, so that
    we can receive RPC responses.
  * (17) In this function, first we generate a unique `correlation_id`
    number - the 'wait_for_messages' function will
    use this value to catch the appropriate response.
  * (23) Next, we publish the request message, with two properties:
    `reply_to` and `correlation_id`.
  * (30) At this point we can sit back and wait until the proper
    response arrives.

Our RPC service is now ready. We can start the server:

<pre class="lang-bash">
mix run rpc_server.exs
# => [x] Awaiting RPC requests
</pre>

To request a fibonacci number run the client:

<pre class="lang-bash">
mix run rpc_client.exs
# => [x] Requesting fib(30)
</pre>

The presented design is not the only possible implementation of a RPC
service, but it has some important advantages:

 * If the RPC server is too slow, you can scale up by just running
   another one. Try running a second `rpc_server.exs` in a new console.
 * On the client side, the RPC requires sending and
   receiving only one message. No synchronous calls like `queue_declare`
   are required. As a result the RPC client needs only one network
   round trip for a single RPC request.

Our code is still pretty simplistic and doesn't try to solve more
complex (but important) problems, like:

 * How should the client react if there are no servers running?
 * Should a client have some kind of timeout for the RPC?
 * If the server malfunctions and raises an exception, should it be
   forwarded to the client?
 * Protecting against invalid incoming messages
   (eg checking bounds) before processing.

>
>If you want to experiment, you may find the [management UI](../management.html) useful for viewing the queues.
>

(Full source code for [rpc_client.exs](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/elixir/rpc_client.exs) and [rpc_server.exs](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/elixir/rpc_server.exs))
