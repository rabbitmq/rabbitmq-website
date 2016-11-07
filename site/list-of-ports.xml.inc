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
  <li>4369 (epmd)</li>
  <li>5672, 5671 (AMQP 0-9-1 and 1.0 without and with TLS)</li>
  <li>
    25672. This port used by Erlang distribution for inter-node and CLI tools communication
    and is allocated from a dynamic range (limited to a single port by default,
    computed as AMQP port + 20000). See <a href="/networking.html">networking guide</a> for details.
  </li>
  <li>15672 (if management plugin is enabled)</li>
  <li>61613, 61614 (if STOMP is enabled)</li>
  <li>1883, 8883 (if MQTT is enabled)</li>
</ul>
