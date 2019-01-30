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

<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc">
  <doc:heading>Managing the Broker</doc:heading>
  <p>
    To stop the server or check its status, etc., you can invoke
    <code>sbin/rabbitmqctl</code> (as the user running
    <code>rabbitmq-server</code>). All <code>rabbitmqctl</code>
    commands will report the node absence if no broker is running.
  </p>
  <ul>
    <li>Invoke <code>rabbitmqctl stop</code> to stop the server.</li>
    <li>Invoke <code>rabbitmqctl status</code> to check whether it is
      running.</li>
  </ul>
  <p>
    More <a href="man/rabbitmqctl.8.html">info on rabbitmqctl</a>.
  </p>
</doc:section>
