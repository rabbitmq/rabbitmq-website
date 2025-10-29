---
title: Known issues with Khepri
---

# Known Issues with Khepri

This document lists the most common known issues with Khepri that may affect
technical operations of a cluster.

The goal of this guide is to allow the users to make an informed decision about
whether they can adopt Khepri in RabbitMQ 4.0.x.

:::note

When we talk about known issues with Khepri, we really mean two different things:

* bugs and limitations in the Khepri library itself
* bugs and regressions in the integration of Khepri in RabbitMQ

:::

## Lower Performance of Bulk Deletes

![](https://img.shields.io/badge/Severity-low-yellow)

Currently Khepri can be much slower to delete a massive amount of entities
such as queues, bindings or user permissions. This somes from the fact that the
integration of Khepri tries to be identical to Mnesia behavior. Therefore some
code paths could be greatly optimized for Khepri currently are not because
Mnesia is still supported in 4.0.x.

RabbitMQ maintainers plan on narrowing the bulk delete efficiency gap with Mnesia. They
appear to be limited to specific use cases with significant topology churn.

This difference will be fundamentally solved once RabbitMQ can be optimized specifically
for Khepri, that is, when Mnesia support is dropped. From that moment onwards,
Khepri performance on most workload will match or exceed that of Mnesia in earlier versions.


## Timeout handling

![](https://img.shields.io/badge/Severity-low-yellow)

In Mnesia, a transaction can fail with a timeout. Because of this, a table
in Mnesia may become inconsistent and there could be conflict that the application has to
resolve after a network or application failure. RabbitMQ mitigates these issues
to a certain extent with its network partition recovery strategies.

RabbitMQ code was therefore not used to expect an error or a timeout from the
metadata store.

With Khepri, writes (inserts, updates, deletes) may time out if the node trying to do it can’t reach consensus.
Most parts of RabbitMQ were adjusted to take this new fact into account but there may
be more areas that will have to be adapted, which will be discovered and addressed over them.

In the meantime, it’s possible that some Erlang processes on RabbitMQ nodes may run into timeout
exceptions.

Note that when such a timeout happens, the data stored in Khepri very likely will be safe thanks to Raft's
replication and failure recovery characteristics.

The client application will get an error that it can retry after a period of time.


## Recovery After Permanent Loss of One or More Nodes’ Data

![](https://img.shields.io/badge/Severity-low-yellow)

If one or more nodes lose their data or even their entire disk, they will not
be able to rejoin the cluster. The reason is that they lost their feature flags
state as well as their cluster membership state.

It is possible to enable Khepri again on them. There are some heuristics to
try to get them back in the cluster but the success is not guarantied at this
point.
