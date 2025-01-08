---
title: Exchange to Exchange Bindings
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

# Exchange to Exchange Bindings

## Overview {#overview}

In [AMQP 0-9-1](/tutorials/amqp-concepts) the `queue.bind` method binds a queue to an
exchange so that messages flow (subject to various criteria)
from the exchange (the <em>source</em>) to the queue (the
<em>destination</em>). We have introduced an
`exchange.bind` method which binds one
exchange to another exchange. The binding is semantically
identical to exchange-to-queue bindings: unidirectional,
binding keys and exchange types operate as normal, but both
endpoints (the source and destination) of the binding are
exchanges. This allows far richer routing topologies to be
created. Note the `source` and
`destination` fields in the
`exchange.bind` method reflect the flow of
messages: from the exchange at the source, and to the
exchange at the destination.

Just like with `queue.bind`, multiple distinct
bindings can be created between the same
binding-endpoints. We detect and eliminate cycles during
message delivery, and ensure that transitively, over any
routing topology, for every queue to which a given message
is routed, each queue will receive exactly one copy of that
message. Exchanges which are declared as
`auto-delete` will still be removed when all
their bindings are removed, regardless of whether those
bindings are to queues or exchanges. Note that an
auto-delete exchange will only be deleted when bindings for
which the exchange is the <em>source</em> are removed: if
you add exchange-to-exchange bindings for which the given
exchange is the <em>destination</em> then that exchange will
not be auto-deleted on removal of those bindings.

## Java Client Example {#java-example}

Use the `Channel#exchangeBind` method.
The following example binds an exchange `"destination"`
to `"source"` with routing key `"routingKey"`.

```java
Channel ch = conn.createChannel();
ch.exchangeBind("destination", "source", "routingKey");
```

## .NET Client Example {#dotnet-example}

Use the `IModel#ExchangeBind` method.
The following example binds an exchange `"destination"`
to `"source"` with routing key `"routingKey"`.

```csharp
var ch = conn.CreateModel();
ch.ExchangeBind("destination", "source", "routingKey");
```
