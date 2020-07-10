# Monitoring RabbitMQ in Kubernetes

This topic describes how to monitor RabbitMQ instances deployed by Cluster Operator.

## <a id='overview' class='anchor' href='#overview'>Overview</a>

Cluster Operator deploys RabbitMQ clusters with the `rabbitmq_prometheus` plugin, which is enabled by
default. `rabbitmq_prometheus` exposes a Prometheus-compatible metrics endpoint.

For information to configure Prometheus to scrape Kubernetes targets, check
[Prometheus configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#kubernetes_sd_config)
documentation.

For a detailed guide on RabbitMQ Prometheus configuration, check the [Prometheus guide](/prometheus.html).

The following sections assume Prometheus is deployed and working.

## <a id='prom-annotations' class='anchor' href='#prom-annotations'>Monitor RabbitMQ Using Scraping Annotations</a>

Prometheus can configured to scrape all Pods with the `prometheus.io/scrape: true` annotation.

To add annotations to RabbitMQ Pods, modify the `RabbitmqCluster` custom resource `spec.service.annotations`
property. Example:

<pre class='hljs lang-yaml'>
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: my-instance
spec:
  service:
    annotations:
      "prometheus.io/scrape": "true"
      "prometheus.io/port": "15692"
</pre>

## <a id='prom-operator' class='anchor' href='#prom-operator'>Monitor RabbitMQ Using the Prometheus Operator</a>

The Prometheus Operator defines scraping configuration through a more flexible custom resource called `PodMonitor`.
For more information, see the [Prometheus Operator](https://github.com/coreos/prometheus-operator) in GitHub.

To use the Prometheus Operator to monitor RabbitMQ clusters:

1. Deploy the Prometheus Operator. There are several ways to do so. Guidance is provided in the
[kube-prometheus](https://github.com/coreos/kube-prometheus/#quickstart) documentation in GitHub.

1. Verify that you have deployed the Prometheus `PodMonitor` Custom Resource Definition (CRD) by running:

    <pre class='hljs lang-bash'>
    kubectl get customresourcedefinitions.apiextensions.k8s.io podmonitors.monitoring.coreos.com
    </pre>

    If this command returns an error, you do not have the Prometheus Operator deployed.

1. Create a YAML file named `rabbitmq-prometheus-patch.yaml` on your local machine.

1. Copy and paste the content below into `rabbitmq-prometheus-patch.yaml`, then save the file.

    <pre class='hljs lang-yaml'>
    spec:
      podMonitorNamespaceSelector:
        any: 'true'
    </pre>

1. Patch the Prometheus Operator by running:

    <pre class='hljs lang-bash'>
    kubectl -n monitoring patch prometheuses k8s --type merge --patch "$(cat rabbitmq-prometheus-patch.yaml)"
    </pre>

1. Create a YAML file named `rabbitmq-podmonitor.yaml` on your local machine.

1. Copy and paste the content below into `rabbitmq-podmonitor.yaml`, then save the file.

    <pre class='hljs lang-yaml'>
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

    You now have the `PodMonitor` resource, which is needed to configure the automatic discovery of RabbitMQ
    clusters.

1. Apply the `PodMonitor` resource by running: `kubectl apply -f rabbitmq-podmonitor.yaml`

`PodMonitor` can be created in any namespace, as long as the Prometheus Operator has permissions to find it.
For more information about these permissions, see
[Configure Permissions for the Prometheus Operator](#config-perm) below.


### <a id='config-perm' class='anchor' href='#config-perm'>(Optional) Configure Permissions for the Prometheus Operator</a>

If your RabbitMQ clusters do not appear in Prometheus, you might need to configure permissions for the
Prometheus Operator.

For more information about permissions, see
[RBAC](https://github.com/coreos/prometheus-operator/blob/master/Documentation/rbac.md) in GitHub.

The following steps have been tested with a `kube-prometheus` deployment.
To configure permissions for the Prometheus Operator:

1. Create a YAML file somewhere on your local machine named `prometheus-roles.yaml`.

1. Copy and paste the content below into `prometheus-roles.yaml` and save the file.

    <pre class='hljs lang-yaml'>
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
    \-\-\-\-
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

1. Apply the permissions listed in `prometheus-roles.yaml` by running: `kubectl apply -f prometheus-roles.yaml`

## <a id='grafana' class='anchor' href='#grafana'>Import Dashboards to Grafana</a>

RabbitMQ provides Grafana dashboards to visualize the metrics scraped by Prometheus.

Follow the instructions in the [Prometheus guide](/prometheus.html#grafana-configuration) to import dashboards to Grafana.

