---
title: Authentication Failure Notifications
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

# Authentication Failure Notifications

## Overview {#overview}

AMQP 0-9-1 requires brokers to close the TCP connection if an authentication
failure occurs during connection establishment. This makes it difficult for
clients to distinguish such authentication failures from genuine network
interruptions during the early stages of connection establishment.

RabbitMQ offers explicit authentication failure notifications
for clients that advertise their capacity to receive such notifications.


## How it Works {#usage}

The broker will report failures differently depending on the presence of the
<code>authentication_failure_close</code> <a href="./consumer-cancel#capabilities">capability</a>.
If this capability is absent then authentication failures are reported
in the legacy fashion: by abruptly closing the network connection. If this
capability is present then the broker will send a <code>connection.close</code>
command to the client indicating <code>ACCESS_REFUSED</code> as the reason. The broker
will [create a log entry](./logging#connection-lifecycle-events)
for the authentication failure in either case.
