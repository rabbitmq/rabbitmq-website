---
title: "This Month in RabbitMQ, January 2020 Recap"
tags: ["Updates", ]
authors: [mklishin]
---

This Month in RabbitMQ, January 2020 Recap

Introducing TGI RabbitMQ! Inspired by TGI Kubernetes, RabbitMQ engineer, Gerhard Lazu has begun a
series of tutorial videos. Tune in at the end of each month for the latest release. In January,
Gerhard covered [upgrading from 3.7 to 3.8](https://youtu.be/DynCqFtnSoY).
Star and watch the [repository](https://youtu.be/DynCqFtnSoY) for future episode updates.

Also, be sure to check out the [dashboards we’ve published to Grafana](https://grafana.com/orgs/rabbitmq). These are a great way to get started with the new [Prometheus and Grafana support in 3.8](/docs/prometheus).

<!-- truncate -->

## Project Updates

* First public beta version of [Pivotal RabbitMQ for Kubernetes](https://network.pivotal.io/products/p-rabbitmq-for-kubernetes).
* [Spring AMQP 2.2.3](https://github.com/spring-projects/spring-amqp/releases)
* [Hop 3.6.0](https://groups.google.com/d/msg/rabbitmq-users/MEwbDJ8biRc/s4xLPpvYAwAJ) is released with new features and dependency upgrades. The HTTP client for the classic blocking client is now pluggable, making it possible to use OkHttp instead of Apache HTTPComponents.

## Community Writings and Resources

* 1 Jan: Hyun Sun Ryu (@hsunryou) wrote about [installing RabbitMQ 3.8 on CentOS 8.0](https://blog.naver.com/hsunryou/221756168969)
* 1 Jan: (@Cakazies1) published about [messaging in Golang with RabbitMQ](https://medium.com/@cakazies/messaging-golang-with-rabbitmq-2ed1ccf8314)
* 4 Jan: Ben Lovy published a [beginners description](https://dev.to/deciduously/correct-a-beginner-about-buzzword-technologies-4bbe) of several “buzzword-y” technologies, including RabbitMQ, looking for feedback and corrections
* 8 Jan: Sunny Beatteay (@SunnyPaxos) published a really interesting article about [how DigitalOcean re-architected a system](https://blog.digitalocean.com/from-15-000-database-connections-to-under-100-digitaloceans-tale-of-tech-debt/) that had grown to 15,000 database connections because they were using MySQL as an event queue, to using RabbitMQ
* 8 Jan: Robin Moffatt (@rmoff) wrote about [Streaming messages from RabbitMQ into Kafka](https://rmoff.net/2020/01/08/streaming-messages-from-rabbitmq-into-kafka-with-kafka-connect/) with Kafka Connect
* 9 Jan: Dormain Drewitz (@DormainDrewitz) published a list of the [top 10 RabbitMQ Influencers](https://content.pivotal.io/blog/top-rabbitmq-influencers-of-2019) of 2019
* 9 Jan: Szymon Mentel (@szymonmentel) published a [5 minute video overview of RabbitMQ](https://youtu.be/ViJNPnZPJn4) along with a [post with notes and links](https://szkolarabbita.pl/rabbitmq-klaster-w-5-minut/) to try it yourself (in Polish)
* 9 Jan: Oriol Canalias (@iandarigun) published the first part of an [introduction to RabbitMQ (in Portuguese)](https://medium.com/dev-cave/rabbit-mq-parte-i-c15e5f89d94)
* 10 Jan: Gabriele Santomaggio (@GSantomaggio) added Helm support for [his RabbitMQ Operator for Kubernetes](https://github.com/Gsantomaggio/rabbitmq-operator#install-the-rabbitmq-operator-with-helm3)
* 12 Jan: Pawel Duda (@pawel_duda) wrote about [why queues can be empty after a restart](https://devmeetsbiz.business.blog/2020/01/12/rabbitmq-queue-empty-after-a-restart-why-even-though-its-durable/) and what to do about it
* 13 Jan: Marcin Lewandowski (@marcin_elem84) wrote about [confirming messages in RabbitMQ](https://czterytygodnie.pl/potwierdzanie-wiadomosci-rabbitmq/) (in Polish)
* 13 Jan: Davide Guida (@DavideGuida82) wrote about using the [Outbox pattern with RabbitMQ](https://www.davideguida.com/improving-microservices-reliability-part-2-outbox-pattern/) to improve microservices reliability
* 15 Jan: Mike Møller Nielsen (@MikeMoelNielsen) published a

[video on using a RabbitMQ PerfTest]

(https://youtu.be/MEdPLX-PCn8 ) (performance testing tool)
* 15 Jan: Oriol Canalias (@iandarigun) published the second part of [an introduction to RabbitMQ in Portuguese](https://medium.com/dev-cave/rabbitmq-parte-ii-fa61a469ba2)
* 16 Jan: Renzo Tejada Chung (@TejadaRenzo) published about [using Docker Compose with RabbitMQ](https://renzotejada.com/blog/docker-compose-para-rabbitmq/) (in Spanish)
* 17 Jan: Linux Conference Australia 2020 published a talk by Rafael Martinez Guerrero (@rafaelma_) on what goes on behind the scenes of an ELK system, including the role of RabbitMQ ([video](https://youtu.be/4X0bmnb4tVI), [slides](https://e-mc2.net/behind-scenes-elk-system))
* 17 Jan: Lovisa Johansson (@lillajja) wrote up the [Annual RabbitMQ Report 2020](https://www.cloudamqp.com/blog/2020-01-17-annual-rabbitmq-report-2020-by-cloudamqp.html) from CloudAMQP
* 17 Jan: Samuel Owino (@SamProgramiz) published an [introduction to AMQP 0.9.1](https://medium.com/@samuelowino43/advanced-message-queueing-protocol-ampq-0-9-1-617209d2d6ec), which is one of the protocols supported in RabbitMQ
* 18 Jan: Deependra Kushwah wrote up [installing RabbitMQ on Windows](https://beetechnical.com/windows/rabbitmq-installation-on-windows/)
* 25 Jan: Narongsak Keawmanee published an introduction to [using RabbitMQ with Node.js](https://medium.com/@klogic/introduction-to-rabbitmq-with-nodejs-3f1ab928ed50)
* 27 Jan: Todd Sharp (@recursivecodes) published about [getting started with RabbitMQ in Oracle Cloud](https://blogs.oracle.com/developers/getting-started-with-rabbitmq-in-the-oracle-cloud)
* 27 Jan: Todd Sharp (@recursivecodes) also published a video about how to install and [run RabbitMQ in Oracle Cloud](https://youtu.be/9kVBZ5MQV6I)
* 27 Jan: Abhishek Yadav wrote an explainer about [RabbitMQ as a Service Bus in the context of ASP.NET Core](https://www.c-sharpcorner.com/article/rabbitmq-service-bus/)
* 28 Jan: Richard Seroter (@rseroter) wrote about trying out the new [replicated, durable quorum queues in RabbitMQ 3.8](https://seroter.wordpress.com/2020/01/28/lets-try-out-the-new-durable-replicated-quorum-queues-in-rabbitmq/)
* 28 Jan: Nur Erkartal published about [using the Outbox pattern with RabbitMQ at Trendyol](https://medium.com/trendyol-tech/outbox-pattern-story-at-trendyol-fcb35fe056d7)
* 29 Jan: Lovisa Johansson (@lillajja) wrote about [message priority in RabbitMQ](https://www.cloudamqp.com/blog/2020-01-29-message-priority-in-rabbitmq.html)
* 30 Jan: Nicholas Barrett (@T00MEKE) published about [setting up a RabbitMQ cluster in Kubernetes](https://nick.barrett.org.nz/setting-up-rabbitmq-ha-in-kubernetes-with-external-https-and-amqps-access-1ce1f3632dd2) with external HTTPS and AMQPS access
* 30 Jan: Lovisa Johansson (@lillajja) wrote about [RabbitMQ and Erlang upgrades](https://www.cloudamqp.com/blog/2020-01-30-rabbitmq-erlang-upgrades.html)
* 31 Jan: Georgy @georgysay wrote about [using RabbitMQ with .NET Core](https://habr.com/ru/post/486416/) (in Russian)
* 31 Jan: Gerhard Lazu (@gerhardlazu) published the first episode of TGI RabbitMQ on [how to upgrade from RabbitMQ 3.7 to 3.8](https://youtu.be/DynCqFtnSoY)

## Ready to learn more?

* 13 Feb, online: Free webinar on How to [Build Reliable Streaming Pipelines with RabbitMQ and Project Reactor](https://content.pivotal.io/rabbitmq/feb-13-how-to-build-reliable-streaming-pipelines-with-rabbitmq-and-project-reactor-webinar?utm_campaign=reactor-streaming-webinar-blog&amp;utm_source=rabbitmq&amp;utm_medium=website)
* 20 Feb, online: Hashitalks 2020 features a talk on [Securing RabbitMQ with Vault](https://events.hashicorp.com/hashitalks2020) by Robert Barnes (@devops_rob)
* 28 Feb, online: TGIR S01E02: Help! RabbitMQ ate my RAM!
* 5-6 Mar, San Francisco: [Code BEAM SF](https://codesync.global/conferences/code-beam-sf/) which features these talks on RabbitMQ:
* A Novel Application Of Rabbitmq For The Reliable Automated Deployment Of Software Updates with Brett Cameron (@brc859844) and Natalya Arbit
* How RabbitMQ simplifies routing in a microservices architecture with Jianbo Li and Yijian Yang
* On-demand, online at LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online at Udemy: [RabbitMQ: Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
* Online, $40 buys you early access to Marco Behler’s course, [Building a Real-World Java and RabbitMQ Messaging Application](https://www.marcobehler.com/courses/30-building-a-real-world-java-and-rabbitmq-messaging-amqp-application)
* Online, Pluralsight course: [RabbitMQ by Example](https://www.pluralsight.com/courses/rabbitmq-by-example) gets good reviews
* Online: Luxoft is offering a [RabbitMQ course in Russian](https://www.luxoft-training.ru/kurs/platforma_obmena_soobshcheniyami_rabbitmq.html)
* Various: South Africa: [Jumping Bean offers RabbitMQ training](https://www.jumpingbean.co.za/rabbitmq)
