# Use KeyCloak as OAuth 2.0 server

We are going to test 3 OAuth flows:
1. Access management ui via a browser
2. Access management rest api
3. Access AMQP protocol

## Prerequisites to follow this guide

* Docker
* make

## Deploy Key Cloak

First, deploy **Key Cloak**. It comes preconfigured with all the required scopes, users and clients.
```
make start-keycloak
```
**Key Cloak** comes configured with its own signing key. And the [rabbitmq.config](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/conf/keycloak/rabbitmq.config)
used by `make start-keycloak` is also configured with the same signing key.

To access KeyCloak management interface go to http://0.0.0.0:8080/ and enter `admin` as username and password.

There is a dedicated **KeyCloak realm** called `Test` configured as follows:
* We configured an [rsa](http://0.0.0.0:8080/admin/master/console/#/realms/test/keys) signing key
* And a [rsa provider](http://0.0.0.0:8080/admin/master/console/#/realms/test/keys/providers)
* And three clients: `rabbitmq-client-code` for the rabbitmq managament ui, `mgt_api_client` to access via the
management api and `producer` to access via AMQP protocol.


## Start RabbitMQ

Supporting new types of OAuth 2 servers is currently under development.
There are two alternatives. You can run directly from source:
1. git clone rabbitmq/rabbitmq-server
2. git checkout oidc-integration
3. `gmake run-broker PLUGINS="rabbitmq_management rabbitmq_auth_backend_oauth2" RABBITMQ_CONFIG_FILE=<root folder of the tutorial>/conf/keycloak/rabbitmq.config`

Or from docker:

<pre class="lang-bash">
export MODE=keycloak
make start-rabbitmq
</pre>


## Access Management api

Access the management api using the client [mgt_api_client](http://0.0.0.0:8080/admin/master/console/#/realms/test/clients/c5be3c24-0c88-4672-a77a-79002fcc9a9d) which has the scope [rabbitmq.tag:administrator](http://0.0.0.0:8080/admin/master/console/#/realms/test/client-scopes/f6e6dd62-22bf-4421-910e-e6070908764c)

<pre class="lang-bash">
make curl-keycloak url=http://localhost:15672/api/overview client_id=mgt_api_client secret=LWOuYqJ8gjKg3D2U8CJZDuID3KiRZVDa
</pre>

## Access AMQP protocol with PerfTest

To test OAuth2 authentication with AMQP protocol we are going to use RabbitMQ PerfTest tool which uses RabbitMQ Java Client.
First we obtain the token and pass it as a parameter to the make target `start-perftest-producer-with-token`.

<pre class="lang-bash">
make start-perftest-producer-with-token PRODUCER=producer TOKEN=$(bin/keycloak/token producer kbOFBXI9tANgKUq8vXHLhT6YhbivgXxn)
</pre>

**NOTE**: Initializing an application with a token has one drawback: the application cannot use the connection beyond the lifespan of the token. See the next section where we demonstrate how to refresh the token.

## Access AMQP protocol with Pika

This section is about testing Oauth2 authentication with AMQP protocol and with Pika library. And more specifically, we
are demonstrating how to refresh a token on a live AMQP connections.

You can see the Python sample application [here](../pika_keycloak).

To run this sample code proceed as follows:
<pre class="lang-bash">
python3 --version
pip install pika
pip install requests
python3 pika-client/producer.py producer kbOFBXI9tANgKUq8vXHLhT6YhbivgXxn
</pre>

Note: Ensure you install pika 1.3

## Access Management UI

Go to http://localhost:15672, click on the single button on the page which redirects to **Key Cloak** to authenticate.
Enter `rabbit_admin` and `rabbit_admin` and you should be redirected back to RabbitMQ Management fully logged in.


## Stop keycloak

<pre class="lang-bash">
make stop-keycloak
</pre>

## Notes about setting up KeyCloak

### Configure JWT signing Keys

At the realm level, we go to `Keys > Providers` tab and create one of type `rsa` and we enter the
private key and certificate of the public key. In this repository we do not have yet the certificate
for the public key but it is easy to generate. Give it priority `101` or greater than the rest of
available keys so that it is picked up when we request a token.

IMPORTANT: We cannot hard code the **kid** hence we have to add the key to rabbitmq via the command
<pre class="lang-bash">
docker exec -it rabbitmq rabbitmqctl add_uaa_key Gnl2ZlbRh3rAr6Wymc988_5cY7T5GuePd5dpJlXDJUk --pem-file=conf/public.pem
</pre>
or we have to modify the RabbitMQ configuration so that it says `Gnl2ZlbRh3rAr6Wymc988_5cY7T5GuePd5dpJlXDJUk`
rather than `legacy-token-key`.

### Configure Client

For backend applications which uses **Client Credentials flow** we create a **Client** with:
* **Access Type** : `confidential`
* With all the other flows disabled: Standard Flow, Implicit Flow, Direct Access Grants
* With **Service Accounts Enabled** on. If it is not enabled we do not have the tab `Credentials`
* In tab `Credentials` we have the client id secret


### Configure Client scopes

> *Default Client Scope* are scopes automatically granted to every token. Whereas *Optional Client Scope* are
scopes which are only granted if they are explicitly requested during the authorization/token request flow.


### Include appropriate aud claim

We must configure a **Token Mapper** of type **Hardcoded claim** with the value of rabbitmq's *resource_server_id**.
We can configure **Token Mapper** either to a **Client scope** or to a **Client**.
