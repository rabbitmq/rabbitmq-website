---
title: Local Random Exchange
---
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

# Local Random Exchange

## Overview {#overview}

Local random exchange was introduced in RabbitMQ 4.0 and is mostly
meant for RPC use cases. With this exchange type, messages are always
delivered locally, which guarantees minimal latency. If there are multiple
local queues bound to the exchange, one of them will be picked at random
to deliver the message to.

### Motivation {#motivation}

RPC (request/reply) is a popular pattern to implement with a messaging broker
like RabbitMQ. One of the popular use cases is a microservices based architecture
where one service requests data from another service.

Key requirements to support such a scenario include:

1. Low latency - likely the publisher can't proceed until it gets a response; therefore
the message should be delivered to the consumer as quickly as possible. With other exchange types,
the queue could reside on a different node, which means an additional network hop to deliver the message.
Local random exchange solves this problem by always delivering messages to a local queue (if there
are no local queues bound to this exchange, the message won't be delivered).

1. Scalability - ability to add additional application instances to handle the requests. Binding more
queues to a local random exchange automatically spreads the requests across more queues. Exclusive
queues can be used by the consumers to ensure they are node-local.

The combination of a local random exchange and exclusive queues guarantees that the publishing and
consumption process take place without the message being passed to any other RabbitMQ nodes.
This guarantees minimal latency.

## How to Use Local Random Exchange {#usage}

Let's have a look at the architecture of a simple RPC system using this exchange type.
To simulate publishers and consumers, we'll use [perf-test](https://perftest.rabbitmq.com/),
our AMQP 0.9.1 client application for simulating workloads. We'll need a multi-node
RabbitMQ cluster. Here, we assume all nodes are on localhost, listening on consecutive ports.
You will need to adjust the URIs to your environment.

Assuming you have a 3-node cluster, let's start 5 consumers: 2 on the first node, 2 on the second node
and just one on the third node:
```shell
perf-test -H amqp://localhost:5672 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
perf-test -H amqp://localhost:5672 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
perf-test -H amqp://localhost:5673 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
perf-test -H amqp://localhost:5673 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
perf-test -H amqp://localhost:5674 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
```
`perf-test` will declare exclusive queues and bind them to the `rpc` exchange with the `x-local-random` type
(the exchange itself will also be declared). Local random exchange doesn't allow a routing key to be used when
binding queues to the exchange, which is why we used `--routing-key ''` option above (perf-test uses a routing
key by default). The key would be ignored anyway when routing a message and not having it at all, allows for
some performance optimisations.


Now, let's start two publishers:
```shell
perf-test -H amqp://localhost:5672 --consumers 0 --exchange rpc -t x-local-random --rate 100
perf-test -H amqp://localhost:5673 --consumers 0 --exchange rpc -t x-local-random --rate 20
```

If you navigate to the Queues tab in the Management UI, you should see something like this:

<figure>
![Local Random Exchange Effect](@site/static/img/local-random-exchange.png)
</figure>

As expected, queues on node `rabbit-1` (port 5672) receive ~50 messages per second each,
queues on `rabbit-2` (port 5673) receive ~10 messages per second each, and the consumer on
`rabbit-3` (port 5674) does not receive any messages, since there are no local publishers.

## Caveats and Limitations {#limitations}

<ul>
  <li>
    You need to make sure there are consumers on each of the nodes in the cluster. Otherwise,
    messages published on the node with no consumers will be dropped.

    The best way to ensure that, is to configure consumers with one specific node to connect to - if that node is unavailable,
    these consumers are not available either.
  </li>
  <li>
    On the publisher side, there is some flexibility - if a publisher reconnects to another node,
    it will increase the load on that node, but the message flow should still work. However, you may
    still consider configuring publishers with just one specific node to connect to. They should be considered
    unavailable if their RabbitMQ node is down.

    You can use the `mandatory` flag when publishing. Such messages will be returned to the publisher if they can't be routed.
    This will allow detecting the situation when there are no consumers on the node the publisher is connected to.
    Publisher confirms are not necessary for RPC.
  </li>
  <li>
    A load balancer in front of RabbitMQ would make it virtually impossible to use this exchange type effectively,
    since it'd be hard to make sure consumers are present on all nodes and evenly spread between them
    (which is probably desired). Therefore, direct connections to RabbitMQ nodes are highly recommended.
  </li>
  <li>
    Queues don't have to be exclusive in this architecture, but this may simplify some operations.
  </li>
</ul>
