<?xml version="1.0"?>
<!--
Copyright (C) 2007-2015 Pivotal Software, Inc. 

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
<doc:section name="firewall" xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc">
    <doc:heading>Firewalled nodes</doc:heading>
    <p>
        The case for firewalled clustered nodes exists when nodes
        are in a data center or on a reliable network, but separated
        by firewalls. Again, clustering is not recommended over a WAN or
        when network links between nodes are unreliable.
    </p>
    <p>
      In the most common configuration you will need to open
      ports 4369 and 25672 for clustering to work.
    </p>
    <p>
      Erlang makes use of a Port Mapper Daemon (epmd) for
      resolution of node names in a cluster. The default epmd
      port is 4369, but this can be changed using the <span
      class="envvar">ERL_EPMD_PORT</span> environment
      variable. All nodes must use the same port. For further
      details see the <a
      href="http://www.erlang.org/doc/man/epmd.html">Erlang epmd
      manpage</a>.
    </p>
    <p>
      Once a distributed Erlang node address has been resolved
      via epmd, other nodes will attempt to communicate directly
      with that address using the Erlang distributed node
      protocol. The default port for this traffic in RabbitMQ is
      20000 higher than <span
      class="envvar">RABBITMQ_NODE_PORT</span> (i.e. 25672 by
      default). This can be explicitly configured using the
      <span class="envvar">RABBITMQ_DIST_PORT</span> variable -
      see <a href="configure.html">the configuration guide</a>.
    </p>
</doc:section>
