# RabbitMQ OAuth2 Auth Backend Examples

## <a id="overview" class="anchor" href="#overview">Overview</a>

This tutorial-style guide has two primary goals:

1. Explore how applications and end users can [authenticate](./access-control) with RabbitMQ server using OAuth 2.0 protocol rather than
   the traditional username/password pairs or x.509 certificates.
2. Explore what it takes to set up RabbitMQ Server with OAuth 2.0 authentication mechanism.
   Additionally it explains how to stand up ([UAA](https://github.com/cloudfoundry/uaa)) as an OAuth 2.0 Authorization Server and all the operations to create OAuth clients, users and obtain their tokens.

The guide coers several OAuth 2 usage scenarios in the context of RabbitMQ and is
accompanied by [a public GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial).
The GitHub repository includes RabbitMQ and UAA configuration files, as well as Make targets
that make it easier to

To understand the details of how to configure RabbitMQ with Oauth2, go to the [Understand the environment](#understand-the-environment) section.

## <a id="toc" class="anchor" href="#toc">Table of Content</a>

<!-- TOC depthFrom:2 depthTo:3 withLinks:1 updateOnSave:1 orderedList:0 -->

* [Prerequisites to follow this guide](#prerequisites)
* [Using RabbitMQ OAuth2 plugin](#using)
	- [Setting up UAA and RabbitMQ](#using-setting-up-uaa)
	- [Scenario 1: Logging into Management UI](#scenario-1)
	- [Scenario 2: Accessing HTTP API](#scenario-2)
	- [Scenario 3: AMQP 0-9-1 Client Connections](#scenario-3)
	- [Scenario 4: JMS Client Connections](#scenario-4)
	- [Scenario 5: Use an Extra Scope Field](#scenario-5)
	- [Scenario 6: Use multiple asymmetrical signing keys](#scenario-6)
	- [Scenario 7: MQTT protocol](#scenario-7)
	- [Scenario 8: Use External OAuth Server (Auth0)](#scenario-8)
	- [Scenario 9: Using Scope Aliases](#scenario-9)
* [Understanding the environment](#understand-the-environment)
	- [RabbitMQ server](#rabbitmq-server)
	- [UAA server](#uaa-server)
	- [UAA client](#uaa-client)
	- [Clients, Users & Permissions in UAA](#clients-users-permissions-in-uaa)
* [Deeper Dive](#deeper-dive)
	- About Users and Clients
	- About Permissions
	- About signing key required to configure RabbitMQ
	- About rotating UAA signing key
	- Understanding how an AMQP application access RabbitMQ using Oauth 2
	- Client access via Spring and Spring Cloud Services using OAuth Client Credentials grant type
	- Understanding Access tokens and how RabbitMQ uses it
	- [Useful uaac commands](#useful-uaac-commands)

<!-- /TOC -->

## <a id="prerequisites" class="anchor" href="#prerequisites">Prerequisites Used by the Examples in This Guide</a>

 * Docker must be installed
 * Ruby must be installed
 * make


## <a id="using" class="anchor" href="#using">Using RabbitMQ OAuth 2 Plugin</a>

Before proceed other more sophisiticated examples, let's start RabbitMQ fully configured with OAuth 2 plugin and
UAA as an OAuth2 Authorization Server.

RabbitMQ has to be configured with facts about the Authorization server, so RabbitMQ is aware of UAA

<pre class="lang-plain">
[ UAA ]    &lt;-------------    [ RabbitMQ ]
</pre>

### <a id="using-setting-up-uaa" class="anchor" href="#using-setting-up-uaa">Setting up UAA and RabbitMQ</a>

There are two ways to set up OAuth2 in RabbitMQ. One uses symmetrical signing keys. And the other uses
asymmetrical signing keys. The Authorization server is who digitally signs the JWT tokens and RabbitMQ
has to be configured to validate any of the two types of digital signatures.

Given that asymmetrical keys is the most widely used option, we are going to focus on how to
configure RabbitMQ with them.

#### <a id="uaa-asymmetrical-signing-keys" class="anchor" href="#uaa-asymmetrical-signing-keys">Use Asymmetrical Digital Singing Keys</a>

Run the following 4 commands to get the environment ready to see Oauth2 plugin in action:

  1. Build UAA docker image if you have not done it yet (see instructions in the previous section)  
	   `make build-uaa`
  2. `make start-uaa` to get UAA server running
  3. `make setup-users-and-clients` to install uaac client; connect to UAA server and set ups users, group, clients and permissions
		 *Important*: hit enter when prompted for client secret.
  4. `make start-rabbitmq` to start RabbitMQ server


### <a id="scenario-1" class="anchor" href="#scenario-1">Scenario 1: Logging into Management UI</a>

The first time an end user arrives to the management UI, they are redirected to UAA to authenticate.
Once they successfully authenticate with UAA, the user is redirected back to RabbitMQ
with a valid JWT token. RabbitMQ validates it and identify the user and its permissions from the JWT token.

At step 2, if this is the first time the user is accessing RabbitMQ resource, UAA will prompt the user to
authorize RabbitMQ application as shown on the screenshot below.

![authorize application](./img/oauth2/authorize-app.png)

UAA has previously been configured and seeded with two users:

* `rabbit_admin:rabbit_admin`
* and `rabbit_monitor:rabbit_monitor`

Now navigating to the [local node's management UI](http://localhost:15672) and login using any of those two users.

The user displayed by the management ui is not the user name but `rabbitmq_client` which is the
identity of RabbitMQ to work on half of the user.

This is a token issued by UAA for the `rabbit_admin` user thru the redirect flow we just saw above.
It was signed with the symmetric key.

![JWT token](./img/oauth2/admin-token-signed-sym-key.png)

### <a id="scenario-2" class="anchor" href="#scenario-2">Scenario 2: Accessing HTTP API</a>

In this scenario a monitoring agent uses RabbitMQ HTTP API to collect monitoring information.
Because it is not an end user, or human, we refer to it as a *service account*.
This *service account* could be our `mgt_api_client` client we created in UAA with the `monitoring` *user tag*.

This *monitoring agent* would use the *client credentials* or *password* grant flow to authenticate (1) with
UAA and get back a JWT token (2). Once it gets the token, it sends (3) a HTTP request
to the RabbitMQ management endpoint passing the JWT token.

<pre class="lang-plain">
[ UAA ]                  [ RabbitMQ ]
  /|\                    [  http    ]
    |                          /|\
    |                       3.http://broker:15672/api/overview passing JWT token
    |                           |
    +-----1.auth---------  monitoring agent
    --------2.JWT--------&gt;
</pre>

The following command launches the browser with `mgt_api_client` client with a JWT token previously obtained from UAA:

<pre class="lang-bash">
make curl url=http://localhost:15672/api/overview client_id=mgt_api_client secret=mgt_api_client
</pre>


### <a id="scenario-3" class="anchor" href="#scenario-3">Use Case 3: AMQP 0-9-1 Client Connections</a>

In this scenario, an application connects to RabbitMQ presenting a JWT Token as a credential.
The application we are going to use is [PerfTest](https://github.com/rabbitmq/rabbitmq-perf-test) which is not an OAuth 2.0 aware application.
OAuth 2.0-aware application is covered in [scenario four]().

Instead we are launching the application with a token that we have previously obtained from UAA. This is just to probe AMQP access with a JWT Token. Needless to say that the application should instead obtain the JWT Token prior to connecting to RabbitMQ and it should also be able to refresh it before reconnecting. RabbitMQ validates the token before accepting it. If the token has expired, RabbitMQ will reject the connection.


First of all, an application which wants to connect to RabbitMQ using Oauth2 must present a
valid JWT token. To obtain the token, the application must first authenticate (`1.`) with UAA. In case of a successful
authentication, it gets back a JWT token (`2.`) which uses it to connect (`3.`) to RabbitMQ.  


<pre class="lang-plain">
[ UAA ]                  [ RabbitMQ ]
  /|\                    [  amqp    ]
    |                          /|\
    |                       3.connect passing JWT
    |                           |
    +-----1.auth---------  amqp application
    --------2.JWT--------&gt;
</pre>

We have previously configured UAA with these 2 OAuth clients:

 * `consumer`
 * `producer`

In order to get a JWT token, an OAuth 2 client must be used.
Applications use the `Oauth client grant flow` to obtain a JWT token.

This the token issued by UAA for the `consumer` OAuth client.

![JWT token](./img/oauth2/consumer-token-signed-with-sym-key.png)

To launch the consumer application invoke the following command:

<pre class="lang-bash">
make start-perftest-consumer
</pre>

To see consumer logs:

<pre class="lang-bash">
docker logs consumer -f
</pre>

To launch the producer application invoke the following command:

<pre class="lang-bash">
make start-perftest-producer
</pre>

To inspect producer logs:

<pre class="lang-bash">
docker logs producer -f
</pre>


To stop all the applications call the following command:

<pre class="lang-bash">
make stop-all-apps
</pre>


### <a id="scenario-4" class="anchor" href="#scenario-4">Scenario 4: JMS Client Connections</a>

In this use case we are demonstrating a basic JMS application which reads, via an environment variable (`TOKEN`),
the JWT token that will use as password when authenticating with RabbitMQ.

It is **critically important** to grant the required permission to the *exchange* `jms.durable.queues`.

Applications which send JMS messages require of these permissions:

* `rabbitmq.configure:*/jms.durable.queues`
* `rabbitmq.write:*/jms.durable.queues`
* `rabbitmq.read:*/jms.durable.queues`

Those permissions grant access on all virtual hosts.

Before testing a publisher and a subscriber application we need to build a local image for the
basic jms application by invoking this command:

<pre class="la">
make build-jms-client
</pre>

To test a JMS application sending a message and authenticating via OAuth run this command:

<pre class="lang-bash">
make start-jms-publisher
</pre>

It sends a message to a queue called `q-test-queue`

Applications which subscribe to a JMS queue require of these permissions:

 * `rabbitmq.write:*/jms.durable.queues`

Those permissions grant access to all virtual hosts.

To test a JMS application subscribing to a queue and authenticating via OAuth run this command:

<pre class="lang-bash">
make start-jms-subscriber
</pre>

It subscribes to a queue called `q-test-queue`

### <a id="scenario-5" class="anchor" href="#scenario-5">Use Case 5: Use a Custom Scope Field</a>

There are some Authorization servers which cannot include RabbitMQ scopes into the standard
JWT `scope` field. Instead, they can include RabbitMQ scopes in a custom JWT scope of their choice.

It is possible to configure RabbitMQ with a different field to look for scopes as shown below:

<pre class="lang-erlang">
[
  {rabbitmq_auth_backend_oauth2, [
    ...
    {extra_scopes_source, &lt;&lt;"extra_scope"&gt;&gt;},
    ...
    ]}
  ]},
].
</pre>

To test this feature we are going to build a token, sign it and use it to hit one of the RabbitMQ management endpoints.
The command below allows us to hit any management endpoint, in this case it is the `overview`, with a token.

<pre class="lang-bash">
make curl-with-token URL=http://localhost:15672/api/overview TOKEN=$(bin/jwt_token scope-and-extra-scope.json legacy-token-key private.pem public.pem)
</pre>


We use the python script `bin/jwt_token.py` to build the minimal JWT token possible that RabbitMQ is able to
validate which is:

<pre class="lang-javascript">
{
  "scope": [

  ],
  "extra_scope": [
    "rabbitmq.tag:management"
  ],
  "aud": [
    "rabbitmq"
  ]
}
</pre>

### <a id="scenario-6" class="anchor" href="#scenario-6">Use Case 6: Using Asymmetric Cryptography and Multiple Signing Keys</a>

This scenario explores the use case where JWT tokens may be signed by different asymmetrical signing keys.

There are two ways to configure RabbitMQ with multiple signing keys:

 * **Statically** configure them via `rabbitmq.conf` as shown in the [plugin documentation page](https://github.com/rabbitmq/rabbitmq-server/tree/master/deps/rabbitmq_auth_backend_oauth2#variables-configurable-in-rabbitmqconf).
 * **Dynamically** add the keys to a running RabbitMQ node without having to restart it.
   This alternative is explained in more detail in the section [About rotating UAA signing key](#about-rotating-uaa-signing-key).
   This section will also use this option.

First we add a second signing key called `legacy-token-2-key` whose public key is `conf/public-2.pem`:

<pre class="lang-bash">
docker exec -it rabbitmq rabbitmqctl add_uaa_key legacy-token-2-key --pem-file=/conf/public-2.pem
Adding UAA signing key "legacy-token-2-key" filename: "/conf/public-2.pem"
</pre>

And then we issue a token using the corresponding private key and use it to access the management endpoint `/api/overview`.

<pre class="lang-bash">
make curl-with-token URL=http://localhost:15672/api/overview TOKEN=$(bin/jwt_token scope-and-extra-scope.json legacy-token-2-key private-2.pem public-2.pem)
</pre>

`bin/jwt_token` searches for private and public key files under the `conf` directory and jwt files under `jwts`.

### <a id="scenario-7" class="anchor" href="#scenario-7">Use Case 7: MQTT Client Connections</a>

This scenario explores the use case where we authenticate with a JWT token to RabbitMQ MQTT port.

Note: in this example, RabbitMQ is already configured with the [`rabbitmq_mqtt` plugin](./mqtt.html).

This is no different than using AMQP or JMS protocols, all that matters is to pass an empty username and a JWT token as password.
However, **what it is really different** is how we encode the permissions. In this use case we are going to proceed as we did it in the previous use case where we handcrafted the JWT token rather than requesting it to UAA. Here is the the scopes required to publish
a message to a mqtt topic ([scopes-for-mqtt.json](jwts/scopes-for-mqtt.json))

<pre class="lang-javascript">
{
  "scope": [
    "rabbitmq.write:*/*/*",
    "rabbitmq.configure:*/*/*",
    "rabbitmq.read:*/*/*"

  ],
  "extra_scope": "rabbitmq.tag:management",
  "aud": [
    "rabbitmq"
  ]
}
</pre>

`rabbitmq.write:*/*/*` means allow write operation on a any vhost, on any exchange and any topic. In fact,
it is any "routing-key" because that is translated to a topic/queue.

We are going to publish a mqtt message by running the following command. If you have not run any of the
previous use cases, you need to launch rabbitmq first like this `make start-uaa`.

<pre class="lang-bash">
make start-mqtt-publish TOKEN=$(bin/jwt_token scopes-for-mqtt.json legacy-token-key private.pem public.pem)
</pre>

> IMPORTANT: If you try to access the management ui and authenticate with UAA using rabbit_admin you
wont be able to do bind a queue with routing_key `test` to the `amq.topic` exchange because that user
in UAA does not have the required permissions. In our handcrafted token, we have granted ourselves the right permissions/scopes.

### <a id="scenario-8" class="anchor" href="#scenario-8">Use Case 8: Using an External OAuth Server, Auth0</a>

In order to follow this use case, [sign up for an Auth0 account](https://auth0.com/).

This example demonstrates two OAuth flows:

1. An Oauth client/application access the management rest api or one of the messaging protocols like AMQP
2. An Oauth user, via a browser, comes to the management ui

To test the first flow, follow these steps:

1. [Log into your Auth0 account](https://auth0.com/), go to dashboard > Applications > APIs > Create an API
2. Give it the name `rabbitmq`. The important thing here is the `identifier` which must have the name of the *resource_server_id*
   we configured in RabbitMQ. This `identifier` goes into the `audience` JWT field. In our case, it is called `rabbitmq`.
   And we choose `RS256` as the signing algorithm.
3. Edit the API we just created with the name `rabbitmq`. Go into Permissions and add the permissions (scope) this api can grant
4. For every API we create, an *Application* gets created using the API's `identifier` as its name.
5. Go to dashboard > Applications, and you should see your application listed.
6. An application gives us a *client_id*, a *client_secret* and a http endpoint called *Domain* where to claim a token. An Application represents an *OAuth Client**
5. Go into dashboard > `Applications` > `rabbitmq` > `APIs`, find a list of all the APIs including the one that's been just created.
   Along with each API there is a toggle to authorize the Application to use the API. Once you "authorize" the Application to use an API,
   you can pick which scopes you want to grant to the Application from the list of scopes allowed by the API.

We are done setting things up in Oauth0, now we can claim a token like this:

<pre class="lang-bash">
curl --request POST \
 --url 'https://{domain from the Application settings}/oauth/token' \
 --header 'content-type: application/x-www-form-urlencoded' \
 --data grant_type=client_credentials \
 --data client_id='{client ID field from the Application settings}' \
 --data client_secret='{client secret field from the Application settings}' \
 --data audience='{identifier field from the API settings}'
</pre>


### <a id="scenario-9" class="anchor" href="#scenario-9">Use Case 9: Using Scope Aliases</a>

In this use case we are going to demonstrate how to configure RabbitMQ to handle
*custom scopes*. But what are *custom scopes*? They are any
scope whose format is not compliant with RabbitMQ format. For instance, `api://rabbitmq:Read.All`
is one of the custom scopes we will use in this use case.

#### How to configure RabbitMQ with custom scope mapping

Starting with [RabbitMQ `3.10.0`](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v3.10.0),
the OAuth 2 plugin supports mapping of a scope aliases (arbitrary scope values or "names") to one or more scopes
in the format that follows the RabbitMQ OAuth 2 plugin conventions.

See below a sample RabbitMQ configuration where we map `api://rabbitmq:Read.All`
custom scope to `rabbitmq.read:*/*` RabbitMQ scope.

<pre class="lang-erlang">
{rabbitmq_auth_backend_oauth2, [
 ...,
	{scope_aliases, #{
		&lt;&lt;"api://rabbitmq:Read.All"&gt;&gt;      => [&lt;&lt;"rabbitmq.read:*/*"&gt;&gt;],
	  ...
	},
	...
]}
</pre>

Additionally, we can map a custom scope to many RabbitMQ scopes. For instance below we
are mapping the role `api://rabbitmq:producer` to 3 RabbitMQ scopes which grants
`read`, `write` and `configure` access on any resource and on any vhost:

<pre class="lang-erlang">
{rabbitmq_auth_backend_oauth2, [
 ...,

	{scope_aliases, #{
		&lt;&lt;"api://rabbitmq:producer"&gt;&gt; => [
			&lt;&lt;"rabbitmq.read:*/*"&gt;&gt;,
			&lt;&lt;"rabbitmq.write:*/*"&gt;&gt;,
			&lt;&lt;"rabbitmq.configure:*/*"&gt;&gt;
		]
	}},
	...
]}
</pre>

#### Scopes Aliases in JWT Tokens

If we do not configure RabbitMQ OAuth2 plugin with `extra_scopes_source`, RabbitMQ
expects the `scope` token's field to carry *custom scopes*. For instance, below we have a sample JWT
token where the custom scopes are in the `scope` field :

<pre class="lang-javascript">
{
  "sub": "producer",
  "scope": [
    "api://rabbitmq:producer",
    "api://rabbitmq:Administrator"
  ],
  "aud": [
    "rabbitmq"
  ]
}
</pre>

Now, let's say we do configure RabbitMQ OAuth2 plugin with `extra_scopes_source` as shown below:

<pre class="lang-erlang">
  {rabbitmq_auth_backend_oauth2, [
    {resource_server_id, &lt;&lt;"rabbitmq"&gt;&gt;},
    {extra_scopes_source, &lt;&lt;"roles"&gt;&gt;},
    ...
</pre>

With this configuration, RabbitMQ expects *custom scopes* in the field `roles` and
the `scope` field is ignored.

<pre class="lang-javascript">
{
  "sub": "rabbitmq-client-code",
  "roles": "api://rabbitmq:Administrator.All",
  "aud": [
    "rabbitmq"
  ]
}
</pre>

#### UAA Configuration

To demonstrate this new capability we have configured UAA with two Oauth2 clients. One
called `producer_with_roles` with the *custom scope* `api://rabbitmq:producer` and `consumer_with_roles` with
`api://rabbitmq:Read:All,api://rabbitmq:Configure:All,api://rabbitmq:Write:All`.
> we are granting configure and write permissions to the consumer because we have configured perf-test to declare
resources regardless whether it is a producer or consumer application.

These two uaac commands declare the two oauth2 clients above. We are adding an extra scope called `rabbitmq.*` so
that UAA populates the JWT claim `aud` with the value `rabbitmq`. RabbitMQ expects `aud` to match the value we
configure RabbitMQ with in the `resource_server_id` field.

<pre class="lang-bash">
uaac client add producer_with_roles --name producer_with_roles \
    --authorities "rabbitmq.*,api://rabbitmq:producer,api://rabbitmq:Administrator" \
    --authorized_grant_types client_credentials \
    --secret producer_with_roles_secret
uaac client add consumer_with_roles --name consumer_with_roles \
    --authorities "rabbitmq.* api://rabbitmq:read:All" \
    --authorized_grant_types client_credentials \
    --secret consumer_with_roles_secret
</pre>


#### RabbitMQ Configuration

In the OAuth 2 tutorial repository, there are two RabbitMQ configuration files ready to be used:

- [conf/asymmetric_key/rabbitmq-scope-aliases.config](conf/asymmetric_key/rabbitmq-scope-aliases.config): configures a set of scope aliases.
- [conf/asymmetric_key/rabbitmq-scope-aliases-and-extra-scope.config](conf/asymmetric_key/rabbitmq-scope-aliases-and-extra-scope.config): configures a `extra_scopes_source` and a set of scope aliases.


#### Demo 1: Launch RabbitMQ with custom scopes in scope field

To launch RabbitMq with scope mappings and with *custom scopes* in the `scope` field we run the following command:

<pre class="lang-bash">
CONFIG=rabbitmq-scope-aliases.config make start-rabbitmq
</pre>

This command will stop RabbitMQ if it is already running.

Launch a producer application with the client `producer_with_roles`

<pre class="lang-bash">
make start-perftest-producer PRODUCER=producer_with_roles
</pre>

To inspect the logs:

<pre class="lang-bash">
docker logs producer_with_roles -f
</pre>

Launch a consumer application with the client `consumer_with_roles`

<pre class="lang-bash">
make start-perftest-consumer CONSUMER=consumer_with_roles
</pre>

To check the logs : docker logs consumer_with_roles -f

Access management api with the client `producer_with_roles`

<pre class="lang-bash">
make curl url=http://localhost:15672/api/overview client_id=producer_with_roles secret=producer_with_roles_secret
</pre>

To stop the perf-test applications run :

<pre class="lang-bash">
make stop-perftest-producer PRODUCER=producer_with_roles
make stop-perftest-consumer CONSUMER=consumer_with_roles
</pre>

#### Demo 2: Launch RabbitMQ with custom scopes in extra scope field

To launch RabbitMq with scope mappings and with *custom scopes* in the `extra_scope` we run the following command:

<pre class="lang-bash">
CONFIG=rabbitmq-scope-aliases-and-extra-scope.config make start-rabbitmq
</pre>

This command will stop RabbitMQ if it is already running

We cannot use UAA to issue the tokens because we cannot configure UAA to use a custom field for scopes.
Instead we are going to issue the token ourselves with the command `bin/jwt_token`.

Launch a producer application with the token [producer-role-in-scope.json](jwts/producer-roles-in-extra-scope.json):

<pre class="lang-bash">
make start-perftest-producer-with-token PRODUCER=producer_with_roles TOKEN=$(bin/jwt_token producer-role-in-extra-scope.json legacy-token-key private.pem public.pem)
</pre>

To inspect the logs:

<pre class="lang-bash">
docker logs producer_with_roles -f
</pre>

Launch a consumer application with the token [consumer-roles-in-extra-scope.json](jwts/consumer-roles-in-extra-scope.json):

<pre class="lang-bash">
make start-perftest-consumer-with-token CONSUMER=consumer_with_roles TOKEN=$(bin/jwt_token consumer-roles-in-extra-scope.json legacy-token-key private.pem public.pem)
</pre>

Access management api with the token [producer-roles-in-extra-scope.json](jwts/producer-roles-in-extra-scope.json)

<pre class="lang-bash">
make curl-with-token URL="http://localhost:15672/api/overview" TOKEN=$(bin/jwt_token producer-roles-in-extra-scope.json legacy-token-key private.pem public.pem)
</pre>

To stop the `perf-test` applications, run:

<pre class="lang-bash">
make stop-perftest-producer PRODUCER=producer_with_roles
make stop-perftest-consumer CONSUMER=consumer_with_roles
</pre>


## <a id="understanding-environment" class="anchor" href="#understanding-environment">Understand the Environment</a>

### RabbitMQ Server

We need to launch RabbitMQ with the following prerequisites:

* Like with all other [plugins](./plugins.html), the OAuth 2 plugin must be enabled.
* Plugin is configured with the [same signing key as used by UAA](#about-signing-key-required-to-configure-rabbitmq)
* The node is configured to use OAuth2 [authN and authZ backend](./access-control.html)
* [Management plugin](./management.html) is configured to use UAA

The following configuration snippets demonstrate these steps:

<pre class="lang-erlang">
  {rabbitmq_auth_backend_oauth2, [
    {resource_server_id, &lt;&lt;"rabbitmq"&gt;&gt;}
    {key_config, [
      {default_key, &lt;&lt;"legacy-token-key"&gt;&gt;},
      {signing_keys, #{
        &lt;&lt;"legacy-token-key"&gt;&gt; => {map, #{&lt;&lt;"kty"&gt;&gt; => &lt;&lt;"MAC"&gt;&gt;,
                                  &lt;&lt;"alg"&gt;&gt; => &lt;&lt;"HS256"&gt;&gt;,
                                  &lt;&lt;"use"&gt;&gt; => &lt;&lt;"sig"&gt;&gt;,
                                  &lt;&lt;"value"&gt;&gt; => &lt;&lt;"tokenKey"&gt;&gt;}}
      }}
    ]}
  ]},
</pre>

<pre class="lang-erlang">
[
  % Instruct the node to use OAuth 2 backend first, then internal if necessary
  {rabbit, [
     {auth_backends, [rabbit_auth_backend_oauth2, rabbit_auth_backend_internal]}
  ]},
].
</pre>

<pre class="lang-erlang">
[
  {rabbitmq_management, [
    %% use UAA
    {enable_uaa,    true},
    %% OAuth 2 identity server client ID
    {uaa_client_id, "rabbit_client"},
    %% UAA endpoint location
    {uaa_location, "http://localhost:8080/uaa"}
  ]},
].
</pre>

Find a complete example in the [GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/blob/master/conf/symmetric_key/rabbitmq.config).


### UAA Server

Standalone OAuth2 server (https://github.com/cloudfoundry/uaa). Its primary role is as an OAuth2 provider, issuing tokens for client applications to use when they act on behalf of Cloud Foundry users. It can also authenticate users with their Cloud Foundry credentials, and can act as an SSO service using those credentials. It has endpoints for managing user accounts and for registering OAuth2 clients, as well as various other management functions

**Important note**: UAA can use an external database such PostgreSQL or MySQL.
For the demonstration purposes of this tutorial, the internal database is sufficient.

To verify that UAA is running and accessible on `localhost:8080`:

<pre class="lang-bash">
curl -k  -H 'Accept: application/json' http://localhost:8080/uaa/info | jq .
</pre>

Currently RabbitMQ Management plugin does not support latest version of UAA. That is
why in order to run the use cases we use the image built from the folder `uaa-4.24`. This has to do
with the javascript library that comes with the management plugin.


### UAA client

In order to interact with UAA server there is a convenient command-line application called `uaac`. To install it and get it ready run the following command:

<pre class="lang-bash">
make install-uaac
</pre>

In order to operate with uaa we need to "authenticate". There is an OAuth client preconfigured with the following credentials `admin:adminsecret`.
This user is configured under `{uaa_repo}/uaa/src/main/webapp/WEB-INF/spring/oauth-clients.xml`. The above command takes care of this.

### Clients, Users and Permissions in UAA

The Make target `make setup-users-and-clients` accomplishes a few things:

* Created `rabbit_client` client -in UAA- which is going to be used by RabbitMQ server to authenticate management users coming to the management ui.
* Created `rabbit_admin` user -in UAA- which is going to be the full administrator user with full access
* Created `rabbit_monitor` user -in UAA- which is going to be the monitoring user with just the *monitoring* *user tag*
* Created `consumer` client -in UAA- which is going to be the RabbitMQ User for the consumer application
* Created `producer` client -in UAA- which is going to be the RabbitMQ User for the producer application
* Obtained tokens -from UAA- for the two end users and for the two clients



## <a id="deeper-dive" class="anchor" href="#deeper-dive">Deeper Dive</a>

### About Users and Clients

First of all, we need to clarify the distinction between *users* and *clients*.
- A *user* is often represented as a live person. This is typically the user who wants to access the RabbitMQ Management UI/API.  
- A *client* (a.k.a. *service account*) is an application that acts on behalf of a user or act on its own. This is typically an AMQP application.

### About Permissions

*Users* and *clients* will both need to get granted permissions. In OAuth 2.0, permissions/roles are named *scopes*. They are free form strings. When a RabbitMQ user connects to RabbitMQ, it must provide a JWT token with those *scopes* as a password (and empty username). And RabbitMQ determines from those *scopes* what permissions it has.

The *scope* format recognized by RabbitMQ is as follows

<pre class="lang-plaintext">
{resource_server_id}.{permission}:{vhost_pattern}/{name_pattern}/{routing_key_pattern}
</pre>

where:

- `{resource_server_id}` is a prefix used for *scopes* in UAA to avoid scope collisions (or unintended overlap)
- `{permission}` is an access permission (configure, read, write, tag)
- `{vhost_pattern}` is a wildcard pattern for vhosts token has access to
- `{name_pattern}` is a wildcard pattern for resource name
- `{routing_key_pattern}` is an optional wildcard pattern for routing key in topic authorization

For more information, see [how scopes are translated to RabbitMQ permissions](https://github.com/rabbitmq/rabbitmq-auth-backend-oauth2#scope-to-permission-translation)
and [RabbitMQ permissions](https://www.rabbitmq.com/access-control.html#permissions) documentation.

Sample *scope*(s):

* `rabbitmq.read:*/*` grants `read` permission on any *vhost* and on any *resource*
* `rabbitmq.write:uaa_vhost/x-*` grants `write` permissions on `uaa_vhost` on any *resource* that starts with `x-`
* `rabbitmq.tag:monitoring` grants `monitoring` *user tag*

> Be aware that we have used `rabbitmq` resource_server_id in the sample scopes. RabbitMQ must be configured with this same `resource_server_id`. Check out [conf/symmetric_keys/rabbitmq.config](rabbitmq.config)


### About signing key required to configure RabbitMQ

This section is only to explain one of things we need to take care to configure RabbitMQ with OAuth2 auth-backend. Do not run any of the commands explained on this section. They are all included in the `make` commands we will cover in the following sections.

To configure Oauth plugin in RabbitMQ we need to obtain the JWT signing key used by UAA when it issues JWT tokens.
But our `admin` client does not have yet the right *authority* (`uaa.resource`) to get that signing key. We are going to "auto" grant it ourselves:

<pre class="lang-bash">
uaac client update admin --authorities "clients.read clients.secret clients.write uaa.admin clients.admin scim.write scim.read uaa.resource"
</pre>

And now we retrieve the signing key:

<pre class="lang-bash">
uaac signing key -c admin -s adminsecret
</pre>

which outputs:

<pre class="lang-plaintext">
kty: MAC
alg: HS256
value: tokenKey
use: sig
kid: legacy-token-key
</pre>

Another way to retrieve it is via the UAA REST API:

<pre class="lang-bash">
curl 'http://localhost:8080/uaa/token_key' -i  -H 'Accept: application/json' -u admin:adminsecret
</pre>


### About Rotating UAA signing key

When UAA rotates the signing key we need to reconfigure RabbitMQ with that key. We don't need to edit the configuration and restart RabbitMQ.

Instead, thru the `rabbitmqctl add_uaa_key` command we can add more keys. This is more or less what could happen.

1. UAA starts up with a signing key called "key-1"
2. We configure RabbitMQ with the signing key "key-1" following the procedure explained in the previous section
3. RabbitMQ starts
4. An application obtains a token from UAA signed with that "key-1" signing key and connects to RabbitMQ using the token
5. RabbitMQ can validate it because it has the signing key
6. UAA rotates the signing key. It has a new key "key-2"
7. An application obtains a new token from UAA. This time it is signed using "key-2". The application connect to RabbitMQ using the new token
8. RabbitMQ fails to validate it because it does not have "key-2" signing key. Later on we will see how RabbitMQ finds out the signing key name for the JWT
9. We add the new signing key via the `rabbitmqctl` command
10. This time RabbitMQ can validate tokens signed with "key-2"

One way to keep RabbitMQ up-to-date is to periodically check with [token keys endpoint](https://docs.cloudfoundry.org/api/uaa/version/4.28.0/index.html#token-keys) (using the `E-tag` header). When the list of active tokens key has changed, we retrieve them and add them using `rabbitmqctl add_uaa_key`.

We are probably missing the ability to remove deprecated/obsolete signing keys.
The [function](https://github.com/rabbitmq/rabbitmq-auth-backend-oauth2/blob/master/src/uaa_jwt.erl) is there so we could potentially invoke it via `rabbitmqctl eval` command.



### Understanding How Applications Connect to RabbitMQ Using an AMQP 0-9-1 Client and OAuth 2

This is what it happens the under hood:
1. First of all, both applications must have their OAuth client declared in UAA. We already created them (`consumer` and `producer`) when we ran `make setup-users-and-clients` command.
2. In order to open an AMQP connection with RabbitMQ, the client must present a JWT token as the *password*. The username is ignored.
3. To obtain the JWT Token, the application requests it from UAA using its credentials (*client_id* and *client_secret*). For instance, the consumer app gets its token using this command:
  <pre class="lang-bash">
  uaac token client get consumer -s consumer_secret
  </pre>
4. Once we have the token we can build the AMQP URI. This snipped, extracted from the [run-perftest](run-perftest) script invoked by the `start-consumer` or `start-producer` Make targets, shows how it is done:
  <pre class="lang-bash">
  token=$(uaac context $CLIENT_ID | awk '/access_token/ { print $2}')
  url="amqp://ignored:{token}@rabbitmq:5672/%2F"
  </pre>

### Client Connections via Spring and Spring Cloud Services using OAuth Client Credentials Grant Type

This example is a **service to service** interaction in the sense that the application is not using RabbitMQ on behalf of a user.
In other words, the application authenticates with RabbitMQ with its own identity not with the user's identity.
In a classic Oauth application, the application uses the user's identity to access downstream resources. But this is not our case.

We are demonstrating an application running in Cloud Foundry and this is the reason for referring to `VCAP_SERVICES` as
the means to retrieve the RabbitMQ's credentials.

With that in mind, an application needs an Oauth client so that it obtains an JWT Token using Oauth Client Credentials grant type. How we tell the application which Oauth client to use is what we need to agree upon. There are two options -once again when we run RabbitMQ and apps in Cloud Foundry.

### Option 1

It can be that **RabbitMQ service instance** provides both the AMQP connection URI (and HTTP API URI) and the OAuth client credentials:

<pre class="lang-javascript">
{
  "user-provided": [
    {
      "credentials":  {
        "uri": "amqp://localhost:5672/%2F",
        "oauth_client": {
          "client_id": "consumer",
          "client_secret": "consumer_secret",
          "auth_domain": "http://uaa:8080/uaa"
        }
      },
      "instance_name": "rmq",
      "label": "rabbitmq-oauth",
      "name": "rmq"
    }
  ]
}
</pre>

`rabbitmq-oauth` label is a custom label created for this demonstration. The demo application extends the Spring Cloud Connector with a new AmqpOauthServiceInfo
which is able to parse the `oauth_client` entry.

This is the option demonstrated by the `make start-spring-demo-oauth-cf` target.

### Option 2

In this case, the application provides its own OAuth client.

For instance, the application could use the [Single-Sign-One service for PCF](https://docs.pivotal.io/p-identity/1-8/index.html)
to assign an Oauth client to the application.

<pre class="lang-javascript">
{
  "user-provided": [
    {
      "credentials":  {
        "uri": "amqp://localhost:5672/%2F",
        "auth_enabled" : true
      },
      "instance_name": "rmq",
      "label": "rabbitmq-oauth",
      "name": "rmq"
    }
  ],
  "sso": [
  {
    "credentials":  {
      "client_id": "myapp",
      "client_secret": "myapp_secret",
      "auth_domain": "http://uaa:8080/uaa"
    },
    "instance_name": "sso",
    "label": "sso",
    "name": "sso"
  }
  ]
}
</pre>

#### OAuth Client Provided by RabbitMQ Service Instance

[demo-oauth-rabbitmq](demo-oauth-rabbitmq) is a Spring Boot application that uses Spring OAuth2 support
to obtain a JWT token using OAuth2 Client Credentials grant type. It leverages Spring Cloud Connectors,
in particular for Cloud Foundry, to retrieve the RabbitMQ Credentials (i.e. url, OAuth client credentials).

The application extends the [AmqpServiceInfo](demo-oauth-rabbitmq/src/main/java/com/pivotal/cloud/service/messaging/AmqpOAuthServiceInfo.java)
so that it can get Oauth client credentials from the service instance.

The demo application consumes messages from the `q-perf-test` queue. It uses the `consumer` auth client to obtain the JWT Token.

<pre class="lang-bash">
make start-spring-demo-oauth-cf
</pre>


### Understanding Access tokens and how RabbitMQ uses it

First of all, lets quickly go thru how RabbitMQ uses the OAuth Access Tokens; how RabbitMQ users/clients pass the token; whats inside the token and what information in the token is relevant for RabbitMQ and how it uses it.

#### How Clients Pass JWT Tokens to RabbitMQ

RabbitMQ expects a [JWS](https://tools.ietf.org/html/rfc7515) in the password field.

For end users, the best way to come to the management ui is by the following url, replacing `{token}` with an actual encoded JWT.
This is how `make open` command is able to open the browser and login the user using a JWT.

<pre class="lang-bash">
http://localhost:15672/#/login/{token}
</pre>

#### Signed Tokens

RabbitMQ expects a JWS, i.e. signed JWT. There are three parts to a signed token (JWS):

 * a header which describes the signing algorithm and the signing key identifier used to sign the JWT
 * a body with the actual token
 * a signature.

This is a example of the header of a JWT issued by UAA:

<pre class="lang-javascript">
{
  "alg": "HS256",
  "jku": "https://localhost:8080/uaa/token_keys",
  "kid": "legacy-token-key",
  "typ": "JWT"
}
</pre>

where:

  - [typ](https://tools.ietf.org/html/rfc7515#page-8) is the media type which in this case is JWT. However the JWT protected header and JWT payload are secured using HMAC SHA-256 algorithm
  - [alg](https://tools.ietf.org/html/rfc7515#page-10) is the signature algorithm
  - [jku](https://tools.ietf.org/html/rfc7515#page-10) is the HTTP GET resource that returns the signing keys supported by the server that issued this token
  - [kid](https://tools.ietf.org/html/rfc7515#page-11) identifies the signing key used to sign this token

Note that `uaac token decode` does not print the header only the actual token.
One simple way to get this information is via [jwt.io](https://jwt.io).

To get the signing key used by UAA we access the *token key* access point with the credentials of the `admin` UAA client; or a client which has the permission to get it.

<pre class="lang-bash">
curl http://localhost:8080/uaa/token_key \
 -H 'Accept: application/json' \
 -u admin:adminsecret  | jq .
</pre>

It should print out:

<pre class="lang-javascript">
{
  "kty": "MAC",
  "alg": "HS256",
  "value": "tokenKey",
  "use": "sig",
  "kid": "legacy-token-key"
}
</pre>

We can see that the `kid`s value above matches the `kid`'s in the JWT.

**Relevant token information for RabbitMQ**

Let's examine the following token which corresponds to end-user `rabbit_admin`.

<pre class="lang-javascript">
{
  "jti": "dfb5f6a0d8d54be1b960e5ffc996f7aa",
  "sub": "71bde130-7738-47b8-8c7d-ad98fbebce4a",
  "scope": [
    "rabbitmq.read:*/*",
    "rabbitmq.write:*/*",
    "rabbitmq.tag:administrator",
    "rabbitmq.configure:*/*"
  ],
  "client_id": "rabbit_client",
  "cid": "rabbit_client",
  "azp": "rabbit_client",
  "grant_type": "password",
  "user_id": "71bde130-7738-47b8-8c7d-ad98fbebce4a",
  "origin": "uaa",
  "user_name": "rabbit_admin",
  "email": "rabbit_admin@example.com",
  "auth_time": 1551957721,
  "rev_sig": "d5cf8503",
  "iat": 1551957721,
  "exp": 1552000921,
  "iss": "http://localhost:8080/uaa/oauth/token",
  "zid": "uaa",
  "aud": [
    "rabbitmq",
    "rabbit_client"
  ]
}
</pre>

These are the fields relevant for RabbitMQ:
- `sub` ([Subject](https://tools.ietf.org/html/rfc7519#page-9)) this is the identify of the subject of the token. **RabbitMQ uses this field to identify the user**. This token corresponds to the `rabbit_admin` end user. If we logged into the management ui, we would see it in the top-right corner. If this were an AMPQ user, we would see it on each connection listed in the connections tab.  
  UAA would add 2 more fields relative to the *subject*: a `user_id` with the same value as the `sub` field, and `user_name` with user's name. In UAA, the `sub`/`user_id` fields contains the user identifier, which is a GUID.

- `client_id` (not part of the RFC-7662) identifies the OAuth client that obtained the JWT. We used `rabbit_client` client to obtain the JWT for `rabbit_admin` user. **RabbitMQ also [uses](https://github.com/rabbitmq/rabbitmq-auth-backend-oauth2/blob/master/src/rabbit_auth_backend_oauth2.erl#L169) this field to identify the user**.

- `aud` ([Audience](https://tools.ietf.org/html/rfc7519#page-9)) this identifies the recipients and/or resource_server of the JWT. **RabbitMQ uses this field to validate the token**. When we configured RabbitMQ OAuth plugin, we set `resource_server_id` attribute with the value `rabbitmq`. The list of audience must have the `rabbitmq` otherwise RabbitMQ rejects the token.

- `jti` ([JWT ID](https://tools.ietf.org/html/rfc7662#section-2.2)) this is just an identifier for the JWT

- `iss` ([Issuer](https://tools.ietf.org/html/rfc7662#section-2.2)) identifies who issued the JWT. UAA will set it to end-point that returned the token.

- `scope` is an array of [OAuth Scope](https://tools.ietf.org/html/rfc7523#page-4). **This is what RabbitMQ uses to determine the user's permissions**. However, RabbitMQ will only use the *scopes* which belong to this RabbitMQ identified by the plugin configuration parameter `resource_server_id`. In other words, if the `resource_server_id` is `rabbitmq`, RabbitMQ will only use the *scopes* which start with `rabbimq.`.

- `exp` ([exp](https://tools.ietf.org/html/rfc7519#page-9)) identifies the expiration time on
   or after which the JWT MUST NOT be accepted for processing. RabbitMQ uses this field to validate the token if it is present.
   > Implementers MAY provide for some small leeway, usually no more than
   a few minutes, to account for clock skew. However, RabbitMQ does not add any leeway.


### <a id="deeper-dive-useful-uaac-commands" class="anchor" href="#deeper-dive-useful-uaac-commands">Useful uaac Commands</a>

 `uaac` allows us to generate or obtain many tokens for different users and/or clients. However, only one of them is treated as the **current** token.
 This **current** token is only relevant when we interact with `uaac`, say to create/delete users, and/or obtain further tokens.

 To know all the tokens we have generated so far we run:

 <pre class="lang-bash">
 uaac contexts
 </pre>

 To know what the current context is, we run:

 <pre class="lang-bash">
 uaac context
 </pre>

 which outputs

 <pre class="lang-plaintext">
 0]*[http://localhost:8080/uaa]

   [0]*[admin]
       client_id: admin
       access_token: eyJhbGciOiJIUzI1NiIsImprdSI6Imh0dHBzOi8vbG9jYWxob3N0OjgwODAvdWFhL3Rva2VuX2tleXMiLCJraWQiOiJsZWdhY3ktdG9rZW4ta2V5IiwidHlwIjoiSldUIn0.eyJqdGkiOiIxODkyY2ZmMmRmNjc0ZmRiYmYwMWIyM2I2ZWU4MjlkZCIsInN1YiI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiY2xpZW50cy5yZWFkIiwiY2xpZW50cy5zZWNyZXQiLCJjbGllbnRzLndyaXRlIiwidWFhLmFkbWluIiwiY2xpZW50cy5hZG1pbiIsInNjaW0ud3JpdGUiLCJzY2ltLnJlYWQiXSwic2NvcGUiOlsiY2xpZW50cy5yZWFkIiwiY2xpZW50cy5zZWNyZXQiLCJjbGllbnRzLndyaXRlIiwidWFhLmFkbWluIiwiY2xpZW50cy5hZG1pbiIsInNjaW0ud3JpdGUiLCJzY2ltLnJlYWQiXSwiY2xpZW50X2lkIjoiYWRtaW4iLCJjaWQiOiJhZG1pbiIsImF6cCI6ImFkbWluIiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiI4Yzg2YjcyOCIsImlhdCI6MTU1MDc1OTI0OCwiZXhwIjoxNTUwODAyNDQ4LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvdWFhL29hdXRoL3Rva2VuIiwiemlkIjoidWFhIiwiYXVkIjpbInNjaW0iLCJjbGllbnRzIiwidWFhIiwiYWRtaW4iXX0._d9UPkdDNTYsCjf1NemWIBfv0v8S4u0wzjrBmP4S11U
       token_type: bearer
       expires_in: 43199
       scope: clients.read clients.secret clients.write uaa.admin clients.admin scim.write scim.read
       jti: 1892cff2df674fdbbf01b23b6ee829dd
</pre>

 We can decode the jwt token above:

 <pre class="lang-bash">
 uaac token decode eyJhbGciOiJIUzI1NiIsImprdSI6Imh0dHBzOi8vbG9jYWxob3N0OjgwODAvdWFhL3Rva2VuX2tleXMiLCJraWQiOiJsZWdhY3ktdG9rZW4ta2V5IiwidHlwIjoiSldUIn0.eyJqdGkiOiIxODkyY2ZmMmRmNjc0ZmRiYmYwMWIyM2I2ZWU4MjlkZCIsInN1YiI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiY2xpZW50cy5yZWFkIiwiY2xpZW50cy5zZWNyZXQiLCJjbGllbnRzLndyaXRlIiwidWFhLmFkbWluIiwiY2xpZW50cy5hZG1pbiIsInNjaW0ud3JpdGUiLCJzY2ltLnJlYWQiXSwic2NvcGUiOlsiY2xpZW50cy5yZWFkIiwiY2xpZW50cy5zZWNyZXQiLCJjbGllbnRzLndyaXRlIiwidWFhLmFkbWluIiwiY2xpZW50cy5hZG1pbiIsInNjaW0ud3JpdGUiLCJzY2ltLnJlYWQiXSwiY2xpZW50X2lkIjoiYWRtaW4iLCJjaWQiOiJhZG1pbiIsImF6cCI6ImFkbWluIiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiI4Yzg2YjcyOCIsImlhdCI6MTU1MDc1OTI0OCwiZXhwIjoxNTUwODAyNDQ4LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvdWFhL29hdXRoL3Rva2VuIiwiemlkIjoidWFhIiwiYXVkIjpbInNjaW0iLCJjbGllbnRzIiwidWFhIiwiYWRtaW4iXX0._d9UPkdDNTYsCjf1NemWIBfv0v8S4u0wzjrBmP4S11U
 </pre>

 which outputs:

 <pre class="lang-plaintext">
 jti: 1892cff2df674fdbbf01b23b6ee829dd
 sub: admin
 authorities: clients.read clients.secret clients.write uaa.admin clients.admin scim.write scim.read
 scope: clients.read clients.secret clients.write uaa.admin clients.admin scim.write scim.read
 client_id: admin
 cid: admin
 azp: admin
 grant_type: client_credentials
 rev_sig: 8c86b728
 iat: 1550759248
 exp: 1550802448
 iss: http://localhost:8080/uaa/oauth/token
 zid: uaa
 aud: scim clients uaa admin
 </pre>
