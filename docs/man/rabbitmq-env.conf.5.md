RABBITMQ-ENV.CONF(5) - FreeBSD File Formats Manual

# NAME

**rabbitmq-env.conf** - environment variables used by RabbitMQ server

# DESCRIPTION

**rabbitmq-env.conf**
contains environment variables that override the defaults built in to the
RabbitMQ scripts and CLI tools.

The file is interpreted by the system shell, and so should consist of a
sequence of shell environment variable definitions.
Normal shell syntax is permitted (since the file is sourced using the
shell "." operator), including line comments starting with "#".

In order of preference, the startup scripts get their values from the
environment, from
**rabbitmq-env.conf**
and finally from the built-in default values.
For example, for the
`RABBITMQ_NODENAME`
setting,
`RABBITMQ_NODENAME`
from the environment is checked first.
If it is absent or equal to the empty string, then
`NODENAME`
from
**rabbitmq-env.conf**
is checked.
If it is also absent or set equal to the empty string then the default
value from the startup script is used.

The variable names in
**rabbitmq-env.conf**
are always equal to the environment variable names, with the
"RABBITMQ\_"
prefix removed:
`RABBITMQ_NODE_PORT`
from the environment becomes
`NODE_PORT`
in
**rabbitmq-env.conf**.

# EXAMPLES

Below is an example of a minimalistic
**rabbitmq-env.conf**
file that overrides the default node name prefix from "rabbit" to
"hare".

	# I am a complete rabbitmq-env.conf file.

	# Comment lines start with a hash character.

	# This is a /bin/sh script file - use ordinary envt var syntax

	NODENAME=hare

In the below
**rabbitmq-env.conf**
file RabbitMQ configuration file location is changed to "/data/services/rabbitmq/rabbitmq.conf".

	# I am a complete rabbitmq-env.conf file.

	# Comment lines start with a hash character.

	# This is a /bin/sh script file - use ordinary envt var syntax

	CONFIG_FILE=/data/services/rabbitmq/rabbitmq.conf

# SEE ALSO

rabbitmq-echopid(8),
rabbitmq-plugins(8),
rabbitmq-server(8),
rabbitmq-queues(8),
rabbitmq-streams(8),
rabbitmq-upgrade(8),
rabbitmqctl(8)

# AUTHOR

The RabbitMQ Team &lt;[rabbitmq-core@groups.vmware.com](mailto:rabbitmq-core@groups.vmware.com)&gt;

RabbitMQ Server - June 22, 2023
