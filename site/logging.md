# Logging

## Introduction

This guide describes various aspects of logging in RabbitMQ:

 * [Log file location](#log-file-location)
 * [Log levels](#log-levels)
 * [Log categories](#log-message-categories)
 * [Debug logging](#debug-logging)
 * Supported log outputs
 * Advanced configuration topics (custom log handlers, sinks, etc)

As of 3.7.0 RabbitMQ uses the [Lager](https://github.com/erlang-lager/lager) logging library
under the hood. The library supports logging to a file, console or a number of other sources
via 3rd party plugins and provides a fair amount of flexibility when it comes to configuration.

## <a id="log-file-location" class="anchor" href="#log-file-location">Log File Location</a>

Prior to 3.7.0 there were two log files: for regular messages and unhandled
exceptions. As of 3.7.0 a single log file is used for all messages
by default.

Default log file location is covered
in the [File and Directory Location](/relocate.html) guide.

You can modify the default location either by using a configuration file, or
by setting the `RABBITMQ_LOGS` environment variable. Effective log
file path can be discovered using [RabbitMQ management UI](/management.html) or
CLI commands such as `rabbitmqctl environment`.

`RABBITMQ_LOGS` variable value can be either a file path or a hyphen (`-`), which means
all log messages should be printed to standard output.

The environment variable takes precedence over the configuration file.
When in doubt, consider overriding log file location via the config file.


## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

RabbitMQ initializes its logging subsystem on node start.
See the [Configuration guide](/configure.html) for a general overview
of how RabbitMQ nodes are configured.


### <a id="log-outputs" class="anchor" href="#log-outputs">Log Outputs</a>

Default RabbitMQ logging configuration will direct log messages to a log file. Standard output is
another option available out of the box.

Multiple outputs can be used at the same time. Log entries will be copied to all of them.

Different outputs can have different log levels, for example, the
console output can be configured to log all messages including debug
information while the file output will log only error and higher
severity messages.


### <a id="logging-to-a-file" class="anchor" href="#logging-to-a-file">Logging to a File</a>


 * `log.file`: log file path or `false` to disable the file output. Default value is taken from the `RABBITMQ_LOGS` [environment variable or configuration file](/configure.html).
 * `log.file.level`: log level for the file output. Default level is `info`.
 * `log.file.rotation.date`, `log.file.rotation.size`, `log.file.rotation.count` for log file rotation settings.

The following example overiddes log file name:

<pre class="sourcecode ini">
log.file = rabbit.log
</pre>

The following example overiddes log file directory:

<pre class="sourcecode ini">
log.dir = /data/logs/rabbitmq
</pre>

The following example instructs RabbitMQ to log to a file at the `debug` level:

<pre class="sourcecode ini">
log.file.level = debug
</pre>

Logging to a file can be disabled with

<pre class="sourcecode ini">
log.file = false
</pre>

The rest of this guide, [rabbitmq.conf.example](https://github.com/rabbitmq/rabbitmq-server/blob/v3.7.x/docs/rabbitmq.conf.example), and [Lager configuration reference](https://github.com/erlang-lager/lager) cover
the list of acceptable log levels and other values.

#### Classic Config Format

It is possible to configure file logging using the [classic configuration format](/configure.html):

<pre class="sourcecode erlang">
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

Log file rotation via Lager is disabled by default. [Debian](/install-debian.html) and [RPM packages](/install-rpm.html) will set up
log rotation via `logrotate` after package installation.


### <a id="logging-to-console" class="anchor" href="#logging-to-console">Logging to Console (Standard Output)</a>

Here are the main settings that control console (standard output) logging:

 * `log.console` (boolean): set to `true` to enable console output. Default is `false`
 * `log.console.level`: log level for the console output. Default level is `info`.

To enable console logging, use the following config snippet:

<pre class="sourcecode ini">
log.console = true
</pre>

The following example disables console logging

<pre class="sourcecode ini">
log.console = false
</pre>

The following example instructs RabbitMQ to use the `debug` logging level when logging to console:

<pre class="sourcecode ini">
log.console.level = debug
</pre>


It is possible to configure console logging using the [classic config format](/configure.html#config-file-formats):

<pre class="sourcecode erlang">
[{rabbit, [
        {log, [
            {console, [{enabled, true}, %% log.console
                       {level, info}    %% log.console.level
            ]}
        ]}
    ]}].
</pre>

If you enable console output, the file output will still be enabled by
default. To disable the file output, set `log.file` to `false`.

Please note that `RABBITMQ_LOGS` set to `-` will disable the file output
even in `log.file` is configured.

### <a id="logging-to-syslog" class="anchor" href="#logging-to-syslog">Logging to Syslog</a>

RabbitMQ logs can be forwarded to a Syslog server via TCP or UDP. UDP is used by default
and **requires Syslog service configuration**. TLS is also supported.

Syslog output has to be explicitly configured:

<pre class="sourcecode ini">
log.syslog = true
</pre>

Or, in the classic config format:

<pre class="sourcecode erlang">
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

<pre class="sourcecode ini">
log.syslog = true
log.syslog.transport = tcp
log.syslog.protocol = rfc5424
</pre>

In the classic config format:

<pre class="sourcecode erlang">
[{rabbit, [{log, [{syslog, [{enabled, true}]}]}]},
 {syslog, [{protocol, {tcp, rfc5424}}]}
].
</pre>

To TLS, a standard set of <a href="/ssl.html">TLS options</a> must be provided:

<pre class="sourcecode ini">
log.syslog = true
log.syslog.transport = tls
log.syslog.protocol = rfc5424

log.syslog.ssl_options.cacertfile = /path/to/tls/cacert.pem
log.syslog.ssl_options.certfile = /path/to/tls/cert.pem
log.syslog.ssl_options.keyfile = /path/to/tls/key.pem
</pre>

In the classic config format:

<pre class="sourcecode erlang">
[{rabbit, [{log, [{syslog, [{enabled, true}]}]}]},
 {syslog, [{protocol, {tls, rfc5424,
                        [{cacertfile,"/path/to/tls/cacert.pem"},
                         {certfile,"/path/to/tls/cert.pem"},
                         {keyfile,"/path/to/tls/key.pem"}]}}]}
].
</pre>

Syslog service IP address (note: hostnames are not supported) and port can be customised:

<pre class="sourcecode ini">
log.syslog = true
log.syslog.ip = 10.10.10.10
log.syslog.port = 1514
</pre>

In the classic config format:

<pre class="sourcecode erlang">
[{rabbit, [{log, [{syslog, [{enabled, true}]}]}]},
 {syslog, [{dest_host, {10, 10, 10, 10}},
           {dest_port, 1514}]}
].
</pre>

Syslog metadata identity and facility values also can be configured.
By default identity will be set to the name part of the node name (for example `rabbitmq` for `rabbitmq@hostname`)
and facility will be set to `daemon`.

To set identity and facility of log messages:

<pre class="sourcecode ini">
log.syslog = true
log.syslog.identity = my_rabbitmq
log.syslog.facility = user
</pre>

In the classic config format:

<pre class="sourcecode erlang">
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

 * `connection`: connection lifecycle events for AMQP 0-9-1, AMQP 1.0, MQTT and STOMP.
 * `channel`: channel logs. Mostly errors and warnings on AMQP 0-9-1 channels.
 * `queue`: queue logs. Mostly debug messages.
 * `mirroring`: queue mirroring logs. Queue mirrors status changes: starting/stopping/synchronizing.
 * `federation`: federation plugin logs.
 * `upgrade`: verbose upgrade logs. These can be excessive.
 * `default`: all other log entries. You cannot override file location for this category.

It is possible to configure a different log level or file location for each message category
using `log.<category>.level` and `log.<category>.file` configuration variables.

By default each category will not filter by level. So if you have an output configured
to log `debug` messages, the debug messages will be printed from all categories,
unless a category level is configured.

For example, given debug level in the file output,
the following will disable debug logging for connection events:

<pre class="sourcecode ini">
log.file.level = debug
log.connection.level = info
</pre>

Or, using the [classic configuration format](/configure.html):

<pre class="sourcecode erlang">
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

<pre class="sourcecode ini">
log.federation.file = rabbit_federation.log
</pre>

Using the [classic configuration format](/configure.html):

<pre class="sourcecode erlang">
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

<pre class="sourcecode ini">
log.upgrade.level = none
</pre>

Using the [classic configuration format](/configure.html):

<pre class="sourcecode erlang">
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


When a message is logged, if the level number is higher than the category level,
the message will be dropped and not sent to outputs.

If a category level is not configured, it's messages will always be sent
to outputs.

To make the `default` category log only errors or higher severity messages, use

<pre class="sourcecode ini">
log.default.level = error
</pre>

The `none` level means that no messages will be logged.

Levels can be configured separately for each output. If a message
level number is higher than the output level, the message will not be
logged.

For example if no outputs are configured to log
`debug` messages, even if you set a category level to `debug`, the
debug messages will not be logged.

Although, if an output is configured to log `debug` messages,
it will get them from all categories, unless a category level is configured.

### <a id="debug-logging" class="anchor" href="#debug-logging">Enabling Debug Logging</a>

To enable debug messages, you should have a debug output.

For example to log debug messages to a file:

<pre class="sourcecode ini">
log.file.level = debug
</pre>

In the [classic config format](/configure.html#config-file-formats):

<pre class="sourcecode erlang">
[{rabbit, [{log, [
    {file, [{level, debug}]}]
}].
</pre>

To print log messages to standard out:

<pre class="sourcecode ini">
log.console.enabled = true
log.console.level = debug
</pre>

In the [classic config format](/configure.html#config-file-formats):

<pre class="sourcecode erlang">
[{rabbit, [{log, [
    {console, [{enabled, true},
               {level, debug}]}
    ]}]
}].
</pre>

To disable debug logging for some categories:

<pre class="sourcecode ini">
log.file.level = debug

log.connection.level = info
log.channel.level = info
</pre>

In the [classic config format](/configure.html#config-file-formats):

<pre class="sourcecode erlang">
[{rabbit, [{log, [
    {file, [{level, debug}]},
    {categories, [
        {connection, [{level, info}]},
        {channel, [{level, info}]}
        ]}
    ]}]
}].
</pre>


## <a id="logged-events" class="anchor" href="#logged-events">Logged Events</a>

### <a id="connection-lifecycle-events" class="anchor" href="#connection-lifecycle-events">Connection Lifecycle Events</a>

Successful TCP connections that send at least 1 byte of data will be logged. Connections
that do not send any data, such as health checks of certain load balancer products, will
not be logged.

Here's an example:

<pre class="sourcecode ini">
=INFO REPORT==== 30-Oct-2017::21:40:32 ===
accepting AMQP connection &lt;0.24990.164&gt; (127.0.0.1:57919 -> 127.0.0.1:5672)
</pre>

The entry includes client IP address and port (<code>127.0.0.1:57919</code>) as well as the target
IP address and port of the server (<code>127.0.0.1:5672</code>). This information can be useful
when troubleshooting client connections.

Once a connection successfully authenticates and is granted access to a [virtual host](/vhosts.html),
that is also logged:

<pre class="sourcecode ini">
=INFO REPORT==== 30-Oct-2017::21:40:32 ===
connection &lt;0.24990.164&gt; (127.0.0.1:57919 -> 127.0.0.1:5672): user 'guest' authenticated and granted access to vhost '/'
</pre>

The examples above include two values that can be used as connection identifiers
in various scenarios: a connection PID (`&lt;0.24990.164&gt;`) and connection name (`127.0.0.1:57919 -> 127.0.0.1:5672`).
The former is used by [rabbitmqctl](./cli.html) and the latter is used
by the [HTTP API](/management.html).

A connection can be closed cleanly or abnormally. In the
former case the client closes AMQP 0-9-1 (or 1.0, or STOMP, or
MQTT) connection gracefully using a dedicated library function
(method). In the latter case the client closes TCP connection
or TCP connection is lost. Both cases will be logged by the broker.
щ
Below is an example entry for a successfully closed connection:

<pre class="sourcecode ini">
=INFO REPORT==== 30-Oct-2017::21:40:32 ===
closing AMQP connection &lt;0.24990.164&gt; (127.0.0.1:57919 -> 127.0.0.1:5672, vhost: '/', user: 'guest')
</pre>

Abruptly closed connections will be logged as warnings:

<pre class="sourcecode ini">
=WARNING REPORT==== 1-Nov-2017::16:58:58 ===
closing AMQP connection &lt;0.601.0&gt; (127.0.0.1:60471 -> 127.0.0.1:5672, vhost: '/', user: 'guest'):
client unexpectedly closed TCP connection
</pre>

Abruptly closed connections could be harmless (e.g. a short lived program has naturally terminated
and didn't have a chance to close its connection properly) or indicate a genuine issue such as
a failed application process or a proxy that eagerly closes TCP connections it considers to be idle.


## <a id="upgrading" class="anchor" href="#upgrading">Upgrading From pre-3.7 Versions</a>

RabbitMQ versions prior to 3.7.0 had a different logging subsystem.

Older installations use two log files:
`<nodename>.log` and `<nodename>_sasl.log` (`<nodename>` is `rabbit@{hostname}` by default).

Where `<nodename>.log` contains RabbitMQ logs, while `<nodename>_sasl.log` contains
runtime logs, mostly unhandled exceptions.

Starting with 3.7.0 these two files were merged and all errors now can be found in
the `<nodename>.log` file. So `RABBITMQ_SASL_LOGS` environment variable is not used
anymore.

Log levels in pre-3.7.0 versions were configured using the `log_levels` configuration key.
Starting with 3.7 it's been replaced with [categories](#log-message-categories),
which are more descriptive and powerful.

If the `log_levels` key is present in `rabbitmq.config` file, it should be updated to
use categories.

`rabbit.log_levels` will work in 3.7.0 **only** if no `categories` are defined.


## <a id="advanced-configuration" class="anchor" href="#advanced-configuration">Advanced Configuration</a>

This section describes the nitty gritty details of the logging
subsystem. Most RabbitMQ installations won't require deep knowledge of
this topic or any of the advanced configuration explained here.

### Lager Handlers and Sinks

RabbitMQ logging subsystem is built on top of [Lager](https://github.com/erlang-lager/lager), a powerful logging
library with several advanced features. Some of them are accessible via
the [log handler and sink abstractions](https://github.com/erlang-lager/lager#configuration).

A sink is an "endpoint" where log entries are written by connections, queues and so on.
A handler is stateful entity that consumes log entries and processes them, e.g.
writes them to a file, sends them to a log collection endpoint or discards them.

By default RabbitMQ creates one file backend handler and one sink per log category (see above).
Changing RabbitMQ log configuration parameters changes log handler used under the hood.
The number of sinks used by RabbitMQ is largely fixed, although 3rd party plugins can
use custom sinks and with a certain amount of configuration it may be possible e.g.
to log those messages separately from the rest.

When RabbitMQ is started with default logging settings, a Lager handler is configured
under the hood and it looks like this:

<pre class="sourcecode erlang">
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

<pre class="sourcecode ini">
log.console = true
log.console.level = warning
</pre>

then generated handlers configuration will look something like this:

<pre class="sourcecode erlang">
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

In the above example, a new `lager_console_backend` handler is added to the `handlers` and
`upgrade_lager_event` sink handlers.
Because `upgrade` category defines a separate file by default, all default handlers
are copied to the sink handlers and the `file` setting is modified.

If a target log file is configured for a category via a `log.<category>.file` config entry, all log messages
in that category will be written to **this file only** as well as non-file backends.

If having upgrade logs in the default log file is desired, or log files are configured in
`handlers`, category-specific files should be disabled. This is done with

<pre class="sourcecode ini">
log.upgrade.file = false
</pre>

or

<pre class="sourcecode erlang">
[{rabbit, [{log, [{categories, [{upgrade, [{file, false}]}]}]}]}].
</pre>

in the [classic configuration format](/configure.html#config-file-formats).

You can add any additional handlers to default lager configuration or to sinks by
setting `handlers` to `extra_sinks` in the `lager` application config.

Handlers configured in the `lager` config will be **merged** with those generated
by RabbitMQ. So messages will be logged by your custom handlers and by
the generated ones.

If you set a sink with the same name as RabbitMQ category sinks, it's handlers
will be **merged** with the generated category sink. So messages logged in the
category will be logged in the configured handlers and redirected to default sink.

You can disable RabbitMQ handlers or sinks using RabbitMQ configuration. For example
by setting `level` to `none` for handlers and categories.


### Custom Handler Examples

To create an additional log file for errors only, create an
additional handler with the `error` level. This has to be done using the
[advanced config file](/configure.html):

<pre class="sourcecode erlang">
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

<pre class="sourcecode erlang">
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

<pre class="sourcecode erlang">
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
