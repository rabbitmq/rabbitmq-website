---
title: Upgrading RabbitMQ Using Blue-Green Deployment Strategy
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

# Upgrading RabbitMQ Using Blue-Green Deployment Strategy

## Overview {#overview}

Blue-green deployment is a migration technique that can also be used as an [upgrade strategy](./upgrade).
The main idea is to set up a new environment (the "green" one) and switch to it
when it is ready. The "upgrade" is not performed "in place", the application just switch
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

Here is an example to federate all queues. In this example, the "blue" cluster
is the upstream and the "green" one is the downstream.

First define the upstream on "green" and point it to "blue":

```bash
rabbitmqctl set_parameter federation-upstream blue \
  '{"uri":"amqp://node-in-blue-cluster"}'
```

Then define a policy matching all queues which configure `blue` as the upstream:

```bash
rabbitmqctl set_policy --apply-to queues blue-green-migration ".*" \
  '{"federation-upstream":"blue"}'
```

Please read the guides linked above and the
[federation reference](./federation-reference) for further details.

## Migrate Consumers Over {#migrate-consumers}

You can now switch your consumers to use the new "green" cluster. To achieve
that, reconfigure your load balancer or your consumer applications, depending
on your setup. The Upgrade guide covers [some client features which enable
them to switch between nodes](./upgrade#rabbitmq-restart-handling).

At that point, your producers are still publishing to "blue", but thanks to
the federation plugin, message are transferred to consumers connected to "green".

## Drain Messages {#drain-messages}

The next step would be to switch producers to "green" as well. However, you may
still have a backlog of messages in "blue". The federation plugin doesn't help
here because it doesn't **move** messages, it only allows remote consumers to
dequeue messages.

In case of a large backlog, use the [Shovel plugin](./shovel-dynamic)
on "green" to really drain messages in "blue". This would require doing something
like the following for each queue with a backlog:

```bash
rabbitmqctl set_parameter shovel drain-blue \
'{"src-protocol": "amqp091", "src-uri": "amqp://node-in-blue-cluster", \
"src-queue": "queue1", "dest-protocol": "amqp091", \
"dest-uri": "amqp://", "dest-queue": "queue1"}'
```

## Migrate Producers Over {#migrate-producers}

Once the queues in "blue" are almost empty, you can stop producers. If message
ordering is important to you, you should still wait a bit more so that the
federation or shovel plugins finish to drain the queues on "blue".

When they are empty, reconfigure your producers like you did for the consumers
and start them again. At this point, everything is moved to the "green" cluster.

## Decomission the "blue" Cluster {#decomission-blue}

You are now free to shutdown the nodes in the "blue" cluster.

## Real-world Example {#example}

Dan Baskette, Gareth Smith and Claude Devarenne of Pivotal
[published an article](https://content.pivotal.io/blog/blue-green-application-deployments-with-rabbitmq)
about this method where producers and consumers are CloudFoundry applications.
The article is very detailed  and uses diagrams to describe the procedure.
They also made a [video to show it in action](https://www.youtube.com/watch?v=S2oO-t-E38c).

This guide is inspired by their great work.
