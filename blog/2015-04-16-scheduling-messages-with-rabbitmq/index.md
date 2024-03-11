---
title: "Scheduling Messages with RabbitMQ"
tags: ["New Features", ]
authors: [alvaro]
---

For a while people have looked for ways of implementing delayed
messaging with RabbitMQ. So far the accepted solution was to use a mix
of [message TTL](/docs/ttl#per-message-ttl-in-publishers) and
[Dead Letter Exchanges](/docs/dlx) as proposed
by James Carr
[here](http://blog.james-carr.org/2012/03/30/rabbitmq-sending-a-message-to-be-consumed-later/). Since
a while we have thought to offer an out-of-the-box solution for this,
and these past month we had the time to implement it as a
plugin. Enter
[RabbitMQ Delayed Message Plugin](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/).
<!-- truncate -->

The **RabbitMQ Delayed Message Plugin** adds a new exchange type to
RabbitMQ where messages routed by that exchange can be delayed if the
users choses to do so. Let's see how it works.

## Installing the Plugin

To install the plugin go to our
[Community Plugins page](/community-plugins)
and download the corresponding .ez files for your RabbitMQ
installation. Copy the plugin into RabbitMQ's plugin folder and then
enable it by running the following command:

```shell
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

Once the plugin has been enabled, we are ready to start using it.

## Using the Exchange

To use the Delayed Message Exchange you just need to declare an
exchange providing the `"x-delayed-message"` exchange type as follows:

```java
// ... elided code ...
Map<String, Object> args = new HashMap<String, Object>();
args.put("x-delayed-type", "direct");
channel.exchangeDeclare("my-exchange", "x-delayed-message", true, false, args);
// ... more code ...
```

Later on we will explain the meaning of the special argument
`"x-delayed-type"` that we provided in our exchange declaration.

## Delaying Messages

To delay a message a user must publish the message with the special
header called `x-delay` which takes an integer representing the number
of milliseconds the message should be delayed by RabbitMQ. It's worth
noting that here *delay* means: delay message routing to queues or to
other exchanges.
The exchange has no concept of consumers. So once the delay expired,
the plugin will attempt to route the message to the queues matching
the routing rules of the exchange and the once assigned to the
message. Be aware that if the message can't be routed to any queue,
then it will be discarded, as is specified by AMQP with unroutable
messages.
Here's some sample code that adds the `x-delay` header to a message
and publishes to our exchange.

```java
// ... elided code ...
byte[] messageBodyBytes = "delayed payload".getBytes();
AMQP.BasicProperties.Builder props = new AMQP.BasicProperties.Builder();
headers = new HashMap<String, Object>();
headers.put("x-delay", 5000);
props.headers(headers);
channel.basicPublish("my-exchange", "", props.build(), messageBodyBytes);
```

In the previous example, the message will be delayed for five seconds
before it gets routed by the plugin. That example assumes you have
established a connection to RabbitMQ and obtained a channel.

## Flexible Routing

When we declared the exchange above, we provided an `x-delayed-type`
argument set to `direct`. What that does is to tell the exchange what
kind of behaviour we want it to have when routing messages, creating
bindings, and so on. In the example, our exchange will behave like the
*direct* exchange, but we could pass there topic, fanout, or a custom
exchange type provided by some other plugin. By doing this we don't
limit the user on what kind of routing behaviour the delayed message
plugin offers.

## Checking if a Message was Delayed

Once we receive a message on the consumer side, how can we tell if the
message was delayed or not? The plugin will keep the `x-delay` message
header, but will negate the passed value. So if you published a
message with a `5000` milliseconds delay, the consumer receiving said
message will find the `x-delay` header set to `-5000`

## We need feedback

We have released the plugin as experimental to gather feedback from
the community. Please use it and report back to us on the plugin's
[issue page](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/issues)
or on our
[official mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users).

## Learn More

* Webinar: [What's new in RabbitMQ 3.8?](https://content.pivotal.io/webinars/may-23-what-s-new-in-rabbitmq-3-8-webinar?utm_campaign=rabbitmq-blog-3.8-webinar-q319&utm_source=rabbitmq&utm_medium=website)
* Webinar: [10 Things Every Developer Using RabbitMQ Should Know](https://content.pivotal.io/webinars/dec-12-10-things-every-developer-using-rabbitmq-should-know-webinar?utm_campaign=rabbitmq-blog-10-things-q319&utm_source=rabbitmq&utm_medium=website)
