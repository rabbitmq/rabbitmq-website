# Monitoring with Prometheus

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers monitoring using [Prometheus](https://prometheus.io/),
a monitoring and alerting tool, and [Grafana](https://grafana.com/), a popular tool for metric visualisation.

It explains how to expose node and cluster metrics to Prometheus, how to verify the endpoints used to Prometheus and
what configurable Prometheus settings are relevant in the context of [RabbitMQ monitoring](/monitoring.html).

Together Prometheus and Grafana provide observability of individual nodes and cluster metrics
using a number of dashboards that look like this:

![RabbitMQ Overview Dashboard](/img/rabbitmq-overview-dashboard-top.png)


## <a id="what-is-prometheus" class="anchor" href="#what-is-prometheus">What are Prometheus and Grafana?</a>

Prometheus is an open source monitoring and time series data store.
It is based on a pull-based model, meaning that Prometheus pulls metrics from the
systems it monitors. Tools that Prometheus monitors are expected to provide pre-configured HTTP
endpoints, known as targets, that get queried periodically.

[Grafana](https://grafana.com/) is an opeen source tool for metric visualisation. It visualises the metric
data collected by Prometheus and makes it easier for operators to spot problems, inefficiencies and
system behaviour trends.


## <a id="installation" class="anchor" href="#installation">Installation</a>

### <a id="installation-prometheus" class="anchor" href="#installation-prometheus">Enable the Plugin</a>

As of version 3.8, RabbitMQ ships with built-in Prometheus & Grafana support.

To use it, first enable the `rabbitmq_prometheus` plugin:

<pre class="lang-bash">
# might require using sudo
rabbitmq-plugins enable rabbitmq_prometheus
</pre>

### <a id="installation-charts" class="anchor" href="#installation-charts">Installation of Grafana Dashboards</a>

Grafana dashboards for RabbitMQ are distributed via grafana.com. TODO: links.

### <a id="installation-runtime-charts" class="anchor" href="#installation-runtime-charts">Runtime Monitoring</a>

Optionally [RabbitMQ's runtime](/runtime.html) metrics can be collected.

TODO


## <a id="rabbitmq-overview-dashboard" class="anchor" href="#rabbitmq-overview-dashboard">RabbitMQ Overview Dashboard</a>

All metrics that are provided on the [Management UI](/management.html) Overview page are available on this dashboard.
They are grouped by object type, with a focus on nodes and message flow. Some metrics are node-specific, others are cluster metrics.

Each metric is represented as a separate graph (chart). Some metrics that are displayed as point-in-time numbers on the management UI overview page
also use dedicated charts. This makes it easier to observe how the metrics (e.g. the number of connections or enqueued messages) changed
over time.

### <a id="metric-health-indicators" class="anchor" href="#metric-health-indicators">Metric Health Indicators</a>

Boxes at the top of the dashboard capture the health of a single RabbitMQ cluster:

 * Green means the metric is within its configured range of values (healthy).
 * Blue means under-utilisation or some form of degradation.
 * Orange areas in graph panels are meant to make users aware of capacity.
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



## <a id="prometheus-data-format" class="anchor" href="#prometheus-data-format">Metrics Data Format</a>

The Prometheus target HTTP endpoints respond in a text format known as
the Prometheus text format (sometimes written as as `prometheus_text_format`).

Here's an example of said format:

<pre class="lang-bash">
# TYPE rabbitmq_consumers gauge
# HELP rabbitmq_consumers RabbitMQ consumer count
rabbitmq_consumers 0
</pre>

The above is a metric example named `rabbitmq_consumers` of type `gauge` with a
value of `0`, and an inline explanation: `RabbitMQ consumer count`.

The following section will explain how to verify that the target endpoint
is up and running.


### <a id="verify" class="anchor" href="#verify">Verifying Endpoints</a>

To confirm that RabbitMQ node provides a Prometheus target endpoint,
use [curl](https://curl.haxx.se) or a similar tool:

<pre class="lang-bash">
curl --verbose http://localhost:15672/api/metrics

# => * Trying 127.0.0.1...
# => * TCP_NODELAY set
# => * Connected to localhost (127.0.0.1) port 15672 (#0)
# =>   GET /api/metrics HTTP/1.1
# =>   Host: localhost:15672
# =>   User-Agent: curl/7.52.1
# =>   Accept: */*
# =>
# =>   HTTP/1.1 200 OK
# =>   content-encoding: identity
# =>   content-length: 87732
# =>   content-type: text/plain; version=0.0.4
# =>   date: Fri, 07 Sep 2018 08:42:50 GMT
# =>   server: Cowboy
# =>
# => ... elided for brevity ...
# =>
# => TYPE rabbitmq_consumers gauge
# => HELP rabbitmq_consumers RabbitMQ Consumers count
# => rabbitmq_consumers 0
# => TYPE rabbitmq_queues gauge
# => HELP rabbitmq_queues RabbitMQ Proplist count
# => rabbitmq_queues 0
# => TYPE rabbitmq_exchanges gauge
# => HELP rabbitmq_exchanges RabbitMQ Exchanges count
# => rabbitmq_exchanges 7
# => TYPE rabbitmq_connections gauge
# => HELP rabbitmq_connections RabbitMQ Connections count
# => rabbitmq_connections 0
# => TYPE rabbitmq_channels gauge
# => HELP rabbitmq_channels RabbitMQ Channels count
# => rabbitmq_channels 0
# => TYPE rabbitmq_messages_ready gauge
# => HELP rabbitmq_messages_ready Messages ready for delivery
# => ...
</pre>

If the response is similar to that in the example above, the node is exposing metrics in a way that
Prometheus can consume and store.

If HTTP API has been configured to use a custom [path prefix](/management.html#path-prefix),
it has to be included into the metrics endpoint path.

For example, if the path prefix is set to `mgmt`, the metrics would be available at
`http://{hostname}:15672/mgmt/api/metrics`.


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

To run a Prometheus node with it on port `9090`, assuming a Prometheus binary in `PATH`.

<pre class="lang-bash">
prometheus --config.file=./rabbitmq.yml --web.external-url=http://localhost:9090/
</pre>

[http://localhost:9090/targets](http://localhost:9090/targets) can be used
to inspect the metrics pulled from RabbitMQ:

![Prometheus Targets - RabbitMQ](/img/prometheus-rabbitmq-target.png)

Prometheus supports queries, e.g. to query the number of exchanges, request
[http://localhost:9090/graph?g0.range_input=1h&g0.expr=rabbitmq_exchanges&g0.tab=0](http://localhost:9090/graph?g0.range_input=1h&g0.expr=rabbitmq_exchanges&g0.tab=0):

![Prometheus Graph - RabbitMQ Exchanges](/img/prometheus-rabbitmq-exchanges-graph.png)


## <a id="beyond-the-basics" class="anchor" href="#beyond-the-basics">Going Beyond the Basics</a>

Setting up a Prometheus node locally was easy enough but going into production
requires some additional consideration.

### Optimal Polling Interval

Querying many thousands of metrics every 5 seconds will put a lot
of pressure on RabbitMQ, a more sensible default would be 60 (or at least 30) seconds.

### Further Configuration

RabbitMQ's default [sample retention policies](/management.html#sample-retention) also
might need changing for environments that store metrics in Prometheus.

### Collecting Runtime Metrics

[prometheus_process_collector](https://github.com/deadtrickster/prometheus_process_collector) is an additional plugin that can be installed
alongside `prometheus_rabbitmq_exporter`. It collects Erlang VM system process
metrics from the operating system. Unlike RabbitMQ, this plugin uses native
code and does not support the same operating systems and architectures that RabbitMQ itself does.

Please check [compatibility and installation instructions](https://github.com/deadtrickster/prometheus_process_collector) before
adopting that plugin.


## <a id="3rd-party-plugin" class="anchor" href="#3rd-party-plugin">Using Prometheus with RabbitMQ 3.7</a>

RabbitMQ versions prior to 3.8 can use a separate plugin,
[prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter),
to expose metrics to Prometheus. The plugin uses [RabbitMQ HTTP API](/monitoring.html) internally
and requires visualisation to be set up separately.

The plugin was previously covered in a [separate guide](https://previous.rabbitmq.com/v3_7_x/prometheus.html).
