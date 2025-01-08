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

### (using the Rust Stream Client)

In this part of the tutorial we'll write two programs in Rust; a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the detail in
the Rust client API, concentrating on this very simple thing just to get
started. It's the "Hello World" of RabbitMQ Streams.


> #### The Rust stream client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses RabbitMQ stream protocol which is a dedicated
> protocol for [RabbitMQ streams](/docs/streams). There are a number of clients
> for RabbitMQ in [many different
> languages](/client-libraries/devtools), see the stream client libraries for each language.
> We'll use the [Rust stream client](https://github.com/rabbitmq/rabbitmq-stream-rust-client) provided by RabbitMQ.
>
> RabbitMQ Rust stream client 0.4.2 and later versions are distributed
> via [crates.io](https://github.com/rabbitmq/rabbitmq-stream-rust-client?tab=readme-ov-file#installation).
>
> This tutorial assumes you are using powershell on Windows. On MacOS and Linux nearly
> any shell will work.

### Setup

First let's verify that you have the Rust toolchain in `PATH`:

```powershell
rustc --version
cargo --version
```

Running that command should produce a help message.

An executable version of this tutorial can be found in the [RabbitMQ tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/).

Now let's create the project:

```shell
cargo new rust-stream
cd rust-stream
```

Copy the required dependencies from the [Cargo.toml file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/Cargo.toml) on GitHub in your own `Cargo.toml` file.

Now we have the Rust project set up we can write some code.

### Sending

We'll call our message producer (sender) `send.rs` and our message consumer (receiver) `receive.rs`.
The producer will connect to RabbitMQ, send a single message, then exit.

Create the `send.rs` file in the `src/bin` directory.

In
[`send.rs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/src/bin/send.rs),
we need some `use` declarations:

```rust
use rabbitmq_stream_client::error::StreamCreateError;
use rabbitmq_stream_client::types::{ByteCapacity, Message, ResponseCode};
```

then we can create a connection to the server:

```rust
use rabbitmq_stream_client::Environment;
let environment = Environment::builder().build().await?;
```

The entry point of the stream Rust client is the `Environment`.
It is used for configuration of RabbitMQ stream publishers, stream consumers, and streams themselves.

It abstracts the socket connection, and takes care of protocol version negotiation and authentication and so on for us.

This tutorial assumes that stream publisher and consumer connect to a RabbitMQ node running locally, that is, on _localhost_.
To connect to a node on a different machine, simply specify target hostname or IP address on the `Environment::builder()`.

Next let's create a producer.

The producer will also declare a stream it will publish messages to and then publish a message:

```rust
let stream = "hello-rust-stream";
let create_response = environment
    .stream_creator()
    .max_length(ByteCapacity::GB(5))
    .create(stream)
    .await;

if let Err(e) = create_response {
    if let StreamCreateError::Create { stream, status } = e {
        match status {
            // we can ignore this error because the stream already exists
            ResponseCode::StreamAlreadyExists => {}
            err => {
                println!("Error creating stream: {:?} {:?}", stream, err);
            }
        }
    }
}
let producer = environment.producer().build(stream).await?;
producer
    .send_with_confirm(Message::builder().body("Hello, World!").build())
    .await?;
```

The stream declaration operation is idempotent: the stream will only be created if it doesn't exist already.
In this case, we ignore the error `StreamAlreadyExists` because we don't care if the stream already exists.

A stream is an append-only log abstraction that allows for repeated consumption of messages until they expire.
It is a good practice to always define the retention policy.
In the example above, the stream is limited to be 5 GiB in size.

The message content is a byte array.
Applications can encode the data they need to transfer using any appropriate format such as JSON, MessagePack, and so on.

When the code above finishes running, the producer connection and stream-system
connection will be closed. That's it for our producer.

Each time the producer is run, it will send a single message to the server and the message will be appended to the stream.

The complete [send.rs file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/src/bin/send.rs) can be found on GitHub.

> #### Sending doesn't work!
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

Create the `receive.rs` file in the `src/bin` directory.

Similarly to `send.rs`, [`receive.rs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/src/bin/receive.rs) needs `use` declarations:

```rust
use std::io::stdin;
use rabbitmq_stream_client::error::StreamCreateError;
use rabbitmq_stream_client::types::{ByteCapacity, OffsetSpecification, ResponseCode};
use futures::{StreamExt};
use tokio::task;
```

When it comes to the initial setup, the consumer part is very similar the producer one; we use the default connection settings and declare the stream from which the consumer will consume.

```rust
use rabbitmq_stream_client::Environment;
let environment = Environment::builder().build().await?;
let stream = "hello-rust-stream";
let create_response = environment
        .stream_creator()
        .max_length(ByteCapacity::GB(5))
        .create(stream)
        .await;

if let Err(e) = create_response {
    if let StreamCreateError::Create { stream, status } = e {
            match status {
                // we can ignore this error because the stream already exists
                ResponseCode::StreamAlreadyExists => {}
                err => {
                    println!("Error creating stream: {:?} {:?}", stream, err);
                }
            }
        }
    }
```

Note that the consumer part also declares the stream.
This is to allow either part to be started first, be it the producer or the consumer.

We use the `Consumer` struct to create the consumer.

`Consumer` provides the method `next()` to get the next message from the stream.

`offset` defines the starting point of the consumer.
In this case, the consumer starts from the very first message available in the stream.

```rust
let mut consumer = environment
        .consumer()
        .offset(OffsetSpecification::First)
        .build(stream)
        .await
        .unwrap();

let handle = consumer.handle();
task::spawn(async move {
        while let Some(delivery) = consumer.next().await {
            let d = delivery.unwrap();
            println!("Got message: {:#?} with offset: {}",
                     d.message().data().map(|data| String::from_utf8(data.to_vec()).unwrap()),
                     d.offset(),);
        }
    });
```

The complete [receive.rs file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/src/bin/receive.rs) can be found on GitHub.

### Putting It All Together

In order to run both examples, open two terminal (shell) tabs.

Both parts of this tutorial can be run in any order, as they both declare the stream.
Let's run the consumer first so that when the first publisher is started, the consumer will print it:

```shell
cargo run --bin receive
```

Then run the producer:

```shell
cargo run --bin send
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for new deliveries. Try re-running
the publisher several times to observe that.

Streams are different from queues in that they are append-only logs of messages
that can be consumed repeatedly.
When multiple consumers consume from a stream, they will start from the first available message.


