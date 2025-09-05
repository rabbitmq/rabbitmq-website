---
title: Stream Client Connections
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Stream Client Connections

## Overview {#overview}

This companion guide to [the main guide on RabbitMQ streams](./streams) covers how [RabbitMQ Stream Protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v4.2.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc) clients can connect to a cluster to consume from and publish to streams.

The Stream Protocol has important differences from the other protocols supported
by RabbitMQ, such as AMQP 1.0, AMQP 0-9-1, MQTT and STOMP.

:::important

With streams, understanding the basics of the protocol and what client libraries can do is essential when cluster deployments involve extra layers
like containers and load balancers.

Streams are optimized for maximum throughput, so the topic of data locality and client connections becomes significantly more important
to cover in details.

:::


## Stream Topology and What it Means for Publishers and Consumers {#topology}

:::tip

[How messaging protocol clients connect to cluster nodes](./clustering#clustering-and-clients) is covered in the Clustering guide.

:::

A stream is replicated and persistent, composed of a **leader** (primary member/replica) and **followers** (or secondary members/replicas).
These replicas are distributed across multiple nodes of a RabbitMQ cluster, as shown in the following diagram:

![A stream is a replicated and persistent data structure. It has a leader process which accepts write operations and replicas which can dispatch messages to applications.](/img/streams-connections/stream-topology.svg)

Only the leader handles write operations, such as adding inbound messages to the stream. Any **member** of the stream – both the leader and any follower — can
be used for read operations, that is, delivering (dispatching) messages to client applications.

An application that publishes to a stream using the [stream protocol](https://github.com/rabbitmq/rabbitmq-server/blob/v4.2.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc)
can connect to any node in the cluster: messages will automatically be routed
from the node handling the client connection to the node that hosts the leader process.

However, in this case traffic routing will not be optimal if the connection and the stream leader are not on the same node.
For best data locality and efficiency, an application that publishes to a stream should connect to the node that hosts the leader of the stream,
to avoid an extra network hop.

### Consumers

The behavior differs for consuming applications. With the RabbitMQ Stream Protocol, messages are delivered (dispatched)
to applications using the [`sendfile`](https://man7.org/linux/man-pages/man2/sendfile.2.html) system call: file chunks that contain messages are sent directly
from the node file system to the network socket, without going through user space.

This optimization is crucial to stream efficiency. However, it also requires that the node the consuming application is connected to hosts a member of the stream.
Whether this member is the leader or a replica does not matter, as long as the data is on the file system, ready to be moved to the socket
by the kernel executing a `sendfile` system call.

This constraint for consuming applications is manageable in most cases. On the diagram above, each node has a member of the stream,
so an application can connect to any node to consume. However, consider a 5-node cluster with streams using a replication factor of 2:
each stream will have members only on 3 nodes out of the 5 nodes.

In this case, consuming applications must select their connection node appropriately.

## Best Practices for Publishers and Consumers {#best-practices}

Publishing applications can connect to any node of a cluster and will always reach the leader process.
Consuming applications must connect to a node that hosts a member of the target stream,
where this member can be either the leader or a follower. The following best practices should be enforced whenever possible:

* Publishing applications should always connect to the node that hosts the leader process of the target stream
* Consuming applications should always connect to a node that hosts a replica of the target stream

The following diagram illustrates these best practices:

![Client applications that publish to a stream should connect to the node that hosts the stream leader, clients applications that consume from a stream should connect to a node that hosts a replica of this stream.](/img/streams-connections/well-behaved-clients.svg)

Connecting directly to the node of the stream leader avoids a network hop, as published messages ultimately must go to the leader.
Using a replica for consuming relieves the leader from some load, allowing it to spend more resources handling all the write operations.

These best practices are integrated into the official RabbitMQ Stream Protocol [client libraries](/client-libraries/devtools),
keeping these details from complicating application code.

:::tip

 * Publishing applications should always connect to the node that hosts the leader process of the target stream
 * Consuming applications should always connect to a node that hosts a replica of the target stream

:::

The stream protocol allows client libraries (and applications) to discover the topology of a given stream through the metadata command.

## Stream Distribution Across Cluster Nodes {#stream-distribution}

Before examining the `metadata` command of the stream protocol, it is important to understand how streams distribute across the nodes of a RabbitMQ cluster.
A stream has a leader Erlang process located on one node and replica Erlang processes located on other nodes.
With multiple streams, the leader and follower processes are spread across the cluster nodes.

With the exception of single node clusters, no single RabbitMQ node should host all the stream leaders.

A set of stream members (replicas) can be thought of as a small cluster within the RabbitMQ cluster,
as illustrated with several streams in the following diagram:

![Stream leaders spread across the nodes of a cluster. This means that a given node does not have to contain all the leaders at some point.](/img/streams-connections/stream-spread.svg)

The distribution of leaders across the cluster depends on the [leader locator strategy](./streams#leader-election)
in effect at stream declaration time.

## Stream Topology Discovery Using the `metadata` Command {#metadata-command}

The stream protocol provides a [`metadata` command](https://github.com/rabbitmq/rabbitmq-server/blob/v4.2.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc#metadata) that
allows clients to query the topology of one or several streams. For each queried stream, the response contains
the hostname and port of the nodes that host the leader and replicas.

The following diagram illustrates how a client application already connected to one of the nodes can discover the topology of a given stream:

![A client can find out about the topology of a stream by using the `metadata` command.](/img/streams-connections/metadata-command.svg)

A common pattern is to provide one or several node endpoints to a client library, then using the `metadata` command once connected
to discover the topology of the target stream, and then connecting to the appropriate nodes depending on the operations (publishing or consuming).

![Once a client application knows about the topology of a stream, it can connect to the appropriate nodes to work with it: the node that hosts the stream leader to publish and nodes that host the stream replicas to consume.](/img/streams-connections/use-connection-hints.svg)

The `metadata` command is essential for client libraries to enforce the best practices mentioned above.

Unfortunately, the metadata returned with all defaults will not always be accurate, or at least not accurate enough for the client application to connect successfully.

## Limitations of the Metadata Command {#metadata-limitations}

RabbitMQ streams will return the hostname of each node for the host metadata (more specifically, the host part of the node name, the `{hostname}` part in `rabbit@{hostname}`).
This works as long as the client can resolve the hostname of the target node.

However, when RabbitMQ nodes are deployed in containerized environments, the hostname can be ambiguous and may not resolve on the hosts where applications
are deployed.

The following diagram illustrates a 3-node RabbitMQ cluster where the nodes are containers running on different VMs.
A client application can connect to the nodes if the ports are mapped correctly, but cannot do so using the hostname of the containers.

![Using the hostname in metadata will not work when the nodes run in containers, as it is very unlikely the client and the nodes can see each other directly.](/img/streams-connections/use-connection-hints-with-docker.svg)

The RabbitMQ node with the stream plugin enabled does its best but it cannot know what hostnames clients can or cannot resolve, and why.
Fortunately, it is possible to configure what a node returns when asked for its "coordinates" for the `metadata` command.

## Tuning the Metadata Command: Advertised Host and Port {#advertised-host-port}

The [`advertised_host` and `advertised_port` configuration entries](./stream#advertised-host-port) of the stream plugin should be used to specify
what a node returns when asked how to be contacted. The plugin will return these values as given, without any validation.
The DNS setup must allow client applications to connect to the node using these configured values. In practice this means
that the overridden advertised hostnames must be stable and resolvable by application hosts.

![It is possible to configure advertised host and port if the default values are not appropriate.](/img/streams-connections/metadata-hints.svg)

The `advertised_host` and `advertised_port` settings should resolve connection issues where client applications cannot connect to nodes due to
using the hostnames advertised by default. These settings are important to consider when deploying a RabbitMQ cluster with containerized nodes and streams.

:::important

When RabbitMQ nodes use hostnames that applications cannot resolve, using the `advertised_host` and `advertised_port` settings
becomes essential.

:::

There remains one common use case where this discovery mechanism can be problematic: when a load balancer sits between client applications and the cluster nodes.

## Connecting to Nodes Behind a Load Balancer {#load-balancer}

Having a load balancer in front of a RabbitMQ cluster is a common scenario. A load balancer can make the data locality problem outlined above much worse.
Fortunately, solutions exist.

When using the metadata command with a load balancer, issues arise: the client will receive the nodes information and use it to connect **directly** to the nodes,
bypassing the load balancer. The following diagram illustrates this situation:

![Metadata hints are less useful when a load balancer sits between the client and the nodes. The client application will skip the load balancer and try to connect directly to the nodes. This can be impossible or a security concern.](/img/streams-connections/load-balancer.svg)

This behavior is usually undesirable.

:::warning

Setting the `advertised_host` and `advertised_port` configuration entries to use the load balancer information so client applications always
connect to the load balancer is not recommended.

This approach prevents enforcing the best practices (publishing to the leader, consuming from replica) and in deployments where streams are not on all nodes,
consuming will fail if the application connects to a node without a stream member.

:::

Client libraries can implement a workaround to resolve this problem.

## Client Workaround With a Load Balancer {#load-balancer-workaround}

A client application can always connect to the load balancer and end up connected to the appropriate node using the following approach:

 * Use the `metadata` command but **intentionally ignore** the discovered result and always connect to the load balancer
 * Retry connecting until connected to an appropriate node

The "coordinates" of the node (hostname and port, or `advertised_host` and `advertised_port` if configured) are available in a stream protocol connection.
A client application can determine to which node it is connected.

This means that `advertised_host` and `advertised_port` should not be configured when a load balancer is in use.
The "coordinates" of a node that the `metadata` command returns are not used to connect in this case, as the client always connects to the load balancer.
They are used to **correlate** the connection the load balancer provides with the node the client expects, and the hostname is sufficient for this purpose.

:::tip

**This means `advertised_host` and `advertised_port` should not be configured when a load balancer is in use.**

:::

Consider the following scenario:

* A publishing application knows the leader of its targeted stream is on `node-1` thanks to the response of a `metadata` request
* It creates a new connection using the load balancer address
* The load balancer chooses to connect to `node-3`
* The connection is properly established but the client application discovers it is connected to `node-3`, it immediately closes the connection, and retries
* The load balancer chooses `node-1` on the next attempt
* The application is connected to the correct node and proceeds with publishing using this connection

The following diagram illustrates this process:

![A client can choose to ignore the metadata hints and always use the load balancer. As stream connections convey the node hostname they originate from, the client can know whether it is connected to the right node or not, and keep the connection or close it and retry.](/img/streams-connections/load-balancer-ignore-metadata.svg)

As stream connections are meant to be long-lived and stream applications do not typically have significant connection churn,
retrying to connect will not lead to a [high connection churn](./connections#high-connectionchurn) scenario and is not a concern.

This solution assumes that the load balancer will not always connect to the same backend server.
Round robin is an appropriate balancing strategy for this case.

Setting `advertised_host` and `advertised_port` is not necessary when using this technique and setting them to the load balancer coordinates for all nodes can be
impossible or difficult to achieve. Allowing each node to return its hostname is appropriate here, as the hostname should be unique in a network.

This responsibility lies with the client library. The following section describes how this is implemented with the stream Java client.

## Using the Stream Java Client With a Load Balancer {#java-client-load-balancer}

The [stream Java client](https://github.com/rabbitmq/rabbitmq-stream-java-client) provides [an `AddressResolver` extension point](https://github.com/rabbitmq/rabbitmq-stream-java-client/blob/main/src/main/java/com/rabbitmq/stream/AddressResolver.java). It is used whenever a new connection is created: from the passed-in `Address` (the node to connect to based on the `metadata` query), the address resolver can provide logic to compute the actual address to use. The default implementation returns the given address. To implement the workaround presented above when a load balancer is in use, always return the address of the load balancer, as shown in the following code snippet:

```java
Address entryPoint = new Address("my-load-balancer", 5552);
Environment environment = Environment.builder()
    .host(entryPoint.host())
    .port(entryPoint.port())
    .addressResolver(address -> entryPoint)
    .build();
```

The [stream PerfTest tool](https://rabbitmq.github.io/rabbitmq-stream-java-client/stable/htmlsingle/#the-performance-tool) also supports this mode when the `--load-balancer` option is enabled. The following commands configure the tool to always use the same entry point for publishers and consumers connections:

```shell
# with the Java binary
java -jar stream-perf-test.jar --uris rabbitmq-stream://my-load-balancer:5552 --load-balancer

# with Docker
docker run -it --rm pivotalrabbitmq/stream-perf-test --uris rabbitmq-stream://my-load-balancer:5552 --load-balancer
```

## Best Practices, Summarized {#summary}

Client applications connecting using the stream protocol should follow these guidelines:

 * Publishing applications should connect to the node that hosts the leader of the target stream
 * Consuming applications should connect to a node that hosts a replica of the target stream
 * Client applications must use the [`metadata` stream protocol command](https://github.com/rabbitmq/rabbitmq-server/blob/v4.2.x/deps/rabbitmq_stream/docs/PROTOCOL.adoc#metadata) to learn about the topology of the streams they want to interact with
 * The stream [Java](https://github.com/rabbitmq/rabbitmq-stream-java-client) and [Go](https://github.com/rabbitmq/rabbitmq-stream-go-client) clients enforce these best practices
 * The `metadata` command returns by default the node's hostname and listener port, which can be problematic in containerized environments
 * The [`advertised_host` and `advertised_port` configuration entries](./stream#advertised-host-port) allow specifying what values a node should return for the `metadata` command
 * A load balancer can confuse a client library that will try to bypass it to connect directly to the nodes
 * Client libraries can provide a workaround to work properly with a load balancer
 * The stream [Java](https://github.com/rabbitmq/rabbitmq-stream-java-client) and [Go](https://github.com/rabbitmq/rabbitmq-stream-go-client) clients implement such a workaround
