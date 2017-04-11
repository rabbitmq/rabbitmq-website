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
# RabbitMQ tutorial - "Hello World!" SUPPRESS-RHS

## Introduction

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>
<xi:include href="site/tutorials/tutorials-intro.xml.inc"/>

## "Hello World"

### (using the spring-amqp Client)

In this part of the tutorial we'll write two programs using the spring-amqp
library; a producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the Spring-amqp API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<div class="diagram">
  <img src="/img/tutorials/python-one.png" alt="(P) -> [|||] -> (C)" height="60" />
</div>

> #### The Spring AMQP Framework
>
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which
> is an open, general-purpose protocol for messaging. There are a number
> of clients for RabbitMQ in
> [many different languages](http://rabbitmq.com/devtools.html).
> Spring AMQP leverages Spring Boot for configuration and dependency
> management. Spring supports maven or gradle but for this tutorial we'll
> select maven with Spring Boot 1.5.2.
> Open the [Spring Initializr](http://start.spring.io) and provide:
> the group id (e.g. org.springframework.amqp.tutorials)
> the artifact id (e.g. rabbitmq-amqp-tutorials)
> Search for the amqp dependency and select the AMQP dependency.

<div class="diagram">
    <img src="/img/tutorials/spring-initializr.png" alt="(P) ->  [|||]" height="100" />
</div>

Generate the project and unzip the generated project
into the location of your choice. This can now be imported
into your favorite IDE.  Alternatively you can work on it from your
favorite editor.

### Configuring the project

Spring Boot offers numerous features but we will only highlight a few here.
First, Spring Boot applications have the option of providing their properties
through either an application.properties or application.yml file (there are
many more options as well but that will get us going). You'll find
an application.properties file in the generated project with nothing in it.
Rename application.properties to application.yml file with the following
properties:

    :::yml
    spring:
      profiles:
        active: usage_message

    logging:
      level:
        org: ERROR

    tutorial:
      client:
        duration: 10000

Create a new directory (package) where we can put the tutorial code (tut1).
We'll now create a JavaConfig file (Tut1Config.java) to describe our beans
in the following manner:

    :::java
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
            return new Queue("tut.hello");
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

Note that we've defined the 1st tutorial profile as either tut1
or hello-world. We use the @Configuration to let Spring know that
this is a Java Configuration and in it we create the definition
for our Queue ("tut.hello") and define our Sender and Receiver
beans.

We will run all of our tutorials through the Boot Application
now by simply passing in which profile we are using. To enable
this we will modify the generated  RabbitAmqpTutorialsApplication.java
with the following:

    :::java
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
            return new CommandLineRunner() {

                @Override
                public void run(String... arg0) throws Exception {
                    System.out.println("This app uses Spring Profiles to control its behavior.\n");
                    System.out.println("Sample usage: java -jar rabbit-tutorials.jar --spring.profiles.active=tut1,sender");
                }
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

and add the RabbitAmqpTutorialsRunner.java code as follows:

    :::java
    package org.springframework.amqp.tutorials;

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

Now there is very little code that needs to go into the
sender and receiver classes.  Let's call them Tut1Receiver
and Tut1Sender. The Sender leverages our config and the RabbitTemplate
to send the message.

    :::java
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

You'll notice that spring-amqp removes the boiler plate code
leaving you with only the logic of the messaging to be concerned
about.  We autowire in the queue that was configured in our
bean definition in the Tut1Config class and like many connection
abstractions, we wrap the boilerplate rabbitmq client classes with
a RabbitTemplate that can be autowired into the sender.
All that is left is to create a message and invoke the template's
convertAndSend method passing in the queue name from the bean
we defined and the message we just created.

The receiver is equally simple. We annotate our Receiver
class with @RabbitListener and pass in the name of the queue.
We then annotate our ```receive``` method with @RabbitHandler
passing in the payload that has been pushed to the queue.

    :::java
    package org.springframework.amqp.tutorials.tut1;

    import org.springframework.amqp.rabbit.annotation.RabbitHandler;
    import org.springframework.amqp.rabbit.annotation.RabbitListener;

    @RabbitListener(queues = "tut.hello")
    public class Tut1Receiver {

        @RabbitHandler
        public void receive(String in) {
            System.out.println(" [x] Received '" + in + "'");
        }
    }

##Usage

<div class="diagram">
  <img src="/img/tutorials/sending.png" alt="(P) -> [|||]" height="100" />
</div>

The app uses Spring Profiles to control what tutorial it's running, and whether it's a
Sender or Receiver.  Choose which tutorial to run by using the profile.
For example:

- {tut1|hello-world},{sender|receiver}

After building with maven, run the app however you like to run boot apps.

For example:

`Send` java -jar rabbitmq-tutorials.jar --spring.profiles.active=hello-world,sender
`Recv` java -jar rabbitmq-tutorials.jar --spring.profiles.active=hello-world,receiver

Time to move on to [part 2](tutorial-two-spring-amqp.html) and build a simple _work queue_.
