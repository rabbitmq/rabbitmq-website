<div class="manual-text">
<section class="Sh">
<h2 class="Sh" id="NAME"><a class="permalink" href="#NAME">NAME</a></h2>
<code class="Nm">rabbitmq-queues</code> &#x2014;
<div class="Nd">RabbitMQ queue management tools</div>
</section>
<section class="Sh">
<h2 class="Sh" id="SYNOPSIS"><a class="permalink" href="#SYNOPSIS">SYNOPSIS</a></h2>
<table class="Nm">
  <tr>
    <td><code class="Nm">rabbitmq-queues</code></td>
    <td>[<code class="Fl">-q</code>] [<code class="Fl">-s</code>]
      [<code class="Fl">-l</code>] [<code class="Fl">-n</code>
      <var class="Ar">node</var>] [<code class="Fl">-t</code>
      <var class="Ar">timeout</var>] <var class="Ar">command</var>
      [<var class="Ar">command_options</var>]</td>
  </tr>
</table>
</section>
<section class="Sh">
<h2 class="Sh" id="DESCRIPTION"><a class="permalink" href="#DESCRIPTION">DESCRIPTION</a></h2>
<code class="Nm">rabbitmq-queues</code> is a command line tool that
  provides commands used to manage queues, mainly member handling for quorum queues. See the
  <a class="Lk" href="https://www.rabbitmq.com/quorum-queues.html">RabbitMQ quorum
  queues guide</a> and <a class="Lk" href="https://www.rabbitmq.com/ha.html">RabbitMQ highly available (mirrored) queues guide</a> to learn more about queue types in RabbitMQ.
</section>
<section class="Sh">
<h2 class="Sh" id="OPTIONS"><a class="permalink" href="#OPTIONS">OPTIONS</a></h2>
<dl class="Bl-tag">
  <dt><a class="permalink" href="#n"><code class="Fl" id="n">-n</code></a>
    <var class="Ar">node</var></dt>
  <dd>Default node is
      &quot;rabbit@<var class="Ar">target-hostname</var>&quot;, where
      <var class="Ar">target-hostname</var> is the local host. On a host named
      &quot;myserver.example.com&quot;, the node name will usually be
      &quot;rabbit@myserver&quot; (unless
      <code class="Ev">RABBITMQ_NODENAME</code> has been overridden). The output
      of &quot;hostname -s&quot; is usually the correct suffix to use after
      the &quot;@&quot; sign. See
      <a class="Xr" href="rabbitmq-server.8.html">rabbitmq-server(8)</a> for
      details of configuring a RabbitMQ node.</dd>
  <dt><a class="permalink" href="#q"><code class="Fl" id="q">-q</code></a>,
    <code class="Fl">--quiet</code></dt>
  <dd>Quiet output mode is selected. Informational messages are reduced when
      quiet mode is in effect.</dd>
  <dt><a class="permalink" href="#s"><code class="Fl" id="s">-s</code></a>,
    <code class="Fl">--silent</code></dt>
  <dd>Silent output mode is selected. Informational messages are reduced and
      table headers are suppressed when silent mode is in effect.</dd>
  <dt><a class="permalink" href="#t"><code class="Fl" id="t">-t</code></a>
    <var class="Ar">timeout</var>, <code class="Fl">--timeout</code>
    <var class="Ar">timeout</var></dt>
  <dd>Operation timeout in seconds. Not all commands support timeouts. Default
      is <code class="Cm">infinity</code>.</dd>
  <dt><a class="permalink" href="#l"><code class="Fl" id="l">-l</code></a>,
    <code class="Fl">--longnames</code></dt>
  <dd>Must be specified when the cluster is configured to use long (FQDN) node
      names. To learn more, see the
      <a class="Lk" href="https://www.rabbitmq.com/clustering.html">RabbitMQ
      Clustering guide</a></dd>
  <dt><a class="permalink" href="#-erlang-cookie"><code class="Fl" id="-erlang-cookie">--erlang-cookie</code></a>
    <var class="Ar">cookie</var></dt>
  <dd>Shared secret to use to authenticate to the target node. Prefer using a
      local file or the <code class="Ev">RABBITMQ_ERLANG_COOKIE</code>
      environment variable instead of specifying this option on the command
      line. To learn more, see the
      <a class="Lk" href="https://www.rabbitmq.com/cli.html">RabbitMQ CLI Tools
      guide</a></dd>
</dl>
</section>
<section class="Sh">
<h2 class="Sh" id="COMMANDS"><a class="permalink" href="#COMMANDS">COMMANDS</a></h2>
<dl class="Bl-tag">
  <dt><a class="permalink" href="#help"><code class="Cm" id="help">help</code></a></dt>
  <dd>
    <p class="Pp">Displays general help and commands supported by
        <code class="Nm">rabbitmq-queues</code>.</p>
  </dd>
</dl>
<section class="Ss">
<h3 class="Ss" id="Cluster"><a class="permalink" href="#Cluster">Cluster</a></h3>
<dl class="Bl-tag">
  <dt><a class="permalink" href="#"><code class="Cm" id="grow">grow</code></a></dt>
  <dd>
    <p class="Pp">Grows quorum queue clusters by adding a member (replica) to all or half of matching quorum queues on the given node.</p>
  </dd>
  <dt><a class="permalink" href="#"><code class="Cm" id="rebalance">rebalance</code></a></dt>
  <dd>
    <p class="Pp">Rebalances queues.</p>
  </dd>
  <dt><a class="permalink" href="#"><code class="Cm" id="shrink">shrink</code></a></dt>
  <dd>
    <p class="Pp">Shrinks quorum queue clusters by removing any members (replicas) on the given node.</p>
  </dd>
</dl>
</section>
<h3 class="Ss" id="Replication"><a class="permalink" href="#Replication">Replication</a></h3>
<dl class="Bl-tag">
  <dt><a class="permalink" href="#"><code class="Cm" id="add_member">add_member</code></a></dt>
  <dd>
    <p class="Pp">Adds a quorum queue member (replica) for a queue on the given node.</p>
  </dd>
  <dt><a class="permalink" href="#"><code class="Cm" id="delete_member">delete_member</code></a></dt>
  <dd>
    <p class="Pp">Removes a quorum queue member (replica) for a queue on the given node.</p>
  </dd>
  <dt><a class="permalink" href="#"><code class="Cm" id="quorum_status">quorum_status</code></a></dt>
</dl>
</section>
<h3 class="Ss" id="Queues"><a class="permalink" href="#Queues">Cluster</a></h3>
<dl class="Bl-tag">
  <dd>
    <p class="Pp">Displays quorum status of a quorum queue.</p>
  </dd>
</dl>
</section>
</section>
</div>
