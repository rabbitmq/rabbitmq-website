---
title: "Erlang 24 Support Roadmap"
tags: ["Performance", "Erlang", "Updates", ]
authors: [mklishin]
---

## TL;DR

 * Erlang 24 will ship in May and it offers significant performance gains to RabbitMQ users
 * Supporting Erlang 24 and 22 at the same time is not feasible, so in early May 2021, Erlang 22 support will be dropped
 * If you run on Erlang 22, upgrade to 23.2 today: it should be a drop-in replacement
 * Users of the [RabbitMQ Kubernetes Operator](https://github.com/rabbitmq/cluster-operator), the [Docker community image](https://github.com/docker-library/rabbitmq) and modern releases of [VMware Tanzu RabbitMQ for VMs](https://docs.pivotal.io/rabbitmq-cf/1-21/index.html#:~:text=RabbitMQ%20for%20VMs.-,About%20VMware%20Tanzu%20RabbitMQ%20for%20VMs,and%20a%20pre%2Dprovisioned%20service.&text=Dedicated%20VM%20that%20serves%20a%20single%20service%20instance.) are not affected as those projects all use Erlang 23 today

<!-- truncate -->

## New Erlang Release is on The Finish Line

The core team has recently made RabbitMQ compatible with Erlang 24 which we expect to be released in May. This is a significant release and RabbitMQ users will benefit from it. In the process we have concluded that supporting Erlang 22 and 24 at the same time is not feasible. We believe that most users would
strongly prefer to move to Erlang 24 given the benefits (see below) instead
of sticking to Erlang 22 for longer.

As such, Erlang 22 support will be dropped about three months earlier than our
standard [Erlang release support policy](/docs/which-erlang) outlines: **on May 3rd 2021**.
A GA release of Erlang 24 is expected to come out in early to mid-May.

## What You Should Do Today

To avoid any inconvenience, you can move to Erlang 23 today. We expect that this version will be supported until at least April 2022.
Erlang 23 is no longer a new release hot off the presses, and it's already very widely used by RabbitMQ users.
For example, the Docker community image provides the most recent Erlang 23 release
available, and the image is automatically rebuilt when new RabbitMQ, Erlang or OpenSSL releases come out.

## Erlang 24 Benefits

[Erlang 24](https://www.erlang.org/news/144) brings a number of positive changes that directly or indirectly
affect nearly every RabbitMQ user.

### Improved Performance

 Erlang 24 introduces a JIT to the runtime and that results in significant throughput gains for real world systems, including RabbitMQ nodes.
 Both Erlang/OTP maintainers and our team have [observed improvements](https://www.erlang-solutions.com/blog/performance-testing-the-jit-compiler-for-the-beam-vm/) in the 35-55% range depending on the workload.
 Since this is potentially relevant to every single RabbitMQ user, we believe this outweighs a couple of minor potentially
 breaking changes described below.

### Improved security

Erlang 24 continues improving (maturing) TLSv1.3 support, which is highly relevant as more and more tools move to support TLSv1.3
or even use it exclusively.

### Improved RabbitMQ Developement Process

For contributors and the RabbitMQ core team, Erlang 24 offers significant quality of life improvements:

 * Comparable sound double digit % reductions in compilation time
 * Significantly more informative reporting of errors and warnings (source code data and formatting similar to clang)
 * Standard library improvements (and deprecations)


## What Changes with Erlang 24

The substantial benefits listed above come at a cost that
most RabbitMQ users won't have to pay but some will.

Starting with 3.9, RabbitMQ will use a logging library from Erlang 24 instead of a 3rd party dependency.
That dependency — Lager — has served us well for many years but is no longer obviously superior to the standard library option.
This switch won't affect most users but two things change:

* Log event timestamp changes slightly
* Lager-specific extensions and advanced configuration won't be supported any more

The former can affect systems that attempt to parse RabbitMQ logs. The latter will require those who depend on those advanced
Lager sink configuration settings to build a small plugin that provides an equivalent.
If you only use the [standard logging settings](/docs/logging) or Syslog,
you won't lose anything.


## So What Is the Plan?

RabbitMQ 3.9 (master) already supports Erlang 24. On May 3rd, 2021 RabbitMQ 3.8 branch will have Erlang 24 support merged.
That will automatically retire Erlang 22 support and all future RabbitMQ 3.8 releases will require Erlang 23.
Upgrade to Erlang 23 today to make the transition smoother!

Note that we expect at least one more Erlang 22-compatible patch release to come out before May 3rd.

If you rely on RabbitMQ log parsing, the changes in timestamp formatting will be mentioned in 3.9 release notes when it comes out.

If you rely on [Lager-specific advanced configuration settings](/docs/logging),
you should be able to build a small plugin that e.g. implements a custom backend or adjusts the formatting using
the standard library logger API which provides most if not all features that Lager has.


## Community Docker Image and Kubernetes Operator for RabbitMQ

If you use the [Docker community RabbitMQ image](https://github.com/docker-library/rabbitmq) and have updated it recently, you already run on a very recent
release of Erlang 23. So do most [RabbitMQ Kubernetes Operator](/kubernetes/operator/operator-overview) users.
The image will be upgraded to Erlang 24 likely a few weeks after it comes out,
unless any serious enough Erlang 24-specific issues are discovered.

Other Docker images likely already use Erlang 23 but this is something that you should verify
if you use one of those images.


## Feedback

If you have any questions or feedback, please share it in the [RabbitMQ community Slack](https://rabbitmq-slack.herokuapp.com/)
in the `#usage-questions` and `#core-and-plugin-dev` channels.
