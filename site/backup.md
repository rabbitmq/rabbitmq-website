# Backup and Restore

## Overview

This guide covers backup and restore procedures for various types of data
a RabbitMQ node may contain.

## <a id="rabbitmq-data" class="anchor" href="#rabbitmq-data">Two Types of Node Data</a>

Every RabbitMQ node has a data directory that stores all the information that resides
on that node.

A data directory contains two types of data: definitions (metadata, schema/topology) and
message store data.

### <a id="rabbitmq-definitions" class="anchor" href="#rabbitmq-definitions">Definitions (Topology)</a>

Nodes and clusters store information that can be thought of schema, metadata or topology.
Users, vhosts, queues, exchanges, bindings, runtime parameters all fall into this category.

Definitions can be exported and imported via the [HTTP API](/management.html), [CLI tools](/cli.html) and via
declarations performed by client libraries (apps).

Definitions are stored in an internal database and replicated across all cluster nodes.
Every node in a cluster has its own replica of all definitions. When a part of definitions changes,
the update is performed on all nodes in a single transaction. In the context of backups this
means that in practice definitions can be exported from any cluster node with the same result.

### <a id="rabbitmq-messages" class="anchor" href="#rabbitmq-messages">Messages</a>

Messages are stored in a message store. For the purpose of this guide we will define "message store"
as an internal store for messages, a single entity that's transparent to the user.

Each node has its own data directory and stores messages for the queues that have
their master hosted on that node. Messages can be replicated between nodes using [queue mirroring](/ha.html).
Messages are stored in subdirectories of the node's data directory.

### <a id="data-lifespan" class="anchor" href="#data-lifespan">Data Lifecycle</a>

Definitions are usually mostly static, while messages are continuously flowing from publishers to
consumers.

When performing a backup, first step is deciding whether to back up only definitions
or the message store as well.
Because messages are often short-lived and possibly transient, backing them up from under
a running node is highly discouraged and can lead to an inconsistent snapshot of the data.

Definitions can only be backed up from a running node.

## <a id="definitions-backup" class="anchor" href="#definitions-backup">Backing Up Definitions</a>

Definitions can be exported to a JSON file or backed up manually. In
most cases, definition export/import is the optimal way of doing
it. Manual backup will require additional steps if the node name or
hostname changes.

### <a id="definitions-export" class="anchor" href="#definitions-export">Exporting Definitions</a>

Definitions are exported as a JSON file using the [HTTP API](/management.html):

 * There's a definitions pane on the Overview page
 * [rabbitmqadmin](/management-cli.html) provides a command that exports definitions
 * The `GET /api/definitions` API endpoint can be invoked directly

Definitions can be exported for a specific vhost or the entire cluster (or standalone node).
When only a single vhost definitions are exported, some information (e.g. cluster users and their permissions)
will be excluded from the resulting file.

Exported user data contains password hashes as well as hashing function information. While brute forcing
passwords with hashing functions such as SHA-256 or SHA-512 is not a completely trivial task, user
records should be considered sensitive information.


### <a id="definitions-import" class="anchor" href="#definitions-import">Importing Definitions</a>

A JSON file with definitions can be imported using the same three ways

 * There's a definitions pane on the Overview page
 * [rabbitmqadmin](/management-cli.html) provides a command that imports definitions
 * The `POST /api/definitions` API endpoint can be invoked directly

It is also possible to load definitions from a local file on node boot, via the
[`load_definitions` configuration parameter](/management.html#load-definitions).

Importing a definitions file is sufficient for creating a broker with
an identical set of definitions (e.g. users, vhosts, permissions,
topologies).

### <a id="manual-definitions-backup" class="anchor" href="#manual-definitions-backup">Manually Backing Up Definitions</a>

Definitions are stored in an internal database located in the node's data
directory. To get the directory path, run the following
command against a running RabbitMQ node:

<pre class="sourcecode sh">
rabbitmqctl eval 'rabbit_mnesia:dir().'
</pre>

If the node isn't running, it is possible to inspect [default data directories](/relocate.html).

* For Debian and RPM packages: `/var/lib/rabbitmq/mnesia`
* For Windows: `%APP_DATA%\RabbitMQ\db`
* For standalone MacOS and generic UNIX packages: `{installation_root}/var/lib/rabbitmq/mnesia`

The above data directory will also contain message store data in a subdirectory. If you don't want to
copy the messages, skip copying the [message directories](#manual-messages-backup).

### <a id="manual-definitions-restore" class="anchor" href="#manual-definitions-restore">Restoring from a Manual Definitions Backup</a>

Internal node database stores node's name in certain records. Should node name change, the database must first
be updated to reflect the change using the following [rabbitmqctl](/cli.html) command:

<pre class="sourcecode sh">
rabbitmqctl rename_cluster_node &lt;oldnode&gt; &lt;newnode&gt;
</pre>

The command can take multiple old name/new name pairs if multiple nodes in a cluster are being renamed
at the same time.

When a new node starts with a backed up directory and a matching node name, it should perform
the upgrade steps as needed and proceed booting.


## <a id="messages-backup" class="anchor" href="#messages-backup">Backing Up Messages</a>

To back up messages on a node it **must be first stopped**.

In the case of a cluster with [mirrored queues](/ha.html), you need to
stop the entire cluster to take a backup. If you stop one node at a
time, you may loose messages or have duplicates, exactly like when you
back up a single running node.

### <a id="manual-messages-backup" class="anchor" href="#manual-messages-backup">Manually Backing Up Messages</a>

Presently this is the only way of backing up messages.

Message data is stored in the [node's data directory](/relocate.html) mentioned above.

In RabbitMQ versions starting with 3.7.0 all messages data is combined in the
`msg_stores/vhosts` directory and stored in a subdirectory per vhost.
Each vhost directory is named with a hash and contains a `.vhost` file with
the vhost name, so a specific vhost's message set can be backed up separately.

In RabbitMQ versions prior to 3.7.0 messages are stored in several directories
under the node data directory: `queues`, `msg_store_persistent` and `msg_store_transient`.
Also there is a `recovery.dets` file which contains recovery metadata if the node
was stopped gracefully.

### <a id="manual-messages-restore" class="anchor" href="#manual-messages-restore">Restoring from a Manual Messages Backup</a>

When a node boots, it will compute its data directory location and restore messages.
For messages to be restored, the broker should have all the definitions already in place.
Message data for unknown vhosts and queues will not be loaded and can be deleted by the node.
Therefore when backing up message directories manually it is important to make sure that the
definitions are already available on the target node (the one undergoing a restore), either
via a definition file import or by backing up the entire node data directory.

If a node's data directory was backed up manually (copied), the node should start with all
the definitions and messages. There is no need to import definitions first.
