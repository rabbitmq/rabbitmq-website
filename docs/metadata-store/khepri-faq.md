---
title: Khepri FAQ
---

# Khepri FAQ

### Is Khepri supported? {#supported-even-if-experimental}

Yes. Khepri is the only supported metadata store in RabbitMQ 4.3 and later.

### Is it possible to disable Khepri?

No. RabbitMQ requires Khepri for metadata storage.

### Can definitions exported from older releases be imported?

Yes. [Definitions](../definitions) exported from a Mnesia-based node can be imported
into a Khepri-based node.

### Can a RabbitMQ 3.13 cluster with Khepri enabled be upgraded in place?

No. Khepri was experimental in RabbitMQ 3.13. Such clusters require a
[blue-green upgrade](../blue-green-upgrade).
