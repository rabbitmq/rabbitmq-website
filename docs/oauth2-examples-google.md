---
title: Use Google as OAuth 2.0 server
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2007-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Use Google as OAuth 2.0 server

**Google is not supported**

The main reason is because it does not issue JWT access tokens
but opaque access tokens. To support opaque access tokens, RabbitMQ would have to issue an
external HTTP request to convert the opaque access token into a JWT access token.

Under the [`/conf/google`](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next/conf/google) folder you can find the configuration used to connect the
RabbitMQ management UI with Google OAuth 2.0 endpoints. With this configuration,
you can get to a point where the user is authenticated by Google, and eventually
you get the error message in the RabbitMQ Management UI "Not Authorized".

The reason is because RabbitMQ cannot validate the access token because it is invalid.
