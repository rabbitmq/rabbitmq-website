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

# Use KeyCloak as OAuth 2.0 server

Let's test the following 3 OAuth flows:

* Access management UI via a browser
* Access management rest api
* Access AMQP protocol

## Prerequisites to follow this guide

* Docker
* make

## Deploy Key Cloak

1. First, deploy **Key Cloak**. It comes preconfigured with all the required scopes, users and clients.

2. Run the following command to start **Key Cloak** server:

    <pre class="lang-bash">
    make start-keycloak
    </pre>

    **Key Cloak** comes configured with its own signing key. And the [rabbitmq.config](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/conf/keycloak/rabbitmq.config) used by `make start-keycloak` is also configured with the same signing key.

3. Access KeyCloak management interface go to http://0.0.0.0:8080/ and enter `admin` as username and password.

There is a dedicated **KeyCloak realm** called `Test` configured as follows:

* You configured an [rsa](http://0.0.0.0:8080/admin/master/console/#/realms/test/keys) signing key
* And a [rsa provider](http://0.0.0.0:8080/admin/master/console/#/realms/test/keys/providers)
* And three clients: `rabbitmq-client-code` for the rabbitmq managament UI, `mgt_api_client` to access via the
management api and `producer` to access via AMQP protocol.


## Start RabbitMQ

Run the command below to start RabbitMQ configured with the **KeyCloak** server we started in the previous section:
<pre class="lang-bash">
export MODE=keycloak
make start-rabbitmq
</pre>

## Access Management api

Access the management api using the client [mgt_api_client](http://0.0.0.0:8080/admin/master/console/#/realms/test/clients/c5be3c24-0c88-4672-a77a-79002fcc9a9d) which has the scope [rabbitmq.tag:administrator](http://0.0.0.0:8080/admin/master/console/#/realms/test/client-scopes/f6e6dd62-22bf-4421-910e-e6070908764c).

<pre class="lang-bash">
make curl-keycloak url=http://localhost:15672/api/overview client_id=mgt_api_client secret=LWOuYqJ8gjKg3D2U8CJZDuID3KiRZVDa
</pre>

## Access AMQP protocol with PerfTest

To test OAuth 2.0 authentication with AMQP protocol you are going to use RabbitMQ PerfTest tool which uses RabbitMQ Java Client.

First you obtain the token and pass it as a parameter to the make target `start-perftest-producer-with-token`.

<pre class="lang-bash">
make start-perftest-producer-with-token PRODUCER=producer TOKEN=$(bin/keycloak/token producer kbOFBXI9tANgKUq8vXHLhT6YhbivgXxn)
</pre>

**NOTE**: Initializing an application with a token has one drawback: the application cannot use the connection beyond the lifespan of the token. See the next section where you demonstrate how to refresh the token.

## Access AMQP protocol with Pika

In the following information, OAuth 2.0 authentication is tested with the AMQP protocol and the Pika library. These tests specifically demonstrate how to refresh a token on a live AMQP connection.

The sample Python application [can be found on GitHub](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/pika-client).

To run this sample code proceed as follows:
<pre class="lang-bash">
python3 --version
pip install pika
pip install requests
python3 pika-client/producer.py producer kbOFBXI9tANgKUq8vXHLhT6YhbivgXxn
</pre>

Note: Ensure you install pika 1.3

## Access Management UI

1. Go to http://localhost:15672.
2. Click on the single button on the page which redirects to **Key Cloak** to authenticate.
3. Enter `rabbit_admin` and `rabbit_admin` and you should be redirected back to RabbitMQ Management fully logged in.


## Stop keycloak

<pre class="lang-bash">
make stop-keycloak
</pre>

## Notes about setting up KeyCloak

### Configure JWT signing Keys

1. At the realm level, you go to `Keys > Providers` tab.
2. Create one of type `rsa` and you enter the private key and certificate of the public key.
3. In this repository you do not have yet the certificate for the public key but it is easy to generate. Give it priority `101` or greater than the rest of available keys so that it is picked up when you request a token.

IMPORTANT: You cannot hard code the **kid** hence you have to add the key to RabbitMQ via the command
<pre class="lang-bash">
docker exec -it rabbitmq rabbitmqctl add_uaa_key Gnl2ZlbRh3rAr6Wymc988_5cY7T5GuePd5dpJlXDJUk --pem-file=conf/public.pem
</pre>
or you have to modify the RabbitMQ configuration so that it says `Gnl2ZlbRh3rAr6Wymc988_5cY7T5GuePd5dpJlXDJUk`
rather than `legacy-token-key`.

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
