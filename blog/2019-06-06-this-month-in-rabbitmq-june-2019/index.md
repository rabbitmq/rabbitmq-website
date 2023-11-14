---
title: "This Month in RabbitMQ — June 2019"
tags: ["Updates", ]
authors: [mklishin]
---

Welcome back for another edition of This Month in RabbitMQ! Keep sharing your war stories and lessons learned out there,
and tweet them with #rabbitMQ to get them on our radar for inclusion in these write-ups.

As we march towards RabbitMQ 3.8 going GA, be sure to catch the replay of the webinar we did last month on [what’s new in RabbitMQ 3.8](https://content.pivotal.io/webinars/may-23-what-s-new-in-rabbitmq-3-8-webinar?utm_source=blog&amp;utm_medium=email-link&amp;utm_campaign=rabbitmq-3.8-what's-new&amp;utm_term=q219).

[Jack Vanlightly](https://jack-vanlightly.com/home) also did some coverage on the [Single Active Consumer](https://www.cloudamqp.com/blog/2019-04-23-rabbitmq-3-8-feature-focus-single-active-consumer.html) feature in 3.8, adding to his earlier coverage on [Quorum Queues](https://jack-vanlightly.com/blog/2018/11/20/quorum-queues-making-rabbitmq-more-competitive).

<!-- truncate -->

## Project updates

* [RabbitMQ 3.7.15](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.15) was released, includes initial support for Erlang 22
* [Erlang 22 is now GA](http://www.erlang.org/news/132) with a new inter-node communication implementation and initial TLSv1.3 server support
* Erlang 22.0.2 and 21.3.8.3 were released, addressing [ERL-934](https://bugs.erlang.org/browse/ERL-934) and [ERL-938](https://bugs.erlang.org/browse/ERL-938), an issue that affected RabbitMQ environments that used TLS and had a high data ingestion volume.
* [RabbitMQ Docker image](https://github.com/docker-library/rabbitmq) has [transitioned to use Erlang 22](https://github.com/docker-library/rabbitmq/issues/336)
* [PerfTest 2.8.0](https://groups.google.com/d/msg/rabbitmq-users/1mN4olzZOgA/MjH-4kLoAwAJ) has been released with lots of goodies: new options to vary message size and publishing rate, optional polling consumers (instead of asynchronous consumers by default), optionally nack messages instead of acking them, and dependency upgrades
* [Java client 5.7.1](https://groups.google.com/d/msg/rabbitmq-users/PDHubBIzhEc/k6qx5zLdAwAJ) (for Java 8+) and [4.11.1](https://groups.google.com/d/msg/rabbitmq-users/eg_FoB8eyMY/Xre89S7dAwAJ) (for Java 6 &amp; 7) have been released with a bug fix

## Community writings and resources

May 1: Denis Orehovsky ([@apirobotme](https://twitter.com/apirobotme)) published about [Distributed systems with RabbitMQ.](https://apirobot.me/blog//posts/distributed-systems-with-rabbitmq)

May 1: Sam Bently ([@sambentley00](https://twitter.com/sambentley00)) published about [Building An External Rabbitmq Service For VCloud Director](https://beardedsamwise.wordpress.com/2019/05/01/building-an-external-rabbitmq-service-for-vcloud-director/), with particular attention to SSL requirements.

May 1: [Nerengen Babu](https://medium.com/@nerengenbabu) published [Integrating RabbitMQ with SpringBoot Application](https://medium.com/@nerengenbabu/integrating-rabbitmq-with-springboot-application-reciever-part-ad8b0f90cdb9) (Receiver Part).

May 5: Chetan Khatri (@khatri_chetan)wrote about How to [Setup Airflow Multi-Node Cluster with Celery &amp; RabbitMQ](https://medium.com/@khatri_chetan/how-to-setup-airflow-multi-node-cluster-with-celery-rabbitmq-cfde7756bb6a)

May 6: [mastanggt](https://habr.com/users/mastanggt/) wrote about [migrating RabbitMQ to/within Kubernetes](https://habr.com/ru/company/flant/blog/450662/) (in Russian).

May 8: Nikita wrote about [RabbitMQ Fetching Remote Data](https://dvelp.co.uk/articles/rabbitmq), particularly in Rails.

May 10: Jacques Roussel published about [Using the Ansible Operator-sdk To Build A RabbitMQ Operator for Kubernetes](https://www.objectif-libre.com/en/blog/2019/05/10/using-the-operator-sdk-to-build-a-rabbitmq-operator/).

May 10: [Aamer Mohammed](https://medium.com/@aamermail) compares several different messaging technologies, including RabbitMQ, in the context of [Asynchronous communication in Microservices](https://medium.com/@aamermail/asynchronous-communication-in-microservices-14d301b9016).

May 13: [Jind?ich Hrabal](https://medium.com/@jindrich.hrabal) ([@Backglite](https://twitter.com/Backglite)) published on [Dead Letter Queue Reprocessing with Spring Integration and RabbitMQ](https://medium.com/zoom-techblog/dead-letter-queue-reprocessing-a2c041f64e65).

May 14: [Prashant Vats](https://medium.com/@prashant.vats) published on [Kubernetes pod autoscaling in response to the change in the RabbitMQ queue](https://medium.com/@prashant.vats/kubernetes-pod-autoscaling-in-response-to-the-change-in-the-rabbitmq-queue-3048b02413ef).

May 14: [Francisco Cardoso](https://medium.com/@francardoso) published about [what’s different in AMQP 1.0 compared to AMQP 0-9-1](https://medium.com/totvsdevelopers/diferen%C3%A7as-do-amqp-1-0-para-as-vers%C3%B5es-anteriores-9db828cc9e3e) (in Portugese).

May 17: [Lakmini Wathsala](https://medium.com/@wathsalakoralege) published [How to integrate WSO2 EI with RabbitMQ](https://medium.com/@wathsalakoralege/how-to-integrate-wso2-ei-with-rabbitmq-without-passing-credentials-from-address-uri-31f2453bcf0b) without passing credentials from address URI.

May 20: [Lukasz Lenart](https://medium.com/@lukaszlenart) ([@lukaszlenart](https://twitter.com/lukaszlenart)?) published on [How to configure RabbitMQ via definitions](https://medium.com/@lukaszlenart/how-to-configure-rabbitmq-properly-fa39b2d4cda2).

May 24: Jeroen Jacobs ([@jeroen1205](https://twitter.com/jeroen1205)) wrote about [troubleshooting sync issues with classic mirrored queues](https://tothepoint.group/blog/rabbitmq-mirrored-queues-troubleshooting-sync-issues/).

May 24: Lovisa Johansson ([@lillajja](https://twitter.com/lillajja)) answered the question "[What is the message size limit in RabbitMQ](https://www.cloudamqp.com/blog/2019-05-24-what-is-the-message-size-limit-in-rabbitmq.html)?"

May 24: [Ryan Gunn](https://talkdotnet.wordpress.com/author/icidis/) ([@Icidis](https://twitter.com/Icidis)) published about [Blazor, RabbitMQ and MQTT using Paho with JSInterop](https://talkdotnet.wordpress.com/2019/05/24/blazor-rabbitmq-and-mqtt-using-paho-with-jsinterop/).

May 27: [Marcela Sisiliani](https://medium.com/@marcelasisiliani) ([@ma_sisiliani](https://twitter.com/ma_sisiliani)) wrote an [introduction to the world of queues](https://medium.com/@marcelasisiliani/rabbitmq-introducao-ao-mundo-das-filas-9d959e169519) (in Portugese).

May 28: Hervé Beraud ([@4383hberaud](https://twitter.com/4383hberaud)) published about [How To Play With RabbitMQ And Python Quickly](https://herve.beraud.io/rabbitmq/python/amqp/kombu/2019/05/28/play-with-rabbitmq-and-python.html).

May 28: Jack Vanlightly ([@vanlightly](https://twitter.com/vanlightly)) wrote about [Maintaining Long-Lived Connections with AMQProxy](https://www.cloudamqp.com/blog/2019-05-29-maintaining-long-lived-connections-with-AMQProxy.html) and about [Publishing Throughput - Asynchronous vs Synchronous](https://www.cloudamqp.com/blog/2019-05-29-publishing-throughput-asynchronous-vs-synchronous.html).

May 28: Tomas Henriquez (@Hassek85) published about [how he sets up RabbitMQ clusters to scale](https://hassek.github.io/#rabbitmq-cluster-setup-guideline), noting using the consistent hash plugin and mirrored queues .

May 29: [Mohamed Elhachmi](https://medium.com/@mohamedelhachmi) published about [Efficient design for daemons tasks](https://medium.com/async-solutions/efficient-design-for-daemons-tasks-afcbc2c02732).

May 29: [Denis Setianto](https://medium.com/@denissetianto) published [How to Install RabbitMQ Server on Ubuntu 18.04 &amp; 16.04](https://medium.com/@denissetianto/how-to-install-rabbitmq-server-on-ubuntu-18-04-16-04-lts-8ca63b417d43) LTS.

## Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

6 June 2019, online: [Boosting Microservice Performance with Messaging and Spring](https://content.pivotal.io/webinars/jun-6-boosting-microservice-performance-with-kafka-rabbitmq-and-spring-webinar?utm_campaign=spring-kafka-rabbitmq-q219&amp;utm_source=twitter&amp;utm_medium=social).

4 November 2019: London: [RabbitMQ Summit 2019](https://rabbitmqsummit.com/).

On-demand, online: LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring).

On-demand, online: Udemy: [RabbitMQ: Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/).
