RABBITMQ-DIAGNOSTICS(8) - FreeBSD System Manager's Manual

# NAME

**rabbitmq-diagnostics** - RabbitMQ diagnostics, monitoring and health checks tools

# SYNOPSIS

**rabbitmq-diagnostics**
\[**-q**]
\[**-s**]
\[**-l**]
\[**-n**&nbsp;*node*]
\[**-t**&nbsp;*timeout*]
*command*
\[*command\_options*]

# DESCRIPTION

**rabbitmq-diagnostics**
is a command line tool that provides commands used for diagnostics, monitoring
and health checks of RabbitMQ nodes.
See the
[RabbitMQ documentation guides](https://rabbitmq.com/documentation.html)
to learn more about RabbitMQ diagnostics, monitoring and health checks.

**rabbitmq-diagnostics**
allows the operator to inspect node and cluster state. A number of
health checks are available to be used interactively and by monitoring tools.

By default if it is not possible to connect to and authenticate with the target node
(for example if it is stopped), the operation will fail.
To learn more, see the
[RabbitMQ Monitoring guide](https://rabbitmq.com/monitoring.html)

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
> [RabbitMQ Clustering guide](https://rabbitmq.com/clustering.html)

**--erlang-cookie** *cookie*

> Shared secret to use to authenticate to the target node.
> Prefer using a local file or the
> `RABBITMQ_ERLANG_COOKIE`
> environment variable instead of specifying this option on the command line.
> To learn more, see the
> [RabbitMQ CLI Tools guide](https://rabbitmq.com/cli.html)

# COMMANDS

Most commands provided by
**rabbitmq-diagnostics**
inspect node and cluster state or perform health checks.

Commands that list topology entities (e.g. queues) use tab as column delimiter.
These commands and their arguments are delegated to rabbitmqctl(8).

Some commands (
**list\_queues**,
**list\_exchanges**,
**list\_bindings**
and
**list\_consumers**)
accept an optional
*vhost*
parameter.

The
**list\_queues**,
**list\_exchanges**
and
**list\_bindings**
commands accept an optional virtual host parameter for which to display
results.
The default value is
"/".

## Help

**help** \[**-l**] \[*command\_name*]

> Prints usage for all available commands.

> **-l**, **--list-commands**

> > List command usages only, without parameter explanation.

> *command\_name*

> > Prints usage for the specified command.

**version**

> Displays CLI tools version

## Nodes

**wait**

> See
> **wait**
> in
> rabbitmqctl(8)

## Cluster

**cluster\_status**

> See
> **cluster\_status**
> in
> rabbitmqctl(8)

## Users

**list\_users**

> See
> **list\_users**
> in
> rabbitmqctl(8)

## Access Control

**list\_permissions** \[**-p** *vhost*]

> See
> **list\_permissions**
> in
> rabbitmqctl(8)

**list\_topic\_permissions** \[**-p** *vhost*]

> See
> **list\_topic\_permissions**
> in
> rabbitmqctl(8)

**list\_user\_permissions** *username*

> See
> **list\_user\_permissions**
> in
> rabbitmqctl(8)

**list\_user\_topic\_permissions** *username*

> See
> **list\_user\_topic\_permissions**
> in
> rabbitmqctl(8)

**list\_vhosts** \[*vhostinfoitem ...*]

> See
> **list\_vhosts**
> in
> rabbitmqctl(8)

## Monitoring, observability and health checks

**alarms**

> Lists resource alarms, if any, in the cluster.

> See
> [RabbitMQ Resource Alarms guide](https://rabbitmq.com/alarms.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics alarms

**certificates**

> Displays the node certificates for every listener on target node that is configured to use TLS.

> Example:

> > rabbitmq-diagnostics certificates

**check\_alarms**

> Health check that fails (returns with a non-zero code) if there are alarms
> in effect on any of the cluster nodes.

> See
> [RabbitMQ Resource Alarms guide](https://rabbitmq.com/alarms.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics check\_alarms

**check\_certificate\_expiration** \[**--unit** *time\_unit*] \[**--within** *seconds*]

> Checks the expiration date on the certificates for every listener on target node that is configured to use TLS.
> Supported time units are:

> *	days

> *	weeks

> *	months

> *	years

> Example:

> > rabbitmq-diagnostics check\_certificate\_expiration --unit weeks --within 6

**check\_local\_alarms**

> Health check that fails (returns with a non-zero code) if there are alarms
> in effect on the target node.

> See
> [RabbitMQ Resource Alarms guide](https://rabbitmq.com/alarms.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics check\_local\_alarms

**check\_port\_connectivity**

> Health check that fails (returns with a non-zero code) if any listener ports
> on the target node cannot accept a new TCP connection opened by
> **rabbitmq-diagnostics**

> The check only validates if a new TCP connection is accepted. It does not
> perform messaging protocol handshake or authenticate.

> See
> [RabbitMQ Networking guide](https://rabbitmq.com/networking.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics check\_port\_connectivity

**check\_port\_listener** *port*

> Health check that fails (returns with a non-zero code) if the target node
> is not listening on the specified port (there is no listener that
> uses that port).

> See
> [RabbitMQ Networking guide](https://rabbitmq.com/networking.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics check\_port\_listener 5672

**check\_protocol\_listener** *protocol*

> Health check that fails (returns with a non-zero code) if the target node
> does not have a listener for the specified protocol.

> See
> [RabbitMQ Networking guide](https://rabbitmq.com/networking.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics check\_protocol\_listener mqtt

**check\_running**

> Health check that fails (returns with a non-zero code) if the RabbitMQ
> application is not running on the target node.

> If
> **rabbitmqctl(8)**
> was used to stop the application, this check will fail.

> Example:

> > rabbitmq-diagnostics check\_running

**check\_virtual\_hosts**

> Health check that checks if all vhosts are running in the target node

> Example:

> > rabbitmq-diagnostics check\_virtual\_hosts --timeout 60

**cipher\_suites**

> Lists cipher suites enabled by default. To list all available cipher suites, add the --all argument.

> Example:

> > rabbitmq-diagnostics cipher\_suites --format openssl --all

**command\_line\_arguments**

> Displays target node's command-line arguments and flags as reported by the runtime.

> Example:

> > rabbitmq-diagnostics command\_line\_arguments -n rabbit@hostname

**consume\_event\_stream** \[**--duration** *seconds* | **-d** *seconds*] \[**--pattern** *pattern*] \[**--timeout** *milliseconds*]

> Streams internal events from a running node. Output is jq-compatible.

> Example:

> > rabbitmq-diagnostics consume\_event\_stream -n rabbit@hostname --duration 20 --pattern queue\_.\*

**discover\_peers**

> Runs a peer discovery on the target node and prints the discovered nodes, if any.

> See
> [RabbitMQ Cluster Formation guide](https://rabbitmq.com/cluster-formation.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics discover\_peers --timeout 60

**environment**

> See
> **environment**
> in
> rabbitmqctl(8)

**erlang\_cookie\_hash**

> Outputs a hashed value of the shared secret used by the target node
> to authenticate CLI tools and peers. The value can be compared with the hash
> found in error messages of CLI tools.

> See
> [RabbitMQ Clustering guide](https://rabbitmq.com/clustering.html#erlang-cookie)
> to learn more.

> Example:

> > rabbitmq-diagnostics erlang\_cookie\_hash -q

**erlang\_version**

> Reports target node's Erlang/OTP version.

> Example:

> > rabbitmq-diagnostics erlang\_version -q

**is\_booting**

> Reports if RabbitMQ application is currently booting (not booted/running or stopped) on
> the target node.

> Example:

> > rabbitmq-diagnostics is\_booting

**is\_running**

> Reports if RabbitMQ application is fully booted and running (that is, not stopped) on
> the target node.

> Example:

> > rabbitmq-diagnostics is\_running

**list\_bindings** \[**-p** *vhost*] \[*bindinginfoitem ...*]

> See
> **list\_bindings**
> in
> rabbitmqctl(8)

**list\_channels** \[*channelinfoitem ...*]

> See
> **list\_channels**
> in
> rabbitmqctl(8)

**list\_ciphers**

> See
> **list\_ciphers**
> in
> rabbitmqctl(8)

**list\_connections** \[*connectioninfoitem ...*]

> See
> **list\_connections**
> in
> rabbitmqctl(8)

**list\_consumers** \[**-p** *vhost*]

> See
> **list\_consumers**
> in
> rabbitmqctl(8)

**list\_exchanges** \[**-p** *vhost*] \[*exchangeinfoitem ...*]

> See
> **list\_exchanges**
> in
> rabbitmqctl(8)

**list\_hashes**

> See
> **list\_hashes**
> in
> rabbitmqctl(8)

**list\_queues** \[**-p** *vhost*] \[**--offline** | **--online** | **--local**] \[*queueinfoitem ...*]

> See
> **list\_queues**
> in
> rabbitmqctl(8)

**list\_unresponsive\_queues** \[**--local**] \[**--queue-timeout** *milliseconds*] \[*column ...*] \[**--no-table-headers**]

> See
> **list\_unresponsive\_queues**
> in
> rabbitmqctl(8)

**listeners**

> Lists listeners (bound sockets) on this node. Use this to inspect
> what protocols and ports the node is listening on for client, CLI tool
> and peer connections.

> See
> [RabbitMQ Networking guide](https://rabbitmq.com/networking.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics listeners

**log\_tail** \[**--number** *number* | **-N** *number* \[**--timeout** *milliseconds*]

Prints the last N lines of the log on the node

Example:

	rabbitmq-diagnostics log_tail --number 100

]

**log\_tail\_stream** \[**--duration** *seconds* | **-d** *seconds*] \[**--timeout** *milliseconds*]

> Streams logs from a running node for a period of time

> Example:

> > rabbitmq-diagnostics log\_tail\_stream --duration 60

**maybe\_stuck**

> Periodically samples stack traces of all Erlang processes
> ("lightweight threads") on the node. Reports the processes for which
> stack trace samples are identical.

> Identical samples may indicate that the process is not making any progress
> but is not necessarily an indication of a problem.

> Example:

> > rabbitmq-diagnostics maybe\_stuck -q

**memory\_breakdown** \[**--unit** *memory\_unit*]

> Displays node's memory usage by category.
> Supported memory units are:

> *	bytes

> *	megabytes

> *	gigabytes

> *	terabytes

> See
> [RabbitMQ Memory Use guide](https://rabbitmq.com/memory-use.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics memory\_breakdown --unit gigabytes

**observer** \[**--interval** *seconds*]

> Starts a CLI observer interface on the target node

> Example:

> > rabbitmq-diagnostics observer --interval 10

**ping**

> Most basic health check. Succeeds if target node (runtime) is running
> and
> **rabbitmq-diagnostics**
> can authenticate with it successfully.

**report**

> See
> **report**
> in
> rabbitmqctl(8)

**runtime\_thread\_stats** \[**--sample-interval** *interval*]

> Performs sampling of runtime (kernel) threads' activity for
> *interval*
> seconds and reports it.

> For this command to work, Erlang/OTP on the target node must be compiled with
> microstate accounting support and have the runtime\_tools package available.

> Example:

> > rabbitmq-diagnostics runtime\_thread\_stats --sample-interval 15

**schema\_info** \[**--no\_table\_headers**] \[*column ...*] \[**--timeout** *milliseconds*]

> See
> **schema\_info**
> in
> rabbitmqctl(8)

**server\_version**

> Reports target node's version.

> Example:

> > rabbitmq-diagnostics server\_version -q

**status**

> See
> **status**
> in
> rabbitmqctl(8)

**tls\_versions**

> Lists all TLS versions supported by the runtime on the target node.
> Note that RabbitMQ can be configured to only accept a subset of those
> versions, for example, SSLv3 is deactivated by default.

> See
> [RabbitMQ TLS guide](https://rabbitmq.com/ssl.html)
> to learn more.

> Example:

> > rabbitmq-diagnostics tls\_versions -q

## Parameters

**list\_global\_parameters**

> See
> **list\_global\_parameters**
> in
> rabbitmqctl(8)

**list\_parameters** \[**-p** *vhost*]

> See
> **list\_parameters**
> in
> rabbitmqctl(8)

## Policies

**list\_operator\_policies** \[**-p** *vhost*]

> See
> **list\_operator\_policies**
> in
> rabbitmqctl(8)

**list\_policies** \[**-p** *vhost*]

> See
> **list\_policies**
> in
> rabbitmqctl(8)

## Virtual hosts

**list\_vhost\_limits** \[**--vhost** *vhost*] \[**--global**] \[**--no-table-headers**]

> See
> **list\_vhost\_limits**
> in
> rabbitmqctl(8)

## Node configuration

**log\_location** \[**--all** | **-a**] \[**--timeout** *milliseconds*]

> Shows log file location(s) on target node

> Example:

> > rabbitmq-diagnostics log\_location -a

## Feature flags

**list\_feature\_flags** \[*column ...*] \[**--timeout** *milliseconds*]

> See
> **list\_feature\_flags**
> in
> rabbitmqctl(8)

## Queues

**quorum\_status** *queue* \[**--vhost** *vhost*]

> See
> **quorum\_status**
> in
> rabbitmq-queues(8)

**check\_if\_node\_is\_mirror\_sync\_critical**

> See
> **check\_if\_node\_is\_mirror\_sync\_critical**
> in
> rabbitmq-queues(8)

**check\_if\_node\_is\_quorum\_critical**

> See
> **check\_if\_node\_is\_quorum\_critical**
> in
> rabbitmq-queues(8)

# SEE ALSO

rabbitmqctl(8),
rabbitmq-server(8),
rabbitmq-queues(8),
rabbitmq-streams(8),
rabbitmq-upgrade(8),
rabbitmq-service(8),
rabbitmq-env.conf(5),
rabbitmq-echopid(8)

# AUTHOR

The RabbitMQ Team &lt;[rabbitmq-core@groups.vmware.com](mailto:rabbitmq-core@groups.vmware.com)&gt;

RabbitMQ Server - June 22, 2023
