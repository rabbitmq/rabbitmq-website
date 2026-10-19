<div class="manual-text">
  <section class="Sh">
## NAME {#NAME}
    <p class="Pp"><code class="Nm">rabbitmq-echopid.bat</code> — <span class="Nd">returns the Windows process id of the Erlang runtime running RabbitMQ</span></p>
  </section>
  <section class="Sh">
## SYNOPSIS {#SYNOPSIS}
    <table class="Nm">
      <tr>
        <td><code class="Nm">rabbitmq-echopid.bat</code></td>
        <td><var class="Ar">sname</var></td>
      </tr>
    </table>
  </section>
  <section class="Sh">
## DESCRIPTION {#DESCRIPTION}
    <p class="Pp">RabbitMQ is an open source multi-protocol messaging broker.</p>
    <p class="Pp">Running <code class="Nm">rabbitmq-echopid.bat</code> will attempt to discover and echo the process id (PID) of the Erlang runtime process (<span class="Pa">erl.exe</span>) that is hosting RabbitMQ. To allow <span class="Pa">erl.exe</span> time to start up and load RabbitMQ, the script will wait for ten seconds before timing out if a suitable PID cannot be found.</p>
    <p class="Pp">If a PID is discovered, the script will echo it to stdout before exiting with a <code class="Ev">ERRORLEVEL</code> of 0. If no PID is discovered before the timeout, nothing is written to stdout and the script exits setting <code class="Ev">ERRORLEVEL</code> to 1.</p>
    <p class="Pp">Note that this script only exists on Windows due to the need to wait for <span class="Pa">erl.exe</span> and possibly time-out. To obtain the PID on Unix set <code class="Ev">RABBITMQ_PID_FILE</code> before starting <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a> and do not use <code class="Fl">-detached</code>.</p>
  </section>
  <section class="Sh">
## OPTIONS {#OPTIONS}
    <dl class="Bl-tag">
      <dt><var class="Ar">sname</var></dt>
      <dd>The short-name form of the RabbitMQ node name.</dd>
    </dl>
  </section>
  <section class="Sh">
## SEE ALSO {#SEE_ALSO}
    <p class="Pp"><a class="Xr" href="rabbitmq-plugins.8">rabbitmq-plugins(8)</a>, <a class="Xr" href="rabbitmq-server.8">rabbitmq-server(8)</a>, <a class="Xr" href="rabbitmq-service.8">rabbitmq-service(8)</a>, <a class="Xr" href="rabbitmqctl.8">rabbitmqctl(8)</a></p>
  </section>
  <section class="Sh">
## AUTHOR {#AUTHOR}
    <p class="Pp"><span class="An">The RabbitMQ Team</span> &lt;<a class="Mt" href="mailto:contact-tanzu-data.pdl@broadcom.com">contact-tanzu-data.pdl@broadcom.com</a>&gt;</p>
  </section>
</div>
