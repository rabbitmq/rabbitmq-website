---
title: Command Line Tools
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Command Line Tools

## Table of Contents

This guide covers a number of topics related to RabbitMQ CLI tools usage:

 * [Overview](#overview)
 * [Installation](#installation) and [requirements](#requirements) for running CLI tools
 * How [CLI tools authenticate to RabbitMQ nodes](#erlang-cookie) and how to [troubleshoote authentication failures](#cli-authentication-failures)
 * [Command line usage](#passing-arguments)
 * [CLI tools and clustering](#cli-and-clustering)
 * How to [address a specific node](#node-names)
 * Caveats around CLI tools [usage in containerized environments](#containers)

## Overview {#overview}

### Standard RabbitMQ CLI Tools

RabbitMQ ships with multiple command line tools, each with a set of related commands:

 * [`rabbitmqctl`](./man/rabbitmqctl.8) for service management and general operator tasks
 * [`rabbitmq-diagnostics`](./man/rabbitmq-diagnostics.8) for diagnostics [monitoring and health checking](./monitoring)
 * [`rabbitmq-plugins`](./man/rabbitmq-plugins.8) for [plugin management](./plugins)
 * [`rabbitmq-queues`](./man/rabbitmq-queues.8) for maintenance tasks on [queues](./queues), in particular [quorum queues](./quorum-queues)
 * [`rabbitmq-streams`](./man/rabbitmq-streams.8) for maintenance tasks on [streams](./streams)
 * [`rabbitmq-upgrade`](./man/rabbitmq-upgrade.8) for maintenance tasks related to [upgrades](./upgrade)

On Windows, the above tool names will end with `.bat`, e.g. `rabbitmqctl` in a Windows installation will
be named `rabbitmqctl.bat`.

### Additional Tools

Additional tools are optional and can be obtained from GitHub:

 * [`rabbitmqadmin` v2](./management-cli) for operator tasks over the [HTTP API](./management#http-api)
 * [`rabbitmq-collect-env`](https://github.com/rabbitmq/support-tools) which collects relevant cluster and environment information
    as well as server logs. This tool is specific to Linux and UNIX-like operating systems.

Different tools cover different usage scenarios. For example, `rabbitmqctl` is usually
only available to RabbitMQ administrator given that it provides full control over a node,
including virtual host, user and permission management, destructive operations
on node's data and so on.

`rabbitmqadmin` is built on top of the HTTP API and uses a different mechanism, and only
requires that the [HTTP API](./management#http-api) port is open for outside connections.

Even though CLI tools ship with the server, most commands [can be used to operate on remote nodes](#remote-nodes).
Plugins can [provide CLI commands](#command-discovery) that will be discovered by CLI tools for explicitly enabled plugins.


## System and Environment Requirements {#requirements}

RabbitMQ CLI tools require a [compatible Erlang/OTP](./which-erlang) version to be installed.

The tools assume that system locale is a UTF-8 one (e.g. `en_GB.UTF-8` or `en_US.UTF-8`). If that's
not the case, the tools may still function correctly but it cannot be guaranteed.
A warning will be emitted in non-UTF-8 locales.


## Installation {#installation}

Except for `rabbitmqadmin`, all of the tools above ship with RabbitMQ and can be found under the `sbin`
directory in installation root. With most package types that directory is added to `PATH` at installation time.
This means that core tools such as `rabbitmq-diagnostics` and `rabbitmqctl` are available on every node
that has RabbitMQ installed.

[Generic UNIX package](./install-generic-unix) users have to make sure that the `sbin` directory under installation
root is added to `PATH` for simpler interactive use. Non-interactive use cases can use full or relative paths without
modifications to the `PATH` environment variable.

[`rabbitmqadmin`](./management-cli) is a standalone tool
that is [distributed via GitHub releases](https://github.com/rabbitmq/rabbitmqadmin-ng/releases).

If interaction from a remote node is required, download and extract the [generic UNIX package](./install-generic-unix)
or use the [Windows installer](./install-windows).

Besides [authentication](#authentication), all configuration for core CLI tools is optional.

Commands that require specific arguments list them in the usage section and will report
any missing arguments when executed.

## Discovering Commands Using the Help Command {#help}

To find out what commands are available, use the `help` command:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl help

rabbitmq-diagnostics help
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat help

rabbitmq-diagnostics.bat help
```
</TabItem>
</Tabs>

The command can display usage information for a particular command:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmq-diagnostics help status
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat help add_vhost

rabbitmq-diagnostics.bat help status
```
</TabItem>
</Tabs>

Alternatively, the `--help` option can be used:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl --help

rabbitmq-diagnostics --help
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat --help

rabbitmq-diagnostics.bat --help
```
</TabItem>
</Tabs>


including for individual commands:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmq-diagnostics status --help
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmq-diagnostics.bat status --help
```
</TabItem>
</Tabs>


## rabbitmqctl {#rabbitmqctl}

[rabbitmqctl](./man/rabbitmqctl.8) is the original CLI tool that ships with RabbitMQ.
It supports a wide range of operations, mostly administrative (operational) in nature.

This includes

 * Stopping node
 * Access to node status, effective configuration, health checks
 * Virtual host management
 * User and permission management
 * Policy management
 * Listing queues, connections, channels, exchanges, consumers
 * Cluster membership management

and more.

`rabbitmqctl` uses a [shared secret authentication mechanism](#erlang-cookie) (described below) with server nodes.

## rabbitmq-queues {#rabbitmq-queues}

[rabbitmq-queues](./man/rabbitmq-queues.8) allows the operator to manage replicas of [replicated queues](./quorum-queues).
It ships with RabbitMQ.

Most commands only support the online mode (when target node is running).

`rabbitmq-queues` uses a [shared secret authentication mechanism](#erlang-cookie) (described below) with server nodes.

## rabbitmq-streams {#rabbitmq-streams}

[rabbitmq-streams](./man/rabbitmq-streams.8) allows the operator to manage replicas of [streams](./streams).
It ships with RabbitMQ.

Most commands only support the online mode (when target node is running).

`rabbitmq-streams` uses a [shared secret authentication mechanism](#erlang-cookie) (described below) with server nodes.

## rabbitmq-diagnostics {#rabbitmq-diagnostics}

[rabbitmq-diagnostics](./man/rabbitmq-diagnostics.8) is the primary tool for inspecting node state.
It has many commands that allow the operator to study various aspects of the system.
It ships with RabbitMQ.

It supports both online (when target node is running) and offline mode (changes
take effect on node restart).

`rabbitmq-diagnostics` uses a [shared secret authentication mechanism](#erlang-cookie) (described below) with server nodes.

## rabbitmq-plugins {#rabbitmq-plugins}

[rabbitmq-plugins](./man/rabbitmq-plugins.8) is a tool that manages plugins:
lists, enables and disables them. It ships with RabbitMQ.

It supports both online (when target node is running) and offline mode (changes
take effect on node restart).

`rabbitmq-plugins` uses a [shared secret authentication mechanism](#erlang-cookie) (described below) with server nodes.

## rabbitmq-upgrade {#rabbitmq-upgrade}

[rabbitmq-upgrade](./man/rabbitmq-upgrade.8) is a tool dedicated to pre-upgrade, upgrade and post-upgrade operations.
It ships with RabbitMQ.

Most commands only support the online mode (when target node is running).

`rabbitmq-upgrade` uses a [shared secret authentication mechanism](#erlang-cookie) (described below) with server nodes.


## Offline Mode {#offline-mode}

`--offline` is a flag supported by `rabbitmq-plugins` commands. When provided, the tool will avoid
contacting the target node and instead operate on plugin files directly.

When the `--offline` flag is used, the command will rely on [environment variables](./configure#customise-environment)
to determine where to find the plugins directory of the local node.

For example, it will respect and use the `RABBITMQ_PLUGINS_DIR` environment variable value
just like a RabbitMQ node would. When `RABBITMQ_PLUGINS_DIR` is overridden for server nodes,
it must also be set identically for the local OS user that invokes CLI tools.


## Authentication {#authentication}

With the exception of `rabbitmqadmin`, RabbitMQ tools use a [shared secret authentication mechanism](#erlang-cookie).
This requires that [inter-node and CLI communication ports](./networking) (by default)
is open for external connections on the target node.


## Using CLI Tools against Remote Server Nodes {#remote-nodes}

CLI tools can be used to talk to remote nodes as well as the local ones. Nodes are identified by [node names](#node-names).
If no node name is specified, `rabbit@{local hostname}` is assumed to be the target. When contacting remote nodes,
the same [authentication requirements](#authentication) apply.

To contact a remote node, use the `--node` (`-n`) option that `rabbitmqctl`, `rabbitmq-diagnostics` and other core CLI tools
accept. The following example contact the node `rabbit@remote-host.local` to find out its status:

```bash
rabbitmq-diagnostics status -n rabbit@remote-host.local
```

Some commands, such as

```bash
rabbitmq-diagnostics status
```

can be used against any node. Others, such as

```bash
rabbitmqctl shutdown
```

or

```bash
rabbitmqctl wait
```

can only be run on the same host or in the same container as their target node. These commands typically
rely on or modify something in the local environment, e.g. the local [enabled plugins file](./plugins).


### Node Names {#node-names}

RabbitMQ nodes are identified by node names. A node name consists of two parts,
a prefix (usually `rabbit`) and hostname. For example, `rabbit@node1.messaging.svc.local`
is a node name with the prefix of `rabbit` and hostname of `node1.messaging.svc.local`.

Node names in a cluster must be unique. If more than one node is running on a given host
(this is usually the case in development and QA environments), they must use
different prefixes, e.g. `rabbit1@hostname` and `rabbit2@hostname`.

CLI tools identify and address server nodes using node names.
Most CLI commands are invoked against a node called target node. To specify a target node,
use the `--node` (`-n`) option. For example, to run a [health check](./monitoring)
on node `rabbit@warp10.local`:

```bash
rabbitmq-diagnostics -n rabbit@warp10 check_alarms
```

Some commands accept both a target node and another node name. For example,
`rabbitmqctl forget_cluster_node` accepts both a target node (that will perform the action)
and a name of the node to be removed.

In a cluster, nodes identify and contact each other using node names. See [Clustering guide](./clustering#node-names)
for details.

When a node starts up, it checks whether it has been assigned a node name. This is done
via the `RABBITMQ_NODENAME` [environment variable](./configure#supported-environment-variables).
If no value was explicitly configured, the node resolves its hostname and prepends `rabbit` to it to compute its node name.

If a system uses fully qualified domain names (FQDNs) for hostnames, RabbitMQ nodes
and CLI tools must be configured to use so called long node names.
For server nodes this is done by setting the `RABBITMQ_USE_LONGNAME` [environment variable](./configure#supported-environment-variables)
to `true`.

For CLI tools, either `RABBITMQ_USE_LONGNAME` must be set or the `--longnames` option
must be specified:

```bash
# this example assumes that host1.messaging.eng.coolcorporation.banana is a hostname
# that successfully resolves
rabbitmq-diagnostics -n rabbit@host1.messaging.eng.coolcorporation.banana check_alarms --longnames
```

### Caveats in Containerized Environments {#containers}

When RabbitMQ is running in a container, there are two common ways of running CLI tools:

1. Do it within the container itself, using [`docker exec`](https://docs.docker.com/reference/cli/docker/container/exec/) and similar
tooling
2. Forward the [relevant inter-node communication ports](./networking#ports) and do it from the host

There are two common problems that may arise with this approach.

#### Shared Secret Mismatch Between The Host and the Container

When CLI tools are run in the host, the local [shared secret](#erlang-cookie) must
match that in the container. When this is not the case, CLI tools will fail
to authenticate and won't be able to perform any operation on the target node.

#### Shared Secret Seeding Race Condition

:::danger
If the [shared secret](#erlang-cookie) used by the container is not pre-seeded, the node
must be allowed to boot before CLI commands can be run against it
:::

When a CLI tool runs on a host where the [shared secret](#erlang-cookie) is not pre-seeded
and before the local booting RabbitMQ node has a chance to create the cookie file, it
will create a confusing situation where the secret seeded may be overwritten
during node boot.

As a result, CLI tools may fail to authenticate, RabbitMQ node may fail to access the created file
and thus stop with an error, and other problematic scenarios that stem from the fact that
the secret does not match.


## Options and Positional Arguments {#passing-arguments}

RabbitMQ CLI tools largely follow existing, long established command line argument parsing conventions.
This section provides some examples and focuses on edge cases and lesser known features.

Different commands take different arguments. Some are named options such as `--node` (aliased as `-n`),
others are positional arguments, such as the username and password arguments in

```bash
rabbitmqctl add_user <username> <password>
```

A specific example:

```bash
rabbitmqctl add_user "a-user" "a-pa$$w0rd"
```

Options can be provided before or after positional arguments with one exception: anything
that follows a double hyphen (`--`) will be treated as positional arguments:

```bash
# all values after the double hyphen (--) will be treated as positional arguments,
# even if they begin with a hyphen or a double hyphen
rabbitmqctl add_user --node rabbit@host1.messaging.eng.coolcorporation.banana -- "a-user" "a-pa$$w0rd"
```

The explicit positional argument separator must be used when positional arguments begin with a hyphen or a double
hyphen (such as generated passwords), to make sure they are not parsed as options:

```bash
# Since "--!a-pa$$w0rd" is explicitly provided as a positional argument, it won't
# be mistakenly considered for an unsupported option, even though it starts with a double hyphen
rabbitmqctl add_user --node rabbit@host1.messaging.eng.coolcorporation.banana -- "a-user" "--!a-pa$$w0rd"
```

Option values can be passed as `--option <value>` or `--option=<value>`. The latter variant must be used
when the value begins with a hyphen (`-`), otherwise it would be treated as an option:

```bash
# an alternative way of providing an option value
rabbitmqctl add_user --node=rabbit@host1.messaging.eng.coolcorporation.banana -- "a-user" "a-pa$$w0rd"
```

`rabbitmqctl`, `rabbitmq-diagnostics`, `rabbitmq-plugins`, and `rabbitmq-queues` support [command aliases](#aliases).


## How CLI Tools Authenticate to Nodes (and Nodes to Each Other): the Erlang Cookie {#erlang-cookie}

RabbitMQ nodes and CLI tools (with the exception of `rabbitmqadmin`) use a
cookie to determine whether they are allowed to communicate with
each other. For a CLI tool and a node to be able to communicate they must have
the same shared secret called the Erlang cookie. The cookie is
just a string of alphanumeric characters up to 255 characters in size.
It is usually stored in a local file. The file
must be only accessible to the owner (e.g. have UNIX permissions of `600` or similar).
Every cluster node must have the same cookie.

If the file does not exist, Erlang VM will automatically create
one with a randomly generated value when the RabbitMQ server
starts up.

Erlang cookie generation should be done at cluster deployment stage, ideally using automation
and orchestration tools.

### Cookie File Locations {#cookie-file-locations}

#### Linux, MacOS, *BSD

On UNIX systems, the cookie will be typically
located in `/var/lib/rabbitmq/.erlang.cookie` (used by the server)
and `$HOME/.erlang.cookie` (used by CLI tools). Note that since the value
of `$HOME` varies from user to user, it's necessary to place a copy of
the cookie file for each user that will be using the CLI tools.
This applies to both non-privileged users and `root`.

RabbitMQ nodes will log its effective user's home directory location early on boot.

#### Community Docker Image and Kubernetes

[Docker community RabbitMQ image](https://github.com/docker-library/rabbitmq/) uses `RABBITMQ_ERLANG_COOKIE` environment variable value
to populate the cookie file.

Configuration management and container orchestration tools that use this image
must make sure that every RabbitMQ node container in a cluster uses the same value.

In the context of Kubernetes, the value must be specified in the
[deployment file](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/).
For instance, this can be seen in the [RabbitMQ on Kubernetes examples repository](https://github.com/rabbitmq/diy-kubernetes-examples).

#### Windows

On Windows, the cookie location depends on a few factors:

 * Whether the `HOMEDRIVE` and `HOMEPATH` environment variables are both set
 * Erlang version: prior to 20.2 (these are no longer supported by any [maintained release series of RabbitMQ](/release-information)) or 20.2 and later

##### Erlang 20.2 or later

With Erlang versions starting with 20.2, the cookie file locations are:

 * `%HOMEDRIVE%%HOMEPATH%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie` for user `%USERNAME%`) if both the `HOMEDRIVE` and `HOMEPATH` environment variables are set
 * `%USERPROFILE%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie`) if `HOMEDRIVE` and `HOMEPATH` are not both set
 * For the RabbitMQ Windows service - `%USERPROFILE%\.erlang.cookie` (usually `C:\WINDOWS\system32\config\systemprofile`)

If the Windows service is used, the cookie should be copied from
`C:\Windows\system32\config\systemprofile\.erlang.cookie` to the expected
location for users running commands like `rabbitmqctl.bat`.

### Overriding Using CLI and Runtime Command Line Arguments

As an alternative, the option "`-setcookie <value>`" can be added
to `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` <a href="./configure">environment variable value</a>
to override the cookie value used by a RabbitMQ node:

```bash
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-setcookie cookie-value"
```

CLI tools can take a cookie value using a command line flag:

```bash
rabbitmq-diagnostics status --erlang-cookie "cookie-value"
```

Both are **the least secure options** and generally **not recommended**.

### Troubleshooting {#cookie-file-troubleshooting}

#### CLI Tools

Starting with [version `3.8.6`](/release-information), `rabbitmq-diagnostics` includes a command
that provides relevant information on the Erlang cookie file used by CLI tools:

```bash
rabbitmq-diagnostics erlang_cookie_sources
```

The command will report on the effective user, user home directory and the expected location
of the cookie file:

```
Cookie File

Effective user: antares
Effective home directory: /home/cli-user
Cookie file path: /home/cli-user/.erlang.cookie
Cookie file exists? true
Cookie file type: regular
Cookie file access: read
Cookie file size: 20

Cookie CLI Switch

--erlang-cookie value set? false
--erlang-cookie value length: 0

Env variable  (Deprecated)

RABBITMQ_ERLANG_COOKIE value set? false
RABBITMQ_ERLANG_COOKIE value length: 0
```

#### Server Nodes

When a node starts, it will [log](./logging) the home directory location of its effective user:

```
node           : rabbit@cdbf4de5f22d
home dir       : /var/lib/rabbitmq
```

Unless any [server directories](./relocate) were overridden, that's the directory where
the cookie file will be looked for, and created by the node on first boot if it does not already exist.

In the example above, the cookie file location will be `/var/lib/rabbitmq/.erlang.cookie`.

#### Hostname Resolution

Starting with [RabbitMQ `3.8.6`](/release-information), CLI tools provide two commands that help verify
that hostname resolution on a node works as expected. The commands are not meant to replace
[`dig`](https://en.wikipedia.org/wiki/Dig_(command)) and other specialised DNS tools but rather
provide a way to perform most basic checks while taking [Erlang runtime hostname resolver features](https://erlang.org/doc/apps/erts/inet_cfg.html)
into account.

The commands are covered in the [Networking guide](./networking#dns-verify-resolution).

## Authentication Failures {#cli-authentication-failures}

When the cookie is misconfigured (for example, not identical), RabbitMQ nodes will log errors
such as "Connection attempt from disallowed node", "", "Could not auto-cluster".

For example, when a CLI tool connects and tries to authenticate using a mismatching secret value:

```
2020-06-15 13:03:33 [error] <0.1187.0> ** Connection attempt from node 'rabbitmqcli-99391-rabbit@warp10' rejected. Invalid challenge reply. **
```

When a CLI tool such as `rabbitmqctl` fails to authenticate with RabbitMQ,
the message usually says

```
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed
* suggestion: hostname mismatch?
* suggestion: is the cookie set correctly?
* suggestion: is the Erlang distribution using TLS?
```

This means that TCP connection from a CLI tool to a RabbitMQ node
succeeded but authentication attempt was rejected by the server. The
message also mentions several most common reasons for that, which are
covered next.

#### Possible Reason 1: Misplaced or Missing Cookie File

An incorrectly placed cookie file or cookie value mismatch are most
common scenarios for such failures.

RabbitMQ node logs its cookie hash on start. CLI tools print their
cookie hash value when they fail to authenticate with the target node.

When a recent Erlang/OTP version is used, authentication failures contain
more information and cookie mismatches can be identified better:

```
rabbit@warp10:
  * connected to epmd (port 4369) on warp10
  * epmd reports node 'rabbit' running on port 25672
  * TCP connection succeeded but Erlang distribution failed

  * Authentication failed (rejected by the remote node), please check the Erlang cookie

current node details:
- node name: 'rabbitmq-cli-63@warp10'
- home dir: /home/username
- cookie hash: Sg08R8+G85EYHZ3H/9NUfg==
```


#### Possible Reason 2: Node Name Type Mismatch

If RabbitMQ nodes are configured to use long node names (`RABBITMQ_USE_LONGNAME` is exported to `true`),
so should CLI tools via the same environment variable or the `--longnames` command line flag introduced in 3.7.0.

#### Possible Reason 3: Inter-node Connections Require TLS

If RabbitMQ is set up to [encrypt inter-node and CLI connections using TLS](./clustering-ssl),
CLI tools also must use TLS and therefore require additional options.
Non-TLS connections from other nodes and CLI tools will fail.


#### Possible Reason 4: Hostname Mismatch

Other reasons include a hostname mismatch in node name used by the target RabbitMQ node and that provided
to the CLI tool (e.g. via the `-n` flag). For example, if a node runs using `rabbit@rmq1.eng.megacorp.local`
as its name but `rabbitmqctl` is invoked as

```bash
rabbitmq-diagnostics status -n rabbit@rmq-dev.eng.megacorp.local
```

then even if `rmq-dev.eng.megacorp.local` and `rmq1.eng.megacorp.local` resolve to the same IP address,
the server will reject `rabbitmqctl`'s authentication attempt. This scenario is relatively
rare.

When a recent Erlang/OTP version is used, authentication failures contain
more information and hostname mismatches can be identified better:

```
rabbit@localhost:
  * connected to epmd (port 4369) on localhost
  * epmd reports node 'rabbit' running on port 25672
  * TCP connection succeeded but Erlang distribution failed

  * Hostname mismatch: node "rabbit@warp10" believes its host is different. Please ensure that hostnames resolve the same way locally and on "rabbit@warp10"


current node details:
- node name: 'rabbitmq-cli-30@warp10'
- home dir: /Users/antares
- cookie hash: Sg08R8+G85EYHZ3H/9NUfg==
```


#### Other Possible Reasons

Just like with any network connection, CLI-to-node connections can fail due to

 * Hostname resolution failures
 * Incorrect IP routing
 * TCP port access blocked (firewalls, etc)

and so on.

[RabbitMQ Networking guide](./networking) contains a section on troubleshooting of networking-related issues.


## Managing Nodes {#managing-nodes}

### Getting node status

To retrieve node status, use `rabbitmq-diagnostics status` or `rabbitmq-diagnostics.bat status`
with an optional `--node` target:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmq-diagnostics  status

rabbitmq-diagnostics  status --node rabbit@target-hostname.local
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmq-diagnostics .bat status

rabbitmq-diagnostics .bat status --node rabbit@target-hostname.local
```
</TabItem>
</Tabs>

### Starting a node

How RabbitMQ nodes are started depends on the package type used:

 * When using Debian and RPM packages on modern Linux distributions, nodes are [managed using `systemd`](./install-debian#managing-service)
 * When using Windows installer, nodes are usually [managed by the Windows service manager](./install-windows#managing)
 * When using Homebrew formula, nodes are managed using `brew services`
 * When using generic UNIX build or binary Windows build, nodes are started using `sbin/rabbitmq-server` and `sbin/rabbitmq-server.bat`, respectively, in the installation root

### Stopping a node

To stop a node, consider using the same service management tooling used when starting
the node, which depends on the package typed used when RabbitMQ was installed.

To stop a node using RabbitMQ CLI tools, use
`rabbitmqctl shutdown` or `rabbitmqctl.bat shutdown` with an optional `--node` target:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl shutdown
rabbitmqctl shutdown --node rabbit@target-hostname.local
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat shutdown
rabbitmqctl.bat shutdown --node rabbit@target-hostname.local
```
</TabItem>
</Tabs>

## rabbitmqadmin {#http-api-cli}

[rabbitmqadmin](./management-cli) is a command line tool that's built on top of [RabbitMQ HTTP API](./management).
It is not a replacement for `rabbitmqctl` and provides access to a subset of most commonly
performed operations provided by the [management UI](./management).

`rabbitmqadmin` uses HTTP API authentication mechanism (basic HTTP authentication).

It is a native binary and must be [downloaded separately](https://github.com/rabbitmq/rabbitmqadmin-ng/releases) from the RabbitMQ
distribution.


## "Node-local" and "Clusterwide" Commands {#cli-and-clustering}

Client connections, channels and queues will be distributed across cluster nodes.
Operators need to be able to inspect and [monitor](./monitoring) such resources
across all cluster nodes.

CLI tools such as [rabbitmqctl](./man/rabbitmqctl.8) and
`rabbitmq-diagnostics` provide commands that inspect resources and
cluster-wide state. Some commands focus on the state of a single node
(e.g. `rabbitmq-diagnostics environment` and `rabbitmq-diagnostics
status`), others inspect cluster-wide state. Some examples of the
latter include `rabbitmqctl list_connections`, `rabbitmqctl
list_mqtt_connections`, `rabbitmqctl list_stomp_connections`,
`rabbitmqctl list_users`, `rabbitmqctl list_vhosts` and so on.

Such "cluster-wide" commands will often contact one node
first, discover cluster members and contact them all to
retrieve and combine their respective state. For example,
`rabbitmqctl list_connections` will contact all
nodes, retrieve their AMQP 0-9-1 and AMQP 1.0 connections,
and display them all to the user. The user doesn't have
to manually contact all nodes.

Assuming a non-changing
state of the cluster (e.g. no connections are closed or
opened), two CLI commands executed against two different
nodes one after another will produce identical or
semantically identical results. "Node-local" commands, however, likely will not produce
identical results since two nodes rarely have entirely identical state.


## Commands Provided by Plugins {#command-discovery}

A RabbitMQ plugin can provide CLI commands that will be discovered by tools such as `rabbitmq-diagnostics`,
`rabbitmq-queues`, `rabbitmqctl`, and others. For plugin commands to be discoverable, the plugin
**must be explicitly enabled**.

When performing command discovery, CLI tools will consult the [Enabled Plugins File](./plugins#enabled-plugins-file) to determine
what plugins to scan for commands. If a plugin is not included into that file, e.g. because it was enabled implicitly as
a dependency, it won't be listed in the enabled plugins file and thus its CLI commands **will not be discovered**
and will not be available.

Use the `help` command to see what commands are available, both core and provided by plugins.


## Command Aliases {#aliases}

`rabbitmqctl`, `rabbitmq-diagnostics` and `rabbitmq-plugins` support command aliases. Aliases provide
a way to define abbreviated versions of certain commands and their arguments. For example,
instead of typing `rabbitmqctl environment` it may be more convenient to define an alias,
`rabbitmqctl env`, that would expand to `rabbitmqctl environment`.

Aliases are loaded from a file specified via the `RABBITMQ_CLI_ALIASES_FILE` environment
variable:

```bash
export RABBITMQ_CLI_ALIASES_FILE=/path/to/cli_aliases.conf
```

The aliases file uses a very minimalistic ini-style `alias = command` format, for
example:

```ini
env = environment
st  = status --quiet

lp  = list_parameters --quiet
lq  = list_queues --quiet
lu  = list_users --quiet

cs  = cipher_suites --openssl-format --quiet
```

With this alias file in place it will be possible to use

```bash
rabbitmqctl env
```

which would expand to

```bash
rabbitmqctl environment
```

or

```bash
rabbitmqctl lq
```

which would expand to

```bash
rabbitmqctl list_queues --quiet
```

The last alias in the example above configures a `rabbitmq-diagnostics` command:

```bash
rabbitmq-diagnostics cs
```

would expand to

```bash
rabbitmq-diagnostics cipher_suites --openssl-format --quiet
```

All tools process aliases the same way. As long as the expanded command is recognized,
aliases can be used with any tool or even more than one. For example,
both `rabbitmqctl` and `rabbitmq-diagnostics` provide the `environment` command
so the `env` alias works for both of them exactly the same way:

```bash
rabbitmq-diagnostics env
```

would expand to

```bash
rabbitmq-diagnostics environment
```

The file will be consulted only if the command invoked is not provided by the tool.
