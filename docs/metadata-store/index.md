---
title: Metadata store
---

import './index.module.css';
import diagramStyles from './diagram.module.css';
import MetadataStoreRole from './metadata-store-role.svg';

# Metadata store

## Role of the metadata store

The metadata store is the database where RabbitMQ records everything except
queue messages:
* internal users; "internal" as opposed to users defined externally, for
  instance LDAP
* virtual hosts
* topotogy: exchanges, queues, bindings
* runtime parameters and policies

<figure className={diagramStyles.diagram}>
<MetadataStoreRole/>
<figcaption>Role of the metadata store</figcaption>
</figure>

In a cluster, the metadata store is responsible for replicating that across
all RabbitMQ nodes.

The metadata store subsystem relies on a backend library to provide the
database and its replication.

## Supported backends

RabbitMQ supports two different libraries that provide this database:
* Mnesia
* Khepri

Only one of them is used at a given time. Each one is described below.

### Mnesia

<figure style={{width: "120px", float: "right"}}>
![](https://www.erlang.org/assets/img/erlang-logo.svg)
<figcaption>Erlang/OTP logo</figcaption>
</figure>

Mnesia is the only backend used by RabbitMQ until RabbitMQ 3.13.x. This
library is part of Erlang/OTP’s standard distribution and is maintained by the
same people that maintain Erlang.

It is efficient, provides transactions and cluster replication, an API for
backup and restore and, being a native Erlang/OTP library, is perfectly
integrated in any Erlang application.

Unfortunately, the replication part does not help the Erlang application above
—&nbsp;RabbitMQ in this case&nbsp;— to deal with network issues very much.
RabbitMQ is on its own to solve conflicts in the data if two nodes could not
communicate for a while and the database was updated on one side (e.g. a queue
was declared).

To deal with this, [network partition strategies](./partitions) were introduced
in RabbitMQ. However they are fragile and are difficult to reason about, even
opque to application developers.

### Khepri

<figure style={{width: "120px", float: "right"}}>
![](https://raw.githubusercontent.com/rabbitmq/khepri/main/doc/khepri-logo.svg)
<figcaption>Khepri logo</figcaption>
</figure>

Khepri becomes an option in RabbitMQ 4.0.x. It is developed by the RabbitMQ
team and reuses the work done for [quorum queues](./quorum-queues) and
[streams](./streams).

Indeed all these components are based on the Raft algorithm. Therefore the
behavior is well defined in the case of a loss of connectivity and is way
easier to reason about. The behavior is also consistent across RabbitMQ
components and subsystems because they all use the same algorithm.

The goal is to ultimately switch to Khepri only and stop using Mnesia.
However, the use of Khepri is a breaking change compared to Mnesia —&nbsp;even
though it is an internal piece&nbsp;— because it affects various user-visible
parts behavior when the cluster or the network have a bad day.

If you want to learn more about Khepri and its intagration into RabbitMQ,
Michael Davis, who works on this project, made a presentation at the Code BEAM
Europe 2023 confenence. You can watch the [recording of "Khepri: Replacing
Mnesia in RabbitMQ"](https://www.youtube.com/watch?v=whVqpgvep90) on YouTube.

:::tip
Khepri will become the default backend in RabbitMQ 4.1.0, expected to be
released in May 2025.

Mnesia will still be supported. An existing RabbitMQ deployment will continue
to use it once upgraded to RabbitMQ 4.1.x until Khepri is explicitly enabled
by the administrator.

Mnesia support will be removed in a future version, likely RabbitMQ 4.2.0 at
the end of year 2025. That is why **the RabbitMQ team encourages users to test
their workload and applications with Khepri** to further iron out issues and
performance problems.
:::

The few next pages will explain how to enable Khepri and will cover these
changes of behavior for various daily operations.
