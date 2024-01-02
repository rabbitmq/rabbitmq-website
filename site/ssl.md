<!--
Copyright (c) 2005-2024 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache license,
Version 2.0 (the "license”); you may not use this file except in compliance
with the license. You may obtain a copy of the license at

https://www.apache.org/licenses/license-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the license is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the license for the specific language governing permissions and
limitations under the license.
-->

# TLS Support

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ has inbuilt support for TLS. This includes client connections and popular plugins, where applicable,
such as [Federation links](federation.html). It is also possible to use TLS
to [encrypt inter-node connections in clusters](clustering-ssl.html).

This guide covers various topics related to TLS in RabbitMQ, with a focus on client
connections:

 * Two [ways of using TLS](#tls-connectivity-options) for client connections: direct or via a TLS terminating proxy
 * [Erlang/OTP requirements](#erlang-otp-requirements) for TLS support
 * [Enabling TLS](#enabling-tls) in RabbitMQ
 * How to generate self-signed certificates for development and QA environments [with tls-gen](#automated-certificate-generation) or [manually](#manual-certificate-generation)
 * TLS configuration in [Java](#java-client) and [.NET](#dotnet-client) clients
 * [Peer (certificate chain) verification](#peer-verification) of client connections or mutual ("mTLS")
 * Public [key usage extensions](#key-usage) relevant to RabbitMQ
 * How to control what [TLS version](#tls-versions) and [cipher suite](#cipher-suites) are enabled
 * [TLSv1.3](#tls1.3) support
 * Tools that can be used to [evaluate a TLS setup](#tls-evaluation-tools)
 * Known [attacks on TLS](#major-vulnerabilities) and their mitigation
 * How to use [private key passwords](#private-key-passwords)

and more. It tries to [explain the basics of TLS](#certificates-and-keys) but not, however, a primer on TLS, encryption, [public Key Infrastructure](https://en.wikipedia.org/wiki/public_key_infrastructure) and related topics, so the concepts are covered very briefly.

A number of beginner-oriented primers are available elsewhere on the Web:
[one](https://hpbn.co/transport-layer-security-tls/)
[two](https://medium.com/talpor/ssl-tls-authentication-explained-86f00064280),
[three](https://blogs.akamai.com/2016/03/enterprise-security---ssltls-primer-part-1---data-encryption.html),
[four](https://blogs.akamai.com/2016/03/enterprise-security---ssltls-primer-part-2---public-key-certificates.html).

TLS can be enabled for all protocols supported by RabbitMQ, not just AMQP 0-9-1,
which this guide focuses on. [HTTP API](./management.html), [inter-node and CLI tool traffic](./clustering-ssl.html) can be configured
to use TLS (HTTPS) as well.

To configure TLS on Kubernetes using the RabbitMQ Cluster Operator, see the guide for [Configuring TLS](./kubernetes/operator/using-operator.html#tls).

For an overview of common TLS troubleshooting techniques, see [Troubleshooting TLS-related issues](troubleshooting-ssl.html)
and [Troubleshooting Networking](troubleshooting-networking.html).

### <a id="tls-connectivity-options" class="anchor" href="#tls-connectivity-options">Common Approaches to TLS for client Connections with RabbitMQ</a>

For client connections, there are two common approaches:

 * Configure RabbitMQ to handle TLS connections
 * Use a proxy or load balancer (such as [HAproxy](http://www.haproxy.org/))
   to perform [TLS termination](https://en.wikipedia.org/wiki/TLS_termination_proxy) of client connections and use plain TCP connections to RabbitMQ nodes.

Both approaches are valid and have pros and cons. This guide will focus on the
first option. Certain parts of this guide would still be relevant for environments
that choose the second option.

### <a id="erlang-otp-requirements" class="anchor" href="#erlang-otp-requirements">Erlang/OTP Requirements for TLS Support</a>

In order to support TLS connections, RabbitMQ needs TLS and
crypto-related modules to be available in the Erlang/OTP
installation. The recommended Erlang/OTP version to use with
TLS is the most recent [supported Erlang release](./which-erlang.html).
Earlier versions, even if they are supported, may work for most certificates
but have known limitations (see below).

The Erlang `asn1`, `crypto`,
`public_key`, and `ssl` libraries
(applications) must be installed and functional. On Debian and
Ubuntu this is provided by the [erlang-asn1](http://packages.ubuntu.com/search?keywords=erlang-asn1),
[erlang-crypto](http://packages.ubuntu.com/search?keywords=erlang-crypto), [erlang-public-key](http://packages.ubuntu.com/search?keywords=erlang-public-key), and
[erlang-ssl](http://packages.ubuntu.com/search?keywords=erlang-ssl) packages, respectively. The [zero dependency
Erlang RPM for RabbitMQ](https://github.com/rabbitmq/erlang-rpm) includes the above modules.

If Erlang/OTP is compiled from source, it is necessary to ensure that `configure`
finds OpenSSL and builds the above libraries.

When investigating TLS connectivity issues, please keep in mind that in the vast majority
of cases they are environment-specific (e.g. certificates are missing from the [trusted certificate store](#peer-verification-trusted-certificates))
and do not indicate a bug or limitation in Erlang/OTP's TLS implementation. Please go through the steps outlined
in the [Troubleshooting TLS guide](troubleshooting-ssl.html) to gather
more information first.

### <a id="known-compatibility-issues" class="anchor" href="#known-compatibility-issues">Known Incompatibilities and Limitations</a>

If Elliptic curve cryptography (ECC) cipher suites is
expected to be used, a recent [supported Erlang release](./which-erlang.html)
is highly recommended. Earlier releases have known limitations around ECC support.

If you face the above limitations or any other incompatibilities,
use the TLS termination option (see above).


## <a id="certificates-and-keys" class="anchor" href="#certificates-and-keys">TLS Basics: Certificate Authorities, Certificates, Keys</a>

TLS is a large and fairly complex topic. Before explaining [how to enable TLS in RabbitMQ](#enabling-tls)
it's worth briefly cover some of the concepts used in this guide. This section is intentionally brief and oversimplifies
some things. Its goal is to get the reader started with enabling TLS for RabbitMQ and applications.
A number of beginner-oriented primers on TLS are available elsewhere on the Web:
[one](https://hpbn.co/transport-layer-security-tls/)
[two](https://blog.talpor.com/2015/07/ssltls-certificates-beginners-tutorial/),
[three](https://blogs.akamai.com/2016/03/enterprise-security---ssltls-primer-part-1---data-encryption.html),
[four](https://blogs.akamai.com/2016/03/enterprise-security---ssltls-primer-part-2---public-key-certificates.html).

For a thorough understanding of
TLS and how to get the most out of it, we would recommend the use
of other resources, for example <a class="extlink" href="http://oreilly.com/catalog/9780596002701/">Network Security with
OpenSSL</a>.

TLS has two primary purposes: encrypting connection traffic and providing a way to authenticate ([verify](#peer-verification))
the peer to mitigate against [Man-in-the-Middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack).
Both are accomplished using a set of roles, policies and procedures known as [Public Key Infrastructure](https://en.wikipedia.org/wiki/public_key_infrastructure) (PKI).

A PKI is based on the concept of digital identities that can be cryptographically (mathematically) verified. Those identities are called
<em>certificates</em> or more precisely, <em>certificate/key pairs</em>. Every TLS-enabled server usually has its own certificate/key
pair that it uses to compute a connection-specific key that will be used to encrypt traffic sent on the connection. Also, if asked, it can present its certificate
(public key) to the connection peer. Clients may or may not have their own certificates. In the context of messaging and tools such as RabbitMQ it is quite common for
clients to also use certificate/key pairs so that servers can validate their identity.

Certificate/key pairs are generated by tools such as OpenSSL and signed by entities called <em>[Certificate Authorities](https://en.wikipedia.org/wiki/Certificate_authority)</em> (CA).
CAs issue certificates that users (applications or other CAs) use. When a certificate is signed by a CA, they form a <em>chain of trust</em>. Such chains can include
more than one CA but ultimately sign a certificate/key pair used by an application (a <em>leaf</em> or <em>end user</em> certificate).
Chains of CA certificates are usually distributed together in a single file. Such file is called a <em>CA bundle</em>.

Here's an example of the most basic chain with one root CA and one leaf (server or client) certificate:

<img class="figure" src="./img/root_ca_and_leaf.png" alt="Root CA and leaf certificates" />

A chain with intermediate certificates might look like this:

<img class="figure" src="./img/root_intermediate_ca_and_leaf.png" alt="Root CA, intermediate and leaf certificates" />

There are organizations that sign and issue certificate/key pairs. Most of them are widely trusted CAs and charge a fee for their services.

A TLS-enabled RabbitMQ node must have a set of Certificate Authority certificates it considers to be trusted in a file (a CA bundle),
a certificate (public key) file and a private key file. The files will be read from the local filesystem. They must be readable by the effective user
of the RabbitMQ node process.

Both ends of a TLS-enabled connection can optionally verify
the other end of the connection. While doing so, they try to locate a trusted Certificate Authority in the certificate list
presented by the peer. When both sides perform this verification process, this is known
as _mutual TLS authentication_ or _mTLS_.
More on this in the [Peer Verification](#peer-verification) section.

This guide assumes the user has access to a Certificate Authority and two certificate/key pairs
in a number of formats for different client libraries to use.
This is best done using [existing tools](#automated-certificate-generation)
but those looking to get more familiar with the topic and OpenSSL command line
tools there's a [separate section](#manual-certificate-generation).

In production environments certificates are generated by a commercial Certificate Authority
or a Certificate Authority issued by the internal security team. In those cases Certificate Authority
bundle files very likely will contain more than one certificate. This doesn't change how the bundle file
is used when configuration RabbitMQ as long as the same basic [file and path requirements](#enabling-tls-paths) are met.
In other words, whether the certificates are self-signed or issued by a [trusted CA](#peer-verification-trusted-certificates), they are
configured the same way. The section on [peer verification](#peer-verification) covers this in detail.


## <a id="automated-certificate-generation" class="anchor" href="#automated-certificate-generation">The Short Route to Generating a CA, Certificates, and Keys</a>

This guide assumes the user has access to a CA certificate bundle file and two [certificate/key pairs](#certificates-and-keys).
The certificate/key pairs are used by RabbitMQ and clients that connect to the server on a
TLS-enabled port. The process of generating a Certificate Authority and two key pairs is fairly labourious
and can be error-prone. An easier way of generating all that
stuff on MacOS or Linux is with <a href="https://github.com/rabbitmq/tls-gen">tls-gen</a>:
it requires `Python 3.5+`, `make` and `openssl` in `PATH`.

Note that `tls-gen` and the certificate/key pairs
it generates are self-signed and only suitable for development
and test environments. The vast majority of production environments
should use certificates and keys issued by a widely trusted commercial
CA.

`tls-gen` supports RSA and [Elliptic Curve Cryptography](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-Elliptic-curve-cryptography/)
algorithms for key generation.

### <a id="automated-certificate-generation-transcript" class="anchor" href="#automated-certificate-generation-transcript">Using tls-gen's Basic Profile</a>

Below is an example that generates a CA and uses it to produce two certificate/key pairs, one
for the server and another for clients. This is the setup that is expected by the rest of this guide.

<pre class="lang-bash">
git clone https://github.com/rabbitmq/tls-gen tls-gen
cd tls-gen/basic
# private key password
make PASSWORD=bunnies
make verify
make info
ls -l ./result
</pre>

The certificate chain produced by this basic tls-gen profile looks like this:

<img class="figure" src="./img/root_ca_and_leaf.png" alt="Root CA and leaf certificates" />


## <a id="enabling-tls" class="anchor" href="#enabling-tls">Enabling TLS Support in RabbitMQ</a>

To enable the TLS support in RabbitMQ, the node has to be configured
to know the location of the [Certificate Authority
bundle](#certificates-and-keys) (a file with one more CA certificates), the server's certificate file, and the server's
key. A TLS listener should also be enabled to know what port to listen on for TLS-enabled client connections.
More TLS-related things can be configured. Those are covered in the rest of this guide.

Here are the essential configuration settings related to TLS:

<table class="plain">
  <thead>
    <td>Configuration Key</td>
    <td>Description</td>
  </thead>
  <tr>
    <td><code>listeners.ssl</code></td>
    <td>
      A list of ports to listen on for TLS
      connections. RabbitMQ can listen on a <a href="./networking.html">single interface or multiple ones</a>.
    </td>
  </tr>
  <tr>
    <td><code>ssl_options.cacertfile</code></td>
    <td>Certificate Authority (CA) bundle file path</td>
  </tr>
  <tr>
    <td><code>ssl_options.certfile</code></td>
    <td>Server certificate file path</td>
  </tr>
  <tr>
    <td><code>ssl_options.keyfile</code></td>
    <td>Server private key file path</td>
  </tr>
  <tr>
    <td><code>ssl_options.verify</code></td>
    <td>Should <a href="#peer-verification">peer verification</a> be enabled?</td>
  </tr>
  <tr>
    <td><code>ssl_options.fail_if_no_peer_cert</code></td>
    <td>
      When set to <code>true</code>, TLS connection
      will be rejected if client fails to provide a certificate
    </td>
  </tr>
</table>

The options are provided in the <a href="configure.html#configuration-files">configuration
file</a>. An example of the config file is below, which
will start one TLS listener on port 5671 on all interfaces
on this hostname:

<pre class="lang-ini">
listeners.ssl.default = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert = true
</pre>

This configuration will also perform [peer certificate chain verification](#peer-verification)
so clients without any certificates will be rejected.

It is possible to completely disable regular (non-TLS) listeners. Only TLS-enabled
clients would be able to connect to such a node, and only if they use the correct port:

<pre class="lang-ini">
# disables non-TLS listeners, only TLS-enabled clients will be able to connect
listeners.tcp = none

listeners.ssl.default = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert = true
</pre>

TLS settings can also be configured using the [classic config format](./configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
  {rabbit, [
     {ssl_listeners, [5671]},
     {ssl_options, [{cacertfile, "/path/to/ca_certificate.pem"},
                    {certfile,   "/path/to/server_certificate.pem"},
                    {keyfile,    "/path/to/server_key.pem"},
                    {verify,     verify_peer},
                    {fail_if_no_peer_cert, true}]}
   ]}
].
</pre>

### <a id="enabling-tls-paths" class="anchor" href="#enabling-tls-paths">Certificate and Private Key File Paths</a>

RabbitMQ must be able to read its configured CA certificate bundle, server certificate and private key. The files
must exist and have the appropriate permissions. When that's not the case the node will fail to start or fail to
accept TLS-enabled connections.

<b>Note to Windows users:</b> backslashes ("\") in the
configuration file are interpreted as escape sequences -
so for example to specify the
path `c:\ca_certificate.pem` for the CA certificate you
would need to use `"c:\\ca_certificate.pem"` or `"c:/ca_certificate.pem"`.

### <a id="enabling-tls-verify-configuration" class="anchor" href="#enabling-tls-verify-configuration">How to Verify that TLS is Enabled</a>

To verify that TLS has been enabled on the node, restart it and inspect its [log file](./logging.html).
It should contain an entry about a TLS listener being enabled, looking like this:

<pre class="lang-plaintext">
2020-07-13 21:13:01.015 [info] &lt;0.573.0&gt; started TCP listener on [::]:5672
2020-07-13 21:13:01.055 [info] &lt;0.589.0&gt; started TLS (SSL) listener on [::]:5671
</pre>

Another way is by using `rabbitmq-diagnostics listeners` which should contain
lines for TLS-enabled listeners:

<pre class="lang-bash">
rabbitmq-diagnostics listeners
#
# ... (some output omitted for brevity)
# => Interface: [::], port: 5671, protocol: amqp/ssl, purpose: AMQP 0-9-1 and AMQP 1.0 over TLS
# ...
</pre>

### <a id="private-key-passwords" class="anchor" href="#private-key-passwords">Providing Private Key Password</a>

Private keys can be optional protected by a password.
To provide the password, use the `password` option:

<pre class="lang-ini">
listeners.ssl.1 = 5671
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.password   = t0p$3kRe7
</pre>

The same example using the [classic config format](./configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
 {rabbit, [
           {ssl_listeners, [5671]},
           {ssl_options, [{cacertfile,"/path/to/ca_certificate.pem"},
                          {certfile,  "/path/to/server_certificate.pem"},
                          {keyfile,   "/path/to/server_key.pem"},
                          {password,  "t0p$3kRe7"}
                         ]}
          ]}
].
</pre>

Classic config file format allows for [config value encryption](https://www.rabbitmq.com/configure.html#configuration-encryption),
which is recommended for passwords.

## <a id="peer-verification" class="anchor" href="#peer-verification">TLS Peer Verification: Who Do You Say You Are?</a>

As mentioned in the [Certificates and Keys](#certificates-and-keys) section, TLS has two
primary purposes: encrypting connection traffic and providing a way to verify
that the peer can be trusted (e.g. signed by a trusted Certificate Authority)
to mitigate against [Man-in-the-Middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack),
a class of attacks where an attacker impersonates a legitimate trusted peer (usually a server).
This section will focus on the latter.

### <a id="peer-verification-how-it-works" class="anchor" href="#peer-verification-how-it-works">How Peer Verification Works</a>

When a TLS connection is established client and server perform connection negotiation that takes several steps.
The first step is when the peers *optionally* exchange their [certificates](#certificates-and-keys).
Having exchanged certificates, the peers can *optionally* attempt
to establish a chain of trust between their CA certificates and the certificates presented.
This acts to verify that the peer is who it claims to be (provided the private key hasn't been
stolen).

The process is known as peer verification or peer validation
and follows an algorithm known as the [Certification path validation algorithm](https://en.wikipedia.org/wiki/Certification_path_validation_algorithm).
Understanding the entire algorithm is not necessary in order to use peer verification,
so this section provides an oversimplified explanation of the key parts.

Each peer provides a *chain of certificates* that begins with a "leaf"
(client or server) certificate and continues with at least one Certificate Authority (CA) certificate. That
CA issued (signed) the leaf CA. If there are multiple CA certificates, they usually form a chain of signatures,
meaning that each CA certificate was signed by the next one. For example, if certificate B is signed by A and C is signed by B,
the chain is `A, B, C` (commas here are used for clarity). The "topmost" (first or only) CA is often referred
to as the <em>root CA</em> for the chain. Root CAs can be issued by well-known Certificate Authorities
(commercial vendors) or any other party ([self-signed](https://en.wikipedia.org/wiki/Self-signed_certificate)).

Here's an example of the most basic chain with one root CA and one leaf (server or client) certificate:

<img class="figure" src="./img/root_ca_and_leaf.png" alt="Root CA and leaf certificates" />

A chain with intermediate certificates might look like this:

<img class="figure" src="./img/root_intermediate_ca_and_leaf.png" alt="Root CA, intermediate and leaf certificates" />

During peer verification TLS connection client (or server) traverses
the chain of certificates presented by the peer
and if a trusted certificate is found, considers the peer trusted.

### Mutual Peer Verification (Mutual TLS Authentication or mTLS)

When both sides perform this peer verification process, this is known
as _mutual TLS authentication_ or _mTLS_.

Enabling mutual peer verification involves two things:

 * [Enabling peer verification for client connections](#peer-verification-configuration) on the RabbitMQ side
 * [Enabling peer verification of the server](#peer-verification-clients) in application code

In other words, mutual peer verification ("mTLS") is a joint responsibility of RabbitMQ nodes
and client connections. Enabling peer verification on just one end is not enough.

### When Peer Verification Fails

If no trusted and otherwise valid certificate is found, peer verification fails and client's TLS (TCP) connection is
closed with a fatal error ("alert" in OpenSSL parlance) that says "Unknown CA" or similar. The alert
will be logged by the server with a message similar to this:

<pre class="lang-ini">
2018-09-10 18:10:46.502 [info] &lt;0.902.0&gt; TLS server generated SERVER ALERT: Fatal - Unknown CA
</pre>

Certificate validity is also checked at every step. Certificates that are expired
or aren't yet valid will be rejected. The TLS alert in that case will look something
like this:

<pre class="lang-ini">
2018-09-10 18:11:05.168 [info] &lt;0.923.0&gt; TLS server generated SERVER ALERT: Fatal - Certificate Expired
</pre>

The examples above demonstrate TLS alert messages logged by a RabbitMQ node.
Clients that perform peer verification will also raise alerts but may use different
error messages. [RFC 8446 section 6.2](https://tools.ietf.org/html/rfc8446#section-6.2)
provides an overview of various alerts and what they mean.


### <a id="peer-verification-trusted-certificates" class="anchor" href="#peer-verification-trusted-certificates">Trusted Certificates</a>

Every TLS-enabled tool and TLS implementation, including Erlang/OTP and
RabbitMQ, has a way of marking a set of certificates as trusted.

There are three common approaches to this:

 * All trusted CA certificates must be added to a single file called the *CA certificate bundle*
 * All CA certificates in a directory are considered to be trusted
 * A dedicated tool is used to manage trusted CA certificates

Different TLS implementation and tools use different options. In the context of RabbitMQ this means that
the trusted certificate management approach may be different for different client
libraries, tools and RabbitMQ server itself.

For example, OpenSSL and OpenSSL command line tools such as `s_client` on Linux and other UNIX-like systems
will use a directory administered by superusers.
CA certificates in that directory will be considered trusted,
and so are the certificates issued by them (such as those presented by clients).
Locations of the trusted certificate directory will [vary](https://www.happyassassin.net/2015/01/12/a-note-about-ssltls-trusted-certificate-stores-and-platforms/)
[between distributions](http://gagravarr.org/writing/openssl-certs/others.shtml), operating systems and releases.

On Windows trusted certificates are managed using tools such as [certmgr](https://docs.microsoft.com/en-us/dotnet/framework/tools/certmgr-exe-certificate-manager-tool).

The certificates in the server's CA certificate bundle may be considered trusted.
We say "may" because it doesn't work the same way for all client libraries since this varies from TLS implementation
to implementation. Certificates in a CA certificate bundler won't be considered to be trusted in Python,
for example, unless explicitly added to the trust store.

RabbitMQ relies on Erlang's TLS implementation. It assumes that
**all trusted CA certificates are added to the server certificate bundle**.

When performing peer verification, RabbitMQ will only consider the root certificate (first certificate in the list) to be trusted.
Any intermediate certificates will be ignored. If it's desired that intermediate certificates
are also considered to be trusted they must be added to the trusted certificate list: the certificate bundle.

While it is possible to place final ("leaf") certificates
such as those used by servers and clients to the trusted certificate directory,
a much more common practice is to add CA certificates to the trusted certificate list.

The most common way of appending several certificates to one
another and use in a single Certificate Authority bundle file
is to simply concatenate them:

<pre class="lang-bash">
cat rootca/ca_certificate.pem otherca/ca_certificate.pem &gt; all_cacerts.pem
</pre>

### <a id="peer-verification-configuration" class="anchor" href="#peer-verification-configuration">Enabling Peer Verification</a>

On the server end, peer verification is primarily controlled using two configuration
options: `ssl_options.verify` and `ssl_options.fail_if_no_peer_cert`.

Setting the `ssl_options.fail_if_no_peer_cert` option to `false` tells
the node to accept clients which don't present a certificate (for example, were not configured to use one).

When the `ssl_options.verify` option is set to `verify_peer`,
the client does send us a certificate, the node must perform peer verification.
When set to `verify_none`, peer verification will be disabled and certificate
exchange won't be performed.

For example, the following
config will perform peer verification and reject clients that do not provide
a certificate:

<pre class="lang-ini">
listeners.ssl.default = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile = /path/to/server_certificate.pem
ssl_options.keyfile = /path/to/server_key.pem
ssl_options.verify = verify_peer
ssl_options.fail_if_no_peer_cert = true
</pre>

The same example in the [classic config format](./configure.html#config-file):

<pre class="lang-erlang">
[
{rabbit, [
   {ssl_listeners, [5671]},
   {ssl_options, [{cacertfile,"/path/to/ca_certificate.pem"},
                  {certfile,"/path/to/server_certificate.pem"},
                  {keyfile,"/path/to/server_key.pem"},
                  {verify, verify_peer},
                  {fail_if_no_peer_cert, true}]}
 ]}
].
</pre>

How exactly peer verification is configured in client libraries varies from library to library.
[Java](#java-client) and [.NET](#dotnet-client) client sections cover peer
verification in those clients.

Peer verification is highly recommended in production environments. With careful consideration,
disabling it can make sense in certain environments (e.g. development).

### <a id="peer-verification-clients" class="anchor" href="#peer-verification-clients"></a>

Thus it is possible to create an encrypted TLS connection _without_ having to
verify certificates. Client libraries usually support both modes of operation.

When peer verification is enabled, it is common for clients to also check whether
the hostname of the server
they are connecting to matches one of two fields
in the server certificate: the [SAN (Subject Alternative Name)](https://en.wikipedia.org/wiki/Subject_Alternative_Name)
or CN (Common Name). When [wildcard certificates](https://en.wikipedia.org/wiki/Wildcard_certificate) are used,
the hostname is matched against a pattern. If there is no match, peer verification will also be
failed by the client. Hostname checks are also optional and generally orthogonal to certificate chain
verification performed by the client.

Because of this it is important to know what SAN (Subject Alternative Name) or CN (Common Name) values
were used when generating the certificate. If a certificate is generated on one host and used
on a different host then the `$(hostname)` value should be replaced with the correct hostname of the target server.

[tls-gen](#automatic-certificate-generation) will use local machine's hostname for both values.
Likewise, in the [manual certificate/key pair generation section](#manual-certificate-generation) local machine's hostname is specified as
`...-subj /CN=$(hostname)/...` to some OpenSSL CLI tool commands.

### <a id="peer-verification-depth" class="anchor" href="#peer-verification-depth">Certificate Chains and Verification Depth</a>

When using a client certificate signed by an intermediate CA, it may be necessary
to configure RabbitMQ server to use a higher verification depth.

The depth is the maximum number of non-self-issued intermediate certificates that
may follow the peer certificate in a valid certification path.
So if depth is 0 the peer (e.g. client) certificate must be signed by the trusted CA directly,
if 1 the path can be "peer, CA, trusted CA", if it is 2 "peer, CA, CA, trusted CA", and so on.
The default depth is 1.

The following example demonstrates how to configure certificate validation depth for
RabbitMQ server:

<pre class="lang-ini">
listeners.ssl.default = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile = /path/to/server_certificate.pem
ssl_options.keyfile = /path/to/server_key.pem
ssl_options.verify = verify_peer
ssl_options.depth  = 2
ssl_options.fail_if_no_peer_cert = false
</pre>

The same example in the [classic config format](./configure.html#config-file):

<pre class="lang-erlang">
[
  {rabbit, [
     {ssl_listeners, [5671]},
     {ssl_options, [{cacertfile,"/path/to/ca_certificate.pem"},
                    {certfile,"/path/to/server_certificate.pem"},
                    {keyfile,"/path/to/server_key.pem"},
                    {depth, 2},
                    {verify,verify_peer},
                    {fail_if_no_peer_cert,false}]}
   ]}
].
</pre>

When using RabbitMQ plugins such as [Federation](federation.html) or [Shovel](shovel.html) with TLS,
it may be necessary to configure verification depth for the Erlang client that those plugins use under the hood,
as [explained below](#erlang-client).


## <a id="java-client" class="anchor" href="#java-client">Using TLS in the Java Client</a>

There are two main parts to enabling TLS in the RabbitMQ Java client:
setting up the key store with a bit of Java security framework plumbing and
implementing the desired peer verification strategy.

### <a id="java-client-trust-managers-and-stores" class="anchor" href="#java-client-trust-managers-and-stores">Key Managers, Trust Managers and Stores</a>

There are three main components in the Java security
framework: [Key Manager](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/KeyManager.html),
[Trust Manager](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/TrustManager.html) and [Key Store](https://docs.oracle.com/javase/8/docs/api/java/security/KeyStore.html).

A Key Manager is used by a peer (in this case, a client connection) to manage its certificates.
During TLS connection/session negotiation, the key manager will control which
certificates to send to the remote peer.

A Trust Manager is used by a peer to manage remote certificates.
During TLS connection/session negotiation, the trust manager will control which
certificates are trusted from a remote peer. Trust managers can be used
to implement any certificate chain verification logic.

A Key Store is a Java encapsulation of the certificate store concept. All
certificates must either be stored into a Java-specific binary format (JKS)
or to be in the PKCS#12 format. These formats are managed using the
`KeyStore` class. In the below examples the JKS format is used to add the trusted (server) certificate(s)
to the store, while for the client key/certificate pair, the PKCS#12
key file generated by [tls-gen](#automated-certificate-generation) will be used.

All TLS-related settings in the Java client
are configured via the [ConnectionFactory](https://rabbitmq.github.io/rabbitmq-java-client/api/current/com/rabbitmq/client/ConnectionFactory.html).

### <a id="java-client-connecting" class="anchor" href="#java-client-connecting">Connecting with TLS</a>

This very basic example will show a simple client connecting to a RabbitMQ
server over TLS without validating the server certificate, and
without presenting any client certificate to the server.

<pre class="lang-java">
import java.io.*;
import java.security.*;

import com.rabbitmq.client.*;

public class Example1 {

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(&quot;localhost&quot;);
        factory.setPort(5671);

        factory.useSslProtocol();
        // Tells the library to setup the default Key and Trust managers for you
        // which do not do any form of remote server trust verification

        Connection conn = factory.newConnection();
        Channel channel = conn.createChannel();

        // non-durable, exclusive, auto-delete queue
        channel.queueDeclare(&quot;rabbitmq-java-test&quot;, false, true, true, null);
        channel.basicPublish(&quot;&quot;, &quot;rabbitmq-java-test&quot;, null, &quot;Hello, World&quot;.getBytes());

        GetResponse chResponse = channel.basicGet(&quot;rabbitmq-java-test&quot;, false);
        if (chResponse == null) {
            System.out.println(&quot;No message retrieved&quot;);
        } else {
            byte[] body = chResponse.getBody();
            System.out.println(&quot;Received: &quot; + new String(body));
        }

        channel.close();
        conn.close();
    }
}</pre>

This simple example is an echo client and server. It creates a channel
and publishes to the default direct exchange, then
fetches back what has been published and echoes it out. It uses
an [exclusive, non-durable, auto-delete queue](queues.html) that will be deleted shortly
after the connection is closed.

### <a id="java-client-connecting-with-peer-verification" class="anchor" href="#java-client-connecting-with-peer-verification">Connecting with Peer Verification Enabled</a>

For a Java client to trust a server, the server certificate must be added
to a trust store which will be used to instantiate a [Trust Manager](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/TrustManager.html).
The JDK ships with a tool called `keytool` that manages certificate stores. To import a certificate to
a store use `keytool -import`:

<pre class="lang-bash">
keytool -import -alias server1 -file /path/to/server_certificate.pem -keystore /path/to/rabbitstore
</pre>

The above command will import `server/certificate.pem` into the `rabbitstore` file
using the JKS format. The certificate will be referred to as `server1` in the trust store.
All certificates and keys must have distinct name in their store.

`keytool` will confirm that the certificate is trusted and ask for a password.
The password protects the trust store from any tampering attempt.

The client certificate and key in a `PKCS#12` file are then used. Note Java understands
natively the `PKCS#12` format, no conversion is needed.

The below example demonstrates how the key store and the trust store are used with a
[Key Manager](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/KeyManager.html)
and [Trust Manager](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/TrustManager.html), respectively.

<pre class="lang-java">
import java.io.*;
import java.security.*;
import javax.net.ssl.*;

import com.rabbitmq.client.*;

public class Example2 {

    public static void main(String[] args) throws Exception {
      char[] keyPassphrase = &quot;MySecretPassword&quot;.toCharArray();
      KeyStore ks = KeyStore.getInstance(&quot;PKCS12&quot;);
      ks.load(new FileInputStream(&quot;/path/to/client_key.p12&quot;), keyPassphrase);

      KeyManagerFactory kmf = KeyManagerFactory.getInstance(&quot;SunX509&quot;);
      kmf.init(ks, keyPassphrase);

      char[] trustPassphrase = &quot;rabbitstore&quot;.toCharArray();
      KeyStore tks = KeyStore.getInstance(&quot;JKS&quot;);
      tks.load(new FileInputStream(&quot;/path/to/trustStore&quot;), trustPassphrase);

      TrustManagerFactory tmf = TrustManagerFactory.getInstance(&quot;SunX509&quot;);
      tmf.init(tks);

      SSLContext c = SSLContext.getInstance(&quot;TLSv1.2&quot;);
      c.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);

      ConnectionFactory factory = new ConnectionFactory();
      factory.setHost(&quot;localhost&quot;);
      factory.setPort(5671);
      factory.useSslProtocol(c);
      factory.enableHostnameVerification();

      Connection conn = factory.newConnection();
      Channel channel = conn.createChannel();

      channel.queueDeclare(&quot;rabbitmq-java-test&quot;, false, true, true, null);
      channel.basicPublish(&quot;&quot;, &quot;rabbitmq-java-test&quot;, null, &quot;Hello, World&quot;.getBytes());

      GetResponse chResponse = channel.basicGet(&quot;rabbitmq-java-test&quot;, false);
      if (chResponse == null) {
          System.out.println(&quot;No message retrieved&quot;);
      } else {
          byte[] body = chResponse.getBody();
          System.out.println(&quot;Received: &quot; + new String(body));
      }

      channel.close();
      conn.close();
  }
}</pre>

To ensure that the above code works as expected with untrusted certificates, set up
a RabbitMQ node with a certificate that has not been imported
into the key store and watch the connection fail.

#### <a class="anchor" href="#java-client-hostname-verification">Server Hostname Verification</a>

Hostname verification must be enabled separately using the
`ConnectionFactory#enableHostnameVerification()` method. This is done in the example
above, for instance:

<pre class="lang-java">
import java.io.*;
import java.security.*;
import javax.net.ssl.*;

import com.rabbitmq.client.*;

public class Example2 {

    public static void main(String[] args) throws Exception {
      char[] keyPassphrase = &quot;MySecretPassword&quot;.toCharArray();
      KeyStore ks = KeyStore.getInstance(&quot;PKCS12&quot;);
      ks.load(new FileInputStream(&quot;/path/to/client_key.p12&quot;), keyPassphrase);

      KeyManagerFactory kmf = KeyManagerFactory.getInstance(&quot;SunX509&quot;);
      kmf.init(ks, passphrase);

      char[] trustPassphrase = &quot;rabbitstore&quot;.toCharArray();
      KeyStore tks = KeyStore.getInstance(&quot;JKS&quot;);
      tks.load(new FileInputStream(&quot;/path/to/trustStore&quot;), trustPassphrase);

      TrustManagerFactory tmf = TrustManagerFactory.getInstance(&quot;SunX509&quot;);
      tmf.init(tks);

      SSLContext c = SSLContext.getInstance(&quot;TLSv1.2&quot;);
      c.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);

      ConnectionFactory factory = new ConnectionFactory();
      factory.setHost(&quot;localhost&quot;);
      factory.setPort(5671);
      factory.useSslProtocol(c);
      factory.enableHostnameVerification();

      // this connection will both perform peer verification
      // and server hostname verification
      Connection conn = factory.newConnection();

      // snip ...
  }
}</pre>

This will verify
that the server certificate has been issued for the hostname the
client is connecting to. Unlike certificate chain verification, this feature
is client-specific (not usually performed by the server).

With JDK 6, it is necessary to add a dependency on
[Apache Commons HttpClient](https://hc.apache.org/) for hostname verification to work, e.g. with Maven:

<pre class="lang-xml">
&lt;!-- Maven dependency to add for hostname verification on JDK 6 --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;org.apache.httpcomponents&lt;/groupId&gt;
    &lt;artifactId&gt;httpclient&lt;/artifactId&gt;
    &lt;version&gt;4.5.6&lt;/version&gt;
&lt;/dependency&gt;
</pre>

With Gradle:

<pre class="lang-groovy">
// Gradle dependency to add for hostname verification on JDK 6
compile group: 'org.apache.httpcomponents', name: 'httpclient', version: '4.5.6'
</pre>

Alternatively with JDK 6
`ConnectionFactory#enableHostnameVerification(HostnameVerifier)`
can be provided a `HostnameVerifier` instance of choice.

### <a id="tls-versions-java-client" class="anchor" href="#tls-versions-java-client">Configuring TLS Version in Java Client</a>

Just like RabbitMQ server can be [configured to support only specific TLS versions](#tls-versions),
it may be necessary to configure preferred TLS version in the Java client. This is done using
the `ConnectionFactory#useSslProtocol` overloads that accept a protocol version name
or a `SSLContext`:

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
factory.setHost(&quot;localhost&quot;);
factory.setPort(5671);

factory.useSslProtocol("TLSv1.2");
</pre>

Modern releases of the library will attempt to use the latest TLS version
supported by the runtime.


## <a id="dotnet-client" class="anchor" href="#dotnet-client">Using TLS in the .NET Client</a>

For a client certificate to be understood on the .NET platform, they
can be in a number of formats including DER and PKCS#12 but
not PEM. For the DER format, .NET expects them to
be stored in files with `.cer` extension. [tls-gen](#automated-certificate-generation)
generates both PEM and PKCS#12 files.

### <a id="dotnet-peer-verification" class="anchor" href="#dotnet-peer-verification">.NET Trust Store</a>

On the .NET platform, [trusted certificates](#peer-verification-trusted-certificates) are managed by putting them
into any of a number of stores. All management of these stores is done
with the 'certmgr' tool.

N.B.: on some flavours of Windows there are two versions of
the command: one that ships with the operating system and
provides a graphical interface only, and one that ships
with the Windows SDK and provides both a graphical and command line interface.
Either will do the job, but the examples below are based on the latter.

For our case, because we're supplying the client certificate/key pair
in a separate PKCS#12 file, all we need to do is to import the
certificate of the root Certificate Authority into
the Root (Windows) or Trust (Mono) store.
All certificates signed by any certificate in that store are automatically trusted.

In contrast to the Java client, which is happy to use a
TLS connection without performing peer verification, the .NET client by default requires this
verification to succeed. To suppress verification, an application can set
the `System.Net.Security.SslPolicyErrors.RemoteCertificateNotAvailable`
and `System.Net.Security.SslPolicyErrors.RemoteCertificateChainErrors`
flags in [SslOption](&url-dotnet-apidoc;/RabbitMQ.Client.SslOption.html).

### <a id="certmgr" class="anchor" href="#certmgr">Certificate Management with Certmgr</a>

`certmgr` is a command line tool that manages certificates in a specified store, for example,
adds and deletes them. These stores can be per-user stores, or
system-wide. Only administrative users can have write access to the system-wide stores.

The following example adds a certificate to the store of user `Root` (also known as `Trust` in some .NET implementation)

<pre class="lang-powershell">
# Windows
certmgr -add -all \path\to\cacert.cer -s Root
</pre>

<pre class="lang-bash">
# Linux with Mono
certmgr -add -c Trust /path/to/cacert.cer
</pre>

To add a certificate to the system-wide (machine) certificate store instead, run

<pre class="lang-powershell">
# Windows
certmgr -add -all \path\to\cacert.cer -s -r localMachine Root
</pre>

<pre class="lang-bash">=
# Linux with Mono
certmgr -add -c -m Trust /path/to/cacert.cer
</pre>

After adding to a store, we can view the contents of that store with the `-all` (`-list` with Mono) switch:

<pre class="lang-bash">
certmgr -all -s Root

# … snip …

Self-signed X.509 v3 Certificate
  Serial Number: AC3F2B74ECDD9EEA00
  Issuer Name:   CN=MyTestCA
  Subject Name:  CN=MyTestCA
  valid From:    25/08/2018 14:03:01
  valid Until:   24/09/2018 14:03:01
  Unique Hash:   1F04D1D2C20B97BDD5DB70B9EB2013550697A05E
</pre>

<pre class="lang-bash">
certmgr -list -c Trust

# … snip …

Self-signed X.509 v3 Certificate
  Serial Number: AC3F2B74ECDD9EEA00
  Issuer Name:   CN=MyTestCA
  Subject Name:  CN=MyTestCA
  valid From:    25/08/2018 14:03:01
  valid Until:   24/09/2018 14:03:01
  Unique Hash:   1F04D1D2C20B97BDD5DB70B9EB2013550697A05E
</pre>


According to the above output there is one Self-signed X.509 v3 Certificate in the
trust store. The Unique Hash uniquely identifies this certificate in
this store. To delete this certificate, use the unique hash:

<pre class="lang-bash">
# Windows
certmgr -del -c -sha1 1F04D1D2C20B97BDD5DB70B9EB2013550697A05E -s Root

# … snip …

Certificate removed from store.
</pre>

<pre class="lang-bash">
# Linux with Mono
certmgr -del -c Trust 1F04D1D2C20B97BDD5DB70B9EB2013550697A05E

# … snip …

Certificate removed from store.
</pre>

### <a id="dotnet-connection-params" class="anchor" href="#dotnet-connection-params">Connection TLS Settings</a>

To create a TLS-enabled connection to RabbitMQ, we need to set some new
fields in the ConnectionFactory's Parameters field.
To make things
easier, there is a new Field Parameters.Ssl that acts like a namespace
for all the other fields that we need to set. The fields are:

<table class="plain">
<thead>
  <td>Property</td>
  <td>Description</td>
</thead>
<tr>
  <td><code>Ssl.CertPath</code></td>
  <td>
    This is the path to the client's certificate in
    PKCS#12 format if your server expects client side verification. This
    is optional.
  </td>
</tr>
<tr>
  <td><code>Ssl.CertPassphrase</code></td>
  <td>
    If you are using a client certificate in PKCS#12
    format then it'll probably have a password, which you specify in
    this field.
  </td>
</tr>
<tr>
  <td><code>Ssl.Enabled</code></td>
  <td>This is a boolean field that turns TLS support on or
  off. It is off by default.</td>
</tr>
<tr>
  <td><code>Ssl.ServerName</code></td>
  <td>
    .NET expects this to match the Subject Alternative Name (SAN) or Common Name (CN) on
    the certificate that the server sends over.
  </td>
</tr>
</table>

### <a id="dotnet-tls-versions-dotnet-client" class="anchor" href="#dotnet-tls-versions-dotnet-client">TLS Versions</a>

Just like RabbitMQ server can be [configured to support only specific TLS versions](#tls-versions),
it may be necessary to configure preferred TLS version in the .NET client. This is done using
the TLS options accessible via `ConnectionFactory#Ssl`.

Supported TLS version values are those of the [System.Security.Authentication.SslProtocols enum](https://docs.microsoft.com/en-us/dotnet/api/system.security.authentication.sslprotocols?view=netframework-4.8):

<pre class="lang-csharp">
using System.Security.Authentication;

// ...

ConnectionFactory cf = new ConnectionFactory();

cf.Ssl.Enabled = true;
cf.Ssl.ServerName = System.Net.Dns.GetHostName();
cf.Ssl.CertPath = "/path/to/client_key.p12";
cf.Ssl.CertPassphrase = "MySecretPassword";

// Use TLSv1.2 for this connection
cf.Ssl.Version = SslProtocols.Tls12;
</pre>

RabbitMQ .NET client 5.x series uses TLSv1.0 by default.

Starting with RabbitMQ .NET client 6.0
the default changes to [`SslProtocols.None`](https://docs.microsoft.com/en-us/dotnet/api/system.security.authentication.sslprotocols?view=netframework-4.8#System_Security_Authentication_SslProtocols_None),
which means the default is [picked by the .NET framework or the operating system](https://docs.microsoft.com/en-us/dotnet/framework/network-programming/tls?view=netframework-4.6.2) depending on [app context switches](https://docs.microsoft.com/en-us/dotnet/framework/network-programming/tls?view=netframework-4.6.2#configuring-security-via-appcontext-switches-for-net-framework-46-or-later-versions).

If a connection that uses `SslProtocols.None` to pick a suitable TLS version fails, the client
will retry with TLSv1.2 enabled explicitly. This reduces the need for explicit configuration
on the application developer's end in environments where automatic TLS version selection is
disabled, not available or otherwise cannot be relied on.

Modern .NET frameworks versions [default to TLSv1.2](https://docs.microsoft.com/en-us/dotnet/framework/network-programming/tls?view=netframework-4.6.2).



### <a id="dotnet-example" class="anchor" href="#dotnet-example">Code Example</a>

This is a more or less direct port of the [Java client example](#java-client-connecting). It
creates a channel and publishes to
the default direct exchange, then reads back what has been
published and echoes it out. Note that we use an
[exclusive, non-durable, auto-delete queue](queues.html) so we don't have
to worry about manually cleaning up after ourselves

<pre class="lang-csharp">
using System;
using System.IO;
using System.Text;

using RabbitMQ.client;
using RabbitMQ.Util;

namespace RabbitMQ.client.Examples {
  public class TestSSL {
    public static int Main(string[] args) {
      ConnectionFactory cf = new ConnectionFactory();

      cf.Ssl.Enabled = true;
      cf.Ssl.ServerName = System.Net.Dns.GetHostName();
      cf.Ssl.CertPath = "/path/to/client_key.p12";
      cf.Ssl.CertPassphrase = "MySecretPassword";

      using (IConnection conn = cf.CreateConnection()) {
        using (IModel ch = conn.CreateModel()) {
          Console.WriteLine("Successfully connected and opened a channel");
          ch.QueueDeclare("rabbitmq-dotnet-test", false, false, false, null);
          Console.WriteLine("Successfully declared a queue");
          ch.QueueDelete("rabbitmq-dotnet-test");
          Console.WriteLine("Successfully deleted the queue");
        }
      }
      return 0;
    }
  }
}
</pre>

### <a id="tls-verification-in-dotnet" class="anchor" href="#tls-verification-in-dotnet">TLS Peer Verification in .NET Client</a>

TLS offers peer verification (validation), a way for client and server to
verify each other's identity based on peer's certificate information.
When peer verification is enabled, typically the <em class="">hostname</em> of the server
you're connecting to needs to match the <em class="">CN (Common Name)</em> field on
the server's certificate, otherwise the certificate will be
rejected. However, peer verification doesn't have to be limited to just CN
and hostname matching in general.


This is why the commands at the start of this guide specify
`...-subj /CN=$(hostname)/...` which dynamically looks up your
hostname. If you're generating certificates on one machine, and using
them on the other then be sure to swap out the `$(hostname)`
section, and replace it with the correct hostname for your server.


On the .NET platform, [RemoteCertificateValidationCallback](http://msdn.microsoft.com/en-us/library/system.net.security.remotecertificatevalidationcallback(v=vs.110).aspx)
controls TLS verification behavior.


In RabbitMQ .NET client, `RabbitMQ.client.SslOption.CertificatevalidationCallback`
can be used to provide a [RemoteCertificateValidationCallback](http://msdn.microsoft.com/en-us/library/system.net.security.remotecertificatevalidationcallback(v=vs.110).aspx)
delegate. The delegate will be used to verify peer (RabbitMQ node) identity using whatever logic fits
the applications.

If this is not specified, the default callback will be
used in conjunction with the AcceptablePolicyErrors
property to determine if the remote server certificate is
valid.

The `System.Net.Security.SslPolicyErrors.RemoteCertificateNameMismatch`
flag in `RabbitMQ.client.SslOption.AcceptablePolicyErrors`
can be used to disable peer verification (not recommended in production environments!).


`RabbitMQ.client.SslOption.CertificateSelectionCallback`
can be used to provide
a [LocalCertificateSelectionCallback](http://msdn.microsoft.com/en-us/library/system.net.security.localcertificateselectioncallback(v=vs.110).aspx)
that will select the local certificate used for peer verification.


## <a id="tls-versions" class="anchor" href="#tls-versions">Limiting TLS Versions Used by the Server</a>

### <a id="tls-versions-why-limit" class="anchor" href="#tls-versions-why-limit">Why Limit TLS Versions</a>

TLS (née SSL) has evolved over time and has multiple versions in use.
Each version builds on the shortcomings of previous versions. Most of the time
the shortcomings resulted in [known attacks](#major-vulnerabilities) that affect specific
versions of TLS (and SSL). Disabling older TLS versions is a way to mitigate
many of those attacks (another technique is to [disable affected cipher suites](#cipher-suites)).

For the above reasons, recent release series of Erlang only enable latest supported
TLS version by default, as demonstrated in the below table.

<table>
  <thead>
    <tr>
      <td><strong>Erlang Series</strong></td>
      <td><strong>TLS Versions Enabled by Default</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>26.x</td>
      <td>TLSv1.3 (has a <a href="#tls1.3">dedicated section</a>) and TLSv1.2</td>
    </tr>
    <tr>
      <td>25.x</td>
      <td>TLSv1.3 (has a <a href="#tls1.3">dedicated section</a>) and TLSv1.2</td>
    </tr>
    <tr>
      <td>24.x</td>
      <td>TLSv1.3 (has a <a href="#tls1.3">dedicated section</a>) and TLSv1.2</td>
    </tr>
    <tr>
      <td>23.x</td>
      <td>TLSv1.3 (has a <a href="#tls1.3">dedicated section</a>) and TLSv1.2</td>
    </tr>
    <tr>
      <td>22.x</td>
      <td>TLSv1.2</td>
    </tr>
  </tbody>
</table>

Users of [older supported Erlang releases](./which-erlang.html)
are encouraged to limit supported TLS versions to 1.2 and later versions only, if possible.
Consider TLSv1.0 and TLSv1.1 to be **deprecated by the industry**.

### <a id="tls-versions-why-not-limit" class="anchor" href="#tls-versions-why-not-limit">Why Not Limit TLS Versions</a>

Limiting TLS versions to only TLSv1.3 or even only TLSv1.2 means that clients
that [support older TLS versions only](#tls-version-support-in-jdk-and-net) won't be able to connect.

If support for applications that use such old runtimes is important, the server must
be configured to support older versions of TLS. In most cases, supporting TLSv1.2
should be sufficient.

### <a id="tls-versions-server" class="anchor" href="#tls-versions-server"></a>

To limit enabled TLS protocol versions, use the `ssl_options.versions` setting.

The example below only accepts TLSv1.3 (the most recent and secure version),
and requires the node to be running on Erlang 23 compiled against a very recent OpenSSL.
Clients that use older runtimes (e.g. JDK, .NET, Python) without TLSv1.3 support
**will not be able to connect** with this setup.

<pre class="lang-ini">
listeners.ssl.1 = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem

ssl_options.versions.1 = tlsv1.3

# Limits enable cipher suites to only those used by TLSv1.3.
# There are no cipher suites supported by both TLSv1.3 and TLSv1.2.
ssl_options.ciphers.1  = TLS_AES_256_GCM_SHA384
ssl_options.ciphers.2  = TLS_AES_128_GCM_SHA256
ssl_options.ciphers.3  = TLS_CHACHA20_POLY1305_SHA256
ssl_options.ciphers.4  = TLS_AES_128_CCM_SHA256
ssl_options.ciphers.5  = TLS_AES_128_CCM_8_SHA256
</pre>

The example below disables versions older than TLSv1.2:

<pre class="lang-ini">
listeners.ssl.1 = 5671
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem

ssl_options.versions.1 = tlsv1.2
</pre>

### <a id="verifying-tls-versions" class="anchor" href="#verifying-tls-versions">Verifying Enabled TLS Versions</a>

To verify provided TLS versions, [use `openssl s_client`](https://www.feistyduck.com/library/openssl-cookbook/online/ch-testing-with-openssl.html)
with an [appropriate TLS version flag](https://www.openssl.org/docs/man1.1.1/man1/openssl-s_client.html):

<pre class="lang-bash">
# connect using TLSv1.3
openssl s_client -connect 127.0.0.1:5671 -tls1_3
</pre>

and look for the following in the output:

<pre class="lang-plaintext">
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
</pre>

In the example below, TLSv1.2 is used:

<pre class="lang-bash">
# connect using TLSv1.2
openssl s_client -connect 127.0.0.1:5671 -tls1_2
</pre>

The protocol and negotiated cipher suite in the output would
look like so:

<pre class="lang-plaintext">
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-AES256-GCM-SHA384
</pre>


### <a id="tls1.3" class="anchor" href="#tls1.3">TLSv1.3</a>

[TLSv1.3](https://wiki.openssl.org/index.php/TLS1.3) is a major revision to the TLS protocol. It is the most recent
and secure option. Prior to [RabbitMQ `3.8.11`](./changelog.html), TLSv1.3 support was considered
experimental and was disabled.

TLSv1.3 support requires the node to be [running on Erlang 23](./which-erlang.html) compiled against a very recent OpenSSL.


Clients that use older runtimes (e.g. JDK, .NET, Python) without TLSv1.3 support
**will not be able to connect** to RabbitMQ nodes that are configured to only accept TLSv1.3 connections.

Because TLSv1.3 shares no cipher suites with earlier TLS versions, when enabling TLSv1.3,
list a set of TLSv1.3-specific cipher suites:

<pre class="lang-ini">
listeners.ssl.1 = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem

ssl_options.versions.1 = tlsv1.3

# Limits enable cipher suites to only those used by TLSv1.3.
# There are no cipher suites supported by both TLSv1.3 and TLSv1.2.
ssl_options.ciphers.1  = TLS_AES_256_GCM_SHA384
ssl_options.ciphers.2  = TLS_AES_128_GCM_SHA256
ssl_options.ciphers.3  = TLS_CHACHA20_POLY1305_SHA256
ssl_options.ciphers.4  = TLS_AES_128_CCM_SHA256
ssl_options.ciphers.5  = TLS_AES_128_CCM_8_SHA256
</pre>

Explicit cipher suite configuration may also be necessary on the client side.

To verify provided TLS versions, use `openssl s_client` as
[explained above](#verifying-tls-versions).

### <a id="tls-version-support-in-jdk-and-net" class="anchor" href="#tls-version-support-in-jdk-and-net">TLS Version Support Table for JDK and .NET</a>

Disabling TLSv1.0 limits the number of client platforms supported. Below is a table that
explains what TLS versions are supported by what JDK and .NET releases.

<table>
  <thead>
    <td>TLS version</td>
    <td>Minimum JDK version</td>
    <td>Minimum .NET version</td>
  </thead>
  <tr>
    <td>TLS 1.3</td>
    <td>JDK 8 <a href="https://www.oracle.com/java/technologies/javase/8u261-relnotes.html">starting with JDK8u261</a>, JDK 11+</td>
    <td><a href="https://github.com/dotnet/docs/issues/4675">.NET 4.7</a> on <a href="https://docs.microsoft.com/en-us/dotnet/framework/network-programming/tls">Windows versions that support TLSv1.3</a></td>
  </tr>
  <tr>
    <td>TLS 1.2</td>
    <td>JDK 7 (see <a href="http://docs.oracle.com/javase/7/docs/technotes/guides/security/SunProviders.html#SunJSSEProvider">Protocols</a>,
    <a href="http://docs.oracle.com/javase/8/docs/technotes/guides/security/enhancements-8.html">JDK 8 recommended</a></td>
    <td>.NET 4.5</td>
  </tr>
  <tr>
    <td>TLS 1.1</td>
    <td>JDK 7 (see <a href="http://docs.oracle.com/javase/7/docs/technotes/guides/security/SunProviders.html#SunJSSEProvider">Protocols</a>,
    <a href="http://docs.oracle.com/javase/8/docs/technotes/guides/security/enhancements-8.html">JDK 8 recommended</a></td>
    <td>.NET 4.5</td>
  </tr>
</table>

Oracle JDK has a [public roadmap on cryptography](https://java.com/en/jre-jdk-cryptoroadmap.html) and related standards
that outlines when certain cipher suites or TLS versions will be deprecated or removed.

## <a id="key-usage" class="anchor" href="#key-usage">Public Key Usage Options</a>

Public keys (certificates) have a number of fields that describe the intended usage scenarios for the key.
The fields limit how the key is allowed to be used by various tools.
For example, a public key can be used to verify certificate signatures (act as a [Certificate Authority](#certificates-and-keys) key).

These fields also have effects on what [cipher suites](#cipher-suites) will be used by RabbitMQ nodes
and clients during connection negotiation (more specifically, the TLS handshake),
so it is important to explain what the effects are.

This guide will cover them with some intentional oversimplification. Broadly speaking, the fields fall into one of three categories:

 * [keyUsage](https://tools.ietf.org/html/rfc5280#section-4.2.1.3)
 * [Basic Constraints](https://tools.ietf.org/html/rfc5280#section-4.2.1.9)
 * [extendedKeyUsage](https://tools.ietf.org/html/rfc5280#section-4.2.1.12)

Some fields are boolean values, others are of different types such as a set of options (bits) that can be set or unset.

Data services are largely agnostic to the constraints and key usage options used. However, some are essential
to the use cases described in this guide:

 * Server authentication (provide server node's identity to the client)
 * Client authentication (provide client's identity to the server)
 * Verification of digital signatures
 * Key encipherment

The first two options are used for [peer verification](#peer-verification). They must be set for the server and client certificates,
respectively, at public key generation time. A certificate can have both options set at the same time.

[tls-gen](#automated-certificate-generation) will make sure that these constraints and extensions are correctly set.
When [generating certificates manually](#manual-certificate-generation), this is a responsibility of
the operator that generates the key pairs, or a key pair provider.

### <a id="key-usage-effects-on-cipher-suites" class="anchor" href="#key-usage-effects-on-cipher-suites">Extensions and Their Effect on Accepted Cipher Suites (Cipher Suite Filtering)</a>

Two key extensions are critically important for two major types of [cipher suites](#cipher-suites):

 * `digitalSignature` for ECC (Elliptic Curve Cryptography)-based suites
 * `keyEncipherment` for RSA-based suites

It is highly recommended that both of the above options (bits) are set for certificates that will
be used by both RabbitMQ nodes and client libraries. If those bits are not set, TLS implementations
will leave out an entire class of cipher suites from consideration, potentially resulting in confusing
"no suitable cipher suite found" alerts (error messages) at connection time.

### Examining Certificate Extensions

To see what constraints and extensions are set for a public key, use the `openssl x509` command:

<pre class="lang-bash">
openssl x509 -in /path/to/certificate.pem -text -noout
</pre>

Its output will include a nested list of extensions and constraints that looks similar to this:

<pre class="lang-ini">
X509v3 extensions:
    X509v3 Basic Constraints:
        CA:FALSE
    X509v3 Key Usage:
        Digital Signature, Key Encipherment
    X509v3 Extended Key Usage:
        TLS Web Client Authentication
</pre>

The above set of extensions says that this is a public key that can be used to authenticate
a client (provide a client identity to a RabbitMQ node), cannot be used as a Certificate Authority
certificate and can be used for key encipherment and digital signature.

For the purpose of this guide, this is a suitable certificate (public key) to be used for client connections.

Below is an example of a public key suitable certificate for server authentication (provides a RabbitMQ node identity)
as well as client authentication (perhaps for the sake of usability):

<pre class="lang-ini">
X509v3 extensions:
    X509v3 Basic Constraints:
        CA:FALSE
    X509v3 Key Usage:
        Digital Signature, Key Encipherment
    X509v3 Extended Key Usage:
        TLS Web Server Authentication, TLS Web Client Authentication
</pre>


## <a id="cipher-suites" class="anchor" href="#cipher-suites">Cipher Suites</a>

It is possible to configure what cipher suites will be used by RabbitMQ. Note that not all
suites will be available on all systems. For example, to use Elliptic curve ciphers,
a recent [supported Erlang release](./which-erlang.html) must be used.

What cipher suites RabbitMQ nodes and clients used can also be effectively limited by the [public key usage fields](#key-usage)
and their values. It is important to make sure that those key usage options are acceptable before proceeding
with cipher suite configuration.

### <a id="available-cipher-suites" class="anchor" href="#available-cipher-suites">Listing Cipher Suites Available on a RabbitMQ Node</a>

To list cipher suites supported by the Erlang runtime of a running node, use `rabbitmq-diagnostics cipher_suites --format openssl`:

<pre class="lang-ini">
rabbitmq-diagnostics cipher_suites --format openssl -q
</pre>

This will produce a list of cipher suites in the OpenSSL format.

Note that if you use `--format erlang`:

<pre class="lang-ini">
rabbitmq-diagnostics cipher_suites --format erlang -q
</pre>

then `rabbitmq-diagnostics cipher_suites` will list cipher suites in the format
that's only accepted in the [classic config format](./configure.html#erlang-term-config-file). The OpenSSL format is accepted
by both config formats. Note that cipher suites are not enquoted in the new style config format
but double quotes are required in the classic format.

The cipher suites listed by the above command are in formats that can be used for inbound and outgoing (e.g. [Shovel](shovel.html), [Federation](federation.html))
client TLS connections. They are different from those used by [configuration value encryption](./configure.html#configuration-encryption).

When overriding cipher suites, it is highly recommended
that server-preferred [cipher suite ordering is enforced](#cipher-suite-order).

### <a id="configuring-cipher-suites" class="anchor" href="#configuring-cipher-suites">Configuring Cipher Suites</a>

Cipher suites are configured using the `ssl_options.ciphers` config option (`rabbit.ssl_options.ciphers`
in the classic config format).

The below example demonstrates how the option is used.

<pre class="lang-ini">
listeners.ssl.1 = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.versions.1 = tlsv1.2

ssl_options.verify = verify_peer
ssl_options.fail_if_no_peer_cert = false

ssl_options.ciphers.1  = ECDHE-ECDSA-AES256-GCM-SHA384
ssl_options.ciphers.2  = ECDHE-RSA-AES256-GCM-SHA384
ssl_options.ciphers.3  = ECDH-ECDSA-AES256-GCM-SHA384
ssl_options.ciphers.4  = ECDH-RSA-AES256-GCM-SHA384
ssl_options.ciphers.5  = DHE-RSA-AES256-GCM-SHA384
ssl_options.ciphers.6  = DHE-DSS-AES256-GCM-SHA384
ssl_options.ciphers.7  = ECDHE-ECDSA-AES128-GCM-SHA256
ssl_options.ciphers.8  = ECDHE-RSA-AES128-GCM-SHA256
ssl_options.ciphers.9  = ECDH-ECDSA-AES128-GCM-SHA256
ssl_options.ciphers.10 = ECDH-RSA-AES128-GCM-SHA256
ssl_options.ciphers.11 = DHE-RSA-AES128-GCM-SHA256
ssl_options.ciphers.12 = DHE-DSS-AES128-GCM-SHA256

# these MUST be disabled if TLSv1.3 is used
ssl_options.honor_cipher_order = true
ssl_options.honor_ecc_order    = true
</pre>

In the [classic config format](./configure.html#erlang-term-config-file):

<pre class="lang-erlang">
%% list allowed ciphers
[
 {ssl, [{versions, ['tlsv1.2', 'tlsv1.1']}]},
 {rabbit, [
           {ssl_listeners, [5671]},
           {ssl_options, [{cacertfile,"/path/to/ca_certificate.pem"},
                          {certfile,  "/path/to/server_certificate.pem"},
                          {keyfile,   "/path/to/server_key.pem"},
                          {versions, ['tlsv1.2', 'tlsv1.1']},
                          %% This list is just an example!
                          %% Not all cipher suites are available on all machines.
                          %% Cipher suite order is important: preferred suites
                          %% should be listed first.
                          %% Different suites have different security and CPU load characteristics.
                          {ciphers,  [
                            "ECDHE-ECDSA-AES256-GCM-SHA384",
                            "ECDHE-RSA-AES256-GCM-SHA384",
                            "ECDH-ECDSA-AES256-GCM-SHA384",
                            "ECDH-RSA-AES256-GCM-SHA384",
                            "DHE-RSA-AES256-GCM-SHA384",
                            "DHE-DSS-AES256-GCM-SHA384",
                            "ECDHE-ECDSA-AES128-GCM-SHA256",
                            "ECDHE-RSA-AES128-GCM-SHA256",
                            "ECDH-ECDSA-AES128-GCM-SHA256",
                            "ECDH-RSA-AES128-GCM-SHA256",
                            "DHE-RSA-AES128-GCM-SHA256",
                            "DHE-DSS-AES128-GCM-SHA256"
                            ]}
                         ]}
          ]}
].
</pre>

### <a id="cipher-suite-order" class="anchor" href="#cipher-suite-order">Cipher Suite Order</a>

During TLS connection negotiation, the server and the client negotiate
what cipher suite will be used. It is possible to force server's TLS
implementation to dictate its preference (cipher suite order) to avoid
malicious clients that intentionally negotiate weak cipher suites in
preparation for running an attack on them.
To do so, configure `honor_cipher_order`
and `honor_ecc_order` to `true`:

<pre class="lang-ini">
listeners.ssl.1        = 5671
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.versions.1 = tlsv1.2

ssl_options.honor_cipher_order = true
ssl_options.honor_ecc_order    = true
</pre>

Or, in the classic config format:

<pre class="lang-erlang">
%% Enforce server-provided cipher suite order (preference)
[
 {ssl, [{versions, ['tlsv1.2', 'tlsv1.1']}]},
 {rabbit, [
           {ssl_listeners, [5671]},
           {ssl_options, [{cacertfile, "/path/to/ca_certificate.pem"},
                          {certfile,   "/path/to/server_certificate.pem"},
                          {keyfile,    "/path/to/server_key.pem"},
                          {versions,   ['tlsv1.2', 'tlsv1.1']},

                          %% ...


                          {honor_cipher_order,   true},
                          {honor_ecc_order,      true},
                         ]}
          ]}
].
</pre>


## <a id="major-vulnerabilities" class="anchor" href="#major-vulnerabilities">Known TLS Vulnerabilities and Their Mitigation</a>

#### ROBOT

[ROBOT attack](https://robotattack.org/) affects RabbitMQ installations that rely on RSA
cipher suites and run on Erlang/OTP versions prior to
19.3.6.4 and 20.1.7. To mitigate, [upgrade Erlang/OTP](./which-erlang.html) to a patched version
and consider [limiting the list of supported cipher suites](#cipher-suites).

#### POODLE

[POODLE](https://www.openssl.org/~bodo/ssl-poodle.pdf) is a known SSL/TLS attack that originally compromised SSLv3.
Starting with version 3.4.0, RabbitMQ server refuses to accept SSLv3 connections. In December 2014, a modified version of
the POODLE attack that affects TLSv1.0 was [announced](https://www.imperialviolet.org/2014/12/08/poodleagain.html).
It is therefore recommended to either run Erlang 18.0 or later, which
[eliminates TLS 1.0 implementation vulnerability to POODLE](http://www.erlang.org/news/88),
or [disable TLSv1.0 support](#disabling-tls-versions).

#### BEAST

[BEAST attack](http://en.wikipedia.org/wiki/Transport_Layer_Security#BEAST_attack) is a known vulnerability that
affects TLSv1.0. To mitigate it, [disable TLSv1.0 support](#disabling-tls-versions).


## <a id="tls-evaluation-tools" class="anchor" href="#tls-evaluation-tools">Evaluating TLS Setup Security</a>

Because TLS has many configurable parameters
and some of them have suboptimal defaults for historical
reasons, TLS setup security evaluation is a recommended practice.
Multiple tools exist that perform various tests on TLS-enabled
server endpoints, for example, testing whether it is prone
to known attacks such as POODLE, BEAST, and others.

### <a id="testssl-sh" class="anchor" href="#testssl-sh">testssl.sh</a>

[testssl.sh](https://testssl.sh/) is a mature and extensive TLS endpoint testing
tool. It can be used with protocol endpoints that do not serve HTTPS.

The tool performs many tests (for instance, on some machines it runs
over 350 cipher suite tests alone) and passing every single one may or may not
make sense for every environment. For example, many production deployments
do not use CRLs (Certificate Revocation Lists); most development environments
use self-signed certificates and don't have to worry about
the most optimal set of cipher suites enabled; and so on.

To run `testssl.sh`, provide an endpoint to test in the form of `{hostname}:5671`:

<pre class="lang-bash">
./testssl.sh localhost:5671
</pre>

The following example configuration that accepts TLSv1.3 connections passes key
`testssl.sh` tests on Erlang 23:

<pre class="lang-ini">
listeners.ssl.1 = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem

ssl_options.versions.1 = tlsv1.3

ssl_options.verify               = verify_peer
ssl_options.fail_if_no_peer_cert = true

ssl_options.ciphers.1  = TLS_AES_256_GCM_SHA384
ssl_options.ciphers.2  = TLS_AES_128_GCM_SHA256
ssl_options.ciphers.3  = TLS_CHACHA20_POLY1305_SHA256
ssl_options.ciphers.4  = TLS_AES_128_CCM_SHA256
ssl_options.ciphers.5  = TLS_AES_128_CCM_8_SHA256

ssl_options.honor_cipher_order   = true
ssl_options.honor_ecc_order      = true
</pre>

This TLSv1.3-exclusive setup is reported as not vulnerable:

<pre class="lang-ini">
 Service detected:       Couldn't determine what's running on port 5671, assuming no HTTP service => skipping all HTTP checks


 Testing protocols via sockets except NPN+ALPN

 SSLv2      not offered (OK)
 SSLv3      not offered (OK)
 TLS 1      not offered
 TLS 1.1    not offered
 TLS 1.2    not offered
 TLS 1.3    offered (OK): final
 NPN/SPDY   not offered
 ALPN/HTTP2 not offered

 Testing cipher categories

 NULL ciphers (no encryption)                      not offered (OK)
 Anonymous NULL Ciphers (no authentication)        not offered (OK)
 Export ciphers (w/o ADH+NULL)                     not offered (OK)
 LOW: 64 Bit + DES, RC[2,4], MD5 (w/o export)      not offered (OK)
 Triple DES Ciphers / IDEA                         not offered
 Obsoleted CBC ciphers (AES, ARIA etc.)            not offered
 Strong encryption (AEAD ciphers) with no FS       not offered
 Forward Secrecy strong encryption (AEAD ciphers)  offered (OK)


 Testing server's cipher preferences

 Has server cipher order?     yes (TLS 1.3 only)
 Negotiated protocol          TLSv1.3
 Negotiated cipher            TLS_AES_256_GCM_SHA384, 253 bit ECDH (X25519)
 Cipher per protocol

Hexcode  Cipher Suite Name (OpenSSL)       KeyExch.   Encryption  Bits     Cipher Suite Name (IANA/RFC)
-----------------------------------------------------------------------------------------------------------------------------
SSLv2
 -
SSLv3
 -
TLSv1
 -
TLSv1.1
 -
TLSv1.2
 -
TLSv1.3 (server order)
 x1302   TLS_AES_256_GCM_SHA384            ECDH 253   AESGCM      256      TLS_AES_256_GCM_SHA384
 x1301   TLS_AES_128_GCM_SHA256            ECDH 253   AESGCM      128      TLS_AES_128_GCM_SHA256
 x1303   TLS_CHACHA20_POLY1305_SHA256      ECDH 253   ChaCha20    256      TLS_CHACHA20_POLY1305_SHA256
 x1304   TLS_AES_128_CCM_SHA256            ECDH 253   AESCCM      128      TLS_AES_128_CCM_SHA256
 x1305   TLS_AES_128_CCM_8_SHA256          ECDH 253   AESCCM8     128      TLS_AES_128_CCM_8_SHA256


 Testing robust forward secrecy (FS) -- omitting Null Authentication/Encryption, 3DES, RC4

 FS is offered (OK)           TLS_AES_256_GCM_SHA384 TLS_CHACHA20_POLY1305_SHA256 TLS_AES_128_GCM_SHA256 TLS_AES_128_CCM_SHA256 TLS_AES_128_CCM_8_SHA256
 Elliptic curves offered:     prime256v1 secp384r1 X25519 X448


 Testing server defaults (Server Hello)

 TLS extensions (standard)    "supported versions/#43" "key share/#51"
 Session Ticket RFC 5077 hint no -- no lifetime advertised
 SSL Session ID support       yes
 Session Resumption           Tickets no, ID resumption test failed
 TLS clock skew               -5 sec from localtime
 Client Authentication        none
 Signature Algorithm          SHA256 with RSA
 Server key size              RSA 2048 bits (exponent is 65537)
 Server key usage             Digital Signature, Key Encipherment
 Server extended key usage    TLS Web Server Authentication
 Serial / Fingerprints        01 / SHA1 7B1C27E995BA409F031CBE0827E017E0CE0B931A
                              SHA256 96338084641B5B29FF4E60C570AF5081175D9BDD89EB28FFA3CECE96A995CC8E
 Common Name (CN)             warp10
 subjectAltName (SAN)         warp10 warp10.local localhost
 Trust (hostname)             Ok via SAN (same w/o SNI)
 Chain of trust               NOT ok (self signed CA in chain)
 EV cert (experimental)       no
 Certificate Validity (UTC)   3611 >= 60 days (2021-01-06 17:43 --> 2031-01-04 17:43)
                              >= 10 years is way too long
 ETS/"eTLS", visibility info  not present
 Certificate Revocation List  --
 OCSP URI                     --
                              NOT ok -- neither CRL nor OCSP URI provided
 OCSP stapling                not offered
 OCSP must staple extension   --
 DNS CAA RR (experimental)    not offered
 Certificate Transparency     N/A
 Certificates provided        2
 Issuer                       TLSGenSelfSignedtRootCA
 Intermediate cert validity   #1: ok &gt; 40 days (2031-01-04 17:43).
 Intermediate Bad OCSP (exp.) Ok


 Testing vulnerabilities

 Heartbleed (CVE-2014-0160)                not vulnerable (OK), no heartbeat extension
 CCS (CVE-2014-0224)                       not vulnerable (OK)
 Ticketbleed (CVE-2016-9244), experiment.  --   (applicable only for HTTPS)
 ROBOT                                     Server does not support any cipher suites that use RSA key transport
 Secure Renegotiation (RFC 5746)           not vulnerable (OK)
 Secure Client-Initiated Renegotiation     not vulnerable (OK)
 CRIME, TLS (CVE-2012-4929)                not vulnerable (OK)
 POODLE, SSL (CVE-2014-3566)               not vulnerable (OK), no SSLv3 support
 TLS_FALLBACK_SCSV (RFC 7507)              No fallback possible (OK), TLS 1.3 is the only protocol
 SWEET32 (CVE-2016-2183, CVE-2016-6329)    not vulnerable (OK)
 FREAK (CVE-2015-0204)                     not vulnerable (OK)
 DROWN (CVE-2016-0800, CVE-2016-0703)      not vulnerable on this host and port (OK)
                                           make sure you don't use this certificate elsewhere with SSLv2 enabled services
                                           https://censys.io/ipv4?q=96338084641B5B29FF4E60C570AF5081175D9BDD89EB28FFA3CECE96A995CC8E could help you to find out
 LOGJAM (CVE-2015-4000), experimental      not vulnerable (OK): no DH EXPORT ciphers, no DH key detected with &lt;= TLS 1.2
 BEAST (CVE-2011-3389)                     not vulnerable (OK), no SSL3 or TLS1
 LUCKY13 (CVE-2013-0169), experimental     not vulnerable (OK)
 Winshock (CVE-2014-6321), experimental    not vulnerable (OK)
 RC4 (CVE-2013-2566, CVE-2015-2808)        not vulnerable (OK)

Could not determine the protocol, only simulating generic clients.

 Running client simulations via sockets

 Browser                      Protocol  Cipher Suite Name (OpenSSL)       Forward Secrecy
------------------------------------------------------------------------------------------------
 Android 8.1 (native)         No connection
 Android 9.0 (native)         TLSv1.3   TLS_AES_256_GCM_SHA384            253 bit ECDH (X25519)
 Android 10.0 (native)        TLSv1.3   TLS_AES_256_GCM_SHA384            253 bit ECDH (X25519)
 Java 6u45                    No connection
 Java 7u25                    No connection
 Java 8u161                   No connection
 Java 11.0.2 (OpenJDK)        TLSv1.3   TLS_AES_256_GCM_SHA384            256 bit ECDH (P-256)
 Java 12.0.1 (OpenJDK)        TLSv1.3   TLS_AES_256_GCM_SHA384            256 bit ECDH (P-256)
 OpenSSL 1.0.2e               No connection
 OpenSSL 1.1.0l (Debian)      No connection
 OpenSSL 1.1.1d (Debian)      TLSv1.3   TLS_AES_256_GCM_SHA384            253 bit ECDH (X25519)
</pre>

The following example configuration that accepts TLSv1.2 connections passes key
`testssl.sh` tests on Erlang 23:

<pre class="lang-ini">
listeners.ssl.default  = 5671
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.versions.1 = tlsv1.2

ssl_options.verify               = verify_peer
ssl_options.fail_if_no_peer_cert = false

ssl_options.honor_cipher_order   = true
ssl_options.honor_ecc_order      = true

# These are highly recommended for TLSv1.2 but cannot be used
# with TLSv1.3. If TLSv1.3 is enabled, these lines MUST be removed.
ssl_options.client_renegotiation = false
ssl_options.secure_renegotiate   = true

ssl_options.ciphers.1  = ECDHE-ECDSA-AES256-GCM-SHA384
ssl_options.ciphers.2  = ECDHE-RSA-AES256-GCM-SHA384
ssl_options.ciphers.3  = ECDH-ECDSA-AES256-GCM-SHA384
ssl_options.ciphers.4  = ECDH-RSA-AES256-GCM-SHA384
ssl_options.ciphers.5  = DHE-RSA-AES256-GCM-SHA384
ssl_options.ciphers.6  = DHE-DSS-AES256-GCM-SHA384
ssl_options.ciphers.7  = ECDHE-ECDSA-AES128-GCM-SHA256
ssl_options.ciphers.8  = ECDHE-RSA-AES128-GCM-SHA256
ssl_options.ciphers.9  = ECDH-ECDSA-AES128-GCM-SHA256
ssl_options.ciphers.10 = ECDH-RSA-AES128-GCM-SHA256
ssl_options.ciphers.11 = DHE-RSA-AES128-GCM-SHA256
ssl_options.ciphers.12 = DHE-DSS-AES128-GCM-SHA256
</pre>

This TLSv1.2-enabled setup is reported as not vulnerable to a set of known
high profile vulnerabilities:

<pre class="lang-ini">
Testing robust (perfect) forward secrecy, (P)FS -- omitting Null Authentication/Encryption, 3DES, RC4

PFS is offered (OK)          ECDHE-RSA-AES256-GCM-SHA384 DHE-RSA-AES256-GCM-SHA384 ECDHE-RSA-AES128-GCM-SHA256 DHE-RSA-AES128-GCM-SHA256
Elliptic curves offered:     sect163k1 sect163r1 sect163r2 sect193r1 sect193r2 sect233k1 sect233r1 sect239k1 sect283k1 sect283r1 sect409k1
                             sect409r1 sect571k1 sect571r1 secp160k1 secp160r1 secp160r2 secp192k1 prime192v1 secp224k1 secp224r1 secp256k1
                             prime256v1 secp384r1 secp521r1 brainpoolP256r1 brainpoolP384r1 brainpoolP512r1


Testing vulnerabilities

Heartbleed (CVE-2014-0160)                not vulnerable (OK), no heartbeat extension
CCS (CVE-2014-0224)                       not vulnerable (OK)
Ticketbleed (CVE-2016-9244), experiment.  --   (applicable only for HTTPS)
Secure Renegotiation (CVE-2009-3555)      not vulnerable (OK)
Secure Client-Initiated Renegotiation     not vulnerable (OK)
CRIME, TLS (CVE-2012-4929)                not vulnerable (OK) (not using HTTP anyway)
POODLE, SSL (CVE-2014-3566)               not vulnerable (OK)
TLS_FALLBACK_SCSV (RFC 7507)              No fallback possible, TLS 1.2 is the only protocol (OK)
SWEET32 (CVE-2016-2183, CVE-2016-6329)    not vulnerable (OK)
FREAK (CVE-2015-0204)                     not vulnerable (OK)
DROWN (CVE-2016-0800, CVE-2016-0703)      not vulnerable on this host and port (OK)
                                          make sure you don't use this certificate elsewhere with SSLv2 enabled services
                                          https://censys.io/ipv4?q=5E878E40541CC37F88A0A1BA395FA95EA1EC68373FAC512D54C329F031BA443D could help you to find out
LOGJAM (CVE-2015-4000), experimental      Common prime with 2048 bits detected: RFC3526/Oakley Group 14,
                                          but no DH EXPORT ciphers
BEAST (CVE-2011-3389)                     no SSL3 or TLS1 (OK)
LUCKY13 (CVE-2013-0169), experimental     not vulnerable (OK)
RC4 (CVE-2013-2566, CVE-2015-2808)        no RC4 ciphers detected (OK)
</pre>


## <a id="erlang-client" class="anchor" href="#erlang-client">Using TLS in the Erlang Client</a>

Enabling TLS in the RabbitMQ Erlang client is similar to configuring other
settings related to networking. The `#amqp_params_network` record
provides a field, `ssl_options`, for all the [standard Erlang TLS options](http://erlang.org/doc/man/ssl.html).

### <a id="erlang-ssl" class="anchor" href="#erlang-ssl">Erlang TLS Options</a>

The three important options which must be supplied are:

 * The `cacertfile` option specifies the certificates of the root
   Certificate Authorities that we wish to implicitly trust.
 * The `certfile` is the client's own certificate in PEM format
 * The `keyfile` is the client's private key file in PEM format

`server_name_indication` - set this option to the host name of the server
to which a TLS connection will be made to enable "Server Name Indication" verification
of the certificate presented by the server. This ensures that the server certificate's
`CN=` value will be verified during TLS connection establishment. You can
override this behavior by setting `server_name_indication` to a different
host name or to the special value `disable` to disable this
verification. Note that, by default, SNI is <b>not</b> enabled. This default
will change in a future RabbitMQ Erlang client release.

`verify` - set this option to `verify_peer` to enable X509
certificate chain verification. The `depth` option configures certificate
verification depth. Note that, by default, `verify` is set to
`verify_none`, which disables certificate chain verification. This default
will change in a future RabbitMQ Erlang client release.

### <a id="erlang-code-example" class="anchor" href="#erlang-code-example">Code Example</a>

<pre class="lang-erlang">
SslOpts = [{cacertfile, &quot;/path/to/ca_certificate.pem&quot;},
           {certfile, &quot;/path/to/client/certificate.pem&quot;},
           {keyfile, &quot;/path/to/client/private_key.pem&quot;},

           %% only necessary with intermediate CAs
           %% {depth, 2},

           %% Note: it is recommended to set 'verify' to
           %% to 'verify_peer' to ensure that X509
           %% certificate chain validation is enabled
           %%
           %% Do not set 'verify' or set it to verify_none
           %% if x509 certificate chain validation is
           %% not desired
           {verify, verify_peer},

           %% If Server Name Indication validation is desired,
           %% set the following option to the host name to which
           %% the connection is made. If necessary, this option
           %% may be set to another host name to match the server
           %% certificate's CN= value.
           %% Do not set this option or set it to the atom 'disable'
           %% to disable SNI validation
           {server_name_indication, "my.rmq-server.net"}],

Params = #amqp_params_network{host = "my.rmq-server.net",
                              port = 5671,
                              ssl_options = SslOpts}

{ok, Conn} = amqp_connection:start(Params),
</pre>

You can now go ahead and use Conn as a normal connection.


## <a id="manual-certificate-generation" class="anchor" href="#manual-certificate-generation">Manually Generating a CA, Certificates and Private Keys</a>

This section of the guide explains how to generate a Certificate Authority and
use it to generate and sign two certificate/key pairs, one for the server and one for
client libraries. Note that the process can be [automated using
existing tools](#automated-certificate-generation), which is recommended. This section is intended for those who would like to improve their understanding
of the process, OpenSSL command line tools and some important aspects of OpenSSL configuration.

This guide assumes a UNIX-like operating system (Linux, MacOS, a BSD variant and so on)
and a recent version of OpenSSL available in `PATH`.

First let's create a directory for our test Certificate Authority:

<pre class="lang-bash">
mkdir testca
cd testca
mkdir certs private
chmod 700 private
echo 01 &gt; serial
touch index.txt
</pre>

Now add the following OpenSSL configuration file, `openssl.cnf`, within the newly created `testca`
directory:

<pre class="lang-ini">
[ ca ]
default_ca = testca

[ testca ]
dir = .
certificate = $dir/ca_certificate.pem
database = $dir/index.txt
new_certs_dir = $dir/certs
private_key = $dir/private/ca_private_key.pem
serial = $dir/serial

default_crl_days = 7
default_days = 365
default_md = sha256

policy = testca_policy
x509_extensions = certificate_extensions

[ testca_policy ]
commonName = supplied
stateOrProvinceName = optional
countryName = optional
emailAddress = optional
organizationName = optional
organizationalUnitName = optional
domainComponent = optional

[ certificate_extensions ]
basicConstraints = CA:false

[ req ]
default_bits = 2048
default_keyfile = ./private/ca_private_key.pem
default_md = sha256
prompt = yes
distinguished_name = root_ca_distinguished_name
x509_extensions = root_ca_extensions

[ root_ca_distinguished_name ]
commonName = hostname

[ root_ca_extensions ]
basicConstraints = CA:true
keyUsage = keyCertSign, cRLSign

[ client_ca_extensions ]
basicConstraints = CA:false
keyUsage = digitalSignature,keyEncipherment
extendedKeyUsage = 1.3.6.1.5.5.7.3.2

[ server_ca_extensions ]
basicConstraints = CA:false
keyUsage = digitalSignature,keyEncipherment
extendedKeyUsage = 1.3.6.1.5.5.7.3.1
</pre>

Next we need to generate the key and certificates that our test
Certificate Authority will use. Still within the `testca`
directory:

<pre class="lang-bash">
openssl req -x509 -config openssl.cnf -newkey rsa:2048 -days 365 \
    -out ca_certificate.pem -outform PEM -subj /CN=MyTestCA/ -nodes
openssl x509 -in ca_certificate.pem -out ca_certificate.cer -outform DER
</pre>

This is all that is needed to generate a test Certificate
Authority. The root certificate is in `ca_certificate.pem`
and is also in `testca/ca_certificate.cer`. These two files contain the
same information, but in different formats, PEM and DER.
Most software uses the former but some tools require the latter.

Having set up our Certificate Authority, we now need to generate
private keys and certificates for the clients and the server.
RabbitMQ broker uses certificates and private keys in the PEM format.
Some client libraries use the PEM format, others will require conversion
to a different format (e.g. PKCS#12).

Java and .NET clients use a certificate format called PKCS#12 and custom certificate stores.
Certificate store contains both the client's certificate and key. The PKCS store is usually password protected, and so that
a password must be provided.

The process for creating server and client certificates is very
similar. First the server:

<pre class="lang-bash">
cd ..
ls
# => testca
mkdir server
cd server
openssl genrsa -out private_key.pem 2048
openssl req -new -key private_key.pem -out req.pem -outform PEM \
    -subj /CN=$(hostname)/O=server/ -nodes
cd ../testca
openssl ca -config openssl.cnf -in ../server/req.pem -out \
    ../server/server_certificate.pem -notext -batch -extensions server_ca_extensions
cd ../server
openssl pkcs12 -export -out server_certificate.p12 -in server_certificate.pem -inkey private_key.pem \
    -passout pass:MySecretPassword
</pre>

And now the client:

<pre class="lang-bash">
cd ..
ls
# => server testca
mkdir client
cd client
openssl genrsa -out private_key.pem 2048
openssl req -new -key private_key.pem -out req.pem -outform PEM \
    -subj /CN=$(hostname)/O=client/ -nodes
cd ../testca
openssl ca -config openssl.cnf -in ../client/req.pem -out \
    ../client/client_certificate.pem -notext -batch -extensions client_ca_extensions
cd ../client
openssl pkcs12 -export -out client_certificate.p12 -in client_certificate.pem -inkey private_key.pem \
    -passout pass:MySecretPassword
</pre>

The two examples above generate private keys that are 2048 bits in size.
It is possible to use longer (and thus more secure but also slower to generate)
keys by providing a different value to `openssl genrsa`, e.g.:

<pre class="lang-bash">
openssl genrsa -out private_key.pem 4096
</pre>

Another option would be to generate a key using [Elliptic Curve Cryptography](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-Elliptic-curve-cryptography/). Instead of `openssl genrsa` use
`openssl ecparam` like so:

<pre class="lang-bash">
openssl ecparam -out private_key.pem -genkey -name prime256v1
</pre>

`prime256v1` in the example above is an Elliptic curve name.
Different versions of OpenSSL will have a different set of curves available,
list them with `openssl ecparam -list_curves`.
