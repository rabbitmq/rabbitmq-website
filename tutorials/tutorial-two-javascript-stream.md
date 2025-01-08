---
title: RabbitMQ tutorial - Offset Tracking
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

# RabbitMQ Stream tutorial - Offset Tracking

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## Offset Tracking

### Setup

This part of the tutorial consists in writing two programs in Javascript; a producer that sends a wave of messages with a marker message at the end, and a consumer that receives messages and stops when it gets the marker message.
It shows how a consumer can navigate through a stream and can even restart where it left off in a previous execution.

This tutorial uses [the stream Javascript client](/tutorials/tutorial-one-javascript-stream#using-the-nodejs-stream-client).
Make sure to follow [the setup steps](/tutorials/tutorial-one-javascript-stream#setup) from the first tutorial.

An executable version of this tutorial can be found in the [RabbitMQ tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/).
The sending program is called `offset_tracking_send.js` and the receiving program is called `offset_tracking_receive.js`.
The tutorial focuses on the usage of the client library, so the final code in the repository should be used to create the scaffolding of the files (e.g. imports, main function, etc).

### Sending

In
[`offset_tracking_send.js`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/offset_tracking_send.js),
we need to add the client:

```javascript
const rabbit = require("rabbitmq-stream-js-client");
```

then we can create a connection to the server and a stream:

```javascript
const client = await rabbit.connect({
  hostname: "localhost",
  port: 5552,
  username: "guest",
  password: "guest",
  vhost: "/",
});

console.log("Making sure the stream exists...");
const streamSizeRetention = 5 * 1e9;
const streamName = "stream-offset-tracking-javascript";
await client.createStream({ stream: streamName, arguments: { "max-length-bytes": streamSizeRetention } });
```

The program then creates a `producer` and publishes 100 messages.
The body value of the last message is set to `marker`; this is a marker for the `consumer` to stop consuming.

```javascript
console.log("Creating the publisher...");
const publisher = await client.declarePublisher({ stream: streamName });

const messageCount = 100;
console.log(`Publishing ${messageCount} messages`);
for (let i = 0; i < messageCount; i++) {
  const body = i === messageCount - 1 ? "marker" : `hello ${i}`;
  await publisher.send(Buffer.from(body));
}
```

For any problem you have in sending the messages i suggest you to checkout some solutions [`here`](/tutorials/tutorial-one-javascript-stream#sending-does-not-work)

Let's now create the receiving program.

### Receiving

The receiving program [`offset_tracking_receive.js`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/javascript-nodejs-stream/offset_tracking_receive.js) adds the client, creates a connection to the server and a stream as well.
This part of the code is the same as in the sending program, so it is skipped in the next code snippets for brevity's sake.

The receiving program starts a consumer that attaches at the beginning of the stream (`rabbit.Offset.first()`).
It uses variables to output the offsets of the first and last received messages at the end of the program.

The consumer stops when it receives the marker message: it assigns the offset to a variable and stores the message offset on the server.
Like for the sender, the channel tells the program to move on when the consumer is done with its job.

```javascript
const startFrom = rabbit.Offset.first();
let firstOffset = startFrom.value;
let lastOffset = startFrom.value;
let messageCount = 0;
const consumer = await client.declareConsumer({ stream: streamName, offset: startFrom }, (message) => {
  messageCount++;
  if (messageCount === 1) {
    console.log("First message received");
    firstOffset = message.offset;
  }
  if (message.content.toString() === "marker") {
    console.log("Marker found");
    lastOffset = message.offset;
    console.log(`Done consuming, first offset was ${firstOffset}, last offset was ${lastOffset}`);
  }
});

console.log(`Start consuming...`);
await sleep(2000);
```

### Exploring the Stream

In order to run both examples, open two terminal (shell) tabs.

In the first tab, run the sender to publish a wave of messages:

```shell
npm run offset-tracking-publish
```

The output is the following:

```shell
Connecting...
Making sure the stream exists...
Creating the publisher...
Publishing 100 messages
Closing the connection...
done!
```

Let's run now the receiver.
Open a new tab.
Remember it should start from the beginning of the stream because of the `first` offset specification.

```shell
npm run offset-tracking-receive
```

Here is the output:

```shell
Connecting...
First message received
Start consuming...
Marker found
Done consuming, first offset was 0, last offset was 99
```

:::note[What is an offset?]
A stream can be seen as an array where elements are messages.
The offset is the index of a given message in the array.
:::

A stream is different from a queue: consumers can read and re-read the same messages and the messages stay in the stream.

Let's try this feature by using the `offset(bigint)` specification to attach at a given offset.
Set the `startFrom` variable from `rabbit.Offset.first()` to `rabbit.Offset.offset(42)`:

```javascript
const startFrom = rabbit.Offset.offset(42n);
```

Offset 42 is arbitrary, it could have been any number between 0 and 99.
Run the receiver again:

```shell
npm run offset-tracking-receive
```

The output is the following:

```shell
Connecting...
Start consuming...
First message received
Marker found
Done consuming, first offset was 42, last offset was 99
```

There is also a way to attach at the very end of stream to see only new messages at the time of the consumer creation.
This is the `next` offset specification.
Let's try it:

```javascript
const startFrom = rabbit.Offset.next();
```

Run the receiver:

```shell
npm run offset-tracking-receive
```

This time the consumer does not get any messages:

```shell
Connecting...
Start consuming...
```

It is waiting for new messages in the stream.
Let's publish some by running the sender again.
Back to the first tab:

```shell
npm run offset-tracking-publish
```

Wait for the program to exit and switch back to the receiver tab.
The consumer received the new messages:

```shell
First message received
Marker found
Done consuming, first offset was 100, last offset was 199
```

The receiver stopped because of the new marker message the sender put at the end of the stream.

This section showed how to "browse" a stream: from the beginning, from any offset, even for new messages.
The next section covers how to leverage server-side offset tracking to resume where a consumer left off in a previous execution.

### Server-Side Offset Tracking

RabbitMQ Streams provide server-side offset tracking to store the progress of a given consumer in a stream.
If the consumer were to stop for any reason (crash, upgrade, etc), it would be able to re-attach where it stopped previously to avoid processing the same messages.

RabbitMQ Streams provides an API for offset tracking, but it is possible to use other solutions to store the progress of consuming applications.
It may depend on the use case, but a relational database can be a good solution as well.

Let's modify the receiver to store the offset of processed messages.
The updated lines are outlined with comments:

```javascript
// start consuming at the beginning of the stream
const consumerRef = "offset-tracking-tutorial"; // the consumer must a have name
let firstOffset = undefined;
let offsetSpecification = rabbit.Offset.first();
try {
  const offset = await client.queryOffset({ reference: consumerRef, stream: streamName }); // take the offset stored on the server if it exists
  offsetSpecification = rabbit.Offset.offset(offset + 1n); // start from the message after 'marker'
} catch (e) {}

let lastOffset = offsetSpecification.value;
let messageCount = 0;
const consumer = await client.declareConsumer(
  { stream: streamName, offset: offsetSpecification, consumerRef },
  async (message) => {
    messageCount++;
    if (!firstOffset && messageCount === 1) {
      firstOffset = message.offset;
      console.log("First message received");
    }
    if (messageCount % 10 === 0) {
      await consumer.storeOffset(message.offset); // store offset every 10 messages
    }
    if (message.content.toString() === "marker") {
      console.log("Marker found");
      lastOffset = message.offset;
      await consumer.storeOffset(message.offset); // store the offset on consumer closing
      await consumer.close(true);
    }
  }
);

console.log(`Start consuming...`);
await sleep(2000);
console.log(`Done consuming, first offset was ${firstOffset}, last offset was ${lastOffset}`);
process.exit(0);
```

The most relevant changes are:

- The consumer attaches at the beginning of the stream with `rabbit.Offset.first()` the first time it is started.
- The consumer must have a name. It is the key to store and retrieve the last stored offset value.
- The offset is stored every 10 messages.
  This is an unusually low value for offset storage frequency, but this is OK for this tutorial.
  Values in the real world are rather in the hundreds or in the thousands.
- The offset is stored before closing the consumer, just after getting the marker message.

Let's run the updated receiver:

```shell
npm run offset-tracking-receive
```

Here is the output:

```shell
Connecting...
Start consuming...
First message received
Marker found
Done consuming, first offset was 0, last offset was 99
```

There is nothing surprising there: the consumer got the messages from the beginning of the stream and stopped when it reached the marker message.

Let's publish another batch of 100 message and start the receiver another time:

```shell
npm run offset-tracking-publish
```

```shell
npm run offset-tracking-receive
```

Here is the output:

```shell
Connecting...
Start consuming...
Marker found
Done consuming, first offset was 100, last offset was 201
```

The consumer restarted exactly where it left off: the last offset in the first run was 99 and the first offset in this second run is 100.
Note the second run the offset specification is taken through the `queryOffset` method.
The consumer stored offset tracking information in the first run, so the client library offers the possibility to retrieve it to resume consuming at the right position in the second run.

This concludes this tutorial on consuming semantics in RabbitMQ Streams.
It covered how a consumer can attach anywhere in a stream.
Consuming applications are likely to keep track of the point they reached in a stream.
They can use the built-in server-side offset tracking feature as demonstrated in this tutorial.
They are also free to use any other data store solution for this task.

See the [RabbitMQ blog](https://www.rabbitmq.com/blog/2021/09/13/rabbitmq-streams-offset-tracking) and the [stream Javascript nodejs client documentation](https://rabbitmq.github.io/rabbitmq-stream-nodejs-client/snapshot/htmlsingle/#consumer-offset-tracking) for more information on offset tracking.
