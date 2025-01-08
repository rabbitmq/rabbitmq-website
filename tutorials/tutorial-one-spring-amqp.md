---
title: RabbitMQ tutorial - "Hello World!"
---
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

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';
import TutorialsIntro from '@site/src/components/Tutorials/TutorialsIntro.md';
import T1DiagramHello from '@site/src/components/Tutorials/T1DiagramHello.md';
import T1DiagramSending from '@site/src/components/Tutorials/T1DiagramSending.md';
import T1DiagramReceiving from '@site/src/components/Tutorials/T1DiagramReceiving.md';

# RabbitMQ tutorial - "Hello World!"

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## "Hello World"
### (using Spring AMQP)

In this part of the tutorial we'll write two programs using the spring-amqp
library; a producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the Spring AMQP API, concentrating on this very simple thing just to get
started. It's the "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

<T1DiagramHello/>

> #### The Spring AMQP Framework
>
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which
> is an open, general-purpose protocol for messaging. There are a number
> of clients for RabbitMQ in
> [many different languages](/client-libraries/devtools).

We'll be using Spring Boot to bootstrap and configure our Spring AMQP
project. We chose Maven to build the project, but we could have used
Gradle as well.

The [source code of the project](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/spring-amqp)
is available online, but you can also do the tutorials from scratch.

If you choose the later, open the [Spring Initializr](http://start.spring.io) and provide:
the group id (e.g. `org.springframework.amqp.tutorials`)
the artifact id (e.g. `rabbitmq-amqp-tutorials`)
Search for the RabbitMQ dependency and select the RabbitMQ dependency.

<T1DiagramSending/>

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

```java
spring:
  profiles:
    active: usage_message

logging:
  level:
    org: ERROR

tutorial:
  client:
    duration: 10000
```

Create a new package `tut1` where we can put the tutorial code.
We'll now create a Java configuration file `Tut1Config.java` to describe our
Spring beans in the following manner:

```java
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
```

Note that we've defined the first tutorial profile as either `tut1`,
the package name, or `hello-world`. We use the `@Configuration` annotation to
let Spring know that this is a Java Configuration and in it we
create the definition for our Queue ("hello") and define our
`Sender` and `Receiver` beans.

We will run all of our tutorials through the Boot Application
now by simply passing in which profiles we are using. To enable
this we will modify the generated  `RabbitAmqpTutorialsApplication` class
with the following:

```java
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
```

and add the `RabbitAmqpTutorialsRunner` class as follows:

```java
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
```

### Sending

<T1DiagramReceiving/>

Now there is very little code that needs to go into the
sender and receiver classes.  Let's call them `Tut1Receiver`
and `Tut1Sender`. The sender leverages our configuration and the `RabbitTemplate`
to send the message.

```java
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
```

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
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker [log file](/docs/logging/) to see if there
> is a [resource alarm](/docs/alarms) logged and reduce the
> free disk space threshold if necessary.
> The [Configuration guide](/docs/configure#config-items)
> will show you how to set <code>disk_free_limit</code>.

### Receiving

The receiver is equally simple. We annotate our receiver
class with `@RabbitListener` and pass in the name of the queue.
We then annotate our `receive` method with `@RabbitHandler`
passing in the payload that has been pushed to the queue.

```java
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
```

### Putting it all together

We must now build the JAR file:

```bash
./mvnw clean package
```

The application uses Spring Profiles to control what tutorial it's running, and whether it's a
sender or receiver. To run the receiver, execute the following command:

```bash
# consumer
java -jar target/rabbitmq-tutorials.jar --spring.profiles.active=hello-world,receiver
```

Open another shell to run the sender:

```bash
# sender
java -jar target/rabbitmq-tutorials.jar --spring.profiles.active=hello-world,sender
```


> #### Listing queues
>
> You may wish to see what queues RabbitMQ has and how many
> messages are in them. You can do it (as a privileged user) using the `rabbitmqctl` tool:
>
> ```bash
> sudo rabbitmqctl list_queues
> ```
>
> On Windows, omit the sudo:
> ```PowerShell
> rabbitmqctl.bat list_queues
> ```

Time to move on to [part 2](./tutorial-two-spring-amqp) and
build a simple _work queue_.
