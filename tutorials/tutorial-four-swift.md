---
title: RabbitMQ tutorial - Routing
---

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';
import T4DiagramDirectX from '@site/src/components/Tutorials/T4DiagramDirectX.md';
import T4DiagramMultipleBindings from '@site/src/components/Tutorials/T4DiagramMultipleBindings.md';
import T4DiagramFull from '@site/src/components/Tutorials/T4DiagramFull.md';

# RabbitMQ tutorial - Routing

## Routing
### (using the [Objective-C client][client])

<TutorialsHelp/>

In the [previous tutorial][previous] we built a
simple logging system. We were able to broadcast log messages to many
receivers.

In this tutorial we're going to add a feature to it - we're going to
make it possible to subscribe only to a subset of the messages. For
example, we will be able to direct only critical error messages to the
log file (to save disk space), while still being able to print all of
the log messages on the console.


Bindings
--------

In previous examples we were already creating bindings. You may recall
code like:

```swift
q.bind(exchange)
```

A binding is a relationship between an exchange and a queue. This can
be simply read as: the queue is interested in messages from this
exchange.

Bindings can take an extra `routingKey` parameter. To avoid the
confusion with an `RMQExchange publish:` parameter we're going to call it a
`binding key`. This is how we could create a binding with a key:

```swift
q.bind(exchange, routingKey: "black")
```

The meaning of a binding key depends on the exchange type. The
`fanout` exchanges, which we used previously, simply ignored its
value.

Direct exchange
---------------

Our logging system from the previous tutorial broadcasts all messages
to all consumers. We want to extend that to allow filtering messages
based on their severity. For example we may want the script which is
writing log messages to the disk to only receive critical errors, and
not waste disk space on warning or info log messages.

We were using a `fanout` exchange, which doesn't give us much
flexibility - it's only capable of mindless broadcasting.

We will use a `direct` exchange instead. The routing algorithm behind
a `direct` exchange is simple - a message goes to the queues whose
`binding key` exactly matches the `routing key` of the message.

To illustrate that, consider the following setup:

<T4DiagramDirectX/>

In this setup, we can see the `direct` exchange `X` with two queues bound
to it. The first queue is bound with binding key `orange`, and the second
has two bindings, one with binding key `black` and the other one
with `green`.

In such a setup a message published to the exchange with a routing key
`orange` will be routed to queue `Q1`. Messages with a routing key of `black`
or `green` will go to `Q2`. All other messages will be discarded.


Multiple bindings
-----------------
<T4DiagramMultipleBindings/>

It is perfectly legal to bind multiple queues with the same binding
key. In our example we could add a binding between `X` and `Q1` with
binding key `black`. In that case, the `direct` exchange will behave
like `fanout` and will broadcast the message to all the matching
queues. A message with routing key `black` will be delivered to both
`Q1` and `Q2`.


Emitting logs
-------------

We'll use this model for our logging system. Instead of `fanout` we'll
send messages to a `direct` exchange. We will supply the log severity as
a `routing key`. That way the receiving method will be able to select
the severity it wants to receive. Let's focus on emitting logs
first.

As always, we need to create an exchange first:

```swift
ch.direct("logs")
```

And we're ready to send a message:

```swift
let x = ch.direct("logs")
x.publish(msg.data(using: .utf8), routingKey: severity)
```

To simplify things we will assume that 'severity' can be one of
`info`, `warning`, or `error`.


Subscribing
-----------

Receiving messages will work just like in the previous tutorial, with
one exception - we're going to create a new binding for each severity
we're interested in.

```swift
let q = ch.queue("", options: .exclusive)
let severities = ["error", "warning", "info"]
for severity: String in severities {
    q.bind(x, routingKey: severity)
}
```

Putting it all together
-----------------------

<T4DiagramFull/>


The code for the `emitLogDirect` method:

```swift
func emitLogDirect(_ msg: String, severity: String) {
    let conn = RMQConnection(delegate: RMQConnectionDelegateLogger())
    conn.start()
    let ch = conn.createChannel()
    let x = ch.direct("direct_logs")
    x.publish(msg.data(using: .utf8), routingKey: severity)
    print("Sent '\(msg)'")
    conn.close()
}
```

The code for `receiveLogsDirect`:

```swift
func receiveLogsDirect() {
    let conn = RMQConnection(delegate: RMQConnectionDelegateLogger())
    conn.start()
    let ch = conn.createChannel()
    let x = ch.direct("direct_logs")
    let q = ch.queue("", options: .exclusive)
    let severities = ["error", "warning", "info"]
    for severity: String in severities {
        q.bind(x, routingKey: severity)
    }
    print("Waiting for logs.")
    q.subscribe({(_ message: RMQMessage) -> Void in
        print("\(message.routingKey):\(String(data: message.body,
                                       encoding: .utf8))")
    })
}
```

To emit an `error` log message just call:

```swift
self.emitLogDirect("Hi there!", severity: "error")
```

([source code][source])

Move on to [tutorial 5][next] to find out how to listen
for messages based on a pattern.

[client]:https://github.com/rabbitmq/rabbitmq-objc-client
[previous]:./tutorial-three-swift
[next]:./tutorial-five-swift
[source]:https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/swift/tutorial4/tutorial4/ViewController.swift
