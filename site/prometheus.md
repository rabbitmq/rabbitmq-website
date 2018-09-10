# Monitoring with Prometheus

## <a id="what-is-prometheus" class="anchor" href="#what-is-prometheus">What is Prometheus?</a>

Prometheus is an open-source monitoring system and time series database.  It is
based on a pull-based model, meaning that Prometheus will pull metrics from the
systems that it monitors.  The pull mechanism relies on pre-configured HTTP
endpoints, known as targets, that get queried periodically - every 60 seconds
by default.  The HTTP endpoints respond in plaintext, in a format known as
`prometheus_text_format`.  This is a metric example from the HTTP response body
that Prometheus can interpret and store in its internal time series database:

<pre class="sourcecode sh">
# TYPE rabbitmq_consumers gauge
# HELP rabbitmq_consumers RabbitMQ Consumers count
rabbitmq_consumers 0
</pre>

The above is a metric example named `rabbitmq_consumers` of type `gauge` with a
value of `0`, and an inline explanation: `RabbitMQ Consumers count`.

Now that we have a basic Prometheus understanding, we will configure RabbitMQ
to make all its metrics available to Prometheus.

## <a id="enable-rabbitmq-prometheus-metrics" class="anchor" href="#enable-rabbitmq-prometheus-metrics">How to enable Prometheus metrics in RabbitMQ?</a>

There are 2 ways to make RabbitMQ metrics available to Prometheus:

1. External system process that converts metrics exposed by RabbitMQ Management
   API into `prometheus_text_format` and makes them available via HTTP on TCP
   port 9090: [rabbitmq_exporter](https://github.com/kbudde/rabbitmq_exporter)
1. RabbitMQ plugin that exposes a new HTTP endpoint `/api/metrics` in the
   context of RabbitMQ Management API:
   [prometheus_rabbitmq_exporter](https://github.com/deadtrickster/prometheus_rabbitmq_exporter)

Both approaches have their own merits and neither is better - they are just
different.  For the purpose of this guide, we will cover the second approach,
which implies setting up community-maintained RabbitMQ plugins while the
RabbitMQ node is running, without incurring any downtime.

Given a single RabbitMQ 3.7.x node running on Erlang/OTP 20.x or newer, let's
find where plugins are stored by running the following command on the host
with the RabbitMQ node:

<pre class="sourcecode sh">
rabbitmqctl eval 'application:get_env(rabbit, plugins_dir).'
{ok,"/usr/lib/rabbitmq/plugins:/usr/lib/rabbitmq/lib/rabbitmq_server-3.7.7/plugins"}
</pre>

We notice that the first path for plugins is generic making it ideal for third party plugins,
while the second one is specific to the RabbitMQ version that is currently running.

> If there is a single plugin directory configured, then add the custom plugins there

In this example, we will add custom plugins to the first plugin path:

<pre class="sourcecode sh">
cd /usr/lib/rabbitmq/plugins
bash: cd: /usr/lib/rabbitmq/plugins: No such file or directory
# since this directory doesn't exist, we will create it
mkdir -p /usr/lib/rabbitmq/plugins
cd /usr/lib/rabbitmq/plugins

# now let's grab the relevant plugins straight from source
# (you might need to install curl first)
get="curl --progress-bar --location --remote-name"
download_base_url="https://github.com/deadtrickster/prometheus_rabbitmq_exporter/releases/download/v3.7.2.2"
$get $download_base_url/accept-0.3.3.ez
######################################################################## 100.0%
$get $download_base_url/prometheus-3.5.1.ez
######################################################################## 100.0%
$get $download_base_url/prometheus_cowboy-0.1.4.ez
######################################################################## 100.0%
$get $download_base_url/prometheus_httpd-2.1.8.ez
######################################################################## 100.0%
$get $download_base_url/prometheus_rabbitmq_exporter-v3.7.2.2.ez
######################################################################## 100.0%
</pre>

Let's confirm that the plugins are on disk:

<pre class="sourcecode sh">
find /usr/lib/rabbitmq/plugins

/usr/lib/rabbitmq/plugins
/usr/lib/rabbitmq/plugins/prometheus_rabbitmq_exporter-v3.7.2.2.ez
/usr/lib/rabbitmq/plugins/prometheus_httpd-2.1.8.ez
/usr/lib/rabbitmq/plugins/accept-0.3.3.ez
/usr/lib/rabbitmq/plugins/prometheus_cowboy-0.1.4.ez
/usr/lib/rabbitmq/plugins/prometheus-3.5.1.ez
</pre>

Let's confirm that RabbitMQ can access the new plugin files:

<pre class="sourcecode sh">
rabbitmq-plugins list

 Configured: E = explicitly enabled; e = implicitly enabled
 | Status: * = running on rabbit@0998e19c44ee
 |/
[  ] prometheus_rabbitmq_exporter      v3.7.2.2 # this is the plugin that we just added
[  ] rabbitmq_amqp1_0                  3.7.7
[  ] rabbitmq_auth_backend_cache       3.7.7
[  ] rabbitmq_auth_backend_http        3.7.7
[  ] rabbitmq_auth_backend_ldap        3.7.7
[  ] rabbitmq_auth_mechanism_ssl       3.7.7
[  ] rabbitmq_consistent_hash_exchange 3.7.7
[  ] rabbitmq_event_exchange           3.7.7
[  ] rabbitmq_federation               3.7.7
[  ] rabbitmq_federation_management    3.7.7
[  ] rabbitmq_jms_topic_exchange       3.7.7
[  ] rabbitmq_management               3.7.7
[  ] rabbitmq_management_agent         3.7.7
[  ] rabbitmq_mqtt                     3.7.7
[  ] rabbitmq_peer_discovery_aws       3.7.7
[  ] rabbitmq_peer_discovery_common    3.7.7
[  ] rabbitmq_peer_discovery_consul    3.7.7
[  ] rabbitmq_peer_discovery_etcd      3.7.7
[  ] rabbitmq_peer_discovery_k8s       3.7.7
[  ] rabbitmq_random_exchange          3.7.7
[  ] rabbitmq_recent_history_exchange  3.7.7
[  ] rabbitmq_sharding                 3.7.7
[  ] rabbitmq_shovel                   3.7.7
[  ] rabbitmq_shovel_management        3.7.7
[  ] rabbitmq_stomp                    3.7.7
[  ] rabbitmq_top                      3.7.7
[  ] rabbitmq_tracing                  3.7.7
[  ] rabbitmq_trust_store              3.7.7
[  ] rabbitmq_web_dispatch             3.7.7
[  ] rabbitmq_web_mqtt                 3.7.7
[  ] rabbitmq_web_mqtt_examples        3.7.7
[  ] rabbitmq_web_stomp                3.7.7
[  ] rabbitmq_web_stomp_examples       3.7.7
</pre>

At this point, we have downloaded the RabbitMQ Prometheus plugin and all its dependencies on the host where RabbitMQ is running.
Since these files were added to a location where RabbitMQ is configured to look for plugins (via the `plugins_dir` configuration),
the new plugin was present in the list of plugins, as returned by `rabbitmq-plugins list`.
To enable the RabbitMQ Prometheus plugin, we run the following command:

<pre class="sourcecode sh">
rabbitmq-plugins enable prometheus_cowboy prometheus_httpd prometheus_rabbitmq_exporter

The following plugins have been configured:
  prometheus_rabbitmq_exporter
  rabbitmq_management
  rabbitmq_management_agent
  rabbitmq_web_dispatch
Applying plugin configuration to rabbit@a61abf706853...
The following plugins have been enabled:
  prometheus_rabbitmq_exporter
  rabbitmq_management
  rabbitmq_management_agent
  rabbitmq_web_dispatch

started 4 plugins.
</pre>

Notice that we have enabled `prometheus_cowboy` & `prometheus_httpd` explicitly, even if they didn't show in the list of plugins.
This is only necessary if the `prometheus_rabbitmq_exporter` plugin is enabled while the RabbitMQ node is running.
If the node is restarted, these dependent applications will be started implicitly.

To confirm that our RabbitMQ node is Prometheus-ready,
let's confirm that the new HTTP endpoint responds in prometheus_text_format:

<pre class="sourcecode sh">
curl --verbose http://localhost:15672/api/metrics

* Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 15672 (#0)
  GET /api/metrics HTTP/1.1
  Host: localhost:15672
  User-Agent: curl/7.52.1
  Accept: */*

  HTTP/1.1 200 OK
  content-encoding: identity
  content-length: 87732
  content-type: text/plain; version=0.0.4
  date: Fri, 07 Sep 2018 08:42:50 GMT
  server: Cowboy

{ [16220 bytes data]
...
# TYPE rabbitmq_consumers gauge
# HELP rabbitmq_consumers RabbitMQ Consumers count
rabbitmq_consumers 0
# TYPE rabbitmq_queues gauge
# HELP rabbitmq_queues RabbitMQ Proplist count
rabbitmq_queues 0
# TYPE rabbitmq_exchanges gauge
# HELP rabbitmq_exchanges RabbitMQ Exchanges count
rabbitmq_exchanges 7
# TYPE rabbitmq_connections gauge
# HELP rabbitmq_connections RabbitMQ Connections count
rabbitmq_connections 0
# TYPE rabbitmq_channels gauge
# HELP rabbitmq_channels RabbitMQ Channels count
rabbitmq_channels 0
# TYPE rabbitmq_messages_ready gauge
# HELP rabbitmq_messages_ready Messages ready for delivery
...
</pre>

All the RabbitMQ metrics exposed via this URL update according to the `collect_statistics_interval` value.
To find out what this value is for your RabbitMQ node, run the following command:

<pre class="sourcecode sh">
rabbitmqctl eval 'application:get_env(rabbit, collect_statistics_interval).'
{ok,5000}
</pre>

In this case, metrics update every 5 seconds, or 5000ms. This is relevant...

## Prometheus scrape_config

* targets
* console
* graph

## Grafana overview dashboard

## prometheus_rabbitmq_exporter options
