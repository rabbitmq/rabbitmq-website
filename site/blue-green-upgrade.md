# Upgrading RabbitMQ Using Blue-Green Deployment Strategy

Blue-green deployment is an upgrade strategy that is based on the idea of to setting up
a second RabbitMQ cluster (the "green" one) next to the current production
cluster (the "blue" one). Applications are then switched to the "green"
cluster. When that migration is done, the "blue" cluster is decomissioned (shut down).
To simplify the switch, [federated queues](http://www.rabbitmq.com/federated-queues.html)
can be used to transfer enqueued messages from the "blue" to the "green" cluster.

## Preparing the "green" Cluster

After deploying a brand new "green" cluster, there are two steps to follow:

 * import definitions, e.g. exchanges, queues, bindings;
 * configure federation to later drain messages.

### Importing definitions

The procedure of definitions export/import is
covered in the [Backup guide](backup.html#definitions-export).
The "blue" is the source cluster and the "green" one is the target.

### Configuring Queue Federation

The [federation plugin](federation.html) allows you to move your consumers
from "blue" to "green", without disrupting message consumption or losing messages.
The principle of [federated queues](/federated-queues.html) is that the consumers
now connected to "green" will get messages published to "blue".

Here is an example to federate all queues. In this example, the "blue" cluster
is the upstream and the "green" one is the downstream.

1. Define the upstream on "green" and point it to "blue":

    <pre class="lang-sh">
    rabbitmqctl set_parameter federation-upstream blue \
      '{"uri":"amqp://node-in-blue-cluster"}'
    </pre>

1. Define a policy matching all queues which configure `blue` as the upstream:

    <pre class="lang-sh">
    rabbitmqctl set_policy --apply-to queues blue-green-migration ".*" \
      '{"federation-upstream":"blue"}'
    </pre>

Please read the guides linked above and the
[federation reference](/federation-reference.html) for further details.

## Switch consumers

You can now switch your consumers to use the new "green" cluster. To achieve
that, reconfigure your load balancer or your consumer applications, depending
on your setup. The Upgrade guide covers [some client features which enable
them to switch between nodes](upgrade.html#rabbitmq-restart-handling).

At that point, your producers are still publishing to "blue", but thanks to
the federation plugin, message are transfered to consumers connected to "green".

## Draining messages

The next step would be to switch producers to "green" as well. However, you may
still have a backlog of messages in "blue". The federation plugin doesn't help
here because it doesn't **move** messages, it only allows remote consumers to
dequeue messages.

When you have a large backlog, you could setup the [shovel plugin](/shovel-dynamic.html)
on "green" to really drain messages in "blue". Thus, you need to run the
following command for each queue with a backlog:

<pre class="lang-sh">
rabbitmqctl set_parameter shovel drain-blue \
'{"src-protocol": "amqp091", "src-uri": "amqp://node-in-blue-cluster", \
"src-queue": "queue1", "dest-protocol": "amqp091", \
"dest-uri": "amqp://", "dest-queue": "queue1"}'
</pre>

## Switch producers

Once the queues in "blue" are almost empty, you can stop producers. If message
ordering is important to you, you should still wait a bit more so that the
federation or shovel plugins finish to drain the queues on "blue".

When they are empty, reconfigure your producers like you did for the consumers
and start them again. At this point, everything is moved to the "green" cluster.

## Terminating the "blue" cluster

You are now free to shutdown the nodes in the "blue" cluster.

## Real-world example

Dan Baskette, Gareth Smith and Claude Devarenne of Pivotal
[published an article](https://content.pivotal.io/blog/blue-green-application-deployments-with-rabbitmq)
about this method where producers and consumers are CloudFoundry applications.
The article is very detailed  and uses diagrams to describe the procedure.
They also made a [video to show it in action](https://www.youtube.com/watch?v=S2oO-t-E38c).

This guide is inspired by their great work.
