<?xml version="1.0"?>
      <doc:subsection name="running-rabbitmq">
        <doc:heading>Run RabbitMQ Server</doc:heading>
        <dl class="instructions">
          <dt>Start the Server</dt>
          <dd>
            <p>
              Invoke the <code>sbin/rabbitmq-server</code> shell script.
              This displays a banner message, and reports on progress in
              the startup sequence, concluding with the message "broker
              running", indicating that the RabbitMQ broker has been
              started successfully.
            </p>
            <p>
              You can also start the server in "detached" mode with
              <code>rabbitmq-server -detached</code>, in which case the
              server process runs in the background.
            </p>
          </dd>
          <dt>Configure the Server</dt>
          <dd>
            The configuration file <code><span
            class="envvar">$RABBITMQ_HOME</span>/etc/rabbitmq/rabbitmq-env.conf</code>
            is used to override environment variables. You can <a
            href="configure.html#customise-general-unix-environment">customise
            the RabbitMQ environment</a> by altering this file. Components may
            be <a href="configure.html#configuration-file">configured</a>, too,
            in the <code>rabbitmq.config</code> file.
          </dd>
        </dl>
      </doc:subsection>

      <doc:subsection name="">
        <doc:heading>File Locations</doc:heading>
        <p>
          The standalone tarball is designed as far as possible to
          run without requiring configuration changes or special
          permissions. The directories and files used by default are
          all held under the installation
          directory <code>rabbitmq_server-&version-server;</code>
          which is in the <span class="envvar">$RABBITMQ_HOME</span>
          variable in the scripts.
        </p>

        <p>
          Should you wish to install RabbitMQ Server such that it uses
          the conventional system directories for configuration,
          database, log files, plugins etc, it is possible to do this.
        </p>
          <p>
            Find the line:
<pre class="sourcecode">
SYS_PREFIX=${RABBITMQ_HOME}
</pre>
            in the <code>sbin/rabbitmq-defaults</code> script and
            change this change this line to:
<pre class="sourcecode">
SYS_PREFIX=
</pre>
            but do not modify any other line in this script.
          </p>
          <p>
            <em>Note: </em>After this modification the default directory
            locations may require different permissions. In particular
            <strong>RABBITMQ_MNESIA_BASE</strong> and
            <strong>RABBITMQ_LOG_BASE</strong> may need to be created (the
            server will attempt to create them at startup), and the
            <strong>RABBITMQ_ENABLED_PLUGINS_FILE</strong> will need
            to be writable (for <code>rabbitmq-plugins</code>).  The
            configuration files will be looked for
            in <code>/etc/rabbitmq/</code>.
          </p>
      </doc:subsection>
    </doc:section>

    <doc:section>
      <doc:heading>Managing the Broker</doc:heading>
      <p>
        To stop the server or check its status, etc., you can use
        <code>rabbitmqctl</code> (as the user running
        <code>rabbitmq-server</code>). All <code>rabbitmqctl</code>
        commands will report the node absence if no broker is running.
      </p>
      <ul>
        <li>Use <code>rabbitmqctl stop</code> to stop the server.</li>
        <li>Use <code>rabbitmqctl status</code> to check whether it is
          running.</li>
      </ul>
      <p>
        More <a href="man/rabbitmqctl.1.man.html">info on rabbitmqctl</a>.
      </p>
    </doc:section>