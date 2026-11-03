---
title: Known issues with Khepri
---

# Known Issues with Khepri

## Metadata Operation Timeouts

Metadata operations can time out when a majority of cluster nodes is unavailable.
Clients can retry failed operations after connectivity or cluster availability is restored.
See [failure recovery](./failure-recovery).

## Recovery After Permanent Loss of Node Data

A node that loses its data also loses its cluster membership state. Remove its old
membership before adding a replacement node. See [removing cluster nodes](../clustering#removing-nodes)
and [backup and restore](../backup).
