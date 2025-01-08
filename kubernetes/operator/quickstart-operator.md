---
title: RabbitMQ Cluster Kubernetes Operator Quickstart
---
# RabbitMQ Cluster Kubernetes Operator Quickstart

This is the fastest way to get up and running with a RabbitMQ cluster deployed by the Cluster Operator.
The steps in this quickstart are also demonstrated in the KubeCon + CloudNativeCon North America 2021 talk [RabbitMQ on Kubernetes Deep Dive](https://youtu.be/GxdyQSUEj5U?feature=shared).
More detailed resources are available for [installation](./install-operator), [usage](./using-operator) and [API reference](./using-operator).

## Prerequisites

- Access to a Kubernetes cluster version 1.19 or above
- `kubectl` configured to access the cluster

## Quickstart Steps

This guide goes through the following steps:

1. Install the RabbitMQ Cluster Operator
2. Deploy a RabbitMQ Cluster using the Operator
3. View RabbitMQ Logs
4. Access the RabbitMQ Management UI
5. Attach a Workload to the Cluster
6. Next Steps

## The `kubectl rabbitmq` Plugin

Many steps in the quickstart - installing the operator, accessing the Management UI, fetching credentials for the RabbitMQ Cluster, are made easier by the `kubectl rabbitmq` plugin. While there are instructions to follow along without using the plugin, getting the plugin will make these commands simpler. To install the plugin, look at its [installation instructions](./install-operator).

For extensive documentation on the plugin see the [`kubectl` Plugin guide](./kubectl-plugin).

## Install the RabbitMQ Cluster Operator

Let's start by installing the latest version of the Cluster Operator. This can be done directly using `kubectl apply`:

```bash
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
# namespace/rabbitmq-system created
# customresourcedefinition.apiextensions.k8s.io/rabbitmqclusters.rabbitmq.com created
# serviceaccount/rabbitmq-cluster-operator created
# role.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-role created
# clusterrole.rbac.authorization.k8s.io/rabbitmq-cluster-operator-role created
# rolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-leader-election-rolebinding created
# clusterrolebinding.rbac.authorization.k8s.io/rabbitmq-cluster-operator-rolebinding created
# deployment.apps/rabbitmq-cluster-operator created
```

The Cluster Operator can also be installed using the `kubectl rabbitmq` plugin:

```bash
kubectl rabbitmq install-cluster-operator
```

Installing the Cluster Operator creates a bunch of Kubernetes resources. Breaking these down, we have:

- a new namespace `rabbitmq-system`. The Cluster Operator deployment is created in this namespace.

```bash
kubectl get all -n rabbitmq-system

NAME                                             READY   STATUS    RESTARTS   AGE
pod/rabbitmq-cluster-operator-54f948d8b6-k79kd   1/1     Running   0          2m10s

NAME                                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/rabbitmq-cluster-operator   1/1     1            1           2m10s

NAME                                                   DESIRED   CURRENT   READY   AGE
replicaset.apps/rabbitmq-cluster-operator-54f948d8b6   1         1         1       2m10s
```

- a new custom resource `rabbitmqclusters.rabbitmq.com`. The custom resource allows us to define an API for the creation of RabbitMQ Clusters.

```bash
kubectl get customresourcedefinitions.apiextensions.k8s.io

NAME                                             CREATED AT
...
rabbitmqclusters.rabbitmq.com                    2021-01-14T11:12:26Z
...
```

- and some rbac roles. These are required by the Operator to create, update and delete RabbitMQ Clusters.

## Hello RabbitMQ!

Now that we have the Operator deployed, let's create the simplest RabbitMQ Cluster.

This example can be found in the [Cluster Operator GitHub repo](https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples/hello-world). As mentioned on the page:
> This is the simplest `RabbitmqCluster` definition. The only explicitly specified property is the name of the cluster. Everything else will be configured according to the Cluster Operator's defaults.

The [examples folder](https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples/) has many other references such as creating a RabbitMQ Cluster with TLS, mTLS, setting up a Cluster with production defaults, adding community plugins, etc.

Continuing with our example, we will submit the following yaml to Kubernetes:

```yaml
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
	name: hello-world
```
Submit this using the following command:
```bash
kubectl apply -f https://raw.githubusercontent.com/rabbitmq/cluster-operator/main/docs/examples/hello-world/rabbitmq.yaml
```

This will create a RabbitMQ cluster called `hello-world` in the current namespace. You can see the RabbitMQ Cluster as it is being created:

```bash
watch kubectl get all

NAME                       READY   STATUS    RESTARTS   AGE
pod/hello-world-server-0   1/1     Running   0          2m

NAME                        TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)              AGE
service/hello-world         ClusterIP   10.75.242.149   &lt;none&gt;  5672/TCP,15672/TCP   2m
service/hello-world-nodes   ClusterIP   None            &lt;none&gt;  4369/TCP,25672/TCP   2m
service/kubernetes          ClusterIP   10.75.240.1     &lt;none&gt;  443/TCP              4h1m

NAME                                  READY   AGE
statefulset.apps/hello-world-server   1/1     2m
```

If the pod is not running (its state is `Pending`) and you are deploying to a resource-constrained cluster (eg. local environments like `kind` or `minikube`),
you may need to adjust CPU and/or memory limits of the cluster. By default, the Operator configures `RabbitmqCluster` pods to request 1CPU and 2GB of memory.
Check the [resource-limits example](https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples/resource-limits) to see how to adjust these values.

You will also be able to see an instance of the `rabbitmqclusters.rabbitmq.com` custom resource created.

```bash
kubectl get rabbitmqclusters.rabbitmq.com

NAME          AGE    STATUS
hello-world   4m1s
```

You may also use the kubectl rabbitmq plugin to list the RabbitMQ Clusters deployed:

```bash
kubectl rabbitmq list
NAME          AGE    STATUS
hello-world   4m10s
```

If your Pod is stuck in the `Pending` state, most probably your cluster does not have a Physical Volume Provisioner. This can be verified as the following:
```bash
kubectl get pvc,pod
NAME                               STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
persistence-hello-world-server-0   Pending                                                     30s
```

In this case, and if this is not a production environment, you might want to install the [Local Path Provisioner](https://github.com/rancher/local-path-provisioner)

```bash
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
kubectl annotate storageclass local-path storageclass.kubernetes.io/is-default-class=true
```

After that, you need to remove and re-create the previously created RabbitMQ Cluster object:

```bash
kubectl delete rabbitmqclusters.rabbitmq.com hello-world
```

## View RabbitMQ Logs

In order to make sure RabbitMQ has started correctly, let's view the RabbitMQ log file. This can be done by viewing the RabbitMQ pod logs. In this case, it would be:

```bash
kubectl logs hello-world-server-0
...

  ##  ##      RabbitMQ 3.12.1
  ##  ##
  ##########  Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.
  ######  ##
  ##########  Licensed under the MPL 2.0. Website: https://www.rabbitmq.com

  Erlang:      26.0.1 [jit]
  TLS Library: OpenSSL - OpenSSL 1.1.1u  30 May 2023
  Release series support status: supported

  Doc guides: https://www.rabbitmq.com/documentation.html
  Support:    https://www.rabbitmq.com/contact.html
  Tutorials:  https://www.rabbitmq.com/tutorials.html
  Monitoring: https://www.rabbitmq.com/monitoring.html

...
```

If you care only about viewing the logs, the detail of the component is hidden away in the kubectl rabbitmq plugin. Here, you may just run:

```bash
kubectl rabbitmq tail hello-world
```

## Access The Management UI

Next, let's access the Management UI.

```bash
username="$(kubectl get secret hello-world-default-user -o jsonpath='{.data.username}' | base64 --decode)"
echo "username: $username"
password="$(kubectl get secret hello-world-default-user -o jsonpath='{.data.password}' | base64 --decode)"
echo "password: $password"

kubectl port-forward "service/hello-world" 15672
```
Now we can open localhost:15672 in the browser and see the Management UI. The credentials are as printed in the commands above. Alternatively, you can run a `curl` command to verify access:

```bash
curl -u$username:$password localhost:15672/api/overview
{"management_version":"3.8.9","rates_mode":"basic", ...}
```

Using the `kubectl rabbitmq` plugin, the Management UI can be accessed using:

```bash
kubectl rabbitmq manage hello-world
```

## Connect An Application To The Cluster

The next step would be to connect an application to the RabbitMQ Cluster in order to use its messaging capabilities. The [perf-test](https://github.com/rabbitmq/rabbitmq-perf-test) application is frequently used within the RabbitMQ community for load testing RabbitMQ Clusters.

Here, we will be using the `hello-world` service to find the connection address, and the `hello-world-default-user` to find connection credentials.

```bash
username="$(kubectl get secret hello-world-default-user -o jsonpath='{.data.username}' | base64 --decode)"
password="$(kubectl get secret hello-world-default-user -o jsonpath='{.data.password}' | base64 --decode)"
service="$(kubectl get service hello-world -o jsonpath='{.spec.clusterIP}')"
kubectl run perf-test --image=pivotalrabbitmq/perf-test -- --uri amqp://$username:$password@$service

# pod/perf-test created
```

These steps are automated in the kubectl rabbitmq plugin which may simply be run as:

```bash
kubectl rabbitmq perf-test hello-world
```

We can now view the perf-test logs by running:

```bash
kubectl logs --follow perf-test
...
id: test-141948-895, time: 16.001s, sent: 25651 msg/s, received: 25733 msg/s, min/median/75th/95th/99th consumer latency: 1346110/1457130/1495463/1529703/1542172 µs
id: test-141948-895, time: 17.001s, sent: 26933 msg/s, received: 26310 msg/s, min/median/75th/95th/99th consumer latency: 1333807/1411182/1442417/1467869/1483273 µs
id: test-141948-895, time: 18.001s, sent: 26292 msg/s, received: 25505 msg/s, min/median/75th/95th/99th consumer latency: 1329488/1428657/1455482/1502191/1518218 µs
id: test-141948-895, time: 19.001s, sent: 23727 msg/s, received: 26055 msg/s, min/median/75th/95th/99th consumer latency: 1355788/1450757/1480030/1514469/1531624 µs
id: test-141948-895, time: 20.001s, sent: 25009 msg/s, received: 25202 msg/s, min/median/75th/95th/99th consumer latency: 1327462/1447157/1474394/1509857/1521303 µs
id: test-141948-895, time: 21.001s, sent: 28487 msg/s, received: 25942 msg/s, min/median/75th/95th/99th consumer latency: 1350527/1454599/1490094/1519461/1531042 µs
...
```

As can be seen, perf-test is able to produce and consume about 25,000 messages per second.

## Next Steps

Now that you are up and running with the basics, you can explore what the Cluster Operator can do for you!

You can do so by:

1. Looking at [more examples](https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples/) such as [monitoring the deployed RabbitMQ Cluster using Prometheus](/docs/prometheus), [enabling TLS](https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples/tls), etc.
2. Looking at the [API reference documentation](./using-operator).
3. Checking out our [GitHub repository](https://github.com/rabbitmq/cluster-operator/) and contributing to this guide, other docs, and the codebase!
