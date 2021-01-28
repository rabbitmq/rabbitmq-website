<!--
Copyright (c) 2007-2021 VMware, Inc. or its affiliates.

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

The formula will also install a reasonably recent [supported Erlang/OTP version](/which-erlang.html)
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

Installing the RabbitMQ formula will install key dependencies such as a [supported Erlang/OTP version](/which-erlang.html).

## <a id="operations" class="anchor" href="#operations">Operations</a>

The RabbitMQ server scripts and [CLI tools](/cli.html) are installed into the `sbin` directory under `/usr/local/Cellar/rabbitmq/<version>/`,
which is accessible from `/usr/local/opt/rabbitmq/sbin`. Links to binaries have been created under `/usr/local/sbin`.
In case that directory is not in `PATH` it's recommended to append it:

<pre class="lang-bash">
export PATH=$PATH:/usr/local/sbin
</pre>

Add the above export to the shell profile (such as `~/.bashrc` for bash or `~/.zshrc` for zsh)
to have `PATH` updated for every new shell, including OS restarts.

The server can then be started with `rabbitmq-server` in the foreground or with `brew services start rabbitmq`
to have it run under launchd in the background.

With Homebrew, the node and CLI tools will use the logged in user account by default.
Using `sudo` is not required.

Otherwise operations are no different from the generic binary build.
Please refer to the [Operations section](install-generic-unix.html#operations) of
the generic binary build guide.
