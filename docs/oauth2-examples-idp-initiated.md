---
title: Use Identity Provider Initiated Logon
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

# Use Identity Provider Initiated Logon

This topic tells you how to set up Identity Provider Initiated Logon using UAA as the authorization
server and a sample Node.js web application as a web portal.

The web portal acts as an identity provider, allowing users to access the management UI with a
single click by using an OAuth 2.0 token previously obtained from the authorization server.

```
      | Idp (for example, UAA) |
            /\
             | 2. get token
             |
     | Web app Portal |  ---------> | RabbitMQ | <---+
           /\                  |         |           | 4. 302 direct to overview page
            |                  |         |           |    with cookie
            |                  |         +-----------+
            |                  |
    1. user requests             3. POST https://rabbitmq:15671/login
          access                    with access_token
       to the management UI

```

Access the [management UI](./management/) from a browser.

## Prerequisites to follow this guide

* Docker
* A local clone of a
  [GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next) for branch
  `next` that contains all the configuration files and scripts used on this example

:::info
The commands used to start UAA, RabbitMQ, and the web portal automatically generate their x.509
certificates required for HTTPS.
:::

## Deploy UAA

To start UAA run:

```bash
make start-uaa
```

To check if UAA is running, run:

```bash
docker ps | grep uaa
```

## Deploy RabbitMQ

To start RabbitMQ, run:

```bash
export MODE=portal
OAUTH_PROVIDER=uaa make start-rabbitmq
```

:::tip
Ensure that RabbitMQ is deployed with the version you expect by searching for
`Running RabbitMQ (<image>:<image_tag>) with` in `docker logs rabbitmq`.
:::

:::info
To start one specific version of RabbitMQ, run this command instead:
```bash
MODE=portal OAUTH_PROVIDER=uaa IMAGE=rabbitmq IMAGE_TAG=<YourVersion> make start-rabbitmq
```
:::

## Deploy Portal

To start Portal, run:

```bash
make start-portal
```

## Verify management UI flows

To verify management UI flows:

1. Go to the portal `https://localhost:3000`.
2. Click the button **https://localhost:15671 for rabbit_idp_user**, which redirects you to the
   RabbitMQ management UI fully authenticated.

:::info
`rabbit_idp_user` is the OAuth Client the portal uses to obtain an access token to test this flow.
This OAuth Client is declared in UAA.
:::

:::warning
When you visit `https://localhost:3000` you get a browser warning because of the error
`net::ERR_CERT_AUTHORITY_INVALID`. This is because the portal is using a self-signed certificate.
Click on `Proceed to localhost (unsafe)` to accept it.
:::
