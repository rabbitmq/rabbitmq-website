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

# Upgrading RabbitMQ Using Blue-Green Deployment Strategy

## <a id="overview" class="anchor" href="#overview">Overview</a>

Blue-green deployment is an upgrade strategy that is based on the idea of setting up
a second RabbitMQ cluster (the "green" one) next to the current production
cluster (the "blue" one). Applications are then switched to the "green"
cluster. When that migration is done, the "blue" cluster is decommissioned (shut down).
To simplify the switch, [federated queues](https://www.rabbitmq.com/federated-queues.html)
can be used to transfer enqueued messages from the "blue" to the "green" cluster.

## <a id="preparation" class="anchor" href="#preparation">Preparing the "green" Cluster</a>

After deploying a brand new "green" cluster, there are two steps to follow:

 * import definitions, e.g. exchanges, queues, bindings;
 * configure federation to later drain messages.

### Importing definitions

The procedure of definitions export/import is
covered in the [Backup guide](backup.html#definitions-export).
The "blue" is the source cluster and the "green" one is the target.

### <a id="setup-federation" class="anchor" href="#setup-federation">Configuring Queue Federation</a>

[RabbitMQ Federation plugin](federation.html) makes it easy to move consumers
from "blue" to "green", without disrupting message consumption or losing messages.
The principle of [federated queues](./federated-queues.html) is that the consumers
now connected to "green" will get messages published to "blue" as long as there are
no consumers in "blue" (local consumers take precedence).

Here is an example to federate all queues. In this example, the "blue" cluster
is the upstream and the "green" one is the downstream.

First define the upstream on "green" and point it to "blue":

<pre class="lang-bash">
rabbitmqctl set_parameter federation-upstream blue \
  '{"uri":"amqp://node-in-blue-cluster"}'
</pre>

Then define a policy matching all queues which configure `blue` as the upstream:

<pre class="lang-bash">
rabbitmqctl set_policy --apply-to queues blue-green-migration ".*" \
  '{"federation-upstream":"blue"}'
</pre>

Please read the guides linked above and the
[federation reference](./federation-reference.html) for further details.

## <a id="migrate-consumers" class="anchor" href="#migrate-consumers">Migrate Consumers Over</a>

You can now switch your consumers to use the new "green" cluster. To achieve
that, reconfigure your load balancer or your consumer applications, depending
on your setup. The Upgrade guide covers [some client features which enable
them to switch between nodes](upgrade.html#rabbitmq-restart-handling).

At that point, your producers are still publishing to "blue", but thanks to
the federation plugin, message are transferred to consumers connected to "green".

## <a id="drain-messages" class="anchor" href="#drain-messages">Drain Messages</a>

The next step would be to switch producers to "green" as well. However, you may
still have a backlog of messages in "blue". The federation plugin doesn't help
here because it doesn't **move** messages, it only allows remote consumers to
dequeue messages.

In case of a large backlog, use the [Shovel plugin](./shovel-dynamic.html)
on "green" to really drain messages in "blue". This would require doing something
like the following for each queue with a backlog:

<pre class="lang-bash">
rabbitmqctl set_parameter shovel drain-blue \
'{"src-protocol": "amqp091", "src-uri": "amqp://node-in-blue-cluster", \
"src-queue": "queue1", "dest-protocol": "amqp091", \
"dest-uri": "amqp://", "dest-queue": "queue1"}'
</pre>

## <a id="migrate-producers" class="anchor" href="#migrate-producers">Migrate Producers Over</a>

Once the queues in "blue" are almost empty, you can stop producers. If message
ordering is important to you, you should still wait a bit more so that the
federation or shovel plugins finish to drain the queues on "blue".

When they are empty, reconfigure your producers like you did for the consumers
and start them again. At this point, everything is moved to the "green" cluster.

## <a id="decomission-blue" class="anchor" href="#decomission-blue">Decomission the "blue" Cluster</a>

You are now free to shutdown the nodes in the "blue" cluster.

## <a id="example" class="anchor" href="#example">Real-world Example</a>

Dan Baskette, Gareth Smith and Claude Devarenne of Pivotal
[published an article](https://content.pivotal.io/blog/blue-green-application-deployments-with-rabbitmq)
about this method where producers and consumers are CloudFoundry applications.
The article is very detailed  and uses diagrams to describe the procedure.
They also made a [video to show it in action](https://www.youtube.com/watch?v=S2oO-t-E38c).

This guide is inspired by their great work.
