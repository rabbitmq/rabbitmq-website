<?xml version="1.0"?>
<!DOCTYPE doc:subsection [
<!ENTITY % entities SYSTEM "rabbit.ent" >
%entities;
]>
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
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="">
    <doc:heading>File Locations</doc:heading>
    <p>
      The generic binary build is designed to run without granted
      permissions to directories outside of its base one. The <a href="/relocate.html">directories and files</a> used by default are
      all held under the installation directory <code>rabbitmq_server-&version-server;</code>
      which is in the <span class="envvar">$RABBITMQ_HOME</span>
      variable in the scripts.
    </p>
    <p>
      The node can be <a href="/relocate.html">instructed</a> to use more
      conventional system directories for <a href="/configure.html">configuration</a>,
      node data directory, <a href="/logging.html">log</a> files, <a href="/plugins.html">plugins</a> and so on.
    </p>
    <p>
      In order to make the node use operating system defaults, locate the following line

<pre class="sourcecode shell">
SYS_PREFIX=${RABBITMQ_HOME}
</pre>

      in the <code>sbin/rabbitmq-defaults</code> script and
      change this line to:

<pre class="sourcecode">
SYS_PREFIX=
</pre>

      but do not modify any other line in this script.
    </p>
    <p>
      <strong>Important</strong>: after this modification the default directory
      locations may point to non-existent directories or directories that the effective
      node user won't have permissions for. In particular
      <strong>RABBITMQ_MNESIA_BASE</strong> and
      <strong>RABBITMQ_LOG_BASE</strong> may need to be created (the
      server will attempt to create them at startup), and the
      <strong>RABBITMQ_ENABLED_PLUGINS_FILE</strong> will need
      to be writable (for <a href="/cli.html">rabbitmq-plugins</a>).
      The configuration files will be looked for
      in <code>/etc/rabbitmq/</code>.
    </p>
</doc:subsection>
