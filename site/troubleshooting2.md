# Troubleshooting 2

## Questions

* _How do I find what is wrong with my RabbitMQ deployment?_
* _Can we have a list of commands that would narrow-down the problem(s)?_
* _What tools do we need so that debugging RabbitMQ deployments is easier? (e.g. observer_cli, what metrics? etc.)_

## Useful commands

`rabbitmqctl cluster_status`

Run this command to find out about the status of the cluster. If there are any
alarms triggered in the cluster, they will appear in the output of this
comamnd. This is a command that should be run on all nodes which are part of
the cluster because if there are any node-specific issues the output of this
command will differ on that node. A healthy cluster will result in the same
output across all nodes.

Given a healthy 3-node cluster, we run this command on all 3 nodes and this is
the output that we expect to see:

<pre class="sourcecode sh">
rmq0-qq:~# rabbitmqctl cluster_status
Cluster status of node rabbit@rmq0-qq ...
[{nodes,[{disc,['rabbit@rmq0-qq','rabbit@rmq1-qq','rabbit@rmq2-qq']}]},
 {running_nodes,['rabbit@rmq2-qq','rabbit@rmq1-qq','rabbit@rmq0-qq']},
 {cluster_name,&lt;&lt;"qq"&gt;&gt;},
 {partitions,[]},
 {alarms,[{'rabbit@rmq2-qq',[]},{'rabbit@rmq1-qq',[]},{'rabbit@rmq0-qq',[]}]}]
</pre>

> TODO: add example when there is a partition && that the command returns non-zero if there is a partition

> TODO: add example when there is an alarm because the output when there are no alarms suggests otherwise

> FEEDBACK: it would be helpful to an end-user if the command output would be
> clear when there is a problem. For example, if there are no partitions, the
> output could have a green colour, or there could be a √ etc.

`rabbitmqctl status`

What we actually care about is the following information:

* RabbitMQ version
* Erlang version
* disk_free limit
* VM high-memory watermark
* file descriptors
* memory breakdown

`rabbitmqctl report`

_We need a better rabbitmqctl report command, the current output is too verbose_

In case `rabbitmqctl list_queues` times out, running these commands will
provide useful context for understanding the source of the problem:

```
rabbitmqctl eval 'rabbit_amqqueue:list().' 2>&1 | tee all_queues.txt
# repeat for every vhost, I'm using / as the vhost example here
rabbitmqctl eval 'rabbit_amqqueue:list_down(<<"/">>).' 2>&1 | tee down_queues.txt
rabbitmqctl eval 'rabbit_amqqueue:info_all(<<"/">>).' 2>&1 | tee all_queues.txt
```
