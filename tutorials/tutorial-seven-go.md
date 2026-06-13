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
### (using the Go RabbitMQ client)

<TutorialsHelp/>

[Publisher confirms](/docs/confirms#publisher-confirms)
are a RabbitMQ extension to implement reliable
publishing. When publisher confirms are enabled on a channel,
messages the client publishes are confirmed asynchronously
by the broker, meaning they have been taken care of on the server
side.


### Overview

In this tutorial we're going to use publisher confirms to make
sure published messages have safely reached the broker. We will
cover several strategies for using publisher confirms and explain
their pros and cons.


### Enabling Publisher Confirms on a Channel

Publisher confirms are a RabbitMQ extension to the AMQP 0.9.1 protocol,
so they are not enabled by default. Publisher confirms are
enabled at the channel level with the `Confirm` method:

```go
ch, err := conn.Channel()
failOnError(err, "Failed to open a channel")
defer ch.Close()
err = ch.Confirm(false)
failOnError(err, "Failed to put channel into confirm mode")
```

This method must be called on every channel that will use publisher confirms,
and only once per channel, not for every published message.

### Strategy #1: Publishing Messages Individually

Let's start with the simplest approach to publishing with confirms,
that is, publishing a message and waiting synchronously for its confirmation.

The examples below assume a long-lived parent context `parentCtx`, for example
one created with `signal.NotifyContext` so that it is canceled when the program
is interrupted, and a `messages` channel (a `chan string`) that delivers the
message bodies to publish. Each wait for a confirmation gets its own timeout
context derived from `parentCtx`:

```go
const confirmTimeout = 5 * time.Second
for msg := range messages {
	confirm, err := ch.PublishWithDeferredConfirmWithContext(parentCtx, "", q.Name, false, false, amqp.Publishing{
		ContentType: "text/plain",
		Body:        []byte(msg),
	})
	failOnError(err, "Failed to publish a message")

	// Wait for the confirmation, with a per-wait timeout
	ctx, cancel := context.WithTimeout(parentCtx, confirmTimeout)
	acked, err := confirm.WaitContext(ctx)
	cancel()
	if err != nil {
		log.Printf("Confirmation wait failed: %v", err)
		return
	}
	if !acked {
		log.Printf("Message %d was nacked by the broker", confirm.DeliveryTag)
	}
}
```

In the previous example we publish a message with `PublishWithDeferredConfirmWithContext`,
which returns a `DeferredConfirmation`. `WaitContext` then blocks until the
confirmation arrives or the timeout context expires. If the message is nacked
(meaning the broker could not take care of it for some reason), `WaitContext`
returns `false`. Handling a nack or a timeout usually means logging an error
and/or retrying to send the message.

Different client libraries handle synchronous publisher confirms differently,
so make sure to carefully read the documentation of the client you are using.

This technique is very straightforward but also has a major drawback:
it **significantly slows down publishing**, as the confirmation of a message blocks the publishing
of all subsequent messages. This approach won't deliver more than a few hundred
published messages per second. Nevertheless, this can be good enough for some
applications.

> #### Are Publisher Confirms Asynchronous?
>
> We mentioned at the beginning that the broker confirms published
> messages asynchronously but in the first example the code waits
> synchronously until the message is confirmed. The client actually
> receives confirms asynchronously and uses them to complete the
> corresponding `DeferredConfirmation` values. Think of `WaitContext`
> as a synchronous helper which relies on these asynchronous
> notifications under the hood.


### Strategy #2: Publishing Messages in Batches

To improve upon our previous example, we can publish a batch
of messages and wait for this whole batch to be confirmed.
The following example uses a batch of 100:

```go
const batchSize = 100
confirms := make([]*amqp.DeferredConfirmation, 0, batchSize)
waitForBatch := func(confirms []*amqp.DeferredConfirmation) bool {
	ctx, cancel := context.WithTimeout(parentCtx, confirmTimeout)
	defer cancel()
	for _, confirm := range confirms {
		acked, err := confirm.WaitContext(ctx)
		if err != nil {
			log.Printf("Batch confirmation wait failed: %v", err)
			return false
		}
		if !acked {
			log.Printf("Message %d in batch was nacked", confirm.DeliveryTag)
		}
	}
	return true
}
for msg := range messages {
	confirm, err := ch.PublishWithDeferredConfirmWithContext(parentCtx, "", q.Name, false, false, amqp.Publishing{
		ContentType: "text/plain",
		Body:        []byte(msg),
	})
	failOnError(err, "Failed to publish a message")
	confirms = append(confirms, confirm)
	if len(confirms) == batchSize {
		// Wait for all confirms for this batch
		if !waitForBatch(confirms) {
			return
		}
		confirms = confirms[:0]
	}
}
// Wait for remaining confirms left over in the final uneven batch
if len(confirms) > 0 && !waitForBatch(confirms) {
	return
}
```

Waiting for a whole batch to be confirmed drastically improves throughput over
waiting for each message individually (up to 20-30 times with a remote RabbitMQ node).
One drawback remains: confirmations do not carry message payloads, so the whole
batch must be kept in memory to log something meaningful or to re-publish failed
messages. And this solution is still synchronous, so it blocks publishing.


### Strategy #3: Handling Publisher Confirms Asynchronously

The broker confirms published messages asynchronously. To be notified of these
confirms, the application only needs to read from the Go channel registered
with `Channel.NotifyPublish`:

```go
const MessageCount = 50000
// A small buffer suffices: the goroutine below drains it continuously
confirms := ch.NotifyPublish(make(chan amqp.Confirmation, 100))
go func() {
	for confirmed := 0; confirmed < MessageCount; confirmed++ {
		select {
		case confirm := <-confirms:
			// ... handle the confirmation using confirm.DeliveryTag and confirm.Ack
		case <-time.After(confirmTimeout):
			log.Printf("No confirmation received within %v, giving up", confirmTimeout)
			return
		case <-parentCtx.Done():
			return
		}
	}
}()
```
The previous example starts a goroutine that reads confirmations from the Go channel
populated by the `Channel.NotifyPublish` method. The `select` statement blocks until
a confirmation arrives, the per-wait timeout expires, or the parent context is
canceled (for example, when the program is interrupted). The publishing code
itself is shown further below.

The loop expects one `Confirmation` per published message. The broker may
confirm several messages at once with a single acknowledgment marked as
`multiple`, but the Go client expands such acknowledgments into one
`Confirmation` per message, so counting them this way is safe.

Every message published on a channel in confirm mode is assigned a sequence
number, and the `DeliveryTag` of a confirmation is exactly this sequence
number. This is what allows a confirmation to be correlated with the message
it confirms. The sequence number can be obtained with
`Channel.GetNextPublishSeqNo()` before publishing:

```go
nextSeqNo := ch.GetNextPublishSeqNo()
// ... Publishing code
```

A simple way to correlate messages with sequence numbers is to use a map.
Let's assume we want to publish strings because they are easy to turn into
byte slices for publishing. Here is a code sample that uses `sync.Map` to
correlate the publishing sequence number with the string body of the message:

```go
var outstandingConfirms sync.Map
// ... Asynchronous listener
body := "..."
outstandingConfirms.Store(ch.GetNextPublishSeqNo(), body)
// ... Publishing code
```

The publishing code now tracks outbound messages with a map. We need
to clean this map when confirms arrive and do something like logging a warning
when messages are nacked:

```go
var outstandingConfirms sync.Map
go func() {
	for confirmed := 0; confirmed < MessageCount; confirmed++ {
		select {
		case confirm := <-confirms:
			// Clean up map when confirms received
			if body, ok := outstandingConfirms.LoadAndDelete(confirm.DeliveryTag); ok && !confirm.Ack {
				log.Printf("Message with body %s was nacked. Delivery tag: %d", body, confirm.DeliveryTag)
			}
		case <-time.After(confirmTimeout):
			log.Printf("No confirmation received within %v, giving up", confirmTimeout)
			return
		case <-parentCtx.Done():
			return
		}
	}
}()
for i := 0; i < MessageCount; i++ {
	msg := strconv.Itoa(i)
	outstandingConfirms.Store(ch.GetNextPublishSeqNo(), msg)
	err := ch.PublishWithContext(parentCtx, "", q.Name, false, false, amqp.Publishing{
		ContentType: "text/plain",
		Body:        []byte(msg),
	})
	failOnError(err, "Failed to publish a message")
}
```

The listener removes a message's entry from the map when its confirmation
arrives — whether the message was confirmed or nacked, the entry must be
removed. For nacked messages, it also retrieves the message body and logs
a warning.

> #### How to Track Outstanding Confirms?
>
> Our samples use a `sync.Map` to track outstanding confirms.
> It supports concurrent access, which is necessary here: the confirmation
> listener runs in its own goroutine, concurrently with the publishing code.

To sum up, handling publisher confirms asynchronously usually requires the
following steps:

 * Provide a way to correlate the publishing sequence number with a message.
 * Start a goroutine that reads from the confirmation channel and reacts to
 acks and nacks, for example by logging nacked messages or re-publishing them.
 This is also where the sequence-number-to-message map gets cleaned up.
 * Record the publishing sequence number before publishing a message.

> #### Re-publishing nacked Messages?
>
> It can be tempting to re-publish a nacked message directly from the
> confirmation goroutine, but this should be avoided. A better solution
> is to send the nacked message through a Go channel to a dedicated
> publishing goroutine. This way the confirmation listener is never
> blocked by publishing operations.

### Summary

Making sure published messages made it to the broker can be essential in some applications.
Publisher confirms are a RabbitMQ feature that helps meet this requirement. Publisher
confirms are asynchronous in nature, but it is also possible to handle them synchronously.
There is no single right way to implement publisher confirms; the choice usually comes
down to the constraints of the application and of the overall system. Typical techniques are:

 * Publishing messages individually, waiting for the confirmation synchronously: simple, but very
 limited throughput.
 * Publishing messages in batch, waiting for the confirmation synchronously for a batch: simple, reasonable
 throughput, but the batch must be kept in memory to act on negative acknowledgments,
 and publishing still blocks while a batch is confirmed.
 * Asynchronous handling: best performance and use of resources, good control in case of error, but
 can be involved to implement correctly.

## Putting It All Together

The [`publisher_confirms.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go/publisher_confirms.go) file
contains code for the techniques we covered. We can execute it as-is and
see how each of them performs:

```bash
go run publisher_confirms.go
```

The output will look like the following:

```bash
Published 50000 messages and handled confirms individually in 12.205157168s
Published 50000 messages and handled confirms in batches in 3.189706048s
Published 50000 messages and handled confirms asynchronously in 2.76314642s
```

The output on your computer should look similar if the
client and the server sit on the same machine. Publishing messages individually
performs poorly, as expected, while batch publishing and asynchronous handling
perform far better.

Publisher confirms are very network-dependent, so we are better off
trying with a remote node, which is more realistic as clients
and servers are usually not on the same machine in production.
`publisher_confirms.go` can easily be changed to use a non-local node:

```go
conn, err := amqp.Dial("amqp://remote-user:remote-password@remote-host:5672/")
```

Remember that batch publishing is simple to implement, but a `DeferredConfirmation`
identifies a message only by its delivery tag, so the batch must be kept in memory
to act on a negative publisher acknowledgment, and publishing blocks while each
batch is confirmed. Handling publisher confirms asynchronously is more involved
to implement but provides better throughput and better control over actions to
perform when published messages are nacked.
