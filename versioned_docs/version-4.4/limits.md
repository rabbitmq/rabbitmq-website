---
title: Limits and Timeouts
---

# Limits and Timeouts

## Introduction

This guide provides an overview of the configurable limits and timeouts provided by RabbitMQ,
followed by the [hardcoded limits](#hardcoded) that cannot be changed.

This guide intentionally leaves out some advanced configurable limits.

:::note

In this guide, we define a configurable limit as a setting, configured via `rabbitmq.conf`, virtual host [metadata](./vhosts#limits),
a [policy](./policies), an [operator policy](./policies#operator-policies), or any other means, that controls how many connections, channels, queues, streams,
or other application-controlled resources would be allowed in a cluster or on a specific node.

Many of these limits are covered in more detail in dedicated guides.

:::


## Why Use Configurable Limits {#why}

Modern messaging and streaming protocols, such as those supported by RabbitMQ, give application
developers the freedom to define their topology resources (such as queues and streams, exchanges, bindings
and so on).

Some of these resources can be unintentionally leaked by applications. For example, an application
can leave a connection (or channel, session) open, not clean up queues or streams that are
no longer needed, and so on.

Configurable limits are a protection mechanism that allows cluster operators to prevent such
applications from using enough resources to affect other applications or cluster stability.

Such guardrails are particularly important when RabbitMQ clusters are offered as a service.


## Available Limits

### Per Virtual Host Limits {#per-virtual-host}

[Per virtual host limits](./vhosts#limits), as the name suggests, apply to a specific
virtual host:

 * The maximum number of concurrent client connections in the virtual host
 * The maximum number of queues and streams that can be declared in a virtual host

### Per User Limits {#per-user}

[Per user limits](./user-limits) apply to user accounts (usernames):

 * The maximum number of concurrent client connections that authenticate as that user
 * The maximum number of concurrent channels open across all of the user's connections

### Per Connection Limits {#per-connection}

Per connection limits apply to individual client connections.

| [`rabbitmq.conf` Setting](./configure) | Type | Description | Default |
|---------|------|-------------|---------|
| `max_channels_per_connection` | integer | Maximum number of AMQP 0-9-1 channels a client can open on a single connection. Protects against applications [leaking channels](./channels#monitoring). Channel number 0 is reserved for internal use. While the default is 2047, values between 16 and 128 are recommended for most use cases. | 2047 |
| `session_max_per_connection` | integer | Maximum number of AMQP 1.0 sessions per connection | 64 |
| `link_max_per_session` | integer | Maximum number of AMQP 1.0 links per session | 256 |
| `handshake_timeout` | integer (milliseconds) | Maximum time allowed for AMQP 0-9-1 and AMQP 1.0 handshake to complete | 10000 (10 seconds) |
| `ssl_handshake_timeout` | integer (milliseconds) | Maximum time allowed for TLS handshake to complete | 5000 (5 seconds) |
| `heartbeat` | integer (seconds) | [Heartbeat timeout](./heartbeats) value suggested by the server during connection negotiation | 60 |
| `frame_max` | integer (bytes) | Maximum AMQP 1.0, AMQP 0-9-1 and [RabbitMQ Stream Protocol](./stream) frame size. **Should not be changed**; rely on server and client library defaults. | 131072 (128 KiB) |
| `initial_frame_max` | integer (bytes) | Maximum frame size before connection tuning. **Should not be changed**; rely on server and client library defaults. | 8192 |

Some protocols supported by RabbitMQ have their own specific limits.

#### MQTT {#mqtt}

[MQTT](./mqtt) connections have a session expiry interval limit:

| [`rabbitmq.conf` Setting](./configure) | Type | Description | Default |
|---------|------|-------------|---------|
| `mqtt.max_session_expiry_interval_seconds` | integer (seconds) | Maximum [session expiry interval](./mqtt#queue-properties-and-arguments) that MQTT clients can request | 86400 (1 day) |


### Per Channel Limits {#per-channel}

`consumer_max_per_channel` controls the maximum number of consumers that can be registered on a single channel.
This setting protects against applications leaking consumers.

The default is unlimited. To set a limit, configure it in `rabbitmq.conf`:

```ini
consumer_max_per_channel = 10
```

### Per Cluster Limits {#per-cluster}

The following settings are defined in `rabbitmq.conf` but effectively
apply to the entire cluster, because the entities they limit are replicated across all nodes.

| [`rabbitmq.conf` Setting](./configure) | Type | Description | Default |
|---------|------|-------------|---------|
| `vhost_max` | integer | Maximum number of virtual hosts that can be created in the cluster | unlimited |
| `cluster_exchange_limit` | integer | Maximum number of exchanges that can be declared in the cluster | unlimited |
| `cluster_queue_limit` | integer | Maximum number of queues that can be declared in the cluster | unlimited |

:::warning

As these settings are cluster-wide but configured individually for each node using its `rabbitmq.conf` configuration file,
they must be set to the same value across all cluster nodes.

:::

### Per Node Limits {#per-node}

Per node limits apply to individual cluster nodes. They affect all virtual hosts and users.

Due to their coarse-grained nature, these limits are typically used as guardrails in
environments where RabbitMQ clusters are offered as a service and cluster operators have no
understanding or control over what the deployed applications do.

See also: [open file handles limit](./networking#open-file-handle-limit).

| [`rabbitmq.conf` Setting](./configure) | Type | Description | Default |
|---------|------|-------------|---------|
| `consumer_timeout` | positive integer (milliseconds) | Defines [how long RabbitMQ will wait for delivery acknowledgements](./consumers#acknowledgement-timeout) from consumers | 1800000 (30 minutes) |
| `max_connections` | integer | Maximum number of concurrent AMQP 1.0 and AMQP 0-9-1 connections a node will accept | unlimited |
| `mqtt.max_connections` | integer | Maximum number of concurrent MQTT connections a node will accept | unlimited |
| `stomp.max_connections` | integer | Maximum number of concurrent STOMP connections a node will accept | unlimited |
| `channel_max_per_node` | integer | Maximum number of channels across all connections on a node | unlimited |
| `ranch_connection_max` | integer | Maximum number of concurrent TCP connections a node will accept; includes [HTTP API](./http-api-reference) connections | unlimited |
| `stream.max_connections` | integer | Maximum number of concurrent [RabbitMQ Stream Protocol](./stream) client connections a node will accept | unlimited |
| `max_message_size` | integer (bytes) | Maximum message size that messaging and streaming clients can publish. Messages larger than this will be rejected. Maximum allowed value is 512 MiB. | 16777216 (16 MiB) |
| `management.http.max_body_size` | integer (bytes) | Maximum HTTP API request body size | 20971520 (20 MiB) |

`connection_max` and `channel_max` remain supported aliases for `max_connections`
and `max_channels_per_connection`, respectively. Prefer the newer names.

### Per Queue Limits {#per-queue}

Individual queues can have limits configured via [policies](./policies):

 * [Queue length limit](./maxlength): limits ready messages or their total size. Quorum queues also count delayed messages and messages pending at-least-once dead lettering.
   When the limit is reached, messages are either dropped from the head or new publishes are rejected.
 * [Message TTL](./ttl#per-queue-message-ttl): messages in a queue expire after a specified time period.
 * [Queue TTL](./ttl#queue-ttl): queues are automatically deleted after a period of inactivity.
 * **Delivery limit** ([quorum queues](./quorum-queues#poison-message-handling)): maximum number of delivery attempts before a message is dropped or dead-lettered.
   Default is 20 in RabbitMQ 4.0+, was unlimited in 3.x. Configured via the `delivery-limit` policy key or queue argument.
 * **Priority levels** ([priority queues](./priority)): `x-max-priority` queue argument defines the maximum priority level (1-255).
   Values between 1 and 5 are recommended for optimal performance.

### Per Stream Limits {#per-stream}

Streams have [retention settings](./streams#retention) that control data expiration:

 * `max-age`: maximum age of messages in the stream (e.g., `7D` for 7 days)
 * `max-length-bytes`: maximum total size of the stream in bytes

When retention limits are reached, the oldest segments are discarded. These can be configured via
[policies](./policies) or as [optional stream arguments](./streams#declaring) at stream declaration time.

Consult the [streams guide](./streams) to learn more.


## Hardcoded Limits {#hardcoded}

The limits below cannot be changed. Most of them bound the resources that client-provided input can use.
Unless noted otherwise, an operation that exceeds a limit fails with an error.

Most limits that come from a protocol specification are not listed.

### Messages, Queues, Streams and Bindings {#hardcoded-core}

| Limit | Value |
|-------|-------|
| Maximum value of `max_message_size` | 512 MiB |
| `#` wildcards in a [topic exchange](./exchanges#topic) binding key | 2 |
| Entries in each of the AMQP 0-9-1 [`CC` and `BCC`](./sender-selected) headers and in the AMQP 1.0 `x-cc` message annotation | 64 |
| `x-message-ttl` and `x-expires` queue arguments, and the AMQP 0-9-1 `expiration` message property | 10 years (315,360,000,000 ms) |
| `x-max-priority` of [classic queues](./priority#classic-queues) | 255 |
| [Quorum queue](./priority#quorum-queues) message priorities. Higher values are treated as 31 | 0 to 31 |
| `x-name-prefix` of server-named queues | 64 bytes |
| [Direct reply-to](./direct-reply-to) destinations per published message. Further destinations are ignored | 2 |
| [Stream](./streams) segment size (`x-stream-max-segment-size-bytes`) | 4096 bytes to 3,000,000,000 bytes |
| [Stream Bloom filter](./stream-filtering) size (`x-stream-filter-size-bytes`) | 16 to 255 bytes |

### Users, Permissions and Policies {#hardcoded-access-control}

| Limit | Value |
|-------|-------|
| Tags per user | 32 |
| Length of a regular expression in a policy pattern, a [permission](./access-control) or a topic permission | 4096 bytes |
| Match steps per regular expression evaluation. A match that exceeds the limit counts as no match: a permission check fails and a policy does not apply | 50,000 |

The match step limit also applies to [LDAP](./ldap) `match` queries, federation upstream patterns, the JMS topic exchange and the HTTP API `name` filter.

### AMQP 0-9-1 {#hardcoded-amqp091}

| Limit | Value |
|-------|-------|
| Queue names, exchange names, routing keys and consumer tags (AMQP 0-9-1 short strings) | 255 bytes |
| Minimum `frame_max` that a client can negotiate | 8192 bytes |
| Replies that a channel has queued for a client that does not read from its socket. The connection is closed when the limit is reached | 4000 replies, or the greater of 32 MiB and twice `max_message_size` |

### AMQP 1.0 {#hardcoded-amqp10}

| Limit | Value |
|-------|-------|
| Sections per message | 10,000 |
| Encoded size of each section before the message body (header, delivery annotations, message annotations, properties, application properties) | 128 KiB |
| Encoded size of an array descriptor | 64 bytes |
| Frame size before the `open` frame has been processed, including SASL frames | 8192 bytes |
| Minimum `idle-time-out` that a client can request | 1 second |
| Fields in a [property filter expression](./stream-filtering#property-filter-expressions) | 16 |
| Length of an [SQL filter expression](./stream-filtering#sql-filter-expressions) | 4096 characters |
| Tokens in an SQL filter expression | 200 |
| Length of a value matched by a `LIKE` pattern that contains `_` or more than one `%`. Longer values do not match | 4096 bytes |
| [Deferral tokens](./quorum-queues#deferred-messages) per `flow` frame | 256 |
| Size of a deferral token | 256 bytes |
| Message annotations that a [`modified` outcome](./amqp#modified-outcome) can add to a quorum queue message. Further annotations are ignored | 32 |
| Requests in flight per [AMQP 1.0 management](/client-libraries/amqp-client-libraries#topology-management) link pair | 8 |

A filter expression that exceeds a limit is not applied, and it is left out of the `attach` frame that RabbitMQ sends in response.

### MQTT {#hardcoded-mqtt}

| Limit | Value |
|-------|-------|
| Message Expiry Interval. Larger values are lowered to the limit | 10 years (315,360,000 seconds) |
| Maximum [QoS](./mqtt#qos-2) | 1 |

### STOMP {#hardcoded-stomp}

| Limit | Value |
|-------|-------|
| Length of a frame command | 32 bytes |
| Open transactions per connection | 16 |
| `SEND`, `ACK` and `NACK` frames per transaction | 1024 |
| Message body bytes across all open transactions of a connection. The connection is closed when the limit is exceeded | 128 MiB |
| `priority` header. Values outside the range are clamped | 0 to 255 |

### RabbitMQ Stream Protocol {#hardcoded-stream-protocol}

| Limit | Value |
|-------|-------|
| Publishers per connection | 256 |
| Subscriptions per connection | 256 |
| Length of a publisher reference, a consumer name and an offset tracking reference | 255 bytes |

### HTTP API {#hardcoded-http-api}

| Limit | Value |
|-------|-------|
| Page size (`page_size`) | 500 |
| Samples per series (the `*_age` parameter divided by the `*_incr` parameter) | 500 |
| Length of a regular expression in the `name` filter (`use_regex=true`) | 1024 bytes |
| Request body size when creating a binding | 5000 bytes |
| Memory used to decode a JSON request body, except for definition imports | about 64 MB |

### Prometheus {#hardcoded-prometheus}

| Limit | Value |
|-------|-------|
| Length of the `queue` query parameter | 2000 bytes |
| Match steps of the `queue` regular expression per queue. Queues that exceed the limit are left out of the response | 2000 |

### OAuth 2 {#hardcoded-oauth2}

| Limit | Value |
|-------|-------|
| Scopes per token | 2048 |
| Length of a regular expression scope pattern | 2048 bytes |
| Match steps per regular expression scope pattern. A match that exceeds the limit counts as no match | 10,000 |

### Shovels and Federation {#hardcoded-shovels-federation}

| Limit | Value |
|-------|-------|
| URI length | 64 KiB |
| [`connection_timeout`](./uri-query-parameters) URI query parameter | 180 seconds |
| Size of TLS certificate and key files referenced in URIs | 4 MiB |
| Federation upstream [`max-hops`](./federation-reference) | 32767 |
| Minimum value of the [`src-delete-after-duration`](./shovel-dynamic) shovel setting | 15 seconds |

### Exchange Type Plugins {#hardcoded-exchange-plugins}

| Limit | Value |
|-------|-------|
| Nesting depth of a [JMS topic exchange](./exchanges#jms-topic-exchange) selector | 16 |
| Digits in a numeric literal of a JMS topic exchange selector | 100 |
| Length of a JMS topic exchange `LIKE` pattern after conversion to a regular expression | 4096 bytes |
| Consistent hashing exchange binding weight | 10,000 |
| `shards-per-node` policy key of the sharding plugin | 4096 |
