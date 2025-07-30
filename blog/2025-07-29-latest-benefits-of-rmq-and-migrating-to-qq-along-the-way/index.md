---
title: "Blue-Green upgrade to migrate from Classic Mirrored Queues to Quorum Queues"
tags: ["Classic Queues", "Quorum Queues", "RabbitMQ 4.1"]
authors: [aperez]
---

# Introduction

RabbitMQ 4 has been out for some time by now, and we have covered some of the goodies it comes with,
compared to its predecesor, RabbitMQ 3.13. Some examples are
[improved performance](https://www.rabbitmq.com/blog/2025/04/08/4.1-performance-improvements),
[Native AMQP 1.0](https://www.rabbitmq.com/blog/2024/08/05/native-amqp), new
[Quorum Queue features](https://www.rabbitmq.com/blog/2024/08/28/quorum-queues-in-4.0), bringing
closer feature parity with Classic Queues.

<!-- truncate -->

It's been a while since we wrote about
[how to migrate](https://www.rabbitmq.com/blog/2023/03/02/quorum-queues-migration) from Classic
Mirrored Queues (CMQ) to Quorum Queues (QQ). In case you already don't know, CMQs are deprecated
since RabbitMQ 3.9, and were removed in RabbitMQ 4.0. Today we are going to cover Quorum Queues in
more detailed, comparing them to CMQs, and high level migration stategies to abandon CMQs for good,
in favour of QQs, or a combination of QQ and Classic Queues (CQ). Note that CQs are still well
supported, it's their mirroring feature what was deprecated and removed.

# Why Quorum Queues?

Classic Mirrored Queues (CMQ) were introduced to add in-cluster data replication to CQs. The CQs
were designed as a non-replicated queue type. The mirroring feature added the ability to replicate
data to other nodes. The algorithm to "mirror" data was homegrown, and it was not very resilient to
network partitions. To make matters worse, the behaviour in failure scenarios of CMQs was
unpredictable in some cases, and generally quite hard to reason about. There were even cases where
[CMQs could lose messages](https://jack-vanlightly.com/blog/2018/9/10/how-to-lose-messages-on-a-rabbitmq-cluster).

To address all these issues, and to supercharge RabbitMQ with a reliable, safe and replicated queue
type, Quorum Queues were designed and incorporated to RabbitMQ.

[Quorum Queues][qq] are replicated queue type, based on [Raft consensus algorithm][raft-algo].
Quorum Queues are designed with data safety as top priority, and fast leader elections to guarantee
data availability. All QQs have a leader and some followers; locagically, leader and followers are
distributed among RabbitMQ nodes. When a QQ receives a message, it writes an internal log and the
message to disk, sends an internal replication command to the followers, and awaits for a
confirmation of the majority, before sending a confirmation back to the client. Some readers may be
wondering "that doesn't sound very performant", and indeed, it does not. However, keep in mind that
this is an overly simplified explanation, and there are many optimisations to provide great
performance, while keeping data safety and availability promises.

In the event of a leader failure, the up-to-date followers start a voting process, and elect a new
QQ leader. The resulting leader will resume operations on the queue. You can learn more details
about [Raft consensus algorithm][raft-algo] in GitHub.

With those characteristics, QQs address the main issues of CMQs: data safety, data availability,
predictability of failure scenarios. However, QQs are not a good fit for certain use cases, present
in messaging systems. For example: temporary queues used in e.g. RPC communication. It doesn't make
sense to use QQs when data safety is not a priority; for example, if your applications use a
fire-and-forget approach to publish messages, and/or your consumer applications don't use manual
acknowledgement. For such use cases, Classic Queues **without mirroring** are an excelent fit.

# Migration from CMQs to QQs

Given the different nature of both queue types, it is not possible to perform an in-place upgrade.
The strategy to migrate is a
[blue-green deployment](https://www.rabbitmq.com/docs/blue-green-upgrade), where the "green" cluster
i.e. new cluster, will have the existing queues in "blue" cluster i.e. original cluster, re-declared
as quorum queues. RabbitMQ has tooling to facilitate these tasks. For example,
[rabbitmqadmin V2](https://www.rabbitmq.com/docs/management-cli) is a new CLI,
[written from scratch in Rust](https://github.com/rabbitmq/rabbitmqadmin-ng), that has the ability
to remove policies with deprecated mirroring keys.

## High level plan

The blue-green upgrade strategy has some requirements that must be met prior to the upgrade:

- RabbitMQ Federation plugin must be enabled
- Blue (origin) RabbitMQ cluster must be reachable from Green (new) RabbitMQ cluster
- Green (new) RabbitMQ version must be > 4.0, ideally latest 4.x e.g. 4.1.2
- All stable feature flags must be enabled in Green (new) RabbitMQ cluster

Once the prerequisites are met, the migration plan consists of:

1. Export the definitions in Blue RabbitMQ cluster
1. Import definitions in Green RabbitMQ cluster
1. Configure Green to federate queues from Blue
1. Migrate consumers to Green cluster
1. Migrate producers to Green
1. Shutdown Blue
1. Remove migration policies from Green

We will describe in more detail every step in a later section.

## Considerations for applications

Quorum Queues support all features from CMQs that made sense. That means, all features of durable,
non-transient, Classic Queues.
[This matrix](https://www.rabbitmq.com/docs/quorum-queues#feature-comparison) covers how Quorum
Queues are different from Classic Queues.

This is a good moment to reconsider whether certain apps require high availability. For example, an
application that creates and binds a temporary queue to a fanout exchange, process information for
some time and deletes its queue after disconnection, does not require high availability at queue
level, because the queue is dedicated to this app and the app is capable of re-declaring its
topology.

Any queue that does not require high availability after this assessment should have its mirroring
removed prior to starting the migration.

## Detailed plan

This plan has been tested with RabbitMQ Blue 3.13.7 and RabbitMQ Green 4.1.2. Both TLS, mTLS and
plain TCP has been tested. Both the CLI `rabbitmqadmin` and RabbitMQ work without issues in all the
tested setups.

### Export definitions

In this step, we will backup all rabbitmq objects, excluding messages, to a JSON file. All
usernames, vhosts, queues, permissions, bindings, policies, parameters, exchanges, everything, will
be exported to a JSON file. It is possible to apply transformations to exclude certain data. This
transformations feature will greatly help with the CMQ to QQ migration.

The following command exports a definitions file of RabbitMQ, and transforms deprecated CMQ policies
and arguments into supported Quorum Queues. Any queue with a mirroring policy will be automatically
transformed into a Quorum Queue in the definitions (backup) file. If as a result of this
transformations, a policy becomes empty (beecause it only had CMQ keys), it will also be deleted,
because it is not possible to import empty policies in RabbitMQ.

RabbitMQ definitions are shared among all cluster nodes, therefore, it is only necessary to run this
command in one node.

```shell
rabbitmqadmin --host blue definitions export --file blue.json -t prepare_for_quorum_queue_migration,drop_empty_policies
```

### Import definitions

In this step, we will "restore" the definitions file from the previous step (with the CMQs
transformed into QQ) into the new "green" cluster. This command does not allow for much
configurability, it's a very straightforward step:

```shell
rabbitmqadmin --host green definitions import --file ./blue.json
```

### Configure federation upstream in Green

In this step, we will configure queue federation. These steps are crucial. Take some time to read
through and prepare the commands in advance.

#### Create federation upstreams

**For each vhost**, create a federation upstream in **Green**:

```shell
rabbitmqadmin --host green federation declare_upstream_for_queues --name cmq-qq-migration --uri 'amqp://<federation-user>:<federation-password>@blue.rabbit'
```

Where `<federation-user>` is an **existing user** in **Blue** RabbitMQ. It is advisable to create a
dedicated user for federation.

Where `<federation-password>` is the federation user password used to authenticate in **Blue**
RabbitMQ.

#### Create override policies

This step creates "override" policies to utilise federation. In this step, we are configuring
RabbitMQ to use [federated queues](https://www.rabbitmq.com/docs/federated-queues). Federated queues
transfer messages from the upstream cluster, when **local** consumers request messages __and__ local
queues are empty. This will allow you to move your consumer applications to Green without disruption
to your operations.

For each policy, create a policy override to utilise the federation upstream:

```shell
rabbitmqadmin --host green policies list
┌──────┬─────────┬───────────────────────┬──────────┬──────────┬──────────────────┐
│ name │ vhost   │ pattern               │ apply_to │ priority │ definition       │
├──────┼─────────┼───────────────────────┼──────────┼──────────┼──────────────────┤
│ ha   │ finance │ (?:^po$)|(?:.*\.dlx$) │ all      │ 0        │ max-length: 100  │
│      │         │                       │          │          │ queue-version: 2 │
│      │         │                       │          │          │                  │
└──────┴─────────┴───────────────────────┴──────────┴──────────┴──────────────────┘

rabbitmqadmin --host green policies declare_override --name ha --definition '{"federation-upstream": "cmq-qq-migration"}'
```

Create a blanket/catch-all policy for any queue not matched by an existing policy:

```shell
rabbitmqadmin --host green policies declare_blanket --name cmq-qq-migration_blanket --apply-to queues --definition '{"federation-upstream": "cmq-qq-migration"}'
```

This will ensure that all queues utilise the federation upstream.

#### Verify that Federation is working

Once the policies are created, the federation plugin will create links to the upstream (Blue). The
presence of links ensures that federated queues are ready to pull messages from the upstream (Blue)
if needed by local consumers.

```shell
rabbitmqadmin --host green federation list_all_links
┌──────────────┬─────────┬──────────┬─────────────────────┬─────────┬───────┬──────────────────┬──────────────────────────────────┐
│ node         │ vhost   │ id       │ uri                 │ status  │ type  │ upstream         │ consumer_tag                     │
├──────────────┼─────────┼──────────┼─────────────────────┼─────────┼───────┼──────────────────┼──────────────────────────────────┤
│ rabbit@green │ finance │ 8f0f0d8a │ amqps://blue.rabbit │ running │ queue │ cmq-qq-migration │ federation-link-cmq-qq-migration │
├──────────────┼─────────┼──────────┼─────────────────────┼─────────┼───────┼──────────────────┼──────────────────────────────────┤
│ rabbit@green │ finance │ 01efa5b5 │ amqps://blue.rabbit │ running │ queue │ cmq-qq-migration │ federation-link-cmq-qq-migration │
├──────────────┼─────────┼──────────┼─────────────────────┼─────────┼───────┼──────────────────┼──────────────────────────────────┤
│ rabbit@green │ finance │ 950faf11 │ amqps://blue.rabbit │ running │ queue │ cmq-qq-migration │ federation-link-cmq-qq-migration │
└──────────────┴─────────┴──────────┴─────────────────────┴─────────┴───────┴──────────────────┴──────────────────────────────────┘
```

#### Prepare to move your consumers

Both RabbitMQ clusters (Blue and Green) are ready to support the migration. The first step of the
app migration is moving consumer applications to the new RabbitMQ cluster (Green).

This step depends entirely on your specific environment. There is no urgency or rush to complete
this step. Ensure that your consumer applications are working as expected before moving to the next
step.

#### Prepare to move your producers

This is the last step to complete the migration! Moving the producers consists of stopping the
producer apps, letting the consumers drain the queues in Blue via queue federation, and starting the
producer apps in Green.

There is a special scenario if you can't afford to have your producer apps stopped until the
consumers drain your queues. This can be the case if your usage consists of very long backlog queues
and slow consumers. In this special case, you will have to shovel your messages from Blue to Green,
before starting your producer apps in Green.

### Clean up

After confirming that the migration completed successfully and that your apps are working without
issues, proceed to cleanup override policies and federation upstream.

#### Delete temporary policies

Policies created by previous commands have the preffix `override.`. In this guide, the name of the
blanket, catch-all policy is `cmq-qq-migration_blanket`:

```shell
rabbitmqadmin --host green policies list
┌──────────────────────────┬─────────┬───────────────────────┬──────────┬──────────┬─────────────────────────────────────────┐
│ name                     │ vhost   │ pattern               │ apply_to │ priority │ definition                              │
├──────────────────────────┼─────────┼───────────────────────┼──────────┼──────────┼─────────────────────────────────────────┤
│ cmq-qq-migration_blanket │ finance │ .*                    │ queues   │ -21      │ federation-upstream: "cmq-qq-migration" │
│                          │         │                       │          │          │                                         │
├──────────────────────────┼─────────┼───────────────────────┼──────────┼──────────┼─────────────────────────────────────────┤
│ ha                       │ finance │ (?:^po$)|(?:.*\.dlx$) │ all      │ 0        │ max-length: 100                         │
│                          │         │                       │          │          │ queue-version: 2                        │
│                          │         │                       │          │          │                                         │
├──────────────────────────┼─────────┼───────────────────────┼──────────┼──────────┼─────────────────────────────────────────┤
│ overrides.ha             │ finance │ (?:^po$)|(?:.*\.dlx$) │ all      │ 100      │ federation-upstream: "cmq-qq-migration" │
│                          │         │                       │          │          │ max-length: 100                         │
│                          │         │                       │          │          │ queue-version: 2                        │
│                          │         │                       │          │          │                                         │
└──────────────────────────┴─────────┴───────────────────────┴──────────┴──────────┴─────────────────────────────────────────┘

rabbitmqadmin --host green policies delete --name cmq-qq-migration_blanket
rabbitmqadmin --host green policies delete --name overrides.ha
```

Delete federation upstream:

```shell
rabbitmqadmin --host green federation delete_upstream --name cmq-qq-migration
```

## Testing the migration in dev

This migration can be daunting at first. Team RabbitMQ has done extensive testing of different
scenarios and different queue feature combination, however, nothing would give more confidence than
trying this out yourselves in your own premises! For that reason, it is highly recommended to test
all the migration commands and plan in a DEV or STG environment. Sometimes it is challenging to make
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

## Post-migration checklist

After completing the migration, the following list can help to double check the success of the
migration. Feel free to add any additional items that make sense in your environment.

- All consumer apps are connected to Green (new) RabbitMQ cluster
- All producer applications are connected to Green (new) RabbitMQ cluster
- Temporary policies are not present
- Federation upstream is not present
- RabbitMQ does not have any alarm

## Migration pitfalls

### TLS

`rabbitmqadmin` v2 fully supports TLS. However, its requires trusted CAs to be part of the system
trusted CAs. How to add a trusted CA to your system keychain varies from system to system. The
following links are not a complete reference, but convenience for most common systems:

- [MacOS: Add certificates to keychain](https://support.apple.com/en-gb/guide/keychain-access/kyca2431/mac)
- [Fedora: Using Shared System Certificates](https://docs.fedoraproject.org/en-US/quick-docs/using-shared-system-certificates/)
- [RHEL 9: Using shared system certificates](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/securing_networks/using-shared-system-certificates_securing-networks)
- [Ubuntu: Install a root CA certificate in the trust store](https://documentation.ubuntu.com/server/how-to/security/install-a-root-ca-certificate-in-the-trust-store/)

Once you have your CA trusted in your system, you will need a local copy of the CA certificate in
PEM format locally, for use with `rabbitmqadmin` commands. For example:

```shell
rabbitmqadmin --use-tls --tls-ca-cert-file /path/to/your/chained_ca_certificate.pem queues list
```

If you have RabbitMQ configured to use **mTLS**, or peer verification, you will have to provide the
client key and certificate as parameter to `rabbitmqadmin`. For example:

```shell
rabbitmqadmin --use-tls --tls-ca-cert-file /path/to/your/chained_ca_certificate.pem \
    --tls-cert-file /path/to/your/client_certificate.pem \
    --tls-key-file /path/to/your/client_key.pem \
    queues list
```

Alternatively, since adding all TLS options to each command can be cumbersome, it is possible to
configure all TLS options, hostname, port and credentials in a configuration file. The configuration
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
[higher throughput than Classic Mirrored Queues](https://www.rabbitmq.com/blog/2022/05/16/rabbitmq-3.10-performance-improvements)
(CMQ). Quorum Queues keep receiving updates, performance improvements and bug fixes, whilst Classic
Mirrored Queues are in life support in 3.13 and completely removed in RabbitMQ 4. Classic Queues
(without mirroring) are still a valid and supported queuee type. Classic Queues are still a good fit
for certain uses cases, for example: RPC pattern. Or any use case that does not require high
availability.

With the new generation of `rabbitmqadmin` CLI, it's very easy to migrate from CMQs to QQs, and at
the same time upgrade to the latest supported version of RabbitMQ.

[qq]: https://www.rabbitmq.com/docs/quorum-queues#
[raft-algo]: https://raft.github.io/
