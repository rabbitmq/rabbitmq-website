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

# RabbitMQ Erlang Client Library Build Instructions

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers building RabbitMQ Erlang client from source.


## Building from Source

### <a id="prerequisites" class="anchor" href="#prerequisites">Prerequisites</a>

In order to build the client library, you will need a few tools.

RabbitMQ requires a recent version of [Python](http://www.python.org/download/)
for generating AMQP 0-9-1 framing code.

Additionally, you will need

* The [Erlang](https://www.erlang.org/downloads)
  development and runtime tools. On a Debian-based
  system then you need the `erlang-nox`, `erlang-dev` and
  `erlang-src` packages installed. See [Erlang Version Requirements guide](./which-erlang.html) to learn
  about the recommended ways of provisioning a recent supported version of Erlang.
 * A recent version of [Elixir](https://elixir-lang.org/)
 * a recent version of [GNU make](http://www.gnu.org/software/make/)
 * a recent version of `xsltproc`, which is part of [libxslt](http://xmlsoft.org/XSLT/)
 * a recent version of `xmlto`
 * [zip](http://www.info-zip.org/Zip.html) and [unzip](http://www.info-zip.org/UnZip.html)

## Building the Client

The repository is hosted on GitHub. Clone the repository with

<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-erlang-client.git
</pre>

to build the client, run `make`:

<pre class="lang-bash">
cd rabbitmq-erlang-client
make
</pre>

This will clone and build all dependencies of the client.



## <a id="targets" class="anchor" href="#targets">Other Make Targets</a>

There are other useful `Makefile` targets available in the repository. They include

<table>
  <thead>
    <td>Target</td>
    <td>Description</td>
  </thead>

  <tr>
    <td>all</td>
    <td>The default target. Builds the client library and all of its dependencies.</td>
  </tr>

  <tr>
    <td>shell</td>
    <td>
      Builds the client library and starts an Erlang shell (a REPL) with the
      libraries loaded.
    </td>
  </tr>

  <tr>
    <td>run-broker</td>
    <td>
      Builds the client and starts a RabbitMQ server node with shell
      and the client included in runtime load path.
    </td>
  </tr>

  <tr>
    <td>clean</td>
    <td>Removes temporary build products.</td>
  </tr>

  <tr>
    <td>distclean</td>
    <td>Removes all build products.</td>
  </tr>

  <tr>
    <td>tests</td>
    <td>Runs test suites</td>
  </tr>

  <tr>
    <td>dialyze</td>
    <td>
      Analyses the client source code with dialyzer. Uses PLT
      file from default location:
      <code>~/.dialyzer_plt</code>. Use

<pre class="lang-bash">
make PLT=/path/to/plt dialyze
</pre>

      to override this. Add broker to PLT beforehand,
      otherwise you will a lot of 'unknown function'
      warnings. See <code>add_broker_to_plt</code> make
      target.
    </td>
  </tr>


  <tr>
    <td>source-dist</td>
    <td>Creates a source tarball of the library under <code>./PACKAGES</code>.</td>
  </tr>

  <tr>
    <td>package</td>
    <td>Creates an Erlang archive (binary build) of the library under <code>./PACKAGES</code>.</td>
  </tr>
</table>
