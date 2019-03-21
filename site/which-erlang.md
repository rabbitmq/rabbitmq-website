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

# RabbitMQ Erlang Version Requirements

## <a id="intro" class="anchor" href="#intro">Introduction</a>

This guide covers Erlang/OTP version requirements, [Erlang version support policy](#supported-version-policy),
a RabbitMQ/Erlang [compatibility matrix](#compatibility-matrix),
version-specific notes and [ways of provisioning](#erlang-repositories) recent Erlang/OTP releases.

## <a id="unsupported-versions" class="anchor" href="#unsupported-versions">Unsupported Versions</a>

Erlang/OTP versions <strong>older than 20.3 are not supported</strong> by RabbitMQ versions released in 2019.

RabbitMQ <strong>versions prior to 3.7.7 do not support Erlang/OTP 21</strong> or newer.

## <a id="supported-version-policy" class="anchor" href="#supported-version-policy">Supported Erlang Version Policy</a>

Starting in [January 2019](https://groups.google.com/d/msg/rabbitmq-users/G4UJ9zbIYHs/qCeyjkjyCQAJ),
RabbitMQ supports two most recent Erlang release series. Currently the series are <code>20.3.x</code> and <code>21.x</code>.
When Erlang <code>22.0</code> ships, after a 3 month transition period, the supported versions will
be <code>21.2.x</code> and <code>22.x</code>.

The table below provides an Erlang compatibility matrix of currently supported RabbitMQ release series.
For RabbitMQ releases that have reached end of life, see [Unsupported Series Compatibility Matrix](#eol-series).

## <a id="compatibility-matrix" class="anchor" href="#compatibility-matrix">RabbitMQ and Erlang/OTP Compatibility Matrix</a>

<table class="matrix">
  <th><a href="/changelog.html">RabbitMQ version</a></th>
  <th>Minimum required Erlang/OTP</th>
  <th>Maximum supported Erlang/OTP</th>
  <th>Notes</th>

  <tr>
    <td>
      <ul>
        <li><strong>3.7.13</strong></li>
        <li><strong>3.7.12</strong></li>
        <li><strong>3.7.11</strong></li>
        <li><strong>3.7.10</strong></li>
        <li><strong>3.7.9</strong></li>
        <li><strong>3.7.8</strong></li>
        <li><strong>3.7.7</strong></li>
      </ul>
    </td>
    <td>
      <ul>
        <li><strong>20.3.x</strong></li>
      </ul>
    </td>
    <td>
      <ul>
        <li><strong>21.3.x</strong></li>
      </ul>
    </td>
    <td>
      <ul class="plain">
        <li>Erlang/OTP <code>19.3.x</code> support <a href="https://groups.google.com/forum/#!topic/rabbitmq-users/G4UJ9zbIYHs">was discontinued</a> as of Jan 1st, 2019</li>
        <li>For the best TLS support, the latest version of Erlang/OTP 21.x is recommended</li>
        <li>On Windows, Erlang/OTP 20.2 changed <a href="/cli.html#erlang-cookie">default cookie file location</a></li>
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
        <li>20.3.x</li>
      </ul>
    </td>
    <td>
      <ul class="plain">
        <li>For the best TLS support, the latest version of Erlang/OTP 20.3.x is recommended</li>
        <li>Erlang versions prior to 19.3.6.4 have known bugs (e.g. <a href="https://bugs.erlang.org/browse/ERL-430">ERL-430</a>, <a href="https://bugs.erlang.org/browse/ERL-448">ERL-448</a>) that can prevent RabbitMQ nodes from accepting connections (including from CLI tools) and stopping</li>
        <li>Versions prior to 19.3.6.4 are vulnerable to the <a href="https://robotattack.org/">ROBOT attack</a> (CVE-2017-1000385)</li>
        <li>On Windows, Erlang/OTP 20.2 changed <a href="/cli.html">default cookie file location</a></li>
      </ul>
    </td>
  </tr>
</table>

As a rule of thumb, most recent patch versions of each supported Erlang/OTP series
is recommended.

## <a id="erlang-repositories" class="anchor" href="#erlang-repositories">Provisioning Latest Erlang Releases</a>

Most recent versions can be obtained from a number of sources:

 * [Debian Erlang packages](https://bintray.com/rabbitmq-erlang/) from team RabbitMQ.
 * [Zero dependency Erlang RPM](https://github.com/rabbitmq/erlang-rpm) from team RabbitMQ
 * [Erlang Docker images](https://hub.docker.com/_/erlang/)
 * [Erlang Solutions](https://packages.erlang-solutions.com/erlang/) package repositories
 * Building from source with [kerl](https://github.com/kerl/kerl)

## <a id="debian" class="anchor" href="#debian">Installing Erlang/OTP on Debian or Ubuntu</a>

Standard Debian and Ubuntu repositories provide Erlang/OTP but it is
heavily sliced and diced into dozens of packages. In addition, unless the system
has backport repositories enabled, the versions tend to be quite old.
See [Debian and Ubuntu installation guide](/install-debian.html) for
more information on the essential packages, dependencies, and alternative apt repositories.

## <a id="redhat" class="anchor" href="#redhat">Installing Erlang/OTP on RHEL, CentOS and Fedora</a>

There are multiple RPM packages for Erlang/OTP, including a
[zero-dependency Erlang RPM](https://github.com/rabbitmq/erlang-rpm) from the RabbitMQ team.
See [CentOS, RHEL and Fedora installation guide](/install-rpm.html) for more information on the available options.


## <a id="clusters" class="anchor" href="#clusters">Erlang Versions in Clusters</a>

RabbitMQ requires that the same major and minor version of
Erlang is used across all
[cluster nodes](upgrade.html#rolling-upgrades-version-limitations)
(e.g. 20.3.x). RabbitMQ will check for protocol versions of
Erlang and its distributed libraries when a node joins a
cluster, refusing to cluster if there's a potentially
incompatible combination detected.

It is highly recommended that all nodes use exactly the same
version of Erlang.


## <a id="hipe" class="anchor" href="#hipe">HiPE (JIT Compilation)</a>

Erlang installations can optionally be built with support for HiPE, a JIT compiler,
which RabbitMQ can be [configured](/configure.html) to use.

For HiPE support on Debian and Ubuntu, a special HiPE-enabled base
package (<code>erlang-base-hipe</code>) must be installed instead of the regular one (<code>erlang-base</code>).


## <a id="building-from-source" class="anchor" href="#building-from-source">Building from Source</a>

If a sufficiently recent Erlang package is not available for your system then you will need to
[build Erlang from source](http://www.erlang.org/doc/installation_guide/INSTALL.html).
This requires a build environment that satisfies the Erlang build dependencies, such as OpenSSL.
[kerl](https://github.com/kerl/kerl) is the recommended way of doing that.

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
      <ul class="plain">
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
      <li>RabbitMQ 3.6 was released on 2015-12-22, and reached end of life on 2018-05-31, we strongly discourage its use</li>
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
      <ul class="plain">
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
      <ul class="plain">
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
      <ul class="plain">
        <li>RabbitMQ 3.5 was released on 2015-03-11, and reached end of life on 2017-09-11, we strongly discourage its use</li>
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
      <ul class="plain">
        <li>RabbitMQ 3.4 was released 2014-10-21, and reached end of life 2017-05-31, we strongly discourage its use</li>
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
