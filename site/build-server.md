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

# Server Build Instructions

## <a id="overview" class="anchor" href="#overview">Overview</a>

This section describes the process for obtaining a copy of the
RabbitMQ server source code, as well as instructions for building the
server from source.


## <a id="git" class="anchor" href="#git">Build from Git</a>

First, get the source code from <a href="github.html">our GitHub repositories</a>:

<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-server.git
</pre>

Then, use GNU Make to pull down dependencies and build the server:

<pre class="lang-bash">
cd rabbitmq-server
make
</pre>


## <a id="prerequisites" class="anchor" href="#prerequisites">Required Libraries and Tools</a>

In order to build RabbitMQ, a few tools must be installed.

### Python

RabbitMQ requires a recent version of <a
href="http://www.python.org/download/">Python 2</a> and <a
href="http://pypi.python.org/pypi/simplejson">simplejson.py</a>
(an implementation of a <a href="http://json.org">JSON</a> reader
and writer in Python), for generating AMQP 0-9-1 framing code.
simplejson.py is included as a standard json library in the Python
core since 2.6 release.

### Erlang/OTP Toolchain and Headers

the <a href="http://www.erlang.org/download.html">Erlang</a>
development and runtime tools<br/> If you are on a Debian-based
system then you need the <i>erlang-nox</i>, <i>erlang-dev</i> and
<i>erlang-src</i> packages installed. If you are building and
installing Erlang from source then you must ensure that openssl is
installed on your system.

### Elixir

A recent version of <a href="https://elixir-lang.org/">Elixir</a> is needed
to build [RabbitMQ CLI tools](/cli.html).


### GNU Make

<a href="http://www.gnu.org/software/make/">GNU make</a> is the primary build tool
used by RabbitMQ.


### xsltproc and xmlto

A recent version of <i>xsltproc</i>, which is part of <a href="http://xmlsoft.org/XSLT/">libxslt</a> and
<i>xmlto</i> must be available.

### zip and unzip

<a href="http://www.info-zip.org/Zip.html">zip</a> and <a href="http://www.info-zip.org/UnZip.html">unzip</a>
would be necessary if source code is obtained avia an archive instead of a git repository clone.


## <a id="building-server" class="anchor" href="#building-server">Building the Server</a>

Change to the <code>rabbitmq-server</code> directory, and
type <code>make</code>.

Other interesting <code>Makefile</code> targets include

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
        data, including a Mnesia database, in <code>/tmp/rabbitmq-test-instances</code>,
        but this location can be overridden by setting the
        Makefile variable <code>TEST_TMPDIR</code>:

<pre class="lang-bash">
make run-broker TEST_TMPDIR="/some/other/location/for/rabbitmq-test-instances"
</pre>

        The Erlang node name can also be changed by setting
        <code>RABBITMQ_NODENAME</code>:

<pre class="lang-bash">
make run-broker RABBITMQ_NODENAME=rmq
</pre>

        See <a href="/configure.html">Configuration guide</a> for other
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


## <a id="building-packages" class="anchor" href="#building-packages">Building Packages</a>

In practice, building RabbitMQ server from source is of limited use
unless an easy to deploy package (e.g. a Debian one) can be produced.

Everything related to packaging
the RabbitMQ server is in the <a href="https://github.com/rabbitmq/rabbitmq-server-release">rabbitmq-server-release</a>
repository. The repository has the list of plugins
shipped with the broker. Please refer to the
<a href="https://github.com/rabbitmq/rabbitmq-server-release/blob/master/README.md">README.md</a>
for instructions to create the source archive or any binary packages.
