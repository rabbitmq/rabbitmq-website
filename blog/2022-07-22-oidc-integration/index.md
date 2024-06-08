---
title: "OIDC Integration"
tags: ["HowTo", "Security", ]
authors: [mrosales]
---

Today when we use the _rabbitmq-management_ with the _rabbitmq_auth_backend_oauth2_ plugin, the only supported Authorization server is [UAA](https://docs.cloudfoundry.org/concepts/architecture/uaa.html), making it difficult to connect to other OAuth  2.0 servers. Additionally, _rabbitmq-management_ plugin uses the [OAuth 2.0 implicit](https://oauth.net/2/grant-types/implicit/) flow which is no longer recommended for security reasons.

RabbitMQ 3.11 will support practically any Authorization server compliant with OpenID Connect and OAuth 2.0 protocols.
Furthermore, OAuth 2.0 [authorization code grant](https://oauth.net/2/grant-types/authorization-code/) becomes the default grant and [implicit](https://oauth.net/2/grant-types/implicit/) grant is no longer supported.

<!-- truncate -->

## Overview

Prior to RabbitMQ 3.11, when using OAuth 2.0 with the Management UI, RabbitMQ only supported UAA as an OAuth 2.0 server due to the use of a javascript library provided by UAA. Furthermore, this library only supported _implicit_ grant type and targeted custom UAA's HTTP endpoints, which do not follow any standard such as OpenID Connect.

RabbitMQ 3.11 delegates all OAuth 2.0 and OpenID Connect protocols to the [oidc-client-ts](https://authts.github.io/oidc-client-ts/) library and no longer depends on the UAA client library. With this change, RabbitMQ no longer supports the _implicit_ grant type but now supports _authorization code_ grant type. Additionally, the old settings with the prefix `uaa_`, such as `uaa_location`, are deprecated and replaced by a new set of settings with the prefix `oauth_`, as clarified in the next section, [Usage](#usage).


## Usage

To configure _rabbitmq-management_ to authenticate users with any OAuth 2.0 server we need to provide the following settings:
* `oauth_enabled` replaces `enable_uaa`
* `oauth_client_id` replaces `uaa_client_id`
* `oauth_client_secret` contains the secret corresponding to the `oauth_client_id`. This is a new setting, as the _implicit_ grant flow did not require a secret.
* `oauth_provider_url` replaces `uaa_location`. It is the OpenID Connect endpoint URL, and through this endpoint, RabbitMQ discovers all the other OAuth 2.0 endpoints.

Here is an example configuration of the plugin with the above settings:
```erlang
  { rabbitmq_management,
     ...

     {oauth_enabled, true},
     {oauth_client_id, "PUT YOUR AUTH CLIENT ID"},
     {oauth_client_secret, "PUT YOUR AUTH CLIENT SECRET"},
     {oauth_provider_url, "PUT YOUR OpenID Connect URL"}
     ...
  }
```

In addition to the four mandatory settings above, there is an additional optional setting:

* `oauth_scopes` sets the _scopes_ RabbitMQ requests on behalf of the user accessing the management UI. The default value is `openid profile` when `enable_uaa` is not set or false, and `openid profile <rabbitmq_auth_backend_oauth2.resource_server_id>.*` when `enable_uaa` is true

*When do we need to set `oauth_scopes`?*

There are some OAuth 2.0 servers which can automatically grant _scopes_ to users regardless of the scopes requested by RabbitMQ during the authorization request. Should your OAuth 2.0 server have this capability, you do not need to specify all the scopes in `oauth_scopes`.

On the contrary, if your OAuth 2.0 server only grants those _scopes_ requested during the authorization request, then
they must be specified within the `oauth_scopes` setting.


## How are existing clusters affected by this change?

Only RabbitMQ clusters which are currently configured to authenticate with UAA are affected by this change.
They will stop working unless these changes are made:

* Add `{oauth_enabled, true},`
* Add `{oauth_client_secret, "UAA_CLIENT_SECRET"},` , where `UAA_CLIENT_SECRET` is the client secret associated with the previously configured `uaa_client_id`

However, it is highly recommended that existing clusters configured to use UAA for OAuth 2.0 be completely reconfigured with the new settings, as the old configuration is deprecated and will be removed in a future release.

## What OAuth 2.0 servers are currently supported?

In theory, any OAuth 2.0 server which is OpenID Connect compliant should be supported. RabbitMQ has been tested
against the following OAuth 2.0 servers:

* Keycloak
* Auth0
* Azure Active Directory
