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

# Installing on Windows

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers RabbitMQ installation on Windows. It focuses on the two recommended installation
options:

 * [Using Chocolatey](#chocolatey)
 * [Using the official installer](#installer) as an administrative user

The guide also covers a few post-installation topics in the context of Windows:

 * The basics of [node configuration](#configure)
 * [CLI tool authentication](#cli)
 * [RabbitMQ Windows Service](#service)
 * [Managing the node](#managing)
 * [Firewall and security tools](#firewall) effects
 * [Log file location](#server-logs)
 * [Default user limitations](#default-user-access)

 and more. These topics are covered in more details in the [rest of documentation guides](./documentation.html).

A separate companion guide covers known [Windows-specific issues](./windows-quirks.html)
and ways to mitigate them.


## <a id="chocolatey" class="anchor" href="#chocolatey">Using chocolatey</a>

RabbitMQ packages are [distributed via Chocolatey](https://chocolatey.org/packages/rabbitmq).
New releases can take a while (sometimes weeks) to get through approvals,
so this option is not guaranteed to provide the latest release.
It does, however, manage the required dependencies.

To install RabbitMQ using Chocolatey, run the following command from the command line or from PowerShell:

<pre class="lang-powershell">
choco install rabbitmq
</pre>

For many use cases, Chocolatey is the optimal installation method.

The Chocolatey RabbitMQ package is open source and can be [found on GitHub](https://github.com/rabbitmq/chocolatey-package).


## <a id="installer" class="anchor" href="#installer">Using the Installer</a>

The official RabbitMQ installer is produced for [every RabbitMQ release](./changelog.html).

Compared to [installation via Chocolatey](#chocolatey), this option gives Windows users
the most flexibility but also requires them to be
aware of certain assumptions and requirements in the installer:

 * There must be only one Erlang version installed at a time
 * Erlang must be installed **using an administrative account**
 * It is **highly recommended** that RabbitMQ is also installed as an administrative account
 * Installation path must only contain ASCII characters. It is **highly recommended** that the path does not contain spaces in any directory names.
 * It may be necessary to manually copy the [shared secret](cli.html#erlang-cookie) file used by CLI tools
 * CLI tools require Windows console to operate in UTF-8 mode

When these conditions are not met, Windows service and CLI tools may require
reinstallation or other manual steps to get them to function as expected.

This is covered in more detail in the [Windows-specific Issues](./windows-quirks.html) guide.

### Dependencies

RabbitMQ requires a 64-bit [supported version of Erlang](./which-erlang.html) for Windows to be installed.

[Erlang 25.3](https://www.erlang.org/patches/otp-25.3.2) is the latest supported version.
Binary builds of other (for example, earlier) versions of Erlang for Windows can be obtained from the [Erlang/OTP Version Tree](https://erlang.org/download/otp_versions_tree.html) page.

Erlang **must be installed using an administrative account** or it won't be discoverable to the RabbitMQ Windows service.
Once a supported version of Erlang is installed, download the RabbitMQ installer, `rabbitmq-server-{version}.exe`
and run it. It installs RabbitMQ as a Windows service and starts it using the default configuration.

### <a id="downloads" class="anchor" href="#downloads">Direct Downloads</a>

<table>
  <thead>
    <th>Description</th>
    <th>Download</th>
    <th>Signature</th>
  </thead>

  <tr>
    <td>
      Installer for Windows systems (from <a href="https://github.com/rabbitmq/rabbitmq-server/releases">GitHub</a>)
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;.exe">rabbitmq-server-&version-server;.exe</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;.exe.asc">Signature</a>
    </td>
  </tr>
</table>


## <a id="service" class="anchor" href="#service">Run RabbitMQ Windows Service</a>

Once both Erlang and RabbitMQ have been installed, a RabbitMQ node can be started as a Windows service.
The RabbitMQ service starts automatically. RabbitMQ Windows service
can be managed from the Start menu.


## <a id="cli" class="anchor" href="#cli">CLI Tools</a>

RabbitMQ nodes are often managed, inspected and operated using [CLI Tools](./cli.html)
in [PowerShell](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/powershell).

On Windows, CLI tools have a `.bat` suffix compared to other platforms. For example,
`rabbitmqctl` on Windows is invoked as `rabbitmqctl.bat`.

In order for these tools to work they must be able to [authenticate with RabbitMQ nodes](./cli.html#erlang-cookie)
using a shared secret file called the Erlang cookie.

The main [CLI tools guide](./cli.html) covers most topics related to command line tool usage.

In order to explore what commands various RabbitMQ CLI tools provide, use the `help` command:

<pre class="lang-powershell">
# lists commands provided by rabbitmqctl.bat
rabbitmqctl.bat help

# lists commands provided by rabbitmq-diagnostics.bat
rabbitmq-diagnostics.bat help

# ...you guessed it!
rabbitmq-plugins.bat help
</pre>

To learn about a specific command, pass its name as an argument to `help`:

<pre class="lang-powershell">
rabbitmqctl.bat help add_user
</pre>


## <a id="cli-cookie-file-location" class="anchor" href="#cli-cookie-file-location">Cookie File Location</a>

On Windows, the [cookie file location](./cli.html#cookie-file-locations) depends on
whether the `HOMEDRIVE` and `HOMEPATH` environment variables are set.

If RabbitMQ is installed using a non-administrative account, a [shared secret](./cli.html#erlang-cookie) file
used by nodes and CLI tools will not be placed into a correct location,
leading to [authentication failures](./cli.html#cli-authentication-failures) when `rabbitmqctl.bat`
and other CLI tools are used.

One of these options can be used to mitigate:

 * Re-install RabbitMQ using an administrative user
 * Copy the file `.erlang.cookie` manually from `%SystemRoot%` or `%SystemRoot%\system32\config\systemprofile`
   to `%HOMEDRIVE%%HOMEPATH%`.


## <a id="configure" class="anchor" href="#configure">Node Configuration</a>

The service starts using its default [settings](configure.html), listening
for connections on [default interfaces](./networking.html#interfaces) and [ports](#ports).

Node configuration is primarily done using a [configuration file](./configure.html#configuration-files).
A number of available [environment variables](./configure.html#customise-windows-environment) can be used
to control node's [data location](./relocate.html), configuration file path and so on.

This is covered in more detail in the [Configuration guide](configure.html)

### Environment Variable Changes on Windows

**Important**: after setting environment variables, it is necessary to [**re-install** the Windows service](./configure.html#rabbitmq-env-file-windows). Restarting the service will not be sufficient.


## <a id="managing" class="anchor" href="#managing">Managing a RabbitMQ Node</a>

### <a id="managing-service" class="anchor" href="#managing-service">Managing the Service</a>

Links to RabbitMQ directories can be found in the Start Menu.

There is also a link to a command prompt window that
will start in the sbin dir, in the Start Menu. This is
the most convenient way to run the [command line tools](#cli).

Note that CLI tools will have to [authenticate to the target RabbitMQ node](#cli).

### <a id="stop-service" class="anchor" href="#stop-service">Stopping a Node</a>

To stop the broker or check its status, use
`rabbitmqctl.bat` in `sbin` (as an administrator).

<pre class="lang-powershell">
rabbitmqctl.bat stop
</pre>

### <a id="status" class="anchor" href="#status">Checking Node Status</a>

The following [CLI command](#cli) runs a basic [health check](./monitoring.html#health-checks)
and displays some information about the node if it is running.

<pre class="lang-powershell">
# A basic health check of both the node and CLI tool connectivity/authentication
rabbitmqctl.bat status
</pre>

For it to work,
two conditions must be true:

 * The node must be running
 * `rabbitmqctl.bat` must be able to authenticate with the node

See the [CLI tools section](#cli) and the [Monitoring and Health Checks guide](./monitoring.html)
to learn more.

### <a id="server-logs" class="anchor" href="#server-logs">Log Files and Management</a>

Server logs are critically important in troubleshooting and root cause analysis.
See [Logging](./logging.html) and [File and Directory Location](./relocate.html) guides
to learn about log file location, log rotation and more.


## <a id="firewall" class="anchor" href="#firewall">Firewalls and Security Tools</a>

Firewalls and security tools can prevent RabbitMQ Windows service and CLI tools from operating
correctly.

Such tools should be configured to whitelist access to [ports used by RabbitMQ](#ports).


## <a id="default-user-access" class="anchor" href="#default-user-access">Default User Access</a>

The broker creates a user `guest` with password
`guest`. Unconfigured clients will in general use these
credentials. **By default, these credentials can only be
used when connecting to the broker as localhost** so you
will need to take action before connecting from any other
machine.

See the documentation on [access control](access-control.html) for information on how to create more users and delete
the `guest` user.


## <a id="ports" class="anchor" href="#ports">Port Access</a>

RabbitMQ nodes bind to ports (open server TCP sockets) in order to accept client and CLI tool connections.
Other processes and tools such as anti-virus software may prevent RabbitMQ from binding to a port. When that happens,
the node will fail to start.

CLI tools, client libraries and RabbitMQ nodes also open connections (client TCP sockets).
Firewalls can prevent nodes and CLI tools from communicating with each other.
Make sure the following ports are accessible:

 * 4369: [epmd](http://erlang.org/doc/man/epmd.html), a peer discovery service used by RabbitMQ nodes and CLI tools
 * 5672, 5671: used by AMQP 0-9-1 and 1.0 clients without and with TLS
 * 25672: used for inter-node and CLI tools communication (Erlang distribution server port)
   and is allocated from a dynamic range (limited to a single port by default,
   computed as AMQP port + 20000). Unless external connections on these ports are really necessary (e.g.
   the cluster uses [federation](federation.html) or CLI tools are used on machines outside the subnet),
   these ports should not be publicly exposed. See [networking guide](networking.html) for details.
 * 35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
   and is allocated from a dynamic range (computed as server distribution port + 10000 through
   server distribution port + 10010). See [networking guide](networking.html) for details.
 * 15672: [HTTP API](./management.html) clients, [management UI](./management.html) and [rabbitmqadmin](./management-cli.html)
   (only if the [management plugin](./management.html) is enabled)
 * 61613, 61614: [STOMP clients](https://stomp.github.io/stomp-specification-1.2.html) without and with TLS (only if the [STOMP plugin](./stomp.html) is enabled)
 * 1883, 8883: [MQTT clients](http://mqtt.org/) without and with TLS, if the [MQTT plugin](./mqtt.html) is enabled
 * 15674: STOMP-over-WebSockets clients (only if the [Web STOMP plugin](./web-stomp.html) is enabled)
 * 15675: MQTT-over-WebSockets clients (only if the [Web MQTT plugin](./web-mqtt.html) is enabled)

It is possible to [configure RabbitMQ](configure.html)
to use [different ports and specific network interfaces](networking.html).


## <a id="upgrading-erlang" class="anchor" href="#upgrading-erlang">Upgrading Erlang VM</a>

If you have an existing installation and are planning to upgrade
the Erlang VM from a 32-bit to a 64-bit version then you must uninstall
the broker before upgrading the VM. The installer will not be able to stop
or remove a service that was installed with an Erlang VM of a different
architecture.

## <a id="dump-file" class="anchor" href="#dump-file">Dump File Location When Running as a Service</a>

In the event that the Erlang VM terminates when RabbitMQ is running
as a service, rather than writing the crash dump to the current
directory (which doesn't make sense for a service) it is written
to an `erl_crash.dump` file in the [base directory](./relocate.html) of
the RabbitMQ server, defaulting to `%APPDATA%\%RABBITMQ_SERVICENAME%` - typically `%APPDATA%\RabbitMQ` otherwise.
