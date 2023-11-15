# Use OAuth2 Proxy and Keycloak as OAuth 2.0 server

Let's test the following flow:

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

- Docker
- make

## Deploy Keycloak

Deploy Keycloak by running the following command:
```bash
make start-keycloak
```

Note: Keycloak is preconfigured with the required scopes, users, and clients. It is configured with its own signing key and the [rabbitmq.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/conf/oauth2-proxy/rabbitmq.conf) file is also configured with the same signing key.

To access Keycloak Management UI, go to http://0.0.0.0:8080/ and enter `admin` as username and password.

There is a dedicated **Keycloak realm** called `Test` configured as follows:

* [rsa](http://0.0.0.0:8080/admin/master/console/#/realms/test/keys) signing key
* [rsa provider](http://0.0.0.0:8080/admin/master/console/#/realms/test/keys/providers)
* `rabbitmq-proxy-client` client

## Start RabbitMQ

To start RabbitMQ run the following two commands. The first one tells RabbitMQ to pick up the
rabbitmq.conf found under [conf/oauth2-proxy/rabbitmq.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/conf/oauth2-proxy/rabbitmq.conf)

```plain
export MODE=oauth2-proxy
make start-rabbitmq
```

**NOTE**: Oauth2 Proxy requires that the `aud` claim matches the client's id. However, RabbitMQ requires the
`aud` field to match `rabbitmq` which is the designated `resource_server_id`. Given that it has been
impossible to configure keycloak with both values, [rabbitmq.conf](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/conf/oauth2-proxy/rabbitmq.conf) has
the setting below which disables validation of the audience claim.

```ini
auth_oauth2.verify_aud = false
```


## Start OAuth2 Proxy

To start OAuth2 Proxy, run the following command:

```plain
make start-oauth2-proxy
```

Oauth2 Proxy is configured using [Alpha configuration](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/main/conf/oauth2-proxy/alpha-config.yaml). This type of configuration inserts the access token into the HTTP **Authorization** header.


## Access Management UI

Go to http://0.0.0.0:4180/, click on the **Sign in with Keycloak OIDC** link, and enter the credentials
`rabbit_admin` as username and `rabbit_admin` as password. You should be redirected to RabbitMQ management UI.
