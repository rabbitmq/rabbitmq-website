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

# Shovel Plugin

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide provides an overview of RabbitMQ Shovel, a core RabbitMQ plugin that unidirectionally
moves messages from a source to a destination. Two more guides
cover the two flavors of Shovels, [dynamic shovels](shovel-dynamic.html) and [static shovels](shovel-static.html),
respectively. This one focuses on explaining the concept, how do shovels work
and what they can do.

Sometimes it is necessary to reliably and continually move messages from a source (typically a queue)
in one cluster to a destination (an exchange, topic, etc) in another cluster.

The `rabbitmq_shovel` [plugin](./plugins.html) allows you to
configure a number of shovels (transfer workers), which do just that
and run as part of a RabbitMQ cluster.

The source and destination can be in the same
cluster (typically in different vhosts) or distinct ones.
Shovels support AMQP 0.9.1 and AMQP 1.0 sources and destinations.
The source and destination do not have to use the same protocol,
so it is possible to move messages from an AMQP 1.0 broker to RabbitMQ
or vice versa.

A shovel behaves like a well-written client application, which
connects to its source and destination, consumes and republishes messages,
and uses [acknowledgements](./confirms.html) on both ends to cope with failures.

A Shovel uses [Erlang AMQP 0-9-1](https://www.rabbitmq.com/erlang-client-user-guide.html)
and [Erlang AMQP 1.0](https://github.com/rabbitmq/rabbitmq-amqp1.0-client) clients under the hood.

## <a id="benefits" class="anchor" href="#benefits">Why Use Shovel</a>

Shovel is a minimalistic yet flexible tool in the distributed messaging toolkit
that can accommodate a number of use cases. Below are some of its key features
and design goals.

### Loose Coupling

A shovel can move messages between brokers (or clusters) in
different geographic or administrative domains that

 * may have different loosely related purposes
 * may run on different versions of RabbitMQ
 * may use different messaging products or protocols
 * may have different users and virtual hosts

### WAN-friendly

The Shovel plugin uses [client connections](connections.html) under the hood.
[Acknowledgements and publisher confirms](./confirms.html) are used to ensure data safety in case of connection
and node failures.

### Cross-protocol and Product Message Transfers

Modern Shovel versions support multiple protocols: AMQP 0.9.1 and AMQP 1.0.

This means it is possible to shovel, e.g. from and AMQP 1.0
broker source to a RabbitMQ destination and vice versa.
More protocols may be supported in the future.

### Flexibility

When a shovel connects (either to the source or the
destination) it can be configured to predeclare a certain topology
it needs.

There is no requirement to run the shovel on the same broker
(or cluster) as its source or destination, although that's the most typical approach;
the shovel can run on an entirely separate node or cluster.

A comparison between [clustering](./clustering.html), [federation](federation.html)
is provided in the [Distributed Messaging](distributed.html) guide.


## <a id="what-it-does" class="anchor" href="#what-it-does">What Does a Shovel Do?</a>

In essence, a shovel is a minimalistic message pump. Each shovel:

 * [Connects](connections.html) to the source and destination clusters
 * [Consumes](./consumers.html) messages from a queue
 * [Re-publishes](./publishers.html) to a destination
 * Uses [data safety features](./confirms.html) on both ends and handles failures

The shovel configuration allows each of these processes to be tailored.

### Connection

After connection to a source or a destination broker a
series of configured topology declaration operations can be
issued. For example, on an AMQP 0-9-1 endpoint, queues,
exchanges and bindings can be declared.

A shovel will attempt to reconnect if a failure
occurs and [multiple brokers can be specified](#clustering) for the source and
destination so that another broker may be selected (at
random) to reconnect to. A reconnection delay can be
specified to avoid flooding the network with reconnection
attempts, or to prevent reconnection on failure altogether.


All configured topology declaration operations for that source or
destination are re-issued upon reconnection.

### Consumption

The Shovel's consumer will [acknowledge](./confirms.html) messages
automatically on receipt, after (re-)publication, or after
[confirmation of its publication](./confirms.html) from the destination server.

### Re-publishing

Most publishing and message properties are controlled by the operator.


## <a id="getting-started" class="anchor" href="#getting-started">Getting started</a>

The Shovel plugin is included in the RabbitMQ distribution.
To enable it, use [rabbitmq-plugins](./cli.html):

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_shovel
</pre>

[Management UI](./management.html) users may also wish to enable the `rabbitmq_shovel_management` plugin
for [Shovel status monitoring](#status).

There are two distinct ways to define shovels: [dynamic shovels](shovel-dynamic.html) are defined using
[runtime parameters](./parameters.html) and [static shovels](shovel-static.html) are defined in the [`advanced.config` file](configure.html).

The pros and cons with each approach are covered below. Most users should consider
dynamic shovels first for their ease of reconfiguration and management.

<table>
  <tr>
    <th><a href="./shovel-static.html">Static Shovels</a></th>
    <th><a href="./shovel-dynamic.html">Dynamic Shovels</a></th>
  </tr>
  <tr>
    <td>
      Defined in the broker <a href="./configure.html">advanced configuration file</a>.
    </td>
    <td>
      Defined using <a href="./parameters.html">runtime parameters</a>.
    </td>
  </tr>
  <tr>
    <td>
      Creation and deletion require a node restart.
    </td>
    <td>
      Creation and deletion do not require a node restart. Can be created and deleted at any time.
    </td>
  </tr>
  <tr>
    <td>
      Less opinionated, less automation-friendly: any queues, exchanges or bindings can
      be declared manually at startup.
    </td>
    <td>
      More opinionated, more automation-friendly: the queues, exchanges and
      bindings used by the shovel will be declared automatically.
    </td>
  </tr>
</table>

Note that when using AMQP 1.0 the "nodes" may still need to be created
outside of the shovel as the protocol does not include topology
creation.


## <a id="authn-authz-for-shovels" class="anchor" href="#authn-authz-for-shovels">Authentication and authorisation for Shovels</a>

The plugin uses [Erlang AMQP 0-9-1](./erlang-client-user-guide.html) and [Erlang AMQP 1.0](https://github.com/rabbitmq/rabbitmq-amqp1.0-client)
clients under the hood to open connections to its source and/or destination. Just like any other
[client library connection](connections.html), a Shovel connection must [successfully authenticate](./access-control.html)
and be [authorized to access](./access-control.html) the virtual host and resources it is trying to use.
This is true for both sources and destinations.

Authentication and authorisation failures of shovel connections will be
[logged](./logging.html) by the node that's running the shovel.


## <a id="clustering" class="anchor" href="#clustering">Shovel Failure Handling in Clusters</a>

It's normally desirable to ensure that shovels are resilient
to failure of any node in the source or destination clusters,
or the cluster hosting the shovel.

A shovel can be provided a list of both source and destination endpoints.
In this case the shovel will connect to the first reachable endpoint.

Dynamic shovels are automatically defined on all nodes of the
hosting cluster on which the shovel plugin is enabled. Each
shovel will only start on one arbitrarily chosen node, but will
be restarted on another node in case of node failure.

Static shovels should be defined in the configuration file for
all nodes of the hosting cluster on which the shovel plugin is
enabled. Again each shovel will only start on one node and
be restarted on another cluster node when a node failure is detected.


## <a id="tls" class="anchor" href="#tls">Securing Shovel Connections with TLS</a>

Shovel connections can use [TLS](./ssl.html). Because Shovel uses
client libraries under the hood, it is necessary to both configure
the source broker to [listen for TLS connections](./ssl.html)
and the Shovel to use TLS when connecting.

To configure Shovel to use TLS, one needs to

 * Specify CA certificate and client certificate/key pair, as well as other parameters (e.g. [peer verification depth](./ssl.html#peer-verification-depth)) via [URI query parameters](./uri-query-parameters.html)
 * Configure Erlang client to [use TLS](./ssl.html)


Just like with "regular" client connections, server's CA should be
[trusted](./ssl.html#peer-verification) on the node where Shovel runs, and vice versa.
The same [TLS troubleshooting methodology](./troubleshooting-ssl.html) that is recommended
for application connections applies to shovels.


## <a id="status" class="anchor" href="#status">Monitoring Shovels</a>

There are two ways of discovering the status of shovels.

### <a id="status-management" class="anchor" href="#status-management">Using Management UI</a>

Shovel status can be reported on the [Management plugin](management.html) user interface
in the administrative section.
This requires the `rabbitmq_shovel_management` plugin to be [enabled](./plugins.html)
on the node used to access management UI.


### <a id="status-cli" class="anchor" href="#status-cli">Using CLI Tools</a>

Shovel status can be obtained by direct query of the Shovel plugin app using [`rabbitmqctl`](./cli.html):

<pre class="lang-bash">
# use the -n switch to target a remote node
rabbitmqctl shovel_status
</pre>

The result will return a list of statuses, one per Shovel running.

Each element of the list is a map with several properties:

 * Name
 * Type
 * Status
 * Last state change timestamp

<table>
  <thead>
    <tr>
      <td><strong>Property</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>Name</td>
      <td>Name of the shovel</td>
    </tr>
    <tr>
      <td>Type</td>
      <td><code>static</code> for static shovels, <code>dynamic</code> for dynamic ones</td>
    </tr>
    <tr>
      <td>Status</td>
      <td>Current state of the shovel</td>
    </tr>

    <tr>
      <td>Timestamp</td>
      <td>
        Time when the shovel has last entered this state (e.g. successfully connected,
        lost connection, ran into an exception)
      </td>
    </tr>
  </tbody>
</table>

Timestamp will return a local calendar time of the form
of `{{YYYY, MM, DD}, {HH, MM, SS}}`.

Key states of a shovel are

<table>
  <thead>
    <tr>
      <td><strong>State</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>starting</td>
      <td>
        Shovel is starting or trying to connect to its configured endpoints
      </td>
    </tr>

    <tr>
      <td>running</td>
      <td>
        Shovel has successfully connected and running (consuming from the source and republishing to the destination).
        This state will report some basic endpoint and protocol information.
      </td>
    </tr>

    <tr>
      <td>terminated</td>
      <td>
        Shovel has stopped or ran into an exception. A reason will be provided.
      </td>
    </tr>
  </tbody>
</table>
