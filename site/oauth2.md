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

# OAuth 2.0 Authentication Backend

## <a id="overview" class="anchor" href="#overview">Overview</a>

This [RabbitMQ authentication/authorisation backend](./access-control.html) plugin lets applications (clients) and users authenticate and authorize using JWT-encoded OAuth 2.0 access tokens.

This guide covers

 * [How it works](#how-it-works)
 * [Usage](#usage)
    * [Variables Configurable in rabbitmq.conf](#variables-configurable)
    * [Resource Server ID and Scope Prefixes](#resource-server-id)
    * [Token validation](#token-validation)
    * [Scope-to-Permission Translation](#scope-translation)
    * [Topic Exchange scopes](#topic-exchange-scopes)
    * [Using a different token field for the Scope](#use-different-token-field)
    * [Using Tokens with Clients](#use-tokens-with-clients)
    * [Scope and Tags](#scope-and-tags)
    * [Token Expiration and Refresh](#token-expiration)
    * [Preferred username claims](#preferred-username-claims)
    * [Rich Authorization Request](#rich-authorization-request)
 * [Examples](#examples)


## <a id="how-it-works" class="anchor" href="#how-it-works">How it works</a>

The OAuth 2 plugin must be enabled (or [pre-configured](./plugins.html#enabled-plugins-file)) before it can be used,
like all other plugins:

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_auth_backend_oauth2
</pre>

Then it must be specified as one of the [authN and authZ backends](./access-control.html#backends). It can be
one of the backends or the only one backend, like in the example below:

<pre class="lang-ini">
# note that the module name begins with a "rabbit_", not "rabbitmq_", like in the name
# of the plugin
auth_backends.1 = rabbit_auth_backend_oauth2
</pre>

Next, let's take a look at the workflows the OAuth 2 plugin supports.

### <a id="authorization-workflow" class="anchor" href="#authorization-workflow">Authorization Workflow</a>

This plugin does not communicate with any OAuth 2.0 provider. It decodes an access token provided by the client and authorises a user based on the data stored in the token.

The token can be any [JWT token](https://jwt.io/introduction/) which contains the `scope` and `aud` fields. The way the token was issued (such as what grant type was used) is outside of the scope of this plugin.

### <a id="prerequisites" class="anchor" href="#prerequisites">Prerequisites</a>

To use this plugin, all RabbitMQ nodes must be

1. [configured to use the rabbit_auth_backend_oauth2 backend](./access-control.html).
2. configured with a resource service ID (`resource_server_id`) that matches the scope prefix (e.g. `rabbitmq` in `rabbitmq.read:*/*`).
3. configured with a signing key used by RabbitMQ to validate the JWT token signatures.

JWT Tokens presented to RabbitMQ for authentication must

1. be digitally signed with either a symmetric or asymmetric key.
2. have a value in the `aud` field that matches `resource_server_id` value.


### <a id="authorization-flow-with-scopes" class="anchor" href="#authorization-flow-with-scopes">Authorization Flow</a>

1. Client requests an `access_token` from the OAuth 2.0 provider,
2. Token **scope** returned by OAuth 2.0 provider must include RabbitMQ resource scopes that follow a convention used by this plugin: `configure:%2F/foo` means "configure permissions for 'foo' in vhost '/'") (`scope` field can be changed using `extra_scopes_source` in **advanced.config** file.
3. Client passes the token as password when connecting to a RabbitMQ node. **The username field is ignored**.
4. The translated permissions are stored as part of the authenticated connection state and used the same way permissions from RabbitMQ's internal database would be used.

## <a id="usage" class="anchor" href="#usage">Usage</a>

The plugin needs a signing key to be configured in order to verify the token's signature. This is the signing key used by the OAuth 2.0 provider to sign the tokens. RabbitMQ supports two types of signing keys: symmetric and asymmetric.

The examples given below uses [Cloud Foundry UAA](https://github.com/cloudfoundry/uaa) as OAuth 2.0 provider.

To get the signing key from the [OAuth 2.0 provider UAA](https://github.com/cloudfoundry/uaa), use the
[token_key endpoint](https://docs.cloudfoundry.org/api/uaa/version/4.6.0/index.html#token-key-s)
or [uaac](https://github.com/cloudfoundry/cf-uaac) (the `uaac signing key` command).

The following fields are required: `kty`, `value`, `alg`, and `kid`.

Assuming UAA reports the following signing key information:

<pre class="lang-erlang">
uaac signing key
  kty: RSA
  e: AQAB
  use: sig
  kid: a-key-ID
  alg: RS256
  value: -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2dP+vRn+Kj+S/oGd49kq
6+CKNAduCC1raLfTH7B3qjmZYm45yDl+XmgK9CNmHXkho9qvmhdksdzDVsdeDlhK
IdcIWadhqDzdtn1hj/22iUwrhH0bd475hlKcsiZ+oy/sdgGgAzvmmTQmdMqEXqV2
B9q9KFBmo4Ahh/6+d4wM1rH9kxl0RvMAKLe+daoIHIjok8hCO4cKQQEw/ErBe4SF
2cr3wQwCfF1qVu4eAVNVfxfy/uEvG3Q7x005P3TcK+QcYgJxav3lictSi5dyWLgG
QAvkknWitpRK8KVLypEj5WKej6CF8nq30utn15FQg0JkHoqzwiCqqeen8GIPteI7
VwIDAQAB
-----END PUBLIC KEY-----
  n: ANnT_r0Z_io_kv6BnePZKuvgijQHbggta2i30x-wd6o5mWJuOcg5fl5oCvQjZh15IaPar5oXZLHcw1bHXg5YSiHXCFmnYag83bZ9YY_9tolMK4R9G3eO-YZSnLImfqMv7HYBoAM75pk0JnTKhF6ldgfavShQZqOAIYf-vneMDNax_ZMZdEbzACi3vnWqCByI6JPIQju
      HCkEBMPxKwXuEhdnK98EMAnxdalbuHgFTVX8X8v7hLxt0O8dNOT903CvkHGICcWr95YnLUouXcli4BkAL5JJ1oraUSvClS8qRI-Vino-ghfJ6t9LrZ9eRUINCZB6Ks8Igqqnnp_BiD7XiO1c
</pre>

it will translate into the following configuration (in the [advanced RabbitMQ config format](https://www.rabbitmq.com/configure.html)):

<pre class="lang-erlang">
[
  %% ...
  %% backend configuration
  {rabbitmq_auth_backend_oauth2, [
    {resource_server_id, &lt;&lt;"my_rabbit_server">>},
    %% UAA signing key configuration
    {key_config, [
      {signing_keys, #{
        &lt;&lt;"a-key-ID">> => {pem, &lt;&lt;"-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2dP+vRn+Kj+S/oGd49kq
6+CKNAduCC1raLfTH7B3qjmZYm45yDl+XmgK9CNmHXkho9qvmhdksdzDVsdeDlhK
IdcIWadhqDzdtn1hj/22iUwrhH0bd475hlKcsiZ+oy/sdgGgAzvmmTQmdMqEXqV2
B9q9KFBmo4Ahh/6+d4wM1rH9kxl0RvMAKLe+daoIHIjok8hCO4cKQQEw/ErBe4SF
2cr3wQwCfF1qVu4eAVNVfxfy/uEvG3Q7x005P3TcK+QcYgJxav3lictSi5dyWLgG
QAvkknWitpRK8KVLypEj5WKej6CF8nq30utn15FQg0JkHoqzwiCqqeen8GIPteI7
VwIDAQAB
-----END PUBLIC KEY-----">>}
          }}
      ]}
    ]}
].
</pre>

If a symmetric key is used, the configuration will look like this:

<pre class="lang-erlang">
[
  {rabbitmq_auth_backend_oauth2, [
    {resource_server_id, &lt;&lt;"my_rabbit_server">>},
    {key_config, [
      {signing_keys, #{
        &lt;&lt;"a-key-ID">> => {map, #{&lt;&lt;"kty">> => &lt;&lt;"MAC">>,
                                  &lt;&lt;"alg">> => &lt;&lt;"HS256">>,
                                  &lt;&lt;"value">> => &lt;&lt;"my_signing_key">>}}
      }}
    ]}
  ]},
].
</pre>

The key set can also be retrieved dynamically from a URL serving a [JWK Set](https://tools.ietf.org/html/rfc7517#section-5).
In that case, the configuration will look like this:

<pre class="lang-erlang">
[
  {rabbitmq_auth_backend_oauth2, [
    {resource_server_id, &lt;&lt;"my_rabbit_server">>},
    {key_config, [
      {jwks_url, &lt;&lt;"https://my-jwt-issuer/jwks.json">>}
    ]}
  ]},
].
</pre>

NOTE: `jwks_url` takes precedence over `signing_keys` if both are provided.

### <a id="variables-configurable" class="anchor" href="#variables-configurable">Variables Configurable in rabbitmq.conf</a>

| Key                                      | Documentation
|------------------------------------------|-----------
| `auth_oauth2.resource_server_id`         | [The Resource Server ID](#resource-server-id-and-scope-prefixes)
| `auth_oauth2.resource_server_type`       | [The Resource Server Type](#rich-authorization-request)
| `auth_oauth2.additional_scopes_key`      | Configure the plugin to also look in other fields (maps to `additional_rabbitmq_scopes` in the old format). |
| `auth_oauth2.scope_prefix`               | Configure prefix for all scopes. Default value is  `auth_oauth2.resource_server_id` followed by the dot `.` character. |
| `auth_oauth2.preferred_username_claims`  | List of JWT claims to look for username associated to the token separated by commas.
| `auth_oauth2.default_key`                | ID of the default signing key.
| `auth_oauth2.signing_keys`               | Paths to signing key files.
| `auth_oauth2.jwks_url`                   | The URL of key server. According to the [JWT Specification](https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.2) key server URL must be https.
| `auth_oauth2.https.cacertfile`           | Path to a file containing PEM-encoded CA certificates. The CA certificates are used during key server [peer verification](https://rabbitmq.com/ssl.html#peer-verification).
| `auth_oauth2.https.depth`                | The maximum number of non-self-issued intermediate certificates that may follow the peer certificate in a valid [certification path](https://rabbitmq.com/ssl.html#peer-verification-depth). Default is 10.
| `auth_oauth2.https.peer_verification`    | Should [peer verification](https://rabbitmq.com/ssl.html#peer-verification) be enabled. Available values: `verify_none`, `verify_peer`. Default is `verify_none`. It is recommended to configure `verify_peer`. Peer verification requires a certain amount of setup and is more secure.
| `auth_oauth2.https.fail_if_no_peer_cert` | Used together with `auth_oauth2.https.peer_verification = verify_peer`. When set to `true`, TLS connection will be rejected if client fails to provide a certificate. Default is `false`.
| `auth_oauth2.https.hostname_verification`| Enable wildcard-aware hostname verification for key server. Available values: `wildcard`, `none`. Default is `none`.
| `auth_oauth2.algorithms`                 | Restrict [the usable algorithms](https://github.com/potatosalad/erlang-jose#algorithm-support).
| `auth_oauth2.verify_aud`                 | [Verify token's `aud`](#token-validation).

For example:

Configure with key files
<pre class="lang-ini">
auth_oauth2.resource_server_id = new_resource_server_id
auth_oauth2.additional_scopes_key = my_custom_scope_key
auth_oauth2.preferred_username_claims.1 = username
auth_oauth2.preferred_username_claims.2 = user_name
auth_oauth2.default_key = id1
auth_oauth2.signing_keys.id1 = test/config_schema_SUITE_data/certs/key.pem
auth_oauth2.signing_keys.id2 = test/config_schema_SUITE_data/certs/cert.pem
auth_oauth2.algorithms.1 = HS256
auth_oauth2.algorithms.2 = RS256
</pre>
Configure with key server
<pre class="lang-ini">
auth_oauth2.resource_server_id = new_resource_server_id
auth_oauth2.jwks_url = https://my-jwt-issuer/jwks.json
auth_oauth2.https.cacertfile = test/config_schema_SUITE_data/certs/cacert.pem
auth_oauth2.https.peer_verification = verify_peer
auth_oauth2.https.depth = 5
auth_oauth2.https.fail_if_no_peer_cert = true
auth_oauth2.https.hostname_verification = wildcard
auth_oauth2.algorithms.1 = HS256
auth_oauth2.algorithms.2 = RS256
</pre>

### <a id="resource-server-id" class="anchor" href="#resource-server-id">Resource Server ID and scope prefix</a>

OAuth 2.0 tokens use scopes to communicate what set of permissions particular
client has been granted. The scopes are free form strings.

By default, `resource_server_id` followed by the dot (`.`) character is the prefix used for scopes to avoid scope collisions (or unintended overlap).
However, in some environments, it is not possible to use `resource_server_id` as the prefix for all scopes. For these environments, there is a new setting called `scope_prefix` which overrides the default scope prefix. Empty strings are allowed.

Given the below configuration, the scope associated to the permission `read:*/*` is `api://read:*/*`.
<pre class="lang-ini">
...
auth_oauth2.scope_prefix = api://
...
</pre>


### <a id="token-validation" class="anchor" href="#token-validation">Token validation</a>

When RabbitMQ receives a JWT token, it validates it before accepting it.

#### Must be digitally signed

The token must carry a digital signature and optionally a `kid` header attribute which identifies the key RabbitMQ should
use to validate the signature.

#### Must not be expired

RabbitMQ uses this field `exp` ([exp](https://tools.ietf.org/html/rfc7519#page-9)) to validate the token if present.
It contains the expiration time after which the JWT MUST NOT be accepted for processing.

#### Audience must have/match the resource_server_id

The `aud` ([Audience](https://tools.ietf.org/html/rfc7519#page-9)) identifies the recipients and/or resource_server of the JWT. By default, **RabbitMQ uses this field to validate the token** although you can deactivate it by setting `verify_aud` to `false`.  When it set to `true`, this attribute must either match the `resource_server_id` setting or in case of a list, it must contain the `resource_server_id`.


### <a id="scope-translation" class="anchor" href="#scope-translation">Scope-to-Permission Translation</a>

Scopes are translated into permission grants to RabbitMQ resources for the provided token.

The current scope format is `&lt;permission>:&lt;vhost_pattern>/&lt;name_pattern>[/&lt;routing_key_pattern>]` where

 * `<permission>` is an access permission (`configure`, `read`, or `write`)
 * `<vhost_pattern>` is a wildcard pattern for vhosts token has access to.
 * `<name_pattern>` is a wildcard pattern for resource name
 * `&lt;routing_key_pattern>` is a wildcard pattern for routing key in topic authorization

Wildcard patterns are strings with optional wildcard symbols `*` that match
any sequence of characters.

Wildcard patterns match as following:

 * `*` matches any string
 * `foo*` matches any string starting with a `foo`
 * `*foo` matches any string ending with a `foo`
 * `foo*bar` matches any string starting with a `foo` and ending with a `bar`

There can be multiple wildcards in a pattern:

 * `start*middle*end`
 * `*before*after*`

**To use special characters like `*`, `%`, or `/` in a wildcard pattern,
the pattern must be [URL-encoded](https://en.wikipedia.org/wiki/Percent-encoding).**

These are the typical permissions examples:

- `read:*/*`(`read:*/*/*`) - read permissions to any resource on any vhost
- `write:*/*`(`write:*/*/*`) - write permissions to any resource on any vhost
- `read:vhost1/*`(`read:vhost1/*/*`) - read permissions to any resource on the `vhost1` vhost
- `read:vhost1/some*` - read permissions to all the resources, starting with `some` on the `vhost1` vhost
- `write:vhost1/some*/routing*` - topic write permissions to publish to an exchange starting with `some` with a routing key starting with `routing`
- `read:*/*/*` and `write:*/*/*` - queue binding permissions required to bind a queue on a topic exchange with any routing key

See the [wildcard matching test suite](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_auth_backend_oauth2/test/wildcard_match_SUITE.erl) and [scopes test suite](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_auth_backend_oauth2/test/scope_SUITE.erl) for more examples.

Scopes, by default, are prefixed with `resource_server_id` followed by the dot (`.`) character if `scope_prefix`
is not configured. For example, if `resource_server_id` is "my_rabbit", a scope to enable read from any vhost will
be `my_rabbit.read:*/*`.

If `scope_prefix` is configured then scopes are prefixed as follows: `<scope_prefix><permission>`. For example,
if `scope_prefix` is `api://` and the permission is `read:*/*` the scope would be `api://read:*/*`

### <a id="topic-exchange-scopes" class="anchor" href="#topic-exchange-scopes">Topic Exchange scopes</a>

The [previous](#scope-translation) section explained, in detail, how permissions are mapped to scopes. This section explains more specifically what scopes you need in order to operate on **Topic Exchanges**.

To bind and/or unbind a queue to/from a **Topic Exchange**, you need to have the following scopes:

- **write** permission on the queue and routing key -> `rabbitmq.write:<vhost>/<queue>/<routingkey>`
> e.g. `rabbitmq.write:*/*/*`

- **read** permission on the exchange and routing key -> `rabbitmq.write:<vhost>/<exchange>/<routingkey>`
> e.g. `rabbitmq.read:*/*/*`

To publish to a **Topic Exchange**, you need to have the following scope:

- **write** permission on the exchange and routing key -> `rabbitmq.write:<vhost>/<exchange>/<routingkey>`
> e.g. `rabbitmq.write:*/*/*`

OAuth 2.0 authorisation backend supports variable expansion when checking permission on topics.
It supports JWT claims whose value is a plain string, plus the `vhost` variable.

For example, a user connected with the token below to the vhost `prod` should have
a write permission on all exchanges starting with `x-prod-`, and any routing key starting with `u-bob-`:

<pre class="lang-json">
{
  "sub" : "bob",
  "scope" : [ "rabbitmq.write:*/q-{vhost}-*/u-{sub}-*" ]
}
</pre>


### <a id="use-different-token-field" class="anchor" href="#use-different-token-field">Using a different token field for the Scope</a>

By default the plugin will look for the `scope` key in the token, you can configure the plugin to also look in other fields using the `extra_scopes_source` setting. Values format accepted are scope as **string** or **list**


<pre class="lang-erlang">
[
  {rabbitmq_auth_backend_oauth2, [
    {resource_server_id, &lt;&lt;"my_rabbit_server">>},
    {extra_scopes_source, &lt;&lt;"my_custom_scope_key">>},
    ...
    ]}
  ]},
].
</pre>
Token sample:
<pre class="lang-ini">
{
 "exp": 1618592626,
 "iat": 1618578226,
 "aud" : ["my_id"],
 ...
 "scope_as_string": "my_id.configure:*/* my_id.read:*/* my_id.write:*/*",
 "scope_as_list": ["my_id.configure:*/*", "my_id.read:*/*", my_id.write:*/*"],
 ...
 }
</pre>

### <a id="use-tokens-with-clients" class="anchor" href="#use-tokens-with-clients">Using Tokens with Clients</a>

A client must present a valid `access_token` acquired from an OAuth 2.0 provider (such as UAA) as the **password**
in order to authenticate with RabbitMQ.

To learn more about OAuth 2.0 clients, see the [OAuth 2.0 client specification](https://www.rfc-editor.org/rfc/rfc6749#section-4.4).

### <a id="scope-and-tags" class="anchor" href="#scope-and-tags">Scope and Tags</a>

Users in RabbitMQ can have [tags associated with them](./access-control.html#user-tags).
Tags are used to [control access to the management plugin](./management.html#permissions).

In the OAuth context, tags can be added as part of the scope, using a format like `&lt;resource_server_id>.tag:&lt;tag>`. For
example, if `resource_server_id` is "my_rabbit", a scope to grant access to the management plugin with
the `monitoring` tag will be `my_rabbit.tag:monitoring`.

### <a id="preferred-username-claims" class="anchor" href="#preferred-username-claims">Preferred username claims</a>

The username associated with the token must be available to RabbitMQ so that this username is displayed in the RabbitMQ Management UI.
By default, RabbitMQ searches for the `sub` claim first, and if it is not found, RabbitMQ uses the `client_id`.

Most authorization servers return the user's GUID in the `sub` claim instead of the user's username or email address, anything the user can relate to. When the `sub` claim does not carry a *user-friendly username*, you can configure one or several claims to extract the username from the token.

Example `advanced.config` configuration:

<pre class="lang-erlang">
  ...
  {rabbitmq_auth_backend_oauth2, [
    {resource_server_id, &lt;&lt;"rabbitmq"&gt;&gt;},
    {preferred_username_claims, [&lt;&lt;"user_name"&gt;&gt;,&lt;&lt;"email"&gt;&gt;]},
  ...
</pre>
In the example configuration, RabbitMQ searches for the `user_name` claim first and if it is not found, RabbitMQ searches for the `email`. If these are not found, RabbitMQ uses its default lookup mechanism which first looks for `sub` and then `client_id`.

### <a id="token-expiration" class="anchor" href="#token-expiration">Token Expiration and Refresh</a>

On an existing connection the token can be refreshed by the [update-secret](https://rabbitmq.com/amqp-0-9-1-reference.html#connection.update-secret) AMQP 0.9.1 method. Please check your client whether it supports this method. (Eg. see documentation of the [Java client](https://rabbitmq.com/api-guide.html#oauth2-refreshing-token).) Otherwise the client has to disconnect and reconnect to use a new token.

If the latest token expires on an existing connection, after a limited time the broker will refuse all operations (but it won't disconnect).


### <a id="rich-authorization-request" class="anchor" href="#rich-authorization-request">Rich Authorization Request</a>

The [Rich Authorization Request](https://oauth.net/2/rich-authorization-requests/) extension provides a way for
OAuth clients to request fine-grained permissions during an authorization request.
It moves away from the concept of scopes that are text labels and instead
defines a more sophisticated permission model.

RabbitMQ supports JWT tokens compliant with the extension. Below is a sample example section of JWT token:

<pre class="lang-javascript">
{
  "authorization_details": [
    {
      "type" : "rabbitmq",
      "locations": ["cluster:finance/vhost:production-*"],
      "actions": [ "read", "write", "configure"  ]
    },
    {
      "type" : "rabbitmq",
      "locations": ["cluster:finance", "cluster:inventory" ],
      "actions": ["administrator" ]
    }
  ]
}
</pre>

The token above contains two permissions under the attribute `authorization_details`.
Both permissions are meant for RabbitMQ servers with `resource_server_type` set to `rabbitmq`.
This field identifies RabbitMQ-specific permissions.

The first permission grants `read`, `write` and `configure` permissions to any
queue and/or exchange on any virtual host whose name matches the pattern `production-*`,
and that reside in clusters whose `resource_server_id` contains the string `finance`.
The `cluster` attribute's value is also a regular expression. To match exactly the
string `finance`, use `^finance$`.

The second permission grants the `administrator` user tag in two clusters, `finance`
and `inventory`. Other supported user tags as `management`, `policymaker` and `monitoring`.


#### Type field

In order for a RabbitMQ node to accept a permission, its value must match that
node's `resource_server_type` setting value. A JWT token may have permissions
for multiple resource types.

#### Locations field

The `locations` field can be either a string containing a single location or a Json array containing
zero or many locations.

A location consists of a list of key-value pairs separated by forward slash `/` character. Here is the format:
<pre class="lang-bash">
cluster:&lt;resource_server_id_pattern>[/vhost:&lt;vhost_pattern>][/queue:&lt;queue_name_pattern>|/exchange:&lt;exchange_name_pattern][/routing-key:&lt;routing_key_pattern>]
</pre>

Any string separated by `/` which does not conform to `&lt;key>:&lt;value>` is ignored. For instance, if your locations start with a prefix, e.g. `vrn/cluster:rabbitmq`, the `vrn` pattern part is ignored.

The supported location's attributed are:

- `cluster`: This is the only mandatory attribute. It is a wildcard pattern which must match RabbitMQ's `resource_server_id` otherwise the location is ignored.
- `vhost`: This is the virtual host you are granting access to. It also a wildcard pattern. If not specified, `*` will be used.
- `queue`|`exchange`: queue or exchange name pattern. The location grants the permission to a set of queues (or exchanges) that match it. One location can only specify either `queue` or `exchange` but not both. If not specified, `*` will be used
- `routing-key`: this is the routing key pattern the location grants the permission to. If not specified, `*` will be used

For more information about wildcard patterns, check the section [Scope-to-Permission Translation](#scope-to-permission-translation).

#### Actions field

The `actions` field can be either a string containing a single action or a Json array containing zero or many actions.

The supported actions map to either [RabbitMQ permissions](./access-control.html#authorisation):

- `configure`
- `read`
- `write`

Or RabbitMQ user tags:

- `administrator`
- `monitoring`
- `management`
- `policymaker`

#### Rich-Permission to Scope translation

Rich Authorization Request permissions are translated into JWT token scopes that use the
aforementioned convention using the following algorithm:

For each location found in the `locations` where the `cluster` attribute matches the current RabbitMQ server's `resource_server_id`:

  - For each location found in the `locations` field where the `cluster` attribute matches the current RabbitMQ node's `resource_server_id`, the plugin extracts the `vhost`, `queue` or `exchange` and `routing_key` attributes from the location. If the location does not  have any of those attributes, the default value of `*` is assumed. Out of those values, the following scope suffix will be produced:
    <pre class="lang-ini">scope_suffix = &lt;vhost>/&lt;queue>|&lt;exchange>/&lt;routing-key></pre>

  - For each action found in the `actions` field:

    if the action is not a known user tag, the following scope is produced out of it:
    <pre class="lang-ini">
      scope = &lt;resource_server_id>.&lt;action>:&lt;scope_suffix>
    </pre>

    For known user tag actions, the following scope is produced:
    <pre class="lang-ini">
      scope = &lt;resource_server_id>.&lt;action>
    </pre>


The plugin produces permutations of all `actions` by  all `locations` that match the node's configured `resource_server_id`.

In the following RAR example
<pre class="lang-javascript">
{
  "authorization_details": [
    { "type" : "rabbitmq",
      "locations": ["cluster:finance/vhost:primary-*"],
      "actions": [ "read", "write", "configure"  ]
    },
    { "type" : "rabbitmq",
      "locations": ["cluster:finance", "cluster:inventory" ],
      "actions": ["administrator" ]
    }
  ]
}
</pre>

if RabbitMQ node's `resource_server_id` is equal to `finance`, the plugin will compute the following sets of scopes:

- `finance.read:primary-*/*/*`
- `finance.write:primary-*/*/*`
- `finance.configure:primary-*/*/*`
- `finance.tag:administrator`

## <a id="examples" class="anchor" href="#examples">Examples</a>

The [RabbitMQ OAuth 2.0 Auth Backend Examples](oauth2-examples.html) contains many example configuration files which can be used to set up several OAuth 2.0 providers, including UAA, Auth0, and Azure, and issue tokens, which can be used to access RabbitMQ resources.
