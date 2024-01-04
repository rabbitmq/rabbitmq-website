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

# Virtual Hosts NOSYNTAX

## Introduction

RabbitMQ is multi-tenant system: connections, exchanges, queues, bindings, user permissions,
policies and some other things belong to **virtual hosts**, logical groups of
entities. If you are familiar with [virtual hosts in Apache](https://httpd.apache.org/docs/2.4/vhosts/)
or [server blocks in Nginx](https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/), the idea is similar.

There is, however, one important difference: virtual hosts in Apache are defined
in the configuration file; that's not the case with RabbitMQ: virtual hosts are
[created](#creating) and [deleted](#deleting) using `rabbitmqctl` or the HTTP API instead.

## <a id="logical-separation" class="anchor" href="#logical-separation">Logical and Physical Separation</a>

Virtual hosts provide logical grouping and separation of
resources. Separation of physical resources is not a goal of virtual
hosts, although [certain resources can be limited](#limits) for individual virtual hosts.

For example, [resource permissions](./access-control.html) in RabbitMQ are
scoped per virtual host. A user doesn't have global permissions, only
permissions in one or more virtual hosts. User tags can be considered
global permissions but they are an exception to the rule.

Therefore when talking about user permissions it is very important
to clarify what virtual host(s) they apply to.

## <a id="client-connections" class="anchor" href="#client-connections">Virtual Hosts and Client Connections</a>

A virtual host has a name. When an AMQP 0-9-1 client connects to
RabbitMQ, it specifies a vhost name to connect to. If authentication
succeeds and the username provided was [granted permissions](./access-control.html) to the
vhost, connection is established.

Connections to a vhost can only operate on exchanges, queues, bindings, and so on in
that vhost. "Interconnection" of e.g. a queue and an exchange in different vhosts is only possible
when an application connects to two vhosts at the same time. For example, an
application can consume from one vhost then republishes into the other. This scenario
can involve vhosts in different clusters or the same cluster (or a single node).
[RabbitMQ Shovel plugin](shovel.html) is one example of such application.


## <a id="creating" class="anchor" href="#creating">Creating a Virtual Host</a>

A virtual host can be created using CLI tools or an [HTTP API](./management.html) endpoint.

A newly created vhost will have a default set of [exchanges](./tutorials/amqp-concepts.html)
but no other entities and no [user permissions](./access-control.html). For a user to be able to connect
and use the virtual host, permissions to it must be [granted](./access-control.html) to every user that will use the vhost,
e.g. using [rabbitmqctl set_permissions](./rabbitmqctl.8.html#set_permissions).

### Using CLI Tools

A virtual host can be created using [rabbitmqctl](./cli.html)'s `add_vhost` command
which accepts virtual host name as the only mandatory argument.

Here's an example that creates a virtual host named `qa1`:

<pre class="lang-bash">
rabbitmqctl add_vhost qa1
</pre>

### Using HTTP API

A virtual host can be created using the `PUT /api/vhosts/{name}` [HTTP API](./management.html) endpoint
where `{name}` is the name of the virtual host

Here's an example that uses [curl](https://curl.haxx.se/) to create a virtual host `vh1` by contacting
a node at `rabbitmq.local:15672`:

<pre class="lang-bash">
curl -u userename:pa$sw0rD -X PUT http://rabbitmq.local:15672/api/vhosts/vh1
</pre>


### <a id="preprovisioning" class="anchor" href="#preprovisioning">Bulk Creation and Pre-provisioning</a>

Virtual host creation involves a blocking cluster-wide transaction. Each node has to perform
a number of setup steps which are moderately expensive. In practice it can take up to a few seconds
for a virtual host to be created.

When a number of virtual hosts is created in a loop, CLI and HTTP API clients can outpace the actual
rate of virtual host creation and experience timeouts. If that's the case operation timeout should be increased
and delays should be introduced between operations.

[Definition export and import](./definitions.html) is the recommended
way of pre-configuring many virtual hosts at deployment time.


## <a id="metadata" class="anchor" href="#metadata">Virtual Host Metadata</a>

Virtual hosts can have metadata associated with them:

 * A description
 * A set of tags
 * Default queue type configured for the virtual host

All these settings are optional. They can be provided at virtual host creation time
or updated later.

### Using CLI Tools

The `rabbitmqctl add_vhost` command accepts a virtual host name as well as a number of optional flags.

Here's an example that creates a virtual host named `qa1` with [quorum queues](./quorum-queues.html) for default queue type,
a description and two tags:

<pre class="lang-bash">
rabbitmqctl add_vhost qa1 --description "QA environment 1" --default-queue-type quorum --tags qa,project-a
</pre>

`rabbitmqctl update_vhost_metadata` can be used to update all or some of the metadata values
demonstrated above:

<pre class="lang-bash">
rabbitmqctl update_vhost_metadata qa1 --description "QA environment for issue 1662" --default-queue-type quorum --tags qa,project-a,qa-1662
</pre>

To inspect virtual host metadata, use `rabbitmqctl list_vhots` and provide the additional column(s):

<pre class="lang-bash">
rabbitmqctl -q --formatter=pretty_table list_vhosts name description tags default_queue_type
</pre>


### Using HTTP API

The `PUT /api/vhosts/{name}` [HTTP API](./management.html) endpoint
accepts a number of optional keys.

Here's an example that uses [curl](https://curl.haxx.se/) to create a virtual host `qa1` by contacting
a node at `rabbitmq.local:15672`. [Quorum queues](./quorum-queues.html) will be used for default queue type,
a description and two tags:

<pre class="lang-bash">
curl -u userename:pa$sw0rD -X PUT http://rabbitmq.local:15672/api/vhosts/qa1 \
                           -H "content-type: application/json" \
                           --data-raw '{"description": "QA environment 1", "tags": "qa,project-a", "default_queue_type": "quorum"}'
</pre>

can be used to update all or some of the metadata values
demonstrated above:

<pre class="lang-bash">
curl -u userename:pa$sw0rD -X PUT http://rabbitmq.local:15672/api/vhosts/qa1 \
                           -H "content-type: application/json" \
                           --data-raw '{"description": "QA environment for issue 1662", "tags": "qa,project-a,qa-1662", "default_queue_type": "quorum"}'
</pre>

Virtual host metadata is returned by the `GET /api/vhosts/{name}` endpoint:

<pre class="lang-bash">
curl -u userename:pa$sw0rD -X GET http://rabbitmq.local:15672/api/vhosts/qa1
</pre>


## <a id="default-queue-type" class="anchor" href="#default-queue-type">Default Queue Type</a>

When a client declares a queue without explicitly specifying its type, a configurable default
type is used. The default can be overridden by specifying it in virtual host metadata (see above).

Supported queue types are:

 * "quorum"
 * "stream"
 * "classic"

The default is only effective for new queue declarations; updating the default will not affect
queue type of any existing queues or streams because queue type is immutable and cannot
be changed after declaration.


## <a id="deleting" class="anchor" href="#deleting">Deleting a Virtual Host</a>

A virtual host can be deleted using CLI tools or an [HTTP API](./management.html) endpoint.

Deleting a virtual host will permanently delete all entities (queues, exchanges, bindings, policies, permissions, etc) in it.

### Using CLI Tools

A virtual host can be deleted using [rabbitmqctl](./cli.html)'s `delete_vhost` command
which accepts virtual host name as the only mandatory argument.

Here's an example that deletes a virtual host named `qa1`:

<pre class="lang-bash">
rabbitmqctl delete_vhost qa1
</pre>

### Using HTTP API

A virtual host can be deleted using the `DELETE /api/vhosts/{name}` [HTTP API](./management.html) endpoint
where `{name}` is the name of the virtual host

Here's an example that uses [curl](https://curl.haxx.se/) to delete a virtual host `vh1` by contacting
a node at `rabbitmq.local:15672`:

<pre class="lang-bash">
curl -u userename:pa$sw0rD -X DELETE http://rabbitmq.local:15672/api/vhosts/vh1
</pre>


## <a id="limits" class="anchor" href="#limits">Limits</a>

In some cases it is desirable to limit the maximum allowed number of queues
or concurrent client connections in a vhost. As of RabbitMQ 3.7.0,
this is possible via **per-vhost limits**.

These limits can be configured using `rabbitmqctl` or [HTTP API](./management.html).

### Configuring Limits Using rabbitmqctl

`rabbitmqctl set_vhost_limits` is the command used to define vhost limits.
It requires a vhost parameter and a JSON document of limit definitions.

### Configuring Max Connection Limit

To limit the total number of concurrent client connections in vhost
`vhost_name`, use the following limit definition:

<pre class="lang-bash">
rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": 256}'
</pre>

To block client connections to a vhost, set the limit to a zero:

<pre class="lang-bash">
rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": 0}'
</pre>

To lift the limit, set it to a negative value:

<pre class="lang-bash">
rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": -1}'
</pre>

### Configuring Max Number of Queues

To limit the total number of queues in vhost
`vhost_name`, use the following limit definition:

<pre class="lang-bash">
rabbitmqctl set_vhost_limits -p vhost_name '{"max-queues": 1024}'
</pre>

To lift the limit, set it to a negative value:

<pre class="lang-bash">
rabbitmqctl set_vhost_limits -p vhost_name '{"max-queues": -1}'
</pre>


## Virtual Hosts and STOMP

Like AMQP 0-9-1, STOMP includes the [concept of virtual hosts](https://stomp.github.io/stomp-specification-1.2.html#CONNECT_or_STOMP_Frame). See
the [STOMP guide](./stomp.html) for details.


## Virtual Hosts and MQTT

Unlike AMQP 0-9-1 and STOMP, MQTT doesn't have the concept of virtual
hosts. MQTT connections use a single RabbitMQ host by default. There
are MQTT-specific convention and features that make it possible for
clients to connect to a specific vhosts without any client library
modifications. See the [MQTT guide](./mqtt.html) for details.