<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Monitoring

## <a id="overview" class="anchor" href="#overview">Overview</a>

This document provides an overview of topics related to RabbitMQ monitoring.
Monitoring your RabbitMQ installation is an effective means to detect issues before they affect
the rest of your environment and, eventually, your users.

Many aspects of the system can be monitored. This guide will group them into a handful of
categories:

 * [What is monitoring](#approaches-to-monitoring), what common approaches to it
   exist and why it is important.
 * What [infrastructure and kernel metrics](#system-metrics) are important to monitor
 * What [RabbitMQ metrics](#rabbitmq-metrics) are available:
     * [Node metrics](#node-metrics)
     * [Queue metrics](#queue-metrics)
     * [Cluster-wide metrics](#cluster-wide-metrics)
 * [How frequently](#monitoring-frequency) should monitoring checks be performed?
 * [Application-level metrics](#app-metrics)
 * How to check a [node's health](#health-checks) and why it's more involved than a single
   CLI command.

[Log aggregation](#log-collection) across all nodes and applications is closely related to monitoring
and also covered in this guide.

A number of [popular tools](#monitoring-tools), both open source and commercial,
can be used to monitor RabbitMQ.


## <a id="approaches-to-monitoring" class="anchor" href="#approaches-to-monitoring">What is Monitoring?</a>

In this guide we define monitoring as a process of
capturing the behaviour of a system via health checks and metrics  over time.
This helps detect anomalies: when the system is unavailable, experiences an unusual load,
exhausted of certain resources or otherwise does not behave within its normal
(expected) parameters. Monitoring involves collecting and storing metrics for the long term,
which is important for more than anomaly detection
but also root cause analysis, trend detection and capacity planning.

Monitoring systems typically integrate with alerting systems.

When an anomaly is detected by a monitoring system an alarm of some sort is typically
passed to an alerting system, which notifies interested parties such as the technical operations team.

Having monitoring in place means that important deviations in system behavior,
from degraded service in some areas to complete unavailability, is easier
to detect and the root cause takes much less time to find.
Operating a distributed system is a bit like trying to get out of a forest
without a GPS navigator device or compass. It doesn't matter how brilliant or experienced
the person is, having relevant information is very important for
a good outcome.

A [Health check](#health-checks) is the most basic aspect of monitoring. It involves a command or
set of commands that collect a few essential metrics of the monitored system [over
time](#monitoring-frequency) and test them. For example, whether RabbitMQ's Erlang VM is running is
one such check. The metric in this case is "is an OS process running?". The normal operating
parameters are "the process must be running". Finally, there is an evaluation step.

Of course, there are more varieties of health checks. Which ones are most appropriate depends on the
definition of a "healthy node" used. So, it is a system- and team-specific decision. [RabbitMQ CLI
tools](/cli.html) provide commands that can serve as useful health checks. They will be covered
[later in this guide](#health-checks).

While health checks are a useful tool, they only provide so much insight into the state of the
system because they are by design focused on one or a handful of metrics, usually check a single
node and can only reason about the state of that node at a particular moment in time. For a more
comprehensive assessment, collect more metrics [over time](#monitoring-frequency). This detects more
types of anomalies as some can only be identified over longer periods of time. This is usually done
by tools known as monitoring tools of which there are a grand variety. This guides covers some tools
used for RabbitMQ monitoring.

Some metrics are RabbitMQ-specific: they are [collected and reported by RabbitMQ
nodes](#rabbitmq-metrics). Rest of the guide refers to them as "RabbitMQ metrics". Examples include
the number of socket descriptors used, total number of enqueued messages or inter-node communication
traffic rates. Others metrics are [collected and reported by the OS kernel](#system-metrics). Such
metrics are often called system metrics or infrastructure metrics. System metrics are not specific
to RabbitMQ. Examples include CPU utilisation rate, amount of memory used by processes, network
packet loss rate, et cetera. Both types are important to track. Individual metrics are not always
useful but when analysed together, they can provide a more complete insight into the state of the
system. Then operators can form a hypothesis about what's going on and needs addressing.

### <a id="monitoring-frequency" class="anchor" href="#monitoring-frequency">Frequency of Monitoring</a>

Many monitoring systems poll their monitored services periodically. How often that's
done varies from tool to tool but usually can be configured by the operator.

Very frequent polling can have negative consequences on the system under monitoring. For example,
excessive load balancer checks that open a test TCP connection to a node can lead to a [high connection churn](/networking.html#dealing-with-high-connection-churn).
Excessive checks of channels and queues in RabbitMQ will increase its CPU consumption. When there
are many (say, 10s of thousands) of them on a node, the difference can be significant.

The recommended metric collection interval is 60 second. To collect at a higher rate, use 30 second.
A lower interval will increase load on the system and provide no practical benefits.

### <a id="system-metrics" class="anchor" href="#system-metrics">Infrastructure and Kernel Metrics</a>

First step towards a useful monitoring system starts with infrastructure and
kernel metrics. There are quite a few of them but some are more important than others.
Collect the following metrics on all hosts that run RabbitMQ nodes or applications:

 * CPU stats (user, system, iowait &amp; idle percentages)
 * Memory usage (used, buffered, cached &amp; free percentages)
 * [Virtual Memory](https://www.kernel.org/doc/Documentation/sysctl/vm.txt) statistics (dirty page flushes, writeback volume)
 * Disk I/O (operations &amp; amount of data transferred per unit time, time to service operations)
 * Free disk space on the mount used for the [node data directory](/relocate.html)
 * File descriptors used by `beam.smp` vs. [max system limit](/networking.html#open-file-handle-limit)
 * TCP connections by state (`ESTABLISHED`, `CLOSE_WAIT`, TIME_WAIT`)
 * Network throughput (bytes received, bytes sent) & maximum network throughput)
 * Network latency (between all RabbitMQ nodes in a cluster as well as to/from clients)

There is no shortage of existing tools (such as Prometheus or Datadog) that collect infrastructure
and kernel metrics, store and visualise them over periods of time.


## <a id="rabbitmq-metrics" class="anchor" href="#rabbitmq-metrics">RabbitMQ Metrics</a>

The RabbitMQ [management plugin](management.html) provides an API for
accessing RabbitMQ metrics. The plugin will store up to one day's worth of
metric data. Longer term monitoring should be accomplished with an [external tool](#monitoring-tools).

This section will cover multiple RabbitMQ-specific aspects of monitoring.

### <a id="clusters" class="anchor" href="#clusters">Monitoring of Clusters</a>

When monitoring clusters it is important to understand the guarantees provided by the
HTTP API. In a clustered environment every node can serve metric endpoint requests.
Cluster-wide metrics can be fetched from any node that [can contact its peers](/management.html#clustering). That node
will collect and combine data from its peers as needed before producing a response.

Every node also can serve requests to endpoints that provide [node-specific metrics](#node-metrics)
for itself as well as other cluster nodes. Like with [infrastructure and OS metrics](#system-metrics),
node-specific metrics must be collected for each node. Monitoring tools can execute HTTP API requests against any node.

As mentioned earlier, inter-node connectivity issues
will [affect HTTP API behaviour](/management.html#clustering). Choose a random online node for monitoring requests.
For example, using a load balancer or [round-robin DNS](https://en.wikipedia.org/wiki/Round-robin_DNS).

Some endpoints perform operations on the target node. Node-local health checks is the most common
example. Those are an exception, not the rule.

### <a id="cluster-wide-metrics" class="anchor" href="#cluster-wide-metrics">Cluster-wide Metrics</a>

Cluster-wide metrics provide a high level view of cluster state. Some of them describe interaction
between nodes. Examples of such metrics are cluster link traffic and detected network partitions.
Others combine metrics across all cluster members. A complete list of connections to all nodes would
be one example. Both types are complimentary to infrastructure and node metrics.

`GET /api/overview` is the [HTTP API](management.html#http-api) endpoint that returns cluster-wide metrics.

<table>
  <thead>
    <tr><td>Metric</td><td>JSON field name</td></tr>
  </thead>
  <tbody>
    <tr>
      <td>Cluster name</td>
      <td>`cluster_name`</td>
    </tr>
    <tr>
      <td>Cluster-wide message rates</td>
      <td>`message_stats`</td>
    </tr>
    <tr>
      <td>Total number of connections</td>
      <td>`object_totals.connections`</td>
    </tr>
    <tr>
      <td>Total number of channels</td>
      <td>`object_totals.channels`</td>
    </tr>
    <tr>
      <td>Total number of queues</td>
      <td>`object_totals.queues`</td>
    </tr>
    <tr>
      <td>Total number of consumers</td>
      <td>`object_totals.consumers`</td>
    </tr>
    <tr>
      <td>Total number of messages (ready plus unacknowledged)</td>
      <td>`queue_totals.messages`</td>
    </tr>
    <tr>
      <td>Number of messages ready for delivery</td>
      <td>`queue_totals.messages_ready`</td>
    </tr>
    <tr>
      <td>Number of <a href="/confirms.html">unacknowledged</a> messages</td>
      <td>`queue_totals.messages_unacknowledged`</td>
    </tr>
    <tr>
      <td>Messages published recently</td>
      <td>`message_stats.publish`</td>
    </tr>
    <tr>
      <td>Message publish rate</td>
      <td>`message_stats.publish_details.rate`</td>
    </tr>
    <tr>
      <td>Messages delivered to consumers recently</td>
      <td>`message_stats.deliver_get`</td>
    </tr>
    <tr>
      <td>Message delivery rate</td>
      <td>`message_stats.deliver_get.rate`</td>
    </tr>
    <tr>
      <td>Other message stats</td>
      <td>`message_stats.*` (see <a href="https://rawcdn.githack.com/rabbitmq/rabbitmq-management/master/priv/www/doc/stats.html)">this document</a></td>
    </tr>
  </tbody>
</table>

### <a id="node-metrics" class="anchor" href="#node-metrics">Node Metrics</a>

There are two  [HTTP API](management.html#http-api) endpoints that provide access to node-specific metrics:

 * `GET /api/nodes/{node}` returns stats for a single node
 * `GET /api/nodes` returns stats for all cluster members

The latter endpoint returns an array of objects. Monitoring tools that support (or can support) that
as an input should prefer that endpoint since it redunces the number of requests. When that's not
the case, use the former endpoint to retrieve stats for every cluster member in turn. That implies
that the monitoring system is aware of the list of cluster members.

Most of the metrics represent point-in-time absolute values. Some, represent activity over a recent
period of time (for example, GC runs and bytes reclaimed). The latter metrics are most useful when
compared to their previous values and historical mean/percentile values.

<table>
  <thead>
    <tr><td>Metric</td><td>JSON field name</td></tr>
  </thead>
  <tbody>
    <tr>
      <td>Total amount of <a href="/memory-use.html">memory used</a></td>
      <td>`mem_used`</td>
    </tr>
    <tr>
      <td>Memory usage high watermark</td>
      <td>`mem_limit`</td>
    </tr>
    <tr>
      <td>Is a <a href="/memory.html">memory alarm</a> in effect?</td>
      <td>`mem_alarm`</td>
    </tr>
    <tr>
      <td>Free disk space low watermark</td>
      <td>`disk_free_limit`</td>
    </tr>
    <tr>
      <td>Is a <a href="/disk-alarms.html">disk alarm</a> in effect?</td>
      <td>`disk_free_alarm`</td>
    </tr>
    <tr>
      <td><a href="/networking.html#open-file-handle-limit">File descriptors available</a></td>
      <td>`fd_total`</td>
    </tr>
    <tr>
      <td>File descriptors used</td>
      <td>`fd_used`</td>
    </tr>
    <tr>
      <td>File descriptor open attempts</td>
      <td>`io_file_handle_open_attempt_count`</td>
    </tr>
    <tr>
      <td>Sockets available</td>
      <td>`sockets_total`</td>
    </tr>
    <tr>
      <td>Sockets used</td>
      <td>`sockets_used`</td>
    </tr>
    <tr>
      <td>Message store disk reads</td>
      <td>`message_stats.disk_reads`</td>
    </tr>
    <tr>
      <td>Message store disk writes</td>
      <td>`message_stats.disk_writes`</td>
    </tr>
    <tr>
      <td>Inter-node communication links</td>
      <td>cluster_links</td>
    </tr>
    <tr>
      <td>GC runs</td>
      <td>`gc_num`</td>
    </tr>
    <tr>
      <td>Bytes reclaimed by GC</td>
      <td>`gc_bytes_reclaimed`</td>
    </tr>
    <tr>
      <td>Erlang process limit</td>
      <td>`proc_total`</td>
    </tr>
    <tr>
      <td>Erlang processes used</td>
      <td>`proc_used`</td>
    </tr>
    <tr>
      <td>Runtime run queue</td>
      <td>`run_queue`</td>
    </tr>
  </tbody>
</table>

### <a id="queue-metrics" class="anchor" href="#queue-metrics">Individual Queue Metrics</a>

Individual queue metrics are made available through the [HTTP API](management.html#http-api)
via the `GET /api/queues/{vhost}/{qname}` endpoint.

<table>
  <thead>
    <tr><td>Metric</td><td>JSON field name</td></tr>
  </thead>
  <tbody>
    <tr>
      <td>Memory</td>
      <td>`memory`</td>
    </tr>
    <tr>
      <td>Total number of messages (ready plus unacknowledged)</td>
      <td>`messages`</td>
    </tr>
    <tr>
      <td>Number of messages ready for delivery</td>
      <td>`messages_ready`</td>
    </tr>
    <tr>
      <td>Number of <a href="/confirms.html">unacknowledged</a> messages</td>
      <td>`messages_unacknowledged`</td>
    </tr>
    <tr>
      <td>Messages published recently</td>
      <td>`message_stats.publish`</td>
    </tr>
    <tr>
      <td>Message publishing rate</td>
      <td>`message_stats.publish_details.rate`</td>
    </tr>
    <tr>
      <td>Messages delivered recently</td>
      <td>`message_stats.deliver_get`</td>
    </tr>
    <tr>
      <td>Message delivery rate</td>
      <td>`message_stats.deliver_get.rate`</td>
    </tr>
    <tr>
      <td>Other message stats</td>
      <td>`message_stats.*` (see <a href="https://rawcdn.githack.com/rabbitmq/rabbitmq-management/master/priv/www/doc/stats.html)">this document</a></td>
    </tr>
  </tbody>
</table>

## <a id="app-metrics" class="anchor" href="#app-metrics">Application-level Metrics</a>

A system that uses messaging is almost always distributed. In such systems it is often not
immediately obvious which component is misbehaving. Every single part of the system, including
applications, should be monitored and investigated.

Some infrastructure-level and RabbitMQ metrics can show
presence of an unusual system behaviour or issue but can't pin
point the root cause. For example, it is easy to tell that a
node is running out of disk space but not always easy to tell why.
This is where application metrics come in: they can help identify
a run-away publisher, a repeatedly failing consumer, a consumer that cannot
keep up with the rate, even a downstream service that's experiencing a slowdown
(e.g. a missing index in a database used by the consumers).

Some client libraries and frameworks
provide means of registering metrics collectors or collect metrics out of the box.
[RabbitMQ Java client](/api-guide.html) and [Spring AMQP](http://spring.io/projects/spring-amqp) are two examples.
With others developers have to track metrics in their application code.

What metrics applications track can be system-specific but some are relevant
to most systems:

 * Connection opening rate
 * Channel opening rate
 * Connection failure (recovery) rate
 * Publishing rate
 * Delivery rate
 * Positive delivery acknowledgement rate
 * Negative delivery acknowledgement rate
 * Mean/95th percentile delivery processing latency


## <a id="health-checks" class="anchor" href="#health-checks">Health Checks</a>

A health check is a command that
tests whether an aspect of the RabbitMQ service is operating as expected.
Health checks are [executed periodically by machines](#monitoring-frequency) or interactively by operators.

There is a series of health checks that can be performed, starting
with the most basic and very rarely producing [false positives](https://en.wikipedia.org/wiki/False_positives_and_false_negatives),
to increasingly more comprehensive, intrusive, and opinionated that have a
higher probability of false positives. In other words, the more comprehensive a
health check is, the less conclusive the result will be.

Health checks can verify the state of an individual node (node health checks), or the entire cluster
(cluster health checks).

### <a id="individual-checks" class="anchor" href="#individual-checks">Individual Node Checks</a>

This section covers several examples of node health check. They are organised in stages.
Higher stages perform more comprehensive and opinionated checks. Such checks will have a higher probability of
false positives. Some stages have dedicated RabbitMQ CLI tool commands, other scan involve extra tools.

While the health checks are ordered, a higher number does not mean a check is "better".

The health checks can be used selectively and combined.
Unless noted otherwise, the checks should follow the same [monitoring frequency](#monitoring-frequency) recommendation
as metric collection.

#### Stage 1

The most basic check ensures that the runtime is running
and (indirectly) that CLI tools can authenticate to it.

Except for the CLI tool authentication
part, the probability of false positives can be considered approaching `0`
except for upgrades and maintenance windows.

[`rabbitmq-diganostics ping`](/rabbitmq-diagnostics.8.html) performs this check:

<pre class="lang-bash">
rabbitmq-diagnostics ping -q
# =&gt; Ping succeeded if exit code is 0
</pre>

#### Stage 2

A slightly more comprehensive check is executing [`rabbitmq-diganostics status`](/rabbitmq-diagnostics.8.html) status:

This includes the stage 1 check plus retrieves some essential
system information which is useful for other checks and should always be
available if RabbitMQ is running on the node (see below).

<pre class="lang-bash">
rabbitmq-diagnostics -q status
# =&gt; [output elided for brevity]
</pre>

This is a common way of sanity checking a node.
The probability of false positives can be considered approaching `0`
except for upgrades and maintenance windows.

#### Stage 3

Includes previous checks and also verifies that the RabbitMQ application is running
(not stopped with [`rabbitmqctl stop_app`](/rabbitmqctl.8.html#stop_app)
or the [Pause Minority partition handling strategy](/partitions.html))
and there are no resource alarms.

<pre class="lang-bash">
# lists alarms in effect across the cluster, if any
rabbitmq-diagnostics -q alarms
</pre>

[`rabbitmq-diagnostics check_running`](/rabbitmq-diagnostics.8.html) is a check that makes sure that the runtime is running
and the RabbitMQ application on it is not stopped or paused.

[`rabbitmq-diagnostics check_local_alarms`](/rabbitmq-diagnostics.8.html) checks that there are no local alarms in effect
on the node. If there are any, it will exit with a non-zero status.

The two commands in combination deliver the stage 3 check:

<pre class="lang-bash">
rabbitmq-diagnostics -q check_running &amp;&amp; rabbitmq-diagnostics -q check_local_alarms
# if both checks succeed, the exit code will be 0
</pre>

The probability of false positives is low. Systems hovering around their
[high runtime memory watermark](/alarms.html) will have a high probability of false positives.
During upgrades and maintenance windows can raise significantly.

Specifically for memory alarms, the `GET /api/nodes/{node}/memory` HTTP API endpoint can be used for additional checks.
In the following example its output is piped to [jq](https://stedolan.github.io/jq/manual/):

<pre class="lang-bash">
curl --silent -u guest:guest -X GET http://127.0.0.1:15672/api/nodes/rabbit@hostname/memory | jq
# =&gt; {
# =&gt;     "memory": {
# =&gt;         "connection_readers": 24100480,
# =&gt;         "connection_writers": 1452000,
# =&gt;         "connection_channels": 3924000,
# =&gt;         "connection_other": 79830276,
# =&gt;         "queue_procs": 17642024,
# =&gt;         "queue_slave_procs": 0,
# =&gt;         "plugins": 63119396,
# =&gt;         "other_proc": 18043684,
# =&gt;         "metrics": 7272108,
# =&gt;         "mgmt_db": 21422904,
# =&gt;         "mnesia": 1650072,
# =&gt;         "other_ets": 5368160,
# =&gt;         "binary": 4933624,
# =&gt;         "msg_index": 31632,
# =&gt;         "code": 24006696,
# =&gt;         "atom": 1172689,
# =&gt;         "other_system": 26788975,
# =&gt;         "allocated_unused": 82315584,
# =&gt;         "reserved_unallocated": 0,
# =&gt;         "strategy": "rss",
# =&gt;         "total": {
# =&gt;             "erlang": 300758720,
# =&gt;             "rss": 342409216,
# =&gt;             "allocated": 383074304
# =&gt;         }
# =&gt;     }
# =&gt; }
</pre>

The [breakdown information](/memory-use.html) it produces can be reduced down to a single value using [jq](https://stedolan.github.io/jq/manual/)
or similar tools:

<pre class="lang-bash">
curl --silent -u guest:guest -X GET http://127.0.0.1:15672/api/nodes/rabbit@hostname/memory | jq ".memory.total.allocated"
# =&gt; 397365248
</pre>

[`rabbitmq-diagnostics -q memory_breakdown`](/rabbitmq-diagnostics.8.html) provides access to the same per category data
and supports various units:

<pre class="lang-bash">
rabbitmq-diagnostics -q memory_breakdown --unit "MB"
# =&gt; connection_other: 50.18 mb (22.1%)
# =&gt; allocated_unused: 43.7058 mb (19.25%)
# =&gt; other_proc: 26.1082 mb (11.5%)
# =&gt; other_system: 26.0714 mb (11.48%)
# =&gt; connection_readers: 22.34 mb (9.84%)
# =&gt; code: 20.4311 mb (9.0%)
# =&gt; queue_procs: 17.687 mb (7.79%)
# =&gt; other_ets: 4.3429 mb (1.91%)
# =&gt; connection_writers: 4.068 mb (1.79%)
# =&gt; connection_channels: 4.012 mb (1.77%)
# =&gt; metrics: 3.3802 mb (1.49%)
# =&gt; binary: 1.992 mb (0.88%)
# =&gt; mnesia: 1.6292 mb (0.72%)
# =&gt; atom: 1.0826 mb (0.48%)
# =&gt; msg_index: 0.0317 mb (0.01%)
# =&gt; plugins: 0.0119 mb (0.01%)
# =&gt; queue_slave_procs: 0.0 mb (0.0%)
# =&gt; mgmt_db: 0.0 mb (0.0%)
# =&gt; reserved_unallocated: 0.0 mb (0.0%)
</pre>

#### Stage 4

Includes all checks in stage 4 plus a check on all enabled listeners
(using a temporary TCP connection).

To inspect all listeners enabled on a node, use [`rabbitmq-diganostics listeners`](/rabbitmq-diagnostics.8.html):

<pre class="lang-bash">
rabbitmq-diagnostics -q listeners
# =&gt; Interface: [::], port: 25672, protocol: clustering, purpose: inter-node and CLI tool communication
# =&gt; Interface: [::], port: 5672, protocol: amqp, purpose: AMQP 0-9-1 and AMQP 1.0
# =&gt; Interface: [::], port: 5671, protocol: amqp/ssl, purpose: AMQP 0-9-1 and AMQP 1.0 over TLS
# =&gt; Interface: [::], port: 15672, protocol: http, purpose: HTTP API
# =&gt; Interface: [::], port: 15671, protocol: https, purpose: HTTP API over TLS (HTTPS)
</pre>

[`rabbitmq-diagnostics check_port_connectivity`](/rabbitmq-diagnostics.8.html) is a commend that
performs the basic TCP connectivity check mentioned above:

<pre class="lang-bash">
rabbitmq-diagnostics -q check_port_connectivity
# If the check succeeds, the exit code will be 0
</pre>

The probability of false positives is generally low but during upgrades and
maintenance windows can raise significantly.

#### Stage 5

Includes all checks in stage 3 plus checks that there are no failed [virtual hosts](/vhosts.html).

RabbitMQ CLI tools currently do not provide a dedicated command for this check, but here is
an example that could be used in the meantime:

<pre class="lang-bash">
rabbitmqctl eval 'true = lists:foldl(fun(VHost, Acc) -&gt; Acc andalso rabbit_vhost:is_running_on_all_nodes(VHost) end, true, rabbit_vhost:list()).'
# =&gt; true
</pre>

The probability of false positives is generally low except for systems that are under
high CPU load.

#### Stage 6

Includes all checks in stage 5 plus checks all channel and queue processes
on the target queue for aliveness.

The combination of [`rabbitmq-diagnostics check_port_connectivity`](/rabbitmq-diagnostics.8.html) and
[`rabbitmq-diagnostics node_health_check`](/rabbitmq-diagnostics.8.html) is the closest alternative
to this check currently available.

This combination of commands includes all checks up to and including stage 4.
It will also check all channel and queue processes on the target queue for aliveness:

<pre class="lang-bash">
rabbitmq-diagnostics -q check_port_connectivity &amp;&amp; \
rabbitmq-diagnostics -q node_health_check
# if both checks succeed, the exit code will be 0
</pre>

The probability of false positives is moderate for systems under
above average load or with a large number of queues and channels
(starting with 10s of thousands).

#### Optional Check 1

This check verifies that an expected set of plugins is enabled. It is orthogonal to
the primary checks.

[`rabbitmq-plugins list --enabled`](/rabbitmq-plugins.8.html#list) is the command that lists enabled plugins
on a node:

<pre class="lang-bash">
rabbitmq-plugins -q list --enabled
# =&gt; Configured: E = explicitly enabled; e = implicitly enabled
# =&gt; | Status: * = running on rabbit@mercurio
# =&gt; |/
# =&gt; [E*] rabbitmq_auth_mechanism_ssl       3.7.10
# =&gt; [E*] rabbitmq_consistent_hash_exchange 3.7.10
# =&gt; [E*] rabbitmq_management               3.7.10
# =&gt; [E*] rabbitmq_management_agent         3.7.10
# =&gt; [E*] rabbitmq_shovel                   3.7.10
# =&gt; [E*] rabbitmq_shovel_management        3.7.10
# =&gt; [E*] rabbitmq_top                      3.7.10
# =&gt; [E*] rabbitmq_tracing                  3.7.10
</pre>

A health check that verifies that a specific plugin, [`rabbitmq_shovel`](/shovel.html)
is enabled and running:

<pre class="lang-bash">
rabbitmq-plugins -q is_enabled rabbitmq_shovel
# if the check succeeded, exit code will be 0
</pre>

The probability of false positives is generally low but raises
in environments where environment variables that can affect [rabbitmq-plugins](/cli.html)
are overridden.

## <a id="monitoring-tools" class="anchor" href="#monitoring-tools">Monitoring Tools</a>

The following is an alphabetised list of third-party tools commonly used to collect RabbitMQ metrics. These
tools vary in capabilities but usually can collect both [infrastructure-level](system-metrics) and
[RabbitMQ metrics](#rabbitmq-metrics).

Note that this list is by no means complete.

<table>
  <thead>
    <tr><td>Monitoring Tool</td><td>Online Resource(s)</td></tr>
  </thead>
  <tbody>
    <tr>
      <td>AppDynamics</td>
      <td>
        <a href="https://www.appdynamics.com/community/exchange/extension/rabbitmq-monitoring-extension/">AppDynamics</a>,
        <a href="https://github.com/Appdynamics/rabbitmq-monitoring-extension">GitHub</a>
      </td>
    </tr>
    <tr>
      <td>`collectd`</td>
      <td><a href="https://github.com/signalfx/integrations/tree/master/collectd-rabbitmq">GitHub</a></td>
    </tr>
    <tr>
      <td>DataDog</td>
      <td>
        <a href="https://docs.datadoghq.com/integrations/rabbitmq/">DataDog RabbitMQ integration</a>,
        <a href="https://github.com/DataDog/integrations-core/tree/master/rabbitmq">GitHub</a>
      </td>
    </tr>
    <tr>
      <td>Ganglia</td>
      <td><a href="https://github.com/ganglia/gmond_python_modules/tree/master/rabbit">GitHub</a></td>
    </tr>
    <tr>
      <td>Graphite</td>
      <td><a href="http://graphite.readthedocs.io/en/latest/tools.html">Tools that work with Graphite</a></td>
    </tr>
    <tr>
      <td>Munin</td>
      <td>
        <a href="http://munin-monitoring.org/">Munin docs</a>,
        <a href="https://github.com/ask/rabbitmq-munin">GitHub</a>
      </td>
    </tr>
    <tr>
      <td>Nagios</td>
      <td><a href="https://github.com/nagios-plugins-rabbitmq/nagios-plugins-rabbitmq">GitHub</a></td>
    </tr>
    <tr>
      <td>New Relic</td>
      <td>
        <a href="https://newrelic.com/plugins/vmware-29/95">NewRelic Plugins</a>,
        <a href="https://github.com/pivotalsoftware/newrelic_pivotal_agent">GitHub</a>
        </td>
    </tr>
    <tr>
      <td>Prometheus</td>
      <td>
        <a href="/prometheus.html">Prometheus guide</a>,
        <a href="https://github.com/deadtrickster/prometheus_rabbitmq_exporter">GitHub</a>
      </td>
    </tr>
    <tr>
      <td>Zabbix</td>
      <td><a href="http://blog.thomasvandoren.com/monitoring-rabbitmq-queues-with-zabbix.html">Blog article</a></td>
    </tr>
    <tr>
      <td>Zenoss</td>
      <td>
        <a href="https://www.zenoss.com/product/zenpacks/rabbitmq">RabbitMQ ZenPack</a>,
        <a href="http://www.youtube.com/watch?v=CAak2ayFcV0">Instructional Video</a>
        </td>
    </tr>
  </tbody>
</table>

## <a id="log-aggregation" class="anchor" href="#log-aggregation">Log Aggregation</a>

[Logs](/logging.html) are also very important in troubleshooting a distributed system. Like metrics, logs can provide
important clues that will help identify the root cause. Collect logs from all RabbitMQ nodes as well
as all applications (if possible).
