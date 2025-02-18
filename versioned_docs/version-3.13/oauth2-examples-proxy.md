---
title: Use OAuth2 Proxy and Keycloak as OAuth 2.0 server
displayed_sidebar: docsSidebar
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

# Use OAuth2 Proxy and Keycloak as OAuth 2.0 server

This guide explains how to set up OAuth 2.0 for RabbitMQ
and [OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/) as Authorization Server using the following flows:

* Access the RabbitMQ Management UI using a browser through OAuth2 Proxy

```plain
                    [ Keycloak ] 3. authenticate
                      /|\  |
                       |   | 4. token
        2.redirect     |  \|/                                        [ RabbitMQ ]
                [ Oauth2-Proxy ]       ----5. forward with token-->  [  http    ]
                      /|\
                       |
            1. rabbit_admin from a browser
```

## Prerequisites for Using OAuth 2 Proxy and Keycloak

* Docker
* make
* A local clone of a [GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/) that contains all the configuration files and scripts used on this example.
* The following entries in your /etc/hosts file. Without these entries you will get DNS errors in the browser. 
```
127.0.0.1  localhost keycloak rabbitmq oauth2-proxy
```

:::info

`make start-keycloak` or `make start-oauth2-proxy` will
generate the TLS certificate and private keys necessary. These certificates have an expiration date.

In case of any error messages that hint at expired or invalid certificates, stop Keycloak
and `oauth-proxy` and run `make clean-certs` to regenerate the certificates and private keys,
then restart Keycloak and the proxy

:::

## Deploy Keycloak

Deploy Keycloak by running the following command:
```bash
make start-keycloak
```

To access Keycloak Management UI, go to https://keycloak:8443/ and enter `admin` as username and password.

There is a dedicated **Keycloak realm** called `Test` configured as follows:

* [rsa](https://keycloak:8443/admin/master/console/#/realms/test/keys) signing key
* [rsa provider](https://keycloak:8443/admin/master/console/#/realms/test/keys/providers)
* `rabbitmq-proxy-client` client


## Start OAuth2 Proxy

To start OAuth2 Proxy, run the following command:

```
make start-oauth2-proxy
```

Oauth2 Proxy is configured using [Alpha configuration](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/conf/oauth2-proxy/alpha-config.yaml). This type of configuration inserts the access token into the HTTP **Authorization** header.

**NOTE**: Oauth2 Proxy requires that the `aud` claim matches the client's id. However, RabbitMQ requires the
`aud` field to match `rabbitmq` which is the designated `resource_server_id`. Given that it has been
impossible to configure keycloak with both values, [rabbitmq.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/conf/oauth2-proxy/rabbitmq.conf) has
the setting below which disables validation of the audience claim.

```ini
auth_oauth2.verify_aud = false
```

## Start RabbitMQ

To start RabbitMQ run the following command:
```
MODE=oauth2-proxy make start-rabbitmq
```

## Access [management UI](./management/)

Go to https://oauth2-proxy:8442/, click on the **Sign in with Keycloak OIDC** link, and enter the credentials
`rabbit_admin` as username and `rabbit_admin` as password. You should be redirected to RabbitMQ management UI.
