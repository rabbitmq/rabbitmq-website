<div class="manual-text">
  <section class="Sh">
## NAME {#NAME}
    <p class="Pp"><code class="Nm">rabbitmq-streams</code> — <span class="Nd">RabbitMQ stream management tools</span></p>
  </section>
  <section class="Sh">
## SYNOPSIS {#SYNOPSIS}
    <table class="Nm">
      <tr>
        <td><code class="Nm">rabbitmq-streams</code></td>
        <td>[<code class="Fl">-q</code>] [<code class="Fl">-s</code>] [<code class="Fl">-l</code>] [<code class="Fl">-n</code> <var class="Ar">node</var>] [<code class="Fl">-t</code> <var class="Ar">timeout</var>] <var class="Ar">command</var> [<var class="Ar">command_options</var>]</td>
      </tr>
    </table>
  </section>
  <section class="Sh">
## DESCRIPTION {#DESCRIPTION}
    <p class="Pp"><code class="Nm">rabbitmq-streams</code> is a command line tool that provides commands used to manage streams, for example, add or delete stream replicas. See the <a class="Lk" href="https://www.rabbitmq.com/docs/streams">RabbitMQ streams overview</a>.</p>
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
        <p class="Pp">Displays general help and commands supported by <code class="Nm">rabbitmq-streams</code>.</p>
      </dd>
    </dl>
    <section class="Ss">
### Replication {#Replication}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">add_replica</code> <var class="Ar">queue</var> <var class="Ar">node</var> <code class="Fl">--vhost</code> <var class="Ar">virtual-host</var> {#add_replica}
        </dt>
        <dd>
          <p class="Pp">Adds a stream replica on the given node.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-streams add_replica --vhost "a-vhost" "a-queue" "rabbit@new-node"</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">delete_replica</code> <var class="Ar">queue</var> <var class="Ar">node</var> <code class="Fl">--vhost</code> <var class="Ar">virtual-host</var> {#delete_replica}
        </dt>
        <dd>
          <p class="Pp">Removes a stream replica on the given node.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-streams delete_replica --vhost "a-vhost" "a-queue" "rabbit@decomissioned-node"</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Monitoring, observability and health checks {#Monitoring,_observability_and_health_checks}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">stream_status</code> <var class="Ar">stream</var> <code class="Fl">--vhost</code> <var class="Ar">virtual-host</var> {#stream_status}
        </dt>
        <dd>
          <p class="Pp">Displays the status of a stream.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-streams stream_status --vhost "a-vhost" "a-stream"</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">restart_stream</code> <var class="Ar">stream</var> <code class="Fl">--vhost</code> <var class="Ar">virtual-host</var> <code class="Fl">---preferred-leader-node</code> <var class="Ar">node</var> {#restart_stream}
        </dt>
        <dd>
          <p class="Pp">Restarts a stream including all of it's replicas. The optional preferred node flag instructs the command to try to place the leader on a specific node during the restart.</p>
          <p class="Pp">Example:</p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-streams restart_stream --vhost "a-vhost" "a-stream" --preferred-leader-node "node"</code>
          </div>
        </dd>
      </dl>
    </section>
    <section class="Ss">
### Stream plugin {#Stream_plugin}
      <dl class="Bl-tag">
        <dt >
#### <code class="Cm">list_stream_connections</code> [<var class="Ar">connectioninfoitem ...</var>] {#list_stream_connections}
        </dt>
        <dd>
          <p class="Pp">Returns stream protocol connection statistics.</p>
          <p class="Pp">The <var class="Ar">connectioninfoitem</var> parameter is used to indicate which connection information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">connectioninfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt >
#### <code class="Cm">auth_mechanism</code> {#auth_mechanism}
            </dt>
            <dd>SASL authentication mechanism used, such as "PLAIN".</dd>
            <dt >
#### <code class="Cm">client_properties</code> {#client_properties}
            </dt>
            <dd>Informational properties transmitted by the client during connection establishment.</dd>
            <dt >
#### <code class="Cm">conn_name</code> {#conn_name}
            </dt>
            <dd>Readable name for the connection.</dd>
            <dt >
#### <code class="Cm">connected_at</code> {#connected_at}
            </dt>
            <dd>Date and time this connection was established, as timestamp.</dd>
            <dt >
#### <code class="Cm">connection_state</code> {#connection_state}
            </dt>
            <dd>
              Connection state; one of:
              <ul class="Bl-bullet Bl-compact">
                <li>
running
</li>
                <li>
blocked
</li>
              </ul>

            </dd>
            <dt >
#### <code class="Cm">frame_max</code> {#frame_max}
            </dt>
            <dd>Maximum frame size (bytes).</dd>
            <dt >
#### <code class="Cm">heartbeat</code> {#heartbeat}
            </dt>
            <dd>Negotiated heartbeat interval, in seconds.</dd>
            <dt >
#### <code class="Cm">host</code> {#host}
            </dt>
            <dd>Server hostname obtained via reverse DNS, or its IP address if reverse DNS failed or was disabled.</dd>
            <dt >
#### <code class="Cm">peer_cert_issuer</code> {#peer_cert_issuer}
            </dt>
            <dd>The issuer of the peer's SSL certificate, in RFC4514 form.</dd>
            <dt >
#### <code class="Cm">peer_cert_subject</code> {#peer_cert_subject}
            </dt>
            <dd>The subject of the peer's SSL certificate, in RFC4514 form.</dd>
            <dt >
#### <code class="Cm">peer_cert_validity</code> {#peer_cert_validity}
            </dt>
            <dd>The period for which the peer's SSL certificate is valid.</dd>
            <dt >
#### <code class="Cm">peer_host</code> {#peer_host}
            </dt>
            <dd>Peer hostname obtained via reverse DNS, or its IP address if reverse DNS failed or was not enabled.</dd>
            <dt >
#### <code class="Cm">peer_port</code> {#peer_port}
            </dt>
            <dd>Peer port.</dd>
            <dt >
#### <code class="Cm">port</code> {#port}
            </dt>
            <dd>Server port.</dd>
            <dt >
#### <code class="Cm">ssl</code> {#ssl}
            </dt>
            <dd>Boolean indicating whether the connection is secured with SSL.</dd>
            <dt >
#### <code class="Cm">ssl_cipher</code> {#ssl_cipher}
            </dt>
            <dd>SSL cipher algorithm (e.g. "aes_256_cbc").</dd>
            <dt >
#### <code class="Cm">ssl_hash</code> {#ssl_hash}
            </dt>
            <dd>SSL hash function (e.g. "sha").</dd>
            <dt >
#### <code class="Cm">ssl_key_exchange</code> {#ssl_key_exchange}
            </dt>
            <dd>SSL key exchange algorithm (e.g. "rsa").</dd>
            <dt >
#### <code class="Cm">ssl_protocol</code> {#ssl_protocol}
            </dt>
            <dd>SSL protocol (e.g. "tlsv1").</dd>
            <dt >
#### <code class="Cm">subscriptions</code> {#subscriptions}
            </dt>
            <dd>Number of subscriptions (consumers) on the connection.</dd>
            <dt >
#### <code class="Cm">user</code> {#user}
            </dt>
            <dd>Username associated with the connection.</dd>
            <dt >
#### <code class="Cm">vhost</code> {#vhost}
            </dt>
            <dd>Virtual host name with non-ASCII characters escaped as in C.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">connectioninfoitem</var> are specified then only conn_name is displayed.</p>
          <p class="Pp">For example, this command displays the connection name and user for each connection:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-streams list_stream_connections conn_name user</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">list_stream_consumers</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<var class="Ar">consumerinfoitem ...</var>] {#list_stream_consumers}
        </dt>
        <dd>
          <p class="Pp">Returns consumers attached to a stream.</p>
          <p class="Pp">The <var class="Ar">consumerinfoitem</var> parameter is used to indicate which consumer information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">consumerinfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">active</var></dt>
            <dd>Boolean indicating whether the consumer is active or not.</dd>
            <dt><var class="Ar">activity_status</var></dt>
            <dd>
              Consumer activity status; one of:
              <ul class="Bl-bullet Bl-compact">
                <li>
up
</li>
                <li>
single_active
</li>
                <li>
waiting
</li>
              </ul>

            </dd>
            <dt><var class="Ar">connection_pid</var></dt>
            <dd>Id of the Erlang process associated with the consumer connection.</dd>
            <dt><var class="Ar">credits</var></dt>
            <dd>Available credits for the consumer.</dd>
            <dt><var class="Ar">messages_consumed</var></dt>
            <dd>Number of messages the consumer consumed.</dd>
            <dt><var class="Ar">offset</var></dt>
            <dd>The offset (location in the stream) the consumer is at.</dd>
            <dt><var class="Ar">offset_lag</var></dt>
            <dd>The difference between the last stored offset and the last dispatched offset for the consumer.</dd>
            <dt><var class="Ar">properties</var></dt>
            <dd>The properties of the consumer subscription.</dd>
            <dt><var class="Ar">stream</var></dt>
            <dd>The stream the consumer is attached to.</dd>
            <dt><var class="Ar">subscription_id</var></dt>
            <dd>The connection-scoped ID of the consumer.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">consumerinfoitem</var> are specified then connection_pid, subscription_id, stream, messages_consumed, offset, offset_lag, credits, active, activity_status, and properties are displayed.</p>
          <p class="Pp">For example, this command displays the connection PID, subscription ID and stream for each consumer:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-streams list_stream_consumers connection_pid subscription_id stream</code>
          </div>
          <p class="Pp"></p>
        </dd>
        <dt >
#### <code class="Cm">list_stream_publishers</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<var class="Ar">publisherinfoitem ...</var>] {#list_stream_publishers}
        </dt>
        <dd>
          <p class="Pp">Returns registered publishers.</p>
          <p class="Pp">The <var class="Ar">publisherinfoitem</var> parameter is used to indicate which publisher information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">publisherinfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">connection_pid</var></dt>
            <dd>Id of the Erlang process associated with the consumer connection.</dd>
            <dt><var class="Ar">messages_confirmed</var></dt>
            <dd>The number of confirmed messages for the publisher.</dd>
            <dt><var class="Ar">messages_errored</var></dt>
            <dd>The number of errored messages for the publisher.</dd>
            <dt><var class="Ar">messages_published</var></dt>
            <dd>The overall number of messages the publisher published.</dd>
            <dt><var class="Ar">publisher_id</var></dt>
            <dd>The connection-scoped ID of the publisher.</dd>
            <dt><var class="Ar">reference</var></dt>
            <dd>The deduplication reference of the publisher.</dd>
            <dt><var class="Ar">stream</var></dt>
            <dd>The stream the publisher publishes to.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">publisherinfoitem</var> are specified then connection_pid, publisher_id, stream, reference, messages_published, messages_confirmed, and messages_errored are displayed.</p>
          <p class="Pp">For example, this command displays the connection PID, publisher ID and stream for each producer:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-streams list_stream_publishers connection_pid publisher_id stream</code>
          </div>
        </dd>
        <dt >
#### <code class="Cm">add_super_stream</code> <var class="Ar">super-stream</var> [<code class="Fl">--vhost</code> <var class="Ar">vhost</var>] [<code class="Fl">--partitions</code> <var class="Ar">partitions</var>] [<code class="Fl">--binding-keys</code> <var class="Ar">binding-keys</var>] [<code class="Fl">--max-length-bytes</code> <var class="Ar">max-length-bytes</var>] [<code class="Fl">--max-age</code> <var class="Ar">max-age</var>] [<code class="Fl">--stream-max-segment-size-bytes</code> <var class="Ar">stream-max-segment-size-bytes</var>] [<code class="Fl">--leader-locator</code> <var class="Ar">leader-locator</var>] [<code class="Fl">--initial-cluster-size</code> <var class="Ar">initial-cluster-size</var>] {#add_super_stream}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">super-stream</var></dt>
            <dd>The name of the super stream to create.</dd>
            <dt><var class="Ar">vhost</var></dt>
            <dd>The name of the virtual host to create the super stream into.</dd>
            <dt><var class="Ar">partitions</var></dt>
            <dd>The number of partitions the super stream will have.</dd>
            <dt><var class="Ar">binding-keys</var></dt>
            <dd>Comma-separated list of binding keys.</dd>
            <dt><var class="Ar">max-length-bytes</var></dt>
            <dd>The maximum size of partition streams, example values: 20gb, 500mb.</dd>
            <dt><var class="Ar">max-age</var></dt>
            <dd>The maximum age of partition stream segments, using the ISO 8601 duration format, e.g. PT10M30S for 10 minutes 30 seconds, P5DT8H for 5 days 8 hours.</dd>
            <dt><var class="Ar">stream-max-segment-size-bytes</var></dt>
            <dd>The maximum size of partition stream segments, example values: 500mb, 1gb.</dd>
            <dt><var class="Ar">leader-locator</var></dt>
            <dd>
              Leader locator strategy for partition streams. Possible values are:
              <ul class="Bl-bullet Bl-compact">
                <li>
client-local
</li>
                <li>
balanced
</li>
              </ul>
The default is <code class="Cm">balanced</code>
            </dd>
            <dt><var class="Ar">initial-cluster-size</var></dt>
            <dd>The initial cluster size of partition streams.</dd>
          </dl>
          <p class="Pp">Create a super stream.</p>
        </dd>
        <dt >
#### <code class="Cm">delete_super_stream</code> <var class="Ar">super-stream</var> [<code class="Fl">--vhost</code> <var class="Ar">vhost</var>] {#delete_super_stream}
        </dt>
        <dd>
          <dl class="Bl-tag">
            <dt><var class="Ar">super-stream</var></dt>
            <dd>The name of the super stream to delete.</dd>
            <dt><var class="Ar">vhost</var></dt>
            <dd>
              The virtual host of the super stream.
              <p class="Pp">Delete a super stream.</p>
            </dd>
          </dl>
          <p class="Pp"></p>
        </dd>
        <dt >
#### <code class="Cm">list_stream_consumer_groups</code> [<code class="Fl">-p</code> <var class="Ar">vhost</var>] [<var class="Ar">groupinfoitem ...</var>] {#list_stream_consumer_groups}
        </dt>
        <dd>
          <p class="Pp">Lists groups of stream single active consumers for a vhost.</p>
          <p class="Pp">The <var class="Ar">groupinfoitem</var> parameter is used to indicate which group information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">groupinfoitem</var> can take any value from the list that follows:</p>
          <dl class="Bl-tag">
            <dt><var class="Ar">consumers</var></dt>
            <dd>Number of consumers in the group.</dd>
            <dt><var class="Ar">partition_index</var></dt>
            <dd>The stream partition index if the stream is part of a super stream, -1 if it is not.</dd>
            <dt><var class="Ar">reference</var></dt>
            <dd>The group reference (name).</dd>
            <dt><var class="Ar">stream</var></dt>
            <dd>The stream the consumers are attached to.</dd>
          </dl>
          <p class="Pp">If no <var class="Ar">groupinfoitem</var> are specified then stream, reference, partition_index, and consumers are displayed.</p>
          <p class="Pp">For example, this command displays the stream, reference, and number of consumers for each group:</p>
          <p class="Pp"></p>
          <div class="Bd Bd-indent lang-bash">
            <code class="Li">rabbitmq-streams list_stream_consumer_groups stream reference consumers</code>
          </div>
          <p class="Pp"></p>
        </dd>
        <dt >
#### <code class="Cm">list_stream_group_consumers</code> <code class="Fl">--stream</code> <var class="Ar">stream</var> <code class="Fl">--reference</code> <var class="Ar">reference</var> [<code class="Fl">--vhost</code> <var class="Ar">vhost</var>] [<var class="Ar">consumerinfoitem ...</var>] {#list_stream_group_consumers}
        </dt>
        <dd>
          <p class="Pp">Lists consumers of a stream consumer group in a vhost.</p>
        </dd>
        <dt><var class="Ar">stream</var></dt>
        <dd>The stream the consumers are attached to.</dd>
        <dt><var class="Ar">reference</var></dt>
        <dd>The group reference (name).</dd>
        <dt><var class="Ar">vhost</var></dt>
        <dd>The virtual host of the stream.</dd>
      </dl>
      <p class="Pp">The <var class="Ar">consumerinfoitem</var> parameter is used to indicate which consumer information items to include in the results. The column order in the results will match the order of the parameters. <var class="Ar">consumerinfoitem</var> can take any value from the list that follows:</p>
      <dl class="Bl-tag">
        <dt><var class="Ar">connection_name</var></dt>
        <dd>Readable name of the consumer connection.</dd>
        <dt><var class="Ar">state</var></dt>
        <dd>
          Consumer state; one of:
          <ul class="Bl-bullet Bl-compact">
            <li>
active
</li>
            <li>
inactive
</li>
          </ul>

        </dd>
        <dt><var class="Ar">subscription_id</var></dt>
        <dd>The connection-scoped ID of the consumer.</dd>
      </dl>
      <p class="Pp">If no <var class="Ar">consumerinfoitem</var> are specified then subscription_id, connection_name, and state are displayed.</p>
      <p class="Pp">For example, this command displays the connection name and state for each consumer attached to the stream-1 stream and belonging to the stream-1 group:</p>
      <p class="Pp"></p>
      <div class="Bd Bd-indent lang-bash">
        <code class="Li">rabbitmq-streams list_stream_group_consumers --stream stream-1 --reference stream-1 connection_name state</code>
      </div>
    </section>
  </section>
  <section class="Sh">
## SEE ALSO {#SEE_ALSO}
    <p class="Pp"><a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a>, <a class="Xr" href="rabbitmq-diagnostics.8">rabbitmq-diagnostics(8)</a>, <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a>, <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a>, <a class="Xr" href="rabbitmq-upgrade.8">rabbitmq-upgrade(8)</a>, <a class="Xr" href="rabbitmq-service.8">rabbitmq-service(8)</a>, <a class="Xr" href="rabbitmq-env.conf.5">rabbitmq-env.conf(5)</a>, <a class="Xr" href="rabbitmq-echopid.8">rabbitmq-echopid(8)</a></p>
  </section>
  <section class="Sh">
## AUTHOR {#AUTHOR}
    <p class="Pp"><span class="An">The RabbitMQ Team</span> &lt;<a class="Mt" href="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</a>&gt;</p>
  </section>
</div>
