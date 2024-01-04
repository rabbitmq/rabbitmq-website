<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Migrate your &product-name; Mirrored Classic Queues to Quorum Queues

Which is better: mirrored classic queues or quorum queues? [Quorum queues](./quorum-queues.html) are the much better choice and they will be [the only option starting with RabbitMQ version 4.0](https://blog.rabbitmq.com/posts/2021/08/4.0-deprecation-announcements/).
This information explains why, the reasons why you should migrate from mirrored classic queues to quorum queues, the ways to handle features during the migration, and includes procedures for some of the migration routes you can take.

You should migrate to mirrored classic queues for the following reasons:

* Classic mirrored queues were deprecated in RabbitMQ version 3.9. They will be removed completely in RabbitMQ version 4.0
* Quorum queues can sustain much higher throughput levels in almost all use cases. A quorum queue can sustain a 30000 message throughput (using 1kb messages), while offering high levels of data safety, and replicating data to all 3 nodes in a cluster. Classic mirrored queues only offer a third of that throughput and provide much lower levels of data safety
* Quorum queues are more reliable, faster for most workloads, and require little maintenance

However, before migrating to quorum queues, a few things must be considered:

* While quorum queues are a better queue type when compared to mirrored classic queues, they are not 100% compatible feature wise with mirrored classic queues. When you are deciding about whether to migrate from mirrored classic queues to quorum queues,
it is recommended to review the [quorum queue documentation](./quorum-queues.html) first, you can review the [feature matrix table](./quorum-queues.html#feature-matrix) which provides a comparison of both queue types (mirrored classic queues beside quorum queues)

* The level of complexity involved in migrating from mirrored classic queues to quorum queues depends on the features that are currently being used by the mirrored classic queues. Some features require a change in the way queues are being used (refer to [Mirrored Classic Queue Features that require Changes in the Way the Queue is Used](#mcq-changes-way-queue-is-used)), while other features simply require removing the feature from the source code or moving it to policy (refer to [Mirrored Classic Queue Features that can be removed from Source Code or moved to a Policy](#mcq-features-to-remove)).

* It is also important to note that migrated applications should be thoroughly tested against quorum queues because the behaviour can differ under the load and in edge cases.

## Deciding which Migration Route to take: Compatibility Considerations

Incompatible features can be either referenced in policies or in the source code. RabbitMQ strictly validates arguments for queue declaration and consumption. Therefore, for migration, you must clean up all information about incompatible features in the source code. For some features, changes in the way that queues are used is required, refer to [Mirrored Classic Queue Features that require Changes in the Way the Queue is Used](#mcq-changes-way-queue-is-used). For other features, it is as simple as just removing corresponding strings from the source code or moving the feature to a policy, refer to [Mirrored Classic Queue Features that can be removed from Source Code or moved to a Policy](#mcq-features-to-remove),

The general policies and arguments related to mirroring are:`ha-mode`, `ha-params` `ha-sync-mode`, `ha-promote-on-shutdown`, `ha-promote-on-failure`, and `queue-master-locator`.

There are several migration paths available:

 * [Blue-Green Deployment](./blue-green-upgrade.html)
 * [Migrating the Queues by Virtual Host](#migrate-the-queues-by-virtual-host) is probably the most efficient migration path you can take if it is an option for you. If all the incompatible features are cleaned up or moved to policies, the existing code should work with both mirrored classic queues and quorum queues. You only need to change the connection parameters to connect to the new virtual host that you created for the quorum queues
 * [Migrating in Place](#migrate-in-place) means you re-use the same virtual host. You must be able to stop all consumers and producers for a given queue while the migration is in progress

Before deciding which migration method you can use, you must first find the mirrored classic queues and the features they are using.

## <a id="find-mcq" class="anchor" href="#find-mcq">Finding the Mirrored Classic Queues for Migration</a>

To find the mirrored classic queues that must be migrated, run the following script (which uses `rabbitmqctl` to count all the queues across all the virtual hosts as tab-separated values).

Note, the following command uses `effective_policy_definition` parameters, which are only available since RabbitMQ version 3.10.13/3.11.5. If it's not available, you can use `rabbitmqctl` from any RabbitMQ version later than 3.10.13/3.11.5, or manually match the policy name to it's definition.

<pre class="lang-bash">
#!/bin/sh
printf "%s\t%s\t%s\n" vhost queue_name mirrors
for vhost in $(rabbitmqctl -q list_vhosts | tail -n +2) ; do
  rabbitmqctl -q list_queues -p "$vhost" name durable policy effective_policy_definition arguments mirror_pids type |
	sed -n '/\t\[[^\t]\+\tclassic$/{s/\t\[[^\t]\+\tclassic$//; p}' |
	xargs -x -r -L1 -d '\n' printf "%s\t%s\n" "$vhost"
done
</pre>

All mirrored classic queues that include `ha-mode` in their effective policy definition must be migrated to a different type of queue. All these queues are listed as mirrored classic queues in the Management UI and CLI. Find the policies that apply it by running the following script:

<pre class="lang-bash">
#!/bin/sh
printf "%s\t%s\t%s\t%s\t%s\t%s\n" vhost policy_name pattern apply_to definition priority
for vhost in $(rabbitmqctl -q list_vhosts | tail -n +2) ; do
  rabbitmqctl -q list_policies -p "$vhost" |
    grep 'ha-mode'
done
</pre>

## <a id="mcq-changes-way-queue-is-used" class="anchor" href="#mcq-changes-way-queue-is-used">Mirrored Classic Queue Features that require Changes in the Way the Queue is Used</a>

When one or more of the following features are used by mirrored classic queues, straightforward migration to quorum queues is not possible. The way the application interacts with a broker needs to be changed. This information explains how to find whether some of these features are being used in a running system, and the changes you must make to make migration easier.

### Priority Queues

To find out if a classic mirrored queue uses the "priority" feature, you can check for the `x-max-priority` string in
the list of queues output that is provided by running the command in [Finding the Mirrored Classic Queues for Migration](#find-mcq) or you can also search for the `x-max-priority` string in the source code. For more information on how the priority is implemented, go to [Priority Queue Support](./priority.html).

Priority queues are not created using a policy, therefore no policy changes are required when migrating them. Classic mirrored queues create a separate queue for every priority behind the scenes. To migrate a single mirrored classic queue that uses the "priority" feature, you must create the required number amount of quorum queues. Once the quorum queues are created, adjust the publishing and consumption of these new quorum queues accordingly.

### Queue Length Limit overflow set to `reject-publish-dlx`

The queue length exceeded with `overflow` set to [`reject-publish-dlx`](./maxlength.html#overflow-behaviour) is not supported by quorum queues. The `reject-publish-dlx` value is not supported.

With mirrored classic queues, publishing to a full queue with `reject-publish-dlx` resulted in RabbitMQ republishing a rejected message to a dead letter exchange. With quorum queues, to apply the same logic, you must change `reject-publish-dlx` to `reject-publish`. Then, handle negative acknowledgements: after getting a negative acknowledgement, the application must publish the message again to a different exchange.

To find out if `overflow` set to `reject-publish-dlx` is configured for the mirrored classic queues you want to migrate, check for the `reject-publish-dlx` string in the list of queues output that is provided by running the command in [Finding the Mirrored Classic Queues for Migration](#find-mcq) or you can also search for the `reject-publish-dlx` string in the source code.

### Global QoS for Consumers

Global [QoS prefetch](./quorum-queues.html#global-qos) where a channel sets a single prefetch limit for all consumers using that channel is not supported by quorum queues. If this functionality is required, try achieving the same results using alternative methods, for example, one solution might be to use a lower per-consumer QoS (given the known application load pattern).

To find out if this feature is used, run the following command on a running system and check for non-empty output:

<pre class="lang-bash">
rabbitmqctl list_channels pid name global_prefetch_count | sed -n '/\t0$/!p'
</pre>

A list of channel PIDs that have global QoS turned on are returned. Then, run the following command to map the channel PID to a queue name to verify if it is a mirrored classic queue.

<pre class="lang-bash">
rabbitmqctl list_consumers queue_name channel_pid
</pre>

### `x-cancel-on-ha-failover` for Consumers

Classic mirrored queues consumers can be [automatically cancelled](./ha.html#cancellation) when a queue
leader fails over. This can cause loss of information about which messages were sent to which consumer, and result in the same messages being sent again (duplicate messages).

Some of the cases for duplicate messages are covered by `x-cancel-on-ha-failover` and others are not. Most of the cases covered by `x-cancel-on-ha-failover` do not exist with quorum queues but those that are not covered are still there. Therefore, your application must be able to handle duplicates, which it should be able to do anyway.

## <a id="mcq-features-to-remove" class="anchor" href="#mcq-features-to-remove">Mirrored Classic Queue Features that can be removed from Source Code or moved to a Policy</a>

The following features are ignored when quorum queues are
used. The best way to handle these features is to remove them from the source
code, or move them to a policy.

### Lazy Queues

Quorum queues do not support lazy mode (`x-queue-mode=lazy`).

To migrate mirrored lazy classic queues, remove the `x-queue-mode=lazy` declaration argument or remove it from the policy if it is set via a policy. For more information about the lazy mode, go to [Lazy Queues](./lazy-queues.html#overview).

### Transient Queues

[Transient queues](./queues.html#durability) are deleted on a node/cluster boot.

The plan is to remove transient queues in future RabbitMQ releases.
The only option for transient queues then will be exclusive queues. This only affects the durability of queue definitions. Messages can still be marked transient.

You must make a decision about transient queues before migration, is the content of the
queue important enough to get availability guarantees of quorum queues, or is it better to downgrade the transient queue to a classic non-mirrored queue (classic mirrored queues are being removed but classic non-mirrored queues will still be available).

### Exclusive Queues

You do not need to complete any migration tasks for [exclusive queues](./queues.html#exclusive-queues). Exclusive queues are not mirrored even if the policy indicates that they are. Also, it is not possible to create an exclusive quorum queue.

For exclusive queues, however, you must decide whether to leave the queue as exclusive or change it to a replicated queue during migration. Be careful not to make exclusive queue declarations with an explicit `x-queue-type: quorum` argument.

## General Prerequisites before Migrating from Mirrored Classic Queues to Quorum Queues

1. A RabbitMQ cluster with an odd number of nodes. A minimum of 3 nodes in the RabbitMQ cluster is required for high availability.
2. The Management plugin should be running on at least one node. It is used to export/import definitions for a single host,
   which simplifies definitions cleanup. (`rabbitmqadmin` CLI command is also using the plugin behind the scenes).
3. To quickly move (shovel) the backlog of original queues to the new queues, enable the . The [Shovel plugin](./shovel.html) can be used to move the backlog of original messages to the new queues. Shovels can be created programmatically using a HTTP API extension or using the RabbitMQ Management UI.

## <a id="migrate-the-queues-by-virtual-host" class="anchor" href="#migrate-the-queues-by-virtual-host">Migrate Mirrored Classic Queues to Quorum Queues by Virtual Host</a>

This procedure to migrate from mirrored classic queues to quorum queues
is similar to a [blue-green cluster upgrade](./blue-green-upgrade.html),
except you are migrating to a new virtual host on the same
RabbitMQ cluster. The steps in the following sections use a new virtual host on the existing cluster to provide an empty namespace to create the new quorum queues using the old queue names.

You will use the [Federation Plugin](./federation.html) to seamlessly migrate from the old virtual host to the new one.

**Important**: You can set the default queue type for the new virtual host. Setting it to
`quorum` creates all the queues without an explicit type as
quorum queues (except for exclusive, non-durable, or auto-delete queues).

If all incompatible features were cleaned up from the source code, and
there is no explicit `x-queue-type` arguments in the source code, then
the same code should work for both the old
virtual host with classic mirrored queues and the new virtual
host with quorum queues. The only change you need to make is to update the virtual host connection parameters to connect to the new virtual host.

### Create the Destination Virtual Host

[Create the new virtual host](./vhosts.html#creating) with the correct default queue type (quorum) in the existing cluster. The queue type should be selected from the **queue type** drop down list when the new virtual host is being added via management UI. Alternatively, it can also be created using the CLI interface by specifying the default queue type and adding the permissions. Ensure all required users have access and can connect to the new virtual host by following the steps in the [set permissions](./rabbitmqctl.8.html#set_permissions).

```bash
rabbitmqctl add_vhost NEW_VHOST --default-queue-type quorum
rabbitmqctl set_permissions -p NEW_VHOST USERNAME '.*' '.*' '.*'
```

### Create the Federation Upstream

A new [federation upstream](./blue-green-upgrade.html#setup-federation) should be created for the NEW\_VHOST with the
URI pointing to the OLD\_VHOST: `amqp:///OLD_VHOST`. (Note that the
default vhost URI is `amqp:///%2f`).

The federation upstream can be created using the management UI or the CLI:

<pre class="lang-bash">
rabbitmqctl set_parameter federation-upstream quorum-migration-upstream \
    --vhost NEW_VHOST \
    '{"uri":"amqp:///OLD_VHOST", "trust-user-id":true}'
</pre>

When this form of URI with an empty hostname is used, there is no
need to specify credentials. Connection is only possible within
the bounds of a single cluster.

If the `user-id` in messages is being used for any purpose, it can also be
preserved as shown in the previous CLI example.

### Moving Definitions

Export the [definitions](./definitions.html) from the source virtual host to a file. This is
available on the **Overview** page of the management UI (don't forget to
select a single virtual host). Alternatively, you can export the definitions using the CLI with the following command:

<pre class="lang-bash">
rabbitmqadmin export -V OLD_VHOST OLD_VHOST.json
</pre>

Make the following changes to this file before loading it back into the NEW_VHOST:

1. Remove the `x-queue-type` declarations for queues that you want to have
   as classic mirrored queues in the old virtual host, and as quorum ones in the
   new virtual host.
2. Other changes that must be applied to queue definitions:
   - Remove the `x-max-priority` argument.
   - Change the `x-overlow` argument when it is set to `reject-publish-dlx`. Change it to `reject-publish`.
   - Remove the `x-queue-mode` argument.
   - Change the `durable` attribute to `true`.
3. Change the following keys in the policies:
   - Remove everything starting with `ha-`: `ha-mode`, `ha-params`,
     `ha-sync-mode`, `ha-sync-batch-size`, `ha-promote-on-shutdown`, and
     `ha-promote-on-failure`
   - Remove the `queue-mode`.
   - Change `overflow` when it is set to `reject-publish-dlx`. Change it to `reject-publish`.
4. Policies that are empty after the previous step should be dropped.
5. Federation with the old virtual host should be added to any remaining
   policies, pointing to the federation upstream created earlier:
   `"federation-upstream-set":"quorum-migration-upstream"`.
6. If there is no catch-all policy (applying to queues with pattern `.*`), you must create this policy and point it to the federation upstream. This ensures that every queue in the old virtual host will be federated.
7. Policies that apply federation rules to exchanges must be removed for the period of the migration to avoid duplicate messages.

Now the modified schema can be loaded into the new virtual host from the Management
UI or by running the following command from the CLI:

<pre class="lang-bash">
rabbitadmin import -V NEW_VHOST NEW_VHOST.json
</pre>

### Point Consumers to use Quorum Queues in the New Virtual Host

Consumers of the migrated queues can now access the new queues by updating the connection parameters to connect to the new virtual host. The federation links start to pull in messages from the original queues.

As with a blue-green cluster, after all consumers are migrated, you might need to also [add shovels to move the backlog of the original queues to the new queues](#shovel-remaining-messages) more efficiently than federation. For more information, refer to [Drain Messages](./blue-green-upgrade.html#drain-messages).

### Update the Producers to Use the Exchanges in the new Virtual Host

Once the original queues are empty (or nearly empty if you do not require full message ordering), the producers should be stopped and reconfigured to use the new queue declarations and virtual host like the consumers, and restarted. Federated exchanges in the old virtual host should also be stopped and equivalent exchanges should be added in the new virtual host. The original queues can be removed once they are empty and no messages are passing through them.

Under sufficient system load, messages from the old virtual host will
not be picked up. If message ordering is important, then ordering should
be completed in these steps: stop producers, shovel remaining messages to the new
virtual host, and start consumers on the new virtual host.

### <a id="shovel-remaining-messages" class="anchor" href="#shovel-remaining-messages">Shovel Remaining Messages to the New Virtual Host</a>

For every non-empty queue in the old virtual host, a shovel needs to be configured. For example:

<pre class="lang-bash">
rabbitmqctl set_parameter shovel migrate-QUEUE_TO_MIGRATE \
  '{"src-protocol": "amqp091", "src-uri": "amqp:///OLD_VHOST", "src-queue": "QUEUE_TO_MIGRATE",
    "dest-protocol": "amqp091", "dest-uri": "amqp:///NEW_VHOST", "dest-queue": "QUEUE_TO_MIGRATE"}'
</pre>

After the queue is drained, the shovel can be deleted:

<pre class="lang-bash">
rabbitmqctl clear_parameter shovel migrate-QUEUE_TO_MIGRATE
</pre>

## <a id="migrate-in-place" class="anchor" href="#migrate-in-place">Migrate Mirrored Classic Queues to Quorum Queues in Place</a>

Migrating this way trades uptime so that you can
complete the migration in an existing virtual host and cluster.

For each queue (or some group of queues) being migrated, it should be
possible to stop all the consumers and producers for the duration of the
migration.

### Preparing Producers and Consumers

All incompatible features should be cleaned up. In addition, every place where queues are being declared, it would be better to make the
`x-queue-type` argument configurable without changing the application code.

### The Migration Steps

1. Stop the consumers and producers.
2. Shovel the messages to a new temporary queue.
3. Delete the old queue.
4. Create a new quorum queue with the same name as the original queue.
5. Shovel the contents of the temporary queue to the new quorum queue.
6. Configure the consumers to use `x-queue-type` of `quorum` and they can be started.
