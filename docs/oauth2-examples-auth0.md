---
title: Use auth0.com as OAuth 2.0 Server
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

# Use [auth0.com](https://auth0.com) as OAuth 2.0 server

This guide explains how to set up OAuth 2.0 for RabbitMQ
and Auth0 as Authorization Server using the following flows:

* Access [management UI](./management/) via a browser
* Access management HTTP API
* Application authentication and authorization

## Prerequisites to follow this guide

* Have an [Auth0](https://auth0.com/) account
* Docker
* A local clone of a [GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next) for branch `next` that contains all the configuration files and scripts used on this example.

## Create RabbitMQ API

In Auth0, resources are mapped to Application APIs.

1. After logging into the Auth0 account, go to **dashboard > Applications > APIs > Create an API**.
2. Give it the name `rabbitmq`. The important thing here is the `identifier` which must have the name of the *resource_server_id* we configured in RabbitMQ. This `identifier` goes into the `audience` JWT field. In our case, it is called `rabbitmq`.
3. Choose `RS256` as the signing algorithm.
4. Enable **RBAC**.
5. Enable **Add Permissions in the Access Token**.

### Configure permissions in RabbitMQ API

1. Edit the API we just created with the name `rabbitmq`.
2. Go into Permissions and add the permissions (scope) this api can grant. You are going to add the following scopes:

	* `rabbitmq.read:*/*`
	* `rabbitmq.write:*/*`
	* `rabbitmq.configure:*/*`
	* `rabbitmq.tag:administrator`

### Create an OAuth client for the Management UI

By default, for every API we create, an *Application* gets created using the API's `identifier` as its name.
An *Application* requests an **OAuth client**.

Go to **dashboard > Applications**, and you should see your application listed. An application gives us a *client_id*, a *client_secret* and a http endpoint called *Domain* where to claim a token.

## Create Application rabbitmq-management

An application gives us the client-id and client-secret for the management UI to authenticate on behalf
of the end user.

In the settings, choose:

* Application type : `Single Page applications`
* Allowed Callback URLs: `https://localhost:15671/js/oidc-oauth/login-callback.html`
* Allowed Web Origins: `https://localhost:15671`
* Allowed Origins (CORS): `https://localhost:15671`


## Create a User for Management UI Access

### Create user

1. Go to **User Management** > **Users**.
2. Create a user. This is the user you will use to login via the management UI.

### Create permissions and grant them

1. Go to **Roles**.
2. Create the role called `rabbitmq.tag:administrator`.
3. Go to **Permissions** and select all the permissions.
4. Go to **Users** and make sure our user is listed else add our user to the
list of users which have this role.

## Configure RabbitMQ to authenticate with Auth0

To configure RabbitMQ you need to gather the following information from Auth0:

1. Go to **dashboard > Applications > Applications**.
2. Click on the application `rabbitmq-management`.
3. Take note of the *Client ID* value
4. And take note of the *Domain* value
5. Use the last values in *Client ID* and *Domain* fields in the RabbitMQ configuration file

Clone the configuration file [conf/auth0/rabbitmq.conf.tmpl](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/main/conf/auth0/rabbitmq.conf.tmpl) as `rabbitmq.conf` (in the same folder as `rabbitmq.conf.tmpl`).

Edit `rabbitmq.conf` and proceed as follows:

1. Replace `{Client ID}` with the values you gathered above.
2. Same for `{Domain}`

:::important

Starting with RabbitMQ 4.1.x, you must configure RabbitMQ to include a URI parameter
called `audience` whose value matches the value of `auth_oauth2.resource_server_id`.

Earlier RabbitMQ versions always sent this URI parameter. If this additional URI parameter is not configured,
Auth0 will consider the token invalid and RabbitMQ will display "No authorized" for error.

These [two configuration lines](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/next/conf/auth0/rabbitmq.conf.tmpl#L8-L9)
configure the `audience` parameter with the value `rabbitmq`.

:::

## Start RabbitMQ

Run the following commands to start RabbitMQ:

```bash
export MODE=auth0
make start-rabbitmq
```

## Verify Management UI flows

1. Go to management UI `https://localhost:15671`.
2. Click on the single button, authenticate with your secondary Auth0 user. You should be redirected back to the management UI.

**Auth0** issues an access token like this one below. It has in the `scope` claim
the requested scopes configured in `management.oauth_scopes`, and in the `permissions` claim all the scopes you configured for this user in Auth0. RabbitMQ read the scopes from the `scope` claim but also from the claim name configured in `auth_oauth2.additional_scopes_key` whose value is `permissions`.

```javascript
{
  "iss": "https://dev-tm5ebsbbdcbqddcj.us.auth0.com/",
  "sub": "auth0|66d980b862efcd9f5144f42a",
  "aud": [
    "rabbitmq",
    "https://dev-tm5ebsbbdcbqddcj.us.auth0.com/userinfo"
  ],
  "iat": 1725533554,
  "exp": 1725619954,
  "scope": "openid profile rabbitmq.tag:administrator",
  "azp": "IC1fqsSjkQq2cVsYyHUuQyq30OAYuUv2",
  "permissions": [
    "rabbitmq.configure:*/*",
    "rabbitmq.read:*/*",
    "rabbitmq.tag:administrator",
    "rabbitmq.write:*/*"
  ]
}
```
