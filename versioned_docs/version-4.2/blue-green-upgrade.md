---
title: Blue-Green Deployment
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

Blue-green deployment is a migration technique that can also be used as an [upgrade strategy](./upgrade).
The main idea is to set up a new environment (the "green" one) and switch to it
when it is ready. The "upgrade" is not performed "in place", the application just switches
to a different environment, which might be using a different version, but can
also differ in other aspects.

The same approach can be used to migrate to a new operating system or new hardware, while keeping the same version of RabbitMQ,
or to upgrade from a version that cannot be upgraded to the target series directly,
for example, from 3.12.x to 4.0.x or from a 3.13.x cluster with Khepri enabled to 4.0.x.

When that migration is done, the old ("blue") cluster is decommissioned (shut down, deleted).
To simplify the switch, [federated queues](./federated-queues)
can be used to transfer enqueued messages from the "blue" to the "green" cluster.

## Preparing the "green" Cluster {#preparation}

After deploying a brand new "green" cluster, there are two steps to follow:

 * import definitions, e.g. exchanges, queues, bindings;
 * configure federation to later drain messages.

### Importing definitions

The procedure of definitions export/import is
covered in the [Backup guide](./backup#definitions-export).
The "blue" is the source cluster and the "green" one is the target.

### Configuring Queue Federation {#setup-federation}

[RabbitMQ Federation plugin](./federation) makes it easy to move consumers
from "blue" to "green", without disrupting message consumption or losing messages.
The principle of [federated queues](./federated-queues) is that the consumers
now connected to "green" will get messages published to "blue" as long as there are
no consumers in "blue" (local consumers take precedence).

Here is an example to federate all queues. In this example,
the "green" cluster is the upstream and the "blue" one is the downstream.

First define the upstream on "blue" and point it to "green":

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_parameter federation-upstream blue \
  '{"uri":"amqp://node-in-blue-cluster"}'
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin federation declare_upstream_for_queues --name blue \
  --uri "amqp://node-in-blue-cluster"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_parameter federation-upstream blue ^
  '"{""uri"":""amqp://node-in-blue-cluster""}"'
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin.exe with PowerShell">
```PowerShell
rabbitmqadmin.exe federation declare_upstream_for_queues --name blue ^
  --uri "amqp://node-in-blue-cluster"
```
</TabItem>
</Tabs>

Then define a [policy](./policies) or a number of policies, collectively matching all queues
which configure `blue` as the upstream:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_policy --apply-to queues blue ".*" \
  '{"federation-upstream":"blue"}'
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin policies declare \
  --name "blue" \
  --pattern ".*" \
  --definition '{"federation-upstream":"blue"}' \
  --apply-to "queues"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_policy --apply-to queues blue ".*" ^
  '"{""federation-upstream"":""blue""}"'
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin.exe with PowerShell">
```PowerShell
rabbitmqadmin.exe policies declare ^
  --name "blue" ^
  --pattern ".*" ^
  --definition "{""federation-upstream"":""blue""}" ^
  --apply-to "queues"
```
</TabItem>
</Tabs>

:::tip

The above example is a great oversimplification.

In practice, some queues will be already matched by a policy,
and some might not be.

[`rabbitmqadmin v2`](./management-cli) provides a set of commands
that allow the operator to

1. [Patch (partially update)](./policies#patching) policies
2. Temporarily [override existing policies](./policies#override)
to include a key that enabled queue federation
3. [Declare a blanket policy](./policies#blanket) to match all other queues
to enable federation for them

Use a combination of these features to enable queue federation
between the clusters for all queues, whether they already have
a policy that applies to them or not.

:::

Please refer to the [policies](./policies) and
[federation reference](./federation-reference) guides to learn more.

## Migrate Consumers Over {#migrate-consumers}

You can now switch your consumers to use the new "green" cluster. To achieve
that, reconfigure your load balancer or your consumer applications, depending
on your setup. The upgrade guide covers [some client features which enable
them to switch between nodes](./upgrade#rabbitmq-restart-handling).

At that point, your producers are still publishing to "blue", but thanks to
the federation plugin, message are transferred to consumers connected to "green".

## Drain Messages {#drain-messages}

The next step would be to switch producers to "green" as well. However, you may
still have a backlog of messages in "blue". For the queues that no longer have local
consumers in "blue", queue federation links will move messages to "green" and its consumers.

In case of a large backlog, using [shovels](./shovel-dynamic)
on "green" to move all remaining messages to "blue" can be an option worth considering.

This would require doing something like the following for each queue with a backlog:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_parameter shovel shovel-blue-to-green-queue1 \
  '{"src-protocol": "amqp091", "src-uri": "amqp://node-in-blue-cluster", "src-queue": "queue1", "dest-protocol": "amqp091", "dest-uri": "amqp://", "dest-queue": "queue1"}'
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin shovels declare_amqp091 --name shovel-blue-to-green-queue1 \
  --source-uri "amqp://node-in-blue-cluster" \
  --destination-uri "amqp://" \
  --source-queue "queue1" \
  --destination-queue "queue1"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_parameter shovel shovel-blue-to-green-queue1 ^
  "{""src-protocol"": ""amqp091"", ""src-uri"": ""amqp://node-in-blue-cluster"", ""src-queue"": ""queue1"", ^
   ""dest-protocol"": ""amqp091"", ""dest-uri"": ""amqp://"", ""dest-queue"": ""queue1""}"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin.exe with PowerShell">
```PowerShell
rabbitmqadmin.exe shovels declare_amqp091 --name shovel-blue-to-green-queue1 ^
  --source-uri "amqp://node-in-blue-cluster" ^
  --destination-uri "amqp://" ^
  --source-queue "queue1" ^
  --destination-queue "queue1"
```
</TabItem>
</Tabs>

Note that using shovel concurrently with queue federation will move messages concurrently, that is,
in an order that won't match the order in the source queue.

## Migrate Producers Over {#migrate-producers}

Once the queues in "blue" are almost empty, you can stop producers. If message
ordering is important to you, you should still wait a bit more so that the
federation or shovel plugins finish to drain the queues on "blue".

When they are empty, reconfigure your producers like you did for the consumers
and start them again. At this point, everything is moved to the "green" cluster.

## Decommission the "blue" Cluster {#decommission-blue}

You are now free to shutdown the nodes in the "blue" cluster.

## Real-world Example {#example}

Dan Baskette, Gareth Smith and Claude Devarenne of Pivotal
[published an article](https://tanzu.vmware.com/content/blog/blue-green-application-deployments-with-rabbitmq)
about this method where producers and consumers are CloudFoundry applications.
The article is very detailed  and uses diagrams to describe the procedure.
They also made a [video to show it in action](https://www.youtube.com/watch?v=S2oO-t-E38c).

This guide is inspired by their great work.
