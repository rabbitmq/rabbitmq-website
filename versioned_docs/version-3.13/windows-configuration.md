---
title: Windows Configuration
displayed_sidebar: docsSidebar
---

<!--
Copyright (c) 2007-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Windows Configuration

This guide is a companion to the main [Windows installation guide](./install-windows).

It documents known conditions and scenarios which can cause RabbitMQ Windows service
or CLI tools to malfunction.

## Anti-virus Software {#antivirus-software}

Anti-virus and related security software can prevent nodes from accepting or opening network connections,
accessing files on disk, and so on. This results in failures that are sporadic and very difficult to reason about.

It is **highly recommended** that RabbitMQ processes, ports, the Windows service, and node data
directory are all excluded from scanning by such tools.

An even better option would to be run RabbitMQ nodes on dedicated hosts with a configured
firewall but without any anti-virus software.

## Erlang Distribution Port {#erlang-distribution-port}

To specify a non-standard port to be used for Erlang distribution, do the following:

 * Make sure to use the same administrative user that was used to install RabbitMQ
 * Stop the RabbitMQ Windows service using `.\rabbitmq-service.bat stop`
 * Remove the RabbitMQ Windows service using `.\rabbitmq-service.bat remove`
 * Create the `%AppData%\RabbitMQ\rabbitmq-env-conf.bat` file with the following contents (use your own port number):

```PowerShell
set DIST_PORT=44556
```

 * Install the RabbitMQ Windows service using `.\rabbitmq-service.bat install`
 * Start the RabbitMQ Windows service using `.\rabbitmq-service.bat start`
 * Verify what port is being used for inter-node and CLI tool communication:

```bash
epmd -names
```

## Multiple Versions of Erlang May Cause Installation Issues {#multiple-erlang-versions}

Due to how the Windows `.exe` installer detects an installed version of Erlang, RabbitMQ may end up not using the latest version of Erlang installed. Please ensure that only one version of Erlang is installed -
the version you wish RabbitMQ to use. If you must upgrade Erlang, use this procedure:

 * Make sure to use the same administrative user that was used to install RabbitMQ
 * Stop the RabbitMQ Windows service using `.\rabbitmq-service.bat stop`
 * Uninstall Erlang
 * Install the new version of Erlang
 * Open the "RabbitMQ Command Prompt (sbin dir)" start menu item and run the commands below to reinstall the Windows service

```PowerShell
.\rabbitmq-service.bat remove
.\rabbitmq-service.bat install
.\rabbitmq-service.bat start
```

If any environment variables have changed in the mean time, [Windows service reinstallation](./configure#rabbitmq-env-file-windows) would
also be necessary.


## Cannot Install to a Path with non-ASCII Characters {#non-ascii-paths}

RabbitMQ will fail to start with the error that reads

```
RabbitMQ: Erlang machine stopped instantly (distribution name conflict?)
```

when installed to a path with non-ASCII characters in it.
This is because we need to pass the location of the compiled Erlang files to the Erlang VM.
It expects input in UTF-8, but the console will typically use some other encoding.

### Mitigation

One of these options can be used to mitigate:

 * Override `RABBITMQ_BASE` to point to a directory
   that only has ASCII characters and [**re-install** the Windows service](./configure#rabbitmq-env-file-windows).
 * Edit the file `rabbitmq-server.bat` and change the
   line `set TDP0=%~dp0` to `set TDP0=%~dps0`.
   This will use short paths (the infamous `C:\PROGRA~1`) everywhere.


## CLI Tools Display or Parse non-ASCII Characters Incorrectly {#non-ascii-cli}

Similarly, [RabbitMQ CLI tools](./cli) will expect command line
parameters to be encoded in UTF-8, and display strings as
UTF-8. The console will instead provide and expect some country-specific encoding.

### Mitigation

One of these options can be used to mitigate:

 * Avoid using non-ASCII characters in RabbitMQ installation and [node directory](./relocate) paths
 * On recent versions of Windows, issue the command
   ```PowerShell
   chcp 65001
   ```
   before using CLI tools to force
   the console to use UTF-8
 * Where possible, use the [management plugin](./management) instead of CLI tools.

## CLI Tools Show ANSI Character Sequences {#ansi-sequences}

In case the output from `rabbitmqctl` and other CLI tools looks like this:

```
←[1mUsage←[0m

rabbitmqctl [--node <node>] [--timeout <timeout>] [--longnames] [--quiet] <command> [<command options>]

Available commands:

←[1mHelp←[0m:

    autocomplete                  Provides command name autocomplete variants
    help                          Displays usage information for a command
    version                       Displays CLI tools version
```

### Mitigation

Two possible mitigations are:

1. Pipe `rabbitmqctl.bat` output through `Out-Host`, with each command, like so:  `rabbitmqctl.bat | Out-Host`
2. Globally enable VT/ANSI escape sequences in Command and PowerShell windows:
	a.  in PowerShell: `Set-ItemProperty HKCU:\Console VirtualTerminalLevel -Type DWORD 1`
	b. open a new console window for changes to take effect

For further information, including caveats, see [Colored text output in PowerShell console using ANSI / VT100 codes](https://stackoverflow.com/questions/51680709/colored-text-output-in-PowerShell-console-using-ansi-vt100-codes)


## Installing as a non-administrator User Leaves `.erlang.cookie` in the Wrong Place {#cookie-location}

If RabbitMQ is installed using a non-administrative account, a [shared secret](./cli#erlang-cookie) file
used by nodes and CLI tools will not be placed into a correct location,
leading to [authentication failures](./cli#cli-authentication-failures) when `rabbitmqctl.bat`
and other CLI tools are used.

### Mitigation

One of these options can be used to mitigate:

 * Re-install RabbitMQ using an administrative user
 * Copy the file `.erlang.cookie` manually
   from `%SystemRoot%` or `%SystemRoot%\system32\config\systemprofile`
   to `%HOMEDRIVE%%HOMEPATH%`.

See [How CLI Tools Authenticate to Nodes (and Nodes to Each Other](./cli#erlang-cookie) in the CLI guide.


## COMPUTERNAME is different from HOSTNAME {#computername-vs-hostname}

Older versions of RabbitMQ calculated the node name using the `COMPUTERNAME`
environment variable, which is always upper-case. Later versions of RabbitMQ
use `HOSTNAME` which may be lowercase. If you are upgrading from an old
(pre-`3.6.0`) version of RabbitMQ to a current one and see [the issue described
here](https://github.com/rabbitmq/rabbitmq-server/issues/1568), you should set
a system-wide environment variable named `RABBITMQ_NODENAME` with the following
value: `rabbit@ALL_CAPS_HOSTNAME`.

Then, RabbitMQ will continue to use the all-caps hostname and the upgrade will
succeed.


## Setting `net_ticktime` {#net-ticktime}

Due to how RabbitMQ starts as a Windows service, you can't use a configuration
file to set `net_ticktime` and instead must use an environment variable.

### Mitigation

First, log in using the administrative account you used, or will use, to
install RabbitMQ and create the `%AppData%\RabbitMQ\rabbitmq-env-conf.bat` file
with the following contents:

```PowerShell
@echo off
set SERVER_ADDITIONAL_ERL_ARGS=-kernel net_ticktime 120
```

The above will set `net_ticktime` to `120` seconds.

If you have not yet installed RabbitMQ, the setting will be picked up during installation.

If you have already installed RabbitMQ, open the "RabbitMQ Command Prompt (sbin dir)"
start menu item and run these commands:

```PowerShell
.\rabbitmq-service.bat stop
.\rabbitmq-service.bat remove
.\rabbitmq-service.bat install
.\rabbitmq-service.bat start
```
