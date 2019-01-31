<?xml version="1.0"?>
<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

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

<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="managing-windows">
  <doc:heading>Managing the Broker</doc:heading>
  <p>
    To stop the broker or check its status, use
    <code>rabbitmqctl.bat</code> in
    <code>sbin</code> (as an administrator).
  </p>

  <h4>Stopping the Node</h4>
  <p>
<pre class="lang-powershell">
rabbitmqctl.bat stop
</pre>
  </p>

  <h4>Checking Node Status</h4>
  <p>
<pre class="lang-powershell">
rabbitmqctl.bat status
</pre>
  </p>

  <p>
    See <a href="/cli.html">RabbitMQ CLI tools guide</a> and  <a href="man/rabbitmqctl.8.html">rabbitmqctl man page</a> for details.
  </p>

  <h3>Server Logs</h3>
  <p>
    Server logs are critically important in troubleshooting and root cause analysis.
    See <a href="/logging.html">Logging</a> and <a href="/relocate.html">File and Directory Location</a> guides
    to learn about log file location, log rotation and more.
  </p>

  <h3>Troubleshooting When Running as a Service</h3>
  <p>
    In the event that the Erlang VM crashes whilst RabbitMQ is running
    as a service, rather than writing the crash dump to the current
    directory (which doesn't make sense for a service) it is written
    to an <code>erl_crash.dump</code> file in the base directory of
    the RabbitMQ server (set by the <b>RABBITMQ_BASE</b> environment
    variable, defaulting
    to <code>%APPDATA%\%RABBITMQ_SERVICENAME%</code> -
    typically <code>%APPDATA%\RabbitMQ</code> otherwise).
  </p>
</doc:section>
