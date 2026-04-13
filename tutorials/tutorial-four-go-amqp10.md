---
title: RabbitMQ tutorial - Routing (AMQP 1.0)
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';
import T4DiagramToC from '@site/src/components/Tutorials/T4DiagramToC.md';
import T4DiagramDirectX from '@site/src/components/Tutorials/T4DiagramDirectX.md';
import T4DiagramMultipleBindings from '@site/src/components/Tutorials/T4DiagramMultipleBindings.md';

# RabbitMQ tutorial - Routing

## Routing
### (using the AMQP 1.0 Go client)

<TutorialsHelp/>

<T4DiagramToC/>

In the [previous tutorial](./tutorial-three-go-amqp10) we built a simple publish/subscribe system. We were able to broadcast log messages to many receivers. 

In this tutorial we're going to add a feature to it - we're going to make it
possible to subscribe only to a subset of the messages. For example, we will be
able to direct only critical error messages to a log file (to save disk space),
while still being able to print all of the log messages on the console.

Bindings
--------

In previous examples we were already creating bindings. You may recall code like:

```go
_, err = conn.Management().Bind(ctx, &rmq.ExchangeToQueueBindingSpecification{
    SourceExchange:   "logs",
    DestinationQueue: qInfo.Name(),
    BindingKey:       "",
})
```

A binding is a relationship between an exchange and a queue. This can be
simply read as: the queue is interested in messages from this exchange.

The binding key is used differently depending on the exchange type. With a
`direct` exchange, messages are routed to queues whose binding key exactly matches
the routing key of the message.

<T4DiagramDirectX/>

This logic allows for selective message delivery. Let's illustrate this with an
example:

<T4DiagramMultipleBindings/>

In this setup, we can see the `direct` exchange `X` with two queues bound to it.
The first queue is bound with binding key `orange`, and the second has two
bindings, one with binding key `black` and one with `green`.

In such a setup a message published to the exchange with a routing key
`orange` will be routed to queue `Q1`. Messages with a routing key of `black`
or `green` will go to `Q2`. All other messages will be discarded.

Multiple bindings
-----------------

<T4DiagramMultipleBindings/>

It is perfectly legal to bind multiple queues with the same binding key. In our
example we could add a binding between `X` and `Q1` with binding key `black`.
In that case, the `direct` exchange will behave like `fanout` and will broadcast
the message to all the matching queues. A message with routing key `black` would
be delivered to both `Q1` and `Q2`.

Emitting logs
-------------

We'll use this model for our logging system. Instead of `fanout` we'll send
messages to a `direct` exchange. We'll supply the log level as the `routing key`.
That way the receiving program will be able to select the severity level it
wants to log. Let's start with emitting logs:

```bash
go run emit_log_direct.go warn "A warning message"
go run emit_log_direct.go error "An error message"
```

See [the tutorial source code](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/emit_log_direct.go) for the full implementation. The key difference from the previous tutorial is using `DirectExchangeSpecification` and providing routing keys when binding and publishing.

Subscribing
-----------

Receiving will work similarly to the previous tutorial, but with one
difference — we'll create a new binding for each severity level we're
interested in:

```bash
go run receive_logs_direct.go info warn
```

This will receive only messages with severity level `info` or `warn`.

See [the full `receive_logs_direct.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/receive_logs_direct.go) for the implementation. The consumer binds to multiple routing keys using `DirectExchangeSpecification` with separate bindings per key.

Putting it all together
-----------------------

The full code examples are available at:

- [`emit_log_direct.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/emit_log_direct.go)
- [`receive_logs_direct.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/receive_logs_direct.go)

The main pattern is using `DirectExchangeSpecification` instead of `FanOutExchangeSpecification`, and binding queues with specific routing keys instead of empty binding keys.

Now we can move on to [tutorial 5](./tutorial-five-go-amqp10) to learn about pattern-based routing with topic exchanges.
