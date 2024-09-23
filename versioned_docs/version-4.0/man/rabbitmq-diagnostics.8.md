<div class="manual-text">
  <section class="Sh">
## NAME {#NAME}
    <p class="Pp"><code class="Nm">rabbitmq-diagnostics</code> — <span class="Nd">RabbitMQ diagnostics, monitoring and health checks tools</span></p>
  </section>
  <section class="Sh">
## SYNOPSIS {#SYNOPSIS}
    <table class="Nm">
      <tr>
        <td><code class="Nm">rabbitmq-diagnostics</code></td>
        <td>[<code class="Fl">-q</code>] [<code class="Fl">-s</code>] [<code class="Fl">-l</code>] [<code class="Fl">-n</code> <var class="Ar">node</var>] [<code class="Fl">-t</code> <var class="Ar">timeout</var>] <var class="Ar">command</var> [<var class="Ar">command_options</var>]</td>
      </tr>
    </table>
  </section>
  <section class="Sh">
## DESCRIPTION {#DESCRIPTION}
    <p class="Pp"><code class="Nm">rabbitmq-diagnostics</code> is a command line tool that provides commands used for diagnostics, monitoring and health checks of RabbitMQ nodes. See the <a class="Lk" href="https://www.rabbitmq.com/docs">RabbitMQ documentation guides</a> to learn more about RabbitMQ diagnostics, monitoring and health checks.</p>
    <p class="Pp"><code class="Nm">rabbitmq-diagnostics</code> allows the operator to inspect node and cluster state. A number of health checks are available to be used interactively and by monitoring tools.</p>
    <p class="Pp"></p>
    <p class="Pp">By default if it is not possible to connect to and authenticate with the target node (for example if it is stopped), the operation will fail. To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/monitoring">RabbitMQ Monitoring guide</a></p>
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
    <p class="Pp">Most commands provided by <code class="Nm">rabbitmq-diagnostics</code> inspect node and cluster state or perform health checks.</p>
    <p class="Pp">Commands that list topology entities (e.g. queues) use tab as column delimiter. These commands and their arguments are delegated to rabbitmqctl(8).</p>
    <p class="Pp">Some commands ( <code class="Cm">list_queues</code>, <code class="Cm">list_exchanges</code>, <code class="Cm">list_bindings</code> and <code class="Cm">list_consumers</code>) accept an optional <var class="Ar">vhost</var> parameter.</p>
    <p class="Pp">The <code class="Cm">list_queues</code>, <code class="Cm">list_exchanges</code> and <code class="Cm">list_bindings</code> commands accept an optional virtual host parameter for which to display results. The default value is "/".</p>
    <section class="Ss">
### Help {#Help}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">help</code> [<code class="Fl">-l</code>] [<var class="Ar">command_name</var>] {#help}
        </dt>
        <dd>
          <p class="Pp">Prints usage for all available commands.</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Fl">-l</code>, <code class="Fl">--list-commands</code> {#l~2}
            </dt>
            <dd>List command usages only, without parameter explanation.</dd>
            <dt><var class="Ar">command_name</var></dt>
            <dd>Prints usage for the specified command.</dd>
          </dl>
        </dd>
        <dt >
#### <code class="Cm">version</code> {#version}
        </dt>
        <dd>
          <p class="Pp">Displays CLI tools version</p>
        </dd>
      </dl>
      <dl class="Bl-tag"></dl>
    </section>
    <section class="Ss">
### Nodes {#Nodes}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">wait</code> {#wait}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">wait</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Cluster {#Cluster}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">cluster_status</code> {#cluster_status}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">cluster_status</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Users {#Users}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_users</code> {#list_users}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_users</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Access Control {#Access_Control}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_permissions</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_permissions}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_permissions</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_topic_permissions</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_topic_permissions}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_topic_permissions</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_user_permissions</code> <var class="Ar">username</var> {#list_user_permissions}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_user_permissions</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_user_topic_permissions</code> <var class="Ar">username</var> {#list_user_topic_permissions}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_user_topic_permissions</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_vhosts</code> [<var class="Ar">vhostinfoitem ...</var>] {#list_vhosts}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_vhosts</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Monitoring, observability and health checks {#Monitoring,_observability_and_health_checks}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">alarms</code> {#alarms}
        </dt>
        <dd>
          <p class="Pp">Lists resource alarms, if any, in the cluster.</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/alarms">RabbitMQ Resource Alarms guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics alarms</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">certificates</code> {#certificates}
        </dt>
        <dd>
          <p class="Pp">Displays the node certificates for every listener on target node that is configured to use TLS.</p>
          <p class="Pp">Example:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics certificates</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_alarms</code> {#check_alarms}
        </dt>
        <dd>
          <p class="Pp">Health check that fails (returns with a non-zero code) if there are alarms in effect on any of the cluster nodes.</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/alarms">RabbitMQ Resource Alarms guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics check_alarms</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_certificate_expiration</code> [<code class="Fl">--unit</code> <var class="Ar">time_unit</var>] [<code class="Fl">--within</code> <var class="Ar">seconds</var>] {#check_certificate_expiration}
        </dt>
        <dd>
          <p class="Pp">Checks the expiration date on the certificates for every listener on target node that is configured to use TLS. Supported time units are:</p>
          <ul class="Bl-bullet">
            <li>
days
</li>
            <li>
weeks
</li>
            <li>
months
</li>
            <li>
years
</li>
          </ul>

          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics check_certificate_expiration --unit weeks --within 6</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_local_alarms</code> {#check_local_alarms}
        </dt>
        <dd>
          <p class="Pp">Health check that fails (returns with a non-zero code) if there are alarms in effect on the target node.</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/alarms">RabbitMQ Resource Alarms guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics check_local_alarms</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_port_connectivity</code> {#check_port_connectivity}
        </dt>
        <dd>
          <p class="Pp">Health check that fails (returns with a non-zero code) if any listener ports on the target node cannot accept a new TCP connection opened by <code class="Nm">rabbitmq-diagnostics</code></p>
          <p class="Pp">The check only validates if a new TCP connection is accepted. It does not perform messaging protocol handshake or authenticate.</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/networking">RabbitMQ Networking guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics check_port_connectivity</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_port_listener</code> <var class="Ar">port</var> {#check_port_listener}
        </dt>
        <dd>
          <p class="Pp">Health check that fails (returns with a non-zero code) if the target node is not listening on the specified port (there is no listener that uses that port).</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/networking">RabbitMQ Networking guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics check_port_listener 5672</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_protocol_listener</code> <var class="Ar">protocol</var> {#check_protocol_listener}
        </dt>
        <dd>
          <p class="Pp">Health check that fails (returns with a non-zero code) if the target node does not have a listener for the specified protocol.</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/networking">RabbitMQ Networking guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics check_protocol_listener mqtt</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_running</code> {#check_running}
        </dt>
        <dd>
          <p class="Pp">Health check that fails (returns with a non-zero code) if the RabbitMQ application is not running on the target node.</p>
          <p class="Pp">If <code class="Cm">rabbitmqctl(8)</code> was used to stop the application, this check will fail.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics check_running</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">check_virtual_hosts</code> {#check_virtual_hosts}
        </dt>
        <dd>
          <p class="Pp">Health check that checks if all vhosts are running in the target node</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics check_virtual_hosts --timeout 60</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">cipher_suites</code> {#cipher_suites}
        </dt>
        <dd>
          <p class="Pp">Lists cipher suites enabled by default. To list all available cipher suites, add the --all argument.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics cipher_suites --format openssl --all</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">command_line_arguments</code> {#command_line_arguments}
        </dt>
        <dd>
          <p class="Pp">Displays target node's command-line arguments and flags as reported by the runtime.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics command_line_arguments -n rabbit@hostname</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">consume_event_stream</code> [<code class="Fl">--duration</code> <var class="Ar">seconds</var> | <code class="Fl">-d</code> <var class="Ar">seconds</var>] [<code class="Fl">--pattern</code> <var class="Ar">pattern</var>] [<code class="Fl">--timeout</code> <var class="Ar">milliseconds</var>] {#consume_event_stream}
        </dt>
        <dd>
          <p class="Pp">Streams internal events from a running node. Output is jq-compatible.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics consume_event_stream -n rabbit@hostname --duration 20 --pattern queue_.*</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">discover_peers</code> {#discover_peers}
        </dt>
        <dd>
          <p class="Pp">Runs a peer discovery on the target node and prints the discovered nodes, if any.</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/cluster-formation">RabbitMQ Cluster Formation guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics discover_peers --timeout 60</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">environment</code> {#environment}
        </dt>
        <dd>
          See <code class="Cm">environment</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a>
        </dd>
        <dt >
#### <code class="Cm">erlang_cookie_hash</code> {#erlang_cookie_hash}
        </dt>
        <dd>
          <p class="Pp">Outputs a hashed value of the shared secret used by the target node to authenticate CLI tools and peers. The value can be compared with the hash found in error messages of CLI tools.</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/clustering#erlang-cookie">RabbitMQ Clustering guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics erlang_cookie_hash -q</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">erlang_version</code> {#erlang_version}
        </dt>
        <dd>
          <p class="Pp">Reports target node's Erlang/OTP version.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics erlang_version -q</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">is_booting</code> {#is_booting}
        </dt>
        <dd>
          <p class="Pp">Reports if RabbitMQ application is currently booting (not booted/running or stopped) on the target node.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics is_booting</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">is_running</code> {#is_running}
        </dt>
        <dd>
          <p class="Pp">Reports if RabbitMQ application is fully booted and running (that is, not stopped) on the target node.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics is_running</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_bindings</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<var class="Ar">bindinginfoitem ...</var>] {#list_bindings}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_bindings</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_channels</code> [<var class="Ar">channelinfoitem ...</var>] {#list_channels}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_channels</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_ciphers</code> {#list_ciphers}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_ciphers</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_connections</code> [<var class="Ar">connectioninfoitem ...</var>] {#list_connections}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_connections</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_consumers</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_consumers}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_consumers</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_exchanges</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<var class="Ar">exchangeinfoitem ...</var>] {#list_exchanges}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_exchanges</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_hashes</code> {#list_hashes}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_hashes</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_queues</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<code class="Fl">--offline</code> | <code class="Fl">--online</code> | <code class="Fl">--local</code>] [<var class="Ar">queueinfoitem ...</var>] {#list_queues}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_queues</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_unresponsive_queues</code> [<code class="Fl">--local</code>] [<code class="Fl">--queue-timeout</code> <var class="Ar">milliseconds</var>] [<var class="Ar">column ...</var>] [<code class="Fl">--no-table-headers</code>] {#list_unresponsive_queues}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_unresponsive_queues</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">listeners</code> {#listeners}
        </dt>
        <dd>
          <p class="Pp">Lists listeners (bound sockets) on this node. Use this to inspect what protocols and ports the node is listening on for client, CLI tool and peer connections.</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/networking">RabbitMQ Networking guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics listeners</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">log_tail</code> [<code class="Fl">--number</code> <var class="Ar">number</var> | <code class="Fl">-N</code> <var class="Ar">number</var> [<code class="Fl">--timeout</code> <var class="Ar">milliseconds</var>] {#log_tail}
          Prints the last N lines of the log on the node<br/>
          <br/>
          <br/>
          Example:<br/>
          <br/>
        </dt>
        <dd>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics log_tail --number 100</code>
          </div>
]
        </dd>
        <dd >&nbsp;</dd>
        <dt >
#### <code class="Cm">log_tail_stream</code> [<code class="Fl">--duration</code> <var class="Ar">seconds</var> | <code class="Fl">-d</code> <var class="Ar">seconds</var>] [<code class="Fl">--timeout</code> <var class="Ar">milliseconds</var>] {#log_tail_stream}
        </dt>
        <dd>
          <p class="Pp">Streams logs from a running node for a period of time</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics log_tail_stream --duration 60</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">maybe_stuck</code> {#maybe_stuck}
        </dt>
        <dd>
          <p class="Pp">Periodically samples stack traces of all Erlang processes ("lightweight threads") on the node. Reports the processes for which stack trace samples are identical.</p>
          <p class="Pp">Identical samples may indicate that the process is not making any progress but is not necessarily an indication of a problem.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics maybe_stuck -q</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">memory_breakdown</code> [<code class="Fl">--unit</code> <var class="Ar">memory_unit</var>] {#memory_breakdown}
        </dt>
        <dd>
          <p class="Pp">Displays node's memory usage by category. Supported memory units are:</p>
          <ul class="Bl-bullet">
            <li>
bytes
</li>
            <li>
megabytes
</li>
            <li>
gigabytes
</li>
            <li>
terabytes
</li>
          </ul>

          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/memory-use">RabbitMQ Memory Use guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics memory_breakdown --unit gigabytes</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">observer</code> [<code class="Fl">--interval</code> <var class="Ar">seconds</var>] {#observer}
        </dt>
        <dd>
          <p class="Pp">Starts a CLI observer interface on the target node</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics observer --interval 10</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">ping</code> {#ping}
        </dt>
        <dd>
          <p class="Pp">Most basic health check. Succeeds if target node (runtime) is running and <code class="Nm">rabbitmq-diagnostics</code> can authenticate with it successfully.</p>
        </dd>
        <dt >
#### <code class="Cm">report</code> {#report}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">report</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">runtime_thread_stats</code> [<code class="Fl">--sample-interval</code> <var class="Ar">interval</var>] {#runtime_thread_stats}
        </dt>
        <dd>
          <p class="Pp">Performs sampling of runtime (kernel) threads' activity for <var class="Ar">interval</var> seconds and reports it.</p>
          <p class="Pp">For this command to work, Erlang/OTP on the target node must be compiled with microstate accounting support and have the runtime_tools package available.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics runtime_thread_stats --sample-interval 15</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">schema_info</code> [<code class="Fl">--no_table_headers</code>] [<var class="Ar">column ...</var>] [<code class="Fl">--timeout</code> <var class="Ar">milliseconds</var>] {#schema_info}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">schema_info</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">server_version</code> {#server_version}
        </dt>
        <dd>
          <p class="Pp">Reports target node's version.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics server_version -q</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">status</code> {#status}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">status</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">tls_versions</code> {#tls_versions}
        </dt>
        <dd>
          <p class="Pp">Lists all TLS versions supported by the runtime on the target node. Note that RabbitMQ can be configured to only accept a subset of those versions, for example, SSLv3 is deactivated by default.</p>
          <p class="Pp">See <a class="Lk" href="https://www.rabbitmq.com/docs/ssl">RabbitMQ TLS guide</a> to learn more.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics tls_versions -q</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Parameters {#Parameters}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_global_parameters</code> {#list_global_parameters}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_global_parameters</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_parameters</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_parameters}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_parameters</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Policies {#Policies}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_operator_policies</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_operator_policies}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_operator_policies</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">list_policies</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] {#list_policies}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_policies</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Virtual hosts {#Virtual_hosts}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_vhost_limits</code> [<code class="Fl">--vhost</code> <var class="Ar">vhost</var>] [<code class="Fl">--global</code>] [<code class="Fl">--no-table-headers</code>] {#list_vhost_limits}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_vhost_limits</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Node configuration {#Node_configuration}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">log_location</code> [<code class="Fl">--all</code> | <code class="Fl">-a</code>] [<code class="Fl">--timeout</code> <var class="Ar">milliseconds</var>] {#log_location}
        </dt>
        <dd>
          <p class="Pp">Shows log file location(s) on target node</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-diagnostics log_location -a</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Feature flags {#Feature_flags}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_feature_flags</code> [<var class="Ar">column ...</var>] [<code class="Fl">--timeout</code> <var class="Ar">milliseconds</var>] {#list_feature_flags}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">list_feature_flags</code> in <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Queues {#Queues}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">quorum_status</code> <var class="Ar">queue</var> [<code class="Fl">--vhost</code> <var class="Ar">vhost</var>] {#quorum_status}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">quorum_status</code> in <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">check_if_cluster_has_classic_queue_mirroring_policy</code> {#check_if_cluster_has_classic_queue_mirroring_policy}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">check_if_cluster_has_classic_queue_mirroring_policy</code> in <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a></p>
        </dd>
        <dt >
#### <code class="Cm">check_if_node_is_quorum_critical</code> {#check_if_node_is_quorum_critical}
        </dt>
        <dd>
          <p class="Pp">See <code class="Cm">check_if_node_is_quorum_critical</code> in <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a></p>
        </dd>
      </dl>
    </section>
  </section>
  <section class="Sh">
## SEE ALSO {#SEE_ALSO}
    <p class="Pp"><a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a>, <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a>, <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a>, <a class="Xr" href="rabbitmq-streams.8">rabbitmq-streams(8)</a>, <a class="Xr" href="rabbitmq-upgrade.8">rabbitmq-upgrade(8)</a>, <a class="Xr" href="rabbitmq-service.8">rabbitmq-service(8)</a>, <a class="Xr" href="rabbitmq-env.conf.5">rabbitmq-env.conf(5)</a>, <a class="Xr" href="rabbitmq-echopid.8">rabbitmq-echopid(8)</a></p>
  </section>
  <section class="Sh">
## AUTHOR {#AUTHOR}
    <p class="Pp"><span class="An">The RabbitMQ Team</span> &lt;<a class="Mt" href="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</a>&gt;</p>
  </section>
</div>
