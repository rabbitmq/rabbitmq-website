<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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
for management and monitoring of RabbitMQ nodes and clusters, along
with a browser-based UI and a command line tool, [rabbitmqadmin](management-cli.html).


It periodically collects and aggregates data about many aspects of the system. Those metrics
are exposed to both operators in the UI and [monitoring systems](/monitoring.html) for
long term storage, alerting, visualisation, chart analysis and so on.


The plugin can be [configured](#configuration) to [use HTTPS](#single-listener-https),
a non-standard port, path prefix, HTTP server options, custom [strict transport security](#hsts) settings,
[cross-origin resource sharing](#cors), and more.


It also provides tools for [analyse memory usage](#memory) of the node,
for [preconfiguring the node](#load-definitions) using an exported schema definitions file, and a few
other features related to monitoring, metrics and node management.


In a multi-node cluster, management plugin is most commonly [enabled on every node](#clustering).


The plugin also provides extension points that other plugins, such as
[rabbitmq-top](https://github.com/rabbitmq/rabbitmq-top) or
[rabbitmq-shovel-management](https://github.com/rabbitmq/rabbitmq-shovel-management)
use to extend the UI.


## <a id="getting-started" class="anchor" href="#getting-started">Getting Started</a>

The management plugin is included in the RabbitMQ
distribution. Like any other [plugin](/plugins.html), it must
be enabled before it can be used. That's done using [rabbitmq-plugins](man/rabbitmq-plugins.8.html):

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_management
</pre>

Node restart is not required after plugin activation.

During automated deployments, the plugin can be enabled via
[enabled plugin file](/plugins.html#enabled-plugins-file).


## <a id="usage" class="anchor" href="#usage">Usage</a>

### <a id="usage-ui" class="anchor" href="#usage-ui">Management UI Access</a>

The management UI can be accessed using a Web browser at <code>http://<i>{node-hostname}</i>:15672/</code>. For example,
for a node running on a machine with the hostname of `warp10.local`,
it can be accessed at either `http://warp10.local:15672/`
or `http://localhost:15672/` (provided that `localhost` resolves correctly).

Note that the UI and HTTP API port — typically 15672 — does not support AMQP 0-9-1, AMQP 1.0, STOMP or MQTT connections.
[Separate ports](/networking.html#ports) should be used by those clients.

Users must be [granted permissions](#permissions) for management UI access.

### <a id="usage-highlights" class="anchor" href="#usage-highlights">Notable Features</a>

The management UI is implemented as a single page application which relies on the [HTTP API](#http-api).
Some of the features include:

<ul>
  <li>
    Declare, list and delete exchanges, <a href="/queues.html">queues</a>, bindings,
    users, <a href="/vhosts.html">virtual hosts</a> and <a href="/access-control.html">user permissions</a>.
  </li>
  <li>
    Monitor queue length, message rates (globally and per queue, exchange or channel), resource usage of queue,
    node GC activity, data rates of client connections, and more.
  </li>
  <li>
    Monitor node resource use: <a href="/networking.html#open-file-handle-limit">sockets and file descriptors</a>,
    <a href="/memory-use.html">memory usage breakdown</a>, available disk space and bandwidth usage on inter-node communication
    links.
  </li>
  <li>
    Manage users (provided administrative permissions of the current user).
  </li>
  <li>
    Manage <a href="/parameters.html">policies and runtime parameters</a> (provided sufficient permissions of the current user).
  </li>
  <li>
    <a href="/backup.html">Export schema</a> (vhosts, users, permissions, queues, exchanges, bindings, parameters,
    policies) and <a href="#load-definitions">import it on node start</a>. This can be used for <a href="/backup.html">recovery purposes</a>
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

The UI application supports recent versions of Google Chrome Safari, Firefox, and Microsoft Edge browsers.

### <a id="usage-ui-clusters" class="anchor" href="#usage-ui-clusters">Management UI Access in Clusters</a>

Any cluster node with `rabbitmq-management` plugin enabled can be
used for management UI access or data collection by monitoring tools.
It will reach out to other nodes and collect their stats, then aggregate and return a response
to the client.

To access management UI the user has to authenticate and have certain permissions (be authorised).
This is covered in the [following section](#permissions).


## <a id="permissions" class="anchor" href="#permissions">Access and Permissions</a>

The management UI requires [authentication and authorisation](access-control.html), much like RabbitMQ requires
it from connecting clients. In addition to successful authentication, management UI access is controlled by user tags.
The tags are managed using [rabbitmqctl](/rabbitmqctl.8.html#set_user_tags).
Newly created users do not have any tags set on them by default.

<table>
  <tr>
    <th>Tag</th>
    <th>Capabilities</th>
  </tr>
  <tr>
    <td>(None)</td>
    <td>
      No access to the management plugin
    </td>
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

Normal RabbitMQ [permissions to resources](/access-control.html) still apply to monitors and
administrators; just because a user is a monitor or
administrator does not grant them full access to exchanges,
queues and bindings through the management
plugin or other means.

All users can only list objects within the virtual
hosts they have any permissions for.

If access to management UI is impossible to due the lack of users
with sufficient permissions or forgotten/incorrect permissions, [CLI tools](/cli.html) must
be used to manage the users and their credentials. [rabbitmqctl add_user](/man/rabbitmqctl.8.html#)
should be used to create a user, [rabbitmqctl set_permissions](/man/rabbitmqctl.8.html#) to grant the
user the desired permissions and finally, [rabbitmqctl
set_user_tags](/man/rabbitmqctl.8.html#set_user_tags) should be used to give the user management UI access permissions.

### <a id="cli-examples" class="anchor" href="#cli-examples">Command Line Examples</a>

The following example creates a user with complete access to the management UI/HTTP API (as in,
all virtual hosts and management features):

<pre class="lang-bash">
# create a user
rabbitmqctl add_user full_access s3crEt
# tag the user with "administrator" for full management UI and HTTP API access
rabbitmqctl set_user_tags full_access administrator
</pre>



## <a id="http-api" class="anchor" href="#http-api">HTTP API</a>

### <a id="http-api-endpoints" class="anchor" href="#http-api-endpoints">API Endpoints</a>

When activated, the management plugin provides an HTTP API at
<code>http://<i>server-name</i>:15672/api/</code> by default. Browse to that
location for more information on the API. For convenience the same API reference is
[
available from GitHub](https://cdn.rawgit.com/rabbitmq/rabbitmq-management/&version-server-tag;/priv/www/api/index.html).

### <a id="http-api-monitoring" class="anchor" href="#http-api-monitoring">HTTP API and Monitoring</a>

The API is intended to be used for monitoring and alerting purposes. It provides
access to detailed information about the state of nodes, connections, channels, queues,
consumers, and so on.

Any cluster node with `rabbitmq-management` plugin enabled can be
used for management UI access or data collection by monitoring tools.
It will reach out to other nodes and collect their stats, then aggregate and return a response
to the client.

When monitoring a cluster of nodes, there is no need to contact each node via HTTP API
individually. Instead, contact a random node or a load balancer that sits in front
of the cluster.

### <a id="http-api-clients" class="anchor" href="#http-api-clients">HTTP API Clients and Tooling</a>

[rabbitmqadmin](management-cli.html) is a Python command  line tool
that interacts with the HTTP API. It can be downloaded from any RabbitMQ node that
has the management plugin enabled at <code>http://<i>{node-hostname}</i>:15672/cli/</code>.

For HTTP API clients in several languages,
see [Developer Tools](/devtools.html).

Some API endpoints return a lot of information. The volume can be reduced
by filtering what columns are returned by `HTTP GET` requests. See
[
latest HTTP API documentation](https://cdn.rawgit.com/rabbitmq/rabbitmq-management/&version-server-tag;/priv/www/api/index.html) for details.


## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

There are several configuration options which affect the
management plugin. These are managed through the main
RabbitMQ [configuration file](configure.html#configuration-file).

It is possible to configure HTTP API and management UI to
use a different port or network interface, enable HTTPS
and so on.

While rarely needed, it is possible to configure multiple listeners (ports), e.g. to both enable HTTPS and
retain support for clients that can only use HTTP (without TLS). This uses an alternative
set of configuration keys and available starting with RabbitMQ 3.7.9.


### <a id="single-listener-port" class="anchor" href="#single-listener-port">Port</a>

The port is configured using the `management.listener.port` key:

<pre class="lang-ini">
management.listener.port = 15672
</pre>

Or, using the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
  {rabbitmq_management, [{listener, [{port, 15672}]}]},
].
</pre>

### <a id="single-listener-https" class="anchor" href="#single-listener-https">HTTPS</a>

The management plugin can be configured to use HTTPS. See the guide [on TLS](/ssl.html)
to learn more about certificate authorities, certificates and private key files.

<pre class="lang-ini">
management.ssl.port       = 15671
management.ssl.cacertfile = /path/to/ca_certificate.pem
management.ssl.certfile   = /path/to/server_certificate.pem
management.ssl.keyfile    = /path/to/server_key.pem
</pre>

HTTP listener can also be configured using the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[{rabbitmq_management,
  [{listener, [{port,     15671},
               {ssl,      true},
               {ssl_opts, [{cacertfile, "/path/to/ca_certificate.pem"},
                           {certfile,   "/path/to/server_certificate.pem"},
                           {keyfile,    "/path/to/server_key.pem"}]}
              ]}
  ]}
].</pre>


More [TLS options](/ssl.html) can be configured for the HTTPS listener.

<pre class="lang-ini">
management.ssl.port       = 15671
management.ssl.cacertfile = /path/to/ca_certificate.pem
management.ssl.certfile   = /path/to/server_certificate.pem
management.ssl.keyfile    = /path/to/server_key.pem

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
</pre>

The above example in the [classic config format](/configure.html#erlang-term-config-file):

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
and match those used by the [Web STOMP](/web-stomp.html) and [Web MQTT](/web-mqtt.html).

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

<pre class="lang-ini">
# For versions older than 3.7.9
management.listener.server.compress = true
</pre>

Using the classic config format:

<pre class="lang-erlang">
%% For RabbitMQ 3.7.9 and later versions
[{rabbitmq_management,
  [{tcp_config, [{port,        15672},
                 {cowboy_opts, [{compress, true}]}
                ]}
  ]}
].
</pre>

#### Client Inactivity Timeouts

Some HTTP API endpoints respond quickly, others may need to return or stream
a sizeable data set to the client (e.g. many thousands of connections) or perform
an operation that takes time proportionally to the input (e.g. [import a large definitions file](http://www.rabbitmq.com/management.html#load-definitions)).
In those cases the amount of time it takes to process the request can exceed certain
timeouts in the Web server as well as HTTP client.

It is possible to bump Cowboy timeouts using the `management.tcp.idle_timeout`,
`management.tcp.inactivity_timeout`, `management.tcp.request_timeout` options:

<pre class="lang-ini">
# For RabbitMQ 3.7.9 and later versions.
#
# Configures HTTP (non-encrypted) listener,
# sets all types of timeouts to 120 seconds
management.tcp.idle_timeout       = 120000
management.tcp.inactivity_timeout = 120000
management.tcp.request_timeout    = 120000
</pre>

<pre class="lang-ini">
# For RabbitMQ 3.7.9 and later versions.
#
# Configures HTTPS (TLS-enabled) listener,
# sets all types of timeouts to 120 seconds
management.ssl.idle_timeout       = 120000
management.ssl.inactivity_timeout = 120000
management.ssl.request_timeout    = 120000
</pre>

In the classic config format:

<pre class="lang-erlang">
%% For RabbitMQ 3.7.9 and later versions.
%%
%% Configures HTTP (non-encrypted) listener,
%% sets all types of timeouts to 120 seconds
[{rabbitmq_management,
  [{tcp_config, [{port,        15672},
                 {cowboy_opts, [{idle_timeout,      120000},
                                {inactivity_timeout,120000},
                                {request_timeout,   120000}]}
                ]}
  ]}
].
</pre>

<pre class="lang-erlang">
%% For RabbitMQ 3.7.9 and later versions.
%%
%% Configures HTTPS (TLS-enabled) listener,
%% sets all types of timeouts to 120 seconds
[{rabbitmq_management,
  [{ssl_config, [{port,        15672},
                 {cowboy_opts, [{idle_timeout,      120000},
                                {inactivity_timeout,120000},
                                {request_timeout,   120000}]}
                ]}
  ]}
].
</pre>

All values are in milliseconds and default to `60000` (1 minute). It is recommended that
if timeouts need to be changed, all of them are increased at the same time.

### <a id="http-logging" class="anchor" href="#http-logging">HTTP Request Logging</a>

To create simple access logs of requests to the HTTP API,
set the value of the `http_log_dir` variable in
the `rabbitmq_management` application to the name
of a directory in which logs can be created and restart
RabbitMQ.

<pre class="lang-ini">
management.http_log_dir = /path/to/folder
</pre>

Or using the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
  {rabbitmq_management, [{http_log_dir, "/path/to/folder"}]}
].
</pre>

### <a id="statistics-interval" class="anchor" href="#statistics-interval">Statistics Interval</a>

By default the server will emit statistics events every
5000ms. The message rate values shown in the management
plugin are calculated over this period. You may therefore
want to increase this value in order to sample rates over
a longer period, or to reduce the statistics load on a
server with a very large number of queues or channels.

In order to do so, set the value of
the `collect_statistics_interval` variable for
the `rabbit` application to the desired
interval in milliseconds and restart RabbitMQ.


### <a id="fine-stats" class="anchor" href="#fine-stats">Message Rates</a>

The management plugin by default shows message rates
globally, and for each queue, channel, exchange, and
vhost. These are known as the <i>basic</i> message rates.

It can also show message rates for all the combinations of
channel to exchange, exchange to queue, and queue to
channel. These are known as <i>detailed</i> message rates.
Detailed message rates are disabled by default as they can
have a large memory footprint when there are a large
number of combinations of channels, queues and exchanges.

Alternatively, the message rates can be disabled
altogether. This can help get the best possible
performance out of a CPU-bound server.

The message rate mode is controlled by the
`rates_mode` configuration variable in
`rabbitmq_management`. This can be one of
`basic` (the default), `detailed` or
`none`.

### <a id="max-backlog" class="anchor" href="#max-backlog">Event Backlog</a>

Under heavy load, the processing of statistics events can
increase the memory consumption. To reduce this,
the maximum backlog size of the channel and queue statistics
collectors can be regulated. The value of the
`stats_event_max_backlog` variable in
the `rabbitmq_management` application sets
the maximum size of both backlogs. Defaults to 250.

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

### <a id="csp" class="anchor" href="#csp">Content Security Policy (CSP)</a>

It is possible to configure what [CSP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) value
is used by HTTP API responses. The default value is `default-src 'self'`:

<pre class="lang-ini">
management.csp.policy = default-src 'self'
</pre>

The value can be any valid CSP header string:

<pre class="lang-ini">
management.csp.policy = default-src https://rabbitmq.eng.example.local
</pre>

In the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
{rabbitmq_management, [
  {content_security_policy,
    "management.csp.policy = default-src https://rabbitmq.eng.example.local"}
]}.</pre>

Wildcards are also allowed:

<pre class="lang-ini">
management.csp.policy = default-src 'self' *.eng.example.local
</pre>

In the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
{rabbitmq_management, [
  {content_security_policy,
    "management.csp.policy = default-src 'self' *.eng.example.local"}
]}.</pre>

### <a id="hsts" class="anchor" href="#hsts">Strict Transport Security (HSTS)</a>

It is possible to configure what [Strict Transport Security header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) value
is used by HTTP API responses:

<pre class="lang-ini">
management.hsts.policy = max-age=31536000; includeSubDomains
</pre>

In the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
rabbitmq_management, [
  {strict_transport_security, "max-age=31536000; includeSubDomains"}
]}.</pre>

### <a id="cors" class="anchor" href="#cors">Cross-origin Resource Sharing (CORS)</a>

The management UI application will by default refuse access to
websites hosted on origins different from its own using the [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) mechanism,
also known as CORS. It is possible to white list origins:

<pre class="lang-ini">
management.cors.allow_origins.1 = https://origin1.org
management.cors.allow_origins.2 = https://origin2.org
</pre>

In the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
  {rabbitmq_management,
    [{cors_allow_origins, ["https://origin1.org", "https://origin2.org"]}]},
].</pre>

It is possible to allow any origin to use the API using a wildcard.
This is <strong>highly discouraged</strong> for deployments where the UI
application may be exposed to the public.

<pre class="lang-ini">
management.cors.allow_origins.1 = *
</pre>

In the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
  {rabbitmq_management,
    [{cors_allow_origins, ["*"]}]},
].</pre>

The CORS pre-flight requests are cached by the browser.
The management plugin defines a timeout of 30 minutes
by default. The value can be changes. It is configured in seconds:

<pre class="lang-ini">
management.cors.allow_origins.1 = https://origin1.org
management.cors.allow_origins.2 = https://origin2.org
management.cors.max_age         = 3600
</pre>

In the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
  {rabbitmq_management,
    [{cors_allow_origins, ["https://origin1.org", "https://origin2.org"]},
     {cors_max_age, 3600}]},
].</pre>

### <a id="login-session-timeout" class="anchor" href="#login-session-timeout">Login Session Timeout</a>

After the user logs in, her web UI login session will expire after 8 hours by default.
It is possible to configure a different timeout using the
`login_session_timeout` setting.

The value should be an integer: it controls the length of login
session in minutes. When the time is up, the user will be signed out.

The following example sets the session timeout to 1 hour:

<pre class="lang-ini">
management.login_session_timeout = 60
</pre>

Or, using the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">[
  %% ...
  {rabbitmq_management,
    [{login_session_timeout, 60}]},
  %% ...
].</pre>

### <a id="path-prefix" class="anchor" href="#path-prefix">Path Prefix</a>

Some environments require the use of a custom prefix for
all HTTP requests to the management plugin. The
`path_prefix` setting allows an arbitrary
prefix to be set for all HTTP request handlers in the
management plugin.

Setting `path_prefix` to `/my-prefix`
specifies all API requests to use the URI
`host:port/my-prefix/api/[...]`

The management UI login page will have the URI
`host:port/my-prefix/` - note that the
trailing slash is <em>required</em> in this case.

<pre class="lang-erlang">[
  %% ...
  {rabbitmq_management,
    [{path_prefix, "/my-prefix"}]},
  %% ...
].</pre>

### <a id="example-config" class="anchor" href="#example-config">Example</a>

An example configuration file for RabbitMQ that switches
on request logging, increases the statistics interval to
10 seconds and explicitly sets some other relevant parameters
to their default values, would look like this:

<pre class="lang-ini">
listeners.tcp.default = 5672

collect_statistics_interval = 10000

# management.load_definitions = /path/to/exported/definitions.json

management.listener.port = 15672
management.listener.ip   = 0.0.0.0
management.listener.ssl  = true

management.listener.ssl_opts.cacertfile = /path/to/ca_certificate.pem
management.listener.ssl_opts.certfile   = /path/to/server_certificate.pem
management.listener.ssl_opts.keyfile    = /path/to/server_key.pem

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

Or, using the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">[
{rabbit, [{tcp_listeners,               [5672]},
          {collect_statistics_interval, 10000}]},

{rabbitmq_management,
  [
   %% Pre-Load schema definitions from the following JSON file.
   %%
   %% {load_definitions, "/path/to/definitions.json"},

   %% Log all requests to the management HTTP API to a directory.
   %%
   {http_log_dir, "/path/to/rabbit/logs/http"},

   %% Change the port on which the HTTP listener listens,
   %% specifying an interface for the HTTP server to bind to.
   %% Also set the listener to use TLS and provide TLS options.
   %%
   %% {listener, [{port,     15672},
   %%             {ip,       "0.0.0.0"},
   %%             {ssl,      true},
   %%             {ssl_opts, [{cacertfile, "/path/to/ca_certificate.pem"},
   %%                         {certfile,   "/path/to/server_certificate.pem"},
   %%                         {keyfile,    "/path/to/server_key.pem"}]}]},

   %% One of 'basic', 'detailed' or 'none'.
   {rates_mode, basic},

   %% increasing this parameter will make HTTP API cache data retrieved
   %% from other cluster peers more aggressively
   %% {management_db_cache_multiplier, 5},

   %% If event collection falls back behind stats emission,
   %% up to this many events will be kept in the backlog, the rest
   %% will be dropped to avoid runaway memory consumption growth.
   %% This setting is per-node. Unless there is evidence of
   %% a stats collector backlog, you don't need to change this value.
   %% {stats_event_max_backlog, 250},

   %% CORS settings for HTTP API
   %% {cors_allow_origins, ["https://rabbitmq.eng.megacorp.local", "https://monitoring.eng.megacorp.local"]},
   %% {cors_max_age, 1800},

   %% Configure how long aggregated data (such as message rates and queue
   %% lengths) is retained.
   %%
   %% {sample_retention_policies,
   %%  [{global,   [{60, 5}, {3600, 60}, {86400, 1200}]},
   %%   {basic,    [{60, 5}, {3600, 60}]},
   %%   {detailed, [{10, 5}]}]}
  ]}
].</pre>


## <a id="load-definitions" class="anchor" href="#load-definitions">Loading Definitions (Schema) at Startup</a>

It is possible to export a definitions file over HTTP API or in management UI.
A definition file contains definitions of all broker objects (queues,
exchanges, bindings, users, virtual hosts, permissions and
parameters). Then the file can be imported on node start, providing a way
to preconfigure the node with virtual hosts, users, permissions, policies, queues,
exchanges, bindings and so on.


To import definitions from a local file on node boot,
set the `management.load_definitions` (`rabbitmq_management.load_definitions`
in the classic config format) config key
to the path of a previously exported JSON file containing
the definitions you want:

<pre class="lang-ini">
management.load_definitions = /path/to/definitions/file.json
</pre>

Using the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">[
{rabbitmq_management, [
  {load_definitions, "/path/to/definitions/file.json"}
  ]}
].</pre>

Note that the definitions in the file will overwrite
anything already in the broker; using this option will not
delete anything that is already there. However, if you
start from a completely reset broker, use of this
option <strong>will</strong> prevent the usual default user /
virtual host / permissions from being created.


## <a id="clustering" class="anchor" href="#clustering">Metrics Collection and HTTP API in Clusters</a>

### <a id="clustering-client-requests" class="anchor" href="#clustering-client-requests">Client Requests</a>

The management plugin is aware of clusters. It can be enabled
on one or more nodes in a cluster, and see information
pertaining to the entire cluster no matter which node you
connect to.

### <a id="clustering-subset-of-nodes" class="anchor" href="#clustering-subset-of-nodes">Running Management Plugin on a Subset of Nodes</a>

It is possible deploy management plugin only on a subset of cluster nodes.
In that case only the nodes running the plugin would be able to serve client HTTP API requests.
For every cluster node to have its metrics collected, it is still required that the
`rabbitmq-management-agent` plugin is enabled on each node, otherwise
the metrics from the node won't be available.

### <a id="clustering-inter-node-connectivity" class="anchor" href="#clustering-inter-node-connectivity">Client Requests</a>

In cluster, HTTP API performs cluster-wide queries when handling client
requests, which means it can be affected by network partitions and slow downs.
Timeouts for inter-node aggregation queries are controlled via the
[net tick mechanism](nettick.html).


## <a id="proxy" class="anchor" href="#proxy">(Reverse HTTP) Proxy Setup</a>

It is possible to make the web UI available via any proxy that
conforms with RFC 1738. The following sample Apache configuration
illustrates the minimum necessary directives to coax Apache into
conformance. It assumes a management web UI on the default port of 15672:

<pre class="lang-ini">
On
ProxyPass        /api http://localhost:15672/api nocanon
ProxyPass        /    http://localhost:15672/
ProxyPassReverse /    http://localhost:15672/
</pre>


## <a id="stats-db" class="anchor" href="#stats-db">Restarting Statistics Database</a>

Statistics database is stored entirely in memory. All of its contents
is transient and should be treated as such.

Prior to version 3.6.7 stats database is stored on a single node.

Starting from version 3.6.7, each node has its own statistics database
containing a fraction of stats recorded on this node.

It is possible to restart the stats database.

The statistics database is stored in the memory of the stats process
previously to RabbitMQ 3.6.2, and stored in ETS tables from RabbitMQ
3.6.2. To restart the database with versions earlier than 3.6.2, use

<pre class="lang-bash">
rabbitmqctl eval 'exit(erlang:whereis(rabbit_mgmt_db), please_terminate).'
</pre>

Starting with RabbitMQ 3.6.7, the database can be reset per node using
<pre class="lang-bash">
rabbitmqctl eval 'rabbit_mgmt_storage:reset().'
</pre>

To reset entire management database on all nodes
<pre class="lang-bash">
rabbitmqctl eval 'rabbit_mgmt_storage:reset_all().'
</pre>

There is also HTTP API endpoints to reset a database
For entire database
<pre class="sourcecode">
DELETE /api/reset
</pre>

For a single node
<pre class="sourcecode">
DELETE /api/reset/:node
</pre>


## <a id="memory" class="anchor" href="#memory">Memory Usage Analysis and Memory Management</a>

Management UI can be used to inspect node's memory use, including displaying
a per-category breakdown. See the [Memory Use Analysis](/memory-use.html) guide
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

Increasing the `rabbit.collect_statistics_interval` value to 30-60s (note: the value should
be set in milliseconds, e.g. `30000`) will reduce memory
comsuption for systems with large amounts of queues/channels/connections.
Adjusting retention policies to retain less data will also help.

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
This ways of messaging is discouraged: prefer one of the binary messaging protocols supported
by RabbitMQ. Publishing and consuming that way will be significantly more efficient and will
provide access to various messaging protocol features such as [confirmations](/confirms.html).

Publishing over HTTP API can be useful in environments where
[long lived messaging protocol connections](/connections.html) is not an option.
