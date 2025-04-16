<div class="manual-text">
  <section class="Sh">
## NAME {#NAME}
    <p class="Pp"><code class="Nm">rabbitmq-env.conf</code> — <span class="Nd">environment variables used by RabbitMQ server</span></p>
  </section>
  <section class="Sh">
## DESCRIPTION {#DESCRIPTION}
    <p class="Pp"><code class="Nm">rabbitmq-env.conf</code> contains environment variables that override the defaults built in to the RabbitMQ scripts and CLI tools.</p>
    <p class="Pp">The file is interpreted by the system shell, and so should consist of a sequence of shell environment variable definitions. Normal shell syntax is permitted (since the file is sourced using the shell "." operator), including line comments starting with "#".</p>
    <p class="Pp">In order of preference, the startup scripts get their values from the environment, from <code class="Nm">rabbitmq-env.conf</code> and finally from the built-in default values. For example, for the <code class="Ev">RABBITMQ_NODENAME</code> setting, <code class="Ev">RABBITMQ_NODENAME</code> from the environment is checked first. If it is absent or equal to the empty string, then <code class="Ev">NODENAME</code> from <code class="Nm">rabbitmq-env.conf</code> is checked. If it is also absent or set equal to the empty string then the default value from the startup script is used.</p>
    <p class="Pp">The variable names in <code class="Nm">rabbitmq-env.conf</code> are always equal to the environment variable names, with the "RABBITMQ_" prefix removed: <code class="Ev">RABBITMQ_NODE_PORT</code> from the environment becomes <code class="Ev">NODE_PORT</code> in <code class="Nm">rabbitmq-env.conf</code>.</p>
  </section>
  <section class="Sh">
## EXAMPLES {#EXAMPLES}
    <p class="Pp">Below is an example of a minimalistic <code class="Nm">rabbitmq-env.conf</code> file that overrides the default node name prefix from "rabbit" to "hare".</p>
    <p class="Pp"></p>
    <div class="Bd Bd-indent lang-bash">
      <code class="Li"># I am a complete rabbitmq-env.conf file.</code>
    </div>
    <div class="Bd Bd-indent lang-bash">
      <code class="Li"># Comment lines start with a hash character.</code>
    </div>
    <div class="Bd Bd-indent lang-bash">
      <code class="Li"># This is a /bin/sh script file - use ordinary envt var syntax</code>
    </div>
    <div class="Bd Bd-indent lang-bash">
      <code class="Li">NODENAME=hare</code>
    </div>
    <p class="Pp">In the below <code class="Nm">rabbitmq-env.conf</code> file RabbitMQ configuration file location is changed to "/data/services/rabbitmq/rabbitmq.conf".</p>
    <p class="Pp"></p>
    <div class="Bd Bd-indent lang-bash">
      <code class="Li"># I am a complete rabbitmq-env.conf file.</code>
    </div>
    <div class="Bd Bd-indent lang-bash">
      <code class="Li"># Comment lines start with a hash character.</code>
    </div>
    <div class="Bd Bd-indent lang-bash">
      <code class="Li"># This is a /bin/sh script file - use ordinary envt var syntax</code>
    </div>
    <div class="Bd Bd-indent">
      <code class="Li">CONFIG_FILE=/data/services/rabbitmq/rabbitmq.conf</code>
    </div>
  </section>
  <section class="Sh">
## SEE ALSO {#SEE_ALSO}
    <p class="Pp"><a class="Xr" href="rabbitmq-echopid.8">rabbitmq-echopid(8)</a>, <a class="Xr" href="rabbitmq-plugins.8">rabbitmq-plugins(8)</a>, <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a>, <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a>, <a class="Xr" href="rabbitmq-streams.8">rabbitmq-streams(8)</a>, <a class="Xr" href="rabbitmq-upgrade.8">rabbitmq-upgrade(8)</a>, <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
  </section>
  <section class="Sh">
## AUTHOR {#AUTHOR}
    <p class="Pp"><span class="An">The RabbitMQ Team</span> &lt;<a class="Mt" href="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</a>&gt;</p>
  </section>
</div>
