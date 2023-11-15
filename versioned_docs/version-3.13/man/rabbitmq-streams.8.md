RABBITMQ-STREAMS(8) - FreeBSD System Manager's Manual

# NAME

**rabbitmq-streams** - RabbitMQ stream management tools

# SYNOPSIS

**rabbitmq-streams**
\[**-q**]
\[**-s**]
\[**-l**]
\[**-n**&nbsp;*node*]
\[**-t**&nbsp;*timeout*]
*command*
\[*command\_options*]

# DESCRIPTION

**rabbitmq-streams**
is a command line tool that provides commands used to manage streams,
for example, add or delete stream replicas.
See the
[RabbitMQ streams overview](https://www.rabbitmq.com/streams.html).

# OPTIONS

**-n** *node*

> Default node is
> "rabbit@*target-hostname*",
> where
> *target-hostname*
> is the local host.
> On a host named
> "myserver.example.com",
> the node name will usually be
> "rabbit@myserver"
> (unless
> `RABBITMQ_NODENAME`
> has been overridden).
> The output of
> "hostname -s"
> is usually the correct suffix to use after the
> "@"
> sign.
> See
> rabbitmq-server(8)
> for details of configuring a RabbitMQ node.

**-q**, **--quiet**

> Quiet output mode is selected.
> Informational messages are reduced when quiet mode is in effect.

**-s**, **--silent**

> Silent output mode is selected.
> Informational messages are reduced and table headers are suppressed when silent mode is in effect.

**-t** *timeout*, **--timeout** *timeout*

> Operation timeout in seconds.
> Not all commands support timeouts.
> Default is
> **infinity**.

**-l**, **--longnames**

> Must be specified when the cluster is configured to use long (FQDN) node names.
> To learn more, see the
> [RabbitMQ Clustering guide](https://www.rabbitmq.com/clustering.html)

**--erlang-cookie** *cookie*

> Shared secret to use to authenticate to the target node.
> Prefer using a local file or the
> `RABBITMQ_ERLANG_COOKIE`
> environment variable instead of specifying this option on the command line.
> To learn more, see the
> [RabbitMQ CLI Tools guide](https://www.rabbitmq.com/cli.html)

# COMMANDS

**help**

> Displays general help and commands supported by
> **rabbitmq-streams**.

## Replication

**add\_replica** *queue* *node* **--vhost** *virtual-host*

> Adds a stream replica on the given node.

> Example:

> > rabbitmq-streams add\_replica --vhost "a-vhost" "a-queue" "rabbit@new-node"

**delete\_replica** *queue* *node* **--vhost** *virtual-host*

> Removes a stream replica on the given node.

> Example:

> > rabbitmq-streams delete\_replica --vhost "a-vhost" "a-queue" "rabbit@decomissioned-node"

## Monitoring, observability and health checks

**stream\_status** *stream* **--vhost** *virtual-host*

> Displays the status of a stream.

> Example:

> > rabbitmq-streams stream\_status --vhost "a-vhost" "a-stream"

## Policies

**set\_stream\_retention\_policy** *stream* *policy* **--vhost** *virtual-host*

> Set the retention policy of a stream.

> Example:

> > rabbitmq-streams set\_stream\_retention\_policy --vhost "a-vhost" "a-stream" "a-policy"

## Stream plugin

**list\_stream\_connections** \[*connectioninfoitem ...*]

> Returns stream protocol connection statistics.

> The
> *connectioninfoitem*
> parameter is used to indicate which connection information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *connectioninfoitem*
> can take any value from the list that follows:

> **auth\_mechanism**

> > SASL authentication mechanism used, such as
> > "PLAIN".

> **client\_properties**

> > Informational properties transmitted by the client during connection
> > establishment.

> **conn\_name**

> > Readable name for the connection.

> **connected\_at**

> > Date and time this connection was established, as timestamp.

> **connection\_state**

> > Connection state; one of:

> > *	running
> > *	blocked

> **frame\_max**

> > Maximum frame size (bytes).

> **heartbeat**

> > Negotiated heartbeat interval, in seconds.

> **host**

> > Server hostname obtained via reverse DNS, or its IP address if reverse
> > DNS failed or was disabled.

> **peer\_cert\_issuer**

> > The issuer of the peer's SSL certificate, in RFC4514 form.

> **peer\_cert\_subject**

> > The subject of the peer's SSL certificate, in RFC4514 form.

> **peer\_cert\_validity**

> > The period for which the peer's SSL certificate is valid.

> **peer\_host**

> > Peer hostname obtained via reverse DNS, or its IP address if reverse DNS
> > failed or was not enabled.

> **peer\_port**

> > Peer port.

> **port**

> > Server port.

> **ssl**

> > Boolean indicating whether the connection is secured with SSL.

> **ssl\_cipher**

> > SSL cipher algorithm (e.g.
> > "aes\_256\_cbc").

> **ssl\_hash**

> > SSL hash function (e.g.
> > "sha").

> **ssl\_key\_exchange**

> > SSL key exchange algorithm (e.g.
> > "rsa").

> **ssl\_protocol**

> > SSL protocol (e.g.
> > "tlsv1").

> **subscriptions**

> > Number of subscriptions (consumers) on the connection.

> **user**

> > Username associated with the connection.

> **vhost**

> > Virtual host name with non-ASCII characters escaped as in C.

> If no
> *connectioninfoitem*
> are specified then only conn\_name is displayed.

> For example, this command displays the connection name and user
> for each connection:

> > rabbitmq-streams list\_stream\_connections conn\_name user

**list\_stream\_consumers** \[**-p** *vhost*] \[*consumerinfoitem ...*]

> Returns consumers attached to a stream.

> The
> *consumerinfoitem*
> parameter is used to indicate which consumer information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *consumerinfoitem*
> can take any value from the list that follows:

> *active*

> > Boolean indicating whether the consumer is active or not.

> *activity\_status*

> > Consumer activity status; one of:

> > *	up
> > *	single\_active
> > *	waiting

> *connection\_pid*

> > Id of the Erlang process associated with the consumer connection.

> *credits*

> > Available credits for the consumer.

> *messages\_consumed*

> > Number of messages the consumer consumed.

> *offset*

> > The offset (location in the stream) the consumer is at.

> *offset\_lag*

> > The difference between the last stored offset and the last
> > dispatched offset for the consumer.

> *properties*

> > The properties of the consumer subscription.

> *stream*

> > The stream the consumer is attached to.

> *subscription\_id*

> > The connection-scoped ID of the consumer.

> If no
> *consumerinfoitem*
> are specified then connection\_pid, subscription\_id, stream,
> messages\_consumed, offset, offset\_lag, credits, active, activity\_status, and properties are displayed.

> For example, this command displays the connection PID, subscription ID and stream
> for each consumer:

> > rabbitmq-streams list\_stream\_consumers connection\_pid subscription\_id stream

**list\_stream\_publishers** \[**-p** *vhost*] \[*publisherinfoitem ...*]

> Returns registered publishers.

> The
> *publisherinfoitem*
> parameter is used to indicate which publisher information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *publisherinfoitem*
> can take any value from the list that follows:

> *connection\_pid*

> > Id of the Erlang process associated with the consumer connection.

> *messages\_confirmed*

> > The number of confirmed messages for the publisher.

> *messages\_errored*

> > The number of errored messages for the publisher.

> *messages\_published*

> > The overall number of messages the publisher published.

> *publisher\_id*

> > The connection-scoped ID of the publisher.

> *reference*

> > The deduplication reference of the publisher.

> *stream*

> > The stream the publisher publishes to.

> If no
> *publisherinfoitem*
> are specified then connection\_pid, publisher\_id, stream, reference,
> messages\_published, messages\_confirmed, and messages\_errored are displayed.

> For example, this command displays the connection PID, publisher ID and stream
> for each producer:

> > rabbitmq-streams list\_stream\_publishers connection\_pid publisher\_id stream

**add\_super\_stream** *super-stream* \[**--vhost** *vhost*] \[**--partitions** *partitions*] \[**--routing-keys** *routing-keys*] \[**--max-length-bytes** *max-length-bytes*] \[**--max-age** *max-age*] \[**--stream-max-segment-size-bytes** *stream-max-segment-size-bytes*] \[**--leader-locator** *leader-locator*] \[**--initial-cluster-size** *initial-cluster-size*]

> *super-stream*

> > The name of the super stream to create.

> *vhost*

> > The name of the virtual host to create the super stream into.

> *partitions*

> > The number of partitions the super stream will have.

> *routing-keys*

> > Comma-separated list of routing keys.

> *max-length-bytes*

> > The maximum size of partition streams, example values: 20gb, 500mb.

> *max-age*

> > The maximum age of partition stream segments, using the ISO 8601 duration format, e.g. PT10M30S for 10 minutes 30 seconds, P5DT8H for 5 days 8 hours.

> *stream-max-segment-size-bytes*

> > The maximum size of partition stream segments, example values: 500mb, 1gb.

> *leader-locator*

> > Leader locator strategy for partition streams.
> > Possible values are:

> > *	client-local
> > *	balanced

> > The default is
> > **balanced**

> *initial-cluster-size*

> > The initial cluster size of partition streams.

> Create a super stream.

**delete\_super\_stream** *super-stream* \[**--vhost** *vhost*]

> *super-stream*

> > The name of the super stream to delete.

> *vhost*

> > The virtual host of the super stream.

> > Delete a super stream.

**list\_stream\_consumer\_groups** \[**-p** *vhost*] \[*groupinfoitem ...*]

> Lists groups of stream single active consumers for a vhost.

> The
> *groupinfoitem*
> parameter is used to indicate which group information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *groupinfoitem*
> can take any value from the list that follows:

> *consumers*

> > Number of consumers in the group.

> *partition\_index*

> > The stream partition index if the stream is part of a super stream,
> > \-1 if it is not.

> *reference*

> > The group reference (name).

> *stream*

> > The stream the consumers are attached to.

> If no
> *groupinfoitem*
> are specified then stream, reference, partition\_index, and consumers are displayed.

> For example, this command displays the stream, reference, and number of consumers
> for each group:

> > rabbitmq-streams list\_stream\_consumer\_groups stream reference consumers

**list\_stream\_group\_consumers** **--stream** *stream* **--reference** *reference* \[**--vhost** *vhost*] \[*consumerinfoitem ...*]

> Lists consumers of a stream consumer group in a vhost.

*stream*

> The stream the consumers are attached to.

*reference*

> The group reference (name).

*vhost*

> The virtual host of the stream.

The
*consumerinfoitem*
parameter is used to indicate which consumer information items to
include in the results.
The column order in the results will match the order of the parameters.
*consumerinfoitem*
can take any value from the list that follows:

*connection\_name*

> Readable name of the consumer connection.

*state*

> Consumer state; one of:

> *	active
> *	inactive

*subscription\_id*

> The connection-scoped ID of the consumer.

If no
*consumerinfoitem*
are specified then subscription\_id, connection\_name, and state are displayed.

For example, this command displays the connection name and state
for each consumer attached to the stream-1 stream and belonging to the stream-1 group:

	rabbitmq-streams list_stream_group_consumers --stream stream-1 --reference stream-1 connection_name state

# SEE ALSO

rabbitmqctl(8),
rabbitmq-diagnostics(8),
rabbitmq-server(8),
rabbitmq-queues(8),
rabbitmq-upgrade(8),
rabbitmq-service(8),
rabbitmq-env.conf(5),
rabbitmq-echopid(8)

# AUTHOR

The RabbitMQ Team &lt;[rabbitmq-core@groups.vmware.com](mailto:rabbitmq-core@groups.vmware.com)&gt;

RabbitMQ Server - June 22, 2023
