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

# Troubleshooting TLS-enabled Connections

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide covers a methodology and some tooling that can help diagnose TLS connectivity issues and errors (TLS alerts).
It accompanies the main guide on [TLS in RabbitMQ](./ssl.html).
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
[logs](./logging.html) for both server and client.

## <a id="verify-config" class="anchor" href="#verify-config">Check Effective Node Configuration</a>

Setting up a RabbitMQ node with TLS involves modifying
configuration. Before performing any other TLS
troubleshooting steps it is important to verify config file
location and effective configuration (whether the node has
loaded it successfully). See [Configuration guide](configure.html)
for details.

## <a id="verify-listeners" class="anchor" href="#verify-listeners">Check TLS Listeners (Ports)</a>

This step checks that the broker is listening on the [expected port(s)](networking.html), such as
5671 for AMQP 0-9-1 and 1.0, 8883 for MQTT, and so on.

To verify that TLS has been enabled on the node, use <code>[rabbitmq-diagnostics](./rabbitmq-diagnostics.8.html) listeners</code>
or the <code>listeners</code> section in <code>[rabbitmq-diagnostics](./rabbitmq-diagnostics.8.html) status</code>.

The listeners section will look something like this:

<pre class="lang-ini">
Interface: [::], port: 25672, protocol: clustering, purpose: inter-node and CLI tool communication
Interface: [::], port: 5672, protocol: amqp, purpose: AMQP 0-9-1 and AMQP 1.0
Interface: [::], port: 5671, protocol: amqp/ssl, purpose: AMQP 0-9-1 and AMQP 1.0 over TLS
Interface: [::], port: 15672, protocol: http, purpose: HTTP API
Interface: [::], port: 15671, protocol: https, purpose: HTTP API over TLS (HTTPS)
Interface: [::], port: 1883, protocol: mqtt, purpose: MQTT
</pre>

In the above example, there are 6 TCP listeners on the node. Two of them accept TLS-enabled connections:

 * Inter-node and CLI tool communication on port <code>25672</code>
 * AMQP 0-9-1 (and 1.0, if enabled) listener for non-TLS connections on port <code>5672</code>
 * AMQP 0-9-1 (and 1.0, if enabled) listener for TLS-enabled connections on port <code>5671</code>
 * [HTTP API](./management.html) listeners on ports 15672 (HTTP) and 15671 (HTTPS)
 * [MQTT](./mqtt.html) listener for non-TLS connections 1883

If the above steps are not an option, inspecting node's [log file](./logging.html) can be a viable alternative.
It should contain an entry about a TLS listener being enabled, looking like this:

<pre class="lang-plaintext">
2018-09-02 14:24:58.611 [info] &lt;0.664.0&gt; started TCP listener on [::]:5672
2018-09-02 14:24:58.614 [info] &lt;0.680.0&gt; started SSL listener on [::]:5671
</pre>

If the node is configured to use TLS but a message similar to the above is not logged,
it is possible that the configuration file was placed at an incorrect location and was not read by
the broker or the node was not restarted after config file changes.
See the [configuration page](./configure.html#introduction) for details
on config file verification.

Tools such as <code>lsof</code> and <code>netstat</code> can be used to verify what ports
a node is listening on, as covered in the [Troubleshooting Networking](./troubleshooting-networking.html) guide.

## <a id="verify-file-permissions" class="anchor" href="#verify-file-permissions">Check Certificate, Private Key and CA Bundle File Permissions</a>

RabbitMQ must be able to read its configured CA certificate bundle, server certificate and private key.
The files must exist and have the appropriate permissions. Incorrect permissions (e.g. files
being owned by `root` or another superuser account that installed them) is a very common issue
with TLS setups.

On Linux, BSD and MacOS directory permissions can also affect node's ability to read the files.

When certificate or private key files are not readable or do not exist,
the node will fail to accept TLS-enabled connections or TLS connections will just hang (the behavior
differs between Erlang/OTP versions).

When [new style configuration format](./configure.html#config-file-formats) is used to configure certificate and private
key paths, the node will check if the files exist on boot and refuse to start if that's not the case.

## <a id="verify-file-format" class="anchor" href="#verify-file-format">Check Certificate, Private Key and CA Bundle File Format</a>

RabbitMQ nodes require that all certificate, private key and CA certificate bundle files be
in the [PEM format](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail). Other formats will not be accepted.

Files in other formats can be [converted to PEM files](https://aboutssl.org/convert-certificate-to-pem-crt-to-pem-crt-to-pem-der-to-pem/)
using OpenSSL CLI tools.

## <a id="verify-tls-support-in-erlang" class="anchor" href="#verify-tls-support-in-erlang">Check TLS Support in Erlang</a>

Another key requirement for establishing TLS connections to the broker
is TLS support in the broker. Confirm that the Erlang VM has support
for TLS by running

<pre class="lang-bash">
rabbitmq-diagnostics --silent tls_versions
</pre>

Or, on Windows

<pre class="lang-bash">
rabbitmq-diagnostics.bat --silent tls_versions
</pre>

The output will look like this:

<pre class="lang-ini">
tlsv1.2
tlsv1.1
tlsv1
sslv3
</pre>

With versions that do not provide <code>rabbitmq-diagnostics tls_versions</code>, use

<pre class="lang-bash">
rabbitmqctl eval 'ssl:versions().'
</pre>

Or, on Windows

<pre class="lang-powershell">
rabbitmqctl.bat eval 'ssl:versions().'
</pre>

The output in this case will look like so:

<pre class="lang-erlang">
[{ssl_app,"9.1"},
 {supported,['tlsv1.2','tlsv1.1',tlsv1]},
 {supported_dtls,['dtlsv1.2',dtlsv1]},
 {available,['tlsv1.2','tlsv1.1',tlsv1,sslv3]},
 {available_dtls,['dtlsv1.2',dtlsv1]}]
</pre>

If an error is reported instead, confirm that the Erlang/OTP installation [includes TLS support](./ssl.html#erlang-otp-requirements).

It is also possible to list cipher suites available on a node:

<pre class="lang-bash">
rabbitmq-diagnostics cipher_suites --format openssl --silent
</pre>

Or, on Windows:

<pre class="lang-powershell">
rabbitmq-diagnostics.bat cipher_suites --format openssl --silent
</pre>

It is also possible to inspect what TLS versions are supported by the local Erlang runtime.
To do so, run <code>erl</code> (or <code>werl.exe</code> on Windows) on the command line to open an Erlang shell and
enter

<pre class="lang-erlang">
%% the trailing dot is significant!
ssl:versions().
</pre>

Note that this will report supported versions on the local node (for the runtime found in <code>PATH</code>),
which may be different from that used by RabbitMQ node(s) inspected.

## <a id="openssl-tools" class="anchor" href="#openssl-tools">Use OpenSSL Tools to Test TLS Connections</a>

OpenSSL [s_client](http://www.openssl.org/docs/apps/s_client.html)
and [s_server](http://www.openssl.org/docs/apps/s_server.html)
are commonly used command line tools that can be used to test TLS connections
and certificate/key pairs. They help narrow problems down by testing against
alternative TLS client and server implementations. For example, if a certain TLS
client works successfully with <code>s_server</code> but not a RabbitMQ node,
the root cause is likely on the server end. Likewise if an <code>s_client</code>
client can successfully connect to a RabbitMQ node but a different client cannot,
it's the client setup that should be inspected closely first.

The example below seeks to confirm that the certificates and keys can be used to
establish a TLS connection by connecting an <code>s_client</code> client to an <code>s_server</code> server
in two separate shells (terminal windows).

The example will assume you have the following [certificate and key files](./ssl.html#certificates-and-keys)
(these filenames are used by [tls-gen](https://github.com/rabbitmq/tls-gen)):

<table>
  <tr>
   <td>Item</td>
   <td>Location</td>
  </tr>
  <tr>
   <td>CA certificate (public key)</td>
   <td><code>ca_certificate.pem</code></td>
  </tr>
  <tr>
   <td>Server certificate (public key)</td>
   <td><code>server_certificate.pem</code></td>
  </tr>
  <tr>
   <td>Server private key</td>
   <td><code>server_key.pem</code></td>
  </tr>
  <tr>
   <td>Client certificate (public key)</td>
   <td><code>client_certificate.pem</code></td>
  </tr>
  <tr>
   <td>Client private key</td>
   <td><code>client_key.pem</code></td>
  </tr>
</table>

In one terminal window or tab execute the following command:

<pre class="lang-bash">
openssl s_server -accept 8443 \
  -cert server_certificate.pem -key server_key.pem -CAfile ca_certificate.pem
</pre>

It will start an OpenSSL <code>s_server</code> that uses the provided
CA certificate bundler, server certificate and private key. It will be used
to confidence check the certificates with test TLS connections against this example server.

In another terminal window, run the following command, substituting <code>CN_NAME</code>
with the expected hostname or <code>CN</code> name from the certificate:

<pre class="lang-bash">
openssl s_client -connect localhost:8443 \
  -cert client_certificate.pem -key client_key.pem -CAfile ca_certificate.pem \
  -verify 8 -verify_hostname CN_NAME
</pre>

It will open a new TLS connection to the example TLS server started above. You may leave
off the <code>-verify_hostname</code> argument but OpenSSL will no longer perform that
verification.

If the certificates and keys have been correctly created, a TLS connection output
will appear in both tabs. There is now a connection between the example client and the example
server, similar to <code>telnet</code>.

If the [trust chain](./ssl.html#peer-verification) could be established, the second terminal will display
a verification confirmation with the code of <code>0</code>:

<pre class="lang-ini">
Verify return code: 0 (ok)
</pre>

Just like with command line tools, a non-zero code communicates an error of some kind.

If an error is reported, confirm that the certificates and keys were
generated correctly and that a matching certificate/private key pair is used.
In addition, certificates can have their [usage scenarios restricted](https://tools.ietf.org/html/rfc5280#section-4.2.1.3)
at generation time. This means a certificate meant to be used by clients to authenticate themselves
will be rejected by a server, such as a RabbitMQ node.

For environments where self-signed certificates are appropriate,
we recommend using [tls-gen](https://github.com/rabbitmq/tls-gen) for generation.

## <a id="verify-cipher-suites" class="anchor" href="#verify-cipher-suites">Validate Available Cipher Suites</a>

RabbitMQ nodes and clients can be limited in what [cipher suites](./ssl.html#cipher-suite) they are allowed
to use during TLS handshake. It is important to make sure that the two sides have
some cipher suites in common or otherwise the handshake will fail.

Certificate's key usage properties can also limit what cipher suites can be used.

See [Configuring Cipher Suites](./ssl.html#cipher-suites) and [Public Key Usage Extensions](./ssl.html#key-usage) in the main TLS guide
to learn more.

<pre class="lang-bash">
openssl ciphers -v
</pre>

will display all cipher suites supported by the local build of OpenSSL.


## <a id="sclient-connection" class="anchor" href="#sclient-connection">Attempt TLS Connection to a RabbitMQ Node</a>

Once a RabbitMQ node was configured to listen on a TLS port,
the OpenSSL <code>s_client</code> can be used to test TLS connection establishment, this time against the node.
This check establishes whether the broker is likely to be configured correctly, without needing
to configure a RabbitMQ client. The tool can also be useful to compare the behaviour of different clients.
The example assumes a node running on <code>localhost</code> on [default TLS port for AMQP 0-9-1 and AMQP 1.0](networking.html#ports), 5671:

<pre class="lang-bash">
openssl s_client -connect localhost:5671 -cert client_certificate.pem -key client_key.pem -CAfile ca_certificate.pem
</pre>

The output should appear similar to the case where port 8443 was used. The node log file
should [contain a new entry when the connection is established](./logging.html#logged-events):

<pre class="lang-ini">
2018-09-27 15:46:20 [info] &lt;0.1082.0&gt; accepting AMQP connection &lt;0.1082.0&gt; (127.0.0.1:50915 -> 127.0.0.1:5671)
2018-09-27 15:46:20 [info] &lt;0.1082.0&gt; connection &lt;0.1082.0&gt; (127.0.0.1:50915 -> 127.0.0.1:5671): user 'user' authenticated and granted access to vhost 'virtual_host'
</pre>

The node will expect clients to perform protocol handshake (AMQP 0-9-1, AMQP 1.0 and so on). If that doesn't
happen within a short time window (10 seconds by default for most protocols), the node will close the
connection.

## <a id="stunnel" class="anchor" href="#stunnel">Validate Client Connections with Stunnel</a>

[stunnel](http://www.stunnel.org/) is a tool that can be used to validate TLS-enabled clients.
In this configuration clients will make a secure connection to stunnel,
which will pass the decrypted data through to a "regular" port of the broker (say, 5672 for AMQP 0-9-1 and AMQP 1.0).
This provides some confidence that the client TLS configuration is correct independently of the broker TLS configuration.

`stunnel` is a specialised proxy. In this example it will run in daemon mode on the same host as the broker.
In the discussion that follows it is assumed that stunnel will only be used temporarily. It is also possible to use stunnel to
perform TLS termination but that is out of scope for this guide.

In this example `stunnel` will connect to the unencrypted port of the broker (5672) and accept
TLS connections from TLS-capable clients on port 5679.

Parameters are passed via a config file named <code>stunnel.conf</code>. It has the following content:

<pre  class="lang-ini">
foreground = yes

[rabbit-amqp]
connect = localhost:5672
accept = 5679
cert = client/key-cert.pem
debug = 7
</pre>

`stunnel` is started as follows:

<pre  class="lang-bash">
cat client_key.pem client_certificate.pem > client/key-cert.pem
stunnel stunnel.conf
</pre>

`stunnel` requires a certificate and its corresponding private key. The certificate
and private key files must be concatenated as shown above with the <code>cat</code> command.
`stunnel` requires that the key not be password-protected.
TLS-capable clients should now be able to connect to port 5679 and any TLS errors will appear
on the console where `stunnel` was started.

## <a id="client-connection" class="anchor" href="#client-connection">Validate RabbitMQ Client Connection to RabbitMQ Node</a>

Assuming none of the previous steps produced errors then you can confidently connect the tested TLS-enabled
client to the TLS-enabled port of the broker, making sure to stop any running OpenSSL <code>s_server</code>
or `stunnel` instances first.

## <a id="verify-verification-depth" class="anchor" href="#verify-verification-depth">Certificate Chains and Verification Depth</a>

When using a client certificate [signed by an intermediate CA](./ssl.html#peer-verification), it may be necessary
to configure RabbitMQ server to use a higher [verification depth](./ssl.html#peer-verification-depth).

Insufficient verification depth will result in TLS peer verification failures.

## <a id="logs" class="anchor" href="#logs">Understanding TLS Connection Log Errors</a>

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
      Entries containing <code>{undef, [{crypto,hash,...</code>
    </td>
    <td>
      The <code>crypto</code> module is missing in the Erlang/OTP installation
      used or it is out of date. On Debian, Ubuntu, and other Debian-derived distributions
      it usually means that the [erlang-ssl](http://packages.ubuntu.com/search?keywords=erlang-ssl) package was not installed.
    </td>
  </tr>

  <tr>
    <td>
      Entries containing <code>{ssl_upgrade_error, ekeyfile}</code>
      or <code>{ssl_upgrade_error, ecertfile}</code>
    </td>
    <td>
      This means the broker keyfile or certificate file is invalid.
      Confirm that the keyfile matches the certificate and that both are in PEM format.
      PEM format is a printable encoding with recognisable delimiters. The certificate
      will start and end with <code>-----BEGIN CERTIFICATE-----</code> and
      <code>-----END CERTIFICATE-----</code> respectively. The keyfile will likewise
      start and end with <code>-----BEGIN RSA PRIVATE KEY-----</code> and
      <code>-----END RSA PRIVATE KEY-----</code> respectively.
    </td>
  </tr>

  <tr>
    <td>
      Entries containing <code>{ssl_upgrade_failure, ... certify ...}</code>
    </td>
    <td>
      This error is related to client verification. The client is presenting an invalid
      certificate or no certificate. If the ssl_options has the <code>verify</code> option
      set to <code>verify_peer</code> then try using the value <code>verify_none</code>
      temporarily. Ensure that the client certificate has been generated correctly, and that
      the client is presenting the correct certificate.
    </td>
  </tr>

  <tr>
    <td>
      Entries containing <code>{ssl_upgrade_error, ...}</code>
    </td>
    <td>
      This is a generic error that could have many causes. Make sure you are
      using the recommended version of Erlang.
    </td>
  </tr>

  <tr>
    <td>
      Entries containing <code>{tls_alert,"bad record mac"}</code>
    </td>
    <td>
      The server has tried verifying integrity of a piece of data it received
      and the check failed. This can be due to problematic network equipment, unintentional
      socket sharing in the client (e.g. due to the use of <code>fork(2)</code>) or a bug
      in the client implementation of TLS.
    </td>
  </tr>
</table>
