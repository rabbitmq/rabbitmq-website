# Management Command Line Tool NOSYNTAX

The [management plugin](/management.html) ships with a command line
tool **rabbitmqadmin** which can perform the same actions as the
web-based UI, and which may be more convenient for use when
scripting. Note that rabbitmqadmin is just a specialised HTTP client;
if you are contemplating invoking rabbitmqadmin from your own program
you may want to consider using the HTTP API directly.

## Obtaining rabbitmqadmin

With the management plugin installed, browse to
`http://server-name:15672/cli/` to download. You will need Python 2.x,
2.6 or later (i.e. not Python 3).


Alternatively, you can download the version of rabbitmqadmin which
corresponds with the management plugin version &version-server;
[here](https://raw.githubusercontent.com/rabbitmq/rabbitmq-management/&version-server-tag;/bin/rabbitmqadmin).

## Getting started

Unix users will probably want to copy `rabbitmqadmin` to `/usr/local/bin`.

Windows users will need to ensure Python is on their path, and invoke
rabbitmqadmin as `python.exe rabbitmqadmin`.

Invoke `rabbitmqadmin --help` for usage instructions. You can:

* list exchanges, queues, bindings, vhosts, users, permissions, connections and channels.
* show overview information.
* declare and delete exchanges, queues, bindings, vhosts, users and permissions.
* publish and get messages.
* close connections and purge queues.
* import and export configuration.


## bash completion

rabbitmqadmin supports tab completion in `bash`. To print a bash
completion script, invoke `rabbitmqadmin --bash-completion`.  This
should be redirected to a file and `source`d.

On Debian-derived
systems, copy the file to `/etc/bash_completion.d` to make it
available system-wide:

    sudo sh -c 'rabbitmqadmin --bash-completion > /etc/bash_completion.d/rabbitmqadmin'

## Examples

### Get a list of exchanges

    $ rabbitmqadmin -V test list exchanges
    +-------------+---------+-------+---------+-------------+
    |    name     | durable | vhost |  type   | auto_delete |
    +-------------+---------+-------+---------+-------------+
    |             | True    | test  | direct  | False       |
    | amq.direct  | True    | test  | direct  | False       |
    | amq.fanout  | True    | test  | fanout  | False       |
    | amq.headers | True    | test  | headers | False       |
    | amq.match   | True    | test  | headers | False       |
    | amq.topic   | True    | test  | topic   | False       |
    +-------------+---------+-------+---------+-------------+

### Get a list of queues, with some columns specified

    $ rabbitmqadmin list queues vhost name node messages message_stats.publish_details.rate
    +-------+----------------------------------+-------------------+----------+------------------------------------+
    | vhost |               name               |       node        | messages | message_stats.publish_details.rate |
    +-------+----------------------------------+-------------------+----------+------------------------------------+
    | /     | amq.gen-UELtxwb8OGJ9XHlHJq0Jug== | rabbit@smacmullen | 0        | 100.985821591                      |
    | /     | test                             | rabbit@misstiny   | 5052     | 100.985821591                      |
    +-------+----------------------------------+-------------------+----------+------------------------------------+

### Get a list of queues, with all the detail we can take

    $ rabbitmqadmin -f long -d 3 list queues

    --------------------------------------------------------------------------------

                                           vhost: /
                                            name: amq.gen-UELtxwb8OGJ9XHlHJq0Jug==
                                     auto_delete: False
        backing_queue_status.avg_ack_egress_rate: 100.944672225
       backing_queue_status.avg_ack_ingress_rate: 100.944672225
*and so on, and on...*

### Connect to another host as another user

    $ rabbitmqadmin -H myserver -u simon -p simon list vhosts
    +------+
    | name |
    +------+
    | /    |
    +------+

### Declare an exchange

    $ rabbitmqadmin declare exchange name=my-new-exchange type=fanout
    exchange declared

### Declare a queue, with optional parameters

    $ rabbitmqadmin declare queue name=my-new-queue durable=false
    queue declared

### Publish a message

    $ rabbitmqadmin publish exchange=amq.default routing_key=test payload="hello, world"
    Message published

### And get it back

    $ rabbitmqadmin get queue=test requeue=false
    +-------------+----------+---------------+--------------+------------------+-------------+
    | routing_key | exchange | message_count |   payload    | payload_encoding | redelivered |
    +-------------+----------+---------------+--------------+------------------+-------------+
    | test        |          | 0             | hello, world | string           | False       |
    +-------------+----------+---------------+--------------+------------------+-------------+

### Export configuration

    $ rabbitmqadmin export rabbit.config
    Exported configuration for localhost to "rabbit.config"

### Import configuration, quietly

    $ rabbitmqadmin -q import rabbit.config

### Close all connections

    $ rabbitmqadmin -f tsv -q list connections name | while read conn ; do rabbitmqadmin -q close connection name=${conn} ; done
