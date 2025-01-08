---
title: Configuration
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
  RabbitMQServerVersion,
} from '@site/src/components/RabbitMQServer';

# Configuration

## Overview {#overview}

RabbitMQ comes with default built-in settings. Those can be entirely
sufficient in some environment (e.g. development and QA).
For all other cases, as well as [production deployment tuning](./production-checklist),
there is a way to configure many things in the broker as well as [plugins](./plugins).

This guide covers a number of topics related to configuration:

 * [Different ways](#means-of-configuration) in which various settings of the server and plugins are configured
 * [Configuration file(s)](#configuration-files): primary [rabbitmq.conf](#config-file) or [a directory of .conf files](#config-confd-directory), and optional [advanced.config](#advanced-config-file)
 * Default [configuration file location(s)](#config-location) on various platforms
 * Configuration troubleshooting: how to [find config file location](#verify-configuration-config-file-location) and [inspect and verify effective configuration](#verify-configuration-effective-configuration)
 * [Environment variable interpolation](#env-variable-interpolation) in `rabbitmq.conf`
 * [Environment variables](#customise-environment) used by RabbitMQ nodes
 * [Operating system (kernel) limits](#kernel-limits)
 * Available [core server settings](#config-items)
 * Available [environment variables](#supported-environment-variables)
 * How to [encrypt sensitive configuration values](#configuration-encryption)

and more.

Since configuration affects many areas of the system, including plugins, individual [documentation guides](./index.md)
dive deeper into what can be configured. [Runtime Tuning](./runtime) is a companion to this guide that focuses
on the configurable parameters in the runtime. [Deployment Guidelines](./production-checklist) is a related guide
that outlines what settings will likely need tuning in most production environments.


## Means of Configuration {#means-of-configuration}

A RabbitMQ node can be configured using a number of mechanisms responsible
for different areas:

<table>
  <caption>Ways of configuring RabbitMQ</caption>
  <thead>
    <td><strong>Mechanism</strong></td>
    <td><strong>Description</strong></td>
  </thead>

  <tr>
    <td>
      [Configuration File(s)](#configuration-files)
    </td>
    <td>
      Contains server and plugin settings for TCP listeners and other [networking-related settings](./networking),
      [TLS](./ssl), [resource constraints (alarms)](./alarms), [authentication and authorisation backends](./access-control),
      [message store settings](./persistence-conf), and more.
    </td>
  </tr>
  <tr>
    <td>
      [Environment Variables](#customise-environment)
    </td>
    <td>
      Used to define [node name](./cli#node-names), file and directory locations, runtime flags taken from the shell, or set in
      the environment configuration file, `rabbitmq-env.conf` (Linux, MacOS, BSD)
      and `rabbitmq-env-conf.bat` (Windows)
    </td>
  </tr>

  <tr>
    <td>
      [rabbitmqctl](./cli)
    </td>
    <td>
      When [internal authentication/authorisation backend](./access-control) is used,
      `rabbitmqctl` is the tool that manages virtual hosts, users and permissions. It
      is also used to manage [runtime parameters and policies](./parameters).
    </td>
  </tr>

  <tr>
    <td>
      [rabbitmq-queues](./cli)
    </td>
    <td>
      `rabbitmq-queues` is the tool that manages settings specific to [quorum queues](./quorum-queues).
    </td>
  </tr>

  <tr>
    <td>
      [rabbitmq-plugins](./cli)
    </td>
    <td>
      `rabbitmq-plugins` is the tool that manages [plugins](./plugins).
    </td>
  </tr>

  <tr>
    <td>
      [rabbitmq-diagnostics](./cli)
    </td>
    <td>
      `rabbitmq-diagnostics` allows for inspection of node state, including effective configuration,
      as well as many other metrics and [health checks](./monitoring).
    </td>
  </tr>

  <tr>
    <td>
      [Parameters and Policies](./parameters)
    </td>
    <td>
      defines cluster-wide settings which can change at run time
      as well as settings that are convenient to configure for groups of queues (exchanges, etc)
      such as including optional queue arguments.
    </td>
  </tr>

  <tr>
    <td>
      [Runtime (Erlang VM) Flags](./runtime)
    </td>
    <td>
      Control lower-level aspects of the system: memory allocation settings, inter-node communication
      buffer size, runtime scheduler settings and more.
    </td>
  </tr>

  <tr>
    <td>
      [Operating System Kernel Limits](#kernel-limits)
    </td>
    <td>
      Control process limits enforced by the kernel: [max open file handle limit](./networking#open-file-handle-limit),
      max number of processes and kernel threads, max resident set size and so on.
    </td>
  </tr>
</table>

Most settings are configured using the first two methods. This guide,
therefore, focuses on them.

## Configuration File(s) {#configuration-files}

### Introduction {#config-file-intro}

While some settings in RabbitMQ can be tuned using environment variables,
most are configured using a [main configuration file](#config-file) named `rabbitmq.conf`.

This includes configuration for the core server as well as plugins. An additional configuration
file can be used to configure settings that cannot be expressed in the main file's configuration
format. This is covered in more details below.

The sections below cover the syntax and [location](#config-file-location) of both files,
where to find examples, and more.

### Config File Locations {#config-file-location}

[Default config file locations](./configure#config-location)
vary between operating systems and [package types](./download).

This topic is covered in more detail in the rest of this guide.

When in doubt about RabbitMQ config file location,
consult the log file and/or management UI as explained in the following section.

### How to Find Config File Location {#verify-configuration-config-file-location}

The active configuration file can be verified by inspecting the
RabbitMQ log file. It will show up in the [log file](./logging)
at the top, along with the other broker boot log entries. For example:

```ini
node           : rabbit@example
home dir       : /var/lib/rabbitmq
config file(s) : /etc/rabbitmq/advanced.config
               : /etc/rabbitmq/rabbitmq.conf
```

If the configuration file cannot be found or read by RabbitMQ, the log entry
will say so:

```ini
node           : rabbit@example
home dir       : /var/lib/rabbitmq
config file(s) : /var/lib/rabbitmq/hare.conf (not found)
```

Alternatively, the location of configuration files used by a local node, use the [rabbitmq-diagnostics status](./man/rabbitmq-diagnostics.8) command:

```bash
# displays key
rabbitmq-diagnostics status
```

and look for the `Config files` section that would look like this:

```
Config files

 * /etc/rabbitmq/advanced.config
 * /etc/rabbitmq/rabbitmq.conf
```

To inspect the locations of a specific node, including nodes running remotely, use the `-n` (short for `--node`) switch:

```bash
rabbitmq-diagnostics status -n [node name]
```

Finally, config file location can be found in the [management UI](./management),
together with other details about nodes.

When troubleshooting configuration settings, it is very useful to verify that the config file
path is correct, exists and can be loaded (e.g. the file is readable) before [verifying effective node configuration](#verify-configuration-effective-configuration).
Together, these steps help quickly narrow down most common misconfiguration problems.

### The Modern and Old Config File Formats {#config-file-formats}

All [supported RabbitMQ versions](/release-information) use an [ini-like, sysctl configuration file format](#config-file)
for the main configuration file. The file is typically named `rabbitmq.conf`.

The new config format is much simpler, easier for humans to read
and machines to generate. It is also relatively limited compared
to the classic config format used prior to RabbitMQ 3.7.0.
For example, when configuring [LDAP support](./ldap), it may be necessary to use deeply nested data structures to
express desired configuration.

To accommodate this need, modern RabbitMQ versions allow for both formats to be used at the same time
in separate files: `rabbitmq.conf` uses the new style format and is recommended for most settings,
and `advanced.config` covers more advanced settings that the ini-style configuration
cannot express. This is covered in more detail in the following sections.

<table>
  <thead>
    <tr>
      <td><strong>Configuration File</strong></td>
      <td><strong>Format Used</strong></td>
      <td><strong>Purpose</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>`rabbitmq.conf`</td>
      <td>New style format (sysctl or ini-like)</td>
      <td>
        [Primary configuration file](#config-file) with a `.conf` extension. Should be used for most settings.
        It is easier for humans to read and machines (deployment tools) to generate.
        Not every setting can be expressed in this format.
      </td>
    </tr>
    <tr>
      <td>`advanced.config`</td>
      <td>Classic (Erlang terms)</td>
      <td>
        A limited number of settings that cannot be expressed
        in the new style configuration format, such as [LDAP queries](./ldap).
        Only should be used when necessary.
      </td>
    </tr>
    <tr>
      <td>`rabbitmq-env.conf` (`rabbitmq-env.conf.bat` on Windows)</td>
      <td>Environment variable pairs</td>
      <td>
        Used to set [environment variables](#customise-environment) relevant to RabbitMQ in one place.
      </td>
    </tr>
  </tbody>
</table>

Compare this examplary `rabbitmq.conf` file

```ini
# A new style format snippet. This format is used by rabbitmq.conf files.
ssl_options.cacertfile           = /path/to/ca_certificate.pem
ssl_options.certfile             = /path/to/server_certificate.pem
ssl_options.keyfile              = /path/to/server_key.pem
ssl_options.verify               = verify_peer
ssl_options.fail_if_no_peer_cert = true
```

to

```erlang
%% A classic format snippet, now used by advanced.config files.
[
  {rabbit, [{ssl_options, [{cacertfile,           "/path/to/ca_certificate.pem"},
                           {certfile,             "/path/to/server_certificate.pem"},
                           {keyfile,              "/path/to/server_key.pem"},
                           {verify,               verify_peer},
                           {fail_if_no_peer_cert, true}]}]}
].
```

### The Main Configuration File, rabbitmq.conf {#config-file}

The configuration file `rabbitmq.conf`
allows the RabbitMQ server and plugins to be configured.
The file uses the [sysctl format](https://github.com/basho/cuttlefish/wiki/Cuttlefish-for-Application-Users),
unlike `advanced.config` and the original `rabbitmq.config` (both use the Erlang terms format).

The syntax can be briefly explained in 3 lines:

 * One setting uses one line
 * Lines are structured `Key = Value`
 * Any line starting with a `#` character is a comment

A minimalistic example configuration file follows:

```ini
# this is a comment
listeners.tcp.default = 5673
```

The same example in the [classic config format](#config-file-formats):

```erlang
%% this is a comment
[
  {rabbit, [
      {tcp_listeners, [5673]}
    ]
  }
].
```

This example will alter the [port RabbitMQ listens on](./networking#ports) for
AMQP 0-9-1 and AMQP 1.0 client connections from 5672 to 5673.

The RabbitMQ server source repository contains [an example rabbitmq.conf file](https://github.com/rabbitmq/rabbitmq-server/blob/v3.12.x/deps/rabbit/docs/rabbitmq.conf.example)
named `rabbitmq.conf.example`. It contains examples of
most of the configuration items you might want to set (with some very obscure ones omitted), along with
documentation for those settings.

Documentation guides such as [Networking](./networking), [TLS](./ssl), or
[Access Control](./access-control) contain many examples in relevant formats.

Note that this configuration file is not to be confused with the environment variable
configuration files, [rabbitmq-env.conf](#environment-env-file-unix)
and [rabbitmq-env-conf.bat](#rabbitmq-env-file-windows).

To override the main RabbitMQ config file location, use the `RABBITMQ_CONFIG_FILE`
(or `RABBITMQ_CONFIG_FILES` to use a `conf.d`-style directory of sorted files) [environment variables](#customise-environment).
Use `.conf` as file extension for the new style config format, e.g. `/etc/rabbitmq/rabbitmq.conf` or
`/data/configuration/rabbitmq/rabbitmq.conf`

### Using a Directory of .conf Files {#config-confd-directory}

A `conf.d`-style directory of files can also be used. Use `RABBITMQ_CONFIG_FILES` (note the plural "_FILES")
to point the node at a directory of such files:

```ini
# uses a directory of .conf files loaded in alphabetical order
RABBITMQ_CONFIG_FILES=/path/to/a/custom/location/rabbitmq/conf.d
```

Target directory must contain a number of `.conf` files with the same syntax as `rabbitmq.conf`.

They will be **loaded in alphabetical order**. A common naming practice uses numerical prefixes
in filenames to make it easier to reason about the order, or make sure a "defaults file"
is always loaded first, regardless of how many extra files are generated at deployment time:

```bash
ls -lh /path/to/a/custom/location/rabbitmq/conf.d
# => -r--r--r--  1 rabbitmq  rabbitmq    87B Mar 21 19:50 00-defaults.conf
# => -r--r--r--  1 rabbitmq  rabbitmq   4.6K Mar 21 19:52 10-main.conf
# => -r--r--r--  1 rabbitmq  rabbitmq   1.6K Mar 21 19:52 20-tls.conf
# => -r--r--r--  1 rabbitmq  rabbitmq   1.6K Mar 21 19:52 30-federation.conf
```

### Environment Variable Interpolation in `rabbitmq.conf` {#env-variable-interpolation}

[Modern RabbitMQ versions](/release-information) support environment variable interpolation in `rabbitmq.conf`. For example,
to override default user credentials, one can use [import a definition file](./definitions)
or the following config file in combination with two environment variables:

```ini
# environment variable interpolation
default_user = $(SEED_USERNAME)
default_pass = $(SEED_USER_PASSWORD)
```

Environment variables can be used to configure a portion of a value, for example,
cluster name:

```ini
cluster_name = deployment-$(DEPLOYMENT_ID)
```

Environment variable values are interpolated as strings before the config file is parsed and validated.
This means that they can be used to override numerical settings (such as ports) or paths (such as TLS certificate and private key paths).

In addition, RabbitMQ respects a [number of environment variables](#customise-environment) for when a value must be known before
the configuration file is loaded.


### The advanced.config File {#advanced-config-file}

:::info
This section describes the original configuration format that has been superseded by
a [modern alternative](#config-file).

Only a limited number of features and advanced (or rarely used) settings require the use
of this format. When this is an option, use `rabbitmq.conf`.
:::

Some configuration settings are not possible or are difficult to configure
using the sysctl format. As such, it is possible to use an additional
config file in the Erlang term format (same as `rabbitmq.config`).
That file is commonly named `advanced.config`. It will be merged
with the configuration provided in `rabbitmq.conf`.

The RabbitMQ server source repository contains [an example advanced.config file](https://github.com/rabbitmq/rabbitmq-server/blob/v3.13.x/deps/rabbit/docs/advanced.config.example)
named `advanced.config.example`. It focuses on the options that are typically set using the advanced config.

To override the advanced config file location, use the `RABBITMQ_ADVANCED_CONFIG_FILE`
environment variable.

### Location of rabbitmq.conf, advanced.config and rabbitmq-env.conf {#config-location}

Default configuration file location is distribution-specific. RabbitMQ packages or nodes will not create
any configuration files. Users and deployment tool should use the following locations when creating the files:

<table>
  <thead>
    <tr>
      <td><strong>Platform</strong></td>
      <td><strong>Default Configuration File Directory</strong></td>
      <td><strong>Example Configuration File Paths</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        [Generic binary package](./install-generic-unix)
      </td>
      <td>
        `$RABBITMQ_HOME/etc/rabbitmq/`
      </td>
      <td>
        `$RABBITMQ_HOME/etc/rabbitmq/rabbitmq.conf`,
        `$RABBITMQ_HOME/etc/rabbitmq/advanced.config`
      </td>
    </tr>
    <tr>
      <td>
        [Debian and Ubuntu](./install-debian)
      </td>
      <td>
        `/etc/rabbitmq/`
      </td>
      <td>
        `/etc/rabbitmq/rabbitmq.conf`,
        `/etc/rabbitmq/advanced.config`
      </td>
    </tr>
    <tr>
      <td>
        [RPM-based Linux](./install-rpm)
      </td>
      <td>
        `/etc/rabbitmq/`
      </td>
      <td>
        `/etc/rabbitmq/rabbitmq.conf`,
        `/etc/rabbitmq/advanced.config`
      </td>
    </tr>
    <tr>
      <td>
        [Windows](./install-windows)
      </td>
      <td>
        `%APPDATA%\RabbitMQ\`
      </td>
      <td>
        `%APPDATA%\RabbitMQ\rabbitmq.conf`,
        `%APPDATA%\RabbitMQ\advanced.config`
      </td>
    </tr>
    <tr>
      <td>
        [MacOS Homebrew Formula](./install-homebrew)
      </td>
      <td>
        `${install_prefix}/etc/rabbitmq/`,
        and the Homebrew cellar prefix is usually `/usr/local`
      </td>
      <td>
        `${install_prefix}/etc/rabbitmq/rabbitmq.conf`,
        `${install_prefix}/etc/rabbitmq/advanced.config`
      </td>
    </tr>
  </tbody>
</table>

Environment variables can be used to override the location of the configuration file:

```ini
# overrides primary config file location
RABBITMQ_CONFIG_FILE=/path/to/a/custom/location/rabbitmq.conf

# overrides advanced config file location
RABBITMQ_ADVANCED_CONFIG_FILE=/path/to/a/custom/location/advanced.config

# overrides environment variable file location
RABBITMQ_CONF_ENV_FILE=/path/to/a/custom/location/rabbitmq-env.conf
```

### When Will Configuration File Changes Be Applied {#config-changes-effects}

`rabbitmq.conf` and `advanced.config` changes take effect after a node restart.

If `rabbitmq-env.conf` doesn't exist, it can be created manually
in the location specified by the `RABBITMQ_CONF_ENV_FILE` variable.
On Windows systems, it is named `rabbitmq-env-conf.bat`.

Windows service users will need to **[re-install the service](#rabbitmq-env-file-windows)** if
configuration file location or any values in ``rabbitmq-env-conf.bat` have changed.
Environment variables used by the service would not be updated otherwise.

In the context of deployment automation this means that environment variables
such as `RABBITMQ_BASE` and `RABBITMQ_CONFIG_FILE` should ideally be set before RabbitMQ is installed.
This would help avoid unnecessary confusion and Windows service re-installations.

### How to Inspect and Verify Effective Configuration of a Running Node {#verify-configuration-effective-configuration}

It is possible to print effective configuration (user provided values from all configuration files merged into defaults) using
the [rabbitmq-diagnostics environment](./man/rabbitmq-diagnostics.8) command:

```bash
# inspect effective configuration on a node
rabbitmq-diagnostics environment
```

to check effective configuration of a specific node, including nodes running remotely, use the `-n` (short for `--node`) switch:

```bash
rabbitmq-diagnostics environment -n [node name]
```

The command above will print applied configuration for every application (RabbitMQ, plugins, libraries) running on the node.
Effective configuration is computed using the following steps:

 * `rabbitmq.conf` is translated into the internally used (advanced) config format. These configuration is merged into the defaults
 * `advanced.config` is loaded if present, and merged into the result of the step above

Effective configuration should be verified together with [config file location](#verify-configuration-config-file-location).
Together, these steps help quickly narrow down most common misconfiguration problems.

### The rabbitmq.config (Classic Format) File {#erlang-term-config-file}

Prior to RabbitMQ 3.7.0, RabbitMQ config file was named
`rabbitmq.config` and used [the same Erlang term format](http://www.erlang.org/doc/man/config.html) used by `advanced.config` today.
That format is [still supported](#config-file-formats) for backwards compatibility.

The classic format is **deprecated**. Please prefer the [new style config format](#config-file)
in `rabbitmq.conf` accompanied by an `advanced.config` file as needed.

To use a config file in the classic format, export `RABBITMQ_CONFIG_FILE` to point to the file with
a `.config` extension. The extension will indicate to RabbitMQ that it should treat the file as one
in the classic config format.

[An example configuration file](https://github.com/rabbitmq/rabbitmq-server/blob/v3.7.x/deps/rabbit/docs/rabbitmq.config.example) named
`rabbitmq.config.example`. It contains an example of most of the configuration items in the classic config format.

To override the main RabbitMQ config file location, use the `RABBITMQ_CONFIG_FILE`
[environment variable](#customise-environment). Use `.config` as file extension
for the classic config format.

The use of classic config format should only be limited to the [advanced.config file](#advanced-config-file) and settings
that cannot be configured using the [ini-style config file](#config-file).

### Example Configuration Files {#example-config}

The RabbitMQ server source repository contains
examples for the configuration files:

 * [rabbitmq.conf.example](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbit/docs/rabbitmq.conf.example)
 * [advanced.config.example](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbit/docs/advanced.config.example)

These files contain examples of most of the configuration keys along with a brief explanation
for those settings. All configuration items are commented out in the
example, so you can uncomment what you need. Note that the
example files are meant to be used as, well, examples, and
should not be treated as a general recommendation.

In most distributions the example file is placed into the
same location as the real file should be placed (see
above). On Debian and RPM distributions
policy forbids doing so; instead find the file
under `/usr/share/doc/rabbitmq-server/`
or <code>{`/usr/share/doc/rabbitmq-server-${RabbitMQServerVersion()}/`}</code>,
respectively.

### Core Server Variables Configurable in rabbitmq.conf {#config-items}

These variables are the most common. The list is not complete, as
some settings are quite obscure.

<table class="name-description">
  <thead>
    <tr>
      <th><strong>Key</strong></th>
      <th><strong>Documentation</strong></th>
    </tr>
  </thead>

  <tr>
    <td>`listeners.tcp`</td>
    <td>
      Ports or hostname/pair on which to listen for "plain" AMQP 0-9-1 and AMQP 1.0 connections
      (without [TLS](./ssl)). See the [Networking guide](./networking) for more
      details and examples.

      <p>
        Default:
```ini
listeners.tcp.default = 5672
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`listeners.ssl`</td>
    <td>
      Ports or hostname/pair on which to listen for TLS-enabled AMQP 0-9-1 and AMQP 1.0 connections.
      See the [TLS guide](./ssl) for more
      details and examples.
      <p>Default: `none` (not set)</p>
    </td>
  </tr>
  <tr>
    <td>`ssl_options`</td>
    <td>
      TLS configuration. See the [TLS guide](ssl#enabling-tls).
      <p>
        Default:
```ini
ssl_options = none
```
        </p>
    </td>
  </tr>
  <tr>
    <td>`num_acceptors.tcp`</td>
    <td>
      Number of Erlang processes that will accept connections for the TCP
      listeners.
      <p>
        Default:
```ini
num_acceptors.tcp = 10
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`num_acceptors.ssl`</td>
    <td>
      Number of Erlang processes that will accept TLS connections from clients.
      <p>
        Default:
```ini
num_acceptors.ssl = 10
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`distribution.listener.interface`</td>
    <td>
      Controls what network interface will be used for communication
      with other cluster members and CLI tools.
      <p>
        Default:
```ini
distribution.listener.interface = 0.0.0.0
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`distribution.listener.port_range.min`</td>
    <td>
      Controls the lower bound of a server port range that will be used for communication
      with other cluster members and CLI tools.
      <p>
        Default:
```ini
distribution.listener.port_range.min = 25672
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`distribution.listener.port_range.max`</td>
    <td>
      Controls the upper bound of a server port range that will be used for communication
      with other cluster members and CLI tools.
      <p>
        Default:
```ini
distribution.listener.port_range.max = 25672
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`handshake_timeout`</td>
    <td>
      Maximum time for AMQP 0-9-1 handshake (after socket connection and TLS handshake),
      in milliseconds.
      <p>
        Default:
```ini
handshake_timeout = 10000
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`ssl_handshake_timeout`</td>
    <td>
      TLS handshake timeout, in milliseconds.
      <p>
        Default:
```ini
ssl_handshake_timeout = 5000
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`vm_memory_high_watermark`</td>
    <td>
      Memory threshold at which the flow control is
      triggered. Can be absolute or relative to the amount of RAM available
      to the OS:

```ini
vm_memory_high_watermark.relative = 0.6
```
```ini
vm_memory_high_watermark.absolute = 2GB
```

      See the [memory-based flow control](./memory) and
      [alarms](./alarms) documentation.

      <p>
        Default:

```ini
vm_memory_high_watermark.relative = 0.4
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`vm_memory_calculation_strategy`</td>
    <td>
      Strategy for memory usage reporting. Can be one of the following:
      <ul class="plain">
        <li>`allocated`: uses Erlang memory allocator statistics</li>
        <li>`rss`: uses operating system RSS memory reporting. This uses OS-specific means and may start short lived child processes.</li>
        <li>`legacy`: uses legacy memory reporting (how much memory is considered to be used by the runtime). This strategy is fairly inaccurate.</li>
        <li>`erlang`: same as `legacy`, preserved for backwards compatibility</li>
      </ul>
      <p>
        Default:
```ini
vm_memory_calculation_strategy = allocated
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`vm_memory_high_watermark_paging_ratio`</td>
    <td>
      Fraction of the high watermark limit at which queues
      start to page messages out to disc to free up
      memory. See the [memory-based flow control](./memory) documentation.
      <p>
        Default:
```ini
vm_memory_high_watermark_paging_ratio = 0.5
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`total_memory_available_override_value`</td>
    <td>
      Makes it possible to override the total amount of memory
      available, as opposed to inferring it from the environment using
      OS-specific means. This should only be used when actual
      maximum amount of RAM available to the node doesn't match the value
      that will be inferred by the node, e.g. due to containerization or similar
      constraints the node cannot be aware of. The value may be
      set to an integer number of bytes or, alternatively, in
      information units (e.g `8GB`). For example,
      when the value is set to 4 GB, the node will believe it is
      running on a machine with 4 GB of RAM.
      <p>
        Default: `undefined` (not set or used).
      </p>
    </td>
  </tr>
  <tr>
    <td>`disk_free_limit`</td>
    <td>
      Disk free space limit of the partition on which RabbitMQ
      is storing data. When available disk space falls below
      this limit, flow control is triggered. The value can be
      set relative to the total amount of RAM or as an absolute value
      in bytes or, alternatively, in
      information units (e.g `50MB` or `5GB`):

```ini
disk_free_limit.absolute = 2GB
```

      By default free disk space must exceed 50MB. This must be revisited for [production environments](./production-checklist). See the
      [Disk Alarms](./disk-alarms) documentation.
      <p>
        Default:
```ini
disk_free_limit.absolute = 50MB
```
      </p>
    </td>
  </tr>

  <tr>
    <td>`queue_leader_locator`</td>
    <td>
      Controls the [strategy used when selecting a node](./clustering#replica-placement) to host the leader replica of a newly declared
      queue or stream.
    </td>
  </tr>

  <tr>
    <td>`log.file.level`</td>
    <td>
      Controls the granularity of logging. The value is a list
      of log event category and log level pairs.

      <p>
				The level can be one of `error` (only errors are
				logged), `warning` (only errors and warning are
				logged), `info` (errors, warnings and informational
				messages are logged), or `debug` (errors, warnings,
        informational messages and debugging messages are
        logged).
      </p>

      <p>
        Default:
```ini
log.file.level = info
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`channel_max`</td>
    <td>
      Maximum permissible number of channels to
      negotiate with clients, not including a special channel number 0 used in the protocol.
      Setting to 0 means "unlimited", a dangerous value since applications sometimes have channel leaks.
      Using more channels increases memory footprint of the broker.
      <p>
        Default:
```ini
channel_max = 2047
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`channel_operation_timeout`</td>
    <td>
      Channel operation timeout in milliseconds (used internally, not directly
      exposed to clients due to messaging protocol differences and limitations).

      <p>
        Default:
```ini
channel_operation_timeout = 15000
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`max_message_size`</td>
    <td>
        The largest allowed message payload size in bytes. Messages
        of larger size will be rejected with a suitable channel exception.
        <p>Default: `134217728`</p>
        <p>Max value: `536870912`</p>
    </td>
  </tr>
  <tr>
    <td>`heartbeat`</td>
    <td>
      Value representing the heartbeat timeout suggested by the server during
      connection parameter negotiation.
      If set to 0 on both ends, heartbeats are deactivated (this is not recommended).
      See the [Heartbeats guide](./heartbeats) for details.

      <p>
        Default:
```ini
heartbeat = 60
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`default_vhost`</td>
    <td>
      Virtual host to create when RabbitMQ creates a new
      database from scratch. The
      exchange `amq.rabbitmq.log` will exist in
      this virtual host.
      <p>
        Default:
```ini
default_vhost = /
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`default_user`</td>
    <td>
      User name to create when RabbitMQ creates a new database
      from scratch.
      <p>
        Default:
```ini
default_user = guest
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`default_pass`</td>
    <td>
      Password for the default user.
      <p>
        Default:
```ini
default_pass = guest
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`default_user_tags`</td>
    <td>
      Tags for the default user.
      <p>
        Default:
```ini
default_user_tags.administrator = true
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`default_permissions`</td>
    <td>
      [Permissions](./access-control)
      to assign to the default user when creating it.
      <p>
        Default:

```ini
default_permissions.configure = .*
default_permissions.read = .*
default_permissions.write = .*
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`loopback_users`</td>
    <td>
      List of users which are only permitted to connect to the
      broker via a loopback interface (i.e. `localhost`).

      <p>
        To allow the default `guest`
        user to connect remotely (a security practice [unsuitable for production use](./production-checklist)),
        set this to `none`:

```ini
# awful security practice,
# consider creating a new
# user with secure generated credentials!
loopback_users = none
```
      </p>
      <p>
        To restrict another user to localhost-only connections,
        do it like so (`monitoring` is the name of the user):
```ini
loopback_users.monitoring = true
```
      </p>
      <p>
        Default:
```ini
# guest uses well known
# credentials and can only
# log in from localhost
# by default
loopback_users.guest = true
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`cluster_formation.classic_config.nodes`</td>
    <td>
      Classic [peer discovery](./cluster-formation) backend's list of nodes to contact.

      For example, to cluster with nodes `rabbit@hostname1` and `rabbit@hostname2` on first boot:

```ini
cluster_formation.classic_config.nodes.1 = rabbit@hostname1
cluster_formation.classic_config.nodes.2 = rabbit@hostname2
```
      <p>Default: `none` (not set)</p>
    </td>
  </tr>
  <tr>
    <td>`collect_statistics`</td>
    <td>
      Statistics collection mode. Primarily relevant for the
      management plugin. Options are:
      <ul>
        <li>`none` (do not emit statistics events)</li>
        <li>`coarse` (emit per-queue / per-channel / per-connection statistics)</li>
        <li>`fine` (also emit per-message statistics)</li>
        </ul>
      <p>
        Default:
```ini
collect_statistics = none
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`collect_statistics_interval`</td>
    <td>
      Statistics collection interval in
      milliseconds. Primarily relevant for
      the [management plugin](./management#statistics-interval).
      <p>
        Default:
```ini
collect_statistics_interval = 5000
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`management.db_cache_multiplier`</td>
    <td>
      Affects the amount of time the [management plugin](./management#statistics-interval)
      will cache expensive management queries such as
      queue listings. The cache will multiply the elapsed time of
      the last query by this value and cache the result for
      this amount of time.
      <p>
        Default:
```ini
management.db_cache_multiplier = 5
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`auth_mechanisms`</td>
    <td>
      [SASL authentication
      mechanisms](./authentication) to offer to clients.
      <p>
        Default:
```ini
auth_mechanisms.1 = PLAIN
auth_mechanisms.2 = AMQPLAIN
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`auth_backends`</td>
    <td>
      <p>
        List of [authentication and authorisation backends](./access-control) to
        use. See the [access control guide](./access-control) for details and examples.
      </p>
      <p>
        Other databases
        than `rabbit_auth_backend_internal` are
        available through [plugins](./plugins).
      </p>
      <p>
      Default:
      ```ini
      auth_backends.1 = internal
      ```
      </p>
    </td>
  </tr>
  <tr>
    <td>`reverse_dns_lookups`</td>
    <td>
      Set to `true` to have RabbitMQ perform a
      reverse DNS lookup on client connections, and present
      that information through `rabbitmqctl` and
      the management plugin.
      <p>
      Default:
      ```ini
      reverse_dns_lookups = false
      ```
      </p>
    </td>
  </tr>
  <tr>
    <td>`delegate_count`</td>
    <td>
      Number of delegate processes to use for intra-cluster
      communication. On a machine which has a very large
      number of cores and is also part of a cluster, you may
      wish to increase this value.
      <p>
      Default:
      ```ini
      delegate_count = 16
      ```
      </p>
    </td>
  </tr>

  <tr>
    <td>`tcp_listen_options`</td>
    <td>
      Default socket options. You may want to change these
      when you troubleshoot network issues.
      <p>
        Default:
```ini
tcp_listen_options.backlog = 128
tcp_listen_options.nodelay = true
tcp_listen_options.linger.on = true
tcp_listen_options.linger.timeout = 0
```
      </p>

<br/>
```ini
tcp_listen_options.exit_on_close = false
```

Set `tcp_listen_options.exit_on_close` to `true` to have RabbitMQ try to immediately close TCP socket
when client disconnects. Note that this cannot guarantee immediate TCP socket resource
release by the kernel.

<br/>
```ini
tcp_listen_options.keepalive = false
```
<p>
  Set `tcp_listen_options.keepalive` to `true` to enable [TCP keepalives](./networking#tcp-keepalives).
  <br/>
  </p>
    </td>
  </tr>
  <tr>
    <td>`cluster_partition_handling`</td>
    <td>
      How to handle network partitions. Available modes are:
      <ul>
        <li>`ignore`</li>
        <li>`autoheal`</li>
        <li>`pause_minority`</li>
        <li>`pause_if_all_down`</li>
      </ul>
      `pause_if_all_down` mode requires additional parameters:
      <ul>
        <li>`nodes`</li>
        <li>`recover`</li>
      </ul>
      See the
      [documentation
      on partitions](./partitions#automatic-handling) for more information.

      <p>
      Default:
      ```ini
      cluster_partition_handling = ignore
      ```
      </p>
    </td>
  </tr>
  <tr>
    <td>`cluster_keepalive_interval`</td>
    <td>
      How frequently nodes should send keepalive messages to
      other nodes (in milliseconds). Note that this is not the
      same thing as [`net_ticktime`](./nettick);
      missed keepalive messages will not cause nodes to be
      considered down.

      <p>
        Default:
```ini
cluster_keepalive_interval = 10000
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`queue_index_embed_msgs_below`</td>
    <td>
      Size in bytes of message below which messages will
      be embedded directly in the queue index. You are advised
      to read the [persister
      tuning](./persistence-conf) documentation before changing this.
      <p>
        Default:
```ini
queue_index_embed_msgs_below = 4096
```
      </p>
    </td>
  </tr>

  <tr>
    <td>`mnesia_table_loading_retry_timeout`</td>
    <td>
      Timeout used when waiting for Mnesia tables in a cluster to
      become available.
      <p>
        Default:
```ini
mnesia_table_loading_retry_timeout = 30000
```
</p>
    </td>
  </tr>

  <tr>
    <td>`mnesia_table_loading_retry_limit`</td>
    <td>
      Retries when waiting for Mnesia tables in the cluster startup. Note that
      this setting is not applied to Mnesia upgrades or node deletions.
      <p>
      Default:
```ini
mnesia_table_loading_retry_limit = 10
```
      </p>
    </td>
  </tr>

  <tr>
    <td>`mirroring_sync_batch_size`</td>
    <td>
      Batch size used to transfer messages to an unsynchronised replica (queue mirror).
      See [documentation on eager batch synchronization](./ha#batch-sync).
      <p>
        Default:
```ini
mirroring_sync_batch_size = 4096
```
      </p>
    </td>
  </tr>

  <tr>
    <td>`queue_leader_locator`</td>
    <td>
      queue leader location strategy. Available strategies are:
      <ul>
        <li>`balanced`</li>
        <li>`client-local`</li>
      </ul>
      See the
      [documentation
      on queue leader location](./ha#queue-leader-location) for more information.
      <p>
        Default:
```ini
queue_leader_locator = client-local
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`proxy_protocol`</td>
    <td>
      If set to `true`, RabbitMQ will expect a [proxy
      protocol](http://www.haproxy.org/download/3.1/doc/proxy-protocol.txt) header to be sent first when an AMQP
      connection is opened.  This implies to set up a proxy
      protocol-compliant reverse proxy (e.g. [HAproxy](http://www.haproxy.org/download/3.1/doc/proxy-protocol.txt)
      or [AWS
      ELB](http://docs.aws.amazon.com/elasticloadbalancing/latest/classic/enable-proxy-protocol.html)) in front of RabbitMQ.  Clients can't directly
      connect to RabbitMQ when proxy protocol is enabled, so
      all connections must go through the reverse proxy.

      <p>
        See [the
        networking guide](./networking#proxy-protocol) for more information.
      </p>

      <p>
        Default:
```ini
proxy_protocol = false
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`cluster_name`</td>
    <td>
      Operator-controlled cluster name. This name is used to identify a cluster, and by
      the federation and Shovel plugins to record the origin or path of transferred messages.
      Can be set to any arbitrary string to help identify the cluster (eg. `london`).
      This name can be inspected by AMQP 0-9-1 clients in the server properties map.

      <p>
        Default: by default the name is derived from the first (seed) node in the cluster.
      </p>
    </td>
  </tr>
</table>

The following configuration settings can be set in
the [advanced config file](#advanced-config-file) only,
under the `rabbit` section.

<table class="name-description">
  <thead>
    <tr>
      <th><strong>Key</strong></th>
      <th><strong>Documentation</strong></th>
    </tr>
  </thead>

  <tr>
    <td>`msg_store_index_module`</td>
    <td>
      Implementation module for queue indexing. You are
      advised to read the [message store tuning](./persistence-conf)
      documentation before changing this.
      <p>
        Default: `rabbit_msg_store_ets_index`
```erlang
{rabbit, [
{msg_store_index_module, rabbit_msg_store_ets_index}
]}
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`backing_queue_module`</td>
    <td>
      Implementation module for queue contents.
      <p>
        Default:
```erlang
{rabbit, [
{backing_queue_module, rabbit_variable_queue}
]}
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`msg_store_file_size_limit`</td>
    <td>
      Message store segment file size. Changing this for a node
      with an existing (initialised) database is dangerous and can
      lead to data loss!
      <p>
        Default: `16777216`
```erlang
{rabbit, [
%% Changing this for a node
%% with an existing (initialised) database is dangerous and can
%% lead to data loss!
{msg_store_file_size_limit, 16777216}
]}
```
      </p>
    </td>
  </tr>
    <tr>
      <td>`trace_vhosts`</td>
      <td>
        Used internally by
        the [tracer](./firehose). You shouldn't
        change this.
        <p>
          Default:
```erlang
{rabbit, [
{trace_vhosts, []}
]}
```
        </p>
      </td>
    </tr>
  <tr>
    <td>`msg_store_credit_disc_bound`</td>
    <td>
      The credits that a queue process is given by the message store.
      <p>
        By default, a queue process is given 4000 message store credits, and then 800 for every 800 messages that it processes.
      </p>
      <p>
        Messages which need to be paged out due to memory pressure will also use this credit.
      </p>
      <p>
        The Message Store is the last component in the credit flow chain. [Learn about credit flow](/blog/2015/10/06/new-credit-flow-settings-on-rabbitmq-3-5-5).
      </p>
      <p>
        This value only takes effect when messages are persisted to the message store.
        If messages are embedded on the queue index, then modifying this setting has no effect because credit_flow is NOT used when writing to the queue index.
      </p>
      <p>
        Default:
```erlang
{rabbit, [
{msg_store_credit_disc_bound, {4000, 800}}
]}
```
      </p>
    </td>
  </tr>
  <tr>
    <td>`queue_index_max_journal_entries`</td>
    <td>
      After how many queue index journal entries it will be
      flushed to disk.
      <p>
        Default:
```erlang
{rabbit, [
{queue_index_max_journal_entries, 32768}
]}
```
      </p>
    </td>
  </tr>
</table>

Several [plugins](./plugins) that ship with RabbitMQ have
dedicated documentation guides that cover plugin configuration:

 * [rabbitmq_management](./management#configuration)
 * [rabbitmq_management_agent](./management#configuration)
 * [rabbitmq_stomp](./stomp)
 * [rabbitmq_mqtt](./mqtt)
 * [rabbitmq_shovel](./shovel)
 * [rabbitmq_federation](./federation)
 * [rabbitmq_auth_backend_ldap](./ldap)
 * [rabbitmq_auth_backend_oauth](./oauth2#variables-configurable)


## Configuration Value Encryption {#configuration-encryption}

Sensitive `advanced.config` entries (e.g. password, URL containing
credentials) can be encrypted. RabbitMQ nodes then decrypt encrypted entries on boot.

Note that encrypted configuration entries don't make the
system meaningfully more secure. Nevertheless, they
allow deployments of RabbitMQ to conform to
regulations in various countries requiring
that no sensitive data should appear in plain text
in configuration files.

Encrypted values must be inside an Erlang `encrypted`
tuple: `{encrypted, ...}`.
Here is an example of a configuration file with an encrypted password
for the default user:

```erlang
[
  {rabbit, [
      {default_user, <<"guest">>},
      {default_pass,
        {encrypted,
         <<"cPAymwqmMnbPXXRVqVzpxJdrS8mHEKuo2V+3vt1u/fymexD9oztQ2G/oJ4PAaSb2c5N/hRJ2aqP/X0VAfx8xOQ==">>
        }
      },
      {config_entry_decoder, [
             {passphrase, <<"mypassphrase">>}
         ]}
    ]}
].
```

Note the `config_entry_decoder` key with the passphrase
that RabbitMQ will use to decrypt encrypted values.

The passphrase doesn't have to be hardcoded in the configuration file,
it can be in a separate file:

```erlang
[
  {rabbit, [
      %% ...
      {config_entry_decoder, [
             {passphrase, {file, "/path/to/passphrase/file"}}
         ]}
    ]}
].
```

RabbitMQ can also request an operator to enter the passphrase
when it starts by using `{passphrase, prompt}`.

### Encrypting advanced.config Values Using CLI Tools {#configuration-encryption-encode-value}

Use [rabbitmqctl](./cli) and the `encode`
command to encrypt values:

```bash
# <<"guest">> here is a value to encode, as an Erlang binary,
# as it would have appeared in advanced.config
rabbitmqctl encode '<<"guest">>' mypassphrase
{encrypted,<<"... long encrypted value...">>}
# "amqp://fred:secret@host1.domain/my_vhost" here is a value to encode, provided as an Erlang string,
# as it would have appeared in advanced.config
rabbitmqctl encode '"amqp://fred:secret@host1.domain/my_vhost"' mypassphrase
{encrypted,<<"... long encrypted value...">>}
```

Or, on Windows:

```PowerShell
# <<"guest">> here is a value to encode, as an Erlang binary,
# as it would have appeared in advanced.config
rabbitmqctl encode "<<""guest"">>" mypassphrase
{encrypted,<<"... long encrypted value...">>}
# "amqp://fred:secret@host1.domain/my_vhost" here is a value to encode, provided as an Erlang string,
# as it would have appeared in advanced.config
rabbitmqctl encode '"amqp://fred:secret@host1.domain/my_vhost"' mypassphrase
{encrypted,<<"... long encrypted value...">>}
```

### Decrypting advanced.config Values Using CLI Tools {#configuration-encryption-decode-value}

Use the `decode` command to decrypt values:

```bash
rabbitmqctl decode '{encrypted, <<"...">>}' mypassphrase
# => <<"guest">>
rabbitmqctl decode '{encrypted, <<"...">>}' mypassphrase
# => "amqp://fred:secret@host1.domain/my_vhost"
```

Or, on Windows:

```PowerShell
rabbitmqctl decode "{encrypted, <<""..."">>}" mypassphrase
# => <<"guest">>
rabbitmqctl decode "{encrypted, <<""..."">>}" mypassphrase
# => "amqp://fred:secret@host1.domain/my_vhost"
```

Values of different types can be encoded. The example above encodes
both binaries (`<<"guest">>`) and strings
(`"amqp://fred:secret@host1.domain/my_vhost"`).

### Encryption Settings: Cipher, Hashing Function, Number of Iterations {#configuration-encryption-settings}

The encryption mechanism uses PBKDF2 to produce a derived key
from the passphrase. The default hash function is SHA512
and the default number of iterations is 1000. The default
cipher is AES 256 CBC.

These defaults can be changed in the configuration file:

```erlang
[
  {rabbit, [
      ...
      {config_entry_decoder, [
             {passphrase, "mypassphrase"},
             {cipher, blowfish_cfb64},
             {hash, sha256},
             {iterations, 10000}
         ]}
    ]}
].
```

Or, using [CLI tools](./cli):

```bash
rabbitmqctl encode --cipher blowfish_cfb64 --hash sha256 --iterations 10000 \
                     '<<"guest">>' mypassphrase
```

Or, on Windows:

```PowerShell
rabbitmqctl encode --cipher blowfish_cfb64 --hash sha256 --iterations 10000 \
                     "<<""guest"">>" mypassphrase
```


## Configuration Using Environment Variables {#customise-environment}

Certain server parameters can be configured using environment variables:
[node name](./cli#node-names), RabbitMQ [configuration file location](#configuration-files),
[inter-node communication ports](./networking#ports), Erlang VM flags, and so on.

### Path and Directory Name Restrictions {#directory-and-path-restrictions}

Some of the environment variable configure paths and locations (node's base or data directory, [plugin source and expansion directories](./plugins),
and so on). Those paths have must exclude a number of characters:

 * `*` and `?` (on Linux, macOS, BSD and other UNIX-like systems)
 * `^` and `!` (on Windows)
 * `[` and `]`
 * `{` and `}`

The above characters will render the node unable to start or function as expected (e.g. expand plugins and load their metadata).

### Linux, MacOS, BSD {#environment-env-file-unix}

On UNIX-based systems (Linux, MacOS and flavours of BSD) it is possible to
use a file named ``rabbitmq-env.conf``
to define environment variables that will be used by the broker.
Its [location](#config-location) is configurable
using the `RABBITMQ_CONF_ENV_FILE` environment variable.

``rabbitmq-env.conf`` uses the standard environment variable names
but without the `RABBITMQ_` prefix. For example, the
`RABBITMQ_CONFIG_FILE` variable appears below as `CONFIG_FILE` and
`RABBITMQ_NODENAME` becomes `NODENAME`:

```bash
# Example rabbitmq-env.conf file entries. Note that the variables
# do not have the RABBITMQ_ prefix.
#
# Overrides node name
NODENAME=bunny@myhost

# Specifies new style config file location
CONFIG_FILE=/etc/rabbitmq/rabbitmq.conf

# Specifies advanced config file location
ADVANCED_CONFIG_FILE=/etc/rabbitmq/advanced.config
```

See the [rabbitmq-env.conf man page](./man/rabbitmq-env.conf.5) for details.

### Windows {#rabbitmq-env-file-windows}

The easiest option to customise names, ports or locations is
to configure environment variables in the Windows dialogue:
Start&#xA0;>&#xA0;Settings&#xA0;>&#xA0;Control&#xA0;Panel&#xA0;>&#xA0;System&#xA0;>&#xA0;Advanced&#xA0;>&#xA0;Environment&#xA0;Variables.
Then create or edit the system variable name and value.

Alternatively it is possible to use a file named `rabbitmq-env-conf.bat`
to define environment variables that will be used by the broker.
Its [location](#config-location) is configurable
using the `RABBITMQ_CONF_ENV_FILE` environment variable.

Windows service users will need to **re-install the service** if configuration file location
or any values in ``rabbitmq-env-conf.bat` changed. Environment variables used by
the service would not be updated otherwise.

This can be done using the installer or on the command line
with administrator permissions:

 * Start an [administrative command prompt](https://technet.microsoft.com/en-us/library/cc947813%28v=ws.10%29.aspx)
 * cd into the sbin folder under the RabbitMQ server installation directory (such as `C:\Program Files (x86)\RabbitMQ Server\rabbitmq_server-{version}\sbin`)
 * Run `rabbitmq-service.bat stop` to stop the service
 * Run `rabbitmq-service.bat remove` to remove the Windows service (this will *not* remove RabbitMQ or its data directory)
 * Set environment variables via command line, i.e. run commands like the following:
   ```PowerShell
   set RABBITMQ_BASE=C:\Data\RabbitMQ
   ```
 * Run `rabbitmq-service.bat install`
 * Run `rabbitmq-service.bat start`

This will restart the node in a way that makes the environment variable and
`rabbitmq-env-conf.bat` changes to be observable to it.


## Environment Variables Used by RabbitMQ {#supported-environment-variables}

All environment variables used by RabbitMQ use the
prefix `RABBITMQ_` (except when defined in [rabbitmq-env.conf](#environment-env-file-unix) or
[rabbitmq-env-conf.bat](#rabbitmq-env-file-windows)).

Environment variables set in the shell environment take
priority over those set
in [rabbitmq-env.conf](#environment-env-file-unix) or
[rabbitmq-env-conf.bat](#rabbitmq-env-file-windows), which in turn override
RabbitMQ built-in defaults.

The table below describes key environment variables that can be used to configure RabbitMQ.
More variables are covered in the [File and Directory Locations guide](./relocate).

<table class="name-description">
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>

  <tr>
    <td>RABBITMQ_NODE_IP_ADDRESS</td>
    <td>
      Change this if you only want to bind to one network interface.
      Binding to two or more interfaces can be set up in the configuration file.

      <p>
        <strong>Default</strong>: an empty string, meaning "bind to all network interfaces".
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_NODE_PORT</td>
    <td>
      See <a href="./networking">Networking guide</a> for more information on ports used by various
      parts of RabbitMQ.

      <p>
        <strong>Default</strong>: 5672.
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_DIST_PORT</td>
    <td>
      Port used for inter-node and CLI tool communication. Ignored if node config
      file sets `kernel.inet_dist_listen_min` or
      `kernel.inet_dist_listen_max` keys.
      See <a href="./networking">Networking</a> for details, and
      <a href="./windows-configuration">Windows Configuration</a> for Windows-specific details.

      <p>
        <strong>Default</strong>: `RABBITMQ_NODE_PORT + 20000`
      </p>
    </td>
  </tr>

  <tr>
    <td>ERL_MAX_PORTS</td>
    <td>
      This limit corresponds to the [maximum open file handle limit](./networking#open-file-handle-limit) in the kernel.
      When the latter is set to a value higher than 65536, `ERL_MAX_PORT` must be adjusted accordingly.

      <p>
        <strong>Default</strong>: 65536
      </p>
    </td>
  </tr>

  <tr>
    <td>ERL_EPMD_ADDRESS</td>
    <td>
      Interface(s) used by <a href="./networking#epmd">epmd</a>, a component in inter-node and CLI tool communication.

      <p>
        <strong>Default</strong>: all available interfaces, both IPv6 and IPv4.
      </p>
    </td>
  </tr>

  <tr>
    <td>ERL_EPMD_PORT</td>
    <td>
      Port used by <a href="./networking#epmd">epmd</a>, a component in inter-node and CLI tool communication.

      <p>
        <strong>Default</strong>: `4369`
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_DISTRIBUTION_BUFFER_SIZE</td>
    <td>
      <a href="https://erlang.org/doc/man/erl.html#+zdbbl">Outgoing data buffer size limit</a>
      to use for inter-node communication connections, in kilobytes. Values lower than
      64 MB are not recommended.

      <p>
        <strong>Default</strong>: 128000
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_NODENAME</td>
    <td>
      The node name should be unique per Erlang-node-and-machine combination.
      To run multiple nodes, see the <a href="./clustering">clustering guide</a>.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>
            **Unix*:**
            `rabbit@$HOSTNAME`
          </li>
          <li>
            **Windows:**
            `rabbit@%COMPUTERNAME%`
          </li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONFIG_FILE</td>
    <td>
      Main RabbitMQ config file path, for example,
      `/etc/rabbitmq/rabbitmq.conf` or `/data/configuration/rabbitmq.conf` for new style configuration format files.
      If classic config format it used, the extension must be `.config`

      <p>
        <strong>Default</strong>:

        <ul>
          <li>
          **Generic UNIX**: `$RABBITMQ_HOME/etc/rabbitmq/rabbitmq.conf`
          </li>
          <li>**Debian**: `/etc/rabbitmq/rabbitmq.conf`</li>
          <li>**RPM**: `/etc/rabbitmq/rabbitmq.conf`</li>
          <li>
            **MacOS(Homebrew)**: `${install_prefix}/etc/rabbitmq/rabbitmq.conf`,
            the Homebrew prefix is usually `/usr/local` or `/opt/homebrew`
          </li>
          <li>**Windows**: `%APPDATA%\RabbitMQ\rabbitmq.conf`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONFIG_FILES</td>
    <td>
      Path to a directory of RabbitMQ configuration files in the new-style (.conf) format.
      The files will be loaded in alphabetical order. Prefixing each files with a number
      is a common practice.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>
          **Generic UNIX**: `$RABBITMQ_HOME/etc/rabbitmq/conf.d`
          </li>
          <li>**Debian**: `/etc/rabbitmq/conf.d`</li>
          <li>**RPM**: `/etc/rabbitmq/conf.d`</li>
          <li>
            **MacOS(Homebrew)**: `${install_prefix}/etc/rabbitmq/conf.d`,
            the Homebrew prefix is usually `/usr/local` or `/opt/homebrew`
          </li>
          <li>**Windows**: `%APPDATA%\RabbitMQ\conf.d`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_ADVANCED_CONFIG_FILE</td>
    <td>
      "Advanced" (Erlang term-based) RabbitMQ config file path with a `.config` file extension.
      For example, `/data/rabbitmq/advanced.config`.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>
            **Generic UNIX**: `$RABBITMQ_HOME/etc/rabbitmq/advanced.config`
          </li>
          <li>**Debian**: `/etc/rabbitmq/advanced.config`</li>
          <li>**RPM**: `/etc/rabbitmq/advanced.config`</li>
          <li>
            **MacOS (Homebrew)**: `${install_prefix}/etc/rabbitmq/advanced.config`,
            the Homebrew prefix is usually `/usr/local` or `/opt/homebrew`
          </li>
          <li>**Windows**: `%APPDATA%\RabbitMQ\advanced.config`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONF_ENV_FILE</td>
    <td>
      Location of the file that contains environment variable definitions (without the `RABBITMQ_`
      prefix). Note that the file name on Windows is different from other operating systems.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>**Generic UNIX package**: `$RABBITMQ_HOME/etc/rabbitmq/rabbitmq-env.conf`</li>
          <li>**Ubuntu and Debian**: `/etc/rabbitmq/rabbitmq-env.conf`</li>
          <li>**RPM**: `/etc/rabbitmq/rabbitmq-env.conf`</li>
          <li>
            **MacOS (Homebrew)**: `${install_prefix}/etc/rabbitmq/rabbitmq-env.conf`,
            the Homebrew prefix is usually `/usr/local` or `/opt/homebrew`
          </li>
          <li>**Windows**: `%APPDATA%\RabbitMQ\rabbitmq-env-conf.bat`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_LOG_BASE</td>
    <td>
      Can be used to override log files directory location.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>**Generic UNIX package**: `$RABBITMQ_HOME/var/log/rabbitmq`</li>
          <li>**Ubuntu and Debian** packages: `/var/log/rabbitmq`</li>
          <li>**RPM**: `/var/log/rabbitmq`</li>
          <li>
            **MacOS (Homebrew)**: `${install_prefix}/var/log/rabbitmq`,
            the Homebrew prefix is usually `/usr/local` or `/opt/homebrew`
          </li>
          <li>**Windows**: `%APPDATA%\RabbitMQ\log`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_MNESIA_BASE</td>
    <td>
      This base directory contains sub-directories for the RabbitMQ
      server's node database, message store and cluster state files, one for each node,
      unless **RABBITMQ_MNESIA_DIR** is set explicitly.
      It is important that effective RabbitMQ user has sufficient permissions
      to read, write and create files and subdirectories in this directory
      at any time. This variable is typically not overridden.
      Usually `RABBITMQ_MNESIA_DIR` is overridden instead.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>**Generic UNIX package**: `$RABBITMQ_HOME/var/lib/rabbitmq/mnesia`</li>
          <li>**Ubuntu and Debian** packages: `/var/lib/rabbitmq/mnesia/`</li>
          <li>**RPM**: `/var/lib/rabbitmq/plugins`</li>
          <li>
            **MacOS (Homebrew)**: `${install_prefix}/var/lib/rabbitmq/mnesia`,
            the Homebrew prefix is usually `/usr/local` or `/opt/homebrew`
          </li>
          <li>**Windows**: `%APPDATA%\RabbitMQ`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_MNESIA_DIR</td>
    <td>
      The directory where this RabbitMQ node's data is stored. This includes
      a schema database, message stores, cluster member information and other
      persistent node state.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>**Generic UNIX package**: `$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME`</li>
          <li>**Ubuntu and Debian** packages: `$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME`</li>
          <li>**RPM**: `$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME`</li>
          <li>
            **MacOS (Homebrew)**: `${install_prefix}/var/lib/rabbitmq/mnesia/$RABBITMQ_NODENAME`,
            the Homebrew prefix is usually `/usr/local` or `/opt/homebrew`
          </li>
          <li>**Windows**: `%APPDATA%\RabbitMQ\$RABBITMQ_NODENAME`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_DIR</td>
    <td>
      The list of directories where <a
      href="./plugins">plugin</a> archive files are located and extracted
      from. This is `PATH`-like variable, where
      different paths are separated by an OS-specific separator
      (`:` for Unix, `;` for Windows).
      Plugins can be <a href="./plugins">installed</a> to any of the directories listed here.
      Must not contain any characters mentioned in the <a href="#directory-and-path-restrictions">path restriction section</a>.
      See <a href="./cli#rabbitmq-plugins">CLI tools guide</a> to learn about the effects of changing
      this variable on `rabbitmq-plugins`.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>**Generic UNIX package**: `$RABBITMQ_HOME/plugins`</li>
          <li>**Ubuntu and Debian** packages: `/var/lib/rabbitmq/plugins`</li>
          <li>**RPM**: `/var/lib/rabbitmq/plugins`</li>
          <li>
            **MacOS (Homebrew)**: `${install_prefix}/Cellar/rabbitmq/${version}/plugins`,
            the Homebrew prefix is usually `/usr/local` or `/opt/homebrew`
          </li>
          <li>**Windows**: `%RABBITMQ_HOME%\plugins`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_EXPAND_DIR</td>
    <td>
      The directory the node expand (unpack) <a href="./plugins">plugins</a> to and use it as a code path location.
      Must not contain any characters mentioned in the <a href="#directory-and-path-restrictions">path restriction section</a>.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>**Generic UNIX package**: `$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME-plugins-expand`</li>
          <li>**Ubuntu and Debian** packages: `$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME-plugins-expand`</li>
          <li>**RPM**: `$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME-plugins-expand`</li>
          <li>
            **MacOS (Homebrew)**:
              `${install_prefix}/var/lib/rabbitmq/mnesia/$RABBITMQ_NODENAME-plugins-expand`
          </li>
          <li>**Windows**: `%APPDATA%\RabbitMQ\$RABBITMQ_NODENAME-plugins-expand`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_USE_LONGNAME</td>
    <td>
      When set to `true` this will cause RabbitMQ
      to use fully qualified names to identify nodes. This
      may prove useful in environments that use fully-qualified domain names or use IP addresses
      as hostnames or part of node names.
      Note that it is not possible to switch a node from short name to long name without
      resetting it.

      <p>
        <strong>Default</strong>: `false`
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVICENAME</td>
    <td>
      The name of the installed Windows service. This will appear in
      `services.msc`.

      <p>
        <strong>Default</strong>: RabbitMQ.
      </p>
  </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONSOLE_LOG</td>
    <td>
      Set this variable to `new` or `reuse`
      to redirect console output from the server to a file named
      `%RABBITMQ_SERVICENAME%` in the
      default `RABBITMQ_BASE` directory.
      <ul>
        <li>If not set, console output from the server will be discarded (default).</li>
        <li>`new`: a new file will be created each time the service starts.</li>
        <li>`reuse`: the file will be overwritten each time the service starts.</li>
      </ul>

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_CODE_PATH</td>
    <td>
      <p>
        Extra code path (a directory) to be specified when starting the runtime.
        Will be passed to the `erl` command when a node is started.
      </p>

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CTL_ERL_ARGS</td>
    <td>
      Parameters for the `erl` command used when invoking
      `rabbitmqctl`. This could be set to specify a range
      of ports to use for Erlang distribution:<br/>
      `-kernel inet_dist_listen_min 35672`<br/>
      `-kernel inet_dist_listen_max 35680`

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_ERL_ARGS</td>
    <td>
      Standard parameters for the `erl` command used when
      invoking the RabbitMQ Server. This should be overridden for
      debugging purposes only.

      :::danger

      Setting this variable will replace the defaults provided by RabbitMQ.

      :::

      :::tip

      Consider using `RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS` to add or override individual settings instead.

      :::

      <p>
        <strong>Default</strong>:

        <ul>
          <li>
          **UNIX**: `+P 1048576 +t 5000000 +stbt db +zdbbl 128000`
          </li>
          <li>**Windows**: (none)</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS</td>
    <td>
      Additional parameters for the `erl` command used when
      invoking the RabbitMQ Server. The value of this variable
      is appended to the default list of arguments (`RABBITMQ_SERVER_ERL_ARGS`).

      <p>
        <strong>Default</strong>:

        <ul>
          <li>**Unix**: (none) </li>
          <li>**Windows**: (none)</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_START_ARGS</td>
    <td>
      Extra parameters for the `erl` command used when
      invoking the RabbitMQ Server. This will not override
      `RABBITMQ_SERVER_ERL_ARGS`.

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_DEFAULT_USER</td>
    <td>
      This environment variable is <strong>only meant to be used in development and CI environments</strong>.
      This has the same meaning as `default_user` in `rabbitmq.conf` but higher
      priority. This option may be more convenient in cases where providing a config file is impossible,
      and environment variables is the only way to <a href="./access-control#seeding">seed a user</a>.

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_DEFAULT_PASS</td>
    <td>
      This environment variable is <strong>only meant to be used in development and CI environments</strong>.
      This has the same meaning as `default_pass` in `rabbitmq.conf` but higher
      priority. This option may be more convenient in cases where providing a config file is impossible,
      and environment variables is the only way to <a href="./access-control#seeding">seed a user</a>.

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_DEFAULT_VHOST</td>
    <td>
      This environment variable is <strong>only meant to be used in development and CI environments</strong>.
      This has the same meaning as `default_vhost` in `rabbitmq.conf` but higher
      priority. This option may be more convenient in cases where providing a config file is impossible,
      and environment variables is the only way to <a href="./access-control#seeding">seed users</a> and virtual hosts.

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>
</table>

Besides the variables listed above, there are several environment variables which
tell RabbitMQ [where to locate its database, log files, plugins, configuration and so on](./relocate).

Finally, some environment variables are operating system-specific.

<table class="name-description">
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>

  <tr>
    <td>HOSTNAME</td>
    <td>
      The name of the current machine.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>Unix, Linux: `env hostname`</li>
          <li>MacOS: `env hostname -s`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>COMPUTERNAME</td>
    <td>
      The name of the current machine.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>Windows: `localhost`</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>ERLANG_SERVICE_MANAGER_PATH</td>
    <td>
      This path is the location of `erlsrv.exe`,
      the Erlang service wrapper script.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>Windows Service: `%ERLANG_HOME%\erts-<var>x.x.x</var>\bin`</li>
        </ul>
      </p>
    </td>
  </tr>
</table>


## Operating System Kernel Limits {#kernel-limits}

Most operating systems enforce limits on kernel resources: virtual memory, stack size, open file handles
and more. To Linux users these limits can be known as "ulimit limits".

RabbitMQ nodes are most commonly affected by the maximum [open file handle limit](./networking#open-file-handle-limit).
Default limit value on most Linux distributions is usually 1024, which is very low for a messaging broker (or generally, any data service).
See [Deployment Guidelines](./production-checklist) for recommended values.

### Modifying Limits

#### With systemd (Modern Linux Distributions)

On distributions that use systemd, the OS limits are controlled via
a configuration file at `/etc/systemd/system/rabbitmq-server.service.d/limits.conf`.
For example, to set the max open file handle limit (`nofile`) to `64000`:

```
[Service]
LimitNOFILE=64000
```

See [systemd documentation](https://www.freedesktop.org/software/systemd/man/systemd.exec.html) to learn about
the supported limits and other directives.

#### With Docker

To configure kernel limits for Docker containers, use the `"default-ulimits"` key in
[Docker daemon configuration file](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file).
The file has to be installed on Docker hosts at `/etc/docker/daemon.json`:

```json
{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
```

#### Without systemd (Older Linux Distributions)

The most straightforward way to adjust the per-user limit for
RabbitMQ on distributions that do not use systemd is to edit the `/etc/default/rabbitmq-server`
(provided by the RabbitMQ Debian package) or [rabbitmq-env.conf](#config-file)
to invoke `ulimit` before the service is started.

```
ulimit -S -n 4096
```

This _soft_ limit cannot go higher than the _hard_ limit (which defaults to 4096 in many distributions).
[The hard limit can be increased](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md) via
`/etc/security/limits.conf`. This also requires enabling the [pam_limits.so](http://askubuntu.com/a/34559) module
and re-login or reboot.

Note that limits cannot be changed for running OS processes.
