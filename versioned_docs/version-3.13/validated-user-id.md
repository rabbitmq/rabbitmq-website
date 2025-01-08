---
title: Validated User-ID
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

# Validated User-ID

In some scenarios it is useful for consumers to be able
to know the identity of the user who published a
message.

To make this possible, RabbitMQ will validate the <code>user-id</code> message property if it is set.
In other words, if this property is set by a publisher, its value must be equal
to the name of the connection's user.

If the <code>user-id</code> property is not set, the
publisher's identity remains private and no validation will be performed.

## Example (in Java)

```java
AMQP.BasicProperties properties = new AMQP.BasicProperties();
properties.setUserId("guest");
channel.basicPublish("amq.fanout", "", properties, "test".getBytes());
```

This message will only be published successfully if the user
is "guest".

## Additional Layer of Authentication

If security is a serious concern, you should probably
combine the use of this feature
with [TLS-enabled](./ssl) connections, possibly with peer certificate chain verification
of clients performed by the server.

## Special Cases: the Impersonator Tag

Occasionally it may be useful to allow an application to forge a
`user-id`. In order to permit this, the publishing user can have
its <code>impersonator</code> tag set. By default, no users have
this tag set. In particular, the <code>administrator</code> tag
does not allow this.

## Federation Interactions

The [federation plugin](./federation) can deliver
messages from an upstream on which the <code>user-id</code>
property is set. By default it will clear this property (since
it has no way to know whether the upstream broker is
trustworthy). If the <code>trust-user-id</code> property on an
upstream is set, then it will pass the <code>user-id</code>
property through from the upstream broker, assuming it to have
been validated there.
