---
title: RabbitMQ tutorial - Reliable Publishing with Publisher Confirms
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# RabbitMQ tutorial - Reliable Publishing with Publisher Confirms

## Publisher Confirms
### (using the Bunny Ruby Client)

<TutorialsHelp/>

[Publisher confirms](/docs/confirms#publisher-confirms) are a RabbitMQ
extension to implement reliable publishing. When publisher confirms are enabled
on a channel, messages the client publishes are confirmed asynchronously by the
broker, meaning they have been taken care of on the server side.


### Overview

In this tutorial we're going to use publisher confirms to make sure published
messages have safely reached the broker. We will cover several strategies to
using publisher confirms and explain their pros and cons.


### Enabling Publisher Confirms on a Channel

Publisher confirms are a RabbitMQ extension to the AMQP 0.9.1 protocol, so they
are not enabled by default. Publisher confirms are enabled at the channel level
with the `confirm_select` method:

```ruby
channel = connection.create_channel
channel.confirm_select(tracking: true)
```

This method must be called on every channel that you expect to use publisher
confirms. Confirms should be enabled just once, not for every message published.
The `tracking: true` option is available in Bunny 3.0 and later, and
provides automatic publisher confirm tracking and backpressure.

### Strategy #1: Publishing Messages Individually

Let's start with the simplest approach to publishing with confirms, that is,
publishing a message and awaiting its confirmation:

```ruby
def publish_messages_individually(connection)
  channel = connection.create_channel
  queue = channel.queue('', exclusive: true)

  channel.confirm_select(tracking: true)

  start_time = Time.now
  MESSAGE_COUNT.times do |i|
    body = i.to_s
    channel.basic_publish(body, '', queue.name)
    channel.wait_for_confirms
  end
  
  end_time = Time.now

  puts "Published #{MESSAGE_COUNT} messages individually in #{((end_time - start_time) * 1000).to_i} ms"
ensure
  channel.close if channel && channel.open?
end
```

In the previous example we publish a message as usual and wait for its
confirmation with `channel.wait_for_confirms`. The method returns as soon as the
messages have been confirmed. The method returns `true` if all messages were confirmed successfully, and `false` if any message was nack-ed (meaning the broker could not take care of it for some reason). The handling of
a `false` return value usually consists in logging an error message and/or retrying to
send the message.

Different client libraries have different ways to synchronously deal with publisher confirms,
so make sure to read carefully the documentation of the client you are using.

This technique is very straightforward but also has a major drawback:
it **significantly slows down publishing**, as the confirmation of a message blocks the publishing
of all subsequent messages. This approach is not going to deliver throughput of
more than a few hundreds of published messages per second. Nevertheless, this can be
good enough for some applications.

With `tracking: true`, Bunny automatically limits the number of outstanding
unconfirmed messages (defaulting to 1000) and blocks the publishing thread if
this limit is reached. This provides natural backpressure.

> #### Are Publisher Confirms Asynchronous?
>
> We mentioned at the beginning that the broker confirms published
> messages asynchronously but in the first example the code waits
> synchronously until the message is confirmed. The client actually
> receives confirms asynchronously and unblocks the call to `wait_for_confirms`
> accordingly. Think of `wait_for_confirms` as a synchronous helper
> which relies on asynchronous notifications under the hood.

### Strategy #2: Publishing Messages in Batches

To improve upon our previous example, we can publish a batch of messages and
wait for this whole batch to be confirmed. We can use the `basic_publish_batch`
method provided by Bunny 3.0 for optimal throughput:

```ruby
def publish_messages_in_batch(connection)
  channel = connection.create_channel
  queue = channel.queue('', exclusive: true)

  channel.confirm_select(tracking: true)

  batch_size = 1000
  start_time = Time.now

  (0...MESSAGE_COUNT).each_slice(batch_size) do |batch|
    messages = batch.map { |i| i.to_s }
    channel.basic_publish_batch(messages, '', queue.name)
  end
  
  # Wait for any remaining confirmations
  channel.wait_for_confirms
  end_time = Time.now

  puts "Published #{MESSAGE_COUNT} messages in batch in #{((end_time - start_time) * 1000).to_i} ms"
ensure
  channel.close if channel && channel.open?
end
```

Waiting for a batch of messages to be confirmed improves throughput drastically over waiting
for individual messages (up to 3-4x faster). If any message in the batch is nack-ed, `channel.wait_for_confirms` returns `false`.

One drawback is that we do not know exactly what went wrong in case of failure,
so we may have to keep a whole batch in memory to log something meaningful or
to re-publish the messages. And this solution is still synchronous, so it
blocks the publishing of messages.

### Strategy #3: Handling Publisher Confirms Asynchronously

The broker confirms published messages asynchronously, one just needs
to register a callback on the client to be notified of these confirms.
In Bunny, we can pass a block to `confirm_select` to handle these callbacks:

```ruby
channel = connection.create_channel
channel.confirm_select do |delivery_tag, multiple, nack|
  # code when message is confirmed or nack-ed
end
```

There are 3 arguments passed to the block:

 * `delivery_tag`: a number that identifies the confirmed
 or nack-ed message. We will see shortly how to correlate it with the published message.
 * `multiple`: this is a boolean value. If false, only one message is confirmed/nack-ed, if
 true, all messages with a lower or equal sequence number are confirmed/nack-ed.
 * `nack`: this is a boolean value. If true, the message is nack-ed (can be considered lost by the broker).

The sequence number can be obtained with `channel.next_publish_seq_no`
before publishing:

```ruby
seq_no = channel.next_publish_seq_no
channel.basic_publish(body, '', queue.name)
```

A simple way to correlate messages with sequence number consists in using a
hash. Let's assume we want to publish strings because they are easy to turn into
an array of bytes for publishing. Here is a code sample that uses a hash to
correlate the publishing sequence number with the string body of the message:

```ruby
outstanding_confirms = {}
# ... code for confirm callbacks will come later
body = "..."
outstanding_confirms[channel.next_publish_seq_no] = body
channel.basic_publish(body, '', queue.name)
```

The publishing code now tracks outbound messages with a hash. We need
to clean this hash when confirms arrive and do something like logging a warning
when messages are nack-ed:

```ruby
def handle_publish_confirms_asynchronously(connection)
  channel = connection.create_channel
  queue = channel.queue('', exclusive: true)

  outstanding_confirms = {}
  # A mutex is necessary because the confirm callbacks are executed in a separate thread
  confirms_mutex = Mutex.new

  channel.confirm_select do |delivery_tag, multiple, nack|
    confirms_mutex.synchronize do
      if multiple
        outstanding_confirms.reject! { |k, _| k <= delivery_tag }
      else
        outstanding_confirms.delete(delivery_tag)
      end
    end
    if nack
      puts "Message with delivery tag #{delivery_tag} was nacked!"
    end
  end

  start_time = Time.now
  MESSAGE_COUNT.times do |i|
    body = i.to_s
    seq_no = channel.next_publish_seq_no
    confirms_mutex.synchronize do
      outstanding_confirms[seq_no] = body
    end
    channel.basic_publish(body, '', queue.name)
  end

  # Wait for any remaining confirmations
  channel.wait_for_confirms
  end_time = Time.now

  puts "Published #{MESSAGE_COUNT} messages and handled confirms asynchronously in #{((end_time - start_time) * 1000).to_i} ms"
ensure
  channel.close if channel && channel.open?
end
```

The previous sample contains a callback that cleans the hash when
confirms arrive. Note this callback handles both single and multiple
confirms. The callback checks the `nack` flag to issue a warning if the message
was nack-ed.

> #### How to Track Outstanding Confirms?
>
> Our samples use a standard Ruby `Hash` to track outstanding confirms.
> Because confirm callbacks are called in a thread owned by the client library,
> which is different from the publishing thread, we must use a `Mutex` to synchronize
> access to the hash.

To sum up, handling publisher confirms asynchronously usually requires the
following steps:

 * provide a way to correlate the publishing sequence number with a message.
 * register a confirm listener on the channel to be notified when
 publisher acks/nacks arrive to perform the appropriate actions, like
 logging or re-publishing a nack-ed message. The sequence-number-to-message
 correlation mechanism may also require some cleaning during this step.
 * track the publishing sequence number before publishing a message.

> #### Re-publishing nack-ed Messages?
>
> It can be tempting to re-publish a nack-ed message from the corresponding
> callback but this should be avoided, as confirm callbacks are
> dispatched in an I/O thread where channels are not supposed
> to do operations. A better solution consists in enqueuing the message in an in-memory
> queue which is polled by a publishing thread. A class like `Queue` from the `thread`
> standard library would be a good candidate to transmit messages between the confirm callbacks
> and a publishing thread.

### Summary

Making sure published messages made it to the broker can be essential in some
applications. Publisher confirms are a RabbitMQ feature that helps to meet this
requirement.

* publishing messages individually: simple, but lower throughput
* publishing messages in batch: simple, reasonable throughput, but hard to reason about when something
goes wrong
* asynchronous handling: best performance and use of resources, good control in case of error, but
can be involved to implement correctly

Bunny 3.0's `tracking: true` option makes it very easy to use publisher confirms
with automatic backpressure and high throughput when combined with `basic_publish_batch`.

## Putting It All Together

The [`publisher_confirms.rb`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/ruby/publisher_confirms.rb)
script contains code for the techniques we covered. We can execute it as-is and
see how they each perform:

```shell
bundle exec ruby publisher_confirms.rb
```

The output on your computer should look similar if the client and the server
sit on the same machine:

```bash
Published 50000 messages individually in 34929 ms
Published 50000 messages in batch in 1226 ms
Published 50000 messages and handled confirms asynchronously in 4926 ms
```

Publisher confirms are very network-dependent, so we're better off trying with
a remote node, which is more realistic as clients and servers are usually not
on the same machine in production.
`publisher_confirms.rb` can easily be changed to use a non-local node:

```ruby
connection = Bunny.new(hostname: 'remote-host', username: 'remote-user', password: 'remote-password')
connection.start
```

Execute the script again, and wait for the results:

```bash
Published 50000 messages individually in 231541 ms
Published 50000 messages in batch in 7232 ms
Published 50000 messages and handled confirms asynchronously in 6332 ms
```

We see publishing individually now performs terribly. But
with the network between the client and the server, batch publishing and asynchronous handling
now perform similarly, with a small advantage for asynchronous handling of the publisher confirms.

Remember that batch publishing is simple to implement, but does not make it easy to know
which message(s) could not make it to the broker in case of negative publisher acknowledgment.
Handling publisher confirms asynchronously is more involved to implement but provide
better granularity and better control over actions to perform when published messages
are nack-ed.
