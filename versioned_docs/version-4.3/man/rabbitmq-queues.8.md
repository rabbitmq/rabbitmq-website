<div class="manual-text">
  <section class="Sh">
## NAME {#NAME}
    <p class="Pp"><code class="Nm">rabbitmq-queues</code> — <span class="Nd">RabbitMQ queue management tools</span></p>
  </section>
  <section class="Sh">
## SYNOPSIS {#SYNOPSIS}
    <table class="Nm">
      <tr>
        <td><code class="Nm">rabbitmq-queues</code></td>
        <td>[<code class="Fl">-q</code>] [<code class="Fl">-s</code>] [<code class="Fl">-l</code>] [<code class="Fl">-n</code> <var class="Ar">node</var>] [<code class="Fl">-t</code> <var class="Ar">timeout</var>] <var class="Ar">command</var> [<var class="Ar">command_options</var>]</td>
      </tr>
    </table>
  </section>
  <section class="Sh">
## DESCRIPTION {#DESCRIPTION}
    <p class="Pp"><code class="Nm">rabbitmq-queues</code> is a command line tool that provides commands used to manage queues, for example, grow, shrink or rebalance replicas of replicated queue types. See the <a class="Lk" href="https://www.rabbitmq.com/docs/quorum-queues">RabbitMQ quorum queues guide</a> and the general <a class="Lk" href="https://www.rabbitmq.com/docs/queues">RabbitMQ queues guide</a> to learn more about queue types in RabbitMQ.</p>
  </section>
  <section class="Sh">
## OPTIONS {#OPTIONS}
    <dl class="Bl-tag">
      <dt >
### <code class="Fl">-n</code> <var class="Ar">node</var> {#n}
      </dt>
      <dd>
        Default node is "rabbit@<var class="Ar">target-hostname</var>", where <var class="Ar">target-hostname</var> is the local host. On a host named "myserver.example.com", the node name will usually be "rabbit@myserver" (unless <code class="Ev">RABBITMQ_NODENAME</code> has been overridden). The output of "hostname -s" is usually the correct suffix to use after the "@" sign. See <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a> for details of configuring a RabbitMQ node.
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
### <code class="Fl">-t</code> <var class="Ar">timeout</var>, <code class="Fl">--timeout</code> <var class="Ar">timeout</var> {#t}
      </dt>
      <dd>Operation timeout in seconds. Not all commands support timeouts. Default is <code class="Cm">infinity</code>.</dd>
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
### <code class="Cm">help</code> {#help}
      </dt>
      <dd>
        <p class="Pp">Displays general help and commands supported by <code class="Nm">rabbitmq-queues</code>.</p>
      </dd>
    </dl>
    <section class="Ss">
### Cluster {#Cluster}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">grow</code> <var class="Ar">node</var> <var class="Ar">selector</var> <code class="Fl">--vhost-pattern</code> <var class="Ar">pattern</var> <code class="Fl">--queue-pattern</code> <var class="Ar">pattern</var> <code class="Fl">--errors-only</code> {#grow}
        </dt>
        <dd>
          <p class="Pp">Adds a new replica on the given node for all or a half of matching quorum queues.</p>
          <p class="Pp">Supported <var class="Ar">selector</var> values are:</p>
          <dl class="Bl-tag">
            <dt >
#### <b class="Sy">all</b> {#all}
            </dt>
            <dd>Selects all quorum queues</dd>
            <dt >
#### <b class="Sy">even</b> {#even}
            </dt>
            <dd>Selects quorum queues with an even number of replicas</dd>
          </dl>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-queues grow "rabbit@newhost" "all" --vhost-pattern "a-vhost" --queue-pattern ".*"</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">rebalance</code> <var class="Ar">type</var> <code class="Fl">--vhost-pattern</code> <var class="Ar">pattern</var> <code class="Fl">--queue-pattern</code> <var class="Ar">pattern</var> {#rebalance}
        </dt>
        <dd>
          <p class="Pp">Rebalances queue leader replicas across cluster nodes.</p>
          <p class="Pp">Supported <var class="Ar">type</var> values are:</p>
          <dl class="Bl-tag">
            <dt >
#### <b class="Sy">all</b> {#all~2}
            </dt>
            <dd>All queue types</dd>
            <dt >
#### <b class="Sy">quorum</b> {#quorum}
            </dt>
            <dd>Only quorum queues</dd>
            <dt >
#### <b class="Sy">classic</b> {#classic}
            </dt>
            <dd>Only classic queues</dd>
            <dt >
#### <b class="Sy">stream</b> {#stream}
            </dt>
            <dd>Only streams</dd>
          </dl>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-queues rebalance "all" --vhost-pattern "a-vhost" --queue-pattern ".*"</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">shrink</code> <var class="Ar">node</var> {#shrink}
        </dt>
        <dd>
          <p class="Pp">Shrinks quorum queue clusters by removing any members (replicas) on the given node.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-queues shrink "rabbit@decomissioned-node"</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Replication {#Replication}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">add_member</code> <var class="Ar">queue</var> <var class="Ar">node</var> <code class="Fl">--vhost</code> <var class="Ar">virtual-host</var> {#add_member}
        </dt>
        <dd>
          <p class="Pp">Adds a quorum queue member (replica) on the given node.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-queues add_member --vhost "a-vhost" "a-queue" "rabbit@new-node"</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">delete_member</code> <var class="Ar">queue</var> <var class="Ar">node</var> <code class="Fl">--vhost</code> <var class="Ar">virtual-host</var> {#delete_member}
        </dt>
        <dd>
          <p class="Pp">Removes a quorum queue member (replica) on the given node.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-queues delete_member --vhost "a-vhost" "a-queue" "rabbit@decomissioned-node"</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Queues {#Queues}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">quorum_status</code> <var class="Ar">queue</var> <code class="Fl">--vhost</code> <var class="Ar">virtual-host</var> {#quorum_status}
        </dt>
        <dd>
          <p class="Pp">Displays quorum status of a quorum queue.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-queues quorum_status --vhost "a-vhost" "a-queue"</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">peek</code> <var class="Ar">queue</var> <var class="Ar">position</var> <code class="Fl">--vhost</code> <var class="Ar">virtual-host</var> <code class="Fl">--timeout</code> {#peek}
        </dt>
        <dd>
          <p class="Pp">Displays the details of a message at the given position in the queue. This command is currently only supported by quorum queues.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-queues peek --vhost "a-vhost" "a-queue" "1"</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_if_cluster_has_classic_queue_mirroring_policy</code> {#check_if_cluster_has_classic_queue_mirroring_policy}
        </dt>
        <dd>
          <p class="Pp">Health check that exits with a non-zero code if there are policies in the cluster that enable classic queue mirroring. Classic queue mirroring has been deprecated since 2021 and was completely removed in the RabbitMQ 4.0 development cycle.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-queues check_if_cluster_has_classic_queue_mirroring_policy</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_if_node_is_quorum_critical</code> {#check_if_node_is_quorum_critical}
        </dt>
        <dd>
          <p class="Pp">Health check that exits with a non-zero code if there are queues with minimum online quorum (queues that would lose their quorum if the target node is shut down).</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-queues check_if_node_is_quorum_critical</code>
          </div>
        </dd>
      </dl>
    </section>
  </section>
  <section class="Sh">
## SEE ALSO {#SEE_ALSO}
    <p class="Pp"><a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a>, <a class="Xr" href="rabbitmq-diagnostics.8">rabbitmq-diagnostics(8)</a>, <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a>, <a class="Xr" href="rabbitmq-streams.8">rabbitmq-streams(8)</a>, <a class="Xr" href="rabbitmq-upgrade.8">rabbitmq-upgrade(8)</a>, <a class="Xr" href="rabbitmq-service.8">rabbitmq-service(8)</a>, <a class="Xr" href="rabbitmq-env.conf.5">rabbitmq-env.conf(5)</a>, <a class="Xr" href="rabbitmq-echopid.8">rabbitmq-echopid(8)</a></p>
  </section>
  <section class="Sh">
## AUTHOR {#AUTHOR}
    <p class="Pp"><span class="An">The RabbitMQ Team</span> &lt;<a class="Mt" href="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</a>&gt;</p>
  </section>
</div>
