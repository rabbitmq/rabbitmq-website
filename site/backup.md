<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Backup and Restore

## Overview

Modern versions of RabbitMQ (3.8.0+) only support backup restore from disk
when they are restored to a RabbitMQ node with exactly the same node name as the
node the data was backed up from. Node renaming is not supported if either quorum
queues or streams are used.

It is better to rely on other disaster recovery solutions,
or use a separate standby cluster for disaster recovery.
[VMware RabbitMQ](https://www.vmware.com/products/rabbitmq.html) offers a number of extensions for
warm standby replication to a dedicated disaster
recovery cluster.


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

Definitions can be [exported and imported](./definitions.html) as JSON files.

Definitions are stored in an internal database and replicated across all cluster nodes.
Every node in a cluster has its own replica of all definitions. When a part of definitions changes,
the update is performed on all nodes in a single transaction. In the context of backups this
means that in practice definitions can be exported from any cluster node with the same result.

### <a id="rabbitmq-messages" class="anchor" href="#rabbitmq-messages">Messages</a>

Messages are stored in a message store. For the purpose of this guide we will define "message store"
as an internal store for messages, a single entity that's transparent to the user.

Each node has its own data directory and stores messages for the queues and streams that have
their leader replica hosted on that node. Messages can be replicated between nodes if
a [replicated queue type](quorum-queues.html) or [stream](streams.html) with multiple replicas is used.
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

Definitions can be exported to a JSON file. This is the recommended way of backing them up.

### <a id="definitions-export" class="anchor" href="#definitions-export">Exporting Definitions</a>

Definition export is covered in the dedicated [Definitions guide](./definitions.html#export).

### <a id="definitions-import" class="anchor" href="#definitions-import">Importing Definitions</a>

Definition import is covered in the dedicated [Definitions guide](./definitions.html#import).

Importing a definitions file is sufficient for creating a broker with
an identical set of definitions (e.g. users, vhosts, permissions,
policies, topologies, and so on).

### <a id="manual-definitions-backup" class="anchor" href="#manual-definitions-backup">Manually Backing Up Definitions</a>

Definitions are stored in an internal database located in the node's data
directory. To get the directory path, run the following
command against a running RabbitMQ node:

<pre class="lang-bash">
rabbitmq-diagnostics status | grep -A 2 -B 2 "Node data directory"
</pre>

If the node isn't running, it is possible to inspect [default data directories](./relocate.html).

* For Debian and RPM packages: `/var/lib/rabbitmq/mnesia`
* For Windows: `%APPDATA%\RabbitMQ\db`
* For generic binary builds: `{installation_root}/var/lib/rabbitmq/mnesia`

The above data directory will also contain message store data in a subdirectory. If you don't want to
copy the messages, skip copying the [message directories](#manual-messages-backup).

### <a id="manual-definitions-restore" class="anchor" href="#manual-definitions-restore">Restoring from a Manual Definitions Backup</a>

To perform a restore, a new node starts with a backed up directory and the original node name.
The node then should perform the upgrade steps as needed and proceed booting.


## <a id="messages-backup" class="anchor" href="#messages-backup">Backing Up Messages</a>

To back up messages on a node it **must be first stopped**.

In the case of a cluster with [replicated queues](./quorum-queues.html), it is highly recommended
to stop the entire cluster over a period of time to take a backup. If instead one node is topped at a
time, queues may accumulate duplicates, exactly like when you
back up a single running node.

If the majority of cluster nodes is stopped rapidly quorum queues may lose their availability, and
as a result miss a small percentage of recent publishes to them.

### <a id="manual-messages-backup" class="anchor" href="#manual-messages-backup">Manually Backing Up Messages</a>

Presently this is the only way of backing up messages.

Message data is stored in the [node's data directory](./relocate.html) mentioned above.

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
