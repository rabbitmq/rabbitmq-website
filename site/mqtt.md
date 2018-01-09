<!--
Copyright (c) 2007-2016 Pivotal Software, Inc.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License”); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# RabbitMQ MQTT Adapter NOSYNTAX

RabbitMQ supports MQTT as of 3.0 (currently targeting version 3.1.1 of the spec).

## <a id="smf"/> Supported MQTT 3.1.1 features

* QoS0 and QoS1 publish & consume
* QoS2 publish (downgraded to QoS1)
* Last Will and Testament (LWT)
* TLS/SSL
* Session stickiness
* Retained messages with pluggable storage backends

MQTT clients can interoperate with other protocols. All the functionality in
the [management UI](/management.html) and several other clients can be
used with MQTT, although there may be some limitations or the need to
tweak the defaults.

## <a id="ifb"/>Enabling the Plugin

The MQTT adapter is included in the RabbitMQ distribution. Before clients can successfully
connect, it must be enabled using [rabbitmq-plugins](/man/rabbitmq-plugins.8.html):

<pre class="sourcecode bash">
rabbitmq-plugins enable rabbitmq_mqtt
</pre>

Now that the plugin is enabled, MQTT clients will be able to connect provided that
they have a set of credentials for an existing user with the appropriate permissions.

### <a id="authentication"/> Users and Authentication

MQTT clients can (and usually do) specify a set of credentials when they connect.

Users and their permissions can be managed using [rabbitmqctl](/cli.html), [management UI](/management.html)
or HTTP API.

For example, the following commands create a new user for MQTT connections with full access
to the default [virtual host](/vhosts.html) used by this plugin:

<pre class="sourcecode bash">
# username and password are both "mqtt-test"
rabbitmqctl add_user mqtt-test mqtt-test
rabbitmqctl set_permissions -p / mqtt-test ".*" ".*" ".*"
rabbitmqctl set_user_tags mqtt-test management
</pre>

For an MQTT connection to succeed, it must successfully authenticate and the user must
have the [appropriate permissions](/access-control.html) to the virtual host used by the
plugin (see below).

The plugin supports anonymous authentication but its use is highly discouraged and is a subject
to certain limitations (listed below) enforced for a reasonable level of security
by default.


## Local vs. Remote Client Connections

When an MQTT client provides no login credentials, the plugin uses the
`guest` account by default which will not allow non-`localhost`
connections. When connecting from a remote host, here are the options
that make sure remote clients can successfully connect:

 * Create one or more new user(s), grant them full permissions to the virtual host used by the MQTT plugin and make clients
   that connect from remote hosts use those credentials
 * Set `default_user` and `default_pass` via [MQTT plugin configuration](#config) to a non-`guest` user who has the
[appropriate permissions](/access-control.html)


### Anonymous Connections

The `default_user` and `default_pass` options are used to authenticate
the adapter in case MQTT clients provide no login credentials. If the
`allow_anonymous` option is set to `false` then clients MUST provide credentials.
The presence of client-supplied credentials over the network overrides
the `allow_anonymous` option. Colons may not appear in usernames.


## <a id="overview"/> How it Works

RabbitMQ MQTT plugin targets MQTT 3.1.1 and supports a broad range
of MQTT clients. It also makes it possible for MQTT clients to interoperate
with [AMQP 0-9-1, AMQP 1.0, and STOMP](https://www.rabbitmq.com/protocols.html) clients.
There is also support for multi-tenancy.

The plugin builds on top of RabbitMQ core protocol's entities: exchanges and queues. Messages published
to MQTT topics use a topic exchange (`amq.topic` by default) internally. Subscribers consume from
RabbitMQ queues bound to the topic exchange. This both enables interoperability
with other protocols and makes it possible to use the [Management plugin](/management.html)
to inspect queue sizes, message rates, and so on.

Note that MQTT uses slashes ("/") for topic segment separators and
AMQP 0-9-1 uses dots.  This plugin translates patterns under the hood
to bridge the two, for example, `cities/london` becomes
`cities.london` and vice versa. This has one important limitation:
MQTT topics that have dots in them won't work as expected and are to
be avoided, the same goes for AMQP 0-9-1 routing keys that contains
slahes.


### <a id="durability"/> Subscription Durability

MQTT 3.1 assumes two primary usage scenarios:

 * Transient clients that use transient (non-persistent) messages
 * Stateful clients that use durable subscriptions (non-clean sessions, QoS1)

This section briefly covers how these scenarios map to RabbitMQ queue durability and persistence
features.

Transient (QoS0) subscription use non-durable, auto-delete queues
that will be deleted when the client disconnects.

Durable (QoS1) subscriptions use durable queues. Whether the queues are
auto-deleted is controlled by the client's clean session flag. Clients with
clean sessions use auto-deleted queues, others use non-auto-deleted ones.

For transient (QoS0) publishes, the plugin will publish messages as transient
(non-persistent). Naturally, for durable (QoS1) publishes, persistent
messages will be used internally.

Queues created for MQTT subscribers will have names starting with `mqtt-subscription-`,
one per subscription QoS level. The queues will have [queue TTL](/ttl.html) depending
on MQTT plugin configuration, 24 hours by default.

**RabbitMQ does not support QoS2 subscriptions**. RabbitMQ
automatically downgrades QoS 2 publishes and subscribes to QoS
1. Messages published as QoS 2 will be sent to subscribers as QoS 1.
Subscriptions with QoS 2 will be downgraded to QoS1 during SUBSCRIBE
request (SUBACK responses will contain the actually provided QoS
level).


## <a id="config"/> Plugin Configuration

Here is a sample <a href="/configure.html#config-file">configuration</a> that sets (almost) every MQTT plugin setting provided:

<pre class="sourcecode ini">
listeners.tcp.default = 5672
mqtt.default_user     = guest
mqtt.default_pass     = guest
mqtt.allow_anonymous  = true
mqtt.vhost            = /
mqtt.exchange         = amq.topic
# 24 hours by default
mqtt.subscription_ttl = 86400000
mqtt.prefetch         = 10
mqtt.listeners.ssl    = none
## Default MQTT with TLS port is 8883
# mqtt.listeners.ssl.default = 8883
mqtt.listeners.tcp.default = 1883
mqtt.tcp_listen_options.backlog = 128
mqtt.tcp_listen_options.nodelay = true
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[{rabbit,        [{tcp_listeners,    [5672]}]},
 {rabbitmq_mqtt, [{default_user,     &lt;&lt;"guest"&gt;&gt;},
                  {default_pass,     &lt;&lt;"guest"&gt;&gt;},
                  {allow_anonymous,  true},
                  {vhost,            &lt;&lt;"/"&gt;&gt;},
                  {exchange,         &lt;&lt;"amq.topic"&gt;&gt;},
                  {subscription_ttl, 1800000},
                  {prefetch,         10},
                  {ssl_listeners,    []},
                  %% Default MQTT with TLS port is 8883
                  %% {ssl_listeners,    [8883]}
                  {tcp_listeners,    [1883]},
                  {tcp_listen_options, [{backlog,   128},
                                        {nodelay,   true}]}]}
].
</pre>


### Virtual Hosts

RabbitMQ is a multi-tenant system at the core and every connection belongs
to a virtual host. Some messaging protocols have the concept of vhosts,
others don't. MQTT falls into the latter category. Therefor the MQTT plugin
needs to provide a way to map connections to vhosts.

The `vhost` option controls which RabbitMQ vhost the adapter connects to
by default. The `vhost`
configuration is only consulted if no vhost is provided during connection establishment.
There are several (optional) ways to specify the vhost the client will
connect to.

#### Port to Virtual Host Mapping

First way is mapping MQTT plugin (TCP or TLS) listener ports to vhosts. The mapping
is specified thanks to the `mqtt_port_to_vhost_mapping` [global runtime parameter](/parameters.html).
Let's take the following plugin configuration:

<pre class="sourcecode erlang">
[{rabbitmq_mqtt, [{default_user,     &lt;&lt;"guest"&gt;&gt;},
                  {default_pass,     &lt;&lt;"guest"&gt;&gt;},
                  {allow_anonymous,  true},
                  {vhost,            &lt;&lt;"/"&gt;&gt;},
                  {tcp_listeners,    [1883, 1884]},
                  {ssl_listeners,    [8883, 8884]}]
}].
</pre>

Note the plugin listens on ports 1883, 1884, 8883, and 8884. Imagine you
want clients connecting to ports 1883 and 8883 to connect to the `vhost1` virtual
host, and clients connecting to ports 1884 and 8884 to connect to the `vhost2`
virtual vhost. You can specify port-to-vhost mapping by setting the
`mqtt_port_to_vhost_mapping` global parameter with `rabbitmqctl`:

<pre class="sourcecode bash">
rabbitmqctl set_global_parameter mqtt_port_to_vhost_mapping \
    '{"1883":"vhost1", "8883":"vhost1", "1884":"vhost2", "8884":"vhost2"}'
</pre>

with `rabbitmqctl.bat` on Windows:

<pre class="sourcecode powershell">
rabbitmqctl.bat set_global_parameter mqtt_port_to_vhost_mapping ^
    "{""1883"":""vhost1"", ""8883"":""vhost1"", ""1884"":""vhost2"", ""8884"":""vhost2""}"
</pre>

and with the HTTP API:

<pre class="sourcecode bash">
PUT /api/global-parameters/mqtt_port_to_vhost_mapping
# => {"value": {"1883":"vhost1", "8883":"vhost1", "1884":"vhost2", "8884":"vhost2"}}
</pre>

If there's no mapping for a given port (because the port cannot be found in
the `mqtt_port_to_vhost_mapping` global parameter JSON document or if the global parameter
isn't set at all), the plugin will try to extract the virtual host from the username
(see below) and will ultimately use the `vhost` plugin config option.

The broker queries the `mqtt_port_to_vhost_mapping` global parameter value at connection time.
If the value changes, connected clients are not notified or disconnected. They need
to reconnect to switch to a new virtual host.

#### Virtual Host as Part of Username

Another and more specific way to specify a vhost while connecting is to prepend the vhost
to the username and to separate with a colon.

For example, connecting with

    /:guest

is equivalent to the default vhost and username.

    mqtt-vhost:mqtt-username

means connecting to the vhost `mqtt-host` with username `mqtt-username`.

Specifying the virtual host in the username takes precedence over the port-to-vhost
mapping specified with the `mqtt_port_to_vhost_mapping` global parameter.

### Host and Port

The `listeners.tcp` and `tcp_listen_options` options are interpreted in the same way
as the corresponding options in the `rabbit` section, as explained in the
[networking](/networking.html) and [broker configuration](/configure.html) doc guides.

### TLS/SSL

The `listeners.ssl` option in the `rabbitmq_mqtt` config section controls the
endpoint (if any) that the adapter accepts TLS connections on. The
default MQTT TLS port is 8883. If this option is non-empty then the
`ssl_options` configuration values must be provided. The plugin will use them
just like AMQP 0-9-1 listeners do:

<pre class="sourcecode ini">
ssl_options.cacertfile = /path/to/tls/ca/cacert.pem
ssl_options.certfile   = /path/to/tls/server/cert.pem
ssl_options.keyfile    = /path/to/tls/server/key.pem
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert  = true

mqtt.listeners.ssl.default = 8883
mqtt.listeners.tcp.default = 1883
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[{rabbit,        [
                  {ssl_options, [{cacertfile, "/path/to/tls/ca/cacert.pem"},
                                 {certfile,   "/path/to/tls/server/cert.pem"},
                                 {keyfile,    "/path/to/tls/server/key.pem"},
                                 {verify,     verify_peer},
                                 {fail_if_no_peer_cert, true}]}
                 ]},
 {rabbitmq_mqtt, [
                  {ssl_listeners,    [8883]},
                  {tcp_listeners,    [1883]}
                  ]}
].
</pre>

Note that RabbitMQ rejects SSLv3 connections by default because that protocol
is known to be compromised.

See the [TLS/SSL configuration guide](http://www.rabbitmq.com/ssl.html) for details.



### <a id="cta.ssl"/>Authentication with SSL client certificates

The MQTT adapter can authenticate SSL-based connections by extracting
a name from the client's SSL certificate, without using a password.

For safety the server must be configured with the SSL options
`fail_if_no_peer_cert` set to `true` and `verify` set to `verify_peer`, to
force all SSL clients to have a verifiable client certificate.

To switch this feature on, set `ssl_cert_login` to `true` for the
`rabbitmq_mqtt` application. For example:

<pre class="sourcecode ini">
mqtt.ssl_cert_login = true
</pre>

Or using the classic config format:

<pre class="sourcecode erlang">
[
  {rabbitmq_mqtt, [{ssl_cert_login, true}]}
].
</pre>

By default this will set the username to an RFC4514-ish string form of
the certificate's subject's Distinguished Name, similar to that
produced by OpenSSL's "-nameopt RFC2253" option.

To use the Common Name instead, add:

<pre class="sourcecode ini">
ssl_cert_login_from = common_name
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
{rabbit, [{ssl_cert_login_from, common_name}]}
</pre>

to your configuration.

Note that:

* The authenticated user must exist in the configured authentication / authorisation backend(s).
* Clients **must not** supply username and password.

You can optionally specify a virtual host for a client certificate by using the `mqtt_default_vhosts`
[global runtime parameter](/parameters.html). The value of this global parameter must contain a JSON document that
maps certificates' subject's Distinguished Name to their target virtual host. Let's see how to
map 2 certificates, `O=client,CN=guest` and `O=client,CN=rabbit`, to the `vhost1` and `vhost2`
virtual hosts, respectively.

Global parameters can be set up with `rabbitmqctl`:

<pre class="sourcecode bash">
rabbitmqctl set_global_parameter mqtt_default_vhosts \
    '{"O=client,CN=guest": "vhost1", "O=client,CN=rabbit": "vhost2"}'
</pre>

With `rabbitmqctl`, on Windows:

<pre class="sourcecode powershell">
rabbitmqctl set_global_parameter mqtt_default_vhosts ^
    "{""O=client,CN=guest"": ""vhost1"", ""O=client,CN=rabbit"": ""vhost2""}'
</pre>

And with the HTTP API:

<pre class="sourcecode bash">
PUT /api/global-parameters/mqtt_default_vhosts
# => {"value": {"O=client,CN=guest": "vhost1", "O=client,CN=rabbit": "vhost2"}}
</pre>

Note that:

* If the virtual host for a certificate cannot be found (because the certificate
subject's DN cannot be found in the `mqtt_default_vhosts` global parameter JSON
document or if the global parameter isn't set at all), the virtual host specified
by the `vhost` plugin config option will be used.
* The broker queries the `mqtt_default_vhosts` global parameter value at connection time.
If the value changes, connected clients are not notified or disconnected. They need
to reconnect to switch to a new virtual host.
* The certificate-to-vhost mapping with the `mqtt_default_vhosts` global parameter
is considered more specific than the port-to-vhost mapping with the `mqtt_port_to_vhost_mapping`
global parameter and so takes precedence over it.

### <a id="stickiness"/> Session Stickiness (Clean and Non-clean Sessions) and Queue/Subscription TTL

The `subscription_ttl` option controls the lifetime of non-clean sessions. This
option is interpreted in the same way as the [queue TTL](http://www.rabbitmq.com/ttl.html#queue-ttl)
parameter, so the value `86400000` means 24 hours. To disable the TTL feature, just set
the `subscription_ttl`  to `undefined` in the configuration file:

<pre class="sourcecode ini">
listeners.tcp.default = 5672
mqtt.default_user     = guest
mqtt.default_pass     = guest
mqtt.allow_anonymous  = true
mqtt.vhost            = /
mqtt.exchange         = amq.topic
mqtt.subscription_ttl = undefined
mqtt.prefetch         = 10
...
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[{rabbit,        [{tcp_listeners,    [5672]}]},
 {rabbitmq_mqtt, [{default_user,     &lt;&lt;"guest"&gt;&gt;},
                  {default_pass,     &lt;&lt;"guest"&gt;&gt;},
                  {allow_anonymous,  true},
                  {vhost,            &lt;&lt;"/"&gt;&gt;},
                  {exchange,         &lt;&lt;"amq.topic"&gt;&gt;},
                  {subscription_ttl, undefined},
                  {prefetch,         10},
                  ...
].
</pre>

Note that disabling queue TTL carries a risk: short-lived clients that don't use clean sessions
can leave queues and messages behind, which will consume resources and require manual
cleanup.

The `prefetch` option controls the maximum number of unacknowledged messages that
will be delivered. This option is interpreted in the same way as the [AMQP 0-9-1 prefetch-count](http://www.rabbitmq.com/amqp-0-9-1-reference.html#basic.qos.prefetch-count)
field, so a value of `0` means "no limit".



### Custom Exchanges

The `exchange` option determines which exchange messages from MQTT clients are published
to. If a non-default exchange is chosen then it must be created before clients
publish any messages. The exchange is expected to be a topic exchange.

### <a id="proxy-protocol"/> Proxy Protocol

The MQTT plugin supports the [proxy protocol](http://www.haproxy.org/download/1.8/doc/proxy-protocol.txt).
This feature is disabled by default, to enable it for MQTT clients:

<pre class="sourcecode ini">
mqtt.proxy_protocol = true
</pre>

Or, using the [classic config format](/configure.html#erlang-term-config-file):

<pre class="sourcecode erlang">
[
  {rabbitmq_mqtt, [{proxy_protocol, true}]}
].
</pre>

See the [Networking Guide](/networking.html#proxy-protocol) for more information
about the proxy protocol.


## <a id="retained"/> Retained Messages and Stores

The plugin supports retained messages. Message store implementation is pluggable
and the plugin ships with two implementation out of the box:

 * ETS-based (in memory), implemented in the <code>rabbit_mqtt_retained_msg_store_ets</code> module
 * DETS-based (on disk), implemented in the <code>rabbit_mqtt_retained_msg_store_dets</code>

Both implementations have limitations and trade-offs.
With the first one, maximum number of messages that can be retained is limited by RAM.
With the second one, there is a limit of 2 GB per vhost. Both are node-local
(messages retained on one broker node are not replicated to other nodes in the cluster).

To configure the store, use <code>rabbitmq_mqtt.retained_message_store</code> configuration key:

<pre class="sourcecode ini">
mqtt.default_user     = guest
mqtt.default_pass     = guest
mqtt.allow_anonymous  = true
mqtt.vhost            = /
mqtt.exchange         = amq.topic
mqtt.subscription_ttl = 1800000
mqtt.prefetch         = 10

## use DETS (disk-based) store for retained messages
mqtt.retained_message_store = rabbit_mqtt_retained_msg_store_dets
## only used by DETS store
mqtt.retained_message_store_dets_sync_interval = 2000

mqtt.listeners.ssl = none
mqtt.listeners.tcp.default = 1883
</pre>

Or using the <a href="/configure.html#erlang-term-config-file">classic config format</a>:

<pre class="sourcecode erlang">
[{rabbitmq_mqtt, [{default_user,     &lt;&lt;"guest"&gt;&gt;},
                  {default_pass,     &lt;&lt;"guest"&gt;&gt;},
                  {allow_anonymous,  true},
                  {vhost,            &lt;&lt;"/"&gt;&gt;},
                  {exchange,         &lt;&lt;"amq.topic"&gt;&gt;},
                  {subscription_ttl, 1800000},
                  {prefetch,         10},
                  %% use DETS (disk-based) store for retained messages
                  {retained_message_store, rabbit_mqtt_retained_msg_store_dets},
                  %% only used by DETS store
                  {retained_message_store_dets_sync_interval, 2000},
                  {ssl_listeners,    []},
                  {tcp_listeners,    [1883]}]}
].
</pre>

The value must be a module that implements the store:

 * <code>rabbit_mqtt_retained_msg_store_ets</code> for RAM-based
 * <code>rabbit_mqtt_retained_msg_store_dets</code> for disk-based

These implementations are suitable for development but sometimes won't be for production needs.
MQTT 3.1 specification does not define consistency or replication requirements for retained
message stores, therefore RabbitMQ allows for custom ones to meet the consistency and
availability needs of a particular environment. For example, stores based on [Riak](http://basho.com/riak/)
and [Cassandra](http://cassandra.apache.org/) would be suitable for most production environments as
those data stores provide [tunable consistency](https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/reference/strong-consistency.md).

Message stores must implement the <code>rabbit_mqtt_retained_msg_store</code> behaviour.


## <a id="limitations"/> Limitations

### Overlapping Subscriptions

Overlapping subscriptions from the same client
(e.g. `/sports/football/epl/#` and `/sports/football/#`) can result in
duplicate messages being delivered. Applications
need to account for this.

### Retained Message Stores

See Retained Messages above. Different retained message stores have
different benefits, trade-offs, and limitations.
