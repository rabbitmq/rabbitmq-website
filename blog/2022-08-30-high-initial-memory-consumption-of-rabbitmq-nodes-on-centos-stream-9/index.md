---
title: "High Initial Memory Consumption of RabbitMQ Nodes on Centos Stream 9"
tags: ["Updates", ]
authors: [mklishin]
---

Team RabbitMQ and community members have recently identified a curious scenario where a freshly started node could
consume a surprisingly high amount of memory, say, 1.5 GiB or so. We'd like to share our findings with the community
and explain what short term and longer term workarounds are available.

<!-- truncate -->

Some recent Linux distributions, such as ArchLinux, [RHEL 9](https://access.redhat.com/solutions/1479623), and CentOS Stream 9, ship a recent version of systemd
[that sets the default open file handle limit is set to 1073741816](https://github.com/systemd/systemd/commit/a8b627aaed409a15260c25988970c795bf963812) or about one billion.
This is much higher than the default used by older distributions such as CentOS 8.

For a lot of software this doesn't change anything. However, the Erlang runtime will allocate more memory upfront on systems with a very high limit.
This leads to surprisingly high footprint of newly started RabbitMQ nodes without any data or meaningful client activity.

[There are two ways to mitigate](https://github.com/docker-library/rabbitmq/issues/545#issuecomment-1224977154) this problem:

 * Lower the file handle limit for user that runs the node (usually named `rabbitmq`)
 * [Set the `ERL_MAX_PORTS` environment variable](/docs/configure#customise-environment) to a lower value

What value would be more appropriate for your given environment depends on the workload. Default values in the 50,000 to 100,000 range
should support plenty of concurrent client connections, queues and streams for many cases without causing
excessive upfront memory allocation by the runtime.
