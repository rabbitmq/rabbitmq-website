---
title: "This Month in RabbitMQ — Jan 8, 2019"
tags: ["Updates", ]
authors: [mklishin]
---

Happy New Year! Welcome back for another installment of This Month in RabbitMQ. Between running a webinar and publishing a new page,
we made a lot of progress in promoting RabbitMQ "best practices" in December. Watch for more content to help everyone in
the Rabbit community know how to run Rabbit smoothly.

There were plenty of other great developments from RabbitMQ engineering, including 1.0 of Reactor RabbitMQ,
and great insights shared across the community. Read on!

<!-- truncate -->

## Project Updates

* RabbitMQ 3.7.10 [has been released](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.10)
* Erlang 19.3 support [has been discontinued](https://groups.google.com/forum/#!msg/rabbitmq-users/G4UJ9zbIYHs/qCeyjkjyCQAJ) for future RabbitMQ releases
* Reactor RabbitMQ 1.0.0 GA [has been released](https://groups.google.com/forum/#!msg/rabbitmq-users/FJ4UgMrr3-Q/xQDEGxlrCAAJ). [Reactor RabbitMQ](https://github.com/reactor/reactor-rabbitmq) is a reactive API for RabbitMQ based on [Reactor](http://projectreactor.io) and RabbitMQ Java client. Reactor RabbitMQ goal is to enable messages to be published to and consumed from RabbitMQ using functional APIs with non-blocking back-pressure and very low overhead.
* [Java client 5.5.2](https://groups.google.com/d/msg/rabbitmq-users/Wk1T3iZBJR4/Y4lLTGXVDgAJ) (for Java 8+) and [4.9.2](https://groups.google.com/d/msg/rabbitmq-users/8Gef5g-KNRU/o8mQEl7VDgAJ) (for Java 6 &amp; 7) have been released.
* PerfTest 2.5.0 [has been released](https://groups.google.com/d/msg/rabbitmq-users/9AycV2eEC0s/UvE2StsrDwAJ) with lot of goodies: new publisher confirm latency metrics, dependency upgrades, new Linux native executable created with [GraalVM](https://www.graalvm.org/), and new Docker image.
* New [doc guide on connections](/docs/connections)

## Community Writings and Resources

* All the [videos from the RabbitMQ Summit](https://www.youtube.com/channel/UCp20sSF_JZv5aqpxICo-ZpQ/videos) are posted!
* [Lovisa Johansson](https://twitter.com/lillajja) published an [Introduction to Message Queuing and RabbitMQ on Manifold](https://blog.manifold.co/introduction-to-message-queuing-and-rabbitmq-6cb8e6e9b2)
* Adrian Huna of Showmax published [Building a scalable, highly reliable, asynchronous user service](https://tech.showmax.com/2018/12/building-scalable-highly-reliable-asynchronous-user-service/), explaining how they leverage RabbitMQ to orchestrate the delivery of the GDPR data access report and data erasure in a microservices architecture.
* [Lovisa Johansson](https://twitter.com/lillajja) shared some data about how [43% of all clusters at CloudAMQP are now running RabbitMQ 3.7](https://www.cloudamqp.com/blog/2018-12-03-rabbitmq-version-distribution-on-cloudamqp.html)
* [Gabriele Santomaggio](https://twitter.com/GSantomaggio) shared an [example on GitHub](https://github.com/Gsantomaggio/rabbitmqexample/tree/master/vagrant_cluster) for creating a RabbitMQ cluster using Vagrant
* The Runtastic team published on [Handling Dead Letters in RabbitMQ Using a Dead-Letter Exchange](https://www.runtastic.com/blog/en/message-bus-dead-letter-exchange/)
* [Elin Vinka](https://twitter.com/linneajohanna) summarized [key takeaways from RabbitMQ Summit 2018](https://www.cloudamqp.com/blog/2018-12-14-rabbitmqsummit-2018-recap.html)
* Fabrizio Micheloni walks through using the fanout exchange (with a handy example project) in his post, [Topic-like architecture with RabbitMQ and Spring Boot](https://medium.com/@fabrizio.micheloni1994/topic-like-architecture-with-rabbitmq-and-spring-boot-c5f73b27f098)
* IBM announced [General Availability of IBM Cloud Messages for RabbitMQ](https://www.ibm.com/blogs/bluemix/2018/12/ibm-cloud-databases-for-etcd-elasticsearch-and-messages-for-rabbitmq-are-now-generally-available/)
* Roman Pyatyshev of MegaFon published on Habr about [building a highly-available architecture with RabbitMQ](https://habr.com/post/434016/) for one of Russia’s largest telcos (in Russian)
* [Onur Destanoglu](https://twitter.com/Feralan_Paladin) of Hapsiburada published [Migrating RabbitMQ in a High Traffic Setup](https://medium.com/hepsiburadatech/migrating-rabbitmq-in-a-high-traffic-setup-39d73fcc8b04)
* Also from the Hepsiburada team, Ahmet Vehbi Olgac published on [Implementing Highly Available RabbitMQ Cluster on Docker Swarm using Consul-based Discovery](https://medium.com/hepsiburadatech/implementing-highly-available-rabbitmq-cluster-on-docker-swarm-using-consul-based-discovery-45c4e7919634). He notes that "We used this infrastructure during this year’s Black Friday, and had zero problems."
* [Piotr Minkowski](https://twitter.com/piotr_minkowski) published a post on setting up a [RabbitMQ Cluster with Consul and Vault](https://piotrminkowski.wordpress.com/2018/12/27/rabbitmq-cluster-with-consul-and-vault/)
* On DZone, [Ramesh Fadatare](https://twitter.com/FadatareRamesh) published [How RabbitMQ Works and RabbitMQ Core Concept](https://dzone.com/articles/how-rabbitmq-works-and-rabbitmq-core-concepts-1) 
* Alok Singhal published [RabbitMQ Best Practices — Part 1](https://medium.com/@aloksinghal/rabbitmq-best-practices-part-1-6f66522e4fe)
* [CodeSync](https://twitter.com/CodeMeshIO) published a talk by Daniil Fedotov from Code Mesh LDN 18 about [implementing Raft in RabbitMQ](https://youtu.be/1ntKuapkqq4)
* Rick van de Loo explains [how to use RabbitMQ on Hypernode](https://support.hypernode.com/changelog/platform/release-6052-rabbitmq-on-hypernode/)

## Upcoming Events

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ:

* 22 January 2019 — [Pivotal RabbitMQ Course](https://pivotal.io/training/courses/pivotal-rabbitmq-training)
* 25 February 2019 — [Pivotal RabbitMQ Course](https://www.flane.co.uk/course-schedule/pivotal-rmq) — Ljubljana/Online
* 27 February 2019 — [RabbitMQ Express at Code Beam SF](https://codesync.global/conferences/code-beam-sf-2019/#Training) — San Francisco
* 15 April 2019 — [Pivotal RabbitMQ Course](https://www.flane.co.uk/course-schedule/pivotal-rmq) — London
