# RabbitMQ tutorial - "Hello World!"

<div id="sidebar" class="tutorial-one">
  <xi:include href="tutorials-menu.xml.inc"/>
</div>

<div id="tutorial">

## Introduction

<xi:include href="tutorials-help.xml.inc"/>

RabbitMQ is a message broker. In essence, it accepts messages from
_producers_, and delivers them to _consumers_. In-between, it can
route, buffer, and persist the messages according to rules you give
it.

RabbitMQ, and messaging in general, uses some jargon.

 * _Producing_ means nothing more than sending. A program that sends messages
   is a _producer_. We'll draw it like that, with "P":
   <div class="diagram">
     <img src="/img/tutorials/producer.png" height="50" />
     <div class="diagram_source">
     digraph {
       bgcolor=transparent;
       truecolor=true;
       rankdir=LR;
       node [style="filled"];
       //
       P1 [label="P", fillcolor="#00ffff"];
     }
     </div>
   </div>

 * _A queue_ is the name for a mailbox. It lives inside
   RabbitMQ. Although messages flow through RabbitMQ and your
   applications, they can be stored only inside a _queue_. A _queue_
   is not bound by any limits, it can store how many messages you
   like - it's essentially an infinite buffer. Many _producers_ can send
   messages that go to the one queue, many _consumers_ can try to
   receive data from one _queue_. A queue will be drawn as like that, with
   its name above it:
   <div class="diagram">
     <img src="/img/tutorials/queue.png" height="90" />
     <div class="diagram_source">
     digraph {
       bgcolor=transparent;
       truecolor=true;
       rankdir=LR;
       node [style="filled"];
       //
       subgraph cluster_Q1 {
         label="queue_name";
         color=transparent;
         Q1 [label="{||||}", fillcolor="red", shape="record"];
       };
     }
     </div>
   </div>

 * _Consuming_ has a similar meaning to receiving. A _consumer_ is a program
   that mostly waits to receive messages. On our drawings it's shown with "C":
   <div class="diagram">
     <img src="/img/tutorials/consumer.png" height="50" />
     <div class="diagram_source">
     digraph {
       bgcolor=transparent;
       truecolor=true;
       rankdir=LR;
       node [style="filled"];
       //
       C1 [label="C", fillcolor="#33ccff"];
     }
     </div>
   </div>

## "Hello World"

In this part of the tutorial we'll write two programs in Java; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the Java API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue -- a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="/img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60" />
</div>

> #### The Java client library
>
> RabbitMQ speaks [AMQP](http://amqp.org/), which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for AMQP in [many different
> languages](http://www.delicious.com/alexisrichardson/rabbitmq+client). We'll
> use the Java client provided by RabbitMQ.
>
> Download the [client library
> package](http://www.rabbitmq.com/java-client.html), and check its
> signature as described. Unzip it into your working directory and grab
> the JAR files from the unzipped directory:
>
>     :::bash
>     $ unzip rabbitmq-java-client-bin-*.zip
>     $ cp rabbitmq-java-client-bin-*/*.jar ./
>
> (The RabbitMQ Java client is also in the central Maven repository,
> with the groupId `com.rabbitmq` and the artifactId `amqp-client`.)

Now we have the Java client and its dependencies, we can write some
code.

### Sending

<div class="diagram">
  <img src="/img/tutorials/sending.png" alt="(P) -> [|||]" height="100" />
</div>

We'll call our message sender `Send` and our message receiver
`Recv`.  The sender will connect to RabbitMQ, send a single message,
then exit.

In
[`Send.java`](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/java/Send.java),
we need some classes imported:

    :::java
    import com.rabbitmq.client.ConnectionFactory;
    import com.rabbitmq.client.Connection;
    import com.rabbitmq.client.Channel;

then we can create a connection to the server:

    :::java
    public class Send {
      public static void main(String[] argv)
          throws java.io.IOException {
        Connection conn = null;
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        conn = factory.newConnection();
        Channel chan = conn.createChannel();

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us.
Next we create a channel, which is where most of the API for getting
things done resides.

To send, we must declare a queue for us to send to; then we can publish a message
to the queue:

    :::java
        chan.queueDeclare("hello", false, false, false, null);

        chan.basicPublish("", "hello", null, "Hello World!".getBytes());
        System.out.println(" [x] Sent 'Hello World!'");

Declaring a queue is idempotent; it will be created if it doesn't
exist already. The message contents is a byte array, so you can encode
whatever you like there.

Lastly, we close the channel and the connection;

    :::java
        chan.close();
        conn.close();
      }
    }

[Here's the whole Send.java
class](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/java/Send.java).

### Receiving

That's it for our sender.  Our receiver is pushed messages from
RabbitMQ, so unlike the sender which publishes a single message, we'll
keep it running to listen for messages and print them out.

<div class="diagram">
  <img src="/img/tutorials/receiving.png" alt="[|||] -> (C)" height="100" />
</div>

The code (in [`Recv.java`](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/java/Recv.java)) has almost the same imports as `Send`:

    :::java
    import com.rabbitmq.client.ConnectionFactory;
    import com.rabbitmq.client.Connection;
    import com.rabbitmq.client.Channel;
    import com.rabbitmq.client.QueueingConsumer;

The extra `QueueingConsumer` is a class we'll use to buffer the
messages pushed to us by the server.

Setting up is the same as the sender; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue `send` publishes to.

    :::java
    public class Recv {
      public static void main(String[] argv)
          throws java.io.IOException,
                 java.lang.InterruptedException {
        Connection conn = null;
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        conn = factory.newConnection();
        Channel chan = conn.createChannel();

        chan.queueDeclare("hello", false, false, false, null);

Note that we declare the queue here, as well. Because we might start
the receiver before the sender, we want to make sure the queue exists
before we try to consumer messages from it.

We're about to tell the server to deliver us the messages from the
queue. Since it will push us messages asynchronously, we provide a
callback in the form of an object that will buffer the messages until
we're ready to use them. That is what `QueueingConsumer` does.

    :::java
        System.out.println(" [*] Waiting for messages. To exit press CTRL+C");
        QueueingConsumer consumer = new QueueingConsumer(chan);
        chan.basicConsume("hello", true, consumer);
        while (true) {
          QueueingConsumer.Delivery delivery = consumer.nextDelivery();
          System.out.println(" [x] Received " + new String(delivery.getBody()));
        }
      }
    }

`QueueingConsumer.nextDelivery()` blocks until another message has
been delivered from the server.

[Here's the whole Recv.java
class](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/java/Recv.java).

### Putting it all together

You can compile both of these with just the RabbitMQ java client on
the classpath:

    :::bash
    $ javac -cp rabbitmq-client.jar Send.java Recv.java

To run them, you'll need `rabbitmq-client.jar` and its dependencies on
the classpath.  In a terminal, run the sender:

    :::bash
    $ java -cp .:commons-io-1.2.jar:commons-cli-1.1.jar:rabbitmq-client.jar Send

then, run the receiver:

    :::bash
    $ java -cp .:commons-io-1.2.jar:commons-cli-1.1.jar:rabbitmq-client.jar Recv

Use a semicolon instead of a colon to separate items in the classpath on Windows.

The receiver will print the message it gets from the sender via
RabbitMQ. The receiver will keep running, waiting for messages (Use Ctrl-C to stop it), so try running
the sender from another terminal.

If you want to check on the queue, try using `rabbitmqctl list_queues`.

Hello World!

</div>
