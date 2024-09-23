<div class="manual-text">
  <section class="Sh">
## NAME {#NAME}
    <p class="Pp"><code class="Nm">rabbitmq-service.bat</code> — <span class="Nd">tool for managing RabbitMQ Windows service</span></p>
  </section>
  <section class="Sh">
## SYNOPSIS {#SYNOPSIS}
    <table class="Nm">
      <tr>
        <td><code class="Nm">rabbitmq-service.bat</code></td>
        <td>[<var class="Ar">command</var>]</td>
      </tr>
    </table>
  </section>
  <section class="Sh">
## DESCRIPTION {#DESCRIPTION}
    <p class="Pp">RabbitMQ is an open source multi-protocol messaging broker.</p>
    <p class="Pp">Running <code class="Nm">rabbitmq-service.bat</code> allows the RabbitMQ broker to be run as a service in Windows® environments. The RabbitMQ broker service can be started and stopped using the Windows® services panel.</p>
    <p class="Pp">By default the service will run in the authentication context of the local system account. It is therefore necessary to synchronise Erlang cookies between the local system account (typically <span class="Pa">C:\Windows\.erlang.cookie</span> and the account that will be used to run <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a>.</p>
  </section>
  <section class="Sh">
## COMMANDS {#COMMANDS}
    <dl class="Bl-tag">
      <dt >
### <code class="Cm">help</code> {#help}
      </dt>
      <dd>Display usage information.</dd>
      <dt >
### <code class="Cm">install</code> {#install}
      </dt>
      <dd>Install the service. The service will not be started. Subsequent invocations will update the service parameters if relevant environment variables were modified.</dd>
      <dt >
### <code class="Cm">remove</code> {#remove}
      </dt>
      <dd>
        Remove the service. If the service is running then it will automatically be stopped before being removed. No files will be deleted as a consequence and <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a> will remain operable.
      </dd>
      <dt >
### <code class="Cm">start</code> {#start}
      </dt>
      <dd>Start the service. The service must have been correctly installed beforehand.</dd>
      <dt >
### <code class="Cm">stop</code> {#stop}
      </dt>
      <dd>Stop the service. The service must be running for this command to have any effect.</dd>
      <dt >
### <code class="Cm">disable</code> {#disable}
      </dt>
      <dd>
###         Disable the service. This is the equivalent of setting the startup type to<b class="Sy" id="Disabled">Disabled</b> using the service control panel. {#disable}
      </dd>
      <dt >
### <code class="Cm">enable</code> {#enable}
      </dt>
      <dd>
###         Enable the service. This is the equivalent of setting the startup type to<b class="Sy" id="Automatic">Automatic</b> using the service control panel. {#enable}
      </dd>
    </dl>
  </section>
  <section class="Sh">
## ENVIRONMENT {#ENVIRONMENT}
    <dl class="Bl-tag">
      <dt >
### <code class="Ev">RABBITMQ_SERVICENAME</code> {#RABBITMQ_SERVICENAME}
      </dt>
      <dd>Defaults to RabbitMQ.</dd>
      <dt >
### <code class="Ev">RABBITMQ_BASE</code> {#RABBITMQ_BASE}
      </dt>
      <dd>Note: Windows only. Defaults to the application data directory of the current user. This is the location of log and database directories.</dd>
      <dt >
### <code class="Ev">RABBITMQ_NODENAME</code> {#RABBITMQ_NODENAME}
      </dt>
      <dd>
        Defaults to "rabbit@". followed by the computed hostname. Can be used to run multiple nodes on the same host. Every node in a cluster must have a unique <code class="Ev">RABBITMQ_NODENAME</code> To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/clustering">RabbitMQ Clustering guide</a>
      </dd>
      <dt >
### <code class="Ev">RABBITMQ_NODE_IP_ADDRESS</code> {#RABBITMQ_NODE_IP_ADDRESS}
      </dt>
      <dd>
        By default RabbitMQ will bind to all IPv6 and IPv4 interfaces available. This variable limits the node to one network interface or address family. To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/networking">RabbitMQ Networking guide</a>
      </dd>
      <dt >
### <code class="Ev">RABBITMQ_NODE_PORT</code> {#RABBITMQ_NODE_PORT}
      </dt>
      <dd>
        AMQP 0-9-1 and AMQP 1.0 port. Defaults to 5672. To learn more, see the <a class="Lk" href="https://www.rabbitmq.com/docs/networking">RabbitMQ Networking guide</a>
      </dd>
      <dt >
### <code class="Ev">ERLANG_SERVICE_MANAGER_PATH</code> {#ERLANG_SERVICE_MANAGER_PATH}
      </dt>
      <dd>Defaults to <span class="Pa">C:\Program&nbsp;Files\erl&lcub;version}\erts-&lcub;version}\bin</span> (or <span class="Pa">C:\Program&nbsp;Files&nbsp;(x86)\erl&lcub;version}\erts-&lcub;version}\bin</span> for 64-bit environments). This is the installation location of the Erlang service manager.</dd>
      <dt >
### <code class="Ev">RABBITMQ_CONSOLE_LOG</code> {#RABBITMQ_CONSOLE_LOG}
      </dt>
      <dd>Set this variable to <b class="Sy">new or</b> <b class="Sy">reuse</b> to have the console output from the server redirected to a file named <span class="Pa">SERVICENAME.debug</span> in the application data directory of the user that installed the service. Under Vista this will be <span class="Pa">C:\Users\AppData\username\SERVICENAME</span>. Under previous versions of Windows this will be <span class="Pa">C:\Documents and Settings\username\Application Data\SERVICENAME</span>. If <code class="Ev">RABBITMQ_CONSOLE_LOG</code> is set to <b class="Sy">new</b> then a new file will be created each time the service starts. If <code class="Ev">RABBITMQ_CONSOLE_LOG</code> is set to <b class="Sy">reuse</b> then the file will be overwritten each time the service starts. The default behaviour when <code class="Ev">RABBITMQ_CONSOLE_LOG</code> is not set or set to a value other than <b class="Sy">new</b> or <b class="Sy">reuse</b> is to discard the server output.</dd>
    </dl>
  </section>
  <section class="Sh">
## SEE ALSO {#SEE_ALSO}
    <p class="Pp"><a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a>, <a class="Xr" href="rabbitmq-diagnostics.8">rabbitmq-diagnostics(8)</a>, <a class="Xr" href="rabbitmq-plugins.8">rabbitmq-plugins(8)</a>, <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a>, <a class="Xr" href="rabbitmq-queues.8">rabbitmq-queues(8)</a>, <a class="Xr" href="rabbitmq-streams.8">rabbitmq-streams(8)</a>, <a class="Xr" href="rabbitmq-upgrade.8">rabbitmq-upgrade(8)</a>, <a class="Xr" href="rabbitmq-env.conf.5">rabbitmq-env.conf(5)</a>, <a class="Xr" href="rabbitmq-echopid.8">rabbitmq-echopid(8)</a></p>
  </section>
  <section class="Sh">
## AUTHOR {#AUTHOR}
    <p class="Pp"><span class="An">The RabbitMQ Team</span> &lt;<a class="Mt" href="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</a>&gt;</p>
  </section>
</div>
