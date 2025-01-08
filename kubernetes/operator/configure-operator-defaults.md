---
title: Modifying the RabbitMQ Cluster Operator Default Configuration
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Modifying the RabbitMQ Cluster Operator Default Configuration

This information describes how to modify the configuration of the [RabbitMQ Cluster Kubernetes Operator](./operator-overview) in a Kubernetes cluster.
You might want to do this to control how the Cluster Operator configures `RabbitmqClusters`. For example, it can be useful when you are configuring the
operator to automatically use the RabbitMQ container images that are stored in a private registry.

To change the configuration, add or update the configuration environment variables by editing the
Cluster Operator deployment manifest. This is the YAML manifest artefact that is released with every new version of the RabbitMQ Cluster Operator on GitHub.
The environment variables that can be set are listed in the table in [Cluster Operator Environment Variables](#parameters).

The Cluster Operator repository has some [code examples under `docs/examples`](https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples),
including one demonstrating [modification of default resource requests and limits](https://github.com/rabbitmq/cluster-operator/blob/main/docs/examples/resource-limits/rabbitmq.yaml).

## Adding Cluster Operator Environment Variables to the Deployment Manifest

When the Cluster Operator is deployed, update the manifest by completing the following steps:

1. Run:
    ```bash
    kubectl -n rabbitmq-system edit deployment rabbitmq-cluster-operator
    ```
2. Add the environment variables you want to change. In the following example, the `OPERATOR_SCOPE_NAMESPACE` environment variable is added and set
   to `"custom-namespace,my-namespace"` for the Cluster Operator.
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      labels:
        app.kubernetes.io/component: rabbitmq-operator
        app.kubernetes.io/name: rabbitmq-cluster-operator
        app.kubernetes.io/part-of: rabbitmq
      name: rabbitmq-cluster-operator
      namespace: rabbitmq-system
    spec:
      template:
        spec:
          containers:
          - command:
            - /manager
            env:
            - name: OPERATOR_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: OPERATOR_SCOPE_NAMESPACE
              value: "custom-namespace,my-namespace"
    # ...
    ```
3. Save the manifest. The Cluster Operator Pod is updated to use this configuration.

**Important**: Future GitHub releases for the RabbitMQ Cluster Operator will not have your changes.
Therefore, these updates must be synced every time
the Cluster Operator is updated. Consider using templating to add these variables automatically.
For example, using a `ytt overlay`.

## Example of Using `ytt overlay` to add Cluster Operator Environment Variables Automatically

<code>values.yaml</code>

```yaml
#@ load("@ytt:overlay", "overlay")
#@ deployment = overlay.subset({"kind": "Deployment"})
#@ cluster_operator = overlay.subset({"metadata": {"name": "rabbitmq-cluster-operator"}})
#@overlay/match by=overlay.and_op(deployment, cluster_operator),expects="1+"
---
spec:
  template:
    spec:
      containers:
      #@overlay/match by=overlay.subset({"name": "operator"}),expects="1+"
      -
        #@overlay/match missing_ok=True
        env:
        - name: OPERATOR_SCOPE_NAMESPACE
          value: custom-namespace
```
Use this overlay when upgrading the operator to ensure your custom configuration is applied for the new version:
```bash
ytt -f https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml -f values.yaml | kubectl apply -f -
```

## Cluster Operator Environment Variables {#parameters}

The following table listes the Cluster Operator environment variables that are available to set in the deployment manifest.

<table>
  <tr>
    <th>
    Variable Name
    </th>
    <th>
    Effect when Set
    </th>
    <th>
    Effect when not Set
    </th>
  </tr>
  <tr>
    <td>
    OPERATOR_SCOPE_NAMESPACE
    </td>
    <td>
    Namespace, or list of namespaces, which the operator will reconcile and watch RabbitmqClusters (independent of installation namespace).
    Use a comma separator, without spaces e.g. "project-1,project-2,rabbitmq-testing"
    </td>
    <td>
    All namespaces are watched and reconciled
    </td>
  </tr>
  <tr>
    <td>
    DEFAULT_RABBITMQ_IMAGE
    </td>
    <td>
    RabbitMQ container image used for new RabbitmqCluster Pods where not explicitly set in <code>RabbitmqCluster.Spec.Image</code>
    </td>
    <td>
    Operator uses the latest RabbitMQ container image available at time of release for new Pods
    </td>
  </tr>
  <tr>
    <td>
    DEFAULT_USER_UPDATER_IMAGE
    </td>
    <td>
    Vault sidecar container image used for new RabbitmqCluster Pods where not explicitly set in <code>RabbitmqCluster.Spec.SecretBackend.Vault.DefaultUserUpdaterImage</code>
    </td>
    <td>
    Operator uses the latest sidecar container image available at time of release for new Pods
    </td>
  </tr>
  <tr>
    <td>
    DEFAULT_IMAGE_PULL_SECRETS
    </td>
    <td>
    Comma-separated list of imagePullSecrets to set by default on all RabbitmqCluster Pods where not explicitly set in <code>RabbitmqCluster.Spec.ImagePullSecrets</code>
    </td>
    <td>
    New RabbitmqCluster Pods have no imagePullSecrets by default
    </td>
  </tr>
  <tr>
    <td>
    ENABLE_DEBUG_PPROF
    </td>
    <td>
    The default value is false because this variable should NOT be used in production. When it is set to true, it exposes a set of debug endpoints
    on the Operator Pod's metrics port for CPU and [memory profiling of the Operator with pprof](./debug-operator.md#operator-resource-usage-profiling).
    </td>
    <td>
    The pprof debug endpoint will not be exposed on the Operator Pod.
    </td>
  </tr>
  <tr>
    <td>
      CONTROL_RABBITMQ_IMAGE
    </td>
    <td>
      <b>EXPERIMENTAL!</b> When this is set to <code>true</code>, the operator will <b>always</b> automatically set the default image tags.
      This can be used to automate the upgrade of RabbitMQ clusters, when the Operator is upgraded. Note there are no safety checks
      performed, nor any compatibility checks between RabbitMQ versions.
    </td>
    <td>
      The Operator does not control the image. The user is responsible for updating RabbitmqCluster image.
    </td>
  </tr>
  <tr>
    <td>
      LEASE_DURATION
    </td>
    <td>
      Time, in seconds, that non-leader candidates will wait to force acquire leadership. This is measured against time of last observed ack.
      Default is 15 seconds. The value must be a string e.g. `"30"`.
    </td>
    <td>
      Default value is set to 15 seconds.
    </td>
  </tr>
  <tr>
    <td>
      RENEW_DEADLINE
    </td>
    <td>
      Renew deadline is the duration that the acting controlplane will retry refreshing leadership before giving up. Default is 10 seconds.
      The value must be a string e.g. `"10"`.
    </td>
    <td>
      Default value is set to 10 seconds.
    </td>
  </tr>
  <tr>
    <td>
      RETRY_PERIOD
    </td>
    <td>
      Retry period is the duration the LeaderElector clients should wait between tries of actions. Default is 2 seconds.
      The value must be a string e.g. `"3"`.
    </td>
    <td>
      Default value is set to 2 seconds.
    </td>
  </tr>
</table>
