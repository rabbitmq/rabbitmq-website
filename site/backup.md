# RabbitMQ backup and restore

This guide covers backup and restore mechanisms for RabbitMQ data.

## <a id="rabbitmq-data" class="anchor"/> [Two types of data](#rabbitmq-data)

RabbitMQ data consists of two main components:

### <a id="rabbitmq-definitions" class="anchor"/> [RabbitMQ definitions](#rabbitmq-definitions)

Definitions make the broker topology schema: users, vhosts, queues, exchanges, bindings.
Definitions are controlled by HTTP API, rabbitmqctl commands and `declare` AMQP methods.
Definitions are stored in the Mnesia database and replicated across all nodes in a cluster.
Any node in a cluster has its own replica of definitions, identical to all others.

### <a id="rabbitmq-messages" class="anchor"/> [RabbitMQ messages](#rabbitmq-messages)

Messages are stored in queue indexes and message stores.
Messages are node-local, but can be replicated between nodes using [HA queues mechanism](/ha.html)
Messages are stored in subdirectories of the Mnesia directory.

### <a id="data-lifespan" class="anchor"/> [Lifespan of RabbitMQ data](#data-lifespan)

Definitions are expected to be long-living, while messages are flowing from publishers to
consumers.

When creating a backup, you should decide if you want to save only definitions
or messages too.
Because messages are short-living, it's not recommended to back them up when the broker
is active. Some messages can be lost or duplicated in this case.

## <a id="definitions-backup" class="anchor"/> [Backing up definitions](#definitions-backup)

Definitions can be exported to a JSON file or copied manually. Manual backup will
require additional steps if the node name or hostname changes.

### <a id="definitions-export" class="anchor"/> [Exporting definitions](#definitions-export)

Definitions can be exported to JSON file using the [Management plugin](/management.html).

You can do that on the overview page, using `/api/definitions`
HTTP API endpoint or [rabbitmqadmin tool](/management-cli.html).

Definitions can be exported for a specific vhost or the entire broker.
If you export a single vhost definitions, users data will not be exported.

Exported user data contains raw passwords in some old RabbitMQ versions and
password hashes in recent versions.

### <a id="definitions-import" class="anchor"/> [Importing definitions](#definitions-import)

To import definitions you can also use the overview page, HTTP API or rabbitmqadmin tool.
You can also import definitions on broker startup using
[`load_definitions` configuration parameter](/management.html#load-definitions)

You can create simple broker replicas by importing definitions.

### <a id="manual-definitions-backup" class="anchor"/> [Manually backing up definitions](#manual-definitions-backup)

Definitions are stored in Mnesia database located in the Mnesia
directory. You can get the directory path by running the following
command while RabbitMQ server is running:

<pre class="sourcecode sh">
rabbitmqctl eval 'rabbit_mnesia:dir().'
</pre>

If the server is not running, you can search for it in default directories:

* For Linux packages: `/var/lib/rabbitmq/mnesia`
* For Windows: `%APP_DATA%\RabbitMQ\db`
* For standalone MacOS and generic Unix: `$SYS_PREFIX/var/lib/rabbitmq/mnesia`

The Mnesia data directory will also contain message data. If you don't want to
copy messages, do not copy [message directories](#manual-messages-backup).

### <a id="manual-definitions-restore" class="anchor"/> [Restoring manual definitions backup](#manual-definitions-restore)

Mnesia data is bound to a node name. If you want to change a node name or start a
new clone you should change the node name. You can do that using the
following command:

<pre class="sourcecode sh">
rabbitmqctl rename_cluster_node &lt;oldnode&gt; &lt;newnode&gt;
</pre>

When you start a node targeting a restored Mnesia data directory, it should start
with all the definitions.

## <a id="messages-backup" class="anchor"/> [Backing up messages](#messages-backup)

It's not recommended to back up messages if the broker is still running.
Messages can be lost or duplicated.
You need to stop the RabbitMQ broker to back up messages.

In the case of a cluster with [mirrored queues](/ha.html), you need to
stop the entire cluster to take a backup. If you stop one node at a
time, you may loose messages or have duplicates, exactly like when you
back up a single running node.

### <a id="manual-messages-backup" class="anchor"/> [Manually backing up messages](#manual-messages-backup)

There is no automated way of backing up messages, so you should do that manually.

Message data is stored in Mnesia directory. See [manual definitions backup section](#manual-definitions-backup)
to find the mnesia directory.

In RabbitMQ versions prior to 3.7.0 messages are stored in several directories
under the Mnesia directory: `queues`, `msg_store_persistent` and `msg_store_transient`.
Also there is a `recovery.dets` file which contains recovery data if the node
was stopped gracefully.

In RabbitMQ versions starting from 3.7.0 all messages data is combined in the
`msg_stores/vhosts` directory and stored in a directory per vhost.
Each vhost directory is named with a hash and contains a `.vhost` file with
the vhost name, so you can back up vhosts separately.

### <a id="manual-messages-restore" class="anchor"/> [Restoring manual messages backup](#manual-messages-restore)

Messages are restored on a node startup.
For messages to be restored, the broker should have all the definitions, otherwise
message data will not be loaded and can be deleted.

If you want to restore definitions using JSON file, you should fist import
the definitions using the management UI.

If you copy the Mnesia directory manually it should start with all
the definitions and messages. There is no need to import definitions first.
