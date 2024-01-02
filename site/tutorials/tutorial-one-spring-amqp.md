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
### (using Spring AMQP)

In this part of the tutorial we'll write two programs using the spring-amqp
library; a producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the Spring AMQP API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="../img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60" />
</div>

> #### The Spring AMQP Framework
>
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which
> is an open, general-purpose protocol for messaging. There are a number
> of clients for RabbitMQ in
> [many different languages](http://rabbitmq.com/devtools.html).

We'll be using Spring Boot to bootstrap and configure our Spring AMQP
project. We chose Maven to build the project, but we could have used
Gradle as well.

The [source code of the project](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/spring-amqp)
is available online, but you can also do the tutorials from scratch.

If you choose the later, open the [Spring Initializr](http://start.spring.io) and provide:
the group id (e.g. `org.springframework.amqp.tutorials`)
the artifact id (e.g. `rabbitmq-amqp-tutorials`)
Search for the RabbitMQ dependency and select the RabbitMQ dependency.

<div class="diagram">
    <img src="../img/tutorials/spring-initializr.png" alt="(P) ->  [|||]"
        height="100" />
</div>

Generate the project and unzip the generated project
into the location of your choice. This can now be imported
into your favorite IDE.  Alternatively you can work on it from your
favorite editor.

### Configuring the project

Spring Boot offers numerous features but we will only highlight a few here.
First, Spring Boot applications have the option of providing their properties
through either an `application.properties` or `application.yml` file (there are
many more options as well but this will get us going). You'll find
an `application.properties` file in the generated project with nothing in it.
Rename application.properties to `application.yml` file with the following
properties:

<pre class="lang-java">
spring:
  profiles:
    active: usage_message

logging:
  level:
    org: ERROR

tutorial:
  client:
    duration: 10000
</pre>

Create a new package `tut1` where we can put the tutorial code.
We'll now create a Java configuration file `Tut1Config.java` to describe our
Spring beans in the following manner:

<pre class="lang-java">
package org.springframework.amqp.tutorials.tut1;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Profile({"tut1","hello-world"})
@Configuration
public class Tut1Config {

    @Bean
    public Queue hello() {
        return new Queue("hello");
    }

    @Profile("receiver")
    @Bean
    public Tut1Receiver receiver() {
        return new Tut1Receiver();
    }

    @Profile("sender")
    @Bean
    public Tut1Sender sender() {
        return new Tut1Sender();
    }
}
</pre>

Note that we've defined the first tutorial profile as either `tut1`,
the package name, or `hello-world`. We use the `@Configuration` annotation to
let Spring know that this is a Java Configuration and in it we
create the definition for our Queue ("hello") and define our
`Sender` and `Receiver` beans.

We will run all of our tutorials through the Boot Application
now by simply passing in which profiles we are using. To enable
this we will modify the generated  `RabbitAmqpTutorialsApplication` class
with the following:

<pre class="lang-java">
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RabbitAmqpTutorialsApplication {

    @Profile("usage_message")
    @Bean
    public CommandLineRunner usage() {
        return args -> {
            System.out.println("This app uses Spring Profiles to
                control its behavior.\n");
            System.out.println("Sample usage: java -jar
                rabbit-tutorials.jar
                --spring.profiles.active=hello-world,sender");
        };
    }

    @Profile("!usage_message")
    @Bean
    public CommandLineRunner tutorial() {
        return new RabbitAmqpTutorialsRunner();
    }

    public static void main(String[] args) throws Exception {
        SpringApplication.run(RabbitAmqpTutorialsApplication.class, args);
    }
}
</pre>

and add the `RabbitAmqpTutorialsRunner` class as follows:

<pre class="lang-java">
package org.springframework.amqp.tutorials.tut1;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ConfigurableApplicationContext;

public class RabbitAmqpTutorialsRunner implements CommandLineRunner {

    @Value("${tutorial.client.duration:0}")
    private int duration;

    @Autowired
    private ConfigurableApplicationContext ctx;

    @Override
    public void run(String... arg0) throws Exception {
        System.out.println("Ready ... running for " + duration + "ms");
        Thread.sleep(duration);
        ctx.close();
    }
}
</pre>

### Sending

<div class="diagram">
  <img src="../img/tutorials/sending.png" alt="(P) -> [|||]" height="100" />
</div>

Now there is very little code that needs to go into the
sender and receiver classes.  Let's call them `Tut1Receiver`
and `Tut1Sender`. The sender leverages our configuration and the `RabbitTemplate`
to send the message.

<pre class="lang-java">
// Sender
package org.springframework.amqp.tutorials.tut1;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;

public class Tut1Sender {

    @Autowired
    private RabbitTemplate template;

    @Autowired
    private Queue queue;

    @Scheduled(fixedDelay = 1000, initialDelay = 500)
    public void send() {
        String message = "Hello World!";
        this.template.convertAndSend(queue.getName(), message);
        System.out.println(" [x] Sent '" + message + "'");
    }
}
</pre>

You'll notice that Spring AMQP removes the boilerplate code
leaving you with only the logic of the messaging to be concerned
about.  We autowire in the queue that was configured in our
bean definition in the `Tut1Config` class and like many spring connection
abstractions, we wrap the boilerplate RabbitMQ client classes with
a `RabbitTemplate` that can be autowired into the sender.
All that is left is to create a message and invoke the template's
`convertAndSend` method passing in the queue name from the bean
we defined and the message we just created.

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

The receiver is equally simple. We annotate our receiver
class with `@RabbitListener` and pass in the name of the queue.
We then annotate our `receive` method with `@RabbitHandler`
passing in the payload that has been pushed to the queue.

<pre class="lang-java">
package org.springframework.amqp.tutorials.tut1;

import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;

@RabbitListener(queues = "hello")
public class Tut1Receiver {

    @RabbitHandler
    public void receive(String in) {
        System.out.println(" [x] Received '" + in + "'");
    }
}
</pre>

### Putting it all together

We must now build the JAR file:

<pre class="lang-bash">
./mvnw clean package
</pre>

The application uses Spring Profiles to control what tutorial it's running, and whether it's a
sender or receiver. To run the receiver, execute the following command:

<pre class="lang-bash">
# consumer
java -jar target/rabbitmq-tutorials.jar --spring.profiles.active=hello-world,receiver
</pre>

Open another shell to run the sender:

<pre class="lang-bash">
# sender
java -jar target/rabbitmq-tutorials.jar --spring.profiles.active=hello-world,sender
</pre>


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

Time to move on to [part 2](tutorial-two-spring-amqp.html) and
build a simple _work queue_.
