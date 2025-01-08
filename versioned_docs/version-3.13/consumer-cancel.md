---
title: Consumer Cancel Notification
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

# Consumer Cancel Notification

## Overview {#overview}

When a channel is consuming from a queue, there are various
reasons which could cause the consumption to stop. One of
these is obviously if the client issues a
`basic.cancel` on the same channel, which will
cause the consumer to be cancelled and the server replies
with a `basic.cancel-ok`. Other events, such as
the queue being deleted, or in a clustered scenario, the
node on which the queue is located failing, will cause the
consumption to be cancelled, but the client channel will not
be informed, which is frequently unhelpful.

To solve this, we have introduced an extension in which the
broker will send to the client a `basic.cancel`
in the case of such unexpected consumer cancellations. This
is not sent in the case of the broker receiving a
`basic.cancel` from the client. AMQP 0-9-1
clients don't by default expect to receive
`basic.cancel` methods from the broker
asynchronously, and so in order to enable this behaviour,
the client must present a `capabilities` table in
its `client-properties` in which there is a key
`consumer_cancel_notify` and a boolean value
`true`. See the [section on capabilities](./connections#capabilities) for details.

Our supported clients present this capability by default to
the broker and thus will be sent the asynchronous
`basic.cancel` method by the broker, which they
present to the consumer callback. For example, in our Java
client, the `Consumer` interface has a
`handleCancel` callback, which can be overridden
by sub-classing the `DefaultConsumer` class:

```java
channel.queueDeclare(queue, false, true, false, null);
Consumer consumer = new DefaultConsumer(channel) {
    @Override
    public void handleCancel(String consumerTag) throws IOException {
        // consumer has been cancelled unexpectedly
    }
};
channel.basicConsume(queue, consumer);
```

It is not an error for the client to issue a
`basic.cancel` for a consumer which has been
unexpectedly cancelled (e.g. due to queue deletion). By
definition, there is a race possible between a client
issuing a `basic.cancel`, and the broker sending
out the asynchronous notification. In such cases, the broker
does not error when it receives the
`basic.cancel` and replies with a
`basic.cancel-ok` as normal.

### Consumer Cancellation and Replicated Queues {#replication}

Clients supporting consumer cancel notification will always be
informed when a queue is deleted or becomes
unavailable. Consumers may request that they should be cancelled
when the leader of a replicated queue changes.
