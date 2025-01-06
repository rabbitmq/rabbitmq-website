---
title: "What's New in RabbitMQ 3.7"
tags: ["New Features", ]
authors: [mklishin]
---

After over 1 year in the works, RabbitMQ 3.7.0 has quietly shipped
right before the start of the holiday season. The release was heavily
inspired by the community feedback on 3.6.x. In this post we'd like to
cover some of the highlights in this release.

<!-- truncate -->

RabbitMQ 3.7.0 focuses on automation friendliness and
operability.

## New Configuration Format

Let's start with the new configuration
format. Historically RabbitMQ has used Erlang term files for
configuration. We will cover the pros and cons of this in a separate
blog post. Most importantly the classic format is hard to generate,
which complicates automation.

The new format is heavily inspired by sysctl and ini files. It is
easier to read for humans and much easier to generate for provisioning
tools.

Compare the following examples from [our TLS guide](/docs/ssl).

Classic (Erlang terms) format:

```erlang
[
    {ssl, [{versions, ['tlsv1.2', 'tlsv1.1']}]},
    {rabbit, [
            {ssl_listeners, [5671]},
            {ssl_options, [{cacertfile,"/path/to/ca_certificate.pem"},
                            {certfile,  "/path/to/server_certificate.pem"},
                            {keyfile,   "/path/to/server_key.pem"},
                            {versions, ['tlsv1.2', 'tlsv1.1']}
                            ]}
            ]}
].
```

versus the new format:

```ini
listeners.ssl.1 = 5671
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.versions.1 = tlsv1.2
ssl_options.versions.2 = tlsv1.1
```

In addition to being more friendly to humans and machines
this new config file includes validation for keys and certain value
types such as file paths. Should a certificate or public key file
not exist, the node will report it and fail to start. Same for
unknown or misspelled keys.

Expect a more detailed post about the new format in the future.

## Peer Discovery Subsystem

When a RabbitMQ cluster is first formed, newly booting nodes need
to have a way to discover each other. In versions up to and including 3.6.x were
two ways of doing this:

 * CLI tools
 * A list of nodes in configuration file

The former option is used by some provisioning tools but is generlaly
not very automation friendly. The latter is more convenient but
has its own limitations: the set of nodes is fixed and changing it requires
a config file redeployment and node restart.

There is a third option and it has existed in the community for a few years:
[rabbitmq-autocluster](https://github.com/rabbitmq/rabbitmq-autocluster) by Gavin Roy.
That plugin modifies RabbitMQ boot process and makes peer discovery more
dynamic: for example, the list of peers can be retrieved from an AWS autoscaling group
or an external tool such as [etcd](https://coreos.com/etcd/docs/latest/).

For RabbitMQ 3.7.0 we took `rabbitmq-autocluster` and integrated its
main ideas into the core with some modifications inspired by our
experience with production RabbitMQ installations and community
feedback.

The result is a new [peer discovery subsystem](/docs/cluster-formation) which will be covered
in a separate blog post. It supports a number of mechanisms and platforms:

 * AWS (EC2 instance tags or autoscaling groups)
 * Kubernetes
 * etcd
 * Consul
 * Pre-configured DNS records
 * Config file

and makes it easy to introduce support for more options in the future.


## Distributed Management Plugin

Statistics database overload was a major pain point in earlier
releases.  It had to do with the original management plugin design
which delegated stats collection and aggregation for the entire cluster
to a single dedicated node. No matter how efficient that node is, this
has scalability limitations.

At some point this problem accounted for a significant portion of
the support tickets and mailing list threads, so it was decided that
a significant and breaking management plugin redesign was warranted.

In the new design, each node hosts and aggregates its own stats, and
requests data from other nodes as needed when an HTTP API request
comes in.  We now have close to a year worth of support data and user
feedback and happy to report that stats DB overload is effectively no
longer an issue.

These changes were backported to 3.6.x releases starting with [3.6.7](https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_6_7).


## Redesigned CLI Tools

One long standing limitation of RabbitMQ CLI was the fact
that plugins could not extend it. This changes with the 3.7.0 release.
Plugins such as Shovel and Federation now can provide their own commands
that help operators assess the state of the system and manage it.

`rabbitmq-diagnostics` is a new command for operators that include
some of the commands previously available in `rabbitmqctl` but also
new ones. The list of diagnostics commands will continue to grow
based on user feedback on our [mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users).


## Proxy Protocol Support

It's fairly common for clients to connect to RabbitMQ nodes via a proxy
such as HAproxy or AWS ELB. This created a complication for operators:
real client IP addresses were no longer known to the nodes and therefore
cannot be logged, displayed in the management UI, and so on.

Fortunately a solution to this problem exists and is supported by
some of the most popular proxy tools: the [Proxy protocol](https://www.haproxy.org/download/3.1/doc/proxy-protocol.txt).
Starting with 3.7.0, RabbitMQ supports Proxy protocol if the operator
opts in. It requires a compatible proxy but no client library changes.
Per Proxy protocol spec requirements, when the protocol is enabled,
direct client connections are no longer supported.


## Cross-protocol Shovel

The [Shovel plugin](/docs/shovel) now supports AMQP 1.0 endpoints in both directions (as a source
and destinations). This means that Shovel now can move messages from an AMQP 1.0 only broker to RabbitMQ or vice versa.


## Operator Policies

[Operator policies](/docs/parameters#operator-policies) work much like [regular policies](/docs/parameters) but
can only be managed by administrators and will override user-defined policies. Operators that
offer RabbitMQ as a service can use them to cap e.g. [max queue length](/docs/maxlength) on specific plans.


## Per-vhost Message Stores

Starting with 3.7.0, each virtual host gets its own message store
(actually, two stores). This was primarily done to improve resilience
and limit potential message store failures to an individual vhost
but it can also improve disk I/O utilization in environments
where multiple virtual hosts are used.


## Other Noteworthy Changes

The minimum required Erlang/OTP version is now 19.3. We highly
recommend at least 19.3.6.5. That release contains fixes to two
bugs that could prevent nodes with active TCP connections from shutting down,
which in turn could greatly complicate automated upgrades. That version
together with 20.1.7 and 20.2.x contain a fix for the recently disclosed
[ROBOT TLS attack](https://robotattack.org/).

During the 3.7 development cycle we introduced a new versioning scheme for clients.
Client library releases for Java and .NET are no longer tied to those of RabbitMQ
server. This allows clients to evolve more rapidly and follow a versioning
scheme that makes sense for them. Both Java and .NET clients are into
their 5.x versions by now, and include important changes that warrant
a major version number bump, for example, lambda and .NET Core support.


## Package Distribution Changes

Starting with 3.7.0, RabbitMQ packages (binary artifacts) are distributed using 
three services:

 * [Bintray](https://bintray.com/rabbitmq/) provides package downloads as well as a Debian and Yum (RPM) repositories
 * [Package Cloud](https://packagecloud.io/rabbitmq) provides Debian and Yum repositories
 * [GitHub releases](https://github.com/rabbitmq/rabbitmq-server/releases/) include all release notes and provide a backup package download option

If you currently consume packages from rabbitmq.com, please switch to one of options above.

Unlike rabbitmq.com's legacy apt repository, Package Cloud and Bintray provide package versions older
than the most recent one. And, of course, now there are official Yum repositories for RabbitMQ itself
as well as our [zero dependency Erlang/OTP RPM package](https://github.com/rabbitmq/erlang-rpm).

Java client releases are now distributed exclusively via Maven repositories
(most notably Maven Central). .NET client releases are only offered via NuGet.


## Upgrading to 3.7.x

We encourage all users to [upgrade to 3.7.x](/docs/download) and let us know how it goes
on the [mailing list](https://groups.google.com/forum/#!forum/rabbitmq-users). To simplify the transition, there is a new [documentation
guide on upgrades](/docs/upgrade). And, of course,
please consult the [full change log](/release-information)
first!
