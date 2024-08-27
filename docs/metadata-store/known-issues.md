---
title: Known issues with Khepri
---

# Known issues with Khepri

This document lists the most common known issues that may affect your workload.
In addition to your testion, it allows you to make an informed decision if you
can enable Khepri un production.

:::note
When we talk about known issues with Khepri, we really mean two different things:
* bugs and limitations in the Khepri library itself
* bugs and regressions in the integration of Khepri in RabbitMQ
:::

## Slow performance of deletes

![](https://img.shields.io/badge/Severity-low-yellow)

We observed that it can be very slow to delete a massive amount of entities
such as user perimssions or bindings. This somes from the fact that the
integration of Khepri tries to be identical to Mnesia behavior. Therefore some
code paths could be greatly optimized for Khepri but it was not possible yet.

We continue to track these performance regressions compared to Mnesia. They
appear to be limited to specific use cases with massive entities churn. We will
optimize Khepri and implement mitigations in the integration code.

This will be entirely solved for good once we stop supporting Mnesia. We expect
that the performance will be even greater at that point.

## Internal error and timeout handling

![](https://img.shields.io/badge/Severity-low-yellow)

Mnesia transactions basically can’t fail. The downside is that the table may
become inconsistent and there could be conflict that the application has to
resolve after a network or application failure. RabbitMQ mitigates these issues
with the famous network partition recovery strategies, which can be more or
less successful.

RabbitMQ code was therefore not used to expect an error or a timeout from the
metadata store.

Khepri updates may time out if the node trying to do it can’t reach consensus.
We adapted most places to take this new fact into account, but there are
probably more areas to adapt and we continue to track them. In the meantime,
it’s possible that some Erlang processes may crach because of the unexpected
error/timeout.

It shouldn’t cause data loss thanks to the use of Raft. The client application
will get an error if an internal RabbitMQ crashed and couldn’t process its
request.

## Recovery after the loss of one or more nodes’ data

![](https://img.shields.io/badge/Severity-low-yellow)

If one or more nodes lose their data or ever their entire disk, they will not
happily rejoin the cluster. The reason is that they lost their feature flags
state as well as their cluster membership state.

It is possible to enable Khepri again on them. There are some heuristics to
try to get them back in the cluster but the success is not guarantied at this
point.
