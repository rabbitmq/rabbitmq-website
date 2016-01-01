<?xml version="1.0"?>
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

<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             name="managing-windows">
  <doc:heading>Managing the Broker</doc:heading>
  <p>
    To stop the broker or check its status, use
    <code>rabbitmqctl.bat</code> in
    <code>sbin</code> (as an administrator).
  </p>

  <dl class="instructions">
    <dt>Stopping the Broker</dt>
    <dd>
      <p>
        Use <code>rabbitmqctl stop</code>.
      </p>
    </dd>

    <dt>Checking the Broker Status</dt>
    <dd>
      <p>
        Use <code>rabbitmqctl status</code>.
        All rabbitmqctl commands will report the node absence
        if no broker is running (i.e. nodedown).
      </p>
    </dd>
  </dl>
  <p>
    More  <a href="man/rabbitmqctl.1.man.html">info on rabbitmqctl</a>
  </p>

  <h3>Logging</h3>
  <p>
    Output from the server is sent to a
    <b>RABBITMQ_NODENAME</b>.log file in the
    <b>RABBITMQ_LOG_BASE</b> directory. Additional log data is
    written to <b>RABBITMQ_NODENAME</b>-sasl.log.
  </p>
  <p>
    The broker always appends to the log files, so a complete
    log history is retained.
  </p>
  <p>
    You can rotate logs using <code>rabbitmqctl rotate_logs</code>.
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
