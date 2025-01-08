---
title: RabbitMQ tutorial - Work Queues
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
import T2DiagramToC from '@site/src/components/Tutorials/T2DiagramToC.md';
import T2DiagramPrefetch from '@site/src/components/Tutorials/T2DiagramPrefetch.md';

# RabbitMQ tutorial - Work Queues

## Work Queues
### (using [Bunny](http://rubybunny.info))

<TutorialsHelp/>

<T2DiagramToC/>

In the [first tutorial](./tutorial-one-ruby) we
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
busy - by using the `Kernel#sleep` method. We'll take the number of dots
in the string as its complexity; every dot will account for one second
of "work".  For example, a fake task described by `Hello...`
will take three seconds.

We will slightly modify the _send.rb_ code from our previous example,
to allow arbitrary messages to be sent from the command line. This
program will schedule tasks to our work queue, so let's name it
`new_task.rb`:

```ruby
message = ARGV.empty? ? 'Hello World!' : ARGV.join(' ')

queue.publish(message, persistent: true)
puts " [x] Sent #{message}"
```

Our old _receive.rb_ script also requires some changes: it needs to
fake a second of work for every dot in the message body. It will pop
messages from the queue and perform the task, so let's call it `worker.rb`:

```ruby
queue.subscribe(block: true) do |delivery_info, _properties, body|
  puts " [x] Received #{body}"
  # imitate some work
  sleep body.count('.').to_i
  puts ' [x] Done'
end
```

Note that our fake task simulates execution time.

Run them as in tutorial one:

```bash
# shell 1
ruby worker.rb
```

```bash
# shell 2
ruby new_task.rb
```

Round-robin dispatching
-----------------------

One of the advantages of using a Task Queue is the ability to easily
parallelise work. If we are building up a backlog of work, we can just
add more workers and that way, scale easily.

First, let's try to run two `worker.rb` scripts at the same time. They
will both get messages from the queue, but how exactly? Let's see.

You need three consoles open. Two will run the `worker.rb`
script. These consoles will be our two consumers - C1 and C2.

```bash
# shell 1
ruby worker.rb
# => [*] Waiting for messages. To exit press CTRL+C
```

```bash
# shell 2
ruby worker.rb
# => [*] Waiting for messages. To exit press CTRL+C
```

In the third one we'll publish new tasks. Once you've started
the consumers you can publish a few messages:

```bash
# shell 3
ruby new_task.rb First message.
ruby new_task.rb Second message..
ruby new_task.rb Third message...
ruby new_task.rb Fourth message....
ruby new_task.rb Fifth message.....
```

Let's see what is delivered to our workers:

```bash
# shell 1
ruby worker.rb
# => [*] Waiting for messages. To exit press CTRL+C
# => [x] Received 'First message.'
# => [x] Received 'Third message...'
# => [x] Received 'Fifth message.....'
```

```bash
# shell 2
ruby worker.rb
# => [*] Waiting for messages. To exit press CTRL+C
# => [x] Received 'Second message..'
# => [x] Received 'Fourth message....'
```

By default, RabbitMQ will send each message to the next consumer,
in sequence. On average every consumer will get the same number of
messages. This way of distributing messages is called round-robin. Try
this out with three or more workers.


Message acknowledgment
----------------------

Doing a task can take a few seconds, you may wonder what happens if
a consumer starts a long task and it terminates before it completes.
With our current code, once RabbitMQ delivers a message to the consumer, it
immediately marks it for deletion. In this case, if you terminate a worker,
the message it was just processing is lost. The messages that were dispatched
to this particular worker but were not yet handled are also lost.

But we don't want to lose any tasks. If a worker dies, we'd like the
task to be delivered to another worker.

In order to make sure a message is never lost, RabbitMQ supports
[message _acknowledgments_](/docs/confirms). An ack(nowledgement) is sent back by the
consumer to tell RabbitMQ that a particular message has been received,
processed and that RabbitMQ is free to delete it.

If a consumer dies (its channel is closed, connection is closed, or
TCP connection is lost) without sending an ack, RabbitMQ will
understand that a message wasn't processed fully and will re-queue it.
If there are other consumers online at the same time, it will then quickly redeliver it
to another consumer. That way you can be sure that no message is lost,
even if the workers occasionally die.

A timeout (30 minutes by default) is enforced on consumer delivery acknowledgement.
This helps detect buggy (stuck) consumers that never acknowledge deliveries.
You can increase this timeout as described in
[Delivery Acknowledgement Timeout](/docs/consumers#acknowledgement-timeout).

Message acknowledgments are turned off by default.
It's time to turn them on using the `:manual_ack` option and send a proper acknowledgment
from the worker, once we're done with a task.

```ruby
queue.subscribe(manual_ack: true, block: true) do |delivery_info, _properties, body|
  puts " [x] Received '#{body}'"
  # imitate some work
  sleep body.count('.').to_i
  puts ' [x] Done'
  channel.ack(delivery_info.delivery_tag)
end
```

Using this code, you can ensure that even if you terminate a worker using
CTRL+C while it was processing a message, nothing is lost. Soon
after the worker terminates, all unacknowledged messages are redelivered.

Acknowledgement must be sent on the same channel that received the
delivery. Attempts to acknowledge using a different channel will result
in a channel-level protocol exception. See the [doc guide on confirmations](/docs/confirms)
to learn more.

> #### Forgotten acknowledgment
>
> It's a common mistake to miss the `ack`. It's an easy error,
> but the consequences are serious. Messages will be redelivered
> when your client quits (which may look like random redelivery), but
> RabbitMQ will eat more and more memory as it won't be able to release
> any unacked messages.
>
> In order to debug this kind of mistake you can use `rabbitmqctl`
> to print the `messages_unacknowledged` field:
>
> ```bash
> sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
> ```
>
> On Windows, drop the sudo:
> ```bash
> rabbitmqctl.bat list_queues name messages_ready messages_unacknowledged
> ```


Message durability
------------------

We have learned how to make sure that even if the consumer dies, the
task isn't lost. But our tasks will still be lost if RabbitMQ server stops.

When RabbitMQ quits or crashes it will forget the queues and messages
unless you tell it not to. Two things are required to make sure that
messages aren't lost: we need to mark both the queue and messages as
durable.

First, we need to make sure that the queue will survive a RabbitMQ node restart.
In order to do so, we need to declare it as _durable_:

```ruby
channel.queue('hello', durable: true)
```

Although this command is correct by itself, it won't work in our present
setup. That's because we've already defined a queue called `hello`
which is not durable. RabbitMQ doesn't allow you to redefine an existing queue
with different parameters and will return an error to any program
that tries to do that. But there is a quick workaround - let's declare
a queue with different name, for example `task_queue`:

```ruby
channel.queue('task_queue', durable: true)
```

This `:durable` option change needs to be applied to both the producer
and consumer code.

At this point we're sure that the `task_queue` queue won't be lost
even if RabbitMQ restarts. Now we need to mark our messages as persistent
- by using the `:persistent` option `Bunny::Exchange#publish` takes.

```ruby
exchange.publish(message, persistent: true)
```

> #### Note on message persistence
>
> Marking messages as persistent doesn't fully guarantee that a message
> won't be lost. Although it tells RabbitMQ to save the message to disk,
> there is still a short time window when RabbitMQ has accepted a message and
> hasn't saved it yet. Also, RabbitMQ doesn't do `fsync(2)` for every
> message -- it may be just saved to cache and not really written to the
> disk. The persistence guarantees aren't strong, but it's more than enough
> for our simple task queue. If you need a stronger guarantee then you can use
> [publisher confirms](/docs/confirms).


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

<T2DiagramPrefetch/>

In order to defeat that we can use the `prefetch` method with the
value of `1`. This tells RabbitMQ not to give more than
one message to a worker at a time. Or, in other words, don't dispatch
a new message to a worker until it has processed and acknowledged the
previous one. Instead, it will dispatch it to the next worker that is not still busy.

```ruby
n = 1;
channel.prefetch(n);
```

> #### Note about queue size
>
> If all the workers are busy, your queue can fill up. You will want to keep an
> eye on that, and maybe add more workers, or have some other strategy.

Putting it all together
-----------------------

Final code of our `new_task.rb` class:

```ruby
#!/usr/bin/env ruby
require 'bunny'

connection = Bunny.new(automatically_recover: false)
connection.start

channel = connection.create_channel
queue = channel.queue('task_queue', durable: true)

message = ARGV.empty? ? 'Hello World!' : ARGV.join(' ')

queue.publish(message, persistent: true)
puts " [x] Sent #{message}"

connection.close
```

[(new_task.rb source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/new_task.rb)

And our `worker.rb`:

```ruby
#!/usr/bin/env ruby
require 'bunny'

connection = Bunny.new(automatically_recover: false)
connection.start

channel = connection.create_channel
queue = channel.queue('task_queue', durable: true)

channel.prefetch(1)
puts ' [*] Waiting for messages. To exit press CTRL+C'

begin
  queue.subscribe(manual_ack: true, block: true) do |delivery_info, _properties, body|
    puts " [x] Received '#{body}'"
    # imitate some work
    sleep body.count('.').to_i
    puts ' [x] Done'
    channel.ack(delivery_info.delivery_tag)
  end
rescue Interrupt => _
  connection.close
end
```

[(worker.rb source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/worker.rb)

Using message acknowledgments and `prefetch` you can set up a
work queue. The durability options let the tasks survive even if
RabbitMQ is restarted.

For more information on `Bunny::Channel` methods and message properties, you can browse the
[Bunny API reference](http://reference.rubybunny.info).

Now we can move on to [tutorial 3](./tutorial-three-ruby) and learn how
to deliver the same message to many consumers.
