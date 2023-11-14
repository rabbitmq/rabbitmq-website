---
title: "This Month in RabbitMQ: March 2020 Recap"
tags: ["Updates", ]
authors: [mklishin]
---

Due to the uncertainties of the COVID-19 virus, the RabbitMQ Summit team is canceling the Berlin Summit in June 2020.
We do still hope that we can proceed with the plans for a summit in November in New York. Check back for updates.

Among other contributions this month, we have resources on using RabbitMQ successfully in a microservices architecture,
why you should use messaging in your project with Rabbit and SpringBoot, and many other tips and tricks.
So dive in, the water’s fine! And please stay safe, everyone.

<!-- truncate -->

## Project updates

* The 3.7.x series are now covered under the extended support policy (security patches and high severity bug fixes only).
3.7.x users are recommended to [upgrade](/docs/upgrade) to 3.8.x releases. [RabbitMQ 3.7.25 has shipped](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.25) to wrap up 3.7.x’s general support timeline.
* RabbitMQ .NET client version 5.2.0 and version 6.0.0 are [almost ready for release](https://groups.google.com/d/topic/rabbitmq-users/RA3EkGHJkuA/discussion).
Please test the latest release candidates, there are substantial efficiently improvements in the 6.0 release thanks to our awesome contributors.
* Erlang/OTP 22.3 has shipped. Debian and RPM packages produced by the RabbitMQ team are available from [PackageCloud](https://packagecloud.io/rabbitmq/erlang) and [Bintray](https://bintray.com/rabbitmq-erlang)

## Community Writings and Resources

* 1 Mar: Renato Groffe wrote about [cloud messaging with RabbitMQ, .NET Core, and Azure Functions](https://medium.com/@renato.groffe/mensageria-na-nuvem-com-rabbitmq-net-core-e-azure-functions-7c2a4f890448) (in Portuguese)
* 1 Mar: Rodolfo dos Santos Pinto creates a tutorial showing how to [post and consume messages to a Rabbit queue with 2 .Net Core applications](https://medium.com/@rodolfostopinto97/poc-net-core-rabbitmq-f1fb5d8eb58b) (in Portuguese)
* 5 Mar: Alex de Sousa on the benefits and challenges of [Yggdrasil and RabbitMQ Subscriptions](https://dev.to/alexdesousa/yggdrasil-and-rabbitmq-subscriptions-18k4)
* 9 Mar: Mcdavid Emereuwa (@mcdavid_95) tells us how to set up an [email service with RabbitMQ, AWS SES and PM2 on NodeJS](https://blog.learningdollars.com/2020/03/09/how-to-set-up-an-email-service-with-rabbitmq-aws-ses-and-pm2-on-nodejs/)
* 11 Mar: [Understanding queues with RabbitMQ](https://medium.com/@alfredobautista1/comprendiendo-las-colas-con-rabbitmq-i-6367d749fd6a), Part 1, by Alfredo Bautista Santos (in Spanish)
* 11 Mar: [Electing a new president using Node.js, Redis and RabbitMQ](https://medium.com/@dannyhobo/electing-a-new-president-using-node-js-redis-and-rabbitmq-fa58af874d68) (application performance tips) by Danny Hobo (@dannyhobo)
* 11 Mar: Simone Pezzano shared thoughts on [using RabbitMQ for microservices architecture](https://www.erlang-solutions.com/blog/using-rabbitmq-for-microservice-architecture-success-guest-blog-by-api-fortress-api.html) successfully
* 12 Mar: [Understanding queues with RabbitMQ, Part 2](https://medium.com/@alfredobautista1/comprendiendo-las-colas-con-rabbitmq-ii-866c0ce3a953), by Alfredo Bautista Santos (in Spanish)
* 14 Mar: Feyyaz Acet (@feyyazcet) writes about [using .Net Core 3.1 with RabbitMQ and MassTransit](https://medium.com/@feyyazacet/net-core-3-1-ile-masstransit-rabbitmq-de9102114bd6), a lightweight message bus for .Net (in Turkish)
* 14 Mar: Part 3: [RabbitMQ Queue with Docker in .NET](https://stefanescueduard.github.io/2020/03/14/rabbitmq-queue-with-docker-in-dotnet/) by Eduard Stefanescu (@EdStefanescu)
* 17 Mar: [ElixrMix: Data pipelines through Broadway](https://devchat.tv/elixir-mix/emx-090-data-pipelines-through-broadway-with-alex-koutmos/) with developer Alex Koutmos, expands on his recent blogs also featuring RabbitMQ
* 20 Mar: In this tutorial, Rida Shaikh shows how to implement a [Spring Boot + RabbitMQ example to retry messages on exception](https://dzone.com/articles/spring-boot-rabbitmq-tutorial-retry-and-error-hand)
* 21 Mar: Ed Stefanescu writes about the Consumer node of the [RabbitMQ topology with Docker in .NET](https://stefanescueduard.github.io/2020/03/21/rabbitmq-consumer-with-docker-in-dotnet/)
* 22 Mar: How to [install, run and monitor RabbitMQ in 5 minutes](https://medium.com/@gabrielhidalgoruiz/how-to-install-run-monitoring-rabbitmq-in-5-minutes-3e0325086fe0) by Gabriel Hidalgo Ruiz
* 24 Mar: Diego Alexandro de Oliveira explains why you should [use messaging in your project with RabbitMQ and Spring Boot](https://medium.com/totvsdevelopers/spring-boot-rabbitmq-porque-considerar-o-uso-de-mensageria-no-seu-projeto-3aed6637c4b4) (in Portuguese)
* 25 Mar: Magomed Aliev discusses [rate limiting with Celery and RabbitMQ](https://medium.com/analytics-vidhya/celery-throttling-setting-rate-limit-for-queues-5b5bf16c73ce)
* 25 Mar: Hardik Sondagar with a short tutorial on [how to publish a message with priority in RabbitMQ](https://dev.to/hardiksondagar/how-to-publish-message-with-priority-in-rabbitmq-1jd6)
* 27 Mar: Eric Satterwhite (@codedependant): How to send [data change events directly to RabbitMQ with PostgreSQL and Node.js](http://codedependant.net/2020/03/27/heard-of-rabbits-1-postgres-change-data-capture-and-rabbitmq/)
* 27 Mar: Gerhard Lazu (@gerhardlazu): [TGIR S01E03: How to contribute to RabbitMQ? Part 1](https://www.youtube.com/watch?v=EWU7WCqD_YA)
* 28 Mar: @aleks_kurakin writes about [Spring Boot: messaging, RabbitMQ](https://java-ru-blog.blogspot.com/2020/03/spring-boot-amqp-send-receive-message.html?spref=tw)], sending and receiving messages (in Russian)
* 28 Mar: Eduard Stefanescu: [RabbitMQ Headers Exchange with Docker in .NET](https://stefanescueduard.github.io/2020/03/28/rabbitmq-headers-exchange-with-docker-in-dotnet/)
* 31 Mar: Narongsak Keawmanee’s 2nd installment of his [blog series on NodeJS and RabbitMQ](https://medium.com/@klogic/simple-application-with-nodejs-and-rabbitmq-b3138dad93e3)

## Ready to learn more?

* On-demand, online at LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online at Udemy: [RabbitMQ: Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
* Online, $40 buys you early access to Marco Behler’s course, [Building a Real-World Java and RabbitMQ Messaging Application](https://www.marcobehler.com/courses/30-building-a-real-world-java-and-rabbitmq-messaging-amqp-application)
* Online, Pluralsight course: [RabbitMQ by Example](https://www.pluralsight.com/courses/rabbitmq-by-example) gets good reviews
