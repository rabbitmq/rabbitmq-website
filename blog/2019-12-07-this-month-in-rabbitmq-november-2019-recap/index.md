---
title: "This Month in RabbitMQ, November 2019 Recap"
tags: ["Updates", ]
authors: [mklishin]
---

Last month was a big one for the RabbitMQ community because RabbitMQ Summit happened in London! If you missed the event, or if you were at the event, but missed a session in the other track, [all the recordings](https://www.youtube.com/watch?v=InqY3l69yCs&amp;list=PLDUzG2yLXrU7gQAzZwMEkjkfTy0L5FsJx) are now available. Also, be sure to check out our overview blog for an easy-to-digest [summary of what’s new in RabbitMQ 3.8](/blog/2019/11/11/rabbitmq-3-8-release-overview).

More new 3.8 features and lessons learned will be covered in [an upcoming webinar](https://content.pivotal.io/webinars/dec-12-understand-rabbitmq-for-developers-and-operators-webinar?utm_campaign=rabbitmq-devops-erlang_q419&amp;utm_source=twitter&amp;utm_medium=social),
by RabbitMQ core team member Gerhard Lazu. Tune in on December 12th!

<!-- truncate -->

## Project Updates

* [RabbitMQ 3.7.22](https://groups.google.com/forum/#!msg/rabbitmq-users/9ztCUW7RaMU/JkQQXXOEBgAJ) and [3.8.2](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.2) were released, both include a patch for [CVE-2019-11287](https://pivotal.io/security/cve-2019-11287)
* [Kubernetes peer discovery example](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_k8s/tree/master/examples/minikube) was updated
and is now a more complete. Speaking for Kubernetes, you can sign up to beta test Pivotal's [RabbitMQ for Kubernetes](https://pivotal.io/pivotal-rabbitmq-on-kubernetes)!
* [Reactor RabbitMQ 1.4.0](https://groups.google.com/d/msg/rabbitmq-users/aY4aOtUPneg/p9GDDsSDBgAJ) is released as part of the [Reactor Dysprosium-SR2 release train](https://projectreactor.io/docs). This release comes with a new feature, a usability improvement, and a dependency upgrade.
* There were several new Erlang releases, already available via our [Debian](https://github.com/rabbitmq/erlang-debian-package/) and [RPM packages](https://github.com/rabbitmq/erlang-rpm) on [PackageCloud](https://packagecloud.io/rabbitmq/erlang/), [GitHub](https://github.com/rabbitmq/erlang-rpm/releases), and other places. There's now an RPM package produced for CentOS/RHEL 8.
* [Hop 3.5.0](https://groups.google.com/d/msg/rabbitmq-users/fOhiRVFnYJg/6BRKqhH4AwAJ) is released with a new feature, a few bug fixes, and dependency upgrades.

## Community Writings and Resources

* 4 Nov: Yuki Nishiwaki and Bhor Dinesh (@Dinesh_bhor) shared their slides from their OpenStack Shanghai Summit talk, [How we used RabbitMQ in Wrong Way at Scale](https://speakerdeck.com/line_developers/how-we-used-rabbitmq-in-wrong-way-at-a-scale). Note that the talk covers RabbitMQ 3.6.
* 5 Nov: Davide Guida (@DavideGuida82) published the third part in a series about microservices consuming message queues [using .NET Core background workers and RabbitMQ](https://www.davideguida.com/consuming-message-queues-using-net-core-background-workers-part-3-the-code-finally/)
* 5 Nov: Denis Germain (@zwindler) published [a recap of the RabbitMQ Summit](https://blog.zwindler.fr/2019/11/05/recap-du-rabbitmq-summit-2019/) (in French)
* 6 Nov: Ran Ribenzaft (@ranrib) wrote about [distributed tracing through RabbitMQ using Node.js and Jaeger](https://epsagon.com/blog/distributed-tracing-through-rabbitmq-using-node-js-jaeger/)
* 7 Nov: Kacper Mentel (@kacper_mentel) wrote about [how to debug RabbitMQ based on a real-world example](https://www.erlang-solutions.com/blog/how-to-debug-your-rabbitmq.html)
* 8 Nov: Lovisa Johansson (@lillajja) updated her post on [best practices for high performance (low latency) RabbitMQ](https://www.cloudamqp.com/blog/2018-01-08-part2-rabbitmq-best-practice-for-high-performance.html)
* 8 Nov: Hussein Nasser (@hnasr) published a [video tutorial introducing publish and subscribe approaches](https://youtu.be/O1PgqUqZKTA)
* 8 Nov: GoLab Conference published a video featuring Gabriele Vaccari explaining how to build [an event-driven notification system in Go and RabbitMQ](https://youtu.be/HTM2UDzk7mY)
* 9 Nov: Thiago Vivas (@Tva88s) wrote about [using .NET Core with RabbitMQ for async operations](https://www.c-sharpcorner.com/article/using-net-core-with-rabbitmq-for-async-operations/)
* 10 Nov: Alex Koutmos (@akoutmos) published the first in a series about [Broadway, RabbitMQ, and the rise of Elixir](https://akoutmos.com/post/broadway-rabbitmq-and-the-rise-of-elixir/)
* 10 Nov: Soumil Nitin Shah published the first in a series of video tutorials on [using RabbitMQ with Python](https://www.youtube.com/watch?v=eSN0otKzYOE), starting with the basics
* 13 Nov: Dormain Drewitz (@DormainDrewitz) published [a summary of the expert panel at RabbitMQ Summit 2019](https://content.pivotal.io/blog/rabbitmq-3-8-steals-the-show-at-rabbitmq-summit-2019-expert-panel)
* 14 Nov: Szymon Mentel (@szymonmentel) wrote about [high availability in RabbitMQ](https://szkolarabbita.pl/o-systemach-wysokiej-dostepnosci-na-przykladzie-rabbitmq/), covering the traditional mirrored queues method, but also noting the new quorum queues in 3.8 (in Polish)
* 19 Nov: John Tucker published [an article on Web-Worker RPC with RabbitMQ](https://codeburst.io/web-worker-rpc-with-rabbitmq-1c6d90939f7)
* 20 Nov: Bahadir Tasdemir of Trendyol wrote about [event-driven microservices architecture with RabbitMQ](https://medium.com/trendyol-tech/event-driven-microservice-architecture-91f80ceaa21e)
* Nov 20: Cagri Aslanbas wrote about a dockerized [messaging implementation in Django with RabbitMQ and Celery](https://medium.com/@cagrias/a-dockerized-pub-sub-message-queue-implementation-in-django-by-using-rabbitmq-and-celery-20d349dc60b6)
* 21 Nov: Dormain Drewitz (@DormainDrewitz) published a [podcast interview](https://content.pivotal.io/podcasts/modernizing-from-mainframe-to-net-core-at-travelers-insurance) with Viraj Naik of Travelers Insurance and Rohit Kelapure from Pivotal. Their dicussion about modernizing a workload off of mainframe to .NET Core included how RabbitMQ was used.
* 22 Nov: Shivam Aggarwal (@shivama205) published [an overview of the new Quorum Queues feature in RabbitMQ 3.8](https://medium.com/@shivama205/rabbbitmq-quorum-queues-829cec655792)
* 24 Nov: The techno journals (@JournalsTechno) wrote about [installing RabbitMQ](https://www.thetechnojournals.com/2019/11/installing-rabbit-mq.html)
* 29 Nov: David Ireland published a [recap of RabbitMQ Summit](https://tech.labs.oliverwyman.com/blog/2019/11/29/rabbitmq-summit-2019-report/)
* 30 Nov: Mike Møller Nielsen (@MikeMoelNielsen) published a [video to demonstrate RabbitMQ Firehose tracing](https://youtu.be/ftIKXFLdYZQ)

## Ready to learn more?

Check out these upcoming opportunities to learn more about RabbitMQ

* 12 December 2019, online webinar: [Understanding RabbitMQ: For Developers and Operators](https://content.pivotal.io/webinars/dec-12-understand-rabbitmq-for-developers-and-operators-webinar?utm_campaign=this-month-understanding-rabbitmq&amp;utm_source=rabbitmq&amp;utm_medium=website)
* 16 December 2019, Lyon, France: [JUG Meetup](https://www.meetup.com/fr-FR/lyonjug/events/266379924)
* On-demand, online at LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online at Udemy: [RabbitMQ : Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
* Online: $40 buys you early access to Marco Behler’s course, [Building a real-world Java and RabbitMQ messaging (AMQP) application](https://www.marcobehler.com/courses/30-building-a-real-world-java-and-rabbitmq-messaging-amqp-application)
* Online at Pluralsight: [RabbitMQ by Example](https://www.pluralsight.com/courses/rabbitmq-by-example) gets good reviews
