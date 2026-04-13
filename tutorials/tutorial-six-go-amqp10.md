---
title: RabbitMQ tutorial - RPC (AMQP 1.0)
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
import T6DiagramToC from '@site/src/components/Tutorials/T6DiagramToC.md';

# RabbitMQ tutorial - RPC

## RPC
### (using the AMQP 1.0 Go client)

<TutorialsHelp/>

<T6DiagramToC/>

In the [previous tutorial](./tutorial-five-go-amqp10) we learned how to use
topic exchanges to broadcast messages across a distributed system.

In this tutorial we're going to do something completely different - we're going
to implement a request/response pattern using RabbitMQ. This is useful when you
need a remote procedure call between processes. We'll show how to make an RPC
call using RabbitMQ.

Our RPC system will consist of a client and a scalable RPC server. We won't be
using JSON - instead we'll encode a function number and use that to decide what
function to invoke on the RPC server.

Remote procedure call implementation
------------------------------------

If you look at the previous tutorials, each tutorial program was pretty
self-contained and didn't depend on anything else. In this one we'll write two
programs; a client that calls a remote function and a server that implements
the remote functions.

**RPC Server**

The server exposes a function we can call - it computes Fibonacci numbers.

```bash
go run rpc_server.go
# => [x] Awaiting RPC requests
```

The server handles requests from a queue named `rpc_queue`. See
[the full `rpc_server.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/rpc_server.go) for the implementation.

**RPC Client**

The client sends a request and waits for the response:

```bash
go run rpc_client.go 30
# => [x] Requesting fib(30)
# => [.] Got 832040
```

The client sends the request to the `rpc_queue`, and the server responds on a
reply queue. See [the full `rpc_client.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/rpc_client.go)
for the implementation.

Design pattern
--------------

The RPC pattern works like this:

1. The client sends a request message with a `reply_to` address where it expects the response.
2. The RPC worker (server) performs the work and sends the response to the `reply_to` queue.
3. The client receives the response and processes it.

The `rabbitmq-amqp-go-client` handles the message flow using the management
API to declare queues and the consumer/publisher APIs to send/receive messages.

Correlation IDs
---------------

In the implementation, each RPC request includes a correlation ID. This ID is
echoed back in the response so the client can match requests with responses in
case multiple RPC calls are in flight.

Putting it all together
-----------------------

The full code examples are available at:

- [`rpc_server.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/rpc_server.go)
- [`rpc_client.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/rpc_client.go)

To try this, start the RPC server:

```bash
go run rpc_server.go
# => [x] Awaiting RPC requests
```

And in another terminal, call the RPC function:

```bash
go run rpc_client.go 10
# => [x] Requesting fib(10)
# => [.] Got 55
```

The RPC pattern demonstrates how RabbitMQ can be used for synchronous
request/response communication in a distributed system, complementing the
asynchronous patterns shown in earlier tutorials.

Congratulations! We've covered the basics of RabbitMQ messaging patterns with AMQP 1.0. For more advanced topics, see the [RabbitMQ documentation](/docs/amqp) and [AMQP 1.0 client libraries](/client-libraries/amqp-client-libraries).
