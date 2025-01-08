---
title: Using Multiple OAuth 2.0 Servers and/or Audiences
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

# Using Multiple OAuth 2.0 Servers and/or Audiences

This guide explains how to set up OAuth 2.0 for RabbitMQ
and several OAuth resources using the following flows:

* Application authentication and authorization
* Access [management UI](./management/)

## Prerequisites

* Docker
* A local clone of a [GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next) for branch `next` that contains all the configuration files and scripts used on this example
* Add the following entry to `/etc/hosts`:
```
localhost keycloak devkeycloak prodkeycloak rabbitmq
```

## Single OAuth 2.0 vs Multiple OAuth 2.0 resources

All the examples demonstrated so far, except for this one, configure a single **resource_server_id** and therefore a single **OAuth 2.0 server**.

In some scenarios some management users and/or applications are registered in
different OAuth 2 servers or they could be registered on the same OAuth 2 server but refer to RabbitMQ using different audience values. To support this scenario, as many OAuth 2 resources must be declared as audiences and/or authorization servers.

The following three scenarios demonstrate various configurations you may encounter:

* [Scenario 1](oauth2-examples-multiresource#scenario1): messaging (AMQP) clients and management users are registered in same OAuth 2.0 server, **keycloak**, but with different audience, e.g. `rabbit_prod` and `rabbit_dev` respectively.
* [Scenario 2](./oauth2-examples-multiresource#scenario2): each resource is managed on a dedicated realm (i.e. `rabbit_prod` resource -> https://keycloak:8443/realms/prod realm, `rabbit_dev` resource -> https://keycloak:8443/realms/dev) that all use the same OAuth 2 (IDP) server, in this example accessible at `keycloak`.
* [Scenario 3](./oauth2-examples-multiresource#scenario3): each resource is managed on a dedicated OAuth 2 (IDP) server and realm (i.e. `rabbit_dev` -> https://devkeycloak:8443/realms/dev, `rabbit_dev` -> https://prodkeycloak:8442/realms/prod).

## Scenario 1: Messaging (AMQP) Clients and Management Users Registered in the Same OAuth 2.0 Server but with Different Audiences {#scenario1}

RabbitMQ is configured with two OAuth2 resources one called `rabbit_prod` and another `rabbit_dev`. For example purposes, let's say, the production team refer to RabbitMQ with the `rabbit_prod` audience. And the development team with the `rabbit_dev` audience.
As both teams are registered in the same OAuth2 server you are going to configure its settings such as `issuer` at the root level so that both resources share the same configuration.

### Test applications accessing AMQP protocol with their own audience

This is a summary of the configuration, found in [rabbitmq.scenario1.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/next/conf/multi-keycloak/rabbitmq.scenario1.conf):

There are two OAuth2 clients (`prod_producer` and `dev_producer`) declared in Keycloak and configured to access their respective audience: `rabbit_prod` and `rabbit_dev`.
The RabbitMQ OAuth 2 plugin is configured like so:

    * With two resources: `rabbit_prod` and `rabbit_dev`:
    ```ini
    auth_oauth2.resource_servers.1.id = rabbit_prod
    auth_oauth2.resource_servers.2.id = rabbit_dev
    ```
    * With common settings for the previous two resources:
    ```ini
    auth_oauth2.preferred_username_claims.1 = preferred_username
    auth_oauth2.preferred_username_claims.2 = user_name
    auth_oauth2.preferred_username_claims.3 = email
    auth_oauth2.issuer = https://keycloak:8443/realms/test
    auth_oauth2.scope_prefix = rabbitmq.
    ```
    * With one oauth provider:
    ```ini
    auth_oauth2.oauth_providers.keycloak.issuer = https://keycloak:8443/realms/test
    auth_oauth2.oauth_providers.keycloak.https.cacertfile = /etc/rabbitmq/keycloak-ca_certificate.pem
    auth_oauth2.oauth_providers.keycloak.https.verify = verify_peer
    auth_oauth2.oauth_providers.keycloak.https.hostname_verification = wildcard
    auth_oauth2.default_oauth_provider = keycloak
    ```

Follow these steps to deploy Keycloak and RabbitMQ:

1. Launch Keycloak. Check out [Admin page](https://localhost:8443/admin/master/console/#/test) with the credentials `admin:admin`:

    ```bash
    make start-keycloak
    ```

    :::tip
    It is recommended to follow the logs until keycloak is fully initialized: `docker logs keycloak -f`
    :::

2. Launch RabbitMQ with [rabbitmq.scenario1.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/next/conf/multi-keycloak/rabbitmq.scenario1.conf):

    ```bash
    MODE="multi-keycloak" CONF="rabbitmq.scenario1.conf" make start-rabbitmq
    ```

3. Launch the AMQP producer registered in Keycloak with the **client_id** `prod_producer`s and with the permission to access the `rabbit_prod` resource, and with the scopes `rabbitmq.read:*/* rabbitmq.write:*/* rabbitmq.configure:*/*`:

    ```bash
    make start-perftest-producer-with-token PRODUCER=prod_producer TOKEN=$(bin/keycloak/token prod_producer PdLHb1w8RH1oD5bpppgy8OF9G6QeRpL9)
    ```

    This is an access token generated for `prod_producer`.
    ```json
    {
      "exp": 1690974839,
      "iat": 1690974539,
      "jti": "c8edec50-5f29-4bd0-b25b-d7a46dc3474e",
      "aud": "rabbit_prod",
      "sub": "826065e7-bb58-4b65-bbf7-8982d6cca6c8",
      "typ": "Bearer",
      "azp": "prod_producer",
      "acr": "1",
      "realm_access": {
        "roles": [
          "default-roles-test",
          "offline_access",
          "producer",
          "uma_authorization"
        ]
      },
      "resource_access": {
        "account": {
          "roles": [
            "manage-account",
            "manage-account-links",
            "view-profile"
          ]
        }
      },
      "scope": "profile email rabbitmq.read:*/* rabbitmq.write:*/* rabbitmq.configure:*/*",
      "clientId": "prod_producer",
      "clientHost": "172.18.0.1",
      "email_verified": false,
      "preferred_username": "service-account-prod_producer",
      "clientAddress": "172.18.0.1"
    }
    ```

4. Similarly, launch AMQP producer `dev_producer`, registered in Keycloak too but with the permission to access `rabbit_dev` resource:
    ```bash
    make start-perftest-producer-with-token PRODUCER=dev_producer TOKEN=$(bin/keycloak/token dev_producer z1PNm47wfWyulTnAaDOf1AggTy3MxX2H)
    ```

### Test Management UI accessed via two separate resources

This is a summary of the configuration to enable OAuth 2.0 in the management UI:

* There are two users declared in Keycloak: `prod_user` and `dev_user`.
* The two resources, `rabbit_prod` and `rabbit_dev` are declared in the RabbitMQ management plugin with each with their own OAuth 2 client (`rabbit_prod_mgt_ui` and `rabbit_dev_mgt_ui`) scopes, and the label associated with each resource:
    ```ini
    management.oauth_resource_servers.1.id = rabbit_prod
    management.oauth_resource_servers.1.client_id = rabbit_prod_mgt_ui
    management.oauth_resource_servers.1.label = RabbitMQ Production
    management.oauth_resource_servers.1.scopes = openid profile rabbitmq.tag:administrator

    management.oauth_resource_servers.2.id = rabbit_dev
    management.oauth_resource_servers.2.client_id = rabbit_dev_mgt_ui
    management.oauth_resource_servers.2.label = RabbitMQ Development
    management.oauth_resource_servers.2.scopes = openid profile rabbitmq.tag:management
    ```

    :::note
    As there is only one OAuth2 server, both resources share the oauth provider called **keycloak**.
    :::

* Each OAuth2 client, `rabbit_prod_mgt_ui` and `rabbit_dev_mgt_ui`, is declared in Keycloak so that they can only emit tokens for their respective audience, be it `rabbit_prod` and `rabbit_dev` respectively.

Follow the steps to the management UI flows with two OAuth resources:

1. Go to the [RabbitMQ Management UI](https://localhost:15671).
2. Select `RabbitMQ Production` resource.
3. Login as `prod_user`:`prod_user`.
4. Keycloak prompts you to authorize various scopes for `prod_user`.
5. You should now get redirected to the Management UI as `prod_user` user.

Now, logout and repeat the same steps for `dev_user` user. For this user, RabbitMQ is configured to request the `rabbitmq.tag:management` scope only.

:::warning
In step 3, if you login as the `dev_user`, RabbitMQ will not authorize the `dev_user` because RabbitMQ is configured to request the scope: `rabbitmq.tag:administrator` for `RabbitMQ Production`.

The `dev_user` does not have the `rabbitmq.tag:administrator` scope, it has the `rabbitmq.tag:management` scope. In this scenario, the `dev_user` gets a token which has none of the scopes RabbitMQ supports.
:::


## Scenario 2: Two OAuth 2 Resources on Dedicated Realm Under as Many OAuth Providers {#scenario2}

This scenario uses the same OAuth 2.0 provider called **keycloak**, however, this time there are two realms, `dev` and `prod`:
- Under Realm `dev` there are users and clients with granted access to the `rabbit_dev` resource:
	- `dev_producer` (password: `SBuw1L5a7Y2aQfWfbsgXlEKGTNaEHxO8`).
	- `rabbit_dev_admin` (password: `rabbit_dev_admin`).
	- `rabbit_dev_mgt_api`.
- Under Realm `prod` there are users and clients with granted access to the `rabbit_prod` resource:
	- `prod_producer` with the audience `rabbit_prod` (password: `PdLHb1w8RH1oD5bpppgy8OF9G6QeRpL9`).
	- `rabbit_prod_admin` (password: `rabbit_prod_admin`).

Despite there is only one physical OAuth provider, you need to configure RabbitMQ with two OAuth 2.0 providers. Each tenant has its own `issuer` url. This is the configuration file used for this scenario is  [rabbitmq.scenario2.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/next/conf/multi-keycloak/rabbitmq.scenario2.conf). For convenience here is the relevant part:
```ini
...
## Oauth providers
auth_oauth2.oauth_providers.devkeycloak.issuer = https://keycloak:8443/realms/dev
auth_oauth2.oauth_providers.devkeycloak.https.cacertfile = /etc/rabbitmq/keycloak-ca_certificate.pem
auth_oauth2.oauth_providers.devkeycloak.https.verify = verify_peer
auth_oauth2.oauth_providers.devkeycloak.https.hostname_verification = wildcard

auth_oauth2.oauth_providers.prodkeycloak.issuer = https://keycloak:8443/realms/prod
auth_oauth2.oauth_providers.prodkeycloak.https.cacertfile = /etc/rabbitmq/keycloak-ca_certificate.pem
auth_oauth2.oauth_providers.prodkeycloak.https.verify = verify_peer
auth_oauth2.oauth_providers.prodkeycloak.https.hostname_verification = wildcard

...
```

Follow these steps to deploy Keycloak and RabbitMQ:

1. Launch Keycloak.
```bash
make start-keycloak
```

:::tip

Run `docker ps | grep keycloak` to check when the instance has started.
It is recommended to follow the logs until both instances are fully initialized: `docker logs keycloak -f`

:::

2. Launch RabbitMQ.
```bash
MODE=multi-keycloak OAUTH_PROVIDER=keycloak CONF=rabbitmq.scenario2.conf make start-rabbitmq
```

3. Launch AMQP producer registered in Keycloak with the **client_id** `prod_producer` and with the permission to access `rabbit_prod` resource and with the scopes `rabbitmq.read:*/* rabbitmq.write:*/* rabbitmq.configure:*/*`:
```bash
make start-perftest-producer-with-token PRODUCER=prod_producer TOKEN=$(bin/keycloak/token prod_producer sIqZ5flmSz3r6uKXMSz8CWGeScdTpqq0 prod)
```

4. Launch AMQP producer registered in Keycloak with the **client_id** `dev_producer` and with the permission to access `rabbit_dev` resource and with the scopes `rabbitmq.read:*/* rabbitmq.write:*/* rabbitmq.configure:*/*`:
```bash
make start-perftest-producer-with-token PRODUCER=dev_producer TOKEN=$(bin/keycloak/token dev_producer SBuw1L5a7Y2aQfWfbsgXlEKGTNaEHxO8 dev)
```

5. Stop both producers:
```bash
make stop-perftest-producer PRODUCER=dev_producer
make stop-perftest-producer PRODUCER=prod_producer
```

6. Verify `rabbit_dev_mgt_api` can access Management API because its token grants access to `rabbit_dev`:
```bash
make curl-keycloak url=https://localhost:15671/api/overview client_id=rabbit_dev_mgt_api secret=La1Mvj7Qvt8iAqHisZyAguEE8rUpg014 realm=dev
```

You should see in the standard output the json blob corresponding to the endpoint `/overview` in RabbitMQ's management api.

8. Verify `mgt_api_client` cannot access Management API because its token does not grant access to `rabbit_dev` or `rabbit_prod`:
```bash
make curl-keycloak url=https://localhost:15671/api/overview client_id=mgt_api_client secret=La1Mvj7Qvt8iAqHisZyAguEE8rUpg014 realm=test
```

You should see in the standard output the following:
```json
{"error":"not_authorized","reason":"Not_Authorized"}
```

9. Verify Management UI access:

	- Go to https://localhost:15671.
	- Select *RabbitMQ Development* OAuth 2.0 resource.
	- Click on "Click here to login".
	- Authenticate with Keycloak using `rabbit_dev_admin` / `rabbit_dev_admin`.
	- Verify that user is redirected by to Management UI.
	- Click on Logout.
	- Repeat with *RabbitMQ Production* and user `rabbit_prod_admin` / `rabbit_prod_admin`.

10. Shutdown RabbitMQ and Keycloak

```bash
make stop-keycloak
make stop-rabbitmq
```

## Scenario 3: Two OAuth 2 Resources on Dedicated OAuth 2 Providers {#scenario3}

This scenario uses two separate OAuth 2.0 providers called `devkeycloak` and `prodkeycloak`, with the following setup:

- `devkeycloak` has the following setup under the `dev` Realm and grants access to `rabbit_dev` resource:
	- `dev_producer` with the audience `rabbit_dev` (password: `SBuw1L5a7Y2aQfWfbsgXlEKGTNaEHxO8`).
	- `rabbit_dev_admin` (password: `rabbit_dev_admin`).
	- `rabbit_dev_mgt_api`.
- `prodkeycloak` has the following setup under the `prod` Realm and grants access to `rabbit_prod` resource:
	- `prod_producer` with the audience `rabbit_prod` (password: `PdLHb1w8RH1oD5bpppgy8OF9G6QeRpL9`).
	- `rabbit_prod_admin` (password: `rabbit_prod_admin`).

Check out the section `oauth_providers` in the configuration file [rabbitmq.scenario3.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/next/conf/multi-keycloak/rabbitmq.scenario3.conf) used by this scenario. Like in the scenario 2, there are two OAuth providers however this time the URL refers to two different hostnames. For convenience here is the relevant part:

```ini
...

## Oauth providers
auth_oauth2.oauth_providers.devkeycloak.issuer = https://devkeycloak:8443/realms/dev
auth_oauth2.oauth_providers.devkeycloak.https.cacertfile = /etc/rabbitmq/keycloak-ca_certificate.pem
auth_oauth2.oauth_providers.devkeycloak.https.verify = verify_peer
auth_oauth2.oauth_providers.devkeycloak.https.hostname_verification = wildcard

auth_oauth2.oauth_providers.prodkeycloak.issuer = https://prodkeycloak:8442/realms/prod
auth_oauth2.oauth_providers.prodkeycloak.https.cacertfile = /etc/rabbitmq/keycloak-ca_certificate.pem
auth_oauth2.oauth_providers.prodkeycloak.https.verify = verify_peer
auth_oauth2.oauth_providers.prodkeycloak.https.hostname_verification = wildcard

...
```

Follow these steps to deploy two Keycloaks and RabbitMQ:

1. Launch Keycloak.
```bash
make start-dev-keycloak
make start-prod-keycloak
```
:::tip
Run `docker ps | grep keycloak` to see two instances have started.
:::

2. Launch RabbitMQ.
```bash
MODE=multi-keycloak CONF=rabbitmq.scenario3.conf make start-rabbitmq
```

3. Launch AMQP producer registered in Keycloak with the **client_id** `prod_producer` and with the permission to access `rabbit_prod` resource and with the scopes `rabbitmq.read:*/* rabbitmq.write:*/* rabbitmq.configure:*/*`:
```bash
make start-perftest-producer-with-token PRODUCER=prod_producer TOKEN=$(bin/prodkeycloak/token prod_producer PdLHb1w8RH1oD5bpppgy8OF9G6QeRpL9)
```

4. Launch AMQP producer registered in Keycloak with the **client_id** `dev_producer` and with the permission to access `rabbit_dev` resource and with the scopes `rabbitmq.read:*/* rabbitmq.write:*/* rabbitmq.configure:*/*`:
```bash
make start-perftest-producer-with-token PRODUCER=dev_producer TOKEN=$(bin/devkeycloak/token dev_producer z1PNm47wfWyulTnAaDOf1AggTy3MxX2H)
```

5. Stop both producers:
```bash
make stop-perftest-producer PRODUCER=dev_producer
make stop-perftest-producer PRODUCER=prod_producer
```

6. Verify `rabbit_dev_mgt_api` can access Management API because its token grants access to `rabbit_dev`:
```bash
make curl-dev-keycloak url=https://localhost:15671/api/overview client_id=rabbit_dev_mgt_api secret=p7v6DksWkcb6TUYK6payswovC0LqhU6A
```

You should see in the standard output the json blob corresponding to the endpoint `/overview` in RabbitMQ's management api.

8. Verify `mgt_api_client` cannot access Management API because its token does not grant access to `rabbit_dev` or `rabbit_prod`:
```bash
make curl-keycloak url=https://localhost:15671/api/overview client_id=mgt_api_client secret=La1Mvj7Qvt8iAqHisZyAguEE8rUpg014 realm=test
```

You should see in the standard output the following:
```json
{"error":"not_authorized","reason":"Not_Authorized"}
```

9. Verify Management UI access:

	- Go to https://localhost:15671.
	- Select *RabbitMQ Development* OAuth 2.0 resource.
	- Click on "Click here to login".
	- Authenticate with Keycloak using `rabbit_dev_admin` / `rabbit_dev_admin`.
	- Verify that user is redirected by to Management UI.
	- Click on Logout.
	- Repeat with *RabbitMQ Production* and user `rabbit_prod_admin` / `rabbit_prod_admin`.

10. Shutdown RabbitMQ and the two Keycloaks:
```bash
make stop-dev-keycloak
make stop-prod-keycloak
make stop-rabbitmq
```
