---
title: "RabbitMQ 2.7.0 and 2.7.1 are released"
tags: ["New Features", ]
authors: [Zteve]
---

The [previous release of RabbitMQ](http://lists.rabbitmq.com/pipermail/rabbitmq-discuss/2011-November/016069.html) (2.7.0) brought with it a better way of managing plugins, one-stop URI connecting by clients, thread-safe consumers in the Java client, and a number of performance improvements and bug-fixes. The [latest release](http://lists.rabbitmq.com/pipermail/rabbitmq-discuss/2011-December/016941.html) (2.7.1) is essentially a bug-fix release; though it also makes RabbitMQ compatible with Erlang R15B and enhances some of the management interface. The previous release didn't get a blog post, so I've combined both releases in this one.  (These are my own personal remarks and are NOT binding; errors of commission or omission are entirely my own -- Steve Powell.)

<!-- truncate -->

## plugins

Prior to 2.7.0 if you wanted to use a plugin then a `.ez` file was placed in the `plugins` directory, and the broker restarted. Any plugin found in this directory was installed on startup.  This meant two things: plugins weren't supplied with the server (even our supported ones), and installing or uninstalling a plugin involved moving files about *and* ensuring other plugin dependencies were installed. Administration of plugins was unnecessarily messy.

In 2.7.0, we introduced a command `rabbitmq-plugins`, to enable or disable any plugin in the `plugins` directory. Simply issue the command `rabbitmq-plugins list` to see what plugin files are there, and `rabbitmq-plugins enable <plugin-name>` to use one the next time the broker starts. No files need to be moved around -- they can stay in the plugins directory all the time -- and all the rabbit plugins are now supplied with the server, disabled by default.  The command also understands which plugins depend upon which others, and enables dependencies automatically. Using and managing plugins is now much easier. See [the plugins page](/docs/plugins) for more.

In 2.7.1 there is a fix to the `consistent-hash-exchange` plugin which mis-routed messages when handling multiple exchanges.

## connect by URI

All of the rabbit clients (.NET, Java and Erlang) clients accept an `amqp` URI scheme for connections. This is a convenient *one-stop shop* allowing the username and password, hostname and port, and virtual host, to be supplied by a single URI or String parameter. For example:

```plaintext
amqp://guest:ghost@rabbit01.coderus.moc:5672/vhost01
```

See the individual client APIs for details.

## Java threads

In Release 2.7.0 the threading structure of the Java client has been significantly redesigned. Before this release there were restrictions in what could be done in the Java client's `Consumer` callback methods, and also on which application threads can call `Channel` methods. These have been due to the underlying threading structure of the Java client which shared the channel thread with the callbacks. Locks on the channel and connection objects meant that calling `Channel` methods directly from the `Consumer` resulted in deadlocks (with a few exceptions, like acknowledgements). The `QueueingConsumer` helper class was made available to isolate applications from some of these issues, at the cost of introducing another queue (in the Java client).

With the new threading structure, there are far fewer restrictions upon which application threads can call channel operations, because all `Consumer` callbacks are executed on threads which are separate from the channel. In fact, it is now possible to configure the connection to manage a pool of threads used specifically for callbacks  preserving the order of execution of these within each channel. Simple client applications can take the default which provides a small pool of callback threads and sophisticated clients can provide their own `ExecutorService` object, which allows them to create and manage the size and behaviour of the thread pool themselves. `QueueingConsumer` is now no longer necessary, for everything one would want to do as a result of a `Consumer` callback can be done in the `Consumer` method directly, without deadlocks.  See the [Java API Guide](/client-libraries/java-api-guide) for more.

2.7.1 fixed a few irritations in the Java Client adjustments in 2.7.0: we inadvertently hid some of the API, and this has now been restored. There were also some potential resource leaks which we have now fixed.

## performance

A number of small performance improvements have been made to the server in both 2.7.0 and 2.7.1. These have been quite varied in scope, and I can only touch on some of them here.

* In the first place, basic file I/O has been improved by the simple expedient of using lower-level basic file operations. This has allowed certain operations to occur in parallel that were previously serialised through an Erlang process. This results in removing some bottlenecks, and slightly speeds up several areas, including server shutdown.
* An area of intense I/O, interestingly unaffected by the tweak above, is what is known as the 'message store'. This is, unsurprisingly, where messages are stored (stored for various reasons, not only message persistence). Rather than using a conventional database, RabbitMQ manages its own file storage for messages.  (A conventional database has almost the entirely wrong performance profile for queueing -- the most recently used items are likely to be the ones accessed last.)  The messages store is one of the most sophisticated parts of the server because it needs to respond very quickly without gating the rest of the system by the relatively slow I/O operations it performs. It behaves something like a paging system cache, in that while messages are waiting to be written they can potentially be 'stolen' from the write list if they are subsequently read, rewritten or even deleted. The 'overtaking' rules are quite different from those of a paging system, however, and in this release, the organisation was changed to allow some deletes to 'cancel' store requests which hadn't yet occurred. This results in reducing unnecessary writes and therefore higher overall throughput for every queue. Extensive tests have shown an improvement in performance with preserved reliability, even under load.
* There was sub-optimal treatment of a connection with a large number of consumers, especially if they were of low utilisation. There appeared to be an overhead for consumers that were relatively inactive. In 2.7.0 this has been improved, which means that having lots of low-use consumers has far less of an impact on overall performance.
* Deletion of queues with a large number of bindings and exchanges with a large number of bindings took rather longer than we would have liked. This has been speeded up in 2.7.1.

## HiPE option

Erlang offers a High Performance compiler (HiPE) for some platforms whereby Erlang modules can be compiled to native code. This compilation does not always produce a faster system, however, and is not supported by all Erlang environments and versions. In 2.7.0 we introduced a [configuration option](/docs/configure) to use HiPE, and a re-compilation is performed automatically at server startup. Not every rabbit module is re-compiled only those that we have determined may benefit from this treatment. Although this option delays startup by some tens of seconds, it produces significant performance improvements at runtime which may be crucial for some larger rabbit installations.

This option is *disabled* by default, since it may actually affect behaviour (not that we have detected this), and the performance improvements are not tested on all the environments our users employ. However, if it works for you, go for it. If your Erlang environment does not support HiPE, there is a brief diagnostic message and the option is ignored.

We would be very interested in your experiences with this feature.

## re-queued messages

RabbitMQ deals with FIFO queues. If all goes well, the order the messages are put on a queue is the same as the order they are consumed. When a consumer fails, however, some of the messages it received may not have been acknowledged, and in this case these messages are re-queued so that they may be delivered again. In this way messages may appear to be re-ordered. Before this release, there was no guarantee of the order of re-queued messages.

From 2.7.0 the relative order *of re-queued messages from a single consumer* is preserved. Therefore, if another consumer receives them later, they will be consumed in the same order they originally appeared. Of course, if two or more consumers on the same queue fail, there is no guarantee that messages re-queued by *distinct* consumers will retain their relative order. But in the majority of cases where order matters, this guarantee should be enough.

## high availability problems

A number of fixes for high availability features (mostly introduced in 2.7.0) were included in 2.7.1. These relate to some memory leaks; recovery of master queues; frequent restarting causing HA queues to fail; and promotion of slaves (to master) failing under some circumstances.  The general quality of this code area is high, but the complex nature of the failure scenarios (which this feature is specifically designed to protect against) makes it a fruitful one for bugs to lurk. Nearly all the bugs fixed in 2.7.1 are due to rare or obscure combinations of recovery or restart events, and we confidently expect there to be few surprises left. Of course, High Availability doesn't mean Guaranteed Availability, so there are going to be situations from which we cannot recover.

## other small improvements and bug fixes

* If you ran a broker for a very long time it was possible to wrap one of the internal GUIDs (Globally Unique IDentifiers). Clearly this was not intended, and in any case it can't cause a problem in practice can it?  Well it did!  (Wouldn't you know it -- some people run brokers for a very long time!) We've fixed it in 2.7.1.
* The management plugin interface now displays a bit more information about queue lengths and shovel information is presented a little more nicely, plus there were a number of small problems with statistics and HA slave information that are now fixed.
* `rabbitmqctl eval <expr>` is new (in 2.7.1) to evaluate an arbitrary Erlang expression in the broker node.
* .net client session autoclose could sometimes return an AlreadyClosed exception (it is supposed not to do this).
* The STOMP adapter didn't support reply-to queues properly (they weren't re-usable), and could supply multiple message-id headers on a MESSAGE frame if the SEND frame supplied one. We now check for this latter condition and reject the SEND.
* Some functions used which are no longer in Erlang R15B have been removed (and the code rewritten), so that RabbitMQ should now build and run under the latest Erlang Release. Let us know if not!

## thank you for listening

As usual, the rabbit team welcome feedback of your experiences, good or bad. We encourage you to use the [rabbitmq-discuss](https://lists.rabbitmq.com/cgi-bin/mailman/listinfo/rabbitmq-discuss) mailing list.
