---
title: RabbitMQ tutorial - Work Queues
---

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';
import T2DiagramToC from '@site/src/components/Tutorials/T2DiagramToC.md';
import T2DiagramPrefetch from '@site/src/components/Tutorials/T2DiagramPrefetch.md';

# RabbitMQ tutorial - Work Queues

<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

## Work Queues

### (using Spring AMQP)

<TutorialsHelp/>

<T2DiagramToC/>

In the [first tutorial](./tutorial-one-spring-amqp) we
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
PDF files to be rendered, so let's fake it by just pretending we're
busy - by using the `Thread.sleep()` function. We'll take the number of dots
in the string as its complexity; every dot will account for one second
of "work".  For example, a fake task described by `Hello...`
will take three seconds.

Please see the setup in [first tutorial](./tutorial-one-spring-amqp)
if you have not setup the project. We will follow the same pattern
as in the first tutorial: 1) create a package `tut2` and create
`Tut2Config`, `Tut2Receiver`, and `Tut2Sender` classes. Start by creating a new
package `tut2` where we'll place our three classes.  In the configuration
class we setup two profiles, the label for the tutorial `tut2` and
the name of the pattern (`work-queues`).  We leverage Spring to expose
the queue as a bean. We setup the receiver as a profile and define two beans
to correspond to the workers in our diagram above; `receiver1` and
`receiver2`. Finally, we define a profile for the sender and define the
sender bean.  The configuration is now done.

```java
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
```

### Sender

We will modify the sender to provide a means for identifying
whether it's a longer running task by appending a dot to the
message in a very contrived fashion using the same method
on the `RabbitTemplate` to publish the message, `convertAndSend`.
The documentation defines this as, "Convert a Java object to
a message and send it to a default exchange with a
default routing key."

```java
package org.springframework.amqp.tutorials.tut2;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.concurrent.atomic.AtomicInteger;

public class Tut2Sender {

	@Autowired
	private RabbitTemplate template;

	@Autowired
	private Queue queue;

	AtomicInteger dots = new AtomicInteger(0);

	AtomicInteger count = new AtomicInteger(0);

	@Scheduled(fixedDelay = 1000, initialDelay = 500)
	public void send() {
		StringBuilder builder = new StringBuilder("Hello");
		if (dots.incrementAndGet() == 4) {
			dots.set(1);
		}
		for (int i = 0; i < dots.get(); i++) {
			builder.append('.');
		}
		builder.append(count.incrementAndGet());
		String message = builder.toString();
		template.convertAndSend(queue.getName(), message);
		System.out.println(" [x] Sent '" + message + "'");
	}

}
```

### Receiver

Our receiver, `Tut2Receiver`, simulates an arbitrary length for
a fake task in the `doWork()` method where the number of dots
translates into the number of seconds the work will take. Again,
we leverage a `@RabbitListener` on the `hello` queue and a
`@RabbitHandler` to receive the message. The instance that is
consuming the message is added to our monitor to show
which instance, the message and the length of time to process
the message.

```java
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
                Thread.sleep(500);
            }
        }
    }
}
```

### Putting it all together

Compile them using mvn package and run with the following options

```bash
./mvnw clean package

# shell 1
java -jar target/rabbitmq-tutorials.jar --spring.profiles.active=work-queues,receiver
# shell 2
java -jar target/rabbitmq-tutorials.jar --spring.profiles.active=work-queues,sender
```

The output of the sender should look something like:

```bash
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
```

And the output from the workers should look something like:

```bash
Ready ... running for 10000ms
instance 1 [x] Received 'Hello.1'
instance 2 [x] Received 'Hello..2'
instance 1 [x] Done in 1.001s
instance 1 [x] Received 'Hello...3'
instance 2 [x] Done in 2.004s
instance 2 [x] Received 'Hello.4'
instance 2 [x] Done in 1.0s
instance 2 [x] Received 'Hello..5'
```


### Message acknowledgment

Doing a task can take a few seconds. You may wonder what happens if
one of the consumers starts a long task and dies with it only partly done.
Spring AMQP by default takes a conservative approach to [message acknowledgement](/docs/confirms).
If the listener throws an exception the container
calls:

```java
channel.basicReject(deliveryTag, requeue)
```

Requeue is true by default unless you explicitly set:

```java
defaultRequeueRejected=false
```

or the listener throws an `AmqpRejectAndDontRequeueException`. This
is typically the behavior you want from your listener. In this mode
there is no need to worry about a forgotten acknowledgement.  After
processing the message the listener calls:

```java
channel.basicAck()
```

Acknowledgement must be sent on the same channel the delivery
was received on. Attempts to acknowledge using a different channel
will result in a channel-level protocol exception. See the [doc guide on confirmations](/docs/confirms) to learn more.
Spring AMQP generally takes care of this but when used in combination with code
that uses RabbitMQ Java client directly, this is something to keep in mind.

> #### Forgotten acknowledgment
>
> It's a common mistake to miss the `basicAck` and Spring AMQP
> helps to avoid this through its default configuration.
> The consequences are serious. Messages will be redelivered
> when your client quits (which may look like random redelivery), but
> RabbitMQ will eat more and more memory as it won't be able to release
> any unacked messages.
>
> In order to debug this kind of mistake you can use `rabbitmqctl`
> to print the `messages_unacknowledged` field:
>
> ```bash
> sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
> ```
>
> On Windows, drop the sudo:
> ```bash
> rabbitmqctl.bat list_queues name messages_ready messages_unacknowledged
> ```

### Message persistence

Messages are persistent by default with Spring AMQP. Note the queue
the message will end up in needs to be durable as well, otherwise
the message will not survive a broker restart as a non-durable queue does not
itself survive a restart.

To have more control over the message persistence or over aspects of outbound
messages, you need to use `RabbitTemplate#convertAndSend(...)` methods
that accept a `MessagePostProcessor` parameter. `MessagePostProcessor`
provides a callback before the message is actually sent, so this
is a good place to modify the message payload or headers.

> #### Note on message persistence
>
> Marking messages as persistent doesn't fully guarantee that a message
> won't be lost. Although it tells RabbitMQ to save the message to disk,
> there is still a short time window when RabbitMQ has accepted a message and
> hasn't saved it yet. Also, RabbitMQ doesn't do `fsync(2)` for every
> message -- it may be just saved to cache and not really written to the
> disk. The persistence guarantees aren't strong, but it's more than enough
> for our simple task queue. If you need a stronger guarantee then you can use
> [publisher confirms](/docs/confirms).

### Fair dispatch vs Round-robin dispatching

By default, RabbitMQ will send each message to the next consumer,
in sequence. On average every consumer will get the same number of
messages. This way of distributing messages is called round-robin.
In this mode dispatching doesn't necessarily work exactly as we want.
For example in a situation with two workers, when all
odd messages are heavy and even messages are light, one worker will be
constantly busy and the other one will do hardly any work. Well,
RabbitMQ doesn't know anything about that and will still dispatch
messages evenly.

This happens because RabbitMQ just dispatches a message when the message
enters the queue. It doesn't look at the number of unacknowledged
messages for a consumer. It just blindly dispatches every n-th message
to the n-th consumer.

However, "Fair dispatch" is the default configuration for Spring AMQP. The
`AbstractMessageListenerContainer` defines the value for
`DEFAULT_PREFETCH_COUNT` to be 250.  If the `DEFAULT_PREFETCH_COUNT` were
set to 1 the behavior would be the round robin delivery as described above.

<T2DiagramPrefetch/>

> #### Note about `prefetchCount` = 1
>
> In most of the cases `prefetchCount` equal to 1 would be too conservative and severely
> limit consumer throughput.
> A couple of cases where this configuration is applicable can be found in [Spring AMQP Consumer Documentation](https://docs.spring.io/spring-amqp/reference/amqp/containerAttributes.html#prefetchCount)
>
> For more details on prefetch, please refer to the [Consumer Acknowledgements guide](/docs/confirms#channel-qos-prefetch).

However, with the `prefetchCount` set to 250 by default,
this tells RabbitMQ not to give more than 250 messages to a worker
at a time. Or, in other words, don't dispatch a new message to a
worker while the number of unacked messages is 250.
Instead, it will dispatch it to the next worker that is not still busy.

Desired `prefetchCount` value can be set via
`AbstractMessageListenerContainer.setPrefetchCount(int prefetchCount)`.

> #### Note about queue size
>
> If all the workers are busy, your queue can fill up. You will want to keep an
> eye on that, and maybe add more workers, or have some other strategy.

By using Spring AMQP you get reasonable values configured for
message acknowledgments and fair dispatching. The default durability
for queues and persistence for messages provided by Spring AMQP
allow the messages to survive even if RabbitMQ is restarted.

For more information on `Channel` methods and `MessageProperties`,
you can browse the [javadocs online](http://docs.spring.io/spring-amqp/docs/current/api/index.html?org/springframework/amqp/package-summary.html)
For understanding the underlying foundation for Spring AMQP you can find the
[rabbitmq-java-client](https://rabbitmq.github.io/rabbitmq-java-client/api/current/).


Now we can move on to [tutorial 3](./tutorial-three-spring-amqp) and learn how
to deliver the same message to many consumers.
