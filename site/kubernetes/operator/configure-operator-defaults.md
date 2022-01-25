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

# Configuring Defaults for RabbitMQ Cluster Operator

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers how to modify the default configuration of the [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/operator-overview.html) in a Kubernetes cluster.

Environment variables used by the operator can be overriden in order to influence how the operator configures created RabbitmqClusters.
This can be useful when configuring the operator to automatically use RabbitMQ container images stored in a private registry.

## <a id='parameters' class='anchor' href='#parameters'>Configurable Parameters</a>

The following configuration options are available to be set:

<table>
<tr>
<td>
Env. variable
</td>
<td>
Description
</td>
<td>
Effect when unset
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
</table>

-----

## <a id='configuration' class='anchor' href='#configuration'>Configuration</a>

In order to set these configuration parameters, you will need to edit the Deployment manifest of the operator.
This is the YAML manifest artefact released with every new version of the RabbitMQ Cluster Operator on GitHub.

If you already have the operator deployed, you can edit the manifest of the operator directly:
<pre class="lang-bash">
kubectl -n rabbitmq-system edit deployment rabbitmq-cluster-operator
</pre>

In the manifest, add the environment variables you wish to change. For example, to set the namespace scope of the operator:
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
Upon saving, the operator Pod will be updated to use this configuration.
Note that future GitHub release artefacts will not have these changes that you make, and so you must remember
to add these changes every time you update the cluster operator.

You may consider using templating to add these variables in automatically; for example you can use a ytt overlay
such as:

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
