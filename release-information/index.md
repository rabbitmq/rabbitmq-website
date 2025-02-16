---
title: Release Information
---
<!--
Copyright (c) 2007-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

import {
  RabbitMQServerReleaseInfoTable,
} from '@site/src/components/RabbitMQServerReleaseInfo';

# Release Information

Use this information to find out what RabbitMQ releases are currently covered
by community or extended commercial support and what release is coming next.

If you want to upgrade from one release to another, read the documentation and
the release notes of the target release.

## RabbitMQ Releases {#currently-supported}

<RabbitMQServerReleaseInfoTable/>

:::note
Older releases not listed in the table above are unsupported.
:::

## Support Policy {#support-policy}

In January 2023, the term **general support** was replaced with **community
support** to avoid confusion with the VMware [terminology related to the support lifecycle policy](https://tanzu.vmware.com/support/lifecycle_policy).

### Community Support

:::important
From June 1st, 2024 and onwards, the [RabbitMQ Core Team at Broadcom](https://github.com/rabbitmq/) only provides support to paying customers
and [regularly contributing users](https://github.com/rabbitmq/rabbitmq-server/blob/main/COMMUNITY_SUPPORT.md).
:::

As a result of feedback from the [community](/contact) and
those with a commercial license, RabbitMQ patch releases are produced regularly.

Community support for [regularly contributing users](https://github.com/rabbitmq/rabbitmq-server/blob/main/COMMUNITY_SUPPORT.md)
is provided via [community resources](/contact). Refer to the previous table for end dates for this support.

[Users who do not contribute](https://github.com/rabbitmq/rabbitmq-server/blob/main/COMMUNITY_SUPPORT.md) or hold a valid commercial license
can use community resources for questions but are not entitled to any support from the RabbitMQ Team at Broadcom.

### Extended Commercial Support

Extended Commercial Support is included in [VMware’s Commercial Open Source RabbitMQ Support](https://tanzu.vmware.com/rabbitmq/oss).
RabbitMQ patches are produced for security and high severity issues that are reported by users with
a commercial license. If you already have a license, go to [paid commercial support enquiries](/contact).
Refer to the previous table for end dates for this support.

## The Next Release

RabbitMQ 4.1 is the release series currently [under active development](https://github.com/rabbitmq/rabbitmq-server).
It is expected to be released in the first half of 2025.
