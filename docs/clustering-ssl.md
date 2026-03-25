---
title: Securing Cluster (Inter-node) and CLI Tool Communication with TLS
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

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

# Securing Cluster (Inter-node) and CLI Tool Communication with TLS

## Overview

RabbitMQ nodes accept [connections from clients](./connections) as well as [peer cluster nodes](./clustering)
and [CLI tools](./cli).

The main [TLS](./ssl) and [Troubleshooting TLS](./troubleshooting-ssl) guides explain
how to secure client connections with TLS. It may be desired to add a layer of encryption and an extra
layer of authentication to the other two kinds of connections. This guide explains how to do that.

Switching inter-node and CLI tool communication requires configuring a few [runtime](./runtime) flags.
They provide the node with a [CA certificate bundle and a certificate/key pair](./ssl#certificates-and-keys).
CLI tools also have to be configured to use a certificate/key pair as TLS-enabled nodes
won't accept unencrypted connections from CLI tools and peers.

This guide assumes the reader is familiar with the [basics of TLS](./ssl#certificates-and-keys)
and [peer verification](./ssl#peer-verification) (authentication) covered in the main TLS guide.

It also assumes that you already have a CA certificate bundle and a certificate/key pair generated for every
cluster node and every host CLI tools will be use on. In production environments those certificates
will often be produced by operators or deployment tools. For development and experimentation,
there is a [quick way to generate them](./ssl#automated-certificate-generation) using OpenSSL
and Python.

This guide will reference three files:

 * `ca_certificate.pem`: a certificate authority bundle
 * `server_certificate.pem`: a certificate (public key) that will be used by the configured node (and/or CLI tools)
 * `server_key.pem`: a private key that will be used by the configured node (and/or CLI tools)

Make sure you have them ready before we start.


## The Basics {#basics}

Configuring a node to communicate over TLS-enabled connections involves a few
steps. With [supported Erlang versions](./which-erlang) there are two ways of doing it.

The steps are very similar on all operating systems supported. The examples below
use tabs to show both bash (Linux, macOS) and PowerShell/batch (Windows) variants.

[Strategy one](#linux-strategy-one) involves the following steps:

 * Tell the node to use encrypted inter-node connections using a runtime flag, `-proto_dist inet_tls`
 * Combine public and private keys to be used by the node into a single file
 * Tell the node where to find its certificate and private key using another runtime flag, `-ssl_dist_opt server_certfile`
 * Tell the node about any additional TLS settings desired, using other `-ssl_dist_opt` options, for example: `-ssl_dist_opt server_secure_renegotiate true client_secure_renegotiate true` to enable [secure renegotiation](https://devcentral.f5.com/s/articles/ssl-profiles-part-6-ssl-renegotiation)

[Strategy two](#linux-strategy-two) is very similar but instead of specifying a set of runtime flags, those options can be specified
in a file similar to RabbitMQ's [advanced.config file](./configure#advanced-config-file) and the runtime
will be pointed at that file. Therefore the steps are:

 * Tell the node to use encrypted inter-node connections using a runtime flag, `-proto_dist inet_tls`
 * Deploy an inter-node TLS settings file that contains information about certificate/key pair locations, CA bundle location,
   TLS settings used and so on
 * Tell the node where to find its inter-node TLS setting file using another runtime flag, `-ssl_dist_optfile`

We encourage operators to choose the strategy that works best for their deployment tools of choice.

With both options environment variables are used to pass those options to the runtime. This is best
done using `rabbitmq-env.conf` as explained in the [Configuration guide](./configure#customise-environment).

Once a node has inter-node connection configured with TLS, CLI tools such as `rabbitmqctl` and `rabbitmq-diagnostics`
also must use TLS to talk to the node. Plain TCP connections will be fail.

### Deploying Inter-node TLS

Once the certificate/key pair files and configuration are in place the new node can be started.
Note that it might be necessary to first stop the node, then deploy the files and configuration, and finally start the node.
This is because CLI tools configured to use TLS won't be able to connect to a node that does
not expect TLS-enabled CLI tool connections.

For nodes and CLI tools to perform TLS handshake and peer verification successfully,
the same [peer verification](./ssl#peer-verification)
example, certificate/key pairs used by other nodes and CLI
tools must be signed by the same certificate authority as the initial node or a
different CA that is trusted on all cluster nodes.

This is no different from how [peer verification works for client and plugin TLS connections](./ssl#peer-verification).

It is possible to reuse a single certificate/key pair for all nodes and CLI tools.
The certificate can also use a wildcard Subject Alternative Name (SAN) or Common Name (CN) such as `*.rabbitmq.example.local`
that would match every hostname in the cluster.


## Strategy One (Using Individual Flags) {#linux-strategy-one}

### Combining Certificate and Private Key {#combined-key-file}

The first strategy covered in this guide requires node's public and private keys to be combined into a single file.
Let's call it a combined keys file. To combined them, simply concatenate the private key file,
`server_key.pem` in the example below, to the end of the public key file, `server_certificate.pem`,
starting with a new line:

<Tabs groupId="shell">
<TabItem value="bash" label="bash" default>
```bash
cat server_certificate.pem server_key.pem > combined_keys.pem
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
Get-Content server_certificate.pem, server_key.pem | Set-Content combined_keys.pem
```
</TabItem>
</Tabs>

This can be done using a text editor and not just command line tools.

### Configuring Individual Runtime Flags for Inter-node TLS {#strategy-one-flags}

Assuming a combined keys file from the section above is ready, next we infer
the Erlang TLS library path and export `ERL_SSL_PATH` in the environment configuration file
to point at it:

<Tabs groupId="shell">
<TabItem value="bash" label="bash" default>
```bash
# These commands ensure that `ERL_SSL_PATH` is the first line in
# /etc/rabbitmq/rabbitmq-env.conf and will preserve the existing
# contents of that file if it already exists

erl -noinput -eval 'io:format("ERL_SSL_PATH=~s~n", [filename:dirname(code:which(inet_tls_dist))])' -s init stop > /tmp/ssl-path.txt
cat /tmp/ssl-path.txt /etc/rabbitmq/rabbitmq-env.conf > /tmp/new-rabbitmq-env.conf
mv -f /tmp/new-rabbitmq-env.conf /etc/rabbitmq/rabbitmq-env.conf
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">
```PowerShell
erl -noinput -eval 'io:format("ERL_SSL_PATH=~s~n", [filename:dirname(code:which(inet_tls_dist))])' -s init stop > ssl-path.txt
```

On Windows with `cmd.exe`, use double quotes with escaped inner quotes instead:

```batch
erl -noinput -eval "io:format(""ERL_SSL_PATH=~s~n"", [filename:dirname(code:which(inet_tls_dist))])" -s init stop > ssl-path.txt
```
</TabItem>
</Tabs>

This makes it possible for the node to load a module, `inet_tls_dist`, which is used for encrypted inter-node
communication, from the path.

Step number two is telling the runtime to use that module using the `-proto_dist inet_tls` runtime flag.
As with other runtime flags, `SERVER_ADDITIONAL_ERL_ARGS` is the most convenient and compatible to pass them.

Please note that the double quotes **must** be used here because the environment variable
value is multi-line:

```bash
# -pa $ERL_SSL_PATH prepends the directory ERL_SSL_PATH points at to the code path
# -proto_dist inet_tls tells the runtime to encrypt inter-node communication
# -ssl_dist_opt server_certfile /path/to/combined_keys.pem tells the runtime
#                               where to find the combined certificate/key file
# -ssl_dist_opt server_password password   required if the private key is encrypted
#
SERVER_ADDITIONAL_ERL_ARGS="-pa $ERL_SSL_PATH \
  -proto_dist inet_tls \
  -ssl_dist_opt server_certfile /path/to/combined_keys.pem \
  -ssl_dist_opt server_password password
```

Next step is to build on the previous example and enable secure renegotiation for
inter-node TLS connections. While this is optional, it is highly recommended. The same
`-ssl_dist_opt` can be used to enable more TLS-related settings. They won't be
covered in this example:

```bash
# -pa $ERL_SSL_PATH prepends the directory ERL_SSL_PATH points at to the code path
# -proto_dist inet_tls tells the runtime to encrypt inter-node communication
# -ssl_dist_opt server_certfile /path/to/combined_keys.pem tells the runtime
#                               where to find the combined certificate/key file
# -ssl_dist_opt server_password password   required if the private key is encrypted
# -ssl_dist_opt server_secure_renegotiate true client_secure_renegotiate true enables an additional TLS setting: secure renegotiation
SERVER_ADDITIONAL_ERL_ARGS="-pa $ERL_SSL_PATH \
  -proto_dist inet_tls \
  -ssl_dist_opt server_certfile /path/to/combined_keys.pem \
  -ssl_dist_opt server_password password \
  -ssl_dist_opt server_secure_renegotiate true client_secure_renegotiate true"
```

Once a node has inter-node connection configured with TLS, CLI tools such as `rabbitmqctl` and `rabbitmq-diagnostics`
also must use TLS to talk to the node. Plain TCP connections will be fail.

This is done very similarly to what the example above does using `SERVER_ADDITIONAL_ERL_ARGS` but this time
the environment variable is `RABBITMQ_CTL_ERL_ARGS`. It controls runtime flags used by CLI tools.

Here is the complete environment configuration file:

<Tabs groupId="shell">
<TabItem value="bash" label="bash" default>

The file is `/etc/rabbitmq/rabbitmq-env.conf`:

```bash
# IMPORTANT:
# the following path is system dependent (will
# change depending on the Erlang version, distribution,
# and installation method used). Please double check it before proceeding!
ERL_SSL_PATH="/usr/lib64/erlang/lib/ssl-9.4/ebin"

# -pa $ERL_SSL_PATH prepends the directory ERL_SSL_PATH points at to the code path
# -proto_dist inet_tls tells the runtime to encrypt inter-node communication
# -ssl_dist_opt server_certfile /path/to/combined_keys.pem tells the runtime
#                               where to find the combined certificate/key file
# -ssl_dist_opt server_password password   required if the private key is encrypted
# -ssl_dist_opt server_secure_renegotiate true client_secure_renegotiate true enables an additional TLS setting: secure renegotiation
SERVER_ADDITIONAL_ERL_ARGS="-pa $ERL_SSL_PATH \
  -proto_dist inet_tls \
  -ssl_dist_opt server_certfile /path/to/combined_keys.pem \
  -ssl_dist_opt server_password password \
  -ssl_dist_opt server_secure_renegotiate true client_secure_renegotiate true"

# Same settings as above but for CLI tools
RABBITMQ_CTL_ERL_ARGS="-pa $ERL_SSL_PATH \
  -proto_dist inet_tls \
  -ssl_dist_opt server_certfile /path/to/combined_keys.pem \
  -ssl_dist_opt server_password password \
  -ssl_dist_opt server_secure_renegotiate true client_secure_renegotiate true"
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">

The file is `rabbitmq-env-conf.bat`, saved in `%AppData%\RabbitMQ`:

```PowerShell
@echo off
rem IMPORTANT:
rem the following path is system dependent and will vary between Erlang versions
rem and installation paths
set SSL_PATH="C:/Program Files/erl10.0.1/lib/ssl-9.0/ebin"

set SERVER_ADDITIONAL_ERL_ARGS=-pa %SSL_PATH% ^
    -proto_dist inet_tls ^
    -ssl_dist_opt server_certfile C:/Path/To/combined_keys.pem ^
    -ssl_dist_opt server_password password ^
    -ssl_dist_opt server_secure_renegotiate true client_secure_renegotiate true

rem Same as above but for CLI tools
set CTL_ERL_ARGS=-pa %SSL_PATH% ^
    -proto_dist inet_tls ^
    -ssl_dist_opt server_certfile C:/Path/To/combined_keys.pem ^
    -ssl_dist_opt server_password password ^
    -ssl_dist_opt server_secure_renegotiate true client_secure_renegotiate true
```
</TabItem>
</Tabs>


## Strategy Two (Using a Single TLS Option File) {#linux-strategy-two}

### Using a Separate Setting File for Inter-node TLS {#strategy-two-flags}

Modern Erlang versions support a runtime flag, `-ssl_dist_optfile`,
that can be used to configure TLS for inter-node communication using a single file.
This simplifies the arguments passed on the command line.

Here is a complete environment configuration file using this setting.
Note that the name of the `-ssl_dist_optfile` file is not significant but
it must be stored in a location readable by the effective `rabbitmq` user:

<Tabs groupId="shell">
<TabItem value="bash" label="bash" default>

The file is `/etc/rabbitmq/rabbitmq-env.conf`:

```bash
# NOTE: the following path is system dependent and will change between Erlang
#       versions
ERL_SSL_PATH="/usr/lib64/erlang/lib/ssl-9.4/ebin"

# -pa $ERL_SSL_PATH prepends the directory ERL_SSL_PATH points at to the code path
# -proto_dist inet_tls tells the runtime to encrypt inter-node communication
# -ssl_dist_optfile tells the runtime where to find its inter-node TLS configuration file
SERVER_ADDITIONAL_ERL_ARGS="-pa $ERL_SSL_PATH
  -proto_dist inet_tls
  -ssl_dist_optfile /etc/rabbitmq/inter_node_tls.config"

RABBITMQ_CTL_ERL_ARGS="-pa $ERL_SSL_PATH
  -proto_dist inet_tls
  -ssl_dist_optfile /etc/rabbitmq/inter_node_tls.config"
```
</TabItem>
<TabItem value="PowerShell" label="PowerShell">

The file is `rabbitmq-env-conf.bat`, saved in `%AppData%\RabbitMQ`:

```PowerShell
@echo off
rem NOTE: the following path is system dependent and will vary between Erlang versions
set SSL_PATH="C:/Program Files/erl10.0.1/lib/ssl-9.0/ebin"

set SERVER_ADDITIONAL_ERL_ARGS=-pa %SSL_PATH% ^
    -proto_dist inet_tls ^
    -ssl_dist_optfile C:/Users/rmq_user/AppData/Roaming/RabbitMQ/inter_node_tls.config

set CTL_ERL_ARGS=-pa %SSL_PATH% ^
    -proto_dist inet_tls ^
    -ssl_dist_optfile C:/Users/rmq_user/AppData/Roaming/RabbitMQ/inter_node_tls.config
```
</TabItem>
</Tabs>

Here is an example `inter_node_tls.config` file that uses
separate server certificate and private key files, enables [peer verification](./ssl#peer-verification)
and requires peers to present a certificate. On Windows, use forward-slash (`/`) directory delimiters:

```erlang
%% coding: utf-8
%% This directive tells the Erlang preprocessor to interpret this file
%% as UTF-8, which is required if any values contain non-ASCII characters
%% (for example, in the password field).
[
  {server, [
    {cacertfile, "/full/path/to/ca_certificate.pem"},
    {certfile,   "/full/path/to/server_certificate.pem"},
    {keyfile,    "/full/path/to/server_key.pem"},
    {password,   "password-if-keyfile-is-encrypted"},
    {secure_renegotiate, true},
    {verify, verify_peer},
    {fail_if_no_peer_cert, true}
  ]},
  {client, [
    {cacertfile, "/full/path/to/ca_certificate.pem"},
    {certfile,   "/full/path/to/client_certificate.pem"},
    {keyfile,    "/full/path/to/client_key.pem"},
    {password,   "password-if-keyfile-is-encrypted"},
    {secure_renegotiate, true},
    {verify, verify_peer}
  ]}
].
```

These options are documented further in the [Erlang/OTP documentation](http://erlang.org/doc/apps/ssl/ssl_distribution.html).


