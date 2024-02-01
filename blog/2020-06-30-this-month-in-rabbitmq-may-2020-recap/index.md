---
title: "This Month in RabbitMQ, May 2020 Recap"
tags: ["Updates", ]
authors: [mklishin]
---

This month, Jack Vanlightly continues his blog series on [Quorum Queues in RabbitMQ](/blog/2020/05/04/quorum-queues-and-flow-control-the-concepts).
Also, be sure to watch the replay of his [related webinar](https://tanzu.vmware.com/content/rabbitmq/jun-11-ha-and-data-safety-in-messaging-quorum-queues-in-rabbitmq).

Finally, Episode 5 of TGI RabbitMQ is out -- Gerhard Lazu walks us through [how to run RabbitMQ on Kubernetes](https://www.youtube.com/watch?v=-yU95ocpBYs).
Don’t miss!

<!-- truncate -->

## Project Updates

* [RabbitMQ 3.8.4](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.4) was released in late May,
the first release to feature Erlang 23 compatibility. Three weeks later [3.8.5](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.5) followed with complete Erlang 23 support.
* Docker community-maintained RabbitMQ image [has adopted Erlang 23](https://github.com/docker-library/rabbitmq/pull/411) in less than two weeks since its release
* rabbit-hole, the most popular Go RabbitMQ HTTP API client, has [reached version 2.2.0](https://github.com/michaelklishin/rabbit-hole/releases/tag/v2.2.0)
* Merged an impressive pull request from GitHub user @joseliber that fixed the generation of
password-encrypted certificates in the [tls-gen](https://github.com/michaelklishin/tls-gen/pull/23) project.
This project is used by RabbitMQ, its client libraries, and other projects to easily generate self-signed certificates.

## Community Writings and Resources

* May 1: [Improvements in memory allocations in RabbitMQ .NET client](https://stebet.net/real-world-example-of-reducing-allocations-using-span-t-and-memory-t/) by Stefán Jökull Sigurðarson (@stebets)
* May 1: [Connecting To RabbitMQ In Golang](https://dev.to/wagslane/connecting-to-rabbitmq-in-golang-en4) by Lane Wagner (@wagslane)
* May 12: [RabbitMQ Use Cases](https://www.petermorlion.com/rabbitmq-use-cases/) by Peter Morlion (@petermorlion)
* May 14: Jack Vanlightly on [flow control in RabbitMQ](/blog/2020/05/14/quorum-queues-and-flow-control-single-queue-benchmarks), with benchmarks (@vanlightly)
* May 15: [Flow control in RabbitMQ: stress tests](/blog/2020/05/15/quorum-queues-and-flow-control-stress-tests) (@vanlightly)
* May 17: [Produce And Consume Messages To RabbitMQ Docker Container](https://www.c-sharpcorner.com/article/publisher-and-consumer-with-rabbitmq-docker-container/) Using .NET Client, by Nilanjan Dutta (@nilanjan_i_am)
* May 25: [.NET Core and RabbitMQ, Part 1](http://codereform.com/blog/post/net-core-and-rabbitmq/), by George Dyrrachitis (@giorgosdyrra)
* May 27: [.NET Core and RabbitMQ, Part 2](http://codereform.com/blog/post/net-core-and-rabbitmq-part-2-communication-via-amqp/), by George Dyrrachitis (@giorgosdyrra)
* May 27: [Spring Cloud Stream with RabbitMQ](https://medium.com/@odysseymoon/spring-cloud-stream-with-rabbitmq-c273ed9a79b) by @odysseymoon
* May 28: [RabbitMQ Exchange Types](https://medium.com/trendyol-tech/rabbitmq-exchange-types-d7e1f51ec825) by Fatiha Beqirovski (@fatihabeqirovski)
* May 31: [RabbitMQ: Bindings](https://www.petermorlion.com/rabbitmq-bindings/) by Peter Morlion (@petermorlion)

## Learn More

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

* Udemy offers “[RabbitMQ from start to finish](https://www.udemy.com/course/rabbitmq-from-start-to-finish/)” for the low, low price of only $19.99!
* New course: [Introduction to Spring Cloud Stream](https://www.baeldung.com/spring-cloud-stream) by baeldung, illustrated with RabbitMQ
* [RabbitMQ Expert Training](https://www.eventbrite.co.uk/e/rabbitmq-expert-training-online-tickets-102979348002): online, by Erlang Solutions, Nov 9 2020
