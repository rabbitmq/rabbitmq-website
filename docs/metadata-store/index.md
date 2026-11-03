---
title: Metadata store
---

import './index.module.css';
import diagramStyles from './diagram.module.css';
import MetadataStoreRole from './metadata-store-role.svg';

import KhepriLogo from '@site/static/img/khepri-logo.svg';

# Metadata store

## Role of the metadata store

The metadata store is the database where RabbitMQ records everything except
queue and stream messages:

* users and permissions in the [internal authentication backend](../access-control.md)
* [virtual hosts](../vhosts.md)
* topology: exchanges, queues, streams, bindings
* [runtime parameters](../parameters.md)
* [policies](../policies.md)

<figure className={diagramStyles.diagram}>
<MetadataStoreRole/>
<figcaption>Role of the metadata store</figcaption>
</figure>

In a cluster, the metadata store replicates this information across all RabbitMQ nodes.

## Khepri {#khepri}

<figure className="without-borders" style={{float: "right"}}>
<KhepriLogo className="floating-logo" style={{width: "100px", height: "175px",}}/>
<figcaption>Khepri logo</figcaption>
</figure>

RabbitMQ uses [Khepri](https://rabbitmq.github.io/khepri/), a metadata store developed
by the RabbitMQ team. Khepri is the only supported metadata store starting with RabbitMQ 4.3.
It replaced Mnesia, the metadata store used by earlier releases.

Like [quorum queues](../quorum-queues/index.md) and [streams](../streams.md), Khepri uses the
[Raft consensus algorithm](https://raft.github.io/). A majority of cluster nodes
must be available for metadata updates and cluster membership changes.

The following guides cover [clustering](./clustering.md), [everyday operations](./everyday-operations.md),
and [failure recovery](./failure-recovery.md) with Khepri.
