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

# Alternate Exchanges

## <a id="overview" class="anchor" href="#overview">Overview</a>

It is sometimes desirable to let clients handle messages
that an exchange was unable to route (i.e. either because
there were no bound queues or no matching
bindings). Typical examples of this are

 * detecting when clients accidentally or maliciously publish messages that cannot be routed
 * "or else" routing semantics where some messages are handled specially and the rest by a generic handler

Alternate Exchange ("AE") is a feature that addresses these use cases.

## <a id="define" class="anchor" href="#define">How to Define an Alternate Exchange</a>

For any given exchange except for the default one, an AE can be defined by clients using
[policies](parameters.html#policies). This is the recommended option
as policies are significantly simplify changes to such options (e.g. during
upgrades).

In modern RabbitMQ versions, the default exchange is a special-cased convention in the code
and not a "real" exchange. Therefore it does not support the alternate exchange feature.

Alternatively, optional exchange arguments can be provided by client
at exchange declaration time.
In the case where both policy and arguments specify an AE, the one
specified in arguments overrules the one specified in policy.

### <a id="define-using-policy" class="anchor" href="#define-using-policy">Configuration Using a Policy</a>

This is the recommended way of defining alternate exchanges.

To specify an AE using policy, add the key 'alternate-exchange'
to a policy definition and make sure that the policy matches the exchange(s)
that need the AE defined. For example:

<pre class="lang-bash">
rabbitmqctl set_policy AE "^my-direct$" '{"alternate-exchange":"my-ae"}' --apply-to exchanges
</pre>

Or, on Windows:

<pre class="lang-powershell">
rabbitmqctl.bat set_policy AE "^my-direct$" "{""alternate-exchange"":""my-ae""}" --apply-to exchanges
</pre>

This will apply an AE of "my-ae" to the exchange called
"my-direct". Policies can also be defined using the management
plugin, see the [policy documentation](parameters.html#policies) for more details.



### <a id="define-using-arguments" class="anchor" href="#define-using-arguments">Configuration Using Client-provided Arguments</a>

This way of defining an alternate exchange is discouraged. Consider
using a policy instead (see above).

When creating an exchange the name of an AE can be
optionally supplied in the <code>exchange.declare</code>
method's <code>arguments</code> table by specifying a key
of 'alternate-exchange' and a value of type 'S' (string)
containing the name.

When an AE has been specified, in addition to the usual
<em>configure</em> permissions on the declared exchange,
the user needs to have <em>read</em> permissions on that
exchange and <em>write</em> permissions on the AE.

For example:

<pre class="lang-java">
Map&lt;String, Object&gt; args = new HashMap&lt;String, Object&gt;();
args.put("alternate-exchange", "my-ae");
channel.exchangeDeclare("my-direct", "direct", false, false, args);
channel.exchangeDeclare("my-ae", "fanout");
channel.queueDeclare("routed");
channel.queueBind("routed", "my-direct", "key1");
channel.queueDeclare("unrouted");
channel.queueBind("unrouted", "my-ae", "");
</pre>

In the above fragment of Java code we create a direct
exchange 'my-direct' that is configured with an AE called
'my-ae'. The latter is declared as a fanout exchange. We
bind one queue 'routed' to 'my-direct' with a binding key
of 'key1', and a queue 'unrouted' to 'my-ae'.


## <a id="how-it-works" class="anchor" href="#how-it-works">How Alternate Exchanges Work</a>

Whenever an exchange with a configured AE cannot route a message
to any queue, it publishes the message to the specified AE
instead. If that AE does not exist then a warning is logged. If
an AE cannot route a message, it in turn publishes the message
to its AE, if it has one configured. This process continues
until either the message is successfully routed, the end of the
chain of AEs is reached, or an AE is encountered which has
already attempted to route the message.

For example if we publish a message to 'my-direct' with a
routing key of 'key1' then that message is routed to the
'routed' queue, in accordance with the standard AMQP
behaviour.  However, when publishing a message to
'my-direct' with a routing key of 'key2', rather than
being discarded the message is routed via our configured
AE to the 'unrouted' queue.

The behaviour of an AE purely pertains to routing. If a message
is routed via an AE it still counts as routed for the purpose of
the 'mandatory' flag, and the message is otherwise unchanged.
