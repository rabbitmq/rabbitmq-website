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

This part of the tutorial consists in writing two programs in Rust; a producer that sends a wave of messages with a marker message at the end, and a consumer that receives messages and stops when it gets the marker message.
It shows how a consumer can navigate through a stream and can even restart where it left off in a previous execution.

This tutorial uses [the stream Rust client](https://github.com/rabbitmq/rabbitmq-stream-rust-client).
Make sure to follow [the setup steps](/tutorials/tutorial-one-rust-stream#setup) from the first tutorial.

An executable version of this tutorial can be found in the [RabbitMQ tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/rust-stream/).

Please note that the executable version is already implementing the [Server-Side Offset Tracking](#server-side-offset-tracking) section explained at the end of this tutorial, and this needs to be take in account when testing this scenario.

The sending program is called `offset_tracking_send.rs` and the receiving program is called `receive_offset_tracking.rs`.
The tutorial focuses on the usage of the client library, so the final code in the repository should be used to create the scaffolding of the files (e.g. imports, main functions, etc).

### Sending

The sending program starts by instantiating the `Environment` and creating the stream:

```rust
let create_response = environment
    .stream_creator()
    .max_length(ByteCapacity::GB(2))
    .create(stream)
    .await;

if let Err(e) = create_response {
    if let StreamCreateError::Create { stream, status } = e {
        match status {
            // we can ignore this error because the stream already exists
            ResponseCode::StreamAlreadyExists => {}
            err => {
                println!("Error creating stream: {:?} {:?}", stream, err);
                std::process::exit(1);
            }
        }
    }
}
```

The program then creates a `Producer` instance and publishes 100 messages.
The body value of the last message is set to `marker`; this is a marker for the consumer to stop consuming.


Note the use of a `tokio::sync::Notify`: The main routine is waiting for it until all the messages get confirmed by the confirmation callback.
This ensures the broker received all the messages before closing the program.

```rust
let producer = environment.producer().build(stream).await?;

println!("Publishing {:?} messages", message_count);

for i in 0..message_count {
    let msg;
    if i < message_count - 1 {
        msg = Message::builder().body(format!("hello{}", i)).build();
    } else {
        msg = Message::builder().body(format!("marker{}", i)).build();
    };

    let counter = confirmed_messages.clone();
    let notifier = notify_on_send.clone();
    producer
        .send(msg, move |_| {
            let inner_counter = counter.clone();
            let inner_notifier = notifier.clone();
            async move {
                if inner_counter.fetch_add(1, Ordering::Relaxed) == message_count - 1 {
                    inner_notifier.notify_one();
                }
            }
        })
        .await?;
}

notify_on_send.notified().await;
println!("Messages confirmed: True");
producer.close().await?;
```

Let's now create the receiving program.

### Receiving

The receiving program creates an `Environment` instance and makes sure the stream is created as well.
This part of the code is the same as in the sending program, so it is skipped in the next code snippets for brevity's sake.

The receiving program starts a consumer that attaches at the beginning of the stream `OffsetSpecification::First`.
It uses two variables: `first_offset` and `last_offset` to output the offsets of the first and last received messages at the end of the program.

The consumer stops when it receives the marker message: it assigns the offset to the `last_offset` variable and closes the consumer.

```rust
let mut first_offset: Option<u64> = None;
let mut last_offset: Option<u64> = None;
let mut consumer = environment
    .consumer()
    .offset(OffsetSpecification::First)
    .build(stream)
    .await
    .unwrap();

while let Some(delivery) = consumer.next().await {
    let d = delivery.unwrap();

    if !first_offset.is_some()  {
        println!("First message received");
        first_offset = Some(d.offset());
    }

    if  String::from_utf8_lossy(d.message().data().unwrap()).contains("marker")
    {
        last_offset = Some(d.offset());
        let handle = consumer.handle();
        _ = handle.close().await;
        break;
    }
}

if first_offset.is_some() {
    println!(
        "Done consuming first_offset: {:?} last_offset: {:?}  ", first_offset.unwrap(), last_offset.unwrap())
}
```

### Exploring the Stream

In order to run both examples, open two terminal (shell) tabs.

In the first tab, run the sender to publish a wave of messages:

```shell
 cargo run --bin send_offset_tracking
```

The output is the following:

```shell
Publishing 100 messages
Messages confirmed: True
```

Let's run now the receiver.
Open a new tab.
Remember it should start from the beginning of the stream because of the `OffsetSpecification::First` offset specification.

```shell
  cargo run --bin receive_offset_tracking
```

Here is the output:

```shell
Started consuming
consuming first message
Done consuming first_offset: 0 last_offset: 99
```

:::note[What is an offset?]
A stream can be seen as an array where elements are messages.
The offset is the index of a given message in the array.
:::

A stream is different from a queue: consumers can read and re-read the same messages and the messages stay in the stream.

Let's try this feature by using the `OffsetSpecification::Offset` specification to attach at a given offset different from 0.
When creating the environment for the Consumer, set the `OffsetSpecification` variable from 

```rust
consumer = environment
    .consumer()
    .offset(OffsetSpecification::First)
    .build(stream)
    .await
    .unwrap();
```

to:

```rust
consumer = environment
    .consumer()
    .offset(OffsetSpecification::Offset(42))
    .build(stream)
    .await
    .unwrap();
```

Offset 42 is arbitrary, it could have been any number between 0 and 99.
Run the receiver again:

```shell
 cargo run --bin receive_offset_tracking
```

Here is the output:

```shell
Started consuming:
First message received.
Done consuming first_offset: 42 last_offset: 99
```

There is also a way to attach at the very end of stream to see only new messages at the time of the consumer creation.
This is the `OffsetSpecification::Next` offset specification.
Let's try it:

```rust
consumer = environment
    .consumer()
    .offset(OffsetSpecification::Next)
    .build(stream)
    .await
    .unwrap();
```

Run the receiver:

```shell
 cargo run --bin receive_offset_tracking
```

This time the consumer does not get any messages:

```shell
Started consuming
```

It is waiting for new messages in the stream.
Let's publish some by running the sender again.
Back to the first tab:

```shell
 cargo run --bin send_offset_tracking
```

Wait for the program to exit and switch back to the receiver tab.
The consumer received the new messages:

```shell
Started consuming
First message received.
Done consuming first_offset: 100 last_offset: 199
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

```rust
let mut first_offset: Option<u64> = None;
let mut last_offset: Option<u64> = None;
let mut consumer = environment
    .consumer()
    // The consumer needs a name to use Server-Side Offset Tracking
    .name("consumer-1")
    .offset(OffsetSpecification::First)
    .build(stream)
    .await
    .unwrap();

println!("Started consuming");

// We can query if a stored offset exists
let mut stored_offset: u64 = consumer.query_offset().await.unwrap_or_else(|_| 0);

if stored_offset >  0 {
    stored_offset += 1;
}
consumer = environment
    .consumer()
    // The consumer needs a name to use Server-Side Offset Tracking
    .name("consumer-1")
    .offset(OffsetSpecification::Offset(stored_offset))
    .build(stream)
    .await
    .unwrap();

let mut received_messages: i64 = -1;
while let Some(delivery) = consumer.next().await {
    let d = delivery.unwrap();

    if !first_offset.is_some()  {
        first_offset = Some(d.offset());
    }
    consumer = environment
        .consumer()
        // The consumer needs a name to use Server-Side Offset Tracking
        .name("consumer-1")
        .offset(OffsetSpecification::Offset(stored_offset))
        .build(stream)
        .await
        .unwrap();

    let mut received_messages: i64 = -1;
    while let Some(delivery) = consumer.next().await {
        let d = delivery.unwrap();

        if !first_offset.is_some()  {
            println!("First message received");
            first_offset = Some(d.offset());
        }
        received_messages = received_messages + 1;
        if received_messages % 10 == 0
            || String::from_utf8_lossy(d.message().data().unwrap()).contains("marker")
        {
            // We store the offset in the server
            let _ = consumer
                .store_offset(d.offset())
                .await
                .unwrap_or_else(|e| println!("Err: {}", e));
            if String::from_utf8_lossy(d.message().data().unwrap()).contains("marker") {
                last_offset = Some(d.offset());
                let handle = consumer.handle();
                _ = handle.close().await;
                break;
            }
        }
    }
}

if first_offset.is_some() {
    println!(
        "Done consuming first_offset: {:?} last_offset: {:?}  ", first_offset.unwrap(), last_offset.unwrap())
}
```


Let's run the receiver:

```shell
 cargo run --bin receive_offset_tracking
```

Here is the output:

```shell
Started consuming: Press control +C to close
First message received.
Done consuming, first offset 0, last offset 99.
```

There is nothing surprising there: the consumer got the messages from the beginning of the stream and stopped when it reached the marker message. 

Let's start it another time:

```shell
cargo run --bin receive_offset_tracking
```

Here is the output:

```shell
Started consuming
First message received.
Done consuming first_offset: 100 last_offset: 199
```

The most relevant implementations are:
* The consumer must have a name.
It is the key to store and retrieve the last stored offset value.
* The offset is stored every 10 messages.
This is an unusually low value for offset storage frequency, but this is OK for this tutorial.
Values in the real world are rather in the hundreds or in the thousands.
* The offset is stored before closing the consumer, just after getting the marker message.

The consumer restarted exactly where it left off: the last offset in the first run was 99 and the first offset in this second run is 100.
Note the `OffsetSpecification::First` offset specification is ignored: a stored offset takes precedence over the offset specification parameter.
The consumer stored offset tracking information in the first run, so the client library uses it to resume consuming at the right position in the second run.

This concludes this tutorial on consuming semantics in RabbitMQ Streams.
It covered how a consumer can attach anywhere in a stream.
Consuming applications are likely to keep track of the point they reached in a stream.
They can use the built-in server-side offset tracking feature as demonstrated in this tutorial.
They are also free to use any other data store solution for this task.

See the [RabbitMQ blog](https://www.rabbitmq.com/blog/2021/09/13/rabbitmq-streams-offset-tracking) for more information on offset tracking.
