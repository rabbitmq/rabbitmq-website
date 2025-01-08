---
title: RabbitMQ tutorial - "Hello World!"
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

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsStreamHelp.md';
import TutorialsIntro from '@site/src/components/Tutorials/TutorialsStreamIntro.md';
import T1DiagramHello from '@site/src/components/Tutorials/T1DiagramHello.md';
import T1DiagramSending from '@site/src/components/Tutorials/T1DiagramSending.md';
import T1DiagramReceiving from '@site/src/components/Tutorials/T1DiagramReceiving.md';

# RabbitMQ Stream tutorial - "Hello World!"

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## "Hello World"
### (using the NodeJs Stream Client)

In this part of the tutorial we'll write two programs in JavaScript; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the JavaScript client API, concentrating on this very simple thing just to get
started.  It's the "Hello World" of RabbitMQ Streams.


> #### The Node.js stream client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses RabbitMQ stream protocol which is a dedicated
> protocol for [RabbitMQ streams](/docs/streams). There are a number of clients
> for RabbitMQ in [many different
> languages](/client-libraries/devtools), see the stream client libraries for each language.
> We'll use the [Node.js stream client](https://github.com/coders51/rabbitmq-stream-js-client) built and supported by Coders51.
>
> The client supports [Node.js >= 16.x](https://nodejs.org/en/download). 
> This tutorial will use Node.js stream client 0.3.1 version. 
> The client 0.3.1 and later versions are distributed via [npm](https://github.com/coders51/rabbitmq-stream-js-client?tab=readme-ov-file#installing-via-npm).
>
> This tutorial assumes you are using powershell on Windows. On MacOS and Linux nearly
> any shell will work.

### Setup

First let's verify that you have the Node.js toolchain in `PATH`:

```powershell
npm --help
```

Running that command should produce a help message.

Now let's create a project:

```shell
npm init 
```
then install the client:

```shell
npm install rabbitmq-stream-js-client
```

This is how `package.json` should look like:

```json
{

  "name": "rabbitmq-stream-node-tutorial",
  "version": "1.0.0",
  "description": "Tutorial for the nodejs RabbitMQ stream client",
  "scripts": {
    "send": "node send.js",
    "receive": "node receive.js"
  },
  "dependencies": {
    "rabbitmq-stream-js-client": "^0.3.1"
  }
}
```

Now create new files named `receive.js` and `send.js`. 
Now we have the Node.js project set up we can write some code.

### Sending

We'll call our message producer (sender) `send.js` and our message consumer (receiver)
`receive.js`.  The producer will connect to RabbitMQ, send a single message,
then exit.

In
[`send.js`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/send.js),
we need to add the client:

```javascript
const rabbit = require("rabbitmq-stream-js-client")
```

then we can create a connection to the server:

```javascript
const client = await rabbit.connect({
    hostname: "localhost",
    port: 5552,
    username: "guest",
    password: "guest",
    vhost: "/",
})
```

The entry point of the client is the `Client` class.
It is used for stream management and the creation of publisher instances.
 
It abstracts the socket connection, and takes care of protocol version negotiation and authentication and so on for us.

This tutorial assumes that stream publisher and consumer connect to a RabbitMQ node running locally, that is, on _localhost_.
To connect to a node on a different machine, simply specify target hostname or IP address `Client` parameters.

Next let's create a producer.

The producer will also declare a stream it will publish messages to and then publish a message:

```javascript
const streamName = "hello-nodejs-stream";

console.log("Connecting...");
const client = await rabbit.connect({
        vhost: "/",
        port: 5552,
        hostname: "localhost",
        username: "guest",
        password: "guest",
    });

console.log("Making sure the stream exists...");
const streamSizeRetention = 5 * 1e9
await client.createStream({ stream: streamName, arguments: { "max-length-bytes": streamSizeRetention } });

const publisher = await client.declarePublisher({ stream: streamName });

console.log("Sending a message...");
await publisher.send(Buffer.from("Test message"));
```

The stream declaration operation is idempotent: the stream will only be created if it doesn't exist already.

A stream is an append-only log abstraction that allows for repeated consumption of messages until they expire.
It is a good practice to always define the retention policy.
In the example above, the stream is limited to be 5 GiB in size.

The message content is a byte array.
Applications can encode the data they need to transfer using any appropriate format such as JSON, MessagePack, and so on.

When the code above finishes running, the producer connection and stream-system
connection will be closed. That's it for our producer.

Each time the producer is run, it will send a single message to the server and the message will be appended to the stream.

The complete [send.js file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/send.js) can be found on GitHub.

> #### Sending does not work
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker [log file](/docs/logging/) to see if there
> is a [resource alarm](/docs/alarms) logged and reduce the
> free disk space threshold if necessary.
> The [Configuration guide](/docs/configure#config-items)
> will show you how to set <code>disk_free_limit</code>.
>
> Another reason may be that the program exits _before_ the message makes it to the broker.
> Sending is asynchronous in some client libraries: the function returns immediately but the message is enqueued in the IO layer before going over the wire.
> The sending program asks the user to press a key to finish the process: the message has plenty of time to reach the broker.
> The stream protocol provides a confirm mechanism to make sure the broker receives outbound messages, but this tutorial does not use this mechanism for simplicity's sake.

### Receiving

The other part of this tutorial, the consumer, will connect to a RabbitMQ node and wait for messages to be pushed to it.
Unlike the producer, which in this tutorial publishes a single message and stops, the consumer will be running continuously, consume the messages RabbitMQ will push to it, and print the received payloads out.

Similarly to `send.js`, [`receive.js`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/receive.js) will need to use the client:

```javascript
const rabbit = require("rabbitmq-stream-js-client")
```

When it comes to the initial setup, the consumer part is very similar the producer one; we use the default connection settings and declare the stream from which the consumer will consume.

```javascript
const client = await rabbit.connect({
    hostname: "localhost",
    port: 5552,
    username: "guest",
    password: "guest",
    vhost: "/",
})
const streamSizeRetention = 5 * 1e9
await client.createStream({ stream: streamName, arguments: { "max-length-bytes": streamSizeRetention } });
```

Note that the consumer part also declares the stream.
This is to allow either part to be started first, be it the producer or the consumer.

We use the `declareConsumer` method to create the consumer.
We provide a  callback to process delivered messages.

`offset` defines the starting point of the consumer.
In this case, the consumer starts from the very first message available in the stream.

```javascript
await client.declareConsumer({ stream: streamName, offset: rabbit.Offset.first() }, (message) => {
        console.log(`Received message ${message.content.toString()}`)
})
```

The complete [receive.js file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/receive.js) can be found on GitHub.

### Putting It All Together

In order to run both examples, open two terminal (shell) tabs.

Both parts of this tutorial can be run in any order, as they both declare the stream.
Let's run the consumer first so that when the first publisher is started, the consumer will print it:

```shell
npm run receive
```

Then run the producer:

```shell
npm run send
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for new deliveries. Try re-running
the publisher several times to observe that.

Streams are different from queues in that they are append-only logs of messages
that can be consumed repeatedly.
When multiple consumers consume from a stream, they will start from the first available message.


[//]: # (Time to move on to [part 2]&#40;./tutorial-two-dotnet-stream&#41; and deal with a confirmation.)
