<?xml version="1.0"?>
<doc:subsection xmlns:doc="http://www.rabbitmq.com/namespaces/ad-hoc/doc" name="verifying-limits">
  <doc:heading>Verifying the Limit</doc:heading>
  <p>
    <a href="management.html">RabbitMQ management UI</a> displays the number of file descriptors available
    for it to use on the Overview tab.
<pre class="sourcecode">rabbitmqctl status</pre>
    includes the same value.
  </p>
  <p>
    The following command

<pre  class="sourcecode">
cat /proc/$RABBITMQ_BEAM_PROCESS_PID/limits
</pre>

    can be used to display effective limits of a running process. <code>$RABBITMQ_BEAM_PROCESS_PID</code>
    is the OS PID of the Erlang VM running RabbitMQ, as returned by <code>rabbitmqctl status</code>.
  </p>
</doc:subsection>
