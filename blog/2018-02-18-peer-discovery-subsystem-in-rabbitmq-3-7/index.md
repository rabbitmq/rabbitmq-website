---
title: "Peer Discovery Subsystem in RabbitMQ 3.7"
tags: ["New Features", ]
authors: [mklishin]
---

In this blog post we're going to take a closer look at a new
subsystem introduced in [RabbitMQ 3.7.0](/release-information).

<!-- truncate -->

## Why Do We Need Peer Discovery?

Users of open source data services such as RabbitMQ have increasing
expectations around operations automation. This includes so-called Day
1 operations: initial cluster provisioning.

When a RabbitMQ cluster is first formed, newly booting nodes need
to have a way to discover each other. In versions up to and including 3.6.x were
two ways of doing this:

 * CLI tools
 * A list of nodes in configuration file

The former option is used by some provisioning tools but is generally
not very automation friendly. The latter is more convenient but
has its own limitations: the set of nodes is fixed and changing it requires
a config file redeployment and node restart.

## A Better Way

There is a third option and it has been around in the community for a few years:
[rabbitmq-autocluster](https://github.com/rabbitmq/rabbitmq-autocluster), a plugin
originally developed by Gavin Roy.
That plugin modifies RabbitMQ boot process and injects a peer discovery step.
The list of peers in this case doesn't have to come from the config file:
it can be retrieved from an AWS autoscaling group
or an external tool such as [etcd](https://coreos.com/etcd/docs/latest/).

`rabbitmq-autocluster` authors concluded that there is no one true way of
performing peer discovery and that different approaches made sense for different
deployment scenarios. As such, they introduced a pluggable interface.
A specific implementation of this pluggable interface is called a peer
discovery mechanism. Given the explosion of platforms and deployment automation
stacks in the last few years, this turned out to be a wise decision.

For RabbitMQ 3.7.0 we took `rabbitmq-autocluster` and integrated its
main ideas into the core with some modifications influenced by our
experience supporting production RabbitMQ installations and community
feedback.

The result is a new [peer discovery subsystem](/docs/cluster-formation).

## How Does it Work?

When a node starts and detects it doesn't have a previously
initialised database, it will check if there's a peer
discovery mechanism configured. If that's the case, it will
then perform the discovery and attempt to contact each
discovered peer in order. Finally, it will attempt to join the
cluster of the first reachable peer.

Some mechanisms assume all cluster members are known ahead of time (for example, listed
in the config file), others are dynamic (nodes can come and go).

RabbitMQ 3.7 ships with a number of mechanisms:

 * AWS (EC2 instance tags or autoscaling groups)
 * Kubernetes
 * etcd
 * Consul
 * Pre-configured DNS records
 * Config file

and it is easy to introduce support for more options in the future.

Since the ability to list cluster nodes in the config file is not new,
let's focus on the new features.

### Node Registration and Unregistration

Some mechanisms use a data store to keep track of node list.
Newly joined cluster members update the data store to indicate their presence.
[etcd](/docs/cluster-formation#peer-discovery-etcd)
and [Consul](/docs/cluster-formation#peer-discovery-consul) are two options supported via
plugins that ship with RabbitMQ.

With other mechanisms cluster membership is managed out-of-band (by a mechanism that
RabbitMQ nodes cannot control). For example, the [AWS mechanism](/docs/cluster-formation#peer-discovery-aws) uses EC2 instance
filtering or autoscaling group membership, both of which are managed and updated
by AWS.

## Using a Preconfigured Set

But enough theory, let's take a look at what it takes to configure a list of nodes
for peer discovery using the new config format
that was [introduced alongside peer discovery in 3.7](/blog/2018/02/05/whats-new-in-rabbitmq-3-7):

First we have to tell RabbitMQ to use the classic config mechanism for peer discovery.
This is done using the `cluster_formation.peer_discovery_backend` key.
Then list one or more nodes using `cluster_formation.classic_config.nodes`, which is a collection:

```ini
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config

cluster_formation.classic_config.nodes.1 = rabbit@hostname1.eng.example.local
cluster_formation.classic_config.nodes.2 = rabbit@hostname2.eng.example.local
```

And that's it.

This discovery method is perhaps the easiest to get started with but it has one
obvious issue: the list of nodes is static.

Next let's take a look at a mechanism that uses dynamic node lists: the AWS EC2
instance filtering.

## Using AWS Instance Filtering

Just like with the earlier example, we have to tell the node to use AWS
for peer discovery:

```ini
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_aws
```

There are two ways to use the AWS mechanism but the backend name (module) is
the same for both.

To use instance filtering, the plugin requires an AWS region to be configured
as well as a pair of credentials. Sensitive configuration file values
[can be encrypted](/docs/configure#configuration-encryption).

Here's a config file example that does both:

```ini
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY
```

The node now has enough information to try consulting the [EC2 Instance Metadata service](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html).

Finally the operator needs to provide a set of tags to filter on. The tags are key/value pairs.
This means it is possible to filter on more than one tag, for example, `rabbitmq` and cluster name
or environment type (e.g. `development` or `test` or `production`).

Here's a complete config example that uses 3 tags, `region`, `service` and `environment`:

```ini
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_aws

cluster_formation.aws.region = us-east-1
cluster_formation.aws.access_key_id = ANIDEXAMPLE
cluster_formation.aws.secret_key = WjalrxuTnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY

cluster_formation.aws.instance_tags.region = us-east-1
cluster_formation.aws.instance_tags.service = rabbitmq
cluster_formation.aws.instance_tags.environment = staging
```

We are all set with this example. The only thing left to discuss is how to handle a natural race
condition that occurs when a cluster is first formed and node listing therefore can only
return an empty set. This will be covered in a separate section below.

#### IAM Roles and Permissions

If an [IAM role](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html) is assigned
to EC2 instances running RabbitMQ nodes, a policy has to be used to allow said instances use EC2 Instance
Metadata Service. Here's an example of such policy:

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

Without this policy in place the AWS peer discovery plugin won't be able to list instances and
discovery will fail. When discovery fails, the node will consider it to be a fatal condition
and terminate.

#### Node Names

By default node names with AWS peer discovery will be computed using private hostnames.
It is possible to switch to private IP addresses as well:

```ini
cluster_formation.aws.use_private_ip = true
```

### The Chicken and Egg Problem of Peer Discovery

Consider a deployment where the entire cluster is provisioned at once
and all nodes start in parallel. For example, they may have been just
created by BOSH or an AWS Cluster Formation template. In this case
there's a natural race condition between node registration and more
than one node can become "first to register" (discovers no existing
peers and thus starts as standalone).

Different peer discovery backends use different approaches to minimize
the probability of such scenario. Some acquire a lock with their
data service (etcd, Consul) and release it after registering, retrying
if lock acquisition fails.

Others use a technique known as randomized startup delay. With
randomized startup delay nodes will delay their startup for a randomly
picked value (between 5 and 60 seconds by default).
While this strategy may seem naive at first, it works quite well in practice
with sufficiently high max delay intervals. It is also used for leader election
in some distributed system algorithms, for example, [Raft](http://raft.github.io).

Some backends (config file, DNS) rely on a pre-configured set of peers
and do not suffer from this issue since when a node attempts to join
its peer, it will continue retrying for a period of time.

## What Peer Discovery Does not Do

Peer discovery was introduced to solve a narrow set of problems. It does not
change how RabbitMQ clusters operate once formed. Even though some mechanisms
introduce [additional features](/docs/cluster-formation#node-health-checks-and-cleanup),
some problems ([shared secret distribution](/docs/clustering#erlang-cookie) and [monitoring](/docs/monitoring), for example)
should be solved by different tools.

Peer discovery is also performed by blank (uninitialised) nodes. If a
node previously was a cluster member, it will try to contact its "last
seen" peer on boot for a period of time. In this case, no peer
discovery will be performed. This is no different from how earlier
RabbitMQ versions worked in this scenario.

## Peer Discovery Troubleshooting

Reasoning about an automated cluster formation system that also
uses a peer discovery mechanism that has external dependencies
(e.g. AWS APIs or etcd) can be tricky. For this reason all peer
discovery implementations log key decisions and most log all external
requests at `debug` log level. When in doubt, [enable debug logging](/docs/logging)
and take a look at node logs!

And keep in mind what's covered in the above section on when
peer discovery is not meant to kick in.

## Differences from `rabbitmq-autocluster`

While the new peer discovery subsystem is similar to `rabbitmq-autocluster`
in many ways, there is a couple of important differences that matter
to operators.

With `rabbitmq-autocluster`, nodes will reset themselves before joining
its peers. This makes sense in some environments and doesn't in other.
Peer discovery in RabbitMQ core does not do this.

`rabbitmq-autocluster` allows environment variables to be used
for mechanism-specific configuration in addition to RabbitMQ
config file. While this feature was retained to simplify migration,
it should be considered deprecated by the peer discovery subsystem
in 3.7.0.

Peer discovery in the core uses the [new configuration file format](/docs/configure)
heavily. `rabbitmq-autocluster` does not support that format since it
now is effectively a 3.6.x-only plugin.

## Future Work

Most major aspects of the peer discovery subsystem described in this
post have a few years of battle testing via `rabbitmq-autocluster`. However,
as more and more users adopt this feature in more and more environments,
new feedback from a broader set of users and use cases accumulates.

Currently one open ended question is whether inability to contact
an external service used by a peer discovery mechanism (e.g. an AWS API endpoint
or etcd or DNS) should immediately be considered a fatal failure that makes
the node stop, or should peer discovery be retried for a period of time.
You feedback is welcome [on the RabbitMQ mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users).
