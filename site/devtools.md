<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ is [officially supported](platforms.html) on a number of
operating systems and has several official client libraries. In addition, the RabbitMQ community
has created numerous clients, adaptors and tools that we list here for
your convenience.

Please [contact us](contact.html) with suggestions for things you
would like to see added to this list.

*Note:* items with a check mark (&#x2713;) are officially supported by Team RabbitMQ and VMware.

## <a id="workload-simulation" class="anchor" href="#workload-simulation">Load Testing and Workload Simulation</a>

 * &#x2713; [PerfTest](https://perftest.rabbitmq.com/) for [quorum](./quorum-queues.html) and classic queues
 * &#x2713; [Stream PerfTest](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/#the-performance-tool) for [streams](./streams.html)

## <a id="java-dev" class="anchor" href="#java-dev">Java and Spring</a>

### Java
 * &#x2713; [RabbitMQ Java client](java-client.html) and its [developer guide](api-guide.html)
 * &#x2713; [RabbitMQ Stream Java client](https://github.com/rabbitmq/rabbitmq-stream-java-client)
 * &#x2713; [RabbitMQ JMS client](jms-client.html)
 * [Reactor RabbitMQ](https://github.com/reactor/reactor-rabbitmq), a reactive API for RabbitMQ based on
   [Reactor](https://projectreactor.io/) and [RabbitMQ Java Client](java-client.html)

### Spring Framework

 * &#x2713; [Spring AMQP project for Java](https://spring.io/projects/spring-amqp)
 * &#x2713; [Spring Cloud Data Flow](https://dataflow.spring.io/)
 * &#x2713; [Spring Integration](http://docs.spring.io/spring-integration/reference/html/amqp.html)


## <a id="dotnet-dev" class="anchor" href="#dotnet-dev">.NET</a>

Client libraries:

 * &#x2713; [RabbitMQ .NET Client](dotnet.html) (supports .NET Core and .NET 4.6.1+)
 * &#x2713; [RabbitMQ Stream .NET client](https://github.com/rabbitmq/rabbitmq-stream-dotnet-client)

Higher level frameworks:

 * [NServiceBus](http://particular.net/nservicebus), the most popular open-source service bus for .NET.
 * [Brighter](https://www.goparamore.io/), a Command Processor & Dispatcher implementation with support for task queues
 * [Cambion](https://cambion.whitestone.no/), an MIT licensed open-source distributed application framework for .NET
 * [EasyNetQ](http://easynetq.com), an easy to use, opinionated .NET API for RabbitMQ
 * [MassTransit](https://masstransit.io/), an open-source distributed application framework for .NET.

Miscellaneous projects:

 * [RabbitMQTools](https://github.com/mariuszwojcik/RabbitMQTools), PowerShell module containing cmdlets to manage RabbitMQ


## <a id="ruby-dev" class="anchor" href="#ruby-dev">Ruby</a>

 * &#x2713; [Bunny](http://rubybunny.info), a dead easy to use RabbitMQ Ruby client
 * [AMQP::Client](https://github.com/cloudamqp/amqp-client.rb), a lightweight and high performance AMQP Ruby client
 * [March Hare](http://rubymarchhare.info), a JRuby RabbitMQ client
 * [Sneakers](http://jondot.github.io/sneakers/), a fast background processing framework for Ruby and RabbitMQ
 * [Hutch](https://github.com/gocardless/hutch), a conventions-based framework for writing (Ruby) services that communicate over RabbitMQ.
 * [Ruby RabbitMQ HTTP API client](https://github.com/ruby-amqp/rabbitmq_http_api_client)
 * [Ruby RabbitMQ clients blog](http://blog.rubyrabbitmq.info)
 * [Ruby RabbitMQ clients mailing list](http://groups.google.com/group/ruby-amqp/)


## <a id="python-dev" class="anchor" href="#python-dev">Python</a>

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


## <a id="php-dev" class="anchor" href="#php-dev">PHP</a>

 * &#x2713; [php-amqplib](https://github.com/php-amqplib/php-amqplib) a pure PHP, fully featured RabbitMQ client
 * [RabbitMqBundle](https://github.com/php-amqplib/rabbitmqbundle) incorporates RabbitMQ messaging with the Symfony2 web framework
 * [PECL AMQP library](http://pecl.php.net/package/amqp) built on top of the [RabbitMQ C client](https://github.com/alanxz/rabbitmq-c)
 * [Thumper](https://github.com/php-amqplib/Thumper) a library of messaging patterns
 * [CAMQP](http://www.yiiframework.com/extension/amqp/) an extension for the Yii framework providing a gateway for RabbitMQ messaging
 * [AMQP Interop](https://github.com/queue-interop/queue-interop#amqp-interop) is a set of unified AMQP 0-9-1 interfaces in PHP and their implementations
 * [Bowler](https://github.com/Vinelab/bowler) is a RabbitMQ client abstraction for Laravel


## <a id="node-dev" class="anchor" href="#node-dev">JavaScript and Node</a>

 * [amqplib](https://github.com/amqp-node/amqplib): RabbitMQ (AMQP 0-9-1) client for Node.js
 * [amqp-client](https://github.com/cloudamqp/amqp-client.js): High performance client for both NodeJS and browsers (WebSocket), written in TypeScript
 * [rabbit.js](https://github.com/squaremo/rabbit.js): message patterns in node.js using RabbitMQ.
 * [rabbitmq-stream-js-client](https://github.com/coders51/rabbitmq-stream-js-client): RabbitMQ Stream NodeJS client.
 * [amqp-stats](https://github.com/timisbusy/node-amqp-stats): a node.js interface for RabbitMQ management statistics
 * [Rascal](https://github.com/guidesmiths/rascal): a config driven wrapper for [amqp.node](https://github.com/squaremo/amqp.node) supporting multi-host connections,
   automatic error recovery, redelivery flood protection, transparent encryption and channel pooling.
 * [node-rabbitmq-client](https://github.com/cody-greene/node-rabbitmq-client): RabbitMQ (AMQP 0-9-1) client library with auto-reconnect, zero dependencies, TypeScript support, and Promise-based API.
 * [ComQ](https://github.com/toa-io/comq): Production grade RPC and pub/sub.


## <a id="go-dev" class="anchor" href="#go-dev">Go</a>

 * &#x2713; [RabbitMQ Go client](https://github.com/rabbitmq/amqp091-go)
 * &#x2713; [RabbitMQ Stream Go client](https://github.com/rabbitmq/rabbitmq-stream-go-client)
 * Rabbit Hole, [RabbitMQ HTTP API client for Go](https://github.com/michaelklishin/rabbit-hole)
 * [amqpc](https://github.com/gocardless/amqpc), a load testing tool for RabbitMQ clusters


## <a id="ios-android" class="anchor" href="#ios-android">iOS and Android</a>

 * &#x2713; [RabbitMQ Objective-C and Swift client](https://github.com/rabbitmq/rabbitmq-objc-client/) from the RabbitMQ team
 * [Get Started with RabbitMQ on Android](https://www.cloudamqp.com/blog/2014-10-28-rabbitmq-on-android.html)

## <a id="objc-swift-dev" class="anchor" href="#objc-swift-dev">Objective-C and Swift</a>

 * &#x2713; [RabbitMQ Objective-C and Swift client](https://github.com/rabbitmq/rabbitmq-objc-client/) from the RabbitMQ team


## <a id="rust-dev" class="anchor" href="#rust-dev">Rust</a>

 * [amqprs](https://github.com/gftea/amqprs), async Rust client, easy-to-use APIs, lock-free, tokio-based
 * &#x2713; [RabbitMQ Stream Rust client](https://github.com/rabbitmq/rabbitmq-stream-rust-client)
 * [Lapin](https://github.com/sozu-proxy/lapin), a mature Rust client
 * [amiquip](https://crates.io/crates/amiquip), a RabbitMQ client written in pure Rust

## <a id="crystal-dev" class="anchor" href="#crystal-dev">Crystal</a>

 * [amqp-client](https://github.com/cloudamqp/amqp-client.cr), an AMQP 0-9-1 client for Crystal

## <a id="julia-dev" class="anchor" href="#julia-dev">Julia</a>

 * [AMQPClient.jl](https://github.com/JuliaComputing/AMQPClient.jl), an AMQP 0-9-1 client for Julia

## <a id="alt-jvm-dev" class="anchor" href="#alt-jvm-dev">Other JVM Languages</a>

### Scala

 * [Lepus](https://github.com/hnaderi/lepus): a purely functional, non-blocking RabbitMQ client for Scala, Scala.js and Scala Native
 * [RabbitMQ client for Scala](https://github.com/sstone/amqp-client)
 * [Akka-based RabbitMQ client for Scala](https://github.com/thenewmotion/akka-rabbitmq)
 * [Op-Rabbit](https://github.com/SpinGo/op-rabbit), an opinionated Akka-based RabbitMQ client for Scala
 * [Processing RabbitMQ messages using Akka Streams](http://typesafe.com/activator/template/rabbitmq-akka-stream)
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


## <a id="c-dev" class="anchor" href="#c-dev">C and C++</a>

 * [RabbitMQ C client](https://github.com/alanxz/rabbitmq-c)
 * [SimpleAmqpClient](https://github.com/alanxz/SimpleAmqpClient), a C++ wrapper around rabbitmq-c
 * [amqpcpp](https://github.com/akalend/amqpcpp), a C++ message library for RabbitMQ
 * [AMQP-CPP](https://github.com/CopernicaMarketingSoftware/AMQP-CPP), a C++ RabbitMQ client
 * [RabbitMQ C stream client](https://github.com/GianfrancoGGL/rabbitmq-stream-c-client)
 * [rmqcpp](https://github.com/bloomberg/rmqcpp), reliable message delivery ON by default, easy to use, testable, async-capable C++ API


## <a id="monitoring-tools" class="anchor" href="#monitoring-tools">Monitoring</a>

 * See [Monitoring](./monitoring.html) and [Prometheus](./prometheus.html) guides.


## <a id="viz" class="anchor" href="#viz">Visualisation</a>

 * [Rabbit Viz](https://plexsystems.github.io/rabbit-viz/), a tool for visualizing [exported definition files](./backup.html#rabbitmq-definitions).


## <a id="unity-dev" class="anchor" href="#unity-dev">Unity 3D</a>

 * [Unity 3D RabbitMQ Client](https://github.com/CymaticLabs/Unity3D.Amqp)


## <a id="erlang-dev" class="anchor" href="#erlang-dev">Erlang</a>

 * &#x2713; [RabbitMQ Erlang client](erlang-client-user-guide.html)
 * [RabbitMQ Stream Erlang client](https://gitlab.com/evnu/lake)
 * [bunny_farm](https://github.com/muxspace/bunny_farm), a simplifying wrapper for the Erlang client
 * [RabbitMQ Messaging Patterns](https://github.com/videlalvaro/rmq_patterns), a library of messaging patterns implemented in Erlang


## <a id="haskell-dev" class="anchor" href="#haskell-dev">Haskell</a>

 * A [RabbitMQ client for Haskell](https://github.com/hreinhardt/amqp)


## <a id="ocaml-dev" class="anchor" href="#ocaml-dev">OCaml</a>

 * A [RabbitMQ client for OCaml](https://github.com/andersfugmann/amqp-client)


## <a id="operations" class="anchor" href="#operations">Provisioning (Chef, Puppet, Docker, etc)</a>

* [Chef RabbitMQ Cookbook](https://github.com/rabbitmq/chef-cookbook)
* [Puppet RabbitMQ Module](https://github.com/puppetlabs/puppetlabs-rabbitmq)
* [RabbitMQ Docker image](https://hub.docker.com/_/rabbitmq/)
* [Kurtosis Starlark package](https://github.com/kurtosis-tech/rabbitmq-package)

## <a id="database-integration" class="anchor" href="#database-integration">Database Integration</a>

* [Oracle Stored Procedures for RabbitMQ](https://github.com/pmq/rabbitmq-oracle-stored-procedures) integration.
* [RabbitMQ component for SQL Server Integration Services (SSIS)](https://github.com/kzhen/SSISRabbitMQ).
* [RabbitMQ integration with PostgreSQL](https://github.com/aweber/pgsql-listen-exchange)'s LISTEN notifications.
* [RabbitMQ Riak Exchange](https://github.com/jbrisbin/riak-exchange): a custom exchange type for RabbitMQ that uses Riak as a backing store.
* [Riak RabbitMQ postcommit Hook](https://github.com/jbrisbin/riak-rabbitmq-commit-hooks): a postcommit hook for Riak that sends any modified entries to RabbitMQ.

## <a id="rabbitmq-cli" class="anchor" href="#rabbitmq-cli">CLI Tools</a>

 * &#x2713; [RabbitMQ CLI tools](./cli.html)
 * &#x2713; [rabbitmqadmin](./management-cli.html), a command line tool that targets RabbitMQ HTTP API
 * [amqp-utils](https://github.com/dougbarth/amqp-utils), command line utils for interacting with an AMQP based queue (in Ruby)
 * [amqptools](https://github.com/rmt/amqptools), command line AMQP clients (in C)
 * [rabtap](https://github.com/jandelgado/rabtap), RabbitMQ wire tap and swiss army knife command line tool (in go)


## <a id="community-plugins" class="anchor" href="#community-plugins">3rd party plugins</a>

 * [RabbitMQ Global Fanout Exchange](https://github.com/videlalvaro/rabbitmq-global-fanout-exchange): a custom exchange type that fans out messages
   to every queue in the broker no matter what the   bindings or vhosts.
 * [RabbitMQ Recent History Exchange](https://github.com/videlalvaro/rabbitmq-recent-history-exchange): a custom exchange type that keeps track of the last 20 messages
   that have passed through such that newly bound queues receive a recent message history.
 * [SMTP gateway for RabbitMQ](https://github.com/gotthardp/rabbitmq-email)


## <a id="perl-dev" class="anchor" href="#perl-dev">Perl</a>

 * [RabbitFoot](https://github.com/cooldaemon/RabbitFoot), an asynchronous and multi-channel RabbitMQ client using Coro and AnyEvent::RabbitMQ
 * [AnyEvent::RabbitMQ](https://github.com/cooldaemon/AnyEvent-RabbitMQ), an asynchronous and multi-channel RabbitMQ client


## <a id="ocaml-dev" class="anchor" href="#ocaml-dev">OCaml</a>

 * [NetAMQP](http://projects.camlcity.org/projects/netamqp.html), a native AMQP 0-9-1 client for Ocaml tested against RabbitMQ


## <a id="lisp-dev" class="anchor" href="#lisp-dev">Common Lisp</a>

 * [cl-rabbit](https://github.com/lokedhs/cl-rabbit) a Common Lisp client library for RabbitMQ


## <a id="cobol-dev" class="anchor" href="#cobol-dev">COBOL</a>

 * [Using rabbitmq-c From COBOL](http://assortedrambles.blogspot.ru/2013/04/using-rabbitmq-from-cobol_9584.html)


## <a id="protocol-analysis" class="anchor" href="#protocol-analysis">Traffic Capture and Protocol Analysis</a>

 * [Wireshark](amqp-wireshark.html) is the world's foremost
   network protocol analyzer


## <a id="miscellaneous" class="anchor" href="#miscellaneous">Miscellaneous</a>

 * [XMPP adaptor](https://github.com/ericliang/rabbitmq-xmpp)
 * [RabbitMQ Adapter for Streambase](http://streambase.com/sbx.htm#Simple%20AMQP%20using%20RabbitMQ) for complex event processing (CEP)
 * [Delphi/Free Pascal RabbitMQ Client](http://www.habarisoft.com/habari_rabbitmq.html)
 * [bevis](https://github.com/bkjones/bevis): a syslog listener that forwards messages over RabbitMQ
 * [rabbitmq-memcached](http://code.google.com/p/rabbitmq-memcached/): a memcached adapter for RabbitMQ that allows you to use the memcache protocol to
   get or publish a message from or to RabbitMQ
 * [flume-amqp-plugin](https://github.com/stampy88/flume-amqp-plugin):
   a plugin for [Flume](https://github.com/cloudera/flume/wiki) (a Hadoop data loader) that allows you to use a RabbitMQ node as a data source.
 * [Fudge Messaging Format](http://kirkwylie.blogspot.com/2009/11/announcing-release-of-fudge-messaging.html):
   fudge is a data encoding system that is hierarchical, typesafe, binary and self-describing. It is messaging protocol-agnostic.
 * [QDB: Persistent Message Queues with Replay](http://qdb.io/): queue backup and replay over AMQP 0-9-1. Includes REST API
 * [AMQProxy](https://github.com/cloudamqp/amqproxy): An AMQP 0-9-1 proxy, with connection and channel pooling/reusing
 * [amqpcat](https://github.com/cloudamqp/amqpcat): A netcat-like CLI tool for producing and consuming AMQP 0-9-1 messages.
