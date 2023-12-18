RABBITMQ-QUEUES(8) - FreeBSD System Manager's Manual

# NAME

**rabbitmq-queues** - RabbitMQ queue management tools

# SYNOPSIS

**rabbitmq-queues**
\[**-q**]
\[**-s**]
\[**-l**]
\[**-n**&nbsp;*node*]
\[**-t**&nbsp;*timeout*]
*command*
\[*command\_options*]

# DESCRIPTION

**rabbitmq-queues**
is a command line tool that provides commands used to manage queues,
for example, grow, shrink or rebalance replicas of replicated queue types.
See the
[RabbitMQ quorum queues guide](https://www.rabbitmq.com/quorum-queues.html)
and the general
[RabbitMQ queues guide](https://www.rabbitmq.com/queues.html)
to learn more about queue types in RabbitMQ.

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
> **rabbitmq-queues**.

## Cluster

**grow** *node* *selector* **--vhost-pattern** *pattern* **--queue-pattern** *pattern* **--errors-only**

> Adds a new replica on the given node for all or a half of matching quorum queues.

> Supported
> *selector*
> values are:

> **all**

> > Selects all quorum queues

> **even**

> > Selects quorum queues with an even number of replicas

> Example:

> > rabbitmq-queues grow "rabbit@newhost" "all" --vhost-pattern "a-vhost" --queue-pattern ".\*"

**rebalance** *type* **--vhost-pattern** *pattern* **--queue-pattern** *pattern*

> Rebalances queue leader replicas across cluster nodes.

> Supported
> *type*
> values are:

> **all**

> > All queue types

> **quorum**

> > Only quorum queues

> **classic**

> > Only classic queues

> **stream**

> > Only streams

> Example:

> > rabbitmq-queues rebalance "all" --vhost-pattern "a-vhost" --queue-pattern ".\*"

**shrink** *node*

> Shrinks quorum queue clusters by removing any members (replicas) on the given node.

> Example:

> > rabbitmq-queues shrink "rabbit@decomissioned-node"

## Replication

**add\_member** *queue* *node* **--vhost** *virtual-host*

> Adds a quorum queue member (replica) on the given node.

> Example:

> > rabbitmq-queues add\_member --vhost "a-vhost" "a-queue" "rabbit@new-node"

**delete\_member** *queue* *node* **--vhost** *virtual-host*

> Removes a quorum queue member (replica) on the given node.

> Example:

> > rabbitmq-queues delete\_member --vhost "a-vhost" "a-queue" "rabbit@decomissioned-node"

## Queues

**quorum\_status** *queue* **--vhost** *virtual-host*

> Displays quorum status of a quorum queue.

> Example:

> > rabbitmq-queues quorum\_status --vhost "a-vhost" "a-queue"

**peek** *queue* *position* **--vhost** *virtual-host* **--timeout**

> Displays the details of a message at the given position in the queue.
> This command is currently only supported by quorum queues.

> Example:

> > rabbitmq-queues peek --vhost "a-vhost" "a-queue" "1"

**check\_if\_node\_is\_mirror\_sync\_critical**

> Health check that exits with a non-zero code if there are classic mirrored queues without online synchronised mirrors (queues that would potentially lose data if the target node is shut down).

> Example:

> > rabbitmq-queues check\_if\_node\_is\_mirror\_sync\_critical

**check\_if\_node\_is\_quorum\_critical**

> Health check that exits with a non-zero code if there are queues with minimum online quorum (queues that would lose their quorum if the target node is shut down).

> Example:

> > rabbitmq-queues check\_if\_node\_is\_quorum\_critical

# SEE ALSO

rabbitmqctl(8),
rabbitmq-diagnostics(8),
rabbitmq-server(8),
rabbitmq-streams(8),
rabbitmq-upgrade(8),
rabbitmq-service(8),
rabbitmq-env.conf(5),
rabbitmq-echopid(8)

# AUTHOR

The RabbitMQ Team &lt;[rabbitmq-core@groups.vmware.com](mailto:rabbitmq-core@groups.vmware.com)&gt;

RabbitMQ Server - June 22, 2023
