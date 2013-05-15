<?xml version="1.0"?>
<!DOCTYPE doc:subsection [
<!ENTITY % entities SYSTEM "rabbit.ent" >
%entities;
]>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="running-generic-unix">
  <doc:heading>Run RabbitMQ Server</doc:heading>
  <dl class="instructions">
    <dt>Start the Server</dt>
    <dd>
      <p>
        Invoke the <code>sbin/rabbitmq-server</code> shell script. This
        displays a short banner message, concluding with the message
        "completed with <i>[n]</i> plugins.", indicating that the
        RabbitMQ broker has been started successfully.
      </p>
      <p>
        You can also start the server in "detached" mode with
        <code>rabbitmq-server -detached</code>, in which case the
        server process runs in the background.
      </p>
    </dd>
    <dt>Configure the Server</dt>
    <dd>
      You can <a
      href="configure.html#customise-general-unix-environment">customise
      the RabbitMQ environment</a> by setting environment
      variables in <code><span
      class="envvar">$RABBITMQ_HOME</span>/etc/rabbitmq/rabbitmq-env.conf</code>. Server
      components may be configured, too, in the <a
      href="configure.html#configuration-file">RabbitMQ configuration
      file</a> located at <code><span
      class="envvar">$RABBITMQ_HOME</span>/etc/rabbitmq/rabbitmq.config</code>.
      Neither of these files exist after installation.
    </dd>
  </dl>
</doc:subsection>