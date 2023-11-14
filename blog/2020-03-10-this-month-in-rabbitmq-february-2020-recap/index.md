---
title: "This Month in RabbitMQ, February 2020 Recap"
tags: ["Updates", ]
authors: [mklishin]
---

This Month in RabbitMQ — February 2020 Recap!

[RabbitMQ Summit](https://rabbitmqsummit.com/) is coming again! This time, the gathering will be in Berlin on June 9 and the [call for proposals](https://eventil.com/events/rabbitmq-summit-2020/cfp) (to speak at the event)
is open until March 22.

Mark your calendars, brush up on your Deutsch, and buy your tickets for the next chance to immerse yourself in all things RabbitMQ.
I’m sure there will be at least a couple of [RabbitMQ influencers](https://content.pivotal.io/blog/top-rabbitmq-influencers-of-2019) there, too :)

<!-- truncate -->

## Project updates

* [RabbitMQ 3.8.3 is out](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.3)
* [As well as RabbitMQ 3.7.24](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.24)
* New preview releases are available for the RabbitMQ .NET client: [6.0.0-pre10](https://www.nuget.org/packages/RabbitMQ.Client/6.0.0-pre10) and [5.2.0-pre2](https://www.nuget.org/packages/RabbitMQ.Client/5.2.0-pre2).
The former has substantial memory allocation reduction contributed by [Stefán Jökull Sigurðarson](https://github.com/stebet). Please test these versions in your pre-production environments. Release candidates should be available soon.
* [Hop 3.6.1](https://groups.google.com/d/msg/rabbitmq-users/djLbfmjg5KA/AtgAHaUqCAAJ) is released with a bug fix.
* [PerfTest 2.11.0](https://groups.google.com/d/msg/rabbitmq-users/MAO0L0HBqgk/eZoZDbg6AQAJ) is released with new features, usability improvements, dependency upgrades, and a bug fix.
* [JMS Client 2.0.0](https://groups.google.com/d/msg/rabbitmq-users/uHNG7-AqlDk/MNskRMCMBwAJ) is released. It is now the new production line.

## Community Writings and Resources

* 1-2 Feb: Gabriele Santomaggio (@GSantomaggio) gave a talk on [Debugging and Tracing a Production RabbitMQ node](https://fosdem.org/2020/schedule/event/beam_debugging_tracing_rabbitmq_node/)
* 2 Feb: Lovisa Johansson (@lillajja) wrote a post [comparing RabbitMQ and Apache Kafka](https://www.cloudkarafka.com/blog/2020-02-02-which-service-rabbitmq-vs-apache-kafka.html)
* 2 Feb: Renjith P wrote a [guide to Nest JS RabbitMQ microservices](https://medium.com/swlh/guide-to-nest-js-rabbitmq-microservices-e1e8655d2853)
* 6 Feb: Eran Stiller (@eranstiller) published the first part in his [comparison series of RabbitMQ and Kafka](https://stiller.blog/2020/02/rabbitmq-vs-kafka-an-architects-dilemma-part-1/)
* 8 Feb: Oscar Oranagwa (@Oskarr3) wrote about [using the RabbitMQ Source Connector](https://medium.com/@Oskarr3/an-exercise-with-kafka-connectors-589bef785d81) to move messages between RabbitMQ and Kafka as part of a migration from a monolith to microservices
* 10 Feb: Zach Ruffin (@faintdeception) published about [stream processing using .NET Core and RabbitMQ](https://zachruffin.com/blog/stream-processing-using-net-core-and-rabbitmq)
* 10 Feb: Andrea Mandolo wrote about [clustering RabbitMQ on ECS using EC2 autoscaling groups](https://medium.com/thron-tech/clustering-rabbitmq-on-ecs-using-ec2-autoscaling-groups-107426a87b98)
* 11 Feb: Sushant Chaudhary published about asynchronous feature extraction for [an artificial intelligence use case using RabbitMQ](https://medium.com/attentive-ai/asynchronous-feature-extraction-part-1-86a47cfcf762)
* 12 Feb: Davide Guida (@DavideGuida82) wrote about [implementing a producer/consumer with System.Threading.Channels](https://www.davideguida.com/how-to-implement-producer-consumer-with-system-threading-channels/)
* 13 Feb: Annie Blomgren wrote about [using Prometheus and Grafana with CloudAMQP](https://www.cloudamqp.com/blog/2020-02-13-Prometheus-and-Grafana.html), highlighting the new support in RabbitMQ 3.8
* 13 Feb: Tomas Kirda (@tkirda) wrote about [messaging with RabbitMQ in Node.js](https://www.devbridge.com/articles/messaging-with-rabbitmq-in-node-js/)
* 13 Feb:Mike Møller Nielsen (@MikeMoelNielsen) published [a video about setting up RabbitMQ dead lettering](https://youtu.be/ovE8NKAwqTI)
* 14: Mike Møller Nielsen (@MikeMoelNielsen) published [a video about RabbitMQ dead lettering in Java](https://youtu.be/L8OGw7bK3eU)
* 14: Davide Guida (@DavideGuida82) wrote a part 4 in his series about [consuming message queues using .NET Core background workers](https://www.davideguida.com/consuming-message-queues-using-net-core-background-workers-part-4-adding-system-threading-channels/)
* 14: Todd Sharp (@recursivecodes) published a video about [building a desktop glucose monitor with Node RED, RabbitMQ, Autonomous DB and the M5Stack](https://youtu.be/I9IMOpZ4YYo)
* 15: Naveed Khan (@naveed_125) wrote about [background processing with RabbitMQ, Python, and Flask](https://medium.com/better-programming/background-processing-with-rabbitmq-python-and-flask-5ca62acf409c)
* 15: Ömer Özkan wrote about [different RabbitMQ retry topologies](https://medium.com/@ozkan.omer5/rabbitmq-retries-topologies-2e3341d89ca9)
* 16: Eran Stiller (@eranstiller) published the second part in his [comparison series of RabbitMQ and Kafka](https://medium.com/better-programming/rabbitmq-vs-kafka-1779b5b70c41)
* 16: Saurabh Singh wrote about [how to create a RabbitMQ cluster in Docker/AWS Linux](https://medium.com/@saurabh.singh0829/how-to-create-rabbitmq-cluster-in-docker-aws-linux-4b26a31f90bc)
* 17: Artem Matveev published the first in a nine-part series on RabbitMQ, first focused on an [introduction to Erlang and AMQP 0-9-1](https://habr.com/ru/post/488654/) (in Russian)
* 17: Saurabh Singh shared sample code for [using RabbitMQ with .NET Core and ReactJS](https://medium.com/@saurabh.singh0829/async-queue-implementation-using-rabbitmq-net-core-reactjs-12d98f9745dc)
* 18: Steven Nunez (@_StevenNunez) was a guest on the Elixir Mix podcast, talking about [how FlatIron School uses RabbitMQ with Elixir](https://devchat.tv/elixir-mix/emx-088-adopting-elixir-and-rabbitmq-with-steven-nunez/)
* 18: Gleb Zhukov published the first in a three part series on [using RabbitMQ with MonsterMQ](https://habr.com/ru/post/488850/), staring with an intro to RabbitMQ (in Russian)
* 18: Sage Pierce wrote about how [Expedia is now open sourcing Rhapsody](https://medium.com/expedia-group-tech/rhapsody-is-now-open-source-cfb4a2aec906), based on the Reactive Streams specification, and features integration with RabbitMQ
* 19: Artem Matveev published the [second in a nine-part series on RabbitMQ](https://habr.com/ru/post/489086/), on understanding exchanges (in Russian)
* 20: Mohamad Fadhil (@sdil) wrote an [introduction to message queues with RabbitMQ and Python](https://medium.com/better-programming/introduction-to-message-queue-with-rabbitmq-python-639e397cb668)
* 20: Lajos Gerecs published about [what you need to know about Quorum Queues](https://www.erlang-solutions.com/blog/rabbitmq-quorum-queues-explained-what-you-need-to-know.html), the new way to run highly available queues in RabbitMQ 3.8
* 21: Robert Barnes (@devops_rob) presented about [securing RabbitMQ with Vault](https://www.hashicorp.com/resources/securing-rabbitmq-with-vault), published by HashiCorp
* 24: JM Santos wrote about how he handles [long processes using NestJS and RabbitMQ](https://medium.com/@jmaicaaan/how-i-handle-long-processes-using-nest-js-and-rabbitmq-47ae67803c75)
* 26: Gleb Zhukov published the second in a three part series on [using RabbitMQ with MonsterMQ](https://habr.com/ru/post/489022/), getting into setting up queues (in Russian)
* 27: Gerhard Lazu (@gerhardlazu) published [another installment of TGIR, “Help! RabbitMQ ate my RAM!”](https://youtu.be/dkAhsp-Oxf4)
* 27: Alex Kruchkov (@kruchkov_alex) wrote about [how AppsFlyer uses Apache AirFlow with RabbitMQ](https://medium.com/appsflyer/how-appsflyer-uses-apache-airflow-to-run-over-3-5k-daily-jobs-and-more-683106cb24fc)
* 28: Gleb Zhukov published the third in a three part series on [using RabbitMQ with MonsterMQ](https://habr.com/ru/post/489692/), getting into exchanges (in Russian)
* 29: Eduard Stefanescu (@EdStefanescu) published about [RabbitMQ producers with Docker in .NET](https://stefanescueduard.github.io/2020/02/29/rabbitmq-producer-with-docker-in-dotnet/)
* 29: Saurabh Singh wrote about [using SignalR and RabbitMQ with .NET Core ReactJS](https://medium.com/@saurabh.singh0829/create-signalr-rabbitmq-with-net-core-reactjs-f6980b52c51c)
* 29: Lovisa Johansson (@lillajja) published a case study about [how FarmBot uses RabbtitMQ hosted by CloudAMQP](https://www.cloudamqp.com/blog/2020-02-29-user-story-how-rabbitmq-transformed-agri-tech-app-farmbot.html)

## Learn More

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ:

* 5-6 Mar, San Francisco: [Code BEAM SF](https://codesync.global/conferences/code-beam-sf/) which features these talks on RabbitMQ:
* A Novel Application Of Rabbitmq For The Reliable Automated Deployment Of Software Updates with Brett Cameron (@brc859844) and Natalya Arbit
* How RabbitMQ simplifies routing in a microservices architecture with Jianbo Li and Yijian Yang
* 9 Jun, Berlin: [RabbitMQ Summit](https://rabbitmqsummit.com/)
* On-demand, online at LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online at Udemy: [RabbitMQ: Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
* Online, $40 buys you early access to Marco Behler’s course, [Building a Real-World Java and RabbitMQ Messaging Application](https://www.marcobehler.com/courses/30-building-a-real-world-java-and-rabbitmq-messaging-amqp-application)
* Online, Pluralsight course: [RabbitMQ by Example](https://www.pluralsight.com/courses/rabbitmq-by-example) gets good reviews
* Online: Luxoft is offering a [RabbitMQ course in Russian](https://www.luxoft-training.ru/kurs/platforma_obmena_soobshcheniyami_rabbitmq.html)
