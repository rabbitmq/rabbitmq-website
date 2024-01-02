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

# Java Libraries

This page lists support and compatibility information for the Java libraries
maintained by the RabbitMQ team.

<table class="release-series">
  <caption>RabbitMQ Java Libraries Support Timeline</caption>
  <tr>
    <th>Library and Branch</th>
    <th>General Support Until <sup>1</sup></th>
    <th>Extended Support <sup>2</sup></th>
    <th>JDK Version Range <sup>3</sup></th>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-java-client" target="_blank" rel="noopener noreferrer">AMQP 0.9.1 Java Client</a> 5.x</td>
    <td>Currently supported</td>
    <td></td>
    <td>8, 11, 17, 21, 22</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-java-client" target="_blank" rel="noopener noreferrer">AMQP 0.9.1 Java Client</a> 4.x</td>
    <td>31 July 2020</td>
    <td>31 December 2020</td>
    <td>6-8</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-stream-java-client" target="_blank" rel="noopener noreferrer">Stream Java Client</a> 0.x</td>
    <td>Currently supported</td>
    <td></td>
    <td>8, 11, 17, 21, 22</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-jms-client" target="_blank" rel="noopener noreferrer">JMS Client</a> 3.x</td>
    <td>Currently supported</td>
    <td></td>
    <td>11, 17, 21, 22</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-jms-client" target="_blank" rel="noopener noreferrer">JMS Client</a> 2.x</td>
    <td>Currently supported</td>
    <td></td>
    <td>8, 11, 17, 21, 22</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-jms-client" target="_blank" rel="noopener noreferrer">JMS Client</a> 1.x</td>
    <td>31 July 2020</td>
    <td>31 December 2020</td>
    <td>6-8</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-perf-test" target="_blank" rel="noopener noreferrer">PerfTest</a> 2.x</td>
    <td>Currently supported</td>
    <td></td>
    <td>8, 11, 17, 21, 22</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/rabbitmq-stream-perf-test" target="_blank" rel="noopener noreferrer">Stream PerfTest</a> 1.x</td>
    <td>Currently supported</td>
    <td></td>
    <td>11, 17, 21, 22</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/hop" target="_blank" rel="noopener noreferrer">Hop</a> 5.x</td>
    <td>Currently supported</td>
    <td></td>
    <td>11, 17, 21, 22</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/hop" target="_blank" rel="noopener noreferrer">Hop</a> 4.x</td>
    <td>31 March 2023</td>
    <td>31 March 2023</td>
    <td>11, 17</td>
  </tr>

  <tr>
    <td><a href="https://github.com/rabbitmq/hop" target="_blank" rel="noopener noreferrer">Hop</a> 3.x</td>
    <td>31 March 2022</td>
    <td>31 July 2022</td>
    <td>8, 11, 17</td>
  </tr>

  <tr>
    <td><a href="https://github.com/reactor/reactor-rabbitmq" target="_blank" rel="noopener noreferrer">Reactor RabbitMQ</a> 1.x</td>
    <td>Currently supported</td>
    <td></td>
    <td>8, 11, 17</td>
  </tr>

</table>

(1) Includes backport of features (if possible), bug and security fixes for non-latest production branches.

(2) Includes only security patches. The library reaches end of life (EOL) once the extended support period ends.

(3) Long-Term Support (LTS) releases of the JDK are fully supported (currently JDK 8, 11, 17, and 21).
Intermediate releases (e.g. 20 and 22) are supported on a best-effort basis, meaning bug reports are accepted and addressed as far as technically possible but without any service level guarantees.
