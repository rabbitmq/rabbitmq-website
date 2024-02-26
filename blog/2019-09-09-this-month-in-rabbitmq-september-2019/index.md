---
title: "This Month in RabbitMQ — September 2019"
tags: ["Updates", ]
authors: [mklishin]
---

Welcome back for another edition of This Month in RabbitMQ! Exciting news is that the [first release candidate for RabbitMQ 3.8](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.0-rc.1) is now available!

Be sure to catch up on what is new in 3.8 by reading the release notes and watching this [webinar replay](https://content.pivotal.io/webinars/may-23-what-s-new-in-rabbitmq-3-8-webinar?utm_campaign=rabbitmq-blog-3.8-webinar-q319&amp;utm_source=rabbitmq&amp;utm_medium=website).

We are starting to countdown until [RabbitMQ Summit](https://rabbitmqsummit.com/) in London on November 4.
The RabbitMQ team is looking forward to sharing updates on the project,
but we’re also looking forward to hearing from end-users like Bloomberg, WeWork, Softonic, and Zalando.
Be sure to register and snag a spot in one of the training add-on courses.

<!-- truncate -->

## Project updates

* [First release candidate for RabbitMQ 3.8](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.0-rc.1) is available for community testing
* [Next generation Prometheus support](/docs/prometheus) has been thoroughly reviewed with the help of [Brian Brazil](https://github.com/brian-brazil)
* Erlang 20.3 support is [being discontinued](https://groups.google.com/forum/#!searchin/rabbitmq-users/ANN|sort:date/rabbitmq-users/9tc_OE1eMPk/ly1NEISwBwAJ) soon. Please [upgrade to a supported version](/docs/which-erlang)
* New Spring Integration and Spring AMQP [releases are available](https://spring.io/blog/2019/08/08/new-spring-integration-amqp-kafka-maintenance-and-milestone-releases)
* [php-amqplib 2.10.0](https://github.com/php-amqplib/php-amqplib/releases/tag/v2.10.0) is released
* [JMS client 1.13.0](https://groups.google.com/d/msg/rabbitmq-users/XFbLrNYnF78/UXBKPOVBAQAJ) is released with a new feature (support for publisher confirms), bug fixes, and dependency upgrades
* [Ra](https://github.com/rabbitmq/ra/), our Raft implementation library, has gone 1.0

## Community writings and resources

* August 1: Aidan Ruff published on [RabbitMQ as an MQTT broker](https://tech.scargill.net/rabbitmq-mqtt-broker/)
* August 4: Antonio Musarra wrote about [using CloudAMQP RabbitMQ service for MQTT](https://www.dontesta.it/2019/08/04/raspberry-pi-sense-hat-come-pubblicare-dati-cloudamqp-mqtt/)
* August 5: TekLoon followed up on a post from July, this time about [how they deploy a microservice to Heroku with RabbitMQ](https://medium.com/better-programming/how-i-deploy-microservice-to-heroku-with-rabbitmq-876499c797cc)
* August 5: Júlio Falbo (@juliofalbo77) from TradeShift wrote about [an open source library that helps integrate Spring Boot with RabbitMQ](https://medium.com/tradeshift-engineering/spring-rabbitmq-tuning-f94723598312), as an alternative to Spring AMQP
* August 9: Erlang Solutions published a video from at a Meetup in Krakow where Szymon Mentel (@szymonmentel) presents [examples of how to achieve high availability in RabbitMQ](https://www.youtube.com/watch?v=MFH-GDYdxwQ&amp;utm_source=dlvr.it&amp;utm_medium=twitter)
* August 9: The Italian Agile Movement published a video of Gabriele Santomaggio (@GSantomaggio) speaking (in Italian) on [microservices integration and how RabbitMQ compares](https://vimeo.com/351826121) to other open source messaging technologies
* August 12: Brant Burnett (@btburnett3) wrote about [blue/green deployments in the context of messaging on Kubernetes](https://btburnett.com/kubernetes/microservices/continuous%20delivery/2019/08/12/shawarma.html) using Shawarma
* August 12: Alexander Ma published the [second part of an introduction to microservices](https://medium.com/@alexma6614/rabbitmq-flask-go-tutorial-pt-2-7161feb654c6) using Python, Go, RabbitMQ, and Redis
* August 12: Wojciech Suwa?a published part 6 in a series on building microservices on .NET Core. This part was focused on [real-time server-client communication with SignalR and RabbitMQ](https://altkomsoftware.pl/en/blog/building-microservices-6/)
* August 13: Radu Vunvulea (@RaduVunvulea) wrote about [using MQTT protocol inside Azure with RabbitMQ on top of AKS](http://vunvulearadu.blogspot.com/2019/08/mqtt-protocol-inside-azure-rabbitmq-on.html)
* August 16: Angga Kusumandaru (@ndaruoke) wrote about [using RabbitMQ, Bunny and Sneakers](https://medium.com/@kusumandaru/publish-subscribe-on-ruby-on-rails-6aa6893ef819) to set up a publish and subscribe architecture in Ruby on Rails
* August 17: Marius Jaraminas published about [What is RabbitMQ and Why it’s Needed?](https://codespacelab.com/index.php/2019/08/17/what-is-rabbitmq-and-why-its-needed/). He also published about how to [avoid having a single messaging point of failure](https://codespacelab.com/index.php/2019/08/17/rabbitmq-single-point-of-failure/)
* August 18: Luke Mwila (@LuKE9ine) wrote [A Quick Guide To Understanding RabbitMQ &amp; AMQP 0-9-1](https://medium.com/swlh/a-quick-guide-to-understanding-rabbitmq-amqp-ba25fdfe421d)
* August 19: Marius Jaraminas at it again with [RabbitMQ and Spring Cloud Stream](https://codespacelab.com/index.php/2019/08/19/rabbitmq-and-spring-cloud-stream/)
* August 21: Quintessence Anx (@QuintessenceAnx) published the first part of a blog series on [monitoring RabbitMQ with the ELK Stack and Logz.io](https://logz.io/blog/monitoring-rabbitmq-with-elk-and-logz-io-part-1/)
* August 22: Rocky Lhotka (@RockyLhotka) wrote about his recent work on a data portal channel [based on using RabbitMQ as the underlying transport](http://www.lhotka.net/weblog/RabbitMQDataPortalChannelInCSLA5.aspx)
* August 22: Olushola Karokatose (@Olushola_k) published about [getting started with Golang by building a project with RabbitMQ](https://dev.to/olushola_k/working-with-rabbitmq-in-golang-1kmj)
* August 23: Marlon Monçores wrote about [using Spring Cloud Stream and RabbitMQ](https://medium.com/m4u-tech/mantendo-a-velocidade-de-entrega-mesmo-com-mensagens-ruins-spring-cloud-rabbitmq-383dbd92efae) (in Portuguese)
* August 26: Surat Pyari (@suratpyaridb) published another part in her series on microservices with Sinatra, this time walking through [how to queue requests with RabbitMQ](https://blazarblogs.wordpress.com/2019/08/26/rabbitmq-in-sinatra-an-addition-for-micro-service/)
* August 26: Syed Sirajul Islam Anik (@sirajul_anik) wrote a [thorough introduction to RabbitMQ](https://medium.com/@sirajul.anik/easy-peasy-rabbitmq-squeezy-820b1c632465)
* August 28: Marius Jaraminas publishes a FOURTH blog on [RabbitMQ Scalability Testing](https://codespacelab.com/index.php/2019/08/28/rabbitmq-scalability-testing/)
* August 29: Nicolas Judalet (@JudaletNicolas) wrote an [Introduction to Event-driven Architectures With RabbitMQ](https://blog.theodo.com/2019/08/event-driven-architectures-rabbitmq/)
* August 30: Mike Møller Nielsen (@MikeMoelNielsen) published a [video explaining the fan-out, topic, and direct exchange  types](https://www.youtube.com/watch?v=lqrCNhiTgTo&amp;feature=youtu.be) in RabbitMQ

## Events and Training

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

* 12 September 2019, Bern: DevOps Meetup on Observability and DevOps: [Value Stream Mapping with RabbitMQ](https://www.meetup.com/DevOps-Bern/events/262813160/)
* 30 September 2019, NYC: [RabbitMQ Express](https://codesync.global/conferences/code-beam-lite-nyc/training/)
* 4 November 2019, London, UK: [RabbitMQ Summit](https://rabbitmqsummit.com/)
* 5-6 November 2019, London, UK: Various trainings available as part of the [RabbitMQ Summit](https://rabbitmqsummit.com/#training)
* 6-8 November 2019, London, UK: CodeMesh LDN features a [talk from Ayande Dube](https://codesync.global/conferences/code-mesh-ldn/) (@dube_aya) on messaging wars: RabbitMQ, Kafka or ZeroMQ?
* On-demand, online at LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online at Udemy: [RabbitMQ : Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
* Online: $40 buys you early access to Marco Behler’s course, [Building a real-world Java and RabbitMQ messaging (AMQP) application](https://www.marcobehler.com/courses/30-building-a-real-world-java-and-rabbitmq-messaging-amqp-application)

