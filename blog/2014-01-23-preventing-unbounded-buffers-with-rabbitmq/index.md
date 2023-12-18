---
title: "Preventing Unbounded Buffers with RabbitMQ"
tags: ["New Features", "HowTo", ]
authors: [alvaro]
---

Different services in our architecture will require a certain amount of resources for operation, whether these resources are CPUs, RAM or disk space, we need to make sure we have enough of them. If we don't put limits on how many resources our servers are going to use, at some point we will be in trouble. This happens with your database if it runs out of file system space, your media storage if you fill it with images and never move them somewhere else, or your JVM if it runs out of RAM. Even your back up solution will be a problem if you don't have a policy for expiring/deleting old backups. Well, queues are no exception. We have to make sure that our application won't allow the queues to grow for ever. We need to have some strategy in place to delete/evict/migrate old messages.

<!-- truncate -->

## Why might this problem happen?

There are many reasons why our queues might be filling up with messages. Reason number one would be that our data producers are outpacing our consumers. Luckily the solution is easy: add more consumers.

What happens if our application still can't handle the load? For example your consumers take too long to process each message, and you can't add more consumers since you ran out of servers. Then your queues will start filling up with messages. RabbitMQ has been optimized for fast message delivery with queues that have [as few messages as possible](/blog/2011/09/24/sizing-your-rabbits). While RabbitMQ comes with various **[flow control mechanisms](/docs/memory)**, of course you probably want a way to prevent to get into a situation were flow-control gets activated. Let's see how RabbitMQ can help us there.

## Per-Queue Message TTL

RabbitMQ allows to set per-queue message TTLs that will make the server not deliver messages that have lived in the queue longer than the defined per-queue TTL. Moreover, the server will attempt to expire or dead-letter those messages as soon as it can. 

This works great when you have data that is only relevant to producers if it arrives on time. _If your data can't be dropped, but you still want the queues to remain as empty as possible, then see below, the section on "dead lettering"_.

There are two ways to setup Queue TTLs, one if by passing some extra arguments during `queue.declare` like this:

```java
Map<String, Object> args = new HashMap<String, Object>();
args.put("x-message-ttl", 60000);
channel.queueDeclare("myqueue", false, false, false, args);
```

The previous code will tell RabbitMQ to expire messages on the queue `myqueue` after 60 seconds.

The same could be set up by adding a policy to our queue:

```shell
rabbitmqctl set_policy TTL ".*" '{"message-ttl":60000}' --apply-to queues
```

This policy will match all the queues in the the default virtual host, and will make the messages expire after 60 seconds. Note that the Windows command is a bit [different](/docs/ttl). Of course you can make that policy match only one queue. More details about it here: [Parameters and Policies](/docs/parameters).

What if we want more fine grained control over which messages are getting expired?

## Per-Message TTL

RabbitMQ also supports setting per-message TTLs. We can set the TTL on a message by setting the `expiration` field on a `basic.publish` method call. As in the previous case, the value should be expressed in milliseconds. The following code will publish a message that will expire after 60 seconds:

```java
byte[] messageBodyBytes = "Hello, world!".getBytes();
AMQP.BasicProperties properties = new AMQP.BasicProperties();
properties.setExpiration("60000");
channel.basicPublish("my-exchange", "routing-key", properties, messageBodyBytes);
```

If we combine per-message TTL with per-queue TTL, then the shortest TTL will prevail. RabbitMQ will ensure a consumer will never receive expired messages, but in the case of per-message-ttl, until those messages reach the head of the queue, they won't be expired.

## Queue TTL

With RabbitMQ we can also let the complete queue expire, that is, get deleted by RabbitMQ after it's been unused for certain amount of time. Let's say we set up to expire our queues after one hour. If during an hour, there are no consumers on that queue, no basic.get commands have been issued or the queue hasn't been redeclared, then RabbitMQ will consider it unused and it will delete it.

You might want to use this feature if for example you create queues for your users when they are online, but after 15 minutes of inactivity you want to delete those queues. Think of a chat application that keeps a queue per connected user. You could have declared an `auto_delete` queue that will go away as soon as the user closes the channel, but while that might be useful for some scenarios, what happens if the user actually got disconnected because they are in a mobile network where connection quality is low? Certainly you don't want to delete all their messages a soon as they are disconnected. With this feature you could let those queues live a little longer.

Here's how to set a 15 minutes queue expiration using the Java Client:

```java
Map<String, Object> args = new HashMap<String, Object>();
args.put("x-expires", 900000);
channel.queueDeclare("myqueue", false, false, false, args);
```

And via a policy:

```shell
rabbitmqctl set_policy expiry ".*" '{"expires":900000}' --apply-to queues
```

## Queue Length Limit

If we want that our queues don't get more messages than certain threshold, we can configure that via the `x-max-length` argument when we declare the queue. This is rather neat and simply way to control capacity; if our queue reaches the threshold and a new message arrives, then messages that are at the front of the queue, "older messages", will be dropped, making room for the newly arrived messages. One of the reasons for this behaviour is that old messages are probably irrelevant for your application, so new ones are let into the queues.

Keep in mind that queue length takes into account only the messages that are ready to be delivered. Unacked messages won't add to the count. Having the proper `basic.qos` settings will help your application here, since by default RabbitMQ will send as many messages as possible to the consumer, creating a situation where your queue appears to be empty, but in fact you have a lot of unacked messages that are taking up resources as well.

Setting the queue length limit is quite easy, here's an example in Java that sets a limit on 10 messages:

```java
Map<String, Object> args = new HashMap<String, Object>();
args.put("x-max-length", 10);
channel.queueDeclare("myqueue", false, false, false, args);
```

And via a policy:

```shell
rabbitmqctl set_policy Ten ".*" '{"max-length":10}' --apply-to queues
```

## Mixing policies

Keep in mind that *at most* one policy applies to a queue at any given time. So if you run the previous `set_policy` commands in succession, then only the last one will take place. The trick to have more than one policy applying to the same resource lays in passing all the policies together on the same JSON object, for example:

```shell
rabbitmqctl set_policy capped_queues "^capped\." \ 
  '{"max-length":10, "expires":900000, "message-ttl":60000}' --apply-to queues
```

## No Queueing at all

Wait, did I read that right? Yes. No queueing.

Imagine you are on a very busy day, and you arrive to the post office just to see that every counter is busy. Since you don't have time to waste waiting in line, you just go back and continue doing what you were doing before. In other words: you have a request that has to be served *right now*, that is: without queueing. Well, RabbitMQ can do something similar to that with your application messages and queues.

The trick consists on setting a `per-queue-TTL` of `0` (zero). If messages can't be delivered immediately to consumers, then they will be expired right away. If you set up a dead-letter exchange, then you could get messages to be dead-lettered to a separate queue.

## Dead Lettering

We've been mentioning [dead-lettering](/docs/dlx) a couple of times already. What this feature does is that you could set up a *dead letter exchange (DLX)* for one of your queues, and then when a message on that queue expires, or the queue limit has been exceeded, the message will be published to the DLX. It's up to you to bind a separate queue to that exchange and then later process the messages sent there.

Here's a `queue.declare` example for setting a DLX:

```java
channel.exchangeDeclare("some.exchange.name", "direct");

Map<String, Object> args = new HashMap<String, Object>();
args.put("x-dead-letter-exchange", "some.exchange.name");
channel.queueDeclare("myqueue", false, false, false, args);
```

Dead-lettering messages will keep your queues with the right sizes and expected amount of messages, but this won't prevent you from filling up the node with messages. If these messages are being queued in a different queue on the same node, then at some point this new dead-letter queue could present a problem. What you could do in this case is to use [exchange federation](/docs/federation) to send those messages to a separate node, and process them separately from the main flow of your application.

## Conclusion

One of the basic questions of queueing theory with regard to requests arriving to our system can be stated as follows[^1]:

> λ = mean arrival time  
µ = mean service rate  
if λ > µ what happens?  
Queue length goes to infinity over time.

We know that if we encounter this problem at any point in our architecture, sooner or later our application will be in trouble. Luckily for us RabbitMQ offers many features like queues and messages TTLs, queue expiration and queue length, tailored to avoid this issue. What's more interesting, is that we don't need to lose messages just because we use these features. The dead-letter exchange can help us to re-route messages to more appropriate places. It's time we make these techniques part of our queueing and messaging arsenal.

[^1]: [Performance Modeling and Design of Computer Systems: Queueing Theory in Action](https://www.amazon.com/Performance-Modeling-Design-Computer-Systems/dp/1107027500)
