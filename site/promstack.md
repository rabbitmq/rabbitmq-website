# Monitoring with Prometheus &amp; Grafana

As of v3.8.0, RabbitMQ ships with built-in Prometheus & Grafana support.
Prometheus support is achieved by enabling the **rabbitmq_prometheus** plugin.
Grafana is supported via purpose-built dashboards that our team maintains on grafana.com.

When RabbitMQ is integrated with Prometheus and Grafana, it enables visualising how the cluster, as well as individual nodes behave.
This is what putting it all together looks like:

![RabbitMQ Overview Dashboard](/img/rabbitmq-overview-dashboard-top.png)

> [Prometheus](https://prometheus.io/) is a monitoring and time series data store.
> [Grafana](https://grafana.com/) is a metrics visualisation application.
> Both Prometheus & Grafana are open source.

### <a id="quick-start" class="anchor" href="#quick-start">Quick Start</a>

The quickest way to ...

To discover what else RabbitMQ Overview Grafana dashboard has in store, let's get it up and running locally.

### <a id="rabbitmq-overview-dashboard" class="anchor" href="#rabbitmq-overview-dashboard">What does RabbitMQ Overview Dashboard help me visualise?</a>

All metrics that you are used to seeing on the Management Overview page are available on this dashboard.
They are grouped by object type, with a focus on nodes & message flow.

Metrics are represented as graphs, including those that are only displayed as numbers on the Management Overview page.
The immediate benefit of this is the ease of visualising utilisation over time, as well as number of connections, channels & queues.
Because metrics are node-specific, it's easy to spot imbalances in a cluster, where one node has significantly more queues, connections or messages than other nodes.

The colourful boxes at the top of the dashboard capture the health of a single RabbitMQ cluster.
Green is best.
Blue means under-utilisation or some form of degradation.

Orange areas in graph panels are meant to make users aware of capacity.
Values that are close to the orange area represent a system which is working at optimum capacity.
The screenshot above captures a RabbitMQ cluster where all nodes utilise memory efficiently.
There is some memory available if it is required, but not amounts large enough to signal over-provisioning & therefore waste.

Any node metrics in red areas signal service degradation.
Depending on the metric, it may mean blocked publishers, refusal to open new connections or inability to schedule work.

Any panels which have red graphs indicate inneficiencies.
In the next screenshot, we have unroutable messages as well as usage of greatly inefficient basic.get operations.

One of the best features of the new panels are the explanations & links to official docs.
They provide context & actionable advice to remedy the underlying problem.

![RabbitMQ Overview Dashboard - Reds & Hints](/img/rabbitmq-overview-dashboard-reds-hints.png)

### Integrate RabbitMQ with Prometheus & Grafana

Check that **rabbitmq_prometheus** plugin is enabled & RabbitMQ Prometheus Metrics HTTP works as expected

Check that Prometheus can connect to RabbitMQ Prometheus Metrics HTTP

Import RabbitMQ Overview Grafana dashboard

### Help us improve RabbitMQ Observability
