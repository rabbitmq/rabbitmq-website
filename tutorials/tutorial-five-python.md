---
title: RabbitMQ tutorial - Topics
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
import T5DiagramTopicX from '@site/src/components/Tutorials/T5DiagramTopicX.md';

# RabbitMQ tutorial - Topics

## Topics
### (using the Pika Python client)

<TutorialsHelp/>

### Prerequisites

As with other Python tutorials, we will use the [Pika](https://pypi.python.org/pypi/pika) RabbitMQ client
[version 1.0.0](https://pika.readthedocs.io/en/stable/).

### What This Tutorial Focuses On

In the [previous tutorial](./tutorial-four-python) we improved our
logging system. Instead of using a `fanout` exchange only capable of
dummy broadcasting, we used a `direct` one, and gained a possibility
of selectively receiving the logs.

Although using the `direct` exchange improved our system, it still has
limitations - it can't do routing based on multiple criteria.

In our logging system we might want to subscribe to not only logs
based on severity, but also based on the source which emitted the log.
You might know this concept from the
[`syslog`](https://en.wikipedia.org/wiki/Syslog) unix tool, which
routes logs based on both severity (info/warn/crit...) and facility
(auth/cron/kern...).

That would give us a lot of flexibility - we may want to listen to
just critical errors coming from 'cron' but also all logs from 'kern'.

To implement that in our logging system we need to learn about a more
complex `topic` exchange.


Topic exchange
--------------

Messages sent to a `topic` exchange can't have an arbitrary
`routing_key` - it must be a list of words, delimited by dots. The
words can be anything, but usually they specify some features
connected to the message. A few valid routing key examples:
`stock.usd.nyse`, `nyse.vmw`, `quick.orange.rabbit`. There can be as
many words in the routing key as you like, up to the limit of 255
bytes.

The binding key must also be in the same form. The logic behind the
`topic` exchange is similar to a `direct` one - a message sent with a
particular routing key will be delivered to all the queues that are
bound with a matching binding key. However there are two important
special cases for binding keys:

  * `*` (star) can substitute for exactly one word.
  * `#` (hash) can substitute for zero or more words.

It's easiest to explain this in an example:

<T5DiagramTopicX/>

In this example, we're going to send messages which all describe
animals. The messages will be sent with a routing key that consists of
three words (two dots). The first word in the routing key
will describe a celerity, second a colour and third a species:
`<celerity>.<colour>.<species>`.

We created three bindings: Q1 is bound with binding key `*.orange.*`
and Q2 with `*.*.rabbit` and `lazy.#`.

These bindings can be summarised as:

  * Q1 is interested in all the orange animals.
  * Q2 wants to hear everything about rabbits, and everything about lazy
    animals.

A message with a routing key set to `quick.orange.rabbit`
will be delivered to both queues. Message
`lazy.orange.elephant` also will go to both of them. On the other hand
`quick.orange.fox` will only go to the first queue, and
`lazy.brown.fox` only to the second. `lazy.pink.rabbit` will
be delivered to the second queue only once, even though it matches two bindings.
`quick.brown.fox` doesn't match any binding so it will be discarded.

What happens if we break our contract and send a message with one or
four words, like `orange` or `quick.orange.new.rabbit`? Well,
these messages won't match any bindings and will be lost.

On the other hand `lazy.orange.new.rabbit`, even though it has four
words, will match the last binding and will be delivered to the second
queue.

> #### Topic exchange
>
> Topic exchange is powerful and can behave like other exchanges.
>
> When a queue is bound with `#` (hash) binding key - it will receive
> all the messages, regardless of the routing key - like in `fanout` exchange.
>
> When special characters `*` (star) and `#` (hash) aren't used in bindings,
> the topic exchange will behave just like a `direct` one.

Putting it all together
-----------------------

We're going to use a `topic` exchange in our logging system. We'll
start off with a working assumption that the routing keys of logs will
have two words: `<facility>.<severity>`.

The code is almost the same as in the
[previous tutorial](./tutorial-four-python).

`emit_log_topic.py` ([source](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python/emit_log_topic.py))

```python
#!/usr/bin/env python
import pika
import sys

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

channel.exchange_declare(exchange='topic_logs', exchange_type='topic')

routing_key = sys.argv[1] if len(sys.argv) > 2 else 'anonymous.info'
message = ' '.join(sys.argv[2:]) or 'Hello World!'
channel.basic_publish(
    exchange='topic_logs', routing_key=routing_key, body=message)
print(f" [x] Sent {routing_key}:{message}")
connection.close()
```

`receive_logs_topic.py` ([source](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/python/receive_logs_topic.py))

```python
#!/usr/bin/env python
import pika
import sys

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

channel.exchange_declare(exchange='topic_logs', exchange_type='topic')

result = channel.queue_declare('', exclusive=True)
queue_name = result.method.queue

binding_keys = sys.argv[1:]
if not binding_keys:
    sys.stderr.write("Usage: %s [binding_key]...\n" % sys.argv[0])
    sys.exit(1)

for binding_key in binding_keys:
    channel.queue_bind(
        exchange='topic_logs', queue=queue_name, routing_key=binding_key)

print(' [*] Waiting for logs. To exit press CTRL+C')


def callback(ch, method, properties, body):
    print(f" [x] {method.routing_key}:{body}")


channel.basic_consume(
    queue=queue_name, on_message_callback=callback, auto_ack=True)

channel.start_consuming()
```

To receive all the logs run:

```bash
python receive_logs_topic.py "#"
```

To receive all logs from the facility `kern`:

```bash
python receive_logs_topic.py "kern.*"
```

Or if you want to hear only about `critical` logs:

```bash
python receive_logs_topic.py "*.critical"
```

You can create multiple bindings:

```bash
python receive_logs_topic.py "kern.*" "*.critical"
```

And to emit a log with a routing key `kern.critical` type:

```bash
python emit_log_topic.py "kern.critical" "A critical kernel error"
```

Have fun playing with these programs. Note that the code doesn't make
any assumption about the routing or binding keys, you may want to play
with more than two routing key parameters.

Move on to [tutorial 6](./tutorial-six-python) to learn about *RPC*.
