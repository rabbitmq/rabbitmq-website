# Monitoring with Prometheus &amp; Grafana

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers RabbitMQ monitoring with two popular tools:
<a href="https://prometheus.io/docs/introduction/overview/" target="_blank">Prometheus</a>, a monitoring toolkit;
and <a href="https://grafana.com/grafana" target="_blank">Grafana</a>, a metrics visualisation system.

These tools together form a powerful toolkit for long-term metric collection and monitoring of RabbitMQ clusters.
While [RabbitMQ management UI](/management.html) also provides access to a subset of metrics, it by
design doesn't try to be a long term metric collection solution.

Please read through the main [guide on monitoring](/monitoring.html) first. Monitoring principles and
available metrics are mostly relevant when Prometheus and Grafana are used.

Some key topics covered by this guide are

 * [Prometheus support basics](#overview-prometheus)
 * [Prometheus support basics](#overview-grafana)
 * [Quick Start Guide](#quick-start)
 * [RabbitMQ Overview Dashboard](#rabbitmq-overview-dashboard)
 * [Health indicators](#health-indicators) on the Overview dashboard
 * [Graph colour labelling](#graph-colour-labelling) conventions
 * [Graph thresholds](#graph-thresholds)
 * [Relevant documentation](#graph-documentation) for each graph (metric)
 * [Spotting Anti-patterns](#spot-anti-patterns)
 * [Other available dashboards](#other-dashboards)

### <a id="overview-prometheus" class="anchor" href="#overview-prometheus">Built-in Prometheus Support</a>

As of 3.8.0, RabbitMQ ships with built-in Prometheus & Grafana support.

Support for Prometheus metric collector ships in the `rabbitmq_prometheus` plugin.
The plugin exposes all RabbitMQ metrics on a dedicated TCP port, in Prometheus text format.

These metrics provide a deep insights into the state of RabbitMQ nodes and [the runtime](/runtime.html).
They make reasoning about the behaviour of RabbitMQ, applications that use it and various infrastructure
elements a lot more informed.

### <a id="overview-grafana" class="anchor" href="#overview-grafana">Grafana Support</a>

Collected metrics are not very useful unless they are visualised. Team RabbitMQ provides a prebuilt set of
Grafana dashboards that visualise a large number of available RabbitMQ and runtime metrics in context-specific ways.

There is a number of dashboards available:

 * an overview dashboard
 * a Raft metric dashboard
 * an [inter-node communication](https://www.rabbitmq.com/clustering.html#cluster-membership)
(Erlang distribution) dashboard

and others. Each is meant to provide an insight into a specific
part of the system. When used together, they are able to explain RabbitMQ and application behaviour in detail.

Note that the Grafana dashboards are opinionated and uses a number of conventions, for example, to
[spot system health issues quicker](#health-indicators) or make [cross-graph referencing](#graph-colour-labelling) possible.
Like all Grafana dashboards, they are also highly customizable. The conventions they assume are considered to be
good practices and are thus recommended.

### <a id="overview-example" class="anchor" href="#overview-example">An Example</a>

When RabbitMQ is integrated with Prometheus and Grafana, this is what the
RabbitMQ Overview dashboard looks like:

![RabbitMQ Overview Dashboard](/img/rabbitmq-overview-dashboard.png)


## <a id="quick-start" class="anchor" href="#quick-start">Quick Start</a>

### Before We Start

This section explains how to set up a RabbitMQ cluster with Prometheus and Grafana dashboards, as well
as some applications that will produce some activity and meaningful metrics.

With this setup you will be able to interact with RabbitMQ, Prometheus
& Grafana running locally. You will also be able to try out different
load profiles to see how it all fits together, make sense of the dashboards,
panels and so on.

This is merely an example; the `rabbitmq_prometheus` plugin and our Grafana dashboards do not require
the use of Docker Compose demonstrated below.

### Prerequisites

The instructions below assume a host machine that has a certain set of tools
installed:

 * A terminal to run the commands
 * <a href="https://git-scm.com/" target="_blank">Git</a> to close the repository
 * <a href="https://www.docker.com/products/docker-desktop" target="_blank">Docker Desktop</a> to use Docker Compose locally
 * A Web browser to browse the dashboards

Their installation is out of scope of this guide. Use

<pre class="lang-bash">
git version
</pre>

<pre class="lang-bash">
docker info &amp;&amp; docker-compose version
</pre>

on the command line to verify that the necessary tools are available.

### Clone a Repository with Manifests

First step is to close a Git repository, <a href="https://github.com/rabbitmq/rabbitmq-prometheus"
target="_blank">rabbitmq-prometheus</a>, with the manifests and other components required to run
a RabbitMQ cluster, Prometheus and a set of applications:

<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-prometheus.git
cd rabbitmq-prometheus/docker
</pre>

### Run Docker Compose

Next use Docker Compose manifests to run a pre-configured RabbitMQ cluster, a Prometheus instance and a basic
workload that will produce the metrics displayed in the RabbitMQ overview dashboard:

<pre class="lang-bash">
docker-compose -f docker-compose-metrics.yml up -d
docker-compose -f docker-compose-overview.yml up -d
</pre>

The `docker-compose` commands above can also be executed with a `make` target:

<pre class="lang-bash">
make metrics overview
</pre>

When the above commands succeed, there will be a functional RabbitMQ cluster and a Prometheus
instance collecting metrics from it running in a set of containers.

### Access RabbitMQ Overview Grafana Dashboard

Now navigate to <a href="http://localhost:3000/dashboards" target="_blank">http://localhost:3000/dashboards</a> in a Web browser.
It will bring up a login page. Use `admin` for both the username and the password. On the very first login
Grafana will suggest changing your password. For the sake of this example, we suggest that this step is skipped.

Navigate to the **RabbitMQ-Overview** dashboard that will look like this:

![RabbitMQ Overview Dashboard Localhost](/img/rabbitmq-overview-dashboard-localhost.png)

Congratulations! You now have a 3-nodes RabbitMQ cluster integrated with
Prometheus & Grafana running locally. This is a perfect time to learn more
about the available dashboards.


## <a id="rabbitmq-overview-dashboard" class="anchor" href="#rabbitmq-overview-dashboard">RabbitMQ Overview Dashboard</a>

All metrics available in the [management UI](/management.html) Overview
page are available in the Overview Grafana dashboard. They are grouped by object type,
with a focus on RabbitMQ nodes and message rates.

### <a id="health-indicators" class="anchor" href="#health-indicators">Health Indicators</a>

[Single stat metrics](https://grafana.com/docs/features/panels/singlestat/) at the top of the dashboard capture the health of a single
RabbitMQ cluster. In this case, there's a single RabbitMQ cluster,
**rabbitmq-overview**, as seen in the **Cluster** drop-down menu just below the
dashboard title.

The panels on all RabbitMQ Grafana dashboards use different colours to capture the following
metric states:

* **Green** means the value of the metric is within a healthy range
* **Blue** means under-utilisation or some form of degradation
* **Red** means the value of the metric is below or above the range that is considered healthy

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-single-stat.png)

Default ranges for the [single stat metrics](https://grafana.com/docs/features/panels/singlestat/) **will not be optimal for all**
RabbitMQ deployments. For example, in environments with many consumers and/or
high prefetch values, it may be perfectly fine to have over 1,000
unacknowledged messages. The default thresholds can be easily adjusted to suit
the workload and system at hand. The users are encouraged to revisit these ranges and tweak
them as they see fit for their workloads, monitoring and operational practices, and tolerance
for false positives.

### <a id="graphs" class="anchor" href="#graphs">Metrics and Graphs</a>

Most RabbitMQ and runtime metrics are represented as graphs in Grafana: they are values that change over time.
This is the simplest and clearest way of visualising how some aspect of the system changes.
Time-based charting makes it easy to understand the change in key metrics: message rates, memory used by every node in
the cluster, or the number of concurrent connections. All metrics except for health
indicators are **node-specific**, that is, they represent values of a metric on a single node.

Some metrics, such as the panels grouped under **CONNECTIONS**, are stacked to
capture the state of the **cluster as a whole**. These metrics are
collected on individual nodes and grouped visually, which makes it easy to notice when,
for example, one node serves a disproportionate number of connections.

We would refer to such a RabbitMQ cluster as **unbalanced**, meaning that at least in some ways,
a minority of nodes perform the majority of work.

In the example below, connections are spread out evenly across all nodes most of the time:

![RabbitMQ Overview Dashboard CONNECTIONS](/img/rabbitmq-overview-dashboard-connections.png)

### <a id="graph-colour-labelling" class="anchor" href="#graph-colour-labelling">Colour Labelling in Graphs</a>

All metrics on all graphs are associated with specific node names. For example,
all metrics drawn in green are for the node that contains `0` in its name, e.g.
`rabbit@rmq0`. This makes is easy to correlate metrics of a specific node across graphs.
Metrics for the first node, which is assumed to contain `0` in
its name, will always appear as green across all graphs.

It is important to remember this aspect when using the RabbitMQ Overview dashboard.
**If a different node naming convention is used, the colours will appear inconsistent across graphs**:
green may represent e.g. `rabbit@foo` in one graph, and e.g. `rabbit@bar` in another graph.

When this is the case, the panels must be updated to use a different node naming scheme.

### <a id="graph-thresholds" class="anchor" href="#graph-thresholds">Thresholds in Graphs</a>

Most metrics have pre-configured thresholds. They appear as semi-transpared
orange or red areas, as seen in the example below.

Metrics in the **orange** area signal that some pre-defined threshold has been
exceeded. This may be OK, especially if the metric recovers. A metric that
comes close to the orange area represents a system which is working at optimal
capacity.

Metrics in the **red** area signal some form of service degradation. In the
case of memory, it means that the memory alarm was triggered and publishers
were blocked.

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-memory-threshold.png)

In the example above, we have a RabbitMQ cluster that runs at optimal memory
capacity, which is just above the warning threshold. There is an unexpected
spike in incoming messages which exhausts all memory allocated to RabbitMQ.
Because the system has more memory available than is allocated to RabbitMQ, we
notice the dip below **0 B**. This emphasizes the importance of leaving spare
memory available, and not allocating all memory to RabbitMQ. When a RabbitMQ
node exhausts all memory that it is allowed to use, the memory alarm is
triggered and all publishers, across the entire cluster, get blocked.

In this example, we can see how memory is released which clears the memory
alarm and, as a result, publishers become unblocked. Eventually, all queued
messages are consumed, memory is released and the cluster returns to its
optimal state.

It is worth pointing out that all thresholds use reasonable defaults which are
not suitable for all types of workloads. Some workloads may require higher
thresholds, others may require lower ones. While the defaults should be
adequate in most cases, please feel free to change them to suit your specific
requirements.

### <a id="graph-documentation" class="anchor" href="#graph-documentation">Documentation in graphs</a>

Most metrics have explanations in the top-left corner of the panel. Some, like
the available disk space metric, link to specific pages in our official docs.
These pages contain the information required to fully understand all aspects of
the respective metric.

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-disk-documentation.png)

### <a id="spot-anti-patterns" class="anchor" href="#spot-anti-pattern">Spotting Anti-patterns</a>

Any metric which shows in red hints to an anti-pattern. It is a new way in
which we try to highlight sub-optimal uses of RabbitMQ. If you see any red
graph with non-zero metrics, it is worth investigating. RabbitMQ, like any
service, cannot be efficient if clients abuse it.

In the example below we can see the usage of greatly inefficient [polling
consumers](/consumers.html#fetching) that return no messages. This is the
equivalent of asking _Are we there yet?_. It is a lot more and efficient to be
notified when a new message is available (the equivalent of _We have arrived_ in our analogy):

![RabbitMQ Overview Dashboard Antipatterns](/img/rabbitmq-overview-dashboard-antipattern.png)

### <a id="example-workloads" class="anchor" href="#example-workloads">Example workloads</a>

In `docker/docker-compose-overview.yml` you will find different PerfTest
configurations which test different aspects of RabbitMQ. Our goal was to
exercise all metrics on the RabbitMQ Overview dashboard. You may be interested
in editing these example workloads, or adding your own, and observing how the
metrics change.

To test your changes, run `docker-compose -f docker-compose-overview.yml up -d`.
Existing PerfTest instances will be updated, and new ones will be started.

When you are done, run `docker-compose -f docker-compose-overview.yml down` to
stop and delete all containers.

## <a id="other-dashboards" class="anchor" href="#other-dashboards">Other dashboards</a>

Part of the same quick start, there are other Grafana dashboards that you can
try out: **RabbitMQ-Raft** and **Erlang-Distribution**. They have corresponding
RabbitMQ clusters and PerfTest instances which are started and stopped the same
as the Overview one. Please feel free to experiment with the other workloads
that are included in the same `docker` directory.

To set the right expectations, `docker-compose-dist-tls.yml` was made to stress
the Erlang Distribution. Expect high CPU usage when running this workload on
your local host. The same is true for `docker-compose-qq.yml`

When you are done experimenting with workloads, you can stop and delete all
containers by running `docker-compose -f FILE down`.  Replace `FILE` with the
name of every file that you have used in `docker-compose -f FILE up -d`
commands. If you have <a href="https://www.gnu.org/software/make/"
target="_blank">Make</a> installed, the equivalent is `make down`.

## <a id="installation" class="anchor" href="#installation">Installation</a>

After we experimented with RabbitMQ, Prometheus & Grafana locally, let us
understand how to configure the entire setup from scratch. We assume that you
have:

* a 3-node RabbitMQ 3.8 cluster running
* Prometheus running and able to communicate with all RabbitMQ nodes
* Grafana running and configured with the above Prometheus as one of the data sources

### <a id="rabbitmq-configuration" class="anchor" href="#rabbitmq-configuration">RabbitMQ configuration</a>

We first need to ensure that the RabbitMQ cluster is using a descriptive name.
To find the name that the cluster is currently using, run `rabbitmqctl cluster_status`
from any node. If you are happy with the cluster name, skip the rest of this paragraph. To
change the name of the cluster, run the following command: `rabbitmqctl set_cluster_name testing-prometheus`.

Next, enable the **rabbitmq_prometheus** plugin on all nodes by running the
following command: `rabbitmq-plugins enable rabbitmq_prometheus`. This is an
example of the output that you should see on every node:

<pre class="lang-ini">
rabbitmq-plugins enable rabbitmq_prometheus

Enabling plugins on node rabbit@ed9618ea17c9:
rabbitmq_prometheus
The following plugins have been configured:
  rabbitmq_management_agent
  rabbitmq_prometheus
  rabbitmq_web_dispatch
Applying plugin configuration to rabbit@ed9618ea17c9...
The following plugins have been enabled:
  rabbitmq_management_agent
  rabbitmq_prometheus
  rabbitmq_web_dispatch

started 3 plugins.
</pre>

To confirm that RabbitMQ now exposes metrics in Prometheus format, get the
first couple of lines with `curl` or similar:

<pre class="lang-bash">
curl -s localhost:15692/metrics | head -n 3
# TYPE erlang_mnesia_held_locks gauge
# HELP erlang_mnesia_held_locks Number of held locks.
erlang_mnesia_held_locks{node="rabbit@65f1a10aaffa",cluster="rabbit@65f1a10aaffa"} 0
</pre>

Notice that RabbitMQ exposes these new metrics on a dedicated TCP port, `15692` by
default.

## <a id="prometheus-configuration" class="anchor" href="#prometheus">Prometheus configuration</a>

Once RabbitMQ is configured for Prometheus, we need to provide Prometheus with
the information it needs to know where to read RabbitMQ metrics from. There are
a number of ways of doing this, please refer to the official <a
href="https://prometheus.io/docs/prometheus/latest/configuration/configuration/"
target="_blank">Prometheus configuration</a> documentation. If this is your
first time setting up Prometheus, you may want to start with the <a
href="https://prometheus.io/docs/introduction/first_steps/"
target="_blank">first steps</a> guide.

Prometheus periodically reads metrics from the systems it monitors, every 60
seconds by default. RabbitMQ metrics are updated periodically too, every 5
seconds by default. Since [this value is
configurable](/management.html#statistics-interval), check the metrics update
interval by running the following command on any of the nodes:

<pre class="lang-bash">
rabbitmqctl environment | grep collect_statistics_interval
# => {collect_statistics_interval,5000}
</pre>

The returned value will be in milliseconds.

While a 5 second Prometheus polling interval may be too aggressive for
production systems, it is a value that we use to match RabbitMQ's default
`collect_statistics_interval`. 5 seconds also happens to match the default refresh
frequency of RabbitMQ Management UI.

Regardless what value you settle on - 15 or 30 seconds are good choices for
production - ensure that this value is the same in both RabbitMQ & Prometheus.

To confirm that Prometheus is reading RabbitMQ metrics from all nodes, ensure
that all RabbitMQ endpoints are **UP** on the Prometheus Targets page, as shown
below:

![Prometheus RabbitMQ Targets](/img/prometheus-targets.png)

### <a id="grafana-configuration" class="anchor" href="#grafana-configuration">Grafana configuration</a>

The last component in this setup is Grafana, an open-source tool for
visualising metrics. If this is your first time integrating Grafana with
Prometheus, please follow the <a
href="https://prometheus.io/docs/visualization/grafana/"
target="_blank">official integration guide</a>.

After Grafana is integrated with the Prometheus instance that reads and stores
RabbitMQ metrics, it is time to import the Grafana dashboards that our team
maintains. This is <a
href="https://grafana.com/docs/reference/export_import/#importing-a-dashboard"
target="_blank">the official tutorial</a> on importing dashboards in Grafana.

Grafana dashboards that our team maintains for both RabbitMQ & Erlang are
publicly available in the <a
href="https://github.com/rabbitmq/rabbitmq-prometheus/tree/master/docker/grafana/dashboards"
target="_blank">rabbitmq-prometheus</a> GitHub repository. To import the
**RabbitMQ-Overview** Grafana Dashboard from GitHub, navigate to the <a
href="https://github.com/rabbitmq/rabbitmq-prometheus/raw/master/docker/grafana/dashboards/RabbitMQ-Overview.json"
target="_blank">Raw version</a> and copy paste the file contents in Grafana,
then click **Load**, as seen below:

![Grafana Import Dashboard](/img/grafana-import-dashboard.png)

Repeat the process for all other Grafana dashboards that would like to use with
your RabbitMQ deployment.

Congratulations! Your RabbitMQ is now monitored with Prometheus & Grafana!


## <a id="3rd-party-plugin" class="anchor" href="#3rd-party-plugin">Using Prometheus with RabbitMQ 3.7</a>

RabbitMQ versions prior to 3.8 can use a separate plugin,
[prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter),
to expose metrics to Prometheus. The plugin uses [RabbitMQ HTTP API](/monitoring.html) internally
and requires visualisation to be set up separately.
