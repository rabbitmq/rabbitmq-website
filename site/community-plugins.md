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

# Community Plugins

## <a id="overview" class="anchor" href="#overview">Overview</a>

Binary downloads of plugins, which are contributed by authors in the
community are available. These plugins do not ship with the RabbitMQ
server. Refer to [Installing Additional Plugins](installing-plugins.html) for information on how to install the plugins. Note, the latest
build of the plugin is compiled against the latest feature release of RabbitMQ.

There is no guarantee that these plugins work
against a given release of RabbitMQ. They are built at
release time, and also when requested by a plugin
author.

Bugfix releases usually do not affect plugin compatibility.

When RabbitMQ is upgraded, all community plugins must be re-installed, which can result in installing newer versions of them.
Alternatively, they can be deactivated before or during the upgrade.

If you are the author of a plugin and would like it listed
here, [get in touch](contact.html)!

## <a id="routing" class="anchor" href="#routing">Routing</a>

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
        <li><a href="https://github.com/rabbitmq/rabbitmq-lvc-exchange/releases">Releases</a></li>
        <li>Maintainer: <b>Team RabbitMQ</b></li>
        <li>GitHub: <a href="https://github.com/rabbitmq/rabbitmq-lvc-exchange">rabbitmq/rabbitmq-lvc-exchange</a></li>
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
        <li><a href="https://github.com/rabbitmq/rabbitmq-rtopic-exchange/releases">Releases</a></li>
        <li>Author: <b>Alvaro Videla</b></li>
        <li>Maintainer: <b>Team RabbitMQ</b></li>
        <li>GitHub: <a href="https://github.com/rabbitmq/rabbitmq-rtopic-exchange">rabbitmq/rabbitmq-rtopic-exchange</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_delayed_message_exchange</th>
  </tr>
  <tr>
    <td>
      A plugin that adds delayed-messaging (or scheduled-messaging) to RabbitMQ.
      <ul>
        <li><a href="https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases">Releases</a></li>
        <li>Author: <b>Alvaro Videla</b></li>
        <li>GitHub: <a href="https://github.com/rabbitmq/rabbitmq-delayed-message-exchange">rabbitmq/rabbitmq-delayed-message-exchange</a></li>
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
        <li><a href="https://github.com/rabbitmq/rabbitmq-routing-node-stamp/releases">Releases</a></li>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>GitHub: <a href="https://github.com/rabbitmq/rabbitmq-routing-node-stamp">rabbitmq/rabbitmq-routing-node-stamp</a></li>
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
        <li><a href="https://github.com/rabbitmq/rabbitmq-message-timestamp/releases">Releases</a></li>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>GitHub: <a href="https://github.com/rabbitmq/rabbitmq-message-timestamp">rabbitmq/rabbitmq-message-timestamp</a></li>
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
        <li><a href="https://github.com/gotthardp/rabbitmq-auth-backend-ip-range/releases">Releases</a></li>
        <li>Authors: <b>Petr Gotthard</b></li>
        <li>GitHub: <a href="https://github.com/gotthardp/rabbitmq-auth-backend-ip-range">gotthardp/rabbitmq-auth-backend-ip-range</a></li>
      </ul>
    </td>
  </tr>
</table>


## <a id="mgmt" class="anchor" href="#mgmt">Management</a>

<table class="plugins">
  <tr>
    <th>rabbitmq_management_exchange</th>
  </tr>
  <tr>
    <td>
      Adds an exchange type which allows you to connect to the
      management API using AMQP rather than HTTP.
      <ul>
        <li><a href="https://github.com/rabbitmq/rabbitmq-management-exchange/releases">Releases</a></li>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>GitHub: <a href="https://github.com/rabbitmq/rabbitmq-management-exchange">rabbitmq/rabbitmq-management-exchange</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <th>rabbitmq_management_themes</th>
  </tr>
  <tr>
    <td>
      Adds the possibility to customize the management web UI look.
      <ul>
        <li><a href="https://github.com/rabbitmq/rabbitmq-management-themes/releases">Releases</a></li>
        <li>Author: <b>Team RabbitMQ</b></li>
        <li>GitHub: <a href="https://github.com/rabbitmq/rabbitmq-management-themes">rabbitmq/rabbitmq-management-themes</a></li>
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
        <li><a href="https://github.com/rabbitmq/rabbitmq-boot-steps-visualiser/releases">Releases</a></li>
        <li>Author: <b>Alvaro Videla</b></li>
        <li>GitHub: <a href="https://github.com/rabbitmq/rabbitmq-boot-steps-visualiser">rabbitmq/rabbitmq-boot-steps-visualiser</a></li>
      </ul>
    </td>
  </tr>
</table>


## <a id="protocols" class="anchor" href="#protocols">Protocols</a>

<table class="plugins">
  <tr>
    <th>rabbitmq_email</th>
  </tr>
  <tr>
    <td>
      Maps SMTP to AMQP 0-9-1 (to convert an incoming email to an AMQP 0-9-1
      message) and AMQP 0-9-1 to SMTP (to send an email from an AMQP 0-9-1 message).
      <ul>
        <li><a href="https://github.com/gotthardp/rabbitmq-email/releases">Releases</a></li>
        <li>Authors: <b>Petr Gotthard</b></li>
        <li>GitHub: <a href="https://github.com/gotthardp/rabbitmq-email">gotthardp/rabbitmq-email</a></li>
      </ul>
    </td>
  </tr>
</table>
