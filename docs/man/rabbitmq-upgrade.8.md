RABBITMQ-UPGRADE(8) - FreeBSD System Manager's Manual

# NAME

**rabbitmq-upgrade** - RabbitMQ installation upgrade tools

# SYNOPSIS

**rabbitmq-upgrade**
\[**-q**]
\[**-s**]
\[**-l**]
\[**-n**&nbsp;*node*]
\[**-t**&nbsp;*timeout*]
*command*
\[*command\_options*]

# DESCRIPTION

**rabbitmq-upgrade**
is a command line tool that provides commands used during the upgrade of RabbitMQ nodes.
See the
[RabbitMQ upgrade guide](https://www.rabbitmq.com/upgrade.html)
to learn more about RabbitMQ installation upgrades.

# OPTIONS

**-n** *node*

> Default node is
> "rabbit@*target-hostname*",
> where
> *target-hostname*
> is the local host.
> On a host named
> "myserver.example.com",
> the node name will usually be
> "rabbit@myserver"
> (unless
> `RABBITMQ_NODENAME`
> has been overridden).
> The output of
> "hostname -s"
> is usually the correct suffix to use after the
> "@"
> sign.
> See
> rabbitmq-server(8)
> for details of configuring a RabbitMQ node.

**-q**, **--quiet**

> Quiet output mode is selected.
> Informational messages are reduced when quiet mode is in effect.

**-s**, **--silent**

> Silent output mode is selected.
> Informational messages are reduced and table headers are suppressed when silent mode is in effect.

**-t** *timeout*, **--timeout** *timeout*

> Operation timeout in seconds.
> Not all commands support timeouts.
> Default is
> **infinity**.

**-l**, **--longnames**

> Must be specified when the cluster is configured to use long (FQDN) node names.
> To learn more, see the
> [RabbitMQ Clustering guide](https://www.rabbitmq.com/clustering.html)

**--erlang-cookie** *cookie*

> Shared secret to use to authenticate to the target node.
> Prefer using a local file or the
> `RABBITMQ_ERLANG_COOKIE`
> environment variable instead of specifying this option on the command line.
> To learn more, see the
> [RabbitMQ CLI Tools guide](https://www.rabbitmq.com/cli.html)

# COMMANDS

**help**

> Displays general help and commands supported by
> **rabbitmq-upgrade**.

**post\_upgrade**

> Runs post-upgrade tasks. In the current version, it performs the rebalance of mirrored and quorum queues across all nodes in the cluster.

**await\_online\_quorum\_plus\_one**

> Waits for all quorum queues to have an above minimum online quorum.
> This makes sure that no queues would lose their quorum if the target node is shut down.

**drain**

> Puts the node in maintenance mode. Such nodes will not serve any
> client traffic or considered for hosting any queue leader replicas.

> To learn more, see the
> [RabbitMQ Upgrade guide](https://www.rabbitmq.com/upgrade.html#maintenance-mode)

**revive**

> Puts the node out of maintenance and into regular operating mode.
> Such nodes will again serve client traffic and considered for queue leader replica placement.

> To learn more, see the
> [RabbitMQ Upgrade guide](https://www.rabbitmq.com/upgrade.html#maintenance-mode)

# SEE ALSO

rabbitmqctl(8),
rabbitmq-diagnostics(8),
rabbitmq-server(8),
rabbitmq-queues(8),
rabbitmq-streams(8),
rabbitmq-service(8),
rabbitmq-env.conf(5),
rabbitmq-echopid(8)

# AUTHOR

The RabbitMQ Team &lt;[rabbitmq-core@groups.vmware.com](mailto:rabbitmq-core@groups.vmware.com)&gt;

RabbitMQ Server - June 22, 2023
