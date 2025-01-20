---
title: Authentication, Authorisation, Access Control
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

# Authentication, Authorisation, Access Control

## Overview {#overview}

This document describes [authentication](#authentication) and [authorisation](#authorisation) features
in RabbitMQ. Together they allow the operator to control access to the system.

Different users can be granted access only to specific [virtual hosts](./vhosts). Their
permissions in each virtual host also can be limited.

RabbitMQ supports two major [authentication mechanisms](#mechanisms)
as well as several [authentication and authorisation backends](#backends).

This guide covers a variety of authentication, authorisation and user management topics such as

 * [Access control essentials](#basics)
 * [Default virtual host and user](#default-state)
 * [Connectivity limitations](#loopback-users) imposed on the default user
 * [Authorisation and resource permissions](#authorisation)
 * How to [manage users and permissions](#user-management) using CLI tools
 * How to change an authentication or authorization [backend used](#backends), or use a combination of backends
 * How to [authenticate clients using their TLS certificate information](#certificate-authentication)
 * How to limit [access to topics on a topic exchange](#topic-authorisation)
 * [User tags](#user-tags) and how they are used
 * How to rotate credentials and [revoke access](#revoke) for a user
 * [Shell escaping](#passwords-and-shell-escaping) of characters in generated passwords
 * How to [pre-create users](#seeding) and their permissions
 * Troubleshooting of [authentication](#troubleshooting-authn) and [authorisation failures](#troubleshooting-authz)

[Password-based](./passwords) authentication has a companion guide.
Two closely related topics of [OAuth 2 support](./oauth2) and  [TLS support](./ssl), including x.509-certificate based authentication,
are covered in dedicated guides.


## Terminology and Definitions {#terminology-and-definitions}

Authentication and authorisation are often confused or used
interchangeably. That's wrong and in RabbitMQ, the two are
separated. For the sake of simplicity, we'll define
authentication as "identifying who the user is" and
authorisation as "determining what the user is and isn't allowed to do."


## The Basics {#basics}

When clients [connect](./connections) to RabbitMQ, they specify a set of credentials:
a username-password pair, a [JWT token](./oauth2), or a [x.509 certificate](./ssl). Every connection has
an associated user which is authenticated. It also targets a [virtual host](./vhosts) for which
the user must have a certain set of permissions.

User credentials, target virtual host and (optionally) client [certificate](./ssl) are specified at connection
initiation time.


There is a default pair of credentials called the [default user](#default-state). This user can only
be [used for **host-local connections**](#loopback-users) by default. Remote connections that use
the default user will be refused.

[Production environments](./production-checklist) should not use the default user.
Create new user accounts with generated credentials instead.


## Default Virtual Host and User {#default-state}

When the server first starts running, and detects that its
database is uninitialised or has been reset or deleted (the node is a "blank node"), it
initialises a fresh database with the following resources:

 * a [virtual host](./vhosts) named <code>/</code> (a slash)
 * a user named <code>guest</code> with a default password of <code>guest</code>, granted full access to the <code>/</code> virtual host

If a blank node [imports definitions on boot](./definitions#import-on-boot-nuances),
this default user will not be created.

It is **highly recommended** to [pre-configure a new user with a generated username and password](#seeding) or [delete](./man/rabbitmqctl.8#delete_user)
the `guest` user or at least [change its password](./man/rabbitmqctl.8#change_password)
to reasonably secure generated value that won't be known to the public.


## Authentication: Who Do You Say You Are? {#authentication}

After an application connects to RabbitMQ and before it can perform operations, it must
authenticate, that is, present and prove its identity. With that identity, RabbitMQ nodes can
look up its permissions and [authorize](#authorisation) access to resources
such as [virtual hosts](./vhosts), queues, exchanges, and so on.

Two primary ways of authenticating a client are [username/password pairs](./passwords)
and [X.509 certificates](https://en.wikipedia.org/wiki/X.509). Username/password pairs
can be used with a variety of [authentication backends](#backends) that verify the credentials.

Connections that fail to authenticate will be closed with an error message in the [server log](./logging).

### Authentication using Client TLS (x.509) Certificate Data {#certificate-authentication}

To authenticate client connections using X.509 certificate a built-in plugin,
[rabbitmq-auth-mechanism-ssl](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_mechanism_ssl),
must be enabled and clients must be [configured to use the EXTERNAL mechanism](#mechanisms).
With this mechanism, any client-provided password will be ignored.


## "guest" user can only connect from localhost {#loopback-users}

:::danger
The restrictions described in this section exist for a reason. Enabling such
connections can dramatically decrease the security of the cluster. Consider creating
a [unique user with generated credentials](#user-management) for all production clusters.
:::

By default, the `guest` user is prohibited from
connecting from remote hosts; it can only connect over
a loopback interface (`localhost`). This
applies to [connections regardless of the protocol](./connections).
Any other users will not (by default) be restricted in this way.

Remote connections that use
the default user will be refused with a [log message](./logging) similar to this:

```
[error] <0.918.0> PLAIN login refused: user 'guest' can only connect via localhost
```

The recommended way to address this in production systems
is to create a new user with generated credentials, or set of users, with the permissions
to access the necessary virtual hosts. This can be done
using [CLI tools](./cli), [HTTP API or definitions import](./management).

:::danger

[Fedora Linux's RabbitMQ package](https://packages.fedoraproject.org/pkgs/rabbitmq-server/rabbitmq-server/) is
[patched](https://src.fedoraproject.org/rpms/rabbitmq-server/blob/f41/f/rabbitmq-server-0001-Allow-guest-login-from-non-loopback-connections.patch)
to allow for remote connections with well known credentials.

This practice is very strongly recommended against.
Fedora Linux users should consider installing RabbitMQ from [Team RabbitMQ's package
repositories](/docs/install-rpm/) and avoid using the distribution-packaged version unless this serious
distribution-specific security flaw is [addressed](https://bugzilla.redhat.com/show_bug.cgi?id=2333073).

:::

This is configured via the <code>loopback_users</code> item
in the [configuration file](./configure#configuration-files).

It is possible to allow the <code>guest</code> user to connect
from a remote host by setting the
<code>loopback_users</code> configuration to
<code>none</code>.

A minimalistic [RabbitMQ config file](./configure)
which allows remote connections for <code>guest</code> looks like so:

```ini
# DANGER ZONE!
#
# allowing remote connections for default user is highly discouraged
# as it dramatically decreases the security of the system. Delete the default user
# instead and create a new one with generated secure credentials, or use JWT tokens,
# or x.509 certificates for clients to authenticate themselves
loopback_users = none
```


## Managing Users and Permissions {#user-management}

Users and permissions can be managed using [CLI tools](./cli) and definition import (covered below).

### Before We Start: Shell Escaping and Generated Passwords {#passwords-and-shell-escaping}

It is a common security practice to generate complex passwords,
often involving non-alphanumeric characters. This practice is perfectly
applicable to RabbitMQ users.

Shells (`bash`, `zsh`, and so on) interpret certain characters
(`!`, `?`, `&`, `^`, `"`, `'`, `*`, `~`, and others) as control characters.

When a password is specified on the command line for `rabbitmqctl add_user`, `rabbitmqctl change_password`,
and other commands that accept a password, such control characters must be escaped appropriately
for the shell used.
With inappropriate escaping the command will fail or RabbitMQ CLI tools will receive a different value
from the shell.

When generating passwords that will be passed on the command line,
long (say, 40 to 100 characters) alphanumeric value with a very limited set of
symbols (e.g. `:`, `=`) is the safest option.

When users are created via [HTTP API](./management) without using a shell (e.g. `curl`),
the control character limitation does not apply. However, different escaping rules may be necessary
depending on the programming language used.

### Adding a User

To add a user, use `rabbitmqctl add_user`. It has multiple ways of specifying a [password](./passwords):

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# will prompt for password, only use this option interactively
rabbitmqctl add_user "username"

# Password is provided via standard input.
# Note that certain characters such as !, &, $, #, and so on must be escaped to avoid
# special interpretation by the shell.
echo '2a55f70a841f18b97c3a7db939b7adc9e34a0f1b' | rabbitmqctl add_user 'username'

# Password is provided as a command line argument.
# Note that certain characters such as !, &, $, #, and so on must be escaped to avoid
# special interpretation by the shell.
rabbitmqctl add_user 'username' '2a55f70a841f18b97c3a7db939b7adc9e34a0f1b'
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# password is provided as a command line argument
rabbitmqctl.bat add_user 'username' '9a55f70a841f18b97c3a7db939b7adc9e34a0f1d'

# passwords with special characters must be quoted correctly
rabbitmqctl.bat add_user 'username' '"w63pnZ&LnYMO(t"'
```
</TabItem>
<TabItem value="cmd" label="cmd">
```batch
rem password is provided as a command line argument
rabbitmqctl.bat add_user "username" "9a55f70a841f18b97c3a7db939b7adc9e34a0f1d"

rem passwords with special characters must be quoted correctly
rabbitmqctl.bat add_user "username" "w63pnZ&LnYMO(t"
```
</TabItem>
</Tabs>

A newly added user must be [granted permissions](#grant-permissions) for one or more virtual hosts,
otherwise its connections will be refused.

### Listing Users

To list users in a cluster, use `rabbitmqctl list_users`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl list_users
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat list_users
```
</TabItem>
</Tabs>

The output can be changed to be JSON:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl list_users --formatter=json
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat list_users --formatter=json
```
</TabItem>
</Tabs>

### Deleting a User

To delete a user, use `rabbitmqctl delete_user`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl delete_user 'username'
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat delete_user 'username'
```
</TabItem>
</Tabs>

### Granting Permissions to a User {#grant-permissions}

To grant [permissions](#authorisation) to a user in a [virtual host](./vhosts), use `rabbitmqctl set_permissions`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# First ".*" for configure permission on every entity
# Second ".*" for write permission on every entity
# Third ".*" for read permission on every entity
rabbitmqctl set_permissions -p "custom-vhost" "username" ".*" ".*" ".*"
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# First ".*" for configure permission on every entity
# Second ".*" for write permission on every entity
# Third ".*" for read permission on every entity
rabbitmqctl.bat set_permissions -p 'custom-vhost' 'username' '.*' '.*' '.*'
```
</TabItem>
</Tabs>

### Clearing Permissions of a User in a Virtual Host

To revoke [permissions](#authorisation) from a user in a [virtual host](./vhosts), use `rabbitmqctl clear_permissions`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# Revokes permissions in a virtual host
rabbitmqctl clear_permissions -p "custom-vhost" "username"
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# Revokes permissions in a virtual host
rabbitmqctl.bat clear_permissions -p 'custom-vhost' 'username'
```
</TabItem>
</Tabs>

### Operations on Multiple Virtual Hosts

Every `rabbitmqctl` permission management operation is scoped to a single virtual host.
Bulk operations have to be scripted, with the list of virtual hosts coming from `rabbitmqctl list_vhosts --silent`:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
# Assumes a Linux shell.
# Grants a user permissions to all virtual hosts.
for v in $(rabbitmqctl list_vhosts --silent); do rabbitmqctl set_permissions -p $v "a-user" ".*" ".*" ".*"; done
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat list_vhosts --silent | %{ rabbitmqctl.bat set_permissions -p $_ 'a-user' '.*' '.*' '.*' }
```
</TabItem>
</Tabs>

## Seeding (Pre-creating) Users and Permissions {#seeding}

[Production environments](./production-checklist) typically need to pre-configure (seed) a number
of virtual hosts, users and user permissions.

This can be done in a few ways:

 * Using [CLI tools](./cli)
 * [Definition export and import on node boot](./definitions) (recommended)
 * Override [default credentials](#default-state) in configuration file(s)

### CLI Tools

See the section on [User Management](#user-management).

### Definition Import at Node Boot Time

This process involves the following steps:

 * Set up a temporary node and create the necessary virtual host, users, permissions, and so on using CLI tools
 * Export definitions to a definition file
 * Remove parts of the file that are not relevant
 * Configure the node to import the file on node boot or after

See [importing definitions on node boot](./definitions#import-on-boot) in the definitions guide to learn more.

### Definition Import After Node Boot

See [importing definitions after node boot](./definitions#import) in the definitions guide.

### Override Default User Credentials

Two configuration options can be used to override default user credentials. This user will only
be created **on first node boot** so they must exist in the configuration file before
first boot.

The settings are:

```ini
# default is "guest", and its access is limited to localhost only.
# See ./access-control#default-state
default_user = a-user
# default is "guest"
default_pass = 768a852ed69ce916fa7faa278c962de3e4275e5f
```

As with all values in [`rabbitmq.conf`](./configure#config-file), the `#` character
starts a comment so this character must be avoided in generated credentials.

Default user credentials can also be encrypted.
That requires the use of the [advanced configuration file](./configure#advanced-config-file), `advanced.config`.
This topic is covered in more detail in [Configuration Value Encryption](./configure#configuration-encryption).


## Authorisation: How Permissions Work {#authorisation}

When a RabbitMQ client establishes a connection to a
server and [authenticates](#authentication), it specifies a virtual host within which it intends
to operate. A first level of access control is enforced at
this point, with the server checking whether the user has
any permissions to access the virtual hosts, and rejecting
the connection attempt otherwise.

Resources, i.e. exchanges and queues, are named entities
inside a particular virtual host; the same name denotes a
different resource in each virtual host. A second level of
access control is enforced when certain operations are
performed on resources.

RabbitMQ distinguishes between `configure`,
`write` and `read` operations on a
resource. The `configure` operations create or
destroy resources, or alter their behaviour. The
`write` operations inject messages into a
resource. And the `read` operations retrieve messages
from a resource.

In order to perform an operation on a resource the user must
have been granted the appropriate permissions for it. The
following table shows what permissions on what type of
resource are required for all the AMQP 0-9-1 commands which
perform permission checks.

<table>
  <tr>
    <th>AMQP 0-9-1 Operation</th>
    <th></th>
    <th>configure</th>
    <th>write</th>
    <th>read</th>
  </tr>
  <tr>
    <td>exchange.declare</td><td>(passive=false)</td><td>exchange</td><td/><td/>
  </tr>
  <tr>
    <td>exchange.declare</td><td>(passive=true)</td><td></td><td/><td/>
  </tr>
  <tr>
    <td>exchange.declare</td><td>(with <a href="./ae">AE</a>)</td><td>exchange</td><td>exchange (AE)</td><td>exchange</td>
  </tr>
  <tr>
    <td>exchange.delete</td><td/><td>exchange</td><td/><td/>
  </tr>
  <tr>
    <td>queue.declare</td><td>(passive=false)</td><td>queue</td><td/><td/>
  </tr>
  <tr>
    <td>queue.declare</td><td>(passive=true)</td><td></td><td/><td/>
  </tr>
  <tr>
    <td>queue.declare</td><td>(with <a href="./dlx">DLX</a>)</td><td>queue</td><td>exchange (DLX)</td><td>queue</td>
  </tr>
  <tr>
    <td>queue.delete</td><td/><td>queue</td><td/><td/>
  </tr>
  <tr>
    <td>exchange.bind</td><td/><td/><td>exchange (destination)</td><td>exchange (source)</td>
  </tr>
  <tr>
    <td>exchange.unbind</td><td/><td/><td>exchange (destination)</td><td>exchange (source)</td>
  </tr>
  <tr>
    <td>queue.bind</td><td/><td/><td>queue</td><td>exchange</td>
  </tr>
  <tr>
    <td>queue.unbind</td><td/><td/><td>queue</td><td>exchange</td>
  </tr>
  <tr>
    <td>basic.publish</td><td/><td/><td>exchange</td><td/>
  </tr>
  <tr>
    <td>basic.get</td><td/><td/><td/><td>queue</td>
  </tr>
  <tr>
    <td>basic.consume</td><td/><td/><td/><td>queue</td>
  </tr>
  <tr>
    <td>queue.purge</td><td/><td/><td/><td>queue</td>
  </tr>
</table>

Permissions are expressed as a triple of regular expressions
— one each for configure, write and read — on a per-vhost
basis. The user is granted the respective permission for
operations on all resources with names matching the regular
expressions.

For example, the table above demonstrates that the <code>queue.bind</code>
protocol operation requires `write` permission on the target <code>queue</code>
and the `read` permission is required on the target <code>exchange</code>.

In other words, in order to allow a user to bind a queue named <code>queueA</code> to
an exchange named <code>exchangeB</code> the user will need the `write`
permission regex (for the correct virtual host) to match <code>queueA</code>,
and the `read` permission regex to match <code>exchangeB</code>.

For convenience RabbitMQ maps AMQP 0-9-1's
default exchange's blank name to 'amq.default' when
performing permission checks.

The regular expression <code>'^$'</code>, i.e. matching
nothing but the empty string, covers all resources and
effectively stops the user from performing any operation.
Built-in AMQP 0-9-1 resource names are prefixed with
<code>amq.</code> and server generated names are prefixed
with <code>amq.gen</code>.

For example, <code>'^(amq\\.gen.*|amq\\.default)$'</code> gives a user access to
server-generated names and the default exchange.  The empty
string, <code>''</code> is a synonym for <code>'^$'</code>
and restricts permissions in the exact same way.

RabbitMQ may cache the results of access control checks on a
per-connection or per-channel basis. Hence changes to user
permissions may only take effect when the user reconnects.

For details of how to set up access control, please see the
[User management](#user-management) section
as well as the [rabbitmqctl man page](./man/rabbitmqctl.8).


### User Tags and Management UI Access {#user-tags}

In addition to the permissions covered above, users can have tags
associated with them. Currently only management UI access is  controlled by user tags.

The tags are managed using [rabbitmqctl](./man/rabbitmqctl.8#set_user_tags).
Newly created users do not have any tags set on them by default.

Please refer to the [management plugin guide](./management#permissions) to learn
more about what tags are supported and how they limit management UI access.


## Topic Authorisation {#topic-authorisation}

RabbitMQ supports topic authorisation for topic exchanges. The routing key of a message
published to a topic exchange is taken into account when
publishing authorisation is enforced (e.g. in RabbitMQ default authorisation backend,
the routing key is matched against a regular expression to decide whether the message can be
routed downstream or not).
Topic authorisation targets protocols like STOMP and MQTT, which are structured
around topics and use topic exchanges under the hood.

Topic authorisation is an additional layer on top of
existing checks for publishers. Publishing a
message to a topic-typed exchange will go through both the
<code>basic.publish</code> and the routing key checks.
The latter is never called if the former refuses access.

Topic authorisation can also be enforced for topic consumers.
Note that it works differently for different protocols. The concept
of topic authorisation only really makes sense for the topic-oriented protocols such as MQTT
and STOMP. In AMQP 0-9-1, for example, consumers consume from queues
and thus the standard resource permissions apply. In addition for AMQP 0-9-1,
binding routing keys between an AMQP 0-9-1 topic exchange and
a queue/exchange are checked against the topic permissions configured, if any.
For more information about how RabbitMQ handles authorisation for topics, please see
the [STOMP](./stomp) and [MQTT](./mqtt)
documentation guides.

When default authorisation backend is used, publishing to a
topic exchange or consuming from a topic is always authorised
if no topic permissions
are defined (which is the case on a fresh RabbitMQ
installation). With this authorisation backend, topic
authorisation is optional: you don't need to approve any
exchanges. To use topic authorisation therefore you need to opt in
and define topic permissions for one or more exchanges. For details please see
the [rabbitmqctl man page](./man/rabbitmqctl.8).

Internal (default) authorisation backend supports variable expansion
in permission patterns.
Three variables are supported: <code>username</code>, <code>vhost</code>,
and `client_id`. Note that `client_id` only
applies to MQTT. For example, if `tonyg` is the
connected user, the permission `^{username}-.*` is expanded to
`^tonyg-.*`

If a different authorisation backend (e.g. [LDAP](./ldap),
[HTTP](https://github.com/rabbitmq/rabbitmq-server/tree/v3.13.x/deps/rabbitmq_auth_backend_http),
[OAuth 2](./oauth2)) is used, please refer
to the documentation of those backends.

If a custom authorisation backend is used, topic
authorisation is enforced by implementing the
<code>check_topic_access</code> callback of the
<code>rabbit_authz_backend</code> behavior.


## Revoking User Access and Credential Rotation {#revoke}

### Revoking User Access

To revoke user access, the recommended procedure is [deleting the user](#user-management).
All open connections that belong to a deleted user will be closed.

It is also possible to clear user permissions but that will not affect
any currently open connections. Connections
use an authorization operation cache, so client operations
will be refused eventually. The period of time depends on the
[authorization backend](#backends) used.

### Credential Rotation

A credential rotation for credentials of users stored in the internal data store usually involves the following steps:

 * [changing user password](./man/rabbitmqctl.8#change_password) using CLI tools
    or update it using the `PUT /api/users/{user}` [HTTP API](./management) endpoint
 * Using `rabbitmqctl close_all_user_connections` or `rabbitmqctl close_all_connections` to close all existing connections
 * Making sure that applications can discover the new credentials and reconnect, for example, by restarting them

In case of a suspected credential leak, a more thorough credential rotation procedure can be employed:

 * Assessing the permissions of the user and [obtaining a complete cluster definitions file](./definitions)
 * [Delete the user](#user-management), thus revoking its access and closing all existing connections that used those credentials
 * Re-adding the user with a new generated password
 * Re-granting the user access to all the virtual hosts it had access to earlier
 * Making sure that applications can discover the new credentials and reconnect, for example, by restarting them

With external [authN backends](#backends) such as [LDAP](./ldap), user accounts are managed externally to RabbitMQ,
therefore the credential rotation routine will also be external to RabbitMQ.


## Authentication and Authorisation Backends {#backends}

Authentication and authorisation are pluggable. Plugins can provide implementations
of:

 * authentication ("authn") backends: they determine client identity and decide whether the client should be allowed to connect
 * authorisation ("authz") backends: they determine whether an identified (authenticated) client is authorized to perform a certain operation

It is possible and common for a plugin to provide both backends. RabbitMQ ships with
the following [built-in plugins](./plugins) which provide both authentication and authorisation backends:

* [LDAP](./ldap)
* [HTTP](https://github.com/rabbitmq/rabbitmq-server/tree/v3.13.x/deps/rabbitmq_auth_backend_http)

The following built-in plugins provide authorisation backend implementations:

* [OAuth2](./oauth2)

Some plugins such as [Source IP range one](https://github.com/gotthardp/rabbitmq-auth-backend-ip-range)
also only provide an authorisation backend.

Authentication is supposed to be handled by the internal database, LDAP, etc.

A special [cache backend](https://github.com/rabbitmq/rabbitmq-server/tree/v3.13.x/deps/rabbitmq_auth_backend_cache)
can be used in [combination](#combined-backends) with other backends to significantly
reduce the load they generate on external services, such as LDAP or HTTP servers.

### Combining Backends {#combined-backends}

It is possible to use multiple backends for
<code>authn</code> or <code>authz</code> using the
<code>auth_backends</code> configuration key. When
several authentication backends are used then the first
positive result returned by a backend in the chain is
considered to be final. This should not be confused with
mixed backends (for example, using LDAP for authentication and internal
backend for authorisation).

The following example configures RabbitMQ to use the internal backend
only (and is the default):

```ini
# rabbitmq.conf
#
# 1 here is a backend name. It can be anything.
# Since we only really care about backend
# ordering, we use numbers throughout this guide.
#
# "internal" is an alias for rabbit_auth_backend_internal
auth_backends.1 = internal
```

The example above uses an alias, <code>internal</code> for <code>rabbit_auth_backend_internal</code>.
The following aliases are available:

 * <code>internal</code> for <code>rabbit_auth_backend_internal</code>
 * <code>ldap</code> for <code>rabbit_auth_backend_ldap</code> (from the [LDAP plugin](./ldap))
 * <code>oauth</code> or <code>oauth2</code> for <code>rabbit_auth_backend_oauth2</code> (from the [OAuth 2.0 plugin](./oauth2))
 * <code>http</code> for <code>rabbit_auth_backend_http</code> (from the [HTTP auth backend plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_backend_http))
 * <code>dummy</code> for <code>rabbit_auth_backend_dummy</code>

For plugins that do not have a shortcut, a full module (not the name of the plugin!) must
be used:

```ini
# note that the module name begins with a "rabbit_", not "rabbitmq_", like plugin
# names usually do
auth_backends.1 = rabbit_auth_backend_ip_range
```

When using third party plugins, providing a full module name is necessary.

The following example configures RabbitMQ to use the [LDAP backend](./ldap)
for both authentication and authorisation. Internal database will not be consulted:

```ini
auth_backends.1 = ldap
```

This will check LDAP first, and then fall back to the internal
database if the user cannot be authenticated through LDAP:

```ini
auth_backends.1 = ldap
auth_backends.2 = internal
```

Same as above but will fall back to the [HTTP backend](https://github.com/rabbitmq/rabbitmq-server/tree/v3.13.x/deps/rabbitmq_auth_backend_http)
instead:

```ini
# rabbitmq.conf
#
auth_backends.1 = ldap
# uses module name instead of a short alias, "http"
auth_backends.2 = rabbit_auth_backend_http

# See HTTP backend docs for details
auth_http.user_path = http://my-authenticator-app/auth/user
auth_http.vhost_path = http://my-authenticator-app/auth/vhost
auth_http.resource_path = http://my-authenticator-app/auth/resource
auth_http.topic_path = http://my-authenticator-app/auth/topic
```

The following example configures RabbitMQ to use the internal
database for authentication and the [source IP range backend](https://github.com/gotthardp/rabbitmq-auth-backend-ip-range) for authorisation:

```ini
# rabbitmq.conf
#
auth_backends.1.authn = internal
# uses module name because this backend is from a 3rd party
auth_backends.1.authz = rabbit_auth_backend_ip_range
```

The following example configures RabbitMQ to use the [LDAP backend](./ldap)
for authentication and the internal backend for authorisation:

```ini
# rabbitmq.conf
#
auth_backends.1.authn = ldap
auth_backends.1.authz = internal
```

The example below is fairly advanced. It will check LDAP
first. If the user is found in LDAP then the password will be
checked against LDAP and subsequent authorisation checks will
be performed against the internal database (therefore users in
LDAP must exist in the internal database as well, but do not
need a password there). If the user is not found in LDAP then
a second attempt is made using only the internal database:

```ini
# rabbitmq.conf
#
auth_backends.1.authn = ldap
auth_backends.1.authz = internal
auth_backends.2       = internal
```


## Authentication Mechanisms {#mechanisms}

RabbitMQ supports multiple SASL authentication
mechanisms. There are three such mechanisms built into the
server: <code>PLAIN</code>, <code>AMQPLAIN</code>,
and <code>RABBIT-CR-DEMO</code>, and one — <code>EXTERNAL</code> —
available as a [plugin](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_mechanism_ssl).

More authentication mechanisms can be provided by plugins. See
the [plugin development guide](/plugin-development) for more information on general plugin
development.

### Built-in Authentication Mechanisms {#available-mechanisms}

The built-in mechanisms are:

<table>
  <thead>
    <td>Mechanism</td>
    <td>Description</td>
  </thead>

  <tr>
    <td>PLAIN</td>
    <td>
      SASL PLAIN authentication. This is enabled by default in
      the RabbitMQ server and clients, and is the default for most
      other clients.
    </td>
  </tr>

  <tr>
    <td>AMQPLAIN</td>
    <td>
      Non-standard version of PLAIN retained for backwards compatibility.
      This is enabled by default in the RabbitMQ server.
    </td>
  </tr>

  <tr>
    <td>EXTERNAL</td>
    <td>
      Authentication happens using an out-of-band mechanism
      such as <a href="https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_mechanism_ssl">x509 certificate peer verification</a>,
      client IP address range, or similar. Such mechanisms are usually provided by RabbitMQ plugins.
    </td>
  </tr>

  <tr>
    <td>RABBIT-CR-DEMO</td>
    <td>Non-standard mechanism which demonstrates
    challenge-response authentication. This mechanism has
    security equivalent to <code>PLAIN</code>, and
    is <strong>not</strong> enabled by default in the RabbitMQ server.</td>
  </tr>
</table>

### Mechanism Configuration in the Server {#server-mechanism-configuration}

The configuration variable <code>auth_mechanisms</code> in
the <code>rabbit</code> application determines which of the
installed mechanisms are offered to connecting clients. This
variable should be a list of atoms corresponding to
mechanism names, for example
<code>['PLAIN', 'AMQPLAIN']</code> by default. The server-side list is not
considered to be in any particular order. See the
[configuration file](./configure#configuration-files)
documentation.


### Mechanism Configuration in the Client {#client-mechanism-configuration}

Applications must opt-in to use a different authentication mechanism
such as <code>EXTERNAL</code>.

#### Mechanism Configuration in Java {#client-mechanism-configuration-java}

The Java client does not use
the <code>javax.security.sasl</code> package by default
since this can be unpredictable on non-Oracle JDKs and is
missing entirely on Android. There is a RabbitMQ-specific
SASL implementation, configured by
the <code>SaslConfig</code> interface. A
class <code>DefaultSaslConfig</code> is provided to make
SASL configuration more convenient in the common case. A
class <code>JDKSaslConfig</code> is provided to act as a
bridge to <code>javax.security.sasl</code>.

<code>ConnectionFactory.getSaslConfig()</code>
and <code>ConnectionFactory.setSaslConfig(SaslConfig)</code>
are the primary methods for interacting with authentication mechanisms.

#### Mechanism Configuration in .NET {#client-mechanism-configuration-dotnet}

The .NET client provides its own SASL mechanism
implementations based on the <code>AuthMechanism</code>
and <code>AuthMechanismFactory</code>
interfaces. The <code>ConnectionFactory.AuthMechanisms</code>
property is a list of authentication mechanism factories in
preference order.

#### Mechanism Configuration in Erlang {#client-mechanism-configuration-erlang}

The Erlang client provides its own SASL mechanism
implementations in the <code>amqp_auth_mechanisms</code>
module. The <code>#amqp_params{}</code> record can be
provided with a list of authentication functions in
preference order for network connections.


## Troubleshooting Authentication {#troubleshooting-authn}

This section covers several very common problems related to authentication.
For authorization (permission) errors, see [another section below](#troubleshooting-authz).

:::tip
Inspecting [server logs](./logging) is crucially important when investigating authentication-related
issues.
:::

### Incorrect Permissions

A failed authentication attempt, that is, when incorrect credentials were specified by the client,
will result in [a server log message](./logging) that looks like this:

```ini
2019-03-25 12:28:19.047 [info] <0.1613.0> accepting AMQP connection <0.1613.0> (127.0.0.1:63839 -> 127.0.0.1:5672)
2019-03-25 12:28:19.056 [error] <0.1613.0> Error on AMQP connection <0.1613.0> (127.0.0.1:63839 -> 127.0.0.1:5672, state: starting):
PLAIN login refused: user 'user2' - invalid credentials
2019-03-25 12:28:22.057 [info] <0.1613.0> closing AMQP connection <0.1613.0> (127.0.0.1:63839 -> 127.0.0.1:5672)
```

Authentication failures on connections that [authenticate using X.509 certificates](#authentication)
will be logged differently. See [TLS Troubleshooting guide](./troubleshooting-ssl) for details.

[rabbitmqctl authenticate_user](./cli) can be used to test authentication
for a username and password pair:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl authenticate_user "a-username" "a/password"
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
# note that double quotes are required due to the & character
rabbitmqctl.bat authenticate_user 'a-username' '"a/p&assword"'
```
</TabItem>
</Tabs>

If authentication succeeds, it will exit with the code of zero. In case of a failure,
a non-zero exit code will be used and a failure error message will be printed.

<code>rabbitmqctl authenticate_user</code> will use a CLI-to-node communication connection to attempt to authenticate
the username/password pair against an internal API endpoint.
The connection is assumed to be trusted. If that's not the case, its traffic can be [encrypted using TLS](./clustering-ssl).

### Default User's Connection From Remote Hosts are Refused

:::danger
[Default user cannot connect from remote hosts](#loopback-users) for a reason. Enabling such
connections can dramatically decrease the security of the cluster. Consider creating
a [unique user with generated credentials](#user-management) for all production clusters.
:::

If credentials are reported as correct, connections from localhost succeed but remote connections
fail, the issue is [default user connectivity limitations](#loopback-users).

In this case, the error will look like this:

```
2024-08-24 17:28:32.153698-04:00 [error] <0.1567.0> PLAIN login refused: user 'guest' can only connect via localhost
```

A separate user with generated credentials must be [created](#user-management) for clients (including [shovels](./shovel)
and [federation links](./federation)) connecting from remote hosts.

### Authentication Failure Notifications in AMQP 0-9-1

Per AMQP 0-9-1 spec, authentication failures should result
in the server closing TCP connection immediately. However,
with RabbitMQ clients can opt in to receive a more specific
notification using the [authentication failure notification](./auth-notification) extension to AMQP 0-9-1. Modern client libraries
support that extension transparently to the user: no configuration would be necessary and
authentication failures will result in a visible returned error, exception or other way of communicating
a problem used in a particular programming language or environment.


## Troubleshooting Authorisation {#troubleshooting-authz}

:::tip
Inspecting [server logs](./logging) is crucially important when investigating authorization-related
issues.
:::

### Missing Permissions

The most common scenario with authorization failures is when a user was
created but not [granted permissions](#grant-permissions) for the virtual host the client
tries to connect to.

In this case, the connection will be refused with a message that looks like this:


```ini
2019-03-25 12:26:16.301 [info] <0.1594.0> accepting AMQP connection <0.1594.0> (127.0.0.1:63793 -> 127.0.0.1:5672)
2019-03-25 12:26:16.309 [error] <0.1594.0> Error on AMQP connection <0.1594.0> (127.0.0.1:63793 -> 127.0.0.1:5672, user: 'user2', state: opening):
access to vhost '/' refused for user 'user2'
2019-03-25 12:26:16.310 [info] <0.1594.0> closing AMQP connection <0.1594.0> (127.0.0.1:63793 -> 127.0.0.1:5672, vhost: 'none', user: 'user2')
```

### Insufficient Permissions

Another very common scenario is that the permissions are defined but they are
[insufficient for the operations that the client tries to perform](#authorisation).

In this case the connection will be accepted

[rabbitmqctl list_permissions](./cli) can be used to inspect a user's
permission in a given virtual host:

<Tabs groupId="shell-specific">
<TabItem value="bash" label="bash" default>
```bash
rabbitmqctl list_permissions --vhost /
# => Listing permissions for vhost "/" ...
# => user	configure	write	read
# => user2	.*	.*	.*
# => guest	.*	.*	.*
# => temp-user	.*	.*	.*

rabbitmqctl list_permissions --vhost gw1
# => Listing permissions for vhost "gw1" ...
# => user	configure	write	read
# => guest	.*	.*	.*
# => user2	^user2	^user2	^user2
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
rabbitmqctl.bat list_permissions --vhost /
rabbitmqctl.bat list_permissions --vhost gw1
```
</TabItem>
</Tabs>

Authorisation failures (permission violations) are logged with the following messages:

```ini
2019-03-25 12:30:05.209 [error] <0.1627.0> Channel error on connection <0.1618.0> (127.0.0.1:63881 -> 127.0.0.1:5672, vhost: 'gw1', user: 'user2'), channel 1:
operation queue.declare caused a channel exception access_refused: access to queue 'user3.q1' in vhost 'gw1' refused for user 'user2'
```
