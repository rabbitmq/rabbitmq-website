---
title: "This Month in RabbitMQ — April 3, 2019"
tags: ["Updates", ]
authors: [mklishin]
---

RabbitMQ 3.8 is coming! If you haven’t already played with the beta ([version 3](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.8.0-beta.3) is now available), it’s time to start familiarizing yourself with what’s coming. Karl Nilsson and I will present on a webinar in May to walk through what’s new, so please [register](https://content.pivotal.io/webinars/may-23-what-s-new-in-rabbitmq-3-8-webinar?utm_source=blog&amp;utm_medium=email-link&amp;utm_campaign=rabbitmq-3.8-what's-new&amp;utm_term=q219) and attend.

We are also starting to look forward to the next [RabbitMQ Summit,](https://rabbitmqsummit.com/) once again in London this coming November. The [call for talks is open until May 10](https://eventil.com/events/rabbitmq-summit-2019/cfp), so please consider sharing how you are using RabbitMQ or something you have tried and learned and want to share with the community.

<!-- truncate -->

## Project updates

* [RabbitMQ 3.7.14](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.7.14) is out.
* Erlang packages produced by Team RabbitMQ now use a [separate Bintray org](https://bintray.com/rabbitmq-erlang/). The packages will [removed from the main Bintray org](https://groups.google.com/forum/#!msg/rabbitmq-users/Gu55prdJ7uM/tftnTT_ZAwAJ) on April 29th, 2019. See [Debian](/docs/install-debian) and [RPM](https://github.com/rabbitmq/erlang-rpm) installation instructions to learn how to set up the new repositories.
* Pika, the most popular Python client for RabbitMQ, [shipped version 1.0](https://groups.google.com/d/msg/rabbitmq-users/1wuoQYNg9QY/5uH33h15AQAJ)
* [php-amqplib 2.9.1](https://groups.google.com/d/topic/rabbitmq-users/ks4kk-raJAw/discussion) is now available
* New [documentation guide on Runtime Tuning](/docs/runtime) is live.
* [Hop 3.2.0](https://github.com/rabbitmq/hop) has been released with usability changes and dependency upgrades.
* [PerfTest 2.7.0](https://groups.google.com/d/msg/rabbitmq-users/v2V0YI_tifg/fuEbtY6hBQAJ) has been released, with dependency upgrades.

## Community writings and resources

* Updates to [OpenTracing for Spring and RabbitMQ](https://github.com/opentracing-contrib/java-spring-rabbitmq)
* Ahmad Kamil Almasyhur published an introduction to [RabbitMQ in the context of microservices](https://medium.com/@ahmadkamilalmasyhur/rabbitmq-what-is-that-10c74ac7620a) and the single responsibility principle
* Ilya Khaprov ([@dead_trickster](https://twitter.com/dead_trickster)) released a new version of [RabbitMQ metrics exporter for Prometheus](https://github.com/deadtrickster/prometheus_rabbitmq_exporter/releases/tag/v3.7.2.5)
* Bartosz Szafran ([@bartosz_szafran](https://twitter.com/bartosz_szafran) ) [dissects RabbitMQ’s topic exchanges](https://www.erlang-solutions.com/blog/rabbit-s-anatomy-understanding-topic-exchanges.html)
* Robert Witkowski ([@rwitkowski_asc](https://twitter.com/rwitkowski_asc)) published on [Micronaut with RabbitMQ Integration](https://altkomsoftware.pl/en/blog/micronaut-rabbitmq/)
* Jonas Neustock ([@NeustockJonas](https://twitter.com/NeustockJonas)) wrote about [how to use RabbitMQ with the constraints of operating behind a firewall](https://medium.com/@jonasbusse/how-to-build-an-on-premise-connection-with-rabbitmq-821f4e9a7d62) or on a corporate network
* Mark Heckler ( [@mkheck](https://twitter.com/mkheck)) shared the scripts/config he uses to spin up/down Docker containers for RabbitMQ &amp; Apache Kafka to use in his [talk series on Spring Cloud Stream](https://github.com/mkheck/LocalMessaging)
* John Canassa (**@john_canessa**) wrote about an experiment with a work queue [using RabbitMQ on a Windows 10 machine](http://www.johncanessa.com/2019/03/11/rabbitmq-work-queues/)
* Lee Conlin ([@hades200082](https://twitter.com/hades200082) ?) published a three-part series on Kentico (a .NET-based CMS) and RabbitMQ integration: [part 1](https://medium.com/distinctionuk/kentico-rabbitmq-integration-part-1-outbound-integration-7c1cdb15b38a), [part 2](https://medium.com/distinctionuk/kentico-rabbitmq-integration-part-2-inbound-integration-592e550f82b2), [part 3](https://medium.com/distinctionuk/kentico-rabbitmq-integration-part-3-external-workers-4b34b370a5ec)
* Piotr Nosek and Mateusz Bartkowiak published about how [MongoooseIM 3.3.0 adds support for RabbitMQ integration](https://www.erlang-solutions.com/blog/mongooseim-3-3-0-supporting-happy-relations.html)
* Igor Kuznetsov ([@igkuz](https://twitter.com/igkuz)), CTO at Setka, wrote about their collection of analytics for web sites and how this requires rate limiting on outgoing requests to avoid being mislabeled as a DDoS attack and banned. He then describes [how they use RabbitMQ dead letter exchange for retries and scheduled tasks](https://medium.com/@igkuz/ruby-retry-scheduled-tasks-with-dead-letter-exchange-in-rabbitmq-9e38aa39089b)
* Curtis Strain wrote about [publishing to RabbitMQ from AWS Lambda](https://medium.com/learningsam/publish-to-rabbitmq-from-aws-lambda-cdb66f9f35c5) and [consuming a RabbitMQ message from Lambda](https://medium.com/@curtis.strain/consume-a-rabbitmq-message-from-aws-lambda-b82953a6b1f6)
* Simon Seller wrote about building a [machine learning-powered system that uses RabbitMQ](https://aptira.com/machine-learning-rabbitmq/), detecting and reporting anomalies both as they arrive and when they are fixed
* Simone Pezzano ([@theirish81](https://twitter.com/theirish81)) published about the [architecture of API Fortress](https://medium.com/@simone.pezzano/a-digital-symphony-the-architecture-of-api-fortress-f2ad70ea5ffe), including how RabbitMQ and Akka are used
* Odelucca ([@_odelucca](https://twitter.com/_odelucca)) published the first in a series about [building a recommendation algorithm using Python and RabbitMQ](https://medium.com/@odelucca/python-recommendation-algorithm-using-rabbitmq-part-1-bc94a27f8034)
* Guilherme Caminha ([@GPKCaminha](https://twitter.com/GPKCaminha)) wrote an introduction to [Python microservices with Nameko](https://www.toptal.com/python/introduction-python-microservices-nameko), which is built with RabbitMQ
* Berguiga Mohamed Amine outlined a hands-on lab for [getting started with RabbitMQ and Spring](https://medium.com/@m.a.berguiga/hand-on-labs-for-rabbitmq-e765354ea064)

## Upcoming Courses and Webinars

Ready to learn more? Check out these upcoming opportunities to learn more about RabbitMQ

* 9 April 2019 — Live/Online — [Pivotal Academy course on RabbitMQ](https://academy.pivotal.io/confirm-course?courseid=EDU-1099)
* 15 April 2019 — London — [FLEX course on RabbitMQ](https://www.flane.co.uk/course-schedule/pivotal-rmq)
* 16-17 May 2019 — Stockholm — See Karl Nilsson and Ayande Dube speak about RabbitMQ at [Code BEAM](https://codesync.global/conferences/code-beam-sto-2019/)
* 23 May 2019 — Online — Webinar: [What’s new in RabbitMQ 3.8](https://content.pivotal.io/webinars/may-23-what-s-new-in-rabbitmq-3-8-webinar?utm_source=blog&amp;utm_medium=email-link&amp;utm_campaign=rabbitmq-3.8-what's-new&amp;utm_term=q219)
* 5 November 2019 — London — [RabbitMQ Summit](https://rabbitmqsummit.com/)
