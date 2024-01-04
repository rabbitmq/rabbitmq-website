<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
# RabbitMQ tutorial - "Hello World!" SUPPRESS-RHS

## Introduction

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>
<xi:include href="site/tutorials/tutorials-intro.xml.inc"/>

## "Hello World"
### (using the Java Client)

In this part of the tutorial we'll write two programs in Java; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the Java API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="../img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60"/>
</div>

> #### The Java client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which is an open,
> general-purpose protocol for messaging. There are a number of clients
> for RabbitMQ in [many different
> languages](https://rabbitmq.com/devtools.html). We'll
> use the Java client provided by RabbitMQ.
>
> Download the [client library](https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/5.16.0/amqp-client-5.16.0.jar)
> and its dependencies ([SLF4J API](https://repo1.maven.org/maven2/org/slf4j/slf4j-api/1.7.36/slf4j-api-1.7.36.jar) and
> [SLF4J Simple](https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/1.7.36/slf4j-simple-1.7.36.jar)).
> Copy those files in your working directory, along the tutorials Java files.
>
> Please note SLF4J Simple is enough for tutorials but you should use a full-blown
> logging library like [Logback](https://logback.qos.ch/) in production.
>
> (The RabbitMQ Java client is also [in the central Maven repository](https://mvnrepository.com/artifact/com.rabbitmq/amqp-client),
> with the groupId `com.rabbitmq` and the artifactId `amqp-client`.)

Now we have the Java client and its dependencies, we can write some
code.

### Sending

<div class="diagram">
  <img src="../img/tutorials/sending.png" alt="(P) -> [|||]" height="100" />
</div>

We'll call our message publisher (sender) `Send` and our message consumer (receiver)
`Recv`.  The publisher will connect to RabbitMQ, send a single message,
then exit.

In
[`Send.java`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java/Send.java),
we need some classes imported:

<pre class="lang-java">
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
</pre>

Set up the class and name the queue:

<pre class="lang-java">
public class Send {
  private final static String QUEUE_NAME = "hello";
  public static void main(String[] argv) throws Exception {
      ...
  }
}
</pre>

then we can create a connection to the server:

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
factory.setHost("localhost");
try (Connection connection = factory.newConnection();
     Channel channel = connection.createChannel()) {

}
</pre>

The connection abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine we'd simply specify its hostname or IP address here.

Next we create a channel, which is where most of the API for getting
things done resides. Note we can use a try-with-resources statement
because both `Connection` and `Channel` implement `java.lang.AutoCloseable`.
This way we don't need to close them explicitly in our code.

To send, we must declare a queue for us to send to; then we can publish a message
to the queue, all of this in the try-with-resources statement:

<pre class="lang-java">
channel.queueDeclare(QUEUE_NAME, false, false, false, null);
String message = "Hello World!";
channel.basicPublish("", QUEUE_NAME, null, message.getBytes());
System.out.println(" [x] Sent '" + message + "'");
</pre>

Declaring a queue is idempotent - it will only be created if it doesn't
exist already. The message content is a byte array, so you can encode
whatever you like there.

[Here's the whole Send.java
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java/Send.java).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 200 MB free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The <a
> href="https://www.rabbitmq.com/configure.html#config-items">configuration
> file documentation</a> will show you how to set <code>disk_free_limit</code>.


### Receiving

That's it for our publisher.  Our consumer listens for messages from
RabbitMQ, so unlike the publisher which publishes a single message, we'll
keep the consumer running to listen for messages and print them out.

<div class="diagram">
  <img src="../img/tutorials/receiving.png" alt="[|||] -> (C)" height="100" />
</div>

The code (in [`Recv.java`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java/Recv.java)) has almost the same imports as `Send`:

<pre class="lang-java">
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;
</pre>

The extra `DeliverCallback` interface we'll use to buffer the messages pushed to us by the server.

Setting up is the same as the publisher; we open a connection and a
channel, and declare the queue from which we're going to consume.
Note this matches up with the queue that `send` publishes to.

<pre class="lang-java">
public class Recv {

  private final static String QUEUE_NAME = "hello";

  public static void main(String[] argv) throws Exception {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost("localhost");
    Connection connection = factory.newConnection();
    Channel channel = connection.createChannel();

    channel.queueDeclare(QUEUE_NAME, false, false, false, null);
    System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

  }
}

</pre>

Note that we declare the queue here, as well. Because we might start
the consumer before the publisher, we want to make sure the queue exists
before we try to consume messages from it.

Why don't we use a try-with-resource statement to automatically close
the channel and the connection? By doing so we would simply make the program
move on, close everything, and exit! This would be awkward because
we want the process to stay alive while the consumer is listening
asynchronously for messages to arrive.

We're about to tell the server to deliver us the messages from the
queue. Since it will push us messages asynchronously, we provide a
callback in the form of an object that will buffer the messages until
we're ready to use them. That is what a `DeliverCallback` subclass does.

<pre class="lang-java">
DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    String message = new String(delivery.getBody(), "UTF-8");
    System.out.println(" [x] Received '" + message + "'");
};
channel.basicConsume(QUEUE_NAME, true, deliverCallback, consumerTag -> { });
</pre>

[Here's the whole Recv.java
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/java/Recv.java).

### Putting it all together

You can compile both of these with just the RabbitMQ java client on
the classpath:

<pre class="lang-bash">
javac -cp amqp-client-5.16.0.jar Send.java Recv.java
</pre>

To run them, you'll need `rabbitmq-client.jar` and its dependencies on
the classpath.  In a terminal, run the consumer (receiver):

<pre class="lang-bash">
java -cp .:amqp-client-5.16.0.jar:slf4j-api-1.7.36.jar:slf4j-simple-1.7.36.jar Recv
</pre>

then, run the publisher (sender):

<pre class="lang-bash">
java -cp .:amqp-client-5.16.0.jar:slf4j-api-1.7.36.jar:slf4j-simple-1.7.36.jar Send
</pre>

On Windows, use a semicolon instead of a colon to separate items in the classpath.

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages (Use Ctrl-C to stop it), so try running
the publisher from another terminal.

> #### Listing queues
>
> You may wish to see what queues RabbitMQ has and how many
> messages are in them. You can do it (as a privileged user) using the `rabbitmqctl` tool:
>
> <pre class="lang-bash">
> sudo rabbitmqctl list_queues
> </pre>
>
> On Windows, omit the sudo:
> <pre class="lang-powershell">
> rabbitmqctl.bat list_queues
> </pre>


Time to move on to [part 2](tutorial-two-java.html) and build a simple _work queue_.

> #### Hint
> To save typing, you can set an environment variable for the classpath e.g.
>
> <pre class="lang-bash">
> export CP=.:amqp-client-5.16.0.jar:slf4j-api-1.7.36.jar:slf4j-simple-1.7.36.jar
> java -cp $CP Send
> </pre>
>
> or on Windows:
> <pre class="lang-powershell">
> set CP=.;amqp-client-5.16.0.jar;slf4j-api-1.7.36.jar;slf4j-simple-1.7.36.jar
> java -cp %CP% Send
> </pre>

