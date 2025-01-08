---
title: Client Documentation
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

import {
  JavaClientDocURL,
} from '@site/src/components/JavaClient';

import {
  DotNetClientDocURL,
} from '@site/src/components/DotNetClient';

# Client Documentation

## AMQP 1.0

 * [Documentation for RabbitMQ AMQP 1.0 libraries](./amqp-client-libraries.md)

## Java

 * [Downloads and Installation](./java-client.md)
 * [API Guide](./java-api-guide.md)
 * <a href={JavaClientDocURL()}>API Reference</a>
 * [JMS Guide](./jms-client.md)
 * [JMS Reference](https://github.com/rabbitmq/rabbitmq-jms-client/blob/main/jms-client-compliance.md)
 * [Command line tools](./java-tools.md)


## .NET/C# #

 * [Downloads and Installation](./dotnet.md)
 * [API Guide](./dotnet-api-guide.md)
 * <a href={DotNetClientDocURL() + '/RabbitMQ.Client.html'}>API Reference</a>

## Erlang

 * [Downloads and Installation](./erlang-client.md)
 * [API Guide](./erlang-client-user-guide.md)
 * <a href="https://hexdocs.pm/amqp_client/" target="_blank" rel="noopener noreferrer">API Reference</a>

## Other Resources

* [AMQP URI Parsing Spec](/docs/uri-spec)

See the [developer tools](/client-libraries/devtools) for community-contributed code.
