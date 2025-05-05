---
title: Cluster Formation and Peer Discovery
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

# Cluster Formation and Peer Discovery

## Overview {#overview}

This guide covers various automation-oriented cluster formation and
peer discovery features. For a general overview of RabbitMQ clustering,
please refer to the [Clustering Guide](./clustering).

This guide assumes general familiarity with [RabbitMQ clustering](./clustering)
and focuses on the peer discovery subsystem.
For example, it will not cover what [ports must be open](./networking) for inter-node communication, how nodes authenticate to each other, and so on.
Besides discovery mechanisms and [their configuration](#configuring),
this guide also covers closely related topics of [feature availability during cluster formation](#formation-and-availability), [rejoining nodes](#rejoining),
the problem of [initial cluster formation](#initial-formation-race-condition) with nodes booting in parallel as well as [additional health checks](#node-health-checks-and-cleanup) offered
by some discovery implementations.

The guide also covers the basics of [peer discovery troubleshooting](#troubleshooting).

## What is Peer Discovery? {#peer-discovery}

To form a cluster, new ("blank") nodes need to be able to discover
their peers. This can be done using a variety of mechanisms (backends).
Some mechanisms assume all cluster members are known ahead of time (for example, listed
in the config file), others are dynamic (nodes can come and go).

All peer discovery mechanisms assume that newly joining nodes will be able to
contact their peers in the cluster and authenticate with them successfully.
The mechanisms that rely on an external service (e.g. DNS or Consul) or API (e.g. AWS or Kubernetes)
require the service(s) or API(s) to be available and reachable on their standard ports.
Inability to reach the services will lead to node's inability to join the cluster.

### Available Discovery Mechanisms {#peer-discovery-plugins}

The following mechanisms are built into the core and always available:

 * [Config file](#peer-discovery-classic-config)
 * [Pre-configured DNS A/AAAA records](#peer-discovery-dns)

Additional peer discovery mechanisms are available via plugins. The following
peer discovery plugins ship with [supported RabbitMQ versions](/release-information):

 * [AWS (EC2)](#peer-discovery-aws)
 * [Kubernetes](#peer-discovery-k8s)
 * [Consul](#peer-discovery-consul)
 * [etcd](#peer-discovery-etcd)

The above plugins do not need to be installed but like all [plugins](./plugins) they must be [enabled](./plugins#basics)
or [preconfigured](./plugins#enabled-plugins-file) before they can be used.

For peer discovery plugins, which must be available on node boot, this means they must be enabled before first node boot.
The example below uses [rabbitmq-plugins](./cli)' `--offline` mode:

```bash
rabbitmq-plugins --offline enable <plugin name>
```

A more specific example:

```bash
rabbitmq-plugins --offline enable rabbitmq_peer_discovery_k8s
```

A node with configuration settings that belong a non-enabled peer discovery plugin will fail
to start and report those settings as unknown.

### Specifying the Peer Discovery Mechanism {#peer-discovery-configuring-mechanism}

The discovery mechanism to use is specified in the [config file](./configure),
as are various mechanism-specific settings, for example, discovery service hostnames, credentials, and so
on. `cluster_formation.peer_discovery_backend` is the key
that controls what discovery module (implementation) is used:

```ini
cluster_formation.peer_discovery_backend = classic_config

# The backend can also be specified using its module name. Note that
# module names do not necessarily match plugin names exactly.
# cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config
```

The module has to implement the [rabbit_peer_discovery_backend](https://github.com/rabbitmq/rabbitmq-common/blob/master/src/rabbit_peer_discovery_backend.erl)
behaviour. Plugins therefore can introduce their own discovery
mechanisms.

### How Peer Discovery Works {#peer-discovery-how-does-it-work}

When a node starts and detects it doesn't have a previously
initialised database, it will check if there's a peer
discovery mechanism configured. If that's the case, it will
then perform the discovery and attempt to contact each
discovered peer in order. Finally, it will attempt to join the
cluster of the first reachable peer.

Depending on the backend (mechanism) used, the process of peer discovery may involve
contacting external services, for example, an AWS API endpoint, a Consul node or
performing a DNS query. Some backends require nodes to register (tell the backend that the
node is up and should be counted as a cluster member): for example, Consul and etcd both
support registration. With other backends the list of nodes is configured ahead of
time (e.g. config file). Those backends are said to not support node registration.

In some cases node registration is implicit or managed by an external service.
AWS autoscaling groups is a good example: AWS keeps track of group membership,
so nodes don't have to (or cannot) explicitly register. However, the list of cluster members
is not predefined. Such backends usually include a no-op registration step
and apply one of the [race condition mitigation mechanisms](#initial-formation-race-condition) described below.

If the configured backend supports registration, nodes unregister when they are instructed to stop.

It is possible to opt-out of registration completely with the config option `cluster_formation.registration.enabled`:

```ini
cluster_formation.registration.enabled = false
```

When configured this way, the node has to be registered manually or using another mechanism,
e.g. by a container orchestrator such as [Nomad](https://developer.hashicorp.com/nomad/integrations/hashicorp/rabbitmq).

If peer discovery isn't configured, or it [repeatedly fails](#discovery-retries),
or no peers are reachable, a node that wasn't a cluster member in the past
will initialise from scratch and proceed as a standalone node.
Peer discovery progress and outcomes will be [logged](./logging)
by the node.

If a node previously was a cluster member, it will try to contact and rejoin
its "last seen" peer for a period of time. In this case, no peer discovery
will be performed. This is true for all backends.


## Cluster Formation and Feature Availability {#formation-and-availability}

As a general rule, a cluster that is only been partly formed, that is, only a subset of
nodes has joined it **must be considered fully available** by clients.

Individual nodes will accept [client connections](./connections) before the cluster is formed. In such cases,
clients should be prepared to certain features not being available. For instance, [quorum queues](./quorum-queues)
won't be available unless the number of cluster nodes matches or exceeds the quorum of configured replica count.

Features behind [feature flags](./feature-flags) may also be unavailable until cluster formation completes.


## Nodes Rejoining Their Existing Cluster {#rejoining}

A new node joining a cluster is just one possible case. Another common scenario
is when an existing cluster member temporarily leaves and then rejoins the cluster.
While the peer discovery subsystem does not affect the behavior described in this section,
it's important to understand how nodes behave when they rejoin their cluster after a restart or failure.

Existing cluster members <strong>will not perform peer discovery</strong>. Instead they will try to
contact their previously known peers.

If a node previously was a cluster member, when it boots it will try to contact
its "last seen" peer for a period of time. If the peer is not booted (e.g. when
a full cluster restart or upgrade is performed) or cannot be reached, the node will
retry the operation a number of times.

Default values are `10` retries and `30` seconds per attempt,
respectively, or 5 minutes total. In environments where nodes can take a long and/or uneven
time to start it is recommended that the number of retries is increased.

If a node is reset since losing contact with the cluster, it will behave [like a blank node](#peer-discovery-how-does-it-work).
Note that other cluster members might still consider it to be a cluster member, in which case
the two sides will disagree and the node will fail to join. Such reset nodes must also be
removed from the cluster using [`rabbitmqctl forget_cluster_node`](./cli) executed against
an existing cluster member.

If a node was explicitly removed from the cluster by the operator and then reset,
it will be able to join the cluster as a new member. In this case it will behave exactly
[like a blank node](#peer-discovery-how-does-it-work) would.

A node rejoining after a node name or host name change can start as [a blank node](#peer-discovery-how-does-it-work)
if its data directory path changes as a result. Such nodes will fail to rejoin the cluster.
While the node is offline, its peers can be reset or started with a blank data directory.
In that case the recovering node will fail to rejoin its peer as well since internal data store cluster
identity would no longer match.

Consider the following scenario:

<ol>
  <li>A cluster of 3 nodes, A, B and C is formed</li>
  <li>Node A is shut down</li>
  <li>Node B is reset</li>
  <li>Node A is started</li>
  <li>Node A tries to rejoin B but B's cluster identity has changed</li>
  <li>Node B doesn't recognise A as a known cluster member because it's been reset</li>
</ol>

in this case node B will reject the clustering attempt from A with an appropriate error
message in the log:

```
Node 'rabbit@node1.local' thinks it's clustered with node 'rabbit@node2.local', but 'rabbit@node2.local' disagrees
```

In this case B can be reset again and then will be able to join A, or A
can be reset and will successfully join B.


## How to Configure Peer Discovery {#configuring}

Peer discovery plugins are configured just like the core server and other
plugins: using a [config file](./configure).

`cluster_formation.peer_discovery_backend` is the key that [controls what peer discovery backend will be used](#peer-discovery-configuring-mechanism).
Each backend will also have a number of configuration settings specific to it.
The rest of the guide will cover configurable settings specific to a particular mechanism
as well as provide examples for each one.


## Config File Peer Discovery Backend {#peer-discovery-classic-config}

### Config File Peer Discovery Overview

The most basic way for a node to discover its cluster peers is to read a list
of nodes from the config file. The set of cluster members is assumed to be known at deployment
time.

### Configuration

The peer nodes are listed using the `cluster_formation.classic_config.nodes` config setting:

```ini
cluster_formation.peer_discovery_backend = classic_config

# the backend can also be specified using its module name
# cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config

cluster_formation.classic_config.nodes.1 = rabbit@hostname1.eng.example.local
cluster_formation.classic_config.nodes.2 = rabbit@hostname2.eng.example.local
```


## DNS Peer Discovery Backend {#peer-discovery-dns}

:::important

This peer discovery mechanism is sensitive to OS and RabbitMQ configuration that
[affects hostname resolution](./networking#dns).

For example, a deployment tool that modifies the [local host file](https://en.wikipedia.org/wiki/Hosts_(file))
can affect (break) this peer discovery mechanism.

:::

### DNS Peer Discovery Overview

Another built-in peer discovery mechanism as of RabbitMQ 3.7.0 is DNS-based.
It relies on a pre-configured hostname ("seed hostname") with DNS A (or AAAA) records and reverse DNS lookups
to perform peer discovery. More specifically, this mechanism will perform the following steps:

1. Query DNS A records of the seed hostname.
2. For each returned DNS record's IP address, perform a reverse DNS lookup.
3. Append current node's prefix (e.g. `rabbit` in `rabbit@hostname1.example.local`)
   to each hostname and return the result.

For example, let's consider a seed hostname of
`discovery.eng.example.local`.  It has 2 DNS A
records that return two IP addresses:
`192.168.100.1` and
`192.168.100.2`. Reverse DNS lookups for those IP
addresses return `node1.eng.example.local` and
`node2.eng.example.local`, respectively. Current node's name is not
set and defaults to `rabbit@$(hostname)`.
The final list of nodes discovered will contain two nodes: `rabbit@node1.eng.example.local`
and `rabbit@node2.eng.example.local`.

### Configuration

The seed hostname is set using the `cluster_formation.dns.hostname` config setting:

```ini
cluster_formation.peer_discovery_backend = dns

# the backend can also be specified using its module name
# cluster_formation.peer_discovery_backend = rabbit_peer_discovery_dns

cluster_formation.dns.hostname = discovery.eng.example.local
```

### Host File Modifications in Containerized Environments

:::warning

In some containerized environments, the [local host file](https://en.wikipedia.org/wiki/Hosts_(file)) is modified at container
startup time. This can affect hostname resolution on the host and make it impossible for this peer
discovery mechanism to do its job.

:::

In some containerized environments, the [local host file](https://en.wikipedia.org/wiki/Hosts_(file)) is modified at container
startup time, for example, a configuration- or convention-based local hostname can be added to it.

This can affect hostname resolution on the host and make it impossible for this peer
discovery mechanism to do its job.

Podman is one known example of a tool that can perform such host file modifications.
In order to avoid this, set its [`host_containers_internal_ip` setting](https://github.com/containers/common/blob/main/docs/containers.conf.5.md)
must be set to a blank string.

In environments where container-level settings cannot be tuned, the runtime
can be [configured to ignore the standard local hosts file](./networking#the-inetrc-file)
and only use DNS or a pre-configured set of hostname-to-IP address mappings.


## Peer Discovery on AWS (EC2) {#peer-discovery-aws}

### AWS Peer Discovery Overview

An [AWS (EC2)-specific](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_aws) discovery mechanism
is available via a plugin.

As with any [plugin](./plugins), it must be enabled before it
can be used. For peer discovery plugins it means they must be [enabled](./plugins#basics)
or [preconfigured](./plugins#enabled-plugins-file) before first node boot:

```bash
rabbitmq-plugins --offline enable rabbitmq_peer_discovery_aws
```

The plugin provides two ways for a node to discover its peers:

 * Using EC2 instance tags
 * Using AWS autoscaling group membership

Both methods rely on AWS-specific APIs (endpoints) and features and thus cannot work in
other IaaS environments. Once a list of cluster member instances is retrieved,
final node names are computed using instance hostnames or IP addresses.

### Configuration and Credentials {#peer-discovery-aws-credentials}

Before a node can perform any operations on AWS, it needs to have a set of
AWS account credentials configured. This can be done in a couple of ways:

1. Via [config file](./configure)
2. Using environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

[EC2 Instance Metadata service](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) for the region will also be consulted.

The following example snippet configures RabbitMQ to use the AWS peer discovery
backend and provides information about AWS region as well as a set of credentials:

```ini
cluster_formation.peer_discovery_backend = aws

# the backend can also be specified using its module name
# cluster_formation.peer_discovery_backend = rabbit_peer_discovery_aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY
```

If region is left unconfigured, `us-east-1` will be used by default.
Sensitive values in configuration file can optionally [be encrypted](./configure#configuration-encryption).

If an [IAM role is assigned to EC2 instances](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-./ec2) running RabbitMQ nodes,
a policy has to be used to [allow said instances use EC2 Instance Metadata Service](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html).
When the plugin is configured to use Autoscaling group members,
a policy has to [grant access to describe autoscaling group members](https://docs.aws.amazon.com/autoscaling/ec2/userguide/control-access-using-iam.html) (instances).
Below is an example of a policy that covers both use cases:

```json
{
"Version": "2012-10-17",
"Statement": [
              {
              "Effect": "Allow",
              "Action": [
                         "autoscaling:DescribeAutoScalingInstances",
                         "ec2:DescribeInstances"
                         ],
              "Resource": [
                           "*"
                           ]
              }
              ]
}
```

### Using Autoscaling Group Membership {#peer-discovery-aws-autoscaling-group-membership}

When autoscaling-based peer discovery is used, current node's EC2 instance autoscaling
group members will be listed and used to produce the list of discovered peers.

To use autoscaling group membership, set the `cluster_formation.aws.use_autoscaling_group` key
to `true`:

```ini
cluster_formation.peer_discovery_backend = aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY

cluster_formation.aws.use_autoscaling_group = true
```

### Using EC2 Instance Tags {#peer-discovery-aws-tags}

When tags-based peer discovery is used, the plugin will list EC2 instances
using EC2 API and filter them by configured instance tags. Resulting instance set
will be used to produce the list of discovered peers.

Tags are configured using the `cluster_formation.aws.instance_tags` key. The example
below uses three tags: `region`, `service`, and `environment`.

```ini
cluster_formation.peer_discovery_backend = aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY

cluster_formation.aws.instance_tags.region = us-east-1
cluster_formation.aws.instance_tags.service = rabbitmq
cluster_formation.aws.instance_tags.environment = staging
```

### Using Private EC2 Instance IPs {#peer-discovery-aws-other-settings}

By default peer discovery will use private DNS hostnames to compute node names.
This option is most convenient and is **highly recommended**.

However, it is possible to opt into using private IPs instead by setting
the `cluster_formation.aws.use_private_ip` key to `true`. For this setup to work,
[`RABBITMQ_NODENAME` must be set](./configure#customise-environment) to the private IP address at node
deployment time.

`RABBITMQ_USE_LONGNAME` also has to be set to `true` or an IP address won't be considered a valid
part of node name.

```ini
cluster_formation.peer_discovery_backend = aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY

cluster_formation.aws.use_autoscaling_group = true
cluster_formation.aws.use_private_ip = true
```


## Peer Discovery on Kubernetes {#peer-discovery-k8s}

:::tip

In most cases you don't need to worry about peer discovery, when deploying to Kubernetes.

[Cluster Operator](/kubernetes/operator/operator-overview) (the recommended way of deploying to Kubernetes)
as well as popular Helm charts, pre-configure peer discovery for you.
:::

### Kubernetes Peer Discovery Overview

A [Kubernetes](https://kubernetes.io/)-based discovery mechanism
is available via [a plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_k8s).

Since peer discovery happens early during node boot, you should add `rabbitmq_peer_discovery_k8s` to the
[`enabled_plugins` file](https://www.rabbitmq.com/docs/plugins#enabled-plugins-file).
In case of a Kubernetes deployment, it is usually a `ConfigMap`.

Since RabbitMQ 4.1, this plugin only allows the node with the lowest ordinal index (almost always the pod with the `-0` suffix)
to form a new cluster. This node is referred to as the seed node.

All other nodes will join the seed node, or will forever keep trying to join it, if they can't.

In the most common scenario, this means that:
* the pod with `-0` suffix will start immediately, effectively forming a new single-node cluster
* any other pod will join the pod with `-0` suffix and synchronize the cluster metadata with it

### Configuration

**In most cases, no configuration should be necessary beyond enabling this plugin.**

If you use [a different ordinal start value in your StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#ordinal-index),
you have to configure this plugin to use it:
```
cluster_formation.k8s.ordinal_start = N
```
where `N` matches the `.spec.ordinals.start` value of the StatefulSet.

If the plugin doesn't work for any reason (a very unusual Kubernetes configuration or issues with hostname resolution)
and you have to force RabbitMQ to use a different seed node than it would automatically, you can do this:
```
cluster_formation.k8s.seed_node = rabbit@seed-node-hostname
```

If `cluster_formation.k8s.seed_node` is configured, this plugin will just use this value as the seed node.
If you do this, please open a GitHub issue and explain why the plugin didn't work for you, so we can improve it.

## Peer Discovery Using Consul {#peer-discovery-consul}

### Consul Peer Discovery Overview

A [Consul](https://www.consul.io)-based discovery mechanism
is available via [a plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_consul).

As with any [plugin](./plugins), it must be enabled before it
can be used. For peer discovery plugins it means they must be [enabled](./plugins#basics)
or [preconfigured](./plugins#enabled-plugins-file) before first node boot:

```bash
rabbitmq-plugins --offline enable rabbitmq_peer_discovery_consul
```

The plugin supports Consul 0.8.0 and later versions.

Nodes register with Consul on boot and unregister when they
leave. Prior to registration, nodes will attempt to acquire a
lock in Consul to reduce the probability of a [race condition
during initial cluster formation](#initial-formation-race-condition).
When a node registers with Consul, it will set up a periodic [health
check](https://www.consul.io/docs/agent/checks.html) for itself (more on this below).

### Configuration

To use Consul for peer discovery, set the `cluster_formation.peer_discovery_backend`
to `consul` or its module name, `rabbit_peer_discovery_consul` (note: the name of the module is
slightly different from plugin name):

```ini
cluster_formation.peer_discovery_backend = consul

# the backend can also be specified using its module name
# cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

# Consul host (hostname or IP address). Default value is localhost
cluster_formation.consul.host = consul.eng.example.local
```

#### Consul Endpoint

It is possible to configure Consul port and URI scheme:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
# 8500 is used by default
cluster_formation.consul.port = 8500
# http is used by default
cluster_formation.consul.scheme = http
```

#### Consul ACL Token

To configure [Consul ACL](https://www.consul.io/docs/guides/acl.html) token,
use `cluster_formation.consul.acl_token`:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
cluster_formation.consul.acl_token = acl-token-value
```

Service name (as registered in Consul) defaults to "rabbitmq" but can be overridden:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
# rabbitmq is used by default
cluster_formation.consul.svc = rabbitmq
```

#### Service Address

Service hostname (address) as registered in Consul will be fetched by peers
and therefore must resolve on all nodes.
The hostname can be computed by the plugin or specified by the user. When computed automatically,
a number of nodes and OS properties can be used:

 * Hostname (as returned by `gethostname(2)`)
 * Node name (without the `rabbit@` prefix)
 * IP address of an NIC (network controller interface)

When `cluster_formation.consul.svc_addr_auto` is set to `false`,
service name will be taken as is from `cluster_formation.consul.svc_addr`.
When it is set to `true`, other options explained below come into play.

In the following example, the service address reported to Consul is
hardcoded to `hostname1.rmq.eng.example.local` instead of being computed automatically
from the environment:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local

cluster_formation.consul.svc = rabbitmq
# do not compute service address, it will be specified below
cluster_formation.consul.svc_addr_auto = false
# service address, will be communicated to other nodes
cluster_formation.consul.svc_addr = hostname1.rmq.eng.example.local
# use long RabbitMQ node names?
cluster_formation.consul.use_longname = true
```

In this example, the service address reported to Consul is
parsed from node name (the `rabbit@` prefix will be dropped):

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local

cluster_formation.consul.svc = rabbitmq
# do compute service address
cluster_formation.consul.svc_addr_auto = true
# compute service address using node name
cluster_formation.consul.svc_addr_use_nodename = true
# use long RabbitMQ node names?
cluster_formation.consul.use_longname = true
```

`cluster_formation.consul.svc_addr_use_nodename` is a boolean
field that instructs Consul peer discovery backend to compute service address
using RabbitMQ node name.

In the next example, the service address is
computed using hostname as reported by the OS instead of node name:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local

cluster_formation.consul.svc = rabbitmq
# do compute service address
cluster_formation.consul.svc_addr_auto = true
# compute service address using host name and not node name
cluster_formation.consul.svc_addr_use_nodename = false
# use long RabbitMQ node names?
cluster_formation.consul.use_longname = true
```

In the example below, the service address is
computed by taking the IP address of a provided NIC, `en0`:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local

cluster_formation.consul.svc = rabbitmq
# do compute service address
cluster_formation.consul.svc_addr_auto = true
# compute service address using the IP address of a NIC, en0
cluster_formation.consul.svc_addr_nic = en0
cluster_formation.consul.svc_addr_use_nodename = false
# use long RabbitMQ node names?
cluster_formation.consul.use_longname = true
```

#### Service Port

Service port as registered in Consul can be overridden. This is only
necessary if RabbitMQ uses a [non-standard port](./networking)
for client (technically AMQP 0-9-1 and AMQP 1.0) connections since default value is 5672.

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
# 5672 is used by default
cluster_formation.consul.svc_port = 6674
```

#### Service Tags and Metadata

It is possible to provide [Consul service tags](https://www.consul.io/docs/agent/./services):

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
# Define tags for the RabbitMQ service: "qa" and "3.8"
cluster_formation.consul.svc_tags.1 = qa
cluster_formation.consul.svc_tags.2 = 3.8
```

It is possible to configure [Consul service metadata](https://www.consul.io/docs/agent/./services),
which is a map of string keys to string values with certain restrictions
(see Consul documentation to learn more):

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local

# Define metadata for the RabbitMQ service. Both keys and values have a
# maximum length limit enforced by Consul. This can be used to provide additional
# context about the service (RabbitMQ cluster) for operators or other tools.
cluster_formation.consul.svc_meta.owner = team-xyz
cluster_formation.consul.svc_meta.service = service-one
cluster_formation.consul.svc_meta.stats_url = https://service-one.eng.megacorp.local/stats/
```

#### Service Health Checks

When a node registers with Consul, it will set up a periodic [health check](https://www.consul.io/docs/agent/checks.html)
for itself. Online nodes will periodically send a health check update to Consul to indicate the service
is available. This interval can be configured:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
# health check interval (node TTL) in seconds
# default: 30
cluster_formation.consul.svc_ttl = 40
```

A node that failed its [health check](https://www.consul.io/docs/agent/checks.html) is considered
to be in the warning state by Consul.
Such nodes can be automatically unregistered by Consul after a
period of time (note: this is a separate interval value from
the TTL above). The period cannot be less than 60 seconds.

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
# health check interval (node TTL) in seconds
cluster_formation.consul.svc_ttl = 30
# how soon should nodes that fail their health checks be unregistered by Consul?
# this value is in seconds and must not be lower than 60 (a Consul requirement)
cluster_formation.consul.deregister_after = 90
```

Please see a section on [automatic cleanup of nodes](#node-health-checks-and-cleanup) below.

Nodes in the warning state are excluded from peer discovery results
by default. It is possible to opt into including them by setting
`cluster_formation.consul.include_nodes_with_warnings` to
`true`:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
# health check interval (node TTL) in seconds
cluster_formation.consul.svc_ttl = 30
# include node in the warning state into discovery result set
cluster_formation.consul.include_nodes_with_warnings = true
```

#### Opting Out of Regisration

If the configured backend supports registration,
nodes unregister when they are instructed to stop.

It is possible to opt-out of registration completely with the config option
`cluster_formation.registration.enabled`:

```ini
cluster_formation.registration.enabled = false
```

When configured this way, the node has to be registered manually or using another mechanism,
e.g. by a container orchestrator such as [Nomad](https://developer.hashicorp.com/nomad/integrations/hashicorp/rabbitmq).


#### Node Name Suffixes

If node name is computed and long node names are used, it is possible to
append a suffix to node names retrieved from Consul. The format is
`.node.{domain_suffix}`. This can be useful in environments with
DNS conventions, e.g. when all service nodes
are organised in a separate subdomain. Here's an example:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local

cluster_formation.consul.svc = rabbitmq
# do compute service address
cluster_formation.consul.svc_addr_auto = true
# compute service address using node name
cluster_formation.consul.svc_addr_use_nodename = true
# use long RabbitMQ node names?
cluster_formation.consul.use_longname = true
# append a suffix (node.rabbitmq.example.local) to node names retrieved from Consul
cluster_formation.consul.domain_suffix = example.local
```

With this setup node names will be computed to `rabbit@192.168.100.1.node.example.local`
instead of `rabbit@192.168.100.1`.

#### Distributed Lock Acquisition

When a node tries to acquire a lock on boot and the lock is already taken,
it will wait for the lock to become available for a limited amount of time. Default value is 300
seconds but it can be configured:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
# lock acquisition timeout in seconds
# default: 300
# cluster_formation.consul.lock_wait_time is an alias
cluster_formation.consul.lock_timeout = 60
```

Lock key prefix is `rabbitmq` by default. It can also be overridden:

```ini
cluster_formation.peer_discovery_backend = consul

cluster_formation.consul.host = consul.eng.example.local
cluster_formation.consul.lock_timeout = 60
# should the Consul key used for locking be prefixed with something
# other than "rabbitmq"?
cluster_formation.consul.lock_prefix = environments-qa
```


## Peer Discovery Using Etcd {#peer-discovery-etcd}

### Etcd Peer Discovery Overview

An [etcd](https://etcd.io/)-based discovery mechanism
is available via [a plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_etcd).

As of RabbitMQ `3.8.4`, the plugin uses a v3 API, gRPC-based etcd client and
**requires etcd 3.4 or a later version**.

As with any [plugin](./plugins), it must be enabled before it
can be used. For peer discovery plugins it means they must be [enabled](./plugins#basics)
or [preconfigured](./plugins#enabled-plugins-file) before first node boot:

```bash
rabbitmq-plugins --offline enable rabbitmq_peer_discovery_etcd
```

Nodes register with etcd on boot by creating a key in a conventionally named directory. The keys have
a short (say, a minute) expiration period. The keys are deleted when nodes stop cleanly.

Prior to registration, nodes will attempt to acquire a
lock in etcd to reduce the probability of a [race condition
during initial cluster formation](#initial-formation-race-condition).

Every node's key has an associated [lease](https://etcd.io/docs/v3.4.0/dev-guide/interacting_v3/#grant-leases)
with a configurable TTL. Nodes keep their key's leases alive.
If a node loses connectivity and cannot update its lease, its key will be cleaned up by etcd after TTL expires.
Such nodes won't be discovered by newly joining nodes.
If configured, such nodes can be forcefully removed from the cluster.

### Configuration

#### etcd Endpoints and Authentication

To use etcd for peer discovery, set the `cluster_formation.peer_discovery_backend`
to `etcd` or its module name, `rabbit_peer_discovery_etcd` (note: the name of the module
is slightly different from plugin name).

The plugin requires a configured etcd endpoint for the plugin
to connect to:

```ini
cluster_formation.peer_discovery_backend = etcd

# the backend can also be specified using its module name
# cluster_formation.peer_discovery_backend = rabbit_peer_discovery_etcd

# etcd endpoints. This property is required or peer discovery won't be performed.
cluster_formation.etcd.endpoints.1 = one.etcd.eng.example.local:2379
```

It is possible to configure multiple etcd endpoints. The first randomly
chosen one that the plugin can successfully connect to will be used.

```ini
cluster_formation.peer_discovery_backend = etcd

cluster_formation.etcd.endpoints.1 = one.etcd.eng.example.local:2379
cluster_formation.etcd.endpoints.2 = two.etcd.eng.example.local:2479
cluster_formation.etcd.endpoints.3 = three.etcd.eng.example.local:2579
```

If [authentication is enabled for etcd](https://etcd.io/docs/v3.4.0/op-guide/authentication/), the plugin can be configured to use
a pair of credentials:

```ini
cluster_formation.peer_discovery_backend = etcd

cluster_formation.etcd.endpoints.1 = one.etcd.eng.example.local:2379
cluster_formation.etcd.endpoints.2 = two.etcd.eng.example.local:2479
cluster_formation.etcd.endpoints.3 = three.etcd.eng.example.local:2579

cluster_formation.etcd.username = rabbitmq
cluster_formation.etcd.password = s3kR37
```

It is possible to use [advanced.config](./configure#advanced-config-file) file to [encrypt the password value](./configure#configuration-encryption)
listed in the config. In this case all plugin settings must be moved to the advanced config:

```erlang
%% advanced.config file
[
 {rabbit,
     [{cluster_formation,
          [{peer_discovery_etcd, [
                {endpoints, [
                  "one.etcd.eng.example.local:2379",
                  "two.etcd.eng.example.local:2479",
                  "three.etcd.eng.example.local:2579"
                ]},

                {etcd_prefix,   "rabbitmq"},
                {cluster_name,  "default"},

                {etcd_username, "etcd user"},
                {etcd_password, {encrypted, <<"cPAymwqmMnbPXXRVqVzpxJdrS8mHEKuo2V+3vt1u/fymexD9oztQ2G/oJ4PAaSb2c5N/hRJ2aqP/X0VAfx8xOQ==">>}
                }]
           }]
      }]
 },

  {config_entry_decoder, [
             {passphrase, <<"decryption key passphrase">>}
         ]}
].
```

#### Key Naming

Directories and keys used by the peer discovery mechanism follow a naming scheme.
Since in etcd [v3 API the key space is flat](https://etcd.io/docs/v3.4.0/rfc/v3api/),
a hardcoded prefix is used. It allows the plugin to predictably perform key range queries
using a well-known prefix:

```ini
# for node presence keys
/rabbitmq/discovery/{prefix}/clusters/{cluster name}/nodes/{node name}
```

```ini
# for registration lock keys
/rabbitmq/locks/{prefix}/clusters/{cluster name}/registration
```

Here's an example of a key that would be used by node `rabbit@hostname1`
with default user-provided key prefix and cluster name:

```ini
/rabbitmq/discovery/rabbitmq/clusters/default/nodes/rabbit@hostname1
```

Default key prefix is simply "rabbitmq". It rarely needs overriding but that's
supported:

```ini
cluster_formation.peer_discovery_backend = etcd

cluster_formation.etcd.endpoints.1 = one.etcd.eng.example.local:2379
cluster_formation.etcd.endpoints.2 = two.etcd.eng.example.local:2479
cluster_formation.etcd.endpoints.3 = three.etcd.eng.example.local:2579

# rabbitmq is used by default
cluster_formation.etcd.key_prefix = rabbitmq_discovery
```

If multiple RabbitMQ clusters share an etcd installation, each cluster must use
a unique name:

```ini
cluster_formation.peer_discovery_backend = etcd

cluster_formation.etcd.endpoints.1 = one.etcd.eng.example.local:2379
cluster_formation.etcd.endpoints.2 = two.etcd.eng.example.local:2479
cluster_formation.etcd.endpoints.3 = three.etcd.eng.example.local:2579

# default name: "default"
cluster_formation.etcd.cluster_name = staging
```

#### Key Leases and TTL

Key used for node registration will have a lease with a TTL associated with them.
Online nodes will periodically keep the leases alive (refresh). The TTL value can be configured:

```ini
cluster_formation.peer_discovery_backend = etcd

cluster_formation.etcd.endpoints.1 = one.etcd.eng.example.local:2379
cluster_formation.etcd.endpoints.2 = two.etcd.eng.example.local:2479
cluster_formation.etcd.endpoints.3 = three.etcd.eng.example.local:2579

# node TTL in seconds
# default: 30
cluster_formation.etcd.node_ttl = 40
```

Key leases are updated periodically while the node is running and the plugin
remains enabled.

It is possible to forcefully remove the nodes that fail to refresh their keys from the cluster.
This is covered later in this guide.

#### Locks

When a node tries to acquire a lock on boot and the lock is already taken,
it will wait for the lock to become available for a limited amount of time. Default value is 300
seconds but it can be configured:

```ini
cluster_formation.peer_discovery_backend = etcd

cluster_formation.etcd.endpoints.1 = one.etcd.eng.example.local:2379
cluster_formation.etcd.endpoints.2 = two.etcd.eng.example.local:2479

# lock acquisition timeout in seconds
# default: 300
# cluster_formation.consul.lock_wait_time is an alias
cluster_formation.etcd.lock_timeout = 60
```

#### Inspecting Keys

In order to list all keys used by the etcd-based peer discovery mechanism, use `etcdctl get` like so:

```bash
etcdctl get --prefix=true "/rabbitmq"
```

#### TLS

It is possible to configure the plugin to [use TLS](./ssl) when connecting to etcd.
TLS will be enabled if any of the TLS options listed below are configured, otherwise
connections will use "plain TCP" without TLS.

The plugin acts as a TLS client. A [trusted CA certificate](./ssl#peer-verification) file must
be provided as well as a client certificate and private key pair:

```ini
cluster_formation.peer_discovery_backend = etcd

cluster_formation.etcd.endpoints.1 = one.etcd.eng.example.local:2379
cluster_formation.etcd.endpoints.2 = two.etcd.eng.example.local:2479

# trusted CA certificate file path
cluster_formation.etcd.ssl_options.cacertfile = /path/to/ca_certificate.pem
# client certificate (public key) file path
cluster_formation.etcd.ssl_options.certfile   = /path/to/client_certificate.pem
# client private key file path
cluster_formation.etcd.ssl_options.keyfile    = /path/to/client_key.pem

# use TLSv1.2 for connections
cluster_formation.etcd.ssl_options.versions.1 = tlsv1.2

# enables peer verification (the plugin will verify the certificate chain of the server)
cluster_formation.etcd.ssl_options.verify               = verify_peer
cluster_formation.etcd.ssl_options.fail_if_no_peer_cert = true
```

More [TLS options](./ssl) are supported such as cipher suites and
client-side session renegotiation options:

```ini
cluster_formation.peer_discovery_backend = etcd

cluster_formation.etcd.endpoints.1 = one.etcd.eng.example.local:2379
cluster_formation.etcd.endpoints.2 = two.etcd.eng.example.local:2479

# trusted CA certificate file path
cluster_formation.etcd.ssl_options.cacertfile = /path/to/ca_certificate.pem
# client certificate (public key) file path
cluster_formation.etcd.ssl_options.certfile   = /path/to/client_certificate.pem
# client private key file path
cluster_formation.etcd.ssl_options.keyfile    = /path/to/client_key.pem

# use TLSv1.2 for connections
cluster_formation.etcd.ssl_options.versions.1 = tlsv1.2

# enables peer verification (the plugin will verify the certificate chain of the server)
cluster_formation.etcd.ssl_options.verify               = verify_peer
cluster_formation.etcd.ssl_options.fail_if_no_peer_cert = true

# use secure session renegotiation
cluster_formation.etcd.ssl_options.secure_renegotiate   = true

# Explicitly list enabled cipher suites. This can break connectivity
# and is not necessary most of the time.
cluster_formation.etcd.ssl_options.ciphers.1  = ECDHE-ECDSA-AES256-GCM-SHA384
cluster_formation.etcd.ssl_options.ciphers.2  = ECDHE-RSA-AES256-GCM-SHA384
cluster_formation.etcd.ssl_options.ciphers.3  = ECDH-ECDSA-AES256-GCM-SHA384
cluster_formation.etcd.ssl_options.ciphers.4  = ECDH-RSA-AES256-GCM-SHA384
cluster_formation.etcd.ssl_options.ciphers.5  = DHE-RSA-AES256-GCM-SHA384
cluster_formation.etcd.ssl_options.ciphers.6  = DHE-DSS-AES256-GCM-SHA384
cluster_formation.etcd.ssl_options.ciphers.7  = ECDHE-ECDSA-AES128-GCM-SHA256
cluster_formation.etcd.ssl_options.ciphers.8  = ECDHE-RSA-AES128-GCM-SHA256
cluster_formation.etcd.ssl_options.ciphers.9  = ECDH-ECDSA-AES128-GCM-SHA256
cluster_formation.etcd.ssl_options.ciphers.10 = ECDH-RSA-AES128-GCM-SHA256
cluster_formation.etcd.ssl_options.ciphers.11 = DHE-RSA-AES128-GCM-SHA256
cluster_formation.etcd.ssl_options.ciphers.12 = DHE-DSS-AES128-GCM-SHA256
```


## Race Conditions During Initial Cluster Formation {#initial-formation-race-condition}

For successful cluster formation, only one node should form the cluster initially, that is,
start as a standalone node and initializing its database. If this was not the case, multiple
clusters would be formed instead of just one, violating operator expectations.

Consider a deployment where the entire cluster is provisioned at once and all nodes start in parallel.
In this case, a natural race condition occurs between the starting nodes.
To prevent multiple nodes forming separate clusters, peer discovery backends try to acquire a lock when either
forming the cluster (seeding) or joining a peer. What locks are used varies from backend to backend:

 * Classic config file, K8s, and AWS backends use a built-in [locking library](https://erlang.org/doc/man/global.html#set_lock-3) provided by the runtime
 * The Consul peer discovery backend sets a lock in Consul
 * The etcd peer discovery backend sets a lock in etcd

## Node Health Checks and Forced Removal {#node-health-checks-and-cleanup}

Nodes in clusters formed using peer discovery can fail, become unavailable or be permanently
removed (decommissioned). Some operators may want such nodes to be automatically removed
from the cluster after a period of time. Such automated forced removal also can produce
unforeseen side effects, so RabbitMQ does not enforce this behavior. It **should be used
with great care** and only if the side effects are fully understood and considered.

For example, consider a cluster that uses the AWS backend configured to use autoscaling group membership.
If an EC2 instance in that group fails and is later re-created as a new node, its original "incarnation"
will be considered a separate, now permanently unavailable node in the same cluster.

With peer discovery backends that offer dynamic node management (as opposed to, say, a fixed list of nodes
in the configuration file), such unknown nodes can be logged or forcefully removed from the cluster.

They are

 * [AWS (EC2)](#peer-discovery-aws)
 * [Kubernetes](#peer-discovery-k8s)
 * [Consul](#peer-discovery-consul)
 * [etcd](#peer-discovery-etcd)

Forced node removal can be dangerous and should be carefully considered. For example,
a node that's temporarily unavailable but will be rejoining (or recreated with its
persistent storage re-attached from its previous incarnation) can be kicked
out of the cluster permanently by automatic cleanup, thus failing to rejoin.

Before enabling the configuration keys covered below make sure that a compatible
peer discovery plugin is enabled. If that's not the case the node will report
the settings to be unknown and will fail to start.

To log warnings for the unknown nodes,
`cluster_formation.node_cleanup.only_log_warning` should be set to
`true`:

```ini
# Don't remove cluster members unknown to the peer discovery backend but log
# warnings.
#
# This setting can only be used if a compatible peer discovery plugin is enabled.
cluster_formation.node_cleanup.only_log_warning = true
```

This is the default behavior.

To forcefully delete the unknown nodes from the cluster,
`cluster_formation.node_cleanup.only_log_warning` should be set to
`false`.

```ini
# Forcefully remove cluster members unknown to the peer discovery backend. Once removed,
# the nodes won't be able to rejoin. Use this mode with great care!
#
# This setting can only be used if a compatible peer discovery plugin is enabled.
cluster_formation.node_cleanup.only_log_warning = false
```

Note that this option should be used with care, in particular
with discovery backends other than AWS.

The cleanup checks are performed periodically. The interval is 60 seconds
by default and can be overridden:

```ini
# perform the check every 90 seconds
cluster_formation.node_cleanup.interval = 90
```

Some backends (Consul, etcd) support node health checks or TTL. These checks
should not to be confused with [monitoring health checks](./monitoring#health-checks).
They allow peer discovery services (such as etcd or Consul) keep track of what
nodes are still around (have checked in recently).

With service discovery health checks, nodes set a TTL on their keys and/or periodically
notify their respective discovery service that they are still present. If no notifications
from a node come in after a period of time, the node's key will eventually expire (with
Consul, such nodes will be considered to be in a warning state).

With etcd, such nodes will no longer show up in discovery results. With Consul,
they can either be removed (deregistered) or their warning state can be
reported. Please see documentation for those backends to learn more.

Automatic cleanup of absent nodes makes most sense in environments where failed/discontinued nodes
will be replaced with brand new ones (including cases when persistent storage won't be re-attached).

When automatic node cleanup is deactivated (switched to the warning mode), operators have to
explicitly remove absent cluster nodes using [`rabbitmqctl forget_cluster_node`](./cli).

### Negative Side Effects of Automatic Removal

Automatic node removal has a number of negative side effects operators should be aware of.
A node that's temporarily unreachable, for example, because it's lost connectivity
to the rest of the network or its VM was temporarily suspended, will be removed and will
then come back. Such node won't be able to [rejoin its cluster](#rejoining) and will
log a similar message:

```
Node 'rabbit@node1.local' thinks it's clustered with node 'rabbit@node2.local', but 'rabbit@node2.local' disagrees
```

In addition, such nodes can begin to fail their [monitoring health checks](./monitoring#health-checks),
as they would be in a permanent "partitioned off" state. Even though such nodes might have been
replaced with a new one and the cluster would be operating as expected, such automatically removed
and replaced nodes can produce monitoring false positives.

The list of side effects is not limited to those two scenarios but they all have the same
root cause: an automatically removed node can come back without realising that it's been kicked out
of its cluster. Monitoring systems and operators won't be immediately aware of that event either.

## Peer Discovery Failures and Retries {#discovery-retries}

In latest releases if a peer discovery attempt fail, it will be retried up to a certain number
of times with a delay between each attempt. This is similar to the peer sync retries nodes
perform [when they come online after a restart](./clustering#restarting).

For example, with the [Kubernetes peer discovery mechanism](#peer-discovery-k8s) this means that
Kubernetes API requests that list pods will be retried should they fail. With the AWS mechanism,
EC2 API requests are retried, and so on.

Such retries by no means handle every possible failure scenario but they improve the resilience
of peer discovery and thus cluster and node deployments in practice. However, if clustered
nodes [fail to authenticate](./clustering#erlang-cookie) with each other, retries
will simply merely the inevitable failure of cluster formation.

Nodes that fail to perform peer discovery will [log](./logging) their remaining recovery attempts:

```
2020-06-27 06:35:36.426 [error] <0.277.0> Trying to join discovered peers failed. Will retry after a delay of 500 ms, 4 retries left...
2020-06-27 06:35:36.928 [warning] <0.277.0> Could not auto-cluster with node rabbit@hostname2: {badrpc,nodedown}
2020-06-27 06:35:36.930 [warning] <0.277.0> Could not auto-cluster with node rabbit@hostname3: {badrpc,nodedown}
2020-06-27 06:35:36.930 [error] <0.277.0> Trying to join discovered peers failed. Will retry after a delay of 500 ms, 3 retries left...
2020-06-27 06:35:37.432 [warning] <0.277.0> Could not auto-cluster with node rabbit@hostname2: {badrpc,nodedown}
2020-06-27 06:35:37.434 [warning] <0.277.0> Could not auto-cluster with node rabbit@hostname3: {badrpc,nodedown}
```

If a node fails to perform peer discovery and exhausts all retries, [enable debug logging](./logging#debug-logging) is highly recommended for [troubleshooting](#troubleshooting).

The number of retries and the delay can be configured:

```ini
# These are the default values

# Retry peer discovery operations up to ten times
cluster_formation.discovery_retry_limit = 10

# 500 milliseconds
cluster_formation.discovery_retry_interval = 500
```

The defaults cover five seconds of unavailability of services, API endpoints or nodes
involved in peer discovery. These values are sufficient to cover sporadic failures.
They will require increasing in environments where dependent services (DNS, etcd, Consul, etc)
may be provisioned concurrently with RabbitMQ cluster deployment and thus can become
available only after a period of time.


## HTTP Proxy Settings {#http-proxy-settings}

Peer discovery mechanisms that use HTTP to interact with its dependencies (e.g. AWS, Consul
and etcd ones) can proxy their requests using an HTTP proxy.

There are separate proxy settings for HTTP and HTTPS:

```ini
# example HTTP and HTTPS proxy servers, values in your environment
# will vary
cluster_formation.proxy.http_proxy = 192.168.0.98
cluster_formation.proxy.https_proxy = 192.168.0.98
```

Some hosts can be excluded from proxying, e.g. the link-local AWS instance metadata
IP address:

```ini
# example HTTP and HTTPS proxy servers, values in your environment
# will vary
cluster_formation.proxy.http_proxy = 192.168.0.98
cluster_formation.proxy.https_proxy = 192.168.0.98

# requests to these hosts won't go via proxy
cluster_formation.proxy.proxy_exclusions.1 = 169.254.169.254
cluster_formation.proxy.proxy_exclusions.2 = excluded.example.local
```


## Troubleshooting {#troubleshooting}

The peer discovery subsystem and individual mechanism implementations log important
discovery procedure steps at the `info` log level. More extensive logging
is available at the `debug` level. Mechanisms that depend on external services
accessible over HTTP will log all outgoing HTTP requests and response codes at `debug` level.
See the [logging guide](./logging) for more information about logging configuration.

If the log does not contain any entries that demonstrate peer discovery progress, for example, the list
of nodes retrieved by the mechanism or clustering attempts, it may mean that the node already has
an initialised data directory or is already a member of the cluster. In those cases peer discovery
won't be performed.

Peer discovery relies on inter-node network connectivity and successful authentication via a shared
secret. Verifying that nodes can communicate with one another and use the expected Erlang cookie value (that's also identical across all cluster nodes).
See the main [Clustering guide](./clustering) for more information.

A methodology for network connectivity troubleshooting as well as commonly used
tools are covered in the [Troubleshooting Network Connectivity](./troubleshooting-networking) guide.
