---
title: "Using Consumer Priorities with RabbitMQ"
tags: ["New Features", "HowTo", ]
authors: [alvaro]
---

With RabbitMQ 3.2.0 we introduced [Consumer Priorities](/docs/consumer-priority) which not surprisingly allows us to set priorities for our consumers. This provides us with a bit of control over how RabbitMQ will deliver messages to consumers in order to obtain a different kind of scheduling that might be beneficial for our application.

When would you want to use Consumer Priorities in your code?

<!-- truncate -->

## Heterogeneous Cluster

Let's say our cluster of workers doesn't run in exactly the same hardware. Some machines have some hardware features that give them an advantage over the others in the cluster based on the type of task we are running. For example some machines have SSDs and our tasks require a lot of I/O; or perhaps the tasks need faster CPUs to perform calculations; or more RAM in order to cache results for future computations. In any case it would be interesting that if we have two consumers ready to get more messages, and one is in a better machine, then RabbitMQ should pick the consumer in the better machine and deliver the message to it, instead of the other one in the lesser machine. Keep in mind that consumer priorities *only* take effect for consumers that are ready to receive a message. So if one consumer in our lesser machines is ready, and there are no ready consumers in the better machines, then RabbitMQ will directly send a message to that particular consumer without waiting for a faster consumer to become available.

## Data Locality

Another use for consumer priorities is to benefit from data locality. In RabbitMQ queue contents live in the node where the queue was originally declared, and in case of [mirrored queues](/docs/3.13/ha) there will be a master node that will coordinate the queue, so while consumers can connect to various nodes in the cluster, and get messages from the mirror, at the end of the day the information about who consumed what messages will travel back to the master. In this case we can use a consumer priority to tell RabbitMQ to first deliver messages to consumers connected to the master node. To do that the consumer that connects to the master node, will set a higher priority for itself when issuing a `basic.consume` command (provided it has a way of knowing it is connected to the master node).

## Declaring consumer priorities

Below you can find sample code that shows how to declare consumer priorities using the [RabbitMQ Java Client](/client-libraries/java-client):

```java {linenos=inline,hl_lines=["25-27"],linenostart=1}
import java.util.*;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.QueueingConsumer;

public class Consumer {

    private final static String EXCHANGE_NAME = "my_exchange";
    private final static String QUEUE_NAME = "my_queue";

    public static void main(String[] argv) throws Exception {
      ConnectionFactory factory = new ConnectionFactory();
      factory.setHost("localhost");
      Connection connection = factory.newConnection();
      Channel channel = connection.createChannel();

      channel.queueDeclare(QUEUE_NAME, true, false, false, null);
      channel.exchangeDeclare(EXCHANGE_NAME, "direct", true);
      channel.queueBind(QUEUE_NAME, EXCHANGE_NAME, "");
      System.out.println("Waiting for messages. To exit press CTRL+C");

      QueueingConsumer consumer = new QueueingConsumer(channel);

      Map<String, Object> args = new HashMap<String, Object>();
      args.put("x-priority", 10);
      channel.basicConsume(QUEUE_NAME, false, "", false, false, args, consumer);

      while (true) {
        QueueingConsumer.Delivery delivery = consumer.nextDelivery();
        String message = new String(delivery.getBody());
        System.out.println("Received '" + message + "'");
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
      }
  }
}
```

This code implements a very simple consumer based on the example from [tutorial 1](/tutorials/tutorial-one-java). The interesting parts are from lines 25 to 27 where first we create a `HashMap` to hold our arguments to `basicConsume`. We create an argument named `x-priority` with value `10` (the higher the value, the higher the priority). When we call `basicConsume` we pass those arguments to RabbitMQ, and that's it! A very powerful feature that is rather simple to use. As usual, it's wise to run performance tests to decide what's the best priority strategy for our consumers.
