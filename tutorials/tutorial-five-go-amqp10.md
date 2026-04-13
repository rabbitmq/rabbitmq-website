---
title: RabbitMQ tutorial - Topics (AMQP 1.0)
---
<!--
Copyright (c) 2005-2026 Broadcom. All Rights Reserved. The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.

All rights reserved. This program and the accompanying materials
are made available under the terms of the under the Apache License,
Version 2.0 (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

import TutorialsHelp from '@site/src/components/Tutorials/TutorialsHelp.md';
import T5DiagramToC from '@site/src/components/Tutorials/T5DiagramToC.md';
import T5DiagramTopicX from '@site/src/components/Tutorials/T5DiagramTopicX.md';

# RabbitMQ tutorial - Topics

## Topics
### (using the AMQP 1.0 Go client)

<TutorialsHelp/>

<T5DiagramToC/>

In the [previous tutorial](./tutorial-four-go-amqp10) we improved our logging
system. Instead of using a `fanout` exchange only capable of mindless
broadcasting, we used a `direct` one, and gained the ability to selectively
receive the logs.

Although using the `direct` exchange improved our system, it still has
limitations - it can't do routing based on multiple criteria.

In our logging system we might want to subscribe to not only logs based on
severity, but also based on the source which emitted the log. You might know
this concept from the `syslog` Unix tool, which routes logs based on both
severity (info/warn/crit...) and facility (auth/cron/kern...).

That would give us a lot of flexibility - we may want to listen to just critical
errors coming from 'cron' but also all logs from 'kern'.

To implement our logging system we're going to use a `topic` exchange. Topic
exchanges implement pattern-based message routing.

<T5DiagramTopicX/>

The `topic` exchange is powerful and can behave like other exchanges:

- When a queue is bound with binding key `"*"` (star) it will match any routing key.
- When special characters `"*"` (star) and `"#"` (hash) aren't used in bindings, the topic exchange will behave just like a `direct` one.

Publishing
----------

We'll use a topic exchange named `logs` with routing keys that have the form `"<facility>.<severity>"`:

```bash
go run emit_log_topic.go kern.critical "A critical kernel error"
go run emit_log_topic.go auth.info "Auth info message"
```

See [the full `emit_log_topic.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/emit_log_topic.go) for the implementation using `TopicExchangeSpecification`.

Subscribing
-----------

Receiving will show the power of topic exchanges. We'll create bindings with
pattern-based routing keys:

```bash
go run receive_logs_topic.go "kern.*"
go run receive_logs_topic.go "*.critical"
go run receive_logs_topic.go "kern.critical" "auth.warn"
```

- The first consumer will receive all messages from the `kern` facility.
- The second will receive all messages of severity `critical`.
- The third will receive only critical errors from `kern` and warnings from `auth`.

See [the full `receive_logs_topic.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/receive_logs_topic.go) for the implementation.

Topic exchange binding rules
----------------------------

The topic exchange binding rules are:

- `"#"` can substitute for zero or more words.
- `"*"` can substitute for exactly one word.
- Routing keys are separated by dots (e.g., `"kern.critical"`).

Putting it all together
-----------------------

The full code examples are available at:

- [`emit_log_topic.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/emit_log_topic.go)
- [`receive_logs_topic.go`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/go-amqp/receive_logs_topic.go)

The main pattern is using `TopicExchangeSpecification` instead of `DirectExchangeSpecification`, and binding queues with pattern-based routing keys using `"*"` and `"#"` wildcards.

Now we can move on to [tutorial 6](./tutorial-six-go-amqp10) to learn about the RPC (Request/Reply) pattern with RabbitMQ.
