---
title: Configurable Limits
---

# Configurable Limits and Timeouts

## Introduction

This guide provides an overview of the configurable limits and timeouts provided by RabbitMQ.

This guide intentionally leaves out some advanced limits as well as limits that cannot be configured via `rabbitmq.conf`,
virtual host [metadata](./vhosts#limits), [policies](./policies), or other configuration means,
but are instead controlled programmatically (for example, by RabbitMQ core or plugins).

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
| `channel_max` | integer | Maximum number of AMQP 0-9-1 channels a client can open on a single connection. Protects against applications [leaking channels](./channels#monitoring). Channel number 0 is reserved for internal use. While the default is 2047, values between 16 and 128 are recommended for most use cases. | 2047 |
| `session_max_per_connection` | integer | Maximum number of AMQP 1.0 sessions per connection | 1 |
| `link_max_per_session` | integer | Maximum number of AMQP 1.0 links per session | 10 |
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
| `connection_max` | integer | Maximum number of concurrent client connections a node will accept | unlimited |
| `channel_max_per_node` | integer | Maximum number of channels across all connections on a node | unlimited |
| `ranch_connection_max` | integer | Maximum number of concurrent TCP connections a node will accept; includes [HTTP API](./http-api-reference) connections | unlimited |
| `max_message_size` | integer (bytes) | Maximum message size that messaging and streaming clients can publish. Messages larger than this will be rejected. Maximum allowed value is 512 MiB. | 134217728 (128 MiB) |
| `management.http.max_body_size` | integer (bytes) | Maximum HTTP API request body size | 20971520 (20 MiB) |

### Per Queue Limits {#per-queue}

Individual queues can have limits configured via [policies](./policies):

 * [Queue length limit](./maxlength): limits the maximum number of ready messages or total message bytes in a queue.
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
