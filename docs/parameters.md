---
title: Runtime Parameters
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Runtime Parameters

## Overview {#overview}

While much of the configuration for RabbitMQ lives in
the [configuration file](./configure), some things
do not mesh well with the use of a configuration file:

 * If they need to be the same across all nodes in a cluster
 * If they are likely to change at run time

RabbitMQ calls these items _parameters_. Parameters can be
set by invoking [`rabbitmqctl`](./man/rabbitmqctl.8)
or through [the HTTP API](./management).

There are two kinds of parameters: virtual host-scoped parameters and global parameters.
The former, as the name suggests, are tied to a virtual host and consist
of a component name, a name and a value.

For example, a dynamic [shovel](./shovel) is definened using runtime parameters.
It belongs to a virtual host, has a name and its component type is set to `"shovel"`.

Global parameters are not tied to a particular virtual host and they consist
of a name and value.

:::important

One important example of parameters usage is [policies](./policies)

:::


## Per-virtual host Parameters {#per-vhost}

As stated above, there are vhost-scoped parameters and global parameters.
An example of vhost-scoped
parameter is a federation upstream: it targets a component
(`federation-upstream`), it has a name that identifies
it, it's tied to a virtual host (federation links will target
some resources of this virtual host), and its value defines connection
parameters to an upstream broker.

Virtual host-scoped parameters can be set, cleared and listed:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
# sets a runtime parameter in a virtual host
rabbitmqctl set_parameter [-p vhost] <component_name> <name> <value>

# lists runtime parameters in a virtual host
rabbitmqctl list_parameters [-p vhost]

# clears (unsets) a runtime parameter in a virtual host
rabbitmqctl clear_parameter [-p vhost] <component_name> <name>
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
# Note: for federation upstreams and shovels, use the dedicated 'federation' and 'shovels' command groups instead

# sets a runtime parameter in a virtual host
rabbitmqadmin --vhost "vhost-1" parameters set \
        --name "upstream-1" \
        --component "federation-upstream" \
        --value '{"uri": "amqp://target.hostname/vhost"}'

# lists runtime parameters in a virtual host
rabbitmqadmin --vhost "vhost-1" parameters list

# clears (unsets) a runtime parameter in a virtual host
rabbitmqadmin --vhost "vhost-1" parameters clear \
    --name "upstream-1" \
    --component "federation-upstream"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
# sets a runtime parameter in a virtual host
rabbitmqctl.bat set_parameter [-p vhost] <component_name> <name> <value>

# lists runtime parameters in a virtual host
rabbitmqctl.bat list_parameters [-p vhost]

# clears (unsets) a runtime parameter in a virtual host
rabbitmqctl.bat clear_parameter [-p vhost] <component_name> <name>
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# Note: for federation upstreams and shovels, use the dedicated 'federation' and 'shovels' command groups instead

# sets a runtime parameter in a virtual host
rabbitmqadmin.exe --vhost "vhost-1" parameters set ^
        --name "upstream-1" ^
        --component "federation-upstream" ^
        --value "{""uri"": ""amqp://target.hostname/vhost""}"

# lists runtime parameters in a virtual host
rabbitmqadmin.exe --vhost "vhost-1" parameters list

# clears (unsets) a runtime parameter in a virtual host
rabbitmqadmin.exe --vhost "vhost-1" parameters clear ^
    --name "upstream-1" ^
    --component "federation-upstream"
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
```ini
PUT /api/parameters/{component_name}/{vhost}/{name}
GET /api/parameters
DELETE /api/parameters/{component_name}/{vhost}/{name}
```
</TabItem>
</Tabs>


## Global Parameters {#global}

Global parameters is the other kind of parameters.
An example of a global parameter is the name of the cluster.
Global parameters can be set, cleared and listed:

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
# sets a global (virtual-host-independent) runtime parameter
rabbitmqctl set_global_parameter <name> <value>

# lists global (virtual-host-independent) runtime parameters
rabbitmqctl list_global_parameters

# clears (unsets) a global (virtual-host-independent) runtime parameter
rabbitmqctl clear_global_parameter <name>
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
# sets a global (virtual-host-independent) runtime parameter
rabbitmqadmin global_parameters set --name "cluster_tags" --value '{"region": "ca-central-1"}'

# lists global (virtual-host-independent) runtime parameters
rabbitmqadmin global_parameters list

# clears (unsets) a global (virtual-host-independent) runtime parameter
rabbitmqadmin global_parameters clear --name "cluster_tags"
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
# sets a global (virtual-host-independent) runtime parameter
rabbitmqctl.bat set_global_parameter <name> <value>

# lists global (virtual-host-independent) runtime parameters
rabbitmqctl.bat list_global_parameters

# clears (unsets) a global (virtual-host-independent) runtime parameter
rabbitmqctl.bat clear_global_parameter <name>
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```PowerShell
# sets a global (virtual-host-independent) runtime parameter
rabbitmqadmin.exe global_parameters set --name "cluster_tags" --value "{""region"": ""ca-central-1""}"

# lists global (virtual-host-independent) runtime parameters
rabbitmqadmin.exe global_parameters list

# clears (unsets) a global (virtual-host-independent) runtime parameter
rabbitmqadmin.exe global_parameters clear --name "cluster_tags"
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
```ini
PUT /api/global-parameters/name
GET /api/global-parameters
DELETE /api/global-parameters/name
```
</TabItem>
</Tabs>

Since a parameter value is a JSON document, you will usually
need to quote it when creating one on the command line
with `rabbitmqctl`. On Unix it is usually easiest to
quote the whole document with single quotes, and use double
quotes within it. On Windows you will have to escape every
double quote. We give examples for both Unix and Windows for
this reason.

Parameters reside in the database used by RabbitMQ for
definitions of virtual hosts, exchanges, queues, bindings, users
and permissions. Parameters are exported along with other object
definitions by the management plugin's export feature.

Virtual-scoped parameters are used by the federation and shovel plugins.

Global parameters are used to store various cluster-level metadata,
for example, cluster name, cluster tags, as well as internal
node metada such as imported [definitions](./definitions) hash.


### Cluster Name

Cluster name stored using global runtime parameters. It can be
updated using a dedicated CLI command.

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
rabbitmqctl set_cluster_name rabbit@id-3942837
```
</TabItem>

<TabItem value="PowerShell" label="rabbitmqctl with PowerShell">
```PowerShell
rabbitmqctl.bat set_cluster_name rabbit@id-3942837
```
</TabItem>
</Tabs>


### Cluster Tags

Cluster tags are arbitrary key-value pairs that describe a cluster. They can be used by
operators to attach deployment-specific information.

Cluster tags are stored in a global parameter named `cluster_tags`.
They can also be preconfigured using `rabbitmq.conf`:

```ini
cluster_tags.series = 4.1.x

cluster_tags.purpose = iot_ingress
cluster_tags.region = ca-central-1
cluster_tags.environment = production
```

To retrieve a list of tags, list global runtime parametersor fetch a global runtime parameter
named `cluster_tags`, or use [`rabbitmqadmin` v2](./management-cli)'s `snow overview` command.

<Tabs groupId="examples">
<TabItem value="bash" label="rabbitmqctl with bash" default>
```bash
# lists global (virtual-host-independent) runtime parameters
rabbitmqctl list_global_parameters
```
</TabItem>

<TabItem value="rabbitmqadmin" label="rabbitmqadmin with bash">
```bash
# lists global (virtual-host-independent) runtime parameters
rabbitmqadmin global_parameters list

# another command that includes certain global parameters in its
# output, namely node and cluster tags
rabbitmqadmin show overview
```
</TabItem>

<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# lists global (virtual-host-independent) runtime parameters
rabbitmqctl.bat list_global_parameters
```
</TabItem>

<TabItem value="rabbitmqadmin-PowerShell" label="rabbitmqadmin with PowerShell">
```bash
# lists global (virtual-host-independent) runtime parameters
rabbitmqadmin.exe global_parameters list

# another command that includes certain global parameters in its
# output, namely node and cluster tags
rabbitmqadmin.exe show overview
```
</TabItem>

<TabItem value="HTTP API" label="HTTP API">
```ini
GET /api/global-parameters

GET /api/global-parameters/cluster_tags
```
</TabItem>
</Tabs>


## Policies

[Policies](./policies) are now documented in a dedicated guide.

## Operator Policies {#operator-policies}

[Operator policies](./policies#operator-policies) are now documented in the policies guide.
