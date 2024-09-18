---
title: "CentOS 7 Support is Discontinued from May, 2022"
tags: ["Updates", ]
authors: [mklishin]
---

RabbitMQ RPM packages for CentOS 7 will be discontinued from May 2022 because
that CentOS release series provides outdated versions of OpenSSL and Linux kernel.

CentOS 7 users are recommended to migrate to a new cluster which uses a more recent distribution
via one of the options:

 * [In-place Upgrades](/docs/upgrade#rolling-upgrade)
 * [definition transfer](/docs/definitions)
 * [Blue-Green Deployment upgrade](/docs/upgrade#blue-green-deployment).

<!-- truncate -->

From the 1st of May 2022, RabbitMQ will discontinue support for CentOS 7.
Going forward, RabbitMQ RPM packages will support modern RPM-based distributions only, distributions such as: [Fedora](https://getfedora.org/), [Rocky Linux](https://rockylinux.org/), [CentOS Stream 8](https://www.centos.org/centos-stream/),
and [Centos Stream 9](https://centos.org/stream9/) (when it goes GA).

## The Reasons Why CentOS 7 is Being Discontinued

 * CentOS 7 still runs version 1.0 of OpenSSL. RabbitMQ requires 23.x and 24.x Erlang/OTP versions which in turn
   require OpenSSL 1.1 at a minimum for modern cryptography support in Erlang. With CentOS 7 still running on
   OpenSSL 1.0, this is one  of the reasons RabbitMQ needs to discontinue its use.
 * CentOS 7 still runs version 3.x of the Linux kernel (a later version of the Linux kernel is needed).
 * There are many advances in OpenSSL version 1.1 compared to OpenSSL version 1.0 (which CentOS 7 still runs on).
   As a result, many projects including Erlang/OTP now require OpenSSL version 1.1.


## What is Changing?

 * The upcoming [RabbitMQ 3.10](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.10.0-rc.4) release will not include packages for CentOS 7.
 * Any new patch releases of RabbitMQ 3.9 starting with 3.9.17 and of RabbitMQ 3.8 starting with 3.8.31 will not include packages for CentOS 7.
   Learn more about [RabbitMQ release series](/release-information) in RabbitMQ documentation.
 * [Erlang RPM packages](https://github.com/rabbitmq/erlang-rpm) of Erlang 24.3 produced by our team
    now provide packages compatible with [Fedora](https://getfedora.org/), [Rocky Linux](https://rockylinux.org/), [CentOS Stream 8](https://www.centos.org/centos-stream/),
    and [Centos Stream 9](https://centos.org/stream9/).

## What is not Changing?

 * Previously published RabbitMQ releases that currently include RPM packages for CentOS 7 can still be used.
 * [Erlang RPM packages](https://github.com/rabbitmq/erlang-rpm) of Erlang 23.3 releases can still be used.


## The Actions You Must Complete

To use RabbitMQ 3.10 version onwards with a Red Hat family operating system, you must migrate your RabbitMQ deployments
to one of: Fedora, Rocky Linux, Red Hat Linux 8.5, CentOS Stream 8, or CentOS Stream 9. The [ELevate project](https://almalinux.org/elevate)
is an emerging tool that makes it easier to migrate from CentOS 7 to a more modern Red Hat Linux family distribution.

Operating system migrations can be completed in several ways:

 * [In-place Upgrades](/docs/upgrade#rolling-upgrade)
 * Creation of a new cluster and [schema transfer](/docs/definitions) from the original one
 * [Blue-Green Deployment Upgrades](/docs/upgrade#blue-green-deployment)

Note: If you want to or it is a requirement that you need to upgrade the OS, the kernel, Erlang/OTP, and RabbitMQ at the same time,
then it is highly recommended that you upgrade by either creating a new cluster and [transferring the schema](/docs/definitions)
to it or by completing the [Blue/Green deployment upgrade](/docs/blue-green-upgrade) process.

