<!--
Copyright (c) 2007-2018 Pivotal Software, Inc.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Runtime Tuning

## <a id="intro" class="anchor" href="#intro">Intro</a>

RabbitMQ runs on the [Erlang virtual machine](https://erlang.org) and runtime.
A [compatible version of Erlang](/which-erlang.html) must be installed in order to run RabbitMQ.

The Erlang runtime includes a number of components used by RabbitMQ:

 * The Erlang virtual machine executes the code
 * `epmd` resolves node names on a host to an inter-node communication port

This guide will focus on the virtual machine. For an overview of epmd, please refer to the
[Networking guide](/networking.html#epmd-inet-dist-port-range).


## <a id="vm-settings" class="anchor" href="#vm-settings">VM Settings</a>

The Erlang VM has a broad range of [options that can be configured](http://erlang.org/doc/man/erl.html)
that cover process scheduler settings, memory allocation, garbage collection, I/O, and more.

### <a id="emulator-flags" class="anchor" href="#emulator-flags">VM Settings</a>

RabbitMQ uses a number of [environment variables](/configure.html#define-environment-variables) that control VM flags:

 * `RABBITMQ_SERVER_ERL_ARGS` allows all VM flags to be overridden, including the defaults that RabbitMQ sets
 * `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` allows a set of flags to be appended to the defaults that RabbitMQ sets
 * `RABBITMQ_CTL_ERL_ARGS` controls [CLI tool](/cli.html) VM flags

In most cases `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` is the recommended option. It can be used to override defaults
in a safe manner. For example, if an important flag is omitted from `RABBITMQ_SERVER_ERL_ARGS`, runtime performance
characteristics or system limits can be unintentionally affected.
