<div class="manual-text">
  <section class="Sh">
## NAME {#NAME}
    <p class="Pp"><code class="Nm">rabbitmqctl</code> — <span class="Nd">tool for managing RabbitMQ nodes</span></p>
  </section>
  <section class="Sh">
## SYNOPSIS {#SYNOPSIS}
    <table class="Nm">
      <tr>
        <td><code class="Nm">rabbitmqctl</code></td>
        <td>[<code class="Fl">-q</code>] [<code class="Fl">-s</code>] [<code class="Fl">-l</code>] [<code class="Fl">-n</code> <var class="Ar">node</var>] [<code class="Fl">-t</code> <var class="Ar">timeout</var>] <var class="Ar">command</var> [<var class="Ar">command_options</var>]</td>
      </tr>
    </table>
  </section>
  <section class="Sh">
## DESCRIPTION {#DESCRIPTION}
    <p class="Pp">RabbitMQ is an open-source multi-protocol messaging broker.</p>
    <p class="Pp"><code class="Nm">rabbitmqctl</code> is the main command line tool for managing a RabbitMQ server node, together with <code class="Cm">rabbitmq-diagnostics</code> , <code class="Cm">rabbitmq-upgrade</code> , and others.</p>
    <p class="Pp">It performs all actions by connecting to the target RabbitMQ node on a dedicated CLI tool communication port and authenticating using a shared secret (known as the cookie file).</p>
    <p class="Pp">Diagnostic information is displayed if the connection failed, the target node was not running, or <code class="Nm">rabbitmqctl</code> could not authenticate to the target node successfully.</p>
    <p class="Pp">To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/cli">RabbitMQ CLI Tools guide</a></p>
  </section>
  <section class="Sh">
## OPTIONS {#OPTIONS}
    <dl class="Bl-tag">
      <dt >
### <code class="Fl">-n</code> <var class="Ar">node</var> {#n}
      </dt>
      <dd>The default node is "<var class="Ar">rabbit@target-hostname</var>", where <var class="Ar">target-hostname</var> is the local host. On a host named "myserver.example.com", the node name will usually be "rabbit@myserver" (unless <code class="Ev">RABBITMQ_NODENAME</code> has been overridden, in which case you'll need to use</dd>
      <dt >
### <code class="Fl">--longnames</code> {#longnames}
      </dt>
      <dd>
        ). The output of "hostname -s" is usually the correct hostname to use after the "@" sign. See <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a> for details of configuring a RabbitMQ node.
      </dd>
      <dt >
### <code class="Fl">-q</code>, <code class="Fl">--quiet</code> {#q}
      </dt>
      <dd>Quiet output mode is selected. Informational messages are reduced when quiet mode is in effect.</dd>
      <dt >
### <code class="Fl">-s</code>, <code class="Fl">--silent</code> {#s}
      </dt>
      <dd>Silent output mode is selected. Informational messages are reduced and table headers are suppressed when silent mode is in effect.</dd>
      <dt >
### <code class="Fl">--no-table-headers</code> {#no-table-headers}
      </dt>
      <dd>Do not output headers for tabular data.</dd>
      <dt >
### <code class="Fl">--dry-run</code> {#dry-run}
      </dt>
      <dd>Do not run the command. Only print informational messages.</dd>
      <dt >
### <code class="Fl">-t</code> <var class="Ar">timeout</var>, <code class="Fl">--timeout</code> <var class="Ar">timeout</var> {#t}
      </dt>
      <dd>Operation timeout in seconds. Not all commands support timeouts. The default is <code class="Cm">infinity</code>.</dd>
      <dt >
### <code class="Fl">-l</code>, <code class="Fl">--longnames</code> {#l}
      </dt>
      <dd>
        Must be specified when the cluster is configured to use long (FQDN) node names. To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/clustering">RabbitMQ Clustering guide</a>
      </dd>
      <dt >
### <code class="Fl">--erlang-cookie</code> <var class="Ar">cookie</var> {#erlang-cookie}
      </dt>
      <dd>
        Shared secret to use to authenticate to the target node. Prefer using a local file or the <code class="Ev">RABBITMQ_ERLANG_COOKIE</code> environment variable instead of specifying this option on the command line. To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/cli">RabbitMQ CLI Tools guide</a>
      </dd>
    </dl>
  </section>
  <section class="Sh">
## COMMANDS {#COMMANDS}
    <dl class="Bl-tag">
      <dt >
### <code class="Cm">help</code> [<code class="Fl">-l</code>] [<var class="Ar">command_name</var>] {#help}
      </dt>
      <dd>
        <p class="Pp">Prints usage for all available commands.</p>
        <dl class="Bl-tag">
          <dt >
### <code class="Fl">-l</code>, <code class="Fl">--list-commands</code> {#l~2}
          </dt>
          <dd>List command usages only, without parameter explanation.</dd>
          <dt><var class="Ar">command_name</var></dt>
          <dd>Prints usage for the specified command.</dd>
        </dl>
      </dd>
      <dt >
### <code class="Cm">version</code> {#version}
      </dt>
      <dd>
        <p class="Pp">Displays CLI tools version</p>
      </dd>
    </dl>
    <section class="Ss">
### Nodes {#Nodes}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">await_startup</code> {#await_startup}
        </dt>
        <dd>
          <p class="Pp">Waits for the RabbitMQ application to start on the target node</p>
          <p class="Pp">For example, to wait for the RabbitMQ application to start:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl await_startup</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">reset</code> {#reset}
        </dt>
        <dd>
          <p class="Pp">Returns a RabbitMQ node to its virgin state.</p>
          <p class="Pp">Removes the node from any cluster it belongs to, removes all data from the management database, such as configured users and vhosts, and deletes all persistent messages.</p>
          <p class="Pp">For <code class="Cm">reset</code> and <code class="Cm">force_reset</code> to succeed the RabbitMQ application must have been stopped, e.g. with <code class="Cm">stop_app</code>.</p>
          <p class="Pp">For example, to reset the RabbitMQ node:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl reset</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">rotate_logs</code> {#rotate_logs}
        </dt>
        <dd>
          <p class="Pp">Instructs the RabbitMQ node to perform internal log rotation.</p>
          <p class="Pp">Log rotation is performed according to the logging settings specified in the configuration file. The rotation operation is asynchronous, there is no guarantee that it will complete before this command returns.</p>
          <p class="Pp">Note that there is no need to call this command in case of external log rotation (e.g. from logrotate(8)).</p>
          <p class="Pp">For example, to initial log rotation:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl rotate_logs</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">shutdown</code> {#shutdown}
        </dt>
        <dd>
          <p class="Pp">Shuts down the node, both RabbitMQ and its runtime. The command is blocking and will return after the runtime process exits. If RabbitMQ fails to stop, it will return a non-zero exit code. This command infers the OS PID of the target node and therefore can only be used to shut down nodes running on the same host (or broadly speaking, in the same operating system, e.g. in the same VM or container)</p>
          <p class="Pp">Unlike the stop command, the shutdown command:</p>
          <ul class="Bl-bullet">
            <li>
does not require a <var class="Ar">pid_file</var> to wait for the runtime process to exit
</li>
            <li>
returns a non-zero exit code if the RabbitMQ node is not running
</li>
          </ul>

          <p class="Pp">For example, this will shut down a local RabbitMQ node running with the default node name:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl shutdown</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">start_app</code> {#start_app}
        </dt>
        <dd>
          <p class="Pp">Starts the RabbitMQ application.</p>
          <p class="Pp">This command is typically run after performing other management actions that require the RabbitMQ application to be stopped, e.g. <code class="Cm">reset</code>.</p>
          <p class="Pp">For example, to instruct the RabbitMQ node to start the RabbitMQ application:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl start_app</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">stop</code> [<var class="Ar">pid_file</var>] {#stop}
        </dt>
        <dd>
          <p class="Pp">Stops the Erlang node on which RabbitMQ is running. To restart the node follow the instructions for "Running the Server" in the <a class="Lk" href="https://www.rabbitmq.com/docs/download">installation guide</a>.</p>
          <p class="Pp">If a <var class="Ar">pid_file</var> is specified, also waits for the process specified there to terminate. See the description of the <code class="Cm">wait</code> command for details on this file.</p>
          <p class="Pp">For example, to instruct the RabbitMQ node to terminate:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl stop</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">stop_app</code> {#stop_app}
        </dt>
        <dd>
          <p class="Pp">Stops the RabbitMQ application, leaving the runtime (Erlang VM) running.</p>
          <p class="Pp">This command is typically run before performing other management actions that require the RabbitMQ application to be stopped, e.g. <code class="Cm">reset</code>.</p>
          <p class="Pp">For example, to instruct the RabbitMQ node to stop the RabbitMQ application:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl stop_app</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">wait</code> <var class="Ar">pid_file</var>, <code class="Cm">wait</code> <code class="Fl">--pid</code> <var class="Ar">pid</var> {#wait}
        </dt>
        <dd>
          <p class="Pp">Waits for the RabbitMQ application to start.</p>
          <p class="Pp">This command will wait for the RabbitMQ application to start at the node. It will wait for the pid file to be created if <var class="Ar">pidfile</var> is specified, then for a process with a pid specified in the pid file or the <code class="Fl">--pid</code> argument, and then for the RabbitMQ application to start in that process. It will fail if the process terminates without starting the RabbitMQ application.</p>
          <p class="Pp">If the specified pidfile is not created or the erlang node is not started within <code class="Fl">--timeout</code> the command will fail. The default timeout is 10 seconds.</p>
          <p class="Pp">A suitable pid file is created by the <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a> script. By default, this is located in the Mnesia directory. Modify the <code class="Ev">RABBITMQ_PID_FILE</code> environment variable to change the location.</p>
          <p class="Pp">For example, this command will return when the RabbitMQ node has started up:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl wait /var/run/rabbitmq/pid</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Cluster management {#Cluster_management}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">await_online_nodes</code> <var class="Ar">count</var> {#await_online_nodes}
        </dt>
        <dd>
          <p class="Pp">Waits for <var class="Ar">count</var> nodes to join the cluster</p>
          <p class="Pp">For example, to wait for two RabbitMQ nodes to start:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl await_online_nodes 2</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">change_cluster_node_type</code> <var class="Ar">type</var> {#change_cluster_node_type}
        </dt>
        <dd>
          <p class="Pp">Changes the type of the cluster node.</p>
          <p class="Pp">The <var class="Ar">type</var> must be one of the following:</p>
          <ul class="Bl-bullet Bl-compact">
            <li id="disc">
#### <code class="Cm">disc</code> {#change_cluster_node_type}
            
</li>
            <li id="ram">
#### <code class="Cm">ram</code> {#change_cluster_node_type}
            
</li>
          </ul>

          <p class="Pp">The node must be stopped for this operation to succeed, and when turning a node into a RAM node the node must not be the only disc node in the cluster.</p>
          <p class="Pp">For example, this command will turn a RAM node into a disc node:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl change_cluster_node_type disc</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">cluster_status</code> {#cluster_status}
        </dt>
        <dd>
          <p class="Pp">Displays all the nodes in the cluster grouped by node type, together with the currently running nodes.</p>
          <p class="Pp">For example, this command displays the nodes in the cluster:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl cluster_status</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">force_boot</code> {#force_boot}
        </dt>
        <dd>
          <p class="Pp">Ensures that the node will start next time, even if it was not the last to shut down.</p>
          <p class="Pp">Normally when you shut down a RabbitMQ cluster altogether, the first node you restart should be the last one to go down, since it may have seen things happen that other nodes did not. But sometimes that's not possible: for instance, if the entire cluster loses power then all nodes may think they were not the last to shut down.</p>
          <p class="Pp">In such a case you can invoke <code class="Cm">force_boot</code> while the node is down. This will tell the node to unconditionally start the next time you ask it. Any changes to the cluster after this node shut down will be lost.</p>
          <p class="Pp">If the last node to go down is permanently lost then you should use <code class="Cm">forget_cluster_node</code> <code class="Fl">--offline</code> instead of this command, as it will ensure that mirrored queues whose leader replica was on the lost node get promoted.</p>
          <p class="Pp">For example, this will force the node not to wait for other nodes the next time it is started:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl force_boot</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">force_reset</code> {#force_reset}
        </dt>
        <dd>
          <p class="Pp">Forcefully returns a RabbitMQ node to its virgin state.</p>
          <p class="Pp">The <code class="Cm">force_reset</code> command differs from <code class="Cm">reset</code> in that it resets the node unconditionally, regardless of the current management database state and cluster configuration. It should only be used as a last resort if the database or cluster configuration has been corrupted.</p>
          <p class="Pp">For <code class="Cm">reset</code> and <code class="Cm">force_reset</code> to succeed the RabbitMQ application must have been stopped, e.g. with <code class="Cm">stop_app</code>.</p>
          <p class="Pp">For example, to reset the RabbitMQ node:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl force_reset</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">forget_cluster_node</code> [<code class="Fl">--offline</code>] {#forget_cluster_node}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt >
#### <code class="Fl">--offline</code> {#offline}
            </dt>
            <dd>Enables node removal from an offline node. This is only useful in the situation where all the nodes are offline and the last node to go down cannot be brought online, thus preventing the whole cluster from starting. It should not be used in any other circumstances since it can lead to inconsistencies.</dd>
          </dl>
          <p class="Pp">Removes a cluster node remotely. The node that is being removed must be offline, while the node we are removing from must be online, except when using the <code class="Fl">--offline</code> flag.</p>
          <p class="Pp">When using the <code class="Fl">--offline</code> flag , <code class="Nm">rabbitmqctl</code> will not attempt to connect to a node as normal; instead it will temporarily become the node in order to make the change. This is useful if the node cannot be started normally. In this case, the node will become the canonical source for cluster metadata (e.g. which queues exist), even if it was not before. Therefore you should use this command on the latest node to shut down if at all possible.</p>
          <p class="Pp">For example, this command will remove the node "rabbit@stringer" from the node "hare@mcnulty":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl -n hare@mcnulty forget_cluster_node rabbit@stringer</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">join_cluster</code> <var class="Ar">seed-node</var> [<code class="Fl">--ram</code>] {#join_cluster}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">seed-node</var></dt>
            <dd>Existing cluster member (seed node) to cluster with.</dd>
            <dt >
#### <code class="Fl">--ram</code> {#ram~2}
            </dt>
            <dd>If provided, the node will join the cluster as a RAM node. RAM node use is discouraged. Use only if you understand why exactly you need to use them.</dd>
          </dl>
          <p class="Pp">Instructs the node to become a member of the cluster that the specified node is in. Before clustering, the node is reset, so be careful when using this command. For this command to succeed the RabbitMQ application must have been stopped, e.g. with <code class="Cm">stop_app</code>.</p>
          <p class="Pp">Cluster nodes can be of two types: disc or RAM. Disc nodes replicate data in RAM and on disk, thus providing redundancy in the event of node failure and recovery from global events such as power failure across all nodes. RAM nodes replicate data in RAM only (except for queue contents, which can reside on disk if the queue is persistent or too big to fit in memory) and are mainly used for scalability. RAM nodes are more performant only when managing resources (e.g. adding/removing queues, exchanges, or bindings). A cluster must always have at least one disc node and usually should have more than one.</p>
          <p class="Pp">The node will be a disc node by default. If you wish to create a RAM node, provide the <code class="Fl">--ram</code> flag.</p>
          <p class="Pp">After executing the <code class="Cm">join_cluster</code> command, whenever the RabbitMQ application is started on the current node it will attempt to connect to the nodes that were in the cluster when the node went down.</p>
          <p class="Pp">To leave a cluster, <code class="Cm">reset</code> the node. You can also remove nodes remotely with the <code class="Cm">forget_cluster_node</code> command.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ node to join the cluster that "hare@elena" is part of, as a ram node:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl join_cluster hare@elena --ram</code>
          </div>
          <p class="Pp">To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/clustering">RabbitMQ Clustering guide</a>.</p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Replication {#Replication}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">sync_queue</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">queue</var> {#sync_queue}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">queue</var></dt>
            <dd>The name of the queue to synchronise.</dd>
          </dl>
          <p class="Pp">Instructs a mirrored queue with unsynchronised mirrors (follower replicas) to synchronise them. The queue will block while synchronisation takes place (all publishers and consumers using the queue will block or temporarily see no activity). This command can only be used with mirrored queues. To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/3.13/ha">RabbitMQ Classic Queue Mirroring guide</a></p>
          <p class="Pp">Note that queues with unsynchronised replicas and active consumers will become synchronised eventually (assuming that consumers make progress). This command is primarily useful for queues that do not have active consumers.</p>
        </dd>
        <dt >
#### <code class="Cm">cancel_sync_queue</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">queue</var> {#cancel_sync_queue}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">queue</var></dt>
            <dd>The name of the queue to cancel synchronisation for.</dd>
          </dl>
          <p class="Pp">Instructs a synchronising mirrored queue to stop synchronising itself.</p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### User Management {#User_Management}
      <p class="Pp">Note that all user management commands <code class="Nm">rabbitmqctl</code> only can manage users in the internal RabbitMQ database. Users from any alternative authentication backends such as LDAP cannot be inspected or managed with those commands. <code class="Nm">rabbitmqctl</code>.</p>
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">add_user</code> <var class="Ar">username</var> <var class="Ar">password</var> {#add_user}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user to create.</dd>
            <dt><var class="Ar">password</var></dt>
            <dd>The password the created user will use to log in to the broker.</dd>
          </dl>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to create a (non-administrative) user named "janeway" with (initial) password "changeit":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl add_user janeway changeit</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">authenticate_user</code> <var class="Ar">username</var> <var class="Ar">password</var> {#authenticate_user}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user.</dd>
            <dt><var class="Ar">password</var></dt>
            <dd>The password of the user.</dd>
          </dl>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to authenticate the user named "janeway" with the password "verifyit":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl authenticate_user janeway verifyit</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">change_password</code> <var class="Ar">username</var> <var class="Ar">newpassword</var> {#change_password}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user whose password is to be changed.</dd>
            <dt><var class="Ar">newpassword</var></dt>
            <dd>The new password for the user.</dd>
          </dl>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to change the password for the user named "janeway" to "newpass":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl change_password janeway newpass</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">clear_password</code> <var class="Ar">username</var> {#clear_password}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user whose password is to be cleared.</dd>
          </dl>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to clear the password for the user named "janeway":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_password janeway</code>
          </div>
          <p class="Pp">This user now cannot log in with a password (but may be able to through e.g. SASL EXTERNAL if configured).</p>
        </dd>
        <dt >
#### <code class="Cm">hash_password</code> <var class="Ar">plaintext</var> {#hash_password}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">plaintext</var></dt>
            <dd>The plaintext password to hash</dd>
          </dl>
          <p class="Pp">Hashes a plaintext password according to the currently configured password hashing algorithm</p>
        </dd>
        <dt >
#### <code class="Cm">delete_user</code> <var class="Ar">username</var> {#delete_user}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user to delete.</dd>
          </dl>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to delete the user named "janeway":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl delete_user janeway</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_users</code> {#list_users}
        </dt>
        <dd>
          <p class="Pp">Lists users. Each result row will contain the user name followed by a list of the tags set for that user.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to list all users:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_users</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_user_tags</code> <var class="Ar">username</var> [<var class="Ar">tag ...</var>] {#set_user_tags}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user whose tags are to be set.</dd>
            <dt><var class="Ar">tag</var></dt>
            <dd>Zero, one or more tags to set. Any existing tags will be removed.</dd>
          </dl>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to ensure the user named "janeway" is an administrator:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_user_tags janeway administrator</code>
          </div>
          <p class="Pp">This has no effect when the user authenticates using a messaging protocol, but can be used to permit the user to manage users, virtual hosts and permissions when the user logs in via some other means (for example with the management plugin).</p>
          <p class="Pp">This command instructs the RabbitMQ broker to remove any tags from the user named "janeway":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_user_tags janeway</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Access control {#Access_control}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">clear_permissions</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">username</var> {#clear_permissions}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host to which to deny the user access, defaulting to "/".</dd>
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user to deny access to the specified virtual host.</dd>
          </dl>
          <p class="Pp">Sets user permissions.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to deny the user named "janeway" access to the virtual host called "my-vhost":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_permissions -p my-vhost janeway</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">clear_topic_permissions</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">username</var> [<var class="Ar">exchange</var>] {#clear_topic_permissions}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host to which to clear the topic permissions, defaulting to "/".</dd>
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user to clear topic permissions to the specified virtual host.</dd>
            <dt><var class="Ar">exchange</var></dt>
            <dd>The name of the topic exchange to clear topic permissions, defaulting to all the topic exchanges the given user has topic permissions for.</dd>
          </dl>
          <p class="Pp">Clear user topic permissions.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to remove topic permissions for the user named "janeway" for the topic exchange "amq.topic" in the virtual host called "my-vhost":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_topic_permissions -p my-vhost janeway amq.topic</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_permissions</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_permissions}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host for which to list the users that have been granted access to it, and their permissions. Defaults to "/".</dd>
          </dl>
          <p class="Pp">Lists permissions in a virtual host.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to list all the users who have been granted access to the virtual host called "my-vhost", and the permissions they have for operations on resources in that virtual host. Note that an empty string means no permissions are granted:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_permissions -p my-vhost</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_topic_permissions</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_topic_permissions}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host for which to list the user's topic permissions. Defaults to "/".</dd>
          </dl>
          <p class="Pp">Lists topic permissions in a virtual host.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to list all the users who have been granted topic permissions in the virtual host called "my-vhost:"</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_topic_permissions -p my-vhost</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_user_permissions</code> <var class="Ar">username</var> {#list_user_permissions}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user for which to list the permissions.</dd>
          </dl>
          <p class="Pp">Lists user permissions.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to list all the virtual hosts to which the user named "janeway" has been granted access, and the permissions the user has for operations on resources in these virtual hosts:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_user_permissions janeway</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_user_topic_permissions</code> <var class="Ar">username</var> {#list_user_topic_permissions}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user for which to list the topic permissions.</dd>
          </dl>
          <p class="Pp">Lists user topic permissions.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to list all the virtual hosts to which the user named "janeway" has been granted access, and the topic permissions the user has in these virtual hosts:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_user_topic_permissions janeway</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_vhosts</code> [<var class="Ar">vhostinfoitem ...</var>] {#list_vhosts}
        </dt>
        <dd>
          <p class="Pp">Lists virtual hosts.</p>
          <p class="Pp">The <var class="Ar">vhostinfoitem</var> parameter is used to indicate which virtual host information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">vhostinfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">name</code> {#name}
            </dt>
            <dd>The name of the virtual host with non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">tracing</code> {#tracing}
            </dt>
            <dd>Whether tracing is enabled for this virtual host.</dd>
            <dt >
#### <code class="Cm">default_queue_type</code> {#default_queue_type}
            </dt>
            <dd>Default queue type for this vhost.</dd>
            <dt >
#### <code class="Cm">description</code> {#description}
            </dt>
            <dd>Virtual host description.</dd>
            <dt >
#### <code class="Cm">tags</code> {#tags}
            </dt>
            <dd>Virtual host tags.</dd>
            <dt >
#### <code class="Cm">cluster_state</code> {#cluster_state}
            </dt>
            <dd>Virtual host state: nodedown, running, stopped.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">vhostinfoitem s</var> are specified then the vhost name is displayed.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to list all virtual hosts:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_vhosts name tracing</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_permissions</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">user</var> <var class="Ar">conf</var> <var class="Ar">write</var> <var class="Ar">read</var> {#set_permissions}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host to which to grant the user access, defaulting to "/".</dd>
            <dt><var class="Ar">user</var></dt>
            <dd>The name of the user to grant access to the specified virtual host.</dd>
            <dt><var class="Ar">conf</var></dt>
            <dd>A regular expression matching resource names for which the user is granted configure permissions.</dd>
            <dt><var class="Ar">write</var></dt>
            <dd>A regular expression matching resource names for which the user is granted write permissions.</dd>
            <dt><var class="Ar">read</var></dt>
            <dd>A regular expression matching resource names for which the user is granted read permissions.</dd>
          </dl>
          <p class="Pp">Sets user permissions.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to grant the user named "janeway" access to the virtual host called "my-vhost", with configured permissions on all resources whose names start with "janeway-", and write and read permissions on all resources:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_permissions -p my-vhost janeway "^janeway-.*" ".*" ".*"</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_permissions_globally</code> <var class="Ar">username</var> <var class="Ar">conf</var> <var class="Ar">write</var> <var class="Ar">read</var> {#set_permissions_globally}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user to grant access to the specified virtual host.</dd>
            <dt><var class="Ar">conf</var></dt>
            <dd>A regular expression matching resource names for which the user is granted configure permissions.</dd>
            <dt><var class="Ar">write</var></dt>
            <dd>A regular expression matching resource names for which the user is granted write permissions.</dd>
            <dt><var class="Ar">read</var></dt>
            <dd>A regular expression matching resource names for which the user is granted read permissions.</dd>
          </dl>
          <p class="Pp">Sets user permissions in all vhosts.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to grant the user named "janeway" access to all virtual hosts with configure permissions on all resources whose names starts with "janeway-", and write and read permissions on all resources:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_permissions_globally janeway "^janeway-.*" ".*" ".*"</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_topic_permissions</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">user</var> <var class="Ar">exchange</var> <var class="Ar">write</var> <var class="Ar">read</var> {#set_topic_permissions}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host to which to grant the user access, defaulting to "/".</dd>
            <dt><var class="Ar">user</var></dt>
            <dd>The name of the user the permissions apply to in the target virtual host.</dd>
            <dt><var class="Ar">exchange</var></dt>
            <dd>The name of the topic exchange to which the authorisation check will be applied.</dd>
            <dt><var class="Ar">write</var></dt>
            <dd>A regular expression matching the routing key of the published message.</dd>
            <dt><var class="Ar">read</var></dt>
            <dd>A regular expression matching the routing key of the consumed message.</dd>
          </dl>
          <p class="Pp">Sets user topic permissions.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to let the user named "janeway" publish and consume messages going through the "amp.topic" exchange of the "my-vhost" virtual host with a routing key starting with "janeway-":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_topic_permissions -p my-vhost janeway amq.topic "^janeway-.*" "^janeway-.*"</code>
          </div>
          <p class="Pp">Topic permissions support variable expansion for the following variables: username, vhost, and client_id. Note that client_id is expanded only when using MQTT. The previous example could be made more generic by using "^&lcub;username}-.*":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_topic_permissions -p my-vhost janeway amq.topic "^&lcub;username}-.*" "^&lcub;username}-.*"</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Monitoring, observability and health checks {#Monitoring,_observability_and_health_checks}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">environment</code> {#environment}
        </dt>
        <dd>
          <p class="Pp">Displays the name and value of each variable in the application environment for each running application.</p>
        </dd>
        <dt >
#### <code class="Cm">list_bindings</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<var class="Ar">bindinginfoitem ...</var>] {#list_bindings}
        </dt>
        <dd>
          <p class="Pp">Returns binding details. By default, the bindings for the "/" virtual host are returned. The <code class="Fl">-p</code> flag can be used to override this default.</p>
          <p class="Pp">The <var class="Ar">bindinginfoitem</var> parameter is used to indicate which binding information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">bindinginfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">source_name</code> {#source_name}
            </dt>
            <dd>The name of the source of messages to which the binding is attached. With non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">source_kind</code> {#source_kind}
            </dt>
            <dd>The kind of the source of messages to which the binding is attached. Currently always exchange. With non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">destination_name</code> {#destination_name}
            </dt>
            <dd>The name of the destination of messages to which the binding is attached. With non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">destination_kind</code> {#destination_kind}
            </dt>
            <dd>The kind of destination of messages to which the binding is attached. With non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">routing_key</code> {#routing_key}
            </dt>
            <dd>The binding's routing key with non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">arguments</code> {#arguments}
            </dt>
            <dd>The binding's arguments.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">bindinginfoitem s</var> are specified then all the above items are displayed.</p>
          <p class="Pp">For example, this command displays the exchange name and queue name of the bindings in the virtual host named "my-vhost"</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_bindings -p my-vhost exchange_name queue_name</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_channels</code> [<var class="Ar">channelinfoitem ...</var>] {#list_channels}
        </dt>
        <dd>
          <p class="Pp">Returns information on all current channels, the logical containers executing most AMQP commands. This includes channels that are part of ordinary AMQP connections and channels created by various plug-ins and other extensions.</p>
          <p class="Pp">The <var class="Ar">channelinfoitem</var> parameter is used to indicate which channel information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">channelinfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">pid</code> {#pid}
            </dt>
            <dd>Id of the Erlang process associated with the connection.</dd>
            <dt >
#### <code class="Cm">connection</code> {#connection}
            </dt>
            <dd>Id of the Erlang process associated with the connection to which the channel belongs.</dd>
            <dt >
#### <code class="Cm">name</code> {#name~2}
            </dt>
            <dd>Readable name for the channel.</dd>
            <dt >
#### <code class="Cm">number</code> {#number}
            </dt>
            <dd>The number of the channel uniquely identifying it within a connection.</dd>
            <dt >
#### <code class="Cm">user</code> {#user}
            </dt>
            <dd>The username associated with the channel.</dd>
            <dt >
#### <code class="Cm">vhost</code> {#vhost}
            </dt>
            <dd>Virtual host in which the channel operates.</dd>
            <dt >
#### <code class="Cm">transactional</code> {#transactional}
            </dt>
            <dd>True if the channel is in transactional mode, false otherwise.</dd>
            <dt >
#### <code class="Cm">confirm</code> {#confirm}
            </dt>
            <dd>True if the channel is in confirm mode, false otherwise.</dd>
            <dt >
#### <code class="Cm">consumer_count</code> {#consumer_count}
            </dt>
            <dd>The number of logical AMQP consumers retrieving messages via the channel.</dd>
            <dt >
#### <code class="Cm">messages_unacknowledged</code> {#messages_unacknowledged}
            </dt>
            <dd>The number of messages delivered via this channel but not yet acknowledged.</dd>
            <dt >
#### <code class="Cm">messages_uncommitted</code> {#messages_uncommitted}
            </dt>
            <dd>The number of messages received in an as-yet uncommitted transaction.</dd>
            <dt >
#### <code class="Cm">acks_uncommitted</code> {#acks_uncommitted}
            </dt>
            <dd>The number of acknowledgements received in an as-yet uncommitted transaction.</dd>
            <dt >
#### <code class="Cm">messages_unconfirmed</code> {#messages_unconfirmed}
            </dt>
            <dd>The number of not yet confirmed published messages. On channels not in confirm mode, this remains 0.</dd>
            <dt >
#### <code class="Cm">prefetch_count</code> {#prefetch_count}
            </dt>
            <dd>QoS prefetch limit for new consumers, 0 if unlimited.</dd>
            <dt >
#### <code class="Cm">global_prefetch_count</code> {#global_prefetch_count}
            </dt>
            <dd>QoS prefetch limit for the entire channel, 0 if unlimited.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">channelinfoitem s</var> are specified then pid, user, consumer_count, and messages_unacknowledged are assumed.</p>
          <p class="Pp">For example, this command displays the connection process and count of unacknowledged messages for each channel:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_channels connection messages_unacknowledged</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_ciphers</code> {#list_ciphers}
        </dt>
        <dd>
          <p class="Pp">Lists cipher suites supported by encoding commands.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to list all cipher suites supported by encoding commands:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_ciphers</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_connections</code> [<var class="Ar">connectioninfoitem ...</var>] {#list_connections}
        </dt>
        <dd>
          <p class="Pp">Returns TCP/IP connection statistics.</p>
          <p class="Pp">The <var class="Ar">connectioninfoitem</var> parameter is used to indicate which connection information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">connectioninfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">pid</code> {#pid~2}
            </dt>
            <dd>Id of the Erlang process associated with the connection.</dd>
            <dt >
#### <code class="Cm">name</code> {#name~3}
            </dt>
            <dd>Readable name for the connection.</dd>
            <dt >
#### <code class="Cm">port</code> {#port}
            </dt>
            <dd>Server port.</dd>
            <dt >
#### <code class="Cm">host</code> {#host}
            </dt>
            <dd>Server hostname obtained via reverse DNS, or its IP address if reverse DNS failed or was turned off.</dd>
            <dt >
#### <code class="Cm">peer_port</code> {#peer_port}
            </dt>
            <dd>Peer port.</dd>
            <dt >
#### <code class="Cm">peer_host</code> {#peer_host}
            </dt>
            <dd>Peer hostname obtained via reverse DNS, or its IP address if reverse DNS failed or was not enabled.</dd>
            <dt >
#### <code class="Cm">ssl</code> {#ssl}
            </dt>
            <dd>Boolean indicating whether the connection is secured with SSL.</dd>
            <dt >
#### <code class="Cm">ssl_protocol</code> {#ssl_protocol}
            </dt>
            <dd>SSL protocol (e.g. "tlsv1").</dd>
            <dt >
#### <code class="Cm">ssl_key_exchange</code> {#ssl_key_exchange}
            </dt>
            <dd>SSL key exchange algorithm (e.g. "rsa").</dd>
            <dt >
#### <code class="Cm">ssl_cipher</code> {#ssl_cipher}
            </dt>
            <dd>SSL cipher algorithm (e.g. "aes_256_cbc").</dd>
            <dt >
#### <code class="Cm">ssl_hash</code> {#ssl_hash}
            </dt>
            <dd>SSL hash function (e.g. "sha").</dd>
            <dt >
#### <code class="Cm">peer_cert_subject</code> {#peer_cert_subject}
            </dt>
            <dd>The subject of the peer's SSL certificate in RFC4514 form.</dd>
            <dt >
#### <code class="Cm">peer_cert_issuer</code> {#peer_cert_issuer}
            </dt>
            <dd>The issuer of the peer's SSL certificate, in RFC4514 form.</dd>
            <dt >
#### <code class="Cm">peer_cert_validity</code> {#peer_cert_validity}
            </dt>
            <dd>The period for which the peer's SSL certificate is valid.</dd>
            <dt >
#### <code class="Cm">state</code> {#state}
            </dt>
            <dd>
              Connection state; one of:
              <ul class="Bl-bullet Bl-compact">
                <li>
starting
</li>
                <li>
tuning
</li>
                <li>
opening
</li>
                <li>
running
</li>
                <li>
flow
</li>
                <li>
blocking
</li>
                <li>
blocked
</li>
                <li>
closing
</li>
                <li>
closed
</li>
              </ul>

            </dd>
            <dt >
#### <code class="Cm">channels</code> {#channels}
            </dt>
            <dd>The number of channels using the connection.</dd>
            <dt >
#### <code class="Cm">protocol</code> {#protocol}
            </dt>
            <dd>
              The version of the AMQP protocol in use -- currently one of:
              <ul class="Bl-bullet Bl-compact">
                <li>
&lcub;0,9,1}
</li>
                <li>
&lcub;0,8,0}
</li>
              </ul>

              <p class="Pp">Note that if a client requests an AMQP 0-9 connection, we treat it as AMQP 0-9-1.</p>
            </dd>
            <dt >
#### <code class="Cm">auth_mechanism</code> {#auth_mechanism}
            </dt>
            <dd>SASL authentication mechanism used, such as "PLAIN".</dd>
            <dt >
#### <code class="Cm">user</code> {#user~2}
            </dt>
            <dd>The username associated with the connection.</dd>
            <dt >
#### <code class="Cm">vhost</code> {#vhost~2}
            </dt>
            <dd>Virtual hostname with non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">timeout</code> {#timeout}
            </dt>
            <dd>Connection timeout / negotiated heartbeat interval, in seconds.</dd>
            <dt >
#### <code class="Cm">frame_max</code> {#frame_max}
            </dt>
            <dd>Maximum frame size (bytes).</dd>
            <dt >
#### <code class="Cm">channel_max</code> {#channel_max}
            </dt>
            <dd>Maximum number of channels on this connection.</dd>
            <dt >
#### <code class="Cm">client_properties</code> {#client_properties}
            </dt>
            <dd>Informational properties transmitted by the client during connection establishment.</dd>
            <dt >
#### <code class="Cm">recv_oct</code> {#recv_oct}
            </dt>
            <dd>Octets received.</dd>
            <dt >
#### <code class="Cm">recv_cnt</code> {#recv_cnt}
            </dt>
            <dd>Packets received.</dd>
            <dt >
#### <code class="Cm">send_oct</code> {#send_oct}
            </dt>
            <dd>Octets send.</dd>
            <dt >
#### <code class="Cm">send_cnt</code> {#send_cnt}
            </dt>
            <dd>Packets sent.</dd>
            <dt >
#### <code class="Cm">send_pend</code> {#send_pend}
            </dt>
            <dd>Send queue size.</dd>
            <dt >
#### <code class="Cm">connected_at</code> {#connected_at}
            </dt>
            <dd>Date and time this connection was established, as a timestamp.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">connectioninfoitem s</var> are specified then user, peer host, peer port, time since flow control, and memory block state are displayed.</p>
          <p class="Pp">For example, this command displays the send queue size and server port for each connection:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_connections send_pend port</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_consumers</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_consumers}
        </dt>
        <dd>
          <p class="Pp">Lists consumers, i.e. subscriptions to a queue´s message stream. Each line printed shows, separated by tab characters, the name of the queue subscribed to, the id of the channel process via which the subscription was created and is managed, the consumer tag which uniquely identifies the subscription within a channel, a boolean indicating whether acknowledgements are expected for messages delivered to this consumer, an integer indicating the prefetch limit (with 0 meaning "none"), and any arguments for this consumer.</p>
        </dd>
        <dt >
#### <code class="Cm">list_exchanges</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<var class="Ar">exchangeinfoitem ...</var>] {#list_exchanges}
        </dt>
        <dd>
          <p class="Pp">Returns exchange details. Exchange details of the "/" virtual host are returned if the <code class="Fl">-p</code> flag is absent. The <code class="Fl">-p</code> flag can be used to override this default.</p>
          <p class="Pp">The <var class="Ar">exchangeinfoitem</var> parameter is used to indicate which exchange information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">exchangeinfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">name</code> {#name~4}
            </dt>
            <dd>The name of the exchange with non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">type</code> {#type}
            </dt>
            <dd>
              The exchange type, such as:
              <ul class="Bl-bullet Bl-compact">
                <li>
direct
</li>
                <li>
topic
</li>
                <li>
headers
</li>
                <li>
fanout
</li>
              </ul>

            </dd>
            <dt >
#### <code class="Cm">durable</code> {#durable}
            </dt>
            <dd>Whether or not the exchange survives server restarts.</dd>
            <dt >
#### <code class="Cm">auto_delete</code> {#auto_delete}
            </dt>
            <dd>Whether the exchange will be deleted automatically when no longer used.</dd>
            <dt >
#### <code class="Cm">internal</code> {#internal}
            </dt>
            <dd>Whether the exchange is internal, i.e. clients cannot publish to it directly.</dd>
            <dt >
#### <code class="Cm">arguments</code> {#arguments~2}
            </dt>
            <dd>Exchange arguments.</dd>
            <dt >
#### <code class="Cm">policy</code> {#policy}
            </dt>
            <dd>Policy name for applying to the exchange.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">exchangeinfoitem s</var> are specified then exchange name and type are displayed.</p>
          <p class="Pp">For example, this command displays the name and type for each exchange of the virtual host named "my-vhost":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_exchanges -p my-vhost name type</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_hashes</code> {#list_hashes}
        </dt>
        <dd>
          <p class="Pp">Lists hash functions supported by encoding commands.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to list all hash functions supported by encoding commands:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_hashes</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_queues</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<code class="Fl">--offline</code> | <code class="Fl">--online</code> | <code class="Fl">--local</code>] [<var class="Ar">queueinfoitem ...</var>] {#list_queues}
        </dt>
        <dd>
          <p class="Pp">Returns queue details. Queue details of the "/" virtual host are returned if the <code class="Fl">-p</code> flag is absent. The <code class="Fl">-p</code> flag can be used to override this default.</p>
          <p class="Pp">Displayed queues can be filtered by their status or location using one of the following mutually exclusive options:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Fl">--offline</code> {#offline~2}
            </dt>
            <dd>List only those durable queues that are not currently available (more specifically, their leader node isn't).</dd>
            <dt >
#### <code class="Fl">--online</code> {#online}
            </dt>
            <dd>List queues that are currently available (their leader node is).</dd>
            <dt >
#### <code class="Fl">--local</code> {#local}
            </dt>
            <dd>List only those queues whose leader replica is located on the current node.</dd>
          </dl>
          <p class="Pp">The <var class="Ar">queueinfoitem</var> parameter is used to indicate which queue information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">queueinfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">name</code> {#name~5}
            </dt>
            <dd>The name of the queue with non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">durable</code> {#durable~2}
            </dt>
            <dd>Whether or not the queue survives server restarts.</dd>
            <dt >
#### <code class="Cm">auto_delete</code> {#auto_delete~2}
            </dt>
            <dd>Whether the queue will be deleted automatically when no longer used.</dd>
            <dt >
#### <code class="Cm">arguments</code> {#arguments~3}
            </dt>
            <dd>Queue arguments.</dd>
            <dt >
#### <code class="Cm">policy</code> {#policy~2}
            </dt>
            <dd>Name of the user policy that is applied to the queue.</dd>
            <dt >
#### <code class="Cm">operator_policy</code> {#operator_policy}
            </dt>
            <dd>Name of the operator policy that is applied to the queue.</dd>
            <dt >
#### <code class="Cm">effective_policy_definition</code> {#effective_policy_definition}
            </dt>
            <dd>Effective policy definition for the queue: both user and operator policy definitions merged.</dd>
            <dt >
#### <code class="Cm">pid</code> {#pid~3}
            </dt>
            <dd>Erlang process identifier of the queue.</dd>
            <dt >
#### <code class="Cm">owner_pid</code> {#owner_pid}
            </dt>
            <dd>Id of the Erlang process of the connection which is the exclusive owner of the queue. Empty if the queue is non-exclusive.</dd>
            <dt >
#### <code class="Cm">exclusive</code> {#exclusive}
            </dt>
            <dd>True if the queue is exclusive (i.e. has owner_pid), false otherwise.</dd>
            <dt >
#### <code class="Cm">exclusive_consumer_pid</code> {#exclusive_consumer_pid}
            </dt>
            <dd>Id of the Erlang process representing the channel of the exclusive consumer subscribed to this queue. Empty if there is no exclusive consumer.</dd>
            <dt >
#### <code class="Cm">exclusive_consumer_tag</code> {#exclusive_consumer_tag}
            </dt>
            <dd>The consumer tag of the exclusive consumer subscribed to this queue. Empty if there is no exclusive consumer.</dd>
            <dt >
#### <code class="Cm">messages_ready</code> {#messages_ready}
            </dt>
            <dd>The number of messages ready to be delivered to clients.</dd>
            <dt >
#### <code class="Cm">messages_unacknowledged</code> {#messages_unacknowledged~2}
            </dt>
            <dd>The number of messages delivered to clients but not yet acknowledged.</dd>
            <dt >
#### <code class="Cm">messages</code> {#messages}
            </dt>
            <dd>The sum of ready and unacknowledged messages (queue depth).</dd>
            <dt >
#### <code class="Cm">messages_ready_ram</code> {#messages_ready_ram}
            </dt>
            <dd>The number of messages from messages_ready which are resident in ram.</dd>
            <dt >
#### <code class="Cm">messages_unacknowledged_ram</code> {#messages_unacknowledged_ram}
            </dt>
            <dd>The number of messages from messages_unacknowledged which are resident in ram.</dd>
            <dt >
#### <code class="Cm">messages_ram</code> {#messages_ram}
            </dt>
            <dd>Total number of messages which are resident in ram.</dd>
            <dt >
#### <code class="Cm">messages_persistent</code> {#messages_persistent}
            </dt>
            <dd>Total number of persistent messages in the queue (will always be 0 for transient queues).</dd>
            <dt >
#### <code class="Cm">message_bytes</code> {#message_bytes}
            </dt>
            <dd>The sum of the size of all message bodies in the queue. This does not include the message properties (including headers) or any overhead.</dd>
            <dt >
#### <code class="Cm">message_bytes_ready</code> {#message_bytes_ready}
            </dt>
            <dd>Like <code class="Cm">message_bytes</code> but counting only those messages ready to be delivered to clients.</dd>
            <dt >
#### <code class="Cm">message_bytes_unacknowledged</code> {#message_bytes_unacknowledged}
            </dt>
            <dd>Like <code class="Cm">message_bytes</code> but counting only those messages delivered to clients but not yet acknowledged.</dd>
            <dt >
#### <code class="Cm">message_bytes_ram</code> {#message_bytes_ram}
            </dt>
            <dd>Like <code class="Cm">message_bytes</code> but counting only those messages that are currently held in RAM.</dd>
            <dt >
#### <code class="Cm">message_bytes_persistent</code> {#message_bytes_persistent}
            </dt>
            <dd>Like <code class="Cm">message_bytes</code> but counting only those messages which are persistent.</dd>
            <dt >
#### <code class="Cm">head_message_timestamp</code> {#head_message_timestamp}
            </dt>
            <dd>The timestamp property of the first message in the queue, if present. Timestamps of messages only appear when they are in the paged-in state.</dd>
            <dt >
#### <code class="Cm">disk_reads</code> {#disk_reads}
            </dt>
            <dd>Total number of times messages have been read from disk by this queue since it started.</dd>
            <dt >
#### <code class="Cm">disk_writes</code> {#disk_writes}
            </dt>
            <dd>Total number of times messages have been written to disk by this queue since it started.</dd>
            <dt >
#### <code class="Cm">consumers</code> {#consumers}
            </dt>
            <dd>The number of consumers.</dd>
            <dt >
#### <code class="Cm">consumer_utilisation</code> {#consumer_utilisation}
            </dt>
            <dd>Fraction of the time (between 0.0 and 1.0) that the queue is able to immediately deliver messages to consumers. This can be less than 1.0 if consumers are limited by network congestion or prefetch count.</dd>
            <dt >
#### <code class="Cm">memory</code> {#memory}
            </dt>
            <dd>Bytes of memory allocated by the runtime for the queue, including stack, heap, and internal structures.</dd>
            <dt >
#### <code class="Cm">mirror_pids</code> {#mirror_pids}
            </dt>
            <dd>
              If the queue is mirrored, this lists the IDs of the mirrors (follower replicas). To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/3.13/ha">RabbitMQ Mirroring guide</a>
            </dd>
            <dt >
#### <code class="Cm">synchronised_mirror_pids</code> {#synchronised_mirror_pids}
            </dt>
            <dd>
              If the queue is mirrored, this gives the IDs of the mirrors (follower replicas) which are in sync with the leader replica. To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/3.13/ha">RabbitMQ Mirroring guide</a>
            </dd>
            <dt >
#### <code class="Cm">state</code> {#state~2}
            </dt>
            <dd>
              The state of the queue. Normally "running", but may be "&lcub;syncing, <var class="Ar">message_count</var>}" if the queue is synchronising.
              <p class="Pp">Queues that are located on cluster nodes that are currently down will be shown with a status of "down" (and most other <var class="Ar">queueinfoitem</var> will be unavailable).</p>
            </dd>
            <dt >
#### <code class="Cm">type</code> {#type~2}
            </dt>
            <dd>Queue type, one of: quorum, stream, classic.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">queueinfoitem s</var> are specified then queue name and depth are displayed.</p>
          <p class="Pp">For example, this command displays the depth and number of consumers for each queue of the virtual host named "my-vhost"</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_queues -p my-vhost messages consumers</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_unresponsive_queues</code> [<code class="Fl">--local</code>] [<code class="Fl">--queue-timeout</code> <var class="Ar">milliseconds</var>] [<var class="Ar">queueinfoitem ...</var>] [<code class="Fl">--no-table-headers</code>] {#list_unresponsive_queues}
        </dt>
        <dd>
          <p class="Pp">Tests queue leader replicas to respond within the given timeout. Lists those that did not respond in time.</p>
          <p class="Pp">Displayed queues can be filtered by their status or location using one of the following mutually exclusive options:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Fl">--all</code> {#all}
            </dt>
            <dd>List all queues.</dd>
            <dt >
#### <code class="Fl">--local</code> {#local~2}
            </dt>
            <dd>List only those queues whose leader replica is located on the current node.</dd>
          </dl>
          <p class="Pp">The <var class="Ar">queueinfoitem</var> parameter is used to indicate which queue information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">queueinfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">name</code> {#name~6}
            </dt>
            <dd>The name of the queue with non-ASCII characters escaped as in C.</dd>
            <dt >
#### <code class="Cm">durable</code> {#durable~3}
            </dt>
            <dd>Whether or not the queue should survive server restarts.</dd>
            <dt >
#### <code class="Cm">auto_delete</code> {#auto_delete~3}
            </dt>
            <dd>Whether the queue will be deleted automatically when all of its explicit bindings are deleted.</dd>
            <dt >
#### <code class="Cm">arguments</code> {#arguments~4}
            </dt>
            <dd>Queue arguments.</dd>
            <dt >
#### <code class="Cm">policy</code> {#policy~3}
            </dt>
            <dd>Effective policy name for the queue.</dd>
            <dt >
#### <code class="Cm">pid</code> {#pid~4}
            </dt>
            <dd>Erlang process identifier of the leader replica.</dd>
            <dt >
#### <code class="Cm">recoverable_mirrors</code> {#recoverable_mirrors}
            </dt>
            <dd>Erlang process identifiers of the mirror replicas that are considered reachable (available).</dd>
            <dt >
#### <code class="Cm">type</code> {#type~3}
            </dt>
            <dd>Queue type, one of: quorum, stream, classic.</dd>
          </dl>
          <p class="Pp">For example, this command lists only those unresponsive queues whose leader replica is hosted on the target node.</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_unresponsive_queues --local name</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">ping</code> {#ping}
        </dt>
        <dd>
          <p class="Pp">Checks that the node OS process is up, registered with EPMD, and CLI tools can authenticate with it</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl ping -n rabbit@hostname</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">report</code> {#report}
        </dt>
        <dd>
          <p class="Pp">Generate a server status report containing a concatenation of all server status information for support purposes. The output should be redirected to a file when accompanying a support request.</p>
          <p class="Pp">For example, this command creates a server report which may be attached to a support request email:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl report &gt; server_report.txt</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">schema_info</code> [<code class="Fl">--no-table-headers</code>] [<var class="Ar">column ...</var>] {#schema_info}
        </dt>
        <dd>
          <p class="Pp">Lists schema database tables and their properties</p>
          <p class="Pp">For example, this command lists the table names and their active replicas:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl schema_info name active_replicas</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">status</code> {#status}
        </dt>
        <dd>
          <p class="Pp">Displays broker status information such as the running applications on the current Erlang node, RabbitMQ and Erlang versions, OS name, and memory and file descriptor statistics. (See the <code class="Cm">cluster_status</code> command to find out which nodes are clustered and running.)</p>
          <p class="Pp">For example, this command displays information about the RabbitMQ broker:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl status</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Runtime Parameters and Policies {#Runtime_Parameters_and_Policies}
####       <p class="Pp">Certain features of RabbitMQ (such as the Federation plugin) are controlled by dynamic, cluster-wide<i class="Em" id="parameters.">parameters.</i> There are 2 kinds of parameters: parameters scoped to a virtual host and global parameters. Each vhost-scoped parameter consists of a component name, a name, and a value. The component name and name are strings, and the value is a valid JSON document. A global parameter consists of a name and value. The name is a string and the value is an arbitrary Erlang data structure. Parameters can be set, cleared, and listed. In general, you should refer to the documentation for the feature in question to see how to set parameters.</p> {#Runtime_Parameters_and_Policies}
      <p class="Pp">Policies is a feature built on top of runtime parameters. Policies are used to control and modify the behaviour of queues and exchanges on a cluster-wide basis. Policies apply within a given vhost and consist of a name, pattern, definition, and an optional priority. Policies can be set, cleared, and listed.</p>
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">clear_global_parameter</code> <var class="Ar">name</var> {#clear_global_parameter}
        </dt>
        <dd>
          <p class="Pp">Clears a global runtime parameter. This is similar to <code class="Cm">clear_parameter</code> but the key-value pair isn't tied to a virtual host.</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">name</var></dt>
            <dd>The name of the global runtime parameter being cleared.</dd>
          </dl>
          <p class="Pp">For example, this command clears the global runtime parameter "mqtt_default_vhosts":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_global_parameter mqtt_default_vhosts</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">clear_parameter</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">component_name</var> <var class="Ar">key</var> {#clear_parameter}
        </dt>
        <dd>
          <p class="Pp">Clears a parameter.</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">component_name</var></dt>
            <dd>The name of the component for which the parameter is being cleared.</dd>
            <dt><var class="Ar">name</var></dt>
            <dd>The name of the parameter being cleared.</dd>
          </dl>
          <p class="Pp">For example, this command clears the parameter "node01" for the "federation-upstream" component in the default virtual host:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_parameter federation-upstream node01</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_global_parameters</code> {#list_global_parameters}
        </dt>
        <dd>
          <p class="Pp">Lists all global runtime parameters. This is similar to <code class="Cm">list_parameters</code> but the global runtime parameters are not tied to any virtual host.</p>
          <p class="Pp">For example, this command lists all global parameters:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_global_parameters</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_parameters</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_parameters}
        </dt>
        <dd>
          <p class="Pp">Lists all parameters for a virtual host.</p>
          <p class="Pp">For example, this command lists all parameters in the default virtual host:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_parameters</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_global_parameter</code> <var class="Ar">name</var> <var class="Ar">value</var> {#set_global_parameter}
        </dt>
        <dd>
          <p class="Pp">Sets a global runtime parameter. This is similar to <code class="Cm">set_parameter</code> but the key-value pair isn't tied to a virtual host.</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">name</var></dt>
            <dd>The name of the global runtime parameter being set.</dd>
            <dt><var class="Ar">value</var></dt>
            <dd>The value for the global runtime parameter, as a JSON document. In most shells you are very likely to need to quote this.</dd>
          </dl>
          <p class="Pp">For example, this command sets the global runtime parameter "mqtt_default_vhosts" to the JSON document &lcub;"O=client,CN=guest":"/"}:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_global_parameter mqtt_default_vhosts '&lcub;"O=client,CN=guest":"/"}'</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_parameter</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">component_name</var> <var class="Ar">name</var> <var class="Ar">value</var> {#set_parameter}
        </dt>
        <dd>
          <p class="Pp">Sets a parameter.</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">component_name</var></dt>
            <dd>The name of the component for which the parameter is being set.</dd>
            <dt><var class="Ar">name</var></dt>
            <dd>The name of the parameter being set.</dd>
            <dt><var class="Ar">value</var></dt>
            <dd>The value for the parameter, as a JSON document. In most shells you are very likely to need to quote this.</dd>
          </dl>
          <p class="Pp">For example, this command sets the parameter "node01" for the "federation-upstream" component in the default virtual host to the following JSON "guest":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_parameter federation-upstream node01 '&lcub;"uri":"amqp://user:password@server/%2F","ack-mode":"on-publish"}'</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_policies</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_policies}
        </dt>
        <dd>
          <p class="Pp">Lists all policies for a virtual host.</p>
          <p class="Pp">For example, this command lists all policies in the default virtual host:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_policies</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_operator_policy</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<code class="Fl">--priority</code> <var class="Ar">priority</var>] [<code class="Fl">--apply-to</code> <var class="Ar">apply-to</var>] <var class="Ar">name</var> <var class="Ar">pattern</var> <var class="Ar">definition</var> {#set_operator_policy}
        </dt>
        <dd>
          <p class="Pp">Sets an operator policy that overrides a subset of arguments in user policies. Arguments are identical to those of <code class="Cm">set_policy</code>.</p>
          <p class="Pp">Supported arguments are:</p>
          <ul class="Bl-bullet Bl-compact">
            <li>
expires
</li>
            <li>
message-ttl
</li>
            <li>
max-length
</li>
            <li>
max-length-bytes
</li>
          </ul>

        </dd>
        <dt >
#### <code class="Cm">set_policy</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<code class="Fl">--priority</code> <var class="Ar">priority</var>] [<code class="Fl">--apply-to</code> <var class="Ar">apply-to</var>] <var class="Ar">name</var> <var class="Ar">pattern</var> <var class="Ar">definition</var> {#set_policy}
        </dt>
        <dd>
          <p class="Pp">Sets a policy.</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">name</var></dt>
            <dd>The name of the policy.</dd>
            <dt><var class="Ar">pattern</var></dt>
            <dd>The regular expression allows the policy to apply if it matches a resource name.</dd>
            <dt><var class="Ar">definition</var></dt>
            <dd>The definition of the policy, as a JSON document. In most shells you are very likely to need to quote this.</dd>
            <dt><var class="Ar">priority</var></dt>
            <dd>The priority of the policy as an integer. Higher numbers indicate greater precedence. The default is 0.</dd>
            <dt><var class="Ar">apply-to</var></dt>
            <dd>
              Which types of objects this policy should apply to. Possible values are:
              <ul class="Bl-bullet Bl-compact">
                <li>
queues (all queue types, including streams)
</li>
                <li>
classic_queues (classic queues only)
</li>
                <li>
quorum_queues (quorum queues only)
</li>
                <li>
streams (streams only)
</li>
                <li>
exchanges
</li>
                <li>
all
</li>
              </ul>
The default is <code class="Cm">all</code>.
            </dd>
          </dl>
          <p class="Pp">For example, this command sets the policy "federate-me" in the default virtual host so that built-in exchanges are federated:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_policy federate-me ^amq. '&lcub;"federation-upstream-set":"all"}'</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">clear_policy</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">name</var> {#clear_policy}
        </dt>
        <dd>
          <p class="Pp">Clears a policy.</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">name</var></dt>
            <dd>The name of the policy being cleared.</dd>
          </dl>
          <p class="Pp">For example, this command clears the "federate-me" policy in the default virtual host:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_policy federate-me</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">clear_operator_policy</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">name</var> {#clear_operator_policy}
        </dt>
        <dd>
          <p class="Pp">Clears an operator policy. Arguments are identical to those of <code class="Cm">clear_policy</code>.</p>
        </dd>
        <dt >
#### <code class="Cm">list_operator_policies</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_operator_policies}
        </dt>
        <dd>
          <p class="Pp">Lists operator policy overrides for a virtual host. Arguments are identical to those of <code class="Cm">list_policies</code>.</p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Virtual hosts {#Virtual_hosts}
      <p class="Pp">Note that <code class="Nm">rabbitmqctl</code> manages the RabbitMQ internal user database. Permissions for users from any alternative authorisation backend will not be visible to <code class="Nm">rabbitmqctl</code>.</p>
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">add_vhost</code> <var class="Ar">vhost</var> [<code class="Fl">--description</code> <var class="Ar">desc</var> <code class="Fl">--tags</code> <var class="Ar">tags</var> <code class="Fl">--default-queue-type</code> <var class="Ar">default-q-type</var>] {#add_vhost}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host entry to create.</dd>
            <dt><var class="Ar">desc</var></dt>
            <dd>Arbitrary virtual host description, e.g. its purpose, for the operator's convenience.</dd>
            <dt><var class="Ar">tags</var></dt>
            <dd>A comma-separated list of virtual host tags for the operator's convenience.</dd>
            <dt><var class="Ar">default-q-type</var></dt>
            <dd>If clients do not specify queue type explicitly, this type will be used. One of: quorum, stream.</dd>
          </dl>
          <p class="Pp">Creates a virtual host.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to create a new virtual host called "project9_dev_18":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl add_vhost project9_dev_18 --description 'Dev environment no. 18' --tags dev,project9</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">clear_vhost_limits</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#clear_vhost_limits}
        </dt>
        <dd>
          <p class="Pp">Clears virtual host limits.</p>
          <p class="Pp">For example, this command clears vhost limits in vhost "qa_env":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_vhost_limits -p qa_env</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">delete_vhost</code> <var class="Ar">vhost</var> {#delete_vhost}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host entry to delete.</dd>
          </dl>
          <p class="Pp">Deletes a virtual host.</p>
          <p class="Pp">Deleting a virtual host deletes all its exchanges, queues, bindings, user permissions, parameters, and policies.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to delete the virtual host called "test":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl delete_vhost a-vhost</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_vhost_limits</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<code class="Fl">--global</code>] [<code class="Fl">--no-table-headers</code>] {#list_vhost_limits}
        </dt>
        <dd>
          <p class="Pp">Displays configured virtual host limits.</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Fl">--global</code> {#global}
            </dt>
            <dd>Show limits for all vhosts. Suppresses the <code class="Fl">-p</code> parameter.</dd>
          </dl>
        </dd>
        <dt >
#### <code class="Cm">restart_vhost</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#restart_vhost}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host entry to restart, defaulting to "/".</dd>
          </dl>
          <p class="Pp">Restarts a failed vhost data stores and queues.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to restart a virtual host called "test":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl restart_vhost test</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_vhost_limits</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">definition</var> {#set_vhost_limits}
        </dt>
        <dd>
          <p class="Pp">Sets virtual host limits.</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">definition</var></dt>
            <dd>
              The definition of the limits, as a JSON document. In most shells you are very likely to need to quote this.
              <p class="Pp">Recognised limits are:</p>
              <ul class="Bl-bullet Bl-compact">
                <li>
max-connections
</li>
                <li>
max-queues
</li>
              </ul>

              <p class="Pp">Use a negative value to specify "no limit".</p>
            </dd>
          </dl>
          <p class="Pp">For example, this command limits the maximum number of concurrent connections in vhost "qa_env" to 64:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_vhost_limits -p qa_env '&lcub;"max-connections": 64}'</code>
          </div>
          <p class="Pp">This command limits the maximum number of queues in vhost "qa_env" to 256:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_vhost_limits -p qa_env '&lcub;"max-queues": 256}'</code>
          </div>
          <p class="Pp">This command clears the maximum number of connections limit in vhost "qa_env":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_vhost_limits -p qa_env '&lcub;"max-connections": -1}'</code>
          </div>
          <p class="Pp">This command disables client connections in vhost "qa_env":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_vhost_limits -p qa_env '&lcub;"max-connections": 0}'</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_user_limits</code> <var class="Ar">username</var> <var class="Ar">definition</var> {#set_user_limits}
        </dt>
        <dd>
          <p class="Pp">Sets user limits.</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user to apply limits to</dd>
            <dt><var class="Ar">definition</var></dt>
            <dd>
              The definition of the limits, as a JSON document. In most shells you are very likely to need to quote this.
              <p class="Pp">Recognised limits are:</p>
              <ul class="Bl-bullet Bl-compact">
                <li>
max-connections
</li>
                <li>
max-channels
</li>
              </ul>

              <p class="Pp">Use a negative value to specify "no limit".</p>
            </dd>
          </dl>
          <p class="Pp">For example, this command limits the maximum number of concurrent connections a user is allowed to open "limited_user" to 64:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_user_limits limited_user '&lcub;"max-connections": 64}'</code>
          </div>
          <p class="Pp">This command limits the maximum number of channels a user is allowed to open on a connection "limited_user" to 16:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_user_limits limited_user '&lcub;"max-channels": 16}'</code>
          </div>
          <p class="Pp">This command clears the maximum number of connections limit for user "limited_user":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_user_limits limited_user 'max-connections'</code>
          </div>
          <p class="Pp">This command disables client connections for user "limited_user":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_user_limits limited_user '&lcub;"max-connections": 0}'</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">clear_user_limits</code> <var class="Ar">username</var> <var class="Ar">limit</var> {#clear_user_limits}
        </dt>
        <dd>
          <p class="Pp">Clears user limits.</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">username</var></dt>
            <dd>The name of the user to clear the limits of</dd>
            <dt><var class="Ar">limit</var></dt>
            <dd>The name of the limit or "all" to clear all limits at once.</dd>
          </dl>
          <p class="Pp">Recognised limits are:</p>
          <ul class="Bl-bullet Bl-compact">
            <li>
max-connections
</li>
            <li>
max-channels
</li>
          </ul>

          <p class="Pp">For example, this command clears the maximum connection limits of user "limited_user":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_user_limits limited_user 'max-connections'</code>
          </div>
          <p class="Pp">This command clears all limits of user "limited_user":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl clear_user_limits limited_user all</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">trace_off</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#trace_off}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host for which to stop tracing.</dd>
          </dl>
          <p class="Pp">Stops tracing.</p>
        </dd>
        <dt >
#### <code class="Cm">trace_on</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#trace_on}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host for which to start tracing.</dd>
          </dl>
          <p class="Pp">Starts tracing. Note that the trace state is not persistent; it will revert to being off if the node is restarted.</p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Configuration {#Configuration}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">decode</code> <var class="Ar">value</var> <var class="Ar">passphrase</var> [<code class="Fl">--cipher</code> <var class="Ar">cipher</var>] [<code class="Fl">--hash</code> <var class="Ar">hash</var>] [<code class="Fl">--iterations</code> <var class="Ar">iterations</var>] {#decode}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">value</var> <var class="Ar">passphrase</var></dt>
            <dd>
              Value to decrypt (as produced by the encode command) and passphrase.
              <p class="Pp">For example:</p>
              <p class="Pp"></p>
              <div class="Bd Bd-indent lang-bash">
                <code class="Li">rabbitmqctl decode '&lcub;encrypted, &lt;&lt;"..."&gt;&gt;}' mypassphrase</code>
              </div>
            </dd>
            <dt >
#### <code class="Fl">--cipher</code> <var class="Ar">cipher</var> <code class="Fl">--hash</code> <var class="Ar">hash</var> <code class="Fl">--iterations</code> <var class="Ar">iterations</var> {#cipher}
            </dt>
            <dd>
              Options to specify the decryption settings. They can be used independently.
              <p class="Pp">For example:</p>
              <p class="Pp"></p>
              <div class="Bd Bd-indent lang-bash">
                <code class="Li">rabbitmqctl decode --cipher blowfish_cfb64 --hash sha256 --iterations 10000 '&lcub;encrypted,&lt;&lt;"..."&gt;&gt;} mypassphrase</code>
              </div>
            </dd>
          </dl>
        </dd>
        <dt >
#### <code class="Cm">encode</code> <var class="Ar">value</var> <var class="Ar">passphrase</var> [<code class="Fl">--cipher</code> <var class="Ar">cipher</var>] [<code class="Fl">--hash</code> <var class="Ar">hash</var>] [<code class="Fl">--iterations</code> <var class="Ar">iterations</var>] {#encode}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">value</var> <var class="Ar">passphrase</var></dt>
            <dd>
              Value to encrypt and passphrase.
              <p class="Pp">For example:</p>
              <p class="Pp"></p>
              <div class="Bd Bd-indent lang-bash">
                <code class="Li">rabbitmqctl encode '&lt;&lt;"guest"&gt;&gt;' mypassphrase</code>
              </div>
            </dd>
            <dt >
#### <code class="Fl">--cipher</code> <var class="Ar">cipher</var> <code class="Fl">--hash</code> <var class="Ar">hash</var> <code class="Fl">--iterations</code> <var class="Ar">iterations</var> {#cipher~2}
            </dt>
            <dd>
              Options to specify the encryption settings. They can be used independently.
              <p class="Pp">For example:</p>
              <p class="Pp"></p>
              <div class="Bd Bd-indent lang-bash">
                <code class="Li">rabbitmqctl encode --cipher blowfish_cfb64 --hash sha256 --iterations 10000 '&lt;&lt;"guest"&gt;&gt;' mypassphrase</code>
              </div>
            </dd>
          </dl>
        </dd>
        <dt >
#### <code class="Cm">set_cluster_name</code> <var class="Ar">name</var> {#set_cluster_name}
        </dt>
        <dd>
          <p class="Pp">Sets the cluster name to <var class="Ar">name</var>. The cluster name is announced to clients on connection, and used by the federation and shovel plugins to record where a message has been. The cluster name is by default derived from the hostname of the first node in the cluster but can be changed.</p>
          <p class="Pp">For example, this sets the cluster name to "london":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_cluster_name london</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_disk_free_limit</code> <var class="Ar">disk_limit</var> {#set_disk_free_limit}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">disk_limit</var></dt>
            <dd>Lower bound limit as an integer in bytes or a string with a memory unit symbol (see vm_memory_high_watermark), e.g. 512M or 1G. Once free disk space reaches the limit, a disk alarm will be set.</dd>
          </dl>
        </dd>
        <dt >
#### <code class="Cm">set_disk_free_limit mem_relative</code> <var class="Ar">fraction</var> {#set_disk_free_limit~2}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">fraction</var></dt>
            <dd>Limit relative to the total amount available RAM as a non-negative floating point number. Values lower than 1.0 can be dangerous and should be used carefully.</dd>
          </dl>
        </dd>
        <dt >
#### <code class="Cm">set_log_level</code> [<var class="Ar">log_level</var>] {#set_log_level}
        </dt>
        <dd>
          <p class="Pp">Sets log level in the running node</p>
          <p class="Pp">Supported <var class="Ar">log_level</var> values are:</p>
          <ul class="Bl-bullet Bl-compact">
            <li>
debug
</li>
            <li>
info
</li>
            <li>
warning
</li>
            <li>
error
</li>
            <li>
critical
</li>
            <li>
none
</li>
          </ul>

          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl set_log_level debug</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">set_vm_memory_high_watermark</code> <var class="Ar">fraction</var> {#set_vm_memory_high_watermark}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">fraction</var></dt>
            <dd>The new memory threshold fraction at which flow control is triggered, as a floating point number greater than or equal to 0.</dd>
          </dl>
        </dd>
        <dt >
#### <code class="Cm">set_vm_memory_high_watermark</code> [absolute] <var class="Ar">memory_limit</var> {#set_vm_memory_high_watermark~2}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">memory_limit</var></dt>
            <dd>
              The new memory limit at which flow control is triggered, expressed in bytes as an integer number greater than or equal to 0 or as a string with memory unit symbol(e.g. 512M or 1G). Available unit symbols are:
              <dl class="Bl-tag">
                <dt >
#### <code class="Cm">k</code>, <code class="Cm">kiB</code> {#k}
                </dt>
                <dd>kibibytes (2^10 bytes)</dd>
                <dt >
#### <code class="Cm">M</code>, <code class="Cm">MiB</code> {#M}
                </dt>
                <dd>mebibytes (2^20 bytes)</dd>
                <dt >
#### <code class="Cm">G</code>, <code class="Cm">GiB</code> {#G}
                </dt>
                <dd>gibibytes (2^30 bytes)</dd>
                <dt >
#### <code class="Cm">kB</code> {#kB}
                </dt>
                <dd>kilobytes (10^3 bytes)</dd>
                <dt >
#### <code class="Cm">MB</code> {#MB}
                </dt>
                <dd>megabytes (10^6 bytes)</dd>
                <dt >
#### <code class="Cm">GB</code> {#GB}
                </dt>
                <dd>gigabytes (10^9 bytes)</dd>
              </dl>
            </dd>
          </dl>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Feature flags {#Feature_flags}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">enable_feature_flag</code> <var class="Ar">feature_flag</var> {#enable_feature_flag}
        </dt>
        <dd>
          <p class="Pp">Enables a feature flag on the target node.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl enable_feature_flag restart_streams</code>
          </div>
          <p class="Pp">You can also enable all feature flags by specifying "all":</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl enable_feature_flag all</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_feature_flags</code> [<var class="Ar">column ...</var>] {#list_feature_flags}
        </dt>
        <dd>
          <p class="Pp">Lists feature flags</p>
          <p class="Pp">Supported <var class="Ar">column</var> values are:</p>
          <ul class="Bl-bullet Bl-compact">
            <li>
name
</li>
            <li>
state
</li>
            <li>
stability
</li>
            <li>
provided_by
</li>
            <li>
desc
</li>
            <li>
doc_url
</li>
          </ul>

          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl list_feature_flags name state</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Connection Operations {#Connection_Operations}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">close_all_connections</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<code class="Fl">--global</code>] [<code class="Fl">--per-connection-delay</code> <var class="Ar">delay</var>] [<code class="Fl">--limit</code> <var class="Ar">limit</var>] <var class="Ar">explanation</var> {#close_all_connections}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt >
#### <code class="Fl">-p</code> <var class="Ar">vhost</var> {#p}
            </dt>
            <dd>The name of the virtual host for which connections should be closed. Ignored when <code class="Fl">--global</code> is specified.</dd>
            <dt >
#### <code class="Fl">--global</code> {#global~2}
            </dt>
            <dd>If connections should be closed for all vhosts. Overrides <code class="Fl">-p</code></dd>
            <dt >
#### <code class="Fl">--per-connection-delay</code> <var class="Ar">delay</var> {#per-connection-delay}
            </dt>
            <dd>Time in milliseconds to wait after each connection closing.</dd>
            <dt >
#### <code class="Fl">--limit</code> <var class="Ar">limit</var> {#limit}
            </dt>
            <dd>The number of connections to close. Only works per vhost. Ignored when <code class="Fl">--global</code> is specified.</dd>
            <dt><var class="Ar">explanation</var></dt>
            <dd>Explanation string.</dd>
          </dl>
          <p class="Pp">Instructs the broker to close all connections for the specified vhost or entire RabbitMQ node.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to close 10 connections on "qa_env" vhost, passing the explanation "Please close":</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl close_all_connections -p qa_env --limit 10 'Please close'</code>
          </div>
          <p class="Pp">This command instructs broker to close all connections to the node:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl close_all_connections --global</code>
          </div>
          <p class="Pp"></p>
        </dd>
        <dt >
#### <code class="Cm">close_connection</code> <var class="Ar">connectionpid</var> <var class="Ar">explanation</var> {#close_connection}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">connectionpid</var></dt>
            <dd>Id of the Erlang process associated with the connection to close.</dd>
            <dt><var class="Ar">explanation</var></dt>
            <dd>Explanation string.</dd>
          </dl>
          <p class="Pp">Instructs the broker to close the connection associated with the Erlang process id <var class="Ar">connectionpid</var> (see also the <code class="Cm">list_connections</code> command), passing the <var class="Ar">explanation</var> string to the connected client as part of the AMQP connection shutdown protocol.</p>
          <p class="Pp">For example, this command instructs the RabbitMQ broker to close the connection associated with the Erlang process id "&lt;rabbit@tanto.4262.0&gt;", passing the explanation "go away" to the connected client:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl close_connection "&lt;rabbit@tanto.4262.0&gt;" "go away"</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Misc {#Misc}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">eval</code> <var class="Ar">expression</var> {#eval}
        </dt>
        <dd>
          <p class="Pp">Evaluates an Erlang expression on the target node</p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Queue Operations {#Queue_Operations}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">delete_queue</code> <var class="Ar">queue_name</var> [<code class="Fl">--if-empty</code> | <code class="Fl">-e</code>] [<code class="Fl">--if-unused</code> | <code class="Fl">-u</code>] {#delete_queue}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">queue_name</var></dt>
            <dd>The name of the queue to delete.</dd>
            <dt><var class="Ar">--if-empty</var></dt>
            <dd>Delete the queue if it is empty (has no messages ready for delivery)</dd>
            <dt><var class="Ar">--if-unused</var></dt>
            <dd>Delete the queue only if it has no consumers</dd>
          </dl>
          <p class="Pp">Deletes a queue.</p>
        </dd>
        <dt >
#### <code class="Cm">purge_queue</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">queue</var> {#purge_queue}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">queue</var></dt>
            <dd>The name of the queue to purge.</dd>
          </dl>
          <p class="Pp">Purges a queue (removes all messages in it).</p>
        </dd>
      </dl>
    </section>
  </section>
  <section class="Sh">
## PLUGIN COMMANDS {#PLUGIN_COMMANDS}
    <p class="Pp">RabbitMQ plugins can extend the rabbitmqctl tool to add new commands when enabled. Currently available commands can be found in the <code class="Cm">rabbitmqctl help</code> output. The following commands are added by RabbitMQ plugins, available in the default distribution:</p>
    <section class="Ss">
### Shovel plugin {#Shovel_plugin}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">shovel_status</code> {#shovel_status}
        </dt>
        <dd>Prints a list of configured Shovels</dd>
        <dt >
#### <code class="Cm">delete_shovel</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] <var class="Ar">name</var> {#delete_shovel}
        </dt>
        <dd>Instructs the RabbitMQ node to delete the configured shovel by <var class="Ar">name</var>.</dd>
      </dl>
    </section>
    <section class="Ss">
### Federation plugin {#Federation_plugin}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">federation_status</code> [<code class="Fl">--only-down</code>] {#federation_status}
        </dt>
        <dd>
          Prints a list of federation links.
          <dl class="Bl-tag">
            <dt >
#### <code class="Fl">--only-down</code> {#only-down}
            </dt>
            <dd>Only list federation links that are not running.</dd>
          </dl>
        </dd>
        <dt >
#### <code class="Cm">restart_federation_link</code> <var class="Ar">link_id</var> {#restart_federation_link}
        </dt>
        <dd>Instructs the RabbitMQ node to restart the federation link with the specified <var class="Ar">link_id</var>.</dd>
      </dl>
    </section>
    <section class="Ss">
### AMQP 1.0 plugin {#AMQP_1.0_plugin}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_amqp10_connections</code> [<var class="Ar">amqp10_connectioninfoitem ...</var>] {#list_amqp10_connections}
        </dt>
        <dd>
          Similar to the <code class="Cm">list_connections</code> command, but returns fields that make sense for AMQP-1.0 connections. <var class="Ar">amqp10_connectioninfoitem</var> parameter is used to indicate which connection information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">amqp10_connectioninfoitem</var> can take any value from the list that follows:
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">pid</code> {#pid~5}
            </dt>
            <dd>Id of the Erlang process associated with the connection.</dd>
            <dt >
#### <code class="Cm">auth_mechanism</code> {#auth_mechanism~2}
            </dt>
            <dd>SASL authentication mechanism used, such as "PLAIN".</dd>
            <dt >
#### <code class="Cm">host</code> {#host~2}
            </dt>
            <dd>Server hostname obtained via reverse DNS, or its IP address if reverse DNS failed or was turned off.</dd>
            <dt >
#### <code class="Cm">frame_max</code> {#frame_max~2}
            </dt>
            <dd>Maximum frame size (bytes).</dd>
            <dt >
#### <code class="Cm">timeout</code> {#timeout~2}
            </dt>
            <dd>Connection timeout / negotiated heartbeat interval, in seconds.</dd>
            <dt >
#### <code class="Cm">user</code> {#user~3}
            </dt>
            <dd>Username associated with the connection.</dd>
            <dt >
#### <code class="Cm">state</code> {#state~3}
            </dt>
            <dd>
              Connection state; one of:
              <ul class="Bl-bullet Bl-compact">
                <li>
starting
</li>
                <li>
waiting_amqp0100
</li>
                <li>
securing
</li>
                <li>
running
</li>
                <li>
blocking
</li>
                <li>
blocked
</li>
                <li>
closing
</li>
                <li>
closed
</li>
              </ul>

            </dd>
            <dt >
#### <code class="Cm">recv_oct</code> {#recv_oct~2}
            </dt>
            <dd>Octets received.</dd>
            <dt >
#### <code class="Cm">recv_cnt</code> {#recv_cnt~2}
            </dt>
            <dd>Packets received.</dd>
            <dt >
#### <code class="Cm">send_oct</code> {#send_oct~2}
            </dt>
            <dd>Octets send.</dd>
            <dt >
#### <code class="Cm">send_cnt</code> {#send_cnt~2}
            </dt>
            <dd>Packets sent.</dd>
            <dt >
#### <code class="Cm">ssl</code> {#ssl~2}
            </dt>
            <dd>Boolean indicating whether the connection is secured with SSL.</dd>
            <dt >
#### <code class="Cm">ssl_protocol</code> {#ssl_protocol~2}
            </dt>
            <dd>SSL protocol (e.g. "tlsv1").</dd>
            <dt >
#### <code class="Cm">ssl_key_exchange</code> {#ssl_key_exchange~2}
            </dt>
            <dd>SSL key exchange algorithm (e.g. "rsa").</dd>
            <dt >
#### <code class="Cm">ssl_cipher</code> {#ssl_cipher~2}
            </dt>
            <dd>SSL cipher algorithm (e.g. "aes_256_cbc").</dd>
            <dt >
#### <code class="Cm">ssl_hash</code> {#ssl_hash~2}
            </dt>
            <dd>SSL hash function (e.g. "sha").</dd>
            <dt >
#### <code class="Cm">peer_cert_subject</code> {#peer_cert_subject~2}
            </dt>
            <dd>The subject of the peer's SSL certificate, in RFC4514 form.</dd>
            <dt >
#### <code class="Cm">peer_cert_issuer</code> {#peer_cert_issuer~2}
            </dt>
            <dd>The issuer of the peer's SSL certificate, in RFC4514 form.</dd>
            <dt >
#### <code class="Cm">peer_cert_validity</code> {#peer_cert_validity~2}
            </dt>
            <dd>The period for which the peer's SSL certificate is valid.</dd>
            <dt >
#### <code class="Cm">node</code> {#node}
            </dt>
            <dd>The node name of the RabbitMQ node to which the connection is established.</dd>
          </dl>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### MQTT plugin {#MQTT_plugin}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_mqtt_connections</code> [<var class="Ar">mqtt_connectioninfoitem</var>] {#list_mqtt_connections}
        </dt>
        <dd>
          Similar to the <code class="Cm">list_connections</code> command, but returns fields that make sense for MQTT connections. <var class="Ar">mqtt_connectioninfoitem</var> parameter is used to indicate which connection information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">mqtt_connectioninfoitem</var> can take any value from the list that follows:
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">host</code> {#host~3}
            </dt>
            <dd>Server hostname obtained via reverse DNS, or its IP address if reverse DNS failed or was turned off.</dd>
            <dt >
#### <code class="Cm">port</code> {#port~2}
            </dt>
            <dd>Server port.</dd>
            <dt >
#### <code class="Cm">peer_host</code> {#peer_host~2}
            </dt>
            <dd>Peer hostname obtained via reverse DNS, or its IP address if reverse DNS failed or was not enabled.</dd>
            <dt >
#### <code class="Cm">peer_port</code> {#peer_port~2}
            </dt>
            <dd>Peer port.</dd>
            <dt >
#### <code class="Cm">protocol</code> {#protocol~2}
            </dt>
            <dd>
              MQTT protocol version, which can be one of the following:
              <ul class="Bl-bullet Bl-compact">
                <li>
&lcub;'MQTT', N/A}
</li>
                <li>
&lcub;'MQTT', 3.1.0}
</li>
                <li>
&lcub;'MQTT', 3.1.1}
</li>
              </ul>

            </dd>
            <dt >
#### <code class="Cm">channels</code> {#channels~2}
            </dt>
            <dd>The number of channels using the connection.</dd>
            <dt >
#### <code class="Cm">channel_max</code> {#channel_max~2}
            </dt>
            <dd>Maximum number of channels on this connection.</dd>
            <dt >
#### <code class="Cm">frame_max</code> {#frame_max~3}
            </dt>
            <dd>Maximum frame size (bytes).</dd>
            <dt >
#### <code class="Cm">client_properties</code> {#client_properties~2}
            </dt>
            <dd>Informational properties transmitted by the client during connection establishment.</dd>
            <dt >
#### <code class="Cm">ssl</code> {#ssl~3}
            </dt>
            <dd>Boolean indicating whether the connection is secured with SSL.</dd>
            <dt >
#### <code class="Cm">ssl_protocol</code> {#ssl_protocol~3}
            </dt>
            <dd>SSL protocol (e.g. "tlsv1").</dd>
            <dt >
#### <code class="Cm">ssl_key_exchange</code> {#ssl_key_exchange~3}
            </dt>
            <dd>SSL key exchange algorithm (e.g. "rsa").</dd>
            <dt >
#### <code class="Cm">ssl_cipher</code> {#ssl_cipher~3}
            </dt>
            <dd>SSL cipher algorithm (e.g. "aes_256_cbc").</dd>
            <dt >
#### <code class="Cm">ssl_hash</code> {#ssl_hash~3}
            </dt>
            <dd>SSL hash function (e.g. "sha").</dd>
            <dt >
#### <code class="Cm">conn_name</code> {#conn_name}
            </dt>
            <dd>Readable name for the connection.</dd>
            <dt >
#### <code class="Cm">connection_state</code> {#connection_state}
            </dt>
            <dd>
              Connection state; one of:
              <ul class="Bl-bullet Bl-compact">
                <li>
starting
</li>
                <li>
running
</li>
                <li>
blocked
</li>
              </ul>

            </dd>
            <dt >
#### <code class="Cm">connection</code> {#connection~2}
            </dt>
            <dd>Id of the Erlang process associated with the internal amqp direct connection.</dd>
            <dt >
#### <code class="Cm">consumer_tags</code> {#consumer_tags}
            </dt>
            <dd>A tuple of consumer tags for QOS0 and QOS1.</dd>
            <dt >
#### <code class="Cm">message_id</code> {#message_id}
            </dt>
            <dd>The last Packet ID sent in a control message.</dd>
            <dt >
#### <code class="Cm">client_id</code> {#client_id}
            </dt>
            <dd>MQTT client identifier for the connection.</dd>
            <dt >
#### <code class="Cm">clean_sess</code> {#clean_sess}
            </dt>
            <dd>MQTT clean session flag.</dd>
            <dt >
#### <code class="Cm">will_msg</code> {#will_msg}
            </dt>
            <dd>MQTT Will message sent in CONNECT frame.</dd>
            <dt >
#### <code class="Cm">exchange</code> {#exchange}
            </dt>
            <dd>Exchange to route MQTT messages configured in rabbitmq_mqtt application environment.</dd>
            <dt >
#### <code class="Cm">ssl_login_name</code> {#ssl_login_name}
            </dt>
            <dd>SSL peer cert auth name</dd>
            <dt >
#### <code class="Cm">retainer_pid</code> {#retainer_pid}
            </dt>
            <dd>Id of the Erlang process associated with retain storage for the connection.</dd>
            <dt >
#### <code class="Cm">user</code> {#user~4}
            </dt>
            <dd>Username associated with the connection.</dd>
            <dt >
#### <code class="Cm">vhost</code> {#vhost~3}
            </dt>
            <dd>Virtual host name with non-ASCII characters escaped as in C.</dd>
          </dl>
        </dd>
        <dt >
#### <code class="Cm">decommission_mqtt_node</code> {#decommission_mqtt_node}
        </dt>
        <dd>
          Before the plugin is disabled on a node, or a node removed from the cluster, it must be decommissioned.
          <p class="Pp">For example, this command will remove the node rabbit@stringer:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmqctl decommission_mqtt_node rabbit@stringer</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### STOMP plugin {#STOMP_plugin}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_stomp_connections</code> [<var class="Ar">stomp_connectioninfoitem</var>] {#list_stomp_connections}
        </dt>
        <dd>
          Similar to the <code class="Cm">list_connections</code> command, but returns fields that make sense for STOMP connections. <var class="Ar">stomp_connectioninfoitem</var> parameter is used to indicate which connection information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">stomp_connectioninfoitem</var> can take any value from the list that follows:
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">conn_name</code> {#conn_name~2}
            </dt>
            <dd>Readable name for the connection.</dd>
            <dt >
#### <code class="Cm">connection</code> {#connection~3}
            </dt>
            <dd>Id of the Erlang process associated with the internal amqp direct connection.</dd>
            <dt >
#### <code class="Cm">connection_state</code> {#connection_state~2}
            </dt>
            <dd>
              Connection state; one of:
              <ul class="Bl-bullet Bl-compact">
                <li>
running
</li>
                <li>
blocking
</li>
                <li>
blocked
</li>
              </ul>

            </dd>
            <dt >
#### <code class="Cm">session_id</code> {#session_id}
            </dt>
            <dd>STOMP protocol session identifier</dd>
            <dt >
#### <code class="Cm">channel</code> {#channel}
            </dt>
            <dd>AMQP channel associated with the connection</dd>
            <dt >
#### <code class="Cm">version</code> {#version~2}
            </dt>
            <dd>Negotiated STOMP protocol version for the connection.</dd>
            <dt >
#### <code class="Cm">implicit_connect</code> {#implicit_connect}
            </dt>
            <dd>Indicates if the connection was established using implicit connect (without CONNECT frame)</dd>
            <dt >
#### <code class="Cm">auth_login</code> {#auth_login}
            </dt>
            <dd>Effective username for the connection.</dd>
            <dt >
#### <code class="Cm">auth_mechanism</code> {#auth_mechanism~3}
            </dt>
            <dd>
              STOMP authorization mechanism. Can be one of:
              <ul class="Bl-bullet Bl-compact">
                <li>
config
</li>
                <li>
ssl
</li>
                <li>
stomp_headers
</li>
              </ul>

            </dd>
            <dt >
#### <code class="Cm">port</code> {#port~3}
            </dt>
            <dd>Server port.</dd>
            <dt >
#### <code class="Cm">host</code> {#host~4}
            </dt>
            <dd>Server hostname obtained via reverse DNS, or its IP address if reverse DNS failed or was not enabled.</dd>
            <dt >
#### <code class="Cm">peer_port</code> {#peer_port~3}
            </dt>
            <dd>Peer port.</dd>
            <dt >
#### <code class="Cm">peer_host</code> {#peer_host~3}
            </dt>
            <dd>Peer hostname obtained via reverse DNS, or its IP address if reverse DNS failed or was not enabled.</dd>
            <dt >
#### <code class="Cm">protocol</code> {#protocol~3}
            </dt>
            <dd>
              STOMP protocol version, which can be one of the following:
              <ul class="Bl-bullet Bl-compact">
                <li>
&lcub;'STOMP', 0}
</li>
                <li>
&lcub;'STOMP', 1}
</li>
                <li>
&lcub;'STOMP', 2}
</li>
              </ul>

            </dd>
            <dt >
#### <code class="Cm">channels</code> {#channels~3}
            </dt>
            <dd>The number of channels using the connection.</dd>
            <dt >
#### <code class="Cm">channel_max</code> {#channel_max~3}
            </dt>
            <dd>Maximum number of channels on this connection.</dd>
            <dt >
#### <code class="Cm">frame_max</code> {#frame_max~4}
            </dt>
            <dd>Maximum frame size (bytes).</dd>
            <dt >
#### <code class="Cm">client_properties</code> {#client_properties~3}
            </dt>
            <dd>Informational properties transmitted by the client during connection</dd>
            <dt >
#### <code class="Cm">ssl</code> {#ssl~4}
            </dt>
            <dd>Boolean indicating whether the connection is secured with SSL.</dd>
            <dt >
#### <code class="Cm">ssl_protocol</code> {#ssl_protocol~4}
            </dt>
            <dd>TLS protocol (e.g. "tlsv1").</dd>
            <dt >
#### <code class="Cm">ssl_key_exchange</code> {#ssl_key_exchange~4}
            </dt>
            <dd>TLS key exchange algorithm (e.g. "rsa").</dd>
            <dt >
#### <code class="Cm">ssl_cipher</code> {#ssl_cipher~4}
            </dt>
            <dd>TLS cipher algorithm (e.g. "aes_256_cbc").</dd>
            <dt >
#### <code class="Cm">ssl_hash</code> {#ssl_hash~4}
            </dt>
            <dd>SSL hash function (e.g. "sha").</dd>
          </dl>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Management agent plugin {#Management_agent_plugin}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">reset_stats_db</code> [<code class="Fl">--all</code>] {#reset_stats_db}
        </dt>
        <dd>
          Reset the management stats database for the RabbitMQ node.
          <dl class="Bl-tag">
            <dt >
#### <code class="Fl">--all</code> {#all~2}
            </dt>
            <dd>Reset the stats database for all nodes in the cluster.</dd>
          </dl>
        </dd>
      </dl>
    </section>
  </section>
  <section class="Sh">
## SEE ALSO {#SEE_ALSO}
    <p class="Pp"><a class="Xr" href="rabbitmq-diagnostics.8">rabbitmq-diagnostics(8)</a>, <a class="Xr" href="rabbitmq-plugins.8">rabbitmq-plugins(8)</a>, <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a>, <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a>, <a class="Xr" href="rabbitmq-streams.8">rabbitmq-streams(8)</a>, <a class="Xr" href="rabbitmq-upgrade.8">rabbitmq-upgrade(8)</a>, <a class="Xr" href="rabbitmq-service.8">rabbitmq-service(8)</a>, <a class="Xr" href="rabbitmq-env.conf.5">rabbitmq-env.conf(5)</a>, <a class="Xr" href="rabbitmq-echopid.8">rabbitmq-echopid(8)</a></p>
  </section>
  <section class="Sh">
## AUTHOR {#AUTHOR}
    <p class="Pp"><span class="An">The RabbitMQ Team</span> &lt;<a class="Mt" href="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</a>&gt;</p>
  </section>
</div>
