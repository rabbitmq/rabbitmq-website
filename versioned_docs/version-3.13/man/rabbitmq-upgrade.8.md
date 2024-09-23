<div class="manual-text">
  <section class="Sh">
## NAME {#NAME}
    <p class="Pp"><code class="Nm">rabbitmq-upgrade</code> — <span class="Nd">RabbitMQ installation upgrade tools</span></p>
  </section>
  <section class="Sh">
## SYNOPSIS {#SYNOPSIS}
    <table class="Nm">
      <tr>
        <td><code class="Nm">rabbitmq-upgrade</code></td>
        <td>[<code class="Fl">-q</code>] [<code class="Fl">-s</code>] [<code class="Fl">-l</code>] [<code class="Fl">-n</code> <var class="Ar">node</var>] [<code class="Fl">-t</code> <var class="Ar">timeout</var>] <var class="Ar">command</var> [<var class="Ar">command_options</var>]</td>
      </tr>
    </table>
  </section>
  <section class="Sh">
## DESCRIPTION {#DESCRIPTION}
    <p class="Pp"><code class="Nm">rabbitmq-upgrade</code> is a command line tool that provides commands used during the upgrade of RabbitMQ nodes. See the <a class="Lk" href="https://www.rabbitmq.com/docs/upgrade">RabbitMQ upgrade guide</a> to learn more about RabbitMQ installation upgrades.</p>
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
        <p class="Pp">Displays general help and commands supported by <code class="Nm">rabbitmq-upgrade</code>.</p>
      </dd>
      <dt >
### <code class="Cm">post_upgrade</code> {#post_upgrade}
      </dt>
      <dd>
        <p class="Pp">Runs post-upgrade tasks. In the current version, it performs the rebalance of mirrored and quorum queues across all nodes in the cluster.</p>
      </dd>
      <dt >
### <code class="Cm">await_online_quorum_plus_one</code> {#await_online_quorum_plus_one}
      </dt>
      <dd>
        <p class="Pp">Waits for all quorum queues to have an above minimum online quorum. This makes sure that no queues would lose their quorum if the target node is shut down.</p>
      </dd>
      <dt >
### <code class="Cm">drain</code> {#drain}
      </dt>
      <dd>
        <p class="Pp">Puts the node in maintenance mode. Such nodes will not serve any client traffic or considered for hosting any queue leader replicas.</p>
        <p class="Pp">To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/upgrade#maintenance-mode">RabbitMQ Upgrade guide</a></p>
      </dd>
      <dt >
### <code class="Cm">revive</code> {#revive}
      </dt>
      <dd>
        <p class="Pp">Puts the node out of maintenance and into regular operating mode. Such nodes will again serve client traffic and considered for queue leader replica placement.</p>
        <p class="Pp">To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/upgrade#maintenance-mode">RabbitMQ Upgrade guide</a></p>
      </dd>
    </dl>
  </section>
  <section class="Sh">
## SEE ALSO {#SEE_ALSO}
    <p class="Pp"><a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a>, <a class="Xr" href="rabbitmq-diagnostics.8">rabbitmq-diagnostics(8)</a>, <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a>, <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a>, <a class="Xr" href="rabbitmq-streams.8">rabbitmq-streams(8)</a>, <a class="Xr" href="rabbitmq-service.8">rabbitmq-service(8)</a>, <a class="Xr" href="rabbitmq-env.conf.5">rabbitmq-env.conf(5)</a>, <a class="Xr" href="rabbitmq-echopid.8">rabbitmq-echopid(8)</a></p>
  </section>
  <section class="Sh">
## AUTHOR {#AUTHOR}
    <p class="Pp"><span class="An">The RabbitMQ Team</span> &lt;<a class="Mt" href="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</a>&gt;</p>
  </section>
</div>
