---
title: Quorum Status Monitoring
---
# Quorum Status Monitoring

## Introduction

The `quorumStatus` field in the `RabbitmqCluster` status provides near real-time visibility into the quorum health of a RabbitMQ cluster.
This field helps operators understand whether it is safe to perform maintenance operations, such as scaling down nodes or performing
[rolling upgrades](/docs/upgrade) or rolling restarts for configuration changes.

### Why Quorum Status Matters

RabbitMQ [quorum queues](/docs/quorum-queues), [streams](/docs/streams), and the [Khepri metadata store](/docs/metadata-store) all use the Raft consensus algorithm to replicate data across multiple nodes.
When a node holds critical quorum queue replicas, shutting it down could result in loss of quorum, making queues unavailable until the node returns.
The `quorumStatus` field indicates which nodes, if any, are "quorum critical" and should not be shut down.

:::tip

This guide includes sections on [best practices](#best-practices) and [troubleshooting](#troubleshooting).

:::

## How It Works

The Cluster Operator automatically monitors the quorum status of a RabbitMQ cluster:

1. **During Each Reconciliation Loop**: the operator checks the quorum status of all RabbitMQ nodes periodically
2. **Connecting directly to each pod** using its stable DNS name: `<pod-name>.<cluster-name>-nodes.<namespace>.svc`
3. **RabbitMQ Management API**: uses the `/api/health/checks/node-is-quorum-critical` [HTTP API endpoint](/docs/http-api-reference#get-apihealthchecksnode-is-quorum-critical) on each node
4. **Concurrent Checks**: all nodes are checked in parallel for efficiency
5. **Status Update**: the `quorumStatus` field is updated with the aggregated result

### Connection Method

The operator connects to each pod using StatefulSet stable DNS names. This is particularly important for TLS deployments where certificates have Subject Alternative Names (SANs) for the pod DNS names:

```
<pod-name>.<headless-service>.<namespace>.svc
```

For example, for a cluster named `my-rabbit` in namespace `default`:
- Pod 0: `my-rabbit-server-0.my-rabbit-nodes.default.svc`
- Pod 1: `my-rabbit-server-1.my-rabbit-nodes.default.svc`
- Pod 2: `my-rabbit-server-2.my-rabbit-nodes.default.svc`

This approach ensures [TLS peer verification](/docs/ssl#peer-verification) works correctly without requiring users to include Pod
IP-based DNS entries (`*.pod`) in their certificates.

## Status Values

The `quorumStatus` field can contain the following values:

### "ok"

All nodes are healthy and no nodes are quorum critical. It is safe to perform maintenance operations.

```yaml
status:
  quorumStatus: "ok"
```

### "ok (N unavailable)"

No nodes are quorum critical, but some nodes could not be reached during the health check. This might occur if pods are restarting or experiencing network issues.

```yaml
status:
  quorumStatus: "ok (1 unavailable)"
```

**Interpretation**: while no quorum-critical nodes were detected, human operators should investigate why some nodes are unavailable before proceeding with maintenance.

### "quorum-critical: pod-name"

One or more pods are quorum critical and should not be shut down. The status includes the pod names that are critical.

```yaml
status:
  quorumStatus: "quorum-critical: my-cluster-server-0"
```

:::danger

Do not delete or restart pods that are listed as quorum critical,
as this could cause queue unavailability or data loss.

:::

### "quorum-critical: pod-name1, pod-name2 (N unavailable)"

Multiple pods are quorum critical, and some nodes could not be reached. This is to be expected during a rolling restart.
Investigate if the status persists after completing the rolling restart.

```yaml
status:
  quorumStatus: "quorum-critical: my-cluster-server-0, my-cluster-server-2 (1 unavailable)"
```

:::warning

This indicates a potentially fragile cluster state. Avoid any disruptive operations and investigate the unavailable nodes.

:::

### "unavailable"

All nodes are unreachable or the StatefulSet is not ready. This typically occurs during initial cluster creation or when the entire cluster is down.

```yaml
status:
  quorumStatus: "unavailable"
```

**Interpretation**: the cluster is not operational. Wait for pods to become ready before evaluating quorum status.

## How to Check Quorum Status

### View Current Status

```bash
# View quorum status for a specific cluster
kubectl get rabbitmqcluster my-cluster -o jsonpath='{.status.quorumStatus}'
```

### Watch Status in Real-Time

```bash
# Monitor quorum status changes
kubectl get rabbitmqcluster my-cluster -w -o jsonpath='{.metadata.name}{"\t"}{.status.quorumStatus}{"\n"}'
```

### View Full Cluster Status

```bash
# See all status fields including quorum status
kubectl describe rabbitmqcluster my-cluster
```

### Get Status in YAML Format

```bash
# View complete status object
kubectl get rabbitmqcluster my-cluster -o yaml | grep -A 1 quorumStatus
```

## Use Cases

The `quorumStatus` field is particularly useful in the following scenarios:

<!-- removed scaling down section becase we don't officially support scale down -->

### During Maintenance Windows

Monitor quorum status when performing rolling updates or node maintenance to understand cluster stability.

### Monitoring Cluster Health

Integrate quorum status checks into your monitoring and alerting systems to detect potential availability issues before they impact applications.

### Troubleshooting Data Availability Issues

If applications report queue unavailability, check quorum status to identify which nodes are critical and whether any nodes are unavailable.

## Limitations

### Critical Limitation: Direct RabbitMQ Modifications

:::important

The `quorumStatus` field may not accurately reflect the actual risk if queue membership or quorum queue configurations are modified directly through RabbitMQ
(CLI tools, HTTP API), bypassing theKubernetes Operator.

:::

For example:

 * Using `rabbitmq-queues grow` or `rabbitmq-queues shrink` to add or remove queue members (replicas)
 * Using the RabbitMQ Management UI to modify queue settings
 * Using external tools or scripts that interact directly with RabbitMQ APIs

If quorum queue membership is modified outside of Kubernetes, the operator's status may become stale or inaccurate until RabbitMQ's
internal state is synchronized. Always use Kubernetes-native approaches for cluster management when possible.

### Additional Limitations

**Not Real-Time**: the status is only updated during reconciliation loops (typically every few minutes). The actual quorum state may change between updates.

**Requires Management API Access**: all pods must have accessible management API endpoints. If the management API is unavailable due to network policies, firewall rules, or authentication issues, nodes will be reported as "unavailable."

**TLS Configuration Required**: if `DisableNonTLSListeners` is set to `true`, TLS must be configured with Pod DNS in SAN.
TLS connectivity ([peer verification](/docs/ssl#peer-verification)) issues will cause nodes to be reported as "unavailable."

For example, for a `RabbitmqCluster` named `my-rabbit`:

```
DNS:my-rabbit-server-0.my-rabbit-nodes.default.svc
DNS:my-rabbit-server-1.my-rabbit-nodes.default.svc
DNS:my-rabbit-server-2.my-rabbit-nodes.default.svc
```

**Does Not Prevent Pod Deletion**: the `quorumStatus` field is informational only. The controller does not block pod deletions based on this status. Protection against unsafe shutdowns is provided by the StatefulSet's preStop hooks.

## Integration with StatefulSet PreStop Hooks

It's important to understand the relationship between the `quorumStatus` field and the cluster's deletion protection:

 * **Status Reporting**: the controller reports quorum status but does not prevent pod operations
 * **PreStop Hook Protection**: the StatefulSet includes a preStop hook that prevents pod shutdown when the node is quorum critical
 * **Operator Decision Making**: the `quorumStatus` field helps human operators and automation tools make informed decisions before initiating maintenance operations

The preStop hook calls the same RabbitMQ health check endpoint and will block pod termination if the node is quorum critical, providing a safety net even if the operator proceeds with a deletion.

## Best Practices

1. **Check Before Scaling**: always check `quorumStatus` before scaling down your cluster
2. **Monitor Continuously**: integrate quorum status into your monitoring dashboards
3. **Size Appropriately**: maintain at least 3 nodes (an [odd number](/docs/clustering#node-count)) for quorum queues
4. **Avoid Manual Changes**: use Kubernetes-native approaches rather than direct RabbitMQ modifications
5. **Test in Staging**: validate your scaling and maintenance procedures in a non-production environment first

## Troubleshooting

### Status Shows "unavailable"

**Possible Causes**:
 * Pods are not ready (still starting up)
 * Network connectivity issues between the controller and pods
 * Management API is not accessible
 * TLS configuration issues (if TLS is enabled)
 * Authentication credentials are incorrect

**Resolution Steps**:
1. Check pod readiness: `kubectl get pods -l app.kubernetes.io/name=<cluster-name>`
2. Verify network policies allow controller-to-pod communication
3. Check management API accessibility: `kubectl port-forward <pod-name> 15672:15672`
4. Review controller logs for specific errors: `kubectl logs -n <operator-namespace> <controller-pod>`

### Status Not Updating

**Possible Causes**:
 * Reconciliation loop is not running
 * Controller is not healthy
 * Cluster resource is not being watched

**Resolution Steps**:
1. Check controller logs for errors
2. Verify the controller is running: `kubectl get pods -n <operator-namespace>`
3. Check the `observedGeneration` field matches the cluster's `generation`
4. Manually trigger reconciliation by adding an annotation: `kubectl annotate rabbitmqcluster my-cluster reconcile=$(date +%s)`

### Unexpected "quorum-critical" Status

**Possible Causes**:
 * Uneven distribution of quorum queue replicas
 * Cluster size is too small for the configured queue replication factor
 * Recent node failures have not been rebalanced

**Resolution Steps**:
1. Check quorum queue distribution in the RabbitMQ Management UI
2. Verify cluster size meets requirements (minimum 3 nodes recommended for quorum queues)
3. Review queue policies and replication settings
4. Consider rebalancing queue leaders: Use RabbitMQ's rebalancing commands if necessary

### All Nodes Showing as Quorum Critical

**Possible Causes**:
- Every node hosts critical quorum queue replicas
- Insufficient cluster capacity for the number of quorum queues

**Resolution Steps**:
1. Scale up the cluster to add more nodes
2. Review and adjust quorum queue replication factors
3. Distribute queues more evenly across nodes
4. Consider whether all queues need to be quorum queues


## References

 * [RabbitMQ Quorum Queues Documentation](https://www.rabbitmq.com/quorum-queues.html)
 * [RabbitMQ Health Checks Documentation](https://www.rabbitmq.com/monitoring.html#health-checks)
 * [Kubernetes StatefulSet Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
