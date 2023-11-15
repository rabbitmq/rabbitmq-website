RABBITMQ-ECHOPID.BAT(8) - FreeBSD System Manager's Manual

# NAME

**rabbitmq-echopid.bat** - returns the Windows process id of the Erlang runtime running RabbitMQ

# SYNOPSIS

**rabbitmq-echopid.bat**
*sname*

# DESCRIPTION

RabbitMQ is an open source multi-protocol messaging broker.

Running
**rabbitmq-echopid.bat**
will attempt to discover and echo the process id (PID) of the Erlang
runtime process
(*erl.exe*)
that is hosting RabbitMQ.
To allow
*erl.exe*
time to start up and load RabbitMQ, the script will wait for ten seconds
before timing out if a suitable PID cannot be found.

If a PID is discovered, the script will echo it to stdout
before exiting with a
`ERRORLEVEL`
of 0.
If no PID is discovered before the timeout, nothing is written to stdout
and the script exits setting
`ERRORLEVEL`
to 1.

Note that this script only exists on Windows due to the need to wait for
*erl.exe*
and possibly time-out.
To obtain the PID on Unix set
`RABBITMQ_PID_FILE`
before starting
rabbitmq-server(8)
and do not use
**-detached**.

# OPTIONS

*sname*

> The short-name form of the RabbitMQ node name.

# SEE ALSO

rabbitmq-plugins(8),
rabbitmq-server(8),
rabbitmq-service(8),
rabbitmqctl(8)

# AUTHOR

The RabbitMQ Team &lt;[rabbitmq-core@groups.vmware.com](mailto:rabbitmq-core@groups.vmware.com)&gt;

RabbitMQ Server - June 22, 2023
