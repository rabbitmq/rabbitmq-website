# Using TLS with the Messaging Topology Kubernetes Operator

If the RabbitmqClusters managed by the Messaging Topology Operator are configured to serve the HTTP API
and management UI over HTTPS, it will be necessary for the Topology Operator to [trust the Certificate Authority](../../ssl.html#peer-verification) (CA)
that signed the TLS certificates that the RabbitmqClusters use.

One or more trusted certificates must be mounted as volumes to the trust store
of the Topology Operator Pod located at `/etc/ssl/certs/`

### Prerequisites

This guide assumes you have the following:

1. The [RabbitMQ Cluster Operator](operator-overview.html) and [Messaging Topology Operator](install-topology-operator.html) are installed on the Kubernetes cluster
1. A signed TLS certificate and private key to be used by a RabbitmqCluster to serve traffic
1. A TLS certificate of a CA which signed the server certificate and key, whose path is exported as $CA_PATH

### Steps

1. Create a RabbitmqCluster serving traffic over TLS by following the documented example in the Cluster Operator examples.
2. Create a Kubernetes Secret containing the certificate of the CA that signed the RabbitMQ server's certificate.

For example:

<pre class="lang-bash">
kubectl -n rabbitmq-system create secret generic rabbitmq-ca --from-file=ca.crt=$CA_PATH
</pre>

3. Mount this secret into the Messaging Topology Operator Pod's trust store. Do this by either editing the Deployment manifest,
or by applying a patch through kubectl:

<pre class="lang-bash">
kubectl -n rabbitmq-system patch deployment messaging-topology-operator --patch "spec:
  template:
    spec:
      containers:
      - name: manager
        volumeMounts:
        - mountPath: /etc/ssl/certs/rabbitmq-ca.crt
          name: rabbitmq-ca
          subPath: ca.crt
      volumes:
      - name: rabbitmq-ca
        secret:
          defaultMode: 420
          secretName: rabbitmq-ca"
</pre>
    
The Topology Operator Pod will be recreated, and will now trust the certificates signed by the newly mounted CA.
Any  communication the Pod performs with the RabbitmqCluster will be done over HTTPS.

### Limitations

* Messaging Topology Operator will not be able to manage RabbitmqClusters that have not mounted their CA as described above:
  such nodes won't accept client connections over HTTPS
* Messaging Topology Operator will not attempt to connect to the RabbitmqCluster over HTTP if HTTPS is available (even if the
certificate is not trusted)
* RabbitmqClusters with TLS deactivated (that is nothing is configured under .spec.tls) will always be managed over HTTP
