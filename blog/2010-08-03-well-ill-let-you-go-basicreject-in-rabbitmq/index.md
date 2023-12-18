---
title: "Well, I'll let you go ... basic.reject in RabbitMQ"
tags: ["New Features", ]
authors: [mikeb]
---

Support for AMQP's `basic.reject` just landed on default. It's taken this long because we couldn't agree on a single set of semantics that followed the specification, was actually useful, and wasn't too complicated to implement.

<!-- truncate -->

First up, this is what RabbitMQ's `basic.reject` will do: if you supply `requeue=false` it will discard the message (this is in lieu of dead-lettering it, until we have a dead letter feature); if you supply `requeue=true`, it will release it back on to the queue, to be delivered again.

The first is useful from a error handling point of view; if your application cannot process a particular message, you can get rid of it. At the minute, it's semantically the same as just acking the message; but, given a dead-letter mechanism, it will mean unprocessable messages can be picked up elsewhere for diagnosis.

The second, with `requeue=true`, is useful for example if your application needs a "message lock" semantics. In this scenario, a consumer can be delivered a message, then decide not to deal with it after all, and place it back on the queue. Note that RabbitMQ *doesn't take care to stop the same consumer getting the message again* -- see below.

The AMQP 0-9-1 specification says a number of seemingly incompatible things about basic.reject. For a start, it says in the method description

> The client MUST NOT use this method as a means of selecting messages to process.

and in the specification XML (but not in the generated PDF),

> The server MUST NOT deliver the message to the same client within the
context of the current channel. The recommended strategy is to attempt to
deliver the message to an alternative consumer, and if that is not possible,
to move the message to a dead-letter queue. The server MAY use more
sophisticated tracking to hold the message on the queue and redeliver it to
the same client at a later stage.

This seems to suggest that the server has to take care not to deliver the message to the same consumer twice, but consumers are not allowed to rely on this prohibition. This means `basic.reject` could either redeliver the message or dead-letter it, which makes it useless for the "message lock" scenario given above.

So, we have chosen to implement the simplest thing that is useful, which is to re-enqueue the message and treat it as though it were completely new. This means the consumer can receive again a message it has rejected.
