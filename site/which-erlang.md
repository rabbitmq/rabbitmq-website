<!--
Copyright (c) 2007-2020 VMware, Inc. or its affiliates.

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

# RabbitMQ Erlang Version Requirements

## <a id="intro" class="anchor" href="#intro">Introduction</a>

This guide covers Erlang/OTP version requirements, [Erlang version support policy](#supported-version-policy),
a RabbitMQ/Erlang [compatibility matrix](#compatibility-matrix),
version-specific notes and [ways of provisioning](#erlang-repositories) recent Erlang/OTP releases.


## <a id="supported-version-policy" class="anchor" href="#supported-version-policy">Supported Erlang Version Policy</a>

[Starting in January 2019](https://groups.google.com/d/msg/rabbitmq-users/G4UJ9zbIYHs/qCeyjkjyCQAJ),
RabbitMQ supports two most recent Erlang release series: `23.x` and `22.x`.


## <a id="compatibility-matrix" class="anchor" href="#compatibility-matrix">RabbitMQ and Erlang/OTP Compatibility Matrix</a>

The table below provides an Erlang compatibility matrix of currently supported RabbitMQ release series.
For RabbitMQ releases that have reached end of life, see [Unsupported Series Compatibility Matrix](#eol-series).

<table class="matrix">
  <th><a href="/versions.html">RabbitMQ version</a></th>
  <th>Minimum required Erlang/OTP</th>
  <th>Maximum supported Erlang/OTP</th>
  <th>Notes</th>


  <tr>
    <td>
      <ul>
        <li>3.8.11</li>
        <li>3.8.10</li>
        <li>3.8.9</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>22.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>23.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          <a href="https://groups.google.com/forum/#!topic/rabbitmq-users/wlPIWz3UYHQ">Erlang/OTP <code>23</code> compatibility notes</a>
        </li>
        <li>Erlang 23.x is recommended</li>
        <li>Erlang 22.x dropped support for HiPE</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.8.8</li>
        <li>3.8.7</li>
        <li>3.8.6</li>
        <li>3.8.5</li>
        <li>3.8.4</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>21.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>23.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          <a href="https://groups.google.com/forum/#!topic/rabbitmq-users/wlPIWz3UYHQ">Erlang/OTP <code>23</code> compatibility notes</a>
        </li>
        <li>Erlang 22.x or 23.x is recommended</li>
        <li>Erlang 22.x dropped support for HiPE</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.8.3</li>
        <li>3.8.2</li>
        <li>3.8.1</li>
        <li>3.8.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>21.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>22.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>Erlang 22.x is recommended.</li>
        <li>Erlang 22.x dropped support for HiPE</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.7.27</li>
        <li>3.7.26</li>
        <li>3.7.25</li>
        <li>3.7.24</li>
        <li>3.7.23</li>
        <li>3.7.22</li>
        <li>3.7.21</li>
        <li>3.7.20</li>
        <li>3.7.19</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>21.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>22.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          <a href="https://groups.google.com/forum/#!searchin/rabbitmq-users/ANN|sort:date/rabbitmq-users/9tc_OE1eMPk/ly1NEISwBwAJ">Erlang/OTP <code>20.x</code> support is discontinued</a>
        </li>
        <li>Erlang 22.x dropped support for HiPE</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.7.18</li>
        <li>3.7.17</li>
        <li>3.7.16</li>
        <li>3.7.15</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>20.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>22.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li><a href="https://groups.google.com/forum/#!topic/rabbitmq-users/vcRLhpUdg_o">Erlang/OTP <code>22.0</code> compatibility notes</a></li>
        <li><a href="/ssl.html#tls-versions">TLSv1.0 and TLSv1.1 support</a> is disabled by default on Erlang 22.x</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.7.14</li>
        <li>3.7.13</li>
        <li>3.7.12</li>
        <li>3.7.11</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>20.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>21.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li><a href="https://groups.google.com/forum/#!topic/rabbitmq-users/G4UJ9zbIYHs">Erlang/OTP <code>19.x</code> support is discontinued</a></li>
        <li>For the best TLS support, the latest version of Erlang/OTP 21.x is recommended</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.7.10</li>
        <li>3.7.9</li>
        <li>3.7.8</li>
        <li>3.7.7</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>19.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>21.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li><a href="https://groups.google.com/forum/#!topic/rabbitmq-users/EuRwfeTGA_o">Erlang/OTP <code>21.0</code> compatibility notes</a></li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.7.6</li>
        <li>3.7.5</li>
        <li>3.7.4</li>
        <li>3.7.3</li>
        <li>3.7.2</li>
        <li>3.7.1</li>
        <li>3.7.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>19.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>20.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>For the best TLS support, the latest version of Erlang/OTP 20.x is recommended</li>
        <li>Erlang versions prior to 19.3.6.4 have known bugs (e.g. <a href="https://bugs.erlang.org/browse/ERL-430">ERL-430</a>, <a href="https://bugs.erlang.org/browse/ERL-448">ERL-448</a>) that can prevent RabbitMQ nodes from accepting connections (including from CLI tools) and stopping</li>
        <li>Versions prior to 19.3.6.4 are vulnerable to the <a href="https://robotattack.org/">ROBOT attack</a> (CVE-2017-1000385)</li>
        <li>On Windows, Erlang/OTP 20.2 changed <a href="/cli.html">default cookie file location</a></li>
      </ul>
    </td>
  </tr>
</table>

As a rule of thumb, most recent minor & patch versions of each supported Erlang/OTP series
is recommended.

## <a id="erlang-repositories" class="anchor" href="#erlang-repositories">Provisioning Latest Erlang Releases</a>

Most recent versions can be obtained from a number of sources:

 * [Debian Erlang packages](https://bintray.com/rabbitmq-erlang/) from team RabbitMQ.
 * [Zero dependency Erlang RPM](https://github.com/rabbitmq/erlang-rpm) from team RabbitMQ
 * As part of [RabbitMQ Docker image](https://github.com/docker-library/rabbitmq/) or via [Erlang Docker image](https://hub.docker.com/_/erlang/)
 * [Erlang/OTP Version Tree](https://erlang.org/download/otp_versions_tree.html) provides binary builds of patch releases for Windows
 * [Erlang Solutions](https://packages.erlang-solutions.com/erlang/) package repositories
 * Building from source with [kerl](https://github.com/kerl/kerl)

## <a id="debian" class="anchor" href="#debian">Installing Erlang/OTP on Debian or Ubuntu</a>

Standard Debian and Ubuntu repositories provide Erlang/OTP but it is
heavily sliced and diced into dozens of packages. In addition, unless the system
has backport repositories enabled, the versions tend to be quite old.
See [Debian and Ubuntu installation guide](/install-debian.html) for
more information on the essential packages, dependencies, and alternative apt repositories.

## <a id="redhat" class="anchor" href="#redhat">Installing Erlang/OTP on RHEL, CentOS and Fedora</a>

There are multiple RPM packages available for Erlang/OTP. The recommended option is
the [zero-dependency Erlang RPM](https://github.com/rabbitmq/erlang-rpm) from the RabbitMQ team.
It closely follows the latest Erlang/OTP patch release schedule.

See [CentOS, RHEL and Fedora installation guide](/install-rpm.html) for more information on the available options.


## <a id="clusters" class="anchor" href="#clusters">Erlang Versions in Clusters</a>

It is **highly recommended** that the same major version of
Erlang is used across all [cluster nodes](upgrade.html#rolling-upgrades-version-limitations)
(e.g. `22.x`).

RabbitMQ will check for internal protocol versions of
Erlang and its distributed libraries when a node joins a
cluster, refusing to cluster if there's a potentially
incompatible combination detected.

Outside of a reasonably long upgrade time window, it is
recommended that all nodes use exactly the same version of Erlang.


## <a id="hipe" class="anchor" href="#hipe">HiPE (JIT Compilation)</a>

HiPE support has been dropped in Erlang 22. RabbitMQ no longer supports HiPE precompilation.


## <a id="building-from-source" class="anchor" href="#building-from-source">Building Erlang from Source</a>

If a sufficiently recent Erlang package is not available for a given operating system,
Erlang/OTP can be [built from source](http://www.erlang.org/doc/installation_guide/INSTALL.html).
This requires a build environment that satisfies the Erlang build dependencies, such as a
modern OpenSSL version.

[kerl](https://github.com/kerl/kerl) makes building Erlang/OTP releases from
source, including specific tags from GitHub, a much more pleasant experience.


## <a id="old-timers" class="anchor" href="#old-timers">Older RabbitMQ and Erlang Releases</a>

### <a id="eol-series" class="anchor" href="#eol-series">Unsupported RabbitMQ Series</a>

<table class="matrix">
  <th><a href="/changelog.html">Unsupported RabbitMQ Series</a></th>
  <th>Minimum required Erlang/OTP</th>
  <th>Maximum supported Erlang/OTP</th>
  <th>Notes</th>
  <tr>
    <td>
      <ul>
        <li>3.6.16</li>
        <li>3.6.15</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>19.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>20.3.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>RabbitMQ 3.6 was released on 2015-12-22, and reached end of life on 2018-05-31, we strongly discourage its use</li>
        <li>On Windows, Erlang/OTP 20.2 changed <a href="/cli.html">default cookie file location</a></li>
        <li>
          Versions prior to 19.3.6.4 have known bugs (e.g. <a href="https://bugs.erlang.org/browse/ERL-430">ERL-430</a>, <a href="https://bugs.erlang.org/browse/ERL-448">ERL-448</a>)
          that can prevent RabbitMQ nodes from accepting connections (including from CLI tools) and stopping
        </li>
        <li>Versions prior to 19.3.6.4 are vulnerable to the <a href="https://robotattack.org/">ROBOT attack</a> (CVE-2017-1000385)</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.6.14</li>
        <li>3.6.13</li>
        <li>3.6.12</li>
        <li>3.6.11</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>R16B03</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>20.1.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>RabbitMQ 3.6 was released on 2015-12-22, and reached end of life on 2018-05-31, we strongly discourage its use</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.6.10</li>
        <li>3.6.9</li>
        <li>3.6.8</li>
        <li>3.6.7</li>
        <li>3.6.6</li>
        <li>3.6.5</li>
        <li>3.6.4</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>R16B03</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>19.3.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>RabbitMQ 3.6 was released on 2015-12-22, and reached end of life on 2018-05-31, we strongly discourage its use</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.6.3</li>
        <li>3.6.2</li>
        <li>3.6.1</li>
        <li>3.6.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>R16B03</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>18.3.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>RabbitMQ 3.6 was released on 2015-12-22, and reached end of life on 2018-05-31, we strongly discourage its use</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.5.x</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>R14B04</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>17.5.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>RabbitMQ 3.5 was released on 2015-03-11, and reached end of life on 2016-10-31, we strongly discourage its use</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.4.x</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>R13B03</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>16B03</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>RabbitMQ 3.4 was released 2014-10-21, and reached end of life 2015-10-31, we strongly discourage its use</li>
      </ul>
    </td>
  </tr>
</table>


### <a id="r16b03" class="anchor" href="#r16b03">Last Version to Support R16B03</a>

If you absolutely must use an older version of Erlang, RabbitMQ
3.6.14 is the newest version compatible with R16B03.

### <a id="r13b03" class="anchor" href="#r13b03">Last Version to Support R13B03</a>

If you absolutely must use an older version of Erlang, [RabbitMQ 3.5.8](https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_5_8)
is the newest version compatible with R13B03.
