---
title: "Federated queues in 3.2.0"
tags: ["New Features", "HowTo", ]
authors: [simon]
---

So we added support for federated queues in RabbitMQ 3.2.0. This blog post explains what they're for and how to use them.

<!-- truncate -->

(And apologies if this looks like a wall of text by the way, my drawing skills are not great. More artistically-inclined members of the RabbitMQ team are working on some beautiful diagrams...)

**What are they for?**

The idea behind queue federation is to deal with load-balancing messages across queues on different brokers. If you have a set of queues that federate with each other, then producers can publish into them and consumers can consume from them without (much) regard to location.

So whereas federated exchanges are really motivated by pub-sub scenarios (consumers everywhere will be able to see messages that were published anywhere), federated queues are useful for work-queuing scenarios (a consumer somewhere will be able to see messages that were published anywhere). Publishers can publish anywhere, and the federation mechanism will automatically move messages to where they can be consumed, but a message should only be in one place at any given time.

This is a different approach to load-balancing from how people normally talk about the term by the way. Normally we think of load-balancing "before the fact" - imagine a publisher picking one of many queues at random to publish to, with each queue having some local consumers. The trouble with this approach is that if one queue's consumers fall behind or stop working altogether then there is nothing to smooth things out. Queue federation load-balances "after the fact", moving messages around to where they can be handled.

Federation links have improved in performance since 3.1.x (roughly twice as fast in `no-ack` [mode](/docs/federation-reference), and 50% faster in `on-confirm` mode). But we still want to avoid moving messages if we can avoid it, so queue federation only moves messages from queue A to queue B when B has consumers but no messages and when A has more messages than its consumers can (immediately) deal with. An ideal user of queue federation would balance publishing and consuming at each individual queue, and thus leave federation with nothing to do :smiley: Until some consumer falls behind, at least...

**And what are they not for?**

Now that both exchanges and queues can be federated, it's tempting to think "well, I can just federate everything and then I'll have a big virtual broker, like a cluster but with partition tolerance". Of course, as our old friend the CAP theorem suggests, it's not as simple as that; if you gain (P)artition-tolerance you have to lose something else, and in federation's case that's (C)onsistency. Federated queues will only ever contain a given message in one location; there's no mirroring. Think RAID-0 rather than [HA](/docs/3.13/ha)'s RAID-1.

Of course you can connect clusters together with federation if you want RAID-10...

**So how do you federate a queue?**

That's simple! Define one or more upstreams, just as you would to federate an exchange, then define a policy that matches your queue, and defines a `federation-upstream-set` or `federation-upstream`, again just as you would for an exchange. See [the documentation](/docs/federation) for more details, but really it works just like federating an exchange.
