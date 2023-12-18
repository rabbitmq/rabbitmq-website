---
title: "This Month in RabbitMQ, April 2020 Recap"
tags: ["Updates", ]
authors: [mklishin]
---

### A Webinar on Quorum Queues

Before we start with RabbitMQ project and community updates from April,
we have a webinar to announce! Jack Vanlightly, a RabbitMQ core team member,
will present on [High Availability and Data Safety in Messaging](https://www.brighttalk.com/webcast/14891/412069)
on June 11th, 2020.

In this webinar, Jack Vanlightly will explain [quorum queues](/docs/quorum-queues),
a new replicated queue type in RabbitMQ. Quorum queues were introduced in RabbitMQ 3.8 with a focus on data safety
and efficient, predictable recovery from node failures.
Jack will cover and contrast the design of quorum and classic mirrored queues.

After this webinar, you'll understand:

 * Why quorum queues offer better data safety than mirrored queues
 * How and why server resource usage changes when switching to quorum queues from mirrored queues
 * Some best practices when using quorum queues

<!-- truncate -->

## Project Updates

 * [JMS Client 2.1.0](https://groups.google.com/d/msg/rabbitmq-users/Vg81lYLLKLA/sqKLJUhnAgAJ) is released with a new feature and dependency upgrades.
 * [HOP 3.7.0](https://groups.google.com/d/msg/rabbitmq-users/ON4haXBaKOw/je08cqx1AwAJ) is released with a new feature, usability improvements, and dependency upgrades.
 * TGIR episode 5 is out and it covers [running RabbitMQ on Kubernetes](https://www.youtube.com/watch?v=-yU95ocpBYs)
 * [RabbitMQ 3.8.4](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.4) is released with support for Erlang 23
 * [Erlang 23](http://blog.erlang.org/OTP-23-Highlights/) includes an important improvement for container
    users: the runtime now takes CPU quotas into account when computing how many [runtime schedulers](/docs/runtime) to start
 * Docker community's RabbitMQ image is [updated](https://github.com/docker-library/rabbitmq/issues/409) to RabbitMQ 3.8.4 and Erlang 23
 * Version 2.2.0 of [Go client for RabbitMQ HTTP API](https://github.com/michaelklishin/rabbit-hole/blob/master/ChangeLog.md) was released. We'd like to thank [Raymond Fallon](https://github.com/niclic) for major contributions to this release.


## Community Writings

 * April 3:  Gabor Olah presented [an introduction to RabbitMQ](https://www.erlang-solutions.com/blog/an-introduction-to-rabbitmq-what-is-rabbitmq.html)
 * April 4:  A new article about [RabbitMQ Headers Exchange with Docker in .NET](https://stefanescueduard.github.io/2020/04/04/rabbitmq-consumer-events-with-docker-in-dotnet/),  by Eduard Stefanescu (@EdStefanescu)
 * April 6:  Lovisa Johannson walks us through [asynchronous communication, illustrated by RabbitMQ](https://www.cloudamqp.com/blog/2016-09-13-asynchronous-communication-with-rabbitmq.html)
 * April 9:  [An introduction to RabbitMQ](https://slacker.ro/2020/04/09/an-introduction-to-rabbitmq-what-is-rabbitmq) by Erlang Solutions
 * April 9:  [Lessons for building a successful open source project](https://blogs.vmware.com/opensource/2020/04/09/open-source-contributions-rabbitmq/) from the RabbitMQ experience, by Dan Carwin
 * April 15:  [Using Celery with RabbitMQ's lazy classic queue mode](https://blog.whtsky.me/tech/2020/using-celery-with-rabbitmqs-lazy-queue/)
 * April 18: Via the blog, Programming with Wolfgang, Wolfgang Ofner finishes a three-part series on microservices with a how-to on [RabbitMQ in an ASP .Net Core 3.1 Microservice](https://www.programmingwithwolfgang.com/rabbitmq-in-an-asp-net-core-3-1-microservice/)
 * April 20:  Jack Vanlightly [introduces us to quorum queues](/blog/2020/04/20/rabbitmq-gets-an-ha-upgrade), the latest type of replicated queue that provide data safety guarantees for your messages.
 * April 21:  Jack Vanlightly continues his [blog series on quorum queues](/blog/2020/04/21/quorum-queues-and-why-disks-matter) with a closer look at their performance characteristics on different storage configurations.
 * April 22:  Over at Dev, Enrico Bison (@enricobix) compares [RabbitMQ exchange types](https://dev.to/enbis/amqp-exchange-type-comparison-using-go-rabbitmq-client-39p7)
 * April 27: Danny Simantov talks about [building a web-scraper for hourly news headlines](https://medium.com/swlh/backend-web-scraping-with-kubernetes-puppeteer-node-js-efe7513d834c) with RabbitMQ
 * April 27:  Composing a [pub/sub scenario with MassTransit 6.2 + RabbitMQ +.NET Core 3.1](https://medium.com/@alikzlda/a-simple-pub-sub-scenario-with-masstransit-6-2-rabbitmq-net-core-3-1-elasticsearch-mssql-5a65c993b2fd) + Elasticsearch + MSSQL from Ali Kizildag (@alikzlda)
 * April 27:  [Using RabbitMQ with the Symfony PHP framework](https://medium.com/@ibrahimgunduz34/using-rabbitmq-in-a-symfony-application-through-messenger-component-e61498b668b), by Ibharim Gunduz (@ibrahimgunduz34)
 * April 29:  An overview of [connecting to RabbitMQ in Golang](https://qvault.io/2020/04/29/connecting-to-rabbitmq-in-golang/) by Lane Wagoner (@wagslane)


## Learn More

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

 * New course: [Introduction to Spring Cloud Stream](https://www.baeldung.com/spring-cloud-stream) by baeldung, illustrated with RabbitMQ
 * [RabbitMQ Expert Training](https://www.eventbrite.co.uk/e/rabbitmq-expert-training-online-tickets-102979348002) — Online, by Erlang Solutions, Nov 9 2020
