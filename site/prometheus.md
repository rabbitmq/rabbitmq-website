# Monitoring with Prometheus &amp; Grafana

## <a id="overview" class="anchor" href="#overview">Overview</a>

As of v3.8.0, RabbitMQ ships with built-in Prometheus & Grafana support.
Enabling the **rabbitmq_prometheus** plugin exposes all RabbitMQ metrics on a
dedicated TCP port, in Prometheus text format. These metrics give unprecedented
insights into not just RabbitMQ, but also the runtime, Erlang. This is the
first step towards understanding what is happening in a complex system such as
RabbitMQ.

The second part to understanding RabbitMQ is visualising the metrics that are
collected by and stored in Prometheus. We have built Grafana dashboards that
visualise these metrics in context-specific ways. For example, there is a
RabbitMQ Overview dashboard, a RabbitMQ Raft dashboard, an Erlang Distribution
dashboard, and many others. They are each meant to give insights into specific
parts of the system. When used together, they are able to explain any RabbitMQ
behaviour in great detail.

When RabbitMQ is integrated with Prometheus and Grafana, this is what the
RabbitMQ Overview dashboard looks like:

![RabbitMQ Overview Dashboard](/img/rabbitmq-overview-dashboard.png)

> <a href="https://prometheus.io/docs/introduction/overview/" target="_blank">Prometheus</a> is a monitoring toolkit. <a href="https://grafana.com/grafana" target="_blank">Grafana</a> is a metrics visualisation system.

To discover what else RabbitMQ Overview Grafana dashboard has in store, let's
get it up and running locally. We will take the quickest path of setting
everything up so that you can better imagine how this will benefit your
RabbitMQ deployments. You will be able to interact with RabbitMQ, Prometheus
& Grafana locally, on your machine. You will also be able to try out different
load profiles and understand how it all fits together.

### <a id="quick-start" class="anchor" href="#quick-start">Quick Start</a>

To get started, you will need a browser and a terminal available on your
machine. Next, you will need to install <a href="https://git-scm.com/"
target="_blank">Git</a> as well as <a
href="https://www.docker.com/products/docker-desktop" target="_blank">Docker
Desktop</a>. The pre-requisites are set up correctly when `git version`,
`docker info` &amp; `docker-compose version` work in your terminal.

We will now clone the <a href="https://github.com/rabbitmq/rabbitmq-prometheus"
target="_blank">rabbitmq-prometheus</a> repository from GitHub and start all
components required for a fully functional RabbitMQ Overview dashboard:

<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-prometheus.git
cd rabbitmq-prometheus/docker
docker-compose -f docker-compose-metrics.yml up -d
docker-compose -f docker-compose-overview.yml up -d
</pre>

> `make metrics overview` is the short version of the `docker-compose` commands above

When the above commands succeed, open <a
href="http://localhost:3000/dashboards"
target="_blank">http://localhost:3000/dashboards</a> in your browser, and login
with username `admin` and password `admin`. Feel free to skip the change
password step - this is a local Grafana installation after all. Navigate to
the **RabbitMQ-Overview** dashboard and you will see this:

![RabbitMQ Overview Dashboard Localhost](/img/rabbitmq-overview-dashboard-localhost.png)

Congratulations! You now have a 3-nodes RabbitMQ cluster integrated with
Prometheus & Grafana running locally. This is a perfect time to learn more
about the RabbitMQ Overview dashboard.

## <a id="rabbitmq-overview-dashboard" class="anchor" href="#rabbitmq-overview-dashboard">RabbitMQ Overview Dashboard</a>

All metrics that are provided on the [Management UI](/management.html) Overview
page are also available on this dashboard. They are grouped by object type,
with a focus on RabbitMQ nodes and message flow.

### <a id="health-indicators" class="anchor" href="#health-indicators">Health Indicators</a>

Single-stat metrics at the top of the dashboard capture the health of a single
RabbitMQ cluster. In this case, you have a single RabbitMQ cluster,
**rabbitmq-overview**, as seen in the **Cluster** drop-down, just below the
dashboard title.

We use different colours to capture the following states:

* **Green** means the metric is within a healthy range
* **Blue** means under-utilisation or some form of degradation
* **Red** means the metric is below or above the range that is considered healthy

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-single-stat.png)

The default ranges for the single-stat metrics may not be optimal for all
RabbitMQ deployments. For example, in environments with many consumers and/or
high prefetch values, it may be perfectly fine to have over 1,000
unacknowledged messages. The default thresholds can be easily adjusted to suit
your RabbitMQ workloads.

### <a id="graphs" class="anchor" href="#graphs">Graphs</a>

Most metrics are represented as graphs: value over time. This is the simplest &
clearest way of visualising how some aspect of the system changes. It makes it
easy to understand the change in message rates, or memory used by every node in
the cluster, and even the number of connections. All metrics - except health
indicators - are node-specific.

Some metrics, like the panels grouped under **CONNECTIONS**, are stacked to
capture the state of the cluster as a whole. Since these metrics are
node-specific, it makes it easy to notice when, for example, one node serves a
disproportionate amount of connections. We would refer to such a RabbitMQ
cluster as **unbalanced**, meaning that a minority of nodes perform the
majority of work.

![RabbitMQ Overview Dashboard CONNECTIONS](/img/rabbitmq-overview-dashboard-connections.png)
> In the example above, connections are spread out evenly across all nodes.

### <a id="colour-consistency" class="anchor" href="#colour-consistency">Colour consistency</a>

All metrics across all graphs are linked to specific node names. For example,
all metrics in green are for the node that contains `0` in its name, e.g.
`rabbit@rmq0`. This makes is easy to correlate metrics across all graphs to a
specific node. Metrics for the first node, which is assumed to contain `0` in
its name, will always appear as green across all graphs.

It is important to remember this aspect when using RabbitMQ Overview Dashboard
with your RabbitMQ deployments. If you use a different naming convention,
colours will appear inconsistent across graphs: green may represent e.g.
`rabbit@foo` in one graph, and e.g. `rabbit@bar` in another graph.

### <a id="thresholds" class="anchor" href="#thresholds">Thresholds</a>

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

### <a id="documentation" class="anchor" href="#documentation">Documentation</a>

Most metrics have explanations in the top-left corner of the panel. Some, like
the available disk space metric, link to specific pages in our official docs.
These pages contain the information required to fully understand all aspects of
the respective metric.

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-disk-documentation.png)

### <a id="anti-patterns" class="anchor" href="#service-degradation">Anti-patterns</a>

Any metric which shows in red hints to an anti-pattern. It is a new way in
which we try to highlight sub-optimal uses of RabbitMQ. If you see any red
graph with non-zero metrics, it is worth investigating. RabbitMQ, like any
service, cannot be efficient if clients abuse it.

In the example below we can see the usage of greatly inefficient [polling
consumers](/consumers.html#fetching) that return no messages. This is the
equivalent of asking _Are we there yet?_. It is a lot more and efficient to be
notified when a new message is available (the equivalent of _We have arrived_ in our analogy):

![RabbitMQ Overview Dashboard Antipatterns](/img/rabbitmq-overview-dashboard-antipattern.png)

### <a id="different-configurations" class="anchor" href="#different-configurations">Try different configurations</a>

In `docker/docker-compose-overview.yml` you will find different PerfTest
configurations which test different aspects of RabbitMQ. Our goal was to
exercise all metrics on the RabbitMQ Overview dashboard. You may be interested
in editing these configurations, or adding your own, and observing how the
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
your local host.

When you are done experimenting with the workloads that we have shared, you can
stop and delete all containers by running `docker-compose -f FILE down`.
Replace `FILE` with the name of every file that you have used in
`docker-compose -f FILE up -d` commands. If you have <a
href="https://www.gnu.org/software/make/" target="_blank">Make</a> installed,
the equivalent is `make down`.

## <a id="installation" class="anchor" href="#installation">Installation</a>

After we experimented with RabbitMQ, Prometheus & Grafana locally, let us
understand how to configure the entire setup from scratch. We assume that you
have:

* a 3-node RabbitMQ 3.8 cluster running
* Prometheus running and able to communicate with all RabbitMQ nodes
* Grafana running and configured with the above Prometheus as one of the data sources

### <a id="rabbitmq" class="anchor" href="#rabbitmq">RabbitMQ</a>

We first need to ensure that the RabbitMQ cluster is using a descriptive name.
To find the name that the cluster is currently using, run `rabbitmqctl cluster_status` 
from any node. If you are happy with the cluster name, skip the rest of this paragraph. To
change the name of the cluster, run the following command: `rabbitmqctl set_cluster_name testing-prometheus`.

Next, enable the **rabbitmq_prometheus** plugin on all nodes by running the
following command: `rabbitmq-plugins enable rabbitmq_prometheus`. This is an
example of the output that you should see on every node:

<pre class="lang-bash">
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

## <a id="prometheus" class="anchor" href="#prometheus">Prometheus</a>

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

### <a id="grafana" class="anchor" href="#grafana">Grafana</a>

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

Repeat the process for all other Grafana dashboards that you would like to
visualise your RabbitMQ deployments with.

**Well done: your RabbitMQ is now integrated with Prometheus & Grafana!**

## <a id="3rd-party-plugin" class="anchor" href="#3rd-party-plugin">Using Prometheus with RabbitMQ 3.7</a>

RabbitMQ versions prior to 3.8 can use a separate plugin,
[prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter),
to expose metrics to Prometheus. The plugin uses [RabbitMQ HTTP API](/monitoring.html) internally
and requires visualisation to be set up separately.
