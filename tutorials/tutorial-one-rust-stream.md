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

### (using the Rust Stream Client)

In this part of the tutorial we'll write two programs in Rust; a
producer that sends a single message, and a consumer that receives
messages and prints them out. We'll gloss over some of the detail in
the Rust client API, concentrating on this very simple thing just to get
started. It's a "Hello World" of messaging.


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

First let's verify that you have Rust toolchain in `PATH`:

```powershell
rustc --version
cargo --version
```
should produce a help message.

Now let's generate two projects, one for the publisher and one for the consumer:

```powershell
cargo new rust-stream
cd rust-stream
```

This will create two new files named `send.rs` and `receive.rs` inside the dir `src/bin`.

Now we have the Rust project set up we can write some code.

### Sending

We'll call our message producer (sender) `send.rs` and our message consumer (receiver)
`receive.rs`. The producer will connect to RabbitMQ, send a single message,
then exit.

In
[`send.rs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/src/bin/send.rs),
we need to use some namespaces:

```rust
use rabbitmq_stream_client::error::StreamCreateError;
use rabbitmq_stream_client::types::{ByteCapacity, Message, ResponseCode};
```

then we can create a connection to the server:

```rust
use rabbitmq_stream_client::Environment;
let environment = Environment::builder().build().await?;
...
```

The entry point of the stream GO client is the `Environment`.
It deals with stream management and the creation of publisher and consumer instances.

It abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine we'd simply specify its hostname or IP address on the `Environment::builder()`.

Next we create a producer.

To send, we must declare a stream for us to send to; then we can publish a message
to the stream:

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
    println!("Sent message to stream: {}", stream);
    producer.close().await?;
    Ok(())
```

Declaring a stream is idempotent - it will only be created if it doesn't exist already.
In this case, we ignore the error `StreamAlreadyExists` because we don't care if the stream already exists.

Streams model an append-only log of messages that can be repeatedly read until they expire.
It is a good practice to always define the retention policy, 5Gb in this case.

The message content is a byte array, so you can encode whatever you like there.

When the code above finishes running, the producer connection and stream-system
connection will be closed. That's it for our producer.

Each time you run the producer, it will send a single message to the server and the message will be
appended to the stream.

[Here's the whole send.rs
struct](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/src/bin/send.rs).

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

The code (in [`receive.rs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/src/bin/receive.rs))
needs some `import` 

```rust
use std::io::stdin;
use rabbitmq_stream_client::error::StreamCreateError;
use rabbitmq_stream_client::types::{ByteCapacity, OffsetSpecification, ResponseCode};
use futures::{StreamExt};
use tokio::task;
```

Setting up is the same as the producer; we create a, consumer,
and declare the stream from which we're going to consume.
Note this matches up with the stream that `send` publishes to.

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
...
```

Note that we declare the stream here as well. Because we might start
the consumer before the producer, we want to make sure the stream exists
before we try to consume messages from it.

We need to use `Consumer` struct to create the consumer.

We're about to tell the server to deliver us the messages from the
queue. The `Consumer` provides the method `next()` to get the next message from the stream.

`offset` defines the starting point of the consumer.
In this case, we start from the first message.

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


    println!("Press any key to close the consumer");
     _ = stdin().read_line(&mut "".to_string());
```

[Here's the whole receive.rs
struct](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/src/bin/receive.rs).

### Putting It All Together

Open two terminals.

You can run the clients in any order, as both declare the stream.
We will run the consumer first so you can see it waiting for and then receiving the message:

```powershell
 cargo run --bin receive
```

Then run the producer:

```powershell
cargo run --bin send
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages, so try restarting
the publisher several times.

Streams are different from queues in that they are append-only logs of messages.
So you can run the different consumers and they will always start from the first message.
