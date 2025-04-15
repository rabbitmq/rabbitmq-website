---
title: Distributed RabbitMQ
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

# Distributed RabbitMQ

## Overview {#overview}

AMQP 0-9-1, AMQP 1.0 and the other messaging protocols supported by RabbitMQ via
plug-ins (e.g. STOMP), are (of course) inherently distributed:
applications almost always connect to RabbitMQ on a remote host.

Often it is necessary or desirable to make the
RabbitMQ broker itself distributed. There are three ways in
which to accomplish that: with clustering, with Federation, and
using the Shovel plugin. This page provides an overview of each
approach.

Note that all three approaches are not mutually exclusive and can be combined:
clusters can be connected together with Federation or Shovel, or both.

## Clustering {#clustering}

[Clustering](./clustering) connects multiple
machines together to [form a cluster](./cluster-formation).
Inter-node communication is performed transparently to clients.
The design of clustering assumes that network connections are reasonably reliable
and provides a LAN-like latency.

All nodes in the cluster must run compatible versions of RabbitMQ and [Erlang](./which-erlang).

Nodes authenticate to each other using [a pre-shared secret](./clustering#erlang-cookie)
typically installed by deployment automation tools.

Virtual hosts, exchanges, users, and permissions are
[automatically replicated](./clustering#cluster-membership) across all nodes in a cluster.
Queues may be located on a single node, or replicate their content for higher availability.
[Quorum queues](./quorum-queues) is a modern replicated queue type that focuses on data safety.
[Streams](./streams) is another replicated messaging data type that allows for repeatable
consumption (reads).

A client connecting to any node in a
cluster can [use all non-exclusive queues in the cluster](./clustering#clustering-and-clients), even if they are not
located on that node.

Clustering nodes can help improve availability, data safety of queue contents and sustain
more concurrent client connections. The [Clustering](./clustering), [Quorum Queues](./quorum-queues) and [Streams](./streams)
guides provide more details on these topics.


## Federation {#federation}

[Federation](./federation) allows an exchange or
queue on one broker to receive messages published to an exchange
or queue on another (the brokers may be individual machines, or
clusters). Communication is via AMQP (with optional SSL), so for
two exchanges or queues to federate they must be granted
appropriate users and permissions.

Federated exchanges are connected with one way point-to-point
links. By default, messages will only be forwarded over a
federation link once, but this can be increased to allow for
more complex routing topologies. Some messages may not be
forwarded over the link; if a message would not be routed to a
queue after reaching the federated exchange, it will not be
forwarded in the first place.

Federated queues are similarly connected with one way
point-to-point links. Messages will be moved between federated
queues an arbitrary number of times to follow the consumers.

Typically you would use federation to link brokers across the
internet for pub/sub messaging and work queueing.


## Shovels {#shovel}

Connecting brokers with [the Shovel plugin](./shovel) is conceptually similar to connecting them with
Federation. However, the plugin works at a lower level.

Whereas federation aims to provide opinionated distribution of
exchanges and queues, the shovel simply consumes messages from a
queue on one broker, and forwards them to an exchange on
another.

Typically you would use the shovel to link brokers across the
internet when you need more control than federation provides.

[Dynamic shovels](./shovel-dynamic) can also be
useful for moving messages around in an ad-hoc manner on a
single broker.


## Summary {#summary}

<table>
  <tr>
    <th>Federation and/or Shovel</th>
    <th>Clustering</th>
  </tr>
  <tr>
    <td>
      Brokers are logically separate and may have different owners.
    </td>
    <td>
      A cluster forms a single logical broker.
    </td>
  </tr>
  <tr>
    <td>
      Brokers can run different (and incompatible in certain ways) versions of RabbitMQ and Erlang.
    </td>
    <td>
      Nodes must run compatible versions of RabbitMQ and Erlang.
    </td>
  </tr>
  <tr>
    <td>
      Brokers can be connected via unreliable WAN
      links. Communication is via AMQP 0-9-1 (optionally secured by
      <a href="./ssl">TLS</a>), requiring appropriate users and permissions to be set up.
    </td>
    <td>
      Brokers must be connected via reasonably reliable LAN
      links. Nodes will authenticate to each other using a shared secret
      and optionally <a href="./clustering-ssl">use TLS-enabled links</a>.
    </td>
  </tr>
  <tr>
    <td>
      Brokers can be connected in whatever topology you
      arrange. Links can be one- or two-way.
    </td>
    <td>
      All nodes connect to all other nodes in both directions.
    </td>
  </tr>
  <tr>
    <td>
      Emphasizes Availability and Partition Tolerance (AP) from
      the <a href="http://en.wikipedia.org/wiki/CAP_theorem">CAP theorem</a>.
    </td>
    <td>
      Emphasizes Consistency and Partition Tolerance (CP)
      from the <a href="http://en.wikipedia.org/wiki/CAP_theorem">CAP theorem</a>.
    </td>
  </tr>
  <tr>
    <td>
      Some exchanges in a broker may be federated while some may be local.
    </td>
    <td>
      Clustering is all-or-nothing.
    </td>
  </tr>
  <tr>
    <td>
      A client connecting to any broker can only use non-exclusive queues in that broker.
    </td>
    <td>
      A client connecting to any node can use non-exclusive queues on all nodes.
    </td>
  </tr>
</table>
