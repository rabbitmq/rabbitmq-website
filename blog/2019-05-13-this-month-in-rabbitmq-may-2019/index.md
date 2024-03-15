---
title: "This Month in RabbitMQ — May 2019"
tags: ["Updates", ]
authors: [mklishin]
---

Couple of key public service announcements this month. First, the deadline for [submitting a talk for RabbitMQ Summit 2019](https://rabbitmqsummit.com/) (5 November in London UK) was May 10. We had a great line-up last year at the inaugural event and we’re looking forward to an even better event this fall.

Then, on May 23, we’ll be doing an overview of [what’s new in RabbitMQ 3.8](https://content.pivotal.io/webinars/may-23-what-s-new-in-rabbitmq-3-8-webinar?utm_source=blog&amp;utm_medium=email-link&amp;utm_campaign=rabbitmq-3.8-what's-new&amp;utm_term=q219) (beta 4 of which [has dropped recently](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.0-beta.4)). Whether you’re a couple versions behind, or on [the latest](/release-information) 3.7.14 release, you’re going to want to learn about the latest features and changes.

<!-- truncate -->

## Project updates

* [RabbitMQ 3.7.15-beta.1](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.15-beta.1) is available for community testing
* And so is [3.8.0-beta.4](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.0-beta.4).
* Team RabbitMQ has published an overview of a new [feature flag subsystem](/blog/2019/04/23/simplifying-rolling-upgrades-between-minor-versions-with-feature-flags) shipping in RabbitMQ 3.8. The purpose of this subsystem is to simplify rolling upgrades between releases that have incompatible or potentially incompatible changes.
* [RabbitMQ Docker image](https://github.com/docker-library/rabbitmq) now ships RabbitMQ 3.7.14 and 3.7.15-beta.1 on latest Erlang and OpenSSL 1.1.1b
* [Java client 5.7.0](https://groups.google.com/d/msg/rabbitmq-users/-BhkggixlsU/w5P3_geiBAAJ) (for Java 8+) and [4.11.0](https://groups.google.com/d/msg/rabbitmq-users/du44LNT4zRU/OWlPdgCiBAAJ) (for Java 6 &amp; 7) have been released with usability improvements and dependency upgrades.
* [Reactor RabbitMQ 1.2.0 GA](https://groups.google.com/d/msg/rabbitmq-users/e4fE-9X-QKs/porAB9GiBAAJ) has been released, with a bug fix, dependency upgrades, and improvements in the publisher confirms support. [Reactor RabbitMQ](https://github.com/reactor/reactor-rabbitmq)) is a reactive API for RabbitMQ based on [Reactor](http://projectreactor.io/) and RabbitMQ Java client. Reactor RabbitMQ goal is to enable messages to be published to and consumed from RabbitMQ using functional APIs with non-blocking back-pressure and very low overhead.
* Debian and RPM packages of several latest Erlang and Elixir releases are now available in Team RabbitMQ's [Erlang Bintray repository](https://bintray.com/rabbitmq-erlang/)

## Community writings and resources

* The CloudAMQP team published an article by Jack Vanlightly ([@vanlightly](https://twitter.com/vanlightly)) on [Quorum Queues Internals—A deep dive](https://www.cloudamqp.com/blog/2019-04-03-quorum-queues-internals-a-deep-dive.html). This is a continuation to their [post on quorum queues](https://www.cloudamqp.com/blog/2019-03-28-rabbitmq-quorum-queues.html) from March.
* Thanks to Gavin Roy ([@crad](https://twitter.com/Crad)), [RabbitPy 2.0 now available](https://pypi.org/project/rabbitpy/)
* Pankaj Panigrahi ([@pnkjPanigrahi](https://twitter.com/pnkjPanigrahi)) published on [Implementing RabbitMQ with Node.JS](https://medium.com/@pankaj.panigrahi/implementing-rabbitmq-with-node-js-93e15a44a9cc)
* Simon Benitez over at Erlang Solutions published on how RabbitMQ is used as for [inter-service communication in an open source continuous delivery system](https://www.erlang-solutions.com/blog/ex_rabbit_pool-open-source-amqp-connection-pool.html)
* Anthony Valentin wrote about [a tool for visualizing RabbitMQ topology and metrics, called AliceMQ](https://medium.com/@90valentin/visualizing-your-rabbitmq-instance-with-alicemq-787a422c03de)
* Jason Farrell ([@jfarrell](https://twitter.com/jfarrell)) shared a demo of a [.NET Core Hosted Service](https://github.com/xximjasonxx/kubedemo) feeding stock price data into RabbitMQ and via PubSub communicating to a .NET Core Web app via @SignalR, all running in Kubernetes
* [In French] Zwindler wrote about RabbitMQ basics and best practices [RabbitMQ basics and best practices](https://blog.zwindler.fr/2019/04/16/suivez-le-lapin-orange-intro-et-bonnes-pratiques-dinfra-rabbitmq/)
* Bart?omiej Klimczak ([@kabanek](https://twitter.com/kabanek)) shared some [lessons learned from using RabbitMQ](https://medium.com/@bartlomiej.kielbasa/learning-on-mistakes-ff88532b259) as the heart of the platform used by the Brainly team
* Odelucca ([@_odelucca](https://twitter.com/_odelucca)) published the second part of his series on [building a recommendation algorithm using Python and RabbitMQ](https://medium.com/@odelucca/recommendation-algorithm-using-python-and-rabbitmq-part-2-connecting-with-rabbitmq-aa0ec933e195)
* Muutech published about the [importance of monitoring a messaging system like RabbitMQ](https://www.muutech.com/en/message-queues-today/), using an automotive supplier example
* Vitaliy Samofal wrote the first part of [an introduction to messaging technologies](https://freshcodeit.com/blog-introduction-to-message-brokers-part-1-apache-kafka-vs-rabbitmq), focused on comparing RabbitMQ and Apache Kafka (also [published on HackerNoon](https://hackernoon.com/introduction-to-message-brokers-part-1-apache-kafka-vs-rabbitmq-8fd67bf68566))
* HelloFresh updated [Kandalf](https://github.com/hellofresh/kandalf), a RabbtiMQ-Kafka bridge

## Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

* 16-17 May 2019 — Stockholm — See Karl Nilsson and Ayanda Dube speak about RabbitMQ at [Code BEAM](https://codesync.global/conferences/code-beam-sto-2019/)
* 23 May 2019 — Online Webinar: [What’s new in RabbitMQ 3.8](https://content.pivotal.io/webinars/may-23-what-s-new-in-rabbitmq-3-8-webinar?utm_source=blog&amp;utm_medium=email-link&amp;utm_campaign=rabbitmq-3.8-what's-new&amp;utm_term=q219)
* 5 November 2019 — London — [RabbitMQ Summit](https://rabbitmqsummit.com/)
* On-demand, online at LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online at Udemy: RabbitMQ: [Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
