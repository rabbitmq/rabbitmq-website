---
title: RabbitMQ Access Control Cache Plugin
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

# Authentication/Authorization Cache Backend

## Overview {#overview}

This plugin provides a way to cache authentication and authorization backend 
results for a configurable amount of time. It's not an independent auth backend,
but a caching layer for existing backends, such as the built-in, [LDAP](./ldap),
or [HTTP](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_backend_http) ones.
Although it is not very useful with the
built-in (internal) [authentication and authorization backends](./access-control) but can be other
backends that use network requests, such as LDAP or HTTP.

Cache expiration is currently time-based. 

## Table of Contents

 * [Installation](#installation)
 * Authorization and Authentication [Backend Configuration](#configuration)
 * [Plugin configuration](#basic-configuration)
 * [Advanced plugin configuration](#advanced-configuration)

## Installation {#installation}

The `rabbitmq_auth_backend_cache` plugin ships with RabbitMQ.

Like all plugins, it [must be enabled](./plugins) before it can be used, for example,
use [`rabbitmqctl`](./cli):

```bash
rabbitmq-plugins enable rabbitmq_auth_backend_cache
```

## Authorization and Authentication Backend Configuration {#configuration}

To configure this plugin so that it caches all the authorization and authentication
decisions, first set this cache backend as the `auth_backends` or one
of them and then you configure which authentication backend is actually cached.

For example, to cache requests to the `http` backend:

```ini
auth_backends.1 = cache
auth_cache.cached_backend = http

auth_http.http_method = post
```

It is possible to use different backends for authorization and authentication.

The following example configures the plugin to use LDAP backend for 
authentication, but internal backend for authorization:

```ini 
auth_backends.1 = cache

auth_cache.cached_backend.authn = ldap
auth_cache.cached_backend.authz = internal
```

## Basic Cache configuration {#basic-configuration}

You can configure TTL for cache items, by using `cache_ttl` configuration variable, 
specified in milliseconds. The default value is `15000` milliseconds:

```ini 
auth_cache.cached_backend = ldap
auth_cache.cache_ttl = 5000
```

By default, negative authentication and/or authorization decisions are not cached,
only positive ones are. However, this behaviour can be changed by setting `cache_refusals` to `true`
as shown below: 

```ini
auth_cache.cache_refusals = true
```

## Advanced Cache configuration {#advanced-configuration}

You can also use a custom cache module to store cached requests. This module 
should be an Erlang module implementing the `rabbit_auth_cache` behavior and
(optionally) define `start_link` function to start the cache process.

This repository provides several implementations:

* `rabbit_auth_cache_dict` stores cache entries in the internal process dictionary.
  This module is for demonstration only and should not be used in production.
* `rabbit_auth_cache_ets` stores cache entries in an [ETS](https://learnyousomeerlang.com/ets) 
  table and uses timers for cache invalidation. **This is the default implementation**.
* `rabbit_auth_cache_ets_segmented` stores cache entries in multiple ETS tables 
  and does not delete individual cache items but rather uses a separate process for garbage collection.
* `rabbit_auth_cache_ets_segmented_stateless` same as previous, but with minimal
   use of `gen_server` state, using ets tables to store information about segments.

To specify the module for caching, use the `cache_module` configuration key.
This example configuration configures the `rabbit_auth_backend_ets_segmented` module.

```ini 
auth_cache.cache_module = rabbit_auth_backend_ets_segmented
```

When using a custom implementation of a `cache_module`, you can specify `start args`
with `cache_module_args`. `Start args` should be list of arguments passed to 
module `start_link` function.

However, additional cache module arguments can only be defined via the 
[advanced.config](./configure#advanced-config-file).

```erlang 
[
 {rabbit, [
   %% ...
 ]},

 {rabbitmq_auth_backend_cache, [
    {cache_module, rabbit_auth_backend_ets_segmented},
    {cache_module_args, [10000]}
  ]}
].
```
