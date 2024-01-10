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

This page summarises the available RabbitMQ documentation for the [latest patch release](./versions).

## Installation

See the [Downloads and Installation](./download) page
for information on the most recent release and how to install it.


## Tutorials

See the [Get Started](/tutorials) page
for our tutorials for various programming languages.

The tutorials offer a gentle introduction to messaging, one of the protocols RabbitMQ supports,
key messaging features, and some common usage scenarios.

[AMQP 0-9-1 Overview](/tutorials/amqp-concepts) provides a brief overview
for the original RabbitMQ protocol.


## Server and Key Plugins

[RabbitMQ server documentation](./admin-guide) is organised in a number of guides:

### Installation and Provisioning

 * [Packages and repositories](./download)
 * [Kubernetes Operator](./kubernetes/operator/operator-overview)
 * [Provisioning Tools](./download) (Docker image, Chef cookbook, Puppet module, etc)
 * [Package Signatures](./signatures)
 * [Supported Erlang/OTP Versions](./which-erlang)
 * [Supported RabbitMQ Versions](./versions)
 * [Changelog](./changelog)
 * [Snapshot (Nightly) Builds](./snapshots)

#### Operating Systems and Platforms

 * [Kubernetes](./kubernetes/operator/operator-overview)
 * [Debian and Ubuntu](./install-debian)
 * [Red Hat Enterprise Linux, CentOS, Fedora](./install-rpm)
 * [Windows Installer](./install-windows), [Windows-specific Issues](./windows-quirks)
 * [Generic UNIX Binary Build](./install-generic-unix)
 * [MacOS via Standalone Binary Build](./install-standalone-mac)
 * [MacOS via Homebrew](./install-homebrew)
 * [Amazon EC2](./ec2)
 * [Solaris](./install-solaris)


### Upgrading

 * Main [Upgrading guide](./upgrade)
 * [Schema Definitions](./definitions)
 * [Blue-green deployment-based upgrade](./blue-green-upgrade)


### CLI tools

 * [RabbitMQ CLI Tools](./cli): general installation and usage topics
 * [rabbitmqctl](./man/rabbitmqctl.8): primary RabbitMQ CLI tool
 * [rabbitmq-diagnostics](./man/rabbitmq-diagnostics.8): [monitoring](./monitoring), [health checking](./monitoring#health-checks), observability tooling
 * [rabbitmq-plugins](./man/rabbitmq-plugins.8): plugin management
 * [rabbitmq-queues](./man/rabbitmq-queues.8): operations on quorum queues
 * [rabbitmq-streams](./man/rabbitmq-streams.8): operations on streams
 * [rabbitmq-upgrade](./man/rabbitmq-upgrade.8): operations related to [upgrades](./upgrade)
 * [rabbitmqadmin](./management-cli) ([HTTP API](./management)-based zero dependency management tool)
 * [man pages](./manpages)


### Configuration

 * [Configuration](./configure)
 * [File and Directory Locations](./relocate)
 * [Logging](./logging)
 * [Policies and Runtime Parameters](./parameters)
 * [Schema Definitions](./definitions)
 * [Per Virtual Host Limits](./vhosts)
 * [Client Connection Heartbeats](./heartbeats)
 * [Inter-node Connection Heartbeats](./nettick)
 * [Runtime Tuning](./runtime)
 * [Queue and Message TTL](./ttl)


### Authentication and authorisation:

 * [Access Control](./access-control): main authentication and authorisation guide
 * [AMQP 0-9-1 Authentication Mechanisms](./authentication)
 * [Virtual Hosts](./vhosts)
 * [Credentials and Passwords](./passwords)
 * x509 (TLS) [Certificate-based client authentication](https://github.com/rabbitmq/rabbitmq-server/tree/v3.12.x/deps/rabbitmq_auth_mechanism_ssl)
 * [OAuth 2 Support](./oauth2)
 * [OAuth 2 Examples](./oauth2-examples) for common identity providers
 * [LDAP](./ldap)
 * [Validated User ID](./validated-user-id)
 * [Authentication Failure Notifications](./auth-notification)


### Networking and TLS

 * [Client Connections](./connections)
 * [Networking](./networking)
 * [Inter-protocol Conversions](./conversions)
 * [Troubleshooting Network Connectivity](./troubleshooting-networking)
 * [Using TLS for Client Connections](./ssl)
 * [Using TLS for Inter-node Traffic](./clustering-ssl)
 * [Troubleshooting TLS](./troubleshooting-ssl)


### Monitoring, Audit, Application Troubleshooting:

 * [Management UI and HTTP API](./management)
 * [Monitoring](./monitoring), metrics and health checks
 * [Troubleshooting guidance](./troubleshooting)
 * [rabbitmqadmin](./management-cli), an HTTP API command line tool
 * [Client Connections](./connections)
 * [AMQP 0-9-1 Channels](./channels)
 * [Inter-protocol Conversions](./conversions)
 * [Internal Event Exchange](./event-exchange)
 * [Per Virtual Host Limits](./vhosts#limits)
 * [Per User Limits](./user-limits)
 * [Message Tracing](./firehose)
 * [Capturing Traffic with Wireshark](./amqp-wireshark)


### Clustering

 * [Clustering](./clustering)
 * [Cluster Formation and Peer Discovery](./cluster-formation)
 * [Intra-cluster Compression](https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/1/rmq/clustering-compression-rabbitmq.html)

### Replicated Queue Types, Streams, High Availability

 * [Quorum Queues](./quorum-queues): a modern highly available replicated queue type
 * [Migrating Mirrored Classic Queues to Quorum Queues](./migrate-mcq-to-qq)
 * [Streams](./streams): a messaging abstraction that allows for repeatable consumption
 * [RabbitMQ Stream plugin](./stream): the plugin and binary protocol behind RabbitMQ streams

### Distributed RabbitMQ

 * [Replication and Distributed Feature Overview](./distributed)
 * [Reliability](./reliability) of distributed deployments, publishers and consumers
 * [Federation](./federation)
 * [Shovel](./shovel)


### Guidance

 * [Monitoring](./monitoring)
 * [Production Checklist](./production-checklist)
 * [Backup and Restore](./backup)
 * [Troubleshooting guidance](./troubleshooting)
 * [Reliable Message Delivery](./reliability)


### Message Store and Resource Management

 * [Memory Usage Analysis](./memory-use)
 * [Memory Management](./memory)
 * [Resource Alarms](./alarms)
 * [Free Disk Space Alarms](./disk-alarms)
 * [Runtime Tuning](./runtime)
 * [Flow Control](./flow-control)
 * [Message Store Configuration](./persistence-conf)
 * [Queue and Message TTL](./ttl)
 * [Queue Length Limits](./maxlength)
 * [Lazy Queues](./lazy-queues)


### Queue and Consumer Features

 * [Queues guide](./queues)
 * [Consumers guide](./consumers)
 * [Queue and Message TTL](./ttl)
 * [Queue Length Limits](./maxlength)
 * [Lazy Queues](./lazy-queues)
 * [Dead Lettering](./dlx)
 * [Priority Queues](./priority)
 * [Consumer Cancellation Notifications](./consumer-cancel)
 * [Consumer Prefetch](./consumer-prefetch)
 * [Consumer Priorities](./consumer-priority)
 * [Streams](./streams)


### Publisher Features

 * [Publishers guide](./publishers)
 * [Exchange-to-Exchange Bindings](./e2e)
 * [Alternate Exchanges](./ae)
 * [Sender-Selected Distribution](./sender-selected)


### STOMP, MQTT, WebSockets

 * [Client Connections](./connections)
 * [Inter-protocol Conversions](./conversions)
 * [STOMP](./stomp)
 * [MQTT](./mqtt)
 * [STOMP over WebSockets](./web-stomp)
 * [MQTT over WebSockets](./web-mqtt)


## Man Pages

 * [man Pages](./manpages)


## Client Libraries and Features

[RabbitMQ clients documentation](./clients) is organised in a number
of guides and API references. A separate set of [tutorials](/tutorials) for
many popular programming languages are also available, as is an [AMQP 0-9-1 Overview](/tutorials/amqp-concepts).

### Client Documentation Guides

 * [Java Client](./api-guide)
 * [.NET Client](./dotnet-api-guide)
 * [Ruby Client](http://rubybunny.info)
 * [JMS Client](./jms-client)
 * [Erlang Client](./erlang-client-user-guide)
 * [RabbitMQ extensions to AMQP 0-9-1](./extensions)

### Client-Driven Features

 * [Client Connections](./connections)
 * [Consumers](./consumers)
 * [Publishers](./publishers)
 * [Channels](./channels)
 * [Publisher Confirms and Consumer Acknowledgements](./confirms)
 * [Queue and Message TTL](./ttl)
 * [Queue Length Limits](./maxlength)
 * [Lazy Queues](./lazy-queues)
 * [Exchange-to-Exchange Bindings](./e2e)
 * [Sender-Selected Distribution](./sender-selected)
 * [Priority Queues](./priority)
 * [Consumer Cancellation Notifications](./consumer-cancel)
 * [Consumer Prefetch](./consumer-prefetch)
 * [Consumer Priorities](./consumer-priority)
 * [Dead Lettering](./dlx)
 * [Alternate Exchanges](./ae)
 * [Message Tracing](./firehose)
 * [Capturing Traffic with Wireshark](./amqp-wireshark)


## References

 * [Java](https://rabbitmq.github.io/rabbitmq-java-client/api/current/)
 * [.NET](https://rabbitmq.github.io/rabbitmq-dotnet-client/index.html)
 * [AMQP 0-9-1 URI Specification](./uri-spec)
 * [URI Query Parameters](./uri-query-parameters)

See [Clients and Developer Tools](./devtools)
for community client libraries.


## Plugins

Popular tier 1 (built-in) plugins:

 * [Management](./management)
 * [STOMP](./stomp)
 * [MQTT](./mqtt)
 * [STOMP over WebSockets](./web-stomp)
 * [MQTT over WebSockets](./web-mqtt)
 * [Federation](./federation)
 * [Shovel](./shovel)
 * [Internal Event Exchange](./event-exchange)

See [Community Plugins](./community-plugins),
[RabbitMQ GitHub repositories](https://github.com/rabbitmq/)
and the [Plugins Guide](./plugins) for more information about plugins.


## Development

 * [RabbitMQ GitHub repositories](https://github.com/rabbitmq/)
 * [Contributor Code of Conduct](https://github.com/rabbitmq/rabbitmq-server/blob/main/CODE_OF_CONDUCT.md)
 * How to [build RabbitMQ](./build) from source, or
 * from [GitHub](./github).


## Protocols

 * AMQP 0-9-1: [Extensions](./extensions) | [Quick Reference](./amqp-0-9-1-quickref)
 * [STOMP](./stomp)
 * [MQTT](./mqtt)
 * [STOMP over WebSockets](./web-stomp)
 * [MQTT over WebSockets](./web-mqtt)
 * [AMQP 0-9-1 implementation details](./protocol).
 * [AMQP 0-9-1 Errata document](./amqp-0-9-1-errata).
