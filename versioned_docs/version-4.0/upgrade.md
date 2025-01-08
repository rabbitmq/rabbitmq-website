---
title: Upgrading RabbitMQ
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Upgrading RabbitMQ

:::important
You can only upgrade to RabbitMQ 4.0 from RabbitMQ 3.13.

Moreover, [stable feature flags have to be
enabled](./feature-flags#how-to-enable-feature-flags) **before** the upgrade.
The upgrade will fail if you miss this step.

Note that the `khepri_db` feature flag must not be enabled in 3.13.x because it
was experimental and unsupported. If a 3.13.x node or cluster has `khepri_db`
enabled, upgrading to 4.x is not possible. In this case, the solution is to use
a [blue-green deployment](./blue-green-upgrade) to migrate to RabbitMQ 4.x.
:::

## Upgrade Strategies {#strategies}

There are three major upgrade strategies that can be used with RabbitMQ. Below you'll find a brief overview
of all of them. Each strategy has a dedicated page with more detailed information.

### Rolling (in-place) Upgrade {#rolling-upgrade}

:::tip
This upgrade strategy is recommended
:::

A rolling upgrade (also referred to as in-place upgrade) is an upgrade process where nodes are upgraded one by one.
Refer to the [rolling upgrade guide](./rolling-upgrade) page for more details, but here are the main steps:

* Investigate if the current and target versions have a rolling upgrade path
  * check [version upgradability](#rabbitmq-version-upgradability)
  * check [Erlang version requirements](#rabbitmq-erlang-version-requirement)
  * check [the release notes](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.0)
  * verify that all [stable feature flags are enabled](./feature-flags#how-to-enable-feature-flags)
* Check that the node or cluster is in a good state in order to be upgraded
  * no [alarms](./alarms) are in effect
  * no ongoing queue or stream replica sync operations
  * the system is otherwise under a reasonable load
* For each node
  * stop the node
  * upgrade RabbitMQ and, if applicable, Erlang
  * start the node
  * watch [monitoring and health check](./monitoring) data to assess the health and recovery of the upgraded node and cluster
* Once all nodes are upgraded, [enable stable feature flags](./feature-flags#how-to-enable-feature-flags) introduced in the new version

### Blue-Green Deployment

:::tip
This upgrade strategy is the safest option. It is recommended
for environments where a rolling upgrade is not an option
for any reason, or extra safety is particularly important
:::

[The Blue/Green deployment](./blue-green-upgrade) strategy offers the benefit of making the upgrade process safer at the cost of
temporary increasing infrastructure footprint. The safety aspect comes from the fact that the operator
can abort an upgrade by switching applications back to the old cluster.

A blue-green upgrade usually involves the following steps performed by a deployment tool or manually
by an operator. Refer to the [blue-green deployment guide](./blue-green-upgrade) for more details about these steps:

* Deploy a new cluster with the desired version
* Synchronize metadata between the old and the new cluster (unless applications can declare their own metadata)
* Set up federation
* Switch consumers to the new cluster
* Drain messages
* Switch publishers to the new cluster
* Decommission the old cluster

There's also a simplfied version of the blue-green strategy, if some downtime is acceptable:

* Deploy a new cluster with the target version
* Stop the applications
* Synchronize metadata between the old and new clusters
* Move all messages from the old cluster to the new one (e.g. using [Shovel](./shovel))
* Reconfigure applications to use the new cluster
* Start publishers and consumers

### Grow-then-Shrink Upgrade

:::danger
This upgrade strategy changes replica identities, can result in massive
unnecessary data transfers between nodes, and is only safe with important
precautions. Therefore, it is [highly recommended
against](./grow-then-shrink-upgrade).
:::

A [grow-and-shrink upgrade](./grow-then-shrink-upgrade) usually involves the
following steps. Consider a three node cluster with nodes A, B, and C:

* Investigate if the current and target versions can be clustered together
  * check [version upgradability](#rabbitmq-version-upgradability); if a rolling upgrade between the old and new version is not supported,
    that also means that these two versions cannot coexist in a single cluster
  * check [Erlang version requirements](#rabbitmq-erlang-version-requirement)
  * check [the release notes](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.0)
 * Add a new node, node D, to the cluster (note, you may need to [start the node with feature flags disabled](feature-flags#how-to-start-new-node-disabled-feature-flags)
   for node D to be able to join the cluster)
 * Place a new replica of every quorum queue and every stream on the new node
* Check that the node or cluster is in a good state
  * no [alarms](./alarms) are in effect
  * no ongoing queue or stream replica sync operations
  * the system is otherwise under a reasonable load
 * Remove node A from the cluster using `rabbitmqctl forget_cluster_node`
* Repeat the steps above for the other nodes; in a 3-node cluster example, the cluster should now consist of nodes D, E and F
* [Enable stable feature flags](./feature-flags#how-to-enable-feature-flags) introduced in the new version

Multiple nodes can be added and removed at a time.


## RabbitMQ Version Upgradability {#rabbitmq-version-upgradability}

You can only upgrade to RabbitMQ 4.0 from RabbitMQ 3.13.x.

Don't forget to [enable all stable feature flags](./feature-flags#how-to-enable-feature-flags) while still on 3.13,
**before** attempting an upgrade to RabbitMQ 4.0, or the upgrade will fail.

If you are not on RabbitMQ 3.13 yet, refer to the table below to understand your upgrade path.

<details>
  <summary>Release Series Upgradeability</summary>

The following shows the supported upgrade paths.

| From     | To     | Notes                                                         |
|----------|--------|---------------------------------------------------------------|
| 3.13.x   | 4.0.x  | All stable feature flags **must** be enabled **before** the upgrade  |
| 3.12.x   | 3.13.x |                                                               |
| 3.11.18  | 3.12.x | All feature flags **must** be enabled **before** the upgrade  |
| 3.10.x   | 3.11.x | All feature flags **must** be enabled **before** the upgrade  |
| 3.9.x    | 3.10.x |                                                               |
| 3.8.x    | 3.9.x  |                                                               |
| 3.7.18   | 3.8.x  |                                                               |
</details>

:::note
RabbitMQ 3.13 included experimental support for Khepri. However, major changes
had to be introduced since then, leading to incompatibilities between Khepri support
in 3.13 and 4.0. Therefore, RabbitMQ 3.13 with Khepri enabled **cannot** be upgraded
to 4.0. [Blue-Green Deployment](./blue-green-upgrade) can still be used in this situation,
since technically it is not an upgrade, but rather a migration to a fresh cluster.
:::

## Erlang Version Requirements {#rabbitmq-erlang-version-requirement}

Please refer to the [Erlang Version Requirements](./which-erlang) guide
to learn the minimum required and maximum supported version of Erlang for a given RabbitMQ version.

It's generally recommended to use the latest Erlang version supported by the target RabbitMQ version.

We recommend that you upgrade Erlang together with RabbitMQ.

## Plugin Compatibility Between Versions {#rabbitmq-plugins-compatibility}

Plugins included in the RabbitMQ distribution are guaranteed to be compatible with the
version they are distributed with. If [community plugins](/community-plugins) are used,
they need to be verified separately.

### Management Plugin Upgrades {#management-ui}

RabbitMQ management plugin comes with a Web application that runs in the browser.

After upgrading a cluster, it is highly recommended to clear browser cache,
local storage, session storage and cookies for the domain(s) used to access the management UI.
Otherwise, you may experience JavaScript errors.


## Upgrade Considerations

### Changes in System Resource Usage {#system-resource-usage}

During and after the upgrade, connections and queues will be balanced
differently between the nodes: as nodes go down, connections
will be reestablished on the remaining nodes and queue leaders will be reelected.
It is important to make sure your cluster can sustain the workload while some,
usually one, node is down for the upgrade. Performing the upgrade during low
traffic hours is recommended.

Additionally, different versions of RabbitMQ can have different resource usage. That
should be taken into account before upgrading: make sure there's enough
capacity to run the workload with the new version. Always consult with
the release notes of all versions between the one currently deployed and the
target one in order to find out about changes which could impact
your workload and resource usage.

### Upgrading a Single Node Installation {#single-node-upgrade}

There are no fundamental differences between upgrading a single node installation compared
to upgrading a multi-node cluster.

#### Upgrading Development Environments {#upgrading-dev-environments}

Single node deployments are often local development or test environments. In such cases, if
the messages stored in RabbitMQ are not important, it may be easier to simply
delete everything in the data directory and start a fresh node of the new version. Effectively,
it's no longer an upgrade but a fresh installation of the new version.

Please note that this process will **delete all data** in your RabbitMQ (definitions and messages), but this is usually
not a problem in a development/test environment. The definitions can be preserved using [export/import](./definitions).
The benefit of this approach is that you can easily jump from any version to any other version without worrying
about compatibility and feature flags.

### Downgrades

RabbitMQ does not officially support downgrades - they are not tested and should not be relied upon.
Users who want extra safety can use [blue-green deployment](./blue-green-upgrade) approach,
which allows switching back to the old environment.

Having said that, downgrades technically work between some versions, especially if they only differ by a patch release.
It is not guaranteed however: there have been patch releases that could not be downgraded even to the immediately
preceding patch release.

### Backup

It's strongly advised to back node's data directory up before upgrading.

### When to Restart Nodes {#maintaining-quorum}

Multiple components and features depend on the availability of a quorum of nodes. In the most common
case of a 3-node cluster, this means that 2 nodes should always be available during the upgrade.

RabbitMQ provides a [health check](./monitoring#health-checks) command that would fail
should any quorum queues, stream queues or other internal components on the target node lose their quorum, if that node was to be shut down:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# exits with a non-zero code if any of the internal components, quorum queues or stream queues
# will lose online quorum should the target node be shut down;
# additionally, it will print which components and/or queues are affected
rabbitmq-diagnostics check_if_node_is_quorum_critical
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# exits with a non-zero code if any of the internal components, quorum queues or stream queues
# will lose online quorum should the target node be shut down;
# additionally, it will print which components and/or queues are affected
rabbitmq-diagnostics.bat check_if_node_is_quorum_critical
```
</TabItem>
</Tabs>

For example, consider a three node cluster with nodes A, B, and C and some quorum queues. If node B is currently down,
this check will fail if executed against node A or C, because if A or C went down, there would only be one node running
(and therefore, there would be no quorum). When node B comes back online, the same check would succeed.

When automating the upgrade process, you can use `rabbitmq-upgrade await_online_quorum_plus_one` command
to block the node shutdown process until there is enough nodes running to maintain quorum. Note that
some deployment options already incorporate this check - for example, when running RabbitMQ on Kubernetes
using the [Cluster Operator](/kubernetes/operator/operator-overview), this is already a part of the `preStop` hook.

### Rebalancing Queue Leaders {#rebalance}

If either the rolling or grown-then-shrink upgrade strategy is used, queue leaders will not be evenly distributed
between the nodes after the upgrade. Rebalancing of queue and stream leaders helps spread the load across all cluster nodes.

To rebalance all queue and stream leader replicas, run:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmq-queues rebalance all
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmq-queues.bat rebalance all
```
</TabItem>
</Tabs>

### Full-Stop Upgrades {#full-stop-upgrades}

There is no need to stop all nodes in a cluster to perform an upgrade.

## Maintenance Mode {#maintenance-mode}

Maintenance mode is a special node operation mode that can be useful during upgrades.
The mode is explicitly turned on and off by the operator using a bunch of new CLI commands covered below.

When a node is in maintenance mode, it **will not be available for serving client traffic**
and will try to transfer as many of its responsibilities as practically possible and safe.

Currently this involves the following steps:

* Suspend all client connection listeners (no new client connections will be accepted)
* Close all existing client connections: applications are expected to reconnect to other nodes and recover
* Transfer primary replicas of all quorum queues hosted on the target node, and prevent them from participating
    in the subsequently triggered Raft elections
* Mark the node as down for maintenance
* At this point, a node shutdown will be least disruptive as the node has already transferred most of its
    responsibilities

A node in maintenance mode will not be considered for new primary queue replica placement, regardless
of queue type and whether the queue type supports replication.

This feature is expected to evolve based on the feedback from RabbitMQ operators, users,
and RabbitMQ core team's own experience with it.

A node in maintenance mode is expected to be shut down, upgraded or reconfigured, and restarted in a short
time window (say, 5-30 minutes). Nodes are not expected to be running in this mode permanently or
for long periods of time.

### Enabling Maintenance Mode

To put a node into maintenance, use `rabbitmq-upgrade drain`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmq-upgrade drain
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmq-upgrade.bat drain
```
</TabItem>
</Tabs>

### Disabling Maintenance Mode

:::tip
A restart takes the node out of maintenance mode automatically.
:::

A node in maintenance mode can be *revived*, that is, **brought back into its regular operational state**,
using `rabbitmq-upgrade revive`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmq-upgrade revive
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmq-upgrade.bat revive
```
</TabItem>
</Tabs>

The command exists to roll back (to the extent possible) the effects of the `drain` command.
It is only necessary to run this command if you decided you can't restart the node as planned. 

It is **not** necessary to revive a node after it was restarted/upgraded, because the restart
automatically takes the node out of maintenance mode.

### Checking Maintenance Status

You can check whether any of the nodes in the cluster is in the maintenance mode
by running `rabbitmqctl cluster_status`. You can also check the status of a specific
node by running `rabbitmqctl status`.

## Handling Node Restarts in Applications {#rabbitmq-restart-handling}

In order to reduce or eliminate the downtime, applications (both producers
and consumers) should be able to cope with a server-initiated connection
close. Some client libraries offer automatic connection recovery
to help with this:

* [Java client](/client-libraries/java-api-guide#recovery)
* [.NET client](/client-libraries/dotnet-api-guide#connection-recovery)
* [Bunny](http://rubybunny.info/articles/error_handling.html#network_connection_failures) (Ruby)

In most client libraries there is a way to react to a connection closure, for example:

* [Pika](https://pika.readthedocs.io/en/stable/modules/connection.html#pika.connection.Connection.add_on_close_callback) (Python)
* [Go](https://pkg.go.dev/github.com/rabbitmq/amqp091-go#Connection.NotifyClose)

The recovery procedure for many applications follows the same steps:

1. Reconnect
2. Re-open channels
3. Restore channel settings (e.g. the [`basic.qos` setting](./confirms), publisher confirms)
4. Recover topology

Topology recovery includes the following actions, performed for every channel:

1. Re-declare exchanges declared by the application
2. Re-declare queues
3. Recover bindings (both queue and [exchange-to-exchange](./e2e) ones)
4. Recover consumers

This algorithm covers the majority of use cases and is what the
aforementioned automatic recovery feature implements.

During a rolling upgrade when a node is stopped, clients connected to this node
will be disconnected using a server-sent `connection.close` method and should reconnect to a different node.
This can be achieved by using a load balancer or proxy in front of the cluster
or by specifying multiple server hosts if client library supports this feature.

Many client libraries libraries support host lists, for example:

* [Java client](https://rabbitmq.github.io/rabbitmq-java-client/api/current/com/rabbitmq/client/ConnectionFactory.html#newConnection%28com.rabbitmq.client.Address%5B%5D%29)
* [.NET client](https://github.com/rabbitmq/rabbitmq-dotnet-client/blob/main/projects/RabbitMQ.Client/client/api/ConnectionFactory.cs#L392)
* [Bunny](http://api.rubybunny.info/Bunny/Session.html#constructor_details)


