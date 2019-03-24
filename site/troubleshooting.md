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

# Troubleshooting Guidance

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide provides an overview of several topics related to troubleshooting of RabbitMQ installations and
messaging-based systems:

 * [Monitoring and health checks](#monitoring)
 * [Logging](#logging)
 * [Node configuration](#configuration)
 * [Client connectivity](#networking)
 * [CLI tool connectivity](#cli) and authentication
 * [Cluster formation](#cluster-formation)
 * [Node memory usage](#memory-usage)
 * [Connections](#connections) and connection leaks
 * [Channels](#channels) and channel leaks
 * [TLS](#tls)
 * [LDAP](#ldap)
 * [Traffic captures](#capturing-traffic)

node memory usage, metrics and monitoring,
TLS, and more.


## <a id="monitoring" class="anchor" href="#monitoring">Monitoring, Metrics, Health Checks</a>

A very important aspect of troubleshooting a production system is [monitoring and health checks](/monitoring.html).
They collect data that can be inspected and analysed, helping identify and detect anomalies.

## <a id="logging" class="anchor" href="#logging">Logging</a>

Logs is another important source of information for troublshooting. Separate [guide on logging](/logging.html)
explains where to find log files, how to adjust log levels, what log categories exist, connection
lifecycle events that can be detected using log files, and more.


## <a id="configuration" class="anchor" href="#configuration">Node Configuration</a>

[Configuration guide](/configuration.html) contains a section on [locating config file](/configure.html#verify-configuration-config-file-location).

Effective node configuration can be inspected using <code>[rabbitmqctl](/cli.html) environment</code> as
well as a number of [rabbitmq-diagnostics](/cli.html) commands.


## <a id="cli" class="anchor" href="#cli">CLI Tools Connectivity and Authentication</a>

[CLI Tools guide](/cli.html#erlang-cookie) explains how CLI tools authenticate to nodes, what the Erlang
cookie file is, and most common reasons why CLI tools fail to perform operations on server nodes.


## <a id="cluster-formation" class="anchor" href="#cluster-formation">Cluster Formation</a>

[Cluster Formation guide](/cluster-formation.html) contains a [troubleshooting section](/cluster-formation.html#troubleshooting-cluster-formation).


## <a id="memory-usage" class="anchor" href="#memory-usage">Memory Usage Analysis</a>

[Reasoning About Memory Use](/memory-use.html) is a dedicated guide on the topic.


## <a id="networking" class="anchor" href="#networking">Networking and Connectivity</a>

[Troubleshooting Networking](/troubleshooting-networking.html) is a dedicated guide on the topic of networking and connectivity.


## <a id="connections" class="anchor" href="#connections">Connections</a>

[Connections guide](/connections.html) explains how to identify application connection leaks and other
relevant topics.


## <a id="channels" class="anchor" href="#channels">Channels</a> (AMQP 0-9-1)

[Channels guide](/channels.html) explains what [channel-level exceptions](/channels.html#error-handling) mean,
how to identify application channel leaks and other relevant topics.


## <a id="tls" class="anchor" href="#tls">TLS</a>

[Troubleshooting TLS](/troubleshooting-ssl.html) is a dedicated guide on the topic of TLS.


## <a id="ldap" class="anchor" href="#ldap">LDAP</a>

[LDAP guide](/ldap.html#troubleshooting) explains how to enable LDAP decision and query logging.


## <a id="capturing-traffic" class="anchor" href="#capturing-traffic">Capturing Traffic</a>

A [traffic capture](/amqp-wireshark.html) can provide a lot of information useful when troubleshooting network connectivity, application behaviour,
connection leaks, channel leaks and more. tcpdump and Wireshark and industry standard open source tools
for capturing and analyzing network traffic.
