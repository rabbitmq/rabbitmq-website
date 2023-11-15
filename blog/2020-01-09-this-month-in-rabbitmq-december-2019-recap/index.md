---
title: "This Month in RabbitMQ, December 2019 Recap"
tags: ["Updates", ]
authors: [mklishin]
---

This Month in RabbitMQ — December Recap!

Happy new year! 3.8.x has been available for over three months now and we’re seeing a lot of great uptake. This is good news,
since the upgrade process is even easier with the addition of [feature flags](/docs/feature-flags). Keep up the upgrading!

Over at the [CloudAMQP blog](https://www.cloudamqp.com/blog/index.html), you’ll now find videos transcripts of all the RabbitMQ Summit talks.
Those are useful if you didn’t make it to the event and want to know what’s in the talk before watching the full 30 minute replay.

Take a look at [Observe and Understand RabbitMQ](https://www.cloudamqp.com/blog/2019-12-10-observe-and-understand-rabbitmq.html), for example.

We also published a [new case study about LAIKA](/blog/2019/12/16/laika-gets-creative-with-rabbitmq-as-the-animation-companys-it-nervous-system), the animation company that brought you Coraline, The BoxTrolls, and Missing Link.
If you are interested in having your use case for RabbitMQ profiled on rabbitmq.com, drop a note in the mailing list or email info@rabbitmq.com.

<!-- truncate -->

## Project updates

* RabbitMQ 3.8.2 has been released
* and so has 3.7.23
* There is a [new support policy for RabbitMQ Java libraries](https://groups.google.com/d/msg/rabbitmq-users/F9f0ymQLSYE/59nBVlWPBQAJ). Please read it if you use them!
* [Reactor RabbitMQ 1.4.1](https://groups.google.com/d/msg/rabbitmq-users/W4OqI-cTP8Y/fiIQJ7FgBAAJ) is released with a new feature.
* [PerfTest 2.10.0](https://groups.google.com/d/msg/rabbitmq-users/jHaEvZr_Oxg/YXasq2dWBQAJ) is released with usability improvements and dependency upgrades.
* [Java Client 5.8.0](https://groups.google.com/d/msg/rabbitmq-users/wlSB7BxbhrU/-6HddX7vAQAJ) is released with a new feature (OAuth 2 support), a usability improvement, and dependency upgrades.
* [JMS Client 2.0.0.RC1](https://groups.google.com/d/msg/rabbitmq-users/JWC1WP53KL0/i9UJqcmOBQAJ) is released. It will become the main production line before 1.x goes end-of-life this year. Please try it out before it goes GA!

## Community Writings and Resources

* 2 Dec: Mike Møller Nielsen (@MikeMoelNielsen) published a

[video on how to setup RabbitMQ and DataDog in Docker]

(https://youtu.be/1piLrhGuzu4) and then have the DataDog-agent pick up metrics and logs
* 2 Dec: Kailash Yogeshwar wrote about [clustering RabbitMQ with Docker Compose](https://medium.com/@kailashyogeshwar/rabbitmq-cluster-using-docker-compose-7397ea378d73)
* 3 Dec: Josh Justice (@CodingItWrong) wrote the first part in a series on [live updates with queues, websockets, and push notifications](https://www.bignerdranch.com/blog/live-updates-with-queues-websockets-and-push-notifications-part-1-rabbitmq-queues-and-workers/) using RabbitMQ Queues and Workers
* 4 Dec: Mike Møller Nielsen (@MikeMoelNielsen) published a [video on using the RabbitMQ REST API with Spring Boot](https://youtu.be/mAo_1At32-Q)
* 5 Dec: Alex Koutmos (@akoutmos) wrote part 2 of his series on [Broadway, RabbitMQ, and the rise of Elixir](https://akoutmos.com/post/broadway-rabbitmq-and-the-rise-of-elixir-two/)
* 6 Dec: Mike Møller Nielsen (@MikeMoelNielsen) published a [video on building a customer RabbitMQ Docker image](https://youtu.be/I8QHPfMhqAU) with custom configuration and definitions
* 6 Dec: Otavio Santana (@otaviojava) wrote about [how to scale your application with Spring and RabbitMQ](https://dzone.com/articles/scale-your-application-with-spring-and-rabbitmq)
* 8 Dec: Sofiene Memmi wrote about how to [scrape your service RabbitMQ messages with Prometheus and Kubernetes](https://medium.com/@sofienememmi/scrape-your-service-rabbitmq-messages-with-prometheus-kubernetes-b4f711993f19)
* 8 Dec: Bekir Aytaç A?MA (@AytacAgma) wrote about [what is RabbitMQ and how to install it](https://www.aytacagma.com/rabbitmq-nedir-ve-nasil-kurulur/) (in Turkish)
* 9 Dec: Bora Ka?mer (@CoderBora) wrote about [audit logging in MongoDB using RabbitMQ and NodeJS](http://www.borakasmer.com/nodejs-uzerinde-rabbitmq-kullanarak-mongodbde-audit-log-tutma/) (in Turkish)
* 10 Dec: Mike Møller Nielsen (@MikeMoelNielsen) published a

[video on how to set up a highly available RabbitMQ using a reverse proxy with Ngnix]

(https://youtu.be/Gtq9nBr1Ca0) for multiple protocols
* 10 Dec: Ryan Cocks wrote about [TLS for RabbitMQ using Kamatera Hosting for Node.js](https://medium.com/@ryan_4378/ssl-for-rabbitmq-using-kamatera-hosting-node-js-ed91c5fc5b2e)
* 11 Dec: Shaurya Bajajwrote a [layperson’s guide to message brokers, featuring RabbitMQ](https://medium.com/@curiousGuy13/a-laymans-guide-to-message-brokers-be0259ed67da)
* 12 Dec: Lovisa Johansson (@lillajja) wrote a [blog comparing RabbitMQ with Apache Kafka](https://www.cloudamqp.com/blog/2019-12-12-when-to-use-rabbitmq-or-apache-kafka.html)
* 12 Dec: Peter Morlion (@petermorlion) released a course on LinkedIn Learning on [Learning RabbitMQ](https://www.linkedin.com/learning/learning-rabbitmq/connect-your-services-with-asynchronous-messaging?u=2171914)
* 12 Dec: Gerhard Lazu (@gerhardlazu) hosted [Understanding RabbitMQ: New Metrics Subssystem](https://content.pivotal.io/webinars/dec-12-understand-rabbitmq-for-developers-and-operators-webinar?utm_campaign=this-month-understanding-rabbitmq&amp;utm_source=rabbitmq&amp;utm_medium=website) webinar
* 13 Dec: Sergey Suslov (@sergeysuslovnsk) published about [communicating using RabbitMQ in Node.js](https://medium.com/swlh/communicating-using-rabbitmq-in-node-js-e63a4dffc8bb)
* 14 Dec: Mike Møller Nielsen (@MikeMoelNielsen) published a [video on how to put 2 RabbitMQ instances into a cluster](https://youtu.be/YPXC_ERdjCo)
* 15 Dec: Joor Loohuis (@joorloohuis) wrote about the [prefetch count setting in RabbitMQ](https://medium.com/@joor.loohuis/about-the-prefetch-count-in-rabbitmq-5f2f5611063b)
* 16 Dec: Matthew Viegas (@mateuscviegas) wrote [an introduction to RabbitMQ for .NET Core](https://dev.to/mviegas/pt-br-introducao-ao-rabbitmq-com-net-core-15oc) (in Portugese)
* 16 Dec: Diogo Bemfica (@diobemfica) wrote about [topic exchanges in RabbitMQ](https://diogobemfica.com.br/exchanges-tipo-topic-no-rabbitmq) (in Portuguese)
* 16 Dec: Dormain Drewitz (@DormainDrewitz) published a [case study on how the animation company, LAIKA, uses RabbitMQ](/blog/2019/12/16/laika-gets-creative-with-rabbitmq-as-the-animation-companys-it-nervous-system)
* 19 Dec: InfoQ published a [talk on RabbitMQ and Kafka](https://www.infoq.com/presentations/rabbitmq-kafka/) by Zoe Vance and Madhav Sathe (@madhav_sathe)
* 19 Dec: James Ellis wrote about [how to use Celery and RabbitMQ with Django](https://morioh.com/p/b9f71324b5b1)
* 19 Dec: Jared Ruckle (@jaredruckle) wrote about how [RabbitMQ for Pivotal Platform now runs RabbitMQ 3.8](https://content.pivotal.io/blog/any-company-can-become-a-software-driven-organization-the-new-release-of-pivotal-platform-gives-you-the-blueprint#The%20new%20RabbitMQ%20open%20source%20release%20comes%20to%20Pivotal%20Platform)
* 20 Dec: Erlang Solutions (@ErlangSolutions) published a roundup of [their best of RabbitMQ](https://www.erlang-solutions.com/blog/rabbitmq-highlights-2019-best-of-the-beam.html) from 2019
* 20 Dec: Lukáš Meš?an (@arzzen) wrote about the RabbitMQ [connection error “Broken pipe or closed connection”](https://lukasmestan.com/rabbitmq-broken-pipe-or-closed-connection/) and various solutions
* 20 Dec: VMware education and certification published a [video on vRA RabbitMQ](https://youtu.be/6TP_4CiF8-E) as part of their vCloud Automation University
* 23 Dec: Diogo Bemfica (@diobemfica) wrote about [RabbitMQ Exchange headers](https://diogobemfica.com.br/exchanges-tipo-headers-no-rabbitmq) (in Portuguese)
* 24 Dec: Alexander Nnakwue (@alex_nnakwue) wrote about [understanding message queuing systems using RabbitMQ](https://blog.logrocket.com/understanding-message-queuing-systems-using-rabbitmq/)
* 25 Dec: Luiz Duarte (@luiztools) wrote about [asynchronous processing of queued tasks in RabbitMQ and Node.js](https://www.luiztools.com.br/post/processamento-assincrono-de-tarefas-com-filas-no-rabbitmq-e-node-js/) (in Portuguese)
* 27 Dec: Alen Ibric wrote an [introduction to RabbitMQ](https://www.alenibric.com.tr/2019/12/27/rabbitmq-message-broker/)
* 29 Dec: Thiago Brito (@devbrito91) wrote a [post on messaging](https://medium.com/@devbrito91/mensageria-1330c6032049) (in Portuguese)
* 30 Dec: Diogo Bemfica (@diobemfica) wrote about [RabbitMQ properties](https://diogobemfica.com.br/propriedades-do-rabbitmq) (in Portuguese)

## Training

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

* 31 Jan: [How to upgrade from RabbitMQ 3.7 to 3.8 in prod?](https://github.com/rabbitmq/tgir/pull/3)
* 13 Feb: free online webinar on [How to Build Reliable Streaming Pipelines with RabbitMQ and Project Reactor](https://content.pivotal.io/rabbitmq/feb-13-how-to-build-reliable-streaming-pipelines-with-rabbitmq-and-project-reactor-webinar?utm_campaign=reactor-streaming-webinar-blog&amp;utm_source=rabbitmq&amp;utm_medium=website)
* On-demand, online @ LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online @ Udemy: [RabbitMQ: Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
* Online: $40 buys you early access to Marco Behler’s course, [Building a real-world Java and RabbitMQ messaging (AMQP)](https://www.marcobehler.com/courses/30-building-a-real-world-java-and-rabbitmq-messaging-amqp-application) application
* Online: Pluralsight course: [RabbitMQ by Example](https://www.pluralsight.com/courses/rabbitmq-by-example) gets good reviews
