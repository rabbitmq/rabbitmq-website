---
title: The Homebrew RabbitMQ Formula
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

# The Homebrew RabbitMQ Formula

## Overview {#overview}

[Homebrew](https://brew.sh/) is a popular package manager for macOS and Linux.
A [RabbitMQ formula](https://github.com/Homebrew/homebrew-core/blob/master/Formula/r/rabbitmq.rb) is available from
Homebrews core tap (out of the box). The formula maintained by Homebrew community and not Team RabbitMQ.

A recent [supported Erlang/OTP version](./which-erlang) will be installed as a dependency.

Please **read this short guide** from start to finish. The formula is has its caveats,
some of which may render a node unupgradable to [RabbitMQ 3.12 and later versions](./upgrade)
because of disabled stable [feature flags](./feature-flags).


## Installation {#installation}

Before installing make sure the taps are up-to-date:

```bash
brew update
```

Then, install RabbitMQ server with:

```bash
brew install rabbitmq
```

Installing the RabbitMQ formula will install key dependencies such as a [supported Erlang/OTP version](./which-erlang).

However, installing the formula **will not start the service** (a RabbitMQ node). See [Running and Managing the Node](#managing-node)
below.


## Locations {#locations}

Both RabbitMQ server scripts and [CLI tools](./cli) are installed into the `sbin` directory under `/usr/local/Cellar/rabbitmq/{version}/`
for Intel Macs or `/opt/homebrew/Cellar/rabbitmq/{version}/` for Apple Silicon Macs.

They should be accessible from `/usr/local/opt/rabbitmq/sbin` for for Intel Macs or `/opt/homebrew/opt/rabbitmq/sbin` for Apple Silicon Macs.
Links to binaries have been created under `/usr/local/sbin` for Intel Macs or `/opt/homebrew/sbin` for Apple Silicon ones.

To find out locations for your installation, use:

```bash
brew info rabbitmq
```


## Effective OS User {#user}

With Homebrew, the node and CLI tools will use the logged in user OS account by default. This is optimal
for development environments and means that the same [shared secret file](./cli#authentication) is used by
both RabbitMQ nodes and CLI tools.


## Running and Managing the Node {#managing-node}

Unlike some other installation methods, namely the [Debian](./install-debian) and [RPM packages](./install-rpm), RabbitMQ
Homebrew formula uses [generic UNIX binary builds](./install-generic-unix) and does not require `sudo`.

### Starting the Server

#### Starting a Node In the Foreground

To start a node in the foreground, run:

```bash
CONF_ENV_FILE="/opt/homebrew/etc/rabbitmq/rabbitmq-env.conf" /opt/homebrew/opt/rabbitmq/sbin/rabbitmq-server
```

After starting a node, we recommend enabling all feature flags on it:

```bash
# highly recommended: enable all feature flags on the running node
/opt/homebrew/sbin/rabbitmqctl enable_feature_flag all
```

#### Starting a Node In the Background

To start a node in the background, use `brew services start`:

```bash
# starts a local RabbitMQ node
brew services start rabbitmq

# highly recommended: enable all feature flags on the running node
/opt/homebrew/sbin/rabbitmqctl enable_feature_flag all
```

### Stopping the Server

To stop a running node, use:

```bash
# stops the locally running RabbitMQ node
brew services stop rabbitmq
```

or CLI tools directly:

```bash
/opt/homebrew/sbin/rabbitmqctl shutdown
```

The command will wait for the node process to stop. If the target node is not running,
it will exit with a warning.


## Using RabbitMQ CLI Tools with Homebrew {#cli}

The formula sets up links to CLI tools under `/usr/local/sbin` for Intel Macs or `/opt/homebrew/sbin` for Apple Silicon Macs.

In case that directory is not in `PATH`, it is recommended to append it:

```bash
# for macOS Intel
export PATH=$PATH:/usr/local/sbin
# for Apple Silicon
export PATH=$PATH:/opt/homebrew/sbin
```

Add the above export to the shell profile (such as `~/.bashrc` for bash or `~/.zshrc` for zsh)
to have `PATH` updated for every new shell, including OS restarts.


## Enabling Feature Flags {#feature-flags}

The Homebrew formula does not enable [feature flags](./feature-flags) after installation. To enable
all feature flags after installation (this is **very important** both to get access to certain features and for future release compatibility),
use

```bash
/opt/homebrew/sbin/rabbitmqctl enable_feature_flag all
```


## Configuring a Homebrew-installed RabbitMQ Node {#configure}

File and directory locations used by Homebrew differ from Intel Macs to Apple Silicon ones.
To find out locations for your installation, use:

```bash
brew info rabbitmq
```

On Apple Silicon Macs, [RabbitMQ configuration file](./configure#configuration-files) located at `/opt/homebrew/etc/rabbitmq/rabbitmq.conf`.
The file does not exist by default and **must be created by the user**. The node then
must be restarted so that it picks up the new configuration file on boot.

It is possible to [use environment variables](./configure#customise-environment) to control certain settings.
`rabbitmq-env.conf` is located at `/opt/homebrew/etc/rabbitmq/rabbitmq-env.conf`

See RabbitMQ [configuration guide](./configure) to learn more.


## Reinstalling the Formula {#reinstall}

To reinstall the formula, for example, if an older installation
cannot be upgraded because it [did not proactively enable all feature flags](./upgrade),
uninstall it, then remove all node data files:

```bash
brew services stop rabbitmq

brew uninstall rabbitmq

# Now delete all node's data directories and configuration files.
# This assumes that Homebrew root is at /opt/homebrew
rm -rf /opt/homebrew/etc/rabbitmq/
rm -rf /opt/homebrew/opt/rabbitmq/
rm -rf /opt/homebrew/var/lib/rabbitmq/
# the launch agent file
rm -f $HOME/Library/LaunchAgents/homebrew.mxcl.rabbitmq.plist

# re-install
brew install rabbitmq

## start the service if necessary
# brew services start rabbitmq

## after starting the service, enable all feature flags
# /opt/homebrew/sbin/rabbitmqctl enable_feature_flag all
```
