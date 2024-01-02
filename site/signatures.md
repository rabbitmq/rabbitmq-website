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

# Signatures

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers RabbitMQ release packages signing and how to verify the signatures on
downloaded release artifacts.

Release signing allows users to verify that the artifacts they have downloaded
were published by a trusted party (such as a team or package distribution
service). This can be done using GPG command line tools. Package management tools such as `apt` and `yum`
also verify repository signatures.

## <a id="signing-keys" class="anchor" href="#signing-keys">Signing Keys</a>

RabbitMQ release artifacts, both binary and source,
are signed using [GnuPG](http://www.gnupg.org/) and [our release signing key](https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc).

Services that distribute packages can do signing on behalf of the publisher. [Package Cloud](#package-cloud) is one such
service used by RabbitMQ. Users who provision packages from Package Cloud must import the Package Cloud-provided signing keys
instead of those used by the RabbitMQ team.


## <a id="importing-gpg-keys" class="anchor" href="#importing-gpg-keys">Importing Signing Keys</a>

### <a id="importing-gpg" class="anchor" href="#importing-gpg">With GPG</a>

Before signatures can be verified, RabbitMQ [signing key](https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc)
must be downloaded. The key can be obtained directly or using [keys.openpgp.org](https://keys.openpgp.org/).
The direct download method is recommended because most key servers are prone to overload, abuse and attacks.

#### Direct Download

The key is distributed via [GitHub](https://github.com/rabbitmq/signing-keys/releases/) and
[rabbitmq.com](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc):

<pre class="lang-bash">
curl -L https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc --output rabbitmq-release-signing-key.asc
gpg --import rabbitmq-release-signing-key.asc
</pre>

#### Using a Key Server

The key can be imported from [keys.openpgp.org](https://keys.openpgp.org/):

<pre class="lang-bash">
gpg --keyserver "hkps://keys.openpgp.org" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA"
</pre>

Alternative keyservers:

<pre class="lang-bash">
gpg --keyserver "keyserver.ubuntu.com" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA"
</pre>

<pre class="lang-bash">
gpg --keyserver "pgp.surfnet.nl" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA"
</pre>

<pre class="lang-bash">
gpg --keyserver "pgp.mit.edu" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA"
</pre>

### <a id="importing-apt" class="anchor" href="#importing-apt">With apt</a>

On Debian and Ubuntu systems, assuming that [apt repositories](./install-debian.html) are used for installation,
trusted repository signing keys must be added to the system before any packages can be installed.

This can be done using key servers or (for the RabbitMQ main signing key) a direct download.

#### Direct Download

Main RabbitMQ signing key is distributed via [GitHub](https://github.com/rabbitmq/signing-keys/releases/) and
[rabbitmq.com](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc):

<pre class="lang-bash">
curl -1sLf https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc | sudo gpg --dearmor &gt; /usr/share/keyrings/com.rabbitmq.team.gpg
</pre>

#### Using a Key Server

The same main RabbitMQ signing key can be imported from [keys.openpgp.org](https://keys.openpgp.org/):

<pre class="lang-bash">
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor &gt; /usr/share/keyrings/com.rabbitmq.team.gpg
</pre>

When using the [Team RabbitMQ modern Erlang PPA](https://launchpad.net/~rabbitmq/+archive/ubuntu/rabbitmq-erlang)
and [PackageCloud apt repository](https://packagecloud.io/rabbitmq/rabbitmq-server), two more keys need
to be added:

<pre class="lang-bash">
## Team RabbitMQ's main signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor &gt; /usr/share/keyrings/com.rabbitmq.team.gpg
## Launchpad PPA that provides modern Erlang releases
curl -1sLf "https://keyserver.ubuntu.com/pks/lookup?op=get&amp;search=0xf77f1eda57ebb1cc" | sudo gpg --dearmor &gt; /usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg
## PackageCloud RabbitMQ repository
curl -1sLf "https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey" | sudo gpg --dearmor &gt; /usr/share/keyrings/io.packagecloud.rabbitmq.gpg
</pre>

### <a id="importing-rpm" class="anchor" href="#importing-rpm">With RPM</a>

On RPM-based systems (RHEL, Fedora, CentOS), assuming that [yum repositories](./install-rpm.html) are used for installation,
`rpm --import` should be used to import the key.

#### Direct Download

The key is distributed via [GitHub](https://github.com/rabbitmq/signing-keys/releases/) and
[rabbitmq.com](https://www.rabbitmq.com/rabbitmq-release-signing-key.asc):

<pre class="lang-bash">
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/3.0/rabbitmq-release-signing-key.asc
</pre>

## <a id="checking-signatures" class="anchor" href="#checking-signatures">Verifying Signatures</a>

To check signatures for the packages, download the RabbitMQ signing key
and a signature file. Signature files use the `.asc` extension that follows their artifact filename,
e.g. the signature file of `rabbitmq-server-generic-unix-3.9.3.tar.xz` would be `rabbitmq-server-generic-unix-3.9.3.tar.xz.asc`.

Then use `gpg --verify`:

<pre class="lang-bash">gpg --verify [filename].asc [filename]</pre>

Here's an example session, after having retrieved a RabbitMQ
source archive and its associated detached signature from
the download area:

<pre class="lang-bash">
gpg --verify rabbitmq-server_3.9.3-1_all.deb.asc rabbitmq-server_3.9.3-1_all.deb
gpg: Signature made Wed Aug 11 16:20:14 2021 MSK
gpg:                using RSA key 0A9AF2115F4687BD29803A206B73A36E6026DFCA
gpg: using subkey 0xEDF4AE3B59B046FA instead of primary key 0x6B73A36E6026DFCA
gpg: using PGP trust model
gpg: Good signature from "RabbitMQ Signing Key &lt;info@rabbitmq.com&gt;" [full]
Primary key fingerprint: 4E30 C634 2FB4 AF5C 6334  2330 79A1 D640 D80A 61F0
     Subkey fingerprint: 5EC4 26E8 A6F3 523D D924  8FC8 EDF4 AE3B 59B0 46FA
gpg: binary signature, digest algorithm SHA512
</pre>

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

<pre class="lang-bash">
gpg --sign-key 0x0A9AF2115F4687BD29803A206B73A36E6026DFCA
</pre>


## <a id="cloudsmith" class="anchor" href="#cloudsmith">Cloudsmith</a>

[Cloudsmith.io](https://cloudsmith.io/~rabbitmq/repos/) is a hosted package distribution
service that uses their own signing keys to sign the artifacts uploaded to it. The key(s) then
must be added to the system.

Cloudsmith provides repository setup script that include signing key import. However,
note that the script **does not** currently follow Debian best practices in terms of GPG key handling.

To import the key:

<pre class="lang-bash">
# import the Cloudsmith key
curl -1sLf https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key -o cloudsmith-rabbitmq-key.asc
gpg --import cloudsmith-rabbitmq-key.asc
</pre>

After importing the key please follow the installation instructions in the [Debian](install-debian.html) or [RPM-based Linux](install-rpm.html) guides.



## <a id="package-cloud" class="anchor" href="#package-cloud">Package Cloud</a>

[Package Cloud](https://packagecloud.io/rabbitmq) is a hosted package distribution
service that uses their own signing keys to sign the artifacts uploaded to it. The key(s) then
must be added to the system.

Package Cloud provides repository setup script that include signing key import. However,
note that the script **does not** currently follow Debian best practices in terms of GPG key handling.

To import the key:

<pre class="lang-bash">
# import the PackageCloud key
curl -1sLf https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey -o packagecloud-rabbitmq-key.asc
gpg --import packagecloud-rabbitmq-key.asc
</pre>

After importing the key please follow the installation instructions in the [Debian](install-debian.html) or [RPM-based Linux](install-rpm.html) guides.
