# RabbitMQ tutorial - Work Queues SUPPRESS-RHS

<!--
Copyright (c) 2007-2016 Pivotal Software, Inc.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

## Work Queues

### (using the spring-amqp client)

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

<div class="diagram">
  <img src="/img/tutorials/python-two.png" height="110" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      Q1 [label="{||||}", fillcolor="red", shape="record"];
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P1 -&gt; Q1 -&gt; C1;
      Q1 -&gt; C2;
    }
  </div>
</div>

In the [first tutorial](tutorial-one-spring-amqp.html) we
wrote programs to send and receive messages from a named queue. In this
one we'll create a _Work Queue_ that will be used to distribute
time-consuming tasks among multiple workers.

The main idea behind Work Queues (aka: _Task Queues_) is to avoid
doing a resource-intensive task immediately and having to wait for
it to complete. Instead we schedule the task to be done later. We encapsulate a
_task_ as a message and send it to a queue. A worker process running
in the background will pop the tasks and eventually execute the
job. When you run many workers the tasks will be shared between them.

This concept is especially useful in web applications where it's
impossible to handle a complex task during a short HTTP request
window.

### Preparation

In the previous part of this tutorial we sent a message containing
"Hello World!". Now we'll be sending strings that stand for complex
tasks. We don't have a real-world task, like images to be resized or
pdf files to be rendered, so let's fake it by just pretending we're
busy - by using the `Thread.sleep()` function. We'll take the number of dots
in the string as its complexity; every dot will account for one second
of "work".  For example, a fake task described by `Hello...`
will take three seconds.

Please see the setup in [first tutorial](tutorial-one-spring-amqp.html)
if you have not setup the project. We will follow the same pattern
as in the first tutorial: 1) create a package (tut2) and create
a Tut2Config, Tut2Receiver, and Tut2Sender. Start by create a new
package (tut2) where we'll place our three classes.  In the configuration
class we setup two profiles, the label for the tutorial ("tut2") and
the name of the pattern ("work-queues").  We leverage spring to expose
the queue as a bean. We setup the receiver as a profile and define two beans
to correspond to the workers in our diagram above; receiver1 and
receiver2. Finally, we define a profile for the sender and define the
sender bean.  The configuration is now done.

<pre class="sourcecode java">

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Profile({"tut2", "work-queues"})
@Configuration
public class Tut2Config {

    @Bean
    public Queue hello() {
        return new Queue("hello");
    }

    @Profile("receiver")
    private static class ReceiverConfig {

        @Bean
        public Tut2Receiver receiver1() {
            return new Tut2Receiver(1);
        }

        @Bean
        public Tut2Receiver receiver2() {
            return new Tut2Receiver(2);
        }
    }

    @Profile("sender")
    @Bean
    public Tut2Sender sender() {
        return new Tut2Sender();
    }
}
</pre>

### Sender

We will modify the sender to provide a means for identifying
whether its a longer running task by appending a dot to the
message in a very contrived fashion using the same method
on the RabbitTemplate to publish the message, convertAndSend.
The documentation defines this as, "Convert a Java object to
an Amqp Message and send it to a default exchange with a
default routing key."

<pre class="sourcecode java">
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;


public class Tut2Sender {

    @Autowired
    private RabbitTemplate template;

    @Autowired
    private Queue queue;

    int dots = 0;
    int count = 0;

    @Scheduled(fixedDelay = 1000, initialDelay = 500)
    public void send() {
        StringBuilder builder = new StringBuilder("Hello");
		if (dots++ == 3) {
			dots = 1;
		}

        builder.append(Integer.toString(++count));
        String message = builder.toString();
        template.convertAndSend(queue.getName(), message);
        System.out.println(" [x] Sent '" + message + "'");
    }
}

</pre>

### Receiver

Our receiver, Tut2Receiver, simulates an arbitary length for
a fake task in the doWork() method where the number of dots
translates into the number of seconds the work will take. Again,
we leverage a @RabbitListener on the "hello" queue and a
@RabbitHandler to receive the message. The instance that is
consuming the message is added to our monitor to show
which instance, the message and the length of time to process
the message.

<pre class="sourcecode java">
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.util.StopWatch;

@RabbitListener(queues = "hello")
public class Tut2Receiver {

    private final int instance;

    public Tut2Receiver(int i) {
        this.instance = i;
    }

    @RabbitHandler
    public void receive(String in) throws InterruptedException {
        StopWatch watch = new StopWatch();
        watch.start();
        System.out.println("instance " + this.instance +
            " [x] Received '" + in + "'");
        doWork(in);
        watch.stop();
        System.out.println("instance " + this.instance +
            " [x] Done in " + watch.getTotalTimeSeconds() + "s");
    }

    private void doWork(String in) throws InterruptedException {
        for (char ch : in.toCharArray()) {
            if (ch == '.') {
                Thread.sleep(1000);
            }
        }
    }
}
</pre>

### Putting it all together

Compile them using mvn package and run with the following options

<pre class="sourcecode bash">
mvn clean package

java -jar target/rabbitmq-amqp-tutorials-0.0.1-SNAPSHOT.jar --spring.profiles.active=work-queues,receiver
java -jar target/rabbitmq-amqp-tutorials-0.0.1-SNAPSHOT.jar --spring.profiles.active=work-queues,sender
</pre>

The output of the sender should look something like:

<pre class="sourcecode bash"> 
Ready ... running for 10000ms
 [x] Sent 'Hello.1'
 [x] Sent 'Hello..2'
 [x] Sent 'Hello...3'
 [x] Sent 'Hello.4'
 [x] Sent 'Hello..5'
 [x] Sent 'Hello...6'
 [x] Sent 'Hello.7'
 [x] Sent 'Hello..8'
 [x] Sent 'Hello...9'
 [x] Sent 'Hello.10'
</pre>

And the output from the workers should look something like:

<pre class="sourcecode bash">
Ready ... running for 10000ms
instance 1 [x] Received 'Hello.1'
instance 2 [x] Received 'Hello..2'
instance 1 [x] Done in 1.001s
instance 1 [x] Received 'Hello...3'
instance 2 [x] Done in 2.004s
instance 2 [x] Received 'Hello.4'
instance 2 [x] Done in 1.0s
instance 2 [x] Received 'Hello..5'
</pre>

### Round-robin dispatching

Our simulator demonstrates the ease of setting up round robin
messaging in RabbitMQ.  We simply defined two consumers listening
on the same queue and the messages were distributed between the
two consumers.

By default, RabbitMQ will send each message to the next consumer,
in sequence. On average every consumer will get the same number of
messages. This way of distributing messages is called round-robin. Try
this out with three or more workers.

### Message acknowledgment

Doing a task can take a few seconds. You may wonder what happens if
one of the consumers starts a long task and dies with it only partly done.
With our current code, once RabbitMQ delivers a message to the customer it
immediately removes it from memory. In this case, if you kill a worker
we will lose the message it was just processing. We'll also lose all
the messages that were dispatched to this particular worker but were not
yet handled.

But we don't want to lose any tasks. If a worker dies, we'd like the
task to be delivered to another worker.

In order to make sure a message is never lost, RabbitMQ supports
message _acknowledgments_. An ack(nowledgement) is sent back from the
consumer to tell RabbitMQ that a particular message has been received,
processed and that RabbitMQ is free to delete it.

If a consumer dies (its channel is closed, connection is closed, or
TCP connection is lost) without sending an ack, RabbitMQ will
understand that a message wasn't processed fully and will re-queue it.
If there are other consumers online at the same time, it will then
quickly redeliver it to another consumer. That way you can be sure that
no message is lost, even if the workers occasionally die.

There aren't any message timeouts; RabbitMQ will redeliver the message when
the consumer dies. It's fine even if processing a message takes a very, very
long time.

Message acknowledgments are turned on by default. In previous
examples we explicitly turned them off via the `autoAck=true`
flag. It's time to set this flag to `false` and send a proper acknowledgment
from the worker, once we're done with a task.

<pre class="sourcecode java">
spring-amqp to demonsrate how to setup rabbitTemplate for ACK

</pre>

Using this code we can be sure that even if you kill a worker using
CTRL+C while it was processing a message, nothing will be lost. Soon
after the worker dies all unacknowledged messages will be redelivered.

> #### Forgotten acknowledgment
>
> It's a common mistake to miss the `basicAck`. It's an easy error,
> but the consequences are serious. Messages will be redelivered
> when your client quits (which may look like random redelivery), but
> RabbitMQ will eat more and more memory as it won't be able to release
> any unacked messages.
>
> In order to debug this kind of mistake you can use `rabbitmqctl`
> to print the `messages_unacknowledged` field:
>
> <pre class="sourcecode bash">
> sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
> </pre>
>
> On Windows, drop the sudo:
> <pre class="sourcecode bash">
> rabbitmqctl.bat list_queues name messages_ready messages_unacknowledged
> </pre>

### Message durability

We have learned how to make sure that even if the consumer dies, the
task isn't lost. But our tasks will still be lost if RabbitMQ server stops.

When RabbitMQ quits or crashes it will forget the queues and messages
unless you tell it not to. Two things are required to make sure that
messages aren't lost: we need to mark both the queue and messages as
durable.

First, we need to make sure that RabbitMQ will never lose our
queue. In order to do so, we need to declare it as _durable_:

<pre class="sourcecode java">
spring-amqp code for setting up durable code.
</pre>

Although this command is correct by itself, it won't work in our present
setup. That's because we've already defined a queue called `hello`
which is not durable. RabbitMQ doesn't allow you to redefine an existing queue
with different parameters and will return an error to any program
that tries to do that. But there is a quick workaround - let's declare
a queue with different name, for example `task_queue`:

<pre class="sourcecode java">
spring-amqp code to setup a durable queue
</pre>

This queue configuration change needs to be applied to both the producer
and consumer code.

At this point we're sure that the `task_queue` queue won't be lost
even if RabbitMQ restarts. Now we need to mark our messages as
persistent - by setting `MessageProperties` (which implements
`BasicProperties`) to the value `PERSISTENT_TEXT_PLAIN`.

<pre class="sourcecode java">
spring-amqp code to set 
            MessageProperties.PERSISTENT_TEXT_PLAIN,
</pre>

> #### Note on message persistence
>
> Marking messages as persistent doesn't fully guarantee that a message
> won't be lost. Although it tells RabbitMQ to save the message to disk,
> there is still a short time window when RabbitMQ has accepted a message and
> hasn't saved it yet. Also, RabbitMQ doesn't do `fsync(2)` for every
> message -- it may be just saved to cache and not really written to the
> disk. The persistence guarantees aren't strong, but it's more than enough
> for our simple task queue. If you need a stronger guarantee then you can use
> [publisher confirms](https://www.rabbitmq.com/confirms.html).

### Fair dispatch

You might have noticed that the dispatching still doesn't work exactly
as we want. For example in a situation with two workers, when all
odd messages are heavy and even messages are light, one worker will be
constantly busy and the other one will do hardly any work. Well,
RabbitMQ doesn't know anything about that and will still dispatch
messages evenly.

This happens because RabbitMQ just dispatches a message when the message
enters the queue. It doesn't look at the number of unacknowledged
messages for a consumer. It just blindly dispatches every n-th message
to the n-th consumer.

<div class="diagram">
  <img src="/img/tutorials/prefetch-count.png" height="110" />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      subgraph cluster_Q1 {
        label="queue_name=hello";
    color=transparent;
        Q1 [label="{||||}", fillcolor="red", shape="record"];
      };
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P1 -&gt; Q1;
      Q1 -&gt; C1 [label="prefetch=1"] ;
      Q1 -&gt; C2 [label="prefetch=1"] ;
    }
  </div>
</div>

In order to defeat that we can use the `basicQos` method with the
`prefetchCount` = `1` setting. This tells RabbitMQ not to give more than
one message to a worker at a time. Or, in other words, don't dispatch
a new message to a worker until it has processed and acknowledged the
previous one. Instead, it will dispatch it to the next worker that is not still busy.

<pre class="sourcecode java">
spring-amqp for prefetchCount translation to implement preceding
paragraph.
</pre>

> #### Note about queue size
>
> If all the workers are busy, your queue can fill up. You will want to keep an
> eye on that, and maybe add more workers, or have some other strategy.

### Differences in previous tut2 classes

Final code for our durable, persistent messaging is:

<pre class="sourcecode java">
spring-amqp code to demonstrate the previous concepts. 
</pre>

[(Tut2Config.java source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/java/NewTask.java)
[(Tut2Sender.java source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/java/NewTask.java)

And our `Tut2Receiver.java`:

<pre class="sourcecode java">
spring-amqp modified Tut2Receiver.java
</pre>

[(Tut2Receiver.java source)](http://github.com/rabbitmq/rabbitmq-tutorials/blob/master/java/Worker.java)

Using message acknowledgments and `prefetchCount` you can set up a
work queue. The durability options let the tasks survive even if
RabbitMQ is restarted.

For more information on `Channel` methods and `MessageProperties`,
you can browse the [javadocs online]
(http://www.rabbitmq.com/releases/rabbitmq-java-client/current-javadoc/).

Now we can move on to [tutorial 3](tutorial-three-spring-amqp.html) and learn how
to deliver the same message to many consumers.
