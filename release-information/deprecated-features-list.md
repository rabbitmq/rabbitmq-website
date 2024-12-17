---
title: List of Deprecated Features
---
<!--
Copyright (c) 2024 Broadcom. All Rights Reserved. The term "Broadcom" refers
to Broadcom Inc. and/or its subsidiaries.

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

# List of Deprecated Features

See the [Deprecated Features subsystem documentation](/docs/deprecated-features) to learn more about deprecated features.

| [Deprecated&nbsp;feature](/docs/deprecated-features) | Deprecated&nbsp;since | Removed&nbsp;in | Notes |
|--------------------|---------------|------------|-------|
| [`amqp_address_v1`](/docs/amqp#address-v1) | RabbitMQ 4.0 | | Use [AMQP address v2](/docs/amqp#address-v2). |
| [`classic_queue_mirroring`](/docs/3.13/ha) | [August&nbsp;2021](/blog/2021/08/21/4.0-deprecation-announcements) | RabbitMQ&nbsp;4.0 | Use [quorum queues](/docs/quorum-queues) and/or [streams](/docs/streams) for data that needs replication. |
| `global_qos` | [August&nbsp;2021](/blog/2021/08/21/4.0-deprecation-announcements) | | Use [per-consumer QoS](/docs/consumer-prefetch). |
| `management_metrics_collection` | [August&nbsp;2021](/blog/2021/08/21/4.0-deprecation-announcements) | | Use the [Prometheus plugin](/docs/prometheus). |
| `ram_node_type` | [August&nbsp;2021](/blog/2021/08/21/4.0-deprecation-announcements) | | Use disk nodes only. |
| `transient_nonexcl_queues` | [August&nbsp;2021](/blog/2021/08/21/4.0-deprecation-announcements) | | Covers queues that are both non-durable and non-exclusive, this combination should be avoided. Use [durable queues or non-durable exclusive queues](/docs/queues). [Queue TTL](/docs/ttl#queue-ttl) can be used for cleanup of unused durable queues. |

