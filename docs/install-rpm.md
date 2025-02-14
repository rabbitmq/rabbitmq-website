---
title: Installing on RPM-based Linux
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

import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {
  RabbitMQServerPackageURL,
  RabbitMQServerPackageSigURL,
  RabbitMQServerPackageFilename,
} from '@site/src/components/RabbitMQServer';

# Installing on RPM-based Linux (RHEL, CentOS Stream, Fedora, Amazon Linux 2023)

## Overview {#overview}

This guide covers RabbitMQ installation on RPM-based Linux (Red Hat Enterprise Linux, CentOS Stream, Fedora).

The versions included into standard RPM-based distribution repositories can be
many releases behind [latest RabbitMQ releases](/release-information)
and may provide RabbitMQ versions that are already [out of support](/release-information).

Team RabbitMQ produces our own RPM packages and distributes them [using a Cloudsmith mirror](#cloudsmith).

There are two ways of installing these RPMs:

 * Installing the package using Yum repositories (this option is highly recommended) from a [Cloudsmith.io](#cloudsmith) mirror
 * [Downloading](#downloads) the package and installing it with `rpm`.
   This option will require manual installation of all [package dependencies](#package-dependencies) and makes upgrades more difficult.

Some of the topics covered in this guide are:

 * [Supported distributions](#supported-distributions)
 * Package installation from Yum repositories on a [Cloudsmith.io](#cloudsmith) mirror
 * How to install a [latest supported Erlang/OTP version](#install-erlang)
 * [Package dependencies](#package-dependencies)
 * [Privilege requirements](#sudo-requirements)
 * How to [manage the service](#managing-service) (start it, stop it, and get its status)
 * How to [inspect node and service logs](#server-logs)
 * [Direct download links](#downloads) for the RabbitMQ RPM package

and more.


## Supported Distributions {#supported-distributions}

RabbitMQ is supported on several major RPM-based distributions that are still actively maintained
by their primary vendor or developer group.

Note that modern versions of Erlang can have incompatibilities with older distributions (e.g. older than three to four years)
or ship without much or any testing on older distributions or OS kernel versions.

Older distributions can also lack a recent enough version of OpenSSL.
[Supported Erlang versions](./which-erlang) **cannot be used on distributions that do not provide OpenSSL 1.1** as a system library.
CentOS 7 and Fedora releases older than 26 are examples of such distributions.

Currently the list of supported RPM-based distributions includes

 * Fedora 39 through 41
 * [CentOS Stream](https://centos.org/centos-stream/) 9.x
 * RedHat Enterprise Linux 9.x and 8.x (versions covered by [full support](https://access.redhat.com/support/policy/updates/errata))
 * Amazon Linux 2023
 * Rocky Linux 9.x and 8.x ([supported versions](https://wiki.rockylinux.org/rocky/version/))
 * Alma Linux 9.x and 8.x ([supported versions](https://wiki.almalinux.org/release-notes/))
 * Oracle Linux 9.x and 8.x (latest minors only)

The packages may work on other RPM-based distributions
if [dependencies](#package-dependencies) are satisfied but their testing and support
is done on a best effort basis.


## User Privilege Requirements {#sudo-requirements}

RabbitMQ RPM package will require `sudo` privileges to install and manage.
In environments where `sudo` isn't available, consider using the
[generic binary build](./install-generic-unix).


## Install Erlang {#install-erlang}

Before installing RabbitMQ, you must install a [supported version](./which-erlang) of Erlang/OTP.
Standard Red Hat, CentOS Stream, and CentOS-derivative repositories provide Erlang versions that are typically [out of date](./which-erlang)
and cannot be used to run latest RabbitMQ releases.

There are three alternative sources for modern Erlang on RPM-based distributions:

 * Team RabbitMQ produces [a package](https://github.com/rabbitmq/erlang-rpm) stripped
   down to only provide those components needed to run
   RabbitMQ. This is the recommended option.
 * Fedora provides [up-to-date Erlang packages](https://packages.fedoraproject.org/pkgs/erlang/erlang/)
 * [Erlang Solutions](https://www.erlang-solutions.com/resources/download.html) produces packages that are usually reasonably up to
   date and involve installation of a potentially excessive list of dependencies

### Zero-dependency Erlang from RabbitMQ {#install-zero-dependency-rpm}

[Zero dependency Erlang RPM package for running RabbitMQ](https://github.com/rabbitmq/erlang-rpm)
can be installed from a [direct download](https://github.com/rabbitmq/erlang-rpm/releases) from GitHub,
as well as Yum repository, as described in its README.

As the name suggests, the package strips off some Erlang modules and dependencies
that are not essential for running RabbitMQ.

## Package Dependencies {#package-dependencies}

When installing with Yum, all dependencies other than Erlang/OTP should be resolved and installed automatically
as long as compatible versions are available. When that's not the case, dependency packages must be installed manually.

However, when installing a local RPM file via `yum` dependencies must be installed
manually. The dependencies are:

 * `erlang`: a [supported version of Erlang](./which-erlang) can be installed from a number of [repositories](#install-erlang)
 * `logrotate`


## Install Using a Cloudsmith Mirror Yum Repository {#cloudsmith}

A Yum repository with RabbitMQ packages is available from Cloudsmith and a mirror
of the repositories there.

The rest of this section will demonstrate how to set up a repository file
that will use a mirror. Repositories on Cloudsmith are subject to traffic quotas
but the mirror is not.

### Install RabbitMQ and Cloudsmith Signing Keys

Yum will verify signatures of any packages it installs, therefore the first step
in the process is to import the signing key

```bash
## primary RabbitMQ signing key
rpm --import 'https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc'
## modern Erlang repository
rpm --import 'https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key'
## RabbitMQ server repository
rpm --import 'https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key'
```

### Add Yum Repositories for RabbitMQ and Modern Erlang

In order to use the Yum repository, a `.repo` file (e.g. `rabbitmq.repo`) has to be
added under the `/etc/yum.repos.d/` directory.

:::important
The contents of the repository file will vary slightly between distribution families.
Make sure to use the appropriate tab below.
:::

:::important
These repository mirrors only provide 64-bit x86 (`amd64`) packages of Erlang.
64-bit ARM (`aarch64`) Erlang packages must be [downloaded from GitHub](https://github.com/rabbitmq/erlang-rpm/releases)
and installed with `rpm` directly as explained in the [zero dependency Erlang RPM package README](https://github.com/rabbitmq/erlang-rpm/blob/erlang-26/README.md#direct-downloads-from-github).
:::

The contents of the file will vary slightly between distribution families:

 * Most recent distributions: modern Fedora Releases, Red Hat 9, CentOS Stream 9, Rocky Linux 9, Alma Linux 9
 * Older distribution: RHEL 8, Rocky Linux 8, Alma Linux 8, Amazon Linux 2023, older Fedora Releases


<Tabs groupId="distribution-family-specific">
<TabItem value="modern-oses" label="Modern Fedora Releases, Red Hat 9, CentOS Stream 9, Rocky Linux 9, Amazon Linux 2023, Oracle Linux 9, Alma Linux 9">

The following example sets up a repository that will install RabbitMQ and its Erlang dependency from
a Cloudsmith mirror, and targets RHEL 9, CentOS Stream 9, Amazon Linux 2023, modern Fedora releases, Rocky Linux 9, Alma Linux 9, Oracle Linux 9.

These repository mirrors only provide 64-bit x86 (`amd64`) packages of Erlang.

```ini
# In /etc/yum.repos.d/rabbitmq.repo

##
## Zero dependency Erlang RPM
##

[modern-erlang]
name=modern-erlang-el9
# Use a set of mirrors maintained by the RabbitMQ core team.
# The mirrors have significantly higher bandwidth quotas.
baseurl=https://yum1.rabbitmq.com/erlang/el/9/$basearch
        https://yum2.rabbitmq.com/erlang/el/9/$basearch
repo_gpgcheck=1
enabled=1
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[modern-erlang-noarch]
name=modern-erlang-el9-noarch
# Use a set of mirrors maintained by the RabbitMQ core team.
# The mirrors have significantly higher bandwidth quotas.
baseurl=https://yum1.rabbitmq.com/erlang/el/9/noarch
        https://yum2.rabbitmq.com/erlang/el/9/noarch
repo_gpgcheck=1
enabled=1
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key
       https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[modern-erlang-source]
name=modern-erlang-el9-source
# Use a set of mirrors maintained by the RabbitMQ core team.
# The mirrors have significantly higher bandwidth quotas.
baseurl=https://yum1.rabbitmq.com/erlang/el/9/SRPMS
        https://yum2.rabbitmq.com/erlang/el/9/SRPMS
repo_gpgcheck=1
enabled=1
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key
       https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1


##
## RabbitMQ Server
##

[rabbitmq-el9]
name=rabbitmq-el9
baseurl=https://yum2.rabbitmq.com/rabbitmq/el/9/$basearch
        https://yum1.rabbitmq.com/rabbitmq/el/9/$basearch
repo_gpgcheck=1
enabled=1
# Cloudsmith's repository key and RabbitMQ package signing key
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key
       https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq-el9-noarch]
name=rabbitmq-el9-noarch
baseurl=https://yum2.rabbitmq.com/rabbitmq/el/9/noarch
        https://yum1.rabbitmq.com/rabbitmq/el/9/noarch
repo_gpgcheck=1
enabled=1
# Cloudsmith's repository key and RabbitMQ package signing key
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key
       https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq-el9-source]
name=rabbitmq-el9-source
baseurl=https://yum2.rabbitmq.com/rabbitmq/el/9/SRPMS
        https://yum1.rabbitmq.com/rabbitmq/el/9/SRPMS
repo_gpgcheck=1
enabled=1
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key
gpgcheck=0
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md
```
</TabItem>

<TabItem value="older-oses" label="RHEL 8, Rocky Linux 8, Alma Linux 8, Oracle Linux 8, Older Fedora Releases">
The following example sets up a repository that will install RabbitMQ and its Erlang dependency from
a Cloudsmith mirror, and targets RHEL 8, Rocky Linux 8, Alma Linux 8. The same repository definition **can be used by older Fedora releases**.

These repository mirrors only provide 64-bit x86 (`amd64`) packages of Erlang.

```ini
# In /etc/yum.repos.d/rabbitmq.repo

##
## Zero dependency Erlang RPM
##

[modern-erlang]
name=modern-erlang-el8
# Use a set of mirrors maintained by the RabbitMQ core team.
# The mirrors have significantly higher bandwidth quotas.
baseurl=https://yum1.rabbitmq.com/erlang/el/8/$basearch
        https://yum2.rabbitmq.com/erlang/el/8/$basearch
repo_gpgcheck=1
enabled=1
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[modern-erlang-noarch]
name=modern-erlang-el8-noarch
# Use a set of mirrors maintained by the RabbitMQ core team.
# The mirrors have significantly higher bandwidth quotas.
baseurl=https://yum1.rabbitmq.com/erlang/el/8/noarch
        https://yum2.rabbitmq.com/erlang/el/8/noarch
repo_gpgcheck=1
enabled=1
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key
       https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[modern-erlang-source]
name=modern-erlang-el8-source
# Use a set of mirrors maintained by the RabbitMQ core team.
# The mirrors have significantly higher bandwidth quotas.
baseurl=https://yum1.rabbitmq.com/erlang/el/8/SRPMS
        https://yum2.rabbitmq.com/erlang/el/8/SRPMS
repo_gpgcheck=1
enabled=1
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key
       https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1


##
## RabbitMQ Server
##

[rabbitmq-el8]
name=rabbitmq-el8
baseurl=https://yum2.rabbitmq.com/rabbitmq/el/8/$basearch
        https://yum1.rabbitmq.com/rabbitmq/el/8/$basearch
repo_gpgcheck=1
enabled=1
# Cloudsmith's repository key and RabbitMQ package signing key
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key
       https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq-el8-noarch]
name=rabbitmq-el8-noarch
baseurl=https://yum2.rabbitmq.com/rabbitmq/el/8/noarch
        https://yum1.rabbitmq.com/rabbitmq/el/8/noarch
repo_gpgcheck=1
enabled=1
# Cloudsmith's repository key and RabbitMQ package signing key
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key
       https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq-el8-source]
name=rabbitmq-el8-source
baseurl=https://yum2.rabbitmq.com/rabbitmq/el/8/SRPMS
        https://yum1.rabbitmq.com/rabbitmq/el/8/SRPMS
repo_gpgcheck=1
enabled=1
gpgkey=https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key
gpgcheck=0
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md
```
</TabItem>
</Tabs>


### Install Packages with dnf (yum)

Update package metadata:

```bash
dnf update -y
```

Next install dependencies from the standard repositories:

```bash
## install these dependencies from standard OS repositories
dnf install -y logrotate
```

Finally, install modern Erlang and RabbitMQ:

```bash
## install RabbitMQ and zero dependency Erlang
dnf install -y erlang rabbitmq-server
```


## Package Version Locking in On RPM-based Distributions {#rpm-version-locking}

[yum version locking](https://access.redhat.com/solutions/98873) plugin can
be used to prevent unexpected package upgrades. Using it carries the risk of leaving
the system behind in terms of [updates](/release-information), including important bug fixes
and security patches.


## With rpm and a Direct Download {#with-rpm}

After [downloading](#downloads) the server package, issue the following command as
'root':

<CodeBlock language="bash">
{`rpm --import https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc

## install these dependencies from standard OS repositories
dnf install -y logrotate

# The RabbitMQ RPM package is suitable for both RHEL 9 (modern) and RHEL 8-based (older) distributions
dnf install -y ${RabbitMQServerPackageFilename({packageType: 'rpm-el8'})}`}
</CodeBlock>

[RabbitMQ public signing key](./signatures) can also be [downloaded from rabbitmq.com](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc):

<CodeBlock language="bash">
{`rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc

## install these dependencies from standard OS repositories
dnf install -y logrotate

# The RabbitMQ RPM package is suitable for both RHEL 9 (modern) and RHEL 8-based (older) distributions
dnf install -y ${RabbitMQServerPackageFilename({packageType: 'rpm-el8'})}`}
</CodeBlock>


## How to Clean Local dnf Cache {#clear-cache}

In some rare cases new versions available in RPM repositories will not be visible
to `dnf install` even after running `dnf update`.

In this case, clearing the local cache may be necessary:

```bash
dnf clean metadata

dnf clean dbcache

dnf clean all
```

After clearing the cache, `dnf` will have to re-download all metadata from all
repositories, including the standard ones for the distribution. This can take
some time.


## Direct Downloads {#downloads}

In some cases it may be easier to download the package and install it manually. The package can be downloaded
from [GitHub](https://github.com/rabbitmq/rabbitmq-server/releases).

| Description | Download | Signature |
|-------------|----------|-----------|
| RPM for Fedora 38+, RHEL Linux 8.x and 9.x, CentOS Stream 9, Rocky Linux 9, Alma Linux 9, Amazon Linux 2023 | <a href={RabbitMQServerPackageURL({packageType: 'rpm-el8'})}>{RabbitMQServerPackageFilename({packageType: 'rpm-el8'})}</a> | <a href={RabbitMQServerPackageSigURL({packageType: 'rpm-el8'})}>Signature</a> |


## Run RabbitMQ Server {#running-rpm}

### Start the Server

The server is not started as a daemon by default when the
RabbitMQ server package is installed. To start the daemon by default
when the system boots, as an administrator run

```bash
systemctl enable rabbitmq-server
```

As an administrator, start and stop the
server as usual, e.g. using `systemctl`:

```bash
systemctl start rabbitmq-server

systemctl status  rabbitmq-server

systemctl stop rabbitmq-server
```


## Configuring RabbitMQ {#configuration}

On most systems, a node should be able to start and run with all defaults.
Please refer to the [Configuration guide](./configure) to learn more
and [Deployment Guidelines](./production-checklist) for guidelines beyond
development environments.

Note: the node is set up to run as system user `rabbitmq`.
If [location of the node database or the logs](./relocate) is changed,
the files and directories must be owned by this user.


<a id="ports"></a>

RabbitMQ nodes bind to ports (open server TCP sockets) in order to accept client
and CLI tool connections. Other processes and tools such as SELinux may prevent
RabbitMQ from binding to a port. When that happens, the node will fail to start.
Refer to the [Networking Guide](./networking#ports) for more details.

## Default User Access {#default-user-access}

The broker creates a user `guest` with password
`guest`. Unconfigured clients will in general use these
credentials. <strong>By default, these credentials can only be
used when connecting to the broker as localhost</strong> so you
will need to take action before connecting from any other
machine.

See the documentation on [access control](./access-control) for information on how to create more users and delete
the `guest` user.


## Controlling System Limits on Linux {#kernel-resource-limits}

RabbitMQ installations running production workloads may need system
limits and kernel parameters tuning in order to handle a decent number of
concurrent connections and queues. The main setting that needs adjustment
is the max number of open files, also known as `ulimit -n`.
The default value on many operating systems is too low for a messaging
broker (`1024` on several Linux distributions). We recommend allowing
for at least 65536 file descriptors for user `rabbitmq` in
production environments. 4096 should be sufficient for many development
workloads.

There are two limits in play: the maximum number of open files the OS kernel
allows (`fs.file-max`) and the per-user limit (`ulimit -n`).
The former must be higher than the latter.

### With systemd (Recent Linux Distributions) {#max-open-files-limit}

On distributions that use systemd, the OS limits are controlled via
a configuration file at `/etc/systemd/system/rabbitmq-server.service.d/limits.conf`.
For example, to set the max open file handle limit (`nofile`) to `64000`:

```ini
[Service]
LimitNOFILE=64000
```

If `LimitNOFILE` is set to a value higher than 65536, [the `ERL_MAX_PORTS` environment variable](./networking#erl-max-ports) must be
updated accordingly to increase a [runtime](./runtime) limit.

See [systemd documentation](https://www.freedesktop.org/software/systemd/man/systemd.exec.html) to learn about
the supported limits and other directives.

### With Docker

To configure kernel limits for Docker contains, use the `"default-ulimits"` key in [Docker daemon configuration file](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file).
The file has to be installed on Docker hosts at `/etc/docker/daemon.json`:

```json
{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
```

If the limits above are set to a value higher than 65536,
[the `ERL_MAX_PORTS` environment variable](./networking#erl-max-ports) must be updated accordingly to increase a [runtime](./runtime) limit.

### Without systemd (Older Linux Distributions)

The most straightforward way to adjust the per-user limit for
RabbitMQ on distributions that do not use systemd is to edit the `/etc/default/rabbitmq-server`
(provided by the RabbitMQ Debian package) or [rabbitmq-env.conf](./configure)
to invoke `ulimit` before the service is started.

```bash
ulimit -S -n 64000
```

This `soft` limit cannot go higher than the `hard` limit (which defaults to 4096 in many distributions).
[The hard limit can be increased](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md) via
`/etc/security/limits.conf`. This also requires enabling the [pam_limits.so](http://askubuntu.com/a/34559) module
and re-login or reboot. Note that limits cannot be changed for running OS processes.

If the limits above are set to a value higher than 65536,
[the `ERL_MAX_PORTS` environment variable](./networking#erl-max-ports) must be updated accordingly to increase a [runtime](./runtime) limit.

For more information about controlling `fs.file-max`
with `sysctl`, please refer to the excellent
[Riak guide on open file limit tuning](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md#debian--ubuntu).

### Verifying the Limit {#verifying-limits}

[RabbitMQ management UI](./management) displays the number of file descriptors available
for it to use on the Overview tab.

```bash
rabbitmq-diagnostics status
```

includes the same value.

The following command

```bash
cat /proc/$RABBITMQ_BEAM_PROCESS_PID/limits
```

can be used to display effective limits of a running process. `$RABBITMQ_BEAM_PROCESS_PID`
is the OS PID of the Erlang VM running RabbitMQ, as returned by `rabbitmq-diagnostics status`.

### Configuration Management Tools {#chef-puppet-bosh}

Configuration management tools (e.g. Chef, Puppet, BOSH) provide assistance
with system limit tuning. Our [developer tools](/client-libraries/devtools) guide
lists relevant modules and projects.


## Managing the Service {#managing-service}

To start and stop the server, use the `service` tool.
The service name is `rabbitmq-server`:

```bash
# stop the local node
sudo service rabbitmq-server stop

# start it back
sudo service rabbitmq-server start
```

`service rabbitmq-server status` will report service status
as observed by systemd (or similar service manager):

```bash
# check on service status as observed by service manager
sudo service rabbitmq-server status
```

It will produce output similar to this:

```ini
Redirecting to /bin/systemctl status rabbitmq-server.service
● rabbitmq-server.service - RabbitMQ broker
   Loaded: loaded (/usr/lib/systemd/system/rabbitmq-server.service; enabled; vendor preset: disabled)
  Drop-In: /etc/systemd/system/rabbitmq-server.service.d
           └─limits.conf
   Active: active (running) since Wed 2021-05-22 10:21:32 UTC; 25s ago
 Main PID: 957 (beam.smp)
   Status: "Initialized"
   CGroup: /system.slice/rabbitmq-server.service
           ├─ 957 /usr/lib/erlang/erts-10.2/bin/beam.smp -W w -A 64 -MBas ageffcbf -MHas ageffcbf -MBlmbcs 512 -MHlmbcs 512 -MMmcs 30 -P 1048576 -t 5000000 -stbt db -zdbbl 128000 -K true -- -root /usr/lib/erlang -progname erl -- -home /var/lib/rabbitmq -- ...
           ├─1411 /usr/lib/erlang/erts-10.2/bin/epmd -daemon
           ├─1605 erl_child_setup 400000
           ├─2860 inet_gethost 4
           └─2861 inet_gethost 4

Aug 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##  ##
Aug 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##  ##      RabbitMQ 4.0.6. Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.
Aug 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##########  Licensed under the MPL 2.0. Website: https://www.rabbitmq.com/
Aug 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ######  ##
Aug 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##########  Logs: /var/log/rabbitmq/rabbit@localhost.log
Aug 26 10:21:30 localhost.localdomain rabbitmq-server[957]: /var/log/rabbitmq/rabbit@localhost_upgrade.log
Aug 26 10:21:30 localhost.localdomain rabbitmq-server[957]: Starting broker...
Aug 26 10:21:32 localhost.localdomain rabbitmq-server[957]: systemd unit for activation check: "rabbitmq-server.service"
Aug 26 10:21:32 localhost.localdomain systemd[1]: Started RabbitMQ broker.
Aug 26 10:21:32 localhost.localdomain rabbitmq-server[957]: completed with 6 plugins.
```

`rabbitmqctl`, `rabbitmq-diagnostics`,
and other [CLI tools](./cli) will be available in `PATH` and can be invoked by a `sudo`-enabled user:

```bash
# checks if the local node is running and CLI tools can successfully authenticate with it
sudo rabbitmq-diagnostics ping

# prints enabled components (applications), TCP listeners, memory usage breakdown, alarms
# and so on
sudo rabbitmq-diagnostics status

# prints cluster membership information
sudo rabbitmq-diagnostics cluster_status

# prints effective node configuration
sudo rabbitmq-diagnostics environment
```

All `rabbitmqctl` commands will report an error if no node is running.
See the [CLI tools](./cli) and [Monitoring](./monitoring) guides to learn more.


## Log Files and Management {#server-logs}

[Server logs](./logging) can be found under the [configurable](./relocate) directory, which usually
defaults to `/var/log/rabbitmq` when RabbitMQ is installed via a Linux package manager.

`RABBITMQ_LOG_BASE` can be used to override [log directory location](./relocate).

Assuming a `systemd`-based distribution, system service logs can be
inspected using

```bash
journalctl --system
```

which requires superuser privileges.
Its output can be filtered to narrow it down to RabbitMQ-specific entries:

```bash
sudo journalctl --system | grep rabbitmq
```

The output will look similar to this:

```ini
Aug 26 11:03:04 localhost rabbitmq-server[968]: ##  ##
Aug 26 11:03:04 localhost rabbitmq-server[968]: ##  ##      RabbitMQ 4.0.6. Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.
Aug 26 11:03:04 localhost rabbitmq-server[968]: ##########  Licensed under the MPL 2.0. Website: https://www.rabbitmq.com/
Aug 26 11:03:04 localhost rabbitmq-server[968]: ######  ##
Aug 26 11:03:04 localhost rabbitmq-server[968]: ##########  Logs: /var/log/rabbitmq/rabbit@localhost.log
Aug 26 11:03:04 localhost rabbitmq-server[968]: /var/log/rabbitmq/rabbit@localhost_upgrade.log
Aug 26 11:03:04 localhost rabbitmq-server[968]: Starting broker...
Aug 26 11:03:05 localhost rabbitmq-server[968]: systemd unit for activation check: "rabbitmq-server.service"
Aug 26 11:03:06 localhost rabbitmq-server[968]: completed with 6 plugins.
```

### Log Rotation

The broker always appends to the [log files](./logging), so a complete log history is retained.

[logrotate](https://linux.die.net/man/8/logrotate) is the recommended way of log file rotation and compression.
By default, the package will set up `logrotate` to run weekly on files located in default
`/var/log/rabbitmq` directory. Rotation configuration can be found in
`/etc/logrotate.d/rabbitmq-server`.
