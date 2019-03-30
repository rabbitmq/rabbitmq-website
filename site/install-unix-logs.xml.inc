<?xml version="1.0"?>
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

<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             name="server-logs">
  <doc:heading>Log Files and Management</doc:heading>

  <p>
    <a href="/logging.html">Server logs</a> can be found under the <a href="/relocate.html">configurable</a> directory, which usually
    defaults to

<pre class="lang-bash">
/var/log/rabbitmq
</pre>

    when RabbitMQ is installed via a Linux package manager. <code>RABBITMQ_LOG_BASE</code>
    can be used to override log directory location.
  </p>

  <p>
    Assuming a <code>systemd</code>-based distribution, system service logs can be
    inspected using

<pre class="lang-bash">
journalctl --system
</pre>

    which requires superuser privileges.
    Its output can be filtered to narrow it down to RabbitMQ-specific entries:

<pre class="lang-bash">
sudo journalctl --system | grep rabbitmq
</pre>

    The output will look similar to this:

<pre class="sourcecode">
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##  ##      RabbitMQ 3.7.14. Copyright (c) 2007-2019 Pivotal Software, Inc.
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##########  Licensed under the MPL.  See http://www.rabbitmq.com/
Dec 26 11:03:04 localhost rabbitmq-server[968]: ######  ##
Dec 26 11:03:04 localhost rabbitmq-server[968]: ##########  Logs: /var/log/rabbitmq/rabbit@localhost.log
Dec 26 11:03:04 localhost rabbitmq-server[968]: /var/log/rabbitmq/rabbit@localhost_upgrade.log
Dec 26 11:03:04 localhost rabbitmq-server[968]: Starting broker...
Dec 26 11:03:05 localhost rabbitmq-server[968]: systemd unit for activation check: "rabbitmq-server.service"
Dec 26 11:03:06 localhost rabbitmq-server[968]: completed with 6 plugins.
</pre>
  </p>

  <h3>Log Rotation</h3>
  <p>
    The broker always appends to the log files, so a complete
    log history is retained.
  </p>
  <p>
    <a href="https://linux.die.net/man/8/logrotate">logrotate</a> is the recommended way of log file rotation and compression.
    By default, the package will set up <code>logrotate</code> to run weekly on files located in default
    <code>/var/log/rabbitmq</code> directory. Rotation configuration can be found in
    <code>/etc/logrotate.d/rabbitmq-server</code>.
  </p>

</doc:section>
