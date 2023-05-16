<!--
Copyright (c) 2007-2023 VMware, Inc. or its affiliates.

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

# Migrating Mirrored Classic Queues to Quorum Queues
Quorum Queues are now the optimum choice of queue type replacing mirrored classic queues. This information explains why, the reasons why you should migrate from mirrored classic queues to quorum queues, the ways to handle features during the migration, and includes procedures for some of the migration routes you can take. 

You should migrate to mirrored classic queues for the following reasons:

* Classic mirrored queues were deprecated in RabbitMQ version 3.9. They will be removed completely in RabbitMQ version 4.0.
* Quorum queues can sustain much higher throughput levels in almost all use cases. A quorum queue can sustain a 30000 messages throughput (using 1kb messages), while offering high levels of data safety and replicating data to all 3 nodes in a cluster. Classic mirrored queues only offer a third of that throughput and provide much lower levels of data safety. 
* Quorum queues are more reliable, faster for most workloads. and require little maintenance. For more information, go to Quorum Queues. 

**Note**: While Quorum queues are the best choice of queue type, they are not 100% compatible feature wise with Mirrored Classic queues. In Quorum Queue documentation, you can review the feature matrix table which lists the differences between Mirrored Classic Queues and Quorum Queues. These differences require different steps to successfully migrate from mirrored classic queues to quoruem. Some of the steps can be easy to implement, while others require changes in the way an application interacts with RabbitMQ. 

*****All of them are thoroughly documented further.

And it goes without saying that migrated applications should be thoroughly tested against quorum queues, as behaviour can be somewhat different under the load and in edge cases.***

## The Migration Routes: Migrate the Queues by Virtual Host OR Migrate in place

Migrating the Queues by Virtual Host is probably the most efficient migration path you can take if it is an option for you. If all the incompatible features are cleaned up or moved to policies, the existing code is able to work both with mirrored and quorum queues by only changing connection parameters to the new vhost that you created for the quorum queues.

Migrating in Place means you re-use the same virtual host. You must be able to stop all consumers and producers for a given queue.

Before deciding which migration method you can use, you must first find the mirrored classic queues and the features they are using. 

## Finding the Mirrored Classic Queues for Migration

Run the following commands to retrieve the list of mirrored classic queues that must be migrated. Note the following command uses `effective_policy_definition` paramters, which is only available since RabbitMQ version 3.10.13/3.11.5. If it's not available, you can use `rabbitmqctl` from a fresh??? version of RabbitMQ, or manually match the policy name to it's definition.

```bash
#!/bin/sh
printf "%s\t%s\t%s\n" vhost queue_name mirrors
for vhost in $(rabbitmqctl -q list_vhosts | tail -n +2) ; do
  rabbitmqctl -q list_queues -p "$vhost" name durable policy effective_policy_definition arguments mirror_pids type |
	sed -n '/\t\[[^\t]\+\tclassic$/{s/\t\[[^\t]\+\tclassic$//; p}' |
	xargs -x -r -L1 -d '\n' printf "%s\t%s\n" "$vhost"
done
```
All mirrored classic queues have `ha-mode` in their effective policy
definition. The policies that apply it can be found using the following script:

```bash
#!/bin/sh
printf "%s\t%s\t%s\t%s\t%s\t%s\n" vhost policy_name pattern apply_to definition priority
for vhost in $(rabbitmqctl -q list_vhosts | tail -n +2) ; do
  rabbitmqctl -q list_policies -p "$vhost" |
    grep 'ha-mode'
done
```
## Features in use by Mirrored Classic Queues where Migration is Complex
When one or more of the following features are used by mirrored classic queues, straightforward migration to quorum queues is not possible. The way that application interacts with a broker needs to be changed. This information explains how to find whether some of these features are being used in a running system, and what changes need to be made for easier migration.

### Priority Queues
To find out if a classic mirrored queue uses the "priority " feature, you can check for the `x-max-priority` string in
the list of queues output that is provided by running the command in the **Finding the Mirrored Classic Queues for Migration** section or you can also search for the `x-max-priority` string in the source code. For more information on how the priority is implemented, go to [Priority Queue Support](https://www.rabbitmq.com/priority.html).

Priority queues are not created using a policy, therefore no policy changes required when migrating them. Classic mirrored queues create a separate queue for every priority behind the scenes. To migrate a single mirrored classic queues that uses the "priority" feature, you must create the required number amount of quorum queues. Once the quorum queues are created, adjust the publishing and consumption of these new quorum queues accordingly.

### Queue Length Limit overflow set to reject-publish-dlx

The queue length exceeded with `overflow` set to [`reject-publish-dlx`](https://rabbitmq.com/maxlength.html#overflow-behaviour) is not supported by quorum queues. The `reject-publish-dlx` value is not supported.

With mirrored classic queues, publishing to a full queue with `reject-publish-dlx` resulted in RabbitMQ republishing a rejected message to a dead letter exchange. With quorum queues, to apply the same logic, you must change `reject-publish-dlx` to `reject-publish`. Then, handle negative acknowledgements: after getting a negative acknowledgement, the application must publish the message again to a different exchange.

To find out if  `overflow` set to `reject-publish-dlx` is configured for the mirrored classic queues you want to migrate, check for the `x-max-priority` string in the list of queues output that is provided by running the command in the **Finding the Mirrored Classic Queues for Migration**  section or you can also search for the ``reject-publish-dlx`` string in the source code.

### Global QoS for Consumers

Global [QoS prefetch](https://rabbitmq.com/quorum-queues.html#global-qos) where a channel sets a single prefetch limit for all consumers using that channel is not supported by quorum queues. If this functionality is required, try achieving the same results using alternative methods, for example, one solution might be to use a lower per-consumer QoS (given the known application load pattern).

To find out if this feature is used, run the following command on a running system and check for a non-empty output:

```bash
rabbitmqctl list_channels pid name global_prefetch_count | sed -n '/\t0$/!p'
```

A list of channel PIDs that have global QoS enabled are returned. Then, run the following command to map the channel PID to a queue name to verify if it is a mirrored classic queue. 

```bash
rabbitmqctl list_consumers queue_name channel_pid
```
### `x-cancel-on-ha-failover` for Consumers

Mirrored queues consumers can be [automatically
cancelled](https://www.rabbitmq.com/ha.html#cancellation) when a queue
leader fails over. This can cause a loss of information about which
messages were sent to which consumer, and result in the same messages being sent again (duplicate messages). 

Quorum queues will not have the same results in this situation i.e. duplicate messages are not sent again except when there is a complete node failure,  or messages are resent for inflight messages when the consumer is cancelled or the channel is closed.

In summary, with mirrored classic queues, you can observe possible duplicates in some cases. With quorum queues, this observation is not possible but you should note that duplicates messages can still happen for some of the reasons they happened when using mirrored classic queues. However, duplicate messages occur less frequent with quorum queues.

## Features in use by Mirrored Classic Queues that Simply need to be removed from Source Code or moved to a Policy

The following features don't complete any function when quorum queues are being
used. The best way to handle them is to completed remove them from the source
code, or move them to a policy instead.

### Lazy Queues

Mirrored classic queues can optionally operate in [lazy
mode](https://rabbitmq.com/lazy-queues.html#overview). For quorum
queues this is the only way of operation. The best way to handle this
for migration is to move `x-queue-mode` from the source code to a policy.

### Transcient Queues

[Transcient queues](https://www.rabbitmq.com/queues.html#durability) are deleted on a node/cluster boot. 

The plan is to remove transcient queues in future RabbitMQ releases.
the only option for ephemeral queues will be exclusive queues. This
affects only durability of queue definitions, messages can still be marked
transient.

For such queues a decision have to be made one way or another: is this
queue content important enough to get availability guarantees of
quorum queues, or it's better to downgrade it to a classic (but
durable) queue.

### Exclusive queues

[Exclusive queues](https://www.rabbitmq.com/queues.html#exclusive-queues) are not mirrored even if the policy states it is. An
attempt to declare an exclusive quorum queue will result in an
error. This is clearly one of the cases where migration is not needed,
but care must be taken as to avoid exclusive queue declarations with
an explicit `x-queue-type: quorum` argument.



