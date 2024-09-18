---
title: Everyday Operations with Khepri
---

# Everyday Operations with Khepri

Even though the metadata store doesn’t store messages, its behavior will affect
day-to-day behavior and technical operations of a RabbitMQ that uses it, at
least as long as applications that use this cluster will want to authenticate
and declare or delete resources such as queues or streams.

As already mentioned in [clustering caveats](./clustering#caveats), Khepri is a
Raft-based system, and just like in any Raft-based system, a quorum number of
cluster members must be online and available for the metadata store to accept
updates (writes/deletes or cluster membership changes).

## Consistency Model and Visibility Guarantees

Khepri has an important difference from Mnesia when it comes to schema
modifications such as queue or stream declarations, or binding declarations.
These changes won’t be noticeable with many workloads but can affect some, in
particular, certain integration tests.

### Example Scenarios

Consider two scenarios, A and B.

<figure style={{width: "inherit",}}>
<div className={"figure"}>
There is only one client. The client performs the following steps:

1. It declares a queue Q.
2. It binds Q to an exchange X.
3. It publishes a message M to the exchange X.
4. It expects the message to be routed to queue Q.
5. It consumes the message.
</div>
<figcaption>Scenario A</figcaption>
</figure>

In this scenario, there should be no observable difference in behavior.
Client’s expectations will be met.

<figure style={{width: "inherit",}}>
<div className={"figure"}>
There are two clients, One and Two, connected to nodes R1 and R3, and using the
same virtual host. Node R2 has no client connections.

1. Client One declares a queue Q.
2. It binds Q to an exchange X.
3. It gets queue and binding declaration confirmations back.
4. It notifies Client Two or Client Two implicitly finds out that it has
   finished the steps above (for example, in an integration test).
5. Client Two publishes a message M to X.
6. Clients One and Two expect the message to be routed to Q.
</div>
<figcaption>Scenario B</figcaption>
</figure>

In this scenario, on step three Mnesia would return when **all** cluster nodes
have committed an update. Khepri, however, will return when **a majority** of
nodes, including the node handling Client One’s operations, have returned.

This may include nodes R1 and R2 but not node R3, meaning that message M
published by Client Two connected to node R3 in the above example **is not
guaranteed to be routed**.

Once all schema changes propagate to node R3, Client Two’s subsequent
publishes on node R3 **will be guaranteed** to be routed.

This trade-off of a Raft-based system that assumes that a write accepted by a
majority of nodes can be considered a success.

### Workaround Strategies

To satisfy Client Two's expectations in scenario B, Khepri could perform
**consistent** (involving a majority of replicas) queries of bindings when
routing messages but that would have a **significant** impact on throughput of
certain protocols (such as MQTT) and exchange/destination types (anything that
resembles a topic exchange in AMQP 0-9-1).

Applications that rely on multiple connections that depend on a shared topology
have several coping strategies.

If an application uses two or more connections to different nodes, it can
declare its topology on boot and then injecting a short pause (1-2 seconds)
before proceeding with other operations.

Applications that rely on dynamic topologies can switch to use a "static" set
of exchanges and bindings.

Application components that do not need to use a shared topology can each
configure its own queues/streams/bindings.

Test suites that use multiple connections to different nodes can choose to use
just one connection or connect to the same node, or inject a pause, or await a
certain condition that indicates that the topology is in place.


## Client Resource Declaration on the Cluster Minority Side

The topology that defines how messages are routed is stored in the metadata
store. The way to declare a resource remains the same regardless of the active
metadata store backend.

However, where it was possible to declare a queue with Mnesia even if the
majority of the cluster was either down or unreachable, the same operation with
Khepri will timeout. This way the client can react appropriately to the issue,
instead of hoping for the best with the various network partition recovery
strategies that are implemented on top of Mnesia.

Here is an example of the PerfTest tool trying to declare the exchange and
queue it needs in a cluster where only 1 out of 5 nodes is running:

```bash
./scripts/PerfTest

# => id: test-161339-979, starting consumer #0
# => id: test-161339-979, starting consumer #0, channel #0
# =>  Main thread caught exception: java.io.IOException
# =>  16:14:10.638 [com.rabbitmq.perf.PerfTest.main()] ERROR com.rabbitmq.perf.PerfTest - Main thread caught exception
# =>  (...)
```

At the same time, the RabbitMQ node logged the following messages:

```
[error] <0.1373.0> Error on AMQP connection <0.1373.0> (127.0.0.1:55165 -> 127.0.0.1:5672 - perf-test-consumer-0, vhost: '/', user: 'guest', state: running), channel 1:
[error] <0.1373.0>  operation exchange.declare caused a connection exception internal_error: "failed to declare exchange 'direct' in vhost '/' because the operation timed out"
```
