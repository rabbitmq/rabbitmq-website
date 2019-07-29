<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

# Federation Plugin

## <a id="overview" class="anchor" href="#overview">Overview</a>

The high-level goal of the federation plugin is to transmit messages between brokers without
requiring clustering. This is useful for a number of reasons.

### Loose Coupling of Nodes or Clusters

The federation plugin can transmit messages between brokers
(or clusters) in different administrative domains:

* they may have different users and virtual hosts;
* they may run on different versions of RabbitMQ and Erlang

### WAN friendliness

The federation plugin uses AMQP 0-9-1 to communicate between brokers, and is
designed to tolerate intermittent connectivity.

### Specificity

A broker can contain federated _and_ local-only components to best
fit the desired architecture of the system.

### Scalability with Growing Connected Node Count

Federation does not require O(n<sup>2</sup>) connections between
_N_ brokers (although this is the easiest way to set things up), which should mean it scales better.


## <a id="what-does-it-do" class="anchor" href="#what-does-it-do">What Does It Do?</a>

The federation plugin allows you to make exchanges and queues
<i>federated</i>. A federated exchange or queue can receive
messages from one or more <i>upstreams</i> (remote exchanges
and queues on other brokers). A federated exchange can route
messages published upstream to a local queue. A federated
queue lets a local consumer receive messages from an upstream queue.

Federation links connect to upstreams using RabbitMQ Erlang client. Therefore
they can connect to a specific vhost, use TLS, use multiple
<a href="http://www.rabbitmq.com/authentication.html">authentication mechanisms</a>.

For more details, see the documentation on <a href="federated-exchanges.html">federated
exchanges</a> and <a href="federated-queues.html">federated queues</a>.


## <a id="how-is-it-configured" class="anchor" href="#how-is-it-configured">How is Federation Set Up?</a>

To use federation, one needs to configure two things

 * One or more upstreams that define federation connections
   to other nodes. This can be done via <a href="/parameters.html">runtime parameters</a>
   or the <a href="https://github.com/rabbitmq/rabbitmq-federation-management">federation management plugin</a> which
   adds a federation management tab to the <a href="/management.html">management UI</a>.
 * One or more [policies](/parameters.html#policies) that match exchanges/queues and makes them
   federated.


## <a id="getting-started" class="anchor" href="#getting-started">Getting Started</a>

The federation plugin is included in the RabbitMQ distribution. To
enable it, use <a href="man/rabbitmq-plugins.8.html">rabbitmq-plugins</a>:

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_federation
</pre>

When using the management plugin, you will also want to
enable <code>rabbitmq_federation_management</code>:

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_federation_management
</pre>

When using a federation in a cluster, all the nodes of the
cluster should have the federation plugin enabled.

Information about federation upstreams is stored in the RabbitMQ
database, along with users, permissions, queues, etc. There
are three levels of configuration involved in federation:

 * **Upstreams**: each upstream defines how to connect to another broker.
 * **Upstream sets**: each upstream set groups together a set of upstreams to use for federation.
 * **Policies**: each [policy](/parameters.html#policies) selects a set of exchanges,
   queues or both, and applies a single upstream or an upstream
   set to those objects.

In practice, for simple use cases you can almost ignore the
existence of upstream sets, since there is an implicitly-defined upstream set called <code>all</code>
to which all upstreams are added.

Upstreams and upstream sets are both instances of <a href="/parameters.html">runtime parameters</a>.
Like exchanges and queues, each virtual host has its own distinct set of parameters and policies. For more
generic information on parameters and policies, see the guide on
<a href="/parameters.html">parameters and policies</a>.
For full details on the parameters used by federation, see the <a href="federation-reference.html">federation reference</a>.

Parameters and policies can be set in three ways - either with
an invocation of <code>rabbitmqctl</code>, a call to the
management HTTP API, or (usually) through the web UI presented
by <code>rabbitmq_federation_management</code>. The HTTP API
does not present all possibilities - in particular, it does not support management of upstream sets.

### <a id="tutorial" class="anchor" href="#tutorial">A Basic Example</a>

Here we will federate all the built-in exchanges except for
the default exchange, with a single upstream. The upstream
will be defined to buffer messages when disconnected for up
to one hour (3600000ms).

First let's define an upstream:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
<pre class="lang-bash">
rabbitmqctl set_parameter federation-upstream my-upstream \<br/>'{"uri":"amqp://server-name","expires":3600000}'
</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
<pre class="lang-powershell">
rabbitmqctl set_parameter federation-upstream my-upstream ^<br/>"{""uri"":""amqp://server-name"",""expires"":3600000}"
</pre>
    </td>
  </tr>
  <tr>
    <th>HTTP API</th>
    <td>
<pre class="lang-bash">
PUT /api/parameters/federation-upstream/%2f/my-upstream
{"value":{"uri":"amqp://server-name","expires":3600000}}
</pre>
    </td>
  </tr>
  <tr>
    <th>Web UI</th>
    <td>
      Navigate to <code>Admin</code> > <code>Federation Upstreams</code> >
      <code>Add a new upstream</code>. Enter "my-upstream" next to Name,
      "amqp://server-name" next to URI, and 36000000 next to
      Expiry. Click Add upstream.
    </td>
  </tr>
</table>

Then define a policy that will match built-in exchanges and use this upstream:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
<pre class="lang-bash">
rabbitmqctl set_policy --apply-to exchanges federate-me "^amq\." '{"federation-upstream-set":"all"}'
</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
<pre class="lang-powershell">
rabbitmqctl set_policy --apply-to exchanges federate-me "^amq\." ^<br/>"{""federation-upstream-set"":""all""}"
</pre>
    </td>
  </tr>
  <tr>
    <th>HTTP API</th>
    <td>
<pre class="lang-ini">
PUT /api/policies/%2f/federate-me
{"pattern":"^amq\.", "definition":{"federation-upstream-set":"all"}, \<br/> "apply-to":"exchanges"}
</pre>
    </td>
  </tr>
  <tr>
    <th>Web UI</th>
    <td>
      Navigate to `Admin` > `Policies` > `Add / update a policy`.
      Enter "federate-me" next to "Name", "^amq\." next to
      "Pattern", choose "Exchanges" from the "Apply to" drop down list
      and enter "federation-upstream-set" = "all"
      in the first line next to "Policy". Click "Add" policy.
    </td>
  </tr>
</table>

We tell the policy to federate all exchanges whose names
begin with "amq." (i.e. all the built in exchanges except
for the default exchange) with (implicit) low priority, and
to federate them using the implicitly created upstream set
"all", which includes our newly-created upstream.  Any other
matching policy with a priority greater than 0 will take
precedence over this policy. Keep in mind that <code>federate-me</code>
is just a name we used for this example, you can use any
string you want there.

The built in exchanges should now be federated because they are
matched by the policy. You can
check that the policy has applied to the exchanges by
checking the exchanges list in management or with:

<pre class="lang-bash">
rabbitmqctl list_exchanges name policy | grep federate-me
</pre>

And you can check that federation links for each exchange have come up with Admin > Federation Status > Running Links or with:

<pre class="lang-bash">
rabbitmqctl eval 'rabbit_federation_status:status().'
</pre>

In general there will be one federation link for each
upstream that is applied to an exchange. So for example with
three exchanges and two upstreams for each there will be six
links.

For simple use this should be all you need - you will probably
want to look at the <a href="uri-spec.html">AMQP URI
reference</a>. The <a href="federation-reference.html">federation
reference</a> contains more details on setting up upstreams and
upstream sets.


## <a id="link-failures" class="anchor" href="#link-failures">Federation Connection (Link) Failures</a>

Inter-node connections used by Federation are based on AMQP 0-9-1
connections. Federation links can be treated as special kind of clients
by operators.

Should a link fail, e.g. due to a network interruption, it will
attempt to re-connect. Reconnection period is a configurable value
that's defined in upstream definition. See
<a href="federation-reference.html">federation
reference</a> for more details on setting up upstreams and
upstream sets.

Links generally try to recover ad infinitum but there are scenarios
when they give up:

 * Failure rate is too high (max tolerated rate depends on
   upstream's <code>reconnect-delay</code> but is generally a failure
   every few seconds by default).
 * Link no longer can locate its "source" queue or exchange.
 * Policy changes in such a way that a link considers itself no longer necessary.

By increasing <code>reconnect-delay</code> for upstreams it is possible
to tolerate higher link failure rates. This is primarily relevant
for RabbitMQ installations where a moderate or large number of active links.


## <a id="clustering" class="anchor" href="#clustering">Federating Clusters</a>

Clusters can be linked together with federation just as single brokers
can. To summarise how clustering and federation interact:

 * You can define policies and parameters on any node in the downstream
   cluster; once defined on one node they will apply on all nodes.
 * Exchange federation links will start on any node in the
   downstream cluster. They will fail over to other nodes if
   the node they are running on crashes or stops.
 * Queue federation links will start on the same node as the
   downstream queue. If the downstream queue is mirrored, they
   will start on the same node as the master, and will be
   recreated on the same node as the new master if the node the
   existing master is running on crashes or stops.
 * To connect to an upstream cluster, you can specify multiple URIs in
   a single upstream. The federation link process will choose one of
   these URIs at random each time it attempts to connect.


## <a id="tls-connections" class="anchor" href="#tls-connections">Securing Federation Connections with TLS</a>

Federation connections (links) can be secured with TLS. Because Federation uses
a RabbitMQ client under the hood, it is necessary to both configure
source broker to <a href="/ssl.html">listen for TLS connections</a>
and Federation/Erlang client to use TLS.

To configure Federation to use TLS, one needs to

 * Use the <code>amqps</code> URI scheme instead of <code>amqp</code>
 * Specify CA certificate and client certificate/key pair via <a href="/uri-query-parameters.html">URI query parameters</a>
   when configuring upstream(s)
 * <a href="/ssl.html">Configure Erlang client to use TLS</a>

Just like with "regular" client connections, server's CA should be
trusted on the node where federation link(s) runs, and vice versa.
