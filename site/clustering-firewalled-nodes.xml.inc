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
<doc:section name="firewall" xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
                             xmlns:xi="http://www.w3.org/2003/XInclude">
    <doc:heading>Firewalled nodes</doc:heading>
    <p>
        The case for firewalled clustered nodes exists when nodes
        are in a data center or on a reliable network, but separated
        by firewalls. Again, clustering is not recommended over a WAN or
        when network links between nodes are unreliable.
    </p>
    <p>
      In the most common configuration you will need to open
      a number of standard ports:

      <xi:include href="list-of-ports.xml.inc" />

      See <a href="/networking.html">RabbitMQ Networking guide</a> for details.
    </p>
</doc:section>
