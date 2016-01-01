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
             xmlns:xi="http://www.w3.org/2003/XInclude"
             name="selinux-ports">
  <doc:heading>Port Access</doc:heading>
  <p>
    SELinux and similar mechanisms may prevent RabbitMQ from binding to a port. When that happens,
    RabbitMQ will fail to start. Make sure the following ports can be opened:

    <xi:include href="list-of-ports.xml.inc" />

    It is possible to <a href="/configure.html">configure RabbitMQ</a> to use different ports.
  </p>
</doc:section>
