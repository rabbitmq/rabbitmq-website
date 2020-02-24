<!--
Copyright (c) 2007-2020 Pivotal Software, Inc.

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

## Community Plugins

### <a id="overview" class="anchor" href="#overview">Overview</a>

For your convenience, we offer binary downloads of plugins
which have been contributed by authors in the
community. These plugins do not ship with the RabbitMQ
server itself; you can download them from
our community plugin archive.

The plugins are available compiled against various releases
of RabbitMQ.

We offer no guarantee that these will even work
against a given release of RabbitMQ. We build them at
release time, and also when requested to by a plugin
author.

The download links on this page let you download the latest
build of the plugin, compiled against the latest feature
release of RabbitMQ. Bugfix releases do not affect plugin
compatibility. For older versions of plugins
see [the archive](https://dl.bintray.com/rabbitmq/community-plugins/). See also
[how to install additional plugins](installing-plugins.html).

When RabbitMQ is upgraded, all community plugins must be re-installed.
This may mean installing newer versions of them. Alternatively,
they can be disabled before or during the upgrade.

If you are the author of a plugin and would like it listed
here, please [get in touch](contact.html)!


### <a id="routing" class="anchor" href="#routing">Routing</a>

<table class="plugins">
  <tr>
    <th>rabbitmq_lvc_exchange</th>
  </tr>
  <tr>
    <td>
      The last value exchange acts like a direct exchange (binding
      keys are compared for equality with routing keys); but it
      also keeps track of the last value that was published with
      each routing key, and when a queue is bound, it
      automatically enqueues the last value for the binding key.
      <ul>
        <li>Download for <a href="https://github.com/rabbitmq/rabbitmq-lvc-exchange/releases/tag/v3.8.0">3.7.x / 3.8.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_lvc_exchange">3.6.x</a></li>
        <li>Maintainer: <b>Team RabbitMQ</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-lvc-exchange">rabbitmq/rabbitmq-lvc-exchange</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_rtopic_exchange</th>
  </tr>
  <tr>
    <td>
      Adds a reverse topic exchange which lets you provide
      routing patterns at publishing time, instead of at
      binding time.
      <ul>
        <li>Download for <a href="https://github.com/rabbitmq/rabbitmq-rtopic-exchange/releases/tag/v3.8.0">3.7.x / 3.8.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_rtopic_exchange">3.6.x</a></li>
        <li>Author: <b>Alvaro Videla</b></li>
        <li>Maintainer: <b>Team RabbitMQ</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-rtopic-exchange">rabbitmq/rabbitmq-rtopic-exchange</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_recent_history_exchange</th>
  </tr>
  <tr>
    <td>
      As of RabbitMQ 3.6.0 the <a href="https://github.com/rabbitmq/rabbitmq-recent-history-exchange#readme">recent history exchange plugin</a>
      is provided with the broker's package.
    </td>
  </tr>

  <tr>
    <th>rabbitmq_delayed_message_exchange</th>
  </tr>
  <tr>
    <td>
      A plugin that adds delayed-messaging (or scheduled-messaging) to RabbitMQ.
      <ul>
        <li>Download for <a href="https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/tag/v3.8.0">3.7.x / 3.8.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_delayed_message_exchange">3.6.x</a></li>
        <li>Author: <b>Alvaro Videla</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-delayed-message-exchange">rabbitmq/rabbitmq-delayed-message-exchange</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_routing_node_stamp</th>
  </tr>
  <tr>
    <td>
      A plugin that stamps a message with the node who first
      received it.
      <ul>
        <li>Download for <a href="https://github.com/rabbitmq/rabbitmq-routing-node-stamp/releases/tag/v3.8.0">3.7.x / 3.8.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_routing_node_stamp">3.6.x</a></li>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-routing-node-stamp">rabbitmq/rabbitmq-routing-node-stamp</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_message_timestamp</th>
  </tr>
  <tr>
    <td>
      A plugin that adds a timestamp when a message first enters
      RabbitMQ.
      <ul>
        <li>Download for <a href="https://github.com/rabbitmq/rabbitmq-message-timestamp/releases/tag/v3.8.0">3.7.x / 3.8.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_message_timestamp">3.6.x</a></li>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-message-timestamp">rabbitmq/rabbitmq-message-timestamp</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_auth_backend_ip_range</th>
  </tr>
  <tr>
    <td>
      Provides the ability for your RabbitMQ server to perform authorisation based on the client IP address.
      <ul>
        <li>Download for <a href="https://github.com/gotthardp/rabbitmq-auth-backend-ip-range/releases/tag/v2.0.0">3.8.x</a></li>
        <li>Download for <a href="https://github.com/gotthardp/rabbitmq-auth-backend-ip-range/releases/tag/v1.0.0">3.7.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_auth_backend_ip_range">3.6.x</a></li>
        <li>Authors: <b>Petr Gotthard</b></li>
        <li>Github: <a href="https://github.com/gotthardp/rabbitmq-auth-backend-ip-range">gotthardp/rabbitmq-auth-backend-ip-range</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_trust_store</th>
  </tr>
  <tr>
    <td>
      <i>
        As of RabbitMQ 3.6.3 the trust store plugin is
        provided with the broker's package.
      </i>
      Provides support for TLS (x509) certificate whitelisting.
      All plugins which use the global TLS options will be
      configured with the same whitelist. This plugin is provided with
      the broker's package.
      <ul>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-trust-store">rabbitmq/rabbitmq-trust-store</a></li>
      </ul>
    </td>
  </tr>
</table>


### <a id="mgmt" class="anchor" href="#mgmt">Management</a>

<table class="plugins">
  <tr>
    <th>rabbitmq_top</th>
  </tr>
  <tr>
    <td>
      <i>As of RabbitMQ 3.6.3 the management top plugin is provided with the broker's package.</i>

      Adds a "top" like view of busy processes to the
      management plugin. This plugin is provided with the broker's
      package.

      <ul>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-top">rabbitmq/rabbitmq-top</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_management_exchange</th>
  </tr>
  <tr>
    <td>
      Adds an exchange type which allows you to connect to the
      management API using AMQP rather than HTTP.
      <ul>
        <li>Download for <a href="https://github.com/rabbitmq/rabbitmq-management-exchange/releases/tag/v3.8.0">3.7.x / 3.8.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_management_exchange">3.6.x</a></li>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-management-exchange">rabbitmq/rabbitmq-management-exchange</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_event_exchange</th>
  </tr>
  <tr>
    <td>
      <i>
        As of RabbitMQ 3.6.0 the <a href="https://github.com/rabbitmq/rabbitmq-event-exchange#readme">event exchange plugin</a>
        is provided with the broker's package.
      </i>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_management_themes</th>
  </tr>
  <tr>
    <td>
      Adds the possibility to customize the management web UI look.
      <ul>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.7.x/rabbitmq_management_themes">3.7.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_management_themes">3.6.x</a></li>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-management-themes">rabbitmq/rabbitmq-management-themes</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_boot_steps_visualiser</th>
  </tr>
  <tr>
    <td>
      Adds a tab to the management UI which displays boot steps
      in a graph. This is a debugging tool: it is of no use in a
      production broker.

      <ul>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.7.x/rabbitmq_boot_steps_visualiser">3.7.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_boot_steps_visualiser">3.6.x</a></li>
        <li>Author: <b>Alvaro Videla</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-boot-steps-visualiser">rabbitmq/rabbitmq-boot-steps-visualiser</a></li>
      </ul>
    </td>
  </tr>
</table>


### <a id="distributed" class="anchor" href="#distributed">Clustering and Distributed RabbitMQ</a>

<table class="plugins">
  <tr>
    <th>autocluster</th>
  </tr>
  <tr>
    <td>
      <i>
        As of RabbitMQ 3.7.0, this plugin was superseded by a <a href="/cluster-formation.html">new peer discovery subsystem</a>
        built on the same ideas and supporting the same backends via
        separate plugins.
      </i>

        Adds the possibility to automatically cluster RabbitMQ nodes
        using Consul, etcd or DNS for service discovery.

      <ul>
        <li>Author: <b>Gavin M. Roy</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-autocluster">rabbitmq/rabbitmq-autocluster</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_clusterer</th>
  </tr>
  <tr>
    <td>
      Provides an alternative way of cluster formation. This plugin is deprecated.

      <ul>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-clusterer">rabbitmq/rabbitmq-clusterer</a></li>
      </ul>
    </td>
  </tr>
</table>


### <a id="logging" class="anchor" href="#logging">Logging</a>

<table class="plugins">
  <tr>
    <th>lager</th>
  </tr>
  <tr>
    <td>
      <i>As of RabbitMQ 3.7.0 the lager plugin is replaced by native Lager support.</i>
      Basho's <i>Lager</i> logging framework as a RabbitMQ plugin.
      <ul>
        <li>Author: <b>Basho Technologies</b></li>
        <li>Github (Lager): <a href="https://github.com/basho/lager">basho/lager</a></li>
        <li>Github (RabbitMQ packaging / notes): <a href="https://github.com/hyperthunk/rabbitmq-lager">hyperthunk/rabbitmq-lager</a></li>
      </ul>
    </td>
  </tr>
</table>


### <a id="queues" class="anchor" href="#queues">Queue Types</a>

<table class="plugins">
  <tr>
    <th>rabbitmq_priority_queue</th>
  </tr>
  <tr>
    <td>
      <i>
        As of RabbitMQ 3.5.0 the <a href="priority.html">priority queue</a> plugin is
        integrated into the broker. Users of the plugin
        upgrading from previous versions of RabbitMQ should:
      </i>
      <ul>
        <li>Install the new version of RabbitMQ</li>
        <li>Invoke: <code>rabbitmq-plugins disable rabbitmq_priority_queue</code></li>
        <li>Remove the plugin</li>
        <li>Start the server</li>
      </ul>
    </td>
  </tr>
</table>

<table class="plugins">
  <tr>
    <th>rabbitmq_sharding</th>
  </tr>
  <tr>
    <td>
      <i>
        As of RabbitMQ 3.6.0 the <a href="https://github.com/rabbitmq/rabbitmq-sharding#readme">sharding plugin</a>
        is provided with the broker's package.
      </i>
    </td>
  </tr>
</table>


### <a id="protocols" class="anchor" href="#protocols">Protocols</a>

<table class="plugins">
<!--
  <tr>
    <th>rabbit_udp_exchange</th>
  </tr>
  <tr>
    <td>
      Adds an exchange type which listens on a
      specified UDP port for incoming messages, and relays them on
      to the queues bound to the exchange. It also takes messages
      published to the exchange and relays them on to a specified
      IP address and UDP port.
      <ul>
        <li>Author: <b>Tony Garnock-Jones</b></li>
        <li>Github: <a href="https://github.com/tonyg/udp-exchange">tonyg/udp-exchange</a></li>
      </ul>
    </td>
  </tr>
-->

  <tr>
    <th>rabbitmq_coap_pubsub</th>
  </tr>
  <tr>
    <td>
      <i>
        This plugin currently fails to build with RabbitMQ 3.7.0 or later.
      </i>

      Implements the Publish-Subscribe Broker for the Constrained
      Application Protocol (CoAP) as specified in the
      <a href="https://www.ietf.org/id/draft-koster-core-coap-pubsub-02.txt">draft-koster-core-coap-pubsub-02</a>.

      <ul>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.7.x/rabbitmq_coap_pubsub">3.7.x</a></li>
        <li>Download for <a href="https://dl.bintray.com/rabbitmq/community-plugins/3.6.x/rabbitmq_coap_pubsub">3.6.x</a></li>
        <li>Authors: <b>Petr Gotthard</b></li>
        <li>GitHub: <a href="https://github.com/gotthardp/rabbitmq-coap-pubsub">gotthardp/rabbitmq-coap-pubsub</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_email</th>
  </tr>
  <tr>
    <td>
      Maps SMTP to AMQP 0-9-1 (to convert an incoming email to an AMQP 0-9-1
      message) and AMQP 0-9-1 to SMTP (to send an email from an AMQP 0-9-1 message).

      <ul>
        <li>Download for <a href="https://github.com/gotthardp/rabbitmq-email/releases/tag/v0.4.0">3.7.x / 3.8.x</a></li>
        <li>Download for <a href="https://github.com/gotthardp/rabbitmq-email/releases/tag/v0.2.0">3.6.x</a></li>
        <li>Authors: <b>Petr Gotthard</b></li>
        <li>GitHub: <a href="https://github.com/gotthardp/rabbitmq-email">gotthardp/rabbitmq-email</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>pgsql_listen_exchange</th>
  </tr>
  <tr>
    <td>
      <i>This plugin has not been ported to RabbitMQ 3.6.x+</i>

      Translates PostgreSQL NOTIFY messages to AMQP messages and
      publishes them to bound queues. The PostgreSQL NOTIFY
      message channel is used as the routing key for the message
      using direct exchange style routing mechanics.

      <ul>
        <li>Author: <b>Gavin M. Roy</b></li>
        <li>Github: <a href="https://github.com/gmr/pgsql-listen-exchange">aweber/pgsql-listen-exchange</a></li>
      </ul>
    </td>
    </tr>

    <tr>
      <th>rabbitmq_web_mqtt</th>
    </tr>
    <tr>
      <td>
        <i>
          As of RabbitMQ 3.6.7 the Web-MQTT plugin is
          provided with the broker's package.
        </i>

        Provides support for MQTT-over-WebSockets.

        <ul>
          <li>Author: <b>Team RabbitMQ</b></li>
          <li>Github: <a href="https://github.com/rabbitmq/rabbitmq-web-mqtt">rabbitmq/rabbitmq-web-mqtt</a></li>
        </ul>
      </td>
    </tr>
</table>
