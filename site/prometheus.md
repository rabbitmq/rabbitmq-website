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
dashboard, as well as others. They are each meant to give insights into specific parts
of the system. When used together, they are able to explain any RabbitMQ
behaviour in great detail.

When RabbitMQ is integrated with Prometheus and Grafana, this is what the
RabbitMQ Overview dashboard looks like:

![RabbitMQ Overview Dashboard](/img/rabbitmq-overview-dashboard.png)

> [Prometheus](https://prometheus.io/docs/introduction/overview/) is a monitoring toolkit. [Grafana](https://grafana.com/grafana) is a metrics visualisation system.

To discover what else RabbitMQ Overview Grafana dashboard has in store, let's
get it up and running locally. We will take the quickest path of setting
everything up so that you can better imagine how this will benefit your
RabbitMQ deployment(s). You will be able to interact with RabbitMQ, Prometheus
& Grafana locally, on your machine. You will also be able to try out different
load profiles and understand how it all fits together.

### <a id="quick-start" class="anchor" href="#quick-start">Quick Start</a>

To get started, you will need a browser and a terminal available on your
machine. Next, you will need to install [Git](https://git-scm.com/) as well as
[Docker Desktop](https://www.docker.com/products/docker-desktop). The
pre-requisites are set up correctly when `git version`, `docker info` &amp;
`docker-compose version` work in your terminal.

We will now clone the **rabbitmq-prometheus** repository from GitHub
and start all components required for a fully functional RabbitMQ Overview
dashboard:

<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-prometheus.git
cd rabbitmq-prometheus/docker
docker-compose -f docker-compose-metrics.yml up -d
docker-compose -f docker-compose-overview.yml up -d
</pre>

> `make metrics overview` is the equivalent of the `docker-compose` commands above

When all the above commands succeed, open
[http://localhost:3000/dashboards](http://localhost:3000/dashboards) in your
browser and login with username `admin` and password `admin`. Feel free to skip
the change password step, it's a local Grafana installation after all. Now navigate
to the RabbitMQ-Overview dashboard.

Congratulations! You now have a 3-nodes RabbitMQ cluster integrated with
Prometheus & Grafana running locally. This is a perfect time to learn more
about the RabbitMQ Overview Grafana dashboard.

![RabbitMQ Overview Dashboard Localhost](/img/rabbitmq-overview-dashboard-localhost.png)

## <a id="rabbitmq-overview-dashboard" class="anchor" href="#rabbitmq-overview-dashboard">RabbitMQ Overview Dashboard</a>

All metrics that are provided on the [Management UI](/management.html) Overview
page are available on this dashboard. They are grouped by object type, with a
focus on nodes and message flow.

All metrics are node-specific. This helps spot imbalances in the cluster,
where one node is using significantly more memory or disk than the rest. Some
metrics, like those under **QUEUES MESSAGES**, are stacked to capture the state
of the cluster as a whole.

Some metrics that are displayed as point-in-time numbers on the Management UI
Overview page also use dedicated graphs (charts). This makes it easy to observe
how these values, such as the number of connections or queues, change over time.

### <a id="metric-health-indicators" class="anchor" href="#metric-health-indicators">Metric Health Indicators</a>

Single-stat metrics at the top of the dashboard capture the health of a single
RabbitMQ cluster. We use different colours to capture the following states:

* Green means the metric is within a healthy range
* Blue means under-utilisation or some form of degradation
* Red means the metric is below or above the range that is considered healthy

The default ranges for the single-stat metrics may not be optimal for all
RabbitMQ deployments. For example, it may be perfectly fine ...

# vvv WIP vvv

 * Orange areas in graph panels are meant to make users aware of capacity
 * Any node metrics in red areas signal service degradation. Depending on the metric, it may mean [blocked publishers](/alarms.html),
   refusal to [accept new connections](/connections.html#monitoring) or service degradation of a different kind.

Values that are close to the orange area represent a system which is working at optimum capacity.

For example, the following screenshot demonstrates aptures a RabbitMQ cluster where all nodes are within their [configured memory use limit](/memory.html):
![RabbitMQ Overview Dashboard](/img/rabbitmq-overview-dashboard-top.png)

The following screenshot demonstrates two problematic application behaviors that are reflected in the charts:
dropped unroutable messages as well as usage of greatly inefficient [polling consumers](/consumers.html#fetching).

![RabbitMQ Overview Dashboard - Reds & Hints](/img/rabbitmq-overview-dashboard-reds-hints.png)

Many panels provide links to the relevant [RabbitMQ documentation guides](/documentation.html).

TBD

## <a id="installation" class="anchor" href="#installation">Installation</a>

### <a id="installation-prometheus" class="anchor" href="#installation-prometheus">Enable the Plugin</a>

To use it, first enable the `rabbitmq_prometheus` plugin:

<pre class="lang-bash">
# might require using sudo
rabbitmq-plugins enable rabbitmq_prometheus
</pre>

### <a id="installation-charts" class="anchor" href="#installation-charts">Installation of Grafana Dashboards</a>

Grafana dashboards for RabbitMQ are distributed via grafana.com. TODO: links.

### <a id="installation-runtime-charts" class="anchor" href="#installation-runtime-charts">Runtime Monitoring</a>

[RabbitMQ's runtime](/runtime.html) metrics are also collected.

## <a id="store-metrics-in-prometheus" class="anchor" href="#store-metrics-in-prometheus">Storing Metrics in Prometheus</a>

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

### Further Configuration

RabbitMQ's default [sample retention policies](/management.html#sample-retention) also
might need changing for environments that store metrics in Prometheus.

## <a id="3rd-party-plugin" class="anchor" href="#3rd-party-plugin">Using Prometheus with RabbitMQ 3.7</a>

RabbitMQ versions prior to 3.8 can use a separate plugin,
[prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter),
to expose metrics to Prometheus. The plugin uses [RabbitMQ HTTP API](/monitoring.html) internally
and requires visualisation to be set up separately.

The plugin was previously covered in a [separate guide](https://previous.rabbitmq.com/v3_7_x/prometheus.html).
