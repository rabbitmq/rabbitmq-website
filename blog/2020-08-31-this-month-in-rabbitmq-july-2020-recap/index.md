---
title: "This Month in RabbitMQ, July 2020 Recap"
tags: ["Updates", ]
authors: [mklishin]
---

It’s not the holidays yet, but the RabbitMQ community has presents for you anyway!
The RabbitMQ Kubernetes cluster operator is now open-sourced and developed in the open in GitHub.
Also, Gavin Roy has a new Python app that migrates queues between types.
Finally, a [webinar on RabbitMQ consumers](https://www2.erlang-solutions.com/webinar-registration-1#pardot-form) from Ayanda Dube, Head of RabbitMQ Engineering at Erlang Solutions.

<!-- truncate -->

## Highlights and Updates

 * A Windows-specific binary planting vulnerability was patched. See [CVE-2020-5419](https://tanzu.vmware.com/security/cve-2020-5419) for details.
   [CVSS score](https://www.first.org/cvss/calculator/3.0#CVSS:3.0/AV:L/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H) is 6.7 out of 10.
   We'd like to thank Ofir Hamam and Tomer Hadad at Ernst & Young's Hacktics Advanced Security Center for researching and responsibly disclosing
   this vulnerability.
 * [RabbitMQ 3.8.7](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.7) and [RabbitMQ 3.7.28](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.28)
   are two patch releases that patch the vulnerability.
 * The above releases are the first ones [released under the Mozilla Public License 2.0](https://github.com/rabbitmq/rabbitmq-server/issues/2372)

## Project updates

 * [Kubernetes Cluster Operator](/kubernetes/operator/operator-overview) development is [picking up the pace](https://github.com/rabbitmq/cluster-operator/pulls?q=is%3Apr+is%3Aclosed)
 * RabbitMQ 3.7 goes out of extended support [in a few weeks](/release-information) on September 30th, 2020
 * RabbitMQ .NET client community continues with [project simplification and efficiency gains](https://github.com/rabbitmq/rabbitmq-dotnet-client/pulls?q=is%3Apr+is%3Aclosed) for the next major version

## Community Writings and Resources

 * Gavin Roy (@Crad) created a Python app that uses dynamic Shovels to [migrate between queue types](https://gist.github.com/gmr/535c68a72b0338b3c4dd1832403422b1)
 * 5 Jul: [Spinning up a RabbitMQ instance](https://www.youtube.com/watch?v=eWiqa5SgxeA) and consuming it with Node.js (video) by Hussein Nasser
 * 6 Jul: Deploying a [Geo-Redundant Serverless RabbitMQ Cluster on Azure Using Pulumi](https://www.pulumi.com/blog/rabbitmq-azure/) for .NET by @itaypodhajcer
 * 8 Jul: [Schedule Messages in RabbitMQ](https://medium.com/swlh/delay-schedule-messages-in-rabbitmq-208b594cdc00) by Balwant Shekhawat (@balwantshekhawat)
 * 9 Jul:  Nuno Brites (@nbrites_) writes about experiments with [async messaging with Kotlin and RabbitMQ](https://medium.com/swlh/async-messaging-with-kotlin-and-rabbitmq-d69df1937b25)
 * 11 Jul: A [practical summary of RabbitMQ](http://www.ezlippi.com/blog/2020/07/rabbitmq-practice.html) by EZLippi
 * 16 Jul: [Using Spring Boot with RabbitMQ](https://www.ershicimi.com/p/de6004823c72e3e4805c5eee802c87a3) by Liao Xuefeng (in Chinese)
 * 20 Jul: [RabbitMQ Tutorial for Beginners](https://examples.javacodegeeks.com/rabbitmq-tutorial-for-beginners/) by Yatin
 * 20 Jul: [Error Handling with Spring AMQP](https://www.baeldung.com/spring-amqp-error-handling) by Eugene Baeldung (@baeldung), featuring RabbitMQ
 * 22 Jul: [RabbitMQ Work Queues Using Python](https://medium.com/@nipunsampath/rabbitmq-work-queues-using-python-d7663e3a2635) by Nipun Sampath (@nipunsampath)

## Learn More

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ:

Udemy is running a [special training on RabbitMQ](https://www.udemy.com/courses/search/?q=rabbitmq): 12 courses at $12.99 each. Highlights:

 * Learn RabbitMQ: Asynchronous Messaging with Java and Spring
 * Getting Started .NET Core Microservices RabbitMQ
 * RabbitMQ & Java (Spring Boot) for System Integration

In upcoming webinars: [RabbitMQ consumers under-the-hood](https://www2.erlang-solutions.com/webinar-registration-1#pardot-form).
Presented by Ayanda Dube, Head of RabbitMQ Engineering at Erlang Solutions.
