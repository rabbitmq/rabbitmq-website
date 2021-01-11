<!--
Copyright (c) 2007-2020 VMware, Inc. or its affiliates.

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

# Downloading and Installing RabbitMQ

The latest [release](https://github.com/rabbitmq/rabbitmq-server/releases) of RabbitMQ is **&version-server;**. See [change log](changelog.html) for release notes.
See [RabbitMQ support timeline](/versions.html) to find out what release series are supported.

Experimenting with RabbitMQ on your workstation? Try the [community Docker image](https://registry.hub.docker.com/_/rabbitmq/):

<pre class="lang-bash">
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
</pre>


## Open Source RabbitMQ Server

### Installation Guides

 * Linux, BSD, UNIX: [Debian, Ubuntu](install-debian.html) | [RHEL, CentOS, Fedora](install-rpm.html) | [Generic binary build](install-generic-unix.html) | [Solaris](install-solaris.html)
 * Windows: [Chocolatey or Installer](install-windows.html) (recommended) | [Binary build](install-windows-manual.html)
 * MacOS: [Homebrew](install-homebrew.html) | [Generic binary build](install-generic-unix.html)
 * [Erlang/OTP for RabbitMQ](/which-erlang.html)

## Kubernetes

 * Open source [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/install-operator.html) by VMware (developed [on GitHub](https://github.com/rabbitmq/cluster-operator))
 * A [peer discovery](/cluster-formation.html) mechanism [for Kubernetes](/cluster-formation.html#peer-discovery-k8s)
 * GKE-, Minikube-, or Kind-based [examples](https://github.com/rabbitmq/diy-kubernetes-examples) that demonstrate a [DIY RabbitMQ on Kubernetes deployment](https://www.rabbitmq.com/blog/2020/08/10/deploying-rabbitmq-to-kubernetes-whats-involved/)


## Docker

 * Docker community-maintained [RabbitMQ Docker image](https://registry.hub.docker.com/_/rabbitmq/) ([on GitHub](https://github.com/docker-library/rabbitmq/))


## Downloads [on GitHub](https://github.com/rabbitmq/rabbitmq-server/releases)

 * [Windows installer](https://github.com/rabbitmq/rabbitmq-server/releases/download/v&version-server;/rabbitmq-server-&version-server;.exe)
 * [Debian, Ubuntu](https://github.com/rabbitmq/rabbitmq-server/releases/download/v&version-server;/rabbitmq-server_&version-server;-1_all.deb)
 * [RHEL/CentOS 8.x](https://github.com/rabbitmq/rabbitmq-server/releases/download/v&version-server;/rabbitmq-server-&version-server;-1.el8.noarch.rpm) |
    [RHEL/CentOS 7.x](https://github.com/rabbitmq/rabbitmq-server/releases/download/v&version-server;/rabbitmq-server-&version-server;-1.el7.noarch.rpm) |
    [RHEL/CentOS 6.x](https://github.com/rabbitmq/rabbitmq-server/releases/download/v&version-server;/rabbitmq-server-&version-server;-1.el6.noarch.rpm) |
    [OpenSUSE](https://github.com/rabbitmq/rabbitmq-server/releases/download/v&version-server;/rabbitmq-server-&version-server;-1.suse.noarch.rpm) |
    [SLES 11.x](https://github.com/rabbitmq/rabbitmq-server/releases/download/v&version-server;/rabbitmq-server-&version-server;-1.sles11.noarch.rpm) |
    [Erlang RPM](https://github.com/rabbitmq/erlang-rpm)
 * [Generic UNIX binary](https://github.com/rabbitmq/rabbitmq-server/releases/download/v&version-server;/rabbitmq-server-generic-unix-&version-server;.tar.xz)
 * [Windows binary](https://github.com/rabbitmq/rabbitmq-server/releases/download/v&version-server;/rabbitmq-server-windows-&version-server;.zip)


## Debian (Apt) and RPM (Yum) Repositories

 * [Package Cloud](https://packagecloud.io/rabbitmq/)
 * [Bintray](https://bintray.com/rabbitmq/debian) (Apt)
 * [Bintray](https://bintray.com/rabbitmq/rpm) (Yum)


## Cloud

 * [Tanzu™ RabbitMQ®](https://tanzu.vmware.com/rabbitmq)
 * [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/install-operator.html) by VMware (developed [on GitHub](https://github.com/rabbitmq/cluster-operator))
 * [CloudAMQP](https://www.cloudamqp.com): RabbitMQ-as-a-Service available in multiple clouds
 * [Amazon EC2](/ec2.html)


## Provisioning Tools (Chef, Puppet, etc)

 * [Chef cookbook](https://github.com/rabbitmq/chef-cookbook)
 * [Puppet module](https://github.com/puppetlabs/puppetlabs-rabbitmq)


## Release Signing Key

 * [Release Signing Key](https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc) <code>0x6B73A36E6026DFCA</code> (on GitHub)
 * [How to Verify Release Artifact Signatures](/signatures.html)
 * [Release Signing Key](/rabbitmq-release-signing-key.asc) (alternative download location on rabbitmq.com)
 * [Release Signing Key](https://dl.bintray.com/rabbitmq/Keys/rabbitmq-release-signing-key.asc) (alternative download location on Bintray)


## Downloads [on Bintray](https://bintray.com/rabbitmq/all)

Bintray is an alternative download location that provides a subset of packages compared to [GitHub](#install-from-github).

 * [Windows installer](https://dl.bintray.com/rabbitmq/all/rabbitmq-server/&version-server;/rabbitmq-server-&version-server;.exe)
 * [Debian, Ubuntu](https://dl.bintray.com/rabbitmq/all/rabbitmq-server/&version-server;/rabbitmq-server_&version-server;-1_all.deb) |
   [Erlang Debian packages](https://bintray.com/rabbitmq-erlang/debian/erlang)
 * [RHEL/CentOS 8.x and 7.x](https://dl.bintray.com/rabbitmq/all/rabbitmq-server/&version-server;/rabbitmq-server-&version-server;-1.el7.noarch.rpm) |
   [RHEL/CentOS 6.x](https://dl.bintray.com/rabbitmq/all/rabbitmq-server/&version-server;/rabbitmq-server-&version-server;-1.el6.noarch.rpm) |
   [OpenSUSE](https://dl.bintray.com/rabbitmq/all/rabbitmq-server/&version-server;/rabbitmq-server-&version-server;-1.suse.noarch.rpm) |
   [SLES 11.x](https://dl.bintray.com/rabbitmq/all/rabbitmq-server/&version-server;/rabbitmq-server-&version-server;-1.sles11.noarch.rpm) |
   [Erlang RPM packages](https://bintray.com/rabbitmq-erlang/rpm/erlang)
 * [Generic UNIX binary](https://dl.bintray.com/rabbitmq/all/rabbitmq-server/&version-server;/rabbitmq-server-generic-unix-&version-server;.tar.xz)


## Older Versions

* [3.5.x](https://github.com/rabbitmq/rabbitmq-server/releases) |
* [Older than 3.5.0](https://www.rabbitmq.com/releases/rabbitmq-server/)


## Client Libraries

### Java Client

 * On Maven Central: [RabbitMQ Java client](http://search.maven.org/#search%7Cgav%7C1%7Cg%3A%22com.rabbitmq%22%20AND%20a%3A%22amqp-client%22)
 * Quick download: [Maven.org](http://repo1.maven.org/maven2/com/rabbitmq/amqp-client/&version-java-client;/amqp-client-&version-java-client;.jar) |
   [Source](http://repo1.maven.org/maven2/com/rabbitmq/amqp-client/&version-java-client;/amqp-client-&version-java-client;-sources.jar)
 * [API guide](/api-guide.html)
 * [API reference](https://rabbitmq.github.io/rabbitmq-java-client/api/current/) (JavaDoc)
 * [License and other information](/java-client.html)
 * [Older versions](http://repo1.maven.org/maven2/com/rabbitmq/amqp-client/)

### JMS Client

 * On Maven Central: [RabbitMQ JMS Client](http://search.maven.org/#search%7Cga%7C1%7Cg%3A%22com.rabbitmq.jms%22%20AND%20a%3A%22rabbitmq-jms%22)

### .NET/C# Client

 * On NuGet: [RabbitMQ .NET Client](https://www.nuget.org/packages/RabbitMQ.Client)
 * [API guide](/dotnet-api-guide.html)
 * [API reference](https://rabbitmq.github.io/rabbitmq-dotnet-client/)
 * [License and other information](/dotnet.html)
 * [Older versions](/releases/releases/rabbitmq-dotnet-client)

### Erlang Client

 * Quick download: Binary [client.ez](/releases/rabbitmq-erlang-client/v&version-server;/amqp_client-&version-server;.ez), [common.ez](/releases/rabbitmq-erlang-client/v&version-server;/rabbit_common-&version-server;.ez) |
   Source [.tar.xz](/releases/rabbitmq-erlang-client/v&version-server;/amqp_client-&version-server;-src.tar.xz)
 * [All Erlang client downloads](/erlang-client.html)
 * [Older versions](/releases/rabbitmq-erlang-client/)

### Clients for Other Languages

The RabbitMQ community has created a large number of [clients and developer tools](devtools.html)
covering a variety of platforms and languages.


## Community Plugins

For your convenience, we offer binary downloads of various
plugins developed by the community.

 * [Description of available plugins](community-plugins.html)
 * [Plugin downloads](/community-plugins)


## Snapshot (Alpha) Builds

Snapshot releases of the RabbitMQ broker
available to users who wish to experiment with the latest and
greatest features and bug fixes. For more details, head over to
the [snapshots page](snapshots.html).
