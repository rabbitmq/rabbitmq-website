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

# Blocked Connection Notifications

## <a id="overview" class="anchor" href="#overview">Overview</a>

It is sometimes desirable for clients to receive a notification
when their connection gets [blocked](./alarms.html)
due to the broker running low on resources (memory or disk).

We have introduced an AMQP 0-9-1 protocol extension in which the
broker sends to the client a `connection.blocked`
method when the connection gets blocked, and `connection.unblocked` when it is unblocked.

To receive these notifications, the client must present a
`capabilities` table in its `client-properties` in which there is a key
`connection.blocked` and a boolean value `true`.

See the [capabilities](./connections.html#capabilities) section for further
details on this. Our supported clients indicate this capability
by default and provide a way to register handlers for the
`connection.blocked` and `connection.unblocked` methods.


## <a id="notifications" class="anchor" href="#notifications">When Notifications are Sent</a>

A `connection.blocked` notification is sent to
publishing connections the first time RabbitMQ is low on a
resource. For example, when a RabbitMQ node detects that it
is low on RAM, it sends
`connection.blocked` to all connected publishing
clients supporting this feature. If before the connections
are unblocked the node also starts running low on disk space,
another `connection.blocked` will not be sent.

A `connection.unblocked` is sent when **all**
resource alarms have cleared and the connection is fully
unblocked.


## <a id="java" class="anchor" href="#java">Using Blocked Connection Notifications with Java Client</a>

With the [official Java client](./api-guide.html), blocked connection
notifications are handled by `BlockedListener`
interface implementations. They can be registered on a
`Connection` using the
`Connection.addBlockedListener` method:

<pre class="lang-java">
ConnectionFactory factory = new ConnectionFactory();
Connection connection = factory.newConnection();
connection.addBlockedListener(new BlockedListener() {
    public void handleBlocked(String reason) throws IOException {
        // Connection is now blocked
    }

    public void handleUnblocked() throws IOException {
        // Connection is now unblocked
    }
});
</pre>


## <a id="dotnet" class="anchor" href="#dotnet">Using Blocked Connection Notifications with .NET Client</a>

With the [official .NET client](./dotnet-api-guide.html), blocked connection
notifications can be received by registering for the
`ConnectionBlocked` and `ConnectionUnblocked` events in `IConnection`:

<pre class="lang-csharp">
  public void HandleBlocked(object sender, ConnectionBlockedEventArgs args)
  {
      // Connection is now blocked
  }

  public void HandleUnblocked(object sender, EventArgs args)
  {
      // Connection is now unblocked
  }

Conn.ConnectionBlocked   += HandleBlocked;
Conn.ConnectionUnblocked += HandleUnblocked;
</pre>
