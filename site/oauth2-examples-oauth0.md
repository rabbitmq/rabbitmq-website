# Use https://auth0.com/ as OAuth 2.0 server

Let's test the following 3 OAuth flows:
1. Access management UI via a browser
2. Access management rest api
3. Access AMQP protocol

## Prerequisites to follow this guide

* Have an account in https://auth0.com/.
* Docker

## Create RabbitMQ API

In OAuth0, resources are mapped to Application APIs. Once you have logged onto your account in https://auth0.com/, go to **dashboard > Applications > APIs > Create an API**.

1. Give it the name `rabbitmq`. The important thing here is the `identifier` which must have the name of the *resource_server_id* we configured in RabbitMQ. This `identifier` goes into the `audience` JWT field. In our case, it is called `rabbitmq`.
2. Choose `RS256` as the signing algorithm.
3. Enable **RBAC**.
4. Enable **Add Permissions in the Access Token**.

### Configure permissions in RabbitMQ API

Edit the API we just created with the name `rabbitmq`. Go into Permissions and add the permissions (scope) this api can grant.
We are going to add the following scopes:
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

You can use your current OAuth0 user to login to RabbitMQ or create a dedicated user for that. Up to you.

### Authorize rabbitmq-management application

Go to **Authorized Applications**, click on **Authorize** and select all the scopes.

### Create permissions and grant them

Go to "Roles", create the role called `rabbitmq.tag:administrator`. Go to "Permissions" and
select all the permissions. Go to "Users" and make sure our user is listed else add our user to the
list of users which have this role.


## Configure RabbitMQ with OAuth0 signing key

From Oauth0 dashboard, go to Settings > List of Valid Keys, and "Copy Signing Certificate" from the **CURRENTLY USED** signing key.

Create `/tmp/certiicate.pem` and paste the certificate.

Run `openssl x509 -in /tmp/certificate.pem -pubkey -noout > /tmp/public.pem` to extract the public key from the certificate and paste the public key into `rabbitmq.config`.

Below we have a sample RabbitMQ configuration where we have set the `default_key` identifier that we copied from
Oauth0 and also the public key we extracted from `/tmp/public.pem`.

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
export MODE=oauth0
make start-rabbitmq
</pre>

## Verify Management UI flows

Go to management UI `http://localhost:15672`, click on the single button, authenticate
with your secondary OAuth0 user. You should be redirected back to the management UI.

OAuth0 issues an access token like this one below. Where we receive in the `scope` claim
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
