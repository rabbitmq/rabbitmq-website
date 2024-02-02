---
title: "Preparing for the Bintray Shutdown: How to Migrate"
tags: ["Updates", ]
authors: [mklishin]
---

Bintray, one of the services our team currently uses to distribute packages,
is [shutting down on May 1st, 2021](https://jfrog.com/blog/into-the-sunset-bintray-jcenter-gocenter-and-chartcenter/).

This post explains what alternative services are available for the RabbitMQ community today or will be before
the shutdown date.

No new releases will be published to Bintray going forward. Those who do not switch from Bintray
before May 1st will see their **deployments begin failing**. We highly recommend making
migration off of Bintray both an important and urgent task.

<!-- truncate -->

## Big Shoes to Fill

Bintray has served our community well for years. The JFrog team were very generous with our customized open source
project limits and in general helpful with our requests.

RabbitMQ distributes multiple package types, including modern Erlang
packages for several distributions, and Bintray acommodated all of them.

Some package hosting services specialize won't be able to replace Bintray alone.
This means that the migration options will differ depending on what package type you use.

In the next section we will cover the options available today and mention another one that
is coming down the line.

## The Post-Bintray Era Options

What service you should migrate to depends on how you provision RabbitMQ.

Team RabbitMQ already publishes release artifacts to a few places:

 * GitHub [releases of RabbitMQ](https://github.com/rabbitmq/rabbitmq-server/releases): distributes every package type plus Debian package source files
 * [PackageCloud](https://packagecloud.io/rabbitmq): this repository provides Debian and RPM packages

Our team plans to adopt [Cloudsmith.io](https://cloudsmith.io/~rabbitmq/repos/) in addition to the above options.
Cloudsmith supports multiple package types and we have had promising initial experience with it.
Publishing RabbitMQ Debian packages via Launchpad is also under consideration.

In addition, our team produces and distributes packages of modern Erlang versions via

 * [Launchpad PPA](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang) for Ubuntu and Debian
 * GitHub [releases of zero-dependency Erlang RPM](https://github.com/rabbitmq/erlang-rpm/releases)

### Docker Community Image and Kubernetes Operator

If this is via the [Docker community image](https://github.com/docker-library/rabbitmq),
then **nothing changes** for you as the image does not depend on Bintray and is not distributed via Bintray.

This is equally true for the [RabbitMQ Kubernetes Operator](/kubernetes/operator/operator-overview) users.

### Binary Builds

[RabbitMQ binary builds](/docs/install-generic-unix) (a.k.a. generic UNIX builds) are best consumed from [GitHub releases](https://github.com/rabbitmq/rabbitmq-server/releases).

If you currently consume these packages from Bintray, updating the download location to use
GitHub releases is all there is to do.

### Windows Packages

Windows users who use [Chocolatey](/docs/install-windows#chocolatey) are not affected by this transition.

[RabbitMQ installer](/docs/install-windows#installer) and [Windows binary build](/docs/install-windows-manual) users
should now consume from [GitHub releases](https://github.com/rabbitmq/rabbitmq-server/releases).

### Debian Packages of Modern Erlang

Team RabbitMQ's [Debian packages of modern Erlang](https://github.com/rabbitmq/erlang-debian-package) has found
a new home in a [Launchpad PPA](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang).

While Launchpad is an Ubuntu-oriented service, it can also be [used as a regular apt repository](/docs/install-debian#apt-launchpad-erlang)
by Debian users.

These packages are also [available from Cloudsmith.io](/docs/install-debian#apt-cloudsmith).

In order to migrate, remove the existing `.list` file under `/etc/apt/sources.list.d` and install a new one
as explained in the [Debian installation doc guide](/docs/install-debian).

Next, import the [signing key](/docs/install-debian#erlang-apt-repo-signing-key) used by
the Launchpad repository.

Finally, run

``` shell
sudo apt update -y
```

and re-install the packages.

### Debian Packages of RabbitMQ

The options available for RabbitMQ Debian packages are as follows:

 * Using an [apt repository on PackageCloud](/docs/install-debian#apt-cloudsmith), including a [quick start example](/docs/install-debian#apt-quick-start-cloudsmith)
 * Using a [direct download](/docs/install-debian#manual-installation) from GitHub and installing its [dependencies](/docs/install-debian#manual-installation) the local package using `dpkg`

Our team plans to also distribute this package via [Cloudsmith.io](https://cloudsmith.io/~rabbitmq/repos/) in the near future.

In order to migrate, remove the existing `.list` file under `/etc/apt/sources.list.d` and install a new one
as explained in the [Debian installation doc guide](/docs/install-debian).

Next, import the [signing key](/docs/install-debian#erlang-apt-repo-signing-key) used by
the PackageCloud repository.

Finally, run

``` shell
sudo apt update -y
```

and re-install the packages.

### RPM Packages of Modern Erlang

Team RabbitMQ's own [zero dependency Erlang RPM](https://github.com/rabbitmq/erlang-rpm/) can be consumed in a couple of ways:

 * Using a [Yum repository on PackageCloud](https://github.com/rabbitmq/erlang-rpm#latest-erlang-version-from-packagecloud)
 * Using a direct download from [GitHub releases](https://github.com/rabbitmq/erlang-rpm/releases) and installing the local package using `rpm install`

Our team plans to also distribute this package via [Cloudsmith.io](https://cloudsmith.io/~rabbitmq/repos/) in the near future.

In order to migrate, remove the existing `.repo` file under `/etc/yum.repos.d/` and install a new one
as explained in the [RPM installation doc guide](/docs/install-rpm).

Then run

``` shell
sudo yum clean all
sudo yum update -y
```

and re-install the packages.

### RPM Packages of RabbitMQ

The options for RabbitMQ RPM packages match to those listed above for our zero-dependency Erlang RPM:

 * Using a [Yum repository on PackageCloud](/docs/install-rpm#cloudsmith). This would cover RHEL, CentOS, modern Fedora and openSUSE
 * Using a [direct download](/docs/install-rpm#downloads) from GitHub and installing its [dependencies](/docs/install-rpm#package-dependencies) the local package using `rpm install`

Our team plans to also distribute this package via [Cloudsmith.io](https://cloudsmith.io/~rabbitmq/repos/) in the near future.

In order to migrate, remove the existing `.repo` file under `/etc/yum.repos.d/` and install a new one
as explained in the [RPM installation doc guide](/docs/install-rpm).

Then run

``` shell
sudo yum clean all
sudo yum update -y
```

and re-install the packages.


## Feedback

If you have any questions or feedback, please share it in the [RabbitMQ community Slack](https://rabbitmq-slack.herokuapp.com/)
in the `#usage-questions` and `#core-and-plugin-dev` channels.
