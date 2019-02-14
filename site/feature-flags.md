# Feature Flags

## Overview

In a mixed version cluster (e.g. some versions are 3.7.x and some are
3.8.x) some nodes will support a different set of features, behave
differently in certain scenarios, and otherwise not act exactly the
same: they are different versions after all.

Feature flags are a mechanism that controls what features are considered
to be enabled or available on all cluster nodes. If a feature flag is
enabled, so is its associated feature (or behavior). If not then all
nodes in the cluster will disable the feature (behavior).

The feature flag subsystem allows RabbitMQ nodes with different versions
to determine if they are compatible and then communicate together,
regardless of their version.

This subsystem was introduced in RabbitMQ 3.8.0 to allow **[rolling
upgrades](/upgrade.html#rolling-upgrades) of cluster members without
shutting down the entire cluster**.

<p class="box-warning">
This subsystem does not guarantee that all future changes in
RabbitMQ can be implemented as feature flags and entirely backwards
compatible with older release series. Therefore, <strong>a future
versio nfo RabbitMQ might still require a clusterwide shutdown for
upgrading</strong>.

Please always read [release notes](/changelog.html) to see if a rolling
upgrade to the next minor or major RabbitMQ version is possible.
</p>

## <a id="tldr" class="anchor" href="#tldr">Quick summary (TL;DR)</a>

### The Two Main Rules

 * A feature flag can be enabled only if all nodes in the cluster support it.
 * A node can join or re-join a cluster only if:
    1. it supports all feature flags enabled in the cluster and
    2. if the cluster supports all the feature flags enabled on that node.

RabbitMQ 3.7.x and 3.8.x nodes are compatible as long as no 3.8.x
feature flags are enabled.

### The Two Main Commands

 *  To list feature flags:
    <pre class="lang-bash">rabbitmqctl list_feature_flags</pre>
 *  To enable a feature flag:
    <pre class="lang-bash">rabbitmqctl enable_feature_flag &lt;name&gt;</pre>

It is also possible to list and enable feature flags from the
[Management plugin UI](/management.html), in "*Admin > Feature flags*".

### The Two Examples

#### Example 1: Compatible Nodes

<div style="text-align: center;">
<img src="/img/feature-flags/compatible-nodes.svg" style="width: 100%; max-width: 400px;"/>
</div>

 * If nodes A and B are not clustered, they can be clustered.
 * If nodes A and B are clustered:
    * "*Coffee maker*" can be enabled.
    * "*Juicer machine*" cannot be enabled because it is unsupported by node B.

#### Example 2: Incompatible Nodes

<div style="text-align: center;">
<img src="/img/feature-flags/incompatible-nodes.svg" style="width: 100%; max-width: 400px;"/>
</div>

 * If nodes A and B are not clustered, they cannot be clustered because
   "*Juicer machine*" is unsupported on node B.
 * If nodes A and B are clustered and "*Juicer machine*" was enabled
   while node B was stopped, node B cannot re-join the cluster on restart.

## <a id="version-compatibility" class="anchor" href="#version-compatibility">Feature Flags and RabbitMQ Versions</a>

As covered earlier, the feature flags subsystem's primary goal is to
allow upgrades regardless of the version of RabbitMQ, if possible.

Therefore, as of RabbitMQ 3.8.0, it will be possible to upgrade to the
next patch, minor or major release, except if it is stated otherwise
in the release notes. Indeed, there are some changes which cannot be
implemented as feature flags.

<div style="text-align: center;">
<img src="/img/feature-flags/feature-flags-and-rabbitmq-versions.svg" style="width: 100%; max-width: 647px;"/>
</div>

It is also possible to upgrade from RabbitMQ 3.7.x to 3.8.x. Indeed,
RabbitMQ 3.7.x does not have the feature flags subsystem and RabbitMQ
3.8.x considers that a 3.7.x node has an empty list of feature flags.
Therefore, as long as the 3.8.x node has all its feature flags disabled,
it is compatible with a 3.7.x node.

However, note that only upgrading from one minor to the next minor
or major is supported. To upgrade from e.g. 3.8.5 to 3.10.0, it is
necessary to upgrade to 3.9.x first. Likewise if there is one or more
minor release branches between the minor version used and the next major
release.

## <a id="how-to-list-feature-flags" class="anchor" href="#how-to-list-feature-flags">How to List Supported Feature Flags</a>

When a node starts for the first time, all supported feature flags
are enabled by default. When a node is upgraded to a newer version of
RabbitMQ, new feature flags are enabled by default if it is a single
isolated node, or remain disabled by default if it belongs to a cluster.

**To list the feature flags**, use `rabbitmqctl list_feature_flags`:

<pre class="lang-bash">
rabbitmqctl list_feature_flags

# => Listing feature flags ...
# => name	state
# => empty_basic_get_metric	enabled
# => implicit_default_bindings	enabled
# => quorum_queue	enabled
</pre>

For improved table readability, switch to the `pretty_table` formatter:

<pre class="lang-bash">
rabbitmqctl -q --formatter pretty_table list_feature_flags \
  name state provided_by desc doc_url
</pre>

which would produce a table that looks like this:

<pre class="lang-bash" style="line-height: 1.2em;">
┌───────────────────────────┬─────────┬───────────────────────────┬───────┬────────────┐
│ name                      │ state   │ provided_by               │ desc  │ doc_url    │
├───────────────────────────┼─────────┼───────────────────────────┼───────┼────────────┤
│ empty_basic_get_metric    │ enabled │ rabbitmq_management_agent │ (...) │            │
├───────────────────────────┼─────────┼───────────────────────────┼───────┼────────────┤
│ implicit_default_bindings │ enabled │ rabbit                    │ (...) │            │
├───────────────────────────┼─────────┼───────────────────────────┼───────┼────────────┤
│ quorum_queue              │ enabled │ rabbit                    │ (...) │ http://... │
└───────────────────────────┴─────────┴───────────────────────────┴───────┴────────────┘
</pre>

As shown in the example above, the `list_feature_flags` command accepts
a list of columns to display. The available columns are:

 * `name`: the name of the feature flag.
 * `state`: *enabled* or *disabled* if the feature flag is enabled or
   disabled, *unsupported* if one or more nodes in the cluster do not
   know this feature flag (and therefore it cannot be enabled).
 * `provided_by`: the RabbitMQ component or plugin which provides the
   feature flag.
 * `desc`: the description of the feature flag.
 * `doc_url`: the URL to a webpage to learn more about the feature flag.
 * `stability`: indicates if the feature flag is *stable* or
   *experimental*.

## <a id="how-to-enable-feature-flags" class="anchor" href="#how-to-enable-feature-flags">How to Enable Feature Flags</a>

After upgrading one node or the entire cluster, it will be possible
to enable new feature flags. Note that it will be impossible to roll
back the version or add a cluster member using the old version once new
feature flags are enabled.

**To enable a feature flag**, use `rabbitmqctl enable_feature_flag`:

<pre class="lang-bash">
rabbitmqctl enable_feature_flag &lt;name&gt;
</pre>

The `list_feature_flags` command can be used again to verify the feature
flags' states. Assuming all feature flags were disabled initially, here
is the state after enabling the `quorum_queue` feature flag:

<pre class="lang-bash" style="line-height: 1.2em;">
rabbitmqctl -q --formatter pretty_table list_feature_flags

┌───────────────────────────┬──────────┐
│ name                      │ state    │
├───────────────────────────┼──────────┤
│ empty_basic_get_metric    │ disabled │
├───────────────────────────┼──────────┤
│ implicit_default_bindings │ disabled │
├───────────────────────────┼──────────┤
│ quorum_queue              │ enabled  │
└───────────────────────────┴──────────┘
</pre>

## <a id="how-to-disable-feature-flags" class="anchor" href="#how-to-disable-feature-flags">How to Disable Feature Flags</a>

This is **impossible to disable a feature flag** once it is enabled.

## <a id="core-feature-flags" class="anchor" href="#core-feature-flags">List of Core Feature Flags</a>

The feature flags listed below are those provided by RabbitMQ core or
one of the tier-1 plugins bundled with RabbitMQ.

<table>
  <tr>
   <th>Feature flag name</th>
   <th>Description</th>
   <th>Lifecycle</th>
  </tr>

  <tr>
    <td><a id="ff-empty_basic_get_metric" class="anchor" href="#ff-empty_basic_get_metric">empty_basic_get_metric</a></td>
    <td>
      Count AMQP 0-9-1 <em>basic.get</em> issued on empty queues in statistics.
    </td>
    <td>
    <table class="feature-flag-lifecycle">
      <tr><th>Introduction:</th><td>3.8.0</td></tr>
      <tr><th>Removal:</th><td>-</td></tr>
    </table>
    </td>
  </tr>

  <tr>
    <td><a id="ff-implicit_default_bindings" class="anchor" href="#ff-implicit_default_bindings">implicit_default_bindings</a></td>
    <td>
      Clean up explicit default bindings now that they are managed implicitly.
    </td>
    <td>
    <table class="feature-flag-lifecycle">
      <tr><th>Introduction:</th><td>3.8.0</td></tr>
      <tr><th>Removal:</th><td>-</td></tr>
    </table>
    </td>
  </tr>

  <tr>
    <td><a id="ff-quorum_queue" class="anchor" href="#ff-quorum_queue">quorum_queue</a></td>
    <td>
      Add the <a href="/quorum-queues.html">quorum queue</a> type.
    </td>
    <td>
      <table class="feature-flag-lifecycle">
        <tr><th>Introduction:</th><td>3.8.0</td></tr>
        <tr><th>Removal:</th><td>-</td></tr>
      </table>
    </td>
  </tr>
</table>

## <a id="implementation" class="anchor" href="#implementation">How Do Feature Flags Work?</a>

### <a id="implementation-for-operators" class="anchor" href="#implementation-for-operators">From an Operator Point of View</a>

#### Node and Version Compatibility

Feature flags should be considered when extending an existing cluster by
adding nodes using a different version of RabbitMQ, or when performing
[an upgrade](/upgrade.html).

A node compares its own list of feature flags with remote nodes' list
of feature flags to determine if it can join a cluster. The rules are
defined as:

 * All feature flags enabled locally must be supported remotely.
 * All feature flags enabled remotely must be supported locally.

It is important to understand the difference between *enabled* and
*supported*:

 * A *supported* feature flag is one which is known by the node. It can
   be enabled or disabled, but its state is irrelevant at this point.
 * An *enabled* feature flag is one which is activated and used by the
   node. Per the definition above, it is implicitely a *supported*
   feature flag.

If one of those two conditions is not verified, the node cannot join or
re-join the cluster.

However, if it can join the cluster, the state of *enabled* feature
flags is synchronized between nodes: if a feature flag is enabled on one
node, it is enabled on all other nodes.

#### Scope of the Feature Flags

The feature flags subsystem covers inter-node communication only. This
means the following scenarios are not covered and may not work as
initially expected.

##### Using `rabbitmqctl` on a remote node

Controlling a remote node with `rabbitmqctl` is only supported if the
remote node is running the same version of RabbitMQ than `rabbitmqctl`
comes from.

For instance, using RabbitMQ 3.7.x's `rabbitmqctl` on a remote RabbitMQ
3.8.x node may not work. It may even crash the remote node.

##### Load-balancing Requests to the HTTP API

If a request sent to the HTTP API exposed by the [Management
plugin](/management.html) goes through a load balancer, including one
from the management plugin UI, the API's behavior and its response may
be different, depending on the version of the node which handled the
request. This is exactly the same if the domain name of the HTTP API
resolves to multiply IP addresses.

For example, if the management UI was loaded from a RabbitMQ 3.7.x node
but it then queries a RabbitMQ 3.8.x node, the Javascript code running
in the browser may crash (but not the RabbitMQ nodes).

#### What Happens When a Feature Flag is Enabled

When a feature flag is enabled with `rabbitmqctl`, here is what happens
internally:

 1. RabbitMQ verifies if the feature flag is already enabled. If yes, it
    stops.
 2. It verifies if the feature flag is supported. If no, it stops.
 3. It marks the feature flag state as *state_changing*. This is an
    internal transitional state to inform consumers of this feature
    flag. Most of the time, it means that components depending on this
    particular feature flag will be blocked until the state changes to
    *enabled* or *disabled*.
 4. It enables all feature flags this one depends on. Therefore for each
    one of them, we go through this same procedure.
 5. It executes the migration function, if there is one. This function
    is responsible for preparing or converting various resources, such as
    changing the schema of a database.
 6. If all the steps above succeed, the feature flag state becomes
    *enabled*. Otherwise, it is reverted back to *disabled*.

<p class="box-info">
  As an operator, the most important part of this procedure to
  remember is that <strong>if the migration takes time</strong>, some
  components and thus <strong>some operations in RabbitMQ might be
  blocked</strong> during the migration.
</p>

### <a id="implementation-for-developers" class="anchor" href="#implementation-for-developers">From a Developer Point of View</a>

When working on a plugin or a RabbitMQ core contribution, feature flags
should be used to made the new version of the code compatible with older
versions of RabbitMQ.

#### When to Use a Feature Flag

It is developer's responsibility to look at the list of existing and
future (i.e. those added to the `master` branch) feature flags and see
if the new code can be adapted to take advantage of them.

Here is an example. When developing a plugin which used to use the
`#amqqueue{}` record defined in `rabbit_common/include/rabbit.hrl`, the
plugin has to be adapted to use the new `amqqueue` API which hides the
previous record (which is private now). However, there is no need to
query feature flags for that: the plugin will be ABI-compatible (i.e. no
need to recompile it) with RabbitMQ 3.8.0 and later. It should also be
ABI-compatible with RabbitMQ 3.7.x once the `amqqueue` appears in that
branch.

However if the plugin targets quorum queues introduced in RabbitMQ
3.8.0, it may have to query feature flags to determine what it can do.
For instance, can it declare a quorum queue? Can it even expect the new
fields added to `amqqueue` as part of the quorum queues implementation?

If the plugin carefully checks feature flags to avoid any incorrect
expectations, it will be compatible with many versions of RabbitMQ:
the user will not have to recompile anything or download another
version-specific copy of the plugin.

#### When to Declare a Feature Flag

If a plugin or core broker change modifies one of the following aspects:

 * record definitions
 * replicated database schemas
 * the format of Erlang messages passed between nodes
 * modules and functions called from remote nodes

Then compatibility with older versions of RabbitMQ becomes a concern.
This is where a new feature flag can help ensure a smoother upgrade
experience.

The two most important parts of a feature flag are:

 * the declaration as a module attribute
 * the migration function

The declaration is a module attribute which looks like this:
<pre class="lang-erlang">
-rabbit_feature_flag(
   {quorum_queue,
    #{desc          => "Support queues of type quorum",
      doc_url       => "http://www.rabbitmq.com/quorum-queues.html",
      stability     => stable,
      migration_fun => {?MODULE, quorum_queue_migration}
     }}).
</pre>

The migration function is a stateless function which looks like this:

<pre class="lang-erlang">
quorum_queue_migration(FeatureName, _FeatureProps, enable) ->
    Tables = ?quorum_queue_tables,
    rabbit_table:wait(Tables),
    Fields = amqqueue:fields(amqqueue_v2),
    migrate_to_amqqueue_with_type(FeatureName, Tables, Fields);
quorum_queue_migration(_FeatureName, _FeatureProps, is_enabled) ->
    Tables = ?quorum_queue_tables,
    rabbit_table:wait(Tables),
    Fields = amqqueue:fields(amqqueue_v2),
    mnesia:table_info(rabbit_queue, attributes) =:= Fields andalso
    mnesia:table_info(rabbit_durable_queue, attributes) =:= Fields.
</pre>

More implementation docs can be found in
the [`rabbit_feature_flags` module source
code](https://github.com/rabbitmq/rabbitmq-server/blob/master/src/rabbit_feature_flags.erl).

Erlang's `edoc` reference can be generated locally from a RabbitMQ
repository clone or source archive:

<pre class="lang-bash">
gmake edoc
# =>  ... Ignore warnings and errors...

# Now open `doc/rabbit_feature_flags.html` in the browser.
</pre>
