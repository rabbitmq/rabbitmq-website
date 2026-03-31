---
title: Schema Definition Export and Import
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Schema Definition Export and Import

## Overview {#overview}

Nodes and clusters store information that can be thought of as schema, metadata or topology.
Users, vhosts, queues, exchanges, bindings, runtime parameters all fall into this category.
This metadata is called **definitions** in RabbitMQ parlance.

Definitions can be [exported](#export) to a file and then [imported](#import) into another cluster or
used for schema [backup](./backup) or data seeding.

Definitions are stored in an internal database and replicated across all cluster nodes.
Every node in a cluster has its own replica of all definitions. When a part of definitions changes,
the update is performed on all nodes in a single transaction. This means that
in practice, definitions can be exported from any cluster node with the same result.

[VMware Tanzu RabbitMQ](https://docs.vmware.com/en/VMware-Tanzu-RabbitMQ-for-Kubernetes/index.html) supports [Warm Standby Replication](https://docs.vmware.com/en/VMware-Tanzu-RabbitMQ-for-Kubernetes/3.13/tanzu-rabbitmq-kubernetes/standby-replication.html) to a remote cluster,
which makes it easy to run a warm standby cluster for disaster recovery.

Definition import on node boot is the recommended way of [pre-configuring nodes at deployment time](#import-on-boot).

## Definitions File Format {#file-format}

Exported definitions use a JSON format. The top-level object contains the following keys:

| Key | Type | Description |
|-----|------|-------------|
| `rabbit_version` | String | RabbitMQ version that produced the export |
| `rabbitmq_version` | String | Same as `rabbit_version` (present for compatibility) |
| `product_name` | String | Product name (e.g. `"RabbitMQ"`) |
| `product_version` | String | Product version string |
| `users` | Array | [User](#users-format) accounts |
| `vhosts` | Array | [Virtual hosts](#vhosts-format) |
| `permissions` | Array | [User permissions](#permissions-format) per virtual host |
| `topic_permissions` | Array | [Topic permissions](#topic-permissions-format) per virtual host |
| `parameters` | Array | [Runtime parameters](#parameters-format) (e.g. federation upstreams, shovels) |
| `global_parameters` | Array | [Global (cluster-wide) parameters](#global-parameters-format) |
| `policies` | Array | [Policies](#policies-format) |
| `queues` | Array | [Queues](#queues-format) |
| `exchanges` | Array | [Exchanges](#exchanges-format) |
| `bindings` | Array | [Bindings](#bindings-format) |

The version and product fields (`rabbit_version`, `rabbitmq_version`, `product_name`, `product_version`) are informational and ignored during import.
All array fields are optional during import: omitted sections will simply be skipped.

### Users {#users-format}

Each entry in the `users` array represents a user account.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | yes | Username |
| `password_hash` | String | yes | Hashed password. See [Computing Password Hashes](./passwords#computing-password-hash) for how to generate one |
| `hashing_algorithm` | String | no | Hashing function used for the password, e.g. `rabbit_password_hashing_sha256`, `rabbit_password_hashing_sha512` |
| `tags` | Array of strings | yes | User tags such as `"administrator"`, `"monitoring"`, `"management"`, or custom tags |
| `limits` | Object | no | Per-user limits, e.g. `{"max-connections": 100, "max-channels": 10}` |

```json
{
  "name": "admin",
  "password_hash": "9/1i+jKFRpbTRV1PtRnzFFYibT3cEpP92JeZ8YKGtflf4e/u",
  "hashing_algorithm": "rabbit_password_hashing_sha256",
  "tags": ["administrator"],
  "limits": {}
}
```

### Virtual Hosts {#vhosts-format}

Each entry in the `vhosts` array represents a [virtual host](./vhosts).

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | yes | Virtual host name |
| `tracing` | Boolean | no | Whether tracing is enabled for this vhost. Defaults to `false` |
| `metadata` | Object | no | Object containing `description` (String), `tags` (Array of strings), and optionally `default_queue_type` (String: `"classic"`, `"quorum"`, or `"stream"`) |

Recent RabbitMQ versions export `description`, `tags` and `default_queue_type` inside the `metadata` object.
For backward compatibility, `description` and `tags` are also accepted as direct properties of the vhost object at import time.

```json
{
  "name": "/",
  "tracing": false,
  "metadata": {
    "description": "Default virtual host",
    "tags": [],
    "default_queue_type": "quorum"
  }
}
```

### Permissions {#permissions-format}

Each entry in the `permissions` array grants a user access to resources in a virtual host
using regex patterns. See the [Access Control guide](./access-control) for details.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `user` | String | yes | Username |
| `vhost` | String | yes | Virtual host name |
| `configure` | String | yes | Regex for resources the user can configure |
| `write` | String | yes | Regex for resources the user can write to |
| `read` | String | yes | Regex for resources the user can read from |

```json
{
  "user": "admin",
  "vhost": "/",
  "configure": ".*",
  "write": ".*",
  "read": ".*"
}
```

### Topic Permissions {#topic-permissions-format}

Each entry in the `topic_permissions` array grants publish/consume permissions
on a topic exchange. See the [Topic Authorisation guide](./access-control#topic-authorisation) for details.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `user` | String | yes | Username |
| `vhost` | String | yes | Virtual host name |
| `exchange` | String | yes | Topic exchange name |
| `write` | String | yes | Regex for routing keys the user can publish to |
| `read` | String | yes | Regex for routing keys the user can consume from |

```json
{
  "user": "admin",
  "vhost": "/",
  "exchange": "amq.topic",
  "write": "^logs\\..*",
  "read": "^logs\\..*"
}
```

### Runtime Parameters {#parameters-format}

Runtime parameters are used by plugins and features such as [Federation](./federation),
[Shovels](./shovel), and others. Each parameter belongs to a component and a virtual host.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `component` | String | yes | Component name (e.g. `"federation-upstream"`, `"shovel"`) |
| `vhost` | String | yes | Virtual host this parameter applies to |
| `name` | String | yes | Parameter name |
| `value` | Object | yes | Component-specific configuration |

```json
{
  "component": "shovel",
  "vhost": "/",
  "name": "my-shovel",
  "value": {
    "src-protocol": "amqp091",
    "src-uri": "amqp://localhost",
    "src-queue": "source-queue",
    "dest-protocol": "amqp091",
    "dest-uri": "amqp://remote-host",
    "dest-queue": "destination-queue"
  }
}
```

### Global Parameters {#global-parameters-format}

Global parameters are cluster-wide settings that are not scoped to a virtual host.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | yes | Parameter name |
| `value` | Object or String | yes | Parameter value |

```json
{
  "name": "cluster_name",
  "value": "rabbit@my-cluster"
}
```

### Policies {#policies-format}

Each entry in the `policies` array defines a [policy](./parameters#policies).

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `vhost` | String | yes | Virtual host this policy applies to |
| `name` | String | yes | Policy name |
| `pattern` | String | yes | Regex pattern to match queue/exchange names |
| `apply-to` | String | no | What the policy applies to: `"queues"`, `"exchanges"`, `"classic_queues"`, `"quorum_queues"`, `"streams"`, or `"all"`. Defaults to `"all"` |
| `priority` | Integer | no | Policy priority (higher value wins). Defaults to `0` |
| `definition` | Object | yes | Policy key/value pairs (e.g. `{"max-length": 10000}`) |

```json
{
  "vhost": "/",
  "name": "limit-queue-length",
  "pattern": "^orders\\.",
  "apply-to": "queues",
  "priority": 1,
  "definition": {
    "max-length": 50000,
    "overflow": "reject-publish"
  }
}
```

### Queues {#queues-format}

Each entry in the `queues` array declares a queue.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | yes | Queue name |
| `vhost` | String | yes | Virtual host the queue belongs to |
| `durable` | Boolean | no | Whether the queue survives broker restart. Defaults to `true` at import time |
| `exclusive` | Boolean | no | Whether the queue is exclusive to the declaring connection. Defaults to `false` at import time |
| `auto_delete` | Boolean | no | Whether the queue is deleted when the last consumer unsubscribes. Defaults to `false` at import time |
| `type` | String | no | Queue type in exported definitions: `"classic"`, `"quorum"`, or `"stream"`. **Present in exports only**: this field is ignored at import time, use the `x-queue-type` argument instead |
| `arguments` | Object | no | Queue arguments. Use `"x-queue-type"` to set the queue type at import time (e.g. `{"x-queue-type": "quorum"}`). Other common arguments include `x-message-ttl`, `x-max-length`, `x-dead-letter-exchange` |

:::important
When writing a definitions file by hand, the queue type must be set via the `x-queue-type` key in `arguments`,
not via the `type` field. The `type` field is included in exports for informational purposes but is not used during import.
If neither `x-queue-type` nor `type` is provided, the queue type defaults to the virtual host's `default_queue_type` setting, or `classic` if none is set.
:::

```json
{
  "name": "orders.incoming",
  "vhost": "/",
  "durable": true,
  "auto_delete": false,
  "arguments": {
    "x-queue-type": "quorum"
  }
}
```

### Exchanges {#exchanges-format}

Each entry in the `exchanges` array declares an exchange.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | yes | Exchange name |
| `vhost` | String | yes | Virtual host the exchange belongs to |
| `type` | String | yes | Exchange type: `"direct"`, `"fanout"`, `"topic"`, `"headers"`, or a plugin-provided type |
| `durable` | Boolean | no | Whether the exchange survives broker restart. Defaults to `true` at import time |
| `auto_delete` | Boolean | no | Whether the exchange is deleted when the last queue unbinds. Defaults to `false` at import time |
| `internal` | Boolean | no | Whether the exchange is internal (cannot be published to directly). Defaults to `false` at import time |
| `arguments` | Object | no | Optional exchange arguments |

```json
{
  "name": "orders",
  "vhost": "/",
  "type": "topic",
  "durable": true,
  "auto_delete": false,
  "internal": false,
  "arguments": {}
}
```

### Bindings {#bindings-format}

Each entry in the `bindings` array declares a binding between a source exchange and a destination (queue or exchange).

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `source` | String | yes | Source exchange name |
| `vhost` | String | yes | Virtual host |
| `destination` | String | yes | Destination queue or exchange name |
| `destination_type` | String | yes | `"queue"` or `"exchange"` |
| `routing_key` | String | yes | Binding/routing key |
| `arguments` | Object | no | Optional binding arguments (used by headers exchanges, for example) |
| `properties_key` | String | no | Unique binding identifier. Present in exports, not required for import |

```json
{
  "source": "orders",
  "vhost": "/",
  "destination": "orders.incoming",
  "destination_type": "queue",
  "routing_key": "orders.new",
  "arguments": {}
}
```

### Minimal Example {#minimal-example}

The following is a minimal but complete definitions file that creates a virtual host, a user, a quorum queue, a topic exchange, and a binding.
Note how the queue type is set via the `x-queue-type` argument:

```json
{
  "users": [
    {
      "name": "app-user",
      "password_hash": "9/1i+jKFRpbTRV1PtRnzFFYibT3cEpP92JeZ8YKGtflf4e/u",
      "hashing_algorithm": "rabbit_password_hashing_sha256",
      "tags": []
    }
  ],
  "vhosts": [
    {
      "name": "app"
    }
  ],
  "permissions": [
    {
      "user": "app-user",
      "vhost": "app",
      "configure": ".*",
      "write": ".*",
      "read": ".*"
    }
  ],
  "queues": [
    {
      "name": "events",
      "vhost": "app",
      "durable": true,
      "auto_delete": false,
      "arguments": {
        "x-queue-type": "quorum"
      }
    }
  ],
  "exchanges": [
    {
      "name": "events",
      "vhost": "app",
      "type": "topic",
      "durable": true,
      "auto_delete": false,
      "internal": false,
      "arguments": {}
    }
  ],
  "bindings": [
    {
      "source": "events",
      "vhost": "app",
      "destination": "events",
      "destination_type": "queue",
      "routing_key": "#",
      "arguments": {}
    }
  ]
}
```

## Definition Export {#export}

Definitions are exported as a JSON file in a number of ways.

 * [`rabbitmqctl export_definitions`](./cli) is the only option that does not require [management plugin](./management) to be enabled
 * [`rabbitmqadmin definitions export`](./management-cli) which uses the [HTTP API](./management#http-api)
 * The `GET /api/definitions` API endpoint
 * There's a definitions pane on the Overview page

Definitions can be exported for a specific [virtual host](./vhosts) or the entire cluster (all virtual host).
When definitions are exported for just one virtual host, some information (contents of the other
virtual hosts or users without any permissions to the target virtual host) will be
excluded from the exported file.

Exported user data contains password hashes as well as [password hashing function](./passwords) information. While brute forcing passwords with hashing functions such as SHA-256 or SHA-512 is not a completely trivial task,
user records should be **considered sensitive information**.

To export definitions using [`rabbitmqctl`](./cli), use `rabbitmqctl export_definitions`:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
# Does not require management plugin to be enabled
rabbitmqctl export_definitions /path/to/definitions.file.json
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
# Does not require management plugin to be enabled
rabbitmqctl.bat export_definitions /path/to/definitions.file.json
```
</TabItem>
</Tabs>

`rabbitmqadmin export` is very similar but uses the HTTP API and is compatible
with older versions:

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
# Requires management plugin to be enabled
rabbitmqadmin definitions export /path/to/definitions.file.json
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```bash
# Requires management plugin to be enabled
rabbitmqadmin.exe definitions export /path/to/definitions.file.json
```
</TabItem>
</Tabs>

In this example, the `GET /api/definitions` endpoint is used directly to export
definitions of all virtual hosts in a cluster:

```bash
# Requires management plugin to be enabled,
# placeholders are used for credentials and hostname.
# Use HTTPS when possible.
curl -u {username}:{password} -X GET http://{hostname}:15672/api/definitions
```

The response from the above API endpoint can be piped to [`jq`](https://stedolan.github.io/jq/) and similar tools
for more human-friendly formatting:

```bash
# Requires management plugin to be enabled,
# placeholders are used for credentials and hostname.
# Use HTTPS when possible.
#
# jq is a 3rd party tool that must be available in PATH
curl -u {username}:{password} -X GET http://{hostname}:15672/api/definitions | jq
```

## Export and Transform Definitions

[`rabbitmqadmin` v2](./management-cli/) provides a way to export definitions
and apply one or more standard transformation functions to the result.

This can be useful to remove classic queue mirroring-related keys (such as `ha-mode`) from a definitions
set originating from a 3.13.x node, or to obfuscate usernames and passwords, or exclude certain definitions file
sections entirely.

To specify what transformations should be applied, use the `--transformations` options,
which takes a comma-separated list of  supported operation names.

The following table explains what transformations are available and what they do:

| Transformation name            | Description                                                  |
|--------------------------------|--------------------------------------------------------------|
| `strip_cmq_keys_from_policies` | Deletes all classic queue mirroring-related keys (such as `ha-mode`) from all exported policies.<br/><br/>Must be followed by `drop_empty_policies` to strip off the policies whose definition has become empty (and thus invalid at import time) after the removal of all classic queue mirroring-related keys |
| `drop_empty_policies`          | Should be used after `strip_cmq_keys_from_policies` to strip off the policies whose definition has become empty (and thus invalid at import time) after the removal of all classic queue mirroring-related keys |
| `obfuscate_usernames`          | Replaces usernames and passwords with dummy values.<br/><br/>For usernames the values used are: `obfuscated-username-1`, `obfuscated-username-2`, and so on.<br/><br/>For passwords the values generated are: `password-1`, `password-2`, and so forth.<br/><br/>This transformations updates both the users and the permissions sections, consistently |
| `exclude_users`                | Removes all users from the result. Commonly used together with `exclude_permissions` |
| `exclude_permissions`          | Removes all permissions from the result. Commonly used together with `exclude_users` |
| `exclude_runtime_parameters`   | Removes all runtime parameters (including federation upstreams, shovels, WSR and SDS settings in Tanzu RabbitMQ) from the result |
| `exclude_policies`             | Removes all policies from the result                         |
| `no_op`                        | Does nothing. Can be used as the default in dynamically computed transformation lists, e.g. in scripts |

### Examples

The following command applies two transformations named `strip_cmq_keys_from_policies` and `drop_empty_policies`
that will strip all classic queue mirroring-related policy keys that RabbitMQ 3.13 nodes supported,
then removes the policies that did not have any keys left (ended up having an empty definition):

```shell
# strips classic mirrored queue-related policy keys from the exported definitions, then prints them
# to the standard output stream
rabbitmqadmin definitions export --stdout --transformations strip_cmq_keys_from_policies,drop_empty_policies
```

The following example exports definitions without users and permissions:

```shell
# removes users and user permissions from the exported definitions, then prints them
# to the standard output stream
rabbitmqadmin definitions export --stdout --transformations exclude_users,exclude_permissions
```

To export definitions with usernames replaced by dummy values (usernames: `obfuscated-username-1`, `obfuscated-username-2`, and so on;
passwords: `password-1`, `password-2`, and so forth), use the `obfuscate_usernames` transformation:

```shell
rabbitmqadmin definitions export --file /path/to/definitions.file.json --transformations obfuscate_usernames
```


## Definition Import {#import}

To import definitions using [`rabbitmqctl`](./cli), use `rabbitmqctl import_definitions`:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
# Does not require management plugin to be enabled
rabbitmqctl import_definitions /path/to/definitions.file.json
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
# Does not require management plugin to be enabled
rabbitmqctl.bat import_definitions /path/to/definitions.file.json
```
</TabItem>
</Tabs>

`rabbitmqadmin definitions import` is its HTTP API equivalent:

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
# Requires management plugin to be enabled
rabbitmqadmin definitions import /path/to/definitions.file.json
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```bash
# Requires management plugin to be enabled
rabbitmqadmin.exe definitions import /path/to/definitions.file.json
```
</TabItem>
</Tabs>

It is also possible to use the `POST /api/definitions` API endpoint directly:

```bash
# Requires management plugin to be enabled,
# placeholders are used for credentials and hostname.
# Use HTTPS when possible.
curl -u {username}:{password} -H "Content-Type: application/json" -X POST -T /path/to/definitions.file.json http://{hostname}:15672/api/definitions
```


## Definition Import at Node Boot Time {#import-on-boot}

A definition file can be imported during or after node startup time. In a multi-node cluster, at-boot-time imports
can and in practice will result in repetitive work performed by the nodes on boot. This is of no concern with
smaller definition files but with larger files, [importing definitions after node boot](#import-after-boot) after
cluster deployment (formation) is recommended.

Modern releases support definition import directly in the core,
without the need to [preconfigure](./plugins#enabled-plugins-file) the [management plugin](./management).

To import definitions from a local file on node boot,
point the `definitions.local.path` config key to a path of a previously exported JSON file with definitions:

```ini
# Does not require management plugin to be enabled.
definitions.import_backend = local_filesystem
definitions.local.path = /path/to/definitions/defs.json
```

Definitions can be imported from a URL accessible over HTTPS on node boot.
Set the `definitions.import_backend` and `definitions.https.url` config keys to https and a valid URL where a JSON definition is located.

```ini
# Does not require management plugin to be enabled.
definitions.import_backend = https
definitions.https.url = https://raw.githubusercontent.com/rabbitmq/sample-configs/main/queues/5k-queues.json
# client-side TLS options for definition import
definitions.tls.versions.1 = tlsv1.2
```

### Nuances of Boot-time Definition Import {#import-on-boot-nuances}

Definition import happens after plugin activation. This means that definitions related
to plugins (e.g. dynamic Shovels, exchanges of a custom type, and so on) can be imported at boot time.

The definitions in the file will not overwrite anything already in the broker.

If a blank (uninitialised) node imports a definition file, it will
not create the default virtual host and user. In **test or QA**  environments,
an equivalent default user can be created via the same definitions file.

For **production** systems a new user with unique credentials must be created and used instead.

The below snippet demonstrates how the definitions file can be modified to
"re-create" the default user that would only be able to connect from `localhost` by default:

```javascript
    "users": [
        {
            "name": "guest",
            "password_hash": "9/1i+jKFRpbTRV1PtRnzFFYibT3cEpP92JeZ8YKGtflf4e/u",
            "tags": ["administrator"]
        }
    ],
    "permissions":[
        {
            "user":"guest",
            "vhost":"/",
            "configure":".*",
            "read":".*",
            "write":".*"}
    ],
```

### Avoid Boot Time Import if Definition Contents Have Not Changed {#import-on-boot-skip-if-unchanged}

By default definitions are imported by every cluster node, unconditionally.
In many environments definition file rarely changes. In that case it makes
sense to only perform an import when definition file contents actually change.

This can be done by setting the `definitions.skip_if_unchanged` configuration key
to `true`:

```ini
# when set to true, definition import will only happen
# if definition file contents change
definitions.skip_if_unchanged = true

definitions.import_backend = local_filesystem
definitions.local.path = /path/to/definitions/defs.json
```

This feature works for both individual files and directories:

```ini
# when set to true, definition import will only happen
# if definition file contents change
definitions.skip_if_unchanged = true

definitions.import_backend = local_filesystem
definitions.local.path = /path/to/definitions/conf.d/
```

 It is also supported by the HTTPS endpoint import mechanism:

```ini
# when set to true, definition import will only happen
# if definition file contents change
definitions.skip_if_unchanged = true

definitions.import_backend = https
definitions.https.url = https://some.endpoint/path/to/rabbitmq.definitions.json

definitions.tls.verify     = verify_peer
definitions.tls.fail_if_no_peer_cert = true

definitions.tls.cacertfile = /path/to/ca_certificate.pem
definitions.tls.certfile   = /path/to/client_certificate.pem
definitions.tls.keyfile    = /path/to/client_key.pem
```


## Definition Import After Node Boot {#import-after-boot}

Installations that use earlier versions that do not provide the built-in definition import
can import definitions immediately after node boot using a combination of two CLI commands:

```bash
# await startup for up to 5 minutes
rabbitmqctl await_startup --timeout 300

# import definitions using rabbitmqctl
rabbitmqctl import_definitions /path/to/definitions.file.json

# OR, import using rabbitmqadmin
# Requires management plugin to be enabled
rabbitmqadmin definitions import /path/to/definitions.file.json
```
