<!--
Copyright (c) 2007-2018 Pivotal Software, Inc.

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

RabbitMQ comes with multiple command line tools:

 * [rabbitmqctl](/rabbitmqctl.8.html) for general administrative/operator tasks
 * [rabbitmq-plugins](/rabbitmq-plugins.8.html) for plugin management
 * [rabbitmqadmin](/management-cli.html) for operator tasks over [HTTP API](/management.html)

Different tools cover different usage scenarios. For example, `rabbitmqctl` is usually
only available to RabbitMQ administrator given that it provides full control over a node,
including virtual host, user and permission management, destructive operations
on node's data and so on.

Most RabbitMQ tools use a shared secret (Erlang cookie) authentication mechanism. This
implies that [inter-node and CLI communication ports](/networking.html) (by default) must be open
for external connections on the target node.

`rabbitmqadmin` is built on top of the HTTP API and uses a different mechanism, and only
HTTP API port open.


## <a id="requirements" class="anchor" href="#requirements">System and Environment Requirements</a>

RabbitMQ CLI tools require a [compatible Erlang/OTP](/which-erlang.html) version to be installed.

The tools assume that system locale is a UTF-8 one (e.g. `en_GB.UTF-8` or `en_US.UTF-8`). If that's
not the case, the tools may still function correctly but it cannot be guaranteed.
A warning will be emitted in non-UTF-8 locales.


## <a id="rabbitmqctl" class="anchor" href="#rabbitmqctl">rabbitmqctl</a>

[rabbitmqctl](/rabbitmqctl.8.html) is the original CLI tool that ships with RabbitMQ.
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

`rabbitmqctl` uses shared secret authentication (described below) with server nodes.

## <a id="rabbitmq-plugins" class="anchor" href="#rabbitmq-plugins">rabbitmq-plugins</a>

[rabbitmq-plugins](/rabbitmq-plugins.8.html) is a tool that manages plugins:
lists, enables and disables them. It ships with RabbitMQ.

It supports both online (when target node is running) and offline mode (changes
take effect on node restart).

`rabbitmq-plugins` uses shared secret authentication (described below) with server nodes.

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

Erlang cookie management is best done using automation tools such as Chef, BOSH, Docker
or similar.

### Cookie File Locations

#### Linux, MacOS, *BSD

On UNIX systems, the cookie will be typically
located in `/var/lib/rabbitmq/.erlang.cookie` (used by the server)
and `$HOME/.erlang.cookie` (used by CLI tools). Note that since the value
of `$HOME` varies from user to user, it's necessary to place a copy of
the cookie file for each user that will be using the CLI tools. This applies to both
non-privileged users and `root`.

#### Windows

On Windows, the cookie location depends on a few factors:

 * Erlang version: prior to 20.2 or 20.2 and later
 * Whether the `HOMEDRIVE` and `HOMEPATH` environment variables are both set

##### Erlang 20.2 or later

With Erlang versions starting with 20.2, the cookie file locations are:

 * `%HOMEDRIVE%%HOMEPATH%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie` for user `%USERNAME%`) if both the `HOMEDRIVE` and `HOMEPATH` environment variables are set
 * `%USERPROFILE%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie`) if `HOMEDRIVE` and `HOMEPATH` are not both set
 * For the RabbitMQ Windows service - `%USERPROFILE%\.erlang.cookie` (usually `C:\WINDOWS\system32\config\systemprofile`)

If the Windows service is used, the cookie should be copied from
`C:\Windows\system32\config\systemprofile\.erlang.cookie` to the expected
location for users running commands like `rabbitmqctl.bat`.

##### Erlang 19.3 through 20.2

With Erlang versions prior to 20.2, the cookie file locations are:

 * `%HOMEDRIVE%%HOMEPATH%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie` for user `%USERNAME%`) if both the `HOMEDRIVE` and `HOMEPATH` environment variables are set
 * `%USERPROFILE%\.erlang.cookie` (usually `C:\Users\%USERNAME%\.erlang.cookie`) if `HOMEDRIVE` and `HOMEPATH` are not both set
 * For the RabbitMQ Windows service - `%WINDIR%\.erlang.cookie` (usually `C:\Windows\.erlang.cookie`)

If the Windows service is used, the cookie should be copied from
`C:\Windows\.erlang.cookie` to the expected location for users
running commands like `rabbitmqctl.bat`.

##### Troubleshooting

When a node starts, it will [log](/logging.html) its home (base) directory location. Unless
any [server directories](/relocate.html) were overridden, that's the directory the cookie file
will be created in by the RabbitMQ service.

#### Runtime Arguments

As an alternative, you can add the option "`-setcookie <i>value</i>`"
in the `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` <a href="/configure.html">environment variable value</a>:

<pre class="sourcecode ini">
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS="-setcookie cookie-value"
</pre>

This is the least secure option and generally not recommended.

## <a id="cli-authentication-failures" class="anchor" href="#cli-authentication-failures">Authentication Failures</a>

When the cookie is misconfigured (for example, not identical), RabbitMQ will log errors
such as "Connection attempt from disallowed node" and "Could not auto-cluster". When
a CLI tool such as `rabbitmqctl` fails to authenticate with RabbitMQ,
the message usually says

<pre class="sourcecode ini">
* epmd reports node 'rabbit' running on port 25672 
* TCP connection succeeded but Erlang distribution failed 
* suggestion: hostname mismatch? 
* suggestion: is the cookie set correctly? 
* suggestion: is the Erlang distribution using TLS? 
</pre>

This means that TCP connection from a CLI tool to a RabbitMQ node
succeded but authentication attempt was rejected by the server. The
message also mentions several most common reasons for that, which are
covered next.

#### Possible Reason 1: Misplaced or Missing Cookie File

An incorrectly placed cookie file or cookie value mismatch are most
common scenarios for such failures.

RabbitMQ node logs its cookie hash on start. CLI tools print their
cookie hash value when they fail to authenticate with the target node.

When a recent Erlang/OTP version is used, authentication failures contain
more information and cookie mismatches can be identified better:

<pre class="sourcecode ini">
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

If RabbitMQ is set up to [encrypt inter-node and CLI connections using TLS](http://www.rabbitmq.com/clustering-ssl.html),
CLI tools also must use TLS and therefore require additional options.
Non-TLS connections from other nodes and CLI tools will fail.


#### Possible Reason 4: Hostname Mismatch

Other reasons include a hostname mismatch in node name used by the target RabbitMQ node and that provided
to the CLI tool (e.g. via the `-n` flag). For example, if a node runs using `rabbit@rmq1.eng.megacorp.local`
as its name but `rabbitmqctl` is invoked as

<pre class="sourcecode ini">
rabbitmqctl status -n rabbit@rmq-dev.eng.megacorp.local
</pre>

then even if `rmq-dev.eng.megacorp.local` and `rmq1.eng.megacorp.local` resolve to the same IP address,
the server will reject `rabbitmqctl`'s authentication attempt. This scenario is relatively
rare.

When a recent Erlang/OTP version is used, authentication failures contain
more information and hostname mismatches can be identified better:

<pre class="sourcecode ini">
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

 * Hostname resolution issues
 * IP routing issues
 * TCP port access (firewalls, etc) issues

and so on.

[RabbitMQ Networking guide](/networking.html) contains a section on troubleshooting of networking-related issues.


## <a id="http-api-cli" class="anchor" href="#http-api-cli">rabbitmqadmin</a>

[rabbitmqadmin](/management-cli.html) is a command line tool that's built on top of [RabbitMQ HTTP API](/management.html).
It is not a replacement for `rabbitmqctl` and provides access to a subset of most commonly
performed operations provided by the [management UI](/management.html).

The tool requires Python 2.7.9 or a more recent version.

`rabbitmqadmin` uses HTTP API authentication mechanism (basic HTTP authentication). It has to be
downloaded separately from a running node or [GitHub](https://github.com/rabbitmq/rabbitmq-management/blob/stable/bin/rabbitmqadmin).
