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

<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="verifying-limits">
  <doc:heading>Verifying the Limit</doc:heading>
  <p>
    <a href="management.html">RabbitMQ management UI</a> displays the number of file descriptors available
    for it to use on the Overview tab.
<pre class="sourcecode">rabbitmqctl status</pre>
    includes the same value.
  </p>
  <p>
    The following command

<pre  class="sourcecode">
cat /proc/$RABBITMQ_BEAM_PROCESS_PID/limits
</pre>

    can be used to display effective limits of a running process. <code>$RABBITMQ_BEAM_PROCESS_PID</code>
    is the OS PID of the Erlang VM running RabbitMQ, as returned by <code>rabbitmqctl status</code>.
  </p>
</doc:subsection>
