---
title: "AMQP 1.0 prototyping"
tags: ["New Features", "Hasenwerkstatt", ]
authors: [mikeb]
---

We have been prototyping support for a new protocol, as is our wont.  This one is called "AMQP 1.0 R0", and it is the new issue from the AMQP working group (of which RabbitMQ, and latterly VMware, are a member). The "R0" indicates that it's the first revision of a recommendation. The specification is incomplete: there are many TODOs, and to a large extent it is unproven. Those two facts are part of what prompted this prototyping.

The prototype code is mirrored at github: [http://github.com/rabbitmq/rabbitmq-amqp1.0](http://github.com/rabbitmq/rabbitmq-amqp1.0). It is built [just the same](/plugin-development) as all our plugins.

The AMQP 1.0 R0 specification differs from the specification of previous versions of AMQP, in that it does not define a broker model; i.e., it doesn't define exchanges queues and bindings, or their equivalents. The protocol is really only about transferring messages from one agent to another, and then agreeing on what the outcome was. That means it is amenable to bolting on to a message broker implementation, among other uses -- the idea is that one can adapt an  existing model to suit.

In our case, the incumbent model is that of AMQP 0-9-1, with some generalisations and extensions (for example, chained bindings). Our target with the prototype is therefore to be able to get something useful done with both 1.0 clients and 0-9-1 clients connected at the same time.

Well, the good news is, we've achieved that. In fact the plugin can be set up to replace Rabbit's usual network listener, and will happily talk to AMQP 0-8, 0-9-1, and 1.0 clients. We did have to do some invention along the way, and there are some parts of the specification that we are conspicuously not implementing. These will be detailed in the README soon.

One large part of the invention is to fill in semantics where the specification is silent. Some of these are detailed in [this client-broker protocol](amqp-broker-prototype.pdf) work we did for the AMQP working group. We're hoping the prototyping will help fill this out some more.

Next week I'll be taking our prototype to the [AMQP 1.0 "Connectathon"](http://www.amqp.org/confluence/display/AMQP/Connectathon+1+%28Dec+2010%29
), where it'll be tested against other implementations of the core protocol (not all of which are open source). Again, this will help to flush out barriers to interoperability in the specification.
