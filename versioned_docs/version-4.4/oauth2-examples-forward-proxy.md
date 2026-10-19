---
title: Use an explicit forward proxy and Keycloak as OAuth 2.0 server
displayed_sidebar: docsSidebar
---
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

# Use an explicit forward proxy and Keycloak as OAuth 2.0 server

:::warning
To run this example you need to use the commercial [Tanzu RabbitMQ docker image](https://techdocs.broadcom.com/us/en/vmware-tanzu/data-solutions/tanzu-rabbitmq-oci/4-0/tanzu-rabbitmq-oci-image/overview.html). Support for **forward proxy** is a commercial feature.
:::

This guide explains how to set up OAuth 2.0 for RabbitMQ to access the Authorization Server via an explicit forward proxy. 

* Access the RabbitMQ Management UI using a browser through OAuth2 Proxy

```plain
                    [ Keycloak ]  
                        /|\  
                         |   
     2.http request (*)  |                                            [ RabbitMQ ]
                [ forward-proxy ]      <----1. http request (*)---    [  http    ]
            
```

RabbitMQ establishes an HTTP connection with Keycloak via the forward-proxy in any of 
these situations:

- You have configured `auth_oauth2.issuer` so that RabbitMQ downloads the OpenID configuration via the OpenID discovery endpoint.
- You have configured `auth_oauth2.issuer` or `auth_oauth2.jwks_url` so that RabbitMQ downloads the tokens' signing keys. 

## Prerequisites for Using OAuth 2 vith a forward proxy

* Docker
* make
* A local clone of a [GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next) for branch `next` that contains all the configuration files and scripts used on this example.
* The following entries in your /etc/hosts file. Without these entries you will get DNS errors in the browser. 
```
localhost keycloak rabbitmq forward-proxy
```

:::info
`make start-keycloak` will
generate the TLS certificate and private keys as necessary. These certificates have an expiration date.

In you see any error messages that hint at expired or invalid certificates, stop Keycloak, run `make clean-certs` to regenerate the certificates and private keys,
and then restart Keycloak and the proxy.
:::

## Deploy Keycloak

Deploy keycloak on its own network called `keycloak_net` by running:

```bash
PROVIDER_NETWORK=keycloak_net make start-keycloak
```
 
To access Keycloak Management UI, go to https://keycloak:8443/ and enter `admin` as the username and password.

There is a dedicated **Keycloak realm** called `Test` configured as follows:

* [rsa](https://keycloak:8443/admin/master/console/#/realms/test/keys) signing-key
* [rsa provider]https://keycloak:8443/admin/master/console/#/realms/test/keys/providers)
* `rabbitmq-proxy-client` client

## Start Forward Proxy

Deploy and start the forward-proxy in two networks, `keycloak_net` and `rabbitmq_net`, by running:

```bash
PROVIDER_NETWORK=keycloak_net make start-forward-proxy
```

The forward proxy is configured by using [httpd.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next/conf/forward-proxy/httpd/httpd.conf). This type of configuration inserts the access token into the HTTP **Authorization** header.


## Start RabbitMQ

Deploy RabbitMQ in its own network `rabbitmq_net` and start it by running:

```
export IMAGE=<Tanzu RabbitMQ OCI image name>
export IMAGE_TAG=<Tanzu RabbitMQ OCI image tag>
MODE=forward-proxy OAUTH_PROVIDER=keycloak make start-rabbitmq
```

## Access [management UI](./management/)

Go to https://rabbitmq:15671/, proceed to login, and enter the credentials
`rabbit_admin` as the username and `rabbit_admin` as the password when Keycloak prompts you. 
You will be redirected back to RabbitMQ management UI.

The management UI running in the browser goes straight to keycloak. 
In other words, it does not go via the forward-proxy. If you want the management UI to
go via the forward-proxy, you must configure the browser. That is beyond 
the scope of this example.

However, in order to validate the token the management UI received from keycloak, RabbitMQ has to connect to keycloak via the forward-proxy. This is necessary in order to download the signing keys and to download the OpenID configuration if you only configured the `issuer` URL.

## Access Management API

To access the management API run the following command. It uses the client [mgt_api_client](https://keycloak:8443/admin/master/console/#/test/clients/c5be3c24-0c88-4672-a77a-79002fcc9a9d/settings), which has the scope [rabbitmq.tag:administrator](https://keycloak:8443/admin/master/console/#/test/client-scopes/f6e6dd62-22bf-4421-910e-e6070908764c/settings).

```bash
make curl-keycloak url=https://localhost:15671/api/overview client_id=mgt_api_client secret=LWOuYqJ8gjKg3D2U8CJZDuID3KiRZVDa realm=test
```
