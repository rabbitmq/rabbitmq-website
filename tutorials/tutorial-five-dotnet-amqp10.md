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
### (using the AMQP 1.0 .NET client)

<TutorialsHelp/>

<T5DiagramToC/>

In the [previous tutorial](./tutorial-four-dotnet-amqp10) we used a `direct` exchange to route by a single criterion (severity). **Topic** exchanges route by **patterns** in the routing key — useful when messages carry multiple dimensions (for example `kern.critical`).

<T5DiagramTopicX/>

The sample declares exchange `logs_topic` with type `topic`. The publisher sets the routing key on `PublisherBuilder().Exchange(exchangeName).Key(routingKey)`. The consumer passes one or more binding keys (patterns) on the command line and binds the temporary queue for each.

Topic binding rules:

- `*` substitutes exactly one word.
- `#` substitutes zero or more words.
- Words are separated by `.` in routing keys.

### Running

```bash
dotnet run --project ReceiveLogsTopic/ReceiveLogsTopic.csproj "kern.*"
dotnet run --project EmitLogTopic/EmitLogTopic.csproj kern.critical "A critical kernel error"
```

### Source

- [`EmitLogTopic/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/EmitLogTopic/Program.cs)
- [`ReceiveLogsTopic/Program.cs`](https://github.com/rabbitmq/rabbitmq-tutorials/blob/main/dotnet-amqp/ReceiveLogsTopic/Program.cs)

Now we can move on to [tutorial 6](./tutorial-six-dotnet-amqp10) to learn about the RPC (request/reply) pattern with RabbitMQ.
