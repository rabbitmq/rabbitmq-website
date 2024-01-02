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

# Generic Binary Build ("Generic UNIX Build")

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ releases include a binary package for Linux, MacOS, and *BSD systems.
It is minimalistic and not opinionated in how it is installed, configured and managed.
This package is recommended in environments where more opinionated installation options
(the [Debian](./install-debian.html) or [RPM packages](./install-rpm.html), [Homebrew](./install-homebrew.html), BSD ports) cannot be used.
It is also the most convenient option for running multiple versions on the same machine
in development environments.

There's a separate [binary package for Windows](./install-windows-manual.html).

Unlike with the cases of [Debian](./install-debian.html), [RPM](./install-rpm.html) and [Windows installer](./install-windows.html) packages,
[node management](#managing-node) with this package type is performed solely using
[RabbitMQ CLI tools](./cli.html) or by the operator setting up e.g. a `systemd` service manually.

## <a id="downloads" class="anchor" href="#downloads">Downloads</a>

<table>
  <thead>
    <th>Description</th>
    <th>Download</th>
    <th>Signature</th>
  </thead>

  <tr>
    <td>
      Generic UNIX binary build (tar.xz, from <a href="https://github.com/rabbitmq/rabbitmq-server/releases">GitHub</a>, recommended)
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-generic-unix-&version-server;.tar.xz">rabbitmq-server-generic-unix-&version-server;.tar.xz</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-generic-unix-&version-server;.tar.xz.asc">Signature</a>
    </td>
  </tr>
</table>


## <a id="installation" class="anchor" href="#installation">Installation</a>

### <a id="install-erlang" class="anchor" href="#install-erlang">Make Sure Erlang/OTP is Installed</a>

This package requires a [supported version of Erlang](./which-erlang.html) to be installed
in order to run.

### <a id="install" class="anchor" href="#install">Install the Server</a>

[Download](#downloads) a `rabbitmq-server-generic-unix-&version-server;.tar.xz` archive and extract it.

Contained in the tarball is a directory named `rabbitmq_server-&version-server;`. This directory is the node base directory. It should be
moved to a suitable application directory on the system, such as `/usr/local`.
The `sbin` directory in that directory contains server and [CLI tool](./cli.html) scripts.
It is a good candidate for including into `PATH`.


## <a id="operations" class="anchor" href="#operations">Operations</a>

### <a id="managing-node" class="anchor" href="#managing-node">Running and Managing the Node</a>

Unlike some other installation methods, namely the [Debian](./install-debian.html) and [RPM packages](./install-rpm.html), RabbitMQ
generic UNIX binary build does not require `sudo`. It can be uncompressed
into any location and started and managed using the scripts and [CLI tools](./cli.html) under `sbin`.
Default [data directory location](./relocate.html) will be under `./var`,
that is, in the installation directory.

#### Starting the Server

To start the server, run the `sbin/rabbitmq-server` script. This
displays a short banner message, concluding with the message
"completed with <i>[n]</i> plugins.", indicating that the
RabbitMQ broker has been started successfully.
To start the server in "detached" mode, use
`rabbitmq-server -detached`. This will run
the node process in the background.

#### Stopping the Server

To stop a running node, use `sbin/rabbitmqctl shutdown`. The command
will wait for the node process to stop. If the target node is not running,
it will exit with an error.

#### Configuring the Server

[RabbitMQ configuration file](configure.html#configuration-files) located at `$RABBITMQ_HOME/etc/rabbitmq/rabbitmq.conf`
is the primary way of configuring the node.

It is possible to [use environment variables](configure.html#customise-general-unix-environment) to control certain settings.
The recommended way of doing that is using the `$RABBITMQ_HOME/etc/rabbitmq/rabbitmq-env.conf` file.

Neither of these files exist after installation, so they must be created first.

See RabbitMQ [configuration guide](configure.html) to learn more.

### <a id="file-locations" class="anchor" href="#file-locations">File Locations</a>

The generic binary build is designed to run without granted
permissions to directories outside of its base one. The [directories and files](./relocate.html) used by default are
all held under the installation directory `rabbitmq_server-&version-server;`
which is in the <span class="envvar">$RABBITMQ_HOME</span>
variable in the scripts.

The node can be [instructed](./relocate.html) to use more
conventional system directories for [configuration](configure.html),
node data directory, [log](./logging.html) files, [plugins](./plugins.html) and so on.
In order to make the node use operating system defaults, locate the following line

<pre class="lang-bash">
PREFIX=${RABBITMQ_HOME}
</pre>

in the `sbin/rabbitmq-defaults` script and
change this line to:

<pre class="lang-bash">
SYS_PREFIX=
</pre>

but do not modify any other line in this script.

**Important**: after this modification the default directory
locations may point to non-existent directories or directories that the effective
node user won't have permissions for.

In particular `RABBITMQ_MNESIA_BASE` and
`RABBITMQ_LOG_BASE` may need to be created (the server will attempt to create them at startup), and the
[enabled plugins file](./plugins.html) (`RABBITMQ_ENABLED_PLUGINS_FILE`) will need
to be writable by [rabbitmq-plugins](./cli.html).

The configuration files will be looked for in `/etc/rabbitmq/`.


## <a id="ports" class="anchor" href="#ports">Port Access</a>

RabbitMQ nodes bind to ports (open server TCP sockets) in order to accept client
and CLI tool connections. Other processes and tools such as SELinux may prevent
RabbitMQ from binding to a port. When that happens, the node will fail to start.
Refer to the [Networking Guide](networking.html#ports) for more details.

## <a id="default-user-access" class="anchor" href="#default-user-access">Default User Access</a>

The broker creates a user `guest` with password
`guest`. Unconfigured clients will in general use these
credentials. <strong>By default, these credentials can only be
used when connecting to the broker as localhost</strong> so you
will need to take action before connecting from any other machine.

See the documentation on [access control](access-control.html) for information on how to create more users and delete
the `guest` user.

## <a id="managing" class="anchor" href="#managing">Managing the Node</a>

To stop the server or check its status, etc., you can invoke
`sbin/rabbitmqctl` (as the user running
`rabbitmq-server`). All `rabbitmqctl`
commands will report the node absence if no broker is running.

 * Invoke `rabbitmqctl stop` or `rabbitmqctl shutdown` to stop the server
 * Invoke `rabbitmq-diagnostics status` to check whether it is running

See [CLI tools guide](./cli.html) to learn more.


## <a id="kernel-resource-limits" class="anchor" href="#kernel-resource-limits">Controlling System Limits on Linux</a>

RabbitMQ installations running production workloads may need system
limits and kernel parameters tuning in order to handle a decent number of
concurrent connections and queues. The main setting that needs adjustment
is the max number of open files, also known as `ulimit -n`.
The default value on many operating systems is too low for a messaging
broker (`1024` on several Linux distributions). We recommend allowing
for at least 65536 file descriptors for user `rabbitmq` in
production environments. 4096 should be sufficient for many development
workloads.

There are two limits in play: the maximum number of open files the OS kernel
allows (`fs.file-max` on Linux, `kern.maxfilesperproc` on OS X and FreeBSD) and the per-user limit (`ulimit -n`).
The former must be higher than the latter.
For more information about controlling the system-wide limit,
please refer to the excellent [Riak guide on open file limit tuning](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md).

### <a id="verifying-limits" class="anchor" href="#verifying-limits">Verifying the Limit</a>

[RabbitMQ management UI](management.html) displays the number of file descriptors available for it to use on the Overview tab.

<pre class="lang-plaintext">rabbitmq-diagnostics status</pre>

includes the same value. The following command

<pre  class="lang-bash">
ulimit -a
</pre>

can be used to display effective limits for the current user. There may be more convenient
OS-specific ways of doing that for a running process, such as the `/proc` filesystem on Linux.

### <a id="chef-puppet-bosh" class="anchor" href="#chef-puppet-bosh">Configuration Management Tools</a>

Configuration management tools (e.g. Chef, Puppet, BOSH) provide assistance
with system limit tuning. Our [developer tools](devtools.html#devops-tools) guide
lists relevant modules and projects.
