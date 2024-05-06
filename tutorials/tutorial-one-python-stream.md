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
### (using the Python (rstream) Stream Client)

In this part of the tutorial we'll write two programs in Python; a
producer that sends a single message, and a consumer that receives
messages and prints them out.  We'll gloss over some of the detail in
the Python client API, concentrating on this very simple thing just to get
started.  It's a "Hello World" of messaging.


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

First let's verify that you have Python toolchain in `PATH`:

```powershell
python3 --help
```

should produce a help message.

Now let's create a folder project and install the dependencies:

```powershell
mkdir python-restream
cd python-restream
pip install mmh3 
pip install uamqp
pip install rstream
```


Now create new files named `send.py` and `receive.py`. 
Now we have thePython project set up we can write some code.

### Sending


We'll call our message producer (sender) `send.py` and our message consumer (receiver)
`receive.py`.  The producer will connect to RabbitMQ, send a single message,
then exit.

In
[`send.py`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/send.py),
we need some import:

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
...
```
The entry point of the producer is the `Producer` class.
It deals with stream management and the creation of publisher instances. 

It abstracts the socket connection, and takes care of
protocol version negotiation and authentication and so on for us. Here
we connect to a RabbitMQ node on the local machine - hence the
_localhost_. If we wanted to connect to a node on a different
machine we'd simply specify its hostname or IP address on the `Producer` parameters.

To send, we must declare a stream for us to send to; then we can publish a message
to the stream:

```python
import asyncio

from rstream import Producer

STREAM_NAME = "hello-python-stream"
# 5GB
STREAM_RETENTION = 5000000000


async def send():
    async with Producer(
        host="localhost",
        username="guest",
        password="guest",
    ) as producer:
        await producer.create_stream(
            STREAM_NAME, exists_ok=True, arguments={"MaxLengthBytes": STREAM_RETENTION}
        )

        await producer.send(stream=STREAM_NAME, message=b"Hello, World!")

        print(" [x] Hello, World! message sent")

        input(" [x] Press Enter to close the producer  ...")


asyncio.run(send())
```

Declaring a stream is idempotent - it will only be created if it doesn't exist already.

Streams model an append-only log of messages that can be repeatedly read until they expire.
It is a good practice to always define the retention policy, 5Gb in this case.

The message content is a byte array, so you can encode whatever you like there.

When the code above finishes running, the producer connection and stream-system
connection will be closed. That's it for our producer.

Each time you run the producer, it will send a single message to the server and the message will be 
appended to the stream.

[Here's the whole send.py
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/send.py).

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


The code (in [`receive.py`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/receive.py)) 
needs some `import` statements:

```python
import asyncio
import signal

from rstream import AMQPMessage, Consumer, MessageContext
```

Setting up is the same as the producer; we create a stream-system,
consumer, and declare the stream from which we're going to consume.
Note this matches up with the stream that `send` publishes to.

```python
...
consumer = Consumer(host="localhost", username="guest", password="guest")
    await consumer.create_stream(
        STREAM_NAME, exists_ok=True, arguments={"MaxLengthBytes": STREAM_RETENTION}
    )

...
```

Note that we declare the stream here as well. Because we might start
the consumer before the producer, we want to make sure the stream exists
before we try to consume messages from it.

We're about to tell the server to deliver us the messages from the
stream. We provide a callback `on_message` on the `consumer.subscribe`.

`offset_specification` defines the starting point of the consumer. 
In this case, we start from the first message. 


```python
import asyncio
import signal

from rstream import AMQPMessage, Consumer, MessageContext

STREAM_NAME = "hello-python-stream"
# 5GB
STREAM_RETENTION = 5000000000


async def receive():
    consumer = Consumer(host="localhost", username="guest", password="guest")
    await consumer.create_stream(
        STREAM_NAME, exists_ok=True, arguments={"MaxLengthBytes": STREAM_RETENTION}
    )

    loop = asyncio.get_event_loop()
    loop.add_signal_handler(
        signal.SIGINT, lambda: asyncio.create_task(consumer.close())
    )

    async def on_message(msg: AMQPMessage, message_context: MessageContext):
        stream = message_context.consumer.get_stream(message_context.subscriber_name)
        print("Got message: {} from stream {}".format(msg, stream))

    print("Press control +C to close")
    await consumer.start()
      await consumer.subscribe(
        stream=STREAM_NAME,
        callback=on_message,
        offset_specification=ConsumerOffsetSpecification(OffsetType.FIRST, None),
    )
    await consumer.run()
    # give time to the consumer task to close the consumer
    await asyncio.sleep(1)


asyncio.run(receive())
```


[Here's the whole receive.py
class](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python-stream/receive.py).

### Putting It All Together

Open two terminals.

You can run the clients in any order, as both declare the stream.
We will run the consumer first so you can see it waiting for and then receiving the message:

```powershell
python receive.py
```
Then run the producer:

```powershell
python send.py
```

The consumer will print the message it gets from the publisher via
RabbitMQ. The consumer will keep running, waiting for messages, so try restarting
the publisher several times.

Streams are different from queues in that they are append-only logs of messages.
So you can run the different consumers and they will always start from the first message.

[//]: # (Time to move on to [part 2]&#40;./tutorial-two-dotnet-stream&#41; and deal with a confirmation.)
