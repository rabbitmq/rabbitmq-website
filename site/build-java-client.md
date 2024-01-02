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

# Build RabbitMQ Java Client from Source

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guides describes the process of building the Java client library from source.

The repository is hosted on GitHub. Clone two repositories with

<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-codegen.git rabbitmq_codegen
git clone https://github.com/rabbitmq/rabbitmq-java-client.git
</pre>

The code generation repository is a dependency of
the Java client library.


## <a id="prerequisites" class="anchor" href="#prerequisites">Required Libraries and Tools</a>

In order to build RabbitMQ Java client, you will need a few tools.

The first one is a recent version of [Python](http://www.python.org/download/) and
[simplejson.py](http://pypi.python.org/pypi/simplejson)
in order to drive code generation.

Additionally, for building the Java client libraries, you will need

 * [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html) or newer
 * [Maven](http://maven.apache.org/) version 3.3.x or newer.


## <a id="building" class="anchor" href="#building">Building</a>

Ensure <code>JAVA_HOME</code> is correctly set and
that the <code>rabbitmq-java-client</code> and
<code>rabbitmq_codegen</code> directories are in
the same directory. Then, from the <code>rabbitmq-java-client</code> directory, run

<pre class="lang-bash">
cd rabbitmq-java-client

./mvnw clean package -Ddeps.dir=../ -DskipTests
</pre>

The generated JAR file will be in <code>target</code> directory.


## <a id="contributing" class="anchor" href="#contributing">Contributing</a>

If you are looking to contribute to the client, take a look at these
[instructions on GitHub](https://github.com/rabbitmq/rabbitmq-java-client#contributing).
