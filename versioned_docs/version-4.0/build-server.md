---
title: Server Build Instructions
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Server Build Instructions

## Overview {#overview}

This section describes the process for obtaining a copy of the
RabbitMQ server source code, as well as instructions for building the
server from source.

## Open Source RabbitMQ Build Infrastructure is Open Source

Except for the secrets, certificates and package distribution infrastructure (such as `deb*.rabbitmq.com` or `yum*.rabbitmq.com`),
open source RabbitMQ's build infrastructure is developed in the open on GitHub:

 * [`rabbitmq/build-env-images`](https://github.com/rabbitmq/build-env-images) provides the OCI images used for producing releases
 * [`rabbitmq/server-packages`](https://github.com/rabbitmq/server-packages) provides the GitHub Actions workflows


## Build from Source {#git}

First, get the source code from [our GitHub repositories](/github):

```bash
git clone https://github.com/rabbitmq/rabbitmq-server.git rabbitmq
```

Then, use GNU Make to pull down dependencies and build the server and all plugins
that ship with the RabbitMQ distribution:

```bash
cd rabbitmq
make
```


## Required Libraries and Tools {#prerequisites}

In order to build RabbitMQ, a few tools must be installed.

### Python

RabbitMQ requires a reasonably recent version of [Python](http://www.python.org/download/) and [simplejson](http://pypi.python.org/pypi/simplejson).

simplejson.py is included as a standard json library in the Python distribution.

### Erlang/OTP Toolchain and Headers

The [Erlang](http://www.erlang.org/./download) development and runtime tools
are needed to compile RabbitMQ server, tools and [tier 1 plugins](./plugins).

See [Erlang Version Requirements](./which-erlang) to learn about the range of supported Erlang release series.

On a Debian-based system, the `erlang-nox`, `erlang-dev` and
`erlang-src` packages must be installed.

### Elixir

A recent version of [Elixir](https://elixir-lang.org/) is needed
to build [RabbitMQ CLI tools](./cli).

### GNU Make

[GNU make](http://www.gnu.org/software/make/) is the primary build tool
used by RabbitMQ.

### xsltproc and xmlto

A recent version of `xsltproc`, which is part of [libxslt](http://xmlsoft.org/XSLT/) and
`xmlto` must be available.

### zip and unzip

[zip](http://www.info-zip.org/Zip.html) and [unzip](http://www.info-zip.org/UnZip.html)
would be necessary if source code is obtained via an archive instead of a git repository clone.


## Building the Server {#building-server}

Change to the `rabbitmq` directory, and type `make`.

Other interesting `Makefile` targets include

<table>
  <thead>
    <tr>
      <th>Make Target</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>all</td>
      <td>
      The default target. Builds the server.
      </td>
    </tr>
    <tr>
      <td>shell</td>
      <td>
      Builds the client libraries and starts an Erlang shell with the
      libraries loaded.
      </td>
    </tr>
    <tr>
      <td>run-broker</td>
      <td>
      Builds the server and starts an instance with an
      interactive Erlang shell. This will by default put
      data, including the node's data directory, under <code>/tmp/rabbitmq-test-instances</code>,
      but this location can be overridden by setting the
      Makefile variable <code>TEST_TMPDIR</code>:

      ```bash
      make run-broker TEST_TMPDIR="/some/other/location/for/rabbitmq-test-instances"
      ```

      The Erlang node name can also be changed by setting
      <code>RABBITMQ_NODENAME</code>:

      ```bash
      make run-broker RABBITMQ_NODENAME=rmq
      ```

      See <a href="./configure">Configuration guide</a> for other
      variables that may be useful.
      </td>
    </tr>
    <tr>
      <td>clean</td>
      <td>Removes temporary build products.</td>
    </tr>
    <tr>
      <td>distclean</td>
      <td>Removes all build products, including fetched dependencies.</td>
    </tr>
    <tr>
      <td>tests</td>
      <td>
      Runs multiple server test suites. This is very resource-intensive and will
      take up to a few hours. Many nodes and clusters will be started, modified and destroyed
      by various test suites.
      </td>
    </tr>
  </tbody>
</table>


## Building Packages {#building-packages}

In practice, building RabbitMQ server from source is of limited use
unless an easy to deploy package (e.g. a generic binary build or Debian one) can be produced.

Everything related to packaging the RabbitMQ server is in the [main RabbitMQ repository](https://github.com/rabbitmq/rabbitmq-server).

There is a number of top-level packaging Make targets available, one for each package
type (or family of packages, such as RPM):

 * `make package-generic-unix`
 * `make package-deb`
 * `make package-rpm`
 * `make package-rpm-suse`
 * `make package-windows`
