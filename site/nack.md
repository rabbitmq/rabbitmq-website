<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Negative Acknowledgements

## <a id="overview" class="anchor" href="#overview">Overview</a>

Consumers in AMQP 0-9-1 can choose to use [manual acknowledgements](./confirms.html)
of deliveries.

The [AMQP 0-9-1 specification](./specification.html) defines the `basic.reject`
method that allows clients to reject individual, delivered
messages, instructing the broker to either discard them or
requeue them. Unfortunately, `basic.reject`
provides no support for negatively acknowledging messages in
bulk.

To solve this, RabbitMQ supports the `basic.nack`
method that provides all the functionality of
`basic.reject` whilst also allowing for bulk
processing of messages.


## <a id="usage" class="anchor" href="#usage">Usage</a>

To reject messages in bulk, clients set the `multiple` flag of the `basic.nack`
method to `true`. The broker will then reject all
unacknowledged, delivered messages up to and including the
message specified in the `delivery_tag` field of the `basic.nack` method. In this respect,
`basic.nack` complements the bulk acknowledgement semantics of `basic.ack`.

Negative acknowledgements work for both [long running consumers](./consumers.html)
and polling-based ones (that use `basic.get`).

When a message is requeued, it will be placed to its original
position in its queue, if possible. If not (due to concurrent
deliveries and acknowledgements from other consumers when
multiple consumers share a queue), the message will be requeued
to a position closer to queue head.

## <a id="examples" class="anchor" href="#examples">Examples</a>

### <a id="java-examples" class="anchor" href="#java-examples">Java</a>

This Java client example rejects a single message consumed via polling (`basic.get`),
asking the broker to requeue it:

<pre class="lang-java">
GetResponse gr = channel.basicGet("some.queue", false);
channel.basicNack(gr.getEnvelope().getDeliveryTag(), false, true);
</pre>

This example rejects two messages with a single call to
the broker (the second argument on
`basicNack` is the `multiple` flag):

<pre class="lang-java">
GetResponse gr1 = channel.basicGet("some.queue", false);
GetResponse gr2 = channel.basicGet("some.queue", false);
channel.basicNack(gr2.getEnvelope().getDeliveryTag(), true, true);
</pre>
