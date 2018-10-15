<?xml version="1.0"?>
<!DOCTYPE doc:subsection [
<!ENTITY % entities SYSTEM "rabbit.ent" >
%entities;
]>
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

<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="running-generic-unix">
  <doc:heading>Run RabbitMQ Server</doc:heading>
  <div class="instructions">
    <h4>Overview</h4>

    <p>
      Unlike some other installation methods, namely the <a href="/install-debian.html">Debian</a> and <a href="/install-rpm.html">RPM packages</a>, RabbitMQ
      generic UNIX binary build does not require <code>sudo</code>. It can be uncompressed
      into any location and started and managed using the tools under <code>sbin</code>.
      Default <a href="/relocate.html">data directory location</a> will be under <code>./var</code>,
      that is, in the installation directory.
    </p>

    <h4>Starting the Server</h4>
    <p>
      To start the server, run the <code>sbin/rabbitmq-server</code> script. This
      displays a short banner message, concluding with the message
      "completed with <i>[n]</i> plugins.", indicating that the
      RabbitMQ broker has been started successfully.
    </p>
    <p>
      To start the server in "detached" mode, use
      <code>rabbitmq-server -detached</code>. This will run
      the node process in the background.
    </p>

    <h4>Stopping the Server</h4>    
    <p>
      To top a running node, use <code>sbin/rabbitmqctl shutdown</code>. The command
      will wait for the node process to stop. If the target node is not running,
      it will exit with an error.
    </p>
  </div>

  <div class="instructions">
    <h4>Configure the Server</h4>
    <p>
      It is possible to <a
      href="configure.html#customise-general-unix-environment">customise
      the RabbitMQ environment</a> by setting environment
      variables in <code><span
      class="envvar">$RABBITMQ_HOME</span>/etc/rabbitmq/rabbitmq-env.conf</code>. Server
      components may be configured, too, in the <a
      href="configure.html#configuration-file">RabbitMQ configuration
      file</a> located at <code><span
      class="envvar">$RABBITMQ_HOME</span>/etc/rabbitmq/rabbitmq.config</code>.
      Neither of these files exist after installation.
    </p>
  </div>
</doc:subsection>
