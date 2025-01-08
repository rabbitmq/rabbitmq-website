---
title: Troubleshooting Guidance
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

## Overview {#overview}

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
 * [OAuth 2.0](#oauth2)
 * [Traffic captures](#capturing-traffic)

node memory usage, metrics and monitoring,
TLS, and more.


## Monitoring, Metrics, Health Checks {#monitoring}

A very important aspect of troubleshooting a production system is [monitoring and health checks](./monitoring).
They collect data that can be inspected and analysed, helping identify and detect anomalies.

## Logging {#logging}

Logs is another important source of information for troubleshooting. Separate [guide on logging](./logging)
explains where to find log files, how to adjust log levels, what log categories exist, connection
lifecycle events that can be detected using log files, and more.


## Node Configuration {#configuration}

[Configuration guide](./configure) contains a section on [locating config file](./configure#verify-configuration-config-file-location).

Effective node configuration can be inspected using <code>[rabbitmqctl](./cli) environment</code> as
well as a number of [rabbitmq-diagnostics](./cli) commands.


## CLI Tools Connectivity and Authentication {#cli}

[CLI Tools guide](./cli#erlang-cookie) explains how CLI tools authenticate to nodes, what the Erlang
cookie file is, and most common reasons why CLI tools fail to perform operations on server nodes.


## Cluster Formation {#cluster-formation}

[Cluster Formation guide](./cluster-formation) contains a [troubleshooting section](./cluster-formation#troubleshooting).


## Memory Usage Analysis {#memory-usage}

[Reasoning About Memory Use](./memory-use) is a dedicated guide on the topic.


## Networking and Connectivity {#networking}

[Troubleshooting Networking](./troubleshooting-networking) is a dedicated guide on the topic of networking and connectivity.


## Authentication and Authorisation {#authentication}

[Access Control guide](./access-control) contains sections on [troubleshooting client authentication](./access-control#troubleshooting-authn)
and [troubleshooting authorisation](./access-control#troubleshooting-authz).


## Runtime Crash Dump Files {#crash-dumps}

When the Erlang runtime system exits abnormally, a file named `erl_crash.dump`
is written to the directory where RabbitMQ was started from. This file contains
the state of the runtime at the time of the abnormal exit. The termination
reason will be available within the first few lines, starting with `Slogan`, e.g.:

```bash
head -n 3 ./erl_crash.dump
# => =erl_crash_dump:0.5
# => Sun Aug 25 00:57:34 2019
# => Slogan: Kernel pid terminated (application_controller) ({application_start_failure,rabbit,{{timeout_waiting_for_tables,[rabbit_user,rabbit_user_permission,rabbit_topic_permission,rabbit_vhost,rabbit_durable_r
```

In this specific example, the slogan (uncaught exception message) says that a started node
timed out [syncing schema metadata from its peers](./clustering#restarting), likely because they did not come online
in the configured window of time.

To better understand the state of the Erlang runtime from a <a href="http://erlang.org/doc/apps/erts/crash_dump.html" target="_blank" rel="noopener noreferrer">crash dump file</a>, it
helps to visualise it. The Crash Dump Viewer tool, `cdv`, is part of the Erlang installation.
The `cdv` binary path is dependent on the Erlang version and the location where it was installed.

This is an example of how to invoke it:

```bash
/usr/local/lib/erlang/lib/observer-2.9.1/priv/bin/cdv ./erl_crash.dump
```

A successful result of the above command will open a new application window similar to this:

![Erlang Crash Dump Viewer](./erlang-crash-dump-viewer.png)

For the above to work, the system must have a graphical user interface, and
Erlang must have been complied with both observer & Wx support.


## Connections {#connections}

[Connections guide](./connections) explains how to identify application connection leaks and other
relevant topics.


## Channels {#channels}

[Channels guide](./channels) explains what [channel-level exceptions](./channels#error-handling) mean,
how to identify application channel leaks and other relevant topics.


## TLS {#tls}

[Troubleshooting TLS](./troubleshooting-ssl) is a dedicated guide on the topic of TLS.


## LDAP {#ldap}

[LDAP guide](./ldap#troubleshooting) explains how to enable LDAP decision and query logging.

## OAuth 2.0 {#oauth2}

[OAuth 2.0](./troubleshooting-oauth2) is a dedicated guide on the topic of OAuth 2.0.

## Capturing Traffic {#capturing-traffic}

A [traffic capture](/amqp-wireshark) can provide a lot of information useful when troubleshooting network connectivity, application behaviour,
connection leaks, channel leaks and more. tcpdump and Wireshark and industry standard open source tools
for capturing and analyzing network traffic.
