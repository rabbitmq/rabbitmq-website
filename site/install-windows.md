<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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
 * [Using the official installer](#installer)

The guide also covers some Windows-specific aspects of [managing the service](#managing-service).


## <a id="chocolatey" class="anchor" href="#chocolatey">Using chocolatey</a>

RabbitMQ packagese are [distributed via Chocolatey](https://chocolatey.org/packages/rabbitmq).
New releases can take a while (sometimes weeks) to get through approvals, so this option is not guaranteed
to provide the latest release. It does, however, management the required dependencies.

To install RabbitMQ, run the following command from the command line or from PowerShell:

<pre class="lang-powershell">
choco install rabbitmq
</pre>

For most users and use cases, Chocolatey is the optimal installation method.


## <a id="installer" class="anchor" href="#installer">Using the Installer</a>

The official RabbitMQ installer is produced for [every RabbitMQ releases](/changelog.html). It requires a dependency

### Dependencies

RabbitMQ requires a 64-bit [supported version of Erlang](/which-erlang.html) for Windows to be installed.
Erlang releases include a [Windows installer](http://www.erlang.org/download.html). [Erlang Solutions](https://packages.erlang-solutions.com/erlang/)
provide binary 64-bit builds of Erlang as well.

**Important:** the Erlang installer **must be run using an administrative account**
otherwise a registry key expected by the RabbitMQ installer will not be
present.

Once a supported version of Erlang is installed, download the RabbitMQ installer (<code><span class="path">rabbitmq-server-&version-server;.exe</span></code>) and run it.
It installs RabbitMQ as a Windows service and starts it using the default configuration.

### <a id="downloads" class="anchor" href="#downloads">Direct Downloads</a>

<table>
  <thead>
    <th>Description</th>
    <th>Download</th>
    <th>Signature</th>
  </thead>

  <tr>
    <td>
      Installer for Windows systems (from <a href="https://github.com/rabbitmq/rabbitmq-server/releases">GitHub</a>, recommended)
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;.exe">rabbitmq-server-&version-server;.exe</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;.exe.asc">Signature</a>
    </td>
  </tr>

  <tr>
    <td>
      Alternative download location (from <a href="https://bintray.com/rabbitmq/all">Bintray</a>)
    </td>
    <td>
      <a href="https://dl.bintray.com/rabbitmq/all/rabbitmq-server/&version-server;/rabbitmq-server-&version-server;.exe">rabbitmq-server-&version-server;.exe</a>
    </td>
    <td>
    </td>
  </tr>
</table>


## <a id="run-windows" class="anchor" href="#run-windows">Run RabbitMQ Service</a>

### Customise RabbitMQ Environment Variables

The service will run fine using its default settings. It is possible to [customise the RabbitMQ environment](/configure.html#customise-windows-environment)
or edit [configuration](/configure.html#configuration-file).

### Run RabbitMQ

The RabbitMQ service starts automatically. You can
stop/reinstall/start the RabbitMQ service from the Start
Menu.

### <a id="upgrading-erlang" class="anchor" href="#upgrading-erlang">Upgrading Erlang VM</a>

If you have an existing installation and are planning to upgrade
the Erlang VM from a 32bit to a 64bit version then you must uninstall
the broker before upgrading the VM. The installer will not be able to stop
or remove a service that was installed with an Erlang VM of a different
architecture.


## <a id="managing" class="anchor" href="#managing">Managing a RabbitMQ Node</a>

### <a id="managing-service" class="anchor" href="#managing-service">Managing the Service</a>

Links to RabbitMQ directories can be found in the Start Menu.

There is also a link to a command prompt window that
will start in the sbin dir, in the Start Menu. This is
the most convenient way to run the [command line tools](/cli.html).
Note that CLI tools will have to [authenticate to the RabbitMQ node](/cli.html#erlang-cookie) running locally. That involves a shared secret file
which has to be placed into the correct location for the user.

### Stopping a Node

To stop the broker or check its status, use
<code>rabbitmqctl.bat</code> in <code>sbin</code> (as an administrator).

<pre class="lang-powershell">
rabbitmqctl.bat stop
</pre>


## Checking Node Status

The following command performs the most basic node health check and displays some information about
the node if it is running:

<pre class="lang-powershell">
rabbitmqctl.bat status
</pre>

See [RabbitMQ CLI tools guide](/cli.html) and the [Monitoring and Health Checks guide](/monitoring.html) for details.

### <a id="server-logs" class="anchor" href="#server-logs">Log Files and Management</a>

Server logs are critically important in troubleshooting and root cause analysis.
See [Logging](/logging.html) and [File and Directory Location](/relocate.html) guides
to learn about log file location, log rotation and more.

### Troubleshooting When Running as a Service

In the event that the Erlang VM crashes whilst RabbitMQ is running
as a service, rather than writing the crash dump to the current
directory (which doesn't make sense for a service) it is written
to an <code>erl_crash.dump</code> file in the base directory of
the RabbitMQ server (set by the <b>RABBITMQ_BASE</b> environment
variable, defaulting
to <code>%APPDATA%\%RABBITMQ_SERVICENAME%</code> -
typically <code>%APPDATA%\RabbitMQ</code> otherwise).


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
   the cluster uses [federation](/federation.html) or CLI tools are used on machines outside the subnet),
   these ports should not be publicly exposed. See [networking guide](/networking.html) for details.
 * 35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
   and is allocated from a dynamic range (computed as server distribution port + 10000 through
   server distribution port + 10010). See [networking guide](/networking.html) for details.
 * 15672: [HTTP API](/management.html) clients, [management UI](/management.html) and [rabbitmqadmin](/management-cli.html)
   (only if the [management plugin](/management.html) is enabled)
 * 61613, 61614: [STOMP clients](https://stomp.github.io/stomp-specification-1.2.html) without and with TLS (only if the [STOMP plugin](/stomp.html) is enabled)
 * 1883, 8883: ([MQTT clients](http://mqtt.org/) without and with TLS, if the [MQTT plugin](/mqtt.html) is enabled
 * 15674: STOMP-over-WebSockets clients (only if the [Web STOMP plugin](/web-stomp.html) is enabled)
 * 15675: MQTT-over-WebSockets clients (only if the [Web MQTT plugin](/web-mqtt.html) is enabled)

It is possible to [configure RabbitMQ](/configure.html)
to use [different ports and specific network interfaces](/networking.html).


## <a id="windows-quirks" class="anchor" href="#windows-quirks">Windows-specific Issues</a>

We aim to make RabbitMQ a first-class citizen on Windows. However, sometimes there are circumstances beyond our
control. Please consult the [Windows-specific Issues](windows-quirks.html) page.
