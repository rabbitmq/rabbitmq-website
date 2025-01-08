---
title: RabbitMQ Tutorials
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

import T1DiagramToC from '@site/src/components/Tutorials/T1DiagramToC.md';
import T2DiagramToC from '@site/src/components/Tutorials/T2DiagramToC.md';
import T3DiagramToC from '@site/src/components/Tutorials/T3DiagramToC.md';
import T4DiagramToC from '@site/src/components/Tutorials/T4DiagramToC.md';
import T5DiagramToC from '@site/src/components/Tutorials/T5DiagramToC.md';
import T6DiagramToC from '@site/src/components/Tutorials/T6DiagramToC.md';


import T1DiagramStreamToC from '@site/src/components/Tutorials/T1DiagramStreamToC.md';
import T2DiagramStreamToC from '@site/src/components/Tutorials/T2DiagramStreamToC.md';

# RabbitMQ Tutorials

These tutorials cover the basics of creating messaging
applications using RabbitMQ.

You need to have the RabbitMQ server installed to go through the tutorials,
please see the [installation guide](/docs/download) or use the [community Docker image](https://hub.docker.com/_/rabbitmq/).


Executable versions of these tutorials [are open source](https://github.com/rabbitmq/rabbitmq-tutorials),
as is [this website](https://github.com/rabbitmq/rabbitmq-website).

There are two groups of tutorials:

 * [RabbitMQ queues](#queue-tutorials)
 * [RabbitMQ streams](#stream-tutorials)

:::note
You can use these tutorials with any versions of RabbitMQ. That said, we
recommend to familiarize yourself with the latest version!
For the stream tutorials, you need to use RabbitMQ 3.9.0 or later.
:::


### Queue tutorials

This section covers the default RabbitMQ protocol, AMQP 0-9-1.

<table id="tutorials">
    <colgroup>
        <col span="1" style={{width: '33%',}}/>
        <col span="1" style={{width: '33%',}}/>
        <col span="1" style={{width: '33%',}}/>
    </colgroup>

  <tr>
  <td id="tutorial-one" style={{verticalAlign: 'top',}}>
    ## 1. "Hello World!"

    The simplest thing that does *something*

    <T1DiagramToC/>

    * [Python](tutorials/tutorial-one-python)
    * [Java](tutorials/tutorial-one-java)
    * [Ruby](tutorials/tutorial-one-ruby)
    * [PHP](tutorials/tutorial-one-php)
    * [C#](tutorials/tutorial-one-dotnet)
    * [JavaScript](tutorials/tutorial-one-javascript)
    * [Go](tutorials/tutorial-one-go)
    * [Elixir](tutorials/tutorial-one-elixir)
    * [Objective-C](tutorials/tutorial-one-objectivec)
    * [Swift](tutorials/tutorial-one-swift)
    * [Spring AMQP](tutorials/tutorial-one-spring-amqp)
  </td>

  <td id="tutorial-two" style={{verticalAlign: 'top',}}>
    ## 2. Work Queues

    Distributing tasks among workers (the <a href="http://www.enterpriseintegrationpatterns.com/patterns/messaging/CompetingConsumers.html">competing consumers pattern</a>)

    <T2DiagramToC/>

    * [Python](tutorials/tutorial-two-python)
    * [Java](tutorials/tutorial-two-java)
    * [Ruby](tutorials/tutorial-two-ruby)
    * [PHP](tutorials/tutorial-two-php)
    * [C#](tutorials/tutorial-two-dotnet)
    * [JavaScript](tutorials/tutorial-two-javascript)
    * [Go](tutorials/tutorial-two-go)
    * [Elixir](tutorials/tutorial-two-elixir)
    * [Objective-C](tutorials/tutorial-two-objectivec)
    * [Swift](tutorials/tutorial-two-swift)
    * [Spring AMQP](tutorials/tutorial-two-spring-amqp)
  </td>

  <td id="tutorial-three" style={{verticalAlign: 'top',}}>
    ## 3. Publish/Subscribe

    Sending messages to many consumers at once

    <T3DiagramToC/>

    * [Python](tutorials/tutorial-three-python)
    * [Java](tutorials/tutorial-three-java)
    * [Ruby](tutorials/tutorial-three-ruby)
    * [PHP](tutorials/tutorial-three-php)
    * [C#](tutorials/tutorial-three-dotnet)
    * [JavaScript](tutorials/tutorial-three-javascript)
    * [Go](tutorials/tutorial-three-go)
    * [Elixir](tutorials/tutorial-three-elixir)
    * [Objective-C](tutorials/tutorial-three-objectivec)
    * [Swift](tutorials/tutorial-three-swift)
    * [Spring AMQP](tutorials/tutorial-three-spring-amqp)
  </td>
  </tr>

  <tr>
  <td id="tutorial-four" style={{verticalAlign: 'top',}}>
    ## 4. Routing

    Receiving messages selectively

    <T4DiagramToC/>

    * [Python](tutorials/tutorial-four-python)
    * [Java](tutorials/tutorial-four-java)
    * [Ruby](tutorials/tutorial-four-ruby)
    * [PHP](tutorials/tutorial-four-php)
    * [C#](tutorials/tutorial-four-dotnet)
    * [JavaScript](tutorials/tutorial-four-javascript)
    * [Go](tutorials/tutorial-four-go)
    * [Elixir](tutorials/tutorial-four-elixir)
    * [Objective-C](tutorials/tutorial-four-objectivec)
    * [Swift](tutorials/tutorial-four-swift)
    * [Spring AMQP](tutorials/tutorial-four-spring-amqp)
  </td>

  <td id="tutorial-five" style={{verticalAlign: 'top',}}>
    ## 5. Topics

    Receiving messages based on a pattern (topics)

    <T5DiagramToC/>

    * [Python](tutorials/tutorial-five-python)
    * [Java](tutorials/tutorial-five-java)
    * [Ruby](tutorials/tutorial-five-ruby)
    * [PHP](tutorials/tutorial-five-php)
    * [C#](tutorials/tutorial-five-dotnet)
    * [JavaScript](tutorials/tutorial-five-javascript)
    * [Go](tutorials/tutorial-five-go)
    * [Elixir](tutorials/tutorial-five-elixir)
    * [Objective-C](tutorials/tutorial-five-objectivec)
    * [Swift](tutorials/tutorial-five-swift)
    * [Spring AMQP](tutorials/tutorial-five-spring-amqp)
  </td>

  <td id="tutorial-six" style={{verticalAlign: 'top',}}>
    ## 6. RPC

    <a href="http://www.enterpriseintegrationpatterns.com/patterns/messaging/RequestReply.html">Request/reply pattern</a> example

    <T6DiagramToC/>

    * [Python](tutorials/tutorial-six-python)
    * [Java](tutorials/tutorial-six-java)
    * [Ruby](tutorials/tutorial-six-ruby)
    * [PHP](tutorials/tutorial-six-php)
    * [C#](tutorials/tutorial-six-dotnet)
    * [JavaScript](tutorials/tutorial-six-javascript)
    * [Go](tutorials/tutorial-six-go)
    * [Elixir](tutorials/tutorial-six-elixir)
    * [Spring AMQP](tutorials/tutorial-six-spring-amqp)
  </td>
  </tr>

  <tr>
  <td id="tutorial-seven" style={{verticalAlign: 'top',}}>
    ## 7. Publisher Confirms

    Reliable publishing with publisher confirms

    * [Java](tutorials/tutorial-seven-java)
    * [C#](tutorials/tutorial-seven-dotnet)
    * [PHP](tutorials/tutorial-seven-php)
  </td>
  <td class="tutorial-empty"></td>
  <td class="tutorial-empty"></td>
  </tr>
</table>

## AMQP 0-9-1 Overview

Once you have been through the tutorials (or if you want to
skip ahead), you may wish to read an
[Introduction to RabbitMQ Concepts](/tutorials/amqp-concepts)
and take a look at the [Compatibility and Conformance page](/docs/specification)
to find relevant resources to learn more about AMQP 1.0 and AMQP 0-9-1,
the two core protocols implemented by RabbitMQ.


## Stream tutorials

This section covers [RabbitMQ streams](/docs/streams).

<table id="stream-tutorials">
    <colgroup>
        <col span="1" style={{width: '33%',}}/>
        <col span="1" style={{width: '33%',}}/>
        <col span="1" style={{width: '33%',}}/>
    </colgroup>
<tr>
  <td id="tutorial-one" style={{verticalAlign: 'top',}}>
    ## 1. "Hello World!"

    The simplest thing that does *something*

    <T1DiagramStreamToC/>
    * [Java](tutorials/tutorial-one-java-stream)
    * [C#](tutorials/tutorial-one-dotnet-stream)
    * [Go](tutorials/tutorial-one-go-stream)
    * [Python](tutorials/tutorial-one-python-stream)
    * [Rust](tutorials/tutorial-one-rust-stream)
    * [Node.js](tutorials/tutorial-one-javascript-stream)
  </td>

  <td id="tutorial-two" style={{verticalAlign: 'top',}}>
    ## 2. Offset Tracking

    Keep track of message processing

    <T2DiagramStreamToC/>
    * [Java](tutorials/tutorial-two-java-stream)
    * [C#](tutorials/tutorial-two-dotnet-stream)
    * [Go](tutorials/tutorial-two-go-stream)
    * [Python](tutorials/tutorial-two-python-stream)
    * [Rust](tutorials/tutorial-two-rust-stream)
    * [Node.js](tutorials/tutorial-two-javascript-stream)
  </td>


</tr>

</table>

## Stream Overview and Blog Posts

Once you have been through the tutorials (or if you want to
skip ahead), you may wish to read the
[RabbitMQ stream documentation](/docs/streams)
and browse our
[stream blog posts](/blog/tags/streams).



## Getting Help

If you have any questions or comments regarding RabbitMQ, feel free to
ask them on [GitHub Discussion](https://github.com/rabbitmq/rabbitmq-server/discussions) or
[RabbitMQ community Discord server](https://www.rabbitmq.com/discord).




## Tutorials in Other Languages

The tutorials here use a number of popular technologies,
however, there are [ports available](https://github.com/rabbitmq/rabbitmq-tutorials) for
many more languages and client libraries, for example:

 * Rust using [amqprs](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/rust-amqprs)
 * Rust using [Lapin](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/rust-lapin)
 * [Clojure](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/clojure) (using [Langohr](http://clojurerabbitmq.info))
 * [Erlang](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/erlang) (using [RabbitMQ Erlang client](https://github.com/rabbitmq/rabbitmq-erlang-client))
 * [Haskell](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/haskell) (using [Network.AMQP](http://hackage.haskell.org/package/amqp))
 * [Perl](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/perl) (using [Net::RabbitFoot](https://github.com/cooldaemon/RabbitFoot))
 * [Perl](https://github.com/oylenshpeegul/RabbitMQ-Tutorial-Perl) (using [Net::AMQP::RabbitMQ](http://p3rl.org/Net::AMQP::RabbitMQ))
 * [Scala](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/scala) (using [RabbitMQ Java client](/client-libraries/java-api-guide))

We also maintain a list of community-developed [clients and developer tools](/client-libraries/devtools)
for various protocols RabbitMQ supports.
