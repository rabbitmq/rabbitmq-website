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

# Federation Reference

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guides provides a reference on all the fields that can be set
when defining various parameters related to [federation](federation.html).

Please refer to [other federation-related guides](federation.html) to learn about the concepts
and how to get started.

## <a id="configuration" class="anchor" href="#configuration">Configuration Reference</a>

### <a id="policies" class="anchor" href="#policies">Policies</a>

A policy can apply an upstream set (including the
implicitly-defined upstream set named "all") or a single upstream
to a set of exchanges and/or queues.

To apply all upstreams:

<pre class="lang-bash">
rabbitmqctl set_policy federate-me '^federated\.' '{"federation-upstream-set":"all"}'
</pre>

To apply a named set of upstreams:

<pre class="lang-bash">
rabbitmqctl set_parameter federation-upstream-set location-1 '[{"upstream": "up-1"}, {"upstream": "up-2"}]'

rabbitmqctl set_policy federate-me '^federated\.' '{"federation-upstream-set":"location-1"}'
</pre>

To apply a single upstream:

<pre class="lang-bash">
rabbitmqctl set_policy federate-me '^federated\.' '{"federation-upstream":"up-1"}'
</pre>

Note that you cannot use the <code>federation-upstream</code>
and <code>federation-upstream-set</code> keys together in a
policy. For more detail on policies, see the <a href="parameters.html#policies">policy</a> documentation.

### <a id="upstreams" class="anchor" href="#upstreams">Upstreams</a>

A <code>federation-upstream</code> parameter specifies how
to connect to a remote node or cluster as well as certain properties
of a link (connection). Upstreams are defined using the
`rabbitmqctl set_parameter federation-upstream` command which accepts
an upstream name and an upstream definition JSON object:

<pre class="lang-bash">
rabbitmqctl set_parameter federation-upstream <i>name</i> '<i>json-object</i>'
</pre>

The upstream definition object can contain the following keys:

#### Applicable to Both Federated Exchanges and Queues

<table>
  <thead>
    <tr>
      <td>Parameter Name</td>
      <td>Description</td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td><code>uri</code></td>
      <td>
        The  <a href="./uri-spec.html">AMQP URI(s)</a> for the upstream.
        See the <a href="./uri-query-parameters.html">query parameter reference</a> for the underlying client library extensions
        (including those for <a href="./ssl.html">TLS</a>) which are available to federation.

        The value can either be a string, or a list of
        strings. If more than one string is provided, the federation
        plugin will randomly pick <b>one</b> URI from the list when attempting to connect. This can
        be used to connect to an upstream cluster and ensure the link
        will eventually find another node in the event that one fails.
        All URIs are assumed to be pointed at nodes in a single cluster.
        To connect to multiple endpoints in separate clusters simultaneously use multiple upstreams.
      </td>
    </tr>

    <tr>
      <td><code>prefetch-count</code></td>
      <td>
        The <a href="./confirms.html">maximum number of deliveries pending acknowledgement</a> on a link at
        any given time. Default is <code>1000</code>. Increasing this value can improve link
        throughput up to a point but will also result in higher memory usage of the link.
      </td>
    </tr>

    <tr>
      <td><code>reconnect-delay</code></td>
      <td>
        The duration (in seconds) to wait before reconnecting to the broker
        after being disconnected. Default is 1.
      </td>
    </tr>

    <tr>
      <td><code>ack-mode</code></td>
      <td>
        Determines how the link should acknowledge messages. If set
        to <code>on-confirm</code> (the default), messages are
        acknowledged to the upstream broker after they have been
        confirmed downstream. This handles network errors and broker
        failures without losing messages, and is the slowest option.


        If set to <code>on-publish</code>, messages are acknowledged to
        the upstream broker after they have been published
        downstream. This handles network errors without losing messages,
        but may lose messages in the event of broker failures.


        If set to <code>no-ack</code>, message acknowledgements are not
        used. This is the fastest option, but may lose messages in the
        event of network or broker failures.
      </td>
    </tr>

    <tr>
      <td><code>trust-user-id</code></td>
      <td>
        Determines how federation should interact with
        the <a href="validated-user-id.html">validated user-id</a> feature.
        If set to <code>true</code>, federation will pass through any validated user-id from
        the upstream, even though it cannot validate it itself.
        If set to <code>false</code> or not set, it will
        clear any validated user-id it encounters. You should
        only set this to <code>true</code> if you trust the
        upstream server (and by extension, all its upstreams)
        not to forge user-ids.
      </td>
    </tr>
  </tbody>
</table>


#### Applying to Federated Exchanges Only

The following upstream parameters are only applicable to <a href="./federated-exchanges.html">federated exchanges</a>.

<table>
  <thead>
    <tr>
      <td>Parameter Name</td>
      <td>Description</td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td><code>exchange</code></td>
      <td>
        The name of the upstream exchange. Default is to use the
        same name as the federated exchange.
      </td>
    </tr>

    <tr>
      <td><code>max-hops</code></td>
      <td>
        The maximum number of federation links that a message
        published to a federated exchange can traverse before it
        is discarded. Default is 1. Note that even if
        <code>max-hops</code> is set to a value greater than 1,
        messages will never visit the same node twice due to
        travelling in a loop. However, messages may still be
        duplicated if it is possible for them to travel from the
        source to the destination via multiple routes.
      </td>
    </tr>

    <tr>
      <td><code>expires</code></td>
      <td>
        The expiry time (in milliseconds) after which
        an <a href="federated-exchanges.html#implementation">upstream queue</a> for
        a federated exchange may be deleted if a connection to the upstream is lost.
        The default is <code>'none'</code>, meaning no expiration will be applied to the queue.

        This setting controls how long the upstream queue will
        last before it is eligible for deletion if the connection is lost.

        This value controls <a href="./ttl.html">TTL settings</a> for the upstream queue.
      </td>
    </tr>

    <tr>
      <td><code>message-ttl</code></td>
      <td>
        The expiry time for messages in the <a href="federated-exchanges.html#implementation">upstream queue</a>
        for a federated exchange (see <code>expires</code>), in milliseconds.
        Default is <code>'none'</code>, meaning messages should never expire.
        This does not apply to federated queues.

        This value controls <a href="./ttl.html">TTL settings</a> for the messages in the upstream queue.
      </td>
    </tr>
  </tbody>
</table>


#### Applicable to Federated Queues Only

<table>
  <thead>
    <tr>
      <td>Parameter Name</td>
      <td>Description</td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td><code>queue</code></td>
      <td>
        The name of the upstream queue. Default is to use the same
        name as the federated queue.
      </td>
    </tr>

    <tr>
      <td><code>consumer-tag</code></td>
      <td>
        The consumer tag to use when consuming from upstream. Optional.
      </td>
    </tr>
  </tbody>
</table>


## <a id="upstream-sets" class="anchor" href="#upstream-sets">Upstream Sets</a>

Each <code>upstream-set</code> is a set of upstreams. It can be more convenient to use a set
and refer to it in a federation policy definition that repeatedly listing upstreams.

<pre class="lang-bash">
# up-1 and up-2 are previously declared upstreams
rabbitmqctl set_parameter federation-upstream-set location-1 '[{"upstream": "up-1"}, {"upstream": "up-2"}]'
</pre>

Supported keys of the JSON objects are

<table>
  <thead>
    <tr>
      <td>Parameter Name</td>
      <td>Description</td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td><code>upstream</code></td>
    </tr>
    <tr>
      <td>
        The name of an upstream. Mandatory.
      </td>
    </tr>
  </tbody>
</table>

In addition, any of the properties from an upstream can be
overridden in an upstream set.

There is an implicitly-defined upstream set, <code>all</code>,
which contains all upstreams created in the target virtual host.


## <a id="cluster-name" class="anchor" href="#cluster-name">cluster name</a>

The federation plugin uses the cluster name defined within the server
to identify itself to other nodes in the federation graph.
The default is constructed from the RabbitMQ node name and
the fully-qualified domain name of the first node to form the cluster.

This can be changed with the

<code>rabbitmqctl set_cluster_name</code>

command or via the management UI.

It is important to specify this explicitly if your DNS will
not give machines distinct names.

Here's an Example:

<pre class="lang-bash">
rabbitmqctl set_cluster_name "east1-production"
</pre>
