---
title: Local Random Exchange
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

# Local Random Exchange

## Overview {#overview}

Local random exchange is a new exchange type in RabbitMQ 4.0. It is primarily
designed for request-reply ("RPC") use cases. With this exchange type, messages are always
delivered to a local queue, which guarantees minimal publisher latency. If there are multiple
local queues bound to the exchange, one of them will be picked at random
to deliver the message to.

### Motivation {#motivation}

:::tip
The Local Random Exchange type is meant to be used together with exclusive queues
to provide a lower latency combination for request-reply ("RPC") workloads.
:::

:::important
This exchange type's design assumes that there are at least as many request-reply consumers as there are
cluster nodes. If this is not the case, some published messages **will be dropped**.
:::

Request/reply, often called RPC, is a popular pattern to implement with a messaging broker
like RabbitMQ. One of the popular use cases is a microservices based architecture
where one service requests data from another service. The pattern is covered in [tutorial six](/tutorials).

Key requirements to support such a scenario include:

1. Low latency: the publisher may or may not be able to proceed until it gets a response; therefore
the message should be delivered to the consumer as quickly as possible. With other exchange types,
the queue could reside on a different node, which means an additional network hop to deliver the message.
Local random exchange solves this problem by always delivering messages to a local queue. If there
are no local queues bound to this exchange, the message won't be delivered.

2. Scalability: the ability to add additional application instances to handle more requests. Binding more
queues to a local random exchange automatically spreads the requests across more queues. Exclusive
queues can be used by the consumers to ensure they are node-local.

The combination of a local random exchange and [exclusive queues](./queues#exclusive-queues) guarantees
that the publishing and consumption process take place without the message being passed between cluster nodes.
This guarantees minimal latency and requires that at least one local queue bound to the exchange
of this type is available on every cluster node. Therefore it is expected (and necessary)
that the number of application instances, and in particular request/reply ("RPC") consumers,
is greater than the number of nodes in the cluster.

## How to Use Local Random Exchange {#usage}

This section will demonstrate the behavior of this exchange type with
a [PerfTest](https://perftest.rabbitmq.com/)-based load test.

PerfTest will simulate client applications. This workload **requires** a multi-node
cluster. In the example below, we assume that all nodes are running on `localhost`, listening on three consecutive ports
from 5672 through 5674 (inclusive).

The below URIs will have to be adjusted if the cluster is not running locally or uses different ports.

Assuming a 3-node cluster, the following commands will start 5 consumers: 2 on the first node, 2 on the second node
and just one on the third node:

```shell
perf-test -H amqp://localhost:5672 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
perf-test -H amqp://localhost:5672 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
perf-test -H amqp://localhost:5673 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
perf-test -H amqp://localhost:5673 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
perf-test -H amqp://localhost:5674 --producers 0 --exchange rpc -t x-local-random --exclusive --routing-key ''
```
PerfTest will declare exclusive queues and bind them to the `rpc` exchange with the `x-local-random` type
(the exchange itself will also be declared). Local random exchange doesn't allow a routing key to be used when
binding queues to the exchange, which is why the `--routing-key ''` option is used above to override a Perftest default.

The routing key would be ignored when routing a message, and not having it at all, allows for
some performance optimisations.

Next, some producers must be started. In this example, we use two with different publishing rates:

```shell
perf-test -H amqp://localhost:5672 --consumers 0 --exchange rpc -t x-local-random --rate 100
perf-test -H amqp://localhost:5673 --consumers 0 --exchange rpc -t x-local-random --rate 20
```

Now the Queues tab in the Management UI will show something like this:

<figure>
![Local Random Exchange Effect](@site/static/img/local-random-exchange.png)
</figure>

As expected, queues on node `rabbit-1` (port 5672) receive ~50 messages per second each,
queues on `rabbit-2` (port 5673) receive ~10 messages per second each, and the consumer on
`rabbit-3` (port 5674) does not receive any messages, since there are no local publishers.

## Caveats and Limitations {#limitations}

:::warning
A load balancer in front of RabbitMQ would make it virtually impossible to use this exchange type effectively
:::

<ul>
  <li>
    The design of this exchange type assumes that there are online consumers on each of the nodes in the cluster. Otherwise,
    messages published on the node with no consumers will be dropped.

    The best way to ensure that, is to configure consumers with one specific node to connect to. If that node is unavailable,
    these consumers will not be (and are expected not to be) available either.
  </li>
  <li>
    On the publisher side, there is some flexibility: if a publisher reconnects to another node,
    it will increase the load on that node, but the message flow and routing should still work. However,
    configuring publishers with just one specific node to connect to may still be worth considering. Just like with
    the consumer recommendation above, if the node is not available, neither will be this type of publishers.

    The [`mandatory` flag](./publishers#unroutable) can be used when publishing. Such messages will be returned to the publisher if they can't be routed.
    This will allow detecting the situation when there are no consumers on the node the publisher is connected to.
    Publisher confirms are not necessary for RPC.
  </li>
  <li>
    A load balancer in front of RabbitMQ would make it virtually impossible to use this exchange type effectively,
    since it'd be hard to make sure consumers are present on all nodes and evenly spread between them
    (which is not required but is optimal for more event resource use). Therefore, direct connections to RabbitMQ nodes are highly recommended.
  </li>
  <li>
    Queues don't have to be exclusive in this architecture, but this may simplify some operations.
  </li>
</ul>
