---
title: "Required feature flags in RabbitMQ 3.11.0"
tags: []
authors: [jpedron]
---

RabbitMQ 3.11.0 will make all [feature
flags](/docs/feature-flags) introduced during the life
of RabbitMQ 3.8.x required.

People who initially created clusters using RabbitMQ 3.8.9 or older should
enable all feature flags before upgrading to RabbitMQ 3.11! If the feature
flags are not enabled, RabbitMQ 3.11.0+ will refuse to start.

<!-- truncate -->

Feature flags are a mechanism to make breaking changes to RabbitMQ while still
maintaining the compatibility between several versions of RabbitMQ. They
usually come with code to migrate data structures in the internal schema
database or on disk for instance. There is also compatibility code scattered in
the code to support the old and new behaviors and structures at the same time
at runtime.

In other words, feature flags are really meant to allow rolling cluster
upgrades. They are not there to let you decide e.g. "I don't want quorum
queues, so I will never enable the corresponding feature flag". Enabling the
feature flag does not force you to use the feature behind it. And most feature
flags protect an internal change which has no visible impact to end users.
Consider that all feature flags should generally be enabled as soon as possible
because they allow you to upgrade RabbitMQ.

This benefit obviously comes with a cost for us to maintain and test however.
Furthermore, this may interfere with new changes and slow us down.

RabbitMQ 3.11.0 will therefore be the first release where we mark some feature
flags as required and remove their corresponding compatibility and migration
code. The affected feature flags are:
* `quorum_queue` (support for [quorum
  queues](/docs/quorum-queues))
* `implicit_default_bindings` (default bindings now implicit, instead of being
  stored in the database, to speed up creation of queues and exchanges)
* `virtual_host_metadata` (ability to add metadata to virtual host metadata;
  description, tags, etc)
* `maintenance_mode_status` (ability to switch RabbitMQ to a maintenance mode)
* `user_limits` (ability to configure connection and channel limits for a user)

For you as an end user, it means the following things:

1.  When starting a fresh RabbitMQ node for the first time, required feature
    flags will always be enabled, even if the `$RABBITMQ_FEATURE_FLAGS`
    environment says otherwise for instance.

2.  When restarting or upgrading a RabbitMQ, if the required feature flags are
    not already enabled, the node will refuse to start. Here is an example of
    the logged error message in this case:

    ```
    2022-07-13 11:29:28.366877+02:00 [error] <0.232.0> Feature flags: `implicit_default_bindings`: required feature flag not enabled! It must be enabled before upgrading RabbitMQ.
    2022-07-13 11:29:28.366905+02:00 [error] <0.232.0> Failed to initialize feature flags registry: {disabled_required_feature_flag,
    2022-07-13 11:29:28.366905+02:00 [error] <0.232.0>                                               implicit_default_bindings}
    2022-07-13 11:29:28.372830+02:00 [error] <0.232.0>
    2022-07-13 11:29:28.372830+02:00 [error] <0.232.0> BOOT FAILED
    2022-07-13 11:29:28.372830+02:00 [error] <0.232.0> ===========
    2022-07-13 11:29:28.372830+02:00 [error] <0.232.0> Error during startup: {error,failed_to_initialize_feature_flags_registry}
    2022-07-13 11:29:28.372830+02:00 [error] <0.232.0>
    ```

By default, all feature flags are enabled out-of-the-box when starting a brand
new node or cluster. So there is great chance you won't be affected because
they are probably already enabled.

However, if you initially created your cluster using RabbitMQ 3.8.9 or older
and you never enabled the feature flags, make sure to enable all of them before
you upgrade to RabbitMQ 3.11! If you are still on RabbitMQ 3.7.x or an early
3.8.x, you may need to:
1. upgrade to the latest 3.8.x, 3.9.x or 3.10.x first
2. enable the feature flags
3. upgrade to RabbitMQ 3.11.0+

If you don't do that, RabbitMQ 3.11.0+ will refuse to start. If this happens,
you will have to downgrade RabbitMQ back to the version you were using before
switching to 3.11.0+ and apply the same procedure as above. But RabbitMQ does
not support downgrades, you say! True and I'm glad you read the docs carefully.
This one is a specific situation: the ability to start is verified very early
in the process and no data structure migration was performed at that stage.
That's why, it's still possible to reinstall the previous package and restart
RabbitMQ to enable the required feature flags.
