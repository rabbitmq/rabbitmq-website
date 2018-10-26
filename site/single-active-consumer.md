# Consumers

This page covers features related to message consumption in RabbitMQ.

## <a id="exclusive-consume" class="anchor" href="#exclusive-consume">AMQP Exclusive Consume</a>

When registering a consumer, [the `exclusive` flag](amqp-0-9-1-reference.html#basic.consume)
can be set to true to request the consumer to be the only one
on the target queue. The call succeeds only if there's no consumer
already registered to the queue at that time. This allows to make sure
only one consumer at a time consumes from the queue.

Exclusive consume provides no guarantee in terms of quality of service:
if the exclusive consumer is cancelled or dies, this is the application
responsibility to register a new one to keep on consuming from the queue.

If exclusive consumption *and* consumption continuity are required,
[single active consumer](#single-active-consumer) may be more appropriate.


## <a id="single-active-consumer" class="anchor" href="#single-active-consumer">Single Active Consumer</a>

Single active consumer allows to have only one consumer
at a time consuming from a queue and to fail over to another registered consumer
in case the active one is cancelled or dies. Consuming with only one consumer
is useful when messages must be consumed and processed in the same order
they arrive in the queue.

A typical sequence of events would be the following:

 * a queue is declared and some consumers register to it at roughly the
 same time.
 * the very first registered consumer become the *single active consumer*:
 messages are dispatched to it and the other consumers are ignored.
 * the single active consumer is cancelled for some reason or simply dies.
 One of the registered consumer becomes the new single active consumer and
 messages are now dispatched to it. In other terms, the queue fails over
 automatically to another consumer.

Note that without the single active consumer feature enabled, messages
would be dispatched to all consumers using round-robin.

Single active consumer can be enabled when declaring a queue, with the
`x-single-active-consumer` argument set to `true`, e.g. with the Java client:

    Channel channel = ...;
    Map<String, Object> arguments = new HashMap<String, Object>();
    arguments.put("x-single-active-consumer", true);
    ch.queueDeclare("my-queue", false, false, false, arguments);

Compared to [AMQP exclusive consumer](#exclusive-consume), single active consumer puts
less pressure on the application side to maintain consumption continuity.
Consumers just need to be registered and failover is handled automatically,
there's no need to detect the active consumer failure and to register
a new consumer.

Please note the following about single active consumer:

 * there's no guarantee on the selected active consumer, it is
 picked up randomly, even if [consumer priorities](/consumer-priority.html)
 are in use.
 * trying to register a consumer with the exclusive consume flag set to
 true will result in an error if single active consumer is enabled on
 the queue.
 * messages are always delivered to the active consumer, even if it is
 too busy at some point. This can happen when using manual acknowledgment
 and `basic.qos`, the consumer may be busy dealing with the maximum number of
 unacknowledged messages it requested with `basic.qos`.
 In this case, the other consumers are ignored and
 messages are enqueued.
