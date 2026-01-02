---
title: Installing on Debian and Ubuntu
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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
  RabbitMQServerVersion,
  RabbitMQServerPackageURL,
  RabbitMQServerPackageSigURL,
  RabbitMQServerPackageFilename,
  RabbitMQServerPackageRevision,
} from '@site/src/components/RabbitMQServer';

# Installing on Debian and Ubuntu

## Overview {#overview}

This guide covers RabbitMQ installation on Debian, Ubuntu and distributions based on one of them.

RabbitMQ is included in standard Debian and Ubuntu repositories.
However, the [versions included](https://packages.ubuntu.com/search?keywords=rabbitmq-server&searchon=names&suite=all&section=all) are
many releases behind [latest RabbitMQ releases](/release-information)
and may provide RabbitMQ versions that are already [out of support](/release-information).

Team RabbitMQ produces our own Debian packages and distributes them [using Team RabbitMQ's apt repositories](#apt-quick-start).

Key sections of this guide are

 * [Ways of installing](#installation-methods) the latest RabbitMQ version on Debian and Ubuntu
 * [Supported Ubuntu and Debian distributions](#supported-distributions)
 * [Privilege requirements](#sudo-requirements)
 * Quick start installation snippet that [uses Team RabbitMQ's apt repositories](#apt-quick-start) repositories
 * [Manage the service](#managing-service) (start it, stop it, and get its status)
 * How to [inspect node and service logs](#server-logs)

[Supported Erlang versions](./which-erlang) will be provisioned from one of the [modern Erlang apt repositories](#erlang-repositories)
on [Launchpad](https://launchpad.net/~rabbitmq) or [Team RabbitMQ's apt repositories](#apt-repositories).

Those looking for a more detailed description of the installation steps performed
should refer to

* Manual installation using [apt and the Team RabbitMQ's apt repositories](#apt-repositories) repository

More advanced topics include

 * [Version Pinning](#apt-pinning) of apt packages

## How to Install Latest RabbitMQ on Debian and Ubuntu {#installation-methods}

### With Apt

Currently, the recommended option for installing modern RabbitMQ on Debian and Ubuntu
is using Team RabbitMQ's apt repositories ([quick start script](#apt-quick-start), more detailed [step-by-step instructions](#apt-repositories)).

The repositories provide a [modern version of Erlang](./which-erlang). Alternatively, the latest
version of Erlang is available [via a Launchpad PPA and other repositories](#erlang-repositories).

### Manually Using Dpkg

Alternatively, the package can be downloaded manually and [installed ](#manual-installation) with `dpkg -i`.
This option will require manual installation of all RabbitMQ package dependencies and is **highly discouraged**.

## Supported Distributions {#supported-distributions}

RabbitMQ is supported on several major Debian-based distributions that are still covered
by general ("full", available at no extra cost) support by their primary vendor or developer group.

For Debian, this means that RabbitMQ core team focus around package is on the current and prior release of Debian-based distributions,
i.e. inline with [distribution EOL policy](https://wiki.debian.org/DebianReleases).

Currently the list of supported Debian-based distributions includes

 * Ubuntu 20.04 (Focal), 22.04 (Jammy) and 24.04 (Noble)
 * Debian Bullseye (11), Bookworm (12)

The package may work on other Debian-based distributions
if [dependencies](#manual-installation) are satisfied (e.g. using a backports repository)
but their testing and support is done on a best effort basis.


## Where to Get Recent Erlang Version on Debian and Ubuntu {#erlang-repositories}

RabbitMQ needs Erlang/OTP to run. Erlang/OTP packages in
standard Debian and Ubuntu repositories can be significantly out of date
and not [supported by modern RabbitMQ versions](./which-erlang).

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
      <td>26.x</td>
      <td>
      <ul>
      <li><a href="#apt-launchpad-erlang">Debian packages of Erlang</a> from Team RabbitMQ on Launchpad. Provides `arm64` (`aarch64`) packages</li>
      <li><a href="#apt-repositories">Debian packages of Erlang</a> from Team RabbitMQ. Provides `amd64` packages only.</li>
      </ul>
      </td>
      <td>
      <strong>Supported <a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.12.0">starting with 3.12.0</a></strong>, and is required starting with <a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.13.0">3.13.0</a>.
      See <a href="./which-erlang">Erlang compatibility guide</a>.
      </td>
    </tr>

    <tr>
      <td>25.x</td>
      <td>
      <ul>
      <li><a href="#apt-launchpad-erlang">Debian packages of Erlang</a> from Team RabbitMQ on Launchpad</li>
      <li><a href="https://packages.erlang-solutions.com/erlang/#tabs-debian">Erlang Solutions</a></li>
      <li><a href="#apt-repositories">Debian packages of Erlang</a> from Team RabbitMQ</li>
      </ul>
      </td>
      <td>
      <strong>Supported <a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.10.0">starting with 3.10.0</a></strong>, required starting with <a href="https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.11.0">3.11.0</a>.
      See <a href="./which-erlang">Erlang compatibility guide</a>.
      </td>
    </tr>
  </tbody>
</table>

This guide will focus on the <a href="#apt-repositories-erlang">Debian repositories</a> maintained by Team RabbitMQ and <a href="#apt-launchpad-erlang">on Launchpad</a>.


## Apt with Team RabbitMQ's Repositories: a Quick Start Script {#apt-quick-start}

Below is a shell snippet that performs the steps explained in this guide. It provisions
RabbitMQ and Erlang from a [Team RabbitMQ-hosted](#apt-repositories) apt repository.

:::important

This repository only provides `amd64` (`x86-64`) Erlang packages. For `arm64` (`aarch64`),
this script must be modified to provision a supported Erlang series [from Launchpad](#apt-launchpad-erlang).

:::

<Tabs groupId="distribution-specific">
<TabItem value="ubuntu-noble" label="Ubuntu 24.04" default>
```bash
#!/bin/sh

sudo apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null

## Add apt repositories maintained by Team RabbitMQ
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/ubuntu/noble noble main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/ubuntu/noble noble main

## Latest RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/ubuntu/noble noble main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/ubuntu/noble noble main
EOF

## Update package indices
sudo apt-get update -y

## Install Erlang packages
##
## For versions not compatible with the latest available Erlang series, which is the case
## for 3.13.x, apt must be instructed to install specifically Erlang 26.
## Alternatively this can be done via version pinning, documented further in this guide.
supported_erlang_version="1:26.2.5.13-1"
sudo apt-get install -y erlang-base=$supported_erlang_version \
                        erlang-asn1=$supported_erlang_version \
                        erlang-crypto=$supported_erlang_version \
                        erlang-eldap=$supported_erlang_version \
                        erlang-ftp=$supported_erlang_version \
                        erlang-inets=$supported_erlang_version \
                        erlang-mnesia=$supported_erlang_version \
                        erlang-os-mon=$supported_erlang_version \
                        erlang-parsetools=$supported_erlang_version \
                        erlang-public-key=$supported_erlang_version \
                        erlang-runtime-tools=$supported_erlang_version \
                        erlang-snmp=$supported_erlang_version \
                        erlang-ssl=$supported_erlang_version \
                        erlang-syntax-tools=$supported_erlang_version \
                        erlang-tftp=$supported_erlang_version \
                        erlang-tools=$supported_erlang_version \
                        erlang-xmerl=$supported_erlang_version

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
```
</TabItem>

<TabItem value="ubuntu-jammy" label="Ubuntu 22.04">
```bash
#!/bin/sh

sudo apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null

## Add apt repositories maintained by Team RabbitMQ
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/ubuntu/jammy jammy main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/ubuntu/jammy jammy main

## Latest RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/ubuntu/jammy jammy main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/ubuntu/jammy jammy main
EOF

## Update package indices
sudo apt-get update -y

## Install Erlang packages
##
## For versions not compatible with the latest available Erlang series, which is the case
## for 3.13.x, apt must be instructed to install specifically Erlang 26.
## Alternatively this can be done via version pinning, documented further in this guide.
supported_erlang_version="1:26.2.5.13-1"
sudo apt-get install -y erlang-base=$supported_erlang_version \
                        erlang-asn1=$supported_erlang_version \
                        erlang-crypto=$supported_erlang_version \
                        erlang-eldap=$supported_erlang_version \
                        erlang-ftp=$supported_erlang_version \
                        erlang-inets=$supported_erlang_version \
                        erlang-mnesia=$supported_erlang_version \
                        erlang-os-mon=$supported_erlang_version \
                        erlang-parsetools=$supported_erlang_version \
                        erlang-public-key=$supported_erlang_version \
                        erlang-runtime-tools=$supported_erlang_version \
                        erlang-snmp=$supported_erlang_version \
                        erlang-ssl=$supported_erlang_version \
                        erlang-syntax-tools=$supported_erlang_version \
                        erlang-tftp=$supported_erlang_version \
                        erlang-tools=$supported_erlang_version \
                        erlang-xmerl=$supported_erlang_version

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
```
</TabItem>

<TabItem value="ubuntu-focal" label="Ubuntu 20.04">
```bash
#!/bin/sh

sudo apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null

## Add apt repositories maintained by Team RabbitMQ
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/ubuntu/focal focal main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/ubuntu/focal focal main

## Latest RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/ubuntu/focal focal main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/ubuntu/focal focal main
EOF

## Update package indices
sudo apt-get update -y

## Install Erlang packages
##
## For versions not compatible with the latest available Erlang series, which is the case
## for 3.13.x, apt must be instructed to install specifically Erlang 26.
## Alternatively this can be done via version pinning, documented further in this guide.
supported_erlang_version="1:26.2.5.13-1"
sudo apt-get install -y erlang-base=$supported_erlang_version \
                        erlang-asn1=$supported_erlang_version \
                        erlang-crypto=$supported_erlang_version \
                        erlang-eldap=$supported_erlang_version \
                        erlang-ftp=$supported_erlang_version \
                        erlang-inets=$supported_erlang_version \
                        erlang-mnesia=$supported_erlang_version \
                        erlang-os-mon=$supported_erlang_version \
                        erlang-parsetools=$supported_erlang_version \
                        erlang-public-key=$supported_erlang_version \
                        erlang-runtime-tools=$supported_erlang_version \
                        erlang-snmp=$supported_erlang_version \
                        erlang-ssl=$supported_erlang_version \
                        erlang-syntax-tools=$supported_erlang_version \
                        erlang-tftp=$supported_erlang_version \
                        erlang-tools=$supported_erlang_version \
                        erlang-xmerl=$supported_erlang_version

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
```
</TabItem>

<TabItem value="debian-bookworm" label="Debian Bookworm">
```bash
#!/bin/sh

sudo apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null

## Add apt repositories maintained by Team RabbitMQ
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/debian/bookworm bookworm main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/debian/bookworm bookworm main

## Latest RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/debian/bookworm bookworm main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/debian/bookworm bookworm main
EOF

## Update package indices
sudo apt-get update -y

## Install Erlang packages
##
## For versions not compatible with the latest available Erlang series, which is the case
## for 3.13.x, apt must be instructed to install specifically Erlang 26.
## Alternatively this can be done via version pinning, documented further in this guide.
supported_erlang_version="1:26.2.5.13-1"
sudo apt-get install -y erlang-base=$supported_erlang_version \
                        erlang-asn1=$supported_erlang_version \
                        erlang-crypto=$supported_erlang_version \
                        erlang-eldap=$supported_erlang_version \
                        erlang-ftp=$supported_erlang_version \
                        erlang-inets=$supported_erlang_version \
                        erlang-mnesia=$supported_erlang_version \
                        erlang-os-mon=$supported_erlang_version \
                        erlang-parsetools=$supported_erlang_version \
                        erlang-public-key=$supported_erlang_version \
                        erlang-runtime-tools=$supported_erlang_version \
                        erlang-snmp=$supported_erlang_version \
                        erlang-ssl=$supported_erlang_version \
                        erlang-syntax-tools=$supported_erlang_version \
                        erlang-tftp=$supported_erlang_version \
                        erlang-tools=$supported_erlang_version \
                        erlang-xmerl=$supported_erlang_version

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
```
</TabItem>

<TabItem value="debian-bullseye" label="Debian Bullseye">
```bash
#!/bin/sh

sudo apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null

## Add apt repositories maintained by Team RabbitMQ
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/debian/bullseye bullseye main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/debian/bullseye bullseye main

## Latest RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/debian/bullseye bullseye main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/debian/bullseye bullseye main
EOF

## Update package indices
sudo apt-get update -y

## Install Erlang packages
##
## For versions not compatible with the latest available Erlang series, which is the case
## for 3.13.x, apt must be instructed to install specifically Erlang 26.
## Alternatively this can be done via version pinning, documented further in this guide.
supported_erlang_version="1:26.2.5.13-1"
sudo apt-get install -y erlang-base=$supported_erlang_version \
                        erlang-asn1=$supported_erlang_version \
                        erlang-crypto=$supported_erlang_version \
                        erlang-eldap=$supported_erlang_version \
                        erlang-ftp=$supported_erlang_version \
                        erlang-inets=$supported_erlang_version \
                        erlang-mnesia=$supported_erlang_version \
                        erlang-os-mon=$supported_erlang_version \
                        erlang-parsetools=$supported_erlang_version \
                        erlang-public-key=$supported_erlang_version \
                        erlang-runtime-tools=$supported_erlang_version \
                        erlang-snmp=$supported_erlang_version \
                        erlang-ssl=$supported_erlang_version \
                        erlang-syntax-tools=$supported_erlang_version \
                        erlang-tftp=$supported_erlang_version \
                        erlang-tools=$supported_erlang_version \
                        erlang-xmerl=$supported_erlang_version

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
```
</TabItem>
</Tabs>


## Using Apt with Team RabbitMQ's apt Repositories {#apt-repositories}

Team RabbitMQ maintains two apt repositories. They provide packages for most recent RabbitMQ and modern Erlang releases.

This guide will focus on a more traditional and explicit way of setting up additional apt repositories
and installing packages.

All steps covered below are **mandatory** unless otherwise specified.

### Install Essential Dependencies

```bash
sudo apt-get update -y

sudo apt-get install curl gnupg -y
```

### Enable apt HTTPS Transport

In order for apt to be able to download RabbitMQ and Erlang packages from the Team RabbitMQ apt repositories or Launchpad,
the `apt-transport-https` package must be installed:

```bash
sudo apt-get install apt-transport-https
```

### Add Repository Signing Key(s) {#signing-keys}

In order to use the repositories, first their signing key(s) must be added to the system.
This will enable apt to trust packages signed by that key.

```bash
sudo apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null
```

See the [guide on signatures](./signatures) to learn more.

### Add a Repository (Apt Source List) File

:::important
The contents of the file described in this section will vary slightly based on the target Debian-based distribution.
Make sure to switch to the appropriate tab.
:::

As with all 3rd party apt repositories, a file describing the RabbitMQ and Erlang package repositories
must be placed under the `/etc/apt/sources.list.d/` directory.
`/etc/apt/sources.list.d/rabbitmq.list` is the recommended location.

The contents of the file will vary slightly based on the distribution used.

<Tabs groupId="distribution-specific">
<TabItem value="ubuntu-noble" label="Ubuntu 24.04" default>
```bash
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/ubuntu/noble noble main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/ubuntu/noble noble main

## Provides modern RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/ubuntu/noble noble main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/ubuntu/noble noble main
EOF
```
</TabItem>

<TabItem value="ubuntu-jammy" label="Ubuntu 22.04">
```bash
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/ubuntu/jammy jammy main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/ubuntu/jammy jammy main

## Provides modern RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/ubuntu/jammy jammy main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/ubuntu/jammy jammy main
EOF
```
</TabItem>

<TabItem value="ubuntu-focal" label="Ubuntu 20.04">
```bash
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/ubuntu/focal focal main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/ubuntu/focal focal main

## Provides modern RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/ubuntu/focal focal main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/ubuntu/focal focal main
EOF
```
</TabItem>

<TabItem value="debian-bookworm" label="Debian Bookworm">
```bash
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/debian/bookworm bookworm main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/debian/bookworm bookworm main

## Provides modern RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/debian/bookworm bookworm main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/debian/bookworm bookworm main
EOF
```
</TabItem>

<TabItem value="debian-bullseye" label="Debian Bullseye">
```bash
sudo tee /etc/apt/sources.list.d/rabbitmq.list <<EOF
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/debian/bullseye bullseye main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/debian/bullseye bullseye main

## Provides modern RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/debian/bullseye bullseye main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/debian/bullseye bullseye main
EOF
```
</TabItem>
</Tabs>


#### Install Packages

After updating the list of `apt` sources it is necessary to run `apt-get update`:

```bash
sudo apt-get update -y
```

Then install the package with

```bash
## Install Erlang packages
##
## For versions not compatible with the latest available Erlang series, which is the case
## for 3.13.x, apt must be instructed to install specifically Erlang 26.
## Alternatively this can be done via version pinning, documented further in this guide.
supported_erlang_version="1:26.2.5.13-1"
sudo apt-get install -y erlang-base=$supported_erlang_version \
                        erlang-asn1=$supported_erlang_version \
                        erlang-crypto=$supported_erlang_version \
                        erlang-eldap=$supported_erlang_version \
                        erlang-ftp=$supported_erlang_version \
                        erlang-inets=$supported_erlang_version \
                        erlang-mnesia=$supported_erlang_version \
                        erlang-os-mon=$supported_erlang_version \
                        erlang-parsetools=$supported_erlang_version \
                        erlang-public-key=$supported_erlang_version \
                        erlang-runtime-tools=$supported_erlang_version \
                        erlang-snmp=$supported_erlang_version \
                        erlang-ssl=$supported_erlang_version \
                        erlang-syntax-tools=$supported_erlang_version \
                        erlang-tftp=$supported_erlang_version \
                        erlang-tools=$supported_erlang_version \
                        erlang-xmerl=$supported_erlang_version

## Install rabbitmq-server and its dependencies
sudo apt-get install rabbitmq-server -y --fix-missing
```



## Debian Package Version and Repository Pinning {#apt-pinning}

Version pinning is an **optional** step. If not used, `apt` will install the most recent version
available.

When the same package (e.g. `erlang-base`) is available from multiple apt repositories operators need
to have a way to indicate what repository should be preferred. It may also be desired to restrict Erlang version to avoid undesired upgrades.
[apt package pinning](https://wiki.debian.org/AptPreferences) feature can be used to address both problems.

Package pinning is configured with a file placed under the `/etc/apt/preferences.d/` directory, e.g. `/etc/apt/preferences.d/erlang`.
After updating apt preferences it is necessary to run `apt-get update`:

```bash
sudo apt-get update -y
```

The following preference file example will configure `apt` to install `erlang-*` packages from the Team RabbitMQ
apt repositories used in the examples above:

```ini
# /etc/apt/preferences.d/erlang
Package: erlang*
Pin: origin RabbitMQ
# Note: priority of 1001 (greater than 1000) allows for downgrading.
# To make package downgrading impossible, use a value of 999
Pin-Priority: 1001
```

The following is similar to the example above but prefers Launchpad:

```ini
# /etc/apt/preferences.d/erlang
Package: erlang*
Pin: origin ppa.launchpad.net
# Note: priority of 1001 (greater than 1000) allows for downgrading.
# To make package downgrading impossible, use a value of 999
Pin-Priority: 1001
```

Effective package pinning policy can be verified with

```bash
sudo apt-cache policy
```

The following preference file example will pin all `erlang-*` packages to 26.2.5.13
(assuming [package epoch](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Version) for the package is 1):

```ini
# /etc/apt/preferences.d/erlang
Package: erlang*
Pin: version 1:26.2.5.13-1
# Note: priority of 1001 (greater than 1000) allows for downgrading.
# To make package downgrading impossible, use a value of 999
Pin-Priority: 1001
```

The following preference file example will pin `rabbitmq-server` package to <RabbitMQServerVersion/>
(assuming [package epoch](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Version) for the package is 1):

<CodeBlock>
{`# /etc/apt/preferences.d/rabbitmq
Package: rabbitmq-server
Pin: version 1:${RabbitMQServerVersion()}-${RabbitMQServerPackageRevision({packageType: 'debian'})}
# Note: priority of 1001 (greater than 1000) allows for downgrading.
# To make package downgrading impossible, use a value of 999
Pin-Priority: 1001`}
</CodeBlock>


## Manual Installation with Dpkg {#manual-installation}

In some cases it may be easier to download the package directly from GitHub and install it manually using `sudo dpkg -i`.
Below is a download link.

| Description | Download | Signature |
|-------------|----------|-----------|
| .deb for Debian-based Linux (from <a href="https://github.com/rabbitmq/rabbitmq-server/releases">GitHub</a>) | <a href={RabbitMQServerPackageURL({packageType: 'debian'})}>{RabbitMQServerPackageFilename({packageType: 'debian'})}</a> | <a href={RabbitMQServerPackageSigURL({packageType: 'debian'})}>Signature</a> |

When installing manually with `dpkg`, it is necessary to install package dependencies first.
`dpkg`, unlike `apt`, does not resolve or manage dependencies.

Here's an example that does that, installs `wget`, downloads the RabbitMQ package and installs it:

<CodeBlock language="bash">
{`# sync package metadata
sudo apt-get update
# install dependencies manually
sudo apt-get -y install logrotate init-system-helpers adduser

# download the package
sudo apt-get -y install wget
wget ${RabbitMQServerPackageURL({packageType: 'debian'})}

# install the package with dpkg
sudo dpkg -i ${RabbitMQServerPackageFilename({packageType: 'debian'})}

rm ${RabbitMQServerPackageFilename({packageType: 'debian'})}`}
</CodeBlock>

Installation via [apt repositories](#apt-repositories) is recommended
over downloading the package directly and installing via `dpkg -i`. When the RabbitMQ
package is installed manually with `dpkg -i` the operator is responsible for making sure
that all package dependencies are met.


## User Privilege Requirements {#sudo-requirements}

RabbitMQ Debian package will require `sudo` privileges to install and manage.
In environments where `sudo` isn't available, consider using the
[generic binary build](./install-generic-unix) instead.

## Run RabbitMQ Server {#running-debian}

#### Start the Server

The server is started as a daemon by default when the
RabbitMQ server package is installed. It will run as a non-privileged user `rabbitmq`.

As an administrator, start and stop the
server as usual for Debian-based systems:

```bash
systemctl start rabbitmq-server
```


## Configuring RabbitMQ {#configuration}

On most systems, a node should be able to start and run with all defaults.
Please refer to the [Configuration guide](./configure) to learn more
and [Deployment Guidelines](./production-checklist) for guidelines beyond
development environments.

Note: the node is set up to run as system user `rabbitmq`.
If [location of the node database or the logs](./relocate) is changed,
the files and directories must be owned by this user.


## Port Access {#ports}

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

If the limits above are set to a value higher than 65536,
[the `ERL_MAX_PORTS` environment variable](./networking#erl-max-ports) must be updated accordingly to increase a [runtime](./runtime) limit.

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


## Managing the Service {#managing-service}

To start and stop the server, use the `systemctl` tool.
The service name is `rabbitmq-server`:

```bash
# stop the local node
sudo systemctl stop rabbitmq-server

# start it back
sudo systemctl start rabbitmq-server
```

`systemctl status rabbitmq-server` will report service status
as observed by systemd (or similar service manager):

```bash
# check on service status as observed by service manager
sudo systemctl status rabbitmq-server
```

It will produce output similar to this:

```ini
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

Aug 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##  ##
Aug 26 10:21:30 localhost.localdomain rabbitmq-server[957]: ##  ##      RabbitMQ 3.13.7. Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.
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
Aug 26 11:03:04 localhost rabbitmq-server[968]: ##  ##      RabbitMQ 3.13.7. Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.
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



## Install Erlang from an Apt Repository (PPA) on Launchpad {#apt-launchpad-erlang}

This additional section covers installation of modern Erlang packages from Launchpad. To install
modern Erlang and RabbitMQ, please refer to [Install RabbitMQ from Team RabbitMQ's apt repositories](#apt-repositories).

### Modern Erlang on Ubuntu

:::important
The apt repositories described in this section are specific to Ubuntu.
They **cannot** be used with Debian distributions.
:::

Standard Debian and Ubuntu repositories tend to provide outdated versions of Erlang/OTP. Team RabbitMQ maintains
several apt repositories that includes [packages of latest Erlang/OTP releases](https://launchpad.net/~rabbitmq/)
on Launchpad:

 * For [the latest Erlang](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang) major supported by RabbitMQ
 * For [Erlang 27.x](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang-27)
 * For [Erlang 26.x](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang-26)
 * For [Erlang 25.x](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang-25)

The Erlang repositores on Launchpad currently target the following Ubuntu distributions:

 * Ubuntu 24.04 (Noble)
 * Ubuntu 22.04 (Jammy)

In order to use the repository, it is necessary to

 * Install prerequisites needed to download signing keys and packages over HTTPS
 * Add repository signing key to your system. `apt` will verify package signatures during installation.
 * Add a source list file for the repository
 * Update package metadata
 * Install Erlang packages required by RabbitMQ

### Install Essential Dependencies

```bash
sudo apt-get update -y

sudo apt-get install curl gnupg -y
```

### Add Repository Signing Key {#erlang-apt-repo-signing-key}

In order to use the repository, add [RabbitMQ signing key](./signatures) to the system.
This will enable apt to trust packages signed by that key.

```bash
# primary RabbitMQ signing key
curl -1sLf "https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.github.rabbitmq.signing.gpg > /dev/null

# Launchpad PPA signing key for apt
curl -1sLf "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xf77f1eda57ebb1cc" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg > /dev/null
```

See the [guide on signatures](./signatures) to learn more.

### Enable apt HTTPS Transport {#erlang-apt-https-transport}

In order for apt to be able to download RabbitMQ and Erlang packages from the Team RabbitMQ apt repositories or Launchpad,
the `apt-transport-https` package must be installed:

```bash
sudo apt-get install apt-transport-https
```

### Add a Source List File {#erlang-source-list-file}

:::important
The contents of the file described in this section will vary slightly based on the target Debian-based distribution.
Make sure to switch to the appropriate tab.
:::

As with all 3rd party Apt (Debian) repositories, a file describing the repository
must be placed under the `/etc/apt/sources.list.d/` directory.
`/etc/apt/sources.list.d/erlang.list` is the recommended location.

The file should have a repository (apt source file) definition line. Its
contents will vary from Ubuntu version to Ubuntu version.

<Tabs groupId="distribution-specific">
<TabItem value="ubuntu-noble" label="Ubuntu 24.04" default>
```bash
# This Launchpad PPA repository provides Erlang packages produced by the RabbitMQ team
#
# Replace $distribution with the name of the Ubuntu release used
deb [arch=amd64 signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu noble main
deb-src [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu noble main
```
</TabItem>


<TabItem value="ubuntu-jammy" label="Ubuntu 22.04">
```bash
# This Launchpad PPA repository provides Erlang packages produced by the RabbitMQ team
#
# Replace $distribution with the name of the Ubuntu release used
deb [arch=amd64 signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu jammy main
deb-src [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu jammy main
```
</TabItem>

<TabItem value="ubuntu-focal" label="Ubuntu 20.04">
```bash
# This Launchpad PPA repository provides Erlang packages produced by the RabbitMQ team
#
# Replace $distribution with the name of the Ubuntu release used
deb [arch=amd64 signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu focal main
deb-src [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu focal main
```
</TabItem>
</Tabs>

### Install Erlang Packages {#installing-erlang-package}

After updating the list of `apt` sources it is necessary to run `apt-get update`:

```bash
sudo apt-get update -y
```

Then packages can be installed just like with the standard Debian repositories:

```bash
# This is recommended. Metapackages such as erlang and erlang-nox must only be used
# with apt version pinning. They do not pin their dependency versions.
sudo apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl
```
