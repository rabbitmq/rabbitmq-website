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

# Configuring Dynamic Shovels

## <a id="overview" class="anchor" href="#overview">Overview</a>

This guide focuses on dynamically configured shovels. It assumes
familiarity with the key concepts behind the [Shovel plugin](shovel.html).

Unlike with static shovels, dynamic shovels are configured using [runtime parameters](./parameters.html).
They can be started and stopped at any time, including programmatically. Dynamic shovels
can be used for both transient (one-off) and permanently running workloads.

Information about dynamic shovels is stored in RabbitMQ's schema database,
along with users, permissions, queues, etc. They therefore can be
exported together with other [schema definitions](./definitions.html).


## <a id="configuration" class="anchor" href="#configuration">Configuration</a>

Parameters can be defined using [`rabbitmqctl`](./cli.html), through the
[management HTTP API](./management.html), or (with the `rabbitmq_shovel_management` plugin [enabled](./plugins.html)) through
the management UI's administrative section.

A shovel is declared with a definition body, which is a JSON object. Some keys are mandatory, others are optional.
They control connection parameters, protocol used, message transfer source and destination,
[data safety](./confirms.html) protocol features, and more.

Every shovel belongs to a virtual host. Note that a Shovel can consume from and publish
to not only a different virtual host but an entirely different cluster, so
virtual host selection primarily acts as a way of organising shovels and access to them,
much like with the rest of [permission in RabbitMQ](./access-control.html).

Every shovel is also named. The name is used to identify shovels when [inspecting their status](#status),
[deleting them](#deleting) or [restarting them](#restarting).


## <a id="declaring" class="anchor" href="#declaring">Declaring a Dynamic Shovel</a>

In this example we will set up a dynamic shovel that will move messages from the queue `"source-queue"` in the
local RabbitMQ cluster to the queue `"target-queue"` on a remote RabbitMQ node, using AMQP 0-9-1.

### Using CLI Tools

A shovel is declared using the `rabbitmqctl set_parameter` command with component name `shovel`, a shovel
name and a definition body which is a JSON document:

<pre class="lang-bash">
# my-shovel here is the name of the shovel
rabbitmqctl set_parameter shovel my-shovel \
  '{"src-protocol": "amqp091", "src-uri": "amqp://", "src-queue": "source-queue", "dest-protocol": "amqp091", "dest-uri": "amqp://remote-server", "dest-queue": "target-queue", "dest-queue-args": {"x-queue-type": "quorum"}}'
</pre>

On Windows `rabbitmqctl` is named `rabbitmqctl.bat` and command line value escaping will be
different:

<pre class="lang-powershell">
rabbitmqctl.bat set_parameter shovel my-shovel ^
  "{""src-protocol"": ""amqp091"", ""src-uri"":""amqp://localhost"", ""src-queue"": ""source-queue"", ^
   ""dest-protocol"": ""amqp091"", ""dest-uri"": ""amqp://remote.rabbitmq.local"", ^
   ""dest-queue"": ""target-queue"", ""dest-queue-args"": {""x-queue-type"": ""quorum""}}"
</pre>

The body in this example includes a few keys:

<table>
  <caption>Essential Dynamic Shovel Definition Settings</caption>

  <thead>
    <tr>
      <td><strong>Key</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>src-uri</td>
      <td>
        <p>
          Source connection URI. Mandatory. See
          the <a href="./uri-spec.html">AMQP URI reference</a> for
          information on how RabbitMQ treats AMQP URIs in general,
          and the <a href="./uri-query-parameters.html">query parameter reference</a> for additional
          query parameters that are recognised by the Shovel and Federation plugins
          (such as TLS settings).
        </p>
        <p>
          Note that this field can either be a string, or a list of
          strings. If more than one string is provided, the shovel will
          randomly pick <strong>one</strong> URI from the list until
          one of the endpoints succeeds.
        </p>
        </td>
    </tr>
    <tr>
      <td>src-protocol</td>
      <td>
        Protocol to use when connecting to the source.
        Either <code>amqp091</code> or <code>amqp10</code>. If omitted it will default to <code>amqp091</code>.
        See protocol specific properties below.
      </td>
    </tr>
    <tr>
      <td>src-queue</td>
      <td>
        <p>
          Source queue that the shovel will consume from.
          The queue from which to consume. Either this
          or <code>src-exchange</code> (but not both) must be set.
        </p>
        <p>
          If the source queue does not exist on the target virtual host, and <code>src-queue-args</code>
          parameter was not provided, shovel will declare a classic durable queue with no optional arguments.
        </p>
      </td>
    </tr>
    <tr>
      <td>src-queue-args</td>
      <td>
        <p>
            Optional arguments for <code>src-queue</code> declaraion, eg. the queue type.
        </p>
      </td>
    </tr>
    <tr>
      <td>dest-uri</td>
      <td>
        Same as <code>src-uri</code> above but for destination connection.
      </td>
    </tr>
    <tr>
      <td>dest-protocol</td>
      <td>
        Protocol to use when connecting to the destination.
        Either <code>amqp091</code> or <code>amqp10</code>.
        If omitted it will default to <code>amqp091</code>.
        See protocol specific properties below.
      </td>
    </tr>
    <tr>
      <td>dest-queue</td>
      <td>
        <p>
            The queue to which messages should be published. Either this
            or <code>dest-exchange</code> (but not both) may be set. If
            neither is set then messages are republished with their original
            exchange and routing key.
          </p>
          <p>
            If the destination queue does not exist in the destination virtual host,
            and <code>dest-queue-args</code> parameter was not provided,
            shovel will declare a classic durable queue with no optional arguments.
          </p>
      </td>
    </tr>
    <tr>
      <td>dest-queue-args</td>
      <td>
        <p>
            Optional arguments for <code>dest-queue</code> declaraion, eg. the queue type.
        </p>
      </td>
    </tr>
  </tbody>
</table>

There are other Shovel definition keys that will be covered later in this guide.

### Using HTTP API

To declare a shovel using the HTTP API, make sure that the [management](./management.html) plugin
is enabled, then use the following endpoint:

<pre class="lang-ini">
PUT /api/parameters/shovel/{vhost}/{name}
</pre>

where `{vhost}` is the virtual host in which the Shovel should be started and `{name}`
is the name of the new shovel. The endpoint requires that the user that invokes it
has `policymaker` privileges (tag).

The request body is a JSON document similar in structure to that described earlier in this guide:

<pre class="lang-ini">
{
  "value": {
    "src-protocol": "amqp091",
    "src-uri":  "amqp://localhost",
    "src-queue":  "source-queue",
    "dest-protocol": "amqp091",
    "dest-uri": "amqp://remote.rabbitmq.local",
    "dest-queue": "destination-queue"
  }
}
</pre>

Below is an example that uses `curl` to declare a shovel on a local node using
[default user credentials](./access-control.html#default-state). The shovel will
transfer messages between two queues, `"source-queue"` and `"destination-queue"`, in the default virtual host.

Note that this exact command would fail if invoked against
a remote node. Please [add a new user](./access-control.html) tagged as `policymaker`
for your own experiments.

<pre class="lang-bash">
# Note: this user's access is limited to localhost!
curl -v -u guest:guest -X PUT http://localhost:15672/api/parameters/shovel/%2f/my-shovel \
                       -H "content-type: application/json" \
                       -d @- &lt;&lt;EOF
{
  "value": {
    "src-protocol": "amqp091",
    "src-uri": "amqp://localhost",
    "src-queue": "source-queue",
    "dest-protocol": "amqp091",
    "dest-uri": "amqp://localhost",
    "dest-queue": "destination-queue"
  }
}
EOF
</pre>

### Using Management UI

To declare a shovel using the management UI, first make sure that the [management](./management.html) plugin
is enabled.

Then

 * Navigate to `Admin` &gt; `Shovel Management` &gt; `Add a new shovel`
 * Fill out the form with shovel parameters covered earlier in this guide
 * Click Add shovel


## <a id="status" class="anchor" href="#status">Inspecting Status of Dynamic Shovels</a>

### Using CLI Tools

Use `rabbitmqctl shovel_status` to inspect dynamic shovels in a cluster. The `rabbitmq_shovel`
plugin must be enabled on the host where this command is executed.

<pre class="lang-bash">
rabbitmqctl shovel_status --formatter=pretty_table
</pre>

The output can be formatted as JSON and redirected to a tool such as [`jq`](https://stedolan.github.io/jq/):

<pre class="lang-bash">
rabbitmqctl shovel_status --formatter=json | jq
</pre>

### Using HTTP API

`GET /api/shovels` is an endpoint that can be used to list dynamic
shovels in a cluster. The endpoint is provided by the `rabbitmq_shovel_management` plugin
which must be enabled on the target node.

<pre class="lang-ini">
# Note: this user's access is limited to localhost!
 curl -v -u guest:guest -X GET http://localhost:15672/api/shovels/
</pre>

To inspect shovels in a specific virtual host, use `GET /api/shovels/{vhost}`
`{vhost}` is the virtual host name. The value must be percent-encoded.

<pre class="lang-ini">
# Note: this user's access is limited to localhost!
 curl -v -u guest:guest -X GET http://localhost:15672/api/shovels/%2f
</pre>

To inspect status of a specific shovels, use `GET /api/shovels/vhost/{vhost}/{name}`
`{vhost}` is the virtual host in which the Shovel is running and `{name}`
is the name of the shovel.  Both values must be percent-encoded.

<pre class="lang-ini">
# Note: this user's access is limited to localhost!
 curl -v -u guest:guest -X GET http://localhost:15672/api/shovels/vhost/%2f/my-shovel
</pre>

### Using Management UI

 * Navigate to `Admin` &gt; `Shovel Status`
 * Locate the shovel of interest in the table


## <a id="restarting" class="anchor" href="#restarting">Restarting a Shovel</a>

A dynamic Shovel can be restarted. Restarting a shovel briefly interrupts its operations
and makes it reconnect to both source and destination. When an appropriate [acknowledgement mode](./confirms.html) is
used by a shovel, the interruption is safe: any unacknowledged or unconfirmed ("in flight") messages
consumed from the source or published to the destination will be automatically requeued
when the shovel is stopped, and consumed again after the restart.
### Using CLI Tools

Use `rabbitmqctl restart_shovel` to restart a shovel using its name. The `rabbitmq_shovel`
plugin must be enabled on the host where this command is executed.

<pre class="lang-bash">
rabbitmqctl restart_shovel "my-shovel"
</pre>

### Using HTTP API

`DELETE /api/shovels/vhost/{vhost}/{name}/restart` is an endpoint that restarts
a dynamic shovel. The endpoint is provided by the `rabbitmq_shovel_management` plugin
which must be enabled on the target node.

`{vhost}` is the virtual host in which the Shovel is running and `{name}`
is the name of the shovel to be restarted.  Both values must be percent-encoded.

<pre class="lang-ini">
# Note: this user's access is limited to localhost!
 curl -v -u guest:guest -X DELETE http://localhost:15672/api/shovels/vhost/%2f/my-shovel/restart
</pre>

### Using Management UI

 * Navigate to `Admin` &gt; `Shovel Status`
 * Locate the shovel of interest in the table
 * Click Restart and wait for the next UI refresh

## <a id="deleting" class="anchor" href="#deleting">Deleting a Shovel</a>

### Using CLI Tools

To delete a Shovel using CLI tools, use `rabbitmqctl clear_parameter` and pass `shovel` for
component name and the name of the shovel that should be deleted:

<pre class="lang-bash">
rabbitmqctl clear_parameter shovel "my-shovel"
</pre>

### Using HTTP API

`DELETE /api/parameters/shovel/{vhost}/{name}` is the endpoint that can be used
to delete a shovel.

`{vhost}` is the virtual host in which the Shovel is running and `{name}`
is the name of the shovel to be deleted. Both values must be percent-encoded.

<pre class="lang-bash">
# Note: this user's access is limited to localhost!
curl -v -u guest:guest -X DELETE http://localhost:15672/api/parameters/shovel/%2f/my-shovel
</pre>


## <a id="amqp091-reference" class="anchor" href="#amqp091-reference">AMQP 0-9-1 Shovel Definition Reference</a>

There are several Shovel properties that haven't been covered in the above example.
They don't change how dynamic shovels work fundamentally, and do not change
the declaration process.

<table>
  <caption>Optional Dynamic Shovel Definition Settings (AMQP 0-9-1)</caption>

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
      </td>
    </tr>
    <tr>
      <td>ack-mode</td>
      <td>
        <p>
          Determines how the shovel should <a href="./confirms.html">acknowledge</a> consumed messages.
          If set to <code>on-confirm</code> (the default), messages are
          acknowledged to the source broker after they have been confirmed
          by the destination. This handles network errors and broker
          failures without losing messages, and is the slowest option.
        </p>
        <p>
          If set to <code>on-publish</code>, messages are acknowledged to
          the source broker after they have been published at the
          destination. This handles network errors without losing messages,
          but may lose messages in the event of broker failures.
        </p>
        <p>
          If set to <code>no-ack</code>, message acknowledgements are not
          used. This is the fastest option, but may lose messages in the
          event of network or broker failures.
        </p>
      </td>
    </tr>
    <tr>
      <td>src-delete-after</td>
      <td>
        <p>
          Determines when (if ever) the shovel should delete
          itself. This can be useful if the shovel is being treated
          as more of a move operation - i.e. being used to move
          messages from one queue to another on an ad hoc basis.
        </p>
        <p>
          The default is <code>never</code>, meaning the
          shovel should never delete itself.
        </p>
        <p>
          If set to <code>queue-length</code> then the shovel will
          measure the length of the source queue when starting up,
          and delete itself after it has transferred that many
          messages.
        </p>
        <p>
          If set to an integer, then the shovel will transfer that
          number of messages before deleting itself.
        </p>
      </td>
    </tr>
    <tr>
      <td>src-prefetch-count</td>
      <td>
        The maximum number of unacknowledged messages copied over a shovel at
        any one time. Default is <code>1000</code>.
      </td>
    </tr>
    <tr>
      <td>src-exchange</td>
      <td>
        <p>
          The exchange from which to consume. Either this
          or <code>src-queue</code> (but not both) must be set.
        </p>
        <p>
          The shovel will declare an exclusive queue and bind it to the
          named exchange with <code>src-exchange-key</code> before consuming
          from the queue.
        </p>
        <p>
          If the source exchange does not exist on the source broker, it
          will be not declared; the shovel will fail to start.
        </p>
      </td>
    </tr>
    <tr>
      <td>src-exchange-key</td>
      <td>
        Routing key when using <code>src-exchange</code>.
      </td>
    </tr>
    <tr>
      <td>dest-exchange</td>
      <td>
        <p>
          The exchange to which messages should be published. Either this
          or <code>dest-queue</code> (but not both) may be set.
        </p>
        <p>
          If the destination exchange does not exist on the destination broker,
          it will be not declared; the shovel will fail to start.
        </p>
      </td>
    </tr>
    <tr>
      <td>dest-exchange-key</td>
      <td>
        Routing key when using <code>dest-exchange</code>. If this is not
        set, the original message's routing key will be used.
      </td>
    </tr>
    <tr>
      <td>dest-publish-properties</td>
      <td>
        A map (JSON object) of properties to overwrite when shovelling messages. Setting
        headers this way is not currently supported. Default is <code>{}</code>.
      </td>
    </tr>
    <tr>
      <td>dest-add-forward-headers</td>
      <td>
        Whether to add <code>x-shovelled</code> headers to the
        shovelled messages indicating where they have been shovelled
        from and to. Default is false.
      </td>
    </tr>
    <tr>
      <td>dest-add-timestamp-header</td>
      <td>
        Whether to add <code>x-shovelled-timestamp</code> headers to the
        shovelled messages  containing timestamp (in seconds since epoch)
        when message had been shovelled. Default is false.
      </td>
    </tr>
  </tbody>
</table>


## <a id="amqp10-reference" class="anchor" href="#amqp10-reference">AMQP 1.0 Shovel Definition Reference</a>

AMQP 1.0 source and destination properties have some differences from their AMQP 0-9-1
counterparts.

<table>
  <caption>Optional Dynamic Shovel Definition Settings (AMQP 1.0)</caption>

  <thead>
    <tr>
      <td><strong>Key</strong></td>
      <td><strong>Description</strong></td>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>src-uri</td>
      <td>
        The AMQP URI for the source. Mandatory. AMQP 1.0 URIs implement
        as subset of what is described in the <a href="./uri-spec.html">AMQP URI reference</a>.
        There is no <a href="./vhosts.html">virtual host</a> concept in AMQP 1.0, so URI path
        segments are not supported. The set of query parameters it supports are different from AMQP 0.9.1
        URI(s):

        <dl>
          <dt><code>idle_time_out</code></dt>
          <dd>heartbeat interval</dd>
          <dt><code>hostname</code></dt>
          <dd>
            The name of the target host. Certain vendors (such as Azure ServiceBus)
            require this to be set even if it is the same as the host segment
            in the uri.
          </dd>
          <dt><code>sasl</code></dt>
          <dd>
            <code>anon</code>, <code>none</code> or <code>plain</code>
            Defaults to: <code>none</code>. When using <code>plain</code> the
            user and password segments of the URI need to be set.
          </dd>
          <dt>
            <code>cacertfile</code>, <code>certfile</code>, <code>keyfile</code>
          </dt>
          <dd>
            Client TLS certificate and private key paths.
            See the <a href="ssl.html">TLS guide</a> for details.
            Only of use when URI scheme is <code>amqps</code>.
          </dd>
          <dt>
            <code>verify</code>, <code>fail_if_no_peer_cert</code>
          </dt>
          <dd>
            Use to configure verification of the server's TLS certificate.
            See the <a href="ssl.html">TLS guide</a> for details.
            Only of use when URI scheme is <code>amqps</code>.
          </dd>
        </dl>
      </td>
    </tr>
    <tr>
      <td>src-address</td>
      <td>
        The AMQP 1.0 link address. Mandatory.
      </td>
    </tr>
    <tr>
      <td>dest-address</td>
      <td>
        The AMQP 1.0 link address. Mandatory.
      </td>
    </tr>
    <tr>
      <td>src-prefetch-count</td>
      <td>
        The maximum number of unacknowledged messages copied over a shovel at
        any one time. Default is <code>1000</code>.
      </td>
    </tr>
    <tr>
      <td>dest-properties</td>
      <td>
        Properties to overwrite when shovelling messages.
        See AMQP 1.0 spec §3.2.4 for details of all possible
        properties.
      </td>
    </tr>
    <tr>
      <td>dest-application-properties</td>
      <td>
        Application properties to set when shovelling messages.
      </td>
    </tr>
    <tr>
      <td>dest-add-forward-headers</td>
      <td>
        Whether to add <code>x-shovelled</code> application properties to the
        shovelled messages indicating where they have been shovelled
        from and to. Default is false.
      </td>
    </tr>
    <tr>
      <td>dest-add-timestamp-header</td>
      <td>
        Whether to set the <code>creation_time</code> header to the
        timestamp (in milliseconds since epoch) of the moment when
        message had been republished. Default is false.
      </td>
    </tr>
    <tr>
      <td>reconnect-delay</td>
      <td>
        The duration (in seconds) to wait before reconnecting to the
        brokers after being disconnected at either end. Default is 1.
      </td>
    </tr>
    <tr>
      <td>ack-mode</td>
      <td>
        <p>
          Determines how the shovel should <a href="./confirms.html">acknowledge</a> consumed messages.
          If set to <code>on-confirm</code> (the default), messages are
          acknowledged to the source broker after they have been confirmed
          by the destination. This handles network errors and broker
          failures without losing messages, and is the slowest option.
        </p>
        <p>
          If set to <code>on-publish</code>, messages are acknowledged to
          the source broker after they have been published at the
          destination. This handles network errors without losing messages,
          but may lose messages in the event of broker failures.
        </p>
        <p>
          If set to <code>no-ack</code>, message acknowledgements are not
          used. This is the fastest option, but may lose messages in the
          event of network or broker failures.
        </p>
      </td>
    </tr>
    <tr>
      <td>src-delete-after</td>
      <td>
        <p>
          Determines when (if ever) the shovel should delete
          itself. This can be useful if the shovel is being treated
          as more of a move operation - i.e. being used to move
          messages from one queue to another on an ad hoc basis.
        </p>
        <p>
          The default is <code>never</code>, meaning the
          shovel should never delete itself.
        </p>
        <p>
          If set to <code>queue-length</code> then the shovel will
          measure the length of the source queue when starting up,
          and delete itself after it has transferred that many
          messages.
        </p>
        <p>
          If set to an integer, then the shovel will transfer that
          number of messages before deleting itself.
        </p>
      </td>
    </tr>
  </tbody>
</table>

## <a id="status" class="anchor" href="#status">Monitoring Shovels</a>

See [Monitoring Shovels](./shovel.html#status) in the overview Shovel plugin guide.
