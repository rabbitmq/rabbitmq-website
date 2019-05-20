# Monitoring with Prometheus

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers monitoring using [Prometheus](https://prometheus.io/),
a monitoring and alerting tool. It explains how to expose node and cluster
metrics to Prometheus, how to verify the endpoints used to Prometheus and
what configurable Prometheus settings are relevant in the context of [RabbitMQ
monitoring](/monitoring.html).

### <a id="what-is-prometheus" class="anchor" href="#what-is-prometheus">What is Prometheus?</a>

Prometheus is an open source monitoring and time series data store.
It is based on a pull-based model, meaning that Prometheus pulls metrics from the
systems it monitors. Tools that Prometheus monitors are expected to provide pre-configured HTTP
endpoints, known as targets, that get queried periodically.

RabbitMQ needs a plugin to expose its metrics as Prometheus targets.

There are 2 options available:

1. External system process that converts metrics exposed by RabbitMQ Management
   API into `prometheus_text_format` and makes them available via HTTP on TCP
   port 9090: [rabbitmq_exporter](https://github.com/kbudde/rabbitmq_exporter)
1. RabbitMQ plugin that exposes a new HTTP endpoint `/api/metrics` in the
   context of RabbitMQ Management API:
   [prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter)

Both approaches have their own merits and neither is better. This guide focuses on the
2nd approach and a community-maintained plugin called [prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter).
The plugin depends on the [management plugin](/management.html) and extends its HTTP API.


### <a id="installation" class="anchor" href="#installation">Installing and Enabling the Plugin</a>

Just like any other [RabbitMQ plugin](./plugins.html), the Prometheus exporter plugin has to be
installed and enabled. Plugin installation involves downloading a plugin archive and all of its dependencies
(all `.ez` files).

[Plugin directories](/plugins.html#plugin-directories) can be located by executing the following command on the host
with a running RabbitMQ node:

<pre class="lang-bash">
rabbitmqctl eval 'application:get_env(rabbit, plugins_dir).'
{ok,"/usr/lib/rabbitmq/plugins:/usr/lib/rabbitmq/lib/rabbitmq_server-3.7.7/plugins"}
</pre>

The first plugin dir (`/usr/lib/rabbitmq/plugins`) in the example above is ideal for third party plugins
such as Prometheus exporter. If the reported directory does not exist, it has to be created.

The following example shell script downloads the plugin and all of its dependencies:

<pre class="lang-bash">
#!/bin/sh

# make sure the directory exists
mkdir -p /usr/lib/rabbitmq/plugins
cd /usr/lib/rabbitmq/plugins

# Downloads prometheus_rabbitmq_exporter and its dependencies with curl

readonly base_url='https://github.com/deadtrickster/prometheus_rabbitmq_exporter/releases/download/v3.7.2.4'

get() {
  curl -LO "$base_url/$1"
}

get accept-0.3.3.ez
get prometheus-3.5.1.ez
get prometheus_cowboy-0.1.4.ez
get prometheus_httpd-2.1.8.ez
get prometheus_rabbitmq_exporter-3.7.2.4.ez
</pre>

Verify that plugin archives are in place (output should be similar to this - note file sizes):

<pre class="lang-bash">
ls -la /usr/lib/rabbitmq/plugins/accept* /usr/lib/rabbitmq/plugins/prometheus*

-rw-r--r-- 1 root root  13397 Oct 23 10:22 /usr/lib/rabbitmq/plugins/accept-0.3.3.ez
-rw-r--r-- 1 root root 200783 Oct 23 10:22 /usr/lib/rabbitmq/plugins/prometheus-3.5.1.ez
-rw-r--r-- 1 root root  14343 Oct 23 10:22 /usr/lib/rabbitmq/plugins/prometheus_cowboy-0.1.4.ez
-rw-r--r-- 1 root root  22059 Oct 23 10:22 /usr/lib/rabbitmq/plugins/prometheus_httpd-2.1.8.ez
-rw-r--r-- 1 root root 219060 Oct 23 10:22 /usr/lib/rabbitmq/plugins/prometheus_rabbitmq_exporter-3.7.2.4.ez
</pre>

RabbitMQ must be able to read the plugin files, so archive file permissions must allow
for that.

Once `prometheus_rabbitmq_exporter` plugin and all its dependencies are
downloaded , use [rabbitmq-plugins](/cli.html) to ensure that it was
successfully installed by listing all available plugins:

<pre class="lang-bash">
rabbitmq-plugins list

 Configured: E = explicitly enabled; e = implicitly enabled
 | Status: * = running on rabbit@0998e19c44ee
 |/
[  ] prometheus_rabbitmq_exporter      3.7.2.4
[  ] rabbitmq_amqp1_0                  3.7.7
# … elided for brevity …
[  ] rabbitmq_web_stomp                3.7.7
[  ] rabbitmq_web_stomp_examples       3.7.7
</pre>

To enable the plugin:

<pre class="lang-bash">
rabbitmq-plugins enable prometheus_rabbitmq_exporter
</pre>


### <a id="prometheus-data-format" class="anchor" href="#prometheus-data-format">Metrics Data Format</a>

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

### Visualization of Stored Metrics

Storing metrics in Prometheus is a lot more useful when there's a way to visualize them, e.g.
[using Grafana](https://prometheus.io/docs/visualization/grafana/).

### Further Configuration

RabbitMQ's default [sample retention policies](http://www.rabbitmq.com/management.html#sample-retention) also
might need changing for environments that store metrics in
Prometheus.

[prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter#configuration) provides
a number of configuration options that might be useful.

### Collecting Runtime Metrics

[prometheus_process_collector](https://github.com/deadtrickster/prometheus_process_collector) is an additional plugin that can be installed
alongside `prometheus_rabbitmq_exporter`. It collects Erlang VM system process
metrics from the operating system. Unlike RabbitMQ, this plugin uses native
code and does not support the same operating systems and architectures that RabbitMQ itself does.

Please check [compatibility and installation instructions](https://github.com/deadtrickster/prometheus_process_collector) before
adopting that plugin.
