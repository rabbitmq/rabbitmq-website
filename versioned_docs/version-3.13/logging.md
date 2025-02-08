---
title: Logging
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Logging

## Overview {#overview}

Log files is a very important aspect of system observability,
much like [monitoring](./monitoring).

RabbitMQ starts logging early on node start. Many important pieces of information
about node's state and configuration will be logged during or after node boot.

Developers and operators should inspect logs when troubleshooting an issue or assessing the state of the system.

RabbitMQ supports a number of features when it comes to logging.

This guide covers topics such as:

 * What [will and will not be logged](#scope) by RabbitMQ nodes
 * Supported [log outputs](#log-outputs): [file](#logging-to-a-file) and [standard streams (console)](#logging-to-console)
 * [Log file location](#log-file-location)
 * Supported [log levels](#log-levels)
 * How to [activate debug logging](#debug-logging)
 * How to [tail logs of a running node](#log-tail) without having access to the log file
 * Watching [internal events](#internal-events)
 * [Connection lifecycle events](#logged-events) logged
 * [Logging in JSON](#json)
 * [Log categories](#log-message-categories)
 * [Advanced log formatting](#advanced-formatting)
 * How to [inspect service logs](#service-logs) on systemd-based Linux systems
 * [Log rotation](#log-rotation)
 * [Logging to Syslog](#logging-to-syslog)
 * [Logging to a system topic exchange](#log-exchange), `amq.rabbitmq.log`

and more.


## What Will and Will Not Be Logged? {#scope}

RabbitMQ nodes many different kinds of events, in fact, too many to name.
However, there are several categories of events that are not logged by design.
In most cases, these events are related to individual messages, whose high rates:
tens or hundreds of thousands per seconds, or even millions with [streams](./streams) and superstreams:

 * Message routing
 * Message delivery to consumers
 * Message acknowledgements by consumers
 * Unroutable messages, both returned and dropped
 * Consumer registration and cancelation

A significant majority of errors related to these events, such as [double acknowledgements of a delivery](./confirms#consumer-acks-double-acking), will be logged.

In order to reason about message routing, ingress (publishing) and egress (delivery to consumers) rates,
consumer events, and unroutable messages, use [metrics](./monitoring), [watch internal events](#internal-events),
adopt relevant [client library features](./publishers#unroutable), and [take and inspect a traffic capture](/amqp-wireshark).


## Log Outputs {#log-outputs}

RabbitMQ nodes can log to multiple outputs. [Logging to a file](#logging-to-a-file) is
one of the most common options for RabbitMQ installations.

[Logging to standard output and error streams](#logging-to-console) is another popular option.
[Syslog](#logging-to-syslog)
is a yet another one supported out of the box.

Different outputs can have different log levels. For example, the console output can log all
messages including debug information  while the file output can only log error and higher severity
messages.

## Default Log Output and Behavior {#default-output}

Nodes [log to a file](#logging-to-a-file) by default, if no outputs are explicitly configured.
If some are configured, they will be used.

If logging to a file plus another output is necessary,
a file output must be explicitly listed next to the other desired log outputs,
for example, the standard stream one.

## Log File Location {#log-file-location}

There are two ways to configure log file location. One is the [configuration file](./configure). This option is recommended.
The other is the `RABBITMQ_LOGS` environment variable. It can be useful in development environments.

:::warning
`RABBITMQ_LOGS` cannot be combined with the configuration file settings. When `RABBITMQ_LOGS`
is set, the logging-related settings from `rabbitmq.conf` will be effectively ignored.
:::

See the [File and Directory Location](./relocate) guide to find default log file location for various platforms.

Log file location can be found in the [RabbitMQ management UI](./management) on the node page
as well as using [`rabbitmq-diagnostics`](./cli):

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmq-diagnostics -q log_location
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmq-diagnostics.bat -q log_location
```
</TabItem>
<TabItem value="cmd" label="cmd">
```batch
rabbitmq-diagnostics.bat -q log_location
```
</TabItem>
</Tabs>

The `RABBITMQ_LOGS` variable value can be either a file path or a hyphen (`-`).
Setting the value to a hyphen like so

``` bash
# Instructs the node to log to standard streams.
# IMPORTANT: the environment variable takes precedence over the configuration file.
# When it is set, all logging-related rabbitmq.conf settings will be
# effectively ignored.
RABBITMQ_LOGS=-
```
the node will send all log messages to [standard I/O streams](#logging-to-console), namely to standard output.

:::important
The environment variable takes precedence over the configuration file. When it is set,
all logging-related `rabbitmq.conf` settings will be effectively ignored.

The recommended way of overriding log file location is [via `rabbitmq.conf`](#logging-to-a-file).
:::


## How Logging is Configured {#configuration}

Several sections below cover various configuration settings related to logging.
They all use `rabbitmq.conf`, the modern configuration format.

See the [Configuration guide](./configure) for a general overview of how to configure RabbitMQ.

## Logging to a File {#logging-to-a-file}

Logging to a file is one of the most common options for RabbitMQ installations. In modern releases,
RabbitMQ nodes only log to a file if explicitly configured to do so using
the configuration keys listed below:

 * `log.file`: log file path or `false` to deactivate the file output. Default value is taken from the `RABBITMQ_LOGS` [environment variable or configuration file](./configure)
 * `log.file.level`: log level for the file output. Default level is `info`
 * `log.file.formatter`: controls log entry format, text lines or JSON
 * `log.file.rotation.date`, `log.file.rotation.size`, `log.file.rotation.count` for log file rotation settings
 * `log.file.formatter.time_format`: controls timestamp formatting

The following example overrides log file name:

```ini
log.file = rabbit.log
```

The following example overrides log file location:

```ini
log.file = /opt/custom/var/log/rabbit.log
```

The following example instructs RabbitMQ to log to a file at the `debug` level:

```ini
log.file.level = debug
```

For a list of supported log levels, see [Log Levels](#log-levels).

Logging to a file can be deactivated with

```ini
log.file = false
```

Logging in JSON format to a file:

```ini
log.file.formatter = json
```

By default, RabbitMQ will use RFC 3339 timestamp format. It is possible
to switch to a UNIX epoch-based format:

```ini
log.file = true
log.file.level = info

# use microseconds since UNIX epoch for timestamp format
log.file.formatter.time_format = epoch_usecs
```

The rest of this guide describes more options, including more advanced ones.

## Log Rotation {#log-rotation}

:::info

When logging to a file, the recommended rotation option is `logrotate`

:::

RabbitMQ nodes always append to the log files, so a complete log history is preserved.
Log file rotation is not performed by default. [Debian](./install-debian) and [RPM](./install-rpm) packages will set up
log [rotation via `logrotate`](#logrotate) after package installation.

`log.file.rotation.date`, `log.file.rotation.size`, `log.file.rotation.count` settings control log file rotation
for the file output.

### Rotation Using Logrotate {#logrotate}

On Linux, BSD and other UNIX-like systems, [logrotate](https://linux.die.net/man/8/logrotate) is a widely used
log file rotation tool. It is very mature and supports a lot of options.

RabbitMQ [Debian](./install-debian) and [RPM](./install-rpm) packages will set up `logrotate` to run weekly on files
located in default `/var/log/rabbitmq` directory. Rotation configuration can be found in `/etc/logrotate.d/rabbitmq-server`.

### Built-in Periodic Rotation

:::warning
`log.file.rotation.date` cannot be combined with `log.file.rotation.size`, the two
options are mutually exclusive
:::

Use `log.file.rotation.date` to set up minimalistic periodic rotation:

```ini
# rotate every night at midnight
log.file.rotation.date = $D0

# keep up to 5 archived log files in addition to the current one
log.file.rotation.count = 5

# archived log files will be compressed
log.file.rotation.compress = true
```

```ini
# rotate every day at 23:00 (11:00 p.m.)
log.file.rotation.date = $D23
```

### Built-in File Size-based Rotation

:::warning
`log.file.rotation.size` cannot be combined with `log.file.rotation.date`, the two
options are mutually exclusive
:::

`log.file.rotation.size` controls rotation based on the current log file size:

```ini
# rotate when the file reaches 10 MiB
log.file.rotation.size = 10485760

# keep up to 5 archived log files in addition to the current one
log.file.rotation.count = 5

# archived log files will be compressed
log.file.rotation.compress = true
```


## Logging to Console (Standard Output) {#logging-to-console}

Logging to standard streams (console) is another popular option for RabbitMQ installations,
in particular when RabbitMQ nodes are deployed in containers.
RabbitMQ nodes only log to standard streams if explicitly configured to do so.

Here are the main settings that control console (standard output) logging:

 * `log.console` (boolean): set to `true` to activate console output. Default is `false
 * `log.console.level`: log level for the console output. Default level is `info`
 * `log.console.formatter`: controls log entry format, text lines or JSON
 * `log.console.formatter.time_format`: controls timestamp formatting

To activate console logging, use the following config snippet:

```ini
log.console = true
```

The following example deactivates console logging

```ini
log.console = false
```

The following example instructs RabbitMQ to use the `debug` logging level when logging to console:

```ini
log.console.level = debug
```

For a list of supported log levels, see [Log Levels](#log-levels).

Logging to console in JSON format:

```ini
log.console.formatter = json
```

When console output is activated, the file output will also be activated by default.
To deactivate the file output, set `log.file` to `false`:

```ini
log.console = true
log.console.level = info

log.file = false
```

By default, RabbitMQ will use RFC 3339 timestamp format. It is possible
to switch to a UNIX epoch-based format:

```ini
log.console = true
log.console.level = info

log.file = false

# use microseconds since UNIX epoch for timestamp format
log.console.formatter.time_format = epoch_usecs
```

Please note that `RABBITMQ_LOGS=-` will deactivate the file output
even if `log.file` is configured.

## Logging to Syslog {#logging-to-syslog}

RabbitMQ logs can be forwarded to a Syslog server via TCP or UDP. UDP is used by default
and **requires Syslog service configuration**. TLS is also supported.

Syslog output has to be explicitly configured:

```ini
log.syslog = true
```

### Syslog Endpoint Configuration

By default the Syslog logger will send log messages to UDP port 514 using
the [RFC 3164](https://www.ietf.org/rfc/rfc3164.txt) protocol. [RFC 5424](https://tools.ietf.org/html/rfc5424)
protocol also can be used.

In order to use UDP the **Syslog service must have UDP input configured**.

UDP and TCP transports can be used with both RFC 3164 and RFC 5424 protocols.
TLS support requires the RFC 5424 protocol.

The following example uses TCP and the RFC 5424 protocol:

```ini
log.syslog = true
log.syslog.transport = tcp
log.syslog.protocol = rfc5424
```

To use TLS, a standard set of <a href="./ssl">TLS options</a> must be provided:

```ini
log.syslog = true
log.syslog.transport = tls
log.syslog.protocol = rfc5424

log.syslog.ssl_options.cacertfile = /path/to/ca_certificate.pem
log.syslog.ssl_options.certfile = /path/to/client_certificate.pem
log.syslog.ssl_options.keyfile = /path/to/client_key.pem
```

Syslog service IP address and port can be customised:

```ini
log.syslog = true
log.syslog.ip = 10.10.10.10
log.syslog.port = 1514
```

If a hostname is to be used rather than an IP address:

```ini
log.syslog = true
log.syslog.host = my.syslog-server.local
log.syslog.port = 1514
```

Syslog metadata identity and facility values also can be configured.
By default identity will be set to the name part of the node name (for example, `rabbitmq` in `rabbitmq@hostname`)
and facility will be set to `daemon`.

To set identity and facility of log messages:

```ini
log.syslog = true
log.syslog.identity = my_rabbitmq
log.syslog.facility = user
```

Logging to Syslog in JSON format:

```ini
log.syslog = true

log.syslog.formatter = json
```

Less commonly used [Syslog client](https://github.com/schlagert/syslog) options can
be configured using the [advanced config file](./configure#configuration-files).


## JSON Logging {#json}

RabbitMQ nodes can format log messages as JSON, which can be convenient for parsing by other pieces of software.

Logging to a file in JSON format:

```ini
log.file.level = info
log.file.formatter = json
```

Logging to the console in JSON format:

```ini
log.console = true
log.console.level = info
log.console.formatter = json

log.file = false
```

Logging to Syslog in JSON format:

```ini
log.syslog = true

log.syslog.formatter = json
```

Note that [JSON object field mapping can be customized](#json-field-mapping) to
match a specific JSON-based logging format expected by the log collection
tooling.


## Log Message Categories {#log-message-categories}

RabbitMQ has several categories of messages, which can be logged with different
levels or to different files. The categories are:

 * `connection`: [connection lifecycle events](#connection-lifecycle-events) for AMQP 0-9-1, AMQP 1.0, MQTT and STOMP.
 * `channel`: channel logs. Mostly errors and warnings on AMQP 0-9-1 channels.
 * `queue`: queue logs. Mostly debug messages.
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

```ini
log.file.level = debug
log.connection.level = info
```

To redirect all federation logs to the `rabbit_federation.log` file, use:

```ini
log.federation.file = rabbit_federation.log
```

To deactivate a log type, you can use the `none` log level. For example, to deactivate
upgrade logs:

```ini
log.upgrade.level = none
```

### Log Levels {#log-levels}

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

The default log level is `info`.

If a log message has lower severity than the category level,
the message will be dropped and not sent to any output.

If a category level is not configured, its messages will always be sent
to all outputs.

To make the `default` category log only errors or higher severity messages, use

```ini
log.default.level = error
```

The `none` level means no logging.

Each output can use its own log level. If a message
has lower severity than the output level, the message will not be logged.

For example, if no outputs are configured to log
`debug` messages, even if the category level is set to `debug`, the
debug messages will not be logged.

On the other hand, if an output is configured to log `debug` messages,
it will get them from all categories, unless a category is configured
with a less verbose level.

#### Changing Log Level {#changing-log-level}

There are two ways of changing effective log levels:

 * Via [configuration file(s)](./configure): this is more flexible but requires
   a node restart between changes
 * Using [CLI tools](./cli), `rabbitmqctl set_log_level <level>`: the changes are transient (will not survive node restart) but can be used to
   activate and deactivate, for example, [debug logging](#debug-logging) at runtime for a period of time.

To set log level to `debug` on a running node:

```bash
rabbitmqctl -n rabbit@target-host set_log_level debug
```

To set the level to `info`:

```bash
rabbitmqctl -n rabbit@target-host set_log_level info
```


## Tailing Logs Using CLI Tools {#log-tail}

Modern releases support tailing logs of a node using [CLI tools](./cli). This is convenient
when log file location is not known or is not easily accessible but CLI tool connectivity
is allowed.

To tail three hundred last lines on a node `rabbitmq@target-host`, use `rabbitmq-diagnostics log_tail`:

```bash
# This is semantically equivalent to using `tail -n 300 /path/to/rabbit@hostname.log`.
# Use -n to specify target node, -N is to specify the number of lines.
rabbitmq-diagnostics -n rabbit@target-host log_tail -N 300
```

This will load and print last lines from the log file.
If only console logging is activated, this command will fail with a "file not found" (`enoent`) error.

To continuously inspect as a stream of log messages as they are appended to a file,
similarly to `tail -f` or console logging, use `rabbitmq-diagnostics log_tail_stream`:

```bash
# This is semantically equivalent to using `tail -f /path/to/rabbit@hostname.log`.
# Use Control-C to stop the stream.
rabbitmq-diagnostics -n rabbit@target-host log_tail_stream
```

This will continuously tail and stream lines added to the log file.
If only console logging is activated, this command will fail with a "file not found" (`enoent`) error.

The `rabbitmq-diagnostics log_tail_stream` command can only be used against a running RabbitMQ node
and will fail if the node is not running or the RabbitMQ application on it
was stopped using `rabbitmqctl stop_app`.


## Activating Debug Logging {#debug-logging}

When debug logging is enabled, the node will log **a lot** of information
that can be useful for troubleshooting. This log severity is meant to be
used when troubleshooting, say, the [peer discovery activity](./cluster-formation).

For example to log debug messages to a file:

```ini
log.file.level = debug
```

To print log messages to standard I/O streams:

```ini
log.console = true
log.console.level = debug
```

To switch to debug logging at runtime:

```bash
rabbitmqctl -n rabbit@target-host set_log_level debug
```

To set the level back to `info`:

```bash
rabbitmqctl -n rabbit@target-host set_log_level info
```

It is possible to deactivate debug logging for some categories:

```ini
log.file.level = debug

log.connection.level = info
log.channel.level = info
```

## Advanced Log Format {#advanced-formatting}

This section covers features related to advanced log formatting. These settings are not necessary
in most environments but can be used to adapt RabbitMQ logging to a specific format.

Most examples in this section use the following format:

``` ini
log.file.formatter.level_format = lc4
```

However, the key can also be one of

1. `log.file.formatter.level_format`
2. `log.console.formatter.level_format`
3. `log.exchange.formatter.level_format`

In other words, most settings documented in this section are not specific to a particular
log output, be it `file`, `console` or `exchange`.

### Time Format

Timestamps format can be set to one of the following formats:

1. `rfc3339_space`: the RFC 3339 format with spaces, this is the default format
2. `rfc3339_T`: same as above but with tabs
3. `epoch_usecs`: timestamp (time since UNIX epoch) in microseconds
4. `epoch_secs`: timestamp (time since UNIX epoch) in seconds

``` ini
# this is the default format
log.file.formatter.time_format = rfc3339_space
```

For example, the following format

``` ini
log.file.formatter.time_format = epoch_usecs
```

will result in log messages that look like this:

```
1728025620684139 [info] <0.872.0> started TCP listener on [::]:5672
1728025620687050 [info] <0.892.0> started TLS (SSL) listener on [::]:5671
```

### Log Level Format

[Log level](#log-levels) can be formatted differently:

``` ini
# full value, lower case is the default format
log.file.formatter.level_format = lc
```

``` ini
# use the four character, upper case format
log.file.formatter.level_format = uc4
```

The following values are valid:

* `lc`: full value, lower case (the default), e.g. `warning` or `info`
* `uc`: full value, upper case, e.g. `WARNING` or `INFO`
* `lc3`: three characters, lower case, e.g. `inf` or `dbg`
* `uc3`: three characters, upper case, e.g. `INF` or `WRN`
* `lc4`: four characters, lower case, e.g. `dbug` or `warn`
* `uc4`: four characters, upper case, e.g. `DBUG` or `WARN`

### Log Message Format

:::warning

This setting should only be used as a last
resort measure when overriding log format is a hard requirement
of log collection tooling

:::

Besides the formatting of individual log message components
(event time, log level, message, and so on), the entire log line format can be changed using
the `` configuration setting.

The setting must be set to a message pattern that uses the following
`$variables`:

* `$time`
* `$level`
* Erlang process `$pid`
* Log `$msg`

This is what the default format looks like:

``` ini
# '$time [$level] $pid $msg' is the default format
log.console.formatter.plaintext.format = $time [$level] $pid $msg
```

The following customized format

``` ini
# '$time [$level] $pid $msg' is the default format
log.console.formatter.plaintext.format = $level $time $msg
```

will produce log messages that look like this:

```
info 2024-10-04 03:23:52.968389-04:00 connection 127.0.0.1:57181 -> 127.0.0.1:5672: user 'guest' authenticated and granted access to vhost '/'
debug 2024-10-04 03:24:03.338466-04:00 Will reconcile virtual host processes on all cluster members...
debug 2024-10-04 03:24:03.338587-04:00 Will make sure that processes of 9 virtual hosts are running on all reachable cluster nodes
```

Notice how the Erlang process pid is excluded. This information can be essential for
root cause analysis (RCA) and therefore the default format is highly recommended.


### JSON Field Mapping {#json-field-mapping}

[JSON logging](#json) can be customized in the following ways:

 * Individual keys can be renamed by using a `{standard key}:{renamed key}` expression
 * Individual keys can be dropped using a `{standard key:-}` expression
 * All keys except for the explicitly listed ones can be dropped using a `*:-` expression

The `log.file.formatter.json.field_map` key then must be set
to a string value that contains a number of the above expressions.

Before demonstrating an example, here is a message with the default mapping:

```json
{
  "time":"2024-10-04 03:38:29.709578-04:00",
  "level":"info",
  "msg":"Time to start RabbitMQ: 2294 ms",
  "line":427,
  "pid":"<0.9.0>",
  "file":"rabbit.erl",
  "mfa":["rabbit","start_it",1]
}

{
  "time":"2024-10-04 03:38:35.600956-04:00",
  "level":"info",
  "msg":"accepting AMQP connection 127.0.0.1:57604 -> 127.0.0.1:5672",
  "pid":"<0.899.0>",
  "domain":"rabbitmq.connection"
}
```

Now, an example that uses JSON logging with a custom field mapping:

```ini
# log as JSON
log.file.formatter = json

# Rename the 'time' field to 'ts', 'level' to 'lvl' and 'msg' to 'message',
# drop all other fields.
# Use an 'escaped string' just to make the value stand out
log.file.formatter.json.field_map = 'time:ts level:lvl msg:message *:-'
```

The example above will produce the following messages. Notice how some information
is omitted compared to the default example above:

```json
{
  "ts":"2024-10-04 03:34:43.600462-04:00",
  "lvl":"info",
  "message":"Time to start RabbitMQ: 2577 ms"
}
{
  "ts":"2024-10-04 03:34:49.142396-04:00",
  "lvl":"info",
  "message":"accepting AMQP connection 127.0.0.1:57507 -> 127.0.0.1:5672"
}
```


### Forced Single Line Logging

:::warning

This setting can lead to incomplete log messages and should only be used as a last
resort measure when overriding log format us a hard requirement
of log collection tooling

:::

Multi-line messages can be truncated to a single line:

``` ini
# Accepted values are 'on' and 'off'.
# The default is 'off'.
log.console.formatter.single_line = on
```

This setting can lead to incomplete log messages and should be used only as a last
resort measure.


## Service Logs {#service-logs}

On `systemd`-based Linux distributions, system service logs can be
inspected using `journalctl --system`

```bash
journalctl --system
```

which requires superuser privileges.
Its output can be filtered to narrow it down to RabbitMQ-specific entries:

```bash
sudo journalctl --system | grep rabbitmq
```

Service logs will include standard output and standard error streams of the node.
The output of <code>journalctl --system</code> will look similar to this:

```
Aug 26 11:03:04 localhost rabbitmq-server[968]: ##  ##
Aug 26 11:03:04 localhost rabbitmq-server[968]: ##  ##      RabbitMQ 3.13.7. Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.
Aug 26 11:03:04 localhost rabbitmq-server[968]: ##########  Licensed under the MPL.  See https://www.rabbitmq.com/
Aug 26 11:03:04 localhost rabbitmq-server[968]: ######  ##
Aug 26 11:03:04 localhost rabbitmq-server[968]: ##########  Logs: /var/log/rabbitmq/rabbit@localhost.log
Aug 26 11:03:04 localhost rabbitmq-server[968]: /var/log/rabbitmq/rabbit@localhost_upgrade.log
Aug 26 11:03:04 localhost rabbitmq-server[968]: Starting broker...
Aug 26 11:03:05 localhost rabbitmq-server[968]: systemd unit for activation check: "rabbitmq-server.service"
Aug 26 11:03:06 localhost rabbitmq-server[968]: completed with 6 plugins.
```


## Logged Events {#logged-events}

### Connection Lifecycle Events {#connection-lifecycle-events}

Successful TCP connections that send at least 1 byte of data will be logged. Connections
that do not send any data, such as health checks of certain load balancer products, will
not be logged.

Here's an example:

```
2018-11-22 10:44:33.654 [info] <0.620.0> accepting AMQP connection <0.620.0> (127.0.0.1:52771 -> 127.0.0.1:5672)
```

The entry includes client IP address and port (<code>127.0.0.1:52771</code>) as well as the target
IP address and port of the server (<code>127.0.0.1:5672</code>). This information can be useful
when troubleshooting client connections.

Once a connection successfully authenticates and is granted access to a [virtual host](./vhosts),
that is also logged:

```
2018-11-22 10:44:33.663 [info] <0.620.0> connection <0.620.0> (127.0.0.1:52771 -> 127.0.0.1:5672): user 'guest' authenticated and granted access to vhost '/'
```

The examples above include two values that can be used as connection identifiers
in various scenarios: connection name (`127.0.0.1:57919 -> 127.0.0.1:5672`) and an Erlang process ID of the connection (`<0.620.0>`).
The latter is used by [rabbitmqctl](./cli) and the former is used by the [HTTP API](./management).

A [client connection](./connections) can be closed cleanly or abnormally. In the
former case the client closes AMQP 0-9-1 (or 1.0, or STOMP, or
MQTT) connection gracefully using a dedicated library function
(method). In the latter case the client closes TCP connection
or TCP connection fails. RabbitMQ will log both cases.

Below is an example entry for a successfully closed connection:

```
2018-06-17 06:23:29.855 [info] <0.634.0> closing AMQP connection <0.634.0> (127.0.0.1:58588 -> 127.0.0.1:5672, vhost: '/', user: 'guest')
```

Abruptly closed connections will be logged as warnings:

```
2018-06-17 06:28:40.868 [warning] <0.646.0> closing AMQP connection <0.646.0> (127.0.0.1:58667 -> 127.0.0.1:5672, vhost: '/', user: 'guest'):
client unexpectedly closed TCP connection
```

Abruptly closed connections can be harmless. For example, a short lived program can naturally stop
and don't have a chance to close its connection. They can also hint at a genuine issue such as
a failed application process or a proxy that closes TCP connections it considers to be idle.


## Watching Internal Events {#internal-events}

RabbitMQ nodes have an internal mechanism. Some of its events can be of interest for monitoring,
audit and troubleshooting purposes. They can be consumed as JSON objects using a `rabbitmq-diagnostics` command:

```bash
# will emit JSON objects
rabbitmq-diagnostics consume_event_stream
```

When used interactively, results can be piped to a command line JSON processor such as [jq](https://stedolan.github.io/jq/):

```bash
rabbitmq-diagnostics consume_event_stream | jq
```

The events can also be exposed to applications for [consumption](./consumers)
with [a plugin](./event-exchange).

Events are published as messages with blank bodies. All event metadata is stored in
message metadata (properties, headers).

Below is a list of published events.

### Core Broker

[Queue](./queues), Exchange and Binding events:

 * `queue.deleted`
 * `queue.created`
 * `exchange.created`
 * `exchange.deleted`
 * `binding.created`
 * `binding.deleted`

[Connection](./connections) and [Channel](./channels) events:

 * `connection.created`
 * `connection.closed`
 * `channel.created`
 * `channel.closed`

[Consumer](./consumers) events:

 * `consumer.created`
 * `consumer.deleted`

[Policy and Parameter](./parameters) events:

 * `policy.set`
 * `policy.cleared`
 * `parameter.set`
 * `parameter.cleared`

[Virtual host](./vhosts) events:

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

[Permission](./access-control) events:

 * `permission.created`
 * `permission.deleted`
 * `topic.permission.created`
 * `topic.permission.deleted`

[Alarm](./alarms) events:

 * `alarm.set`
 * `alarm.cleared`

### [Shovel Plugin](./shovel)

Worker events:

 * `shovel.worker.status`
 * `shovel.worker.removed`

### [Federation Plugin](./federation)

Link events:

 * `federation.link.status`
 * `federation.link.removed`


## Consuming Log Entries Using a System Log Exchange {#log-exchange}

RabbitMQ can forward log entries to a system exchange, `amq.rabbitmq.log`, which
will be declared in the default [virtual host](./vhosts).

This feature is deactivated by default.
To activate this logging, set the `log.exchange` configuration key to `true`:

```ini
# activate log forwarding to amq.rabbitmq.log, a topic exchange
log.exchange = true
```

`log.exchange.level` can be used to control the [log level](#log-levels) that
will be used by this logging target:

```ini
log.exchange = true
log.exchange.level = warning
```


`amq.rabbitmq.log` is a regular topic exchange and can be used as such.
Log entries are published as messages. Message body contains the logged message
and routing key is set to the log level.

Application that would like to consume log entries need to declare a queue
and bind it to the exchange, using a routing key to filter a specific log level,
or `#` to consume all log entries allowed by the configured log level.
