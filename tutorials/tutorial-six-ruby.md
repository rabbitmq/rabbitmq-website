---
title: RabbitMQ tutorial - Remote procedure call (RPC)
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
import T6DiagramFull from '@site/src/components/Tutorials/T6DiagramFull.md';

# RabbitMQ tutorial - Remote procedure call (RPC)

## Remote procedure call (RPC)
### (using the Bunny client)

<TutorialsHelp/>


In the [second tutorial](./tutorial-two-ruby) we learned how to
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
create a simple client class. It's going to expose a method named `call`
which sends an RPC request and blocks until the answer is received:

```ruby
client = FibonacciClient.new('rpc_queue')

puts ' [x] Requesting fib(30)'
response = client.call(30)

puts " [.] Got #{response}"
```

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
receive a response we need to send a 'callback' queue address with the
request. We can use the default queue.
Let's try it:

```ruby
queue = channel.queue('', exclusive: true)
exchange = channel.default_exchange

exchange.publish(message, routing_key: 'rpc_queue', reply_to: queue.name)

# ... then code to read a response message from the callback_queue ...
```

> #### Message properties
>
> The AMQP 0-9-1 protocol predefines a set of 14 properties that go with
> a message. Most of the properties are rarely used, with the exception of
> the following:
>
> * `:persistent`: Marks a message as persistent (with a value of `true`)
>    or transient (`false`). You may remember this property
>    from [the second tutorial](./tutorial-two-ruby).
> * `:content_type`: Used to describe the mime-type of the encoding.
>    For example for the often used JSON encoding it is a good practice
>    to set this property to: `application/json`.
> * `:reply_to`: Commonly used to name a callback queue.
> * `:correlation_id`: Useful to correlate RPC responses with requests.

### Correlation Id

Creating a callback queue for every RPC request is inefficient.
A better way is creating a single callback queue per client.

That raises a new issue, having received a response in that queue it's
not clear to which request the response belongs. That's when the
`:correlation_id` property is used. We're going to set it to a unique
value for every request. Later, when we receive a message in the
callback queue we'll look at this property, and based on that we'll be
able to match a response with a request. If we see an unknown
`:correlation_id` value, we may safely discard the message - it
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

<T6DiagramFull/>

Our RPC will work like this:

  * When the Client starts up, it creates an exclusive
    callback queue.
  * For an RPC request, the Client sends a message with two properties:
    `:reply_to`, which is set to the callback queue and `:correlation_id`,
    which is set to a unique value for every request.
  * The request is sent to an `rpc_queue` queue.
  * The RPC worker (aka: server) is waiting for requests on that queue.
    When a request appears, it does the job and sends a message with the
    result back to the Client, using the queue from the `:reply_to` field.
  * The client waits for data on the callback queue. When a message
    appears, it checks the `:correlation_id` property. If it matches
    the value from the request it returns the response to the
    application.

Putting it all together
-----------------------

The Fibonacci task:

```ruby
def fibonacci(value)
  return value if value.zero? || value == 1

  fibonacci(value - 1) + fibonacci(value - 2)
end
```

We declare our fibonacci function. It assumes only valid positive integer input.
(Don't expect this one to work for big numbers,
and it's probably the slowest recursive implementation possible).


The code for our RPC server [rpc_server.rb](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/rpc_server.rb) looks like this:

```ruby
#!/usr/bin/env ruby
require 'bunny'

class FibonacciServer
  def initialize
    @connection = Bunny.new
    @connection.start
    @channel = @connection.create_channel
  end

  def start(queue_name)
    @queue = channel.queue(queue_name)
    @exchange = channel.default_exchange
    subscribe_to_queue
  end

  def stop
    channel.close
    connection.close
  end

  def loop_forever
    # This loop only exists to keep the main thread
    # alive. Many real world apps won't need this.
    loop { sleep 5 }
  end

  private

  attr_reader :channel, :exchange, :queue, :connection

  def subscribe_to_queue
    queue.subscribe do |_delivery_info, properties, payload|
      result = fibonacci(payload.to_i)

      exchange.publish(
        result.to_s,
        routing_key: properties.reply_to,
        correlation_id: properties.correlation_id
      )
    end
  end

  def fibonacci(value)
    return value if value.zero? || value == 1

    fibonacci(value - 1) + fibonacci(value - 2)
  end
end

begin
  server = FibonacciServer.new

  puts ' [x] Awaiting RPC requests'
  server.start('rpc_queue')
  server.loop_forever
rescue Interrupt => _
  server.stop
end
```



The server code is rather straightforward:

  * As usual we start by establishing the connection, channel and declaring
    the queue.
  * We might want to run more than one server process. In order
    to spread the load equally over multiple servers we need to set the
    `prefetch` setting on channel.
  * We use `Bunny::Queue#subscribe` to consume messages from the queue.
    The consumer will wait for deliveries to be pushed to it, do the work and send the response back.


The code for our RPC client [rpc_client.rb](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/rpc_client.rb):

```ruby
#!/usr/bin/env ruby
require 'bunny'
require 'thread'

class FibonacciClient
  attr_accessor :call_id, :response, :lock, :condition, :connection,
                :channel, :server_queue_name, :reply_queue, :exchange

  def initialize(server_queue_name)
    @connection = Bunny.new(automatically_recover: false)
    @connection.start

    @channel = connection.create_channel
    @exchange = channel.default_exchange
    @server_queue_name = server_queue_name

    setup_reply_queue
  end

  def call(n)
    @call_id = generate_uuid

    exchange.publish(n.to_s,
                     routing_key: server_queue_name,
                     correlation_id: call_id,
                     reply_to: reply_queue.name)

    # wait for the signal to continue the execution
    lock.synchronize { condition.wait(lock) }

    response
  end

  def stop
    channel.close
    connection.close
  end

  private

  def setup_reply_queue
    @lock = Mutex.new
    @condition = ConditionVariable.new
    that = self
    @reply_queue = channel.queue('', exclusive: true)

    reply_queue.subscribe do |_delivery_info, properties, payload|
      if properties[:correlation_id] == that.call_id
        that.response = payload.to_i

        # sends the signal to continue the execution of #call
        that.lock.synchronize { that.condition.signal }
      end
    end
  end

  def generate_uuid
    # very naive but good enough for code examples
    "#{rand}#{rand}#{rand}"
  end
end

client = FibonacciClient.new('rpc_queue')

puts ' [x] Requesting fib(30)'
response = client.call(30)

puts " [.] Got #{response}"

client.stop
```


Now is a good time to take a look at our full example source code (which includes basic exception handling) for
[rpc_client.rb](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/rpc_client.rb) and [rpc_server.rb](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/rpc_server.rb).


Our RPC service is now ready. We can start the server:

```bash
ruby rpc_server.rb
# => [x] Awaiting RPC requests
```

To request a fibonacci number run the client:

```bash
ruby rpc_client.rb
# => [x] Requesting fib(30)
```

The design presented here is not the only possible implementation of a RPC
service, but it has some important advantages:

 * If the RPC server is too slow, you can scale up by just running
   another one. Try running a second `rpc_server.rb` in a new console.
 * On the client side, the RPC requires sending and
   receiving only one message. No synchronous calls like `Bunny::Channel#queue`
   are required. As a result the RPC client needs only one network
   round trip for a single RPC request.

Our code is still pretty simplistic and doesn't try to solve more
complex (but important) problems, like:

 * How should the client react if there are no servers running?
 * Should a client have some kind of timeout for the RPC?
 * If the server malfunctions and raises an exception, should it be
   forwarded to the client?
 * Protecting against invalid incoming messages
   (eg checking bounds, type) before processing.

>
>If you want to experiment, you may find the [management UI](/docs/management) useful for viewing the queues.
>
