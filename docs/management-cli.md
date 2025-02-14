---
title: Management Command Line Tool
displayed_sidebar: docsSidebar
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

# rabbitmqadmin v2, a Command Line Tool for the HTTP API

[`rabbitmqadmin` v2](https://github.com/rabbitmq/rabbitmqadmin-ng) is a command line tool that uses the HTTP API.

It supports many of the operations available in the management UI:

 * Listing objects (virtual hosts, users, queues, streams, permissions, policies, and so on)
 * Creating objects
 * Deleting objects
 * Access to cluster and node metrics
 * Run [health checks](./monitoring#health-checks)
 * Listing [feature flag](./feature-flags) state
 * Listing [deprecated features](./deprecated-features) in use across the cluster
 * [Definition](./definitions) export and import
 * Closing connections
 * Rebalancing of queue leaders across cluster nodes

Note that `rabbitmqadmin` is not a replacement for [rabbitmqctl](./man/rabbitmqctl.8) or
[rabbitmq-plugins](./man/rabbitmq-plugins.8) as the HTTP API intentionally doesn't expose certain operations.


## `rabbitmqadmin` v2

[This generation of `rabbitmqadmin`](https://github.com/rabbitmq/rabbitmqadmin-ng) is a standalone project that
has its own development cycle that's independent from that of RabbitMQ.

It is distributed as a native binary.

### Downloads

Binaries for x86-64 Linux, aarch64 Linux, aarch64 macOS and x86-64 Windows
are distributed via [GitHub releases](https://github.com/rabbitmq/rabbitmqadmin-ng/releases).


## Usage

### Exploring Available Command Groups and Sub-commands

To explore what command groups are available, use

```shell
rabbitmqadmin help
```

which will output a list of command groups:

```
Usage: rabbitmqadmin [OPTIONS] <command>

Commands:
  show                 overview
  list                 lists objects by type
  declare              creates or declares things
  delete               deletes objects
  purge                purges queues
  health_check         runs health checks
  close                closes connections
  rebalance            rebalances queue leaders
  definitions          operations on definitions
  export               see 'definitions export'
  import               see 'definitions import'
  feature_flags        operations on feature flags
  deprecated_features  operations on deprecated features
  publish              publishes (inefficiently) message(s) to a queue or a stream. Only suitable for development and test environments.
  get                  fetches message(s) from a queue or stream via polling. Only suitable for development and test environments.
  tanzu                Tanzu RabbitMQ-specific commands
  help                 Print this message or the help of the given subcommand(s)
```

To explore commands in a specific group, use

```shell
rabbitmqadmin {group name} help
```

### Exploring the CLI with `help`, `--help`

To learn about what command groups and specific commands are available, run

``` shell
rabbitmqadmin help
```

This flag can be appended to a command or subcommand to get command-specific documentation:

```shell
rabbitmqadmin declare queue --help
# => creates or declares things
# =>
# => Usage: rabbitmqadmin declare [object]
# => ...
```

Alternatively, the `help` subcommand can be given a command name. It's the equivalent
of tagging on `--help` at the end of command name:

```shell
rabbitmqadmin declare help queue
# => creates or declares things
# =>
# => Usage: rabbitmqadmin declare [object]
# => ...
```

More specific examples are covered in the Examples section below.


### Interactive vs. Use in Scripts

Like the original version, `rabbitmqadmin` v2 is first and foremost built for interactive use
by humans. Many commands will output formatted tables, for example:

```shell
rabbitmqadmin show overview
```

will output a table that looks like this:

```
┌──────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Overview                                                                                                             │
├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ key              │ value                                                                                             │
├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Product name     │ RabbitMQ                                                                                          │
├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Product version  │ 4.0.6                                                                                             │
├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ RabbitMQ version │ 4.0.6                                                                                             │
├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Erlang version   │ 26.2.5.8                                                                                          │
├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Erlang details   │ Erlang/OTP 26 [erts-14.2.5.7] [source] [64-bit] [smp:10:10] [ds:10:10:10] [async-threads:1] [jit] │
└──────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

As it is easy to observe, parsing such output in a script will be challenging.

For this reason, `rabbitmqadmin` v2 can render results in a way that would be much more friendly
for scripting if the `--non-interactive` flag is passed. It is a global flag so it must be
passed before the command and subcommand name:

```shell
rabbitmqadmin --non-interactive show overview
```

The output of the above command will not include any table borders and will is much easier to parse
as a result:

```
 key
 Product name      RabbitMQ
 Product version   4.0.6
 RabbitMQ version  4.0.6
 Erlang version    26.2.5.8
 Erlang details    Erlang/OTP 26 [erts-14.2.5.7] [source] [64-bit] [smp:10:10] [ds:10:10:10] [async-threads:1] [jit]
```

### Retrieving Basic Node Information

``` shell
rabbitmqadmin show overview
```

will display essential node information in tabular form.

### Retrieving Connection, Queue/Stream, Channel Churn Information

Helps assess connection, queue/stream, channel [churn metrics](./connections#high-connection-churn) in the cluster.

``` shell
rabbitmqadmin show churn
```

### Listing cluster nodes

``` shell
rabbitmqadmin list nodes
```

### Listing virtual hosts

``` shell
rabbitmqadmin list vhosts
```

### Listing users

``` shell
rabbitmqadmin list users
```

### Listing queues

``` shell
rabbitmqadmin list queues
```

``` shell
rabbitmqadmin --vhost "monitoring" list queues
```

### Listing exchanges

``` shell
rabbitmqadmin list exchanges
```

``` shell
rabbitmqadmin --vhost "events" list exchanges
```

### Listing bindings

``` shell
rabbitmqadmin list bindings
```

``` shell
rabbitmqadmin --vhost "events" list bindings
```

### Create a Virtual Host

```shell
rabbitmqadmin declare vhost --name "vh-789" --default-queue-type "quorum" --description "Used to reproduce issue #789"
```

### Delete a Virtual Host

```shell
rabbitmqadmin delete vhost --name "vh-789"
```

```shell
# --idempotently means that 404 Not Found responses will not be  considered errors
rabbitmqadmin delete vhost --name "vh-789" --idempotently
```


### Declare a Queue

```shell
rabbitmqadmin --vhost "events" declare queue --name "target.quorum.queue.name" --type "quorum" --durable true
```

```shell
rabbitmqadmin --vhost "events" declare queue --name "target.stream.name" --type "stream" --durable true
```

```shell
rabbitmqadmin --vhost "events" declare queue --name "target.classic.queue.name" --type "classic" --durable true --auto-delete false
```

### Purge a queue

```
rabbitmqadmin --vhost "events" purge queue --name "target.queue.name"
```

### Delete a queue

``` shell
rabbitmqadmin --vhost "events" delete queue --name "target.queue.name"
```

``` shell
# --idempotently means that 404 Not Found responses will not be considered errors
rabbitmqadmin --vhost "events" delete queue --name "target.queue.name" --idempotently
```

### Declare an Exchange

```shell
rabbitmqadmin --vhost "events" declare exchange --name "events.all_types.topic" --type "topic" --durable true
```

```shell
rabbitmqadmin --vhost "events" declare exchange --name "events.all_type.uncategorized" --type "fanout" --durable true --auto-delete false
```

```shell
rabbitmqadmin --vhost "events" declare exchange --name "local.random.c60bda92" --type "x-local-random" --durable true
```

### Delete an exchange

``` shell
rabbitmqadmin --vhost "events" delete exchange --name "target.exchange.name"
```

``` shell
# --idempotently means that 404 Not Found responses will not be  considered errors
rabbitmqadmin --vhost "events" delete exchange --name "target.exchange.name" --idempotently
```

### Inspecting Node Memory Breakdown

There are two commands for reasoning about target [node's memory footprint](./memory-use):

```shell
# displays a breakdown in bytes
rabbitmqadmin show memory_breakdown_in_bytes --node 'rabbit@hostname'
```

```shell
# displays a breakdown in percent
rabbitmqadmin show memory_breakdown_in_percent --node 'rabbit@hostname'
```

Example output of `show memory_breakdown_in_percent`:

```
┌────────────────────────────────────────┬────────────┐
│ key                                    │ percentage │
├────────────────────────────────────────┼────────────┤
│ total                                  │ 100%       │
├────────────────────────────────────────┼────────────┤
│ Binary heap                            │ 45.10%     │
├────────────────────────────────────────┼────────────┤
│ Allocated but unused                   │ 23.45%     │
├────────────────────────────────────────┼────────────┤
│ Quorum queue ETS tables                │ 23.05%     │
├────────────────────────────────────────┼────────────┤
│ Other processes                        │ 5.32%      │
├────────────────────────────────────────┼────────────┤
│ Other (used by the runtime)            │ 4.98%      │
├────────────────────────────────────────┼────────────┤
│ Code                                   │ 4.54%      │
├────────────────────────────────────────┼────────────┤
│ Client connections: others processes   │ 3.64%      │
├────────────────────────────────────────┼────────────┤
│ Management stats database              │ 3.48%      │
├────────────────────────────────────────┼────────────┤
│ Client connections: reader processes   │ 3.22%      │
├────────────────────────────────────────┼────────────┤
│ Plugins and their data                 │ 3.12%      │
├────────────────────────────────────────┼────────────┤
│ Other (ETS tables)                     │ 1.55%      │
├────────────────────────────────────────┼────────────┤
│ Metrics data                           │ 0.66%      │
├────────────────────────────────────────┼────────────┤
│ AMQP 0-9-1 channels                    │ 0.40%      │
├────────────────────────────────────────┼────────────┤
│ Message store indices                  │ 0.27%      │
├────────────────────────────────────────┼────────────┤
│ Atom table                             │ 0.24%      │
├────────────────────────────────────────┼────────────┤
│ Client connections: writer processes   │ 0.19%      │
├────────────────────────────────────────┼────────────┤
│ Quorum queue replica processes         │ 0.10%      │
├────────────────────────────────────────┼────────────┤
│ Stream replica processes               │ 0.07%      │
├────────────────────────────────────────┼────────────┤
│ Mnesia                                 │ 0.02%      │
├────────────────────────────────────────┼────────────┤
│ Metadata store                         │ 0.02%      │
├────────────────────────────────────────┼────────────┤
│ Stream coordinator processes           │ 0.02%      │
├────────────────────────────────────────┼────────────┤
│ Classic queue processes                │ 0.00%      │
├────────────────────────────────────────┼────────────┤
│ Metadata store ETS tables              │ 0.00%      │
├────────────────────────────────────────┼────────────┤
│ Stream replica reader processes        │ 0.00%      │
├────────────────────────────────────────┼────────────┤
│ Reserved by the kernel but unallocated │ 0.00%      │
└────────────────────────────────────────┴────────────┘
```

Note that there are [two different supported strategies](./memory-use#strategies)
for computing memory footprint of a node. `rabbitmqadmin` will use the greater value
for 100% when computing the relative share in percent for each category.

Other factors that can affect the precision of percentage values reported  are [runtime allocator](./memory-use#preallocated-memory)
behavior nuances and the [kernel page cache](./memory-use#page-cache).

### List feature flags and their state

```shell
rabbitmqadmin feature_flags list
```

```shell
# same command as above
rabbitmqadmin list feature_flags
```

### Enable a feature flag

```shell
rabbitmqadmin feature_flags enable rabbitmq_4.0.0
```

### Enable all stable feature flags

```shell
rabbitmqadmin feature_flags enable_all
```

### List deprecated features in use in the cluster

```shell
rabbitmqadmin deprecated_features list_used
```

### List all deprecated features

```shell
rabbitmqadmin deprecated_features list
```

```shell
# same command as above
rabbitmqadmin list deprecated_features
```


## Configuration Files

`rabbitmqadmin` v2 supports [TOML](https://toml.io/en/)-based configuration files
stores groups of HTTP API connection settings under aliases ("node names" in original `rabbitmqadmin` speak).

Here is an example `rabbitmqadmin` v2 configuration file:

```toml
[local]
hostname = "localhost"
port = 15672
username = "lolz"
password = "lolz"
vhost = '/'

[staging]
hostname = "192.168.20.31"
port = 15672
username = "staging-2387a72329"
password = "staging-1d20cfbd9d"

[production]
hostname = "(redacted)"
port = 15671
username = "user-2ca6bae15ff6b79e92"
password = "user-92ee4c479ae604cc72"
```

Instead of specifying `--hostname` or `--username` on the command line to connect to
a cluster (or specific node) called `staging`, a `--node` alias can be specified instead:

```shell
# will use the settings from the section called [staging]
rabbitmqadmin --node staging show churn
```

Default configuration file path is at `$HOME/.rabbitmqadmin.conf`, as it was in
the original version of `rabbitmqadmin`. It can be overridden on the command line:

```shell
# will use the settings from the section called [staging]
rabbitmqadmin --config $HOME/.configuration/rabbitmqadmin.conf --node staging show churn
```

## Breaking or Potentially Breaking Changes Compared to v1

### Some Non-Essential Features Were Dropped

`rabbitmqadmin` v2 does not support

 * Sorting of results. Instead, use `--non-interactive` and parse the spaces-separated
   output. Many modern tools for working with data parse it into a table, sort the data set,
   filter the results, and son. In fact, these features for data processing are ready available [in some shells](https://www.nushell.sh/)
 * Column selection. This feature may be reintroduced
 * JSON output for arbitrary commands (with the exception of `definitions` commands).
   Use the [HTTP API directly](./management#http-api) if you need to work with JSON
 * CSV output for arbitrary commands. This format may be reintroduced

### --snake-case for Command Options

`rabbitmqadmin` v1 used `lower_case` for named command arguments, for example:

```shell
# Note: auto_delete
rabbitmqadmin-v1 --vhost "vh-2" declare queue name="qq.1" type="quorum" durable=true auto_delete=false
```

`rabbitmqadmin` v2 uses a more typical `--snake-case` format for the same arguments:

```shell
# Note: --auto-delete
rabbitmqadmin --vhost "vh-2" declare queue --name "qq.1" --type "quorum" --durable true --auto-delete false
```

### Global Arguments Come First

Global flags in `rabbitmqadmin` v2 must precede the command category (e.g. `list`) and the command itself,
namely various HTTP API endpoint options and `--vhost`:

```shell
rabbitmqadmin --vhost "events" declare queue --name "target.quorum.queue.name" --type "quorum" --durable true
```

### --prefix Overrides API Path Prefix

In `rabbitmqadmin` v1, `--path-prefix` appended to the default [API path prefix](https://rabbitmq.com/docs/management#path-prefix).
In this version, the value passed to `--path-prefix` will be used as given, in other words,
it replaces the default prefix, `/api`.

### Configuration File Format Moved to TOML

`rabbitmqadmin` v1 supported ini configuration files that allowed
the user to group a number of command line values under a name, e.g. a cluster or node nickname.

Due to the "no dependencies other than Python" design goal of `rabbitmqadmin` v1, this feature was not really tested,
and the specific syntax (that of ini files, supported by Python's [`ConfigParser`](https://docs.python.org/3/library/configparser.html)) linting, parsing or generation tools were not really available.

`rabbitmqadmin` v2 replaces this format with [TOML](https://toml.io/en/), a popular configuration standard
with [verification and linting tools](https://www.toml-lint.com/), as well as very mature parser
that is not at all specific to `rabbitmqadmin` v2.

Here is an example `rabbitmqadmin` v2 configuration file:

```toml
[local]
hostname = "localhost"
port = 15672
username = "lolz"
password = "lolz"
vhost = '/'

[staging]
hostname = "192.168.20.31"
port = 15672
username = "staging-2387a72329"
password = "staging-1d20cfbd9d"

[production]
hostname = "(redacted)"
port = 15671
username = "user-efe1f4d763f6"
password = "(redacted)"
```


## `rabbitmqadmin` v1

`rabbitmqadmin` v1 is the original CLI tool for the HTTP API, historically developed
as part of the [management plugin](./management/) and distributed with it.

It is no longer under active development.

### Obtaining `rabbitmqadmin` v1

:::important

Consider switching to `rabbitmqadmin` v2. The original `rabbitmqadmin` is no longer under
active development.

:::

`rabbitmqadmin` v1 can be downloaded from any RabbitMQ node that has
the management plugin enabled. Navigate to `http://{hostname}:15672/cli/rabbitmqadmin` to download it.
The tool requires a supported version of Python to be installed.

Alternatively, `rabbitmqadmin` v1 can be downloaded [from GitHub](https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/v4.0.x/deps/rabbitmq_management/bin/rabbitmqadmin).
