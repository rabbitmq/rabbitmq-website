<!--
Copyright (c) 2007-2022 VMware, Inc. or its affiliates.

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

# RabbitMQ JMS Client

## <a id="introduction" class="anchor" href="#introduction">Introduction</a>

RabbitMQ is not a JMS provider but includes [a plugin](https://github.com/rabbitmq/rabbitmq-server/tree/v3.9.x/deps/rabbitmq_jms_topic_exchange)
needed to support the JMS Queue and Topic messaging models. JMS Client
for RabbitMQ implements the JMS specification on top of the
[RabbitMQ Java client](./api-guide.html), thus allowing new and
existing JMS applications to connect to RabbitMQ.

The library supports JMS 2.0 as of 2.7.0 and JMS 3.0 as of 3.0.0. 

The plugin and the JMS client are meant to work and be used together.

See the [RabbitMQ Java libraries support page](./java-versions.html) for the support timeline
of the RabbitMQ JMS Client library.

## <a id="introduction" class="anchor" href="#documentation">Documentation</a>

JMS Client Library documentation is hosted in Github Pages:

For JMS 2.x Client library:

  - [latest stable release](https://rabbitmq.github.io/rabbitmq-jms-client/2.x/stable/htmlsingle/index.html#introduction)
  - [latest milestone release](https://rabbitmq.github.io/rabbitmq-jms-client/2.x/milestone/htmlsingle/index.html#introduction)
  - [latest development build](https://rabbitmq.github.io/rabbitmq-jms-client/2.x/snapshot/htmlsingle/index.html#introduction)


For JMS 3.x Client library:

  - [latest stable release](https://rabbitmq.github.io/rabbitmq-jms-client/3.x/stable/htmlsingle/index.html#introduction)
  - [latest milestone release](https://rabbitmq.github.io/rabbitmq-jms-client/3.x/milestone/htmlsingle/index.html#introduction)
  - [latest development build](https://rabbitmq.github.io/rabbitmq-jms-client/3.x/snapshot/htmlsingle/index.html#introduction)
