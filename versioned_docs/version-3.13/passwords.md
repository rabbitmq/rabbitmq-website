---
title: Credentials and Passwords
displayed_sidebar: docsSidebar
---
<!--
Copyright (c) 2005-2025 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Credentials and Passwords

## Overview {#overview}

This guide covers a variety of topics related to credentials
and passwords used by the internal authentication backend. If
a different authentication backend is used, most
material in this guide will not be applicable.

RabbitMQ supports multiple [authentication mechanisms](./access-control#mechanisms). Some of them use
username/password pairs. These credential pairs are then handed over to [authentication backends](./access-control#backends)
that perform authentication. One of the backends, known as internal or built-in, uses internal RabbitMQ data store
to store user credentials. When a new user is added using `rabbitmqctl`, the user's password is combined with a salt value
and hashed.

RabbitMQ can be configured to use different password hashing functions:

 * SHA-256
 * SHA-512

SHA-256 is used by default. More algorithms can be provided by plugins.

## Configuring Algorithm to Use {#changing-algorithm}

It is possible to change what algorithm is used via [RabbitMQ configuration file](./configure#config-file),
for example, to use SHA-512:

```
password_hashing_module = rabbit_password_hashing_sha512
```

Out of the box, the following hashing modules are provided:

 * `rabbit_password_hashing_sha256` (default)
 * `rabbit_password_hashing_sha512`
 * `rabbit_password_hashing_md5` (for backwards compatibility)

Updated hashing algorithm will be applied to newly created users
or when password is changed using [rabbitmqctl](./man/rabbitmqctl.8).


## Upgrading from pre-3.6.0 Versions {#upgrading-to-3-6-x}

When upgrading from a pre-3.6 version to RabbitMQ 3.6.1 or later,
all existing users are marked as using the legacy password hashing function,
therefore they will be able to authenticate. No upgrade steps are required.

When importing definitions exported from versions earlier than
3.6.0 into a 3.6.1 or later release, existing user records will use
MD5 for password hashing. In order to migrate them to a more secure algorithm,
use [rabbitmqctl](./man/rabbitmqctl.8) or [definition import](./definitions)
with an updated hash to update their passwords.


## Credential Validation {#credential-validation}

RabbitMQ supports credential validators. The validator only has an effect on the internal
authentication backend and kicks in when a new user is added or password
of an existing user is changed.

Validators are modules that implement a validation
function. To use a validator, it is necessary to specify it
and its additional settings in the [config file](./configure).

There are three credential validators available out of the box:

 * `rabbit_credential_validator_accept_everything`: unconditionally accepts all values. This validator is used by default for backwards compatibility.
 * `rabbit_credential_validator_min_password_length`: validates password length
 * `rabbit_credential_validator_password_regexp`: validates that password matches a regular expression (with some limitations, see below)

The following example demonstrates how `rabbit_credential_validator_min_password_length` is used:

```ini
credential_validator.validation_backend = rabbit_credential_validator_min_password_length
credential_validator.min_length = 30
```

The following example demonstrates how `rabbit_credential_validator_password_regexp` is used:

```ini
credential_validator.validation_backend = rabbit_credential_validator_password_regexp
credential_validator.regexp = ^[a-bA-Z0-9$]{20,100}
```

### Credential Validator Limitations {#credential-validation-limitations}

Credential validators have limitations that have to do both with the config file grammar and shell interpretation of
certain characters when credentials are specified on the command line.

[New style configuration format](./configure) uses `#` as the comment character.
This means that validation rules cannot
use `#` in regular expression values. Leading and trailing spaces in values will also
be stripped by the config file parser.

Also note that when passwords are used with CLI tools commands that [manage users](./access-control#user-management),
shell escaping of certain characters [must be taken into account](./access-control#passwords-and-shell-escaping).


### Custom Credential Validators {#custom-credential-validation}

Every credential validator is a module that implements a single function
behaviour, [rabbit_credential_validator](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbit/src/rabbit_credential_validator.erl).
Plugins therefore can provide more implementations.

Credential validators can also validate usernames or apply any other logic
(e.g. make sure that provided username and password are not identical).


## Passwordless Users {#passwordless-users}

[Internal authentication backend](./access-control) allows for users without a password
or with a blank one (assuming credential validator also allows it). Such users are only meant to be used
with passwordless [authentication mechanisms](./authentication) such as [authentication using x509 certificates](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_mechanism_ssl).

In order to create a passwordless user, create one with any password that passes validation and clear
the password using [rabbitmqctl](./cli)'s `clear_password` command:

```bash
rabbitmqctl add_user passwordless-user "pa$$wordless"
rabbitmqctl clear_password passwordless-user
# don't forget to grant the user virtual host access permissions using set_permissions
# ...
```

Starting with versions `3.6.15` and `3.7.3`, authentication attempts that use a blank password
will be unconditionally rejected by the [internal authentication backend](./access-control) with a distinctive error
message in the [server log](./logging). Connections that authenticate using x509 certificates or use an external service
for authentication (e.g. [LDAP](./ldap)) can use blank passwords.


## Authentication Using TLS (x509) Certificates {#x509-certificate-authentication}

It is possible to [authenticate connections using x509 certificates](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_mechanism_ssl) and avoid
using passwords entirely. The authentication process then will rely on TLS [peer certificate chain validation](https://tools.ietf.org/html/rfc5280#section-6).

To do so:

 * Create a passwordless user (see above)
 * Enable the [rabbitmq-auth-mechanism-ssl](https://github.com/rabbitmq/rabbitmq-server/tree/main/deps/rabbitmq_auth_mechanism_ssl) plugin
 * Follow the plugin's configuration instructions
 * Configure client connections to use TLS and the `EXTERNAL` authentication mechanism
 * Configure client connections to provide a certificate/key pair and a CA certificate (or chain of certificates).
   The chain of certificates will be verified by the server and thus at least one certificate in it must be trusted by the target node.


## Computing Password Hashes {#computing-password-hash}

Sometimes it is necessary to compute a user's password hash for updating via the [HTTP API](./management)
or to generate a [definitions file](./definitions) to import.

### Hash via `rabbitmqctl`

```bash
rabbitmqctl hash_password foobarbaz

# Output:
# Will hash password foobarbaz
# 27cx5+wEi8R8uwTeTr3hk5azuV3yYxxAtwPPhCyrbdsxVhqq
```

### Hash via HTTP API

```bash
curl -4su guest:guest -X GET localhost:15672/api/auth/hash_password/foobarbaz

# Output:
# {"ok":"TBybOvomyVw6BqBU/fHCEpVhDO7fLdQ4kxZDUpt6hagCxV8I"}
```

### This is the algorithm:

 * Generate a random 32 bit salt. In this example, we will use `908D C60A`. When RabbitMQ creates or updates a user, a random salt is generated.
 * Prepend the generated salt with the UTF-8 representation of the desired password.
   If the password is `test12`, at this step, the intermediate result would be `908D C60A 7465 7374 3132`
 * Take the hash (this example assumes the default [hashing function](#changing-algorithm), SHA-256): `A5B9 24B3 096B 8897 D65A 3B5F 80FA 5DB62 A94 B831 22CD F4F8 FEAD 10D5 15D8 F391`
 * Prepend the salt again: `908D C60A A5B9 24B3 096B 8897 D65A 3B5F 80FA 5DB62 A94 B831 22CD F4F8 FEAD 10D5 15D8 F391`
 * Convert the value to base64 encoding: `kI3GCqW5JLMJa4iX1lo7X4D6XbYqlLgxIs30+P6tENUV2POR`
 * Use the finaly base64-encoded value as the `password_hash` value in HTTP API requests and generated definition files
