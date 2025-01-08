---
title: Grow-then-Shrink Upgrade
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

:::note
This strategy involves node identity changes and replica transfers to the newly added nodes.

With quorum queues and streams that have large data sets, this means that the cluster will
experience substantial network traffic volume and disk I/O spikes that a rolling in-place upgrade would not.

Consider using [in-place upgrades](./upgrade#rolling-upgrade) or [Blue/Green
deployment upgrades](./blue-green-upgrade) instead.
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

 * Node identities change during the upgrade process, which can affect [historical monitoring data](./monitoring)
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

[Streams](./streams) specifically were not designed for environments where replica (node) identity change is frequent,
and all replicas can be transferred away and replaced over duration of a single cluster upgrade.

### Key Precautions

To determine if a node is quorum critical, use the following [health check](./monitoring#health-checks):

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

