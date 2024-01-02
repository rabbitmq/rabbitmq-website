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

# Command Line Tools NOSYNTAX

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ ships with multiple command line tools, each with a set of related commands:

 * [`rabbitmqctl`](./rabbitmqctl.8.html) for service management and general operator tasks
 * [`rabbitmq-diagnostics`](./rabbitmq-diagnostics.8.html) for diagnostics and [health checking](./monitoring.html)
 * [`rabbitmq-plugins`](./rabbitmq-plugins.8.html) for [plugin management](./plugins.html)
 * [`rabbitmq-queues`](./rabbitmq-queues.8.html) for maintenance tasks on [queues](queues.html), in particular [quorum queues](./quorum-queues.html)
 * [`rabbitmq-streams`](./rabbitmq-streams.8.html) for maintenance tasks on [streams](streams.html)
 * [`rabbitmq-upgrade`](./rabbitmq-upgrade.8.html) for maintenance tasks related to [upgrades](./upgrade.html)

they can be found under the `sbin` directory in installation root.

On Windows, the above tool names will end with `.bat`, e.g. `rabbitmqctl` in a Windows installation will
be named `rabbitmqctl.bat`.

Additional tools are optional and can be obtained from GitHub:

 * [`rabbitmqadmin`](./management-cli.html) for operator tasks over [HTTP API](./management.html)
 * [`rabbitmq-collect-env`](https://github.com/rabbitmq/support-tools) which collects relevant cluster and environment information
    as well as server logs. This tool is specific to Linux and UNIX-like operating systems.

Different tools cover different usage scenarios. For example, `rabbitmqctl` is usually
only available to RabbitMQ administrator given that it provides full control over a node,
including virtual host, user and permission management, destructive operations
on node's data and so on.

`rabbitmqadmin` is built on top of the HTTP API and uses a different mechanism, and only
requires that the [HTTP API](./management.html) port is open for outside connections.

Even though CLI tools ship with the server, most commands [can be used to operate on remote nodes](#remote-nodes).
Plugins can [provide CLI commands](#command-discovery) that will be discovered by CLI tools for explicitly enabled plugins.


## <a id="requirements" class="anchor" href="#requirements">System and Environment Requirements</a>

RabbitMQ CLI tools require a [compatible Erlang/OTP](./which-erlang.html) version to be installed.

The tools assume that system locale is a UTF-8 one (e.g. `en_GB.UTF-8` or `en_US.UTF-8`). If that's
not the case, the tools may still function correctly but it cannot be guaranteed.
A warning will be emitted in non-UTF-8 locales.


## <a id="installation" class="anchor" href="#installation">Installation</a>

Except for `rabbitmqadmin`, all of the tools above ship with RabbitMQ and can be found under the `sbin`
directory in installation root. With most package types that directory is added to `PATH` at installation time.
This means that core tools such as `rabbitmq-diagnostics` and `rabbitmqctl` are available on every node
that has RabbitMQ installed.

[Generic UNIX package](./install-generic-unix.html) users have to make sure that the `sbin` directory under installation
root is added to `PATH` for simpler interactive use. Non-interactive use cases can use full or relative paths without
modifications to the `PATH` environment variable.

[`rabbitmqadmin`](./management-cli.html) is a standalone tool (no dependencies other than Python 3)
that can be downloaded from a running node or [directly from GitHub](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_management/bin/rabbitmqadmin).

If interaction from a remote node is required, download and extract the [generic UNIX package](./install-generic-unix.html)
or use the [Windows installer](./install-windows.html).

Besides [authentication](#authentication), all configuration for core CLI tools is optional.

Commands that require specific arguments list them in the usage section and will report
any missing arguments when executed.

## <a id="help" class="anchor" href="#help">Discovering Commands Using the Help Command</a>

To find out what commands are available, use the `help` command:

<pre class="lang-bash">
rabbitmqctl help
</pre>

<pre class="lang-bash">
rabbitmq-diagnostics help
</pre>

The command can display usage information for a particular command:

<pre class="lang-bash">
rabbitmq-diagnostics help status
</pre>

Alternatively, the `--help` option can be used:

<pre class="lang-bash">
rabbitmqctl --help
</pre>

including for individual commands:

<pre class="lang-bash">
rabbitmq-diagnostics status --help
</pre>


## <a id="rabbitmqctl" class="anchor" href="#rabbitmqctl">rabbitmqctl</a>

[rabbitmqctl](./rabbitmqctl.8.html) is the original CLI tool that ships with RabbitMQ.
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


## <a id="rabbitmq-plugins" class="anchor" href="#rabbitmq-plugins">rabbitmq-plugins</a>

[rabbitmq-plugins](./rabbitmq-plugins.8.html) is a tool that manages plugins:
lists, enables and disables them. It ships with RabbitMQ.

It supports both online (when target node is running) and offline mode (changes
take effect on node restart).

`rabbitmq-plugins` uses shared secret authentication (described below) with server nodes.

### <a id="offline-mode" class="anchor" href="#offline-mode">Offline Mode</a>

`--offline` is a flag supported by `rabbitmq-plugins` commands. When provided, the tool will avoid
contacting the target node and instead operate on plugin files directly.

When the `--offline` flag is used, the command will rely on [environment variables](configure.html#customise-environment)
to determine where to find the plugins directory of the local node.

For example, it will respect and use the `RABBITMQ_PLUGINS_DIR` environment variable value
just like a RabbitMQ node would. When `RABBITMQ_PLUGINS_DIR` is overriden for server nodes,
it must also be set identically for the local OS user that invokes CLI tools.


## <a id="authentication" class="anchor" href="#authentication">Authentication</a>

With the exception of `rabbitmqadmin`, RabbitMQ tools use a [shared secret authentication mechanism](#erlang-cookie).
This requires that [inter-node and CLI communication ports](networking.html) (by default)
is open for external connections on the target node.


## <a id="remote-nodes" class="anchor" href="#remote-nodes">Using CLI Tools against Remote Server Nodes</a>

CLI tools can be used to talk to remote nodes as well as the local ones. Nodes are identified by [node names](#node-names).
If no node name is specified, `rabbit@{local hostname}` is assumed to be the target. When contacting remote nodes,
the same [authentication requirements](#authentication) apply.

To contact a remote node, use the `--node` (`-n`) option that `rabbitmqctl`, `rabbitmq-diagnostics` and other core CLI tools
accept. The following example contact the node `rabbit@remote-host.local` to find out its status:

<pre class="lang-bash">
rabbitmq-diagnostics status -n rabbit@remote-host.local
</pre>

Some commands, such as

<pre class="lang-bash">
rabbitmq-diagnostics status
</pre>

can be used against any node. Others, such as

<pre class="lang-bash">
rabbitmqctl shutdown
</pre>

or

<pre class="lang-bash">
rabbitmqctl wait
</pre>

can only be run on the same host or in the same container as their target node. These commands typically
rely on or modify something in the local environment, e.g. the local [enabled plugins file](./plugins.html).


### <a id="node-names" class="anchor" href="#node-names">Node Names</a>

RabbitMQ nodes are identified by node names. A node name consists of two parts,
a prefix (usually `rabbit`) and hostname. For example, `rabbit@node1.messaging.svc.local`
is a node name with the prefix of `rabbit` and hostname of `node1.messaging.svc.local`.

Node names in a cluster must be unique. If more than one node is running on a given host
(this is usually the case in development and QA environments), they must use
different prefixes, e.g. `rabbit1@hostname` and `rabbit2@hostname`.

CLI tools identify and address server nodes using node names.
Most CLI commands are invoked against a node called target node. To specify a target node,
use the `--node` (`-n`) option. For example, to run a [health check](./monitoring.html)
on node `rabbit@warp10.local`:

<pre class="lang-bash">
rabbitmq-diagnostics -n rabbit@warp10 check_alarms
</pre>

Some commands accept both a target node and another node name. For example,
`rabbitmqctl forget_cluster_node` accepts both a target node (that will perform the action)
and a name of the node to be removed.

In a cluster, nodes identify and contact each other using node names. See [Clustering guide](./clustering.html#node-names)
for details.

When a node starts up, it checks whether it has been assigned a node name. This is done
via the `RABBITMQ_NODENAME` [environment variable](./configure.html#supported-environment-variables).
If no value was explicitly configured, the node resolves its hostname and prepends `rabbit` to it to compute its node name.

If a system uses fully qualified domain names (FQDNs) for hostnames, RabbitMQ nodes
and CLI tools must be configured to use so called long node names.
For server nodes this is done by setting the `RABBITMQ_USE_LONGNAME` [environment variable](./configure.html#supported-environment-variables)
to `true`.

For CLI tools, either `RABBITMQ_USE_LONGNAME` must be set or the `--longnames` option
must be specified:

<pre class="lang-bash">
# this example assumes that host1.messaging.eng.coolcorporation.banana is a hostname
# that successfully resolves
rabbitmq-diagnostics -n rabbit@host1.messaging.eng.coolcorporation.banana check_alarms --longnames
</pre>

## <a id="passing-arguments" class="anchor" href="#passing-arguments">Options and Positional Arguments</a>

RabbitMQ CLI tools largely follow existing, long established command line argument parsing conventions.
This section provides some examples and focuses on edge cases and lesser known features.

Different commands take different arguments. Some are named options such as `--node` (aliased as `-n`),
others are positional arguments, such as the username and password arguments in

<pre class="lang-bash">
rabbitmqctl add_user &lt;username&gt; &lt;password&gt;
</pre>

A specific example:

<pre class="lang-bash">
rabbitmqctl add_user "a-user" "a-pa$$w0rd"
</pre>

Options can be provided before or after positional arguments with one exception: anything
that follows a double hyphen (`--`) will be treated as positional arguments:

<pre class="lang-bash">
# all values after the double hyphen (--) will be treated as positional arguments,
# even if they begin with a hyphen or a double hyphen
rabbitmqctl add_user --node rabbit@host1.messaging.eng.coolcorporation.banana -- "a-user" "a-pa$$w0rd"
</pre>

The explicit positional argument separator must be used when positional arguments begin with a hyphen or a double
hyphen (such as generated passwords), to make sure they are not parsed as options:

<pre class="lang-bash">
# Since "--!a-pa$$w0rd" is explicitly provided as a positional argument, it won't
# be mistakenly considered for an unsupported option, even though it starts with a double hyphen
rabbitmqctl add_user --node rabbit@host1.messaging.eng.coolcorporation.banana -- "a-user" "--!a-pa$$w0rd"
</pre>

Option values can be passed as `--option <value>` or `--option=<value>`. The latter variant must be used
when the value begins with a hyphen (`-`), otherwise it would be treated as an option:

<pre class="lang-bash">
# an alternative way of providing an option value
rabbitmqctl add_user --node=rabbit@host1.messaging.eng.coolcorporation.banana -- "a-user" "a-pa$$w0rd"
</pre>

`rabbitmqctl`, `rabbitmq-diagnostics`, `rabbitmq-plugins`, and `rabbitmq-queues` support [command aliases](#aliases).


## <a id="erlang-cookie" class="anchor" href="#erlang-cookie">How CLI Tools Authenticate to Nodes (and Nodes to Each Other): the Erlang Cookie</a>

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

### <a id="cookie-file-locations" class="anchor" href="#cookie-file-locations">Cookie File Locations</a>

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
 * Erlang version: prior to 20.2 (these are no longer supported by any [maintained release series of RabbitMQ](versions.html)) or 20.2 and later

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
to `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` <a href="./configure.html">environment variable value</a>
to override the cookie value used by a RabbitMQ node:

<pre class="lang-bash">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-setcookie cookie-value"
</pre>

CLI tools can take a cookie value using a command line flag:

<pre class="lang-bash">
rabbitmq-diagnostics status --erlang-cookie "cookie-value"
</pre>

Both are **the least secure options** and generally **not recommended**.

### <a id="cookie-file-troubleshooting" class="anchor" href="#cookie-file-troubleshooting">Troubleshooting</a> Cookie-based Authentication

#### CLI Tools

Starting with [version `3.8.6`](./changelog.html), `rabbitmq-diagnostics` includes a command
that provides relevant information on the Erlang cookie file used by CLI tools:

<pre class="lang-bash">
rabbitmq-diagnostics erlang_cookie_sources
</pre>

The command will report on the effective user, user home directory and the expected location
of the cookie file:

<pre class="lang-plaintext">
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
</pre>

#### Server Nodes

When a node starts, it will [log](./logging.html) the home directory location of its effective user:

<pre class="lang-plaintext">
node           : rabbit@cdbf4de5f22d
home dir       : /var/lib/rabbitmq
</pre>

Unless any [server directories](./relocate.html) were overridden, that's the directory where
the cookie file will be looked for, and created by the node on first boot if it does not already exist.

In the example above, the cookie file location will be `/var/lib/rabbitmq/.erlang.cookie`.

#### Hostname Resolution

Starting with [RabbitMQ `3.8.6`](./changelog.html), CLI tools provide two commands that help verify
that hostname resolution on a node works as expected. The commands are not meant to replace
[`dig`](https://en.wikipedia.org/wiki/Dig_(command)) and other specialised DNS tools but rather
provide a way to perform most basic checks while taking [Erlang runtime hostname resolver features](https://erlang.org/doc/apps/erts/inet_cfg.html)
into account.

The commands are covered in the [Networking guide](./networking.html#dns-verify-resolution).

## <a id="cli-authentication-failures" class="anchor" href="#cli-authentication-failures">Authentication Failures</a>

When the cookie is misconfigured (for example, not identical), RabbitMQ nodes will log errors
such as "Connection attempt from disallowed node", "", "Could not auto-cluster".

For example, when a CLI tool connects and tries to authenticate using a mismatching secret value:

<pre class="lang-plaintext">
2020-06-15 13:03:33 [error] &lt;0.1187.0&gt; ** Connection attempt from node 'rabbitmqcli-99391-rabbit@warp10' rejected. Invalid challenge reply. **
</pre>

When a CLI tool such as `rabbitmqctl` fails to authenticate with RabbitMQ,
the message usually says

<pre class="lang-plaintext">
* epmd reports node 'rabbit' running on port 25672
* TCP connection succeeded but Erlang distribution failed
* suggestion: hostname mismatch?
* suggestion: is the cookie set correctly?
* suggestion: is the Erlang distribution using TLS?
</pre>

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

<pre class="lang-plaintext">
rabbit@warp10:
  * connected to epmd (port 4369) on warp10
  * epmd reports node 'rabbit' running on port 25672
  * TCP connection succeeded but Erlang distribution failed

  * Authentication failed (rejected by the remote node), please check the Erlang cookie

current node details:
- node name: 'rabbitmq-cli-63@warp10'
- home dir: /home/username
- cookie hash: Sg08R8+G85EYHZ3H/9NUfg==
</pre>


#### Possible Reason 2: Node Name Type Mismatch

If RabbitMQ nodes are configured to use long node names (`RABBITMQ_USE_LONGNAME` is exported to `true`),
so should CLI tools via the same environment variable or the `--longnames` command line flag introduced in 3.7.0.

#### Possible Reason 3: Inter-node Connections Require TLS

If RabbitMQ is set up to [encrypt inter-node and CLI connections using TLS](https://www.rabbitmq.com/clustering-ssl.html),
CLI tools also must use TLS and therefore require additional options.
Non-TLS connections from other nodes and CLI tools will fail.


#### Possible Reason 4: Hostname Mismatch

Other reasons include a hostname mismatch in node name used by the target RabbitMQ node and that provided
to the CLI tool (e.g. via the `-n` flag). For example, if a node runs using `rabbit@rmq1.eng.megacorp.local`
as its name but `rabbitmqctl` is invoked as

<pre class="lang-bash">
rabbitmq-diagnostics status -n rabbit@rmq-dev.eng.megacorp.local
</pre>

then even if `rmq-dev.eng.megacorp.local` and `rmq1.eng.megacorp.local` resolve to the same IP address,
the server will reject `rabbitmqctl`'s authentication attempt. This scenario is relatively
rare.

When a recent Erlang/OTP version is used, authentication failures contain
more information and hostname mismatches can be identified better:

<pre class="lang-plaintext">
rabbit@localhost:
  * connected to epmd (port 4369) on localhost
  * epmd reports node 'rabbit' running on port 25672
  * TCP connection succeeded but Erlang distribution failed

  * Hostname mismatch: node "rabbit@warp10" believes its host is different. Please ensure that hostnames resolve the same way locally and on "rabbit@warp10"


current node details:
- node name: 'rabbitmq-cli-30@warp10'
- home dir: /Users/antares
- cookie hash: Sg08R8+G85EYHZ3H/9NUfg==
</pre>


#### Other Possible Reasons

Just like with any network connection, CLI-to-node connections can fail due to

 * Hostname resolution failures
 * Incorrect IP routing
 * TCP port access blocked (firewalls, etc)

and so on.

[RabbitMQ Networking guide](networking.html) contains a section on troubleshooting of networking-related issues.


## <a id="managing-nodes" class="anchor" href="#managing-nodes">Managing Nodes</a>

### Getting node status

To retrieve node status, use `rabbitmq-diagnostics status` or `rabbitmq-diagnostics.bat status`
with an optional `--node` target:

<pre class="lang-bash">
rabbitmq-diagnostics  status
</pre>

<pre class="lang-bash">
rabbitmq-diagnostics  status --node rabbit@target-hostname.local
</pre>

<pre class="lang-powershell">
rabbitmq-diagnostics .bat status
</pre>

<pre class="lang-powershell">
rabbitmq-diagnostics .bat status --node rabbit@target-hostname.local
</pre>

### Starting a node

How RabbitMQ nodes are started depends on the package type used:

 * When using Debian and RPM packages on modern Linux distributions, nodes are [managed using `systemd`](./install-debian.html#managing-service)
 * When using Windows installer, nodes are usually [managed by the Windows service manager](./install-windows.html#managing)
 * When using Homebrew formula, nodes are managed using `brew services`
 * When using generic UNIX build or binary Windows build, nodes are started using `sbin/rabbitmq-server` and `sbin/rabbitmq-server.bat`, respectively, in the installation root

### Stopping a node

To stop a node, consider using the same service management tooling used when starting
the node, which depends on the package typed used when RabbitMQ was installed.

To stop a node using RabbitMQ CLI tools, use
`rabbitmqctl shutdown` or `rabbitmqctl.bat shutdown` with an optional `--node` target:

<pre class="lang-bash">
rabbitmqctl shutdown
</pre>

<pre class="lang-bash">
rabbitmqctl shutdown --node rabbit@target-hostname.local
</pre>

<pre class="lang-powershell">
rabbitmqctl.bat shutdown
</pre>

<pre class="lang-powershell">
rabbitmqctl.bat shutdown --node rabbit@target-hostname.local
</pre>

## <a id="http-api-cli" class="anchor" href="#http-api-cli">rabbitmqadmin</a>

[rabbitmqadmin](./management-cli.html) is a command line tool that's built on top of [RabbitMQ HTTP API](./management.html).
It is not a replacement for `rabbitmqctl` and provides access to a subset of most commonly
performed operations provided by the [management UI](./management.html).

The tool requires Python 2.7.9 or a more recent version.

`rabbitmqadmin` uses HTTP API authentication mechanism (basic HTTP authentication). It has to be
downloaded separately from a running node or [GitHub](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_management/bin/rabbitmqadmin).


## <a id="cli-and-clustering" class="anchor" href="#cli-and-clustering">"Node-local" and "Clusterwide" Commands</a>

Client connections, channels and queues will be distributed across cluster nodes.
Operators need to be able to inspect and [monitor](./monitoring.html) such resources
across all cluster nodes.

CLI tools such as [rabbitmqctl](./rabbitmqctl.8.html) and
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


## <a id="command-discovery" class="anchor" href="#command-discovery">Commands Provided by Plugins</a>

A RabbitMQ plugin can provide CLI commands that will be discovered by tools such as `rabbitmq-diagnostics`,
`rabbitmq-queues`, `rabbitmqctl`, and others. For plugin commands to be discoverable, the plugin
**must be explicitly enabled**.

When performing command discovery, CLI tools will consult the [Enabled Plugins File](#enabled-plugins-file) to determine
what plugins to scan for commands. If a plugin is not included into that file, e.g. because it was enabled implicitly as
a dependency, it won't be listed in the enabled plugins file and thus its CLI commands **will not be discovered**
and will not be available.

Use the `help` command to see what commands are available, both core and provided by plugins.


## <a id="aliases" class="anchor" href="#aliases">Command Aliases</a>

`rabbitmqctl`, `rabbitmq-diagnostics` and `rabbitmq-plugins` support command aliases. Aliases provide
a way to define abbreviated versions of certain commands and their arguments. For example,
instead of typing `rabbitmqctl environment` it may be more convenient to define an alias,
`rabbitmqctl env`, that would expand to `rabbitmqctl environment`.

Aliases are loaded from a file specified via the `RABBITMQ_CLI_ALIASES_FILE` environment
variable:

<pre class="lang-bash">
export RABBITMQ_CLI_ALIASES_FILE=/path/to/cli_aliases.conf
</pre>

The aliases file uses a very minimalistic ini-style `alias = command` format, for
example:

<pre class="lang-ini">
env = environment
st  = status --quiet

lp  = list_parameters --quiet
lq  = list_queues --quiet
lu  = list_users --quiet

cs  = cipher_suites --openssl-format --quiet
</pre>

With this alias file in place it will be possible to use

<pre class="lang-bash">
rabbitmqctl env
</pre>

which would expand to

<pre class="lang-bash">
rabbitmqctl environment
</pre>

or

<pre class="lang-bash">
rabbitmqctl lq
</pre>

which would expand to

<pre class="lang-bash">
rabbitmqctl list_queues --quiet
</pre>

The last alias in the example above configures a `rabbitmq-diagnostics` command:

<pre class="lang-bash">
rabbitmq-diagnostics cs
</pre>

would expand to

<pre class="lang-bash">
rabbitmq-diagnostics cipher_suites --openssl-format --quiet
</pre>

All tools process aliases the same way. As long as the expanded command is recognized,
aliases can be used with any tool or even more than one. For example,
both `rabbitmqctl` and `rabbitmq-diagnostics` provide the `environment` command
so the `env` alias works for both of them exactly the same way:

<pre class="lang-bash">
rabbitmq-diagnostics env
</pre>

would expand to

<pre class="lang-bash">
rabbitmq-diagnostics environment
</pre>

The file will be consulted only if the command invoked is not provided by the tool.
