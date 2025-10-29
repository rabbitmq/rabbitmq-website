---
title: Flow Control
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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
# Flow Control

## Overview {#overview}

This guide covers a back pressure mechanism applied by RabbitMQ nodes
to publishing connections in order to avoid runaway [memory usage](./memory-use) growth.
It is necessary because some components in a node can fall behind particularly fast publishers
as they have to do significantly more work than publishing clients (e.g. replicate data to N
peer nodes or store it on disk).


## How Does Flow Control Work {#flow-control}

RabbitMQ will reduce the speed of connections which are
publishing too quickly for queues to keep up. No configuration
is required.

A flow-controlled connection will show a state of `flow` in `rabbitmqctl`, management UI
and HTTP API responses. This means the connection is experiencing
blocking and unblocking several times a second, in order to keep the rate of
message ingress at one that the rest of the server (e.g. queues those messages are route to)
can handle.

In general, a connection which is in flow control should not see
any difference from normal running; the `flow` state
is there to inform the sysadmin that the publishing rate is
restricted, but from the client's perspective it should just
look like the network bandwidth to the server is lower than it actually is.

Other components than connections can be in the
`flow` state. Channels, queues and other parts of the system
can apply flow control that eventually propagates back to publishing connections.

To find out if consumers and [prefetch settings](./confirms)
can be key limiting factors, [take a look at relevant metrics](/blog/2014/04/14/finding-bottlenecks-with-rabbitmq-3-3).
See [Monitoring and Health Checks](./monitoring) guide to learn more.
