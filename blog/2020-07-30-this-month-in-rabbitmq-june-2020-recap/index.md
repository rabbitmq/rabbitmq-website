---
title: "This Month in Rabbitmq June 2020 Recap"
tags: ["Updates", ]
authors: [mklishin]
---

This month in RabbitMQ features the release of the RabbitMQ Cluster Kubernetes Operator, benchmarks and cluster sizing case studies by Jack Vanlightly (@vanlightly), and a write up of RabbitMQ cluster migration by Tobias Schoknecht (@tobischo), plus lots of other tutorials by our vibrant community!

<!-- truncate -->

## Project Updates

 * The [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/operator-overview) has been released in beta!
    The Operators strives to offer best-in-class automation of RabbitMQ clusters running on Kubernetes, from initial deployments to Day 2 operations. Please try it and give us feedback via Github!
 * RabbitMQ will be [migrating to the Mozilla Public License 2.0](https://github.com/rabbitmq/rabbitmq-server/issues/2372) starting with the 3.8.6 release
 * [RabbitMQ 3.8.6-rc.1](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.6-rc.1) is released is
   available for testing.
 * [RabbitMQ .NET client development](https://github.com/rabbitmq/rabbitmq-dotnet-client/pulls?q=is%3Apr+is%3Aclosed) has maintained its pace. Major thanks to our awesome community of users and contributors!


## Community Writings and Resources

 * June 1: [Recovering RabbitMQ connections in Go applications](https://medium.com/@dhanushgopinath/automatically-recovering-rabbitmq-connections-in-go-applications-7795a605ca59) by @dhanushgopinath
 * June 1: [Fanout Async Messaging Design](https://www.c-sharpcorner.com/article/fanout-design-with-rabbitmq-exchange/) In Microservices Using RabbitMQ, by Nilanjan Dutta (@nilanjan_i_am)
 * June 2: [Get Started with RabbitMQ 2: Consume Messages](https://codeburst.io/get-started-with-rabbitmq-2-consume-messages-using-hosted-service-e7e6a20b15a6) Using a Hosted Service by Changhui Xu (@changhuixu)
 * June 4: [How to Benchmark RabbitMQ](/blog/2020/06/04/how-to-run-benchmarks) by @vanlightly
 * June 6: Influx DB via RabbitMQ: [Gathering Metrics over RabbitMQ](https://raymondc.net/2020/06/06/influx-via-telegraf-and-rmq-index.html) by Raymond Coetzee
 * June 6: [Go RabbitMQ tutorial walkthrough](https://www.linkedin.com/pulse/go-rabbitmq-tutorial-walkthrough-sergei-stadnik) by Sergei Stadnik
 * June 12: [Implementing Resilience Between Microservices with RabbitMQ and Dead-Letter Exchanges](https://www.linkedin.com/pulse/implementando-resili%25C3%25AAncia-entre-microservi%25C3%25A7os-com-e-rabbitmq-alonso), by Rodrigo Alonso (in Portuguese)
 * June 13: [Tips for deploying and managing a high availability RabbitMQ cluster](https://medium.com/%E6%BC%B8%E5%BC%B7%E5%AF%A6%E9%A9%97%E5%AE%A4-crescendo-lab-engineering-blog/tips-for-deploy-and-manage-high-availability-rabbitmq-cluster-a0d8002ab97e) by Chris Kuan (@kst920106), in Chinese
 * June 17: [Microservices communication: Rabbitmq and ASP.NET core](https://doumer.me/micro-services-communication-rabbitmq-and-asp-net-core/) by @Damien_Doumer
 * June 18: [Cluster sizing and other considerations](/blog/2020/06/18/cluster-sizing-and-other-considerations) by @vanlightly
 * June 18: [Cluster Sizing Case Study: Mirrored Queues Part 1](/blog/2020/06/19/cluster-sizing-case-study-mirrored-queues-part-1) by @vanlightly
 * June 18: [Cluster Sizing Case Study: Mirrored Queues Part 2](/blog/2020/06/20/cluster-sizing-case-study-mirrored-queues-part-2) by @vanlightly
 * June 18: [Cluster Sizing Case Study: Quorum Queues Part 1](/blog/2020/06/21/cluster-sizing-case-study-quorum-queues-part-1) by @vanlightly
 * June 18: [Cluster Sizing Case Study: Quorum Queues Part 2](/blog/2020/06/22/cluster-sizing-case-study-quorum-queues-part-2) by @vanlightly
 * June 22: [How to bridge RabbitMQ with Azure Service Bus](https://dev.to/azure/how-to-bridge-rabbitmq-with-azure-service-bus-98l) by Álvaro Videla (@old_sound)
 * June 23: [Setting up a Flask app with a Celery beat scheduler and RabbitMQ](https://medium.com/@delivey/celery-beat-scheduler-flask-rabbitmq-e84cdba63ab7) as the message broker, by @delivey
 * June 23: [How Quorum Queues Deliver Locally](/blog/2020/06/23/quorum-queues-local-delivery) while still offering ordering guarantees, by @vanlightly
 * June 24: [How to do a RabbitMQ cluster migration](https://www.sysorchestra.com/rabbitmq-cluster-migration/) by Tobias Schoknecht (@tobischo)
 * June 24: [Installing RabbitMQ on Windows with a .NET Core Publisher and Consumer](https://medium.com/@a.burakbasaran/rabbitmq-nedir-windows-ortam%C4%B1na-kurulumu-ve-net-core-publisher-consumer-fd55adcf35e7) by Ali Burak Ba?aran (@a.burakbasaran), in Turkish
 * June 25: [Learning RabbitMQ](https://medium.com/ryans-dev-notes/learning-rabbitmq-3f59d11f66b4) by Ryan Ermita, with code examples (@ryanermita)
 * June 27: [Connecting Services using MassTransit and RabbitMQ on .NET Core 3.1](https://medium.com/@ffimnsr/connecting-services-using-masstransit-rabbitmq-on-net-core-3-1-343b510c9202) by Edward Fitz Abucay (@ffimnsr)


## Learn More

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

 * Udemy is offering “[Learn RabbitMQ: In-Depth Concepts](https://www.udemy.com/course/rabbitmq-message-broker-learn-in-depth-concepts-in-rabbitmq/) from Scratch with Demos” for $13.99, an 85% discount. You can’t afford not to learn RabbitMQ at this price!
