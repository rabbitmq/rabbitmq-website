---
title: RabbitMQ tutorial - "Hello World!"
---
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
### (using the Node.js Stream Client)

In this part of the tutorial we'll write two programs in Python; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the Python client API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.


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

First let's verify that you have node toolchain in `PATH`:

```powershell
npm --help
```

should produce a help message.

Now let's create a project and install the dependencies:

```powershell
npm init 
```
then install the client:

```powershell
npm install rabbitmq-stream-js-client
```

how package.json should look like:

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
...
```
The entry point of the client is the `Client` class.
It deals with stream management and the creation of publisher instances. 

It abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine we'd simply specify its hostname or IP address on the `Client` parameters.

To send, we must declare a stream for us to send to; then we can publish a message
to the stream:

```javascript
const streamName = "test-queue-stream";

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

Declaring a stream is idempotent - it will only be created if it doesn't exist already.

Streams model an append-only log of messages that can be repeatedly read until they expire.
It is a good practice to always define the retention policy, 5Gb in this case.

The message content is a byte array, so you can encode whatever you like there.

When the code above finishes running, the producer connection and stream-system
connection will be closed. That's it for our producer.

Each time you run the producer, it will send a single message to the server and the message will be 
appended to the stream.

[Here's the whole send.js
script](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/send.js).

> #### Sending doesn't work!
>
> If this is your first time using RabbitMQ and you don't see the "Sent"
> message then you may be left scratching your head wondering what could
> be wrong. Maybe the broker was started without enough free disk space
> (by default it needs at least 50 MB free) and is therefore refusing to
> accept messages. Check the broker logfile to confirm and reduce the
> limit if necessary. The [configuration file documentation](/docs/configure#config-items)
> will show you how to set <code>disk_free_limit</code>.


### Receiving

As for the consumer, it is listening for messages from
RabbitMQ. So unlike the producer which publishes a single message, we'll
keep the consumer running continuously to listen for messages and print them out.


The code (in [`receive.js`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/receive.js)) 
needs to use the client as well:


```javascript
const rabbit = require("rabbitmq-stream-js-client")
```

Setting up is the same as the producer; we create a consumer, and declare the stream from which we're going to consume.
Note this matches up with the stream that `send` publishes to.

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

Note that we declare the stream here as well. Because we might start
the consumer before the producer, we want to make sure the stream exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
stream. We provide a callback `(message: Message)` on the `client.declareConsumer`.

`offset` defines the starting point of the consumer. 
In this case, we start from the first message. 


```javascript
const rabbit = require("rabbitmq-stream-js-client")

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
    const streamName = "test-queue-stream"

    console.log("Connecting...");
    const client = await rabbit.connect({
        hostname: "localhost",
        port: 5552,
        username: "guest",
        password: "guest",
        vhost: "/",
    })

    console.log("Making sure the stream exists...");
    const streamSizeRetention = 5 * 1e9
    await client.createStream({ stream: streamName, arguments: { "max-length-bytes": streamSizeRetention } });

    console.log("Declaring the consumer with offset...");
    await client.declareConsumer({ stream: streamName, offset: rabbit.Offset.first() }, (message) => {
        console.log(`Received message ${message.content.toString()}`)
    })

    await sleep(2000)

    console.log("Closing the connection...");
    await client.close()
}

main()
    .then(() => console.log("done!"))
    .catch((res) => {
        console.log("Error while receiving message!", res)
        process.exit(-1)
    })

```


[Here's the whole receive.js
script](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/receive.js).

### Putting It All Together

Open two terminals.

You can run the clients in any order, as both declare the stream.
We will run the consumer first so you can see it waiting for and then receiving the message:

```powershell
npm run receive
```
Then run the producer:

```powershell
npm run send
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages, so try restarting
the publisher several times.

Streams are different from queues in that they are append-only logs of messages.
So you can run the different consumers and they will always start from the first message.

[//]: # (Time to move on to [part 2]&#40;./tutorial-two-dotnet-stream&#41; and deal with a confirmation.)
