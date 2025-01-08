---
title: Erlang RabbitMQ client Library
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

# Erlang RabbitMQ client Library

The RabbitMQ Erlang client library allows Erlang and Elixir applications
to connect to and interact with RabbitMQ nodes.

## Licensing {#licensing}

The library is [open-source](https://github.com/rabbitmq/rabbitmq-erlang-client/),
and is dual-licensed under [the Apache License v2](https://www.apache.org/licenses/LICENSE-2.0)
and [the Mozilla Public License v2.0](https://www.mozilla.org/MPL/2.0/).


## Releases {#releases}

The client library is named `amqp_client` and [distributed via Hex.pm](https://hex.pm/packages/amqp_client)
together with its key dependency, [`rabbit-common`](https://hex.pm/packages/rabbit_common).

### Mix

```elixir
{:rabbit_common, "~> 3.11"}
```

### Rebar 3

```erlang
{rabbit_common, "&version-erlang-client;"}
```

### erlang.mk

```makefile
dep_rabbit_common = hex &version-erlang-client;
```


## Prerequisites

RabbitMQ Erlang client connects to RabbitMQ server nodes.

You will need a running [RabbitMQ node](/docs/download) to use with the client
library.

## Download the Library and Documentation

### The Library

The library is distributed [via hex.pm](https://hex.pm/packages/amqp_client).

### Documentation

Please refer to the [Erlang RabbitMQ user guide](./erlang-client-user-guide).

<a href="https://hexdocs.pm/amqp_client/">RabbitMQ Erlang client edoc</a> is available on hexdocs.pm.

### Other Versions

Consult [the archive](https://hex.pm/packages/amqp_client/versions) if you want
to download a version of the RabbitMQ Erlang Client library other than the above.


## GitHub Repositories

The RabbitMQ Erlang client depends on the RabbitMQ server repository,
a shared library and a code generation library. They all reside in the
[RabbitMQ server repository](https://github.com/rabbitmq/rabbitmq-server/tree/v3.13.x) under `deps`.

Please see the <a href="./build-erlang-client">Erlang client build guide</a> for instructions on
compiling from source code.
