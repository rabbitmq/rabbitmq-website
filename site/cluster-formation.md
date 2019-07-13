<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers various automation-oriented cluster formation and
peer discovery features. For a general overview of RabbitMQ clustering,
please refer to the [Clustering Guide](/clustering.html).

This guide assumes general familiarity with [RabbitMQ clustering](/clustering.html)
and focuses on the peer discovery subsystem.
For example, it will not cover what [ports must be open](/networking.html) for inter-node communication, how nodes authenticate to each other, and so on.
Besides discovery mechanisms and [their configuration](#configuring),
this guide also covers a closely related topic of [rejoining nodes](#rejoining),
the problem of [initial cluster formation](#initial-formation-race-condition) with nodes booting in parallel as well as [additional health checks](#node-health-checks-and-cleanup) offered
by some discovery implementations.

The guide also covers the basics of [peer discovery troubleshooting](#troubleshooting-cluster-formation).

## <a id="peer-discovery" class="anchor" href="#peer-discovery">What is Peer Discovery?</a>

To form a cluster, new ("blank") nodes need to be able to discover
their peers. This can be done using a variety of mechanisms (backends).
Some mechanisms assume all cluster members are known ahead of time (for example, listed
in the config file), others are dynamic (nodes can come and go).

All peer discovery mechanisms assume that newly joining nodes will be able to
contact their peers in the cluster and authenticate with them successfully.
The mechanisms that rely on an external service (e.g. DNS or Consul) or API (e.g. AWS or Kubernetes)
require the service(s) to be available and reachable over HTTP(S) on their standard ports.
Inability to reach the service will lead to node's inability to join the cluster.


### <a id="peer-discovery-plugins" class="anchor" href="#peer-discovery-plugins">Available Discovery Mechanisms</a>

The following mechanisms are built into the core and always available:

 * [Config file](#peer-discovery-classic-config)
 * [Pre-configured DNS A/AAAA records](#peer-discovery-dns)

Additional peer discovery mechanisms are available via plugins. The following
peer discovery plugins ship with RabbitMQ as of 3.7.0:

 * [AWS (EC2)](#peer-discovery-aws)
 * [Kubernetes](#peer-discovery-k8s)
 * [Consul](#peer-discovery-consul)
 * [etcd](#peer-discovery-etcd)

The above plugins do not need to be installed but like all [plugins](/plugins.html) they do need
to be enabled before node start using [rabbitmq-plugins](/cli.html)' `--offline` mode:

<pre class="lang-ini">
rabbitmq-plugins --offline enable [plugin name]
</pre>

A node with configuration settings that belong a non-enabled peer discovery plugin will fail
to start and report those settings as unknown.

### <a id="peer-discovery-configuring-mechanism" class="anchor" href="#peer-discovery-configuring-mechanism">Specifying the Peer Discovery Mechanism</a>

The discovery mechanism to use is specified in the [config file](/configure.html),
as are various mechanism-specific settings, for example, discovery service hostnames, credentials, and so
on. `cluster_formation.peer_discovery_backend` is the key
that controls what discovery module (implementation) is used:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config
</pre>

The module has to implement the [rabbit_peer_discovery_backend](https://github.com/rabbitmq/rabbitmq-common/blob/master/src/rabbit_peer_discovery_backend.erl)
behaviour. Plugins therefore can introduce their own discovery
mechanisms.

### <a id="peer-discovery-how-does-it-work" class="anchor" href="#peer-discovery-how-does-it-work">How Peer Discovery Works</a>

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

When a cluster is first formed and there are no registered nodes yet,
a natural race condition between booting
nodes occurs. Different backends [address this problem](#initial-formation-race-condition)
differently: some try to acquire a lock with an external service, others rely on randomized
delays. This problem does not apply to the backends that require listing all nodes ahead of time.

When the configured backend supports registration, nodes unregister when they stop.

If peer discovery isn't configured, or it fails, or no peers are reachable,
a node that wasn't a cluster member in the past
will initialise from scratch and proceed as a standalone node.

If a node previously was a cluster member, it will try to contact
its "last seen" peer for a period of time. In this case, no peer discovery
will be performed. This is true for all backends.


## <a id="rejoining" class="anchor" href="#rejoining">Nodes Rejoining Their Existing Cluster</a>

A new node joining a cluster is just one possible case. Another common scenario
is when an existing cluster member temporarily leaves and then rejoins the cluster.
While the peer discovery subsystem does not affect the behavior described in this section,
it important to understand how nodes behave when they rejoin their cluster after a restart or failure.

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
there two sides will disagree and the node will fail to join. Such reset nodes must also be
removed from the cluster using [rabbitmqctl forget_cluster_node](/cli.html) executed against
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

<pre class="sourcecode">
Node 'rabbit@node1.local' thinks it's clustered with node 'rabbit@node2.local', but 'rabbit@node2.local' disagrees
</pre>

In this case B can be reset again and then will be able to join A, or A
can be reset and will successfully join B.


## <a id="configuring" class="anchor" href="#configuring">How to Configure Peer Discovery</a>

Peer discovery plugins are configured just like the core server and other
plugins: using a [config file](/configure.html).

`cluster_formation.peer_discovery_backend` is the key that [controls what
peer discovery backend will be used](#peer-discovery-configuring-mechanism). Each backend will also have a number of
configuration settings specific to it. The rest of the guide will cover configurable settings specific to a particular mechanism
as well as provide examples for each one.

Environment variables can also be used to configure several mechanisms for easier
migration from `rabbitmq-autocluster`. This method is highly discouraged,
however: using environment variables is more error prone compared to the config file,
and it is harder to [verify effective configuration](/configure.html#verify-configuration-effective-configuration).
Only those [migrating](/upgrade.html) clusters that use `rabbitmq-autocluster` should
use environment variables for peer discoveery configuration, this guide leaves them out. Variable
names are the same as used by `rabbitmq-autocluster`.


## <a id="peer-discovery-classic-config" class="anchor" href="#peer-discovery-classic-config">Config File Peer Discovery Backend</a>

The most basic way for a node to discover its cluster peers is to read a list
of nodes from the config file.

This is done using the `cluster_formation.classic_config.nodes` config setting.

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config

cluster_formation.classic_config.nodes.1 = rabbit@hostname1.eng.example.local
cluster_formation.classic_config.nodes.2 = rabbit@hostname2.eng.example.local
</pre>

The following example demonstrates the same configuration in
the [classic config format](/configure.html#config-file-formats). The 2nd member of the
`rabbit.cluster_nodes` tuple is the node type to
use for the current node. In the vast majority of cases all
nodes should be `disc` nodes.

<pre class="lang-erlang">
[
 {rabbit, [
           {cluster_nodes, {['rabbit@hostname1.eng.example.local',
                             'rabbit@hostname2.eng.example.local'], disc}}
          ]}
].
</pre>

## <a id="peer-discovery-dns" class="anchor" href="#peer-discovery-dns">DNS Peer Discovery Backend</a>

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

The seed hostname is set using the `cluster_formation.dns.hostname` config setting:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_dns

cluster_formation.dns.hostname = discovery.eng.example.local
</pre>


## <a id="peer-discovery-aws" class="anchor" href="#peer-discovery-aws">Peer Discovery on AWS (EC2)</a>

An [AWS (EC2)-specific](https://github.com/rabbitmq/rabbitmq-peer-discovery-aws) discovery mechanism
is available via a plugin. It provides two ways for a node to discover its peers:

 * Using EC2 instance tags
 * Using AWS autoscaling group membership

Both methods rely on AWS-specific APIs (endpoints) and features and thus cannot work in
other IaaS environments. Once a list of cluster member instances is retrieved,
final node names are computed using instance hostnames or IP addresses.

When the AWS peer discovery mechanism is used, nodes will
delay their startup for a randomly picked value to reduce the
probability of a [race condition during initial cluster formation](#initial-formation-race-condition).

### <a id="peer-discovery-aws-credentials" class="anchor" href="#peer-discovery-aws-credentials">Configuration and Credentials</a>

Before a node can perform any operations on AWS, it needs to have a set of
AWS account credentials configured. This can be done in a couple of ways:

1. Via [config file](/configure.html)
2. Using environment variables

[EC2 Instance Metadata service](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) for the region will also be consulted.

The following example snippet configures RabbitMQ to use the AWS peer discovery
backend and provides information about AWS region as well as a set of credentials:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY
</pre>

If region is left unconfigured, `us-east-1` will be used by default.
Sensitive values in configuration file can optionally [be encrypted](/configure.html#configuration-encryption).

If an [IAM role is assigned to EC2 instances](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html) running RabbitMQ nodes,
a policy has to be used to [allow said instances use EC2 Instance Metadata Service](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html).
When the plugin is configured to use Autoscaling group members,
a policy has to [grant access to describe autoscaling group members](https://docs.aws.amazon.com/autoscaling/ec2/userguide/control-access-using-iam.html) (instances).
Below is an example of a policy that covers both use cases:

<pre class="lang-json">
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
</pre>

### <a id="peer-discovery-aws-autoscaling-group-membership" class="anchor" href="#peer-discovery-aws-autoscaling-group-membership">Using Autoscaling Group Membership</a>

When autoscaling-based peer discovery is used, current node's EC2 instance autoscaling
group members will be listed and used to produce the list of discovered peers.

To use autoscaling group membership, set the `cluster_formation.aws.use_autoscaling_group` key
to `true`:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY

cluster_formation.aws.use_autoscaling_group = true
</pre>

### <a id="peer-discovery-aws-tags" class="anchor" href="#peer-discovery-aws-tags">Using EC2 Instance Tags</a>

When tags-based peer discovery is used, the plugin will list EC2 instances
using EC2 API and filter them by configured instance tags. Resulting instance set
will be used to produce the list of discovered peers.

Tags are configured using the `cluster_formation.aws.instance_tags` key. The example
below uses three tags: `region`, `service`, and `environment`.

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY

cluster_formation.aws.instance_tags.region = us-east-1
cluster_formation.aws.instance_tags.service = rabbitmq
cluster_formation.aws.instance_tags.environment = staging
</pre>

### <a id="peer-discovery-aws-other-settings" class="anchor" href="#peer-discovery-aws-other-settings">Using Private EC2 Instance IPs</a>

By default peer discovery will use private DNS hostnames to compute node names.
It is possible to opt into using private IPs instead by setting
the `cluster_formation.aws.use_private_ip` key to `true`:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY

cluster_formation.aws.use_autoscaling_group = true
cluster_formation.aws.use_private_ip = true
</pre>


## <a id="peer-discovery-k8s" class="anchor" href="#peer-discovery-k8s">Peer Discovery on Kubernetes</a>

A [Kubernetes](https://kubernetes.io/)-based discovery mechanism
is available via [a plugin](https://github.com/rabbitmq/rabbitmq-peer-discovery-k8s).

With this mechanism, nodes fetch a list of their peers from
the Kubernetes API endpoint using a set of configured values:
a URI scheme, host, port, as as well as the token and
certificate paths.

It is highly recommended that RabbitMQ clusters are deployed using a [stateful set](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/#statefulset). If a stateless set is used recreated nodes will not have their persisted data and will start as blank nodes.
This can lead to data loss and higher network traffic volume due to more frequent
[eager synchronisation](ha.html) of newly joining nodes. Stateless sets are also
prone to the [natural race condition](#initial-formation-race-condition) during initial
cluster formation, unlike stateful sets that initialise pods [one by one](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/#understanding-stateful-pod-initialization).

To use Kubernetes for peer discovery, set the `cluster_formation.peer_discovery_backend`
to `rabbit_peer_discovery_k8s`:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s

# Kubernetes API hostname (or IP address). Default value is kubernetes.default.svc.cluster.local
cluster_formation.k8s.host = kubernetes.default.example.local
</pre>

It is possible to configure Kubernetes API port and URI scheme:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s

cluster_formation.k8s.host = kubernetes.default.example.local
# 443 is used by default
cluster_formation.k8s.port = 443
# https is used by default
cluster_formation.k8s.scheme = https
</pre>

Kubernetes token file path is configurable via `cluster_formation.k8s.token_path`:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s

cluster_formation.k8s.host = kubernetes.default.example.local
# default value is /var/run/secrets/kubernetes.io/serviceaccount/token
cluster_formation.k8s.token_path = /var/run/secrets/kubernetes.io/serviceaccount/token
</pre>

It must point to a local file that exists and is readable by RabbitMQ.

Certificate and namespace paths use `cluster_formation.k8s.cert_path`
and `cluster_formation.k8s.namespace_path`, respectively:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s

cluster_formation.k8s.host = kubernetes.default.example.local
# default value is /var/run/secrets/kubernetes.io/serviceaccount/token
cluster_formation.k8s.token_path = /var/run/secrets/kubernetes.io/serviceaccount/token

# default value is /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
cluster_formation.k8s.cert_path = /var/run/secrets/kubernetes.io/serviceaccount/ca.crt

# default value is /var/run/secrets/kubernetes.io/serviceaccount/namespace
cluster_formation.k8s.namespace_path = /var/run/secrets/kubernetes.io/serviceaccount/namespace
</pre>

Just like with the token path key both must point to a local
file that exists and is readable by RabbitMQ.

When a list of peer nodes is computed from a list of pod containers returned by Kubernetes,
either hostnames or IP addresses can be used. This is configurable using the
`cluster_formation.k8s.address_type` key:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s

cluster_formation.k8s.host = kubernetes.default.example.local

cluster_formation.k8s.token_path = /var/run/secrets/kubernetes.io/serviceaccount/token
cluster_formation.k8s.cert_path = /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
cluster_formation.k8s.namespace_path = /var/run/secrets/kubernetes.io/serviceaccount/namespace

# should result set use hostnames or IP addresses
# of Kubernetes API-reported containers?
# supported values are "hostname" and "ip"
cluster_formation.k8s.address_type = hostname
</pre>

Supported values are `ip` or `hostname`. `hostname` is
the recommended option but has limitations: it can only be used with [stateful sets](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/#statefulset) (also highly recommended)
and [headless services](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services).
`ip` is used by default for better compatibility.

It is possible to append a suffix to peer hostnames returned by Kubernetes using
`cluster_formation.k8s.hostname_suffix`:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s

cluster_formation.k8s.host = kubernetes.default.example.local

cluster_formation.k8s.token_path = /var/run/secrets/kubernetes.io/serviceaccount/token
cluster_formation.k8s.cert_path = /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
cluster_formation.k8s.namespace_path = /var/run/secrets/kubernetes.io/serviceaccount/namespace

# no suffix is appended by default
cluster_formation.k8s.hostname_suffix = rmq.eng.example.local
</pre>

Service name is `rabbitmq` by default but can be overridden using the
`cluster_formation.k8s.service_name` key if needed:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s

cluster_formation.k8s.host = kubernetes.default.example.local

cluster_formation.k8s.token_path = /var/run/secrets/kubernetes.io/serviceaccount/token
cluster_formation.k8s.cert_path = /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
cluster_formation.k8s.namespace_path = /var/run/secrets/kubernetes.io/serviceaccount/namespace

# overrides Kubernetes service name. Default value is "rabbitmq".
cluster_formation.k8s.service_name = rmq-qa
</pre>

As mentioned above, stateful sets is the recommended way of running RabbitMQ on Kubernetes.
Stateful set pods are initialised one at a time. That effectively addresses
the natural [race condition during the initial cluster formation](#initial-formation-race-condition).
Randomized startup delay in such scenarios can use a significantly lower delay value range (e.g. 0 to 1 second):

<pre class="lang-ini">
cluster_formation.randomized_startup_delay_range.min = 0
cluster_formation.randomized_startup_delay_range.max = 2

cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s

cluster_formation.k8s.host = kubernetes.default.example.local

# ...
</pre>


## <a id="peer-discovery-consul" class="anchor" href="#peer-discovery-consul">Peer Discovery Using Consul</a>

A [Consul](https://www.consul.io)-based discovery mechanism
is available via [a plugin](https://github.com/rabbitmq/rabbitmq-peer-discovery-consul).
Consul 0.8.0 and later versions are supported.

Nodes register with Consul on boot and unregister when they
leave. Prior to registration, nodes will attempt to acquire a
lock in Consul to reduce the probability of a [race condition
during initial cluster formation](#initial-formation-race-condition).
When a node registers with Consul, it will set up a periodic [health
check](https://www.consul.io/docs/agent/checks.html) for itself (more on this below).

To use Consul for peer discovery, set the `cluster_formation.peer_discovery_backend` to
to `rabbit_peer_discovery_consul`:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

# Consul host (hostname or IP address). Default value is localhost
cluster_formation.consul.host = consul.eng.example.local
</pre>

It is possible to configure Consul port and URI scheme:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local
# 8500 is used by default
cluster_formation.consul.port = 8500
# http is used by default
cluster_formation.consul.scheme = http
</pre>

To configure [Consul ACL](https://www.consul.io/docs/guides/acl.html) token,
use :

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local
cluster_formation.consul.acl_token = acl-token-value
</pre>

Service name (as registered in Consul) defaults to "rabbitmq" but can be overridden:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local
# rabbitmq is used by default
cluster_formation.consul.svc = rabbitmq
</pre>

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

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local

cluster_formation.consul.svc = rabbitmq
# do not compute service address, it will be specified below
cluster_formation.consul.svc_addr_auto = false
# service address, will be communicated to other nodes
cluster_formation.consul.svc_addr = hostname1.rmq.eng.example.local
# use long RabbitMQ node names?
cluster_formation.consul.use_longname = true
</pre>

In this example, the service address reported to Consul is
parsed from node name (the `rabbit@` prefix will be dropped):

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local

cluster_formation.consul.svc = rabbitmq
# do compute service address
cluster_formation.consul.svc_addr_auto = true
# compute service address using node name
cluster_formation.consul.svc_addr_use_nodename = true
# use long RabbitMQ node names?
cluster_formation.consul.use_longname = true
</pre>

`cluster_formation.consul.svc_addr_use_nodename` is a boolean
field that instructs Consul peer discovery backend to compute service address
using RabbitMQ node name.

In the next example, the service address is
computed using hostname as reported by the OS instead of node name:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local

cluster_formation.consul.svc = rabbitmq
# do compute service address
cluster_formation.consul.svc_addr_auto = true
# compute service address using host name and not node name
cluster_formation.consul.svc_addr_use_nodename = false
# use long RabbitMQ node names?
cluster_formation.consul.use_longname = true
</pre>

In the example below, the service address is
computed by taking the IP address of a provided NIC, `en0`:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local

cluster_formation.consul.svc = rabbitmq
# do compute service address
cluster_formation.consul.svc_addr_auto = true
# compute service address using the IP address of a NIC, en0
cluster_formation.consul.svc_addr_nic = en0
cluster_formation.consul.svc_addr_use_nodename = false
# use long RabbitMQ node names?
cluster_formation.consul.use_longname = true
</pre>

Service port as registered in Consul can be overridden. This is only
necessary if RabbitMQ uses a [non-standard port](/networking.html)
for client (technically AMQP 0-9-1 and AMQP 1.0) connections since default value is 5672.

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local
# 5672 is used by default
cluster_formation.consul.svc_port = 6674
</pre>

When a node registers with Consul, it will set up a periodic [health
check](https://www.consul.io/docs/agent/checks.html) for itself. Online nodes will periodically send a health check update to Consul to indicate the service
is available. This interval can be configured:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local
# health check interval (node TTL) in seconds
# default: 30
cluster_formation.consul.svc_ttl = 40
</pre>

A node that failed its [health
check](https://www.consul.io/docs/agent/checks.html) is considered to be in the warning state by Consul.
Such nodes can be automatically unregistered by Consul after a
period of time (note: this is a separate interval value from
the TTL above). The period cannot be less than 60 seconds.

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local
# health check interval (node TTL) in seconds
cluster_formation.consul.svc_ttl = 30
# how soon should nodes that fail their health checks be unregistered by Consul?
# this value is in seconds and must not be lower than 60 (a Consul requirement)
cluster_formation.consul.deregister_after = 90
</pre>

Please see a section on [automatic cleanup of nodes](#node-health-checks-and-cleanup) below.

Nodes in the warning state are excluded from peer discovery results
by default. It is possible to opt into including them by setting
`cluster_formation.consul.include_nodes_with_warnings` to
`true`:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local
# health check interval (node TTL) in seconds
cluster_formation.consul.svc_ttl = 30
# include node in the warning state into discovery result set
cluster_formation.consul.include_nodes_with_warnings = true
</pre>

If node name is computed and long node names are used, it is possible to
append a suffix to node names retrieved from Consul. The format is
<em>.node.{domain_suffix}</em>. This can be useful in environments with
DNS conventions, e.g. when all service nodes
are organised in a separate subdomain. Here's an example:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

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
</pre>

With this setup node names will be computed to `rabbit@192.168.100.1.node.example.local`
instead of `rabbit@192.168.100.1`.

When a node tries to acquire a lock on boot and the lock is already taken,
it will wait for the lock to become available for a limited amount of time. Default value is 300
seconds but it can be configured:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local
# lock acquisition timeout in seconds
# default: 300
# cluster_formation.consul.lock_wait_time is an alias
cluster_formation.consul.lock_timeout = 60
</pre>

Lock key prefix is `rabbitmq` by default. It can also be overridden:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_consul

cluster_formation.consul.host = consul.eng.example.local
cluster_formation.consul.lock_timeout = 60
# should the Consul key used for locking be prefixed with something
# other than "rabbitmq"?
cluster_formation.consul.lock_prefix = environments-qa
</pre>


## <a id="peer-discovery-etcd" class="anchor" href="#peer-discovery-etcd">Peer Discovery Using Etcd</a>

An [etcd](https://coreos.com/etcd)-based discovery mechanism
is available via [a plugin](https://github.com/rabbitmq/rabbitmq-peer-discovery-etcd). etcd v3 and v2 are supported.

Nodes register with etcd on boot by creating a key in a conventionally named directory. The keys have
a short (say, a minute) expiration period. The keys are deleted when nodes stop cleanly.
Prior to registration, nodes will attempt to acquire a
lock in etcd to reduce the probability of a [race condition
during initial cluster formation](#initial-formation-race-condition).

Nodes contact etcd periodically to refresh
their keys. Those that haven't done so in a configurable
period of time (node TTL) are cleaned up from etcd.  If
configured, such nodes can be forcefully removed from the
cluster.

To use etcd for peer discovery, set the `cluster_formation.peer_discovery_backend`
to `rabbit_peer_discovery_etcd` and provide an etcd node hostname for the plugin
to connect to:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_etcd

# etcd host (hostname or IP address). This property is required or peer discovery won't be performed.
cluster_formation.etcd.host = etcd.eng.example.local
</pre>

It is possible to configure etcd port and URI scheme:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_etcd

cluster_formation.etcd.host = etcd.eng.example.local
# 2379 is used by default
cluster_formation.etcd.port = 2379
# http is used by default
cluster_formation.etcd.scheme = http
</pre>

Directories and keys used by the peer discovery mechanism follow a naming scheme:

<pre class="lang-ini">/v2/keys/{key_prefix}/{cluster_name}/nodes/{node_name}</pre>

Here's an example of a key that would be used by node `rabbit@hostname1`
with default key prefix and cluster name:

<pre class="lang-ini">/v2/keys/rabbitmq/default/nodes/rabbit@hostname1</pre>

Default key prefix is simply "rabbitmq". It rarely needs overriding but that's
supported:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_etcd

cluster_formation.etcd.host = etcd.eng.example.local
# rabbitmq is used by default
cluster_formation.etcd.key_prefix = rabbitmq_discovery
</pre>

If multiple RabbitMQ clusters share an etcd installation, each cluster must use
a unique name:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_etcd

cluster_formation.etcd.host = etcd.eng.example.local
# default name: "default"
cluster_formation.etcd.cluster_name = staging
</pre>

Key used for node registration will have a TTL interval set for them. Online nodes
will periodically refresh their key(s). The TTL value can be configured:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_etcd

cluster_formation.etcd.host = etcd.eng.example.local
# node TTL in seconds
# default: 30
cluster_formation.etcd.node_ttl = 40
</pre>

Key refreshes will be performed every `TTL/2` seconds.
It is possible to forcefully remove the nodes that fail to refresh their keys from the cluster.
This is covered later in this guide.

When a node tries to acquire a lock on boot and the lock is already taken,
it will wait for the lock to become available for a limited amount of time. Default value is 300
seconds but it can be configured:

<pre class="lang-ini">
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_etcd

cluster_formation.etcd.host = etcd.eng.example.local
# lock acquisition timeout in seconds
# default: 300
# cluster_formation.consul.lock_wait_time is an alias
cluster_formation.etcd.lock_timeout = 60
</pre>


## <a id="initial-formation-race-condition" class="anchor" href="#initial-formation-race-condition">Race Conditions During Initial Cluster Formation</a>

Consider a deployment where the entire cluster is provisioned at once and all nodes
start in parallel. In this case there's a natural race
condition between node registration and more than one node
can become "first to register" (discovers no existing peers
and thus starts as standalone).

Different peer discovery backends use different approaches to
minimize the probability of such scenario. Some use locking
(etcd, Consul), others use a technique known as randomized startup delay.
With randomized startup delay nodes will delay their startup
for a randomly picked value (between 5 and 60 seconds by default).

Some backends (config file, DNS) rely on a pre-configured set of peers and avoid
the issue that way.

Effective delay interval, if used, is logged on node boot.

Lastly, some mechanism rely on ordered node startup provided by the underlying
provisioning and orchestration tool. [Kubernetes stateful sets](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/#understanding-stateful-pod-initialization) is one example of an environment that offers such a guarantee.


## <a id="node-health-checks-and-cleanup" class="anchor" href="#node-health-checks-and-cleanup">Node Health Checks and Forced Removal</a>

Sometimes a node is a cluster member but not known to the discovery backend.
For example, consider a cluster that uses the AWS backend configured to use autoscaling group membership.
If an EC2 instance in that group fails and is later re-created, it will be considered
an unavailable node in the RabbitMQ cluster. With some peer discovery backends
such unknown nodes can be logged or forcefully removed from the cluster.
They are

<ul class="plain">
  <li>[AWS (EC2)](#peer-discovery-aws)</li>
  <li>[Kubernetes](#peer-discovery-k8s)</li>
  <li>[Consul](#peer-discovery-consul)</li>
  <li>[etcd](#peer-discovery-etcd)</li>
</ul>

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

<pre class="lang-ini">
# Don't remove cluster members unknown to the peer discovery backend but log
# warnings.
#
# This setting can only be used if a compatible peer discovery plugin is enabled.
cluster_formation.node_cleanup.only_log_warning = true
</pre>

This is the default behavior.

To forcefully delete the unknown nodes from the cluster,
`cluster_formation.node_cleanup.only_log_warning` should be set to
`false`.

<pre class="lang-ini">
# Forcefully remove cluster members unknown to the peer discovery backend. Once removed,
# the nodes won't be able to rejoin. Use this mode with great care!
#
# This setting can only be used if a compatible peer discovery plugin is enabled.
cluster_formation.node_cleanup.only_log_warning = false
</pre>

Note that this option should be used with care, in particular
with discovery backends other than AWS.

Some backends (Consul, etcd) support node health checks (or TTL).
Nodes periodically notify their respective discovery service (e.g. Consul)
that they are still available. If no notifications from a node come
in after a period of time, the node is considered to be in the warning state.
With etcd, such nodes will no longer show up in discovery results. With Consul,
they can either be removed (deregistered) or their warning state can be
reported. Please see documentation for those backends to learn more.

Automatic cleanup of absent nodes makes most sense in environments where failed/discontinued nodes
will be replaced with brand new ones (including cases when persistent storage won't be re-attached).

When automatic node cleanup is disabled (switched to the warning mode), operators have to
explicitly remove absent cluster nodes using [CLI tools](/cli.html).


## <a id="http-proxy-settings" class="anchor" href="#http-proxy-settings">HTTP Proxy Settings</a>

Peer discovery mechanisms that use HTTP to interact with its dependencies (e.g. AWS, Consul
and etcd ones) can proxy their requests using an HTTP proxy.

There are separate proxy settings for HTTP and HTTPS:

<pre class="lang-ini">
# example HTTP and HTTPS proxy servers, values in your environment
# will vary
cluster_formation.proxy.http_proxy = 192.168.0.98
cluster_formation.proxy.https_proxy = 192.168.0.98
</pre>

Some hosts can be excluded from proxying, e.g. the link-local AWS instance metadata
IP address:

<pre class="lang-ini">
# example HTTP and HTTPS proxy servers, values in your environment
# will vary
cluster_formation.proxy.http_proxy = 192.168.0.98
cluster_formation.proxy.https_proxy = 192.168.0.98

# requests to these hosts won't go via proxy
cluster_formation.proxy.proxy_exclusions.1 = 169.254.169.254
cluster_formation.proxy.proxy_exclusions.2 = excluded.example.local
</pre>


## <a id="troubleshooting-cluster-formation" class="anchor" href="#troubleshooting-cluster-formation">Troubleshooting</a>

The peer discovery subsystem and individual mechanism implementations log important
discovery procedure steps at the `info` log level. More extensive logging
is available at the `debug` level. Mechanisms that depend on external services
accessible over HTTP will log all outgoing HTTP requests and response codes at `debug` level.
See the [logging guide](/logging.html) for more information about logging configuration.

If the log does not contain any entries that demonstrate peer discovery progress, for example, the list
of nodes retrieved by the mechanism or clustering attempts, it may mean that the node already has
an initialised data directory or is already a member of the cluster. In those cases peer discovery
won't be performed.

Peer discovery relies on inter-node network connectivity and successful authentication via a shared
secret. Verifying that nodes can communicate with one another and use the expected Erlang cookie value (that's also identical across all cluster nodes).
See the main [Clustering guide](clustering.html) for more information.

A methodology for network connectivty troubleshooting as well as commonly used
tools are covered in the [Troubleshooting Network Connectivity](troubleshooting-networking.html) guide.
