<!--
Copyright (c) 2020-2021 VMware, Inc. or its affiliates.

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

This information describes how to modify the configuration of the [RabbitMQ Cluster Kubernetes Operator](./operator-overview.html) in a Kubernetes cluster. You might want to do this to control how the Cluster Operator configures `RabbitmqClusters`. For example, it can be useful when you are configuring the operator to automatically use the RabbitMQ container images that are stored in a private registry.

To change the configuration to suit your needs, you must add the configuration environment variables and set them to the values you want by editing the deployment manifest of the Cluster Operator. This is the YAML manifest artefact that is released with every new version of the RabbitMQ Cluster Operator on GitHub. The environment variables are listed in the table in [Cluster Operator Environment Variables](##variables). 

## Adding Cluster Operator Environment Variables to the Deployment Manifest 

When the Cluster Operator is deployed, update the manifest by completing the following steps: 

1. Run: 
<pre class="lang-bash">
kubectl -n rabbitmq-system edit deployment rabbitmq-cluster-operator
</pre>

2.  Add the environment variables you want to change. In the following example, the `OPERATOR_SCOPE_NAMESPACE` environment variable is added and set to `custom-namespace` for the Cluster Operator.
<pre class="lang-yaml">
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
        - <b>name: OPERATOR_SCOPE_NAMESPACE</b>
          <b>value: custom-namespace</b>
...
</pre>

3. Save the manifest. The Cluster Pod is now updated to use this configuration.

**Important**: It is important to be know that future GitHub releases for the RabbitMQ Cluster Operator will not have the changes that you are making now so you must make these updates everytime you update the Cluster Operator. You can consider using templating to add these variables automatically. For example, you can use a `ytt overlay`
 
## Example of Using '`ytt overlay` to add Cluster Operator Environment Variables Automatically 

<code>values.yaml</code>

<pre class="lang-yaml">
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
</pre>
Use this overlay when upgrading the operator to ensure your custom configuration is applied for the new version:
<pre class="lang-bash">
ytt -f https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml -f values.yaml | kubectl apply -f -
</pre>


The following table listes the Cluster Operator environment variables that are available to set in the deployment manifest.

## <a id='parameters' class='anchor' href='#variables'>Cluster Operator Environment Variables</a>

The following configuration options are available to be set:

<table>
<tr>
<td>
Variable Name
</td>
<td>
Effect when Set
</td>
<td>
Effect when not Set
</td>
</tr>
<tr>
<td>
OPERATOR_SCOPE_NAMESPACE
</td>
<td>
Namespace which the operator will reconcile and watch RabbitmqClusters (independent of installation namespace)
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
The default value is false because this variable should NOT be used in production. When it is set to true, it exposes a set of debug endpoints on the Operator Pod's metrics port for CPU and [memory profiling of the Operator with pprof](./debug-operator.md#operator-resource-usage-profiling).
</td>
<td>
The pprof debug endpoint will not be exposed on the Operator Pod.
</td>
</tr>
</table>

-----

