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

# Use Keycloak as OAuth 2.0 server

This guide explains how to set up OAuth 2.0 for RabbitMQ
and Keycloak as Authorization Server using the following flows:

* Access [management UI](./management/) via a browser
* Access management HTTP API
* Application authentication and authorization

## Prerequisites to follow this guide

* Docker
* make
* A local clone of a [GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial) that contains all the configuration files and scripts used on this example

## Deploy Keycloak

1. First, deploy **Keycloak**. It comes preconfigured with all the required scopes, users and clients.

2. Run the following command to start **Keycloak** server:

    ```bash
    make start-keycloak
    ```

There is a dedicated **Keycloak realm** called `Test` configured as follows:

* A [rsa](http://0.0.0.0:8080/admin/master/console/#/realms/test/keys) signing key
* A [rsa provider](http://0.0.0.0:8080/admin/master/console/#/realms/test/keys/providers)
* Three clients: `rabbitmq-client-code` for the rabbitmq management UI, `mgt_api_client` to access via the
management api and `producer` to access via AMQP protocol.


## Start RabbitMQ

Run the command below to start RabbitMQ configured with the **Keycloak** server we started in the previous section: This is the [rabbitmq.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/main/conf/keycloak/rabbitmq.conf) used for **Keycloak**.
```bash
export MODE=keycloak
make start-rabbitmq
```

## Access Management api

To access the management api run the following command. It uses the client [mgt_api_client](http://0.0.0.0:8080/admin/master/console/#/realms/test/clients/c5be3c24-0c88-4672-a77a-79002fcc9a9d) which has the scope [rabbitmq.tag:administrator](http://0.0.0.0:8080/admin/master/console/#/realms/test/client-scopes/f6e6dd62-22bf-4421-910e-e6070908764c).

```bash
make curl-keycloak url=http://localhost:15672/api/overview client_id=mgt_api_client secret=LWOuYqJ8gjKg3D2U8CJZDuID3KiRZVDa
```

## Application authentication and authorization with PerfTest

To test OAuth 2.0 authentication with AMQP protocol you are going to use RabbitMQ PerfTest tool which uses RabbitMQ Java Client.

First you obtain the token and pass it as a parameter to the make target `start-perftest-producer-with-token`.

```bash
make start-perftest-producer-with-token PRODUCER=producer TOKEN=$(bin/keycloak/token producer kbOFBXI9tANgKUq8vXHLhT6YhbivgXxn test)
```

**NOTE**: Initializing an application with a token has one drawback: the application cannot use the connection beyond the lifespan of the token. See the next section where you demonstrate how to refresh the token.

## Application authentication and authorization with Pika

In the following information, OAuth 2.0 authentication is tested with the AMQP protocol and the Pika library. These tests specifically demonstrate how to refresh a token on a live AMQP connection.

The sample Python application [can be found on GitHub](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/pika-client).

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

Note: Ensure you install pika 1.3

## Access [management UI](./management/)

1. Go to http://localhost:15672.
2. Click on the single button on the page which redirects to **Keycloak** to authenticate.
3. Enter `rabbit_admin` and `rabbit_admin` and you should be redirected back to RabbitMQ Management fully logged in.


## Stop keycloak

```bash
make stop-keycloak
```

## Notes about setting up Keycloak

### Configure Client

For backend applications which uses **Client Credentials flow**, you can create a **Client** with:

* **Access Type** : `public`
* Turn off `Standard Flow`, `Implicit Flow`, and `Direct Access Grants`
* With **Service Accounts Enabled** on. If it is not enabled you do not have the tab `Credentials`
* In the `Credentials` tab, you have the `client id`


### Configure Client scopes

*Default Client Scope* are scopes automatically granted to every token. Whereas *Optional Client Scope* are
scopes which are only granted if they are explicitly requested during the authorization/token request flow.


### Include appropriate aud claim

You must configure a **Token Mapper** of type **Hardcoded claim** with the value of rabbitmq's *resource_server_id**.
You can configure **Token Mapper** either to a **Client scope** or to a **Client**.
