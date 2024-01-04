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

# Build RabbitMQ .NET Client from Source

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guides describes the process of building the .NET client library from source.

The repository is hosted on GitHub. Clone it with

<pre class="lang-bash">
git clone https://github.com/rabbitmq/rabbitmq-dotnet-client.git
</pre>


## <a id="prerequisites" class="anchor" href="#prerequisites">Required Libraries and Tools</a>

To build the .NET/C# client libraries on Windows, you will need

 * .NET Core or Microsoft .NET 4.6.1 or later
 * Microsoft Visual Studio Community Edition 2017 or later


## <a id="building" class="anchor" href="#building">Building from Source</a>

### <a id="building-on-windows-with-vs" class="anchor" href="#building-on-windows-with-vs">On Windows with Visual Studio</a>

To build the client with Visual Studio, first run

<pre class="lang-powershell">
build.bat
</pre>

in repository root.
This will perform the required code generation as well as building a release version of the library.

Then

 * Open <code>RabbitMQDotNetClient.sln</code> in Visual Studio.
 * Build the solution.

### <a id="building-on-windows-no-vs" class="anchor" href="#building-on-windows-no-vs">On Windows without Visual Studio</a>

To build the client without Visual Studio, run

<pre class="lang-powershell">build.bat</pre>

in repository root.
This will perform the required code generation as well as building a release version of the library.


## <a id="building-on-linux" class="anchor" href="#building-on-linux">On Linux and MacOS</a>

The library can be built on Linux and MacOS using .NET Core 2.

Run

<pre class="lang-bash">
build.sh
</pre>

This will perform the required
code generation as well as building a release version of the library.
