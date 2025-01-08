---
title: Package Signatures
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

# Package Signatures

## Overview {#overview}

This guide covers RabbitMQ release packages signing and how to verify the signatures on
downloaded release artifacts.

Release signing allows users to verify that the artifacts they have downloaded
were published by a trusted party (such as a team or package distribution
service). This can be done using GPG command line tools. Package management tools such as `apt` and `yum`
also verify repository signatures.

## Signing Keys {#signing-keys}

RabbitMQ release artifacts, both binary and source,
are signed using [GnuPG](http://www.gnupg.org/) and [our release signing key](https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc).

In addition, Debian and RPM package repository content is signed by their
upstream repository's key. Currently this means Cloudsmith repository keys.

## Importing Signing Keys {#importing-gpg-keys}

### With GPG {#importing-gpg}

Before signatures can be verified, RabbitMQ [signing key](https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc)
must be downloaded. The key can be obtained directly or using [keys.openpgp.org](https://keys.openpgp.org/).
The direct download method is recommended because most key servers are prone to overload, abuse and attacks.

#### Direct Download

The key is distributed via [GitHub](https://github.com/rabbitmq/signing-keys/releases/) and
[rabbitmq.com](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc):

```bash
curl -L https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc --output rabbitmq-release-signing-key.asc
gpg --import rabbitmq-release-signing-key.asc
```

#### Using a Key Server

The key can be imported from [keys.openpgp.org](https://keys.openpgp.org/):

```bash
gpg --keyserver "hkps://keys.openpgp.org" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA"
```

Alternative keyservers:

```bash
gpg --keyserver "keyserver.ubuntu.com" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA"
```

```bash
gpg --keyserver "pgp.surfnet.nl" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA"
```

```bash
gpg --keyserver "pgp.mit.edu" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA"
```

### With apt {#importing-apt}

On Debian and Ubuntu systems, assuming that [apt repositories](./install-debian) are used for installation,
trusted repository signing keys must be added to the system before any packages can be installed.

This can be done using key servers or (for the RabbitMQ main signing key) a direct download.

#### Direct Download

Main RabbitMQ signing key is distributed via [GitHub](https://github.com/rabbitmq/signing-keys/releases/) and
[rabbitmq.com](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc):

```bash
curl -1sLf https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc | sudo gpg --dearmor > /usr/share/keyrings/com.rabbitmq.team.gpg
```

#### Using a Key Server

The same main RabbitMQ signing key can be imported from [keys.openpgp.org](https://keys.openpgp.org/):

```bash
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor > /usr/share/keyrings/com.rabbitmq.team.gpg
```

When using the [Team RabbitMQ modern Erlang PPA](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang),
one more key needs to be added:

```bash
## Team RabbitMQ's main signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor > /usr/share/keyrings/com.rabbitmq.team.gpg
```

### With RPM {#importing-rpm}

On RPM-based systems (RHEL, Fedora, CentOS), assuming that [yum repositories](./install-rpm) are used for installation,
`rpm --import` should be used to import the key.

#### Direct Download

The key is distributed via [GitHub](https://github.com/rabbitmq/signing-keys/releases/) and
[rabbitmq.com](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc):

```bash
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
```

## Verifying Signatures {#checking-signatures}

To check signatures for the packages, download the RabbitMQ signing key
and a signature file. Signature files use the `.asc` extension that follows their artifact filename,
e.g. the signature file of `rabbitmq-server-generic-unix-3.9.3.tar.xz` would be `rabbitmq-server-generic-unix-4.0.4.tar.xz.asc`.

Then use `gpg --verify`:

```bash
gpg --verify [filename].asc [filename]
```

Here's an example session, after having retrieved a RabbitMQ
source archive and its associated detached signature from
the download area:

```bash
gpg --verify rabbitmq-server_4.0.4-1_all.deb.asc rabbitmq-server_4.0.4-1_all.deb
# => gpg: Signature made Mon Aug 26 00:22:55 2024 EDT
# => gpg:                using RSA key 0A9AF2115F4687BD29803A206B73A36E6026DFCA
# => gpg: Good signature from "RabbitMQ Release Signing Key <info@rabbitmq.com>" [unknown]
# (elided)
# => Primary key fingerprint: 0A9A F211 5F46 87BD 2980  3A20 6B73 A36E 6026 DFCA
```

If the signature is invalid, a "BAD signature"
message will be emitted. If that's the case the origin of the package,
the signature file and the signing key should be carefully verified.
Packages that fail signature verification must not be used.

If the signature is valid, you should expect a "Good
signature" message; if you've not signed our key, you will
see a "Good signature" message along with a warning about
our key being untrusted.

If you trust the RabbitMQ signing key you avoid the warning output by
GnuPG by signing it using your own key (to create your private key run `gpg --gen-key`):

```bash
gpg --sign-key 0x0A9AF2115F4687BD29803A206B73A36E6026DFCA
```


## Cloudsmith {#cloudsmith}

[Cloudsmith.io](https://cloudsmith.io/~rabbitmq/repos/) is a hosted package distribution
service that uses their own signing keys to sign the artifacts uploaded to it. The key(s) then
must be added to the system.

Cloudsmith provides repository setup script that include signing key import. However,
note that the script **does not** currently follow Debian best practices in terms of GPG key handling.

To import the key:

```bash
# import the Cloudsmith key
curl -1sLf https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key -o cloudsmith-rabbitmq-key.asc
gpg --import cloudsmith-rabbitmq-key.asc
```

After importing the key please follow the installation instructions in the [Debian](./install-debian) or [RPM-based Linux](./install-rpm) guides.
