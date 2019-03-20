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

<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="osx-max-open-files-limit">
    <doc:heading>Controlling System Limits on OS X</doc:heading>
    <xi:include href="max-open-files-limit-intro.xml.inc" />

    <p>
      There are two limits in play: the maximum number of open files the OS kernel
      allows (<code>kern.maxfilesperproc</code>) and the per-user limit (<code>ulimit -n</code>).
      The former must be higher than the latter.
    </p>
    <p>
      To adjust the per-user limit for RabbitMQ, there are several options:

      <ul>
        <li>
          Invoke <code>ulimit -S -n 4096</code> before starting RabbitMQ in foreground.
        </li>
        <li>
          Edit the <a href="https://www.rabbitmq.com/configure.html">rabbitmq-env.conf</a> to
          invoke <code>ulimit</code> before the service is started.
        </li>
        <li>
          <a href="https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md#mac-os-x-el-capitan">Configure max open files limit</a> via <code>launchctl limit</code>
        <code>/etc/launchd.conf</code>.
        </li>
      </ul>
    </p>
    <p>
      Note that limits cannot be changed for running OS processes.
    </p>
    <p>
      For more information about controlling
      <code>kern.maxfilesperproc</code> with <code>sysctl</code>,
      please refer to <a href="https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man8/sysctl.8.html">sysctl(8)</a>
      page in Apple documentation.
    </p>

    <xi:include href="max-open-files-limit-verifying-osx.xml.inc" />
    <xi:include href="max-open-files-limit-tools.xml.inc" />
</doc:section>
