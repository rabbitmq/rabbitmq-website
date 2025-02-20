---
title: Use Keycloak as OAuth 2.0 server
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

## Use Keycloak as OAuth 2.0 server

This guide explains how to set up OAuth 2.0 for RabbitMQ and Keycloak as Authorization Server using
the following flows:

* Access [management UI](./management/) via a browser
* Access management HTTP API
* Application authentication and authorization

## Keycloak JWT payloads

Keycloak can issue two types of JWT payloads.

One type of payload is found in a [Requesting Party Token](./oauth2#requesting-party-token).
RabbitMQ supports this type of token and it extracts the scopes from it. You do not need to
configure anything.

The second type of payload is the following:

```json
{
  "realm_access": {
    "roles": [
      "offline_access",
      "uma_authorization",
      "rabbitmq.tag:management",
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile",
        "rabbitmq.write:*/*"
      ]
    }
  },
  "roles": "rabbitmq.read:*/*",
  "scope": "profile email"
}
```

:::info
The claim `roles` is not, strictly speaking, part of Keycloak official claims. Instead, it is a
custom claim configured by the user from the Keycloak administration console.
:::

RabbitMQ does not read the scopes from this token unless you configure it to do so. For example, to
configure RabbitMQ to extract the scopes from `roles` under the `realm_access` claim, add the
following configuration variable:

```json
auth_oauth2.additional_scopes_key = realm_access.roles
```

To configure RabbitMQ to also read from `resource_access` claim, edit the previous configuration as
follows:

```json
auth_oauth2.additional_scopes_key = realm_access.roles resource_access.account.roles
```

And finally, if you also want to use the scopes in the claim `roles`, you edit the previous
configuration:

```json
auth_oauth2.additional_scopes_key = roles realm_access.roles resource_access.account.roles
```

RabbitMQ reads the scopes from all those sources.

## Prerequisites to follow this guide

* Docker
* make
* A local clone of a
  [GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next) for branch
  `next` that contains all the configuration files and scripts used on this example
* Add the following entry to `/etc/hosts`:

  ```console
  localhost keycloak rabbitmq
  ```

## Deploy Keycloak

1. First, deploy Keycloak. It comes preconfigured with all the required scopes, users, and clients.

2. Start the Keycloak server by running:

   ```bash
   make start-keycloak
   ```

There is a dedicated Keycloak realm called `Test` configured as follows:

* A [rsa](https://keycloak:8443/admin/master/console/#/test/realm-settings/keys) signing key. Use
  `admin`:`admin` when prompted for credentials to access the Keycloak Administration page
* A [rsa provider](https://keycloak:8443/admin/master/console/#/test/realm-settings/keys/providers)
* Three clients: `rabbitmq-client-code` for the RabbitMQ management UI, `mgt_api_client` to access
  via the management API and `producer` to access via the AMQP protocol.

## Start RabbitMQ

Run the command below to start RabbitMQ configured with the `Keycloak` server we started in the
previous section: This is the
[rabbitmq.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/next/conf/keycloak/rabbitmq.conf)
used for Keycloak.

```bash
export MODE=keycloak
make start-rabbitmq
```

:::info
RabbitMQ is deployed with TLS enabled and Keycloak is configured with the corresponding `redirect_url`
which uses HTTPS.
:::

:::important
RabbitMQ is configured to read the scopes from the custom claim
[extra_scope](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/next/conf/keycloak/rabbitmq.conf#L11)
and by default from the standard claim `scope`.
However, if your scopes are deep in a map/list structure such as `authorization.permissions.scopes`,
or under `realm_access.roles` or `resource_access.account.roles`, you can configure RabbitMQ to use
those locations instead. For more information, see the section
[Use a different token field for the scope](./oauth2#use-different-token-field).
:::

## Access Management API

To access the management api run the following command. It uses the client
[mgt_api_client](https://keycloak:8443/admin/master/console/#/test/clients/c5be3c24-0c88-4672-a77a-79002fcc9a9d/settings)
that has the scope
[rabbitmq.tag:administrator](https://keycloak:8443/admin/master/console/#/test/client-scopes/f6e6dd62-22bf-4421-910e-e6070908764c/settings).

```bash
make curl-keycloak url=https://localhost:15671/api/overview client_id=mgt_api_client secret=LWOuYqJ8gjKg3D2U8CJZDuID3KiRZVDa realm=test
```

## Application authentication and authorization with PerfTest

To test OAuth 2.0 authentication with the AMQP protocol you use the RabbitMQ PerfTest tool, which
uses RabbitMQ Java Client.

First you obtain the token and pass it as a parameter to the make target
`start-perftest-producer-with-token`.

```bash
make start-perftest-producer-with-token PRODUCER=producer TOKEN=$(bin/keycloak/token producer kbOFBXI9tANgKUq8vXHLhT6YhbivgXxn test)
```

:::info
Initializing an application with a token has one drawback: the application cannot use the connection
beyond the lifespan of the token. See the next section where you demonstrate how to refresh the token.
:::

## Application authentication and authorization with Pika

In the following information, OAuth 2.0 authentication is tested with the AMQP protocol and the Pika
library. These tests specifically demonstrate how to refresh a token on a live AMQP connection.

The sample Python application is
[in GitHub](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next/pika-client).

To run this sample code proceed as follows:

```bash
python3 --version
pip install pika
pip install requests
python3 pika-client/producer.py producer kbOFBXI9tANgKUq8vXHLhT6YhbivgXxn
```

:::tip
If `pip` is not available try instead the following two commands to installing it:
```bash
python3 -m venv venv
source venv/bin/activate
```
:::

:::important
Ensure that you install pika 1.3.
:::

## Access [management UI](./management/)

1. Go to https://localhost:15671.
2. Click on the single button on the page which redirects to Keycloak to authenticate.
3. Enter `rabbit_admin` and `rabbit_admin` and you should be redirected back to RabbitMQ Management
   fully logged in.

## Stop Keycloak

```bash
make stop-keycloak
```

## Notes about setting up Keycloak

### Configure client

For backend applications which uses **Client Credentials flow**, you can create a **Client** with:

* **Access Type**: `public`
* Turn off `Standard Flow`, `Implicit Flow`, and `Direct Access Grants`
* With **Service Accounts Enabled** on. If it is not enabled you do not have the tab `Credentials`
* In the `Credentials` tab, you have the `client id`

### Configure client scopes

*Default Client Scope* are scopes automatically granted to every token. Whereas
*Optional Client Scope* are scopes which are only granted if they are explicitly requested during
the authorization/token request flow.

### Include appropriate aud claim

You must configure a **Token Mapper** of type **Hardcoded claim** with the value of RabbitMQ's
`resource_server_id`. You can configure **Token Mapper** either to a **Client scope** or to a
**Client**.
