# Logging

## Introduction

Log files is a very important aspect of system observability,
much like [monitoring](/monitoring.html).

Developers and operators should inspect logs when troubleshooting an issue or assessing the
state of the system.

RabbitMQ supports a number of features when it comes to logging.

This guide covers topics such as:

 * [Log file location](#log-file-location)
 * [Log levels](#log-levels)
 * [Log categories](#log-message-categories)
 * Supported log outputs
 * [Connection lifecycle events](#logged-events) logged
 * How to [inspect service logs](#service-logs) on systemd-based Linux systems
 * [Log rotation](#log-rotation)
 * [Logging to Syslog](#logging-to-syslog)
 * Watching [internal events](#internal-events)
 * [Debug logging](#debug-logging)
 * Advanced configuration topics (custom log handlers, sinks, etc)

and more.

## <a id="log-file-location" class="anchor" href="#log-file-location">Log File Location</a>

Before version 3.7.0 there were two log files: for regular messages and unhandled exceptions.
Starting with 3.7.0, RabbitMQ uses a single log file by default.

Please see the [File and Directory Location](/relocate.html) guide to find default log file location for various platforms.

There are two ways to configure log file location. One is the [configuration file](/configure.html). The other is the `RABBITMQ_LOGS` environment variable. Use [RabbitMQ management UI](/management.html) or [`rabbitmqctl` environment](/cli.html) to find when a node stores its log file(s).

The `RABBITMQ_LOGS` variable value can be either a file path or a hyphen (`-`), which means all log
messages will be printed to standard output.

The environment variable takes precedence over the configuration file. When in doubt, consider
overriding log file location via the config file.


## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

As of 3.7.0 RabbitMQ uses the [Lager](https://github.com/erlang-lager/lager) logging
library under the hood. Lager supports logging to different sources and is highly configurable.

RabbitMQ starts logging early on node start. See the [Configuration guide](/configure.html)
for a general overview of how to configure RabbitMQ.

### <a id="log-outputs" class="anchor" href="#log-outputs">Log Outputs</a>

Default RabbitMQ logging configuration will direct log messages to a log file. Standard output is
another option available out of the box.

Several outputs can be used at the same time. Log entries will be copied to all of them.

Different outputs can have different log levels. For example, the console output can log all
messages including debug information  while the file output can only log error and higher severity
messages.


### <a id="logging-to-a-file" class="anchor" href="#logging-to-a-file">Logging to a File</a>

 * `log.file`: log file path or `false` to disable the file output. Default value is taken from the `RABBITMQ_LOGS` [environment variable or configuration file](/configure.html).
 * `log.file.level`: log level for the file output. Default level is `info`.
 * `log.file.rotation.date`, `log.file.rotation.size`, `log.file.rotation.count` for log file rotation settings.

The following example overiddes log file name:

<pre class="lang-ini">
log.file = rabbit.log
</pre>

The following example overiddes log file directory:

<pre class="lang-ini">
log.dir = /data/logs/rabbitmq
</pre>

The following example instructs RabbitMQ to log to a file at the `debug` level:

<pre class="lang-ini">
log.file.level = debug
</pre>

Logging to a file can be disabled with

<pre class="lang-ini">
log.file = false
</pre>

Find supported log levels in the [example  rabbitmq.conf file](https://github.com/rabbitmq/rabbitmq-server/blob/v3.7.x/docs/rabbitmq.conf.example).

The rest of this guide describes more options. [Lager configuration reference](https://github.com/erlang-lager/lager) is the most comprehensive reference.

#### Classic Config Format

It is possible to configure file logging using the [classic configuration format](/configure.html):

<pre class="lang-erlang">
[{rabbit, [
        {log, [
            {file, [{file, "/path/to/log/file.log"}, %% log.file
                    {level, info},        %% log.file.info
                    {date, ""},           %% log.file.rotation.date
                    {size, 0},            %% log.file.rotation.size
                    {count, 1}            %% log.file.rotation.count
                    ]}
        ]}
    ]}].
</pre>

### <a id="log-rotation" class="anchor" href="#log-rotation">Log Rotation</a>

RabbitMQ nodes always append to the log files, so a complete log history is preserved.
Lager will not perform log file rotation by default. [Debian](/install-debian.html) and [RPM](/install-rpm.html) packages will set up
log [rotation via `logrotate`](#logrotate) after package installation.

`log.file.rotation.date`, `log.file.rotation.size`, `log.file.rotation.count` settings control log file rotation
for the file output.

#### Periodic Rotation

Use `log.file.rotation.date` to set up periodic (date and time-based) rotation.
It uses [the same syntax as newsyslog.conf](https://github.com/basho/lager#internal-log-rotation):

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
# rotate every hour at HH:00
log.file.rotation.date = $H00
</pre>

<pre class="lang-ini">
# rotate every day at 12:30 (00:30 p.m.)
log.file.rotation.date = $D12H30
</pre>

<pre class="lang-ini">
# rotate every week on Sunday at 00:00
log.file.rotation.date = $W0D0H0
</pre>

<pre class="lang-ini">
# rotate every week on Friday at 16:00 (4:00 p.m.)
log.file.rotation.date = $W5D16
</pre>

<pre class="lang-ini">
# rotate every night at midnight
log.file.rotation.date = $D0
</pre>

#### File Size-based Rotation

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

RabbitMQ [Debian](/install-debian.html) and [RPM](/install-rpm.html) packages will set up `logrotate` to run weekly on files
located in default `/var/log/rabbitmq` directory. Rotation configuration can be found in `/etc/logrotate.d/rabbitmq-server`.


### <a id="logging-to-console" class="anchor" href="#logging-to-console">Logging to Console (Standard Output)</a>

Here are the main settings that control console (standard output) logging:

 * `log.console` (boolean): set to `true` to enable console output. Default is `false`
 * `log.console.level`: log level for the console output. Default level is `info`.

To enable console logging, use the following config snippet:

<pre class="lang-ini">
log.console = true
</pre>

The following example disables console logging

<pre class="lang-ini">
log.console = false
</pre>

The following example instructs RabbitMQ to use the `debug` logging level when logging to console:

<pre class="lang-ini">
log.console.level = debug
</pre>


It is possible to configure console logging using the [classic config format](/configure.html#config-file-formats):

<pre class="lang-erlang">
[{rabbit, [
        {log, [
            {console, [{enabled, true}, %% log.console
                       {level, info}    %% log.console.level
            ]}
        ]}
    ]}].
</pre>

When console output is enabled, the file output will also be enabled by default.
To disable the file output, set `log.file` to `false`.

Please note that `RABBITMQ_LOGS` set to `-` will disable the file output
even in `log.file` is configured.

### <a id="logging-to-syslog" class="anchor" href="#logging-to-syslog">Logging to Syslog</a>

RabbitMQ logs can be forwarded to a Syslog server via TCP or UDP. UDP is used by default
and **requires Syslog service configuration**. TLS is also supported.

Syslog output has to be explicitly configured:

<pre class="lang-ini">
log.syslog = true
</pre>

Or, in the classic config format:

<pre class="lang-erlang">
[{rabbit, [{log, [
    {syslog, [{enabled, true}]}]}]
}].
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

In the classic config format:

<pre class="lang-erlang">
[{rabbit, [{log, [{syslog, [{enabled, true}]}]}]},
 {syslog, [{protocol, {tcp, rfc5424}}]}
].
</pre>

To TLS, a standard set of <a href="/ssl.html">TLS options</a> must be provided:

<pre class="lang-ini">
log.syslog = true
log.syslog.transport = tls
log.syslog.protocol = rfc5424

log.syslog.ssl_options.cacertfile = /path/to/tls/cacert.pem
log.syslog.ssl_options.certfile = /path/to/tls/cert.pem
log.syslog.ssl_options.keyfile = /path/to/tls/key.pem
</pre>

In the classic config format:

<pre class="lang-erlang">
[{rabbit, [{log, [{syslog, [{enabled, true}]}]}]},
 {syslog, [{protocol, {tls, rfc5424,
                        [{cacertfile,"/path/to/tls/cacert.pem"},
                         {certfile,"/path/to/tls/cert.pem"},
                         {keyfile,"/path/to/tls/key.pem"}]}}]}
].
</pre>

Syslog service IP address and port can be customised:

<pre class="lang-ini">
log.syslog = true
log.syslog.ip = 10.10.10.10
log.syslog.port = 1514
</pre>

In the classic config format:

<pre class="lang-erlang">
[{rabbit, [{log, [{syslog, [{enabled, true}]}]}]},
 {syslog, [{dest_host, {10, 10, 10, 10}},
           {dest_port, 1514}]}
].
</pre>

If a hostname is to be used rather than an IP address:

<pre class="lang-ini">
log.syslog = true
log.syslog.host = my.syslog-server.local
log.syslog.port = 1514
</pre>

In the classic config format:

<pre class="lang-erlang">
[{rabbit, [{log, [{syslog, [{enabled, true}]}]}]},
 {syslog, [{dest_host, "my.syslog-server.local"},
           {dest_port, 1514}]}
].
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

In the classic config format:

<pre class="lang-erlang">
[{rabbit, [{log, [{syslog, [{enabled, true}]}]}]},
 {syslog, [{app_name, "my_rabbitmq"},
           {facility, user}]}
].
</pre>

Less commonly used [Syslog client](https://github.com/schlagert/syslog) options can be configured using the <a href="/configure.html#configuration-files">advanced config file</a>.


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
the following will disable debug logging for connection events:

<pre class="lang-ini">
log.file.level = debug
log.connection.level = info
</pre>

Or, using the [classic configuration format](/configure.html):

<pre class="lang-erlang">
[{rabbit,
    [{log,
        [{file, [{level, debug}]},
         {categories,
            [{connection,
                [{level, info}]
            }]
        }]
    }]
}].
</pre>

To redirect all federation logs to the `rabbit_federation.log` file, use:

<pre class="lang-ini">
log.federation.file = rabbit_federation.log
</pre>

Using the [classic configuration format](/configure.html):

<pre class="lang-erlang">
[{rabbit,
    [{log,
        [{categories,
            [{federation,
                [{file, "rabbit_federation.log"}]
            }]
        }]
    }]
}]
</pre>

To disable a log type, you can use the `none` log level. For example, to disable
upgrade logs:

<pre class="lang-ini">
log.upgrade.level = none
</pre>

Using the [classic configuration format](/configure.html):

<pre class="lang-erlang">
[{rabbit,
    [{log,
        [{categories,
            [{upgrade,
                [{level, none}]
            }]
        }]
    }]
}].
</pre>

### <a id="log-levels" class="anchor" href="#log-levels">Log Levels</a>

Log levels is another way to filter and tune logging. Each log level has a severity associated with it.
More critical messages have lower severity number, while `debug` has the highest number.

The following log levels are used by RabbitMQ:

| Log level  | Severity |
|------------|----------|
| `debug`    | 128      |
| `info`     | 64       |
| `warning`  | 16       |
| `error`    | 8        |
| `critical` | 4        |
| `none`     | 0        |

Default log level is `info`.

If the level of a log message is higher than the category level,
the message will be dropped and not sent to any output.

If a category level is not configured, its messages will always be sent
to all outputs.

To make the `default` category log only errors or higher severity messages, use

<pre class="lang-ini">
log.default.level = error
</pre>

The `none` level means no logging.

Each output can use its own log level. If a message
level number is higher than the output level, the message will not be logged.

For example, if no outputs are configured to log
`debug` messages, even if the category level is set to `debug`, the
debug messages will not be logged.

Although, if an output is configured to log `debug` messages,
it will get them from all categories, unless a category level is configured.

#### <a id="changing-log-level" class="anchor" href="#changing-log-level">Changing Log Level</a>

There are two ways of changing effective log levels:

 * Via [configuration file(s)](/configure.html): this is more flexible but requires
   a node restart between changes
 * Using `rabbitmqctl set_log_level &lt;level&gt;`: this option sets the same level for all
   sinks, the changes are transient (will not survive node restart) but can be used to
   enable e.g. [debug logging](#debug-logging) at runtime.

To set log level of all sinks to `debug` on a running node:

<pre class="lang-bash">
rabbitmqctl -n rabbit@target-host set_log_level debug
</pre>

To set the level to `info`:

<pre class="lang-bash">
rabbitmqctl -n rabbit@target-host set_log_level info
</pre>


#### <a id="debug-logging" class="anchor" href="#debug-logging">Enabling Debug Logging</a>

To enable debug messages, you should have a debug output.

For example to log debug messages to a file:

<pre class="lang-ini">
log.file.level = debug
</pre>

In the [classic config format](/configure.html#config-file-formats):

<pre class="lang-erlang">
[{rabbit, [{log, [
    {file, [{level, debug}]}]
}].
</pre>

To print log messages to standard I/O streams:

<pre class="lang-ini">
log.console = true
log.console.level = debug
</pre>

In the [classic config format](/configure.html#config-file-formats):

<pre class="lang-erlang">
[{rabbit, [{log, [
    {console, [{enabled, true},
               {level, debug}]}
    ]}]
}].
</pre>

To switch to debug logging at runtime:

<pre class="lang-bash">
rabbitmqctl -n rabbit@target-host set_log_level debug
</pre>

To set the level back to `info`:

<pre class="lang-bash">
rabbitmqctl -n rabbit@target-host set_log_level info
</pre>

It is possible to disable debug logging for some categories:

<pre class="lang-ini">
log.file.level = debug

log.connection.level = info
log.channel.level = info
</pre>

In the [classic config format](/configure.html#config-file-formats):

<pre class="lang-erlang">
[{rabbit, [{log, [
    {file, [{level, debug}]},
    {categories, [
        {connection, [{level, info}]},
        {channel, [{level, info}]}
        ]}
    ]}]
}].
</pre>


### <a id="service-logs" class="anchor" href="#service-logs">Service Logs</a>

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

<pre class="sourcecode">
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##      RabbitMQ 3.7.9. Copyright (c) 2007-2019 Pivotal Software, Inc.
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##########  Licensed under the MPL.  See http://www.rabbitmq.com/
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

<pre class="lang-ini">
2018-11-22 10:44:33.654 [info] &lt;0.620.0&gt; accepting AMQP connection &lt;0.620.0&gt; (127.0.0.1:52771 -> 127.0.0.1:5672)
</pre>

The entry includes client IP address and port (<code>127.0.0.1:52771</code>) as well as the target
IP address and port of the server (<code>127.0.0.1:5672</code>). This information can be useful
when troubleshooting client connections.

Once a connection successfully authenticates and is granted access to a [virtual host](/vhosts.html),
that is also logged:

<pre class="lang-ini">
2018-11-22 10:44:33.663 [info] &lt;0.620.0&gt; connection &lt;0.620.0&gt; (127.0.0.1:52771 -> 127.0.0.1:5672): user 'guest' authenticated and granted access to vhost '/'
</pre>

The examples above include two values that can be used as connection identifiers
in various scenarios: connection name (`127.0.0.1:57919 -> 127.0.0.1:5672`) and an Erlang process ID of the connection (`&lt;0.620.0&gt;`).
The latter is used by [rabbitmqctl](./cli.html) and the former is used by the [HTTP API](/management.html).

A [client connection](/connections.html) can be closed cleanly or abnormally. In the
former case the client closes AMQP 0-9-1 (or 1.0, or STOMP, or
MQTT) connection gracefully using a dedicated library function
(method). In the latter case the client closes TCP connection
or TCP connection fails. RabbitMQ will log both cases.

Below is an example entry for a successfully closed connection:

<pre class="lang-ini">
2018-06-17 06:23:29.855 [info] &lt;0.634.0&gt; closing AMQP connection &lt;0.634.0&gt; (127.0.0.1:58588 -&gt; 127.0.0.1:5672, vhost: '/', user: 'guest')
</pre>

Prior to RabbitMQ 3.7 the format was different:

<pre class="lang-ini">
=INFO REPORT==== 30-Oct-2017::21:40:32 ===
closing AMQP connection &lt;0.24990.164&gt; (127.0.0.1:57919 -> 127.0.0.1:5672, vhost: '/', user: 'guest')
</pre>

Abruptly closed connections will be logged as warnings:

<pre class="lang-ini">
2018-06-17 06:28:40.868 [warning] &lt;0.646.0&gt; closing AMQP connection &lt;0.646.0&gt; (127.0.0.1:58667 -&gt; 127.0.0.1:5672, vhost: '/', user: 'guest'):
client unexpectedly closed TCP connection
</pre>

In the pre-3.7 format:

<pre class="lang-ini">
=WARNING REPORT==== 1-Nov-2017::16:58:58 ===
closing AMQP connection &lt;0.601.0&gt; (127.0.0.1:60471 -> 127.0.0.1:5672, vhost: '/', user: 'guest'):
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
use categories.

`rabbit.log_levels` will work in 3.7.0 **only** if no `categories` are defined.


## <a id="internal-events" class="anchor" href="#internal-events">Watching Internal Events</a>

RabbitMQ nodes have an internal mechanism. Some of its events can be of interest for monitoring,
audit and troubleshooting purposes. They can be exposed to applications for [consumption](/consumers.html)
with a plugin, [rabbitmq-event-exchange](https://github.com/rabbitmq/rabbitmq-event-exchange/).

Events are published as messages with blank bodies. All event metadata is stored in
message metadata (properties, headers).

Below is a list of published events.

### Core Broker

[Queue](/queues.html), Exchange and Binding events:

 * `queue.deleted`
 * `queue.created`
 * `exchange.created`
 * `exchange.deleted`
 * `binding.created`
 * `binding.deleted`

[Connection](/connections.html) and [Channel](/channels.html) events:

 * `connection.created`
 * `connection.closed`
 * `channel.created`
 * `channel.closed`

[Consumer](/consumers.html) events:

 * `consumer.created`
 * `consumer.deleted`

[Policy and Parameter](/parameters.html) events:

 * `policy.set`
 * `policy.cleared`
 * `parameter.set`
 * `parameter.cleared`

[Virtual host](/vhosts.html) events:

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

[Permission](/access-control.html) events:

 * `permission.created`
 * `permission.deleted`
 * `topic.permission.created`
 * `topic.permission.deleted`

[Alarm](/alarms.html) events:

 * `alarm.set`
 * `alarm.cleared`

### [Shovel Plugin](/shovel.html)

Worker events:

 * `shovel.worker.status`
 * `shovel.worker.removed`

### [Federation Plugin](/federation.html)

Link events:

 * `federation.link.status`
 * `federation.link.removed`


## <a id="advanced-configuration" class="anchor" href="#advanced-configuration">Advanced Configuration</a>

This section describes the nitty gritty details of the logging
subsystem. Most RabbitMQ installations won't need the advanced configuration explained here.

### Lager Handlers and Sinks

RabbitMQ logging subsystem is built on top of [Lager](https://github.com/erlang-lager/lager), a powerful logging
library with several advanced features. Some of them are accessible via
the [log handler and sink abstractions](https://github.com/erlang-lager/lager#configuration).

A sink is an "endpoint" where log entries are written by connections, queues and so on. A handler is
stateful entity that consumes log entries and processes them. For example, a handler can write log
entries to a file, send them to a log collection service or discards them.

By default RabbitMQ creates one file backend handler and one sink per log category (see above).
Changing RabbitMQ log configuration parameters changes log handler used under the hood. The number
of sinks used by RabbitMQ core is fixed. 3rd party plugins can use custom sinks. With a certain
amount of configuration it may be possible e.g. to log those messages separately from the rest.

When RabbitMQ is started with default logging settings, a Lager handler is configured
under the hood and it looks like this:

<pre class="lang-erlang">
[{lager, [
    {handlers,
       [{lager_file_backend,
            [{file,
                 "/var/log/rabbitmq/log/rabbit.log"},
             {formatter_config,
                 [date," ",time," ",color,"[",severity,"] ",
                  {pid,[]},
                  " ",message,"\n"]},
             {level,info},
             {date,""},
             {size,0}]}]},
    {extra_sinks,
       [{error_logger_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,inherit]}]}]},
        {rabbit_log_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,inherit]}]}]},
        {rabbit_log_channel_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,inherit]}]}]},
        {rabbit_log_connection_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,inherit]}]}]},
        {rabbit_log_mirroring_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,inherit]}]}]},
        {rabbit_log_queue_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,inherit]}]}]},
        {rabbit_log_federation_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,inherit]}]}]},
        {rabbit_log_upgrade_lager_event,
            [{handlers,
                [{lager_file_backend,
                    [{date,[]},
                     {file,
                           "/var/log/rabbitmq/rabbit_upgrade.log"},
                     {formatter_config,
                        [date," ",time," ",color,"[",severity,
                         "] ",
                         {pid,[]},
                         " ",message,"\n"]},
                     {level,info},
                     {size,0}]}]}]}]}
]}].
</pre>

Most sinks use `lager_forwarder_backend`. This backend will redirect all messages
with matching level to default lager sink (`lager_event`). Upgrade messages use
a separate sink with its own log file.

For instance, if console logging is enabled with

<pre class="lang-ini">
log.console = true
log.console.level = warning
</pre>

then generated handlers configuration will look something like this:

<pre class="lang-erlang">
[{lager,
    [{handlers,
        [{lager_console_backend,
            [{formatter_config,[date," ", time," ",color,"[",severity,"] ", {pid,[]}, " ",message,"\n"]},
             {level,warning}]},
         {lager_file_backend,
            [{date,[]},
            {file,"/var/folders/cl/jnydxpf92rg76z05m12hlly80000gq/T/rabbitmq-test-instances/rabbit/log/rabbit.log"},
            {formatter_config,[date," ",time," ",color,"[",severity, "] ", {pid,[]}, " ",message,"\n"]},
            {level,info},
            {size,0}]
        }]},
     {extra_sinks,
        [{error_logger_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event, inherit]}]}]},
         {rabbit_log_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                       inherit]}]}]},
         {rabbit_log_channel_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                               inherit]}]}]},
         {rabbit_log_connection_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                                  inherit]}]}]},
         {rabbit_log_mirroring_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                                 inherit]}]}]},
         {rabbit_log_queue_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                             inherit]}]}]},
         {rabbit_log_federation_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                                  inherit]}]}]},
         {rabbit_log_upgrade_lager_event,
            [{handlers,
                [{lager_console_backend,
                    [{formatter_config,[date," ", time," ",color,"[",severity,"] ", {pid,[]}, " ",message,"\n"]},
                     {level,warning}]},
                 {lager_file_backend,
                    [{date,[]},
                     {file,"/var/folders/cl/jnydxpf92rg76z05m12hlly80000gq/T/rabbitmq-test-instances/rabbit/log/rabbit_upgrade.log"},
                     {formatter_config,[date," ", time," ",color,"[",severity,"] ", {pid,[]}, " ",message,"\n"]},
                     {level,info},
                     {size,0}]}]}]
         }]
    }]
}].
</pre>

Here a new handler is added to the `handlers` and `upgrade_lager_event` sink handlers.
Because the `upgrade` category uses a separate file by default, all default handlers are copied to the sink handlers.

If a target log file is configured for a category via a `log.<category>.file` config entry, all log messages
in that category will be written to **this file only** as well as non-file backends.

To include upgrade logs in the default log file, disable file logging for that category.

<pre class="lang-ini">
log.upgrade.file = false
</pre>

or

<pre class="lang-erlang">
[{rabbit, [{log, [{categories, [{upgrade, [{file, false}]}]}]}]}].
</pre>

in the [classic configuration format](/configure.html#config-file-formats).

Logging settings must go into the `lager` application section. To add extra handlers to default
configuration or sinks, use the `handlers` to `extra_sinks` keys.

Handlers configured in the `lager` config will be **merged** with those generated by RabbitMQ. Log
messages will be logged both by the custom handlers as well as the standard ones.

If a sink uses a name of a known RabbitMQ category, its handlers will be **merged** with the
generated category sink. Log messages in the category will be sent both to the custom handlers and
the default sink.

It is possible to disable RabbitMQ handlers and sinks. Setting a handler or category's `level` to
`none` will disable them.


### Custom Handler Examples

To create an additional log file for errors only, create an
additional handler with the `error` level. This has to be done using the
[advanced config file](/configure.html):

<pre class="lang-erlang">
[{lager, [
    {handlers, [
        {lager_file_backend,
            [{file, "rabbit_errors.log"},
             {level,error},
             %% The formatter and rotation config is optional
             {formatter_config,
                 [date," ",time," ",color,"[",severity,"] ",
                  {pid,[]},
                  " ",message,"\n"]},
             {date,""},
             {size,0}]}
    ]}]
}].
</pre>

To use a custom lager backend and disable RabbitMQ default handlers:

<pre class="lang-erlang">
[{lager,
    [{handlers,
        [{lager_custom_backend,
            [{level,info},
             {custom,settings}]}]
    }]},
 {rabbit,
    [{log,
        [{file, [{file, false}]}] %% Disable RabbitMQ file handler
    }]}
].
</pre>

To log direct Erlang AMQP 0-9-1 client messages to console instead of default output:

<pre class="lang-erlang">
[{lager,
    [{extra_sinks,
        [{rabbit_log_connection_lager_event,
            [{handlers,
                [{lager_console_backend, info}]}]}]
    }]},
 {rabbit,
    [{log,
        [{categories,
            [{connection, [{level, none}]}]}] %% Block connection category forwarder
    }]}
].
</pre>
