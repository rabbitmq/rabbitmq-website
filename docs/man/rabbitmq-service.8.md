RABBITMQ-SERVICE.BAT(8) - FreeBSD System Manager's Manual

# NAME

**rabbitmq-service.bat** - tool for managing RabbitMQ Windows service

# SYNOPSIS

**rabbitmq-service.bat**
\[*command*]

# DESCRIPTION

RabbitMQ is an open source multi-protocol messaging broker.

Running
**rabbitmq-service.bat**
allows the RabbitMQ broker to be run as a service in
Windows&#174; environments.
The RabbitMQ broker service can be started and stopped using the
Windows&#174; services panel.

By default the service will run in the authentication context of the
local system account.
It is therefore necessary to synchronise Erlang cookies between the
local system account (typically
*C:&#92;Windows&#92;.erlang.cookie*
and the account that will be used to run
rabbitmqctl(8).

# COMMANDS

**help**

> Display usage information.

**install**

> Install the service.
> The service will not be started.
> Subsequent invocations will update the service parameters if relevant
> environment variables were modified.

**remove**

> Remove the service.
> If the service is running then it will automatically be stopped before
> being removed.
> No files will be deleted as a consequence and
> rabbitmq-server(8)
> will remain operable.

**start**

> Start the service.
> The service must have been correctly installed beforehand.

**stop**

> Stop the service.
> The service must be running for this command to have any effect.

**disable**

> Disable the service.
> This is the equivalent of setting the startup type to
> **Disabled**
> using the service control panel.

**enable**

> Enable the service.
> This is the equivalent of setting the startup type to
> **Automatic**
> using the service control panel.

# ENVIRONMENT

`RABBITMQ_SERVICENAME`

> Defaults to RabbitMQ.

`RABBITMQ_BASE`

> Note: Windows only. Defaults to the application data directory of the
> current user. This is the location of log and database directories.

`RABBITMQ_NODENAME`

> Defaults to
> "rabbit@".
> followed by the computed hostname.
> Can be used to run multiple nodes on the same host.
> Every node in a cluster must have a unique
> `RABBITMQ_NODENAME`
> To learn more, see the
> [RabbitMQ Clustering guide](https://www.rabbitmq.com/clustering.html)

`RABBITMQ_NODE_IP_ADDRESS`

> By default RabbitMQ will bind to all IPv6 and IPv4 interfaces available.
> This variable limits the node to one network interface or address
> family.
> To learn more, see the
> [RabbitMQ Networking guide](https://www.rabbitmq.com/networking.html)

`RABBITMQ_NODE_PORT`

> AMQP 0-9-1 and AMQP 1.0 port. Defaults to 5672.
> To learn more, see the
> [RabbitMQ Networking guide](https://www.rabbitmq.com/networking.html)

`ERLANG_SERVICE_MANAGER_PATH`

> Defaults to
> *C:&#92;Program&#160;Files&#92;erl&lcub;version}&#92;erts-&lcub;version}&#92;bin*
> (or
> *C:&#92;Program&#160;Files&#160;(x86)&#92;erl&lcub;version}&#92;erts-&lcub;version}&#92;bin*
> for 64-bit environments).
> This is the installation location of the Erlang service manager.

`RABBITMQ_CONSOLE_LOG`

> Set this variable to
> **new or**
> **reuse**
> to have the console output from the server redirected to a file named
> *SERVICENAME.debug*
> in the application data directory of the user that installed the
> service.
> Under Vista this will be
> *C:&#92;Users&#92;AppData&#92;username&#92;SERVICENAME*.
> Under previous versions of Windows this will be
> *C:&#92;Documents and Settings&#92;username&#92;Application Data&#92;SERVICENAME*.
> If
> `RABBITMQ_CONSOLE_LOG`
> is set to
> **new**
> then a new file will be created each time the service starts.
> If
> `RABBITMQ_CONSOLE_LOG`
> is set to
> **reuse**
> then the file will be overwritten each time the service starts.
> The default behaviour when
> `RABBITMQ_CONSOLE_LOG`
> is not set or set to a value other than
> **new**
> or
> **reuse**
> is to discard the server output.

# SEE ALSO

rabbitmqctl(8),
rabbitmq-diagnostics(8),
rabbitmq-plugins(8),
rabbitmq-server(8),
rabbitmq-queues(8),
rabbitmq-streams(8),
rabbitmq-upgrade(8),
rabbitmq-env.conf(5),
rabbitmq-echopid(8)

# AUTHOR

The RabbitMQ Team &lt;[rabbitmq-core@groups.vmware.com](mailto:rabbitmq-core@groups.vmware.com)&gt;

RabbitMQ Server - June 22, 2023
