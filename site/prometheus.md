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
 * [Grafana support basics](#overview-grafana)
 * [Quick Start](#quick-start) for local experimentation
 * [Installation steps](#installation) for production systems

Grafana dashboards follow a number of conventions to make the system more observable
and anti-patterns easier to spot. Its design decisions are explained in a number of sections:

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
 * <a href="https://git-scm.com/" target="_blank">Git</a> to clone the repository
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

First step is to clone a Git repository, <a href="https://github.com/rabbitmq/rabbitmq-prometheus"
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

Most metrics have pre-configured thresholds. They define expected operating boundaries for the metric.
On the graphs they appear as semi-transpared
orange or red areas, as seen in the example below.

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-memory-threshold.png)

Metric values in the **orange** area signal that some pre-defined threshold has been
exceeded. This may be acceptable, especially if the metric recovers. A metric that
comes close to the orange area is considered to be in healthy state.

Metric values in the **red** area need attention and may identify some form of service degradation.
For example, metrics in the red area can indicate that an [alarm](/alarms.html) in effect
or when the node is [out of file descriptors](/networking.html) and cannot accept any more connections or open new files.

In the example above, we have a RabbitMQ cluster that runs at optimal memory
capacity, which is just above the warning threshold. If there is a spike in published messages that should
be stored in RAM, the amount of memory used by the node go up and the metric on the graph will
go down (as it indicates the amount of **available** memory).

Because the system has more memory available than is allocated to the RabbitMQ node it hosts, we
notice the dip below **0 B**. This emphasizes the importance of leaving spare
memory available for the OS, housekeeping tasks that cause short-lived memory usage spikes,
and other processes. When a RabbitMQ node exhausts all memory that it is allowed to use, a [memory alarm](/alarms.html) is
triggered and publishers across the entire cluster will be blocked.

On the right side of the graph we can see that consumers catch up and the amount of memory used goes down.
That clears the memory alarm on the node and, as a result, publishers become unblocked. This and related metrics
across cluster then should return to their optimal state.

### <a id="graph-thresholds-are-system-specific" class="anchor" href="#graph-thresholds-are-system-specific">There is No "Right" Threshold for Many Metrics</a>

Note that that the thresholds used by the Grafana dashboards have to have a default value. No matter
what value is picked by dashboard developers, they **will not suitable for all environments and workloads**.

Some workloads may require higher thresholds, others may choose to lower them. While the defaults should be
adequate in many cases, the **operator must review and adjust the thresholds** to suit their specific
requirements.

### <a id="graph-documentation" class="anchor" href="#graph-documentation">Relevant Documentation for Graphs</a>

Most metrics have a help icon in the top-left corner of the panel.

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-disk-documentation.png)

Some, like the available disk space metric, link to dedicated pages in [RabbitMQ documentation](/documentation.html).
These pages contain information relevant to the metric. Getting familiar with the linked guides
is highly recommended and will help the operator understand what the metric means better.

### <a id="spot-anti-patterns" class="anchor" href="#spot-anti-pattern">Using Graphs to Spot Anti-patterns</a>

Any metric drawn in red hints at an anti-pattern in the system. Such graphs try to high highlight sub-optimal
uses of RabbitMQ. A **red graphs with non-zero metrics should be investigated**. Such metrics might indicate
an issue in RabbitMQ configuration or sub-optimal actions by clients ([publishers](/publishers.html) or [consumers](/consumers.html)).

In the example below we can see the usage of greatly inefficient [polling consumers](/consumers.html#fetching) that keep polling, even though
most or even all polling operation return no messages. Like any polling-based algorithm, it is wasteful
and should be avoided where possible.

It is a lot more and efficient to have RabbitMQ [push messages to the consumer](/consumers.html).

![RabbitMQ Overview Dashboard Antipatterns](/img/rabbitmq-overview-dashboard-antipattern.png)

### <a id="example-workloads" class="anchor" href="#example-workloads">Example Workloads</a>

The [Prometheus plugin repository](https://github.com/rabbitmq/rabbitmq-prometheus/tree/master/docker) contains example workloads that us [PerfTest](https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/)
to simulate different workloads.
Their goal is to exercise all metrics in the RabbitMQ Overview dashboard. These examples are meant to be
edited and extended as developers and operators see fit when exploring various metrics, their thresholds and behaviour.

To deploy a workload app, run `docker-compose -f docker-compose-overview.yml up -d`.
The same command will redeploy the app after the file has been updated.

To delete all workload containers, run `docker-compose -f docker-compose-overview.yml down` or

<pre class="lang-bash">
gmake down
</pre>


## <a id="other-dashboards" class="anchor" href="#other-dashboards">More Dashboards: Raft and Erlang Runtime</a>

There are two more Grafana dashboards available: **RabbitMQ-Raft** and **Erlang-Distribution**. They collect and
visualise metrics related to the Raft consensus algorithm (used by [Quorum Queues](/quorum-queues.html) and other features) as well
as more nitty-gritty [runtime metrics](/runtime.html) such as inter-node communication buffers.

The dashboards have corresponding RabbitMQ clusters and PerfTest instances which are started and stopped the same
as the Overview one. Feel free to experiment with the other workloads
that are included in [the same `docker` directory](https://github.com/rabbitmq/rabbitmq-prometheus/tree/master/docker).

For example, the `docker-compose-dist-tls.yml` Compose manifest is meant to stress
the [inter-node communication links](/clustering.html). This workload uses a lot of system resources.
`docker-compose-qq.yml` contains a quorum queue workload.

To stop and delete all containers used by the workloads, run `docker-compose -f [file] down` or

<pre class="lang-bash">
make down
</pre>


## <a id="installation" class="anchor" href="#installation">Installation</a>

Unlike the [Quick Start](#quick-start) above, this section covers monitoring setup geared towards production usage.

We will assume that the following tools are provisioned and running:

 * A [3-node RabbitMQ 3.8 cluster](/cluster-formation.html)
 * Prometheus, including network connectivity with all RabbitMQ cluster nodes
 * Grafana, including configuration that lists the above Prometheus instance as one of the data sources

### <a id="rabbitmq-configuration" class="anchor" href="#rabbitmq-configuration">RabbitMQ Configuration</a>

#### Cluster Name

First step is to give the RabbitMQ cluster a descriptive name so that it can be distinguished from other
clusters.

To find the current name of the cluster, use

<pre class="lang-bash">
rabbitmq-diagnostics -q cluster_status
</pre>

This command can be executed against any cluster node. If the current cluster name is distinctive and appropriate,
skip the rest of this paragraph.
To change the name of the cluster, run the following command (the name used here is just an example):

<pre class="lang-bash">
rabbitmqctl -q set_cluster_name testing-prometheus
</pre>

### Enable `rabbitmq_prometheus`

Next, enable the **rabbitmq_prometheus** [plugin](/plugins.html) on all nodes:

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_prometheus
</pre>

The output will look similar to this:

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

Notice that RabbitMQ exposes the metrics on a dedicated TCP port, `15692` by
default.


### <a id="prometheus-configuration" class="anchor" href="#prometheus">Prometheus Configuration</a>

Once RabbitMQ is configured to expose metrics to Prometheus, Prometheus should be made
aware of where it should scrape RabbitMQ metrics from. There are a number of ways of doing this.
Please refer to the official <a href="https://prometheus.io/docs/prometheus/latest/configuration/configuration/"
target="_blank">Prometheus configuration documentation</a> .
There's also a <a href="https://prometheus.io/docs/introduction/first_steps/" target="_blank">first steps with Prometheus</a> guide
for beginners.

Prometheus will periodically scrape (read) metrics from the systems it
monitors, every 60 seconds by default. RabbitMQ metrics are updated
periodically, too, every 5 seconds by default. Since [this value is
configurable](/management.html#statistics-interval), check the metrics update
interval by running the following command on any of the nodes:

<pre class="lang-bash">
rabbitmq-diagnostics environment | grep collect_statistics_interval
# => {collect_statistics_interval,5000}
</pre>

The returned value will be **in milliseconds**.

For production systems, we recommend a minimum value of `15s` for Prometheus
scrape interval and a `10000` (10s) value for RabbitMQ's
`collect_statistics_interval`.  With these values, Prometheus doesn't scrape
RabbitMQ too frequently, and RabbitMQ doesn't update metrics unnecessarily. If
you configure a different value for Prometheus scrape interval, remember to set an
appropriate interval when visualising metrics in Grafana with `rate()` - <a
href="https://www.robustperception.io/what-range-should-i-use-with-rate"
target="_blank">4x the scrape interval is considered safe</a>.

If you are using RabbitMQ's Management UI default 5 second auto-refresh, you may want
to keep the default `collect_statistics_interval` setting, which is also `5000` ms
(5 seconds) for this reason.

To confirm that Prometheus is scraping RabbitMQ metrics from all nodes, ensure
that all RabbitMQ endpoints are **UP** on the Prometheus Targets page, as shown
below:

![Prometheus RabbitMQ Targets](/img/monitoring/prometheus/prometheus-targets.png)

### <a id="grafana-configuration" class="anchor" href="#grafana-configuration">Grafana Configuration</a>

The last component in this setup is Grafana. If this is your first time integrating Grafana with
Prometheus, please follow the <a href="https://prometheus.io/docs/visualization/grafana/" target="_blank">official integration guide</a>.

After Grafana is integrated with the Prometheus instance that reads and stores
RabbitMQ metrics, it is time to import the Grafana dashboards that Team RabbitMQ
maintains. Please refer to the <a href="https://grafana.com/docs/reference/export_import/#importing-a-dashboard" target="_blank">the official Grafana tutorial</a>
on importing dashboards in Grafana.

Grafana dashboards for RabbitMQ and Erlang are open source and publicly from the <a
href="https://github.com/rabbitmq/rabbitmq-prometheus/tree/master/docker/grafana/dashboards"
target="_blank">rabbitmq-prometheus</a> GitHub repository.
To import the **RabbitMQ-Overview** Grafana Dashboard from GitHub, navigate to the <a href="https://github.com/rabbitmq/rabbitmq-prometheus/raw/master/docker/grafana/dashboards/RabbitMQ-Overview.json" target="_blank">raw version</a>
and copy paste the file contents in Grafana, then click **Load**, as seen below:

![Grafana Import Dashboard](/img/grafana-import-dashboard.png)

Repeat the process for all other Grafana dashboards that you would like to use with
this RabbitMQ deployment.

Finally, switch the default data source used by Grafana to `prometheus`.

Congratulations! Your RabbitMQ is now monitored with Prometheus & Grafana!


## <a id="3rd-party-plugin" class="anchor" href="#3rd-party-plugin">Using Prometheus with RabbitMQ 3.7</a>

RabbitMQ versions prior to 3.8 can use a separate plugin,
[prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter),
to expose metrics to Prometheus. The plugin uses [RabbitMQ HTTP API](/monitoring.html) internally
and requires visualisation to be set up separately.
