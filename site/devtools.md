<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

RabbitMQ is <a href="platforms.html">officially supported</a> on a number of
operating systems and has several official client libraries. In addition, the RabbitMQ community
has created numerous clients, adaptors and tools that we list here for
your convenience.

Please <a href="contact.html">contact us</a> with suggestions for things you
would like to see added to this list.

## <a id="java-dev" class="anchor" href="#java-dev">Java and Spring</a>

### Java

 * <a href="java-client.html">RabbitMQ Java client</a> and its <a href="api-guide.html">developer guide</a>
 * <a href="jms-client.html">RabbitMQ JMS client</a>
 * <a href="https://github.com/lshift/camel-rabbitmq">camel-rabbitmq</a>, an Apache Camel component for interacting with RabbitMQ. This ships as part of Camel 2.12 or later.
 * <a href="https://github.com/yanghua/banyan">Banyan</a>, a RabbitMQ-backed message bus with a tree topology.

### Spring Framework

 * <a href="http://www.springsource.org/spring-amqp">Spring AMQP project for Java</a>
 * <a href="http://cloud.spring.io/spring-cloud-dataflow/">Spring Cloud Data Flow</a>
 * <a href="http://docs.spring.io/spring-integration/reference/html/amqp.html">Spring Integration</a>


## <a id="dotnet-dev" class="anchor" href="#dotnet-dev">.NET</a>

 * <a href="dotnet.html">RabbitMQ .NET Client</a> (supports .NET Core and .NET 4.5.1+)
 * <a href="http://easynetq.com">EasyNetQ</a>, an easy to use, opinionated .NET API for RabbitMQ
 * <a href="http://particular.net/nservicebus">NServiceBus</a>, the most popular open-source service bus for .NET.
 * <a href="https://github.com/pardahlman/RawRabbit">RawRabbit</a>, a higher-level client that targets ASP.NET vNext and supports .NET Core.
 * <a href="http://restbus.org">Restbus</a>, a service-oriented framework for .NET
 * <a href="https://github.com/mariuszwojcik/RabbitMQTools">RabbitMQTools</a>, PowerShell module containing cmdlets to manage RabbitMQ


## <a id="ruby-dev" class="anchor" href="#ruby-dev">Ruby</a>

 * <a href="http://rubybunny.info">Bunny</a>, a dead easy to use RabbitMQ Ruby client
 * <a href="http://rubymarchhare.info">March Hare</a>, a JRuby RabbitMQ client
 * <a href="http://jondot.github.io/sneakers/">Sneakers</a>, a fast background processing framework for Ruby and RabbitMQ
 * <a href="https://github.com/gocardless/hutch">Hutch</a>, a convensions-based framework for writing (Ruby) services that communicate over RabbitMQ.
 * <a href="https://github.com/ruby-amqp/rabbitmq_http_api_client">Ruby RabbitMQ HTTP API client</a>
 * <a href="http://blog.rubyrabbitmq.info">Ruby RabbitMQ clients blog</a>
 * <a href="http://groups.google.com/group/ruby-amqp/">Ruby RabbitMQ clients mailing list</a>


## <a id="python-dev" class="anchor" href="#python-dev">Python</a>

 * <a href="http://pypi.python.org/pypi/pika">pika</a>, a pure-Python AMQP 0-9-1 client (<a href="https://github.com/pika/pika">source code</a>,
   <a href="http://readthedocs.org/docs/pika/en/latest/index.html">API reference</a>)
 * <a href="https://github.com/mosquito/aio-pika">aio-pika</a>, a pure-Python AMQP 0-9-1 client built for Python 3 and asyncio (<a href="https://github.com/mosquito/aio-pika">source code</a>,
   <a href="https://aio-pika.readthedocs.org/">API reference</a>)
 * <a href="http://docs.celeryproject.org/en/latest/">Celery</a>, a distributed task queue for Django and pure Python
 * <a href="https://pypi.org/project/aioamqp/">aioamqp</a>, a pure-Python AMQP 0-9-1 library using asyncio (<a href="https://github.com/Polyconseil/aioamqp">source code</a>,
   <a href="https://aioamqp.readthedocs.io/en/latest/">docs</a>)


## <a id="php-dev" class="anchor" href="#php-dev">PHP</a>

 * <a href="https://github.com/php-amqplib/php-amqplib">php-amqplib</a> a pure PHP, fully featured RabbitMQ client
 * <a href="https://github.com/php-amqplib/rabbitmqbundle">RabbitMqBundle</a> incorporates RabbitMQ messaging with the Symfony2 web framework
 * <a href="http://pecl.php.net/package/amqp">PECL AMQP library</a> built on top of the <a href="https://github.com/alanxz/rabbitmq-c">RabbitMQ C client</a>
 * <a href="https://github.com/myYearbook/VorpalBunny">VorpalBunny</a> a PHP client library using <a href="plugins.html#rabbitmq_jsonrpc_channel">rabbitmq_jsonrpc_channel</a>
 * <a href="https://github.com/php-amqplib/Thumper">Thumper</a> a library of messaging patterns
 * <a href="http://www.yiiframework.com/extension/amqp/">CAMQP</a> an extension for the Yii framework providing a gateway for RabbitMQ messaging
 * <a href="https://github.com/queue-interop/queue-interop#amqp-interop">AMQP Interop</a> is a set of unified AMQP 0-9-1 interfaces in PHP and their implementations


## <a id="node-dev" class="anchor" href="#node-dev">JavaScript and Node</a>

 * <a href="https://github.com/squaremo/amqp.node">amqp.node</a>: RabbitMQ (AMQP 0-9-1) client for Node.js
 * <a href="https://github.com/squaremo/rabbit.js">rabbit.js</a>: message patterns in node.js using RabbitMQ.
 * <a href="https://github.com/timisbusy/node-amqp-stats">amqp-stats</a>: a node.js interface for RabbitMQ management statistics
 * <a href="https://github.com/guidesmiths/rascal">Rascal</a>: a config driven wrapper for <a href="https://github.com/squaremo/amqp.node">amqp.node</a> supporting multi-host connections,
   automatic error recovery, redelivery flood protection, transparent encryption and channel pooling.


## <a id="objc-swift-dev" class="anchor" href="#objc-swift-dev">Objective-C and Swift</a>

 * <a href="https://github.com/rabbitmq/rabbitmq-objc-client/">RabbitMQ Objective-C and Swift client</a> from the RabbitMQ team


## <a id="rust-dev" class="anchor" href="#rust-dev">Rust</a>

 * <a href="https://github.com/sozu-proxy/lapin">Lapin</a>, a Rust client
 * <a href="https://crates.io/crates/amiquip">amiquip</a>, a RabbitMQ client written in pure Rust


## <a id="alt-jvm-dev" class="anchor" href="#alt-jvm-dev">Other JVM Languages</a>

### Scala

 * <a href="https://github.com/sstone/amqp-client">RabbitMQ client for Scala</a>
 * <a href="https://github.com/thenewmotion/akka-rabbitmq">Akka-based RabbitMQ client for Scala</a>
 * <a href="https://github.com/SpinGo/op-rabbit">Op-Rabbit</a>, an optinionated Akka-based RabbitMQ client for Scala
 * <a href="http://typesafe.com/activator/template/rabbitmq-akka-stream">Processing RabbitMQ messages using Akka Streams</a>
 * <a href="https://www.playframework.com/modules/rabbitmq-0.0.9/home">RabbitMQ module for Play Framework</a>
 * <a href="https://github.com/liftmodules/amqp">Lift RabbitMQ module</a>

### Groovy and Grails

 * <a href="http://grails.org/plugin/rabbitmq-native">Grails RabbitMQ plugin</a>
 * <a href="resources/grails-amqp.pdf">Grails with RabbitMQ for messaging</a> (PDF)
<a href="https://github.com/michaelklishin/green_bunny">Green Bunny, Groovy RabbitMQ client</a> inspired by Bunny

### Clojure

 * <a href="http://clojurerabbitmq.info">Langohr, a Clojure RabbitMQ client built on top of the official Java one</a>
* <a href="https://github.com/nomnom-insights/nomnom.bunnicula">Bunnicula, Component based framework for Clojure built on top of the official Java one</a>

### JRuby

 * <a href="http://rubymarchhare.info">March Hare, a JRuby RabbitMQ client</a>


## <a id="c-dev" class="anchor" href="#c-dev">C and C++</a>

 * <a href="https://github.com/alanxz/rabbitmq-c">RabbitMQ C client</a>
 * <a href="https://github.com/alanxz/SimpleAmqpClient">SimpleAmqpClient</a>, a C++ wrapper around rabbitmq-c
 * <a href="https://github.com/akalend/amqpcpp">amqpcpp</a>, a C++ message library for RabbitMQ
 * <a href="https://github.com/CopernicaMarketingSoftware/AMQP-CPP">AMQP-CPP</a>, a C++ RabbitMQ client


## <a id="go-dev" class="anchor" href="#go-dev">Go</a>

 * <a href="https://github.com/streadway/amqp">Go RabbitMQ client</a>
 * Rabbit Hole, <a href="https://github.com/michaelklishin/rabbit-hole">RabbitMQ HTTP API client for Go</a>
 * <a href="https://github.com/gocardless/amqpc">amqpc</a>, a load testing tool for RabbitMQ clusters


## <a id="ios-android" class="anchor" href="#ios-android">iOS and Android</a>

 * <a href="https://github.com/rabbitmq/rabbitmq-objc-client/">RabbitMQ Objective-C and Swift client</a> from the RabbitMQ team
 * <a href="https://www.cloudamqp.com/blog/2014-10-28-rabbitmq-on-android.html">Get Started with RabbitMQ on Android</a>


## <a id="monitoring-tools" class="anchor" href="#monitoring-tools">Monitoring</a>

 * See <a href="/monitoring.html">Monitoring</a> and <a href="/prometheus.html">Prometheus</a> guides.


## <a id="viz" class="anchor" href="#viz">Visualisation</a>

 * <a href="https://plexsystems.github.io/rabbit-viz/">Rabbit Viz</a>, a tool for visualizing <a href="/backup.html#rabbitmq-definitions">exported definition files</a>.


## <a id="unity-dev" class="anchor" href="#unity-dev">Unity 3D</a>

 * <a href="https://github.com/CymaticLabs/Unity3D.Amqp">Unity 3D RabbitMQ Client</a>


## <a id="erlang-dev" class="anchor" href="#erlang-dev">Erlang</a>

 * <a href="erlang-client-user-guide.html">RabbitMQ Erlang client guide</a>
 * <a href="https://github.com/muxspace/bunny_farm">bunny_farm</a>, a simplifying wrapper for the Erlang client
 * <a href="https://github.com/videlalvaro/rmq_patterns">RabbitMQ Messaging Patterns</a>, a library of messaging patterns implemented in Erlang


## <a id="haskell-dev" class="anchor" href="#haskell-dev">Haskell</a>

 * A <a href="https://github.com/hreinhardt/amqp">RabbitMQ client for Haskell</a>


## <a id="ocaml-dev" class="anchor" href="#ocaml-dev">OCaml</a>

 * A <a href="https://github.com/andersfugmann/amqp-client">RabbitMQ client for OCaml</a>

## <a id="operations" class="anchor" href="#operations">Provisioning (Chef, Puppet, Docker, etc)</a>

<a href="https://github.com/rabbitmq/chef-cookbook">Chef RabbitMQ Cookbook</a>
<a href="https://github.com/puppetlabs/puppetlabs-rabbitmq">Puppet RabbitMQ Module</a>
<a href="https://registry.hub.docker.com/_/rabbitmq/">RabbitMQ Docker image</a>


## <a id="database-integration" class="anchor" href="#database-integration">Database Integration</a>

<a href="https://github.com/pmq/rabbitmq-oracle-stored-procedures">Oracle Stored Procedures for RabbitMQ</a> integration.
<a href="https://github.com/kzhen/SSISRabbitMQ">RabbitMQ component for SQL Server Integration Services (SSIS)</a>.
<a href="https://github.com/aweber/pgsql-listen-exchange">RabbitMQ integration with PostgreSQL</a>'s LISTEN notifications.
<a href="https://github.com/jbrisbin/riak-exchange">RabbitMQ Riak Exchange</a>: a custom exchange type for RabbitMQ that uses Riak as a backing store.
<a href="https://github.com/jbrisbin/riak-rabbitmq-commit-hooks">Riak RabbitMQ postcommit Hook</a>: a postcommit hook for Riak that sends any modified entries to RabbitMQ.


## <a id="rabbitmq-cli" class="anchor" href="#rabbitmq-cli">CLI Tools</a>

 * <a href="/cli.html">RabbitMQ CLI tools</a>
 * <a href="/management-cli.html">rabbitmqadmin</a>, a command line tool that targets RabbitMQ HTTP API
 * <a href="https://github.com/dougbarth/amqp-utils">amqp-utils</a>, command line utils for interacting with an AMQP based queue (in Ruby)
 * <a href="https://github.com/rmt/amqptools">amqptools</a>, command line AMQP clients (in C)
 * <a href="https://github.com/jandelgado/rabtap">rabtap</a>, RabbitMQ wire tap and swiss army knife command line tool (in go)


## <a id="community-plugins" class="anchor" href="#community-plugins">3rd party plugins</a>

 * <a href="https://github.com/videlalvaro/rabbitmq-global-fanout-exchange">RabbitMQ Global Fanout Exchange</a>: a custom exchange type that fans out messages
   to every queue in the broker no matter what the   bindings or vhosts.
 * <a href="https://github.com/videlalvaro/rabbitmq-recent-history-exchange">RabbitMQ Recent History Exchange</a>: a custom exchange type that keeps track of the last 20 messages
   that have passed through such that newly bound queues receive a recent message history.
 * <a href="https://github.com/gotthardp/rabbitmq-email">SMTP gateway for RabbitMQ</a>


## <a id="perl-dev" class="anchor" href="#perl-dev">Perl</a>

 * <a href="https://github.com/cooldaemon/RabbitFoot">RabbitFoot</a>, an asynchronous and multi-channel RabbitMQ client using Coro and AnyEvent::RabbitMQ
 * <a href="https://github.com/cooldaemon/AnyEvent-RabbitMQ">AnyEvent::RabbitMQ</a>, an asynchronous and multi-channel RabbitMQ client


## <a id="ocaml-dev" class="anchor" href="#ocaml-dev">OCaml</a>

 * <a href="http://projects.camlcity.org/projects/netamqp.html">NetAMQP</a>, a native AMQP 0-9-1 client for Ocaml tested against RabbitMQ


## <a id="lisp-dev" class="anchor" href="#lisp-dev">Common Lisp</a>

 * <a href="https://github.com/lokedhs/cl-rabbit">cl-rabbit</a> a Common Lisp client library for RabbitMQ


## <a id="cobol-dev" class="anchor" href="#cobol-dev">COBOL</a>

 * <a href="http://assortedrambles.blogspot.ru/2013/04/using-rabbitmq-from-cobol_9584.html">Using rabbitmq-c From COBOL</a>


## <a id="protocol-analysis" class="anchor" href="#protocol-analysis">Traffic Capture and Protocol Analysis</a>

 * <a href="amqp-wireshark.html">Wireshark</a> is the world's foremost
   network protocol analyzer


## <a id="miscellaneous" class="anchor" href="#miscellaneous">Miscellaneous</a>

 * <a href="https://github.com/ericliang/rabbitmq-xmpp">XMPP adaptor</a>
 * <a href="http://streambase.com/sbx.htm#Simple%20AMQP%20using%20RabbitMQ">RabbitMQ Adapter for Streambase</a> for complex event processing (CEP)
 * <a href="http://www.habarisoft.com/habari_rabbitmq.html">Delphi/Free Pascal RabbitMQ Client</a>
 * <a href="https://github.com/bkjones/bevis">bevis</a>: a syslog listener that forwards messages over RabbitMQ
 * <a href="http://code.google.com/p/rabbitmq-memcached/">rabbitmq-memcached</a>: a memcached adapter for RabbitMQ that allows you use the memcache protocol to
   get or publish a message from or to RabbitMQ
 * <a href="https://github.com/stampy88/flume-amqp-plugin">flume-amqp-plugin</a>:
   a plugin for <a href="https://github.com/cloudera/flume/wiki">Flume</a> (a Hadoop data loader) that allows you to use a RabbitMQ node as a data source.
 * <a href="http://kirkwylie.blogspot.com/2009/11/announcing-release-of-fudge-messaging.html">Fudge Messaging Format</a>:
   fudge is a data encoding system that is hierarchical, typesafe, binary and self-describing. It is messaging protocol-agnostic.
 * <a href="http://qdb.io/">QDB: Persistent Message Queues with Replay</a>: queue backup and replay over AMQP 0-9-1. Includes REST API
