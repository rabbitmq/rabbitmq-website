---
title: "RabbitMQ 4.1: New Kubernetes Peer Discovery Mechanism"
tags: ["Announcements", "kubernetes", "RabbitMQ 4.1.x"]
authors: [kura]
---

RabbitMQ 4.1 includes a completely redesigned peer discovery plugin for Kubernetes.
No configuration changes should be needed when upgrading to 4.1, so if you want,
you can just stop reading here. If you are interested in the details, read on.
This blog post explains the peer discovery subsystem in general
and the changes to `rabbitmq_peer_discovery_k8s` in particular.

<!-- truncate -->

## What Is Peer Discovery?

Say you want to have a 3-node RabbitMQ cluster - you start 3 instances of RabbitMQ but then
what? You can manually tell two of them to join the third one using
`rabbitmqctl join_cluster` command and voilà, you have a 3-node cluster.

Most users would prefer this process to be automated however. That's where
peer discovery comes in. There is a handful of peer discovery plugins available in RabbitMQ
for different situations. The simplest one is called
[classic peer discovery](https://www.rabbitmq.com/docs/cluster-formation#peer-discovery-classic-config)
and allows you to just put the hostnames of the nodes in the configuration file,
so that RabbitMQ automatically initiates the cluster formation with them upon startup.

:::note
It is a common misconception that the peer discovery is performed every time a node starts.
This is not the case, it is only performed when a node starts for the first time
(when it has an empty data folder).
:::

However, based on how you deploy RabbitMQ, the hostnames may not be known upfront.
Even if they are, you need a different configuration file for each cluster, which
may be inconvenient if you want a quick way to spin up new clusters for testing
environments for example.

In such cases, you can use other peer discovery plugins, which allow nodes to register
with some external systems such as Consul or etcd and query these systems for a list
of registered nodes. This way you don't need to know the hostnames upfront - the nodes
discover each other automatically.

## Kubernetes Peer Discovery before RabbitMQ 4.1

Before RabbitMQ 4.1, `rabbitmq_peer_discovery_k8s` performed the peer discovery by querying
the Kubernetes API server for a list of endpoints behind a service (Kubernetes automatically
registers pods of a given StatefulSet as endpoints). However, there were a few issues with
this approach:
1. some users reported that occasionally, cluster formation would fail and the pods
would form multiple separate clusters; we never received enough data to diagnose this issue
and it never occurred in our testing (we tried thousands of times...)
2. it required permissions to query the Kubernetes API; not a big deal, but it was unnecessary
and some security-conscious users were asking why we needed this
3. it was a convoluted way of asking a question, we already know the answer to...

## Kubernetes Peer Discovery in RabbitMQ 4.1

When deploying RabbitMQ to Kubernetes, you should always use a StatefulSet.
All pods that belong to a StatefulSet are named consistently with the name of the StatefulSet,
followed by a hyphen and an
[ordinal index](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#ordinal-index).
The ordinal index start is configurable, but is almost always `0`, so let's just assume it is `0`.
Given that, a 3-node cluster deployed to Kubernetes will always have nodes with suffixes `-0`, `-1` and `-2`.
There's no need to query the Kubernetes API to know this!

The new plugin doesn't perform any Kubernetes API queries. It just assumes that a pod with `-0` suffix
will exist and treats it as the "seed" node. All other nodes will join the cluster by joining
the `-0` node. If the `-0` node is not up, other nodes will wait forever for it to come up
(they will never form a cluster without the `-0` node). Remember that peer discovery only
happens when a node starts for the first time, so "waiting forever for node `-0`" only
applies to the first time you deploy a given cluster.

### Advanced Configuration

For the vast majority of users, this upgrade should be completely transparent. First of all,
since peer discovery is only performed when a node starts for the first time,
if you upgrade an existing cluster, peer discovery changes won't affect you.

Second, the new plugin accepts, but ignores, all configuration options of the old plugin. You will
see some warnings in the logs about deprecated options being used, but you can safely ignore them.

If the default configuration doesn't work for you, there are two settings you can use:

1. If you are using an ordinal start other than `0` (and seriously, why would you?!), you should
configure the plugin by setting `cluster_formation.k8s.ordinal_start = N` where `N` is the ordinal start.
When set, all nodes will try to join the `-N` node, rather than the `-0` node.

2. Additionally, you can set `cluster_formation.k8s.seed_node = rabbit@seed-node-hostname` to
just say what the seed node is. We don't expect this setting to ever be needed, but it's there
if you really need it.

### What If I'm Using The Cluster Operator?

[Cluster Operator](https://www.rabbitmq.com/kubernetes/operator/operator-overview#cluster-operator)
is the recommended way of deploying RabbitMQ to Kubernetes, so if you are using it - great.
You should be able to continue using it with no changes. You will see the aforementioned warnings in the logs,
because the Cluster Operator allows deploying different RabbitMQ versions, not just 4.1.
Therefore, for the time being, it will continue setting values required by the old version of
`rabbitmq_peer_discovery_k8s` in the configuration file. Such a configuration works for both 4.1 and older
versions. At some point in the future, Cluster Operator will drop support for RabbitMQ versions older
than 4.1 and we'll remove these settings from the ConfigMap declared by the Cluster Operator.
