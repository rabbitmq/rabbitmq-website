---
title: Deprecated Features
---
<!--
Copyright (c) 2024 Broadcom. All Rights Reserved. The term "Broadcom" refers
to Broadcom Inc. and/or its subsidiaries.

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

# Deprecated Features

## Overview

Over time, some features of RabbitMQ are not relevant anymore. Sometimes, a
feature must go away to leave the room for a better replacement. Before we
deorbit a feature, we follow a deprecation time window: we announce that a
feature is deprecated along with the reasoning, how user should prepare for
that and the estimated future version of RabbitMQ where this deprecated
feature will be removed and unsupported.

Beside the public announcement, RabbitMQ has a Deprecated features subsystem
that helps notify users right from the broker if they are using a feature that
will be removed in the future.

You can view the [list of actually deprecated features in a dedicated
page](/release-information/deprecated-features-list).

## The lifecycle of a deprecated feature

The Deprecated features subsystem is based on the [Feature flags
subsystem](./feature-flags). Therefore, much like a feature flag which goes
from experimental to stable to required, a deprecated feature follow the
following phases:

1. **Permitted by default**. A user can continue to use the feature. They just
   get warnings in the logs and can use a configuration knob to start RabbitMQ
   as if the feature was removed for testing purpose.
2. **Denied by default**. The feature is still there, but it is not usable out
   of the box, like if it was already removed. A user can turn it back on from
   the configuration.
3. **Disconnected**. The feature is still present in the code, but it is
   compiled out in official packages. A user has to recompile RabbitMQ from
   source to be able to continue to use it. Note that we do not plan to use
   this phase very often, if ever.
4. **Removed**. The code of the feature is gone and it is not possible to use
   it anymore. This is the equivalent of a required feature flag.

## Checking if deprecated features are used

In addition to the [full list of deprecated
features](/release-information/deprecated-features-list) documented on this
website, you can view the deprecated features for a specific RabbitMQ
deployment using:
* the [CLI](./man/rabbitmq-diagnostics.8)'s `rabbitmq-diagnostics list_deprecated_features`
* the [management UI](./management) Admin > Deprecated Features panel

You can query RabbitMQ to find out if a node or cluster is actively using one
or more deprecated features:

```sh
rabbitmq-diagnostics check_if_any_deprecated_features_are_used
```

It lists used deprecated features (if any) and exits with 0 if none are used,
or non-zero if one or more deprecated features are actively used.

You can do the same using the HTTP API:

```
GET /api/deprecated-features/used
```

:::info
Note that the result of these queries depends on if the use of a deprecated
feature can be detected or not. For instance, it is possible to detect if
classic queue mirroring is used. However it is not for global QoS.
:::

## Configuring deprecated features behavior

As described above, a user may decide to turn off a deprecated feature to test
the behavior of RabbitMQ and their applications as if the feature was already
removed.

```ini
# Try RabbitMQ as if the deprecated feature was gone.
deprecated_features.permit.some_deprecated_feature = false
```

Another user may decied to turn a *denied by default* deprecated feature back
on to buy more time to adapt their applications while still upgrading
RabbitMQ:

```ini
# Permit a deprecated feature that is denied by default.
deprecated_features.permit.some_deprecated_feature = true
```
