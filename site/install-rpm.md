<!--
Copyright (c) 2007-2021 VMware, Inc. or its affiliates.

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

# Installing on RPM-based Linux (RedHat Enterprise Linux, CentOS, Fedora, openSUSE)

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers RabbitMQ installation on RPM-based Linux (RedHat Enterprise Linux, CentOS, Fedora, openSUSE).

RabbitMQ is included in standard Fedora and RHEL repositories.
However, the versions included are
many releases behind [latest RabbitMQ releases](changelog.html)
and may provide RabbitMQ versions that are already [out of support](versions.html).

Team RabbitMQ produces our own RPM packages and distributes them [using Cloudsmith](#apt-cloudsmith) and [PackageCloud](#apt-packagecloud).

There are two ways of installing these RPMs:

 * Installing the package using Yum repositories (this option is highly recommended) on [Cloudsmith.io](#cloudsmith) or [PackageCloud](#package-cloud)
 * [Downloading](#downloads) the package and installing it with `rpm`. This option will require manual installation of all [package dependencies](#package-dependencies).

The following guide focuses on RabbitMQ installation on RPM-based distributions
such as Fedora, RHEL and CentOS. It covers a number of topics:

 * Package installation from Yum repositories on [Cloudsmith.io](#cloudsmith) and [PackageCloud](#package-cloud)
 * How to install a [latest supported Erlang/OTP version](#install-erlang)
 * [Package dependencies](#package-dependencies)
 * [Supported distributions](#supported-distributions)
 * [Privilege requirements](#sudo-requirements)
 * How to [manage the service](#managing-service)
 * How to [inspect node and service logs](#server-logs)
 * Installation on [older distributions](#yum-legacy)
 * [Package downloads](#downloads)

and more.


## <a id="overview" class="anchor" href="#overview">Overview</a>

The package is distributed via Yum repositories on [PackageCloud](https://packagecloud.io/rabbitmq/rabbitmq-server/).

`rabbitmq-server` is included in Fedora. However,
the versions included often lag behind RabbitMQ releases.
It is recommended that you use Yum repositories from [PackageCloud](https://packagecloud.io/rabbitmq/rabbitmq-server/).

Check the [Fedora package](https://admin.fedoraproject.org/updates/rabbitmq-server) details for which version of the server is
available for which versions of the distribution.


## <a id="supported-distributions" class="anchor" href="#supported-distributions">Supported Distributions</a>

RabbitMQ is supported on several major RPM-based distributions that are still actively maintained
by their primary vendor or developer group.

Note that modern versions of Erlang can have incompatibilities with older distributions (e.g. older than three to four years)
or ship without much or any testing on older distributions or OS kernel versions.

Older distributions can also lack a recent enough version of OpenSSL.
Erlang 24 **cannot be used on distributions that do not provide OpenSSL 1.1** as a system library.
CentOS 7 and Fedora releases older than 26 are examples of such distributions.

Currently the list of supported RPM-based distributions includes

 * CentOS Linux 8.x and [CentOS Stream](https://centos.org/centos-stream/) 8.x
 * RedHat Enterprise Linux 8.x
 * Fedora 32 through 34 (use the CentOS 8.x package)

The packages may work on other RPM-based distributions
if [dependencies](#package-dependencies) are satisfied but their testing and support
is done on a best effort basis.


## <a id="sudo-requirements" class="anchor" href="#sudo-requirements">User Privilege Requirements</a>

RabbitMQ RPM package will require `sudo` privileges to install and manage.
In environments where `sudo` isn't available, consider using the
[generic binary build](install-generic-unix.html).

## <a id="install-erlang" class="anchor" href="#install-erlang">Install Erlang</a>

Before installing RabbitMQ, you must install a [supported version](which-erlang.html) of Erlang/OTP.
Standard Red Hat, Fedora, CentOS repositories provide Erlang versions that are typically [out of date](which-erlang.html)
and cannot be used to run latest RabbitMQ releases.

There are three alternative sources for modern Erlang on RPM-based distributions:

 * Team RabbitMQ produces [a package](https://github.com/rabbitmq/erlang-rpm) stripped
   down to only provide those components needed to run
   RabbitMQ. This is the recommended option.
 * [openSUSE](https://www.opensuse.org/) produces [Erlang packages](https://software.opensuse.org/download.html?project=devel%3Alanguages%3Aerlang%3AFactory&package=erlang) for both openSUSE and SLES
 * [Erlang Solutions](https://www.erlang-solutions.com/resources/download.html) produces packages that are usually reasonably up to
   date and involve installation of a potentially excessive list of dependencies

### <a id="install-zero-dependency-rpm" class="anchor" href="#install-zero-dependency-rpm">Zero-dependency Erlang from RabbitMQ</a>

[Zero dependency Erlang RPM package for running RabbitMQ](https://github.com/rabbitmq/erlang-rpm)
can be installed from a [direct download](https://github.com/rabbitmq/erlang-rpm/releases) from GitHub,
as well as Yum repositories on [Cloudsmith.io](https://cloudsmith.io/~rabbitmq/repos/rabbitmq-erlang/setup/#formats-rpm) and [PackageCloud](https://packagecloud.io/rabbitmq/erlang).

As the name suggests, the package strips off some Erlang modules and dependencies
that are not essential for running RabbitMQ.

### <a id="install-from-suse-repository" class="anchor" href="#install-from-suse-repository">Erlang packages from openSUSE</a>

openSUSE package repositories provide Erlang so it can be installed using Zypper:

<pre class="lang-bash">
sudo zypper in erlang
</pre>

Erlang versions available in the standard repositories will in practice be behind the most recent version.
To use the last version with the newest features, add the
[openSUSE Factory repositories for Erlang](http://download.opensuse.org/repositories/devel:/languages:/erlang:/Factory/):

<pre class="lang-bash">
# add the openSUSE erlang factory, obs:// extracts the http url for the matching distro.
sudo zypper ar -f  obs://devel:languages:erlang:Factory openSUSE-Erlang-Factory

# import the signing key and refresh the repository
sudo zypper --gpg-auto-import-keys refresh

# install a recent Erlang version
sudo zypper in erlang
</pre>

## <a id="package-dependencies" class="anchor" href="#package-dependencies">Package Dependencies</a>

When installing with Yum, all dependencies other than Erlang/OTP should be resolved and installed automatically
as long as compatible versions are available. When that's not the case, dependency packages must be installed manually.

However, when installing a local RPM file via `yum` dependencies must be installed
manually. The dependencies are:

 * `erlang`: a [supported version of Erlang](which-erlang.html) can be installed from a number of [repositories](#install-erlang)
 * `socat`
 * `logrotate`


## <a id="package-cloud" class="anchor" href="#package-cloud">Install Using PackageCloud Yum Repository</a>

A Yum repository with RabbitMQ packages is available from PackageCloud.
Package Cloud also can be used to [install a recent Erlang version via yum](https://packagecloud.io/rabbitmq/erlang/install#bash-rpm).

A quick way to set up the repository is to use a [Package Cloud-provided script](https://packagecloud.io/rabbitmq/rabbitmq-server/install#bash-rpm).
It is not a requirement and should be carefully considered since it pipes a generated script from
the public Internet to a privileged shell.

<pre class="lang-bash">
## Uses a PackageCloud-provided Yum repository setup script.
## Always verify what is downloaded before piping it to a privileged shell!
curl -s https://packagecloud.io/install/repositories/rabbitmq/rabbitmq-server/script.rpm.sh | sudo bash
</pre>

The rest of this section guide will focus on a more traditional way that explicitly installs a Yum repository file.

Yum will verify signatures of any packages it installs, therefore the first step
in the process is to import the signing key

<pre class="lang-bash">
## primary RabbitMQ signing key
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
## modern Erlang repository
rpm --import https://packagecloud.io/rabbitmq/erlang/gpgkey
## RabbitMQ server repository
rpm --import https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
</pre>

### Add Yum Repositories for RabbitMQ and Modern Erlang

In order to use the Yum repository, a `.repo` file (e.g. `rabbitmq.repo`) has to be
added under the `/etc/yum.repos.d/` directory. The contents of the file will vary slightly
between distributions (e.g. CentOS 8 and 7 vs. OpenSUSE).

#### Red Hat 8, CentOS 8, Modern Fedora Releases

The following example sets up a repository that will install RabbitMQ and its Erlang dependency from PackageCloud,
and targets **CentOS 8**. The same repository definition **can be used by recent Fedora releases**.

<pre class="lang-ini">
# In /etc/yum.repos.d/rabbitmq.repo

##
## Zero dependency Erlang
##

[rabbitmq_erlang]
name=rabbitmq_erlang
baseurl=https://packagecloud.io/rabbitmq/erlang/el/8/$basearch
repo_gpgcheck=1
gpgcheck=1
enabled=1
# PackageCloud's repository key and RabbitMQ package signing key
gpgkey=https://packagecloud.io/rabbitmq/erlang/gpgkey
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300

[rabbitmq_erlang-source]
name=rabbitmq_erlang-source
baseurl=https://packagecloud.io/rabbitmq/erlang/el/8/SRPMS
repo_gpgcheck=1
gpgcheck=0
enabled=1
# PackageCloud's repository key and RabbitMQ package signing key
gpgkey=https://packagecloud.io/rabbitmq/erlang/gpgkey
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300

##
## RabbitMQ server
##

[rabbitmq_server]
name=rabbitmq_server
baseurl=https://packagecloud.io/rabbitmq/rabbitmq-server/el/8/$basearch
repo_gpgcheck=1
gpgcheck=0
enabled=1
# PackageCloud's repository key and RabbitMQ package signing key
gpgkey=https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300

[rabbitmq_server-source]
name=rabbitmq_server-source
baseurl=https://packagecloud.io/rabbitmq/rabbitmq-server/el/8/SRPMS
repo_gpgcheck=1
gpgcheck=0
enabled=1
gpgkey=https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
</pre>

#### OpenSUSE

The following example targets OpenSUSE and only installs the RabbitMQ package repository.
Erlang is assumed to be provisioned from the [`devel:languages:erlang:Factory`](https://software.opensuse.org/download.html?project=devel%3Alanguages%3Aerlang%3AFactory&package=erlang) repository.

<pre class="lang-ini">
[rabbitmq_rabbitmq-server]
name=rabbitmq_rabbitmq-server
baseurl=https://packagecloud.io/rabbitmq/rabbitmq-server/opensuse/15.1/$basearch
enabled=1
repo_gpgcheck=1
pkg_gpgcheck=0
gpgkey=https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
autorefresh=1
type=rpm-md

[rabbitmq_rabbitmq-server-source]
name=rabbitmq_rabbitmq-server-source
baseurl=https://packagecloud.io/rabbitmq/rabbitmq-server/opensuse/15.1/SRPMS
enabled=1
repo_gpgcheck=1
pkg_gpgcheck=0
gpgkey=https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
autorefresh=1
type=rpm-md
</pre>

### Install Packages with Yum

#### CentOS 8, RHEL 8, Modern Fedora

Update Yum package metadata:

<pre class="lang-bash">
yum update -y
yum -q makecache -y --disablerepo='*' --enablerepo='rabbitmq_erlang' --enablerepo='rabbitmq_server'
</pre>

Next install dependencies from the standard repositories:

<pre class="lang-bash">
## install these dependencies from standard OS repositories
yum install socat logrotate -y
</pre>

Finally, install modern Erlang and RabbitMQ:

<pre class="lang-bash">
## install RabbitMQ and zero dependency Erlang from the above repositories,
## ignoring any versions provided by the standard repositories
yum install --repo rabbitmq_erlang --repo rabbitmq_server erlang rabbitmq-server -y
</pre>


### Install Packages with Zypper

First, update Zypper package metadata:

<pre class="lang-bash">
## refresh the repository. These verbose repository names are used by PackageCloud
zypper --gpg-auto-import-keys refresh rabbitmq_rabbitmq-server
zypper --gpg-auto-import-keys refresh rabbitmq_rabbitmq-server-source
</pre>

Then install the packages:

<pre class="lang-bash">
## install the package from PackageCloud repository
zypper install --repo rabbitmq_rabbitmq-server rabbitmq-server
</pre>



## <a id="cloudsmith" class="anchor" href="#cloudsmith">Install Using Cloudsmith Yum Repository</a>

A Yum repository with RabbitMQ packages is available from Cloudsmith.
Cloudsmith also can be used to [install a recent Erlang version via yum](https://cloudsmith.io/~rabbitmq/repos/rabbitmq-erlang/setup/#formats-rpm).

A quick way to set up the repository is to use a [Cloudsmith-provided script](https://cloudsmith.io/~rabbitmq/repos/rabbitmq-server/setup/#formats-rpm).
It is not a requirement and should be carefully considered since it pipes a generated script from
the public Internet to a privileged shell.

<pre class="lang-bash">
## Uses a Cloudsmith-provided Yum repository setup script.
## Always verify what is downloaded before piping it to a privileged shell!
curl -1sLf 'https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/setup.rpm.sh' | sudo -E bash
</pre>

The rest of this section will focus on a more traditional way that explicitly installs a Yum repository file.

Yum will verify signatures of any packages it installs, therefore the first step
in the process is to import the signing key

<pre class="lang-bash">
## primary RabbitMQ signing key
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
## modern Erlang repository
rpm --import 'https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/gpg.E495BB49CC4BBE5B.key'
## RabbitMQ server repository
rpm --import 'https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.9F4587F226208342.key'
</pre>

### Add Yum Repositories for RabbitMQ and Modern Erlang

In order to use the Yum repository, a `.repo` file (e.g. `rabbitmq.repo`) has to be
added under the `/etc/yum.repos.d/` directory. The contents of the file will vary slightly
between distributions (e.g. CentOS 8 and 7 vs. OpenSUSE).

#### Red Hat 8, CentOS 8, Modern Fedora Releases

The following example sets up a repository that will install RabbitMQ and its Erlang dependency from Cloudsmith,
and targets **CentOS 8**. The same repository definition **can be used by recent Fedora releases**.

<pre class="lang-ini">
# In /etc/yum.repos.d/rabbitmq.repo

##
## Zero dependency Erlang RPM
##

[rabbitmq_erlang]
name=rabbitmq_erlang
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/rpm/el/8/$basearch
repo_gpgcheck=1
enabled=1
# Cloudsmith's repository key and RabbitMQ package signing key
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/gpg.E495BB49CC4BBE5B.key
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq_erlang-noarch]
name=rabbitmq_erlang-noarch
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/rpm/el/8/noarch
repo_gpgcheck=1
enabled=1
# Cloudsmith's repository key and RabbitMQ package signing key
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/gpg.E495BB49CC4BBE5B.key
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq_erlang-source]
name=rabbitmq_erlang-source
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/rpm/el/8/SRPMS
repo_gpgcheck=1
enabled=1
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/gpg.E495BB49CC4BBE5B.key
gpgcheck=0
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md


##
## RabbitMQ Server
##

[rabbitmq_server]
name=rabbitmq_server
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/rpm/el/8/$basearch
repo_gpgcheck=1
enabled=1
# Cloudsmith's repository key and RabbitMQ package signing key
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.9F4587F226208342.key
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq_server-noarch]
name=rabbitmq_server-noarch
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/rpm/el/8/noarch
repo_gpgcheck=1
enabled=1
# Cloudsmith's repository key and RabbitMQ package signing key
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.9F4587F226208342.key
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq_server-source]
name=rabbitmq_server-source
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/rpm/el/8/SRPMS
repo_gpgcheck=1
enabled=1
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.9F4587F226208342.key
gpgcheck=0
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md
</pre>

#### OpenSUSE

The following example targets OpenSUSE and only installs the RabbitMQ package repository.
Erlang is assumed to be provisioned from the [`devel:languages:erlang:Factory`](https://software.opensuse.org/download.html?project=devel%3Alanguages%3Aerlang%3AFactory&package=erlang) repository.

<pre class="lang-ini">
##
## RabbitMQ server
##

[rabbitmq_server]
name=rabbitmq_server
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/rpm/opensuse/15.1/$basearch
repo_gpgcheck=1
enabled=1
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.9F4587F226208342.key
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq_server-noarch]
name=rabbitmq_server-noarch
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/rpm/opensuse/15.1/noarch
repo_gpgcheck=1
enabled=1
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.9F4587F226208342.key
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md

[rabbitmq_server-source]
name=rabbitmq_server-source
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/rpm/opensuse/15.1/SRPMS
repo_gpgcheck=1
enabled=1
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.9F4587F226208342.key
gpgcheck=1
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
pkg_gpgcheck=1
autorefresh=1
type=rpm-md
</pre>

### Install Packages with Yum

#### CentOS 8, RHEL 8, modern Fedora

Update Yum package metadata:

<pre class="lang-bash">
yum update -y
yum -q makecache -y --disablerepo='*' --enablerepo='rabbitmq_erlang-noarch' --enablerepo='rabbitmq_server-noarch'
</pre>

Next install dependencies from the standard repositories:

<pre class="lang-bash">
## install these dependencies from standard OS repositories
yum install socat logrotate -y
</pre>

Finally, install modern Erlang and RabbitMQ:

<pre class="lang-bash">
## install RabbitMQ and zero dependency Erlang from the above repositories,
## ignoring any versions provided by the standard repositories
yum install --repo rabbitmq_erlang --repo rabbitmq_server-noarch erlang rabbitmq-server
</pre>

### Install Packages with Zypper

First, update Zypper package metadata:

<pre class="lang-bash">
## refresh the RabbitMQ repositories
zypper --gpg-auto-import-keys refresh rabbitmq_server
zypper --gpg-auto-import-keys refresh rabbitmq_server-noarch
zypper --gpg-auto-import-keys refresh rabbitmq_server-source
</pre>

Then install the packages:

<pre class="lang-bash">
## install the package from Cloudsmith repository
zypper install --repo rabbitmq_server-noarch
</pre>


## <a id="rpm-version-locking" class="anchor" href="#rpm-version-locking">Package Version Locking in Yum</a>

[yum version locking](https://access.redhat.com/solutions/98873) plugin can
be used to prevent unexpected package upgrades. Using it carries the risk of leaving
the system behind in terms of [updates](changelog.html), including important bug fixes
and security patches.


## <a id="with-rpm" class="anchor" href="#with-rpm">With rpm and Downloaded RPM</a>

After [downloading](#downloads) the server package, issue the following command as
'root':

<pre class="lang-bash">
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc

## install these dependencies from standard OS repositories
yum install socat logrotate -y

# This example assumes the CentOS 8 version of the package, suitable for
# Red Hat 8, CentOS 8 and modern Fedora releases.
#
# For Red Hat 7 or CentOS 7, replace "el8" with "el7".
yum install rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el8.noarch.rpm
</pre>

[RabbitMQ public signing key](signatures.html) can also be [downloaded from rabbitmq.com](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc):

<pre class="lang-bash">
rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc

## install these dependencies from standard OS repositories
yum install socat logrotate -y

# This example assumes the CentOS 8 version of the package, suitable for
# Red Hat 8, CentOS 8 and modern Fedora releases.
#
# For Red Hat 7 or CentOS 7, replace "el8" with "el7".
yum install rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el8.noarch.rpm
</pre>

## <a id="downloads" class="anchor" href="#downloads">Download the Server</a>

In some cases it may be easier to download the package and install it manually. The package can be downloaded
from [GitHub](https://github.com/rabbitmq/rabbitmq-server/releases).

<table>
  <thead>
    <th>Description</th>
    <th>Download</th>
    <th>Signature</th>
  </thead>

  <tr>
    <td>
      RPM for RHEL Linux 8.x, CentOS 8.x, Fedora 31+ (supports systemd)
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el8.noarch.rpm">rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el8.noarch.rpm</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.el8.noarch.rpm.asc">Signature</a>
    </td>
  </tr>

  <tr>
    <td>
      RPM for openSUSE Linux
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.suse.noarch.rpm">rabbitmq-server-&version-server;-&serverRPMMinorVersion;.suse.noarch.rpm</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server-&version-server;-&serverRPMMinorVersion;.suse.noarch.rpm.asc">Signature</a>
    </td>
  </tr>
</table>


## <a id="running-rpm" class="anchor" href="#running-rpm">Run RabbitMQ Server</a>

### Start the Server

The server is not started as a daemon by default when the
RabbitMQ server package is installed. To start the daemon by default
when the system boots, as an administrator run

<pre class="lang-bash">
chkconfig rabbitmq-server on
</pre>

As an administrator, start and stop the
server as usual, e.g. using `service`:

<pre class="lang-bash">
/sbin/service rabbitmq-server start

/sbin/service rabbitmq-server status

/sbin/service rabbitmq-server stop
</pre>

If the `service` tool is not installed on the system, it can be installed
using `yum`:

<pre class="lang-bash">
yum -y install initscripts
</pre>


## <a id="configuration" class="anchor" href="#configuration">Configuring RabbitMQ</a>

On most systems, a node should be able to start and run with all defaults.
Please refer to the [Configuration guide](configure.html) to learn more
and [Production Checklist](production-checklist.html) for guidelines beyond
development environments.

Note: the node is set up to run as system user `rabbitmq`.
If [location of the node database or the logs](relocate.html) is changed,
the files and directories must be owned by this user.


## <a id="ports" class="anchor" href="#ports"></a>

RabbitMQ nodes bind to ports (open server TCP sockets) in order to accept client and CLI tool connections.
Other processes and tools such as SELinux may prevent RabbitMQ from binding to a port. When that happens,
the node will fail to start.

CLI tools, client libraries and RabbitMQ nodes also open connections (client TCP sockets).
Firewalls can prevent nodes and CLI tools from communicating with each other.
Make sure the following ports are accessible:

 * 4369: [epmd](http://erlang.org/doc/man/epmd.html), a peer discovery service used by RabbitMQ nodes and CLI tools
 * 5672, 5671: used by AMQP 0-9-1 and 1.0 clients without and with TLS
 * 25672: used for inter-node and CLI tools communication (Erlang distribution server port)
   and is allocated from a dynamic range (limited to a single port by default,
   computed as AMQP port + 20000). Unless external connections on these ports are really necessary (e.g.
   the cluster uses [federation](federation.html) or CLI tools are used on machines outside the subnet),
   these ports should not be publicly exposed. See [networking guide](networking.html) for details.
 * 35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
   and is allocated from a dynamic range (computed as server distribution port + 10000 through
   server distribution port + 10010). See [networking guide](networking.html) for details.
 * 15672: [HTTP API](management.html) clients, [management UI](management.html) and [rabbitmqadmin](management-cli.html)
   (only if the [management plugin](management.html) is enabled)
 * 61613, 61614: [STOMP clients](https://stomp.github.io/stomp-specification-1.2.html) without and with TLS (only if the [STOMP plugin](stomp.html) is enabled)
 * 1883, 8883: [MQTT clients](http://mqtt.org/) without and with TLS, if the [MQTT plugin](mqtt.html) is enabled
 * 15674: STOMP-over-WebSockets clients (only if the [Web STOMP plugin](web-stomp.html) is enabled)
 * 15675: MQTT-over-WebSockets clients (only if the [Web MQTT plugin](web-mqtt.html) is enabled)
 * 15692: Prometheus metrics (only if the [Prometheus plugin](prometheus.html) is enabled)

It is possible to [configure RabbitMQ](configure.html)
to use [different ports and specific network interfaces](networking.html).


## <a id="default-user-access" class="anchor" href="#default-user-access">Default User Access</a>

The broker creates a user `guest` with password
`guest`. Unconfigured clients will in general use these
credentials. <strong>By default, these credentials can only be
used when connecting to the broker as localhost</strong> so you
will need to take action before connecting from any other
machine.

See the documentation on [access
control](access-control.html) for information on how to create more users and delete
the `guest` user.


## <a id="kernel-resource-limits" class="anchor" href="#kernel-resource-limits">Controlling System Limits on Linux</a>

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

### <a id="max-open-files-limit" class="anchor" href="#max-open-files-limit">With systemd (Recent Linux Distributions)</a>

On distributions that use systemd, the OS limits are controlled via
a configuration file at `/etc/systemd/system/rabbitmq-server.service.d/limits.conf`.
For example, to set the max open file handle limit (`nofile`) to `64000`:

<pre class="lang-ini">
[Service]
LimitNOFILE=64000
</pre>

See [systemd documentation](https://www.freedesktop.org/software/systemd/man/systemd.exec.html) to learn about
the supported limits and other directives.

### With Docker

To configure kernel limits for Docker contains, use the `"default-ulimits"` key in [Docker daemon configuration file](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file).
The file has to be installed on Docker hosts at `/etc/docker/daemon.json`:

<pre class="lang-json">
{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
</pre>

### Without systemd (Older Linux Distributions)

The most straightforward way to adjust the per-user limit for
RabbitMQ on distributions that do not use systemd is to edit the `/etc/default/rabbitmq-server`
(provided by the RabbitMQ Debian package) or [rabbitmq-env.conf](https://www.rabbitmq.com/configure.html)
to invoke `ulimit` before the service is started.

<pre class="lang-bash">
ulimit -S -n 4096
</pre>

This <em>soft</em> limit cannot go higher than the <em>hard</em> limit (which defaults to 4096 in many distributions).
[The hard limit can be increased](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md) via
`/etc/security/limits.conf`. This also requires enabling the [pam_limits.so](http://askubuntu.com/a/34559) module
and re-login or reboot. Note that limits cannot be changed for running OS processes.

For more information about controlling `fs.file-max`
with `sysctl`, please refer to the excellent
[Riak guide on open file limit tuning](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md#debian--ubuntu).

### <a id="verifying-limits" class="anchor" href="#verifying-limits">Verifying the Limit</a>

[RabbitMQ management UI](management.html) displays the number of file descriptors available
for it to use on the Overview tab.

<pre class="lang-bash">rabbitmqctl status</pre>

includes the same value.

The following command

<pre  class="lang-bash">
cat /proc/$RABBITMQ_BEAM_PROCESS_PID/limits
</pre>

can be used to display effective limits of a running process. `$RABBITMQ_BEAM_PROCESS_PID`
is the OS PID of the Erlang VM running RabbitMQ, as returned by `rabbitmqctl status`.

### <a id="chef-puppet-bosh" class="anchor" href="#chef-puppet-bosh">Configuration Management Tools</a>

Configuration management tools (e.g. Chef, Puppet, BOSH) provide assistance
with system limit tuning. Our [developer tools](devtools.html#devops-tools) guide
lists relevant modules and projects.


## <a id="managing-service" class="anchor" href="#managing-service">Managing the Service</a>

To start and stop the server, use the `service` tool.
The service name is `rabbitmq-server`:

<pre class="lang-bash">
# stop the local node
sudo service rabbitmq-server stop

# start it back
sudo service rabbitmq-server start
</pre>

`service rabbitmq-server status` will report service status
as observed by systemd (or similar service manager):

<pre class="lang-bash">
# check on service status as observed by service manager
sudo service rabbitmq-server status
</pre>

It will produce output similar to this:

<pre class="lang-ini">
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

Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##  ##
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##  ##      RabbitMQ 3.8.17. Copyright (c) 2007-2021 VMware, Inc. or its affiliates.
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##########  Licensed under the MPL 2.0. Website: https://www.rabbitmq.com/
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ######  ##
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##########  Logs: /var/log/rabbitmq/rabbit@localhost.log
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: /var/log/rabbitmq/rabbit@localhost_upgrade.log
Dec 26 10:21:30 localhost.localdomain rabbitmq-server[957]: Starting broker...
Dec 26 10:21:32 localhost.localdomain rabbitmq-server[957]: systemd unit for activation check: "rabbitmq-server.service"
Dec 26 10:21:32 localhost.localdomain systemd[1]: Started RabbitMQ broker.
Dec 26 10:21:32 localhost.localdomain rabbitmq-server[957]: completed with 6 plugins.
</pre>

`rabbitmqctl`, `rabbitmq-diagnostics`,
and other [CLI tools](cli.html) will be available in `PATH` and can be invoked by a `sudo`-enabled user:

<pre class="lang-bash">
# checks if the local node is running and CLI tools can successfully authenticate with it
sudo rabbitmq-diagnostics ping

# prints enabled components (applications), TCP listeners, memory usage breakdown, alarms
# and so on
sudo rabbitmq-diagnostics status

# prints cluster membership information
sudo rabbitmq-diagnostics cluster_status

# prints effective node configuration
sudo rabbitmq-diagnostics environment
</pre>

All `rabbitmqctl` commands will report an error if no node is running.
See the [CLI tools](cli.html) and [Monitoring](monitoring.html) guides to learn more.


## <a id="server-logs" class="anchor" href="#server-logs">Log Files and Management</a>

[Server logs](logging.html) can be found under the [configurable](relocate.html) directory, which usually
defaults to `/var/log/rabbitmq` when RabbitMQ is installed via a Linux package manager.

`RABBITMQ_LOG_BASE` can be used to override [log directory location](relocate.html).

Assuming a `systemd`-based distribution, system service logs can be
inspected using

<pre class="lang-bash">
journalctl --system
</pre>

which requires superuser privileges.
Its output can be filtered to narrow it down to RabbitMQ-specific entries:

<pre class="lang-bash">
sudo journalctl --system | grep rabbitmq
</pre>

The output will look similar to this:

<pre class="lang-ini">
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##      RabbitMQ 3.8.17. Copyright (c) 2007-2021 VMware, Inc. or its affiliates.
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##########  Licensed under the MPL 2.0. Website: https://www.rabbitmq.com/
Dec 26 11:03:04 localhost rabbitmq-server[968]: ######  ##
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##########  Logs: /var/log/rabbitmq/rabbit@localhost.log
Dec 26 11:03:04 localhost rabbitmq-server[968]: /var/log/rabbitmq/rabbit@localhost_upgrade.log
Dec 26 11:03:04 localhost rabbitmq-server[968]: Starting broker...
Dec 26 11:03:05 localhost rabbitmq-server[968]: systemd unit for activation check: "rabbitmq-server.service"
Dec 26 11:03:06 localhost rabbitmq-server[968]: completed with 6 plugins.
</pre>

### Log Rotation

The broker always appends to the [log files](logging.html), so a complete log history is retained.

[logrotate](https://linux.die.net/man/8/logrotate) is the recommended way of log file rotation and compression.
By default, the package will set up `logrotate` to run weekly on files located in default
`/var/log/rabbitmq` directory. Rotation configuration can be found in
`/etc/logrotate.d/rabbitmq-server`.


## <a id="yum-legacy" class="anchor" href="#yum-legacy">Install on Older Distributions (CentOS 7, RHEL 7) Using PackageCloud Yum Repository</a>

This section covers installation on RHEL 7 and CentOS 7. CentOS 7 has
reached the [end of general support](https://wiki.centos.org/About/Product) and is no
longer supported. Its use is therefore **highly discouraged**.

Yum will verify signatures of any packages it installs, therefore the first step
in the process is to import the signing key

<pre class="lang-bash">
## primary RabbitMQ signing key
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
## modern Erlang repository
rpm --import https://packagecloud.io/rabbitmq/erlang/gpgkey
## RabbitMQ server repository
rpm --import https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
</pre>

### Add Yum Repositories for RabbitMQ and Modern Erlang

In order to use the Yum repository, a `.repo` file (e.g. `rabbitmq.repo`) has to be
added under the `/etc/yum.repos.d/` directory.
#### Red Hat 7, CentOS 7

The following example sets up a repository that will install RabbitMQ and its Erlang dependency from PackageCloud,
and targets **CentOS 7**. There are slight differences to CentOS 8 instructions.

<pre class="lang-ini">
# In /etc/yum.repos.d/rabbitmq.repo

##
## Zero dependency Erlang
##

[rabbitmq_erlang]
name=rabbitmq_erlang
baseurl=https://packagecloud.io/rabbitmq/erlang/el/7/$basearch
repo_gpgcheck=1
gpgcheck=1
enabled=1
# PackageCloud's repository key and RabbitMQ package signing key
gpgkey=https://packagecloud.io/rabbitmq/erlang/gpgkey
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300

[rabbitmq_erlang-source]
name=rabbitmq_erlang-source
baseurl=https://packagecloud.io/rabbitmq/erlang/el/7/SRPMS
repo_gpgcheck=1
gpgcheck=0
enabled=1
gpgkey=https://packagecloud.io/rabbitmq/erlang/gpgkey
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300

##
## RabbitMQ server
##

[rabbitmq_server]
name=rabbitmq_server
baseurl=https://packagecloud.io/rabbitmq/rabbitmq-server/el/7/$basearch
repo_gpgcheck=1
gpgcheck=1
enabled=1
# PackageCloud's repository key and RabbitMQ package signing key
gpgkey=https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300

[rabbitmq_server-source]
name=rabbitmq_server-source
baseurl=https://packagecloud.io/rabbitmq/rabbitmq-server/el/7/SRPMS
repo_gpgcheck=1
gpgcheck=0
enabled=1
gpgkey=https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
</pre>

### Install Packages with Yum
#### CentOS 7

Update Yum package metadata:

<pre class="lang-bash">
yum update -y
</pre>

Next, install the packages:

<pre class="lang-bash">
## install these dependencies from standard OS repositories
yum install socat logrotate -y

yum install erlang rabbitmq-server -y
</pre>
