---
title: "RabbitMQ 4.1.0 is released"
tags: ["Releases", "RabbitMQ 4.1"]
authors: [mklishin]
---

# RabbitMQ 4.1.0

[RabbitMQ `4.1.0`](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.1.0) is
a new minor release that includes [multiple performance improvements](/blog/2025/04/08/4.1-performance-improvements),
and a number of features such as thew [new peer discovery mechanism for Kubernetes](/blog/2025/04/04/new-k8s-peer-discovery).

See Compatibility Notes below to learn about **breaking or potentially breaking changes** in this release.


## Highlights

Some key improvements in this release are listed below.

### Quorum Queue Throughput and Parallelism Improvements

Quorum queue log reads are now offloaded to channels (sessions, connections).

In practical terms this means improved consumer throughput, lower interference of publishers
on queue delivery rate to consumers, and improved CPU core utilization by each quorum queue
(assuming there are enough cores available to the node).

### Initial Support for AMQP 1.0 Filter Expressions

Support for the `properties` and `application-properties` filters of [AMQP Filter Expressions Version 1.0 Working Draft 09](https://groups.oasis-open.org/higherlogic/ws/public/document?document_id=66227).

As described in the [AMQP 1.0 Filter Expressions](https://www.rabbitmq.com/blog/2024/12/13/amqp-filter-expressions) blog post,
this feature enables multiple concurrent clients each consuming only a subset of messages from a stream while maintaining message order.

### Feature Flags Quality of Life Improvements

Graduated (mandatory) [feature flags](https://www.rabbitmq.com/docs/feature-flags) several minors ago has proven that they could use some user experience improvements.
For example, certain required feature flags will now be enabled on node boot when all nodes in the cluster support them.

See core server changes below as well as the [GitHub project dedicated to feature flags improvements](https://github.com/orgs/rabbitmq/projects/4/views/1)
for the complete list of related changes.

### rabbitmqadmin v2

[`rabbitmqadmin` v2](/docs/management-cli) is a major revision of the
original CLI client for the RabbitMQ HTTP API.

It supports a much broader set of operations, including health checks, operations
on federation upstreams, shovels, transformations of exported definitions,
(some) Tanzu RabbitMQ HTTP API endpoints, `--long-option` and subcommand inference in interactive mode,
and more.

<!-- truncate -->

## Breaking Changes and Compatibility Notes

### Initial AMQP 0-9-1 Maximum Frame Size

Before a client connection can negotiate a maximum frame size (`frame_max`), it must authenticate
successfully. Before the authenticated phase, a special lower `frame_max` value
is used.

With this release, the value was increased from the original 4096 bytes to 8192
to accommodate larger [JWT tokens](https://www.rabbitmq.com/docs/oauth2).

Clients that do override `frame_max` now must use values of 8192 bytes or greater.
We recommend using the default server value of `131072`: do not override the `frame_max`
key in `rabbitmq.conf` and do not set it in the application code.

[`amqplib`](https://github.com/amqp-node/amqplib/) is a popular client library that has been using
a low `frame_max` default of `4096`. Its users must [upgrade to a compatible version](https://github.com/amqp-node/amqplib/blob/main/CHANGELOG.md#v0107)
(starting with `0.10.7`) or explicitly use a higher `frame_max`.


### MQTT

 * The default MQTT [Maximum Packet Size](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901086) changed from 256 MiB to 16 MiB.

   This default can be overridden by [configuring](https://www.rabbitmq.com/docs/configure#config-file) `mqtt.max_packet_size_authenticated`.
   Note that this value must not be greater than `max_message_size` (which also defaults to 16 MiB).

### etcd Peer Discovery

The following `rabbitmq.conf` settings are unsupported:
* `cluster_formation.etcd.ssl_options.fail_if_no_peer_cert`
* `cluster_formation.etcd.ssl_options.dh`
* `cluster_formation.etcd.ssl_options.dhfile`

## Erlang/OTP Compatibility Notes

This release [requires Erlang 26.2](/docs/which-erlang) and supports Erlang 27.x.

[Provisioning Latest Erlang Releases](/docs/which-erlang#erlang-repositories) explains
what package repositories and tools can be used to provision latest patch versions of Erlang 26.x and 27.x.


## Release Artifacts

Artifacts for preview releases are distributed via GitHub releases:

 * In main repository, [`rabbitmq/rabbitmq-server`](https://github.com/rabbitmq/rabbitmq-server/releases)
 * In the development builds repository, [`rabbitmq/server-packages`](https://github.com/rabbitmq/server-packages/releases)

There is a `4.1.0` preview version of the [community RabbitMQ image](https://github.com/docker-library/rabbitmq).


## Upgrading to 4.1.0

### Documentation guides on upgrades

See the [Upgrading guide](https://www.rabbitmq.com/docs/upgrade) for documentation on upgrades and [GitHub releases](https://github.com/rabbitmq/rabbitmq-server/releases)
for release notes of individual releases.

This release series supports upgrades from `4.0.x` and `3.13.x`.

[Blue/Green Deployment](https://www.rabbitmq.com/docs/blue-green-upgrade)-style upgrades are avaialble for migrations
from RabbitMQ `3.12.x` series.

### New Required Feature Flags

None. The required feature flag set is the same as in `4.0.x`.

### Mixed version cluster compatibility

RabbitMQ 4.1.0 nodes can run alongside `4.0.x` nodes. `4.1.x`-specific features can only be made available when all nodes in the cluster
upgrade to 4.0.0 or a later patch release in the new series.

While operating in mixed version mode, some aspects of the system may not behave as expected. The list of known behavior changes will be covered in future updates.
Once all nodes are upgraded to 4.1.0, these irregularities will go away.

Mixed version clusters are a mechanism that allows rolling upgrade and are not meant to be run for extended
periods of time (no more than a few hours).

### Recommended Post-upgrade Procedures

This version does not require any additional post-upgrade procedures
compared to other versions.


## Release Artifacts

Release artifacts can be obtained on [GitHub](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.9)
as well as [RPM](https://www.rabbitmq.com/docs/install-rpm), [Debian](https://www.rabbitmq.com/docs/install-debian) package repositories.


## Community Support Now Only Covers the 4.1.x Series

With the release of [RabbitMQ `4.1.0`](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.1.0), this series is
no longer covered by [community support](/release-information).

Future `4.0.x` releases will only be available to [paying customers](/contact)
via the Broadcom customer portal.

All non-paying users must [upgrade to `4.1.0`](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.1.0)
in order to be covered by community support from the core team.
