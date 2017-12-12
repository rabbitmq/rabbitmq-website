# RabbitMQ backup and restore.

This guide covers backup and restore mechanism for RabbitMQ data.

RabbitMQ data consists of two main components:

1. RabbitMQ definitions

Definitions is broker topology schema: users, vhosts, queues, exchanges, bindings.
Definitions are controlled by HTTP API, rabbitmqctl commands and `declare.` methods.
Definitions are stored in the mnesia database and raplicated across all nodes in a cluster.
Any node in a cluster has it's own replica of definitions, identical to all others.

2. RabbitMQ messages

Messages are stored in queue indexes and message stores.
Messages are node-local, but can be replicated between queues using [HA queues mechanism](/ha.html)
Messages are stored in subdirectories of mnesia directory.

Definitions expected to be long-living, while messages are flowing from publishers to
consumers.

When creating a backup, you should decide if you want to save only definitions
or messages too.
Because messages are short-living, it's not recommended to back them up when the broker
is active. Some messages can be lost or duplicated in this case.

### Backing up definitions

Definitions can be exported to a JSON file or copied manually. Manual backup will
require additional steps if nodename or hostname changes.

#### Definitions export

Definitions can be exported to JSON file using the [Management plugin](/management.html).

You can do that on the overview page, using `/api/definitions`
HTTP API endpoint or [rabbitmqadmin tool](/management-cli.html).

Definitions can be exported for a specific Vhost or for entire broker.
If you export a single Vhost definitions, users data will not be exported.

Exported user data contains raw passwords in some old RabbitMQ versions and
password hashes in recent versions.

#### Restoring exported definitions

To import definitions you can also use the overview page, HTTP API or rabbitmqadmin tool.
You can also import definitions on broker start using
[`load_definitions` configuration parameter](/management.html#load-definitions)

Definitions restore can be used to create broker replicas.

#### Manual definitions backup

Definitions are stored in mnesia database located in mnesia directory.
You can get the directory path by running the `rabbitmqctl eval 'rabbit_mnesia:dir().'`
command while RabbitMQ server is running.

If server is not running, you can search for it in default directories:
* For linux packages - `/var/lib/rabbitmq/mnesia`
* For windows - `%APP_DATA%\RabbitMQ\db`
* For standalone MacOS and generic unix - `var/lib/rabbitmq/mnesia/`

The mnesia data directory will also contain messages data. If you don't want to
copy messages, do not copy directories listed in the next section.

#### Manual definitions restore

Mnesia data is bound to a node name. If you want to change a node name or start a
new clone you should change the node name. You can do that using the
`rabbitmqctl rename_cluster_node <oldnode> <newnode>` command.

When you start a node targeting restored mnesia data directory, it should start
with all the definitions.

### Backing up messages

It's not recommended to backup messages if the broker is still running.
Messages can be lost or duplicated.
You can back up data if the broker is stopped.

There is no authomated way of backing up messages, so you should do that manually.

First, you should locate the data directory. Default data directories are:
* For linux packages - `/var/lib/rabbitmq/mnesia`
* For windows - `%APP_DATA%\RabbitMQ\db`
* For standalone MacOS and generic unix - `var/lib/rabbitmq/mnesia/`

In RabbitMQ versions prior to 3.7.0 messages are stored in several directories
under mnesia directory: `queues`, `msg_store_persistent` and `msg_store_transient`.
Also there is a `recovery.dets` file, which contains recovery data if the node
was stopped gracefully.

In RabbitMQ versions starting from 3.7.0 all messages data is combined in the
`msg_stores/vhosts` directory and stored in a directory per vhost.
Each vhost directory is named with a hash and contains a `.vhost` file with
the vhost name, so you can back up vhosts separately.

### Restoring messages

Messages are restored on a node startup.
To restore messages data you should restore the definitions first, without queues
and vhosts data, messages will be lost.

You should fist import the definitions using the management UI or restore
them manually from the mnesia directory backup.

If you copying the mnesia directory manually it should start with all
the definitions and messages data and there is no need to import definitions first.








