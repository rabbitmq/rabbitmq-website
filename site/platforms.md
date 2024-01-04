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

# Supported Platforms

Our goal is for RabbitMQ to run on as wide a range of platforms as
possible. RabbitMQ can potentially run on any platform that provides
[a supported Erlang version](./which-erlang.html), from multi-core nodes and cloud-based
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

 * [Ubuntu and Debian-based](./install-debian.html) Linux distributions
 * [Fedora, RHEL, CentOS and RPM-based](./install-rpm.html) Linux distributions
 * [Windows Server](./install-windows.html)
 * [macOS](./install-generic-unix.html)
 * openSUSE Leap


## <a id="commercial-support" class="anchor" href="#commercial-support">Commercially Supported Platforms</a>

A list of platforms for which you can purchase commercial support for
RabbitMQ is available in the [Open Source RabbitMQ Support by VMware page](https://tanzu.vmware.com/rabbitmq/oss).


## <a id="windows" class="anchor" href="#windows">Windows</a>

RabbitMQ will run on any Windows version that [supported Erlang/OTP releases](./which-erlang.html)
can run on, both desktop and server editions. This includes Windows 10, Server 2012 through 2022.


## <a id="bsd" class="anchor" href="#bsd">Other Flavours of UNIX</a>

While not officially supported, Erlang and hence RabbitMQ can run on most
systems with a POSIX layer including FreeBSD, Solaris, NetBSD, OpenBSD
and many more.


## <a id="virtualization" class="anchor" href="#virtualization">Virtualized Platforms and Containers</a>

RabbitMQ can run on physical or virtual hardware, including many
IaaS providers and containers. This also allows unsupported platforms that are
able to emulate a supported platform to run RabbitMQ.

A number of companies offer RabbitMQ-as-a-service in multiple clouds. Please see  [Installation Guide](./download.html)
to learn more.


## <a id="unsupport" class="anchor" href="#unsupport">Unsupported Platforms</a>

Some platforms are not supported and probably never will be:

 * z/OS and most mainframes
 * Very memory-constrained systems (&lt; 32 MB of RAM)

If your platform is on this list or you need assistance then
please [contact VMware](contact.html).
