---
title: "RabbitMQ 2.5.0 released"
tags: []
authors: [jerry]
---

The RabbitMQ team is delighted to announce the release of RabbitMQ 2.5.0.

<!-- truncate -->

This release fixes a number of bugs. In particular:

* recovery has been simplified, improving startup times when many exchanges or bindings exist
* bindings are recovered between durable queues and non-durable exchanges on restart of individual cluster nodes
* better performance under high load and memory pressure
* source compatibility with the new Erlang R14B03 release

New features include:

* tracing facility for debugging incoming and outgoing messages, (see [firehose](/docs/firehose))
* improved inbound network performance
* improved routing performance
* new rabbitmqctl commands ('report', 'environment', and 'cluster_status')

For details see the [release notes](http://lists.rabbitmq.com/pipermail/rabbitmq-discuss/2011-June/013249.html).

As always, we welcome any questions, bug reports, and other feedback on this release, as well as general suggestions for features and enhancements in future releases. Mail us via the RabbitMQ [discussion list](https://lists.rabbitmq.com/cgi-bin/mailman/listinfo/rabbitmq-discuss), or directly at [info@rabbitmq.com](mailto:info@rabbitmq.com).
