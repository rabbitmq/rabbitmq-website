---
title: Installing RabbitMQ
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

import {
  RabbitMQServerVersion,
  RabbitMQServerPackageURL,
} from '@site/src/components/RabbitMQServer';
import {
  JavaClientVersion
} from '@site/src/components/JavaClient';

# Installing RabbitMQ

The latest [release](https://github.com/rabbitmq/rabbitmq-server/releases) of RabbitMQ is <strong><RabbitMQServerVersion/></strong>. See [change log](/release-information) for release notes.
See [RabbitMQ support timeline](/release-information) to find out what release series are supported.

Experimenting with RabbitMQ on your workstation? Try the [community Docker image](https://hub.docker.com/_/rabbitmq/):

```bash
# latest RabbitMQ 4.0.x
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4.0-management
```

## Open Source RabbitMQ Server

### Installation Guides

 * Linux, BSD, UNIX: [Debian, Ubuntu](./install-debian) | [RHEL, CentOS Stream, Fedora](./install-rpm) | [Generic binary build](./install-generic-unix) | [Solaris](./install-solaris)
 * Windows: [Chocolatey package](https://community.chocolatey.org/packages/rabbitmq) | [Windows Installer](./install-windows) | [Binary build](./install-windows-manual)
 * MacOS: [Homebrew](./install-homebrew) | [Generic binary build](./install-generic-unix)
 * [Erlang/OTP for RabbitMQ](./which-erlang)

### Preview Releases

You can contribute to open source RabbitMQ by helping the community test [preview releases](https://github.com/rabbitmq/rabbitmq-server/releases).
They are marked as pre-releases on GitHub.


## VMware Tanzu RabbitMQ® (Commercial Editions)

 * [VMware Tanzu RabbitMQ®](https://docs.vmware.com/en/VMware-RabbitMQ/index.html). Tanzu RabbitMQ is available in many packages including OVA and OCI.
 * [VMware Tanzu RabbitMQ® on Kubernetes](https://docs.vmware.com/en/VMware-RabbitMQ-for-Kubernetes/index.html)
 * [VMware Tanzu RabbitMQ® for Tanzu Application Services](https://docs.vmware.com/en/VMware-RabbitMQ-for-Tanzu-Application-Service/index.html)


## Kubernetes

### RabbitMQ Cluster Kubernetes Operator

Open source [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/operator-overview) by VMware (developed [on GitHub](https://github.com/rabbitmq/cluster-operator)):

 * [quickstart guide](/kubernetes/operator/quickstart-operator)
 * [usage guide](/kubernetes/operator/using-operator)
 * [OpenShift-specific topics](/kubernetes/operator/using-on-openshift)
 * [examples](https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples)

### RabbitMQ Topology Kubernetes Operator

Open source [RabbitMQ Topology Kubernetes Operator](/kubernetes/operator/using-topology-operator) by VMware (developed [on GitHub](https://github.com/rabbitmq/messaging-topology-operator)):

 * [installation guide](/kubernetes/operator/install-topology-operator)
 * [usage guide](/kubernetes/operator/using-topology-operator)


Other guides related to Kubernetes:

 * A [peer discovery](./cluster-formation) mechanism [for Kubernetes](./cluster-formation#peer-discovery-k8s)


## Docker

 * Docker community-maintained [RabbitMQ Docker image](https://hub.docker.com/_/rabbitmq/) ([on GitHub](https://github.com/docker-library/rabbitmq/))


## Cloud

 * [VMware Tanzu RabbitMQ®](https://tanzu.vmware.com/rabbitmq)
 * [RabbitMQ Cluster Kubernetes Operator](/kubernetes/operator/install-operator) by VMware (developed [on GitHub](https://github.com/rabbitmq/cluster-operator))
 * [VMware Tanzu RabbitMQ® on Kubernetes](https://docs.vmware.com/en/VMware-Tanzu-RabbitMQ-for-Kubernetes/3.13/tanzu-rabbitmq-kubernetes/installation.html)
 * [Amazon MQ for RabbitMQ](https://aws.amazon.com/amazon-mq/)
 * [Amazon EC2](./ec2)

## Downloads [on GitHub](https://github.com/rabbitmq/rabbitmq-server/releases)

 * <a href={RabbitMQServerPackageURL({packageType: 'windows-installer'})}>Windows Installer</a>
 * <a href={RabbitMQServerPackageURL({packageType: 'debian'})}>Debian, Ubuntu</a>
 * <a href={RabbitMQServerPackageURL({packageType: 'rpm-el8'})}>RHEL, CentOS Stream 9.x, CentOS 8.x</a> | <a href={RabbitMQServerPackageURL({packageType: 'rpm-suse'})}>OpenSUSE</a> | zero dependency [Erlang RPM](https://github.com/rabbitmq/erlang-rpm)
 * <a href={RabbitMQServerPackageURL({packageType: 'generic-unix'})}>Generic UNIX binary</a>
 * <a href={RabbitMQServerPackageURL({packageType: 'windows-zip'})}>Windows binary</a>


## Debian (Apt) and RPM (Yum) Repositories

 * [Debian](./install-debian#apt-quick-start-cloudsmith)
 * [RPM](./install-rpm#cloudsmith)

## Provisioning Tools (Chef, Puppet, etc)

 * [Chef cookbook](https://github.com/rabbitmq/chef-cookbook)
 * [Puppet module](https://github.com/puppetlabs/puppetlabs-rabbitmq)
 * [Kurtosis Starlark package](https://github.com/kurtosis-tech/rabbitmq-package)


## Release Signing Key

 * [Release Signing Key](https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc) <code>0x6B73A36E6026DFCA</code> (on GitHub)
 * [How to Verify Release Artifact Signatures](./signatures)
 * [Release Signing Key](/rabbitmq-release-signing-key.asc) (alternative download location on rabbitmq.com)


## Client Libraries

### Java Client

 * On Maven Central: [RabbitMQ Java client](http://search.maven.org/#search%7Cgav%7C1%7Cg%3A%22com.rabbitmq%22%20AND%20a%3A%22amqp-client%22)
 * Quick download: <a href={`https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/${JavaClientVersion()}/amqp-client-${JavaClientVersion()}.jar`}>Maven.org</a>
 * [API guide](/client-libraries/java-api-guide)
 * [API reference](https://rabbitmq.github.io/rabbitmq-java-client/api/current/) (JavaDoc)
 * [License and other information](/client-libraries/java-client)
 * [Older versions](https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/)

### Java [Stream Protocol](./streams) Client

 * [RabbitMQ Stream Java client](https://github.com/rabbitmq/rabbitmq-stream-java-client)

### JMS Client

 * On Maven Central: [RabbitMQ JMS Client](http://search.maven.org/#search%7Cga%7C1%7Cg%3A%22com.rabbitmq.jms%22%20AND%20a%3A%22rabbitmq-jms%22)

### .NET/C# Client

 * On NuGet: [RabbitMQ .NET Client](https://www.nuget.org/packages/RabbitMQ.Client)
 * [API guide](/client-libraries/dotnet-api-guide)
 * [API reference](https://rabbitmq.github.io/rabbitmq-dotnet-client/)
 * [License and other information](/client-libraries/dotnet)
 * [Older versions](https://github.com/rabbitmq/rabbitmq-dotnet-client/releases)

### .NET/C# [Stream Protocol](./streams) Client

 * &#x2713; [RabbitMQ Stream .NET client](https://github.com/rabbitmq/rabbitmq-stream-dotnet-client)

### Erlang Client

 * On Hex.pm: [amqp_client](https://hex.pm/packages/amqp_client)

### Clients for Other Languages

The RabbitMQ community has created a large number of [clients and developer tools](/client-libraries/devtools)
covering a variety of platforms and languages.


## Community Plugins

For your convenience, we offer binary downloads of various
plugins developed by the community.

 * [Description of available plugins](/community-plugins)

## Snapshot (Alpha) Builds

Snapshot releases of the RabbitMQ broker
available to users who wish to experiment with the latest and
greatest features and bug fixes. For more details, head over to
the [snapshots page](./snapshots).
