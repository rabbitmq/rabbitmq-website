<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

# Configuration

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ comes with default built-in settings. Those can be entirely
sufficient in some environment (e.g. development and QA).
For all other cases, as well as <a href="/production-checklist.html">production deployment tuning</a>,
there is a way to configure many things in the broker as well as <a href="/plugins.html">plugins</a>.

This guide covers a number of topics related to configuration:

<ul>
  <li><a href="#means-of-configuration">Different ways</a> in which various settings of the server and plugins are configured</li>
  <li><a href="#configuration-files">Configuration file(s)</a></li>
  <li><a href="#customise-environment">Environment variables</a></li>
  <li>Available <a href="#config-items">core server settings</a></li>
  <li>Available <a href="#supported-environment-variables">environment variables</a></li>
  <li>How to <a href="#configuration-encryption">encrypt sensitive configuration values</a></li>
  <li>
    Troubleshooting: how to <a href="#verify-configuration-effective-configuration">verify config file location</a> and
    <a href="#verify-configuration-effective-configuration">effective configuration</a>
  </li>

  and more.
</ul>

Since configuration affects many areas of the system, including plugins, individual <a href="/documentation.html">documentation guides</a>
dive deeper into what can be configured. <a href="/production-checklist.html">Production Checklist</a> is a related guide
that outlines what settings will likely need tuning in most production environments.


## <a id="means-of-configuration" class="anchor" href="#means-of-configuration">Means of Configuration</a>

RabbitMQ provides three general ways to customise the server:

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
        <li><a href="/access-control.html">authentication and authorization backends</a></li>
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
      When <a href="access-control.html">internal authentication/authorization backend</a> is used,
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
      <a href="parameters.html">Runtime Parameters and Policies</a>
    </td>
    <td>
      defines cluster-wide settings which can change at run time
      as well as settings that are convenient to configure for groups of queues (exchanges, etc)
      such as including optional queue arguments.
    </td>
  </tr>
</table>

Most settings are configured using the first two methods. This guide,
therefore, focuses on them.

## <a id="configuration-files" class="anchor" href="#configuration-files">Configuration File(s)</a>

### <a id="config-file-intro" class="anchor" href="#config-file-intro">Introduction</a>

While some settings in RabbitMQ can be tuned using environment variables,
most are configured using a <a href="#config-file">configuration file</a>, usually named `rabbitmq.conf`.
This includes configuration for the core server as well as plugins.
The sections below cover the syntax, <a href="#config-file-location">location</a>,
how to configure things to which the format isn't well-suited, where to find examples, and so on.

Prior to RabbitMQ 3.7.0, RabbitMQ config file was named
`rabbitmq.config` and used <a href="http://www.erlang.org/doc/man/config.html">an Erlang term
configuration format</a>. That format is <a href="#config-file-formats">still supported</a> for backwards compatibility.
Those running 3.7.0 or later are recommended to consider the new sysctl format.

### <a id="config-file-location" class="anchor" href="#config-file-location">Config File Locations</a>

<a href="/configure.html#config-location">Default config file locations</a>
vary between operating systems and <a href="/download.html">package types</a>.

This topic is covered in more detail in the rest of this guide.

When in doubt about RabbitMQ config file location for your OS and installation method,
consult the log file and/or management UI as explained in the following sections.

### <a id="verify-configuration-config-file-location" class="anchor" href="#verify-configuration-config-file-location">Verify Configuration: How to Find Config File Location</a>

The active configuration file can be verified by inspecting the
RabbitMQ log file. It will show up in the <a href="relocate.html">log file</a>
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

Alternatively config file location can be found in the <a href="/management.html">management UI</a>,
together with other details about nodes.

When troubleshooting configuration settings, it is very useful to verify that the config file
path is correct, exists and can be loaded (e.g. the file is readable) before checking effective
node configuration.

### <a id="verify-configuration-effective-configuration" class="anchor" href="#verify-configuration-effective-configuration">Verify Configuration: How to Check Effective Configuration</a>

It is possible to print effective configuration (user provided values merged into defaults) using
the <a href="/rabbitmqctl.8.html">rabbitmqctl environment</a> command. It will print
applied configuration for every application (RabbitMQ, plugins, libraries) running on the node.

Effective configuration should be verified together with config file location (see above).
It is a useful step in troubleshooting a broad range of problems.

### <a id="config-file-formats" class="anchor" href="#config-file-formats">The New and Old Config File Formats</a>

Prior to RabbitMQ 3.7.0, RabbitMQ config file was named
`rabbitmq.config` and used <a href="http://www.erlang.org/doc/man/config.html">an Erlang term
configuration format</a>. That format is still supported for backwards compatibility.
Those running 3.7.0 or later are recommended to consider the new sysctl format.

The new format is easier to generate deployment automation tools.
Compare

<pre class="sourcecode">
ssl_options.cacertfile           = /path/to/testca/cacert.pem
ssl_options.certfile             = /path/to/server_certificate.pem
ssl_options.keyfile              = /path/to/server_key.pem
ssl_options.verify               = verify_peer
ssl_options.fail_if_no_peer_cert = true
</pre>

with

<pre class="sourcecode">
[
  {rabbit, [{ssl_options, [{cacertfile,           "/path/to/testca/cacert.pem"},
                           {certfile,             "/path/to/server_certificate.pem"},
                           {keyfile,              "/path/to/server_key.pem"},
                           {verify,               verify_peer},
                           {fail_if_no_peer_cert, true}]}]}
].
</pre>

While the new config format is more convenient for humans to edit
and machines to generate, it is also relatively limited compared
to the classic config format used prior to RabbitMQ 3.7.0. For
example, when configuring <a href="/ldap.html">LDAP support</a>,
it may be necessary to use deeply nested data structures to
express desired configuration. To accommodate this need,
RabbitMQ still supports the classic `rabbitmq.config`
config files as well as ability to use both formats at the same time
(`advanced.config`). This is covered in more detail in the following sections.

### <a id="config-file" class="anchor" href="#config-file">The rabbitmq.conf File</a>

The configuration file `rabbitmq.conf`
allows the RabbitMQ server and plugins to be configured.
Starting with RabbitMQ 3.7.0, the format is in the <a href="https://github.com/basho/cuttlefish/wiki/Cuttlefish-for-Application-Users">sysctl format</a>.

The syntax can be briefly explained in 3 lines:

<ul>
  <li>One setting uses one line</li>
  <li>Lines are structured <code>Key = Value</code></li>
  <li>Any line starting with a <code>#</code> character is a comment</li>
</ul>

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

This example will alter the <a href="/networking.html#ports">port RabbitMQ listens on</a> for
AMQP 0-9-1 and AMQP 1.0 client connections from 5672 to 5673.

The RabbitMQ server source repository contains <a href="https://github.com/rabbitmq/rabbitmq-server/blob/v3.7.x/docs/rabbitmq.conf.example">an
example rabbitmq.conf file</a> named `rabbitmq.conf.example`. It contains examples of
most of the configuration items you might want to set (with some very obscure ones omitted), along with
documentation for those settings.

Documentation guides such as <a href="/networking.html">Networking</a>, <a href="/ssl.html">TLS</a>, or
<a href="/access-control.html">Access Control</a> will often provide examples
in both formats.

 Note that this configuration file is not to be confused with the environment variable
 configuration files, <a href="#environment-env-file-unix">rabbitmq-env.conf</a>
 and <a href="#environment-env-file-windows">rabbitmq-env-conf.bat</a>.

To override the main RabbitMQ config file location, use the `RABBITMQ_CONFIG_FILE`
<a href="#customise-environment">environment variable</a>. Use `.conf` as file extension
for the new style config format.

### <a id="advanced-config-file" class="anchor" href="#advanced-config-file">The advanced.config File</a>

Some configuration settings are not possible or are difficult to configure
using the sysctl format. As such, it is possible to use an additional
config file in the Erlang term format (same as `rabbitmq.config`).
That file is commonly named `advanced.config`. It will be merged
with the configuration provided in `rabbitmq.conf`.

The RabbitMQ server source repository contains <a href="https://github.com/rabbitmq/rabbitmq-server/blob/master/docs/advanced.config.example">an
example advanced.config file</a> named `advanced.config.example`. It focuses on the
options that are typically set using the advanced config.

To override the advanced config file location, use the `RABBITMQ_ADVANCED_CONFIG_FILE`
environment variable.

### <a id="erlang-term-config-file" class="anchor" href="#erlang-term-config-file">The rabbitmq.config (Classic Format) File</a>

RabbitMQ 3.7.0 and later versions still support the
classic configuration file format, known as
`rabbitmq.config`. To use it, export
`RABBITMQ_CONFIG_FILE` to point to the file with
a `.config`
extension to indicate that RabbitMQ should treat it as a classic config format.

The RabbitMQ server source repository contains <a href="https://github.com/rabbitmq/rabbitmq-server/blob/v3.7.x/docs/rabbitmq.config.example">an
example configuration file</a> named
`rabbitmq.config.example`. It contains an
example of most of the configuration items in the classic
config format.

Documentation guides such as <a href="/networking.html">Networking</a>, <a href="/ssl.html">TLS</a>, or
<a href="/access-control.html">Access Control</a> will often provide examples
in both formats.

To override the main RabbitMQ config file location, use the `RABBITMQ_CONFIG_FILE`
<a href="#customise-environment">environment variable</a>. Use `.config` as file extension
for the classic config format.

### <a id="config-location" class="anchor" href="#config-location">Location of rabbitmq.conf and rabbitmq-env.conf</a>

The location of these files is distribution-specific. By default, they
are not created, but expect to be located in the following places on each platform:

<ul>
  <li>Generic UNIX: <code>$RABBITMQ_HOME/etc/rabbitmq/</code></li>
  <li>Debian: <code>/etc/rabbitmq/</code></li>
  <li>RPM: <code>/etc/rabbitmq/</code></li>
  <li>
    Mac OS (Homebrew): <code>${install_prefix}/etc/rabbitmq/</code>,
    the Homebrew cellar prefix is usually `/usr/local`
  </li>
  <li>Windows: <code>%APPDATA%\RabbitMQ\</code></li>
</ul>

If `rabbitmq-env.conf` doesn't exist, it can be created manually
in the location, specified by the `RABBITMQ_CONF_ENV_FILE` variable.
On Windows systems, it is named `rabbitmq-env.bat`.

If `rabbitmq.conf` doesn't exist, it can be created manually.
Set the <b>RABBITMQ_CONFIG_FILE</b> environment variable if you change the location.
RabbitMQ automatically appends the `.conf` extension to the
value of this variable.

Restart the server after changes. Windows service users will need to re-install the
service after adding or removing a configuration file.

### <a id="example-config" class="anchor" href="#example-config">Example rabbitmq.conf File</a>

The RabbitMQ server source repository contains
examples for the configuration files:

<ul>
  <li><a href="https://github.com/rabbitmq/rabbitmq-server/blob/master/docs/rabbitmq.conf.example">rabbitmq.conf.example</a></li>
  <li><a href="https://github.com/rabbitmq/rabbitmq-server/blob/master/docs/advanced.config.example">advanced.config.example</a></li>
</ul>

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

<table>
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
      <p>Default: `none` (not set)</p>
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
        <li>`allocated`: uses Erlang memory allocator statistics</li>
        <li>`rss`: uses operating system RSS memory reporting. This uses OS-specific means and may start short lived child processes.</li>
        <li>`legacy`: uses legacy memory reporting (how much memory is considered to be used by the runtime). This strategy is fairly inaccurate.</li>
        <li>`erlang`: same as `legacy`, preserved for backwards compatibility</li>
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
      memory. See the <a href="memory.html">memory-based flow
      control</a> documentation.
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
				The level can be one of `error` (only errors are
				logged), `warning` (only errors and warning are
				logged), `info` (errors, warnings and informational
				messages are logged), or `debug` (errors, warnings,
        informational messages and debugging messages are
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
      Set this to cause clustering
      to <a href="clustering.html#auto-config">happen automatically</a>
      when a node starts for the very first time.

      For example, to cluster with nodes `rabbit@hostname1` and
      `rabbit@hostname2`:
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
        Set to `true` to precompile parts of RabbitMQ
        with HiPE, a just-in-time compiler for Erlang.
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
      <p>
        HiPE is not supported on Windows.
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
      Batch size of messages to synchronise between queue mirrors
      See <a href="/ha.html#batch-sync" target="_blank">Batch Synchronization</a>
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
the <a href="#advanced-config-file">advanced config file</a> only,
under the `rabbit` section.

<table>
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

Several <a href="/plugins.html">plugins</a> that ship with RabbitMQ have
dedicated documentation guides that cover plugin configuration:

<ul>
  <li><a href="management.html#configuration">rabbitmq_management</a></li>
  <li><a href="management.html#configuration">rabbitmq_management_agent</a></li>
  <li><a href="stomp.html">rabbitmq_stomp</a></li>
  <li><a href="mqtt.html">rabbitmq_mqtt</a></li>
  <li><a href="shovel.html">rabbitmq_shovel</a></li>
  <li><a href="federation.html">rabbitmq_federation</a></li>
  <li><a href="ldap.html">rabbitmq_auth_backend_ldap</a></li>
</ul>


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

Use <a href="/cli.html">rabbitmqctl</a> and the `encode`
command to encrypt values:

<pre class="lang-bash">
rabbitmqctl encode '&lt;&lt;"guest"&gt;&gt;' mypassphrase
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

Or using <a href="/cli.html">CLI tools</a>:

<pre class="lang-bash">
rabbitmqctl encode --cipher blowfish_cfb64 --hash sha256 --iterations 10000 \
                     '&lt;&lt;"guest"&gt;&gt;' mypassphrase
</pre>

## <a id="customise-environment" class="anchor" href="#customise-environment">Customise RabbitMQ Environment</a>

Certain server parameters can be configured using environment variables:
[node name](/cli.html#node-names), RabbitMQ [configuration file location](#configuration-files),
[inter-node communication ports](/networking.html#ports), Erlang VM flags, and so on.

### <a id="environment-env-file-unix" class="anchor" href="#environment-env-file-unix">Linux, MacOS, BSD</a>

On UNIX-based systems (Linux, MacOS and flavours of BSD) it is possible to
use a file named ``rabbitmq-env.conf``
to define environment variables that will be used by the broker.
Its <a href="#config-location">location</a> is configurable
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

# Specifies new style config file location
CONFIG_FILE=/etc/rabbitmq/rabbitmq.conf

# Specifies advanced config file location
ADVANCED_CONFIG_FILE=/etc/rabbitmq/advanced.config
</pre>

See the <a href="man/rabbitmq-env.conf.5.html">rabbitmq-env.conf man page</a> for details.

### <a id="rabbitmq-env-file-windows" class="anchor" href="#rabbitmq-env-file-windows">Windows</a>


The easiest option to customise names, ports or locations is
to configure environment variables in the Windows dialogue:
Start&#xA0;>&#xA0;Settings&#xA0;>&#xA0;Control&#xA0;Panel&#xA0;>&#xA0;System&#xA0;>&#xA0;Advanced&#xA0;>&#xA0;Environment&#xA0;Variables.
Then create or edit the system variable name and value.

Alternatively it is possible to
use a file named `rabbitmq-env-conf.bat`
to define environment variables that will be used by the broker.
Its <a href="#config-location">location</a> is configurable
using the `RABBITMQ_CONF_ENV_FILE` environment variable.

<strong>Important</strong>: for environment changes to take effect on Windows, the service must be
<em>re-installed</em>. It is <em>not sufficient</em> to restart the service.

This can be done using the installer or on the command line
with administrator permissions:

<ul>
  <li><a href="https://technet.microsoft.com/en-us/library/cc947813%28v=ws.10%29.aspx">Start an admin command prompt</a></li>
  <li>cd into the sbin folder under the RabbitMQ server installation directory (such as <code>C:\Program Files (x86)\RabbitMQ Server\rabbitmq_server-&version-server;\sbin</code>)</li>
  <li>Run <code>rabbitmq-service.bat remove</code></li>
  <li>Set environment variables via command line, i.e. run commands like the following: <pre class="lang-powershell">set RABBITMQ_BASE=C:\Data\RabbitMQ</pre></li>
  <li>Run <code>rabbitmq-service.bat install</code></li>
</ul>

Alternatively, if the new configuration needs to take effect after the next broker restart,
the service removal step can be skipped:

<ul>
  <li><a href="https://technet.microsoft.com/en-us/library/cc947813%28v=ws.10%29.aspx">Start an admin command prompt</a></li>
  <li>cd into the sbin folder under RabbitMQ server installation directory</li>
  <li>Set environment variables via command line</li>
  <li>Run <code>rabbitmq-service.bat install</code>, which will only update service parameters</li>
</ul>


## <a id="supported-environment-variables" class="anchor" href="#supported-environment-variables">RabbitMQ Environment Variables</a>

All environment variables used by RabbitMQ use the
prefix `RABBITMQ_` (except when defined in <a href="#environment-env-file-unix">rabbitmq-env.conf</a> or
<a href="#environment-env-file-windows">rabbitmq-env-conf.bat</a>).

Environment variables set in the shell environment take
priority over those set
in <a href="#environment-env-file-unix">rabbitmq-env.conf</a> or
<a href="#environment-env-file-windows">rabbitmq-env-conf.bat</a>, which in turn override
RabbitMQ built-in defaults.

The table below describes the environment variables that can be used to configure RabbitMQ.

<table>
  <tr><th>Name</th><th>Default</th><th>Description</th></tr>

  <tr>
    <td>RABBITMQ_NODE_IP_ADDRESS</td>
    <td>
      the empty string, meaning that it should bind to all network interfaces.
    </td>
    <td>
      Change this if you only want to bind to one network interface.
      Binding to two or more interfaces can be set up in the configuration file.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_NODE_PORT</td>
    <td>5672</td>
    <td></td>
  </tr>

  <tr>
    <td>RABBITMQ_DIST_PORT</td>
    <td>RABBITMQ_NODE_PORT + 20000</td>
    <td>
      Port used for inter-node and CLI tool communication. Ignored if your config
      file sets <code>kernel.inet_dist_listen_min</code> or
      <code>kernel.inet_dist_listen_max</code> keys. See <a href="/networking.html">Networking</a> for details.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_DISTRIBUTION_BUFFER_SIZE</td>
    <td>128000</td>
    <td>
      <a href="https://erlang.org/doc/man/erl.html#+zdbbl">Outgoing data buffer size limit</a>
      to use for inter-node communication connections, in kilobytes. Values lower than
      64 MB are not recommended.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_IO_THREAD_POOL_SIZE</td>
    <td>128 (Linux), 64 (Windows)</td>
    <td>
      <a href="/networking.html#tuning-for-throughput-async-thread-pool">Number of threads used by the runtime for I/O</a>. Values lower than
      32 are not recommended.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_NODENAME</td>
    <td>
      <ul>
        <li>
          <b>Unix*:</b>
          <code>rabbit@`$HOSTNAME`</code>
        </li>
        <li>
          <b>Windows:</b>
          <code>rabbit@`%COMPUTERNAME%`</code>
        </li>
      </ul>
    </td>
    <td>
      The node name should be unique per
      erlang-node-and-machine combination. To run multiple nodes,
      see the
      <a href="clustering.html">clustering guide</a>.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONFIG_FILE</td>
    <td>
      <ul>
        <li><b>Generic UNIX</b> - <code>`$RABBITMQ_HOME`/etc/rabbitmq/rabbitmq</code>
        </li>
        <li><b>Debian</b> - <code>/etc/rabbitmq/rabbitmq</code></li>
        <li><b>RPM</b> - <code>/etc/rabbitmq/rabbitmq</code></li>
        <li>
          <b>MacOS(Homebrew)</b> - <code>${install_prefix}/etc/rabbitmq/rabbitmq</code>,
          the Homebrew prefix is usually <code>/usr/local</code>
        </li>
        <li><b>Windows</b> - <code>`%APPDATA%`\RabbitMQ\rabbitmq</code></li>
      </ul>
    </td>
    <td>
      Main RabbitMQ config file path without the <code>.conf</code>
      (or <code>.config</code>, for the classic format) extension.
      For example, it should be <code>/data/rabbitmq/rabbitmq</code>,
      not <code>/data/rabbitmq/rabbitmq.conf</code>.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_ADVANCED_CONFIG_FILE</td>
    <td>
      <ul>
        <li><b>Generic UNIX</b> - <code>$RABBITMQ_HOME/etc/rabbitmq/advanced</code>
        </li>
        <li><b>Debian</b> - <code>/etc/rabbitmq/advanced</code></li>
        <li><b>RPM</b> - <code>/etc/rabbitmq/advanced</code></li>
        <li>
          <b>MacOS (Homebrew)</b> - <code>${install_prefix}/etc/rabbitmq/advanced</code>,
          the Homebrew prefix is usually <code>/usr/local</code>
        </li>
        <li><b>Windows</b> - <code>`%APPDATA%`\RabbitMQ\advanced</code></li>
      </ul>
    </td>
    <td>
      "Advanced" (Erlang term-based) RabbitMQ config file path without the <code>.config</code> file extension.
      For example, it should be <code>/data/rabbitmq/advanced</code>,
      not <code>/data/rabbitmq/advanced.config</code>.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONF_ENV_FILE</td>
    <td>
      <ul>
        <li><b>Generic UNIX package</b>: <code>`$RABBITMQ_HOME`/etc/rabbitmq/rabbitmq-env.conf</code>
        </li>
        <li><b>Ubuntu and Debian</b>: <code>/etc/rabbitmq/rabbitmq-env.conf</code></li>
        <li><b>RPM</b>: <code>/etc/rabbitmq/rabbitmq-env.conf</code></li>
        <li>
          <b>MacOS (Homebrew)</b> - <code>${install_prefix}/etc/rabbitmq/rabbitmq-env.conf</code>,
          the Homebrew prefix is usually <code>/usr/local</code>
        </li>
        <li><b>Windows</b> - <code>`%APPDATA%`\RabbitMQ\rabbitmq-env-conf.bat</code></li>
      </ul>
    </td>
    <td>
      Location of the file that contains environment variable definitions (without the <code>RABBITMQ_</code>
      prefix). Note that the file name on Windows is different from other operating systems.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_USE_LONGNAME</td>
    <td></td>
    <td>
      When set to <code>true</code> this will cause RabbitMQ
      to use fully qualified names to identify nodes. This
      may prove useful on EC2. Note that it is not possible
      to switch between using short and long names without
      resetting the node.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVICENAME</td>
    <td><b>Windows Service:</b>
      RabbitMQ</td>
    <td>
      The name of the installed service. This will appear in
      <code>services.msc</code>.
  </td>
  </tr>

  <tr>
    <td>RABBITMQ_CONSOLE_LOG</td>
    <td><b>Windows Service:</b></td>
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
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_CODE_PATH</td>
    <td>None</td>
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
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_CTL_ERL_ARGS</td>
    <td>None</td>
    <td>
      Parameters for the <code>erl</code> command used when invoking
      <code>rabbitmqctl</code>. This could be set to specify a range
      of ports to use for Erlang distribution:<br/>
      <code>-kernel inet_dist_listen_min 35672</code><br/>
      <code>-kernel inet_dist_listen_max 35680</code>
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_ERL_ARGS</td>
    <td>
      <ul>
        <li><b>Unix*:</b>
          <code>+P 1048576 +t 5000000 +stbt db +zdbbl 32000</code>
        </li>
        <li><b>Windows:</b> None</li>
      </ul>
    </td>
    <td>
      Standard parameters for the <code>erl</code> command used when
      invoking the RabbitMQ Server. This should be overridden for
      debugging purposes only. Overriding this variable
      <em>replaces</em> the default value.
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS</td>
    <td>
      <ul>
        <li><b>Unix*:</b> None</li>
        <li><b>Windows:</b> None</li>
      </ul>
    </td>
    <td>
      Additional parameters for the <code>erl</code> command used when
      invoking the RabbitMQ Server. The value of this variable
      is appended to the default list of arguments (<code>RABBITMQ_SERVER_ERL_ARGS</code>).
    </td>
  </tr>

  <tr>
    <td>RABBITMQ_SERVER_START_ARGS</td>
    <td>None</td>
    <td>
      Extra parameters for the <code>erl</code> command used when
      invoking the RabbitMQ Server. This will not override
      <code>RABBITMQ_SERVER_ERL_ARGS</code>.
    </td>
  </tr>
</table>

Besides the variables listed above, there are several environment variables which
tell RabbitMQ <a href="relocate.html">where to locate its
database, log files, plugins, configuration etc</a>.

Finally, some environment variables are operating system-specific.

<table>
  <th>Name</th><th>Default</th><th>Description</th>

  <tr>
    <td>HOSTNAME</td>
    <td><ul>
        <li>Unix, Linux: <code>env hostname</code></li>
        <li>MacOS: <code>env hostname -s</code></li>
      </ul>
    </td>
    <td>The name of the current machine</td>
  </tr>

  <tr>
    <td>COMPUTERNAME</td>
    <td>Windows: localhost</td>
    <td>The name of the current machine</td>
  </tr>

  <tr>
    <td>ERLANG_SERVICE_MANAGER_PATH</td>
    <td>Windows Service:
      <code>%ERLANG_HOME%\erts-<var>x.x.x</var>\bin</code>
    </td>
    <td>
      This path is the location of <code>erlsrv.exe</code>,
      the Erlang service wrapper script.
    </td>
  </tr>
</table>
