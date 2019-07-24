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

> [Prometheus](https://prometheus.io/docs/introduction/overview/) is a monitoring toolkit. [Grafana](https://grafana.com/grafana) is a metrics visualisation system.

To discover what else RabbitMQ Overview Grafana dashboard has in store, let's
get it up and running locally. We will take the quickest path of setting
everything up so that you can better imagine how this will benefit your
RabbitMQ deployments. You will be able to interact with RabbitMQ, Prometheus
& Grafana locally, on your machine. You will also be able to try out different
load profiles and understand how it all fits together.

### <a id="quick-start" class="anchor" href="#quick-start">Quick Start</a>

To get started, you will need a browser and a terminal available on your
machine. Next, you will need to install [Git](https://git-scm.com/) as well as
[Docker Desktop](https://www.docker.com/products/docker-desktop). The
pre-requisites are set up correctly when `git version`, `docker info` &amp;
`docker-compose version` work in your terminal.

We will now clone the
[rabbitmq-prometheus](https://github.com/rabbitmq/rabbitmq-prometheus)
repository from GitHub and start all components required for a fully functional
RabbitMQ Overview dashboard:

<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-prometheus.git
cd rabbitmq-prometheus/docker
docker-compose -f docker-compose-metrics.yml up -d
docker-compose -f docker-compose-overview.yml up -d
</pre>

> `make metrics overview` is the short version of the `docker-compose` commands above

When the above commands succeed, open
[http://localhost:3000/dashboards](http://localhost:3000/dashboards) in your
browser, and login with username `admin` and password `admin`. Feel free to skip
the change password step - this is a local Grafana installation after all. Now
navigate to the **RabbitMQ-Overview** dashboard. This is what you should see:

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
RabbitMQ cluster. We use different colours to capture the following states:

* **Green** means the metric is within a healthy range
* **Blue** means under-utilisation or some form of degradation
* **Red** means the metric is below or above the range that is considered healthy

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-single-stat.png)

The default ranges for the single-stat metrics may not be optimal for all
RabbitMQ deployments. For example, in environments with many consumers and/or
high prefetch values, it may be perfectly fine to have over 1,000
unacknowledged messages. The default thresholds can be easily adjusted to suit
your RabbitMQ workload.

### <a id="graphs" class="anchor" href="#graphs">Graphs</a>

Most metrics are represented as graphs: value over time. This is the simplest &
clearest way of visualising how some aspect of the system changes over time.
It makes it easy to understand the change in message rates, or memory used by
every node in the cluster, and even the number of connections. All metrics -
except health indicators - are node-specific.

Some metrics, like the panels grouped under **CONNECTIONS**, are stacked to
capture the state of the cluster as a whole. Since these metrics are
node-specific, it makes it easy to notice when, for example, one node serves a
disproportionate amount of connections. We would refer to such a RabbitMQ
cluster as **unbalanced**, meaning that a minority of nodes perform the
majority of work.

![RabbitMQ Overview Dashboard CONNECTIONS](/img/rabbitmq-overview-dashboard-connections.png)
> In the example above, connections are spread out evenly across all nodes.

### <a id="colour-consistency" class="anchor" href="#colour-consistency">Colour consistency</a>

All metrics across all graphs are linked to specific nodes. For example, all
metrics in green are for the node that contains `0` in its name, e.g.
`rabbit@rmq0`. This makes is easy to correlate metrics across all graphs to a
specific node. Metrics for the first node, which is assumed to contain `0` in
its name, will always appear as green across all graphs.

It is important to remember this aspect when using RabbitMQ Overview Dashboard
with your RabbitMQ deployments, which may follow a different naming convention,
and therefore result in inconsistent colours across graphs.

### <a id="thresholds" class="anchor" href="#thresholds">Thresholds</a>

Most metrics have pre-configured thresholds. They appear as semi-transpared
orange or red areas, as seen in the example below.

Metrics in the **orange** area signal that some pre-defined threshold has been
exceeded. This may be OK, especially if the metric recovers. A metric that
comes close to the orange area represents a system which is working at optimal
capacity.

Metrics in the **red** area signal some sort of service degradation. In the
case of memory, it means that the memory alarm was triggered and publishers
were blocked.

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-memory-threshold.png)

In the example above, we have a RabbitMQ cluster that runs at optimal memory
capacity, which is just above the warning threshold. There is a spike in
incoming messages which exhausts all memory allocated to RabbitMQ. Because the
system has more memory available than is allocated to RabbitMQ, we notice a
single dip below **0 B**. This emphasizes the importance of leaving spare
memory available, and not allocating all memory to RabbitMQ. As you may know,
when a RabbitMQ node exhausts all memory that it is allowed to use, the memory
alarm is triggered and all publishers, across the entire cluster, get blocked.

In this example, we can see how memory is released which clears the memory
alarm and, as a result, publishers become unblocked. Eventually, all queued
messages are consumed, memory is released and the cluster returns to its
optimal state.

It is worth pointing out that all thresholds use reasonable defaults which are
not suitable for all types of workloads. Some use-cases may require higher
thresholds, others may require lower ones. While the defaults should be
adequate for most scenarios, please feel free to change them for your specific
requirements.

### <a id="documentation" class="anchor" href="#documentation">Documentation</a>

Most metrics have explanations in the top-left corner of the panel. Some, like
the available disk space metric, link to specific pages from our official docs.
These pages contain the information required to fully understand all aspects of
the respective metric.

![RabbitMQ Overview Dashboard Single-stat](/img/rabbitmq-overview-dashboard-disk-documentation.png)

### <a id="anti-patterns" class="anchor" href="#service-degradation">Anti-patterns</a>

Any metric which shows in red hits to an anti-pattern. It is a new way in which
we try to highlight sub-optimal uses of RabbitMQ. If you see any red graph with
non-zero metrics, it's worth investigating. RabbitMQ, like any
service, cannot be efficient if client applications abuse it.

In the example below we can see the usage of greatly inefficient [polling
consumers](/consumers.html#fetching) that returns no messages (an empty
operation):

![RabbitMQ Overview Dashboard Antipatterns](/img/rabbitmq-overview-dashboard-antipattern.png)

### <a id="different-configurations" class="anchor" href="#different-configurations">Try different configurations</a>

In `docker/docker-compose-overview.yml` you will find different PerfTest
configurations which test different aspects of RabbitMQ. Our goal was to
exercise all metrics on the RabbitMQ Overview Dashboard. You may be interested
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

# vvv WIP vvv

## <a id="installation" class="anchor" href="#installation">Installation</a>

### <a id="installation-prometheus" class="anchor" href="#installation-prometheus">Enable the Plugin</a>

To use it, first enable the `rabbitmq_prometheus` plugin:

<pre class="lang-bash">
# might require using sudo
rabbitmq-plugins enable rabbitmq_prometheus
</pre>

## <a id="prometheus" class="anchor" href="#prometheus">Prometheus</a>

As explained previously, Prometheus periodically polls the systems it monitors.
By default this happens once a minute but can be [changed](https://prometheus.io/docs/prometheus/latest/configuration/configuration/).

RabbitMQ metrics are also updated periodically. The stats collection interval is controlled
by a [configurable setting](/management.html#statistics-interval), `collect_statistics_interval`.

For production environments it makes sense to synchronise the two values, or at least reduce the gap
between them. For monitoring systems the precision of one minute is usually appropriate
and, in fact, optimal.

To find the stats collection interval on a node, use `rabbitmqctl environment`:

<pre class="lang-bash">
rabbitmqctl environment | grep collect_statistics_interval
# => {collect_statistics_interval,5000}
</pre>

The returned value will be in milliseconds.

In this case, the interval is 5 seconds, which is a RabbitMQ default. Prometheus
can be configured to use a matching interval (note: the 5 second interval is used here
as an example; it is generally recommended to configure RabbitMQ stats collection interval
to 30 or 60 seconds instead of making Prometheus poll more frequently).

Here's an example Prometheus config file:

<pre class="lang-yaml">
scrape_configs:
  - job_name: rabbitmq
    scrape_interval: 5s
    scrape_timeout: 4s
    metrics_path: /api/metrics
    static_configs:
      - targets: ['localhost:15672']
</pre>

### <a id="grafana" class="anchor" href="#grafana">Grafana</a>

Grafana dashboards for RabbitMQ are distributed via grafana.com. TODO: links.

### <a id="rabbitmq-configuration" class="anchor" href="#rabbitmq-configuration">Further Configuration</a>

RabbitMQ's default [sample retention policies](/management.html#sample-retention) also
might need changing for environments that store metrics in Prometheus.

## <a id="3rd-party-plugin" class="anchor" href="#3rd-party-plugin">Using Prometheus with RabbitMQ 3.7</a>

RabbitMQ versions prior to 3.8 can use a separate plugin,
[prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter),
to expose metrics to Prometheus. The plugin uses [RabbitMQ HTTP API](/monitoring.html) internally
and requires visualisation to be set up separately.
