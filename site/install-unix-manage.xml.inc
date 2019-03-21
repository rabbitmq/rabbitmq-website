<?xml version="1.0"?>
<!--
Copyright (c) 2007-2016 Pivotal Software, Inc.

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
             name="managing-unix">
  <doc:heading>Managing the Broker</doc:heading>
  <p>
    To stop the server or check its status, etc., you can use package-specific
    scripts (e.g. the <code>service</code> tool) or invoke
    <code>rabbitmqctl</code> (as an administrator). It should be
    available on the path. All <code>rabbitmqctl</code> commands will
    report the node absence if no broker is running.
  </p>
  <ul>
    <li>Invoke <code>rabbitmqctl stop</code> to stop the server.</li>
    <li>Invoke <code>rabbitmqctl status</code> to check whether it is
      running.</li>
  </ul>
  <p>
    More <a href="man/rabbitmqctl.8.html">info on rabbitmqctl</a>.
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
    You can use the <code>logrotate</code> program
    to do all necessary rotation and compression,
    and you can change it. By default,
    this script runs weekly on files located in default
    <code>/var/log/rabbitmq</code> directory. See
    <code>/etc/logrotate.d/rabbitmq-server</code>
    to configure
    <code>logrotate</code>.
  </p>
</doc:section>
