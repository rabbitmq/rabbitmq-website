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

# Sender-selected Distribution


The routing logic in AMQP 0-9-1 does not offer a way for message
[publishers](./publishers.html) to select intended recipients unless they
bind their queues to the target destination (an exchange).

The RabbitMQ broker treats the "CC" and "BCC" message headers
in a special way to overcome this limitation.
This is the equivalent of entering multiple recipients in the "CC"
or "BCC" field of an email.

The values associated with the "CC" and "BCC" header keys will
be added to the routing key if they are present. The message
will be routed to all destinations matching the routing key
supplied as a parameter to the `basic.publish`
method, as well as the routes supplied in the "CC" and "BCC"
headers. The type of "CC" and "BCC" values must be an array
of [longstr](./amqp-0-9-1-reference.html#domain.longstr)
and these keys are case-sensitive. If the header does not
contain "CC" or "BCC" keys then this extension has no effect.

The "BCC" key and value will be removed from the message
prior to delivery, offering some confidentiality among
consumers. This feature is a deviation from the AMQP 0-9-1
specification which forbids any message modification,
including headers. This feature imposes a small
performance penalty.

This extension is independent of the client library used.
Any AMQP 0-9-1 client with the ability to set header values
at the time of publishing can make use of this extension.
