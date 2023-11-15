<!--
Copyright (c) 2007-2023 VMware, Inc. or its affiliates.

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

# Management Command Line Tool

The [management plugin](./management) ships with a command line
tool **rabbitmqadmin** which can perform some of the same actions as the
Web-based UI, and which may be more convenient for automation tasks.
Note that rabbitmqadmin is just a specialised HTTP client;
if you are contemplating invoking rabbitmqadmin from your own program
you may want to consider using an HTTP API client library instead.

Note that `rabbitmqadmin` is not a replacement for [rabbitmqctl](./man/rabbitmqctl.8) or
[rabbitmq-plugins](./man/rabbitmq-plugins.8).
HTTP API intentionally doesn't expose certain operations.


## Obtaining `rabbitmqadmin`

`rabbitmqadmin` can be downloaded from any RabbitMQ node that has
the management plugin enabled. Navigate to `http://{hostname}:15672/cli/rabbitmqadmin` to download it.
The tool requires a supported version of Python to be installed.

Alternatively, `rabbitmqadmin` can be downloaded [from GitHub](https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/v3.11.x/deps/rabbitmq_management/bin/rabbitmqadmin).


## Getting Started

UNIX-like operating system users need to copy `rabbitmqadmin` to a directory in `PATH`, e.g. `/usr/local/bin`.

Windows users will need to ensure Python is on their `PATH`, and invoke
`rabbitmqadmin` as `python.exe rabbitmqadmin`.

Invoke `rabbitmqadmin --help` for usage instructions. You can:

* list exchanges, queues, bindings, vhosts, users, permissions, connections and channels
* show overview information
* declare and delete exchanges, queues, bindings, vhosts, users and permissions
* publish and get messages
* close connections and purge queues
* import and export configuration

For other tasks, see [rabbitmqctl](./man/rabbitmqctl.8) and
[rabbitmq-plugins](./man/rabbitmq-plugins.8).


## rabbitmqadmin and RabbitMQ HTTP API Compatibility

`rabbitmqadmin` is developed in lock step with the management plugin and thus
targets a specific version of the HTTP API. For most operations, `rabbitmqadmin` can used
against any reasonably recent RabbitMQ version. However, there are exceptions to this rule.

`rabbitmqadmin` therefore requires the same version series as its target RabbitMQ nodes.
For example, `rabbitmqadmin` 3.7.x can only be used against RabbitMQ 3.7.x nodes, 3.6.x against RabbitMQ 3.6.x nodes,
and so on.


## bash completion

rabbitmqadmin supports tab completion in `bash`. To print a bash
completion script, invoke `rabbitmqadmin --bash-completion`.  This
should be redirected to a file and `source`d.

On Debian-derived
systems, copy the file to `/etc/bash_completion.d` to make it
available system-wide:

```bash
sudo sh -c 'rabbitmqadmin --bash-completion > /etc/bash_completion.d/rabbitmqadmin'
```

## Examples

### Get a list of exchanges

```bash
rabbitmqadmin -V test list exchanges
# => +-------------+---------+-------+---------+-------------+
# => |    name     | durable | vhost |  type   | auto_delete |
# => +-------------+---------+-------+---------+-------------+
# => |             | True    | test  | direct  | False       |
# => | amq.direct  | True    | test  | direct  | False       |
# => | amq.fanout  | True    | test  | fanout  | False       |
# => | amq.headers | True    | test  | headers | False       |
# => | amq.match   | True    | test  | headers | False       |
# => | amq.topic   | True    | test  | topic   | False       |
# => +-------------+---------+-------+---------+-------------+
```

### Get a list of queues, with some columns specified

```bash
rabbitmqadmin list queues vhost name node messages message_stats.publish_details.rate
# => +-------+----------------------------------+-------------------+----------+------------------------------------+
# => | vhost |               name               |       node        | messages | message_stats.publish_details.rate |
# => +-------+----------------------------------+-------------------+----------+------------------------------------+
# => | /     | amq.gen-UELtxwb8OGJ9XHlHJq0Jug== | rabbit@smacmullen | 0        | 100.985821591                      |
# => | /     | test                             | rabbit@misstiny   | 5052     | 100.985821591                      |
# => +-------+----------------------------------+-------------------+----------+------------------------------------+
```

### Get a list of queues, with all the detail we can take

```bash
rabbitmqadmin -f long -d 3 list queues
# =>     --------------------------------------------------------------------------------
# =>
# =>                                            vhost: /
# =>                                             name: amq.gen-UELtxwb8OGJ9XHlHJq0Jug==
# =>                                      auto_delete: False
# =>         backing_queue_status.avg_ack_egress_rate: 100.944672225
# =>        backing_queue_status.avg_ack_ingress_rate: 100.944672225
# => ...
```


### Connect to another host as another user

```bash
rabbitmqadmin -H myserver -u simon -p simon list vhosts
# => +------+
# => | name |
# => +------+
# => | /    |
# => +------+
```

### Declare an exchange

```bash
rabbitmqadmin declare exchange name=my-new-exchange type=fanout
# => exchange declared
```

### Declare a queue, with optional parameters

```bash
rabbitmqadmin declare queue name=my-new-queue durable=false
# => queue declared
```

### Publish a message

```bash
rabbitmqadmin publish exchange=amq.default routing_key=test payload="hello, world"
# => Message published
```

### And get it back

```bash
rabbitmqadmin get queue=test ackmode=ack_requeue_false
# => +-------------+----------+---------------+--------------+------------------+-------------+
# => | routing_key | exchange | message_count |   payload    | payload_encoding | redelivered |
# => +-------------+----------+---------------+--------------+------------------+-------------+
# => | test        |          | 0             | hello, world | string           | False       |
# => +-------------+----------+---------------+--------------+------------------+-------------+
```

### Export Configuration (Definitions)

```bash
rabbitmqadmin export rabbit.definitions.json
# => Exported configuration for localhost to "rabbit.config"
```

### Import Configuration (Definitions), quietly

```bash
rabbitmqadmin -q import rabbit.definitions.json
```

### Close all connections

```bash
rabbitmqadmin -f tsv -q list connections name | while read conn ; do rabbitmqadmin -q close connection name="${conn}" ; done
```
