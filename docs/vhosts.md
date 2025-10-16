---
title: Virtual Hosts
---

<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Virtual Hosts

## Introduction

RabbitMQ is a multi-tenant system: connections, exchanges, queues, bindings, user permissions,
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

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl add_vhost qa1
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin vhosts declare --name qa1
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat add_vhost qa1
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe vhosts declare --name qa1
```
</TabItem>
</Tabs>

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

- A description
- A set of tags
- Default queue type configured for the virtual host

All these settings are optional. They can be provided at virtual host creation time
or updated later.

### Using CLI Tools

Virtual host metadata can be set at creation time or updated later:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
# Create a virtual host with metadata
rabbitmqctl add_vhost qa1 --description "QA env 1" --default-queue-type quorum

# Update virtual host metadata

rabbitmqctl update_vhost_metadata qa1 --description "QA environment for issue 1662" --default-queue-type quorum --tags qa,project-a,qa-1662

# List virtual hosts with metadata

rabbitmqctl -q --formatter=pretty_table list_vhosts name description tags default_queue_type

````
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
# Create a virtual host with metadata
rabbitmqadmin vhosts declare --name qa1 \
    --description "QA environment 1" \
    --default-queue-type quorum

# Create a virtual host with tracing enabled
rabbitmqadmin vhosts declare --name qa-tracing \
    --description "QA environment with tracing" \
    --default-queue-type quorum \
    --tracing

rabbitmqadmin vhosts list
````

</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
# Create a virtual host with metadata
rabbitmqctl.bat add_vhost qa1 --description "QA env 1" --default-queue-type quorum

# Update virtual host metadata

rabbitmqctl.bat update_vhost_metadata qa1 --description "QA environment for issue 1662" --default-queue-type quorum --tags qa,project-a,qa-1662

# List virtual hosts with metadata

rabbitmqctl.bat -q --formatter=pretty_table list_vhosts name description tags default_queue_type

````
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# Create a virtual host with metadata
rabbitmqadmin.exe vhosts declare --name qa1 ^
    --description "QA environment 1" ^
    --default-queue-type quorum

# Create a virtual host with tracing enabled
rabbitmqadmin.exe vhosts declare --name qa-tracing ^
    --description "QA environment with tracing" ^
    --default-queue-type quorum ^
    --tracing

rabbitmqadmin.exe vhosts list
````

</TabItem>
</Tabs>

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

The same endpoint can be used to update all or some of the metadata values
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

- "quorum"
- "stream"
- "classic"

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

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl delete_vhost qa1
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin vhosts delete --name qa1
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat delete_vhost qa1
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe vhosts delete --name qa1
```
</TabItem>
</Tabs>

### Using HTTP API

A virtual host can be deleted using the `DELETE /api/vhosts/{name}` [HTTP API](./management) endpoint
where `{name}` is the name of the virtual host.

Here's an example that uses [curl](https://curl.haxx.se/) to delete a virtual host `vh1` by contacting
a node at `rabbitmq.local:15672`:

```bash
curl -u userename:pa$sw0rD -X DELETE http://rabbitmq.local:15672/api/vhosts/vh1
```

### Deleting Multiple Virtual Hosts

`rabbitmqadmin` supports deleting multiple virtual hosts at once using a name matching pattern.

:::danger

**This is an extremely destructive operation and must be used with great care.**

This command will delete all virtual hosts matching the provided regular expression pattern.
All data in those virtual hosts will be permanently lost, including:

- Queues, streams, and partitioned streams
- Exchanges and bindings
- Messages
- User permissions
- Federation upstreams and links
- Shovels
- Policies and operator policies
- Runtime parameters

**Always use `--dry-run` first to verify what will be deleted before running the actual deletion.**

:::

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqadmin with bash" default>
```bash
# ALWAYS run with --dry-run first to see what would be deleted
rabbitmqadmin vhosts delete_multiple --name-pattern "^test-.*" --dry-run

# After verifying with --dry-run, use --approve to perform the actual deletion

# This will delete ALL virtual hosts whose names start with "test-"

rabbitmqadmin vhosts delete_multiple --name-pattern "^test-.\*" --approve

````
</TabItem>

<TabItem value="PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# ALWAYS run with --dry-run first to see what would be deleted
rabbitmqadmin.exe vhosts delete_multiple --name-pattern "^test-.*" --dry-run

# After verifying with --dry-run, use --approve to perform the actual deletion
# This will delete ALL virtual hosts whose names start with "test-"
rabbitmqadmin.exe vhosts delete_multiple --name-pattern "^test-.*" --approve
````

</TabItem>
</Tabs>

:::note

The default virtual host (`/`) is always preserved and will never be deleted by this command, even if it matches the pattern.

:::

## Deletion Protection {#deletion-protection}

A virtual host can be protected from deletion. Protected virtual hosts cannot be deleted
until the protection is removed.

### Using CLI Tools

A virtual host can be protected from deletion using `rabbitmqctl` or `rabbitmqadmin`.

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl enable_vhost_protection_from_deletion "vhost-name"
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin vhosts enable_deletion_protection --name "vhost-name"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat enable_vhost_protection_from_deletion "vhost-name"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe vhosts enable_deletion_protection --name "vhost-name"
```
</TabItem>
</Tabs>

An attempt to delete the virtual host then will fail with a specific message:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl delete_vhost "vhost-name"
# ...
# => Error:
# => Cannot delete this virtual host: it is protected from deletion. To lift the protection, inspect and update its metadata
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin vhosts delete --name "vhost-name"
# => Error: HTTP request failed with status 412: Precondition Failed
# => Refusing to delete virtual host 'vhost-name' because it is protected from deletion
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat delete_vhost "vhost-name"
# ...
# => Error:
# => Cannot delete this virtual host: it is protected from deletion. To lift the protection, inspect and update its metadata
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe vhosts delete --name "vhost-name"
# => Error: HTTP request failed with status 412: Precondition Failed
# => Refusing to delete virtual host 'vhost-name' because it is protected from deletion
```
</TabItem>
</Tabs>

To remove the protection:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl disable_vhost_protection_from_deletion "vhost-name"
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin vhosts disable_deletion_protection --name "vhost-name"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat disable_vhost_protection_from_deletion "vhost-name"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe vhosts disable_deletion_protection --name "vhost-name"
```
</TabItem>
</Tabs>

with the protection removed, the virtual host can be deleted again:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl delete_vhost "vhost-name"
# => Deleting vhost "vhost-name" ...
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin vhosts delete --name "vhost-name"
# => (No output on success)
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat delete_vhost "vhost-name"
# => Deleting vhost "vhost-name" ...
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe vhosts delete --name "vhost-name"
# => (No output on success)
```
</TabItem>
</Tabs>

To see whether a virtual host is protected from deletion, use `list_vhosts` command with
an extra column, `protected_from_deletion`:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
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
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin vhosts list
# Shows all virtual hosts (protection status not displayed in list view)
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat list_vhosts name tags default_queue_type metadata protected_from_deletion --formatter=pretty_table
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
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe vhosts list
# Shows all virtual hosts (protection status not displayed in list view)
```
</TabItem>
</Tabs>

### Using HTTP API

A virtual host can be protected from deletion using the `POST /api/vhosts/{name}/deletion/protection` [HTTP API](./management) endpoint
where `{name}` is the name of the virtual host.

Here's an example that uses [curl](https://curl.haxx.se/) to protect a virtual host `vh1` from deletion by contacting
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
curl -u userename:pa$sw0rD -X DELETE http://rabbitmq.local:15672/api/vhosts/vh1/deletion/protection
```

with the protection removed, the virtual host can be deleted again:

```bash
curl -vv -sL -u guest:guest -X DELETE http://localhost:15672/api/vhosts/
# ...
# => < HTTP/1.1 204 No Content
```

To see whether a virtual host is protected from deletion, use the `GET /api/vhosts` or `GET /api/vhosts/{vhost}`
endpoints and then inspect the `metadata.protected_from_deletion` response body field:

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

These limits can be configured using `rabbitmqctl` or [HTTP API](./http-api-reference).

### Configuring Limits

Virtual host limits can be configured using `rabbitmqctl` or `rabbitmqadmin`.

#### Configuring Max Connection Limit

To limit the total number of concurrent client connections in virtual host
`vhost_name`, use the following limit definition:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": 256}'
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost vhost_name vhost_limits declare --name max-connections --value 256
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_vhost_limits -p vhost_name "{""max-connections"": 256}"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost vhost_name vhost_limits declare --name max-connections --value 256
```
</TabItem>
</Tabs>

To block client connections to a vhost, set the limit to a zero:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": 0}'
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost vhost_name vhost_limits declare --name max-connections --value 0
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_vhost_limits -p vhost_name "{""max-connections"": 0}"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost vhost_name vhost_limits declare --name max-connections --value 0
```
</TabItem>
</Tabs>

#### Configuring Max Number of Queues

To limit the total number of queues in vhost
`vhost_name`, use the following limit definition:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_vhost_limits -p vhost_name '{"max-queues": 1024}'
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost vhost_name vhost_limits declare --name max-queues --value 1024
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_vhost_limits -p vhost_name "{""max-queues"": 1024}"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost vhost_name vhost_limits declare --name max-queues --value 1024
```
</TabItem>
</Tabs>

### Listing Virtual Host Limits

To list limits for a virtual host:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
# uses the default virtual host (/)
rabbitmqctl list_vhost_limits

# or for a specific virtual host

rabbitmqctl list_vhost_limits -p vhost_name

````
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
# uses the default virtual host (/)
rabbitmqadmin vhost_limits list

# or for a specific virtual host
rabbitmqadmin --vhost vhost_name vhost_limits list
````

</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
# uses the default virtual host (/)
rabbitmqctl.bat list_vhost_limits

# or for a specific virtual host

rabbitmqctl.bat list_vhost_limits -p vhost_name

````
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# uses the default virtual host (/)
rabbitmqadmin.exe vhost_limits list

# or for a specific virtual host
rabbitmqadmin.exe --vhost vhost_name vhost_limits list
````

</TabItem>
</Tabs>

### Clearing Virtual Host Limits

To clear a virtual host limit:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl clear_vhost_limits -p vhost_name '{"max-connections": 256}'
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost vhost_name vhost_limits delete --name max-connections
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat clear_vhost_limits -p vhost_name "{""max-connections"": 256}"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost vhost_name vhost_limits delete --name max-connections
```
</TabItem>
</Tabs>

## Pre-configuring Virtual Host Limits

Virtual host limits can be pre-configured in `rabbitmq.conf` for groups of virtual hosts.
This is useful when virtual hosts are created dynamically by cluster users
(for example, a RabbitMQ cluster is offered as a service) but all newly created virtual hosts
must use a consistent set of limits.

Multiple limit sets can be defined, each with a pattern that matches virtual host names
and a set of limits to set:

```ini
# Default limits for virtual hosts starting with "pipelines"
default_limits.vhosts.1.pattern = ^pipelines
default_limits.vhosts.1.max_connections = 10
default_limits.vhosts.1.max_queues = 1000

# Default limits for virtual hosts starting with "telemetry"
default_limits.vhosts.2.pattern = ^telemetry
default_limits.vhosts.2.max_connections = 10000
default_limits.vhosts.2.max_queues = 10000

# Default limits for all other virtual hosts
default_limits.vhosts.3.pattern = .*
default_limits.vhosts.3.max_connections = 20
default_limits.vhosts.3.max_queues = 20
```

Use `-1` to indicate unlimited for a specific limit.

## Virtual Hosts and STOMP

Like AMQP 0-9-1, STOMP includes the [concept of virtual hosts](https://stomp.github.io/stomp-specification-1.2.html#CONNECT_or_STOMP_Frame). See
the [STOMP guide](./stomp) for details.

## Virtual Hosts and MQTT

Unlike AMQP 0-9-1 and STOMP, MQTT doesn't have the concept of virtual
hosts. MQTT connections use a single RabbitMQ host by default. There
are MQTT-specific convention and features that make it possible for
clients to connect to a specific vhosts without any client library
modifications. See the [MQTT guide](./mqtt) for details.
