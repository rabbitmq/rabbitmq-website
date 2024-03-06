---
title: "This Month in RabbitMQ, November 2018"
tags: ["Updates", ]
authors: [mklishin]
---

Hello RabbitMQ friends! Welcome to the first installment of This Month in RabbitMQ, inspired by the wonderful and industrious [Josh Long](https://twitter.com/starbuxman), who publishes monthly and weekly recaps for the Spring community.
Our team was also inspired by the first ever RabbitMQ Summit that we held on November 12 in London.
It was awesome to see an assembly of the community and the knowledge shared. Look out for videos from that event in a future issue of This Month in RabbitMQ.

Without further ado, let's take a look at a roundup of what happened in RabbitMQ land last month!

<!-- truncate -->

## Project Updates

* RabbitMQ 3.7.9 [has been released](https://groups.google.com/forum/#!topic/rabbitmq-users/87A0wqH-z5s) ([release artifacts](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.9), [change log](/release-information))
* As of 3.7.9, [cipher suites](/docs/ssl#cipher-suites) now can be configured via [new style configuration format](/blog/2018/02/22/new-configuration-format-in-rabbitmq-3-7).
* Marcial Rosales produced a set of guidelines that demonstrate [how to develop applications more resilient to failures](https://github.com/rabbitmq/workloads/tree/master/resiliency) common in messaging-based systems, whether they use RabbitMQ Java client directly or Spring AMQP
* RabbitMQ repositories on PackageCloud have [switched to a new GPG key](https://groups.google.com/d/msg/rabbitmq-users/8Kyp265m4pE/BBM0bixZBgAJ)
* Karl Nilsson delivered a talk on our [implementation of Raft](https://www.youtube.com/watch?v=7NNjjTrBZtw). Our team is [adopting Raft](https://www.youtube.com/watch?v=w-_1Wwymk58) in a new replicated queue implementation and more.
* New doc guide that [covers multiple topics related to consumers](/docs/consumers) in RabbitMQ
* New doc [guide on monitoring](/docs/monitoring)
* Expanded [cluster formation guide](/docs/cluster-formation)

## Community Writings and Resources

* [RabbitMQ mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users) had threads in November
* Dormain Drewitz published a Twitter Moment of [live tweet coverage](https://twitter.com/i/moments/1062010422944038912) from the RabbitMQ Summit
* Elin Vinka published [RabbitMQ and Microservices](https://www.cloudamqp.com/blog/2018-11-02-rabbitmq-and-microservices.html)
* Eko Simanjuntak explores how RabbitMQ supports microservices in a Hackernoon blog, [Messaging System—Hands On](https://hackernoon.com/messaging-system-hands-on-7dda1afded37)
* Arnaud Lahaxe published [Symfony Messenger et RabbitMQ](https://outweb.eu/symfony-messenger-et-rabbitmq/) (in French)
* Jack Vanlightly published [Why I Am Not A Fan Of The RabbitMQ Sharding Plugin](https://jack-vanlightly.com/blog/2018/11/14/why-i-am-not-a-fan-of-the-rabbitmq-sharding-plugin)
* Dormain Drewitz of Pivotal published a [recap of the expert panel discussion](https://content.pivotal.io/pivotal-blog/rabbitmq-expert-opinions-rabbitmq-summit-panel-recap) at the RabbitMQ Summit
* Dattell published Kafka vs. RabbitMQ: [How to choose an open source message broker](https://dattell.com/data-architecture-blog/kafka-vs-rabbitmq-how-to-choose-an-open-source-message-broker/)
* Jack Vanlightly published [Quorum Queues - Making RabbitMQ More Competitive In Reliable Messaging](https://jack-vanlightly.com/blog/2018/11/20/quorum-queues-making-rabbitmq-more-competitive)
* Leonardo Soares of Mollie published [Keeping RabbitMQ connections alive in PHP](https://blog.mollie.com/keeping-rabbitmq-connections-alive-in-php-b11cb657d5fb)
* Stephan Bester published [AMQP with Delphi 6 and RabbitMQ](https://medium.com/@step.bester/amqp-with-delphi-6-and-rabbitmq-97da02c261d8) 
* Andreas Finger shared a presentation and demo on [A Simpler (micro)service setup with RabbitMQ](https://github.com/mediafinger/rabbitmq_presentation) 
* Tomas Vasquez shared a [library to use RabbitMQ with C#](https://github.com/Tomamais/rabbitmq_csharp)
* Danny Kay of Sky Betting and Gaming published [Making Kafka & RabbitMQ Integration easier with Spring Cloud Stream : Part 1](https://medium.com/@danieljameskay/making-kafka-rabbitmq-integration-easier-with-spring-cloud-stream-part-1-ddbb1c6bf283)
* Lovisa Johansson published [Is HiPE production ready?](https://www.cloudamqp.com/blog/2018-11-26-is-hipe-production-ready.html)
* After RabbitMQ Summit @DBcodes played around with RabbitMQ and created a [small repository](https://bitbucket.org/dbcodes/rabbitmq-cluster) to play around with three nodes and understand clustering a little better.

## Upcoming Events

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ:

* On December 12, 2018 Pivotal hosts a webinar: [10 Things Every Developer Using RabbitMQ Should Know](https://content.pivotal.io/webinars/dec-12-10-things-every-developer-using-rabbitmq-should-know-webinar)
* [RabbitMQ Express at Code Beam SF](https://codesync.global/conferences/code-beam-sf-2019/#Training ) in San Francisco on February 27, 2019
