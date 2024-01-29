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

# Java Tools

This page documents some Java-based utility programs (PerfTest, Tracer).

## <a id="load-testing" class="anchor" href="#load-testing">PerfTest</a>

RabbitMQ has a throughput testing tool, [PerfTest](https://github.com/rabbitmq/rabbitmq-perf-test/), that is based on the Java client and can be
configured to simulate basic and advanced workloads as well.

PerfTest Documentation:

 * For [the latest stable release](https://perftest.rabbitmq.com/)
 * For [the latest development build](https://perftest-dev.rabbitmq.com/)

## <a id="stream-load-testing" class="anchor" href="#stream-load-testing">PerfTest for Streams (RabbitMQ Stream Protocol)</a>

There is a separate version of [PerfTest for streams](https://github.com/rabbitmq/rabbitmq-stream-perf-test/) that uses [RabbitMQ Stream Protocol](./stream.html) internally.

Stream PerfTest Documentation:

 * For [the latest stable release](https://rabbitmq.github.io/rabbitmq-stream-perf-test/stable/htmlsingle/)
 * For [the latest development build](https://rabbitmq.github.io/rabbitmq-stream-perf-test/snapshot/htmlsingle/)


## <a id="tracer" class="anchor" href="#tracer">Tracer</a>

The tracer is a very basic, very simple AMQP 0-9-1 protocol analyzer, similar in
purpose to [Wireshark](./amqp-wireshark.html).
Use it with the `runtracer` or `runtracer.bat` script:

<pre class="lang-bash">
runtracer [proxy-port] [upstream-host] [upstream-port]
</pre>

<table>
  <thead>
    <td>Parameter</td>
    <td>Description</td>
    <td>Default value</td>
  </thead>
  <tr>
    <td>proxy-port</td>
    <td>port to listen for incoming client connections on</td>
    <td>5673</td>
  </tr>
  <tr>
    <td>upstream-host</td>
    <td>hostname to use when making an outbound connection in response to an incoming connection</td>
    <td>localhost</td>
  </tr>
  <tr>
    <td>upstream-port</td>
    <td>port number to use when making an outbound connection</td>
    <td>5672</td>
  </tr>
</table>

## <a id="tracer-download" class="anchor" href="#tracer-download">Download and Source Code</a>

Releases can be obtained from [GitHub](https://github.com/rabbitmq/rabbitmq-tracer/releases).

[Source repository](https://github.com/rabbitmq/rabbitmq-tracer) is hosted on GitHub.
