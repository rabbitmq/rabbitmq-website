# Hot Standby via Continuous Definition Replication

[VMware Tanzu RabbitMQ](/tanzu/) supports continuous schema definition replication
to a remote cluster, which makes it easy to run a hot standby cluster for disaster recovery.

This feature is not available in the open source RabbitMQ distribution.

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers WAN-friendly replication of schema
between RabbitMQ clusters. This feature is typically used
for setting up one or more standby (passive) disaster recovery clusters.

<p class="box-info">
This guide covers a commercial feature that is <strong>only available in VMware Tanzu RabbitMQ</strong>,
and not in the open source RabbitMQ distribution.
<a href="/tanzu/">Learn more about VMware Tanzu RabbitMQ</a>
</p>

The plugin's replication model has a number of features and limitations:

 * It transfers definitions (schema) but **not enqueued messages**
 * Syncing happens periodically, so with volatile topologies followers will always
   be trailing behind the leader. With a sync interval of thirty seconds the lag will usually be
   within one minute.
 * The schema (virtual hosts, users, queues, and so on) on the follower side is replaced with
   that on the leader side
 * All communication between the sides is completely asynchronous and avoids introducing cluster co-dependencies
 * Except for the initial import, definitions are transferred and imported incrementally
 * Definitions are transferred in a compressed binary format to reduce bandwidth usage
 * Links to other clusters are easily to configure and reason about, in particular during a disaster recovery event

In case of a disaster event the recovery process involves several steps:

 * A standby cluster will be promoted to the operator
 * Applications will be redeployed or reconfigured to connect to the newly promoted cluster
 * Other standby clusters have to be reconfigured to follow the newly promoted cluster

As explained later in this guide, promotion and reconfiguration happen on the fly,
and **do not involve RabbitMQ node restarts** or redeployment.

## <a id="enabling" class="anchor" href="#enabling">Enabling the Plugin</a>

As any other [RabbitMQ plugin](https://www.rabbitmq.com/plugins.html), `rabbitmq_schema_definition_sync` must
be enabled before it can be used. Usually this plugin should be
[pre-configured](https://www.rabbitmq.com/plugins.html#enabled-plugins-file) or enabled as `--offline` before node start:

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_schema_definition_sync --offline
</pre>

## <a id="how-it-works" class="anchor" href="#how-it-works">How the Syncing Works</a>

### <a id="upstreams-and-downstreams" class="anchor" href="#upstreams-and-downstreams">Upstreams and Downstreams</a>

The plugin has two sides on a schema replication link (connection):

 * A source cluster, a.k.a. "origin", a.k.a. **upstream** (borrowing a term from the Federation plugin)
 * A destination cluster, a.k.a. follower, a.k.a. **downstream**

 There can be multiple downstreams for an upstream; this document primarily discusses
 a single upstream, single downstream scenario for the sake of simplicity.

Downstreams connect to their upstream and periodically initiate sync operations. These
operations synchronise the schema on the downstream side with that of the upstream,
with some safety mechanisms (covered later in this guide).

 A node running in the downstream mode (a follower) can be **converted to an upstream** (leader)
 on the fly. This will make it disconnect from its original source, therefore stopping all
 syncing. The node will then continue operating as a member of an independent cluster,
 no longer associated with its original upstream.

 Such conversion is called a **promotion** and should be performed in case of a disaster
 recovery event.

### <a id="sync-ops" class="anchor" href="#sync-ops">Sync Operations</a>

 A sync operation is a request/response sequence that involves:

  * A sync request sent by the downstream
  * A sync response sent back by the upstream

A sync request carries a payload that allows the upstream to compute the delta between
the schemas. A sync response carries the delta plus all the definitions that are only
present on the upstream side or conflict. Downstream will use this information to
apply the definitions. Any **entities only present on the downstream will be deleted**.
This is to make sure that downstreams follow their upstream's schema as closely as
possible, with some practical limits (discussed further in this guide).

 Downstreams connect to their upstream using AMQP 1.0. This has a few benefits:

  * All communication is asynchronous, there is no coupling, a standby can run
    a different (e.g. newer) version of RabbitMQ
  * Authentication is identical to that of applications
  * No additional ports need to be open

### <a id="loose-coupling" class="anchor" href="#loose-coupling">Loose Coupling</a>

The upstream and its followers (downstreams) are loosely connected.
If one end of a schema replication connection fails, the delta between clusters' schema will
grow but neither will be affected in any other way. If an upstream is under
too much load to serve definition request or the sync plugin is unintentionally
disabled, the downstream simply won't receive responses for sync requests
for a period of time.

If a downstream fails to apply definitions, the upstream is not affected and neither
its downstream peers. Therefore availability of both sides of the synchronisation
links does not depend on that on the other end.

When multiple downstreams are syncing from a shared upstream, they do not interfere
or coordinate with each other. Both sides have to do a little bit more work. On
the upstream side, this load is shared between all cluster nodes. On the downstream
side, the load should be minimal in practice, assuming that sync operations are applied
successfully, so the delta does not accumulate.


## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

### <a id="upstream" class="anchor" href="#upstream">Upstream</a>

A node participating in schema definition syncing must be provided with two pieces of configuration:

 * What mode it operates in, `upstream` (leader) or `downstream` (passive follower)
 * Upstream connection endpoints

This is true for both upstreams and downstreams.

The mode must be provided in the config file. Supported values are `upstream`
and `downstream`, respectively:

<pre class="lang-ini">
# source cluster
cluster_name = eu.1

# this node will run as an upstream (source) for
# schema replication
schema_definition_sync.operating_mode = upstream
</pre>

Upstream nodes also need to have a list of connection endpoints. An upstream
node will connect to the first reachable node. Providing a list makes schema
replication more resilient to node failures on the upstream side.

Connection endpoints and credentials are configured using [runtime parameters](https://www.rabbitmq.com/parameters.html).
This makes it possible to reconfigure them without a node restart:

<pre class="lang-bash">
# This virtual host will be used for schema replication
rabbitmqctl add_vhost rabbitmq_schema_definition_sync

# Create a user and grant it permissions to the virtual host that will be
# used for schema replication.
# This command is similar to 'rabbitmqctl add_user' but also grants full permissions
# to the virtual host used for definition sync.
rabbitmqctl add_schema_replication_user "schema-replicator" "$3kRe7"

# specify local (upstream cluster) nodes and credentials to be used
# for schema replication
rabbitmqctl set_schema_replication_upstream_endpoints '{"endpoints": ["a.rabbitmq.eu-1.local:5672","b.rabbitmq.eu-1.local:5672","c.rabbitmq.eu-1.local:5672"], "username": "schema-replicator", "password": "$3kRe7"}'
</pre>

To verify replication status of a running node, use `rabbitmqctl schema_replication_status`:

<pre class="lang-bash">
rabbitmqctl schema_replication_status
</pre>

### <a id="downstream" class="anchor" href="#downstream">Downstreams</a>

Downstream configuration is generally similar to that of the upstream side:

<pre class="lang-ini">
# follower cluster
cluster_name = eu.2

# this node will run as a downstream (follower) for
# schema replication
schema_definition_sync.operating_mode = downstream
</pre>

Just like for upstream nodes, a list of upstream hosts and connection credentials must be
provided:

<pre class="lang-bash">
# specify upstream cluster nodes and credentials to be used
# for schema replication
rabbitmqctl set_schema_replication_upstream_endpoints '{"endpoints": ["a.rabbitmq.eu-1.local:5672","b.rabbitmq.eu-1.local:5672","c.rabbitmq.eu-1.local:5672"], "username": "schema-replicator", "password": "$3kRe7"}'
</pre>

For downstreams, there is one more setting that can be configured:
sync operation interval. The interval is in seconds and controls how often this downstream will
initiate sync operations:

<pre class="lang-ini">
# follower cluster
cluster_name = eu.2

# this node will run as a downstream (follower) for
# schema replication
schema_definition_sync.operating_mode = downstream

# initiate sync operations every 30 seconds
schema_definition_sync.downstream.minimum_sync_interval = 30
</pre>

Depending on the accumulated delta between the two sides,
a sync operation can take some time to complete.

If the actual amount of time taken exceeds the configured minimum,
the greater value of the two will be used. This is to make sure that in case
of a large volume of data to import, sync operations are not consistently initiated
more frequently than it takes to import them, conserving resources on both sides.

Downstream status can be inspected using the same command, `rabbitmqctl schema_replication_status`:

<pre class="lang-bash">
rabbitmqctl schema_replication_status
</pre>

## <a id="suspend-and-resume" class="anchor" href="#suspend-and-resume">Stopping and Resuming Replication</a>

Replication can be stopped on either end by invoking `rabbitmqctl disable_schema_replication`:

<pre class="lang-bash">
rabbitmqctl disable_schema_replication
</pre>

This will make the node disconnect from the upstream and stop initiating (if it is a downstream)
or serving (if it is an upstream) sync operation requests.

To re-enable synchronisation, use `rabbitmqctl enable_schema_replication`:

<pre class="lang-bash">
rabbitmqctl enable_schema_replication
</pre>

To restart schema replication, e.g. after an upstream endpoint or credential change,
use `rabbitmqctl restart_schema_replication`:

<pre class="lang-bash">
rabbitmqctl restart_schema_replication
</pre>

This is identical to disabling and immediately re-enabling replication using
the aforementioned commands.


## <a id="promotion" class="anchor" href="#promotion">Secondary Cluster (Hot Standby) Promotion</a>

Having a standby cluster with synchronised virtual hosts, users, permissions, topologies
and so on is only useful if it can be turned into a new primary cluster
in case of a disaster event. In this guide we will refer to such event
as a **downstream promotion**.

A promoted downstream becomes a "regular" cluster that can, if needed, itself serve
as an upstream. It does not sync from its original upstream but can serve sync
operation requests.

A downstream promotion involves a few steps on the downstream side:

 * Replication is stopped
 * An upstream setup is performed
 * Node mode is switched to upstream
 * Replication is resumed

All these steps are performed using CLI tools and do not require a node
restart:

<pre class="lang-bash">
# stop replication
rabbitmqctl disable_schema_replication

# this upstream setup has to be performed just once, not for every upstream cluster node
rabbitmqctl add_vhost rabbitmq_schema_definition_sync
# similar to 'rabbitmqctl add_user' but also grants full permissions
# to the virtual host used for definition sync
rabbitmqctl add_schema_replication_user "schema-replicator" "$3kRe7"

# connect to the local (promoted) nodes
rabbitmqctl set_schema_replication_upstream_endpoints '{"endpoints": ["a.rabbitmq.eu-2.local:5672","b.rabbitmq.eu-2.local:5672","c.rabbitmq.eu-2.local:5672"], "username": "schema-replicator", "password": "$3kRe7"}'

# act as an upstream
rabbitmqctl set_schema_replication_mode upstream

# resume replication
rabbitmqctl enable_schema_replication
</pre>

The promoted cluster then can be used by applications and as an upstream
for other clusters. It no longer has any connection to its original upstream.

## <a id="post-promotion" class="anchor" href="#post-promotion">Post-Promotion</a>

Note that if the promoted cluster is to be restarted, **its operating mode must be updated**
in the configuration file as well, otherwise it will revert back to its originally
configured mode, `downstream`.

The plugin does not make any assumptions about what happens to the original cluster
that has experienced a disaster event. It can be gone permanently, brought back as a standby
for the newly promoted one or be eventually promoted back.
