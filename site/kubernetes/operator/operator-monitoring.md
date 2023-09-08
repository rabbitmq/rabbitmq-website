# Monitoring &product-name; Instances Deployed by the Kubernetes Cluster Operator

Use this information to learn how to [monitor](../../monitoring.html) RabbitMQ instances deployed by the [Kubernetes Cluster Operator](./operator-overview.html).

## <a id='overview' class='anchor' href='#overview'>Introducing Monitoring in RabbitMQ</a>

The Kubernetes Cluster Operator deploys RabbitMQ clusters with the [rabbitmq_prometheus plugin](../../prometheus.html) activated or turned on. This plugin exposes a Prometheus-compatible metrics endpoint.

For detailed information on the RabbitMQ Prometheus configuration, check the [Prometheus ](../../prometheus.html) information.

The following sections assume Prometheus is deployed and functional.
How to configure Prometheus to monitor RabbitMQ depends on whether [Prometheus is installed by Prometheus Operator](#prom-operator) or [by other means](#prom-annotations).

## <a id='prom-operator' class='anchor' href='#prom-operator'>Monitor RabbitMQ with Prometheus Operator</a>

The [Prometheus Operator](https://github.com/coreos/prometheus-operator) defines the custom resource definitions (CRDs) `ServiceMonitor`, `PodMonitor`, and `PrometheusRule`.
`ServiceMonitor` and `PodMonitor` CRDs allow to declaratively define how a dynamic set of services and pods should be monitored.

Check whether the RabbitMQ Kubernetes cluster has the Prometheus Operator deployed:

<pre class="lang-bash">
kubectl get customresourcedefinitions.apiextensions.k8s.io servicemonitors.monitoring.coreos.com
</pre>
If this command returns an error, Prometheus Operator is not deployed. If you want to deploy it, follow [these instructions](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/user-guides/getting-started.md).

To monitor all RabbitMQ clusters, run:
<pre class="lang-bash">
kubectl apply --filename https://raw.githubusercontent.com/rabbitmq/cluster-operator/main/observability/prometheus/monitors/rabbitmq-servicemonitor.yml
</pre>

To monitor RabbitMQ Cluster Operator, run:
<pre class="lang-bash">
kubectl apply --filename https://raw.githubusercontent.com/rabbitmq/cluster-operator/main/observability/prometheus/monitors/rabbitmq-cluster-operator-podmonitor.yml
</pre>

If <code>Prometheus</code> is deployed with a label selector for Pod or Service monitor, for example:

<pre class="lang-yaml">
  apiVersion: monitoring.coreos.com/v1
  kind: Prometheus
  metadata:
    name: prometheus
  spec:
    serviceAccountName: prometheus
    serviceMonitorSelector:
      matchLabels:
        team: frontend
    podMonitorSelector:
      matchLabels:
        team: frontend
</pre>

It is required to add the same labels to the <code>ServiceMonitor</code> deployed with the previous command.
To label the <code>ServiceMonitor</code> and <code>PodMonitor</code> deployed in previous steps, run:

<pre class="lang-bash">
  kubectl label ServiceMonitor rabbitmq team=frontend
  kubectl label PodMonitor rabbitmq-cluster-operator team=frontend
</pre>

`ServiceMonitor` and `PodMonitor` can be created in any namespace, as long as the Prometheus Operator has permissions to find it.
For more information about these permissions, refer to [Configure Permissions for the Prometheus Operator](#config-perm) later in this information.

The Prometheus Operator will detect `ServiceMonitor` and `PodMonitor` objects and automatically configure and reload Prometheus' [scrape config](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config).

To validate whether Prometheus successfully scrapes metrics, open the Prometheus web UI in your browser (ask your administrator for the URL) and navigate to the `Status -> Targets` page where you should see
an entry for the Cluster Operator (for example: `podMonitor/<podMonitorNamespace>/rabbitmq-cluster-operator/0 (1/1 up)`) and one entry for each deployed RabbitMQ cluster (for example: `serviceMonitor/<serviceMonitorNamespace>/rabbitmq/0 (1/1 up)`).

### Prometheus Alerts
The custom resource `PrometheusRule` allows to declaratively define [alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/).
To install RabbitMQ alerting rules, first ensure that [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) is installed.

To deploy Prometheus rules for RabbitMQ, `kubectl apply` all YAML files in the [rules/rabbitmq](https://github.com/rabbitmq/cluster-operator/tree/main/observability/prometheus/rules/rabbitmq) directory.

To deploy Prometheus rules for the Cluster Operator, `kubectl apply` the YAML files in the [rules/rabbitmq-cluster-operator](https://github.com/rabbitmq/cluster-operator/tree/main/observability/prometheus/rules/rabbitmq-cluster-operator) directory.

The `ruleSelector` from the `Prometheus` custom resource must match the labels of the deployed `PrometheusRules`.

For example, in the following code, if the Prometheus custom resource contains the`ruleSelector`, then a label `release: my-prometheus` needs to be added to the `PrometheusRules`.

<pre class='hljs lang-yaml'>
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
   ...
spec:
  ...
  ruleNamespaceSelector: {}
  ruleSelector:
    matchLabels:
      release: my-prometheus
  ...
  version: v2.26.0
</pre>

To get notified on firing alerts (for example: via Email or PagerDuty), configure a notification receiver in the [Alertmanager](https://prometheus.io/docs/alerting/latest/overview/).

To receive Slack notifications, deploy the Kubernetes `Secret` in the [alertmanager](https://github.com/rabbitmq/cluster-operator/tree/main/observability/prometheus/alertmanager) directory.

### <a id='config-perm' class='anchor' href='#config-perm'>(Optional) Configure Permissions for the Prometheus Operator</a>

If no RabbitMQ clusters appear in Prometheus, it might be necessary to [adjust permissions for the Prometheus Operator](https://github.com/coreos/prometheus-operator/blob/main/Documentation/rbac.md).

The following steps were tested with a `kube-prometheus` deployment.

To configure permissions for the Prometheus Operator, first create a file named `prometheus-roles.yaml` with the following contents:

<pre class="lang-yaml">
apiVersion: rbac.authorization.k8s.io/v1
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
apiVersion: rbac.authorization.k8s.io/v1
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

Then, apply the permissions listed in `prometheus-roles.yaml` by running

<pre class="lang-bash">
kubectl apply -f prometheus-roles.yaml
</pre>

## <a id='prom-annotations' class='anchor' href='#prom-annotations'>Monitor RabbitMQ Without the Prometheus Operator</a>

If Prometheus is not installed by the Prometheus Operator, if is installed by other means instead, then the CRDs `ServiceMonitor`, `PodMonitor`, and `PrometheusRule` are not available.

Then, Prometheus must be [configured via a config file](https://prometheus.io/docs/prometheus/latest/configuration/configuration/).
To monitor all RabbitMQ clusters and RabbitMQ Cluster Operator, use the scrape targets defined in the [Prometheus config file for RabbitMQ](https://github.com/rabbitmq/cluster-operator/blob/main/observability/prometheus/config-file.yml).

To set up RabbitMQ alerting rules, first configure Prometheus to receive metrics from the [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) agent.

Thereafter, configure Prometheus to use the [Prometheus rule file](https://github.com/rabbitmq/cluster-operator/blob/main/observability/prometheus/rule-file.yml).

To receive Slack notifications, use the same `alertmanager.yaml` as provided in [alertmanager/slack.yml](https://github.com/rabbitmq/cluster-operator/blob/main/observability/prometheus/alertmanager/slack.yml)
for the [Alertmanager configuration file](https://prometheus.io/docs/alerting/latest/configuration/#configuration-file).

## <a id='grafana' class='anchor' href='#grafana'>Import Dashboards to Grafana</a>

RabbitMQ provides Grafana dashboards to visualize the metrics scraped by Prometheus.

Follow the instructions in the [Grafana Configuration](../../prometheus.html#grafana-configuration) information to import dashboards to Grafana.

Alternatively, if Grafana is deployed by the [Grafana Helm chart](https://github.com/grafana/helm-charts/tree/main/charts/grafana), `kubectl apply` the `ConfigMaps` in the [grafana/dashboards](https://github.com/rabbitmq/cluster-operator/tree/main/observability/grafana/dashboards) directory to import the RabbitMQ Grafana dashboards [using a sidecar container](https://github.com/grafana/helm-charts/tree/main/charts/grafana#sidecar-for-dashboards).

The [RabbitMQ-Alerts dashboard](https://github.com/rabbitmq/cluster-operator/blob/main/observability/grafana/dashboards/rabbitmq-alerts.yml) provides a history of all past RabbitMQ alerts across all RabbitMQ clusters in Kubernetes.
