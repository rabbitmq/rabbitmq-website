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
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="ports">
  <doc:heading>Port Access</doc:heading>
  <p>
    RabbitMQ nodes bind to ports (open server TCP sockets) in order to accept client and CLI tool connections.
    Other processes and tools such as SELinux may prevent RabbitMQ from binding to a port. When that happens,
    the node will fail to start.

    CLI tools, client libraries and RabbitMQ nodes also open connections (client TCP sockets).
    Firewalls can prevent nodes and CLI tools from communicating with each other.
    Make sure the following ports are accessible:

    <xi:include href="list-of-ports.xml.inc" />

    It is possible to <a href="/configure.html">configure RabbitMQ</a>
    to use <a href="/networking.html">different ports and specific network interfaces</a>.
  </p>
</doc:section>
