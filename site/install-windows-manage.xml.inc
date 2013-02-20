<?xml version="1.0"?>
<doc:section xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc"
             name="managing-windows">
  <doc:heading>Managing the Broker</doc:heading>
  <p>
    To stop the broker or check its status, use
    <code>rabbitmqctl.bat</code> in
    <code>sbin</code> (as an administrator).
  </p>

  <dl class="instructions">
    <dt>Stopping the Broker</dt>
    <dd>
      <p>
        Use <code>rabbitmqctl stop</code>.
      </p>
    </dd>

    <dt>Checking the Broker Status</dt>
    <dd>
      <p>
        Use <code>rabbitmqctl status</code>.
        All rabbitmqctl commands will report the node absence
        if no broker is running (i.e. nodedown).
      </p>
    </dd>
  </dl>
  <p>
    More  <a href="man/rabbitmqctl.1.man.html">info on rabbitmqctl</a>
  </p>

  <h3>Logging</h3>
  <p>
    Output from the server is sent to a
    <b>RABBITMQ_NODENAME</b>.log file in the
    <b>RABBITMQ_LOG_BASE</b> directory. Additional log data is
    written to <b>RABBITMQ_NODENAME</b>-sasl.log.
  </p>
  <p>
    The broker always appends to the log files, so a complete
    log history is retained.
  </p>
  <p>
    You can rotate logs using <code>rabbitmqctl rotate_logs</code>.
  </p>

  <h3>Troubleshooting When Running as a Service</h3>

  <p>
    In the event that the erlang VM crashes whilst RabbitMQ is running
    as a service, rather than writing the crash dump to the current
    directory (which doesn't make sense for a service) it is written
    to an <code>erl_crash.dump</code> file in the base directory of
    the RabbitMQ server (set by the <b>RABBITMQ_BASE</b> environment
    variable, defaulting
    to <code>%APPDATA%\%RABBITMQ_SERVICENAME%</code> -
    typically <code>%APPDATA%\RabbitMQ</code> otherwise).
  </p>

</doc:section>
