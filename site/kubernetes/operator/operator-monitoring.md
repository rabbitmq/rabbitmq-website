# Monitoring RabbitMQ in Kubernetes

This guide describes how to [monitor](/monitoring.html) RabbitMQ instances deployed by the [Kubernetes Cluster Operator](/kubernetes/operator/operator-overview.html).

## <a id='overview' class='anchor' href='#overview'>Overview</a>

Cluster Operator deploys RabbitMQ clusters with the [`rabbitmq_prometheus` plugin](/prometheus.html), which is enabled
for all nodes deployed by the Operator by default. The plugin exposes a Prometheus-compatible metrics endpoint.

For information on configuring Prometheus to scrape Kubernetes targets, check the
[Prometheus configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#kubernetes_sd_config)
documentation.
For a detailed guide on RabbitMQ Prometheus configuration, check the [Prometheus guide](/prometheus.html).

The following sections assume Prometheus is deployed and functional.


## <a id='prom-annotations' class='anchor' href='#prom-annotations'>Monitor RabbitMQ Using Scraping Annotations</a>

Prometheus can be configured to scrape all Pods with the `prometheus.io/scrape: true` annotation. The
[Prometheus Helm chart](https://github.com/helm/charts/tree/master/stable/prometheus#scraping-pod-metrics-via-annotations),
for example, is configured by default to scrape all pods in a cluster with this annotation. All RabbitMQ pods created
by the Cluster Operator have this annotation, and so will be automatically scraped if Prometheus
was deployed through the Helm chart.

If Prometheus was deployed through some other means, it is still possible to set up scraping of all pods with this annotation.
This can be achieved through the [Kubernetes Service Discovery](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#kubernetes_sd_config)
configuration. A bare-minimum Prometheus configuration which can provide this functionality is included below for reference.

<pre class='hljs lang-yaml'>
global:
  scrape_interval: 1m
  scrape_timeout: 10s
  evaluation_interval: 1m
scrape_configs:
- job_name: kubernetes-pods
  honor_timestamps: true
  scrape_interval: 1m
  scrape_timeout: 10s
  metrics_path: /metrics
  scheme: http
  kubernetes_sd_configs:
  - role: pod
  relabel_configs:
  - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
    separator: ;
    regex: "true"
    replacement: $1
    action: keep
  - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
    separator: ;
    regex: ([^:]+)(?::\d+)?;(\d+)
    target_label: __address__
    replacement: $1:$2
    action: replace
</pre>


## <a id='prom-operator' class='anchor' href='#prom-operator'>Monitor RabbitMQ Using the Prometheus Operator</a>

The Prometheus Operator defines scraping configuration through a more flexible custom resource called `PodMonitor`.
For more information, see the [Prometheus Operator](https://github.com/coreos/prometheus-operator) in GitHub.

To use the Prometheus Operator to monitor RabbitMQ clusters:

First, deploy the Prometheus Operator. There are several ways to do so. Guidance is provided in the
[kube-prometheus](https://github.com/coreos/kube-prometheus/#quickstart) documentation in GitHub.

Next, verify that you have deployed the Prometheus `PodMonitor` Custom Resource Definition (CRD) by running:

<pre class="lang-bash">
kubectl get customresourcedefinitions.apiextensions.k8s.io podmonitors.monitoring.coreos.com
</pre>

If this command returns an error, the Kubernetes cluster does not have the Prometheus Operator deployed.

Next, create a YAML file named `rabbitmq-podmonitor.yaml` with the following contents:

<pre class="lang-yaml">
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: rabbitmq
spec:
  podMetricsEndpoints:
  - interval: 15s
    port: prometheus
  selector:
    matchLabels:
      app.kubernetes.io/component: rabbitmq
  namespaceSelector:
    any: true
</pre>

This defines the `PodMonitor` resource, which is needed to configure the automatic discovery of RabbitMQ clusters.

Next, apply the `PodMonitor` resource by running

<pre class="lang-bash">
kubectl apply -f rabbitmq-podmonitor.yaml
</pre>

`PodMonitor` can be created in any namespace, as long as the Prometheus Operator has permissions to find it.
For more information about these permissions, see [Configure Permissions for the Prometheus Operator](#config-perm) below.


### <a id='config-perm' class='anchor' href='#config-perm'>(Optional) Configure Permissions for the Prometheus Operator</a>

If no RabbitMQ clusters appear in Prometheus, it might be necessary to [adjust permissions for the Prometheus Operator](https://github.com/coreos/prometheus-operator/blob/master/Documentation/rbac.md).

The following steps have been tested with a `kube-prometheus` deployment.

To configure permissions for the Prometheus Operator, first create a file named `prometheus-roles.yaml`
with the following contents:

<pre class="lang-yaml">
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
  name: prometheus
rules:
- apiGroups: [""]
  resources:
  - nodes
  - services
  - endpoints
  - pods
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources:
  - configmaps
  verbs: ["get"]
- nonResourceURLs: ["/metrics"]
  verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
- kind: ServiceAccount
  name: prometheus-k8s
  namespace: monitoring
</pre>

Then apply the permissions listed in `prometheus-roles.yaml` by running

<pre class="lang-bash">
kubectl apply -f prometheus-roles.yaml
</pre>


## <a id='grafana' class='anchor' href='#grafana'>Import Dashboards to Grafana</a>

RabbitMQ provides Grafana dashboards to visualize the metrics scraped by Prometheus.

Follow the instructions in the [Prometheus guide](/prometheus.html#grafana-configuration)
to import dashboards to Grafana.
