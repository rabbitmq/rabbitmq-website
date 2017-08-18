# Rabbitmq logging.

RabbitMQ is using the [lager](https://github.com/erlang-lager/lager) logging library
to print logs. The library can print logs to files, console or syslog service
based on log level or types of log messages.

RabbitMQ configures lager logging on application startup using
[configuration files and environment variables](http://www.rabbitmq.com/configure.html)

The default log file locations are described on the
[file directory locations page](http://www.rabbitmq.com/relocate.html).

You can modify the default location either by using a configuration file, or
by setting the `RABBITMQ_LOGS` environment variable.

`RABBITMQ_LOGS` variable can be a filename or `-` to log all messages to the
standard output.

The environment variable takes precedence over the configuration file setting.

## Log outputs.

RabbitMQ supports logging to a file, to the standard output or to the syslog service.

Multiple outputs can be used at the same time. Log messages will appear in all of them.

Outputs can have different log levels, for example the console output can be
configured to log only error messages, while the file output will log debug messages.

Messages are filtered by level in both categories and outputs, please see
[log levels](#log-levels) for more information about how log levels work.

To configure outputs, you can use RabbitMQ configuration file options:

For the file output:

- `log.file`: log file name or `false` to disable the file output. Default value is taken from [environment variable](http://www.rabbitmq.com/relocate.html)
- `log.file.level`: log level for the file output. Default level is `info`
- `log.file.rotation.date`,
`log.file.rotation.size`,
`log.file.rotation.count` - log file rotation settings.
See [lager configuration](https://github.com/erlang-lager/lager) for possible values.
File rotation via lager is disabled by default.

Or you can use the legacy configuration format:

```
[{rabbit, [
        {log, [
            {file, [{file, "<filename>"}, %% log.file
                    {level, info},        %% log.file.info
                    {date, ""},           %% log.file.rotation.date
                    {size, 0},            %% log.file.rotation.size
                    {count, 1}            %% log.file.rotation.count
                    ]}
        ]}
    ]}].
```

For the console output:

- `log.console`: (boolean) set to `true` to enable console output. Default is `false`
- `log.console.level`: log level for the console output. Default level is `info`

In the legacy configuration format:

```
[{rabbit, [
        {log, [
            {console, [{enabled, true}, %% log.console
                       {level, info}    %% log.console.level
            ]}
        ]}
    ]}].
```

For the syslog output:

- `log.syslog`: (boolean) set to `true` to enable syslog output. Default is `false`
- `log.syslog.level`: the log level for the syslog output. Default level is `info`
- `log.syslog.identity`: syslog identity string. Default is `"rabbitmq"`
- `log.syslog.facility`: syslog facility. Default is `daemon`

In the legacy configuration format:

```
[{rabbit, [
        {log, [
            {syslog, [{enabled, true},        %% log.syslog
                      {level, info},          %% log.syslog.level
                      {identity, "rabbitmq"}, %% log.syslog.identity
                      {facility, daemon}      %% log.syslog.facility
            ]}
        ]}
    ]}].
```

If you enable console or syslog output, the file output will still be enabled by
default. To disable the file output, set `log.file` to `false`.

Please note that `RABBITMQ_LOGS` set to `-` will disable the file output
even in `log.file` is configured.

## Log message categories

RabbitMQ has several categories of messages, which can be logged with different
levels or to different files.

The categories replace pre-3.7 `log_levels` configuration.

These categories are:

- `connection` - connection logs (for AMQP, MQTT and STOMP). Mostly opening/closing connections.
- `channel` - channel logs. Errors and warnings on AMQP channels.
- `queue` - queue logs. Mostly debug messages
- `mirroring` - queue mirroring logs. Queue mirrors status changes: starting/stopping/synchronizing.
- `federation` - federation plugin logs.
- `upgrade` - verbose upgrade logs. Some upgrade logs can be too big to pollute the default log file.
- `default` - all other logs. You cannot override a filename for this category.

You can configure a different log level or file location for each message category
using `log.<category>.level` and `log.<category>.file` configuration variables.

For example to enable debug logs for connections:

```
log.connection.level = debug
```

In legacy config format:

```
[{rabbit,
    [{log,
        [{categories,
            [{connection,
                [{level, debug}]
            }]
        }]
    }]
}].
```

To redirect all federation logs to the `rabbit_federation.log` file:

```
log.federation.file = rabbit_federation.log
```

In legacy config format:

```
[{rabbit,
    [{log,
        [{categories,
            [{federation,
                [{file, "rabbit_federation.log"}]
            }]
        }]
    }]
}]
```

To disable a log type, you can use the `none` log level. For example to disable
upgrade logs:

```
log.upgrade.level = none
```

```
[{rabbit,
    [{log,
        [{categories,
            [{upgrade,
                [{level, none}]
            }]
        }]
    }]
}].
```

## Log levels

Log levels have severity associated with them. Most critical messages have lower
severity number, while `debug` have highest number, so levels can be compared.

Following log levels are supported by RabbitMQ logging with numerical
severities as used in lager:

- `debug`     - 128
- `info`      - 64
- `notice`    - 32
- `warning`   - 16
- `error`     - 8
- `critical`  - 4
- `alert`     - 2
- `emergency` - 1
- `none`      - 0

The `none` level means that no messages should be logged.

When a message is logged, if the level number is higher than the category level,
the message will be dropped and not sent to outputs.

It works the same way for outputs. If a message level number is higher than the
output level - the message will not be logged.

For example if you don't have any output to handle `debug` messages, even if you set
a category level to `debug`, the debug messages will not be logged.

At the same time if you set an output log level to `debug`, debug messages will
not be logged unless the category level is set to `debug`.

By default all categories and inputs use the `info` log level.


### How to enable debug messages.

To enable debug messages, you should have a debug output and a debug category
configured.

For example to log connection debug messages to a file:

```
log.file.level = debug
log.connection.level = debug
```

In the legacy config format:

```
[{rabbit, [{log, [
    {file, [{level, debug}]},
    {categories, [
        {connection, [{level, debug}]}]}
    ]}]
}].
```

To print default log message to standard out:

```
log.console.enabled = true
log.console.level = debug
log.default.level = debug
```

In the legacy config format:

```
[{rabbit, [{log, [
    {console, [{enabled, true},
               {level, debug}]},
    {categories, [
        {default, [{level, debug}]}]}
    ]}]
}].
```

To enable all debug messages:

```
log.file.level = debug

log.connection.level = debug
log.channel.level = debug
log.queue.level = debug
log.mirroring.level = debug
log.federation.level = debug
log.upgrade.level = debug
log.default.level = debug

```

In the legacy config format:

```
[{rabbit, [{log, [
    {file, [{level, debug}]},
    {categories, [
        {connection, [{level, debug}]},
        {channel, [{level, debug}]},
        {queue, [{level, debug}]},
        {mirroring, [{level, debug}]},
        {federation, [{level, debug}]},
        {upgrade, [{level, debug}]},
        {default, [{level, debug}]}]}
    ]}]
}].
```


# Upgrading from pre-3.7

RabbitMQ versions prior to 3.7 were using different approach to logging.

In the old installations you can see two log files in the logging directory:
`<nodename>.log` and `<nodename>_sasl.log` (`<nodename>` is `rabbit` by default).

Where `<nodename>.log` contains RabbitMQ logs, while `<nodename>_sasl.log` contains
OTP specific logs, mostly errors.

Since version 3.7 these two files were merged and all errors now can be found in
the `<nodename>.log` file. So `RABBITMQ_SASL_LOGS` environment variable is not used
anymore.

Log levels in pre-3.7 versions were configured using `log_levels` environment
variable. Since 3.7 it's been replaced with [categories](#log-message-categories),
which are more descriptive and powerful.

If you have `log_levels` in your `rabbitmq.config` file, you should update it to
use categories. You would probably wish to switch to the new config format.

`log_levels` will work in 3.7 **only** in no `categories` defined,
because it's not clear which should take precedence.

# Advanced

## Lager handlers

The lager library, which is used by RabbitMQ for logging, provides a powerful
mechanism to configure log outputs. [More about lager](https://github.com/erlang-lager/lager)

RabbitMQ startup process generates lager log handlers from RabbitMQ log
configuration.

A default lager handler configuration for RabbitMQ node `rabbit@localhost`
looks like this:

```
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
            [{handlers, [{lager_forwarder_backend,[lager_event,info]}]}]},
        {rabbit_log_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,info]}]}]},
        {rabbit_log_channel_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,info]}]}]},
        {rabbit_log_connection_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,info]}]}]},
        {rabbit_log_mirroring_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,info]}]}]},
        {rabbit_log_queue_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,info]}]}]},
        {rabbit_log_federation_lager_event,
            [{handlers, [{lager_forwarder_backend,[lager_event,info]}]}]},
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
```

By deafult RabbitMQ creates one file backend handler and a sink per log category.

Unlike `lager:log` messages, default `rabbit_log:log` messages will go
into `rabbit_log_lager_event` sink.

Most sinks use `lager_forwarder_backend`. This backend will redirect all messages
with matching level to default lager sink (`lager_event`).

Upgrade sink has it's own log file.

RabbitMQ log configuration parameters change the handlers configured in lager.
The config generation is performed by the `rabbit_lager` module.

For example if you set up console logs using
```
log.console = true
log.console.level = warning
```

The generated handlers configuration will look like:
```
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
        [{error_logger_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event, info]}]}]},
         {rabbit_log_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                       info]}]}]},
         {rabbit_log_channel_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                               info]}]}]},
         {rabbit_log_connection_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                                  info]}]}]},
         {rabbit_log_mirroring_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                                 info]}]}]},
         {rabbit_log_queue_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                             info]}]}]},
         {rabbit_log_federation_lager_event,[{handlers,[{lager_forwarder_backend,[lager_event,
                                                                                  info]}]}]},
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
```

So a new `lager_console_backend` handler is added to `handlers` and
`upgrade_lager_event` sink handlers.
Because `upgrade` category defines a separate file by default, all default handlers
are copied to the sink handlers and the `file` setting is modified.

Please note that if you set `log.<category>.file` configuration, all the category
logs will be written to **this file only** or non-file backends.
If you want to have upgrade logs in the default log file or log files configured in
`handlers`, you should disable category-specific file. You can do that by setting
`log.upgrade.file = false`,
or `[{rabbit, [{log, [{categories, [{upgrade, [{file, false}]}]}]}]}].`
in the legacy format.

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

### Examples using custom handlers:

If you want to create an additional log file for errors only, you can create an
additional handler with the `error` level.

```
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
```

If you want to use a custom lager backend and disable RabbitMQ default handlers:

```
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
```

If you want to direct connection logs to console instead of default output:

```
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
```