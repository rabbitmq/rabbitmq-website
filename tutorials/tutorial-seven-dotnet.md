---
title: RabbitMQ tutorial - Reliable Publishing with Publisher Confirms
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

# RabbitMQ tutorial - Reliable Publishing with Publisher Confirms

## Publisher Confirms

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
via the `CreateChannelOptions` class:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/PublisherConfirms/PublisherConfirms.cs#L11-L15
```

These options must be passed to every channel that you expect to use publisher
confirms.

### Strategy #1: Publishing Messages Individually

Let's start with the simplest approach to publishing with confirms, that is,
publishing a message and awaiting its confirmation:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/PublisherConfirms/PublisherConfirms.cs#L57-L68
```

In the previous example we publish a message as usual and wait for its
confirmation by `await`-ing the task returned by `BasicPublishAsync`. The
`await` returns as soon as the message has been confirmed. If the message is is
nack-ed or returned (meaning the broker could not take care of it for some
reason), the method will throw an exception. The handling of the exception
usually consists in logging an error message and/or retrying to send the
message.


### Strategy #2: Publishing Messages in Batches

To improve upon our previous example, we can publish a batch of messages and
wait for this whole batch to be confirmed. The following example uses a batch
size equal to one-half of the allowed count of outstanding confirmations:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/PublisherConfirms/PublisherConfirms.cs#L90-L102
```

This method is responsible for awaiting the publisher confirmations for  a given batch of messages:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/PublisherConfirms/PublisherConfirms.cs#L108-L125
```


### Strategy #3: Handling Publisher Confirms in the Application

The broker confirms published messages asynchronously, one just needs to
register a callback on the client to be notified of these confirms:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/PublisherConfirms/PublisherConfirms.cs#L193-L216
```

There are 3 callbacks: one for confirmed messages, one for nack-ed messages,
and one for returned messages. All callbacks have a corresponding `EventArgs`
parameter (`ea`). For ack and nack, this contains:

 * delivery tag: the sequence number identifying the confirmed or nack-ed
 message. We will see shortly how to correlate it with the published message.
 * multiple: this is a boolean value. If false, only one message is
 confirmed/nack-ed, if true, all messages with a lower or equal sequence number
 are confirmed/nack-ed.

The sequence number can be obtained with `IChannel#GetNextPublishSequenceNumberAsync` before
publishing:

```csharp
var sequenceNumber = await channel.GetNextPublishSequenceNumberAsync();
await channel.BasicPublishAsync(exchange, queue, properties, body);
```

A performant way to correlate messages with sequence number consists in using a
linked list. Let's assume we want to publish strings because they are easy to
turn into an array of bytes for publishing.

The publishing code now tracks outbound messages with a linked list. We need to
clean this list when confirms arrive and do something like logging a warning
when messages are nack-ed:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/PublisherConfirms/PublisherConfirms.cs#L144-L191
```

The previous sample contains a callback that cleans the linked list when
confirms, nacks or returns arrive. Note this callback handles both single and
multiple confirms. The callback for nack-ed or returns messages issues a
warning. It then re-uses the previous callback to clean the linked list of
outstanding confirms.

To sum up, handling publisher confirms asynchronously usually requires the
following steps:

 * provide a way to correlate the publishing sequence number with a message.
 * register confirm listeners on the channel to be notified when
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
> queue which is polled by a publishing thread. A class like `ConcurrentQueue`
> would be a good candidate to transmit messages between the confirm callbacks
> and a publishing thread.

### Summary

Making sure published messages made it to the broker can be essential in some
applications. Publisher confirms are a RabbitMQ feature that helps to meet this
requirement. Publisher confirms are asynchronous in nature but it is also
possible to handle them synchronously. There is no definitive way to implement
publisher confirms, this usually comes down to the constraints in the
application and in the overall system. Typical techniques are:

* publishing messages individually, waiting for the confirmation via
`await`: simple.
* publishing messages in batch, waiting for the confirmation for
a batch: simple, reasonable throughput, but hard to reason about when something
goes wrong.
* asynchronous handling: best performance and use of resources, good control in
case of error, but can be involved to implement correctly.

## Putting It All Together

The [`PublisherConfirms.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet/PublisherConfirms/PublisherConfirms.cs)
class contains code for the techniques we covered. We can compile it, execute it as-is and
see how they each perform:

```shell
dotnet run
# => 11/6/2024 10:36:22 AM [INFO] publishing 50,000 messages and handling confirms per-message
# => 11/6/2024 10:36:28 AM [INFO] published 50,000 messages individually in 5,699 ms
# => 11/6/2024 10:36:28 AM [INFO] publishing 50,000 messages and handling confirms in batches
# => 11/6/2024 10:36:29 AM [INFO] published 50,000 messages in batch in 1,085 ms
# => 11/6/2024 10:36:29 AM [INFO] publishing 50,000 messages and handling confirms asynchronously
# => 11/6/2024 10:36:29 AM [WARNING] message sequence number 50000 has been basic.return-ed
# => 11/6/2024 10:36:29 AM [WARNING] message sequence number 50000 has been basic.return-ed
# => 11/6/2024 10:36:29 AM [WARNING] message sequence number 50000 has been basic.return-ed
# => ...
# => ...
# => ...
# => 11/6/2024 10:36:30 AM [WARNING] message sequence number 50000 has been basic.return-ed
# => 11/6/2024 10:36:30 AM [INFO] published 50,000 messages and handled confirm asynchronously 878 ms
```

The output on your computer should look similar if the client and the server
sit on the same machine.

Publisher confirms are very network-dependent, so we're better off trying with
a remote node, which is more realistic as clients and servers are usually not
on the same machine in production. `PublisherConfirms.cs` can easily be changed
to use a non-local node:

```csharp
private static Task<IConnection> CreateConnection()
{
    var factory = new ConnectionFactory
    {
        HostName = "remote-host",
        UserName = "remote-host",
        Password = "remote-password"
    };

    return factory.CreateConnectionAsync();
}
```

Remember that batch publishing is simple to implement, but does not make it
easy to know which message(s) could not make it to the broker in case of
negative publisher acknowledgment. Handling publisher confirms asynchronously
is more involved to implement but provide better granularity and better control
over actions to perform when published messages are nack-ed.
