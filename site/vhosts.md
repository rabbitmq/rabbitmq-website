<!--
Copyright (c) 2007-2016 Pivotal Software, Inc.

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
or [server blocks in Nginx](https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/),the idea is similar.
There is, however, one important difference: virtual hosts in Apache are defined
in the configuration file; that's not the case with RabbitMQ: virtual hosts are
created using `rabbitmqctl` or HTTP API instead.

## Logical and Physical Separation

Virtual hosts provide logical grouping and separation of
resources. Separation of physical resources is not a goal of virtual
hosts and should be considered an implementation detail.


## Virtual Hosts and Client Connections

A virtual host has a name. When an AMQP 0-9-1 client connects to
RabbitMQ, it specifies a vhost name to connect to. If authentication
succeeds and the username provided was [granted permissions](/access-control.html) to the
vhost, connection is established.

Connections to a vhost can only operate on exchanges, queues, bindings, and so on in
that vhost. "Interconnection" of e.g. a queue and an exchange in different vhosts is only possible
when an application connects to two vhosts at the same time. For example, an
application can consume from one vhost then republishes into the other. This scenario
can involve vhosts in different clusters or the same cluster (or a single node).
[RabbitMQ Shovel plugin](/shovel.html) is one example of such application.


## Virtual Hosts and STOMP

Like AMQP 0-9-1, STOMP includes the [concept of virtual hosts](https://stomp.github.io/stomp-specification-1.2.html#CONNECT_or_STOMP_Frame). See
the [STOMP guide](/stomp.html) for details.


## Virtual Hosts and MQTT

Unlike AMQP 0-9-1 and STOMP, MQTT doesn't have the concept of virtual
hosts. MQTT connections use a single RabbitMQ host by default. There
are MQTT-specific convention and features that make it possible for
clients to connect to a specific vhosts without any client library
modifications. See the [MQTT guide](/mqtt.html) for details.


## Limits

In some cases it is desirable to limit the maximum allowed number of queues
or concurrent client connections in a vhost. As of RabbitMQ 3.7.0,
this is possible via **per-vhost limits**.

These limits can be configured using `rabbitmqctl` or [HTTP API](/management.html).

### Configuring Limits Using rabbitmqctl

`rabbitmqctl set_vhost_limits` is the command used to define vhost limits.
It requires a vhost parameter and a JSON document of limit definitions.

### Configuring Max Connection Limit

To limit the total number of concurrent client connections in vhost
`vhost_name`, use the following limit definition:

    rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": 256}'

To disable client connections to a vhost, set the limit to a zero:

    rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": 0}'

To lift the limit, set it to a negative value:

    rabbitmqctl set_vhost_limits -p vhost_name '{"max-connections": -1}'

### Configuring Max Number of Queues

To limit the total number of queues in vhost
`vhost_name`, use the following limit definition:

    rabbitmqctl set_vhost_limits -p vhost_name '{"max-queues": 1024}'

To lift the limit, set it to a negative value:

    rabbitmqctl set_vhost_limits -p vhost_name '{"max-queues": -1}'
