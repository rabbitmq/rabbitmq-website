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

# Configuration

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ comes with default built-in settings. Those can be entirely
sufficient in some environment (e.g. development and QA).
For all other cases, as well as [production deployment tuning](/production-checklist.html),
there is a way to configure many things in the broker as well as [plugins](/plugins.html).

This guide covers a number of topics related to configuration:

 * [Different ways](#means-of-configuration) in which various settings of the server and plugins are configured
 * [Configuration file(s)](#configuration-files): primary [rabbitmq.conf](#config-file) and optional [advanced.config](#advanced-config-file)
 * Troubleshooting: how to [verify config file location](#verify-configuration-effective-configuration) and [effective configuration](#verify-configuration-effective-configuration)
 * [Environment variables](#customise-environment)
 * [Operating system (kernel) limits](#kernel-limits)
 * Available [core server settings](#config-items)
 * Available [environment variables](#supported-environment-variables)
 * How to [encrypt sensitive configuration values](#configuration-encryption)

and more.

Since configuration affects many areas of the system, including plugins, individual [documentation guides](/documentation.html)
dive deeper into what can be configured. [Runtime Tuning](/runtime.html) is a companion to this guide that focuses
on the configurable parameters in the runtime. [Production Checklist](/production-checklist.html) is a related guide
that outlines what settings will likely need tuning in most production environments.


## <a id="means-of-configuration" class="anchor" href="#means-of-configuration">Means of Configuration</a>

A RabbitMQ node can be configured using a number of mechanisms responsible
for different areas:

<table>
  <thead>
    <td>Mechanism</td>
    <td>Description</td>
  </thead>
  <tr>
    <td>
      <a href="#configuration-files">Configuration File(s)</a>
    </td>
    <td>
      defines server and plugin settings for

      <ul>
        <li><a href="/networking.html">TCP listeners and other networking-related settings</a></li>
        <li><a href="/ssl.html">TLS</a></li>
        <li><a href="/alarms.html">resource constraints (alarms)</a></li>
        <li><a href="/access-control.html">authentication and authorisation backends</a></li>
        <li><a href="/persistence-conf.html">message store settings</a></li>
      </ul>

      and so on.
    </td>
  </tr>
  <tr>
    <td>
      <a href="#customise-environment">Environment Variables</a>
    </td>
    <td>
      define <a href="/cli.html#node-names">node name</a>, file and directory locations, runtime flags taken from the shell, or
      set in the environment configuration file, <code>rabbitmq-env.conf</code> (Linux, MacOS, BSD)
      and <code>rabbitmq-env-conf.bat</code> (Windows)
    </td>
  </tr>

  <tr>
    <td>
      <a href="/cli.html">rabbitmqctl</a>
    </td>
    <td>
      When <a href="access-control.html">internal authentication/authorisation backend</a> is used,
      <code>rabbitmqctl</code> is the tool that manages virtual hosts, users and permissions.
    </td>
  </tr>

  <tr>
    <td>
      <a href="/cli.html">rabbitmq-plugins</a>
    </td>
    <td>
      <code>rabbitmq-plugins</code> is the tool that manages enabled plugins.
    </td>
  </tr>

  <tr>
    <td>
      <a href="parameters.html">Parameters and Policies</a>
    </td>
    <td>
      defines cluster-wide settings which can change at run time
      as well as settings that are convenient to configure for groups of queues (exchanges, etc)
      such as including optional queue arguments.
    </td>
  </tr>

  <tr>
    <td>
      <a href="runtime.html">Runtime (Erlang VM) Flags</a>
    </td>
    <td>
      Control lower-level aspects of the system: memory allocation settings, inter-node communication
      buffer size, runtime scheduler settings and more.
    </td>
  </tr>

  <tr>
    <td>
      <a href="#kernel-limits">Operating System Kernel Limits</a>
    </td>
    <td>
      Control process limits enforced by the kernel: <a href="/networking.html#open-file-handle-limit">max open file handle limit</a>,
      max number of processes and kernel threads, max resident set size and so on.
    </td>
  </tr>
</table>

Most settings are configured using the first two methods. This guide,
therefore, focuses on them.

## <a id="configuration-files" class="anchor" href="#configuration-files">Configuration File(s)</a>

### <a id="config-file-intro" class="anchor" href="#config-file-intro">Introduction</a>

While some settings in RabbitMQ can be tuned using environment variables,
most are configured using a [configuration file](#config-file), usually named `rabbitmq.conf`.
This includes configuration for the core server as well as plugins.
The sections below cover the syntax, [location](#config-file-location),
how to configure things to which the format isn't well-suited, where to find examples, and so on.

Prior to RabbitMQ 3.7.0, RabbitMQ config file was named
`rabbitmq.config` and used an [Erlang term configuration format](http://www.erlang.org/doc/man/config.html).
That format is [still supported](#config-file-formats) for backwards compatibility.
Those running 3.7.0 or later versions are **highly recommended** to use the [new style format](#config-file).

### <a id="config-file-location" class="anchor" href="#config-file-location">Config File Locations</a>

[Default config file locations](/configure.html#config-location)
vary between operating systems and [package types](/download.html).

This topic is covered in more detail in the rest of this guide.

When in doubt about RabbitMQ config file location for your OS and installation method,
consult the log file and/or management UI as explained in the following sections.

### <a id="verify-configuration-config-file-location" class="anchor" href="#verify-configuration-config-file-location">Verify Configuration: How to Find Config File Location</a>

The active configuration file can be verified by inspecting the
RabbitMQ log file. It will show up in the [log file](logging.html)
at the top, along with the other broker boot log entries. For example:

<pre class="lang-ini">
node           : rabbit@example
home dir       : /var/lib/rabbitmq
config file(s) : /etc/rabbitmq/advanced.config
               : /etc/rabbitmq/rabbitmq.conf
</pre>

If the configuration file cannot be found or read by RabbitMQ, the log entry
will say so:

<pre class="lang-ini">
node           : rabbit@example
home dir       : /var/lib/rabbitmq
config file(s) : /var/lib/rabbitmq/hare.conf (not found)
</pre>

Alternatively config file location can be found in the [management UI](/management.html),
together with other details about nodes.

When troubleshooting configuration settings, it is very useful to verify that the config file
path is correct, exists and can be loaded (e.g. the file is readable) before checking effective
node configuration.

### <a id="verify-configuration-effective-configuration" class="anchor" href="#verify-configuration-effective-configuration">Verify Configuration: How to Check Effective Configuration</a>

It is possible to print effective configuration (user provided values merged into defaults) using
the [rabbitmqctl environment](/rabbitmqctl.8.html) command. It will print
applied configuration for every application (RabbitMQ, plugins, libraries) running on the node.

Effective configuration should be verified together with config file location (see above).
It is a useful step in troubleshooting a broad range of problems.

### <a id="config-file-formats" class="anchor" href="#config-file-formats">The New and Old Config File Formats</a>

Prior to RabbitMQ 3.7.0, RabbitMQ config file was named
`rabbitmq.config` and used an [Erlang term configuration format](http://www.erlang.org/doc/man/config.html).
That format is still supported for backwards compatibility.
Those running 3.7.0 or later are recommended to consider the new sysctl format.

The new format is easier to generate deployment automation tools.
Compare

<pre class="sourcecode">
ssl_options.cacertfile           = /path/to/ca_certificate.pem
ssl_options.certfile             = /path/to/server_certificate.pem
ssl_options.keyfile              = /path/to/server_key.pem
ssl_options.verify               = verify_peer
ssl_options.fail_if_no_peer_cert = true
</pre>

with

<pre class="sourcecode">
[
  {rabbit, [{ssl_options, [{cacertfile,           "/path/to/ca_certificate.pem"},
                           {certfile,             "/path/to/server_certificate.pem"},
                           {keyfile,              "/path/to/server_key.pem"},
                           {verify,               verify_peer},
                           {fail_if_no_peer_cert, true}]}]}
].
</pre>

While the new config format is more convenient for humans to edit
and machines to generate, it is also relatively limited compared
to the classic config format used prior to RabbitMQ 3.7.0. For
example, when configuring [LDAP support](/ldap.html),
it may be necessary to use deeply nested data structures to
express desired configuration. To accommodate this need,
RabbitMQ still supports the classic `rabbitmq.config`
config files as well as ability to use both formats at the same time
(`advanced.config`). This is covered in more detail in the following sections.

### <a id="config-file" class="anchor" href="#config-file">The rabbitmq.conf File</a>

The configuration file `rabbitmq.conf`
allows the RabbitMQ server and plugins to be configured.
Starting with RabbitMQ 3.7.0, the format is in the [sysctl format](https://github.com/basho/cuttlefish/wiki/Cuttlefish-for-Application-Users).

The syntax can be briefly explained in 3 lines:

 * One setting uses one line
 * Lines are structured `Key = Value`
 * Any line starting with a `#` character is a comment

A minimalistic example configuration file follows:

<pre class="lang-ini">
# this is a comment
listeners.tcp.default = 5673
</pre>

The same example in the <a href="#config-file-formats">classic config format</a>:

<pre class="lang-erlang">
[
  {rabbit, [
      {tcp_listeners, [5673]}
    ]
  }
].
</pre>

This example will alter the [port RabbitMQ listens on](/networking.html#ports) for
AMQP 0-9-1 and AMQP 1.0 client connections from 5672 to 5673.

The RabbitMQ server source repository contains [an example rabbitmq.conf file](https://github.com/rabbitmq/rabbitmq-server/blob/v3.7.x/docs/rabbitmq.conf.example)
named `rabbitmq.conf.example`. It contains examples of
most of the configuration items you might want to set (with some very obscure ones omitted), along with
documentation for those settings.

Documentation guides such as [Networking](/networking.html), [TLS](/ssl.html), or
[Access Control](/access-control.html) will often provide examples
in both formats.

Note that this configuration file is not to be confused with the environment variable
configuration files, [rabbitmq-env.conf](#environment-env-file-unix)
and [rabbitmq-env-conf.bat](#environment-env-file-windows).

To override the main RabbitMQ config file location, use the `RABBITMQ_CONFIG_FILE`
[environment variable](#customise-environment). Use `.conf` as file extension
for the new style config format.

### <a id="advanced-config-file" class="anchor" href="#advanced-config-file">The advanced.config File</a>

Some configuration settings are not possible or are difficult to configure
using the sysctl format. As such, it is possible to use an additional
config file in the Erlang term format (same as `rabbitmq.config`).
That file is commonly named `advanced.config`. It will be merged
with the configuration provided in `rabbitmq.conf`.

The RabbitMQ server source repository contains [an example advanced.config file](https://github.com/rabbitmq/rabbitmq-server/blob/master/docs/advanced.config.example)
named `advanced.config.example`. It focuses on the options that are typically set using the advanced config.

To override the advanced config file location, use the `RABBITMQ_ADVANCED_CONFIG_FILE`
environment variable.

### <a id="erlang-term-config-file" class="anchor" href="#erlang-term-config-file">The rabbitmq.config (Classic Format) File</a>

RabbitMQ 3.7.0 and later versions still support the classic configuration file format, known as
`rabbitmq.config`. The classic format is  **deprecated**. Please prefer the new style config format
accompanied `advanced.config` as needed.

To use a config file in the classic format, export `RABBITMQ_CONFIG_FILE` to point to the file with
a `.config` extension. The extension will indicate to RabbitMQ  that it should treat the file as one
in the classic config format.

The RabbitMQ server source repository contains [an example configuration file](https://github.com/rabbitmq/rabbitmq-server/blob/v3.7.x/docs/rabbitmq.config.example) named
`rabbitmq.config.example`. It contains an example of most of the configuration items in the classic config format.

To override the main RabbitMQ config file location, use the `RABBITMQ_CONFIG_FILE`
[environment variable](#customise-environment). Use `.config` as file extension
for the classic config format.

The use of classic config format should only be limited to the [advanced.config file](#advanced-config-file) and settings
that cannot be configured using the [ini-style config file](#config-file).

### <a id="config-location" class="anchor" href="#config-location">Location of rabbitmq.conf and rabbitmq-env.conf</a>

The location of these files is distribution-specific. By default, they
are not created, but expect to be located in the following places on each platform:

 * Generic UNIX: `$RABBITMQ_HOME/etc/rabbitmq/`
 * Debian: `/etc/rabbitmq/`
 * RPM: `/etc/rabbitmq/`
 * Mac OS (Homebrew): `${install_prefix}/etc/rabbitmq/`, the Homebrew cellar prefix is usually `/usr/local`
 * Windows: `%APPDATA%\RabbitMQ\`

If `rabbitmq-env.conf` doesn't exist, it can be created manually
in the location, specified by the `RABBITMQ_CONF_ENV_FILE` variable.
On Windows systems, it is named `rabbitmq-env-conf.bat`.

If `rabbitmq.conf` doesn't exist, it can be created manually.
Set the <b>RABBITMQ_CONFIG_FILE</b> environment variable if you change the location.
RabbitMQ automatically appends the `.conf` extension to the
value of this variable.

Restart the server after changes. Windows service users will need to re-install the
service after adding or removing a configuration file.

### <a id="example-config" class="anchor" href="#example-config">Example rabbitmq.conf File</a>

The RabbitMQ server source repository contains
examples for the configuration files:

 * [rabbitmq.conf.example](https://github.com/rabbitmq/rabbitmq-server/blob/master/docs/rabbitmq.conf.example)
 * [advanced.config.example](https://github.com/rabbitmq/rabbitmq-server/blob/master/docs/advanced.config.example)

These files contain examples of most of the
configuration items you might want to set (with some very
obscure ones omitted) along with documentation for those
settings. All configuration items are commented out in the
example, so you can uncomment what you need. Note that the
example files are meant to be used as, well, examples, and
should not be treated as a general recommendation.

In most distributions the example file is placed into the
same location as the real file should be placed (see
above). On Debian and RPM distributions
policy forbids doing so; instead find the file
under `/usr/share/doc/rabbitmq-server/`
or `/usr/share/doc/rabbitmq-server-&version-server;/`,
respectively.

### <a id="config-items" class="anchor" href="#config-items">Core Server Variables Configurable in rabbitmq.conf</a>

These variables are the most common. The list is not complete, as
some settings are quite obscure.

<table class="name-description">
  <tr>
    <th>Key</th>
    <th>Documentation</th>
  </tr>
  <tr>
    <td><code>listeners</code></td>
    <td>
      Ports or hostname/pair on which to listen for "plain" AMQP 0-9-1 and AMQP 1.0 connections
      (without TLS). See the <a href="/networking.html">Networking guide</a> for more
      details and examples.

      <p>
        Default:
<pre class="lang-ini">
listeners.tcp.default = 5672
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>num_acceptors.tcp</code></td>
    <td>
      Number of Erlang processes that will accept connections for the TCP
      listeners.
      <p>
        Default:
<pre class="lang-ini">
num_acceptors.tcp = 10
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>handshake_timeout</code></td>
    <td>
      Maximum time for AMQP 0-9-1 handshake (after socket connection
      and TLS handshake), in milliseconds.
      <p>
        Default:
<pre class="lang-ini">
handshake_timeout = 10000
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>listeners.ssl</code></td>
    <td>
      Ports or hostname/pair on which to listen for TLS-enabled AMQP 0-9-1 and AMQP 1.0 connections.
      See the <a href="/ssl.html">TLS guide</a> for more
      details and examples.
      <p>Default: <code>none</code> (not set)</p>
    </td>
  </tr>
  <tr>
    <td><code>num_acceptors.ssl</code></td>
    <td>
      Number of Erlang processes that will accept TLS connections from clients.
      <p>
        Default:
<pre class="lang-ini">
num_acceptors.ssl = 10
</pre>
      </p>
    </td>
  </tr>

  <tr>
    <td><code>ssl_options</code></td>
    <td>
      TLS configuration. See the <a href="ssl.html#enabling-ssl">TLS support
      documentation</a>.
      <p>
        Default:
<pre class="lang-ini">
ssl_options = none
</pre>
        </p>
    </td>
  </tr>
  <tr>
    <td><code>ssl_handshake_timeout</code></td>
    <td>
      TLS handshake timeout, in milliseconds.
      <p>
        Default:
<pre class="lang-ini">
ssl_handshake_timeout = 5000
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>vm_memory_high_watermark</code></td>
    <td>
      Memory threshold at which the flow control is
      triggered. Can be absolute or relative to the amount of RAM available
      to the OS:

<pre class="lang-ini">
vm_memory_high_watermark.relative = 0.6
</pre>
<pre class="lang-ini">
vm_memory_high_watermark.absolute = 2GB
</pre>

      See the <a href="memory.html">memory-based flow
      control</a> and <a href="alarms.html">alarms</a>
      documentation.

      <p>
        Default:

<pre class="lang-ini">
vm_memory_high_watermark.relative = 0.4
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>vm_memory_calculation_strategy</code></td>
    <td>
      Strategy for memory usage reporting. Can be one of the following:
      <ul class="plain">
        <li><code>allocated</code>: uses Erlang memory allocator statistics</li>
        <li><code>rss</code>: uses operating system RSS memory reporting. This uses OS-specific means and may start short lived child processes.</li>
        <li><code>legacy</code>: uses legacy memory reporting (how much memory is considered to be used by the runtime). This strategy is fairly inaccurate.</li>
        <li><code>erlang</code>: same as <code>legacy</code>, preserved for backwards compatibility</li>
      </ul>
      <p>
        Default:
<pre class="lang-ini">
vm_memory_calculation_strategy = allocated
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>vm_memory_high_watermark_paging_ratio</code></td>
    <td>
      Fraction of the high watermark limit at which queues
      start to page messages out to disc to free up
      memory. See the <a href="memory.html">memory-based flow control</a> documentation.
      <p>
        Default:
<pre class="lang-ini">
vm_memory_high_watermark_paging_ratio = 0.5
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>total_memory_available_override_value</code></td>
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
    <td><code>disk_free_limit</code></td>
    <td>
      Disk free space limit of the partition on which RabbitMQ
      is storing data. When available disk space falls below
      this limit, flow control is triggered. The value can be
      set relative to the total amount of RAM or as an absolute value
      in bytes or, alternatively, in
      information units (e.g `50MB` or `5GB`):

<pre class="lang-ini">
disk_free_limit.relative = 3.0</pre>
<pre class="lang-ini">
disk_free_limit.absolute = 2GB</pre>

      By default free disk space must exceed 50MB. See the <a
      href="disk-alarms.html">Disk Alarms</a> documentation.
      <p>
        Default:
<pre class="lang-ini">
disk_free_limit.absolute = 50MB
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>log.file.level</code></td>
    <td>
      Controls the granularity of logging. The value is a list
      of log event category and log level pairs.

      <p>
				The level can be one of <code>error</code> (only errors are
				logged), <code>warning</code> (only errors and warning are
				logged), <code>info</code> (errors, warnings and informational
				messages are logged), or <code>debug</code> (errors, warnings,
        informational messages and debugging m  essages are
        logged).
      </p>

      <p>
        Default:
<pre class="lang-ini">
log.file.level = info
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>channel_max</code></td>
    <td>
      Maximum permissible number of channels to
      negotiate with clients, not including a special channel number 0 used in the protocol.
      Setting to 0 means "unlimited", a dangerous value since applications sometimes have channel leaks.
      Using more channels increases memory footprint of the broker.
      <p>
        Default:
<pre class="lang-ini">
channel_max = 2047
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>channel_operation_timeout</code></td>
    <td>
      Channel operation timeout in milliseconds (used internally, not directly
      exposed to clients due to messaging protocol differences and limitations).

      <p>
        Default:
<pre class="lang-ini">
channel_operation_timeout = 15000
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>heartbeat</code></td>
    <td>
      Value representing the heartbeat timeout suggested by the server during
      connection parameter negotiation.
      If set to 0 on both ends, heartbeats are disabled (this is not recommended).
      See the <a href="/heartbeats.html">Heartbeats guide</a> for details.

      <p>
        Default:
<pre class="lang-ini">
heartbeat = 60
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>default_vhost</code></td>
    <td>
      Virtual host to create when RabbitMQ creates a new
      database from scratch. The
      exchange `amq.rabbitmq.log` will exist in
      this virtual host.
      <p>
        Default:
<pre class="lang-ini">
default_vhost = /
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>default_user</code></td>
    <td>
      User name to create when RabbitMQ creates a new database
      from scratch.
      <p>
        Default:
<pre class="lang-ini">
default_user = guest
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>default_pass</code></td>
    <td>
      Password for the default user.
      <p>
        Default:
<pre class="lang-ini">
default_pass = guest
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>default_user_tags</code></td>
    <td>
      Tags for the default user.
      <p>
        Default:
<pre class="lang-ini">
default_user_tags.administrator = true
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>default_permissions</code></td>
    <td>
      <a href="access-control.html">Permissions</a>
      to assign to the default user when creating it.
      <p>
        Default:

<pre class="lang-ini">
default_permissions.configure = .*
default_permissions.read = .*
default_permissions.write = .*
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>loopback_users</code></td>
    <td>
      List of users which are only permitted to connect to the
      broker via a loopback interface (i.e. `localhost`).

      <p>
        To allow the default `guest`
        user to connect remotely (a security practice <a href="/production-checklist.html">unsuitable for production use</a>),
        set this to `none`:

<pre class="lang-ini">
# awful security practice,
# consider creating a new
# user with secure generated credentials!
loopback_users = none
</pre>
      </p>
      <p>
        To restrict another user to localhost-only connections,
        do it like so (`monitoring` is the name of the user):
<pre class="lang-ini">
loopback_users.monitoring = true
</pre>
      </p>
      <p>
        Default:
<pre class="lang-ini">
# guest uses well known
# credentials and can only
# log in from localhost
# by default
loopback_users.guest = true
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>cluster_formation.classic_config.nodes</code></td>
    <td>
      Classic <a href="/cluster-formation.html">peer discovery</a> backend's list of nodes to contact.

      For example, to cluster with nodes `rabbit@hostname1` and `rabbit@hostname2` on first boot:

<pre class="lang-ini">
cluster_formation.classic_config.nodes.1 = rabbit@hostname1
cluster_formation.classic_config.nodes.2 = rabbit@hostname2
</pre>
      <p>Default: `none` (not set)</p>
    </td>
  </tr>
  <tr>
    <td><code>collect_statistics</code></td>
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
<pre class="lang-ini">
collect_statistics = none
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>collect_statistics_interval</code></td>
    <td>
      Statistics collection interval in
      milliseconds. Primarily relevant for
      the <a href="management.html#statistics-interval">management
      plugin</a>.
      <p>
        Default:
<pre class="lang-ini">
collect_statistics_interval = 5000
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>management_db_cache_multiplier</code></td>
    <td>
      Affects the amount of time the <a href="management.html#statistics-interval">management plugin</a>
      will cache expensive management queries such as
      queue listings. The cache will multiply the elapsed time of
      the last query by this value and cache the result for
      this amount of time.
      <p>
        Default:
<pre class="lang-ini">
management_db_cache_multiplier = 5
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>auth_mechanisms</code></td>
    <td>
      <a href="authentication.html">SASL authentication
      mechanisms</a> to offer to clients.
      <p>
        Default:
<pre class="lang-ini">
auth_mechanisms.1 = PLAIN
auth_mechanisms.2 = AMQPLAIN
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>auth_backends</code></td>
    <td>
      <p>
        List of <a href="/access-control.html">authentication and authorisation backends</a> to
        use. See the <a href="/access-control.html">access control guide</a> for details and examples.
      </p>
      <p>
        Other databases
        than `rabbit_auth_backend_internal` are
        available through <a href="plugins.html">plugins</a>.
      </p>
      <p>Default: <pre class="lang-ini">auth_backends.1 = internal</pre></p>
    </td>
  </tr>
  <tr>
    <td><code>reverse_dns_lookups</code></td>
    <td>
      Set to `true` to have RabbitMQ perform a
      reverse DNS lookup on client connections, and present
      that information through `rabbitmqctl` and
      the management plugin.
      <p>Default: <pre class="lang-ini">reverse_dns_lookups = false</pre></p>
    </td>
  </tr>
  <tr>
    <td><code>delegate_count</code></td>
    <td>
      Number of delegate processes to use for intra-cluster
      communication. On a machine which has a very large
      number of cores and is also part of a cluster, you may
      wish to increase this value.

      <p>Default: <pre class="lang-ini">delegate_count = 16</pre></p>
    </td>
  </tr>

  <tr>
    <td><code>tcp_listen_options</code></td>
    <td>
      Default socket options. You probably don't want to
      change this.

      <p>
        Default:

<pre class="lang-ini">
tcp_listen_options.backlog = 128
tcp_listen_options.nodelay = true
tcp_listen_options.linger.on = true
tcp_listen_options.linger.timeout = 0
tcp_listen_options.exit_on_close = false
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>hipe_compile</code></td>
    <td>
      <p>
        <b>NOTE</b>: Do <i>not</i> use HiPE with Erlang version 22 or later
        (<a href="http://erlang.org/doc/apps/hipe/notes.html#improvements-and-new-features">link</a>).
        In addition, HiPE is not supported on Windows.
      </p>
      <p>
        Set to `true` to precompile parts of RabbitMQ with HiPE, a just-in-time compiler for Erlang.
      </p>
      <p>
        Enabling HiPE can improve throughput by double digit % at the cost of
        a few minutes delay at startup. These
        figures are highly workload- and hardware-dependent.
      </p>
      <p>
        The startup penalty can be avoided via precompilation.
        See <a href="/rabbitmqctl.8.html#hipe_compile">rabbitmqctl hipe_compile</a>
        and `RABBITMQ_SERVER_CODE_PATH` environment variable documentation.
      </p>
      <p>
        <a href="/which-erlang.html">Erlang installations</a>
        must be compiled with HiPE support. If it is not, enabling this option will
        have no effect. Debian and Ubuntu provide both a HiPE-enabled
        base Erlang package (<code>erlang-base-hipe</code>) and a regular one (<code>erlang-base</code>).
      </p>
      <p>Default: <pre class="lang-ini">hipe_compile = false</pre></p>
    </td>
  </tr>
  <tr>
    <td><code>cluster_partition_handling</code></td>
    <td>
      How to handle network partitions. Available modes are:
      <ul>
        <li><code>ignore</code></li>
        <li><code>autoheal</code></li>
        <li><code>pause_minority</code></li>
        <li><code>pause_if_all_down</code></li>
      </ul>
      <code>pause_if_all_down</code> mode requires additional parameters:
      <ul>
        <li><code>nodes</code></li>
        <li><code>recover</code></li>
      </ul>
      See the
      <a href="partitions.html#automatic-handling">documentation
      on partitions</a> for more information.

      <p>Default: <pre class="lang-ini">cluster_partition_handling = ignore</pre></p>
    </td>
  </tr>
  <tr>
    <td><code>cluster_keepalive_interval</code></td>
    <td>
      How frequently nodes should send keepalive messages to
      other nodes (in milliseconds). Note that this is not the
      same thing as <a href="nettick.html"><code>net_ticktime</code></a>;
      missed keepalive messages will not cause nodes to be
      considered down.

      <p>
        Default:
<pre class="lang-ini">
cluster_keepalive_interval = 10000
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>queue_index_embed_msgs_below</code></td>
    <td>
      Size in bytes of message below which messages will
      be embedded directly in the queue index. You are advised
      to read the <a href="persistence-conf.html">persister
      tuning</a> documentation before changing this.
      <p>
        Default:
<pre class="lang-ini">
queue_index_embed_msgs_below = 4096
</pre>
      </p>
    </td>
  </tr>

  <tr>
    <td><code>mnesia_table_loading_retry_timeout</code></td>
    <td>
      Timeout used when waiting for Mnesia tables in a cluster to
      become available.
      <p>
        Default:
<pre class="lang-ini">
mnesia_table_loading_retry_timeout = 30000
</pre>
</p>
    </td>
  </tr>

  <tr>
    <td><code>mnesia_table_loading_retry_limit</code></td>
    <td>
      Retries when waiting for Mnesia tables in the cluster startup. Note that
      this setting is not applied to Mnesia upgrades or node deletions.
      <p>Default:
<pre class="lang-ini">
mnesia_table_loading_retry_limit = 10
</pre>
      </p>
    </td>
  </tr>

  <tr>
    <td><code>mirroring_sync_batch_size</code></td>
    <td>
      Batch size used to transfer messages to an unsynchronised replica (queue mirror).
      See <a href="/ha.html#batch-sync">documentation on eager batch synchronization</a>.
      <p>
        Default:
<pre class="lang-ini">
mirroring_sync_batch_size = 4096
</pre>
      </p>
    </td>
  </tr>

  <tr>
    <td><code>queue_master_locator</code></td>
    <td>
      Queue master location strategy. Available strategies are:
      <ul>
        <li><code>min-masters</code></li>
        <li><code>client-local</code></li>
        <li><code>random</code></li>
      </ul>
      See the
      <a href="/ha.html#queue-master-location">documentation
      on queue master location</a> for more information.
      <p>
        Default:
<pre class="lang-ini">
queue_master_locator = client-local
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>proxy_protocol</code></td>
    <td>
      If set to <code>true</code>, RabbitMQ will expect a <a
      href="http://www.haproxy.org/download/1.8/doc/proxy-protocol.txt">proxy
      protocol</a> header to be sent first when an AMQP
      connection is opened.  This implies to set up a proxy
      protocol-compliant reverse proxy (e.g. <a
      href="http://www.haproxy.org/download/1.8/doc/proxy-protocol.txt">HAproxy</a>
      or <a
      href="http://docs.aws.amazon.com/elasticloadbalancing/latest/classic/enable-proxy-protocol.html">AWS
      ELB</a>) in front of RabbitMQ.  Clients can't directly
      connect to RabbitMQ when proxy protocol is enabled, so
      all connections must go through the reverse proxy.

      <p>
        See <a href="networking.html#proxy-protocol">the
        networking guide</a> for more information.
      </p>

      <p>
        Default:
<pre class="lang-ini">
proxy_protocol = false
</pre>
      </p>
    </td>
  </tr>
</table>

The following configuration settings can be set in
the [advanced config file](#advanced-config-file) only,
under the `rabbit` section.

<table class="name-description">
  <tr>
    <th>Key</th>
    <th>Documentation</th>
  </tr>
  <tr>
    <td><code>msg_store_index_module</code></td>
    <td>
      Implementation module for queue indexing. You are
      advised to read the <a
      href="persistence-conf.html">message store tuning</a>
      documentation before changing this.
      <p>
        Default: <code>rabbit_msg_store_ets_index</code>
<pre class="lang-erlang">
{rabbit, [
{msg_store_index_module, rabbit_msg_store_ets_index}
]}
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>backing_queue_module</code></td>
    <td>
      Implementation module for queue contents.
      <p>
        Default:
<pre class="lang-erlang">
{rabbit, [
{backing_queue_module, rabbit_variable_queue}
]}
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>msg_store_file_size_limit</code></td>
    <td>
      Message store segment file size. Changing this for a node
      with an existing (initialised) database is dangerous can
      lead to data loss!
      <p>
        Default: <code>16777216</code>
<pre class="lang-erlang">
{rabbit, [
%% Changing this for a node
%% with an existing (initialised) database is dangerous can
%% lead to data loss!
{msg_store_file_size_limit, 16777216}
]}
</pre>
      </p>
    </td>
  </tr>
    <tr>
      <td><code>trace_vhosts</code></td>
      <td>
        Used internally by
        the <a href="firehose.html">tracer</a>. You shouldn't
        change this.
        <p>
          Default:
<pre class="lang-erlang">
{rabbit, [
{trace_vhosts, []}
]}
</pre>
        </p>
      </td>
    </tr>
  <tr>
    <td><code>msg_store_credit_disc_bound</code></td>
    <td>
      The credits that a queue process is given by the message store.
      <p>
        By default, a queue process is given 4000 message store credits, and then 800 for every 800 messages that it processes.
      </p>
      <p>
        Messages which need to be paged out due to memory pressure will also use this credit.
      </p>
      <p>
        The Message Store is the last component in the credit flow chain. <a href="https://www.rabbitmq.com/blog/2015/10/06/new-credit-flow-settings-on-rabbitmq-3-5-5/" target="_blank">Learn about credit flow.</a>
      </p>
      <p>
        This value only takes effect when messages are persisted to the message store.
        If messages are embedded on the queue index, then modifying this setting has no effect because credit_flow is NOT used when writing to the queue index.
      </p>
      <p>
        Default:
<pre class="lang-erlang">
{rabbit, [
{msg_store_credit_disc_bound, {4000, 800}}
]}
</pre>
      </p>
    </td>
  </tr>
  <tr>
    <td><code>queue_index_max_journal_entries</code></td>
    <td>
      After how many queue index journal entries it will be
      flushed to disk.
      <p>
        Default:
<pre class="lang-erlang">
{rabbit, [
{queue_index_max_journal_entries, 32768}
]}
</pre>
      </p>
    </td>
  </tr>

  <tr>
    <td>
      <code>lazy_queue_explicit_gc_run_operation_threshold</code>
    </td>
    <td>
     Tunable value only for lazy queues when under memory pressure.
     This is the threshold at which the garbage collector and other memory reduction activities are triggered.
     A low value could reduce performance, and a high one can improve performance, but cause higher memory consumption.
     You almost certainly should not change this.
    <p>
      Default:
<pre class="lang-ini">
{rabbit, [
{lazy_queue_explicit_gc_run_operation_threshold, 1000}
]}
</pre>
    </p>
    </td>
  </tr>
  <tr>
    <td>
      <code>queue_explicit_gc_run_operation_threshold</code>
    </td>
    <td>
     Tunable value only for normal queues when under memory pressure.
     This is the threshold at which the garbage collector and other memory reduction activities are triggered.
     A low value could reduce performance, and a high one can improve performance, but cause higher memory consumption.
     You almost certainly should not change this.
    <p>
      Default:
<pre class="lang-ini">
{rabbit, [
{queue_explicit_gc_run_operation_threshold, 1000}
]}
</pre>
    </p>
    </td>
  </tr>
</table>

Several [plugins](/plugins.html) that ship with RabbitMQ have
dedicated documentation guides that cover plugin configuration:

 * [rabbitmq_management](/management.html#configuration)
 * [rabbitmq_management_agent](/management.html#configuration)
 * [rabbitmq_stomp](/stomp.html)
 * [rabbitmq_mqtt](/mqtt.html)
 * [rabbitmq_shovel](/shovel.html)
 * [rabbitmq_federation](/federation.html)
 * [rabbitmq_auth_backend_ldap](/ldap.html)

### <a id="configuration-encryption" class="anchor" href="#configuration-encryption">Configuration Value Encryption</a>

Sensitive configuration entries (e.g. password, URL containing
credentials) can be encrypted in the RabbitMQ configuration file.
The broker decrypts encrypted entries on start.

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

<pre class="lang-erlang">
[
  {rabbit, [
      {default_user, &lt;&lt;"guest"&gt;&gt;},
      {default_pass,
        {encrypted,
         &lt;&lt;"cPAymwqmMnbPXXRVqVzpxJdrS8mHEKuo2V+3vt1u/fymexD9oztQ2G/oJ4PAaSb2c5N/hRJ2aqP/X0VAfx8xOQ=="&gt;&gt;
        }
      },
      {config_entry_decoder, [
             {passphrase, &lt;&lt;"mypassphrase"&gt;&gt;}
         ]}
    ]}
].
</pre>

Note the `config_entry_decoder` key with the passphrase
that RabbitMQ will use to decrypt encrypted values.

The passphrase doesn't have to be hardcoded in the configuration file,
it can be in a separate file:

<pre class="lang-erlang">
[
  {rabbit, [
      %% ...
      {config_entry_decoder, [
             {passphrase, {file, "/path/to/passphrase/file"}}
         ]}
    ]}
].
</pre>

RabbitMQ can also request an operator to enter the passphrase
when it starts by using `{passphrase, prompt}`.

Use [rabbitmqctl](/cli.html) and the `encode`
command to encrypt values:

<pre class="lang-bash">
rabbitmqctl encode '&lt;&lt;"guest"&gt;&gt;' mypassphrase
{encrypted,&lt;&lt;"... long encrypted value..."&gt;&gt;}
rabbitmqctl encode '"amqp://fred:secret@host1.domain/my_vhost"' mypassphrase
{encrypted,&lt;&lt;"... long encrypted value..."&gt;&gt;}
</pre>

Or, on Windows:

<pre class="lang-powershell">
rabbitmqctl encode "&lt;&lt;""guest""&gt;&gt;" mypassphrase
{encrypted,&lt;&lt;"... long encrypted value..."&gt;&gt;}
rabbitmqctl encode '"amqp://fred:secret@host1.domain/my_vhost"' mypassphrase
{encrypted,&lt;&lt;"... long encrypted value..."&gt;&gt;}
</pre>

Add the `decode` command if you want to decrypt values:

<pre class="lang-bash">
rabbitmqctl decode '{encrypted, &lt;&lt;"..."&gt;&gt;}' mypassphrase
&lt;&lt;"guest"&gt;&gt;
rabbitmqctl decode '{encrypted, &lt;&lt;"..."&gt;&gt;}' mypassphrase
"amqp://fred:secret@host1.domain/my_vhost"
</pre>

Or, on Windows:

<pre class="lang-powershell">
rabbitmqctl decode "{encrypted, &lt;&lt;""...""&gt;&gt;}" mypassphrase
&lt;&lt;"guest"&gt;&gt;
rabbitmqctl decode "{encrypted, &lt;&lt;""...""&gt;&gt;}" mypassphrase
"amqp://fred:secret@host1.domain/my_vhost"
</pre>

Values of different types can be encoded. The example above encodes
both binaries (`&lt;&lt;"guest"&gt;&gt;`) and strings
(`"amqp://fred:secret@host1.domain/my_vhost"`).

The encryption mechanism uses PBKDF2 to produce a derived key
from the passphrase. The default hash function is SHA512
and the default number of iterations is 1000. The default
cipher is AES 256 CBC.

These defaults can be changed in the configuration file:

<pre class="lang-erlang">
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
].</pre>

Or using [CLI tools](/cli.html):

<pre class="lang-bash">
rabbitmqctl encode --cipher blowfish_cfb64 --hash sha256 --iterations 10000 \
                     '&lt;&lt;"guest"&gt;&gt;' mypassphrase
</pre>

Or, on Windows:

<pre class="lang-powershell">
rabbitmqctl encode --cipher blowfish_cfb64 --hash sha256 --iterations 10000 \
                     "&lt;&lt;""guest""&gt;&gt;" mypassphrase
</pre>

## <a id="customise-environment" class="anchor" href="#customise-environment">Configuration Using Environment Variables</a>

Certain server parameters can be configured using environment variables:
[node name](/cli.html#node-names), RabbitMQ [configuration file location](#configuration-files),
[inter-node communication ports](/networking.html#ports), Erlang VM flags, and so on.

### <a id="directory-and-path-restrictions" class="anchor" href="#directory-and-path-restrictions">Path and Directory Name Restrictions</a>

Some of the environment variable configure paths and locations (node's base or data directory, [plugin source and expansion directories](/plugins.html),
and so on). Those paths have must exclude a number of characters:

 * `*` and `?` (on Linux, macOS, BSD and other UNIX-like systems)
 * `^` and `!` (on Windows)
 * `[` and `]`
 * `{` and `}`

The above characters will render the node unable to start or function as expected (e.g. expand plugins and load their metadata).

### <a id="environment-env-file-unix" class="anchor" href="#environment-env-file-unix">Linux, MacOS, BSD</a>

On UNIX-based systems (Linux, MacOS and flavours of BSD) it is possible to
use a file named ``rabbitmq-env.conf``
to define environment variables that will be used by the broker.
Its [location](#config-location) is configurable
using the `RABBITMQ_CONF_ENV_FILE` environment variable.

``rabbitmq-env.conf`` uses the standard environment variable names
but without the `RABBITMQ_` prefix. For example, the
`RABBITMQ_CONFIG_FILE` parameter appears
below as `CONFIG_FILE` and
`RABBITMQ_NODENAME` becomes
`NODENAME`:

<pre class="lang-bash">
# Example rabbitmq-env.conf file entries. Note that the variables
# do not have the RABBITMQ_ prefix.
#
# Overrides node name
NODENAME=bunny@myhost

# Specifies new style config file location
CONFIG_FILE=/etc/rabbitmq/rabbitmq.conf

# Specifies advanced config file location
ADVANCED_CONFIG_FILE=/etc/rabbitmq/advanced.config
</pre>

See the [rabbitmq-env.conf man page](man/rabbitmq-env.conf.5.html) for details.

### <a id="rabbitmq-env-file-windows" class="anchor" href="#rabbitmq-env-file-windows">Windows</a>


The easiest option to customise names, ports or locations is
to configure environment variables in the Windows dialogue:
Start&#xA0;>&#xA0;Settings&#xA0;>&#xA0;Control&#xA0;Panel&#xA0;>&#xA0;System&#xA0;>&#xA0;Advanced&#xA0;>&#xA0;Environment&#xA0;Variables.
Then create or edit the system variable name and value.

Alternatively it is possible to
use a file named `rabbitmq-env-conf.bat`
to define environment variables that will be used by the broker.
Its [location](#config-location) is configurable
using the `RABBITMQ_CONF_ENV_FILE` environment variable.

<strong>Important</strong>: for environment changes to take effect on Windows, the service must be
<em>re-installed</em>. It is <em>not sufficient</em> to restart the service.

This can be done using the installer or on the command line
with administrator permissions:

 * [Start an admin command prompt](https://technet.microsoft.com/en-us/library/cc947813%28v=ws.10%29.aspx)
 * cd into the sbin folder under the RabbitMQ server installation directory (such as `C:\Program Files (x86)\RabbitMQ Server\rabbitmq_server-&version-server;\sbin`)
 * Run `rabbitmq-service.bat remove`
 * Set environment variables via command line, i.e. run commands like the following: <pre class="lang-powershell">set RABBITMQ_BASE=C:\Data\RabbitMQ</pre>
 * Run `rabbitmq-service.bat install`

Alternatively, if the new configuration needs to take effect after the next broker restart,
the service removal step can be skipped:

 * [Start an admin command prompt](https://technet.microsoft.com/en-us/library/cc947813%28v=ws.10%29.aspx)
 * cd into the sbin folder under RabbitMQ server installation directory
 * Set environment variables via command line
 * Run `rabbitmq-service.bat install`, which will only update service parameters


## <a id="supported-environment-variables" class="anchor" href="#supported-environment-variables">RabbitMQ Environment Variables</a>

All environment variables used by RabbitMQ use the
prefix `RABBITMQ_` (except when defined in [rabbitmq-env.conf](#environment-env-file-unix) or
[rabbitmq-env-conf.bat](#environment-env-file-windows)).

Environment variables set in the shell environment take
priority over those set
in [rabbitmq-env.conf](#environment-env-file-unix) or
[rabbitmq-env-conf.bat](#environment-env-file-windows), which in turn override
RabbitMQ built-in defaults.

The table below describes key environment variables that can be used to configure RabbitMQ.
More variables are covered in the [File and Directory Locations guide](/relocate.html).

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
      See <a href="/networking.html">Networking guide</a> for more information on ports used by various
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
      file sets <code>kernel.inet_dist_listen_min</code> or
      <code>kernel.inet_dist_listen_max</code> keys.
      See <a href="/networking.html">Networking</a> for details.

      <p>
        <strong>Default</strong>: <code>RABBITMQ_NODE_PORT + 20000</code>
      </p>
    </td>
  </tr>

  <tr>
    <td>ERL_EPMD_ADDRESS</td>
    <td>
      Interface(s) used by <a href="/networking.html#epmd">epmd</a>, a component in inter-node and CLI tool communication.

      <p>
        <strong>Default</strong>: all available interfaces, both IPv6 and IPv4.
      </p>
    </td>
  </tr>

  <tr>
    <td>ERL_EPMD_PORT</td>
    <td>
      Port used by <a href="/networking.html#epmd">epmd</a>, a component in inter-node and CLI tool communication.

      <p>
        <strong>Default</strong>: <code>4369</code>
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
    <td>RABBITMQ_IO_THREAD_POOL_SIZE</td>
    <td>
      <a href="/networking.html#tuning-for-throughput-async-thread-pool">Number of threads used by the runtime for I/O</a>. Values lower than
      32 are not recommended.

      <p>
        <strong>Default</strong>: 128 (Linux), 64 (Windows)
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_NODENAME</td>
    <td>
      The node name should be unique per Erlang-node-and-machine combination.
      To run multiple nodes, see the <a href="/clustering.html">clustering guide</a>.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>
            <b>Unix*:</b>
            <code>rabbit@$HOSTNAME</code>
          </li>
          <li>
            <b>Windows:</b>
            <code>rabbit@%COMPUTERNAME%</code>
          </li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONFIG_FILE</td>
    <td>
      Main RabbitMQ config file path without the <code>.conf</code>
      (or <code>.config</code>, for the classic format) extension.
      For example, it should be <code>/data/rabbitmq/rabbitmq</code>,
      not <code>/data/rabbitmq/rabbitmq.conf</code>.

      <p>
        <strong>Default</strong>:

        <ul>
          <li><b>Generic UNIX</b>: <code>$RABBITMQ_HOME/etc/rabbitmq/rabbitmq</code>
          </li>
          <li><b>Debian</b>: <code>/etc/rabbitmq/rabbitmq</code></li>
          <li><b>RPM</b>: <code>/etc/rabbitmq/rabbitmq</code></li>
          <li>
            <b>MacOS(Homebrew)</b>: <code>${install_prefix}/etc/rabbitmq/rabbitmq</code>,
            the Homebrew prefix is usually <code>/usr/local</code>
          </li>
          <li><b>Windows</b>: <code>%APPDATA%\RabbitMQ\rabbitmq</code></li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_ADVANCED_CONFIG_FILE</td>
    <td>
      "Advanced" (Erlang term-based) RabbitMQ config file path without the <code>.config</code> file extension.
      For example, it should be <code>/data/rabbitmq/advanced</code>,
      not <code>/data/rabbitmq/advanced.config</code>.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>
            <b>Generic UNIX</b>: <code>$RABBITMQ_HOME/etc/rabbitmq/advanced</code>
          </li>
          <li><b>Debian</b>: <code>/etc/rabbitmq/advanced</code></li>
          <li><b>RPM</b>: <code>/etc/rabbitmq/advanced</code></li>
          <li>
            <b>MacOS (Homebrew)</b>: <code>${install_prefix}/etc/rabbitmq/advanced</code>,
            the Homebrew prefix is usually <code>/usr/local</code>
          </li>
          <li><b>Windows</b>: <code>%APPDATA%\RabbitMQ\advanced</code></li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONF_ENV_FILE</td>
    <td>
      Location of the file that contains environment variable definitions (without the <code>RABBITMQ_</code>
      prefix). Note that the file name on Windows is different from other operating systems.

      <p>
        <strong>Default</strong>:

        <ul>
          <li><b>Generic UNIX package</b>: <code>$RABBITMQ_HOME/etc/rabbitmq/rabbitmq-env.conf</code></li>
          <li><b>Ubuntu and Debian</b>: <code>/etc/rabbitmq/rabbitmq-env.conf</code></li>
          <li><b>RPM</b>: <code>/etc/rabbitmq/rabbitmq-env.conf</code></li>
          <li>
            <b>MacOS (Homebrew)</b>: <code>${install_prefix}/etc/rabbitmq/rabbitmq-env.conf</code>,
            the Homebrew prefix is usually <code>/usr/local</code>
          </li>
          <li><b>Windows</b>: <code>%APPDATA%\RabbitMQ\rabbitmq-env-conf.bat</code></li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_MNESIA_BASE</td>
    <td>
      This base directory contains sub-directories for the RabbitMQ
      server's node database, message store and cluster state files, one for each node,
      unless <b>RABBITMQ_MNESIA_DIR</b> is set explicitly.
      It is important that effective RabbitMQ user has sufficient permissions
      to read, write and create files and subdirectories in this directory
      at any time. This variable is typically not overridden.
      Usually <code>RABBITMQ_MNESIA_DIR</code> is overridden instead.

      <p>
        <strong>Default</strong>:

        <ul>
          <li><b>Generic UNIX package</b>: <code>$RABBITMQ_HOME/var/lib/rabbitmq/mnesia</code></li>
          <li><b>Ubuntu and Debian</b> packages: <code>/var/lib/rabbitmq/mnesia/</code></li>
          <li><b>RPM</b>: <code>/var/lib/rabbitmq/plugins</code></li>
          <li>
            <b>MacOS (Homebrew)</b>: <code>${install_prefix}/var/lib/rabbitmq/mnesia</code>,
            the Homebrew prefix is usually <code>/usr/local</code>
          </li>
          <li><b>Windows</b>: <code>%APPDATA%\RabbitMQ</code></li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_MNESIA_DIR</td>
    <td>
      The directory where this RabbitMQ node's data is stored. This s
      a schema database, message stores, cluster member information and other
      persistent node state.

      <p>
        <strong>Default</strong>:

        <ul>
          <li><b>Generic UNIX package</b>: <code>$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME</code></li>
          <li><b>Ubuntu and Debian</b> packages: <code>$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME</code></li>
          <li><b>RPM</b>: <code>$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME</code></li>
          <li>
            <b>MacOS (Homebrew)</b>: <code>${install_prefix}/var/lib/rabbitmq/mnesia/$RABBITMQ_NODENAME</code>,
            the Homebrew prefix is usually <code>/usr/local</code>
          </li>
          <li><b>Windows</b>: <code>%APPDATA%\RabbitMQ\$RABBITMQ_NODENAME</code></li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_DIR</td>
    <td>
      The list of directories where <a
      href="/plugins.html">plugin</a> archive files are located and extracted
      from. This is <code>PATH</code>-like variable, where
      different paths are separated by an OS-specific separator
      (<code>:</code> for Unix, <code>;</code> for Windows).
      Plugins can be <a href="plugins.html">installed</a> to any of the directories listed here.
      Must not contain any characters mentioned in the <a href="#directory-and-path-restrictions">path restriction section</a>.

      <p>
        <strong>Default</strong>:

        <ul>
          <li><b>Generic UNIX package</b>: <code>$RABBITMQ_HOME/plugins</code></li>
          <li><b>Ubuntu and Debian</b> packages: <code>/var/lib/rabbitmq/plugins</code></li>
          <li><b>RPM</b>: <code>/var/lib/rabbitmq/plugins</code></li>
          <li>
            <b>MacOS (Homebrew)</b>: <code>${install_prefix}/Cellar/rabbitmq/${version}/plugins</code>,
            the Homebrew prefix is usually <code>/usr/local</code>
          </li>
          <li><b>Windows</b>: <code>%RABBITMQ_HOME%\plugins</code></li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_PLUGINS_EXPAND_DIR</td>
    <td>
      The directory the node expand (unpack) <a href="/plugins.html">plugins</a> to and use it as a code path location.
      Must not contain any characters mentioned in the <a href="#directory-and-path-restrictions">path restriction section</a>.

      <p>
        <strong>Default</strong>:

        <ul>
          <li><b>Generic UNIX package</b>: <code>$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME-plugins-expand</code></li>
          <li><b>Ubuntu and Debian</b> packages: <code>$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME-plugins-expand</code></li>
          <li><b>RPM</b>: <code>$RABBITMQ_MNESIA_BASE/$RABBITMQ_NODENAME-plugins-expand</code></li>
          <li>
            <b>MacOS (Homebrew)</b>:
              <code>${install_prefix}/var/lib/rabbitmq/mnesia/$RABBITMQ_NODENAME-plugins-expand</code>
          </li>
          <li><b>Windows</b>: <code>%APPDATA%\RabbitMQ\$RABBITMQ_NODENAME-plugins-expand</code></li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_USE_LONGNAME</td>
    <td>
      When set to <code>true</code> this will cause RabbitMQ
      to use fully qualified names to identify nodes. This
      may prove useful in environments that use fully-qualified domain names.
      Note that it is not possible to switch between using short and long names without
      resetting the node.

      <p>
        <strong>Default</strong>: <code>false</code>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVICENAME</td>
    <td>
      The name of the installed Windows ervice. This will appear in
      <code>services.msc</code>.

      <p>
        <strong>Default</strong>: RabbitMQ.
      </p>
  </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONSOLE_LOG</td>
    <td>
      Set this variable to <code>new</code> or <code>reuse</code>
      to redirect console output from the server to a file named
      <code>%RABBITMQ_SERVICENAME%</code> in the
      default <code>RABBITMQ_BASE</code> directory.
      <ul>
        <li>If not set, console output from the server will be discarded (default).</li>
        <li><code>new</code>: a new file will be created each time the service starts.</li>
        <li><code>reuse</code>: the file will be overwritten each time the service starts.</li>
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
        Will be passed to the <code>erl</code> command when a node is started.
      </p>
      <p>
        Typically used in combination with <a href="/rabbitmqctl.8.html#hipe_compile">rabbitmqctl hipe_compile</a>
        to precompile key RabbitMQ modules with HiPE (a JIT runtime compile) and avoid the HiPE
        startup penalty. When set to a directory with precompiled modules, the HiPE-compiled
        versions will be detected, loaded and skipped for compilation.
      </p>
      <p>
        <code>hipe_compile</code> must be set to
        <code>true</code> in node cofiguration.
      </p>

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CTL_ERL_ARGS</td>
    <td>
      Parameters for the <code>erl</code> command used when invoking
      <code>rabbitmqctl</code>. This could be set to specify a range
      of ports to use for Erlang distribution:<br/>
      <code>-kernel inet_dist_listen_min 35672</code><br/>
      <code>-kernel inet_dist_listen_max 35680</code>

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_ERL_ARGS</td>
    <td>
      Standard parameters for the <code>erl</code> command used when
      invoking the RabbitMQ Server. This should be overridden for
      debugging purposes only. Overriding this variable
      <em>replaces</em> the default value.

      <p>
        <strong>Default</strong>:

        <ul>
          <li><b>Unix*:</b>
            <code>+P 1048576 +t 5000000 +stbt db +zdbbl 128000</code>
          </li>
          <li><b>Windows:</b> None</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS</td>
    <td>
      Additional parameters for the <code>erl</code> command used when
      invoking the RabbitMQ Server. The value of this variable
      is appended to the default list of arguments (<code>RABBITMQ_SERVER_ERL_ARGS</code>).

      <p>
        <strong>Default</strong>:

        <ul>
          <li><b>Unix*:</b> None</li>
          <li><b>Windows:</b> None</li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_START_ARGS</td>
    <td>
      Extra parameters for the <code>erl</code> command used when
      invoking the RabbitMQ Server. This will not override
      <code>RABBITMQ_SERVER_ERL_ARGS</code>.

      <p>
        <strong>Default</strong>: (none)
      </p>
    </td>
  </tr>
</table>

Besides the variables listed above, there are several environment variables which
tell RabbitMQ [where to locate its database, log files, plugins, configuration and so on](relocate.html).

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
          <li>Unix, Linux: <code>env hostname</code></li>
          <li>MacOS: <code>env hostname -s</code></li>
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
          <li>Windows: <code>localhost</code></li>
        </ul>
      </p>
    </td>
  </tr>

  <tr>
    <td>ERLANG_SERVICE_MANAGER_PATH</td>
    <td>
      This path is the location of <code>erlsrv.exe</code>,
      the Erlang service wrapper script.

      <p>
        <strong>Default</strong>:

        <ul>
          <li>Windows Service: <code>%ERLANG_HOME%\erts-<var>x.x.x</var>\bin</code></li>
        </ul>
      </p>
    </td>
  </tr>
</table>


## <a id="kernel-limits" class="anchor" href="#kernel-limits">Operating System Kernel Limits</a>

Most operating systems enforce limits on kernel resources: virtual memory, stack size, open file handles
and more. To Linux users these limits can be known as "ulimit limits".

RabbitMQ nodes are most commonly affected by the maximum [open file handle limit](/networking.html#open-file-handle-limit).
Default limit value on most Linux distributions is usually 1024, which is very low for a messaging broker (or generally, any data service).
See [Production Checklist](/production-checklist.html) for recommended values.

### Modifying Limits

#### With systemd (Modern Linux Distributions)

On distributions that use systemd, the OS limits are controlled via
a configuration file at `/etc/systemd/system/rabbitmq-server.service.d/limits.conf`.
For example, to set the max open file handle limit (`nofile`) to `64000`:

<pre class="sourcecode">
[Service]
LimitNOFILE=64000
</pre>

See [systemd documentation](https://www.freedesktop.org/software/systemd/man/systemd.exec.html) to learn about
the supported limits and other directives.

#### With Docker

To configure kernel limits for Docker contains, use the `"default-ulimits"` key in
[Docker daemon configuration file](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file).
The file has to be installed on Docker hosts at `/etc/docker/daemon.json`:

<pre class="lang-json">
{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
</pre>

#### Without systemd (Older Linux Distributions)

The most straightforward way to adjust the per-user limit for
RabbitMQ on distributions that do not use systemd is to edit the `/etc/default/rabbitmq-server`
(provided by the RabbitMQ Debian package) or [rabbitmq-env.conf](#config-file)
to invoke `ulimit` before the service is started.

<pre class="sourcecode">
ulimit -S -n 4096
</pre>

This _soft_ limit cannot go higher than the _hard_ limit (which defaults to 4096 in many distributions).
[The hard limit can be increased](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md) via
`/etc/security/limits.conf`. This also requires enabling the [pam_limits.so](http://askubuntu.com/a/34559) module
and re-login or reboot.

Note that limits cannot be changed for running OS processes.
