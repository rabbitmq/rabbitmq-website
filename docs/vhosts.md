---
title: Virtual Hosts
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Virtual Hosts

## Introduction

RabbitMQ is multi-tenant system: connections, exchanges, queues, bindings, user permissions,
policies and some other things belong to **virtual hosts**, logical groups of
entities. If you are familiar with [virtual hosts in Apache](https://httpd.apache.org/docs/2.4/vhosts/)
or [server blocks in Nginx](https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/), the idea is similar.

There is, however, one important difference: virtual hosts in Apache are defined
in the configuration file; that's not the case with RabbitMQ: virtual hosts are
[created](#creating) and [deleted](#deleting) using `rabbitmqctl` or the HTTP API instead.

## Logical and Physical Separation {#logical-separation}

Virtual hosts provide logical grouping and separation of
resources. Separation of physical resources is not a goal of virtual
hosts, although [certain resources can be limited](#limits) for individual virtual hosts.

For example, [resource permissions](./access-control) in RabbitMQ are
scoped per virtual host. A user doesn't have global permissions, only
permissions in one or more virtual hosts. User tags can be considered
global permissions but they are an exception to the rule.

Therefore when talking about user permissions it is very important
to clarify what virtual host(s) they apply to.

## Virtual Hosts and Client Connections {#client-connections}

A virtual host has a name. When an AMQP 0-9-1 client connects to
RabbitMQ, it specifies a vhost name to connect to. If authentication
succeeds and the username provided was [granted permissions](./access-control) to the
vhost, connection is established.

Connections to a vhost can only operate on exchanges, queues, bindings, and so on in
that vhost. "Interconnection" of e.g. a queue and an exchange in different vhosts is only possible
when an application connects to two vhosts at the same time. For example, an
application can consume from one vhost then republishes into the other. This scenario
can involve vhosts in different clusters or the same cluster (or a single node).
[RabbitMQ Shovel plugin](./shovel) is one example of such application.


## Creating a Virtual Host {#creating}

A virtual host can be created using CLI tools or an [HTTP API](./management) endpoint.

A newly created vhost will have a default set of [exchanges](/tutorials/amqp-concepts)
but no other entities and no [user permissions](./access-control). For a user to be able to connect
and use the virtual host, permissions to it must be [granted](./access-control) to every user that will use the vhost,
e.g. using [rabbitmqctl set_permissions](./man/rabbitmqctl.8#set_permissions).

### Using CLI Tools

A virtual host can be created using [rabbitmqctl](./cli)'s `add_vhost` command
which accepts virtual host name as the only mandatory argument.

Here's an example that creates a virtual host named `qa1`:

```bash
rabbitmqctl add_vhost qa1
```

### Using HTTP API

A virtual host can be created using the `PUT /api/vhosts/{name}` [HTTP API](./management) endpoint
where `{name}` is the name of the virtual host

Here's an example that uses [curl](https://curl.haxx.se/) to create a virtual host `vh1` by contacting
a node at `rabbitmq.local:15672`:

```bash
curl -u userename:pa$sw0rD -X PUT http://rabbitmq.local:15672/api/vhosts/vh1
```


### Bulk Creation and Pre-provisioning {#preprovisioning}

Virtual host creation involves a blocking cluster-wide transaction. Each node has to perform
a number of setup steps which are moderately expensive. In practice it can take up to a few seconds
for a virtual host to be created.

When a number of virtual hosts is created in a loop, CLI and HTTP API clients can outpace the actual
rate of virtual host creation and experience timeouts. If that's the case operation timeout should be increased
and delays should be introduced between operations.

[Definition export and import](./definitions) is the recommended
way of pre-configuring many virtual hosts at deployment time.


## Virtual Host Metadata {#metadata}

Virtual hosts can have metadata associated with them:

 * A description
 * A set of tags
 * Default queue type configured for the virtual host

All these settings are optional. They can be provided at virtual host creation time
or updated later.

### Using CLI Tools

The `rabbitmqctl add_vhost` command accepts a virtual host name as well as a number of optional flags.

Here's an example that creates a virtual host named `qa1` with [quorum queues](./quorum-queues) for default queue type,
a description and two tags:

```bash
rabbitmqctl add_vhost qa1 --description "QA env 1" --default-queue-type quorum
```

`rabbitmqctl update_vhost_metadata` can be used to update all or some of the metadata values
demonstrated above:

```bash
rabbitmqctl update_vhost_metadata qa1 --description "QA environment for issue 1662" --default-queue-type quorum --tags qa,project-a,qa-1662
```

To inspect virtual host metadata, use `rabbitmqctl list_vhosts` and provide the additional column(s):

```bash
rabbitmqctl -q --formatter=pretty_table list_vhosts name description tags default_queue_type
```


### Using HTTP API

The `PUT /api/vhosts/{name}` [HTTP API](./management) endpoint
accepts a number of optional keys.

Here's an example that uses [curl](https://curl.haxx.se/) to create a virtual host `qa1` by contacting
a node at `rabbitmq.local:15672`. [Quorum queues](./quorum-queues) will be used for default queue type,
a description and two tags:

```bash
curl -u userename:pa$sw0rD -X PUT http://rabbitmq.local:15672/api/vhosts/qa1 \
                           -H "content-type: application/json" \
                           --data-raw '{"description": "QA environment 1", "tags": "qa,project-a", "default_queue_type": "quorum"}'
```

can be used to update all or some of the metadata values
demonstrated above:

```bash
curl -u userename:pa$sw0rD -X PUT http://rabbitmq.local:15672/api/vhosts/qa1 \
                           -H "content-type: application/json" \
                           --data-raw '{"description": "QA environment for issue 1662", "tags": "qa,project-a,qa-1662", "default_queue_type": "quorum"}'
```

Virtual host metadata is returned by the `GET /api/vhosts/{name}` endpoint:

```bash
curl -u userename:pa$sw0rD -X GET http://rabbitmq.local:15672/api/vhosts/qa1
```


## Default Queue Type (DQT) {#default-queue-type}

When a client declares a queue without explicitly specifying its type using the `x-queue-type` header,
a configurable default type is used. The default can be overridden by specifying it in virtual host metadata (see above):

```bash
rabbitmqctl add_vhost qa1 --description "QA environment 1" --default-queue-type quorum --tags qa,project-a
```

Supported queue types are:

 * "quorum"
 * "stream"
 * "classic"

The default is only effective for new queue declarations; updating the default will not affect
queue type of any existing queues or streams because queue type is immutable and cannot
be changed after declaration.

For queues that were declared without an explicitly set
queue type, the effective virtual host default will be injected into the queue properties
at [definition export time](./definitions).

### Node-wide Default Queue Type (Node-wide DQT)

Instead of configuring the same default queue type for every virtual host
in the cluster, a node-wide default can be set using `rabbitmq.conf`:

```ini
# supported values are: quorum, stream, classic, or a custom queue type module name
default_queue_type = quorum
```

When both the virtual host DQT and the node-wide DQT are set, the virtual host one will take
precedence.

### Migration to Quorum Queues: a Way to Relax Queue Property Equivalence Checks

[Queue property equivalence check](./queues#property-equivalence) for queue type can be relaxed
using a boolean setting, `quorum_queue.property_equivalence.relaxed_checks_on_redeclaration`,
makes it possible to relax queue property equivalence checks
for quorum queues.

Specifically, when a quorum queue is redeclared and the client-provided
type is set to "classic", this setting will help avoid a channel exception, making it
easier to migrate to quorum queues step by step, without upgrading all applications in a short
period of time.

```ini
# this setting is meant to be used during transitionary periods when
# RabbitMQ default queue type is changed but not all applications have been
# updated yet
quorum_queue.property_equivalence.relaxed_checks_on_redeclaration = true
```


## Deleting a Virtual Host {#deleting}

A virtual host can be deleted using CLI tools or an [HTTP API](./management) endpoint.

Deleting a virtual host will permanently delete all entities (queues, exchanges, bindings, policies, permissions, etc) in it.

### Using CLI Tools

A virtual host can be deleted using [rabbitmqctl](./cli)'s `delete_vhost` command
which accepts virtual host name as the only mandatory argument.

Here's an example that deletes a virtual host named `qa1`:

```bash
rabbitmqctl delete_vhost qa1
```

### Using HTTP API

A virtual host can be deleted using the `DELETE /api/vhosts/{name}` [HTTP API](./management) endpoint
where `{name}` is the name of the virtual host.

Here's an example that uses [curl](https://curl.haxx.se/) to delete a virtual host `vh1` by contacting
a node at `rabbitmq.local:15672`:

```bash
curl -u userename:pa$sw0rD -X DELETE http://rabbitmq.local:15672/api/vhosts/vh1
```

## Deletion Protection {#deletion-protection}

A virtual host can be protected from deletion. Protected virtual hosts cannot be deleted
until the protection is removed.

### Using CLI Tools

`rabbitmqctl enable_vhost_protection_from_deletion` is the command that marks a virtual host
as protected from deletion:

```bash
rabbitmqctl enable_vhost_protection_from_deletion "vhost-name"
```

An attempt to delete the virtual host then will fail with a specific message:

```bash
rabbitmqctl delete_vhost "vhost-name"
# ...
# => Error:
# => Cannot delete this virtual host: it is protected from deletion. To lift the protection, inspect and update its metadata
```

To remove the protection, use `rabbitmqctl disable_vhost_protection_from_deletion`:

```bash
## removes virtual host deletion protection
rabbitmqctl disable_vhost_protection_from_deletion "vhost-name"
```

with the protection removed, the virtual host can be deleted again:

```bash
rabbitmqctl delete_vhost "vhost-name"
# => Deleting vhost "vhost-name" ...
```

To see whether a virtual host is protected from deletion, use `list_vhosts` command with
an extra column, `protected_from_deletion`:

```shell
rabbitmqctl list_vhosts name tags default_queue_type metadata protected_from_deletion --formatter=pretty_table
# => Listing vhosts ...
# => ┌───────────────────────────┬─────────────────────────┐
# => │ name                      │ protected_from_deletion │
# => ├───────────────────────────┼─────────────────────────┤
# => │ /                         │ false                   │
# => ├───────────────────────────┼─────────────────────────┤
# => │ vh1                       │ true                    │
# => ├───────────────────────────┼─────────────────────────┤
# => │ vh2                       │ false                   │
# => └───────────────────────────┴─────────────────────────┘
```

### Using HTTP API

A virtual host can be protected from deletion using the `POST /api/vhosts/{name}/deletion/protection` [HTTP API](./management) endpoint
where `{name}` is the name of the virtual host.

Here's an example that uses [curl](https://curl.haxx.se/) to delete a virtual host `vh1` by contacting
a node at `rabbitmq.local:15672`:

```bash
curl -u userename:pa$sw0rD -X POST http://rabbitmq.local:15672/api/vhosts/vh1/deletion/protection
```

An attempt to delete the virtual host then will fail with a `412 Precondition Failed` status:

```bash
curl -sL -u guest:guest -X DELETE http://localhost:15672/api/vhosts/vh1/
# => < HTTP/1.1 412 Precondition Failed
```

The body will include a specific error, similar to what CLI tools output:

```json
{
  "error": "precondition_failed",
  "reason": "Refusing to delete virtual host 'vh1' because it is protected from deletion"
}
```

To remove the protection, use `DELETE /api/vhosts/{name}/deletion/protection`:

```bash
curl -u userename:pa$sw0rD -X POST http://rabbitmq.local:15672/api/vhosts/vh1/deletion/protection
```

with the protection removed, the virtual host can be deleted again:

```bash
curl -vv -sL -u guest:guest -X DELETE http://localhost:15672/api/vhosts/
# ...
# => < HTTP/1.1 204 No Content
```

To see whether a virtual host is protected from deletion, use the `GET /api/vhosts` or `GET /api/vhosts/{vhost}`
endpoints and then inspec the `metadata.protected_from_deletion` response body field:

```bash
curl -sL -u guest:guest -X GET http://localhost:15672/api/vhosts/vh1
# => {
# =>   "name": "vh1",
# =>   "description": "",
# =>   "tags": [],
# =>   "default_queue_type": "classic",
# =>   "protected_from_deletion": true,
# =>   "metadata": {
# =>     "description": "",
# =>     "tags": [],
# =>     "default_queue_type": "classic",
# =>     "protected_from_deletion": true
# =>   },
# =>   "tracing": false,
# =>   "cluster_state": {
# =>     "rabbit@sunnyside": "running"
# =>   }
# => }
```

### Definition Imports

If a virtual host is created via a [definition file](./definitions/), adding a new metadata key, `"protected_from_deletion"`,
that is set to `true`, will mark the virtual host as protected when it is created:

```json
{
  "name": "protected",
  "description": "",
  "metadata": {
    "description": "This virtual host is protected from deletion with a special metadata key",
    "tags": [],
    "default_queue_type": "classic",
    "protected_from_deletion": true
  },
  "tags": [],
  "default_queue_type": "classic"
}
```


## Limits {#limits}

In some cases it is desirable to limit the maximum allowed number of queues
or concurrent client connections in a vhost.
Per-virtual host limits exist exactly for such cases.

These limits can be configured using `rabbitmqctl` or [HTTP API](./management).

### Configuring Limits Using rabbitmqctl

`rabbitmqctl set_vhost_limits` is the command used to define vhost limits.
It requires a vhost parameter and a JSON document of limit definitions.

### Configuring Max Connection Limit

To limit the total number of concurrent client connections in vhost
`vhost_name`, use the following limit definition:

```bash
rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": 256}'
```

To block client connections to a vhost, set the limit to a zero:

```bash
rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": 0}'
```

To lift the limit, set it to a negative value:

```bash
rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": -1}'
```

### Configuring Max Number of Queues

To limit the total number of queues in vhost
`vhost_name`, use the following limit definition:

```bash
rabbitmqctl set_vhost_limits -p vhost_name '{"max-queues": 1024}'
```

To lift the limit, set it to a negative value:

```bash
rabbitmqctl set_vhost_limits -p vhost_name '{"max-queues": -1}'
```


## Virtual Hosts and STOMP

Like AMQP 0-9-1, STOMP includes the [concept of virtual hosts](https://stomp.github.io/stomp-specification-1.2.html#CONNECT_or_STOMP_Frame). See
the [STOMP guide](./stomp) for details.


## Virtual Hosts and MQTT

Unlike AMQP 0-9-1 and STOMP, MQTT doesn't have the concept of virtual
hosts. MQTT connections use a single RabbitMQ host by default. There
are MQTT-specific convention and features that make it possible for
clients to connect to a specific vhosts without any client library
modifications. See the [MQTT guide](./mqtt) for details.
