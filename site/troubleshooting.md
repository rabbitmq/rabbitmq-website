<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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
 * [Client authentication](#authentication) and authorisation
 * [CLI tool connectivity](#cli) and authentication
 * [Runtime crash dumps](#crash-dumps)
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

A very important aspect of troubleshooting a production system is [monitoring and health checks](./monitoring.html).
They collect data that can be inspected and analysed, helping identify and detect anomalies.

## <a id="logging" class="anchor" href="#logging">Logging</a>

Logs is another important source of information for troubleshooting. Separate [guide on logging](./logging.html)
explains where to find log files, how to adjust log levels, what log categories exist, connection
lifecycle events that can be detected using log files, and more.


## <a id="configuration" class="anchor" href="#configuration">Node Configuration</a>

[Configuration guide](./configure.html) contains a section on [locating config file](./configure.html#verify-configuration-config-file-location).

Effective node configuration can be inspected using <code>[rabbitmqctl](./cli.html) environment</code> as
well as a number of [rabbitmq-diagnostics](./cli.html) commands.


## <a id="cli" class="anchor" href="#cli">CLI Tools Connectivity and Authentication</a>

[CLI Tools guide](./cli.html#erlang-cookie) explains how CLI tools authenticate to nodes, what the Erlang
cookie file is, and most common reasons why CLI tools fail to perform operations on server nodes.


## <a id="cluster-formation" class="anchor" href="#cluster-formation">Cluster Formation</a>

[Cluster Formation guide](./cluster-formation.html) contains a [troubleshooting section](./cluster-formation.html#troubleshooting-cluster-formation).


## <a id="memory-usage" class="anchor" href="#memory-usage">Memory Usage Analysis</a>

[Reasoning About Memory Use](./memory-use.html) is a dedicated guide on the topic.


## <a id="networking" class="anchor" href="#networking">Networking and Connectivity</a>

[Troubleshooting Networking](./troubleshooting-networking.html) is a dedicated guide on the topic of networking and connectivity.


## <a id="authentication" class="anchor" href="#authentication">Authentication and Authorisation</a>

[Access Control guide](./access-control.html) contains sections on [troubleshooting client authentication](./access-control.html#troubleshooting-authn)
and [troubleshooting authorisation](./access-control.html#troubleshooting-authz).


## <a id="crash-dumps" class="anchor" href="#crash-dumps">Runtime Crash Dump Files</a>

When the Erlang runtime system exits abnormally, a file named `erl_crash.dump`
is written to the directory where RabbitMQ was started from. This file contains
the state of the runtime at the time of the abnormal exit. The termination
reason will be available within the first few lines, starting with `Slogan`, e.g.:

<pre class="lang-bash">
head -n 3 ./erl_crash.dump
# =&gt; =erl_crash_dump:0.5
# =&gt; Sun Aug 25 00:57:34 2019
# =&gt; Slogan: Kernel pid terminated (application_controller) ({application_start_failure,rabbit,{{timeout_waiting_for_tables,[rabbit_user,rabbit_user_permission,rabbit_topic_permission,rabbit_vhost,rabbit_durable_r
</pre>

In this specific example, the slogan (uncaught exception message) says that a started node
timed out [syncing schema metadata from its peers](./clustering.html#restarting), likely because they did not come online
in the configured window of time.

To better understand the state of the Erlang runtime from a <a href="http://erlang.org/doc/apps/erts/crash_dump.html" target="_blank" rel="noopener noreferrer">crash dump file</a>, it
helps to visualise it. The Crash Dump Viewer tool, `cdv`, is part of the Erlang installation.
The `cdv` binary path is dependent on the Erlang version and the location where it was installed.

This is an example of how to invoke it:

<pre class="lang-bash">
/usr/local/lib/erlang/lib/observer-2.9.1/priv/bin/cdv ./erl_crash.dump
</pre>

A successful result of the above command will open a new application window similar to this:

![Erlang Crash Dump Viewer](./img/erlang-crash-dump-viewer.png)

For the above to work, the system must have a graphical user interface, and
Erlang must have been complied with both observer & Wx support.


## <a id="connections" class="anchor" href="#connections">Connections</a>

[Connections guide](connections.html) explains how to identify application connection leaks and other
relevant topics.


## <a id="channels" class="anchor" href="#channels">Channels</a> (AMQP 0-9-1)

[Channels guide](channels.html) explains what [channel-level exceptions](./channels.html#error-handling) mean,
how to identify application channel leaks and other relevant topics.


## <a id="tls" class="anchor" href="#tls">TLS</a>

[Troubleshooting TLS](./troubleshooting-ssl.html) is a dedicated guide on the topic of TLS.


## <a id="ldap" class="anchor" href="#ldap">LDAP</a>

[LDAP guide](./ldap.html#troubleshooting) explains how to enable LDAP decision and query logging.


## <a id="capturing-traffic" class="anchor" href="#capturing-traffic">Capturing Traffic</a>

A [traffic capture](./amqp-wireshark.html) can provide a lot of information useful when troubleshooting network connectivity, application behaviour,
connection leaks, channel leaks and more. tcpdump and Wireshark and industry standard open source tools
for capturing and analyzing network traffic.
