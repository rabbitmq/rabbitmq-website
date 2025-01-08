---
title: LDAP Support
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

# LDAP Support

## Overview {#overview}

RabbitMQ can use LDAP to perform [authentication and authorisation](./access-control) by deferring to external LDAP
servers. This functionality is provided by a built-in plugin that [has to be enabled](#enabling-the-plugin).

Authentication and authorisation operations are translated into [LDAP queries](#authorisation) using
templates configured by the RabbitMQ operator.

LDAP queries can be [cached](#query-caching) for a period of time for efficiency and reduced
load on LDAP servers.

[LDAP Operation Flow](#ldap-operation-flow) section
provides a more detailed overview of how the plugin works.

The plugin primarily targets OpenLDAP and Microsoft Active Directory. Other
LDAP v3 implementations should work reasonably well.

This guide provides a very brief overview of LDAP terms but generally
assumes basic familiarity with LDAP. Several beginner-oriented
LDAP primers are available elsewhere on the Web, for example, [one](https://www.digitalocean.com/community/tutorials/understanding-the-ldap-protocol-data-hierarchy-and-entry-components),
[two](https://www.ldap.com/basic-ldap-concepts), and the [LDAP glossary](https://www.ldap.com/glossary-of-ldap-terms).

This guide covers the [LDAP operation flow](#ldap-operation-flow) used by RabbitMQ, how the LDAP model
[maps to the RabbitMQ permission model](#authorisation), how to [use TLS to connect to LDAP servers](#tls),
and what tools are available for [troubleshooting](#troubleshooting) and [proxying](#proxies) of LDAP requests.

## Prerequisites {#prerequisites}

RabbitMQ LDAP plugin depends on an LDAP client called `eldap`. The library
ships with [Erlang/OTP](./which-erlang). On some operating systems, Erlang
is provided as a group of packages instead of one monolithic package, so
components such as `eldap` **must be installed separately** from the main runtime.

On Debian and Ubuntu, `eldap` is provided by the `erlang-eldap` package:

```bash
sudo apt-get install -y erlang-eldap
```

LDAP support **cannot** be used on Erlang installations where the library is not available.

Please see the [Erlang compatibility guide](./which-erlang) to learn more.


## Enabling the Plugin {#enabling-the-plugin}

The LDAP plugin ships with RabbitMQ. To enable it, use
[rabbitmq-plugins](./man/rabbitmq-plugins.8):
```bash
rabbitmq-plugins enable rabbitmq_auth_backend_ldap
```


## Enabling LDAP AuthN and AuthZ backends {#essential-configuration}

After enabling the plugin it is necessary to configure the node to use it.

This involves

 * Listing LDAP as an [authentication (authN) and/or authorization (authZ) backend](./access-control)
 * Configuring [LDAP server endpoints](#connectivity)
 * Specifying what [LDAP queries](#query-types) will be used for various authZ permission checks

The following example will configure RabbitMQ to **only** use LDAP for authentication and authorisation,
and ignore the internal database:

```ini
# use LDAP exclusively for authentication and authorisation
auth_backends.1 = ldap
```

In [`advanced.config` file](./configure#erlang-term-config-file), the same settings would look like this:

```erlang
{rabbit, [
  {auth_backends, [rabbit_auth_backend_ldap]}
]}
```

The following example will instruct the node to try LDAP first and then fall back to the internal
database if the user cannot be authenticated through LDAP:

```ini
# try LDAP first
auth_backends.1 = ldap
# fall back to the internal database
auth_backends.2 = internal
```

Same example in the [`advanced.config` format](./configure#erlang-term-config-file):

```erlang
{rabbit,[
  {auth_backends, [rabbit_auth_backend_ldap, rabbit_auth_backend_internal]}
]}
```

In the following example, LDAP will be used for authentication first.
If the user is found in LDAP then the password will be checked against LDAP and
subsequent authorisation checks will be performed against the internal database (therefore
users in LDAP must exist in the internal database as well, optionally with a blank password).
If the user is not found in LDAP then a second
attempt is made using only the internal database.

```ini
# use LDAP for authentication first
auth_backends.1.authn = ldap
# use internal database for authorisation
auth_backends.1.authz = internal
# fall back to the internal database
auth_backends.2 = internal
```

In the [advanced config format](./configure#erlang-term-config-file):

```erlang
{rabbit,[{auth_backends, [{rabbit_auth_backend_ldap, rabbit_auth_backend_internal},
                           rabbit_auth_backend_internal]}]}
```

## Configuration {#basic}

Once the plugin is enabled and its backends are wired in, a number of LDAP-specific
settings must be configured. They include a list of LDAP servers, authentication and
authorisation settings, and more.

The default configuration allows all users to access all objects in
all vhosts, but does not make them administrators. Restricting access is possible
by configuring LDAP queries.

### LDAP Servers {#connectivity}

For the plugin to be able to connect to a LDAP server, at least one server hostname or IP address must be configured
using the `auth_ldap.servers` key. If multiple values are provided,
List values can be hostnames or IP addresses. This value must be configured. The following
example configures the plugin to use two LDAP servers. They will be tried
in order until connection to one of them succeeds:

```ini
auth_ldap.servers.1 = ldap.eng.megacorp.local
auth_ldap.servers.2 = 192.168.0.100
```

The same examples using the classic config format:

```erlang
[
  {rabbitmq_auth_backend_ldap, [
    {servers, ["ldap.eng.megacorp.local", "192.168.0.100"]}
  ]}
].
```

LDAP servers typically use port `389` and that's the port the
LDAP plugin will use by default. `auth_ldap.port` can be used
to override this:

```ini
auth_ldap.servers.1 = ldap.eng.megacorp.local
auth_ldap.servers.2 = 192.168.0.100

auth_ldap.port      = 6389
```

The same examples using the classic config format:

```erlang
[
  {rabbitmq_auth_backend_ldap, [
    {servers, ["ldap.eng.megacorp.local", "192.168.0.100"]},
    {port,    6389}
  ]}
].
```

TCP connections to LDAP servers can be given a timeout using the `auth_ldap.timeout`
configuration key:

```ini
auth_ldap.servers.1 = ldap.eng.megacorp.local
auth_ldap.servers.2 = 192.168.0.100

# 15 seconds in milliseconds
auth_ldap.timeout   = 15000
```

The default is `infinity`, or no timeout.

LDAP server connections are pooled to avoid excessive connection churn and LDAP server
load. By default the pool has up to 64 connections. This can be controlled using the
`auth_ldap.connection_pool_size` setting:

```ini
auth_ldap.servers.1 = ldap.eng.megacorp.local
auth_ldap.servers.2 = 192.168.0.100

auth_ldap.connection_pool_size = 256
```

Pooled connections without activity are closed after a period of time
configurable via `auth_ldap.idle_timeout`, in milliseconds
or `infinity`:

```ini
auth_ldap.servers.1 = ldap.eng.megacorp.local
auth_ldap.servers.2 = 192.168.0.100

auth_ldap.connection_pool_size = 256
# 300 seconds in milliseconds
auth_ldap.idle_timeout = 300000
```

Values between 120 and 300 seconds are recommended.


## Using TLS for LDAP Connections {#tls}

:::important

Starting with Erlang 26, [TLS client peer verification](./ssl#peer-verification) is enabled by default by the TLS implementation.

If client TLS certificate and key pair is not configured, TLS-enabled LDAP server connections
will fail. If peer verification is not necessary, it can be disabled, otherwise a certificate and private key
pair must be configured for LDAP connections.

:::

It is possible to connect to LDAP servers using TLS. To instruct the
plugin to do so, set the `auth_ldap.use_ssl` setting to `true`.
If StartTLS is used by the LDAP server, use `auth_ldap.use_starttls` instead.
Note that those settings are mutually exclusive (cannot be combined).
Both values default to `false`.

Client side TLS settings are configured using `ssl_options`, which
are very similar to [TLS settings elsewhere in RabbitMQ](./ssl).

Here is a minimalistic example:

```ini
auth_ldap.servers.1 = ldap.eng.megacorp.local
auth_ldap.servers.2 = 192.168.0.100

# enables TLS for connections to the LDAP server
auth_ldap.use_ssl   = true

# Disables peer certificate chain verification. See the section on Peer Verification
# below.
#
# Doing so loses one of the key benefits of TLS and make the setup less secure
# but also simplifies node configuration.
auth_ldap.ssl_options.verify = verify_none
```

The plugin can also connect using [StartTLS](https://fy.blackhats.net.au/blog/2021-08-12-starttls-in-ldap/).
This less older and secure option is **not recommended** but may be necessary with older LDAP servers:

```ini
auth_ldap.servers.1 = ldap.eng.megacorp.local
auth_ldap.servers.2 = 192.168.0.100

# Enables StartTLS for connections to the LDAP server.
# Prefer auth_ldap.use_ssl with reasonably modern LDAP servers!
auth_ldap.use_starttls   = true

# Disables peer certificate chain verification. See the section on Peer Verification
# below.
#
# Doing so loses one of the key benefits of TLS and make the setup less secure
# but also simplifies node configuration.
auth_ldap.ssl_options.verify = verify_none
```

### Client TLS Options Available for LDAP

There are multiple [TLS](./ssl) client options available:

#### CA Certificate(s), Clint Certificate and Private Key

```ini
# local filesystem path to a CA certificate bundle file
auth_ldap.ssl_options.cacertfile = /path/to/ca_certificate.pem

# local filesystem path to a client certificate file
auth_ldap.ssl_options.certfile = /path/to/client_certfile.pem

# local filesystem path to a client private key file
auth_ldap.ssl_options.keyfile = /path/to/client_key.pem
```

#### SNI (Server Name Indication)

[Server Name Indication](https://www.cloudflare.com/en-gb/learning/ssl/what-is-sni/) (SNI) can be configured
for outgoing TLS connections to LDAP servers. When not set, the default will be the hostname used
for connection (see `auth_ldap.servers.*` above).

```ini
# Sets Server Name Indication for LDAP connections.
# If an LDAP server host is availble via multiple domain names, set this value
# to the preferred domain name target LDAP server
auth_ldap.ssl_options.sni = ldap.identity.eng.megacorp.local
```

#### Hostname Verification

Hostname verification should not be confused with [peer certificate chain verification](./ssl#peer-verification).
These settings are orthogonal and can be combined.

```ini
# take wildcards into account when performing hostname verification
auth_ldap.ssl_options.hostname_verification = wildcard
```

```ini
# disables hostname verification
auth_ldap.ssl_options.hostname_verification = none
```

#### Peer Verification

Starting with Erlang 26, LDAP TLS clients will perform [peer certificate chain verification](./ssl#peer-verification)
by default.

[Peer certificate chain verification](./ssl#peer-verification) should not be confused with hostname match verification.
These settings are orthogonal and can be combined.

```ini
# Enables peer certificate chain verification.
# This behavior is the default starting with Erlang 26 (and thus RabbitMQ 3.13+)/
auth_ldap.ssl_options.verify = verify_peer
```

```ini
# Disables peer certificate chain verification.
#
# Doing so loses one of the key benefits of TLS and make the setup less secure
# but also simplifies node configuration.
auth_ldap.ssl_options.verify = verify_none
```

```ini
# if target LDAP server does not present a certificate, should the connection be aborted?
auth_ldap.ssl_options.fail_if_no_peer_cert = true
```

#### Peer Chain Verification Depth

[Certificate chain verification depth](./ssl#peer-verification-depth) can be increased
for servers that use multiple intermediary certificates:

```ini
auth_ldap.ssl_options.depth = 5
```

#### TLS Versions Enabled

```ini
# use TLSv1.2 only
ssl_options.versions.1 = tlsv1.2
```

### TLS Options in `advanced.config`

The below example uses an [`advanced.config` format](./configure#advanced-config-file):

```erlang
[
  {rabbitmq_auth_backend_ldap, [
     {servers, ["ldap1.eng.megacorp.local", "ldap2.eng.megacorp.local"]},

     {use_ssl,     true},
     {ssl_options, [{cacertfile, "/path/to/ca_certificate.pem"},
                    {certfile,   "/path/to/server_certificate.pem"},
                    {keyfile,    "/path/to/server_key.pem"},
                    {verify,               verify_peer},
                    {fail_if_no_peer_cert, true}]},
                    {server_name_indication, "ldap.identity.eng.megacorp.local"},
                    {ssl_hostname_verification, wildcard}
   ]}
].
```


## LDAP Query Caching for Efficiency and Reduced Load {#query-caching}

A special [cache backend](https://github.com/rabbitmq/rabbitmq-server/tree/v3.13.x/deps/rabbitmq_auth_backend_cache)
can be used in [combination](./access-control#combined-backends) with other backends to significantly
reduce the load they generate on LDAP servers.

It is recommended that production clusters that rely on LDAP for authentication and authorization
use it in combination with the caching backend. Caching intervals in the range of 15 to 60 seconds
strike a good security and efficiency balance for most systems.


## LDAP Essentials and Terminology {#ldap-essentials-and-terminology}

This section covers some basic LDAP terminology used in this document. For an LDAP primer, please
refer to [this overview](https://www.digitalocean.com/community/tutorials/understanding-the-ldap-protocol-data-hierarchy-and-entry-components) by Digital Ocean and the [LDAP glossary](https://www.ldap.com/glossary-of-ldap-terms) from ldap.com.

<table>
  <thead>
    <th>Term</th>
    <th>Description</th>
  </thead>
  <tr>
    <td>Bind</td>
    <td>LDAP speak for "authentication request".</td>
  </tr>
  <tr>
    <td>Distinguished Name (DN)</td>
    <td>
      A distinguished name is a unique key in an LDAP directory (tree) that identifies an object
      (like a user or a group). The plugin will translate a client-provided username into a
      distinguished name during the authentication stage (see below). One way to think of
      a DN is an absolute file path in a filesystem.
    </td>
  </tr>
  <tr>
    <td>Common Name (CN)</td>
    <td>
      A short identifier of an object in the tree. This identifier will vary between
      object classes (types) in the LDAP database. For example, a person's common name
      will be the full name. A group's common name would be the name of that group.
      One way to think of a CN is a file name in a filesystem.
    </td>
  </tr>
  <tr>
    <td>Attribute</td>
    <td>
      A property of an object (a key-value pair). Think of it as a field of an object in
      an object-oriented programming language.
    </td>
  </tr>
  <tr>
    <td>Object Class</td>
    <td>
      A set of predefined attributes. Think of it as a type (class) in an object-oriented language.
    </td>
  </tr>

  <tr>
    <td>Entry</td>
    <td>
      An LDAP database entity, for example, a person or a
      group. It has an object class associated with it and
      one or more attributes, including a common name.
      Since the entity is located somewhere in the LDAP
      database tree it also must have a distinguished name
      which uniquely identifies it. Entries is what LDAP
      plugin queries use (look up, check for membership,
      compare attributes of and so on). An LDAP database
      must have some entries (typically users, groups) in
      order to be practically useful for RabbitMQ
      authentication and authorisation.
    </td>
  </tr>
</table>

### LDAP Operation Flow {#ldap-operation-flow}

In order to execute an LDAP query the plugin will open a connection to the first
LDAP server on the list which is reachable. Then, depending on the credential
configuration it will perform an anonymous bind or a "[simple bind](https://msdn.microsoft.com/en-us/library/cc223499.aspx)"
(authenticate the user with the LDAP server using a username/password pair).
The credentials used to perform the bind can be derived from the client-provided username
as explained in the following section.

If vhost access query is configured it will be executed next, otherwise vhost access
is granted unconditionally.

At this point the connection can be considered successfully negotiated and established.
It should be possible to open a channel on it, for example. All further operations
performed on the connection will execute one of the authorisation queries. For example,
declaring a queue will execute a resource access query (covered below). Publishing a
message to a topic exchange will additionally execute a topic access query. Please refer
to the [Access Control guide](./access-control) to learn more.

### Usernames and Distinguished Names {#usernames-and-dns}

During the simple bind phase, the `user_dn_pattern` pattern is used to translate
the provided username into a value to be used for the bind. By default, the pattern
passes the provided value as-is (i.e. the pattern is `${username}`). If
`user_bind_pattern` is specified, it takes precedence over
`user_dn_pattern`. This can be handy if a different `user_dn_pattern`
needs to be used during the distinguished name lookup phase. Note that the above does
not apply to anonymous binds, nor when `dn_lookup_bind` is not set to
`as_user`.

Client connections provide usernames which are translated into Distinguished
Names (DNs) in LDAP.
There are two ways to do that. The simplest way is via string substitution
with `user_dn_pattern`. To use this option, set
`user_dn_pattern` to a string containing exactly one
instance of `${username}`, a variable that will be
substituted for the username value provided by the client.

For example, setting user_dn_pattern to
`"cn=${username},ou=People,dc=example,dc=com"`
would cause the username `simon` to be converted to the
DN `cn=simon,ou=People,dc=example,dc=com`. Default value is
`"${username}"`, in other words, the username is used verbatim.

The other way to convert a username to a Distinguished
Name is via an LDAP lookup. To do this, set
`auth_ldap.dn_lookup_attribute` to the name of the
attribute that represents the user name, and
`auth_ldap.dn_lookup_base` to the base DN for the
query. The lookup can be done at one of two times, either
before attempting to bind as the user in question, or
afterwards.

To do the lookup after binding, leave
`auth_ldap.dn_lookup_bind` set to its default
of `as_user`. The LDAP plugin will then bind
with the user's plain (unmodified) username to do the login, then
look up its DN. In order for this to work the LDAP server
needs to be configured to allow binding with the plain
username (Microsoft Active Directory typically does this).

To do the lookup before binding, set `dn_lookup_bind`, `dn_lookup_base` and
`dn_lookup_attribute` as follows. The LDAP plugin will then bind with these
credentials first to do the lookup, then bind with the user's DN and password
to do the login.

```ini
auth_ldap.dn_lookup_bind.user_dn = CN=myuser,OU=users,DC=gopivotal,DC=com
auth_ldap.dn_lookup_bind.password = test1234
auth_ldap.dn_lookup_attribute = userPrincipalName
auth_ldap.dn_lookup_base = DC=gopivotal,DC=com
```

Consider the following example:

```ini
auth_ldap.dn_lookup_attribute = userPrincipalName
auth_ldap.dn_lookup_base = DC=gopivotal,DC=com
```

With this configuration it is possible to authenticate using an email address
(`userPrincipalName` values are typically email addresses)
and have the local Active Directory server return an actual DN to do
the login.

If both `auth_ldap.dn_lookup_attribute`
and `auth_ldap.user_dn_pattern` are set then the approaches are
combined: the plugin fills out the template and then
searches for the DN.

`auth_ldap.dn_lookup_bind`'s default value is `as_user`.
For `auth_ldap.dn_lookup_base` and `auth_ldap.dn_lookup_attribute`
it is `none`.

### LDAP Activity Logging {#logging}

The plugin makes it possible to control the verbosity of LDAP activity
logging using the `auth_ldap.log`
(`rabbitmq_auth_backend_ldap.log` in the classic config format) setting.
This is essential for troubleshooting.

Setting the value to `true` will enable verbose logging of the logic used by
the LDAP plugin to make decisions. Credentials in bind request outcomes will be
scrubbed in this mode. This mode is not recommended for production systems
but occasionally can be useful.

The value of `network` works similarly to the above but  <b>additionally</b> causes LDAP
network traffic to be logged at a lower (LDAP client) level, with bind
request credentials scrubbed. This setting can result in excessive logging and should be
used with great care.

The value of `network_unsafe` causes LDAP network traffic to
be logged at a lower (LDAP client) level, with bind request credentials such as
passwords, written to the logs; this mode must not be used in production and will violate
nearly every widely adopted security policy.
It can, however, be very useful for troubleshooting in development
and QA environments.

Lastly, the value of `false` (the default) deactivates LDAP traffic logging.

The following examples sets LDAP logging level to `network`:

```ini
auth_ldap.log = network
```

The same examples in the classic config format:

```ini
[
  {rabbitmq_auth_backend_ldap, [
    %% ...
    {log, network}
  ]}
]
```

### Binding for Authorisation Queries {#other-bind}

For authentication this plugin binds to the LDAP server as the
user it is trying to authenticate. The `other_bind` setting controls how to
bind for authorisation queries, and to retrieve the details of a
user who is logging in without presenting a password (e.g. using the
[EXTERNAL authentication mechanism](./authentication)).

The accepted values are `as_user` (to bind as the authenticated
user) or `anon` (to bind anonymously), or be presented by two
options `other_bind.user_dn` and `other_bind.password`
to bind with a specified username and password. For example:

```ini
auth_ldap.other_bind.user_dn = a-username
auth_ldap.other_bind.password = a-password
```

Using the classic config format:

```erlang
[
  {rabbitmq_auth_backend_ldap, [
    {other_bind, {"a-username", "a-password"}}
  ]}
].
```

Note that it is not possible to use the
default `as_user` configuration when users connect
without providing a password. In that case, use
`auth_ldap.other_bind.user_dn` and `auth_ldap.other_bind.password`
or the `anon` option.

Default value of `auth_ldap.other_bind` is `as_user`.

### Group Membership Lookup {#group-lookups}

The plugin supports several group membership lookup queries.
The `group_lookup_base` setting controls what base DN will be used to search for nested groups. It is used by
the `{in_group_nested, ...}` query only. For more info see the [section on queries](#query-reference).

In the following example `ou=groups,dc=example,dc=com` is the directory that contains all groups.
Note that it uses the [classic config format](./configure):

```erlang
[
  {rabbitmq_auth_backend_ldap, [
    %% ...
    {group_lookup_base, "ou=groups,dc=example,dc=com"}
  ]}
]
```

Default value is `'none'`.

## Configuring Authorisation {#authorisation}

### How RabbitMQ Permission Model Maps to LDAP {#authorisation-overview}

RabbitMQ [permission model](./access-control)
is different from that of LDAP. In addition, the way LDAP
schemas are used will vary from company to
company. Therefore a mechanism that defines what LDAP
requests are used by the RabbitMQ authorisation functions is
needed. Authorisation is controlled by four configurable queries:

 * `rabbitmq_auth_backend_ldap.vhost_access_query`
 * `rabbitmq_auth_backend_ldap.resource_access_query`
 * `rabbitmq_auth_backend_ldap.topic_access_query`
 * `rabbitmq_auth_backend_ldap.tag_queries`

Each defines a query that will determine whether a user has
access to a vhost, whether they have access to a resource
(e.g. exchange, queue, binding) and
which [tags](./management#permissions) they
have.

Note the longer `rabbitmq_auth_backend_ldap` prefix.
Queries are expressed using a domain-specific language expressed in Erlang terms (data structures),
so they can be defined only using the
[classic config format](./configure#erlang-term-config-file). Starting with RabbitMQ 3.7
query definitions are commonly placed into the [advanced.config file](./configure#advanced-config-file).

### Queries and Their Types {#query-types}

Each query mentioned above is used at a different authorisation stage and must
evaluate to either `true` or false. Specific query types (expressions,
e.g. value comparison or group membership check) are covered later
in this guide.

A query can be of one of several types. Each type represents a boolean expression or function:
a comparison, string match, object existence check, group membership check, and so on.
Queries can be nested and combined using boolean operators.

The default values (expressions) can be found in the table below:

<table>
  <thead>
    <td>Query</td>
    <td>Purpose</td>
    <td>Default Expression</td>
  </thead>
  <tr>
    <td>`rabbitmq_auth_backend_ldap.vhost_access_query`</td>
    <td>Verifies that user is allowed to access a virtual host</td>
    <td>`{constant, true}`</td>
  </tr>
  <tr>
    <td>`rabbitmq_auth_backend_ldap.resource_access_query`</td>
    <td>Verifies that user is allowed to access a resource (queue, exchange, etc)</td>
    <td>`{constant, true}`</td>
  </tr>
  <tr>
    <td>`rabbitmq_auth_backend_ldap.topic_access_query`</td>
    <td>Verifies that user is allowed to publish to a topic</td>
    <td>`{constant, true}`</td>
  </tr>
  <tr>
    <td>`rabbitmq_auth_backend_ldap.tag_queries`</td>
    <td>Checks if a well-known tag is applicable to a user</td>
    <td>`[{administrator, {constant, false}}]`</td>
  </tr>
</table>

This means that all users are granted access to all objects in all
vhosts but they are not system administrators.

All of the query types which take strings for arguments support string
substitution, where variables pertaining to the query being
made can be substituted in. Each of the queries supports
different variables.

The `vhost_access_query` supports:

 * `${username}`: the user name provided at authentication
 * `${user_dn}`: the distinguished name of the user
 * `${vhost}`: the virtual host for which we are querying access

The `resource_access_query` supports:

 * `${username}`: the user name provided at authentication
 * `${user_dn}`: the distinguished name of the user
 * `${vhost}`: the virtual host in which the resource resides
 * `${resource}`: one of "exchange" or "queue" for the type of resource
 * `${name}`: the name of the resource
 * `${permission}`: one of "configure", "write" or "read" for the type of access being requested to the resource

The `tag_queries` supports:

 * `${username}`: the user name provided at authentication
 * `${user_dn}`: the distinguished name of the user
 * `${vhost}`: **virtual host information will not be available in every scenario**. It can be used for additional context,
    e.g. to group applications or users

The `topic_access_query` supports:

 * `${username}`: the user name provided at authentication
 * `${user_dn}`: the distinguished name of the user
 * `${vhost}`: the virtual host in which the resource resides
 * `${resource}`: always "topic" in this case
 * `${name}`: the name of the resource
 * `${permission}`: one of "write" (publishing) or "read" (consuming, queue and
   exchange-to-exchange binding for topic exchanges)
 * `${routing_key}`: the routing key of the published message ("write" permission)
   or routing key of the topic exchange to queue/exchange binding ("read" permission)

Finally, if the user name provided at authentication is in the form
`Domain\User` (which is the case in some Active Directory environments),
two <i>additional</i> variables will be made available for each of the above queries:

 * `${ad_domain}` - the domain part of `Domain\User`
 * `${ad_user}` - the user part of `Domain\User`

The terms configure, write and read for resource access have the
same meanings that they do for the built-in RabbitMQ permissions
system, see ./access-control. See
also [topic authorisation](./access-control#topic-authorisation)
for `topic_access_query`.

When first getting familiar with the query DSL, it can be
helpful to switch on the `log` configuration
parameter documented above. This will cause the LDAP plugin
to write fairly verbose descriptions of the queries it
executes and the decisions it therefore makes to the
RabbitMQ log.

### Virtual Host Access {#authorisation-vhost-access}

`rabbitmq_auth_backend_ldap.vhost_access_query`
is the query used to control virtual host
access. If the query evaluates to `true` then access
is granted.

Note that before a user can access a virtual host, the
virtualhost must have been created within RabbitMQ; unlike
users and permissions, virtual hosts cannot live entirely
within LDAP.

### User Tags {#authorisation-tag-query}

The `tag_queries` consists of a key-value map
mapping the name of a tag to a query to perform to determine
whether or not the user has that tag. It is necessary to
list list queries for all tags that the users should to
have.


## Authorisation Query Reference {#query-reference}

### Constant Query {#constant-query}

```erlang
{constant, Bool}
```

This will always return either true or false, unconditionally granting
or denying access. Example:

```erlang
{tag_queries, [{administrator, {constant, false}},
 {management,    {constant, true}}]}
```

This grants all users the ability to use the management
plugin, but makes none of them administrators.

### Exists Query {#exists-query}

```erlang
{exists, Pattern}
```

This will substitute variables into the pattern, and return true if
there exists an object with the resulting DN. Example:

```erlang
{vhost_access_query, {exists, "ou=${vhost},ou=vhosts,dc=example,dc=com"}}
```

This grants access to all virtual hosts which exist as
organisational units
within `ou=vhosts,dc=example,dc=com` to all
users.

### In Group Query {#in-group-query}

```erlang
{in_group, Pattern}
```
```erlang
{in_group, Pattern, AttributeName}
```

Like the Exists Query, substitutes arguments into a pattern to look
for an object. However, this query returns true if the logged in
user is a member; checking either against the `member`
attribute, or any named attribute. Example:

```erlang
{vhost_access_query, {in_group, "cn=${vhost}-users,ou=vhosts,dc=example,dc=com"}}
```

This grants access to virtual hosts when the user is listed
as a `member` attribute of an appropriately named
object (such as a `groupOfNames`)
within `ou=vhosts,dc=example,dc=com`.

### In Nested Group Query {#in-nested-group-query}

```erlang
{in_group_nested, Pattern}
```
```erlang
{in_group_nested, Pattern, AttributeName}
```
```erlang
{in_group_nested, Pattern, AttributeName, Scope}
```

Similar to the `in_group` query but also traverses group hierarchy,
e.g. if the logged in user is a member of the group which is a member of
another group. Membership is checked against the `member`
attribute or any named attribute.
Groups are searched in the DN defined by the `group_lookup_base`
configuration key, or the `dn_lookup_base` variable if
former is `none`. If both lookup base variables are set to
`none` the query will always return `false`.
Search scope can be set to either `subtree` or `single_level`.

 * `subtree` searches all objects contained under the lookup base
 * `single_level` searches for groups directly contained within the lookup base

Default value for scope is `subtree` The query is
using in-depth search up from user to target group.  Search
process will detect and skip cyclic paths.  This query can
be time and memory consuming if users are members of many
groups, which are members of many groups as well. Use this
query when groups for a membership hierarchy. It is still
recommended to use plain `{in_group, ...}` query
when possible: nested groups can be challenging to reason
about. Example:

```erlang
[
  {group_lookup_base, "ou=groups,dc=example,dc=com"},
  {vhost_access_query, {in_group_nested, "cn=${vhost}-groups,ou=groups,dc=example,dc=com"}, "member", single_level}
]
```

This grants access to virtual hosts when the user a member in group
hierarchy defined by the `member` attribute values and located
in the `ou=groups,dc=example,dc=com` directory.

### For Query {#for-query}

```erlang
{for, [{Name, Value, SubQuery}, ...]}
```

This allows you to split up a query and handle different cases with
different subqueries.

Options should be a list of three-tuples, with each tuple containing
a name, value and subquery. The name is the name of a variable
(i.e. something that would go into a `${}`
substitution). The value is a possible value for that variable.

Note that the values are of different Erlang types;
`resource` and `permission` have atom
values (e.g. `resource` could be
`exchange`) while the other keys have binary
values (e.g. `name` might be
`<<"amq.fanout">>`).

Example:

```erlang
{resource_access_query,
 {for, [{resource, exchange, {for, [{permission, configure,
                                     {in_group, "cn=wheel,dc=example,dc=com"}
                                    },
                                    {permission, write, {constant, true}},
                                    {permission, read,  {constant, true}}
                                   ]}},
                                   {resource, queue,    {constant, true}}]}}
```

This allows members of the `wheel` group to declare and
delete exchanges, and allow all users to do everything else.

### Boolean Queries {#boolean-query}

```erlang
{'not', SubQuery}
```
```erlang
{'and', [SubQuery1, SubQuery2, SubQuery3, ...]}
```
```erlang
{'or', [SubQuery1, SubQuery2, SubQuery3, ...]}
```

These can be used to combine subqueries with boolean logic. The
'and' and 'or' queries each take an arbitrarily long list of
subqueries, returning true if all or any subqueries evaluate to true
respectively.

Note that 'and', 'or' and 'not' are reserved words in Erlang,
therefore the keywords need to be quoted with single quotes in the
configuration file, as above. Example:

```erlang{resource_access_query,
 {'or',
  [{'and',
    [{equals, "${name}", "test1"},
     {equals, "${username}", "user1"}]},
   {'and',
    [{equals, "${name}", "test2"},
     {'not', {equals, "${username}", "user1"}}]}
  ]}}
```

This example gives full access to objects called "test1" to "user1",
and access to "test2" to everyone but "user1".

### Equals Query {#equals-query}

```erlang
{equals, StringSubQuery1, StringSubQuery2}
```

Takes two strings, and checks that the one matches the
other. Note that both strings are subqueries (of the
`string` and `attribute` types below)
in turn.

This can be useful in order to compare the value of one of
the string substitution variables with a constant, or with
an attribute value, etc. Example:

```erlang
{resource_access_query,
 {for, [{permission, configure, {equals, {attribute, "${user_dn}", "description"},
                                         {string, "can-declare-${resource}s"}
                                }
        },
        {permission, write, {constant, true}},
        {permission, read,  {constant, true}}
       ]
}
```

This grants permissions to declare and delete exchanges and
queues based on the presence of the strings
"can-declare-exchanges" and "can-declare-queues" in the
user's description field, and grants permission to write and
read exchanges to everyone.

### Match Query {#match-query}

```erlang
{match, StringSubQuery, RESubQuery}
```

Takes a string and a regular expression, and checks that the one
matches the other. Note that the string and the regular expression are
both subqueries (of the `string` and `attribute`
types below) in turn. Example:

```erlang
{resource_access_query, {match, {string, "${name}"},
                      {string, "^${username}-"}}
}
```

This allows users to configure, read and write any object whose name
begins with their own username followed by a hyphen.

### String Sub-query {#string-subquery}

```erlang
{string, Pattern}
```

Just substitutes arguments into a string. As this returns a string
rather than a boolean it should be used within a `match`
or `equals` query. See above for example. As a shorthand
you can use a plain string instead of
`{string, Pattern}`.

### Attribute Sub-query {#attributes-subquery}

```erlang
{attribute, DNPattern, AttributeName}
```

Returns the value of an attribute of an object retrieved from
LDAP. As this returns a string rather than a boolean it should be
used within a `match` or `equals` query. See
above for example.

## Example Configuration {#example}

Bringing it all together, here's a sample configuration. It uses both the [standard config](./configure#config-file) and
[advanced config](./configure#advanced-config-file) files together. This
makes all users able to access the management plugin, but
makes none of them administrators. Access to virtual hosts is
controlled by membership of a group per virtual host. Only
members of `admin` can declare, delete or
bind exchanges and queues, but all users can publish to
exchanges and declare from queues. Publishing to topic-typed
exchanges is restricted to messages with a routing key
beginning with "a" and consuming from topics isn't restricted (topic authorisation).

The [standard config](./configure#config-file)
(rabbitmq.conf) is used to configure authentication backends and
several LDAP plugin parameters:

```
auth_backends.1 = ldap

auth_ldap.servers.1  = my-ldap-server
auth_ldap.user_dn_pattern = cn=${username},ou=People,dc=example,dc=com
auth_ldap.use_ssl    = false
auth_ldap.port       = 389
auth_ldap.log        = false
```

[Advanced config](./configure#advanced-config-file) is used to define LDAP queries:

```erlang
[{rabbitmq_auth_backend_ldap,[
    {vhost_access_query,    {in_group,
                              "ou=${vhost}-users,ou=vhosts,dc=example,dc=com"}},
     {resource_access_query,
      {for, [{permission, configure, {in_group, "cn=admin,dc=example,dc=com"}},
             {permission, write,
              {for, [{resource, queue,    {in_group, "cn=admin,dc=example,dc=com"}},
                     {resource, exchange, {constant, true}}]}},
             {permission, read,
              {for, [{resource, exchange, {in_group, "cn=admin,dc=example,dc=com"}},
                     {resource, queue,    {constant, true}}]}}
            ]
      }},
     {topic_access_query,
      {for, [{permission, write, {match, {string, "${routing_key}"}, {string, "^a"}}},
             {permission, read,  {constant, true}}
            ]
      }},
     {tag_queries,           [{administrator, {constant, false}},
                              {management,    {constant, true}}]}
]}].
```

Alternatively, you can use the [classic config format](./configure#erlang-term-config-file)
to configure everything in a single file:

```erlang
[
  {rabbit, [{auth_backends, [rabbit_auth_backend_ldap]}]},
  {rabbitmq_auth_backend_ldap,
   [ {servers,               ["my-ldap-server"]},
     {user_dn_pattern,       "cn=${username},ou=People,dc=example,dc=com"},
     {use_ssl,               false},
     {port,                  389},
     {log,                   false},
     {vhost_access_query,    {in_group,
                              "ou=${vhost}-users,ou=vhosts,dc=example,dc=com"}},
     {resource_access_query,
      {for, [{permission, configure, {in_group, "cn=admin,dc=example,dc=com"}},
             {permission, write,
              {for, [{resource, queue,    {in_group, "cn=admin,dc=example,dc=com"}},
                     {resource, exchange, {constant, true}}]}},
             {permission, read,
              {for, [{resource, exchange, {in_group, "cn=admin,dc=example,dc=com"}},
                     {resource, queue,    {constant, true}}]}}
            ]
      }},
     {topic_access_query,
      {for, [{permission, write, {match, {string, "${routing_key}"}, {string, "^a"}}},
             {permission, read,  {constant, true}}
            ]
     }},
     {tag_queries,           [{administrator, {constant, false}},
                              {management,    {constant, true}}]}
   ]
  }
].
```


## Troubleshooting {#troubleshooting}

Using LDAP for authentication and/or authorisation introduces another moving
part into the system. Since LDAP servers are accessed over the network,
some topics covered in the [Network Troubleshooting](./troubleshooting-networking)
and [TLS Troubleshooting](./troubleshooting-ssl) guides apply to LDAP.

In order to troubleshoot LDAP operations performed during the authentication and authorisation
stages, [enabling LDAP traffic logging](#logging) is highly recommended.

[ldapsearch](http://bit.ly/2GPyTmq) is a command line tool that ships with LDAP and makes it possible to execute arbitrary
LDAP queries against an OpenLDAP installation. This can be useful when troubleshooting complex authorisation
queries. [ldp.exe](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc772839(v=ws.10)) is the Active Directory counterpart.


## LDAP Proxies {#proxies}

An LDAP proxy can be used to modify LDAP requests performed by this plugin. [ldaptor](https://ldaptor.readthedocs.io/en/latest/)
is a library that can be used to build custom logic into the proxy.

Operators should recognise that using a proxy will make [troubleshooting](#troubleshooting) of LDAP requests more difficult.
