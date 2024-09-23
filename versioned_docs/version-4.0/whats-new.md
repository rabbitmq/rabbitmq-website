---
title: What's New in RabbitMQ 4.0
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

import {
  RabbitMQServerVersion,
} from '@site/src/components/RabbitMQServer';

import AmqpLogo from '@site/static/img/amqp-logo.svg';
import KhepriLogo from '@site/static/img/khepri-logo.svg';

# What's New in RabbitMQ 4.0

RabbitMQ 3.13 is a new release branch [published on 18 Sep
2024](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.1). <strong>RabbitMQ
<RabbitMQServerVersion/></strong> is the latest patch release for this release
branch. See the [Release Information section](/release-information) to learn
more about all patch releases for this release branch.

## AMQP 1.0 becomes a core protocol

<figure className="without-borders" style={{float: "right"}}>
<AmqpLogo className="floating-logo" style={{width: "100px", height: "100px",}}/>
<figcaption>AMQP logo</figcaption>
</figure>

[AMQP 1.0 is now a core protocol](/blog/2024/08/05/native-amqp) that is always
enabled. Its plugin is now a no-op that only exists to simplify upgrades.

The AMQP 1.0 implementation is also significantly more efficient: its peak
throughput is [more than double than that of
3.13.x](/blog/2024/08/21/amqp-benchmarks)

## Khepri now fully supported

<figure className="without-borders" style={{float: "right"}}>
<KhepriLogo className="floating-logo" style={{width: "100px", height: "175px",}}/>
<figcaption>Khepri logo</figcaption>
</figure>

Khepri is a new backend for RabbitMQ’s metadata store. It was introduced as an
experiment in RabbitMQ 3.13.0. It is now much more stable and efficient. That’s
why it is now fully supported in the case of an issue. It will not be a blocker
either to upgrade RabbitMQ in the future (unlike an upgrade from RabbitMQ
3.13.x to 4.0.x with Khepri enabled which is unsupported).

Users are encouraged to try it in their test environment with workloads as
close as possible to the production before enabling it in production.

Everything around Khepri is documented in the new [Metadata store
section](./metadata-store).

## Classic queue mirroring is removed

![Breaking change](https://img.shields.io/badge/-Breaking%20change-red)

After three years of deprecation, classic queue mirroring was completely
removed in this version. [Quorum queues](./quorum-queues) and
[streams](./streams) are two mature replicated data types offered by RabbitMQ
4.x. Classic queues continue being supported without any breaking changes for
client libraries and applications but they are now a non-replicated queue type.
