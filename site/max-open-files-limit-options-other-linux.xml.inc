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
             name="linux-max-open-files-limit-options-other-linux">

  <h3>With systemd (Recent Linux Distributions)</h3>
  <p>
    On distributions that use systemd, the OS limits are controlled via
    a configuration file at <code>/etc/systemd/system/rabbitmq-server.service.d/limits.conf</code>,
    for example:

<pre class="sourcecode">
[Service]
LimitNOFILE=300000
</pre>
  </p>  

  <h3>Without systemd (Older Linux Distributions)</h3>
  <p>
    The most straightforward way to adjust the per-user limit for
    RabbitMQ on distributions that do not use systemd is to edit the <a href="http://www.rabbitmq.com/configure.html">rabbitmq-env.conf</a>
    to invoke <code>ulimit</code> before the service is started.

<pre class="sourcecode">
ulimit -S -n 4096
</pre>
  </p>

  <p>
    This <em>soft</em> limit cannot go higher than the <em>hard</em> limit
    (which defaults to 4096 in many distributions).
    <a href="https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.3/using/performance/open-files-limit.md">The hard limit can be increased</a> via
    <code>/etc/security/limits.conf</code>. This also requires enabling the <a href="http://askubuntu.com/a/34559">pam_limits.so</a> module
    and re-login or reboot.
  </p>

  <p>
    Note that limits cannot be changed for running OS processes.
  </p>
</doc:section>
