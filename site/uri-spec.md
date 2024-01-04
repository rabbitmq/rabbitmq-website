<?xml-stylesheet type="text/xml" href="page.xsl"?>
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

# RabbitMQ URI Specification

## Overview

This specification defines an "amqp" URI scheme. Conforming
URIs represent the information needed by AMQP 0-9-1 clients
as well as some RabbitMQ plugins to connect to RabbitMQ
nodes.

## Introduction

The scope of this
specification is limited to AMQP 0-9-1, the original protocol
implemented by RabbitMQ.  An AMQP 0-9-1 client connects
to a RabbitMQ node in order to publish and consume messages
according to the messaging model.

Several pieces of information are needed by a client to
establish and negotiate an AMQP 0-9-1 connection.
These connection parameters include:

<ul>
    <li>
        The parameters needed to establish the underlying TCP/IP
        connection to the server (i.e. host address and port).
    </li>

    <li>
        Information to authenticate the client. AMQP 0-9-1 uses
        <a href="http://en.wikipedia.org/wiki/Simple_Authentication_and_Security_Layer">SASL</a>
        for authentication.  Typically the <code>PLAIN</code> mechanism is
        used, and so the authentication parameters consist of a
        username and password.
    </li>

    <li>
        The name of the "virtual host" (or <em>vhost</em>) that
        specifies the namespace for entities (such as exchanges and queues)
        referred to by the protocol. Note that this is not virtual
        hosting in the HTTP sense.
    </li>
</ul>

A RabbitMQ client will typically obtain all these parameters
from a configuration file or environment variables in order
for it to set up the connection. So it is convenient if the
connection parameters can be combined into a single
character string, rather than as distinct configuration
settings. That means that only one configuration setting is
needed, and only one value has to be passed to the client
library.

But combining the connection parameters into a single string
requires a convention, understood by the client
library, about exactly how the connection parameters are
represented and delimited. It is desirable to standardise
that convention, so that it may be implemented consistently
by many AMQP 0-9-1 client libraries. An obvious basis for such a
standard is the generic syntax for URIs defined in <a
href="http://www.ietf.org/rfc/rfc3986.txt">RFC3986</a>.

The purpose of this specification is to define the "amqp"
and "amqps" URI schemes which represent the AMQP 0-9-1
connection parameters within the generic URI syntax.

## The "amqp" URI scheme

The syntax of an AMQP 0-9-1 URI is defined by the following ABNF
rules.  All names in these rules not defined here are taken
from <a
href="http://www.ietf.org/rfc/rfc3986.txt">RFC3986</a>.

<pre class="lang-plaintext">
amqp_URI       = "amqp://" amqp_authority [ "/" vhost ] [ "?" query ]

amqp_authority = [ amqp_userinfo "@" ] host [ ":" port ]

amqp_userinfo  = username [ ":" password ]

username       = *( unreserved / pct-encoded / sub-delims )

password       = *( unreserved / pct-encoded / sub-delims )

vhost          = segment
</pre>

Once a URI has been successfully parsed according to this
syntax, the connection parameters are determined as
described in the following sections.

### Host

The host to which the underlying TCP connection is made is
determined from the host component according to RFC3986,
section 3.2.2.  Note that according to the ABNF, the host
component may not be absent, but it may be zero-length.

### Port

The port number to which the underlying TCP connection is
made is determined from the port component according to
RFC3986.  The port component may be absent, indicated by the
lack of the ":" character separating it from the host.  If
it is absent, then the IANA-assigned port number for AMQP 0-9-1,
5672, should be substituted instead.

### Username and password

If present, the username and password components should be
used in the SASL exchange that occurs via the
<code>connection.secure</code> and <code>connection.secure-ok</code> AMQP 0-9-1 methods.
Any percent-encoded octets in the username and password
should be decoded before they are used in the SASL exchange,
and the resulting octet sequences should be regarded as
UTF-8 encoded.

Both the username and password may be absent; their absence
is indicated by the lack of the "@" character separating the
amqp_userinfo from the host.  If the username is present,
the password may be absent; this is indicated by the lack of
the ":" character separating it from the username.
Zero-length usernames and passwords are not equivalent to
absent usernames and passwords.

RFC3986 states that "A password appearing within the
userinfo component is deprecated and should be considered an
error" (section 7.5).  While this is sound advice in the
context of user-facing applications (e.g. web browsers) and
for URIs that might be stored and displayed insecurely, it
is not necessarily valid for backend applications.  Many of those
applications are "headless" services, and open RabbitMQ connections on
behalf of the application as a whole rather than for
specific users. So the username and password identify the
application rather than a human user, and are likely to be
included with connection parameters appearing in a secure
store of configuration settings. User-facing
applications, which make RabbitMQ connections on behalf of
specific users, are also possible. In such cases the
username and password may be provided by the user to
identify themselves.  But such applications are the
exception rather than the rule. Thus authors of
applications implementing this specification should not
consider themselves bound by section 7.5 of RFC3986. Please
also see the section on "Security Considerations" below.


### Virtual Host

The virtual host (vhost) component is used as the basis for the
virtual-host field of the <code>connection.open</code> AMQP 0-9-1 method.  Any
percent-encoded octets in the vhost should be decoded before
the it is passed to the server.

Note that:

<ul>
    <li>The vhost component of the URI does not include the
    leading "/" character from the path.  This makes it possible
    to refer to any vhost, not only those that begin with a "/"
    character.</li>

    <li>The vhost is a single segment.  Therefore, any "/"
    characters that appear in the vhost name must be
    percent-encoded. URIs with multi-segment paths do not obey
    this specification.</li>
</ul>

The vhost component may be absent; this is indicated by the
lack of a "/" character following the amqp_authority.  An
absent vhost component is not equivalent to an empty
(i.e. zero-length) vhost name.

## Handling of absent components

Certain URI components (the port, username, password,
vhost and query) may be absent from a URI.  The host may not be
absent, but may be zero-length; for the purposes of this
section, a zero-length host is treated as absent.

Apart from the port (which is covered in the section 2.2
above), this specification does not mandate how
implementations should handle absent components.  Possible
approaches include, but are not limited to, the following:

<ul>
    <li>An absent component may be substituted with a default
    value.</li>

    <li>A user-facing application may prompt the user to provide
    the value for an absent component.</li>

    <li>An absent component may cause an error.</li>
</ul>

Furthermore, an application may follow different strategies
for different components.

For example, the URI "amqp://", in which all components are
absent, might result in an client library using a set
of defaults which correspond to a connection to a local RabbitMQ
server, authenticating as a guest user.  This would be
convenient for development purposes.

## The "amqps" URI scheme

The "amqps" URI scheme is used to instruct a client
to make an secured connection to the server.

The AMQP 0-9-1 specification assume that the
underlying transport layer provides reliable
byte stream-oriented virtual circuits.  When it is not
necessary to secure the traffic on the network, TCP/IP
connections are typically used.

In cases where the traffic must be secured, TLS (see <a
href="http://tools.ietf.org/rfc/rfc5246.txt">RFC5246</a>)
can be used.  Current practice is simply to layer AMQP
0-9-1 on top of TLS to form "AMQPS" (analogously to the
way HTTPS layers HTTP on top of TLS).  AMQP 0-9-1 does
not provide a way for a non-secured connection to be
upgraded to a secured connection. So a server that supports
both secured and non-secured connections must listen on
distinct ports for the two types of connections.

Apart from the scheme identifier, the syntax of the "amqps"
URI scheme is identical to that of the "amqp" URI scheme:

<pre class="lang-">
amqps_URI      = "amqps://" amqp_authority [ "/" vhost ]
</pre>

The interpretation of an amqps URI differs from the
corresponding "plain" URI in two ways. In all other respects,
the interpretation is the same.

<ul>
    <li>The client must act as a TLS client, and begin the
    TLS handshake as soon as the underlying TCP/IP connection
    has been established. All AMQP 0-9-1 protocol data is sent as TLS
    "application data".  Other than this, normal AMQP 0-9-1 behaviour
    is followed.</li>

    <li>If the port number is absent from the URI, the
    IANA-assigned port number for "amqps", 5671, should be
    used.</li>
</ul>

## Security Considerations

As discussed in the section 2.3 above, URIs will often
be supplied to applications as configuration settings.  In
such contexts, if the password cannot be incorporated into
the URI, then it will simply be supplied as a separate
configuration setting. This reduces the benefit of the use
of a URI without any increase in security. For this
reason, this specification overrides RFC3986's deprecation
of passwords within the userinfo component.

Developers should feel free use the password component
whenever this does not impact security.  Nonetheless, they
should be aware that the contents of the password component
may be sensitive, and they should avoid leaking it (e.g. the
full URI should not appear in exception messages or log
records, which might be visible to less privileged
personnel).

## Appendix A: Examples

Below is a table of examples that show how URIs should be
parsed according to this specification.  Many of these
examples are intended to demonstrate edge cases in order to
elucidate the specification and provide test cases for code
that parses URIs. Each row shows a URI, and the resulting
octet sequences for each component.  Those octet sequences
are enclosed in double quotes. Empty cells indicate absent
components, as described in section 3.

<table>
    <tr>
        <th>URI</th>
        <th>Username</th>
        <th>Password</th>
        <th>Host</th>
        <th>Port</th>
        <th>Vhost</th>
    </tr>

    <tr>
        <td>amqp://user:pass@host:10000/vhost</td>
        <td>"user"</td>
        <td>"pass"</td>
        <td>"host"</td>
        <td>10000</td>
        <td>"vhost"</td>
    </tr>

    <tr>
        <td>amqp://user%61:%61pass@ho%61st:10000/v%2fhost</td>
        <td>"usera"</td>
        <td>"apass"</td>
        <td>"hoast"</td>
        <td>10000</td>
        <td>"v/host"</td>
    </tr>

    <tr>
        <td>amqp://</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>

    <tr>
        <td>amqp://:@/</td>
        <td>""</td>
        <td>""</td>
        <td></td>
        <td></td>
        <td>""</td>
    </tr>


    <tr>
        <td>amqp://user@</td>
        <td>"user"</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>

    <tr>
        <td>amqp://user:pass@</td>
        <td>"user"</td>
        <td>"pass"</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>

    <tr>
        <td>amqp://host</td>
        <td></td>
        <td></td>
        <td>"host"</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>amqp://:10000</td>
        <td></td>
        <td></td>
        <td></td>
        <td>10000</td>
        <td></td>
    </tr>

    <tr>
        <td>amqp:///vhost</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>"vhost"</td>
    </tr>

    <tr>
        <td>amqp://host/</td>
        <td></td>
        <td></td>
        <td>"host"</td>
        <td></td>
        <td>""</td>
    </tr>

    <tr>
        <td>amqp://host/%2f</td>
        <td></td>
        <td></td>
        <td>"host"</td>
        <td></td>
        <td>"/"</td>
    </tr>

    <tr>
        <td>amqp://[::1]</td>
        <td></td>
        <td></td>
        <td>"[::1]" (i.e. the IPv6 address ::1)</td>
        <td></td>
        <td></td>
    </tr>
</table>


## Appendix B: Query parameters

Clients may require further parameterisation to define how
they should connect to servers. The standard URI query syntax
may be used to provide additional information to the client.

Query parameters may be more implementation-specific than other
URI parts; as such this document will not attempt to prescribe
how they should be used. However, we have documented how the
<a href="./uri-query-parameters.html">officially supported clients read URI query parameters</a>.

