# Upgrade Cluster Operator

This topic describes how to upgrade the Cluster Operator and its components.

## <a id="overview"> </a> Overview

Upgrades are not currently supported. The recommended method is a delete and re-install.

Replacing the image reference in the Deployment manifest to a new version may work to deploy
a newer version of the Cluster Operator, however that is not tested and has no guarantees.


## <a id='uninstall-manifests'></a> Uninstall Cluster Operator

To uninstall Cluster Operator:

1. Delete `RabbitmqCluster` resources in all namespaces by running:

    ```
    kubectl delete rabbitmqclusters --all --all-namespaces
    ```

1. Verify that all `RabbitmqCluster` resources are deleted by running:

    <pre class="terminal">
    kubectl wait --for delete pod \
    -l "app.kubernetes.io/component=rabbitmq" --all-namespaces --timeout=300s
    </pre>

1. Move to the Cluster Operator repository directory:

1. Delete using the manifests:

    <pre class="lang-bash">
    kubectl delete --kustomize config/manager/
    kubectl delete --kustomize config/rbac/
    kubectl delete -f config/namespace/base/namespace.yaml
    </pre>


## <a id='install'></a> Install the Latest Version

Follow the instructions in [Install Cluster Operator](/install-cluster-operator.html)

