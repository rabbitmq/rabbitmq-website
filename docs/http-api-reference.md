---
title: HTTP API Reference
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# HTTP API Reference

## Introduction {#intro}

This is a reference page for the [RabbitMQ HTTP API](./management#http-api).

## Client Libraries for the HTTP API

There are several mature HTTP API client libraries available,
see [Developer Tools](/client-libraries/devtools).

## HTTP API-based CLI Tool

In addition to client libraries, there is an HTTP API-specific CLI tool
for both interactive and script use.

See [rabbitmqadmin v2, a Command Line Tool for the HTTP API](./management-cli) to learn more.


## Overview {#overview}

<p>All HTTP API API endpoints will serve only resources
of type <code>application/json</code>, and will require HTTP basic
authentication (using the standard RabbitMQ user database). The
default user is guest/guest.</p>

<p>Many URIs require the name of a virtual host as part of the
path, since names only uniquely identify objects within a virtual
host. As the default virtual host is called "<code>/</code>", this
will need to be encoded as "<code>%2F</code>".</p>

<p>PUTing a resource creates it. The JSON object you upload must
have certain mandatory keys (documented below) and may have
optional keys. Other keys are ignored. Missing mandatory keys
constitute an error.</p>

<p>Since bindings do not have names or IDs in AMQP we synthesise
one based on all its properties. Since predicting this name is
hard in the general case, you can also create bindings by POSTing
to a factory URI. See the example below.</p>

<p>Many URIs return lists. Such URIs can have the query string
parameters <code>sort</code> and <code>sort_reverse</code>
added. <code>sort</code> allows you to select a primary field to
sort by, and <code>sort_reverse</code> will reverse the sort order
if set to <code>true</code>. The <code>sort</code> parameter can
contain subfields separated by dots. This allows you to sort by a
nested component of the listed items; it does not allow you to
sort by more than one field. See the example below.</p>

<p>You can also restrict what information is returned per item
with the <code>columns</code> parameter. This is a comma-separated
list of subfields separated by dots. See the example below.</p>

<p>
  It is possible to disable the statistics in the GET requests
  and obtain just the basic information of every object. This reduces
  considerably the amount of data returned and the memory and resource
  consumption of each query in the system. For some monitoring and operation
  purposes, these queries are more appropriate.

  To opt out of the additional metrics, set the <code>disable_stats</code> query parameter
  to <code>true</code>
</p>

## Endpoint Reference

:::tip

The examples below use [`rabbitmqadmin` v2](./management-cli/) or [`curl`](https://curl.se/).

However, the API can be used with any HTTP client. Team RabbitMQ strongly recommends a number of
[dedicated HTTP API client libraries](/client-libraries/devtools/).

:::

:::tip

The examples that produce JSON output also format the output with [`jq`](https://jqlang.org/).
The use of `jq` is entirely optional.

:::

### GET /api/overview

Various random bits of information that describe the whole
system.

#### Examples

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin show overview
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# jq is used for pretty-printing the result. It is entirely optional.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/overview | jq
```
</TabItem>
</Tabs>

### GET /api/cluster-name

Returns the name identifying this RabbitMQ cluster.

#### Examples

<Tabs groupId="examples">
<TabItem value="curl" label="curl" default>
```bash
# jq is used for pretty-printing the result. It is entirely optional.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/cluster-name | jq
```
</TabItem>
</Tabs>

### PUT /api/cluster-name

Updates the name identifying this RabbitMQ cluster.

### GET /api/nodes

Lists all nodes in the cluster together with their metrics.

#### Examples

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list nodes
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# jq is used for pretty-printing the result. It is entirely optional.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/nodes | jq
```
</TabItem>
</Tabs>

### GET /api/nodes/\{_name_\}

Returns metrics of an individual cluster node.

#### Examples

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list nodes
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/nodes/rabbit@hostname | jq
```
</TabItem>
</Tabs>

### GET /api/nodes/\{_name_\}/memory

Returns a <a href="./memory-use">memory usage breakdown</a> of a specific cluster node.

#### Examples

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
# in percent
rabbitmqadmin show memory_breakdown_in_percent --node rabbit@hostname

# in bytes
rabbitmqadmin show memory_breakdown_in_bytes --node rabbit@hostname
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# jq is used for pretty-printing the result. It is entirely optional.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/nodes/rabbit@hostname/memory | jq
```
</TabItem>
</Tabs>

### GET /api/definitions

Exports cluster-wide definitions: all exchanges, queues, bindings, users,
virtual hosts, permissions, topic permissions, and parameters.
That is, everything apart from messages.

#### Examples

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
# Prints the result to the standard output stream.
# jq is used for pretty-printing the result. It is entirely optional.
rabbitmqadmin definitions export --stdout | jq

# stores the result to a file
rabbitmqadmin definitions export --file /path/to/exported.cluster.definitions.json
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# jq is used for pretty-printing the result. It is entirely optional.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/definitions | jq
```
</TabItem>
</Tabs>

Relevant documentation guide: <a href="./definitions">Definition Export and Import</a>.

### POST /api/definitions

The server definitions: exchanges, queues, bindings, users,
virtual hosts, permissions, topic permissions, and parameters. Everything apart from
messages. POST to upload an existing set of definitions. Note
that:

<ul>
  <li>
    Cluster-wide definitions use a different format from the virtual host-specific ones.
    Virtual host-specific definitions cannot be imported using this endpoint.
    Use the `POST /api/definitions/{vhost}` endpoint instead.
  </li>
  <li>
    The definitions are merged. Anything already existing on
    the server but not in the uploaded definitions is
    untouched.
  </li>
  <li>
    Conflicting definitions on immutable objects (exchanges,
    queues and bindings) will be ignored. The existing definition
    will be preserved.
  </li>
  <li>
    Conflicting definitions on mutable objects will cause
    the object in the server to be overwritten with the
    object from the definitions.
  </li>
  <li>
    In the event of an error you will be left with a
    partially-applied set of definitions.
  </li>
</ul>

This endpoint supports <code>multipart/form-data</code> as
well as the standard <code>application/json</code> content types for uploads.
In the former case, the definitions file should be uploaded as a form field named "file".

Relevant documentation guide: <a href="./definitions">Definition Export and Import</a>.

### GET /api/definitions/\{_vhost_\}

Exports definitions of a single virtual host.

Virtual host-specific definitions do not contain any details on the virtual
host name, and can be imported into any virtual host. That is, the original name
of the virtual host does not have to match the name of the target virtual host
when the definitions are imported.

Relevant documentation guide: <a href="./definitions">Definition Export and Import</a>.

#### Examples

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
# Prints the result to the standard output stream.
# jq is used for pretty-printing the result. It is entirely optional.
rabbitmqadmin --vhost "/" definitions export_from_vhost --stdout | jq

# stores the result to a file
rabbitmqadmin --vhost "/" definitions export_from_vhost --file /path/to/exported.single-vhost.definitions.json
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# jq is used for pretty-printing the result. It is entirely optional.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/definitions/%2F | jq
```
</TabItem>
</Tabs>


### POST /api/definitions/\{_vhost_\}

Imports (uploads) definitions from a single virtual host: exchanges, queues, bindings, users,
permissions in that virtual host, topic permissions, and parameters.

Note that:

<ul>
  <li>
    Cluster-wide definitions cannot be imported using this endpoint.
    Use the `POST /api/definitions/` endpoint instead.
  </li>
  <li>
    Virtual host-specific definitions do not contain any details on the virtual
    host name, and can be imported into any virtual host. That is, the original name
    of the virtual host does not have to match the name of the target virtual host
    when the definitions are imported.
  </li>
  <li>
    The definitions are merged. Anything already existing on
    the server but not in the uploaded definitions is
    untouched.
  </li>
  <li>
    Conflicting definitions on immutable objects (exchanges,
    queues and bindings) will be ignored. The existing definition
    will be preserved.
  </li>
  <li>
    Conflicting definitions on mutable objects will cause
    the object in the server to be overwritten with the
    object from the definitions.
  </li>
  <li>
    In the event of an error you will be left with a
    partially-applied set of definitions.
  </li>
</ul>

This endpoint supports <code>multipart/form-data</code> as
well as the standard <code>application/json</code> content types for uploads.
In the former case, the definitions file should be uploaded as a form field named "file".

Relevant documentation guide: <a href="./definitions">Definition Export and Import</a>.

### GET /api/feature-flags

Lists all feature flags and their state.

Relevant documentation guide: [Feature Flags](./feature-flags).

#### Examples

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin feature_flags list
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/feature-flags | jq
```
</TabItem>
</Tabs>

### GET /api/deprecated-features

Lists all deprecated features and their state.

Relevant documentation guide: [Deprecated Features](./deprecated-features)

#### Examples

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin deprecated_features list
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/feature-flags | jq
```
</TabItem>
</Tabs>

### GET /api/deprecated-features/used

Lists the deprecated features that are used in this cluster.

Relevant documentation guide: [Deprecated Features](./deprecated-features)

#### Examples

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin deprecated_features list_used
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/deprecated_features/used | jq
```
</TabItem>
</Tabs>

### GET /api/connections

A list of all open connections.

Use <a href="#pagination">pagination parameters</a> to list connections,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list connections
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# This request can result in a very large JSON document
# and unnecessarily wasted CPU resources.
#
# Never use it to fetch information about a single connection.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/connections | jq
```
</TabItem>
</Tabs>


### GET /api/vhosts/\{_vhost_\}/connections

<p>
  A list of all open connections in a specific virtual host.
</p>
<p>
  Use <a href="#pagination">pagination parameters</a> to list connections,
  otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
  Default page size is 100, maximum supported page size is 500.
</p>

### GET /api/connections/\{_name_\}

Returns metrics of an individual connection.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin deprecated_features list_used
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# the connection name must be percent-encoded
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/connections/127.0.0.1%3A54594%20-%3E%20127.0.0.1%3A5672 | jq
```
</TabItem>
</Tabs>

### DELETE /api/connections/\{_name_\}

Closes the connection. Optionally set the "X-Reason" header
to provide a reason.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin close connection --name "127.0.0.1:51740 -> 127.0.0.1:5672"
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# the connection name must be percent-encoded
curl -sL -u guest:guest -X DELETE -H "Accept: application/json" http://127.0.0.1:15672/api/connections/127.0.0.1%3A62965%20-%3E%20127.0.0.1%3A5672
```
</TabItem>
</Tabs>

### GET /api/connections/username/\{_username_\}

A list of all open connections that authenticated using a specific username.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list user_connections --username "guest"
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# the connection name must be percent-encoded
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/connections/username/guest
```
</TabItem>
</Tabs>

### DELETE /api/connections/username/\{_username_\}

Close all the connections of a user.

Optionally set the "X-Reason" header to provide a reason.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin close user_connections --username "guest"
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# the connection name must be percent-encoded
curl -sL -u guest:guest -X DELETE -H "Accept: application/json" http://127.0.0.1:15672/api/connections/127.0.0.1%3A62965%20-%3E%20127.0.0.1%3A5672
```
</TabItem>
</Tabs>

### GET /api/connections/\{_name_\}/channels

List of all channels for a given connection.

Use <a href="#pagination">pagination parameters</a> to list channels,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

<Tabs groupId="examples">
<TabItem value="curl" label="curl" default>
```bash
# the connection name must be percent-encoded
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/connections/127.0.0.1%3A52066%20-%3E%20127.0.0.1%3A5672/channels | jq
```
</TabItem>
</Tabs>

### GET /api/channels

A list of all open channels.

Use <a href="#pagination">pagination parameters</a> to list channels,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list channels
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# This request can result in a very large JSON document
# and unnecessarily wasted CPU resources.
#
# Never use it to fetch information about a single channel.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/channels
```
</TabItem>
</Tabs>

### GET /api/vhosts/\{_vhost_\}/channels

A list of all open channels in a specific virtual host.

Use <a href="#pagination">pagination parameters</a> to list channels,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

### GET /api/channels/\{_id_\}

Details about an individual channel.

### GET /api/consumers

A list of all consumers.

Use <a href="#pagination">pagination parameters</a> to list consumers,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list consumers
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# This request can result in a very large JSON document
# and unnecessarily wasted CPU resources.
#
# Never use it to fetch information about a single consumers.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/consumers
```
</TabItem>
</Tabs>


### GET /api/consumers/\{_vhost_\}

A list of all consumers in a given virtual host.

### GET /api/exchanges

A list of all exchanges. Use <a href="#pagination">pagination parameters</a> to list exchanges.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list exchanges
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# This request can result in a very large JSON document
# and unnecessarily wasted CPU resources.
#
# Never use it to fetch information about a single exchange.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/exchanges
```
</TabItem>
</Tabs>


### GET /api/exchanges/\{_name_\}

A list of all exchanges in a given virtual host. Use <a href="#pagination">pagination parameters</a> to list exchanges.

### GET /api/exchanges/\{_vhost_\}/\{_name_\}

Returns metrics of an individual exchange.

### PUT /api/exchanges/\{_vhost_\}/\{_name_\}

Declares an exchange.

Payload example:

```json
{
  "type": "direct",
  "auto_delete": false,
  "durable": true,
  "internal": false,
  "arguments": {}
}
```

### DELETE /api/exchanges/\{_vhost_\}/\{_name_\}

Deletes an exchange. Set the `if-unused` query parameter to `true`
to make the operaion a no-op if the exchange is bound to a queue
or as a source to another exchange

### GET /api/exchanges/\{_vhost_\}/\{_name_\}/bindings/source

A list of all bindings in which a given exchange is the source.

### GET /api/exchanges/\{_vhost_\}/\{_name_\}/bindings/destination

A list of all bindings in which a given exchange is the destination.

### PUT /api/exchanges/\{_vhost_\}/\{_name_\}/publish

Publish a message to a given exchange. A payload example:

```json
{
  "properties": {},
  "routing_key": "my key",
  "payload": "my body",
  "payload_encoding": "string"
}
```

All keys are mandatory.

The `payload_encoding` key should be either "string" (in which case the payload
will be taken to be the UTF-8 encoding of the payload field)
or "base64" (in which case the payload field is taken to be base64 encoded).

If the message is published successfully, the response will
look like:

```json
{"routed": true}
```

`routed` will be true if the message was sent to
at least one queue.

:::danger

Note that the HTTP API is a highly inefficient option for publishing;

Prefer AMQP 1.0, AMQP 0-9-1, the RabbitMQ Streaming Protocol or any other messaging protocol
supported by RabbitMQ.

:::

### GET /api/queues

A list of all queues across all virtual hosts returning a reduced set of fields.

Use <a href="#pagination">pagination parameters</a> to list queues,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

The parameter <code>enable_queue_totals=true</code> can be used in combination with the
<code>disable_stats=true</code> parameter to return a reduced set of fields and significantly
reduce the amount of data returned by this endpoint. That in turn can significantly reduce
CPU and bandwidth footprint of such requests.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list queues
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# This request can result in a very large JSON document
# and unnecessarily wasted CPU resources.
#
# Never use it to fetch information about a single queue.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/queues
```
</TabItem>
</Tabs>


### GET /api/queues/detailed

<p>
  A list of all queues containing all available information about the queues (over 50 fields per queue).
</p>
<p>
  Use <a href="#pagination">pagination parameters</a> to list queues,
  otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
  Default page size is 100, maximum supported page size is 500.
</p>

### GET /api/queues/\{_vhost_\}

A list of all queues in the given virtual host containing all available information about the queues (over 50 fields per queue)..

Use <a href="#pagination">pagination parameters</a> to list queues,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin --vhost "/" list queues
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# This request can result in a very large JSON document
# and unnecessarily wasted CPU resources.
#
# Never use it to fetch information about a single queue.
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/queues/%2F
```
</TabItem>
</Tabs>

### GET /api/queues/\{_vhost_\}/\{_name_\}

Returns metrics of a queue.

### PUT /api/queues/\{_vhost_\}/\{_name_\}

Declares a queue.

Example payload:

```json
{
  "auto_delete": false,
  "durable": true,
  "arguments": {},
  "node": "rabbit@node.hostname"
}
```

### DELETE /api/queues/\{_vhost_\}/\{_name_\}

Deletes a queue.

Two query string parameters, `if-empty=true` and/or `if-unused=true`,
can be used for conditional deletion.

### GET /api/queues/\{_vhost_\}/\{_name_\}/bindings

A list of all bindings on a given queue.

### DELETE /api/queues/\{_vhost_\}/\{_name_\}/contents

Purges a queue (deletes all messages in Ready state in it).

### POST /api/queues/\{_vhost_\}/\{_name_\}/get

Get messages from a queue. (This is not an HTTP GET as it
will alter the state of the queue.) You should post a body looking like:

```json
{
  "count": 5,
  "ackmode": "ack_requeue_true",
  "encoding": "auto",
  "truncate": 50000
}
```

`count` controls the maximum number of
messages that can be returned (fetched) at once.

The `ackmode` parameter controls how the consumed [messages are acknowledged](./confirms).
The supported values are

<ul>
  <li>`ack_requeue_true`</li>: requeues the fetched messages
  <li>`reject_requeue_true`</li>: requeues the fetched messages
  <li>`ack_requeue_false`</li>: positively acknowledges the messages and marks them for deletion
  <li>`reject_requeue_false`</li>: negatively acknowledges the messages and marks them for deletion
</ul>

The `encoding` can be either `"auto"` (the payload will be returned as a UTF-8 encoded string if the payload is valid UTF-8)
or "base64" (a Base64-encoded payload).

If the `truncate` key is set to a value in bytes, messages longer than the value will be truncated.

:::danger

This endpoint intended for development and troubleshooting only, not for production.
In production, use a messaging or streaming protocol client library instead.

:::

### GET /api/bindings

A list of all bindings.

Use <a href="#pagination">pagination parameters</a> to list bindings,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list bindings
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# This request can result in a very large JSON document
# and unnecessarily wasted CPU resources.
#
# Never use it to fetch information about a single queue.
#
# The virtual host name must be percent-encoded
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/queues/%2F
```
</TabItem>
</Tabs>

### GET /api/bindings/\{_vhost_\}

Use <a href="#pagination">pagination parameters</a> to list bindings,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

<Tabs groupId="examples">
<TabItem value="curl" label="curl" default>
```bash
# the virtual host name must be percent-encoded
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/bindings/%2F
```
</TabItem>
</Tabs>

### GET /api/bindings/\{_vhost_\}/e/\{_exchange_\}/q/\{_queue_\}

Returns a list of all bindings between an exchange and a queue.

An exchange and a queue can be bound together many times,
so this list can contain multiple bindings for the same pair.

### POST /api/bindings/\{_vhost_\}/e/\{_exchange_\}/q/\{_queue_\}

Binds a queue to an exchange.

Request body should be a JSON object optionally containing
two fields, `routing_key` (a string) and `arguments` (a map of optional arguments):

```json
{
  "routing_key": "my_routing_key",
  "arguments": {"x-optional-arg": "optional-value"}
}
```

Both payload keys are optional.

The response will contain a `Location` header
with a URI of the newly declared binding.

### GET /api/bindings/\{_vhost_\}/e/\{_exchange_\}/q/\{_queue_\}/\{_props_\}

Retrieves an individual binding between an exchange and a queue.

The \{_props_\} part of the URI is a "name" for the binding
composed of its routing key and a hash of its arguments.

\{_props_\} is the field named `properties_key` from a bindings listing response.

### DELETE /api/bindings/\{_vhost_\}/e/\{_exchange_\}/q/\{_queue_\}/\{_props_\}

Deletes an individual binding between an exchange and a queue.

The \{_props_\} part of the URI is a "name" for the binding
composed of its routing key and a hash of its arguments.

\{_props_\} is the field named `properties_key` from a bindings listing response.

### GET /api/bindings/\{_vhost_\}/e/\{_source_\}/e/\{_destination_\}

### POST /api/bindings/\{_vhost_\}/e/\{_source_\}/e/\{_destination_\}

Creates a new [exchange-to-exchange binding](./e2e/).

Request body should be a JSON object optionally containing two fields,
`routing_key` (a string) and `arguments` (a map of optional arguments):

```json
{
  "routing_key": "my_routing_key",
  "arguments": {
    "x-arg": "value"
  }
}
```

Both of the keys are optional.

The response will contain a `Location` header
with a URI of the newly declared binding.

### GET /api/bindings/\{_vhost_\}/e/\{_source_\}/e/\{_destination_\}/\{_props_\}

Returns the details of a specific [exchange-to-exchange binding](./e2e/).

### DELETE /api/bindings/\{_vhost_\}/e/\{_source_\}/e/\{_destination_\}/\{_props_\}

Deletes an [exchange-to-exchange binding](./e2e/).

### GET /api/vhosts

Returns a list of all virtual hosts in the cluster.

Pagination: default page size is 100, maximum supported page size is 500.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list vhosts
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/vhosts
```
</TabItem>
</Tabs>

### GET /api/vhosts/\{_name_\}

Returns metrics of a specific virtual host.

### PUT /api/vhosts/\{_name_\}

Creates a virtual host or updates the metadata of an existing virtual host.

Payload example:

```json
{
  "description": "virtual host description",
  "tags": "accounts,production",
  "default_queue_type": "quorum",
  "protected_from_deletion": false
}
```

The `tags` key must be a comma-separated list of tags.
These metadata fields are optional.

To enable or disable tracing, use the `tracing` key:

```json
{"tracing":true}
```

### DELETE /api/vhosts/\{_name_\}

Deletes a virtual host, as long as it is not deletion-protected.

### GET /api/vhosts/\{_name_\}/permissions

A list of all permissions for a given virtual host.

### GET /api/vhosts/\{_name_\}/topic-permissions

A list of all topic permissions for a given virtual host.

### POST /api/vhosts/\{_name_\}/deletion/protection

Protects a virtual host from deletion. Virtual hosts marked as protected
cannot be deleted until the protection is lifted.

### DELETE /api/vhosts/\{_name_\}/deletion/protection

Removes deletion protection from a virtual host so that it
can be deleted.

### POST /api/vhosts/\{_name_\}/start/\{_node_\}

Starts or restarts a virtual host on the node.

Doing this explicitly is almost never necessary. RabbitMQ nodes ensure
that all virtual hosts have been started on all cluster nodes for the first
few minutes after cluster formation (more specifically after each cluster member's startup time).

### GET /api/users

Lists all users in the cluster. This only includes the [users in the internal data store](./access-control/).
For example, if the [LDAP backend](./ldap/) is used, this command will not include any LDAP users.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list users
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/users
```
</TabItem>
</Tabs>

### GET /api/users/without-permissions

Lists the users that do not have any permissions (cannot access any virtual hosts) and
could be safely deleted.

### POST /api/users/bulk-delete

Bulk deletes a list of users. The payload must include the `users` key that is an array of usernames:

```json
{"users" : ["user1", "user2", "user3"]}
```

### GET /api/users/\{_name_\}

Returns information about a user in the internal data store.

### PUT /api/users/\{_name_\}

Creates a user. A password or a password hash must be provided
in the payload:

```json
{"password":"secret","tags":"administrator"}
```

```json
{"password_hash":"2lmoth8l4H0DViLaK9Fxi6l9ds8=", "tags":["administrator"]}
```

`password_hash` must be generated using the algorithm described
[in the Passwords guide](./passwords/).

The `tags` key takes a comma-separated list of tags.

If neither are set the user will not be able to log in with a password,
but other mechanisms like client certificates may be used.

Setting `password_hash` to an empty string (`""`) will ensure the
user cannot use a password to log in.

The hash function can be overriden using the `hashing_algorithm`
key. Currently recognised algorithms are `rabbit_password_hashing_sha256`,
`rabbit_password_hashing_sha512`, and `rabbit_password_hashing_md5`.


### DELETE /api/users/\{_name_\}

Deletes a user.

### GET /api/users/\{_user_\}/permissions

A list of all permissions for a given user.

### GET /api/users/\{_user_\}/topic-permissions

A list of all topic permissions for a given user.

### GET /api/user-limits

Lists per-user limits for all users.

### GET /api/user-limits/\{_user_\}

Lists per-user limits for a specific user.

### PUT /api/user-limits/\{_user_\}/\{_name_\}

Set or delete per-user limit for `user`. The `name` URL path element
refers to the name of the limit (`max-connections`, `max-channels`).

Limits are set using a JSON document in the body:

```json
{"value": 100}
```

An example request using `curl`:

```shell
curl -4u 'guest:guest' -H 'content-type:application/json' -X PUT localhost:15672/api/user-limits/guest/max-connections -d '{"value": 100}'
```

### DELETE /api/user-limits/\{_user_\}/\{_name_\}

Clears a per-user limit.

### GET /api/permissions

A list of all user permissions in the cluster.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list permissions
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/permissions
```
</TabItem>
</Tabs>

### GET /api/permissions/\{_vhost_\}/\{_user_\}

Returns a user's permissions in the given virtual host.

### PUT /api/permissions/\{_vhost_\}/\{_user_\}

Grants (creates) or updates user permissions in the given virtual host.

Payload example

```json
{"configure":".*","write":".*","read":".*"}
```

All three permissions must be explicitly provided.

### DELETE /api/permissions/\{_vhost_\}/\{_user_\}

Revokes user permissions in the given virtual host.

### GET /api/topic-permissions

Lists all [topic exchange permissions](./access-control#topic-authorisation) in the cluster.

### GET /api/topic-permissions/\{_vhost_\}/\{_user_\}

Returns a user's [topic exchange permissions](./access-control#topic-authorisation) in the given virtual host.

### PUT /api/topic-permissions/\{_vhost_\}/\{_user_\}

Grants or updates a user's [topic exchange permission](./access-control#topic-authorisation) of a user.

```json
{
  "exchange": "amq.topic",
  "write": "^a",
  "read":".*",
  "configure":".*"
}
```

All the keys from the example above are mandatory.

### DELETE /api/topic-permissions/\{_vhost_\}/\{_user_\}

Revokes [topic exchange permissions](./access-control#topic-authorisation) of a user.

### GET /api/parameters

Returns a list of [runtime parameters](./parameters) across all virtual hosts in the cluster.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list parameters
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/parameters
```
</TabItem>
</Tabs>

### GET /api/parameters/\{_component_\}

### GET /api/parameters/\{_component_\}/\{_vhost_\}

### GET /api/parameters/\{_component_\}/\{_vhost_\}/\{_name_\}

### PUT /api/parameters/\{_component_\}/\{_vhost_\}/\{_name_\}

Creates or updates a [runtime parameter](./parameters).

Example body:

```json
{
  "vhost": "vh-2",
  "name": "policies.1",
  "pattern": "^cq",
  "apply-to": "queues",
  "definition": {
    "max-length": 1000000
  }
}
```

### DELETE /api/parameters/\{_component_\}/\{_vhost_\}/\{_name_\}

Deletes a [runtime parameter](./parameters).


### GET /api/global-parameters

Lists all [global runtime parameters](./parameters) in the cluster.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin global_parameters list
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/global-parameters
```
</TabItem>
</Tabs>

### GET /api/global-parameters/\{_name_\}

Returns the value (definition) of the given global runtime parameter.

<Tabs groupId="examples">
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/global-parameters/cluster_name
```
</TabItem>
</Tabs>

### PUT /api/global-parameters/\{_name_\}

Sets the given global runtime parameter.

Example payloads:

```json
{
  "name": "cluster_name",
  "value": "prod-456"
}
```

```json
{
  "name": "cluster_tags",
  "value": {
    "environment": "production",
    "az": "ca-central-1"
  }
}
```

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin global_parameters set --name "cluster_tags" --value '{"az": "ca-central-1", "environment": "production"}'
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -X PUT -H "Accept: application/json" -H "Content-Type: application/json" http://127.0.0.1:15672/api/global-parameters/cluster_tags \
     --data '{"value": {"region": "ca-central-1", "environment": "production"}, "name": "cluster_tags"}'
```
</TabItem>
</Tabs>

### DELETE /api/global-parameters/\{_name_\}

Clears a global runtime parameter.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin global_parameters clear --name "cluster_tags"
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -X DELETE -H "Accept: application/json" http://127.0.0.1:15672/api/global-parameters/cluster_tags
```
</TabItem>
</Tabs>

### GET /api/policies

Lists [policies](./policies) across all virtual hosts in the cluster.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list policies
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/policies
```
</TabItem>
</Tabs>

### GET /api/policies/\{_vhost_\}

Lists [policies](./policies) in the given virtual host.

<Tabs groupId="examples">
<TabItem value="curl" label="curl" default>
```bash
# The virtual host name must be percent-encoded
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/policies/%2F
```
</TabItem>
</Tabs>

### GET /api/policies/\{_vhost_\}/\{_name_\}

Returns a [policy](./policies) definition.

### PUT /api/policies/\{_vhost_\}/\{_name_\}

Declares or updates a [policy](./policies).

Example payload:

```json
{"pattern":"^amq.", "definition": {"federation-upstream-set":"all"}, "priority": 10, "apply-to": "queues"}
```

All the keys in the example are mandatory.

:::important

Only one policy applies or a queue, stream or exchange at a time.

When multiple policies have conflicting priorities, a random one will be applied.
This scenario therefore [must be avoided](./policies#priorities).

:::

### DELETE /api/policies/\{_vhost_\}/\{_name_\}

Deletes a policy.

### GET /api/operator-policies

Lists [operator policies](./policies#operator-policies) across all virtual hosts in the cluster.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin list operator_policies
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/operator-policies
```
</TabItem>
</Tabs>

### GET /api/operator-policies/\{_vhost_\}

Returns an operator [policy](./policies#operator-policies) definition.

<Tabs groupId="examples">
<TabItem value="curl" label="curl" default>
```bash
# The virtual host name must be percent-encoded
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/operator-policies/%2F
```
</TabItem>
</Tabs>

### GET /api/operator-policies/\{_vhost_\}/\{_name_\}

Returns an operator [policy](./policies#operator-policies) definition.

### PUT /api/operator-policies/\{_vhost_\}/\{_name_\}


Example payload:

```json
{"pattern":"^amq.", "definition": {"federation-upstream-set":"all"}, "priority": 10, "apply-to": "queues"}
```

All the keys in the example are mandatory.

:::important

Only one policy applies or a queue, stream or exchange at a time.

When multiple policies have conflicting priorities, a random one will be applied.
This scenario therefore [must be avoided](./policies#priorities).

:::

### DELETE /api/operator-policies/\{_vhost_\}/\{_name_\}

Deletes an operator policy.


### GET /api/vhost-limits

Lists all [virtual host limits](./vhosts#limits) configured across the cluster.

<Tabs groupId="examples">
<TabItem value="curl" label="curl" default>
```bash
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/vhost-limits
```
</TabItem>
</Tabs>

### GET /api/vhost-limits/\{_vhost_\}

Lists [virtual host limits](./vhosts#limits) configured for the target virtual host.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin v2">
```bash
rabbitmqadmin --vhost "/" list vhost_limits
```
</TabItem>
<TabItem value="curl" label="curl" default>
```bash
# The virtual host name must be percent-encoded
curl -sL -u guest:guest -H "Accept: application/json" http://127.0.0.1:15672/api/vhost-limits/%2F
```
</TabItem>
</Tabs>

### PUT /api/vhost-limits/\{_vhost_\}/\{_name_\}

Set or delete per-vhost limit for `vhost`. The `name` URL path element
refers to the name of the limit (`max-connections`, `max-queues`).

Limits are set using a JSON document in the body:

```json
{"value": 100}
```

Example request:

```shell
curl -4u 'guest:guest' -H 'content-type:application/json' -X PUT localhost:15672/api/vhost-limits/my-vhost/max-connections -d '{"value": 50}'
```
Relevant documentation guide: [Virtual Hosts](./vhosts).


### DELETE /api/vhost-limits/\{_vhost_\}/\{_name_\}

Clears (removes) a [virtual host limit](./vhosts#limits).


### GET /api/federation-links

Provides status for all federation links across all virtual hosts in the cluster.

This endpoint will only be available the `rabbitmq_federation_management` plugin is enabled.

Relevant documentation guide: [Federation](./federation/).

### GET /api/federation-links/\{_vhost_\}

Provides status for all federation links in the given virtual host.

This endpoint will only be available the `rabbitmq_federation_management` plugin is enabled.

Relevant documentation guide: [Federation](./federation/).

### GET /api/auth/attempts/\{_node_\}

A list of client authentication attempts registered by the node.

### GET /api/auth/attempts/\{_node_\}/source

A list of client authentication attempts grouped by remote address and username.

### GET /api/auth/hash_password/\{_password_\}

Hashes the provided [password](./passwords) according to the currently configured password hashing algorithm.

### GET /api/stream/connections

Lists all [stream protocol](./streams) connections across all virtual hosts in the cluster.

Use <a href="#pagination">pagination parameters</a> to list connections,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### GET /api/stream/connections/\{_vhost_\}

A list of all open [stream protocol](./streams) connections in a specific virtual host.

Use <a href="#pagination">pagination parameters</a> to list connections,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### GET /api/stream/connections/\{_vhost_\}/\{_name_\}

Returns metrics of a specific [stream protocol](./streams) connection.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### DELETE /api/stream/connections/\{_vhost_\}/\{_name_\}

Closes a specific [stream protocol](./streams) connection.

Optionally set the "X-Reason" header to provide a reason.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### GET /api/stream/connections/\{_vhost_\}/\{_name_\}/publishers

Lists known publishers on a [stream protocol](./streams) connection.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### GET /api/stream/connections/\{_vhost_\}/\{_name_\}/consumers

Lists known consumers on a [stream protocol](./streams) connection.

Use <a href="#pagination">pagination parameters</a> to list consumers,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### GET /api/stream/publishers

The list of known publishers across all [stream protocol](./streams) connections.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### GET /api/stream/publishers/\{_vhost_\}

The list of known publishers for all [stream protocol](./streams) connections in the given virtual host.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### GET /api/stream/publishers/\{_vhost_\}/\{_stream_\}

The list of known publishers to the given stream across all [stream protocol](./streams) connections.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### GET /api/stream/consumers

Use <a href="#pagination">pagination parameters</a> to list consumers,
otherwise this endpoint can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
Default page size is 100, maximum supported page size is 500.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.

### GET /api/stream/consumers/\{_vhost_\}

The list of stream consumers in a specific virtual host.

Requires the <code>rabbitmq_stream_management</code> plugin to be enabled.


## Health Check Endpoints {#health-checks}

### GET /api/health/checks/alarms

Responds a 200 OK if there are no alarms in effect in the cluster,
otherwise responds with a 503 Service Unavailable.

Relevant documentation guide: <a href="./alarms">Resource Alarms</a>.

### GET /api/health/checks/local-alarms

Responds a 200 OK if there are no alarms in effect in the cluster,
otherwise responds with a 503 Service Unavailable.

Relevant documentation guide: <a href="./alarms">Resource Alarms</a>.

### GET /api/health/checks/certificate-expiration/\{_within_\}/\{_unit_\}

Checks the expiration date of every certificate found in the PEM certificate bundles used by
all TLS-enabled listeners on the node, regardless of the "type" of the certificate (leaf/server identity,
intermediary or any CA).

Responds a 200 OK if all certificates are valid (have not expired),
otherwise responds with a 503 Service Unavailable.

This health assumes that

<ul>
  <li>All certificates included in the PEM bundles on the nodes are relevant to RabbitMQ clients, plugins or encrypted inter-node communication</li>
  <li>Expired certificates is not a normal operating condition and any expired certificate found must be reported with a check failure</li>
</ul>

Do not use this health check if some of these assumptions are not true.

Valid units: days, weeks, months, years. The value of the \{_within_\} argument is the number of
units. So, when \{_within_\} is 2 and \{_unit_\} is "months", the expiration period used by the check
will be the next two months.

Relevant documentation guides: <a href="./ssl">TLS</a>, <a href="./clustering-ssl">Encrypted Inter-node Communication</a>.

### GET /api/health/checks/port-listener/\{_port_\}

Responds a 200 OK if there is an active listener on the given port,
otherwise responds with a 503 Service Unavailable.

Relevant documentation guides: <a href="./networking">Networking</a>.

### GET /api/health/checks/protocol-listener/\{_protocols_\}

Responds a 200 OK if if all given protocols have active listeners,
otherwise responds with a 503 Service Unavailable. Multiple protocols
may be provided by separating the names with commas.

Valid protocol names are: `amqp`, `mqtt`, `stomp`, `web-mqtt`, `web-stomp`.
To check for the encrypted listeners, add an `s` to the protocol name, for
example `amqps` or `mqtts`.

### GET /api/health/checks/virtual-hosts

Responds a 200 OK if all virtual hosts and running on the target node,
otherwise responds with a 503 Service Unavailable.

### GET /api/health/checks/node-is-quorum-critical

Checks if there are quorum queues with minimum online quorum (queues that
would lose their quorum and availability if the target node is shut down).
Responds a 200 OK if there are no such quorum queues,
otherwise responds with a 503 Service Unavailable.

Relevant documentation guide: <a href="./quorum-queues">Quorum Queues</a>.

### GET /api/health/checks/is-in-service

Responds a 200 OK if the target node is booted, running, and ready to
serve clients, otherwise responds with a 503 Service Unavailable. If the
target node is being drained for maintenance then this check returns 503
Service Unavailable.

### GET /api/health/checks/below-node-connection-limit

Responds a 200 OK if the target node has fewer connections to the AMQP
and AMQPS ports than the configured maximum, otherwise responds with a
503 Service Unavailable.

### GET /api/health/checks/ready-to-serve-clients

Responds a 200 OK if the target node is ready to serve clients, otherwise
responds with a 503 Service Unavailable. This check combines:

* `/api/health/checks/is-in-service`
* `/api/health/checks/protocol-listener/amqp` or `/api/health/checks/protocol-listener/amqps`
* `/api/health/checks/below-node-connection-limit`

So this check will only return 200 OK if the target node is in service,
an AMQP or AMQPS listener is available and the target node has fewer active
AMQP and AMQPS connections that its configured limit.

### GET /api/rebalance/queues

Rebalances all queues in all vhosts.

This operation is asynchronous. Inspect [RabbitMQ logs](./logging/)
for messages regarding the success or failure of the operation.

```shell
curl -4u 'guest:guest' -XPOST localhost:15672/api/rebalance/queues/
```

### GET /api/whoami

Returns the username of the authenticated user.

### GET /api/auth

Details about the [OAuth 2](./oauth2/) configuration. It will return HTTP
status 200 with a body in the following format:

```json
{"oauth_enabled":"boolean", "oauth_client_id":"string", "oauth_provider_url":"string"}
```

### GET /api/extensions

A list of registered extensions to the management plugin.


## Metrics Returned by the HTTP API

Most of the GET requests you can issue to the HTTP API return
JSON objects with a large number of keys. While a few of these
keys represent things you set yourself in a PUT request or AMQP
command (e.g. queue durability or arguments), most of them
represent statistics to do with the object in question. This
page attempts to document them.

<p>
  It should be read in conjunction with the manual page
  for <code>rabbitmqctl</code> (see your installation if on Unix / Linux,
  or <a href="./rabbitmqctl.8.html">the RabbitMQ website</a> for the latest version).

  Any field which can be returned by a command of the form

  ```shell
  rabbitmqctl list_{object}
  ```

  ```shell
  rabbitmqctl list_{object}
  ```

  will also be returned in the
  equivalent part of the HTTP API, so all those keys are not
  documented here. However, the HTTP API returns additional metrics compared to the
  standard [CLI tools](./cli) and [`rabbitmqadmin` v2](./management-cli/) alike.
</p>

<h2>_details objects</h2>
<p>
  Many fields represent a count of some kind: queue length,
  messages acknowledged, bytes received and so on. Such absolute
  counts returned by the HTTP API will often have a
  corresponding <code>_details</code> object which offers
  information on how this count has changed. So for example, from
  a queue:

  ```json
  "messages": 123619,
  "messages_details": {
    "avg": 41206.333333333336,
    "avg_rate": 1030.1583333333333,
    "rate": 24723.8,
    "samples": [
      {
        "sample": 123619,
        "timestamp": 1400680560000
      },
      {
        "sample": 0,
        "timestamp": 1400680500000
      },
      {
        "sample": 0,
        "timestamp": 1400680440000
      }
    ]
  }
  ```
</p>

<p>
  Here we have a <code>messages</code> count (the total messages
  in the queue), with some additional data:
</p>

<table>
  <tr>
    <td><code>avg</code></td>
    <td>
      The average value for the requested time period (see below).
    </td>
  </tr>
  <tr>
    <td><code>avg_rate</code></td>
    <td>
      The average rate for the requested time period.
    </td>
  </tr>
  <tr>
    <td><code>rate</code></td>
    <td>
      How much the count has changed per second in the most recent
      sampling interval.
    </td>
  </tr>
  <tr>
    <td><code>samples</code></td>
    <td>
      Snapshots showing how the value has changed over the
      requested time period.
    </td>
  </tr>
</table>

<p>
  <code>avg</code>, <code>avg_rate</code> and <code>samples</code>
  will only appear if you request a specific time period by
  appending query parameters to the URL. To do this you need to
  set an age and an increment for the samples you want. The end of
  the range returned will always correspond to the present.
</p>

<p>
  Different types of data take different query parameters to
  return samples, as in the following table. You can specify more
  than one set of parameters if the resource you are requesting
  can generate more than one type of sample (for example, queues
  can return message rates and queue lengths).
</p>

<table>
  <tr>
    <td>Messages sent and received</td>
    <td>`msg_rates_age` / `msg_rates_incr`</td>
  </tr>
  <tr>
    <td>Bytes sent and received</td>
    <td>`data_rates_age` / `data_rates_incr`</td>
  </tr>
  <tr>
    <td>Queue lengths</td>
    <td>`lengths_age` / `lengths_incr`</td>
  </tr>
  <tr>
    <td>Node statistics (e.g. file descriptors, disk space free)</td>
    <td>`node_stats_age` / `node_stats_incr`</td>
  </tr>
</table>

<p>
  For example,
  appending <code>?lengths_age=3600&lengths_incr=60</code> will
  return the last hour's data on queue lengths, with a sample for
  every minute.
</p>

<h2>message_stats objects</h2>
<p>
  Many objects (including queues, exchanges and channels) will
  return counts of messages passing through them. These are
  included in a <code>message_stats</code> object (which in turn
  will contain <code>_details</code> objects for each count, as
  described above).
</p>
<p>
  These can contain:
</p>

<table>
  <tr>
    <td><code>publish</code></td>
    <td>
      Count of messages published.
    </td>
  </tr>
  <tr>
    <td><code>publish_in</code></td>
    <td>
      Count of messages published "in" to an exchange, i.e. not
      taking account of routing.
    </td>
  </tr>
  <tr>
    <td><code>publish_out</code></td>
    <td>
      Count of messages published "out" of an exchange,
      i.e. taking account of routing.
    </td>
  </tr>
  <tr>
    <td><code>confirm</code></td>
    <td>
      Count of messages confirmed.
    </td>
  </tr>
  <tr>
    <td><code>deliver</code></td>
    <td>
      Count of messages delivered in acknowledgement mode to consumers.
    </td>
  </tr>
  <tr>
    <td><code>deliver_no_ack</code></td>
    <td>
      Count of messages delivered in no-acknowledgement mode to consumers.
    </td>
  </tr>
  <tr>
    <td><code>get</code></td>
    <td>
      Count of messages delivered in acknowledgement mode in
      response to basic.get.
    </td>
  </tr>
  <tr>
    <td><code>get_no_ack</code></td>
    <td>
      Count of messages delivered in no-acknowledgement mode in
      response to basic.get.
    </td>
  </tr>
  <tr>
    <td><code>deliver_get</code></td>
    <td>
      Sum of all four of the above.
    </td>
  </tr>
  <tr>
    <td><code>redeliver</code></td>
    <td>
      Count of subset of messages in <code>deliver_get</code>
      which had the redelivered flag set.
    </td>
  </tr>
  <tr>
    <td><code>drop_unroutable</code></td>
    <td>
      Count of messages dropped as unroutable.
    </td>
  </tr>
  <tr>
    <td><code>return_unroutable</code></td>
    <td>
      Count of messages returned to the publisher as unroutable.
    </td>
  </tr>
</table>

<p>
  Only fields for which some activity has taken place will appear.
</p>

<h2>Detailed message stats objects</h2>
<p>
  In addition, queues, exchanges and channels can return a
  breakdown of message stats for each of their neighbours
  (i.e. adjacent objects in the chain: channel -> exchange ->
  queue -> channel). This will only happen if
  the <code>rates_mode</code> configuration item has been switched
  to <code>detailed</code> from its default of <code>basic</code>.
</p>
<p>
  As this possibly constitutes a large quantity of data, it is also
  only returned when querying a single channel, queue or exchange
  rather than a list. Note also that the default sample retention
  policy means that these detailed message stats do not retain
  historical data for more than a few seconds.
</p>
<p>
  The detailed message stats objects have different names
  depending on where they are (documented below). Each set of
  detailed stats consists of a list of objects with two fields,
  one identifying the partner object and one <code>stats</code>
  which is a message_stats object as described above.
</p>
<p>
  Here is an example snippet:

  ```json
  "incoming": [
    {
      "stats": {
        "publish": 352593,
        "publish_details": {
          "rate": 100.2
        }
      },
      "exchange": {
        "name": "my-exchange",
        "vhost": "/"
      }
    }
    {
      "stats": {
        "publish": 543784,
        "publish_details": {
          "rate": 54.6
        }
      },
      "exchange": {
        "name": "amq.topic",
        "vhost": "/"
      }
    }
  ],
  ```
</p>

<p>
  This queue is currently receiving messages from two exchanges:
  100.2 msg/s from "my-exchange" and 54.6 msg/s from "amq.topic".
</p>

<h2>/api/overview</h2>

<p>
  This has the following fields:
</p>

<table>
  <tr>
    <td><code>cluster_name</code></td>
    <td>
      The name of the entire cluster, as set with <code>rabbitmqctl
      set_cluster_name</code>.
    </td>
  </tr>
  <tr>
    <td><code>contexts</code></td>
    <td>
      A list of web application contexts in the cluster.
    </td>
  </tr>
  <tr>
    <td><code>erlang_full_version</code></td>
    <td>
      A string with extended detail about the Erlang VM and how it
      was compiled, for the node connected to.
    </td>
  </tr>
  <tr>
    <td><code>erlang_version</code></td>
    <td>
      A string with the Erlang version of the node connected
      to. As clusters should all run the same version this can be
      taken as representing the cluster.
    </td>
  </tr>
  <tr>
    <td><code>exchange_types</code></td>
    <td>
      A list of all exchange types available.
    </td>
  </tr>
  <tr>
    <td><code>listeners</code></td>
    <td>
      All (non-HTTP) network listeners for all nodes in the
      cluster. (See <code>contexts</code>
      in <code>/api/nodes</code> for HTTP).
    </td>
  </tr>
  <tr>
    <td><code>management_version</code></td>
    <td>
      Version of the management plugin in use.
    </td>
  </tr>
  <tr>
    <td><code>message_stats</code></td>
    <td>
      A message_stats object for everything the user can see - for
      all vhosts regardless of permissions in the case
      of <code>monitoring</code> and <code>administrator</code>
      users, and for all vhosts the user has access to for other
      users.
    </td>
  </tr>
  <tr>
    <td><code>node</code></td>
    <td>
      The name of the cluster node this management plugin instance
      is running on.
    </td>
  </tr>
  <tr>
    <td><code>object_totals</code></td>
    <td>
      An object containing global counts of all connections,
      channels, exchanges, queues and consumers, subject to the
      same visibility rules as for <code>message_stats</code>.
    </td>
  </tr>
  <tr>
    <td><code>queue_totals</code></td>
    <td>
      An object containing sums of
      the <code>messages</code>, <code>messages_ready</code>
      and <code>messages_unacknowledged</code> fields for all
      queues, again subject to the same visibility rules as
      for <code>message_stats</code>.
    </td>
  </tr>
  <tr>
    <td><code>rabbitmq_version</code></td>
    <td>
      Version of RabbitMQ on the node which processed this request.
    </td>
  </tr>
  <tr>
    <td><code>rates_mode</code></td>
    <td>
      'none', 'basic' or 'detailed'.
    </td>
  </tr>
  <tr>
    <td><code>statistics_db_event_queue</code></td>
    <td>
      Number of outstanding statistics events yet to be processed
      by the database.
    </td>
  </tr>
  <tr>
    <td><code>statistics_db_node</code></td>
    <td>
      Name of the cluster node hosting the management statistics database.
    </td>
  </tr>
</table>

<h2>/api/nodes</h2>

<p>
  This has the following fields:
</p>

<table>
  <tr>
    <td><code>applications</code></td>
    <td>
      List of all Erlang applications running on the node.
    </td>
  </tr>
  <tr>
    <td><code>auth_mechanisms</code></td>
    <td>
      List of all SASL authentication mechanisms installed on the node.
    </td>
  </tr>
  <tr>
    <td><code>cluster_links</code></td>
    <td>
      A list of the other nodes in the cluster. For each node,
      there are details of the TCP connection used to connect to
      it and statistics on data that has been transferred.
    </td>
  </tr>
  <tr>
    <td><code>config_files</code></td>
    <td>
      List of config files read by the node.
    </td>
  </tr>
  <tr>
    <td><code>contexts</code></td>
    <td>
      List of all HTTP listeners on the node.
    </td>
  </tr>
  <tr>
    <td><code>db_dir</code></td>
    <td>
      Location of the persistent storage used by the node.
    </td>
  </tr>
  <tr>
    <td><code>disk_free</code></td>
    <td>
      Disk free space in bytes.
    </td>
  </tr>
  <tr>
    <td><code>disk_free_alarm</code></td>
    <td>
      Whether the disk alarm has gone off.
    </td>
  </tr>
  <tr>
    <td><code>disk_free_limit</code></td>
    <td>
      Point at which the disk alarm will go off.
    </td>
  </tr>
  <tr>
    <td><code>enabled_plugins</code></td>
    <td>
      List of plugins which are both explicitly enabled and running.
    </td>
  </tr>
  <tr>
    <td><code>exchange_types</code></td>
    <td>
      Exchange types available on the node.
    </td>
  </tr>
  <tr>
    <td><code>log_files</code></td>
    <td>
      List of log files used by the node. If the node also sends
      messages to stdout, "<code>&lt;stdout&gt;</code>" is also
      reported in the list.
    </td>
  </tr>
  <tr>
    <td><code>mem_used</code></td>
    <td>
      Memory used in bytes.
    </td>
  </tr>
  <tr>
    <td><code>mem_alarm</code></td>
    <td>
      Whether the memory alarm has gone off.
    </td>
  </tr>
  <tr>
    <td><code>mem_limit</code></td>
    <td>
      Point at which the memory alarm will go off.
    </td>
  </tr>
  <tr>
    <td><code>name</code></td>
    <td>
      Node name.
    </td>
  </tr>
  <tr>
    <td><code>net_ticktime</code></td>
    <td>
      Current kernel net_ticktime setting for the node.
    </td>
  </tr>
  <tr>
    <td><code>os_pid</code></td>
    <td>
      Process identifier for the Operating System under which this
      node is running.
    </td>
  </tr>
  <tr>
    <td><code>partitions</code></td>
    <td>
      List of network partitions this node is seeing.
    </td>
  </tr>
  <tr>
    <td><code>proc_total</code></td>
    <td>
      Maximum number of Erlang processes.
    </td>
  </tr>
  <tr>
    <td><code>proc_used</code></td>
    <td>
      Number of Erlang processes in use.
    </td>
  </tr>
  <tr>
    <td><code>rates_mode</code></td>
    <td>
      'none', 'basic' or 'detailed'.
    </td>
  </tr>
  <tr>
    <td><code>run_queue</code></td>
    <td>
      Average number of Erlang processes waiting to run.
    </td>
  </tr>
  <tr>
    <td><code>running</code></td>
    <td>
      Boolean for whether this node is up. Obviously if this is
      false, most other stats will be missing.
    </td>
  </tr>
  <tr>
    <td><code>type</code></td>
    <td>
      'disc' or 'ram'.
    </td>
  </tr>
  <tr>
    <td><code>uptime</code></td>
    <td>
      Time since the Erlang VM started, in milliseconds.
    </td>
  </tr>
  <tr>
    <td><code>processors</code></td>
    <td>
      Number of logical CPU cores used by RabbitMQ.
    </td>
  </tr>
</table>

<h2>/api/nodes/(name)</h2>

<p>
  All of the above, plus:
</p>

<table>
  <tr>
    <td><code>memory</code></td>
    <td>
      Detailed memory use statistics. Only appears
      if <code>?memory=true</code> is appended to the URL.
    </td>
  </tr>
  <tr>
    <td><code>binary</code></td>
    <td>
      Detailed breakdown of the owners of binary memory. Only
      appears if <code>?binary=true</code> is appended to the
      URL. Note that this can be an expensive query if there are
      many small binaries in the system.
    </td>
  </tr>
</table>

<h2>/api/connections</h2>
<h2>/api/connections/(name)</h2>

<p>
  See documentation for <code>rabbitmqctl
  list_connections</code>. No additional fields,
  although <code>pid</code> is replaced by <code>node</code>.
</p>

<p>
  Note also that while non-AMQP connections will appear in this
  list (unlike <code>rabbitmqctl list_connections</code>), they
  will omit many of the connection-level statistics.
</p>

<h2>/api/connections/(name)/channels</h2>
<h2>/api/channels</h2>

<p>
  See documentation for <code>rabbitmqctl list_channels</code>,
  with <code>pid</code> replaced by <code>node</code>, plus:
</p>

<table>
  <tr>
    <td><code>connection_details</code></td>
    <td>
      Some basic details about the owning connection.
    </td>
  </tr>
  <tr>
    <td><code>message_stats</code></td>
    <td>
      See the section on message_stats above.
    </td>
  </tr>
</table>

<h2>/api/channels/(name)</h2>

<p>
  All the above, plus
</p>

<table>
  <tr>
    <td><code>publishes</code></td>
    <td>
      Detailed message stats (see section above) for publishes to
      exchanges.
    </td>
  </tr>
  <tr>
    <td><code>deliveries</code></td>
    <td>
      Detailed message stats for deliveries from queues.
    </td>
  </tr>
  <tr>
    <td><code>consumer_details</code></td>
    <td>
      List of consumers on this channel, with some details on each.
    </td>
  </tr>
</table>

<h2>/api/exchanges</h2>
<h2>/api/exchanges/(vhost)</h2>

<p>
  See documentation for <code>rabbitmqctl list_exchanges</code>, plus:
</p>

<table>
  <tr>
    <td><code>message_stats</code></td>
    <td>
      See the section on message_stats above.
    </td>
  </tr>
</table>

<h2>/api/exchanges/(vhost)/(name)</h2>

<p>
  All the above, plus:
</p>

<table>
  <tr>
    <td><code>incoming</code></td>
    <td>
      Detailed message stats (see section above) for publishes
      from channels into this exchange.
    </td>
  </tr>
  <tr>
    <td><code>outgoing</code></td>
    <td>
      Detailed message stats for publishes from this exchange into
      queues.
    </td>
  </tr>
</table>

<h2>/api/queues</h2>

When using the query parameters combination of <code>disable_stats</code> and
<code>enable_queue_totals</code> this query returns the following fields:

<table>
  <tr>
    <td><code>name</code></td>
    <td>
      The name of the queue.
    </td>
  </tr>
  <tr>
    <td><code>vhost</code></td>
    <td>
      The name of the virtual host.
    </td>
  </tr>
  <tr>
    <td><code>type</code></td>
    <td>
      The type of the queue.
    </td>
  </tr>
  <tr>
    <td><code>node</code></td>
    <td>
      Depending on the type of the queue, this is the node which holds the queue or hosts the leader.
    </td>
  </tr>
  <tr>
    <td><code>state</code></td>
    <td>
      The status of the queue.
    </td>
  </tr>
  <tr>
    <td><code>arguments</code></td>
    <td>
      The arguments of the queue.
    </td>
  </tr>
  <tr>
    <td><code>auto_delete</code></td>
    <td>
      The value of the <code>auto_delete</code> argument.
    </td>
  </tr>
  <tr>
    <td><code>durable</code></td>
    <td>
      The value of the <code>durable</code> argument.
    </td>
  </tr>
  <tr>
    <td><code>exclusive</code></td>
    <td>
      The value of the <code>exclusive</code> argument.
    </td>
  </tr>
  <tr>
    <td><code>messages</code></td>
    <td>
      The total number of messages in the queue.
    </td>
  </tr>
  <tr>
    <td><code>messages_ready</code></td>
    <td>
      The number of messages ready to be delivered in the queue.
    </td>
  </tr>
  <tr>
    <td><code>messages_unacknowledged</code></td>
    <td>
      The number of messages waiting for acknowledgement in the queue.
    </td>
  </tr>
</table>

<h2>/api/queues/(vhost)</h2>

<p>
  See documentation for <code>rabbitmqctl list_queues</code>, with
  all references to <code>pid</code>s replaced by <code>node</code>s
  plus:
</p>

<table>
  <tr>
    <td><code>message_stats</code></td>
    <td>
      See the section on message_stats above.
    </td>
  </tr>
</table>

<h2>/api/queues/(vhost)/(name)</h2>

<p>
  All the above, plus:
</p>

<table>
  <tr>
    <td><code>incoming</code></td>
    <td>
      Detailed message stats (see section above) for
      publishes from exchanges into this queue.
    </td>
  </tr>
  <tr>
    <td><code>deliveries</code></td>
    <td>
      Detailed message stats for deliveries from this queue into
      channels.
    </td>
  </tr>
  <tr>
    <td><code>consumer_details</code></td>
    <td>
      List of consumers on this channel, with some details on each.
    </td>
  </tr>
</table>

<h2>/api/vhosts/</h2>
<h2>/api/vhosts/(name)</h2>

<p>
  All the fields from <code>rabbitmqctl list_vhosts</code>
  (i.e. <code>name</code> and <code>tracing</code>) plus:
</p>

<table>
  <tr>
    <td><code>message_stats</code></td>
    <td>
      Global message_stats for this vhost. Note that activity for
      other users in this vhost <b>is</b> shown, even for users
      without the <code>monitoring</code> tag.
    </td>
  </tr>
  <tr>
    <td><code>messages</code> <code>messages_ready</code> <code>messages_acknowledged</code></td>
    <td>
      Sum of these fields for all queues in the vhost.
    </td>
  </tr>
  <tr>
    <td><code>recv_oct</code> <code>send_oct</code></td>
    <td>
      Sum of these fields for all connections to the vhost.
    </td>
  </tr>
</table>

<section id="pagination">
  <h2> Pagination Parameters</h2>

  <p>
    The pagination can be applied to the endpoints that list

    <ul>
      <li>queues</li>
      <li>exchanges</li>
      <li>connections</li>
      <li>channels</li>
    </ul>
  </p>

  <p>
    Without pagination, these endpoints can produce very large JSON responses and waste a lot of bandwidth and CPU resources.
  </p>
  <p>
    Default page size is 100, maximum supported page size is 500.
  </p>
  <p>
    Below are the query parameters that can be used.

    <table>
      <thead>
        <tr>Parameter Name</tr>
        <tr>Data Type</tr>
        <tr>Description</tr>
      </thead>
      <tr>
        <td><code>page</code></td>
        <td>Positive integer</td>
        <td>
          Page number
        </td>
      </tr>
      <tr>
        <td><code>page_size</code></td>
        <td>Positive integer</td>
        <td>
          Number of elements for page (default value: 100, maximum supported value: 500)
        </td>
      </tr>
      <tr>
        <td><code>name</code></td>
        <td>String</td>
        <td>
          Filter by name, for example queue name, exchange name etc.
        </td>
      </tr>
      <tr>
        <td><code>use_regex</code></td>
        <td>Boolean</td>
        <td>
          Enables regular expression for the param name
        </td>
      </tr>
    </table>
  </p>

  <p>
    Examples:
    <table>
      <tr>
        <td><code>http://localhost:15672/api/queues?page=1&page_size=50</code></td>
        <td>
          Fetches the first queue page with 50 elements
        </td>
      </tr>
      <tr>
        <td><code>http://localhost:15672/api/queues/my-vhost?page=1&page_size=100&name=&use_regex=false&pagination=true</code></td>
        <td>
          Filter the first queues page for the virtual host "my-vhost"
        </td>
      </tr>
      <tr>
        <td><code>http://localhost:15672/api/exchanges?page=1&page_size=100&name=%5Eamq&use_regex=true&pagination=true</code></td>
        <td>
          Filter the first exchanges page, 100 elements, with named filtered using the regular expression "^amq"
        </td>
      </tr>
    </table>
  </p>
</section>
