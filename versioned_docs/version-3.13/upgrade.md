---
title: Upgrading RabbitMQ
displayed_sidebar: docsSidebar
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

## Overview {#overview}

This guide covers topics related to RabbitMQ installation upgrades.

1. [An overview](#basics) of several common approaches to upgrading RabbitMQ
1. [RabbitMQ version upgradability](#rabbitmq-version-upgradability): explains what versions or series can be upgraded to what later series
1. [Erlang version requirement](#rabbitmq-erlang-version-requirement)
1. [Plugin compatibility between versions](#rabbitmq-plugins-compatibility)
1. Features [that do not support in-place upgrade](#unsupported-inplace-upgrade)
1. [Changes in system resource usage and reporting](#system-resource-usage) in the new version
1. How upgrades of [multi-node clusters](#clusters) is different from those with only a single node
1. Marking [nodes for maintenance](#maintenance-mode)
1. [Recommended upgrade steps](#recommended-upgrade-steps)
1. [Caveats](#caveats)
1. [Handling node restarts](#rabbitmq-restart-handling) in applications

See [Release Information](/release-information) to find out what RabbitMQ release series are supported.
Release notes of individual releases are [published on GitHub](https://github.com/rabbitmq/rabbitmq-server/releases).

## Important Note on Upgrading to 3.12 and 3.13

:::important
RabbitMQ 3.12 requires all previously existing feature flags to be [enabled](./feature-flags#how-to-enable-feature-flags) before the upgrade.

The upgrade will fail if you miss this step.
:::

## Basics {#basics}

There are two major upgrade scenarios that are covered in this guide: a [single node](#single-node-upgrade) and a [cluster](#multiple-nodes-upgrade),
as well as several most commonly used strategies:

 * In-place upgrade where each node is upgraded with its existing on disk data
 * [Blue-green deployment](./blue-green-upgrade) where a new cluster is created and existing data is migrated to it
 * A grow-then-shrink approach where one or more new nodes are added to the cluster, then the old nodes are eventually removed

Below is a brief overview of the common strategies. The rest of the guide covers each strategy in more detail.

The [RabbitMQ version upgradability](#rabbitmq-version-upgradability) section explains what versions or series can be upgraded to what later series.

### In-place Upgrades {#in-place}

:::tip
This upgrade strategy is recommended
:::

An in-place upgrade usually involves the following steps performed by a deployment tool or manually
by an operator. Each step is covered in more detail later in this guide. An intentionally oversimplified
list of steps would include:

 * Investigate if the current and target versions have an in-place upgrade path: check [version upgradability](#rabbitmq-version-upgradability), [Erlang version requirements](#rabbitmq-erlang-version-requirement), release notes, [features that do not support in-place upgrades](#unsupported-inplace-upgrade), and [known caveats](#caveats)
 * Check that the node or cluster is in a good state in order to be upgraded: no [alarms](./alarms) are in effect, no ongoing queue or stream replica sync operations
   and the system is otherwise under a reasonable load
 * Stop the node
 * Upgrade RabbitMQ and, if applicable, Erlang
 * Start the node
 * Watch [monitoring and health check](./monitoring) data to assess the health and recovery of the upgraded node or cluster

[Rolling upgrades](#rolling-upgrades) between certain versions are not supported. [Full Stop Upgrades](#full-stop-upgrades)
and the [Blue/Green deployment](./blue-green-upgrade) upgrade strategy cover the two options available for those cases.

### Blue-Green Deployment Upgrades

:::tip
This upgrade strategy is the safest option. It is recommended
for environments where a rolling in-place upgrade is not an option
for any reason, or extra safety is particularly important
:::

[The Blue/Green deployment](./blue-green-upgrade) strategy offers the benefit of making the upgrade process safer at the cost of
temporary increasing infrastructure footprint. The safety aspect comes from the fact that the operator
can abort an upgrade by switching applications back to the existing cluster.

### Grow-then-Shrink Upgrades

:::danger
This upgrade strategy changes replica identities, can result in massive unnecessary data transfers between
nodes, and is only safe with important precautions. Therefore, it is [highly recommended against](#grow-then-shrink).
:::

A [grow-and-shrink upgrade](#grow-then-shrink) usually involves the following steps. Consider a three node cluster with nodes
A, B, and C:

 * Add a new node, node D, to the cluster
 * Place a new replica of every quorum queue and every stream to the new node using commands such as `rabbitmq-queues grow`
 * Check that the cluster is in a good state: no [alarms](./alarms) are in effect, no ongoing queue or stream replica sync operations
   and the system is otherwise under a reasonable load
 * Remove node A from the cluster using `rabbitmqctl forget_cluster_node`
 * Add a new node, node E, to the cluster
 * Place a new replica of every quorum queue and every stream to the new node using commands such as `rabbitmq-queues grow`
 * Check that the cluster is in a good state
 * Remove node B from the cluster using `rabbitmqctl forget_cluster_node`
 * and so on

Multiple nodes can be added and removed at a time.

Similarly to [rolling upgrades](#rolling-upgrades), grow-and-shrink upgrades between certain versions are not supported.
[Full Stop Upgrades](#full-stop-upgrades) and the [Blue/Green deployment](./blue-green-upgrade) upgrade strategy cover the two options available for those cases.


## RabbitMQ Version Upgradability {#rabbitmq-version-upgradability}

All versions starting with `3.7.27` support [rolling upgrades](#rolling-upgrades) to compatible
later versions using [feature flags](./feature-flags).

A [full cluster stop](#full-stop-upgrades) may be required for feature version upgrades
but such cases are rare in modern release series thanks to feature flags.

:::important
As a rule of thumb, upgrade to the latest patch release in the target series,
and then [enable all stable feature flags](./feature-flags#how-to-enable-feature-flags)
after all cluster nodes have been upgraded.
:::

:::important
When an upgrade jumps multiple release series (e.g. goes from `3.9.x` to `3.13.x`), it may be necessary to perform
one or more intermediate upgrades first.

For each intermediary upgrade, upgrade to the latest patch release in the target series,
and then [enable all stable feature flags](./feature-flags#how-to-enable-feature-flags)
after all cluster nodes have been upgraded.
:::

When an upgrade jumps multiple release series (e.g. goes from `3.9.x` to `3.13.x`), it may be necessary to perform
one or more intermediate upgrades first. For each intermediary upgrade, upgrade to the latest patch release in the target series,
and then [enable all stable feature flags](./feature-flags#how-to-enable-feature-flags)
after all cluster nodes have been upgraded.

For example, when upgrading from `3.9.x` to `3.13.x`, it would be necessary to

1. First upgrade to the latest 3.10.x patch release
2. Then to the latest patch release of 3.11.x
3. Then to the latest patch release of 3.12.x
4. Finally, upgrade to the latest release in the 3.13.x

Don't forget to [enable all stable feature flags](./feature-flags#how-to-enable-feature-flags) every step of
the process or the follow step may fail because some feature flags have [graduated](./feature-flags#graduation) (became mandatory).

Or consider a [The Blue/Green deployment](./blue-green-upgrade) upgrade in one go.

### Release Series Upgradeability with Rolling Upgrades

Current release series upgrade compatibility with **rolling** upgrade:

| From     | To     | Notes                                                         |
|----------|--------|---------------------------------------------------------------|
| 3.12.x   | 3.13.x |                                                               |
| 3.11.18  | 3.12.x | All feature flags **must** be enabled **before** the upgrade  |
| 3.10.x   | 3.11.x | Some feature flags **must** be enabled **before** the upgrade |
| 3.9.x    | 3.10.x |                                                               |
| 3.8.x    | 3.9.x  |                                                               |
| 3.7.18   | 3.8.x  |                                                               |

### Release Series Upgradeability with Full Stop Upgrades

Current release series upgrade compatibility with **full stop** upgrade:

| From     | To     | Notes                                                        |
|----------|--------|--------------------------------------------------------------|
| 3.12.x   | 3.13.x |                                                               |
| 3.11.18  | 3.12.x | All feature flags should be enabled **before** this upgrade  |
| 3.10.x   | 3.11.x | Some feature flags should be enabled **before** this upgrade |
| 3.9.x    | 3.10.x |                                                              |
| 3.8.x    | 3.9.x  |                                                              |
| 3.7.27   | 3.9.x  |                                                              |
| 3.6.x    | 3.8.x  |                                                              |
| 3.6.x    | 3.7.x  |                                                              |
| 3.5.x    | 3.7.x  |                                                              |
| =< 3.4.x | 3.6.16 |                                                              |


## Erlang Version Requirements {#rabbitmq-erlang-version-requirement}

We recommend that you upgrade Erlang together with RabbitMQ.
Please refer to the [Erlang Version Requirements](./which-erlang) guide.


## Features that Do Not Support In-place Upgrades {#unsupported-inplace-upgrade}

[Priority queue](./priority) on disk data currently cannot be migrated in place between 3.6 and any later series.
If an upgrade is performed in place, such queues would start empty (without any messages) after node restart.

To migrate an environment with priority queues and preserve their content (messages),
a [blue-green upgrade](./blue-green-upgrade) strategy should be used.


## Plugin Compatibility Between Versions {#rabbitmq-plugins-compatibility}

Unless otherwise specified in release notes, RabbitMQ plugin API
introduces no breaking changes within a release series (e.g. between
`3.12.5` and `3.12.13`). If upgrading to a new minor or major version
(e.g. `3.13.2`), plugin must be upgraded to their versions that support
the new RabbitMQ version series.

In rare cases patch versions of RabbitMQ can break some plugin APIs.
Such cases will be documented in the breaking changes section of the release notes document.

[Community plugins page](/community-plugins) contains information on RabbitMQ
version support for plugins not included into the RabbitMQ distribution.

### Management Plugin Upgrades {#management-ui}

RabbitMQ management plugin comes with a Web application that runs in the browser.

After upgrading a cluster, it is highly recommended to clear browser cache,
local storage, session storage and cookies for the domain(s) used to access the management UI.

### Discontinued Plugins

Sometimes a new feature release drops a plugin or multiple plugins from the distribution.
For example, `rabbitmq_management_visualiser` no longer ships with RabbitMQ as of
3.7.0. Such plugins **must be disabled** before the upgrade.
A node that has a missing plugin enabled will fail to start.


## Changes in System Resource Usage and Reporting {#system-resource-usage}

Different versions of RabbitMQ can have different resource usage. That
should be taken into account before upgrading: make sure there's enough
capacity to run the workload with the new version. Always consult with
the release notes of all versions between the one currently deployed and the
target one in order to find out about changes which could impact
your workload and resource usage.


## Single Node and Cluster Upgrades {#clusters}

### Upgrading a Single Node Installation {#single-node-upgrade}

Upgrading single node installation is similar to upgrading clusters. [Feature flags](./feature-flags) should be enabled after each
upgrade (it's always a good idea to double-check by enabling them before the next upgrade as well - if they are already
enabled, it will just do nothing). You should also follow the [upgrade compatibility matrix](#rabbitmq-version-upgradability).

Client (application) connections will be dropped when the node stops. Applications need to be
prepared to handle this and reconnect.

With some distributions (e.g. the generic binary UNIX) you can install a newer version of
RabbitMQ without removing or replacing the old one, which can make upgrade faster.
You should make sure the new version [uses the same data directory](./relocate).

RabbitMQ does not support downgrades; it's strongly advised to back node's data directory up before
upgrading.

Single node deployments are often local development or test environments. In such cases, if
the upgrade involves jumping multiple release series (eg. from `3.8.15` to `3.13.2`),
it's easier to simply delete everything in the data directory and go directly
to the desired version. Effectively, it's no longer an upgrade but a fresh installation of the new version.
Please note that this process will **delete all data** in your RabbitMQ (definitions and messages), but this is usually
not a problem in a developement/test environment. The definitions can be preserved using [export/import](./definitions).

### Upgrading Multiple Nodes {#multiple-nodes-upgrade}

Depending on what versions are involved in an upgrade, RabbitMQ cluster
*may* provide an opportunity to perform upgrades without cluster
downtime using a procedure known as rolling upgrade. A rolling upgrade
is when nodes are stopped, upgraded and restarted one-by-one, with the
rest of the cluster still running while each node is being upgraded.

If rolling upgrades are not possible, the entire cluster should be
stopped, then restarted. This is referred to as a full stop upgrade.

Client (application) connections will be dropped when each node stops. Applications need to be
prepared to handle this and reconnect.

### Rolling Upgrades {#rolling-upgrades}

Rolling upgrades are possible only between compatible RabbitMQ and Erlang versions.

#### With RabbitMQ 3.8 or Later Versions {#rolling-upgrade-starting-with-3.8}

RabbitMQ provides a [feature flag](./feature-flags) subsystem which is
responsible for determining if two RabbitMQ nodes of different versions are compatible with respect
to a certain feature, important internal implementation detail or behavior.

If they are, then two nodes with different versions can run side-by-side in the
same cluster: this allows a rolling upgrade of cluster members without
shutting down the cluster entirely.

To learn more, please read the [feature flags documentation](./feature-flags).


### When to Restart Nodes {#rolling-upgrades-restarting-nodes}

It is important to let the node being upgraded to fully start and sync
all data from its peers before proceeding to upgrade the next one. You
can check for that via the management UI. Confirm that:

* the `rabbitmqctl await_startup` (or `rabbitmqctl wait <pidfile>`) command returns
* the node starts and rejoins its cluster according to the management overview page or `rabbitmq-diagnostics cluster_status`
* the node is not quorum-critical for any [quorum queues](#quorum-queues) and streams it hosts
* all classic mirrored queues have [synchronised mirrors](#mirrored-queues-synchronisation)

During a rolling upgrade, client connection recovery will make sure that connections
are rebalanced. Primary queue replicas will migrate to other nodes.
In practice this will put more load on the remaining cluster nodes.
This can impact performance and stability of the cluster.
It's not recommended to perform rolling upgrades under high load.

Nodes can be put into maintenance mode to prepare them for
shutdown during rolling upgrades. This is covered below.

### After Restarting All Nodes {#after-restarting}

After performing a rolling upgrade and putting the last node out of [maintenance mode](#maintenance-mode),
perform the following steps:

 * Enable all [feature flags](./feature-flags) in the cluster using `rabbitmqctl enable_feature_flag all`
 * Rebalance all queue and stream leader replicas with `rabbitmq-queues rebalance all`

Enabling all feature flags is **very important** for future upgrade, which may require all
feature flags from certain earlier versions to be enabled.

Rebalancing of queue and stream leader replicas helps spread the load across
all cluster nodes.


## Grow-then-Shrink Upgrades {#grow-then-shrink}

:::note
This strategy involves node identity changes and replica transfers to the newly added nodes.

With quorum queues and streams that have large data sets, this means that the cluster will
experience substantial network traffic volume and disk I/O spikes that a rolling in-place upgrade would not.

Consider using [in-place upgrades](#in-place) or [Blue/Green deployment upgrades](./blue-green-upgrade) instead.
:::

:::danger
In order to safely perform a grow-then-shrink upgrade, several precautions must be taken
:::

A Grow-then-Shrink upgrade usually involves the following steps. Consider a three node cluster with nodes
A, B, and C:

 * Add a new node, node D, to the cluster
 * Place a new replica of every quorum queue and every stream to the new node using commands such as `rabbitmq-queues grow`
 * Check that the cluster is in a good state: no [alarms](./alarms) are in effect, no ongoing queue or stream replica sync operations
   and the system is otherwise under a reasonable load
 * Remove node A from the cluster using `rabbitmqctl forget_cluster_node`
 * Add a new node, node E, to the cluster
 * Place a new replica of every quorum queue and every stream to the new node using commands such as `rabbitmq-queues grow`
 * Check that the cluster is in a good state
 * Remove node B from the cluster using `rabbitmqctl forget_cluster_node`
 * and so on

This approach may seem like one that strikes a good balance between the relative simplicity of
in-place upgrades and the safety of Blue-Green deployment upgrades. However, in practice this
strategy has comparable characteristics to the in-place upgrade option:

 * Newly added nodes may affect the existing cluster state
 * Replicas will migrate between nodes during the upgrade process

In addition, this approach has its own unique potential risks:

 * Node identities change during the upgrade process, which can affect [historical monitoring data](./monitoring/)
 * Nodes must transfer their data sets to the newly added members, which can result in a **very substantial increase
   in network traffic and disk I/O**
 * Premature removal of nodes (see below) can lead to a quorum loss for a subset of quorum queues and streams

:::danger
In order to safely perform a grow-then-shrink upgrade, several precautions must be taken
:::

In order to safely perform a grow-then-shrink upgrade, several precautions must be taken:

 * After a new node is added and a replica extension process is initiated, the process must
   be given enough time to complete
 * Before a node is removed, a health check must be run to ensure that it is not quorum critical for any queues (or streams):
   that is, that the removal of the node will not leave any quorum queues or streams without an online majority
 * Nodes must be removed from the cluster explicitly using `rabbitmqctl forget_cluster_node`

[Streams](./streams/) specifically were not designed for environments where replica (node) identity change is frequent,
and all replicas can be transferred away and replaced over duration of a single cluster upgrade.

### Key Precautions

To determine if a node is quorum critical, use the following [health check](./monitoring#health-checks):

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# exits with a non-zero status if shutting down target node would leave some quorum queues
# or streams without an online majority
rabbitmq-diagnostics check_if_node_is_quorum_critical
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# exits with a non-zero status if shutting down target node would leave some quorum queues
# or streams without an online majority
rabbitmq-diagnostics.bat check_if_node_is_quorum_critical
```
</TabItem>
</Tabs>

The following [health check](./monitoring#health-checks) must be used to determine if there may be
any remaining initial quorum queue replica log transfers:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# exits with a non-zero status if there are any ongoing initial quorum queue
# replica sync operations
rabbitmq-diagnostics check_if_new_quorum_queue_replicas_have_finished_initial_sync
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# exits with a non-zero status if there are any ongoing initial quorum queue
# replica sync operations
rabbitmq-diagnostics.bat check_if_new_quorum_queue_replicas_have_finished_initial_sync
```
</TabItem>
</Tabs>

:::tip
Consider adding and removing a single node at a time
:::

If multiple nodes are added and removed at a time, the health checks must be performed on all of them.
Removing multiple nodes at a time is more likely to leave certain quorum queues or streams without
an online majority, therefore it is highly recommended to add and remove a single node at a time.



## Maintenance Mode {#maintenance-mode}

### What is Maintenance Mode?

Maintenance mode is a special node operation mode that can be useful during upgrades.
The mode is explicitly turned on and off by the operator using a bunch of new CLI commands covered below.
For mixed-version cluster compatibility, this feature must be [enabled using a feature flag](./feature-flags)
once all cluster members have been upgraded to a version that supports it:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl enable_feature_flag maintenance_mode_status
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat enable_feature_flag maintenance_mode_status
```
</TabItem>
</Tabs>


### Put a Node into Maintenance Mode

To put a node under maintenance, use `rabbitmq-upgrade drain`:

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

As all other CLI commands, this command can be invoked against an arbitrary node (including remote ones)
using the `-n` switch:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# puts node rabbit@node2.cluster.rabbitmq.svc into maintenance mode
rabbitmq-upgrade drain -n rabbit@node2.cluster.rabbitmq.svc
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# puts node rabbit@node2.cluster.rabbitmq.svc into maintenance mode
rabbitmq-upgrade.bat drain -n rabbit@node2.cluster.rabbitmq.svc
```
</TabItem>
</Tabs>

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
of queue type and the [queue leader locator policy](./ha#leader-migration-data-locality) used.

This feature is expected to evolve based on the feedback from RabbitMQ operators, users,
and RabbitMQ core team's own experience with it.

A node in maintenance mode is expected to be shut down, upgraded or reconfigured, and restarted in a short
time window (say, 5-30 minutes). Nodes are not expected to be running in this mode permanently or
for long periods of time.

### Revive a Node from Maintenance Mode

:::tip
The command described below exists to roll back (to the extent possible) the effects of
the `drain` one mentioned above.

It is not necessary to run it after a node restart because a restarted node will reset its
maintenance mode state.
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

The command exists to roll back (to the extent possible) the effects of the `drain` one.

It is not necessary to run it after a node restart because a restarted node will reset its
maintenance mode state.

As all other CLI commands, this command can be invoked against an arbitrary node (including remote ones)
using the `-n` switch:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# revives node rabbit@node2.cluster.rabbitmq.svc from maintenance
rabbitmq-upgrade revive -n rabbit@node2.cluster.rabbitmq.svc
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# revives node rabbit@node2.cluster.rabbitmq.svc from maintenance
rabbitmq-upgrade.bat revive -n rabbit@node2.cluster.rabbitmq.svc
```
</TabItem>
</Tabs>

When a node is revived or restarted (e.g. after an upgrade), it will again accept client connections
and be considered for primary queue replica placements.

It will not recover previous client connections as RabbitMQ never initiates connections
to clients, but clients will be able to reconnect to it.

### Verify Maintenance Status of a Node

If the maintenance mode status feature flag is enabled, node maintenance status will be reported
in `rabbitmq-diagnostics status` and `rabbitmq-diagnostics cluster_status`.

Here's an example `rabbitmq-diagnostics status` output of a node under maintenance:

```
Status of node rabbit@hostname ...
Runtime

OS PID: 25531
OS: macOS
Uptime (seconds): 48540
Is under maintenance?: true

# ...
```

Compare this to this example output from a node in regular operating mode:

```
Status of node rabbit@hostname ...
Runtime

OS PID: 25531
OS: macOS
Uptime (seconds): 48540
Is under maintenance?: false

# ...
```


## Full-Stop Upgrades {#full-stop-upgrades}

When an entire cluster is stopped for upgrade, the order in which nodes are
stopped and started is important.

RabbitMQ will automatically update its data directory
if necessary when upgrading between major or minor versions.
In a cluster, this task is performed by the first disc node to be started
(the "upgrader" node).

When upgrading a RabbitMQ cluster using the "full stop" method,
a node with stable durable storage must start first.

During an upgrade, the last disc node to go down must be the first node to
be brought online. Otherwise the started node will emit an error message and
fail to start up. Unlike an ordinary cluster restart, upgrading nodes will not wait
for the last disc node to come back online.

While not strictly necessary, it is a good idea to decide ahead of time
which disc node will be the upgrader, stop that node last, and start it first.
Otherwise changes to the cluster configuration that were made between the
upgrader node stopping and the last node stopping will be lost.


## Recommended Upgrade Steps {#recommended-upgrade-steps}

### Understand What the Most Recent Release Is

 See [Release Information](/release-information) to find out what the most recent
 available version is.

 Upgrading to the oldest series is highly recommended.


### Carefully Read the Release Notes Up to the Selected RabbitMQ Version

The release notes may indicate specific additional upgrade steps.
Always consult with the release notes of all versions between the
one currently deployed and the target one.


### Enable Required Feature Flags Before Attempting the Upgrade

Some versions, such as 3.11 and 3.12, [require some or all previously existing feature flags](./feature-flags#core-feature-flags)
to be enabled **before** the upgrade. If all feature flags were enabled after the
previous upgrade, this should already be the case. However, it's better to verify
the state of feature flags with

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl list_feature_flags --formatter=pretty_table
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat list_feature_flags --formatter=pretty_table
```
</TabItem>
</Tabs>


and enable all feature flags with

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl enable_feature_flag all
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat enable_feature_flag all
```
</TabItem>
</Tabs>

Repeat these steps [at the end of the upgrade process](#enable-ff-after-upgrade)
to fully take advantage of the new features and be prepared for the next upgrade in the future.

### Check Currently Used RabbitMQ Version

Some upgrade paths, e.g. from 3.10.x to 3.13.x, will require an intermediate upgrade
or even multiple intermediate upgrades.

See the [RabbitMQ Version Upgradability](#rabbitmq-version-upgradability) section above.


### Check Erlang Version Requirements

Check if the current Erlang version is supported by the new RabbitMQ version.
See the [Erlang Version Requirements](./which-erlang) guide.
If not, Erlang should be upgraded together with RabbitMQ.

It's generally recommended to upgrade to the latest Erlang version supported to
get all the latest bugfixes.

### Make Sure All Package Dependencies (including Erlang) are Available.

If you are using Debian or RPM packages, you must ensure
that all dependencies are available. In particular, the
correct version of Erlang. You may have to setup additional
third-party package repositories to achieve that.

Please read recommendations for
[Debian-based](./which-erlang#debian) and
[RPM-based](./which-erlang#redhat) distributions to find the
appropriate repositories for Erlang.

### If running RabbitMQ in a cluster, select the cluster upgrade strategy.

It can be possible to do a rolling upgrade,
if Erlang version and RabbitMQ version changes support it.

See the [Upgrading Multiple Nodes](#multiple-nodes-upgrade) section above.

### Assess Cluster Health

Make sure nodes are healthy and there are no [network partition](./partitions) or [disk or memory alarms](./alarms) in effect.

RabbitMQ management UI, CLI tools or HTTP API can be used for
assessing the health of the system.

The overview page in the management UI displays effective RabbitMQ
and Erlang versions, multiple cluster-wide metrics and rates. From
this page ensure that all nodes are running and they are all "green"
(w.r.t. file descriptors, memory, disk space, and so on).

We recommend recording the number of durable queues, the number
of messages they hold and other pieces of information about the
topology that are relevant. This data will help verify that the
system operates within reasonable parameters after the upgrade.

Use [node health checks](./monitoring#health-checks) to
vet individual nodes.

Queues in flow state or blocked/blocking connections might be ok,
depending on your workload. It's up to you to determine if this is
a normal situation or if the cluster is under unexpected load and
thus, decide if it's safe to continue with the upgrade.

However, if there are queues in an undefined state (a.k.a. `NaN` or
"ghost" queues), you should first start by understanding what is
wrong before starting an upgrade.

### Ensure Cluster Has the Capacity for Upgrading

The upgrade process can require additional resources.
Make sure there are enough resources available to proceed, in particular free
memory and free disk space.

It's recommended to have at least half of the system memory free
before the upgrade. Default memory watermark is 0.4 so it should be
ok, but you should still double-check. Starting with RabbitMQ `3.6.11`
the way nodes [calculate their total RAM consumption](./memory-use) has changed.

When upgrading from an earlier version,
it is required that the node has enough free disk space to fit at
least a full copy of the node data directory. Nodes create backups
before proceeding to upgrade their database. If disk space is
depleted, the node will abort upgrading and may fail to start
until the data directory is restored from the backup.

For example, if you have 10 GiB of free system memory and the Erlang
process (i.e. `beam.smp`) memory footprint is around 6 GiB, then it
can be unsafe to proceed. Likewise w.r.t. disk if you have 10 GiB of
free space and the data directory (e.g. `/var/lib/rabbitmq`) takes
10 GiB.

When upgrading a cluster using the rolling upgrade strategy,
be aware that queues and connections can migrate to other nodes
during the upgrade.

If queues are mirrored to a subset of the cluster only (as opposed
to all nodes), new mirrors will be created on running nodes when
the to-be-upgraded node shuts down. If clients support connections
recovery and can connect to different nodes, they will reconnect
to the nodes that are still running. If clients are configured to create
exclusive queues, these queues might be recreated on different nodes
after client reconnection.

To handle such migrations, make sure you have enough
spare resources on the remaining nodes so they can handle the extra load.
Depending on the load balancing strategy all the connections from
the stopped node can go to a single node, so it should be able to
handle up to twice as many.
It's generally a good practice to run a cluster with N+1 redundancy
(resource-wise), so you always have a capacity to handle a single
node being down.

### Take a Backup

It's always good to have a backup before upgrading.
See [backup](./backup) guide for instructions.

To make a proper backup, you may need to stop the entire cluster.
Depending on your use case, you may make the backup while the
cluster is stopped for the upgrade.


### Perform the Upgrade

It's recommended to upgrade Erlang version together with RabbitMQ, because both
actions require restart and recent RabbitMQ work better with recent Erlang.

Depending on cluster configuration, you can use either [single node upgrade](#single-node-upgrade),
[rolling upgrade](#multiple-nodes-upgrade) or [full-stop upgrade](#full-stop-upgrades) strategy.

### Verify that the Upgrade Has Succeeded

Like you did before the upgrade, verify the health and [monitoring data](./monitoring/) to
make sure all cluster nodes are in good shape and the service is
running again.

### Enable New Feature Flags {#enable-ff-after-upgrade}

If the new version provides new feature flags, you should
now enable them if you upgraded all nodes and you are
sure you do not want to rollback. See the [feature flags guide](./feature-flags).



## Caveats {#caveats}

There are some minor things to consider during upgrade process when stopping and
restarting nodes.

### Known Erlang OTP Bugs that Can Affect Upgrades {#otp-bugs}

There are currently no known bugs in the [supported Erlang series](./which-erlang) that can affect upgrades.

### Quorum Queues {#quorum-queues}

[Quorum queues](./quorum-queues) depend on a [quorum](./quorum-queues#what-is-quorum) of nodes to
be online for any queue operations to succeed. This includes successful new leader election should
a cluster node that hosts some leaders shut down.

In the context of rolling upgrades, this means that a quorum of nodes must be present at all times
during an upgrade. If this is not the case, quorum queues will become unavailable and will be not
able to satisfy their data safety guarantees.

Latest RabbitMQ releases provide a [health check](./monitoring#health-checks) command that would fail
should any quorum queues on the target node lose their quorum in case the node was to be shut down:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# Exits with a non-zero code if one or more quorum queues will lose online quorum
# should target node be shut down
rabbitmq-diagnostics check_if_node_is_quorum_critical
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# Exits with a non-zero code if one or more quorum queues will lose online quorum
# should target node be shut down
rabbitmq-diagnostics.bat check_if_node_is_quorum_critical
```
</TabItem>
</Tabs>

For example, consider a three node cluster with nodes A, B, and C. If node B is currently down
and there are quorum queues having their leader replica on node A, this check will fail if executed
against node A. When node B comes back online, the same check would succeed because
the quorum queues with leader on node A would have a quorum of replicas online.

Quorum queue quorum state can be verified by listing queues in the management UI or using `rabbitmq-queues`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmq-queues -n rabbit@to-be-stopped quorum_status <queue name>
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmq-queues.bat -n rabbit@to-be-stopped quorum_status <queue name>
```
</TabItem>
</Tabs>

### Mirrored Queues Replica Synchronisation {#mirrored-queues-synchronisation}

:::danger
This section covers a feature that had been [**deprecated since 2021**](https://blog.rabbitmq.com/posts/2021/08/4.0-deprecation-announcements/)
and [**was removed completely**](https://github.com/rabbitmq/rabbitmq-server/pull/9815) for the next major series, RabbitMQ 4.x.
:::

:::important
[Quorum queues](./quorum-queues) and/or [streams](./streams) should be used instead of mirrored classic queues.
**Non-replicated** classic queues continue being supported and developed.
:::

In environments that use [classic mirrored queues](./ha) (a **deprecated feature removal for RabbitMQ 4.0**),
it is important to make sure that all mirrored queues on a node
have a synchronised follower replica (mirror) **before stopping that node**.

RabbitMQ will not promote unsynchronised queue mirrors on controlled queue leader shutdown when
[default promotion settings](./ha#promotion-while-down) are used.
However if a queue leader encounters any errors during shutdown, an [unsynchronised queue mirror](./ha#unsynchronised-mirrors)
might still be promoted. It is generally safer option to synchronise all classic mirrored queues
with replicas on a node before shutting the node down.

RabbitMQ 3.13.x series provides a [health check](./monitoring#health-checks) command that would fail
should any classic mirrored queues on the target node have no synchronised mirrors:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
## IMPORTANT: classic queue mirroring, together with this health checks, were REMOVED for RabbitMQ 4.0.
#
# Exits with a non-zero code if target node hosts leader replica of at least one queue
# that has out-of-sync mirror.
rabbitmq-diagnostics check_if_node_is_mirror_sync_critical
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
## IMPORTANT: classic queue mirroring, together with this health checks, were REMOVED for RabbitMQ 4.0.
#
# Exits with a non-zero code if target node hosts leader replica of at least one queue
# that has out-of-sync mirror.
rabbitmq-diagnostics.bat check_if_node_is_mirror_sync_critical
```
</TabItem>
</Tabs>

For example, consider a three node cluster with nodes A, B, and C. If there are classic mirrored queues
with the only synchronised replica on node A (the leader), this check will fail if executed
against node A. When one of other replicas is re-synchronised, the same check would succeed because
there would be at least one replica suitable for promotion.

Classic mirrored queue replica state can be verified by listing queues in the management UI or using `rabbitmqctl`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# For queues with non-empty `mirror_pids`, you must have at least one
# `synchronised_mirror_pids`.
#
# Note that mirror_pids is a new field alias introduced in RabbitMQ 3.11.4
rabbitmqctl -n rabbit@to-be-stopped list_queues --local name mirror_pids synchronised_mirror_pids
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# For queues with non-empty `mirror_pids`, you must have at least one
# `synchronised_mirror_pids`.
#
# Note that mirror_pids is a new field alias introduced in RabbitMQ 3.11.4
rabbitmqctl.bat -n rabbit@to-be-stopped list_queues --local name mirror_pids synchronised_mirror_pids
```
</TabItem>
</Tabs>

If there are unsynchronised queues, either enable
automatic synchronisation or [trigger it using `rabbitmqctl`](./ha#unsynchronised-mirrors) manually.

RabbitMQ shutdown process will not wait for queues to be synchronised
if a synchronisation operation is in progress.

### Mirrored queue leaders rebalancing {#mirrored-queue-masters-rebalance}

Some upgrade scenarios can cause mirrored queue leaders to be unevenly distributed
between nodes in a cluster. This will put more load on the nodes with more queue leaders.
For example a full-stop upgrade will make all queue leaders migrate to the "upgrader" node -
the one stopped last and started first.
A rolling upgrade of three nodes with two mirrors will also cause all queue leaders to be on the same node.

You can move a queue leader for a queue using a temporary [policy](./parameters) with
`ha-mode: nodes` and `ha-params: [<node>]`
The policy can be created via management UI or rabbitmqctl command:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl set_policy --apply-to queues --priority 100 move-my-queue '^<queue>$;' '{"ha-mode":"nodes", "ha-params":["<new-leader-node>"]}'
rabbitmqctl clear_policy move-my-queue
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat set_policy --apply-to queues --priority 100 move-my-queue '^<queue>$;' '{"ha-mode":"nodes", "ha-params":["<new-leader-node>"]}'
rabbitmqctl.bat clear_policy move-my-queue
```
</TabItem>
</Tabs>

A [queue leader rebalancing script](https://github.com/rabbitmq/support-tools/blob/main/scripts/rebalance-queue-masters)
is available. It rebalances queue leaders for all queues.

The script has certain assumptions (e.g. the default node name) and can fail to run on
some installations. The script should be considered
experimental. Run it in a non-production environment first.

A [queue leader rebalance command](./man/rabbitmq-queues.8) is available. It rebalances queue leaders for all queues, or those that match the given name pattern. queue leaders for mirrored queues and leaders for quorum queues are also rebalanced in the [post-upgrade command](./man/rabbitmq-upgrade.8).

There is also a [third-party plugin](https://github.com/Ayanda-D/rabbitmq-queue-master-balancer)
that rebalances queue leaders. The plugin has some additional configuration and reporting tools,
but is not supported or verified by the RabbitMQ team. Use at your own risk.


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


## Windows {#windows-upgrade-caveats}

If the value of the environment variable `COMPUTERNAME` does not equal
`HOSTNAME` (upper vs lower case, or other differences) please see the [Windows Configuration guide](./windows-configuration#computername-vs-hostname)
for instructions on how to upgrade RabbitMQ.
