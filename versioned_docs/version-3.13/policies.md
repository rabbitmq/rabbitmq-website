---
title: Policies
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Policies

## Overview {#overview}

While much of the configuration for RabbitMQ lives in
the [configuration file](./configure), some things
do not mesh well with the use of a configuration file:

 * If they need to be the same across all nodes in a cluster
 * If they are likely to change at run time

Such values in RabbitMQ are stored as [runtime parameters](./parameters).
Policies is one example of how runtime parameter are used.

This guide focuses on policies and operator policies.

## Why Policies Exist {#why}

:::tip
Policies is a declarative mechanism of configuring certain properties of groups
of queues, streams, exchanges. They are designed for parameters that can change at runtime.
:::

:::note
Since queue (stream) type is set at declaration time and cannot be changed, policies cannot
be used to configure queue type, by design. To specify queue (stream) type, use [optional arguments](./queues#optional-arguments).
:::

Policies is a declarative, [virtual host](./vhosts)-scoped mechanism for dynamically [re]configuring [optional arguments](./queues#optional-arguments)
for queues, exchanges, streams, and some plugins (namely [federation](./federation)).

### Policies vs. The Optional Arguments Set by Applications

Before we explain what policies are and how to use them it would
be helpful to explain why they were introduced to RabbitMQ.

In addition to mandatory properties
(e.g. `durable` or `exclusive`),
queues and exchanges in RabbitMQ have [optional arguments](./queues#optional-arguments),
sometimes referred to as `x-arguments`.

Those are provided by clients when
they declare queues (exchanges) and control various optional
features, such as [queue length limit](./maxlength) or
[TTL](./ttl).

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

### How Policies Work {#how-policies-work}

Key policy attributes are

* name: it can be anything but ASCII-based names without spaces are recommended
* pattern: a regular expression that matches one or more queue (exchange) names.
  Any regular expression can be used.
* definition: a set of key/value pairs (think a JSON document) that will be injected
  into the map of optional arguments of the matching queues and exchanges
* [policy priority](#priorities) used to determine which policy should be
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

 * [federation](./federation)
 * [alternate exchanges](./ae)
 * [dead lettering](./dlx),
 * [per-queue TTLs](./ttl)
 * [queue length limit](./maxlength)

 and other features.

### What Cannot Be Set Using a Policy

Some optional arguments cannot be configured using a policy. They control various settings
that cannot be changed at runtime. Two key examples are:

 * The type of a queue
 * The [maximum number of priorities](./priority) of classic queues

Those values intentionally cannot be configured by policies: their values are fixed at queue declaration time.


## How to Define a Policy {#defining}

An example of defining a policy looks like:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_policy federate-me \
    "^federated\." '{"federation-upstream-set":"all"}' \
    --priority 1 \
    --apply-to exchanges
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin policies declare \
    --name "federate-me" \
    --pattern "^federated\." \
    --definition '{"federation-upstream-set":"all"}' \
    --priority 1 \
    --apply-to "exchanges"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_policy federate-me ^
    "^federated\." "{""federation-upstream-set"":""all""}" ^
    --priority 1 ^
    --apply-to exchanges
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe policies declare ^
    --name "federate-me" ^
    --pattern "^federated\." ^
    --definition "{""federation-upstream-set"":""all""}" ^
    --priority 1 ^
    --apply-to "exchanges"
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
```ini
PUT /api/policies/%2f/federate-me
    {"pattern": "^federated\.",
     "definition": {"federation-upstream-set":"all"},
     "priority": 1,
    "apply-to": "exchanges"}
```
</TabItem>

<TabItem value="Management UI" label="Management UI">
<ol>
  <li>
    Navigate to `Admin` > `Policies` > `Add / update a
    policy`.
  </li>
  <li>
    Enter a policy name (such as "federated") next to Name, a pattern (such as "^federated\.") next to
    Pattern, and select what kind of entities (exchanges in this example) the policy should apply to using the `Apply to`
    drop down.
  </li>
  <li>
    Enter "federation-upstream-set" = "all" (or a specific upstream name) in the first line next to
    `Policy`.
  </li>
  <li>
    Click `Add policy`.
  </li>
</ol>
</TabItem>
</Tabs>

:::danger
When multiple policies match an entity and they all have equal priorities, the effective one
will be chosen undeterministically. **Such cases should be avoided** by paying attention
to what priorities various policies use.
:::

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

### Policy Priorities {#priorities}

Policy **patterns** are matched against exchange and queue **names** to determine what policy (if any)
should then inject a set of key-value pairs (the definition of that policy) into the [optional arguments](./queues#optional-arguments)
of matching queues (exchanges).

**At most one policy matches** a queue or exchange. Since multiple policies can match a single
name, a mechanism is needed to resolve such policy conflicts. This mechanism is called policy priorities.
Every policy has a a numeric priority associated with it. This priority can be specified when declaring
a policy. If not explicitly provided, the priority of 0 (a very low one) will be used.

:::important
**At most one policy matches** a queue or exchange. Matching policies are then sorted by priority
and the one with the highest priority will take
effect.

Higher values indicate higher priority: a policy with priority 10 will overrule a policy with priority 8,
and both will overrule the default priority of 0.
:::

:::danger
When multiple policies match an entity and they all have equal priorities, the effective one
will be chosen undeterministically. **Such cases should be avoided** by paying attention
to what priorities various policies use.
:::

Matching policies are then sorted by priority and the one with the highest priority will take
effect.

When multiple policies match an entity and they all have equal priorities, the effective one
will be chosen undeterministically. **Such cases should be avoided** by paying attention
to what priorities various policies use.

### Combining Policy Definitions {#combining-policy-definitions}

In some cases we might want to apply more than one policy
definition to a resource. For example we might need a queue to
be federated and has message TTL. At most one policy will apply to a
resource at any given time, but we can apply multiple
definitions in that policy.

:::tip

See [Updating Policies](#updating) below as well.

:::

A federation policy definition would require an <em>upstream set</em>
to be specified, so we would need the `federation-upstream-set`
key in our definition. On the other hand to define some queues as TTL-enabled,
we would need the TTL-related keys key to be defined as well for the
policy. The policy definition is just a JSON object and can have multiple
keys combined in the same policy definition.

Here's an example:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_policy ttl-fed \
    "^tf\." '{"federation-upstream-set":"all", "message-ttl":60000}' \
    --priority 1 \
    --apply-to queues
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin policies declare \
    --name 'ttl-fed' \
    --definition '{"federation-upstream-set":"all", "message-ttl":60000}' \
    --pattern '^tf\.' \
    --priority 1 \
    --apply-to 'queues'
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl.bat with PowerShell">
```PowerShell
rabbitmqctl set_policy ttl-fed ^
    "^tf\." "{""federation-upstream-set"":""all"", ""message-ttl"":60000}" ^
    --priority 1 ^
    --apply-to queues
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe policies declare ^
    --name "ttl-fed" ^
    --definition "{""federation-upstream-set"":""all"", ""message-ttl"":60000}" ^
    --pattern "^tf\." ^
    --priority 1 ^
    --apply-to "queues"
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
```ini
PUT /api/policies/%2f/ttl-fed
    {"pattern": "^tf\.",
    "definition": {"federation-upstream-set":"all", "message-ttl":60000},
    "priority": 1,
    "apply-to": "queues"}
```
</TabItem>

<TabItem value="Management UI" label="Management UI">
<ol>
  <li>
    Navigate to `Admin` > `Policies` > `Add / update a
    policy`.
  </li>
  <li>
    Enter a policy name (such as "federated") next to Name, a pattern (such as "^federated\.") next to
    Pattern, and select what kind of entities (queues in this example) the policy should apply to using the `Apply to`
    drop down.
  </li>
  <li>
    Enter "federation-upstream-set" = "all" (or a specific upstream name) in the first line next to
    `Policy`.
  </li>
  <li>
    Click `Add policy`.
  </li>
</ol>
</TabItem>
</Tabs>

By doing that all the queues matched by the pattern "^tf\\." will have the `"federation-upstream-set"`
and the policy definitions applied to them.


## Deleting a Policy {#deleting}

A policy can be deleted using `rabbitmqctl clear_policy` or `rabbitmqadmin policies delete`.

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl clear_policy --vhost "vh.1" "policy.name"
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost "vh.1" policies delete --name "policy.name"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat clear_policy --vhost "vh.1" "policy.name"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost "vh.1" policies delete --name "policy.name"
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
```ini
DELETE /api/policies/vh.1/policy.name
```
</TabItem>

<TabItem value="Management UI" label="Management UI">
<ol>
  <li>
    Navigate to `Admin` > `Policies` > Click on the policy to delete.
  </li>
  <li>
    Click "Delete this policy"
  </li>
  <li>
    Confirm the operation.
  </li>
</ol>
</TabItem>
</Tabs>


## Declaring an Override (a Temporary Overriding Policy) {#override}

[`rabbitmqadmin`](./management-cli) can be used to declare an override, or an overriding policy.

This is a policy that applies to the same set of objects (e.g. queues) as an existing policy
but contains a different definition and a higher priority (by 100, to be exact).

Overriding policies are meant to be short-lived, for example, to enable queue federation
during the final stage of a [Blue/Green cluster migration](./blue-green-upgrade/).

The following example uses `rabbitmqadmin policies declare_override` to override a policy
named "pol.1" and injects a [queue federation](./federated-queues)-related key.

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost 'vh.1' policies declare_override --name 'pol.1' --definition '{"federation-upstream-set": "all"}'
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost "vh.1" policies declare_override --name "pol.1" --definition "{""federation-upstream-set"": ""all""}"
```
</TabItem>
</Tabs>

Overrides prefix original policy names with `"overrides."` and truncate the result
at 255 bytes, the policy name length limit.

Deleting an overriding policy is no different from deleting any other policy.
Use `rabbitmqadmin policies delete --name [override policy name]`


<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost 'vh.1' policies delete --name 'overrides.pol.1'
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost "vh.1" policies delete --name "overrides.pol.1"
```
</TabItem>
</Tabs>


## Declaring a Blanket Policy {#blanket}

A blanket policy is a policy that covers all queues not covered by other
policies. By definition, such policies match all names.

To make sure it does not affect other policies, blanket policies use negative priorities.

While such a blanket queue can be declared using `rabbitmqctl` with the pattern of `.*` and a negative priority,
[`rabbitmqadmin` v2](./management-cli) provides a dedicated command for declaring
such specialized policies:

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
# This queue will match all objects in the vh.1 virtual host, that are not matched by another policy.
# To that end, it uses a negative priority and '.*' for the pattern.
rabbitmqadmin --vhost 'vh.1' policies declare_blanket \
    --name 'blanket.queues' \
    --apply-to 'queues' \
    --definition '{"federation-upstream-set": "all"}'
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# This queue will match all objects in the vh.1 virtual host, that are not matched by another policy.
# To that end, it uses a negative priority and '.*' for the pattern.
rabbitmqadmin.exe --vhost "vh.1" policies declare_blanket ^
    --name "blanket.queues" ^
    --apply-to "queues" ^
    --definition "{""federation-upstream-set"": ""all""}"
```
</TabItem>
</Tabs>

Blanket policies are often temporary in nature and used for specific purposes,
such as enabling [queue federation](./federated-queues) during a [Blue-Green Deployment-style](./blue-green-upgrade) migration
from one cluster to another.


## Updating Policies {#updating}

A policy can be updated by re-declaring it with a different definition, priority, and so on.
This requires the operator to have a full policy definition.

Alternatively, [`rabbitmqadmin` v2](./management-cli) provides commands that can modify
policy definitions, declare override policies and blanket policies.

### Policy Redefinition {#redefining}

If a full policy definition is known, [redefining](#defining) a policy with an updated definition
and (optionally) a new priority but the same original name will update it.

:::important

The effects of new settings on queues, streams and exchanges will take a moment to become effective,
in particular for clusters with a large number of entites (say, thousands).

:::

### Deleting Policy Definition Keys {#deleting-keys}

To delete one or multiple keys from a policy definition, use [`rabbitmqadmin policies delete_definition_keys`](./management-cli):

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash" default>
```bash
# removes all keys related to classic queue mirroring (that feature was removed in RabbitMQ 4.x)
# from the definition of a policy named "cq.policies.1" in virtual host vh-1
rabbitmqadmin --vhost "vh-1" policies delete_definition_keys --name "cq.policies.1" --definition-keys "ha-mode,ha-params,ha-promote-on-shutdown,ha-promote-on-failure,ha-sync-mode,ha-sync-batch-size"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# removes all keys related to classic queue mirroring (that feature was removed in RabbitMQ 4.x)
# from the definition of a policy named "cq.policies.1" in virtual host vh-1
rabbitmqadmin.exe --vhost "vh-1" policies delete_definition_keys --name "cq.policies.1" --definition-keys "ha-mode,ha-params,ha-promote-on-shutdown,ha-promote-on-failure,ha-sync-mode,ha-sync-batch-size"
```
</TabItem>
</Tabs>


The `--definitions-keys` parameter accepts a single definition key or a command-separated list of keys.

To perform the same operation across all policies in a virtual host, use [`rabbitmqadmin policies delete_definition_keys_from_all_in`](./management-cli):

```bash
# removes all keys related to classic queue mirroring (that feature was removed in RabbitMQ 4.x)
# from all policy definitions in virtual host vh-1
rabbitmqadmin --vhost "vh-1" policies delete_definition_keys_from_all_in --definition-keys "ha-mode,ha-params,ha-promote-on-shutdown,ha-promote-on-failure,ha-sync-mode,ha-sync-batch-size"
```


### Partially Updating Policy Definition {#patching}

[`rabbitmqadmin policies patch`](./management-cli) is a command that can update a policy
using a partial definition, for example, to add a [`max-length` key](./maxlength/) to an existing
policy:

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash" default>
```bash
rabbitmqadmin policies patch \
    --name "cq.pol.1" \
    --definition '{"max-length": 1000000}'
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe policies patch ^
    --name "cq.pol.1" ^
    --definition "{""max-length"": 1000000}"
```
</TabItem>
</Tabs>

The new `--definition` object will be merged into the existing policy definition.

In the following example, an existing policy named `queues.pol.1` in the default virtual host (`/`)
is updated to enable [queue federation](./federated-queues) to all the configured upstreams for the matched queues,
without affecting the rest of the policy definitions:

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash" default>
```bash
rabbitmqadmin policies patch \
    --name "queues.pol.1" \
    --definition '{"federation-upstream-set":"all"}'
````
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe policies patch ^
    --name "cq.pol.1" ^
    --definition '{"federation-upstream-set":"all""}"
```
</TabItem>
</Tabs>



## Operator Policies {#operator-policies}

### Difference From Regular Policies {#why-operator-policies-exist}

Sometimes it is necessary for the operator to enforce certain policies.
For example, it may be desirable to force [queue TTL](./ttl) but
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
    <tr>
      <th></th>
      <th><strong>Classic</strong></th>
      <th><strong>Quorum</strong></th>
      <th><strong>Stream</strong></th>
    </tr>
  </thead>
  <tbody>
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
  </tbody>
</table>

### Conflict Resolution with Regular Policies {#operator-policy-conflicts}

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
    <tr>
      <th></th>
      <th><strong>Classic</strong></th>
      <th><strong>Quorum</strong></th>
      <th><strong>Stream</strong></th>
    </tr>
  </thead>
  <tbody>
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
  </tbody>
</table>

When the same key is provided by both [client-provided `x-arguments`](./queues#optional-arguments) and by a user policy,
the former take precedence.
The exception to this rule are all stream configuration settings as well as `(x-)overflow` for quorum queues where the policy takes precedence.

However, if an operator policy is also used, that will take precedence over the client-provided
arguments, too. Operator policies are a protection mechanism and override client-provided values
and user policy values.

Use operator policies to introduce guardrails for application-controlled parameters related
to resource use (e.g. peak disk space usage).

### Defining Operator Policies {#operator-policy-definition}

Operator policies are defined in a way very similar to regular (user) policies.
When `rabbitmqctl` is used, the command name is `set_operator_policy`
instead of `set_policy`. In the HTTP API, `/api/policies/` in request path
becomes `/api/operator-policies/`:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_operator_policy transient-queue-ttl \
    "^amq\." '{"expires":1800000}' \
    --priority 1 \
    --apply-to queues
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin operator_policies declare \
    --name 'transient-queue-ttl' \
    --apply-to 'queues' \
    --definition '{"expires":1800000}' \
    --pattern '^amq\.' \
    --priority 1
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl.bat with PowerShell">
```PowerShell
rabbitmqctl.bat set_operator_policy transient-queue-ttl ^
    "^amq\." "{""expires"": 1800000}" ^
    --priority 1 ^
    --apply-to queues
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe operator_policies declare ^
    --name "transient-queue-ttl" ^
    --apply-to "queues" ^
    --definition "{""expires"": 1800000}" ^
    --pattern "^amq\." ^
    --priority 1
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
```ini
PUT /api/operator-policies/%2f/transient-queue-ttl
                {"pattern": "^amq\.",
                 "definition": {"expires": 1800000},
                 "priority": 1,
                 "apply-to": "queues"}
```
</TabItem>

<TabItem value="Management UI" label="Management UI">
<ol>
  <li>
    Navigate to `Admin` > `Policies` > `Add / update an operator
    policy`.
  </li>
  <li>
    Enter queue name ("transient-queue-ttl" in this example) next to Name, a pattern ("^amq\." in this example) next to
    `Pattern`, and select what kind of entities (queues in this example) the policy should apply to using the `Apply to`
    drop down.
  </li>
  <li>
    Enter "expires" = 1800000 in the first line next to
    `Policy`.
  </li>
  <li>
    Click `Add policy`.
  </li>
</ol>
</TabItem>
</Tabs>

:::danger
When multiple policies match an entity and they all have equal priorities, the effective one
will be chosen undeterministically. **Such cases should be avoided** by paying attention
to what priorities various policies use.
:::

### How to Disable Operator Policy Changes {#disable-operator-policy-changes}

Modification of operator policies via the HTTP API and Web UI can be disabled
in configuration. This makes operator policies read-only for all users via the
HTTP API and Web UI.

```ini
management.restrictions.operator_policy_changes.disabled = true
```


## Updating Operator Policies {#operator-policy-updating}

:::tip

Operator policies can be modified in a number of ways, very similarly
to [regular policies](#updating).

:::

Anoperator policy can be updated by re-declaring it with a different definition, priority, and so on.
This requires the operator to have a full policy definition.

Alternatively, [`rabbitmqadmin` v2](./management-cli) provides commands that can modify
operator policy definitions.

### Operator Policy Redefinition {#operator-policy-redefining}

If a full policy definition is known, [redefining](#operator-policy-definition) a policy with an updated definition
and (optionally) a new priority but the same original name will update it.

:::important

The effects of new settings on queues, streams and exchanges will take a moment to become effective,
in particular for clusters with a large number of entites (say, thousands).

:::

### Deleting Operator Policy Definition Keys {#operator-policy-deleting-keys}

To delete one or multiple keys from a policy definition, use [`rabbitmqadmin policies delete_definition_keys`](./management-cli):

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash" default>
```bash
# removes all keys related to classic queue mirroring (that feature was removed in RabbitMQ 4.x)
# from the definition of an operator policy named "cq.policies.1" in virtual host vh-1
rabbitmqadmin --vhost "vh-1" operator_policies delete_definition_keys \
    --name "cq.op-policies.1" \
    --definition-keys "ha-mode,ha-params,ha-promote-on-shutdown,ha-promote-on-failure,ha-sync-mode,ha-sync-batch-size"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# removes all keys related to classic queue mirroring (that feature was removed in RabbitMQ 4.x)
# from the definition of an operator policy named "cq.policies.1" in virtual host vh-1
rabbitmqadmin.exe --vhost "vh-1" operator_policies delete_definition_keys ^
    --name "cq.op-policies.1" ^
    --definition-keys "ha-mode,ha-params,ha-promote-on-shutdown,ha-promote-on-failure,ha-sync-mode,ha-sync-batch-size"
```
</TabItem>
</Tabs>


The `--definitions-keys` parameter accepts a single definition key or a command-separated list of keys.

To perform the same operation across all policies in a virtual host, use [`rabbitmqadmin operator_policies delete_definition_keys_from_all_in`](./management-cli):

```bash
# removes all keys related to classic queue mirroring (that feature was removed in RabbitMQ 4.x)
# from all operator policy definitions in virtual host vh-1
rabbitmqadmin --vhost "vh-1" operator_policies delete_definition_keys_from_all_in --definition-keys "ha-mode,ha-params,ha-promote-on-shutdown,ha-promote-on-failure,ha-sync-mode,ha-sync-batch-size"
```


### Partially Updating Operator Policy Definition {#operator-policy-patching}

[`rabbitmqadmin operator_policies patch`](./management-cli) is a command that can update a policy
using a partial definition, for example, to add a [`max-length` key](./maxlength/) to an existing
policy:

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash" default>
```bash
rabbitmqadmin operator_policies patch --name "cq.op-pol.1" --definition '{"max-length": 1000000}'
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```bash
rabbitmqadmin.exe operator_policies patch --name "cq.op-pol.1" --definition "{""max-length"": 1000000}"
```
</TabItem>
</Tabs>

The new `--definition` object will be merged into the existing policy definition.

In the following example, an existing operator policy named `queues.op-pol.1` in the default virtual host (`/`)
is updated to enable [queue federation](./federated-queues) to all the configured upstreams for the matched queues,
without affecting the rest of the policy definitions:

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash" default>
```bash
rabbitmqadmin operator_policies patch --name "queues.op-pol.1" --definition '{"federation-upstream-set":"all"}'
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```bash
rabbitmqadmin.exe operator_policies patch --name "queues.op-pol.1" --definition "{""federation-upstream-set"": ""all""}"
```
</TabItem>
</Tabs>

## Deleting an Operator Policy {#operator-policy-deleting}

An operator policy can be deleted using `rabbitmqctl clear_operator_policy` or `rabbitmqadmin operator_policies delete`.

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl clear_operator_policy --vhost "vh.1" "policy.name"
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost "vh.1" operator_policies delete --name "policy.name"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat clear_operator_policy --vhost "vh.1" "policy.name"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost "vh.1" operator_policies delete --name "policy.name"
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
```ini
DELETE /api/operator-policies/vh.1/policy.name
```
</TabItem>

<TabItem value="Management UI" label="Management UI">
<ol>
  <li>
    Navigate to `Admin` > `Policies` > Locate the operator policy to delete
  </li>
  <li>
    Click "Clear" next to the operator policy to delete it
  </li>
</ol>
</TabItem>
</Tabs>


## Troubleshooting

### Multiple Policies Have Conflicting Priorities

To verify this hypothesis, list the policies in the virtual host
and see if any policies have a priority equal to the one you are troubleshooting.

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl --vhost "target.vhost" list_policies --formatter=pretty_table
```
</TabItem>
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost "target.vhost" policies list_in
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat --vhost "target.vhost" list_policies --formatter=pretty_table
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost "target.vhost" policies list_in
```
</TabItem>
</Tabs>

If the results are empty, this means that no policies in the target virtual host
have matched the target object (queue, stream, exchange).

[`rabbitmqadmin` v2](./management-cli) additionally can list the policies
that match a specific object (if any):

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash" default>
```bash
# lists all policies that match a queue named "a.queue" in a virtual host named "target.vhost"
rabbitmqadmin --vhost "target.vhost" policies list_matching_object \
    --name "a.queue" \
    --type "queues"
```
</TabItem>
<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# lists all policies that match a queue named "a.queue" in a virtual host named "target.vhost"
rabbitmqadmin.exe --vhost "target.vhost" policies list_matching_object ^
    --name "a.queue" ^
    --type "queues"
```
</TabItem>
</Tabs>


Look for any and all policies that have equal priorities. Only one of them will apply
to a matching object (queue, stream, exchange), and the selection should be
considered non-deterministic (random).


### Policy Pattern or Target Type Does Not Match Object's Name or Type

To verify this hypothesis, list the policies that
match the object (e.g. queue) in question using [`rabbitmqadmin` v2](./management-cli).

<Tabs groupId="examples">
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash" default>
```bash
# lists all policies that match a queue named "a.queue" in a virtual host named "target.vhost"
rabbitmqadmin --vhost "target.vhost" policies list_matching_object \
    --name "a.queue" \
    --type "queues"
```
</TabItem>
<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# lists all policies that match a queue named "a.queue" in a virtual host named "target.vhost"
rabbitmqadmin.exe --vhost "target.vhost" policies list_matching_object ^
    --name "a.queue" ^
    --type "queues"
```
</TabItem>
</Tabs>

If the results are empty, this means that no policies in the target virtual host
have matched the target object (queue, stream, exchange).


### Policy Declared in the Wrong Virtual Host

Policies are virtual host-scoped, that is, belong to a particular virtual host and only
apply to the objects (queues, streams, exchanges) in that virtual host.

A policy can be declared in the default virtual host by mistake.
To verify this hypothesis, list only the policies in that virtual host.

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl --vhost "target.vhost" list_policies --formatter=pretty_table
```
</TabItem>
<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin --vhost "target.vhost" policies list_in
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat --vhost "target.vhost" list_policies --formatter=pretty_table
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe --vhost "target.vhost" policies list_in
```
</TabItem>
</Tabs>


If the results are empty, this means that there are no policies defined in the target virtual host.