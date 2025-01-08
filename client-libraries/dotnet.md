---
title: .NET/C# RabbitMQ Client Library
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

# .NET/C# RabbitMQ Client Library

## Overview {#overview}

The RabbitMQ .NET client is an implementation of an AMQP 0-9-1 client
library for C# (and, implicitly, other .NET languages).

### Release Series {#series}

The following table explains what RabbitMQ .NET client release series
targets what .NET standard (or .NET framework) version.

<table>
  <thead>
    <td><strong>Library Release Series</strong></td>
    <td><strong>Required .NET Framework/Standard/Flavor Versions</strong></td>
    <td>Support status</td>
  </thead>

  <tr>
    <td>
      7.x
    </td>
    <td>
      <a href="https://www.nuget.org/packages/RabbitMQ.Client/#supportedframeworks-body-tab">Supported Frameworks</a>
    </td>
    <td>supported</td>
  </tr>

  <tr>
    <td>
      6.x
    </td>
    <td>
      <a href="https://www.nuget.org/packages/RabbitMQ.Client/6.8.1#supportedframeworks-body-tab">Supported Frameworks</a>
    </td>
    <td>supported</td>
  </tr>

  <tr>
    <td>
      5.x
    </td>
    <td>
      .NET Framework 4.5.1+ or a .NET 5 through 6
    </td>
    <td>end of life</td>
  </tr>

  <tr>
    <td>
      4.x
    </td>
    <td>
      .NET Framework 4.5.1+ or a .NET Standard 1.5+ implementation
    </td>
    <td>end of life</td>
  </tr>

  <tr>
    <td>
      3.4.x
    </td>
    <td>
      .NET Framework 3.5
    </td>
    <td>end of life</td>
  </tr>

  <tr>
    <td>
      3.3.x
    </td>
    <td>
      .NET Framework 2.0
    </td>
    <td>end of life</td>
  </tr>
</table>

### Licensing {#licensing}

The library is [open-source](https://github.com/rabbitmq/rabbitmq-dotnet-client),
and is dual-licensed under the [the Apache License v2](https://www.apache.org/licenses/LICENSE-2.0) and [the Mozilla Public License v2.0](https://www.mozilla.org/MPL/2.0/).

This means that the user can consider the library to be licensed under any of the licenses from the list above.
For example, the user may choose the Apache Public License 2.0 and include this client into
a commercial product. Codebases that are licensed under the GPLv2 may choose GPLv2, and so on.

## NuGet {#distribution}

Recent versions of the library are exclusively [distributed via NuGet](https://www.nuget.org/packages/RabbitMQ.Client).

The most recent release is [available via NuGet](https://www.nuget.org/packages/RabbitMQ.Client).
Release notes can be found [on GitHub](https://github.com/rabbitmq/rabbitmq-dotnet-client/releases).


## Documentation {#documentation}

Please refer to the [RabbitMQ tutorials](/tutorials) and [.NET client user guide](/client-libraries/dotnet-api-guide).

There's also [an online API reference](https://rabbitmq.github.io/rabbitmq-dotnet-client/index.html).


## Change log {#changelog}

4.x and later release notes are [published to GitHub](https://github.com/rabbitmq/rabbitmq-dotnet-client/releases).


## Binary Downloads {#binary-builds}

Modern versions of this library (e.g. `6.x`) are distributed as a [NuGet package](https://www.nuget.org/packages/RabbitMQ.Client).

<table>
  <thead>
    <td><strong>Description</strong></td>
    <td><strong>Download</strong></td>
  </thead>

  <tr>
    <td class="desc">6.x NuGet package</td>
    <td><a href="https://www.nuget.org/packages/RabbitMQ.Client">RabbitMQ.Client NuGet package</a></td>
  </tr>
  <tr>
    <td class="desc">5.x NuGet package</td>
    <td><a href="https://www.nuget.org/packages/RabbitMQ.Client">RabbitMQ.Client NuGet package</a></td>
  </tr>
  <tr>
    <td class="desc">4.x NuGet package</td>
    <td><a href="https://www.nuget.org/packages/RabbitMQ.Client">RabbitMQ.Client NuGet package</a></td>
  </tr>
  <tr>
    <td class="desc">3.x NuGet package</td>
    <td><a href="https://www.nuget.org/packages/RabbitMQ.Client">RabbitMQ.Client NuGet package</a></td>
  </tr>
</table>


## Source Repository on GitHub {#source-repository}

The .NET RabbitMQ client library is [hosted and developed on GitHub](https://github.com/rabbitmq/rabbitmq-dotnet-client).

Please see the [.NET client build guide](./build-dotnet-client) for
instructions on compiling from source.

To clone the repo from GitHub:

```bash
git clone https://github.com/rabbitmq/rabbitmq-dotnet-client
```

In order to compile or run the RabbitMQ .NET/C# client library,
please follow the [build instructions](./build-dotnet-client).


## Strong Naming {#signing}

The client assembly is strong named. The public key token is 89e7d7c5feba84ce
and the public part of the signing key is

```ini
00240000048000009400000006020000002400005253413100040000010001008d20ec856aeeb8
c3153a77faa2d80e6e43b5db93224a20cc7ae384f65f142e89730e2ff0fcc5d578bbe96fa98a71
96c77329efdee4579b3814c0789e5a39b51df6edd75b602a33ceabdfcf19a3feb832f31d825416
8cd7ba5700dfbca301fbf8db614ba41ba18474de0a5f4c2d51c995bc3636c641c8cbe76f45717b
fcb943b5.
```
