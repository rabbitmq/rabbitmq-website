---
title: Daily use with Khepri
---

# Everyday Operations with Khepri

## Khepri’s Most Important Raft-based Characteristic

Even though the metadata store doesn’t store messages, its behavior will affect
day-to-day behavior and technical operations of a RabbitMQ that uses it, at
least as long as applications that use this cluster will want to authenticate
and declare or delete resources such as queues or streams.

As already mentioned in [clustering caveats](./clustering#caveats), Khepri is a
Raft-based system, and just like in any Raft-based system, a quorum number of
cluster members must be online and available for the metadata store to accept
writes (inserts, updates, deletes).

## Client Resource Declaration On the Cluster Minority Side

The topology that defines how messages are routed is stored in the metadata
store. The way to declare a resource remains the same regardless of the active
metadata store backend.

However, where it was possible to declare a queue with Mnesia even if the
majority of the cluster was either down or unreachable, the same operation with
Khepri will timeout. This way the client can react appropriately to the issue,
instead of hoping for the best with the various network partition recovery
strategies that are implemented on top of Mnesia.

### Example of a Timeout

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
