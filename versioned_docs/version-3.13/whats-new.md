---
title: What's New in RabbitMQ 3.13
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

import MQTTLogo from '@site/static/img/mqtt-logo/mqtt-ver.svg';
import KhepriLogo from '@site/static/img/khepri-logo.svg';

# What's New in RabbitMQ 3.13

RabbitMQ 3.13 is a new release branch [published on 22 Feb
2024](/blog/2024/03/11/rabbitmq-3.13.0-announcement). <strong>RabbitMQ
<RabbitMQServerVersion/></strong> is the latest patch release for this release
branch. See the [Release Information section](/release-information) to learn
more about all patch releases for this release branch.

## MQTT 5.0 support

<MQTTLogo className="floating-logo"/>

MQTT, which is the standard protocol for the Internet of Things (IoT) is
supported by RabbitMQ for over a decade, and now our 3.13.0 release supports
the latest version of MQTT, which is 5.0. The list of features that come with
MQTT 5.0 to further address the issues of IoT device communication is vast. For
a deeper dive into MQTT 5.0 support, its specifics with RabbitMQ, and the list
of features you can avail of, go through [our MQTT 5.0 blog
post](/blog/2023/07/21/mqtt5).

## Stream filtering

With the new [stream filtering feature](/blog/2023/10/16/stream-filtering), you
can save bandwidth between the broker and consuming applications when those
applications need only a subset of the messages of a stream.

## Classic Queue Performance Improvements

[Classic queues' shared message store](/blog/2024/01/11/3.13-release) brings
significant performance improvements, in terms of publishing/consuming rates,
latency and memory footprint.

## New Experimental Metadata Database: Khepri

<KhepriLogo className="floating-logo"/>

[Khepri](https://github.com/rabbitmq/khepri) is a new storage backend
for RabbitMQ metadata that is designed to replace Mnesia. It is not yet *ready
for production use* but we encourage users to try it out in test environments
and provide feedback.

Our plan is to completely remove Mnesia in the future. This should
significantly improve RabbitMQ tolerance to network partitions. Once we switch
to Khepri, there will be no partition handling strategy configuration
(`pause_minority`, `autoheal`, and so on). Just like quorum queues, Khepri is
also based on the Raft protocol. As a result, the semantics of what to do when
a partition occurs are well defined and not configurable.
