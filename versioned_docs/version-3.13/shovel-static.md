---
title: Configuring Static Shovels
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

# Configuring Static Shovels

## Overview {#overview}

This guide focuses on statically configured shovels. It assumes
familiarity with the key concepts behind the [Shovel plugin](./shovel).

Unlike with [dynamic shovels](./shovel-dynamic), static shovels are configured using the [advanced configuration file](./configure).
They are started on node boot and are primarily useful for permanently
running workloads. Any changes to static shovel configuration would require
a node restart, which makes them highly inflexible.

Most users **should prefer dynamic shovels** to static ones for their flexibility
and ease of automation. Generating a dynamic shovel definition (a JSON document) is usually
easier compared to a static shovel definition (which uses Erlang terms).


## Configuration {#configuration}

The configuration for the Shovel plugin must be defined in the
[advanced configuration file](./configure#advanced-config-file).

It consists of a single `shovels` clause that lists the shovels that should
be started on node boot:

```erlang
{rabbit, [
  %% ...
]},

{rabbitmq_shovel, [
  {shovels, [
    {shovel_one, [
      %% shovel_one properties ...
    ]},
    %% ...
  ]}
]}
```

A (deliberately verbose) [example configuration](#example-config) can be found below.

Each element of the `shovels` clause is a named static shovel.
The names in the list must be distinct.

A shovel definition looks like this at the top level:

```erlang
{shovel_name, [
  {source, [
    %% protocol-specific source configuration goes here
  ]},
  {destination, [
    %% protocol-specific destination configuration goes here
  ]},
  %% 'confirm' is the default acknowledgement mode
  {ack_mode, confirm},
  %% reconnect with a 5 second delay
  {reconnect_delay, 5}
]}
```

where <code><em>shovel_name</em></code> is the name of the
shovel (an Erlang atom). The name should be enclosed in single quotes (`'`) if they do
not begin with a lower-case letter or if they contain
other characters than alphanumeric characters, underscore
(`_`), or `@`.

### The Source and The Destination

A shovel transfers messages from a source to a destination.

The `source` and `destination` keys are **mandatory** and contain nested protocol-specific keys. Currently AMQP 0.9.1 and AMQP 1.0 are two supported protocols.
Source and destination do not have to use the same protocol.
All the other properties are optional.

`source` is a mandatory key and has different keys properties
for different protocols. Two properties are common across all
protocols: `protocol` and `uris`.
`protocol` supports two values: `amqp091` and `amqp10`,
for AMQP 0-9-1 and AMQP 1.0, respectively:

```erlang
%% for AMQP 0-9-1
{protocol, amqp091}
```

`uris` is a list of <a href="./uri-spec">AMQP connection URIs</a>:

```erlang
{uris, [
        "amqp://fred:secret@host1.domain/my_vhost",
        "amqp://john:secret@host2.domain/my_vhost"
       ]}
```

The URI syntax is extended to include a query part to
permit the configuration of additional connection parameters.
See the [query parameter reference](./uri-query-parameters) which
are available to static shovels, such as TLS certificate and private key.

### General Source Keys

Some keys are supported by both AMQP 0-9-1 and AMQP 1.0 sources.
They are described in the table below.

<table>
  <caption>Common (Protocol-Independent) Static Shovel Keys (Properties)</caption>

  <thead>
    <tr>
      <td><strong>Key</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>reconnect-delay</td>
      <td>
        The duration (in seconds) to wait before reconnecting to the
        brokers after being disconnected at either end. Default is 1.

```erlang
{reconnect_delay, 5}
```
        would delay for five seconds before reconnecting after failure. Value of `0`
        means no reconnection: the shovel will stop after first failure or unsuccessful
        connection attempt.
      </td>
    </tr>
    <tr>
      <td>ack-mode</td>
      <td>
        <p>
          Determines how the shovel should <a href="./confirms">acknowledge</a> consumed messages.
          Valid values are <code>on-confirm</code>, <code>on-publish</code>, and <code>no-ack</code>.
          <code>on-confirm</code> is used by default.
        </p>
        <p>
          If set to <code>on-confirm</code> (the default), messages are
          <a href="./confirms">acknowledged</a> to the source broker after they have been confirmed
          by the destination. This handles network errors and broker
          failures without losing messages, and is the slowest option.
        </p>
        <p>
          If set to <code>on-publish</code>, messages are <a href="./confirms">acknowledged</a> to
          the source broker after they have been published at the
          destination (but not yet confirmed). This handles network errors without losing messages,
          but may lose messages in the event of broker failures.
        </p>
        <p>
          If set to <code>no-ack</code>, <a href="./confirms">automatic message acknowledgements</a> will be used.
          This option will offer the highest throughput but is not safe (will lose messages in the event of network or broker failures).
        </p>
      </td>
    </tr>
  </tbody>
</table>

### AMQP 0-9-1 Source Keys

AMQP 0-9-1-specific source keys are covered in a separate table:

<table>
  <caption>AMQP 0-9-1 Source Keys (Properties)</caption>

  <thead>
    <tr>
      <td><strong>Key</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>declarations</td>
      <td>
        <p>
          An optional list of AMQP 0-9-1 operations to be executed by the Shovel
          before it starts transferring messages. They are typically used to set
          up the topology.
        </p>
```erlang
  {declarations, [
    %% declaration list
  ]}
```
        <p>
          The declarations follow method and property names used by the <a href="/client-libraries/erlang-client-user-guide">RabbitMQ Erlang Client</a>.
        </p>
        <p>
          A minimalistic declaration example:
        </p>
```erlang
  {declarations, [
                   'queue.declare',
                   {'queue.bind', [
                                    {exchange, <<"my_exchange">>},
                                    {queue,    <<>>}
                                  ]}
                 ]}
```
        <p>
          will first declare an anonymous queue, and then bind it
          to the exchange called <code>"my_exchange"</code>. The
          queue name of <code>&lt;&lt;>></code> on method <code>queue.bind</code>
          means "use the queue last declared on this channel".
        </p>
        <p>
          Each element of the declaration list is either an AMQP 0-9-1 method
          given as single quoted atom such as <code>'queue.declare'</code>,
          or a tuple with first element the method atom, and second element
          a property list of parameters.
        </p>
        <p>
          If just the method name is used all the
          parameters take their defaults (as illustrated with
          <code>'queue.declare'</code> above).
        </p>
        <p>
          If a tuple and property-list is supplied, then the
          properties in the list specify some or all of the
          parameters explicitly.
        </p>
        <p>
          Here is another example:
        </p>
```erlang
{'exchange.declare', [
                      {exchange, <<"my_exchange">>},
                      {type, <<"direct">>},
                      durable
                     ]}
```
        <p>
          will declare a durable, direct exchange called
          "<code>my_exchange</code>".
        </p>
      </td>
    </tr>

    <tr>
      <td>queue</td>
      <td>
          <p>
            The name of the source queue as an Erlang binary value. This property is mandatory:

```erlang
{queue, <<"queue.1">>}
```
          </p>
          <p>
            <code>queue.1</code> is the name of the queue
            to shovel messages from, as a binary string.
          </p>
          <p>
            This queue must exist. Use the resource <code>declarations</code>
            covered above to declare the queue or ensure it exists. If
            the value is <code>&lt;&lt;>></code> (the empty binary string) then the
            <em>most recently declared queue</em> in <code>declarations</code> is used.
            This allows anonymous queues to be declared and used.
          </p>
      </td>
    </tr>

    <tr>
      <td>prefetch-count</td>
      <td>
        The maximum number of unacknowledged messages copied over a shovel at
        any one time. Default is <code>1000</code>:

```erlang
{prefetch_count, 1000}
```
      </td>
    </tr>
  </tbody>
</table>

### AMQP 1.0 Source Keys

AMQP 1.0 source settings are different from those of AMQP 0-9-1 sources.

<table>
  <caption>AMQP 1.0 Source Keys (Properties)</caption>

  <thead>
    <tr>
      <td><strong>Key</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>source_address</td>
      <td>
        This represents the source address of the AMQP 1.0 link.
        This key is mandatory:

```erlang
{source_address, <<"my-address">>}
```
      </td>
    </tr>

    <tr>
      <td>prefetch-count</td>
      <td>
        This optional key sets the link credit amount that will
        be granted to the receiving link. The credit will be automatically
        renewed when it falls below a 10th of this value. The default is 1000.
        It takes the form

```erlang
  {prefetch_count, 10}
```
      </td>
    </tr>
  </tbody>
</table>

## Destination

`destination` is a mandatory key and has different keys properties
for different protocols. Two properties are common across all
protocols: `protocol` and `uris`.
`protocol` supports two values: `amqp091` and `amqp10`,
for AMQP 0-9-1 and AMQP 1.0, respectively:

```erlang
%% for AMQP 0-9-1
{protocol, amqp091}
```

`uris` is a list of <a href="./uri-spec">AMQP connection URIs</a>:

```erlang
{uris, [
        "amqp://fred:secret@host1.domain/my_vhost",
        "amqp://john:secret@host2.domain/my_vhost"
       ]}
```

The URI syntax is extended to include a query part to
permit the configuration of additional connection parameters.
See the [query parameter reference](./uri-query-parameters) which
are available to static shovels, such as TLS certificate and private key.

### General Destination Keys

<table>
  <caption>General Destination Keys (Properties)</caption>

  <thead>
    <tr>
      <td><strong>Key</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>reconnect-delay</td>
      <td>
        The duration (in seconds) to wait before reconnecting to the
        brokers after being disconnected at either end. Default is 1.

```erlang
{reconnect_delay, 5}
```
        would delay for five seconds before reconnecting after failure. Value of `0`
        means no reconnection: the shovel will stop after first failure or unsuccessful
        connection attempt.
      </td>
    </tr>
  </tbody>
</table>

### AMQP 0-9-1 Destination Keys

<table>
  <caption>AMQP 0-9-1 Destination Keys (Properties)</caption>

  <thead>
    <tr>
      <td><strong>Key</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>publish_properties</td>
      <td>
        <p>
          This optional key controls <a href="./publishers#message-properties">message properties</a>
          set or overridden by the shovel. It takes the following form
        </p>
```erlang
{publish_properties, [
  {delivery_mode, 2}
]}
```
          <p>
            where the properties in the list are set on the
            basic properties of each message before it is re-published.
          </p>
          <p>
            This specific example would mark all re-published messages as persistent:
          </p>
```erlang
{publish_properties, [
  {delivery_mode, 2}
]}
```
          <p>
            By default the original properties of the message are preserved, but
            this clause can be used to change or set any known property:

            <ul>
              <li><code>content_type</code></li>
              <li><code>content_encoding</code></li>
              <li><code>headers</code></li>
              <li><code>delivery_mode</code></li>
              <li><code>priority</code></li>
              <li><code>correlation_id</code></li>
              <li><code>reply_to</code></li>
              <li><code>expiration</code></li>
              <li><code>message_id</code></li>
              <li><code>timestamp</code></li>
              <li><code>type</code></li>
              <li><code>user_id</code></li>
              <li><code>app_id</code></li>
              <li><code>cluster_id</code></li>
            </ul>
          </p>
      </td>
    </tr>

    <tr>
      <td>publish_fields</td>
      <td>
          <p>
            This optional key is similar to <code>publish_properties</code> but controls the publishing settings
            instead of message properties that are accessible to consumers. It takes the form of
          </p>
```erlang
{publish_fields, [
                    {exchange, <<"my_exchange">>},
                    {routing_key, <<"from_shovel">>}
                  ]}
```
          <p>
            where the properties in the list are used to set the
            <em>fields</em> on the <code>basic.publish</code> method
            used to re-publish messages.
          </p>
          <p>
           By default the messages are re-published using the original
           exchange name and routing key. By specifying
         </p>
```erlang
{publish_fields, [
                    {exchange, <<"my_exchange">>},
                    {routing_key, <<"from_shovel">>}
                  ]}
```
          <p>
            messages would be re-published to an explicit exchange name
            with an explicit, fixed routing key.
          </p>
      </td>
    </tr>

    <tr>
      <td>add_timestamp_header</td>
      <td>
        This boolean key controls whether a custom header, <code>x-shovelled-timestamp</code>,
        will be added to the message before it is re-published:

```erlang
{add_timestamp_header, true}
```

        This header value is timestamp (in seconds since epoch) when message had been shovelled.
        By default the header is not added.
      </td>
    </tr>

    <tr>
      <td>add_forward_headers</td>
      <td>
        When set to true the shovel will add a number of custom message headers: <code>shovelled-by</code>, <code>shovel-type</code>, <code>shovel-name</code>,
        to provide some additional metadata about the transfer.

```erlang
{add_forward_headers, true}
```
      </td>
    </tr>
  </tbody>
</table>

### AMQP 1.0 Destination Keys

<table>
  <caption>AMQP 1.0 Destination Keys (Properties)</caption>

  <thead>
    <tr>
      <td><strong>Key</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>target_address</td>
      <td>
        <p>
          This represents the target address of the sending AMQP 1.0 link:

```erlang
{target_address, <<"some-address">>}
```
        </p>
      </td>
    </tr>

    <tr>
      <td>properties</td>
      <td>
        This optional key controls what additional properties will be added when re-publishing
        messages. It takes the form of

```erlang
{properties, [
  {content_typle, <<"application/json">>}
]}
```
        <p>
          The available keys include
          <code>message_id</code>, <code>user_id</code>, <code>to</code>, <code>subject</code>, <code>reply_to</code>, <code>correlation_id</code>, <code>content_type</code>, <code>content_encoding</code>, <code>absolute_expiry_time</code>, <code>creation_time</code>.
          See the AMQP 1.0 spec (§3.2.4) for the all the available keys and values.
        </p>
      </td>
    </tr>

    <tr>
      <td>application_properties</td>
      <td>
            <p>
              This optional key declares any additional application properties
              to be added when re-publishing a message. It takes the form of
            </p>
```erlang
{application_properties, [
  {<<"application-key-1">>, <<"value-1">>},
  {<<"application-key-2">>, <<"value-2">>}
]}
```
        <p>
          Keys and values should be binary strings as in the example below.
        </p>
      </td>
    </tr>

    <tr>
      <td>add_timestamp_header</td>
      <td>
        This boolean key controls whether a <code>creation_time</code> property
        will be set on the message before it is re-published:

```erlang
{add_timestamp_header, true}
```

        This value is timestamp (in seconds since epoch) when message had been shovelled.
        By default the property is not set.
      </td>
    </tr>

    <tr>
      <td>add_forward_headers</td>
      <td>
        When set to true the shovel will add application properties for the
        following keys: <code>shovelled-by</code>, <code>shovel-type</code>, <code>shovel-name</code>
        to provide some additional metadata about the transfer.

```erlang
{add_forward_headers, true}
```
      </td>
    </tr>
  </tbody>
</table>


## Example Configuration {#example-config}

A reasonably complete static shovel configuration between AMQP 0.9.1 endpoints
might look like this:

```erlang
{rabbitmq_shovel,
  [ {shovels, [ {my_first_shovel,
                  [ {source,
                      [ {protocol, amqp091},
                        {uris, [ "amqp://fred:secret@host1.domain/my_vhost",
                                  "amqp://john:secret@host2.domain/my_vhost" ]},
                        {declarations, [ {'exchange.declare',
                                            [ {exchange, <<"my_fanout">>},
                                              {type, <<"fanout">>},
                                              durable
                                            ]},
                                          {'queue.declare',
                                            [{arguments,
                                                [{<<"x-message-ttl">>, long, 60000}]}]},
                                          {'queue.bind',
                                            [ {exchange, <<"my_fanout">>},
                                              {queue,    <<>>}
                                            ]}
                                          ]},
                        {queue, <<>>},
                        {prefetch_count, 10}
                      ]},
                    {destination,
                      [ {protocol, amqp091},
                        {uris, ["amqp://"]},
                        {declarations, [ {'exchange.declare',
                                            [ {exchange, <<"my_direct">>},
                                              {type, <<"direct">>},
                                              durable
                                            ]}
                                        ]},
                        {publish_properties, [ {delivery_mode, 2} ]},
                        {add_forward_headers, true},
                        {publish_fields, [ {exchange, <<"my_direct">>},
                                          {routing_key, <<"from_shovel">>}
                                          ]}
                          ]},
                    {ack_mode, on_confirm},
                    {reconnect_delay, 5}
                  ]}
              ]}
  ]}
```

The configuration above defines a single shovel called
`'my_first_shovel'`.

`'my_first_shovel'` will connect to a broker on
either `host1` or `host2` (as source), and
directly to the local broker as destination. It will reconnect
to the other source broker on failure, after a delay of 5
seconds.

When connected to the source it will declare a direct, fanout exchange
called `"my_fanout"`, an anonymous queue with a [per-queue message ttl](./ttl#per-queue-message-ttl),
and bind the queue to the exchange.

When connected to the destination (the local broker) it will declare a
durable, direct exchange called `"my_direct"`.

This shovel will re-publish messages sent to the anonymous queue on the
source to the local exchange with the fixed routing key
`"from_shovel"`. The messages will be persistent and only
acknowledged after receiving a publish confirm from the local broker.

The shovel consumer will not get more deliveries if there are at least ten
unacknowledged messages at any moment in time.


## Example Configuration (1.0 Source - 0.9.1 Destination) {#example-config-amqp10-amqp091}

A reasonably complete shovel configuration between an AMQP 1.0 source and an
AMQP 0.9.1 destination might look like this:

```erlang
{rabbitmq_shovel,
 [ {shovels, [ {my_first_shovel,
                [ {source,
                   [ {protocol, amqp10},
                     {uris, [ "amqp://fred:secret@host1.domain/my_vhost",
                            ]},
                     {source_address, <<"my-source">>},
                     {prefetch_count, 10}
                   ]},
                  {destination,
                     [ {protocol, amqp091},
                       {uris, ["amqp://"]},
                       {declarations, [ {'exchange.declare',
                                         [ {exchange, <<"my_direct">>},
                                           {type, <<"direct">>},
                                           durable
                                         ]}
                                      ]},
                       {publish_properties, [ {delivery_mode, 2} ]},
                       {add_forward_headers, true},
                       {publish_fields, [ {exchange, <<"my_direct">>},
                                          {routing_key, <<"from_shovel">>}
                                        ]}
                     ]},
                  {ack_mode, on_confirm},
                  {reconnect_delay, 5}
                ]}
             ]}
 ]}
```


## Example Configuration (0.9.1 Source — 1.0 Destination) {#example-config-amqp091-amqp10}

A more extensive shovel configuration between an AMQP 0.9.1 Source and an
AMQP 1.0 destination might look like this:

```erlang
{rabbitmq_shovel,
 [{shovels, [{my_first_shovel,
              {source,
               [{protocol, amqp091},
                {uris, ["amqp://fred:secret@host1.domain/my_vhost",
                        "amqp://john:secret@host2.domain/my_vhost"]},
                {declarations, [{'exchange.declare',
                                   [{exchange, <<"my_fanout">>},
                                    {type, <<"fanout">>},
                                    durable]},
                                {'queue.declare',
                                   [{arguments,
                                      [{<<"x-message-ttl">>, long, 60000}]}]},
                                {'queue.bind',
                                   [{exchange, <<"my_fanout">>},
                                    {queue,    <<>>}
                                    ]}
                               ]},
                {queue, <<>>},
                {prefetch_count, 10}
               ]},
              {destination,
               [{protocol, amqp10},
                %% Note: for plain text SASL authentication, use
                % {uris, ["amqp://user:pass@host:5672?sasl=plain"]},
                %% Note: this relies on default user credentials
                %%       which has remote access restrictions, see
                %%       ./access-control to learn more
                {uris, ["amqp://host:5672"]},
                {properties, [{user_id, <<"my-user">>}]},
                {application_properties, [{<<"my-prop">>, <<"my-prop-value">>}]},
                {add_forward_headers, true},
                {target_address, <<"destination-queue">>}
               ]},
              {ack_mode, on_confirm},
              {reconnect_delay, 5}
             }]}
 ]}
}
```
