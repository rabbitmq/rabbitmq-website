RABBITMQ-PLUGINS(8) - FreeBSD System Manager's Manual

# NAME

**rabbitmq-plugins** - command line tool for managing RabbitMQ plugins

# SYNOPSIS

**rabbitmq-plugins**
\[**-q**]
\[**-s**]
\[**-l**]
\[**-n**&nbsp;*node*]
\[**-t**&nbsp;*timeout*]
*command*
\[*command\_options*]

# DESCRIPTION

**rabbitmq-plugins**
is a command line tool for managing RabbitMQ plugins.
See the
[RabbitMQ Plugins guide](https://www.rabbitmq.com/plugins.html)
for an overview of RabbitMQ plugins and how they are used.

**rabbitmq-plugins**
allows the operator to enable, disable and inspect plugins.
It must be run by a user with write permissions to the RabbitMQ
configuration directory.

Plugins can depend on other plugins.
**rabbitmq-plugins**
resolves the dependencies and enables or disables all dependencies
so that the user doesn't have to manage them explicitly.
Plugins listed on the
**rabbitmq-plugins**
command line are marked as explicitly enabled; dependent plugins are
marked as implicitly enabled.
Implicitly enabled plugins are automatically disabled again when they
are no longer required.

The
**enable**,
**disable**,
and
**set**
commands will update the plugins file and then attempt to connect to the
broker and ensure it is running all enabled plugins.
By default if it is not possible to connect to and authenticate with the target node
(for example if it is stopped), the operation will fail.
If
**rabbitmq-plugins**
is used on the same host as the target node,
**--offline**
can be specified to make
**rabbitmq-plugins**
resolve and update plugin state directly (without contacting the node).
Such changes will only have an effect on next node start.
To learn more, see the
[RabbitMQ Plugins guide](https://www.rabbitmq.com/plugins.html)

# OPTIONS

**-n** *node*

> Default node is
> "*rabbit@target-hostname*",
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

**list** \[**-Eemv**] \[*pattern*]

> **-E**

> > Show only explicitly enabled plugins.

> **-e**

> > Show only explicitly or implicitly enabled plugins.

> **-m**

> > Show only plugin names (minimal).

> **-v**

> > Show all plugin details (verbose).

> *pattern*

> > Pattern to filter the plugin names by.

> Lists all plugins, their versions, dependencies and descriptions.
> Each plugin is prefixed with two status indicator characters inside \[ ].
> The first indicator can be:

> **&lt;space&gt;**

> > to indicate that the plugin is not enabled

> **E**

> > to indicate that it is explicitly enabled

> **e**

> > to indicate that it is implicitly enabled

> **&zwnj;**

> > to indicate that it is enabled but missing and thus not operational

> The second indicator can be:

> **&lt;space&gt;**

> > to show that the plugin is not running

> **\*&zwnj;**

> > to show that it is

> If the optional pattern is given, only plugins whose name matches
> *pattern*
> are shown.

> For example, this command lists all plugins, on one line each

> > rabbitmq-plugins list

> This command lists all plugins:

> > rabbitmq-plugins list -v

> This command lists all plugins whose name contains "management".

> > rabbitmq-plugins list -v management

> This command lists all implicitly or explicitly enabled RabbitMQ plugins.

> > rabbitmq-plugins list -e rabbit

**enable** \[**--offline**] \[**--online**] *plugin ...*

> **--offline**

> > Modify node's enabled plugin state directly without contacting the node.

> **--online**

> > Treat a failure to connect to the running broker as fatal.

> *plugin*

> > One or more plugins to enable.

> Enables the specified plugins and all their dependencies.

> For example, this command enables the
> "shovel"
> and
> "management"
> plugins and all their dependencies:

> > rabbitmq&#45;plugins enable rabbitmq\_shovel rabbitmq\_management

**disable** \[**--offline**] \[**--online**] *plugin ...*

> **--offline**

> > Modify node's enabled plugin state directly without contacting the node.

> **--online**

> > Treat a failure to connect to the running broker as fatal.

> *plugin*

> > One or more plugins to disable.

> Disables the specified plugins and all their dependencies.

> For example, this command disables
> "rabbitmq\_management"
> and all plugins that depend on it:

> > rabbitmq-plugins disable rabbitmq\_management

**set** \[**--offline**] \[**--online**] \[*plugin ...*]

> **--offline**

> > Modify node's enabled plugin state directly without contacting the node.

> **--online**

> > Treat a failure to connect to the running broker as fatal.

> *plugin*

> > Zero or more plugins to disable.

> Enables the specified plugins and all their dependencies.
> Unlike
> **enable**,
> this command ignores and overwrites any existing enabled plugins.
> **set**
> with no plugin arguments is a legal command meaning "disable all plugins".

> For example, this command enables the
> "management"
> plugin and its dependencies and disables everything else:

> > rabbitmq-plugins set rabbitmq\_management

# SEE ALSO

rabbitmqctl(8),
rabbitmq-diagnostics(8),
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
