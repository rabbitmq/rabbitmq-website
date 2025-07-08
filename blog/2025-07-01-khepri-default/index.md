---
title: "The Roadmap for Making Khepri the Default Metadata Store in RabbitMQ"
tags: ["khepri"]
authors: [mgary]
---

Khepri, the new Raft-based RabbitMQ [metadata store](https://www.rabbitmq.com/docs/metadata-store), became fully supported with RabbitMQ 4.0.
Starting with the next release series, RabbitMQ 4.2, we consider Khepri to be mature enough to become the default metadata store,
especially given its substantial data safety and recovery improvements over Mnesia.

We have performed [a number of benchmarks](#khepri-performance-improvements), showing significant performance improvements in many metadata operations.

<!-- truncate -->

## Khepri Feature Flag now stable

The `khepri_db` feature flag has now been upgraded to `Stable`, meaning it will now be enabled when running the command `rabbitmqctl enable_feature_flag all`,
which should be done after every successful version upgrade.

Starting with version 4.2, all RabbitMQ clusters will be strongly recommended to adopt Khepri by enabling the `khepri_db` feature flag. This feature flag will
**likely become mandatory** for upgrading from 4.2 onwards.

While the final decision depends on the community feedback, we expect that starting with RabbitMQ 4.3,
the `khepri_db` feature flag will [graduate](https://www.rabbitmq.com/docs/feature-flags#graduation) to be `Required`.

### Feature Flag Subsystem

The RabbitMQ [feature flag subsystem](https://www.rabbitmq.com/docs/feature-flags) was recently improved by introducing a new category of feature flags known as `Soft Required`.
If a feature flag is `Soft Required` starting from version `N`, it is automatically enabled once all RabbitMQ nodes are upgraded to version `N` of RabbitMQ.
This is a change from the previous behavior of `Required`, where a feature flag that became required in version `N` of RabbitMQ must be enabled before upgrading to version `N`.

It remains best practice to enable feature flags as soon as they become `Stable`, generally immediately after a successful upgrade by running the command `rabbitmqctl enable_feature_flag all`.
Nonetheless, we view the introduction of `Soft Required` feature flags as an improvement in user experience,
as any required feature flags not already enabled will be automatically enabled when required.

## Khepri Performance Improvements

The benchmarks below were performed on a 3 node cluster running on Kubernetes

### 1000 queues, each with 100 bindings
| benchmark                  | mnesia | khepri |
| -------------------------- | ------ | ------ |
| import                     | 446 s  | 51 s   |
| re-import                  | 16 s   | 46 s   |
| stop_app                   | 1.6 s  | 1.7 s  |
| start_app                  | 22 s   | 4.3 s  |
| rolling cluster restart    | 108 s  | 67 s   |
| mnesia to khepri migration | 12.7 s |        |

### 1000 Vhosts
| benchmark                  | mnesia | khepri |
| -------------------------- | ------ | ------ |
| import                     | 284 s  | 21 s   |
| re-import                  | 2.2 s  | 2.2 s  |
| stop_app                   | 2.6 s  | 2.4 s  |
| start_app                  | 419 s  | 16 s   |
| rolling cluster restart    | 1447 s | 106 s  |
| mnesia to khepri migration | 5.5 s  |        |

### 100,000 Classic Queues
| benchmark                  | mnesia | khepri |
| -------------------------- | ------ | ------ |
| import                     | 76 s   | 76 s   |
| re-import                  | 5.4 s  | 5.3 s  |
| stop_app                   | 13 s   | 6 s    |
| start_app                  | 26 s   | 40 s   |
| rolling cluster restart    | 185 s  | 307 s  |
| mnesia to khepri migration | 9.7 s  |        |

### 10,000 Quorum Queues
| benchmark                  | mnesia | khepri |
| -------------------------- | ------ | ------ |
| import                     | 49 s   | 46 s   |
| re-import                  | 1.9 s  | 1.8 s  |
| stop_app                   | 1.9 s  | 1.7 s  |
| start_app                  | 44 s   | 44 s   |
| rolling cluster restart    | 285 s  | 267 s  |
| mnesia to khepri migration | 4.7 s  |        |

### 1,000 Streams
| benchmark                  | mnesia | khepri |
| -------------------------- | ------ | ------ |
| import                     | 3.5 s  | 1.2 s  |
| re-import                  | 1.6 s  | 1.2 s  |
| stop_app                   | 1.9 s  | 1.2 s  |
| start_app                  | 2.5 s  | 2.3 s  |
| rolling cluster restart    | 56 s   | 55 s   |
| mnesia to khepri migration | 5 s    |        |
