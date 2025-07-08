---
title: Use Microsoft Entra ID (previously known as Azure AD) as OAuth 2.0 server
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

# Use Microsoft Entra ID (formerly known as Microsoft Azure AD) as OAuth 2.0 server

This guide explains how to set up OAuth 2.0 for RabbitMQ
and Microsoft Entra ID as Authorization Server using the following flows:

 * Access the management UI via a browser using Entra ID (API version 2.0)

## Prerequisites to follow this guide

* Have an [Azure account](https://portal.azure.com.)
* Docker
* OpenSSL
* A local clone of a [GitHub repository](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next) (the `next` branch) that contains all the configuration files and scripts used on this example.

## Register your app

When using **Entra ID as OAuth 2.0 server**, your client app (in our case RabbitMQ) needs a way to trust the security tokens issued to it by the **Microsoft identity platform**.

1. The first step in establishing that trust is by **registering your app** with the identity platform in Entra ID.
   :::tip

   Learn more about [app registration in Entra ID](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

   :::
2. Once you have logged onto your account in [Entra ID Portal](https://portal.azure.com), go to **Entra ID ** (use the search bar if you are not able to easily find it).
3. In the left-hand navigation menu, click on **App Registrations**. Then, select **New registration**.
4. In the **Register an application** pane, provide the following information:

    * **Name**: the name you would like to give to your application (ex: *rabbitmq-oauth2*)
    * **Supported Account Types**: select **Accounts in this organizational directory only (Default Directory only - Single tenant)** (this guide will focus on this option for simplicity)
    * On the **Select a platform** drop-down list, select **Single-page application (SPA)**
    * Configure the **Redirect URI** to: `https://localhost:15671/js/oidc-oauth/login-callback.html`

    :::important

    Entra ID only allows `https` URIs as **Redirect URI**. To learn how to [enable HTTPS for RabbitMQ management UI](./management#single-listener-https)
    on port `15671`, see the management UI guide.

    :::

5. Click on **Register**.

   ![Entra ID OAuth 2.0 App](./entra-id-oauth-registered-app.png)

   Note the following values, as you will need it later to configure the `rabbitmq_auth_backend_oauth2` on RabbitMQ side:

   * Directory (tenant ID)
   * Application (client) ID


## Create OAuth 2.0 roles for your app

App roles are defined by using the [Entra ID portal](https://portal.azure.com) during the app registration process. When a user signs in to your application, Entra ID emits a `roles` claim for each role that the user or service principal has been granted (you will have a look at it at the end of this tutorial).

:::info

To learn more about roles in Entra ID, see [Entra ID documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-add-app-roles-in-azure-ad-apps)

:::

1. Still in [Entra ID Portal](https://portal.azure.com), go back to **Entra ID** home page.

2. In the left-hand menu, click on **App Registrations** and then click on your **application name** to open your application **Overview** pane.

### Create a role to allow access to Management UI

1. In the left-hand menu, click on **App Roles**.

2. Then, click on **Create App Role** to create an OAuth 2.0 role that will be used to give access to the RabbitMQ Management UI.


3. On the right menu that has just opened, provide the requested information:

    * **Display Name**: the name you want to give to the role (ex: *Management UI Admin*)
    * **Allowed member types**: Both (Users/Groups + Applications)
    * **Value**: `{Application_ID}.tag:administrator` (where *Application_ID* is the value of the *Application (client) ID* noted earlier in this tutorial)
    * **Description**: briefly describe what this role aims to (here just to give admin access to the RabbitMQ Management UI)
    * **Do you want to enable this app role**: `yes` (check the box)

4. Click on **Apply**.

### Create a role to grant configure permission on all resources

1. Click on **Create App Role** again. You are now going to create an OAuth 2.0 role that will be used to give configure access to all the resources on all the RabbitMQ vhosts.

2. On the right menu that has just opened, fill the form as below:

    * **Display Name**: the name you want to give to the role (ex: *Configure All Vhosts*)
    * **Allowed member types**: Both (Users/Groups + Applications)
    * **Value**: `{Application_ID}.configure:*/*` (where *Application_ID* is the value of the *Application (client) ID* noted earlier in this tutorial)
    * **Description**: briefly describe what this role aims to (here to give permissions to configure all resources on all the vhosts available on the RabbitMQ instance)
    * **Do you want to enable this app role**: `yes` (check the box)

3. Click on **Apply**.


## Assign App Roles to Users

Now that some roles have been created for your application, you still need to assign these to some users.

1. Still in [Entra ID Portal](https://portal.azure.com), go back to **Entra ID** home page and, in the left-hand menu, click on **Enterprise Applications**.

2. In the new left-hand menu, select **Manage -> All applications**. Use the **Search Bar** and/or the available filters to find your application.

    ![Entra ID Enterprise Applications](./entra-id-enterprise-application.png)

3. Click on the application you just created, for which you want to assign roles to users/groups, then, in the left-hand navigation menu, Select **Manage -> Users and groups**.

4. Click on **Add user/group** to open the **Add Assignment** pane.

5. Below **Users**, click on *None Selected* and, on the **Users** pane that has just opened on the right, search and select the users/groups you want to assign roles to.

6. Once you've selected users and groups, click on the **Select** button.

7. Back to the **Add assignment** pane, below **Select a Role**, click on *None Selected* and, on the **Select a role** pane that has just opened on the right, search and select the role you want to assign to the selected users.

    :::tip

    If only one role is available for your application, it would be automatically selected and greyed by default.

    :::

8. Choose a role (only a single role can be selected at a time), click on the **Select** button, and click on the **Assign** button to finalize the assignment of users and groups to the app.

9. Repeat the operations for all the roles you want to assign.


## Create a Scope for Management UI Access

There is one last configuration step required. Without this step, the `access_token` returned
by **Entra ID** is invalid. RabbitMQ cannot validate its signature because the `access_token` is meant for Microsoft resources.
First, you need to create a scope associated to the application you registered for RabbitMQ management UI as follows:

1. Go to **App registrations**.
2. Click on your application.
3. Go to **Manage** option on the left menu and choose the option **Expose an API**.
4. Click on **Add a scope**.
5. Enter a name, eg. `management-ui`. Enter the same name for **Admin consent display name** and a description and save it.
7. The scope is named `api://{Application (client) ID}/{scope_name}`.

Check out the last section to see how this scope is used to configure RabbitMQ.

## Configure Custom Signing Keys

Creating a signing key for the application is optional. If a custom key is created, RabbitMQ must be configured accordingly.
In the following example, replace `{Application(client) ID}` with the actual *Application(client) ID*.

```ini
auth_oauth2.discovery_endpoint_params.appid = {Application(client) ID}
```

It is optional to create a signing key for your application. If you create one though, you must add the following RabbitMQ configuration. You need to replace `{Application(client) ID}` with your *Application(client) ID*. Without this configuration, the standard jwks_uri endpoint will not include the custom signing key and RabbitMQ will not find the signing key to validate the token's signature.

```ini
auth_oauth2.discovery_endpoint_params.appid = {Application(client) ID}
```

For more information, check out Microsoft Entra documentation about [configuring custom signing keys](https://learn.microsoft.com/en-us/entra/identity-platform/jwt-claims-customization#validate-token-signing-key).

## Configure RabbitMQ to Use Entra ID as OAuth 2.0 Authentication Backend

The configuration on **Entra ID** side is done. Next, configure RabbitMQ to use these resources.

Clone [rabbitmq.conf.tmpl](https://github.com/rabbitmq/rabbitmq-oauth2-tutorial/tree/next/conf/entra/rabbitmq.conf.tmpl) from the tutorial repository
to `rabbitmq.conf`. It must be in the same directory as `rabbitmq.conf.tmpl`.

Edit the new `rabbitmq.conf` file and proceed as follows:

1. Replace `{Directory (tenant) ID}` with the value gathered earlier as **Application (client) ID**
2. Replace `{Application(client) ID}` with the value gathered as **Application (client) ID**
3. If you decide to configure your application with custom signing(s), you need to uncomment the following configuration line. This is required otherwise the `jwks_uri` endpoint announced by the OpenID Discovery endpoint does not contain applications' custom signing keys.

```ini
#...

management.oauth_enabled = true
management.oauth_client_id = {Application(client) ID}
management.oauth_scopes = openid profile api://{Application(client) ID}/rabbitmq

auth_oauth2.resource_server_id = {Application(client) ID}
auth_oauth2.additional_scopes_key = roles
auth_oauth2.issuer = https://login.microsoftonline.com/{Directory (tenant) ID}/v2.0

#...
```


## Start RabbitMQ

Run the following commands to run RabbitMQ docker image:

```bash
export MODE=entra
make start-rabbitmq
```

This starts a Docker container named `rabbitmq`, with RabbitMQ Management UI/API with HTTPS enabled, and configured to use your Entra ID as OAuth 2.0 authentication backend,
based on the information you provided in `rabbitmq.conf` in the previous steps of this tutorial.

## Automatic generation of a TLS Certificate and Key Pair

:::important

Entra ID only allows `https` URIs as **Redirect URI**. To learn how to [enable HTTPS for RabbitMQ management UI](./management#single-listener-https)
on port `15671`, see the management UI guide.

:::

When you run `make start-rabbitmq` for the first time with `MODE=entra`, before RabbitMQ is deployed, a TLS certificate is generated for RabbitMQ so that it listens on HTTPS port 15671.

The script generates the following files in `conf/entra/certs`:
* **cacert.pem**: a custom certificate authority that is used to generate and sign a self signed certificate for RabbitMQ
* **cert.pem**: a self-signed certificate (cn=localhost)
* **key.pem**: the private key associated to the `cert.pem` certificate

These files will be mounted into the `rabbitmq` container later in this tutorial,
where they will be used to configure HTTPS for the RabbitMQ Management UI and HTTP API.

## Verify RabbitMQ Management UI access

Go to RabbitMQ Management UI `https://localhost:15671`. Depending on your browser, ignore the security warnings (raised by the fact that you are using a self-signed certificate) to proceed.

Once on the RabbitMQ Management UI page, click on the **Click here to log in** button,
authenticate with your **Entra ID user**. The first time, you are likely going to have to give your
consent (it depends on the policies applied to Entra AD on your side).

:::tip
At first login, you may run into an error name `AADSTS90008`. This is a [known issue](https://docs.microsoft.com/en-us/ansrs/questions/671457/after-34accept34-on-consent-prompt-on-azure-sso-lo.html#answer-893848).

Click on **Click here to log in** button again and it will disappear.
:::

At the end, you should be redirected back to the RabbitMQ Management UI.

Entra AD issues an access token like this one below. The permissions are managed in the `roles` claim.
You have configured RabbitMQ with `{extra_scopes_source, <<"roles">>},` which means RabbitMQ uses
the scopes in the `roles` claim to define permissions for a logged-in user.

```javascript
{
  "aud": "30b61ef8-72d7-4e40-88f2-6e16c8d3fd88",
  "iss": "https://sts.windows.net/1ffc6121-590e-4aa5-bf47-c348674069cb/",
  "iat": 1655740039,
  "nbf": 1655740039,
  "exp": 1655744211,
  "acr": "1",
  "aio": "AUQAu/8TAAAAjvwucwL4nZe83vNZvg6A7sAPscI9zsGvRs8EuT7aVhubpmhRnxJ+X7nbkISoP5eBBMxoi2yiCclnH2Ocjjzsqw==",
  "amr": [
    "wia"
  ],
  "appid": "30b61ef8-72d7-4e40-88f2-6e16c8d3fd88",
  "appidacr": "1",
  "email": "baptiste.daroit@company.com",
  "idp": "https://sts.windows.net/b3f4f7c2-72ce-4192-aba4-d6c7719b5766/",
  "in_corp": "true",
  "ipaddr": "xxx.xxx.xxx.xxx",
  "name": "Baptiste DA ROIT",
  "oid": "cf2df3b4-03df-4e1e-b5c0-f232932aaead",
  "rh": "0.AR8AgCG80x7L90C1mhVBBXQzQjgoklctsdBMtgYVWFwc4tgfAMQ.",
  "roles": [
    "30b61ef8-72d7-4e40-88f2-6e16c8d3fd88.tag:monitoring",
    "30b61ef8-72d7-4e40-88f2-6e16c8d3fd88.configure:*/*"
  ],
  "scp": "User.Read",
  "sub": "6aBzW3a1FOTTrnlZEuC1SmwG0sRjVgQU49DvrYK6Rqg",
  "tid": "1ffc6121-590e-4aa5-bf47-c348674069cb",
  "unique_name": "baptiste.daroit@company.com",
  "uti": "QHqwThTqQEK9iMdnRuD_AA",
  "ver": "1.0"
}
```
