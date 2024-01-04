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

# Management Plugin

## <a id="overview" class="anchor" href="#overview">Overview</a>

The RabbitMQ management plugin provides an HTTP-based API
for management and [monitoring](monitoring.html) of RabbitMQ nodes and clusters, along
with a browser-based UI and a command line tool, [rabbitmqadmin](management-cli.html).

It periodically collects and aggregates data about many aspects of the system. Those metrics
are exposed to human operators in the UI. The API it provides can be used by [monitoring systems](monitoring.html),
however, [Prometheus](prometheus.html) is the **recommended option** for long term storage,
alerting, visualisation, chart analysis and so on.

The plugin also provides tools for [analysing memory usage](#memory) of the node,
and other features related to monitoring, metrics, user, permission, and topology management.
Previously it also provided [definition export and import functionality](definitions.html). Those are now
core RabbitMQ features and do not require or rely on this plugin.

This guide covers:

 * [Basic usage](#usage) of management UI and [HTTP API](#http-api)
 * General plugin [configuration](#configuration)
 * [Reverse proxy (Nginx or Apache)](#http-api-proxy) in front of the HTTP API
 * How to [enable HTTPS for management UI](#single-listener-https) and its underlying API
 * How this plugin [operates in multi-node clusters](#clustering)
 * How to [disable metric collection](#disable-stats) to use [Prometheus](prometheus.html) exclusively for monitoring
 * [OAuth 2](#oauth2-authentication) support
 * [Strict transport security](#hsts), [Content security policy](#csp), [cross-origin resource sharing](#cors), and [other security-related header](#other-security-headers) control
 * [Statistics collection interval](#statistics-interval)
 * [Message rate mode](#rates-mode) (rate fidelity) and [data retention intervals](#sample-retention)
 * [HTTP API request logging](#http-logging)
 * How to set a [management UI login session timeout](#login-session-timeout)
 * How to [reset statistics database](#reset-stats) used by this plugin

as well as other related topics.

The plugin also provides extension points that other plugins, such as
[rabbitmq-top](https://github.com/rabbitmq/rabbitmq-top) or
[rabbitmq-shovel-management](https://github.com/rabbitmq/rabbitmq-shovel-management),
use to extend the UI.


## <a id="external-monitoring" class="anchor" href="#external-monitoring">Management UI and External Monitoring Systems</a>

The management UI and its [HTTP API](#http-api) is a built-in [monitoring option](./monitoring.html) for RabbitMQ.
This is a convenient option for development and in environments where
external monitoring is difficult or impossible to introduce.

However, the management UI has a number of limitations:

 * The monitoring system is intertwined with the system being monitored
 * A certain amount of overhead
 * It only stores recent data (think hours, not days or months)
 * It has a basic user interface
 * Its design [emphasizes ease of use over best possible availability](./management.html#clustering).
 * Management UI access is controlled via the [RabbitMQ permission tags system](./access-control.html)
   (or a convention on JWT token scopes)

Long term metric storage and visualisation services such as [Prometheus and Grafana](./prometheus.html)
or the [ELK stack](https://www.elastic.co/what-is/elk-stack) are more suitable options for production systems. They offer:

 * Decoupling of the monitoring system from the system being monitored
 * Lower overhead
 * Long term metric storage
 * Access to additional related metrics such as those of the [Erlang runtime](./runtime.html) ones
 * More powerful and customizable user interface
 * Ease of metric data sharing: both metric state and dashboards
 * Metric access permissions are not specific to RabbitMQ
 * Collection and aggregation of node-specific metrics which is more resilient to individual node failures

RabbitMQ provides first class support for [Prometheus and Grafana](./prometheus.html) as of 3.8.
It is recommended for production environments.


## <a id="getting-started" class="anchor" href="#getting-started">Getting Started</a>

The management plugin is included in the RabbitMQ
distribution. Like any other [plugin](./plugins.html), it must
be enabled before it can be used. That's done using [rabbitmq-plugins](man/rabbitmq-plugins.8.html):

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_management
</pre>

Node restart is not required after plugin activation.

During automated deployments, the plugin can be enabled via
[enabled plugin file](./plugins.html#enabled-plugins-file).


## <a id="usage" class="anchor" href="#usage">Usage</a>

### <a id="usage-ui" class="anchor" href="#usage-ui">Management UI Access</a>

The management UI can be accessed using a Web browser at <code>http://<i>{node-hostname}</i>:15672/</code>.

For example, for a node running on a machine with the hostname of `warp10.local`,
it can be accessed by users with [sufficient privileges](#permissions) at either `http://warp10.local:15672/`
or `http://localhost:15672/` (provided that `localhost` resolves correctly).

Note that the UI and HTTP API port — typically 15672 — does not support AMQP 0-9-1, AMQP 1.0, STOMP or MQTT connections.
[Separate ports](./networking.html#ports) should be used by those clients.

Users must be [granted permissions](#permissions) for management UI access.

### <a id="usage-highlights" class="anchor" href="#usage-highlights">Notable Features</a>

The management UI is implemented as a single page application which relies on the [HTTP API](#http-api).
Some of the features include:

<ul>
  <li>
    Declare, list and delete exchanges, <a href="./queues.html">queues</a>, bindings,
    users, <a href="./vhosts.html">virtual hosts</a> and <a href="./access-control.html">user permissions</a>.
  </li>
  <li>
    Monitor queue length, message rates (globally and per queue, exchange or channel), resource usage of queue,
    node GC activity, data rates of client connections, and more.
  </li>
  <li>
    Monitor node resource use: <a href="./networking.html#open-file-handle-limit">sockets and file descriptors</a>,
    <a href="./memory-use.html">memory usage breakdown</a>, available disk space and bandwidth usage on inter-node communication
    links.
  </li>
  <li>
    Manage users (provided administrative permissions of the current user).
  </li>
  <li>
    Manage <a href="./parameters.html">policies and runtime parameters</a> (provided sufficient permissions of the current user).
  </li>
  <li>
    <a href="./backup.html">Export schema</a> (vhosts, users, permissions, queues, exchanges, bindings, parameters,
    policies) and <a href="./definitions.html">import it on node start</a>. This can be used for <a href="./backup.html">recovery purposes</a>
    or setup automation of new nodes and clusters.
  </li>
  <li>
    Force close client connections, purge queues.
  </li>
  <li>
    Send and receive messages (useful in development environments
    and for troubleshooting).
  </li>
</ul>

The UI application supports recent versions of Google Chrome, Safari, Firefox, and Microsoft Edge browsers.

### <a id="usage-ui-clusters" class="anchor" href="#usage-ui-clusters">Management UI Access in Clusters</a>

Any cluster node with `rabbitmq_management` plugin enabled can be
used for management UI access or data collection by monitoring tools.
It will reach out to other nodes and collect their stats, then aggregate and return a response
to the client.

To access management UI the user has to authenticate and have certain permissions (be authorised).
This is covered in the [following section](#permissions).


## <a id="permissions" class="anchor" href="#permissions">Access and Permissions</a>

The management UI requires [authentication and authorisation](access-control.html), much like RabbitMQ requires
it from connecting clients. In addition to successful authentication, management UI access is controlled by user tags.
The tags are managed using [rabbitmqctl](./rabbitmqctl.8.html#set_user_tags).
Newly created users do not have any tags set on them by default.

See [Production Checklist](./production-checklist.html) for general recommendations on user and credential
management.

<table>
  <tr>
    <th>Tag</th>
    <th>Capabilities</th>
  </tr>
  <tr>
    <td>(None)</td>
    <td>No access to the management plugin</td>
  </tr>
  <tr>
  <td>management</td>
  <td>
    Anything the user could do via messaging protocols plus:
    <ul>
      <li>List virtual hosts to which they can log in via AMQP</li>
      <li>
        View all queues, exchanges and bindings in "their"
        virtual hosts
      </li>
      <li>View and close their own channels and connections</li>
      <li>
        View "global" statistics covering all their
        virtual hosts, including activity by other users
        within them
      </li>
    </ul>
  </td>
  </tr>
  <tr>
  <td>policymaker</td>
  <td>
    Everything "management" can plus:
    <ul>
      <li>
        View, create and delete policies and parameters for virtual
        hosts to which they can log in via AMQP
      </li>
    </ul>
  </td>
  </tr>
  <tr>
  <td>monitoring</td>
  <td>
    Everything "management" can plus:
    <ul>
      <li>
        List all virtual hosts, including ones they could
        not access using messaging protocols
      </li>
      <li>View other users's connections and channels</li>
      <li>View node-level data such as memory use and clustering</li>
      <li>View truly global statistics for all virtual hosts</li>
    </ul>
  </td>
  </tr>
  <tr>
  <td>administrator</td>
  <td>
    Everything "policymaker" and "monitoring" can plus:
    <ul>
      <li>Create and delete virtual hosts</li>
      <li>View, create and delete users</li>
      <li>View, create and delete permissions</li>
      <li>Close other users's connections</li>
    </ul>
  </td>
  </tr>
</table>

Note that since "administrator" does everything "monitoring"
does, and "monitoring" does everything "management" does,
each user often needs a maximum of one tag.

Normal RabbitMQ [permissions to resources](access-control.html) still apply to monitors and
administrators; just because a user is a monitor or
administrator does not grant them full access to exchanges,
queues and bindings through the management
plugin or other means.

All users can only list objects within the virtual
hosts they have any permissions for.

If access to management UI is impossible to due the lack of users
with sufficient permissions or forgotten/incorrect permissions, [CLI tools](cli.html) must
be used to manage the users and their credentials. [rabbitmqctl add_user](man/rabbitmqctl.8.html#)
should be used to create a user, [rabbitmqctl set_permissions](man/rabbitmqctl.8.html#) to grant the
user the desired permissions and finally, [rabbitmqctl
set_user_tags](./man/rabbitmqctl.8.html#set_user_tags) should be used to give the user management UI access permissions.

### <a id="cli-examples" class="anchor" href="#cli-examples">Command Line Examples</a>

The following example creates a user with complete access to the management UI/HTTP API (as in,
all virtual hosts and management features):

<pre class="lang-bash">
# create a user
rabbitmqctl add_user full_access s3crEt
# tag the user with "administrator" for full management UI and HTTP API access
rabbitmqctl set_user_tags full_access administrator
</pre>


## <a id="oauth2-authentication" class="anchor" href="#oauth2-authentication">Authenticating with OAuth 2</a>

RabbitMQ can be configured to use [JWT-encoded OAuth 2.0 access tokens](https://github.com/rabbitmq/rabbitmq-auth-backend-oauth2) to authenticate client applications and management UI users. When doing so, the management UI does
not automatically redirect users to authenticate
against the OAuth 2 server, this must be configured separately. Currently,
**Authorization code flow with PKCE** is tested with the following Authorization servers:

* [UAA](https://github.com/cloudfoundry/uaa)
* [Keycloak](https://www.keycloak.org/)
* [Auth0](https://auth0.com/)
* [Azure](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/auth-oauth2)
* [OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/)

**Important**: from the OAuth 2.0 point of view, the RabbitMQ Management UI is a **public app** which
means it cannot securely store credentials such as the *client_secret*. This means that RabbitMQ does not need to present a client_secret when authenticating users.

It is usually possible to configure the OAuth client as a **public app** with the authorization server that you are using.
If target authorization server only supports a **confidential app** or it requires a *client_secret*,
then a *client_secret* **must** be configured using the `oauth_client_secret` setting.

To redirect users to the UAA server to authenticate, use the following configuration:

<pre class="lang-ini">
management.oauth_enabled = true
management.oauth_client_id = rabbit_user_client
management.oauth_client_secret = rabbit_user_client
management.oauth_provider_url = https://my-uaa-server-host:8443/uaa
management.oauth_scopes = openid profile rabbitmq.*
</pre>

> **Important**: UAA supports regular expression in scopes, e.g. `rabbitmq.*`. The above configuration
assumes that the `resource_server_id` configured in the oauth2 backend matches the value `rabbitmq`.

> **Important**: Since RabbitMQ 3.10, RabbitMQ uses `authorization_code` grant type. `implicit` flow is deprecated.

> **Important**: `management.oauth_client_secret` is an optional setting. UAA 75.21.0 and earlier versions require `oauth_client_secret` regardless if the oauth client is configured as confidental.

### Allow Basic and OAuth 2 authentication

When using `management.oauth_enabled = true`, it is still possible to authenticate
with [HTTP basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication)
against the HTTP API. This means both of the following examples will work:

<pre class="lang-bash">
# swap &lt;token&gt; for an actual token
curl -i -u ignored:&lt;token&gt; http://localhost:15672/api/vhosts
</pre>

as well as

<pre class="lang-bash">
curl -i --header "authorization: Basic &lt;encoded credentials&gt;" http://localhost:15672/api/vhosts
</pre>

To switch to authenticate using OAuth 2 exclusively for management UI access, set the
`management.disable_basic_auth` configuration key to `true`:

<pre class="lang-ini">
management.disable_basic_auth = true
management.oauth_client_id = rabbit_user_client
management.oauth_client_secret = rabbit_user_client
management.oauth_provider_url = https://my-uaa-server-host:8443/uaa
management.oauth_scopes = openid profile rabbitmq.*
</pre>

When setting `management.disable_basic_auth` to `true`, only the `Bearer` (token-based) authorization method will
work, for example:

<pre class="lang-bash">
# swap &lt;token&gt; for an actual token
curl -i --header "authorization: Bearer &lt;token&gt;" http://localhost:15672/api/vhosts
</pre>

This is true for all endpoints except `GET /definitions` and `POST /definitions`. Those
endpoints require the token to be passed in the `token` query string parameter.

### Configure which scopes RabbitMQ requests to the authorization server

It is possible to configure which OAuth 2.0 scopes RabbitMQ should claim when redirecting the user to the authorization server.

If `management.oauth_enabled = true` and `management.oauth_scopes` is not set, RabbitMQ default to `openid profile`.

Depending on the Authorization server, we may use regular expression in scopes, e.g. <*resource_server_id*>`.*`, or
instead we have to explicitly ask for them, e.g.:
  * <*resource_server_id*>`.tag:administrator`
  * <*resource_server_id*>`.read:*/*/*`


### Configure OpenID Connect Discovery endpoint

By default, RabbitMQ assumes the OpenID Connect Discovery endpoint is at `<management.oauth_provider_url>/.well-known/openid-configuration`. If your endpoint differs, you can set yours via the `management.oauth_metadata_url` setting.

RabbitMQ uses this endpoint to discover other endpoints such as **token** endpoint, **logout** endpoint, and others.

### Logout workflow

RabbitMQ follows the [OpenID Connect RP-Initiated Logout 1.0 ](https://openid.net/specs/openid-connect-rpinitiated-1_0.html)
specification to implement the logout workflow. This means that the logout workflow is triggered from the Management UI when the user clicks on the **Logout** button. Logging out from RabbitMQ management UI not only logs the user out from the management UI itself but also from the Identity Provider.

There are other two additional scenarios which can trigger a logout. One scenario occurs when the OAuth Token expires. Although RabbitMQ renews the token in the background before it expires, if the token expires, the user is logged out.
The second scenario is when the management UI session exceeds the maximum allowed time configured on the [Login Session Timeout](https://www.rabbitmq.com/management.html#login-session-timeout).

### Special attention to CSP header `connect-src`

To support the OAuth 2.0 protocol, RabbitMQ makes asynchronous REST calls to the [OpenId Connect Discovery endpoint](#Configure-OpenID-Connect-Discovery-endpoint). If you override the default [CSP headers](#csp), you have to make sure that the `connect-src` CSP directive whitelists the [OpenId Connect Discovery endpoint](#Configure-OpenID-Connect-Discovery-endpoint).

For instance, if you configured the CSP header with the value `default-src 'self'` you are, by default, setting `connect-src 'self'` which means you are denying RabbitMQ access to any external endpoint; hence disabling OAuth 2.0.

In addition to the `connect-src` CSP header, RabbitMQ also needs the CSP directives `unsafe-eval` `unsafe-inline`, otherwise the OAuth 2.0 functionality may not work.

### Identity-Provider initiated logon

By default, the RabbitMQ Management UI uses the OAuth 2.0 **authorization code flow** to authenticate and authorize users.
However, there are scenarios where users prefer to be automatically redirected to RabbitMQ without getting involved in additional logon flows. By using OAuth2 proxies and web portals, these additional logon flows can be avoided. With a single click, users navigate straight to a RabbitMQ Management UI with a token obtained under the covers. This is known as **Identity-Provider initiated logon**.

RabbitMQ exposes a new setting called `management.oauth_initiated_logon_type` whose default value `sp_initiated`.
To enable an **Identity-Provider initiated logon** you set it to `idp_initiated`.

<pre class="lang-ini">
management.oauth_enabled = true
management.oauth_initiated_logon_type = idp_initiated
management.oauth_provider_url = https://my-web-portal
</pre>

With the previous settings, the management UI exposes the HTTP endpoint `/login` which accepts `content-type: application/x-www-form-urlencoded` and it expects the JWT token in the `access_token` form field. This is the endpoint where the Web portal will redirect users to the management UI.
Additionally, RabbitMQ also accepts a JWT token in the HTTP `Authorization` header when the user lands on the management UI.

## <a id="http-api" class="anchor" href="#http-api">HTTP API</a>

### <a id="http-api-endpoints" class="anchor" href="#http-api-endpoints">API Endpoints</a>

When activated, the management plugin provides an HTTP API at
<code>http://<i>server-name</i>:15672/api/</code> by default. Browse to that
location for more information on the API. For convenience the same API reference is
[available on GitHub](https://rawcdn.githack.com/rabbitmq/rabbitmq-server/&version-server-tag;/deps/rabbitmq_management/priv/www/api/index.html).

### <a id="http-api-monitoring" class="anchor" href="#http-api-monitoring">HTTP API and Monitoring</a>

The API is intended to be used for basic observability tasks. [Prometheus and Grafana](prometheus.html)
are recommended for long term metric storage, alerting, anomaly detection, and so on.

Any cluster node with `rabbitmq-management` plugin enabled can be
used for management UI access or HTTP API access.
It will reach out to other nodes and collect their stats, then aggregate and return a response
to the client.

When using the API in a cluster of nodes, there is no need to contact each node via HTTP API
individually. Instead, contact a random node or a load balancer that sits in front
of the cluster.

### <a id="http-api-clients" class="anchor" href="#http-api-clients">HTTP API Clients and Tooling</a>

[rabbitmqadmin](management-cli.html) is a Python command  line tool
that interacts with the HTTP API. It can be downloaded from any RabbitMQ node that
has the management plugin enabled at <code>http://<i>{node-hostname}</i>:15672/cli/</code>.

For HTTP API clients in several languages,
see [Developer Tools](./devtools.html).

Some API endpoints return a lot of information. The volume can be reduced
by filtering what columns are returned by `HTTP GET` requests. See
[latest HTTP API documentation](https://rawcdn.githack.com/rabbitmq/rabbitmq-server/&version-server-tag;/deps/rabbitmq_management/priv/www/api/index.html) for details.

### <a id="http-api-proxy" class="anchor" href="#http-api-proxy">Using a Reverse Proxy in front of the HTTP API</a>

It may be necessary to put a reverse proxy in front of a RabbitMQ cluster. Reverse proxy setup for RabbitMQ
may require careful handling of encoded slashes in paths if default virtual host (`/`) is used.

If default virtual host is not used, the additional settings to support encoded URIs
will not be necessary. In other words, both Nginx and Apache configuration will require
the standard minimum for any HTTP-based service.

#### Nginx

If RabbitMQ HTTP API access is configured for the root location (`/`),
the location must not have a slash at the end:

<pre class="lang-nginxconf">
# trailing slash in the location must be omitted only if default RabbitMQ virtual host is used
location / {
    proxy_pass http://rabbitmq-host:15672;
}
</pre>

If a different location will be used to proxy requests to the HTTP API,
a [URI rewrite](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite) rule must be used:

<pre class="lang-nginxconf">
# these rewrites are only if default RabbitMQ virtual host is used
location ~* /rabbitmq/api/(.*?)/(.*) {
    proxy_pass http://rabbitmq-host:15672/api/$1/%2F/$2?$query_string;
}

location ~* /rabbitmq/(.*) {
    rewrite ^/rabbitmq/(.*)$ /$1 break;
    proxy_pass http://rabbitmq-host:15672;
}
</pre>


#### Apache

To support encoded slashes in URIs, Apache requires users to explicitly enable
[`AllowEncodedSlashes`](https://httpd.apache.org/docs/2.4/mod/core.html).

<pre class="lang-apacheconf">
# required only if default RabbitMQ virtual host is used
AllowEncodedSlashes On
</pre>

for the Apache virtual host. Apache needs both [mod_proxy](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html) and [mod_proxy_http](https://httpd.apache.org/docs/2.4/mod/mod_proxy_http.html) enabled. The location also needs a [`nocanon` setting](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html):

<pre class="lang-apacheconf">
ProxyPassReverse / http://rabbitmq-host:15672/
# "nocanon" is required only if default RabbitMQ virtual host is used
ProxyPass / http://rabbitmq-host:15672/ nocanon
</pre>

## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

There are several configuration options which affect the
management plugin. These are managed through the main
RabbitMQ [configuration file](configure.html#configuration-files).

It is possible to configure HTTP API and management UI to
use a different port or network interface, enable HTTPS
and so on.

While rarely needed, it is possible to configure multiple listeners (ports), e.g. to both enable HTTPS and
retain support for clients that can only use HTTP (without TLS).

### <a id="single-listener-port" class="anchor" href="#single-listener-port">Port</a>

The port is configured using the `management.tcp.port` key:

<pre class="lang-ini">
management.tcp.port = 15672
</pre>

It is possible to configure what interface the API endpoint will use, similarly
to [messaging protocol listeners](./networking.html#interfaces), using
the `management.tcp.ip` key:

<pre class="lang-ini">
management.tcp.ip = 0.0.0.0
</pre>

To check what interface and port is used by a running node, use
`rabbitmq-diagnostics`:

<pre class="lang-bash">
rabbitmq-diagnostics -s listeners
# => Interface: [::], port: 15672, protocol: http, purpose: HTTP API
# => Interface: [::], port: 15671, protocol: https, purpose: HTTP API over TLS (HTTPS)
</pre>

or [tools such as `lsof`, `ss` or `netstat`](troubleshooting-networking.html#ports).

### <a id="single-listener-https" class="anchor" href="#single-listener-https">HTTPS</a>

The management plugin can be configured to use HTTPS. See the guide [on TLS](ssl.html)
to learn more about certificate authorities, certificates and private key files.

<pre class="lang-ini">
management.ssl.port       = 15671
management.ssl.cacertfile = /path/to/ca_certificate.pem
management.ssl.certfile   = /path/to/server_certificate.pem
management.ssl.keyfile    = /path/to/server_key.pem
## This key must only be used if private key is password protected
# management.ssl.password   = bunnies
</pre>

More [TLS options](ssl.html) can be configured for the HTTPS listener.

<pre class="lang-ini">
management.ssl.port       = 15671
management.ssl.cacertfile = /path/to/ca_certificate.pem
management.ssl.certfile   = /path/to/server_certificate.pem
management.ssl.keyfile    = /path/to/server_key.pem
## This key must only be used if private key is password protected
# management.ssl.password   = bunnies

# For RabbitMQ 3.7.10 and later versions
management.ssl.honor_cipher_order   = true
management.ssl.honor_ecc_order      = true
management.ssl.client_renegotiation = false
management.ssl.secure_renegotiate   = true

management.ssl.versions.1 = tlsv1.2
management.ssl.versions.2 = tlsv1.1

management.ssl.ciphers.1 = ECDHE-ECDSA-AES256-GCM-SHA384
management.ssl.ciphers.2 = ECDHE-RSA-AES256-GCM-SHA384
management.ssl.ciphers.3 = ECDHE-ECDSA-AES256-SHA384
management.ssl.ciphers.4 = ECDHE-RSA-AES256-SHA384
management.ssl.ciphers.5 = ECDH-ECDSA-AES256-GCM-SHA384
management.ssl.ciphers.6 = ECDH-RSA-AES256-GCM-SHA384
management.ssl.ciphers.7 = ECDH-ECDSA-AES256-SHA384
management.ssl.ciphers.8 = ECDH-RSA-AES256-SHA384
management.ssl.ciphers.9 = DHE-RSA-AES256-GCM-SHA384

## Usually RabbitMQ nodes do not perform peer verification of HTTP API clients
## but it can be enabled if needed. Clients then will have to be configured with
## a certificate and private key pair.
##
## See https://www.rabbitmq.com/ssl.html#peer-verification for details.
# management.ssl.verify = verify_peer
# management.ssl.fail_if_no_peer_cert = true
</pre>

The above example in the [classic config format](./configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
 {rabbitmq_management,
  [
   {listener, [{port,     15671},
               {ssl,      true},
               {ssl_opts, [{cacertfile, "/path/to/ca_certificate.pem"},
                           {certfile,   "/path/to/server_certificate.pem"},
                           {keyfile,    "/path/to/server_key.pem"},

                           %% don't do peer verification to HTTPS clients
                           {verify,               verify_none},
                           {fail_if_no_peer_cert, false},

                           {client_renegotiation, false},
                           {secure_renegotiate,   true},
                           {honor_ecc_order,      true},
                           {honor_cipher_order,   true},

                           {versions,['tlsv1.1', 'tlsv1.2']},
                           {ciphers, ["ECDHE-ECDSA-AES256-GCM-SHA384",
                                      "ECDHE-RSA-AES256-GCM-SHA384",
                                      "ECDHE-ECDSA-AES256-SHA384",
                                      "ECDHE-RSA-AES256-SHA384",
                                      "ECDH-ECDSA-AES256-GCM-SHA384",
                                      "ECDH-RSA-AES256-GCM-SHA384",
                                      "ECDH-ECDSA-AES256-SHA384",
                                      "ECDH-RSA-AES256-SHA384",
                                      "DHE-RSA-AES256-GCM-SHA384"
                                      ]}
                           ]}
              ]}
  ]}
].
</pre>

### <a id="multiple-listeners" class="anchor" href="#multiple-listeners">Using HTTP and HTTPS Together</a>

It is possible to use both HTTP and HTTPS on different ports:

<pre class="lang-ini">
management.tcp.port       = 15672

management.ssl.port       = 15671
management.ssl.cacertfile = /path/to/ca_certificate.pem
management.ssl.certfile   = /path/to/server_certificate.pem
management.ssl.keyfile    = /path/to/server_key.pem
</pre>

The same configuration keys can be used to configure a single listener (just HTTP or HTTPS)
and match those used by the [Web STOMP](./web-stomp.html) and [Web MQTT](./web-mqtt.html).

### <a id="advanced-options" class="anchor" href="#advanced-options">Advanced HTTP Options</a>

[Cowboy](https://github.com/ninenines/cowboy), the embedded Web server used by
the management plugin, provides a number of options that can be used to customize the behavior of the server.
Most of the options were introduced in RabbitMQ 3.7.9.

#### Response Compression

Response compression is enabled by default. To enable it explicitly, use `management.tcp.compress`:

<pre class="lang-ini">
# For RabbitMQ 3.7.9 and later versions
management.tcp.compress = true
</pre>

#### Client Inactivity Timeouts

Some HTTP API endpoints respond quickly, others may need to return or stream
a sizeable data set to the client (e.g. many thousands of connections) or perform
an operation that takes time proportionally to the input (e.g. [import a large definitions file](definitions.html)).
In those cases the amount of time it takes to process the request can exceed certain
timeouts in the Web server as well as HTTP client.

It is possible to bump Cowboy timeouts using the `management.tcp.idle_timeout`,
`management.tcp.inactivity_timeout`, `management.tcp.request_timeout` options.

 * `management.tcp.inactivity_timeout` controls HTTP(S) client's TCP connection inactivity timeout.
   When it is reached, the connection will be closed by the HTTP server.
 * `management.tcp.request_timeout` controls the window of time in which the client has to send an HTTP
    request.
 * `management.tcp.idle_timeout` controls the window of time in which the client has to send more data (if any)
   within the context of an HTTP request.

If a load balancer or proxy is used between HTTP clients and the management HTTP server,
the `inactivity_timeout` and `idle_timeout` values should be at least as large, and often greater than,
the timeout and inactivity values used by the load balancer.

Here are some example configuration snippets that modify the timeouts:

<pre class="lang-ini">
# For RabbitMQ 3.7.9 and later versions.
#
# Configures HTTP (non-encrypted) listener timeouts
management.tcp.idle_timeout       = 120000
management.tcp.inactivity_timeout = 120000
management.tcp.request_timeout    = 10000
</pre>

<pre class="lang-ini">
# For RabbitMQ 3.7.9 and later versions.
#
# Configures HTTPS (TLS-enabled) listener timeouts
management.ssl.idle_timeout       = 120000
management.ssl.inactivity_timeout = 120000
management.ssl.request_timeout    = 10000
</pre>

All values are in milliseconds. Their defaults vary:

 * `management.tcp.inactivity_timeout` has the default of 300 seconds
 * `management.tcp.request_timeout` has the default of 60 seconds
 * `management.tcp.idle_timeout` has the default of 5 seconds

It is recommended that if the inactivity or idle timeout need changing,
`management.tcp.inactivity_timeout` value should match or be greater than that
of `management.tcp.idle_timeout`.

`management.tcp.request_timeout` typically does not need increasing as clients send a request
shortly after establishing a TCP connection.

### <a id="http-logging" class="anchor" href="#http-logging">HTTP Request Logging</a>

To create simple access logs of requests to the HTTP API,
set the value of the `management.http_log_dir` key to
the path of a directory in which logs can be created:

<pre class="lang-ini">
management.http_log_dir = /path/to/folder
</pre>

For the change to have an effect, restart the plugin or the node.

### <a id="statistics-interval" class="anchor" href="#statistics-interval">Statistics Interval</a>

By default the server will emit statistics events every
5 seconds (`5000` ms). The message rate values shown in the management
plugin are calculated over this period.

Increasing this value will reduce CPU resource consumption of
stats collection in environments with a large number of stats emitting
entities such as [connections](connections.html), [channels](channels.html), [queues](queues.html).

In order to do so, set the value of the `collect_statistics_interval` configuration key
to the desired interval in milliseconds and restart the node:

<pre class="lang-ini">
# 15s
collect_statistics_interval = 15000
</pre>


### <a id="rates-mode" class="anchor" href="#rates-mode">Message Rates</a>

The management plugin by default shows message rates
globally, and for each queue, channel, exchange, and
vhost. These are known as the *basic* message rates.

It can also show message rates for all the combinations of
channel to exchange, exchange to queue, and queue to
channel. These are known as *detailed* message rates.
Detailed message rates are disabled by default as they can
have a large memory footprint when there are a large
number of combinations of channels, queues and exchanges.

Alternatively, the message rates can be disabled
altogether. This can help get reduce CPU resource
consumption of the plugin.

The message rate mode is controlled by the
`management.rates_mode` configuration key:

<pre class="lang-ini">
# supported values: basic, detailed, none
management.rates_mode = basic
</pre>

Supported values are `basic` (the default), `detailed`, and `none`.

### <a id="sample-retention" class="anchor" href="#sample-retention">Sample (Data Point) Retention</a>

The management plugin will retain samples of some data
such as message rates and queue lengths. Depending on how long the
data is retained, some time
range options on UI charts may be incomplete or unavailable.

There are three policies:

 * `global`: how long to retain data for the overview and virtual host pages
 * `basic`: how long to retain data for individual connections, channels, exchanges and queues
 * `detailed`: how long to retain data for message rates between pairs of connections, channels, exchanges and queues (as shown under "Message rates breakdown")

Below is a configuration example:

<pre class="lang-ini">
management.sample_retention_policies.global.minute  = 5
management.sample_retention_policies.global.hour    = 60
management.sample_retention_policies.global.day = 1200

management.sample_retention_policies.basic.minute = 5
management.sample_retention_policies.basic.hour   = 60

management.sample_retention_policies.detailed.10 = 5
</pre>

The configuration in the example above retains global
data at a 5 second resolution (sampling happens every 5 seconds) for a minute,
then at a 1 minute (60 second) resolution for 1 hour, then at a 20 minute
resolution for one day. It retains basic data at a 5 second
resolution for 1 minute, at a 1 minute (60 second) resolution for
1 hour, and detailed data only for 10 seconds.

All three policies are mandatory, and must contain
at least one retention setting (period).

### <a id="disable-stats" class="anchor" href="#disable-stats">Disable Statistics and Metric Collection</a>

It is possible to disable the statistics in the UI and [HTTP API](#http-api) in order for these to be used only for operations. This can be a useful feature if external monitoring solutions such as [Prometheus and Grafana](./prometheus.html) are being used. If statistics are disabled in any of the following ways, all charts and detailed statistics will be hidden in the UI.

In order to completely disable the internal metrics collection, the `disable_metrics_collector` flag must be set in the `rabbitmq_management_agent` plugin.
The [Prometheus plugin](./prometheus.html) will still work even if collection is disabled.

<pre class="lang-ini">
management_agent.disable_metrics_collector = true
</pre>

Disabling the metrics collection is the preferred option if it is being used with an external monitoring system, as this reduced the overhead that statistics collection and aggregation causes in the broker. If the statistics are only temporary disabled, or are not required in some [HTTP API](#http-api) queries, the aggregation of the stats can be disabled in the `rabbitmq_management` plugin. The disable flag can be also passed as part of the query string in the URI.

As at the moment the [Prometheus plugin](./prometheus.html) cannot report individual queue totals, there is a configuration option that allows to list `messages`, `messages_ready` and `messages_unacknowledged` in the `queues` endpoint.

Below is a configuration example that disables the statistics but returns individual queue totals in the `queues` page:

<pre class="lang-ini">
management.disable_stats = true
management.enable_queue_totals = true
</pre>

### <a id="csp" class="anchor" href="#csp">Content Security Policy (CSP)</a>

It is possible to configure what [CSP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) value
is used by HTTP API responses. The default value is `script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'self'`:

<pre class="lang-ini">
management.csp.policy = script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'self'
</pre>

The value can be any valid CSP header string:

<pre class="lang-ini">
management.csp.policy = default-src https://rabbitmq.eng.example.local
</pre>

Wildcards are also allowed:

<pre class="lang-ini">
management.csp.policy = default-src 'self' *.eng.example.local
</pre>

A CSP policy [`frame-ancestors` directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors) can be used
to prevent frame embedding of the management UI, mitigating
certain types of cross-frame scripting attacks:

<pre class="lang-ini">
# prohibits iframe embedding of the UI
management.csp.policy = frame-ancestors 'none'
</pre>

### <a id="hsts" class="anchor" href="#hsts">Strict Transport Security (HSTS)</a>

It is possible to configure what [Strict Transport Security header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) value
is used by HTTP API responses:

<pre class="lang-ini">
management.hsts.policy = max-age=31536000; includeSubDomains
</pre>

### <a id="cors" class="anchor" href="#cors">Cross-origin Resource Sharing (CORS)</a>

The management UI application will by default refuse access to
websites hosted on origins different from its own using the [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) mechanism,
also known as CORS. It is possible to white list origins:

<pre class="lang-ini">
management.cors.allow_origins.1 = https://origin1.org
management.cors.allow_origins.2 = https://origin2.org
</pre>

It is possible to allow any origin to use the API using a wildcard.
This is <strong>highly discouraged</strong> for deployments where the UI
application may be exposed to the public.

<pre class="lang-ini">
management.cors.allow_origins.1 = *
</pre>

The CORS pre-flight requests are cached by the browser.
The management plugin defines a timeout of 30 minutes
by default. The value can be changed. It is configured in seconds:

<pre class="lang-ini">
management.cors.allow_origins.1 = https://origin1.org
management.cors.allow_origins.2 = https://origin2.org
management.cors.max_age         = 3600
</pre>

### <a id="other-security-headers" class="anchor" href="#other-security-headers">Other Security-related Headers</a>

It is possible to set a few more security-related headers for management UI and HTTP API responses.
Note that some of them have been superseded by CORS and other newer development in the
browser security space.

The supported headers are:

 * [`X-Frame-Options`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
 * [`X-Xss-Protection`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)
 * [`X-Content-Type-Options`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

<pre class="lang-ini">
management.headers.content_type_options = nosniff
management.headers.xss_protection = 1; mode=block
management.headers.frame_options = DENY
</pre>

They can be combined with the aforementioned CORS, HSTS, CSP headers:

<pre class="lang-ini">
management.hsts.policy = max-age=31536000; includeSubDomains
management.csp.policy = default-src 'self'; script-src 'self' 'unsafe-eval'

management.headers.content_type_options = nosniff
management.headers.xss_protection = 1; mode=block
management.headers.frame_options = DENY
</pre>

### <a id="login-session-timeout" class="anchor" href="#login-session-timeout">Login Session Timeout</a>

After the user logs in, the user's web UI login session will expire after 8 hours by default.
It is possible to configure a different timeout using the
`login_session_timeout` setting.

The value should be an integer: it controls the length of login
session in minutes. When the time is up, the user will be signed out.

The following example sets the session timeout to 1 hour:

<pre class="lang-ini">
management.login_session_timeout = 60
</pre>

### <a id="path-prefix" class="anchor" href="#path-prefix">Path Prefix</a>

Some environments require the use of a custom prefix for
all HTTP requests to the management plugin. The
`management.path_prefix` setting allows an arbitrary
prefix to be set for all HTTP request handlers in the
management plugin.

Setting `management.path_prefix` to `/my-prefix`
specifies all API requests to use the URI
`host:port/my-prefix/api/[...]`

The management UI login page will have the URI
`host:port/my-prefix/` - note that the
trailing slash is <em>required</em> in this case.

<pre class="lang-ini">
management.path_prefix = /my-prefix
</pre>

### <a id="example-config" class="anchor" href="#example-config">Example</a>

An example configuration file for RabbitMQ that switches
on request logging, increases the statistics interval to
10 seconds and explicitly sets some other relevant parameters
to their default values, would look like this:

<pre class="lang-ini">
listeners.tcp.default = 5672

collect_statistics_interval = 10000

## Note: this uses the core `load_definitions` key over
## now deprecated `management.load_definitions`
# load_definitions = /path/to/exported/definitions.json

management.tcp.port = 15672
management.tcp.ip   = 0.0.0.0

management.ssl.port       = 15671
management.ssl.ip         = 0.0.0.0
management.ssl.cacertfile = /path/to/ca_certificate.pem
management.ssl.certfile   = /path/to/server_certificate.pem
management.ssl.keyfile    = /path/to/server_key.pem

management.http_log_dir = /path/to/rabbit/logs/http

management.rates_mode = basic

# Configure how long aggregated data (such as message rates and queue
# lengths) is retained.
# Your can use 'minute', 'hour' and 'day' keys or integer key (in seconds)
management.sample_retention_policies.global.minute    = 5
management.sample_retention_policies.global.hour  = 60
management.sample_retention_policies.global.day = 1200

management.sample_retention_policies.basic.minute   = 5
management.sample_retention_policies.basic.hour = 60

management.sample_retention_policies.detailed.10 = 5
</pre>


## <a id="load-definitions" class="anchor" href="#load-definitions">Loading Definitions (Schema) at Startup</a>

Nodes and clusters store information that can be thought of schema, metadata or topology.
Users, vhosts, queues, exchanges, bindings, runtime parameters all fall into this category.

Definitions can be exported and imported via the [`rabbitmqctl`](./cli.html) or the HTTP API
provided by this plugin, including `rabbitmqadmin`.

Please refer to the [Definitions guide](./definitions.html).


## <a id="clustering" class="anchor" href="#clustering">Metrics Collection and HTTP API in Clusters</a>

### <a id="clustering-client-requests" class="anchor" href="#clustering-client-requests">Client Requests</a>

The management plugin is aware of clusters. It can be enabled
on one or more nodes in a cluster, and see information
pertaining to the entire cluster no matter which node you
connect to.

### <a id="clustering-subset-of-nodes" class="anchor" href="#clustering-subset-of-nodes">Running Management Plugin on a Subset of Nodes</a>

It is possible to deploy management plugin only on a subset of cluster nodes.
In that case only the nodes running the plugin would be able to serve client HTTP API requests.
For every cluster node to have its metrics collected, it is still required that the
`rabbitmq-management-agent` plugin is enabled on each node, otherwise
the metrics from the node won't be available.

### <a id="clustering-inter-node-connectivity" class="anchor" href="#clustering-inter-node-connectivity">Aggregation Queries in Clusters</a>

In cluster, HTTP API performs cluster-wide queries when handling client
requests, which means it can be affected by network partitions, network slowdowns,
and unresponsive nodes.

Timeouts for inter-node aggregation queries are controlled via the
[net tick mechanism](nettick.html). Lowering the value may help reduce
the delay introduced by nodes that have recently become unresponsive.
Values lower than 10s **can produce false positives and must be avoided**.

In contrast to the HTTP API, the [Prometheus monitoring endpoint](./prometheus.html) only serves
node-local data and is generally not affected by failures or unavailability of other nodes
in the cluster.


## <a id="proxy" class="anchor" href="#proxy">(Reverse HTTP) Proxy Setup</a>

It is possible to make the web UI available via any proxy that
conforms with RFC 1738. The following sample Apache configuration
illustrates the minimum necessary directives to coax Apache into
conformance. It assumes a management web UI on the default port of 15672:

<pre class="lang-ini">
AllowEncodedSlashes      NoDecode
ProxyPass         "/api" http://localhost:15672/api nocanon
ProxyPass         "/"    http://localhost:15672/
ProxyPassReverse  "/"    http://localhost:15672/
</pre>


## <a id="reset-stats" class="anchor" href="#reset-stats">Restarting Statistics Database</a>

Statistics database is stored entirely in memory. All of its contents
is transient and should be treated as such.

In modern versions, ach node has its own statistics database
containing a fraction of stats recorded on this node.

It is possible to restart the stats database on a given node using
`rabbitmqctl` or an HTTP API endpoint:

<pre class="lang-plaintext">
DELETE /api/reset/:node
</pre>

<pre class="lang-bash">
rabbitmqctl eval 'rabbit_mgmt_storage:reset().'
</pre>

To reset the entire statistics database on all nodes, use

<pre class="lang-plaintext">
DELETE /api/reset
</pre>

<pre class="lang-bash">
rabbitmqctl eval 'rabbit_mgmt_storage:reset_all().'
</pre>


## <a id="memory" class="anchor" href="#memory">Memory Usage Analysis and Memory Management</a>

Management UI can be used to inspect node's memory use, including displaying
a per-category breakdown. See the [Memory Use Analysis](memory-use.html) guide
for details.

Management database builds around periodically emitted stats,
regulated by the statistics interval described above, or when certain components are
created/declared (e.g. a new connection or channel is
opened, or a queue declared) or closed/deleted.  Message
rates do not directly affect management database memory
usage.

Total amount of memory consumed by the stats database
depends on the topology size (e.g. the number of queues), number of concurrent connections
and channels, event emission interval, effective rates mode and
retention policies.

Entities that emit stats (connections, channels, queues, nodes) do so periodically.
The interval can be configured using the `collect_statistics_interval` key:

<pre class="lang-ini">
# sets the interval to 30 seconds
collect_statistics_interval = 30000
</pre>

Increasing the interval value to 30-60s will reduce CPU footprint and peak memory
consumption for systems with large amounts of connections, channels and queues.
This comes with a downside: metrics of said entities will refresh every 30-60 seconds.
This can be perfectly reasonable in an [externally monitored](./monitoring.html#monitoring-frequency) production system
but will make management UI less convenient to use for operators.

The memory usage of the channel and stats collector processes can be limited
by setting the maximum backlog queue size using the parameter
`stats_event_max_backlog`. If the backlog queue is full, new channel
and queue stats will be dropped until the previous ones have been processed.

The statistics interval can also be changed at runtime. Doing so will have no
effect on existing connections, channels or queues. Only new stats
emitting entities are affected.

<pre class="lang-bash">
rabbitmqctl eval 'application:set_env(rabbit, collect_statistics_interval, 60000).'
</pre>

The statistics database can be restarted (see above) and thus forced to release all memory.
Management UI's Overview page contains buttons that reset stats database for individual nodes as well as
all nodes in the cluster.


## <a id="publishing-consuming" class="anchor" href="#publishing-consuming">Publishing and Consuming over HTTP API</a>

It is possible to publish and consume messages using the [HTTP API](#http-api).
This way of messaging is discouraged: prefer one of the binary messaging protocols supported
by RabbitMQ. Publishing and consuming that way will be significantly more efficient and will
provide access to various messaging protocol features such as [confirmations](./confirms.html).

Publishing over HTTP API can be useful in environments where
[long lived messaging protocol connections](connections.html) is not an option.
