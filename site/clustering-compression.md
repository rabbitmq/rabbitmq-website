# Inter-node and CLI Traffic Compression

[VMware Tanzu RabbitMQ](/tanzu/) supports compression for [inter-node](/clustering.html)
and [CLI tool](/cli.html) traffic.

RabbitMQ nodes communicate with their peers and CLI tools using dedicated TCP connections,
optionally [protected with TLS](/clustering-ssl.html).

In heavily loaded system, inter-node traffic flows can be substantial, approaching
or even saturating the bandwidth provided by network links. Compression of this traffic
helps reduce the load on bandwidth available, up to 96%, depending on the nature of
the workload.

<p class="box-info">
Inter-node traffic compression is <strong>available in VMware Tanzu RabbitMQ
only</strong>, not in the standard FOSS RabbitMQ.
<a href="/tanzu/">Learn more about VMware Tanzu RabbitMQ</a>
</p>

## <a id="how-to-use-it" class="anchor" href="#how-to-use-it">How to use it</a>

Inter-node traffic compression is enabled out-of-the-box in VMware Tanzu RabbitMQ:
if two RabbitMQ nodes [form a cluster](/cluster-formation.html), they will try to use compression.

For the data to be compressed, the following conditions MUST be met:

* Both RabbitMQ nodes must support inter-node traffic compression. In other
  words, both nodes must run VMware Tanzu RabbitMQ. The open source edition **does not support this feature**.

* Both nodes must share at least one compression algorithm in common.

If the conditions are not met, nodes will communicate as they otherwise would without
traffic compression. This means that RabbitMQ for VMware Tanzu remains compatible with the
open source RabbitMQ edition. It is therefore possible to switch from one edition
to the other without stopping the entire cluster.

## <a id="how-it-works" class="anchor" href="#how-it-works">How it works</a>

<div style="float: right;">
<img src="/img/erlang-distribution-compression/negotiation.svg"
style="width: 100%; max-width: 500px; margin: 10px;"/>
</div>

The first time a RabbitMQ node tries to contact another node, it will do the
following things:

1. After the TCP connection is open, compression will not be used at first.

2. The node initiating the connection **detects if the remote peer has Erlang
   distribution compression support**. If it does not, then the connection
   remains uncompressed and following steps are skipped.

3. Once the node is sure the remote node supports compression, it **negotiates
   the compression algorithm to use**. To start this process, it sends a message to the
   remote node and specifies the list of algorithms it supports.

4. The remote node compares the received list of algorithms to its own list.
   The remote node's list is ordered by preference. The selected algorithm is
   the first one in the remote node's list which is also supported by the
   initiating node. If there is no algorithm in common, the connection remains
   uncompressed and following steps are skipped.

5. Once an algorithm is selected, the remote node **sends a message back to the
   initiating node to inform it of its decision**.

6. The two nodes synchronize to **start compression** on the existing TCP
   connection.

## <a id="limitations" class="anchor" href="#limitations">Limitations</a>

*   Inter-node traffic **compression and TLS can't be used at the same time**:
    they are mutually exclusive at the moment.

    This is because RabbitMQ node is configured with a specific
    distribution module provided with VMware Tanzu RabbitMQ, plus a small
    add-on to deal with the algorithm negotiation. The distribution
    module is a replacement to the default module (`inet_tcp_dist`) or the
    TLS-enabled one (`inet_tls_dist`). It is impossible to use two modules
    simultaneously.

*   In VMware Tanzu RabbitMQ, the compression code relies on native libraries.
    **Only Linux/amd64 is supported** in the existing packaging. We might
    compile for more platforms in the future.
