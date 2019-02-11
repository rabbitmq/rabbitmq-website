# Feature Flags

## Intro

The feature flag subsystem allows RabbitMQ nodes with different versions
to determine if they are compatible and then communicate together,
regardless of their version.

This subsystem was introduced in RabbitMQ 3.8.0 to allow **rolling
upgrades of cluster members without shutting down the cluster**
entirely.

<p class="box-warning">Note that this subsystem does not guarantee that
all future changes in RabbitMQ can be implemented as feature flag.
Therefore, <strong>there might still be some versions of RabbitMQ which
will require a cluster shutdown</strong>. Please read the release notes
to make sure your cluster can be upgraded to the next minor or major
RabbitMQ version without a cluster shutdown.</p>

## <a id="tldr" class="anchor" href="#tldr">TL;DR</a>

<ul class="plain">
<li>A feature flag can only be enabled if all nodes in the cluster
support it.</li>
<li>A node can join or re-join a cluster only if:
<ol class="plain">
<li>it supports all feature flags enabled in the cluster and</li>
<li>if the cluster supports all the feature flags enabled on that node.</li>
</ol></li>
<li>Some operations might slow down or be blocked while a feature flag
is being enabled.</li>
<li>It is possible to do a rolling upgrade of your RabbitMQ 3.7.x
cluster to 3.8.x.</li>
<li>To list feature flags:
<pre class="lang-bash">
rabbitmqctl list_feature_flags
</pre></li>
<li>To enable a feature flag:
<pre class="lang-bash">
rabbitmqctl enable_feature_flag &lt;name&gt;
</pre></li>
</ul>

## <a id="feature-flags-and-rabbitmq-versions" class="anchor" href="#feature-flags-and-rabbitmq-versions">Feature Flags and RabbitMQ Versions</a>

As it is described in the introduction, the feature flags subsystem was
added to allow upgrades regardless of the version of RabbitMQ, if this
is possible.

Therefore, as of RabbitMQ 3.8.0, it will be possible to upgrade to the
next patch, minor or major release, except if it is stated otherwise
in the release notes. Indeed, there are some changes which cannot be
implemented as feature flags.

It is also possible to upgrade from RabbitMQ 3.7.x to 3.8.0.

However, note that only upgrading from one minor to the next minor or
major is supported. If you want to upgrade from e.g. 3.8.5 to 3.10.0,
you are required to upgrade to 3.9.x first. Likewise if there is one or
more minor release branches between the minor version you are using and
the next major release.

## <a id="how-to-list-feature-flags" class="anchor" href="#how-to-list-feature-flags">How to List Supported Feature Flags</a>

When a node starts for the first time, all supported feature flags
are enabled by default. When a node is upgraded to a newer version of
RabbitMQ, new feature flags remain disabled by default.

**To list the feature flags**, you can use the `list_feature_flags`
command from rabbitmqctl(8):

<pre class="lang-bash">
$ rabbitmqctl list_feature_flags

Listing feature flags ...
name	state
empty_basic_get_metric	enabled
implicit_default_bindings	enabled
quorum_queue	enabled
</pre>

Like many other "list" commands, you can specify the columns to display
and use the `pretty_table` formatter for improved readability:

<pre class="lang-bash" style="line-height: 1.2em;">
$ rabbitmqctl --formatter pretty_table list_feature_flags name state provided_by desc doc_url

Listing feature flags ...
┌───────────────────────────┬─────────┬───────────────────────────┬───────────────┬────────────┐
│ name                      │ state   │ provided_by               │ desc          │ doc_url    │
├───────────────────────────┼─────────┼───────────────────────────┼───────────────┼────────────┤
│ empty_basic_get_metric    │ enabled │ rabbitmq_management_agent │ Count (...)   │            │
├───────────────────────────┼─────────┼───────────────────────────┼───────────────┼────────────┤
│ implicit_default_bindings │ enabled │ rabbit                    │ Default (...) │            │
├───────────────────────────┼─────────┼───────────────────────────┼───────────────┼────────────┤
│ quorum_queue              │ enabled │ rabbit                    │ Support (...) │ http://... │
└───────────────────────────┴─────────┴───────────────────────────┴───────────────┴────────────┘
</pre>

The available columns are:

<ul class="plain">
<li><code>name</code>: the name of the feature flag.</li>
<li><code>state</code>: <em>enabled</em> or <em>disabled</em> if the
feature flag is enabled or disabled, <em>unsupported</em> if one or more
nodes in the cluster do not know this feature flag (and therefore it
cannot be enabled).</li>
<li><code>provided_by</code>: the RabbitMQ component or plugin which
provides the feature flag.</li>
<li><code>desc</code>: the description of the feature flag.</li>
<li><code>doc_url</code>: the URL to a webpage to learn more about the
feature flag.</li>
<li><code>stability</code>: indicates if the feature flag is
<em>stable</em> or <em>experimental</em>.</li>
</ul>

## <a id="how-to-enable-feature-flags" class="anchor" href="#how-to-enable-feature-flags">How to Enable Feature Flags</a>

After you upgraded a single node or an entire cluster, you can enable
new feature flags. Note that it will be impossible to rollback the
version or add a cluster member using the old version once new feature
flags are enabled.

**To enable a feature flag**, you can use the `enable_feature_flags`
command from rabbitmqctl(8):

<pre class="lang-bash">
$ rabbitmqctl enable_feature_flag quorum_queue

Enabling feature flag "quorum_queue" ...
</pre>

You can verify the feature flags' states again with the
`list_feature_flags` command. Assuming all feature flags were disabled
initially, here is the state after enabling the `quorum_queue` feature
flag:

<pre class="lang-bash" style="line-height: 1.2em;">
$ rabbitmqctl --formatter pretty_table list_feature_flags

Listing feature flags ...
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

## <a id="list-of-core-feature-flags" class="anchor" href="#list-of-core-feature-flags">List of Core Feature Flags</a>

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
Count AMQP <em>basic.get</em> issued on empty queues in statistics.
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

## <a id="how-do-feature-flags-work" class="anchor" href="#how-do-feature-flags-work">How Do Feature Flags Work?</a>

### <a id="how-do-feature-flags-work-for-operators" class="anchor" href="#how-do-feature-flags-work-for-operators">From an Operator Point of View</a>

#### Node and Version Compatibility

You must consider feature flags when you want to expand an existing
cluster by adding nodes using a different version of RabbitMQ, or when
you want to upgrade a cluster.

A node compares its own list of feature flags with remote
nodes' list of feature flags to determine if it can join a cluster. The
rules are defined as:

<ol class="plain">
<li>All feature flags enabled locally must be supported remotely.</li>
<li>All feature flags enabled remotely must be supported locally.</li>
</ol>

It is important to understand the difference between <em>enabled</em>
and <em>supported</em>:

<ul class="plain">
<li>A <em>supported</em> feature flag is one which is known by the node.
It can be enabled or disabled, but its state is irrelevant at this
point</li>
<li>An <em>enabled</em> feature flag is one which is activated and
used by the node. Per the definition above, it is implicitely a
<em>supported</em> feature flag.</li>
</ul>

If one of those two conditions is not verified, the node cannot join or
re-join the cluster.

However, if it can join the cluster, the state of
<em>enabled</em>feature flags is synchronized between nodes: if a
feature flag is enabled on one node, it is enabled on all other nodes.

#### What Happens When a Feature Flag is Enabled

When you enable a feature flag with rabbitmqctl(8), here is what happens
internally:

<ol class="plain">
<li>RabbitMQ verifies if the feature flag is already enabled. If yes, it
stops.</li>
<li>It verifies if the feature flag is supported. If no, it stops.</li>
<li>It marks the feature flag state as <code>state_changing</code>.
This is an internal transitional state to inform consumers of this
feature flag. Most of the time, it means that components depending on
this particular feature flag will be blocked until the state changes to
<code>enabled</code> or <code>disabled</code>.</li>
<li>It enables all feature flags this one depends on. Therefore for each
one of them, we go through this same procedure.</li>
<li>It executes the migration function, if there is one. This function
is responsible for preparing or converting various resources, such as
changing the schema of a database.</li>
<li>If all the steps above succeed, the feature flag state
becomes <code>enabled</code>. Otherwise, it is reverted back to
<code>disabled</code>.</li>
</ol>

<p class="box-info">As an operator, the most important part of
this procedure to remember is that <strong>if the migration takes
time</strong>, some components and thus <strong>operations in RabbitMQ
might be blocked</strong>.</p>

### <a id="how-do-feature-flags-work-for-developers" class="anchor" href="#how-do-feature-flags-work-for-developers">From a Developer Point of View</a>

If you want to contribute to RabbitMQ or you are working on a plugin,
you may have to work with feature flags to made your code compatible
with older versions of RabbitMQ.

#### When to Use a Feature Flag

It is your responsibility to look at the list of existing and future
(i.e. those added to the `master` branch) feature flags and see if your
code can be adapted to take advantage of them.

Here is an example:

If you develop a plugin which used to use the `#amqqueue{}` record
defined in `rabbit_common/include/rabbit.hrl`, you will have to adapt
your plugin to use the new `amqqueue` API which hides the previous
record (which is private now). However, you do not need to query
feature flags for that: your plugin will be ABI-compatible (i.e. no
need to recompile it) with RabbitMQ 3.8.0 and later. It should also be
ABI-compatible once the `amqqueue` appears in RabbitMQ 3.7.x.

However if your plugin is interested in the quorum queues introduced in
RabbitMQ 3.8.0, it may have to query feature flags to determine what
it can do. For instance, can it declare a quorum queue? Can it even
expect the new fields added to `amqqueue` as part of the quorum queues
implementation?

If your plugin carefully checks feature flags to avoid any incorrect
expectations, it will be compatible with many versions of RabbitMQ: you
or your users will not have to recompile anything to download another
version-specific copy of your plugin.

#### When to Declare a Feature Flag

You may want to modify one of the following aspects:

<ul class="plain">
<li>Record definitions</li>
<li>Replicated database schemas</li>
<li>Erlang messages exchanged between nodes</li>
<li>Modules and functions called from remote nodes</li>
</ul>

If that is the case, you have to think if the change can be made
compatible with older versions of RabbitMQ or your plugin by declaring a
new feature flag.

The two most important parts of a feature flag are:
<ul class="plain">
<li>the declaration as a module attribute</li>
<li>the migration function</li>
</ul>

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

Please look at the documentation inside the `rabbit_feature_flags`
module. You can read the
[source code of the module on GitHub](https://github.com/rabbitmq/rabbitmq-server/blob/master/src/rabbit_feature_flags.erl)
or generate the edoc locally from RabbitMQ source code cloned from GitHub or extracted from the source archive:

<pre class="lang-bash">
rabbit$ gmake edoc
# ... Ignore warnings and errors...

rabbit$ xdg-open doc/rabbit_feature_flags.html # i.e open that file in your browser.
</pre>
