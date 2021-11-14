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

# Installing on Debian and Ubuntu

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers RabbitMQ installation on Debian, Ubuntu and distributions based on one of them.

RabbitMQ is included in standard Debian and Ubuntu repositories.
However, the versions included are
many releases behind [latest RabbitMQ releases](changelog.html)
and may provide RabbitMQ versions that are already [out of support](versions.html).

Team RabbitMQ produces our own Debian packages and distributes them [using Cloudsmith](#apt-cloudsmith) and [PackageCloud](#apt-packagecloud).

Key sections of this guide are

 * [Ways of installing](#installation-methods) the latest RabbitMQ version on Debian and Ubuntu
 * [Supported Ubuntu and Debian distributions](#supported-distributions)
 * [Privilege requirements](#sudo-requirements)
 * Quick start installation snippet that [uses Cloudsmith](#apt-quick-start-cloudsmith) repositories
 * Quick start installation snippets that [uses PackageCloud](#apt-quick-start-packagecloud) and Launchpad repositories

[Supported Erlang versions](which-erlang.html) will be provisioned from one of the [modern Erlang apt repositories](#erlang-repositories)
on [Ubuntu Launchpad](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang) or [Cloudsmith.io](https://cloudsmith.io/~rabbitmq/repos/rabbitmq-erlang/packages/).

Those looking for a more detailed description of the installation steps performed
should refer to

* Manual installation using [apt and the Cloudsmith](#apt-cloudsmith) repository
* Manual installation using [apt the PackageCloud](#apt-packagecloud) and Launchpad repositories

Service management is covered in

 * [Manage the service](#managing-service)
 * How to [inspect node and service logs](#server-logs)

More advanced topics include

 * [Version Pinning](#apt-pinning) of apt packages


## <a id="installation-methods" class="anchor" href="#installation-methods">How to Install Latest RabbitMQ on Debian and Ubuntu</a>

### With Apt

There are two options available for installing modern RabbitMQ on Debian and Ubuntu:

 * Option A: using apt repositories [on Cloudsmith](#apt-cloudsmith) ([quick start script](#apt-quick-start-cloudsmith))
 * Option B: using a combination of apt repositories [on PackageCloud](#apt-packagecloud) and Launchpad ([quick start script](#apt-quick-start-packagecloud))

Both options will install a [modern version of Erlang](which-erlang.html) using [Erlang apt repositories](#erlang-repositories)
on Cloudsmith or Launchpad.

### Manually Using Dpkg

Alternatively, the package can be downloaded manually and [installed ](#manual-installation) with `dpkg -i`.
This option will require manual installation of all RabbitMQ package dependencies and is **highly discouraged**.

## <a id="supported-distributions" class="anchor" href="#supported-distributions">Supported Distributions</a>

RabbitMQ is supported on several major Debian-based distributions that are still supported
by their primary vendor or developer group.

For Debian, this means that RabbitMQ core team focus around package is on the current and prior release of Debian-based distributions,
i.e. inline with [distribution EOL policy](https://wiki.debian.org/DebianReleases).

Currently the list of supported Debian-based distributions includes

 * Ubuntu 18.04 through 21.04
 * Debian Buster (10), Bullseye (11), and Sid ("unstable")

The package may work on other Debian-based distributions
if [dependencies](#manual-installation) are satisfied (e.g. using a backports repository)
but their testing and support is done on a best effort basis.


## <a id="erlang-repositories" class="anchor" href="#erlang-repositories">Where to Get Recent Erlang Version on Debian and Ubuntu</a>

RabbitMQ needs Erlang/OTP to run. Erlang/OTP packages in
standard Debian and Ubuntu repositories can be significantly out of date
and not [supported by modern RabbitMQ versions](which-erlang.html).

Most recent Erlang/OTP release series are available from a number of alternative
apt repositories:

<table>
 <thead>
   <tr>
     <td><strong>Erlang Release Series</strong></td>
     <td><strong>Apt Repositories that provide it</strong></td>
     <td><strong>Notes</strong></td>
   </tr>
 </thead>
 <tbody>
  <tr>
     <td>24.x</td>
     <td>
       <ul>
        <li><a href="#apt-cloudsmith">Debian packages of Erlang</a> from Team RabbitMQ on Cloudsmith.io</li>
        <li><a href="#apt-launchpad-erlang">Debian packages of Erlang</a> from Team RabbitMQ on Launchpad</li>
         <li><a href="https://packages.erlang-solutions.com/erlang/#tabs-debian">Erlang Solutions</a></li>
       </ul>
     </td>
     <td>
       <strong>Supported <a href="https://blog.rabbitmq.com/posts/2021/03/erlang-24-support-roadmap/">starting with 3.8.16</a></strong>.
       See <a href="/which-erlang.html">Erlang compatibility guide</a>.
     </td>
   </tr>

  <tr>
     <td>23.x</td>
     <td>
       <ul>
        <li><a href="#apt-cloudsmith">Debian packages of Erlang</a> from Team RabbitMQ on Cloudsmith.io</li>
        <li><a href="#apt-launchpad-erlang">Debian packages of Erlang</a> from Team RabbitMQ on Launchpad</li>
         <li><a href="https://packages.erlang-solutions.com/erlang/#tabs-debian">Erlang Solutions</a></li>
       </ul>
     </td>
     <td>
       <strong>Supported <a href="https://groups.google.com/forum/#!topic/rabbitmq-users/wlPIWz3UYHQ">starting with 3.8.4</a></strong>.
       See <a href="/which-erlang.html">Erlang compatibility guide</a>.
     </td>
   </tr>
 </tbody>
</table>

This guide will focus on the Debian repositories maintained by Team RabbitMQ <a href="#apt-launchpad-erlang">on Launchpad</a>
and <a href="#apt-cloudsmith-erlang">on Cloudsmith.io</a>.





## <a id="apt-packagecloud" class="anchor" href="#apt-packagecloud">Using RabbitMQ Apt Repositories on PackageCloud</a>

Team RabbitMQ maintains an [apt repository on PackageCloud](https://packagecloud.io/rabbitmq/rabbitmq-server),
a package hosting service. It provides packages for most recent RabbitMQ releases.

PackageCloud provides [repository setup instructions](https://packagecloud.io/rabbitmq/rabbitmq-server/install) that include
a convenient one-liner. Please **always inspect scripts** that are downloaded from the Internet and executed via
a privileged shell!

Note that the PackageCloud script **does not** currently follow Debian best practices in terms of GPG key handling
and the rest of this section does.

This guide will focus on a more traditional and explicit way of setting up an additional apt repository
and installing packages.

All steps covered below are **mandatory** unless otherwise specified.

### <a id="apt-quick-start-packagecloud" class="anchor" href="#apt-quick-start-packagecloud">PackageCloud Quick Start Script</a>

Below is shell snippet that performs those steps. They are documented in more detail below.

<pre class="lang-bash">
#!/usr/bin/sh

sudo apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's main signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null
## Launchpad PPA that provides modern Erlang releases
curl -1sLf "https://keyserver.ubuntu.com/pks/lookup?op=get&amp;search=0xf77f1eda57ebb1cc" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg > /dev/null
## PackageCloud RabbitMQ repository
curl -1sLf "https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/io.packagecloud.rabbitmq.gpg > /dev/null

## Add apt repositories maintained by Team RabbitMQ
sudo tee /etc/apt/sources.list.d/rabbitmq.list &lt;&lt;EOF
## Provides modern Erlang/OTP releases
##
## "bionic" as distribution name should work for any reasonably recent Ubuntu or Debian release.
## See the release to distribution mapping table in RabbitMQ doc guides to learn more.
deb [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionic main
deb-src [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionic main

## Provides RabbitMQ
##
## "bionic" as distribution name should work for any reasonably recent Ubuntu or Debian release.
## See the release to distribution mapping table in RabbitMQ doc guides to learn more.
deb [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ bionic main
deb-src [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ bionic main
EOF

## Update package indices
sudo apt-get update -y

## Install Erlang packages
sudo apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
</pre>

### Enable apt HTTPS Transport

In order for apt to be able to download RabbitMQ and Erlang packages from services such as PackageCloud, Cloudsmith.io or Launchpad,
the `apt-transport-https` package must be installed:

<pre class="lang-bash">
sudo apt-get install apt-transport-https
</pre>

### Add Repository Signing Key

In order for `apt` to use the repository, [RabbitMQ signing key](signatures.html) must be available to the system for validation.

<pre class="lang-bash">
## Team RabbitMQ's main signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null
## Launchpad PPA that provides modern Erlang releases
curl -1sLf "https://keyserver.ubuntu.com/pks/lookup?op=get&amp;search=0xf77f1eda57ebb1cc" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg > /dev/null
## PackageCloud RabbitMQ repository
curl -1sLf "https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/io.packagecloud.rabbitmq.gpg > /dev/null
</pre>

See the [guide on signatures](signatures.html) to learn more.

#### Add a Source List File

As with all 3rd party apt repositories, a file describing the RabbitMQ and Erlang package repositories
must be placed under the `/etc/apt/sources.list.d/` directory.
`/etc/apt/sources.list.d/rabbitmq.list` is the recommended location.

The file should have a source (repository) definition line that uses the following
pattern:

<pre class="lang-ini">
# Source repository definition example.

## Provides modern Erlang/OTP releases
##
## "bionic" as distribution name should work for any reasonably recent Ubuntu or Debian release.
## See the release to distribution mapping table in RabbitMQ doc guides to learn more.
deb [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionic main
deb-src [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionic main

## Provides RabbitMQ
##
## "bionic" as distribution name should work for any reasonably recent Ubuntu or Debian release.
## See the release to distribution mapping table in RabbitMQ doc guides to learn more.
deb [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ bionic main
deb-src [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ bionic main
</pre>

The next couple of sections discusses what distribution and component values
are supported.

#### Distribution

In order to set up an apt repository that provides the correct package, a few
decisions have to be made. One is determining the distribution name. It often
matches the Debian or Ubuntu release used:

 * `focal` for Ubuntu 20.04
 * `bionic` for Ubuntu 18.04
 * `buster` for Debian Buster

However, not all distributions are covered (indexed).
But there are good news: since the package indexed for these distributions is identical,
any reasonably recent distribution name would suffice in practice.
For example, users of Debian Buster or Debian Bullseye
can both use `buster` for distribution name.

Below is a table of OS release and distribution names that should be used
with the RabbitMQ apt repository on PackageCloud.

| Release         | Distribution |
|-----------------|--------------|
| Ubuntu 20.04    | `focal`      |
| Ubuntu 18.04    | `bionic`     |
| Debian Buster   | `buster`     |
| Debian Bullseye | `buster`     |
| Debian Sid      | `buster`     |

To add the apt repository to the source list directory (`/etc/apt/sources.list.d`), use:

<pre class="lang-bash">
sudo tee /etc/apt/sources.list.d/rabbitmq.list &lt;&lt;EOF
## Provides modern Erlang/OTP releases
##
## "bionic" as distribution name should work for any reasonably recent Ubuntu or Debian release.
## See the release to distribution mapping table in RabbitMQ doc guides to learn more.
deb [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionic main
deb-src [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionic main

## Provides RabbitMQ
##
## Replace $distribution with the name of the Ubuntu release used.
## On Debian, "deb/ubuntu" should be replaced with "deb/debian"
deb [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ $distribution main
deb-src [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ $distribution main
EOF
</pre>

where `$distribution` is the name of the Debian or Ubuntu distribution used (see the table above).

So, for example, on Debian Buster it would be

<pre class="lang-bash">
sudo tee /etc/apt/sources.list.d/rabbitmq.list &lt;&lt;EOF
## Provides modern Erlang/OTP releases
##
## "bionic" as distribution name should work for any reasonably recent Ubuntu or Debian release.
deb [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionic main
deb-src [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionic main

## Provides RabbitMQ
##
deb [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ buster main
deb-src [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ buster main
EOF
</pre>

#### Install Packages

After updating the list of `apt` sources it is necessary to run `apt-get update`:

<pre class="lang-bash">
sudo apt-get update -y
</pre>

Then install the package with

<pre class="lang-bash">
## Install Erlang packages
sudo apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
</pre>



## <a id="apt-cloudsmith" class="anchor" href="#apt-cloudsmith">Using RabbitMQ Apt Repositories on Cloudsmith</a>

Team RabbitMQ maintains two [apt repositories on Cloudsmith](https://cloudsmith.io/~rabbitmq/repos/),
a package hosting service. They provide packages for most recent RabbitMQ and modern Erlang releases.

Cloudsmith provides repository setup instructions that include
convenient one-liners:

 * For [modern Erlang repository](https://cloudsmith.io/~rabbitmq/repos/rabbitmq-erlang/setup/#formats-deb)
 * For [RabbitMQ repository](https://cloudsmith.io/~rabbitmq/repos/rabbitmq-server/setup/#formats-deb)

Please **always inspect scripts** that are downloaded from the Internet and executed via a privileged shell!

This guide will focus on a more traditional and explicit way of setting up additional apt repositories
and installing packages.

All steps covered below are **mandatory** unless otherwise specified.

### <a id="apt-quick-start-cloudsmith" class="anchor" href="#apt-quick-start-cloudsmith">Cloudsmith Quick Start Script</a>

Below is shell snippet that performs those steps. They are documented in more detail below.

<pre class="lang-bash">
#!/usr/bin/sh

sudo apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's main signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null
## Cloudsmith: modern Erlang repository
curl -1sLf https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/gpg.E495BB49CC4BBE5B.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg > /dev/null
## Cloudsmith: RabbitMQ repository
curl -1sLf https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.9F4587F226208342.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg > /dev/null

## Add apt repositories maintained by Team RabbitMQ
sudo tee /etc/apt/sources.list.d/rabbitmq.list &lt;&lt;EOF
## Provides modern Erlang/OTP releases
##
deb [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/deb/ubuntu bionic main
deb-src [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/deb/ubuntu bionic main

## Provides RabbitMQ
##
deb [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/deb/ubuntu bionic main
deb-src [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/deb/ubuntu bionic main
EOF

## Update package indices
sudo apt-get update -y

## Install Erlang packages
sudo apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
</pre>

All steps covered below are **mandatory** unless otherwise specified.
### Install Essential Dependencies

<pre class="lang-bash">
sudo apt-get update -y

sudo apt-get install curl gnupg -y
</pre>

### Enable apt HTTPS Transport

In order for apt to be able to download RabbitMQ and Erlang packages from services such as PackageCloud, Cloudsmith.io or Launchpad,
the `apt-transport-https` package must be installed:

<pre class="lang-bash">
sudo apt-get install apt-transport-https
</pre>

### <a id="cloudsmith-signing-keys" class="anchor" href="#cloudsmith-signing-keys">Add Repository Signing Keys</a>

Cloudsmith signs distributed packages using their own GPG keys, one per repository.

In order to use the repositories, their signing keys must be added to the system.
This will enable apt to trust packages signed by that key.

<pre class="lang-bash">
sudo apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's main signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null
## Cloudsmith: modern Erlang repository
curl -1sLf https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/gpg.E495BB49CC4BBE5B.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg > /dev/null
## Cloudsmith: RabbitMQ repository
curl -1sLf https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/gpg.9F4587F226208342.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg > /dev/null
</pre>

See the [guide on signatures](signatures.html) to learn more.

#### Add a Source List File

As with all 3rd party apt repositories, a file describing the RabbitMQ and Erlang package repositories
must be placed under the `/etc/apt/sources.list.d/` directory.
`/etc/apt/sources.list.d/rabbitmq.list` is the recommended location.

The file should have a source (repository) definition line that uses the following
pattern:

<pre class="lang-ini">
## Provides modern Erlang/OTP releases
##
## Replace $distribution with the name of the Ubuntu release used.
## On Debian, "deb/ubuntu" should be replaced with "deb/debian"
deb [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/deb/ubuntu $distribution main
deb-src [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg]  https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/deb/ubuntu $distribution main

## Provides RabbitMQ
##
## Replace $distribution with the name of the Ubuntu release used.
## On Debian, "deb/ubuntu" should be replaced with "deb/debian"
deb [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/deb/ubuntu $distribution main
deb-src [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/deb/ubuntu $distribution main
</pre>

The next couple of sections discusses what distribution and component values
are supported.

#### Distribution

In order to set up an apt repository that provides the correct package, a few
decisions have to be made. One is determining the distribution name. It often
matches the Debian or Ubuntu release used:

 * `focal` for Ubuntu 20.04
 * `bionic` for Ubuntu 18.04
 * `buster` for Debian Buster

However, not all distributions are covered (indexed).
But there are good news: since the package indexed for these distributions is identical,
any reasonably recent distribution name would suffice in practice.
For example, users of Debian Buster or Debian Bullseye
can both use `buster` for distribution name.

Below is a table of OS release and distribution names that should be used
with the RabbitMQ apt repository on PackageCloud.

| Release         | Distribution |
|-----------------|--------------|
| Ubuntu 20.04    | `focal`      |
| Ubuntu 18.04    | `bionic`     |
| Debian Buster   | `buster`     |
| Debian Bullseye | `buster`     |
| Debian Sid      | `buster`     |

To add the apt repository to the source list directory (`/etc/apt/sources.list.d`), use:

<pre class="lang-bash">
sudo tee /etc/apt/sources.list.d/rabbitmq.list &lt;&lt;EOF
## Provides modern Erlang/OTP releases
##
## Replace $distribution with the name of the Ubuntu release used.
## On Debian, "deb/ubuntu" should be replaced with "deb/debian"
deb [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/deb/ubuntu $distribution main
deb-src [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/deb/ubuntu $distribution main

## Provides RabbitMQ
##
## Replace $distribution with the name of the Ubuntu release used.
## On Debian, "deb/ubuntu" should be replaced with "deb/debian"
deb [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/deb/ubuntu $distribution main
deb-src [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/deb/ubuntu $distribution main
EOF
</pre>

where `$distribution` is the name of the Debian or Ubuntu distribution used (see the table above).

For example, on Debian Buster it would be

<pre class="lang-bash">
sudo tee /etc/apt/sources.list.d/rabbitmq.list &lt;&lt;EOF
## Provides modern Erlang/OTP releases
##
deb [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/deb/debian buster main
deb-src [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.E495BB49CC4BBE5B.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/deb/debian buster main

## Provides RabbitMQ
##
deb [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/deb/debian buster main
deb-src [signed-by=/usr/share/keyrings/io.cloudsmith.rabbitmq.9F4587F226208342.gpg] https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-server/deb/debian buster main
EOF
</pre>

#### Install Packages

After updating the list of `apt` sources it is necessary to run `apt-get update`:

<pre class="lang-bash">
sudo apt-get update -y
</pre>

Then install the package with

<pre class="lang-bash">
## Install Erlang packages
sudo apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
</pre>



## <a id="apt-pinning" class="anchor" href="#apt-pinning">Debian Package Version and Repository Pinning</a>

Version pinning is an **optional** step. If not used, `apt` will install the most recent version
available.

When the same package (e.g. `erlang-base`) is available from multiple apt repositories operators need
to have a way to indicate what repository should be preferred. It may also be desired to restrict Erlang version to avoid undesired upgrades.
[apt package pinning](https://wiki.debian.org/AptPreferences) feature can be used to address both problems.

Package pinning is configured with a file placed under the `/etc/apt/preferences.d/` directory, e.g. `/etc/apt/preferences.d/erlang`.
After updating apt preferences it is necessary to run `apt-get update`:

<pre class="lang-bash">
sudo apt-get update -y
</pre>

The following preference file example will configure `apt` to install `erlang-*` packages from Cloudsmith.io
and not standard Debian or Ubuntu repository:

<pre class="lang-ini">
# /etc/apt/preferences.d/erlang
Package: erlang*
Pin: origin dl.cloudsmith.io
Pin-Priority: 1000
</pre>

The following is similar to the example above but prefers Launchpad:

<pre class="lang-ini">
# /etc/apt/preferences.d/erlang
Package: erlang*
Pin: origin ppa.launchpad.net
Pin-Priority: 1000
</pre>

Effective package pinning policy can be verified with

<pre class="lang-bash">
sudo apt-cache policy
</pre>

The following preference file example will pin all `erlang-*` packages to `23.3`
(assuming [package epoch](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Version) for the package is 1):

<pre class="lang-ini">
# /etc/apt/preferences.d/erlang
Package: erlang*
Pin: version 1:23.3
Pin-Priority: 1000
</pre>

The following preference file example will pin `rabbitmq-server` package to `&version-server;`
(assuming [package epoch](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Version) for the package is 1):

<pre class="lang-ini">
# /etc/apt/preferences.d/rabbitmq
Package: rabbitmq-server
Pin: version 1:&version-server;
Pin-Priority: 1000
</pre>


In the example below, the `esl-erlang` package is pinned to `23.3.1`
(assuming [package epoch](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Version) for the package is 1):

<pre class="lang-ini">
# /etc/apt/preferences.d/erlang
Package: esl-erlang
Pin: version 1:23.3.1
Pin-Priority: 1000
</pre>


## <a id="manual-installation" class="anchor" href="#manual-installation">Manual Installation with Dpkg</a>

In some cases it may be easier to download the package directly from GitHub and install it manually using `sudo dpkg -i`.
Below is a download link.

<table>
  <thead>
    <th>Description</th>
    <th>Download</th>
    <th>Signature</th>
  </thead>

  <tr>
    <td>
      .deb for Debian-based Linux (from <a href="https://github.com/rabbitmq/rabbitmq-server/releases">GitHub</a>)
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server_&version-server;-&serverDebMinorVersion;_all.deb">rabbitmq-server_&version-server;-&serverDebMinorVersion;_all.deb</a>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server_&version-server;-&serverDebMinorVersion;_all.deb.asc">Signature</a>
    </td>
  </tr>
</table>

When installing manually with `dpkg`, it is necessary to install package dependencies first.
`dpkg`, unlike `apt`, does not resolve or manage dependencies.

Here's an example that does that, installs `wget`, downloads the RabbitMQ package and installs it:

<pre class="lang-bash">
# sync package metadata
sudo apt-get update
# install dependencies manually
sudo apt-get -y install socat logrotate init-system-helpers adduser

# download the package
sudo apt-get -y install wget
wget https://github.com/rabbitmq/rabbitmq-server/releases/download/&version-server-tag;/rabbitmq-server_&version-server;-&serverDebMinorVersion;_all.deb

# install the package with dpkg
sudo dpkg -i rabbitmq-server_&version-server;-&serverDebMinorVersion;_all.deb

rm rabbitmq-server_&version-server;-&serverDebMinorVersion;_all.deb
</pre>

Installation via [apt repositories](#apt) is recommended
over downloading the package directly and installing via `dpkg -i`. When the RabbitMQ
package is installed manually with `dpkg -i` the operator is responsible for making sure
that all [package dependencies](#package-dependencies) are met.


## <a id="sudo-requirements" class="anchor" href="#sudo-requirements">User Privilege Requirements</a>

RabbitMQ Debian package will require `sudo` privileges to install and manage.
In environments where `sudo` isn't available, consider using the
[generic binary build](install-generic-unix.html) instead.

## <a id="running-debian" class="anchor" href="#running-debian">Run RabbitMQ Server</a>

#### Start the Server

The server is started as a daemon by default when the
RabbitMQ server package is installed. It will run as a non-privileged user `rabbitmq`.

As an administrator, start and stop the
server as usual for Debian-based systems:

<pre class="lang-bash">
systemctl start rabbitmq-server
</pre>


## <a id="configuration" class="anchor" href="#configuration">Configuring RabbitMQ</a>

On most systems, a node should be able to start and run with all defaults.
Please refer to the [Configuration guide](configure.html) to learn more
and [Production Checklist](production-checklist.html) for guidelines beyond
development environments.

Note: the node is set up to run as system user `rabbitmq`.
If [location of the node database or the logs](relocate.html) is changed,
the files and directories must be owned by this user.


## <a id="ports" class="anchor" href="#ports">Port Access</a>

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

See the documentation on [access control](access-control.html) for information on how to create more users and delete
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


## <a id="managing-service" class="anchor" href="#managing-service">Managing the Service</a>

To start and stop the server, use the `systemctl` tool.
The service name is `rabbitmq-server`:

<pre class="lang-bash">
# stop the local node
sudo systemctl stop rabbitmq-server

# start it back
sudo systemctl start rabbitmq-server
</pre>

`systemctl status rabbitmq-server` will report service status
as observed by systemd (or similar service manager):

<pre class="lang-bash">
# check on service status as observed by service manager
sudo systemctl status rabbitmq-server
</pre>

It will produce output similar to this:

<pre class="lang-ini">
Redirecting to /bin/systemctl status rabbitmq-server.service
● rabbitmq-server.service - RabbitMQ broker
   Loaded: loaded (/usr/lib/systemd/system/rabbitmq-server.service; enabled; vendor preset: disabled)
  Drop-In: /etc/systemd/system/rabbitmq-server.service.d
           └─limits.conf
   Active: active (running) since Wed 2021-05-07 10:21:32 UTC; 25s ago
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



## <a id="apt-launchpad-erlang" class="anchor" href="#apt-launchpad-erlang">Install Erlang from an Apt Repository (PPA) on Launchpad</a>

This additional section covers installation of modern Erlang packages from Launchpad. To install
modern Erlang and RabbitMQ, please refer to the sections above:

 * [Install RabbitMQ from Cloudsmith](#apt-cloudsmith)
 * [Install RabbitMQ from PackageCloud](#apt-packagecloud) and Launchpad

### Modern Erlang on Debian

Standard Debian and Ubuntu repositories tend to provide outdated versions of Erlang/OTP. Team RabbitMQ maintains
an apt repository that includes [packages of latest Erlang/OTP releases](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang)
on Launchpad.

RabbitMQ core team focus around package is on the current and prior release of Debian-based distributions, i.e. inline with [distribution EOL policy](https://wiki.debian.org/DebianReleases).

The repository currently supports the following Ubuntu distributions:

 * Ubuntu 20.04 (Focal)
 * Ubuntu 18.04 (Bionic)

The following Debian releases can currently use the same apt repository:

 * Debian 10 (Buster)
 * Debian 11 (Bullseye)

The repo currently provides most recent patch releases in the following Erlang series:

 * 24.x
 * 23.x

In order to use the repository, it is necessary to

 * Install prerequisites needed to download signing keys and packages over HTTPS
 * Add repository signing key to your system. `apt` will verify package signatures during installation.
 * Add a source list file for the repository
 * Update package metadata
 * Install Erlang packages required by RabbitMQ

### Install Essential Dependencies

<pre class="lang-bash">
sudo apt-get update -y

sudo apt-get install curl gnupg -y
</pre>

### <a id="erlang-apt-repo-signing-key" class="anchor" href="#erlang-apt-repo-signing-key">Add Repository Signing Key</a>

In order to use the repository, add [RabbitMQ signing key](signatures.html) to the system.
This will enable apt to trust packages signed by that key.

<pre class="lang-bash">
# primary RabbitMQ signing key
curl -1sLf "https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.github.rabbitmq.signing.gpg > /dev/null

# Launchpad PPA signing key for apt
curl -1sLf "https://keyserver.ubuntu.com/pks/lookup?op=get&amp;search=0xf77f1eda57ebb1cc" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg > /dev/null
</pre>

See the [guide on signatures](signatures.html) to learn more.

### <a id="erlang-apt-https-transport" class="anchor" href="#erlang-apt-https-transport">Enable apt HTTPS Transport</a>

In order for apt to be able to download RabbitMQ and Erlang packages from services such as PackageCloud, Cloudsmith.io or Launchpad, the `apt-transport-https` package must be installed:

<pre class="lang-bash">
sudo apt-get install apt-transport-https
</pre>

### <a id="erlang-source-list-file" class="anchor" href="#erlang-source-list-file">Add a Source List File</a>

As with all 3rd party Apt (Debian) repositories, a file describing the repository
must be placed under the `/etc/apt/sources.list.d/` directory.
`/etc/apt/sources.list.d/erlang.list` is the recommended location.

The file should have a source (repository) definition line that uses the following
pattern:

<pre class="lang-bash">
# This Launchpad PPA repository provides Erlang packages produced by the RabbitMQ team
#
# Replace $distribution with the name of the Ubuntu release used. On Debian,
# use "bionic"
deb [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu $distribution main
deb-src [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu $distribution main
</pre>

The next section discusses what distribution values are supported by the Launchpad PPA.
#### Distribution

In order to set up an apt repository that provides the correct package, a few
decisions have to be made. One is determining the distribution name. It typically matches
the Debian or Ubuntu release used but only a handful of distributions are
supported (indexed) by the Erlang Debian packages maintained by Team RabbitMQ:

 * `focal` for Ubuntu 20.04
 * `bionic` for Ubuntu 18.04
 * `bionic` for Debian Buster and later versions

However, not all distributions are covered (indexed).
But there are good news: since the package indexed for these distributions is identical,
any reasonably recent distribution name would suffice
in practice. For example, users of Debian Buster, Debian Sid, Ubuntu Disco and Ubuntu Eoan
can use both `stretch` and `bionic` for distribution name.

Below is a table of OS release and distribution names that should be used
with the Launchpad repository.

| Release         | Distribution Name |
|-----------------|-----------|
| Ubuntu 20.04    | `focal`   |
| Ubuntu 18.04    | `bionic`  |
| Debian Buster   | `bionic`  |
| Debian Bullseye | `bionic`  |
| Debian Sid      | `bionic`  |

### <a id="installing-erlang-package" class="anchor" href="#installing-erlang-package">Install Erlang Packages</a>

After updating the list of `apt` sources it is necessary to run `apt-get update`:

<pre class="lang-bash">
sudo apt-get update -y
</pre>

Then packages can be installed just like with the standard Debian repositories:

<pre class="lang-bash">
# This is recommended. Metapackages such as erlang and erlang-nox must only be used
# with apt version pinning. They do not pin their dependency versions.
sudo apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl
</pre>
