---
title: "This Month in RabbitMQ — July 2019"
tags: ["Updates", ]
authors: [mklishin]
---

Welcome back for another edition of This Month in RabbitMQ! In June, we saw the [RabbitMQ Summit](https://rabbitmqsummit.com/) agenda start to go live, featuring some great returning [speakers](https://rabbitmqsummit.com/#speakers) as well as new faces. There are also a couple of [training sessions](https://rabbitmqsummit.com/#training) offered to add onto your ticket. It’s a great way to immerse yourself in all things RabbitMQ for a couple of days. Registration is open, so book your tickets now before the prices go up in August!

<!-- truncate -->

## Project updates

* [RabbitMQ 3.7.16](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.16) has been released with bug fixes, usability improvements and new `rabbitmq-diagnostics` commands
* [PerfTest 2.8.1](https://groups.google.com/d/msg/rabbitmq-users/Lwmhc3zJzFo/nF1psWltAQAJ) was released with a couple of bug fixes
* [Reactor RabbitMQ 1.3.0.M1](https://github.com/reactor/reactor-rabbitmq/releases/tag/v1.3.0.M1) was released as part of the Reactor Dysprosium-M2 release train. More goodies to come in the next few weeks!
* [March Hare](https://github.com/ruby-amqp/march_hare/) 4.0 was released, now based on the 5.7.x series of the RabbitMQ Java client

## Community writings and resources

June 5: Vermaden (@vermaden) wrote about [setting up RabbitMQ cluster on FreeBSD Jails](https://vermaden.wordpress.com/2019/06/05/rabbitmq-cluster-on-freebsd-containers/)

June 5: Josh Smeaton (@jarshwah) of Kogan published about [monitoring Celery queue length with RabbitMQ](https://devblog.kogan.com/blog/celery-queue-length)

June 7: Emre Tiryaki (@emrtryki) from Hepsiburada published about [event ordering with RabbitMQ using the consistent hash exchange](https://medium.com/hepsiburadatech/rabbitmq-ile-event-ordering-consistent-hash-exchange-kullan%C4%B1m%C4%B1-cf45b7292e53) (in Turkish)

June 8: Cleison Ferreira Melo (Cleison Ferreira Melo) wrote another installment of his series on building a microservices application, [focused on the RabbitMQ container and connection](https://medium.com/@cleisonferreiramelo/the-journey-to-building-a-full-microservice-app-rabbitmq-container-and-connection-9ea39ba8fa7d)

June 8: Jose Alonso Romero Matias published a four-part video series (in Spanish) showing how to create a messaging project that emulates the sending of invoices through a service, using RabbitMQ: [part 1,](https://www.youtube.com/watch?v=lkvu1BVB064&amp;feature=youtu.be) [part 2](https://www.youtube.com/watch?v=IPF-Xt1noz0) on dependency injection with RabbitMQ, [part 3](https://www.youtube.com/watch?v=o0U7XGYA32w) on creating and testing the invoice handler,  [part 4](https://www.youtube.com/watch?v=8nk_pSlVBps)

June 9: Gilles Robert (@ask4gilles) released [v2.0.3 of @opentracing Spring RabbitMQ](https://github.com/opentracing-contrib/java-spring-rabbitmq) with a bunch of new instrumented methods on AmqpTemplate and documentation improvements

June 11: Marco Behler (@MarcoBehler) published a video on [How to Consume RabbitMQ Messages From Queues With Java](https://www.youtube.com/watch?v=BS7tY-Exo0w)

June 13: Maksim Martianov wrote about [Kubernetes worker autoscaling based on RabbitMQ queue depth](https://itnext.io/kubernetes-workers-autoscaling-based-on-rabbitmq-queue-size-cb0803193cdf)

June 14: [Bartha Bela Tibor](https://medium.com/@beeci) published about [RabbitMQ in Docker with Alpine Linux](https://medium.com/@beeci/rabbitmq-integrated-in-docker-container-with-alpine-linux-fdceb4768d01)

June 17: [Rafael Capuano](https://medium.com/@rafacapuano) published (in Portuguese) a three-part series on the external configuration store pattern, using RabbitMQ for  configuration change propagation: [part 1](https://medium.com/@rafacapuano/conhecendo-o-external-configuration-store-pattern-parte-1-contextualizando-fa7285e20860) on contextualizing, [part 2](https://medium.com/@rafacapuano/conhecendo-o-external-configuration-store-pattern-parte-2-criando-a-api-2f1e3b91017c) on creating the API, and [part 3](https://medium.com/@rafacapuano/conhecendo-o-external-configuration-store-pattern-parte-3-criando-o-client-56f2d118a66e) on creating the client

June 18: Ram N. [published a video and resource links](https://dzone.com/articles/how-to-sendreceive-product-object-tofrom-queuespri) on how to send and receive product objects to or from a queue

June 19: IBM published a tutorial on [invoking serverless functions through a message broker](https://developer.ibm.com/tutorials/build-serverless-app-drives-workload-through-message-broker/)

June 23: Karol Galanciak (@Azdaroth) published the third part in a series on [Messages on Rails](https://karolgalanciak.com/blog/2019/06/23/messages-on-rails-part-3-rabbitmq/), this one focused on RabbitMQ

June 25: Dhananjay Singh wrote about [Spring Cloud Stream with RabbitMQ: Message-Driven Microservices](https://stackabuse.com/spring-cloud-stream-with-rabbitmq-message-driven-microservices/)

June 27: Ranga Karanam () published on DZone about [Asynchronous Communication With Queues and Microservices](https://dzone.com/articles/asynchronous-communication-with-queues-and-microse): A Perfect Combination?

June 28: Davide Guida (@DavideGuida82) published the first in a series on [using message queues in .NET Core](https://www.davideguida.com/it/usare-code-di-messaggi-in-net-core-parte-1-le-code/) (in Italian)

June 29: Teerapong Singthong (@iamgoangle) wrote about [Go Messaging System with RabbitMQ](https://medium.com/iamgoangle/go-messaging-system-%E0%B8%94%E0%B9%89%E0%B8%A7%E0%B8%A2-rabbitmq-%E0%B9%81%E0%B8%A5%E0%B8%B0-go-amqp-9e2e88051f5b) and RabbitMQ client for Go (in Thai)

June 30: Md. Al-Amin published about [Solving RabbitMQ High CPU/Memory Usages Problem With Celery](https://medium.com/@alaminopu.me/solving-rabbitmq-high-cpu-memory-usages-problem-with-celery-d4172ba1c6b3)

### Ready to learn more?

Check out these upcoming opportunities to learn more about RabbitMQ:

* 9 July 2019, Krakow, Poland: [High Availability with RabbitMQ](https://www.meetup.com/Elixir-Krakow/events/262472450/) at Krakow Elixir meetup
* 4 November 2019, London, UK: [RabbitMQ Summit 2019](https://rabbitmqsummit.com/)
* 5-6 November 2019 in London, UK: various [training sessions available as part of the RabbitMQ Summit](https://rabbitmqsummit.com/#training)
* On-demand, online on LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online on Udemy: [RabbitMQ : Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
* Online: $40 buys you early access to Marco Behler’s course, [Building a real-world Java and RabbitMQ messaging applications](https://www.marcobehler.com/courses/30-building-a-real-world-java-and-rabbitmq-messaging-amqp-application)
