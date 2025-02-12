---
title: Erlang Version Requirements
displayed_sidebar: docsSidebar
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

# Erlang Version Requirements

## Introduction {#intro}

This guide covers Erlang/OTP version requirements, [Erlang version support policy](#supported-version-policy),
a RabbitMQ/Erlang [compatibility matrix](#compatibility-matrix),
version-specific notes and [ways of provisioning](#erlang-repositories) recent Erlang/OTP releases.


## Supported Erlang Version Policy {#supported-version-policy}

RabbitMQ supports up to [two most recent Erlang release series](https://groups.google.com/d/msg/rabbitmq-users/G4UJ9zbIYHs/qCeyjkjyCQAJ).

At the moment they are Erlang `26.x` and `25.x`.

### Erlang 27 Support

Erlang 27 is supported starting with RabbitMQ 4.0.4.

### Erlang 26 Support

Erlang 26 is supported starting with RabbitMQ 3.12.0.


## RabbitMQ and Erlang/OTP Compatibility Matrix {#compatibility-matrix}

The table below provides an Erlang compatibility matrix of currently supported RabbitMQ release series.
For RabbitMQ releases that have reached end of life, see [Unsupported Series Compatibility Matrix](#eol-series).

<table class="matrix">
  <th><a href="/release-information">RabbitMQ version</a></th>
  <th>Minimum required Erlang/OTP</th>
  <th>Maximum supported Erlang/OTP</th>
  <th>Notes</th>

  <tr>
    <td>
      <ul>
        <li>4.0.6</li>
        <li>4.0.5</li>
        <li>4.0.4</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>26.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>27.x</li>
      </ul>
    </td>
        <td>
      <ul class="notes">
        <li>
          The starting with the 4.0.4 release, the 4.0.x release series is compatible with Erlang 27.
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>4.0.3</li>
        <li>4.0.2</li>
        <li>4.0.1</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>26.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>26.2.x</li>
      </ul>
    </td>
        <td>
      <ul class="notes">
        <li>
          The 4.0 release series is compatible with Erlang 26.2.
        </li>
        :::important

        RabbitMQ versions prior to 4.0.4 are not compatible with Erlang 27.

        :::
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.13.7</li>
        <li>3.13.6</li>
        <li>3.13.5</li>
        <li>3.13.4</li>
        <li>3.13.3</li>
        <li>3.13.2</li>
        <li>3.13.1</li>
        <li>3.13.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>26.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>26.2.x</li>
      </ul>
    </td>
        <td>
      <ul class="notes">
        <li>
          The 3.13 release series is compatible with Erlang 26.
        </li>
        <li>
          Starting with Erlang 26, <a href="./ssl#peer-verification">TLS client peer verification</a> is enabled by default by the TLS implementation.
          If client TLS certificate and key pair is not configured, TLS-enabled <a href="./shovel#ssl">Shovels</a>, <a href="./federation#tls-connections">Federation links</a> and <a href="./ldap#tls">LDAP server connections</a>
          will fail. If peer verification is not necessary, it can be disabled.
        </li>
        <li>
          OpenSSL 3 support in Erlang is considered to
          be mature and ready for production use.
        </li>
        <li>
          Erlang 26.1 and later versions <a href="https://github.com/erlang/otp/pull/7392">supports FIPS mode on OpenSSL 3</a>
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.12.13</li>
        <li>3.12.12</li>
        <li>3.12.11</li>
        <li>3.12.10</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>26.2.x</li>
      </ul>
    </td>
        <td>
      <ul class="notes">
        <li>
          The 3.12 release series is compatible with Erlang 26.
        </li>
        <li>
          Starting with Erlang 26, <a href="./ssl#peer-verification">TLS client peer verification</a> is enabled by default by the TLS implementation.
          If client TLS certificate and key pair is not configured, TLS-enabled <a href="./shovel#ssl">Shovels</a>, <a href="./federation#tls-connections">Federation links</a> and <a href="./ldap#tls">LDAP server connections</a>
          will fail. If peer verification is not necessary, it can be disabled.
        </li>
        <li>
          OpenSSL 3 support in Erlang is considered to
          be mature enough for production.
        </li>
        <li>
          Erlang 26.1 and later versions <a href="https://github.com/erlang/otp/pull/7392">supports FIPS mode on OpenSSL 3</a>
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.12.9</li>
        <li>3.12.8</li>
        <li>3.12.7</li>
        <li>3.12.6</li>
        <li>3.12.5</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>26.1.x</li>
      </ul>
    </td>
        <td>
      <ul class="notes">
        <li>
          The 3.12 release series is compatible with Erlang 26.
        </li>
        <li>
          Starting with Erlang 26, <a href="./ssl#peer-verification">TLS client peer verification</a> is enabled by default by the TLS implementation.
          If client TLS certificate and key pair is not configured, TLS-enabled <a href="./shovel#ssl">Shovels</a>, <a href="./federation#tls-connections">Federation links</a> and <a href="./ldap#tls">LDAP server connections</a>
          will fail. If peer verification is not necessary, it can be disabled.
        </li>
        <li>
          OpenSSL 3 support in Erlang is considered to
          be mature enough for production.
        </li>
        <li>
          Erlang 26.1 <a href="https://github.com/erlang/otp/pull/7392">supports FIPS mode on OpenSSL 3</a>
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <ul>
        <li>3.12.4</li>
        <li>3.12.3</li>
        <li>3.12.2</li>
        <li>3.12.1</li>
        <li>3.12.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>26.0.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          The 3.12 release series is compatible with Erlang 26.
        </li>
        <li>
          OpenSSL 3 support in Erlang is considered to
          be mature enough for production.
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.11.28</li>
        <li>3.11.27</li>
        <li>3.11.26</li>
        <li>3.11.25</li>
        <li>3.11.24</li>
        <li>3.11.23</li>
        <li>3.11.22</li>
        <li>3.11.21</li>
        <li>3.11.20</li>
        <li>3.11.19</li>
        <li>3.11.18</li>
        <li>3.11.17</li>
        <li>3.11.16</li>
        <li>3.11.15</li>
        <li>3.11.14</li>
        <li>3.11.13</li>
        <li>3.11.12</li>
        <li>3.11.11</li>
        <li>3.11.10</li>
        <li>3.11.9</li>
        <li>3.11.8</li>
        <li>3.11.7</li>
        <li>3.11.6</li>
        <li>3.11.5</li>
        <li>3.11.4</li>
        <li>3.11.3</li>
        <li>3.11.2</li>
        <li>3.11.1</li>
        <li>3.11.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.3.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          Erlang 26 is supported starting with RabbitMQ 3.12.0.
        </li>
        <li>
          As of Erlang 25.1, OpenSSL 3.0 support in Erlang is considered to
          be mature enough for production.
        </li>
        <li>
          Erlang 25 before 25.0.2 is affected by <a href="https://nvd.nist.gov/vuln/detail/CVE-2022-37026">CVE-2022-37026</a>,
          a CVE with critical severity (CVSS 3.x Base Score: 9.8)
        </li>
      </ul>
    </td>
  </tr>
</table>

As a guideline, most recent minor and patch versions of each supported Erlang/OTP series
are recommended.

## Provisioning Latest Erlang Releases {#erlang-repositories}

Most recent versions can be obtained from a number of sources:

 * Debian Erlang packages from Team RabbitMQ on [Cloudsmith and its mirror](install-debian#apt-cloudsmith) or [Launchpad](install-debian#apt-launchpad-erlang)
 * [Zero dependency Erlang RPM](https://github.com/rabbitmq/erlang-rpm) from Team RabbitMQ, also available [from a Cloudsmith mirror](install-rpm#cloudsmith)
 * As part of [RabbitMQ Docker image](https://github.com/docker-library/rabbitmq/)
 * [Erlang/OTP Version Tree](https://erlang.org/download/otp_versions_tree) provides binary builds of patch releases for Windows
 * [Erlang Solutions](https://packages.erlang-solutions.com/erlang/) package repositories
 * Building from source with [kerl](https://github.com/kerl/kerl)

## Installing Erlang/OTP on Debian or Ubuntu {#debian}

Standard Debian and Ubuntu repositories provide Erlang/OTP but it is
heavily sliced and diced into dozens of packages. In addition, unless the system
has backport repositories enabled, the versions tend to be quite old.
See [Debian and Ubuntu installation guide](./install-debian) for
more information on the essential packages, dependencies, and alternative apt repositories.

## Installing Erlang/OTP on RHEL, CentOS and Fedora {#redhat}

There are multiple RPM packages available for Erlang/OTP. The recommended option is
the [zero-dependency Erlang RPM](https://github.com/rabbitmq/erlang-rpm) from the RabbitMQ team.
It closely follows the latest Erlang/OTP patch release schedule.

See [CentOS, RHEL and Fedora installation guide](./install-rpm) for more information on the available options.


## Erlang Versions in Clusters {#clusters}

It is **highly recommended** that the same major version of
Erlang is used across all [cluster nodes](./upgrade#rabbitmq-erlang-version-requirement)
(e.g. `25.x`).

RabbitMQ will check for internal protocol versions of
Erlang and its distributed libraries when a node joins a
cluster, refusing to cluster if there's a potentially
incompatible combination detected.

Outside of a reasonably long upgrade time window, it is
recommended that all nodes use exactly the same version of Erlang.


## Building Erlang from Source {#building-from-source}

If a sufficiently recent Erlang package is not available for a given operating system,
Erlang/OTP can be [built from source](http://www.erlang.org/doc/installation_guide/INSTALL.html).
This requires a build environment that satisfies the Erlang build dependencies, such as a
modern OpenSSL version.

[kerl](https://github.com/kerl/kerl) makes building Erlang/OTP releases from
source, including specific tags from GitHub, a much more pleasant experience.


## Older RabbitMQ and Erlang Releases {#old-timers}

### Unsupported RabbitMQ Series {#eol-series}

<table class="matrix">
  <th><a href="/release-information">Unsupported RabbitMQ Series</a></th>
  <th>Minimum required Erlang/OTP</th>
  <th>Maximum supported Erlang/OTP</th>
  <th>Notes</th>

  <tr>
    <td>
      <ul>
        <li>3.10.25</li>
        <li>3.10.24</li>
        <li>3.10.23</li>
        <li>3.10.22</li>
        <li>3.10.21</li>
        <li>3.10.20</li>
        <li>3.10.19</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.3.4.8</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.3.x</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          24.3 is the only maintained (updated) series of Erlang 24.
        </li>
        <li>
          As of Erlang 25.1, OpenSSL 3.0 support in Erlang is considered to
          be mature enough to consider for production.
        </li>
        <li>
          Erlang 25 before 25.0.2 and 24 before 24.3.4.2 are affected by <a href="https://nvd.nist.gov/vuln/detail/CVE-2022-37026">CVE-2022-37026</a>,
          a CVE with critical severity (CVSS 3.x Base Score: 9.8)
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.10.18</li>
        <li>3.10.17</li>
        <li>3.10.16</li>
        <li>3.10.14</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.2</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          24.3 is the only maintained (updated) series of Erlang 24.
        </li>
        <li>
          As of Erlang 25.1, OpenSSL 3.0 support in Erlang is considered to
          be mature enough to consider for production.
        </li>
        <li>
          Erlang 25 before 25.0.2 and 24 before 24.3.4.2 are affected by <a href="https://nvd.nist.gov/vuln/detail/CVE-2022-37026">CVE-2022-37026</a>,
          a CVE with critical severity (CVSS 3.x Base Score: 9.8)
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.10.13</li>
        <li>3.10.12</li>
        <li>3.10.11</li>
        <li>3.10.10</li>
        <li>3.10.9</li>
        <li>3.10.8</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.2</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          As of Erlang 25.1, OpenSSL 3.0 support in Erlang is considered to
          be mature enough to consider for production.
        </li>
        <li>
          Erlang 25 before 25.0.2 and 24 before 24.3.4.2 are affected by <a href="https://nvd.nist.gov/vuln/detail/CVE-2022-37026">CVE-2022-37026</a>,
          a CVE with critical severity (CVSS 3.x Base Score: 9.8)
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.10.7</li>
        <li>3.10.6</li>
        <li>3.10.5</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>23.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.2</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          Erlang 25 is the recommended series.
        </li>
        <li>
          Erlang 25 before 25.0.2 and 24 before 24.3.4.2 are affected by <a href="https://nvd.nist.gov/vuln/detail/CVE-2022-37026">CVE-2022-37026</a>,
          a CVE with critical severity (CVSS 3.x Base Score: 9.8)
        </li>
        <li>
          Erlang 23 support was discontinued on July 31st, 2022.
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.10.4</li>
        <li>3.10.2</li>
        <li>3.10.1</li>
        <li>3.10.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>23.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.3</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          Erlang 24.3 is the recommended series.
        </li>
        <li>
          Erlang 23 support was discontinued on July 31st, 2022.
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.9.29</li>
        <li>3.9.28</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.3.4.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>25.2</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          24.3 is the only maintained (updated) series of Erlang 24.
        </li>
        <li>
          As of Erlang 25.1, OpenSSL 3.0 support in Erlang is considered to
          be mature enough to consider for production.
        </li>
        <li>
          Erlang 25 before 25.0.2 and 24 before 24.3.4.2 are affected by <a href="https://nvd.nist.gov/vuln/detail/CVE-2022-37026">CVE-2022-37026</a>,
          a CVE with critical severity (CVSS 3.x Base Score: 9.8)
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.9.27</li>
        <li>3.9.26</li>
        <li>3.9.25</li>
        <li>3.9.24</li>
        <li>3.9.23</li>
        <li>3.9.22</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.3</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          Erlang 24 before 24.3.4.2 is affected by <a href="https://nvd.nist.gov/vuln/detail/CVE-2022-37026">CVE-2022-37026</a>,
          a CVE with critical severity (CVSS 3.x Base Score: 9.8)
        </li>
        <li>
          Erlang 23 support was discontinued on July 31st, 2022.
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.9.21</li>
        <li>3.9.20</li>
        <li>3.9.19</li>
        <li>3.9.18</li>
        <li>3.9.17</li>
        <li>3.9.16</li>
        <li>3.9.15</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>23.3</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.3</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          Erlang 24.3 introduces LDAP client changes that are breaking for
          projects compiled on earlier releases (including RabbitMQ).
          RabbitMQ 3.9.15 is the first release to support Erlang 24.3.
        </li>
        <li>
          Erlang 23 support was discontinued on July 31st, 2022.
        </li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.9.14</li>
        <li>3.9.13</li>
        <li>3.9.12</li>
        <li>3.9.11</li>
        <li>3.9.10</li>
        <li>3.9.9</li>
        <li>3.9.8</li>
        <li>3.9.7</li>
        <li>3.9.6</li>
        <li>3.9.5</li>
        <li>3.9.4</li>
        <li>3.9.3</li>
        <li>3.9.2</li>
        <li>3.9.1</li>
        <li>3.9.0</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>23.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.2</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>
          <a href="/blog/2021/03/23/erlang-24-support-roadmap">Erlang/OTP <code>24</code> support announcement</a>
        </li>
        <li>Erlang 24 was released on May 12, 2021</li>
        <li>Some community plugins and tools may be incompatible with Erlang 24</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.8.35</li>
        <li>3.8.34</li>
        <li>3.8.33</li>
        <li>3.8.32</li>
        <li>3.8.31</li>
        <li>3.8.30</li>
        <li>3.8.29</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>23.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.3</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>RabbitMQ 3.8 was released in October 2019, and reached end of life on July 31st, 2022, we strongly discourage its use</li>
        <li>
          Erlang 24.3 introduces LDAP client changes that are breaking for
          projects compiled on earlier releases (including RabbitMQ).
          RabbitMQ 3.8.29 is the first release in the 3.8.x-series to support Erlang 24.3.
        </li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <ul>
        <li>3.8.28</li>
        <li>3.8.27</li>
        <li>3.8.26</li>
        <li>3.8.25</li>
        <li>3.8.24</li>
        <li>3.8.23</li>
        <li>3.8.22</li>
        <li>3.8.21</li>
        <li>3.8.20</li>
        <li>3.8.19</li>
        <li>3.8.18</li>
        <li>3.8.17</li>
        <li>3.8.16</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>23.2</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>24.2</li>
      </ul>
    </td>
    <td>
      <ul class="notes">
        <li>RabbitMQ 3.8 was released in October 2019, and reached end of life on July 31st, 2022, we strongly discourage its use</li>
      </ul>
    </td>
  </tr>

  <tr>
    <td>
      <ul>
        <li>3.8.15</li>
        <li>3.8.14</li>
        <li>3.8.13</li>
        <li>3.8.12</li>
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
        <li>RabbitMQ 3.8 was released in October 2019, and reached end of life on July 31st, 2022, we strongly discourage its use</li>
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
        <li>RabbitMQ 3.8 was released in October 2019, and reached end of life on July 31st, 2022, we strongly discourage its use</li>
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
        <li>RabbitMQ 3.8 was released in October 2019, and reached end of life on July 31st, 2022, we strongly discourage its use</li>
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
        <li>RabbitMQ 3.7 was released on 2017-11-28, and reached end of life on 2020-09-30, we strongly discourage its use</li>
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
        <li>RabbitMQ 3.7 was released on 2017-11-28, and reached end of life on 2020-09-30, we strongly discourage its use</li>
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
        <li>RabbitMQ 3.7 was released on 2017-11-28, and reached end of life on 2020-09-30, we strongly discourage its use</li>
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
        <li>RabbitMQ 3.7 was released on 2017-11-28, and reached end of life on 2020-09-30, we strongly discourage its use</li>
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
        <li>RabbitMQ 3.7 was released on 2017-11-28, and reached end of life on 2020-09-30, we strongly discourage its use</li>
      </ul>
    </td>
  </tr>

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


### Last Version to Support R16B03 {#r16b03}

If you absolutely must use an older version of Erlang, RabbitMQ
3.6.14 is the newest version compatible with R16B03.

### Last Version to Support R13B03 {#r13b03}

If you absolutely must use an older version of Erlang, [RabbitMQ 3.5.8](https://github.com/rabbitmq/rabbitmq-server/releases/tag/rabbitmq_v3_5_8)
is the newest version compatible with R13B03.
