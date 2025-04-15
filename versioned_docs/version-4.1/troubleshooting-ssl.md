---
title: Troubleshooting TLS-enabled Connections
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

# Troubleshooting TLS-enabled Connections

## Overview {#overview}

This guide covers a methodology and some tooling that can help diagnose TLS connectivity issues and errors (TLS alerts).
It accompanies the main guide on [TLS in RabbitMQ](./ssl).
The strategy is to test the required components with an alternative TLS
implementation in the process of elimination to identify the problematic end (client or server).

Bear in mind that this process is not guaranteed to identify the problem if
the interaction between two specific components is responsible for the problem.

The steps recommended in this guide are:

 * Verify [effective configuration](#verify-config)
 * Verify that the node [listens for TLS connections](#verify-listeners)
 * Verify [file permissions](#verify-file-permissions)
 * Verify [file format](#verify-file-format) used by the certificate and private key files
 * Verify [TLS support in Erlang/OTP](#verify-tls-support-in-erlang)
 * Verify certificate/key pairs and test with alternative TLS client or server [using OpenSSL command line tools](#openssl-tools)
 * Verify available and configured [cipher suites](#verify-cipher-suites) and certificate key usage options
 * Verify client connections [with a TLS-terminating proxy](#stunnel)
 * And finally, test a real client connection against a real server connection again

When testing with a RabbitMQ node and/or a real RabbitMQ client it is important to inspect
[logs](./logging) for both server and client.

## Check Effective Node Configuration {#verify-config}

Setting up a RabbitMQ node with TLS involves modifying
configuration. Before performing any other TLS
troubleshooting steps it is important to verify config file
location and effective configuration (whether the node has
loaded it successfully). See [Configuration guide](./configure)
for details.

## Check TLS Listeners (Ports) {#verify-listeners}

This step checks that the broker is listening on the [expected port(s)](./networking), such as
5671 for AMQP 0-9-1 and 1.0, 8883 for MQTT, and so on.

To verify that TLS has been enabled on the node, use `[rabbitmq-diagnostics](./man/rabbitmq-diagnostics.8) listeners`
or the `listeners` section in `[rabbitmq-diagnostics](./man/rabbitmq-diagnostics.8) status`.

The listeners section will look something like this:

```ini
Interface: [::], port: 25672, protocol: clustering, purpose: inter-node and CLI tool communication
Interface: [::], port: 5672, protocol: amqp, purpose: AMQP 0-9-1 and AMQP 1.0
Interface: [::], port: 5671, protocol: amqp/ssl, purpose: AMQP 0-9-1 and AMQP 1.0 over TLS
Interface: [::], port: 15672, protocol: http, purpose: HTTP API
Interface: [::], port: 15671, protocol: https, purpose: HTTP API over TLS (HTTPS)
Interface: [::], port: 1883, protocol: mqtt, purpose: MQTT
```

In the above example, there are 6 TCP listeners on the node. Two of them accept TLS-enabled connections:

 * Inter-node and CLI tool communication on port `25672`
 * AMQP 0-9-1 (and 1.0, if enabled) listener for non-TLS connections on port `5672`
 * AMQP 0-9-1 (and 1.0, if enabled) listener for TLS-enabled connections on port `5671`
 * [HTTP API](./management) listeners on ports 15672 (HTTP) and 15671 (HTTPS)
 * [MQTT](./mqtt) listener for non-TLS connections 1883

If the above steps are not an option, inspecting node's [log file](./logging) can be a viable alternative.
It should contain an entry about a TLS listener being enabled, looking like this:

```
2018-09-02 14:24:58.611 [info] <0.664.0> started TCP listener on [::]:5672
2018-09-02 14:24:58.614 [info] <0.680.0> started SSL listener on [::]:5671
```

If the node is configured to use TLS but a message similar to the above is not logged,
it is possible that the configuration file was placed at an incorrect location and was not read by
the broker or the node was not restarted after config file changes.
See the [configuration page](./configure) for details
on config file verification.

Tools such as `lsof` and `netstat` can be used to verify what ports
a node is listening on, as covered in the [Troubleshooting Networking](./troubleshooting-networking) guide.

## Check Certificate, Private Key and CA Bundle File Permissions {#verify-file-permissions}

RabbitMQ must be able to read its configured CA certificate bundle, server certificate and private key.
The files must exist and have the appropriate permissions. Incorrect permissions (e.g. files
being owned by `root` or another superuser account that installed them) is a very common issue
with TLS setups.

On Linux, BSD and MacOS directory permissions can also affect node's ability to read the files.

When certificate or private key files are not readable or do not exist,
the node will fail to accept TLS-enabled connections or TLS connections will just hang (the behavior
differs between Erlang/OTP versions).

When [new style configuration format](./configure#config-file-formats) is used to configure certificate and private
key paths, the node will check if the files exist on boot and refuse to start if that's not the case.

## Check Certificate, Private Key and CA Bundle File Format {#verify-file-format}

RabbitMQ nodes require that all certificate, private key and CA certificate bundle files be
in the [PEM format](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail). Other formats will not be accepted.

Files in other formats can be [converted to PEM files](https://aboutssl.org/convert-certificate-to-pem-crt-to-pem-crt-to-pem-der-to-pem/)
using OpenSSL CLI tools.

## Check TLS Support in Erlang {#verify-tls-support-in-erlang}

Another key requirement for establishing TLS connections to the broker
is TLS support in the broker. Confirm that the Erlang VM has support
for TLS by running

```bash
rabbitmq-diagnostics --silent tls_versions
```

Or, on Windows

```bash
rabbitmq-diagnostics.bat --silent tls_versions
```

The output will look like this:

```ini
tlsv1.2
tlsv1.1
tlsv1
sslv3
```

With versions that do not provide `rabbitmq-diagnostics tls_versions`, use

```bash
rabbitmqctl eval 'ssl:versions().'
```

Or, on Windows

```PowerShell
rabbitmqctl.bat eval 'ssl:versions().'
```

The output in this case will look like so:

```erlang
[{ssl_app,"9.1"},
 {supported,['tlsv1.2','tlsv1.1',tlsv1]},
 {supported_dtls,['dtlsv1.2',dtlsv1]},
 {available,['tlsv1.2','tlsv1.1',tlsv1,sslv3]},
 {available_dtls,['dtlsv1.2',dtlsv1]}]
```

If an error is reported instead, confirm that the Erlang/OTP installation [includes TLS support](./ssl#erlang-otp-requirements).

It is also possible to list cipher suites available on a node:

```bash
rabbitmq-diagnostics cipher_suites --format openssl --silent
```

Or, on Windows:

```PowerShell
rabbitmq-diagnostics.bat cipher_suites --format openssl --silent
```

It is also possible to inspect what TLS versions are supported by the local Erlang runtime.
To do so, run `erl` (or `werl.exe` on Windows) on the command line to open an Erlang shell and
enter

```erlang
%% the trailing dot is significant!
ssl:versions().
```

Note that this will report supported versions on the local node (for the runtime found in `PATH`),
which may be different from that used by RabbitMQ node(s) inspected.

## Use OpenSSL Tools to Test TLS Connections {#openssl-tools}

OpenSSL [s_client](http://www.openssl.org/docs/apps/s_client.html)
and [s_server](http://www.openssl.org/docs/apps/s_server.html)
are commonly used command line tools that can be used to test TLS connections
and certificate/key pairs. They help narrow problems down by testing against
alternative TLS client and server implementations. For example, if a certain TLS
client works successfully with `s_server` but not a RabbitMQ node,
the root cause is likely on the server end. Likewise if an `s_client`
client can successfully connect to a RabbitMQ node but a different client cannot,
it's the client setup that should be inspected closely first.

The example below seeks to confirm that the certificates and keys can be used to
establish a TLS connection by connecting an `s_client` client to an `s_server` server
in two separate shells (terminal windows).

The example will assume you have the following [certificate and key files](./ssl#certificates-and-keys)
(these filenames are used by [tls-gen](https://github.com/rabbitmq/tls-gen)):

<table>
  <tr>
   <td>Item</td>
   <td>Location</td>
  </tr>
  <tr>
   <td>CA certificate (public key)</td>
   <td>`ca_certificate.pem`</td>
  </tr>
  <tr>
   <td>Server certificate (public key)</td>
   <td>`server_certificate.pem`</td>
  </tr>
  <tr>
   <td>Server private key</td>
   <td>`server_key.pem`</td>
  </tr>
  <tr>
   <td>Client certificate (public key)</td>
   <td>`client_certificate.pem`</td>
  </tr>
  <tr>
   <td>Client private key</td>
   <td>`client_key.pem`</td>
  </tr>
</table>

In one terminal window or tab execute the following command:

```bash
openssl s_server -accept 8443 \
  -cert server_certificate.pem -key server_key.pem -CAfile ca_certificate.pem
```

It will start an OpenSSL `s_server` that uses the provided
CA certificate bundler, server certificate and private key. It will be used
to confidence check the certificates with test TLS connections against this example server.

In another terminal window, run the following command, substituting `CN_NAME`
with the expected hostname or `CN` name from the certificate:

```bash
openssl s_client -connect localhost:8443 \
  -cert client_certificate.pem -key client_key.pem -CAfile ca_certificate.pem \
  -verify 8 -verify_hostname CN_NAME
```

It will open a new TLS connection to the example TLS server started above. You may leave
off the `-verify_hostname` argument but OpenSSL will no longer perform that
verification.

If the certificates and keys have been correctly created, a TLS connection output
will appear in both tabs. There is now a connection between the example client and the example
server, similar to `telnet`.

If the [trust chain](./ssl#peer-verification) could be established, the second terminal will display
a verification confirmation with the code of `0`:

```ini
Verify return code: 0 (ok)
```

Just like with command line tools, a non-zero code communicates an error of some kind.

If an error is reported, confirm that the certificates and keys were
generated correctly and that a matching certificate/private key pair is used.
In addition, certificates can have their [usage scenarios restricted](https://tools.ietf.org/html/rfc5280#section-4.2.1.3)
at generation time. This means a certificate meant to be used by clients to authenticate themselves
will be rejected by a server, such as a RabbitMQ node.

For environments where self-signed certificates are appropriate,
we recommend using [tls-gen](https://github.com/rabbitmq/tls-gen) for generation.

## Validate Available Cipher Suites {#verify-cipher-suites}

RabbitMQ nodes and clients can be limited in what [cipher suites](./ssl#cipher-suites) they are allowed
to use during TLS handshake. It is important to make sure that the two sides have
some cipher suites in common or otherwise the handshake will fail.

Certificate's key usage properties can also limit what cipher suites can be used.

See [Configuring Cipher Suites](./ssl#cipher-suites) and [Public Key Usage Extensions](./ssl#key-usage) in the main TLS guide
to learn more.

```bash
openssl ciphers -v
```

will display all cipher suites supported by the local build of OpenSSL.


## Attempt TLS Connection to a RabbitMQ Node {#sclient-connection}

Once a RabbitMQ node was configured to listen on a TLS port,
the OpenSSL `s_client` can be used to test TLS connection establishment, this time against the node.
This check establishes whether the broker is likely to be configured correctly, without needing
to configure a RabbitMQ client. The tool can also be useful to compare the behaviour of different clients.
The example assumes a node running on `localhost` on [default TLS port for AMQP 0-9-1 and AMQP 1.0](./networking#ports), 5671:

```bash
openssl s_client -connect localhost:5671 -cert client_certificate.pem -key client_key.pem -CAfile ca_certificate.pem
```

The output should appear similar to the case where port 8443 was used. The node log file
should [contain a new entry when the connection is established](./logging#logged-events):

```ini
2018-09-27 15:46:20 [info] <0.1082.0> accepting AMQP connection <0.1082.0> (127.0.0.1:50915 -> 127.0.0.1:5671)
2018-09-27 15:46:20 [info] <0.1082.0> connection <0.1082.0> (127.0.0.1:50915 -> 127.0.0.1:5671): user 'user' authenticated and granted access to vhost 'virtual_host'
```

The node will expect clients to perform protocol handshake (AMQP 0-9-1, AMQP 1.0 and so on). If that doesn't
happen within a short time window (10 seconds by default for most protocols), the node will close the
connection.

## Validate Client Connections with Stunnel {#stunnel}

[stunnel](http://www.stunnel.org/) is a tool that can be used to validate TLS-enabled clients.
In this configuration clients will make a secure connection to stunnel,
which will pass the decrypted data through to a "regular" port of the broker (say, 5672 for AMQP 0-9-1 and AMQP 1.0).
This provides some confidence that the client TLS configuration is correct independently of the broker TLS configuration.

`stunnel` is a specialised proxy. In this example it will run in daemon mode on the same host as the broker.
In the discussion that follows it is assumed that stunnel will only be used temporarily. It is also possible to use stunnel to
perform TLS termination but that is out of scope for this guide.

In this example `stunnel` will connect to the unencrypted port of the broker (5672) and accept
TLS connections from TLS-capable clients on port 5679.

Parameters are passed via a config file named `stunnel.conf`. It has the following content:

```ini
foreground = yes

[rabbit-amqp]
connect = localhost:5672
accept = 5679
cert = client/key-cert.pem
debug = 7
```

`stunnel` is started as follows:

```bash
cat client_key.pem client_certificate.pem > client/key-cert.pem
stunnel stunnel.conf
```

`stunnel` requires a certificate and its corresponding private key. The certificate
and private key files must be concatenated as shown above with the `cat` command.
`stunnel` requires that the key not be password-protected.
TLS-capable clients should now be able to connect to port 5679 and any TLS errors will appear
on the console where `stunnel` was started.

## Validate RabbitMQ Client Connection to RabbitMQ Node {#client-connection}

Assuming none of the previous steps produced errors then you can confidently connect the tested TLS-enabled
client to the TLS-enabled port of the broker, making sure to stop any running OpenSSL `s_server`
or `stunnel` instances first.

## Certificate Chains and Verification Depth {#verify-verification-depth}

When using a client certificate [signed by an intermediate CA](./ssl#peer-verification), it may be necessary
to configure RabbitMQ server to use a higher [verification depth](./ssl#peer-verification-depth).

Insufficient verification depth will result in TLS peer verification failures.

## Understanding TLS Connection Log Errors {#logs}

New broker logfile entries will be generated during many of the preceding steps. These entries
together with diagnostic output from commands on the console should help to identify the cause
of TLS-related errors. What follows is a list of the most common error entries:

<table>
  <thead>
    <td><strong>Logged Errors</strong></td>
    <td><strong>Explanation</strong></td>
  </thead>

  <tr>
    <td>
      Entries containing `{undef, [{crypto,hash,...`
    </td>
    <td>
      The `crypto` module is missing in the Erlang/OTP installation
      used or it is out of date. On Debian, Ubuntu, and other Debian-derived distributions
      it usually means that the [erlang-ssl](http://packages.ubuntu.com/search?keywords=erlang-ssl) package was not installed.
    </td>
  </tr>

  <tr>
    <td>
      Entries containing `{ssl_upgrade_error, ekeyfile}`
      or `{ssl_upgrade_error, ecertfile}`
    </td>
    <td>
      This means the broker keyfile or certificate file is invalid.
      Confirm that the keyfile matches the certificate and that both are in PEM format.
      PEM format is a printable encoding with recognisable delimiters. The certificate
      will start and end with `-----BEGIN CERTIFICATE-----` and
      `-----END CERTIFICATE-----` respectively. The keyfile will likewise
      start and end with `-----BEGIN RSA PRIVATE KEY-----` and
      `-----END RSA PRIVATE KEY-----` respectively.
    </td>
  </tr>

  <tr>
    <td>
      Entries containing `{ssl_upgrade_failure, ... certify ...}`
    </td>
    <td>
      This error is related to client verification. The client is presenting an invalid
      certificate or no certificate. If the ssl_options has the `verify` option
      set to `verify_peer` then try using the value `verify_none`
      temporarily. Ensure that the client certificate has been generated correctly, and that
      the client is presenting the correct certificate.
    </td>
  </tr>

  <tr>
    <td>
      Entries containing `{ssl_upgrade_error, ...}`
    </td>
    <td>
      This is a generic error that could have many causes. Make sure you are
      using the recommended version of Erlang.
    </td>
  </tr>

  <tr>
    <td>
      Entries containing `{tls_alert,"bad record mac"}`
    </td>
    <td>
      The server has tried verifying integrity of a piece of data it received
      and the check failed. This can be due to problematic network equipment, unintentional
      socket sharing in the client (e.g. due to the use of `fork(2)`) or a bug
      in the client implementation of TLS.
    </td>
  </tr>
</table>
