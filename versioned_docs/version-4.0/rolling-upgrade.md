---
title: Rolling (in-place) Upgrade
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

Rolling upgrade is a popular upgrade strategy, in which nodes are upgraded
one by one: each node is stopped, upgraded and then started. Upgraded nodes rejoin the cluster,
which temporarily works in a mixed-version mode: some nodes run the old version, some run the new one.

While all nodes have to be restarted during the upgrade, the
cluster as a whole remains available throughout the process
(unless it only has one node, of course).

:::important
Rolling upgrades don't support skipping versions, except patch releases (for example you **can** upgrade directly
from 3.13.0 to 3.13.7 but you **cannot** upgrade directly from 3.12.x to 4.0). Moreover, for specific upgrades,
additional constraints may apply. Please refer to the [version upgradability](./upgrade#rabbitmq-version-upgradability) table for more information.
:::

## Before the Upgrade {#before}

### Investigate if the current and target versions have a rolling upgrade path

Please refer to the [version upgradability](./upgrade#rabbitmq-version-upgradability) table for information
about the supported upgrade paths.

### Check Erlang Version Requirements

Refer to [Erlang Version Requirements](./upgrade#rabbitmq-erlang-version-requirement).

If the same Erlang version is supported by both the current and target RabbitMQ versions,
you can leave Erlang as is. However, you can consider upgrading Erlang to the latest
supported version at the same time. Both Erlang and RabbitMQ upgrades require a restart,
so it may be more convenient to do both at the same time.

If the target RabbitMQ version requires a newer Erlang version,
you need to prepare to upgrade Erlang together with RabbitMQ.

### Carefully Read the Release Notes Up to the Selected RabbitMQ Version

The [release notes](https://github.com/rabbitmq/rabbitmq-server/releases)
may indicate specific additional upgrade steps. Always consult the release notes
of all versions between the one currently deployed and the target one.

### Verify All Stable Feature Flags Are Enabled

[All stable feature flags should be enabled](./feature-flags#how-to-enable-feature-flags) after each upgrade.
Otherwise, the upgrade process is not really complete, since some of the changes are not effective.
If you follow this advice, there should be nothing to do with regards to the feature flags before the upgrade,
since they were all enabled after the previous upgrade.

However, since attempting an upgrade with disabled feature flags may lead to serious issues, it's a good
practice to check if all stable feature flags are enabled before starting the upgrade. You can safely
run `rabbitmqctl enable_feature_flag all` - it will do nothing if all flags are already enabled.

### Make Sure All Package Dependencies (including Erlang) are Available

If you are using Debian or RPM packages, you must ensure
that all dependencies are available. In particular, the
correct version of Erlang. You may have to setup additional
third-party package repositories to achieve that.

Please read recommendations for
[Debian-based](./which-erlang#debian) and
[RPM-based](./which-erlang#redhat) distributions to find the
appropriate repositories for Erlang.

### Assess Cluster Health

Make sure nodes are healthy and there are no [network partition](./partitions)
or [disk or memory alarms](./alarms) in effect.

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

Queues in flow state or blocked/blocking connections might not be a problem,
depending on your workload. It's up to you to determine if this is
a normal situation or if the cluster is under unexpected load and
thus, decide if it's safe to continue with the upgrade.

However, if there are queues in an undefined state (a.k.a. `NaN` or
"ghost" queues), you should first start by understanding what is
wrong before starting an upgrade.

### Ensure Cluster Has the Capacity for Upgrading

Please refer to [changes in system resource usage](./upgrade#system-resource-usage)
for information about how the upgrade process can affect resource usage.

## Perform the Upgrade

The main part of the upgrade process is performed by stopping, upgrading and starting each node one by one.
The following steps should be performed for all nodes.

### Stop the Node

The exact way to stop a node depends on how it was started.

### Take a Backup

Optionally, when the node is stopped, you can [backup](./backup) its data folder.

### Upgrade the Node

Install the new version of RabbitMQ and other packages if necessary.

Make sure you have an Erlang version compatible with the new RabbitMQ version.

### Start the Node

Start the node and verify that it joins the cluster.

You can perform the following checks to ensure that the node started and rejoined
the cluster successfully:

* run `rabbitmqctl cluster_status` and verify the output
  * the upgraded node should be listed as running
  * there should be no network partitions nor active alarms
* check the management UI
  * all nodes should be listed on the main page
  * resource usage should be within acceptable limits
* check the logs
  * there should be no errors

## After the Upgrade {#after}

### Verify that the Upgrade Has Succeeded

Like you did before the upgrade, verify the health and [monitoring data](./monitoring) to
make sure all cluster nodes are in good shape and the service is running again.

### Enable New Feature Flags {#enable-ff-after-upgrade}

Once all the nodes are upgraded and the cluster is healthy,
[enable all stable feature flags](./feature-flags#how-to-enable-feature-flags).
If the new version doesn't provide any new feature flags, you can still run
`rabbitmqctl enable_feature_flag all` - it will simply do nothing.

## Real-world Example {#example}

Rolling upgrade strategy is not specific to any particular deployment tooling
or infrastructure. Many orchestration tools have a built-in concept of rolling upgrades
with hooks allowing to perform custom actions before and after each node is upgraded.

One such orchestration tool is Kubernetes. It can perform a [rolling update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#rolling-update)
of a `StatefulSet`. Let's walk through what happens when you want to upgrade RabbitMQ
deployed to Kubernetes using the [Cluster Operator](/kubernetes/operator/operator-overview).
Let's assume the cluster has three nodes, which means the nodes are called `server-0`, `server-1`, and `server-2`
(there would be a prefix with the name of your cluster, but that's irrelevant for this example).

1. Make sure the existing cluster is running RabbitMQ 3.13 and has all stable feature flags enabled
1. Update the `RabbitmqCluster` object with the new image (eg. change from `rabbitmq:3.13.7-management` to `rabbitmq:4.0.6-management`)
1. The Cluster Operator will update the `StatefulSet` object with the new image, triggering the rolling upgrade mechanism built-in to Kubernetes
1. Kubernetes will stop `server-2` (it always goes from the highest index to the lowest)
   - The pod will check if it can safely stop, by calling `rabbitmq-upgrade await_online_quorum_plus_one`
   - When that command exits with a zero status, the pod will stop
1. Kubernetes will download and start the new OCI image. Effectively, it upgraded the packages of RabbitMQ, Erlang and other system dependencies
1. `server-2` starts and [attempts to rejoin the cluster](./feature-flags#version-compatibility)
   - it has the same feature flags enabled as it had before it stopped (the state of feature flags is stored in a file)
   - feature flags that were introduced in RabbitMQ 4.0 or **not** enabled at this point
   - therefore, the upgraded node can join the cluster
1. Once the node starts, it synchronizes its metadata (eg. becomes aware of queues declared while it was down), and starts quorum
   queue and stream members, which should quickly catch up with the rest of the cluster (any messages published while the node was down
   are replicated to it, etc)
1. Once `server-2` is running, Kubernetes stops `server-1` and the process repeats
1. Once `server-0` is upgraded and running, all nodes are running on the new version
1. You can now enable new feature flags and [rebalance the cluster](./upgrade#rebalance)

While the process has many steps (and we skipped some details), you only had to change the `image` value,
wait a few minutes and then ran two commands to enable new feature flags and rebalance the cluster.

When performing a rolling upgrade without Kubernetes, you need to go through the same steps - you just have
to do them manually or using some other automation. Using OCI images further simplifies the process since the image
contains the new RabbitMQ version already with a compatible Erlang version and other dependencies.
