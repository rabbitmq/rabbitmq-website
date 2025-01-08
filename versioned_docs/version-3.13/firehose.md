---
title: Firehose Tracer
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

# Firehose Tracer

## Overview {#overview}

Sometimes, during development or debugging, it's useful to
be able to see every message that is published, and every
message that is delivered. RabbitMQ has a "firehose"
feature, where the administrator can turn on (on a per-node,
per-vhost basis) an exchange to which publish- and
delivery-notifications should be CCed.

These notifications are close to what's happening on the
wire - for example you will see unacked messages.

When the feature is turned off, it has no effect on
performance; when it is turned on, performance will drop
somewhat due to additional messages being generated and
routed.

## Turning on firehose {#enabling}


Before turning on the feature, decide which node, and which vhost, should have it turned on.
The following examples assume the default vhost, "`/`", and the default node
"`rabbit@(hostname)`". Use the
`-n` argument to specify a node other than,
and the `-p` argument to specify another
vhost.

Next, within the chosen vhost declare queues, bind them to the
topic exchange `amq.rabbitmq.trace`, and
begin consuming.

Finally, to turn on firehose tracing with

```bash
rabbitmqctl trace_on -p [virtual host]
```


## Turn off firehose {#disabling}

To turn off Firehose, run

```bash
rabbitmqctl trace_off -p [virtual host]
```

Don't forget to clean up any queues that were used to consume events from the Firehose.

Note that the firehose state is not persistent; it will
default of off at server start time.


## Firehose Event Message Format {#format}

The firehose publishes messages to the topic exchange
`amq.rabbitmq.trace`. In this section we refer to the messages consumed and inspected
via the Firehose mechanism as "traced messages".

Traced message routing key will be either "`publish.{exchangename}`" (for messages
entering the node), or "`deliver.{queuename}`" (for messages that are delivered to consumers).

Traced message headers containing metadata about the original message:

<table>
  <tr><th>Header</th><th>Type</th><th>Description</th></tr>
  <tr>
    <td>exchange_name</td>
    <td>longstr</td>
    <td>
      name of the exchange to which the message was
      published
    </td>
  </tr>
  <tr>
    <td>routing_keys</td>
    <td>array</td>
    <td>
      routing key plus contents of
      <a href="./sender-selected">`CC` and
      `BCC` headers</a>
    </td>
  </tr>
  <tr>
    <td>properties</td>
    <td>table</td>
    <td><a href="https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/pdf/amqp-xml-doc0-9-1.pdf">content properties</a> (message metadata map)</td>
  </tr>
  <tr>
    <td>node</td>
    <td>longstr</td>
    <td>Erlang node on which the trace message was generated</td>
  </tr>
  <tr>
    <td>redelivered</td>
    <td>signedint</td>
    <td>
      whether the message has its redelivered flag set
      (messages leaving the broker only)
    </td>
  </tr>
</table>

Traced message body corresponding to the body of the original message.


## Tracing plugin {#tracing-plugin}

The `rabbitmq_tracing` <a href="./plugins">plugin</a> builds on top of the tracer
and provides a GUI to capture traced messages and log them
in text or JSON format files.
