---
title: "This Month in RabbitMQ: September & October 2019"
tags: ["Updates", ]
authors: [mklishin]
---

This Month (and the month before) in RabbitMQ — October and September recap!

We’re a little behind this month! At the beginning of October, we [shipped RabbitMQ 3.8](/blog/2019/11/11/rabbitmq-3-8-release-overview). That’s right, folks, [RabbitMQ 3.8 is finally out](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.0)!

Headline features include:

* [Quorum Queues](/docs/quorum-queues): a new replicated queue type with many improvements over classic mirrored queues
* [Feature flags](/docs/feature-flags) allow for mixed-version clusters and simplified upgrades
* Built-in [Prometheus and Grafana-based monitoring](/docs/prometheus)
* [OAuth 2 (JWT token) support](https://github.com/rabbitmq/rabbitmq-auth-backend-oauth2) for authentication and authorization
* and more

You’ll find some early reviews from folks in the community who have been kicking the tires in the community updates section below.
Make sure you are all over the [upgrades best practices](/docs/upgrade)
to avoid potential hazards of [upgrading](/docs/upgrade) to RabbitMQ 3.8.

<!-- truncate -->

Oh, and there were some other rather meaningful ecosystem announcements out there:

* Boomi announced a real-time listener for RabbitMQ
* Microsoft Azure announced [RabbitMQ extension for Azure Functions](https://dev.to/azure/announcing-the-rabbitmq-extension-for-azure-functions-2mbo)

SpringOne Platform 2019 talks that highlighted RabbitMQ:

* [RabbitMQ and Kafka](https://springoneplatform.io/2019/sessions/rabbitmq-kafka) with Zoe Vance and Madhav Sathe
* A [Tale of Transformation](https://springoneplatform.io/2019/sessions/a-tale-of-transformation-changing-the-way-we-deliver-and-transform-product-data-at-dell): Changing the Way We Deliver and Transform Product Data at Dell with Deepali Kishnani and Joe Toubia
* [Building the Pivotal RabbitMQ for Kubernetes](https://www.youtube.com/watch?v=cYYRnvhmv1M) Beta with Zoe Vance and Chunyi Lyu
* [Building Reactive Pipelines](https://www.youtube.com/watch?v=x4PImMjPa7k): How to Go from Scalable Apps to (Ridiculously) Scalable Systems with Mark Heckler

## Project updates

* [RabbitMQ 3.8.1](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.1) was released with bug fixes and improvements in quorum queues memory performance
* Spring for RabbitMQ (Spring AMQP) 2.2 is [now available](https://spring.io/blog/2019/10/02/spring-for-rabbitmq-spring-amqp-2-2-is-now-available)
* RabbitMQ for Kubernetes went into beta… and there's a [separate post about that](https://content.pivotal.io/blog/against-the-backdrop-of-vmware-tanzu-here-s-how-pivotal-platform-s-new-release-helps-you-build-modern-apps#RabbitMQ)
* [Reactor RabbitMQ 1.3.0](https://groups.google.com/d/msg/rabbitmq-users/faaGTV7cWrA/Yy5OdCAzBwAJ) is released as part of the [Reactor Dysprosium release train](https://projectreactor.io/docs). It comes with tons of new things, try it out!
* [Java Client 5.8.0.RC2](https://groups.google.com/d/msg/rabbitmq-users/wnWPhOjdE3Y/aC4KEZWsBAAJ) is released with OAuth 2 support. Try it out with RabbitMQ 3.8 before we release 5.8.0.GA!
* [JMS Client 1.14.0](https://groups.google.com/d/msg/rabbitmq-users/jLkf8RnOJ9Y/D6J3Ek17AQAJ) is released with a new feature and a usability improvement.
* [PerfTest 2.9.0](https://groups.google.com/d/msg/rabbitmq-users/gsEV_CWUcB4/Ye8klw45BgAJ) is released with a new feature, a usability enhancement, bug fixes, and dependency upgrades. [2.9.1](https://groups.google.com/d/msg/rabbitmq-users/YW2fFddt__0/3tW3I05pCwAJ) came out shortly after with a small bug fix.
* [Hop 3.5.0.RC1](https://groups.google.com/d/msg/rabbitmq-users/5hmJUyc7ffg/aQDqw19iCAAJ) is released with dependency upgrades. Another RC is around the corner.

Several updates to 3.7.x with bug fixes:

* [3.7.18](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.18) also includes a security vulnerability fix
* [3.7.19](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.19)
* [3.7.20](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.20)
* [3.7.21](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.21)

## Community Writings and Resources

* Sept 2: Nitzan Shapira (@nitzanshapira) published a [comparison of tracing](https://epsagon.com/blog/kafka-rabbitmq-or-kinesis-solution-comparison/) in several messaging systems including RabbitMQ
* Sept 3: Syed Sirajul Islam Anik (@sirajul_anik) wrote about [RabbitMQ for PHP developers](https://medium.com/@sirajul.anik/rabbitmq-for-php-developers-c17cd019a90)
* Sept 6: Josh Long (@starbuxman) published a [podcast interview with Gary Russell](https://spring.io/blog/2019/09/06/a-bootiful-podcast-gary-russell) (@gprussell) talking about RabbitMQ, Spring Integration and more
* Sept 7: Dhiraj Ray (@only2dhir) shared a [Spring Boot RabbitMQ example](https://www.devglan.com/spring-boot/springboot-rabbitmq-example)
* Sept 8: Nishadi Wickramanayaka (@wickramanayaka_) wrote an [introduction to RabbitMQ](https://freetechorb.wordpress.com/2019/09/08/rabbitmq-introduction/)
* Sept 11: Richard Hooper (@Pixel_Robots) published about scaling an Azure VMSS based on [RabbitMQ queue size using an Azure Logic App](https://pixelrobots.co.uk/2019/09/scale-an-azure-vmss-based-on-rabbitmq-queue-size-using-an-azure-logic-app/)
* Sept 12: Maciej Chada?a wrote about [fighting deadlocks with RabbitMQ](https://medium.com/@maciejcha/fighting-deadlocks-with-rabbitmq-8467ac06e3e7)
* Sept 12: Paul Redmond (@paulredmond) wrote about a library that strives to be a [painless way to use RabbitMQ with Laravel](https://laravel-news.com/amqp)
* Sept 13: More serverless! Mark Purcell (@PurcellMk) published about [OpenWhisk and RabbitMQ](https://medium.com/openwhisk/openwhisk-and-rabbitmq-c5dae08e051e)
* Sept 14: Igor Zhivilo (@warolv) published the first in a series on RabbitMQ. Part 1 explains [how to break apart your application with RabbitMQ](https://medium.com/splitting-your-app-with-rabbitmq/splitting-your-app-into-smaller-apps-using-rabbitmq-b6e4ef29d1da). Part 2 covers [RabbitMQ publisher resiliency to failures](https://medium.com/@warolv/handling-rabbitmq-publisher-failures-914ff08ccbb2). Part 3 focuses on [handling RabbitMQ consumer failures with maxretry handler](https://medium.com/@warolv/handling-rabbitmq-consumer-failures-with-maxretry-handler-eb0332ab98e0).
* Sept 15: Muhammad Nabeel published about how to [install RabbitMQ on RHEL 8 or CentOS 8](https://www.osradar.com/how-to-install-rabbitmq-on-rhel-8-centos-8/)
* Sept 19: Catcher Wong (@catcherwong) wrote about [publishing RabbitMQ messages in ASP.NET Core](https://www.c-sharpcorner.com/article/publishing-rabbitmq-message-in-asp-net-core/)
* Sept 24: Lovisa Johansson (@lillajja) published the part 4 of her series on [RabbitMQ for beginners](https://www.cloudamqp.com/blog/2015-09-03-part4-rabbitmq-for-beginners-exchanges-routing-keys-bindings.html), focusing on Exchanges, routing keys, and bindings
* Sept 24: Jack Vamvas (@jackvamvas) published about how to [use curl with RabbitMQ HTTP API](https://www.dba-ninja.com/2019/09/how-to-use-curl-for-a-rabbitmq-connection.html)
* Sept 25: Mark Heckler (@mkheck) published an interview with Zoe Vance on RabbitMQ and Kafka, and [building reliable services on Kubernetes](https://content.pivotal.io/springone-platform-2019-previews/springone-platform-preview-rabbitmq-and-kafka-and-building-reliable-services-on-kubernetes)
* Sept 25: Francesco Bonizzi (@fbonizzi90) wrote about [quickly getting RabbitMQ up and running on Windows with Docker](https://levelup.gitconnected.com/rabbitmq-with-docker-on-windows-in-30-minutes-172e88bb0808)
* Sept 26: Wojtek Suwa?a (@wojtek_suwala) published the seventh post on a series about building microservices with .NET Core, this one focusing on [transactional outboxes with RabbitMQ](https://altkomsoftware.pl/en/blog/microservices-outbox-rabbitmq/)
* Sept 28: Aditi Mittal published a [quick introduction to RabbitMQ](https://medium.com/@aditi.mittalborn97/quick-introrabbitmq-bb2a06c7f39c)
* Oct 8: David McKenna wrote a [brief history of APIs](https://dzone.com/articles/api-is-dead-long-live-the-apis), noting RabbitMQ and messaging protocol role in how integration is evolving
* Oct 11: Sven Varkel (@svenvarkel) published about [building a dockerized developer environment](https://dev.to/svenvarkel/dockerized-sailsjs-reactjs-mongodb-redis-rabbitmq-nginx-denvironment-325n) with SailsJS, ReactJS, MongoDB, Redis, RabbitMQ, and Nginx
* Oct 12: Ratul Basak wrote about [clustering RabbitMQ using Terraform and Ansible](https://medium.com/@ratulbasak93/rabbitmq-cluster-setup-using-terraform-and-ansible-in-aws-fbd72f386b66)
* Oct 13: Johnson Duke published about building a minimalistic [message queue in Node.js with RabbitMQ](https://morioh.com/p/8bc4fb039a9a)
* Oct 13: Deshan Madurajith (@DMadurajith) wrote a great set of [mistakes you can make with RabbitMQ](https://medium.com/@deshan.m/6-fantastic-mistakes-that-you-can-do-using-rabbitmq-nodejs-cbf5db99613c). Great lessons learned!
* Oct 18: Lovisa Johansson (@lillajja) published about [what is new in RabbitMQ 3.8](https://www.cloudamqp.com/blog/2019-10-18-rabbitmq-version-3-8.html)
* Oct 19: @itseranga published about [building reactive, asynchronous, polyglot microservices](https://medium.com/rahasak/reactive-microservices-with-golang-rabbitmq-and-protobuf-af025f4ec27)
* Oct 23: Monica Sarbu (@monicasarbu) wrote about how Elastic is introducing [Integration Plugins for Logstash](https://www.elastic.co/blog/logstash-lines-introduce-integration-plugins), including RabbitMQ. Sounds handy!
* Oct 23: Szymon Mentel (@szymonmentel) published on [RabbitMQ 3.8 and Quorum Queues](https://szkolarabbita.pl/rabbitmq-3-8-i-quorum-queues/)
* Oct 25: Szymon Mentel (@szymonmentel) published on [“gotchas” with RabbitMQ Mirrored Queues](https://www.erlang-solutions.com/blog/rabbitmq-mirrored-queues-gotchas.html)… great to review as you are researching the new Quorum Queues introduced in 3.8
* Oct 25: Matthew Harper published part 3 of his guide to [getting started with .NET Core, Docker, and RabbitMQ](https://medium.com/trimble-maps-engineering-blog/getting-started-with-net-core-docker-and-rabbitmq-part-3-66305dc50ccf)
* Oct 25: Brian McClain (@BrianMMcClain) wrote about how to [get started with Spring Cloud Stream](https://content.pivotal.io/practitioners/getting-started-with-spring-cloud-stream), noting RabbitMQ as one of the messaging options available

## Webinars and Training

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

* 12 December 2019, online: [Understanding RabbitMQ: For Developers and Operators](https://content.pivotal.io/webinars/dec-12-understand-rabbitmq-for-developers-and-operators-webinar?utm_campaign=this-month-understanding-rabbitmq&amp;utm_source=rabbitmq&amp;utm_medium=website) with RabbitMQ core team member Gerhard Lazu
* On-demand, online @ LearnFly: Learn [RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online @ Udemy: RabbitMQ : [Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
* Online: $40 buys you early access to Marco Behler’s course, [Building a real-world Java and RabbitMQ messaging (AMQP) application](https://www.marcobehler.com/courses/30-building-a-real-world-java-and-rabbitmq-messaging-amqp-application)
* Online @ Pluralsight: [RabbitMQ by Example](https://www.pluralsight.com/courses/rabbitmq-by-example) has good reviews
