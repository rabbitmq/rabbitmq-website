<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Parameters and Policies

## <a id="overview" class="anchor" href="#overview">Overview</a>

While much of the configuration for RabbitMQ lives in
the [configuration file](configure.html), some things
do not mesh well with the use of a configuration file:

 * If they need to be the same across all nodes in a cluster
 * If they are likely to change at run time

RabbitMQ calls these items _parameters_. Parameters can be
set by invoking [`rabbitmqctl`](man/rabbitmqctl.8.html)
or through [the HTTP API](management.html).

There are two kinds of parameters: vhost-scoped parameters and global parameters.
Vhost-scoped parameters are tied to a virtual host and consist
of a component name, a name and a value.

Global parameters are not tied to a particular virtual host and they consist
of a name and value.

One special case of parameters usage is [policies](#policies).

Policies is **the recommended way** of specifying
[optional arguments](./queues.html#optional-arguments) for groups of queues and exchanges, as well
as plugins such as [Federation](federation.html)
and [Shovel](shovel.html).

Policies are vhost-scoped.

[Operator policies](#operator-policies) allow cluster operators override certain arguments
defined in regular policies. This special policy type was designed for defining
guardrails, for example, limiting maximum queue size, enforcing a quorum queue and stream
initial replication factor, and so on.

Operator policies are particularly important in environments where RabbitMQ is offered
as a service, that is, where it is operated by one team but consumed by multiple other
teams or external customers.


## <a id="parameter-management" class="anchor" href="#parameter-management">Global and Per-vhost Parameters</a>

As stated above, there are vhost-scoped parameters and global parameters.
An example of vhost-scoped
parameter is a federation upstream: it targets a component
(`federation-upstream`), it has a name that identifies
it, it's tied to a virtual host (federation links will target
some resources of this virtual host), and its value defines connection
parameters to an upstream broker.

Vhost-scoped parameters can be set, cleared and listed:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
      <code>rabbitmqctl set_parameter [-p <i>vhost</i>] &lt;component_name> &lt;name&gt; &lt;value&gt;</code><br/>
      <code>rabbitmqctl clear_parameter [-p <i>vhost</i>] &lt;component_name&gt; &lt;name&gt;</code><br/>
      <code>rabbitmqctl list_parameters [-p <i>vhost</i>]</code>
    </td>
  </tr>
  <tr>
    <th>HTTP API</th>
    <td>
      <code>PUT /api/parameters/<i>{component_name}</i>/<i>{vhost}</i>/<i>{name}</i></code><br/>
      <code>DELETE /api/parameters/<i>{component_name}</i>/<i>{vhost}</i>/<i>{name}</i></code><br/>
      <code>GET /api/parameters</code><br/>
    </td>
  </tr>
</table>

Global parameters is the other kind of parameters.
An example of a global parameter is the name of the cluster.
Global parameters can be set, cleared and listed:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
      <code>rabbitmqctl set_global_parameter &lt;name&gt; &lt;value&gt;</code><br/>
      <code>rabbitmqctl clear_global_parameter &lt;name&gt;</code><br/>
      <code>rabbitmqctl list_global_parameters</code>
    </td>
  </tr>
  <tr>
    <th>HTTP API</th>
    <td>
      <code>PUT /api/global-parameters/<i>name</i></code><br/>
      <code>DELETE /api/global-parameters/<i>name</i></code><br/>
      <code>GET /api/global-parameters</code><br/>
    </td>
  </tr>
</table>

Since a parameter value is a JSON document, you will usually
need to quote it when creating one on the command line
with `rabbitmqctl`. On Unix it is usually easiest to
quote the whole document with single quotes, and use double
quotes within it. On Windows you will have to escape every
double quote. We give examples for both Unix and Windows for
this reason.

Parameters reside in the database used by RabbitMQ for
definitions of virtual hosts, exchanges, queues, bindings, users
and permissions. Parameters are exported along with other object
definitions by the management plugin's export feature.

Vhost-scoped parameters are used by the federation and shovel plugins.
Global parameters are used by the MQTT plugin.

## <a id="policies" class="anchor" href="#policies">Policies</a>

Policies is **the recommended way** of configuring [optional arguments](./queues.html#optional-arguments)
for queues, exchanges, and some plugins.

Two notable exceptions are the queue type
and the [maximum number of priorities](./priority.html) of classic queues. Those values intentionally
cannot be configured by policies: their values are fixed at queue declaration time.

### <a id="why-policies-exist" class="anchor" href="#why-policies-exist">Why Policies Exist</a>

Before we explain what policies are and how to use them it would
be helpful to explain why they were introduced to RabbitMQ.

In addition to mandatory properties
(e.g. `durable` or `exclusive`),
queues and exchanges in RabbitMQ have [optional arguments](./queues.html#optional-arguments),
sometimes referred to as `x-arguments`.

Those are provided by clients when
they declare queues (exchanges) and control various optional
features, such as [queue length limit](maxlength.html) or
[TTL](ttl.html).

Client-controlled properties in some of the protocols RabbitMQ supports
generally work well but they can be inflexible: updating TTL values
or mirroring parameters that way required application changes, redeployment
and queue re-declaration (which involves deletion). In addition, there is
no way to control the extra arguments for groups of queues and exchanges.
Policies were introduced to address the above pain points.

A policy matches one or more queues by name (using a regular
expression pattern) and appends its definition (a map of
optional arguments) to the x-arguments of the matching
queues. In other words, it is possible to configure
x-arguments for multiple queues at once with a policy, and
update them all at once by updating policy definition.

In modern versions of RabbitMQ the set of features which can
be controlled by policy is not the same as the set of
features which can be controlled by client-provided
arguments.

### <a id="how-policies-work" class="anchor" href="#how-policies-work">How Policies Work</a>

Key policy attributes are

* name: it can be anything but ASCII-based names without spaces are recommended
* pattern: a regular expression that matches one or more queue (exchange) names.
  Any regular expression can be used.
* definition: a set of key/value pairs (think a JSON document) that will be injected
  into the map of optional arguments of the matching queues and exchanges
* [policy priority](#policy-priorities) used to determine which policy should be
  applied to a queue or exchange if multiple policies match its name

Policies automatically match against exchanges and queues,
and help determine how they behave. Each exchange or queue
will have at most one policy matching (see <a href="#combining-policy-definitions">Combining Policy Definitions</a> below),
and each policy then injects a set of key-value pairs (policy definition) on to the matching
queues (exchanges).

Policies can match only queues of a specific type, all queues, only exchanges, or all queues and exchanges.
This is controlled using the `apply-to` flag when a policy is created.

Policies can change at any time. When a policy definition is
updated, its effect on matching exchanges and queues will be
reapplied. Usually it happens instantaneously but for very
busy queues can take a bit of time (say, a few seconds).

Policies are matched and applied every time an exchange or
queue is created, not just when the policy is created.

Policies can be used to configure

 * [federation](federation.html)
 * [alternate exchanges](ae.html)
 * [dead lettering](dlx.html),
 * [per-queue TTLs](ttl.html)
 * [queue length limit](maxlength.html)

 and other features.

An example of defining a policy looks like:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
<pre class="lang-bash">
rabbitmqctl set_policy federate-me \
    "^federated\." '{"federation-upstream-set":"all"}' \
    --priority 1 \
    --apply-to exchanges
</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
<pre class="lang-powershell">
rabbitmqctl.bat set_policy federate-me ^
    "^federated\." "{""federation-upstream-set"":""all""}" ^
    --priority 1 ^
    --apply-to exchanges
</pre>
    </td>
  </tr>
  <tr>
    <th>HTTP API</th>
    <td>
<pre class="lang-ini">
PUT /api/policies/%2f/federate-me
    {"pattern": "^federated\.",
     "definition": {"federation-upstream-set":"all"},
     "priority": 1,
    "apply-to": "exchanges"}
</pre>
    </td>
  </tr>
  <tr>
    <th>Web UI</th>
    <td>
      <ul>
        <li>
          Navigate to Admin > Policies > Add / update a
          policy.
        </li>
        <li>
          Enter "federate-me" next to Name, "^federated\." next to
          Pattern, and select "Exchanges" next to Apply to.
        </li>
        <li>
          Enter "federation-upstream-set" = "all" in the first line next to
          Policy.
        </li>
        <li>
          Click Add policy.
        </li>
      </ul>
    </td>
  </tr>
</table>

This matches the value `"all"` with the key
`"federation-upstream-set"` for all exchanges
with names beginning with `"federated."`, in the
virtual host `"/"`.

The `"pattern"` argument is a regular expression used
to match exchange or queue names.

In the event that more than one policy can match a given
exchange or queue, the policy with the greatest priority applies.

The `"apply-to"` argument can be one of the following:

* `"exchanges"`, applies to exchanges only
* `"queues"`, applies to all types of queues, including streams
* `"classic_queues"`, applies to classic queues only
* `"quorum_queues"`, applies to quorum queues only
* `"streams"`, applies to streams only
* `"all"`, applies to all exchanges and queues (including streams)

The `"apply-to"` and `"priority"` settings are optional.
The default values are `"all"` and `"0"` respectively.

### <a id="policy-priorities" class="anchor" href="#policy-priorities">Policy Priorities</a>

Policy **patterns** are matched against exchange and queue **names** to determine what policy (if any)
should then inject a set of key-value pairs (the definition of that policy) into the [optional arguments](queues.html#optional-arguments)
of matching queues (exchanges).

**At most one policy matches** a queue or exchange. Since multiple policies can match a single
name, a mechanism is needed to resolve such policy conflicts. This mechanism is called policy priorities.
Every policy has a a numeric priority associated with it. This priority can be specified when declaring
a policy. If not explicitly provided, the priority of 0 will be used.

Matching policies are then sorted by priority and the one with the highest priority will take
effect.

When multiple policies match an entity and they all have equal priorities, the effective one
will be chosen undeterministically. **Such cases should be avoided** by paying attention
to what priorities various policies use.

### <a id="combining-policy-definitions" class="anchor" href="#combining-policy-definitions">Combining Policy Definitions</a>

In some cases we might want to apply more than one policy
definition to a resource. For example we might need a queue to
be federated and has message TTL. At most one policy will apply to a
resource at any given time, but we can apply multiple
definitions in that policy.

A federation policy definition would require an <em>upstream set</em>
to be specified, so we would need the `federation-upstream-set`
key in our definition. On the other hand to define some queues as TTL-enabled,
we would need the TTL-related keys key to be defined as well for the
policy. The policy definition is just a JSON object and can have multiple
keys combined in the same policy definition.

Here's an example:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
<pre class="lang-bash">
rabbitmqctl set_policy ttl-fed \
    "^tf\." '{"federation-upstream-set":"all", "message-ttl":60000}' \
    --priority 1 \
    --apply-to queues
</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
<pre class="lang-powershell">
rabbitmqctl set_policy ttl-fed ^
    "^tf\." "{""federation-upstream-set"":""all"", ""message-ttl"":60000}" ^
    --priority 1 ^
    --apply-to queues
</pre>
    </td>
  </tr>
  <tr>
    <th>HTTP API</th>
    <td>
<pre class="lang-powershell">
PUT /api/policies/%2f/ttl-fed
    {"pattern": "^tf\.",
    "definition": {"federation-upstream-set":"all", "message-ttl":60000},
    "priority": 1,
    "apply-to": "queues"}
</pre>
    </td>
  </tr>
  <tr>
    <th>Web UI</th>
    <td>
      <ul>
        <li>
          Navigate to Admin > Policies > Add / update a
          policy.
        </li>
        <li>
          Enter "ttl-fed" next to Name, "^tf\." next to
          Pattern, and select "Queues" next to Apply to.
        </li>
        <li>
          Enter "federation-upstream-set" = "all" in the first line next to
          Policy.
        </li>
        <li>
          Enter "ha-mode" = "exactly" and "ha-params" = 2 on the following form lines.
        </li>
        <li>
          Click Add policy.
        </li>
      </ul>
    </td>
  </tr>
</table>

By doing that all the queues matched by the pattern "^tf\\." will have the `"federation-upstream-set"`
and the policy definitions applied to them.

## <a id="operator-policies" class="anchor" href="#operator-policies">Operator Policies</a>

### <a id="why-operator-policies-exist" class="anchor" href="#why-operator-policies-exist">Difference From Regular Policies</a>

Sometimes it is necessary for the operator to enforce certain policies.
For example, it may be desirable to force [queue TTL](./ttl.html) but
still let other users manage policies. Operator policies allow for that.

Operator policies are much like regular ones but their
definitions are used differently. They are merged with
regular policy definitions before the result is applied to
matching queues.

Because operator policies can unexpectedly change queue
attributes and, in turn, application assumptions and
semantics, they are limited only to a few arguments:

<table>
  <thead>
    <td></td>
    <td><strong>Classic</strong></td>
    <td><strong>Quorum</strong></td>
    <td><strong>Stream</strong></td>
  </thead>
  <tr>
    <th>delivery-limit</th>
    <td> </td>
    <td> <span>&#10003;</span> </td>
    <td> </td>
  </tr>
  <tr>
    <th>expires</th>
    <td> <span>&#10003;</span> </td>
    <td> <span>&#10003;</span> </td>
    <td> </td>
  </tr>
  <tr>
    <th>ha-mode</th>
    <td> <span>&#10003;</span> </td>
    <td> </td>
    <td> </td>
  </tr>
  <tr>
    <th>ha-params</th>
    <td> <span>&#10003;</span> </td>
    <td> </td>
    <td> </td>
  </tr>
  <tr>
    <th>ha-sync-mode</th>
    <td> <span>&#10003;</span> </td>
    <td> </td>
    <td> </td>
  </tr>
  <tr>
    <th>max-in-memory-bytes</th>
    <td> </td>
    <td> <span>&#10003;</span> </td>
    <td> </td>
  </tr>
  <tr>
    <th>max-in-memory-length</th>
    <td> </td>
    <td> <span>&#10003;</span> </td>
    <td> </td>
  </tr>
  <tr>
    <th>max-length</th>
    <td> <span>&#10003;</span> </td>
    <td> <span>&#10003;</span> </td>
    <td> </td>
  </tr>
  <tr>
    <th>max-length-bytes</th>
    <td> <span>&#10003;</span> </td>
    <td> <span>&#10003;</span> </td>
    <td> <span>&#10003;</span> </td>
  </tr>
  <tr>
    <th>message-ttl</th>
    <td> <span>&#10003;</span> </td>
    <td> <span>&#10003;</span> </td>
    <td> </td>
  </tr>
  <tr>
    <th>target-group-size</th>
    <td> </td>
    <td> <span>&#10003;</span> </td>
    <td> </td>
  </tr>
</table>

### <a id="operator-policy-conflicts" class="anchor" href="#operator-policy-conflicts">Conflict Resolution with Regular Policies</a>

An operator policy and a regular policy can contain the same
keys in their definitions. When it happens, the more conservative
value is chosen as effective. For example, if a matching
operator policy definition sets `max-length` to
50 and a matching regular policy definition uses the value of 100,
the value of 50 will be used. If, however, regular policy's value
was 20, it would be used. Operator policies, therefore, don't
just overwrite regular policy values. They enforce limits but
try to not override user-provided policies where possible.

<table>
    <thead>
        <td></td>
        <td><strong>Classic</strong></td>
        <td><strong>Quorum</strong></td>
        <td><strong>Stream</strong></td>
    </thead>
    <tr>
        <th>delivery-limit</th>
        <td> </td>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td> </td>
    </tr>
    <tr>
        <th>expires</th>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td>
            <ul>
                <li>lesser value of the two policies</li>
                <li>policy precedence over queue arguments</li>
            </ul>
        </td>
        <td> </td>
    </tr>
    <tr>
        <th>ha-mode</th>
        <td>
          The order of preference:

          <ol>
            <li>all</li>
            <li>exactly</li>
            <li>nodes</li>
          </ol>
        </td>
        <td> </td>
        <td> </td>
    </tr>
    <tr>
        <th>ha-params</th>
        <td>
          <ul>
            <li>greater value when both values are integers</li>
            <li>integer value when only one value is an integer</li>
            <li>longer list when both values are a list of nodes</li>
            <li>operator policy value when both values are an equal length list of nodes</li>
          </ul>
        </td>
        <td> </td>
        <td> </td>
    </tr>
    <tr>
        <th>ha-sync-mode</th>
        <td>
            <ul>
                <li>operator policy value</li>
            </ul>
        </td>
        <td> </td>
        <td> </td>
    </tr>
    <tr>
        <th>max-in-memory-bytes</th>
        <td> </td>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td> </td>
    </tr>
    <tr>
        <th>max-in-memory-length</th>
        <td> </td>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td> </td>
    </tr>
    <tr>
        <th>max-length</th>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td> </td>
    </tr>
    <tr>
        <th>max-length-bytes</th>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td>
            <ul>
                <li>lesser value of the two policies</li>
                <li>policy precedence over queue arguments</li>
            </ul>
        </td>
    </tr>
    <tr>
        <th>message-ttl</th>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td>
            <ul>
                <li>lesser value</li>
            </ul>
        </td>
        <td> </td>
    </tr>
    <tr>
        <th>target-group-size</th>
        <td> </td>
        <td>
            <ul>
                <li>greater value</li>
            </ul>
        </td>
        <td> </td>
    </tr>
</table>

When the same key is provided by both [client-provided `x-arguments`](./queues.html#optional-arguments) and by a user policy,
the former take precedence.

However, if an operator policy is also used, that will take precedence over the client-provided
arguments, too. Operator policies are a protection mechanism and override client-provided values
and user policy values.

Use operator policies to introduce guardrails for application-controlled parameters related
to resource use (e.g. peak disk space usage).

### <a id="operator-policy-definition" class="anchor" href="#operator-policy-definition">Defining Operator Policies</a>

Operator policies are defined in a way very similar to regular (user) policies.
When `rabbitmqctl` is used, the command name is `set_operator_policy`
instead of `set_policy`. In the HTTP API, `/api/policies/` in request path
becomes `/api/operator-policies/`:

<table>
    <tr>
        <th>rabbitmqctl</th>
        <td>
<pre class="lang-bash">
rabbitmqctl set_operator_policy transient-queue-ttl \
    "^amq\." '{"expires":1800000}' \
    --priority 1 \
    --apply-to queues
</pre>
        </td>
    </tr>
    <tr>
        <th>rabbitmqctl (Windows)</th>
        <td>
<pre class="lang-powershell">
rabbitmqctl.bat set_operator_policy transient-queue-ttl ^
    "^amq\." "{""expires"": 1800000}" ^
    --priority 1 ^
    --apply-to queues
</pre>
        </td>
    </tr>
    <tr>
        <th>HTTP API</th>
        <td>
<pre class="lang-ini">
PUT /api/operator-policies/%2f/transient-queue-ttl
                {"pattern": "^amq\.",
                 "definition": {"expires": 1800000},
                 "priority": 1,
                 "apply-to": "queues"}
</pre>
        </td>
    </tr>
    <tr>
        <th>Web UI</th>
        <td>
            <ul>
                <li>
                  Navigate to Admin > Policies > Add / update an operator
                  policy.
                </li>
                <li>
                  Enter "transient-queue-ttl" next to Name, "^amq\." next to
                  Pattern, and select "Queues" next to Apply to.
                </li>
                <li>
                  Enter "expires" = 1800000 in the first line next to
                  Policy.
                </li>
                <li>
                  Click Add policy.
                </li>
            </ul>
        </td>
    </tr>
</table>

### <a id="disable-operator-policy-changes" class="anchor" href="#disable-operator-policy-changes">How to Disable Operator Policy Changes</a>

Modification of operator policies via the HTTP API and Web UI can be disabled
in configuration. This makes operator policies read-only for all users via the
HTTP API and Web UI.

<pre class="lang-ini">
management.restrictions.operator_policy_changes.disabled = true
</pre>