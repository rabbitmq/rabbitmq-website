---
title: Per-user Resource Limits
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Per-user Resource Limits

## Overview

Similarly to [per-virtual host resource limits](./vhosts#limits), it is possible to limit
how many connections and channels a specific user can open.

These limits can be used as guard rails in environments where applications
cannot be trusted and monitored in detail, for example, when RabbitMQ clusters
are offered as a service.

The limits can be configured using CLI tools or the [HTTP API](./management#http-api).

## Maximum Number of Connections {#connections}

To limit how many connections a user can open, set the `max-connections` limit to
a positive integer:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_user_limits user1 '{"max-connections": 10}'
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin user_limits declare --user user1 --name max-connections --value 10
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_user_limits user1 "{""max-connections"": 10}"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe user_limits declare --user user1 --name max-connections --value 10
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
Use the `PUT /api/user-limits/{username}/{limit}` endpoint with a request body like this:

```javascript
{"value": 20}
```

Here is an example that uses `curl`:

```bash
curl -v -u guest:guest -X PUT http://localhost:15672/api/user-limits/user1/max-connections \
                       -H "content-type: application/json" \
                       -d @- <<EOF
{
  "value": 20
}
EOF
```
</TabItem>
</Tabs>

## Maximum Number of Channels {#channels}

To limit how many channels, in total, a user can open, set the `max-channels` limit to
a positive integer:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_user_limits guest '{"max-connections": 10, "max-channels": 20}'
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin user_limits declare --user guest --name max-channels --value 20
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_user_limits guest "{""max-connections"": 10, ""max-channels"": 20}"
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe user_limits declare --user guest --name max-channels --value 20
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
Use the `PUT /api/user-limits/{username}/{limit}` endpoint with a request body like this:

```javascript
{"value": 20}
```

Here is an example that uses `curl` to set a limit for user `user1`:

```bash
curl -v -u guest:guest -X PUT http://localhost:15672/api/user-limits/user1/max-channels \
                       -H "content-type: application/json" \
                       -d @- <<EOF
{
  "value": 20
}
EOF
```
</TabItem>
</Tabs>

The limit is applied to the total number of channels across all connections opened
by the user. Therefore, it must be equal to or greater than the aforementioned maximum
connection limit.

## Listing User Limits {#listing}

To list limits for a specific user:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl list_user_limits user1
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
rabbitmqadmin user_limits list --user user1
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat list_user_limits user1
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
rabbitmqadmin.exe user_limits list --user user1
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
```bash
curl -u guest:guest -X GET http://localhost:15672/api/user-limits/user1
```
</TabItem>
</Tabs>

## Clearing User Limits {#clearing}

To clear limits for a user, use CLI tools or the [HTTP API](./management#http-api).

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
# clears the maximum number of connections limit
rabbitmqctl clear_user_limits user1 'max-connections'

# clears the maximum number of channels limit
rabbitmqctl clear_user_limits user1 'max-channels'

# clears all limits in a single operation
rabbitmqctl clear_user_limits user1 all
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
# clears the maximum number of connections limit
rabbitmqadmin user_limits delete --user user1 --name max-connections

# clears the maximum number of channels limit
rabbitmqadmin user_limits delete --user user1 --name max-channels
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
# clears the maximum number of connections limit
rabbitmqctl.bat clear_user_limits user1 "max-connections"

# clears the maximum number of channels limit
rabbitmqctl.bat clear_user_limits user1 "max-channels"

# clears all limits in a single operation
rabbitmqctl.bat clear_user_limits user1 all
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# clears the maximum number of connections limit
rabbitmqadmin.exe user_limits delete --user user1 --name max-connections

# clears the maximum number of channels limit
rabbitmqadmin.exe user_limits delete --user user1 --name max-channels
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
Use the `DELETE /api/user-limits/{username}/{limit}` endpoint without a request body.

Here is an example that uses `curl` to clear all limits of user `user1`:

```bash
curl -v -u guest:guest -X DELETE http://localhost:15672/api/user-limits/user1/max-channels

curl -v -u guest:guest -X DELETE http://localhost:15672/api/user-limits/user1/max-connections
```
</TabItem>
</Tabs>
