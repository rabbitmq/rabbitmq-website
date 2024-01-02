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

# RabbitMQ Java Client Library

## <a id="overview" class="anchor" href="#overview">Overview</a>

The RabbitMQ Java client library allows Java and JVM-based applications
to connect to and interact with RabbitMQ nodes.

5.x release series of this library [require JDK 8](./java-versions.html), both for compilation and at runtime. On Android,
this means only [Android 7.0 or later](https://developer.android.com/guide/platform/j8-jack.html) versions are supported.

4.x release series [support JDK 6](./java-versions.html) and Android versions prior to 7.0.

See the [RabbitMQ Java libraries support page](./java-versions.html) for the support timeline.

### <a id="licensing" class="anchor" href="#licensing">Licensing</a>

The library is [open-source](https://github.com/rabbitmq/rabbitmq-java-client/), and is triple-licensed under

 * [Apache Public License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)
 * [Mozilla Public License 2.0](https://www.mozilla.org/MPL/2.0/)
 * [GPL 2.0](https://www.gnu.org/licenses/gpl-2.0.html)

This means that the user can consider the library to be licensed under any of the licenses from the list above.
For example, the user may choose the Apache Public License 2.0 and include this client into
a commercial product. Codebases that are licensed under the GPLv2 may choose GPLv2, and so on.

### Prerequisites

RabbitMQ Java client connects to RabbitMQ server nodes.

You will need a running [RabbitMQ node](./download.html) to use with the client
library.

### Latest Version

The current release of the RabbitMQ Java client is `5.20.0`.

### Adding Library Dependency

The recommended way to get started using the RabbitMQ Java client
in your project is with a dependency management system.

If you're using Maven, add this dependency to the POM file of your project:

<pre class="lang-xml">
&lt;dependency&gt;
  &lt;groupId&gt;com.rabbitmq&lt;/groupId&gt;
  &lt;artifactId&gt;amqp-client&lt;/artifactId&gt;
  &lt;version&gt;5.20.0&lt;/version&gt;
&lt;/dependency&gt;
</pre>

If using Gradle:

<pre class="lang-groovy">
dependencies {
  compile 'com.rabbitmq:amqp-client:5.20.0'
}
</pre>

We attempt to upload new versions of the Java client on the day
of release; however the Maven servers are sometimes unavailable,
so there may be a delay of a few days between a new release and
its appearance in the central Maven repository. Please be patient.

## Download the library and Documentation

The client and its API reference documentation can be downloaded directly.

### The Library

The library is available in compiled form, and as
source.

<table>
  <thead>
    <td>Description</td>
    <td>Download</td>
    <td>Signature</td>
  </thead>

  <tr>
    <td>Binary, compiled for JDK 8 (Android 7.0) or newer</td>
    <td>
      <a href="https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/5.20.0/amqp-client-5.20.0.jar">amqp-client-5.20.0.jar</a>
    </td>
    <td>
      <a href="https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/5.20.0/amqp-client-5.20.0.jar.asc">Signature file</a>
    </td>
  </tr>

  <tr>
    <td>Source code</td>
    <td>
      <a href="https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/5.20.0/amqp-client-5.20.0-sources.jar">amqp-client-5.20.0-sources.jar</a>
    </td>
    <td>
      <a href="https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/5.20.0/amqp-client-5.20.0-sources.jar.asc">Signature file</a>
    </td>
  </tr>
</table>


See the [Signatures guide](./signatures.html) for details on how to verify package signatures, and the
[Java client build guide](./build-java-client.html) for instructions on compiling from source-code.

### The Documentation

Please refer to the [API guide](api-guide.html).

The Javadoc documentation is <a href="https://rabbitmq.github.io/rabbitmq-java-client/api/current/">browsable on-line</a>, or you can
download it for off-line use:

<table>
  <thead>
    <td>Description</td>
    <td>Download</td>
    <td>Signature</td>
  </thead>

  <tr>
    <td> A JAR file containing generated Javadoc documentation </td>
    <td>
      <a href="https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/5.20.0/amqp-client-5.20.0-javadoc.jar">amqp-client-5.20.0-javadoc.jar</a>
    </td>
    <td>
      <a href="https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/5.20.0/amqp-client-5.20.0-javadoc.jar.asc">Signature file</a>
    </td>
  </tr>
</table>

[Javadoc for the latest 4.x series release](https://rabbitmq.github.io/rabbitmq-java-client/api/4.x.x/) is available as well.


### Other Versions

Consult [the archive](https://repo1.maven.org/maven2/com/rabbitmq/amqp-client/) if you want to download a version of the RabbitMQ
Java Client library or documentation other than the above.


## OSGi Ready

The RabbitMQ Java client jar comes ready with an OSGi
manifest (with bundle version and package dependencies correctly
set) so it can be deployed in an OSGi environment.
This means it is no longer necessary to <i>bundleise</i> or
<i>OSGiefy</i> the jar prior to using it in an OSGi container.


## GitHub Repositories

The RabbitMQ Java client depends on the code generation library module.
Please see the <a href="./build-java-client.html">build page</a> for instructions on
compiling from source code.

<table>
  <thead>
    <td>Snapshot</td>
    <td>Clone</td>
    <td>Repository</td>
  </thead>

  <tr>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-java-client/tarball/main">Java client</a>
    </td>
    <td>
<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-java-client.git
</pre>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-java-client">Repository on GitHub</a>
    </td>
  </tr>

  <tr>
    <td>
      RabbitMQ Code Generator
    </td>
    <td>
<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-server
cd rabbitmq-server/deps/rabbitmq_codegen
</pre>
    </td>
    <td>
      <a href="https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_codegen">Repository on GitHub</a>
    </td>
  </tr>
</table>
