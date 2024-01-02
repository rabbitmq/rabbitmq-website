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

This page summarises the available RabbitMQ documentation for the [latest patch release](versions.html).

## Installation

See the [Downloads and Installation](./download.html) page
for information on the most recent release and how to install it.


## Tutorials

See the [Get Started](getstarted.html) page
for our tutorials for various programming languages.

The tutorials offer a gentle introduction to messaging, one of the protocols RabbitMQ supports,
key messaging features, and some common usage scenarios.

[AMQP 0-9-1 Overview](./tutorials/amqp-concepts.html) provides a brief overview
for the original RabbitMQ protocol.


## Server and Key Plugins

[RabbitMQ server documentation](admin-guide.html) is organised in a number of guides:

### [Installation and Provisioning](download.html):

 * [Packages and repositories](./download.html)
 * [Kubernetes Operator](./kubernetes/operator/operator-overview.html)
 * [Provisioning Tools](./download.html) (Docker image, Chef cookbook, Puppet module, etc)
 * [Package Signatures](./signatures.html)
 * [Supported Erlang/OTP Versions](./which-erlang.html)
 * [Supported RabbitMQ Versions](./versions.html)
 * [Changelog](./changelog.html)
 * [Snapshot (Nightly) Builds](./snapshots.html)

#### Operating Systems and Platforms

 * [Kubernetes](./kubernetes/operator/operator-overview.html)
 * [Debian and Ubuntu](./install-debian.html)
 * [Red Hat Enterprise Linux, CentOS, Fedora](./install-rpm.html)
 * [Windows Installer](./install-windows.html), [Windows-specific Issues](./windows-quirks.html)
 * [Generic UNIX Binary Build](./install-generic-unix.html)
 * [MacOS via Standalone Binary Build](./install-standalone-mac.html)
 * [MacOS via Homebrew](./install-homebrew.html)
 * [Amazon EC2](./ec2.html)
 * [Solaris](./install-solaris.html)


### Upgrading

 * Main [Upgrading guide](./upgrade.html)
 * [Schema Definitions](./definitions.html)
 * [Blue-green deployment-based upgrade](./blue-green-upgrade.html)


### CLI tools

 * [RabbitMQ CLI Tools](./cli.html): general installation and usage topics
 * [rabbitmqctl](./rabbitmqctl.8.html): primary RabbitMQ CLI tool
 * [rabbitmq-diagnostics](./rabbitmq-diagnostics.8.html): [monitoring](./monitoring.html), [health checking](./monitoring.html#health-checks), observability tooling
 * [rabbitmq-plugins](./rabbitmq-plugins.8.html): plugin management
 * [rabbitmq-queues](./rabbitmq-queues.8.html): operations on quorum queues
 * [rabbitmq-streams](./rabbitmq-streams.8.html): operations on streams
 * [rabbitmq-upgrade](./rabbitmq-upgrade.8.html): operations related to [upgrades](./upgrade.html)
 * [rabbitmqadmin](./management-cli.html) ([HTTP API](./management.html)-based zero dependency management tool)
 * [man pages](./manpages.html)


### Configuration

 * [Configuration](configure.html)
 * [File and Directory Locations](relocate.html)
 * [Logging](logging.html)
 * [Policies and Runtime Parameters](parameters.html)
 * [Schema Definitions](definitions.html)
 * [Per Virtual Host Limits](vhosts.html)
 * [Client Connection Heartbeats](heartbeats.html)
 * [Inter-node Connection Heartbeats](nettick.html)
 * [Runtime Tuning](runtime.html)
 * [Queue and Message TTL](ttl.html)


### Authentication and authorisation:

 * [Access Control](access-control.html): main authentication and authorisation guide
 * [AMQP 0-9-1 Authentication Mechanisms](authentication.html)
 * [Virtual Hosts](vhosts.html)
 * [Credentials and Passwords](passwords.html)
 * x509 (TLS) [Certificate-based client authentication](https://github.com/rabbitmq/rabbitmq-server/tree/v3.12.x/deps/rabbitmq_auth_mechanism_ssl)
 * [OAuth 2 Support](https://rabbitmq.com/oauth2.html)
 * [OAuth 2 Examples](https://rabbitmq.com/oauth2-examples.html) for common identity providers
 * [LDAP](ldap.html)
 * [Validated User ID](./validated-user-id.html)
 * [Authentication Failure Notifications](./auth-notification.html)


### Networking and TLS

 * [Client Connections](connections.html)
 * [Networking](networking.html)
 * [Troubleshooting Network Connectivity](troubleshooting-networking.html)
 * [Using TLS for Client Connections](ssl.html)
 * [Using TLS for Inter-node Traffic](./clustering-ssl.html)
 * [Troubleshooting TLS](troubleshooting-ssl.html)


### Monitoring, Audit, Application Troubleshooting:

 * [Management UI and HTTP API](management.html)
 * [Monitoring](monitoring.html), metrics and health checks
 * [Troubleshooting guidance](troubleshooting.html)
 * [rabbitmqadmin](management-cli.html), an HTTP API command line tool
 * [Client Connections](connections.html)
 * [AMQP 0-9-1 Channels](channels.html)
 * [Internal Event Exchange](event-exchange.html)
 * [Per Virtual Host Limits](vhosts.html#limits)
 * [Per User Limits](user-limits.html)
 * [Message Tracing](firehose.html)
 * [Capturing Traffic with Wireshark](./amqp-wireshark.html)


### Clustering

 * [Clustering](clustering.html)
 * [Cluster Formation and Peer Discovery](cluster-formation.html)
 * [Intra-cluster Compression](https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/1/rmq/clustering-compression-rabbitmq.html)

### Replicated Queue Types, Streams, High Availability

 * [Quorum Queues](quorum-queues.html): a modern highly available replicated queue type
 * [Migrating Mirrored Classic Queues to Quorum Queues](./migrate-mcq-to-qq.html)
 * [Streams](streams.html): a messaging abstraction that allows for repeatable consumption
 * [RabbitMQ Stream plugin](stream.html): the plugin and binary protocol behind RabbitMQ streams

### Distributed RabbitMQ

 * [Replication and Distributed Feature Overview](distributed.html)
 * [Reliability](reliability.html) of distributed deployments, publishers and consumers
 * [Federation](federation.html)
 * [Shovel](shovel.html)


### Guidance

 * [Monitoring](monitoring.html)
 * [Production Checklist](production-checklist.html)
 * [Backup and Restore](backup.html)
 * [Troubleshooting guidance](troubleshooting.html)
 * [Reliable Message Delivery](reliability.html)


### Message Store and Resource Management

 * [Memory Usage Analysis](./memory-use.html)
 * [Memory Management](./memory.html)
 * [Resource Alarms](./alarms.html)
 * [Free Disk Space Alarms](./disk-alarms.html)
 * [Runtime Tuning](runtime.html)
 * [Flow Control](./flow-control.html)
 * [Message Store Configuration](./persistence-conf.html)
 * [Queue and Message TTL](./ttl.html)
 * [Queue Length Limits](./maxlength.html)
 * [Lazy Queues](./lazy-queues.html)


### Queue and Consumer Features

 * [Queues guide](queues.html)
 * [Consumers guide](./consumers.html)
 * [Queue and Message TTL](./ttl.html)
 * [Queue Length Limits](./maxlength.html)
 * [Lazy Queues](./lazy-queues.html)
 * [Dead Lettering](./dlx.html)
 * [Priority Queues](./priority.html)
 * [Consumer Cancellation Notifications](./consumer-cancel.html)
 * [Consumer Prefetch](./consumer-prefetch.html)
 * [Consumer Priorities](./consumer-priority.html)
 * [Streams](./streams.html)


### Publisher Features

 * [Publishers guide](./publishers.html)
 * [Exchange-to-Exchange Bindings](./e2e.html)
 * [Alternate Exchanges](./ae.html)
 * [Sender-Selected Distribution](./sender-selected.html)


### STOMP, MQTT, WebSockets

 * [Client Connections](connections.html)
 * [STOMP](./stomp.html)
 * [MQTT](./mqtt.html)
 * [STOMP over WebSockets](web-stomp.html)
 * [MQTT over WebSockets](web-mqtt.html)


## Man Pages

 * [man Pages](./manpages.html)


## Client Libraries and Features

[RabbitMQ clients documentation](clients.html) is organised in a number
of guides and API references. A separate set of [tutorials](./getstarted.html) for
many popular programming languages are also available, as is an [AMQP 0-9-1 Overview](./tutorials/amqp-concepts.html).

### Client Documentation Guides

 * [Java Client](api-guide.html)
 * [.NET Client](dotnet-api-guide.html)
 * [Ruby Client](http://rubybunny.info)
 * [JMS Client](jms-client.html)
 * [Erlang Client](erlang-client-user-guide.html)
 * [RabbitMQ extensions to AMQP 0-9-1](./extensions.html)

### Client-Driven Features

 * [Client Connections](connections.html)
 * [Consumers](./consumers.html)
 * [Publishers](./publishers.html)
 * [Channels](channels.html)
 * [Publisher Confirms and Consumer Acknowledgements](confirms.html)
 * [Queue and Message TTL](ttl.html)
 * [Queue Length Limits](maxlength.html)
 * [Lazy Queues](lazy-queues.html)
 * [Exchange-to-Exchange Bindings](./e2e.html)
 * [Sender-Selected Distribution](./sender-selected.html)
 * [Priority Queues](./priority.html)
 * [Consumer Cancellation Notifications](./consumer-cancel.html)
 * [Consumer Prefetch](./consumer-prefetch.html)
 * [Consumer Priorities](./consumer-priority.html)
 * [Dead Lettering](./dlx.html)
 * [Alternate Exchanges](./ae.html)
 * [Message Tracing](firehose.html)
 * [Capturing Traffic with Wireshark](./amqp-wireshark.html)


## References

 * [Java](https://rabbitmq.github.io/rabbitmq-java-client/api/current/)
 * [.NET](https://rabbitmq.github.io/rabbitmq-dotnet-client/index.html)
 * [AMQP 0-9-1 URI Specification](./uri-spec.html)
 * [URI Query Parameters](./uri-query-parameters.html)

See [Clients and Developer Tools](devtools.html)
for community client libraries.


## Plugins

Popular tier 1 (built-in) plugins:

 * [Management](management.html)
 * [STOMP](stomp.html)
 * [MQTT](mqtt.html)
 * [STOMP over WebSockets](web-stomp.html)
 * [MQTT over WebSockets](web-mqtt.html)
 * [Federation](federation.html)
 * [Shovel](shovel.html)
 * [Internal Event Exchange](event-exchange.html)

See [Community Plugins](./community-plugins.html),
[RabbitMQ GitHub repositories](https://github.com/rabbitmq/)
and the [Plugins Guide](plugins.html) for more information about plugins.


## Development

 * [RabbitMQ GitHub repositories](https://github.com/rabbitmq/)
 * [Contributor Code of Conduct](https://github.com/rabbitmq/rabbitmq-server/blob/main/CODE_OF_CONDUCT.md)
 * How to [build RabbitMQ](build.html) from source, or
 * from [GitHub](github.html).


## Protocols

 * AMQP 0-9-1: [Extensions](extensions.html) | [Quick Reference](amqp-0-9-1-quickref.html)
 * [STOMP](stomp.html)
 * [MQTT](mqtt.html)
 * [STOMP over WebSockets](web-stomp.html)
 * [MQTT over WebSockets](web-mqtt.html)
 * [AMQP 0-9-1 implementation details](protocol.html).
 * [AMQP 0-9-1 Errata document](amqp-0-9-1-errata.html).
