---
title: "This Month in RabbitMQ — August 2019"
tags: ["Updates", ]
authors: [mklishin]
---

Welcome back for another edition of This Month in RabbitMQ! Some big news last month was Pivotal announced a forthcoming alpha of Pivotal RabbitMQ for Kubernetes.

You can inquire about the alpha here. As part of that announcement, RabbitMQ was mentioned in coverage in
[Business Insider](https://urldefense.proofpoint.com/v2/url?u=https-3A__www.businessinsider.com_pivotal-2Dpas-2Dkubernetes-2Dwall-2Dstreet-2Drob-2Dmee-2D2019-2D7&amp;d=DwMGaQ&amp;c=lnl9vOaLMzsy2niBC8-h_K-7QJuNJEsFrzdndhuJ3Sw&amp;r=HNaEFhtuH9k7pH023_PQLQ&amp;m=Dm_L-EU0Cj9GYRR86q6DKNZKjh987nlPsM-_-o4_AdU&amp;s=nmkWhPL5akypjR2NuDV1rGsjfnzy0cMwFTc6DljTNLA&amp;e=), [Container Journal](https://urldefense.proofpoint.com/v2/url?u=https-3A__containerjournal.com_2019_07_16_pivotal-2Dsoftware-2Dembraces-2Dkubernetes_&amp;d=DwMGaQ&amp;c=lnl9vOaLMzsy2niBC8-h_K-7QJuNJEsFrzdndhuJ3Sw&amp;r=HNaEFhtuH9k7pH023_PQLQ&amp;m=Dm_L-EU0Cj9GYRR86q6DKNZKjh987nlPsM-_-o4_AdU&amp;s=_HAFWbcG2YCTgh_9WKGtB35pASH9Xx0v2-9SNkVWcCM&amp;e=), [SiliconANGLE](https://urldefense.proofpoint.com/v2/url?u=https-3A__siliconangle.com_2019_07_16_pivotal-2Dlets-2Ddevelopers-2Dgo-2Dkubernetes-2Dnew-2Dapplication-2Dservice_&amp;d=DwMGaQ&amp;c=lnl9vOaLMzsy2niBC8-h_K-7QJuNJEsFrzdndhuJ3Sw&amp;r=HNaEFhtuH9k7pH023_PQLQ&amp;m=Dm_L-EU0Cj9GYRR86q6DKNZKjh987nlPsM-_-o4_AdU&amp;s=zp6rndnU4hRY6pqXxzTBJ7Ta5ka1pSapoNhO3ltmpBA&amp;e=), [Storage Review](https://urldefense.proofpoint.com/v2/url?u=https-3A__www.storagereview.com_pivotal-5Fannounces-5Falpha-5Fpas-5Fon-5Fkubernetes&amp;d=DwMGaQ&amp;c=lnl9vOaLMzsy2niBC8-h_K-7QJuNJEsFrzdndhuJ3Sw&amp;r=HNaEFhtuH9k7pH023_PQLQ&amp;m=Dm_L-EU0Cj9GYRR86q6DKNZKjh987nlPsM-_-o4_AdU&amp;s=KXYZlfGxqtmZ8SxG1Lxbxifn8vR_ikcKTJhxgTP5RzA&amp;e=), [The New Stack](https://urldefense.proofpoint.com/v2/url?u=https-3A__thenewstack.io_the-2Dpivotal-2Dapplication-2Dservice-2Daddresses-2Dkubernetes-2Dcomplexity_&amp;d=DwMGaQ&amp;c=lnl9vOaLMzsy2niBC8-h_K-7QJuNJEsFrzdndhuJ3Sw&amp;r=HNaEFhtuH9k7pH023_PQLQ&amp;m=Dm_L-EU0Cj9GYRR86q6DKNZKjh987nlPsM-_-o4_AdU&amp;s=V_N831y8xq8tN4C22uWzyRVazEMo5jeH2I_UWkXLTHI&amp;e=), and [ZDNet](https://urldefense.proofpoint.com/v2/url?u=https-3A__www.zdnet.com_article_pivotal-2Dfully-2Dembraces-2Dkubernetes_&amp;d=DwMGaQ&amp;c=lnl9vOaLMzsy2niBC8-h_K-7QJuNJEsFrzdndhuJ3Sw&amp;r=HNaEFhtuH9k7pH023_PQLQ&amp;m=Dm_L-EU0Cj9GYRR86q6DKNZKjh987nlPsM-_-o4_AdU&amp;s=nkU6qz4ibApb19l12jVYGvMwOsku1373gohti28olLg&amp;e=). Pretty cool!

Before we move on to the update from the core team and our wonderful community, a reminder that prices for [RabbitMQ Summit](https://rabbitmqsummit.com/) go up on August 22, so get your tickets now!

You can add on RabbitMQ training to your ticket—basic and advanced courses are available. Great talks planned from Bloomberg,
WeWork, Softonic, the Erlang Solutions and CloudAMQP teams, as well as the core RabbitMQ engineers, of course.

<!-- truncate -->

## Project updates

* [RabbitMQ 3.7.17](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.17) has been released with a bunch of bug fixes
* [Pika 1.1.0](https://github.com/pika/pika/blob/master/CHANGELOG.rst#110-2019-07-16) is released
* [Reactor RabbitMQ 1.3.0.M2](https://groups.google.com/d/msg/rabbitmq-users/dt16lIszpT4/w-6VkX6_BwAJ) was released as part of the Reactor Dysprosium-M3 release train. Lots of goodies in this pre-release!
* [Java client 5.7.3](https://groups.google.com/d/msg/rabbitmq-users/qYaF5DoUXzI/qmWLCQc4BgAJ) (for Java 8+) and [4.11.3](https://groups.google.com/d/msg/rabbitmq-users/exRMdS-7NwQ/GmDoryE3BgAJ) (for Java 6 &amp; 7) are released with a bug fix and upgrades of optional dependencies (along with 5.7.2 and 4.11.2)
* [php-amqplib 2.10.0-rc.1](https://github.com/php-amqplib/php-amqplib/releases/tag/v2.10.0-rc1) is out
* [JMS client 1.12.0](https://groups.google.com/d/msg/rabbitmq-users/TYd0c9ioJCs/WcLmsvLSBQAJ) is released with a bug fix and dependency upgrades
* [Hop 3.3.0](https://groups.google.com/d/msg/rabbitmq-users/61mZ_wbyctE/AUa5zaQ5BgAJ) is released with new features, bug fixes and dependency upgrades.
* [Erlang 20.3 support retirement schedule](https://groups.google.com/forum/#!searchin/rabbitmq-users/ANN|sort:date/rabbitmq-users/9tc_OE1eMPk/ly1NEISwBwAJ) is announced.
Please upgrade to [Erlang 22 or at least 21.3.x](/docs/which-erlang) soon!

## Community writings and resources

* July 2: Adam Johnson (@AdamChainz) reblogged about [Celery, RabbitMQ, and Warrens](https://adamj.eu/tech/2019/07/02/celery-rabbits-and-warrens/)
* July 4: Chetan Khatri (@khatri_chetan) published about how to [set up an Airflow multi-node cluster with Celery &amp; RabbitMQ](https://www.accionlabs.com/articles/2019/7/4/how-to-setup-airflow-multi-node-cluster-with-celery-amp-rabbitmq)
* July 4: Chung Khanh Duy (@duychung) wrote about [creating work queue(s) with Spring Boot and RabbitMQ](https://medium.com/@chungkhanhduy/create-work-s-queue-with-spring-and-rabbitmq-978cad149672)
* July 4: Mirko Maggiano (@magmir) published about [configuring TLS support in RabbitMQ](https://mirkomaggioni.com/2019/07/04/rabbitmq-tls-configuration/)
* July 5: Thiago Adriano (@programadriano) wrote about [creating workers with Node.js and RabbitMQ](https://www.mundojs.com.br/2019/07/05/rabbitmq-criando-workers-com-node-js/#page-content) (in Portuguese)
* July 5: Mirko Maggioni (@magmir) wrote about [monitoring RabbitMQ](https://mirkomaggioni.com/2019/07/05/monitoring-rabbitmq/)
* July 9: Sakthi Saravanan (@sakthis02) published an [introduction to RabbitMQ](https://medium.com/@sakthishanmugam02/rabbitmq-an-introduction-b84370fcf31)
* July 11: Alexy da Cruz (@geomtech9) wrote about [monitoring RabbitMQ with Grafana and Telegraf](https://alexydacruz.fr/monitoring/monitorer-rabbitmq-grace-a-grafana-et-telegraf/) (in French)
* July 13: Rémi Goyard (@mimiz33) wrote about [the road to microservices with Node.js events and RabbitMQ](https://medium.com/@rgoyard/road-to-microservices-with-node-js-events-and-rabbitmq-17acd4b199f3)
* July 14: Renato Groffe () published an update about [using .NET Core 2.2 with ASP.NET Core 2.2 and RabbitMQ](https://medium.com/@renato.groffe/net-core-2-2-asp-net-core-2-2-rabbitmq-exemplos-utilizando-mensageria-deb54ce63713) (in Portugese)
* July 15: Sakthi Saravanan (@sakthis02) explains [RabbitMQ connections vs channels](https://medium.com/@sakthishanmugam02/rabbitmq-connection-vs-channel-aed1188a7f3a)
* July 16: Code Sync published Ayanda Dube’s (@dube_aya) talk on [Innovative unorthodox design patterns used in RabbitMQ](https://www.youtube.com/watch?v=zYN9L8xZ4CU&amp;feature=youtu.be)
* July 16: Tarun Batra wrote about [polling reliably at scale using dead lettering](https://blog.smallcase.com/polling-reliably-at-scale-using-dlqs/)
* July 17: Genny Paudice published about [high availability with RabbitMQ](https://www.blexin.com/it-IT/Article/Blog/Alta-affidabilit-con-RabbitMQ-47) (in Italian)
* July 17: Rafael Honorio wrote a [getting started with RabbitMQ article](https://medium.com/@rafael.hs/rabbitmq-primeiros-passos-ae092d34a31f) in Portuguese
* July 17: The team at Royal Cyber (@RoyalCyberUSA) published about [integrating Dell Boomi with RabbitMQ](http://blog.royalcyber.com/middleware/integrating-dell-boomi-with-rabbitmq/)
* July 20: Teerapong Singthong (@iamgoangle) wrote about [interesting best practices with RabbitMQ](https://medium.com/iamgoangle/%E0%B8%AA%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%99%E0%B9%88%E0%B8%B2%E0%B8%AA%E0%B8%99%E0%B9%83%E0%B8%88%E0%B9%80%E0%B8%81%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%A7%E0%B8%81%E0%B8%B1%E0%B8%9A-rabbitmq-%E0%B9%81%E0%B8%A5%E0%B8%B0-amqp-best-practices-108f6076c330) (in Thai)
* July 24: Matthew Harper () published the first part in a series about [getting started with .NET Core, Docker, and RabbitMQ](https://medium.com/trimble-maps-engineering-blog/getting-started-with-net-core-docker-and-rabbitmq-part-1-a62601e784bb)
* July 24: Shivam Aggarwal (@shivama205) wrote about [RabbitMQ best practices](https://medium.com/@shivama205/rabbitmq-best-practices-67a27ef72a57)
* July 25: Ryan Ermita (@ryanermita) published about [learning RabbitMQ](https://medium.com/ryans-dev-notes/learning-rabbitmq-3f59d11f66b4) in order to migrate from using Redis as a message broker as he adopts a microservices architecture
* July 25: Gerhard Lazu (@gerhardlazu) shared his slides from his talk, “[Make Your System Observable](https://gerhard.io/slides/observable-systems-alpha/#/) - early preview of Observe and Understand RabbitMQ, one of the many RabbitMQ Summit talks
* July 27: Dmitriy Larionov (@larionov_pro) wrote about [why you would use RabbitMQ in a microservices architecture](https://larionov.pro/en/articles/2019/msa-rabbitmq-why/)
* July 27: Sajjad Hassanzadeh (@hassanzadeh_sd)  published [Celery and RabbitMQ in Django, Monitoring with Flower](https://medium.com/@hassanzadeh.sd/celery-and-rabbitmq-in-django-just-couple-of-steps-to-get-async-working-and-monitoring-with-flower-707dcd7254e8)
* July 29: TekLoon () wrote a step-by-step guide to [building event-driven microservices with RabbitMQ](https://medium.com/better-programming/a-step-by-step-guide-to-building-event-driven-microservices-with-rabbitmq-deeb85b3031c)
* July 29: Sergey Valuy (@Smartum_Pro) published about [using RabbitMQ in a messenger app architecture](https://dev.to/smartym/how-to-use-rabbitmq-for-building-a-messenger-app-architecture-19ma)

We also came across this article in the International Journal of Research Studies in Computer Science and Engineering (IJRSCSE) on [Distributing Messages Using Rabbitmq with Advanced Message Exchanges](https://www.arcjournals.org/pdfs/ijrscse/v6-i2/4.pdf)

## Events and Training Courses

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

* 12 September 2019, Bern: DevOps Meetup on [Observability and DevOps Value Stream Mapping](https://www.meetup.com/DevOps-Bern/events/262813160/) with RabbitMQ core team member Gerhard Lazu
* 30 September 2019, NYC: [RabbitMQ Express](https://codesync.global/conferences/code-beam-lite-nyc/training/)
* 4 November 2019, London, UK: [RabbitMQ Summit](https://rabbitmqsummit.com/)
* 5-6 November 2019, London, UK: Various [trainings available as part of the RabbitMQ Summit](https://rabbitmqsummit.com/#training)
* On-demand, online from LearnFly: [Learn RabbitMQ Asynchronous Messaging with Java and Spring](https://www.learnfly.com/learn-rabbitmq-asynchronous-messaging-with-java-and-spring)
* On-demand, online from Udemy: [Messaging with Java, Spring Boot And Spring MVC](https://www.udemy.com/rabbitmq-messaging-with-java-spring-boot-and-spring-mvc/)
* Online: $40 buys you early access to Marco Behler’s course, [Building a real-world Java and RabbitMQ messaging application](https://www.marcobehler.com/courses/30-building-a-real-world-java-and-rabbitmq-messaging-amqp-application)
