---
title: "Distributed Semaphores with RabbitMQ"
tags: ["HowTo", ]
authors: [alvaro]
---

In this blog post we are going to address the problem of controlling the access to a particular resource in a distributed system. 
The technique for solving this problem is well know in computer science, it's called Semaphore and it was invented by Dijkstra in 1965
in his paper called "Cooperating Sequential Processes". We are going to see how to implement it using AMQP's building blocks, like consumers,
producers and queues. 

<!-- truncate -->

## The Need for Semaphores

Before going into the actual solution, let's see when we might actually need something like this:

Let's say our application has many processes taking jobs from a queue and then inserting records to a database, we might need to limit how many of them do it concurrently.

Similarly, workers are resising images that need to be stored on a remote server over the network once they are ready. We want to prevent overflowing our network link with
image transfers, so we also place a limit on how many of our workers can transfer images at the same time. In this way, while our workers will be resising images as fast
as they can, they will move the images in batches to the final destination once it's their turn to use the network link.

Another example this time related to RabbitMQ, could be that your application might need to have only one producer from a set sending messages to an exchange, but as soon as that process 
is stopped, you want the next producer in the set to start sending messages. There are many reasons why you would like something like this, capacity control can be one of them.

On the other end, there might be the need that consumers compete for accessing a queue, but while AMQP provides a way to have exclusive queues and exclusive consumer, 
there's no way for an idle consumer to know when the queue access got freed. Therefore using a similar approach as above we could have consumers taking turns
when accessing a queue.

It's worth noting that nothing prevent us from having more than one process accessing a particular resource. Say we have ten producers but we just want
five of them publishing messages at the same time. Using semaphores we could implement this as well.

The previous examples all have an extra requirement in common: the processes competing for the resource shouldn't be polling RabbitMQ or some other
coordinator in order to know when they can start working. Ideally they will sit idle waiting for their turn, and as soon as the resource is freed
then RabbitMQ will notify the next process so it can start working automatically.

Let's move on now onto the implementation.

## Implementing Semaphores

Our semaphore will be implemented using queues and messages. Surprise, surprise!.

We first declare a queue called `resource.semaphore` where `resource` will be the name of the resource our semaphore is going to control, it can be "images",
"database", "file_server", or whatever fits our particular application.

We publish *one* message to the `resource.semaphore` queue. Then we start the processes that will seek access to that message. Each process will consume from the 
`resource.semaphore` queue; the first process to arrive will get the message and all the others will sit idle waiting for it. The trick will be that these
processes will *never acknowledge* the message, but they will consume from the `resource.semaphore` queue with `ack_mode=on`. So, RabbitMQ will keep track of the
message and if the processes crashes or exists, the message will go back to the queue, and it will be delivered to the next process listening from our semaphore
queue.

With this simple technique we will have only one process at the time having access to the resource, and we are sure the process won't hold the resource if it crashes.
Of course we assume that all the processes accessing the semaphore are well behaved, i.e.: they will never acknowledge the message. If they do, RabbitMQ will delete
the message and all the other processes in the group will starve.

What do we do when one process wishes to stop, how can it return the "token"? Sure the process can abruptly close the channel and RabbitMQ will take care of the message
automatically, but there's also a polite way of doing this. A process can *basic.reject* the message telling RabbitMQ to re-enqueue the message so it goes back to the
semaphore queue.

Let's see this implemented in code, we assume we have obtained a connection and a channel:

Here's the code to set up our semaphore:

```java
channel.queueDeclare("resource.semaphore", true, false, false, null);
String message = "resource";
channel.basicPublish("", "resource.semaphore", null, message.getBytes());
```

We create a durable queue called `"resource.semaphore"` and then we publish a message to it using the *default* exchange.

And here's the code a process would use to access the semaphore:

```java
QueueingConsumer consumer = new QueueingConsumer(channel);
channel.basicQos(1);
channel.basicConsume("resource.semaphore", false, consumer);

while (true) {
  QueueingConsumer.Delivery delivery = consumer.nextDelivery();

  // here we access the resource controlled by the semaphore.  

  if(shouldStopProcessing()) {
    channel.basicReject(delivery.getEnvelope().getDeliveryTag(), true);
  }
}
```

There we create a `QueueingConsumer` that's waiting for messages coming from the `"resource.semaphore"` queue. We make sure our process picks only 
one message from the queue by setting the *prefetch-count* equal to 1 in our `basicQos` call.  Once a message arrives, the process will start using the resource. 
When the condition `shouldStopProcessing()` is met, the process will `basicReject` the message, telling RabbitMQ to requeue it. Keep in mind that 
the consumer was started in ack-mode and that it will never ack the message received from the semaphore queue. If it does, then it's considered buggy.

## Prioritising Access to the Semaphore

Is it possible to prioritise access to the semaphore? Yes, since version 3.2.0 RabbitMQ supports [Consumer Priorities](/docs/consumer-priority). By using consumer
priorities we can tell RabbitMQ which processes to favor when passing around the token message from the semaphore.

## Binary vs Counting Semaphores

So far we have implemented what's called a *binary semaphore*, that is, a semaphore that gives access to a resource to only one process at a time. If we can allow more than one
process accessing the same resource at the same time, but we still need a limit to that operation, then we can implement a *counting semaphore*. To do that, when we set up the semaphore, 
instead of publishing one message, we can publishing as many messages as processes are allowed to be working at the same time. We need to make sure that our processes set
*prefetch-count* value to 1 as we did before.

## Altering the Count

Note that the process that sets up the semaphore queue can add extra messages over time to increase processing capacity. If we wanted to decrease the number of processes that can
simultaneously access a resource, then we would have to stop the running ones and purge the queue. Another way would be to start an extra consumer with very
[high priority](/docs/consumer-priority) so it would take as many messages as are needed from the semaphore queue and acknowledge them so they get removed from the system.

## Some reading

As you can see it's quite easy to implement semaphores using AMQP basic constructs, and with RabbitMQ we can also prioritise the access to the resource.

To conclude I would like to share some articles on Semaphores as concurrency constructs. First, Dijkstra's seminal paper 
[Cooperating Sequential Processes](http://www.cs.utexas.edu/users/EWD/transcriptions/EWD01xx/EWD123.html). And finally Wikipedia's article on semaphores which explains many of the 
definitions: [Semaphore](https://en.wikipedia.org/wiki/Semaphore_(programming)).

###  EDIT: 20.02.2014 

As discussed [here](https://twitter.com/aphyr/status/436610754083815425) and elsewhere with my colleagues as well, this setup is not resilient of [network partitions](/docs/partitions), so handle it with care. Thanks to [@aphyr](https://twitter.com/aphyr) and others for providing me feedback on the blog post. At the RabbitMQ team we always like to stay honest and tell our users what the server can, and can't do.

###  EDIT: 10.03.2014 

It's worth noting that this set up is not resilient to network failures in general. For example, it could happen that a worker has a token and the connection with the server is abruptly closed. Then the server will grab the token and queue it so it can be delivered to another worker. In the meantime, the worker whose network connection was closed, will still think that it has the token, therefore, it will continue accessing a resource that it should't be accessing.
