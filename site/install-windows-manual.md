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

# Installing on Windows Manually

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide describes how RabbitMQ can be installed and configured manually on Windows. In general
we recommend using one the [more automation-friendly options for Windows](./install-windows.html) when possible.


## <a id="install-erlang" class="anchor" href="#install-erlang">Install Erlang/OTP</a>

RabbitMQ requires a 64-bit [supported version of Erlang](./which-erlang.html) for Windows to be installed.
Latest binary builds for Windows can be obtained from the [Erlang/OTP Version Tree](https://erlang.org/download/otp_versions_tree.html) page.

Erlang will appear in the Start Menu,
and `\erl{version}\bin\erl.exe` will be in `&dir-win-apps;` for 64-bit Erlang installations

**Important:** your system should only have one version of Erlang installed.
Please consult the [Windows-specific Issues](windows-quirks.html) page.

### <a id="set-erlang-home-variable" class="anchor" href="#set-erlang-home-variable">Make Sure ERLANG_HOME is Set</a>

In case there's an existing RabbitMQ installation with the broker running as a service and
you installed an Erlang VM with a different architecture then the service must be uninstalled
before updating `ERLANG_HOME`.

Set `ERLANG_HOME` to where you actually put your Erlang installation, e.g.
`C:\Program Files\erl{version}` (full path).
The RabbitMQ batch files expect to execute `%ERLANG_HOME%\bin\erl.exe`.

Go to `Start`&#xA0;>&#xA0;`Settings`&#xA0;>&#xA0;`Control Panel`&#xA0;>&#xA0;`System`&#xA0;>&#xA0;`Advanced`&#xA0;>&#xA0;`Environment Variables`.
Create the system environment variable `ERLANG_HOME`
and set it to the full path of the directory which contains `bin\erl.exe`.


## <a id="install-rabbitmq" class="anchor" href="#install-rabbitmq">Install RabbitMQ Server</a>

After making sure a supported Erlang version is installed, download `rabbitmq-server-windows-&version-server;.zip`.

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
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-windows-&version-server;.zip">rabbitmq-server-windows-&version-server;.zip</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-windows-&version-server;.zip.asc">Signature</a>
    </td>
  </tr>
</table>

From the zip file, extract the folder named
`rabbitmq_server-&version-server;`
into `&dir-server-windows;`
(or somewhere suitable for application files).


## <a id="erlang-cookie" class="anchor" href="#erlang-cookie">Synchronise the Erlang Cookie</a>

The Erlang cookie is a shared secret used for authentication between [RabbitMQ nodes](./clustering.html) and [CLI tools](./cli.html).
The value is stored in a file commonly referred to as the Erlang cookie file.

The cookie file used by the service account and the user
running `rabbitmqctl.bat` must be synchronised for
CLI tools such as `rabbitmqctl.bat` to function. All nodes in a cluster must have the same
cookie value (cookie file contents).

Please see [How CLI Tools Authenticate to Nodes (and Nodes to Each Other): the Erlang Cookie](./cli.html#erlang-cookie) for details.


## <a id="locating-binaries-and-data" class="anchor" href="#locating-binaries-and-data">Locating CLI Tools and App Data</a>

### <a id="locating-binaries" class="anchor" href="#locating-binaries">CLI tools</a>

Within the `rabbitmq_server-&version-server;\sbin`
directory are some scripts which run commands to control the RabbitMQ server.

The RabbitMQ server can be run as either an application or service (not both).

 * [rabbitmq-server.bat](man/rabbitmq-server.8.html) starts the broker as an application
 * [rabbitmq-service.bat](man/rabbitmq-service.8.html) manages the service and starts the broker
 * [rabbitmqctl.bat](man/rabbitmqctl.8.html) manages a running broker

Log in as an administrator. To see the output, run these from a
[Command Prompt](http://windows.microsoft.com/en-GB/windows7/Command-Prompt-frequently-asked-questions)
in the `sbin` directory.

<em>Note: </em>On Windows Vista (and later) it is necessary to
[elevate privilege](http://windows.microsoft.com/en-GB/windows7/Command-Prompt-frequently-asked-questions)
(e.g. right-click on the icon to select Run as Administrator).

Set up the system path so RabbitMQ server and CLI tools from the `sbin` directory
can be executed without using fully qualified paths.

 * Create a system environment variable (e.g. `RABBITMQ_SERVER`) for
   `"&dir-server-windows;\rabbitmq_server-&version-server;"`.
   Adjust this if you put `rabbitmq_server-&version-server;` elsewhere,
   or if you upgrade versions.
 * Append the literal string "`;%RABBITMQ_SERVER%\sbin`" to your system path (aka `%PATH%`).

Now it should be possible to run rabbitmq commands from any (administrator) Command Prompt.

Navigate to `rabbitmq_server-&version-server;\sbin`
to run commands if the system path does not contain the RabbitMQ `sbin`
directory.

### <a id="locating-data-directory" class="anchor" href="#locating-data-directory">Node Data Directory</a>

By default, the RabbitMQ logs and node's data directory
are stored in the current user's Application Data directory
e.g. <code>C:\Documents and Settings\<span class="envvar">%USERNAME%</span>\Application Data</code> or
<code>C:\Users\<span class="envvar">%USERNAME%</span>\AppData\Roaming</code>.

Execute `echo %APPDATA%` at a Command Prompt
to find this directory. Alternatively, Start&#xA0;>&#xA0;Run&#xA0;`%APPDATA%` will open this folder.

A node can be [configured](configure.html) to use a [different data directory](./relocate.html)
using one of these environment variables: `RABBITMQ_BASE`, `RABBITMQ_MNESIA_BASE` or
`RABBITMQ_MNESIA_DIR`. Please read [the relocation guide](./relocate.html) for a description
of how each of these variables works.


## <a id="running-windows" class="anchor" href="#running-windows">Running RabbitMQ Server as an Application</a>

The application is started by the `rabbitmq-server.bat`
script in `sbin`.

### Customise RabbitMQ Environment Variables

The service will run fine using its default settings. It is possible to [customise the RabbitMQ environment](./configure.html#customise-windows-environment)
or edit [configuration](./configure.html#configuration-files).

**Important**: after setting environment variables, it is necessary to restart the node.

### <a id="start-as-application" class="anchor" href="#start-as-application">Start the Broker as an Application</a>

Run the command

<pre class="lang-powershell">rabbitmq-server.bat -detached</pre>

This will start a node in the background (not attached to the Command Prompt).

Alternatively, `rabbitmq-server.bat` can be executed in Windows Explorer
to start a node in foreground.

When a node is started, a Command Prompt window opens,
displays a short startup banner, indicating that the RabbitMQ
broker has been started successfully.

If the node was started without the `-detached` option,
e.g. using Windows Explorer, a second Command Prompt
window will be necessary to control the application using CLI tools.

**Important**: closing the original Command Prompt window
will forcefully shut down a server started this way.


## <a id="running-windows-service" class="anchor" href="#running-windows-service">Running RabbitMQ Server as a Service</a>

The service will run in the security context of the system account
without the need for a user to be logged in on a console.
This is normally more appropriate for production use.
The server should not be run as a
service and application simultaneously.

The service runs using the `rabbitmq-service.bat` script in `sbin`.

### Customise RabbitMQ Environment Variables

The service will run fine using its default settings. It is possible to [customise the RabbitMQ environment](./configure.html#customise-windows-environment)
or edit [configuration](./configure.html#configuration-files).

**Important**: after setting environment variables, it is necessary to reinstall the service.

### <a id="install-service" class="anchor" href="#install-service">Install the Service</a>

Install the service by running

<pre class="lang-powershell">rabbitmq-service.bat install</pre>

A service with the name defined by <b>RABBITMQ_SERVICENAME</b>
should now appear in the Windows Services control panel
(Start&#xA0;>&#xA0;Run&#xA0;`services.msc`).

### <a id="manage-service" class="anchor" href="#manage-service">Managing the Service</a>

To manage the service (install, remove, start, stop,
enable, disable), use
[`rabbitmq-service.bat`](man/rabbitmq-service.8.html)
commands.  Alternatively, the Windows Services panel
(`services.msc`) can be used to perform some of the
same functions as the service script.

### <a id="start-service" class="anchor" href="#start-service">Start the Broker as a Service</a>

To start the broker, execute

<pre class="lang-powershell">rabbitmq-service.bat start</pre>

If the output from this command is
"<code>Service <em>RABBITMQ_SERVICENAME</em> started</code>", then the service was started
successfully.

Confirm the service named <em>RABBITMQ_SERVICENAME</em>
reports a "Started" status in Services: <br/>
Start&#xA0;>&#xA0;Run&#xA0;`services.msc`.

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
the most convenient way to run the [command line tools](./cli.html).
Note that CLI tools will have to [authenticate to the RabbitMQ node](./cli.html#erlang-cookie) running locally. That involves a shared secret file
which has to be placed into the correct location for the user.

### Stopping a Node

To stop the broker or check its status, use
`rabbitmqctl.bat` in `sbin` (as an administrator).

<pre class="lang-powershell">
rabbitmqctl.bat stop
</pre>


## Checking Node Status

The following command performs the most basic node health check and displays some information about
the node if it is running:

<pre class="lang-powershell">
rabbitmqctl.bat status
</pre>

See [RabbitMQ CLI tools guide](./cli.html) and the [Monitoring and Health Checks guide](./monitoring.html) for details.

### <a id="server-logs" class="anchor" href="#server-logs">Log Files and Management</a>

Server logs are critically important in troubleshooting and root cause analysis.
See [Logging](./logging.html) and [File and Directory Location](./relocate.html) guides
to learn about log file location, log rotation and more.

### Troubleshooting When Running as a Service

In the event that the Erlang VM crashes whilst RabbitMQ is running
as a service, rather than writing the crash dump to the current
directory (which doesn't make sense for a service) it is written
to an `erl_crash.dump` file in the base directory of
the RabbitMQ server (set by the <b>RABBITMQ_BASE</b> environment
variable, defaulting
to `%APPDATA%\%RABBITMQ_SERVICENAME%` -
typically `%APPDATA%\RabbitMQ` otherwise).


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


## <a id="windows-quirks" class="anchor" href="#windows-quirks">Windows-specific Issues</a>

We aim to make RabbitMQ a first-class citizen on Windows. However, sometimes there are circumstances beyond our
control. Please consult the [Windows-specific Issues](windows-quirks.html) page.
