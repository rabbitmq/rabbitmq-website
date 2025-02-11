---
title: Clients Libraries and Developer Tools
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Clients Libraries and Developer Tools

## Overview {#overview}

RabbitMQ is [officially supported](/docs/platforms) on a number of
operating systems and has several official client libraries. In addition, the RabbitMQ community
has created numerous clients, adaptors and tools that we list here for
your convenience.

Please [contact us](/contact) with suggestions for things you
would like to see added to this list.

*Note:* items with a check mark (&#x2713;) are officially supported by Team RabbitMQ and VMware.

## Management Tools

### Built-in

 * [Core CLI tools](/docs/cli/): `rabbitmqctl`, `rabbitmq-diagnostics`, `rabbitmq-upgrade`, `rabbitmq-queues`, and so on

### HTTP API

 * [`rabbitmqadmin` v2](/docs/management-cli/): an HTTP API-based management tool developed by the Team RabbitMQ

## Load Testing and Workload Simulation {#workload-simulation}

 * &#x2713; [PerfTest](https://perftest.rabbitmq.com/) for [quorum](/docs/quorum-queues) and classic queues
 * &#x2713; [Stream PerfTest](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/#the-performance-tool) for [streams](/docs/streams)

## Java and Spring {#java-dev}

### Java
 * &#x2713; [RabbitMQ AMQP 1.0 Java client](https://github.com/rabbitmq/rabbitmq-amqp-java-client) and the [AMQP 1.0 client library guide](./amqp-client-libraries)
 * &#x2713; [RabbitMQ Stream Java client](https://github.com/rabbitmq/rabbitmq-stream-java-client)
 * &#x2713; [RabbitMQ JMS client](./jms-client)
 * &#x2713; [RabbitMQ AMQP 0.9.1 Java client](./java-client) and its [developer guide](./java-api-guide)
 * [Reactor RabbitMQ](https://github.com/reactor/reactor-rabbitmq), a reactive API for RabbitMQ based on
   [Reactor](https://projectreactor.io/) and [RabbitMQ Java client](./java-client)

### Spring Framework

 * &#x2713; [Spring AMQP project for Java](https://spring.io/projects/spring-amqp)
 * &#x2713; [Spring Cloud Data Flow](https://dataflow.spring.io/)
 * &#x2713; [Spring Integration](http://docs.spring.io/spring-integration/reference/amqp.html)


## .NET {#dotnet-dev}

Client libraries:

 * &#x2713; [RabbitMQ AMQP 1.0 .NET client](https://github.com/rabbitmq/rabbitmq-amqp-dotnet-client) and the [AMQP 1.0 client library guide](./amqp-client-libraries)
 * &#x2713; [RabbitMQ Stream .NET client](https://github.com/rabbitmq/rabbitmq-stream-dotnet-client)
 * &#x2713; [RabbitMQ AMQP 0.9.1 .NET client](./dotnet) (supports .NET Core and .NET 4.6.1+)

Higher level frameworks:

 * [NServiceBus](http://particular.net/nservicebus), the most popular open-source service bus for .NET.
 * [Brighter](https://www.goparamore.io/), a Command Processor & Dispatcher implementation with support for task queues
 * [Cambion](https://cambion.whitestone.no/), an MIT licensed open-source distributed application framework for .NET
 * [EasyNetQ](http://easynetq.com), an easy to use, opinionated .NET API for RabbitMQ
 * [MassTransit](https://masstransit.io/), an open-source distributed application framework for .NET.

Miscellaneous projects:

 * [RabbitMQTools](https://github.com/mariuszwojcik/RabbitMQTools), PowerShell module containing cmdlets to manage RabbitMQ


## Ruby {#ruby-dev}

 * &#x2713; [Bunny](http://rubybunny.info), a dead easy to use RabbitMQ Ruby client
 * [AMQP::Client](https://github.com/cloudamqp/amqp-client.rb), a lightweight and high performance AMQP Ruby client
 * [March Hare](http://rubymarchhare.info), a JRuby RabbitMQ client
 * [Sneakers](http://jondot.github.io/sneakers/), a fast background processing framework for Ruby and RabbitMQ
 * [Hutch](https://github.com/gocardless/hutch), a conventions-based framework for writing (Ruby) services that communicate over RabbitMQ.
 * [Ruby RabbitMQ HTTP API client](https://github.com/ruby-amqp/rabbitmq_http_api_client)
 * [Ruby RabbitMQ clients blog](http://blog.rubyrabbitmq.info)
 * [Ruby RabbitMQ clients mailing list](http://groups.google.com/group/ruby-amqp/)


## Python {#python-dev}

 * &#x2713; [RabbitMQ AMQP 1.0 Python client](https://github.com/rabbitmq/rabbitmq-amqp-python-client/) and the [AMQP 1.0 client library guide](./amqp-client-libraries),
 * &#x2713; [pika](http://pypi.python.org/pypi/pika), a pure-Python AMQP 0-9-1 client ([source code](https://github.com/pika/pika),
   [API reference](http://readthedocs.org/docs/pika/en/latest/index.html))
 * &#x2713; [rstream](https://github.com/qweeze/rstream): RabbitMQ Stream Python client
 * [rbfly](https://gitlab.com/wrobell/rbfly): RabbitMQ Stream Python client
 * [aio-pika](https://github.com/mosquito/aio-pika), a pure-Python AMQP 0-9-1 client built for Python 3 and asyncio ([source code](https://github.com/mosquito/aio-pika),
   [API reference](https://aio-pika.readthedocs.org/))
 * [aioamqp](https://pypi.org/project/aioamqp/), a pure-Python AMQP 0-9-1 library using asyncio ([source code](https://github.com/Polyconseil/aioamqp),
   [docs](https://aioamqp.readthedocs.io/en/latest/))
 * [FastStream](https://pypi.org/project/faststream/), a powerful and easy-to-use Python library for building asynchronous services that interact with event streams. ([source code](https://github.com/airtai/faststream), [docs](https://faststream.airt.ai))
 * [amqp-client-python](https://pypi.org/project/amqp-client-python/), Client with high level of abstraction for manipulation of messages in the event bus RabbitMQ. ([source code](https://github.com/nutes-uepb/amqp-client-python), [docs](https://nutes-uepb.github.io/amqp-client-python/))

Miscellaneous projects:

 * [Celery](http://docs.celeryproject.org/en/latest/), a distributed task queue for Django and pure Python


## PHP {#php-dev}

 * &#x2713; [php-amqplib](https://github.com/php-amqplib/php-amqplib) a pure PHP, fully featured RabbitMQ client
 * [RabbitMqBundle](https://github.com/php-amqplib/rabbitmqbundle) incorporates RabbitMQ messaging with the Symfony2 web framework
 * [PECL AMQP library](http://pecl.php.net/package/amqp) built on top of the [RabbitMQ C client](https://github.com/alanxz/rabbitmq-c)
 * [Thumper](https://github.com/php-amqplib/Thumper) a library of messaging patterns
 * [CAMQP](http://www.yiiframework.com/extension/amqp/) an extension for the Yii framework providing a gateway for RabbitMQ messaging
 * [AMQP Interop](https://github.com/queue-interop/queue-interop#amqp-interop) is a set of unified AMQP 0-9-1 interfaces in PHP and their implementations
 * [Bowler](https://github.com/Vinelab/bowler) is a RabbitMQ client abstraction for Laravel


## JavaScript and Node {#node-dev}

 * [amqplib](https://github.com/amqp-node/amqplib): RabbitMQ (AMQP 0-9-1) client for Node.js
 * [amqp-client](https://github.com/cloudamqp/amqp-client.js): High performance client for both NodeJS and browsers (WebSocket), written in TypeScript
 * [rabbit.js](https://github.com/squaremo/rabbit.js): message patterns in node.js using RabbitMQ.
 * [rabbitmq-stream-js-client](https://github.com/coders51/rabbitmq-stream-js-client): RabbitMQ Stream NodeJS client.
 * [amqp-stats](https://github.com/timisbusy/node-amqp-stats): a node.js interface for RabbitMQ management statistics
 * [Rascal](https://github.com/guidesmiths/rascal): a config driven wrapper for [amqp.node](https://github.com/squaremo/amqp.node) supporting multi-host connections,
   automatic error recovery, redelivery flood protection, transparent encryption and channel pooling.
 * [node-rabbitmq-client](https://github.com/cody-greene/node-rabbitmq-client): RabbitMQ (AMQP 0-9-1) client library with auto-reconnect, zero dependencies, TypeScript support, and Promise-based API.
 * [ComQ](https://github.com/toa-io/comq): Production grade RPC and pub/sub.


## Go {#go-dev}

 * &#x2713; [RabbitMQ AMQP 1.0 Go client](https://github.com/rabbitmq/rabbitmq-amqp-go-client) and the [AMQP 1.0 client library guide](./amqp-client-libraries)
 * &#x2713; [RabbitMQ Stream Go client](https://github.com/rabbitmq/rabbitmq-stream-go-client)
 * &#x2713; [RabbitMQ AMQP 0.9.1 Go client](https://github.com/rabbitmq/amqp091-go)
 * Rabbit Hole, [RabbitMQ HTTP API client for Go](https://github.com/michaelklishin/rabbit-hole)
 * [amqpc](https://github.com/gocardless/amqpc), a load testing tool for RabbitMQ clusters


## iOS and Android {#ios-android}

 * &#x2713; [RabbitMQ Objective-C and Swift client](https://github.com/rabbitmq/rabbitmq-objc-client/) from the RabbitMQ team
 * [Get Started with RabbitMQ on Android](https://www.cloudamqp.com/blog/2014-10-28-rabbitmq-on-android.html)

## Objective-C and Swift {#objc-swift-dev}

 * &#x2713; [RabbitMQ Objective-C and Swift client](https://github.com/rabbitmq/rabbitmq-objc-client/) from the RabbitMQ team


## Rust {#rust-dev}

 * [amqprs](https://github.com/gftea/amqprs), async Rust client, easy-to-use APIs, lock-free, tokio-based
 * &#x2713; [RabbitMQ Stream Rust client](https://github.com/rabbitmq/rabbitmq-stream-rust-client)
 * [Lapin](https://github.com/sozu-proxy/lapin), a mature Rust client
 * [amiquip](https://crates.io/crates/amiquip), a RabbitMQ client written in pure Rust

## Crystal {#crystal-dev}

 * [amqp-client](https://github.com/cloudamqp/amqp-client.cr), an AMQP 0-9-1 client for Crystal

## Julia {#julia-dev}

 * [AMQPClient.jl](https://github.com/JuliaComputing/AMQPClient.jl), an AMQP 0-9-1 client for Julia

## Other JVM Languages {#alt-jvm-dev}

### Scala

 * [Lepus](https://github.com/hnaderi/lepus): a purely functional, non-blocking RabbitMQ client for Scala, Scala.js and Scala Native
 * [RabbitMQ client for Scala](https://github.com/sstone/amqp-client)
 * [Akka-based RabbitMQ client for Scala](https://github.com/thenewmotion/akka-rabbitmq)
 * [Op-Rabbit](https://github.com/SpinGo/op-rabbit), an opinionated Akka-based RabbitMQ client for Scala
 * [RabbitMQ module for Play Framework](https://www.playframework.com/modules/rabbitmq-0.0.9/home)
 * [Lift RabbitMQ module](https://github.com/liftmodules/amqp)

### Groovy and Grails

 * [Grails RabbitMQ plugin](https://github.com/budjb/grails-rabbitmq-native)
 * [Grails with RabbitMQ for messaging](https://guides.grails.org/grails-rabbitmq/guide/index.html)
 * [Green Bunny, Groovy RabbitMQ client](https://github.com/michaelklishin/green_bunny) inspired by Bunny

### Clojure

 * [Langohr, a Clojure RabbitMQ client built on top of the official Java one](http://clojurerabbitmq.info)
 * [Bunnicula, Component based framework for Clojure built on top of the official Java one](https://github.com/nomnom-insights/nomnom.bunnicula)

### JRuby

 * [March Hare, a JRuby RabbitMQ client](http://rubymarchhare.info)


## C and C++ {#c-dev}

 * [RabbitMQ C client](https://github.com/alanxz/rabbitmq-c)
 * [SimpleAmqpClient](https://github.com/alanxz/SimpleAmqpClient), a C++ wrapper around rabbitmq-c
 * [amqpcpp](https://github.com/akalend/amqpcpp), a C++ message library for RabbitMQ
 * [AMQP-CPP](https://github.com/CopernicaMarketingSoftware/AMQP-CPP), a C++ RabbitMQ client
 * [Hareflow](https://github.com/coveooss/hareflow), a RabbitMQ stream client for C++
 * [RabbitMQ C stream client](https://github.com/GianfrancoGGL/rabbitmq-stream-c-client)
 * [rmqcpp](https://github.com/bloomberg/rmqcpp), reliable message delivery ON by default, easy to use, testable, async-capable C++ API


## Monitoring {#monitoring-tools}

 * See [Monitoring](/docs/monitoring) and [Prometheus](/docs/prometheus) guides.


## Visualisation {#viz}

 * [Rabbit Viz](https://plexsystems.github.io/rabbit-viz/), a tool for visualizing [exported definition files](/docs/backup#rabbitmq-definitions).


## Unity 3D {#unity-dev}

 * [Unity 3D RabbitMQ Client](https://github.com/CymaticLabs/Unity3D.Amqp)


## Erlang {#erlang-dev}

 * &#x2713; [RabbitMQ Erlang client](./erlang-client-user-guide)
 * [RabbitMQ Stream Erlang client](https://gitlab.com/evnu/lake)
 * [bunny_farm](https://github.com/muxspace/bunny_farm), a simplifying wrapper for the Erlang client
 * [RabbitMQ Messaging Patterns](https://github.com/videlalvaro/rmq_patterns), a library of messaging patterns implemented in Erlang


## Haskell {#haskell-dev}

 * A [RabbitMQ client for Haskell](https://github.com/hreinhardt/amqp)


## OCaml {#ocaml-dev}

 * A [RabbitMQ client for OCaml](https://github.com/andersfugmann/amqp-client)


## Provisioning (Chef, Puppet, Docker, etc) {#operations}

* [Chef RabbitMQ Cookbook](https://github.com/rabbitmq/chef-cookbook)
* [Puppet RabbitMQ Module](https://github.com/puppetlabs/puppetlabs-rabbitmq)
* [RabbitMQ Docker image](https://hub.docker.com/_/rabbitmq/)
* [Kurtosis Starlark package](https://github.com/kurtosis-tech/rabbitmq-package)

## Database Integration {#database-integration}

* [Oracle Stored Procedures for RabbitMQ](https://github.com/pmq/rabbitmq-oracle-stored-procedures) integration.
* [RabbitMQ component for SQL Server Integration Services (SSIS)](https://github.com/kzhen/SSISRabbitMQ).
* [RabbitMQ integration with PostgreSQL](https://github.com/aweber/pgsql-listen-exchange)'s LISTEN notifications.
* [RabbitMQ Riak Exchange](https://github.com/jbrisbin/riak-exchange): a custom exchange type for RabbitMQ that uses Riak as a backing store.
* [Riak RabbitMQ postcommit Hook](https://github.com/jbrisbin/riak-rabbitmq-commit-hooks): a postcommit hook for Riak that sends any modified entries to RabbitMQ.

## CLI Tools {#rabbitmq-cli}

 * &#x2713; [RabbitMQ CLI tools](/docs/cli)
 * &#x2713; [rabbitmqadmin](/docs/management-cli), a command line tool that targets RabbitMQ HTTP API
 * [amqp-utils](https://github.com/dougbarth/amqp-utils), command line utils for interacting with an AMQP based queue (in Ruby)
 * [amqptools](https://github.com/rmt/amqptools), command line AMQP clients (in C)
 * [rabtap](https://github.com/jandelgado/rabtap), RabbitMQ wire tap and swiss army knife command line tool (in go)


## 3rd party plugins {#community-plugins}

 * [RabbitMQ Global Fanout Exchange](https://github.com/videlalvaro/rabbitmq-global-fanout-exchange): a custom exchange type that fans out messages
   to every queue in the broker no matter what the   bindings or vhosts.
 * [RabbitMQ Recent History Exchange](https://github.com/videlalvaro/rabbitmq-recent-history-exchange): a custom exchange type that keeps track of the last 20 messages
   that have passed through such that newly bound queues receive a recent message history.
 * [SMTP gateway for RabbitMQ](https://github.com/gotthardp/rabbitmq-email)


## Perl {#perl-dev}

 * [RabbitFoot](https://github.com/cooldaemon/RabbitFoot), an asynchronous and multi-channel RabbitMQ client using Coro and AnyEvent::RabbitMQ
 * [AnyEvent::RabbitMQ](https://github.com/cooldaemon/AnyEvent-RabbitMQ), an asynchronous and multi-channel RabbitMQ client


## OCaml {#ocaml-dev}

 * [NetAMQP](http://projects.camlcity.org/projects/netamqp.html), a native AMQP 0-9-1 client for Ocaml tested against RabbitMQ


## Common Lisp {#lisp-dev}

 * [cl-rabbit](https://github.com/lokedhs/cl-rabbit) a Common Lisp client library for RabbitMQ


## COBOL {#cobol-dev}

 * [Using rabbitmq-c From COBOL](http://assortedrambles.blogspot.ru/2013/04/using-rabbitmq-from-cobol_9584.html)


## Traffic Capture and Protocol Analysis {#protocol-analysis}

 * [Wireshark](/amqp-wireshark) is the world's foremost
   network protocol analyzer


## Miscellaneous {#miscellaneous}

 * [XMPP adaptor](https://github.com/ericliang/rabbitmq-xmpp)
 * [Delphi/Free Pascal RabbitMQ Client](http://www.habarisoft.com/habari_rabbitmq.html)
 * [bevis](https://github.com/bkjones/bevis): a syslog listener that forwards messages over RabbitMQ
 * [rabbitmq-memcached](http://code.google.com/p/rabbitmq-memcached/): a memcached adapter for RabbitMQ that allows you to use the memcache protocol to
   get or publish a message from or to RabbitMQ
 * [flume-amqp-plugin](https://github.com/stampy88/flume-amqp-plugin):
   a plugin for [Flume](https://github.com/cloudera/flume/wiki) (a Hadoop data loader) that allows you to use a RabbitMQ node as a data source.
 * [Fudge Messaging Format](http://kirkwylie.blogspot.com/2009/11/announcing-release-of-fudge-messaging.html):
   fudge is a data encoding system that is hierarchical, typesafe, binary and self-describing. It is messaging protocol-agnostic.
 * [AMQProxy](https://github.com/cloudamqp/amqproxy): An AMQP 0-9-1 proxy, with connection and channel pooling/reusing
 * [amqpcat](https://github.com/cloudamqp/amqpcat): A netcat-like CLI tool for producing and consuming AMQP 0-9-1 messages.
