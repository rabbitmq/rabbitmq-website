---
title: Installing on Windows
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
} from '@site/src/components/RabbitMQServer';

# Installing on Windows

## Overview {#overview}

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

 and more. These topics are covered in more details in the [rest of documentation guides](./index.md).

A separate companion guide covers known [Windows Configuration](./windows-configuration)
and ways to mitigate them.


## Using chocolatey {#chocolatey}

RabbitMQ packages are [distributed via Chocolatey](https://chocolatey.org/packages/rabbitmq).
New releases can take a while (sometimes weeks) to get through approvals,
so this option is not guaranteed to provide the latest release.
It does, however, manage the required dependencies.

To install RabbitMQ using Chocolatey, run the following command from the command line or from PowerShell:

```PowerShell
choco install rabbitmq
```

For many use cases, Chocolatey is the optimal installation method.

The Chocolatey RabbitMQ package is open source and can be [found on GitHub](https://github.com/rabbitmq/chocolatey-package).


## Using the Installer {#installer}

The official RabbitMQ installer is produced for [every RabbitMQ release](/release-information).

Compared to [installation via Chocolatey](#chocolatey), this option gives Windows users
the most flexibility but also requires them to be
aware of certain assumptions and requirements in the installer:

 * There must be only one Erlang version installed at a time
 * Erlang must be installed **using an administrative account**
 * It is **highly recommended** that RabbitMQ is also installed as an administrative account
 * Installation path must only contain ASCII characters. It is **highly recommended** that the path does not contain spaces in any directory names.
 * It may be necessary to manually copy the [shared secret](./cli#erlang-cookie) file used by CLI tools
 * CLI tools require Windows console to operate in UTF-8 mode

When these conditions are not met, Windows service and CLI tools may require
reinstallation or other manual steps to get them to function as expected.

This is covered in more detail in the [Windows Configuration](./windows-configuration) guide.

### Dependencies

RabbitMQ requires a 64-bit [supported version of Erlang](./which-erlang) for Windows to be installed.

Binary builds of recent versions of Erlang for Windows can be obtained from the [Erlang/OTP Version Tree](https://erlang.org/download/otp_versions_tree.html) page.

Erlang **must be installed using an administrative account** or it won't be discoverable to the RabbitMQ Windows service.
Once a supported version of Erlang is installed, download the RabbitMQ installer, `rabbitmq-server-{version}.exe`
and run it. It installs RabbitMQ as a Windows service and starts it using the default configuration.

### Direct Downloads {#downloads}

| Description | Download | Signature |
|-------------|----------|-----------|
| Installer for Windows systems (from <a href="https://github.com/rabbitmq/rabbitmq-server/releases">GitHub</a>) | <a href={RabbitMQServerPackageURL({packageType: 'windows-installer'})}>{RabbitMQServerPackageFilename({packageType: 'windows-installer'})}</a> | <a href={RabbitMQServerPackageSigURL({packageType: 'windows-installer'})}>Signature</a> |

## Run RabbitMQ Windows Service {#service}

Once both Erlang and RabbitMQ have been installed, a RabbitMQ node can be started as a Windows service.
The RabbitMQ service starts automatically. RabbitMQ Windows service
can be managed from the Start menu.


## CLI Tools {#cli}

RabbitMQ nodes are often managed, inspected and operated using [CLI Tools](./cli)
in [PowerShell](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/PowerShell).

On Windows, CLI tools have a `.bat` suffix compared to other platforms. For example,
`rabbitmqctl` on Windows is invoked as `rabbitmqctl.bat`.

In order for these tools to work they must be able to [authenticate with RabbitMQ nodes](./cli#erlang-cookie)
using a shared secret file called the Erlang cookie.

The main [CLI tools guide](./cli) covers most topics related to command line tool usage.

In order to explore what commands various RabbitMQ CLI tools provide, use the `help` command:

```PowerShell
# lists commands provided by rabbitmqctl.bat
rabbitmqctl.bat help

# lists commands provided by rabbitmq-diagnostics.bat
rabbitmq-diagnostics.bat help

# ...you guessed it!
rabbitmq-plugins.bat help
```

To learn about a specific command, pass its name as an argument to `help`:

```PowerShell
rabbitmqctl.bat help add_user
```


## Cookie File Location {#cli-cookie-file-location}

On Windows, the [cookie file location](./cli#cookie-file-locations) depends on
whether the `HOMEDRIVE` and `HOMEPATH` environment variables are set.

If RabbitMQ is installed using a non-administrative account, a [shared secret](./cli#erlang-cookie) file
used by nodes and CLI tools will not be placed into a correct location,
leading to [authentication failures](./cli#cli-authentication-failures) when `rabbitmqctl.bat`
and other CLI tools are used.

One of these options can be used to mitigate:

 * Re-install RabbitMQ using an administrative user
 * Copy the file `.erlang.cookie` manually from `%SystemRoot%` or `%SystemRoot%\system32\config\systemprofile`
   to `%HOMEDRIVE%%HOMEPATH%`.


## Node Configuration {#configure}

The service starts using its default [settings](./configure), listening
for connections on [default interfaces](./networking#interfaces) and [ports](#ports).

Node configuration is primarily done using a [configuration file](./configure#configuration-files).
A number of available [environment variables](./configure#rabbitmq-env-file-windows) can be used
to control node's [data location](./relocate), configuration file path and so on.

This is covered in more detail in the [Configuration guide](./configure)

### Environment Variable Changes on Windows

**Important**: after setting environment variables, it is necessary to [**re-install** the Windows service](./configure#rabbitmq-env-file-windows). Restarting the service will not be sufficient.


## Managing a RabbitMQ Node {#managing}

### Managing the Service {#managing-service}

Links to RabbitMQ directories can be found in the Start Menu.

There is also a link to a command prompt window that
will start in the sbin dir, in the Start Menu. This is
the most convenient way to run the [command line tools](#cli).

Note that CLI tools will have to [authenticate to the target RabbitMQ node](#cli).

### Stopping a Node {#stop-service}

To stop the broker or check its status, use
`rabbitmqctl.bat` in `sbin` (as an administrator).

```PowerShell
rabbitmqctl.bat stop
```

### Checking Node Status {#status}

The following [CLI command](#cli) runs a basic [health check](./monitoring#health-checks)
and displays some information about the node if it is running.

```PowerShell
# A basic health check of both the node and CLI tool connectivity/authentication
rabbitmqctl.bat status
```

For it to work,
two conditions must be true:

 * The node must be running
 * `rabbitmqctl.bat` must be able to authenticate with the node

See the [CLI tools section](#cli) and the [Monitoring and Health Checks guide](./monitoring)
to learn more.

### Log Files and Management {#server-logs}

Server logs are critically important in troubleshooting and root cause analysis.
See [Logging](./logging) and [File and Directory Location](./relocate) guides
to learn about log file location, log rotation and more.


## Firewalls and Security Tools {#firewall}

Firewalls and security tools can prevent RabbitMQ Windows service and CLI tools from operating
correctly.

Such tools should be configured to whitelist access to [ports used by RabbitMQ](#ports).


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


## Upgrading Erlang VM {#upgrading-erlang}

If you have an existing installation and are planning to upgrade
the Erlang VM from a 32-bit to a 64-bit version then you must uninstall
the broker before upgrading the VM. The installer will not be able to stop
or remove a service that was installed with an Erlang VM of a different
architecture.

## Dump File Location When Running as a Service {#dump-file}

In the event that the Erlang VM terminates when RabbitMQ is running
as a service, rather than writing the crash dump to the current
directory (which doesn't make sense for a service) it is written
to an `erl_crash.dump` file in the [base directory](./relocate) of
the RabbitMQ server, defaulting to `%APPDATA%\%RABBITMQ_SERVICENAME%` - typically `%APPDATA%\RabbitMQ` otherwise.
