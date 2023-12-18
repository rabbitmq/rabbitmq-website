---
title: "How to Monitor Authentication Attempts"
tags: ["New Features", "HowTo", ]
authors: [dcorbacho]
---

We have been constantly improving the monitoring capabilities that are built into RabbitMQ since shipping native Prometheus support in 3.8.0. Monitoring the broker and its clients is critically important for detecting issues before they affect the rest of the environment and, eventually, the end users.

RabbitMQ 3.8.10 exposes client authentication attempts metrics via both the Prometheus endpoint and the HTTP API.

<!-- truncate -->

The default behaviour is to return the total, failed and successful auth attempts for the following supported protocols: AMQP 0-9-1, AMQP 1.0 and MQTT. The broker can be configured to also track the source of each individual authentication attempt, including the remote IP address, username and protocol. Since there is no address information for AMQP 1.0 authorization, an empty source IP is reported in non-aggregated mode.



## Configuration

RabbitMQ always tracks the total number of authentication attempts on each cluster node, aggregating them per protocol.

Auth attempts per individual address/user/protocol combination can be added via [advanced config](/docs/configure#advanced-config-file):

```erlang
[
  {rabbit, [{track_auth_attempt_source, true}]}
]
```

**Care must be taken when this option is enabled.**

Tracking the source IP, username and protocol via metrics may result in high cardinality, which means increased memory usage on the RabbitMQ node. As there are no obvious criteria for expiring these metrics from RabbitMQ's in-memory ETS-based metrics storage, it is not recommended to regularly track the authentication sources on a production cluster. The only exception to this rule may be when the number of remote IP addresses and users are guaranteed to be bounded.

The CLI commands can be used to enable/disable tracking of the remote source. This makes ad-hoc troubleshooting easy, with no need to restart a node.

The CLI commands can be found under both `rabbitmqctl` and `rabbitmq-diagnostics`:

| Command | Usage |
| ------- | ----- |
| `disable_auth_attempt_source_tracking` | Disables the tracking of peer IP address and username of authentication attempts |
| `enable_auth_attempt_source_tracking` | Enables the tracking of peer IP address and username of authentication attempts |
| `reset_node_auth_attempt_metrics` | Resets auth attempt metrics on the target node |
| `list_node_auth_attempt_stats` | Lists authentication attempts on the target node |

We would like to point out the `reset_node_auth_attempt_metrics` command. This is useful for resetting all authentication attempts metrics stored in RabbitMQ's node memory after source tracking has been disabled.



## HTTP API

There are two HTTP API endpoints on the [management plugin](/docs/management#http-api) to query the authentication attempts.

The first one is always enabled and returns the total number of authentication attempts per protocol:

```plaintext
GET /api/auth/attempts/{node}
```

```json
[{
   "protocol":"http",
   "auth_attempts":553,
   "auth_attempts_failed":0,
   "auth_attempts_succeeded":553
 },
 {
   "protocol":"amqp091",
   "auth_attempts":12,
   "auth_attempts_failed":10,
   "auth_attempts_succeeded":2
 }]
```
The second one requires to enable the tracking of the source of the authentication attempts. It provides a breakdown of the attempts per source:

```plaintext
GET /api/auth/attempts/{node}/source
```

```json
[{
   "remote_address":"127.0.0.1",
   "username":"guest",
   "protocol":"http",
   "auth_attempts":533,
   "auth_attempts_failed":0,
   "auth_attempts_succeeded":533
 },
 {
   "remote_address":"127.0.0.1",
   "username":"roger",
   "protocol":"amqp091",
   "auth_attempts":10,
   "auth_attempts_failed":10,
   "auth_attempts_succeeded":0
 },
 {
   "remote_address":"127.0.0.1",
   "username":"bugs",
   "protocol":"amqp091",
   "auth_attempts":2,
   "auth_attempts_failed":0,
   "auth_attempts_succeeded":2
 }]
```

Auth attempt metrics can be reset using the A `DELETE` HTTP request, e.g. `DELETE /api/auth/attempts/{node}/source`



## Prometheus HTTP

The [Prometheus HTTP endpoint](/docs/prometheus), by default [http://localhost:15692/metrics](http://localhost:15692/metrics), captures the same authentication metrics:

```plaintext
# TYPE rabbitmq_auth_attempts_total counter
# HELP rabbitmq_auth_attempts_total Total number of authorization attempts
rabbitmq_auth_attempts_total{protocol="amqp091"} 2
# TYPE rabbitmq_auth_attempts_succeeded_total counter
# HELP rabbitmq_auth_attempts_succeeded_total Total number of successful authentication attempts
rabbitmq_auth_attempts_succeeded_total{protocol="amqp091"} 0
# TYPE rabbitmq_auth_attempts_failed_total counter
# HELP rabbitmq_auth_attempts_failed_total Total number of failed authentication attempts
rabbitmq_auth_attempts_failed_total{protocol="amqp091"} 2
```

To obtain the source details, **rabbitmq_prometheus** plugin must also be configured to return [per-object metrics](/docs/prometheus#metric-aggregation):

```plaintext
# TYPE rabbitmq_auth_attempts_total counter
# HELP rabbitmq_auth_attempts_total Total number of authorization attempts
rabbitmq_auth_attempts_total{protocol="amqp091"} 5
# TYPE rabbitmq_auth_attempts_succeeded_total counter
# HELP rabbitmq_auth_attempts_succeeded_total Total number of successful authentication attempts
rabbitmq_auth_attempts_succeeded_total{protocol="amqp091"} 0
# TYPE rabbitmq_auth_attempts_failed_total counter
# HELP rabbitmq_auth_attempts_failed_total Total number of failed authentication attempts
rabbitmq_auth_attempts_failed_total{protocol="amqp091"} 5
# TYPE rabbitmq_auth_attempts_detailed_total counter
# HELP rabbitmq_auth_attempts_detailed_total Total number of authorization attempts with source info
rabbitmq_auth_attempts_detailed_total{remote_address="::ffff:127.0.0.1",username="guest",protocol="amqp091"} 1
# TYPE rabbitmq_auth_attempts_detailed_succeeded_total counter
# HELP rabbitmq_auth_attempts_detailed_succeeded_total Total number of successful authorization attempts with source info
rabbitmq_auth_attempts_detailed_succeeded_total{remote_address="::ffff:127.0.0.1",username="guest",protocol="amqp091"} 0
# TYPE rabbitmq_auth_attempts_detailed_failed_total counter
# HELP rabbitmq_auth_attempts_detailed_failed_total Total number of failed authorization attempts with source info
rabbitmq_auth_attempts_detailed_failed_total{remote_address="::ffff:127.0.0.1",username="guest",protocol="amqp091"} 1
```

<!-- TODO @gerhard: Add Grafana dashboard -->
