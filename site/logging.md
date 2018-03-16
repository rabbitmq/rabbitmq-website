# Logging

## Introduction

This guide describes various aspects of logging in RabbitMQ:

 * Log file location
 * Log levels
 * Log categories
 * Supported log outputs
 * Advanced configuration topics (custom log handlers, sinks, etc)

As of 3.7.0 RabbitMQ uses the [Lager](https://github.com/erlang-lager/lager) logging library
under the hood. The library supports logging to a file, console or a number of other sources
via 3rd party plugins and provides a fair amount of flexibility when it comes to configuration.

## Log File Location

Prior to 3.7.0 there were two log files: for regular messages and unhandled
exceptions. As of 3.7.0 a single log file is used for all messages
by default.

Default log file location is covered
in the [File and Directory Location](/relocate.html) guide.

You can modify the default location either by using a configuration file, or
by setting the `RABBITMQ_LOGS` environment variable. Effective log
file path can be discovered using [RabbitMQ management UI](/management.html) or
CLI commands such as `rabbitmqctl environment`.

`RABBITMQ_LOGS` variable value can be either a file path or `-`, which means
all log messages should be printed to standard output.

The environment variable takes precedence over the configuration file.
When in doubt, consider overriding log file location via the config file.


## Configuration

RabbitMQ initializes its logging subsystem on node start.
See the [Configuration guide](/configure.html) for a general overview
of how RabbitMQ nodes are configured.


### Log Outputs

Default RabbitMQ logging configuration will direct log messages to a log file. Standard output is
another option available out of the box.

Multiple outputs can be used at the same time. Log entries will be copied to all of them.

Different outputs can have different log levels, for example, the
console output can be configured to log all messages including debug
information while the file output will log only error and higher
severity messages.


### Logging to a File


 * `log.file`: log file path or `false` to disable the file output. Default value is taken from an [environment variable](relocate.html)
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


### Logging to Console (Standard Output)

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


## <a id="log-message-categories" /> Log Message Categories

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

### Log Levels

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

### Enabling Debug Logging

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


## Upgrading From pre-3.7 Versions

RabbitMQ versions prior to 3.7.0 had a different logging subsystem.

Older installations use two log files:
`<nodename>.log` and `<nodename>_sasl.log` (`<nodename>` is `rabbit@{hostname}` by default).

Where `<nodename>.log` contains RabbitMQ logs, while `<nodename>_sasl.log` contains
runtime logs, mostly unhandled exceptions.

Starting with 3.7.0 these two files were merged and all errors now can be found in
the `<nodename>.log` file. So `RABBITMQ_SASL_LOGS` environment variable is not used
anymore.

Log levels in pre-3.7.0 versions were configured using `log_levels` environment
variable. Since 3.7 it's been replaced with [categories](#log-message-categories),
which are more descriptive and powerful.

If you have `log_levels` in your `rabbitmq.config` file, you should update it to
use categories. You would probably wish to switch to the new config format.

`rabbit.log_levels` will work in 3.7.0 **only** if no `categories` are defined
because it's not clear which should take precedence.


## Advanced Configuration

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
