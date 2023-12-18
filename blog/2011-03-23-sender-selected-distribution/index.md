---
title: "Sender-selected distribution"
tags: ["New Features", ]
authors: [emile]
---

RabbitMQ 2.4.0 introduced an extension that allows publishers to specify multiple routing keys in the CC and BCC message headers. The BCC header is removed from the message prior to delivery. Direct and topic exchanges are the only standard exchange types that make use of routing keys, therefore the routing logic of this feature only works with these exchange types.

<!-- truncate -->

## Why would I want this?

### 1. Custom routing logic

You would normally resort to an external or custom exchange when routing rules are too complex to be expressed with standard exchanges. CC/BCC headers allow a peer to implement potentially complex routing rules by populating these headers with the matching routes.

Imagine a RabbitMQ broker receiving Java Log4J messages and that we are interested in messages at level SEVERE that arrive outside office-hours. This assumes an AMQP Log4J handler that forwards log messages to a RabbitMQ exchange and a client (perhaps connected to a pager) that retrieves them from a queue. Let us assume that the queue is titled "out-of-hours-emergencies" and declared by the pager client.

The problem is how to selectively route messages satisfying these criteria (severity and time). The Java logging API has sufficient sophistication to perform some selective processing and filtering in the log handler before the messages reach the broker, so the problem could potentially be solved upstream from the broker in simple cases. For the purposes of this example we'll want to manage the routing across all log producers centrally in the  broker.

The log handler could decorate the AMQP messages with information about the log events by placing information in the headers. Messages could then be routed according to those headers with the built-in amq.headers exchange. So the first constraint could potentially be met without resorting to additional features, provided that the event severity appears in a message header. The second constraint of our requirement (only messages received outside office-hours) cannot be satisfied with a built-in exchange in the same way. The built-in exchange types can only perform routing based on the contents of a message, not when it arrives. Even if the messages contained a timestamp, built-in exchanges have no way of matching by inequality.

We can solve this problem by relying on a smart consumer that populates the BCC headers before republishing received messages. The relevant criteria in our example would be "out-of-hours-emergencies", so the smart consumer adds this to the BCC header before republishing severe log messages that arrive out of hours. It could use any information at its disposal to make that determination, including date, time, message contents or information from other sources. Any number of criteria can selectively be added to the BCC header in the same way. A queue with the same name will receive all messages from our smart  consumer that republished messages with this string in the BCC header. At this point the pager client retrieves messages from the "out-of-hours-emergencies" queue and pages an operator.

This technique can route messages that are encoded in a domain-specific format. A smart peer with knowledge of the format could unpack the message, populate the BCC header with a relevant field and republish. The smart peer is acting in a similar way as an [external exchange](http://hg.rabbitmq.com/rabbitmq-external-exchange/).

### 2. Confidential routing

This is useful in cases where the routing key is a secure token which producers and consumers agree beforehand. Wild-cards make topic exchanges useless in this scenario. Messages published with a routing key set to "topsecret.eyesonly" can be obtained by any consumer that binds with a wild-card "#".

Producers can send messages to arbitrary subsets of consumers by populating the BCC header with the routing keys of the selected recipients. The recipients will have no way of learning the identities of other recipients, because the BCC header is removed from the message prior to delivery.

Routing information may still leak in other ways, such as the Management &amp; Monitoring plugin or the rabbitmqctl administration utility. These will need appropriate protection.

## Can't AMQP do this already?

While it's not possible to remove headers, it is possible to obtain some comparable effects using only standard AMQP features.

*  Producers can send multiple messages, each with a different routing key. This wastes network bandwidth and broker resources, because the broker cannot optimise the storage of the duplicate messages.
*  Producers can declare a temporary exchange, with a temporary binding for each intended recipient. This a great deal of effort that needs to be repeated each time the set of recipients changes.

## How do I use this?

Be sure to use RabbitMQ version 2.4.0 or later. Any AMQP client can be used. Set the CC or BCC headers to the list of routing keys. The header value must be an AMQP array type, even if it only contains a single value. The message will be routed to all destinations according to the combined routings keys in the CC and BCC headers, as well as the basic.publish method ("routingkey1", "routingkey2" and "routingkey3" in this example).

Java sample code:

```java
BasicProperties props  = new BasicProperties();
Map<String, Object> headers = new HashMap<String, Object>();
List<String> ccList = new ArrayList<String>();
ccList.add("routingkey2");
ccList.add("routingkey3");
headers.put("CC", ccList);
props.setHeaders(headers);
channel.basicPublish(exchange, "routingkey1", props, payload);
```

## What are the interoperability implications?

Any AMQP client can make use of this feature. Producers require nothing more than the ability to set headers in messages.

The use of any RabbitMQ-specific extensions makes it harder to swap RabbitMQ for a different AMQP broker - sender-selected distribution is no exception.

If your application already makes use of headers named CC or BCC then you should use different keys or contact the RabbitMQ team for assistance.
