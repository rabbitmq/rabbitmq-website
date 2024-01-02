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

# Use https://auth0.com/ as OAuth 2.0 server

Let's test the following 3 OAuth flows:

* Access management UI via a browser
* Access management rest api
* Access AMQP protocol

## Prerequisites to follow this guide

* Have an account in https://auth0.com/.
* Docker

## Create RabbitMQ API

In Auth0, resources are mapped to Application APIs.

1. Once you have logged onto your account in https://auth0.com/, go to **dashboard > Applications > APIs > Create an API**.
2. Give it the name `rabbitmq`. The important thing here is the `identifier` which must have the name of the *resource_server_id* we configured in RabbitMQ. This `identifier` goes into the `audience` JWT field. In our case, it is called `rabbitmq`.
3. Choose `RS256` as the signing algorithm.
4. Enable **RBAC**.
5. Enable **Add Permissions in the Access Token**.

### Configure permissions in RabbitMQ API

1. Edit the API we just created with the name `rabbitmq`.
2. Go into Permissions and add the permissions (scope) this api can grant. We are going to add the following scopes:

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
* Token Endpoint Authentication Method:  `None`
* Allowed Callback URLs: `http://localhost:15672/js/oidc-oauth/login-callback.html`
* Allowed Web Origins: `http://localhost:15672`
* Allowed Origins (CORS): `http://localhost:15672`


## Create a new user

You can use your current Auth0 user to login to RabbitMQ or create a dedicated user for that. Up to you.

### Authorize rabbitmq-management application

1. Go to **Authorized Applications**.
2. click on **Authorize** and select all the scopes.

### Create permissions and grant them

1. Go to "Roles".
2. Create the role called `rabbitmq.tag:administrator`.
3. Go to "Permissions" and select all the permissions.
4. Go to "Users" and make sure our user is listed else add our user to the
list of users which have this role.


## Configure RabbitMQ with Auth0 signing key

1. From Auth0 dashboard, go to **Settings > List of Valid Keys**, and **Copy Signing Certificate** from the **CURRENTLY USED** signing key.

2. Create `/tmp/certificate.pem` and paste the certificate.

3. Run `openssl x509 -in /tmp/certificate.pem -pubkey -noout > /tmp/public.pem` to extract the public key from the certificate and paste the public key into `rabbitmq.config`.

Below we have a sample RabbitMQ configuration where we have set the `default_key` identifier that we copied from
Auth0 and also the public key we extracted from `/tmp/public.pem`.

<pre class="lang-erlang">
{key_config, [
	{default_key, &lt;&lt;"LQPlyC9P_gOhzMLx7r2Qm"&gt;&gt;},
	{signing_keys,
		#{&lt;&lt;"LQPlyC9P_gOhzMLx7r2Qm">> => {pem, &lt;&lt;"-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuELzgXF5ZiEMkA0EnRii
Nf1pck5SkzK4HN6y+Zvy9F2e2soJ/i7acaVX0z5O1Fj2ez0UIe1cwJxurTdlFHQD
MAHD6Mhr5vhY+UEACk9QXp5jbRQwApzEnmDoEuKKVFmTK9Jvm+339kRWz6vv/CqB
cMWSVjp+bnd+XosA8SwKSboQ9Vs4LdJi0fqIOyu2o+FRkf6p5qPMYLndJAKZfwSg
aeCgC2hpBiylBsYBdHQEmawgcUjW+CKAOaMEix/799jRjpXkmUFxZ+H/wbLnu880
/bqJidYlvoJt88skYlzqmAxf/BWhaudVkiqtFNZcr2kwsZk/O+7GNFk4N0/UdE4Y
CwIDAQAB
-----END PUBLIC KEY-----"&gt;&gt;}
		 }
	}]
}

</pre>

## Start RabbitMQ

Run the following commands to run RabbitMQ:

<pre class="lang-bash">
export MODE=auth0
make start-rabbitmq
</pre>

## Verify Management UI flows

1. Go to management UI `http://localhost:15672`.
2. Click on the single button, authenticate with your secondary Auth0 user. You should be redirected back to the management UI.

Auth0 issues an access token like this one below. Where we receive in the `scope` claim
the requested scopes, and in the `permissions` claim the permissions. We have configured
RabbitMQ with `{extra_scopes_source, <<"permissions">>},` which means RabbitMQ uses
the scopes in the `permissions` claim too.

<pre class="lang-javascript">
{
  "iss": "https://dev-prbc0gw4.us.auth0.com/",
  "sub": "auth0|6294e0afdc4dea0068d780a7",
  "aud": [
    "rabbitmq",
    "https://dev-prbc0gw4.us.auth0.com/userinfo"
  ],
  "iat": 1654002181,
  "exp": 1654088581,
  "azp": "ffxcvJb6byeNG1Qr6us0Mg0Jp5HyzwwV",
  "scope": "openid profile rabbitmq.tag:administrator",
  "permissions": [
    "rabbitmq.configure:*/*",
    "rabbitmq.read:*/*",
    "rabbitmq.tag:administrator",
    "rabbitmq.write:*/*"
  ]
}
</pre>
