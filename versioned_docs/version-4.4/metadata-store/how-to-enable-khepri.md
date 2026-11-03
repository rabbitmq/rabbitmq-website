---
title: Khepri and Upgrades
---

# Khepri and Upgrades

Khepri is always enabled in RabbitMQ 4.3 and later. No additional configuration is required.

## Upgrading a Mnesia-Based Cluster {#migration}

Before upgrading a RabbitMQ 4.2 cluster, enable all stable [feature flags](../feature-flags),
including `khepri_db`, and allow the metadata migration to complete.
See the [RabbitMQ 4.2 migration instructions](/docs/4.2/metadata-store/how-to-enable-khepri)
and the [upgrade guide](../upgrade).
