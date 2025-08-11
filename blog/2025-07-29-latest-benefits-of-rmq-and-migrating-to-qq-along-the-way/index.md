---
title: "Migrating from Classic Mirrored Queues to Quorum Queues in 2025"
tags: ["Classic Queues", "Quorum Queues", "RabbitMQ 4.1", "Upgrade"]
authors: [aperez, mklishin]
---

# Introduction

RabbitMQ 4 has been out for some time by now, and we have covered some of the goodies it comes with,
compared to its predecesor, RabbitMQ 3.13. Some examples are
[improved performance](/blog/2025/04/08/4.1-performance-improvements),
[Native AMQP 1.0](/blog/2024/08/05/native-amqp), new
[Quorum Queue features](/blog/2024/08/28/quorum-queues-in-4.0), bringing
closer feature parity with Classic Queues.

<!-- truncate -->

It's been a while since we wrote about
[how to migrate](/blog/2023/03/02/quorum-queues-migration) from Classic
Mirrored Queues (CMQ) to Quorum Queues (QQ). In case you already don't know, CMQs are deprecated
since RabbitMQ 3.9, and were removed in RabbitMQ 4.0. Today we are going to cover Quorum Queues in
more detailed, comparing them to CMQs, and high level migration stategies to abandon CMQs for good,
in favour of QQs, or a combination of QQ and Classic Queues (CQ). Note that CQs are still well
supported, it's their mirroring feature what was deprecated and removed.

# Why Quorum Queues?

Mirrored Classic Queues, a.k.a. Classic Mirrored Queues, a.k.a. CMQs, were introduced to add in-cluster data replication to
classic queues (CQs). The CQs were originally designed as a non-replicated queue type back in 2006,
during the first year of RabbitMQ development.

Then around 2009, the mirroring feature added the ability to replicate
data to other nodes. The algorithm to "mirror" data was homegrown, and it was not very resilient to
network partitions. To make matters worse, the behaviour in failure scenarios of CMQs was
unpredictable in some cases, and generally quite hard to reason about. There were even cases where
[CMQs could lose messages](https://jack-vanlightly.com/blog/2018/9/10/how-to-lose-messages-on-a-rabbitmq-cluster).

To address all these issues, and to supercharge RabbitMQ with a reliable, safe and replicated queue
type, Quorum Queues were designed and incorporated to RabbitMQ.

[Quorum Queues][qq] are replicated queue type from the ground up, based on [Raft consensus algorithm][raft-algo].
Quorum Queues are designed with data safety as top priority.  All QQs have a leader and some followers; locagically, leader and followers are
distributed among RabbitMQ nodes. When a QQ leader receives a message, it records this operation in
a write-ahead log (WAL), then stores the message on disk on a local Raft log and in parallel issues replication commands
to the followers, and awaits for a confirmation from a majority before sending a confirmation back to the client.

One key difference with CMQs is that the replication part is done in parallel, while CMQs use a chain
replication algorithm. Another important difference between the two: [quorum queues pass a stricter version of the Jepsen test](/docs/quorum-queues#motivation), while CMQs fail to pass even a less
demanding original version.

In the event of a leader failure, the up-to-date followers start a voting process, and elect a new
QQ leader. The resulting leader will resume operations on the queue. You can learn more details
about [Raft consensus algorithm][raft-algo] in GitHub.

With those characteristics, QQs address the main issues of CMQs: data safety and
predictability of failure scenarios. On top of that, quorum queues offer [nearly a feature parity](/docs/quorum-queues#feature-comparison) and better throughput for many workloads.

However, QQs are not a good fit for certain use cases present
in messaging systems. For example: temporary queues used in e.g. RPC (request-reply) communication.

It doesn't make sense to use a quroum queue for very short lived transient data, since data safety
will not be a priority for such use cases. For example, if your applications use a
fire-and-forget approach to publish messages, and/or your consumer applications don't use manual
acknowledgement. For such use cases, Classic Queues **without mirroring** are an excelent fit.

# Migration from CMQs to QQs

Given the different nature of both queue types, including at the storage level, it is not possible to
turn an existing classic queue into a quorum queue "in place".

However, a [Blue-Green Deployment](/docs/blue-green-upgrade) can be used for
migrating. This is a strategy where applications are migrated from an existing cluster with mirrored classic queues,
called the "blue" cluster, to a new cluster, the "green" one, which will use quorum queues for all
classic queues that were replicated in the blue cluster.

RabbitMQ has tooling to facilitate the migration. [`rabbitmqadmin v2](/docs/management-cli),
an [HTTP API](/docs/management#http-api)-based CLI tool [built by the RabbitMQ Core Team at Broadcom](https://github.com/rabbitmq/rabbitmqadmin-ng/),
supports a number of commands that simplify the migration.

Before jumping into the details, let's take a look at how an existing RabbitMQ `3.13.x` cluster that
uses mirrored classic queues can be migrated to a new `4.1.x` cluster that will use quorum queues
for all replicated queues.

## High Level Migration Plan

The Blue-Green upgrade strategy has some requirements that must be met prior to the upgrade:

 * [RabbitMQ Queue Federation](/docs/federation) must be enabled
 * The Blue (original) cluster must be reachable from the Green (new) one for queue federation to work
 * The Green (new) RabbitMQ version must run a `4.x` version, ideally latest version available
 * All stable [feature flags](/docs/feature-flags) must be enabled in Green (new) cluster

Once the prerequisites are met, the migration plan consists of the following steps:

1. Export the definitions from the Blue cluster using `rabbitmqadmin` v2 and apply a few transformations to
   make sure that the definitions do not include any keys that the new cluster does not support (namely, the CMQ mirroring policies)
1. Import definitions into the Green cluster
1. Configure [queue federation](/docs/federated-queues) between the two clusters
1. Migrate consumers to the Green cluster
1. Migrate producers to the Green cluster
1. [Monitor](/docs/monitoring) the state of the Green cluster
1. Shutdown the original cluster
1. Remove a number of temporary migration policies from Green

Now, let's dive into the details.

## Considerations for Applications

Quorum Queues support all features of durable mirrored classic queues. That means that most applications
can be moved to the new cluster without any changes. For the small percentage of applications that explicitly
specifies a queue type, a [special `rabbitmq.conf` setting](/docs/quorum-queues#relaxed-property-equivalence)
can be used to relax a key queue property equivalence check performed by RabbitMQ nodes when a client
tries to declare a queue.

The [feature comparison matrix](/docs/quorum-queues#feature-comparison) covers how Quorum
Queues are different from Classic Queues.

This is a good moment to reconsider whether certain apps need to use replicated queues at all. For example, an
application that creates and binds a temporary queue to a fanout exchange, process information for
some time and deletes its queue after disconnection, will not benefit from what a replicated queue type —
quorum queues — have to offer, because the queue is very short lived, specific to a particular client,
and the app is capable of re-declaring its topology.

If some queues do not need to be replicated, remove the classic queue mirroring-related keys from
their policies before proceeding. The keys are

 * `"ha-mode"`
 * `"ha-params"`
 * `"ha-promote-on-shutdown"`
 * `"ha-promote-on-failure"`
 * `"ha-sync-mode"`
 * `"ha-sync-batch-size"`

Such non-replicated classic queues will be migrated as classic queues
to the Green cluster, avoiding the use of quorum queues where they are not necessary.

## Detailed Migration Plan

This plan has been tested with RabbitMQ Blue 3.13.7 and RabbitMQ Green 4.1.2. Both TLS, mTLS and
plain TCP has been tested. Both the CLI `rabbitmqadmin` v2 and RabbitMQ work without issues in all the
tested setups.

### Export Definitions From the Blue Cluster

In this step, we will backup all rabbitmq objects, excluding messages, to a JSON file. All
usernames, vhosts, queues, permissions, bindings, policies, parameters, exchanges, everything, will
be exported to a JSON file. It is possible to apply transformations to exclude certain data. This
transformations feature will greatly help with the CMQ to QQ migration.

The following command exports a definitions file of RabbitMQ and transforms the result by removing the deprecated CMQ policy
keys and [optional queue arguments](/docs/queues#optional-arguments),
replacing previously mirrored classic queues with quorum queues.

Any queue that had a mirroring [policy](/docs/policies) applied to it will be automatically
transformed into a Quorum Queue in the definitions (backup) file. If as a result of this
transformations, a policy becomes empty (beecause it only had CMQ keys), it will also be deleted,
because it is not possible to import empty policies in RabbitMQ.

RabbitMQ definitions are shared among all cluster nodes, therefore, it is only necessary to run this
command in one node.

```shell
# Export definitions from the original cluster into a file and applies two transformations
# to remove all traces of classic mirrored queues
rabbitmqadmin --host blue definitions export --file blue.json -t prepare_for_quorum_queue_migration,drop_empty_policies
```

### Import definitions

In this step, we will "restore" the definitions file from the previous step (with the CMQs
transformed into QQ) into the new "green" cluster. This command does not allow for much
configurability, it's a very straightforward step:

```shell
# Import definitions into the new (Green) cluster
rabbitmqadmin --host green definitions import --file ./blue.json
```

### Configure a Federation Upstream in Green

In this step, we will configure [queue federation](/docs/federated-queues). These steps are critically important because it's the queue
federation links that will be transferring any existing messages from the original cluster to the new ones,
which allows applications to be moved to the new cluster at a later stage.

Take some time to read through and prepare the commands in advance.

#### Create federation upstreams

**For each vhost**, create a federation upstream in **Green**:

```shell
rabbitmqadmin --host green federation declare_upstream_for_queues --name cmq-qq-migration --uri 'amqp://<federation-user>:<federation-password>@blue.rabbit'
```

Where `<federation-user>` is an **existing user** in **Blue** RabbitMQ. It is advisable to create a
dedicated user for federation.

Where `<federation-password>` is the federation user password used to authenticate in **Blue**
RabbitMQ.

#### Create Override Policies

This step creates ["override" policies](/docs/policies#override) to enable queue federation for all queues
that are already matched by a policy. Note that the override policy is a `rabbitmqadmin` v2 concept, not a
RabbitMQ HTTP API, so this operation can be performed on a `3.13.x` node.

In this step, we are configuring RabbitMQ to use [federated queues](/docs/federated-queues). Federated queues
transfer messages from the upstream cluster, when **local** consumers request messages __and__ local
queues are empty. This will allow you to move your consumer applications to Green without disruption
to your operations.

For each policy, create a policy override to utilise the federation upstream:

```shell
rabbitmqadmin --host green policies list
# => ┌──────┬─────────┬───────────────────────┬──────────┬──────────┬──────────────────┐
# => │ name │ vhost   │ pattern               │ apply_to │ priority │ definition       │
# => ├──────┼─────────┼───────────────────────┼──────────┼──────────┼──────────────────┤
# => │ ha   │ finance │ (?:^po$)|(?:.*\.dlx$) │ all      │ 0        │ max-length: 100  │
# => │      │         │                       │          │          │ queue-version: 2 │
# => │      │         │                       │          │          │                  │
# => └──────┴─────────┴───────────────────────┴──────────┴──────────┴──────────────────┘

rabbitmqadmin --host green policies declare_override --name ha --definition '{"federation-upstream": "cmq-qq-migration"}'
```

Next, create a [blanket/catch-all policy](/docs/policies#blanket) for any queues not matched by an existing policy:

```shell
rabbitmqadmin --host green policies declare_blanket --name cmq-qq-migration_blanket --apply-to queues --definition '{"federation-upstream": "cmq-qq-migration"}'
```

This will ensure that all queues are federated between the Blue and Green clusters.

#### Verify That Federation is Functional

Once the policies are created, the federation plugin in the Green cluster will create links (connections)
to the upstream (Blue). The presence of links ensures that federated queues are ready to move messages from the upstream (Blue)
into the Green cluster when the consuming applications are migrated from Blue to Green.

```shell
rabbitmqadmin --host green federation list_all_links
# => ┌──────────────┬─────────┬──────────┬─────────────────────┬─────────┬───────┬──────────────────┬──────────────────────────────────┐
# => │ node         │ vhost   │ id       │ uri                 │ status  │ type  │ upstream         │ consumer_tag                     │
# => ├──────────────┼─────────┼──────────┼─────────────────────┼─────────┼───────┼──────────────────┼──────────────────────────────────┤
# => │ rabbit@green │ finance │ 8f0f0d8a │ amqps://blue.rabbit │ running │ queue │ cmq-qq-migration │ federation-link-cmq-qq-migration │
# => ├──────────────┼─────────┼──────────┼─────────────────────┼─────────┼───────┼──────────────────┼──────────────────────────────────┤
# => │ rabbit@green │ finance │ 01efa5b5 │ amqps://blue.rabbit │ running │ queue │ cmq-qq-migration │ federation-link-cmq-qq-migration │
# => ├──────────────┼─────────┼──────────┼─────────────────────┼─────────┼───────┼──────────────────┼──────────────────────────────────┤
# => │ rabbit@green │ finance │ 950faf11 │ amqps://blue.rabbit │ running │ queue │ cmq-qq-migration │ federation-link-cmq-qq-migration │
# => └──────────────┴─────────┴──────────┴─────────────────────┴─────────┴───────┴──────────────────┴──────────────────────────────────┘
```

#### Prepare to Move Consumers

Both RabbitMQ clusters (Blue and Green) are ready to support a migration. The first step of the
app migration is moving consumer applications to the new RabbitMQ cluster (Green).

How the applications are deployed to the Green cluster depends entirely on how you deploy and run
RabbitMQ and the applications. There is no urgency or rush to complete
this step. Ensure that your consumer applications are working as expected before moving to the next
step.

#### Prepare to Move Producers

This is the last step to complete the migration! Moving the producers consists of stopping the
producer apps, letting the consumers drain the queues in Blue via queue federation, and starting the
producer apps in Green.

There is a special scenario if you can't afford to have your producer apps stopped until the
consumers drain your queues. This can be the case if your usage consists of very long backlog queues
and slow consumers. In this special case, in addition to setting up queue fedration, consider declaring
one or more [shovels](/docs/shovel) for moving messages from Blue to Green,
before redeploying producer apps into the Green cluster.

### Clean Up After Migrating

After confirming that the migration completed successfully and that your apps are working without
issues, proceed to cleanup the policies declared for the needs of the migration, as well as
the federation upstream in the Green cluster.

#### Delete Temporary Policies

Override policies created earlier in the process will all be prefixed with `override.`. In this guide, the name of the
blanket, catch-all policy is `cmq-qq-migration_blanket`:

```shell
rabbitmqadmin --host green policies list
# => ┌──────────────────────────┬─────────┬───────────────────────┬──────────┬──────────┬─────────────────────────────────────────┐
# => │ name                     │ vhost   │ pattern               │ apply_to │ priority │ definition                              │
# => ├──────────────────────────┼─────────┼───────────────────────┼──────────┼──────────┼─────────────────────────────────────────┤
# => │ cmq-qq-migration_blanket │ finance │ .*                    │ queues   │ -21      │ federation-upstream: "cmq-qq-migration" │
# => │                          │         │                       │          │          │                                         │
# => ├──────────────────────────┼─────────┼───────────────────────┼──────────┼──────────┼─────────────────────────────────────────┤
# => │ ha                       │ finance │ (?:^po$)|(?:.*\.dlx$) │ all      │ 0        │ max-length: 100                         │
# => │                          │         │                       │          │          │ queue-version: 2                        │
# => │                          │         │                       │          │          │                                         │
# => ├──────────────────────────┼─────────┼───────────────────────┼──────────┼──────────┼─────────────────────────────────────────┤
# => │ overrides.ha             │ finance │ (?:^po$)|(?:.*\.dlx$) │ all      │ 100      │ federation-upstream: "cmq-qq-migration" │
# => │                          │         │                       │          │          │ max-length: 100                         │
# => │                          │         │                       │          │          │ queue-version: 2                        │
# => │                          │         │                       │          │          │                                         │
# => └──────────────────────────┴─────────┴───────────────────────┴──────────┴──────────┴─────────────────────────────────────────┘

rabbitmqadmin --host green policies delete --name cmq-qq-migration_blanket
rabbitmqadmin --host green policies delete --name overrides.ha
```

Next, delete the federation upstream that was used for migrating messages:

```shell
rabbitmqadmin --host green federation delete_upstream --name cmq-qq-migration
```

## Testing the Migration in a Development Environment

This migration can seem daunting at first. Team RabbitMQ has done extensive testing of different
scenarios and different queue feature combination, however, nothing would give more confidence than
trying this out yourselves in your own environment!

For that reason, it is highly recommended to test
all the migration commands and plan in a development or staging environment. Sometimes it is challenging to make
your own application simulate load as in production. For such cases,
[RabbitMQ Perf Test](https://perftest.rabbitmq.com/) is a great alternative to simulate workloads
and test specific RabbitMQ features.

For example, to simulate one producer publishing to exchange `inc` at a rate of 30 msg/s with
routing key `bills`, you could use the following perf-test command:

```
java -jar perf-test.jar \
    -y 0 -x 1 -c 10 -p -qq \
    --rate 30 -e inc \
    --routing-key 'bills' \
    --uri "amqp://myuser:mypass@blue.rabbit.example.com"
```

All perf-test options are documented in
[Perf Test documentation](https://perftest.rabbitmq.com/#basic-usage) and in its help command:

```
java -jar perf-test.jar --help
```

## Post-Migration Checklist

After completing the migration, the following list can help to double check the success of the
migration. Feel free to add any additional items that make sense in your environment.

 * All consumer apps are connected to Green (new) RabbitMQ cluster
 * All producer applications are connected to Green (new) RabbitMQ cluster
 * Temporary policies are not present
 * Federation upstream is not present
 * RabbitMQ does not have any [alarm in effect](/docs/alarms)
 * All [metrics](/docs/monitoring) are within their typical ranges

## Migration pitfalls

### TLS

`rabbitmqadmin` v2 supports TLS-enabled connections. However, its requires the [trusted CAs](/docs/ssl#peer-verification) to be part of the system trusted CAs.

How to add a trusted CA to your system keychain varies from one operating system to another. The
following links are not a complete reference, but convenience for most common systems:

 * [MacOS: Add certificates to keychain](https://support.apple.com/en-gb/guide/keychain-access/kyca2431/mac)
 * [Fedora: Using Shared System Certificates](https://docs.fedoraproject.org/en-US/quick-docs/using-shared-system-certificates/)
 * [RHEL 9: Using shared system certificates](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/securing_networks/using-shared-system-certificates_securing-networks)
 * [Ubuntu: Install a root CA certificate in the trust store](https://documentation.ubuntu.com/server/how-to/security/install-a-root-ca-certificate-in-the-trust-store/)

Once the CAs are added to the trusted certificate list at the OS level, their bundle file in the
PEM format can be used together with `rabbitmqadmin`. For example:

```shell
rabbitmqadmin --use-tls --tls-ca-cert-file /path/to/your/chained_ca_certificate.pem queues list
```

If you have RabbitMQ configured to use mutual [peer verification](/docs/ssl#peer-verification) (**mTLS**),
`rabbitmqadmin` will also need to be provided with a client certificate and key pair.

For example:

```shell
rabbitmqadmin --use-tls --tls-ca-cert-file /path/to/your/chained_ca_certificate.pem \
    --tls-cert-file /path/to/your/client_certificate.pem \
    --tls-key-file /path/to/your/client_key.pem \
    queues list
```

Alternatively, since adding all TLS options to each command can be cumbersome, it is possible to
configure all TLS options, hostname, port and credentials in a `rabbitmqadmin` configuration file. The configuration
file for `rabbitmqadmin` is TOML format, and it accepts some options, in addition to a "node" alias.
For example:

```toml
[blue]
hostname = "blue.rabbit"
tls = true
ca_certificate_bundle_path = "/path/to/your/chained_ca_certificate.pem"
client_certificate_file_path = "/path/to/your/client_certificate.pem"
client_private_key_file_path = "/path/to/your/client_key.pem"
port = 32795

[green]
hostname = "green.rabbit"
port = 32811
tls = true
ca_certificate_bundle_path = "/path/to/your/chained_ca_certificate.pem"
client_certificate_file_path = "/path/to/your/client_certificate.pem"
client_private_key_file_path = "/path/to/your/client_key.pem"
```

Use the above configuration with the `--config` and `--node`. For example
`rabbitmqadmin --config rabbitmqadmin.toml --node blue queues list`.


# Conclusion

Quorum Queues (QQ) are the go-to queue type for data safety in RabbitMQ. They provide predictable
failover behaviour and
[higher throughput than Classic Mirrored Queues](/blog/2022/05/16/rabbitmq-3.10-performance-improvements)
(CMQ). Quorum Queues keep receiving updates, performance improvements and bug fixes, whilst Classic
Mirrored Queues are in life support in 3.13 and completely removed in RabbitMQ 4. Classic Queues
(without mirroring) are still a valid and supported queuee type. Classic Queues are still a good fit
for certain uses cases, for example: RPC pattern. Or any use case that does not require high
availability.

With the new generation of `rabbitmqadmin`, it is now easier than every to migrate from mirrored classic queues to quorum queues,
and at the same time upgrade to the latest [supported RabbitMQ release series](/release-information).

[qq]: /docs/quorum-queues#
[raft-algo]: https://raft.github.io/
