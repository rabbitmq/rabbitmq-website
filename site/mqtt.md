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

# MQTT Plugin NOSYNTAX

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ supports MQTT 3.1.1 via a plugin that ships in the core distribution.

Key covered topics are:

 * [Clustering requirements](#requirements) of this plugin
 * [Supported MQTT 3.1.1 features](#features) as well as [limitations](#limitations)
 * [How to enable the plugin](#enabling-plugin)
 * [Users and authentication](#authentication), [remote connection](#local-vs-remote) limitations of the default user
 * [Implementation overview](#implementation)
 * [Subscription durability](#durability) and [session stickiness](#stickiness)
 * How to [use quorum queues](#quorum-queues) for durable subscriptions and when not to do it
 * [Consensus-based Features](#consensus)
 * [Key configurable settings](#config) of the plugin
 * [TLS support](#tls)
 * [Virtual hosts](#virtual-hosts)
 * [Sparkplug support](#sparkplug-support), [Proxy protocol](#proxy-protocol)
 * How to disable the plugin and [decomission a node](#disabling-plugin)

 and more.


## <a id="requirements" class="anchor" href="#requirements">Clustering Requirements</a>

### The Quorum Requirement

As of 3.8, the plugin [requires a quorum of cluster nodes](#consensus) to be present.
This means two nodes out of three, three out of five and so on.

The plugin can also be used on a single node but **does not support** clusters of two nodes.

In case the majority of cluster nodes is down, remaining cluster nodes would not be able to
accept new MQTT client connections.

There are other [documented limitations](#limitations).

### Enabled on All Nodes

The plugin must be enabled on all cluster nodes.


## <a id="features" class="anchor" href="#features"> Supported MQTT 3.1.1 features</a>

* QoS0 and QoS1 publish & consume
* QoS2 publish (downgraded to QoS1)
* Last Will and Testament (LWT)
* TLS
* Session stickiness
* Retained messages with pluggable storage backends

MQTT clients can interoperate with other protocols. All the functionality in
the [management UI](./management.html) and several other plugins can be
used with MQTT, although there may be some limitations or the need to
tweak the defaults.


## <a id="enabling-plugin" class="anchor" href="#enabling-plugin">Enabling the Plugin</a>

The MQTT plugin is included in the RabbitMQ distribution. Before clients can successfully
connect, it must be enabled using [rabbitmq-plugins](./cli.html):

<pre class="lang-bash">
rabbitmq-plugins enable rabbitmq_mqtt
</pre>

Now that the plugin is enabled, MQTT clients will be able to connect provided that
they have a set of credentials for an existing user with the appropriate permissions.


## <a id="authentication" class="anchor" href="#authentication">Users and Authentication</a>

For an MQTT connection to succeed, it must successfully authenticate and the user must
have the [appropriate permissions](./access-control.html) to the virtual host used by the
plugin (see below).

MQTT clients can (and usually do) specify a set of credentials when they connect. The credentials
can be a username and password pair, or a x.509 certificate (see below).

The plugin supports anonymous authentication but its use is highly discouraged and it is a subject
to certain limitations (listed below) enforced for a reasonable level of security
by default.

Users and their permissions can be managed using [rabbitmqctl](./cli.html), [management UI](./management.html)
or HTTP API.

For example, the following commands create a new user for MQTT connections with full access
to the default [virtual host](./vhosts.html) used by this plugin:

<pre class="lang-bash">
# username and password are both "mqtt-test"
rabbitmqctl add_user mqtt-test mqtt-test
rabbitmqctl set_permissions -p / mqtt-test ".*" ".*" ".*"
rabbitmqctl set_user_tags mqtt-test management
</pre>

Note that colons may not appear in usernames.

## <a id="certificate-authentication" class="certificate-authentication" href="#certificate-authentication">x.509 (TLS) Certificate-based Authentication</a>

MQTT clients can also authenticate using an x.509 (TLS) certificate. This feature is provided
by a [separate plugin](https://github.com/rabbitmq/rabbitmq-server/tree/v3.12.x/deps/rabbitmq_auth_mechanism_ssl).

The x.509 authentication mechanism extracts client username from either the Subject Alternative Name (SAN)
or the Common Name (CN) certificate field.

To avoid having to create an internal database user for every client certificate,
authentication can be performed by a small [HTTP-based service](https://github.com/rabbitmq/rabbitmq-server/tree/v3.12.x/deps/rabbitmq_auth_backend_http).


## <a id="implementation" class="anchor" href="#implementation">How it Works</a>

RabbitMQ MQTT plugin targets MQTT 3.1.1 and supports a broad range
of MQTT clients. It also makes it possible for MQTT clients to interoperate
with [AMQP 0-9-1, AMQP 1.0, and STOMP](https://www.rabbitmq.com/protocols.html) clients.
There is also support for multi-tenancy.

The plugin builds on top of RabbitMQ core protocol's entities: exchanges and queues. Messages published
to MQTT topics use a topic exchange (`amq.topic` by default) internally. Subscribers consume from
RabbitMQ queues bound to the topic exchange. This both enables interoperability
with other protocols and makes it possible to use the [Management plugin](./management.html)
to inspect queue sizes, message rates, and so on.

Note that MQTT uses slashes ("/") for topic segment separators and
AMQP 0-9-1 uses dots.  This plugin translates patterns under the hood
to bridge the two, for example, `cities/london` becomes
`cities.london` and vice versa. This has one important limitation:
MQTT topics that have dots in them won't work as expected and are to
be avoided, the same goes for AMQP 0-9-1 routing keys that contains
slashes.

### <a id="local-vs-remote" class="anchor" href="#local-vs-remote">Local vs. Remote Client Connections</a>

When an MQTT client provides no login credentials, the plugin uses the
`guest` account by default which will not allow non-`localhost`
connections. When connecting from a remote host, here are the options
that make sure remote clients can successfully connect:

 * Create one or more new user(s), grant them full permissions to the virtual host used by the MQTT plugin and make clients
   that connect from remote hosts use those credentials. This is the recommended option.
 * Set `default_user` and `default_pass` via [MQTT plugin configuration](#config) to a non-`guest` user who has the
[appropriate permissions](./access-control.html).


### <a id="anonymous-connections" class="anchor" href="#anonymous-connections">Anonymous Connections</a>

MQTT supports optional authentication (clients may provide no credentials) but RabbitMQ
does not. Therefore a default set of credentials is used for anonymous connections.

The `mqtt.default_user` and `mqtt.default_pass` configuration keys are used to specify
the credentials:

<pre class="lang-ini">
mqtt.default_user = some-user
mqtt.default_pass = s3kRe7
</pre>

It is possible to disable anonymous connections:

<pre class="lang-ini">
mqtt.allow_anonymous = false
</pre>

If the `mqtt.allow_anonymous` key is set to `false` then clients **must** provide credentials.

The use of anonymous connections is highly discouraged and it is a subject
to certain limitations (see above) enforced for a reasonable level of security
by default.

### <a id="durability" class="anchor" href="#durability">Subscription Durability</a>

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
one per subscription QoS level. The queues will have [queue TTL](ttl.html) depending
on MQTT plugin configuration, 24 hours by default.

**RabbitMQ does not support QoS2 subscriptions**. RabbitMQ
automatically downgrades QoS 2 publishes and subscribes to QoS
1. Messages published as QoS 2 will be sent to subscribers as QoS 1.
Subscriptions with QoS 2 will be downgraded to QoS1 during SUBSCRIBE
request (SUBACK responses will contain the actually provided QoS
level).


### <a id="quorum-queues" class="anchor" href="#quorum-queues">Using Quorum Queues</a>

Starting with RabbitMQ 3.10, it is possible to opt in to use [quorum queues](quorum-queues.html) for durable subscriptions
using the  `mqtt.durable_queue_type` option.

**This value must only be enabled for new clusters**, before any clients declare durable subscriptions.
Because queue type cannot be changed after
declaration, if the value of this setting is changed for
an existing cluster, clients with existing durable state would run into a queue type mismatch
error and **fail to subscribe**.

Below is a `rabbitmq.conf` example that opts in to use quorum queues for durable subscriptions:

<pre class="lang-ini">
# Must ONLY be enabled for new clusters before any clients declare durable
# subscriptions.
#
# Quorum queues should NOT be used in environments with high connection and queue
# churn, see https://rabbitmq.com/networking.html#dealing-with-high-connection-churn.
# Consumers that churn through queues (use very short-lived queues) will not get
# any quorum queue benefits anyway.
mqtt.durable_queue_type = quorum
</pre>

While quorum queues are designed for data safety and predictable efficient recovery
from replica failures, they also have downsides. A quorum queue by definition requires
at least three replicas in the cluster. Therefore quorum queues take longer to declare
and delete, and are not a good fit for environments with [high client connection churn](networking.html#dealing-with-high-connection-).

Quorum queues are a great fit for longer lived clients that actually care a great deal
about the durability of their state.


## <a id="consensus" class="anchor" href="#consensus">Consensus Features</a>

This plugin requires a quorum (majority) of nodes to be online.
This is because client ID tracking now uses a consensus protocol which requires
a quorum of nodes to be online in order to make progress.

If a quorum of nodes is down or lost, the plugin won't be able to accept new client
connections until the quorum is restored.

This also means that **two node clusters are not supported** since the loss of just one
node out of two means the loss of a quorum of online nodes.

### Memory Footprint of Raft Log Memory Tables

RabbitMQ's Raft implementation keeps a portion of the operation log in memory as well as on disk.
In environments where the MQTT plugin is the only Raft-based feature used
(namely where [quorum queues](./quorum-queues.html) are not used), reducing the portion of
the log stored in memory will reduce memory footprint of the plugin in case of
[high connection churn](./connections.html#high-connection-churn).

The configuration key of interest is `raft.wal_max_size_bytes`:

<pre class="lang-ini">
# if quorum queues are not used, configure a lower max WAL segment
# limit compared to the default of 512 MiB, e.g. 64 MiB
raft.wal_max_size_bytes = 67108864
</pre>

If [quorum queues](./quorum-queues.html) are adopted at a later point, this setting
should be revisited to be closer to the default one.


## <a id="config" class="anchor" href="#config">Plugin Configuration</a>

Here is a sample [configuration](./configure.html#config-file) that demonstrates a number of MQTT plugin settings:

<pre class="lang-ini">
mqtt.listeners.tcp.default = 1883
## Default MQTT with TLS port is 8883
# mqtt.listeners.ssl.default = 8883

# anonymous connections, if allowed, will use the default
# credentials specified here
mqtt.allow_anonymous  = true
mqtt.default_user     = guest
mqtt.default_pass     = guest

mqtt.vhost            = /
mqtt.exchange         = amq.topic
# 24 hours by default
mqtt.subscription_ttl = 86400000
mqtt.prefetch         = 10
</pre>

### <a id="tcp-listeners" class="anchor" href="#tcp-listeners">TCP Listeners</a>

When no configuration is specified the MQTT plugin will listen on
all interfaces on port 1883 and have a default user login/passcode
of `guest`/`guest`.

To change the listener port, edit your
[Configuration file](./configure.html#configuration-files),
to contain a `tcp_listeners` variable for the `rabbitmq_mqtt` application.

For example, a minimalistic configuration file which changes the listener
port to 12345 would look like:

<pre class="lang-ini">
mqtt.listeners.tcp.1 = 12345
</pre>

while one which changes the listener to listen only on localhost (for
both IPv4 and IPv6) would look like:

<pre class="lang-ini">
mqtt.listeners.tcp.1 = 127.0.0.1:1883
mqtt.listeners.tcp.2 = ::1:1883
</pre>

### TCP Listener Options

The plugin supports TCP listener option configuration.

The settings use a common prefix, `mqtt.tcp_listen_options`, and control
things such as TCP buffer sizes, inbound TCP connection queue length, whether [TCP keepalives](./heartbeats.html#tcp-keepalives)
are enabled and so on. See the [Networking guide](networking.html) for details.

<pre class="lang-ini">
mqtt.listeners.tcp.1 = 127.0.0.1:1883
mqtt.listeners.tcp.2 = ::1:1883

mqtt.tcp_listen_options.backlog = 4096
mqtt.tcp_listen_options.recbuf  = 131072
mqtt.tcp_listen_options.sndbuf  = 131072

mqtt.tcp_listen_options.keepalive = true
mqtt.tcp_listen_options.nodelay   = true

mqtt.tcp_listen_options.exit_on_close = true
mqtt.tcp_listen_options.send_timeout  = 120
</pre>

### <a id="tls" class="anchor" href="#tls">TLS Support</a>

To use TLS for MQTT connections, [TLS must be configured](./ssl.html) in the broker. To enable
TLS-enabled MQTT connections, add a TLS listener for MQTT using the `mqtt.listeners.ssl.*` configuration keys.

The plugin will use core RabbitMQ server
certificates and key (just like AMQP 0-9-1 and AMQP 1.0 listeners do):

<pre class="lang-ini">
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert  = true

# default TLS-enabled port for MQTT connections
mqtt.listeners.ssl.default = 8883
mqtt.listeners.tcp.default = 1883
</pre>

Note that RabbitMQ rejects SSLv3 connections by default because that protocol
is known to be compromised.

See the [TLS configuration guide](https://www.rabbitmq.com/ssl.html) for details.

### <a id="virtual-hosts" class="anchor" href="#virtual-hosts"> Virtual Hosts</a>

RabbitMQ is a multi-tenant system at the core and every connection belongs
to a virtual host. Some messaging protocols have the concept of vhosts,
others don't. MQTT falls into the latter category. Therefore the MQTT plugin
needs to provide a way to map connections to vhosts.

The `vhost` option controls which RabbitMQ vhost the adapter connects to
by default. The `vhost`
configuration is only consulted if no vhost is provided during connection establishment.
There are several (optional) ways to specify the vhost the client will
connect to.

#### Port to Virtual Host Mapping

First way is mapping MQTT plugin (TCP or TLS) listener ports to vhosts. The mapping
is specified thanks to the `mqtt_port_to_vhost_mapping` [global runtime parameter](./parameters.html).
Let's take the following plugin configuration:

<pre class="lang-ini">
mqtt.listeners.tcp.1 = 1883
mqtt.listeners.tcp.2 = 1884

mqtt.listeners.ssl.1 = 8883
mqtt.listeners.ssl.2 = 8884

# (other TLS settings are omitted for brevity)

mqtt.vhost            = /
</pre>

Note the plugin listens on ports 1883, 1884, 8883, and 8884. Imagine you
want clients connecting to ports 1883 and 8883 to connect to the `vhost1` virtual
host, and clients connecting to ports 1884 and 8884 to connect to the `vhost2`
virtual host. You can specify port-to-vhost mapping by setting the
`mqtt_port_to_vhost_mapping` global parameter with `rabbitmqctl`:

<pre class="lang-bash">
rabbitmqctl set_global_parameter mqtt_port_to_vhost_mapping \
    '{"1883":"vhost1", "8883":"vhost1", "1884":"vhost2", "8884":"vhost2"}'
</pre>

with `rabbitmqctl.bat` on Windows:

<pre class="lang-powershell">
rabbitmqctl.bat set_global_parameter mqtt_port_to_vhost_mapping ^
    "{""1883"":""vhost1"", ""8883"":""vhost1"", ""1884"":""vhost2"", ""8884"":""vhost2""}"
</pre>

and with the HTTP API:

<pre class="lang-bash">
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


### <a id="tls-certificate-authentication" class="anchor" href="#tls-certificate-authentication">Authentication with TLS/x509 client certificates</a>

The plugin can authenticate TLS-enabled connections by extracting
a name from the client's TLS (x509) certificate, without using a password.

For safety the server must be [configured with the TLS options](#tls)
`fail_if_no_peer_cert` set to `true` and `verify` set to `verify_peer`, to
force all TLS clients to have a verifiable client certificate.

To switch this feature on, set `ssl_cert_login` to `true` for the
`rabbitmq_mqtt` application. For example:

<pre class="lang-ini">
mqtt.ssl_cert_login = true
</pre>

By default this will set the username to an RFC4514-ish string form of
the certificate's subject's Distinguished Name, similar to that
produced by OpenSSL's "-nameopt RFC2253" option.

To use the Common Name instead, add:

<pre class="lang-ini">
ssl_cert_login_from = common_name
</pre>

to your configuration.

Note that:

* The authenticated user must exist in the configured authentication / authorisation backend(s).
* Clients **must not** supply username and password.

You can optionally specify a virtual host for a client certificate by using the `mqtt_default_vhosts`
[global runtime parameter](./parameters.html). The value of this global parameter must contain a JSON document that
maps certificates' subject's Distinguished Name to their target virtual host. Let's see how to
map 2 certificates, `O=client,CN=guest` and `O=client,CN=rabbit`, to the `vhost1` and `vhost2`
virtual hosts, respectively.

Global parameters can be set up with `rabbitmqctl`:

<pre class="lang-bash">
rabbitmqctl set_global_parameter mqtt_default_vhosts \
    '{"O=client,CN=guest": "vhost1", "O=client,CN=rabbit": "vhost2"}'
</pre>

With `rabbitmqctl`, on Windows:

<pre class="lang-powershell">
rabbitmqctl set_global_parameter mqtt_default_vhosts ^
    "{""O=client,CN=guest"": ""vhost1"", ""O=client,CN=rabbit"": ""vhost2""}'
</pre>

And with the HTTP API:

<pre class="lang-bash">
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

### <a id="stickiness" class="anchor" href="#stickiness">Session Stickiness (Clean and Non-clean Sessions) and Queue/Subscription TTL</a>

The `subscription_ttl` option controls the lifetime of non-clean sessions. This
option is interpreted in the same way as the [queue TTL](https://www.rabbitmq.com/ttl.html#queue-ttl)
parameter, so the value `86400000` means 24 hours. To disable the TTL feature, just set
the `subscription_ttl`  to `undefined` in the configuration file:

<pre class="lang-ini">
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

Note that disabling queue TTL carries a risk: short-lived clients that don't use clean sessions
can leave queues and messages behind, which will consume resources and require manual
cleanup.

The `prefetch` option controls the maximum number of unacknowledged messages that
will be delivered. This option is interpreted in the same way as the [AMQP 0-9-1 prefetch-count](https://www.rabbitmq.com/amqp-0-9-1-reference.html#basic.qos.prefetch-count)
field, so a value of `0` means "no limit".



### <a id="custom-exchanges" class="anchor" href="#custom-exchanges">Custom Exchanges</a>

The `exchange` option determines which exchange messages from MQTT clients are published
to. If a non-default exchange is chosen then it must be created before clients
publish any messages. The exchange is expected to be a topic exchange.


## <a id="proxy-protocol" class="anchor" href="#proxy-protocol">Proxy Protocol</a>

The MQTT plugin supports the [proxy protocol](http://www.haproxy.org/download/1.8/doc/proxy-protocol.txt).
This feature is disabled by default, to enable it for MQTT clients:

<pre class="lang-ini">
mqtt.proxy_protocol = true
</pre>

See the [Networking Guide](./networking.html#proxy-protocol) for more information
about the proxy protocol.

## <a id="sparkplug-support" class="anchor" href="#sparkplug-support">Sparkplug Support</a>

[Sparkplug](https://www.cirrus-link.com/mqtt-sparkplug-tahu/) is a specification
that provides guidance for the design of an MQTT system. In Sparkplug,
MQTT topics must start with `spAvM.N` or `spBvM.N`, where `M` and `N` are integers.
This unfortunately conflicts with the way the RabbitMQ MQTT plugin [translates MQTT
topics into AMQP routing keys](#implementation).

To solve this, the `sparkplug` configuration entry can be set to `true`:

<pre class="lang-ini">
mqtt.sparkplug = true
</pre>

When the Sparkplug support is enabled, the MQTT plugin will not translate the
`spAvM.N`/`spBvM.N` part of the names of topics.


## <a id="limitations" class="anchor" href="#limitations">Limitations</a>

### QoS 2 is Not Supported

QoS 2 subscriptions will be treated as if they were QoS 1 subscriptions.

### Presence of a Quorum of Nodes

See [Consensus Features](#consensus).

### Overlapping Subscriptions

Overlapping subscriptions from the same client
(e.g. `/sports/football/epl/#` and `/sports/football/#`) can result in
duplicate messages being delivered. Applications
need to account for this.

### Retained Message Stores

See Retained Messages above. Different retained message stores have
different benefits, trade-offs, and limitations.


## <a id="disabling-plugin" class="anchor" href="#disabling-plugin">Disabling the Plugin</a>

Before the plugin is disabled on a node, or a node removed from the cluster, it must be decommissioned using [`rabbitmqctl`](./cli.html):

<pre class="lang-bash">
rabbitmqctl decommission_mqtt_node &lt;node&gt;
</pre>

## <a id="retained" class="anchor" href="#retained">Retained Messages and Stores</a>

The plugin supports retained messages. Message store implementation is pluggable
and the plugin ships with two implementation out of the box:

 * ETS-based (in memory), implemented in the <code>rabbit_mqtt_retained_msg_store_ets</code> module
 * DETS-based (on disk), implemented in the <code>rabbit_mqtt_retained_msg_store_dets</code>

Both implementations have limitations and trade-offs.
With the first one, maximum number of messages that can be retained is limited by RAM.
With the second one, there is a limit of 2 GB per vhost. Both are node-local
(messages retained on one broker node are not replicated to other nodes in the cluster).

To configure the store, use <code>rabbitmq_mqtt.retained_message_store</code> configuration key:

<pre class="lang-ini">
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
