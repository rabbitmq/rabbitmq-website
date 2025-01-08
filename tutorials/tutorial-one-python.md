---
title: RabbitMQ tutorial - "Hello world!"
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

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';
import TutorialsIntro from '@site/src/components/Tutorials/TutorialsIntro.md';
import T1DiagramHello from '@site/src/components/Tutorials/T1DiagramHello.md';
import T1DiagramSending from '@site/src/components/Tutorials/T1DiagramSending.md';
import T1DiagramReceiving from '@site/src/components/Tutorials/T1DiagramReceiving.md';

# RabbitMQ tutorial - "Hello world!"

## Introduction

<TutorialsHelp/>
<TutorialsIntro/>

## Hello World!

### (using the Pika Python client)

In this part of the tutorial we'll write two small programs in Python; a
producer (sender) that sends a single message, and a consumer (receiver) that receives
messages and prints them out. It's the "Hello World" of messaging.

In the diagram below, "P" is our producer and "C" is our consumer. The
box in the middle is a queue - a message buffer that RabbitMQ keeps
on behalf of the consumer.

Our overall design will look like:

<T1DiagramHello/>

Producer sends messages to the "hello" queue. The consumer receives
messages from that queue.

> #### RabbitMQ libraries
>
> RabbitMQ speaks multiple protocols. This tutorial uses AMQP 0-9-1, which is an open,
> general-purpose protocol for messaging. There are a number of clients for RabbitMQ
> in [many different languages](/client-libraries/devtools).  In this tutorial
> series we're going to use [Pika 1.0.0](https://pika.readthedocs.org/en/stable/),
> which is the Python client recommended
> by the RabbitMQ team. To install it you can use the
> [`pip`](https://pip.pypa.io/en/stable/quickstart/) package management tool:
>
> ```bash
> python -m pip install pika --upgrade
> ```

Now we have Pika installed, we can write some
code.

### Sending

<T1DiagramSending/>

Our first program `send.py` will send a single message to the queue.
The first thing we need to do is to establish a connection with
RabbitMQ server.

```python
#!/usr/bin/env python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
```

We're connected now, to a broker on the local machine - hence the
_localhost_. If we wanted to connect to a broker on a different
machine we'd simply specify its name or IP address here.

Next, before sending we need to make sure the recipient queue
exists. If we send a message to non-existing location, RabbitMQ will
just drop the message. Let's create a _hello_ queue to which the message will
be delivered:

```python
channel.queue_declare(queue='hello')
```

At this point we're ready to send a message. Our first message will
just contain a string _Hello World!_ and we want to send it to our
_hello_ queue.

In RabbitMQ a message can never be sent directly to the queue, it always
needs to go through an _exchange_. But let's not get dragged down by the
details &#8210; you can read more about _exchanges_ in [the third part of this
tutorial](./tutorial-three-python). All we need to know now is how to use a default exchange
identified by an empty string. This exchange is special &#8210; it
allows us to specify exactly to which queue the message should go.
The queue name needs to be specified in the `routing_key` parameter:

```python
channel.basic_publish(exchange='',
                      routing_key='hello',
                      body='Hello World!')
print(" [x] Sent 'Hello World!'")
```

Before exiting the program we need to make sure the network buffers
were flushed and our message was actually delivered to RabbitMQ. We
can do it by gently closing the connection.

```python
connection.close()
```

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


### Receiving

<T1DiagramReceiving/>

Our second program `receive.py` will receive messages from the queue and print
them on the screen.

Again, first we need to connect to RabbitMQ server. The code
responsible for connecting to Rabbit is the same as previously.

The next step, just like before, is to make sure that the queue
exists. Creating a queue using `queue_declare` is idempotent &#8210; we
can run the command as many times as we like, and only one will be
created.

```python
channel.queue_declare(queue='hello')
```

You may ask why we declare the queue again &#8210; we have already declared it
in our previous code. We could avoid that if we were sure
that the queue already exists. For example if `send.py` program was
run before. But we're not yet sure which
program to run first. In such cases it's a good practice to repeat
declaring the queue in both programs.

> #### Listing queues
>
> You may wish to see what queues RabbitMQ has and how many
> messages are in them. You can do it (as a privileged user) using the `rabbitmqctl` tool:
>
> ```bash
> sudo rabbitmqctl list_queues
> ```
>
> On Windows, omit the sudo:
> ```PowerShell
> rabbitmqctl.bat list_queues
> ```

Receiving messages from the queue is more complex. It works by subscribing
a `callback` function to a queue. Whenever we receive
a message, this `callback` function is called by the Pika library.
In our case this function will print on the screen the contents of
the message.

```python
def callback(ch, method, properties, body):
    print(f" [x] Received {body}")
```

Next, we need to tell RabbitMQ that this particular callback function should
receive messages from our _hello_ queue:

```python
channel.basic_consume(queue='hello',
                      auto_ack=True,
                      on_message_callback=callback)
```

For that command to succeed we must be sure that a queue which we want
to subscribe to exists. Fortunately we're confident about that &#8210; we've
created a queue above &#8210; using `queue_declare`.

The `auto_ack` parameter will be described [later on](./tutorial-two-python).

And finally, we enter a never-ending loop that waits for data and runs callbacks
whenever necessary, and catch `KeyboardInterrupt` during program shutdown.

```python
print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
```

```python
if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
```

### Putting it all together

`send.py` ([source](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python/send.py))

```python
#!/usr/bin/env python
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

channel.queue_declare(queue='hello')

channel.basic_publish(exchange='', routing_key='hello', body='Hello World!')
print(" [x] Sent 'Hello World!'")
connection.close()
```

`receive.py` ([source](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python/receive.py))

```python
#!/usr/bin/env python
import pika, sys, os

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    channel.queue_declare(queue='hello')

    def callback(ch, method, properties, body):
        print(f" [x] Received {body}")

    channel.basic_consume(queue='hello', on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
```

Now we can try out our programs in a terminal. First, let's start
a consumer, which will run continuously waiting for deliveries:

```bash
python receive.py
# => [*] Waiting for messages. To exit press CTRL+C
```

Now start the producer in a new terminal. The producer program will stop after every run:

```bash
python send.py
# => [x] Sent 'Hello World!'
```

The consumer will print the message:

```bash
# => [*] Waiting for messages. To exit press CTRL+C
# => [x] Received 'Hello World!'
```

Hurray! We were able to send our first message through RabbitMQ. As you might
have noticed, the `receive.py` program doesn't exit. It will stay ready to
receive further messages, and may be interrupted with Ctrl-C.

Try to run `send.py` again in a new terminal.

We've learned how to send and receive a message from a named
queue. It's time to move on to [part 2](./tutorial-two-python)
and build a simple _work queue_.
