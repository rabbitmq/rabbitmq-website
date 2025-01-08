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

This part of the tutorial consists in writing two programs in Python; a producer that sends a wave of messages with a marker message at the end, and a consumer that receives messages and stops when it gets the marker message.
It shows how a consumer can navigate through a stream and can even restart where it left off in a previous execution.

This tutorial uses the [rstream Python client](https://github.com/qweeze/rstream).
Make sure to follow [the setup steps](/tutorials/tutorial-one-python-stream#setup) from the first tutorial.

An executable version of this tutorial can be found in the [RabbitMQ tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/).

Please note that the executable version is already implementing the [Server-Side Offset Tracking](#server-side-offset-tracking) feature explained at the end of this tutorial, and this needs to be take in account when testing this scenario.

The sending program is called `offset_tracking_send.py` and the receiving program is called `offset_tracking_receive.py`.
The tutorial focuses on the usage of the client library, so the final code in the repository should be used to create the scaffolding of the files (e.g. imports, main functions, etc).

### Sending

The sending program creates a `Producer` instance and publishes 100 messages.

The body value of the last message is set to `marker`; this is a marker for the consumer to stop consuming.

The program deals with message confirmations thanks to the `_on_publish_confirm_client` callback.

Note the use of a `asyncio.Condition`: The main routine is waiting on it until all the messages get confirmed in the `_on_publish_confirm_client` callback which then notifies the main routine.
This ensures the broker received all the messages before closing the program.

```python
STREAM = "stream-offset-tracking-python"
MESSAGES = 100
# 2GB
STREAM_RETENTION = 2000000000
confirmed_messages = 0
all_confirmed_messages_cond = asyncio.Condition()

async def _on_publish_confirm_client(confirmation: ConfirmationStatus) -> None:
    global confirmed_messages
    if confirmation.is_confirmed:
        confirmed_messages = confirmed_messages + 1
        if confirmed_messages == 100:
            async with all_confirmed_messages_cond:
                all_confirmed_messages_cond.notify()

async def publish():
    async with Producer("localhost", username="guest", password="guest") as producer:
        # create a stream if it doesn't already exist
        await producer.create_stream(
            STREAM, exists_ok=True, arguments={"max-length-bytes": STREAM_RETENTION}
        )

        print("Publishing {} messages".format(MESSAGES))
        # Send 99 hello message
        for i in range(MESSAGES - 1):
            amqp_message = AMQPMessage(
                body=bytes("hello: {}".format(i), "utf-8"),
            )

            await producer.send(
                stream=STREAM,
                message=amqp_message,
                on_publish_confirm=_on_publish_confirm_client,
            )
        # Send a final marker message
        amqp_message = AMQPMessage(
            body=bytes("marker: {}".format(i + 1), "utf-8"),
        )

        await producer.send(
            stream=STREAM,
            message=amqp_message,
            on_publish_confirm=_on_publish_confirm_client,
        )

        async with all_confirmed_messages_cond:
            await all_confirmed_messages_cond.wait()

        print("Messages confirmed.")


asyncio.run(publish())
```

Let's now create the receiving program.

### Receiving

The receiving program starts a consumer that attaches at the beginning of the stream `ConsumerOffsetSpecification(OffsetType.FIRST)`.
It uses two variables: `first_offset` and `last_offset` to output the offsets of the first and last received messages at the end of the program.
The `on_message` callback handles incoming messages.
The consumer stops when it receives the marker message: it assigns the message offset to a `last_offset` variable and closes the consumer.

```python
message_count = -1
first_offset = -1
last_offset = -1
STREAM_NAME = "stream-offset-tracking-python"
# 2GB
STREAM_RETENTION = 2000000000

async def on_message(msg: AMQPMessage, message_context: MessageContext):
    global first_offset
    global last_offset

    offset = message_context.offset
    if first_offset == -1:
        print("First message received")
        first_offset = offset

    consumer = message_context.consumer
    stream = message_context.consumer.get_stream(message_context.subscriber_name)

    if "marker" in str(msg):
        last_offset = offset
        await consumer.close()

async def consume():

    global first_offset
    global last_offset

    consumer = Consumer(
        host="localhost",
        port=5552,
        username="guest",
        password="guest",
    )

    await consumer.create_stream(
        STREAM_NAME, exists_ok=True, arguments={"max-length-bytes": STREAM_RETENTION}
    )

    try:
        await consumer.start()
        print("Starting consuming Press control +C to close")

        await consumer.subscribe(
            stream=STREAM_NAME,
            callback=on_message,
            decoder=amqp_decoder,
            offset_specification=ConsumerOffsetSpecification(
                OffsetType.FIRST
            ),
        )
        await consumer.run()

    except (KeyboardInterrupt, asyncio.exceptions.CancelledError):
        await consumer.close()

    # give time to the consumer task to close the consumer
    await asyncio.sleep(1)

    if first_offset != -1:
        print(
            "Done consuming first_offset: {} last_offset {} ".format(
                first_offset, last_offset
            )
        )


with asyncio.Runner() as runner:
    runner.run(consume())

```

### Exploring the Stream

In order to run both examples, open two terminal (shell) tabs.

In the first tab, run the sender to publish a wave of messages:

```shell
 python3 offset_tracking_send.py
```

The output is the following:

```shell
Publishing 100 messages...
Messages confirmed: true.
```

Let's run now the receiver.
Open a new tab.
Remember it should start from the beginning of the stream because of the `FIRST` offset specification.

```shell
 python3 offset_tracking_receive.py
```

Here is the output:

```shell
Started consuming: Press control +C to close
First message received.
Done consuming, first offset 0, last offset 99.
```

:::note[What is an offset?]
A stream can be seen as an array where elements are messages.
The offset is the index of a given message in the array.
:::

A stream is different from a queue: consumers can read and re-read the same messages and the messages stay in the stream.

Let's try this feature by using the `ConsumerOffsetSpecification(OffsetType.OFFSET, long)` specification to attach at a given offset different from 0.
Set the `ConsumerOffsetSpecification` variable in the subscribe method of the consumer from:

```python
offset_specification=ConsumerOffsetSpecification(
    OffsetType.FIRST
),
```

to:

```python
offset_specification = ConsumerOffsetSpecification(
    OffsetType.OFFSET, 42
)
```

Offset 42 is arbitrary, it could have been any number between 0 and 99.
Run the receiver again:

```shell
 python3 offset_tracking_receive.py
```

The output is the following:

```shell
Started consuming: Press control +C to close
First message received.
Done consuming, first offset 42, last offset 99.
```

There is also a way to attach at the very end of stream to see only new messages at the time of the consumer creation.
This is the `ConsumerOffsetSpecification(OffsetType.NEXT)` offset specification.
Let's try it:

```python
offset_specification = ConsumerOffsetSpecification(
    OffsetType.NEXT)
```

Run the receiver:

```shell
 python3 offset_tracking_receive.py
```

This time the consumer does not get any messages:

```shell
Started consuming: Press control +C to close
```

It is waiting for new messages in the stream.
Let's publish some by running the sender again.
Back to the first tab:

```shell
 python3 offset_tracking_send.py
```

Wait for the program to exit and switch back to the receiver tab.
The consumer received the new messages:

```shell
Started consuming: Press control +C to close
First message received.
Done consuming, first offset 100, last offset 199.
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

```python
async def on_message(msg: AMQPMessage, message_context: MessageContext):
    # variable to keep track of the number of received messages
    global message_count
    global first_offset
    global last_offset

    offset = message_context.offset
    if first_offset == -1:
        print("First message received")
        first_offset = offset

    consumer = message_context.consumer
    stream = message_context.consumer.get_stream(message_context.subscriber_name)

    # store the offset after every 10 messages received
    message_count = message_count + 1

    if message_count % 10 == 0:
        # store_message needs to take a subscriber_name parameter
        await consumer.store_offset(
            stream=stream,
            offset=offset,
            subscriber_name=message_context.subscriber_name,
        )

    # store the offset after receiving the marker message
    if "marker" in str(msg):
        await consumer.store_offset(
            stream=stream,
            offset=offset,
            subscriber_name=message_context.subscriber_name,
        )
        last_offset = offset
        await consumer.close()

async def consume():
    # the offset to start consuming from
    stored_offset = -1
    global first_offset
    global last_offset

    # start a consumer and creates the stream is not exist (same as before...)

    try:
        await consumer.start()
        print("Started consuming: Press control +C to close")
        try:
            # query_offset must take a subscriber_name as parameter
            stored_offset = await consumer.query_offset(
                stream=STREAM_NAME, subscriber_name="subscriber_1"
            )
        except OffsetNotFound as offset_exception:
            print(f"Offset not previously stored. {offset_exception}")

        except ServerError as server_error:
            print(f"Server error: {server_error}")
            exit(1)

        # if no offset was previously stored start from the first offset
        stored_offset = stored_offset + 1
        await consumer.subscribe(
            stream=STREAM_NAME,
             # We explicitely need to assign a name to the consumer
            subscriber_name="subscriber_1",       
            callback=on_message,
            decoder=amqp_decoder,
            offset_specification=ConsumerOffsetSpecification(
                OffsetType.OFFSET, stored_offset
            ),
        )
        await consumer.run()

    except (KeyboardInterrupt, asyncio.exceptions.CancelledError):
        await consumer.close()

```

The most relevant changes are:
* The consumer must have a name.
It is the key to store and retrieve the last stored offset value.
* The offset is stored every 10 messages.
This is an unusually low value for offset storage frequency, but this is OK for this tutorial.
Values in the real world are rather in the hundreds or in the thousands.
* The offset is stored before closing the consumer, just after getting the marker message.

Let's run the receiver:

```shell
 python3 offset_tracking_receive.py
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
 python3 offset_tracking_receive.py
```

Here is the output:

```shell
Started consuming...
First message received.
Done consuming, first offset 100, last offset 199.
```

The consumer restarted exactly where it left off: the last offset in the first run was 99 and the first offset in this second run is 100.
The consumer stored offset tracking information in the first run, so the client library uses it to resume consuming at the right position in the second run.

This concludes this tutorial on consuming semantics in RabbitMQ Streams.
It covered how a consumer can attach anywhere in a stream.
Consuming applications are likely to keep track of the point they reached in a stream.
They can use the built-in server-side offset tracking feature as demonstrated in this tutorial.
They are also free to use any other data store solution for this task.

See the [RabbitMQ blog](https://www.rabbitmq.com/blog/2021/09/13/rabbitmq-streams-offset-tracking) and [rstream documentation](https://github.com/qweeze/rstream?tab=readme-ov-file#server-side-offset-tracking) for more information on offset tracking.
