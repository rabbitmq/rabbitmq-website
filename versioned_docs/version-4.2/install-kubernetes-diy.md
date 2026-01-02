---
title: Deploying to Kubernetes (Do It Yourself)
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

## Overview

This guide provides guidelines for deploying RabbitMQ to Kubernetes
without using the [Operator](https://www.rabbitmq.com/kubernetes/operator/operator-overview)
nor any of the popular Helm charts. Such **a do-it-yourself deployment is
highly discouraged**!

:::danger
You should almost certainly use the [Cluster Operator](https://www.rabbitmq.com/kubernetes/operator/operator-overview)
(highly recommended) or one of the popular Helm charts to deploy RabbitMQ to Kubernetes.
If you do that, you can ignore this guide altogether.
:::

If you really don't want to use either the [Cluster Operator](https://www.rabbitmq.com/kubernetes/operator/operator-overview)
nor a Helm chart, it is nevertheless highly recommend to follow what they do when deploying RabbitMQ.
You can deploy a cluster using the Operator and "look around" to see how the deployment is structured, how the `StatefulSet`
is configured, what the init container does and so on.

Moreover, keep in mind that the [Cluster Operator](https://www.rabbitmq.com/kubernetes/operator/operator-overview) supports
[StatefulSet and Service overrides](https://www.rabbitmq.com/kubernetes/operator/using-operator#override). You can therefore
customize an Operator-based deployment the way you need, without reinventing everything.

### Deployment Guidelines

#### Use a Stateful Set

RabbitMQ is a stateful application and is sensitive to hostname changes. Therefore, you have to use
a [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) to run it.

In addition, since RabbitMQ nodes [resolve their own and peer hostnames during boot](./clustering#hostname-resolution-requirement),
CoreDNS [caching timeout may need to be decreased](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id) from default 30 seconds
to a value in the 5-10 second range. Alternatively, an init container should delay the startup by 30 seconds.

:::important

CoreDNS [caching timeout may need to be decreased](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id)
from default 30 seconds to a value in the 5-10 second range

:::

#### Use Persistent Volumes

Since RabbitMQ is a stateful application, a persistent volume should be used for its data folder.
The only exception is if your deployment is really ephemeral, which is often the case in test pipelines.
If you just need to have a temporary RabbitMQ instance during application tests, you can deploy it
without a persistent volume. **Data (such as messages in the queues) can easily be lost if you do this!**

#### Use Parallel podManagementPolicy

`podManagementPolicy: "Parallel"` is the recommended option for RabbitMQ clusters.

Because of [how nodes rejoin their cluster](./clustering#restarting), `podManagementPolicy` set to `OrderedReady`
can lead to a deployment deadlock with certain readiness probes:

 * Kubernetes will expect the first node to pass a readiness probe
 * The readiness probe may require a fully booted node
 * The node will fully boot after it detects that its peers have come online
 * Kubernetes will not start any other pods until the first one boots
 * The deployment therefore is deadlocked

`podManagementPolicy: "Parallel"` avoids this problem, and the Kubernetes peer discovery plugin
then deals with the [natural race condition present during parallel cluster formation](./cluster-formation#initial-formation-race-condition).

#### ReadinessProbe

A TCP check on port 5672 (AMQP) or 5671 (AMQP with TLS) is a good `readinessProbe` for most cases.
The AMQP listener is always enabled as one of the last steps in a node boot process. If the port is available,
RabbitMQ pretty much completed the startup process and can indeed accept connections.

A TCP check works well in combination with `podManagementPolicy: "Parallel"`. If you want to use `OrderedReady`,
you should use a readinessProbe which doesn't require the node to be fully booted (which goes against the idea
of a readinessProbe). One health check that does not expect a node to be fully booted and have schema tables synced is:

```yaml
readinessProbe:
  exec:
    # This is NOT the recommended readinessProbe!
    command: ["rabbitmq-diagnostics", "ping"]
```

This basic check would allow the deployment to proceed and the nodes to eventually rejoin each other,
assuming they are [compatible](./upgrade). It is recommended to use a `Parallel` startup strategy
combined with a TCP-based `readinessProbe`.

### Configuration

To use Kubernetes for peer discovery, set the `cluster_formation.peer_discovery_backend`
to `k8s` or `kubernetes` or its module name, `rabbit_peer_discovery_k8s`
(note: the name of the module is slightly different from plugin name):

```ini
cluster_formation.peer_discovery_backend = k8s

# the backend can also be specified using its module name
# cluster_formation.peer_discovery_backend = rabbit_peer_discovery_k8s
```

The default settings of the peer discovery plugin should work in a vast majority of cases,
but there are some [settings available if the defaults don't work for you](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_peer_discovery_k8s#configuration).

#### Make Sure `/etc/rabbitmq` is Mounted as Writeable

RabbitMQ nodes may need to update a file under `/etc/rabbitmq`, the default [configuration file location](./configure#config-location) on Linux.
This may involve configuration file generation performed by the image used, [enabled plugins file](./plugins#enabled-plugins-file) updates,
and so on.

It is therefore highly recommended that `/etc/rabbitmq` is mounted as writeable and owned by
RabbitMQ's effective user (typically `rabbitmq`). Alternatively you can copy `ConfigMap` volumes
to `/etc` in an init container.
