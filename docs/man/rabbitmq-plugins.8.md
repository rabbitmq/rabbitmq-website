<div class="manual-text">
  <section class="Sh">
## NAME {#NAME}
    <p class="Pp"><code class="Nm">rabbitmq-plugins</code> — <span class="Nd">command line tool for managing RabbitMQ plugins</span></p>
  </section>
  <section class="Sh">
## SYNOPSIS {#SYNOPSIS}
    <table class="Nm">
      <tr>
        <td><code class="Nm">rabbitmq-plugins</code></td>
        <td>[<code class="Fl">-q</code>] [<code class="Fl">-s</code>] [<code class="Fl">-l</code>] [<code class="Fl">-n</code> <var class="Ar">node</var>] [<code class="Fl">-t</code> <var class="Ar">timeout</var>] <var class="Ar">command</var> [<var class="Ar">command_options</var>]</td>
      </tr>
    </table>
  </section>
  <section class="Sh">
## DESCRIPTION {#DESCRIPTION}
    <p class="Pp"><code class="Nm">rabbitmq-plugins</code> is a command line tool for managing RabbitMQ plugins. See the <a class="Lk" href="https://www.rabbitmq.com/docs/plugins">RabbitMQ Plugins guide</a> for an overview of RabbitMQ plugins and how they are used.</p>
    <p class="Pp"><code class="Nm">rabbitmq-plugins</code> allows the operator to enable, disable and inspect plugins. It must be run by a user with write permissions to the RabbitMQ configuration directory.</p>
    <p class="Pp">Plugins can depend on other plugins. <code class="Nm">rabbitmq-plugins</code> resolves the dependencies and enables or disables all dependencies so that the user doesn't have to manage them explicitly. Plugins listed on the <code class="Nm">rabbitmq-plugins</code> command line are marked as explicitly enabled; dependent plugins are marked as implicitly enabled. Implicitly enabled plugins are automatically disabled again when they are no longer required.</p>
    <p class="Pp">The <code class="Cm">enable</code>, <code class="Cm">disable</code>, and <code class="Cm">set</code> commands will update the plugins file and then attempt to connect to the broker and ensure it is running all enabled plugins. By default if it is not possible to connect to and authenticate with the target node (for example if it is stopped), the operation will fail. If <code class="Nm">rabbitmq-plugins</code> is used on the same host as the target node, <code class="Fl">--offline</code> can be specified to make <code class="Nm">rabbitmq-plugins</code> resolve and update plugin state directly (without contacting the node). Such changes will only have an effect on next node start. To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/plugins">RabbitMQ Plugins guide</a></p>
  </section>
  <section class="Sh">
## OPTIONS {#OPTIONS}
    <dl class="Bl-tag">
      <dt >
### <code class="Fl">-n</code> <var class="Ar">node</var> {#n}
      </dt>
      <dd>
        Default node is "<var class="Ar">rabbit@target-hostname</var>", where <var class="Ar">target-hostname</var> is the local host. On a host named "myserver.example.com", the node name will usually be "rabbit@myserver" (unless <code class="Ev">RABBITMQ_NODENAME</code> has been overridden). The output of "hostname -s" is usually the correct suffix to use after the "@" sign. See <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a> for details of configuring a RabbitMQ node.
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
### <code class="Cm">list</code> [<code class="Fl">-Eemv</code>] [<var class="Ar">pattern</var>] {#list}
      </dt>
      <dd>
        <dl class="Bl-tag">
          <dt >
### <code class="Fl">-E</code> {#E}
          </dt>
          <dd>Show only explicitly enabled plugins.</dd>
          <dt >
### <code class="Fl">-e</code> {#e}
          </dt>
          <dd>Show only explicitly or implicitly enabled plugins.</dd>
          <dt >
### <code class="Fl">-m</code> {#m}
          </dt>
          <dd>Show only plugin names (minimal).</dd>
          <dt >
### <code class="Fl">-v</code> {#v}
          </dt>
          <dd>Show all plugin details (verbose).</dd>
          <dt><var class="Ar">pattern</var></dt>
          <dd>Pattern to filter the plugin names by.</dd>
        </dl>
        <p class="Pp">Lists all plugins, their versions, dependencies and descriptions. Each plugin is prefixed with two status indicator characters inside [ ]. The first indicator can be:</p>
        <dl class="Bl-tag Bl-compact">
          <dt >
### <b class="Sy">&lt;space&gt;</b> {#_space_}
          </dt>
          <dd>to indicate that the plugin is not enabled</dd>
          <dt >
### <b class="Sy">E</b> {#E~2}
          </dt>
          <dd>to indicate that it is explicitly enabled</dd>
          <dt >
### <b class="Sy">e</b> {#e~2}
          </dt>
          <dd>to indicate that it is implicitly enabled</dd>
          <dd>to indicate that it is enabled but missing and thus not operational</dd>
        </dl>
        <p class="Pp">The second indicator can be:</p>
        <dl class="Bl-tag Bl-compact">
          <dt >
### <b class="Sy">&lt;space&gt;</b> {#_space_~2}
          </dt>
          <dd>to show that the plugin is not running</dd>
          <dt >
### <b class="Sy">&ast;</b> {#*}
          </dt>
          <dd>to show that it is</dd>
        </dl>
        <p class="Pp">If the optional pattern is given, only plugins whose name matches <var class="Ar">pattern</var> are shown.</p>
        <p class="Pp">For example, this command lists all plugins, on one line each</p>
        <p class="Pp"></p>
        <div class="Bd Bd-indent lang-bash">
          <code class="Li">rabbitmq-plugins list</code>
        </div>
        <p class="Pp">This command lists all plugins:</p>
        <p class="Pp"></p>
        <div class="Bd Bd-indent lang-bash">
          <code class="Li">rabbitmq-plugins list -v</code>
        </div>
        <p class="Pp">This command lists all plugins whose name contains "management".</p>
        <p class="Pp"></p>
        <div class="Bd Bd-indent lang-bash">
          <code class="Li">rabbitmq-plugins list -v management</code>
        </div>
        <p class="Pp">This command lists all implicitly or explicitly enabled RabbitMQ plugins.</p>
        <p class="Pp"></p>
        <div class="Bd Bd-indent lang-bash">
          <code class="Li">rabbitmq-plugins list -e rabbit</code>
        </div>
      </dd>
      <dt >
### <code class="Cm">enable</code> [<code class="Fl">--offline</code>] [<code class="Fl">--online</code>] <var class="Ar">plugin ...</var> {#enable}
      </dt>
      <dd>
        <dl class="Bl-tag">
          <dt >
### <code class="Fl">--offline</code> {#offline}
          </dt>
          <dd>Modify node's enabled plugin state directly without contacting the node.</dd>
          <dt >
### <code class="Fl">--online</code> {#online}
          </dt>
          <dd>Treat a failure to connect to the running broker as fatal.</dd>
          <dt><var class="Ar">plugin</var></dt>
          <dd>One or more plugins to enable.</dd>
        </dl>
        <p class="Pp">Enables the specified plugins and all their dependencies.</p>
        <p class="Pp">For example, this command enables the "shovel" and "management" plugins and all their dependencies:</p>
        <p class="Pp"></p>
        <div class="Bd Bd-indent lang-bash">
          <code class="Li">rabbitmq-plugins enable rabbitmq_shovel rabbitmq_management</code>
        </div>
      </dd>
      <dt >
### <code class="Cm">disable</code> [<code class="Fl">--offline</code>] [<code class="Fl">--online</code>] <var class="Ar">plugin ...</var> {#disable}
      </dt>
      <dd>
        <dl class="Bl-tag">
          <dt >
### <code class="Fl">--offline</code> {#offline~2}
          </dt>
          <dd>Modify node's enabled plugin state directly without contacting the node.</dd>
          <dt >
### <code class="Fl">--online</code> {#online~2}
          </dt>
          <dd>Treat a failure to connect to the running broker as fatal.</dd>
          <dt><var class="Ar">plugin</var></dt>
          <dd>One or more plugins to disable.</dd>
        </dl>
        <p class="Pp">Disables the specified plugins and all their dependencies.</p>
        <p class="Pp">For example, this command disables "rabbitmq_management" and all plugins that depend on it:</p>
        <p class="Pp"></p>
        <div class="Bd Bd-indent lang-bash">
          <code class="Li">rabbitmq-plugins disable rabbitmq_management</code>
        </div>
      </dd>
      <dt >
### <code class="Cm">set</code> [<code class="Fl">--offline</code>] [<code class="Fl">--online</code>] [<var class="Ar">plugin ...</var>] {#set}
      </dt>
      <dd>
        <dl class="Bl-tag">
          <dt >
### <code class="Fl">--offline</code> {#offline~3}
          </dt>
          <dd>Modify node's enabled plugin state directly without contacting the node.</dd>
          <dt >
### <code class="Fl">--online</code> {#online~3}
          </dt>
          <dd>Treat a failure to connect to the running broker as fatal.</dd>
          <dt><var class="Ar">plugin</var></dt>
          <dd>Zero or more plugins to disable.</dd>
        </dl>
        <p class="Pp">Enables the specified plugins and all their dependencies. Unlike <code class="Cm">enable</code>, this command ignores and overwrites any existing enabled plugins. <code class="Cm">set</code> with no plugin arguments is a legal command meaning "disable all plugins".</p>
        <p class="Pp">For example, this command enables the "management" plugin and its dependencies and disables everything else:</p>
        <p class="Pp"></p>
        <div class="Bd Bd-indent lang-bash">
          <code class="Li">rabbitmq-plugins set rabbitmq_management</code>
        </div>
      </dd>
    </dl>
  </section>
  <section class="Sh">
## SEE ALSO {#SEE_ALSO}
    <p class="Pp"><a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a>, <a class="Xr" href="rabbitmq-diagnostics.8">rabbitmq-diagnostics(8)</a>, <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a>, <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a>, <a class="Xr" href="rabbitmq-streams.8">rabbitmq-streams(8)</a>, <a class="Xr" href="rabbitmq-upgrade.8">rabbitmq-upgrade(8)</a>, <a class="Xr" href="rabbitmq-service.8">rabbitmq-service(8)</a>, <a class="Xr" href="rabbitmq-env.conf.5">rabbitmq-env.conf(5)</a>, <a class="Xr" href="rabbitmq-echopid.8">rabbitmq-echopid(8)</a></p>
  </section>
  <section class="Sh">
## AUTHOR {#AUTHOR}
    <p class="Pp"><span class="An">The RabbitMQ Team</span> &lt;<a class="Mt" href="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</a>&gt;</p>
  </section>
</div>
