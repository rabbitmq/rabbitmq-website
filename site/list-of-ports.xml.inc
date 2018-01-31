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

<ul>
  <li>4369: <a href="http://erlang.org/doc/man/epmd.html">epmd</a>, a peer discovery service used by RabbitMQ nodes and CLI tools</li>
  <li>5672, 5671: used by AMQP 0-9-1 and 1.0 clients without and with TLS</li>
  <li>
    25672: used for inter-node and CLI tools communication (Erlang distribution server port)
    and is allocated from a dynamic range (limited to a single port by default,
    computed as AMQP port + 20000). See <a href="/networking.html">networking guide</a> for details.
  </li>
  <li>
    35672-35682: used by CLI tools (Erlang distribution client ports) for communication with nodes
    and is allocated from a dynamic range (computed as Erlang dist port + 10000 through
    dist port + 10010). See <a href="/networking.html">networking guide</a> for details.
  </li>
  <li>15672: <a href="/management.html">HTTP API</a> clients and <a href="/management-cli.html">rabbitmqadmin</a> (only if the <a href="/management.html">management plugin</a> is enabled)</li>
  <li>61613, 61614: <a href="https://stomp.github.io/stomp-specification-1.2.html">STOMP clients</a> without and with TLS (only if the <a href="/stomp.html">STOMP plugin</a> is enabled)</li>
  <li>1883, 8883: (<a href="http://mqtt.org/">MQTT clients</a> without and with TLS, if the <a href="/mqtt.html">MQTT plugin</a> is enabled</li>
  <li>15674: STOMP-over-WebSockets clients (only if the <a href="/web-stomp.html">Web STOMP plugin</a> is enabled)</li>
  <li>15675: MQTT-over-WebSockets clients (only if the <a href="/web-mqtt.html">Web MQTT plugin</a> is enabled)</li>
</ul>
