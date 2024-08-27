---
title: Enabling Khepri
---

import diagramStyles from './diagram.module.css';
import EnableInUI from './enable-khepri_db-in_management-ui.svg';

# Enabling Khepri

Mnesia is still the default metadata store backend. Khepri has to be
explicitly enabled using the `khepri_db` feature flag.

This page demonstrates how to enable Khepri in various situations and what the
user should be aware of.

:::info
Khepri is very new in RabbitMQ 4.0.x. Some behaviors change and it may be
unstable and/or slow for your workload. We encourage you to test thoroughly
before enabling Khepri in production.

That said, **Khepri is fully supported**. It will be **possible to upgrade
from 4.0.x to future releases** with Khepri enabled.
:::

:::note
The Feature flags subsystem uses the words *stable* and *experimental* to
qualify feature flags maturity.

An *experimental* feature flag is used in two situations:
1. To introduce changes to get feedback early during the development. These
   changes could be reverted, upgrading a RabbitMQ node with such a feature
   flag enabled may not bo possible and support may not be provided.
2. For features the RabbitMQ team committed to and provides support for, until
   it is ready to be enabled by default, possibly replacing an older system.

Khepri in RabbitMQ 3.13.x was in the first group. Be reassured that Khepri in
RabbitMQ 4.0.0 and onward is in that second group and is therefore fully
supported.
:::

## On a brand new RabbitMQ node

### Using the CLI

1.  Start the new RabbitMQ node using a method of your choice. The example
    below executes the [`rabbitmq-server(8)` command](../man/rabbitmq-server.8)
    directly:

    ```
    rabbitmq-server
    ```

    At that point, the **node is using Mnesia** as the metadata store backend.

2.  Enable the `khepri_db` feature flag:

    ```
    rabbitmqctl enable_feature_flag --experimental khepri_db
    ```

See the next page to learn more about what happens when nodes with Mnesia and
nodes with Khepri are clustered together.

### Using the management UI

1.  Start the new RabbitMQ node using a method of your choice. See [the
    example above](#using-the-cli).

    At that point, the **node is using Mnesia** as the metadata store backend.

2.  Enable the [management plugin](../management):

    ```
    rabbitmq-plugins enable rabbitmq_management
    ```

3. Open and log into the [management UI](../management#usage-ui).

4. Navigate to *"Admin > Feature Flags"*.

5. Tick *"I understand the risk"* and click the *"Enable"* button:

    <figure className={diagramStyles.diagram}>
    <EnableInUI/>
    <figcaption>The experimental feature flags section in the management
    UI</figcaption>
    </figure>

### Using an environment variable

You can set the `$RABBITMQ_FEATURE_FLAGS` environment varable to set the list
of feature flags to enable at boot time on a new node. The variable must be
set to the exhaustive list of feature flags to enable on this node. This
variable is considered on the very first boot only; it is ignored afterwards.

:::warning
The use of this variable requires some caution: because the variable takes an
exhaustive list, you must be careful not to leave a feature flag disabled that
should have been enabled during the first boot otherwise.
:::

Start the new RabbitMQ node using a method of your choice, setting the
`$RABBITMQ_FEATURE_FLAGS` variable in the process. The example below executes
the [`rabbitmq-server(8)` command](../man/rabbitmq-server.8) directly:

```
env RABBITMQ_FEATURE_FLAGS=khepri_db,... rabbitmq-server
```

Note that this example does not list other feature flags to keep it short:
you need to fill that list.

The RabbitMQ node will use Khepri right from the beginning.

## On an existing standalone node or cluster

You can enable Khepri while the entire cluster is running and healthy, like
any other feature flag. In fact you can’t enable it while a node or the entire
cluster is stopped.

To enable Khepri, you can use either the [CLI command](#using-the-cli) on the
[management UI](#using-the-management-ui) methods described above.

The migration of the existing data from Mnesia to Khepri runs in parallel of
regular activities of RabbitMQ. However this migration takes resources and
will pause other activities near the end of the process for a short period of
time. Therefore, perform this migration away from peek load.

## What happens when Khepri is enabled?

The migration from Mnesia to Khepri is the responsibility of the
[`khepri_mnesia_migration`
library](https://rabbitmq.github.io/khepri_mnesia_migration/).

This library performs the migration in two phases:

1. It synchronizes the cluster membership from Mnesia to Khepri.
2. It copies records from Mnesia tables to the Khepri store.

### Cluster membership synchronization

The common situation is that Khepri is enabled in a Mnesia-based cluster and
thus all nodes involved are single isolated nodes from Khepri's point of view.
To be extra safe and avoid the loss of data in case some nodes were already
clustered at the Khepri levet too, `khepri_mnesia_migration` uses several
conditions to make sure the Khepri cluster is deterministic. To achieve that,
here are the steps it goes through:

1.  It queries the list of members of the Mnesia cluster. This is the baseline
    list of nodes we want to cluster in Khepri too.

2.  It queries each node to get the members of the Khepri cluster. Usually,
    Khepri was not clustered yet, so each node just returns itself.

3.  It sorts the list of Khepri "clusters" according to the following
    criterias:

    1. the cluster size (i.e. the number of members)
    2. the number of records in the Khepri store
    3. the node uptime
    4. the node name

    Therefore, in the case some nodes were already clustered at the Khepri
    level, the Khepri clusters will be sorted with the largest cluster first.

    But usually, nodes will be unclustered and thus sorted by node uptime and
    name.

4.  It selects the largest Khepri "cluster" acccording to the criteria above
    and adds all other nodes to that largest cluster.

5.  If some nodes were clustered at the Khepri level but were not in Mnesia,
    they are removed from Khepri.

### Data copy

Once the cluster membership view is the same between Mnesia and Khepri,
`khepri_mnesia_migration` can proceed with the actual migration of the data.
It performs the copy while permitting writes in Mnesia until the very last
moment.

The copy relies on callback modules provided by RabbitMQ. These callack
modules are responsible for telling `khepri_mnesia_migration` that record
`$record` from table `$table` goes into Khepri path `$path`, after possibly
doing some record conversion.

Here are the steps:

1.  `khepri_mnesia_migration` marks the migration in progress as value in
    Khepri.

2.  It subscribes to all Mnesia updates.

3.  It does the first copy from Mnesia to Khepri using Mnesia Backup & Restore
    API. This is based on a checkpoint in time in Mnesia, therefore the view
    is consistent.

4.  It marks all Mnesia tables as read-only. This is where activities in
    RabbitMQ are paused. Client operations may time out as a consequence.

5.  All updates received thanks to the Mnesia subscription in step 2 are now
    consumed and written to Khepri. Because tables are read-only, it is sure
    there is an end to the stream of updates.

6.  It marks the migration as complete. RabbitMQ can resume activities: they
    will use Khepri from now on.

7.  It proceeds with the cleanup: tables are deleted.

If there is an error during this process, everything is rolled back and
RabbitMQ will resume activities using Mnesia as before.
