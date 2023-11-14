---
title: "Using OPA/Gatekeeper with RabbitMQ Messaging Topology Resources"
tags: ["Kubernetes", ]
authors: [mgary]
---

Many organizations have policies around RabbitMQ usage wich they would like to enforce. This blog post explains via example how the [Open Policy Agent Gatekeeper project](https://open-policy-agent.github.io/gatekeeper/website/docs/) can be used in combination with the [RabbitMQ Messaging Topology Operator](https://github.com/rabbitmq/messaging-topology-operator) to manage RabbitMQ resources on Kubernetes and enforce policies on those resources by extending the Kubernetes API.

<!-- truncate -->

## The RabbitMQ Messaging Topology Operator

The Messaging Topology Operator allows messaging topology state within a RabbitMQ cluster to be declaratively managed by extending the Kubernetes API with [Custom Resource Definitions (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/). Such messaging topology state includes vhosts, queues, exchanges, bindings, policies, federations, shovels, users, and permissions. Each of these types of objects is represented by a Kubernetes CRD, and examples of each of these Custom Resources (CRs) can be found in the [documentation](https://github.com/rabbitmq/messaging-topology-operator/tree/main/docs/examples).

For concreteness, let us consider a queue:
```yaml
---
apiVersion: rabbitmq.com/v1beta1
kind: Queue
metadata:
  name: my-queue
spec:
  name: my-queue
  vhost: my-vhost
  type: quorum
  rabbitmqClusterReference:
    name: my-rabbit-cluster
```
This quourum queue is named `my-queue`, on the vhost `my-vhost` and the RabbitMQ cluster `my-rabbit-cluster`.

If developers are assigned roles that allow them to create Queue resources, then they are free to create any queues with any configurations they want.

Suppose we have policies regarding queues that we would like to enforce, for example, the following list of policies:

1. The RabbitMQ Cluster must be named `my-rabbit-cluster`.
1. Queues must be declared on the vhost `my-vhost`.

One option would be to limit developers' Kubernetes roles to prevent them from creating queues and instead institute a manual ticketing system, where a Kubernetes admin creates Queue objects for them. However, this method of policy enforcement is manual, time consuming, and prevents developers from meeting their own needs.

## Enforcing Policy with Gatekeeper

Gatekeeper extends the Kubernetes API in a different way, allowing us to create webhooks to ensure Kubernetes API objects conform with policy defined via the [OPA Rego language](https://www.openpolicyagent.org/docs/latest/policy-language/). Once we have [deployed Gatekeeper](https://open-policy-agent.github.io/gatekeeper/website/docs/install) in our Kuberentes cluster, we can enforce any policies we choose. In particular, we can create a constraint which allows us to enforce the above policies.

Deploying a constraint consists of three components:
1. Gatekeeper config, informing gatekeeper what types of resources we would like to monitor.
1. A constraint template, which lets gatekeeper know what type of constraint we would like to enforce and includes the rego policy configuration.
1. A specific instance of the constraint.

Turning to our example, the Gatekeeper config necessary to enforce policy on RabbitMQ Queues is
```yaml
---
apiVersion: config.gatekeeper.sh/v1alpha1
kind: Config
metadata:
  name: config
  namespace: gatekeeper-system
spec:
  sync:
    syncOnly:
    - group: rabbitmq.com
      version: v1beta1
      kind: Queue
```

To enforce the policies listed above, we create the following `ConstraintTemplate`
```yaml
---
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: queuevalidator
spec:
  crd:
    spec:
      names:
        kind: QueueValidator
      validation:
        openAPIV3Schema:
          properties:
            rabbit:
              type: string
            vhost:
              type: string
  targets:
  - target: admission.k8s.gatekeeper.sh
    rego: |
      package queuevalidator
      violation[{"msg":msg}] {
        allowedRabbit := input.parameters.rabbit
        givenRabbit := input.review.object.spec.rabbitmqClusterReference.name
        givenRabbit != allowedRabbit
        allowedVhost := input.parameters.vhost
        givenVhost := input.review.object.spec.vhost
        givenVhost != allowedVhost
        msg := sprintf("Rabbit Cluster must be %v, queues must be declared on vhost %v", [allowedRabbit, allowedVhost])
      }
```
From this `ConstraintTemplate`, Gatekeeper will create a custom resource kind `QueueValidator` which takes two properties, a `rabbit` and a `vhost`, both strings. This allows us to configure the allowed RabbitMQ cluster name and vhost as parameters when deploying an instance of the constraint. The rego code ensures that the `rabbitmqClusterReference` and `vhost` match the specified allowed values. More generally, the `rego` block must include a violation function which evaluates to true when a policy violation occurs, along with a message explaining the policy violation.

We must first deploy the `ConstraintTemplate` and allow Gatekeeper to create the CRD for the kind `QueueValidator` before we can deploy a `QueueValidator` instance.
```yaml
---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: QueueValidator
metadata:
  name: queue-validator
spec:
  match:
    kinds:
    - apiGroups: ["rabbitmq.com"]
      kinds: ["Queue"]
  parameters:
  - rabbit: my-rabbit-cluster
  - vhost: my-vhost
```

With all of this configuration in place, if we attempt to create a Queue that does not conform to policy, it will be rejected by the webhook with an error.

## Conclusion

Gatekeeper is an operator that extends the Kubernetes API to enforce policy. Together with the RabbitMQ Messaging Topology Operator, it is possible to declaratively manage RabbitMQ objects and ensure compliance via the Kubernetes API. We have shown a simple example, but the OPA language used to configure policies is highly extensible, allowing Gatekeeper to perform advanced policy management.
