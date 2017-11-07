# Queue memory.

This document is trying to explain memory usage of RabbitMQ queues.

### Please to read first

This document only explains how memory is allocated and managed. To learn about
message persistence configuration, read [persistence](persistence-conf.html) document.
To learn about memory reporting and watermark configuration,
read [memory use](memory-use.html) and [memory configuration](memory.html) documents.
Please read linked documents first, because this one uses some vocabulary from there.

A message can be stored in a number of ways, explained in [persistence](persistence-conf.html).
For non-lazy queues even if a message is persistent it can still be kept in memory,
to improve performance.

Following information is for messages stored in memory.

### How much memory is used by queues with messages?

[memory use](memory-use.html) document explains how to get a memory breakdown from a RabbitMQ node.
Queue processes memory is reported as `queue_procs`, while message payloads are
reported in `binary` section.

Binary memory breakdown can be found in <a href="management.html">management</a> web UI
in the node page. It's helpful to determine how much memory message payloads use.

### How much memory does a message use?

In addition to payload each message has metadata, which contains exchange,
routing keys, message properties, persistence, redelivery status ets.
Metadata takes at least **750** bytes per message. Can be more if the
message has properties (e.g. headers) configured.

Messages ordering structure takes 2 bytes per message.

Some messages can be stored on disk, but still have their metadata kept in memory.

If a message is stored in memory it will take approximately payload size.

### How to break down per-queue memory?

Each queue (or queue replica) is represented as a separate erlang process.
This allows ordering of operations and spreading load between thousands of queues.

To monitor a single queue memory, you can use HTTP API queue endpoint
`<host>/api/queues/<vhost>/<queue_name>`.
`memory` field will report the queue process memory, `message_bytes_ram`
field will report amount of memory used by the queue messages.

Message payloads are erlang binaries and can be stored in the queue heap or the erlang
node global heap and only referenced by the queue.
If a payload is smaller than 64 bytes it will be stored in the queue heap.

Payloads stored in the queue heap will be reported as a part of the queue
process memory and in `message_bytes_ram`.

Payloads stored in global heap will be reported in `message_bytes_ram` only.

Messages metadata will only be stored in the queue process memory.

If messages are small, metadata can take much more memory than payloads
for high number of messages.

If messages are big, they will be stored in the global heap and will not reflect
in the queue process.

### Why does the queue memory spiky when publishing/consuming?

If a queue is idle, its memory usage will be minimized leaving only useful data,
like messages and message metadata.

When publish/consume rates are high though, memory usage is much higher and can
be spiky, because the queue process is actively allocating and releasing it.

Erlang uses [generational garbage collection](https://www.erlang-solutions.com/blog/erlang-19-0-garbage-collector.html)
mechanism for each process.

This mechanism will copy used process memory before deallocating unused,
which can lead to allocating 2X used memory during a garbage collection run.
This can be seen as periodical memory usage peaks, especially if monitoring
a single queue.

This happens mostly when producers outpace consumers and a queue process has to
request more and more memory from erlang VM running a garbage collection every
time.

### How bad are memory spikes? What can we do about it?

If an erlang node tries to allocate too much memory it can crash or be killed by
OS OOM killer. When restarted it will loose all non-persistent data.

If you plan to enqueue lots of transient messages, you probably don't
want to loose them.

Memory watermark can help in this case and block publishers, but since garbage
collection can allocate around 2X queue memory it's unsafe to increase
the watermark above 0.5. Even this setting is dangerous because not all memory
is used by queues. By default memory watermark is set to 0.4 for that reason.

Ideally there should be many queues, so memory allocation/gc will be smoothened.

When using a large queue of millions of messages it's recommended to use lazy queues to
avoid storing too much in memory.
