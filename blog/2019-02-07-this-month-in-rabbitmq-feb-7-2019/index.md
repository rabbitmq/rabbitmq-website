---
title: "This Month in RabbitMQ — Feb 7, 2019"
tags: ["Updates", ]
authors: [mklishin]
---

Welcome back for another issue of This Month in RabbitMQ. Hopefully you are finding this new series helpful to keep up with the latest project updates and community topics. As we look across the different articles published throughout the month, it’s clear that it truly has a polyglot community. From Spring and .NET, to Ruby and Node.js, there are active users of RabbitMQ out there writing in many different languages. It’s a polyglot world, and we’re connecting it all together!

<!-- truncate -->

## Project Updates

* [RabbitMQ 3.7.11](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.11) is available. It focuses on bug fixes and minor usability improvements. In particular, this release adds several new [rabbitmq-diagnostics](/docs/man/rabbitmq-diagnostics.8) commands useful for diagnostics and health checks. This is also the first release to require Erlang/OTP 20.3.
* [Second beta](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.0-beta.2) of RabbitMQ 3.8.0 is also out. [Quorum queues](/docs/quorum-queues) are now more stable, polished, and support more features. Give them a try!
* [RabbitMQ Docker image](https://hub.docker.com/_/rabbitmq) now provides the latest RabbitMQ and Erlang. The image is also [automatically updated](https://github.com/docker-library/rabbitmq/pull/305) when new RabbitMQ and Erlang releases come out.
* The Docker image now can be used to easily [test RabbitMQ 3.8.0 beta releases](https://github.com/docker-library/rabbitmq/pull/302).
* [Reactor RabbitMQ 1.1.0](https://groups.google.com/d/msg/rabbitmq-users/x3L2HPWuP1Y/5OH2iZmyFwAJ) GA has been released, with bug fixes, dependency upgrades, and new features.
* [Java client 5.6.0](https://groups.google.com/d/msg/rabbitmq-users/y20hnH1ZnMA/fpchrvR1FgAJ) for (Java 8+) and [4.10.0](https://groups.google.com/d/msg/rabbitmq-users/Fl8MdG2ZfeU/wJoSROd1FgAJ) for (Java 6 &amp; 7) have been released with bug fixes and new features.
* Hop 3.1.0 GA has been released with a new feature and dependency upgrade. [Hop](https://github.com/rabbitmq/hop) is a RabbitMQ HTTP API client for Java, Groovy, and other JVM languages.
* [JMS client 1.10.2](https://groups.google.com/d/msg/rabbitmq-users/AvTbZgiQFa8/jIADaoNoFwAJ) has been released with a bug fix.
* [Monitoring doc guide](/docs/monitoring) has been expanded with a new section on health checks
* CLI tools now provide a [range of progressive health checks](https://github.com/rabbitmq/rabbitmq-cli/issues/292) that operators can use individually or in combination
* [OpenSUSE repositories were updated](https://groups.google.com/forum/#!msg/rabbitmq-users/4azFra05kFI/Ha8jN1tEGAAJ) to provide most recent RabbitMQ and Erlang versions

## Community writings and resources

* [Jayakrishnan](https://twitter.com/that_coder) published about [getting started with RabbitMQ and Node.js](https://thatcoder.space/getting-started-with-rabbitmq-and-node-js/)
* [Jason Goldberg](https://twitter.com/betashop) noted how RabbitMQ is a "key element" of the OST KIT in [Inside the OST Technology Stack as We Prepare for Pilot Launches](https://medium.com/ostdotcom/inside-the-ost-technology-stack-as-we-prepare-for-pilot-launches-bcab8e87598e)
* [Wander Costa](https://twitter.com/rwanderc) published on the MyTaxi engineering blog about [using Spring Boot with multiple RabbitMQ Brokers](https://inside.mytaxi.com/springboot-with-multiple-rabbitmq-brokers-cec203c3f77)
* Alok Singhal published about [RabbitMQ Queues — High Availability and Migration](https://medium.com/@aloksinghal/rabbitmq-queues-high-availability-and-migration-d75d63e1199a)
* Julio Falbo published on [Different types of RabbitMQ Exchanges](https://medium.com/devopslinks/different-types-of-rabbitmq-exchanges-9fefd740505d)
* Tr?n Ti?n ??c highlights the importance of error handling in his post [RabbitMQ EventBus system](https://medium.com/linagora-engineering/rabbitmq-eventbus-system-b159f46704be)
* [Daniel Battaglia](https://twitter.com/daniel_bytes) published how Kontena builds [Event-Driven Microservices with RabbitMQ and Ruby](https://ghost.kontena.io/event-driven-microservices-with-rabbitmq-and-ruby/)
* Akshay Patel published on [.NET Core Web API Logging Using NLog In RabbitMQ](https://www.c-sharpcorner.com/article/net-core-web-api-logging-using-nlog-in-rabbitmq/)
* Java In Use published a post and video on how to [Build a Chat Application using Spring Boot + WebSocket + RabbitMQ](https://www.javainuse.com/spring/boot-websocket-chat)
* [Lovisa Johansson](https://twitter.com/lillajja) &amp; [Elin Vinka](https://twitter.com/linneajohanna) published a case study about how Softonic is using RabbitMQ in an [event-based microservices architecture to support 100 million users a month](https://www.cloudamqp.com/blog/2019-01-18-softonic-userstory-rabbitmq-eventbased-communication.html)
* [Robert Novotny](https://twitter.com/RoboNovotny) published [Enforcing Spring Cloud Contracts Over AMQP](https://novotnyr.github.io/scrolls/enforcing-spring-cloud-contracts-over-amqp/)

## Upcoming Events

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ:

* 25 February 2019 — [Pivotal RabbitMQ Course](https://www.flane.co.uk/course-schedule/pivotal-rmq) — Ljubljana/Online
* 15 April 2019 — [Pivotal RabbitMQ Course](https://www.flane.co.uk/course-schedule/pivotal-rmq) — London
