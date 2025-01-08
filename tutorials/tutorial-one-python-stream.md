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
### (using the Python (rstream) Stream Client)

In this part of the tutorial we'll write two programs in Python; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the Python client API, concentrating on this very simple thing just to get
started.  It's the "Hello World" of RabbitMQ Streams.


> #### The Python (rstream) stream client library
>
> RabbitMQ speaks multiple protocols. This tutorial uses RabbitMQ stream protocol which is a dedicated
> protocol for [RabbitMQ streams](/docs/streams). There are a number of clients
> for RabbitMQ in [many different
> languages](/client-libraries/devtools), see the stream client libraries for each language.
> We'll use the [Python (rstream) stream client](https://github.com/qweeze/rstream) original built by George Fortunatov now supported by RabbitMQ.
>
> The client supports [Python >= 3.9](https://www.python.org/downloads/).
> This tutorial will use rstream client 0.19.1 version.
> Python (rstream) client 0.19.1 and later versions are distributed via [pip](https://pypi.org/project/rstream/).
>
> This tutorial assumes you are using powershell on Windows. On MacOS and Linux nearly
> any shell will work.

### Setup

First let's verify that you have the Python toolchain in your `PATH`:

```bash
python --help
```

Running that command should produce a help message.

An executable version of this tutorial can be found in the [RabbitMQ tutorials repository](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/).

Now let's create a folder project and install the dependencies:

```bash
# using pip
mkdir python-rstream
cd python-rstream
pip install rstream

# using Pipenv
mkdir python-rstream
cd python-rstream
pipenv install rstream
pipenv shell
```

Now create two new files named `send.py` and `receive.py`.
Now we have the Python project set up we can write some code.

### Sending


We'll call our message producer (sender) `send.py` and our message consumer (receiver) `receive.py`.
The producer will connect to RabbitMQ, send a single message, then exit.

In
[`send.py`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/send.py),
we need some imports:

```python
import asyncio
from rstream import Producer
```

then we can create a connection to the server:

```python
async with Producer(
        host="localhost",
        username="guest",
        password="guest",
    ) as producer
```

The entry point of the producer is the `Producer` class.
It is used for configuration of RabbitMQ stream publishers and streams themselves.

It abstracts the socket connection, and takes care of protocol version negotiation and authentication and so on for us.

This tutorial assumes that stream publisher and consumer connect to a RabbitMQ node running locally, that is, on _localhost_.
To connect to a node on a different machine, simply specify target hostname or IP address on the `Producers` parameters.

Next let's create a producer.

The producer will also declare a stream it will publish messages to and then publish a message:

```python

STREAM_NAME = "hello-python-stream"
# 5GB
STREAM_RETENTION = 5000000000

await producer.create_stream(
            STREAM_NAME, exists_ok=True, arguments={"MaxLengthBytes": STREAM_RETENTION})

await producer.send(stream=STREAM_NAME, message=b"Hello, World!")
```

The stream declaration operation is idempotent: the stream will only be created if it doesn't exist already.

A stream is an append-only log abstraction that allows for repeated consumption of messages until they expire.
It is a good practice to always define the retention policy.
In the example above, the stream is limited to be 5 GiB in size.

The message content is a byte array.
Applications can encode the data they need to transfer using any appropriate format such as JSON, MessagePack, and so on.

When the code above finishes running, the producer connection will be closed.
That's it for our producer.

Each time the producer is run, it will send a single message to the server and the message will be appended to the stream.

The complete [send.py file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/send.py) can be found on GitHub.

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

Similarly to `send.py`, [`receive.py`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/receive.py) needs some imports:

```python
import asyncio
import signal

from rstream import (
    AMQPMessage,
    Consumer,
    MessageContext,
    ConsumerOffsetSpecification,
    OffsetType
)
```

When it comes to the initial setup, the consumer part is very similar the producer one; we use the default connection settings and declare the stream from which the consumer will consume.

```python
consumer = Consumer(host="localhost", username="guest", password="guest")
await consumer.create_stream(
    STREAM_NAME, exists_ok=True, arguments={"MaxLengthBytes": STREAM_RETENTION}
)
```

Note that the consumer part also declares the stream.
This is to allow either part to be started first, be it the producer or the consumer.

We provide a `on_message` callback to the `consumer.subscribe` function.

`offset_specification` defines the starting point of the consumer.
In this case, the consumer starts from the very first message available in the stream.

```python
async def on_message(msg: AMQPMessage, message_context: MessageContext):
    stream = message_context.consumer.get_stream(message_context.subscriber_name)
    print("Got message: {} from stream {}".format(msg, stream))

await consumer.start()
await consumer.subscribe(
    stream=STREAM_NAME,
    callback=on_message,
    offset_specification=ConsumerOffsetSpecification(OffsetType.FIRST, None),
)
await consumer.run()
```

The complete [receive.py file](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/receive.py) can be found on GitHub.

### Putting It All Together

In order to run both examples, open two terminal (shell) tabs.

Both parts of this tutorial can be run in any order, as they both declare the stream.
Let's run the consumer first so that when the first publisher is started, the consumer will print it:

```shell
python receive.py
```

Then run the producer:

```shell
python send.py
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for new deliveries. Try re-running
the publisher several times to observe that.

Streams are different from queues in that they are append-only logs of messages
that can be consumed repeatedly. When multiple consumers consume from a stream,
they will start from the first available message.
