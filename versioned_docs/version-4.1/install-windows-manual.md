---
title: Installing on Windows manually
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

import {
  RabbitMQServerPackageURL,
  RabbitMQServerPackageSigURL,
  RabbitMQServerPackageFilename,
  RabbitMQServerPackageWinZipDir,
} from '@site/src/components/RabbitMQServer';

# Installing on Windows Manually

## Overview {#overview}

This guide describes how RabbitMQ can be installed and configured manually on Windows. In general
we recommend using one the [more automation-friendly options for Windows](./install-windows) when possible.


## Install Erlang/OTP {#install-erlang}

RabbitMQ requires a 64-bit [supported version of Erlang](./which-erlang) for Windows to be installed.
Latest binary builds for Windows can be obtained from the [Erlang/OTP Version Tree](https://erlang.org/download/otp_versions_tree.html) page.

Erlang will appear in the Start Menu,
and `\erl{version}\bin\erl.exe` will be in `C:\Program Files` for 64-bit Erlang installations

**Important:** your system should only have one version of Erlang installed.
Please consult the [Windows Configuration](./windows-configuration) page.

### Make Sure ERLANG_HOME is Set {#set-erlang-home-variable}

In case there's an existing RabbitMQ installation with the broker running as a service and
you installed an Erlang VM with a different architecture then the service must be uninstalled
before updating `ERLANG_HOME`.

Set `ERLANG_HOME` to where you actually put your Erlang installation, e.g.
`C:\Program Files\erl{version}` (full path).
The RabbitMQ batch files expect to execute `%ERLANG_HOME%\bin\erl.exe`.

Go to `Start`&#xA0;>&#xA0;`Settings`&#xA0;>&#xA0;`Control Panel`&#xA0;>&#xA0;`System`&#xA0;>&#xA0;`Advanced`&#xA0;>&#xA0;`Environment Variables`.
Create the system environment variable `ERLANG_HOME`
and set it to the full path of the directory which contains `bin\erl.exe`.


## Install RabbitMQ Server {#install-rabbitmq}

After making sure a supported Erlang version is installed, download <code><RabbitMQServerPackageFilename packageType="windows-zip"/></code>.

### Direct Downloads {#downloads}

| Description | Download | Signature |
|-------------|----------|-----------|
| Installer for Windows systems (from <a href="https://github.com/rabbitmq/rabbitmq-server/releases">GitHub</a>) | <a href={RabbitMQServerPackageURL({packageType: 'windows-zip'})}>{RabbitMQServerPackageFilename({packageType: 'windows-zip'})}</a> | <a href={RabbitMQServerPackageSigURL({packageType: 'windows-zip'})}>Signature</a> |

From the zip file, extract the folder named <code><RabbitMQServerPackageWinZipDir/></code> into `C:\Program Files`
(or somewhere suitable for application files).


## Synchronise the Erlang Cookie {#erlang-cookie}

The Erlang cookie is a shared secret used for authentication between [RabbitMQ nodes](./clustering) and [CLI tools](./cli).
The value is stored in a file commonly referred to as the Erlang cookie file.

The cookie file used by the service account and the user
running `rabbitmqctl.bat` must be synchronised for
CLI tools such as `rabbitmqctl.bat` to function. All nodes in a cluster must have the same
cookie value (cookie file contents).

Please see [How CLI Tools Authenticate to Nodes (and Nodes to Each Other): the Erlang Cookie](./cli#erlang-cookie) for details.


## Locating CLI Tools and App Data {#locating-binaries-and-data}

### CLI tools {#locating-binaries}

Within the <code><RabbitMQServerPackageWinZipDir/>\sbin</code>
directory are some scripts which run commands to control the RabbitMQ server.

The RabbitMQ server can be run as either an application or service (not both).

 * [rabbitmq-server.bat](./man/rabbitmq-server.8) starts the broker as an application
 * [rabbitmq-service.bat](./man/rabbitmq-service.8) manages the service and starts the broker
 * [rabbitmqctl.bat](./man/rabbitmqctl.8) manages a running broker

Log in as an administrator. To see the output, run these from a
[Command Prompt](http://windows.microsoft.com/en-GB/windows7/Command-Prompt-frequently-asked-questions)
in the `sbin` directory.

<em>Note: </em>On Windows Vista (and later) it is necessary to
[elevate privilege](http://windows.microsoft.com/en-GB/windows7/Command-Prompt-frequently-asked-questions)
(e.g. right-click on the icon to select Run as Administrator).

Set up the system path so RabbitMQ server and CLI tools from the `sbin` directory
can be executed without using fully qualified paths.

 * Create a system environment variable (e.g. `RABBITMQ_SERVER`) for
   <code>"C:\Program Files\\<RabbitMQServerPackageWinZipDir/>"</code>.
   Adjust this if you put <code><RabbitMQServerPackageWinZipDir/></code> elsewhere,
   or if you upgrade versions.
 * Append the literal string "`;%RABBITMQ_SERVER%\sbin`" to your system path (aka `%PATH%`).

Now it should be possible to run rabbitmq commands from any (administrator) Command Prompt.

Navigate to <code><RabbitMQServerPackageWinZipDir/>\sbin</code>
to run commands if the system path does not contain the RabbitMQ `sbin`
directory.

### Node Data Directory {#locating-data-directory}

By default, the RabbitMQ logs and node's data directory
are stored in the current user's Application Data directory
e.g. `C:\Documents and Settings\<span class="envvar">%USERNAME%</span>\Application Data` or
`C:\Users\<span class="envvar">%USERNAME%</span>\AppData\Roaming`.

Execute `echo %APPDATA%` at a Command Prompt
to find this directory. Alternatively, Start&#xA0;>&#xA0;Run&#xA0;`%APPDATA%` will open this folder.

A node can be [configured](./configure) to use a [different data directory](./relocate)
using one of these environment variables: `RABBITMQ_BASE`, `RABBITMQ_MNESIA_BASE` or
`RABBITMQ_MNESIA_DIR`. Please read [the relocation guide](./relocate) for a description
of how each of these variables works.


## Running RabbitMQ Server as an Application {#running-windows}

The application is started by the `rabbitmq-server.bat`
script in `sbin`.

### Customise RabbitMQ Environment Variables

The service will run fine using its default settings. It is possible to [customise the RabbitMQ environment](./configure#rabbitmq-env-file-windows)
or edit [configuration](./configure#configuration-files).

**Important**: after setting environment variables, it is necessary to restart the node.

### Start the Broker as an Application {#start-as-application}

Run the command

```PowerShell
rabbitmq-server.bat -detached
```

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


## Running RabbitMQ Server as a Service {#running-windows-service}

The service will run in the security context of the system account
without the need for a user to be logged in on a console.
This is normally more appropriate for production use.
The server should not be run as a
service and application simultaneously.

The service runs using the `rabbitmq-service.bat` script in `sbin`.

### Customise RabbitMQ Environment Variables

The service will run fine using its default settings. It is possible to [customise the RabbitMQ environment](./configure#rabbitmq-env-file-windows)
or edit [configuration](./configure#configuration-files).

**Important**: after setting environment variables, it is necessary to reinstall the service.

### Install the Service {#install-service}

Install the service by running

```PowerShell
rabbitmq-service.bat install
```

A service with the name defined by <b>RABBITMQ_SERVICENAME</b>
should now appear in the Windows Services control panel
(Start&#xA0;>&#xA0;Run&#xA0;`services.msc`).

### Managing the Service {#manage-service}

To manage the service (install, remove, start, stop,
enable, disable), use
[`rabbitmq-service.bat`](./man/rabbitmq-service.8)
commands.  Alternatively, the Windows Services panel
(`services.msc`) can be used to perform some of the
same functions as the service script.

### Start the Broker as a Service {#start-service}

To start the broker, execute

```PowerShell
rabbitmq-service.bat start
```

If the output from this command is
"`Service RABBITMQ_SERVICENAME started`", then the service was started
successfully.

Confirm the service named <em>RABBITMQ_SERVICENAME</em>
reports a "Started" status in Services: <br/>
Start&#xA0;>&#xA0;Run&#xA0;`services.msc`.

### Upgrading Erlang VM {#upgrading-erlang}

If you have an existing installation and are planning to upgrade
the Erlang VM from a 32bit to a 64bit version then you must uninstall
the broker before upgrading the VM. The installer will not be able to stop
or remove a service that was installed with an Erlang VM of a different
architecture.


## Managing a RabbitMQ Node {#managing}

### Managing the Service {#managing-service}

Links to RabbitMQ directories can be found in the Start Menu.

There is also a link to a command prompt window that
will start in the sbin dir, in the Start Menu. This is
the most convenient way to run the [command line tools](./cli).
Note that CLI tools will have to [authenticate to the RabbitMQ node](./cli#erlang-cookie) running locally. That involves a shared secret file
which has to be placed into the correct location for the user.

### Stopping a Node

To stop the broker or check its status, use
`rabbitmqctl.bat` in `sbin` (as an administrator).

```PowerShell
rabbitmqctl.bat stop
```


## Checking Node Status

The following command performs the most basic node health check and displays some information about
the node if it is running:

```PowerShell
rabbitmqctl.bat status
```

See [RabbitMQ CLI tools guide](./cli) and the [Monitoring and Health Checks guide](./monitoring) for details.

### Log Files and Management {#server-logs}

Server logs are critically important in troubleshooting and root cause analysis.
See [Logging](./logging) and [File and Directory Location](./relocate) guides
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


## Default User Access {#default-user-access}

The broker creates a user `guest` with password
`guest`. Unconfigured clients will in general use these
credentials. **By default, these credentials can only be
used when connecting to the broker as localhost** so you
will need to take action before connecting from any other
machine.

See the documentation on [access control](./access-control) for information on how to create more users and delete
the `guest` user.


## Port Access {#ports}

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
   the cluster uses [federation](./federation) or CLI tools are used on machines outside the subnet),
   these ports should not be publicly exposed. See [networking guide](./networking) for details.
 * 35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
   and is allocated from a dynamic range (computed as server distribution port + 10000 through
   server distribution port + 10010). See [networking guide](./networking) for details.
 * 15672: [HTTP API](./management) clients, [management UI](./management) and [rabbitmqadmin](./management-cli)
   (only if the [management plugin](./management) is enabled)
 * 61613, 61614: [STOMP clients](https://stomp.github.io/stomp-specification-1.2.html) without and with TLS (only if the [STOMP plugin](./stomp) is enabled)
 * 1883, 8883: [MQTT clients](http://mqtt.org/) without and with TLS, if the [MQTT plugin](./mqtt) is enabled
 * 15674: STOMP-over-WebSockets clients (only if the [Web STOMP plugin](./web-stomp) is enabled)
 * 15675: MQTT-over-WebSockets clients (only if the [Web MQTT plugin](./web-mqtt) is enabled)

It is possible to [configure RabbitMQ](./configure)
to use [different ports and specific network interfaces](./networking).


## Windows Configuration {#windows-configuration}

We aim to make RabbitMQ a first-class citizen on Windows. However, sometimes there are circumstances beyond our
control. Please consult the [Windows Configuration](./windows-configuration) page.
