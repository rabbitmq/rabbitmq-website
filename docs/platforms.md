---
title: Supported Platforms
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

# Supported Platforms

Our goal is for RabbitMQ to run on as wide a range of platforms as
possible. RabbitMQ can potentially run on any platform that provides
[a supported Erlang version](./which-erlang), from multi-core nodes and cloud-based
deployments to embedded systems.

The following platforms are supported by Erlang and could therefore
run RabbitMQ:

 * Linux
 * Windows versions supported by Microsoft, e.g. 10
 * Windows Server versions supported by Microsoft, e.g. Windows Server 2019
 * macOS
 * Solaris
 * FreeBSD

The open source release of RabbitMQ is most commonly used and deployed on the
following platforms:

 * [Ubuntu and Debian-based](./install-debian) Linux distributions
 * [Fedora, RHEL, CentOS and RPM-based](./install-rpm) Linux distributions
 * [Windows Server](./install-windows)
 * [macOS](./install-generic-unix)
 * openSUSE Leap


## Commercially Supported Platforms {#commercial-support}

A list of platforms for which you can purchase commercial support for
RabbitMQ is available in the [Open Source RabbitMQ Support by VMware page](https://tanzu.vmware.com/rabbitmq/oss).


## Windows {#windows}

RabbitMQ will run on any Windows version that [supported Erlang/OTP releases](./which-erlang)
can run on, both desktop and server editions. This includes Windows 10, Server 2012 through 2022.


## Other Flavours of UNIX {#bsd}

While not officially supported, Erlang and hence RabbitMQ can run on most
systems with a POSIX layer including FreeBSD, Solaris, NetBSD, OpenBSD
and many more.


## Virtualized Platforms and Containers {#virtualization}

RabbitMQ can run on physical or virtual hardware, including many
IaaS providers and containers. This also allows unsupported platforms that are
able to emulate a supported platform to run RabbitMQ.

A number of companies offer RabbitMQ-as-a-service in multiple clouds. Please see  [Installation Guide](./download)
to learn more.


## Unsupported Platforms {#unsupport}

Some platforms are not supported:

 * z/OS and most mainframes
 * Very memory-constrained systems (with less than 100 MB of RAM)
