---
title: "Federation plugin preview release"
tags: ["HowTo", "New Features", ]
authors: [simon]
---

**Note: this blog post talks about the federation plugin preview that was released for RabbitMQ 2.5.0. If you're using 2.6.0 or later, federation is part of the main release; get it the same way you would any other plugin.**

Another day, another new plugin release :smiley: Today it's **federation**. If you want to skip this post and just download the plugin, go [here](https://www.rabbitmq.com/releases/plugins/v2.5.0-federation-preview/). The detailed instructions are [here](http://hg.rabbitmq.com/rabbitmq-federation/file/rabbitmq_v2_5_0_preview/README).

The high level goal of federation is to scale out publish / subscribe messaging across WANs and administrative domains.

To do this we introduce the concept of the **federation exchange**. A federation exchange acts like a normal exchange of a given type (it can emulate the routing logic of any installed exchange type), but also knows how to connect to **upstream** exchanges (which might in turn themselves be federation exchanges).

<!-- truncate -->

Queues that bind to a federation exchange receive messages that were published to the upstream exchanges (or the upstreams' upstreams) as well as messages that are published locally. In the event of the network going down, messages will be queued upstream.

So how does this differ from clustering?

|Federation|Clustering|
|--- |--- |
|Brokers are logically separate and may have different owners.|A cluster forms a single logical broker.|
|Brokers can run different versions of RabbitMQ and Erlang.|Nodes must run the same version of RabbitMQ, and frequently Erlang.|
|Brokers can be connected via unreliable WAN links. Communication is via AMQP (optionally secured by SSL).|Brokers must be connected via reliable LAN links. Communication is via Erlang internode messaging.|
|Brokers can be connected in whatever topology you arrange. Links can be one- or two-way.|All nodes connect to all other nodes in both directions.|
|Chooses Availability and Partition Tolerance from the [CAP theorem](http://en.wikipedia.org/wiki/CAP_theorem).|Chooses Consistency and Availability from the CAP theorem.|
|Some exchanges in a broker may be federated while some may be local.|Clustering is all-or-nothing.|
|A client connecting to any broker can only see queues in that broker.|A client connecting to any node can see queues on all nodes.|

The [README](http://hg.rabbitmq.com/rabbitmq-federation/file/rabbitmq_v2_5_0_preview/README) contains detailed instructions for getting things working, but let's look at a simple example.

Suppose we have three brokers, `london`, `paris` and `newyork`. We want a federated `topic` exchange called `stocks` (sorry for the predictable example...). We'll look at how the `london` broker is configured to federate with `paris` and `newyork`.

This is what a simple `rabbitmq.config` file would look like for `london`:
```erlang
[
  {rabbitmq_federation,
   [{exchanges, [[{exchange,     "stocks"},
                  {virtual_host, "/"},
                  {type,         "topic"},
                  {durable,      true},
                  {auto_delete,  false},
                  {internal,     false},
                  {upstream_set, "common-upstreams"}]]},
    {upstream_sets, [{"common-upstreams", [[{connection, "newyork"}],
                                           [{connection, "paris"}]]}
                    ]},
    {connections, [{"newyork", [{host, "newyork.mycompany.com"}]},
                   {"paris",   [{host, "paris.mycompany.com"}, {protocol, "amqps"},
                                {username, "my-user"}, {password, "secret"}]}
                  ]},
    {local_username, "my-user"}
   ]}
].
```

The rabbitmq_federation application has several options configured.

Firstly we configure an exchange to declare. (You can declare federation exchanges via AMQP - see the [README](http://hg.rabbitmq.com/rabbitmq-federation/file/rabbitmq_v2_5_0_preview/README) - but since they can require some coordination to set up it is often more convenient to declare them in the configuration file).

Each federated exchange needs the name of an "upstream set" to work with - a set of upstream machines to connect to - so we set one of those up.

Then we list how to make each connection. There are quite a few options here; see the [README](http://hg.rabbitmq.com/rabbitmq-federation/file/rabbitmq_v2_5_0_preview/README).

Finally we specify the name of the local user that should be considered to be injecting messages from the upstream brokers.

When we bring the `london` broker up, we should see messages in the log like:
```
=INFO REPORT==== 22-Jun-2011::12:16:42 ===
Federation exchange 'stocks' in vhost '/' connected to newyork.mycompany.com:5672:/:stocks

=INFO REPORT==== 22-Jun-2011::12:16:43 ===
Federation exchange 'stocks' in vhost '/' connected to paris.mycompany.com:5671:/:stocks
```

and the exchange will now receive messages published remotely.

In this case we would probably also configure the other brokers to federate with `london`, but this is not the only way you can do things - for example you can connect brokers in a unidirectional ring, or do massive fanout with brokers in a tree structure.

There are of course limitations, since this is a preview release. The worst is that **federation is not compatible with clustering**. You shouldn't use the federation plugin in a cluster. This is the first thing we're going to fix.

There are other limitations too: You can't federate headers exchanges. You can't change which machines you federate with unless you restart the broker. There's no status reporting (except for the messages written to the log). Again these will get fixed.

So - is this useful to you? What do you think? (Reminder: download it [here](https://www.rabbitmq.com/releases/plugins/v2.5.0-federation-preview/)). Let us know in comments here, or on the [rabbitmq-discuss](https://lists.rabbitmq.com/cgi-bin/mailman/listinfo/rabbitmq-discuss) mailing list.
