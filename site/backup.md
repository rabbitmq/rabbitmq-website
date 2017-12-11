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

Definitions can be exported to JSON file using the [Management plugin](/management.html) .

You can do that on the overview page, using `/api/definitions`
HTTP API endpoint or [rabbitmqadmin tool](/management-cli.html).

Definitions can be exported for a specific Vhost or for entire broker.
If you export a single Vhost definitions, users data will not be exported.

Exported user data contains raw passwords in some old RabbitMQ versions and
password hashes in recent versions.

### Restoring definitions

To import definitions you can also use the overview page, HTTP API or rabbitmqadmin tool.
You can also import definitions on broker start using
[`load_definitions` configuration parameter](/management.html#load-definitions)

Definitions restore can be used to create broker replicas.

### Backing up messages

It's not recommended to backup messages if the broker is still running.
Messages can be lost or duplicated.
You can back up data if the broker is stopped.

There is no authomated way of backing up messages, so you should do that manually.

First, you should locate the data directory. Default data directories are:
* For linux packages - `/var/lib/rabbitmq/mnesia`
* For windows - `%APP_DATA%\RabbitMQ\db`
* For standalone MacOS and generic unix - `var/lib/rabbitmq/mnesia/`

