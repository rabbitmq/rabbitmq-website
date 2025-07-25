---
title: Blocked Connection Notifications
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

# Blocked Connection Notifications

## Overview {#overview}

It is sometimes desirable for clients to receive a notification
when their connection gets [blocked](./alarms)
due to the broker running low on resources (memory or disk).

A protocol extension to AMQP 0-9-1 has been introduced, enabling the broker to notify the client when 
a connection is blocked or unblocked. The broker sends a `connection.blocked` method when the 
connection is blocked, and a `connection.unblocked` method when it is unblocked.

To receive these notifications, the client must present a
`capabilities` table in its `client-properties` in which there is a key
`connection.blocked` and a boolean value `true`.

See the [capabilities](./connections#capabilities) section for further
details on this. Supported clients advertise this capability by default and provide mechanisms to register handlers 
for the `connection.blocked` and `connection.unblocked` methods.

## When Notifications are Sent {#notifications}

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


## Using Blocked Connection Notifications with Java Client {#java}

With the [official Java client](/client-libraries/java-api-guide), blocked connection
notifications are handled by `BlockedListener`
interface implementations. They can be registered on a
`Connection` using the
`Connection.addBlockedListener` method:

```java
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
```


## Using Blocked Connection Notifications with .NET Client {#dotnet}

With the [official .NET client](/client-libraries/dotnet-api-guide), blocked connection
notifications can be received by registering for the
`ConnectionBlocked` and `ConnectionUnblocked` events in `IConnection`:

```csharp
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
```
