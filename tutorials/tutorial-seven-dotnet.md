---
title: RabbitMQ tutorial - Reliable Publishing with Publisher Confirms
---
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
with the `ConfirmSelectAsync` method:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/rabbitmq-dotnet-client-7.0.0/dotnet/PublisherConfirms/PublisherConfirms.cs#L28
```

This method must be called on every channel that you expect to use publisher
confirms. Confirms should be enabled just once, not for every message
published.

### Strategy #1: Publishing Messages Individually

Let's start with the simplest approach to publishing with confirms, that is,
publishing a message and awaiting its confirmation:

```csharp
while (ThereAreMessagesToPublish())
{
    byte[] body = ...;
    IBasicProperties properties = ...;
    await channel.BasicPublishAsync(exchange, queue, properties, body);
    // uses a 5 second timeout
    await channel.WaitForConfirmsOrDieAsync(TimeSpan.FromSeconds(5));
}
```

In the previous example we publish a message as usual and wait for its
confirmation with the `IChannel#WaitForConfirmsOrDieAsync(TimeSpan)` method.
The method returns as soon as the message has been confirmed. If the message is
not confirmed within the timeout or if it is nack-ed (meaning the broker could
not take care of it for some reason), the method will throw an exception. The
handling of the exception usually consists in logging an error message and/or
retrying to send the message.

Different client libraries have different ways to synchronously deal with
publisher confirms, so make sure to read carefully the documentation of the
client you are using.

In version 7 of the `RabbitMQ.Client` library, `WaitForConfirmsOrDieAsync` uses
`async`/`await` so this method is about as fast as asynchronously handling
confirmations yourself. Note, however, that every published message creates a
task completion source that is only awaited when `WaitForConfirmsOrDieAsync` is
called, so ensure that you call this method at appropriate times.


### Strategy #2: Publishing Messages in Batches

To improve upon our previous example, we can publish a batch of messages and
wait for this whole batch to be confirmed. The following example uses a batch
of 100:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/rabbitmq-dotnet-client-7.0.0/dotnet/PublisherConfirms/PublisherConfirms.cs#L67-L91
```


### Strategy #3: Handling Publisher Confirms in the Application

The broker confirms published messages asynchronously, one just needs to
register a callback on the client to be notified of these confirms:

```csharp
var channel = await connection.CreateModelAsync();
await channel.ConfirmSelectAsync();
channel.BasicAcks += (sender, ea) =>
{
  // code when message is confirmed
};
channel.BasicNacks += (sender, ea) =>
{
  //code when message is nack-ed
};
```

There are 2 callbacks: one for confirmed messages and one for nack-ed messages
(messages that can be considered lost by the broker). Both callbacks have a
corresponding `EventArgs` parameter (`ea`) containing a:

 * delivery tag: the sequence number identifying the confirmed or nack-ed
 message. We will see shortly how to correlate it with the published message.
 * multiple: this is a boolean value. If false, only one message is
 confirmed/nack-ed, if true, all messages with a lower or equal sequence number
 are confirmed/nack-ed.

The sequence number can be obtained with `IChannel#NextPublishSeqNo` before
publishing:

```csharp
var sequenceNumber = channel.NextPublishSeqNo;
await channel.BasicPublishAsync(exchange, queue, properties, body);
```

A performant way to correlate messages with sequence number consists in using a
linked list. Let's assume we want to publish strings because they are easy to
turn into an array of bytes for publishing.

The publishing code now tracks outbound messages with a linked list. We need to
clean this list when confirms arrive and do something like logging a warning
when messages are nack-ed:

```csharp reference
https://github.com/rabbitmq/rabbitmq-tutorials/blob/rabbitmq-dotnet-client-7.0.0/dotnet/PublisherConfirms/PublisherConfirms.cs#L118-L156
```

The previous sample contains a callback that cleans the linked list when
confirms arrive. Note this callback handles both single and multiple confirms.
This callback is used when confirms arrive (`IChannel#BasicAcks`). The callback
for nack-ed messages issues a warning. It then re-uses the previous callback to
clean the linked list of outstanding confirms.

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
`WaitForConfirmsOrDieAsync`: simple.
* publishing messages in batch, waiting for the confirmation for
a batch: simple, reasonable throughput, but hard to reason about when something
goes wrong.
* asynchronous handling: best performance and use of resources, good control in
case of error, but can be involved to implement correctly.

## Putting It All Together

The [`PublisherConfirms.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/rabbitmq-dotnet-client-7.0.0/dotnet/PublisherConfirms/PublisherConfirms.cs)
class contains code for the techniques we covered. We can compile it, execute it as-is and
see how they each perform:

```PowerShell
> dotnet run .\PublisherConfirms.csproj
9/9/2024 11:07:11 AM [INFO] publishing 50,000 messages individually and handling confirms all at once
9/9/2024 11:07:12 AM [INFO] published 50,000 messages individually in 796 ms
9/9/2024 11:07:12 AM [INFO] publishing 50,000 messages and handling confirms in batches
9/9/2024 11:07:13 AM [INFO] published 50,000 messages in batch in 1,034 ms
9/9/2024 11:07:13 AM [INFO] publishing 50,000 messages and handling confirms asynchronously
9/9/2024 11:07:14 AM [INFO] published 50,000 messages and handled confirm asynchronously 763 ms
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
