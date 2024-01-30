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
# Running RabbitMQ on Amazon EC2

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide assumes familiarity with the general [clustering guide](./clustering.html) as well
the guide on [cluster peer discovery](./cluster-formation.html).

Using RabbitMQ on EC2 is quite similar to running it on other
platforms. However, there are certain minor aspects to EC2 that need
to be accounted for. They primarily have to do with hostnames and their resolution.

This guide demonstrates manual ([CLI](./cli.html)-driven) RabbitMQ clustering.
[Peer discovery plugin for AWS](./cluster-formation.html) (RabbitMQ 3.7.0 or later)
is an option more suitable for automation.

## <a id="amis" class="anchor" href="#amis">AMIs</a>

RabbitMQ works well on up-to-date Ubuntu, Debian and CentOS AMIs as long as
a [compatible version of Erlang/OTP](./which-erlang.html) is installed.

## <a id="instance-types" class="anchor" href="#instance-types">Choosing an Instance Type</a>

RabbitMQ will work on every instance type, but there are a few considerations
worth bearing in mind:

 * Use 64-bit instances.
 * Depending on the workload and settings, RabbitMQ can require substantial amounts of memory.
	 Make sure that your host does have an [appropriate amount of RAM](./memory.html) and always have
	 at least a few gigabytes of swap space enabled. Workloads can be simulated using [PerfTest](./java-tools.html).
   A separate guide on [reasoning about node memory usage](./memory-use.html) is available.
 * RabbitMQ generally will take advantage of all the CPU cores
	in the system provided the workload uses [multiple queues](queues.html).
  Other factors should be taken into account (e.g. disk and network I/O throughput).
 * [Monitoring](./monitoring.html) RabbitMQ nodes as well as applications that use it
   on real or simulated workloads will help assess how suitable a particular instance type is.


## <a id="os" class="anchor" href="#os">Operating Systems</a>

Although RabbitMQ is tested with most major Linux distributions,
Ubuntu support for Amazon EC2 seems to be strongest, so that's the distribution this guide
will use.

[Ubuntu Cloud Images](https://cloud-images.ubuntu.com/) provides access to Ubuntu
images (builds) specifically designed to be used in public clouds.


## <a id="installation" class="anchor" href="#installation">Installation</a>

Please consult the installation guides for

  * [Debian and Ubuntu](install-debian.html)
  * [RHEL, CentOS and Fedora](install-rpm.html)

A wide variety of deployment tools can be used to automate
RabbitMQ deployment.

  * [Community Docker image](https://hub.docker.com/_/rabbitmq/) ([on GitHub](https://github.com/docker-library/rabbitmq))
  * [Chef cookbook](https://github.com/rabbitmq/chef-cookbook)
  * [Puppet module](https://github.com/puppetlabs/puppetlabs-rabbitmq)

are some popular options.


## <a id="ebs" class="anchor" href="#ebs">Durable Storage on EBS Volumes</a>

On Linux, RabbitMQ will use the following directories for its node data directory:

 * <code>/var/lib/rabbitmq/</code> to store persistent data like the messages or queues
 * <code>/var/log/rabbitmq/</code> to store logs

See the [File and Directory Locations](./relocate.html) for details.

Those directories can be symlinks to a dedicated storage volume. The node must be stopped
before symlinking is performed:

<pre class="lang-bash">sudo service rabbitmq-server stop</pre>

We recommend performing symlinking and other storage preparation steps before installing
RabbitMQ when possible.

Note that EBS volumes have an [IOPS
limits](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSVolumeTypes.html), which can impact throughput and RabbitMQ operations.
If an EBS volume hits the limit, disk writes will worsen. It is also possible that the RabbitMQ message store
compaction (garbage collection of on-disk data) can fall behind
disk writes, which means the disk will be filled up quicker than
disk space can be reclaimed after messages were consumed and
acknowledged. This will eventually lead to [resource alarms](./alarms.html) and publisher throttling. Please make sure the limit
is high and set up I/O operation rate monitoring.

## <a id="related" class="anchor" href="#related">Further Reading</a>

Several other guides cover topics highly relevant for running RabbitMQ clusters in public clouds:

 * [Clustering Fundamentals](./clustering.html)
 * [Peer Discovery](./cluster-formation.html)
 * [Configuration](configure.html)
 * [Monitoring](./monitoring.html)
 * [Production Checklist](./production-checklist.html)
 * [File and Directory Locations](./relocate.html)
