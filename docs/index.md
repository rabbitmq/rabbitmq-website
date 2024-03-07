---
title: RabbitMQ Documentation
---
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

# Documentation: Table of Contents

This page summarises the available RabbitMQ documentation for the [latest patch release](/release-information/versions).

## Installation

See the [Downloads and Installation](./download.md) page
for information on the most recent release and how to install it.


## Tutorials

See the [Get Started](/tutorials) page
for our tutorials for various programming languages.

The tutorials offer a gentle introduction to messaging, one of the protocols RabbitMQ supports,
key messaging features, and some common usage scenarios.

[AMQP 0-9-1 Overview](/tutorials/amqp-concepts) provides a brief overview
for the original RabbitMQ protocol.


## Server and Key Plugins

RabbitMQ server documentation is organised in a number of guides:

### Installation and Provisioning

 * [Packages and repositories](./download.md)
 * [Kubernetes Operator](/kubernetes/operator/operator-overview)
 * [Provisioning Tools](./download.md) (Docker image, Chef cookbook, Puppet module, etc)
 * [Package Signatures](./signatures.md)
 * [Supported Erlang/OTP Versions](./which-erlang.md)
 * [Supported RabbitMQ Versions](/release-information/versions)
 * [Changelog](/release-information/changelog)
 * [Snapshot (Nightly) Builds](./snapshots.md)

#### Operating Systems and Platforms

 * [Kubernetes](/kubernetes/operator/operator-overview)
 * [Debian and Ubuntu](./install-debian.md)
 * [Red Hat Enterprise Linux, CentOS, Fedora](./install-rpm.md)
 * [Windows Installer](./install-windows.md), [Windows Configuration](./windows-configuration.md)
 * [Generic UNIX Binary Build](./install-generic-unix.md)
 * [MacOS via Homebrew](./install-homebrew.md)
 * [Amazon EC2](./ec2.md)
 * [Solaris](./install-solaris.md)


### Upgrading

 * Main [Upgrading guide](./upgrade.md)
 * [Schema Definitions](./definitions.md)
 * [Blue-green deployment-based upgrade](./blue-green-upgrade.md)


### CLI tools

 * [RabbitMQ CLI Tools](./cli.md): general installation and usage topics
 * [rabbitmqctl](./man/rabbitmqctl.8.md): primary RabbitMQ CLI tool
 * [rabbitmq-diagnostics](./man/rabbitmq-diagnostics.8.md): [monitoring](./monitoring.md), [health checking](./monitoring.md#health-checks), observability tooling
 * [rabbitmq-plugins](./man/rabbitmq-plugins.8.md): plugin management
 * [rabbitmq-queues](./man/rabbitmq-queues.8.md): operations on quorum queues
 * [rabbitmq-streams](./man/rabbitmq-streams.8.md): operations on streams
 * [rabbitmq-upgrade](./man/rabbitmq-upgrade.8.md): operations related to [upgrades](./upgrade.md)
 * [rabbitmqadmin](./management-cli.md) ([HTTP API](./management.md)-based zero dependency management tool)
 * [man pages](./manpages.md)


### Configuration

 * [Configuration](./configure.md)
 * [File and Directory Locations](./relocate.md)
 * [Logging](./logging.md)
 * [Policies and Runtime Parameters](./parameters.md)
 * [Schema Definitions](./definitions.md)
 * [Per Virtual Host Limits](./vhosts.md)
 * [Client Connection Heartbeats](./heartbeats.md)
 * [Inter-node Connection Heartbeats](./nettick.md)
 * [Runtime Tuning](./runtime.md)
 * [Queue and Message TTL](./ttl.md)


### Authentication and authorisation:

 * [Access Control](./access-control.md): main authentication and authorisation guide
 * [AMQP 0-9-1 Authentication Mechanisms](./authentication.md)
 * [Virtual Hosts](./vhosts.md)
 * [Credentials and Passwords](./passwords.md)
 * x509 (TLS) [Certificate-based client authentication](https://github.com/rabbitmq/rabbitmq-server/tree/v3.13.x/deps/rabbitmq_auth_mechanism_ssl)
 * [OAuth 2 Support](./oauth2.md)
 * [OAuth 2 Examples](./oauth2-examples.md) for common identity providers
 * [LDAP](./ldap.md)
 * [Validated User ID](./validated-user-id.md)
 * [Authentication Failure Notifications](./auth-notification.md)


### Networking and TLS

 * [Client Connections](./connections.md)
 * [Networking](./networking.md)
 * [Inter-protocol Conversions](./conversions.md)
 * [Troubleshooting Network Connectivity](./troubleshooting-networking.md)
 * [Using TLS for Client Connections](./ssl.md)
 * [Using TLS for Inter-node Traffic](./clustering-ssl.md)
 * [Troubleshooting TLS](./troubleshooting-ssl.md)


### Monitoring, Audit, Application Troubleshooting:

 * [Management UI and HTTP API](./management.md)
 * [Monitoring](./monitoring.md), metrics and health checks
 * [Troubleshooting guidance](./troubleshooting.md)
 * [rabbitmqadmin](./management-cli.md), an HTTP API command line tool
 * [Client Connections](./connections.md)
 * [AMQP 0-9-1 Channels](./channels.md)
 * [Inter-protocol Conversions](./conversions.md)
 * [Internal Event Exchange](./event-exchange.md)
 * [Per Virtual Host Limits](./vhosts.md#limits)
 * [Per User Limits](./user-limits.md)
 * [Message Tracing](./firehose.md)
 * [Capturing Traffic with Wireshark](/amqp-wireshark)


### Clustering

 * [Clustering](./clustering.md)
 * [Cluster Formation and Peer Discovery](./cluster-formation.md)
 * [Intra-cluster Compression](https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/1/rmq/clustering-compression-rabbitmq.html)

### Replicated Queue Types, Streams, High Availability

 * [Quorum Queues](./quorum-queues.md): a modern highly available replicated queue type
 * [Migrating Mirrored Classic Queues to Quorum Queues](./migrate-mcq-to-qq.md)
 * [Streams](./streams.md): a messaging abstraction that allows for repeatable consumption
 * [RabbitMQ Stream plugin](./stream.md): the plugin and binary protocol behind RabbitMQ streams

### Distributed RabbitMQ

 * [Replication and Distributed Feature Overview](./distributed.md)
 * [Reliability](./reliability.md) of distributed deployments, publishers and consumers
 * [Federation](./federation.md)
 * [Shovel](./shovel.md)


### Guidance

 * [Monitoring](./monitoring.md)
 * [Production Checklist](./production-checklist.md)
 * [Backup and Restore](./backup.md)
 * [Troubleshooting guidance](./troubleshooting.md)
 * [Reliable Message Delivery](./reliability.md)


### Message Store and Resource Management

 * [Memory Usage Analysis](./memory-use.md)
 * [Memory Management](./memory.md)
 * [Resource Alarms](./alarms.md)
 * [Free Disk Space Alarms](./disk-alarms.md)
 * [Runtime Tuning](./runtime.md)
 * [Flow Control](./flow-control.md)
 * [Message Store Configuration](./persistence-conf.md)
 * [Queue and Message TTL](./ttl.md)
 * [Queue Length Limits](./maxlength.md)
 * [Lazy Queues](./lazy-queues.md)


### Queue and Consumer Features

 * [Queues guide](./queues.md)
 * [Consumers guide](./consumers.md)
 * [Queue and Message TTL](./ttl.md)
 * [Queue Length Limits](./maxlength.md)
 * [Lazy Queues](./lazy-queues.md)
 * [Dead Lettering](./dlx.md)
 * [Priority Queues](./priority.md)
 * [Consumer Cancellation Notifications](./consumer-cancel.md)
 * [Consumer Prefetch](./consumer-prefetch.md)
 * [Consumer Priorities](./consumer-priority.md)
 * [Streams](./streams.md)


### Publisher Features

 * [Publishers guide](./publishers.md)
 * [Exchange-to-Exchange Bindings](./e2e.md)
 * [Alternate Exchanges](./ae.md)
 * [Sender-Selected Distribution](./sender-selected.md)


### STOMP, MQTT, WebSockets

 * [Client Connections](./connections.md)
 * [Inter-protocol Conversions](./conversions.md)
 * [STOMP](./stomp.md)
 * [MQTT](./mqtt.md)
 * [STOMP over WebSockets](./web-stomp.md)
 * [MQTT over WebSockets](./web-mqtt.md)


## Man Pages

 * [man Pages](./manpages.md)


## Client Libraries and Features

[RabbitMQ clients documentation](/client-libraries) is organised in a number
of guides and API references. A separate set of [tutorials](/tutorials) for
many popular programming languages are also available, as is an [AMQP 0-9-1 Overview](/tutorials/amqp-concepts).

### Client Documentation Guides

 * [Java Client](/client-libraries/java-api-guide)
 * [.NET Client](/client-libraries/dotnet-api-guide)
 * [Ruby Client](http://rubybunny.info)
 * [JMS Client](/client-libraries/jms-client)
 * [Erlang Client](/client-libraries/erlang-client-user-guide)
 * [RabbitMQ extensions to AMQP 0-9-1](./extensions.md)

### Client-Driven Features

 * [Client Connections](./connections.md)
 * [Consumers](./consumers.md)
 * [Publishers](./publishers.md)
 * [Channels](./channels.md)
 * [Publisher Confirms and Consumer Acknowledgements](./confirms.md)
 * [Queue and Message TTL](./ttl.md)
 * [Queue Length Limits](./maxlength.md)
 * [Lazy Queues](./lazy-queues.md)
 * [Exchange-to-Exchange Bindings](./e2e.md)
 * [Sender-Selected Distribution](./sender-selected.md)
 * [Priority Queues](./priority.md)
 * [Consumer Cancellation Notifications](./consumer-cancel.md)
 * [Consumer Prefetch](./consumer-prefetch.md)
 * [Consumer Priorities](./consumer-priority.md)
 * [Dead Lettering](./dlx.md)
 * [Alternate Exchanges](./ae.md)
 * [Message Tracing](./firehose.md)
 * [Capturing Traffic with Wireshark](/amqp-wireshark)


## References

 * [Java](https://rabbitmq.github.io/rabbitmq-java-client/api/current/)
 * [.NET](https://rabbitmq.github.io/rabbitmq-dotnet-client/index.html)
 * [AMQP 0-9-1 URI Specification](./uri-spec.md)
 * [URI Query Parameters](./uri-query-parameters.md)

See [Clients and Developer Tools](/client-libraries/devtools)
for community client libraries.


## Plugins

Popular tier 1 (built-in) plugins:

 * [Management](./management.md)
 * [STOMP](./stomp.md)
 * [MQTT](./mqtt.md)
 * [STOMP over WebSockets](./web-stomp.md)
 * [MQTT over WebSockets](./web-mqtt.md)
 * [Federation](./federation.md)
 * [Shovel](./shovel.md)
 * [Internal Event Exchange](./event-exchange.md)

See [Community Plugins](/community-plugins),
[RabbitMQ GitHub repositories](https://github.com/rabbitmq/)
and the [Plugins Guide](./plugins.md) for more information about plugins.


## Development

 * [RabbitMQ GitHub repositories](https://github.com/rabbitmq/)
 * [Contributor Code of Conduct](https://github.com/rabbitmq/rabbitmq-server/blob/main/CODE_OF_CONDUCT.md)
 * How to [build RabbitMQ](./build-server.md) from source, or
 * from [GitHub](/github).


## Protocols

 * AMQP 0-9-1: [Extensions](./extensions.md) | [Quick Reference](/amqp-0-9-1-quickref)
 * [STOMP](./stomp.md)
 * [MQTT](./mqtt.md)
 * [STOMP over WebSockets](./web-stomp.md)
 * [MQTT over WebSockets](./web-mqtt.md)
 * [AMQP 0-9-1 implementation details](/amqp-0-9-1-protocol).
 * [AMQP 0-9-1 Errata document](/amqp-0-9-1-errata).
