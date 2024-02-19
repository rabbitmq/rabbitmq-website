<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Production Checklist

## <a id="overview" class="anchor" href="#overview">Overview</a>

Data services such as RabbitMQ often have many tunable
parameters. Some configurations or practices make a lot of sense for
development but are not really suitable for production.  No
single configuration fits every use case. It is, therefore,
important to assess system configuration and have a plan for "day two operations"
activities such as [upgrades](upgrade.html) before going into production.


## <a id="toc" class="anchor" href="#overview">Overview</a>

Production systems have concerns that go beyond configuration: system observability,
security, application development practices, resource usage, [release support timeline](versions.html), and more.

[Monitoring](monitoring.html) and metrics are the foundation of a production-grade system.
Besides helping detect issues, it provides the operator data that can be used
to size and configure both RabbitMQ nodes and applications.

This guide provides recommendations in a few areas:

 * [Storage](#storage) considerations for node data directories
 * [Networking](#networking)-related recommendations
 * Recommendations related to [virtual hosts, users and permissions](#users-and-permissions)
 * [Monitoring and resource usage](#monitoring-and-resource-usage)
 * [Per-virtual host and per-user limits](#limits)
 * [Security](#security)
 * [Clustering](#clustering) and multi-node deployments
 * [Application-level](#apps) practices and considerations

and more.

## <a id="storage" class="anchor" href="#storage">Storage Considerations</a>

### <a id="storage-durability" class="anchor" href="#storage-durability">Use Durable Storage</a>

Modern RabbitMQ 3.x features, most notably quorum queues and streams, are not designed with transient storage in mind.

Data safety features of [quorum queues](./quorum-queues.html) and [streams](./streams.html) expect
node data storage to be durable. Both data structures also assume reasonably stable latency of I/O
operations, something that network-attached storage will not be always ready to provide in practice.

Quorum queue and stream replicas hosted on restarted nodes that use transient storage will have
to perform a full sync of the entire data set on the leader replica. This can result in massive
data transfers and network link overload that could have been avoided by using durable storage.

When nodes are restarted, the rest of the cluster expects them to retain the information
about their cluster peers. When this is not the case, restarted nodes may be able to rejoin
as new nodes but a [special peer clean up mechanism](https://rabbitmq.com/cluster-formation.html#node-health-checks-and-cleanup)
would have to be enabled to remove their prior identities.

Transient entities (such as queues) and RAM node support will be removed in RabbitMQ 4.0.

### <a id="storage-nas" class="anchor" href="#storage-nas">Network-attached Storage (NAS)</a>

Network-attached storage (NAS) can be used for RabbitMQ node data directories, provided that
the NAS volume

 * It offers low I/O latency
 * It can guarantee no significant latency spikes (for example, due to sharing with other I/O-heavy services)

Quorum queues, streams, and other RabbitMQ features will benefit from fast local SSD and NVMe storage.
When possible, prefer local storage to NAS.

### <a id="storage-isolation" class="anchor" href="#storage-isolation">Storage Isolation</a>

RabbitMQ nodes must never share their data directories. Ideally, should not share their
disk I/O with other services for most predictable latency and throughput.

### <a id="storage-filesystems" class="anchor" href="#storage-filesystems">Choice of a Filesystem</a>

RabbitMQ nodes can use most widely used local filesystems: ext4, btfs, and so on.

Avoid using distributed filesystems for node data directories:

 * RabbitMQ's storage subsystem assumes the standard local filesystem semantics for `fsync(2)`
   and other key operations. Distributed filesystems often [deviate from these standard guarantees](https://docs.ceph.com/en/latest/cephfs/posix/)
 * Distributed filesystems are usually designed for shared access to a subset of directories.
   Sharing a data directory between RabbitMQ nodes is **an absolute no-no** and
   is guaranteed to result in data corruption since nodes will not coordinate their writes


## <a id="users-and-permissions" class="anchor" href="#users-and-permissions">Virtual Hosts, Users, Permissions</a>

It is often necessary to seed a cluster with virtual hosts, users, permissions, topologies, policies
and so on. The recommended way of doing this at deployment time is [via definition import](definitions.html).
Definitions can be imported on node boot or at any point after cluster deployment
using `rabbitmqadmin` or the `POST /api/definitions` [HTTP API endpoint](management.html).

### <a id="virtual-hosts" class="anchor" href="#virtual-hosts">Virtual Hosts</a>

In a single-tenant environment, for example, when your RabbitMQ
cluster is dedicated to power a single system in production,
using default virtual host (`/`) is perfectly fine.

In multi-tenant environments, use a separate vhost for
each tenant/environment, e.g. `project1_development`,
`project1_production`, `project2_development`,
`project2_production`, and so on.

### <a id="users" class="anchor" href="#users">Users</a>

For production environments, delete the default user (`guest`).
Default user only can connect from localhost by default, because it has well-known
credentials. Instead of enabling remote connections, consider creating a separate user
with administrative permissions and a generated password.

It is recommended to use a separate user per application. For example, if you
have a mobile app, a Web app, and a data aggregation system, you'd have 3
separate users. This makes a number of things easier:

 * Correlating client connections with applications
 * Using [fine-grained permissions](access-control.html)
 * Credentials roll-over (e.g. periodically or in case of a breach)

In case there are many instances of the same application, there's a trade-off
between better security (having a set of credentials per instance) and convenience
of provisioning (sharing a set of credentials between some or all instances).

For IoT applications that involve many clients performing the same or similar
function and having fixed IP addresses, it may make sense to [authenticate using x509 certificates](ssl.html) or
[source IP address ranges](https://github.com/gotthardp/rabbitmq-auth-backend-ip-range).

## <a id="monitoring-and-resource-usage" class="anchor" href="#monitoring-and-resource-usage">Monitoring and Resource Limits</a>

RabbitMQ nodes are limited by various resources, both physical
(e.g. the amount of RAM available) as well as software (e.g. max number of file handles a process can open).
It is important to evaluate resource limit configurations before
going into production and continuously monitor resource usage after that.

### <a id="monitoring" class="anchor" href="#monitoring">Monitoring</a>

[Monitoring](monitoring.html) several aspects of the system, from
infrastructure and kernel metrics to RabbitMQ to application-level metrics is essential.
While monitoring requires an upfront investment in terms of time, it is very effective
at catching issues and noticing potentially problematic trends early (or at all).

### <a id="resource-limits-ram" class="anchor" href="#resource-limits-ram">Memory</a>

RabbitMQ uses [Resource-driven alarms](alarms.html)
to throttle publishers when consumers do not keep up.

By default, RabbitMQ will not accept any new messages when it detects
that it's using more than 40% of the available memory (as reported by the OS):
`vm_memory_high_watermark.relative = 0.4`. This is a safe default
and care should be taken when modifying this value, even when the
host is a dedicated RabbitMQ node.

The OS and file system use system memory to speed up operations for
all system processes. Failing to leave enough free system memory for
this purpose will have an adverse effect on system performance due to
OS swapping, and can even result in RabbitMQ process termination.

A few recommendations when adjusting the default
`vm_memory_high_watermark`:

 * Nodes hosting RabbitMQ should have at least <strong>256 MiB</strong> of
   memory available at all times. Deployments that use [quorum queues](quorum-queues.html), [Shovel](shovel.html) and [Federation](federation.html) may need more.
 * The recommended `vm_memory_high_watermark.relative` range is `0.4 to 0.7`
 * Values above `0.7` should be used with care and with solid [memory usage](memory-use.html) and infrastructure-level [monitoring](monitoring.html) in place.
   The OS and file system must be left with at least 30% of the memory, otherwise performance may degrade severely due to paging.

These are some very broad-stroked guidelines.
As with every tuning scenario, monitoring, benchmarking and measuring are required to find
the best setting for the environment and workload.

Learn more about [RabbitMQ and system memory](memory.html) in a separate guide.

### <a id="resource-limits-disk-space" class="anchor" href="#resource-limits-disk-space">Disk Space</a>

The current 50MB `disk_free_limit` default works very well for
development and [tutorials](getstarted.html).
Production deployments require a much greater safety margin.
Insufficient disk space will lead to node failures and may result in data loss
as all disk writes will fail.

Why is the default 50MB then? Development
environments sometimes use really small partitions to host
`/var/lib`, for example, which means nodes go
into resource alarm state right after booting. The very low
default ensures that RabbitMQ works out of the box for
everyone. As for production deployments, we recommend the
following:

<ul class="plain">
  <li>
    <p>
      The minimum recommended free disk space low watermark value is about the same
      as the high memory watermark. For example, on a node configured to have its memory watermark of 4GB,
      <code>disk_free_limit.absolute = 4G</code> would be a recommended minimum.
    </p>

    <p>
      In the example above, if available disk space drops
      below 4GB, all publishers will be blocked and no new messages
      will be accepted. Queues will need to be drained by
      consumers before publishing will be allowed to resume.
    </p>
  </li>
  <li>
    <p>
      Continuing with the example above, <code>disk_free_limit.absolute = 6G</code>
      is a safer value.
    </p>

    <p>
      If RabbitMQ needs to
      flush to disk up to its high memory watermark worth of data, as can sometimes be the case during
      shutdown, there will be sufficient disk space available for RabbitMQ
      to start again in all but the most pessimistic scenarios.
      6GB
    </p>
  </li>
  <li>
    <p>
      Continuing with the example above, <code>disk_free_limit.absolute = 8G</code>
      is the safest value to use.
    </p>

    <p>
      It should be enough disk space for the most pessimistic scenario where a node first has to move
      up its high memory watermark worth of data (so, about 4 GiB) to disk, and then perform an on disk
      data operation that could temporarily nearly double the amount of disk space used.
    </p>
  </li>
</ul>

### <a id="resource-limits-file-handle-limit" class="anchor" href="#resource-limits-file-handle-limit">Open File Handles Limit</a>

Operating systems limit maximum number of concurrently open file handles, which
includes network sockets. Make sure that you have limits set high enough to allow
for expected number of concurrent connections and queues.

Make sure your environment allows for at least 50K open file descriptors for effective RabbitMQ
user, including in development environments.

As a guideline, multiply the 95th percentile number of concurrent connections
by 2 and add the total number of queues to calculate the recommended open file handle limit.
Values as high as 500K are not inadequate and
will not consume a lot of hardware resources, therefore, they are recommended for production
setups.

See [Networking guide](networking.html) for more information.

### <a id="logging" class="anchor" href="#logging">Log Collection</a>

It is highly recommended that logs of all RabbitMQ nodes and applications (when possible) are collected
and aggregated. Logs can be crucially important in investigating unusual system behaviour.


## <a id="limits" class="anchor" href="#limits">Per-Virtual Host and Per-User Resource Limits</a>

It is possible to [limit the maximum number of concurrent connections and queues](./vhosts.html#limits) a virtual host will
allow the users to open (declare).

These limits can be used as guard rails in environments where applications
cannot be trusted and monitored in detail, for example, when RabbitMQ clusters
are offered as a service.

Similarly, it is possible to [configure concurrent connection and channel limits
for individual users](./user-limits.html).


## <a id="security" class="anchor" href="#security">Security Considerations</a>

### <a id="security-users-and-permissions" class="anchor" href="#security-users-and-permissions">Users and Permissions</a>

See the section on vhosts, users, and credentials above.

### <a id="inter-node-authentication" class="anchor" href="#inter-node-authentication">Inter-node and CLI Tool Authentication</a>

RabbitMQ nodes authenticate to each other using a [shared secret](clustering.html#erlang-cookie)
stored in a file. On Linux and other UNIX-like systems, it is necessary to restrict cookie file
access only to the OS users that will run RabbitMQ and [CLI tools](cli.html).

It is important that the value is generated in a reasonably secure way
(e.g. not computed from an easy to guess value). This is usually done using deployment
automation tools at the time of initial deployment. Those tools can use default or
placeholder values: don't rely on them. Allowing the runtime to generate a cookie file
on one node and copying it to all other nodes is also a poor practice: it makes the generated value
more predictable since the generation algorithm is known.

CLI tools use the same authentication mechanism. It is recommended that
[inter-node and CLI communication port](clustering.html#ports)
access is limited to the hosts that run RabbitMQ nodes or CLI tools.

[Securing inter-node communication with TLS](clustering-ssl.html) is recommended.
It implies that CLI tools are also configured to use TLS.

### <a id="security-firewall-rules" class="anchor" href="#security-firewall-rules">Firewall Configuration</a>

[Ports used by RabbitMQ](networking.html#ports) can be broadly put into
one of two categories:

<ul>
  <li>Ports used by client libraries (AMQP 0-9-1, AMQP 1.0, MQTT, STOMP, HTTP API)</li>
  <li>All other ports (inter node communication, CLI tools and so on)</li>
</ul>

Access to ports from the latter category generally should be restricted to hosts running RabbitMQ nodes
or CLI tools. Ports in the former category should be accessible to hosts that run applications,
which in some cases can mean public networks, for example, behind a load balancer.


### <a id="security-tls" class="anchor" href="#security-tls">TLS</a>

We recommend using [TLS connections](ssl.html) when possible,
at least to encrypt traffic. Peer verification (authentication) is also recommended.
Development and QA environments can use [self-signed TLS certificates](https://github.com/rabbitmq/tls-gen/).
Self-signed certificates can be appropriate in production environments when
RabbitMQ and all applications run on a trusted network or isolated using technologies
such as VMware NSX.

While RabbitMQ tries to offer a reasonably secure TLS configuration by
default, it is highly recommended evaluating
TLS configuration (versions cipher suites and so on) using tools such as [testssl.sh](https://testssl.sh/).
Please refer to the [TLS guide](ssl.html) to learn more.

Note that TLS can have significant impact on overall system throughput,
including CPU usage of both RabbitMQ and applications that use it.


## <a id="networking" class="anchor" href="#networking">Networking Configuration</a>

Production environments may require network configuration
tuning, for example, to sustain a high number of concurrent clients.
Please refer to the [Networking Guide](networking.html) for details.

### <a id="networking-throughput" class="anchor" href="#networking-throughput">Minimum Available Network Throughput Estimate</a>

With higher message rates and large message payloads, traffic bandwidth available to cluster nodes becomes an important
factor.

The following (intentionally oversimplified) formula can be used to compute the **minimum amount of bandwidth**
that must be available to cluster nodes, in bits per second:

<pre class="lang-ini">
MR * MS * 110% * 8
</pre>

where

 * `MR`: 95th percentile message rate per second
 * `MS`: 95th percentile message size, in bytes
 * 110%: accounts for message properties, protocol metadata, and other data transferred
 * 8: bits per byte

For example, with a message rate (`MR`) of 20K per second and 6 KB message payloads (`MS`):

<pre class="lang-ini">
20K * 6 KB * 110% * 8 bit/B = 20000 * 6000 * 1.1 * 8 = 1.056 (gigabit/second)
</pre>

With the above inputs, cluster nodes must have network links with throughput of at least 1.056 gigabit per second.

This formula **is a rule of thumb** and does not consider protocol- or workload-specific nuances.


## <a id="clustering" class="anchor" href="#clustering">Clustering Considerations</a>

### <a id="clustering-cluster-size" class="anchor" href="#clustering-cluster-size">Cluster Size</a>

The number of queues, queue replication factor, number of connections, maximum
message backlog and sometimes message throughput are factors that determine how
large should a cluster be.

Single node clusters can be sufficient when simplicity is
preferred over everything else: development, integration testing and certain QA environments.

Three node clusters are the next step up. They can tolerate a single node
failure (or unavailability) and still [maintain quorum](quorum-queues.html).
Simplicity is traded off for availability, resiliency and, in certain cases, throughput.

It is recommended to use clusters with an odd
number of nodes (3, 5, 7, etc) so that when one node becomes unavailable, the
service remains available and a clear majority of nodes can be identified.

For most environments, configuring queue replication to more than half — but not all —
cluster nodes is sufficient.

#### Uneven Numbers of Nodes and Cluster Majority

It is important to pick a [partition handling strategy](partitions.html) before going into production.
When in doubt, use the `pause_minority` strategy with an odd number of nodes (3, 5, 7, and so on).

Uneven number of nodes make network partition recovery more predictable, with the common option
of the minority automatically refusing to service commands.
#### Data Locality Considerations

With multi-node clusters, data locality becomes an important consideration.
Since [clients can connect to any node](clustering.html), RabbitMQ nodes may need to perform
inter-cluster routing of messages and internal operations. Data locality will be best
when producers (publishers) connect to RabbitMQ nodes where queue leaders are running.
Such topology is difficult to achieve in practice.

With classic queues, all deliveries are performed from the leader replica.
Quorum queues can deliver messages from queue replicas as well,
so as long as consumers connect to a node where a
quorum queue replica is hosted, messages delivered to those consumers will be
performed from the local node.
#### Growing Node Count to Sustain More Concurrent Clients

Environments that have to sustain a [large number of concurrent client connections](networking.html#tuning-for-large-number-of-connections)
will benefit from more cluster nodes as long as the connections are distributed
across them. This can be achieved using a load balancer or making clients
randomly pick a node to connect to from the provided node list.
#### Increasing Node Counts vs. Deploying Separate Clusters for Separate Purposes

All metadata ([definitions](definitions.html): virtual hosts, users, queues, exchanges, bindings, etc.) is replicated
across all nodes in the cluster, and most metadata changes are synchronous in nature.

The cost of propagating such changes goes up with the number of cluster nodes,
both during operations and node restarts. Users who find themselves in need of
clusters with node counts in double digits should
**consider using independent clusters for separate parts of the system** where possible.

### <a id="clustering-ntp" class="anchor" href="#clustering-ntp">Node Time Synchronization</a>

A RabbitMQ cluster will typically function well without clocks
of participating servers being synchronized. However some plugins,
such as the management one, make use of local timestamps for metrics
processing and may display incorrect statistics when the current
time of nodes drift apart. It is therefore recommended that servers
use NTP or similar to ensure clocks remain in sync.



## <a id="apps" class="anchor" href="#apps">Application Considerations</a>

The way applications are designed and use RabbitMQ client libraries
is a major contributor to the overall system resilience. Applications
that use resources inefficiently or leak them will eventually affect the
rest of the system. For example, an app that continuously opens connections
but never closes them will exhaust cluster nodes out of file descriptors so
no new connections will be accepted. This and similar problems can
manifest themselves in more complex scenarios, e.g those collectively
known as the thundering herd problem.

This section covers a number of most common problems. Most of these problems
are generally not protocol-specific or new. They can be hard to detect, however.
Adequate [monitoring](monitoring.html) of the system is critically
important as it is the only way to spot problematic trends
(e.g. channel leaks, growing file descriptor usage from poor connection management) early.

### <a id="apps-connection-management" class="anchor" href="#apps-connection-management">Connection Management</a>

Messaging protocols generally assume long-lived connections. Some applications
connect to RabbitMQ on start and only close the connection(s) when they have to terminate.
Others open and close connections more dynamically. For the latter group it is important to close
them when they are no longer used.

Connections can be closed for reasons outside of application developer's control.
Messaging protocols supported by RabbitMQ use a feature called [heartbeats](heartbeats.html) (the name
may vary but the concept does not) to detect such connections quicker than the TCP stack.
Developers should be careful about using heartbeat timeout that are too low (less than 5 seconds)
as that may produce false positives when network congestion or system load goes up.

Very short lived connections should be avoided when possible. The following section
will cover this in more detail.

It is recommended that, when possible, publishers and consumers use separate connections
so that consumers are isolated from potential [flow control](./connections.html#flow-control)
that may be applied to publishing connections, affecting [manual consumer acknowledgements](./confirms.html).

### <a id="apps-connection-churn" class="anchor" href="#apps-connection-churn">Connection Churn</a>

As mentioned above, messaging protocols generally assume long-lived connections. Some applications
may open a new connection to perform a single operation (e.g. publish a message) and then close it.
This is highly inefficient as opening a connection is an expensive operation (compared to reusing
an existing one). Such workload also leads to [connection churn](networking.html#dealing-with-high-connection-churn).
Nodes experiencing high connection churn must be tuned to release TCP connections much quicker than
kernel defaults, otherwise they will eventually run out of file handles or memory and will stop
accepting new connections.

If a small number of long lived connections is not an option, connection pooling can help
reduce peak resource usage.

### <a id="apps-automatic-recovery" class="anchor" href="#apps-automatic-recovery">Recovery from Connection Failures</a>

Some client libraries, for example, [Java](api-guide.html),
[.NET](dotnet-api-guide.html) and
[Ruby](http://rubybunny.info), support
automatic connection recovery after network failures. If the
client used provides this feature, it is recommended to use
it instead of developing your own recovery mechanism.

Other clients (Go, Pika) do not support automatic connection recovery as a feature
but do provide examples that demonstrate how to recover from connection failures.

### <a id="apps-excessive-channel-usage" class="anchor" href="#apps-excessive-channel-usage">Excessive Channel Usage</a>

Channels also consume resources in both client and server. Applications should minimize
the number of channels they use when possible and close channels that are no longer necessary.
Channels, like connections, are meant to be long lived.

Note that closing a connection automatically closes all channels on it.

### <a id="apps-polling-consumers" class="anchor" href="#apps-polling-consumers">Polling Consumers</a>

[Polling consumers](consumers.html#fetching) (consumption with `basic.get`) is a feature that application developers
should avoid in most cases as polling is inherently inefficient.
