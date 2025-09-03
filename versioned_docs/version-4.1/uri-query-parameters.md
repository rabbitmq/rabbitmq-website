---
title: URI Query Parameters
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

# URI Query Parameters

## Overview {#overview}

This page is a less-formal companion to the [URI specification](./uri-spec) and [TLS](./ssl) guides, documenting how the
officially-supported clients interpret URI parameters. Currently
only the Erlang client does so.

The [Federation](./federation-reference#upstreams)
and [Shovel](./shovel) plugins specify
connections to other brokers using URIs, and are implemented
using the Erlang client, so they take all the parameters
described here for it.

## The Basics {#basics}

Query parameters are added to the URI in the usual way. Any
parameter can be omitted. The client will pick sensible defaults
when they are.

### Example A

An example connection URI with TLS disabled:

```ini
amqp://myhost?heartbeat=5&connection_timeout=10000
```

This specifies a (non-encrypted) network connection to the host
`myhost`. The heartbeat interval is set to 5 seconds,
and connection timeout is set to 10 seconds (10,000 milliseconds).
Other parameters are set to their default values.

### Example B

In the following example URI, TLS and [TLS peer verification](./ssl#peer-verification) on the client side of the connection are enabled:

```ini
amqps://myhost?cacertfile=/path/to/ca_certificate.pem
  &certfile=/path/to/client_certificate.pem
  &keyfile=/path/to/client_key.pem
  &verify=verify_peer
  &server_name_indication=myhost
```

### Example C

In the following example URI, TLS is enabled but [TLS peer verification](./ssl#peer-verification) on the client side of the connection is disabled:

```ini
amqps://myhost?cacertfile=/path/to/ca_certificate.pem
  &certfile=/path/to/client_certificate.pem
  &keyfile=/path/to/client_key.pem
  &verify=verify_none
  &server_name_indication=myhost
```

## TLS Parameters {#tls}

This specifies an encrypted network connection to the host
`myhost`. Absolute paths to the certificate files
are provided. `verify_peer` ensures that certificate
chain of trust is verified, and `server_name_indication`
validates the `CN` value in the server's certificate
against the hostname `myhost`.

<table>
  <tr>
    <th>Parameter name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>
      <code>cacertfile</code><br/>
      <code>certfile</code><br/>
      <code>keyfile</code>
    </td>
    <td>
      Paths to files to use in order to present a client-side SSL
      certificate to the server. Only of use for the
      <code>amqps</code> scheme.
    </td>
  </tr>
  <tr>
    <td>
      <code>verify</code><br/>
      <code>server_name_indication</code>
    </td>
    <td>
      Only of use for the <code>amqps</code> scheme and used to
      configure verification of the server's x509 (TLS)
      certificate. <b>Note:</b> It is highly recommended to use
      both values. See the <a href="./ssl">TLS guide</a> to
      learn more about TLS support in RabbitMQ in general and specifically the
      <a href="./ssl#erlang-client">Erlang client</a>
      section.
    </td>
  </tr>
  <tr>
    <td><code>auth_mechanism</code></td>
    <td>
      SASL authentication mechanisms to consider when negotiating
      a mechanism with the server. This parameter can be specified
      multiple times,
      e.g. <code>?auth_mechanism=plain&auth_mechanism=amqplain</code>,
      to specify multiple mechanisms.
    </td>
  </tr>
  <tr>
    <td><code>heartbeat</code></td>
    <td>
      <a href="./heartbeats">Heartbeat</a> timeout value in seconds (an integer)
      to negotiate with the server.
    </td>
  </tr>
  <tr>
    <td><code>connection_timeout</code></td>
    <td>
      Time in milliseconds (an integer) to wait while establishing a TCP connection
      to the server before giving up.
    </td>
  </tr>
  <tr>
    <td><code>channel_max</code></td>
    <td>
      Maximum number of channels to permit on this connection.
    </td>
  </tr>
</table>

[TLS options](./ssl) can also be specified globally using the
`amqp_client.ssl_options` configuration key in `advanced.config` like so:

```erlang
{amqp_client, [
    {ssl_options, [
        {cacertfile, "path-to-ca-certificate"},
        {certfile, "path-to-certificate"},
        {keyfile, "path-to-keyfile"},
        {verify, verify_peer}
    ]}
]}.
```

They will be merged with the TLS parameters from the URI (the latter will take
precedence) and affect all outgoing RabbitMQ Erlang client connections on the
node, including plugins that use the client internally (Federation, Shovel,
etc). Please see the [TLS guide](./ssl) for details.
