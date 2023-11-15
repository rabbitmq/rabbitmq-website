<!--
Copyright (c) 2007-2023 VMware, Inc. or its affiliates.

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

# RabbitMQ Tutorials

These tutorials cover the basics of creating messaging
applications using RabbitMQ.

You need to have the RabbitMQ server installed to go through
the tutorials, please see the [installation guide](./download) or
use the [Docker image](https://registry.hub.docker.com/_/rabbitmq/).

Executable versions of these tutorials [are open source](https://github.com/rabbitmq/rabbitmq-tutorials),
as is [this website](https://github.com/rabbitmq/rabbitmq-website).

These tutorials focus on just one (the original) protocol supported by RabbitMQ.
Examples for [RabbitMQ streams](./streams) on the [RabbitMQ blog](https://blog.rabbitmq.com/categories/streams/).

<table id="tutorials">
  <tr>
  <td id="tutorial-one">
    <h2><span class="tute-num">1</span> <a href="./tutorials/tutorial-one-python">"Hello World!"</a></h2>
    <p>
      The simplest thing that does <em>something</em>
    </p>
    <p><img src="./img/tutorials/python-one.png" width="180" alt="Producer -> Queue -> Consuming: send and receive messages from a named queue."/></p>
    <ul>
      <li><a href="./tutorials/tutorial-one-python">Python</a></li>
      <li><a href="./tutorials/tutorial-one-java">Java</a></li>
      <li><a href="./tutorials/tutorial-one-ruby">Ruby</a></li>
      <li><a href="./tutorials/tutorial-one-php">PHP</a></li>
      <li><a href="./tutorials/tutorial-one-dotnet">C#</a></li>
      <li><a href="./tutorials/tutorial-one-javascript">JavaScript</a></li>
      <li><a href="./tutorials/tutorial-one-go">Go</a></li>
      <li><a href="./tutorials/tutorial-one-elixir">Elixir</a></li>
      <li><a href="./tutorials/tutorial-one-objectivec">Objective-C</a></li>
      <li><a href="./tutorials/tutorial-one-swift">Swift</a></li>
      <li><a href="./tutorials/tutorial-one-spring-amqp">Spring AMQP</a></li>
    </ul>
  </td>

  <td id="tutorial-two">
    <h2><span class="tute-num">2</span> <a href="./tutorials/tutorial-two-python">Work Queues</a></h2>
    <p>
      Distributing tasks among workers (the <a href="http://www.enterpriseintegrationpatterns.com/patterns/messaging/CompetingConsumers.html">competing consumers pattern</a>)
    </p>
    <p><img src="./img/tutorials/python-two.png" width="180" alt="Producer -> Queue -> Consuming: Work Queue used to distribute time-consuming tasks among multiple workers."/></p>
    <ul>
        <li><a href="./tutorials/tutorial-two-python">Python</a></li>
        <li><a href="./tutorials/tutorial-two-java">Java</a></li>
        <li><a href="./tutorials/tutorial-two-ruby">Ruby</a></li>
        <li><a href="./tutorials/tutorial-two-php">PHP</a></li>
        <li><a href="./tutorials/tutorial-two-dotnet">C#</a></li>
        <li><a href="./tutorials/tutorial-two-javascript">JavaScript</a></li>
        <li><a href="./tutorials/tutorial-two-go">Go</a></li>
        <li><a href="./tutorials/tutorial-two-elixir">Elixir</a></li>
        <li><a href="./tutorials/tutorial-two-objectivec">Objective-C</a></li>
        <li><a href="./tutorials/tutorial-two-swift">Swift</a></li>
        <li><a href="./tutorials/tutorial-two-spring-amqp">Spring AMQP</a></li>
    </ul>
  </td>

  <td id="tutorial-three">
    <h2><span class="tute-num">3</span> <a href="./tutorials/tutorial-three-python">Publish/Subscribe</a></h2>
    <p>
      Sending messages to many consumers at once
    </p>
    <p><img src="./img/tutorials/python-three.png" height="50" width="180" alt="Producer -> Queue -> Consuming: deliver a message to multiple consumers. This pattern is known as publish/subscribe"/></p>
    <ul>
      <li><a href="./tutorials/tutorial-three-python">Python</a></li>
      <li><a href="./tutorials/tutorial-three-java">Java</a></li>
      <li><a href="./tutorials/tutorial-three-ruby">Ruby</a></li>
      <li><a href="./tutorials/tutorial-three-php">PHP</a></li>
      <li><a href="./tutorials/tutorial-three-dotnet">C#</a></li>
      <li><a href="./tutorials/tutorial-three-javascript">JavaScript</a></li>
      <li><a href="./tutorials/tutorial-three-go">Go</a></li>
      <li><a href="./tutorials/tutorial-three-elixir">Elixir</a></li>
      <li><a href="./tutorials/tutorial-three-objectivec">Objective-C</a></li>
      <li><a href="./tutorials/tutorial-three-swift">Swift</a></li>
      <li><a href="./tutorials/tutorial-three-spring-amqp">Spring AMQP</a></li>
    </ul>
  </td>
  </tr>

  <tr>
  <td id="tutorial-four">
    <h2><span class="tute-num">4</span> <a href="./tutorials/tutorial-four-python">Routing</a></h2>
    <p>
      Receiving messages selectively
    </p>
    <p><img src="./img/tutorials/python-four.png" height="50" width="180" alt="Producer -> Queue -> Consuming: subscribe to a subset of the messages only." /></p>
    <ul>
      <li><a href="./tutorials/tutorial-four-python">Python</a></li>
      <li><a href="./tutorials/tutorial-four-java">Java</a></li>
      <li><a href="./tutorials/tutorial-four-ruby">Ruby</a></li>
      <li><a href="./tutorials/tutorial-four-php">PHP</a></li>
      <li><a href="./tutorials/tutorial-four-dotnet">C#</a></li>
      <li><a href="./tutorials/tutorial-four-javascript">JavaScript</a></li>
      <li><a href="./tutorials/tutorial-four-go">Go</a></li>
      <li><a href="./tutorials/tutorial-four-elixir">Elixir</a></li>
      <li><a href="./tutorials/tutorial-four-objectivec">Objective-C</a></li>
      <li><a href="./tutorials/tutorial-four-swift">Swift</a></li>
      <li><a href="./tutorials/tutorial-four-spring-amqp">Spring AMQP</a></li>
    </ul>
  </td>

  <td id="tutorial-five">
    <h2><span class="tute-num">5</span> <a href="./tutorials/tutorial-five-python">Topics</a></h2>
    <p>
      Receiving messages based on a pattern (topics)
    </p>
    <p><img src="./img/tutorials/python-five.png" height="50" width="180" alt="Producer -> Queue -> Consuming: receiving messages based on a pattern (topics)."/></p>
    <ul>
      <li><a href="./tutorials/tutorial-five-python">Python</a></li>
      <li><a href="./tutorials/tutorial-five-java">Java</a></li>
      <li><a href="./tutorials/tutorial-five-ruby">Ruby</a></li>
      <li><a href="./tutorials/tutorial-five-php">PHP</a></li>
      <li><a href="./tutorials/tutorial-five-dotnet">C#</a></li>
      <li><a href="./tutorials/tutorial-five-javascript">JavaScript</a></li>
      <li><a href="./tutorials/tutorial-five-go">Go</a></li>
      <li><a href="./tutorials/tutorial-five-elixir">Elixir</a></li>
      <li><a href="./tutorials/tutorial-five-objectivec">Objective-C</a></li>
      <li><a href="./tutorials/tutorial-five-swift">Swift</a></li>
      <li><a href="./tutorials/tutorial-five-spring-amqp">Spring AMQP</a></li>
    </ul>
  </td>

  <td id="tutorial-six">
    <h2><span class="tute-num">6</span> <a href="./tutorials/tutorial-six-python">RPC</a></h2>
    <p>
      <a href="http://www.enterpriseintegrationpatterns.com/patterns/messaging/RequestReply.html">Request/reply pattern</a> example
    </p>
    <p><img src="./img/tutorials/python-six.png" height="50" width="180" alt="Producer -> Queue -> Consuming: RPC (Remote Procedure Call), the request/reply pattern."/></p>
    <ul>
      <li><a href="./tutorials/tutorial-six-python">Python</a></li>
      <li><a href="./tutorials/tutorial-six-java">Java</a></li>
      <li><a href="./tutorials/tutorial-six-ruby">Ruby</a></li>
      <li><a href="./tutorials/tutorial-six-php">PHP</a></li>
      <li><a href="./tutorials/tutorial-six-dotnet">C#</a></li>
      <li><a href="./tutorials/tutorial-six-javascript">JavaScript</a></li>
      <li><a href="./tutorials/tutorial-six-go">Go</a></li>
      <li><a href="./tutorials/tutorial-six-elixir">Elixir</a></li>
      <li><a href="./tutorials/tutorial-six-spring-amqp">Spring AMQP</a></li>
    </ul>
  </td>
  </tr>
  <tr>
  <td id="tutorial-seven">
    <h2><span class="tute-num">7</span> <a href="./tutorials/tutorial-seven-java">Publisher Confirms</a></h2>
    <p>
      Reliable publishing with publisher confirms
    </p>
    <ul>
      <li><a href="./tutorials/tutorial-seven-java">Java</a></li>
      <li><a href="./tutorials/tutorial-seven-dotnet">C#</a></li>
      <li><a href="./tutorials/tutorial-seven-php">PHP</a></li>
    </ul>
  </td>
  <td class="tutorial-empty"></td>
  <td class="tutorial-empty"></td>
  </tr>
</table>


## Getting Help

If you have any questions or comments regarding RabbitMQ, feel free to
ask them on [RabbitMQ mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users),
[RabbitMQ community Discord server](https://rabbitmq.com/discord/), or the public [RabbitMQ community Slack](https://rabbitmq.com/slack/).


## AMQP 0-9-1 Overview and Quick Reference

Once you have been through the tutorials (or if you want to
skip ahead), you may wish to read an
[Introduction to RabbitMQ Concepts](./tutorials/amqp-concepts)
and browse our
[AMQP 0-9-1 Quick Reference Guide](./amqp-0-9-1-quickref).


## Tutorials in Other Languages

The tutorials here use a number of popular technologies,
however, there are [ports available](https://github.com/rabbitmq/rabbitmq-tutorials) for
many more languages and client libraries, for example:

 * Rust using [amqprs](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/rust-amqprs)
 * Rust using [Lapin](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/rust-lapin))
 * [Clojure](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/clojure) (using [Langohr](http://clojurerabbitmq.info))
 * [Erlang](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/erlang) (using [RabbitMQ Erlang client](https://github.com/rabbitmq/rabbitmq-erlang-client))
 * [Haskell](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/haskell) (using [Network.AMQP](http://hackage.haskell.org/package/amqp))
 * [Perl](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/perl) (using [Net::RabbitFoot](https://github.com/cooldaemon/RabbitFoot))
 * [Perl](https://github.com/oylenshpeegul/RabbitMQ-Tutorial-Perl) (using [Net::AMQP::RabbitMQ](http://p3rl.org/Net::AMQP::RabbitMQ))
 * [Scala](https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/scala) (using [RabbitMQ Java client](https://www.rabbitmq.com/./api-guide))

We also maintain a list of community-developed [clients and developer tools](./devtools)
for a range of platforms.
