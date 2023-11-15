# RabbitMQ tutorial - Work Queues SUPPRESS-RHS

## Work Queues
### (using the [Objective-C client][client])

<xi:include href="site/tutorials/tutorials-help.xml.inc"/>

<!-- FIXME div class="diagram">
  <img src="../img/tutorials/python-two.png" height="110" alt="Producer -> Queue -> Consuming: Work Queue used to distribute time-consuming tasks among multiple workers." />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      Q1 [label="{||||}", fillcolor="red", shape="record"];
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P1 -&gt; Q1 -&gt; C1;
      Q1 -&gt; C2;
    }
  </div>
</div-->


In the [first tutorial][previous] we
wrote methods to send and receive messages from a named queue. In this
one we'll create a _Work Queue_ that will be used to distribute
time-consuming tasks among multiple workers.

The main idea behind Work Queues (aka: _Task Queues_) is to avoid
doing a resource-intensive task immediately and having to wait for
it to complete. Instead we schedule the task to be done later. We encapsulate a
_task_ as a message and send it to a queue. A worker process running
in the background will pop the tasks and eventually execute the
job. When you run many workers the tasks will be shared between them.

This concept is especially useful in web applications where it's
impossible to handle a complex task during a short HTTP request
window.

Preparation
------------

In the [previous part][previous] of this tutorial we sent a message containing
"Hello World!". Now we'll be sending strings that stand for complex
tasks. We don't have a real-world task, like images to be resized or
pdf files to be rendered, so let's fake it by just pretending we're
busy - by using `sleep`. We'll take the number of dots
in the string as its complexity; every dot will account for one second
of "work".  For example, a fake task described by `Hello...`
will take three seconds.

We will slightly modify the `send` method from [our previous example][previous-code],
to allow an arbitrary string to be sent as a method parameter. This
method will schedule tasks to our work queue, so let's rename it to `newTask`.
The implementation remains the same apart from the new parameter:

```objectivec
- (void)newTask:(NSString *)msg {
    NSLog(@"Attempting to connect to local RabbitMQ broker");
    RMQConnection *conn = [[RMQConnection alloc] initWithDelegate:[RMQConnectionDelegateLogger new]];
    [conn start];

    id&lt;RMQChannel&gt; ch = [conn createChannel];

    RMQQueue *q = [ch queue:@"hello"];

    NSData *msgData = [msg dataUsingEncoding:NSUTF8StringEncoding];
    [ch.defaultExchange publish:msgData routingKey:q.name];
    NSLog(@"Sent %@", msg);

    [conn close];
}
```

Our old _receive_ method requires some bigger changes: it needs to
fake a second of work for every dot in the message body. It will help us
understand what's going on if each worker has a name, and each will need to pop
messages from the queue and perform the task, so let's call it `workerNamed:`:

```objectivec
[q subscribe:^(RMQMessage * _Nonnull message) {
    NSString *messageText = [[NSString alloc] initWithData:message.body encoding:NSUTF8StringEncoding];
    NSLog(@"%@: Received %@", name, messageText);
    // imitate some work
    unsigned int sleepTime = (unsigned int)[messageText componentsSeparatedByString:@"."].count - 1;
    NSLog(@"%@: Sleeping for %u seconds", name, sleepTime);
    sleep(sleepTime);
}];
```

Note that our fake task simulates execution time.

Run them from `viewDidLoad` as in tutorial one:

```objectivec
- (void)viewDidLoad {
    [super viewDidLoad];
    [self newTask:@"Hello World..."];
    [self workerNamed:@"Flopsy"];
}
```

The log output should indicate that Flopsy is sleeping for three seconds.

Round-robin dispatching
-----------------------

One of the advantages of using a Task Queue is the ability to easily
parallelise work. If we are building up a backlog of work, we can just
add more workers and that way, scale easily.

Let's try to run two `workerNamed:` methods at the same time. They
will both get messages from the queue, but how exactly? Let's see.

Change viewDidLoad to send more messages and start two workers:

```objectivec
- (void)viewDidLoad {
    [super viewDidLoad];
    [self workerNamed:@"Jack"];
    [self workerNamed:@"Jill"];
    [self newTask:@"Hello World..."];
    [self newTask:@"Just one this time."];
    [self newTask:@"Five....."];
    [self newTask:@"None"];
    [self newTask:@"Two..dots"];
}
```

Let's see what is delivered to our workers:

```bash
# => Jack: Waiting for messages
# => Jill: Waiting for messages
# => Sent Hello World...
# => Jack: Received Hello World...
# => Jack: Sleeping for 3 seconds
# => Sent Just one this time.
# => Jill: Received Just one this time.
# => Jill: Sleeping for 1 seconds
# => Sent Five.....
# => Sent None
# => Sent Two..dots
# => Jill: Received Five.....
# => Jill: Sleeping for 5 seconds
# => Jack: Received None
# => Jack: Sleeping for 0 seconds
# => Jack: Received Two..dots
# => Jack: Sleeping for 2 seconds
```

By default, RabbitMQ will send each message to the next consumer,
in sequence. On average every consumer will get the same number of
messages. This way of distributing messages is called round-robin. Try
this out with three or more workers.

Message acknowledgment
----------------------

Doing a task can take a few seconds, you may wonder what happens if
a consumer starts a long task and it terminates before it completes.
With our current code, once RabbitMQ delivers a message to the consumer, it
immediately marks it for deletion. In this case, if you terminate a worker,
the message it was just processing is lost. The messages that were dispatched
to this particular worker but were not yet handled are also lost.

But we don't want to lose any tasks. If a worker dies, we'd like the
task to be delivered to another worker.

In order to make sure a message is never lost, RabbitMQ supports
[message _acknowledgments_](../confirms). An ack(nowledgement) is sent back by the
consumer to tell RabbitMQ that a particular message has been received,
processed and that RabbitMQ is free to delete it.

If a consumer dies (its channel is closed, connection is closed, or
TCP connection is lost) without sending an ack, RabbitMQ will
understand that a message wasn't processed fully and will re-queue it.
If there are other consumers online at the same time, it will then quickly redeliver it
to another consumer. That way you can be sure that no message is lost,
even if the workers occasionally die.

A timeout (30 minutes by default) is enforced on consumer delivery acknowledgement.
This helps detect buggy (stuck) consumers that never acknowledge deliveries.
You can increase this timeout as described in
[Delivery Acknowledgement Timeout](../consumers#acknowledgement-timeout).

Message acknowledgments are turned off by default in the client, but not in the
AMQ protocol (the `AMQBasicConsumeNoAck` option is automatically sent by
`subscribe:`). It's time to turn acknowledgements on by
explicitly setting `AMQBasicConsumeNoOptions` and sending a proper
acknowledgment from the worker once we're done with a task.

```objectivec
RMQBasicConsumeOptions manualAck = RMQBasicConsumeNoOptions;
[q subscribe:manualAck handler:^(RMQMessage * _Nonnull message) {
    NSString *messageText = [[NSString alloc] initWithData:message.body encoding:NSUTF8StringEncoding];
    NSLog(@"%@: Received %@", name, messageText);
    // imitate some work
    unsigned int sleepTime = (unsigned int)[messageText componentsSeparatedByString:@"."].count - 1;
    NSLog(@"%@: Sleeping for %u seconds", name, sleepTime);
    sleep(sleepTime);

    [ch ack:message.deliveryTag];
}];
```

Using this code we can be sure that even if a worker dies while it was
processing a message, nothing will be lost. Soon after the worker dies all
unacknowledged messages will be redelivered.

Acknowledgement must be sent on the same channel that received the
delivery. Attempts to acknowledge using a different channel will result
in a channel-level protocol exception. See the [doc guide on confirmations](../confirms)
to learn more.

> #### Forgotten acknowledgment
>
> It's a common mistake to miss the `ack`. It's an easy error,
> but the consequences are serious. Messages will be redelivered
> when your client quits (which may look like random redelivery), but
> RabbitMQ will eat more and more memory as it won't be able to release
> any unacked messages.
>
> In order to debug this kind of mistake you can use `rabbitmqctl`
> to print the `messages_unacknowledged` field:
>
> ```bash
> sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged
> ```
>
> On Windows, drop the sudo:
> ```bash
> rabbitmqctl.bat list_queues name messages_ready messages_unacknowledged
> ```


Message durability
------------------

We have learned how to make sure that even if the consumer dies, the
task isn't lost. But our tasks will still be lost if RabbitMQ server stops.

When RabbitMQ quits or crashes it will forget the queues and messages
unless you tell it not to. Two things are required to make sure that
messages aren't lost: we need to mark both the queue and messages as
durable.

First, we need to make sure that the queue will survive a RabbitMQ node restart.
In order to do so, we need to declare it as _durable_:

```objectivec
RMQQueue *q = [ch queue:@"hello" options:AMQQueueDeclareDurable];
```

Although this command is correct by itself, it won't work in our present
setup. That's because we've already defined a queue called `hello`
which is not durable. RabbitMQ doesn't allow you to redefine an existing queue
with different parameters and will return an error to any program
that tries to do that. But there is a quick workaround - let's declare
a queue with different name, for example `task_queue`:

```objectivec
RMQQueue *q = [ch queue:@"task_queue" options:AMQQueueDeclareDurable];
```

This `options:AMQQueueDeclareDurable` change needs to be applied to both the
producer and consumer code.

At this point we're sure that the `task_queue` queue won't be lost
even if RabbitMQ restarts. Now we need to mark our messages as persistent
- by using the `persistent` option.

```objectivec
[ch.defaultExchange publish:msgData routingKey:q.name persistent:YES];
```

> #### Note on message persistence
>
> Marking messages as persistent doesn't fully guarantee that a message
> won't be lost. Although it tells RabbitMQ to save the message to disk,
> there is still a short time window when RabbitMQ has accepted a message and
> hasn't saved it yet. Also, RabbitMQ doesn't do `fsync(2)` for every
> message -- it may be just saved to cache and not really written to the
> disk. The persistence guarantees aren't strong, but it's more than enough
> for our simple task queue. If you need a stronger guarantee then you can use
> [publisher confirms](../confirms).


Fair dispatch
----------------

You might have noticed that the dispatching still doesn't work exactly
as we want. For example in a situation with two workers, when all
odd messages are heavy and even messages are light, one worker will be
constantly busy and the other one will do hardly any work. Well,
RabbitMQ doesn't know anything about that and will still dispatch
messages evenly.

This happens because RabbitMQ just dispatches a message when the message
enters the queue. It doesn't look at the number of unacknowledged
messages for a consumer. It just blindly dispatches every n-th message
to the n-th consumer.

<!-- FIXME div class="diagram">
  <img src="../img/tutorials/prefetch-count.png" height="110" alt="Producer -> Queue -> Consuming: RabbitMQ dispatching messages." />
  <div class="diagram_source">
    digraph {
      bgcolor=transparent;
      truecolor=true;
      rankdir=LR;
      node [style="filled"];
      //
      P1 [label="P", fillcolor="#00ffff"];
      subgraph cluster_Q1 {
        label="queue_name=hello";
    color=transparent;
        Q1 [label="{||||}", fillcolor="red", shape="record"];
      };
      C1 [label=&lt;C&lt;font point-size="7"&gt;1&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      C2 [label=&lt;C&lt;font point-size="7"&gt;2&lt;/font&gt;&gt;, fillcolor="#33ccff"];
      //
      P1 -&gt; Q1;
      Q1 -&gt; C1 [label="prefetch=1"] ;
      Q1 -&gt; C2 [label="prefetch=1"] ;
    }
  </div>
</div-->

In order to defeat that we can use the `basicQos:global:` method with the
prefetch value of `@1`. This tells RabbitMQ not to give more than
one message to a worker at a time. Or, in other words, don't dispatch
a new message to a worker until it has processed and acknowledged the
previous one. Instead, it will dispatch it to the next worker that is not still busy.

```objectivec
[ch basicQos:@1 global:NO];
```

> #### Note about queue size
>
> If all the workers are busy, your queue can fill up. You will want to keep an
> eye on that, and maybe add more workers, or have some other strategy.

Putting it all together
-----------------------

Final code of our `newTask:` method:

```objectivec
- (void)newTask:(NSString *)msg {
    RMQConnection *conn = [[RMQConnection alloc] initWithDelegate:[RMQConnectionDelegateLogger new]];
    [conn start];

    id&lt;RMQChannel&gt; ch = [conn createChannel];

    RMQQueue *q = [ch queue:@"task_queue" options:RMQQueueDeclareDurable];

    NSData *msgData = [msg dataUsingEncoding:NSUTF8StringEncoding];
    [ch.defaultExchange publish:msgData routingKey:q.name persistent:YES];
    NSLog(@"Sent %@", msg);

    [conn close];
}
```

And our `workerNamed:`:

```objectivec
- (void)workerNamed:(NSString *)name {
    RMQConnection *conn = [[RMQConnection alloc] initWithDelegate:[RMQConnectionDelegateLogger new]];
    [conn start];

    id&lt;RMQChannel&gt; ch = [conn createChannel];

    RMQQueue *q = [ch queue:@"task_queue" options:RMQQueueDeclareDurable];

    [ch basicQos:@1 global:NO];
    NSLog(@"%@: Waiting for messages", name);

    RMQBasicConsumeOptions manualAck = RMQBasicConsumeNoOptions;
    [q subscribe:manualAck handler:^(RMQMessage * _Nonnull message) {
        NSString *messageText = [[NSString alloc] initWithData:message.body encoding:NSUTF8StringEncoding];
        NSLog(@"%@: Received %@", name, messageText);
        // imitate some work
        unsigned int sleepTime = (unsigned int)[messageText componentsSeparatedByString:@"."].count - 1;
        NSLog(@"%@: Sleeping for %u seconds", name, sleepTime);
        sleep(sleepTime);

        [ch ack:message.deliveryTag];
    }];
}
```

[(source)](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/objective-c/tutorial2/tutorial2/ViewController.m)

Using message acknowledgments and prefetch you can set up a
work queue. The durability options let the tasks survive even if
RabbitMQ is restarted.

Now we can move on to [tutorial 3](./tutorial-three-objectivec) and learn how
to deliver the same message to many consumers.

[client]:https://github.com/rabbitmq/rabbitmq-objc-client
[previous]:./tutorial-one-objectivec
[previous-code]:https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/objective-c/tutorial1/tutorial1/ViewController.m
