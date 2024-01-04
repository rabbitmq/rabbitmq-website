# Logging

## <a id="overview" class="anchor" href="#overview">Overview</a>

Log files is a very important aspect of system observability,
much like [monitoring](monitoring.html).

Developers and operators should inspect logs when troubleshooting an issue or assessing the
state of the system.

RabbitMQ supports a number of features when it comes to logging.

This guide covers topics such as:

 * Supported [log outputs](#log-outputs): [file](#logging-to-a-file) and [standard streams (console)](#logging-to-console)
 * [Log file location](#log-file-location)
 * Supported [log levels](#log-levels)
 * How to [activate debug logging](#debug-logging)
 * How to [tail logs of a running node](#log-tail) without having access to the log file
 * Watching [internal events](#internal-events)
 * [Connection lifecycle events](#logged-events) logged
 * [Logging in JSON](#json)
 * [Log categories](#log-message-categories)
 * How to [inspect service logs](#service-logs) on systemd-based Linux systems
 * [Log rotation](#log-rotation)
 * [Logging to Syslog](#logging-to-syslog)
 * [Logging to a system topic exchange](#log-exchange), `amq.rabbitmq.log`

and more.

## <a id="log-outputs" class="anchor" href="#log-outputs">Log Outputs</a>

RabbitMQ nodes can log to multiple outputs. [Logging to a file](#logging-to-a-file) is
one of the most common options for RabbitMQ installations.

[Logging to standard output and error streams](#logging-to-console) is another popular option.
[Syslog](#logging-to-syslog)
is a yet another one supported out of the box.

Different outputs can have different log levels. For example, the console output can log all
messages including debug information  while the file output can only log error and higher severity
messages.

## <a id="default-output" class="anchor" href="#default-output">Default Log Output and Behavior</a>

Nodes [log to a file](#logging-to-a-file) by default, if no outputs are explicitly configured.
If some are configured, they will be used.

RabbitMQ versions prior to 3.9.0 would always log to a file unless explicitly configured
not to do so. With later versions, the same behavior can be achieved by explicitly
listing a file output next to other desired log outputs, such as the standard stream one.

## <a id="log-file-location" class="anchor" href="#log-file-location">Log File Location</a>

Please see the [File and Directory Location](relocate.html) guide to find default log file location for various platforms.

There are two ways to configure log file location. One is the [configuration file](configure.html). This option is recommended.
The other is the `RABBITMQ_LOGS` environment variable. It can be useful in development environments.

Use [RabbitMQ management UI](management.html) or [`rabbitmq-diagnostics -q log_location`](cli.html)
to find when a node stores its log file(s).

The `RABBITMQ_LOGS` variable value can be either a file path or a hyphen (`-`).
`RABBITMQ_LOGS=-` will result in all log messages being sent to standard output.
See [Logging to Console (Standard Output)](#logging-to-console).

The environment variable takes precedence over the configuration file. When in doubt, consider
overriding log file location via the config file. As a consequence of the environment variable precedence,
if the environment variable is set, the configuration key `log.file` will not have any effect.


## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

RabbitMQ starts logging early on node start. See the [Configuration guide](configure.html)
for a general overview of how to configure RabbitMQ.

### <a id="logging-to-a-file" class="anchor" href="#logging-to-a-file">Logging to a File</a>

Logging to a file is one of the most common options for RabbitMQ installations. In modern releases,
RabbitMQ nodes only log to a file if explicitly configured to do so using
the configuration keys listed below:

 * `log.file`: log file path or `false` to deactivate the file output. Default value is taken from the `RABBITMQ_LOGS` [environment variable or configuration file](configure.html)
 * `log.file.level`: log level for the file output. Default level is `info`
 * `log.file.formatter`: controls log entry format, text lines or JSON
 * `log.file.rotation.date`, `log.file.rotation.size`, `log.file.rotation.count` for log file rotation settings
 * `log.file.formatter.time_format`: controls timestamp formatting

The following example overrides log file name:

<pre class="lang-ini">
log.file = rabbit.log
</pre>

The following example overrides log file location:

<pre class="lang-ini">
log.file = /opt/custom/var/log/rabbit.log
</pre>

The following example instructs RabbitMQ to log to a file at the `debug` level:

<pre class="lang-ini">
log.file.level = debug
</pre>

Supported log levels ca be found in the [example rabbitmq.conf file](https://github.com/rabbitmq/rabbitmq-server/blob/v3.9.x/deps/rabbit/docs/rabbitmq.conf.example).

Logging to a file can be deactivated with

<pre class="lang-ini">
log.file = false
</pre>

Logging in JSON format to a file:

<pre class="lang-ini">
log.file.formatter = json
</pre>

By default, RabbitMQ will use RFC 3339 timestamp format. It is possible
to switch to a UNIX epoch-based format:

<pre class="lang-ini">
log.file = true
log.file.level = info

# use microseconds since UNIX epoch for timestamp format
log.file.formatter.time_format = epoch_usecs
</pre>

The rest of this guide describes more options, including [more advanced ones](#advanced-configuration).

### <a id="log-rotation" class="anchor" href="#log-rotation">Log Rotation</a>

RabbitMQ nodes always append to the log files, so a complete log history is preserved.
Log file rotation is not performed by default. [Debian](install-debian.html) and [RPM](install-rpm.html) packages will set up
log [rotation via `logrotate`](#logrotate) after package installation.

`log.file.rotation.date`, `log.file.rotation.size`, `log.file.rotation.count` settings control log file rotation
for the file output.

#### Built-in Periodic Rotation

Use `log.file.rotation.date` to set up minimalistic periodic rotation:

<pre class="lang-ini">
# rotate every night at midnight
log.file.rotation.date = $D0

# keep up to 5 archived log files in addition to the current one
log.file.rotation.count = 5
</pre>

<pre class="lang-ini">
# rotate every day at 23:00 (11:00 p.m.)
log.file.rotation.date = $D23
</pre>

<pre class="lang-ini">
# rotate every night at midnight
log.file.rotation.date = $D0
</pre>

#### Built-in File Size-based Rotation

`log.file.rotation.size` controls rotation based on the current log file size:

<pre class="lang-ini">
# rotate when the file reaches 10 MiB
log.file.rotation.size = 10485760

# keep up to 5 archived log files in addition to the current one
log.file.rotation.count = 5
</pre>

#### <a id="logrotate" class="anchor" href="#logrotate">Rotation Using Logrotate</a>

On Linux, BSD and other UNIX-like systems, [logrotate](https://linux.die.net/man/8/logrotate) is an alternative
way of log file rotation and compression.

RabbitMQ [Debian](./install-debian.html) and [RPM](./install-rpm.html) packages will set up `logrotate` to run weekly on files
located in default `/var/log/rabbitmq` directory. Rotation configuration can be found in `/etc/logrotate.d/rabbitmq-server`.


### <a id="logging-to-console" class="anchor" href="#logging-to-console">Logging to Console (Standard Output)</a>

Logging to standard streams (console) is another popular option for RabbitMQ installations,
in particular when RabbitMQ nodes are deployed in containers.
RabbitMQ nodes only log to standard streams if explicitly configured to do so.

Here are the main settings that control console (standard output) logging:

 * `log.console` (boolean): set to `true` to activate console output. Default is `false
 * `log.console.level`: log level for the console output. Default level is `info`
 * `log.console.formatter`: controls log entry format, text lines or JSON
 * `log.console.formatter.time_format`: controls timestamp formatting

To activate console logging, use the following config snippet:

<pre class="lang-ini">
log.console = true
</pre>

The following example deactivates console logging

<pre class="lang-ini">
log.console = false
</pre>

The following example instructs RabbitMQ to use the `debug` logging level when logging to console:

<pre class="lang-ini">
log.console.level = debug
</pre>

Supported log levels ca be found in the [example rabbitmq.conf file](https://github.com/rabbitmq/rabbitmq-server/blob/v3.9.x/deps/rabbit/docs/rabbitmq.conf.example).

Logging to console in JSON format:

<pre class="lang-ini">
log.console.formatter = json
</pre>

When console output is activated, the file output will also be activated by default.
To deactivate the file output, set `log.file` to `false`:

<pre class="lang-ini">
log.console = true
log.console.level = info

log.file = false
</pre>

By default, RabbitMQ will use RFC 3339 timestamp format. It is possible
to switch to a UNIX epoch-based format:

<pre class="lang-ini">
log.console = true
log.console.level = info

log.file = false

# use microseconds since UNIX epoch for timestamp format
log.console.formatter.time_format = epoch_usecs
</pre>

Please note that `RABBITMQ_LOGS=-` will deactivate the file output
even if `log.file` is configured.

### <a id="logging-to-syslog" class="anchor" href="#logging-to-syslog">Logging to Syslog</a>

RabbitMQ logs can be forwarded to a Syslog server via TCP or UDP. UDP is used by default
and **requires Syslog service configuration**. TLS is also supported.

Syslog output has to be explicitly configured:

<pre class="lang-ini">
log.syslog = true
</pre>

#### Syslog Endpoint Configuration

By default the Syslog logger will send log messages to UDP port 514 using
the [RFC 3164](https://www.ietf.org/rfc/rfc3164.txt) protocol. [RFC 5424](https://tools.ietf.org/html/rfc5424)
protocol also can be used.

In order to use UDP the **Syslog service must have UDP input configured**.

UDP and TCP transports can be used with both RFC 3164 and RFC 5424 protocols.
TLS support requires the RFC 5424 protocol.

The following example uses TCP and the RFC 5424 protocol:

<pre class="lang-ini">
log.syslog = true
log.syslog.transport = tcp
log.syslog.protocol = rfc5424
</pre>

To use TLS, a standard set of <a href="ssl.html">TLS options</a> must be provided:

<pre class="lang-ini">
log.syslog = true
log.syslog.transport = tls
log.syslog.protocol = rfc5424

log.syslog.ssl_options.cacertfile = /path/to/ca_certificate.pem
log.syslog.ssl_options.certfile = /path/to/client_certificate.pem
log.syslog.ssl_options.keyfile = /path/to/client_key.pem
</pre>

Syslog service IP address and port can be customised:

<pre class="lang-ini">
log.syslog = true
log.syslog.ip = 10.10.10.10
log.syslog.port = 1514
</pre>

If a hostname is to be used rather than an IP address:

<pre class="lang-ini">
log.syslog = true
log.syslog.host = my.syslog-server.local
log.syslog.port = 1514
</pre>

Syslog metadata identity and facility values also can be configured.
By default identity will be set to the name part of the node name (for example, `rabbitmq` in `rabbitmq@hostname`)
and facility will be set to `daemon`.

To set identity and facility of log messages:

<pre class="lang-ini">
log.syslog = true
log.syslog.identity = my_rabbitmq
log.syslog.facility = user
</pre>

Logging to Syslog in JSON format:

<pre class="lang-ini">
log.syslog = true

log.syslog.formatter = json
</pre>

Less commonly used [Syslog client](https://github.com/schlagert/syslog) options can
be configured using the <a href="./configure.html#configuration-files">advanced config file</a>.


## <a id="json" class="anchor" href="#json">JSON Logging</a>

RabbitMQ nodes can format log messages as JSON, which can be convenient for parsing by other pieces of software.

Logging to a file in JSON format:

<pre class="lang-ini">
log.file.level = info
log.file.formatter = json
</pre>

Logging to the console in JSON format:

<pre class="lang-ini">
log.console = true
log.console.level = info
log.console.formatter = json

log.file = false
</pre>

Logging to Syslog in JSON format:

<pre class="lang-ini">
log.syslog = true

log.syslog.formatter = json
</pre>

## <a id="log-message-categories" class="anchor" href="#log-message-categories">Log Message Categories</a>

RabbitMQ has several categories of messages, which can be logged with different
levels or to different files.

The categories replace the `rabbit.log_levels` configuration setting in versions
earlier than 3.7.0.

The categories are:

 * `connection`: [connection lifecycle events](#connection-lifecycle-events) for AMQP 0-9-1, AMQP 1.0, MQTT and STOMP.
 * `channel`: channel logs. Mostly errors and warnings on AMQP 0-9-1 channels.
 * `queue`: queue logs. Mostly debug messages.
 * `mirroring`: queue mirroring logs. Queue mirrors status changes: starting/stopping/synchronizing.
 * `federation`: federation plugin logs.
 * `upgrade`: verbose upgrade logs. These can be excessive.
 * `default`: all other log entries. You cannot override file location for this category.

It is possible to configure a different log level or file location for each message category
using `log.<category>.level` and `log.<category>.file` configuration variables.

By default each category will not filter by level. If an is output configured to log `debug`
messages, the debug messages will be printed for all categories. Configure a log level for a
category to override.

For example, given debug level in the file output,
the following will deactivate debug logging for connection events:

<pre class="lang-ini">
log.file.level = debug
log.connection.level = info
</pre>

To redirect all federation logs to the `rabbit_federation.log` file, use:

<pre class="lang-ini">
log.federation.file = rabbit_federation.log
</pre>

To deactivate a log type, you can use the `none` log level. For example, to deactivate
upgrade logs:

<pre class="lang-ini">
log.upgrade.level = none
</pre>

### <a id="log-levels" class="anchor" href="#log-levels">Log Levels</a>

Log levels is another way to filter and tune logging. Log levels have
a strict ordering. Each log message has a severity from `debug` being
the lowest severity to `critical` being the highest.

Logging verbosity can be controlled on multiple layers by setting log
levels for categories and outputs. More verbose log levels will
include more log messages from `debug` being the most verbose to
`none` being the least.

The following log levels are used by RabbitMQ:

| Log level  | Verbosity     | Severity         |
|------------|---------------|------------------|
| `debug`    | most verbose  | lowest severity  |
| `info`     |               |                  |
| `warning`  |               |                  |
| `error`    |               |                  |
| `critical` |               | highest severity |
| `none`     | least verbose | not applicable   |

Default log level is `info`.

If a log message has lower severity than the category level,
the message will be dropped and not sent to any output.

If a category level is not configured, its messages will always be sent
to all outputs.

To make the `default` category log only errors or higher severity messages, use

<pre class="lang-ini">
log.default.level = error
</pre>

The `none` level means no logging.

Each output can use its own log level. If a message
has lower severity than the output level, the message will not be logged.

For example, if no outputs are configured to log
`debug` messages, even if the category level is set to `debug`, the
debug messages will not be logged.

On the other hand, if an output is configured to log `debug` messages,
it will get them from all categories, unless a category is configured
with a less verbose level.

#### <a id="changing-log-level" class="anchor" href="#changing-log-level">Changing Log Level</a>

There are two ways of changing effective log levels:

 * Via [configuration file(s)](configure.html): this is more flexible but requires
   a node restart between changes
 * Using [CLI tools](./cli.html), `rabbitmqctl set_log_level &lt;level&gt;`: the changes are transient (will not survive node restart) but can be used to
   activate and deactivate, for example, [debug logging](#debug-logging) at runtime for a period of time.

To set log level to `debug` on a running node:

<pre class="lang-bash">
rabbitmqctl -n rabbit@target-host set_log_level debug
</pre>

To set the level to `info`:

<pre class="lang-bash">
rabbitmqctl -n rabbit@target-host set_log_level info
</pre>


## <a id="log-tail" class="anchor" href="#log-tail">Tailing Logs Using CLI Tools</a>

Modern releases support tailing logs of a node using [CLI tools](./cli.html). This is convenient
when log file location is not known or is not easily accessible but CLI tool connectivity
is allowed.

To tail three hundred last lines on a node `rabbitmq@target-host`, use `rabbitmq-diagnostics log_tail`:

<pre class="lang-bash">
# This is semantically equivalent to using `tail -n 300 /path/to/rabbit@hostname.log`.
# Use -n to specify target node, -N is to specify the number of lines.
rabbitmq-diagnostics -n rabbit@target-host log_tail -N 300
</pre>

This will load and print last lines from the log file.
If only console logging is activated, this command will fail with a "file not found" (`enoent`) error.

To continuously inspect as a stream of log messages as they are appended to a file,
similarly to `tail -f` or console logging, use `rabbitmq-diagnostics log_tail_stream`:

<pre class="lang-bash">
# This is semantically equivalent to using `tail -f /path/to/rabbit@hostname.log`.
# Use Control-C to stop the stream.
rabbitmq-diagnostics -n rabbit@target-host log_tail_stream
</pre>

This will continuously tail and stream lines added to the log file.
If only console logging is activated, this command will fail with a "file not found" (`enoent`) error.

The `rabbitmq-diagnostics log_tail_stream` command can only be used against a running RabbitMQ node
and will fail if the node is not running or the RabbitMQ application on it
was stopped using `rabbitmqctl stop_app`.


## <a id="debug-logging" class="anchor" href="#debug-logging">Activating Debug Logging</a>

To activate debug messages, you should have a debug output.

For example to log debug messages to a file:

<pre class="lang-ini">
log.file.level = debug
</pre>

To print log messages to standard I/O streams:

<pre class="lang-ini">
log.console = true
log.console.level = debug
</pre>

To switch to debug logging at runtime:

<pre class="lang-bash">
rabbitmqctl -n rabbit@target-host set_log_level debug
</pre>

To set the level back to `info`:

<pre class="lang-bash">
rabbitmqctl -n rabbit@target-host set_log_level info
</pre>

It is possible to deactivate debug logging for some categories:

<pre class="lang-ini">
log.file.level = debug

log.connection.level = info
log.channel.level = info
</pre>


## <a id="service-logs" class="anchor" href="#service-logs">Service Logs</a>

On `systemd`-based Linux distributions, system service logs can be
inspected using `journalctl --system`

<pre class="lang-bash">
journalctl --system
</pre>

which requires superuser privileges.
Its output can be filtered to narrow it down to RabbitMQ-specific entries:

<pre class="lang-bash">
sudo journalctl --system | grep rabbitmq
</pre>

Service logs will include standard output and standard error streams of the node.
The output of <code>journalctl --system</code> will look similar to this:

<pre class="lang-plaintext">
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##      RabbitMQ 3.11.6. Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##########  Licensed under the MPL.  See https://www.rabbitmq.com/
Dec 26 11:03:04 localhost rabbitmq-server[968]: ######  ##
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##########  Logs: /var/log/rabbitmq/rabbit@localhost.log
Dec 26 11:03:04 localhost rabbitmq-server[968]: /var/log/rabbitmq/rabbit@localhost_upgrade.log
Dec 26 11:03:04 localhost rabbitmq-server[968]: Starting broker...
Dec 26 11:03:05 localhost rabbitmq-server[968]: systemd unit for activation check: "rabbitmq-server.service"
Dec 26 11:03:06 localhost rabbitmq-server[968]: completed with 6 plugins.
</pre>


## <a id="logged-events" class="anchor" href="#logged-events">Logged Events</a>

### <a id="connection-lifecycle-events" class="anchor" href="#connection-lifecycle-events">Connection Lifecycle Events</a>

Successful TCP connections that send at least 1 byte of data will be logged. Connections
that do not send any data, such as health checks of certain load balancer products, will
not be logged.

Here's an example:

<pre class="lang-plaintext">
2018-11-22 10:44:33.654 [info] &lt;0.620.0&gt; accepting AMQP connection &lt;0.620.0&gt; (127.0.0.1:52771 -> 127.0.0.1:5672)
</pre>

The entry includes client IP address and port (<code>127.0.0.1:52771</code>) as well as the target
IP address and port of the server (<code>127.0.0.1:5672</code>). This information can be useful
when troubleshooting client connections.

Once a connection successfully authenticates and is granted access to a [virtual host](./vhosts.html),
that is also logged:

<pre class="lang-plaintext">
2018-11-22 10:44:33.663 [info] &lt;0.620.0&gt; connection &lt;0.620.0&gt; (127.0.0.1:52771 -> 127.0.0.1:5672): user 'guest' authenticated and granted access to vhost '/'
</pre>

The examples above include two values that can be used as connection identifiers
in various scenarios: connection name (`127.0.0.1:57919 -> 127.0.0.1:5672`) and an Erlang process ID of the connection (`&lt;0.620.0&gt;`).
The latter is used by [rabbitmqctl](./cli.html) and the former is used by the [HTTP API](./management.html).

A [client connection](connections.html) can be closed cleanly or abnormally. In the
former case the client closes AMQP 0-9-1 (or 1.0, or STOMP, or
MQTT) connection gracefully using a dedicated library function
(method). In the latter case the client closes TCP connection
or TCP connection fails. RabbitMQ will log both cases.

Below is an example entry for a successfully closed connection:

<pre class="lang-plaintext">
2018-06-17 06:23:29.855 [info] &lt;0.634.0&gt; closing AMQP connection &lt;0.634.0&gt; (127.0.0.1:58588 -&gt; 127.0.0.1:5672, vhost: '/', user: 'guest')
</pre>

Abruptly closed connections will be logged as warnings:

<pre class="lang-plaintext">
2018-06-17 06:28:40.868 [warning] &lt;0.646.0&gt; closing AMQP connection &lt;0.646.0&gt; (127.0.0.1:58667 -&gt; 127.0.0.1:5672, vhost: '/', user: 'guest'):
client unexpectedly closed TCP connection
</pre>

Abruptly closed connections can be harmless. For example, a short lived program can naturally stop
and don't have a chance to close its connection. They can also hint at a genuine issue such as
a failed application process or a proxy that closes TCP connections it considers to be idle.


## <a id="upgrading" class="anchor" href="#upgrading">Upgrading From pre-3.7 Versions</a>

RabbitMQ versions prior to 3.7.0 had a different logging subsystem.

Older installations use two log files:
`<nodename>.log` and `<nodename>_sasl.log` (`<nodename>` is `rabbit@{hostname}` by default).

Where `<nodename>.log` contains RabbitMQ logs, while `<nodename>_sasl.log` contains
runtime logs, mostly unhandled exceptions.

Starting with 3.7.0 these two files were merged and all errors now can be found in
the `<nodename>.log` file. So `RABBITMQ_SASL_LOGS` environment variable is not used
anymore.

Log levels in versions before `3.7.0` were configured using the `log_levels` configuration key.
Starting with `3.7.0` it's been replaced with [categories](#log-message-categories),
which are more descriptive and powerful.

If the `log_levels` key is present in `rabbitmq.config` file, it should be updated to
[use categories](#log-message-categories).

`rabbit.log_levels` will work in 3.7.0 **only** if no `categories` are defined.


## <a id="internal-events" class="anchor" href="#internal-events">Watching Internal Events</a>

RabbitMQ nodes have an internal mechanism. Some of its events can be of interest for monitoring,
audit and troubleshooting purposes. They can be consumed as JSON objects using a `rabbitmq-diagnostics` command:

<pre class="lang-bash">
# will emit JSON objects
rabbitmq-diagnostics consume_event_stream
</pre>

When used interactively, results can be piped to a command line JSON processor such as [jq](https://stedolan.github.io/jq/):

<pre class="lang-bash">
rabbitmq-diagnostics consume_event_stream | jq
</pre>

The events can also be exposed to applications for [consumption](./consumers.html)
with [a plugin](event-exchange.html).

Events are published as messages with blank bodies. All event metadata is stored in
message metadata (properties, headers).

Below is a list of published events.

### Core Broker

[Queue](queues.html), Exchange and Binding events:

 * `queue.deleted`
 * `queue.created`
 * `exchange.created`
 * `exchange.deleted`
 * `binding.created`
 * `binding.deleted`

[Connection](connections.html) and [Channel](channels.html) events:

 * `connection.created`
 * `connection.closed`
 * `channel.created`
 * `channel.closed`

[Consumer](./consumers.html) events:

 * `consumer.created`
 * `consumer.deleted`

[Policy and Parameter](./parameters.html) events:

 * `policy.set`
 * `policy.cleared`
 * `parameter.set`
 * `parameter.cleared`

[Virtual host](./vhosts.html) events:

 * `vhost.created`
 * `vhost.deleted`
 * `vhost.limits.set`
 * `vhost.limits.cleared`

User management events:

 * `user.authentication.success`
 * `user.authentication.failure`
 * `user.created`
 * `user.deleted`
 * `user.password.changed`
 * `user.password.cleared`
 * `user.tags.set`

[Permission](./access-control.html) events:

 * `permission.created`
 * `permission.deleted`
 * `topic.permission.created`
 * `topic.permission.deleted`

[Alarm](./alarms.html) events:

 * `alarm.set`
 * `alarm.cleared`

### [Shovel Plugin](shovel.html)

Worker events:

 * `shovel.worker.status`
 * `shovel.worker.removed`

### [Federation Plugin](federation.html)

Link events:

 * `federation.link.status`
 * `federation.link.removed`


## <a id="log-exchange" class="anchor" href="#log-exchange">Consuming Log Entries Using a System Log Exchange</a>

RabbitMQ can forward log entries to a system exchange, `amq.rabbitmq.log`, which
will be declared in the default [virtual host](vhosts.html).

This feature is deactivated by default.
To activate this logging, set the `log.exchange` configuration key to `true`:

<pre class="lang-ini">
# activate log forwarding to amq.rabbitmq.log, a topic exchange
log.exchange = true
</pre>

`log.exchange.level` can be used to control the [log level](#log-levels) that
will be used by this logging target:

<pre class="lang-ini">
log.exchange = true
log.exchange.level = warning
</pre>


`amq.rabbitmq.log` is a regular topic exchange and can be used as such.
Log entries are published as messages. Message body contains the logged message
and routing key is set to the log level.

Application that would like to consume log entries need to declare a queue
and bind it to the exchange, using a routing key to filter a specific log level,
or `#` to consume all log entries allowed by the configured log level.
