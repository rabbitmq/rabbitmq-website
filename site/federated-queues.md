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

# Federated Queues

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers federated queues, a subset of functionality offered by the [Federation plugin](federation.html).

Some covered topics include:

* An overview of queue federation
* Common [use cases](#use-cases)
* [Usage and configuration](#usage)
* [Limitations](#limitations) and [pitfalls](#pitfalls) of queue federation
* [Implementation details](#details)

A separate [Federation plugin reference](./federation-reference.html) guide is available.

In addition to [federated exchanges](federated-exchanges.html), RabbitMQ supports federated queues.
This feature provides a way of balancing the load of a single logical queue
across nodes or clusters. It does so by moving messages to other federation
peers (nodes or clusters) when the local queue has no consumers.

While federated exchanges replicate their stream of messages from the upstream
to one or more downstreams, federated queues move data where the consumers are,
always preferring local consumers to remote ones. Federated queues are considered
to be equal peers, there is no "leader/follower" relationship between them like with federated exchanges.

A federated queue links to other of its federated peers (called _upstream_ queues).
It will retrieve messages from upstream queues in order to satisfy demand for
messages from local consumers. The upstream queues do not
need to be reconfigured. They are assumed to be located on a separate node or in a separate
cluster.

An upstream definition is a URI with certain recognised query parameters that
control link connection parameters. Upstreams can be managed using [CLI tools](cli.html)
or the HTTP API with [an additional plugin](https://github.com/rabbitmq/rabbitmq-federation-management).

The following diagram demonstrates several federated and unfederated
queues in two RabbitMQ nodes connected using queue federation:

<img src="./img/federation/federated_queues00.png" width="700" alt="Overview of federated queues" />

When queue federation is used, usually only a subset of queues in a cluster is federated.
Some queues can be inherently local to the "site" (cluster) and its uses.


## <a id="use-cases" class="anchor" href="#use-cases">Use Cases</a>

The typical use would be to have the same "logical" queue
distributed over many brokers. Each broker would declare a federated
queue with all the other federated queues upstream. The links
would form a complete bi-directional graph on the federated peers (nodes or clusters).


Such a logical distributed queue is capable of having rather
higher capacity than a single queue. It will perform best when
there is some degree of locality; i.e. as many messages as
possible are consumed from the same queue as they were published
to, and the federation mechanism only needs to move messages
around in order to perform load balancing.

Brokers running different versions of RabbitMQ can be connected using federation.

## <a id="limitations" class="anchor" href="#limitations">Limitations</a>

Federated queues include a number of limitations or differences compared to their non-federated peers
as well as federated exchanges.

Queue federation will not propagate [bindings](./tutorials/amqp-concepts.html) from the downstream to the upstreams.

Applications that use <code>basic.get</code> (consume via polling, a highly discouraged practice)
cannot retrieve messages over federation if there aren't any in a local queue (on the node the client is connected to).
Since <code>basic.get</code> is a synchronous method, the node serving a request would have to
block while contacting all the other nodes to retrieve more
messages. This wouldn't sit well with federation's availability and partition tolerance-oriented
design and use cases.

## <a id="usage" class="anchor" href="#usage">Usage and Configuration</a>

Federated queues are declared just like any other queue, by applications.
In order for RabbitMQ to recognize that a queue needs to be federated,
and what other nodes messages should be consumed from, _downstream_
(consuming) nodes need to be configured.

<img src="./img/federation/federated_queues01.png" width="700" alt="Federated queue policies" />

Federation configuration uses [runtime parameters and policies](parameters.html), which means it can be configured
and reconfigured on the fly as system topology changes. There are two key pieces of configuration involved:

* Upstreams: these are remote endpoints in a federated system
* Federation policies: these control what queues are federated and what upstreams (peers) they will connect to

Both of those are configured on the downstream nodes or clusters.

To add an upstream, use the `rabbitmqctl set_parameter` command. It accepts three parameters:

  * Parameter type, `federation-upstream`
  * An upstream name that federation policies will refer to
  * An upstream definition JSON document with at least one mandatory key, `uri`

The following example configures an upstream named "origin" which can be contacted at `remote-host.local:5672`:

<pre class="lang-bash">
# Adds a federation upstream named "origin"
rabbitmqctl set_parameter federation-upstream origin '{"uri":"amqp://remote-host.local:5672"}'
</pre>

On Windows, use <code>rabbitmqctl.bat</code> and suitable PowerShell quoting:

<pre class="lang-powershell">
# Adds a federation upstream named "origin"
rabbitmqctl.bat set_parameter federation-upstream origin "{""uri"":""amqp://remote-host.local:5672""}"
</pre>

Once an upstream has been specified, a policy that controls federation can be added.
It is added just like any other [policy](parameters.html#policies), using `rabbitmqctl set_policy`:

<pre class="lang-bash">
# Adds a policy named "queue-federation"
rabbitmqctl set_policy queue-federation "^federated\." '{"federation-upstream-set":"all"}' \
    --priority 10 \
    --apply-to queues
</pre>

Here's a Windows version of the above example:

<pre class="lang-powershell">
# Adds a policy named "queue-federation"
rabbitmqctl.bat set_policy queue-federation "^federated\." "{""federation-upstream-set"":""all""}" ^
    --priority 10 ^
    --apply-to queues
</pre>

In the example above, the policy will match queues whose name begins with a `federated.` prefix
in the default virtual host. Those queues will set up federation links for all declared upstreams.
The name of the policy is `queue-federation`. As with any policy, if multiple policies match a queue,
the one with the highest priority will be used. Multiple policy definitions will not be combined, even if their
priorities are equal.

Once configured, a federation link (connection) will be opened for every matching queue and upstream pair.
By "matching queue" here we mean a queue that is matched by the [federation policy pattern](parameters.html#policies).
If no queues matched, no links will be started.

To deactivate federation for the matching queues, delete the policy using its name:

<pre class="lang-bash">
rabbitmqctl clear_policy queue-federation
</pre>


## <a id="loops" class="anchor" href="#loops">Complex Topologies and Loop Handling</a>

A federated queue can be "upstream"
from another federated queue. One can even form "loops", for
example, queue A declares queue B to be upstream from it, and
queue B declares queue A to be upstream from it. More complex
multiple-connected arrangements are allowed. Such complex topologies
will be increasingly difficult to reason about and troubleshoot, however.

Unlike federated exchanges, queue federation does not replicate data and
does not handle loops explicitly. There is no limit to how
many times a message can be forwarded between federated queues.

In a set of mutually-federated queues, messages will move to where
the spare consuming capacity is so if the spare consuming
capacity keeps moving around then so will the messages. Since messages are moved to remote nodes
only when there are no local consumers, it is rare for a message to be moved
across all nodes and "wrap around".


## <a id="details" class="anchor" href="#details">Implementation</a>

The federated queue will connect to all its upstream queues
using AMQP 0-9-1 (optionally [secured with TLS](ssl.html)).

The federated queue will only retrieve messages when it has run
out of messages locally, it has consumers that need messages, and
the upstream queue has "spare" messages that are not being
consumed. The intent is to ensure that messages are only
transferred between federated queues when needed. This is
implemented using [consumer priorities](consumer-priority.html).

If messages are forwarded from one queue to another then message
ordering is only preserved for messages which have made exactly
the same journey between nodes. In some cases messages which were
adjacent when published may take different routes to the same node
to be consumed; therefore messages can be reordered in the
presence of queue federation.

Each individual queue applies its arguments separately;
for example if you set `x-max-length` on a federated
queue then that queue will have its length limited (possibly
discarding messages when it gets full) but other queues that are
federated with it will not be affected. Note in particular that
when [per-queue or per-message TTL](ttl.html) is in
use, a message will have its timer reset when it is transferred to
another queue.


## <a id="pitfalls" class="anchor" href="#pitfalls">Pitfalls</a>

Federated queues cannot currently cause messages to
traverse multiple hops between brokers based solely on need for
messages in one place. For example, if you federate queues on
nodes A, B and C, with A and B connected and B and C connected,
but not A and C, then if messages are available at A and consumers
waiting at C then messages will not be transferred from A to C via
B unless there is also a consumer at B.

It is possible to bind a federated queue to a federated
exchange. However, the results may be unexpected to some.
Since a federated exchange will retrieve messages from its
upstream that match its bindings, any message published to a
federated exchange will be copied to any nodes that matching
bindings. A federated queue will then move these messages
around between nodes, and it is therefore possible to end up
with multiple copies of the same message on the same node.
