# Lazy Queues

## <a id="overview" class="anchor" /> [Overview](#overview)

Since **RabbitMQ 3.6.0**, the broker has the concept of **Lazy Queues** -
queues that try to keep as many messages as possible on disk,
and only load them in RAM when requested by consumers,
therefore the lazy denomination.

One of the main goals of lazy queues is to be able to support very long queues (many millions of messages).
Queues can become very long for various reasons:

<ul class="plain">
  <li>consumers are offline / have crashed / are down for maintenance</li>
  <li>there is a sudden message ingress spike, producers are outpacing consumers</li>
  <li>consumers are simply slower than normal</li>
</ul>

By default, queues keep an in-memory cache of messages that's filled up as messages are published into RabbitMQ.
The idea of this cache is to be able to deliver messages to consumers as fast as possible -
note that persistent messages are written to disk as they enter the broker **and** kept in this cache at the same time.

Whenever the broker considers it needs to free up memory, messages from this cache will be paged out to disk.
Paging messages to disk takes time and block the queue process, making it unable to receive new messages while it's paging.
Even if on recent RabbitMQ versions we have improved the paging algorithm,
the situation is still not ideal for use cases where you have many millions on messages in the queue that might need to be paged out.

Lazy queues help here by eliminating this cache and only loading messages in memory when requested by consumers.
Lazy queues will send every message that arrives to the queue right away to the file system,
completely eliminating the in-memory cache mentioned before.
This has the consequence of heavily reducing the amount of RAM consumed by a queue and also eliminates the need for paging.
While this will increase I/O usage, it is the same behaviour as when publishing persistent messages.

## <a id="configuring" class="anchor" /> [Configuring Lazy Queues](#configuring)

Queues can be made to run in `default` mode or `lazy` mode by:

<ul class="plain">
  <li>setting the mode via <code>queue.declare</code> arguments</li>
  <li>applying a queue <a href="parameters.html#policies">policy</a></li>
</ul>

When both policy and queue arguments specify a queue mode, the queue argument has priority over the policy value.

If a queue mode is set via a declare argument, it can only be changed by deleting the queue, and re-declaring it later with a different argument.

### Configuration using arguments

The queue mode can be set by supplying the `x-queue-mode` queue declaration argument with a string specifying the desired mode.
Valid modes are:

<ul class="plain">
  <li><code>"default"</code></li>
  <li><code>"lazy"</code></li>
</ul>

If no mode is specified during declare, then `"default"` is assumed.
The `default` mode is the behaviour already present in pre 3.6.0 versions of the broker,
so there are no breaking changes in this regard.

This example in Java declares a queue with the queue mode set to `"lazy"`:

<pre class="sourcecode java">
  Map&lt;String, Object> args = new HashMap&lt;String, Object>();
  args.put("x-queue-mode", "lazy");
  channel.queueDeclare("myqueue", false, false, false, args);
</pre>

### Configuration using policy

To specify a queue mode using a policy, add the key `queue-length` to a policy definition, e.g.:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
      <pre>rabbitmqctl set_policy Lazy "^lazy-queue$" '{"queue-mode":"lazy"}' --apply-to queues</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
      <pre>rabbitmqctl set_policy Lazy "^lazy-queue$" "{""queue-mode"":""lazy""}" --apply-to queues</pre>
    </td>
  </tr>
</table>

This ensures the queue called `lazy-queue` will work in the `lazy` mode.

Policies can also be defined using the management plugin, see the [policy](parameters.html#policies) for more details.

### Changing queue modes

If you specified the queue mode via a policy,
then you can change it at run time without the need of deleting the queue and re-declaring it with a different mode.
If you want the previous `lazy-queue` to start working like a `default` queue,
then you can do so by issuing the following command:

<table>
  <tr>
    <th>rabbitmqctl</th>
    <td>
      <pre>rabbitmqctl set_policy Lazy "^lazy-queue$" '{"queue-mode":"default"}' --apply-to queues</pre>
    </td>
  </tr>
  <tr>
    <th>rabbitmqctl (Windows)</th>
    <td>
      <pre>rabbitmqctl set_policy Lazy "^lazy-queue$" "{""queue-mode"":""default""}" --apply-to queues</pre>
    </td>
  </tr>
</table>

## <a id="performance" class="anchor" /> [Performance Considerations for Lazy Queues](#performance)

### Disk Utilization

A `lazy` queue will send every message to disk as soon as it enters the queue, even if the message is transient.
This will result in higher disk I/O utilisation.

A `default` queue will keep messages in memory until memory pressure forces them to be paged out to disk.
This will result in delayed disk I/O which can be significant since more data will need to be written to disk at once.

### RAM Utilization

While it's hard to give numbers that make sense for every use case,
this is a simplistic test that showcases the difference in RAM utilization between a `default` &amp; a `lazy` queue:

| Number of messages | Message body size | Message type | Producers | Consumers |
| -                  | -                 | -            | -         | -         |
| 1,000,000          | 1,000 bytes       | persistent   | 1         | 0         |

The RAM utilization for `default` &amp; `lazy` queues after ingesting the above messages:

| Queue type | Queue process memory | Messages in memory | Memory used by messages | Node memory |
| -          | -                    | -                  | -                       | -           |
| `default`  | 257 MB               | 386,307            | 368 MB                  | 734 MB      |
| `lazy`     | 159 KB               | 0                  | 0                       | 0           |

Both queues persisted 1,000,000 messages that use 1.2 GB of disk space.

You can re-create this test using [RabbitMQ Performance Testing Tool](https://github.com/rabbitmq/rabbitmq-perf-test).

`default` queue test:

<pre class="sourcecode bash">
# Start a temporary RabbitMQ node:
# (this command will fail if there is another RabbitMQ node already running)
#
#       export RABBITMQ_NODENAME=default-queue-test
#       export RABBITMQ_MNESIA_BASE=/tmp
#       export RABBITMQ_LOG_BASE=/tmp/$RABBITMQ_NODENAME
#       rabbitmq-server &amp;

# In https://github.com/rabbitmq/rabbitmq-perf-test, run:
make run ARGS="-y 0 -s 1000 -f persistent -C 1000000 -ad false -u default"

# Queue stats:
rabbitmqctl list_queues name arguments memory messages_ram message_bytes_ram messages_persistent message_bytes_persistent
Timeout: 60.0 seconds ...
Listing queues for vhost / ...
default	[]	417421592	386307	386307000	1000000	1000000000

# Node memory stats
rabbitmqctl status | grep rss,
      {total,[{erlang,1043205272},{rss,770306048},{allocated,1103822848}]}]},

# Stop our temporary RabbitMQ node, clean all persistent files
#
#       rabbitmqctl shutdown
#       rm -fr /tmp/$RABBITMQ_NODENAME*
</pre>

`lazy` queue test:

<pre class="sourcecode bash">
# Start a temporary RabbitMQ node:
# (this command will fail if there is another RabbitMQ node already running)
#
#       export RABBITMQ_NODENAME=lazy-queue-test
#       export RABBITMQ_MNESIA_BASE=/tmp
#       export RABBITMQ_LOG_BASE=/tmp/$RABBITMQ_NODENAME
#       rabbitmq-server &amp;

# In https://github.com/rabbitmq/rabbitmq-perf-test, run:
make run ARGS="-y 0 -s 1000 -f persistent -C 1000000 -ad false -u lazy -qa x-queue-mode=lazy"

# Queue stats:
rabbitmqctl list_queues name arguments memory messages_ram message_bytes_ram messages_persistent message_bytes_persistent
Timeout: 60.0 seconds ...
Listing queues for vhost / ...
lazy	[{"x-queue-mode","lazy"}]	264704	0	0	1000000	1000000000

# Node memory stats
rabbitmqctl status | grep rss,

# Stop our temporary RabbitMQ node, clean all persistent files
#
#       rabbitmqctl shutdown
#       rm -fr /tmp/$RABBITMQ_NODENAME
</pre>

**Note that this was a very simplistic test.**
**Please make sure to run your own benchmarks.**
**Remember to change the queue mode between benchmarks runs.**

### Converting between queue modes

If we need to convert a `default` queue into a `lazy` one,
then we will suffer the same performance impact as when a queue needs to page messages to disk.

When we convert a `default` queue into a `lazy` one,
the queue will first page messages to disk,
and then it will start accepting publishes, acks, and other commands.

When a queue goes from the `lazy` mode to the `default` one,
it will perform the same process as when a queue is recovered after a server restart.
A batch of 16384 messages will be loaded in the cache mentioned above.
