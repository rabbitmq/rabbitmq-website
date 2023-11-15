RABBITMQCTL(8) - FreeBSD System Manager's Manual

# NAME

**rabbitmqctl** - tool for managing RabbitMQ nodes

# SYNOPSIS

**rabbitmqctl**
\[**-q**]
\[**-s**]
\[**-l**]
\[**-n**&nbsp;*node*]
\[**-t**&nbsp;*timeout*]
*command*
\[*command\_options*]

# DESCRIPTION

RabbitMQ is an open-source multi-protocol messaging broker.

**rabbitmqctl**
is the main command line tool for managing a RabbitMQ server node,
together with
**rabbitmq-diagnostics**
,
**rabbitmq-upgrade**
, and others.

It performs all actions by connecting to the target RabbitMQ node
on a dedicated CLI tool communication port and authenticating
using a shared secret (known as the cookie file).

Diagnostic information is displayed if the connection failed,
the target node was not running, or
**rabbitmqctl**
could not authenticate to
the target node successfully.

To learn more, see the
[RabbitMQ CLI Tools guide](https://rabbitmq.com/cli.html)

# OPTIONS

**-n** *node*

> The default node is
> "*rabbit@target-hostname*",
> where
> *target-hostname*
> is the local host.
> On a host named
> "myserver.example.com",
> the node name will usually be
> "rabbit@myserver"
> (unless
> `RABBITMQ_NODENAME`
> has been overridden, in which case you'll need to use

**--longnames**

> ).
> The output of
> "hostname -s"
> is usually the correct hostname to use after the
> "@"
> sign.
> See
> rabbitmq-server(8)
> for details of configuring a RabbitMQ node.

**-q**, **--quiet**

> Quiet output mode is selected.
> Informational messages are reduced when quiet mode is in effect.

**-s**, **--silent**

> Silent output mode is selected.
> Informational messages are reduced and table headers are suppressed when silent mode is in effect.

**--no-table-headers**

> Do not output headers for tabular data.

**--dry-run**

> Do not run the command.
> Only print informational messages.

**-t** *timeout*, **--timeout** *timeout*

> Operation timeout in seconds.
> Not all commands support timeouts.
> The default is
> **infinity**.

**-l**, **--longnames**

> Must be specified when the cluster is configured to use long (FQDN) node names.
> To learn more, see the
> [RabbitMQ Clustering guide](https://www.rabbitmq.com/clustering.html)

**--erlang-cookie** *cookie*

> Shared secret to use to authenticate to the target node.
> Prefer using a local file or the
> `RABBITMQ_ERLANG_COOKIE`
> environment variable instead of specifying this option on the command line.
> To learn more, see the
> [RabbitMQ CLI Tools guide](https://www.rabbitmq.com/cli.html)

# COMMANDS

**help** \[**-l**] \[*command\_name*]

> Prints usage for all available commands.

> **-l**, **--list-commands**

> > List command usages only, without parameter explanation.

> *command\_name*

> > Prints usage for the specified command.

**version**

> Displays CLI tools version

## Nodes

**await\_startup**

> Waits for the RabbitMQ application to start on the target node

> For example, to wait for the RabbitMQ application to start:

> > rabbitmqctl await\_startup

**reset**

> Returns a RabbitMQ node to its virgin state.

> Removes the node from any cluster it belongs to, removes all data from
> the management database, such as configured users and vhosts, and
> deletes all persistent messages.

> For
> **reset**
> and
> **force\_reset**
> to succeed the RabbitMQ application must have been stopped, e.g. with
> **stop\_app**.

> For example, to reset the RabbitMQ node:

> > rabbitmqctl reset

**rotate\_logs**

> Instructs the RabbitMQ node to perform internal log rotation.

> Log rotation is performed according to the logging settings specified in the configuration file.
> The rotation operation is asynchronous, there is no guarantee that it will complete before this command returns.

> Note that there is no need to call this command in case of external log rotation (e.g. from logrotate(8)).

> For example, to initial log rotation:

> > rabbitmqctl rotate\_logs

**shutdown**

> Shuts down the node, both RabbitMQ and its runtime.
> The command is blocking and will return after the runtime process exits.
> If RabbitMQ fails to stop, it will return a non-zero exit code.
> This command infers the OS PID of the target node and
> therefore can only be used to shut down nodes running on the same
> host (or broadly speaking, in the same operating system,
> e.g. in the same VM or container)

> Unlike the stop command, the shutdown command:

> *	does not require a
> 	*pid\_file*
> 	to wait for the runtime process to exit

> *	returns a non-zero exit code if the RabbitMQ node is not running

> For example, this will shut down a local RabbitMQ node running with
> the default node name:

> > rabbitmqctl shutdown

**start\_app**

> Starts the RabbitMQ application.

> This command is typically run after performing other management actions
> that require the RabbitMQ application to be stopped, e.g.
> **reset**.

> For example, to instruct the RabbitMQ node to start the RabbitMQ
> application:

> > rabbitmqctl start\_app

**stop** \[*pid\_file*]

> Stops the Erlang node on which RabbitMQ is running.
> To restart the node follow the instructions for
> "Running the Server"
> in the
> [installation guide](https://rabbitmq.com/download.html).

> If a
> *pid\_file*
> is specified, also waits for the process specified there to terminate.
> See the description of the
> **wait**
> command for details on this file.

> For example, to instruct the RabbitMQ node to terminate:

> > rabbitmqctl stop

**stop\_app**

> Stops the RabbitMQ application, leaving the runtime (Erlang VM) running.

> This command is typically run before performing other management
> actions that require the RabbitMQ application to be stopped, e.g.
> **reset**.

> For example, to instruct the RabbitMQ node to stop the RabbitMQ
> application:

> > rabbitmqctl stop\_app

**wait** *pid\_file*, **wait** **--pid** *pid*

> Waits for the RabbitMQ application to start.

> This command will wait for the RabbitMQ application to start at the
> node.
> It will wait for the pid file to be created if
> *pidfile*
> is specified, then for a process with a pid specified in the pid file or
> the
> **--pid**
> argument, and then for the RabbitMQ application to start in that process.
> It will fail if the process terminates without starting the RabbitMQ
> application.

> If the specified pidfile is not created or the erlang node is not started
> within
> **--timeout**
> the command will fail.
> The default timeout is 10 seconds.

> A suitable pid file is created by the
> rabbitmq-server(8)
> script.
> By default, this is located in the Mnesia directory.
> Modify the
> `RABBITMQ_PID_FILE`
> environment variable to change the location.

> For example, this command will return when the RabbitMQ node has started
> up:

> > rabbitmqctl wait /var/run/rabbitmq/pid

## Cluster management

**await\_online\_nodes** *count*

> Waits for
> *count*
> nodes to join the cluster

> For example, to wait for two RabbitMQ nodes to start:

> > rabbitmqctl await\_online\_nodes 2

**change\_cluster\_node\_type** *type*

> Changes the type of the cluster node.

> The
> *type*
> must be one of the following:

> *	**disc**
> *	**ram**

> The node must be stopped for this operation to succeed, and when turning
> a node into a RAM node the node must not be the only disc node in the
> cluster.

> For example, this command will turn a RAM node into a disc node:

> > rabbitmqctl change\_cluster\_node\_type disc

**cluster\_status**

> Displays all the nodes in the cluster grouped by node type, together
> with the currently running nodes.

> For example, this command displays the nodes in the cluster:

> > rabbitmqctl cluster\_status

**force\_boot**

> Ensures that the node will start next time, even if it was not the last
> to shut down.

> Normally when you shut down a RabbitMQ cluster altogether, the first
> node you restart should be the last one to go down, since it may have
> seen things happen that other nodes did not.
> But sometimes that's not possible: for instance, if the entire cluster
> loses power then all nodes may think they were not the last to shut
> down.

> In such a case you can invoke
> **force\_boot**
> while the node is down.
> This will tell the node to unconditionally start the next time you ask
> it.
> Any changes to the cluster after this node shut down will be lost.

> If the last node to go down is permanently lost then you should use
> **forget\_cluster\_node** **--offline**
> instead of this command, as it will ensure that mirrored queues
> whose leader replica was on the lost node get promoted.

> For example, this will force the node not to wait for other nodes the
> next time it is started:

> > rabbitmqctl force\_boot

**force\_reset**

> Forcefully returns a RabbitMQ node to its virgin state.

> The
> **force\_reset**
> command differs from
> **reset**
> in that it resets the node unconditionally, regardless of the current
> management database state and cluster configuration.
> It should only be used as a last resort if the database or cluster
> configuration has been corrupted.

> For
> **reset**
> and
> **force\_reset**
> to succeed the RabbitMQ application must have been stopped, e.g. with
> **stop\_app**.

> For example, to reset the RabbitMQ node:

> > rabbitmqctl force\_reset

**forget\_cluster\_node** \[**--offline**]

> **--offline**

> > Enables node removal from an offline node.
> > This is only useful in the situation where all the nodes are offline and
> > the last node to go down cannot be brought online, thus preventing the
> > whole cluster from starting.
> > It should not be used in any other circumstances since it can lead to
> > inconsistencies.

> Removes a cluster node remotely.
> The node that is being removed must be offline, while the node we are
> removing from must be online, except when using the
> **--offline**
> flag.

> When using the
> **--offline**
> flag ,
> **rabbitmqctl**
> will not attempt to connect to a node as normal; instead it will
> temporarily become the node in order to make the change.
> This is useful if the node cannot be started normally.
> In this case, the node will become the canonical source for cluster
> metadata (e.g. which queues exist), even if it was not before.
> Therefore you should use this command on the latest node to shut down if
> at all possible.

> For example, this command will remove the node
> "rabbit@stringer"
> from the node
> "hare@mcnulty":

> > rabbitmqctl -n hare@mcnulty forget\_cluster\_node rabbit@stringer

**join\_cluster** *seed-node* \[**--ram**]

> *seed-node*

> > Existing cluster member (seed node) to cluster with.

> **--ram**

> > If provided, the node will join the cluster as a RAM node.
> > RAM node use is discouraged. Use only if you understand why
> > exactly you need to use them.

> Instructs the node to become a member of the cluster that the specified
> node is in.
> Before clustering, the node is reset, so be careful when using this
> command.
> For this command to succeed the RabbitMQ application must have been
> stopped, e.g. with
> **stop\_app**.

> Cluster nodes can be of two types: disc or RAM.
> Disc nodes replicate data in RAM and on disk, thus providing redundancy
> in the event of node failure and recovery from global events such as
> power failure across all nodes.
> RAM nodes replicate data in RAM only (except for queue contents, which
> can reside on disk if the queue is persistent or too big to fit in
> memory) and are mainly used for scalability.
> RAM nodes are more performant only when managing resources (e.g.
> adding/removing queues, exchanges, or bindings).
> A cluster must always have at least one disc node and usually should
> have more than one.

> The node will be a disc node by default.
> If you wish to create a RAM node, provide the
> **--ram**
> flag.

> After executing the
> **join\_cluster**
> command, whenever the RabbitMQ application is started on the current
> node it will attempt to connect to the nodes that were in the cluster
> when the node went down.

> To leave a cluster,
> **reset**
> the node.
> You can also remove nodes remotely with the
> **forget\_cluster\_node**
> command.

> For example, this command instructs the RabbitMQ node to join the cluster that
> "hare@elena"
> is part of, as a ram node:

> > rabbitmqctl join\_cluster hare@elena --ram

> To learn more, see the
> [RabbitMQ Clustering guide](https://www.rabbitmq.com/clustering.html).

**rename\_cluster\_node** *oldnode1* *newnode1* \[*oldnode2* *newnode2 ...*]

> Supports renaming of cluster nodes in the local database.

> This subcommand causes
> **rabbitmqctl**
> to temporarily become the node in order to make the change.
> The local cluster node must therefore be completely stopped; other nodes
> can be online or offline.

> This subcommand takes an even number of arguments, in pairs representing
> the old and new names for nodes.
> You must specify the old and new names for this node and for any other
> nodes that are stopped and being renamed at the same time.

> It is possible to stop all nodes and rename them all simultaneously (in
> which case old and new names for all nodes must be given to every node)
> or stop and rename nodes one at a time (in which case each node only
> needs to be told how its own name is changing).

> For example, this command will rename the node
> "rabbit@misshelpful"
> to the node
> "rabbit@cordelia"

> > rabbitmqctl rename\_cluster\_node rabbit@misshelpful rabbit@cordelia

> Note that this command only changes the local database.
> It may also be necessary to rename the local database directories
> and configure the new node name.
> For example:

> 1.	Stop the node:  
> 	> rabbitmqctl stop rabbit@misshelpful

> 2.	Rename the node in the local database:  
> 	> rabbitmqctl rename\_cluster\_node rabbit@misshelpful rabbit@cordelia

> 3.	Rename the local database directories (note, you do not need to do this
> 	if you have set the RABBITMQ\_MNESIA\_DIR environment variable):  
> 	> mv &#92;
> 	>   /var/lib/rabbitmq/mnesia/rabbit&#92;@misshelpful &#92;
> 	>   /var/lib/rabbitmq/mnesia/rabbit&#92;@cordelia
> 	> mv &#92;
> 	>   /var/lib/rabbitmq/mnesia/rabbit&#92;@misshelpful-rename &#92;
> 	>   /var/lib/rabbitmq/mnesia/rabbit&#92;@cordelia-rename
> 	> mv &#92;
> 	>   /var/lib/rabbitmq/mnesia/rabbit&#92;@misshelpful-plugins-expand &#92;
> 	>   /var/lib/rabbitmq/mnesia/rabbit&#92;@cordelia-plugins-expand

> 4.	If node name is configured e.g. using
> 	*/etc/rabbitmq/rabbitmq-env.conf*
> 	, it also needs to be updated there.

> 5.	Start the node when ready

**update\_cluster\_nodes** *clusternode*

> *clusternode*

> > The node to consult for up-to-date information.

> Instructs an already clustered node to contact
> *clusternode*
> to cluster when booting up.
> This is different from
> **join\_cluster**
> since it does not join any cluster - it checks that the node is already
> in a cluster with
> *clusternode*.

> The need for this command is motivated by the fact that clusters can
> change while a node is offline.
> Consider a situation where node
> *rabbit@A*
> and
> *rabbit@B*
> are clustered.
> *rabbit@A*
> goes down,
> *rabbit@C*
> clusters with
> *rabbit@B*,
> and then
> *rabbit@B*
> leaves the cluster.
> When
> *rabbit@A*
> starts back up, it'll try to contact
> *rabbit@B*,
> but this will fail since
> *rabbit@B*
> is not in the cluster anymore.
> The following command will rename node
> *rabbit@B*
> to
> *rabbit@C*
> on node
> *rabbitA*

> > update\_cluster\_nodes -n *rabbit@A* *rabbit@B* *rabbit@C*

> To learn more, see the
> [RabbitMQ Clustering guide](https://www.rabbitmq.com/clustering.html)

## Replication

**sync\_queue** \[**-p** *vhost*] *queue*

> *queue*

> > The name of the queue to synchronise.

> Instructs a mirrored queue with unsynchronised mirrors (follower replicas)
> to synchronise them.
> The queue will block while synchronisation takes place (all publishers
> and consumers using the queue will block or temporarily see no activity).
> This command can only be used with mirrored queues.
> To learn more, see the
> [RabbitMQ Mirroring guide](https://www.rabbitmq.com/ha.html)

> Note that queues with unsynchronised replicas and active consumers
> will become synchronised eventually (assuming that consumers make progress).
> This command is primarily useful for queues that do not have active consumers.

**cancel\_sync\_queue** \[**-p** *vhost*] *queue*

> *queue*

> > The name of the queue to cancel synchronisation for.

> Instructs a synchronising mirrored queue to stop synchronising itself.

## User Management

Note that all user management commands
**rabbitmqctl**
only can manage users in the internal RabbitMQ database.
Users from any alternative authentication backends such as LDAP cannot be inspected
or managed with those commands.
**rabbitmqctl**.

**add\_user** *username* *password*

> *username*

> > The name of the user to create.

> *password*

> > The password the created user will use to log in to the broker.

> For example, this command instructs the RabbitMQ broker to create a (non-administrative) user named
> "janeway"
> with (initial) password
> "changeit":

> > rabbitmqctl add\_user janeway changeit

**authenticate\_user** *username* *password*

> *username*

> > The name of the user.

> *password*

> > The password of the user.

> For example, this command instructs the RabbitMQ broker to authenticate the user named
> "janeway"
> with the password
> "verifyit":

> > rabbitmqctl authenticate\_user janeway verifyit

**change\_password** *username* *newpassword*

> *username*

> > The name of the user whose password is to be changed.

> *newpassword*

> > The new password for the user.

> For example, this command instructs the RabbitMQ broker to change the
> password for the user named
> "janeway"
> to
> "newpass":

> > rabbitmqctl change\_password janeway newpass

**clear\_password** *username*

> *username*

> > The name of the user whose password is to be cleared.

> For example, this command instructs the RabbitMQ broker to clear the
> password for the user named
> "janeway":

> > rabbitmqctl clear\_password janeway

> This user now cannot log in with a password (but may be able to through
> e.g. SASL EXTERNAL if configured).

**hash\_password** *plaintext*

> *plaintext*

> > The plaintext password to hash

> Hashes a plaintext password according to the currently configured password hashing algorithm

**delete\_user** *username*

> *username*

> > The name of the user to delete.

> For example, this command instructs the RabbitMQ broker to delete the user named
> "janeway":

> > rabbitmqctl delete\_user janeway

**list\_users**

> Lists users.
> Each result row will contain the user name followed by a list of the
> tags set for that user.

> For example, this command instructs the RabbitMQ broker to list all users:

> > rabbitmqctl list\_users

**set\_user\_tags** *username* \[*tag ...*]

> *username*

> > The name of the user whose tags are to be set.

> *tag*

> > Zero, one or more tags to set.
> > Any existing tags will be removed.

> For example, this command instructs the RabbitMQ broker to ensure the user named
> "janeway"
> is an administrator:

> > rabbitmqctl set\_user\_tags janeway administrator

> This has no effect when the user authenticates using a messaging protocol, but can be used to
> permit the user to manage users, virtual hosts and permissions when
> the user logs in via some other means (for example with the management
> plugin).

> This command instructs the RabbitMQ broker to remove any tags from the user named
> "janeway":

> > rabbitmqctl set\_user\_tags janeway

## Access control

**clear\_permissions** \[**-p** *vhost*] *username*

> *vhost*

> > The name of the virtual host to which to deny the user access,
> > defaulting to
> > "/".

> *username*

> > The name of the user to deny access to the specified virtual host.

> Sets user permissions.

> For example, this command instructs the RabbitMQ broker to deny the user
> named
> "janeway"
> access to the virtual host called
> "my-vhost":

> > rabbitmqctl clear\_permissions -p my-vhost janeway

**clear\_topic\_permissions** \[**-p** *vhost*] *username* \[*exchange*]

> *vhost*

> > The name of the virtual host to which to clear the topic permissions,
> > defaulting to
> > "/".

> *username*

> > The name of the user to clear topic permissions to the specified virtual host.

> *exchange*

> > The name of the topic exchange to clear topic permissions, defaulting to all the
> > topic exchanges the given user has topic permissions for.

> Clear user topic permissions.

> For example, this command instructs the RabbitMQ broker to remove topic permissions
> for the user named
> "janeway"
> for the topic exchange
> "amq.topic"
> in the virtual host called
> "my-vhost":

> > rabbitmqctl clear\_topic\_permissions -p my-vhost janeway amq.topic

**list\_permissions** \[**-p** *vhost*]

> *vhost*

> > The name of the virtual host for which to list the users that have been
> > granted access to it, and their permissions.
> > Defaults to
> > "/".

> Lists permissions in a virtual host.

> For example, this command instructs the RabbitMQ broker to list all the
> users who have been granted access to the virtual host called
> "my-vhost",
> and the permissions they have for operations on resources in that
> virtual host.
> Note that an empty string means no permissions are granted:

> > rabbitmqctl list\_permissions -p my-vhost

**list\_topic\_permissions** \[**-p** *vhost*]

> *vhost*

> > The name of the virtual host for which to list the user's topic permissions.
> > Defaults to
> > "/".

> Lists topic permissions in a virtual host.

> For example, this command instructs the RabbitMQ broker to list all the
> users who have been granted topic permissions in the virtual host called
> "my-vhost:"

> > rabbitmqctl list\_topic\_permissions -p my-vhost

**list\_user\_permissions** *username*

> *username*

> > The name of the user for which to list the permissions.

> Lists user permissions.

> For example, this command instructs the RabbitMQ broker to list all the
> virtual hosts to which the user named
> "janeway"
> has been granted access, and the permissions the user has for operations
> on resources in these virtual hosts:

> > rabbitmqctl list\_user\_permissions janeway

**list\_user\_topic\_permissions** *username*

> *username*

> > The name of the user for which to list the topic permissions.

> Lists user topic permissions.

> For example, this command instructs the RabbitMQ broker to list all the
> virtual hosts to which the user named
> "janeway"
> has been granted access, and the topic permissions the user has in these virtual hosts:

> > rabbitmqctl list\_user\_topic\_permissions janeway

**list\_vhosts** \[*vhostinfoitem ...*]

> Lists virtual hosts.

> The
> *vhostinfoitem*
> parameter is used to indicate which virtual host information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *vhostinfoitem*
> can take any value from the list that follows:

> **name**

> > The name of the virtual host with non-ASCII characters escaped as in C.

> **tracing**

> > Whether tracing is enabled for this virtual host.

> **default\_queue\_type**

> > Default queue type for this vhost.

> **description**

> > Virtual host description.

> **tags**

> > Virtual host tags.

> **cluster\_state**

> > Virtual host state: nodedown, running, stopped.

> If no
> *vhostinfoitem s*
> are specified then the vhost name is displayed.

> For example, this command instructs the RabbitMQ broker to list all
> virtual hosts:

> > rabbitmqctl list\_vhosts name tracing

**set\_permissions** \[**-p** *vhost*] *user* *conf* *write* *read*

> *vhost*

> > The name of the virtual host to which to grant the user access,
> > defaulting to
> > "/".

> *user*

> > The name of the user to grant access to the specified virtual host.

> *conf*

> > A regular expression matching resource names for which the user is
> > granted configure permissions.

> *write*

> > A regular expression matching resource names for which the user is
> > granted write permissions.

> *read*

> > A regular expression matching resource names for which the user is
> > granted read permissions.

> Sets user permissions.

> For example, this command instructs the RabbitMQ broker to grant the
> user named
> "janeway"
> access to the virtual host called
> "my-vhost",
> with configured permissions on all resources whose names start with
> "janeway-",
> and write and read permissions on all resources:

> > rabbitmqctl set\_permissions -p my-vhost janeway "^janeway-.\*" ".\*" ".\*"

**set\_permissions\_globally** *username* *conf* *write* *read*

> *username*

> > The name of the user to grant access to the specified virtual host.

> *conf*

> > A regular expression matching resource names for which the user is
> > granted configure permissions.

> *write*

> > A regular expression matching resource names for which the user is
> > granted write permissions.

> *read*

> > A regular expression matching resource names for which the user is
> > granted read permissions.

> Sets user permissions in all vhosts.

> For example, this command instructs the RabbitMQ broker to grant the
> user named
> "janeway"
> access to all virtual hosts with configure permissions on all resources whose names starts with
> "janeway-",
> and write and read permissions on all resources:

> > rabbitmqctl set\_permissions\_globally janeway "^janeway-.\*" ".\*" ".\*"

**set\_topic\_permissions** \[**-p** *vhost*] *user* *exchange* *write* *read*

> *vhost*

> > The name of the virtual host to which to grant the user access,
> > defaulting to
> > "/".

> *user*

> > The name of the user the permissions apply to in the target virtual host.

> *exchange*

> > The name of the topic exchange to which the authorisation check will be applied.

> *write*

> > A regular expression matching the routing key of the published message.

> *read*

> > A regular expression matching the routing key of the consumed message.

> Sets user topic permissions.

> For example, this command instructs the RabbitMQ broker to let the
> user named
> "janeway"
> publish and consume messages going through the
> "amp.topic"
> exchange of the
> "my-vhost"
> virtual host with a routing key starting with
> "janeway-":

> > rabbitmqctl set\_topic\_permissions -p my-vhost janeway amq.topic "^janeway-.\*" "^janeway-.\*"

> Topic permissions support variable expansion for the following variables:
> username, vhost, and client\_id. Note that client\_id is expanded only when using MQTT.
> The previous example could be made more generic by using
> "^&lcub;username}-.\*":

> > rabbitmqctl set\_topic\_permissions -p my-vhost janeway amq.topic "^&lcub;username}-.\*" "^&lcub;username}-.\*"

## Monitoring, observability and health checks

**environment**

> Displays the name and value of each variable in the application
> environment for each running application.

**list\_bindings** \[**-p** *vhost*] \[*bindinginfoitem ...*]

> Returns binding details.
> By default, the bindings for the
> "/"
> virtual host are returned.
> The
> **-p**
> flag can be used to override this default.

> The
> *bindinginfoitem*
> parameter is used to indicate which binding information items to include
> in the results.
> The column order in the results will match the order of the parameters.
> *bindinginfoitem*
> can take any value from the list that follows:

> **source\_name**

> > The name of the source of messages to which the binding is attached.
> > With non-ASCII characters escaped as in C.

> **source\_kind**

> > The kind of the source of messages to which the binding is attached.
> > Currently always exchange.
> > With non-ASCII characters escaped as in C.

> **destination\_name**

> > The name of the destination of messages to which the binding is
> > attached.
> > With non-ASCII characters escaped as in C.

> **destination\_kind**

> > The kind of destination of messages to which the binding is attached.
> > With non-ASCII characters escaped as in C.

> **routing\_key**

> > The binding's routing key with non-ASCII characters escaped as in C.

> **arguments**

> > The binding's arguments.

> If no
> *bindinginfoitem s*
> are specified then all the above items are displayed.

> For example, this command displays the exchange name and queue name of
> the bindings in the virtual host named
> "my-vhost"

> > rabbitmqctl list\_bindings -p my-vhost exchange\_name queue\_name

**list\_channels** \[*channelinfoitem ...*]

> Returns information on all current channels, the logical containers
> executing most AMQP commands.
> This includes channels that are part of ordinary AMQP connections and
> channels created by various plug-ins and other extensions.

> The
> *channelinfoitem*
> parameter is used to indicate which channel information items to include
> in the results.
> The column order in the results will match the order of the parameters.
> *channelinfoitem*
> can take any value from the list that follows:

> **pid**

> > Id of the Erlang process associated with the connection.

> **connection**

> > Id of the Erlang process associated with the connection to which the
> > channel belongs.

> **name**

> > Readable name for the channel.

> **number**

> > The number of the channel uniquely identifying it within a
> > connection.

> **user**

> > The username associated with the channel.

> **vhost**

> > Virtual host in which the channel operates.

> **transactional**

> > True if the channel is in transactional mode, false otherwise.

> **confirm**

> > True if the channel is in confirm mode, false otherwise.

> **consumer\_count**

> > The number of logical AMQP consumers retrieving messages via the channel.

> **messages\_unacknowledged**

> > The number of messages delivered via this channel but not yet acknowledged.

> **messages\_uncommitted**

> > The number of messages received in an as-yet uncommitted transaction.

> **acks\_uncommitted**

> > The number of acknowledgements received in an as-yet uncommitted transaction.

> **messages\_unconfirmed**

> > The number of not yet confirmed published messages.
> > On channels not in confirm mode, this remains 0.

> **prefetch\_count**

> > QoS prefetch limit for new consumers, 0 if unlimited.

> **global\_prefetch\_count**

> > QoS prefetch limit for the entire channel, 0 if unlimited.

> If no
> *channelinfoitem s*
> are specified then pid, user, consumer\_count, and
> messages\_unacknowledged are assumed.

> For example, this command displays the connection process and count of
> unacknowledged messages for each channel:

> > rabbitmqctl list\_channels connection messages\_unacknowledged

**list\_ciphers**

> Lists cipher suites supported by encoding commands.

> For example, this command instructs the RabbitMQ broker to list all
> cipher suites supported by encoding commands:

> > rabbitmqctl list\_ciphers

**list\_connections** \[*connectioninfoitem ...*]

> Returns TCP/IP connection statistics.

> The
> *connectioninfoitem*
> parameter is used to indicate which connection information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *connectioninfoitem*
> can take any value from the list that follows:

> **pid**

> > Id of the Erlang process associated with the connection.

> **name**

> > Readable name for the connection.

> **port**

> > Server port.

> **host**

> > Server hostname obtained via reverse DNS, or its IP address if reverse
> > DNS failed or was turned off.

> **peer\_port**

> > Peer port.

> **peer\_host**

> > Peer hostname obtained via reverse DNS, or its IP address if reverse DNS
> > failed or was not enabled.

> **ssl**

> > Boolean indicating whether the connection is secured with SSL.

> **ssl\_protocol**

> > SSL protocol (e.g.
> > "tlsv1").

> **ssl\_key\_exchange**

> > SSL key exchange algorithm (e.g.
> > "rsa").

> **ssl\_cipher**

> > SSL cipher algorithm (e.g.
> > "aes\_256\_cbc").

> **ssl\_hash**

> > SSL hash function (e.g.
> > "sha").

> **peer\_cert\_subject**

> > The subject of the peer's SSL certificate in RFC4514 form.

> **peer\_cert\_issuer**

> > The issuer of the peer's SSL certificate, in RFC4514 form.

> **peer\_cert\_validity**

> > The period for which the peer's SSL certificate is valid.

> **state**

> > Connection state; one of:

> > *	starting
> > *	tuning
> > *	opening
> > *	running
> > *	flow
> > *	blocking
> > *	blocked
> > *	closing
> > *	closed

> **channels**

> > The number of channels using the connection.

> **protocol**

> > The version of the AMQP protocol in use -- currently one of:

> > *	&lcub;0,9,1}
> > *	&lcub;0,8,0}

> > Note that if a client requests an AMQP 0-9 connection, we treat it as
> > AMQP 0-9-1.

> **auth\_mechanism**

> > SASL authentication mechanism used, such as
> > "PLAIN".

> **user**

> > The username associated with the connection.

> **vhost**

> > Virtual hostname with non-ASCII characters escaped as in C.

> **timeout**

> > Connection timeout / negotiated heartbeat interval, in seconds.

> **frame\_max**

> > Maximum frame size (bytes).

> **channel\_max**

> > Maximum number of channels on this connection.

> **client\_properties**

> > Informational properties transmitted by the client during connection
> > establishment.

> **recv\_oct**

> > Octets received.

> **recv\_cnt**

> > Packets received.

> **send\_oct**

> > Octets send.

> **send\_cnt**

> > Packets sent.

> **send\_pend**

> > Send queue size.

> **connected\_at**

> > Date and time this connection was established, as a timestamp.

> If no
> *connectioninfoitem s*
> are specified then user, peer host, peer port, time since flow
> control, and memory block state are displayed.

> For example, this command displays the send queue size and server port
> for each connection:

> > rabbitmqctl list\_connections send\_pend port

**list\_consumers** \[**-p** *vhost*]

> Lists consumers, i.e. subscriptions to a queue&#180;s message stream.
> Each line printed shows, separated by tab characters, the name of
> the queue subscribed to, the id of the channel process via which the
> subscription was created and is managed, the consumer tag which uniquely
> identifies the subscription within a channel, a boolean indicating
> whether acknowledgements are expected for messages delivered to this
> consumer, an integer indicating the prefetch limit (with 0 meaning
> "none"),
> and any arguments for this consumer.

**list\_exchanges** \[**-p** *vhost*] \[*exchangeinfoitem ...*]

> Returns exchange details.
> Exchange details of the
> "/"
> virtual host are returned if the
> **-p**
> flag is absent.
> The
> **-p**
> flag can be used to override this default.

> The
> *exchangeinfoitem*
> parameter is used to indicate which exchange information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *exchangeinfoitem*
> can take any value from the list that follows:

> **name**

> > The name of the exchange with non-ASCII characters escaped as in C.

> **type**

> > The exchange type, such as:

> > *	direct
> > *	topic
> > *	headers
> > *	fanout

> **durable**

> > Whether or not the exchange survives server restarts.

> **auto\_delete**

> > Whether the exchange will be deleted automatically when no longer used.

> **internal**

> > Whether the exchange is internal, i.e. clients cannot publish to it
> > directly.

> **arguments**

> > Exchange arguments.

> **policy**

> > Policy name for applying to the exchange.

> If no
> *exchangeinfoitem s*
> are specified then exchange name and type are displayed.

> For example, this command displays the name and type for each exchange
> of the virtual host named
> "my-vhost":

> > rabbitmqctl list\_exchanges -p my-vhost name type

**list\_hashes**

> Lists hash functions supported by encoding commands.

> For example, this command instructs the RabbitMQ broker to list all hash
> functions supported by encoding commands:

> > rabbitmqctl list\_hashes

**list\_queues** \[**-p** *vhost*] \[**--offline** | **--online** | **--local**] \[*queueinfoitem ...*]

> Returns queue details.
> Queue details of the
> "/"
> virtual host are returned if the
> **-p**
> flag is absent.
> The
> **-p**
> flag can be used to override this default.

> Displayed queues can be filtered by their status or location using one
> of the following mutually exclusive options:

> **--offline**

> > List only those durable queues that are not currently available (more
> > specifically, their leader node isn't).

> **--online**

> > List queues that are currently available (their leader node is).

> **--local**

> > List only those queues whose leader replica is located on the current
> > node.

> The
> *queueinfoitem*
> parameter is used to indicate which queue information items to include
> in the results.
> The column order in the results will match the order of the parameters.
> *queueinfoitem*
> can take any value from the list that follows:

> **name**

> > The name of the queue with non&#45;ASCII characters escaped as in C.

> **durable**

> > Whether or not the queue survives server restarts.

> **auto\_delete**

> > Whether the queue will be deleted automatically when no longer used.

> **arguments**

> > Queue arguments.

> **policy**

> > Name of the user policy that is applied to the queue.

> **operator\_policy**

> > Name of the operator policy that is applied to the queue.

> **effective\_policy\_definition**

> > Effective policy definition for the queue: both user and operator policy definitions merged.

> **pid**

> > Erlang process identifier of the queue.

> **owner\_pid**

> > Id of the Erlang process of the connection which is the
> > exclusive owner of the queue.
> > Empty if the queue is non-exclusive.

> **exclusive**

> > True if the queue is exclusive (i.e. has owner\_pid), false otherwise.

> **exclusive\_consumer\_pid**

> > Id of the Erlang process representing the channel of the exclusive
> > consumer subscribed to this queue.
> > Empty if there is no exclusive consumer.

> **exclusive\_consumer\_tag**

> > The consumer tag of the exclusive consumer subscribed to this queue.
> > Empty if there is no exclusive consumer.

> **messages\_ready**

> > The number of messages ready to be delivered to clients.

> **messages\_unacknowledged**

> > The number of messages delivered to clients but not yet acknowledged.

> **messages**

> > The sum of ready and unacknowledged messages (queue depth).

> **messages\_ready\_ram**

> > The number of messages from messages\_ready which are resident in ram.

> **messages\_unacknowledged\_ram**

> > The number of messages from messages\_unacknowledged which are resident in
> > ram.

> **messages\_ram**

> > Total number of messages which are resident in ram.

> **messages\_persistent**

> > Total number of persistent messages in the queue (will always be 0 for
> > transient queues).

> **message\_bytes**

> > The sum of the size of all message bodies in the queue.
> > This does not include the message properties (including headers) or any
> > overhead.

> **message\_bytes\_ready**

> > Like
> > **message\_bytes**
> > but counting only those messages ready to be delivered to clients.

> **message\_bytes\_unacknowledged**

> > Like
> > **message\_bytes**
> > but counting only those messages delivered to clients but not yet
> > acknowledged.

> **message\_bytes\_ram**

> > Like
> > **message\_bytes**
> > but counting only those messages that are currently held in RAM.

> **message\_bytes\_persistent**

> > Like
> > **message\_bytes**
> > but counting only those messages which are persistent.

> **head\_message\_timestamp**

> > The timestamp property of the first message in the queue, if present.
> > Timestamps of messages only appear when they are in the paged-in state.

> **disk\_reads**

> > Total number of times messages have been read from disk by this queue
> > since it started.

> **disk\_writes**

> > Total number of times messages have been written to disk by this queue
> > since it started.

> **consumers**

> > The number of consumers.

> **consumer\_utilisation**

> > Fraction of the time (between 0.0 and 1.0) that the queue is able to
> > immediately deliver messages to consumers.
> > This can be less than 1.0 if consumers are limited by network congestion
> > or prefetch count.

> **memory**

> > Bytes of memory allocated by the runtime for the
> > queue, including stack, heap, and internal structures.

> **mirror\_pids**

> > If the queue is mirrored, this lists the IDs of the mirrors (follower replicas).
> > To learn more, see the
> > [RabbitMQ Mirroring guide](https://www.rabbitmq.com/ha.html)

> **synchronised\_mirror\_pids**

> > If the queue is mirrored, this gives the IDs of the mirrors (follower replicas) which
> > are in sync with the leader replica. To learn more, see the
> > [RabbitMQ Mirroring guide](https://www.rabbitmq.com/ha.html)

> **state**

> > The state of the queue.
> > Normally
> > "running",
> > but may be
> > "&lcub;syncing, *message\_count*}"
> > if the queue is synchronising.

> > Queues that are located on cluster nodes that are currently down will
> > be shown with a status of
> > "down"
> > (and most other
> > *queueinfoitem*
> > will be unavailable).

> **type**

> > Queue type, one of: quorum, stream, classic.

> If no
> *queueinfoitem s*
> are specified then queue name and depth are displayed.

> For example, this command displays the depth and number of consumers for
> each queue of the virtual host named
> "my-vhost"

> > rabbitmqctl list\_queues -p my-vhost messages consumers

**list\_unresponsive\_queues** \[**--local**] \[**--queue-timeout** *milliseconds*] \[*queueinfoitem ...*] \[**--no-table-headers**]

> Tests queue leader replicas to respond within the given timeout. Lists those that did not respond in time.

> Displayed queues can be filtered by their status or location using one
> of the following mutually exclusive options:

> **--all**

> > List all queues.

> **--local**

> > List only those queues whose leader replica is located on the current
> > node.

> The
> *queueinfoitem*
> parameter is used to indicate which queue information items to include
> in the results.
> The column order in the results will match the order of the parameters.
> *queueinfoitem*
> can take any value from the list that follows:

> **name**

> > The name of the queue with non&#45;ASCII characters escaped as in C.

> **durable**

> > Whether or not the queue should survive server restarts.

> **auto\_delete**

> > Whether the queue will be deleted automatically when all of its explicit bindings are deleted.

> **arguments**

> > Queue arguments.

> **policy**

> > Effective policy name for the queue.

> **pid**

> > Erlang process identifier of the leader replica.

> **recoverable\_mirrors**

> > Erlang process identifiers of the mirror replicas that are considered reachable (available).

> **type**

> > Queue type, one of: quorum, stream, classic.

> For example, this command lists only those unresponsive queues whose leader replica
> is hosted on the target node.

> > rabbitmqctl list\_unresponsive\_queues --local name

**ping**

> Checks that the node OS process is up, registered with EPMD, and CLI tools can authenticate with it

> Example:

> > rabbitmqctl ping -n rabbit@hostname

**report**

> Generate a server status report containing a concatenation of all server
> status information for support purposes.
> The output should be redirected to a file when accompanying a support
> request.

> For example, this command creates a server report which may be attached
> to a support request email:

> > rabbitmqctl report &gt; server\_report.txt

**schema\_info** \[**--no-table-headers**] \[*column ...*]

> Lists schema database tables and their properties

> For example, this command lists the table names and their active replicas:

> > rabbitmqctl schema\_info name active\_replicas

**status**

> Displays broker status information such as the running applications on
> the current Erlang node, RabbitMQ and Erlang versions, OS name, and
> memory and file descriptor statistics.
> (See the
> **cluster\_status**
> command to find out which nodes are clustered and running.)

> For example, this command displays information about the RabbitMQ
> broker:

> > rabbitmqctl status

## Runtime Parameters and Policies

Certain features of RabbitMQ (such as the Federation plugin) are
controlled by dynamic, cluster-wide
*parameters.*
There are 2 kinds of parameters: parameters scoped to a virtual host and
global parameters.
Each vhost-scoped parameter consists of a component name, a name, and a
value.
The component name and name are strings, and the value is a valid JSON document.
A global parameter consists of a name and value.
The name is a string and the value is an arbitrary Erlang data structure.
Parameters can be set, cleared, and listed.
In general, you should refer to the documentation for the feature in
question to see how to set parameters.

Policies is a feature built on top of runtime parameters.
Policies are used to control and modify the behaviour of queues and
exchanges on a cluster-wide basis.
Policies apply within a given vhost and consist of a name, pattern,
definition, and an optional priority.
Policies can be set, cleared, and listed.

**clear\_global\_parameter** *name*

> Clears a global runtime parameter.
> This is similar to
> **clear\_parameter**
> but the key-value pair isn't tied to a virtual host.

> *name*

> > The name of the global runtime parameter being cleared.

> For example, this command clears the global runtime parameter
> "mqtt\_default\_vhosts":

> > rabbitmqctl clear\_global\_parameter mqtt\_default\_vhosts

**clear\_parameter** \[**-p** *vhost*] *component\_name* *key*

> Clears a parameter.

> *component\_name*

> > The name of the component for which the parameter is being cleared.

> *name*

> > The name of the parameter being cleared.

> For example, this command clears the parameter
> "node01"
> for the
> "federation-upstream"
> component in the default virtual host:

> > rabbitmqctl clear\_parameter federation-upstream node01

**list\_global\_parameters**

> Lists all global runtime parameters.
> This is similar to
> **list\_parameters**
> but the global runtime parameters are not tied to any virtual host.

> For example, this command lists all global parameters:

> > rabbitmqctl list\_global\_parameters

**list\_parameters** \[**-p** *vhost*]

> Lists all parameters for a virtual host.

> For example, this command lists all parameters in the default virtual
> host:

> > rabbitmqctl list\_parameters

**set\_global\_parameter** *name* *value*

> Sets a global runtime parameter.
> This is similar to
> **set\_parameter**
> but the key-value pair isn't tied to a virtual host.

> *name*

> > The name of the global runtime parameter being set.

> *value*

> > The value for the global runtime parameter, as a JSON document.
> > In most shells you are very likely to need to quote this.

> For example, this command sets the global runtime parameter
> "mqtt\_default\_vhosts"
> to the JSON document &lcub;"O=client,CN=guest":"/"}:

> > rabbitmqctl set\_global\_parameter mqtt\_default\_vhosts '&lcub;"O=client,CN=guest":"/"}'

**set\_parameter** \[**-p** *vhost*] *component\_name* *name* *value*

> Sets a parameter.

> *component\_name*

> > The name of the component for which the parameter is being set.

> *name*

> > The name of the parameter being set.

> *value*

> > The value for the parameter, as a JSON document.
> > In most shells you are very likely to need to quote this.

> For example, this command sets the parameter
> "node01"
> for the
> "federation-upstream"
> component in the default virtual host to the following JSON
> "guest":

> > rabbitmqctl set\_parameter federation-upstream node01 '&lcub;"uri":"amqp://user:password@server/%2F","ack-mode":"on-publish"}'

**list\_policies** \[**-p** *vhost*]

> Lists all policies for a virtual host.

> For example, this command lists all policies in the default virtual
> host:

> > rabbitmqctl list\_policies

**set\_operator\_policy** \[**-p** *vhost*] \[**--priority** *priority*] \[**--apply-to** *apply-to*] *name* *pattern* *definition*

> Sets an operator policy that overrides a subset of arguments in user
> policies.
> Arguments are identical to those of
> **set\_policy**.

> Supported arguments are:

> *	expires
> *	message-ttl
> *	max-length
> *	max-length-bytes

**set\_policy** \[**-p** *vhost*] \[**--priority** *priority*] \[**--apply-to** *apply-to*] *name* *pattern* *definition*

> Sets a policy.

> *name*

> > The name of the policy.

> *pattern*

> > The regular expression allows the policy to apply if it matches a resource name.

> *definition*

> > The definition of the policy, as a JSON document.
> > In most shells you are very likely to need to quote this.

> *priority*

> > The priority of the policy as an integer.
> > Higher numbers indicate greater precedence.
> > The default is 0.

> *apply-to*

> > Which types of objects this policy should apply to.
> > Possible values are:

> > *	queues (all queue types, including streams)
> > *	classic\_queues (classic queues only)
> > *	quorum\_queues (quorum queues only)
> > *	streams (streams only)
> > *	exchanges
> > *	all

> > The default is
> > **all**.

> For example, this command sets the policy
> "federate-me"
> in the default virtual host so that built-in exchanges are federated:

> > rabbitmqctl set\_policy federate-me ^amq. '&lcub;"federation-upstream-set":"all"}'

**clear\_policy** \[**-p** *vhost*] *name*

> Clears a policy.

> *name*

> > The name of the policy being cleared.

> For example, this command clears the
> "federate-me"
> policy in the default virtual host:

> > rabbitmqctl clear\_policy federate-me

**clear\_operator\_policy** \[**-p** *vhost*] *name*

> Clears an operator policy.
> Arguments are identical to those of
> **clear\_policy**.

**list\_operator\_policies** \[**-p** *vhost*]

> Lists operator policy overrides for a virtual host.
> Arguments are identical to those of
> **list\_policies**.

## Virtual hosts

Note that
**rabbitmqctl**
manages the RabbitMQ internal user database.
Permissions for users from any alternative authorisation backend will
not be visible to
**rabbitmqctl**.

**add\_vhost** *vhost* \[**--description** *desc* **--tags** *tags* **--default-queue-type** *default-q-type*]

> *vhost*

> > The name of the virtual host entry to create.

> *desc*

> > Arbitrary virtual host description, e.g. its purpose, for the operator's
> > convenience.

> *tags*

> > A comma-separated list of virtual host tags for the operator's convenience.

> *default-q-type*

> > If clients do not specify queue type explicitly, this type will be used. One of: quorum, stream.

> Creates a virtual host.

> For example, this command instructs the RabbitMQ broker to create a new
> virtual host called
> "project9\_dev\_18":

> > rabbitmqctl add\_vhost project9\_dev\_18 --description 'Dev environment no. 18' --tags dev,project9

**clear\_vhost\_limits** \[**-p** *vhost*]

> Clears virtual host limits.

> For example, this command clears vhost limits in vhost
> "qa\_env":

> > rabbitmqctl clear\_vhost\_limits -p qa\_env

**delete\_vhost** *vhost*

> *vhost*

> > The name of the virtual host entry to delete.

> Deletes a virtual host.

> Deleting a virtual host deletes all its exchanges, queues, bindings,
> user permissions, parameters, and policies.

> For example, this command instructs the RabbitMQ broker to delete the
> virtual host called
> "test":

> > rabbitmqctl delete\_vhost a-vhost

**list\_vhost\_limits** \[**-p** *vhost*] \[**--global**] \[**--no-table-headers**]

> Displays configured virtual host limits.

> **--global**

> > Show limits for all vhosts.
> > Suppresses the
> > **-p**
> > parameter.

**restart\_vhost** \[**-p** *vhost*]

> *vhost*

> > The name of the virtual host entry to restart, defaulting to "/".

> Restarts a failed vhost data stores and queues.

> For example, this command instructs the RabbitMQ broker to restart a
> virtual host called
> "test":

> > rabbitmqctl restart\_vhost test

**set\_vhost\_limits** \[**-p** *vhost*] *definition*

> Sets virtual host limits.

> *definition*

> > The definition of the limits, as a JSON document.
> > In most shells you are very likely to need to quote this.

> > Recognised limits are:

> > *	max-connections
> > *	max-queues

> > Use a negative value to specify "no limit".

> For example, this command limits the maximum number of concurrent
> connections in vhost
> "qa\_env"
> to 64:

> > rabbitmqctl set\_vhost\_limits -p qa\_env '&lcub;"max-connections": 64}'

> This command limits the maximum number of queues in vhost
> "qa\_env"
> to 256:

> > rabbitmqctl set\_vhost\_limits -p qa\_env '&lcub;"max-queues": 256}'

> This command clears the maximum number of connections limit in vhost
> "qa\_env":

> > rabbitmqctl set\_vhost\_limits -p qa\_env '&lcub;"max&#45;connections": &#45;1}'

> This command disables client connections in vhost
> "qa\_env":

> > rabbitmqctl set\_vhost\_limits -p qa\_env '&lcub;"max-connections": 0}'

**set\_user\_limits** *username* *definition*

> Sets user limits.

> *username*

> > The name of the user to apply limits to

> *definition*

> > The definition of the limits, as a JSON document.
> > In most shells you are very likely to need to quote this.

> > Recognised limits are:

> > *	max-connections
> > *	max-channels

> > Use a negative value to specify "no limit".

> For example, this command limits the maximum number of concurrent
> connections a user is allowed to open
> "limited\_user"
> to 64:

> > rabbitmqctl set\_user\_limits limited\_user '&lcub;"max-connections": 64}'

> This command limits the maximum number of channels a user is allowed to open
> on a connection
> "limited\_user"
> to 16:

> > rabbitmqctl set\_user\_limits limited\_user '&lcub;"max-channels": 16}'

> This command clears the maximum number of connections limit for user
> "limited\_user":

> > rabbitmqctl clear\_user\_limits limited\_user 'max-connections'

> This command disables client connections for user
> "limited\_user":

> > rabbitmqctl set\_user\_limits limited\_user '&lcub;"max-connections": 0}'

**clear\_user\_limits** *username* *limit*

> Clears user limits.

> *username*

> > The name of the user to clear the limits of

> *limit*

> > The name of the limit or "all" to clear all limits at once.

> Recognised limits are:

> *	max-connections
> *	max-channels

> For example, this command clears the maximum connection limits of user
> "limited\_user":

> > rabbitmqctl clear\_user\_limits limited\_user 'max-connections'

> This command clears all limits of user
> "limited\_user":

> > rabbitmqctl clear\_user\_limits limited\_user all

**trace\_off** \[**-p** *vhost*]

> *vhost*

> > The name of the virtual host for which to stop tracing.

> Stops tracing.

**trace\_on** \[**-p** *vhost*]

> *vhost*

> > The name of the virtual host for which to start tracing.

> Starts tracing.
> Note that the trace state is not persistent; it will revert to being off
> if the node is restarted.

## Configuration

**decode** *value* *passphrase* \[**--cipher** *cipher*] \[**--hash** *hash*] \[**--iterations** *iterations*]

> *value* *passphrase*

> > Value to decrypt (as produced by the encode command) and passphrase.

> > For example:

> > > rabbitmqctl decode '&lcub;encrypted, &lt;&lt;"..."&gt;&gt;}' mypassphrase

> **--cipher** *cipher* **--hash** *hash* **--iterations** *iterations*

> > Options to specify the decryption settings.
> > They can be used independently.

> > For example:

> > > rabbitmqctl decode --cipher blowfish\_cfb64 --hash sha256 --iterations 10000 '&lcub;encrypted,&lt;&lt;"..."&gt;&gt;} mypassphrase

**encode** *value* *passphrase* \[**--cipher** *cipher*] \[**--hash** *hash*] \[**--iterations** *iterations*]

> *value* *passphrase*

> > Value to encrypt and passphrase.

> > For example:

> > > rabbitmqctl encode '&lt;&lt;"guest"&gt;&gt;' mypassphrase

> **--cipher** *cipher* **--hash** *hash* **--iterations** *iterations*

> > Options to specify the encryption settings.
> > They can be used independently.

> > For example:

> > > rabbitmqctl encode --cipher blowfish\_cfb64 --hash sha256 --iterations 10000 '&lt;&lt;"guest"&gt;&gt;' mypassphrase

**set\_cluster\_name** *name*

> Sets the cluster name to
> *name*.
> The cluster name is announced to clients on connection, and used by the
> federation and shovel plugins to record where a message has been.
> The cluster name is by default derived from the hostname of the first
> node in the cluster but can be changed.

> For example, this sets the cluster name to
> "london":

> > rabbitmqctl set\_cluster\_name london

**set\_disk\_free\_limit** *disk\_limit*

> *disk\_limit*

> > Lower bound limit as an integer in bytes or a string with a memory unit
> > symbol (see vm\_memory\_high\_watermark), e.g. 512M or 1G.
> > Once free disk space reaches the limit, a disk alarm will be set.

**set\_disk\_free\_limit mem\_relative** *fraction*

> *fraction*

> > Limit relative to the total amount available RAM as a non-negative
> > floating point number.
> > Values lower than 1.0 can be dangerous and should be used carefully.

**set\_log\_level** \[*log\_level*]

> Sets log level in the running node

> Supported
> *log\_level*
> values are:

> *	debug
> *	info
> *	warning
> *	error
> *	critical
> *	none

> Example:

> > rabbitmqctl set\_log\_level debug

**set\_vm\_memory\_high\_watermark** *fraction*

> *fraction*

> > The new memory threshold fraction at which flow control is triggered, as
> > a floating point number greater than or equal to 0.

**set\_vm\_memory\_high\_watermark** \[absolute] *memory\_limit*

> *memory\_limit*

> > The new memory limit at which flow control is triggered, expressed in
> > bytes as an integer number greater than or equal to 0 or as a string
> > with memory unit symbol(e.g. 512M or 1G).
> > Available unit symbols are:

> > **k**, **kiB**

> > > kibibytes (2^10 bytes)

> > **M**, **MiB**

> > > mebibytes (2^20 bytes)

> > **G**, **GiB**

> > > gibibytes (2^30 bytes)

> > **kB**

> > > kilobytes (10^3 bytes)

> > **MB**

> > > megabytes (10^6 bytes)

> > **GB**

> > > gigabytes (10^9 bytes)

## Feature flags

**enable\_feature\_flag** *feature\_flag*

> Enables a feature flag on the target node.

> Example:

> > rabbitmqctl enable\_feature\_flag restart\_streams

> You can also enable all feature flags by specifying "all":

> > rabbitmqctl enable\_feature\_flag all

**list\_feature\_flags** \[*column ...*]

> Lists feature flags

> Supported
> *column*
> values are:

> *	name
> *	state
> *	stability
> *	provided\_by
> *	desc
> *	doc\_url

> Example:

> > rabbitmqctl list\_feature\_flags name state

## Connection Operations

**close\_all\_connections** \[**-p** *vhost*] \[**--global**] \[**--per-connection-delay** *delay*] \[**--limit** *limit*] *explanation*

> **-p** *vhost*

> > The name of the virtual host for which connections should be closed.
> > Ignored when
> > **--global**
> > is specified.

> **--global**

> > If connections should be closed for all vhosts.
> > Overrides
> > **-p**

> **--per-connection-delay** *delay*

> > Time in milliseconds to wait after each connection closing.

> **--limit** *limit*

> > The number of connections to close.
> > Only works per vhost.
> > Ignored when
> > **--global**
> > is specified.

> *explanation*

> > Explanation string.

> Instructs the broker to close all connections for the specified vhost or entire RabbitMQ node.

> For example, this command instructs the RabbitMQ broker to close 10 connections on
> "qa\_env"
> vhost, passing the explanation
> "Please close":

> > rabbitmqctl close\_all\_connections -p qa\_env --limit 10 'Please close'

> This command instructs broker to close all connections to the node:

> > rabbitmqctl close\_all\_connections --global

**close\_connection** *connectionpid* *explanation*

> *connectionpid*

> > Id of the Erlang process associated with the connection to close.

> *explanation*

> > Explanation string.

> Instructs the broker to close the connection associated with the Erlang
> process id
> *connectionpid*
> (see also the
> **list\_connections**
> command), passing the
> *explanation*
> string to the connected client as part of the AMQP connection shutdown
> protocol.

> For example, this command instructs the RabbitMQ broker to close the connection associated with the Erlang process id
> "&lt;rabbit@tanto.4262.0&gt;",
> passing the explanation
> "go away"
> to the connected client:

> > rabbitmqctl close\_connection "&lt;rabbit@tanto.4262.0&gt;" "go away"

## Misc

**eval** *expression*

> Evaluates an Erlang expression on the target node

## Queue Operations

**delete\_queue** *queue\_name* \[**--if-empty** | **-e**] \[**--if-unused** | **-u**]

> *queue\_name*

> > The name of the queue to delete.

> *--if-empty*

> > Delete the queue if it is empty (has no messages ready for delivery)

> *--if-unused*

> > Delete the queue only if it has no consumers

> Deletes a queue.

**purge\_queue** \[**-p** *vhost*] *queue*

> *queue*

> > The name of the queue to purge.

> Purges a queue (removes all messages in it).

# PLUGIN COMMANDS

RabbitMQ plugins can extend the rabbitmqctl tool to add new commands
when enabled.
Currently available commands can be found in the
**rabbitmqctl help**
output.
The following commands are added by RabbitMQ plugins, available in
the default distribution:

## Shovel plugin

**shovel\_status**

> Prints a list of configured Shovels

**delete\_shovel** \[**-p** *vhost*] *name*

> Instructs the RabbitMQ node to delete the configured shovel by
> *name*.

## Federation plugin

**federation\_status** \[**--only-down**]

> Prints a list of federation links.

> **--only-down**

> > Only list federation links that are not running.

**restart\_federation\_link** *link\_id*

> Instructs the RabbitMQ node to restart the federation link with the
> specified
> *link\_id*.

## AMQP 1.0 plugin

**list\_amqp10\_connections** \[*amqp10\_connectioninfoitem ...*]

> Similar to the
> **list\_connections**
> command, but returns fields that make sense for AMQP-1.0 connections.
> *amqp10\_connectioninfoitem*
> parameter is used to indicate which connection information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *amqp10\_connectioninfoitem*
> can take any value from the list that follows:

> **pid**

> > Id of the Erlang process associated with the connection.

> **auth\_mechanism**

> > SASL authentication mechanism used, such as
> > "PLAIN".

> **host**

> > Server hostname obtained via reverse DNS, or its IP address if reverse
> > DNS failed or was turned off.

> **frame\_max**

> > Maximum frame size (bytes).

> **timeout**

> > Connection timeout / negotiated heartbeat interval, in seconds.

> **user**

> > Username associated with the connection.

> **state**

> > Connection state; one of:

> > *	starting
> > *	waiting\_amqp0100
> > *	securing
> > *	running
> > *	blocking
> > *	blocked
> > *	closing
> > *	closed

> **recv\_oct**

> > Octets received.

> **recv\_cnt**

> > Packets received.

> **send\_oct**

> > Octets send.

> **send\_cnt**

> > Packets sent.

> **ssl**

> > Boolean indicating whether the connection is secured with SSL.

> **ssl\_protocol**

> > SSL protocol (e.g.
> > "tlsv1").

> **ssl\_key\_exchange**

> > SSL key exchange algorithm (e.g.
> > "rsa").

> **ssl\_cipher**

> > SSL cipher algorithm (e.g.
> > "aes\_256\_cbc").

> **ssl\_hash**

> > SSL hash function (e.g.
> > "sha").

> **peer\_cert\_subject**

> > The subject of the peer's SSL certificate, in RFC4514 form.

> **peer\_cert\_issuer**

> > The issuer of the peer's SSL certificate, in RFC4514 form.

> **peer\_cert\_validity**

> > The period for which the peer's SSL certificate is valid.

> **node**

> > The node name of the RabbitMQ node to which the connection is
> > established.

## MQTT plugin

**list\_mqtt\_connections** \[*mqtt\_connectioninfoitem*]

> Similar to the
> **list\_connections**
> command, but returns fields that make sense for MQTT connections.
> *mqtt\_connectioninfoitem*
> parameter is used to indicate which connection information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *mqtt\_connectioninfoitem*
> can take any value from the list that follows:

> **host**

> > Server hostname obtained via reverse DNS, or its IP address if reverse
> > DNS failed or was turned off.

> **port**

> > Server port.

> **peer\_host**

> > Peer hostname obtained via reverse DNS, or its IP address if reverse DNS
> > failed or was not enabled.

> **peer\_port**

> > Peer port.

> **protocol**

> > MQTT protocol version, which can be one of the following:

> > *	&lcub;'MQTT', N/A}
> > *	&lcub;'MQTT', 3.1.0}
> > *	&lcub;'MQTT', 3.1.1}

> **channels**

> > The number of channels using the connection.

> **channel\_max**

> > Maximum number of channels on this connection.

> **frame\_max**

> > Maximum frame size (bytes).

> **client\_properties**

> > Informational properties transmitted by the client during connection
> > establishment.

> **ssl**

> > Boolean indicating whether the connection is secured with SSL.

> **ssl\_protocol**

> > SSL protocol (e.g.
> > "tlsv1").

> **ssl\_key\_exchange**

> > SSL key exchange algorithm (e.g.
> > "rsa").

> **ssl\_cipher**

> > SSL cipher algorithm (e.g.
> > "aes\_256\_cbc").

> **ssl\_hash**

> > SSL hash function (e.g.
> > "sha").

> **conn\_name**

> > Readable name for the connection.

> **connection\_state**

> > Connection state; one of:

> > *	starting
> > *	running
> > *	blocked

> **connection**

> > Id of the Erlang process associated with the internal amqp direct connection.

> **consumer\_tags**

> > A tuple of consumer tags for QOS0 and QOS1.

> **message\_id**

> > The last Packet ID sent in a control message.

> **client\_id**

> > MQTT client identifier for the connection.

> **clean\_sess**

> > MQTT clean session flag.

> **will\_msg**

> > MQTT Will message sent in CONNECT frame.

> **exchange**

> > Exchange to route MQTT messages configured in rabbitmq\_mqtt application environment.

> **ssl\_login\_name**

> > SSL peer cert auth name

> **retainer\_pid**

> > Id of the Erlang process associated with retain storage for the connection.

> **user**

> > Username associated with the connection.

> **vhost**

> > Virtual host name with non-ASCII characters escaped as in C.

**decommission\_mqtt\_node**

> Before the plugin is disabled on a node, or a node removed from the cluster,
> it must be decommissioned.

> For example, this command will remove the node rabbit@stringer:

> > rabbitmqctl decommission\_mqtt\_node rabbit@stringer

## STOMP plugin

**list\_stomp\_connections** \[*stomp\_connectioninfoitem*]

> Similar to the
> **list\_connections**
> command, but returns fields that make sense for STOMP connections.
> *stomp\_connectioninfoitem*
> parameter is used to indicate which connection information items to
> include in the results.
> The column order in the results will match the order of the parameters.
> *stomp\_connectioninfoitem*
> can take any value from the list that follows:

> **conn\_name**

> > Readable name for the connection.

> **connection**

> > Id of the Erlang process associated with the internal amqp direct connection.

> **connection\_state**

> > Connection state; one of:

> > *	running
> > *	blocking
> > *	blocked

> **session\_id**

> > STOMP protocol session identifier

> **channel**

> > AMQP channel associated with the connection

> **version**

> > Negotiated STOMP protocol version for the connection.

> **implicit\_connect**

> > Indicates if the connection was established using implicit connect (without CONNECT frame)

> **auth\_login**

> > Effective username for the connection.

> **auth\_mechanism**

> > STOMP authorization mechanism.
> > Can be one of:

> > *	config
> > *	ssl
> > *	stomp\_headers

> **port**

> > Server port.

> **host**

> > Server hostname obtained via reverse DNS, or its IP address if reverse
> > DNS failed or was not enabled.

> **peer\_port**

> > Peer port.

> **peer\_host**

> > Peer hostname obtained via reverse DNS, or its IP address if reverse DNS
> > failed or was not enabled.

> **protocol**

> > STOMP protocol version, which can be one of the following:

> > *	&lcub;'STOMP', 0}
> > *	&lcub;'STOMP', 1}
> > *	&lcub;'STOMP', 2}

> **channels**

> > The number of channels using the connection.

> **channel\_max**

> > Maximum number of channels on this connection.

> **frame\_max**

> > Maximum frame size (bytes).

> **client\_properties**

> > Informational properties transmitted by the client during connection

> **ssl**

> > Boolean indicating whether the connection is secured with SSL.

> **ssl\_protocol**

> > TLS protocol (e.g.
> > "tlsv1").

> **ssl\_key\_exchange**

> > TLS key exchange algorithm (e.g.
> > "rsa").

> **ssl\_cipher**

> > TLS cipher algorithm (e.g.
> > "aes\_256\_cbc").

> **ssl\_hash**

> > SSL hash function (e.g.
> > "sha").

## Management agent plugin

**reset\_stats\_db** \[**--all**]

> Reset the management stats database for the RabbitMQ node.

> **--all**

> > Reset the stats database for all nodes in the cluster.

# SEE ALSO

rabbitmq-diagnostics(8),
rabbitmq-plugins(8),
rabbitmq-server(8),
rabbitmq-queues(8),
rabbitmq-streams(8),
rabbitmq-upgrade(8),
rabbitmq-service(8),
rabbitmq-env.conf(5),
rabbitmq-echopid(8)

# AUTHOR

The RabbitMQ Team &lt;[rabbitmq-core@groups.vmware.com](mailto:rabbitmq-core@groups.vmware.com)&gt;

RabbitMQ Server - June 22, 2023
