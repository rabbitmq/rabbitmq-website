<!--
Copyright (c) 2007-2022 VMware, Inc. or its affiliates.

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

## <a id="overview" class="anchor" href="#overview">Overview</a>

[Homebrew](https://brew.sh/) is a popular package manager for MacOS.
[RabbitMQ formula](https://github.com/Homebrew/homebrew-core/blob/master/Formula/rabbitmq.rb) is available from
[Homebrew](https://brew.sh/)'s core tap (out of the box).

The formula will also install a recent [supported Erlang/OTP version](./which-erlang.html)
as a dependency.


## <a id="installation" class="anchor" href="#installation">Installation</a>

Before installing make sure the taps are up-to-date:

<pre class="lang-bash">
brew update
</pre>

Then, install RabbitMQ server with:

<pre class="lang-bash">
brew install rabbitmq
</pre>

Installing the RabbitMQ formula will install key dependencies such as a [supported Erlang/OTP version](./which-erlang.html).

## <a id="locations" class="anchor" href="#locations">Locations</a>

The RabbitMQ server scripts and [CLI tools](./cli.html) are installed into the `sbin` directory under `/usr/local/Cellar/rabbitmq/{version}/` for Intel Macs
or `/opt/homebrew/Cellar/rabbitmq/<version>/` for Apple Silicon Macs.

They should be accessible from `/usr/local/opt/rabbitmq/sbin` for for Intel Macs or `/opt/homebrew/opt/rabbitmq/sbin` for Apple Silicon Macs.
Links to binaries have been created under `/usr/local/sbin` for Intel Macs or `/opt/homebrew/sbin` for Apple Silicon ones.

To find out locations for your installation, use

<pre class="lang-bash">
brew info rabbitmq
</pre>

With Homebrew, the node and CLI tools will use the logged in user account by default.


## <a id="managing-node" class="anchor" href="#managing-node">Running and Managing the Node</a>

Unlike some other installation methods, namely the [Debian](./install-debian.html) and [RPM packages](./install-rpm.html), RabbitMQ
Homebrew formula uses [generic UNIX binary builds](./install-generic-unix.html) and does not require `sudo`.

#### Starting the Server

To start a node in the foreground, run

<pre class="lang-bash">
CONF_ENV_FILE="/opt/homebrew/etc/rabbitmq/rabbitmq-env.conf" /opt/homebrew/opt/rabbitmq/sbin/rabbitmq-server
</pre>

To start a node in the background, use `brew service start`:

<pre class="lang-bash">
brew services start rabbitmq
</pre>

#### Stopping the Server

To stop a running node, use

<pre class="lang-bash">
brew services stop rabbitmq
</pre>

or CLI tools directly:

<pre class="lang-bash">
/opt/homebrew/opt/rabbitmq/sbin/rabbitmqctl shutdown
</pre>

The command will wait for the node process to stop. If the target node is not running,
it will exit with an error.

#### Configuring the Server

File and directory locations used by Homebrew differ from Intel Macs to Apple Silicon ones.
To find out locations for your installation, use

<pre class="lang-bash">
brew info rabbitmq
</pre>

On Apple Silicon Macs, [RabbitMQ configuration file](configure.html#configuration-files) located at `/opt/homebrew/etc/rabbitmq/rabbitmq.conf`.
The file does not exist by default and can be created.

It is possible to [use environment variables](configure.html#customise-general-unix-environment) to control certain settings.
`rabbitmq-env.conf` is located at `/opt/homebrew/etc/rabbitmq/rabbitmq-env.conf`

See RabbitMQ [configuration guide](configure.html) to learn more.

## <a id="cli" class="anchor" href="#cli"></a>

The formula sets up links to CLI tools under `/usr/local/sbin` for Intel Macs or `/opt/homebrew/sbin` for Apple Silicon Macs.

In case that directory is not in `PATH` it's recommended to append it:

<pre class="lang-bash">
# for macOS Intel
export PATH=$PATH:/usr/local/sbin
# for Apple Silicon
export PATH=$PATH:/opt/homebrew/sbin
</pre>

Add the above export to the shell profile (such as `~/.bashrc` for bash or `~/.zshrc` for zsh)
to have `PATH` updated for every new shell, including OS restarts.
