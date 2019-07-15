<!--
Copyright (c) 2007-2019 Pivotal Software, Inc.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache license,
Version 2.0 (the "license”); you may not use this file except in comptrance
with the license. You may obtain a copy of the license at

https://www.apache.org/licenses/license-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the license is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or imptred.
See the license for the specific language governing permissions and
limitations under the license.
-->

# TLS Support

## <a id="overview" class="anchor" href="#overview">Overview</a>

RabbitMQ has inbuilt support for TLS. This includes client connections and popular plugins, where applicable,
such as [Federation links](federation.html). It is also possible to use TLS
to [encrypt inter-node connections in clusters](clustering-ssl.html).

This guide covers various topics related to TLS in RabbitMQ:

 * Two [ways of using TLS](#tls-connectivity-options): direct or via a TLS terminating proxy
 * [Erlang/OTP requirements](#erlang-otp-requirements) for TLS support
 * [Enabling TLS](#enabling-tls) in RabbitMQ
 * How to generate self-signed certificates for development and QA environments [with tls-gen](#automated-certificate-generation) or [manually](#manual-certificate-generation)
 * TLS configuration in [Java](#java-client) and [.NET](#dotnet-client) clients
 * [Peer (certificate chain) verification](#peer-verification)
 * [TLS version](#tls-versions) and [cipher suite](#cipher-suites) configuration
 * Tools that can be used to [evaluate a TLS setup](#tls-evaluation-tools)
 * Known [attacks on TLS](#major-vulnerabilities) and their mitigation
 * How to use [private key passwords](#private-key-passwords)

and more. It tries to [explain the basics of TLS](#certificates-and-keys) but not, however, a primer on TLS, encryption, [public Key Infrastructure](https://en.wikipedia.org/wiki/public_key_infrastructure) and related topics, so the concepts are covered very briefly.

A number of beginner-oriented primers are available elsewhere on the Web:
[one](https://hpbn.co/transport-layer-security-tls/)
[two](https://blog.talpor.com/2015/07/ssltls-certificates-beginners-tutorial/),
[three](https://blogs.akamai.com/2016/03/enterprise-security---ssltls-primer-part-1---data-encryption.html),
[four](https://blogs.akamai.com/2016/03/enterprise-security---ssltls-primer-part-2---public-key-certificates.html).

TLS can be enabled for all protocols supported by RabbitMQ, not just AMQP 0-9-1,
which this guide focuses on. [HTTP API](/management.html), [inter-node and CLI tool traffic](/clustering-ssl.html) can be configured
to use TLS (HTTPS) as well.

For an overview of common TLS troubleshooting techniques, see [Troubleshooting TLS-related issues](troubleshooting-ssl.html)
and [Troubleshooting Networking](troubleshooting-networking.html).

### <a id="tls-connectivity-options" class="anchor" href="#tls-connectivity-options">Common Approaches to TLS for client Connections with RabbitMQ</a>

For client connections, there are two common approaches:

 * Configure RabbitMQ to handle TLS connections
 * Use a proxy or load balancer (such as [HAproxy](http://www.haproxy.org/))
   to perform [TLS termination](https://en.wikipedia.org/wiki/TLS_termination_proxy) of client connections and use plain TCP connections to RabbitMQ nodes.

Both approaches are valid and have pros and cons. This guide will focus on the
first option.

### <a id="erlang-otp-requirements" class="anchor" href="#erlang-otp-requirements">Erlang/OTP Requirements for TLS Support</a>

In order to support TLS connections, RabbitMQ needs TLS and
crypto-related modules to be available in the Erlang/OTP
installation. The recommended Erlang/OTP version to use with
TLS is the most recent [supported Erlang release](/which-erlang.html).
Earlier versions, even if they are supported, may work for most certificates
but have known limitations (see below).

The Erlang <code>asn1</code>, <code>crypto</code>,
<code>public_key</code>, and <code>ssl</code> libraries
(applications) must be installed and functional. On Debian and
Ubuntu this is provided by the [erlang-asn1](http://packages.ubuntu.com/search?keywords=erlang-asn1),
[erlang-crypto](http://packages.ubuntu.com/search?keywords=erlang-crypto), [erlang-public-key](http://packages.ubuntu.com/search?keywords=erlang-public-key), and
[erlang-ssl](http://packages.ubuntu.com/search?keywords=erlang-ssl) packages, respectively. The [zero dependency
Erlang RPM for RabbitMQ](https://github.com/rabbitmq/erlang-rpm) includes the above modules.

If Erlang/OTP is compiled from source, it is necessary to ensure that <code>configure</code>
finds OpenSSL and builds the above libraries.

When investigating TLS connectivity issues, please keep in mind that in the vast majority
of cases they are environment-specific (e.g. certificates are missing from the [trusted certificate store](#peer-verification-trusted-certificates))
and do not indicate a bug or limitation in Erlang/OTP's TLS implementation. Please go through the steps outlined
in the [Troubleshooting TLS guide](troubleshooting-ssl.html) to gather
more information first.

### <a id="known-compatibility-issues" class="anchor" href="#known-compatibility-issues">Known Incompatibilities and Limitations</a>

If Elliptic curve cryptography (ECC) cipher suites is
expected to be used, a recent [supported Erlang release](/which-erlang.html)
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
that the peer to mitigate against [Man-in-the-Middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack).
Both are accomplished using a set of roles, policies and procedures known as [public Key Infrastructure](https://en.wikipedia.org/wiki/public_key_infrastructure) (PKI).

A PKI is based on the concept of digital identities that can be cryptographically (mathematically) verified. Those identities are called
<em>certificates</em> or more precisely, <em>certificate/key pairs</em>. Every TLS-enabled server usually has its own certificate/key
pair that it uses to compute a connection-specific key that will be used to encrypt traffic sent on the connection. Also, if asked, it can present its certificate
(public key) to the connection peer. clients may or may not have their own certificates. In the context of messaging and tools such as RabbitMQ it is quite common for
clients to also use certificate/key pairs so that servers can validate their identity.

Certificate/key pairs are generated by tools such as OpenSSL and signed by entities called <em>[Certificate Authorities](https://en.wikipedia.org/wiki/Certificate_authority)</em> (CA).
CAs issue certificates that users (applications or other CAs) use. When a certificate is signed by a CA, they form a <em>chain of trust</em>. Such chains can include
more than one CA but ultimately sign a certificate/key pair used by an applications (a <em>leaf</em> or <em>end user</em> certificate).
Chains of CA certificates are usually distributed together in a single file. Such file is called a <em>CA bundle</em>.

Here's an example of the most basic chain with one root CA and one leaf (server or client) certificate:

<img class="figure" src="/img/root_ca_and_leaf.png" alt="Root CA and leaf certificates" />

A chain with intermediate certificates might look like this:

<img class="figure" src="/img/root_intermediate_ca_and_leaf.png" alt="Root CA, intermediate and leaf certificates" />

There are organizations that sign and issue certificate/key pairs. Most of them are widely trusted CAs and charge a fee for their services.

A TLS-enabled RabbitMQ node must have a set of Certificate Authority certificates it considers to be trusted in a file (a CA bundle),
a certificate (public key) file and a private key file. The files will be read from the local filesystem. They must be readable by the effective user
of the RabbitMQ node process.

Both ends of a TLS-enabled connection can optionally verify
the other end of the connection. While doing so, they try to locate a trusted Certificate Authority in the certificate list
presented by the peer. More on this in the [Peer Verification](#peer-verification) section.

This guides assumes the user has access to a Certificate Authority and two certificate/key pairs
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

This guides assumes the user has access to a CA certifica bundle file and two [certificate/key pairs](#certificates-and-keys).
The certificate/key pairs are used by RabbitMQ and clients that connect to the server on a
TLS-enabled port. The process of generating a Certificate Authority and two key pairs is fairly labourious
and can be error-prone. An easier way of generating all that
stuff on MacOS or Linux is with <a
href="https://github.com/michaelklishin/tls-gen">tls-gen</a>:
you will need <code>Python 3.5+</code>, <code>make</code> and <code>openssl</code>
in <code>PATH</code>.

Note that <code>tls-gen</code> and the certificate/key pairs
it generates are self-signed and only suitable for development
and test environments. The vast majority of production environments
should use certificates and keys issued by a widely trusted commercial
CA.

<code>tls-gen</code> supports RSA and [Elliptic Curve Cryptography](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-Elliptic-curve-cryptography/)
algorithms for key generation.

### <a id="automated-certificate-generation-transcript" class="anchor" href="#automated-certificate-generation-transcript">Using tls-gen's Basic Profile</a>

Below is an example that generates a CA and uses it to produce two certificate/key pairs, one
for the server and another for clients. This is the setup that is expected by the rest of this guide.

<pre class="lang-bash">
git clone https://github.com/michaelklishin/tls-gen tls-gen
cd tls-gen/basic
# private key password
make PASSWORD=bunnies
make verify
make info
ls -l ./result
</pre>

The certificate chain produced by this basic tls-gen profile looks like this:

<img class="figure" src="/img/root_ca_and_leaf.png" alt="Root CA and leaf certificates" />


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
      connections. RabbitMQ can listen on a <a href="/networking.html">single interface or multiple ones</a>.
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

The options are provided in the <a
href="configure.html#configuration-file">configuration
file</a>. An example of the config file is below, which
will start one TLS listener on port 5671 on all interfaces
on this hostname:

<pre class="lang-ini">
listeners.ssl.default = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert = false
</pre>

Below is the same example using the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
  {rabbit, [
     {ssl_listeners, [5671]},
     {ssl_options, [{cacertfile, "/path/to/ca_certificate.pem"},
                    {certfile,   "/path/to/server_certificate.pem"},
                    {keyfile,    "/path/to/server_key.pem"},
                    {verify,     verify_peer},
                    {fail_if_no_peer_cert, false}]}
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
path <code>c:\ca_certificate.pem</code> for the CA certificate you
would need to use <code>"c:\\ca_certificate.pem"</code> or <code>"c:/ca_certificate.pem"</code>.

### <a id="enabling-tls-verify-configuration" class="anchor" href="#enabling-tls-verify-configuration">How to Verify that TLS is Enabled</a>

To verify that TLS has been enabled on the node, restart it and inspect its [log file](/logging.html).
It should contain an entry about a TLS listener being enabled, looking like this:

<pre class="sourcecode">
2018-09-02 14:24:58.611 [info] &lt;0.664.0&gt; started TCP listener on [::]:5672
2018-09-02 14:24:58.614 [info] &lt;0.680.0&gt; started SSL listener on [::]:5671
</pre>

### <a id="private-key-passwords" class="anchor" href="#private-key-passwords">Providing Private Key Password</a>

Private keys can be optional protected by a password.
To provide the password, use the <code>password</code> option:

<pre class="lang-ini">
listeners.ssl.1 = 5671
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.password   = t0p$3kRe7
</pre>

The same example using the [classic config format](/configure.html#erlang-term-config-file):

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

Classic config file format allows for [config value encryption](http://www.rabbitmq.com/configure.html#configuration-encryption),
which is recommended for passwords.

## <a id="peer-verification" class="anchor" href="#peer-verification">TLS Peer Verification: Who Do You Say You Are?</a>

As mentioned in the [Certificates and Keys](#certificates-and-keys) section, TLS has two
primary purposes: encrypting connection traffic and providing a way to verify
that the peer can be trusted (e.g. signed by a trusted Certificate Authority)
to mitigate against [Man-in-the-Middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack),
a class of attacks where an attacker impersonates a legitimate trusted client. This section will focus
on the latter.

### <a id="peer-verification-how-it-works" class="anchor" href="#peer-verification-how-it-works">How Peer Verification Works</a>

When a TLS connection is established client and server perform connection negotiation that takes several steps.
The first step is when the peers <em>optionally</em> exchange their
[certificates](#certificates-and-keys).
Having exchanged certificates, the peers can <em class="">optionally</em> attempt
to establish a chain of trust between their CA
certificates and the certificates presented. This acts to verify that
the peer is who it claims to be (provided the private key hasn't been
stolen). The process is known as peer verification or peer validation
and follows an algorithm known as the [Certification path validation algorithm](https://en.wikipedia.org/wiki/Certification_path_validation_algorithm).
Understanding the entire algorithm is not necessary in order to use peer verification,
so this section provides an oversimplified explanation of the key parts.

Each peer provides a <em>chain of certificates</em> that begins with a "leaf"
(client or server) certificate and continues with at least one Certificate Authority (CA) certificate. That
CA issued (signed) the leaf CA. If there are multiple CA certificates, they usually form a chain of signatures,
meaning that each CA certificate was signed by the next one. For example, if certificate B is signed by A and C is signed by B,
the chain is <code>A, B, C</code> (commas here are used for clarify). The "topmost" (first or only) CA is often referred
to as the <em>root CA</em> for the chain. Root CAs can be issued by well-known Certifica Authorities
(commercial vendors) or any other party ([self-signed](https://en.wikipedia.org/wiki/Self-signed_certificate)).

Here's an example of the most basic chain with one root CA and one leaf (server or client) certificate:

<img class="figure" src="/img/root_ca_and_leaf.png" alt="Root CA and leaf certificates" />

A chain with intermediate certificates might look like this:

<img class="figure" src="/img/root_intermediate_ca_and_leaf.png" alt="Root CA, intermediate and leaf certificates" />

During peer verification TLS connection client (or server) traverses
the chain of certificates presented by the peer
and if a trusted certificate is found, considers the peer trusted.
If no trusted and otherwise valid certificate is found, peer verification fails and client connection is closed
with an error ("alert" in OpenSSL parlance) that says "Unknown CA" or similar. The alert
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

The examples above demonstrate TLS alert messages logged by RabbitMQ running on Erlang/OTP 21.
Clients that perform peer verification will also raise alerts but may use different
error messages. [RFC 8446 section 6.2](https://tools.ietf.org/html/rfc8446#section-6.2)
provides an overview of various alerts and what they mean.


### <a id="peer-verification-trusted-certificates" class="anchor" href="#peer-verification-trusted-certificates">Trusted Certificates</a>

Every TLS-enabled tool and TLS implementation, including Erlang/OTP and
RabbitMQ, has a way of marking a set of certificates as
trusted. On Linux and other UNIX-like systems this is
usually a directory administered by superusers. CA
certificates in that directory will be considered trusted,
and so are the certificates issued by them (such as those
presented by clients). Locations of the trusted certificate directory will [vary](https://www.happyassassin.net/2015/01/12/a-note-about-ssltls-trusted-certificate-stores-and-platforms/)
[between distributions](http://gagravarr.org/writing/openssl-certs/others.shtml), operating systems and releases.

On Windows trusted certificates are managed using tools such as [certmgr](https://docs.microsoft.com/en-us/dotnet/framework/tools/certmgr-exe-certificate-manager-tool).

The certificates in the server's CA certificate bundle may be considered trusted.
We say "may" because it doesn't work the same way for all client libraries since this varies from TLS implementation
to implementation. Certificates in a CA certificate bundler won't be considered to be trusted in Python,
for example, unless explicitly added to the trust store.

When performing peer verification, RabbitMQ will only consider the root certificate (first certificate in the list) to be trusted.
Any intermediate certificates will be ignored. If it's desired that intermediate certificates
are also considered to be trusted they must be added to the trusted certificate store.

While it is possible to place final ("leaf") certificates
such as those used by servers and clients to the trusted certificate directory,
a much more common practice is to add CA certificates to the trusted certificate list.

The most common way of appending several certificates to one
another and use in a single Certificate Authority bundle file
is to simply concatenate them:

<pre class="lang-bash">
cat rootca/ca_certificate_bundle.pem otherca/ca_certificate.pem &gt; all_cacerts.pem
</pre>

### <a id="peer-verification-configuration" class="anchor" href="#peer-verification-configuration">Enabling Peer Verification</a>

On the server end, peer verification is primarily controlled using two configuration
options: <code>ssl_options.verify</code> and <code>ssl_options.fail_if_no_peer_cert</code>.

Setting the <code>ssl_options.fail_if_no_peer_cert</code> option to <code>false</code> tells
the node to accept clients which don't present a certificate (for example, were not configured to use one).

When the <code>ssl_options.verify</code> option is set to <code>verify_peer</code>,
the client does send us a certificate, the node must perform peer verification.
When set to <code>verify_none</code>, peer verification will be disabled and certificate
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

The same example in the [classic config format](/configure.html#config-file):

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

Thus it is possible to create an encrypted TLS connection <em class="">without</em> having to
verify certificates. Client libraries usually support both modes of operation.

When peer verification is enabled, it is common for clients to also check whether the
the hostname of the server
they are connecting to matches one of two fields
in the server certificate: the [SAN (Subject Alternative Name)](https://en.wikipedia.org/wiki/Subject_Alternative_Name)
or CN (Common Name). When [wildcard certificates](https://en.wikipedia.org/wiki/Wildcard_certificate) are used,
the hostname is matched against a pattern. If there is no match, peer verification will also be
failed by the client. Hostname checks are also optional and generally orthogonal to certificate chain
verification performed by the client.

Because of this it is important to know what SAN (Subject Alternative Name) or CN (Common Name) values
were used when generating the certificate. If a certificate is generated on one host and used
on a different host then the <code>$(hostname)</code> value should be replaced with the correct hostname of the target server.

[tls-gen](#automatic-certificate-generation) will use local machine's hostname for both values.
Likewise, in the [manual certificate/key pair generation section](#manual-certificate-generation) local machine's hostname is specified as
<code>...-subj /CN=$(hostname)/...</code> to some OpenSSL CLI tool commands.

### <a id="peer-verification-depth" class="anchor" href="#peer-verification-depth">Certificate Chains and Verification Depth</a>

When using a client certificate signed by an intermediate CA, it may be necessary
to configure RabbitMQ server to use a higher verification depth.

The depth is the maximum number of non-self-issued intermediate certificates that
may follow the peer certificate in a valid certification path.
So if depth is 0 the peer (e.g. client) certificate must be signed by the trusted CA directly,
if 1 the path can be "peer, CA, trusted CA", if it is 2 "peer, CA, CA, trusted CA", and so on.

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

The same example in the [classic config format](/configure.html#config-file):

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

When using RabbitMQ plugins such as [Federation](/federation.html) or [Shovel](/shovel.html) with TLS,
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
to implement any certificate chain verification logic

A Key Store is a Java encapsulation of the certificate store concept. All
certificates must either be stored into a Java-specific binary format (JKS)
or to be in the PKCS#12 format. These formats are managed using the
<code>KeyStore</code> class. In the below examples the JKS format is used to add the trusted (server) certificate(s)
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
an [exclusive, non-durable, auto-delete queue](/queues.html) that will be deleted shortly
after the connection is closed.

### <a id="java-client-connecting-with-peer-verification" class="anchor" href="#java-client-connecting-with-peer-verification">Connecting with Peer Verification Enabled</a>

For a Java client to trust a server, the server certificate must be added
to a trust store which will be used to instantiate a [Trust Manager](https://docs.oracle.com/javase/8/docs/api/javax/net/ssl/TrustManager.html).
The JDK ships with a tool called <code>keytool</code> that manages certificate stores. To import a certificate to
a store use <code>keytool -import</code>:

<pre class="lang-bash">
keytool -import -alias server1 -file /path/to/server_certificate.pem -keystore /path/to/rabbitstore
</pre>

The above command will import <code>server/certificate.pem</code> into the <code>rabbitstore</code> file
using the JKS format. The certificate will be referred to as <code>server1</code> in the trust store.
All certificates and keys must have distinct name in their store.

<code>keytool</code> will confirm that the certificate is trusted and ask for a password.
The password protects the trust store from any tampering attempt.

The client certificate and key in a <code>PKCS#12</code> file are then used. Note Java understands
natively the <code>PKCS#12</code> format, no conversion is needed.

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

      Connection conn = factory.newConnection();
      Channel channel = conn.createChannel();

      channel.queueDeclare(&quot;rabbitmq-java-test&quot;, false, true, true, null);
      channel.basicpublish(&quot;&quot;, &quot;rabbitmq-java-test&quot;, null, &quot;Hello, World&quot;.getBytes());

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
<code>ConnectionFactory#enableHostnameVerification()</code> method. This is done in the example
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
<code>ConnectionFactory#enableHostnameVerification(HostnameVerifier)</code>
can be provided a <code>HostnameVerifier</code> instance of choice.

### <a id="tls-versions-java-client" class="anchor" href="#tls-versions-java-client">Configuring TLS Version in Java Client</a>

Just like RabbitMQ server can be [configured to support only specific TLS versions](#tls-versions),
it may be necessary to configure preferred TLS version in the Java client. This is done using
the <code>ConnectionFactory#useSslProtocol</code> overloads that accept a protocol version name
or a <code>SSLContext</code>:

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
be stored in files with <code>.cer</code> extension. [tls-gen](#automated-certificate-generation)
generates both PEM and PKCS#12 files.

### <a id="dotnet-peer-verification" class="anchor" href="#dotnet-peer-verification">.NET Trust Store</a>

On the .NET platform, remote certificates are managed by putting them
into any of a number of Stores. All management of these stores is done
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
verification to succeed. To suppress verification, an applications can set
the <code>System.Net.Security.SslPolicyErrors.RemoteCertificateNotAvailable</code>
and <code>System.Net.Security.SslPolicyErrors.RemoteCertificateChainErrors</code>
flags in [SslOptions](&url-dotnet-apidoc;/RabbitMQ.Client.SslOption.html).

### <a id="certmgr" class="anchor" href="#certmgr">Certificate Management with Certmgr</a>

<code>certmgr</code> is a command line tool that manages certificates in a specified store, for example,
adds and deletes them. These stores can be per-user stores, or
system-wide. Only administrative users can have write access to the system-wide stores.

The following example adds a certificate to the store of user <code>Root</code> (also known as <code>Trust</code> in some .NET implementation)

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

After adding to a store, we can view the contents of that store with the <code>-all</code> (<code>-list</code> with Mono) switch:

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

### <a id="dotnet-connection-params" class="anchor" href="#dotnet-connection-params">Creating The Connection</a>

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
    .NET expects this to match the Subject Alternative Namee (SAN) or Common Name (CN) on
    the certificate that the server sends over.
  </td>
</tr>
</table>

### <a id="dotnet-example" class="anchor" href="#dotnet-example">Code Example</a>

This is a more or less direct port of the [Java client example](#java-client-connecting). It
creates a channel and publishes to
the default direct exchange, then reads back what has been
published and echoes it out. Note that we use an
[exclusive, non-durable, auto-delete queue](/queues.html) so we don't have
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

      cf.Ssl.ServerName = System.Net.Dns.GetHostName();
      cf.Ssl.CertPath = "/path/to/client_key.p12";
      cf.Ssl.CertPassphrase = "MySecretPassword";
      cf.Ssl.Enabled = true;

      using (IConnection conn = cf.CreateConnection()) {
        using (IModel ch = conn.CreateModel()) {
          ch.QueueDeclare("rabbitmq-dotnet-test", false, false, false, null);
          ch.Basicpublish("", "rabbitmq-dotnet-test", null,
                          Encoding.UTF8.GetBytes("Hello, World"));
          BasicGetResult result = ch.BasicGet("rabbitmq-dotnet-test", true);
          if (result == null) {
            Console.Writeline("No message received.");
          } else {
            Console.Writeline("Received:");
            DebugUtil.DumpProperties(result, Console.Out, 0);
          }
          ch.QueueDelete("rabbitmq-dotnet-test");
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
<code>...-subj /CN=$(hostname)/...</code> which dynamically looks up your
hostname. If you're generating certificates on one machine, and using
them on the other then be sure to swap out the <code>$(hostname)</code>
section, and replace it with the correct hostname for your server.


On the .NET platform, [RemoteCertificatevalidationCallback](http://msdn.microsoft.com/en-us/library/system.net.security.remotecertificatevalidationcallback(v=vs.110).aspx)
controls TLS verification behavior.


In RabbitMQ .NET client, <code>RabbitMQ.client.SslOption.CertificatevalidationCallback</code>
can be used to provide a [RemoteCertificatevalidationCallback](http://msdn.microsoft.com/en-us/library/system.net.security.remotecertificatevalidationcallback(v=vs.110).aspx)
delegate. The delegate will be used to verify peer (RabbitMQ node) identity using whatever logic fits
the applications.

If this is not specified, the default callback will be
used in conjunction with the AcceptablePolicyErrors
property to determine if the remote server certificate is
valid.

The <code>System.Net.Security.SslPolicyErrors.RemoteCertificateNameMismatch</code>
flag in <code>RabbitMQ.client.SslOption.AcceptablePolicyErrors</code>
can be used to disable peer verification (not recommended in production environments!).


<code>RabbitMQ.client.SslOption.CertificateSelectionCallback</code>
can be used to provide
a [LocalCertificateSelectionCallback](http://msdn.microsoft.com/en-us/library/system.net.security.localcertificateselectioncallback(v=vs.110).aspx)
that will select the local certificate used for peer verification.


## <a id="tls-versions" class="anchor" href="#tls-versions">Limiting TLS Versions Used</a>

### <a id="tls-versions-why-limit" class="anchor" href="#tls-versions-why-limit">Why limit TLS Versions</a>

TLS (née SSL) has evolved over time and has multiple versions in use.
Each version builds on the shortcomings of previous versions. Most of the time
the shortcomings resulted in [known attacks](#major-vulnerabilities) that affect specific
versions of TLS (and SSL). disabling older TLS versions is a way to mitigate
many of those attacks (another technique is to [disable affected cipher suites](#cipher-suites)).
It is common for environments with highest security requirements to only support TLSv1.2, for example.

### <a id="tls-versions-why-not-limit" class="anchor" href="#tls-versions-why-not-limit">Why Not Limit TLS Versions</a>

limiting TLS versions to TLSv1.2 only means that clients that [support older
TLS versions only](#tls-version-support-in-jdk-and-net) (e.g. JDK 6 or .NET 4.0) won't be able to connect.

### <a id="tls-versions-server" class="anchor" href="#tls-versions-server"></a>

To limit enabled TLS protocol versions, use the <code>versions</code> option.

Using the [classic config format](/configure.html#config-file):

<pre class="lang-ini">
listeners.ssl.1        = 5671
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.versions.1 = tlsv1.2
ssl_options.versions.2 = tlsv1.1
ssl_options.versions.3 = tlsv1
</pre>

Using the [advanced config](/configure.html#advanced-config-file):

<pre classic="sourcecode erlang">
%% advanced config here is only used to configure TLS versions
[{ssl, [{versions, ['tlsv1.2', 'tlsv1.1', tlsv1]}]}].
</pre>

The examples below disable versions older than TLSv1.1.

Using the [standard config](/configure.html#config-file):

<pre class="lang-ini">
listeners.ssl.1 = 5671
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.versions.1 = tlsv1.2
ssl_options.versions.2 = tlsv1.1
</pre>

Using the [advanced config](/configure.html#advanced-config-file):

<pre classic="sourcecode">
  %% Disable SSLv3.0 and TLSv1.0 support.
  [
   {ssl, [{versions, ['tlsv1.2', 'tlsv1.1']}]},
   {rabbit, [
             {ssl_options, [
                            {versions, ['tlsv1.2', 'tlsv1.1']}
                           ]}
            ]}
  ].
</pre>

Using [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
%% Disable SSLv3.0 and TLSv1.0 support.
[
 {ssl, [{versions, ['tlsv1.2', 'tlsv1.1']}]},
 {rabbit, [
           {ssl_listeners, [5671]},
           {ssl_options, [{cacertfile,"/path/to/ca_certificate.pem"},
                          {certfile,  "/path/to/server_certificate.pem"},
                          {keyfile,   "/path/to/server_key.pem"},
                          {versions, ['tlsv1.2', 'tlsv1.1']}
                         ]}
          ]}
].
</pre>

### <a id="verifying-tls-versions" class="anchor" href="#verifying-tls-versions">Verifying Enabled TLS Versions</a>

To verify provided TLS versions, use <code>openssl s_client</code>:

<pre class="lang-bash">
# connect using SSLv3
openssl s_client -connect 127.0.0.1:5671 -ssl3
</pre>

<pre class="lang-bash">
# connect using TLSv1.0 through v1.2
openssl s_client -connect 127.0.0.1:5671 -tls1
</pre>

 and look for the following in the output:

<pre class="sourcecode">
SSL-Session:
Protocol  : TLSv1
</pre>


### <a id="tls-version-support-in-jdk-and-net" class="anchor" href="#tls-version-support-in-jdk-and-net">TLS Version Support Table for JDK and .NET</a>

disabling TLSv1.0 limits the number of client platforms supported. Below is a table that
explains what TLS versions are supported by what JDK and .NET releases.

<table>
  <thead>
    <td>TLS version</td>
    <td>Minimum JDK version</td>
    <td>Minimum .NET version</td>
  </thead>
  <tr>
    <td>TLS 1.0</td>
    <td>JDK 5 (RabbitMQ Java client requires &minimum-jdk-version;)</td>
    <td>.NET 2.0 (RabbitMQ .NET client requires &minimum-dotnet-version;)</td>
  </tr>
  <tr>
    <td>TLS 1.1</td>
    <td>JDK 7 (see [Protocols](http://docs.oracle.com/javase/7/docs/technotes/guides/security/SunProviders.html#SunJSSEProvider),
    [JDK 8 recommended](http://docs.oracle.com/javase/8/docs/technotes/guides/security/enhancements-8.html))</td>
    <td>.NET 4.5</td>
  </tr>
  <tr>
    <td>TLS 1.2</td>
    <td>JDK 7 (see [Protocols](http://docs.oracle.com/javase/7/docs/technotes/guides/security/SunProviders.html#SunJSSEProvider),
    [JDK 8 recommended](http://docs.oracle.com/javase/8/docs/technotes/guides/security/enhancements-8.html))</td>
    <td>.NET 4.5</td>
  </tr>
</table>

 * [.NET versions source](http://msdn.microsoft.com/en-us/library/system.security.authentication.sslprotocols(v=vs.110).aspx)
 * [JDK versions source](http://docs.oracle.com/javase/7/docs/technotes/guides/security/SunProviders.html#SunJSSEProvider)


## <a id="cipher-suites" class="anchor" href="#cipher-suites">Cipher Suites</a>

It is possible to configure what cipher suites will be used by RabbitMQ. Note that not all
suites will be available on all systems. For example, to use Elliptic curve ciphers,
the most recent [supported Erlang release](/which-erlang.html) is highly recommended.

### <a id="available-cipher-suites" class="anchor" href="#available-cipher-suites">Listing Available Cipher Suites</a>

To list cipher suites supported by the Erlang runtime of a running node, use <code>rabbitmq-diagnostics cipher_suites --openssl-format</code>:

<pre class="lang-ini">
rabbitmq-diagnostics cipher_suites --openssl-format -q
</pre>

This will produce a list of cipher suites in the OpenSSL format.

Note that if <code>--openssl-format</code> is set to <code>false</code>:

<pre class="lang-ini">
rabbitmq-diagnostics cipher_suites -q --openssl-format=false
</pre>

then <code>rabbitmq-diagnostics cipher_suites</code> will list cipher suites in the format
that's only accepted in the [classic config format](/configure.html#erlang-term-config-file). The OpenSSL format is accepted
by both config formats. Note that cipher suites are not enquoted in the new style config format
but double quotes are required in the classic format.

The cipher suites listed by the above command are in formats that can be used for inbound and outgoing (e.g. [Shovel](/shovel.html), [Federation](/federation.html))
client TLS connections. They are different from those used by [configuration value encryption](/configure.html#configuration-encryption).

When overriding cipher suites, it is highly recommended
that server-preferred [cipher suite ordering is enforced](#cipher-suite-order).

When using classic config format, the following formatter setting can be helpful as it will produce
a list of cipher suites that can be used in that file format:

<pre class="lang-ini">
rabbitmq-diagnostics cipher_suites --openssl-format=false --formatter=erlang -q
</pre>

### <a id="configuring-cipher-suites" class="anchor" href="#configuring-cipher-suites">Configuring Cipher Suites</a>

Cipher suites are configured using the <code>ssl_options.ciphers</code> config option (<code>rabbit.ssl_options.ciphers</code>
in the classic config format).

The below examples demonstrates how the option is used.

<pre class="lang-ini">
listeners.ssl.1 = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.versions.1 = tlsv1.2
ssl_options.versions.2 = tlsv1.1

ssl_options.verify = verify_peer
ssl_options.fail_if_no_peer_cert = false

ssl_options.ciphers.1  = ECDHE-ECDSA-AES256-GCM-SHA384
ssl_options.ciphers.2  = ECDHE-RSA-AES256-GCM-SHA384
ssl_options.ciphers.3  = ECDHE-ECDSA-AES256-SHA384
ssl_options.ciphers.4  = ECDHE-RSA-AES256-SHA384
ssl_options.ciphers.5  = ECDH-ECDSA-AES256-GCM-SHA384
ssl_options.ciphers.6  = ECDH-RSA-AES256-GCM-SHA384
ssl_options.ciphers.7  = ECDH-ECDSA-AES256-SHA384
ssl_options.ciphers.8  = ECDH-RSA-AES256-SHA384
ssl_options.ciphers.9  = DHE-RSA-AES256-GCM-SHA384
ssl_options.ciphers.10 = DHE-DSS-AES256-GCM-SHA384
ssl_options.ciphers.11 = DHE-RSA-AES256-SHA256
ssl_options.ciphers.12 = DHE-DSS-AES256-SHA256
ssl_options.ciphers.13 = ECDHE-ECDSA-AES128-GCM-SHA256
ssl_options.ciphers.14 = ECDHE-RSA-AES128-GCM-SHA256
ssl_options.ciphers.15 = ECDHE-ECDSA-AES128-SHA256
ssl_options.ciphers.16 = ECDHE-RSA-AES128-SHA256
ssl_options.ciphers.17 = ECDH-ECDSA-AES128-GCM-SHA256
ssl_options.ciphers.18 = ECDH-RSA-AES128-GCM-SHA256
ssl_options.ciphers.19 = ECDH-ECDSA-AES128-SHA256
ssl_options.ciphers.20 = ECDH-RSA-AES128-SHA256
ssl_options.ciphers.21 = DHE-RSA-AES128-GCM-SHA256
ssl_options.ciphers.22 = DHE-DSS-AES128-GCM-SHA256
ssl_options.ciphers.23 = DHE-RSA-AES128-SHA256
ssl_options.ciphers.24 = DHE-DSS-AES128-SHA256
ssl_options.ciphers.25 = ECDHE-ECDSA-AES256-SHA
ssl_options.ciphers.26 = ECDHE-RSA-AES256-SHA
ssl_options.ciphers.27 = DHE-RSA-AES256-SHA
ssl_options.ciphers.28 = DHE-DSS-AES256-SHA
ssl_options.ciphers.29 = ECDH-ECDSA-AES256-SHA
ssl_options.ciphers.30 = ECDH-RSA-AES256-SHA
ssl_options.ciphers.31 = ECDHE-ECDSA-AES128-SHA
ssl_options.ciphers.32 = ECDHE-RSA-AES128-SHA
ssl_options.ciphers.33 = DHE-RSA-AES128-SHA
ssl_options.ciphers.34 = DHE-DSS-AES128-SHA
ssl_options.ciphers.35 = ECDH-ECDSA-AES128-SHA
ssl_options.ciphers.36 = ECDH-RSA-AES128-SHA

ssl_options.honor_cipher_order = true
ssl_options.honor_ecc_order    = true
</pre>

In the [classic config format](/configure.html#erlang-term-config-file):

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
                            "ECDHE-ECDSA-AES256-SHA384",
                            "ECDHE-RSA-AES256-SHA384",
                            "ECDH-ECDSA-AES256-GCM-SHA384",
                            "ECDH-RSA-AES256-GCM-SHA384",
                            "ECDH-ECDSA-AES256-SHA384",
                            "ECDH-RSA-AES256-SHA384",
                            "DHE-RSA-AES256-GCM-SHA384",
                            "DHE-DSS-AES256-GCM-SHA384",
                            "DHE-RSA-AES256-SHA256",
                            "DHE-DSS-AES256-SHA256",
                            "ECDHE-ECDSA-AES128-GCM-SHA256",
                            "ECDHE-RSA-AES128-GCM-SHA256",
                            "ECDHE-ECDSA-AES128-SHA256",
                            "ECDHE-RSA-AES128-SHA256",
                            "ECDH-ECDSA-AES128-GCM-SHA256",
                            "ECDH-RSA-AES128-GCM-SHA256",
                            "ECDH-ECDSA-AES128-SHA256",
                            "ECDH-RSA-AES128-SHA256",
                            "DHE-RSA-AES128-GCM-SHA256",
                            "DHE-DSS-AES128-GCM-SHA256",
                            "DHE-RSA-AES128-SHA256",
                            "DHE-DSS-AES128-SHA256",
                            "ECDHE-ECDSA-AES256-SHA",
                            "ECDHE-RSA-AES256-SHA",
                            "DHE-RSA-AES256-SHA",
                            "DHE-DSS-AES256-SHA",
                            "ECDH-ECDSA-AES256-SHA",
                            "ECDH-RSA-AES256-SHA",
                            "ECDHE-ECDSA-AES128-SHA",
                            "ECDHE-RSA-AES128-SHA",
                            "DHE-RSA-AES128-SHA",
                            "DHE-DSS-AES128-SHA",
                            "ECDH-ECDSA-AES128-SHA",
                            "ECDH-RSA-AES128-SHA"
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
To do so, configure <code>honor_cipher_order</code>
and <code>honor_ecc_order</code> to <code>true</code>:

<pre class="lang-ini">
listeners.ssl.1        = 5671
ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.versions.1 = tlsv1.2
ssl_options.versions.2 = tlsv1.1

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
19.3.6.4 and 20.1.7. To mitigate, [upgrade Erlang/OTP](/which-erlang.html) to a patched version
and consider [limiting the list of supported cipher suites](#cipher-suites).

#### POODLE

[POODLE](https://www.openssl.org/~bodo/ssl-poodle.pdf) is a known SSL/TLS attack that originally compromised SSLv3.
Starting with version 3.4.0, RabbitMQ server refuses to accept SSLv3 connections. In December 2014, a modified version of
the POODLE attack that affects TLSv1.0 was [announced](https://www.imperialviolet.org/2014/12/08/poodleagain.html).
It is therefore recommended to either run Erlang 18.0 or later, which
[etrminates TLS 1.0 implementation vulnerability to POODLE](http://www.erlang.org/news/88),
or [disable TLSv1.0 support](#disabling-tls-versions).

#### BEAST

[BEAST attack](http://en.wikipedia.org/wiki/Transport_Layer_Security#BEAST_attack) is a known vulnerability that
affects TLSv1.0. To mitigate it, [disable TLSv1.0 support](#disabling-tls-versions).


## <a id="tls-evaluation-tools" class="anchor" href="#tls-evaluation-tools">Evaluating TLS Setups</a>

Because TLS has many configurable parameters
and some of them have suboptimal defaults for historical
reasons, TLS setup evaluation is a recommended practice.
Multiple tools exist that perform various tests on TLS-enabled
server endpoints, for example, testing whether it is prone
to known attacks such as POODLE, BEAST, and others.

### <a id="testssl-sh" class="anchor" href="#testssl-sh">testssl.sh</a>

[testssl.sh](https://testssl.sh/) is a mature and extensive TLS endpoint testing
tool that can be used with protocol endpoints that do not serve HTTP.
Note that the tool performs many tests (for instance, on some machines it runs
over 350 cipher suite tests alone) and passing every single one may or may not
make sense for every environment. For example, many production deployments
do not use CRLs (Certificate Revocation lists); most development environments
use self-signed certificates and don't have to worry about
the most optimal set of cipher suites enabled; and so on.


The following example configuration passes key testssl tests on Erlang 21.1:

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

The same example in the [classic config format](/configure.html#erlang-term-config-file):

<pre class="lang-erlang">
[
 {ssl,    [
           {versions,           ['tlsv1.2']},
           {secure_renegotiate, true}
          ]},
 {rabbit, [
           {ssl_listeners, [5671]},
           {ssl_options, [{cacertfile, "/path/to/ca_certificate.pem"},
                          {certfile,   "/path/to/server_certificate.pem"},
                          {keyfile,    "/path/to/server_key.pem"},
                          {versions, ['tlsv1.2']},
                          {ciphers,  [
                                       {ecdhe_ecdsa,aes_256_gcm,aead,sha384},
                                       {ecdhe_rsa,aes_256_gcm,aead,sha384},
                                       {ecdh_ecdsa,aes_256_gcm,aead,sha384},
                                       {ecdh_rsa,aes_256_gcm,aead,sha384},
                                       {dhe_rsa,aes_256_gcm,aead,sha384},
                                       {dhe_dss,aes_256_gcm,aead,sha384},
                                       {ecdhe_ecdsa,aes_128_gcm,aead,sha256},
                                       {ecdhe_rsa,aes_128_gcm,aead,sha256},
                                       {ecdh_ecdsa,aes_128_gcm,aead,sha256},
                                       {ecdh_rsa,aes_128_gcm,aead,sha256},
                                       {dhe_rsa,aes_128_gcm,aead,sha256},
                                       {dhe_dss,aes_128_gcm,aead,sha256}
                                     ]},
                          {honor_cipher_order,   true},
                          {honor_ecc_order,      true},
                          {client_renegotiation, false},
                          {secure_renegotiate,   true},
                          {verify,               verify_peer},
                          {fail_if_no_peer_cert, false}]}
          ]}
].
</pre>

This setup is reported as not vulnerable to a set of known
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
settings related to networking. The <code>#amqp_params_network</code> record
provides a field, <code>ssl_options</code>, for all the [standard Erlang TLS options](http://erlang.org/doc/man/ssl.html).

### <a id="erlang-ssl" class="anchor" href="#erlang-ssl">Erlang TLS Options</a>

The three important options which must be supplied are:

 * The <code>cacertfile</code> option specifies the certificates of the root
   Certificate Authorities that we wish to implicitly trust.
 * The <code>certfile</code> is the client's own certificate in PEM format
 * The <code>keyfile</code> is the client's private key file in PEM format

<code>server_name_indication</code> - set this option to the host name of the server
to which a TLS connection will be made to enable "Server Name Indication" verification
of the certificate presented by the server. This ensures that the server certificate's
<code>CN=</code> value will be verified during TLS connection establishment. You can
override this behavior by setting <code>server_name_indication</code> to a different
host name or to the special value <code>disable</code> to disable this
verification. Note that, by default, SNI is <b>not</b> enabled. This default
will change in a future RabbitMQ Erlang client release.

<code>verify</code> - set this option to <code>verify_peer</code> to enable X509
certificate chain verification. The <code>depth</code> option configures certificate
verification depth. Note that, by default, <code>verify</code> is set to
<code>verify_none</code>, which disables certificate chain verification. This default
will change in a future RabbitMQ Erlang client release.

### <a id="erlang-code-example" class="anchor" href="#erlang-code-example">Code Example</a>

<pre class="lang-erlang">
SslOpts = [{cacertfile, &quot;/path/to/ca_certificate_bundle.pem&quot;},
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
the process, OpenSSL command line tools and some important aspects OpenSSL configuration.

This guide assumes a UNIX-like operating system (Linux, MacOS, a BSD variant and so on)
and a recent version of OpenSSL available in <code>PATH</code>.

First let's create a directory for our test Certificate Authority:

<pre class="lang-bash">
mkdir testca
cd testca
mkdir certs private
chmod 700 private
echo 01 &gt; serial
touch index.txt
</pre>

Now add the following OpenSSL configuration file, <code>openssl.cnf</code>, within the newly created <code>testca</code>
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
Certificate Authority will use. Still within the <code>testca</code>
directory:

<pre class="lang-bash">
openssl req -x509 -config openssl.cnf -newkey rsa:2048 -days 365 \
    -out ca_certificate_bundle.pem -outform PEM -subj /CN=MyTestCA/ -nodes
openssl x509 -in ca_certificate.pem -out ca_certificate.cer -outform DER
</pre>

This is all that is needed to generate a test Certificate
Authority. The root certificate is in <code>ca_certificate.pem</code>
and is also in <code>testca/ca_certificate_bundle.cer</code>. These two files contain the
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
keys by providing a different value to <code>openssl genrsa</code>, e.g.:

<pre class="lang-bash">
openssl genrsa -out private_key.pem 4096
</pre>

Another option would be to generate a key using [Elliptic Curve Cryptography](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-Elliptic-curve-cryptography/). Instead of <code>openssl genrsa</code> use
<code>openssl ecparam</code> like so:

<pre class="lang-bash">
openssl ecparam -out private_key.pem -genkey -name prime256v1
</pre>

<code>prime256v1</code> in the example above is an Elliptic curve name.
Different versions of OpenSSL will have a different set of curves available,
list them with <code>openssl ecparam -list_curves</code>.
