---
title: Server Operator Documentation
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

# Server Operator Documentation

RabbitMQ ships in a state where it can be used straight away in
simple cases such as development and QA environments - just
start the server, [enable](./plugins#ways-to-enable-plugins) the necessary plugins and it's ready to go.

This guide provides a table of contents of documentation oriented at RabbitMQ operators.
For a complete documentation ToC that includes developer-oriented guides,
see <a href="./documentation">All Documentation Guides</a>.

## [Installation and Provisioning](./download):

 * [Packages and repositories](./download)
 * [Provisioning Tools](./download) (e.g. Chef cookbook, Puppet module, Docker image)
 * [Package Signatures](./signatures)
 * [Supported Erlang/OTP Versions](./which-erlang)
 * [Supported RabbitMQ Versions](./versions)
 * [Changelog](./changelog)

### Operating Systems and Platforms

 * [Debian and Ubuntu](./install-debian)
 * [Red Hat Enterprise Linux, CentOS, Fedora](./install-rpm)
 * [Windows Installer](./install-windows), [Windows-specific Issues](./windows-quirks)
 * [Generic UNIX Binary Build](./install-generic-unix)
 * [MacOS via Standalone Binary Build](./install-standalone-mac)
 * [MacOS via Homebrew](./install-homebrew)
 * [Amazon EC2](./ec2)
 * [Solaris](./install-solaris)

### Snapshots

 * [Snapshot (Nightly) Builds](./snapshots)


## Upgrading

 * Main [Upgrading guide](./upgrade)
 * [Schema Definitions](./definitions)
 * [Blue-green deployment-based upgrade](./blue-green-upgrade)



## CLI tools

 * [RabbitMQ CLI Tools](./cli): general installation and usage topics
 * [rabbitmqctl](./man/rabbitmqctl.8): primary RabbitMQ CLI tool
 * [rabbitmq-diagnostics](./man/rabbitmq-diagnostics.8): [monitoring](./monitoring), [health checking](./monitoring#health-checks), observability tooling
 * [rabbitmq-plugins](./man/rabbitmq-plugins.8): plugin management
 * [rabbitmq-queues](./man/rabbitmq-queues.8): operations on quorum queues
 * [rabbitmq-streams](./man/rabbitmq-streams.8): operations on streams
 * [rabbitmq-upgrade](./man/rabbitmq-upgrade.8): operations related to [upgrades](./upgrade)
 * [rabbitmqadmin](./management-cli) ([HTTP API](./management)-based zero dependency management tool)
 * [man pages](./manpages)


## Configuration

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


## Authentication and authorisation:

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


## Networking and TLS

 * [Client Connections](./connections)
 * [Networking](./networking)
 * [Inter-protocol Conversions](./conversions)
 * [Troubleshooting Network Connectivity](./troubleshooting-networking)
 * [Using TLS for Client Connections](./ssl)
 * [Using TLS for Inter-node Traffic](./clustering-ssl)
 * [Troubleshooting TLS](./troubleshooting-ssl)


## Monitoring, Audit, Application Troubleshooting:

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
 * [Intra-cluster Compression](https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/1/rmq/standby-replication.html)

### Replicated Queue Types, Streams, High Availability

 * [Quorum Queues](./quorum-queues): a modern highly available replicated queue type
 * [Streams](./streams): a messaging abstraction that allows for repeatable consumption
 * [RabbitMQ Stream plugin](./stream): the plugin and binary protocol behind RabbitMQ streams

### Distributed RabbitMQ

 * [Replication and Distributed Feature Overview](./distributed)
 * [Reliability](./reliability) of distributed deployments, publishers and consumers
 * [Federation](./federation)
 * [Shovel](./shovel)


## Guidance

 * [Monitoring](./monitoring)
 * [Production Checklist](./production-checklist)
 * [Backup and Restore](./backup)
 * [Troubleshooting guidance](./troubleshooting)
 * [Reliable Message Delivery](./reliability)


## Resource Management

 * [Memory Usage Analysis](./memory-use)
 * [Memory Management](./memory)
 * [Resource Alarms](./alarms)
 * [Free Disk Space Alarms](./disk-alarms)
 * [Runtime Tuning](./runtime)
 * [Flow Control](./flow-control)
 * [Queue and Message TTL](./ttl)
 * [Queue Length Limits](./maxlength)


## Queue and Consumer Features

 * [Queues guide](./queues)
 * [Classic Queues](./classic-queues)
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


## STOMP, MQTT, WebSockets

 * [Client Connections](./connections)
 * [STOMP](./stomp)
 * [MQTT](./mqtt)
 * [STOMP over WebSockets](./web-stomp)
 * [MQTT over WebSockets](./web-mqtt)


## Man Pages

 * [man Pages](./manpages)
