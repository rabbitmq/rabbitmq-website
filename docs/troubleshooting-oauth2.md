---
title: Troubleshooting OAuth 2
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

# Troubleshooting OAuth 2

## Overview {#overview}

This guide covers the most common errors encountered using [OAuth 2.0](./oauth2/) and [management plugin](./management) and how to diagnose them.

## Troubleshooting OAuth 2 in the management UI {#management-ui}

### OpenId Discovery endpoint not reachable {#openid-discovery-endpoint-not-reachable-error}

#### Steps to reproduce the issue

Open the root URL of the management UI in the browser.
Rather than getting the button "Click here to login" you see the following error message:

```
OAuth resource [rabbitmq] not available. OpenId Discovery endpoint https://<the_issuer_url>/.well-known/openid-configuration not reachable
```

#### Troubleshoot the issue

These are the most common reasons for this issue:
- The endpoint is either down or is unreachable (e.g. there is a firewall which blocks access).
- The endpoint has a SSL certificate not trusted by the browser.
- The browser is blocking access due to [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) policy.

The quickest way to identity the root cause is by opening the browser's javascript console and searching for `net::ERR_`. The most likely errors are:
- `net::ERR_CONNECTION_REFUSED` The endpoint is down or is unreachable.
- `net::ERR_CERT_AUTHORITY_INVALID` The endpoint's SSL Certificate is not trusted by your browser. If you want to trust this certificate, click on the URL in the error message. The browser will prompt you to trust it.

If you did not find any errors searching for `net::ERR`, next search for `CORS`. If you find an error similar to the following one means that the browser is blocking the response returned by the endpoint and therefore it is not being delivered it to the management UI. This is due to the [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) policy. You should ask the administrator of your Identity Provider to add the management UI's URL to the list of allowed **origins**.

  `Access to fetch at 'https://<the_issuer_url>>/.well-known/openid-configuration' from origin
  '<rabbitmq_url_to_management_ui>' has been blocked by CORS policy`.

If there are no errors found for `net::ERR` search instead for `CORS`. An error similar to the one shown below means that the browser is blocking the response returned by
the endpoint and therefore it is not being delivered it to the management UI. This is due to the [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) policy.
Contact the administrator of the Identity Provider to add the management UI's URL to the list of allowed **origins**.

```
Access to fetch at 'https://<the_issuer_url>>/.well-known/openid-configuration' from origin
'<rabbitmq_url_to_management_ui>' has been blocked by CORS policy`.
```

### OpenId Discovery endpoint not compliant {#openid-discovery-endpoint-not-compliant-error}

#### Steps to reproduce the issue

Open the root url of the management UI in the browser.
Rather than getting the button "Click here to login" you see the following error message:

```
OAuth resource [rabbitmq] not available. OpenId Discovery endpoint https://<the_issuer_url>/.well-known/openid-configuration not compliant
```

#### Troubleshoot the issue

This issue is caused when the endpoint is not returning a JSON payload which matches with the [OpenId Connect Discovery Configuration](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig).
These are the possible causes:
- The payload returned by the endpoint is not compliant because it is empty or it is missing some critical information. To identify the root cause, open the browser's javascript console and search for one of these possible error messages:
  - `Payload does not contain openid configuration` This error occurs when the payload is empty or it is not a JSON payload.
  - `Missing authorization_endpoint` This error occurs when the JSON attribute `authorization_endpoint` is missing.
  - `Missing token_endpoint` This error occurs when the JSON attribute `token_endpoint` is missing.
  - `Missing jwks_uri` This error occurs when the JSON attribute `jwks_uri` is missing.
- The url is wrong. Check out with your administrator of your Identity Provider to get the correct url to the OpenId Connect Discovery endpoint.

### Not authorized {#not-authorized-error}

#### Steps to reproduce the issue

Open the root url of the management UI in the browser, click on the button "Click here to logon" and enter the credentials requested by your Identity Provider. You are redirected back to the management UI with the following error:

```
Not authorized
```

#### Troubleshoot the issue

This issue occurs when the token does not have enough scopes or permissions to access the management UI. You need at least one of these scopes or the equivalent scope:
- `rabbitmq.tag:administrator`.
- `rabbitmq.tag:management`.
- `rabbitmq.tag:monitoring`.
- `rabbitmq.tag:policymaker`.

Follow these steps to find out which scopes or permissions are carried in the token:
1. Open your browwser's developer tool (e.g. in Chrome or Firefox, right-click on the page and click on *Inspect* menu option).
2. Go to the tab *Application*.
3. Select the option *Storage* > *Local Storage* in the left panel.
4. Click on the tree option which matches the URL of the management UI.
5. Select the Key *rabbitmq.credentials* in the right panel.
6. Copy its value.
7. Go to the url https://jwt.io.
8. Paste the value into the text field *Encoded*.
9. Look at the payload's text field *Decoded*.
10. Search for the token attribute `scope` in the tokens' payload or for the value configured in `auth_oauth2.additional_scopes_key`, if any.
11. When you find the appropriate token's scope attribute, find within the attribute's value any of the scopes previously listed. Please, take into account if you have configured [auth_oauth2.scope_prefix](./oauth2#scope-prefix). If you did, the scopes will be named like  `myprefix_tag:administrator`. If you instead configured [scope aliases](./oauth2-examples#use-scope-aliases), you need to find the scope alias that maps to one of the scopes previously listed.


### OpenId Discovery endpoint unreachable due to bad certificate {#openid-discovery-endpoint-bad-certificate}

This issue is not necessarily specific to the management UI, it may also occur when an application is authenticating via one of the messaging protocols. It occurs when RabbitMQ has to download the OpenId Connect configuration via the url configured in `auth_oauth2.issuer` and the certificate used by the issuer uses a wildcard certificate. This means that the certificate's CN attribute does not match exactly the issuer's domain name. This is very common on SaaS deployments.

#### Steps to reproduce the issue

1. Open the root URL of the management UI in the browser.
2. Click on "Click here to login".
3. Enter your credentials.
4. You are redirected back to RabbitMQ but with an error "No Authorized".

#### Troubleshoot the issue

1. Access RabbitMQ logs.
2. Look for `{bad_cert,hostname_check_failed}`.
3. If you find an entry it means that RabbitMQ tried to contact the url found in `auth_oauth2.issuer` and the issuer presented a wildcard certificate.
4. To fix this issue, add the following line to your RabbitMQ configuration `auth_oauth2.https.hostname_verification = wildcard`, or `auth_oauth2.oauth_providers.<my_oauth_provider_name>.https.hostname_verification = wildcard` if you are using multiple OAuth providers.
