---
title: "Consumer Bias in RabbitMQ 3.3"
tags: ["Performance", "New Features", ]
authors: [simon]
---

I warn you before we start: this is another wordy blog post about performance-ish changes in RabbitMQ 3.3. Still with us? Good.

So in the [previous post](/blog/2014/04/03/an-end-to-synchrony-performance-improvements-in-3-3) I mentioned "a new feature which I'll talk about in a future blog post". That feature is consumer bias.

<!-- truncate -->
Every queue in RabbitMQ is an Erlang process, and like all Erlang processes it responds to messages that are sent to it. These messages might represent AMQP messages being published to the queue, or basic.get requests coming in, or messages telling the queue that a consumer's network connection is now no longer busy so it can receive messages again, and so on. It's messages all the way down.

When the queue is not busy, it just responds to messages as they come in. But as message rates go up, and the queue starts to work harder, we get to a state where the queue is using all the CPU cycles available to it. At this point, inbound messages start to queue up to be handled by the queue! [Flow control](/blog/2012/04/16/rabbitmq-performance-measurements-part-1) prevents them from building up indefinitely - but the fact that they are building up at all can have some consequences for the queue.

Some of the inbound messages help the queue shrink ("this consumer can take messages again", "I'd like to perform a basic.get") while some make the queue grow ("I'd like to publish a new message"). So when the queue is working flat-out, we'd like to give preferential treatment to the messages that help the queue shrink, in order that the queue has a tendency to stay empty rather than grow forever.

And we added such a bias in RabbitMQ 1.7.0.

So why am I talking about it now? That was five years ago!

Unfortunately it turns out that just unconditionally preferring to empty the queue can have nasty side effects - in some circumstances it's possible for the queue to spend 100% of its time delivering messages to consumers, and indeed we had some reports from users who saw exactly that - all consumers would go offline, the queue would build up to some huge size, then the consumers would come back and the queue would refuse to accept a single publish until it became completely empty. That's not a very useful queue.

So we stripped out this bias in RabbitMQ 2.8.3, and went back to the situation where CPU-bound queues can tend to grow indefinitely.

But we still wanted to do better than that. And in 3.3.0 we were finally able to.

Now, rather than having queues unconditionally prefer to shrink, the queues are able to continuously monitor their rate of change in size, and when busy they will prioritise messages that help them to shrink - but only until they are delivering 10% more messages than they accept. So CPU-bound queues will still always accept messages, but will tend over time to become smaller rather than larger. Phew!
